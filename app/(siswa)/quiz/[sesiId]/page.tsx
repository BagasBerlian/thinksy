import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import QuizAssessmentClient, { CleanQuizQuestion } from "@/components/sesi/QuizAssessmentClient";
import { generateChapterQuestions } from "@/lib/curriculum-quiz-engine";

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ sesiId: string }>;
  searchParams: Promise<{ mode?: "latihan" | "inclass"; babId?: string }>;
}) {
  const { sesiId } = await params;
  const { mode, babId } = await searchParams;
  const supabase = await createClient();
  const adminDb = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profil } = user
    ? await supabase
        .from("profil")
        .select("nama_lengkap")
        .eq("id", user.id)
        .single()
    : { data: null };

  const isValidUUID = (str?: string) =>
    Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

  // 1. Fetch Sesi record & Check if already finished
  let sesiRow: any = null;
  if (isValidUUID(sesiId)) {
    const { data: sRow } = await adminDb
      .from("sesi")
      .select("id, bab_id, status_sesi, batas_menit, mulai_pada")
      .eq("id", sesiId)
      .maybeSingle();
    sesiRow = sRow;

    if (sesiRow?.status_sesi === "selesai") {
      redirect(`/hasil/${sesiId}`);
    }
  }

  // 2. Resolve effective babId
  let effectiveBabId = babId || sesiRow?.bab_id;

  if (!effectiveBabId) {
    const { data: firstBab } = await adminDb
      .from("bab")
      .select("id")
      .order("urutan", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (firstBab?.id) {
      effectiveBabId = firstBab.id;
    }
  }

  // 3. Fetch Bab Info
  let babData: { judul: string; mapel?: string; kelas?: number } | null = null;
  if (effectiveBabId) {
    const { data: bData } = await adminDb
      .from("bab")
      .select("id, judul, mapel, kelas")
      .eq("id", effectiveBabId)
      .maybeSingle();
    babData = bData;
  }

  // 4. Query Real Questions with DEVTOOLS PROTECTION (Strictly no keys/answers leaked)
  let query = adminDb
    .from("soal")
    .select(`
      id,
      pertanyaan,
      tipe_soal,
      opsi_soal (
        id,
        teks_opsi,
        urutan
      )
    `);

  if (effectiveBabId) {
    query = query.eq("bab_id", effectiveBabId);
  }

  const { data: dbSoalList } = await query
    .order("dibuat_pada", { ascending: true })
    .limit(10);

  // Fallback questions if chapter has no questions in database yet
  const defaultSoalList: CleanQuizQuestion[] = generateChapterQuestions(
    babData?.judul || "Bab Pembelajaran",
    babData?.mapel || "Matematika",
    babData?.kelas || 8
  ).map((q, idx) => ({
    id: q.id || `demo-q-${idx + 1}`,
    pertanyaan: q.pertanyaan,
    tipeSoal: q.tipeSoal,
    opsiSoal: q.opsiSoal?.map((o, optIdx) => ({
      id: o.id || `opt-${idx + 1}-${optIdx + 1}`,
      teksOpsi: o.teksOpsi,
    })),
  }));

  const formattedSoalList: CleanQuizQuestion[] =
    dbSoalList && dbSoalList.length > 0
      ? dbSoalList.map((item: any) => ({
          id: item.id,
          pertanyaan: item.pertanyaan,
          tipeSoal: item.tipe_soal as "pilihan_ganda" | "esai",
          opsiSoal: Array.isArray(item.opsi_soal)
            ? [...item.opsi_soal]
                .sort((a, b) => (a.urutan || 0) - (b.urutan || 0))
                .map((o: any) => ({
                  id: o.id,
                  teksOpsi: o.teks_opsi,
                }))
            : [],
        }))
      : defaultSoalList;

  // 5. Query Existing Saved Answers for State Persistence across Refresh
  const initialAnswers: Record<string, string> = {};
  if (isValidUUID(sesiId)) {
    const { data: existingJawaban } = await adminDb
      .from("jawaban")
      .select("soal_id, opsi_dipilih_id, jawaban_teks")
      .eq("sesi_id", sesiId);

    if (existingJawaban) {
      existingJawaban.forEach((j: any) => {
        initialAnswers[j.soal_id] = j.opsi_dipilih_id || j.jawaban_teks || "";
      });
    }
  }

  const sessionTitle = babData
    ? `EVALUASI: ${babData.judul}`
    : mode === "inclass"
    ? "EVALUASI BAB - ASESMEN TOPIK IN-CLASS"
    : "UJIAN FORMATIF TOPIK PEMBELAJARAN";

  return (
    <QuizAssessmentClient
      sesiId={sesiId}
      babId={effectiveBabId}
      judulSesi={sessionTitle}
      mapel={babData?.mapel || "Matematika"}
      batasMenit={Number(sesiRow?.batas_menit) || 30}
      mulaiPada={sesiRow?.mulai_pada || undefined}
      soalList={formattedSoalList}
      namaSiswa={profil?.nama_lengkap ?? undefined}
      initialAnswers={initialAnswers}
    />
  );
}

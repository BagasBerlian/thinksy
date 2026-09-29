import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ExamPracticeClient from "@/components/sesi/ExamPracticeClient";
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

  // 1. Resolve effective babId from params, existing sesi, or default first bab
  let effectiveBabId = babId;

  const isValidUUID = (str?: string) =>
    Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

  if (!effectiveBabId && isValidUUID(sesiId)) {
    const { data: sesiRow } = await adminDb
      .from("sesi")
      .select("bab_id")
      .eq("id", sesiId)
      .maybeSingle();
    if (sesiRow?.bab_id) {
      effectiveBabId = sesiRow.bab_id;
    }
  }

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

  // 2. Fetch Bab Info
  let babData: { judul: string; mapel?: string; kelas?: number } | null = null;
  if (effectiveBabId) {
    const { data: bData } = await adminDb
      .from("bab")
      .select("id, judul, mapel, kelas")
      .eq("id", effectiveBabId)
      .maybeSingle();
    babData = bData;
  }

  // 3. Query Real Questions from Database (without leaking answer keys/pembahasan to student)
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

  // Fallback questions if chapter has no questions yet in database
  const defaultSoalList = generateChapterQuestions(
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

  const formattedSoalList =
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

  const sessionTitle = babData
    ? `EVALUASI: ${babData.judul}`
    : mode === "inclass"
    ? "EVALUASI BAB - ASESMEN TOPIK IN-CLASS"
    : "UJIAN AKHIR SEMESTER - PRACTICE EXAM";

  return (
    <ExamPracticeClient
      sesiId={sesiId}
      babId={effectiveBabId}
      mode={mode || "inclass"}
      judulSesi={sessionTitle}
      mapel={babData?.mapel || "Matematika"}
      soalList={formattedSoalList}
      namaSiswa={profil?.nama_lengkap ?? undefined}
    />
  );
}

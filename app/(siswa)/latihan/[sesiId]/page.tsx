import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import LatihanSatuSoalClient, { QuestionItem } from "@/components/sesi/LatihanSatuSoalClient";
import { redirect } from "next/navigation";
import { generateChapterQuestions } from "@/lib/curriculum-quiz-engine";

function isValidUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export default async function LatihanPage({
  params,
}: {
  params: Promise<{ sesiId: string }>;
}) {
  const { sesiId: rawId } = await params;
  const supabase = await createClient();
  const adminDb = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();

  let sesiId = rawId;

  // 1. Validasi sesi jika UUID
  let sesiRow: any = null;
  if (isValidUUID(rawId)) {
    const { data: s } = await adminDb
      .from("sesi")
      .select("id, bab_id, tipe_sesi, status_sesi, bab:bab_id (id, judul)")
      .eq("id", rawId)
      .maybeSingle();
    sesiRow = s;
  }

  // 2. Buat sesi jika belum ada UUID valid
  if (!sesiRow && user) {
    const { data: firstBab } = await adminDb
      .from("bab")
      .select("id, judul")
      .order("urutan", { ascending: true })
      .limit(1)
      .single();

    const { data: newSesi } = await adminDb
      .from("sesi")
      .insert({
        siswa_id: user.id,
        bab_id: firstBab?.id ?? null,
        tipe_sesi: "latihan",
        status_sesi: "aktif",
      })
      .select("id, bab_id, tipe_sesi, status_sesi")
      .single();

    if (newSesi?.id) {
      redirect(`/latihan/${newSesi.id}`);
    }
  }

  const effectiveBabId = sesiRow?.bab_id;
  const judulBab =
    (sesiRow?.bab as any)?.judul || "Bab 1: Pola Bilangan & Barisan";

  // 3. Query Soal Publik terbit untuk bab ini (Termasuk PG, Isian Singkat, dan Esai)
  let soalQuery = adminDb
    .from("soal")
    .select(`
      id,
      pertanyaan,
      tipe_soal,
      poin,
      opsi_soal (
        id,
        label,
        teks_opsi,
        urutan
      )
    `)
    .in("status_soal", ["dipublikasi", "terbit"]);

  if (effectiveBabId) {
    soalQuery = soalQuery.eq("bab_id", effectiveBabId);
  }

  const { data: dbSoalList } = await soalQuery.order("dibuat_pada", { ascending: true }).limit(10);

  const effectiveMapel = (sesiRow?.bab as any)?.mapel || "Matematika";

  // Ambil soal kurikulum engine sebagai acuan lengkap (10 butir soal beserta petunjuk dan pembahasan)
  const curriculumQuestions = generateChapterQuestions(judulBab, effectiveMapel, 8);

  const formattedSoalList: QuestionItem[] =
    dbSoalList && dbSoalList.length > 0
      ? dbSoalList.map((item: any, idx: number) => {
          const matchingCurriculum = curriculumQuestions[idx];
          return {
            id: item.id,
            pertanyaan: item.pertanyaan,
            tipeSoal: item.tipe_soal as "pilihan_ganda" | "isian_singkat" | "esai",
            poin: item.poin || 10,
            petunjuk: matchingCurriculum?.hintSokratik || "Perhatikan kata kunci, variabel, dan rumus pokok yang digunakan pada soal ini.",
            opsiSoal: Array.isArray(item.opsi_soal)
              ? [...item.opsi_soal]
                  .sort((a, b) => (a.urutan || 0) - (b.urutan || 0))
                  .map((o: any, oIdx: number) => ({
                    id: o.id,
                    label: o.label || String.fromCharCode(65 + oIdx),
                    teksOpsi: o.teks_opsi,
                  }))
              : undefined,
          };
        })
      : curriculumQuestions.map((cq, idx) => ({
          id: cq.id,
          pertanyaan: cq.pertanyaan,
          tipeSoal: cq.tipeSoal as "pilihan_ganda" | "esai",
          poin: 10,
          petunjuk: cq.hintSokratik || "Gunakan konsep dasar matematika pada bab ini untuk meneliti langkah perhitungan.",
          opsiSoal: cq.opsiSoal?.map((o, oIdx) => ({
            id: o.id,
            label: String.fromCharCode(65 + oIdx),
            teksOpsi: o.teksOpsi,
          })),
        }));

  return (
    <LatihanSatuSoalClient
      sesiId={sesiId}
      judulBab={judulBab}
      soalList={formattedSoalList}
    />
  );
}

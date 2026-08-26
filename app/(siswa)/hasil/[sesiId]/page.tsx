import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ExamResultClient, { QuestionReview } from "@/components/sesi/ExamResultClient";

export default async function HasilPage({
  params,
}: {
  params: Promise<{ sesiId: string }>;
}) {
  const { sesiId } = await params;
  const supabase = await createClient();
  const adminDb = createAdminClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Fetch Sesi Info
  const { data: sesiData } = await supabase
    .from("sesi")
    .select(`
      id,
      tipe_sesi,
      status_sesi,
      dibuat_pada,
      bab (
        id,
        judul,
        deskripsi
      )
    `)
    .eq("id", sesiId)
    .single();

  // 3. Fetch Jawaban Data via adminDb to read full question detail & solutions
  const { data: jawabanRows } = await adminDb
    .from("jawaban")
    .select(`
      id,
      soal_id,
      opsi_dipilih_id,
      jawaban_teks,
      is_benar,
      nilai,
      umpan_balik_ai,
      soal (
        id,
        pertanyaan,
        tipe_soal,
        kunci_jawaban,
        pembahasan,
        opsi_soal (
          id,
          teks_opsi,
          benar
        )
      )
    `)
    .eq("sesi_id", sesiId)
    .order("dijawab_pada", { ascending: true });

  const reviews: QuestionReview[] = [];
  let correctCount = 0;
  let incorrectCount = 0;
  let totalScoreSum = 0;

  if (jawabanRows && jawabanRows.length > 0) {
    jawabanRows.forEach((item: any, idx: number) => {
      const isCorrect = Boolean(item.is_benar);
      if (isCorrect) {
        correctCount += 1;
      } else {
        incorrectCount += 1;
      }

      totalScoreSum += Number(item.nilai || 0);

      const soal = item.soal;
      let studentAns = "-";
      let correctAns = "-";

      if (soal?.tipe_soal === "pilihan_ganda") {
        const selectedOpt = soal.opsi_soal?.find((o: any) => o.id === item.opsi_dipilih_id);
        const correctOpt = soal.opsi_soal?.find((o: any) => o.benar);
        studentAns = selectedOpt ? selectedOpt.teks_opsi : (item.jawaban_teks || "Tidak Dijawab");
        correctAns = correctOpt ? correctOpt.teks_opsi : (soal.kunci_jawaban || "-");
      } else {
        studentAns = item.jawaban_teks || "Tidak Dijawab";
        correctAns = soal?.kunci_jawaban || "Sesuai kriteria penilaian esai";
      }

      const explanation =
        item.umpan_balik_ai ||
        soal?.pembahasan ||
        (isCorrect
          ? "Jawaban Anda sudah tepat dan memenuhi kriteria penilaian."
          : "Tinjau kembali konsep dan langkah penyelesaian pada materi bab ini.");

      reviews.push({
        id: idx + 1,
        soalId: item.soal_id,
        questionText: soal?.pertanyaan || `Soal #${idx + 1}`,
        studentAnswer: studentAns,
        correctAnswer: correctAns,
        isCorrect: isCorrect,
        explanation: explanation,
      });
    });
  }

  const totalQuestions = jawabanRows?.length || 0;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const judulBab = (sesiData as any)?.bab?.judul || "Bab 1: Pola Bilangan & Barisan Bilangan";
  const jenisSesi = (sesiData as any)?.tipe_sesi
    ? String((sesiData as any).tipe_sesi).toUpperCase()
    : "LATIHAN";

  return (
    <ExamResultClient
      sesiId={sesiId}
      judulBab={judulBab}
      jenisSesi={jenisSesi}
      score={score}
      totalQuestions={totalQuestions}
      correctCount={correctCount}
      incorrectCount={incorrectCount}
      reviews={reviews}
    />
  );
}

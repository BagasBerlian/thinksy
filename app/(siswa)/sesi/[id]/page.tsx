import { createClient } from "@/lib/supabase/server";
import SessionQuizClient from "@/components/sesi/SessionQuizClient";

export default async function SesiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Query Soal from Database
  const { data: dbSoalList } = await supabase
    .from("soal")
    .select(`
      id,
      pertanyaan,
      tipe_soal,
      kunci_jawaban,
      pembahasan,
      opsi_soal (
        id,
        teks_opsi
      )
    `)
    .eq("status_soal", "dipublikasi");

  // Fallback sample questions if DB is empty
  const defaultSoalList = [
    {
      id: "d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
      pertanyaan:
        "Diketahui barisan aritmatika $3, 7, 11, 15, \\dots$. Tentukan nilai dari suku ke-10 ($U_{10}$)! ",
      tipeSoal: "pilihan_ganda" as const,
      opsiSoal: [
        { id: "e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a77", teksOpsi: "35" },
        { id: "e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a88", teksOpsi: "39" },
        { id: "e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a99", teksOpsi: "43" },
        { id: "e4eebc99-9c0b-4ef8-bb6d-6bb9bd380aaa", teksOpsi: "47" },
      ],
    },
    {
      id: "d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
      pertanyaan:
        "Jelaskan perbedaan mendasar antara **Barisan Aritmatika** dan **Barisan Geometri**, serta berikan masing-masing 1 contoh barisan bilangan sederhana!",
      tipeSoal: "esai" as const,
    },
  ];

  const formattedQuestions =
    dbSoalList && dbSoalList.length > 0
      ? dbSoalList.map((item: any) => ({
          id: item.id,
          pertanyaan: item.pertanyaan,
          tipeSoal: item.tipe_soal as "pilihan_ganda" | "esai",
          opsiSoal: item.opsi_soal?.map((o: any) => ({
            id: o.id,
            teksOpsi: o.teks_opsi,
          })),
        }))
      : defaultSoalList;

  return (
    <SessionQuizClient
      sesiId={id}
      jenisSesi="Latihan"
      judulBab="Bab 1: Pola Bilangan & Barisan"
      soalList={formattedQuestions}
    />
  );
}

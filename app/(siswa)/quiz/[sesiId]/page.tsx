import { createClient } from "@/lib/supabase/server";
import ExamPracticeClient from "@/components/sesi/ExamPracticeClient";

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

  // Query real questions from secure view (without answer keys)
  let query = supabase
    .from("soal_publik")
    .select(`
      id,
      pertanyaan,
      tipe_soal,
      opsi_soal_publik (
        id,
        teks_opsi
      )
    `);

  if (babId) {
    query = query.eq("bab_id", babId);
  }

  const { data: dbSoalList } = await query;

  const defaultSoalList = [
    {
      id: "d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      pertanyaan: "Diketahui barisan aritmatika $3, 7, 11, 15, \\dots$. Tentukan nilai dari suku ke-10 ($U_{10}$)!",
      tipeSoal: "pilihan_ganda" as const,
      opsiSoal: [
        { id: "e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", teksOpsi: "35" },
        { id: "e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12", teksOpsi: "39" },
        { id: "e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13", teksOpsi: "43" },
        { id: "e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14", teksOpsi: "47" },
      ],
    },
    {
      id: "d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
      pertanyaan: "Jelaskan perbedaan mendasar antara **Barisan Aritmatika** dan **Barisan Geometri**, serta berikan masing-masing 1 contoh!",
      tipeSoal: "esai" as const,
    },
  ];

  const formattedSoalList =
    dbSoalList && dbSoalList.length > 0
      ? dbSoalList.map((item: any) => ({
          id: item.id,
          pertanyaan: item.pertanyaan,
          tipeSoal: item.tipe_soal as "pilihan_ganda" | "esai",
          opsiSoal: (item.opsi_soal_publik || item.opsi_soal)?.map((o: any) => ({
            id: o.id,
            teksOpsi: o.teks_opsi,
          })),
        }))
      : defaultSoalList;

  return (
    <ExamPracticeClient
      sesiId={sesiId}
      mode={mode || "latihan"}
      judulSesi={
        mode === "inclass"
          ? "EVALUASI BAB - ASESMEN TOPIK IN-CLASS"
          : "UJIAN AKHIR SEMESTER - PRACTICE EXAM"
      }
      soalList={formattedSoalList}
      namaSiswa={profil?.nama_lengkap ?? undefined}
    />
  );
}

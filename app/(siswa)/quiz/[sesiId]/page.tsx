import { createClient } from "@/lib/supabase/server";
import SessionQuizClient from "@/components/sesi/SessionQuizClient";
import { redirect } from "next/navigation";

function isValidUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ sesiId: string }>;
}) {
  const { sesiId: rawId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let sesiId = rawId;

  // Always fetch profile to get nama and sekolah_id
  const { data: profil } = user
    ? await supabase.from("profil").select("sekolah_id, nama_lengkap").eq("id", user.id).single()
    : { data: null };

  // If not a valid UUID, create a real sesi row and redirect once
  if (!isValidUUID(rawId) && user) {
    const { data: firstBab } = await supabase
      .from("bab")
      .select("id")
      .order("urutan", { ascending: true })
      .limit(1)
      .single();

    const { data: newSesi } = await supabase
      .from("sesi")
      .insert({
        siswa_id: user.id,
        sekolah_id: profil?.sekolah_id ?? null,
        bab_id: firstBab?.id ?? null,
        tipe_sesi: "kuis",
        status_sesi: "aktif",
      })
      .select("id")
      .single();

    if (newSesi?.id) {
      redirect(`/quiz/${newSesi.id}`);
    }
  }

  // Query published questions
  const { data: dbSoalList } = await supabase
    .from("soal")
    .select(`id, pertanyaan, tipe_soal, kunci_jawaban, pembahasan, opsi_soal (id, teks_opsi)`)
    .eq("status_soal", "dipublikasi");

  const defaultSoalList = [
    {
      id: "d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
      pertanyaan: "Diketahui barisan aritmatika $3, 7, 11, 15, \\dots$. Tentukan nilai dari suku ke-10 ($U_{10}$)!",
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
      pertanyaan: "Jelaskan perbedaan mendasar antara **Barisan Aritmatika** dan **Barisan Geometri**, serta berikan masing-masing 1 contoh!",
      tipeSoal: "esai" as const,
    },
  ];

  const soalList =
    dbSoalList && dbSoalList.length > 0
      ? dbSoalList.map((item: any) => ({
          id: item.id,
          pertanyaan: item.pertanyaan,
          tipeSoal: item.tipe_soal as "pilihan_ganda" | "esai",
          opsiSoal: item.opsi_soal?.map((o: any) => ({ id: o.id, teksOpsi: o.teks_opsi })),
        }))
      : defaultSoalList;

  return (
    <SessionQuizClient
      sesiId={sesiId}
      jenisSesi="Kuis"
      judulBab="Bab 1: Pola Bilangan & Barisan"
      soalList={soalList}
      namaSiswa={profil?.nama_lengkap ?? undefined}
    />
  );
}

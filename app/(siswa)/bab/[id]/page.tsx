import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import DaftarMateriClient from "./DaftarMateriClient";

export default async function DetailBabPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ materiId?: string }>;
}) {
  const { id } = await params;
  const { materiId } = await searchParams;
  const supabase = await createClient();

  // 1. Ambil data bab dari Supabase
  const { data: babData } = await supabase
    .from("bab")
    .select(
      `
      id,
      judul,
      deskripsi,
      urutan,
      materi (
        id,
        judul,
        konten_markdown,
        urutan
      )
    `
    )
    .eq("id", id)
    .maybeSingle();

  // Jika bab tidak ditemukan di database, tampilkan halaman 404 resmi (tanpa bab contoh hardcode)
  if (!babData) {
    notFound();
  }

  const listMateri =
    babData.materi?.sort((a: any, b: any) => a.urutan - b.urutan) || [];

  // 2. Hitung progres belajar bab secara nyata dari database
  const { data: { user } } = await supabase.auth.getUser();

  let answeredCount = 0;
  let totalSoalCount = 0;

  const { count: dbTotalSoal } = await supabase
    .from("soal_publik")
    .select("id", { count: "exact", head: true })
    .eq("bab_id", id);

  totalSoalCount = dbTotalSoal || 0;

  if (user && totalSoalCount > 0) {
    const { data: answeredRows } = await supabase
      .from("jawaban")
      .select("soal_id, soal_publik!inner(bab_id), sesi!inner(siswa_id)")
      .eq("sesi.siswa_id", user.id)
      .eq("soal_publik.bab_id", id);

    const answeredSet = new Set(answeredRows?.map((r: any) => r.soal_id));
    answeredCount = answeredSet.size;
  }

  const chapterProgressPercent = totalSoalCount > 0
    ? Math.min(100, Math.round((answeredCount / totalSoalCount) * 100))
    : 0;

  return (
    <DaftarMateriClient
      babId={id}
      judulBab={babData.judul}
      deskripsiBab={babData.deskripsi || "Capaian Pembelajaran Kurikulum Merdeka Matematika SMP Kelas 8."}
      urutanBab={babData.urutan || 1}
      listMateri={listMateri}
      initialMateriId={materiId}
      chapterProgressPercent={chapterProgressPercent}
      answeredCount={answeredCount}
      totalSoalCount={totalSoalCount}
    />
  );
}

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import DaftarMateriClient from "../../DaftarMateriClient";
import { generateTextbookModules } from "@/lib/curriculum-textbook-engine";

export default async function MateriDetailPage({
  params,
}: {
  params: Promise<{ id: string; mid: string }>;
}) {
  const { id, mid } = await params;
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // 1. Ambil data bab dan materi dari Supabase
  const { data: babData } = await supabase
    .from("bab")
    .select(
      `
      id,
      judul,
      deskripsi,
      urutan,
      mapel,
      kelas,
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

  if (!babData) {
    notFound();
  }

  let listMateri =
    babData.materi?.sort((a: any, b: any) => a.urutan - b.urutan) || [];

  if (listMateri.length === 0) {
    const defaultModules = generateTextbookModules(
      babData.judul,
      babData.mapel || "Matematika",
      babData.kelas || 8,
      babData.deskripsi || undefined
    );
    listMateri = defaultModules.map((m, idx) => ({
      id: `generated-${id}-${idx + 1}`,
      judul: m.judul,
      konten_markdown: m.konten_markdown,
      urutan: m.urutan,
    }));
  }

  // 2. Hitung progres belajar bab & ambil profil serta kelas
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let answeredCount = 0;
  let totalSoalCount = 0;
  let studentName = "SYAA PX";
  let studentPhoto: string | null = null;
  let namaKelas = `Kelas ${babData.kelas || 8}`;

  if (user) {
    // Ambil profil siswa
    const { data: profil } = await supabase
      .from("profil")
      .select("id, nama_lengkap, email, foto_url")
      .eq("id", user.id)
      .maybeSingle();

    if (profil?.nama_lengkap) {
      studentName = profil.nama_lengkap;
    } else if (user.email) {
      studentName = user.email.split("@")[0];
    }
    if (profil?.foto_url) {
      studentPhoto = profil.foto_url;
    }

    // Ambil kelas siswa dari anggota_kelas
    const { data: memberKelas } = await adminSupabase
      .from("anggota_kelas")
      .select("kelas ( id, nama, nama_kelas, tingkat )")
      .eq("siswa_id", user.id)
      .maybeSingle();

    const rawKelas = (memberKelas as any)?.kelas;
    if (rawKelas) {
      const kName = rawKelas.nama_kelas || rawKelas.nama;
      if (kName) {
        namaKelas = kName.toLowerCase().startsWith("kelas") ? kName : `Kelas ${kName}`;
      } else if (rawKelas.tingkat) {
        namaKelas = `Kelas ${rawKelas.tingkat}`;
      }
    } else if (babData.kelas) {
      namaKelas = `Kelas ${babData.kelas}`;
    }

    const { count: dbTotalSoal } = await supabase
      .from("soal_publik")
      .select("id", { count: "exact", head: true })
      .eq("bab_id", id);

    totalSoalCount = dbTotalSoal || 0;

    if (totalSoalCount > 0) {
      const { data: answeredRows } = await supabase
        .from("jawaban")
        .select("soal_id, soal_publik!inner(bab_id), sesi!inner(siswa_id)")
        .eq("sesi.siswa_id", user.id)
        .eq("soal_publik.bab_id", id);

      const answeredSet = new Set(answeredRows?.map((r: any) => r.soal_id));
      answeredCount = answeredSet.size;
    }
  }

  const chapterProgressPercent =
    totalSoalCount > 0
      ? Math.min(100, Math.round((answeredCount / totalSoalCount) * 100))
      : 0;

  return (
    <DaftarMateriClient
      babId={id}
      judulBab={babData.judul}
      deskripsiBab={
        babData.deskripsi ||
        "Capaian Pembelajaran Kurikulum Merdeka Fase D (Matematika Kelas 8)."
      }
      urutanBab={babData.urutan || 1}
      mapel={babData.mapel || "Matematika"}
      kelas={babData.kelas || 8}
      namaKelas={namaKelas}
      studentName={studentName}
      studentPhoto={studentPhoto}
      listMateri={listMateri}
      initialMateriId={mid}
      initialViewMode="pdf"
      chapterProgressPercent={chapterProgressPercent}
      answeredCount={answeredCount}
      totalSoalCount={totalSoalCount}
    />
  );
}

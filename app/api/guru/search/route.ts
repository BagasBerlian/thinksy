import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q || q.length < 2) {
      return NextResponse.json({
        query: q,
        total: 0,
        siswa: [],
        materi: [],
        ujian: [],
      });
    }

    const adminDb = createAdminClient();

    // 1. Search Siswa (by nama_lengkap or nisn)
    const { data: siswaData, error: siswaError } = await adminDb
      .from("profil")
      .select(`
        id,
        nama_lengkap,
        nisn,
        poin,
        streak,
        foto_url,
        anggota_kelas (
          kelas (
            id,
            nama_kelas
          )
        )
      `)
      .eq("peran", "siswa")
      .or(`nama_lengkap.ilike.%${q}%,nisn.ilike.%${q}%`)
      .limit(8);

    if (siswaError) {
      console.error("Error searching siswa:", siswaError);
    }

    // Format Siswa results
    const siswa = (siswaData || []).map((s: any) => {
      const kelasName = s.anggota_kelas?.[0]?.kelas?.nama_kelas || "Kelas 8";
      return {
        id: s.id,
        nama_lengkap: s.nama_lengkap,
        nisn: s.nisn || "-",
        kelas: kelasName,
        poin: s.poin || 0,
        streak: s.streak || 0,
        foto_url: s.foto_url,
      };
    });

    // 2. Search Materi / Bab (by judul or mapel)
    const { data: babData, error: babError } = await adminDb
      .from("bab")
      .select("id, judul, mapel, urutan")
      .or(`judul.ilike.%${q}%,mapel.ilike.%${q}%`)
      .limit(6);

    if (babError) {
      console.error("Error searching bab:", babError);
    }

    const materi = (babData || []).map((b: any) => ({
      id: b.id,
      judul: b.judul,
      mata_pelajaran: b.mapel,
      urutan: b.urutan,
      href: `/belajar?mapel=${encodeURIComponent(b.mapel)}&babId=${b.id}`,
    }));

    // 3. Search Soal (by pertanyaan)
    const { data: soalData, error: soalError } = await adminDb
      .from("soal")
      .select("id, pertanyaan, tipe_soal, status_soal")
      .ilike("pertanyaan", `%${q}%`)
      .limit(6);

    if (soalError) {
      console.error("Error searching soal:", soalError);
    }

    const soal = (soalData || []).map((s: any) => ({
      id: s.id,
      judul: s.pertanyaan.length > 60 ? s.pertanyaan.substring(0, 60) + "..." : s.pertanyaan,
      tipe: s.tipe_soal,
      status: s.status_soal,
      href: `/guru/soal/${s.id}`,
    }));

    const total = siswa.length + materi.length + soal.length;

    return NextResponse.json({
      query: q,
      total,
      siswa,
      materi,
      soal,
    });
  } catch (err: any) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: "Internal server error", total: 0, siswa: [], materi: [], soal: [] },
      { status: 500 }
    );
  }
}

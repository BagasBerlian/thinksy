import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }

    // Ambil profil pemanggil untuk cek peran dan sekolah_id
    const { data: adminProfile } = await supabase
      .from("profil")
      .select("peran, sekolah_id")
      .eq("id", user.id)
      .single();

    if (
      !adminProfile ||
      !["admin_sekolah", "super_admin"].includes(adminProfile.peran)
    ) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const sekolahId = adminProfile.sekolah_id;

    // 1. Total Siswa Aktif
    let querySiswa = supabase
      .from("profil")
      .select("id", { count: "exact", head: true })
      .eq("peran", "siswa");
    if (sekolahId) querySiswa = querySiswa.eq("sekolah_id", sekolahId);
    const { count: totalSiswa } = await querySiswa;

    // 2. Total Guru Aktif
    let queryGuru = supabase
      .from("profil")
      .select("id", { count: "exact", head: true })
      .eq("peran", "guru");
    if (sekolahId) queryGuru = queryGuru.eq("sekolah_id", sekolahId);
    const { count: totalGuru } = await queryGuru;

    // 3. Total Kelas
    let queryKelas = supabase
      .from("kelas")
      .select("id", { count: "exact", head: true });
    if (sekolahId) queryKelas = queryKelas.eq("sekolah_id", sekolahId);
    const { count: totalKelas } = await queryKelas;

    // 4. Daftar Guru Terbaru (Max 5)
    let queryGuruList = supabase
      .from("profil")
      .select("id, nama_lengkap, dibuat_pada")
      .eq("peran", "guru")
      .order("dibuat_pada", { ascending: false })
      .limit(5);
    if (sekolahId) queryGuruList = queryGuruList.eq("sekolah_id", sekolahId);
    const { data: teacherListRaw } = await queryGuruList;

    const teacherList = (teacherListRaw || []).map((t) => {
      const parts = (t.nama_lengkap || "Guru").trim().split(" ");
      const initials =
        parts.length >= 2
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : (parts[0][0] || "G").toUpperCase();
      return {
        id: t.id,
        initials,
        name: t.nama_lengkap || "Guru",
        status: "Aktif",
        statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        statusDot: "bg-emerald-500",
      };
    });

    // 5. Profil Sekolah
    let sekolahData = null;
    if (sekolahId) {
      const { data: sekolah } = await supabase
        .from("sekolah")
        .select("id, nama, npsn, alamat, motto, deskripsi, bg_image_url, links")
        .eq("id", sekolahId)
        .single();
      sekolahData = sekolah;
    }

    // 6. Presensi Hari Ini
    const today = new Date().toISOString().split("T")[0];
    const { count: totalPresensiToday } = await supabase
      .from("presensi")
      .select("id", { count: "exact", head: true })
      .eq("tanggal", today);

    return NextResponse.json({
      success: true,
      stats: {
        totalSiswa: totalSiswa || 0,
        totalGuru: totalGuru || 0,
        totalKelas: totalKelas || 0,
        totalPresensiToday: totalPresensiToday || 0,
        teacherList,
        sekolah: sekolahData || {
          nama: "Sekolah AI MVP",
          npsn: "1010101",
          alamat: "Jl. Pendidikan No. 1",
          motto: "Unggul & Berkarakter AI",
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}

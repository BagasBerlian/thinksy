import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }

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

    let query = supabase
      .from("kelas")
      .select(`
        id,
        nama_kelas,
        wali_kelas_id,
        dibuat_pada,
        wali_kelas:wali_kelas_id (
          id,
          nama_lengkap
        ),
        anggota_kelas (
          id
        )
      `)
      .order("nama_kelas", { ascending: true });

    if (adminProfile.sekolah_id) {
      query = query.eq("sekolah_id", adminProfile.sekolah_id);
    }

    const { data: kelasList, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedKelas = (kelasList || []).map((k: any) => {
      const waliNama = k.wali_kelas?.nama_lengkap || "Belum Ditetapkan";
      const parts = waliNama.trim().split(" ");
      const initials =
        parts.length >= 2
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : (parts[0][0] || "W").toUpperCase();

      return {
        id: k.id,
        name: k.nama_kelas,
        academicYear: "2024/2025",
        homeroomTeacher: waliNama,
        initials,
        studentsCount: Array.isArray(k.anggota_kelas) ? k.anggota_kelas.length : 0,
      };
    });

    return NextResponse.json({
      success: true,
      kelas: formattedKelas,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }

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

    const body = await request.json();
    const { nama_kelas, wali_kelas_id } = body;

    if (!nama_kelas || typeof nama_kelas !== "string") {
      return NextResponse.json(
        { error: "Nama kelas wajib diisi." },
        { status: 400 }
      );
    }

    let sekolahId = adminProfile.sekolah_id;
    if (!sekolahId) {
      // Ambil sekolah pertama jika belum terhubung
      const { data: sek } = await supabase.from("sekolah").select("id").limit(1).single();
      sekolahId = sek?.id;
    }

    const { data: kelasBaru, error } = await supabase
      .from("kelas")
      .insert({
        nama_kelas: nama_kelas.trim(),
        sekolah_id: sekolahId,
        wali_kelas_id: wali_kelas_id || null,
      })
      .select("id, nama_kelas")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      kelas: kelasBaru,
      message: `Kelas ${kelasBaru.nama_kelas} berhasil dibuat.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}

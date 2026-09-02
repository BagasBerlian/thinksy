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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const kelasId = searchParams.get("kelas_id") || "";

    let query = supabase
      .from("profil")
      .select(`
        id,
        nama_lengkap,
        poin,
        streak,
        dibuat_pada,
        anggota_kelas (
          id,
          kelas_id,
          kelas (
            id,
            nama_kelas
          )
        )
      `)
      .eq("peran", "siswa")
      .order("nama_lengkap", { ascending: true });

    if (adminProfile.sekolah_id) {
      query = query.eq("sekolah_id", adminProfile.sekolah_id);
    }

    if (search) {
      query = query.ilike("nama_lengkap", `%${search}%`);
    }

    const { data: siswaList, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedSiswa = (siswaList || [])
      .map((s: any) => {
        const parts = (s.nama_lengkap || "Siswa").trim().split(" ");
        const initials =
          parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : (parts[0][0] || "S").toUpperCase();

        const member = Array.isArray(s.anggota_kelas) && s.anggota_kelas.length > 0 ? s.anggota_kelas[0] : null;
        const className = member?.kelas?.nama_kelas || "Belum Ada Kelas";
        const currentKelasId = member?.kelas?.id || null;

        return {
          id: s.id,
          initials,
          name: s.nama_lengkap || "Siswa",
          gender: "Siswa",
          email: `${(s.nama_lengkap || "siswa").toLowerCase().replace(/\s+/g, ".")}@siswa.sch.id`,
          nisn: s.id.slice(0, 10),
          class: className,
          kelas_id: currentKelasId,
          status: "Aktif",
          statusColor: "bg-blue-100 text-blue-800 border-blue-200",
          poin: s.poin || 0,
          streak: s.streak || 0,
        };
      })
      .filter((s) => (!kelasId || kelasId === "Semua Kelas" ? true : s.kelas_id === kelasId || s.class === kelasId));

    return NextResponse.json({
      success: true,
      siswa: formattedSiswa,
      totalCount: formattedSiswa.length,
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
    const { siswa_id, kelas_id } = body;

    if (!siswa_id || !kelas_id) {
      return NextResponse.json(
        { error: "Siswa ID dan Kelas ID wajib diisi." },
        { status: 400 }
      );
    }

    // Hapus alokasi lama
    await supabase.from("anggota_kelas").delete().eq("siswa_id", siswa_id);

    // Masukkan ke kelas baru
    const { error: insertErr } = await supabase.from("anggota_kelas").insert({
      siswa_id,
      kelas_id,
    });

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Berhasil memperbarui kelas siswa.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}

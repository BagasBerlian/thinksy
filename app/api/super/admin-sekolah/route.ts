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
      .select("peran")
      .eq("id", user.id)
      .single();

    if (!adminProfile || adminProfile.peran !== "super_admin") {
      return NextResponse.json({ error: "Akses ditolak. Hanya Super Admin." }, { status: 403 });
    }

    const { data: adminList, error } = await supabase
      .from("profil")
      .select(`
        id,
        nama_lengkap,
        sekolah_id,
        dibuat_pada,
        sekolah:sekolah_id (
          id,
          nama,
          npsn
        )
      `)
      .eq("peran", "admin_sekolah")
      .order("dibuat_pada", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedAdmin = (adminList || []).map((a: any) => {
      const parts = (a.nama_lengkap || "Admin").trim().split(" ");
      const initials =
        parts.length >= 2
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : (parts[0][0] || "A").toUpperCase();

      return {
        id: a.id,
        initials,
        nama_lengkap: a.nama_lengkap || "Admin Sekolah",
        sekolah_id: a.sekolah_id,
        nama_sekolah: a.sekolah?.nama || "Belum Dialokasikan",
        npsn_sekolah: a.sekolah?.npsn || "-",
        dibuat_pada: a.dibuat_pada,
        status: "Aktif",
      };
    });

    return NextResponse.json({
      success: true,
      adminSekolah: formattedAdmin,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
      .select("peran")
      .eq("id", user.id)
      .single();

    if (!adminProfile || adminProfile.peran !== "super_admin") {
      return NextResponse.json({ error: "Akses ditolak. Hanya Super Admin." }, { status: 403 });
    }

    const body = await request.json();
    const { admin_id, sekolah_id } = body;

    if (!admin_id) {
      return NextResponse.json({ error: "Admin ID wajib disertakan." }, { status: 400 });
    }

    const { error: updateErr } = await supabase
      .from("profil")
      .update({ sekolah_id: sekolah_id || null })
      .eq("id", admin_id)
      .eq("peran", "admin_sekolah");

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Alokasi sekolah untuk Admin berhasil diperbarui.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}

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
      .from("profil")
      .select(`
        id,
        nama_lengkap,
        poin,
        streak,
        dibuat_pada
      `)
      .eq("peran", "guru")
      .order("dibuat_pada", { ascending: false });

    if (adminProfile.sekolah_id) {
      query = query.eq("sekolah_id", adminProfile.sekolah_id);
    }

    const { data: guruList, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map ke format tampilan guru
    const formattedGuru = (guruList || []).map((g) => {
      const parts = (g.nama_lengkap || "Guru").trim().split(" ");
      const initials =
        parts.length >= 2
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : (parts[0][0] || "G").toUpperCase();

      return {
        id: g.id,
        initials,
        nama_lengkap: g.nama_lengkap || "Guru Baru",
        peran: "guru",
        dibuat_pada: g.dibuat_pada,
        status: "Aktif",
      };
    });

    return NextResponse.json({
      success: true,
      guru: formattedGuru,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}

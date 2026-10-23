import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let sekolahId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
    let canEdit = true;

    if (user) {
      const { data: profil } = await supabase
        .from("profil")
        .select("sekolah_id, peran")
        .eq("id", user.id)
        .single();

      if (profil?.sekolah_id) {
        sekolahId = profil.sekolah_id;
        canEdit = profil.peran === "guru";
      }
    }

    const { data: sekolah } = await supabase
      .from("sekolah")
      .select("id, nama, jam_masuk, jam_terlambat, jam_tutup")
      .eq("id", sekolahId)
      .single();

    return NextResponse.json({
      sekolah: sekolah || {
        id: sekolahId,
        nama: "SMK Muhammadiyah 1",
        jam_masuk: "07:15:00",
        jam_terlambat: "07:30:00",
        jam_tutup: "08:00:00",
      },
      canEdit,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let sekolahId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

    if (user) {
      const { data: profil } = await supabase
        .from("profil")
        .select("sekolah_id, peran")
        .eq("id", user.id)
        .single();

      if (profil && profil.peran !== "guru") {
        return NextResponse.json({ error: "Hanya Guru yang berhak mengubah jam presensi" }, { status: 403 });
      }

      if (profil?.sekolah_id) {
        sekolahId = profil.sekolah_id;
      }
    }

    const body = await req.json();
    const { jam_masuk, jam_terlambat, jam_tutup } = body;

    if (!jam_masuk || !jam_tutup) {
      return NextResponse.json({ error: "jam_masuk dan jam_tutup wajib diisi" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("sekolah")
      .update({
        jam_masuk,
        jam_terlambat: jam_terlambat || jam_masuk,
        jam_tutup,
      })
      .eq("id", sekolahId)
      .select("id, nama, jam_masuk, jam_terlambat, jam_tutup")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Batas waktu presensi sekolah berhasil diperbarui!",
      sekolah: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

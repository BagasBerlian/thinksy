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

    let sekolahId = adminProfile.sekolah_id;
    if (!sekolahId) {
      const { data: sek } = await supabase.from("sekolah").select("id").limit(1).single();
      sekolahId = sek?.id;
    }

    if (!sekolahId) {
      return NextResponse.json({
        success: true,
        sekolah: {
          nama: "Sekolah AI MVP",
          npsn: "1010101",
          alamat: "Jl. Pendidikan No. 1",
          motto: "Unggul & Berkarakter AI",
          deskripsi: "Sekolah Berbasis Teknologi AI",
        },
      });
    }

    const { data: sekolahData, error } = await supabase
      .from("sekolah")
      .select("*")
      .eq("id", sekolahId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sekolah: sekolahData,
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
    const { nama, npsn, alamat, motto, deskripsi } = body;

    let sekolahId = adminProfile.sekolah_id;
    if (!sekolahId) {
      const { data: sek } = await supabase.from("sekolah").select("id").limit(1).single();
      sekolahId = sek?.id;
    }

    if (!sekolahId) {
      // Buat sekolah baru
      const { data: sekBaru, error: sekErr } = await supabase
        .from("sekolah")
        .insert({
          nama: nama || "Sekolah AI MVP",
          npsn: npsn || "1010101",
          alamat,
          motto,
          deskripsi,
        })
        .select("id")
        .single();

      if (sekErr) {
        return NextResponse.json({ error: sekErr.message }, { status: 500 });
      }

      // Hubungkan admin ke sekolah ini
      await supabase.from("profil").update({ sekolah_id: sekBaru.id }).eq("id", user.id);
      sekolahId = sekBaru.id;
    } else {
      const { error: updateErr } = await supabase
        .from("sekolah")
        .update({
          nama,
          npsn,
          alamat,
          motto,
          deskripsi,
        })
        .eq("id", sekolahId);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profil sekolah berhasil diperbarui.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}

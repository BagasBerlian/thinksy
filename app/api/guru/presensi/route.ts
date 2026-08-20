import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const kelasParam = searchParams.get("kelas") || "Semua";

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }

    const formattedDate = new Date().toISOString().split("T")[0];

    // Fetch presensi today with student profile details
    let query = supabase
      .from("presensi")
      .select(
        `
        id,
        siswa_id,
        tanggal,
        waktu_masuk,
        foto_url,
        status,
        profil:siswa_id (
          id,
          nama_lengkap
        )
      `
      )
      .eq("tanggal", formattedDate)
      .order("waktu_masuk", { ascending: false });

    const { data: presensiList, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      presensi: presensiList || [],
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

    let body: { classId?: string; presensiIds?: string[] };
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const formattedDate = new Date().toISOString().split("T")[0];

    // Mark attendance records as verified/confirmed by teacher
    const { error: updateError } = await supabase
      .from("presensi")
      .update({ status: "Terverifikasi" })
      .eq("tanggal", formattedDate);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Absensi kelas berhasil diverifikasi dan disimpan oleh Guru!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}

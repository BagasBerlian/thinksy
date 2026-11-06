import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { ujianId } = body;

    if (!ujianId) {
      return NextResponse.json({ error: "ujianId wajib diisi" }, { status: 400 });
    }

    // Ambil detail ujian untuk memastikan hanya tipe 'ujian' (ujian resmi) yang dikunci saat keluar
    const { data: ujian } = await adminSupabase
      .from("ujian")
      .select("id, tipe, judul")
      .eq("id", ujianId)
      .maybeSingle();

    const isOfficialExam = ujian?.tipe === "ujian" || (!/ulangan|formatif/i.test(ujian?.judul || "") && ujian?.tipe !== "ulangan");

    if (isOfficialExam) {
      // Kunci sesi ujian siswa karena keluar dari ruang ujian resmi
      await adminSupabase
        .from("sesi_ujian")
        .update({ status: "terkunci" })
        .eq("ujian_id", ujianId)
        .eq("siswa_id", user.id)
        .eq("status", "sedang_mengerjakan");
    }

    return NextResponse.json({
      success: true,
      message: "Status sesi berhasil diperbarui.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Anda harus login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { sesiId, soalId, opsiDipilihId, jawabanTeks } = body;

    if (!sesiId || !soalId) {
      return NextResponse.json(
        { error: "sesiId dan soalId wajib disertakan." },
        { status: 400 }
      );
    }

    // Check that session belongs to the user and is active
    const { data: sesiRow } = await adminDb
      .from("sesi")
      .select("id, siswa_id, status_sesi")
      .eq("id", sesiId)
      .maybeSingle();

    if (!sesiRow) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan." },
        { status: 404 }
      );
    }

    if (sesiRow.status_sesi === "selesai") {
      return NextResponse.json(
        { error: "Sesi ini telah selesai diajukan dan terkunci." },
        { status: 403 }
      );
    }

    // Upsert into jawaban table
    const { error: upsertErr } = await adminDb
      .from("jawaban")
      .upsert(
        {
          sesi_id: sesiId,
          soal_id: soalId,
          opsi_dipilih_id: opsiDipilihId || null,
          jawaban_teks: jawabanTeks || null,
          dijawab_pada: new Date().toISOString(),
        },
        { onConflict: "sesi_id,soal_id" }
      );

    if (upsertErr) {
      return NextResponse.json(
        { error: "Gagal menyimpan jawaban: " + upsertErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Jawaban tersimpan",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

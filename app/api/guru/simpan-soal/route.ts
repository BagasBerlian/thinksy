import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Anda harus masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      babId,
      pertanyaan,
      tipeSoal,
      tingkatSoal,
      sumberKonten = "ai_generated",
      kunciJawaban,
      pembahasan,
      opsiSoal = [],
    } = body;

    if (!babId || !pertanyaan) {
      return NextResponse.json(
        { error: "Bab dan pertanyaan wajib diisi." },
        { status: 400 }
      );
    }

    // Insert to `soal` table
    const { data: insertedSoal, error: insertError } = await supabase
      .from("soal")
      .insert({
        bab_id: babId,
        pertanyaan,
        tipe_soal: tipeSoal || "pilihan_ganda",
        tingkat_soal: tingkatSoal || "sedang",
        sumber_konten: sumberKonten,
        status_soal: "dipublikasi",
        kunci_jawaban: kunciJawaban || "",
        pembahasan: pembahasan || "",
        pembuat_id: user.id,
      })
      .select("id")
      .single();

    if (insertError || !insertedSoal) {
      return NextResponse.json(
        { error: "Gagal menyimpan soal: " + insertError?.message },
        { status: 500 }
      );
    }

    // Insert options if Pilihan Ganda
    if (tipeSoal === "pilihan_ganda" && opsiSoal.length > 0) {
      const opsiPayload = opsiSoal.map((o: any, idx: number) => ({
        soal_id: insertedSoal.id,
        teks_opsi: o.teksOpsi,
        benar: Boolean(o.benar),
        urutan: idx + 1,
      }));

      const { error: opsiError } = await supabase
        .from("opsi_soal")
        .insert(opsiPayload);

      if (opsiError) {
        console.error("Error inserting options:", opsiError);
      }
    }

    return NextResponse.json({
      success: true,
      soalId: insertedSoal.id,
      message: "Soal berhasil disimpan ke Bank Soal!",
    });
  } catch (error: any) {
    console.error("Error saving question:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menyimpan soal." },
      { status: 500 }
    );
  }
}

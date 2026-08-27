import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST: Mulai Sesi Belajar Baru
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
        { error: "Anda harus masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    let body: { tipeSesi?: string; materiId?: string; babId?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { tipeSesi = "kuis" } = body;

    // Create session record in Supabase `sesi` table
    const { data: newSesi, error: insertError } = await adminDb
      .from("sesi")
      .insert({
        siswa_id: user.id,
        tipe_sesi: tipeSesi,
        status_sesi: "berlangsung",
      })
      .select("id, siswa_id, tipe_sesi, status_sesi, dibuat_pada")
      .single();

    if (insertError || !newSesi) {
      return NextResponse.json(
        { error: "Gagal membuat sesi belajar: " + insertError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sesiId: newSesi.id,
      sesi: newSesi,
      message: "Sesi belajar berhasil dimulai!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal memproses sesi." },
      { status: 500 }
    );
  }
}

// GET: Cek Sesi Aktif atau Detail Sesi
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();
    const { searchParams } = new URL(req.url);
    const sesiIdParam = searchParams.get("sesiId");

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

    let query = adminDb.from("sesi").select("*");

    if (sesiIdParam) {
      query = query.eq("id", sesiIdParam);
    } else {
      query = query
        .eq("siswa_id", user.id)
        .eq("status_sesi", "berlangsung")
        .order("dibuat_pada", { ascending: false })
        .limit(1);
    }

    const { data: sesiData, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const activeSesi = Array.isArray(sesiData) ? sesiData[0] : sesiData;

    return NextResponse.json({
      success: true,
      sesi: activeSesi || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengambil data sesi." },
      { status: 500 }
    );
  }
}

// PUT: Selesai Sesi Belajar & Hitung Skor Akhir
export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();

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
    const { sesiId } = body;

    if (!sesiId) {
      return NextResponse.json(
        { error: "ID Sesi wajib disertakan." },
        { status: 400 }
      );
    }

    // Fetch all answers for this session to calculate final score
    const { data: jawabanList } = await adminDb
      .from("jawaban")
      .select("nilai")
      .eq("sesi_id", sesiId);

    let finalScore = 0;
    if (jawabanList && jawabanList.length > 0) {
      const totalNilai = jawabanList.reduce(
        (sum, j) => sum + (Number(j.nilai) || 0),
        0
      );
      finalScore = Math.round(totalNilai / jawabanList.length);
    }

    // Update Sesi status to selesai and save final score
    const { data: updatedSesi, error: updateError } = await adminDb
      .from("sesi")
      .update({
        skor_akhir: finalScore,
        status_sesi: "selesai",
        selesai_pada: new Date().toISOString(),
      })
      .eq("id", sesiId)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Gagal menyelesai sesi: " + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sesiId,
      skorAkhir: finalScore,
      sesi: updatedSesi,
      message: "Sesi belajar telah selesai!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengakhiri sesi." },
      { status: 500 }
    );
  }
}

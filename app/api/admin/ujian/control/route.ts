import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET current status of Ulangan and Ujian for Admin Sekolah
export async function GET() {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: exams, error } = await adminSupabase
      .from("ujian")
      .select("id, judul, mapel, tipe, status, durasi_menit, waktu_mulai, waktu_berakhir, token")
      .order("waktu_mulai", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const ulanganExams = (exams || []).filter((e) => e.tipe === "ulangan");
    const ujianExams = (exams || []).filter((e) => e.tipe === "ujian");

    const isUlanganOn = ulanganExams.some((e) => e.status === "dipublikasi");
    const isUjianOn = ujianExams.some((e) => e.status === "dipublikasi");

    return NextResponse.json({
      success: true,
      ulangan: {
        isOn: isUlanganOn,
        durasi_menit: ulanganExams[0]?.durasi_menit || 60,
        waktu_mulai: ulanganExams[0]?.waktu_mulai,
        waktu_berakhir: ulanganExams[0]?.waktu_berakhir,
        exams: ulanganExams,
      },
      ujian: {
        isOn: isUjianOn,
        durasi_menit: ujianExams[0]?.durasi_menit || 90,
        waktu_mulai: ujianExams[0]?.waktu_mulai,
        waktu_berakhir: ujianExams[0]?.waktu_berakhir,
        exams: ujianExams,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH to toggle ON / OFF and set schedule timing for a whole category (Ulangan or Ujian)
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category, status, durasiMenit, waktuMulai, waktuBerakhir } = body;

    if (!category || !["ulangan", "ujian"].includes(category)) {
      return NextResponse.json(
        { error: "Kategori wajib diisi ('ulangan' atau 'ujian')" },
        { status: 400 }
      );
    }

    const updatePayload: any = {};
    if (status) {
      updatePayload.status = status;
      if (status === "dipublikasi" && !waktuBerakhir) {
        const now = new Date();
        updatePayload.waktu_berakhir = new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000
        ).toISOString();
      }
    }
    if (durasiMenit !== undefined) {
      updatePayload.durasi_menit = Number(durasiMenit);
    }
    if (waktuMulai) updatePayload.waktu_mulai = new Date(waktuMulai).toISOString();
    if (waktuBerakhir) updatePayload.waktu_berakhir = new Date(waktuBerakhir).toISOString();

    const { data: updatedExams, error } = await adminSupabase
      .from("ujian")
      .update(updatePayload)
      .eq("tipe", category)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      category,
      status: status || "updated",
      updatedCount: updatedExams?.length || 0,
      message: `Akses ${category === "ulangan" ? "Ulangan Harian" : "Ujian Resmi"} berhasil diubah menjadi ${
        status === "dipublikasi" ? "DIBUKA (ON)" : "DITUTUP (OFF)"
      }!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

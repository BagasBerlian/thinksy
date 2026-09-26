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

    const body = await req.json();
    const { ujianId, token, judul, mapel, babId: incomingBabId } = body;

    if (!ujianId || !token) {
      return NextResponse.json(
        { error: "ID Ujian dan Password Token wajib disertakan." },
        { status: 400 }
      );
    }

    const inputToken = String(token).trim().toUpperCase();
    const isUniversalTokenValid = inputToken === "12345";

    let babId = incomingBabId || (ujianId.startsWith("ulangan-bab-") ? ujianId.replace("ulangan-bab-", "") : null);
    let targetUjianId = ujianId;

    // 1. Coba cari di database berdasarkan ID langsung
    let { data: ujian } = await adminSupabase
      .from("ujian")
      .select("id, judul, mapel, tipe, durasi_menit, passing_grade, status, token, waktu_berakhir, bab_id")
      .eq("id", targetUjianId)
      .maybeSingle();

    // 2. Jika belum ketemu dan ada babId, cari ujian berdasarkan bab_id
    if (!ujian && babId) {
      const { data: ujianByBab } = await adminSupabase
        .from("ujian")
        .select("id, judul, mapel, tipe, durasi_menit, passing_grade, status, token, waktu_berakhir, bab_id")
        .eq("bab_id", babId)
        .maybeSingle();

      if (ujianByBab) {
        ujian = ujianByBab;
        targetUjianId = ujianByBab.id;
      }
    }

    // 3. Jika belum ada ujian untuk bab ini di tabel ujian, buatkan otomatis dengan token "12345"
    if (!ujian && babId) {
      const { data: babData } = await adminSupabase
        .from("bab")
        .select("id, judul, deskripsi, mapel, sekolah_id")
        .eq("id", babId)
        .maybeSingle();

      const examTitle = judul || (babData?.judul ? (babData.judul.startsWith("Bab") ? `Ulangan Harian ${babData.judul}` : `Ulangan Harian: ${babData.judul}`) : "Ulangan Harian Siswa");
      const examMapel = mapel || babData?.mapel || "Matematika";

      const { data: newUjian } = await adminSupabase
        .from("ujian")
        .insert({
          judul: examTitle,
          deskripsi: babData?.deskripsi || `Evaluasi formatif materi ${examTitle}.`,
          mapel: examMapel,
          tipe: "ulangan",
          durasi_menit: 30,
          passing_grade: 75,
          status: "dipublikasi",
          token: "12345",
          bab_id: babId,
          sekolah_id: babData?.sekolah_id || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        })
        .select("id, judul, mapel, tipe, durasi_menit, passing_grade, status, token, waktu_berakhir, bab_id")
        .maybeSingle();

      if (newUjian) {
        ujian = newUjian;
        targetUjianId = newUjian.id;
      }
    }

    // 4. Fallback jika ID masih belum ditemukan di tabel ujian
    if (!ujian) {
      const { data: fallbackUjian } = await adminSupabase
        .from("ujian")
        .select("id, judul, mapel, tipe, durasi_menit, passing_grade, status, token, waktu_berakhir, bab_id")
        .eq("status", "dipublikasi")
        .limit(1)
        .maybeSingle();

      if (fallbackUjian) {
        ujian = fallbackUjian;
        targetUjianId = fallbackUjian.id;
      } else {
        return NextResponse.json({ error: "Ujian tidak ditemukan." }, { status: 404 });
      }
    }

    if (ujian.status === "ditutup") {
      return NextResponse.json(
        { error: "Akses ujian ini sedang ditutup oleh Guru." },
        { status: 403 }
      );
    }

    // SEMUA PASSWORD SEMENTARA RESMI: "12345"
    const expectedToken = (ujian.token || "12345").trim().toUpperCase();
    const isCustomTokenValid = Boolean(expectedToken && inputToken === expectedToken);

    if (!isUniversalTokenValid && !isCustomTokenValid) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: "Password salah! Silakan gunakan password sementara: 12345",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      ujianId: targetUjianId,
      judul: ujian.judul,
      mapel: ujian.mapel,
      tipe: ujian.tipe,
      durasi_menit: ujian.durasi_menit || 30,
      message: "Password valid! Membuka lembar ujian...",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Terjadi kesalahan internal." },
      { status: 500 }
    );
  }
}

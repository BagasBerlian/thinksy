import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Anda harus masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    let body: { foto_base64?: string };
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { foto_base64 } = body;
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const formattedDate = now.toISOString().split("T")[0];

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDateStr = yesterday.toISOString().split("T")[0];

    // Cek apakah siswa sudah presensi hari ini & kemarin
    const { data: todayPresensi } = await supabase
      .from("presensi")
      .select("id")
      .eq("siswa_id", user.id)
      .eq("tanggal", formattedDate)
      .maybeSingle();

    const { data: yesterdayPresensi } = await supabase
      .from("presensi")
      .select("id")
      .eq("siswa_id", user.id)
      .eq("tanggal", yesterdayDateStr)
      .maybeSingle();

    const { data: currentProfil } = await supabase
      .from("profil")
      .select("nama_lengkap, poin, streak")
      .eq("id", user.id)
      .single();

    const oldStreak = currentProfil?.streak ?? 0;
    let newStreak = oldStreak;

    if (!todayPresensi) {
      // Jika baru presensi hari ini: tambah 1 jika kemarin hadir, reset ke 1 jika kemarin bolong
      newStreak = yesterdayPresensi ? oldStreak + 1 : 1;
    } else {
      newStreak = Math.max(oldStreak, 1);
    }

    // 1. Simpan atau update presensi di database
    const { data: presensiData, error: presensiError } = await supabase
      .from("presensi")
      .upsert(
        {
          siswa_id: user.id,
          tanggal: formattedDate,
          waktu_masuk: now.toISOString(),
          foto_url: foto_base64 || null,
          status: "Hadir",
        },
        { onConflict: "siswa_id,tanggal" }
      )
      .select()
      .single();

    if (presensiError) {
      console.error("[PRESENSI ERROR]", presensiError.message);
      return NextResponse.json(
        { error: "Gagal menyimpan presensi: " + presensiError.message },
        { status: 500 }
      );
    }

    // Update streak terbaru ke profil siswa
    await adminDb
      .from("profil")
      .update({ streak: newStreak })
      .eq("id", user.id);

    // 2. Auto update progres misi "Absen Pagi Tepat Waktu"
    await supabase
      .from("misi_harian")
      .update({ progres_saat_ini: 1 })
      .or(`siswa_id.eq.${user.id},siswa_id.is.null`)
      .ilike("judul", "%absen%");

    // 3. Catat log notifikasi di tabel notifikasi
    try {
      await supabase.from("notifikasi").insert({
        user_id: user.id,
        judul: "Presensi Selfie Berhasil",
        pesan: `Foto presensi kehadiran Anda telah dicatat pada pukul ${formattedTime} WIB.`,
        tipe: "urgent",
        dibaca: false,
      });
    } catch {
      // ignore if table not ready yet
    }

    return NextResponse.json({
      success: true,
      message: "Presensi selfie berhasil dicatat!",
      presensi: {
        waktu: formattedTime,
        tanggal: formattedDate,
        status: "Hadir",
        foto_url: presensiData.foto_url,
      },
      user: {
        nama_lengkap: currentProfil?.nama_lengkap || user.email,
        poin: currentProfil?.poin ?? 1250,
        streak: newStreak,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isCheckedIn: false });
    }

    const formattedDate = new Date().toISOString().split("T")[0];

    const { data: presensi } = await supabase
      .from("presensi")
      .select("*")
      .eq("siswa_id", user.id)
      .eq("tanggal", formattedDate)
      .single();

    if (!presensi) {
      return NextResponse.json({ isCheckedIn: false });
    }

    const formattedTime = new Date(presensi.waktu_masuk).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return NextResponse.json({
      isCheckedIn: true,
      checkInTime: formattedTime,
      foto_url: presensi.foto_url,
    });
  } catch {
    return NextResponse.json({ isCheckedIn: false });
  }
}

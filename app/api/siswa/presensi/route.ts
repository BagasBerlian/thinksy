import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { autoClaimMisi } from "@/app/api/siswa/misi/route";

// ─── Helper: Tanggal hari ini dalam WIB ──────────────────────────────────────
function getTodayWIB(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// ─── POST: Simpan presensi selfie + auto-klaim misi presensi ─────────────────
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
    const todayWIB = getTodayWIB();

    const formattedTime = now.toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Tanggal kemarin di WIB
    const yesterdayWIB = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(Date.now() - 86400000));

    // Cek presensi hari ini & kemarin
    const [{ data: todayPresensi }, { data: yesterdayPresensi }] = await Promise.all([
      supabase
        .from("presensi")
        .select("id")
        .eq("siswa_id", user.id)
        .eq("tanggal", todayWIB)
        .maybeSingle(),
      supabase
        .from("presensi")
        .select("id")
        .eq("siswa_id", user.id)
        .eq("tanggal", yesterdayWIB)
        .maybeSingle(),
    ]);

    const { data: currentProfil } = await supabase
      .from("profil")
      .select("nama_lengkap, poin, streak")
      .eq("id", user.id)
      .single();

    // Hitung streak
    const oldStreak = currentProfil?.streak ?? 0;
    let newStreak = oldStreak;
    if (!todayPresensi) {
      newStreak = yesterdayPresensi ? oldStreak + 1 : 1;
    } else {
      newStreak = Math.max(oldStreak, 1);
    }

    // 1. Simpan presensi (upsert: tidak duplikat jika sudah hadir)
    const { data: presensiData, error: presensiError } = await supabase
      .from("presensi")
      .upsert(
        {
          siswa_id: user.id,
          tanggal: todayWIB,
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

    // Update streak via RPC + fallback (authenticated client)
    try {
      await supabase.rpc("update_streak_siswa", {
        p_siswa_id: user.id,
        p_streak: newStreak,
      });
    } catch {
      await supabase
        .from("profil")
        .update({ streak: newStreak })
        .eq("id", user.id);
    }

    // 2. AUTO-KLAIM misi presensi (server-side, jika belum diklaim)
    const misiClaimResult = await autoClaimMisi(supabase, user.id, "presensi");

    // 3. Catat notifikasi presensi
    try {
      const notifPesan = misiClaimResult.claimed
        ? `Presensi dicatat pukul ${formattedTime} WIB. Misi Presensi selesai! +${misiClaimResult.poinDitambahkan} Poin dikreditkan.`
        : `Foto presensi kehadiran Anda telah dicatat pada pukul ${formattedTime} WIB.`;

      await adminDb.from("notifikasi").insert({
        user_id: user.id,
        judul: "Presensi Selfie Berhasil",
        pesan: notifPesan,
        tipe: "urgent",
        dibaca: false,
      });
    } catch {
      // silent fail
    }

    return NextResponse.json({
      success: true,
      message: "Presensi selfie berhasil dicatat!",
      presensi: {
        waktu: formattedTime,
        tanggal: todayWIB,
        status: "Hadir",
        foto_url: presensiData.foto_url,
      },
      user: {
        nama_lengkap: currentProfil?.nama_lengkap || user.email,
        poin: misiClaimResult.claimed
          ? misiClaimResult.poinTotal
          : currentProfil?.poin ?? 0,
        streak: newStreak,
      },
      // Info auto-klaim misi untuk UI
      misiAutoClaimed: misiClaimResult.claimed,
      misiPoinDitambahkan: misiClaimResult.poinDitambahkan,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server: " + err.message },
      { status: 500 }
    );
  }
}

// ─── GET: Cek status presensi hari ini (WIB) ─────────────────────────────────
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isCheckedIn: false });
    }

    const todayWIB = getTodayWIB();

    const { data: presensi } = await supabase
      .from("presensi")
      .select("*")
      .eq("siswa_id", user.id)
      .eq("tanggal", todayWIB)
      .maybeSingle();

    if (!presensi) {
      return NextResponse.json({ isCheckedIn: false });
    }

    const formattedTime = new Date(presensi.waktu_masuk).toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
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

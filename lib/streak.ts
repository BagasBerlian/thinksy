import { createAdminClient } from "@/lib/supabase/admin";
import { createSystemNotification } from "@/lib/notifications";

export interface StreakUpdateResult {
  streakUpdated: boolean;
  currentStreak: number;
  message?: string;
}

/**
 * Mendapatkan tanggal dalam format YYYY-MM-DD zona waktu Asia/Jakarta (WIB)
 */
export function getWIBDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Mendapatkan tanggal kemarin dalam format YYYY-MM-DD zona waktu WIB
 */
export function getYesterdayWIBDateString(date: Date = new Date()): string {
  const d = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  return getWIBDateString(d);
}

/**
 * Mengecek apakah siswa memiliki aktivitas belajar valid pada tanggal tertentu (WIB)
 * Kriteria aktivitas valid:
 * 1. Presensi kehadiran (tabel 'presensi')
 * 2. Menyelesaikan minimal 1 sesi kuis/latihan (tabel 'sesi' status 'selesai')
 * 3. Melakukan minimal 3 percakapan dengan Tutor AI Sokratik (tabel 'log_ai' fitur 'tutor_sokratik')
 */
export async function hasStudentActivityOnDate(
  siswaId: string,
  dateWIB: string
): Promise<boolean> {
  const adminDb = createAdminClient();
  const dayStart = `${dateWIB}T00:00:00+07:00`;
  const nextDate = new Date(`${dateWIB}T00:00:00+07:00`);
  nextDate.setDate(nextDate.getDate() + 1);
  const dayEnd = nextDate.toISOString().split("T")[0] + "T00:00:00+07:00";

  // 1. Cek Presensi
  const { data: presensi } = await adminDb
    .from("presensi")
    .select("id")
    .eq("siswa_id", siswaId)
    .eq("tanggal", dateWIB)
    .maybeSingle();

  if (presensi) return true;

  // 2. Cek Selesai Kuis / Sesi
  const { data: sesi } = await adminDb
    .from("sesi")
    .select("id")
    .eq("siswa_id", siswaId)
    .eq("status_sesi", "selesai")
    .gte("selesai_pada", dayStart)
    .lt("selesai_pada", dayEnd)
    .limit(1);

  if (sesi && sesi.length > 0) return true;

  // 3. Cek Interaksi AI Sokratik (minimal 3)
  const { count: aiLogCount } = await adminDb
    .from("log_ai")
    .select("id", { count: "exact", head: true })
    .eq("pengguna_id", siswaId)
    .eq("fitur", "tutor_sokratik")
    .gte("dibuat_pada", dayStart)
    .lt("dibuat_pada", dayEnd);

  if ((aiLogCount || 0) >= 3) return true;

  return false;
}

/**
 * Universal Daily Streak Evaluator & Updater
 * Dipanggil saat:
 * 1. Presensi kehadiran berhasil disubmit
 * 2. Siswa menyelesaikan minimal 1 kuis pembelajaran
 * 3. Siswa mencapai minimal 3 interaksi percakapan dengan Tutor AI Sokratik dalam 1 hari
 */
export async function checkAndUpdateDailyStreak(
  siswaId: string,
  triggerSource: "presensi" | "kuis" | "tutor_sokratik"
): Promise<StreakUpdateResult> {
  try {
    const adminDb = createAdminClient();
    const todayWIB = getWIBDateString();
    const yesterdayWIB = getYesterdayWIBDateString();

    const { data: profil } = await adminDb
      .from("profil")
      .select("streak, diperbarui_pada")
      .eq("id", siswaId)
      .single();

    const currentStreak = profil?.streak ?? 0;

    // Periksa apakah sebelum aksi ini, siswa SUDAH memenuhi syarat streak untuk hari ini dari sumber lain
    const dayStart = `${todayWIB}T00:00:00+07:00`;
    const nextDate = new Date(`${todayWIB}T00:00:00+07:00`);
    nextDate.setDate(nextDate.getDate() + 1);
    const dayEnd = nextDate.toISOString().split("T")[0] + "T00:00:00+07:00";

    let priorActivitiesCountToday = 0;

    // 1. Cek Presensi hari ini (jika pemicu BUKAN presensi)
    if (triggerSource !== "presensi") {
      const { data: presensiToday } = await adminDb
        .from("presensi")
        .select("id")
        .eq("siswa_id", siswaId)
        .eq("tanggal", todayWIB)
        .maybeSingle();
      if (presensiToday) priorActivitiesCountToday++;
    }

    // 2. Cek Kuis selesai hari ini (jika pemicu BUKAN kuis)
    if (triggerSource !== "kuis") {
      const { data: sesiToday } = await adminDb
        .from("sesi")
        .select("id")
        .eq("siswa_id", siswaId)
        .eq("status_sesi", "selesai")
        .gte("selesai_pada", dayStart)
        .lt("selesai_pada", dayEnd)
        .limit(1);
      if (sesiToday && sesiToday.length > 0) priorActivitiesCountToday++;
    }

    // 3. Cek AI Chat hari ini (jika pemicu BUKAN tutor_sokratik)
    if (triggerSource !== "tutor_sokratik") {
      const { count: aiLogCount } = await adminDb
        .from("log_ai")
        .select("id", { count: "exact", head: true })
        .eq("pengguna_id", siswaId)
        .eq("fitur", "tutor_sokratik")
        .gte("dibuat_pada", dayStart)
        .lt("dibuat_pada", dayEnd);
      if ((aiLogCount || 0) >= 3) priorActivitiesCountToday++;
    }

    // Jika sudah ada aktivitas lain yang memenuhi syarat streak hari ini,
    // maka streak hari ini sudah dikreditkan.
    if (priorActivitiesCountToday > 0) {
      return {
        streakUpdated: false,
        currentStreak: Math.max(currentStreak, 1),
      };
    }

    // Ini adalah aktivitas pertama yang memenuhi syarat hari ini!
    const wasActiveYesterday = await hasStudentActivityOnDate(siswaId, yesterdayWIB);
    const newStreak = wasActiveYesterday ? Math.max(currentStreak, 0) + 1 : 1;

    // Update streak di DB
    try {
      await adminDb.rpc("update_streak_siswa", {
        p_siswa_id: siswaId,
        p_streak: newStreak,
      });
    } catch {
      await adminDb
        .from("profil")
        .update({ streak: newStreak })
        .eq("id", siswaId);
    }

    // Kirim notifikasi streak
    let sourceLabel = "Presensi Selfie Kehadiran";
    if (triggerSource === "kuis") sourceLabel = "Penyelesaian Kuis Pembelajaran";
    if (triggerSource === "tutor_sokratik") sourceLabel = "3 Percakapan dengan Tutor AI Sokratik";

    await createSystemNotification({
      userId: siswaId,
      judul: `Daily Streak Bertambah! 🔥 (${newStreak} Hari)`,
      pesan: `Hebat! Melalui ${sourceLabel}, streak belajar Anda kini mencapai ${newStreak} hari berturut-turut. Pertahankan semangatmu!`,
      tipe: "success",
    });

    return {
      streakUpdated: true,
      currentStreak: newStreak,
    };
  } catch (err: any) {
    console.error("[STREAK LOGIC ERROR]", err);
    return {
      streakUpdated: false,
      currentStreak: 0,
      message: err.message,
    };
  }
}

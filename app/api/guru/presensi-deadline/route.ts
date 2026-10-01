import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(DATA_DIR, "presensi_deadline_config.json");

interface PresensiDeadlineConfig {
  mode: "sementara" | "selamanya";
  schedule: {
    senin: string;
    selasa: string;
    rabu: string;
    kamis: string;
    jumat: string;
  };
  jam_masuk: string;
  jam_terlambat: string;
  temporaryDate: string; // YYYY-MM-DD
  updatedAt: string;
  updatedBy: string;
}

const DEFAULT_CONFIG: PresensiDeadlineConfig = {
  mode: "selamanya",
  schedule: {
    senin: "07:30",
    selasa: "07:30",
    rabu: "07:30",
    kamis: "07:30",
    jumat: "07:15",
  },
  jam_masuk: "07:00",
  jam_terlambat: "07:15",
  temporaryDate: new Date().toISOString().split("T")[0],
  updatedAt: new Date().toISOString(),
  updatedBy: "Ibu Siti Rahmawati, M.Pd.",
};

function readConfig(): PresensiDeadlineConfig {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), "utf-8");
    return DEFAULT_CONFIG;
  }
  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function writeConfig(cfg: PresensiDeadlineConfig) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), "utf-8");
}

function getDayKey(date: Date): "senin" | "selasa" | "rabu" | "kamis" | "jumat" | "weekend" {
  const day = date.getDay(); // 0 is Sunday, 1 is Monday ...
  switch (day) {
    case 1:
      return "senin";
    case 2:
      return "selasa";
    case 3:
      return "rabu";
    case 4:
      return "kamis";
    case 5:
      return "jumat";
    default:
      return "weekend";
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = readConfig();
    const todayStr = new Date().toISOString().split("T")[0];
    const dayKey = getDayKey(new Date());

    // Check if temporary setting has expired
    const isTemporaryExpired =
      config.mode === "sementara" && config.temporaryDate !== todayStr;

    // Get today's effective deadline
    let todayDeadline = "07:30";
    if (dayKey !== "weekend") {
      todayDeadline = config.schedule[dayKey] || "07:30";
    }

    return NextResponse.json({
      config,
      todayStr,
      dayKey,
      todayDeadline,
      isTemporaryExpired,
      needsReconfiguration: isTemporaryExpired,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { mode, schedule, jam_masuk, jam_terlambat, broadcastNotif } = body;

    const todayStr = new Date().toISOString().split("T")[0];
    const dayKey = getDayKey(new Date());

    const updatedConfig: PresensiDeadlineConfig = {
      mode: mode === "sementara" ? "sementara" : "selamanya",
      schedule: {
        senin: schedule?.senin || "07:30",
        selasa: schedule?.selasa || "07:30",
        rabu: schedule?.rabu || "07:30",
        kamis: schedule?.kamis || "07:30",
        jumat: schedule?.jumat || "07:15",
      },
      jam_masuk: jam_masuk || "07:00",
      jam_terlambat: jam_terlambat || "07:15",
      temporaryDate: todayStr,
      updatedAt: new Date().toISOString(),
      updatedBy: "Ibu Siti Rahmawati, M.Pd.",
    };

    writeConfig(updatedConfig);

    const effectiveToday = dayKey !== "weekend" ? updatedConfig.schedule[dayKey] : "07:30";

    // 1. Update sekolah table jam_tutup so student app backend respects the new deadline
    await adminDb
      .from("sekolah")
      .update({
        jam_masuk: updatedConfig.jam_masuk,
        jam_terlambat: updatedConfig.jam_terlambat,
        jam_tutup: effectiveToday,
      })
      .neq("id", "00000000-0000-0000-0000-000000000000"); // update active school

    // 2. Broadcast notification to EVERY registered student in Supabase
    let notifiedStudentsCount = 0;
    if (broadcastNotif !== false) {
      const { data: students } = await adminDb
        .from("profil")
        .select("id")
        .eq("peran", "siswa");

      if (students && students.length > 0) {
        const modeLabel =
          updatedConfig.mode === "sementara"
            ? "Pengaturan Khusus Hari Ini"
            : "Jadwal Tetap Senin s/d Jumat";

        const notifPayload = students.map((st: any) => ({
          user_id: st.id,
          judul: `⏰ Batas Presensi Hari Ini Ditutup Pukul ${effectiveToday} WIB`,
          pesan: `Pemberitahuan Guru: Batas akhir presensi kehadiran siswa hari ini telah ditetapkan hingga pukul ${effectiveToday} WIB (${modeLabel}). Pastikan Anda melakukan presensi selfie sebelum waktu habis agar tidak tercatat terlambat atau alpha!`,
          tipe: "warning",
          dibaca: false,
          link_url: "/dashboard",
          dibuat_pada: new Date().toISOString(),
        }));

        await adminDb.from("notifikasi").insert(notifPayload);
        notifiedStudentsCount = notifPayload.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Pengaturan waktu absensi berhasil disimpan (${updatedConfig.mode === "sementara" ? "Sementara untuk Hari Ini" : "Selamanya untuk Senin s/d Jumat"})!`,
      notifiedStudentsCount,
      config: updatedConfig,
      effectiveToday,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

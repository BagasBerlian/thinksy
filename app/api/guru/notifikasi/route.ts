import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import fs from "fs";
import path from "path";

// File storage fallback for scheduled notifications and broadcast logs
const DATA_DIR = path.join(process.cwd(), "data");
const SCHEDULED_FILE = path.join(DATA_DIR, "scheduled_notifications.json");
const HISTORY_FILE = path.join(DATA_DIR, "broadcast_history.json");

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SCHEDULED_FILE)) {
    fs.writeFileSync(SCHEDULED_FILE, JSON.stringify([]), "utf-8");
  }
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([]), "utf-8");
  }
}

function getScheduledList(): any[] {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(SCHEDULED_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveScheduledList(list: any[]) {
  ensureDataFiles();
  fs.writeFileSync(SCHEDULED_FILE, JSON.stringify(list, null, 2), "utf-8");
}

function getHistoryList(): any[] {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(HISTORY_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function appendHistory(item: any) {
  ensureDataFiles();
  const list = getHistoryList();
  list.unshift(item);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(list.slice(0, 50), null, 2), "utf-8");
}

// Preset Notification Templates
export const NOTIFICATION_TEMPLATES = [
  {
    id: "tpl-1",
    title: "⏰ Pengingat Absensi Pagi",
    desc: "Batas waktu presensi kehadiran pagi akan segera ditutup. Silakan lakukan absensi selfie sekarang agar tidak tercatat terlambat atau alpha!",
    type: "warning",
    target: "all",
    link_url: "/dashboard",
    category: "Absensi & Kehadiran",
  },
  {
    id: "tpl-2",
    title: "📝 Pengumuman Ulangan Harian Bab Aktif",
    desc: "Ulangan Harian telah dibuka di menu Asesmen Resmi (AKU LULUS). Masukkan token resmi dari Pengawas dan kerjakan dengan mandiri serta jujur.",
    type: "info",
    target: "all",
    link_url: "/ujian",
    category: "Ujian & Asesmen",
  },
  {
    id: "tpl-3",
    title: "📚 Pengumpulan Tugas & PR Hari Ini",
    desc: "Bagi siswa kelas 8, batas akhir unggah tugas catatan/latihan adalah pukul 17:00 WIB sore ini. Pastikan seluruh berkas sudah terkirim.",
    type: "warning",
    target: "all",
    link_url: "/belajar",
    category: "Tugas & PR",
  },
  {
    id: "tpl-4",
    title: "🌟 Apresiasi Prestasi & Juara Peringkat",
    desc: "Selamat kepada para siswa yang memuncaki Leaderboard kelas pekan ini! Terus pertahankan semangat belajar dan raih bonus poin prestasi.",
    type: "success",
    target: "all",
    link_url: "/dashboard",
    category: "Motivasi",
  },
  {
    id: "tpl-5",
    title: "🎯 Selesaikan Misi Harian Sebelum Reset",
    desc: "Jangan lupa selesaikan seluruh tantangan misi harian Anda sebelum jam 00:00 WIB agar reward poin tidak hangus.",
    type: "info",
    target: "all",
    link_url: "/dashboard",
    category: "Misi Harian",
  },
  {
    id: "tpl-6",
    title: "⚠️ Jadwal Sesi Remedial & Pengayaan",
    desc: "Siswa dengan skor di bawah KKM 75 diwajibkan mengikuti pendampingan belajar Sokratik AI dan konsultasi materi bersama Guru di ruang kelas.",
    type: "urgent",
    target: "all",
    link_url: "/belajar",
    category: "Remedial",
  },
  {
    id: "tpl-7",
    title: "📢 Upacara Bendera & Kelengkapan Seragam",
    desc: "Seluruh siswa wajib hadir tepat pukul 06:45 WIB dengan seragam resmi lengkap (topi, dasi, ikat pinggang, dan sepatu hitam polos).",
    type: "info",
    target: "all",
    link_url: "/dashboard",
    category: "Pengumuman",
  },
];

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process any due scheduled notifications before returning
    const scheduled = getScheduledList();
    const now = new Date();
    const remaining: any[] = [];
    const due: any[] = [];

    scheduled.forEach((s) => {
      if (new Date(s.scheduledTime) <= now && s.status === "scheduled") {
        due.push(s);
      } else {
        remaining.push(s);
      }
    });

    if (due.length > 0) {
      const adminDb = createAdminClient();
      for (const item of due) {
        // Send to students
        await broadcastNotificationToStudents(adminDb, item);
        appendHistory({
          ...item,
          status: "broadcasted",
          broadcastedAt: now.toISOString(),
          isFromSchedule: true,
        });
      }
      saveScheduledList(remaining);
    }

    return NextResponse.json({
      templates: NOTIFICATION_TEMPLATES,
      scheduled: remaining,
      history: getHistoryList(),
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
    const { action } = body;

    // ACTION 1: INSTANT BROADCAST (MANUAL / DADAKAN)
    if (action === "broadcast_instant") {
      const { title, desc, type, target, link_url } = body;
      if (!title || !desc) {
        return NextResponse.json({ error: "Judul dan Pesan notifikasi wajib diisi!" }, { status: 400 });
      }

      const notifItem = {
        id: `bc-${Date.now()}`,
        title,
        desc,
        type: type || "info",
        target: target || "all",
        link_url: link_url || "/dashboard",
        createdAt: new Date().toISOString(),
        sender: "Guru Pengajar (Ibu Siti Rahmawati, M.Pd.)",
      };

      const count = await broadcastNotificationToStudents(adminDb, notifItem);
      appendHistory({
        ...notifItem,
        status: "sent",
        recipientCount: count,
      });

      return NextResponse.json({
        success: true,
        message: `Notifikasi berhasil disiarkan secara instan ke ${count} siswa terdaftar!`,
        data: notifItem,
      });
    }

    // ACTION 2: SCHEDULE NOTIFICATION
    if (action === "schedule_notif") {
      const { title, desc, type, target, scheduledTime, link_url } = body;
      if (!title || !desc || !scheduledTime) {
        return NextResponse.json({ error: "Judul, pesan, dan waktu jadwal wajib diisi!" }, { status: 400 });
      }

      const scheduledItem = {
        id: `sch-${Date.now()}`,
        title,
        desc,
        type: type || "info",
        target: target || "all",
        scheduledTime,
        link_url: link_url || "/dashboard",
        createdAt: new Date().toISOString(),
        status: "scheduled",
        sender: "Guru Pengajar (Ibu Siti Rahmawati, M.Pd.)",
      };

      const current = getScheduledList();
      current.push(scheduledItem);
      saveScheduledList(current);

      return NextResponse.json({
        success: true,
        message: `Notifikasi berhasil dijadwalkan untuk tanggal ${new Date(scheduledTime).toLocaleString("id-ID")} WIB!`,
        data: scheduledItem,
      });
    }

    // ACTION 3: DELETE / CANCEL SCHEDULED NOTIFICATION
    if (action === "delete_scheduled") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: "ID jadwal wajib diberikan" }, { status: 400 });
      }

      const current = getScheduledList();
      const updated = current.filter((s) => s.id !== id);
      saveScheduledList(updated);

      return NextResponse.json({
        success: true,
        message: "Jadwal notifikasi berhasil dibatalkan.",
      });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function broadcastNotificationToStudents(adminDb: any, item: any): Promise<number> {
  try {
    let studentIds: string[] = [];

    if (item.target === "all") {
      const { data: students } = await adminDb
        .from("profil")
        .select("id")
        .eq("peran", "siswa");
      studentIds = (students || []).map((s: any) => s.id);
    } else if (item.target?.startsWith("Kelas ")) {
      // Find class ID
      const { data: cls } = await adminDb
        .from("kelas")
        .select("id")
        .eq("nama_kelas", item.target)
        .maybeSingle();

      if (cls) {
        const { data: members } = await adminDb
          .from("anggota_kelas")
          .select("siswa_id")
          .eq("kelas_id", cls.id);
        studentIds = (members || []).map((m: any) => m.siswa_id);
      }
    } else if (item.target) {
      studentIds = [item.target];
    }

    if (studentIds.length === 0) {
      // Fallback: pick all students
      const { data: allSt } = await adminDb
        .from("profil")
        .select("id")
        .eq("peran", "siswa");
      studentIds = (allSt || []).map((s: any) => s.id);
    }

    const rowsToInsert = studentIds.map((sid) => ({
      user_id: sid,
      judul: item.title,
      pesan: item.desc,
      tipe: item.type || "info",
      dibaca: false,
      link_url: item.link_url || null,
      dibuat_pada: new Date().toISOString(),
    }));

    if (rowsToInsert.length > 0) {
      await adminDb.from("notifikasi").insert(rowsToInsert);
    }

    return rowsToInsert.length;
  } catch (err) {
    console.error("Error broadcasting to students:", err);
    return 0;
  }
}

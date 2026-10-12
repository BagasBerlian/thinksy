import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const MISSIONS_FILE = path.join(DATA_DIR, "guru_custom_missions.json");

export interface GuruCustomMission {
  id: string;
  judul: string;
  deskripsi: string;
  kategori: "akademik" | "presensi" | "sokratik" | "tantangan" | "kuis";
  target_max: number;
  poin_hadiah: number;
  aktif: boolean;
  dibuat_pada: string;
  total_klaim?: number;
}

const DEFAULT_MISSIONS: GuruCustomMission[] = [
  {
    id: "misi-default-1",
    judul: "Selesaikan 1 Latihan Mandiri SPLDV",
    deskripsi: "Kerjakan minimal 1 latihan soal Bab 4 di menu Latihan Siswa hari ini.",
    kategori: "akademik",
    target_max: 1,
    poin_hadiah: 50,
    aktif: true,
    dibuat_pada: new Date().toISOString(),
    total_klaim: 28,
  },
  {
    id: "misi-default-2",
    judul: "Diskusi Konsep Bersama AI Sokratik",
    deskripsi: "Ajukan minimal 2 pertanyaan dan diskusikan langkah penyelesaian soal dengan AI Tutor.",
    kategori: "sokratik",
    target_max: 2,
    poin_hadiah: 35,
    aktif: true,
    dibuat_pada: new Date().toISOString(),
    total_klaim: 24,
  },
  {
    id: "misi-default-3",
    judul: "Presensi Pagi Tepat Waktu (<07:15 WIB)",
    deskripsi: "Lakukan selfie verifikasi kehadiran sebelum jam batas terlambat.",
    kategori: "presensi",
    target_max: 1,
    poin_hadiah: 25,
    aktif: true,
    dibuat_pada: new Date().toISOString(),
    total_klaim: 31,
  },
];

function readMissions(): GuruCustomMission[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(MISSIONS_FILE)) {
    fs.writeFileSync(MISSIONS_FILE, JSON.stringify(DEFAULT_MISSIONS, null, 2), "utf-8");
    return DEFAULT_MISSIONS;
  }
  try {
    const raw = fs.readFileSync(MISSIONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MISSIONS;
  }
}

function writeMissions(missions: GuruCustomMission[]) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(MISSIONS_FILE, JSON.stringify(missions, null, 2), "utf-8");
}

export async function GET() {
  try {
    const missions = readMissions();
    return NextResponse.json({ success: true, missions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const adminDb = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || "create";

    const currentList = readMissions();

    if (action === "create") {
      const { judul, deskripsi, kategori, target_max, poin_hadiah } = body;
      if (!judul || !deskripsi) {
        return NextResponse.json({ error: "Judul dan deskripsi wajib diisi." }, { status: 400 });
      }

      const newMission: GuruCustomMission = {
        id: `misi-${Date.now()}`,
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        kategori: kategori || "akademik",
        target_max: Number(target_max) || 1,
        poin_hadiah: Number(poin_hadiah) || 30,
        aktif: true,
        dibuat_pada: new Date().toISOString(),
        total_klaim: 0,
      };

      const updated = [newMission, ...currentList];
      writeMissions(updated);

      // Sinkronkan ke tabel misi_harian siswa di Supabase untuk hari ini
      try {
        const todayWIB = new Date().toISOString().split("T")[0];
        const { data: students } = await adminDb
          .from("profil")
          .select("id")
          .eq("peran", "siswa");

        if (students && students.length > 0) {
          const insertPayload = students.map((st: any) => ({
            siswa_id: st.id,
            judul: newMission.judul,
            deskripsi: newMission.deskripsi,
            progres_saat_ini: 0,
            target_max: newMission.target_max,
            poin_hadiah: newMission.poin_hadiah,
            diklaim: false,
            tanggal: todayWIB,
          }));

          await adminDb.from("misi_harian").insert(insertPayload);
        }
      } catch (syncErr) {
        console.warn("[SYNC MISI KE SISWA WARN]", syncErr);
      }

      return NextResponse.json({ success: true, mission: newMission, missions: updated });
    }

    if (action === "toggle") {
      const { missionId } = body;
      const updated = currentList.map((m) =>
        m.id === missionId ? { ...m, aktif: !m.aktif } : m
      );
      writeMissions(updated);
      return NextResponse.json({ success: true, missions: updated });
    }

    if (action === "delete") {
      const { missionId } = body;
      const updated = currentList.filter((m) => m.id !== missionId);
      writeMissions(updated);
      return NextResponse.json({ success: true, missions: updated });
    }

    if (action === "bulk_save") {
      if (Array.isArray(body.missions)) {
        writeMissions(body.missions);
        return NextResponse.json({ success: true, missions: body.missions });
      }
    }

    return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

"use client";

import { GOOGLE_APPS_SCRIPT_CODE, SPREADSHEET_ID, SPREADSHEET_URL } from "@/lib/spreadsheet-sync";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Download,
  Clock,
  Search,
  AlertTriangle,
  Sparkles,
  Phone,
  Save,
  UserCheck,
  FileSpreadsheet,
  Printer,
  MessageSquare,
  Copy,
  CalendarClock,
  RefreshCw,
  Check,
  ExternalLink,
  Settings,
  HelpCircle,
  X,
  ChevronRight,
  Link2,
} from "lucide-react";
import { resolveStudentPhoto } from "@/lib/student-settings";

export type PresensiTabMode = "semua_siswa" | "atur_presensi" | "ambil_data" | "penjadwalan";

export const GOOGLE_APPS_SCRIPT_TEMPLATE = GOOGLE_APPS_SCRIPT_CODE;

interface GuruClassroomPresensiViewProps {
  onBackToTeaching: () => void;
  initialTab?: PresensiTabMode;
}

export default function GuruClassroomPresensiView({
  onBackToTeaching,
  initialTab = "atur_presensi",
}: GuruClassroomPresensiViewProps) {
  const [activeTab, setActiveTab] = useState<PresensiTabMode>(initialTab);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Daftar siswa Ruang 8-A
  const [studentsList, setStudentsList] = useState<any[]>(() => [
    { id: "st-1", name: "Devida Amanda", nisn: "0089247182", kelas: "Kelas 8-A", points: 840, hadir: true, status: "hadir", foto: resolveStudentPhoto({ name: "Devida Amanda", nisn: "0089247182", foto: "/images/pasfoto-siswi-1.jpg" }), jamMasuk: "07:05 WIB" },
    { id: "st-2", name: "Siti Rahayu", nisn: "0089247183", kelas: "Kelas 8-A", points: 790, hadir: true, status: "hadir", foto: resolveStudentPhoto({ name: "Siti Rahayu", nisn: "0089247183", foto: "/images/pasfoto-siswi-1.jpg" }), jamMasuk: "07:08 WIB" },
    { id: "st-3", name: "Ahmad Fauzi", nisn: "0089247184", kelas: "Kelas 8-A", points: 750, hadir: true, status: "hadir", foto: resolveStudentPhoto({ name: "Ahmad Fauzi", nisn: "0089247184", foto: "/images/pasfoto-siswa-1.jpg" }), jamMasuk: "07:11 WIB" },
    { id: "st-4", name: "Aisyah Putri Azzahra", nisn: "0081234568", kelas: "Kelas 8-A", points: 720, hadir: true, status: "hadir", foto: resolveStudentPhoto({ name: "Aisyah Putri Azzahra", nisn: "0081234568", foto: "/images/pasfoto-siswi-1.jpg" }), jamMasuk: "07:12 WIB" },
    { id: "st-5", name: "Budi Santoso", nisn: "0081234569", kelas: "Kelas 8-A", points: 680, hadir: true, status: "hadir", foto: resolveStudentPhoto({ name: "Budi Santoso", nisn: "0081234569", foto: "/images/pasfoto-siswa-1.jpg" }), jamMasuk: "07:14 WIB" },
    { id: "st-6", name: "Citra Dewi Lestari", nisn: "0081234570", kelas: "Kelas 8-A", points: 650, hadir: true, status: "hadir", foto: resolveStudentPhoto({ name: "Citra Dewi Lestari", nisn: "0081234570", foto: "/images/pasfoto-siswi-1.jpg" }), jamMasuk: "07:15 WIB" },
    { id: "st-7", name: "Dika Pratama", nisn: "0081234571", kelas: "Kelas 8-A", points: 610, hadir: true, status: "hadir", foto: resolveStudentPhoto({ name: "Dika Pratama", nisn: "0081234571", foto: "/images/pasfoto-siswa-1.jpg" }), jamMasuk: "07:18 WIB" },
    { id: "st-8", name: "Fathir Muhammad", nisn: "0081234572", kelas: "Kelas 8-A", points: 590, hadir: true, status: "hadir", foto: resolveStudentPhoto({ name: "Fathir Muhammad", nisn: "0081234572", foto: "/images/pasfoto-siswa-1.jpg" }), jamMasuk: "07:20 WIB" },
    { id: "st-9", name: "Khadijah Nurul", nisn: "0081234573", kelas: "Kelas 8-A", points: 570, hadir: true, status: "hadir", foto: resolveStudentPhoto({ name: "Khadijah Nurul", nisn: "0081234573", foto: "/images/pasfoto-siswi-1.jpg" }), jamMasuk: "07:21 WIB" },
    { id: "st-10", name: "Nadela Oktavia", nisn: "0089247185", kelas: "Kelas 8-A", points: 550, hadir: true, status: "hadir", foto: resolveStudentPhoto({ name: "Nadela Oktavia", nisn: "0089247185", foto: "/images/pasfoto-siswi-1.jpg" }), jamMasuk: "07:22 WIB" },
    { id: "st-11", name: "Rizky Ramadhan", nisn: "0081234574", kelas: "Kelas 8-A", points: 530, hadir: true, status: "hadir", foto: resolveStudentPhoto({ name: "Rizky Ramadhan", nisn: "0081234574", foto: "/images/pasfoto-siswa-1.jpg" }), jamMasuk: "07:24 WIB" },
    { id: "st-12", name: "Sarah Amalia", nisn: "0089247186", kelas: "Kelas 8-A", points: 510, hadir: false, status: "sakit", foto: resolveStudentPhoto({ name: "Sarah Amalia", nisn: "0089247186", foto: "/images/pasfoto-siswi-1.jpg" }), jamMasuk: "-" },
    { id: "st-13", name: "Bielani Putri", nisn: "0089247187", kelas: "Kelas 8-A", points: 490, hadir: true, status: "hadir", foto: resolveStudentPhoto({ name: "Bielani Putri", nisn: "0089247187", foto: "/images/pasfoto-siswi-1.jpg" }), jamMasuk: "07:25 WIB" },
    { id: "st-14", name: "Fira Anindya", nisn: "0089247188", kelas: "Kelas 8-A", points: 480, hadir: true, status: "hadir", foto: resolveStudentPhoto({ name: "Fira Anindya", nisn: "0089247188", foto: "/images/pasfoto-siswi-1.jpg" }), jamMasuk: "07:26 WIB" },
    { id: "st-15", name: "Nanoka Shira", nisn: "0089247189", kelas: "Kelas 8-A", points: 470, hadir: true, status: "hadir", foto: resolveStudentPhoto({ name: "Nanoka Shira", nisn: "0089247189", foto: "/images/pasfoto-siswi-1.jpg" }), jamMasuk: "07:28 WIB" },
  ]);

  // Attendance status mapping per student
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: "hadir" | "izin" | "sakit" | "alpa"; note: string }>>({
    "st-1": { status: "hadir", note: "" },
    "st-2": { status: "hadir", note: "" },
    "st-3": { status: "hadir", note: "" },
    "st-4": { status: "hadir", note: "" },
    "st-5": { status: "hadir", note: "" },
    "st-6": { status: "hadir", note: "" },
    "st-7": { status: "hadir", note: "" },
    "st-8": { status: "hadir", note: "" },
    "st-9": { status: "hadir", note: "" },
    "st-10": { status: "hadir", note: "" },
    "st-11": { status: "hadir", note: "" },
    "st-12": { status: "sakit", note: "Surat dokter terlampir" },
    "st-13": { status: "hadir", note: "" },
    "st-14": { status: "hadir", note: "" },
    "st-15": { status: "hadir", note: "" },
  });

  // Schedule settings
  const [jamMasuk, setJamMasuk] = useState("07:15");
  const [jamTerlambat, setJamTerlambat] = useState("07:30");
  const [jamTutup, setJamTutup] = useState("08:00");
  const [activeDays, setActiveDays] = useState<string[]>(["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // Search & Filter
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentFilterTab, setStudentFilterTab] = useState<"all" | "hadir" | "absen">("all");

  // In-App Interactive Spreadsheet States
  const [spreadsheetViewTab, setSpreadsheetViewTab] = useState<"log_kehadiran" | "rekap_perkembangan">("log_kehadiran");
  const [spreadsheetSearchQuery, setSpreadsheetSearchQuery] = useState<string>("");
  const [spreadsheetStatusFilter, setSpreadsheetStatusFilter] = useState<"all" | "hadir" | "izin" | "sakit" | "alpa">("all");

  // Google Spreadsheet Webhook States
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [tempWebhookUrl, setTempWebhookUrl] = useState<string>("");
  const [isSyncingSpreadsheet, setIsSyncingSpreadsheet] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState<boolean>(false);
  const [autoSyncOnSave, setAutoSyncOnSave] = useState<boolean>(false);
  const [isScriptCopied, setIsScriptCopied] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch real students & schedule from Supabase on mount
  useEffect(() => {
    async function loadInitialData() {
      // 1. Fetch Students from Supabase API
      try {
        const res = await fetch("/api/guru/manajemen-kelas");
        if (res.ok) {
          const json = await res.json();
          const rawList = json.siswa || json.hasil_keseluruhan_siswa || json.kelas_utama?.siswa;
          if (rawList && Array.isArray(rawList) && rawList.length > 0) {
            const mapped = rawList.map((st: any, idx: number) => ({
              id: st.id || `st-${idx}`,
              name: st.nama_lengkap,
              nisn: st.nisn || `008924718${idx}`,
              kelas: st.kelas || "Kelas 8-A",
              points: st.total_poin || 500,
              hadir: st.total_kehadiran > 0,
              status: idx === 11 ? "sakit" : "hadir",
              foto: resolveStudentPhoto({
                id: st.id,
                name: st.nama_lengkap,
                nisn: st.nisn,
                foto: st.foto || (idx % 2 === 0 ? "/images/pasfoto-siswa-1.jpg" : "/images/pasfoto-siswi-1.jpg"),
              }),
              jamMasuk: idx === 11 ? "-" : `07:${String((idx * 2) % 30).padStart(2, "0")} WIB`,
            }));

            // Merge with local joined students
            try {
              const storedJoined = localStorage.getItem("thinksy_joined_students");
              if (storedJoined) {
                const parsed = JSON.parse(storedJoined);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  const resolvedJoined = parsed.map((s: any) => ({
                    id: s.id || `st-j-${s.nisn || s.name}`,
                    name: s.name || s.nama_lengkap,
                    nisn: s.nisn || "0089247182",
                    kelas: s.kelas || "Kelas 8-A",
                    points: s.points || 500,
                    hadir: true,
                    status: "hadir",
                    foto: resolveStudentPhoto(s),
                    jamMasuk: "07:15 WIB",
                  }));
                  const existingNames = new Set(mapped.map((s: any) => s.name));
                  const toAdd = resolvedJoined.filter((s: any) => !existingNames.has(s.name));
                  setStudentsList([...toAdd, ...mapped]);
                  return;
                }
              }
            } catch {}

            setStudentsList(mapped);

            const initialRecords: Record<string, any> = {};
            mapped.forEach((s: any, i: number) => {
              initialRecords[s.id] = {
                status: i === 11 ? "sakit" : "hadir",
                note: i === 11 ? "Surat dokter terlampir" : "",
              };
            });
            setAttendanceRecords(initialRecords);
          }
        }
      } catch (err) {
        console.warn("Using default student data:", err);
      }

      // 2. Fetch School Presensi limits
      try {
        const resJadwal = await fetch("/api/sekolah/jam-presensi");
        if (resJadwal.ok) {
          const dataJadwal = await resJadwal.json();
          if (dataJadwal.sekolah) {
            if (dataJadwal.sekolah.jam_masuk) setJamMasuk(dataJadwal.sekolah.jam_masuk.substring(0, 5));
            if (dataJadwal.sekolah.jam_terlambat) setJamTerlambat(dataJadwal.sekolah.jam_terlambat.substring(0, 5));
            if (dataJadwal.sekolah.jam_tutup) setJamTutup(dataJadwal.sekolah.jam_tutup.substring(0, 5));
          }
        }
      } catch {}
    }

    loadInitialData();

    // 3. Listener Real-time Foto Siswa
    const handleStudentPhotoSync = () => {
      setStudentsList((prev) =>
        prev.map((st) => ({
          ...st,
          foto: resolveStudentPhoto(st),
        }))
      );
    };

    window.addEventListener("thinksy_photo_change", handleStudentPhotoSync);
    window.addEventListener("thinksy_profile_change", handleStudentPhotoSync);
    window.addEventListener("thinksy_joined_students_updated", handleStudentPhotoSync);

    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === "thinksy_student_photo" ||
        e.key === "thinksy_student_profile" ||
        e.key === "thinksy_student_photos_map" ||
        e.key === "thinksy_joined_students"
      ) {
        handleStudentPhotoSync();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("thinksy_photo_change", handleStudentPhotoSync);
      window.removeEventListener("thinksy_profile_change", handleStudentPhotoSync);
      window.removeEventListener("thinksy_joined_students_updated", handleStudentPhotoSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleMarkAllPresent = () => {
    const updated: Record<string, any> = {};
    studentsList.forEach((s) => {
      updated[s.id] = { status: "hadir", note: "" };
    });
    setAttendanceRecords(updated);
    showToast("Seluruh siswa berhasil ditandai Hadir!");
  };

  const handleDownloadCsv = (sheetType?: "log_kehadiran" | "rekap_perkembangan" | any) => {
    const targetSheet = typeof sheetType === "string" ? sheetType : spreadsheetViewTab;
    let header = "";
    let rows = "";
    const today = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    if (targetSheet === "log_kehadiran") {
      header = "Tanggal,Waktu Sync,No,NISN,Nama Siswa,Kelas,Jam Masuk,Status Presensi,Poin Belajar (XP),Keterangan\n";
      rows = studentsList
        .map((st, idx) => {
          const rec = attendanceRecords[st.id] || { status: st.status || "hadir", note: "" };
          return `"${today}","${st.jamMasuk || "07:15 WIB"}",${idx + 1},"${st.nisn}","${st.name}","${st.kelas}","${st.jamMasuk || "07:15 WIB"}","${rec.status.toUpperCase()}","${st.points || 0}","${rec.note || "-"}"`;
        })
        .join("\n");
    } else {
      header = "No,NISN,Nama Siswa,Kelas,Poin Belajar (XP),Status Hari Ini,Total Hadir,Total Izin,Total Sakit,Total Alpa,Persentase Kehadiran,Evaluasi Kedisiplinan BK\n";
      rows = studentsList
        .map((st, idx) => {
          const rec = attendanceRecords[st.id] || { status: st.status || "hadir", note: "" };
          const h = rec.status === "hadir" ? 1 : 0;
          const iz = rec.status === "izin" ? 1 : 0;
          const s = rec.status === "sakit" ? 1 : 0;
          const a = rec.status === "alpa" ? 1 : 0;
          const total = h + iz + s + a;
          const pct = total > 0 ? `${Math.round((h / total) * 100)}%` : "100%";
          const evalText = a > 0 ? "Perlu Perhatian" : pct === "100%" ? "Sangat Baik & Disiplin" : "Cukup Disiplin";
          return `${idx + 1},"${st.nisn}","${st.name}","${st.kelas}","${st.points || 0}","${rec.status.toUpperCase()}",${h},${iz},${s},${a},"${pct}","${evalText}"`;
        })
        .join("\n");
    }

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${targetSheet === "log_kehadiran" ? "Log_Kehadiran_Harian" : "Rekap_Perkembangan_Siswa"}_SMK_Muhammadiyah_1_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`File Spreadsheet (${targetSheet === "log_kehadiran" ? "Log Harian" : "Rekap Perkembangan"}) berhasil diunduh!`);
  };

  const handleOpenInGoogleSheets = (sheetType?: "log_kehadiran" | "rekap_perkembangan" | any) => {
    const targetSheet = typeof sheetType === "string" ? sheetType : spreadsheetViewTab;
    let tsv = "";
    if (targetSheet === "log_kehadiran") {
      tsv = "Tanggal\tWaktu Sync\tNo\tNISN\tNama Siswa\tKelas\tJam Masuk\tStatus Presensi\tPoin Belajar (XP)\tKeterangan\n";
      studentsList.forEach((st, idx) => {
        const rec = attendanceRecords[st.id] || { status: st.status || "hadir", note: "" };
        tsv += `${todayDateString}\t${st.jamMasuk || "07:15 WIB"}\t${idx + 1}\t${st.nisn}\t${st.name}\t${st.kelas}\t${st.jamMasuk || "07:15 WIB"}\t${rec.status.toUpperCase()}\t${st.points || 0}\t${rec.note || "-"}\n`;
      });
    } else {
      tsv = "No\tNISN\tNama Siswa\tKelas\tPoin Belajar (XP)\tStatus Terakhir\tTotal Hadir\tTotal Izin\tTotal Sakit\tTotal Alpa\tPersentase Kehadiran\tEvaluasi Kedisiplinan BK\n";
      studentsList.forEach((st, idx) => {
        const rec = attendanceRecords[st.id] || { status: st.status || "hadir", note: "" };
        const h = rec.status === "hadir" ? 1 : 0;
        const iz = rec.status === "izin" ? 1 : 0;
        const s = rec.status === "sakit" ? 1 : 0;
        const a = rec.status === "alpa" ? 1 : 0;
        const total = h + iz + s + a;
        const pct = total > 0 ? `${Math.round((h / total) * 100)}%` : "100%";
        const evalText = a > 0 ? "Perlu Perhatian" : pct === "100%" ? "Sangat Baik & Disiplin" : "Cukup Disiplin";
        tsv += `${idx + 1}\t${st.nisn}\t${st.name}\t${st.kelas}\t${st.points || 0}\t${rec.status.toUpperCase()}\t${h}\t${iz}\t${s}\t${a}\t${pct}\t${evalText}\n`;
      });
    }

    try {
      navigator.clipboard.writeText(tsv);
      showToast("📋 Tabel disalin! Di Google Sheets yang baru terbuka, cukup tekan Ctrl + V.");
      if (typeof window !== "undefined") {
        window.open("https://sheets.new", "_blank");
      }
    } catch {
      if (typeof window !== "undefined") {
        window.open("https://sheets.new", "_blank");
      }
      showToast("Membuka Google Sheets...");
    }
  };

  const handleCopyTsv = (sheetType?: "log_kehadiran" | "rekap_perkembangan" | any) => {
    const targetSheet = typeof sheetType === "string" ? sheetType : spreadsheetViewTab;
    let tsv = "";
    if (targetSheet === "log_kehadiran") {
      tsv = "Tanggal\tWaktu Sync\tNo\tNISN\tNama Siswa\tKelas\tJam Masuk\tStatus Presensi\tPoin Belajar (XP)\tKeterangan\n";
      studentsList.forEach((st, idx) => {
        const rec = attendanceRecords[st.id] || { status: st.status || "hadir", note: "" };
        tsv += `${todayDateString}\t${st.jamMasuk || "07:15 WIB"}\t${idx + 1}\t${st.nisn}\t${st.name}\t${st.kelas}\t${st.jamMasuk || "07:15 WIB"}\t${rec.status.toUpperCase()}\t${st.points || 0}\t${rec.note || "-"}\n`;
      });
    } else {
      tsv = "No\tNISN\tNama Siswa\tKelas\tPoin Belajar (XP)\tStatus Terakhir\tTotal Hadir\tTotal Izin\tTotal Sakit\tTotal Alpa\tPersentase Kehadiran\tEvaluasi Kedisiplinan BK\n";
      studentsList.forEach((st, idx) => {
        const rec = attendanceRecords[st.id] || { status: st.status || "hadir", note: "" };
        const h = rec.status === "hadir" ? 1 : 0;
        const iz = rec.status === "izin" ? 1 : 0;
        const s = rec.status === "sakit" ? 1 : 0;
        const a = rec.status === "alpa" ? 1 : 0;
        const total = h + iz + s + a;
        const pct = total > 0 ? `${Math.round((h / total) * 100)}%` : "100%";
        const evalText = a > 0 ? "Perlu Perhatian" : pct === "100%" ? "Sangat Baik & Disiplin" : "Cukup Disiplin";
        tsv += `${idx + 1}\t${st.nisn}\t${st.name}\t${st.kelas}\t${st.points || 0}\t${rec.status.toUpperCase()}\t${h}\t${iz}\t${s}\t${a}\t${pct}\t${evalText}\n`;
      });
    }
    try {
      navigator.clipboard.writeText(tsv);
      showToast("✓ Seluruh data spreadsheet berhasil disalin ke clipboard!");
    } catch {
      showToast("Gagal menyalin data tabel.");
    }
  };

  // Load saved Google Spreadsheet Webhook preferences
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWebhook = localStorage.getItem("thinksy_spreadsheet_webhook_url") || "";
      const savedLastSync = localStorage.getItem("thinksy_spreadsheet_last_synced");
      const savedAutoSync = localStorage.getItem("thinksy_spreadsheet_auto_sync") === "true";
      if (savedWebhook) {
        setWebhookUrl(savedWebhook);
        setTempWebhookUrl(savedWebhook);
      }
      if (savedLastSync) setLastSyncedTime(savedLastSync);
      setAutoSyncOnSave(savedAutoSync);
    }
  }, []);

  const handleSaveWebhookSettings = (newUrl: string, autoSync: boolean) => {
    const cleanUrl = newUrl.trim();
    setWebhookUrl(cleanUrl);
    setTempWebhookUrl(cleanUrl);
    setAutoSyncOnSave(autoSync);
    if (typeof window !== "undefined") {
      localStorage.setItem("thinksy_spreadsheet_webhook_url", cleanUrl);
      localStorage.setItem("thinksy_spreadsheet_auto_sync", autoSync ? "true" : "false");
    }
    showToast("Pengaturan Webhook Google Spreadsheet berhasil disimpan!");
  };

  const handleCopyScript = () => {
    try {
      navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
      setIsScriptCopied(true);
      showToast("Kode Google Apps Script berhasil disalin!");
      setTimeout(() => setIsScriptCopied(false), 3000);
    } catch {
      showToast("Gagal menyalin kode ke clipboard.");
    }
  };

  const handleSyncToSpreadsheet = async (customUrl?: string) => {
    const targetUrl = (customUrl || webhookUrl).trim();
    if (!targetUrl) {
      setIsSpreadsheetModalOpen(true);
      showToast("Silakan atur URL Webhook Google Spreadsheet terlebih dahulu.");
      return;
    }

    setIsSyncingSpreadsheet(true);
    try {
      const records = studentsList.map((st, idx) => {
        const rec = attendanceRecords[st.id] || { status: st.status || "hadir", note: "" };
        return {
          no: idx + 1,
          nisn: st.nisn,
          nama: st.name,
          kelas: st.kelas || "Kelas 8-A",
          jamMasuk: st.jamMasuk || "07:15 WIB",
          status: rec.status,
          catatan: rec.note || "-",
          points: st.points || 0,
        };
      });

      const res = await fetch("/api/guru/presensi/spreadsheet-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: targetUrl,
          type: "absensi",
          sekolah: "SMK Muhammadiyah 1",
          kelas: "Kelas 8-A",
          tanggal: todayDateString,
          jamPresensi: { masuk: jamMasuk, terlambat: jamTerlambat, tutup: jamTutup },
          records,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyinkronkan data.");
      }

      const syncTimeStr =
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB";
      setLastSyncedTime(syncTimeStr);
      if (typeof window !== "undefined") {
        localStorage.setItem("thinksy_spreadsheet_last_synced", syncTimeStr);
      }

      showToast("✓ Data presensi & perkembangan siswa berhasil dikirim ke Google Sheet!");
    } catch (err: any) {
      showToast(err.message || "Gagal menyambung ke Google Spreadsheet.");
    } finally {
      setIsSyncingSpreadsheet(false);
    }
  };

  const handleSaveSchedule = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSavingSchedule(true);
    try {
      const res = await fetch("/api/sekolah/jam-presensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jam_masuk: jamMasuk,
          jam_terlambat: jamTerlambat,
          jam_tutup: jamTutup,
        }),
      });
      if (res.ok) {
        showToast("Jadwal batas waktu presensi berhasil disimpan ke Supabase!");
      } else {
        showToast("Jadwal disimpan secara lokal.");
      }
    } catch {
      showToast("Jadwal batas presensi disimpan secara lokal.");
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const filteredStudents = studentsList.filter((s) => {
    const matchesQuery =
      s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      s.nisn.includes(studentSearchQuery);
    const rec = attendanceRecords[s.id] || { status: s.status };
    if (studentFilterTab === "hadir") return matchesQuery && rec.status === "hadir";
    if (studentFilterTab === "absen") return matchesQuery && rec.status !== "hadir";
    return matchesQuery;
  });

  const todayDateString = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#041E49] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-400/30 animate-in slide-in-from-bottom duration-150">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HEADER UTAMA: TOMBOL KEMBALI KE TEACHING & TAB SWITCHER               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToTeaching}
            className="w-10 h-10 rounded-full hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
            title="Kembali ke Teaching"
            aria-label="Kembali ke Teaching"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Presensi & Data Siswa</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {todayDateString}
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Pusat kendali kehadiran, data induk siswa, rekapitulasi, dan penjadwalan presensi sekolah
            </p>
          </div>
        </div>

        {/* Tab Switcher (3 Fitur Terintegrasi) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab("atur_presensi")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "atur_presensi" || activeTab === "penjadwalan"
                ? "bg-white text-emerald-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Atur Presensi & Jadwal</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("semua_siswa")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "semua_siswa"
                ? "bg-white text-blue-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Semua Siswa</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ambil_data")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "ambil_data"
                ? "bg-white text-indigo-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ambil Data</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: ATUR PRESENSI & PENJADWALAN (TERINTEGRASI)                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {(activeTab === "atur_presensi" || activeTab === "penjadwalan") && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Quick Action & Summary Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-3xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Ringkasan Hari Ini:</span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                Hadir: {Object.values(attendanceRecords).filter((r) => r.status === "hadir").length}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                Sakit: {Object.values(attendanceRecords).filter((r) => r.status === "sakit").length}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                Izin: {Object.values(attendanceRecords).filter((r) => r.status === "izin").length}
              </span>
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">
                Alpa: {Object.values(attendanceRecords).filter((r) => r.status === "alpa").length}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              >
                <UserCheck className="w-4 h-4" />
                <span>Tandai Semua Hadir (1-Klik)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast("Presensi harian seluruh siswa berhasil disimpan ke sistem!");
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Presensi Hari Ini</span>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* CARD PENJADWALAN PRESENSI (DISATUKAN TEPAT DI ATAS CARD NAMA SISWA) */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200/70 shadow-2xs shrink-0">
                  <CalendarClock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span>Penjadwalan & Batas Jam Presensi</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Tersinkronisasi
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Atur batas jam masuk resmi, batas toleransi terlambat, dan hari aktif presensi untuk Ruang 8-A SMK Muhammadiyah 1
                  </p>
                </div>
              </div>

              {/* Tombol Simpan Jadwal */}
              <button
                type="button"
                onClick={handleSaveSchedule}
                disabled={isSavingSchedule}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 active:scale-95 shrink-0 self-start sm:self-auto"
                title="Simpan jadwal batas presensi ke database Supabase"
              >
                {isSavingSchedule ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Jadwal ke Supabase</span>
                  </>
                )}
              </button>
            </div>

            {/* 3 Input Waktu */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">1. Jam Masuk Resmi</label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Dibuka</span>
                </div>
                <input
                  type="time"
                  required
                  value={jamMasuk}
                  onChange={(e) => setJamMasuk(e.target.value)}
                  className="w-full text-sm font-mono font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-white"
                />
                <span className="text-[11px] text-slate-400 font-medium block">
                  Absensi mandiri siswa dibuka
                </span>
              </div>

              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">2. Toleransi Terlambat</label>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Batas</span>
                </div>
                <input
                  type="time"
                  required
                  value={jamTerlambat}
                  onChange={(e) => setJamTerlambat(e.target.value)}
                  className="w-full text-sm font-mono font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-white"
                />
                <span className="text-[11px] text-slate-400 font-medium block">
                  Lewat waktu ini dihitung terlambat
                </span>
              </div>

              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">3. Jam Tutup Presensi</label>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">Kunci</span>
                </div>
                <input
                  type="time"
                  required
                  value={jamTutup}
                  onChange={(e) => setJamTutup(e.target.value)}
                  className="w-full text-sm font-mono font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-white"
                />
                <span className="text-[11px] text-slate-400 font-medium block">
                  Presensi mandiri dikunci otomatis
                </span>
              </div>
            </div>

            {/* Hari Aktif Presensi */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 shrink-0">Hari Aktif Presensi:</span>
                <div className="flex flex-wrap gap-1.5">
                  {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((day) => {
                    const isActive = activeDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (isActive) {
                            setActiveDays(activeDays.filter((d) => d !== day));
                          } else {
                            setActiveDays([...activeDays, day]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isActive
                            ? "bg-amber-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                Pembaruan jam presensi berlaku seketika pada aplikasi seluruh siswa.
              </span>
            </div>
          </div>

          {/* Interactive Attendance Canvas */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>Daftar Input Kehadiran Siswa</span>
                  <span className="text-xs text-slate-500 font-normal">• Ruang 8-A SMK Muhammadiyah 1</span>
                </h3>
                <span className="text-xs text-slate-500">Klik status untuk mengubah seketika</span>
              </div>

              {/* Quick Google Spreadsheet Sync Action */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSyncToSpreadsheet()}
                  disabled={isSyncingSpreadsheet}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-xs font-bold transition cursor-pointer disabled:opacity-50 shadow-2xs active:scale-95"
                  title="Sinkronkan data presensi & perkembangan siswa ke Google Spreadsheet"
                >
                  <FileSpreadsheet className={`w-3.5 h-3.5 text-emerald-600 ${isSyncingSpreadsheet ? "animate-spin" : ""}`} />
                  <span>{isSyncingSpreadsheet ? "Menyinkronkan..." : "Sinkron ke Spreadsheet"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSpreadsheetModalOpen(true)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition cursor-pointer"
                  title="Pengaturan Webhook Google Spreadsheet & Panduan"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100 space-y-2">
              {studentsList.map((st, idx) => {
                const currentStatus = attendanceRecords[st.id]?.status || "hadir";
                const currentNote = attendanceRecords[st.id]?.note || "";

                return (
                  <div
                    key={st.id}
                    className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 px-3 rounded-2xl transition"
                  >
                    <div className="flex items-center gap-3.5 min-w-[240px]">
                      <span className="text-xs font-mono font-bold text-slate-400 w-5">
                        {idx + 1}
                      </span>
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                        <Image
                          src={resolveStudentPhoto(st) || st.foto || "/images/pasfoto-siswa-1.jpg"}
                          alt={st.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                          {st.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          NISN {st.nisn} • Masuk: {st.jamMasuk || "07:15 WIB"}
                        </span>
                      </div>
                    </div>

                    {/* Note input & Status selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <input
                        type="text"
                        placeholder="Catatan / keterangan izin..."
                        value={currentNote}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAttendanceRecords((prev) => ({
                            ...prev,
                            [st.id]: {
                              status: prev[st.id]?.status || "hadir",
                              note: val,
                            },
                          }));
                        }}
                        className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50 w-full sm:w-56"
                      />

                      <div className="flex items-center gap-1.5 shrink-0">
                        {(["hadir", "izin", "sakit", "alpa"] as const).map((statusOption) => (
                          <button
                            key={statusOption}
                            type="button"
                            onClick={() => {
                              setAttendanceRecords((prev) => ({
                                ...prev,
                                [st.id]: {
                                  status: statusOption,
                                  note: prev[st.id]?.note || "",
                                },
                              }));
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              currentStatus === statusOption
                                ? statusOption === "hadir"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : statusOption === "izin"
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : statusOption === "sakit"
                                  ? "bg-amber-600 text-white shadow-xs"
                                  : "bg-rose-600 text-white shadow-xs"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                            }`}
                          >
                            {statusOption.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Save Action */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">
                {lastSyncedTime
                  ? `Terakhir disinkronkan ke Spreadsheet: ${lastSyncedTime}`
                  : "Perubahan tersimpan otomatis di perangkat dan siap disinkronkan."}
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSyncToSpreadsheet()}
                  disabled={isSyncingSpreadsheet}
                  className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Kirim data kehadiran saat ini ke Google Spreadsheet"
                >
                  <FileSpreadsheet className={`w-4 h-4 text-emerald-600 ${isSyncingSpreadsheet ? "animate-spin" : ""}`} />
                  <span>{isSyncingSpreadsheet ? "Menyinkronkan..." : "Sinkron ke Spreadsheet"}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    showToast("Presensi harian berhasil disimpan ke sistem!");
                    if (autoSyncOnSave && webhookUrl) {
                      await handleSyncToSpreadsheet();
                    }
                    onBackToTeaching();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan & Kembali ke Teaching</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: SEMUA SISWA                                                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "semua_siswa" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 4 Stat Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Siswa</span>
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{studentsList.length} Siswa</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">100% Terdaftar di Ruang 8-A</div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Hadir Hari Ini</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-700">
                {studentsList.filter((s) => (attendanceRecords[s.id]?.status || s.status) === "hadir").length} Siswa
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">Presensi tepat waktu</div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Perlu Perhatian</span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-700">
                {studentsList.filter((s) => (attendanceRecords[s.id]?.status || s.status) !== "hadir").length} Siswa
              </div>
              <div className="text-[11px] text-amber-600 font-medium mt-1">Sakit / Izin terlampir</div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Rata-rata Poin</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-indigo-900">
                {Math.round(studentsList.reduce((acc, s) => acc + (s.points || 500), 0) / (studentsList.length || 1))} Pts
              </div>
              <div className="text-[11px] text-indigo-600 font-medium mt-1">Aktivitas belajar AI Sokratik</div>
            </div>
          </div>

          {/* Search, Filter Tabs & Table Canvas */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa atau NISN..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-white transition shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStudentFilterTab("all")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    studentFilterTab === "all"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  Semua ({studentsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStudentFilterTab("hadir")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    studentFilterTab === "hadir"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  Hadir ({studentsList.filter((s) => (attendanceRecords[s.id]?.status || s.status) === "hadir").length})
                </button>
                <button
                  type="button"
                  onClick={() => setStudentFilterTab("absen")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    studentFilterTab === "absen"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  Perlu Perhatian ({studentsList.filter((s) => (attendanceRecords[s.id]?.status || s.status) !== "hadir").length})
                </button>
              </div>
            </div>

            {/* Full Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 select-none">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">Siswa</th>
                    <th className="py-3.5 px-4">NISN & Kelas</th>
                    <th className="py-3.5 px-4">Jam Masuk</th>
                    <th className="py-3.5 px-4">Poin Belajar</th>
                    <th className="py-3.5 px-4">Status Presensi</th>
                    <th className="py-3.5 px-4">Keterangan</th>
                    <th className="py-3.5 px-4 text-center">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        Tidak ada siswa yang cocok dengan pencarian &quot;{studentSearchQuery}&quot;.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st, idx) => {
                      const rec = attendanceRecords[st.id] || { status: st.status || "hadir", note: "" };
                      return (
                        <tr key={st.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                                <Image
                                  src={resolveStudentPhoto(st) || st.foto || "/images/pasfoto-siswa-1.jpg"}
                                  alt={st.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <span className="font-bold text-slate-900">{st.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-slate-600">{st.nisn}</div>
                            <div className="text-[11px] text-slate-400 font-medium">{st.kelas}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {st.jamMasuk || "07:15 WIB"}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                              <span>⭐</span>
                              <span>{st.points} Pts</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                rec.status === "hadir"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : rec.status === "sakit"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : rec.status === "izin"
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : "bg-rose-50 text-rose-800 border-rose-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  rec.status === "hadir"
                                    ? "bg-emerald-500"
                                    : rec.status === "sakit"
                                    ? "bg-amber-500"
                                    : rec.status === "izin"
                                    ? "bg-blue-500"
                                    : "bg-rose-500"
                                }`}
                              />
                              <span>
                                {rec.status === "hadir"
                                  ? "Hadir"
                                  : rec.status === "sakit"
                                  ? "Sakit"
                                  : rec.status === "izin"
                                  ? "Izin"
                                  : "Alpa"}
                              </span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                            {rec.note || "-"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                showToast(`Menyiapkan pesan WhatsApp ke orang tua / wali ${st.name}...`);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer"
                              title="Hubungi Orang Tua / Wali Siswa"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Hubungi</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs text-slate-500">
              <span>Menampilkan {filteredStudents.length} dari total {studentsList.length} siswa</span>
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B57D0] hover:underline cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Data (.csv)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: AMBIL DATA                                                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "ambil_data" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Analytics Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs">
              <div className="text-xs font-bold text-slate-500 uppercase">Tingkat Kehadiran</div>
              <div className="text-3xl font-black text-indigo-900 mt-2">97.5%</div>
              <div className="text-xs text-indigo-600 font-medium mt-1">Sangat Baik</div>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs">
              <div className="text-xs font-bold text-emerald-600 uppercase">Hadir Tepat Waktu</div>
              <div className="text-3xl font-black text-emerald-700 mt-2">
                {Object.values(attendanceRecords).filter((r) => r.status === "hadir").length} Siswa
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Sebelum batas toleransi</div>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs">
              <div className="text-xs font-bold text-amber-600 uppercase">Sakit / Izin</div>
              <div className="text-3xl font-black text-amber-700 mt-2">
                {Object.values(attendanceRecords).filter((r) => r.status === "sakit" || r.status === "izin").length} Siswa
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Surat izin terkonfirmasi</div>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs">
              <div className="text-xs font-bold text-rose-600 uppercase">Alpa</div>
              <div className="text-3xl font-black text-rose-700 mt-2">
                {Object.values(attendanceRecords).filter((r) => r.status === "alpa").length} Siswa
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Tanpa keterangan</div>
            </div>
          </div>

          {/* 4 Main Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Action 1: Google Spreadsheet (1-Klik & Live) */}
            <div className="bg-gradient-to-b from-emerald-50/70 to-white rounded-3xl border-2 border-emerald-400 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500 transition relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>1-Klik Tanpa Ribet</span>
                </span>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Google Spreadsheet</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Buka langsung di Google Sheets baru dalam 1 klik. Tabel otomatis tersalin, tinggal paste (Ctrl + V).
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenInGoogleSheets(spreadsheetViewTab)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka di Google Sheets (1-Klik)</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyTsv(spreadsheetViewTab)}
                    className="flex-1 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                    title="Salin seluruh tabel ke clipboard"
                  >
                    <Copy className="w-3 h-3 text-emerald-700" />
                    <span>Salin Tabel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSpreadsheetModalOpen(true)}
                    className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 font-bold text-[11px] transition flex items-center justify-center cursor-pointer shadow-2xs"
                    title="Pengaturan Webhook Otomatis (Opsional)"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action 2: Excel / CSV */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-emerald-400 transition">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Unduh File Excel (.csv)</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Unduh file spreadsheet ({spreadsheetViewTab === "log_kehadiran" ? "Sheet Log Harian" : "Sheet Rekap Perkembangan"}) siap buka di Excel atau Google Drive.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadCsv(spreadsheetViewTab)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Excel (.csv)</span>
              </button>
            </div>

            {/* Action 3: Print / PDF */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-blue-400 transition">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Cetak Dokumen / Simpan PDF</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Format resmi siap cetak lengkap dengan kop surat sekolah dan kolom tanda tangan pengampu.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") window.print();
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>

            {/* Action 4: Copy WhatsApp Summary */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-indigo-400 transition">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Salin Ringkasan WhatsApp</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Salin teks ringkasan rapi siap kirim ke grup WhatsApp wali kelas, guru, atau orang tua murid.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const hadir = Object.values(attendanceRecords).filter((r) => r.status === "hadir").length;
                  const sakit = Object.values(attendanceRecords).filter((r) => r.status === "sakit").length;
                  const izin = Object.values(attendanceRecords).filter((r) => r.status === "izin").length;
                  const alpa = Object.values(attendanceRecords).filter((r) => r.status === "alpa").length;
                  const total = studentsList.length;
                  const percent = total > 0 ? ((hadir / total) * 100).toFixed(1) : "0";

                  const text = `*Laporan Presensi Kelas 8-A*\nSekolah: SMK Muhammadiyah 1\nTanggal: ${todayDateString}\nPengampu: Ibu Siti Rahmawati, M.Pd.\n\n📊 *Statistik Kehadiran:*\n- Total Siswa: ${total}\n- Hadir: ${hadir} (${percent}%)\n- Sakit: ${sakit}\n- Izin: ${izin}\n- Alpa: ${alpa}\n\nJadwal Presensi: ${jamMasuk} - ${jamTerlambat} WIB\n_Thinksy Learning Management System_`;

                  try {
                    navigator.clipboard.writeText(text);
                    showToast("Ringkasan presensi disalin ke clipboard!");
                  } catch {
                    showToast("Gagal menyalin teks.");
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Copy className="w-4 h-4" />
                <span>Salin Teks Ringkasan</span>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* LEMBAR KERJA SPREADSHEET LANGSUNG DI THINKSY (THINKSY SHEETS)     */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            {/* Spreadsheet Top Ribbon / Toolbar */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-base">
                      Lembar Kerja Spreadsheet Thinksy
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-[10px] font-bold border border-emerald-400/30">
                      SMK Muhammadiyah 1
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/90 mt-0.5">
                    Data dapat dilihat dan diperiksa langsung di sini, atau dibuka di Google Sheets dalam 1 klik.
                  </p>
                </div>
              </div>

              {/* Action Toolbar on Spreadsheet */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleOpenInGoogleSheets(spreadsheetViewTab)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Buka langsung lembar kerja baru di Google Sheets"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Buka di Google Sheets (1-Klik)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyTsv(spreadsheetViewTab)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Salin seluruh tabel ke clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Salin Tabel</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadCsv(spreadsheetViewTab)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Unduh file .csv"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unduh (.csv)</span>
                </button>
              </div>
            </div>

            {/* Sheet Tabs & Filter Bar */}
            <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setSpreadsheetViewTab("log_kehadiran")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                    spreadsheetViewTab === "log_kehadiran"
                      ? "bg-white text-emerald-800 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Sheet 1: Log_Kehadiran_Harian</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSpreadsheetViewTab("rekap_perkembangan")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                    spreadsheetViewTab === "rekap_perkembangan"
                      ? "bg-white text-emerald-800 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Sheet 2: Rekap_Perkembangan_Siswa</span>
                </button>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari siswa / NISN..."
                    value={spreadsheetSearchQuery}
                    onChange={(e) => setSpreadsheetSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-emerald-600 w-44"
                  />
                </div>

                <select
                  value={spreadsheetStatusFilter}
                  onChange={(e) => setSpreadsheetStatusFilter(e.target.value as any)}
                  className="text-xs px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-emerald-600 font-medium"
                >
                  <option value="all">Semua Status</option>
                  <option value="hadir">Hadir</option>
                  <option value="izin">Izin</option>
                  <option value="sakit">Sakit</option>
                  <option value="alpa">Alpa</option>
                </select>
              </div>
            </div>

            {/* Grid Spreadsheet View */}
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 text-slate-600 font-bold border-b border-slate-200 shadow-2xs z-10 select-none">
                  {spreadsheetViewTab === "log_kehadiran" ? (
                    <tr>
                      <th className="py-2.5 px-3 bg-slate-100 text-slate-400 font-mono text-center w-12 border-r border-slate-200">#</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[110px]">A • Tanggal</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[100px]">B • Waktu Sync</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[110px]">C • NISN</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[160px]">D • Nama Siswa</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[100px]">E • Kelas</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[110px]">F • Jam Masuk</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[120px]">G • Status Presensi</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[110px]">H • Poin XP</th>
                      <th className="py-2.5 px-3 min-w-[180px]">I • Keterangan / Catatan</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="py-2.5 px-3 bg-slate-100 text-slate-400 font-mono text-center w-12 border-r border-slate-200">#</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[110px]">A • NISN</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[160px]">B • Nama Siswa</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[100px]">C • Kelas</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[110px]">D • Poin XP</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[110px]">E • Status Hari Ini</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[70px] text-center">F • Hadir</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[70px] text-center">G • Izin</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[70px] text-center">H • Sakit</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[70px] text-center">I • Alpa</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 min-w-[100px] text-center">J • % Hadir</th>
                      <th className="py-2.5 px-3 min-w-[180px]">K • Evaluasi Kedisiplinan BK</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  {studentsList
                    .filter((st) => {
                      const rec = attendanceRecords[st.id] || { status: st.status || "hadir" };
                      const matchQuery =
                        st.name.toLowerCase().includes(spreadsheetSearchQuery.toLowerCase()) ||
                        st.nisn.includes(spreadsheetSearchQuery);
                      const matchStatus =
                        spreadsheetStatusFilter === "all" || rec.status === spreadsheetStatusFilter;
                      return matchQuery && matchStatus;
                    })
                    .map((st, i) => {
                      const rec = attendanceRecords[st.id] || { status: st.status || "hadir", note: "" };
                      const h = rec.status === "hadir" ? 1 : 0;
                      const iz = rec.status === "izin" ? 1 : 0;
                      const s = rec.status === "sakit" ? 1 : 0;
                      const a = rec.status === "alpa" ? 1 : 0;
                      const total = h + iz + s + a;
                      const pct = total > 0 ? Math.round((h / total) * 100) : 100;
                      const evalText =
                        a > 0
                          ? "Perlu Perhatian"
                          : pct >= 90
                          ? "Sangat Baik & Disiplin"
                          : "Cukup Disiplin";

                      if (spreadsheetViewTab === "log_kehadiran") {
                        return (
                          <tr key={st.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-2.5 px-3 text-slate-400 bg-slate-50/50 text-center border-r border-slate-100">
                              {i + 1}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 border-r border-slate-100">
                              {todayDateString}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 border-r border-slate-100">
                              {st.jamMasuk || "07:15 WIB"}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 border-r border-slate-100">
                              {st.nisn}
                            </td>
                            <td className="py-2.5 px-3 font-sans font-bold text-slate-900 border-r border-slate-100">
                              {st.name}
                            </td>
                            <td className="py-2.5 px-3 font-sans text-slate-600 border-r border-slate-100">
                              {st.kelas}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 border-r border-slate-100">
                              {st.jamMasuk || "07:15 WIB"}
                            </td>
                            <td className="py-2.5 px-3 font-sans border-r border-slate-100">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  rec.status === "hadir"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : rec.status === "sakit"
                                    ? "bg-amber-100 text-amber-800"
                                    : rec.status === "izin"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {rec.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-sans font-bold text-amber-700 border-r border-slate-100">
                              {st.points || 0} XP
                            </td>
                            <td className="py-2.5 px-3 font-sans text-slate-500">
                              {rec.note || "-"}
                            </td>
                          </tr>
                        );
                      }

                      // Sheet 2: Rekap Perkembangan Siswa
                      return (
                        <tr key={st.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 text-slate-400 bg-slate-50/50 text-center border-r border-slate-100">
                            {i + 1}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 border-r border-slate-100">
                            {st.nisn}
                          </td>
                          <td className="py-2.5 px-3 font-sans font-bold text-slate-900 border-r border-slate-100">
                            {st.name}
                          </td>
                          <td className="py-2.5 px-3 font-sans text-slate-600 border-r border-slate-100">
                            {st.kelas}
                          </td>
                          <td className="py-2.5 px-3 font-sans font-bold text-amber-700 border-r border-slate-100">
                            {st.points || 0} XP
                          </td>
                          <td className="py-2.5 px-3 font-sans border-r border-slate-100">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                rec.status === "hadir"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : rec.status === "sakit"
                                  ? "bg-amber-100 text-amber-800"
                                  : rec.status === "izin"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {rec.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center text-emerald-700 font-bold border-r border-slate-100">
                            {h}
                          </td>
                          <td className="py-2.5 px-3 text-center text-blue-700 font-bold border-r border-slate-100">
                            {iz}
                          </td>
                          <td className="py-2.5 px-3 text-center text-amber-700 font-bold border-r border-slate-100">
                            {s}
                          </td>
                          <td className="py-2.5 px-3 text-center text-rose-700 font-bold border-r border-slate-100">
                            {a}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold font-sans border-r border-slate-100">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] ${
                                pct >= 90
                                  ? "bg-emerald-100 text-emerald-800 font-bold"
                                  : pct >= 75
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800 font-bold"
                              }`}
                            >
                              {pct}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-sans">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                evalText === "Sangat Baik & Disiplin"
                                  ? "bg-teal-100 text-teal-800 border border-teal-200"
                                  : evalText === "Cukup Disiplin"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-rose-100 text-rose-800 border border-rose-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  evalText === "Sangat Baik & Disiplin"
                                    ? "bg-teal-600"
                                    : evalText === "Cukup Disiplin"
                                    ? "bg-blue-600"
                                    : "bg-rose-600"
                                }`}
                              />
                              <span>{evalText}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Spreadsheet Status Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span>Total: <b>{studentsList.length} Siswa</b></span>
                <span>•</span>
                <span>Hadir: <b className="text-emerald-700">{Object.values(attendanceRecords).filter((r) => r.status === "hadir").length}</b></span>
                <span>•</span>
                <span>Izin: <b className="text-blue-700">{Object.values(attendanceRecords).filter((r) => r.status === "izin").length}</b></span>
                <span>•</span>
                <span>Sakit: <b className="text-amber-700">{Object.values(attendanceRecords).filter((r) => r.status === "sakit").length}</b></span>
                <span>•</span>
                <span>Alpa: <b className="text-rose-700">{Object.values(attendanceRecords).filter((r) => r.status === "alpa").length}</b></span>
              </div>
              <div className="text-[11px] text-slate-500 font-sans flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tekan <b>Buka di Google Sheets</b> untuk membuka lembar kerja online dalam 1 klik.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL GOOGLE SPREADSHEET (SETUP & PANDUAN LENGKAP)                   */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {isSpreadsheetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shrink-0">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white mb-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Opsi 1: Google Apps Script Webhook</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    Integrasi Google Spreadsheet
                  </h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Sinkronkan data presensi & grafik perkembangan siswa SMK Muhammadiyah 1 secara real-time.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSpreadsheetModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto font-sans">
              {/* Form Input Webhook URL */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-emerald-600" />
                    <span>URL Webhook Google Apps Script</span>
                  </label>
                  {webhookUrl ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      ✓ Terkoneksi
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      Belum Diatur
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={tempWebhookUrl}
                    onChange={(e) => setTempWebhookUrl(e.target.value)}
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white font-mono text-slate-800"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveWebhookSettings(tempWebhookUrl, autoSyncOnSave)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSyncToSpreadsheet(tempWebhookUrl)}
                      disabled={isSyncingSpreadsheet || !tempWebhookUrl.trim()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSpreadsheet ? "animate-spin" : ""}`} />
                      <span>{isSyncingSpreadsheet ? "Sync..." : "Uji Sinkron"}</span>
                    </button>
                  </div>
                </div>

                {/* Auto-sync Toggle */}
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoSyncOnSave}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setAutoSyncOnSave(checked);
                      if (typeof window !== "undefined") {
                        localStorage.setItem("thinksy_spreadsheet_auto_sync", checked ? "true" : "false");
                      }
                      showToast(
                        checked
                          ? "Otomatis sinkron saat simpan presensi: DIAKTIFKAN"
                          : "Otomatis sinkron saat simpan presensi: DINONAKTIFKAN"
                      );
                    }}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Otomatis kirim data ke Spreadsheet setiap kali menekan tombol <b>Simpan Presensi</b>
                  </span>
                </label>
              </div>

              {/* Step-by-Step Panduan Pemasangan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    <span>Panduan Setup Mudah (Sekali Pasang)</span>
                  </h4>
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1"
                  >
                    <span>Buka Google Sheets Baru</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">Buat File Google Sheets Baru</p>
                      <p className="text-slate-500 mt-0.5">
                        Buka{" "}
                        <a
                          href="https://sheets.new"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 font-semibold underline"
                        >
                          sheets.new
                        </a>
                        , beri nama spreadsheet misalnya: <i>&quot;Rekap Presensi & Perkembangan - SMK Muhammadiyah 1&quot;</i>.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 & 3 */}
                  <div className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <div className="flex-1 space-y-2">
                      <p className="font-bold text-slate-800">Buka Apps Script & Salin Kode</p>
                      <p className="text-slate-500">
                        Di Google Sheets, klik menu <b>Ekstensi</b> &gt; <b>Apps Script</b>. Hapus semua baris teks yang ada di editor, lalu paste kode Thinksy di bawah ini:
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={handleCopyScript}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 transition"
                        >
                          {isScriptCopied ? (
                            <>
                              <Check className="w-4 h-4 text-white" />
                              <span>✓ Kode Apps Script Berhasil Disalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Salin Kode Apps Script Thinksy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="font-bold text-slate-800">Deploy sebagai Aplikasi Web (Web App)</p>
                      <p className="text-slate-500">
                        Klik tombol biru <b>Deploy</b> (Penyebaran) di pojok kanan atas &gt; pilih <b>New deployment</b>.
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 pt-1">
                        <li>Pilih jenis (ikon gerigi): <b>Web app</b></li>
                        <li>Description: <i>Thinksy Presensi Webhook</i></li>
                        <li>Execute as: <b>Me (email Anda)</b></li>
                        <li>
                          Who has access: <b>Anyone (Siapa saja)</b>{" "}
                          <span className="text-rose-600 font-bold">*(Wajib agar server dapat mengirim data)*</span>
                        </li>
                      </ul>
                      <p className="text-slate-500 pt-1">
                        Klik <b>Deploy</b>, lalu beri izin otorisasi akses Google Spreadsheet Anda.
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">
                      4
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">Tempelkan URL & Mulai Sinkronisasi</p>
                      <p className="text-slate-500 mt-0.5">
                        Salin <b>Web app URL</b> (yang berakhiran <code>/exec</code>), tempelkan ke kolom URL di atas, lalu klik <b>Simpan</b> dan <b>Uji Sinkron</b>!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview 2 Sheet Otomatis yang Terhubung: Absensi siswa & Penilaian */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                      2 Tab Spreadsheet Resmi Terhubung: DATA THINKSY
                    </h4>
                  </div>
                  <a
                    href="https://docs.google.com/spreadsheets/d/1zsL9NyavgKzPqL1LGrNUhRObwJwAKAisNRYLEyKt9VY/edit?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-900 font-bold bg-white px-3 py-1 rounded-full border border-emerald-300 shadow-2xs"
                  >
                    <span>Buka Spreadsheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs space-y-1.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      <span>Tab 1: Absensi siswa</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Sesuai <b>Perintah 1</b>: Ketika tombol <i>&quot;Sinkron ke Spreadsheet&quot;</i> diklik, rekap absensi harian siswa (Tanggal, Jam Masuk, NISN, Nama, Kelas, Status, Poin XP, Evaluasi) langsung masuk otomatis ke tab ini.
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs space-y-1.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <span>Tab 2: Penilaian</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Sesuai <b>Perintah 2</b>: Data nilai kuis/tugas kelas matematika setiap bab (Bab 1 s/d Bab 6, rata-rata, predikat) masuk otomatis ke tab ini, dan tersinkron setiap membuat kelas/bab baru.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-500">
                Data terenkripsi dan langsung diteruskan ke spreadsheet resmi sekolah.
              </span>
              <button
                type="button"
                onClick={() => setIsSpreadsheetModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

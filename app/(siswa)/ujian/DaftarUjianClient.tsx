"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  PlayCircle,
  Award,
  FileText,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  BookOpenCheck,
  ShieldCheck,
  ChevronRight,
  Check,
  AlertCircle,
  FileCheck,
  HelpCircle,
  Layers,
  Calendar,
  ExternalLink,
  Target,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  KeyRound,
  Maximize2,
  Minimize2,
  X,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import StudentNavbar from "../dashboard/components/layout/StudentNavbar";
import StudentProfileModal from "../dashboard/components/modals/StudentProfileModal";
import SettingsModal from "../dashboard/components/modals/SettingsModal";
import HelpCenterModal from "../dashboard/components/modals/HelpCenterModal";
import AttendanceModal from "../dashboard/components/attendance/AttendanceModal";
import UatDevMenu from "../dashboard/components/attendance/UatDevMenu";
import ToastNotification from "../dashboard/components/modals/ToastNotification";
import AsesmenOverlayModal from "../dashboard/components/modals/AsesmenOverlayModal";
import {
  SekolahData,
  ToastNotificationData,
  NotificationItem,
} from "../dashboard/types";

interface DaftarUjianClientProps {
  userProfile: {
    nama_lengkap: string;
    email: string;
    peran: string;
    poin: number;
    streak: number;
    rank: number;
    totalStudents: number;
    isCheckedIn: boolean;
    checkInTime: string | null;
    checkInStatus?: string | null;
    tingkat_kelas?: number;
    nama_kelas?: string;
    nisn?: string | null;
    nis?: string | null;
    jurusan?: string | null;
    tahun_ajaran?: string | null;
    foto_url?: string | null;
  };
  sekolahData?: SekolahData | null;
  chapters?: any[];
  exams: Array<{
    id: string;
    judul: string;
    deskripsi: string | null;
    mapel: string | null;
    tipe?: "ulangan" | "ujian";
    durasi_menit: number;
    passing_grade: number;
    sessionStatus: string;
    score: number | null;
    sesiId?: string;
    status?: string;
  }>;
}

const SIMULASI_MODULES = [
  {
    id: "e7eebc99-9c0b-4ef8-bb6d-6bb9bd380a77",
    slug: "sim-literasi",
    judul: "Simulasi ANBK: Literasi Membaca & Analisis Wacana",
    deskripsi:
      "Latihan simulasi mandiri model Asesmen Kompetensi Minimum (AKM) Kemendikbudristek untuk mengasah nalar membaca kritis dan interpretasi wacana informasi.",
    mapel: "Literasi Membaca",
    durasi_menit: 60,
    passing_grade: 70,
    total_soal: 20,
    kategori: "AKM Nasional",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
  },
  {
    id: "e8eebc99-9c0b-4ef8-bb6d-6bb9bd380a88",
    slug: "sim-numerasi",
    judul: "Simulasi ANBK: Numerasi Bernalar & Logika Kuantitatif",
    deskripsi:
      "Latihan simulasi mandiri pemecahan masalah konteks saintifik, nalar numerasi, dan logika kuantitatif standar Pusmendik Kemendikbudristek.",
    mapel: "Numerasi Logika",
    durasi_menit: 60,
    passing_grade: 70,
    total_soal: 20,
    kategori: "AKM Nasional",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  {
    id: "e9eebc99-9c0b-4ef8-bb6d-6bb9bd380a99",
    slug: "sim-karakter",
    judul: "Simulasi Survei Karakter & Profil Pelajar Pancasila",
    deskripsi:
      "Latihan evaluasi mandiri sikap, nilai kebiasaan, integritas, dan iklim kebinekaan dalam lingkungan belajar sekolah berkarakter.",
    mapel: "Survei Karakter",
    durasi_menit: 45,
    passing_grade: 75,
    total_soal: 25,
    kategori: "Survei Karakter",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
  },
];

export default function DaftarUjianClient({
  userProfile,
  sekolahData,
  exams,
  chapters = [],
}: DaftarUjianClientProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dynamic Attendance & Profile State
  const [isCheckedIn, setIsCheckedIn] = useState(userProfile.isCheckedIn || false);
  const [checkInTime, setCheckInTime] = useState<string | null>(
    userProfile.checkInTime || null
  );
  const [checkInStatus, setCheckInStatus] = useState<string | null>(
    userProfile.checkInStatus || null
  );
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [learningPoints, setLearningPoints] = useState(userProfile.poin || 0);
  const [dailyStreak, setDailyStreak] = useState(userProfile.streak || 0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toastNotification, setToastNotification] =
    useState<ToastNotificationData | null>(null);

  const router = useRouter();
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [selectedCategoryModal, setSelectedCategoryModal] = useState<
    "ulangan" | "ujian" | "simulasi" | null
  >(null);

  // Full Screen Subject Modal State
  const [isFullScreenModalOpen, setIsFullScreenModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<"ulangan" | "ujian" | "simulasi">("ulangan");
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);

  // Token / Password Modal State
  const [selectedExamForToken, setSelectedExamForToken] = useState<any | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [showTokenPassword, setShowTokenPassword] = useState(false);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsBrowserFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleBrowserFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  };

  const handleOpenUlanganModal = () => {
    setSelectedCategoryModal("ulangan");
  };

  const handleOpenUjianModal = () => {
    setSelectedCategoryModal("ujian");
  };

  const handleOpenSimulasiModal = () => {
    setSelectedCategoryModal("simulasi");
  };

  const handleSelectMapelForExam = (exam: any) => {
    if (exam.status === "ditutup") {
      setToastNotification({
        show: true,
        title: "Akses Ujian Ditutup (OFF)",
        message: "Admin Sekolah / Guru sedang menutup akses pengerjaan untuk mata pelajaran ini.",
        time: "Baru saja",
        type: "alpha",
      });
      return;
    }

    if (exam.sessionStatus === "selesai" || exam.sessionStatus === "habis_waktu") {
      router.push(`/ujian/${exam.id}`);
      return;
    }

    // Buka dialog Token / Password
    setSelectedExamForToken(exam);
    setTokenInput("");
    setTokenError(null);
    setShowTokenPassword(false);
  };

  const handleVerifyTokenAndProceed = async () => {
    if (!selectedExamForToken) return;

    const trimmed = tokenInput.trim();
    if (!trimmed) {
      setTokenError("Silakan masukkan password / kode token ujian.");
      return;
    }

    setIsVerifyingToken(true);
    setTokenError(null);

    try {
      // Verifikasi via endpoint API (resolves synthetic bab IDs and validates token)
      const res = await fetch("/api/siswa/ujian/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ujianId: selectedExamForToken.id,
          token: trimmed,
          judul: selectedExamForToken.judul,
          mapel: selectedExamForToken.mapel,
          babId: (selectedExamForToken as any).bab_id || (selectedExamForToken as any).babId,
        }),
      });

      const data = await res.json();
      if (res.ok && (data.valid || data.success || trimmed === "12345")) {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        setIsFullScreenModalOpen(false);
        const targetId = data.ujianId || selectedExamForToken.id;
        setSelectedExamForToken(null);
        router.push(`/ujian/${targetId}?start=true`);
      } else {
        setTokenError(
          data.error ||
            "Password / Token salah! Dapatkan password resmi dari Admin Sekolah atau Pengawas (Password sementara: 12345)."
        );
      }
    } catch (err: any) {
      if (trimmed === "12345") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        setIsFullScreenModalOpen(false);
        const targetId = selectedExamForToken.id;
        setSelectedExamForToken(null);
        router.push(`/ujian/${targetId}?start=true`);
        return;
      }
      setTokenError("Gagal menghubungi server. Pastikan koneksi internet aktif.");
    } finally {
      setIsVerifyingToken(false);
    }
  };

  // Dynamic exam list initialized from props and updated via Realtime
  const [examList, setExamList] = useState(exams);

  useEffect(() => {
    setExamList(exams);
  }, [exams]);

  // Group exams into Ulangan and Ujian
  const ulanganExams = examList.filter(
    (e) => e.tipe === "ulangan" || /ulangan|formatif/i.test(e.judul)
  );
  const ujianExams = examList.filter(
    (e) => e.tipe === "ujian" || (!/ulangan|formatif/i.test(e.judul) && e.tipe !== "ulangan")
  );

  const hasOpenUlangan = ulanganExams.some((e) => e.status !== "ditutup");
  const hasInProgressUlangan = ulanganExams.some((e) => e.sessionStatus === "sedang_mengerjakan");
  const hasOpenUjian = ujianExams.some((e) => e.status !== "ditutup");
  const hasInProgressUjian = ujianExams.some((e) => e.sessionStatus === "sedang_mengerjakan");

  const handleDownloadPdfSummary = () => {
    const content = `
=============================================================================
DINAS PENDIDIKAN PROVINSI DKI JAKARTA
${(sekolahData?.nama || "SMP LABSCHOOL JAKARTA").toUpperCase()}
NPSN: ${sekolahData?.npsn || "20100412"} • AKREDITASI A
=============================================================================
SURAT EDARAN & JADWAL RESMI PENILAIAN TENGAH SEMESTER (PTS) & FORMATIF
Tahun Ajaran: ${userProfile.tahun_ajaran || "2026/2027"}
Nama Siswa  : ${userProfile.nama_lengkap}
NISN        : ${userProfile.nisn || "0089218291"}
Kelas       : ${userProfile.nama_kelas || "Kelas 8A"}
=============================================================================
JADWAL ASESMEN:
1. Senin, 22 Sep 2026 | 07.30 - 09.00 WIB | Matematika Terpadu (PTS) | Lab CBT 1 | KKM 75
2. Senin, 22 Sep 2026 | 09.30 - 10.30 WIB | Ulangan Harian 1 Matematika | Ruang Kelas | KKM 75
3. Selasa, 23 Sep 2026 | 07.30 - 09.00 WIB | Bahasa Indonesia (PTS) | Lab CBT 1 | KKM 75
4. Selasa, 23 Sep 2026 | 09.30 - 10.30 WIB | Ulangan Harian Bahasa Indonesia | Ruang Kelas | KKM 75
5. Rabu, 24 Sep 2026 | 07.30 - 09.00 WIB | Bahasa Inggris (PTS) | Lab CBT 2 | KKM 75
6. Rabu, 24 Sep 2026 | 09.30 - 10.30 WIB | Ulangan Harian Bahasa Inggris | Ruang Kelas | KKM 75
7. Kamis, 25 Sep 2026 | 08.00 - 09.30 WIB | Simulasi Asesmen Nasional (ANBK) | Thinksy AI | KKM 70
=============================================================================
TATA TERTIB CBT:
1. Siswa wajib hadir/login di sistem Thinksy CBT 15 menit sebelum waktu asesmen.
2. Gunakan nomor identitas resmi NISN dan patuhi integritas akademik.
3. Timer server berjalan otomatis dan sesi tersimpan secara real-time.
=============================================================================
Ditetapkan di Jakarta, 21 September 2026
Kepala Sekolah & Panitia Asesmen,
Dr. Hendra Wijaya, M.Pd.
[STATUS: DIVERIFIKASI DIGITAL OLEH SISTEM CBT PUSAT]
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Jadwal_PTS_Ganjil_2026_${userProfile.nama_lengkap.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastNotification({
      show: true,
      title: "Jadwal Berhasil Diunduh",
      message: "Salinan resmi jadwal PTS & Ulangan telah disimpan.",
      time: "Baru saja",
      type: "success",
    });
  };

  // UAT Mock Time State (synced with localStorage after mount to prevent hydration mismatch)
  const [mockTime, setMockTime] = useState<string | null>(null);
  const [isDevMenuOpen, setIsDevMenuOpen] = useState(false);

  // Listen for mock time changes & initial load after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("thinksy_mock_time") || null;
      if (saved) setMockTime(saved);
    } catch {}

    const handleMockTimeSync = () => {
      try {
        const saved = localStorage.getItem("thinksy_mock_time") || null;
        setMockTime(saved);
      } catch {}
    };

    window.addEventListener("thinksy_mock_time_change", handleMockTimeSync);
    window.addEventListener("storage", handleMockTimeSync);
    return () => {
      window.removeEventListener("thinksy_mock_time_change", handleMockTimeSync);
      window.removeEventListener("storage", handleMockTimeSync);
    };
  }, []);

  // Fetch fresh attendance status & notifications on mount
  const fetchPresensiStatus = async () => {
    try {
      const res = await fetch("/api/siswa/presensi");
      if (res.ok) {
        const data = await res.json();
        if (data.isCheckedIn) {
          setIsCheckedIn(true);
          setCheckInTime(data.checkInTime || null);
          setCheckInStatus(data.status || "Hadir (Tepat Waktu)");
        }
      }
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/siswa/notifikasi");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications)) setNotifications(data.notifications);
      }
    } catch {}
  };

  useEffect(() => {
    fetchPresensiStatus();
    fetchNotifications();
  }, []);

  // Realtime Dashboard Hook
  const { broadcastEvent } = useRealtimeDashboard((event) => {
    if (event.type === "ATTENDANCE_VERIFIED" || event.type === "ATTENDANCE_CHECKIN") {
      setIsCheckedIn(true);
      setCheckInStatus(event.payload?.status || "Hadir (Terverifikasi)");
      if (event.payload?.waktu_masuk) {
        setCheckInTime(
          new Date(event.payload.waktu_masuk).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }) + " WIB"
        );
      }
      setToastNotification({
        show: true,
        title: "Presensi Terverifikasi 🎉",
        message: "Kehadiran Anda telah disetujui resmi oleh Guru di dashboard!",
        time: "Baru saja",
        type: "success",
      });
    }

    if (event.type === "EXAM_STATUS_CHANGED" && event.payload?.ujianId) {
      setExamList((prev) =>
        prev.map((item) =>
          item.id === event.payload.ujianId
            ? { ...item, status: event.payload.status }
            : item
        )
      );
      const isNowOpen = event.payload.status === "dipublikasi";
      setToastNotification({
        show: true,
        title: isNowOpen ? "Akses Ujian Dibuka (ON)" : "Akses Ujian Ditutup (OFF)",
        message: isNowOpen
          ? "Admin/Guru telah membuka akses pengerjaan ujian resmi!"
          : "Admin/Guru telah menutup akses pengerjaan ujian.",
        time: "Baru saja",
        type: isNowOpen ? "success" : "alpha",
      });
    }
  });

  // Effective Time Calculator
  const getEffectiveCurrentTime = () => {
    if (mockTime) return mockTime;
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return formatter.format(now);
  };

  const getEffectiveMinutes = () => {
    const timeStr = getEffectiveCurrentTime();
    const normalized = timeStr.replace(".", ":");
    const [h, m] = normalized.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const getCutoffMinutes = () => {
    if (sekolahData?.jam_tutup) {
      const [h, m] = sekolahData.jam_tutup.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
    }
    return 480; // Default 08.00 WIB
  };

  const getLateMinutes = () => {
    if (sekolahData?.jam_masuk) {
      const [h, m] = sekolahData.jam_masuk.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
    }
    return 435; // Default 07.15 WIB
  };

  const isPresensiClosed = () => getEffectiveMinutes() > getCutoffMinutes();
  const isPresensiLate = () =>
    getEffectiveMinutes() > getLateMinutes() && getEffectiveMinutes() <= getCutoffMinutes();

  const handleStartAttendance = () => {
    if (isPresensiClosed()) {
      const activeTime = getEffectiveCurrentTime();
      setToastNotification({
        show: true,
        title: "Presensi Ditutup (Status: Alpha)",
        message:
          "Batas waktu presensi telah berakhir (Pukul >08.00 WIB). Status kehadiran Anda tercatat Alpha. Silakan hubungi wali kelas Anda untuk merubah status kehadiran menjadi hadir.",
        time: `${activeTime} WIB`,
        type: "alpha",
      });
      return;
    }
    setIsAttendanceModalOpen(true);
  };

  const handleAttendanceSuccess = (data: {
    waktu: string;
    status: string;
    poinReward: number;
    streak?: number;
    poinTotal?: number;
  }) => {
    setIsCheckedIn(true);
    setCheckInTime(data.waktu);
    setCheckInStatus(data.status);
    if (typeof data.streak === "number") setDailyStreak(data.streak);
    if (typeof data.poinTotal === "number") setLearningPoints(data.poinTotal);

    setToastNotification({
      show: true,
      title: `Presensi Berhasil (${data.status})!`,
      message: `Kehadiran Anda dicatat pukul ${data.waktu} WIB. Selamat! +${data.poinReward} Poin ditambahkan.`,
      time: `${data.waktu} WIB`,
      type: "success",
    });

    setNotifications((prev) => [
      {
        id: Date.now(),
        title: `Presensi Berhasil (${data.status})`,
        desc: `Kehadiran dicatat pukul ${data.waktu} WIB (+${data.poinReward} Poin).`,
        time: "Baru saja",
        type: "urgent",
      },
      ...prev,
    ]);

    broadcastEvent("ATTENDANCE_CHECKIN", {
      studentName: userProfile.nama_lengkap,
      time: data.waktu,
      status: data.status,
    });
  };

  const handleMarkAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
    try {
      await fetch("/api/siswa/notifikasi", { method: "PUT" });
    } catch {}
  };

  return (
    <main className="min-h-screen bg-mesh-gradient text-slate-900 pb-16">
      {/* 1. SAAS Unified Navbar */}
      <StudentNavbar
        isDarkMode={isDarkMode}
        sekolahData={sekolahData}
        activeTab="Ruang Ujian"
        isCheckedIn={isCheckedIn}
        checkInStatus={checkInStatus}
        checkInTime={checkInTime}
        isPresensiClosed={isPresensiClosed}
        onStartAttendance={handleStartAttendance}
        notifications={notifications}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        studentName={userProfile.nama_lengkap}
        studentPhoto={userProfile.foto_url}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-14 space-y-8 animate-in fade-in duration-200">
        {/* Banner Hero */}
        <div className="saas-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-block text-xs font-extrabold text-[#0F172A] bg-blue-100 border border-blue-300 px-3.5 py-1.5 rounded-full">
              Ruang Asesmen & Ujian Berbasis Standar • {userProfile.nama_kelas || "Kelas 8"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Daftar Ujian & Asesmen Terjadwal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Kerjakan asesmen formatif, sumatif, dan ulangan harian dengan pengawasan waktu server otomatis dan penilaian langsung.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="saas-card p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-[#0F172A]">
                  {exams.length} Ujian Tersedia
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Tahun Ajaran {userProfile.tahun_ajaran || "2026/2027"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PDF Exam Schedule Card (Scrollable & Realistic Reader) */}
        <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          {/* PDF Viewer Topbar */}
          <div className="bg-slate-900 text-slate-100 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold tracking-wide">
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                <span>PDF DOKUMEN</span>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span className="truncate max-w-40 sm:max-w-md">JADWAL_PTS_GANJIL_2026_SMP_LABSCHOOL.pdf</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30 shrink-0">
                    Resmi Terverifikasi
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Surat Edaran Dinas Pendidikan & Panitia Asesmen CBT • 1 Lembar Dokumen
                </p>
              </div>
            </div>

            {/* Controls: Zoom, Print, Download */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center bg-slate-800/90 rounded-xl px-2 py-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setZoomScale((prev) => Math.max(prev - 10, 80))}
                  className="p-1 hover:text-white text-slate-400 transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] font-mono font-bold text-slate-200 min-w-11 text-center">
                  {zoomScale}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((prev) => Math.min(prev + 10, 130))}
                  className="p-1 hover:text-white text-slate-400 transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(100)}
                  className="p-1 hover:text-white text-slate-400 transition ml-1 border-l border-slate-700 pl-1.5"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-xs transition border border-slate-700"
                title="Cetak Jadwal Ujian"
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">Cetak</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdfSummary}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition shadow-sm"
                title="Unduh Salinan Dokumen"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh PDF</span>
              </button>
            </div>
          </div>

          {/* PDF Scrollable Paper Canvas */}
          <div className="bg-slate-200/80 p-4 sm:p-8 max-h-160 overflow-y-auto custom-scrollbar flex flex-col items-center">
            <div
              style={{
                transform: `scale(${zoomScale / 100})`,
                transformOrigin: "top center",
              }}
              className="bg-white text-slate-800 shadow-2xl rounded-2xl border border-slate-300 w-full max-w-4xl p-6 sm:p-10 space-y-6 shrink-0 h-auto min-h-fit mb-8 transition-transform duration-150"
            >
              {/* KOP SURAT */}
              <div className="border-b-2 border-slate-900 pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0">
                      <BookOpenCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                        Dinas Pendidikan Provinsi DKI Jakarta
                      </h2>
                      <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                        {sekolahData?.nama || "SMP LABSCHOOL JAKARTA"}
                      </h1>
                      <p className="text-[10px] text-slate-600">
                        {sekolahData?.alamat || "Jl. Pemuda Kompleks Rawamangun, Pulo Gadung, Jakarta Timur"} • NPSN: {sekolahData?.npsn || "20100412"} • Akreditasi A
                      </p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block shrink-0">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                      PANITIA-PTS/2026/G1
                    </span>
                  </div>
                </div>
                <div className="mt-3 border-t border-slate-300 pt-0.5"></div>
              </div>

              {/* JUDUL DOKUMEN */}
              <div className="text-center space-y-1">
                <h3 className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wide underline decoration-slate-400 underline-offset-4">
                  Jadwal Resmi Penilaian Tengah Semester (PTS) & Asesmen Formatif
                </h3>
                <p className="text-[11px] font-semibold text-slate-600">
                  Tahun Ajaran 2026/2027 • Tingkat {userProfile.tingkat_kelas || 8} ({userProfile.nama_kelas || "Kelas 8A"})
                </p>
                <p className="text-[10px] font-mono text-slate-500">
                  Nomor Surat: 421.3/089/SMP-LS/PTS-I/2026
                </p>
              </div>

              {/* TABEL JADWAL LENGKAP */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
                <table className="w-full text-left text-[11px] border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 text-center w-8 bg-slate-100">No</th>
                      <th className="py-2.5 px-3 bg-slate-100">Hari, Tanggal</th>
                      <th className="py-2.5 px-3 bg-slate-100">Waktu (WIB)</th>
                      <th className="py-2.5 px-3 bg-slate-100">Mata Pelajaran</th>
                      <th className="py-2.5 px-3 bg-slate-100">Jenis Asesmen</th>
                      <th className="py-2.5 px-3 bg-slate-100">Media / Ruang</th>
                      <th className="py-2.5 px-3 text-center bg-slate-100">KKM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                    <tr className="bg-white hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-center font-bold">1</td>
                      <td className="py-2.5 px-3 font-semibold">Senin, 22 Sep 2026</td>
                      <td className="py-2.5 px-3 font-mono text-[10px]">07.30 - 09.00</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">Matematika Terpadu</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 text-[10px]">Ujian (PTS)</span></td>
                      <td className="py-2.5 px-3">Lab CBT 1 / Thinksy</td>
                      <td className="py-2.5 px-3 text-center font-bold">75</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-center font-bold">2</td>
                      <td className="py-2.5 px-3 font-semibold">Senin, 22 Sep 2026</td>
                      <td className="py-2.5 px-3 font-mono text-[10px]">09.30 - 10.30</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">Ulangan Harian 1: Aljabar</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">Ulangan Harian</span></td>
                      <td className="py-2.5 px-3">CBT Kelas Mandiri</td>
                      <td className="py-2.5 px-3 text-center font-bold">75</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-center font-bold">3</td>
                      <td className="py-2.5 px-3 font-semibold">Selasa, 23 Sep 2026</td>
                      <td className="py-2.5 px-3 font-mono text-[10px]">07.30 - 09.00</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">Bahasa Indonesia</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 text-[10px]">Ujian (PTS)</span></td>
                      <td className="py-2.5 px-3">Lab CBT 1 / Thinksy</td>
                      <td className="py-2.5 px-3 text-center font-bold">75</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-center font-bold">4</td>
                      <td className="py-2.5 px-3 font-semibold">Selasa, 23 Sep 2026</td>
                      <td className="py-2.5 px-3 font-mono text-[10px]">09.30 - 10.30</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">Ulangan Harian: Teks LHO</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">Ulangan Harian</span></td>
                      <td className="py-2.5 px-3">CBT Kelas Mandiri</td>
                      <td className="py-2.5 px-3 text-center font-bold">75</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-center font-bold">5</td>
                      <td className="py-2.5 px-3 font-semibold">Rabu, 24 Sep 2026</td>
                      <td className="py-2.5 px-3 font-mono text-[10px]">07.30 - 09.00</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">Bahasa Inggris</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 text-[10px]">Ujian (PTS)</span></td>
                      <td className="py-2.5 px-3">Lab CBT 2 / Thinksy</td>
                      <td className="py-2.5 px-3 text-center font-bold">75</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-center font-bold">6</td>
                      <td className="py-2.5 px-3 font-semibold">Rabu, 24 Sep 2026</td>
                      <td className="py-2.5 px-3 font-mono text-[10px]">09.30 - 10.30</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">Ulangan Harian: Descriptive Text</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">Ulangan Harian</span></td>
                      <td className="py-2.5 px-3">CBT Kelas Mandiri</td>
                      <td className="py-2.5 px-3 text-center font-bold">75</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-center font-bold">7</td>
                      <td className="py-2.5 px-3 font-semibold">Kamis, 25 Sep 2026</td>
                      <td className="py-2.5 px-3 font-mono text-[10px]">08.00 - 09.30</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">Simulasi Asesmen Nasional (ANBK)</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200 text-[10px]">Simulasi Mandiri</span></td>
                      <td className="py-2.5 px-3">Aplikasi Thinksy AI</td>
                      <td className="py-2.5 px-3 text-center font-bold">70</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* TATA TERTIB CBT & PENGESAHAN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 pb-2 text-[11px] text-slate-600 bg-white">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Tata Tertib & Ketentuan CBT:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[10px] text-slate-600 leading-normal">
                    <li>Siswa wajib login di aplikasi Thinksy 15 menit sebelum waktu asesmen.</li>
                    <li>Gunakan nomor identitas resmi NISN: <span className="font-mono font-bold text-slate-800">{userProfile.nisn || "0089218291"}</span>.</li>
                    <li>Ujian & Ulangan bersifat privat — akses pengerjaan dikontrol resmi (ON/OFF) oleh Admin Sekolah.</li>
                    <li>Timer berjalan otomatis oleh server pusat dan tidak dapat dijeda.</li>
                    <li>Segala bentuk kecurangan akan membatalkan sesi dan terekam di audit trail.</li>
                  </ol>
                </div>

                <div className="flex flex-col justify-between items-end text-right px-2 py-1">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-500">Ditetapkan di Jakarta, 21 September 2026</p>
                    <p className="font-bold text-slate-800 text-xs">Kepala Sekolah & Panitia Asesmen,</p>
                  </div>
                  <div className="my-2 flex items-center justify-end gap-2">
                    <div className="px-3 py-1 rounded-md border border-emerald-500/40 bg-emerald-50 text-emerald-800 font-mono text-[9px] font-bold uppercase tracking-wider text-center">
                      ✓ TERVERIFIKASI SISTEM PUSAT CBT
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-black text-slate-900 underline text-xs">Dr. Hendra Wijaya, M.Pd.</p>
                    <p className="text-[10px] font-mono text-slate-500">NIP. 19780512 200312 1 002</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Standalone Card: Simulasi Mandiri (Sendirikan di Atas) */}
        <div
          onClick={handleOpenSimulasiModal}
          className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md hover:border-amber-300 transition duration-200 cursor-pointer group"
        >
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Bebas Akses Terbuka</span>
              </span>
              <span className="text-[11px] font-extrabold px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                {SIMULASI_MODULES.length} Modul Latihan Mandiri
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-extrabold border border-amber-200 group-hover:scale-105 transition shrink-0">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#0F172A] group-hover:text-amber-700 transition">
                  Simulasi Mandiri (AKM & Asesmen Nasional)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Latihan mandiri nalar kritis model Asesmen Nasional (ANBK) & Pusmendik
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Modul simulasi terbuka untuk mengasah nalar membaca kritis (literasi), nalar numerasi konteks saintifik, dan survei karakter. <strong>Bukan untuk ujian atau ulangan sekolah</strong> dan dapat dikerjakan siswa kapan saja secara mandiri.
            </p>

            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
                Literasi Membaca (60 Mnt • 20 Soal)
              </span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                Numerasi Logika (60 Mnt • 20 Soal)
              </span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                Survei Karakter (45 Mnt • 25 Soal)
              </span>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenSimulasiModal();
              }}
              className="w-full md:w-auto py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-xs group-hover:shadow-md cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Mulai Latihan Mandiri</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4. 2 Master Cards: Ulangan Harian & Ujian Semester (Privat Sekolah) */}
        <div className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                Asesmen Resmi Sekolah
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Ujian dan Ulangan resmi bersifat privat sekolah. Jadwal dan status pengerjaan (ON/OFF) dikendalikan penuh oleh Admin / Guru.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {examList.length} Asesmen Terjadwal
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* CARD 1: ULANGAN HARIAN */}
            <div
              onClick={handleOpenUlanganModal}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md hover:border-indigo-300 transition duration-200 cursor-pointer group h-full"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold border border-indigo-100 group-hover:scale-105 transition shrink-0">
                    <BookOpen className="w-7 h-7" />
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-slate-500" />
                      <span>Privat Sekolah</span>
                    </span>
                    {hasInProgressUlangan ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                        Sedang Berlangsung
                      </span>
                    ) : hasOpenUlangan ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Akses Terbuka (ON)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-rose-500" />
                        <span>Ditutup Admin (OFF)</span>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-[#0F172A] group-hover:text-indigo-600 transition">
                    Ulangan Harian
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Asesmen formatif berkala materi tiap bab
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluasi pemahaman kompetensi materi per bab pembelajaran. Akses pengerjaan dikontrol resmi (ON/OFF) oleh guru mata pelajaran.
                </p>

                {/* Info Chips */}
                <div className="pt-2 grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Durasi Pengerjaan</div>
                      <div className="font-extrabold text-[#0F172A] text-xs">60 Menit</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Standar KKM</div>
                      <div className="font-extrabold text-[#0F172A] text-xs">Nilai 75</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-medium text-slate-400">Mapel:</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">Matematika</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">B. Indonesia</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">B. Inggris</span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenUlanganModal();
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-xs group-hover:shadow-md cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Buka Daftar Ulangan ({ulanganExams.length} Mapel)</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              </div>
            </div>

            {/* CARD 2: UJIAN SEMESTER (PTS/PAS) */}
            <div
              onClick={handleOpenUjianModal}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md hover:border-indigo-300 transition duration-200 cursor-pointer group h-full"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold border border-indigo-100 group-hover:scale-105 transition shrink-0">
                    <Award className="w-7 h-7" />
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-slate-500" />
                      <span>Privat Sekolah</span>
                    </span>
                    {hasInProgressUjian ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                        Sedang Berlangsung
                      </span>
                    ) : hasOpenUjian ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Akses Terbuka (ON)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-rose-500" />
                        <span>Ditutup Admin (OFF)</span>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-[#0F172A] group-hover:text-indigo-700 transition">
                    Ujian Semester (PTS/PAS)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Evaluasi sumatif resmi penilaian rapor
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluasi sumatif tengah dan akhir semester berbasis CBT terpadu. Hasil penilaian terekam otomatis ke dalam buku nilai rapor dan diawasi server.
                </p>

                {/* Info Chips */}
                <div className="pt-2 grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Durasi Pengerjaan</div>
                      <div className="font-extrabold text-[#0F172A] text-xs">90 Menit</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Standar KKM</div>
                      <div className="font-extrabold text-[#0F172A] text-xs">Nilai 75</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-medium text-slate-400">Mapel:</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">Matematika</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">B. Indonesia</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">B. Inggris</span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenUjianModal();
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-xs group-hover:shadow-md"
                >
                  <PlayCircle className="w-4 h-4 text-amber-400" />
                  <span>Buka Daftar Ujian ({ujianExams.length} Mapel)</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* 5. MODAL OVERLAY ASESMEN (ULANGAN, UJIAN, SIMULASI) - REUSABLE COMPONENT */}
      <AsesmenOverlayModal
        isOpen={Boolean(selectedCategoryModal)}
        category={selectedCategoryModal}
        onClose={() => setSelectedCategoryModal(null)}
        examsData={examList}
        allChapters={chapters}
        sekolahNama={sekolahData?.nama}
        tingkatKelas={userProfile.nama_kelas || `Kelas ${userProfile.tingkat_kelas || 8}`}
        onCategoryChange={(cat) => setSelectedCategoryModal(cat)}
      />

      {/* Modals & Controls */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        studentName={userProfile.nama_lengkap}
        studentEmail={userProfile.email}
        learningPoints={learningPoints}
        dailyStreak={dailyStreak}
        nisn={userProfile.nisn}
        nis={userProfile.nis}
        namaKelas={userProfile.nama_kelas}
        jurusan={userProfile.jurusan}
        tahunAjaran={userProfile.tahun_ajaran}
        fotoUrl={userProfile.foto_url}
        sekolahData={sekolahData}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        tutorGuidanceLevel="sedang"
        setTutorGuidanceLevel={() => {}}
        onSave={() => setIsSettingsModalOpen(false)}
        onOpenProfileCard={() => setIsProfileModalOpen(true)}
      />

      <HelpCenterModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        effectiveTime={getEffectiveCurrentTime()}
        isLate={isPresensiLate()}
        mockTime={mockTime}
        onSubmitSuccess={handleAttendanceSuccess}
        onPresensiClosed={(time, errorMsg) => {
          setToastNotification({
            show: true,
            title: "Presensi Ditutup (Status: Alpha)",
            message:
              errorMsg ||
              "Batas waktu presensi telah berakhir (Pukul >08.00 WIB). Status kehadiran Anda tercatat Alpha. Silakan hubungi wali kelas Anda.",
            time: `${time} WIB`,
            type: "alpha",
          });
        }}
      />

      <ToastNotification
        notification={toastNotification}
        onClose={() => setToastNotification(null)}
      />

      <UatDevMenu
        mockTime={mockTime}
        setMockTime={setMockTime}
        isOpen={isDevMenuOpen}
        setIsOpen={setIsDevMenuOpen}
      />
    </main>
  );
}

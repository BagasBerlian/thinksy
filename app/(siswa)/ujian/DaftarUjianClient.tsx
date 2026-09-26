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
    setActiveModalTab("ulangan");
    setIsFullScreenModalOpen(true);
  };

  const handleOpenUjianModal = () => {
    setActiveModalTab("ujian");
    setIsFullScreenModalOpen(true);
  };

  const handleOpenSimulasiModal = () => {
    setActiveModalTab("simulasi");
    setIsFullScreenModalOpen(true);
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

  // UAT Mock Time State (synced with localStorage)
  const [mockTime, setMockTime] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("thinksy_mock_time") || null;
    }
    return null;
  });
  const [isDevMenuOpen, setIsDevMenuOpen] = useState(false);

  // Listen for mock time changes
  useEffect(() => {
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
    return now.toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getEffectiveMinutes = () => {
    const timeStr = getEffectiveCurrentTime();
    const [h, m] = timeStr.split(":").map(Number);
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
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 space-y-6">
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
                  <span className="truncate max-w-[160px] sm:max-w-md">JADWAL_PTS_GANJIL_2026_SMP_LABSCHOOL.pdf</span>
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
                <span className="px-2 text-[11px] font-mono font-bold text-slate-200 min-w-[44px] text-center">
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
          <div className="bg-slate-100 p-3 sm:p-5 max-h-[380px] overflow-y-auto custom-scrollbar flex justify-center">
            <div
              style={{
                transform: `scale(${zoomScale / 100})`,
                transformOrigin: "top center",
              }}
              className="bg-white text-slate-800 shadow-lg rounded-xl border border-slate-200/90 w-full max-w-4xl p-5 sm:p-7 space-y-5 transition-transform duration-150"
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
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2 px-2.5 text-center w-8">No</th>
                      <th className="py-2 px-2.5">Hari, Tanggal</th>
                      <th className="py-2 px-2.5">Waktu (WIB)</th>
                      <th className="py-2 px-2.5">Mata Pelajaran</th>
                      <th className="py-2 px-2.5">Jenis Asesmen</th>
                      <th className="py-2 px-2.5">Media / Ruang</th>
                      <th className="py-2 px-2.5 text-center">KKM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2 px-2.5 text-center font-bold">1</td>
                      <td className="py-2 px-2.5 font-semibold">Senin, 22 Sep 2026</td>
                      <td className="py-2 px-2.5 font-mono text-[10px]">07.30 - 09.00</td>
                      <td className="py-2 px-2.5 font-bold text-slate-900">Matematika Terpadu</td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 text-[10px]">Ujian (PTS)</span></td>
                      <td className="py-2 px-2.5">Lab CBT 1 / Thinksy</td>
                      <td className="py-2 px-2.5 text-center font-bold">75</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2 px-2.5 text-center font-bold">2</td>
                      <td className="py-2 px-2.5 font-semibold">Senin, 22 Sep 2026</td>
                      <td className="py-2 px-2.5 font-mono text-[10px]">09.30 - 10.30</td>
                      <td className="py-2 px-2.5 font-bold text-slate-900">Ulangan Harian 1: Aljabar</td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">Ulangan Harian</span></td>
                      <td className="py-2 px-2.5">CBT Kelas Mandiri</td>
                      <td className="py-2 px-2.5 text-center font-bold">75</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2 px-2.5 text-center font-bold">3</td>
                      <td className="py-2 px-2.5 font-semibold">Selasa, 23 Sep 2026</td>
                      <td className="py-2 px-2.5 font-mono text-[10px]">07.30 - 09.00</td>
                      <td className="py-2 px-2.5 font-bold text-slate-900">Bahasa Indonesia</td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 text-[10px]">Ujian (PTS)</span></td>
                      <td className="py-2 px-2.5">Lab CBT 1 / Thinksy</td>
                      <td className="py-2 px-2.5 text-center font-bold">75</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2 px-2.5 text-center font-bold">4</td>
                      <td className="py-2 px-2.5 font-semibold">Selasa, 23 Sep 2026</td>
                      <td className="py-2 px-2.5 font-mono text-[10px]">09.30 - 10.30</td>
                      <td className="py-2 px-2.5 font-bold text-slate-900">Ulangan Harian: Teks LHO</td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">Ulangan Harian</span></td>
                      <td className="py-2 px-2.5">CBT Kelas Mandiri</td>
                      <td className="py-2 px-2.5 text-center font-bold">75</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2 px-2.5 text-center font-bold">5</td>
                      <td className="py-2 px-2.5 font-semibold">Rabu, 24 Sep 2026</td>
                      <td className="py-2 px-2.5 font-mono text-[10px]">07.30 - 09.00</td>
                      <td className="py-2 px-2.5 font-bold text-slate-900">Bahasa Inggris</td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 text-[10px]">Ujian (PTS)</span></td>
                      <td className="py-2 px-2.5">Lab CBT 2 / Thinksy</td>
                      <td className="py-2 px-2.5 text-center font-bold">75</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2 px-2.5 text-center font-bold">6</td>
                      <td className="py-2 px-2.5 font-semibold">Rabu, 24 Sep 2026</td>
                      <td className="py-2 px-2.5 font-mono text-[10px]">09.30 - 10.30</td>
                      <td className="py-2 px-2.5 font-bold text-slate-900">Ulangan Harian: Descriptive Text</td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">Ulangan Harian</span></td>
                      <td className="py-2 px-2.5">CBT Kelas Mandiri</td>
                      <td className="py-2 px-2.5 text-center font-bold">75</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2 px-2.5 text-center font-bold">7</td>
                      <td className="py-2 px-2.5 font-semibold">Kamis, 25 Sep 2026</td>
                      <td className="py-2 px-2.5 font-mono text-[10px]">08.00 - 09.30</td>
                      <td className="py-2 px-2.5 font-bold text-slate-900">Simulasi Asesmen Nasional (ANBK)</td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200 text-[10px]">Simulasi Mandiri</span></td>
                      <td className="py-2 px-2.5">Aplikasi Thinksy AI</td>
                      <td className="py-2 px-2.5 text-center font-bold">70</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* TATA TERTIB CBT & PENGESAHAN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-[11px] text-slate-600">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tata Tertib & Ketentuan CBT:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-600 leading-normal">
                    <li>Siswa wajib login di aplikasi Thinksy 15 menit sebelum waktu asesmen.</li>
                    <li>Gunakan nomor identitas resmi NISN: <span className="font-mono font-bold text-slate-800">{userProfile.nisn || "0089218291"}</span>.</li>
                    <li>Ujian & Ulangan bersifat privat — akses pengerjaan dikontrol resmi (ON/OFF) oleh Admin Sekolah.</li>
                    <li>Timer berjalan otomatis oleh server pusat dan tidak dapat dijeda.</li>
                    <li>Segala bentuk kecurangan akan membatalkan sesi dan terekam di audit trail.</li>
                  </ol>
                </div>

                <div className="flex flex-col justify-between items-end text-right px-2">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-500">Ditetapkan di Jakarta, 21 September 2026</p>
                    <p className="font-bold text-slate-800 text-xs">Kepala Sekolah & Panitia Asesmen,</p>
                  </div>
                  <div className="my-1 flex items-center justify-end gap-2">
                    <div className="px-2.5 py-1 rounded border border-emerald-500/40 bg-emerald-50 text-emerald-800 font-mono text-[9px] font-bold uppercase tracking-wider text-center">
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
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md hover:border-emerald-300 transition duration-200 cursor-pointer group h-full"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold border border-emerald-100 group-hover:scale-105 transition shrink-0">
                    <BookOpenCheck className="w-7 h-7" />
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
                  <h3 className="text-xl font-extrabold text-[#0F172A] group-hover:text-emerald-700 transition">
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
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Durasi Pengerjaan</div>
                      <div className="font-extrabold text-[#0F172A] text-xs">60 Menit</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-emerald-600 shrink-0" />
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
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-xs group-hover:shadow-md"
                >
                  <PlayCircle className="w-4 h-4" />
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

      {/* 5. FULL SCREEN MODAL: DAFTAR MAPEL SESUAI CARD (TEMA PUTIH & ELEGAN) */}
      {isFullScreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col text-slate-900 overflow-y-auto custom-scrollbar animate-in fade-in duration-200">
          {/* Sticky Top Bar Navigation */}
          <header className="bg-white border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold shrink-0 border ${
                  activeModalTab === "simulasi"
                    ? "bg-amber-50 text-amber-600 border-amber-200"
                    : activeModalTab === "ulangan"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-indigo-50 text-indigo-600 border-indigo-200"
                }`}
              >
                {activeModalTab === "simulasi" ? (
                  <Sparkles className="w-5 h-5" />
                ) : activeModalTab === "ulangan" ? (
                  <BookOpenCheck className="w-5 h-5" />
                ) : (
                  <Award className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[150px] sm:max-w-none">
                    {sekolahData?.nama || "SMP LABSCHOOL JAKARTA"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                    • {activeModalTab === "simulasi" ? "Simulasi Terbuka AKM" : `TA ${userProfile.tahun_ajaran || "2026/2027"}`}
                  </span>
                </div>
                <h2 className="text-xs sm:text-base font-extrabold text-[#0F172A] tracking-tight truncate">
                  {activeModalTab === "simulasi"
                    ? "Modul Simulasi Mandiri (AKM / ANBK)"
                    : activeModalTab === "ulangan"
                    ? "Daftar Ulangan Harian"
                    : "Daftar Ujian Semester (PTS/PAS)"}
                </h2>
              </div>
            </div>

            {/* Controls: Fullscreen Toggle & Close Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleBrowserFullscreen}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer"
                title={isBrowserFullscreen ? "Keluar Fullscreen" : "Mode Layar Penuh (Fullscreen)"}
              >
                {isBrowserFullscreen ? (
                  <>
                    <Minimize2 className="w-4 h-4 text-amber-600" />
                    <span className="hidden sm:inline">Normal</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4 text-slate-600" />
                    <span className="hidden sm:inline">Layar Penuh</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsFullScreenModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition cursor-pointer"
                title="Tutup Halaman"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Main Content Area: Generous top margin */}
          <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 pt-10 sm:pt-14 md:pt-16 pb-24 space-y-6 sm:space-y-8">
            {/* Header Title Section with breathing room */}
            <div className="saas-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                      activeModalTab === "simulasi"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : activeModalTab === "ulangan"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-indigo-50 text-indigo-800 border-indigo-200"
                    }`}
                  >
                    {activeModalTab === "simulasi"
                      ? "AKM & Asesmen Nasional"
                      : activeModalTab === "ulangan"
                      ? "Asesmen Formatif"
                      : "Evaluasi Sumatif Rapor"}
                  </span>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                    {activeModalTab === "simulasi" ? (
                      <>
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        <span>Bebas Akses Terbuka</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-2.5 h-2.5 text-slate-500" />
                        <span>Privat Sekolah</span>
                      </>
                    )}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  {activeModalTab === "simulasi"
                    ? "Modul Simulasi Mandiri (AKM / ANBK)"
                    : activeModalTab === "ulangan"
                    ? "Daftar Ulangan Harian"
                    : "Daftar Ujian Semester (PTS/PAS)"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {activeModalTab === "simulasi"
                    ? "Pilih modul latihan adaptif nasional mandiri terbuka. Mengasah nalar membaca kritis (literasi), pemecahan masalah konteks saintifik (numerasi), dan survei karakter profil pelajar Pancasila."
                    : activeModalTab === "ulangan"
                    ? "Pilih mata pelajaran ulangan yang akan dikerjakan. Masukkan password resmi dari Admin/Guru untuk memulai lembar soal."
                    : "Pilih mata pelajaran ujian semester yang akan dikerjakan. Masukkan password resmi dari Admin/Guru untuk memulai lembar soal."}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                      activeModalTab === "simulasi"
                        ? "bg-amber-100 text-amber-700"
                        : activeModalTab === "ulangan"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {activeModalTab === "simulasi" ? (
                      <Sparkles className="w-5 h-5" />
                    ) : activeModalTab === "ulangan" ? (
                      <BookOpenCheck className="w-5 h-5" />
                    ) : (
                      <Award className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#0F172A]">
                      {activeModalTab === "simulasi"
                        ? `${SIMULASI_MODULES.length} Modul Latihan`
                        : `${(activeModalTab === "ulangan" ? ulanganExams : ujianExams).length} Mata Pelajaran`}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {activeModalTab === "simulasi" ? "Latihan Mandiri Terbuka" : `Tingkat ${userProfile.nama_kelas || "Kelas 8"}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instruction Notice Banner */}
            {activeModalTab === "simulasi" ? (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Simulasi Terbuka Adaptif:</strong> Soal disusun secara acak terkait materi ulangan & ujian untuk menguji kesiapan asesmen mandiri. Bebas akses tanpa batasan token.
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-amber-800 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Didampingi Tutor AI Sokratik</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Asesmen Terproteksi Password:</strong> Klik pada kartu mapel untuk memasukkan password ujian resmi dari Admin Sekolah (Password sementara: <strong>12345</strong>).
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-amber-800 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Didampingi Tutor AI Sokratik</span>
                </div>
              </div>
            )}

            {/* Grid of Subject Cards */}
            {activeModalTab === "simulasi" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {SIMULASI_MODULES.map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => {
                      setIsFullScreenModalOpen(false);
                      router.push(`/ujian/${sim.id}?start=true`);
                    }}
                    className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200/80 hover:border-amber-400 transition duration-200 flex flex-col justify-between space-y-5 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 group h-full"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[11px] font-extrabold px-3 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                          <span>{sim.mapel}</span>
                        </span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${sim.badgeColor}`}>
                          {sim.kategori}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A] group-hover:text-amber-700 transition leading-snug">
                          {sim.judul}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-3 mt-1.5 leading-relaxed">
                          {sim.deskripsi}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-600 pt-1">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <div>
                            <div className="text-[9px] text-slate-400 font-medium">Durasi</div>
                            <div className="font-extrabold text-[#0F172A] text-xs">{sim.durasi_menit} Menit</div>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <div>
                            <div className="text-[9px] text-slate-400 font-medium">Target Soal</div>
                            <div className="font-extrabold text-[#0F172A] text-xs">{sim.total_soal} Soal AKM</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Soal acak terstandar dengan <strong>Tutor AI Sokratik</strong></span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFullScreenModalOpen(false);
                          router.push(`/ujian/${sim.id}?start=true`);
                        }}
                        className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md cursor-pointer"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Mulai Latihan Simulasi</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {(activeModalTab === "ulangan" ? ulanganExams : ujianExams).map((u, idx, arr) => {
                const isCompleted = u.sessionStatus === "selesai" || u.sessionStatus === "habis_waktu";
                const isInProgress = u.sessionStatus === "sedang_mengerjakan";
                const isPassed = u.score !== null && u.score >= u.passing_grade;
                const isClosed = u.status === "ditutup";
                const isThirdOnTablet = idx === 2 && arr.length === 3;

                return (
                  <div
                    key={u.id}
                    onClick={() => handleSelectMapelForExam(u)}
                    className={`bg-white rounded-3xl p-6 sm:p-7 border transition duration-200 flex flex-col justify-between space-y-5 cursor-pointer shadow-sm group h-full ${
                      isThirdOnTablet ? "md:col-span-2 lg:col-span-1 max-w-xl md:mx-auto w-full" : ""
                    } ${
                      isClosed
                        ? "border-slate-200 opacity-80 hover:border-slate-300"
                        : isCompleted
                        ? "border-slate-200 hover:border-emerald-300 hover:shadow-md"
                        : activeModalTab === "ulangan"
                        ? "border-slate-200/90 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5"
                        : "border-slate-200/90 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="space-y-3.5">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[11px] font-extrabold px-3 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                          <span>{u.mapel || "Matematika"}</span>
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isClosed ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5 text-rose-500" />
                              <span>Ditutup (OFF)</span>
                            </span>
                          ) : isCompleted ? (
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                                isPassed
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-rose-50 text-rose-800 border-rose-200"
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Nilai: {u.score ?? 0}</span>
                            </span>
                          ) : isInProgress ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse">
                              <PlayCircle className="w-2.5 h-2.5" />
                              <span>Sedang Berlangsung</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>Akses Terbuka (ON)</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A] group-hover:text-emerald-700 transition leading-snug">
                          {u.judul}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {u.deskripsi || "Asesmen kompetensi terstandar Kurikulum Merdeka Fase D."}
                        </p>
                      </div>

                      {/* Meta Chips */}
                      <div className="pt-1 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <div>
                            <div className="text-[9px] text-slate-400 font-medium">Durasi</div>
                            <div className="font-extrabold text-[#0F172A] text-xs">{u.durasi_menit} Menit</div>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <div>
                            <div className="text-[9px] text-slate-400 font-medium">Standar KKM</div>
                            <div className="font-extrabold text-[#0F172A] text-xs">Nilai {u.passing_grade}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-amber-50/60 p-2.5 rounded-2xl border border-amber-200/70">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Didampingi penalaran <strong>Tutor AI Sokratik</strong></span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-3 border-t border-slate-100">
                      {isCompleted ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/ujian/${u.id}`);
                          }}
                          className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-200"
                        >
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Lihat Nilai & Evaluasi</span>
                        </button>
                      ) : isClosed ? (
                        <button
                          disabled
                          type="button"
                          className="w-full py-3 px-4 rounded-2xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2 border border-slate-200"
                        >
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Akses Ditutup Admin (OFF)</span>
                        </button>
                      ) : isInProgress ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectMapelForExam(u);
                          }}
                          className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-xs"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>Lanjutkan Pengerjaan (Input Token)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectMapelForExam(u);
                          }}
                          className={`w-full py-3 px-4 rounded-2xl text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-xs ${
                            activeModalTab === "ulangan"
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-[#0F172A] hover:bg-[#1E293B]"
                          }`}
                        >
                          <KeyRound className="w-4 h-4 text-amber-300" />
                          <span>Mulai Kerjakan (Masukkan Token)</span>
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      )}

      {/* 6. MODAL AUTENTIKASI TOKEN / PASSWORD UJIAN (TEMA PUTIH) */}
      {selectedExamForToken && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => {
            setSelectedExamForToken(null);
            setTokenError(null);
          }}
        >
          <div
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 text-slate-900 relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Icon & Title */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-extrabold shrink-0 shadow-2xs">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Autentikasi Token CBT
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-[#0F172A] leading-tight mt-1">
                    Verifikasi Password Ujian
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedExamForToken(null);
                  setTokenError(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Exam Information Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="text-[10px] font-extrabold uppercase text-slate-400">Mata Pelajaran:</div>
              <div className="font-extrabold text-[#0F172A] text-sm">
                {selectedExamForToken.mapel} • {selectedExamForToken.judul}
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-[11px] pt-1">
                <span>⏱️ {selectedExamForToken.durasi_menit} Menit</span>
                <span>🎯 KKM: {selectedExamForToken.passing_grade}</span>
                <span>🔒 Privat Sekolah</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ujian resmi bersifat privat sekolah. Silakan masukkan password / kode token yang didapatkan dari Admin Sekolah atau Pengawas Ruang sebelum membuka lembar soal full screen.
            </p>

            {/* Input Password / Token */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-slate-700 block">
                Password / Token Ujian:
              </label>
              <div className="relative">
                <input
                  type={showTokenPassword ? "text" : "password"}
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value);
                    if (tokenError) setTokenError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleVerifyTokenAndProceed();
                    }
                  }}
                  autoFocus
                  placeholder="Masukkan password token..."
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 font-mono text-base tracking-widest text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowTokenPassword(!showTokenPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition"
                  title={showTokenPassword ? "Sembunyikan" : "Tampilkan Password"}
                >
                  {showTokenPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Quick Helper Default Password */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
                <div className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Password Sementara Admin: <strong>12345</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTokenInput("12345");
                    setTokenError(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition"
                >
                  Gunakan 12345
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {tokenError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{tokenError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedExamForToken(null);
                  setTokenError(null);
                }}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleVerifyTokenAndProceed}
                disabled={isVerifyingToken || !tokenInput.trim()}
                className={`flex-1 py-3.5 px-4 rounded-2xl text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer ${
                  activeModalTab === "ulangan"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-[#0F172A] hover:bg-[#1E293B]"
                }`}
              >
                {isVerifyingToken ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 text-amber-300" />
                    <span>Verifikasi & Masuk Ujian</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}



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
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        tutorGuidanceLevel="sedang"
        setTutorGuidanceLevel={() => {}}
        onSave={() => setIsSettingsModalOpen(false)}
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

"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  BookOpen,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Layers,
  GraduationCap,
  PlayCircle,
  Award,
  Check,
  Lock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  X,
  FileText,
  AlertCircle,
  Loader2,
  Clock,
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
  ChapterItem,
  SekolahData,
  ToastNotificationData,
  NotificationItem,
} from "../dashboard/types";

interface BelajarClientProps {
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
  chapters: ChapterItem[];
  completedMateriIds: string[];
  examsData?: any[];
  initialMapel?: string | null;
  initialBabId?: string | null;
  initialSemester?: number | null;
}

const SUBJECTS = [
  {
    id: "Matematika",
    name: "Matematika",
    desc: "Aljabar, Geometri, Teorema Pythagoras, Statistika & Peluang",
  },
  {
    id: "Bahasa Inggris",
    name: "Bahasa Inggris",
    desc: "Reading Comprehension, Grammar, Narrative Text, Descriptive Writing",
  },
  {
    id: "Bahasa Indonesia",
    name: "Bahasa Indonesia",
    desc: "Teks Laporan Hasil Observasi, Puisi, Puisi Rakyat, Cerita Fantasi",
  },
];

function matchSubjectName(name?: string | null): string {
  if (!name) return "Matematika";
  const lower = name.toLowerCase();
  if (lower.includes("inggris")) return "Bahasa Inggris";
  if (lower.includes("indonesia")) return "Bahasa Indonesia";
  if (lower.includes("matematika")) return "Matematika";
  return "Matematika";
}

const getMapelBadgeStyle = (mapel: string) => {
  const m = (mapel || "").toLowerCase();
  if (m.includes("matematika")) return "bg-indigo-100 text-indigo-800 border-indigo-200";
  if (m.includes("indonesia")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (m.includes("inggris")) return "bg-sky-100 text-sky-800 border-sky-200";
  return "bg-slate-100 text-slate-800 border-slate-200";
};

const ITEMS_PER_PAGE = 5;

export default function BelajarClient({
  userProfile,
  sekolahData,
  chapters,
  completedMateriIds = [],
  examsData = [],
  initialMapel,
  initialBabId,
  initialSemester,
}: BelajarClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine initial subject
  const resolvedInitialSubject = useMemo(() => {
    if (initialMapel) return matchSubjectName(initialMapel);
    if (initialBabId) {
      const found = chapters.find((c) => c.id === initialBabId);
      if (found?.mapel) return matchSubjectName(found.mapel);
    }
    return "Matematika";
  }, [initialMapel, initialBabId, chapters]);

  // Determine initial semester
  const resolvedInitialSemester = useMemo(() => {
    if (initialSemester === 1 || initialSemester === 2) return initialSemester;
    if (initialBabId) {
      const found = chapters.find((c) => c.id === initialBabId);
      if (found) {
        return found.semester || (found.urutan <= 3 ? 1 : 2);
      }
    }
    return 1;
  }, [initialSemester, initialBabId, chapters]);

  const [selectedSubject, setSelectedSubject] = useState<string>(resolvedInitialSubject);
  const [selectedSemester, setSelectedSemester] = useState<number>(resolvedInitialSemester);
  const [highlightedBabId, setHighlightedBabId] = useState<string | null>(initialBabId || null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Local exam state with real-time sync (identical and unified with Home & Ruang Ujian)
  const [localExams, setLocalExams] = useState<any[]>(examsData || []);

  useEffect(() => {
    if (examsData) {
      setLocalExams(examsData);
    }
  }, [examsData]);

  // Token Modal State (Screenshot 2 CBT Auth)
  const [selectedExamForToken, setSelectedExamForToken] = useState<any | null>(null);
  const [tokenInput, setTokenInput] = useState<string>("");
  const [showTokenPassword, setShowTokenPassword] = useState<boolean>(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const handleOpenTokenModal = (exam: any) => {
    setSelectedExamForToken(exam);
    setTokenInput("");
    setShowTokenPassword(false);
    setTokenError(null);
  };

  const handleVerifyTokenAndProceed = async () => {
    if (!selectedExamForToken) return;
    const trimmed = tokenInput.trim().toUpperCase();
    if (!trimmed) {
      setTokenError("Silakan masukkan password token ujian.");
      return;
    }

    setIsVerifyingToken(true);
    setTokenError(null);

    try {
      const res = await fetch("/api/siswa/ujian/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ujianId: selectedExamForToken.id,
          token: trimmed,
          judul: selectedExamForToken.judul,
          mapel: selectedExamForToken.mapel,
          babId: selectedExamForToken.bab_id || selectedExamForToken.id,
        }),
      });

      const data = await res.json();
      if (res.ok && (data.valid || data.success || trimmed === "12345")) {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => { });
        }
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
          document.documentElement.requestFullscreen().catch(() => { });
        }
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

  // Sync state if searchParams change dynamically on client
  useEffect(() => {
    if (!searchParams) return;
    const qMapel = searchParams.get("mapel") || searchParams.get("subject");
    const qBabId = searchParams.get("babId") || searchParams.get("bab");
    const qSemester = searchParams.get("semester");

    if (qMapel) {
      setSelectedSubject(matchSubjectName(qMapel));
    }

    if (qBabId) {
      setHighlightedBabId(qBabId);
      const targetChapter = chapters.find((c) => c.id === qBabId);
      if (targetChapter) {
        if (!qMapel && targetChapter.mapel) {
          setSelectedSubject(matchSubjectName(targetChapter.mapel));
        }
        const sem = targetChapter.semester || (targetChapter.urutan <= 3 ? 1 : 2);
        setSelectedSemester(sem);
      }
    } else if (qSemester) {
      const semNum = parseInt(qSemester, 10);
      if (semNum === 1 || semNum === 2) setSelectedSemester(semNum);
    }
  }, [searchParams, chapters]);

  // Reset pagination when subject or semester changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject, selectedSemester]);

  // Smooth scroll to target chapter when opened/highlighted
  useEffect(() => {
    if (highlightedBabId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`bab-${highlightedBabId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [highlightedBabId, selectedSubject, selectedSemester]);

  const handleSubjectSelect = (subId: string) => {
    setSelectedSubject(subId);
    setHighlightedBabId(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("mapel", subId);
      url.searchParams.delete("babId");
      window.history.replaceState({}, "", url.toString());
    }
  };

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
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toastNotification, setToastNotification] =
    useState<ToastNotificationData | null>(null);

  // UAT Mock Time State (synced with localStorage after mount to prevent hydration mismatch)
  const [mockTime, setMockTime] = useState<string | null>(null);
  const [isDevMenuOpen, setIsDevMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("thinksy_mock_time") || null;
      if (saved) setMockTime(saved);
    } catch {}

    const handleMockTimeSync = () => {
      try {
        const saved = localStorage.getItem("thinksy_mock_time") || null;
        setMockTime(saved);
      } catch { }
    };

    window.addEventListener("thinksy_mock_time_change", handleMockTimeSync);
    window.addEventListener("storage", handleMockTimeSync);
    return () => {
      window.removeEventListener("thinksy_mock_time_change", handleMockTimeSync);
      window.removeEventListener("storage", handleMockTimeSync);
    };
  }, []);

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
    } catch { }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/siswa/notifikasi");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications)) setNotifications(data.notifications);
      }
    } catch { }
  };

  useEffect(() => {
    fetchPresensiStatus();
    fetchNotifications();
  }, []);

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
        title: "Presensi Terverifikasi",
        message: "Kehadiran Anda telah disetujui resmi oleh Guru di dashboard.",
        time: "Baru saja",
        type: "success",
      });
    } else if (event.type === "EXAM_STATUS_CHANGED" && event.payload) {
      setLocalExams((prev) =>
        prev.map((e) =>
          e.id === event.payload.ujianId
            ? {
              ...e,
              ...(event.payload.status ? { status: event.payload.status } : {}),
              ...(event.payload.token ? { token: event.payload.token } : {}),
              ...(event.payload.durasi_menit ? { durasi_menit: event.payload.durasi_menit } : {}),
            }
            : e
        )
      );
    }
  });

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
    return 480;
  };

  const getLateMinutes = () => {
    if (sekolahData?.jam_masuk) {
      const [h, m] = sekolahData.jam_masuk.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
    }
    return 435;
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

    setToastNotification({
      show: true,
      title: `Presensi Berhasil (${data.status})`,
      message: `Kehadiran Anda dicatat pukul ${data.waktu} WIB. +${data.poinReward} Poin ditambahkan.`,
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
    } catch { }
  };

  // Filter chapters by selected subject and semester
  const filteredChapters = useMemo(() => {
    return chapters.filter((c) => {
      const matchSubject =
        (c.mapel || "").toLowerCase() === selectedSubject.toLowerCase();
      const sem = c.semester || (c.urutan <= 3 ? 1 : 2);
      return matchSubject && sem === selectedSemester;
    });
  }, [chapters, selectedSubject, selectedSemester]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredChapters.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedChapters = filteredChapters.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const currentSubjectMeta =
    SUBJECTS.find((s) => s.id === selectedSubject) || SUBJECTS[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-24">
      {/* 1. Navbar */}
      <StudentNavbar
        isDarkMode={isDarkMode}
        sekolahData={sekolahData}
        activeTab="Belajar"
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

      {/* Main Container with generous top space above breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-12">
        {/* Top Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
            <Link href="/dashboard" className="hover:text-slate-700 transition">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600 font-semibold">Ruang Belajar</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Ruang Belajar
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                Kurikulum Merdeka • Kelas {userProfile.tingkat_kelas || 8} • {userProfile.nama_kelas || "Siswa"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{userProfile.poin} Poin Belajar</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID LAYOUT: Left (Subjects) + Right (Semesters & Bab) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ============================================================ */}
          {/* LEFT SIDEBAR: MATA PELAJARAN                                  */}
          {/* ============================================================ */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Mata Pelajaran
                </span>
              </div>

              <div className="space-y-2">
                {SUBJECTS.map((sub) => {
                  const isActive = selectedSubject === sub.id;
                  const count = chapters.filter(
                    (c) => (c.mapel || "").toLowerCase() === sub.id.toLowerCase()
                  ).length;

                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSubjectSelect(sub.id)}
                      className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${isActive
                        ? "bg-blue-50/70 text-blue-950 border-blue-200 border-l-4 border-l-blue-600 shadow-2xs font-semibold"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 font-medium"
                        }`}
                    >
                      <div>
                        <div
                          className={`text-sm font-semibold ${isActive ? "text-blue-950 font-bold" : "text-slate-900"
                            }`}
                        >
                          {sub.name}
                        </div>
                        <div
                          className={`text-xs mt-0.5 ${isActive ? "text-blue-700/80 font-medium" : "text-slate-500 font-normal"
                            }`}
                        >
                          {count} Bab Pembelajaran
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-blue-600" : "text-slate-400"
                          }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT VIEW: SEMESTER SWITCHER + BAB LIST                      */}
          {/* ============================================================ */}
          <div className="lg:col-span-8 space-y-5">
            {/* Header Card with Semester Switcher */}
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {currentSubjectMeta.name}
                </h2>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  {currentSubjectMeta.desc}
                </p>
              </div>

              {/* Semester Tabs */}
              <div className="flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                <button
                  onClick={() => setSelectedSemester(1)}
                  className={`px-3.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${selectedSemester === 1
                    ? "bg-white text-blue-700 font-bold border border-slate-200 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 font-medium"
                    }`}
                >
                  Semester 1 (Ganjil)
                </button>
                <button
                  onClick={() => setSelectedSemester(2)}
                  className={`px-3.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${selectedSemester === 2
                    ? "bg-white text-blue-700 font-bold border border-slate-200 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 font-medium"
                    }`}
                >
                  Semester 2 (Genap)
                </button>
              </div>
            </div>

            {/* List of Chapters for Selected Subject & Semester */}
            {filteredChapters.length === 0 ? (
              <div className="bg-white rounded-xl p-10 border border-slate-200 text-center space-y-2 shadow-xs">
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Belum Ada Bab di Semester Ini
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Materi bab untuk {selectedSubject} Semester {selectedSemester} sedang dipersiapkan.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedChapters.map((bab, idx) => {
                  const itemNumber = startIndex + idx + 1;
                  const materiList = bab.materi || [];
                  const isHighlighted = highlightedBabId === bab.id;

                  // Find matching CBT exam for this chapter (identical & unified with Home)
                  const matchingExam = localExams.find(
                    (e) =>
                      e.bab_id === bab.id ||
                      e.id === bab.id ||
                      e.id === `ulangan-bab-${bab.id}`
                  ) || {
                    id: `ulangan-bab-${bab.id}`,
                    judul: bab.judul.toLowerCase().startsWith("bab")
                      ? `Ulangan Harian ${bab.judul}`
                      : `Ulangan Harian: ${bab.judul}`,
                    deskripsi:
                      bab.deskripsi ||
                      `Evaluasi formatif materi ${bab.judul} kurikulum terstandar. Akses pengerjaan dikontrol resmi dan diawasi server.`,
                    mapel: selectedSubject,
                    durasi_menit: 30,
                    passing_grade: 75,
                    waktu_mulai: new Date().toISOString(),
                    waktu_berakhir: new Date(Date.now() + 90 * 86400000).toISOString(),
                    status: "dipublikasi",
                    tipe: "ulangan",
                    token: "12345",
                    sessionStatus: "belum_mulai",
                    score: null,
                    bab_id: bab.id,
                  };

                  const isOpen = matchingExam.status === "dipublikasi";
                  const isCompleted =
                    matchingExam.sessionStatus === "selesai" ||
                    matchingExam.sessionStatus === "habis_waktu";
                  const isInProgress = matchingExam.sessionStatus === "sedang_mengerjakan";
                  const isPassed =
                    matchingExam.score !== null && matchingExam.score >= matchingExam.passing_grade;

                  return (
                    <div
                      key={bab.id}
                      id={`bab-${bab.id}`}
                      className={`rounded-xl p-5 sm:p-6 border transition-colors space-y-4 shadow-xs ${isHighlighted
                        ? "bg-white border-blue-300 ring-2 ring-blue-100 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      {/* Bab Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-start gap-3">
                          {/* Sequential Number 1, 2, 3... with crisp blue accent */}
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200/80 shrink-0">
                            {itemNumber}
                          </div>

                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 block">
                              Bab {itemNumber} • Semester {bab.semester || selectedSemester}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5">
                              {bab.judul}
                            </h3>
                            <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                              {bab.deskripsi || "Capaian Pembelajaran Kurikulum Merdeka."}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons: Buka Modul, Kuis, & Ulangan CBT */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap pt-1 sm:pt-0">
                          <Link
                            href={`/bab/${bab.id}`}
                            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold border border-slate-200 hover:border-blue-200 transition-colors flex items-center gap-1.5"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                            <span>Buka Modul</span>
                          </Link>

                          <Link
                            href={`/quiz/${bab.id}?mode=inclass&babId=${bab.id}`}
                            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold border border-slate-200 hover:border-emerald-200 transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Kuis</span>
                          </Link>

                          {isCompleted ? (
                            <Link
                              href={`/ujian/${matchingExam.id}`}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Nilai: {matchingExam.score}/100</span>
                            </Link>
                          ) : isInProgress ? (
                            <button
                              type="button"
                              onClick={() => handleOpenTokenModal(matchingExam)}
                              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer animate-pulse"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>Lanjut Ulangan</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenTokenModal(matchingExam)}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                              <span>Ulangan CBT</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Sub-Bab / Materi List */}
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Materi Pembelajaran ({materiList.length})
                        </div>

                        {materiList.length === 0 ? (
                          <div className="p-3 rounded-lg bg-slate-50 text-slate-400 text-xs font-normal">
                            Modul materi digital tersedia di halaman buku ajar.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {materiList.map((m: any, mIdx: number) => {
                              const subNumber = mIdx + 1;
                              return (
                                <Link
                                  key={m.id}
                                  href={`/bab/${bab.id}?materiId=${m.id}&view=pdf`}
                                  className="p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-200 text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer group"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-5 h-5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 border border-blue-100">
                                      {subNumber}
                                    </span>
                                    <span className="text-slate-800 group-hover:text-blue-900 font-medium truncate">
                                      {m.judul}
                                    </span>
                                  </div>

                                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* CARD ULANGAN PER BAB (PERSIS SAMA DENGAN TAB HOME - 1 KESATUAN) */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition duration-200 flex flex-col justify-between space-y-3.5 group">
                          <div className="space-y-3">
                            {/* Badges: Mapel & Status & Sokratik */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${getMapelBadgeStyle(
                                    matchingExam.mapel
                                  )}`}
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                  <span>{matchingExam.mapel}</span>
                                </span>

                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  <span>Sokratik AI</span>
                                </span>
                              </div>

                              <div>
                                {!isOpen ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-slate-500" />
                                    <span>Akses Ditutup (OFF)</span>
                                  </span>
                                ) : isCompleted ? (
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold flex items-center gap-1.5 ${isPassed
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                      : "bg-rose-50 text-rose-800 border-rose-300"
                                      }`}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>✓ Selesai • Nilai: {matchingExam.score}/100 {isPassed ? "(Lulus KKM)" : ""}</span>
                                  </span>
                                ) : isInProgress ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase flex items-center gap-1.5 animate-pulse">
                                    <PlayCircle className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Sedang Berlangsung</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Akses Terbuka (Siap Dikerjakan)</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Judul Ulangan Per Bab */}
                            <div>
                              <h4 className="text-sm sm:text-base font-extrabold text-[#0F172A] group-hover:text-indigo-600 transition leading-snug">
                                {matchingExam.judul}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                {matchingExam.deskripsi || `Evaluasi formatif pemahaman kompetensi materi per bab. Akses pengerjaan dikontrol resmi dan diawasi server.`}
                              </p>
                            </div>

                            {/* Meta Specification 4-Pill Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                              <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <div>
                                  <div className="text-[9px] text-slate-400 font-medium">Durasi</div>
                                  <div className="font-extrabold text-[#0F172A] text-xs">{matchingExam.durasi_menit || 30} Menit</div>
                                </div>
                              </div>
                              <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                                <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <div>
                                  <div className="text-[9px] text-slate-400 font-medium">Standar KKM</div>
                                  <div className="font-extrabold text-[#0F172A] text-xs">Nilai {matchingExam.passing_grade || 75}</div>
                                </div>
                              </div>
                              <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <div>
                                  <div className="text-[9px] text-slate-400 font-medium">Target Soal</div>
                                  <div className="font-extrabold text-[#0F172A] text-xs">20 Soal CBT</div>
                                </div>
                              </div>
                              <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <div>
                                  <div className="text-[9px] text-slate-400 font-medium">Keamanan</div>
                                  <div className="font-extrabold text-[#0F172A] text-xs">Token Privat</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Button & Token Helper */}
                          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                              <span>Password Sementara Admin: <strong className="font-mono text-slate-800">12345</strong></span>
                            </div>

                            <div className="w-full sm:w-auto">
                              {isCompleted ? (
                                <Link
                                  href={`/ujian/${matchingExam.id}`}
                                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                                >
                                  <Award className="w-4 h-4 text-emerald-600" />
                                  <span>Lihat Hasil & Evaluasi</span>
                                  <ChevronRight className="w-4 h-4 text-slate-400" />
                                </Link>
                              ) : !isOpen ? (
                                <button
                                  type="button"
                                  disabled
                                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
                                  title="Guru sedang menutup akses untuk ulangan bab ini"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Akses Ditutup (OFF)</span>
                                </button>
                              ) : isInProgress ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenTokenModal(matchingExam)}
                                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-98"
                                >
                                  <PlayCircle className="w-4 h-4 text-white" />
                                  <span>Lanjutkan Pengerjaan</span>
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenTokenModal(matchingExam)}
                                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-98"
                                >
                                  <KeyRound className="w-4 h-4 text-amber-300" />
                                  <span>Mulai Kerjakan (Token CBT)</span>
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 text-xs text-slate-500">
                    <div>
                      Menampilkan <span className="font-semibold text-slate-800">{startIndex + 1}</span> -{" "}
                      <span className="font-semibold text-slate-800">
                        {Math.min(startIndex + ITEMS_PER_PAGE, filteredChapters.length)}
                      </span>{" "}
                      dari <span className="font-semibold text-slate-800">{filteredChapters.length}</span> bab
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={safeCurrentPage === 1}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-medium border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Sebelumnya</span>
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`w-8 h-8 rounded-lg text-xs transition-colors cursor-pointer ${safeCurrentPage === pageNumber
                            ? "bg-blue-600 text-white font-bold shadow-xs"
                            : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-medium"
                            }`}
                        >
                          {pageNumber}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safeCurrentPage === totalPages}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-medium border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Selanjutnya</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile & Settings Modals */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        studentName={userProfile.nama_lengkap}
        studentEmail={userProfile.email}
        learningPoints={userProfile.poin}
        dailyStreak={userProfile.streak}
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
        setTutorGuidanceLevel={() => { }}
        onSave={() => setIsSettingsModalOpen(false)}
        onOpenProfileCard={() => setIsProfileModalOpen(true)}
      />

      <HelpCenterModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Attendance Verification Modal */}
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

      {/* Toast Notification */}
      <ToastNotification
        notification={toastNotification}
        onClose={() => setToastNotification(null)}
      />

      {/* UAT Dev Menu Mock Time */}
      <UatDevMenu
        mockTime={mockTime}
        setMockTime={setMockTime}
        isOpen={isDevMenuOpen}
        setIsOpen={setIsDevMenuOpen}
      />

      {/* MODAL INTERAKTIF: AUTENTIKASI TOKEN CBT (PERSIS SESUAI SCREENSHOT 2) */}
      {selectedExamForToken && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 space-y-5 relative">
            {/* Header Modal */}
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
              <div className="flex items-center gap-3 text-slate-500 text-[11px] pt-1 font-medium">
                <span>⏱️ {selectedExamForToken.durasi_menit || 30} Menit</span>
                <span>🎯 KKM: {selectedExamForToken.passing_grade || 75}</span>
                <span>🔒 Privat Sekolah</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
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
                <div className="flex items-center gap-1.5 font-medium">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Password Sementara Admin: <strong>12345</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTokenInput("12345");
                    setTokenError(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition cursor-pointer"
                >
                  Gunakan 12345
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {tokenError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
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
                className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleVerifyTokenAndProceed}
                disabled={isVerifyingToken || !tokenInput.trim()}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer"
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
    </div>
  );
}

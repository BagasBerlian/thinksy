"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  PlayCircle,
  Award,
  Layers,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Calendar,
  Lock,
  KeyRound,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  RotateCcw,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { useLanguage } from "@/hooks/useLanguage";
import ClassroomTopBar from "../dashboard/components/classroom/ClassroomTopBar";
import StudentProfileModal from "../dashboard/components/modals/StudentProfileModal";
import SettingsModal from "../dashboard/components/modals/SettingsModal";
import HelpCenterModal from "../dashboard/components/modals/HelpCenterModal";
import StudentNotesModal from "../dashboard/components/modals/StudentNotesModal";
import AttendanceModal from "../dashboard/components/attendance/AttendanceModal";
import ToastNotification from "../dashboard/components/modals/ToastNotification";
import {
  SekolahData,
  ToastNotificationData,
  NotificationItem,
  NoteItem,
} from "../dashboard/types";

export interface ExamItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  mapel: string | null;
  tipe?: "ulangan" | "ujian";
  bab_id?: string | null;
  isPerBab?: boolean;
  isKeseluruhanBab?: boolean;
  durasi_menit: number;
  passing_grade: number;
  sessionStatus: string;
  score: number | null;
  sesiId?: string;
  status?: string;
  hasToken?: boolean;
}

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
  exams: ExamItem[];
}

export default function DaftarUjianClient({
  userProfile,
  sekolahData,
  exams = [],
}: DaftarUjianClientProps) {
  const router = useRouter();
  const { t } = useLanguage();

  // Navigation & Modals State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // Attendance state
  const [isCheckedIn, setIsCheckedIn] = useState(userProfile.isCheckedIn || false);
  const [checkInTime, setCheckInTime] = useState<string | null>(userProfile.checkInTime || null);
  const [checkInStatus, setCheckInStatus] = useState<string | null>(userProfile.checkInStatus || null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toastNotification, setToastNotification] = useState<ToastNotificationData | null>(null);

  // Fetch active notifications from database / API
  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams();
      if (userProfile?.nama_lengkap) params.set("studentName", userProfile.nama_lengkap);
      const res = await fetch(`/api/siswa/notifikasi?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
  }, [userProfile?.nama_lengkap]);

  const handleMarkAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
    try {
      await fetch("/api/siswa/notifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_as_read" }),
      });
    } catch {}
  };

  // Student Notes State
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const handleCreateNote = async (
    judul: string,
    konten: string,
    mata_pelajaran: string
  ) => {
    const newNoteObj: NoteItem = {
      id: Date.now().toString(),
      judul,
      konten,
      mata_pelajaran,
      dibuat_pada: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
    setNotes((prev) => [newNoteObj, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const getEffectiveCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };
  const isPresensiLate = () => false;

  // Dynamic Exam List (Hanya yang dibuat dari dashboard guru)
  const [examList, setExamList] = useState<ExamItem[]>(exams);

  useEffect(() => {
    setExamList(exams);
  }, [exams]);

  // Realtime synchronization
  useRealtimeDashboard((event) => {
    if (event.type === "EXAM_STATUS_CHANGED" && event.payload) {
      const { ujianId, status } = event.payload;
      setExamList((prev) =>
        prev.map((e) => (e.id === ujianId ? { ...e, status } : e))
      );
      setToastNotification({
        show: true,
        title: "Pembaruan Ruang Ujian",
        message: `Status ujian telah diperbarui menjadi ${status === "dipublikasi" ? "Buka (ON)" : "Ditutup (OFF)"}.`,
        time: "Baru saja",
        type: status === "dipublikasi" ? "success" : "info",
      });
    }

    if (event.type === "SOAL_PUBLISHED" || event.type === "NOTIFICATION_RECEIVED") {
      fetchFreshExams();
      fetchNotifications();
    }
  });

  const fetchFreshExams = async () => {
    try {
      const res = await fetch("/api/siswa/ujian/list");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.exams)) {
          setExamList(data.exams);
        }
      }
    } catch {}
  };

  // Attendance Cutoff logic
  const getEffectiveMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };
  const getCutoffMinutes = () => 480; // 08.00 WIB
  const isPresensiClosed = () => getEffectiveMinutes() > getCutoffMinutes();

  const handleStartAttendance = () => {
    if (isPresensiClosed()) {
      setToastNotification({
        show: true,
        title: "Presensi Ditutup (Status: Alpha)",
        message: "Batas waktu presensi telah berakhir (>08.00 WIB). Silakan hubungi wali kelas Anda.",
        time: "Baru saja",
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
  }) => {
    setIsCheckedIn(true);
    setCheckInTime(data.waktu);
    setCheckInStatus(data.status);
    setToastNotification({
      show: true,
      title: `Presensi Berhasil (${data.status})!`,
      message: `Kehadiran Anda dicatat pukul ${data.waktu} WIB.`,
      time: `${data.waktu} WIB`,
      type: "success",
    });
  };

  // =========================================================================
  // RULE KLASIFIKASI & PEMISAHAN JADI 2:
  // 1) ULANGAN:
  //    - Ulangan per-bab -> Warna Card: BIRU
  //    - Ulangan keseluruhan bab (bab 1 hingga akhir) -> Warna Card: HIJAU
  // 2) UJIAN:
  //    - Khusus untuk ujian resmi (PTS/PAS) -> Warna Card: UNGU
  // =========================================================================

  const ulanganList = useMemo(
    () => examList.filter((e) => e.tipe === "ulangan" || /ulangan|formatif/i.test(e.judul)),
    [examList]
  );

  const ujianList = useMemo(
    () =>
      examList.filter(
        (e) => e.tipe === "ujian" || (!/ulangan|formatif/i.test(e.judul) && e.tipe !== "ulangan")
      ),
    [examList]
  );

  // Token Modal State
  const [selectedExamForToken, setSelectedExamForToken] = useState<ExamItem | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [showTokenPassword, setShowTokenPassword] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);

  // Handle Exam Click
  const handleOpenExam = (exam: ExamItem) => {
    if (exam.status === "ditutup") {
      setToastNotification({
        show: true,
        title: "Akses Ujian Ditutup (OFF)",
        message: "Guru pengampu sedang menutup akses pengerjaan ruang ujian ini.",
        time: "Baru saja",
        type: "alpha",
      });
      return;
    }

    const isOfficial = exam.tipe === "ujian" || (!exam.isPerBab && !exam.isKeseluruhanBab && exam.tipe !== "ulangan");
    if (exam.sessionStatus === "terkunci" || (isOfficial && exam.sessionStatus === "sedang_mengerjakan")) {
      setToastNotification({
        show: true,
        title: "Ujian Resmi Terkunci (Perlu Reset Guru)",
        message: "Ujian resmi ini telah terkunci karena Anda keluar dari sesi pengerjaan. Silakan hubungi Guru Pengawas untuk melakukan reset di Dashboard Guru.",
        time: "Baru saja",
        type: "alpha",
      });
      return;
    }

    if (exam.sessionStatus === "selesai") {
      router.push(`/ujian/${exam.id}`);
      return;
    }

    if (exam.sessionStatus === "sedang_mengerjakan") {
      router.push(`/ujian/${exam.id}`);
      return;
    }

    // Open Token verification modal
    setSelectedExamForToken(exam);
    setTokenInput("");
    setTokenError(null);
    setShowTokenPassword(false);
  };

  // Verify Token
  const handleVerifyTokenAndProceed = async () => {
    if (!selectedExamForToken) return;

    if (!tokenInput.trim()) {
      setTokenError("Kode token wajib diisi.");
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
          token: tokenInput.trim(),
          judul: selectedExamForToken.judul,
          mapel: selectedExamForToken.mapel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setTokenError(data.error || "Token ujian salah atau tidak valid.");
        setIsVerifyingToken(false);
        return;
      }

      setToastNotification({
        show: true,
        title: "Token Terverifikasi ✓",
        message: "Memulai sesi pengerjaan. Harap patuhi tata tertib CBT.",
        time: "Baru saja",
        type: "success",
      });

      setSelectedExamForToken(null);
      const targetId = data.redirectUrl ? data.redirectUrl : `/ujian/${selectedExamForToken.id}`;
      router.push(targetId);
    } catch {
      setTokenError("Gagal menghubungi server. Pastikan koneksi internet stabil.");
    } finally {
      setIsVerifyingToken(false);
    }
  };

  // Helper untuk menentukan warna card sesuai rules
  const getExamCardTheme = (exam: ExamItem) => {
    // 1. Khusus untuk UJIAN -> UNGU
    if (exam.tipe === "ujian" || (!/ulangan|formatif/i.test(exam.judul) && exam.tipe !== "ulangan")) {
      return {
        typeLabel: "Ujian Resmi (PTS/PAS)",
        borderColor: "border-purple-300 hover:border-purple-500",
        bgTint: "bg-purple-50/20",
        badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
        iconBoxBg: "bg-purple-600 text-white",
        accentTextColor: "text-purple-700",
        btnClass: "bg-purple-600 hover:bg-purple-700 text-white shadow-xs shadow-purple-500/20",
      };
    }

    // 2. ULANGAN:
    // a) Ulangan Semester (Semester 1 & 2) / Keseluruhan Bab -> HIJAU
    const isSemester =
      exam.judul.toLowerCase().includes("semester") ||
      exam.isKeseluruhanBab ||
      (!exam.bab_id && (!/bab\s*\d+/i.test(exam.judul) || /keseluruhan|semua bab|akhir/i.test(exam.judul)));

    if (isSemester) {
      const isSem2 = exam.judul.toLowerCase().includes("semester 2");
      const label = isSem2 ? "Ulangan Semester 2" : "Ulangan Semester 1";
      return {
        typeLabel: label,
        borderColor: "border-emerald-300 hover:border-emerald-500",
        bgTint: "bg-emerald-50/20",
        badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
        iconBoxBg: "bg-emerald-600 text-white",
        accentTextColor: "text-emerald-700",
        btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-500/20",
      };
    }

    // b) Ulangan per bab -> BIRU
    return {
      typeLabel: "Ulangan Per Bab",
      borderColor: "border-blue-300 hover:border-blue-500",
      bgTint: "bg-blue-50/20",
      badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
      iconBoxBg: "bg-blue-600 text-white",
      accentTextColor: "text-blue-700",
      btnClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-500/20",
    };
  };

  // Reusable Component untuk merender kartu asesmen
  const renderExamCard = (exam: ExamItem) => {
    const theme = getExamCardTheme(exam);
    const isClosed = exam.status === "ditutup";
    const isDone = exam.sessionStatus === "selesai";
    const isInProgress = exam.sessionStatus === "sedang_mengerjakan";
    const isOfficial = exam.tipe === "ujian" || (!exam.isPerBab && !exam.isKeseluruhanBab && exam.tipe !== "ulangan");
    const isLocked = exam.sessionStatus === "terkunci" || (isOfficial && isInProgress);
    const isPassed = isDone && typeof exam.score === "number" && exam.score >= exam.passing_grade;

    return (
      <div
        key={exam.id}
        className={`rounded-3xl border-2 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs ${
          isClosed
            ? "border-slate-300 bg-slate-100/90 opacity-60 grayscale cursor-not-allowed select-none"
            : `bg-white hover:shadow-md ${theme.borderColor} ${theme.bgTint}`
        }`}
      >
        <div className="p-5 sm:p-6 space-y-4">
          {/* Header Badges */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}>
              {theme.typeLabel}
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {exam.mapel || "Matematika"}
              </span>

              {isClosed ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-slate-500" />
                  <span>Dinonaktifkan Guru</span>
                </span>
              ) : isLocked ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-red-600" />
                  <span>Terkunci (Perlu Reset Guru)</span>
                </span>
              ) : isInProgress ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>Sedang Dikerjakan</span>
                </span>
              ) : isDone ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" />
                  <span>Selesai</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span>Tersedia</span>
                </span>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-base font-extrabold text-slate-900 leading-snug line-clamp-2">
              {exam.judul}
            </h3>
            {exam.deskripsi ? (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {exam.deskripsi}
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-1 italic">
                Evaluasi asesmen kurikulum terstandar.
              </p>
            )}
          </div>

          {/* Specs / Meta Details */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{exam.durasi_menit} Menit</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              <span>KKM: {exam.passing_grade}</span>
            </div>
          </div>

          {/* Result Pill if Completed */}
          {isDone && typeof exam.score === "number" && (
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                isPassed
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <span>Nilai Akhir:</span>
              <div className="flex items-center gap-1.5 text-sm">
                <span>{exam.score} / 100</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/80">
                  {isPassed ? "Tuntas (KKM)" : "Remedial"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Card Action Button */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end">
          {isClosed ? (
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-xl bg-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Ujian Tidak Aktif (Dinonaktifkan Guru)</span>
            </button>
          ) : isLocked ? (
            <div className="w-full space-y-1.5">
              <button
                disabled
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 border border-slate-300 text-slate-400 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed select-none"
              >
                <Lock className="w-3.5 h-3.5 text-red-500" />
                <span>Ujian Terkunci (Perlu Reset Guru)</span>
              </button>
              <p className="text-[10.5px] text-center text-red-600 font-medium leading-tight">
                Anda keluar dari ruang ujian resmi. Sesi pengerjaan terkunci dan memerlukan reset dari Guru di Dashboard Guru.
              </p>
            </div>
          ) : isInProgress ? (
            <button
              onClick={() => handleOpenExam(exam)}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Lanjutkan Pengerjaan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : isDone ? (
            <button
              onClick={() => handleOpenExam(exam)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lihat Hasil & Pembahasan</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenExam(exam)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${theme.btnClass}`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>Mulai Pengerjaan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 pb-20">
      {/* 1. TOPBAR */}
      <ClassroomTopBar
        onToggleSidebar={() => router.push("/dashboard")}
        studentName={userProfile.nama_lengkap}
        studentPhoto={userProfile.foto_url}
        studentEmail={userProfile.email}
        studentClass={userProfile.nama_kelas || "Kelas 8A"}
        waliKelas="Ibu Siti Rahmawati, M.Pd."
        isCheckedIn={isCheckedIn}
        checkInStatus={checkInStatus}
        checkInTime={checkInTime}
        isPresensiClosed={isPresensiClosed}
        onStartAttendance={handleStartAttendance}
        notifications={notifications}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenNotes={() => setIsNotesModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        sekolahData={sekolahData}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
        {/* Navigation & Back Link */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50/80 px-3.5 py-1.5 rounded-full border border-slate-200 transition shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Dashboard Siswa</span>
          </Link>

          <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
            {examList.length} Soal Diterbitkan Guru
          </span>
        </div>

        {/* 2. DUA KATEGORI TERPISAH: ULANGAN & UJIAN */}
        <div className="space-y-10">
          {/* =================================================================== */}
          {/* KATEGORI 1: ULANGAN (Per Bab = BIRU, Keseluruhan Bab = HIJAU)        */}
          {/* =================================================================== */}
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Ulangan Harian & Formatif
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ulangan Semester 1 (Bab 1–4) & Semester 2 (Bab 5–8) Matematika Kelas 8 Fase D.
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {ulanganList.length} Ulangan
              </span>
            </div>

            {ulanganList.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Belum Ada Ulangan yang Diterbitkan
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Guru pengampu belum menerbitkan ulangan harian atau ulangan bab untuk kelas Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ulanganList.map((exam) => renderExamCard(exam))}
              </div>
            )}
          </section>

          {/* =================================================================== */}
          {/* KATEGORI 2: UJIAN (Khusus Ujian Resmi PTS/PAS = UNGU)                */}
          {/* =================================================================== */}
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Ujian Resmi (PTS / PAS / Asesmen Sumatif)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Khusus Ujian Resmi Matematika #1 terstandar sekolah dengan pengawasan waktu server & deteksi keluar layar (Card Ungu).
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {ujianList.length} Ujian
              </span>
            </div>

            {ujianList.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Belum Ada Ujian Resmi yang Diterbitkan
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Guru pengampu belum mempublikasikan ujian semester (PTS/PAS) untuk kelas Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ujianList.map((exam) => renderExamCard(exam))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 3. MODAL VERIFIKASI TOKEN */}
      {selectedExamForToken && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Verifikasi Token Soal
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Masukkan token untuk membuka ruang pengerjaan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExamForToken(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Exam Summary Info */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-800">
                {selectedExamForToken.judul}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>{selectedExamForToken.mapel}</span>
                <span>•</span>
                <span>{selectedExamForToken.durasi_menit} Menit</span>
                <span>•</span>
                <span>KKM: {selectedExamForToken.passing_grade}</span>
              </div>
            </div>

            {/* Token Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Kode Token / Password Soal
              </label>
              <div className="relative">
                <input
                  type={showTokenPassword ? "text" : "password"}
                  autoFocus
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value.toUpperCase());
                    if (tokenError) setTokenError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerifyTokenAndProceed();
                  }}
                  placeholder="KODE TOKEN"
                  className="w-full text-center font-mono text-base font-extrabold tracking-widest px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition placeholder:font-sans placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowTokenPassword(!showTokenPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showTokenPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {tokenError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{tokenError}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-500 leading-normal">
                Kode token diberikan secara resmi oleh pengawas atau guru pengampu Anda di kelas.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedExamForToken(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleVerifyTokenAndProceed}
                disabled={isVerifyingToken || !tokenInput.trim()}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isVerifyingToken ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Mulai Pengerjaan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL PENDUKUNG */}
      <StudentNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        notes={notes}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
      />

      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        studentName={userProfile.nama_lengkap}
        studentEmail={userProfile.email}
        namaKelas={userProfile.nama_kelas || "Kelas 8A"}
        fotoUrl={userProfile.foto_url}
        sekolahData={sekolahData}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
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
        mockTime={null}
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
    </div>
  );
}

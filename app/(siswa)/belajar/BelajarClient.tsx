"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  GraduationCap,
  PlayCircle,
  Award,
  Check,
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
  initialMapel?: string | null;
  initialBabId?: string | null;
  initialSemester?: number | null;
}

const SUBJECTS = [
  {
    id: "Matematika",
    name: "Matematika",
    icon: "📐",
    desc: "Aljabar, Geometri, Teorema Pythagoras, Statistika & Peluang",
    color: "from-blue-600 to-indigo-700",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "Bahasa Inggris",
    name: "Bahasa Inggris",
    icon: "🇬🇧",
    desc: "Reading Comprehension, Grammar, Narrative Text, Descriptive Writing",
    color: "from-purple-600 to-indigo-800",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "Bahasa Indonesia",
    name: "Bahasa Indonesia",
    icon: "🇮🇩",
    desc: "Teks Laporan Hasil Observasi, Puisi, Puisi Rakyat, Cerita Fantasi",
    color: "from-rose-600 to-red-700",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
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

export default function BelajarClient({
  userProfile,
  sekolahData,
  chapters,
  completedMateriIds = [],
  initialMapel,
  initialBabId,
  initialSemester,
}: BelajarClientProps) {
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
  const [learningPoints, setLearningPoints] = useState(userProfile.poin || 0);
  const [dailyStreak, setDailyStreak] = useState(userProfile.streak || 0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toastNotification, setToastNotification] =
    useState<ToastNotificationData | null>(null);

  // UAT Mock Time State (synced with localStorage)
  const [mockTime, setMockTime] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("thinksy_mock_time") || null;
    }
    return null;
  });
  const [isDevMenuOpen, setIsDevMenuOpen] = useState(false);

  // Listen for mock time changes from other tabs/menu
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
  });

  // Effective Time Calculator (incorporating Dev Mock Time)
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

  // Dynamic Cutoff & Late Threshold from Sekolah Data (default: Tutup 08:00 WIB, Terlambat > 07:15 WIB)
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

  const completedSet = new Set(completedMateriIds);

  // Filter chapters by selected subject and semester
  const filteredChapters = chapters.filter((c) => {
    const matchSubject =
      (c.mapel || "").toLowerCase() === selectedSubject.toLowerCase();
    const sem = c.semester || (c.urutan <= 3 ? 1 : 2);
    return matchSubject && sem === selectedSemester;
  });

  // Calculate overall stats for active subject
  const allSubjectChapters = chapters.filter(
    (c) => (c.mapel || "").toLowerCase() === selectedSubject.toLowerCase()
  );
  const totalMaterials = allSubjectChapters.reduce(
    (acc, curr) => acc + (curr.materi?.length || 0),
    0
  );
  const completedMaterials = allSubjectChapters.reduce(
    (acc, curr) =>
      acc + (curr.materi?.filter((m) => completedSet.has(m.id)).length || 0),
    0
  );
  const subjectProgress =
    totalMaterials > 0
      ? Math.round((completedMaterials / totalMaterials) * 100)
      : 0;

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
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        {/* Top Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
            <Link href="/" className="hover:text-slate-700 transition">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800">Ruang Belajar Mandiri</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">
                Kurikulum Merdeka • {userProfile.nama_kelas || "Kelas 8A"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Buku modul ajar, pendalaman bab materi, latihan interaktif, dan kuis pemahaman.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>{userProfile.poin} Poin Belajar</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID LAYOUT: Left (Subjects) + Right (Semesters & Bab) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ============================================================ */}
          {/* LEFT SIDEBAR: 3 MATA PELAJARAN                               */}
          {/* ============================================================ */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Mata Pelajaran Aktif
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  3 Mapel
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
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isActive
                          ? "bg-[#0F172A] text-white border-slate-900 shadow-md ring-2 ring-slate-900/20"
                          : "bg-slate-50/70 hover:bg-slate-100/80 text-slate-800 border-slate-200/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-xs shrink-0 ${
                            isActive
                              ? "bg-white/10 text-white border border-white/20"
                              : "bg-white border border-slate-200"
                          }`}
                        >
                          {sub.icon}
                        </div>
                        <div>
                          <div
                            className={`text-sm font-black leading-tight ${
                              isActive ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {sub.name}
                          </div>
                          <div
                            className={`text-[11px] font-medium line-clamp-1 mt-0.5 ${
                              isActive ? "text-slate-300" : "text-slate-500"
                            }`}
                          >
                            {count} Bab Tersedia • Kelas {userProfile.tingkat_kelas || 8}
                          </div>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive
                            ? "text-amber-400 translate-x-0.5"
                            : "text-slate-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Quick Overall Subject Progress */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-600">
                    Progres {selectedSubject}
                  </span>
                  <span className="font-black text-[#0F172A]">
                    {completedMaterials} / {totalMaterials} Materi ({subjectProgress}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                    style={{ width: `${subjectProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Hint Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs space-y-1.5">
              <div className="font-extrabold flex items-center gap-1.5 text-indigo-950">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Tips Pembelajaran
              </div>
              <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                Selesaikan pembacaan modul ajar lalu tekan tombol <strong>Tandai Selesai</strong> untuk mendapatkan <strong>+5 Poin</strong> dan membuka asesmen kuis pemahaman!
              </p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT VIEW: SEMESTER SWITCHER + BAB LIST FROM SUPABASE        */}
          {/* ============================================================ */}
          <div className="lg:col-span-8 space-y-5">
            {/* Header Card with Semester Switcher */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentSubjectMeta.icon}</span>
                  <h2 className="text-xl font-black text-[#0F172A]">
                    {currentSubjectMeta.name}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {currentSubjectMeta.desc}
                </p>
              </div>

              {/* Semester Tabs */}
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200/80 shrink-0">
                <button
                  onClick={() => setSelectedSemester(1)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedSemester === 1
                      ? "bg-[#0F172A] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Semester 1 (Ganjil)
                </button>
                <button
                  onClick={() => setSelectedSemester(2)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedSemester === 2
                      ? "bg-[#0F172A] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Semester 2 (Genap)
                </button>
              </div>
            </div>

            {/* List of Chapters for Selected Subject & Semester */}
            {filteredChapters.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Belum Ada Bab di Semester Ini
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Materi bab untuk {selectedSubject} Semester {selectedSemester} sedang dipersiapkan oleh tim guru.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredChapters.map((bab, idx) => {
                  const materiList = bab.materi || [];
                  const completedInBab = materiList.filter((m) =>
                    completedSet.has(m.id)
                  ).length;
                  const babProgress =
                    materiList.length > 0
                      ? Math.round((completedInBab / materiList.length) * 100)
                      : 0;
                  const isHighlighted = highlightedBabId === bab.id;

                  return (
                    <div
                      key={bab.id}
                      id={`bab-${bab.id}`}
                      className={`rounded-3xl p-6 border transition-all duration-300 space-y-4 ${
                        isHighlighted
                          ? "bg-white border-blue-500 ring-4 ring-blue-500/20 shadow-xl scale-[1.01]"
                          : "bg-white border-slate-200/80 shadow-xs hover:shadow-md"
                      }`}
                    >
                      {/* Bab Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 shadow-xs transition-colors ${
                              isHighlighted
                                ? "bg-blue-600 text-white ring-2 ring-blue-400"
                                : "bg-[#0F172A] text-amber-400"
                            }`}
                          >
                            {bab.urutan || idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Bab {bab.urutan || idx + 1} • Semester {bab.semester || selectedSemester}
                              </span>
                              {isHighlighted && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs animate-pulse">
                                  <Sparkles className="w-3 h-3 text-amber-300" />
                                  Bab Terpilih
                                </span>
                              )}
                              {babProgress === 100 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Tuntas
                                </span>
                              )}
                            </div>
                            <h3
                              className={`text-base sm:text-lg font-black mt-0.5 ${
                                isHighlighted ? "text-blue-950" : "text-[#0F172A]"
                              }`}
                            >
                              {bab.judul}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                              {bab.deskripsi ||
                                "Capaian Pembelajaran Kurikulum Merdeka Fase D."}
                            </p>
                          </div>
                        </div>

                        {/* Direct Action Link to Chapter */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <Link
                            href={`/bab/${bab.id}`}
                            className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Buka Modul Ajar</span>
                          </Link>
                          <Link
                            href={`/quiz/${bab.id}?mode=inclass&babId=${bab.id}`}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Kuis</span>
                          </Link>
                        </div>
                      </div>

                      {/* Sub-Bab / Materi List */}
                      <div className="space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Daftar Sub-Bab Pembelajaran ({completedInBab}/{materiList.length} Selesai)
                        </div>

                        {materiList.length === 0 ? (
                          <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 text-xs font-medium">
                            Modul ajar digital terstandar tersedia lengkap di halaman buku ajar.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {materiList.map((m: any, mIdx: number) => {
                              const isRead = completedSet.has(m.id);
                              return (
                                <Link
                                  key={m.id}
                                  href={`/bab/${bab.id}?materiId=${m.id}&view=pdf`}
                                  className={`p-3 rounded-2xl border text-xs transition flex items-center justify-between gap-2 group cursor-pointer ${
                                    isRead
                                      ? "bg-emerald-50/50 border-emerald-200/80 hover:bg-emerald-50"
                                      : "bg-slate-50/80 border-slate-200/70 hover:bg-slate-100"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span
                                      className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                        isRead
                                          ? "bg-emerald-600 text-white"
                                          : "bg-slate-200 text-slate-700"
                                      }`}
                                    >
                                      {isRead ? <Check className="w-3.5 h-3.5" /> : mIdx + 1}
                                    </span>
                                    <span
                                      className={`font-bold truncate text-xs ${
                                        isRead
                                          ? "text-emerald-950 font-extrabold"
                                          : "text-slate-800"
                                      }`}
                                    >
                                      {m.judul}
                                    </span>
                                  </div>

                                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
    </div>
  );
}

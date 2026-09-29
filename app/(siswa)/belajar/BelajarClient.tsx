"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  BookOpen,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
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

const ITEMS_PER_PAGE = 5;

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
  const [currentPage, setCurrentPage] = useState<number>(1);

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

  // UAT Mock Time State
  const [mockTime, setMockTime] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("thinksy_mock_time") || null;
    }
    return null;
  });
  const [isDevMenuOpen, setIsDevMenuOpen] = useState(false);

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
    }
  });

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
    } catch {}
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
                      className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isActive
                          ? "bg-blue-50/70 text-blue-950 border-blue-200 border-l-4 border-l-blue-600 shadow-2xs font-semibold"
                          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 font-medium"
                      }`}
                    >
                      <div>
                        <div
                          className={`text-sm font-semibold ${
                            isActive ? "text-blue-950 font-bold" : "text-slate-900"
                          }`}
                        >
                          {sub.name}
                        </div>
                        <div
                          className={`text-xs mt-0.5 ${
                            isActive ? "text-blue-700/80 font-medium" : "text-slate-500 font-normal"
                          }`}
                        >
                          {count} Bab Pembelajaran
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? "text-blue-600" : "text-slate-400"
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
                  className={`px-3.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    selectedSemester === 1
                      ? "bg-white text-blue-700 font-bold border border-slate-200 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 font-medium"
                  }`}
                >
                  Semester 1 (Ganjil)
                </button>
                <button
                  onClick={() => setSelectedSemester(2)}
                  className={`px-3.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    selectedSemester === 2
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

                  return (
                    <div
                      key={bab.id}
                      id={`bab-${bab.id}`}
                      className={`rounded-xl p-5 sm:p-6 border transition-colors space-y-4 shadow-xs ${
                        isHighlighted
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

                        {/* Action Buttons (Light Gray with colored icons and hover states) */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-1 sm:pt-0">
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
                          className={`w-8 h-8 rounded-lg text-xs transition-colors cursor-pointer ${
                            safeCurrentPage === pageNumber
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

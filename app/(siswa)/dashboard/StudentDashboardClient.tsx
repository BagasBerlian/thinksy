"use client";

import { useState, useEffect } from "react";
import {
  BrainCircuit,
  Bell,
  User,
  Settings,
  LogOut,
  Sparkles,
  Trophy,
  Flame,
  Calendar,
  Clock,
  ChevronRight,
  BookOpen,
  X,
  FileText,
  CheckCircle2,
  Atom,
  FlaskConical,
  Dna,
  Laptop,
  BookMarked,
  ArrowRight,
  Shield,
  QrCode,
  Check,
  Award,
  HelpCircle,
  Activity,
  Zap,
  Camera,
  Sun,
  Moon,
  Gift,
  Target,
  CheckCircle,
  AlertCircle,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { logoutAction } from "../../(auth)/actions";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";

interface StudentDashboardProps {
  userProfile: {
    nama_lengkap: string;
    email: string;
    peran: string;
  };
  chapters: Array<{
    id: string;
    judul: string;
    deskripsi: string | null;
    urutan: number;
    materi?: Array<{
      id: string;
      judul: string;
      urutan: number;
    }>;
  }>;
}

export default function StudentDashboardClient({
  userProfile,
  chapters,
}: StudentDashboardProps) {
  // Navigation Tabs State
  const [activeTab, setActiveTab] = useState<
    "Belajar" | "Kursus Saya" | "Peringkat" | "Pencapaian"
  >("Belajar");

  // UI Modals & Drawers State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // Theme Mode State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Real-Time Gamification State (Points & Quests)
  const [learningPoints, setLearningPoints] = useState(1250);
  const [dailyStreak, setDailyStreak] = useState(14);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  // Daily Quests State
  const [quests, setQuests] = useState([
    {
      id: "q1",
      title: "Absen Pagi Tepat Waktu",
      progress: 1,
      max: 1,
      reward: 20,
      claimed: false,
    },
    {
      id: "q2",
      title: "Selesaikan 1 Bab Pembelajaran",
      progress: 1,
      max: 1,
      reward: 50,
      claimed: false,
    },
    {
      id: "q3",
      title: "Jawab 5 Soal Kuis Tanpa Salah",
      progress: 3,
      max: 5,
      reward: 30,
      claimed: false,
    },
  ]);

  const handleClaimQuest = (questId: string, reward: number) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, claimed: true } : q))
    );
    setLearningPoints((prev) => prev + reward);
  };

  // Live Selfie Camera Attendance Simulation
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);

  const handleStartCamera = () => {
    setIsCameraActive(true);
  };

  const studentName = userProfile.nama_lengkap || "Budi Kartika";
  const studentEmail = userProfile.email || "budi.kartika@sekolah.sch.id";

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Tenggat Waktu Kuis Biologi",
      desc: "Kuis Biologi Bab 3 berakhir malam ini pukul 23:59 WIB.",
      time: "10 menit yang lalu",
      type: "urgent",
    },
    {
      id: 2,
      title: "Pengumuman Guru Matematika",
      desc: "Materi Faktorisasi Kuadrat telah diperbarui oleh Ibu Rahma.",
      time: "1 jam yang lalu",
      type: "info",
    },
    {
      id: 3,
      title: "Jadwal Kelas Pengganti Fisika",
      desc: "Sesi Sokratik AI Fisika dijadwalkan besok pukul 09:30 WIB.",
      time: "3 jam yang lalu",
      type: "schedule",
    },
  ]);

  const { broadcastEvent } = useRealtimeDashboard((event) => {
    if (event.type === "SOAL_PUBLISHED") {
      setNotifications((prev) => [
        {
          id: Date.now(),
          title: "Soal Latihan Baru Diterbitkan",
          desc: "Guru telah menerbitkan soal eksplorasi baru untuk kelas Anda.",
          time: "Baru saja",
          type: "info",
        },
        ...prev,
      ]);
    } else if (event.type === "ESSAY_GRADED") {
      setNotifications((prev) => [
        {
          id: Date.now(),
          title: "Hasil Penilaian Esai Keluar",
          desc: "Jawaban esai Anda telah dinilai oleh Guru.",
          time: "Baru saja",
          type: "info",
        },
        ...prev,
      ]);
    }
  });

  const handleTakeSelfie = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setCapturedSelfie("selfie-captured");
    setIsCheckedIn(true);
    setCheckInTime(formattedTime);
    setIsCameraActive(false);

    // Auto update quest 1
    setQuests((prev) =>
      prev.map((q) => (q.id === "q1" ? { ...q, progress: 1 } : q))
    );

    // Broadcast attendance to Guru & Admin dashboards
    broadcastEvent("ATTENDANCE_CHECKIN", { studentName, time: formattedTime });
  };


  const activeClasses = [
    {
      id: "bab-persamaan-kuadrat",
      subject: "Matematika",
      grade: "Kelas X",
      module: "Bab 2",
      topic: "Persamaan & Fungsi Kuadrat",
      progress: 25,
      icon: BookOpen,
      color: "bg-[#0F172A] text-white border-slate-700",
      progressColor: "bg-blue-600",
    },
    {
      id: "fisika-mekanika",
      subject: "Fisika",
      grade: "Kelas X",
      module: "Bab 3",
      topic: "Mekanika Klasik & Hukum Newton",
      progress: 40,
      icon: Atom,
      color: "bg-slate-100 text-slate-800 border-slate-200",
      progressColor: "bg-amber-500",
    },
    {
      id: "kimia-stokiometri",
      subject: "Kimia",
      grade: "Kelas X",
      module: "Bab 2",
      topic: "Stokiometri & Ikatan Kimia",
      progress: 20,
      icon: FlaskConical,
      color: "bg-slate-100 text-slate-800 border-slate-200",
      progressColor: "bg-purple-600",
    },
    {
      id: "biologi-genetika",
      subject: "Biologi",
      grade: "Kelas X",
      module: "Bab 4",
      topic: "Anatomi Sel & Genetika Dasar",
      progress: 50,
      icon: Dna,
      color: "bg-slate-100 text-slate-800 border-slate-200",
      progressColor: "bg-emerald-600",
    },
    {
      id: "informatika-algoritma",
      subject: "Informatika",
      grade: "Kelas X",
      module: "Bab 5",
      topic: "Berpikir Komputasional & Algoritma",
      progress: 65,
      icon: Laptop,
      color: "bg-slate-100 text-slate-800 border-slate-200",
      progressColor: "bg-indigo-600",
    },
    {
      id: "bahasa-indonesia",
      subject: "Bahasa Indonesia",
      grade: "Kelas X",
      module: "Bab 8",
      topic: "Teks Laporan Hasil Observasi",
      progress: 80,
      icon: BookMarked,
      color: "bg-slate-100 text-slate-800 border-slate-200",
      progressColor: "bg-rose-600",
    },
  ];

  return (
    <div
      className={`min-h-screen font-sans pb-20 transition-colors duration-200 ${
        isDarkMode ? "bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-slate-900"
      }`}
    >
      {/* 1. ENTERPRISE SAAS NAVBAR */}
      <header
        className={`sticky top-0 z-40 saas-nav border-b ${
          isDarkMode
            ? "bg-slate-900/90 border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Left: Brand Vector Logo & Nav Tabs */}
          <div className="flex items-center space-x-6 sm:space-x-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 rounded-xl bg-[#0F172A] flex items-center justify-center font-bold text-white shadow-sm border border-slate-700 group-hover:scale-105 transition duration-200">
                <BrainCircuit className="w-5.5 h-5.5 text-amber-400" />
              </div>
              <span className="font-extrabold text-xl tracking-tight font-sans text-[#0F172A]">
                THINKSY
              </span>
            </Link>

            {/* Navigation Tabs (Mobile Responsive Container) */}
            <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
              {(
                ["Belajar", "Kursus Saya", "Peringkat", "Pencapaian"] as const
              ).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    activeTab === tab
                      ? "bg-[#0F172A] text-white shadow-xs"
                      : "text-slate-700 hover:text-[#0F172A] hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3">
            {/* Real-Time Notification Bell Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                aria-label="Notifikasi"
                className="relative p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#0F172A] hover:bg-slate-200 shadow-xs transition cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
              </button>

              {/* Notification Drawer Popup */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl saas-modal border border-slate-200 p-4 z-50 shadow-2xl animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="font-extrabold text-sm text-[#0F172A]">
                        Notifikasi Real-Time
                      </span>
                    </div>
                    <button
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0F172A]">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-snug">
                          {notif.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-slate-700 group-hover:scale-105 transition duration-200">
                  {studentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl saas-modal border border-slate-200 p-3 z-50 shadow-2xl animate-in fade-in duration-150">
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 mb-2">
                    <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                      Nama Akun:
                    </div>
                    <div className="text-sm font-extrabold text-[#0F172A] truncate">
                      {studentName}
                    </div>
                    <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      <span>Siswa</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setIsSettingsModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 hover:text-[#0F172A] rounded-xl transition cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-700" />
                      <span>Pengaturan Akun</span>
                    </button>

                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 hover:text-[#0F172A] rounded-xl transition cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-700" />
                      <span>Pusat Bantuan</span>
                    </button>

                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Log Out</span>
                      </button>
                    </form>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full py-2.5 px-4 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>View Profile Card</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* TAB CONTENT RENDERER */}
      {activeTab === "Belajar" && (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 space-y-8">
          {/* 3. WELCOME HERO HEADER & LIVE PRESENSI SYSTEM */}
          <section className="saas-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden bg-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
              {/* Greetings & Student Rank */}
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[#0F172A] text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>THINKSY Platform</span>
                  </div>

                  {/* Student Ranking Badge -> Clicking redirects to Peringkat Tab */}
                  <button
                    onClick={() => setActiveTab("Peringkat")}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5 text-blue-600" />
                    <span>Peringkat: #3 dari 120 Siswa →</span>
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                  Selamat Datang Kembali, {studentName.split(" ")[0]}! 👋
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  Selesaikan tugas harianmu untuk mengumpulkan poin dan tingkatkan pemahamanmu bersama Tutor AI Sokratik.
                </p>

                {/* Real-Time Metrics */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Trophy className="w-4.5 h-4.5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                        POIN BELAJAR
                      </div>
                      <div className="text-sm font-extrabold text-[#0F172A]">
                        {learningPoints.toLocaleString()} Poin
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <Flame className="w-4.5 h-4.5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-[10px] text-orange-700 font-bold uppercase tracking-wider">
                        DAILY STREAK
                      </div>
                      <div className="text-sm font-extrabold text-[#0F172A]">
                        {dailyStreak} Hari Streak
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Selfie Camera Attendance System Widget */}
              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center justify-center w-full sm:w-auto min-w-[220px]">
                  <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Presensi Selfie Kehadiran
                  </div>

                  {isCheckedIn ? (
                    <div className="space-y-2 animate-in zoom-in-95 duration-200">
                      <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Hadir ({checkInTime})</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold">
                        Presensi Terverifikasi!
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAttendanceModalOpen(true)}
                      className="w-full py-3 px-4 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition duration-200 cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>Absen Kamera Selfie</span>
                    </button>
                  )}
                </div>

                {/* Progress Visualizer Gauge */}
                <div className="saas-card p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4 min-w-[220px] w-full sm:w-auto">
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#0F172A]"
                        strokeDasharray="75, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-lg font-extrabold text-[#0F172A]">
                      75%
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-[#0F172A]">
                      75% Selesai
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Target Pembelajaran
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 7. GAMIFICATION: MISI HARIAN (DAILY QUESTS) WIDGET */}
          <section className="saas-card p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                <span>Misi Harian (Daily Quests)</span>
              </h2>
              <span className="text-xs font-bold text-slate-500">
                Bonus Poin Real-Time
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quests.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#0F172A]">{q.title}</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        +{q.reward} Poin
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 font-semibold flex items-center justify-between">
                      <span>Progres</span>
                      <span>
                        {q.progress} / {q.max}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 mt-1 overflow-hidden">
                      <div
                        className="h-full bg-[#0F172A] rounded-full transition-all duration-300"
                        style={{ width: `${(q.progress / q.max) * 100}%` }}
                      />
                    </div>
                  </div>

                  {q.claimed ? (
                    <button
                      disabled
                      className="w-full py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Klaim Berhasil</span>
                    </button>
                  ) : (
                    <button
                      disabled={q.progress < q.max}
                      onClick={() => handleClaimQuest(q.id, q.reward)}
                      className="w-full py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl disabled:opacity-40 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Gift className="w-3.5 h-3.5 text-amber-400" />
                      <span>Klaim Hadiah</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 4. PRIORITY AGENDA: DEADLINES & JADWAL KELAS SAYA */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 saas-card rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-amber-500" />
                    <span>Tenggat Waktu Agenda</span>
                  </h2>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Push Notification Active
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 text-red-600 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] font-extrabold uppercase leading-none">
                          HARI INI
                        </span>
                        <span className="text-sm font-extrabold leading-none mt-0.5">
                          15
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-slate-800">
                          Kuis Biologi Bab 3: Genetika Sel
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <Clock className="w-3 h-3 text-red-500" />
                          <span>Selesai pukul 23:59 WIB</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                      Mendesak
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] font-extrabold uppercase leading-none">
                          BESOK
                        </span>
                        <span className="text-sm font-extrabold leading-none mt-0.5">
                          16
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-slate-800">
                          Tugas Makalah Sejarah Indonesia
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>Selesai pukul 12:00 WIB</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                      Tugas
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="w-full h-full min-h-[160px] rounded-3xl bg-[#0F172A] hover:bg-slate-800 p-6 text-white shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between text-left relative overflow-hidden group cursor-pointer border border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-white">
                      Jadwal Kelas Saya
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 flex items-center gap-1 font-medium">
                      <span>Lihat agenda mingguan terintegrasi</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-amber-400 border border-slate-700 group-hover:rotate-6 transition">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-300">
                    5 Sesi Terjadwal Minggu Ini
                  </span>
                  <span className="text-xs font-bold text-[#0F172A] bg-amber-400 hover:bg-amber-300 px-3.5 py-1.5 rounded-full transition">
                    Buka Jadwal →
                  </span>
                </div>
              </button>
            </div>
          </section>

          {/* 5. ACTIVE CLASSES GRID */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Kelas Aktif Saya</span>
              </h2>
              <button
                onClick={() => setActiveTab("Kursus Saya")}
                className="px-4 py-2 rounded-xl bg-[#0F172A] text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs"
              >
                Lihat Semua
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeClasses.map((cls) => {
                const IconComp = cls.icon;
                return (
                  <Link
                    key={cls.id}
                    href={`/bab/${cls.id}`}
                    className="saas-card saas-card-hover rounded-3xl p-5 border border-slate-200 flex flex-col justify-between space-y-4 shadow-xs group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-10 h-10 rounded-2xl ${cls.color} flex items-center justify-center border font-bold shadow-xs group-hover:scale-105 transition`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                          {cls.module}
                        </span>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {cls.grade}
                        </div>
                        <h3 className="text-lg font-extrabold text-[#0F172A] group-hover:text-blue-600 transition">
                          {cls.subject}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {cls.topic}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400">Progres Membaca</span>
                        <span className="text-[#0F172A]">{cls.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cls.progressColor} transition-all duration-500`}
                          style={{ width: `${cls.progress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {/* TAB CONTENT: KURSUS SAYA */}
      {activeTab === "Kursus Saya" && (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 space-y-6">
          <div className="saas-card p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <h1 className="text-2xl font-extrabold text-[#0F172A]">
              Kursus Saya & Modul Terdaftar
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Lanjutkan membaca modul atau tinjau catatan bab pembelajaran.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeClasses.map((cls) => (
              <div
                key={cls.id}
                className="saas-card p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      {cls.grade}
                    </span>
                    <h3 className="text-lg font-extrabold text-[#0F172A] mt-1">
                      {cls.subject}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{cls.topic}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    {cls.module}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">
                    Progres: {cls.progress}%
                  </span>
                  <Link
                    href={`/bab/${cls.id}`}
                    className="py-2 px-4 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>Lanjutkan Membaca</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* TAB CONTENT: PERINGKAT (LEADERBOARD) */}
      {activeTab === "Peringkat" && (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 space-y-6">
          <div className="saas-card p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <h1 className="text-2xl font-extrabold text-[#0F172A] flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              <span>Papan Peringkat (Leaderboard Platform)</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Peringkat real-time dihitung dari poin kuis, streak harian, dan penyelesaian modul.
            </p>
          </div>

          <div className="saas-card rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Rank</th>
                  <th className="p-4">Nama Siswa</th>
                  <th className="p-4">Kelas / Sekolah</th>
                  <th className="p-4 text-center">Streak</th>
                  <th className="p-4 text-right">Poin Belajar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                <tr className="bg-amber-50/50">
                  <td className="p-4 font-extrabold text-amber-600">🥇 #1</td>
                  <td className="p-4 text-[#0F172A] font-extrabold">
                    Ahmad Fauzi
                  </td>
                  <td className="p-4 text-slate-500">Kelas 8A • SMP N 1 Jakarta</td>
                  <td className="p-4 text-center font-bold text-orange-600">
                    21 Hari 🔥
                  </td>
                  <td className="p-4 text-right font-extrabold text-[#0F172A]">
                    1,850 Pts
                  </td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="p-4 font-extrabold text-slate-400">🥈 #2</td>
                  <td className="p-4 text-[#0F172A] font-extrabold">
                    Siti Aminah
                  </td>
                  <td className="p-4 text-slate-500">Kelas 8A • SMP N 1 Jakarta</td>
                  <td className="p-4 text-center font-bold text-orange-600">
                    18 Hari 🔥
                  </td>
                  <td className="p-4 text-right font-extrabold text-[#0F172A]">
                    1,520 Pts
                  </td>
                </tr>
                <tr className="bg-blue-50/60 border-l-4 border-l-blue-600">
                  <td className="p-4 font-extrabold text-blue-600">🥉 #3 (Kamu)</td>
                  <td className="p-4 text-[#0F172A] font-extrabold">
                    {studentName}
                  </td>
                  <td className="p-4 text-slate-500">Kelas 8A • SMP N 1 Jakarta</td>
                  <td className="p-4 text-center font-bold text-orange-600">
                    {dailyStreak} Hari 🔥
                  </td>
                  <td className="p-4 text-right font-extrabold text-blue-600">
                    {learningPoints.toLocaleString()} Pts
                  </td>
                </tr>
                {Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-4 text-slate-400 font-bold">#{i + 4}</td>
                    <td className="p-4 text-slate-800">Siswa Teladan #{i + 4}</td>
                    <td className="p-4 text-slate-500">Kelas 8B • SMP N 1 Jakarta</td>
                    <td className="p-4 text-center text-slate-600">
                      {10 - i} Hari
                    </td>
                    <td className="p-4 text-right font-bold text-slate-800">
                      {1100 - i * 80} Pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {/* TAB CONTENT: PENCAPAIAN (ACHIEVEMENTS) */}
      {activeTab === "Pencapaian" && (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 space-y-6">
          <div className="saas-card p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <h1 className="text-2xl font-extrabold text-[#0F172A] flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-600" />
              <span>Pencapaian & Lencana Digital</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Kumpulkan lencana atas konsistensi belajar dan hasil kuis terbaikmu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: "🏆",
                title: "Pionir Aljabar",
                desc: "Menyelesaikan 5 modul matematika tanpa jeda.",
                unlocked: true,
              },
              {
                icon: "⚡",
                title: "Pejuang Kuis",
                desc: "Meraih skor sempurna pada 3 kuis berturut-turut.",
                unlocked: true,
              },
              {
                icon: "🔥",
                title: "Streak Master",
                desc: "Mempertahankan daily streak selama 14 hari.",
                unlocked: true,
              },
              {
                icon: "🤖",
                title: "Tutor AI Fanatic",
                desc: "Berdiskusi Sokratik dengan AI Tutor lebih dari 20 kali.",
                unlocked: true,
              },
              {
                icon: "👑",
                title: "Top 3 Leaderboard",
                desc: "Mencapai peringkat 3 besar di kelasmu.",
                unlocked: true,
              },
              {
                icon: "🎓",
                title: "Master Fisika",
                desc: "Menyelesaikan seluruh bab Mekanika Klasik.",
                unlocked: false,
              },
            ].map((badge, idx) => (
              <div
                key={idx}
                className={`saas-card p-5 rounded-3xl border shadow-xs text-center space-y-3 ${
                  badge.unlocked
                    ? "border-emerald-200 bg-white"
                    : "border-slate-200 bg-slate-50 opacity-60"
                }`}
              >
                <div className="text-3xl">{badge.icon}</div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0F172A]">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{badge.desc}</p>
                </div>
                <span
                  className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full ${
                    badge.unlocked
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {badge.unlocked ? "Terbuka" : "Terkunci"}
                </span>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ========================================================= */}
      {/* MODAL: LIVE SELFIE CAMERA ATTENDANCE SYSTEM */}
      {/* ========================================================= */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="saas-modal rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full text-center space-y-5 relative">
            <button
              onClick={() => {
                setIsAttendanceModalOpen(false);
                setIsCameraActive(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-[#0F172A]">
                Presensi Selfie Kehadiran
              </h3>
              <p className="text-xs text-slate-500">
                Ambil foto selfie verifikasi untuk mendaftar kehadiran hari ini.
              </p>
            </div>

            {/* Camera Frame Preview */}
            <div className="relative w-full h-56 rounded-2xl bg-slate-900 border-2 border-slate-300 flex flex-col items-center justify-center overflow-hidden">
              {isCameraActive ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white space-y-2">
                  <div className="w-24 h-24 rounded-full border-4 border-dashed border-emerald-400 animate-spin-slow flex items-center justify-center">
                    <User className="w-12 h-12 text-slate-300" />
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    Kamera Selfie Aktif...
                  </span>
                </div>
              ) : (
                <div className="space-y-2 text-slate-400 text-xs">
                  <Camera className="w-10 h-10 mx-auto text-slate-500" />
                  <p>Klik tombol di bawah untuk mengaktifkan kamera</p>
                </div>
              )}
            </div>

            {!isCameraActive ? (
              <button
                onClick={handleStartCamera}
                className="w-full py-3 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Buka Kamera Selfie</span>
              </button>
            ) : (
              <button
                onClick={handleTakeSelfie}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Ambil Foto & Verifikasi Absen</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: VIEW PROFILE CARD */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="saas-modal rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full relative space-y-6">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="w-20 h-20 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-2xl font-extrabold shadow-md border-4 border-white">
                {studentName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-[#0F172A]">
                  {studentName}
                </h3>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  NIS: 2024081092 • {studentEmail}
                </div>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SMP N 1 Jakarta • Kelas 8A</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                  Total Poin
                </div>
                <div className="text-lg font-extrabold text-[#0F172A] mt-0.5">
                  {learningPoints.toLocaleString()} Poin
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-center">
                <div className="text-[10px] text-orange-700 font-bold uppercase tracking-wider">
                  Daily Streak
                </div>
                <div className="text-lg font-extrabold text-[#0F172A] mt-0.5">
                  {dailyStreak} Hari
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full py-3 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Tutup Profil
            </button>
          </div>
        </div>
      )}

      {/* MODAL: JADWAL KELAS SAYA */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="saas-modal rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-lg w-full relative space-y-5">
            <button
              onClick={() => setIsScheduleModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  Jadwal Kelas Saya
                </h3>
                <p className="text-xs text-slate-500">
                  Agenda Mingguan Kelas X - SMP N 1 Jakarta
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {[
                {
                  day: "Senin",
                  time: "07:30 - 09:00",
                  subject: "Matematika (Persamaan Kuadrat)",
                  teacher: "Ibu Rahma, M.Pd",
                  room: "Lab 1",
                },
                {
                  day: "Senin",
                  time: "09:30 - 11:00",
                  subject: "Fisika (Hukum Newton)",
                  teacher: "Pak Hendra, S.Pd",
                  room: "Ruang 8A",
                },
                {
                  day: "Selasa",
                  time: "07:30 - 09:00",
                  subject: "Bahasa Indonesia (Teks Laporan)",
                  teacher: "Ibu Dewi, M.Hum",
                  room: "Ruang 8A",
                },
                {
                  day: "Selasa",
                  time: "09:30 - 11:00",
                  subject: "Kimia (Stokiometri)",
                  teacher: "Pak Budi, S.Si",
                  room: "Lab Kimia",
                },
                {
                  day: "Rabu",
                  time: "07:30 - 09:00",
                  subject: "Biologi (Genetika Dasar)",
                  teacher: "Dr. Anita Wibowo",
                  room: "Lab Biologi",
                },
              ].map((sch, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {sch.day}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {sch.time}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {sch.subject}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {sch.teacher} • {sch.room}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsScheduleModalOpen(false)}
              className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Tutup Jadwal
            </button>
          </div>
        </div>
      )}

      {/* MODAL: PENGATURAN & DARK MODE TOGGLE */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="saas-modal rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full relative space-y-5">
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center">
                <Settings className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  Pengaturan Akun & Tampilan
                </h3>
                <p className="text-xs text-slate-500">
                  Preferensi Mode & Notifikasi
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Mode Gelap / Terang (Theme Toggle)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isDarkMode ? "Mode Gelap Aktif" : "Mode Terang Aktif"}
                  </div>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-xl bg-[#0F172A] text-amber-400 hover:bg-slate-800 transition cursor-pointer"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Tingkat Bimbingan Tutor AI
                </label>
                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none">
                  <option value="sedang">
                    Sedang (Bimbingan Sokratik Bertahap)
                  </option>
                  <option value="tinggi">
                    Detail (Bimbingan Lengkap dengan Contoh)
                  </option>
                  <option value="ringkas">Ringkas (Petunjuk Singkat)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

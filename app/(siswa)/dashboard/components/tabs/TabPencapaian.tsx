"use client";

import { useState } from "react";
import {
  RefreshCw,
  Trophy,
  Zap,
  Target,
  Lock,
  CheckCircle2,
  X,
  ArrowUpRight,
  Award,
  BookOpen,
  Printer,
  Sparkles,
} from "lucide-react";
import { StudentBadgeDetail } from "@/app/api/siswa/pencapaian/route";

/* -------------------------------------------------------------------------- */
/* REALISTIC CERTIFICATE VECTOR ASSETS                                        */
/* -------------------------------------------------------------------------- */

function CornerFlourish({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const getTransforms = () => {
    switch (position) {
      case "tl":
        return "top-1.5 left-1.5";
      case "tr":
        return "top-1.5 right-1.5 rotate-90";
      case "bl":
        return "bottom-1.5 left-1.5 -rotate-90";
      case "br":
        return "bottom-1.5 right-1.5 rotate-180";
    }
  };

  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute w-3.5 h-3.5 text-amber-700/35 pointer-events-none ${getTransforms()}`}
    >
      <path d="M2 12V4C2 2.89543 2.89543 2 4 2H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5 8V5H8" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
      <circle cx="4" cy="4" r="1.2" fill="currentColor" />
    </svg>
  );
}

function CertificateWaxSeal({
  isUnlocked = true,
  className = "w-14 h-14",
}: {
  isUnlocked?: boolean;
  className?: string;
}) {
  if (!isUnlocked) {
    return (
      <div className={`relative flex items-center justify-center ${className} shrink-0 opacity-40 grayscale`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" aria-label="Segel Terkunci">
          <circle cx="32" cy="32" r="20" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M26 29V24C26 20.6863 28.6863 18 32 18C35.3137 18 38 20.6863 38 24V29" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" />
          <rect x="23" y="29" width="18" height="14" rx="3" fill="#64748B" />
          <circle cx="32" cy="35" r="2" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className} shrink-0 filter drop-shadow-sm`}>
      <svg viewBox="0 0 64 68" fill="none" className="w-full h-full" aria-label="Segel Resmi Sertifikat">
        <defs>
          <linearGradient id="sealGoldGrad" x1="16" y1="12" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="30%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <radialGradient id="sealFaceGrad" cx="32" cy="28" r="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="60%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#B45309" />
          </radialGradient>
          <linearGradient id="sealRibbonGrad" x1="24" y1="36" x2="40" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B91C1C" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>
        </defs>

        {/* Ribbon Tails */}
        <path d="M25 36 L17 64 L26 58 L32 64 L30 36 Z" fill="url(#sealRibbonGrad)" />
        <path d="M39 36 L47 64 L38 58 L32 64 L34 36 Z" fill="url(#sealRibbonGrad)" opacity="0.9" />

        {/* Rosette Sawtooth Rim */}
        <circle cx="32" cy="28" r="19" fill="url(#sealGoldGrad)" />
        <circle cx="32" cy="28" r="16.5" fill="none" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2 1.5" />
        <circle cx="32" cy="28" r="14.5" fill="url(#sealFaceGrad)" />

        {/* Embossed Emblem (Star & Official Text) */}
        <polygon
          points="32,19 33.5,23.5 38,24 34.5,27 35.5,31.5 32,29 28.5,31.5 29.5,27 26,24 30.5,23.5"
          fill="#FFFFFF"
          opacity="0.95"
        />
        <text
          x="32"
          y="37"
          textAnchor="middle"
          fontSize="5.5"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="#78350F"
          letterSpacing="0.8px"
        >
          RESMI
        </text>
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

interface TabPencapaianProps {
  studentName?: string;
  schoolName?: string;
  completedQuizCount: number;
  dailyStreak?: number;
  learningPoints: number;
  answeredSoalCount: number;
  badgesList?: StudentBadgeDetail[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onNavigateTab?: (tab: "Home" | "Belajar" | "Ruang Ujian" | "Peringkat" | "Pencapaian") => void;
}

export default function TabPencapaian({
  studentName = "Siswa",
  schoolName = "SMK Muhammadiyah Pakem",
  completedQuizCount,
  dailyStreak = 0,
  learningPoints,
  answeredSoalCount,
  badgesList,
  isLoading = false,
  onRefresh,
  onNavigateTab,
}: TabPencapaianProps) {
  const [filter, setFilter] = useState<"all" | "unlocked" | "in_progress" | "locked">("all");
  const [selectedBadge, setSelectedBadge] = useState<StudentBadgeDetail | null>(null);

  // Fallback badges jika API belum mengembalikan data
  const defaultBadges: StudentBadgeDetail[] = [
    {
      id: "b1",
      title: "Langkah Pertama",
      desc: "Menyelesaikan 1 kuis atau latihan materi pertama Anda.",
      tier: "Bronze",
      tierColor: "from-amber-600 to-amber-700 border-amber-300 text-amber-900 bg-amber-50",
      icon: "📜",
      rewardPoints: 50,
      isUnlocked: completedQuizCount >= 1,
      currentValue: completedQuizCount,
      targetValue: 1,
      unit: "Kuis",
      progressPercent: Math.min(100, Math.round((completedQuizCount / 1) * 100)),
      progressText: `${completedQuizCount}/1 Kuis`,
      remainingText:
        completedQuizCount >= 1
          ? "Sertifikat resmi telah diterbitkan"
          : `Kurang ${1 - completedQuizCount} kuis lagi`,
      tips: "Buka menu Belajar atau Ruang Ujian, lalu selesaikan 1 sesi latihan materi.",
      actionUrl: "#belajar",
      actionLabel: "Buka Belajar",
    },
    {
      id: "b2",
      title: "Master Kuis",
      desc: "Menyelesaikan minimal 5 kuis atau ujian dengan sungguh-sungguh.",
      tier: "Silver",
      tierColor: "from-slate-400 to-slate-600 border-slate-300 text-slate-900 bg-slate-50",
      icon: "📜",
      rewardPoints: 150,
      isUnlocked: completedQuizCount >= 5,
      currentValue: completedQuizCount,
      targetValue: 5,
      unit: "Kuis",
      progressPercent: Math.min(100, Math.round((completedQuizCount / 5) * 100)),
      progressText: `${completedQuizCount}/5 Kuis`,
      remainingText:
        completedQuizCount >= 5
          ? "Sertifikat Master Kuis telah dibuka"
          : `Kurang ${Math.max(0, 5 - completedQuizCount)} kuis lagi`,
      tips: "Konsisten kerjakan kuis di setiap bab pelajaran matematika.",
      actionUrl: "#ruang-ujian",
      actionLabel: "Lihat Ujian",
    },
    {
      id: "b3",
      title: "Penjelajah Materi",
      desc: "Menyelesaikan minimal 5 kuis atau latihan materi kurikulum.",
      tier: "Gold",
      tierColor: "from-amber-400 to-orange-500 border-amber-400 text-orange-950 bg-amber-50/80",
      icon: "📜",
      rewardPoints: 150,
      isUnlocked: completedQuizCount >= 5,
      currentValue: completedQuizCount,
      targetValue: 5,
      unit: "Kuis",
      progressPercent: Math.min(100, Math.round((completedQuizCount / 5) * 100)),
      progressText: `${completedQuizCount}/5 Kuis`,
      remainingText:
        completedQuizCount >= 5
          ? "Target 5 kuis tercapai! Sertifikat telah aktif"
          : `Kurang ${Math.max(0, 5 - completedQuizCount)} kuis lagi`,
      tips: "Kerjakan kuis pada setiap bab materi untuk membuka sertifikat ini.",
      actionUrl: "/belajar",
      actionLabel: "Mulai Belajar",
    },
    {
      id: "b4",
      title: "Pembelajar Hebat",
      desc: "Mengumpulkan minimal 1.000 Poin Belajar (XP) dari seluruh aktivitas.",
      tier: "Emerald",
      tierColor: "from-emerald-500 to-teal-600 border-emerald-300 text-emerald-950 bg-emerald-50",
      icon: "📜",
      rewardPoints: 300,
      isUnlocked: learningPoints >= 1000,
      currentValue: learningPoints,
      targetValue: 1000,
      unit: "Poin",
      progressPercent: Math.min(100, Math.round((learningPoints / 1000) * 100)),
      progressText: `${learningPoints.toLocaleString("id-ID")}/1.000 Poin`,
      remainingText:
        learningPoints >= 1000
          ? "Pencapaian 1.000 Poin terverifikasi resmi"
          : `Kurang ${(1000 - learningPoints).toLocaleString("id-ID")} poin lagi`,
      tips: "Kumpulkan poin dari presensi tepat waktu (+20), kuis (+50), dan ulangan (+100).",
      actionUrl: "#peringkat",
      actionLabel: "Lihat Papan Skor",
    },
    {
      id: "b5",
      title: "Penjelajah Soal",
      desc: "Menjawab minimal 10 butir soal matematika dan penalaran kurikulum.",
      tier: "Indigo",
      tierColor: "from-indigo-500 to-blue-600 border-indigo-300 text-indigo-950 bg-indigo-50",
      icon: "📜",
      rewardPoints: 100,
      isUnlocked: answeredSoalCount >= 10,
      currentValue: answeredSoalCount,
      targetValue: 10,
      unit: "Soal",
      progressPercent: Math.min(100, Math.round((answeredSoalCount / 10) * 100)),
      progressText: `${answeredSoalCount}/10 Soal`,
      remainingText:
        answeredSoalCount >= 10
          ? "Penjelajah Soal resmi disahkan"
          : `Kurang ${Math.max(0, 10 - answeredSoalCount)} butir soal lagi`,
      tips: "Buka latihan mandiri pada modul kurikulum bab aljabar atau pythagoras.",
      actionUrl: "#belajar",
      actionLabel: "Mulai Latihan",
    },
    {
      id: "b6",
      title: "Bintang Akademik",
      desc: "Mengumpulkan 1.500+ Poin Belajar dan menyelesaikan minimal 10 sesi kuis/ujian.",
      tier: "Diamond",
      tierColor: "from-purple-500 via-pink-500 to-indigo-600 border-purple-300 text-purple-950 bg-purple-50",
      icon: "📜",
      rewardPoints: 500,
      isUnlocked: learningPoints >= 1500 && completedQuizCount >= 10,
      currentValue: Math.min(learningPoints, 1500),
      targetValue: 1500,
      unit: "XP & Kuis",
      progressPercent: Math.min(
        100,
        Math.round(
          ((Math.min(learningPoints, 1500) / 1500) * 0.7 +
            (Math.min(completedQuizCount, 10) / 10) * 0.3) *
            100
        )
      ),
      progressText: `${completedQuizCount}/10 Kuis • ${learningPoints.toLocaleString("id-ID")}/1.500 XP`,
      remainingText:
        learningPoints >= 1500 && completedQuizCount >= 10
          ? "Sertifikat Kehormatan Tertinggi Bintang Akademik Resmi Disahkan"
          : `Kurang ${Math.max(0, 1500 - learningPoints)} poin & ${Math.max(0, 10 - completedQuizCount)} kuis lagi`,
      tips: "Raih nilai tinggi pada PTS dan selesaikan seluruh bab materi semester ini.",
      actionUrl: "#ruang-ujian",
      actionLabel: "Ke Ruang Ujian",
    },
  ];

  const badges = badgesList && badgesList.length > 0 ? badgesList : defaultBadges;
  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const inProgressCount = badges.filter((b) => !b.isUnlocked && b.progressPercent > 0).length;
  const lockedCount = badges.filter((b) => !b.isUnlocked && b.progressPercent === 0).length;

  const overallProgressPercent = Math.round(
    (badges.reduce((sum, b) => sum + b.progressPercent, 0) / (badges.length * 100)) * 100
  );

  const filteredBadges = badges.filter((b) => {
    if (filter === "unlocked") return b.isUnlocked;
    if (filter === "in_progress") return !b.isUnlocked && b.progressPercent > 0;
    if (filter === "locked") return !b.isUnlocked && b.progressPercent === 0;
    return true;
  });

  const handleActionClick = (badge: StudentBadgeDetail) => {
    if (!onNavigateTab) return;
    if (badge.actionUrl === "#belajar" || badge.actionUrl === "/belajar") {
      onNavigateTab("Belajar");
    } else if (badge.actionUrl === "#ruang-ujian") {
      onNavigateTab("Ruang Ujian");
    } else if (badge.actionUrl === "#peringkat") {
      onNavigateTab("Peringkat");
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-14 space-y-8 animate-in fade-in duration-200 pb-16">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Pencapaian & Sertifikat Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
            Koleksi sertifikat penghargaan resmi atas penyelesaian materi, kuis, dan akumulasi poin belajar Anda.
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-[#0F172A] text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-500" : ""}`} />
            <span>{isLoading ? "Menyinkronkan..." : "Refresh Sertifikat"}</span>
          </button>
        )}
      </div>

      {/* 2. OVERVIEW & STATS CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* Left Progress Summary */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-extrabold">
                Tingkat Capaian: {overallProgressPercent}%
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {unlockedCount} dari {badges.length} Sertifikat Terbuka
              </span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight">
                Galeri Sertifikat Akademik Anda
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Setiap sertifikat diterbitkan secara otomatis setelah Anda memenuhi kriteria pembelajaran yang ditentukan.
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full max-w-md h-2 rounded-full bg-slate-100 border border-slate-200/80 overflow-hidden">
              <div
                className="h-full bg-slate-900 rounded-full transition-all duration-700"
                style={{ width: `${overallProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Right: 3 Real-time Stat Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Poin Belajar</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-[#0F172A]">
                {learningPoints.toLocaleString("id-ID")}{" "}
                <span className="text-xs text-slate-400 font-normal">XP</span>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold mb-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>Kuis Selesai</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-[#0F172A]">
                {completedQuizCount}{" "}
                <span className="text-xs text-slate-400 font-normal">Sesi</span>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold mb-1">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                <span>Soal Dijawab</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-[#0F172A]">
                {answeredSoalCount}{" "}
                <span className="text-xs text-slate-400 font-normal">Butir</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FILTER TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 self-start">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              filter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-[#0F172A]"
            }`}
          >
            Semua ({badges.length})
          </button>
          <button
            onClick={() => setFilter("unlocked")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
              filter === "unlocked"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-[#0F172A]"
            }`}
          >
            <span>Terbuka</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
              {unlockedCount}
            </span>
          </button>
          <button
            onClick={() => setFilter("in_progress")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
              filter === "in_progress"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-[#0F172A]"
            }`}
          >
            <span>Sedang Berjalan</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
              {inProgressCount}
            </span>
          </button>
          <button
            onClick={() => setFilter("locked")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
              filter === "locked"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-[#0F172A]"
            }`}
          >
            <span>Terkunci</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
              {lockedCount}
            </span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Klik sertifikat untuk memeriksa lembar resmi & panduannya
        </span>
      </div>

      {/* 4. CERTIFICATE CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            onClick={() => setSelectedBadge(badge)}
            className={`group relative rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden p-2.5 sm:p-3 flex flex-col justify-between ${
              badge.isUnlocked
                ? "bg-white border-slate-200 hover:border-amber-400/80 shadow-xs hover:shadow-md hover:-translate-y-0.5"
                : "bg-slate-50/60 border-slate-200/80 hover:border-slate-300 shadow-2xs"
            }`}
          >
            {/* Inner Certificate Parchment Frame */}
            <div
              className={`relative rounded-xl p-4 sm:p-5 flex flex-col justify-between h-full space-y-4 border ${
                badge.isUnlocked
                  ? "bg-gradient-to-b from-white via-[#FAF8F5] to-[#F7F4EE] border-amber-900/15"
                  : "bg-white/80 border-slate-200/80"
              }`}
            >
              {/* 4 Corner Flourishes */}
              <CornerFlourish position="tl" />
              <CornerFlourish position="tr" />
              <CornerFlourish position="bl" />
              <CornerFlourish position="br" />

              {/* Certificate Top Header */}
              <div className="flex items-center justify-between border-b border-amber-900/10 pb-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sertifikat Prestasi</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400">
                  TSY-CERT-{badge.id.toUpperCase()}
                </span>
              </div>

              {/* Certificate Subject & Title */}
              <div className="space-y-1.5 my-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Diberikan Atas Pencapaian:
                </p>
                <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A] tracking-tight group-hover:text-blue-700 transition">
                  {badge.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                  {badge.desc}
                </p>
              </div>

              {/* Certificate Footer: Official Seal + Verification / Progress */}
              <div className="pt-3 border-t border-amber-900/10 flex items-end justify-between gap-3">
                {/* Left side: Status & Progress or Verification */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  {badge.isUnlocked ? (
                    <div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Terverifikasi Resmi</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">
                        Bonus: <span className="font-extrabold text-amber-600">+{badge.rewardPoints} XP</span>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span>Progres</span>
                        <span>{badge.progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                        <div
                          className="h-full bg-slate-800 rounded-full transition-all duration-500"
                          style={{ width: `${badge.progressPercent}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {badge.remainingText}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right side: Realistic Wax Seal */}
                <CertificateWaxSeal isUnlocked={badge.isUnlocked} className="w-12 h-12 sm:w-14 sm:h-14" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. FULL-SCALE CERTIFICATE MODAL */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Certificate Frame */}
            <div className="relative rounded-2xl p-6 sm:p-8 border-2 border-amber-900/20 bg-gradient-to-b from-[#FCFBF8] via-[#FAF7F2] to-[#F5F1E8] shadow-inner text-center space-y-5">
              <CornerFlourish position="tl" />
              <CornerFlourish position="tr" />
              <CornerFlourish position="bl" />
              <CornerFlourish position="br" />

              {/* Institution Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-800 uppercase tracking-widest">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Sistem Pembelajaran Digital THINKSY</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight uppercase font-serif">
                  Sertifikat Penghargaan
                </h3>
                <p className="text-[10px] font-mono text-slate-500">
                  No. Registrasi: TSY/CERT/{selectedBadge.id.toUpperCase()}/2026
                </p>
              </div>

              {/* Recipient */}
              <div className="pt-2 border-t border-amber-900/10 space-y-1">
                <p className="text-xs text-slate-500 font-medium italic">
                  Dengan bangga dan penuh hormat dianugerahkan kepada:
                </p>
                <div className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                  {studentName}
                </div>
                <p className="text-xs text-slate-500 font-semibold">{schoolName}</p>
              </div>

              {/* Achievement Body */}
              <div className="py-2 px-4 rounded-xl bg-white/70 border border-amber-900/10 space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Atas Kualifikasi Akademik:
                </p>
                <div className="text-lg font-extrabold text-blue-900">
                  "{selectedBadge.title}"
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
                  {selectedBadge.desc}
                </p>
              </div>

              {/* Status & Signatures / Seal */}
              <div className="pt-3 border-t border-amber-900/10 flex items-center justify-between text-left text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Status Verifikasi:
                  </span>
                  <div>
                    {selectedBadge.isUnlocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Sah & Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-extrabold">
                        <Lock className="w-3 h-3 text-slate-500" />
                        Terkunci ({selectedBadge.progressPercent}%)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Apresiasi: <span className="font-extrabold text-amber-700">+{selectedBadge.rewardPoints} Poin XP</span>
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <CertificateWaxSeal isUnlocked={selectedBadge.isUnlocked} className="w-16 h-16" />
                </div>
              </div>

              {/* Guidance if locked */}
              {!selectedBadge.isUnlocked && (
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-left text-xs text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Panduan Meraih Sertifikat Ini:</span>
                  </div>
                  <p className="text-amber-900/90 text-[11px] leading-relaxed">
                    {selectedBadge.tips}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                {selectedBadge.isUnlocked && (
                  <button
                    type="button"
                    onClick={handlePrintCertificate}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Sertifikat</span>
                  </button>
                )}

                {!selectedBadge.isUnlocked && selectedBadge.actionLabel && onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      handleActionClick(selectedBadge);
                      setSelectedBadge(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <span>{selectedBadge.actionLabel}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

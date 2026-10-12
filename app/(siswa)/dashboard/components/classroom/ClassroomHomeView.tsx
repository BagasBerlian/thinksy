"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Folder,
  MoreVertical,
  ClipboardList,
  Sparkles,
  CheckCircle2,
  Trophy,
  BookOpen,
  ArrowRight,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
} from "lucide-react";
import { ChapterItem, DailyMission, UjianItem } from "../../types";

interface ClassroomHomeViewProps {
  studentName: string;
  chapters: ChapterItem[];
  dailyMissions: DailyMission[];
  isMissionsLoading: boolean;
  isClaimingMissionId: string | null;
  onClaimMission: (id: string) => void;
  examsData: UjianItem[];
  onOpenClass: (classId: string) => void;
  onOpenTodo: () => void;
}

export default function ClassroomHomeView({
  studentName,
  chapters,
  dailyMissions,
  isMissionsLoading,
  isClaimingMissionId,
  onClaimMission,
  examsData,
  onOpenClass,
  onOpenTodo,
}: ClassroomHomeViewProps) {
  const [showDueDetails, setShowDueDetails] = useState(false);
  const pendingMissions = dailyMissions.filter((m) => !m.isClaimed);
  const upcomingExams = examsData.filter(
    (e) => e.status === "dipublikasi" && e.sessionStatus !== "selesai"
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. DUE SOON SECTION (MATCHING SCREENSHOT) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl sm:text-2xl font-normal text-slate-800 tracking-tight font-sans">
            Due soon
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTodo}
              className="text-[#1967D2] hover:underline font-medium text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>View To-do</span>
            </button>
            <button
              onClick={() => setShowDueDetails(!showDueDetails)}
              title="Filter / Toggle Tugas Mendatang"
              className="text-slate-500 hover:text-slate-800 p-1 rounded-full hover:bg-slate-200/60 transition cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Due soon Card (White pill container with subtle border) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-9 transition-all">
          {!showDueDetails ? (
            <div className="flex flex-col items-center justify-center text-center py-2 sm:py-3 space-y-2">
              <p className="text-slate-600 text-xs sm:text-sm font-normal">
                You don't have any work due in the next 7 days
              </p>
              {(pendingMissions.length > 0 || upcomingExams.length > 0) && (
                <button
                  onClick={() => setShowDueDetails(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#1967D2] hover:underline font-medium pt-1 cursor-pointer"
                >
                  <span>
                    Lihat {pendingMissions.length} Misi Belajar & {upcomingExams.length} Ulangan Terjadwal
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Daftar Tugas & Misi Aktif
                </span>
                <button
                  onClick={() => setShowDueDetails(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                >
                  <span>Tutup Rincian</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Missions List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dailyMissions.map((mission) => (
                  <div
                    key={mission.id}
                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {mission.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Progres: {mission.currentCount}/{mission.targetCount} • Hadiah +{mission.rewardPoints} Poin
                      </div>
                    </div>

                    {mission.isClaimed ? (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                        Selesai
                      </span>
                    ) : mission.isCompleted ? (
                      <button
                        onClick={() => onClaimMission(mission.id)}
                        disabled={isClaimingMissionId === mission.id}
                        className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl shadow-xs transition shrink-0 cursor-pointer"
                      >
                        {isClaimingMissionId === mission.id ? "Mengklaim..." : "Klaim"}
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md shrink-0">
                        Berjalan
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Upcoming Exams summary */}
              {upcomingExams.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Ulangan & Ujian Terjadwal
                  </div>
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
                    {upcomingExams.slice(0, 3).map((exam) => (
                      <div
                        key={exam.id}
                        className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{exam.judul}</div>
                          <div className="text-[11px] text-slate-500">
                            {exam.mapel} • Durasi {exam.durasi_menit} Menit • Passing Grade {exam.passing_grade}
                          </div>
                        </div>
                        <Link
                          href="/ujian"
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0"
                        >
                          Buka Ujian →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. CLASSES SECTION (MATCHING SCREENSHOT) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl sm:text-2xl font-normal text-slate-800 tracking-tight font-sans">
            Classes
          </h2>
          <button
            onClick={() => alert("Fitur Gabung Kelas: Masukkan kode kelas yang diberikan oleh guru pengampu.")}
            className="text-[#1967D2] font-medium text-xs sm:text-sm hover:bg-blue-50 px-3 py-1.5 rounded-full transition cursor-pointer"
          >
            + Add class
          </button>
        </div>

        {/* 3 Classes Grid (Exact Cards from Screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CARD 1: Level 10 - Artificial Intelligence */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
            {/* Header Banner */}
            <div className="h-34 sm:h-36 bg-[#374151] relative p-4 flex flex-col justify-between select-none overflow-hidden">
              {/* Subtle AI/Tech Comic Graphic Pattern overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-gradient-to-tr from-black/80 via-slate-800 to-transparent" />
              <div className="absolute top-2 right-2 opacity-15 pointer-events-none text-white text-[9px] font-mono leading-none">
                AI IS TOO UN-HUMAN<br />replace us
              </div>

              {/* Title & Teacher */}
              <div className="relative z-10 space-y-0.5">
                <button
                  onClick={() => onOpenClass("class_ai")}
                  className="text-left font-semibold text-lg text-white group-hover:underline tracking-tight line-clamp-1 block cursor-pointer"
                >
                  Level 10 - Artificial Int...
                </button>
                <p className="text-xs text-white/90 font-normal">
                  Ali Syaugi Bilfagih
                </p>
              </div>

              {/* Circular Teacher Photo Overlapping Bottom Right */}
              <div className="absolute -bottom-8 right-4 w-18 h-18 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-200 z-20">
                <img
                  src="/images/pasfoto-siswa-1.jpg"
                  alt="Ali Syaugi Bilfagih"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Card Body */}
            <div className="pt-9 pb-5 px-4 min-h-[95px] flex flex-col justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-700">
                  Semester Ganjil • Kurikulum Berbasis AI
                </div>
                <div className="text-[11px] text-slate-500">
                  {chapters.filter((c) => c.mapel?.toLowerCase().includes("matematika") || c.mapel?.toLowerCase().includes("info")).length || 4} Bab Pembelajaran • Tersedia Materi & Latihan Sokratik
                </div>
              </div>

              {/* Subtle Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-slate-700 h-full rounded-full" style={{ width: "70%" }} />
              </div>
            </div>

            {/* Card Footer with 3 Google Classroom Icons */}
            <div className="border-t border-slate-100 py-2.5 px-4 flex items-center justify-end gap-3 text-slate-500 bg-white">
              <button
                onClick={() => onOpenClass("class_ai")}
                title="Buka Tugas Kelas"
                className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
              >
                <ClipboardList className="w-5 h-5" />
              </button>
              <button
                onClick={() => onOpenClass("class_ai")}
                title="Buka Folder Materi"
                className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
              >
                <Folder className="w-5 h-5" />
              </button>
              <button
                onClick={() => alert("Opsi Kelas: Level 10 - Artificial Intelligence (Pengajar: Ali Syaugi Bilfagih)")}
                title="Opsi Lainnya"
                className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* CARD 2: Science */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
            {/* Header Banner */}
            <div className="h-34 sm:h-36 bg-[#2563EB] relative p-4 flex flex-col justify-between select-none overflow-hidden">
              {/* Graphic Illustration (Magnet / Field) */}
              <div className="absolute top-3 right-6 opacity-25 pointer-events-none">
                <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5">
                  <path d="M4 4v7a8 8 0 0 0 16 0V4" />
                  <line x1="4" y1="8" x2="8" y2="8" />
                  <line x1="16" y1="8" x2="20" y2="8" />
                </svg>
              </div>

              {/* Title & Teacher */}
              <div className="relative z-10 space-y-0.5">
                <button
                  onClick={() => onOpenClass("class_science")}
                  className="text-left font-semibold text-2xl text-white group-hover:underline tracking-tight block cursor-pointer"
                >
                  Science
                </button>
                <p className="text-xs text-white/90 font-normal">
                  Galih Saputro
                </p>
              </div>

              {/* Circular Teacher Photo Overlapping Bottom Right */}
              <div className="absolute -bottom-8 right-4 w-18 h-18 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-200 z-20">
                <img
                  src="/images/foto-guru.jpg"
                  alt="Galih Saputro"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Card Body */}
            <div className="pt-9 pb-5 px-4 min-h-[95px] flex flex-col justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-700">
                  Semester Ganjil • Eksperimen & Penalaran Sains
                </div>
                <div className="text-[11px] text-slate-500">
                  {chapters.filter((c) => c.mapel?.toLowerCase().includes("ipa") || c.mapel?.toLowerCase().includes("sains")).length || 3} Bab Pembelajaran • Modul Interaktif & Kuis Digital
                </div>
              </div>

              {/* Subtle Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: "85%" }} />
              </div>
            </div>

            {/* Card Footer with 3 Google Classroom Icons */}
            <div className="border-t border-slate-100 py-2.5 px-4 flex items-center justify-end gap-3 text-slate-500 bg-white">
              <button
                onClick={() => onOpenClass("class_science")}
                title="Buka Tugas Kelas"
                className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
              >
                <ClipboardList className="w-5 h-5" />
              </button>
              <button
                onClick={() => onOpenClass("class_science")}
                title="Buka Folder Materi"
                className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
              >
                <Folder className="w-5 h-5" />
              </button>
              <button
                onClick={() => alert("Opsi Kelas: Science (Pengajar: Galih Saputro)")}
                title="Opsi Lainnya"
                className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* CARD 3: Orientasi */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
            {/* Header Banner */}
            <div className="h-34 sm:h-36 bg-[#00796B] relative p-4 flex flex-col justify-between select-none overflow-hidden">
              {/* Graphic Illustration (Mobile & Notes) */}
              <div className="absolute top-2 right-4 opacity-20 pointer-events-none">
                <svg className="w-18 h-18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.5">
                  <rect x="5" y="2" width="14" height="20" rx="3" />
                  <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2" />
                  <path d="M8 6h8M8 10h8M8 14h5" />
                </svg>
              </div>

              {/* Title & Teacher */}
              <div className="relative z-10 space-y-0.5">
                <button
                  onClick={() => onOpenClass("class_orientasi")}
                  className="text-left font-semibold text-2xl text-white group-hover:underline tracking-tight block cursor-pointer"
                >
                  Orientasi
                </button>
                <p className="text-xs text-white/90 font-normal">
                  Galih Saputro
                </p>
              </div>

              {/* Circular Teacher Photo Overlapping Bottom Right */}
              <div className="absolute -bottom-8 right-4 w-18 h-18 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-200 z-20">
                <img
                  src="/images/foto-guru.jpg"
                  alt="Galih Saputro"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Card Body */}
            <div className="pt-9 pb-5 px-4 min-h-[95px] flex flex-col justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-700">
                  Semester Ganjil • Pembinaan Akademik & Karakter
                </div>
                <div className="text-[11px] text-slate-500">
                  {chapters.filter((c) => c.mapel?.toLowerCase().includes("indonesia") || c.mapel?.toLowerCase().includes("orientasi")).length || 4} Bab Pembelajaran • Panduan Belajar & Tata Tertib
                </div>
              </div>

              {/* Subtle Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-teal-600 h-full rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            {/* Card Footer with 3 Google Classroom Icons */}
            <div className="border-t border-slate-100 py-2.5 px-4 flex items-center justify-end gap-3 text-slate-500 bg-white">
              <button
                onClick={() => onOpenClass("class_orientasi")}
                title="Buka Tugas Kelas"
                className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
              >
                <ClipboardList className="w-5 h-5" />
              </button>
              <button
                onClick={() => onOpenClass("class_orientasi")}
                title="Buka Folder Materi"
                className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
              >
                <Folder className="w-5 h-5" />
              </button>
              <button
                onClick={() => alert("Opsi Kelas: Orientasi (Pengajar: Galih Saputro)")}
                title="Opsi Lainnya"
                className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

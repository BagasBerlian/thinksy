"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  FileText,
  PlayCircle,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Layers,
  GraduationCap,
  Clock,
  Award,
  Globe,
} from "lucide-react";
import { ChapterItem } from "../../types";

interface RuangBelajarSubjectChaptersViewProps {
  selectedSubject: "Matematika" | "Bahasa Indonesia" | "Bahasa Inggris";
  chapters: ChapterItem[];
  userProfile?: {
    nama_kelas?: string;
    tingkat_kelas?: number;
  };
  onBackToHome: () => void;
  onSelectSubject?: (subject: "Matematika" | "Bahasa Indonesia" | "Bahasa Inggris") => void;
}

const SUBJECT_DETAILS = {
  Matematika: {
    name: "Matematika",
    code: "MTK-8",
    color: "blue",
    bgBadge: "bg-blue-600/20 text-blue-300 border-blue-500/30",
    headerBg: "bg-slate-900 border border-slate-800",
    desc: "Aljabar, Teorema Pythagoras, Persamaan Linear, Statistika, Peluang & Penalaran Matematika.",
    icon: BookOpen,
  },
  "Bahasa Indonesia": {
    name: "Bahasa Indonesia",
    code: "BIN-8",
    color: "emerald",
    bgBadge: "bg-emerald-600/20 text-emerald-300 border-emerald-500/30",
    headerBg: "bg-slate-900 border border-slate-800",
    desc: "Teks Laporan Hasil Observasi, Puisi Rakyat, Menulis Cerita Fantasi & Literasi Kritis.",
    icon: FileText,
  },
  "Bahasa Inggris": {
    name: "Bahasa Inggris",
    code: "ENG-8",
    color: "purple",
    bgBadge: "bg-purple-600/20 text-purple-300 border-purple-500/30",
    headerBg: "bg-slate-900 border border-slate-800",
    desc: "Reading Comprehension, Narrative Text, Descriptive Analysis, Grammar & Vocabulary.",
    icon: Globe,
  },
};

export default function RuangBelajarSubjectChaptersView({
  selectedSubject,
  chapters,
  userProfile,
  onBackToHome,
  onSelectSubject,
}: RuangBelajarSubjectChaptersViewProps) {
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const meta = SUBJECT_DETAILS[selectedSubject] || SUBJECT_DETAILS["Matematika"];
  const SubjectIcon = meta.icon;

  // Filter chapters by subject
  const subjectChapters = useMemo(() => {
    const key = selectedSubject.toLowerCase();
    let list = chapters.filter((c) => {
      const mapelLower = (c.mapel || "").toLowerCase();
      if (key.includes("matematika")) return mapelLower.includes("matematika") || mapelLower.includes("math");
      if (key.includes("indonesia")) return mapelLower.includes("indonesia");
      if (key.includes("inggris")) return mapelLower.includes("inggris") || mapelLower.includes("english");
      return mapelLower.includes(key);
    });

    if (list.length === 0) {
      // Fallback: if no chapters explicitly matched by mapel, return first few
      list = chapters.slice(0, 5);
    }
    return list;
  }, [chapters, selectedSubject]);

  // Filter by semester
  const semesterChapters = useMemo(() => {
    const filtered = subjectChapters.filter((c) => {
      const sem = c.semester || (c.urutan <= 3 ? 1 : 2);
      return sem === selectedSemester;
    });
    return filtered.length > 0 ? filtered : subjectChapters;
  }, [subjectChapters, selectedSemester]);

  // Total materials count
  const totalMateriCount = semesterChapters.reduce(
    (acc, curr) => acc + (curr.materi?.length || 3),
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Quick Subject Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button
            onClick={onBackToHome}
            className="hover:text-blue-600 transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <span>/</span>
          <span>Ruang Belajar</span>
          <span>/</span>
          <span className="text-blue-600 font-bold">{selectedSubject}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/belajar?mapel=${encodeURIComponent(selectedSubject)}`}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Layar Penuh</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Header Banner Ruang Belajar */}
      <div className={`rounded-3xl ${meta.headerBg} text-white p-6 sm:p-8 shadow-md relative overflow-hidden`}>
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-white">
              RUANG BELAJAR
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-white/90">
              {meta.code} • Kurikulum Merdeka
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-white/90">
              Kelas {userProfile?.tingkat_kelas || 8} ({userProfile?.nama_kelas || "Kelas 8"})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0 shadow-inner">
              <SubjectIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {selectedSubject}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 font-normal mt-0.5">
                {meta.desc}
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-white/90 font-medium border-t border-white/15">
            <div>
              📚 Total: <strong className="text-white">{semesterChapters.length} Bab</strong>
            </div>
            <div>
              📄 Materi: <strong className="text-white">{totalMateriCount} Bahan Pembelajaran</strong>
            </div>
            <div>
              🎯 Pembahasan: <strong className="text-white">Latihan Pemahaman Konsep & Kuis Mandiri</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Semester Switcher & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Pilih Semester:</span>
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 text-xs font-bold">
            <button
              onClick={() => setSelectedSemester(1)}
              className={`px-4 py-1.5 rounded-lg transition cursor-pointer ${
                selectedSemester === 1
                  ? "bg-white text-blue-600 shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semester 1 (Ganjil)
            </button>
            <button
              onClick={() => setSelectedSemester(2)}
              className={`px-4 py-1.5 rounded-lg transition cursor-pointer ${
                selectedSemester === 2
                  ? "bg-white text-blue-600 shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semester 2 (Genap)
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Menampilkan {semesterChapters.length} Bab untuk Semester {selectedSemester}
        </div>
      </div>

      {/* Bab (Chapters) List Grid */}
      <div className="space-y-4">
        {semesterChapters.map((chap, idx) => {
          const materiList = chap.materi || [
            { id: `m1-${chap.id}`, judul: "1. Konsep & Definisi Dasar", urutan: 1 },
            { id: `m2-${chap.id}`, judul: "2. Pendalaman Materi & Contoh Soal", urutan: 2 },
            { id: `m3-${chap.id}`, judul: "3. Latihan Penalaran & Pembahasan", urutan: 3 },
          ];

          return (
            <div
              key={chap.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-6 space-y-4 group"
            >
              {/* Bab Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center justify-center font-black text-sm shrink-0 shadow-2xs group-hover:scale-105 transition">
                    Bab {chap.urutan || idx + 1}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition">
                      {chap.judul}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-2">
                      {chap.deskripsi || "Pemahaman konsep mendalam dan penalaran berbasis kurikulum merdeka."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/70">
                    {materiList.length} Bahan Materi
                  </span>
                </div>
              </div>

              {/* Grid 3 Kolom Materi Pembelajaran di dalam Bab */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Materi Pembelajaran ({materiList.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {materiList.map((m, mIdx) => (
                    <Link
                      key={m.id}
                      href={`/bab/${chap.id}`}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/70 hover:border-blue-200 transition p-3.5 flex items-center justify-between gap-2 group/m cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 group-hover/m:text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {mIdx + 1}
                        </div>
                        <span className="text-xs font-bold text-slate-800 group-hover/m:text-blue-700 truncate">
                          {m.judul}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/m:text-blue-600 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Siap dipelajari kapan saja melalui Ruang Belajar Thinksy.</span>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <Link
                    href={`/quiz/${chap.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                  >
                    Kuis Bab
                  </Link>
                  <Link
                    href={`/bab/${chap.id}`}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <span>Lanjutkan Pengerjaan</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

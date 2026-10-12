"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  PlayCircle,
  CheckCircle2,
  Lock,
  ChevronRight,
  GraduationCap,
  Users,
  Award,
} from "lucide-react";
import { ChapterItem, PeerStudent } from "../../types";

interface ClassroomClassDetailViewProps {
  classId: "class_ai" | "class_science" | "class_orientasi";
  onBack: () => void;
  chapters: ChapterItem[];
  peerStudents: PeerStudent[];
  studentName: string;
}

export default function ClassroomClassDetailView({
  classId,
  onBack,
  chapters,
  peerStudents,
  studentName,
}: ClassroomClassDetailViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"classwork" | "stream" | "people">("classwork");

  const classConfigs = {
    class_ai: {
      title: "Level 10 - Artificial Intelligence",
      teacher: "Ali Syaugi Bilfagih",
      code: "AI-10X-2026",
      bgClass: "bg-[#374151]",
      avatar: "/images/pasfoto-siswa-1.jpg",
      description: "Eksplorasi kecerdasan buatan, algoritma machine learning, dan penalaran komputasional Sokratik tingkat lanjut.",
      filterTag: ["matematika", "info", "ai"],
    },
    class_science: {
      title: "Science",
      teacher: "Galih Saputro",
      code: "SCI-8A-2026",
      bgClass: "bg-[#2563EB]",
      avatar: "/images/foto-guru.jpg",
      description: "Penalaran ilmiah fenomena alam, penyelidikan eksperimen sains terapan, dan konsep fisika-biologi terintegrasi.",
      filterTag: ["ipa", "sains", "matematika"],
    },
    class_orientasi: {
      title: "Orientasi",
      teacher: "Galih Saputro",
      code: "ORI-8B-2026",
      bgClass: "bg-[#00796B]",
      avatar: "/images/foto-guru.jpg",
      description: "Panduan pembinaan karakter siswa, tata tertib kurikulum merdeka, dan literasi kebahasaan.",
      filterTag: ["indonesia", "orientasi", "bahasa"],
    },
  };

  const currentClass = classConfigs[classId] || classConfigs.class_ai;

  // Filter chapters relevant to this class
  const classChapters = chapters.filter((c) => {
    const mapelLower = (c.mapel || "").toLowerCase();
    return currentClass.filterTag.some((tag) => mapelLower.includes(tag));
  });

  const displayedChapters = classChapters.length > 0 ? classChapters : chapters.slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb / Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#1967D2] transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Semua Kelas</span>
      </button>

      {/* Classroom Hero Banner */}
      <div className={`rounded-3xl ${currentClass.bgClass} text-white p-6 sm:p-8 relative overflow-hidden shadow-sm`}>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="text-[11px] font-bold tracking-wider uppercase bg-white/20 px-3 py-1 rounded-full">
            Kode Kelas: {currentClass.code}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {currentClass.title}
          </h1>
          <p className="text-white/90 text-xs sm:text-sm">
            Pengajar: <strong className="text-white">{currentClass.teacher}</strong>
          </p>
          <p className="text-white/80 text-xs leading-relaxed pt-1">
            {currentClass.description}
          </p>
        </div>

        {/* Floating teacher avatar on banner */}
        <div className="absolute top-6 right-6 hidden sm:block">
          <div className="w-20 h-20 rounded-full border-4 border-white/80 shadow-lg overflow-hidden bg-white">
            <img
              src={currentClass.avatar}
              alt={currentClass.teacher}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs (Google Classroom: Tugas Kelas, Forum, Anggota) */}
      <div className="flex items-center gap-1 border-b border-slate-200 px-2">
        <button
          onClick={() => setActiveSubTab("classwork")}
          className={`py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeSubTab === "classwork"
              ? "border-[#1967D2] text-[#1967D2]"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Tugas Kelas (Classwork)
        </button>
        <button
          onClick={() => setActiveSubTab("stream")}
          className={`py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeSubTab === "stream"
              ? "border-[#1967D2] text-[#1967D2]"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Pengumuman (Stream)
        </button>
        <button
          onClick={() => setActiveSubTab("people")}
          className={`py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeSubTab === "people"
              ? "border-[#1967D2] text-[#1967D2]"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Anggota Kelas ({peerStudents.length + 1})
        </button>
      </div>

      {/* SUB-TAB 1: CLASSWORK (BAB & MATERI PEMBELAJARAN) */}
      {activeSubTab === "classwork" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              Modul & Bab Pembelajaran ({displayedChapters.length} Bab)
            </h2>
            <Link
              href="/belajar"
              className="text-xs font-semibold text-[#1967D2] hover:underline"
            >
              Buka Semua di Ruang Belajar →
            </Link>
          </div>

          <div className="space-y-3">
            {displayedChapters.map((chap, idx) => (
              <div
                key={chap.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1967D2] flex items-center justify-center font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">
                        {chap.judul}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {chap.deskripsi || "Materi pemahaman konsep dan penalaran interaktif."}
                      </p>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {chap.materi?.length || 3} Bahan Bacaan & Latihan Soal
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/bab/${chap.id}`}
                    className="self-end sm:self-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                  >
                    <span>Mulai Belajar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STREAM (PENGUMUMAN KELAS) */}
      {activeSubTab === "stream" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm">
                {studentName.charAt(0)}
              </div>
              <input
                type="text"
                placeholder="Bagikan sesuatu dengan kelas Anda..."
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => alert("Gunakan fitur Diskusi Global di menu atas (9-dots) untuk berinteraksi bersama siswa lainnya!")}
                readOnly
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200">
                <img src={currentClass.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800">{currentClass.teacher}</div>
                <div className="text-[10px] text-slate-400">Kemarin pukul 08:30 WIB</div>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed pt-1">
              Selamat datang para siswa di semester ganjil! Silakan pelajari seluruh modul materi pembelajaran pada tab <strong>Tugas Kelas</strong> dan kerjakan kuis latihan formatif secara mandiri.
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PEOPLE (ANGGOTA KELAS) */}
      {activeSubTab === "people" && (
        <div className="space-y-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          {/* Guru */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Pengajar
            </h3>
            <div className="flex items-center gap-3 pt-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                <img src={currentClass.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800">{currentClass.teacher}</div>
                <div className="text-[11px] text-slate-500">Guru Pengampu & Wali Kelas</div>
              </div>
            </div>
          </div>

          {/* Teman Sekelas */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>Teman Sekelas</span>
              <span className="text-xs font-normal text-slate-500">
                {peerStudents.length + 1} Siswa
              </span>
            </h3>
            <div className="divide-y divide-slate-100 pt-1">
              <div className="flex items-center gap-3 py-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                  {studentName.charAt(0)}
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {studentName} <span className="text-[10px] text-blue-600 font-semibold">(Anda)</span>
                </div>
              </div>

              {peerStudents.map((peer) => (
                <div key={peer.id} className="flex items-center gap-3 py-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                    {peer.initials}
                  </div>
                  <div className="text-xs font-medium text-slate-700">{peer.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

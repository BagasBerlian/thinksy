"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sliders,
  HelpCircle,
  Cpu,
  Bot,
  Clock,
  Shield,
  GraduationCap,
  BookOpen,
  Award,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Play,
  Copy,
  Check,
  Plus,
  Eye,
  Settings,
  Users,
  AlertCircle,
  FileText,
  BarChart3,
  ExternalLink,
  Flame,
} from "lucide-react";

interface PengelolaanNormalScreenProps {
  onNavigateHome?: () => void;
}

export default function PengelolaanNormalScreen({
  onNavigateHome,
}: PengelolaanNormalScreenProps) {
  // Navigation level: "main" | "ruang_ujian" | "detail_ulangan" | "detail_ujian"
  const [currentLevel, setCurrentLevel] = useState<"main" | "ruang_ujian" | "detail_ulangan" | "detail_ujian">("main");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Ruang Ulangan & Ujian Active Toggles
  const [isUlanganRoomOpen, setIsUlanganRoomOpen] = useState(true);
  const [isUjianRoomOpen, setIsUjianRoomOpen] = useState(false);

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER BANNER DI SEBELAH KANAN NAVBAR */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span
              onClick={() => setCurrentLevel("main")}
              className="hover:text-indigo-600 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pengelolaan</span>
            </span>

            {currentLevel !== "main" && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span
                  onClick={() => setCurrentLevel("ruang_ujian")}
                  className={`transition ${
                    currentLevel === "ruang_ujian"
                      ? "text-amber-600 font-extrabold"
                      : "hover:text-indigo-600 cursor-pointer"
                  }`}
                >
                  Kelola Ruang Ujian
                </span>
              </>
            )}

            {currentLevel === "detail_ulangan" && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-amber-600 font-extrabold">Ulangan</span>
              </>
            )}

            {currentLevel === "detail_ujian" && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-amber-600 font-extrabold">Ujian</span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            {currentLevel === "main" && "Pusat Pengelolaan Pembelajaran"}
            {currentLevel === "ruang_ujian" && "Kelola Ruang Ujian & Ulangan"}
            {currentLevel === "detail_ulangan" && "Ruang Ulangan Harian (UH)"}
            {currentLevel === "detail_ujian" && "Ruang Penilaian Tengah & Akhir Semester (Ujian)"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {currentLevel === "main" &&
              "Kelola seluruh materi asesmen: Kuis harian, simulasi AI Sokratik, dan ruang pengawasan ujian resmi."}
            {currentLevel === "ruang_ujian" &&
              "Pilih antara manajemen sesi 'Ulangan' harian atau 'Ujian' semester berstandar resmi sekolah."}
            {currentLevel === "detail_ulangan" &&
              "Kendali ruang ulangan bab, monitoring siswa live, generator token instan, dan evaluasi hasil."}
            {currentLevel === "detail_ujian" &&
              "Manajemen ujian resmi PTS/PAS, durasi ketat, mode anti-curang, dan rekapitulasi nilai."}
          </p>
        </div>

        {/* Back Button or Quick Stats */}
        <div className="flex items-center gap-3 shrink-0">
          {currentLevel !== "main" && (
            <button
              onClick={() => {
                if (currentLevel === "detail_ulangan" || currentLevel === "detail_ujian") {
                  setCurrentLevel("ruang_ujian");
                } else {
                  setCurrentLevel("main");
                }
              }}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center gap-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          )}

          <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Panel Pengelolaan Guru</span>
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT: LEVEL 1 (MAIN: 3 BUTTONS) */}
      {currentLevel === "main" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* BUTTON 1: KELOLA KUIS */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all duration-300 p-6 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                  Bank Kuis
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#0F172A] group-hover:text-indigo-600 transition">
                  Kelola Kuis
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Kelola kuis mandiri siswa, tinjau butir soal pilihan ganda & esai terbitan AI, serta review jawaban esai.
                </p>
              </div>

              {/* Mini Highlights */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Kuis Aktif:</span>
                  <span className="font-extrabold text-[#0F172A]">Bab 4: SPLDV</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Total Soal Bank:</span>
                  <span className="font-extrabold text-indigo-600">45 Soal Tersedia</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Esai Menunggu:</span>
                  <span className="font-extrabold text-amber-600">5 Jawaban Masuk</span>
                </div>
              </div>
            </div>

            {/* Action Buttons for Kuis */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Link
                href="/guru/soal/latihan"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition cursor-pointer shadow-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>Buka Bank Soal Kuis</span>
              </Link>
              <Link
                href="/guru/penilaian"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer border border-slate-200"
              >
                <span>Validasi Nilai Esai AI</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* BUTTON 2: KELOLA SIMULASI */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all duration-300 p-6 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Bot className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Sokratik AI
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#0F172A] group-hover:text-emerald-600 transition">
                  Kelola Simulasi
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Konfigurasi simulasi ANBK (Literasi & Numerasi bernalar) serta kendali model kecerdasan buatan Thinksy.
                </p>
              </div>

              {/* Mini Highlights */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Simulasi ANBK:</span>
                  <span className="font-extrabold text-emerald-700">3 Paket Aktif</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Socrates Mode:</span>
                  <span className="font-extrabold text-[#0F172A]">Aktif (Max 4 Kalimat)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Tingkat Kesulitan:</span>
                  <span className="font-extrabold text-blue-600">Adaptif Siswa</span>
                </div>
              </div>
            </div>

            {/* Action Buttons for Simulasi */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Link
                href="/guru/soal/eksplorasi"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition cursor-pointer shadow-sm"
              >
                <Cpu className="w-4 h-4" />
                <span>Kurasi Generator Simulasi AI</span>
              </Link>
              <Link
                href="/"
                target="_blank"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer border border-slate-200"
              >
                <span>Uji Coba Tampilan Siswa</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* BUTTON 3: KELOLA RUANG UJIAN (CLICK TO SHOW NORMAL SCREEN: ULANGAN, UJIAN) */}
          <div
            onClick={() => setCurrentLevel("ruang_ujian")}
            className="bg-white rounded-3xl border-2 border-amber-400/80 shadow-md hover:shadow-2xl hover:border-amber-500 transition-all duration-300 p-6 flex flex-col justify-between space-y-6 group cursor-pointer relative overflow-hidden"
          >
            {/* Glowing Tag */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs">
              Klik untuk Membuka
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Clock className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Pusat Pengawasan
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#0F172A] group-hover:text-amber-600 transition flex items-center gap-2">
                  <span>Kelola Ruang Ujian</span>
                  <ChevronRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Buka dan pantau ruang ujian live. Mengendalikan sesi <strong>Ulangan Harian</strong> dan <strong>Ujian Semester</strong> resmi.
                </p>
              </div>

              {/* Status Chips */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold">Ruang Ulangan:</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Buka / Aktif</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold">Ruang Ujian Resmi:</span>
                  <span className="font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">Terjadwal PTS</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold">Anti-Curang:</span>
                  <span className="font-extrabold text-indigo-700">Aktif (Lock Screen)</span>
                </div>
              </div>
            </div>

            {/* Click to open button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#0F172A] group-hover:bg-amber-600 text-white text-xs font-black transition cursor-pointer shadow-md"
              >
                <Shield className="w-4 h-4 text-amber-400 group-hover:text-white" />
                <span>Masuk Normal Screen Ruang Ujian</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. BODY CONTENT: LEVEL 2 (NORMAL SCREEN BUTTON 'ULANGAN, UJIAN') */}
      {currentLevel === "ruang_ujian" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Description for Ruang Ujian */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0F172A] to-slate-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-black border border-amber-500/30">
                <Shield className="w-3.5 h-3.5" />
                <span>NORMAL SCREEN: KELOLA RUANG UJIAN</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                Pilih Kategori Ruang: Ulangan Harian atau Ujian Resmi
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Silakan klik tombol di bawah untuk mengontrol dan mengawasi jalannya asesmen siswa secara langsung.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/guru/ujian/create"
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Asesmen Baru</span>
              </Link>
            </div>
          </div>

          {/* 2 MAIN BUTTONS: ULANGAN & UJIAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BUTTON 1: ULANGAN */}
            <div className="bg-white rounded-3xl border-2 border-indigo-200 hover:border-indigo-500 p-6 sm:p-8 space-y-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black border border-indigo-200 shadow-inner">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Status:</span>
                    <button
                      onClick={() => setIsUlanganRoomOpen(!isUlanganRoomOpen)}
                      className={`px-3 py-1 rounded-full text-xs font-black cursor-pointer transition ${
                        isUlanganRoomOpen
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-slate-100 text-slate-600 border border-slate-300"
                      }`}
                    >
                      {isUlanganRoomOpen ? "● Ruang Buka" : "○ Ruang Tutup"}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-[#0F172A]">
                    Tombol: Kelola Ulangan
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    Ulangan Harian Bab 1 s/d Bab 6. Digunakan untuk evaluasi formatif per kompetensi dasar siswa dengan penilaian instan AI.
                  </p>
                </div>

                {/* Token Box */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                  <div className="text-[11px] font-black text-indigo-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Token Ruang Ulangan Harian:</span>
                    <span className="text-[10px] text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                      Aktif Hari Ini
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-indigo-200">
                    <code className="text-lg font-black tracking-widest text-[#0F172A]">
                      UH-MAT-8A
                    </code>
                    <button
                      onClick={() => handleCopy("UH-MAT-8A")}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedToken === "UH-MAT-8A" ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Token</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Ulangan Details list */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="font-black text-[#0F172A]">Ulangan Harian 1: Aljabar & Eksponen</div>
                      <div className="text-[11px] text-slate-500">Passing Grade: 75 • 32 Peserta Kelas 8A</div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      Selesai
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="font-black text-[#0F172A]">Ulangan Harian 2: Teorema Pythagoras</div>
                      <div className="text-[11px] text-slate-500">Passing Grade: 75 • Siap Dikerjakan</div>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                      Live
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <Link
                  href="/guru/ujian"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition cursor-pointer shadow-md"
                >
                  <Eye className="w-4 h-4" />
                  <span>Buka Live Monitoring Ulangan</span>
                </Link>
                <Link
                  href="/guru/ujian/create?tipe=ulangan"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Jadwalkan Ulangan Harian Baru</span>
                </Link>
              </div>
            </div>

            {/* BUTTON 2: UJIAN */}
            <div className="bg-white rounded-3xl border-2 border-amber-300 hover:border-amber-500 p-6 sm:p-8 space-y-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black border border-amber-200 shadow-inner">
                    <Award className="w-8 h-8" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Status:</span>
                    <button
                      onClick={() => setIsUjianRoomOpen(!isUjianRoomOpen)}
                      className={`px-3 py-1 rounded-full text-xs font-black cursor-pointer transition ${
                        isUjianRoomOpen
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-slate-100 text-slate-600 border border-slate-300"
                      }`}
                    >
                      {isUjianRoomOpen ? "● Ruang Buka" : "○ Ruang Terjadwal"}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-[#0F172A]">
                    Tombol: Kelola Ujian
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    Penilaian Tengah Semester (PTS) & Penilaian Akhir Semester (PAS) resmi sekolah dengan standar integritas dan durasi ketat.
                  </p>
                </div>

                {/* Token Box */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-2">
                  <div className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Token Ruang Ujian Resmi:</span>
                    <span className="text-[10px] text-amber-700 bg-white px-2 py-0.5 rounded-md border border-amber-200">
                      Tingkat Sekolah
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-amber-200">
                    <code className="text-lg font-black tracking-widest text-[#0F172A]">
                      PTS-SM1-2026
                    </code>
                    <button
                      onClick={() => handleCopy("PTS-SM1-2026")}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedToken === "PTS-SM1-2026" ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Token</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Ujian Details list */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="font-black text-[#0F172A]">PTS Matematika Terpadu Kelas 8</div>
                      <div className="text-[11px] text-slate-500">Durasi: 90 Menit • Acak Soal • KKM 75</div>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                      Terjadwal
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="font-black text-[#0F172A]">PAS Matematika Semester Ganjil</div>
                      <div className="text-[11px] text-slate-500">Konfigurasi Soal Selesai</div>
                    </div>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                      Draft
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <Link
                  href="/guru/ujian"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-black transition cursor-pointer shadow-md"
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Buka Live Pengawasan Ujian</span>
                </Link>
                <Link
                  href="/guru/ujian/create?tipe=ujian"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Jadwalkan Ujian Semester Baru</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

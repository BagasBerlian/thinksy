"use client";

import { useState } from "react";
import {
  ArrowLeft,
  BrainCircuit,
  BookOpen,
  CheckCircle2,
  Clock,
  ChevronRight,
  FileText,
  Sparkles,
  HelpCircle,
  Award,
  PlayCircle,
  Check,
  List,
} from "lucide-react";
import Link from "next/link";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";
import TutorChat from "@/components/tutor/TutorChat";

interface MateriItem {
  id: string;
  judul: string;
  urutan: number;
  konten?: string;
  konten_markdown?: string;
}

interface DaftarMateriClientProps {
  babId: string;
  judulBab: string;
  deskripsiBab: string;
  urutanBab: number;
  listMateri: MateriItem[];
  initialMateriId?: string;
}

export default function DaftarMateriClient({
  babId,
  judulBab,
  deskripsiBab,
  urutanBab,
  listMateri,
  initialMateriId,
}: DaftarMateriClientProps) {
  // If a specific materiId is selected, show Detail Materi Reading view (image_71b8f5.png)
  const [selectedMateriId, setSelectedMateriId] = useState<string | null>(
    initialMateriId || null
  );

  const selectedMateri = listMateri.find((m) => m.id === selectedMateriId);

  // Mock Modules for Bab 2: Persamaan Kuadrat if empty
  const defaultModules = [
    {
      id: "materi-2-1",
      judul: "2.1 Pengantar Persamaan Bentuk Kuadrat",
      duration: "15 Menit",
      status: "Selesai",
      isCompleted: true,
      konten: `### 1. Definisi Persamaan Kuadrat\n\nPersamaan kuadrat adalah persamaan polinomial tingkat dua yang dapat ditulis dalam bentuk umum:\n\n$$ax^2 + bx + c = 0$$\n\ndengan $a \\neq 0$, di mana:\n- $x$ adalah variabel (peubah).\n- $a, b$ adalah koefisien real.\n- $c$ adalah konstanta.\n\n### Contoh Bentuk Kuadrat:\n1. $x^2 - 5x + 6 = 0$\n2. $2x^2 + 3x - 5 = 0$\n3. $x^2 - 9 = 0$`,
    },
    {
      id: "materi-2-2",
      judul: "2.2 Metode Faktorisasi & Kuadrat Sempurna",
      duration: "20 Menit",
      status: "Selesai",
      isCompleted: true,
      konten: `### 2. Metode Pemfaktoran\n\nMetode faktorisasi mencari dua nilai $(x - p)(x - q) = 0$ sehingga:\n\n$$p + q = b \\quad \\text{dan} \\quad p \\cdot q = a \\cdot c$$\n\n#### Contoh Soal:\nSelesaikan $x^2 - 5x + 6 = 0$.\n- Cari angka yang jika dijumlahkan $= -5$ dan dikali $= 6$.\n- Angka tersebut adalah $-2$ dan $-3$.\n- Sehinggga $(x - 2)(x - 3) = 0$, yaitu $x_1 = 2$ dan $x_2 = 3$.`,
    },
    {
      id: "materi-2-3",
      judul: "2.3 Formula ABC & Diskriminan (D)",
      duration: "25 Menit",
      status: "Belum Selesai",
      isCompleted: false,
      konten: `### 3. Rumus Kuadratik (Formula ABC)\n\nJika persamaan kuadrat $ax^2 + bx + c = 0$ tidak dapat difaktorkan secara langsung, gunakan Rumus ABC:\n\n$$x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\n### Diskriminan ($D$)\nNilai $D = b^2 - 4ac$ menentukan jenis akar-akar persamaan kuadrat:\n- **$D > 0$**: Memiliki 2 akar real berbeda.\n- **$D = 0$**: Memiliki 2 akar real kembar ($x_1 = x_2$).\n- **$D < 0$**: Memiliki akar imajiner (tidak real).`,
    },
  ];

  const displayModules =
    listMateri.length > 0
      ? listMateri.map((m, idx) => ({
          id: m.id,
          judul: m.judul,
          duration: `${15 + idx * 5} Menit`,
          status: idx < 2 ? "Selesai" : "Belum Selesai",
          isCompleted: idx < 2,
          konten:
            m.konten_markdown ||
            `### ${m.judul}\n\nMemahami materi secara mendalam dengan rumus KaTeX:\n\n$$ax^2 + bx + c = 0$$`,
        }))
      : defaultModules;

  return (
    <main className="min-h-screen bg-mesh-gradient text-slate-900 pb-16">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 saas-nav shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0F172A] hover:text-blue-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Progress Bab: 25% Selesai</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 space-y-6">
        {/* ========================================================= */}
        {/* VIEW 1: DAFTAR MATERI BAB (image_71bbc4.png Style) */}
        {/* ========================================================= */}
        {!selectedMateriId ? (
          <div className="space-y-6">
            {/* Header Hero Card */}
            <div className="saas-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white">
              <div className="space-y-2 max-w-2xl">
                <span className="inline-block text-xs font-extrabold text-[#0F172A] bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">
                  Matematika Kelas X • Bab {urutanBab || 2}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  {judulBab || "Bab 2: Persamaan & Fungsi Kuadrat"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {deskripsiBab ||
                    "Pelajari konsep dasar persamaan kuadrat, pemfaktoran, kuadrat sempurna, serta formula ABC dan diskriminan."}
                </p>
              </div>

              {/* Progress Gauge 25% */}
              <div className="saas-card p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4 shrink-0 bg-slate-50">
                <div className="relative w-16 h-16 flex items-center justify-center">
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
                      strokeDasharray="25, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-[#0F172A]">
                    25%
                  </span>
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[#0F172A]">
                    25% Selesai
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    1 dari 4 Modul Tuntas
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Module Step-by-Step List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#0F172A] flex items-center gap-2">
                  <List className="w-5 h-5 text-indigo-500" />
                  <span>Modul Pembelajaran Bab Ini</span>
                </h2>
                <span className="text-xs text-slate-500 font-semibold">
                  {displayModules.length + 1} Sesi Terjadwal
                </span>
              </div>

              <div className="space-y-3">
                {displayModules.map((mod, idx) => (
                  <div
                    key={mod.id}
                    className="glass-card glass-card-hover rounded-2xl p-5 border border-white/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs ${
                          mod.isCompleted
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-[#0F172A] text-white"
                        }`}
                      >
                        {mod.isCompleted ? (
                          <Check className="w-5 h-5 stroke-[3]" />
                        ) : (
                          idx + 1
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-[#0F172A]">
                            {mod.judul}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              mod.isCompleted
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {mod.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {mod.duration}
                          </span>
                          <span>• Teks & Formula KaTeX</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedMateriId(mod.id)}
                      className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-xs shrink-0"
                    >
                      <PlayCircle className="w-4 h-4 text-amber-400" />
                      <span>Mulai Belajar</span>
                    </button>
                  </div>
                ))}

                {/* Final Step: In-Class Topic Quiz (Evaluasi Bab: 10 Soal, Tanpa Waktu) */}
                <div className="glass-card rounded-2xl p-5 border-2 border-amber-200 bg-amber-50/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-[#0F172A]">
                          2.4 Evaluasi Akhir / Asesmen Bab
                        </h3>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          Kuis In-Class
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="font-bold text-amber-700">
                          10 Soal • Tanpa Waktu (Bebas Stres)
                        </span>
                        <span>• Bonus +100 Poin</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/quiz/sesi-demo?mode=inclass&babId=${babId}`}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Mulai Asesmen Bab</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: DETAIL MATERI SOCRATIC READING (image_71b8f5.png) */
          /* ========================================================= */
          <div className="space-y-6">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                <button
                  onClick={() => setSelectedMateriId(null)}
                  className="hover:text-[#0F172A] underline cursor-pointer"
                >
                  Daftar Modul Bab
                </button>
                <span>/</span>
                <span className="text-[#0F172A] font-bold">
                  {selectedMateri?.judul || "2.3 Formula ABC & Diskriminan"}
                </span>
              </div>

              <button
                onClick={() => setSelectedMateriId(null)}
                className="text-xs font-bold text-slate-600 hover:text-[#0F172A] bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                Kembali ke Daftar Modul
              </button>
            </div>

            {/* Main Reading Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Markdown Reading Content (8 cols) */}
              <div className="lg:col-span-8 glass-card rounded-3xl p-6 sm:p-8 border border-white/90 shadow-lg space-y-6">
                <div className="border-b border-slate-200/80 pb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#0F172A] bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md">
                      Modul Pembelajaran
                    </span>
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Estimasi: 25 Menit
                    </span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-[#0F172A]">
                    {selectedMateri?.judul || "2.3 Formula ABC & Diskriminan"}
                  </h1>
                </div>

                {/* Formatted Markdown & KaTeX Equations */}
                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm">
                  <MarkdownRenderer
                    content={
                      selectedMateri?.konten ||
                      `### Rumus Kuadratik (Formula ABC)\n\nJika persamaan kuadrat $ax^2 + bx + c = 0$ tidak dapat difaktorkan secara langsung, gunakan Rumus ABC:\n\n$$x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\n### Nilai Diskriminan ($D$)\nNilai $D = b^2 - 4ac$ menentukan jenis akar-akar:\n- **$D > 0$**: Memiliki 2 akar real berbeda.\n- **$D = 0$**: Memiliki 2 akar real kembar.\n- **$D < 0$**: Memiliki akar imajiner.`
                    }
                  />
                </div>

                {/* Bottom Action: Evaluasi Akhir / Asesmen Bab */}
                <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 font-medium">
                    Selesai membaca? Lanjutkan ke Asesmen Bab 10 Soal (Tanpa Waktu).
                  </div>
                  <Link
                    href={`/quiz/sesi-demo?mode=inclass&babId=${babId}`}
                    className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Evaluasi Akhir / Asesmen Bab</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Floating Outline & Socratic AI Tutor (4 cols) */}
              <div className="lg:col-span-4 space-y-6 sticky top-20">
                {/* Floating Module Outline Card */}
                <div className="glass-card rounded-3xl p-5 border border-white/90 shadow-md space-y-3">
                  <div className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                    <List className="w-4 h-4 text-indigo-500" />
                    <span>Isi Modul (Outline)</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                    <a
                      href="#"
                      className="block p-2 rounded-xl bg-slate-100 text-[#0F172A] font-bold"
                    >
                      1. Definisi Formula ABC
                    </a>
                    <a
                      href="#"
                      className="block p-2 rounded-xl hover:bg-slate-50 transition"
                    >
                      2. Menghitung Nilai Diskriminan
                    </a>
                    <a
                      href="#"
                      className="block p-2 rounded-xl hover:bg-slate-50 transition"
                    >
                      3. Contoh Soal & Pembahasan
                    </a>
                  </div>
                </div>

                {/* Socratic THINKSY AI Tutor Chat Widget */}
                <TutorChat
                  materiJudul={selectedMateri?.judul || "2.3 Formula ABC"}
                  materiKonten={selectedMateri?.konten}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

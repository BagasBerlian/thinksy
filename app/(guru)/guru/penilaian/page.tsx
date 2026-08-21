"use client";

import { useState } from "react";
import GuruLayout from "@/components/guru/GuruLayout";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ChevronDown,
  ChevronUp,
  Save,
  Check,
  Award,
  User,
  X,
  Sparkles,
} from "lucide-react";

import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";

export default function PenilaianEsaiPage() {
  const [openStudentId, setOpenStudentId] = useState<string | null>("s1");
  const [scoreRaihan, setScoreRaihan] = useState(85);
  const [isSavedRaihan, setIsSavedRaihan] = useState(false);
  const [isRubrikModalOpen, setIsRubrikModalOpen] = useState(false);

  // Rubrik Parameters State
  const [rubrikKonsep, setRubrikKonsep] = useState(30);
  const [rubrikLangkah, setRubrikLangkah] = useState(30);
  const [rubrikJawaban, setRubrikJawaban] = useState(25);
  const [rubrikStruktur, setRubrikStruktur] = useState(15);
  const [rubrikSavedToast, setRubrikSavedToast] = useState(false);

  const { broadcastEvent } = useRealtimeDashboard();

  const handleSaveScore = (studentId: string) => {
    if (studentId === "s1") {
      setIsSavedRaihan(true);
      broadcastEvent("ESSAY_GRADED", { studentId: "s1", score: scoreRaihan });
    }
  };

  const handleSaveRubrik = (e: React.FormEvent) => {
    e.preventDefault();
    setRubrikSavedToast(true);
    setTimeout(() => {
      setRubrikSavedToast(false);
      setIsRubrikModalOpen(false);
    }, 1500);
  };

  const submissions = [
    {
      id: "s1",
      name: "Ahmad Raihan",
      initials: "AR",
      class: "Matematika – Kelas 8A",
      confidence: 42,
      confidenceType: "rendah",
      aiScore: 85,
      soal: "Jelaskan langkah-langkah memfaktorkan persamaan kuadrat $2x^2 + 5x - 3 = 0$ dan tentukan nilai akar-akarnya.",
      jawaban:
        "Langkah pertama kalikan $a$ dan $c$ yaitu $2 \\times (-3) = -6$. Cari dua angka yang jika dikali hasilnya $-6$ dan dijumlahkan $5$, yaitu $6$ dan $-1$. Ubah $5x$ menjadi $6x - 1x$.\n\nMaka $2x^2 + 6x - 1x - 3 = 0 \\implies 2x(x + 3) - 1(x + 3) = (2x - 1)(x + 3) = 0$.\n\nJadi $x = 1/2$ atau $x = -3$.",
      rubrik: [
        { item: "Pemahaman Konsep", score: `${rubrikKonsep}/${rubrikKonsep}` },
        { item: "Ketepatan Langkah Matematika", score: `${rubrikLangkah}/${rubrikLangkah}` },
        { item: "Kebenaran Jawaban Akhir", score: `${rubrikJawaban}/${rubrikJawaban}` },
        { item: "Kejelasan Struktur Penjelasan", score: `0/${rubrikStruktur} (Bahasa informal)` },
      ],
    },
    {
      id: "s2",
      name: "Siti Putri",
      initials: "SP",
      class: "Matematika – Kelas 8A",
      confidence: 92,
      confidenceType: "tinggi",
      aiScore: 95,
      soal: "Tentukan himpunan penyelesaian dari sistem persamaan $x + y = 5$ dan $2x - y = 4$.",
      jawaban:
        "Dengan metode eliminasi, tambahkan kedua persamaan:\n$(x + y) + (2x - y) = 5 + 4 \\implies 3x = 9 \\implies x = 3$.\nSubstitusi $x = 3$ ke $x + y = 5 \\implies 3 + y = 5 \\implies y = 2$.\nHimpunan penyelesaian $HP = \\{(3, 2)\\}$.",
      rubrik: [
        { item: "Pemahaman Konsep", score: `${rubrikKonsep}/${rubrikKonsep}` },
        { item: "Ketepatan Langkah Matematika", score: `${rubrikLangkah}/${rubrikLangkah}` },
        { item: "Kebenaran Jawaban Akhir", score: `${rubrikJawaban}/${rubrikJawaban}` },
        { item: "Kejelasan Struktur Penjelasan", score: `10/${rubrikStruktur}` },
      ],
    },
  ];

  return (
    <GuruLayout>
      <div className="space-y-6">
        {/* 1. HEADER TITLE */}
        <div className="space-y-1">
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-[#0F172A]" />
            <span>PENILAIAN MANUAL</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Penilaian Esai Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-3xl">
            Tinjau dan validasi jawaban esai yang memerlukan penilaian manual atau konfirmasi guru. AI telah memberikan penilaian awal berdasarkan rubrik yang disepakati.
          </p>
        </div>

        {/* 2. STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Butuh Tinjauan */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                BUTUH TINJAUAN
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#0F172A]">12</span>
                <span className="text-xs text-slate-500 font-bold">tugas</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Selesai Dinilai */}
          <div className="bg-[#0F172A] p-6 rounded-3xl border border-slate-800 shadow-xs flex items-center justify-between text-white">
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                SELESAI DINILAI
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">45</span>
                <span className="text-xs text-slate-400 font-bold">tugas (minggu ini)</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Rubrik AI Button (SEKARANG BISA DIKLIK & INTEGRASI) */}
          <button
            onClick={() => setIsRubrikModalOpen(true)}
            className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-amber-400 shadow-xs flex items-center justify-between transition text-left cursor-pointer group"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-[#0F172A] group-hover:text-amber-600 transition flex items-center gap-1.5">
                Sesuai Rubrik AI
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Klik untuk ubah parameter penilaian
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Sliders className="w-6 h-6" />
            </div>
          </button>
        </div>

        {/* 3. QUEUE LIST */}
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-extrabold text-[#0F172A]">
            Daftar Antrean Penilaian
          </h2>

          <div className="space-y-3">
            {submissions.map((sub) => {
              const isOpen = openStudentId === sub.id;
              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs transition"
                >
                  {/* Card Bar */}
                  <div
                    onClick={() => setOpenStudentId(isOpen ? null : sub.id)}
                    className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                        {sub.initials}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#0F172A]">
                          {sub.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {sub.class}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {sub.confidenceType === "rendah" ? (
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>AI Confidence: Rendah ({sub.confidence}%)</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0F172A]/10 text-[#0F172A] border border-[#0F172A]/20 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>AI Confidence: Tinggi ({sub.confidence}%)</span>
                        </div>
                      )}

                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expandable Review Details */}
                  {isOpen && (
                    <div className="p-6 border-t border-slate-200 bg-slate-50/50 space-y-5">
                      {/* Pertanyaan & Jawaban */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                            PERTANYAAN ESAI:
                          </span>
                          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 font-semibold">
                            <MarkdownRenderer content={sub.soal} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                            JAWABAN SISWA:
                          </span>
                          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 leading-relaxed font-mono">
                            <MarkdownRenderer content={sub.jawaban} />
                          </div>
                        </div>
                      </div>

                      {/* Rubrik Breakdown & Score Override */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-3">
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                            EVALUASI RUBRIK AI:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {sub.rubrik.map((r, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                              >
                                <span className="font-semibold text-slate-700">{r.item}</span>
                                <span className="font-extrabold text-[#0F172A]">{r.score}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Override Input Box */}
                        <div className="w-full md:w-64 space-y-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                          <div className="space-y-2">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                              SKOR FINAL GURU:
                            </span>
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={sub.id === "s1" ? scoreRaihan : sub.aiScore}
                                onChange={(e) =>
                                  sub.id === "s1" && setScoreRaihan(Number(e.target.value))
                                }
                                className="w-20 px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 text-base font-extrabold text-[#0F172A] text-center focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                              />
                              <span className="text-xs font-bold text-slate-400">/ 100</span>
                            </div>
                          </div>

                          {isSavedRaihan && sub.id === "s1" ? (
                            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-extrabold text-center flex items-center justify-center gap-1.5">
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span>Nilai Tersimpan!</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSaveScore(sub.id)}
                              className="w-full py-3 px-4 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                            >
                              <Save className="w-4 h-4 text-amber-400" />
                              <span>Simpan & Setujui Nilai</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL PARAMETER RUBRIK PENILAIAN AI */}
      {isRubrikModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#0F172A] text-base">Atur Parameter Rubrik Penilaian AI</h2>
                  <p className="text-xs text-slate-500 font-medium">Tentukan bobot poin penilaian esai otomatis</p>
                </div>
              </div>
              <button onClick={() => setIsRubrikModalOpen(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRubrik} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  1. Pemahaman Konsep (Maks Poin)
                </label>
                <input
                  type="number"
                  value={rubrikKonsep}
                  onChange={(e) => setRubrikKonsep(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  2. Ketepatan Langkah Matematika (Maks Poin)
                </label>
                <input
                  type="number"
                  value={rubrikLangkah}
                  onChange={(e) => setRubrikLangkah(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  3. Kebenaran Jawaban Akhir (Maks Poin)
                </label>
                <input
                  type="number"
                  value={rubrikJawaban}
                  onChange={(e) => setRubrikJawaban(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  4. Kejelasan Struktur Penjelasan (Maks Poin)
                </label>
                <input
                  type="number"
                  value={rubrikStruktur}
                  onChange={(e) => setRubrikStruktur(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A]"
                />
              </div>

              {rubrikSavedToast && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Bobot rubrik AI berhasil diperbarui!</span>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRubrikModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-extrabold flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Simpan Rubrik</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}

"use client";

import { useState } from "react";
import GuruLayout from "@/components/guru/GuruLayout";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";
import {
  Bot,
  Search,
  Sparkles,
  CheckCircle2,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowRight,
  Check,
} from "lucide-react";

import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";

export default function ReviewSoalEksplorasiPage() {
  const [filterBab, setFilterBab] = useState("Semua Bab");
  const [sortBy, setSortBy] = useState<"terbaru" | "kesulitan">("terbaru");
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [questionStatus, setQuestionStatus] = useState<"pending" | "published" | "rejected">("pending");
  const { broadcastEvent } = useRealtimeDashboard();

  const handlePublish = () => {
    setQuestionStatus("published");
    broadcastEvent("SOAL_PUBLISHED", { id: "EXP-AR02" });
  };


  const questionData = {
    id: "EXP-AR02",
    bab: "ALJEBAR",
    kesulitan: "Sulit",
    pertanyaan:
      "Diketahui persamaan kuadrat $2x^2 - px + (p - 1) = 0$ memiliki akar-akar $\\alpha$ dan $\\beta$. Jika diketahui bahwa $\\alpha^2 + \\beta^2 = 4$, maka tentukan nilai $p$ yang memenuhi persamaan tersebut!",
    opsi: [
      { id: "A", teks: "$p = 2$ atau $p = -6$", benar: false },
      { id: "B", teks: "$p = -2$ atau $p = 6$", benar: true },
      { id: "C", teks: "$p = 4$ atau $p = -3$", benar: false },
      { id: "D", teks: "$p = -4$ atau $p = 3$", benar: false },
    ],
    pembahasan: `**Langkah-demi-Langkah Solusi Matematika:**

1. **Gunakan Rumus Vieta:**
   - Jumlah akar: $\\alpha + \\beta = -\\frac{b}{a} = \\frac{p}{2}$
   - Hasil kali akar: $\\alpha \\cdot \\beta = \\frac{c}{a} = \\frac{p - 1}{2}$

2. **Substitusi ke Identitas Kuadrat:**
   $$\\alpha^2 + \\beta^2 = (\\alpha + \\beta)^2 - 2\\alpha\\beta = 4$$

3. **Substitusi Nilai Dari Vieta:**
   $$\\left(\\frac{p}{2}\\right)^2 - 2\\left(\\frac{p - 1}{2}\\right) = 4$$
   $$\\frac{p^2}{4} - (p - 1) = 4$$
   $$\\frac{p^2}{4} - p + 1 = 4 \\implies \\frac{p^2}{4} - p - 3 = 0$$

4. **Kalikan Seluruh Ruas dengan 4:**
   $$p^2 - 4p - 12 = 0$$
   $$(p - 6)(p + 2) = 0$$
   
5. **Akar-akar Nilai $p$:**
   $$p = 6 \\quad \\text{atau} \\quad p = -2$$`,
    confidence: 75,
    timestamp: "24 Okt 2023, 14:30 WIB",
  };

  return (
    <GuruLayout>
      <div className="space-y-6">
        {/* 1. HEADER BANNER */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 text-amber-600" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                Antrean Review Soal Eksplorasi
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Soal-soal berikut dihasilkan oleh AI dan memerlukan validasi Anda. Tinjau akurasi matematis, kunci jawaban, dan kejelasan pembahasan sebelum menerbitkannya ke Bank Soal.
            </p>
          </div>

          {/* Metric Counters */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
            <div className="text-center px-2">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                MENUNGGU
              </div>
              <div className="text-xl font-extrabold text-[#0F172A]">12</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                DITERBITKAN
              </div>
              <div className="text-xl font-extrabold text-emerald-600">45</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                DITOLAK
              </div>
              <div className="text-xl font-extrabold text-red-500">3</div>
            </div>
          </div>
        </div>

        {/* 2. SEARCH & FILTER CONTROLS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari isi soal atau ID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
              />
            </div>

            <select
              value={filterBab}
              onChange={(e) => setFilterBab(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="Semua Bab">Semua Bab</option>
              <option value="Aljabar">Aljabar</option>
              <option value="Geometri">Geometri</option>
              <option value="Kalkulus">Kalkulus</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-extrabold text-slate-500">Urutkan:</span>
            <button
              onClick={() => setSortBy("terbaru")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                sortBy === "terbaru"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Terbaru
            </button>
            <button
              onClick={() => setSortBy("kesulitan")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                sortBy === "kesulitan"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Tingkat Kesulitan
            </button>
          </div>
        </div>

        {/* 3. AI QUESTION CARD FOR REVIEW */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Question Content & Options (8 cols) */}
            <div className="flex-1 space-y-5">
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-wider">
                  {questionData.bab}
                </span>
                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  ID: {questionData.id}
                </span>
                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  ● {questionData.kesulitan}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full bg-[#0F172A]/10 text-[#0F172A] border border-[#0F172A]/20">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>AI GENERATED</span>
                </span>
              </div>

              {/* Question Text with KaTeX */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-900">
                <MarkdownRenderer content={questionData.pertanyaan} />
              </div>

              {/* Multiple Choice Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {questionData.opsi.map((option) => (
                  <div
                    key={option.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold relative ${
                      option.benar
                        ? "border-[#0F172A] bg-slate-100/90 text-[#0F172A] shadow-xs font-bold"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                          option.benar
                            ? "bg-[#0F172A] text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {option.id}.
                      </span>
                      <MarkdownRenderer content={option.teks} />
                    </div>

                    {option.benar && (
                      <span className="text-[9px] bg-[#0F172A] text-amber-400 font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                        <Check className="w-3 h-3 stroke-[3]" /> KUNCI JAWABAN
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Pembahasan Accordion Dropdown */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setIsExplanationOpen(!isExplanationOpen)}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-xs font-extrabold text-[#0F172A] transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Pembahasan Langkah-demi-Langkah</span>
                  </span>
                  {isExplanationOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {isExplanationOpen && (
                  <div className="p-5 bg-white border-t border-slate-200 text-xs text-slate-800">
                    <MarkdownRenderer content={questionData.pembahasan} />
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions Column (4 cols) */}
            <div className="w-full lg:w-64 space-y-4 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-6 flex flex-col justify-between">
              <div className="space-y-2.5">
                {questionStatus === "published" ? (
                  <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-extrabold text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Soal Berhasil Diterbitkan!</span>
                  </div>
                ) : questionStatus === "rejected" ? (
                  <div className="p-3 rounded-2xl bg-red-100 text-red-900 border border-red-300 text-xs font-extrabold text-center">
                    Soal Ditolak & Diarsip
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handlePublish}
                      className="w-full py-3 px-4 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Terbitkan</span>
                    </button>

                    <button className="w-full py-3 px-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer">
                      <Edit3 className="w-4 h-4 text-slate-600" />
                      <span>Edit & Revisi</span>
                    </button>

                    <button
                      onClick={() => setQuestionStatus("rejected")}
                      className="w-full py-2.5 px-4 rounded-2xl text-red-600 hover:bg-red-50 text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span>Tolak / Arsip</span>
                    </button>
                  </>
                )}
              </div>

              {/* AI Confidence Gauge */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-extrabold">
                  <span className="text-slate-500">75% Konfidensi AI</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-[#0F172A] rounded-full"
                    style={{ width: `${questionData.confidence}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-medium text-center pt-1">
                  Dihasilkan pada {questionData.timestamp}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. LOAD MORE BUTTON */}
        <div className="text-center pt-2">
          <button className="px-6 py-2.5 rounded-2xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-extrabold inline-flex items-center gap-2 transition shadow-xs cursor-pointer">
            <span>Muat Lebih Banyak</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </GuruLayout>
  );
}

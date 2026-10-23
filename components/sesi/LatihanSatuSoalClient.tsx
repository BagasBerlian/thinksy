"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bot,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
  Award,
  Sun,
  Moon,
  Lightbulb,
} from "lucide-react";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";
import TutorStreamPanel from "./TutorStreamPanel";

export interface QuestionItem {
  id: string;
  pertanyaan: string;
  tipeSoal: "pilihan_ganda" | "isian_singkat" | "esai";
  poin?: number;
  petunjuk?: string;
  opsiSoal?: Array<{ id: string; label: string; teksOpsi: string }>;
}

interface LatihanSatuSoalClientProps {
  sesiId: string;
  judulBab: string;
  soalList: QuestionItem[];
}

interface FeedbackState {
  isBenar: boolean;
  pembahasan: string;
  alasanSalah?: string | null;
  kunciJawaban?: string | null;
  correctOpsiId?: string | null;
  correctOpsiLabel?: string | null;
  correctOpsiTeks?: string | null;
  jawabanSiswaId?: string | null;
  jawabanSiswaTeks?: string | null;
}

export default function LatihanSatuSoalClient({
  sesiId,
  judulBab,
  soalList,
}: LatihanSatuSoalClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOpsiId, setSelectedOpsiId] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [checking, setChecking] = useState(false);
  const [isTutorOpen, setIsTutorOpen] = useState(false);

  // Gemini Dark Mode toggle (default true sesuai screenshot Gemini yang dikirim user)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // State buka/tutup petunjuk per soal
  const [openPetunjuk, setOpenPetunjuk] = useState<Record<string, boolean>>({});

  // Status per soal: { [soalId]: FeedbackState }
  const [feedbacks, setFeedbacks] = useState<Record<string, FeedbackState>>({});
  // Counter berapa kali salah per soal untuk aturan 3x salah Sokratik
  const [salahCounters, setSalahCounters] = useState<Record<string, number>>({});

  const currentQ = soalList[currentIndex];
  const currentFeedback = currentQ ? feedbacks[currentQ.id] : null;
  const currentSalahCount = currentQ ? salahCounters[currentQ.id] || 0 : 0;
  const isPetunjukOpen = currentQ ? Boolean(openPetunjuk[currentQ.id]) : false;

  const totalTerjawab = Object.keys(feedbacks).length;
  const totalBenar = Object.values(feedbacks).filter((f) => f.isBenar).length;

  const togglePetunjuk = () => {
    if (!currentQ) return;
    setOpenPetunjuk((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handlePilihOpsi = (opsiId: string) => {
    if (currentFeedback?.isBenar) return; // Kunci jika sudah dijawab benar
    setSelectedOpsiId(opsiId);
  };

  const handleCekJawaban = async () => {
    if (!currentQ || checking) return;

    if (currentQ.tipeSoal === "pilihan_ganda" && !selectedOpsiId) {
      alert("Silakan pilih salah satu opsi terlebih dahulu!");
      return;
    }
    if (
      (currentQ.tipeSoal === "isian_singkat" || currentQ.tipeSoal === "esai") &&
      !inputText.trim()
    ) {
      alert("Silakan ketikkan jawaban kamu terlebih dahulu!");
      return;
    }

    setChecking(true);
    try {
      const res = await fetch("/api/sesi/jawab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sesiId,
          soalId: currentQ.id,
          opsiId: currentQ.tipeSoal === "pilihan_ganda" ? selectedOpsiId : undefined,
          jawabanTeks:
            currentQ.tipeSoal !== "pilihan_ganda"
              ? inputText
              : currentQ.opsiSoal?.find((o) => o.id === selectedOpsiId)?.teksOpsi,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memeriksa jawaban.");

      setFeedbacks((prev) => ({
        ...prev,
        [currentQ.id]: {
          isBenar: Boolean(data.isBenar),
          pembahasan: data.pembahasan || "",
          alasanSalah: data.alasanSalah,
          kunciJawaban: data.kunciJawaban,
          correctOpsiId: data.correctOpsiId,
          correctOpsiLabel: data.correctOpsiLabel,
          correctOpsiTeks: data.correctOpsiTeks,
          jawabanSiswaId: selectedOpsiId,
          jawabanSiswaTeks: inputText,
        },
      }));

      if (!data.isBenar) {
        setSalahCounters((prev) => ({
          ...prev,
          [currentQ.id]: (prev[currentQ.id] || 0) + 1,
        }));
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat memeriksa jawaban.");
    } finally {
      setChecking(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < soalList.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextQ = soalList[nextIdx];
      const existingFb = nextQ ? feedbacks[nextQ.id] : null;
      setSelectedOpsiId(existingFb?.jawabanSiswaId || "");
      setInputText(existingFb?.jawabanSiswaTeks || "");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevQ = soalList[prevIdx];
      const existingFb = prevQ ? feedbacks[prevQ.id] : null;
      setSelectedOpsiId(existingFb?.jawabanSiswaId || "");
      setInputText(existingFb?.jawabanSiswaTeks || "");
    }
  };

  const handlePilihNomor = (idx: number) => {
    setCurrentIndex(idx);
    const targetQ = soalList[idx];
    const existingFb = targetQ ? feedbacks[targetQ.id] : null;
    setSelectedOpsiId(existingFb?.jawabanSiswaId || "");
    setInputText(existingFb?.jawabanSiswaTeks || "");
  };

  const handleResetCobaLagi = () => {
    if (!currentQ) return;
    setFeedbacks((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
    setSelectedOpsiId("");
    setInputText("");
  };

  // Styling token tema Gemini
  const theme = isDarkMode
    ? {
        bg: "bg-[#131314] text-[#e3e3e3]",
        headerBg: "bg-[#131314]/90 border-[#303134]",
        cardBg: "bg-[#1e1f20] border-[#303134]",
        cardBorder: "border-[#303134]",
        textPrimary: "text-[#e3e3e3]",
        textSecondary: "text-[#c4c7c5]",
        textMuted: "text-[#8e918f]",
        optionDefault:
          "bg-[#1e1f20] hover:bg-[#282a2c] text-[#e3e3e3] border-[#303134]",
        optionSelected:
          "bg-[#282a2c] text-white border-blue-400/80 shadow-md",
        optionCorrect:
          "bg-[#1b2b20] border-emerald-500 text-[#e3e3e3]",
        optionIncorrect:
          "bg-[#2b1b1f] border-rose-500 text-[#e3e3e3]",
        badgeCorrect: "bg-[#c4eed0] text-[#072711]",
        badgeIncorrect: "bg-[#f9dedc] text-[#410e0b]",
        petunjukBox: "bg-[#1a1c1e] border-[#303134] text-[#c4c7c5]",
        footerBg: "bg-[#131314] border-[#303134]",
      }
    : {
        bg: "bg-slate-50 text-slate-900",
        headerBg: "bg-white/90 border-slate-200",
        cardBg: "bg-white border-slate-200/90",
        cardBorder: "border-slate-200",
        textPrimary: "text-slate-900",
        textSecondary: "text-slate-700",
        textMuted: "text-slate-500",
        optionDefault:
          "bg-white hover:bg-slate-50 text-slate-800 border-slate-200",
        optionSelected:
          "bg-blue-50 text-blue-900 border-blue-500 shadow-xs",
        optionCorrect:
          "bg-emerald-50/80 border-emerald-500 text-slate-900",
        optionIncorrect:
          "bg-rose-50/80 border-rose-500 text-slate-900",
        badgeCorrect: "bg-emerald-100 text-emerald-800",
        badgeIncorrect: "bg-rose-100 text-rose-800",
        petunjukBox: "bg-amber-50/60 border-amber-200 text-slate-700",
        footerBg: "bg-white border-slate-200",
      };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col justify-between font-sans transition-colors duration-200`}>
      {/* Top Header: Gemini Clean Bar */}
      <header className={`border-b px-4 py-3 sticky top-0 z-30 backdrop-blur-md ${theme.headerBg}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/?tab=matematika"
            className={`flex items-center gap-2 ${theme.textSecondary} hover:${theme.textPrimary} font-medium text-xs sm:text-sm transition`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke Matematika</span>
          </Link>

          {/* Central Progress Info */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${theme.textMuted}`}>
                Latihan Interaktif
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {totalTerjawab} dari {soalList.length} terjawab
              </span>
            </div>
            <h1 className={`text-xs sm:text-sm font-bold ${theme.textPrimary} line-clamp-1 max-w-[200px] sm:max-w-md`}>
              {judulBab}
            </h1>
          </div>

          {/* Right Action Icons: Dark Mode & Tutor AI */}
          <div className="flex items-center gap-2">


            <button
              onClick={() => setIsTutorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold text-xs transition cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">Tutor AI</span>
              {currentSalahCount >= 3 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Question Numbers Navigation Strip */}
        <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {soalList.map((q, idx) => {
            const fb = feedbacks[q.id];
            const isActive = idx === currentIndex;
            let badgeStyle = isDarkMode
              ? "bg-[#1e1f20] text-[#c4c7c5] border-[#303134]"
              : "bg-white text-slate-700 border-slate-200";

            if (fb?.isBenar) {
              badgeStyle = "bg-emerald-600 text-white border-emerald-500 font-bold";
            } else if (fb && !fb.isBenar) {
              badgeStyle = "bg-rose-600 text-white border-rose-500 font-bold";
            } else if (isActive) {
              badgeStyle = isDarkMode
                ? "bg-white text-black font-extrabold border-white ring-2 ring-blue-400/50"
                : "bg-slate-900 text-white font-extrabold border-slate-900 ring-2 ring-blue-400/50";
            }

            return (
              <button
                key={q.id}
                onClick={() => handlePilihNomor(idx)}
                className={`min-w-8 h-8 rounded-xl text-xs border flex items-center justify-center transition cursor-pointer shrink-0 ${badgeStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Single Question Screen (Gemini Style) */}
      <main className="max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 flex-1 flex flex-col justify-start">
        {currentQ ? (
          <div className="space-y-6">
            {/* Question Label (e.g. "Pertanyaan 6") */}
            <div>
              <p className={`text-sm font-semibold tracking-wide ${theme.textMuted}`}>
                Pertanyaan {currentIndex + 1}
              </p>
            </div>

            {/* Question Body with KaTeX / Markdown */}
            <div className={`text-base sm:text-lg ${theme.textPrimary} font-normal leading-relaxed`}>
              <MarkdownRenderer content={currentQ.pertanyaan} />
            </div>

            {/* Multiple Choice Options (A, B, C, D) */}
            {currentQ.tipeSoal === "pilihan_ganda" && currentQ.opsiSoal && (
              <div className="space-y-3 pt-1">
                {currentQ.opsiSoal.map((opt) => {
                  const isChosen = selectedOpsiId === opt.id;
                  const isAnswered = Boolean(currentFeedback);
                  const isThisOptionCorrect =
                    Boolean(currentFeedback?.correctOpsiId === opt.id) ||
                    Boolean(currentFeedback?.isBenar && isChosen);
                  const isThisOptionChosenAndWrong =
                    Boolean(isAnswered && isChosen && !currentFeedback?.isBenar);

                  // Card border & background states
                  let cardClass = theme.optionDefault;
                  if (isAnswered) {
                    if (isThisOptionCorrect) {
                      cardClass = theme.optionCorrect;
                    } else if (isThisOptionChosenAndWrong) {
                      cardClass = theme.optionIncorrect;
                    } else {
                      cardClass = isDarkMode
                        ? "bg-[#1e1f20]/50 opacity-60 border-[#303134]"
                        : "bg-slate-100/70 opacity-60 border-slate-200";
                    }
                  } else if (isChosen) {
                    cardClass = theme.optionSelected;
                  }

                  return (
                    <div
                      key={opt.id}
                      onClick={() => !isAnswered && handlePilihOpsi(opt.id)}
                      className={`w-full rounded-2xl border p-4 sm:p-5 transition-all text-left ${cardClass} ${
                        !isAnswered ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      {/* Top row: Option Label + Text + Badges */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 flex-1">
                          <span className="font-bold text-sm sm:text-base shrink-0">
                            {opt.label}.
                          </span>
                          <div className="text-sm sm:text-base font-normal flex-1">
                            <MarkdownRenderer content={opt.teksOpsi} />
                          </div>

                          {/* Tag (Jawaban Anda) */}
                          {isAnswered && isChosen && (
                            <span className={`text-xs font-semibold shrink-0 ml-1 ${theme.textMuted}`}>
                              (Jawaban Anda)
                            </span>
                          )}
                        </div>

                        {/* Right Pill Badges */}
                        {isAnswered && isThisOptionCorrect && (
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 ${theme.badgeCorrect}`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Jawaban yang benar</span>
                          </div>
                        )}

                        {isAnswered && isThisOptionChosenAndWrong && (
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 ${theme.badgeIncorrect}`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Jawaban salah</span>
                          </div>
                        )}
                      </div>

                      {/* Gemini-Style Explanation directly inside the option */}
                      {isAnswered && isThisOptionCorrect && currentFeedback?.pembahasan && (
                        <div
                          className={`mt-3 pt-3 border-t text-xs sm:text-sm leading-relaxed ${
                            isDarkMode
                              ? "border-[#303134] text-[#c4c7c5]"
                              : "border-emerald-200 text-slate-800"
                          }`}
                        >
                          <MarkdownRenderer content={currentFeedback.pembahasan} />
                        </div>
                      )}

                      {/* Explanation for wrong answer (Distractor misconception analysis) */}
                      {isAnswered &&
                        isThisOptionChosenAndWrong &&
                        currentFeedback?.alasanSalah && (
                          <div
                            className={`mt-3 pt-3 border-t text-xs sm:text-sm leading-relaxed ${
                              isDarkMode
                                ? "border-[#303134] text-rose-300"
                                : "border-rose-200 text-rose-800"
                            }`}
                          >
                            <p>{currentFeedback.alasanSalah}</p>
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Isian Singkat UI */}
            {currentQ.tipeSoal === "isian_singkat" && (
              <div className={`p-5 rounded-2xl border ${theme.cardBg} space-y-3`}>
                <label className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>
                  Ketik Jawaban Singkat Kamu:
                </label>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={Boolean(currentFeedback?.isBenar)}
                  placeholder="Ketikkan nilai atau rumus jawaban..."
                  className={`w-full p-4 rounded-xl border text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? "bg-[#131314] border-[#303134] text-white"
                      : "bg-white border-slate-200 text-slate-900"
                  }`}
                />

                {currentFeedback && (
                  <div
                    className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed mt-2 ${
                      currentFeedback.isBenar
                        ? isDarkMode
                          ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : isDarkMode
                        ? "bg-rose-950/40 text-rose-300 border border-rose-800"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    <p className="font-bold mb-1">
                      {currentFeedback.isBenar ? "✓ Jawaban Tepat!" : "✗ Belum Tepat"}
                    </p>
                    <MarkdownRenderer content={currentFeedback.pembahasan} />
                  </div>
                )}
              </div>
            )}

            {/* Esai UI */}
            {currentQ.tipeSoal === "esai" && (
              <div className={`p-5 rounded-2xl border ${theme.cardBg} space-y-3`}>
                <label className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>
                  Tuliskan Langkah Penyelesaian:
                </label>
                <textarea
                  rows={5}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={Boolean(currentFeedback?.isBenar)}
                  placeholder="Jelaskan langkah perhitungan dan alasan konsep matematika yang kamu gunakan..."
                  className={`w-full p-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed ${
                    isDarkMode
                      ? "bg-[#131314] border-[#303134] text-white"
                      : "bg-white border-slate-200 text-slate-900"
                  }`}
                />

                {currentFeedback && (
                  <div
                    className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed mt-2 ${
                      isDarkMode
                        ? "bg-[#1a1c1e] text-[#c4c7c5] border border-[#303134]"
                        : "bg-slate-100 text-slate-800 border border-slate-200"
                    }`}
                  >
                    <p className="font-bold mb-1">💡 Pembahasan Acuan & Rubrik:</p>
                    <MarkdownRenderer content={currentFeedback.pembahasan} />
                  </div>
                )}
              </div>
            )}

            {/* Collapsible Petunjuk (Hint) matching Gemini Screenshot */}
            <div className="pt-2">
              <button
                onClick={togglePetunjuk}
                className={`flex items-center gap-1.5 text-sm font-semibold transition cursor-pointer ${
                  isDarkMode
                    ? "text-[#c4c7c5] hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Petunjuk</span>
                {isPetunjukOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {isPetunjukOpen && (
                <div
                  className={`mt-2.5 p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed transition-all ${theme.petunjukBox}`}
                >
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {currentQ.petunjuk ||
                          "Tentukan konsep atau rumus dasar yang menghubungkan informasi yang diketahui dengan yang ditanyakan."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Special Notice if user failed 3x on this question (Socratic prompt trigger) */}
            {currentSalahCount >= 3 && !currentFeedback?.isBenar && (
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm ${
                  isDarkMode
                    ? "bg-amber-950/30 border-amber-800 text-amber-200"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <span>
                  💡 Kamu sudah mencoba 3 kali pada nomor ini. Tanya Kakak Tutor untuk petunjuk konsep!
                </span>
                <button
                  onClick={() => setIsTutorOpen(true)}
                  className="ml-3 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold shrink-0 transition"
                >
                  Tanya Tutor
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Finished State */
          <div
            className={`text-center p-10 sm:p-14 rounded-3xl border ${theme.cardBg} space-y-4`}
          >
            <Award className="w-16 h-16 text-emerald-400 mx-auto" />
            <h2 className={`text-xl sm:text-2xl font-bold ${theme.textPrimary}`}>
              Selesai! Latihan Bab Telah Rampung
            </h2>
            <p className={`text-sm ${theme.textSecondary} max-w-md mx-auto`}>
              Kamu telah menjawab {totalTerjawab} dari {soalList.length} soal, dengan total{" "}
              <span className="font-bold text-emerald-400">{totalBenar} benar</span>.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/?tab=matematika"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition"
              >
                Kembali ke Menu Matematika
              </Link>
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setFeedbacks({});
                  setSelectedOpsiId("");
                  setInputText("");
                }}
                className={`w-full sm:w-auto px-6 py-3 rounded-2xl border ${theme.cardBorder} hover:bg-white/5 font-bold text-sm transition`}
              >
                Ulangi Latihan
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Bar (Gemini Thumb Actions) */}
      <footer className={`border-t p-4 sticky bottom-0 z-30 backdrop-blur-md ${theme.footerBg}`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`px-4 py-3 rounded-2xl border ${theme.cardBorder} ${theme.textSecondary} text-sm font-semibold hover:opacity-80 disabled:opacity-20 transition flex items-center gap-1 cursor-pointer`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          {/* Center Action Button */}
          {!currentFeedback ? (
            <button
              onClick={handleCekJawaban}
              disabled={checking}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {checking ? (
                <span>Memeriksa Jawaban...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cek Jawaban</span>
                </>
              )}
            </button>
          ) : !currentFeedback.isBenar ? (
            <div className="flex-1 flex items-center gap-2">
              <button
                onClick={handleResetCobaLagi}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Coba Lagi</span>
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex >= soalList.length - 1}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-30"
              >
                <span>Lanjut</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentIndex >= soalList.length - 1}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30"
            >
              <span>Lanjut ke Soal Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={currentIndex >= soalList.length - 1}
            className={`px-4 py-3 rounded-2xl border ${theme.cardBorder} ${theme.textSecondary} text-sm font-semibold hover:opacity-80 disabled:opacity-20 transition flex items-center gap-1 cursor-pointer`}
          >
            <span className="hidden sm:inline">Berikutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Streaming Socratic AI Tutor Panel */}
      {currentQ && (
        <TutorStreamPanel
          soalId={currentQ.id}
          sesiId={sesiId}
          pertanyaanText={currentQ.pertanyaan}
          jawabanSiswaSaatIni={
            currentQ.tipeSoal === "pilihan_ganda"
              ? currentQ.opsiSoal?.find((o) => o.id === selectedOpsiId)?.teksOpsi
              : inputText
          }
          jumlahSalahLangkah={currentSalahCount}
          isOpen={isTutorOpen}
          onClose={() => setIsTutorOpen(false)}
        />
      )}
    </div>
  );
}

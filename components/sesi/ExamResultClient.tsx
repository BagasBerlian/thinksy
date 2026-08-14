"use client";

import { useState } from "react";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Award,
  Sparkles,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";

interface QuestionReview {
  id: number;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export default function ExamResultClient() {
  const [openQuestionId, setOpenQuestionId] = useState<number | null>(1);

  // Mock Result Data (88/100 Score, 22 Correct, 3 Incorrect)
  const score = 88;
  const totalQuestions = 25;
  const correctCount = 22;
  const incorrectCount = 3;

  const reviews: QuestionReview[] = [
    {
      id: 1,
      questionText: `Diketahui barisan aritmatika $3, 7, 11, 15, \\dots$. Tentukan nilai dari suku ke-10 ($U_{10}$)!`,
      studentAnswer: "39",
      correctAnswer: "39",
      isCorrect: true,
      explanation: `**Langkah Penyelesaian:**\n1. Suku pertama ($a$) = 3\n2. Beda ($b$) = $7 - 3 = 4$\n3. Rumus suku ke-n: $U_n = a + (n - 1)b$\n4. $U_{10} = 3 + (10 - 1) \\times 4 = 3 + 36 = 39$.\n\n**Kesimpulan:** Jawaban Anda **39** adalah BENAR.`,
    },
    {
      id: 2,
      questionText: `Akar-akar persamaan kuadrat $x^2 - 5x + 6 = 0$ adalah $p$ dan $q$. Tentukan nilai dari $p^2 + q^2$!`,
      studentAnswer: "13",
      correctAnswer: "13",
      isCorrect: true,
      explanation: `**Langkah Penyelesaian:**\n1. $p + q = -\\frac{b}{a} = 5$\n2. $p \\cdot q = \\frac{c}{a} = 6$\n3. $p^2 + q^2 = (p + q)^2 - 2pq = 5^2 - 2(6) = 25 - 12 = 13$.\n\n**Kesimpulan:** Jawaban Anda **13** adalah BENAR.`,
    },
    {
      id: 3,
      questionText: `Hitunglah nilai Diskriminan ($D$) dari persamaan kuadrat $2x^2 + 4x - 6 = 0$!`,
      studentAnswer: "32",
      correctAnswer: "64",
      isCorrect: false,
      explanation: `**Langkah Penyelesaian:**\n1. $a = 2, b = 4, c = -6$\n2. Rumus Diskriminan: $D = b^2 - 4ac$\n3. $D = 4^2 - 4(2)(-6) = 16 + 48 = 64$.\n\n**Analisis Kesalahan:** Perhatikan tanda minus pada $c = -6$. Perkalian $-4 \\times 2 \\times (-6)$ menghasilkan nilai positif $+48$.`,
    },
    {
      id: 4,
      questionText: `Selesaikan pemfaktoran dari persamaan kuadrat $x^2 - 9 = 0$!`,
      studentAnswer: "(x - 3)(x + 3) = 0",
      correctAnswer: "(x - 3)(x + 3) = 0",
      isCorrect: true,
      explanation: `**Bentuk Selisih Kuadrat:**\n$$a^2 - b^2 = (a - b)(a + b)$$\nUntuk $x^2 - 9 = (x - 3)(x + 3) = 0$, maka $x = 3$ atau $x = -3$.`,
    },
    {
      id: 5,
      questionText: `Jika fungsi kuadrat $f(x) = x^2 - 4x + 4$, tentukan titik potong dengan sumbu X!`,
      studentAnswer: "(2, 0)",
      correctAnswer: "(2, 0)",
      isCorrect: true,
      explanation: `**Titik Potong Sumbu X:**\n$y = 0 \\implies x^2 - 4x + 4 = 0 \\implies (x - 2)^2 = 0 \\implies x = 2$.\nSehingga titik potongnya adalah $(2, 0)$.`,
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 saas-nav border-b border-slate-200 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-[#0F172A] flex items-center justify-center font-bold text-white shadow-xs border border-slate-700">
              <BrainCircuit className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-extrabold text-[#0F172A] block text-base tracking-tight">
                Hasil Asesmen - Skor Akhir
              </span>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                THINKSY Evaluation System
              </span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold transition duration-200 cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-8 space-y-8">
        {/* ========================================================= */}
        {/* SCORE GAUGE & SUMMARY BANNER (`image_71b4df.png` Style) */}
        {/* ========================================================= */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/90 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-3 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hasil Asesmen Tuntas!</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Selamat! Kamu Mencapai Skor {score}! 🎉
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Kamu berhasil menyelesaikan 25 soal dengan baik. Tinjau kembali rincian jawaban & pembahasan di bawah untuk memperdalam pemahamanmu.
            </p>

            {/* Reward Points Earned */}
            <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-xs">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>+150 Poin Diberikan</span>
              </div>
            </div>
          </div>

          {/* Large Score Ring Gauge Gauge */}
          <div className="flex flex-col items-center justify-center shrink-0 space-y-3">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${score}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-[#0F172A]">
                  {score}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  / 100 Poin
                </span>
              </div>
            </div>

            {/* Answer Summary Bar */}
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{correctCount} Benar</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>{incorrectCount} Salah</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* DETAILED ANSWER BREAKDOWN (Rincian Jawaban Accordion) */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <span>Rincian Jawaban & Pembahasan</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {reviews.length} Soal Ditampilkan
            </span>
          </div>

          <div className="space-y-3">
            {reviews.map((rev) => {
              const isOpen = openQuestionId === rev.id;
              return (
                <div
                  key={rev.id}
                  className="glass-card rounded-2xl border border-white/90 shadow-sm overflow-hidden transition"
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() =>
                      setOpenQuestionId(isOpen ? null : rev.id)
                    }
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-white/90 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                          rev.isCorrect
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-red-100 text-red-800 border border-red-300"
                        }`}
                      >
                        {rev.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-[#0F172A]">
                          Soal #{rev.id}
                        </div>
                        <div className="text-xs text-slate-500 font-medium line-clamp-1">
                          {rev.questionText.replace(/\$/g, "")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                          rev.isCorrect
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {rev.isCorrect ? "Jawaban Benar" : "Jawaban Salah"}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Accordion Content Body */}
                  {isOpen && (
                    <div className="p-5 sm:p-6 border-t border-slate-200/80 bg-white/80 space-y-4 text-xs sm:text-sm animate-in fade-in duration-150">
                      {/* Question Text */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Pertanyaan:
                        </div>
                        <MarkdownRenderer content={rev.questionText} />
                      </div>

                      {/* Answers Comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Jawaban Anda:
                          </div>
                          <div
                            className={`font-bold text-sm mt-0.5 ${
                              rev.isCorrect ? "text-emerald-700" : "text-red-600"
                            }`}
                          >
                            {rev.studentAnswer}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70">
                          <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                            Kunci Jawaban Benar:
                          </div>
                          <div className="font-bold text-sm text-emerald-800 mt-0.5">
                            {rev.correctAnswer}
                          </div>
                        </div>
                      </div>

                      {/* Pembahasan Box */}
                      <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                        <div className="text-xs font-extrabold text-[#0F172A] flex items-center gap-2">
                          <BrainCircuit className="w-4 h-4 text-indigo-600" />
                          <span>Pembahasan Lengkap:</span>
                        </div>
                        <div className="text-xs text-slate-700 leading-relaxed">
                          <MarkdownRenderer content={rev.explanation} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Navigation Footer */}
        <div className="pt-4 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 py-3.5 px-8 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold transition duration-200 cursor-pointer shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

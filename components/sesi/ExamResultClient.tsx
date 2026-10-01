"use client";

import { useState } from "react";
import Link from "next/link";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";

export interface QuestionReview {
  id: number;
  soalId?: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ExamResultClientProps {
  sesiId?: string;
  judulBab?: string;
  jenisSesi?: string;
  score?: number;
  poinEarned?: number;
  totalQuestions?: number;
  correctCount?: number;
  incorrectCount?: number;
  reviews?: QuestionReview[];
}

export default function ExamResultClient({
  sesiId,
  judulBab = "Evaluasi Materi",
  jenisSesi = "Kuis",
  score = 0,
  poinEarned = 100,
  totalQuestions = 0,
  correctCount = 0,
  incorrectCount = 0,
  reviews = [],
}: ExamResultClientProps) {
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect">("all");

  const filteredReviews = reviews.filter((rev) => {
    if (filter === "correct") return rev.isCorrect;
    if (filter === "incorrect") return !rev.isCorrect;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Thinksy" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-sm tracking-tight">
                Hasil Evaluasi Kuis
              </span>
              <span className="text-[11px] text-slate-500 font-medium block truncate max-w-xs sm:max-w-md">
                {judulBab}
              </span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* ========================================================= */}
        {/* SUMMARY CARD */}
        {/* ========================================================= */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Ringkasan Pengerjaan
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Evaluasi Kuis Selesai
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Topik: <span className="font-semibold text-slate-700">{judulBab}</span>
              </p>
            </div>

            <div className="flex items-baseline gap-1.5 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-lg self-start sm:self-auto">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{score}</span>
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>
          </div>

          {/* Metric Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] font-medium text-slate-500">Skor Akhir</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{score}</div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] font-medium text-slate-500">Jawaban Benar</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">
                {correctCount}{" "}
                <span className="text-xs font-normal text-slate-400">/ {totalQuestions}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] font-medium text-slate-500">Jawaban Salah</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">
                {incorrectCount}{" "}
                <span className="text-xs font-normal text-slate-400">soal</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] font-medium text-slate-500">Poin Belajar</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">+{poinEarned}</div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FILTER BAR & QUESTION LIST */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900">
              Rincian Soal & Pembahasan AI
            </h2>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 border border-slate-200 rounded-lg text-xs self-start">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  filter === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua ({reviews.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("correct")}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  filter === "correct"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Benar ({correctCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter("incorrect")}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  filter === "incorrect"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Salah ({incorrectCount})
              </button>
            </div>
          </div>

          {/* Question Review Cards */}
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                Tidak ada soal dalam kategori ini.
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs"
                >
                  {/* Card Header: Number & Clean Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Soal Nomor {rev.id}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-md border ${
                        rev.isCorrect
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {rev.isCorrect ? "Benar (+10)" : "Salah (0)"}
                    </span>
                  </div>

                  {/* Question Content */}
                  <div className="text-sm text-slate-800 leading-relaxed font-normal">
                    <MarkdownRenderer content={rev.questionText} />
                  </div>

                  {/* Answer Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div
                      className={`p-3.5 rounded-lg border text-xs ${
                        rev.isCorrect
                          ? "bg-slate-50 border-slate-200"
                          : "bg-rose-50/40 border-rose-200"
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Jawaban Anda
                      </div>
                      <div
                        className={`font-semibold ${
                          rev.isCorrect ? "text-slate-900" : "text-rose-800"
                        }`}
                      >
                        {rev.studentAnswer}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Kunci Jawaban
                      </div>
                      <div className="font-semibold text-slate-900">
                        {rev.correctAnswer}
                      </div>
                    </div>
                  </div>

                  {/* AI Discussion Box */}
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/90 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Pembahasan AI
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <MarkdownRenderer content={rev.explanation} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* FOOTER ACTIONS */}
        {/* ========================================================= */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto text-center px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/belajar"
            className="w-full sm:w-auto text-center px-6 py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            Pelajari Materi Lain
          </Link>
        </div>
      </div>
    </main>
  );
}

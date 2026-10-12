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
  tipeSoal?: "pilihan_ganda" | "esai";
  statusPenilaian?: "sementara" | "final";
  topik?: string;
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

  const incorrectReviews = reviews.filter((r) => !r.isCorrect);

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
                Hasil Evaluasi Kuis & Asesmen
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
        {/* SUMMARY CARD (Modern Soft Educational) */}
        {/* ========================================================= */}
        <section className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Ringkasan Pengerjaan
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                Evaluasi Kuis Selesai
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Topik: <span className="font-semibold text-slate-700">{judulBab}</span>
              </p>
            </div>

            <div className="flex items-baseline gap-1.5 bg-emerald-50 border border-emerald-200/80 px-5 py-3 rounded-2xl self-start sm:self-auto shadow-2xs">
              <span className="text-2xl sm:text-3xl font-black text-emerald-800 font-heading">{score}</span>
              <span className="text-xs font-bold text-emerald-600">/ 100</span>
            </div>
          </div>

          {/* Metric Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Skor Akhir</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{score}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Jawaban Benar</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                {correctCount}{" "}
                <span className="text-xs font-normal text-slate-400">/ {totalQuestions}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Jawaban Salah</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                {incorrectCount}{" "}
                <span className="text-xs font-normal text-slate-400">soal</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70">
              <div className="text-[11px] font-bold text-amber-800">Poin Belajar</div>
              <div className="text-xl font-black text-amber-900 mt-0.5">+{poinEarned} XP</div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ANALISIS TOPIK YANG LEMAH */}
        {/* ========================================================= */}
        {incorrectReviews.length > 0 && (
          <section className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-6 sm:p-7 space-y-3.5 shadow-2xs">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <span>⚠️ Analisis Kelemahan & Topik Perlu Ditingkatkan</span>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              Berdasarkan hasil pengerjaan, berikut adalah nomor soal dan konsep yang perlu Anda pelajari kembali sebelum melanjutkan ke bab berikutnya:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {incorrectReviews.map((inc) => (
                <div
                  key={inc.id}
                  className="bg-white border border-amber-200/80 rounded-2xl p-4 text-xs space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Soal #{inc.id}</span>
                    <span className="text-[10px] text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full font-bold">
                      Perlu Remedial
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {inc.questionText.replace(/[$*#_`]/g, "")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

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
              filteredReviews.map((rev) => {
                const isEssay = rev.tipeSoal === "esai";
                const isPendingTeacher = isEssay && rev.statusPenilaian === "sementara";

                return (
                  <div
                    key={rev.id}
                    className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
                  >
                    {/* Card Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                          {rev.id}
                        </span>
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Soal Nomor {rev.id}
                        </span>
                        {isEssay && (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            Esai
                          </span>
                        )}
                      </div>

                      {/* PART 3: Exact Badge Esai Sementara */}
                      {isPendingTeacher ? (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs">
                          Skor esai sementara — menunggu konfirmasi guru
                        </span>
                      ) : (
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${
                            rev.isCorrect
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {rev.isCorrect ? "Benar (+10)" : "Salah (0)"}
                        </span>
                      )}
                    </div>

                    {/* Question Content */}
                    <div className="text-sm text-slate-800 leading-relaxed font-normal">
                      <MarkdownRenderer content={rev.questionText} />
                    </div>

                    {/* Answer Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      <div
                        className={`p-4 rounded-2xl border text-xs ${
                          rev.isCorrect
                            ? "bg-slate-50 border-slate-100"
                            : "bg-rose-50/50 border-rose-100"
                        }`}
                      >
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Jawaban Anda
                        </div>
                        <div
                          className={`font-bold leading-relaxed ${
                            rev.isCorrect ? "text-slate-900" : "text-rose-900"
                          }`}
                        >
                          {rev.studentAnswer}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Kunci Jawaban / Kriteria
                        </div>
                        <div className="font-bold text-slate-900 leading-relaxed">
                          {rev.correctAnswer}
                        </div>
                      </div>
                    </div>

                    {/* AI Discussion Box */}
                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100/80 space-y-1.5">
                      <div className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                        Pembahasan & Analisis Konsep
                      </div>
                      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <MarkdownRenderer content={rev.explanation} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* FOOTER ACTIONS (Mobile-First & Emerald CTA) */}
        {/* ========================================================= */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto text-center py-3.5 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-98"
          >
            Kembali ke Dashboard Siswa
          </Link>
          <Link
            href="/belajar"
            className="w-full sm:w-auto text-center py-3.5 px-8 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition shadow-xs"
          >
            Pelajari Materi Bab Lainnya
          </Link>
        </div>
      </div>
    </main>
  );
}

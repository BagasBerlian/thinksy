"use client";

import { useState, useEffect } from "react";
import MarkdownRenderer from "../materi/MarkdownRenderer";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  pertanyaan: string;
  tipeSoal: "pilihan_ganda" | "esai";
  kunciJawaban?: string;
  pembahasan?: string;
  opsiSoal?: { id: string; teksOpsi: string }[];
}

interface SessionQuizClientProps {
  sesiId: string;
  jenisSesi: string;
  judulBab: string;
  soalList: Question[];
}

export default function SessionQuizClient({
  sesiId,
  jenisSesi,
  judulBab,
  soalList,
}: SessionQuizClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jawabanState, setJawabanState] = useState<{
    [soalId: string]: { opsiDipilihId?: string; jawabanTeks?: string };
  }>({});
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [resultData, setResultData] = useState<{
    skorAkhir: number;
    detailEvaluasi: any[];
  } | null>(null);

  // Timer effect
  useEffect(() => {
    if (resultData) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resultData]);

  const currentQuestion = soalList[currentIndex];

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (opsiId: string) => {
    if (!currentQuestion) return;
    setJawabanState((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        opsiDipilihId: opsiId,
      },
    }));
  };

  const handleTextChange = (text: string) => {
    if (!currentQuestion) return;
    setJawabanState((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        jawabanTeks: text,
      },
    }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const payloadAnswers = soalList.map((q) => ({
        soalId: q.id,
        opsiDipilihId: jawabanState[q.id]?.opsiDipilihId,
        jawabanTeks: jawabanState[q.id]?.jawabanTeks,
      }));

      const res = await fetch("/api/quiz/grade-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sesiId,
          jawabanList: payloadAnswers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirimkan kuis.");
      }

      setResultData({
        skorAkhir: data.skorAkhir,
        detailEvaluasi: data.detailEvaluasi || [],
      });
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat mengumpulkan kuis.");
    } finally {
      setSubmitting(false);
    }
  };

  // Summary View
  if (resultData) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-8">
          {/* Header Result */}
          <div className="text-center space-y-3 border-b border-slate-100 pb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E9C77B]/20 border border-[#E9C77B]/40 text-[#193446]">
              <Award className="w-8 h-8 text-[#193446]" />
            </div>
            <h1 className="text-2xl font-bold text-[#193446]">
              Laporan Hasil {jenisSesi.toUpperCase()}
            </h1>
            <p className="text-xs text-slate-500">{judulBab}</p>

            <div className="mt-4 inline-block bg-slate-50 px-6 py-4 rounded-2xl border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase">
                Skor Akhir Siswa
              </div>
              <div
                className={`text-4xl font-extrabold mt-1 ${
                  resultData.skorAkhir >= 70
                    ? "text-emerald-600"
                    : resultData.skorAkhir >= 50
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {resultData.skorAkhir} / 100
              </div>
            </div>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Ulasan & Penilaian Otomatis:
            </h2>

            <div className="space-y-4">
              {soalList.map((q, idx) => {
                const evalItem = resultData.detailEvaluasi.find(
                  (e: any) => e.soalId === q.id
                );
                const isBenar = evalItem?.isBenar;

                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#193446] bg-slate-200 px-2.5 py-1 rounded-md">
                        Soal #{idx + 1} ({q.tipeSoal.toUpperCase()})
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        {isBenar ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Benar (Nilai: {evalItem?.nilai})
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Perlu Perbaikan (Nilai: {evalItem?.nilai || 0})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-slate-800 font-medium">
                      <MarkdownRenderer content={q.pertanyaan} />
                    </div>

                    {/* AI Feedback */}
                    {evalItem?.umpanBalik && (
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1">
                        <div className="font-bold text-[#193446] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#E9C77B]" />
                          Umpan Balik AI:
                        </div>
                        <p>{evalItem.umpanBalik}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#193446] text-[#E9C77B] font-bold text-sm shadow-md hover:bg-[#132836] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#193446] bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Keluar Sesi</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-[#193446] border border-slate-200">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>{formatTimer(secondsElapsed)}</span>
            </div>

            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-[#193446] hover:bg-[#132836] text-[#E9C77B] px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menilai...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Kumpulkan Jawaban</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 space-y-6">
        {/* Navigation Indicator Dots */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-3">
            Daftar Soal ({soalList.length}):
          </span>
          <div className="flex items-center gap-2">
            {soalList.map((q, idx) => {
              const isAnswered =
                Boolean(jawabanState[q.id]?.opsiDipilihId) ||
                Boolean(jawabanState[q.id]?.jawabanTeks?.trim());
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                    isCurrent
                      ? "bg-[#193446] text-[#E9C77B] ring-2 ring-[#193446]/30 shadow-sm"
                      : isAnswered
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-[#193446] bg-[#193446]/10 px-3 py-1 rounded-full">
                Soal #{currentIndex + 1} dari {soalList.length} (
                {currentQuestion.tipeSoal === "pilihan_ganda"
                  ? "Pilihan Ganda"
                  : "Esai"}
                )
              </span>
            </div>

            <div className="text-slate-900 font-medium">
              <MarkdownRenderer content={currentQuestion.pertanyaan} />
            </div>

            {/* Answer Input depending on Type */}
            {currentQuestion.tipeSoal === "pilihan_ganda" ? (
              <div className="space-y-3 pt-2">
                {currentQuestion.opsiSoal?.map((opsi, oIdx) => {
                  const isSelected =
                    jawabanState[currentQuestion.id]?.opsiDipilihId === opsi.id;
                  const labelOption = String.fromCharCode(65 + oIdx);

                  return (
                    <button
                      key={opsi.id}
                      onClick={() => handleSelectOption(opsi.id)}
                      className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition cursor-pointer ${
                        isSelected
                          ? "border-[#193446] bg-[#193446]/5 text-[#193446] font-bold shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected
                            ? "bg-[#193446] text-[#E9C77B]"
                            : "bg-white border border-slate-200 text-slate-600"
                        }`}
                      >
                        {labelOption}
                      </div>
                      <div className="flex-1">
                        <MarkdownRenderer content={opsi.teksOpsi} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700">
                  Tuliskan Jawaban & Langkah Penyelesaian Esai:
                </label>
                <textarea
                  rows={6}
                  value={jawabanState[currentQuestion.id]?.jawabanTeks || ""}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Ketik uraian jawaban esai di sini..."
                  className="w-full p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#193446] bg-slate-50/50"
                />
              </div>
            )}

            {/* Bottom Question Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(soalList.length - 1, prev + 1)
                  )
                }
                disabled={currentIndex === soalList.length - 1}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#193446] text-white text-xs font-bold hover:bg-[#132836] disabled:opacity-40 cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
            Tidak ada soal untuk sesi ini.
          </div>
        )}
      </div>
    </main>
  );
}

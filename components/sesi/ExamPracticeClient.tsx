"use client";

import { useState, useEffect, useRef } from "react";
import {
  Flag,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  AlertTriangle,
  X,
  Send,
  Loader2,
  Sparkles,
  CheckCircle2,
  List,
  ChevronDown,
  ChevronUp,
  FlagTriangleLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";

export interface ExamQuestion {
  id: string;
  pertanyaan: string;
  tipeSoal: "pilihan_ganda" | "esai";
  opsiSoal?: Array<{ id: string; teksOpsi: string }>;
  kunciJawaban?: string;
  pembahasan?: string;
  hintSokratik?: string;
}

interface ExamPracticeClientProps {
  sesiId: string;
  babId?: string;
  mode?: "latihan" | "inclass" | "kuis" | "assessment" | "eksplorasi";
  judulSesi?: string;
  mapel?: string;
  soalList: ExamQuestion[];
  namaSiswa?: string;
}

export default function ExamPracticeClient({
  sesiId,
  babId,
  mode = "inclass",
  judulSesi = "EVALUASI BAB - ASESMEN TOPIK IN-CLASS",
  mapel = "Matematika",
  soalList = [],
  namaSiswa = "Siswa",
}: ExamPracticeClientProps) {
  const router = useRouter();
  const activeQuestions = soalList;

  // Active State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState(0);

  const SUBMIT_PHASES = [
    {
      title: "Mengirimkan Lembar Jawaban",
      desc: "Menghubungkan lembar jawaban kuis ke server...",
      progress: 25,
    },
    {
      title: "Pencocokan Kunci Jawaban Database",
      desc: "Mengevaluasi setiap nomor soal dengan kunci di database...",
      progress: 50,
    },
    {
      title: "Analisis Pembahasan AI",
      desc: "AI menganalisis konsep dan menyusun pembahasan edukatif...",
      progress: 75,
    },
    {
      title: "Menyimpan Skor & Poin Belajar",
      desc: "Menyinkronkan hasil asesmen ke sistem Thinksy...",
      progress: 90,
    },
    {
      title: "Membuka Lembar Hasil",
      desc: "Menyiapkan ringkasan evaluasi dan pembahasan AI...",
      progress: 100,
    },
  ];

  useEffect(() => {
    if (!submitting) {
      setSubmitPhase(0);
      return;
    }
    const timer1 = setTimeout(() => setSubmitPhase(1), 1200);
    const timer2 = setTimeout(() => setSubmitPhase(2), 2600);
    const timer3 = setTimeout(() => setSubmitPhase(3), 4200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [submitting]);

  // Palette Navigation Collapsible State
  const [isPaletteMinimized, setIsPaletteMinimized] = useState(false);

  const currentQ = activeQuestions[currentIdx];

  const handleSelectAnswer = (optionIdOrText: string) => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionIdOrText }));
  };

  const handleToggleFlag = () => {
    if (!currentQ) return;
    setFlagged((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  // Socratic AI Assistant Chat State (Inline & Scoped per Question)
  const MAX_AI_INPUT_CHARS = 200;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessagesByQuestion, setAiMessagesByQuestion] = useState<
    Record<string, Array<{ sender: "user" | "tutor"; text: string }>>
  >({});
  const [inputMsg, setInputMsg] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Height sync refs: keeps the bottom border of AI section aligned with question section
  const questionCardRef = useRef<HTMLDivElement>(null);
  const paletteCardRef = useRef<HTMLDivElement>(null);
  const [aiBoxHeight, setAiBoxHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!isAiOpen) return;

    const updateHeight = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth < 1024) {
        setAiBoxHeight(undefined);
        return;
      }
      if (questionCardRef.current && paletteCardRef.current) {
        const qH = questionCardRef.current.offsetHeight;
        const pH = paletteCardRef.current.offsetHeight;
        // 16px is gap-4 between Palette Card and AI box in right column
        const computed = qH - pH - 16;
        setAiBoxHeight(Math.max(computed, 260));
      }
    };

    updateHeight();
    const rafId = requestAnimationFrame(updateHeight);
    const timeoutId = setTimeout(updateHeight, 60);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        updateHeight();
      });
      if (questionCardRef.current) ro.observe(questionCardRef.current);
      if (paletteCardRef.current) ro.observe(paletteCardRef.current);
    }

    window.addEventListener("resize", updateHeight);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateHeight);
      ro?.disconnect();
    };
  }, [isAiOpen, isPaletteMinimized, currentIdx]);

  // Auto-scroll refs & handler: scrolls smoothly to bottom on new user message or AI response
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior,
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  // Reset input draft when moving between questions
  useEffect(() => {
    setInputMsg("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [currentIdx]);

  // Handle dynamic auto-expanding textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, MAX_AI_INPUT_CHARS);
    setInputMsg(val);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
  };

  // Active Socratic messages for currently viewed question (Scoped context)
  const currentSnippet = currentQ?.pertanyaan
    ? currentQ.pertanyaan.replace(/^\d+[\.\)]\s*/, "").slice(0, 80).trim()
    : "";

  const currentQuestionMessages = currentQ
    ? aiMessagesByQuestion[currentQ.id] || [
        {
          sender: "tutor",
          text: `Hai ${namaSiswa || "kamu"}! 👋 Aku siap membantumu membedah soal yang sedang kamu buka di layar:\n\n> *"${currentSnippet}..."*\n\nSilakan tanyakan bagian konsep atau langkah yang membuatmu bingung. Kita bahas bersama tanpa membocorkan jawaban langsung ya.`,
        },
      ]
    : [];

  // Auto-scroll when new messages arrive, when loading starts, or when AI drawer opens
  useEffect(() => {
    if (!isAiOpen) return;
    const timer = setTimeout(() => {
      scrollToBottom("smooth");
    }, 60);
    return () => clearTimeout(timer);
  }, [currentQuestionMessages.length, isAiLoading, isAiOpen, currentIdx]);

  const handleOpenAi = () => {
    setIsAiOpen(true);
    setIsPaletteMinimized(true);
    setTimeout(() => {
      const el = document.getElementById("ai-assistant-section");
      if (el && window.innerWidth < 1024) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleCloseAi = () => {
    setIsAiOpen(false);
    setIsPaletteMinimized(false);
  };

  const handleTogglePalette = () => {
    setIsPaletteMinimized((prev) => {
      const nextMinimized = !prev;
      if (nextMinimized) {
        setIsAiOpen(true);
      } else {
        setIsAiOpen(false);
      }
      return nextMinimized;
    });
  };

  const handleSendAiMessage = async (presetPrompt?: string) => {
    const textToSend = (presetPrompt || inputMsg).trim();
    if (!textToSend || isAiLoading || !currentQ) return;

    setInputMsg("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    const prevList = currentQuestionMessages;
    const updatedWithUser = [
      ...prevList,
      { sender: "user" as const, text: textToSend },
    ];

    setAiMessagesByQuestion((prev) => ({
      ...prev,
      [currentQ.id]: updatedWithUser,
    }));
    setIsAiLoading(true);
    setTimeout(() => scrollToBottom("smooth"), 40);

    try {
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sesiId,
          soalId: currentQ.id,
          soalNomor: currentIdx + 1,
          totalSoal: activeQuestions.length,
          pertanyaan: currentQ.pertanyaan,
          opsiJawaban: currentQ.opsiSoal,
          jawabanSiswa: answers[currentQ.id] || undefined,
          kunciJawaban: currentQ.kunciJawaban,
          pembahasan: currentQ.pembahasan,
          hintSokratik: currentQ.hintSokratik,
          babJudul: judulSesi,
          materiJudul: judulSesi,
          mapel,
          message: textToSend,
          history: prevList.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });
      const data = await response.json();
      const replyText =
        data.reply ||
        `💡 **Bimbingan Sokratik:**\n\nCoba telaah kembali kata kunci utama pada pertanyaan ini. Apakah kamu bisa mengidentifikasi konsep yang menghubungkan pertanyaan dengan pilihan jawaban yang ada?`;

      setAiMessagesByQuestion((prev) => ({
        ...prev,
        [currentQ.id]: [
          ...(prev[currentQ.id] || updatedWithUser),
          { sender: "tutor", text: replyText },
        ],
      }));
      setTimeout(() => scrollToBottom("smooth"), 50);
    } catch {
      setAiMessagesByQuestion((prev) => ({
        ...prev,
        [currentQ.id]: [
          ...(prev[currentQ.id] || updatedWithUser),
          {
            sender: "tutor",
            text: `💡 **Petunjuk Sokratik:**\n\nPerhatikan informasi penting yang ada pada soal. Konsep dasar apa yang menurutmu paling tepat untuk membedakan opsi yang benar dan yang salah?`,
          },
        ],
      }));
      setTimeout(() => scrollToBottom("smooth"), 50);
    } finally {
      setIsAiLoading(false);
      setTimeout(() => scrollToBottom("smooth"), 50);
    }
  };

  const handleFinishExam = async () => {
    setIsSubmitModalOpen(false);
    setSubmitting(true);
    try {
      const payloadAnswers = activeQuestions.map((q) => {
        const userAns = answers[q.id];
        return {
          soalId: q.id,
          opsiDipilihId: q.tipeSoal === "pilihan_ganda" ? userAns : undefined,
          jawabanTeks: q.tipeSoal === "esai" ? userAns : undefined,
        };
      });

      const res = await fetch("/api/quiz/grade-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sesiId,
          babId,
          jawabanList: payloadAnswers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirimkan kuis.");
      }

      // Advance to final transition phase and keep loading state active until new page mounts
      setSubmitPhase(4);
      router.push(`/hasil/${data.sesiId || sesiId}`);
    } catch (err: any) {
      setSubmitting(false);
      alert(err.message || "Gagal mengirimkan kuis.");
    }
  };

  const answeredCount = Object.keys(answers).length;

  if (submitting) {
    const currentPhase = SUBMIT_PHASES[submitPhase] || SUBMIT_PHASES[0];
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white rounded-2xl p-7 sm:p-9 max-w-md w-full border border-slate-200 shadow-sm space-y-5 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Evaluasi Kuis Sedang Berlangsung
              </span>
              <h2 className="text-base font-bold text-slate-900">
                {currentPhase.title}
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {currentPhase.desc}
          </p>

          {/* Progress bar */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${currentPhase.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Langkah {submitPhase + 1} dari {SUBMIT_PHASES.length}</span>
              <span>{currentPhase.progress}%</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Mohon jangan menutup halaman ini selagi AI memproses analisis jawaban.
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="min-h-screen bg-mesh-gradient flex flex-col items-center justify-center p-6 text-center">
        <div className="saas-card rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl bg-white space-y-4">
          <BrainCircuit className="w-10 h-10 text-[#0F172A] mx-auto" />
          <h2 className="text-xl font-extrabold text-[#0F172A]">Kuis Tidak Memuat Soal</h2>
          <p className="text-xs text-slate-500">
            Tidak ada soal yang tersedia untuk sesi kuis ini. Silakan kembali ke beranda.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-[#0F172A] text-white text-xs font-bold"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* 1. EXAM HEADER BAR */}
      <header className="sticky top-0 z-40 saas-nav border-b border-slate-200 shadow-xs bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl overflow-hidden shadow-xs border border-slate-200 bg-white flex items-center justify-center p-0.5">
              <img src="/logo.png" alt="THINKSY Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-[#0F172A] block text-base tracking-tight truncate max-w-[200px] sm:max-w-md md:max-w-lg">
                {judulSesi}
              </span>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                {mapel} • Kuis & Latihan Mandiri
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN EXAM INTERFACE */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question & Multiple-Choice Radio Options (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div
            ref={questionCardRef}
            className="glass-card rounded-3xl p-6 sm:p-8 border border-white/90 shadow-xl space-y-6 bg-white lg:min-h-[520px] flex flex-col justify-between"
          >
            {/* Question Header & Controls */}
            <div className="flex items-center justify-end border-b border-slate-200/80 pb-4">
              {/* Tandai Ragu Button */}
              <button
                type="button"
                onClick={handleToggleFlag}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  flagged[currentQ.id]
                    ? "bg-amber-400 text-[#0F172A] border-amber-500 shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>
                  {flagged[currentQ.id] ? "Ragu-ragu (Aktif)" : "Tandai Ragu"}
                </span>
              </button>
            </div>

            {/* Question Content (KaTeX Math Render) */}
            <div className="text-slate-800 text-sm sm:text-base leading-relaxed font-medium">
              <MarkdownRenderer content={currentQ.pertanyaan} />
            </div>

            {/* Options List */}
            {currentQ.tipeSoal === "pilihan_ganda" && currentQ.opsiSoal && (
              <div className="space-y-3 pt-2">
                {currentQ.opsiSoal.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = answers[currentQ.id] === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectAnswer(opt.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition flex items-start gap-4 cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 border-blue-500 ring-2 ring-blue-400 shadow-sm"
                          : "bg-slate-50/70 hover:bg-white border-slate-200/90 text-slate-800"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 transition ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white border border-slate-300 text-slate-700"
                        }`}
                      >
                        {letter}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold flex-1 pt-1.5">
                        <MarkdownRenderer content={opt.teksOpsi} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Essay Input Box */}
            {currentQ.tipeSoal === "esai" && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Ketikkan Jawaban Analisis / Penjelasan Anda:
                </label>
                <textarea
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleSelectAnswer(e.target.value)}
                  rows={6}
                  placeholder="Tuliskan langkah pengerjaan atau uraian penjelasan Anda secara rinci..."
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm text-slate-900"
                />
              </div>
            )}

            {/* Navigation Bottom Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
              <button
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Soal Sebelumnya</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIdx < activeQuestions.length - 1 ? (
                  <button
                    onClick={() =>
                      setCurrentIdx((prev) =>
                        Math.min(activeQuestions.length - 1, prev + 1)
                      )
                    }
                    className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <span>Soal Selanjutnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <span>Kumpulkan Kuis</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Question Palette & AI Assistant (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* 1. Palette Card */}
          <div
            ref={paletteCardRef}
            className="glass-card rounded-3xl p-5 sm:p-6 border border-white/90 shadow-xl space-y-4 bg-white"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FlagTriangleLeft className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0F172A]">
                  Navigasi Soal
                </h3>
              </div>

              {/* Minimize/Expand Palette Button */}
              <button
                type="button"
                onClick={handleTogglePalette}
                className="px-2.5 py-1 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title={isPaletteMinimized ? "Tampilkan Navigasi Soal" : "Sembunyikan Navigasi Soal"}
              >
                <span className="text-[11px] text-slate-500 font-semibold sm:inline hidden">
                  {isPaletteMinimized ? "Tampilkan" : "Minimize"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-600 transition-transform duration-300 ease-in-out ${
                    isPaletteMinimized ? "rotate-0" : "-rotate-180"
                  }`}
                />
              </button>
            </div>

            {/* Collapsible Palette Body with Smooth Grid Transition */}
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                isPaletteMinimized
                  ? "grid-rows-[0fr] opacity-0 pointer-events-none"
                  : "grid-rows-[1fr] opacity-100"
              }`}
            >
              <div className="overflow-hidden space-y-4">
                {/* Grid of Question Number Badges */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 pt-1">
                  {activeQuestions.map((q, idx) => {
                    const isAnswered = Boolean(answers[q.id]);
                    const isCurrent = currentIdx === idx;
                    const isFlag = Boolean(flagged[q.id]);

                    let bgClasses = "bg-slate-100 text-slate-700 border-slate-200";
                    if (isCurrent) {
                      bgClasses = "ring-2 ring-blue-600 border-blue-600 font-black text-blue-600 bg-blue-50";
                    } else if (isFlag) {
                      bgClasses = "bg-amber-400 text-slate-900 border-amber-500 font-bold";
                    } else if (isAnswered) {
                      bgClasses = "bg-[#0F172A] text-white border-slate-900 font-bold";
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIdx(idx)}
                        className={`h-10 rounded-2xl border flex items-center justify-center text-xs transition cursor-pointer ${bgClasses}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Palette Legend */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-[#0F172A]" />
                    <span>Sudah Dijawab</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-amber-400" />
                    <span>Ragu-ragu</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200" />
                    <span>Belum Dijawab</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-blue-50 border-2 border-blue-600" />
                    <span>Soal Aktif</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Big Finish Button */}
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Kumpulkan Ujian</span>
            </button>
          </div>

          {/* 2. Window Bantuan AI with Smooth Transition */}
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
              isAiOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0 pointer-events-none"
            }`}
          >
            <div className="overflow-hidden">
              <div
                id="ai-assistant-section"
                style={aiBoxHeight ? { height: `${aiBoxHeight}px` } : undefined}
                className="rounded-3xl border border-slate-200/90 shadow-2xs bg-white overflow-hidden flex flex-col transition-[height] duration-200 text-xs sm:text-sm max-lg:min-h-[280px] max-lg:max-h-[420px]"
              >
                {/* Clean, Simple Header (Tanpa info Soal #X) */}
                <div className="px-3.5 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-slate-700" />
                    <h4 className="text-xs font-bold text-[#0F172A]">Bantuan AI</h4>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseAi}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition cursor-pointer"
                    title="Tutup Bantuan AI"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages Area */}
                <div
                  ref={chatScrollContainerRef}
                  className="p-3.5 flex-1 min-h-0 overflow-y-auto space-y-2.5 bg-slate-50/50 text-xs sm:text-sm scroll-smooth"
                >
                  {currentQuestionMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl leading-relaxed text-xs sm:text-sm ${
                        msg.sender === "user"
                          ? "bg-[#0F172A] text-white ml-5 rounded-tr-xs"
                          : "bg-white text-slate-800 mr-5 border border-slate-200/90 shadow-2xs rounded-tl-xs"
                      }`}
                    >
                      <MarkdownRenderer content={msg.text} isCompact />
                    </div>
                  ))}

                  {isAiLoading && (
                    <div className="flex items-center gap-2 text-slate-500 text-xs italic p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                      <span>Sedang memproses...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-0 w-0" />
                </div>

                {/* Chat Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAiMessage();
                  }}
                  className="p-2.5 bg-white border-t border-slate-100 shrink-0"
                >
                  <div className="flex items-end gap-2 px-3 py-1.5 rounded-2xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300 transition">
                    <textarea
                      ref={textareaRef}
                      value={inputMsg}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendAiMessage();
                        }
                      }}
                      rows={1}
                      maxLength={MAX_AI_INPUT_CHARS}
                      placeholder="Tanyakan ke AI... (Maks 200 karakter)"
                      className="flex-1 text-xs sm:text-sm bg-transparent focus:outline-none resize-none text-slate-800 placeholder:text-slate-400 leading-normal py-0.5 min-h-[26px] max-h-[100px] overflow-y-auto"
                    />
                    <div className="flex items-center gap-1.5 shrink-0 self-end pb-0.5">
                      {inputMsg.length > 0 && (
                        <span
                          className={`font-mono text-[10px] ${
                            inputMsg.length >= MAX_AI_INPUT_CHARS
                              ? "text-red-500 font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          {inputMsg.length}/{MAX_AI_INPUT_CHARS}
                        </span>
                      )}
                      <button
                        type="submit"
                        disabled={isAiLoading || !inputMsg.trim()}
                        className="w-7 h-7 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
                        title="Kirim (Enter)"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {!isAiOpen && (
            <button
              type="button"
              onClick={handleOpenAi}
              className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.99] animate-in fade-in"
            >
              <Sparkles className="w-4 h-4 text-slate-500" />
              <span>Buka Bantuan AI</span>
            </button>
          )}
        </div>
      </main>

      {/* 3. CONFIRMATION SUBMIT MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="saas-modal rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl bg-white space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-[#0F172A]">
                Konfirmasi Kumpulkan Kuis?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kamu telah menjawab <b>{answeredCount}</b> dari total <b>{activeQuestions.length}</b> soal. Jawaban akan dinilai otomatis dan poin belajar akan langsung ditambahkan ke akunmu.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cek Ulang
              </button>
              <button
                onClick={handleFinishExam}
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition shadow-md cursor-pointer"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


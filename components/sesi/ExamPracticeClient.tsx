"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Flag,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  AlertTriangle,
  X,
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  List,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";

interface ExamQuestion {
  id: string;
  pertanyaan: string;
  tipeSoal: "pilihan_ganda" | "esai";
  opsiSoal?: Array<{ id: string; teksOpsi: string }>;
  kunciJawaban?: string;
  pembahasan?: string;
}

interface ExamPracticeClientProps {
  sesiId: string;
  mode?: "latihan" | "inclass";
  judulSesi?: string;
  soalList: ExamQuestion[];
  namaSiswa?: string;
}

export default function ExamPracticeClient({
  sesiId,
  mode = "latihan",
  judulSesi = "UJIAN AKHIR SEMESTER",
  soalList,
  namaSiswa = "Budi Kartika",
}: ExamPracticeClientProps) {
  const router = useRouter();
  const isInClassMode = mode === "inclass";

  // Create 25 Math & Science Questions for Outside-Class Practice Exam (image_71b55b.png)
  const fullQuestions: ExamQuestion[] = Array.from({ length: 25 }, (_, i) => {
    const idx = i + 1;
    if (idx === 1) {
      return {
        id: `q-1`,
        pertanyaan: `Diketahui barisan aritmatika $3, 7, 11, 15, \\dots$. Tentukan nilai dari suku ke-10 ($U_{10}$)!`,
        tipeSoal: "pilihan_ganda",
        opsiSoal: [
          { id: "opt-1-a", teksOpsi: "35" },
          { id: "opt-1-b", teksOpsi: "39" },
          { id: "opt-1-c", teksOpsi: "43" },
          { id: "opt-1-d", teksOpsi: "47" },
        ],
        kunciJawaban: "opt-1-b",
        pembahasan: `**Suku ke-n Barisan Aritmatika:**\n$$U_n = a + (n - 1)b$$\nDi mana $a = 3$ dan beda $b = 7 - 3 = 4$.\n$$U_{10} = 3 + (10 - 1) \\times 4 = 3 + 36 = 39$$`,
      };
    } else if (idx === 2) {
      return {
        id: `q-2`,
        pertanyaan: `Akar-akar persamaan kuadrat $x^2 - 5x + 6 = 0$ adalah $p$ dan $q$. Tentukan nilai dari $p^2 + q^2$!`,
        tipeSoal: "pilihan_ganda",
        opsiSoal: [
          { id: "opt-2-a", teksOpsi: "13" },
          { id: "opt-2-b", teksOpsi: "19" },
          { id: "opt-2-c", teksOpsi: "25" },
          { id: "opt-2-d", teksOpsi: "31" },
        ],
        kunciJawaban: "opt-2-a",
        pembahasan: `**Rumus Jumlah & Hasil Kali Akar:**\n$$p + q = -\\frac{b}{a} = 5, \\quad p \\cdot q = \\frac{c}{a} = 6$$\n$$p^2 + q^2 = (p + q)^2 - 2pq = 5^2 - 2(6) = 25 - 12 = 13$$`,
      };
    } else if (idx === 3) {
      return {
        id: `q-3`,
        pertanyaan: `Hitunglah nilai Diskriminan ($D$) dari persamaan kuadrat $2x^2 + 4x - 6 = 0$!`,
        tipeSoal: "pilihan_ganda",
        opsiSoal: [
          { id: "opt-3-a", teksOpsi: "32" },
          { id: "opt-3-b", teksOpsi: "64" },
          { id: "opt-3-c", teksOpsi: "16" },
          { id: "opt-3-d", teksOpsi: "48" },
        ],
        kunciJawaban: "opt-3-b",
        pembahasan: `**Rumus Diskriminan:**\n$$D = b^2 - 4ac$$\nDengan $a = 2, b = 4, c = -6$:\n$$D = 4^2 - 4(2)(-6) = 16 + 48 = 64$$`,
      };
    }
    return {
      id: `q-${idx}`,
      pertanyaan: `Soal #${idx}: Jika fungsi $f(x) = ${idx}x^2 - ${idx * 2}x + ${idx + 1}$, tentukan titik puncak parabola tersebut!`,
      tipeSoal: "pilihan_ganda",
      opsiSoal: [
        { id: `opt-${idx}-a`, teksOpsi: `(1, ${idx})` },
        { id: `opt-${idx}-b`, teksOpsi: `(2, ${idx + 2})` },
        { id: `opt-${idx}-c`, teksOpsi: `(0, ${idx + 1})` },
        { id: `opt-${idx}-d`, teksOpsi: `(-1, ${idx * 3})` },
      ],
      kunciJawaban: `opt-${idx}-a`,
      pembahasan: `**Titik Puncak Parabola:**\n$$x_p = -\\frac{b}{2a} = \\frac{${idx * 2}}{2(${idx})} = 1$$\nSubstitusi $x = 1$ untuk mendapatkan $y_p = ${idx}$.`,
    };
  });

  const activeQuestions = isInClassMode
    ? fullQuestions.slice(0, 10)
    : fullQuestions;

  // Active State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Live 30-Minute Countdown Timer (For Outside-Class Practice Exam)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(30 * 60);

  useEffect(() => {
    if (isInClassMode) return; // No timer for In-Class Assessment

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isInClassMode]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const currentQ = activeQuestions[currentIdx];

  const handleSelectAnswer = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionId }));
  };

  const handleToggleFlag = () => {
    setFlagged((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  // Socratic AI Assistant Chat Modal State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    Array<{ sender: "user" | "tutor"; text: string }>
  >([
    {
      sender: "tutor",
      text: "Halo Budi! Saya THINKSY AI Sokratik Tutor. Saya di sini untuk memberikan petunjuk & konsep tanpa memberikan jawaban langsung. Ada yang ingin kamu tanyakan mengenai soal ini?",
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSendAiMessage = async () => {
    if (!inputMsg.trim() || isAiLoading) return;

    const userText = inputMsg;
    setInputMsg("");
    setAiMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pesan: userText,
          materiJudul: `Soal #${currentIdx + 1}`,
          materiKonten: `${currentQ.pertanyaan}\n\nATURAN PENTING: Jangan memberikan jawaban langsung! Berikan bimbingan Sokratik bertahap.`,
        }),
      });
      const data = await response.json();
      setAiMessages((prev) => [
        ...prev,
        {
          sender: "tutor",
          text:
            data.jawaban ||
            "Mari kita periksa bentuk umum persamaannya terlebih dahulu. Apakah kamu ingat rumus suku ke-n atau rumus ABC?",
        },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          sender: "tutor",
          text: "Coba tinjau kembali koefisien a, b, dan c dari soal ini. Langkah pertama apa yang ingin kamu coba?",
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFinishExam = () => {
    // Save answers & score simulation, redirect to Quiz Result Review Screen (image_71b4df.png)
    router.push(`/hasil/${sesiId}?mode=${mode}`);
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* 1. EXAM HEADER BAR */}
      <header className="sticky top-0 z-40 saas-nav border-b border-slate-200 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-[#0F172A] flex items-center justify-center font-bold text-white shadow-xs border border-slate-700">
              <BrainCircuit className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-extrabold text-[#0F172A] block text-base tracking-tight">
                {judulSesi}
              </span>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                {isInClassMode ? "Evaluasi Bab (Tanpa Waktu)" : "Kuis / Ujian Mandiri"}
              </span>
            </div>
          </div>

          {/* Live Countdown Timer Badge */}
          <div className="flex items-center space-x-3">
            {!isInClassMode ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 text-white shadow-md border border-amber-400 font-mono font-extrabold text-sm">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tanpa Waktu (Bebas Stres)</span>
              </div>
            )}

            {/* Socratic AI Assistant Floating Button */}
            <button
              onClick={() => setIsAiOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Tutor AI Sokratik</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN EXAM INTERFACE (image_71b55b.png Layout) */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question & Multiple-Choice Radio Options (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/90 shadow-xl space-y-6">
            {/* Question Header & Flag Toggle Button */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <span className="text-xs font-extrabold text-[#0F172A] bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl">
                Soal #{currentIdx + 1} dari {activeQuestions.length}
              </span>

              {/* Tandai Ragu Button */}
              <button
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

            {/* Multiple Choice Radio Options */}
            <div className="space-y-3 pt-2">
              {currentQ.opsiSoal?.map((opsi, oIdx) => {
                const labelLetter = String.fromCharCode(65 + oIdx); // A, B, C, D
                const isSelected = answers[currentQ.id] === opsi.id;
                return (
                  <button
                    key={opsi.id}
                    onClick={() => handleSelectAnswer(opsi.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-[#0F172A] text-white border-[#0F172A] shadow-md"
                        : "bg-white/80 hover:bg-white text-slate-800 border-slate-200/80 hover:border-slate-400"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                        isSelected
                          ? "bg-amber-400 text-[#0F172A]"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {labelLetter}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold flex-1">
                      {opsi.teksOpsi}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev) => prev - 1)}
              className="py-3 px-5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Soal Sebelumnya</span>
            </button>

            <div className="flex items-center gap-3">
              {currentIdx < activeQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="py-3 px-5 rounded-2xl bg-[#0F172A] text-white font-bold text-xs hover:bg-[#1E293B] transition cursor-pointer flex items-center gap-2 shadow-md"
                >
                  <span>Soal Selanjutnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="py-3 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg transition cursor-pointer flex items-center gap-2"
                >
                  <span>KUMPULKAN UJIAN</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Navigasi Soal Palette Grid 1-25 (4 cols) */}
        <div className="lg:col-span-4 space-y-6 sticky top-20">
          <div className="glass-card rounded-3xl p-6 border border-white/90 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                <List className="w-4 h-4 text-blue-600" />
                <span>Navigasi Soal (Palette)</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {answeredCount} / {activeQuestions.length} Terjawab
              </span>
            </div>

            {/* Grid of Numbers 1 to 25 */}
            <div className="grid grid-cols-5 gap-2.5">
              {activeQuestions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAns = !!answers[q.id];
                const isFlag = !!flagged[q.id];

                let bgClasses = "bg-slate-100 text-slate-600 border-slate-200";
                if (isFlag) {
                  bgClasses = "bg-amber-400 text-[#0F172A] font-extrabold border-amber-500 shadow-xs";
                } else if (isAns) {
                  bgClasses = "bg-[#0F172A] text-white font-extrabold border-[#0F172A] shadow-xs";
                }

                if (isCurrent) {
                  bgClasses += " ring-3 ring-blue-500 ring-offset-1 font-extrabold scale-105";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-10 rounded-xl text-xs flex items-center justify-center border transition cursor-pointer ${bgClasses}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend Status */}
            <div className="pt-3 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#0F172A]" />
                <span>Sudah Dijawab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400" />
                <span>Ragu-ragu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300" />
                <span>Belum Dijawab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-white border-2 border-blue-500" />
                <span>Soal Aktif</span>
              </div>
            </div>

            {/* Submit Button inside sidebar */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-md mt-2"
            >
              KUMPULKAN UJIAN
            </button>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: CONFIRMATION SUBMIT MODAL */}
      {/* ========================================================= */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-modal rounded-3xl shadow-2xl border border-white p-6 max-w-md w-full text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl font-bold">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-[#0F172A]">
                Kumpulkan Ujian Sekarang?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kamu telah menjawab {answeredCount} dari {activeQuestions.length}{" "}
                soal. Pastikan semua soal telah diperiksa sebelum mengumpulkan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Periksa Kembali
              </button>
              <button
                onClick={handleFinishExam}
                className="py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition cursor-pointer shadow-md"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: SOCRATIC THINKSY AI TUTOR MODAL */}
      {/* ========================================================= */}
      {isAiOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-md glass-modal rounded-3xl shadow-2xl border border-white p-5 space-y-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-amber-400 flex items-center justify-center font-bold">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#0F172A]">
                  THINKSY AI Sokratik Tutor
                </h4>
                <p className="text-[9px] text-emerald-700 font-bold">
                  Bimbingan Konsep • Tanpa Jawaban Langsung
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAiOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Dialog */}
          <div className="h-64 overflow-y-auto space-y-3 pr-1 text-xs">
            {aiMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 ${
                  msg.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-[#0F172A] text-amber-400"
                  }`}
                >
                  {msg.sender === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                </div>
                <div
                  className={`p-3 rounded-2xl max-w-[80%] ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Tutor AI sedang berpikir...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendAiMessage()}
              placeholder="Tanyakan petunjuk atau rumus..."
              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white"
            />
            <button
              onClick={handleSendAiMessage}
              disabled={isAiLoading || !inputMsg.trim()}
              className="p-2.5 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] disabled:opacity-40 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

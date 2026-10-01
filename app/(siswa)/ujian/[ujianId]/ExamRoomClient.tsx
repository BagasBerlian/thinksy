"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  Award,
  BookOpen,
  Sparkles,
  HelpCircle,
  Save,
  Check,
  RotateCcw,
  PlayCircle,
  X,
  MessageSquare,
  Lightbulb,
  Maximize2,
  Minimize2,
  Lock,
  CheckCircle,
  XCircle,
  CheckCheck,
  FileText,
  ShieldCheck,
} from "lucide-react";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";

interface OpsiItem {
  id: string;
  teks_opsi: string;
  urutan: number;
  benar?: boolean;
}

interface QuestionItem {
  id: string;
  urutan: number;
  pertanyaan: string;
  tipe_soal: string;
  poin_bobot: number;
  pembahasan?: string | null;
  kunci_jawaban?: string | null;
  opsi: OpsiItem[];
}

interface AnswerItem {
  opsiId?: string;
  jawabanEsai?: string;
  isBenar?: boolean | null;
  skorDiperoleh?: number;
  koreksiAi?: string;
}

interface UjianData {
  id: string;
  judul: string;
  deskripsi?: string;
  mapel: string;
  tipe?: string;
  durasi_menit: number;
  passing_grade: number;
  status: string;
}

interface SesiData {
  id: string;
  ujian_id: string;
  siswa_id: string;
  server_start_time: string;
  server_end_time: string;
  status: string;
  nilai_akhir?: number;
  skor_objektif?: number;
  dikumpulkan_pada?: string;
}

interface ExamRoomClientProps {
  ujian: UjianData;
  initialQuestions: QuestionItem[];
  initialSession: SesiData | null;
  initialSavedAnswers?: Record<string, AnswerItem>;
  initialRemainingSeconds?: number;
}

export default function ExamRoomClient({
  ujian,
  initialQuestions,
  initialSession,
  initialSavedAnswers = {},
  initialRemainingSeconds,
}: ExamRoomClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Session state
  const [session, setSession] = useState<SesiData | null>(initialSession);
  const [isExamStarted, setIsExamStarted] = useState(
    initialSession?.status === "sedang_mengerjakan" || initialSession?.status === "selesai"
  );
  const [isCompleted, setIsCompleted] = useState(
    initialSession?.status === "selesai" || initialSession?.status === "habis_waktu"
  );
  const [reviewFilter, setReviewFilter] = useState<"semua" | "benar" | "parsial" | "salah">("semua");
  const [finalResult, setFinalResult] = useState<{
    nilaiAkhir: number;
    isPassed: boolean;
    passingGrade: number;
    totalQuestions: number;
    correctCount: number;
    partialCount: number;
    wrongCount: number;
    bonusPoin: number;
  } | null>(() => {
    if (initialSession?.status === "selesai" || initialSession?.status === "habis_waktu") {
      let correct = 0;
      let partial = 0;
      let wrong = 0;
      let totalScore = 0;

      initialQuestions.forEach((q) => {
        const a = initialSavedAnswers[q.id];
        if (!a) {
          wrong++;
          return;
        }
        if (q.tipe_soal === "pilihan_ganda") {
          const correctOpt = q.opsi?.find((o) => o.benar);
          const isCorrect = a.isBenar === true || (correctOpt && a.opsiId === correctOpt.id);
          if (isCorrect) {
            correct++;
            totalScore += 5;
          } else {
            wrong++;
          }
        } else {
          if (a.isBenar === true) {
            correct++;
            totalScore += 5;
          } else if (a.skorDiperoleh && a.skorDiperoleh > 0 && a.skorDiperoleh < 5) {
            partial++;
            totalScore += a.skorDiperoleh;
          } else if (a.isBenar === null && a.jawabanEsai && a.jawabanEsai.trim().length > 3) {
            partial++;
            totalScore += 2.5;
          } else {
            wrong++;
          }
        }
      });

      const finalScoreVal =
        initialSession.nilai_akhir !== null && initialSession.nilai_akhir !== undefined
          ? Number(initialSession.nilai_akhir)
          : Math.round(totalScore);

      return {
        nilaiAkhir: finalScoreVal,
        isPassed: finalScoreVal >= (ujian.passing_grade || 75),
        passingGrade: ujian.passing_grade || 75,
        totalQuestions: initialQuestions.length,
        correctCount: correct,
        partialCount: partial,
        wrongCount: wrong,
        bonusPoin: 50,
      };
    }
    return null;
  });

  // Timer state (30 Menit default jika ulangan)
  const defaultSeconds = (ujian.durasi_menit || 30) * 60;
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    initialRemainingSeconds !== undefined ? initialRemainingSeconds : defaultSeconds
  );
  const [isTimerWarning, setIsTimerWarning] = useState(false);

  // Question navigation state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerItem>>(initialSavedAnswers);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isStartingExam, setIsStartingExam] = useState(false);

  // Fullscreen state & handler
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  };

  // Socratic Guidance State
  const [isSocraticDrawerOpen, setIsSocraticDrawerOpen] = useState(false);
  const [socraticChat, setSocraticChat] = useState<
    Record<string, Array<{ sender: "user" | "ai"; text: string }>>
  >({});
  const [socraticInput, setSocraticInput] = useState("");
  const [isAskingSocratic, setIsAskingSocratic] = useState(false);
  const socraticChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSocraticDrawerOpen) {
      socraticChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [socraticChat, isSocraticDrawerOpen, currentIndex, isAskingSocratic]);

  const currentQuestion = initialQuestions[currentIndex];

  const handleSendSocratic = async (customText?: string) => {
    const textToSend = (customText || socraticInput).trim();
    if (!textToSend || !currentQuestion || isAskingSocratic) return;

    const qId = currentQuestion.id;
    const previousHistory = socraticChat[qId] || [];

    const updatedWithUser = [
      ...previousHistory,
      { sender: "user" as const, text: textToSend },
    ];
    setSocraticChat((prev) => ({
      ...prev,
      [qId]: updatedWithUser,
    }));
    setSocraticInput("");
    setIsAskingSocratic(true);

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          soalId: qId,
          pertanyaan: currentQuestion.pertanyaan,
          mapel: ujian.mapel,
          history: previousHistory.map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            content: m.text,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setSocraticChat((prev) => ({
          ...prev,
          [qId]: [
            ...(prev[qId] || []),
            { sender: "ai" as const, text: data.reply },
          ],
        }));
      } else {
        setSocraticChat((prev) => ({
          ...prev,
          [qId]: [
            ...(prev[qId] || []),
            {
              sender: "ai" as const,
              text:
                data.error ||
                "Coba perhatikan kata kunci utama pada soal. Rumus atau definisi apa yang menghubungkan komponen tersebut?",
            },
          ],
        }));
      }
    } catch (err: any) {
      setSocraticChat((prev) => ({
        ...prev,
        [qId]: [
          ...(prev[qId] || []),
          {
            sender: "ai" as const,
            text:
              "Perhatikan konsep dasarnya. Cobalah mulai dengan menuliskan apa yang diketahui dan apa yang ditanyakan.",
          },
        ],
      }));
    } finally {
      setIsAskingSocratic(false);
    }
  };

  // 1. Timer Countdown Effect
  useEffect(() => {
    if (!isExamStarted || isCompleted) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitOnTimeout();
          return 0;
        }
        if (prev <= 300) {
          setIsTimerWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, isCompleted]);

  // 2. Periodic Auto-Save Effect (Every 25 seconds)
  useEffect(() => {
    if (!isExamStarted || isCompleted || !session?.id) return;

    const saveInterval = setInterval(() => {
      saveDraftAnswers();
    }, 25000);

    return () => clearInterval(saveInterval);
  }, [isExamStarted, isCompleted, session?.id, answers]);

  // Start Exam Action
  const handleStartExam = async () => {
    try {
      setIsStartingExam(true);
      const res = await fetch("/api/siswa/ujian/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ujianId: ujian.id }),
      });

      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        setRemainingSeconds(data.remaining_seconds);
        setIsExamStarted(true);
        if (data.status === "selesai" || data.status === "habis_waktu") {
          setIsCompleted(true);
        }
      }
    } catch (err) {
      console.error("Failed to start exam:", err);
    } finally {
      setIsStartingExam(false);
    }
  };

  // Auto-start when arriving with ?start=true from token verification
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("start") === "true" && !isExamStarted && !isCompleted && !isStartingExam) {
        handleStartExam();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      }
    }
  }, []);

  // Save Draft Action
  const saveDraftAnswers = async () => {
    if (!session?.id || isCompleted) return;

    try {
      setIsAutoSaving(true);
      const answersPayload = Object.entries(answers).map(([soalId, val]) => ({
        soalId,
        opsiId: val.opsiId,
        jawabanEsai: val.jawabanEsai,
      }));

      const res = await fetch("/api/siswa/ujian/save-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sesiId: session.id,
          ujianId: ujian.id,
          answers: answersPayload,
        }),
      });

      const data = await res.json();
      if (data.isExpired) {
        setIsCompleted(true);
        alert("Waktu ujian telah habis. Jawaban Anda telah otomatis tersimpan.");
      } else if (data.success) {
        const now = new Date();
        setLastSavedTime(
          now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        );
      }
    } catch (err) {
      console.error("Failed to save draft:", err);
    } finally {
      setIsAutoSaving(false);
    }
  };

  // Select Option
  const handleSelectOption = (soalId: string, opsiId: string) => {
    if (isCompleted) return;
    setAnswers((prev) => ({
      ...prev,
      [soalId]: {
        ...prev[soalId],
        opsiId,
      },
    }));
  };

  // Essay Input
  const handleEssayChange = (soalId: string, jawabanEsai: string) => {
    if (isCompleted) return;
    setAnswers((prev) => ({
      ...prev,
      [soalId]: {
        ...prev[soalId],
        jawabanEsai,
      },
    }));
  };

  // Toggle Flag
  const toggleFlagQuestion = (soalId: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(soalId)) {
        next.delete(soalId);
      } else {
        next.add(soalId);
      }
      return next;
    });
  };

  // Submit Final Exam
  const handleSubmitExam = async () => {
    if (!session?.id || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const answersPayload = Object.entries(answers).map(([soalId, val]) => ({
        soalId,
        opsiId: val.opsiId,
        jawabanEsai: val.jawabanEsai,
      }));

      const res = await fetch("/api/siswa/ujian/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sesiId: session.id,
          ujianId: ujian.id,
          answers: answersPayload,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.evaluations)) {
          setAnswers((prev) => {
            const updated = { ...prev };
            data.evaluations.forEach((ev: any) => {
              updated[ev.soalId] = {
                ...(updated[ev.soalId] || {}),
                isBenar: ev.isBenar,
                skorDiperoleh: ev.skorDiperoleh,
                koreksiAi: ev.koreksiAi,
              };
            });
            return updated;
          });
        }
        setFinalResult({
          nilaiAkhir: data.nilaiAkhir,
          isPassed: data.isPassed,
          passingGrade: data.passingGrade,
          totalQuestions: data.totalQuestions || initialQuestions.length,
          correctCount: data.correctCount,
          partialCount: data.partialCount || 0,
          wrongCount: data.wrongCount || 0,
          bonusPoin: data.bonusPoin,
        });
        setIsCompleted(true);
        setIsConfirmModalOpen(false);
      } else {
        alert(data.error || "Gagal mengumpulkan ujian.");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan saat mengumpulkan ujian.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto Submit on Timeout
  const handleAutoSubmitOnTimeout = async () => {
    if (!session?.id || isCompleted) return;
    await handleSubmitExam();
  };

  // Format Timer mm:ss
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Count answered questions
  const answeredCount = Object.keys(answers).filter((k) => {
    const ans = answers[k];
    return Boolean(ans?.opsiId || (ans?.jawabanEsai && ans.jawabanEsai.trim().length > 0));
  }).length;

  // ==========================================
  // VIEW 1: LOBBY / PRE-EXAM BRIEFING
  // ==========================================
  if (!isExamStarted) {
    return (
      <main className="min-h-screen bg-mesh-gradient text-slate-900 pb-16 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full saas-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-xl space-y-6">
          <Link
            href="/ujian"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Ujian</span>
          </Link>

          <div className="space-y-2 border-b border-slate-100 pb-5">
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 inline-block">
              {ujian.mapel} • Kelas 8
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {ujian.judul}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {ujian.deskripsi || "Asesmen kompetensi pembelajaran Kurikulum Merdeka Fase D."}
            </p>
          </div>

          {/* Exam Rules Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Petunjuk & Peraturan Ujian</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed list-disc list-inside">
              <li>
                Durasi waktu pengerjaan: <strong>{ujian.durasi_menit} Menit</strong> (Dihitung oleh server).
              </li>
              <li>
                Jumlah Soal: <strong>{initialQuestions.length} Soal</strong>.
              </li>
              <li>
                Kriteria Ketuntasan Minimal (KKM): <strong>{ujian.passing_grade} Poin</strong>.
              </li>
              <li>
                Jawaban Anda akan <strong>otomatis tersimpan</strong> secara berkala.
              </li>
              <li>
                Bila waktu habis, ujian akan <strong>otomatis dikumpulkan</strong> oleh sistem.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Waktu mulai dihitung saat tombol ditekan.</span>
            </div>

            <button
              onClick={handleStartExam}
              disabled={isStartingExam}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-extrabold text-xs flex items-center justify-center gap-2.5 transition shadow-md cursor-pointer disabled:opacity-50"
            >
              {isStartingExam ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Mempersiapkan Lembar Ujian...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 text-amber-400" />
                  <span>Mulai Kerjakan Ujian Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // VIEW 2: EXAM COMPLETED / REVIEW JAWABAN & PEMBAHASAN
  // ==========================================
  if (isCompleted) {
    const res = finalResult || {
      nilaiAkhir: initialSession?.nilai_akhir ?? 0,
      isPassed: (initialSession?.nilai_akhir ?? 0) >= (ujian.passing_grade || 75),
      passingGrade: ujian.passing_grade || 75,
      totalQuestions: initialQuestions.length,
      correctCount: 0,
      partialCount: 0,
      wrongCount: initialQuestions.length,
      bonusPoin: 50,
    };

    const isUjianResmi =
      ujian.tipe === "ujian" ||
      ujian.judul.toLowerCase().includes("pts") ||
      ujian.judul.toLowerCase().includes("pas") ||
      ujian.judul.toLowerCase().includes("ujian") ||
      ujian.judul.toLowerCase().includes("asesmen");

    if (isUjianResmi) {
      return (
        <main className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
          {/* Top Sticky Header */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs relative">
            {/* Tombol Back di Paling Kiri */}
            <div className="absolute left-3.5 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-10">
              <Link
                href="/dashboard"
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
                title="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden min-[1360px]:inline">Kembali</span>
              </Link>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 pl-11 sm:pl-12 min-[1150px]:pl-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {ujian.mapel}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Ujian Resmi • Kelas 8 SMP</span>
                  </div>
                  <h1 className="text-sm sm:text-base font-black text-[#0F172A] line-clamp-1">
                    Hasil Penilaian: {ujian.judul}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  href="/ujian"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Daftar Ujian</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-black transition shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Beranda Siswa</span>
                </Link>
              </div>
            </div>
          </header>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
            {/* Lockout Notice Banner */}
            <div className="p-5 rounded-3xl bg-[#0F172A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-slate-800">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs font-black">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-amber-300 uppercase tracking-widest flex items-center gap-2">
                    <span>Status: Ujian Resmi Telah Selesai & Terkunci</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Lembar jawaban telah dikumpulkan dan dinilai secara resmi oleh sistem sekolah. Siswa <strong>tidak dapat mengulang kembali</strong> ujian ini.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                <span className="px-3.5 py-1.5 rounded-xl bg-white/10 text-slate-200 text-xs font-bold border border-white/10">
                  {initialQuestions.length} Soal • {ujian.durasi_menit} Menit
                </span>
              </div>
            </div>

            {/* Hero Score Card - Hanya Menampilkan Nilai Saja */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-6">
              <div className="inline-flex items-center gap-2">
                {res.isPassed ? (
                  <span className="text-emerald-700 bg-emerald-50 border-emerald-200 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wide flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Tuntas / Memenuhi KKM
                  </span>
                ) : (
                  <span className="text-amber-800 bg-amber-50 border-amber-200 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wide flex items-center gap-1.5 shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Perlu Pengayaan / Remedial
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Nilai Akhir Siswa
                </div>
                <div className="flex items-baseline justify-center gap-2 pt-2">
                  <span className="text-7xl sm:text-8xl font-black text-[#0F172A] tracking-tight">
                    {res.nilaiAkhir}
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-slate-400">/ 100</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-slate-600 font-semibold pt-1">
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
                  KKM: <strong className="text-slate-900">{res.passingGrade}</strong> Poin
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
                  Bobot: <strong className="text-slate-900">5 Poin / Soal</strong>
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>+{res.bonusPoin} XP Poin Belajar Siswa Berhasil Diklaim!</span>
                </span>
              </div>

              {/* Notice Resmi Ujian */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-200 text-left flex items-start gap-3.5 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider">
                    Informasi Kerahasiaan Asesmen Ujian Resmi
                  </h4>
                  <p className="text-xs text-blue-900 leading-relaxed font-medium">
                    Sesuai ketentuan pelaksanaan ujian resmi, lembar evaluasi dan deteksi butir soal benar/salah tidak ditampilkan kepada siswa demi menjaga integritas asesmen. <strong>Benar dan salahnya butir soal hanya dapat diakses oleh Dewan Guru melalui Dashboard Guru</strong> berdasarkan nama siswa di database sekolah.
                  </p>
                </div>
              </div>

              {/* Navigation CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Kembali ke Beranda Siswa</span>
                </Link>

                <Link
                  href="/ujian"
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>Lihat Daftar Ujian Lainnya</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      );
    }

    // Filter questions based on performance tab
    const filteredQuestions = initialQuestions.filter((q) => {
      const ans = answers[q.id];
      let isCorrect = false;
      let isPartial = false;
      let isWrong = false;

      if (q.tipe_soal === "pilihan_ganda") {
        const correctOpt = q.opsi?.find((o) => o.benar);
        const chosenOpt = q.opsi?.find((o) => o.id === ans?.opsiId);
        if (ans?.isBenar !== undefined && ans.isBenar !== null) {
          isCorrect = ans.isBenar;
          isWrong = !ans.isBenar;
        } else {
          isCorrect = Boolean(chosenOpt && correctOpt && chosenOpt.id === correctOpt.id);
          isWrong = !isCorrect;
        }
      } else {
        if (ans?.isBenar === true) {
          isCorrect = true;
        } else if (
          (ans?.isBenar === null && ans?.skorDiperoleh && ans.skorDiperoleh > 0 && ans.skorDiperoleh < 5) ||
          (ans?.isBenar === null && ans?.jawabanEsai && ans.jawabanEsai.trim().length > 3)
        ) {
          isPartial = true;
        } else {
          isWrong = true;
        }
      }

      if (reviewFilter === "benar") return isCorrect;
      if (reviewFilter === "parsial") return isPartial;
      if (reviewFilter === "salah") return isWrong;
      return true;
    });

    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs relative">
          {/* Tombol Back di Paling Kiri */}
          <div className="absolute left-3.5 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-10">
            <Link
              href="/dashboard"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden min-[1360px]:inline">Kembali</span>
            </Link>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 pl-11 sm:pl-12 min-[1280px]:pl-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {ujian.mapel}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Kelas 8 SMP</span>
                </div>
                <h1 className="text-sm sm:text-base font-black text-[#0F172A] line-clamp-1">
                  Review & Pembahasan: {ujian.judul}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/ujian"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Daftar Ujian</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-black transition shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Beranda Siswa</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
          {/* Lockout Notice Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0F172A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-slate-800">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0 font-black">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-black text-amber-300 uppercase tracking-widest flex items-center gap-2">
                  <span>Status: Ujian Telah Selesai & Terkunci Permanen</span>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Lembar jawaban telah dikumpulkan dan dinilai secara permanen oleh AI dan sistem sekolah. Siswa <strong>tidak dapat mengulang kembali</strong> ulangan ini. Silakan pelajari pembahasan lengkap setiap nomor soal di bawah ini.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
              <span className="px-3.5 py-1.5 rounded-xl bg-white/10 text-slate-200 text-xs font-bold border border-white/10">
                20 Soal • 30 Menit
              </span>
            </div>
          </div>

          {/* Hero Score & Performance Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
            {/* Score Big Display */}
            <div className="lg:col-span-1 text-center lg:text-left space-y-3 lg:border-r lg:border-slate-100 lg:pr-8">
              <div className="inline-flex items-center gap-2">
                {res.isPassed ? (
                  <span className="text-emerald-700 bg-emerald-50 border-emerald-200 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Tuntas / Memenuhi KKM
                  </span>
                ) : (
                  <span className="text-amber-800 bg-amber-50 border-amber-200 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Perlu Pengayaan / Remedial
                  </span>
                )}
              </div>

              <div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Nilai Akhir Siswa
                </div>
                <div className="flex items-baseline justify-center lg:justify-start gap-2 pt-1">
                  <span className="text-6xl font-black text-[#0F172A] tracking-tight">
                    {res.nilaiAkhir}
                  </span>
                  <span className="text-xl font-bold text-slate-400">/ 100</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                KKM: <strong className="text-slate-800">{res.passingGrade}</strong> Poin • Bobot: <strong className="text-slate-800">5 Poin / Soal</strong>
              </div>

              <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs font-extrabold text-amber-700">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+{res.bonusPoin} XP Poin Belajar Siswa Berhasil Diklaim!</span>
              </div>
            </div>

            {/* Metrics Breakdown (4 Stat Cards) */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Soal
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {res.totalQuestions}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Maksimal 100 Poin
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  Jawaban Benar
                </div>
                <div className="text-2xl font-black text-emerald-800">
                  {res.correctCount}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold">
                  +{res.correctCount * 5} Poin
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                  Mendekati Benar
                </div>
                <div className="text-2xl font-black text-amber-800">
                  {res.partialCount}
                </div>
                <div className="text-[11px] text-amber-700 font-bold">
                  +{res.partialCount * 2.5} Poin (Esai AI)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
                <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                  Jawaban Salah
                </div>
                <div className="text-2xl font-black text-rose-800">
                  {res.wrongCount}
                </div>
                <div className="text-[11px] text-rose-600 font-bold">
                  0 Poin
                </div>
              </div>
            </div>
          </div>

          {/* Quick Jump Palette & Filter Pills */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-[#0F172A] tracking-tight">
                  Navigasi 20 Soal & Pembahasan
                </h3>
                <p className="text-xs text-slate-500">
                  Klik nomor soal di bawah untuk langsung menuju butir soal dan penjelasan konsepnya.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setReviewFilter("semua")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    reviewFilter === "semua"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Semua ({initialQuestions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter("benar")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                    reviewFilter === "benar"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Benar ({res.correctCount})</span>
                </button>
                {res.partialCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setReviewFilter("parsial")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                      reviewFilter === "parsial"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-amber-700 hover:bg-amber-50"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mendekati ({res.partialCount})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setReviewFilter("salah")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                    reviewFilter === "salah"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-rose-700 hover:bg-rose-50"
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Salah ({res.wrongCount})</span>
                </button>
              </div>
            </div>

            {/* 20 Question Numbers Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-20 gap-2 pt-2">
              {initialQuestions.map((q, idx) => {
                const ans = answers[q.id];
                let isCorrect = false;
                let isPartial = false;
                if (q.tipe_soal === "pilihan_ganda") {
                  const correctOpt =
                    q.opsi?.find((o) => o.benar) ||
                    (Boolean(q.kunci_jawaban)
                      ? q.opsi?.find(
                          (o) =>
                            o.teks_opsi?.trim().toLowerCase() === q.kunci_jawaban?.trim().toLowerCase()
                        )
                      : undefined) ||
                    q.opsi?.[0];
                  const chosenOpt = q.opsi?.find((o) => o.id === ans?.opsiId);
                  isCorrect =
                    ans?.isBenar !== undefined && ans.isBenar !== null
                      ? ans.isBenar
                      : Boolean(chosenOpt && correctOpt && chosenOpt.id === correctOpt.id);
                } else {
                  if (ans?.isBenar === true) isCorrect = true;
                  else if (
                    (ans?.isBenar === null && ans?.skorDiperoleh && ans.skorDiperoleh > 0 && ans.skorDiperoleh < 5) ||
                    (ans?.isBenar === null && ans?.jawabanEsai && ans.jawabanEsai.trim().length > 3)
                  ) {
                    isPartial = true;
                  }
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`review-q-${idx + 1}`);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className={`h-9 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center border shadow-2xs hover:scale-105 active:scale-95 ${
                      isCorrect
                        ? "bg-emerald-500 text-white border-emerald-600"
                        : isPartial
                        ? "bg-amber-500 text-white border-amber-600"
                        : "bg-rose-500 text-white border-rose-600"
                    }`}
                    title={`Soal #${idx + 1}: ${
                      isCorrect
                        ? "Benar (+5 Poin)"
                        : isPartial
                        ? "Mendekati Benar (+2.5 Poin)"
                        : "Salah (0 Poin)"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Question Review Cards */}
          <div className="space-y-6">
            {filteredQuestions.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">Tidak ada butir soal dalam filter ini</h4>
                <p className="text-xs text-slate-400">Pilih filter "Semua" untuk melihat keseluruhan 20 nomor soal.</p>
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const originalIdx = initialQuestions.findIndex((orig) => orig.id === q.id);
                const qNum = originalIdx + 1;
                const ans = answers[q.id];

                let isCorrect = false;
                let isPartial = false;
                let isWrong = false;
                let earnedScore = 0;

                const correctOpt =
                  q.opsi?.find((o) => o.benar) ||
                  (Boolean(q.kunci_jawaban)
                    ? q.opsi?.find(
                        (o) =>
                          o.teks_opsi?.trim().toLowerCase() === q.kunci_jawaban?.trim().toLowerCase()
                      )
                    : undefined) ||
                  q.opsi?.[0];

                if (q.tipe_soal === "pilihan_ganda") {
                  const chosenOpt = q.opsi?.find((o) => o.id === ans?.opsiId);

                  if (ans?.isBenar !== undefined && ans.isBenar !== null) {
                    isCorrect = ans.isBenar;
                    isWrong = !ans.isBenar;
                    earnedScore = isCorrect ? (ans.skorDiperoleh ?? 5) : 0;
                  } else {
                    isCorrect = Boolean(chosenOpt && correctOpt && chosenOpt.id === correctOpt.id);
                    isWrong = !isCorrect;
                    earnedScore = isCorrect ? 5 : 0;
                  }
                } else {
                  if (ans?.isBenar === true) {
                    isCorrect = true;
                    earnedScore = ans.skorDiperoleh ?? 5;
                  } else if (
                    ans?.isBenar === null &&
                    ans?.skorDiperoleh &&
                    ans.skorDiperoleh > 0 &&
                    ans.skorDiperoleh < 5
                  ) {
                    isPartial = true;
                    earnedScore = ans.skorDiperoleh;
                  } else if (ans?.isBenar === null && ans?.jawabanEsai && ans.jawabanEsai.trim().length > 3) {
                    isPartial = true;
                    earnedScore = 2.5;
                  } else {
                    isWrong = true;
                    earnedScore = 0;
                  }
                }

                const isUnanswered = !ans?.opsiId && (!ans?.jawabanEsai || ans.jawabanEsai.trim() === "");

                return (
                  <div
                    key={q.id}
                    id={`review-q-${qNum}`}
                    className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5 scroll-mt-24 transition"
                  >
                    {/* Header Soal */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          #{qNum}
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {q.tipe_soal === "pilihan_ganda" ? "Pilihan Ganda" : "Esai / Uraian"} • Bobot 5 Poin
                        </span>
                      </div>

                      {/* Status Badge */}
                      {isUnanswered ? (
                        <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-extrabold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Tidak Dijawab (0 / 5 Poin)</span>
                        </span>
                      ) : isCorrect ? (
                        <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black flex items-center gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Benar (+{earnedScore} Poin)</span>
                        </span>
                      ) : isPartial ? (
                        <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-black flex items-center gap-1.5 shadow-2xs">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Mendekati Benar (+{earnedScore} Poin) • Koreksi AI</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-black flex items-center gap-1.5 shadow-2xs">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Salah (0 / 5 Poin)</span>
                        </span>
                      )}
                    </div>

                    {/* Pertanyaan */}
                    <div className="text-slate-900 font-semibold text-base sm:text-lg leading-relaxed font-sans">
                      <MarkdownRenderer content={q.pertanyaan} />
                    </div>

                    {/* Review Pilihan Ganda */}
                    {q.tipe_soal === "pilihan_ganda" ? (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            PILIHAN JAWABAN & ANALISIS
                          </div>
                          {isUnanswered && correctOpt && (
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                              Kunci Jawaban: Opsi {String.fromCharCode(65 + (q.opsi?.findIndex((o) => o.id === correctOpt.id) ?? 0))}
                            </span>
                          )}
                        </div>

                        {/* Jika soal tidak dijawab, tampilkan banner kunci jawaban untuk pembelajaran siswa */}
                        {isUnanswered && (
                          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                            <div className="flex items-center gap-2 text-amber-950 font-bold">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Soal ini tidak dijawab. Kunci jawaban rujukan pembelajaran telah ditandai di bawah ini:</span>
                            </div>
                            {correctOpt && (
                              <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs shrink-0 shadow-2xs flex items-center gap-1">
                                <CheckCheck className="w-3.5 h-3.5 text-white" />
                                <span>Kunci Benar: Opsi {String.fromCharCode(65 + (q.opsi?.findIndex(o => o.id === correctOpt.id) ?? 0))}</span>
                              </span>
                            )}
                          </div>
                        )}

                        <div className="space-y-2.5">
                          {q.opsi?.map((opsi, optIdx) => {
                            const letter = String.fromCharCode(65 + optIdx);
                            const isSelected = ans?.opsiId === opsi.id;
                            const isCorrectKey =
                              opsi.benar === true ||
                              (correctOpt ? correctOpt.id === opsi.id : false) ||
                              (Boolean(q.kunci_jawaban) &&
                                opsi.teks_opsi?.trim().toLowerCase() === q.kunci_jawaban?.trim().toLowerCase());

                            let cardStyle = "bg-slate-50/70 border-slate-200/90 text-slate-600";
                            let badge = null;

                            if (isSelected && isCorrectKey) {
                              cardStyle =
                                "bg-emerald-50/90 border-2 border-emerald-500 text-emerald-950 font-semibold shadow-xs ring-1 ring-emerald-500/20";
                              badge = (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-black flex items-center gap-1 shadow-xs shrink-0">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Pilihan Anda (Benar)</span>
                                </span>
                              );
                            } else if (isSelected && !isCorrectKey) {
                              cardStyle =
                                "bg-rose-50/90 border-2 border-rose-400 text-rose-950 font-semibold shadow-xs ring-1 ring-rose-400/20";
                              badge = (
                                <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-black flex items-center gap-1 shadow-xs shrink-0">
                                  <X className="w-3.5 h-3.5" />
                                  <span>Pilihan Anda (Salah)</span>
                                </span>
                              );
                            } else if (!isSelected && isCorrectKey) {
                              cardStyle =
                                "bg-emerald-50/90 border-2 border-emerald-500 text-emerald-950 font-semibold shadow-xs ring-1 ring-emerald-500/20";
                              badge = (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-black flex items-center gap-1 shadow-xs shrink-0">
                                  <CheckCheck className="w-3.5 h-3.5 text-white" />
                                  <span>Kunci Jawaban yang Benar</span>
                                </span>
                              );
                            }

                            return (
                              <div
                                key={opsi.id}
                                className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm transition-all ${cardStyle}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                      isSelected && isCorrectKey
                                        ? "bg-emerald-600 text-white"
                                        : isSelected && !isCorrectKey
                                        ? "bg-rose-600 text-white"
                                        : isCorrectKey
                                        ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600/30"
                                        : "bg-slate-200 text-slate-600"
                                    }`}
                                  >
                                    {letter}
                                  </span>
                                  <span className="leading-relaxed">{opsi.teks_opsi}</span>
                                </div>
                                {badge}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* Review Esai */
                      <div className="space-y-3 pt-1">
                        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          ANALISIS JAWABAN ESAI
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Jawaban yang Diserahkan Siswa:
                          </span>
                          <div className="text-xs sm:text-sm text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                            {ans?.jawabanEsai?.trim() || (
                              <em className="text-slate-400">Tidak ada jawaban yang diisi (Tidak Dijawab).</em>
                            )}
                          </div>
                        </div>

                        {/* Kunci Jawaban Rujukan Pembelajaran selalu diberikan */}
                        <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-300 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Kunci Jawaban Rujukan Pembelajaran:</span>
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black">
                              Rujukan Benar
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-emerald-950 font-semibold leading-relaxed">
                            {q.kunci_jawaban || "Konsep jawaban rujukan mengacu pada materi inti capaian pembelajaran kurikulum."}
                          </div>
                        </div>

                        {ans?.koreksiAi && (
                          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-800 uppercase tracking-wider">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>Analisis & Koreksi AI Guru:</span>
                            </div>
                            <div className="text-xs text-amber-950 font-medium leading-relaxed">
                              {ans.koreksiAi}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Kotak Pembahasan & Analisis Konsep */}
                    <div className="mt-4 p-4.5 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border-l-4 border-l-indigo-600 border border-indigo-100 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-900 font-black text-xs sm:text-sm">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>Pembahasan & Penjelasan Konsep</span>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {ujian.mapel}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans pt-1">
                        <MarkdownRenderer
                          content={
                            q.pembahasan && q.pembahasan.trim().length > 0
                              ? q.pembahasan
                              : q.tipe_soal === "pilihan_ganda" && correctOpt
                              ? `Kunci jawaban yang tepat adalah opsi **${String.fromCharCode(
                                  65 + (q.opsi?.findIndex((o) => o.id === correctOpt.id) ?? 0)
                                )}: "${correctOpt.teks_opsi}"**. Konsep ini selaras dengan capaian pembelajaran materi ${ujian.judul} pada Kurikulum Merdeka.`
                              : q.kunci_jawaban
                              ? `Kunci jawaban rujukan materi: **${q.kunci_jawaban}**.`
                              : `Penjelasan konsep pada asesmen ini mengacu pada pemahaman capaian pembelajaran kurikulum ${ujian.mapel}.`
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Lockout & Return Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-base font-extrabold text-[#0F172A]">
              Lembar Jawaban Telah Diarsipkan
            </div>
            <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
              Hasil penilaian telah tersinkronisasi ke Dashboard Guru dan rekap rapor Anda. Ulangan ini telah terkunci dan tidak dapat diulang kembali. Silakan kembali ke beranda untuk mempelajari materi berikutnya.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Kembali ke Beranda Belajar</span>
              </Link>
              <Link
                href="/ujian"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Lihat Daftar Ujian Lainnya</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // VIEW 3: LIVE ACTIVE EXAM ROOM
  // ==========================================
  const getSubjectMeta = (mapel: string) => {
    const m = (mapel || "").toLowerCase();
    if (m.includes("matematika") || m.includes("math")) {
      return {
        tag: "MTK",
        badgeColor: "bg-indigo-600 text-white",
        lightBg: "bg-indigo-50 border-indigo-200 text-indigo-700",
        barGradient: "from-indigo-600 via-indigo-500 to-sky-400",
      };
    }
    if (m.includes("indonesia")) {
      return {
        tag: "IND",
        badgeColor: "bg-emerald-600 text-white",
        lightBg: "bg-emerald-50 border-emerald-200 text-emerald-700",
        barGradient: "from-emerald-600 via-teal-500 to-cyan-400",
      };
    }
    if (m.includes("inggris") || m.includes("english")) {
      return {
        tag: "ENG",
        badgeColor: "bg-sky-600 text-white",
        lightBg: "bg-sky-50 border-sky-200 text-sky-700",
        barGradient: "from-sky-600 via-blue-500 to-indigo-400",
      };
    }
    return {
      tag: "EXAM",
      badgeColor: "bg-slate-900 text-white",
      lightBg: "bg-slate-100 border-slate-200 text-slate-700",
      barGradient: "from-slate-800 via-slate-700 to-slate-500",
    };
  };

  const subjectMeta = getSubjectMeta(ujian.mapel);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      {/* Sticky Exam Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3 gap-2">
          {/* Left: Brand/Mapel badge + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl ${subjectMeta.badgeColor} flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-xs tracking-wider`}
            >
              {subjectMeta.tag}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-black text-[#0F172A] truncate max-w-[150px] sm:max-w-xs md:max-w-md">
                  {ujian.judul}
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                  {ujian.mapel}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 hidden sm:flex pt-0.5">
                <span className="font-semibold text-slate-700">
                  Soal {currentIndex + 1} dari {initialQuestions.length}
                </span>
                <span>•</span>
                <span>
                  KKM: <strong className="text-slate-800">{ujian.passing_grade || 75}</strong>
                </span>
                <span>•</span>
                <span className="text-slate-400">Kelas 8 SMP</span>
              </div>
            </div>
          </div>

          {/* Right: Actions, Sokratik AI & Timer */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Auto save indicator (Tablet / Desktop) */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/60">
              {isAutoSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Menyimpan...</span>
                </>
              ) : lastSavedTime ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-slate-600">Tersimpan {lastSavedTime}</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">Auto-Save Aktif</span>
                </>
              )}
            </div>


            {/* Fullscreen Toggle Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer"
              title={isFullscreen ? "Keluar Layar Penuh" : "Mode Layar Penuh (Fullscreen)"}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden md:inline">Normal</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden md:inline">Layar Penuh</span>
                </>
              )}
            </button>

            {/* Countdown Badge */}
            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-black tracking-wider shadow-inner transition duration-300 border ${
                isTimerWarning
                  ? "bg-rose-600 text-white border-rose-700 animate-pulse"
                  : "bg-[#0F172A] text-amber-400 border-slate-800"
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${isTimerWarning ? "text-white" : "text-amber-400"}`} />
              <span>{formatTime(remainingSeconds)}</span>
            </div>

            {/* Kumpulkan Ujian Button */}
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-xs hover:shadow-sm cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kumpulkan Ujian</span>
              <span className="sm:hidden">Kumpul</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Bar (< sm screens only): Socratic AI + Nomor Soal + Fullscreen */}
        <div className="sm:hidden flex items-center justify-between px-3.5 py-2 bg-slate-50/95 border-t border-slate-200 text-xs gap-2">
          {/* Quick Palette Trigger */}
          <button
            type="button"
            onClick={() => setIsMobilePaletteOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-extrabold text-slate-800 shadow-2xs text-[11px]"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>
              Soal {currentIndex + 1}/{initialQuestions.length}
            </span>
          </button>



          {/* Mobile Right Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600"
              title="Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Exam Content Grid */}
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT / CENTER: Question & Answer Workspace (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {currentQuestion ? (
            <div className="rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] flex-1 flex flex-col justify-between relative overflow-hidden">
              {/* Top Accent Gradient Line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${subjectMeta.barGradient}`}
              />

              <div className="space-y-6 flex-1 flex flex-col">
                {/* Question Text with Typography & KaTeX rendering */}
                <div className="text-slate-900 text-base sm:text-lg font-semibold leading-relaxed tracking-normal font-sans">
                  <MarkdownRenderer content={currentQuestion.pertanyaan} />
                </div>

                {/* Options Selector / Essay Field */}
                {currentQuestion.tipe_soal === "pilihan_ganda" ? (
                  <div className="space-y-3 pt-2 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        PILIHAN JAWABAN
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                        Pilih salah satu jawaban yang paling tepat
                      </span>
                    </div>

                    <div className="space-y-3">
                      {currentQuestion.opsi?.map((opsi, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isSelected = answers[currentQuestion.id]?.opsiId === opsi.id;

                        return (
                          <button
                            key={opsi.id}
                            onClick={() => handleSelectOption(currentQuestion.id, opsi.id)}
                            className={`group w-full text-left p-4 sm:p-4.5 rounded-2xl border transition-all duration-150 flex items-start gap-4 cursor-pointer relative ${
                              isSelected
                                ? "bg-indigo-50/80 border-2 border-indigo-600 shadow-sm shadow-indigo-100 ring-2 ring-indigo-500/20"
                                : "bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-xs"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                                isSelected
                                  ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-600 ring-offset-1"
                                  : "bg-slate-100 border border-slate-200/80 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-200"
                              }`}
                            >
                              {letter}
                            </div>
                            <div
                              className={`text-sm sm:text-base leading-snug flex-1 pt-1 ${
                                isSelected ? "text-indigo-950 font-bold" : "text-slate-800 font-medium"
                              }`}
                            >
                              {opsi.teks_opsi}
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs ml-auto self-center animate-in zoom-in-50 duration-150">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2 flex-1">
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Jawaban Esai Anda:
                    </label>
                    <textarea
                      rows={6}
                      value={answers[currentQuestion.id]?.jawabanEsai || ""}
                      onChange={(e) => handleEssayChange(currentQuestion.id, e.target.value)}
                      placeholder="Tuliskan jawaban lengkap dan langkah penyelesaian Anda di sini..."
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>
                )}
              </div>

              {/* Navigation Bar (Prev / Next) */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-5 gap-3 mt-6">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Soal Sebelumnya</span>
                  <span className="sm:hidden">Sebelumnya</span>
                </button>

                <div className="flex items-center gap-2 sm:gap-2.5">
                  {/* Tandai Ragu Button */}
                  <button
                    type="button"
                    onClick={() => toggleFlagQuestion(currentQuestion.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 sm:px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                      flaggedQuestions.has(currentQuestion.id)
                        ? "bg-amber-100 text-amber-900 border border-amber-300 font-extrabold shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200"
                    }`}
                    title="Tandai ragu untuk ditinjau nanti"
                  >
                    <Flag
                      className={`w-3.5 h-3.5 ${
                        flaggedQuestions.has(currentQuestion.id)
                          ? "text-amber-700 fill-amber-500"
                          : "text-slate-400"
                      }`}
                    />
                    <span className="hidden sm:inline">
                      {flaggedQuestions.has(currentQuestion.id) ? "Ditandai Ragu" : "Tandai Ragu"}
                    </span>
                  </button>

                  <button
                    onClick={saveDraftAnswers}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    title="Simpan Jawaban Draft"
                  >
                    <Save className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Simpan Draft</span>
                  </button>

                  {currentIndex < initialQuestions.length - 1 ? (
                    <button
                      onClick={() =>
                        setCurrentIndex((prev) => Math.min(initialQuestions.length - 1, prev + 1))
                      }
                      className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer shrink-0"
                    >
                      <span className="hidden sm:inline">Soal Berikutnya</span>
                      <span className="sm:hidden">Berikutnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsConfirmModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer shrink-0"
                    >
                      <span className="hidden sm:inline">Selesai & Kumpulkan</span>
                      <span className="sm:hidden">Selesai</span>
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl p-12 text-center bg-white border border-slate-200">
              <p className="text-xs text-slate-500">Soal tidak ditemukan.</p>
            </div>
          )}
        </div>

        {/* RIGHT: Question Palette Navigation & Sokratik AI (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className="rounded-3xl p-5 sm:p-6 bg-white border border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] space-y-5 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                <span>Navigasi Nomor Soal</span>
              </h3>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {answeredCount}/{initialQuestions.length} Terjawab
              </span>
            </div>

            {/* Color Legend */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-600 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-indigo-600" />
                <span>Dijawab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-400" />
                <span>Ragu-ragu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-200" />
                <span>Belum</span>
              </div>
            </div>

            {/* Grid Palette */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 pt-1">
              {initialQuestions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const ans = answers[q.id];
                const isAnswered = Boolean(
                  ans?.opsiId || (ans?.jawabanEsai && ans.jawabanEsai.trim().length > 0)
                );
                const isFlagged = flaggedQuestions.has(q.id);

                let bgStyle =
                  "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200";
                if (isFlagged) {
                  bgStyle = "bg-amber-400 text-slate-950 font-black border-amber-500 shadow-2xs";
                } else if (isAnswered) {
                  bgStyle = "bg-indigo-600 text-white font-black border-indigo-700 shadow-2xs";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl font-black text-xs flex items-center justify-center relative transition border cursor-pointer ${bgStyle} ${
                      isCurrent
                        ? "ring-2 ring-[#0F172A] ring-offset-2 scale-105 shadow-sm"
                        : "hover:scale-102"
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Summary Progress Bar */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Kelengkapan Jawaban</span>
                <span className="text-indigo-600 font-extrabold">
                  {Math.round((answeredCount / (initialQuestions.length || 1)) * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${(answeredCount / (initialQuestions.length || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card Bantuan Sokratik (Di Bawah Card Nomor Ujian, Simetris dengan Card Soal) */}
          <div
            id="sokratik-card"
            className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-amber-50/90 via-orange-50/30 to-white border border-amber-200/90 shadow-[0_4px_24px_-4px_rgba(245,158,11,0.12)] flex-1 flex flex-col justify-between space-y-4 transition-all duration-200"
          >
            {!isSocraticDrawerOpen ? (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs font-black">
                        <Sparkles className="w-4 h-4 text-slate-900" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-[#0F172A] uppercase tracking-wider">
                          Bantuan Sokratik AI
                        </h4>
                        <span className="text-[11px] text-amber-800 font-extrabold block">
                          Panduan Berpikir Mandiri
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      Tutor AI
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Buntu menyelesaikan butir soal ini? Dapatkan bimbingan penalaran mandiri dan pemantik konsep untuk membantu analisismu.
                  </p>
                </div>

                <div className="space-y-3 pt-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => setIsSocraticDrawerOpen(true)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition shadow-sm hover:shadow-md cursor-pointer group"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Buka Bantuan Sokratik</span>
                  </button>

                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSocraticDrawerOpen(true);
                        handleSendSocratic("Beri saya petunjuk konsep inti untuk soal ini");
                      }}
                      className="p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 text-xs font-bold text-amber-950 transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <span>💡</span>
                      <span className="truncate">Petunjuk Konsep</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSocraticDrawerOpen(true);
                        handleSendSocratic("Bagaimana langkah awal menganalisis soal ini?");
                      }}
                      className="p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 text-xs font-bold text-amber-950 transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <span>🔍</span>
                      <span className="truncate">Langkah Awal</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between space-y-3.5">
                {/* Header saat Chat Terbuka */}
                <div className="flex items-center justify-between border-b border-amber-200/70 pb-3 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs font-black">
                      <Sparkles className="w-4 h-4 text-slate-900" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-[#0F172A] uppercase tracking-wider">
                        Bantuan Sokratik
                      </h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSocraticDrawerOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-amber-100/60 transition cursor-pointer"
                    title="Tutup Chat Sokratik"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages scroll box - expanded width and flexible height matching question card */}
                <div className="flex-1 min-h-[300px] max-h-[480px] overflow-y-auto space-y-3 p-4 rounded-2xl bg-white/95 border border-amber-200/70 text-xs sm:text-sm shadow-inner custom-scrollbar">
                  {/* Default Welcome */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                      AI
                    </div>
                    <div className="flex-1 p-3.5 rounded-2xl rounded-tl-none bg-slate-100 border border-slate-200/80 text-slate-800 text-xs sm:text-[13px] leading-relaxed max-w-[94%]">
                      Halo! Tanyakan bagian konsep atau langkah yang membuatmu bingung agar kita telaah bersama.
                    </div>
                  </div>

                  {/* Question Chat History */}
                  {(socraticChat[currentQuestion?.id || ""] || []).map((msg, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2.5 ${
                        msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${
                          msg.sender === "user"
                            ? "bg-[#0F172A] text-white"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {msg.sender === "user" ? "S" : "AI"}
                      </div>
                      <div
                        className={`flex-1 p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed max-w-[94%] ${
                          msg.sender === "user"
                            ? "rounded-tr-none bg-indigo-600 text-white shadow-2xs"
                            : "rounded-tl-none bg-slate-100 border border-slate-200/80 text-slate-800"
                        }`}
                      >
                        <MarkdownRenderer content={msg.text} />
                      </div>
                    </div>
                  ))}

                  {isAskingSocratic && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        AI
                      </div>
                      <div className="p-3 rounded-2xl rounded-tl-none bg-slate-100 border border-slate-200/80 text-slate-500 text-xs flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                        <span>Sedang merumuskan panduan...</span>
                      </div>
                    </div>
                  )}
                  <div ref={socraticChatEndRef} />
                </div>

                {/* Quick Preset Action Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 custom-scrollbar shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSendSocratic("Beri saya petunjuk konsep inti untuk soal ini")}
                    disabled={isAskingSocratic}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 text-amber-950 text-xs font-bold shrink-0 transition shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    💡 Petunjuk Konsep
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendSocratic("Bagaimana langkah awal menganalisis soal ini?")}
                    disabled={isAskingSocratic}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 text-amber-950 text-xs font-bold shrink-0 transition shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    🔍 Langkah Awal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendSocratic("Jelaskan makna istilah atau kata kunci pada soal ini")}
                    disabled={isAskingSocratic}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 text-amber-950 text-xs font-bold shrink-0 transition shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    ❓ Kata Kunci
                  </button>
                </div>

                {/* Chat Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendSocratic();
                  }}
                  className="flex items-center gap-2 pt-1 shrink-0"
                >
                  <input
                    type="text"
                    value={socraticInput}
                    onChange={(e) => setSocraticInput(e.target.value)}
                    placeholder="Tulis pertanyaanmu di sini..."
                    disabled={isAskingSocratic}
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white shadow-2xs transition"
                  />
                  <button
                    type="submit"
                    disabled={isAskingSocratic || !socraticInput.trim()}
                    className="p-2.5 bg-[#0F172A] hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl transition cursor-pointer shadow-xs shrink-0"
                    title="Kirim Pertanyaan"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Question Palette Modal (Quick Navigation on HP / Tablet) */}
      {isMobilePaletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setIsMobilePaletteOpen(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#0F172A]">Navigasi Nomor Soal</span>
                <span className="text-xs text-slate-500 font-bold">({answeredCount}/{initialQuestions.length} Terjawab)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobilePaletteOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Color Legend */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-600 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-blue-600" />
                <span>Dijawab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-400" />
                <span>Ragu-ragu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-200" />
                <span>Belum</span>
              </div>
            </div>

            {/* Grid Palette */}
            <div className="grid grid-cols-5 gap-2.5 pt-2">
              {initialQuestions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const ans = answers[q.id];
                const isAnswered = Boolean(
                  ans?.opsiId || (ans?.jawabanEsai && ans.jawabanEsai.trim().length > 0)
                );
                const isFlagged = flaggedQuestions.has(q.id);

                let bgStyle = "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200";
                if (isFlagged) {
                  bgStyle = "bg-amber-400 text-slate-950 font-black border-amber-500 shadow-xs";
                } else if (isAnswered) {
                  bgStyle = "bg-blue-600 text-white font-black border-blue-700 shadow-xs";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsMobilePaletteOpen(false);
                    }}
                    className={`h-11 rounded-xl font-bold text-sm flex items-center justify-center relative transition border cursor-pointer ${bgStyle} ${
                      isCurrent ? "ring-2 ring-slate-900 ring-offset-2 scale-105" : ""
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Submission Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="max-w-md w-full saas-card rounded-3xl p-6 sm:p-7 bg-white border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0F172A]">Kumpulkan Lembar Ujian?</h3>
                <p className="text-xs text-slate-500">Pastikan Anda telah memeriksa semua jawaban.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Total Soal:</span>
                <strong>{initialQuestions.length} Soal</strong>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Sudah Dijawab:</span>
                <strong>{answeredCount} Soal</strong>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>Belum Dijawab:</span>
                <strong>{initialQuestions.length - answeredCount} Soal</strong>
              </div>
              {flaggedQuestions.size > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Ditandai Ragu-ragu:</span>
                  <strong>{flaggedQuestions.size} Soal</strong>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Periksa Kembali
              </button>

              <button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menilai...</span>
                  </>
                ) : (
                  <span>Ya, Kumpulkan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}


    </main>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import MarkdownRenderer from "../materi/MarkdownRenderer";
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, X, ShieldAlert } from "lucide-react";
import {
  getStoredAiSettings,
  getQuizTokensRemaining,
  decrementQuizToken,
  AiGuruSettings,
} from "@/lib/ai-config";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface TutorChatProps {
  sesiId?: string;
  soalId?: string;
  quizId?: string;
  materiJudul?: string;
  materiKonten?: string;
  mode?: "kelas" | "kuis";
  onClose?: () => void;
  className?: string;
}

export default function TutorChat({
  sesiId,
  soalId,
  quizId,
  materiJudul,
  materiKonten,
  mode = "kelas",
  onClose,
  className = "",
}: TutorChatProps) {
  const [aiSettings, setAiSettings] = useState<AiGuruSettings>(() => getStoredAiSettings());
  const activeQuizId = quizId || sesiId || "current_quiz";
  const maxQuizTokens = aiSettings.kuis?.tokensPerQuiz || 5;
  const maxClassTokens = aiSettings.kelas?.dailyTokens || 20;

  const [quizTokensLeft, setQuizTokensLeft] = useState<number>(() => {
    if (mode === "kuis") {
      return getQuizTokensRemaining(activeQuizId, maxQuizTokens);
    }
    return maxQuizTokens;
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        mode === "kuis"
          ? "Halo! Saya **thinksy Socratic AI Tutor** (Mode Kuis) 🤖🦉. Saya siap membantumu memahami logika konsep & rumus tanpa memberikan bocoran jawaban langsung. Ingat, kuota pertanyaan dalam kuis dibatasi ya!"
          : "Halo! Saya **thinksy Socratic AI Tutor** 🤖🦉. Ada konsep atau soal yang ingin kita bedah bersama? Saya akan membantumu menalar dan memahaminya langkah demi langkah secara mendalam!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingQuota, setRemainingQuota] = useState<number>(() => {
    return mode === "kuis" ? quizTokensLeft : maxClassTokens;
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync settings when teacher updates in teacher dashboard
  useEffect(() => {
    const handleSettingsChange = (e: any) => {
      const updated = e.detail || getStoredAiSettings();
      setAiSettings(updated);
    };
    window.addEventListener("thinksy_ai_settings_change", handleSettingsChange);
    return () => window.removeEventListener("thinksy_ai_settings_change", handleSettingsChange);
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const isQuizExhausted = mode === "kuis" && quizTokensLeft <= 0;
  const isAiDisabled = mode === "kuis" ? !aiSettings.kuis?.enabled : !aiSettings.kelas?.enabled;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || isQuizExhausted || isAiDisabled) return;

    const userMessageText = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessageText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    // If in quiz mode, decrement quiz token
    if (mode === "kuis") {
      const newTokens = decrementQuizToken(activeQuizId, maxQuizTokens);
      setQuizTokensLeft(newTokens);
      setRemainingQuota(newTokens);
    }

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sesiId,
          soalId,
          materiJudul,
          materiKonten,
          message: userMessageText,
          history,
          mode,
          strictAntiCheat: mode === "kuis" ? aiSettings.kuis?.strictAntiCheat : false,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mendapatkan respon dari Tutor AI.");
      }

      if (mode !== "kuis" && typeof data.remainingQuota === "number") {
        setRemainingQuota(data.remainingQuota);
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden text-slate-900 ${className}`}>
      {/* Header Widget */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#193446] text-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 p-1 flex items-center justify-center shrink-0 border border-white/15 shadow-inner">
            <img src="/logo.png" alt="thinksy AI" className="w-full h-full object-contain drop-shadow-xs" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#E9C77B] flex items-center gap-1 tracking-tight">
              <Sparkles className="w-3 h-3 text-[#E9C77B] animate-spin" style={{ animationDuration: "3s" }} />
              thinksy AI {mode === "kuis" && <span className="text-[10px] text-amber-200 font-bold ml-1 px-1.5 py-0.2 rounded-md bg-amber-500/30 border border-amber-400/40">KUIS</span>}
            </h3>
            <p className="text-[10px] text-slate-300 font-medium">
              {mode === "kuis" ? "Bimbingan Sokratik Kuis • Anti-Kunci Jawaban" : "Panduan Step-by-Step Tanpa Kunci Jawaban"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mode === "kuis" ? (
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                quizTokensLeft <= 1
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
              }`}
              title="Kuota bantuan AI dibatasi selama mengerjakan kuis"
            >
              Kuota Kuis: {quizTokensLeft}/{maxQuizTokens}
            </span>
          ) : (
            <span className="text-[10px] font-semibold bg-white/10 px-2.5 py-1 rounded-full text-slate-200 border border-white/10">
              Sisa Kuota: {remainingQuota !== null ? `${remainingQuota}/${maxClassTokens}` : `${maxClassTokens}/${maxClassTokens}`}
            </span>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Tutup Obrolan"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[480px] bg-slate-50/60 custom-scrollbar text-xs">
        {/* Banner Status AI Dimatikan oleh Guru */}
        {isAiDisabled && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2.5 shadow-2xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-[11px] leading-relaxed">
              <strong>Bantuan AI Dinonaktifkan:</strong> Guru pengampu sedang menonaktifkan fitur asisten AI untuk sesi {mode === "kuis" ? "kuis" : "kelas"} ini.
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar Icon */}
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold overflow-hidden shadow-xs ${
                msg.role === "user"
                  ? "bg-[#193446] text-[#E9C77B]"
                  : "bg-white border border-slate-200 p-0.5"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <img src="/logo.png" alt="AI" className="w-full h-full object-contain" />
              )}
            </div>

            {/* Bubble Container */}
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 shadow-2xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#193446] text-white rounded-tr-xs font-medium [&_*]:!text-white"
                  : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-2xs"
              }`}
            >
              {msg.role === "user" ? (
                <p className="whitespace-pre-wrap text-white font-medium">{msg.content}</p>
              ) : (
                <MarkdownRenderer content={msg.content} isCompact />
              )}
            </div>
          </div>
        ))}

        {/* Loading State Bubble */}
        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="AI" className="w-full h-full object-contain" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#193446]" />
              <span>Tutor AI sedang menalar & menyusun petunjuk sokratik...</span>
            </div>
          </div>
        )}

        {/* Token Exhausted Notice in Quiz Mode */}
        {isQuizExhausted && (
          <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2 shadow-2xs">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Batas Bantuan AI Kuis Tercapai</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Kamu telah menggunakan {maxQuizTokens}/{maxQuizTokens} token bantuan AI untuk kuis ini. Tunjukkan kemampuan terbaikmu menyelesaikan sisa soal secara mandiri! Semangat! ✨
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isAiDisabled
              ? "Bantuan AI dinonaktifkan guru"
              : isQuizExhausted
              ? "Batas token AI kuis habis (0 tersisa)"
              : "Tanyakan hal yang belum kamu pahami..."
          }
          disabled={loading || isQuizExhausted || isAiDisabled}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#193446] focus:border-transparent bg-slate-50/50 disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || isQuizExhausted || isAiDisabled}
          className="p-2.5 rounded-xl bg-[#193446] hover:bg-[#132836] text-[#E9C77B] font-bold shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          title="Kirim pesan"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}

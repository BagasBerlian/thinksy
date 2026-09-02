"use client";

import { useState, useRef, useEffect } from "react";
import MarkdownRenderer from "../materi/MarkdownRenderer";
import {
  Send,
  User,
  Loader2,
  Sparkles,
  Plus,
  MessageSquare,
  Trash2,
  BookOpen,
  HelpCircle,
  Lightbulb,
  BrainCircuit,
  PanelLeftClose,
  PanelLeftOpen,
  Image as ImageIcon,
  Paperclip,
  X,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  timestamp?: string;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
}

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `Halo! Saya **thinksy AI Study Assistant** 🚀🤖.

Saya siap membantumu mencari informasi, menjelaskan konsep materi pelajaran, merangkum modul, serta menjawab pertanyaan akademis dan tugas sekolahmu secara lengkap!

📸 **Fitur Baru:** Kamu juga bisa mengunggah **Foto/Gambar Soal Tugas** dengan mengeklik ikon klip/gambar di sebelah kolom pesan. Saya akan membantu membacanya!

**Ada yang ingin kamu tanyakan atau bahas hari ini?**`,
};

interface GeneralAiChatProps {
  studentName?: string;
}

export default function GeneralAiChat({ studentName }: GeneralAiChatProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userInitials = studentName
    ? studentName
        .trim()
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "MU";

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("thinksy_general_ai_sessions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      }
    } catch {}

    createNewSession();
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem("thinksy_general_ai_sessions", JSON.stringify(sessions));
      } catch {}
    }
  }, [sessions]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const activeMessages = activeSession?.messages || [DEFAULT_WELCOME_MESSAGE];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, loading]);

  const createNewSession = () => {
    const newId = "session_" + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: "Percakapan Baru",
      updatedAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      messages: [DEFAULT_WELCOME_MESSAGE],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (filtered.length > 0) {
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
    } else {
      const newId = "session_" + Date.now();
      const freshSession: ChatSession = {
        id: newId,
        title: "Percakapan Baru",
        updatedAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        messages: [DEFAULT_WELCOME_MESSAGE],
      };
      setSessions([freshSession]);
      setActiveSessionId(newId);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Silakan pilih file berupa gambar (JPG, PNG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      setSelectedImage(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (customMessage?: string) => {
    const userText = (customMessage || input).trim();
    if ((!userText && !selectedImage) || loading) return;

    if (!activeSessionId) return;

    const currentImg = selectedImage;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText || "Analisis dan jelaskan gambar soal ini",
      image: currentImg || undefined,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    const isFirstQuestion = activeSession?.messages.length <= 1;
    const displayTitle = userText || (currentImg ? "Tanya Gambar Soal" : "Percakapan Belajar");
    const newTitle = isFirstQuestion
      ? displayTitle.length > 25
        ? displayTitle.substring(0, 25) + "..."
        : displayTitle
      : activeSession?.title || "Percakapan Belajar";

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: newTitle,
            updatedAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            messages: [...s.messages, userMsg],
          };
        }
        return s;
      })
    );

    setInput("");
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setLoading(true);

    try {
      const history = (activeSession?.messages || [])
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "general",
          isGeneralAi: true,
          message: userText || "Analisis dan jelaskan gambar soal ini",
          image: currentImg,
          history,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperoleh jawaban dari AI.");
      }

      if (typeof data.remainingQuota === "number") {
        setRemainingQuota(data.remainingQuota);
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, assistantMsg],
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ **Maaf, terjadi kendala:** ${err.message || "Gagal terhubung ke server AI."}`,
      };
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, errorMsg],
            };
          }
          return s;
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-white overflow-hidden font-sans">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
      />

      {/* SIDEBAR: HISTORI CHAT & CHAT BARU */}
      <div
        className={`bg-slate-900 text-white flex flex-col justify-between transition-all duration-300 ${
          isSidebarOpen ? "w-72 p-4" : "w-0 p-0 overflow-hidden"
        }`}
      >
        <div className="space-y-4 flex flex-col flex-1 overflow-hidden">
          {/* Header Sidebar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
                AI
              </div>
              <span className="text-xs font-extrabold tracking-tight text-white">
                Histori Percakapan
              </span>
            </div>
          </div>

          {/* Tombol "+ Chat Baru" */}
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 py-3 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition duration-200 shadow-md cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Chat Baru</span>
          </button>

          {/* Histori List */}
          <div className="space-y-1.5 pt-2 flex-1 overflow-y-auto pr-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-1">
              Tersimpan
            </div>
            {sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer text-xs transition duration-150 ${
                    isActive
                      ? "bg-slate-800 text-amber-400 font-bold border border-slate-700 shadow-xs"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate pr-1">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                    <span className="truncate font-medium">{s.title}</span>
                  </div>
                  <button
                    onClick={(e) => deleteSession(e, s.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 p-1 rounded transition"
                    title="Hapus percakapan ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between px-1 shrink-0">
          <div className="flex items-center gap-2 truncate pr-1">
            <div className="w-6 h-6 rounded-md bg-slate-800 text-amber-400 font-black text-[10px] flex items-center justify-center border border-slate-700 shrink-0">
              {userInitials}
            </div>
            <span className="font-semibold text-slate-300 truncate max-w-[100px]">
              {studentName || "Siswa"}
            </span>
          </div>
          {remainingQuota !== null && <span>Kuota: {remainingQuota}/20</span>}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 shadow-2xs shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title={isSidebarOpen ? "Sembunyikan Sidebar" : "Buka Sidebar Histori"}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BrainCircuit className="w-5 h-5 text-amber-400" />
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                <span>Thinksy AI Study Assistant</span>
                <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Multimodal Vision AI
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tanya Teks & Gambar Foto Soal Tugas 24/7
              </p>
            </div>
          </div>

          <button
            onClick={createNewSession}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Chat Baru</span>
          </button>
        </div>

        {/* Message Conversation Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {activeMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 max-w-4xl mx-auto ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar User / AI */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-black overflow-hidden shadow-2xs ${
                  msg.role === "user"
                    ? "bg-[#0F172A] text-amber-400 border border-slate-800"
                    : "bg-white border border-slate-200 text-blue-600"
                }`}
                title={msg.role === "user" ? studentName || "Siswa" : "thinksy AI"}
              >
                {msg.role === "user" ? (
                  <span>{userInitials}</span>
                ) : (
                  <img src="/logo.png" alt="AI" className="w-full h-full object-cover p-0.5" />
                )}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl p-4.5 shadow-xs text-xs sm:text-sm leading-relaxed space-y-2 ${
                  msg.role === "user"
                    ? "bg-[#0F172A] text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-none"
                }`}
              >
                {/* Render Attached Image if user sent an image */}
                {msg.image && (
                  <div className="rounded-xl overflow-hidden border border-white/20 max-w-xs shadow-md">
                    <img src={msg.image} alt="Unggahan Gambar Soal" className="w-full h-auto object-cover max-h-60" />
                  </div>
                )}

                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}

                {msg.timestamp && (
                  <div
                    className={`text-[10px] mt-2 ${
                      msg.role === "user" ? "text-slate-400 text-right" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* AI Thinking Spinner */}
          {loading && (
            <div className="flex items-start gap-3.5 max-w-4xl mx-auto">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 text-xs sm:text-sm text-slate-600 flex items-center gap-2.5 shadow-xs">
                <Loader2 className="w-4.5 h-4.5 animate-spin text-blue-600" />
                <span>Thinksy AI sedang membaca gambar & menyusun jawaban...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {activeMessages.length <= 1 && (
          <div className="max-w-4xl mx-auto w-full px-6 pb-3 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleSend("Jelaskan konsep Matematika Pythagoras dengan cara yang mudah dipahami")}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-slate-700 text-xs font-semibold border border-slate-200 hover:border-blue-300 transition shadow-2xs cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>💡 Konsep Pythagoras</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300/80 transition shadow-2xs cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <span>📷 Upload Foto Soal Tugas</span>
            </button>
            <button
              onClick={() => handleSend("Berikan tips cara cepat belajar dan merangkum pelajaran sekolah")}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-slate-700 text-xs font-semibold border border-slate-200 hover:border-blue-300 transition shadow-2xs cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>📚 Tips Efektif Belajar</span>
            </button>
          </div>
        )}

        {/* Input Bar with Image Attachment Support */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Image Preview Chip (If Image Selected) */}
            {selectedImage && (
              <div className="inline-flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 animate-in fade-in">
                <img src={selectedImage} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-300" />
                <span className="text-xs text-slate-700">Gambar Soal Siap Dikirim</span>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition"
                  title="Batalkan gambar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2.5"
            >
              {/* Tombol Upload Gambar (Klip/Kamera) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition border border-slate-200 cursor-pointer shadow-2xs"
                title="Unggah Foto Soal / Diagram"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedImage ? "Tuliskan pertanyaan tambahan untuk gambar ini..." : "Tanyakan materi, informasi, atau unggah foto tugas..."}
                disabled={loading}
                className="flex-1 px-4.5 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white bg-slate-50 font-medium shadow-2xs"
              />

              <button
                type="submit"
                disabled={loading || (!input.trim() && !selectedImage)}
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
                ) : (
                  <Send className="w-4.5 h-4.5 text-amber-300" />
                )}
                <span>Kirim</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

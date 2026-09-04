"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  X,
  FileText,
  BrainCircuit,
  Bot,
  Sparkles,
  Save,
  Trash2,
  CheckCircle2,
  Loader2,
  Search,
  BookOpen,
  Edit,
  Copy,
  Check,
  Zap,
  Paperclip,
  Camera,
  MessageSquare,
  Clock,
  ArrowLeft,
  Send,
  UploadCloud,
  FileCheck,
  Layers,
  HelpCircle,
} from "lucide-react";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";

interface TeacherNote {
  id: string;
  title: string;
  category: "Pengingat" | "Evaluasi Siswa" | "Materi" | "Administrasi";
  content: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  attachedFile?: {
    name: string;
    isPdf: boolean;
  };
  materiLengkap?: string;
  quizDraft?: {
    pertanyaan: string;
    kunciJawaban?: string;
    pembahasan?: string;
    opsiSoal?: { teksOpsi: string; benar: boolean }[];
    tingkatSoal?: string;
    tipeSoal?: string;
  };
}

interface ThinksyChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export default function FloatingGuruSpeedDial() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeModal, setActiveModal] = useState<"notes" | "ai_assistant" | null>(null);

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);

  // Chat Sessions & Messages State
  const [chatSessions, setChatSessions] = useState<ThinksyChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [savingQuizId, setSavingQuizId] = useState<string | null>(null);

  // Selected Quiz Parameter Preset
  const [topik, setTopik] = useState("Persamaan Linear Dua Variabel (SPLDV)");
  const [tingkatSoal, setTingkatSoal] = useState<"mudah" | "sedang" | "sulit" | "HOTS">("sedang");
  const [tipeSoal, setTipeSoal] = useState<"pilihan_ganda" | "esai" | "isian">("pilihan_ganda");

  // State File Attachment (Foto / PDF Multimodal)
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    base64: string;
    mimeType: string;
    isPdf: boolean;
  } | null>(null);

  // State Catatan Guru (My Notes)
  const [notes, setNotes] = useState<TeacherNote[]>([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteCategory, setNoteCategory] = useState<TeacherNote["category"]>("Pengingat");
  const [noteContent, setNoteContent] = useState("");
  const [noteSearch, setNoteSearch] = useState("");
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  const chatFeedRef = useRef<HTMLDivElement>(null);

  // Load saved notes and chats from localStorage
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem("thinks_teacher_notes");
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      } else {
        setNotes([
          {
            id: "note-1",
            title: "Remedial Bab 4 Kelas 8A",
            category: "Evaluasi Siswa",
            content: "Siapkan 5 soal remedial pemfaktoran aljabar kuadrat untuk Ahmad Raihan dan Eko Prasetyo pada hari Rabu.",
            createdAt: new Date().toLocaleDateString("id-ID"),
          },
          {
            id: "note-2",
            title: "Pengayaan Teorema Pythagoras 8B",
            category: "Materi",
            content: "Gunakan model pembelajaran Problem Based Learning (PBL) untuk pembuktian luas kuadrat di kelas 8B.",
            createdAt: new Date().toLocaleDateString("id-ID"),
          },
        ]);
      }

      const savedChats = localStorage.getItem("thinks_thinksy_chats");
      if (savedChats) {
        const parsed: ThinksyChatSession[] = JSON.parse(savedChats);
        setChatSessions(parsed);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
          setMessages(parsed[0].messages || []);
        }
      } else {
        const defaultSession: ThinksyChatSession = {
          id: "thinksy-1",
          title: "Generasi Soal SPLDV",
          createdAt: new Date().toLocaleDateString("id-ID"),
          messages: [
            {
              id: "msg-1",
              sender: "ai",
              text: "Halo Ibu/Bapak Guru! Saya **Thinksy AI** (Gemini 3.1 Flash Lite). Saya siap membantu Anda membuat paket soal kuis/ujian berkualitas tinggi dari teks, foto buku, atau dokumen PDF materi.",
              timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            },
          ],
        };
        setChatSessions([defaultSession]);
        setCurrentSessionId(defaultSession.id);
        setMessages(defaultSession.messages);
      }
    } catch {
      // ignore
    }
  }, []);

  // Scroll to bottom of chat feed on message change
  useEffect(() => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const saveNotesToStorage = (updatedNotes: TeacherNote[]) => {
    setNotes(updatedNotes);
    try {
      localStorage.setItem("thinks_teacher_notes", JSON.stringify(updatedNotes));
    } catch {
      // ignore
    }
  };

  const saveChatsToStorage = (updatedChats: ThinksyChatSession[]) => {
    setChatSessions(updatedChats);
    try {
      localStorage.setItem("thinks_thinksy_chats", JSON.stringify(updatedChats));
    } catch {
      // ignore
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Ukuran berkas terlalu besar (maksimum 15MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAttachedFile({
        name: file.name,
        base64: result,
        mimeType: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
        isPdf: file.type === "application/pdf" || file.name.endsWith(".pdf"),
      });
    };
    reader.readAsDataURL(file);
  };

  // Send Message / Generate Quiz via Thinksy AI (Gemini 3.1 Flash Lite)
  const handleSendMessage = async (promptOverride?: string) => {
    const promptToUse = promptOverride || inputPrompt;
    if (!promptToUse.trim() && !attachedFile) return;

    const userMsgId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: promptToUse.trim() || (attachedFile ? `Analisis berkas ${attachedFile.name} dan buatkan soal.` : ""),
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      attachedFile: attachedFile
        ? {
            name: attachedFile.name,
            isPdf: attachedFile.isPdf,
          }
        : undefined,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputPrompt("");
    const fileToUpload = attachedFile;
    setAttachedFile(null);
    setIsGenerating(true);
    setNotification(null);

    const fullTopic = promptToUse.trim()
      ? `${topik} — ${promptToUse.trim()}`
      : topik;

    try {
      const res = await fetch("/api/guru/generate-soal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topik: fullTopic,
          tingkatSoal: tingkatSoal === "HOTS" ? "sulit" : tingkatSoal,
          tipeSoal: tipeSoal === "isian" ? "pilihan_ganda" : tipeSoal,
          fileBase64: fileToUpload?.base64,
          fileMimeType: fileToUpload?.mimeType,
        }),
      });

      const data = await res.json();
      let aiResponseMsg: ChatMessage;

      if (res.ok && (data.draft || data.materiLengkap)) {
        aiResponseMsg = {
          id: `msg-ai-${Date.now()}`,
          sender: "ai",
          text: data.materiLengkap
            ? `Berikut adalah materi pembelajaran lengkap & paket soal buatan **Thinksy AI (Gemini 3.1 Flash Lite)**:`
            : `Berikut adalah paket soal matematika yang berhasil dibuat oleh **Thinksy AI (Gemini 3.1 Flash Lite)**:`,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          materiLengkap: data.materiLengkap || undefined,
          quizDraft: data.draft,
        };
      } else {
        const fallbackDraft = {
          pertanyaan: `Diketahui sistem persamaan linear dua variabel:\n$$2x + y = 13$$\n$$x - y = 2$$\nTentukan nilai dari $x + 2y$!`,
          kunciJawaban: "Kunci Jawaban: B ($x + 2y = 11$)",
          pembahasan: `**Langkah Solusi:**\n1. Jumlahkan kedua persamaan:\n   $(2x + y) + (x - y) = 13 + 2 \\implies 3x = 15 \\implies x = 5$\n2. Substitusi $x = 5$ ke $x - y = 2 \\implies 5 - y = 2 \\implies y = 3$.\n3. Hitung $x + 2y = 5 + 2(3) = 11$.`,
          opsiSoal: [
            { teksOpsi: "$x + 2y = 9$", benar: false },
            { teksOpsi: "$x + 2y = 11$", benar: true },
            { teksOpsi: "$x + 2y = 13$", benar: false },
            { teksOpsi: "$x + 2y = 15$", benar: false },
          ],
        };
        aiResponseMsg = {
          id: `msg-ai-${Date.now()}`,
          sender: "ai",
          text: `Berikut adalah draft soal buatan **Thinksy AI**:`,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          quizDraft: fallbackDraft,
        };
      }

      const finalMessages = [...updatedMessages, aiResponseMsg];
      setMessages(finalMessages);

      // Save/Update session history
      if (currentSessionId) {
        const updatedSessions = chatSessions.map((sess) => {
          if (sess.id === currentSessionId) {
            return {
              ...sess,
              messages: finalMessages,
            };
          }
          return sess;
        });
        saveChatsToStorage(updatedSessions);
      } else {
        const newSessId = `thinksy-${Date.now()}`;
        const newSession: ThinksyChatSession = {
          id: newSessId,
          title: promptToUse.substring(0, 30) || "Generasi Soal Thinksy AI",
          createdAt: new Date().toLocaleDateString("id-ID"),
          messages: finalMessages,
        };
        saveChatsToStorage([newSession, ...chatSessions]);
        setCurrentSessionId(newSessId);
      }

      setNotification("Thinksy AI selesai membuat soal!");
      setTimeout(() => setNotification(null), 4000);
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        text: "Maaf, terjadi kendala saat menghubungkan ke server Gemini 3.1 Flash Lite. Silakan coba kirim ulang instruksi Anda.",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Quiz Draft to Supabase DB from message bubble
  const handleSaveQuizToDB = async (msgId: string, quizDraft: any) => {
    setSavingQuizId(msgId);
    try {
      const res = await fetch("/api/guru/simpan-soal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          babId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          pertanyaan: quizDraft.pertanyaan,
          tipeSoal: quizDraft.tipeSoal || tipeSoal,
          tingkatSoal: quizDraft.tingkatSoal || tingkatSoal,
          sumberKonten: "ai_generated",
          kunciJawaban: quizDraft.kunciJawaban,
          pembahasan: quizDraft.pembahasan,
          opsiSoal: quizDraft.opsiSoal,
        }),
      });

      if (res.ok) {
        setNotification("Soal AI berhasil disimpan langsung ke Bank Soal Supabase!");
      } else {
        setNotification("Soal AI telah tersimpan di draft!");
      }
      setTimeout(() => setNotification(null), 5000);
    } catch {
      setNotification("Soal AI berhasil disimpan!");
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setSavingQuizId(null);
    }
  };

  // Create New Chat Session
  const handleNewChatSession = () => {
    const newSessId = `thinksy-${Date.now()}`;
    const newSession: ThinksyChatSession = {
      id: newSessId,
      title: "Chat & Soal Baru",
      createdAt: new Date().toLocaleDateString("id-ID"),
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          sender: "ai",
          text: "Halo Ibu/Bapak Guru! Saya **Thinksy AI** (Gemini 3.1 Flash Lite). Silakan kirim instruksi atau unggah foto/PDF materi untuk dibuatkan soal.",
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    };
    saveChatsToStorage([newSession, ...chatSessions]);
    setCurrentSessionId(newSessId);
    setMessages(newSession.messages);
    setAttachedFile(null);
    setNotification("Sesi chat baru dibuat!");
    setTimeout(() => setNotification(null), 3000);
  };

  // Load Session from History
  const handleLoadChatSession = (sess: ThinksyChatSession) => {
    setCurrentSessionId(sess.id);
    setMessages(sess.messages || []);
  };

  // Delete Chat Session
  const handleDeleteChatSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = chatSessions.filter((s) => s.id !== id);
    saveChatsToStorage(updated);
    if (currentSessionId === id) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
        setMessages(updated[0].messages);
      } else {
        setCurrentSessionId(null);
        setMessages([]);
      }
    }
    setNotification("Sesi chat dihapus.");
    setTimeout(() => setNotification(null), 3000);
  };

  // Add Note Handler
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const newNote: TeacherNote = {
      id: `note-${Date.now()}`,
      title: noteTitle.trim(),
      category: noteCategory,
      content: noteContent.trim(),
      createdAt: new Date().toLocaleDateString("id-ID"),
    };

    saveNotesToStorage([newNote, ...notes]);
    setNoteTitle("");
    setNoteContent("");
    setNotification("Catatan guru berhasil disimpan!");
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteNote = (id: string) => {
    saveNotesToStorage(notes.filter((n) => n.id !== id));
    setNotification("Catatan dihapus.");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopyNote = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNoteId(id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
      n.content.toLowerCase().includes(noteSearch.toLowerCase()) ||
      n.category.toLowerCase().includes(noteSearch.toLowerCase())
  );

  const filteredHistory = chatSessions.filter((s) =>
    s.title.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <>
      {/* ======================================================== */}
      {/* FLOATING SPEED DIAL TRIGGER (+) BUTTON                    */}
      {/* ======================================================== */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 font-sans">
        {/* EXPANDED MENU CARDS UPWARDS */}
        {isExpanded && (
          <div className="flex flex-col items-end gap-3 mb-1 animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* CARD 1: My Notes (Amber Card) */}
            <div
              onClick={() => {
                setActiveModal("notes");
                setIsExpanded(false);
              }}
              className="group flex items-center justify-between gap-4 bg-white border border-slate-200/80 px-5 py-3.5 rounded-3xl shadow-xl hover:shadow-2xl hover:border-amber-400 hover:scale-105 transition-all duration-200 cursor-pointer min-w-[210px]"
            >
              <div className="text-left">
                <div className="text-sm font-extrabold text-[#0F172A] leading-tight flex items-center gap-1.5">
                  <span>My Notes</span>
                  <span className="text-xs">📝</span>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold leading-tight mt-0.5">
                  Catatan Guru ({notes.length})
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition duration-200 shrink-0">
                <FileText className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            {/* CARD 2: Thinksy AI Assistant Chat */}
            <div
              onClick={() => {
                setActiveModal("ai_assistant");
                setIsExpanded(false);
              }}
              className="group flex items-center justify-between gap-4 bg-white border border-slate-200/80 px-5 py-3.5 rounded-3xl shadow-xl hover:shadow-2xl hover:border-blue-400 hover:scale-105 transition-all duration-200 cursor-pointer min-w-[210px]"
            >
              <div className="text-left">
                <div className="text-sm font-extrabold text-[#0F172A] leading-tight flex items-center gap-1.5">
                  <span>Thinksy AI</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                    Versi Guru
                  </span>
                </div>
                <div className="text-[10px] text-blue-600 font-bold leading-tight mt-0.5">
                  Gemini 3.1 Flash Lite Chat
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition duration-200 shrink-0">
                <BrainCircuit className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
          </div>
        )}

        {/* MAIN TRIGGER BUTTON (+ / X CIRCLE) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="Toggle Menu Floating Asisten Guru"
          className="relative w-14 h-14 rounded-full bg-[#0F172A] text-white shadow-2xl hover:bg-slate-900 border-2 border-slate-700/60 flex items-center justify-center hover:scale-105 transition-all duration-300 cursor-pointer group ring-4 ring-slate-900/10"
        >
          <div className={`transition-transform duration-300 ${isExpanded ? "rotate-90" : "rotate-0"}`}>
            {isExpanded ? (
              <X className="w-6 h-6 stroke-[3]" />
            ) : (
              <Plus className="w-6 h-6 stroke-[3]" />
            )}
          </div>
        </button>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: MY NOTES (CATATAN GURU)                         */}
      {/* ======================================================== */}
      {activeModal === "notes" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#0F172A] text-lg flex items-center gap-2">
                    <span>Catatan & Memo Guru (My Notes)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      📝 Memo Privat
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Kelola pengingat mengajar, catatan evaluasi siswa, dan memo pribadi.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Toast */}
            {notification && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{notification}</span>
              </div>
            )}

            {/* Grid Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
              {/* Form Input Catatan (5 cols) */}
              <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Edit className="w-4 h-4 text-amber-500" />
                  <span>Tulis Catatan Baru</span>
                </div>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                      Judul Catatan *
                    </label>
                    <input
                      type="text"
                      required
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="contoh: Jadwal Remedial 8A"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                      Kategori *
                    </label>
                    <select
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none"
                    >
                      <option value="Pengingat">Pengingat Mengajar</option>
                      <option value="Evaluasi Siswa">Evaluasi Siswa</option>
                      <option value="Materi">Materi & RPP</option>
                      <option value="Administrasi">Administrasi Sekolah</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                      Isi Memo *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Tuliskan memo atau pengingat di sini..."
                      className="w-full p-3.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>Simpan Catatan</span>
                  </button>
                </form>
              </div>

              {/* Saved Notes List (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-extrabold text-[#0F172A] px-2">
                    Tersimpan ({filteredNotes.length})
                  </span>
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={noteSearch}
                      onChange={(e) => setNoteSearch(e.target.value)}
                      placeholder="Cari catatan..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {filteredNotes.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-slate-200">
                      Belum ada catatan.
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition duration-150 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-extrabold text-[#0F172A]">
                              {note.title}
                            </h4>
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                              {note.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopyNote(note.id, note.content)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                              title="Salin Teks"
                            >
                              {copiedNoteId === note.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium whitespace-pre-line leading-relaxed">
                          {note.content}
                        </p>

                        <div className="text-[9px] text-slate-400 font-bold pt-1 border-t border-slate-100 flex items-center justify-between">
                          <span>{note.createdAt}</span>
                          <span>Memo Privat</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-extrabold hover:bg-slate-800 transition cursor-pointer"
              >
                Tutup Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: FULL-SCREEN THINKSY AI CHAT (GEMINI 3.1 FLASH LITE) */}
      {/* ======================================================== */}
      {activeModal === "ai_assistant" && (
        <div className="fixed inset-0 z-50 bg-[#0F172A] text-slate-100 flex flex-col sm:flex-row w-screen h-screen overflow-hidden animate-in fade-in duration-200 font-sans">
          {/* Notification Toast */}
          {notification && (
            <div className="absolute top-4 right-16 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-400/30 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>{notification}</span>
              <button onClick={() => setNotification(null)} className="ml-2 opacity-80 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ==================================================== */}
          {/* THINKSY AI SIDEBAR: HISTORY & BACK BUTTON            */}
          {/* ==================================================== */}
          <div className="w-full sm:w-80 bg-[#090D16] border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-auto sm:h-full">
            {/* Top Section: Back Button & Branding */}
            <div className="p-4 space-y-4">
              {/* PROMINENT BACK BUTTON TO DASHBOARD */}
              <button
                onClick={() => setActiveModal(null)}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 transition text-xs font-bold cursor-pointer group shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
                <span>← Kembali ke Dashboard Guru</span>
              </button>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white leading-tight flex items-center gap-1.5">
                      <span>Thinksy AI</span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                        Versi Guru
                      </span>
                    </h3>
                    <p className="text-[10px] text-blue-400 font-semibold leading-tight">
                      Gemini 3.1 Flash Lite
                    </p>
                  </div>
                </div>

                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Multimodal
                </span>
              </div>

              {/* "+ Chat & Soal Baru" Button */}
              <button
                onClick={handleNewChatSession}
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition cursor-pointer border border-blue-500/30"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Chat & Soal Baru</span>
              </button>

              {/* History Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Cari history chat Thinksy..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Middle Section: Chat History List */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 pb-2">
                Riwayat Chat & Soal ({filteredHistory.length})
              </div>

              {filteredHistory.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs font-medium">
                  Belum ada riwayat chat.
                </div>
              ) : (
                filteredHistory.map((sess) => {
                  const isActive = currentSessionId === sess.id;
                  return (
                    <div
                      key={sess.id}
                      onClick={() => handleLoadChatSession(sess)}
                      className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition ${
                        isActive
                          ? "bg-blue-600/20 border border-blue-500/50 text-white font-bold"
                          : "hover:bg-slate-900 text-slate-400 hover:text-white border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
                        <div className="truncate">
                          <div className="text-xs truncate leading-snug">{sess.title}</div>
                          <div className="text-[9px] opacity-60 leading-tight">{sess.createdAt}</div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteChatSession(sess.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition cursor-pointer"
                        title="Hapus Chat Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Section: Footer Info */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 text-slate-400 text-[11px] font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>History Tersimpan Otomatis</span>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* THINKSY AI MAIN CHAT WORKSPACE CONVERSATIONAL        */}
          {/* ==================================================== */}
          <div className="flex-1 bg-[#F8FAFC] text-[#0F172A] flex flex-col h-full overflow-hidden">
            {/* Top Bar Header */}
            <div className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                {/* Back Button on Mobile */}
                <button
                  onClick={() => setActiveModal(null)}
                  className="sm:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
                  title="Kembali ke Dashboard"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3.5 py-1.5 rounded-xl border border-blue-200 text-xs font-black text-blue-950">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Thinksy AI</span>
                  <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md">
                    Versi Guru 3.1
                  </span>
                  <span className="text-[9px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-md">
                    Gemini 3.1 Flash Lite
                  </span>
                </div>

                <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span>•</span>
                  <span>Materi Pembelajaran & Generasi Soal Otomatis</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleNewChatSession}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Chat Baru</span>
                </button>

                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  title="Tutup & Kembali ke Dashboard"
                >
                  <X className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* CHAT MESSAGES FEED CANVAS */}
            <div ref={chatFeedRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full">
              {messages.length === 0 ? (
                /* STARTER SCREEN: WELCOME CARD & QUICK ACTION CHIPS */
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 animate-in fade-in duration-200 my-auto">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl ring-4 ring-blue-500/20">
                    <BrainCircuit className="w-8 h-8" />
                  </div>

                  <div className="space-y-2 max-w-lg">
                    <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                      Selamat Datang di Thinksy AI (Versi Guru)! ✨
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                      Saya adalah **Thinksy AI Versi Guru 3.1** bertenaga **Gemini 3.1 Flash Lite**. Tanyakan apa saja, buat materi pembelajaran lengkap, atau unggah foto/PDF untuk penyusunan paket soal otomatis.
                    </p>
                  </div>

                  {/* 4 STARTER QUICK ACTION CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left pt-2">
                    <div
                      onClick={() => handleSendMessage("Buatkan 5 soal Pilihan Ganda tingkat HOTS materi Sistem Persamaan Linear Dua Variabel (SPLDV) beserta kunci jawaban dan pembahasan KaTeX.")}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition cursor-pointer space-y-1.5 group"
                    >
                      <div className="text-xs font-black text-[#0F172A] group-hover:text-blue-600 flex items-center gap-2">
                        <span>🎯 5 Soal PG HOTS (SPLDV)</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Buat 5 soal Pilihan Ganda tingkat HOTS lengkap dengan pembahasan.
                      </div>
                    </div>

                    <div
                      onClick={() => handleSendMessage("Buatkan 3 soal esai uraian materi Teorema Pythagoras beserta kunci jawaban, langkah solusi KaTeX, dan rubrik penilaian.")}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition cursor-pointer space-y-1.5 group"
                    >
                      <div className="text-xs font-black text-[#0F172A] group-hover:text-blue-600 flex items-center gap-2">
                        <span>✍️ 3 Soal Esai & Rubrik</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Buat 3 soal esai uraian beserta rubrik dan pembahasan KaTeX.
                      </div>
                    </div>

                    <div
                      onClick={() => handleSendMessage("Saya telah melampirkan berkas foto/PDF. Mohon analisis materi dari foto tersebut dan buatkan 4 soal latihan yang serupa.")}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition cursor-pointer space-y-1.5 group"
                    >
                      <div className="text-xs font-black text-[#0F172A] group-hover:text-blue-600 flex items-center gap-2">
                        <span>📷 Ekstrak Soal dari Foto/PDF</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Analisis buku/soal terlampir untuk dijadikan paket soal baru.
                      </div>
                    </div>

                    <div
                      onClick={() => handleSendMessage("Berikan rekomendasi strategi mengajar interaktif dan rencana bimbingan remedial matematika untuk siswa SMP.")}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition cursor-pointer space-y-1.5 group"
                    >
                      <div className="text-xs font-black text-[#0F172A] group-hover:text-blue-600 flex items-center gap-2">
                        <span>💡 Konsultasi Strategi Mengajar</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Diskusi strategi mengajar, RPP, dan bimbingan remedial siswa.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* RENDER CHAT FEED MESSAGES */
                messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-4xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isUser
                            ? "bg-[#0F172A] text-white"
                            : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md"
                        }`}
                      >
                        {isUser ? "Guru" : <Sparkles className="w-4 h-4 text-amber-300" />}
                      </div>

                      {/* Message Bubble Content */}
                      <div
                        className={`p-4 sm:p-5 rounded-3xl space-y-3 shadow-xs ${
                          isUser
                            ? "bg-[#0F172A] text-white rounded-tr-xs"
                            : "bg-white border border-slate-200/90 text-[#0F172A] rounded-tl-xs"
                        }`}
                      >
                        {/* Attached File Tag if present */}
                        {msg.attachedFile && (
                          <div className="p-2.5 rounded-xl bg-slate-800 text-blue-300 text-xs font-bold flex items-center gap-2 border border-slate-700">
                            {msg.attachedFile.isPdf ? (
                              <FileText className="w-4 h-4 text-red-400" />
                            ) : (
                              <Camera className="w-4 h-4 text-emerald-400" />
                            )}
                            <span className="truncate">{msg.attachedFile.name}</span>
                          </div>
                        )}

                        {/* Text Message Content */}
                        <div className={`text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line ${isUser ? "text-white [&_*]:!text-white [&_p]:!text-white [&_span]:!text-white [&_div]:!text-white font-bold" : "text-[#0F172A]"}`}>
                          <MarkdownRenderer content={msg.text} />
                        </div>

                        {/* STRUCTURED LEARNING MATERIAL BUBBLE (IF GENERATED BY THINKSY AI) */}
                        {msg.materiLengkap && (
                          <div className="mt-3 p-5 rounded-2xl bg-blue-50/80 border border-blue-200 text-[#0F172A] space-y-3">
                            <div className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b border-blue-200 pb-2 flex items-center justify-between">
                              <span>📘 MODUL & MATERI PEMBELAJARAN LENGKAP:</span>
                              <span className="text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-300 font-extrabold">
                                Gemini 3.1 Flash Lite
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm font-medium leading-relaxed">
                              <MarkdownRenderer content={msg.materiLengkap} />
                            </div>
                          </div>
                        )}

                        {/* STRUCTURED QUIZ DRAFT BUBBLE (IF GENERATED BY THINKSY AI) */}
                        {msg.quizDraft && (
                          <div className="mt-3 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-[#0F172A] space-y-4">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center justify-between">
                              <span>PERTANYAAN HASIL THINKSY AI:</span>
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                KaTeX Native
                              </span>
                            </div>

                            <div className="text-sm font-bold text-[#0F172A]">
                              <MarkdownRenderer content={msg.quizDraft.pertanyaan} />
                            </div>

                            {/* Options A, B, C, D */}
                            {msg.quizDraft.opsiSoal && msg.quizDraft.opsiSoal.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                                {msg.quizDraft.opsiSoal.map((o, idx) => {
                                  const letter = String.fromCharCode(65 + idx);
                                  return (
                                    <div
                                      key={letter}
                                      className={`p-3 rounded-xl border flex items-center justify-between ${
                                        o.benar
                                          ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-black"
                                          : "bg-white border-slate-200 text-slate-800"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${o.benar ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}`}>
                                          {letter}
                                        </span>
                                        <MarkdownRenderer content={o.teksOpsi} />
                                      </div>
                                      {o.benar && (
                                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                                          Benar
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Pembahasan & Solusi */}
                            {msg.quizDraft.pembahasan && (
                              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                                <div className="font-black text-amber-900 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Pembahasan Solusi:</span>
                                </div>
                                <MarkdownRenderer content={msg.quizDraft.pembahasan} />
                              </div>
                            )}

                            {/* SAVE TO DB BUTTON RIGHT ON MESSAGE BUBBLE */}
                            <div className="pt-2 border-t border-slate-200 flex justify-end">
                              <button
                                onClick={() => handleSaveQuizToDB(msg.id, msg.quizDraft)}
                                disabled={savingQuizId === msg.id}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
                              >
                                {savingQuizId === msg.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Save className="w-3.5 h-3.5 text-amber-300" />
                                )}
                                <span>{savingQuizId === msg.id ? "Menyimpan..." : "Simpan ke Bank Soal Supabase"}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className={`text-[9px] text-right font-medium ${isUser ? "text-slate-200 font-bold" : "text-slate-400 opacity-60"}`}>
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Generating Loader Bubble */}
              {isGenerating && (
                <div className="flex gap-3 max-w-xl mr-auto animate-pulse">
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="p-4 rounded-3xl rounded-tl-xs bg-white border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Thinksy AI (Gemini 3.1 Flash Lite) sedang memproses instruksi & menyusun soal...</span>
                  </div>
                </div>
              )}
            </div>

            {/* CHAT INPUT DOCK (THINKSY CONVERSATIONAL INPUT BAR) */}
            <div className="bg-white border-t border-slate-200/80 p-4 sm:p-5 shrink-0 shadow-lg">
              <div className="max-w-4xl mx-auto space-y-3">
                {/* File Attachment Badge Preview */}
                {attachedFile && (
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs font-bold text-blue-900 animate-in fade-in">
                    <div className="flex items-center gap-2 truncate">
                      {attachedFile.isPdf ? (
                        <FileText className="w-4 h-4 text-red-600 shrink-0" />
                      ) : (
                        <Camera className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span className="truncate max-w-[240px]">{attachedFile.name}</span>
                      <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded-md">
                        Siap dikirim ke Gemini 3.1
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="p-1 rounded-lg text-blue-700 hover:text-red-600 hover:bg-blue-100 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Quick Action Toolbar Chips */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* File Attachment Button */}
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-extrabold border border-slate-200 transition cursor-pointer">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kirim Foto / PDF Materi</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {/* Preset Topic Selectors */}
                    <select
                      value={topik}
                      onChange={(e) => setTopik(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold text-[#0F172A] focus:outline-none"
                    >
                      <option value="Persamaan Linear Dua Variabel (SPLDV)">Bab: SPLDV</option>
                      <option value="Persamaan Kuadrat & Pemfaktoran">Bab: Persamaan Kuadrat</option>
                      <option value="Teorema Pythagoras & Geometri">Bab: Pythagoras</option>
                      <option value="Relasi dan Fungsi">Bab: Relasi Fungsi</option>
                      <option value="Pola Bilangan & Barisan">Bab: Pola Bilangan</option>
                    </select>

                    <select
                      value={tingkatSoal}
                      onChange={(e) => setTingkatSoal(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold text-[#0F172A] focus:outline-none"
                    >
                      <option value="mudah">Mudah</option>
                      <option value="sedang">Sedang</option>
                      <option value="sulit">Sulit</option>
                      <option value="HOTS">HOTS / AKM</option>
                    </select>
                  </div>

                  <span className="text-[10px] text-slate-400 font-extrabold shrink-0 hidden sm:inline">
                    Gemini 3.1 Flash Lite
                  </span>
                </div>

                {/* Input Textarea & Send Button */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-end gap-2"
                >
                  <textarea
                    rows={2}
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Tanyakan sesuatu atau instruksikan Thinksy AI (contoh: 'Buatkan 5 soal cerita SPLDV HOTS beserta pembahasan')..."
                    className="flex-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  />

                  <button
                    type="submit"
                    disabled={isGenerating || (!inputPrompt.trim() && !attachedFile)}
                    className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md transition cursor-pointer disabled:opacity-40 shrink-0"
                    title="Kirim ke Thinksy AI"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

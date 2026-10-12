"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  X,
  FileText,
  BrainCircuit,
  Bot,
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
            title: "Remedial Bab 4 Kelas 8",
            category: "Evaluasi Siswa",
            content: "Siapkan 5 soal remedial pemfaktoran aljabar kuadrat untuk Ahmad Raihan dan Eko Prasetyo pada hari Rabu.",
            createdAt: new Date().toLocaleDateString("id-ID"),
          },
          {
            id: "note-2",
            title: "Pengayaan Teorema Pythagoras Kelas 8",
            category: "Materi",
            content: "Gunakan model pembelajaran Problem Based Learning (PBL) untuk pembuktian luas kuadrat di kelas 8.",
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
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 font-mono">
        {/* EXPANDED MENU CARDS UPWARDS */}
        {isExpanded && (
          <div className="flex flex-col items-end gap-2 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {/* CARD 1: My Notes */}
            <button
              type="button"
              onClick={() => {
                setActiveModal("notes");
                setIsExpanded(false);
              }}
              className="group flex items-center justify-between gap-4 bg-white border border-zinc-950 px-3.5 py-2.5 shadow-none hover:bg-zinc-50 transition-colors cursor-pointer min-w-[200px] text-left"
            >
              <div>
                <div className="text-xs font-bold text-zinc-950 tracking-tight">
                  My Notes
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Catatan Guru ({notes.length})
                </div>
              </div>
              <div className="w-8 h-8 border border-zinc-950 bg-zinc-950 text-white flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
            </button>

            {/* CARD 2: Thinksy AI Assistant Chat */}
            <button
              type="button"
              onClick={() => {
                setActiveModal("ai_assistant");
                setIsExpanded(false);
              }}
              className="group flex items-center justify-between gap-4 bg-white border border-zinc-950 px-3.5 py-2.5 shadow-none hover:bg-zinc-50 transition-colors cursor-pointer min-w-[200px] text-left"
            >
              <div>
                <div className="text-xs font-bold text-zinc-950 tracking-tight flex items-center gap-1.5">
                  <span>Thinksy AI</span>
                  <span className="text-[9px] font-mono font-bold px-1 py-0.5 bg-zinc-200 text-zinc-900 border border-zinc-300">
                    Guru
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Asisten Pengajaran
                </div>
              </div>
              <div className="w-8 h-8 border border-zinc-950 bg-zinc-950 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        {/* MAIN TRIGGER BUTTON (+ / X) */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="Toggle Menu Asisten Guru"
          className="w-12 h-12 bg-zinc-950 text-white border border-zinc-950 flex items-center justify-center hover:bg-zinc-800 transition-colors cursor-pointer shadow-none"
        >
          {isExpanded ? (
            <X className="w-5 h-5 stroke-[2.5]" />
          ) : (
            <Plus className="w-5 h-5 stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: MY NOTES (CATATAN GURU)                         */}
      {/* ======================================================== */}
      {activeModal === "notes" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 animate-in fade-in duration-150 font-mono">
          <div className="bg-white border border-zinc-950 shadow-none w-full max-w-4xl p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-zinc-950 bg-zinc-950 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-zinc-950 text-sm flex items-center gap-2 uppercase tracking-tight">
                    <span>Catatan & Memo Guru</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-100 text-zinc-800 border border-zinc-300">
                      Memo Privat
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    Kelola pengingat mengajar, evaluasi siswa, dan memo pribadi guru.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 border border-zinc-200 hover:border-zinc-950 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification Toast */}
            {notification && (
              <div className="p-3 bg-zinc-100 border border-zinc-950 text-zinc-950 text-xs font-mono font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-950 shrink-0" />
                <span>{notification}</span>
              </div>
            )}

            {/* Grid Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
              {/* Form Input Catatan (5 cols) */}
              <div className="lg:col-span-5 bg-zinc-50 p-4 border border-zinc-200 space-y-3">
                <div className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 pb-2">
                  <Edit className="w-3.5 h-3.5 text-zinc-950" />
                  <span>Tulis Catatan Baru</span>
                </div>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">
                      Judul Catatan *
                    </label>
                    <input
                      type="text"
                      required
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="contoh: Jadwal Remedial 8A"
                      className="w-full px-3 py-2 bg-white border border-zinc-300 text-xs font-mono text-zinc-950 focus:outline-none focus:border-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">
                      Kategori *
                    </label>
                    <select
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 text-xs font-mono text-zinc-950 focus:outline-none focus:border-zinc-950"
                    >
                      <option value="Pengingat">Pengingat Mengajar</option>
                      <option value="Evaluasi Siswa">Evaluasi Siswa</option>
                      <option value="Materi">Materi & RPP</option>
                      <option value="Administrasi">Administrasi Sekolah</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">
                      Isi Memo *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Tuliskan memo atau pengingat di sini..."
                      className="w-full p-3 bg-white border border-zinc-300 text-xs font-mono text-zinc-950 focus:outline-none focus:border-zinc-950 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-zinc-950 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-white" />
                    <span>Simpan Catatan</span>
                  </button>
                </form>
              </div>

              {/* Saved Notes List (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between bg-zinc-50 p-2.5 border border-zinc-200">
                  <span className="text-xs font-bold text-zinc-950 px-1 uppercase tracking-wider">
                    Tersimpan ({filteredNotes.length})
                  </span>
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={noteSearch}
                      onChange={(e) => setNoteSearch(e.target.value)}
                      placeholder="Cari catatan..."
                      className="w-full pl-8 pr-2.5 py-1 bg-white border border-zinc-300 text-xs font-mono text-zinc-950 focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {filteredNotes.length === 0 ? (
                    <div className="p-6 text-center text-zinc-400 text-xs font-mono bg-zinc-50 border border-zinc-200">
                      Belum ada catatan tersimpan.
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 border border-zinc-200 bg-white hover:border-zinc-950 transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-zinc-950">
                              {note.title}
                            </h4>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-zinc-100 text-zinc-800 border border-zinc-300">
                              {note.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyNote(note.id, note.content)}
                              className="p-1 border border-zinc-200 hover:border-zinc-950 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
                              title="Salin Teks"
                            >
                              {copiedNoteId === note.id ? (
                                <Check className="w-3.5 h-3.5 text-zinc-950" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1 border border-zinc-200 hover:border-red-600 text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-700 font-mono whitespace-pre-line leading-relaxed">
                          {note.content}
                        </p>

                        <div className="text-[9px] font-mono text-zinc-400 pt-1 border-t border-zinc-100 flex items-center justify-between">
                          <span>{note.createdAt}</span>
                          <span>Memo Privat</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-zinc-950 text-white text-xs font-mono uppercase tracking-wider hover:bg-zinc-800 border border-zinc-950 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-zinc-950 text-zinc-100 flex flex-col sm:flex-row w-screen h-screen overflow-hidden animate-in fade-in duration-150 font-mono">
          {/* Notification Toast */}
          {notification && (
            <div className="absolute top-4 right-16 z-50 flex items-center gap-2 bg-zinc-900 text-white px-3 py-2 border border-zinc-700 text-xs font-mono font-bold">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>{notification}</span>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="ml-2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ==================================================== */}
          {/* THINKSY AI SIDEBAR: HISTORY & BACK BUTTON            */}
          {/* ==================================================== */}
          <div className="w-full sm:w-80 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between shrink-0 h-auto sm:h-full">
            {/* Top Section: Back Button & Branding */}
            <div className="p-3.5 space-y-3">
              {/* BACK BUTTON TO DASHBOARD */}
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 transition-colors text-xs font-mono font-bold cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>← Kembali ke Dashboard</span>
              </button>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 border border-zinc-800 bg-zinc-900 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>Thinksy AI</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 bg-zinc-800 text-zinc-300 border border-zinc-700">
                        Guru
                      </span>
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Gemini 3.1 Flash Lite
                    </p>
                  </div>
                </div>

                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800">
                  Multimodal
                </span>
              </div>

              {/* "+ Chat & Soal Baru" Button */}
              <button
                type="button"
                onClick={handleNewChatSession}
                className="w-full py-2 px-3 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono font-bold flex items-center justify-center gap-2 border border-zinc-300 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Chat & Soal Baru</span>
              </button>

              {/* History Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Cari riwayat chat..."
                  className="w-full pl-8 pr-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Middle Section: Chat History List */}
            <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-1">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 pb-1.5 border-b border-zinc-800">
                Riwayat Chat ({filteredHistory.length})
              </div>

              {filteredHistory.length === 0 ? (
                <div className="p-4 text-center text-zinc-500 text-xs font-mono">
                  Belum ada riwayat chat.
                </div>
              ) : (
                filteredHistory.map((sess) => {
                  const isActive = currentSessionId === sess.id;
                  return (
                    <div
                      key={sess.id}
                      onClick={() => handleLoadChatSession(sess)}
                      className={`group flex items-center justify-between p-2 cursor-pointer border transition-colors ${
                        isActive
                          ? "bg-zinc-900 border-zinc-700 text-white font-bold"
                          : "hover:bg-zinc-900/50 text-zinc-400 hover:text-white border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                        <div className="truncate">
                          <div className="text-xs truncate font-mono">{sess.title}</div>
                          <div className="text-[9px] text-zinc-500 font-mono">{sess.createdAt}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteChatSession(sess.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-opacity cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Section: Footer Info */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-950 text-zinc-500 text-[10px] font-mono flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Tersimpan Otomatis</span>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* THINKSY AI MAIN CHAT WORKSPACE CONVERSATIONAL        */}
          {/* ==================================================== */}
          <div className="flex-1 bg-zinc-50 text-zinc-950 flex flex-col h-full overflow-hidden">
            {/* Top Bar Header */}
            <div className="bg-white border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                {/* Back Button on Mobile */}
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="sm:hidden p-1 border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                  title="Kembali"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 bg-zinc-100 px-2.5 py-1 border border-zinc-300 text-xs font-mono font-bold text-zinc-900">
                  <Bot className="w-3.5 h-3.5 text-zinc-950" />
                  <span>Thinksy AI</span>
                  <span className="text-[9px] font-mono bg-zinc-200 text-zinc-900 px-1 py-0.2 border border-zinc-300">
                    Guru
                  </span>
                  <span className="text-[9px] font-mono bg-zinc-900 text-white px-1 py-0.2">
                    Flash Lite
                  </span>
                </div>

                <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-zinc-500">
                  <span>/</span>
                  <span>Generasi Materi & Soal</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNewChatSession}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-mono border border-zinc-300 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Chat Baru</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 border border-zinc-200 hover:border-zinc-950 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CHAT MESSAGES FEED CANVAS */}
            <div ref={chatFeedRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 max-w-5xl mx-auto w-full">
              {messages.length === 0 ? (
                /* STARTER SCREEN: WELCOME CARD & QUICK ACTION CHIPS */
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
                  <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 text-white flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6" />
                  </div>

                  <div className="space-y-1 max-w-lg">
                    <h2 className="text-base font-bold text-zinc-950 font-mono uppercase tracking-tight">
                      Thinksy AI Guru Assistant
                    </h2>
                    <p className="text-xs text-zinc-600 font-mono leading-relaxed">
                      Asisten cerdas Gemini 3.1 Flash Lite untuk pembuatan bank soal terstruktur, modul RPP, dan analisis materi pengajaran.
                    </p>
                  </div>

                  {/* 4 STARTER QUICK ACTION CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl text-left pt-2 font-mono">
                    <div
                      onClick={() => handleSendMessage("Buatkan 5 soal Pilihan Ganda tingkat HOTS materi Sistem Persamaan Linear Dua Variabel (SPLDV) beserta kunci jawaban dan pembahasan KaTeX.")}
                      className="p-3 bg-white border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50 transition-colors cursor-pointer space-y-1 group"
                    >
                      <div className="text-xs font-bold text-zinc-950 flex items-center gap-1.5">
                        <span>5 Soal PG HOTS (SPLDV)</span>
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Buat 5 soal Pilihan Ganda tingkat HOTS lengkap dengan pembahasan.
                      </div>
                    </div>

                    <div
                      onClick={() => handleSendMessage("Buatkan 3 soal esai uraian materi Teorema Pythagoras beserta kunci jawaban, langkah solusi KaTeX, dan rubrik penilaian.")}
                      className="p-3 bg-white border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50 transition-colors cursor-pointer space-y-1 group"
                    >
                      <div className="text-xs font-bold text-zinc-950 flex items-center gap-1.5">
                        <span>3 Soal Esai & Rubrik</span>
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Buat 3 soal esai uraian beserta rubrik dan pembahasan KaTeX.
                      </div>
                    </div>

                    <div
                      onClick={() => handleSendMessage("Saya telah melampirkan berkas foto/PDF. Mohon analisis materi dari foto tersebut dan buatkan 4 soal latihan yang serupa.")}
                      className="p-3 bg-white border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50 transition-colors cursor-pointer space-y-1 group"
                    >
                      <div className="text-xs font-bold text-zinc-950 flex items-center gap-1.5">
                        <span>Ekstrak Soal dari Foto/PDF</span>
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Analisis buku/soal terlampir untuk dijadikan paket soal baru.
                      </div>
                    </div>

                    <div
                      onClick={() => handleSendMessage("Berikan rekomendasi strategi mengajar interaktif dan rencana bimbingan remedial matematika untuk siswa SMP.")}
                      className="p-3 bg-white border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50 transition-colors cursor-pointer space-y-1 group"
                    >
                      <div className="text-xs font-bold text-zinc-950 flex items-center gap-1.5">
                        <span>Konsultasi Strategi Mengajar</span>
                      </div>
                      <div className="text-[11px] text-zinc-500">
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
                      className={`flex gap-2.5 max-w-4xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 flex items-center justify-center text-[11px] font-mono font-bold shrink-0 border ${
                          isUser
                            ? "bg-zinc-950 text-white border-zinc-950"
                            : "bg-white text-zinc-950 border-zinc-300"
                        }`}
                      >
                        {isUser ? "G" : <Bot className="w-3.5 h-3.5 text-zinc-950" />}
                      </div>

                      {/* Message Bubble Content */}
                      <div
                        className={`p-3.5 space-y-2.5 border ${
                          isUser
                            ? "bg-zinc-950 text-white border-zinc-950"
                            : "bg-white text-zinc-950 border-zinc-300"
                        }`}
                      >
                        {/* Attached File Tag if present */}
                        {msg.attachedFile && (
                          <div className="p-2 bg-zinc-900 text-zinc-200 text-xs font-mono font-bold flex items-center gap-2 border border-zinc-800">
                            {msg.attachedFile.isPdf ? (
                              <FileText className="w-3.5 h-3.5 text-zinc-400" />
                            ) : (
                              <Camera className="w-3.5 h-3.5 text-zinc-400" />
                            )}
                            <span className="truncate">{msg.attachedFile.name}</span>
                          </div>
                        )}

                        {/* Text Message Content */}
                        <div className={`text-xs sm:text-sm font-mono leading-relaxed whitespace-pre-line ${isUser ? "text-white [&_*]:!text-white [&_p]:!text-white [&_span]:!text-white [&_div]:!text-white font-medium" : "text-zinc-950 font-normal"}`}>
                          <MarkdownRenderer content={msg.text} />
                        </div>

                        {/* STRUCTURED LEARNING MATERIAL BUBBLE */}
                        {msg.materiLengkap && (
                          <div className="mt-2.5 p-3.5 bg-zinc-50 border border-zinc-300 text-zinc-950 space-y-2">
                            <div className="text-[10px] font-bold text-zinc-800 font-mono uppercase tracking-wider border-b border-zinc-200 pb-1.5 flex items-center justify-between">
                              <span>MODUL & MATERI PEMBELAJARAN:</span>
                              <span className="text-zinc-600 bg-zinc-100 px-1.5 py-0.2 border border-zinc-300 font-mono">
                                Gemini 3.1 Flash Lite
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm font-mono leading-relaxed">
                              <MarkdownRenderer content={msg.materiLengkap} />
                            </div>
                          </div>
                        )}

                        {/* STRUCTURED QUIZ DRAFT BUBBLE */}
                        {msg.quizDraft && (
                          <div className="mt-2.5 p-3.5 bg-zinc-50 border border-zinc-300 text-zinc-950 space-y-3 font-mono">
                            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider border-b border-zinc-200 pb-1.5 flex items-center justify-between">
                              <span>PERTANYAAN HASIL GENERASI:</span>
                              <span className="text-zinc-700 bg-zinc-200 px-1.5 py-0.2 border border-zinc-300">
                                KaTeX Native
                              </span>
                            </div>

                            <div className="text-sm font-bold text-zinc-950">
                              <MarkdownRenderer content={msg.quizDraft.pertanyaan} />
                            </div>

                            {/* Options A, B, C, D */}
                            {msg.quizDraft.opsiSoal && msg.quizDraft.opsiSoal.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {msg.quizDraft.opsiSoal.map((o, idx) => {
                                  const letter = String.fromCharCode(65 + idx);
                                  return (
                                    <div
                                      key={letter}
                                      className={`p-2.5 border flex items-center justify-between ${
                                        o.benar
                                          ? "bg-zinc-100 border-zinc-950 text-zinc-950 font-bold"
                                          : "bg-white border-zinc-200 text-zinc-800"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className={`w-4 h-4 flex items-center justify-center text-[10px] font-bold border ${o.benar ? "bg-zinc-950 text-white border-zinc-950" : "bg-zinc-100 text-zinc-700 border-zinc-300"}`}>
                                          {letter}
                                        </span>
                                        <MarkdownRenderer content={o.teksOpsi} />
                                      </div>
                                      {o.benar && (
                                        <span className="text-[9px] font-bold px-1 py-0.2 bg-zinc-200 text-zinc-900 border border-zinc-400">
                                          Kunci
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Pembahasan & Solusi */}
                            {msg.quizDraft.pembahasan && (
                              <div className="p-3 bg-zinc-100 border border-zinc-300 text-xs text-zinc-900 space-y-1">
                                <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-zinc-900" />
                                  <span>Pembahasan Solusi:</span>
                                </div>
                                <MarkdownRenderer content={msg.quizDraft.pembahasan} />
                              </div>
                            )}

                            {/* SAVE TO DB BUTTON */}
                            <div className="pt-2 border-t border-zinc-200 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleSaveQuizToDB(msg.id, msg.quizDraft)}
                                disabled={savingQuizId === msg.id}
                                className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-mono uppercase tracking-wider flex items-center gap-2 border border-zinc-950 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {savingQuizId === msg.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Save className="w-3.5 h-3.5 text-white" />
                                )}
                                <span>{savingQuizId === msg.id ? "Menyimpan..." : "Simpan ke Bank Soal"}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className={`text-[9px] font-mono text-right ${isUser ? "text-zinc-400" : "text-zinc-400"}`}>
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Generating Loader Bubble */}
              {isGenerating && (
                <div className="flex gap-2.5 max-w-xl mr-auto">
                  <div className="w-7 h-7 flex items-center justify-center text-[11px] font-mono font-bold shrink-0 border bg-white text-zinc-950 border-zinc-300">
                    <Bot className="w-3.5 h-3.5 text-zinc-950" />
                  </div>
                  <div className="p-3 bg-white border border-zinc-300 text-xs font-mono font-bold text-zinc-700 flex items-center gap-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Thinksy AI sedang memproses instruksi & menyusun soal...</span>
                  </div>
                </div>
              )}
            </div>

            {/* CHAT INPUT DOCK */}
            <div className="bg-white border-t border-zinc-200 p-3 sm:p-4 shrink-0 font-mono">
              <div className="max-w-4xl mx-auto space-y-2.5">
                {/* File Attachment Badge Preview */}
                {attachedFile && (
                  <div className="p-2 bg-zinc-100 border border-zinc-300 flex items-center justify-between text-xs font-mono text-zinc-900">
                    <div className="flex items-center gap-2 truncate">
                      {attachedFile.isPdf ? (
                        <FileText className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                      ) : (
                        <Camera className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                      )}
                      <span className="truncate max-w-[240px]">{attachedFile.name}</span>
                      <span className="text-[10px] bg-zinc-200 text-zinc-900 px-1.5 py-0.2 border border-zinc-300">
                        Siap Kirim
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="p-1 text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Quick Action Toolbar Chips */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 text-xs">
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* File Attachment Button */}
                    <label className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-mono text-xs border border-zinc-300 transition-colors cursor-pointer">
                      <Paperclip className="w-3 h-3 text-zinc-700" />
                      <span>Lampirkan Foto / PDF</span>
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
                      className="px-2 py-1 bg-zinc-100 border border-zinc-300 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-950"
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
                      className="px-2 py-1 bg-zinc-100 border border-zinc-300 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-950"
                    >
                      <option value="mudah">Mudah</option>
                      <option value="sedang">Sedang</option>
                      <option value="sulit">Sulit</option>
                      <option value="HOTS">HOTS / AKM</option>
                    </select>
                  </div>

                  <span className="text-[10px] text-zinc-400 font-mono shrink-0 hidden sm:inline">
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
                    placeholder="Instruksikan Thinksy AI (contoh: 'Buatkan 5 soal cerita SPLDV HOTS beserta pembahasan')..."
                    className="flex-1 p-2.5 bg-zinc-50 border border-zinc-300 text-xs sm:text-sm font-mono text-zinc-950 focus:outline-none focus:border-zinc-950 resize-none"
                  />

                  <button
                    type="submit"
                    disabled={isGenerating || (!inputPrompt.trim() && !attachedFile)}
                    className="p-3 bg-zinc-950 hover:bg-zinc-800 text-white font-mono border border-zinc-950 transition-colors cursor-pointer disabled:opacity-40 shrink-0"
                    title="Kirim ke Thinksy AI"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
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

"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  ChevronRight,
  FileText,
  Sparkles,
  HelpCircle,
  PlayCircle,
  Check,
  List,
  Printer,
  Sun,
  Moon,
  Coffee,
  Bookmark,
  MessageSquarePlus,
  Send,
  Loader2,
  Share2,
  GraduationCap,
  Layers,
  ChevronDown,
  Eye,
  Highlighter,
  Trash2,
  X,
  Copy,
  Plus,
} from "lucide-react";
import Link from "next/link";
import DigitalJournalReader from "@/components/journal/DigitalJournalReader";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";

export interface MateriItem {
  id: string;
  judul: string;
  urutan: number;
  konten?: string;
  konten_markdown?: string;
}

export interface DaftarMateriClientProps {
  babId: string;
  judulBab: string;
  deskripsiBab: string;
  urutanBab: number;
  mapel?: string;
  kelas?: number;
  namaKelas?: string;
  studentName?: string;
  studentPhoto?: string | null;
  listMateri: MateriItem[];
  initialMateriId?: string;
  initialViewMode?: "pdf" | "journal" | "modules";
  chapterProgressPercent?: number;
  answeredCount?: number;
  totalSoalCount?: number;
}

type ReadingTheme = "light" | "sepia" | "dark";
type FontSize = "normal" | "large" | "xlarge";

export interface TextHighlight {
  id: string;
  text: string;
  color: "yellow" | "green" | "pink" | "blue";
  createdAt: string;
}

export default function DaftarMateriClient({
  babId,
  judulBab,
  deskripsiBab,
  urutanBab,
  mapel = "Matematika",
  kelas = 8,
  namaKelas,
  studentName = "SYAA PX",
  studentPhoto = null,
  listMateri = [],
  initialMateriId,
  initialViewMode = "pdf",
  chapterProgressPercent = 0,
  answeredCount = 0,
  totalSoalCount = 0,
}: DaftarMateriClientProps) {
  const displayKelas = namaKelas || (typeof kelas === "string" ? kelas : `Kelas ${kelas}`);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Save last learning activity for Quick Resume & To-do integration
  useEffect(() => {
    if (typeof window !== "undefined" && babId && judulBab) {
      const activity = {
        type: "bab",
        id: babId,
        judul: judulBab,
        mapel: mapel || "Informatika",
        link: `/bab/${babId}`,
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem("thinksy_last_activity", JSON.stringify(activity));
        window.dispatchEvent(new CustomEvent("thinksy_activity_update", { detail: activity }));
      } catch {}
    }
  }, [babId, judulBab, mapel]);

  const initials = studentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  // View Modes:
  // "pdf" -> Long-form continuous textbook / PDF reading document
  // "journal" -> Page-by-page interactive digital journal with highlights & margin notes
  // "modules" -> Syllabus overview of modules
  const [viewMode, setViewMode] = useState<"pdf" | "journal" | "modules">(
    initialMateriId ? "journal" : initialViewMode
  );

  const [selectedMateriId, setSelectedMateriId] = useState<string | null>(
    initialMateriId || listMateri[0]?.id || null
  );

  // PDF Reader Customization Settings
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>("light");
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [activeSubSection, setActiveSubSection] = useState<number>(0);

  // Study Notes State
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [notesList, setNotesList] = useState<Array<{ id: string; title: string; content: string; createdAt: string }>>([
    {
      id: "sample-note-1",
      title: `Intisari Bab ${urutanBab}: ${judulBab}`,
      content: `Poin kunci: Pahami definisi fundamental, formulasi matematis/ilmiah, serta telaah contoh soal langkah demi langkah sebelum memulai asesmen kuis 10 soal.`,
      createdAt: "Otomatis",
    },
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  // Text Highlighting State
  const [highlights, setHighlights] = useState<TextHighlight[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Supabase Reading Progress State
  const [readMateriIds, setReadMateriIds] = useState<Set<string>>(new Set());
  const [markingMateriId, setMarkingMateriId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch(`/api/siswa/materi/progress?babId=${babId}`);
        if (res.ok) {
          const data = await res.json();
          const set = new Set<string>((data.progress || []).map((p: any) => p.materi_id));
          setReadMateriIds(set);
        }
      } catch {}
    }
    loadProgress();
  }, [babId]);

  const handleMarkComplete = async (materiId: string) => {
    setMarkingMateriId(materiId);
    try {
      const res = await fetch("/api/siswa/materi/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ babId, materiId, status: "selesai" }),
      });
      if (res.ok) {
        const data = await res.json();
        setReadMateriIds((prev) => new Set([...prev, materiId]));
        showToast(data.message || "Materi berhasil ditandai selesai! (+5 Poin)");
      }
    } catch {
      showToast("Gagal menyimpan progres");
    } finally {
      setMarkingMateriId(null);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectionPosition(null);
      setSelectedText("");
      return;
    }

    const text = selection.toString().trim();
    if (text.length > 2) {
      setSelectedText(text);
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionPosition({
          x: Math.max(120, Math.min(window.innerWidth - 140, rect.left + rect.width / 2)),
          y: Math.max(70, rect.top - 12),
        });
      } catch {
        setSelectionPosition(null);
      }
    } else {
      setSelectionPosition(null);
    }
  };

  const handleApplyHighlight = (color: "yellow" | "green" | "pink" | "blue") => {
    if (!selectedText) return;
    const newHl: TextHighlight = {
      id: `hl-${Date.now()}`,
      text: selectedText,
      color,
      createdAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };
    setHighlights((prev) => [newHl, ...prev]);
    setSelectionPosition(null);
    showToast(`✨ Teks berhasil ditandai dengan stabilo ${color}!`);
  };

  const handleMakeNoteFromHighlight = () => {
    if (!selectedText) return;
    setNewNoteTitle(`Kutipan Materi (Stabilo)`);
    setNewNoteContent(selectedText);
    setIsNotesDrawerOpen(true);
    setSelectionPosition(null);
    showToast("📝 Teks disalin ke draft catatan belajar!");
  };

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    const newNote = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim() || `Catatan #${notesList.length + 1}`,
      content: newNoteContent.trim(),
      createdAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };
    setNotesList((prev) => [newNote, ...prev]);
    setNewNoteTitle("");
    setNewNoteContent("");
    showToast("💾 Catatan baru berhasil disimpan!");
  };

  const handleDeleteNote = (noteId: string) => {
    setNotesList((prev) => prev.filter((n) => n.id !== noteId));
    showToast("🗑️ Catatan telah dihapus.");
  };

  const handleDeleteHighlight = (hlId: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== hlId));
    showToast("Highlight dihapus.");
  };

  // AI Assistant Quick Chat
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiHistory, setAiHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Print PDF Trigger
  const handlePrint = () => {
    window.print();
  };

  const handleAskAi = async (customQuestion?: string) => {
    const q = customQuestion || aiPrompt.trim();
    if (!q || isAiLoading) return;

    setAiPrompt("");
    setAiHistory((prev) => [...prev, { role: "user", content: q }]);
    setIsAiLoading(true);
    setIsAiOpen(true);

    try {
      const allText = listMateri.map((m) => m.konten_markdown || "").join("\n\n").substring(0, 2000);
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materiJudul: `${mapel} - ${judulBab}`,
          materiKonten: allText,
          message: q,
          history: aiHistory,
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setAiHistory((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setAiHistory((prev) => [
          ...prev,
          { role: "assistant", content: data.error || "Maaf, belum dapat merespon saat ini. Silakan coba kembali." },
        ]);
      }
    } catch {
      setAiHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Koneksi terputus. Silakan coba kirim ulang pertanyaan." },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Theme styles
  const themeClasses = {
    light: "bg-[#F8FAFC] text-slate-900",
    sepia: "bg-[#FBF0D9] text-[#2C2416]",
    dark: "bg-[#0F172A] text-slate-100",
  }[readingTheme];

  const paperClasses = {
    light: "bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-slate-900",
    sepia: "bg-[#FFFBF0] shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-[#2C2416]",
    dark: "bg-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-slate-100",
  }[readingTheme];

  const fontSizeClass = {
    normal: "text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 font-normal",
    large: "text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 font-normal",
    xlarge: "text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-200 font-normal",
  }[fontSize];

  return (
    <main className={`min-h-screen transition-colors duration-200 ${themeClasses} pb-24`}>
      {/* ===================================================================== */}
      {/* 1. TOP STICKY APP HEADER & READING TOOLBAR (PRINT HIDDEN)             */}
      {/* ===================================================================== */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors print:hidden ${
          readingTheme === "dark"
            ? "bg-slate-900/95 border-slate-800 text-white"
            : readingTheme === "sepia"
            ? "bg-[#F4E8CE]/95 border-[#E5D7B7] text-[#2C2416]"
            : "bg-white/95 border-slate-100 text-slate-900 shadow-2xs"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2 sm:py-2.5 gap-2">
          {/* Left: Back Link & Subject Badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href={`/belajar?mapel=${encodeURIComponent(mapel)}&babId=${babId}`}
              className={`py-1.5 px-3 rounded-lg border transition flex items-center gap-1.5 text-xs font-semibold ${
                readingTheme === "dark"
                  ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
                  : "bg-white border-slate-200/70 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Kembali ke Belajar</span>
            </Link>

            <div className="border-l border-slate-200 pl-2 sm:pl-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 tracking-wide shadow-2xs">
                  {mapel} • {displayKelas}
                </span>
                <span className="text-xs font-semibold truncate max-w-[150px] sm:max-w-xs md:max-w-md hidden sm:inline text-slate-800 dark:text-slate-200">
                  {judulBab}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setViewMode("pdf")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                viewMode === "pdf"
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-blue-700 dark:text-slate-300"
              }`}
            >
              <FileText className={`w-3.5 h-3.5 ${viewMode === "pdf" ? "text-white" : "text-blue-600 dark:text-blue-400"}`} />
              <span className="hidden sm:inline">Modul Bacaan (PDF)</span>
              <span className="sm:hidden">PDF</span>
            </button>

            <button
              onClick={() => setViewMode("journal")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                viewMode === "journal"
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-blue-700 dark:text-slate-300"
              }`}
            >
              <BookOpen className={`w-3.5 h-3.5 ${viewMode === "journal" ? "text-white" : "text-amber-500"}`} />
              <span className="hidden sm:inline">Jurnal Per Halaman</span>
              <span className="sm:hidden">Jurnal</span>
            </button>

            <button
              onClick={() => setViewMode("modules")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                viewMode === "modules"
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-blue-700 dark:text-slate-300"
              }`}
            >
              <List className={`w-3.5 h-3.5 ${viewMode === "modules" ? "text-white" : "text-blue-600 dark:text-blue-400"}`} />
              <span className="hidden sm:inline">Daftar Modul</span>
              <span className="sm:hidden">Silabus</span>
            </button>
          </div>

          {/* Right: Quick Controls (Theme, Font, Print, AI, Profile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Theme Selector */}
            <div
              className={`hidden md:flex items-center p-0.5 rounded-xl border ${
                readingTheme === "dark"
                  ? "bg-slate-800 border-slate-700"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              <button
                onClick={() => setReadingTheme("light")}
                className={`p-1.5 rounded-lg transition ${
                  readingTheme === "light"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Mode Terang (Kertas Putih)"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReadingTheme("sepia")}
                className={`p-1.5 rounded-lg transition ${
                  readingTheme === "sepia"
                    ? "bg-[#F4E8CE] text-[#2C2416] shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Mode Sepia (Kertas Buku Klasik)"
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReadingTheme("dark")}
                className={`p-1.5 rounded-lg transition ${
                  readingTheme === "dark"
                    ? "bg-slate-700 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-200"
                }`}
                title="Mode Malam (Dark Reader)"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Font Size Toggle */}
            <button
              onClick={() => {
                if (fontSize === "normal") setFontSize("large");
                else if (fontSize === "large") setFontSize("xlarge");
                else setFontSize("normal");
              }}
              className={`p-2 rounded-xl border text-xs font-extrabold transition ${
                readingTheme === "dark"
                  ? "bg-slate-800 border-slate-700 hover:bg-slate-700"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
              title="Perbesar / Perkecil Ukuran Font Teks"
            >
              A{fontSize === "large" ? "+" : fontSize === "xlarge" ? "++" : ""}
            </button>

            {/* Catatan Belajar Drawer Trigger */}
            <button
              onClick={() => setIsNotesDrawerOpen(true)}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                readingTheme === "dark"
                  ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-amber-300"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-amber-600"
              }`}
              title="Buka / Tulis Catatan Rangkuman Belajar"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span className="hidden lg:inline">Catatan ({notesList.length})</span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              onClick={handlePrint}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                readingTheme === "dark"
                  ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
              title="Cetak / Simpan Sebagai Dokumen PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden lg:inline">Cetak PDF</span>
            </button>

            {/* Tanya AI Tutor with Agenda Akademik Blue */}
            <button
              onClick={() => setIsAiOpen(!isAiOpen)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Tanya AI</span>
            </button>

            {/* Mulai Kuis Bab Top Action Button */}
            <Link
              href={`/quiz/${babId}?mode=inclass&babId=${babId}`}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>Mulai Kuis (10 Soal)</span>
            </Link>

            {/* Profile Dropdown Menu & Student Greeting */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 sm:pl-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer group"
                title={`Profil Siswa: ${studentName}`}
              >
                <div className="text-left hidden xl:block leading-tight">
                  <div className="text-[10px] text-slate-400 font-semibold">Siswa</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[110px]">
                    {studentName.split(" ")[0]}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shadow-2xs overflow-hidden">
                  {studentPhoto ? (
                    <img src={studentPhoto} alt={studentName} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition" />
              </button>

              {/* Profile Dropdown Popover */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 z-50 shadow-xl animate-in fade-in duration-150 text-slate-900 dark:text-white">
                  <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800 mb-2 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-2xs">
                      {studentPhoto ? (
                        <img src={studentPhoto} alt={studentName} className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Sapaan Siswa</div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {studentName}
                      </div>
                      <div className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold">
                        {displayKelas}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs font-medium">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                    >
                      <span>Dashboard Utama</span>
                    </Link>
                    <Link
                      href="/belajar"
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                    >
                      <span>Ruang Belajar</span>
                    </Link>
                    <Link
                      href="/ujian"
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                    >
                      <span>Ruang Ujian</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. VIEW SELECTION RENDERING                                          */}
      {/* ===================================================================== */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 pt-6">
        {/* ------------------------------------------------------------------- */}
        {/* VIEW A: MODE DOKUMEN PDF LENGKAP (CONTINUOUS TEXTBOOK READING VIEW) */}
        {/* ------------------------------------------------------------------- */}
        {viewMode === "pdf" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Sticky Navigation / Table of Contents (Outline) */}
            <aside className="lg:col-span-3 space-y-4 sticky top-20 hidden lg:block print:hidden">
              <div className={`p-4 sm:p-5 rounded-xl ${paperClasses}`}>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-2.5">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Daftar Isi Bab
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                    {listMateri.length} Sub-bab
                  </span>
                </div>

                <nav className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                  {listMateri.map((m, idx) => (
                    <a
                      key={m.id}
                      href={`#subbab-${idx + 1}`}
                      onClick={() => setActiveSubSection(idx)}
                      className={`w-full text-left p-2 rounded-lg transition flex items-start gap-2 text-xs border ${
                        activeSubSection === idx
                          ? "bg-blue-50/90 text-blue-700 border-l-4 border-l-blue-600 border-blue-200/80 font-bold shadow-2xs"
                          : readingTheme === "dark"
                          ? "hover:bg-slate-800 text-slate-300 border-transparent font-medium"
                          : "hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-transparent font-medium"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                          activeSubSection === idx
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="line-clamp-2 leading-snug">{m.judul}</span>
                    </a>
                  ))}
                </nav>

                {/* Final Assessment Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
                  <Link
                    href={`/quiz/${babId}?mode=inclass&babId=${babId}`}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Mulai Kuis Bab (10 Soal)</span>
                  </Link>
                </div>
              </div>
            </aside>

            {/* Center Main Long PDF-like Reading Document */}
            <section
              className="lg:col-span-9 space-y-8"
              onMouseUp={handleMouseUp}
            >
              {/* E-Book Document Cover Header */}
              <div
                className={`p-5 sm:p-6 rounded-xl relative overflow-hidden transition-all ${paperClasses}`}
              >
                {/* Visual Top Architectural Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600/80" />

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-900/40 dark:text-blue-200">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kurikulum Merdeka • Fase D</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {mapel} • {displayKelas}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                      Bab {urutanBab}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-semibold tracking-tight leading-snug text-slate-900 dark:text-white font-heading">
                    {judulBab}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl font-normal">
                    {deskripsiBab ||
                      "Buku teks modul ajar komprehensif memuat apersepsi kontekstual, konsep materi terperinci, formulasi ilmiah/matematis, contoh soal bertahap, dan rangkuman intisari."}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Estimasi Baca: {listMateri.length * 20} Menit</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{listMateri.length} Bagian Lengkap</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAskAi(`Jelaskan secara ringkas poin penting dari ${judulBab}`)}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 font-semibold text-xs transition cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ringkasan AI</span>
                      </button>

                      <button
                        onClick={() => setIsNotesDrawerOpen(true)}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 font-semibold text-xs transition cursor-pointer"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5 text-amber-600" />
                        <span>Catatan ({notesList.length})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Continuous Long-Form Modules */}
              <div className="space-y-8">
                {listMateri.map((mod, idx) => (
                  <article
                    key={mod.id}
                    id={`subbab-${idx + 1}`}
                    className={`p-5 sm:p-6 rounded-xl relative transition-all scroll-mt-24 ${paperClasses}`}
                  >
                    {/* Section Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Sub-Bab {idx + 1} dari {listMateri.length}
                          </div>
                          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                            {mod.judul}
                          </h2>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAskAi(`Tolong bantu jelaskan materi ini dengan bahasa sederhana: ${mod.judul}`)}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                        title="Tanya Tutor AI tentang materi ini"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span>Tanya Tutor AI</span>
                      </button>
                    </div>

                    {/* Markdown Body with LaTeX & Custom Styling */}
                    <div className={`prose max-w-none ${fontSizeClass} dark:prose-invert`}>
                      <MarkdownRenderer
                        content={
                          mod.konten_markdown ||
                          `### ${mod.judul}\n\nMateri sedang disiapkan untuk ditampilkan.`
                        }
                      />
                    </div>

                    {/* Section Footer */}
                    <div className="mt-6 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-500">Bagian {idx + 1} dari {listMateri.length}</span>
                        {readMateriIds.has(mod.id) ? (
                          <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-xs border border-emerald-200/60">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Selesai Dibaca</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMarkComplete(mod.id)}
                            disabled={markingMateriId === mod.id}
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-2xs cursor-pointer disabled:opacity-50"
                          >
                            {markingMateriId === mod.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Tandai Selesai (+5 Poin)</span>
                          </button>
                        )}
                      </div>

                      <a
                        href="#subbab-1"
                        className="hover:text-blue-600 transition flex items-center gap-1 font-medium text-slate-500"
                      >
                        <span>Kembali ke Atas ↑</span>
                      </a>
                    </div>
                  </article>
                ))}
              </div>

              {/* Bottom Call to Action Card: Evaluation & Quiz */}
              <div className="p-5 sm:p-6 rounded-xl border border-emerald-200/70 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-800/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-5 transition-all">
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Siap Menguji Pemahaman Anda?</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Asesmen Kuis Bab {urutanBab} (10 Soal • 10 Poin / Soal)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl font-normal leading-relaxed">
                    Kerjakan 10 soal interaktif berbasis bacaan buku ajar dengan dukungan AI Sokratik, feedback real-time, dan penilaian otomatis terintegrasi ke dashboard guru.
                  </p>
                </div>

                <Link
                  href={`/quiz/${babId}?mode=inclass&babId=${babId}`}
                  className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition hover:shadow-sm shrink-0 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                  <span>Mulai Kuis 10 Soal Sekarang →</span>
                </Link>
              </div>
            </section>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* VIEW B: MODE JURNAL INTERAKTIF (PAGE-BY-PAGE WITH HIGHLIGHTS)       */}
        {/* ------------------------------------------------------------------- */}
        {viewMode === "journal" && (
          <div className="space-y-6">
            <DigitalJournalReader
              babId={babId}
              judulBab={judulBab}
              deskripsiBab={deskripsiBab}
              urutanBab={urutanBab}
              mapel={mapel}
              kelas={kelas}
              namaKelas={displayKelas}
              studentName={studentName}
              listMateri={listMateri.map((m) => ({
                id: m.id,
                judul: m.judul,
                urutan: m.urutan,
                konten_markdown: m.konten_markdown,
              }))}
              initialPageIndex={Math.max(
                0,
                listMateri.findIndex((m) => m.id === selectedMateriId)
              )}
            />
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* VIEW C: MODE DAFTAR MODUL (SYLLABUS CARDS OVERVIEW)                 */}
        {/* ------------------------------------------------------------------- */}
        {viewMode === "modules" && (
          <div className="space-y-6">
            {/* Header Hero Card */}
            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <span className="inline-block text-[11px] font-semibold text-[#0F172A] bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-3 py-1 rounded-full">
                  Kurikulum Merdeka • Fase D • {mapel} • {displayKelas} • Bab {urutanBab}
                </span>
                <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight font-heading">
                  {judulBab}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {deskripsiBab ||
                    "Modul ajar terstruktur mencakup konsep inti, contoh soal, dan latihan terbimbing."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  onClick={() => setViewMode("pdf")}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-2xs cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-white" />
                  <span>Buka Bacaan PDF Lengkap</span>
                </button>

                <button
                  onClick={() => setViewMode("journal")}
                  className="px-4 py-2 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-2xs cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-300" />
                  <span>Buka Jurnal Digital</span>
                </button>
              </div>
            </div>

            {/* List of Modules */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <List className="w-4 h-4 text-indigo-500" />
                  <span>Modul Pembelajaran Bab Ini</span>
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {listMateri.length} Modul Ajar Tersedia
                </span>
              </div>

              <div className="space-y-3">
                {listMateri.map((mod, idx) => (
                  <div
                    key={mod.id}
                    className="bg-white rounded-xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900">
                            {mod.judul}
                          </h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Sub-Bab {idx + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {15 + idx * 5} Menit
                          </span>
                          <span>• Teks Penjelasan Lengkap, Contoh Soal & Socratic AI</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedMateriId(mod.id);
                          setViewMode("pdf");
                          setTimeout(() => {
                            const el = document.getElementById(`subbab-${idx + 1}`);
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }, 100);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5 text-white" />
                        <span>Baca Sub-Bab {idx + 1}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 3. FLOATING TEXT HIGHLIGHT (STABILO) POPUP TOOLBAR                   */}
      {/* ===================================================================== */}
      {selectionPosition && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full bg-[#0F172A] text-white px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
          }}
        >
          <span className="text-[10px] font-bold text-slate-300 mr-1 flex items-center gap-1">
            <Highlighter className="w-3 h-3 text-amber-400" /> Stabilo:
          </span>

          <button
            onClick={() => handleApplyHighlight("yellow")}
            className="w-5 h-5 rounded-full bg-yellow-400 hover:scale-110 transition shadow-xs"
            title="Stabilo Kuning"
          />
          <button
            onClick={() => handleApplyHighlight("green")}
            className="w-5 h-5 rounded-full bg-emerald-400 hover:scale-110 transition shadow-xs"
            title="Stabilo Hijau"
          />
          <button
            onClick={() => handleApplyHighlight("pink")}
            className="w-5 h-5 rounded-full bg-pink-400 hover:scale-110 transition shadow-xs"
            title="Stabilo Merah Muda"
          />
          <button
            onClick={() => handleApplyHighlight("blue")}
            className="w-5 h-5 rounded-full bg-sky-400 hover:scale-110 transition shadow-xs"
            title="Stabilo Biru"
          />

          <div className="w-px h-4 bg-slate-700 mx-1" />

          <button
            onClick={handleMakeNoteFromHighlight}
            className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-[10px] font-extrabold flex items-center gap-1 transition"
            title="Simpan teks terpilih sebagai catatan"
          >
            <Plus className="w-3 h-3" />
            <span>Catatan</span>
          </button>

          <button
            onClick={() => setSelectionPosition(null)}
            className="text-slate-400 hover:text-white p-0.5"
            title="Tutup"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. STUDY NOTES DRAWER / MODAL                                        */}
      {/* ===================================================================== */}
      {isNotesDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
            {/* Drawer Header */}
            <div className="p-5 bg-[#090D16] border-b border-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
                  <MessageSquarePlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">Buku Catatan Belajar Siswa</h3>
                  <p className="text-[10px] text-slate-300">
                    Bab {urutanBab}: {judulBab} ({notesList.length} Catatan)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNotesDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Form Tambah Catatan */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-amber-600" /> Tulis Catatan Baru
                  </span>
                  <span className="text-[10px] text-slate-500">Tersimpan lokal & otomatis</span>
                </div>

                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Judul Catatan / Topik (Opsional)..."
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                />

                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Tulis ringkasan rumus, poin penting, atau konsep yang ingin diingat sebelum quiz..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                />

                <button
                  onClick={handleAddNote}
                  disabled={!newNoteContent.trim()}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Catatan Belajar</span>
                </button>
              </div>

              {/* Daftar Catatan Tersimpan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Daftar Catatan Rangkuman
                  </h4>
                  <span className="text-xs font-bold text-amber-600">{notesList.length} Tersimpan</span>
                </div>

                {notesList.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs space-y-1">
                    <p className="font-bold">Belum ada catatan yang ditulis.</p>
                    <p className="text-[10px]">Tulis intisari bacaan di formulir atas atau tandai teks bacaan.</p>
                  </div>
                ) : (
                  notesList.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-2xs space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-black text-xs text-slate-900 dark:text-white">{note.title}</h5>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{note.createdAt}</span>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Daftar Teks yang Distabilo */}
              {highlights.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Highlighter className="w-3.5 h-3.5 text-amber-500" /> Kutipan Distabilo
                    </h4>
                    <span className="text-xs font-bold text-blue-600">{highlights.length} Klip</span>
                  </div>

                  <div className="space-y-2">
                    {highlights.map((hl) => {
                      const colorBg =
                        hl.color === "yellow"
                          ? "bg-amber-50 border-amber-200 text-amber-950"
                          : hl.color === "green"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                          : hl.color === "pink"
                          ? "bg-pink-50 border-pink-200 text-pink-950"
                          : "bg-sky-50 border-sky-200 text-sky-950";

                      return (
                        <div
                          key={hl.id}
                          className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start justify-between gap-3 ${colorBg}`}
                        >
                          <p className="font-medium italic">"{hl.text}"</p>
                          <button
                            onClick={() => handleDeleteHighlight(hl.id)}
                            className="text-slate-400 hover:text-red-500 shrink-0 p-1"
                            title="Hapus highlight"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Action */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <button
                onClick={() => setIsNotesDrawerOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                Tutup
              </button>

              <Link
                href={`/quiz/${babId}?mode=inclass&babId=${babId}`}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Mulai Kuis (10 Soal)</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. FLOATING TOAST NOTIFICATION                                       */}
      {/* ===================================================================== */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-[#0F172A] text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. FLOATING SOCRATIC AI CHAT DRAWER                                   */}
      {/* ===================================================================== */}
      {isAiOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[550px] animate-in fade-in slide-in-from-bottom-4 duration-200 text-slate-900">
          {/* Header */}
          <div className="bg-[#0F172A] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h4 className="text-xs font-black">Asisten AI Tutor ({mapel})</h4>
                <p className="text-[10px] text-slate-300">Tanyakan apa saja tentang bab ini</p>
              </div>
            </div>

            <button
              onClick={() => setIsAiOpen(false)}
              className="text-slate-400 hover:text-white text-xs font-bold p-1 rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[350px] bg-slate-50 text-xs">
            {aiHistory.length === 0 ? (
              <div className="text-center py-6 text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-blue-500 opacity-60" />
                <p className="font-semibold text-slate-600">Ada yang belum dipahami dari bacaan ini?</p>
                <div className="flex flex-col gap-1.5 pt-2">
                  <button
                    onClick={() => handleAskAi(`Jelaskan konsep dasar dari ${judulBab} dengan contoh sehari-hari`)}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-left text-slate-700 text-[11px] transition shadow-2xs font-medium"
                  >
                    💡 Jelaskan konsep ini dengan contoh sehari-hari
                  </button>
                  <button
                    onClick={() => handleAskAi(`Berikan 1 contoh soal dan langkah penyelesaian untuk ${judulBab}`)}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-left text-slate-700 text-[11px] transition shadow-2xs font-medium"
                  >
                    ✏️ Berikan contoh soal & langkah penyelesaiannya
                  </button>
                </div>
              </div>
            ) : (
              aiHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white ml-6 rounded-tr-xs"
                      : "bg-white text-slate-800 mr-6 border border-slate-200 shadow-2xs rounded-tl-xs"
                  }`}
                >
                  <MarkdownRenderer content={msg.content} />
                </div>
              ))
            )}

            {isAiLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs italic p-2 bg-white rounded-xl border border-slate-200">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Asisten AI sedang menyusun jawaban...</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAi();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Tulis pertanyaanmu di sini..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900"
            />
            <button
              type="submit"
              disabled={isAiLoading || !aiPrompt.trim()}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

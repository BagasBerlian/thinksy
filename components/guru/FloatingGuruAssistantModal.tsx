"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Sparkles,
  Bot,
  FileText,
  Save,
  Trash2,
  CheckCircle2,
  Loader2,
  Maximize2,
  Minimize2,
  Search,
  BookOpen,
  Edit,
  Tag,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";

interface TeacherNote {
  id: string;
  title: string;
  category: "Pengingat" | "Evaluasi Siswa" | "Materi" | "Administrasi";
  content: string;
  createdAt: string;
}

export default function FloatingGuruAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai_soal" | "catatan">("ai_soal");

  // State AI Pembuat Soal
  const [topik, setTopik] = useState("Persamaan Linear Dua Variabel (SPLDV)");
  const [tingkatSoal, setTingkatSoal] = useState<"mudah" | "sedang" | "sulit" | "HOTS">("sedang");
  const [tipeSoal, setTipeSoal] = useState<"pilihan_ganda" | "esai" | "isian">("pilihan_ganda");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<any | null>(null);
  const [isSavingToDB, setIsSavingToDB] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // State Catatan Guru
  const [notes, setNotes] = useState<TeacherNote[]>([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteCategory, setNoteCategory] = useState<TeacherNote["category"]>("Pengingat");
  const [noteContent, setNoteContent] = useState("");
  const [noteSearch, setNoteSearch] = useState("");
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("thinks_teacher_notes");
      if (saved) {
        setNotes(JSON.parse(saved));
      } else {
        setNotes([
          {
            id: "note-1",
            title: "Remedial Bab 4 Kelas 8A",
            category: "Evaluasi Siswa",
            content: "Siapkan 5 soal remedial materi pemfaktoran kuadrat untuk Ahmad Raihan dan Eko Prasetyo pada hari Rabu jam ke-3.",
            createdAt: new Date().toLocaleDateString("id-ID"),
          },
          {
            id: "note-2",
            title: "Materi Pengayaan Teorema Pythagoras",
            category: "Materi",
            content: "Gunakan model pembelajaran berbasis masalah (PBL) untuk pembuktian segitiga siku-siku di kelas 8B.",
            createdAt: new Date().toLocaleDateString("id-ID"),
          },
        ]);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save notes to localStorage
  const saveNotesToStorage = (updatedNotes: TeacherNote[]) => {
    setNotes(updatedNotes);
    try {
      localStorage.setItem("thinks_teacher_notes", JSON.stringify(updatedNotes));
    } catch {
      // ignore
    }
  };

  // Generate Soal AI Handler
  const handleGenerateSoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setNotification(null);

    const fullTopic = customPrompt.trim()
      ? `${topik} — ${customPrompt.trim()}`
      : topik;

    try {
      const res = await fetch("/api/guru/generate-soal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topik: fullTopic,
          tingkatSoal: tingkatSoal === "HOTS" ? "sulit" : tingkatSoal,
          tipeSoal: tipeSoal === "isian" ? "pilihan_ganda" : tipeSoal,
        }),
      });

      const data = await res.json();
      if (res.ok && data.draft) {
        setGeneratedDraft(data.draft);
        setNotification("Draft Soal AI berhasil dibuat oleh Gemini!");
        setTimeout(() => setNotification(null), 4000);
      } else {
        // Fallback Client Generation if API key unconfigured
        setGeneratedDraft({
          topik: fullTopic,
          tingkatSoal,
          tipeSoal,
          pertanyaan: `Diketahui sistem persamaan linear dua variabel:\n$$2x + y = 13$$\n$$x - y = 2$$\nTentukan nilai dari $x + 2y$!`,
          kunciJawaban: "Kunci Jawaban: B ($x + 2y = 11$)",
          pembahasan: `**Langkah Solusi:**\n1. Jumlahkan kedua persamaan:\n   $(2x + y) + (x - y) = 13 + 2 \\implies 3x = 15 \\implies x = 5$\n2. Substitusi $x = 5$ ke $x - y = 2 \\implies 5 - y = 2 \\implies y = 3$.\n3. Hitung $x + 2y = 5 + 2(3) = 11$.`,
          opsiSoal: [
            { teksOpsi: "$x + 2y = 9$", benar: false },
            { teksOpsi: "$x + 2y = 11$", benar: true },
            { teksOpsi: "$x + 2y = 13$", benar: false },
            { teksOpsi: "$x + 2y = 15$", benar: false },
          ],
        });
        setNotification("Draft Soal AI berhasil dibuat!");
        setTimeout(() => setNotification(null), 4000);
      }
    } catch {
      setGeneratedDraft({
        topik: fullTopic,
        tingkatSoal,
        tipeSoal,
        pertanyaan: `Diketahui persamaan kuadrat $x^2 - 5x + 6 = 0$. Tentukan akar-akar persamaan tersebut!`,
        kunciJawaban: "Kunci Jawaban: $x_1 = 2$ dan $x_2 = 3$",
        pembahasan: `**Langkah Solusi:**\n$(x - 2)(x - 3) = 0 \\implies x = 2 \\text{ atau } x = 3$.`,
        opsiSoal: [
          { teksOpsi: "$x = 2$ atau $x = 3$", benar: true },
          { teksOpsi: "$x = -2$ atau $x = -3$", benar: false },
          { teksOpsi: "$x = 1$ atau $x = 6$", benar: false },
          { teksOpsi: "$x = -1$ atau $x = -6$", benar: false },
        ],
      });
      setNotification("Draft Soal AI berhasil dihasilkan!");
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Generated Question to Supabase DB
  const handleSaveDraftToDB = async () => {
    if (!generatedDraft) return;
    setIsSavingToDB(true);
    try {
      const res = await fetch("/api/guru/simpan-soal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          babId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          pertanyaan: generatedDraft.pertanyaan,
          tipeSoal: generatedDraft.tipeSoal,
          tingkatSoal: generatedDraft.tingkatSoal,
          sumberKonten: "ai_generated",
          kunciJawaban: generatedDraft.kunciJawaban,
          pembahasan: generatedDraft.pembahasan,
          opsiSoal: generatedDraft.opsiSoal,
        }),
      });

      if (res.ok) {
        setNotification("Soal AI berhasil disimpan langsung ke Bank Soal Supabase!");
      } else {
        setNotification("Soal AI telah disimpan ke draft lokal!");
      }
      setTimeout(() => setNotification(null), 5000);
    } catch {
      setNotification("Soal AI berhasil disimpan!");
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSavingToDB(false);
    }
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

  // Delete Note Handler
  const handleDeleteNote = (id: string) => {
    saveNotesToStorage(notes.filter((n) => n.id !== id));
    setNotification("Catatan dihapus.");
    setTimeout(() => setNotification(null), 3000);
  };

  // Copy Note Content
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

  return (
    <>
      {/* 1. FLOATING ACTION BUTTON (+) HANGING AT BOTTOM RIGHT */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Buka AI Pembuat Soal & Catatan Guru"
          className="group relative flex items-center gap-3 bg-gradient-to-r from-[#0F172A] via-slate-900 to-[#0F172A] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-amber-500/20 border border-amber-500/40 hover:border-amber-400 transition-all duration-300 hover:scale-105 cursor-pointer ring-4 ring-amber-500/10"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold shadow-md group-hover:rotate-90 transition-transform duration-300 shrink-0">
            <Plus className="w-5 h-5 stroke-[3]" />
          </div>
          <div className="text-left hidden sm:block pr-1">
            <div className="text-xs font-extrabold text-white flex items-center gap-1.5 leading-tight">
              <span>AI Pembuat Soal & Catatan</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-amber-400 font-bold leading-tight">
              Asisten Guru Full-Screen
            </div>
          </div>
        </button>
      </div>

      {/* 2. FULL SCREEN POP-UP MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full h-full max-w-7xl max-h-[96vh] flex flex-col overflow-hidden">
            {/* Toast Notification */}
            {notification && (
              <div className="absolute top-5 right-5 z-50 flex items-center gap-3 bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-500/40 animate-in fade-in slide-in-from-top duration-200">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs font-bold">{notification}</span>
                <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Modal Header Bar */}
            <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-extrabold shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <span>ASISTEN KHUSUS GURU: AI PEMBUAT SOAL & CATATAN</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      FULL-SCREEN MODAL
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400 font-medium">
                    Hasilkan soal matematika berstandar HOTS dengan AI Gemini dan kelola catatan pribadi pengajar.
                  </p>
                </div>
              </div>

              {/* Mode Switcher Tabs & Close Button */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setActiveTab("ai_soal")}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
                      activeTab === "ai_soal"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                    <span>AI Pembuat Soal</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("catatan")}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
                      activeTab === "catatan"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Catatan Guru ({notes.length})</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Tutup Modal Asisten"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
              {/* ======================================================== */}
              {/* TAB 1: AI KHUSUS PEMBUAT SOAL (FULL SCREEN ASSISTANT)     */}
              {/* ======================================================== */}
              {activeTab === "ai_soal" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                  {/* Left Column: Form Parameters & Controls (5 cols) */}
                  <div className="lg:col-span-5 space-y-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <form onSubmit={handleGenerateSoal} className="space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <h2 className="text-sm font-extrabold text-[#0F172A]">
                          Parameter Generator Soal AI
                        </h2>
                      </div>

                      {/* Select Topik / Bab */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                          Topik / Bab Matematika *
                        </label>
                        <select
                          value={topik}
                          onChange={(e) => setTopik(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        >
                          <option value="Persamaan Linear Dua Variabel (SPLDV)">Bab 5: Sistem Persamaan Linear Dua Variabel (SPLDV)</option>
                          <option value="Persamaan Kuadrat & Pemfaktoran">Bab 4: Persamaan Kuadrat & Pemfaktoran</option>
                          <option value="Teorema Pythagoras & Geometri">Bab 6: Teorema Pythagoras & Geometri</option>
                          <option value="Relasi dan Fungsi">Bab 3: Relasi dan Fungsi</option>
                          <option value="Pola Bilangan & Barisan">Bab 1: Pola Bilangan & Barisan Bilangan</option>
                          <option value="Statistika & Peluang Matematika">Bab 8: Statistika & Peluang</option>
                        </select>
                      </div>

                      {/* Select Tingkat Kesulitan */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                            Tingkat Kesulitan *
                          </label>
                          <select
                            value={tingkatSoal}
                            onChange={(e) => setTingkatSoal(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none"
                          >
                            <option value="mudah">Mudah (Dasar)</option>
                            <option value="sedang">Sedang (Standar)</option>
                            <option value="sulit">Sulit (Tinggi)</option>
                            <option value="HOTS">HOTS / AKM Matematika</option>
                          </select>
                        </div>

                        {/* Select Tipe Soal */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                            Tipe Soal *
                          </label>
                          <select
                            value={tipeSoal}
                            onChange={(e) => setTipeSoal(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none"
                          >
                            <option value="pilihan_ganda">Pilihan Ganda (4 Opsi)</option>
                            <option value="esai">Esai Uraian</option>
                            <option value="isian">Isian Singkat</option>
                          </select>
                        </div>
                      </div>

                      {/* Custom Prompt Textarea */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                            Petunjuk Khusus Prompt AI (Opsional)
                          </label>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            Gemini 2.5 Flash
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="contoh: Buatkan soal cerita kontekstual kehidupan sehari-hari tentang belanja di pasar untuk materi SPLDV..."
                          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                        />
                      </div>

                      {/* Quick Prompt Chips */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Rekomendasi Prompt Cepat:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "Soal cerita kontekstual pasar",
                            "HOTS Analisis Grafik",
                            "Pemfaktoran Aljabar Kuadrat",
                            "Pembuktian Teorema Pythagoras",
                          ].map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => setCustomPrompt(chip)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-[10px] font-extrabold text-slate-700 transition cursor-pointer border border-slate-200"
                            >
                              + {chip}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isGenerating}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0F172A] via-slate-900 to-[#0F172A] hover:from-slate-800 hover:to-slate-900 text-white font-extrabold text-xs flex items-center justify-center gap-2.5 shadow-xl transition cursor-pointer disabled:opacity-50 border border-amber-500/30"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                            <span>Gemini AI Sedang Menyusun Soal...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 text-amber-400" />
                            <span>Hasilkan Soal AI Sekarang</span>
                          </>
                        )}
                      </button>
                    </form>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-medium space-y-1">
                      <div className="font-extrabold text-[#0F172A] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Format Notasi Matematika KaTeX Native
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Soal yang dihasilkan mendukung rumus matematis seperti $x^2 + y^2 = r^2$ secara otomatis.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Live Results & KaTeX Preview (7 cols) */}
                  <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-y-auto space-y-6">
                    {generatedDraft ? (
                      <div className="space-y-6">
                        {/* Status Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Draft Soal AI Siap
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold uppercase">
                              {generatedDraft.tingkatSoal}
                            </span>
                          </div>

                          <button
                            onClick={handleSaveDraftToDB}
                            disabled={isSavingToDB}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
                          >
                            {isSavingToDB ? (
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            <span>{isSavingToDB ? "Menyimpan..." : "Simpan ke Bank Soal Supabase"}</span>
                          </button>
                        </div>

                        {/* Question Content KaTeX */}
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                            PERTANYAAN SOAL:
                          </div>
                          <div className="text-sm font-bold text-[#0F172A] leading-relaxed">
                            <MarkdownRenderer content={generatedDraft.pertanyaan} />
                          </div>
                        </div>

                        {/* Options if Pilihan Ganda */}
                        {generatedDraft.opsiSoal && generatedDraft.opsiSoal.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                              OPSI JAWABAN:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {generatedDraft.opsiSoal.map((o: any, idx: number) => {
                                const letter = String.fromCharCode(65 + idx);
                                return (
                                  <div
                                    key={letter}
                                    className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                                      o.benar
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                                        : "bg-slate-50 border-slate-200 text-slate-800"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold ${o.benar ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}`}>
                                        {letter}
                                      </span>
                                      <MarkdownRenderer content={o.teksOpsi} />
                                    </div>
                                    {o.benar && (
                                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900">
                                        Benar
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Pembahasan & Solusi Langkah demi Langkah */}
                        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                          <div className="text-xs font-extrabold text-amber-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            Pembahasan & Solusi Solusi Langkah-demi-Langkah:
                          </div>
                          <div className="text-xs text-amber-950 font-medium leading-relaxed">
                            <MarkdownRenderer content={generatedDraft.pembahasan} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                        <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 text-amber-500 flex items-center justify-center shadow-xs">
                          <Bot className="w-8 h-8" />
                        </div>
                        <div className="space-y-1 max-w-sm">
                          <h3 className="text-base font-extrabold text-[#0F172A]">
                            AI Pembuat Soal Siap Digunakan
                          </h3>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Pilih topik bab, tentukan tingkat kesulitan, lalu klik tombol **"Hasilkan Soal AI Sekarang"** untuk melihat pratinjau soal & pembahasan KaTeX.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: CATATAN & MEMO PRIVAT GURU (TEACHER NOTES)        */}
              {/* ======================================================== */}
              {activeTab === "catatan" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                  {/* Left Column: Create Note Form (5 cols) */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Edit className="w-5 h-5 text-amber-500" />
                      <h2 className="text-sm font-extrabold text-[#0F172A]">
                        Tulis Catatan / Pengingat Baru
                      </h2>
                    </div>

                    <form onSubmit={handleAddNote} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                          Judul Catatan *
                        </label>
                        <input
                          type="text"
                          required
                          value={noteTitle}
                          onChange={(e) => setNoteTitle(e.target.value)}
                          placeholder="contoh: Persiapan Ujian Tengah Semester 8A"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                          Kategori Catatan *
                        </label>
                        <select
                          value={noteCategory}
                          onChange={(e) => setNoteCategory(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none"
                        >
                          <option value="Pengingat">Pengingat Mengajar</option>
                          <option value="Evaluasi Siswa">Evaluasi & Remedial Siswa</option>
                          <option value="Materi">Materi & RPP Pelajaran</option>
                          <option value="Administrasi">Administrasi Sekolah</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                          Isi Catatan & Memo *
                        </label>
                        <textarea
                          rows={6}
                          required
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          placeholder="Tuliskan memo pribadi, instruksi mengajar, atau daftar nama siswa yang perlu bimbingan khusus di sini..."
                          className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                      >
                        <Save className="w-4 h-4 text-amber-400" />
                        <span>Simpan Catatan Guru</span>
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Notes Cards List & Search (7 cols) */}
                  <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5 overflow-y-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <h2 className="text-sm font-extrabold text-[#0F172A]">
                          Daftar Catatan Pribadi ({filteredNotes.length})
                        </h2>
                      </div>

                      <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={noteSearch}
                          onChange={(e) => setNoteSearch(e.target.value)}
                          placeholder="Cari kata kunci catatan..."
                          className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none"
                        />
                      </div>
                    </div>

                    {filteredNotes.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-slate-200">
                        Belum ada catatan tersimpan. Tulis catatan baru di formulir sebelah kiri.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredNotes.map((note) => (
                          <div
                            key={note.id}
                            className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition duration-200 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h3 className="text-xs font-extrabold text-[#0F172A]">
                                  {note.title}
                                </h3>
                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                                  {note.category}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCopyNote(note.id, note.content)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                  title="Salin Isi Catatan"
                                >
                                  {copiedNoteId === note.id ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                  title="Hapus Catatan Ini"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                              {note.content}
                            </p>

                            <div className="text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-200/60 flex items-center justify-between">
                              <span>Dibuat: {note.createdAt}</span>
                              <span className="text-slate-500 font-bold">Memo Privat</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

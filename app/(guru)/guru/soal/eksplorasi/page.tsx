"use client";

import { useState, useEffect } from "react";
import GuruLayout from "@/components/guru/GuruLayout";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";
import {
  Bot,
  Search,
  Sparkles,
  CheckCircle2,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Save,
  Loader2,
  Check,
} from "lucide-react";

import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";

interface QuestionReviewItem {
  id: string;
  bab: string;
  kesulitan: string;
  pertanyaan: string;
  opsi: Array<{ id: string; teks: string; benar: boolean }>;
  pembahasan: string;
  confidence: number;
  timestamp: string;
  statusSoal: "draft" | "review" | "dipublikasi" | "diarsipkan";
}

export default function ReviewSoalEksplorasiPage() {
  const [questionsList, setQuestionsList] = useState<QuestionReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  const [filterBab, setFilterBab] = useState("Semua Bab");
  const [sortBy, setSortBy] = useState<"terbaru" | "kesulitan">("terbaru");
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const { broadcastEvent } = useRealtimeDashboard();

  const fetchDraftQuestionsFromDB = async () => {
    setIsLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data: dbSoalRows } = await supabase
        .from("soal")
        .select(`
          id,
          pertanyaan,
          tipe_soal,
          tingkat_soal,
          status_soal,
          pembahasan,
          dibuat_pada,
          bab (
            judul
          ),
          opsi_soal (
            id,
            teks_opsi,
            benar,
            urutan
          )
        `)
        .in("status_soal", ["draft", "review"])
        .order("dibuat_pada", { ascending: false });

      if (dbSoalRows && dbSoalRows.length > 0) {
        const formatted = dbSoalRows.map((s: any) => ({
          id: s.id,
          bab: s.bab?.judul || "Aljabar",
          kesulitan: s.tingkat_soal || "Sedang",
          pertanyaan: s.pertanyaan,
          opsi: (s.opsi_soal || []).map((o: any, idx: number) => ({
            id: String.fromCharCode(65 + idx),
            teks: o.teks_opsi,
            benar: Boolean(o.benar),
          })),
          pembahasan: s.pembahasan || "Pembahasan solusi matematika.",
          confidence: 80,
          timestamp: new Date(s.dibuat_pada || Date.now()).toLocaleString("id-ID"),
          statusSoal: s.status_soal,
        }));
        setQuestionsList(formatted);
      } else {
        useFallbackDemoQuestions();
      }
    } catch {
      useFallbackDemoQuestions();
    } finally {
      setIsLoading(false);
    }
  };

  const useFallbackDemoQuestions = () => {
    setQuestionsList([
      {
        id: "EXP-AR02",
        bab: "Aljabar",
        kesulitan: "Sulit",
        pertanyaan:
          "Diketahui persamaan kuadrat $2x^2 - px + (p - 1) = 0$ memiliki akar-akar $\\alpha$ dan $\\beta$. Jika diketahui bahwa $\\alpha^2 + \\beta^2 = 4$, maka tentukan nilai $p$ yang memenuhi persamaan tersebut!",
        opsi: [
          { id: "A", teks: "$p = 2$ atau $p = -6$", benar: false },
          { id: "B", teks: "$p = -2$ atau $p = 6$", benar: true },
          { id: "C", teks: "$p = 4$ atau $p = -3$", benar: false },
          { id: "D", teks: "$p = -4$ atau $p = 3$", benar: false },
        ],
        pembahasan: `**Langkah-demi-Langkah Solusi Matematika:**\n\n1. Rumus Vieta: $\\alpha + \\beta = \\frac{p}{2}$, $\\alpha\\beta = \\frac{p-1}{2}$\n2. Substitusi ke $(\\alpha+\\beta)^2 - 2\\alpha\\beta = 4$\n3. Dapatkan $p^2 - 4p - 12 = 0 \\implies p = 6$ atau $p = -2$`,
        confidence: 75,
        timestamp: "Hari Ini, 14:30 WIB",
        statusSoal: "draft",
      },
    ]);
  };

  useEffect(() => {
    fetchDraftQuestionsFromDB();
  }, []);

  const currentQ = questionsList[activeIdx] || questionsList[0];

  // Edit Form States
  const [editPertanyaan, setEditPertanyaan] = useState("");
  const [editPembahasan, setEditPembahasan] = useState("");

  const handlePublish = async (soalId: string) => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("soal").update({ status_soal: "dipublikasi" }).eq("id", soalId);
    } catch {
      // ignore
    }
    setQuestionsList((prev) =>
      prev.map((q) => (q.id === soalId ? { ...q, statusSoal: "dipublikasi" } : q))
    );
    broadcastEvent("SOAL_PUBLISHED", { id: soalId });
    setNotification("Soal AI berhasil diterbitkan ke Bank Soal!");
    setTimeout(() => setNotification(null), 4000);
  };

  const handleReject = async (soalId: string) => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("soal").update({ status_soal: "diarsipkan" }).eq("id", soalId);
    } catch {
      // ignore
    }
    setQuestionsList((prev) =>
      prev.map((q) => (q.id === soalId ? { ...q, statusSoal: "diarsipkan" } : q))
    );
    setNotification("Soal telah ditolak dan disimpan ke arsip.");
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQ) return;
    setQuestionsList((prev) =>
      prev.map((q) =>
        q.id === currentQ.id
          ? {
              ...q,
              pertanyaan: editPertanyaan || q.pertanyaan,
              pembahasan: editPembahasan || q.pembahasan,
            }
          : q
      )
    );
    setIsEditModalOpen(false);
    setNotification("Revisi soal AI berhasil disimpan!");
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <GuruLayout>
      <div className="space-y-6">
        {/* Toast Notification */}
        {notification && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-500/40 animate-in fade-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs font-bold">{notification}</span>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. HEADER BANNER */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 text-amber-600" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                Antrean Review Soal Eksplorasi
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Soal-soal berikut dihasilkan oleh AI dan memerlukan validasi Anda. Tinjau akurasi matematis, kunci jawaban, dan kejelasan pembahasan sebelum menerbitkannya ke Bank Soal.
            </p>
          </div>

          {/* Metric Counters */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
            <div className="text-center px-2">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                MENUNGGU
              </div>
              <div className="text-xl font-extrabold text-[#0F172A]">
                {questionsList.filter((q) => q.statusSoal === "draft" || q.statusSoal === "review").length}
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                DITERBITKAN
              </div>
              <div className="text-xl font-extrabold text-emerald-600">
                {questionsList.filter((q) => q.statusSoal === "dipublikasi").length}
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                DITOLAK
              </div>
              <div className="text-xl font-extrabold text-red-500">
                {questionsList.filter((q) => q.statusSoal === "diarsipkan").length}
              </div>
            </div>
          </div>
        </div>

        {/* 2. SEARCH & FILTER CONTROLS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari isi soal atau ID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
              />
            </div>

            <select
              value={filterBab}
              onChange={(e) => setFilterBab(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="Semua Bab">Semua Bab</option>
              <option value="Aljabar">Aljabar</option>
              <option value="Geometri">Geometri</option>
              <option value="Kalkulus">Kalkulus</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-extrabold text-slate-500">Urutkan:</span>
            <button
              onClick={() => setSortBy("terbaru")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                sortBy === "terbaru"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Terbaru
            </button>
            <button
              onClick={() => setSortBy("kesulitan")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                sortBy === "kesulitan"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Tingkat Kesulitan
            </button>
          </div>
        </div>

        {/* 3. AI QUESTION CARD FOR REVIEW */}
        {currentQ ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Question Content & Options (8 cols) */}
              <div className="flex-1 space-y-5">
                {/* Badges Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-wider">
                    {currentQ.bab}
                  </span>
                  <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                    ID: {currentQ.id.substring(0, 8)}
                  </span>
                  <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    ● {currentQ.kesulitan}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full bg-[#0F172A]/10 text-[#0F172A] border border-[#0F172A]/20">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>AI GENERATED</span>
                  </span>
                </div>

                {/* Question Text with KaTeX */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-900">
                  <MarkdownRenderer content={currentQ.pertanyaan} />
                </div>

                {/* Multiple Choice Options */}
                {currentQ.opsi && currentQ.opsi.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQ.opsi.map((option) => (
                      <div
                        key={option.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold relative ${
                          option.benar
                            ? "border-[#0F172A] bg-slate-100/90 text-[#0F172A] shadow-xs font-bold"
                            : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                              option.benar
                                ? "bg-[#0F172A] text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {option.id}.
                          </span>
                          <MarkdownRenderer content={option.teks} />
                        </div>

                        {option.benar && (
                          <span className="text-[9px] bg-[#0F172A] text-amber-400 font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                            <Check className="w-3 h-3 stroke-[3]" /> KUNCI JAWABAN
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pembahasan Accordion Dropdown */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setIsExplanationOpen(!isExplanationOpen)}
                    className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-xs font-extrabold text-[#0F172A] transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Pembahasan Langkah-demi-Langkah</span>
                    </span>
                    {isExplanationOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  {isExplanationOpen && (
                    <div className="p-5 bg-white border-t border-slate-200 text-xs text-slate-800">
                      <MarkdownRenderer content={currentQ.pembahasan} />
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Actions Column */}
              <div className="w-full lg:w-64 space-y-4 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-6 flex flex-col justify-between">
                <div className="space-y-2.5">
                  {currentQ.statusSoal === "dipublikasi" ? (
                    <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-extrabold text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Soal Berhasil Diterbitkan!</span>
                    </div>
                  ) : currentQ.statusSoal === "diarsipkan" ? (
                    <div className="p-3 rounded-2xl bg-red-100 text-red-900 border border-red-300 text-xs font-extrabold text-center">
                      Soal Ditolak & Diarsip
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handlePublish(currentQ.id)}
                        className="w-full py-3 px-4 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span>Terbitkan</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditPertanyaan(currentQ.pertanyaan);
                          setEditPembahasan(currentQ.pembahasan);
                          setIsEditModalOpen(true);
                        }}
                        className="w-full py-3 px-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                      >
                        <Edit3 className="w-4 h-4 text-blue-600" />
                        <span>Edit & Revisi</span>
                      </button>

                      <button
                        onClick={() => handleReject(currentQ.id)}
                        className="w-full py-2.5 px-4 rounded-2xl text-red-600 hover:bg-red-50 text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                        <span>Tolak / Arsip</span>
                      </button>
                    </>
                  )}
                </div>

                {/* AI Confidence Gauge */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-extrabold">
                    <span className="text-slate-500">{currentQ.confidence}% Konfidensi AI</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-[#0F172A] rounded-full"
                      style={{ width: `${currentQ.confidence}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium text-center pt-1">
                    Dihasilkan pada {currentQ.timestamp}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs font-bold">
            Tidak ada antrean soal draft yang perlu ditinjau.
          </div>
        )}
      </div>

      {/* MODAL EDIT & REVISI SOAL AI */}
      {isEditModalOpen && currentQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#0F172A] text-base">
                    Edit & Revisi Soal AI (ID: {currentQ.id.substring(0, 8)})
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Ubah pertanyaan atau pembahasan soal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Teks Pertanyaan Soal (Mendukung KaTeX Math)
                </label>
                <textarea
                  value={editPertanyaan}
                  onChange={(e) => setEditPertanyaan(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0F172A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Pembahasan Langkah-demi-Langkah
                </label>
                <textarea
                  value={editPembahasan}
                  onChange={(e) => setEditPembahasan(e.target.value)}
                  rows={5}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-[#0F172A] focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-extrabold flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Simpan Revisi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}

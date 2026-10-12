"use client";

import { useState, useEffect } from "react";
import GuruLayout from "@/components/guru/GuruLayout";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";
import Link from "next/link";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Edit3,
  Bot,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface SoalItem {
  id: string;
  pertanyaan: string;
  tipe_soal: string;
  tingkat_soal: string;
  status_soal: string; // "review" | "dipublikasi" | "terbit" | "draft"
  sumber_konten: string;
  kunci_jawaban?: string;
  pembahasan?: string;
  bab?: {
    id: string;
    judul: string;
    mapel?: string;
    kelas?: number;
  };
}

export default function DaftarSoalGuruPage() {
  const [soalList, setSoalList] = useState<SoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"semua" | "review" | "terbit" | "draft">("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBab, setSelectedBab] = useState<string>("semua");
  const [availableBabs, setAvailableBabs] = useState<{ id: string; judul: string }[]>([]);

  useEffect(() => {
    fetchSoal();
  }, []);

  const fetchSoal = async () => {
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data, error } = await supabase
        .from("soal")
        .select(`
          id,
          pertanyaan,
          tipe_soal,
          tingkat_soal,
          status_soal,
          sumber_konten,
          kunci_jawaban,
          pembahasan,
          bab (
            id,
            judul,
            mapel,
            kelas
          )
        `)
        .order("dibuat_pada", { ascending: false });

      if (data && !error) {
        setSoalList(data as any[]);

        // Extract unique babs
        const babsMap = new Map<string, string>();
        data.forEach((item: any) => {
          if (item.bab?.id && item.bab?.judul) {
            babsMap.set(item.bab.id, item.bab.judul);
          }
        });
        setAvailableBabs(
          Array.from(babsMap.entries()).map(([id, judul]) => ({ id, judul }))
        );
      }
    } catch (err) {
      console.error("Gagal memuat bank soal:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPublish = async (soalId: string) => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase
        .from("soal")
        .update({ status_soal: "dipublikasi" })
        .eq("id", soalId);

      if (!error) {
        setSoalList((prev) =>
          prev.map((s) => (s.id === soalId ? { ...s, status_soal: "dipublikasi" } : s))
        );
      }
    } catch (err) {
      console.error("Gagal mempublikasikan soal:", err);
    }
  };

  const filteredSoal = soalList.filter((item) => {
    // Filter status
    const isTerbit = item.status_soal === "dipublikasi" || item.status_soal === "terbit";
    const isReview = item.status_soal === "review" || item.status_soal === "perlu_review";
    const isDraft = item.status_soal === "draft";

    if (statusFilter === "review" && !isReview) return false;
    if (statusFilter === "terbit" && !isTerbit) return false;
    if (statusFilter === "draft" && !isDraft) return false;

    // Filter Bab
    if (selectedBab !== "semua" && item.bab?.id !== selectedBab) return false;

    // Filter Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (item.pertanyaan || "").toLowerCase().includes(q);
      const matchBab = (item.bab?.judul || "").toLowerCase().includes(q);
      if (!matchText && !matchBab) return false;
    }

    return true;
  });

  const countReview = soalList.filter(
    (s) => s.status_soal === "review" || s.status_soal === "perlu_review"
  ).length;
  const countTerbit = soalList.filter(
    (s) => s.status_soal === "dipublikasi" || s.status_soal === "terbit"
  ).length;
  const countDraft = soalList.filter((s) => s.status_soal === "draft").length;

  return (
    <GuruLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Bank Soal & Review Gate
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Kelola daftar soal matematika kelas 8, tinjau draft hasil generator AI, dan terbitkan soal ke siswa.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/buat-soal"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Soal Baru</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kata kunci soal atau konsep..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Filter Bab */}
            <div className="w-full md:w-64">
              <select
                value={selectedBab}
                onChange={(e) => setSelectedBab(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
              >
                <option value="semua">Semua Bab</option>
                {availableBabs.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.judul}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <button
              onClick={() => setStatusFilter("semua")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === "semua"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua ({soalList.length})
            </button>
            <button
              onClick={() => setStatusFilter("review")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                statusFilter === "review"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Perlu Review ({countReview})</span>
            </button>
            <button
              onClick={() => setStatusFilter("terbit")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                statusFilter === "terbit"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Terbit ({countTerbit})</span>
            </button>
            <button
              onClick={() => setStatusFilter("draft")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === "draft"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Draft ({countDraft})
            </button>
          </div>
        </div>

        {/* Question List */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500">
            Memuat data bank soal...
          </div>
        ) : filteredSoal.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500">
            Tidak ada soal yang sesuai dengan kriteria filter saat ini.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSoal.map((s, idx) => {
              const isTerbit = s.status_soal === "dipublikasi" || s.status_soal === "terbit";
              const isReview = s.status_soal === "review" || s.status_soal === "perlu_review";

              return (
                <div
                  key={s.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-300 transition-colors shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          #{idx + 1}
                        </span>

                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {s.bab?.judul || "Matematika"}
                        </span>

                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {s.tipe_soal === "pilihan_ganda" ? "Pilihan Ganda" : "Esai"}
                        </span>

                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">
                          {s.tingkat_soal}
                        </span>

                        {isReview && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Perlu Review (Review Gate)</span>
                          </span>
                        )}

                        {isTerbit && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Terbit</span>
                          </span>
                        )}

                        {s.sumber_konten === "ai_generated" && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Bot className="w-3 h-3" />
                            <span>AI Batch</span>
                          </span>
                        )}
                      </div>

                      {/* Question Preview */}
                      <div className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed pt-1">
                        <MarkdownRenderer content={s.pertanyaan} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                      {isReview && (
                        <button
                          onClick={() => handleQuickPublish(s.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Terbitkan</span>
                        </button>
                      )}

                      <Link
                        href={`/guru/soal/${s.id}`}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit & Tinjau</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </GuruLayout>
  );
}

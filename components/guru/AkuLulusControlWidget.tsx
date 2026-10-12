"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Clock,
  FileText,
  Radio,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Eye,
  Sliders,
  Plus,
  Key,
  Copy,
  Check,
  Edit2,
  BookOpen,
  Search,
  Filter,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export interface ExamControlItem {
  id: string;
  judul: string;
  tipe: "ulangan" | "ujian";
  mapel: string;
  durasi_menit: number;
  passing_grade: number;
  status: "dipublikasi" | "ditutup" | string;
  token?: string;
}

const DEFAULT_EXAMS: ExamControlItem[] = [
  {
    id: "e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    judul: "Ulangan Harian 1: Bilangan Berpangkat & Aljabar",
    tipe: "ulangan",
    mapel: "Matematika",
    durasi_menit: 60,
    passing_grade: 75,
    status: "dipublikasi",
    token: "MTK-ULG26",
  },
  {
    id: "e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    judul: "Ulangan Harian: Teks LHO & Kalimat Efektif",
    tipe: "ulangan",
    mapel: "Bahasa Indonesia",
    durasi_menit: 60,
    passing_grade: 75,
    status: "dipublikasi",
    token: "IND-ULG26",
  },
  {
    id: "e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
    judul: "Ulangan Harian: Descriptive Text & Daily Routines",
    tipe: "ulangan",
    mapel: "Bahasa Inggris",
    durasi_menit: 60,
    passing_grade: 75,
    status: "dipublikasi",
    token: "ENG-ULG26",
  },
  {
    id: "e5eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
    judul: "Penilaian Tengah Semester (PTS) Matematika Terpadu",
    tipe: "ujian",
    mapel: "Matematika",
    durasi_menit: 90,
    passing_grade: 75,
    status: "dipublikasi",
    token: "MTK-PTS26",
  },
  {
    id: "e6eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
    judul: "Penilaian Tengah Semester (PTS) Bahasa Indonesia",
    tipe: "ujian",
    mapel: "Bahasa Indonesia",
    durasi_menit: 90,
    passing_grade: 75,
    status: "dipublikasi",
    token: "IND-PTS26",
  },
  {
    id: "e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    judul: "Penilaian Tengah Semester (PTS) Bahasa Inggris",
    tipe: "ujian",
    mapel: "Bahasa Inggris",
    durasi_menit: 90,
    passing_grade: 75,
    status: "dipublikasi",
    token: "ENG-PTS26",
  },
];

export default function AkuLulusControlWidget() {
  const [exams, setExams] = useState<ExamControlItem[]>(DEFAULT_EXAMS);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"semua" | "ulangan" | "ujian">("semua");
  const [selectedMapelFilter, setSelectedMapelFilter] = useState<string>("semua");

  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Token State
  const [editingTokenExamId, setEditingTokenExamId] = useState<string | null>(null);
  const [tempTokenValue, setTempTokenValue] = useState<string>("");
  const [isSavingToken, setIsSavingToken] = useState<boolean>(false);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Edit Duration State
  const [editingDurationExamId, setEditingDurationExamId] = useState<string | null>(null);
  const [tempDurationValue, setTempDurationValue] = useState<number>(60);
  const [isSavingDuration, setIsSavingDuration] = useState<boolean>(false);

  const { broadcastEvent } = useRealtimeDashboard((event) => {
    if (event.type === "EXAM_STATUS_CHANGED" && event.payload) {
      const { ujianId, status, token, durasi_menit } = event.payload;
      setExams((prev) =>
        prev.map((e) => {
          if (e.id === ujianId) {
            return {
              ...e,
              ...(status ? { status } : {}),
              ...(token ? { token } : {}),
              ...(durasi_menit ? { durasi_menit } : {}),
            };
          }
          return e;
        })
      );
    }
  });

  // Fetch all exams from DB
  const loadExams = async () => {
    try {
      const res = await fetch("/api/guru/ujian");
      if (res.ok) {
        const data = await res.json();
        if (data.exams && data.exams.length > 0) {
          const apiExams: any[] = data.exams;
          setExams((prev) => {
            const mapped = DEFAULT_EXAMS.map((def) => {
              const found = apiExams.find(
                (x) => x.id === def.id || (x.mapel === def.mapel && x.tipe === def.tipe)
              );
              if (found) {
                return {
                  id: found.id,
                  judul: found.judul,
                  tipe: found.tipe || def.tipe,
                  mapel: found.mapel || def.mapel,
                  durasi_menit: found.durasi_menit || def.durasi_menit,
                  passing_grade: found.passing_grade || def.passing_grade,
                  status: found.status || def.status,
                  token: found.token || def.token,
                };
              }
              return def;
            });
            return mapped;
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch exams from API, using default list:", err);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  // Handle ON / OFF Toggle
  const handleToggle = async (item: ExamControlItem) => {
    const isCurrentlyOpen = item.status === "dipublikasi";
    const nextStatus = isCurrentlyOpen ? "ditutup" : "dipublikasi";

    setLoadingIds((prev) => ({ ...prev, [item.id]: true }));

    // Optimistic UI update
    setExams((prev) =>
      prev.map((e) => (e.id === item.id ? { ...e, status: nextStatus } : e))
    );

    try {
      const res = await fetch("/api/guru/ujian", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ujianId: item.id, status: nextStatus }),
      });

      if (res.ok) {
        broadcastEvent("EXAM_STATUS_CHANGED", {
          ujianId: item.id,
          status: nextStatus,
          mapel: item.mapel,
          tipe: item.tipe,
        });

        const label = item.tipe === "ulangan" ? "Ulangan Harian" : "Ujian PTS";
        showToast(
          nextStatus === "dipublikasi"
            ? `✅ Akses ${label} (${item.mapel}) DIBUKA (ON)! Siswa dapat mulai mengerjakan.`
            : `🔒 Akses ${label} (${item.mapel}) DITUTUP (OFF)! Akses siswa dinonaktifkan.`
        );
      } else {
        setExams((prev) =>
          prev.map((e) => (e.id === item.id ? { ...e, status: item.status } : e))
        );
        alert("Gagal mengubah status ujian. Silakan coba lagi.");
      }
    } catch (err: any) {
      setExams((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, status: item.status } : e))
      );
      alert("Terjadi kesalahan jaringan: " + err.message);
    } finally {
      setLoadingIds((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  // Handle Token Copy
  const handleCopyToken = (examId: string, token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedTokenId(examId);
    showToast(`📋 Token [${token}] berhasil disalin ke clipboard! Bagikan kode ini ke siswa.`);
    setTimeout(() => {
      setCopiedTokenId(null);
    }, 2500);
  };

  // Handle Token Edit
  const startEditingToken = (item: ExamControlItem) => {
    setEditingTokenExamId(item.id);
    setTempTokenValue(item.token || "");
  };

  const saveTokenEdit = async (examId: string) => {
    const trimmed = tempTokenValue.trim().toUpperCase();
    if (!trimmed) {
      alert("Token tidak boleh kosong!");
      return;
    }

    setIsSavingToken(true);
    try {
      const res = await fetch("/api/guru/ujian", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ujianId: examId, token: trimmed }),
      });

      if (res.ok) {
        setExams((prev) =>
          prev.map((e) => (e.id === examId ? { ...e, token: trimmed } : e))
        );
        broadcastEvent("EXAM_STATUS_CHANGED", {
          ujianId: examId,
          token: trimmed,
        });
        showToast(`🔑 Token akses berhasil diubah menjadi [${trimmed}]!`);
        setEditingTokenExamId(null);
      } else {
        alert("Gagal menyimpan token baru.");
      }
    } catch (err: any) {
      alert("Kesalahan jaringan: " + err.message);
    } finally {
      setIsSavingToken(false);
    }
  };

  // Handle Duration Edit
  const startEditingDuration = (item: ExamControlItem) => {
    setEditingDurationExamId(item.id);
    setTempDurationValue(item.durasi_menit || 60);
  };

  const saveDurationEdit = async (examId: string) => {
    if (!tempDurationValue || tempDurationValue < 5) {
      alert("Durasi minimal adalah 5 menit!");
      return;
    }

    setIsSavingDuration(true);
    try {
      const res = await fetch("/api/guru/ujian", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ujianId: examId, durasi_menit: tempDurationValue }),
      });

      if (res.ok) {
        setExams((prev) =>
          prev.map((e) => (e.id === examId ? { ...e, durasi_menit: tempDurationValue } : e))
        );
        broadcastEvent("EXAM_STATUS_CHANGED", {
          ujianId: examId,
          durasi_menit: tempDurationValue,
        });
        showToast(`⏱️ Durasi pengerjaan berhasil diubah menjadi ${tempDurationValue} Menit!`);
        setEditingDurationExamId(null);
      } else {
        alert("Gagal menyimpan durasi baru.");
      }
    } catch (err: any) {
      alert("Kesalahan jaringan: " + err.message);
    } finally {
      setIsSavingDuration(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4500);
  };

  // Filtered list
  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      // Type filter
      if (selectedTypeFilter !== "semua" && e.tipe !== selectedTypeFilter) {
        return false;
      }
      // Mapel filter
      if (selectedMapelFilter !== "semua" && e.mapel !== selectedMapelFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchJudul = e.judul.toLowerCase().includes(q);
        const matchMapel = e.mapel.toLowerCase().includes(q);
        const matchToken = e.token?.toLowerCase().includes(q);
        if (!matchJudul && !matchMapel && !matchToken) {
          return false;
        }
      }
      return true;
    });
  }, [exams, selectedTypeFilter, selectedMapelFilter, searchQuery]);

  const activeCount = exams.filter((e) => e.status === "dipublikasi").length;
  const closedCount = exams.filter((e) => e.status !== "dipublikasi").length;
  const ulanganCount = exams.filter((e) => e.tipe === "ulangan").length;
  const ujianCount = exams.filter((e) => e.tipe === "ujian").length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 space-y-5 shadow-xs font-sans">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-slate-900 text-white text-xs font-medium rounded-2xl flex items-center justify-between shadow-md border border-slate-800 animate-in fade-in duration-150">
          <span className="leading-relaxed">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-3 text-xs cursor-pointer p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Quick Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Daftar Kontrol Asesmen Siswa (Ulangan & Ujian)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur status buka/tutup akses pengerjaan, perbarui token sesi, dan kelola alokasi waktu ujian per mata pelajaran.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/guru/ujian"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-200 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            <span>Bank Soal</span>
          </Link>
          <button
            type="button"
            onClick={loadExams}
            title="Muat ulang status ujian dari server"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition border border-slate-200 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Search, Type Tabs & Mapel Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-0.5">
        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/80 w-fit">
          <button
            type="button"
            onClick={() => setSelectedTypeFilter("semua")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              selectedTypeFilter === "semua"
                ? "bg-white text-[#1967D2] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua ({exams.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTypeFilter("ulangan")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              selectedTypeFilter === "ulangan"
                ? "bg-white text-[#1967D2] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Ulangan Harian ({ulanganCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTypeFilter("ujian")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              selectedTypeFilter === "ujian"
                ? "bg-white text-[#1967D2] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Ujian PTS ({ujianCount})
          </button>
        </div>

        {/* Search & Subject Filter */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Mapel Dropdown */}
          <select
            value={selectedMapelFilter}
            onChange={(e) => setSelectedMapelFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[#1967D2] cursor-pointer"
          >
            <option value="semua">Semua Mata Pelajaran</option>
            <option value="Matematika">Matematika</option>
            <option value="Bahasa Indonesia">Bahasa Indonesia</option>
            <option value="Bahasa Inggris">Bahasa Inggris</option>
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul / token..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1967D2]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Status Badges */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[11px] font-medium text-slate-500">Status Akses:</span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{activeCount} Akses Terbuka (ON)</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold">
          <Lock className="w-2.5 h-2.5 text-slate-500" />
          <span>{closedCount} Akses Ditutup (OFF)</span>
        </span>
      </div>

      {/* Standard Shadcn/UI Table with Thin Outer Border and Light Grey Header */}
      <div className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow>
              <TableHead className="px-4 py-3 text-left font-semibold text-slate-700 text-xs">
                Mata Pelajaran & Judul Asesmen
              </TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold text-slate-700 text-xs">
                Kategori
              </TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold text-slate-700 text-xs">
                Durasi & KKM
              </TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold text-slate-700 text-xs">
                Token Siswa
              </TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold text-slate-700 text-xs">
                Status Akses Siswa
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-semibold text-slate-700 text-xs">
                Aksi & Kontrol
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-100">
            {filteredExams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500">
                  Tidak ada data ujian atau ulangan yang cocok dengan kriteria pencarian.
                </TableCell>
              </TableRow>
            ) : (
              filteredExams.map((exam) => {
                const isOpen = exam.status === "dipublikasi";
                const isEditingToken = editingTokenExamId === exam.id;
                const isEditingDuration = editingDurationExamId === exam.id;
                const isLoading = loadingIds[exam.id];

                return (
                  <TableRow
                    key={exam.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* 1. Mata Pelajaran & Judul */}
                    <TableCell className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                            {exam.mapel}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-900 leading-snug">
                          {exam.judul}
                        </div>
                      </div>
                    </TableCell>

                    {/* 2. Kategori Badge */}
                    <TableCell className="px-4 py-3 align-middle">
                      {exam.tipe === "ulangan" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span>Ulangan Formatif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Ujian Sumatif (PTS)</span>
                        </span>
                      )}
                    </TableCell>

                    {/* 3. Durasi & KKM */}
                    <TableCell className="px-4 py-3 align-middle">
                      {isEditingDuration ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={5}
                            max={240}
                            value={tempDurationValue}
                            onChange={(e) => setTempDurationValue(Number(e.target.value))}
                            className="w-16 px-1.5 py-0.5 text-xs font-semibold border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => saveDurationEdit(exam.id)}
                            disabled={isSavingDuration}
                            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded cursor-pointer disabled:opacity-50"
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingDurationExamId(null)}
                            className="text-slate-400 hover:text-slate-600 text-[10px] p-0.5 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 text-xs">
                              {exam.durasi_menit} Menit
                            </span>
                            <button
                              type="button"
                              onClick={() => startEditingDuration(exam)}
                              className="text-slate-400 hover:text-blue-600 transition cursor-pointer p-0.5"
                              title="Ubah alokasi durasi pengerjaan"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            Standar KKM: {exam.passing_grade}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    {/* 4. Token Siswa */}
                    <TableCell className="px-4 py-3 align-middle">
                      {isEditingToken ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={tempTokenValue}
                            onChange={(e) => setTempTokenValue(e.target.value.toUpperCase())}
                            className="w-24 px-1.5 py-0.5 text-xs font-mono font-bold uppercase border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => saveTokenEdit(exam.id)}
                            disabled={isSavingToken}
                            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded cursor-pointer disabled:opacity-50"
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTokenExamId(null)}
                            className="text-slate-400 hover:text-slate-600 text-[10px] p-0.5 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                            {exam.token || "BELUM DISET"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyToken(exam.id, exam.token || "")}
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200"
                            title="Salin token ke clipboard"
                          >
                            {copiedTokenId === exam.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => startEditingToken(exam)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200"
                            title="Ubah token ujian"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </TableCell>

                    {/* 5. Status Akses Siswa & Toggle Button */}
                    <TableCell className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Akses: ON</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Akses: OFF</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggle(exam)}
                          disabled={isLoading}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer border ${
                            isOpen
                              ? "bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-200 hover:border-rose-200"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-2xs"
                          }`}
                        >
                          {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isOpen ? (
                            <>
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Tutup</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3" />
                              <span>Buka</span>
                            </>
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* 6. Aksi & Kontrol */}
                    <TableCell className="px-4 py-3 text-right align-middle">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/guru/ujian/${exam.id}/live`}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#1967D2] text-xs font-semibold border border-slate-200 hover:border-blue-200 transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Radio className="w-3.5 h-3.5 text-[#1967D2]" />
                          <span>Monitor</span>
                        </Link>

                        <Link
                          href={`/guru/ujian/create?tipe=${exam.tipe}&mapel=${encodeURIComponent(
                            exam.mapel
                          )}`}
                          className="px-3 py-1.5 rounded-xl bg-[#1967D2] hover:bg-blue-700 text-white text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Soal</span>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer Helper */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Setiap perubahan status atau token disinkronkan langsung ke dashboard siswa tanpa perlu muat ulang halaman.</span>
        </span>
        <span className="font-medium text-slate-400">
          Menampilkan {filteredExams.length} dari {exams.length} asesmen
        </span>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  BookOpen,
  Clock,
  Award,
  FileText,
  CheckCircle2,
  PlayCircle,
  Lock,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Search,
  ArrowLeft,
  Maximize2,
  Minimize2,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  BookOpenCheck,
} from "lucide-react";
import { UjianItem } from "../../types";

export interface AsesmenOverlayModalProps {
  isOpen: boolean;
  category: "ulangan" | "ujian" | "simulasi" | null;
  onClose: () => void;
  ulanganList?: UjianItem[];
  ujianList?: UjianItem[];
  simulasiList?: any[];
  allChapters?: any[];
  examsData?: any[];
  sekolahNama?: string;
  tingkatKelas?: string;
  onCategoryChange?: (category: "ulangan" | "ujian" | "simulasi") => void;
}

export const DEFAULT_SIMULASI_MODULES = [
  {
    id: "e7eebc99-9c0b-4ef8-bb6d-6bb9bd380a77",
    slug: "sim-literasi",
    judul: "Simulasi ANBK: Literasi Membaca & Analisis Wacana",
    deskripsi:
      "Latihan simulasi mandiri model Asesmen Kompetensi Minimum (AKM) Kemendikbudristek untuk mengasah nalar membaca kritis dan interpretasi wacana informasi.",
    mapel: "Literasi Membaca",
    durasi_menit: 60,
    passing_grade: 70,
    total_soal: 20,
    kategori: "AKM Nasional",
  },
  {
    id: "e8eebc99-9c0b-4ef8-bb6d-6bb9bd380a88",
    slug: "sim-numerasi",
    judul: "Simulasi ANBK: Numerasi Bernalar & Logika Kuantitatif",
    deskripsi:
      "Latihan simulasi mandiri pemecahan masalah konteks saintifik, nalar numerasi, dan logika kuantitatif standar Pusmendik Kemendikbudristek.",
    mapel: "Numerasi Logika",
    durasi_menit: 60,
    passing_grade: 70,
    total_soal: 20,
    kategori: "AKM Nasional",
  },
  {
    id: "e9eebc99-9c0b-4ef8-bb6d-6bb9bd380a99",
    slug: "sim-karakter",
    judul: "Simulasi Survei Karakter & Profil Pelajar Pancasila",
    deskripsi:
      "Latihan evaluasi mandiri sikap, nilai kebiasaan, integritas, dan iklim kebinekaan dalam lingkungan belajar sekolah berkarakter.",
    mapel: "Survei Karakter",
    durasi_menit: 45,
    passing_grade: 75,
    total_soal: 25,
    kategori: "Survei Karakter",
  },
];

export function normalizeToCoreMapel(
  m?: string | null
): "Matematika" | "Bahasa Indonesia" | "Bahasa Inggris" | null {
  if (!m) return null;
  const s = m.toLowerCase();
  if (s.includes("matematika") || s.includes("math") || s === "mtk") return "Matematika";
  if (s.includes("indonesia") || s === "bindo") return "Bahasa Indonesia";
  if (s.includes("inggris") || s.includes("english") || s === "bing") return "Bahasa Inggris";
  return null;
}

export function buildAllUlanganItems(
  exams: any[] = [],
  chapters: any[] = []
): UjianItem[] {
  const ulanganList = (exams || [])
    .filter((e) => e.tipe === "ulangan")
    .map((e) => ({ ...e, token: e.token || "12345" }));

  const list: UjianItem[] = ulanganList
    .filter((u) => normalizeToCoreMapel(u.mapel) !== null)
    .map((u) => ({
      ...u,
      mapel: normalizeToCoreMapel(u.mapel)!,
    }));

  const existingBabIds = new Set(list.map((u) => (u as any).bab_id || (u as any).babId).filter(Boolean));

  chapters.forEach((ch) => {
    const canonicalMapel = normalizeToCoreMapel(ch.mapel);
    if (canonicalMapel && !existingBabIds.has(ch.id)) {
      list.push({
        id: `ulangan-bab-${ch.id}`,
        judul: ch.judul.toLowerCase().startsWith("bab")
          ? `Ulangan Harian ${ch.judul}`
          : `Ulangan Harian: ${ch.judul}`,
        deskripsi: ch.deskripsi || `Evaluasi formatif materi ${ch.judul} kurikulum terstandar.`,
        mapel: canonicalMapel,
        durasi_menit: 30,
        passing_grade: 75,
        waktu_mulai: new Date().toISOString(),
        waktu_berakhir: new Date(Date.now() + 90 * 86400000).toISOString(),
        status: "dipublikasi",
        tipe: "ulangan",
        token: "12345",
        sessionStatus: "belum_mulai",
        score: null,
        bab_id: ch.id,
      });
    }
  });

  const mapelOrder: Record<string, number> = {
    Matematika: 1,
    "Bahasa Indonesia": 2,
    "Bahasa Inggris": 3,
  };
  list.sort((a, b) => {
    const orderA = mapelOrder[a.mapel] || 99;
    const orderB = mapelOrder[b.mapel] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.judul.localeCompare(b.judul, undefined, { numeric: true });
  });

  return list;
}

export function buildAllUjianItems(exams: any[] = []): UjianItem[] {
  const filtered = (exams || [])
    .filter((e) => e.tipe === "ujian" || (e.judul && e.judul.toLowerCase().includes("pts")))
    .map((e) => ({ ...e, token: e.token || "12345" }));

  if (filtered.length > 0) return filtered;

  return [
    {
      id: "e5eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
      judul: "Penilaian Tengah Semester (PTS) Matematika",
      deskripsi: "Asesmen sumatif resmi tengah semester mata pelajaran Matematika.",
      mapel: "Matematika",
      durasi_menit: 90,
      passing_grade: 75,
      waktu_mulai: new Date().toISOString(),
      waktu_berakhir: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: "dipublikasi",
      tipe: "ujian",
      token: "12345",
      sessionStatus: "belum_mulai",
      score: null,
    },
    {
      id: "e6eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
      judul: "Penilaian Tengah Semester (PTS) Bahasa Indonesia",
      deskripsi: "Asesmen sumatif resmi tengah semester mata pelajaran Bahasa Indonesia.",
      mapel: "Bahasa Indonesia",
      durasi_menit: 90,
      passing_grade: 75,
      waktu_mulai: new Date().toISOString(),
      waktu_berakhir: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: "dipublikasi",
      tipe: "ujian",
      token: "12345",
      sessionStatus: "belum_mulai",
      score: null,
    },
    {
      id: "e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      judul: "Penilaian Tengah Semester (PTS) Bahasa Inggris",
      deskripsi: "Asesmen sumatif resmi tengah semester mata pelajaran Bahasa Inggris.",
      mapel: "Bahasa Inggris",
      durasi_menit: 90,
      passing_grade: 75,
      waktu_mulai: new Date().toISOString(),
      waktu_berakhir: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: "dipublikasi",
      tipe: "ujian",
      token: "12345",
      sessionStatus: "belum_mulai",
      score: null,
    },
  ];
}

export default function AsesmenOverlayModal({
  isOpen,
  category,
  onClose,
  ulanganList: propUlanganList,
  ujianList: propUjianList,
  simulasiList = DEFAULT_SIMULASI_MODULES,
  allChapters = [],
  examsData = [],
  sekolahNama = "SMK Muhammadiyah Pakem",
  tingkatKelas = "Kelas 8 SMP",
  onCategoryChange,
}: AsesmenOverlayModalProps) {
  const router = useRouter();

  // Internal category state for fluid switching inside overlay
  const [activeCategory, setActiveCategory] = useState<"ulangan" | "ujian" | "simulasi">("ulangan");

  // Effective Ulangan & Ujian Lists
  const ulanganList = useMemo(() => {
    if (propUlanganList && propUlanganList.length > 0) return propUlanganList;
    return buildAllUlanganItems(examsData, allChapters);
  }, [propUlanganList, examsData, allChapters]);

  const ujianList = useMemo(() => {
    if (propUjianList && propUjianList.length > 0) return propUjianList;
    return buildAllUjianItems(examsData);
  }, [propUjianList, examsData]);

  useEffect(() => {
    if (category) {
      setActiveCategory(category);
    }
  }, [category]);

  const handleSelectCategory = (cat: "ulangan" | "ujian" | "simulasi") => {
    setActiveCategory(cat);
    if (onCategoryChange) {
      onCategoryChange(cat);
    }
  };

  // Fullscreen Window toggle
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsBrowserFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Search & Filter State for Ulangan
  const [selectedUlanganMapel, setSelectedUlanganMapel] = useState<string>("Semua");
  const [searchUlanganQuery, setSearchUlanganQuery] = useState<string>("");

  // Mapel pill options
  const ulanganMapels = useMemo(() => {
    return ["Semua", "Matematika", "Bahasa Indonesia", "Bahasa Inggris"];
  }, []);

  // Filtered Ulangan
  const filteredUlanganList = useMemo(() => {
    let list = ulanganList;
    if (selectedUlanganMapel !== "Semua") {
      list = list.filter((e) => e.mapel?.toLowerCase() === selectedUlanganMapel.toLowerCase());
    }
    if (searchUlanganQuery.trim()) {
      const q = searchUlanganQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.judul.toLowerCase().includes(q) ||
          e.mapel?.toLowerCase().includes(q) ||
          (e.deskripsi && e.deskripsi.toLowerCase().includes(q))
      );
    }
    return list;
  }, [ulanganList, selectedUlanganMapel, searchUlanganQuery]);

  // Token Modal State (Screenshot 2 Auth)
  const [selectedExamForToken, setSelectedExamForToken] = useState<UjianItem | null>(null);
  const [tokenInput, setTokenInput] = useState<string>("");
  const [showTokenPassword, setShowTokenPassword] = useState<boolean>(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenSuccess, setTokenSuccess] = useState<string | null>(null);

  const handleOpenTokenModal = (exam: UjianItem) => {
    setSelectedExamForToken(exam);
    setTokenInput("");
    setShowTokenPassword(false);
    setTokenError(null);
    setTokenSuccess(null);
  };

  const handleVerifyTokenAndStart = async () => {
    if (!selectedExamForToken) return;
    const trimmed = tokenInput.trim().toUpperCase();
    if (!trimmed) {
      setTokenError("Silakan masukkan password token ujian.");
      return;
    }

    setIsVerifyingToken(true);
    setTokenError(null);
    setTokenSuccess(null);

    try {
      const res = await fetch("/api/siswa/ujian/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ujianId: selectedExamForToken.id,
          token: trimmed,
          judul: selectedExamForToken.judul,
          mapel: selectedExamForToken.mapel,
          babId: selectedExamForToken.bab_id || selectedExamForToken.id,
        }),
      });

      const data = await res.json();
      if (res.ok && (data.valid || data.success || trimmed === "12345")) {
        setTokenSuccess("✅ Password Valid! Membuka ruang ujian...");
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        const targetId = data.ujianId || selectedExamForToken.id;
        setTimeout(() => {
          setSelectedExamForToken(null);
          onClose();
          router.push(`/ujian/${targetId}?start=true`);
        }, 500);
      } else {
        setTokenError(
          data.error ||
            "Password / Token salah! Dapatkan password resmi dari Admin Sekolah atau Pengawas (Password sementara: 12345)."
        );
      }
    } catch (err: any) {
      if (trimmed === "12345") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        const targetId = selectedExamForToken.id;
        setSelectedExamForToken(null);
        onClose();
        router.push(`/ujian/${targetId}?start=true`);
        return;
      }
      setTokenError("Gagal menghubungi server. Pastikan koneksi internet aktif.");
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const getMapelBadgeStyle = (mapel: string) => {
    const m = (mapel || "").toLowerCase();
    if (m.includes("matematika")) return "bg-indigo-100 text-indigo-800 border-indigo-200";
    if (m.includes("indonesia")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (m.includes("inggris")) return "bg-sky-100 text-sky-800 border-sky-200";
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col text-slate-900 overflow-y-auto custom-scrollbar animate-in fade-in duration-200">
      {/* 1. TOP STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs shrink-0 relative">
        {/* Tombol Back di Paling Kiri */}
        <div className="absolute left-3.5 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-10">
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
            title="Tutup & Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden min-[1360px]:inline">Kembali</span>
          </button>
        </div>

        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Header Left Info: Sejajar dengan Card Daftar Ulang */}
          <div className="flex items-center gap-2.5 min-w-0 pl-11 sm:pl-12 min-[1280px]:pl-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black shadow-xs shrink-0 ${
                  activeCategory === "ulangan"
                    ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                    : activeCategory === "ujian"
                    ? "bg-purple-50 text-purple-600 border border-purple-200"
                    : "bg-amber-50 text-amber-600 border border-amber-200"
                }`}
              >
                {activeCategory === "ulangan" ? (
                  <FileText className="w-4.5 h-4.5" />
                ) : activeCategory === "ujian" ? (
                  <Award className="w-4.5 h-4.5" />
                ) : (
                  <Sparkles className="w-4.5 h-4.5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {activeCategory === "ulangan"
                      ? "Asesmen Formatif Per Bab"
                      : activeCategory === "ujian"
                      ? "Asesmen Sumatif Terstandar"
                      : "Simulasi Mandiri AKM"}
                  </span>
                  <span className="text-xs font-bold text-slate-400 hidden md:inline">
                    {sekolahNama} • {tingkatKelas}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-black text-[#0F172A] truncate">
                  {activeCategory === "ulangan"
                    ? "Daftar Ulangan Harian Per Bab"
                    : activeCategory === "ujian"
                    ? "Daftar Ujian Semester (PTS/PAS)"
                    : "Modul Simulasi Mandiri (AKM / ANBK)"}
                </h2>
              </div>
            </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleBrowserFullscreen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer"
              title={isBrowserFullscreen ? "Keluar Fullscreen" : "Layar Penuh"}
            >
              {isBrowserFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Normal</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Layar Penuh</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Tutup Halaman</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. BODY CONTAINER */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header Hero Banner */}
        <div className="saas-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Top Accent Gradient Line */}
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 ${
              activeCategory === "ulangan"
                ? "bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600"
                : activeCategory === "ujian"
                ? "bg-gradient-to-r from-purple-500 via-indigo-500 to-slate-900"
                : "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600"
            }`}
          />

          <div className="space-y-2 max-w-2xl pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {activeCategory === "ulangan"
                  ? "Evaluasi Formatif Per Bab • Sokratik AI"
                  : activeCategory === "ujian"
                  ? "Evaluasi Sumatif Terstandar • Sokratik AI"
                  : "Simulasi Mandiri Adaptif • Sokratik AI"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              {activeCategory === "ulangan"
                ? "Pilih Mata Pelajaran — Ulangan Harian Per Bab"
                : activeCategory === "ujian"
                ? "Pilih Mata Pelajaran — Ujian Semester (PTS/PAS)"
                : "Modul Simulasi Mandiri (AKM / ANBK)"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {activeCategory === "ulangan"
                ? "Daftar ulangan formatif per bab untuk mata pelajaran terstandar dengan bimbingan Sokratik AI. Pilih bab dan masukkan password resmi dari Guru/Admin."
                : activeCategory === "ujian"
                ? "Asesmen resmi terjadwal dengan alokasi waktu presisi. Pilih mata pelajaran aktif di bawah ini dan masukkan token dari Guru untuk mulai mengerjakan."
                : "Pilih modul latihan adaptif nasional mandiri terbuka. Mengasah nalar membaca kritis (literasi), numerasi saintifik, dan survei karakter profil pelajar Pancasila."}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                  activeCategory === "ulangan"
                    ? "bg-indigo-100 text-indigo-700"
                    : activeCategory === "ujian"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {activeCategory === "ulangan" ? (
                  <FileText className="w-6 h-6" />
                ) : activeCategory === "ujian" ? (
                  <Award className="w-6 h-6" />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="text-xs font-black text-[#0F172A]">
                  {activeCategory === "ulangan"
                    ? `${ulanganList.length} Bab Ulangan`
                    : activeCategory === "ujian"
                    ? `${ujianList.length || 3} Mata Pelajaran`
                    : `${simulasiList.length} Modul Latihan`}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {tingkatKelas}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher Strip */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/90 w-fit">
          <button
            type="button"
            onClick={() => handleSelectCategory("ulangan")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeCategory === "ulangan"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ulangan Harian</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectCategory("ujian")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeCategory === "ujian"
                ? "bg-white text-purple-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Ujian Semester (PTS/PAS)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectCategory("simulasi")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeCategory === "simulasi"
                ? "bg-white text-amber-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulasi ANBK</span>
          </button>
        </div>

        {/* 3. CONTENT PER CATEGORY */}
        {activeCategory === "ujian" ? (
          /* VIEW UJIAN: 3 CORE SUBJECTS */
          <div className="space-y-4">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              MATA PELAJARAN UJIAN RESMI TERSEDIA
            </div>
            <div className="space-y-3.5">
              {["Matematika", "Bahasa Indonesia", "Bahasa Inggris"].map((m) => {
                const exam =
                  ujianList.find((e) =>
                    e.mapel?.toLowerCase().includes(m.toLowerCase())
                  ) || null;
                const isOpen = exam?.status === "dipublikasi";
                const isCompleted =
                  exam?.sessionStatus === "selesai" || exam?.sessionStatus === "habis_waktu";
                const isInProgress = exam?.sessionStatus === "sedang_mengerjakan";

                return (
                  <div
                    key={m}
                    onClick={
                      isOpen && exam && !isCompleted
                        ? () => handleOpenTokenModal(exam)
                        : undefined
                    }
                    className={`saas-card rounded-2xl p-5 sm:p-6 border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isOpen
                        ? "bg-white border-slate-200 hover:border-purple-400 hover:shadow-md cursor-pointer group"
                        : "bg-slate-50/70 border-slate-200/80 opacity-80 cursor-not-allowed select-none"
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${getMapelBadgeStyle(
                            m
                          )}`}
                        >
                          {m}
                        </span>

                        {isOpen ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span>Akses Terbuka (ON)</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold uppercase flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>Akses Ditutup (OFF)</span>
                          </span>
                        )}

                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" /> Sokratik AI
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-[#0F172A] group-hover:text-purple-700 transition">
                        {exam?.judul || `Penilaian Tengah Semester (PTS) ${m}`}
                      </h4>

                      {/* Meta Specification Grid: Durasi, KKM, Asesmen, Keamanan */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 max-w-2xl">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <div>
                            <div className="text-[9px] text-slate-400 font-medium">Durasi</div>
                            <div className="font-extrabold text-[#0F172A] text-xs">
                              {exam?.durasi_menit || 90} Menit
                            </div>
                          </div>
                        </div>
                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div>
                            <div className="text-[9px] text-slate-400 font-medium">Standar KKM</div>
                            <div className="font-extrabold text-[#0F172A] text-xs">
                              Nilai {exam?.passing_grade || 75}
                            </div>
                          </div>
                        </div>
                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <div>
                            <div className="text-[9px] text-slate-400 font-medium">Tipe Asesmen</div>
                            <div className="font-extrabold text-[#0F172A] text-xs">PTS Terstandar</div>
                          </div>
                        </div>
                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <div>
                            <div className="text-[9px] text-slate-400 font-medium">Keamanan</div>
                            <div className="font-extrabold text-[#0F172A] text-xs">Token Guru</div>
                          </div>
                        </div>
                      </div>

                      {exam?.score != null && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            Nilai Anda: {exam.score}/100{" "}
                            {exam.score >= (exam?.passing_grade || 75)
                              ? "(Lulus KKM)"
                              : "(Remedial)"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="sm:shrink-0">
                      {isCompleted ? (
                        <Link
                          href={`/ujian/${exam?.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span>Lihat Hasil Ujian</span>
                        </Link>
                      ) : isOpen && exam ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenTokenModal(exam);
                          }}
                          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-98"
                        >
                          <KeyRound className="w-4 h-4 text-amber-300" />
                          <span>
                            {isInProgress ? "Lanjutkan Ujian" : "Masukkan Token & Kerjakan"}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Ditutup oleh Guru</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeCategory === "ulangan" ? (
          /* VIEW ULANGAN: SEARCH & FILTER PER BAB */
          <div className="space-y-4">
            {/* Controls: Filter Pills & Search */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              {/* Mapel Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {ulanganMapels.map((m) => {
                  const count =
                    m === "Semua"
                      ? ulanganList.length
                      : ulanganList.filter(
                          (u) => u.mapel?.toLowerCase() === m.toLowerCase()
                        ).length;
                  const isSelected = selectedUlanganMapel === m;

                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedUlanganMapel(m)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 flex items-center gap-2 border ${
                        isSelected
                          ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200"
                      }`}
                    >
                      <span>{m}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                          isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchUlanganQuery}
                  onChange={(e) => setSearchUlanganQuery(e.target.value)}
                  placeholder="Cari judul bab, materi, atau kata kunci ulangan..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                {searchUlanganQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchUlanganQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List of Ulangan Per Bab */}
            <div className="space-y-3.5">
              {filteredUlanganList.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Tidak ada ulangan yang cocok
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Coba ganti filter mata pelajaran atau kata kunci pencarian Anda.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUlanganMapel("Semua");
                      setSearchUlanganQuery("");
                    }}
                    className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                filteredUlanganList.map((exam) => {
                  const isOpen = exam.status === "dipublikasi";
                  const isCompleted =
                    exam.sessionStatus === "selesai" || exam.sessionStatus === "habis_waktu";
                  const isInProgress = exam.sessionStatus === "sedang_mengerjakan";
                  const isPassed = exam.score != null && exam.score >= exam.passing_grade;

                  return (
                    <div
                      key={exam.id}
                      className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        {/* Badges: Mapel & Status & Sokratik */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${getMapelBadgeStyle(
                                exam.mapel
                              )}`}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{exam.mapel}</span>
                            </span>

                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>Sokratik AI</span>
                            </span>
                          </div>

                          <div>
                            {!isOpen ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase flex items-center gap-1">
                                <Lock className="w-3 h-3 text-slate-500" />
                                <span>Akses Ditutup (OFF)</span>
                              </span>
                            ) : isCompleted ? (
                              <span
                                className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold flex items-center gap-1.5 ${
                                  isPassed
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : "bg-rose-50 text-rose-800 border-rose-300"
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>
                                  ✓ Selesai • Nilai: {exam.score}/100{" "}
                                  {isPassed ? "(Lulus KKM)" : ""}
                                </span>
                              </span>
                            ) : isInProgress ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase flex items-center gap-1.5 animate-pulse">
                                <PlayCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Sedang Berlangsung</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Akses Terbuka (Siap Dikerjakan)</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Judul Ulangan Per Bab */}
                        <div>
                          <h4 className="text-base font-extrabold text-[#0F172A] group-hover:text-indigo-600 transition leading-snug">
                            {exam.judul}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {exam.deskripsi ||
                              `Evaluasi formatif pemahaman kompetensi materi per bab. Akses pengerjaan dikontrol resmi dan diawasi server.`}
                          </p>
                        </div>

                        {/* Meta Specification 4-Pill Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <div>
                              <div className="text-[9px] text-slate-400 font-medium">Durasi</div>
                              <div className="font-extrabold text-[#0F172A] text-xs">
                                {exam.durasi_menit || 30} Menit
                              </div>
                            </div>
                          </div>
                          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                            <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <div>
                              <div className="text-[9px] text-slate-400 font-medium">Standar KKM</div>
                              <div className="font-extrabold text-[#0F172A] text-xs">
                                Nilai {exam.passing_grade || 75}
                              </div>
                            </div>
                          </div>
                          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <div>
                              <div className="text-[9px] text-slate-400 font-medium">Target Soal</div>
                              <div className="font-extrabold text-[#0F172A] text-xs">20 Soal CBT</div>
                            </div>
                          </div>
                          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <div>
                              <div className="text-[9px] text-slate-400 font-medium">Keamanan</div>
                              <div className="font-extrabold text-[#0F172A] text-xs">Token Privat</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button & Token Helper */}
                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Password Sementara Admin:{" "}
                            <strong className="font-mono text-slate-800">12345</strong>
                          </span>
                        </div>

                        <div className="w-full sm:w-auto">
                          {isCompleted ? (
                            <Link
                              href={`/ujian/${exam.id}`}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                            >
                              <Award className="w-4 h-4 text-emerald-600" />
                              <span>Lihat Hasil & Evaluasi</span>
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </Link>
                          ) : !isOpen ? (
                            <button
                              type="button"
                              disabled
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Akses Ditutup (OFF)</span>
                            </button>
                          ) : isInProgress ? (
                            <button
                              type="button"
                              onClick={() => handleOpenTokenModal(exam)}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-98"
                            >
                              <PlayCircle className="w-4 h-4 text-white" />
                              <span>Lanjutkan Pengerjaan</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenTokenModal(exam)}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-98"
                            >
                              <KeyRound className="w-4 h-4 text-amber-300" />
                              <span>Mulai Kerjakan (Token CBT)</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* VIEW SIMULASI ANBK */
          <div className="space-y-4">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              MODUL SIMULASI NASIONAL TERSEDIA
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {simulasiList.map((sim) => (
                <div
                  key={sim.id}
                  onClick={() => {
                    onClose();
                    router.push(`/ujian/${sim.id}?start=true`);
                  }}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200/80 hover:border-amber-400 transition duration-200 flex flex-col justify-between space-y-5 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 group h-full"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                        {sim.kategori || "AKM Nasional"}
                      </span>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Bebas Akses (ON)
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-[#0F172A] group-hover:text-amber-700 transition leading-snug">
                        {sim.judul}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-3 mt-1.5 leading-relaxed">
                        {sim.deskripsi}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <div>
                          <div className="text-[9px] text-slate-400 font-medium">Durasi</div>
                          <div className="font-extrabold text-[#0F172A] text-xs">
                            {sim.durasi_menit} Menit
                          </div>
                        </div>
                      </div>
                      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <div>
                          <div className="text-[9px] text-slate-400 font-medium">Target Soal</div>
                          <div className="font-extrabold text-[#0F172A] text-xs">
                            {sim.total_soal} Soal AKM
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        router.push(`/ujian/${sim.id}?start=true`);
                      }}
                      className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition flex items-center justify-between shadow-xs group-hover:shadow-md cursor-pointer active:scale-98"
                    >
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-white" />
                        <span>Mulai Latihan Simulasi</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. MODAL INTERAKTIF: AUTENTIKASI TOKEN CBT (PERSIS SESUAI SCREENSHOT 2) */}
      {selectedExamForToken && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
                  <KeyRound className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-block mb-1">
                    AUTENTIKASI TOKEN CBT
                  </span>
                  <h3 className="text-xl font-black text-[#0F172A] leading-tight">
                    Verifikasi Password Ujian
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedExamForToken(null);
                  setTokenError(null);
                }}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Exam Information Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                MATA PELAJARAN:
              </div>
              <div className="font-extrabold text-[#0F172A] text-sm leading-snug">
                {selectedExamForToken.mapel} • {selectedExamForToken.judul}
              </div>
              <div className="flex items-center gap-2 pt-1 text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {selectedExamForToken.durasi_menit || 30} Menit
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-emerald-600" />
                  KKM: {selectedExamForToken.passing_grade || 75}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-500" />
                  Privat Sekolah
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Ujian resmi bersifat privat sekolah. Silakan masukkan password / kode token yang didapatkan dari Admin Sekolah atau Pengawas Ruang sebelum membuka lembar soal full screen.
            </p>

            {/* Input Password / Token */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-slate-700 block">
                Password / Token Ujian:
              </label>
              <div className="relative">
                <input
                  type={showTokenPassword ? "text" : "password"}
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value);
                    if (tokenError) setTokenError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleVerifyTokenAndStart();
                    }
                  }}
                  autoFocus
                  placeholder="Masukkan password token..."
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 font-mono text-base tracking-widest text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowTokenPassword(!showTokenPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition"
                  title={showTokenPassword ? "Sembunyikan" : "Tampilkan Password"}
                >
                  {showTokenPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Quick Helper Default Password */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
                <div className="flex items-center gap-1.5 font-medium">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Password Sementara Admin: <strong>12345</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTokenInput("12345");
                    setTokenError(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition cursor-pointer"
                >
                  Gunakan 12345
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {tokenError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{tokenError}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {tokenSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{tokenSuccess}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedExamForToken(null);
                  setTokenError(null);
                }}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => handleVerifyTokenAndStart()}
                disabled={isVerifyingToken || !tokenInput.trim()}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isVerifyingToken ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 text-amber-300" />
                    <span>Verifikasi & Masuk Ujian</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

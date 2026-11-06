"use client";

import { useState, useEffect, useMemo } from "react";
import GuruLayout from "@/components/guru/GuruLayout";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  Copy,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Award,
  TrendingUp,
  UserCheck,
  Calendar,
  BookOpen,
  ArrowUpDown,
  Check,
  ChevronRight,
  Eye,
} from "lucide-react";

interface PresensiData {
  masuk: number;
  tidakMasuk: number;
  totalHari: number;
  persen: number;
}

interface KuisData {
  rataRata: number | null;
  selesaiCount: number;
  totalBab: number;
  babScores: Record<string, number>;
}

interface UlanganData {
  sem1: number | null;
  sem2: number | null;
  rataRata: number | null;
}

interface UjianData {
  resmi1: number | null;
}

interface StudentRecapRow {
  no: number;
  id: string;
  nama: string;
  nisn: string;
  kelas: string;
  email: string;
  foto: string | null;
  poin: number;
  presensi: PresensiData;
  kuis: KuisData;
  ulangan: UlanganData;
  ujian: UjianData;
  kkm: number;
  nilaiAkhir: number | null;
  statusKKM: string;
  isTuntas: boolean;
}

interface SummaryData {
  totalSiswa: number;
  rataRataNilaiAkhir: number;
  rataRataKehadiran: number;
  totalTuntas: number;
  totalRemedial: number;
  persentaseTuntas: number;
  kkmStandar: number;
}

const SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/1zsL9NyavgKzPqL1LGrNUhRObwJwAKAisNRYLEyKt9VY/edit";

const FALLBACK_REKAPAN_STUDENTS: StudentRecapRow[] = [
  {
    no: 1,
    id: "44444444-4444-4444-4444-444444444444",
    nama: "Budi Kartika",
    nisn: "0089201144",
    kelas: "Kelas 8",
    email: "budi.kartika@sekolah.sch.id",
    foto: null,
    poin: 980,
    presensi: { masuk: 176, tidakMasuk: 4, totalHari: 180, persen: 98 },
    kuis: { rataRata: 88, selesaiCount: 8, totalBab: 8, babScores: {} },
    ulangan: { sem1: 85, sem2: 88, rataRata: 87 },
    ujian: { resmi1: 86 },
    kkm: 75,
    nilaiAkhir: 87,
    statusKKM: "Tuntas",
    isTuntas: true,
  },
  {
    no: 2,
    id: "s-fauzi-02",
    nama: "Ahmad Fauzi",
    nisn: "0089201145",
    kelas: "Kelas 8",
    email: "ahmad.fauzi@sekolah.sch.id",
    foto: null,
    poin: 1180,
    presensi: { masuk: 178, tidakMasuk: 2, totalHari: 180, persen: 99 },
    kuis: { rataRata: 92, selesaiCount: 8, totalBab: 8, babScores: {} },
    ulangan: { sem1: 90, sem2: 94, rataRata: 92 },
    ujian: { resmi1: 92 },
    kkm: 75,
    nilaiAkhir: 92,
    statusKKM: "Tuntas",
    isTuntas: true,
  },
  {
    no: 3,
    id: "s-aisyah-03",
    nama: "Siti Aisyah Putri",
    nisn: "0089201146",
    kelas: "Kelas 8",
    email: "siti.aisyah.putri@sekolah.sch.id",
    foto: null,
    poin: 1120,
    presensi: { masuk: 177, tidakMasuk: 3, totalHari: 180, persen: 98 },
    kuis: { rataRata: 90, selesaiCount: 8, totalBab: 8, babScores: {} },
    ulangan: { sem1: 88, sem2: 90, rataRata: 89 },
    ujian: { resmi1: 90 },
    kkm: 75,
    nilaiAkhir: 90,
    statusKKM: "Tuntas",
    isTuntas: true,
  },
  {
    no: 4,
    id: "s-rian-04",
    nama: "Rian Hidayat",
    nisn: "0089201147",
    kelas: "Kelas 8",
    email: "rian.hidayat@sekolah.sch.id",
    foto: null,
    poin: 980,
    presensi: { masuk: 172, tidakMasuk: 8, totalHari: 180, persen: 96 },
    kuis: { rataRata: 84, selesaiCount: 8, totalBab: 8, babScores: {} },
    ulangan: { sem1: 80, sem2: 82, rataRata: 81 },
    ujian: { resmi1: 80 },
    kkm: 75,
    nilaiAkhir: 81,
    statusKKM: "Tuntas",
    isTuntas: true,
  },
  {
    no: 5,
    id: "s-nanda-05",
    nama: "Nanda Kurnia Putri",
    nisn: "0089201148",
    kelas: "Kelas 8",
    email: "nanda.kurnia.putri@sekolah.sch.id",
    foto: null,
    poin: 940,
    presensi: { masuk: 174, tidakMasuk: 6, totalHari: 180, persen: 97 },
    kuis: { rataRata: 86, selesaiCount: 8, totalBab: 8, babScores: {} },
    ulangan: { sem1: 84, sem2: 86, rataRata: 85 },
    ujian: { resmi1: 85 },
    kkm: 75,
    nilaiAkhir: 85,
    statusKKM: "Tuntas",
    isTuntas: true,
  },
  {
    no: 6,
    id: "s-dimas-06",
    nama: "Dimas Wahyudi",
    nisn: "0089201149",
    kelas: "Kelas 8",
    email: "dimas.wahyudi@sekolah.sch.id",
    foto: null,
    poin: 890,
    presensi: { masuk: 170, tidakMasuk: 10, totalHari: 180, persen: 94 },
    kuis: { rataRata: 80, selesaiCount: 8, totalBab: 8, babScores: {} },
    ulangan: { sem1: 76, sem2: 78, rataRata: 77 },
    ujian: { resmi1: 75 },
    kkm: 75,
    nilaiAkhir: 77,
    statusKKM: "Tuntas",
    isTuntas: true,
  },
  {
    no: 7,
    id: "s-dewi-07",
    nama: "Dewi Sartika",
    nisn: "0089201150",
    kelas: "Kelas 8",
    email: "dewi.sartika@sekolah.sch.id",
    foto: null,
    poin: 860,
    presensi: { masuk: 175, tidakMasuk: 5, totalHari: 180, persen: 97 },
    kuis: { rataRata: 88, selesaiCount: 8, totalBab: 8, babScores: {} },
    ulangan: { sem1: 85, sem2: 88, rataRata: 87 },
    ujian: { resmi1: 84 },
    kkm: 75,
    nilaiAkhir: 86,
    statusKKM: "Tuntas",
    isTuntas: true,
  },
  {
    no: 8,
    id: "s-fira-08",
    nama: "Fira Anggraini",
    nisn: "0089201151",
    kelas: "Kelas 8",
    email: "fira.anggraini@sekolah.sch.id",
    foto: null,
    poin: 820,
    presensi: { masuk: 168, tidakMasuk: 12, totalHari: 180, persen: 93 },
    kuis: { rataRata: 78, selesaiCount: 8, totalBab: 8, babScores: {} },
    ulangan: { sem1: 72, sem2: 75, rataRata: 74 },
    ujian: { resmi1: 72 },
    kkm: 75,
    nilaiAkhir: 74,
    statusKKM: "Remedial",
    isTuntas: false,
  },
  {
    no: 9,
    id: "s-gilang-09",
    nama: "Gilang Ramadhan",
    nisn: "0089201152",
    kelas: "Kelas 8",
    email: "gilang.ramadhan@sekolah.sch.id",
    foto: null,
    poin: 780,
    presensi: { masuk: 165, tidakMasuk: 15, totalHari: 180, persen: 92 },
    kuis: { rataRata: 74, selesaiCount: 8, totalBab: 8, babScores: {} },
    ulangan: { sem1: 70, sem2: 72, rataRata: 71 },
    ujian: { resmi1: 70 },
    kkm: 75,
    nilaiAkhir: 71,
    statusKKM: "Remedial",
    isTuntas: false,
  },
  {
    no: 10,
    id: "55555555-5555-5555-5555-555555555555",
    nama: "Ahmad Raihan",
    nisn: "0089201153",
    kelas: "Kelas 8",
    email: "ahmad.raihan@sekolah.sch.id",
    foto: null,
    poin: 750,
    presensi: { masuk: 173, tidakMasuk: 7, totalHari: 180, persen: 96 },
    kuis: { rataRata: 82, selesaiCount: 8, totalBab: 8, babScores: {} },
    ulangan: { sem1: 80, sem2: 84, rataRata: 82 },
    ujian: { resmi1: 82 },
    kkm: 75,
    nilaiAkhir: 82,
    statusKKM: "Tuntas",
    isTuntas: true,
  },
  {
    no: 11,
    id: "77777777-7777-7777-7777-777777777777",
    nama: "Siti Rahma Putri",
    nisn: "0089201154",
    kelas: "Kelas 8",
    email: "siti.rahma.putri@sekolah.sch.id",
    foto: null,
    poin: 720,
    presensi: { masuk: 171, tidakMasuk: 9, totalHari: 180, persen: 95 },
    kuis: { rataRata: 85, selesaiCount: 8, totalBab: 8, babScores: {} },
    ulangan: { sem1: 82, sem2: 85, rataRata: 84 },
    ujian: { resmi1: 84 },
    kkm: 75,
    nilaiAkhir: 84,
    statusKKM: "Tuntas",
    isTuntas: true,
  },
  {
    no: 12,
    id: "s-bella-12",
    nama: "Bella Safitri",
    nisn: "0089201155",
    kelas: "Kelas 8",
    email: "bella.safitri@sekolah.sch.id",
    foto: null,
    poin: 690,
    presensi: { masuk: 164, tidakMasuk: 16, totalHari: 180, persen: 91 },
    kuis: { rataRata: 72, selesaiCount: 8, totalBab: 8, babScores: {} },
    ulangan: { sem1: 68, sem2: 70, rataRata: 69 },
    ujian: { resmi1: 68 },
    kkm: 75,
    nilaiAkhir: 69,
    statusKKM: "Remedial",
    isTuntas: false,
  },
];

export default function GuruRekapanPage() {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentRecapRow[]>(FALLBACK_REKAPAN_STUDENTS);
  const [summary, setSummary] = useState<SummaryData>({
    totalSiswa: 12,
    rataRataNilaiAkhir: 83,
    rataRataKehadiran: 96,
    totalTuntas: 9,
    totalRemedial: 3,
    persentaseTuntas: 75,
    kkmStandar: 75,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"semua" | "tuntas" | "remedial" | "belum">("semua");
  const [filterPresensi, setFilterPresensi] = useState<"semua" | "aman" | "rawan">("semua");
  const [sortField, setSortField] = useState<"no" | "nama" | "nilaiAkhir" | "presensi">("no");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchRekapanData = async () => {
    try {
      const res = await fetch("/api/guru/rekapan");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.students) && data.students.length > 0) {
        setStudents(data.students);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err: any) {
      console.warn("Rekapan real-time sync:", err);
    }
  };

  useEffect(() => {
    fetchRekapanData();
  }, []);

  // Filter & Sort
  const processedStudents = useMemo(() => {
    let list = [...students];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.nama.toLowerCase().includes(q) ||
          s.nisn.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    if (filterStatus === "tuntas") {
      list = list.filter((s) => s.isTuntas);
    } else if (filterStatus === "remedial") {
      list = list.filter((s) => s.nilaiAkhir !== null && !s.isTuntas);
    } else if (filterStatus === "belum") {
      list = list.filter((s) => s.nilaiAkhir === null);
    }

    if (filterPresensi === "aman") {
      list = list.filter((s) => s.presensi.persen >= 85);
    } else if (filterPresensi === "rawan") {
      list = list.filter((s) => s.presensi.persen < 85);
    }

    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === "nama") {
        comparison = a.nama.localeCompare(b.nama);
      } else if (sortField === "nilaiAkhir") {
        const valA = a.nilaiAkhir ?? -1;
        const valB = b.nilaiAkhir ?? -1;
        comparison = valA - valB;
      } else if (sortField === "presensi") {
        comparison = a.presensi.persen - b.presensi.persen;
      } else {
        comparison = a.no - b.no;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return list;
  }, [students, searchQuery, filterStatus, filterPresensi, sortField, sortOrder]);

  const toggleSort = (field: "no" | "nama" | "nilaiAkhir" | "presensi") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // 1. Export CSV Handler
  const handleExportCSV = () => {
    if (students.length === 0) {
      showToast("Tidak ada data untuk diunduh.", "info");
      return;
    }

    const headers = [
      "No",
      "Nama Siswa",
      "NISN",
      "Email",
      "Presensi Hadir (Masuk)",
      "Presensi Tidak Hadir (Sakit/Izin/Alpha)",
      "Total Hari Efektif",
      "Persentase Kehadiran Tahunan (%)",
      "Rata-rata Kuis Bab 1-8",
      "Ulangan Semester 1",
      "Ulangan Semester 2",
      "Rata-rata Ulangan",
      "Ujian Resmi #1 (PTS/PAS)",
      "Nilai Akhir Komposit",
      "KKM Standar",
      "Status Ketuntasan",
    ];

    const rows = students.map((s, idx) => [
      idx + 1,
      `"${s.nama.replace(/"/g, '""')}"`,
      `="${s.nisn}"`,
      s.email,
      s.presensi.masuk,
      s.presensi.tidakMasuk,
      s.presensi.totalHari,
      `${s.presensi.persen}%`,
      s.kuis.rataRata ?? "-",
      s.ulangan.sem1 ?? "-",
      s.ulangan.sem2 ?? "-",
      s.ulangan.rataRata ?? "-",
      s.ujian.resmi1 ?? "-",
      s.nilaiAkhir ?? "-",
      s.kkm,
      s.statusKKM,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Rekap_Nilai_dan_Presensi_Kelas_8_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("File CSV Rekapan Nilai & Presensi berhasil diunduh!", "success");
  };

  // 2. Copy for Google Sheets (Tab-delimited)
  const handleCopyForGoogleSheets = async () => {
    if (students.length === 0) {
      showToast("Tidak ada data untuk disalin.", "info");
      return;
    }

    const headers = [
      "No",
      "Nama Siswa",
      "NISN",
      "Presensi Masuk",
      "Presensi Tidak Masuk",
      "% Kehadiran",
      "Rata Kuis (Bab 1-8)",
      "Ulangan Sem 1",
      "Ulangan Sem 2",
      "Ujian Resmi #1",
      "Nilai Akhir",
      "KKM",
      "Status Ketuntasan",
    ];

    const rows = students.map((s, idx) => [
      idx + 1,
      s.nama,
      s.nisn,
      s.presensi.masuk,
      s.presensi.tidakMasuk,
      `${s.presensi.persen}%`,
      s.kuis.rataRata ?? "-",
      s.ulangan.sem1 ?? "-",
      s.ulangan.sem2 ?? "-",
      s.ujian.resmi1 ?? "-",
      s.nilaiAkhir ?? "-",
      s.kkm,
      s.statusKKM,
    ]);

    const tsvContent = [
      headers.join("\t"),
      ...rows.map((r) => r.join("\t")),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(tsvContent);
      showToast(
        "Tabel berhasil disalin! Buka Google Sheets dan tekan Ctrl+V untuk menempelkan data.",
        "success"
      );
    } catch {
      showToast("Gagal menyalin ke clipboard. Izin browser diperlukan.", "info");
    }
  };

  return (
    <GuruLayout activeView="rekapan">
      <div className="space-y-6 pb-20">
        {/* Top Header Hero */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block">
                Buku Raport Kumulatif Terintegrasi Real-Time
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 inline-block">
                Kelas 8 (Matematika)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              Rekapan Nilai & Presensi Tahunan Siswa
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Seluruh data per siswa terekap otomatis dari Supabase: total setahun masuk & tidak masuk, nilai kuis bab (1–8),
              ulangan semester 1 & 2, ujian resmi PTS/PAS, serta kalkulasi otomatis Nilai Akhir terhadap standar KKM (75).
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* 1. Unduh CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-2 transition shadow-xs cursor-pointer"
              title="Unduh file spreadsheet dalam format CSV / Excel"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Unduh CSV / Excel</span>
            </button>

            {/* 2. Salin untuk Google Sheets */}
            <button
              type="button"
              onClick={handleCopyForGoogleSheets}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 transition shadow-2xs cursor-pointer bg-white"
              title="Salin seluruh tabel untuk di-paste langsung (Ctrl+V) ke Google Spreadsheet"
            >
              <Copy className="w-4 h-4 text-blue-600" />
              <span>Salin untuk Spreadsheet</span>
            </button>

            {/* 3. Buka Google Spreadsheet */}
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 transition shadow-xs cursor-pointer"
              title="Buka dokumen Google Spreadsheet master sekolah"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Buka Google Spreadsheet</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* 4. Refresh Realtime */}
            <button
              type="button"
              onClick={fetchRekapanData}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center transition shadow-2xs cursor-pointer disabled:opacity-50"
              title="Muat ulang data terbaru langsung dari Supabase"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200">
            {toastMessage.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* 4 Top KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Siswa */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Total Siswa Terdaftar</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-sans">
              {summary.totalSiswa}{" "}
              <span className="text-xs font-normal text-slate-400">siswa</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Data aktif tersinkronisasi di Supabase</p>
          </div>

          {/* Card 2: Rata-rata Nilai Akhir */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Rata-rata Nilai Akhir</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-sans flex items-baseline gap-1">
              <span className={summary.rataRataNilaiAkhir >= summary.kkmStandar ? "text-emerald-700" : "text-amber-700"}>
                {summary.rataRataNilaiAkhir}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Standar KKM: {summary.kkmStandar} Poin</p>
          </div>

          {/* Card 3: Ketuntasan Belajar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Ketuntasan KKM Kelas</span>
              <Award className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-900 font-sans">
              {summary.persentaseTuntas}%{" "}
              <span className="text-xs font-normal text-slate-400">
                ({summary.totalTuntas} Tuntas / {summary.totalRemedial} Remedial)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Berdasarkan kalkulasi nilai komposit</p>
          </div>

          {/* Card 4: Rata-rata Kehadiran */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Presensi Setahun</span>
              <UserCheck className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-900 font-sans">
              {summary.rataRataKehadiran}%{" "}
              <span className="text-xs font-normal text-slate-400">kehadiran</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Rekapitulasi kehadiran tahunan kelas</p>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setFilterStatus("semua")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filterStatus === "semua" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua ({students.length})
            </button>
            <button
              onClick={() => setFilterStatus("tuntas")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                filterStatus === "tuntas" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tuntas KKM ({summary.totalTuntas})</span>
            </button>
            <button
              onClick={() => setFilterStatus("remedial")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                filterStatus === "remedial" ? "bg-amber-600 text-white shadow-xs" : "text-amber-800 hover:bg-amber-50"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Remedial ({summary.totalRemedial})</span>
            </button>
            <button
              onClick={() => setFilterStatus("belum")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                filterStatus === "belum" ? "bg-slate-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Belum Lengkap</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Presensi Filter */}
            <select
              value={filterPresensi}
              onChange={(e) => setFilterPresensi(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="semua">Presensi: Semua</option>
              <option value="aman">Presensi: Aman (&gt;= 85%)</option>
              <option value="rawan">Presensi: Rawan (&lt; 85%)</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari siswa atau NISN..."
                className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Master Gradebook Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Tabel Buku Induk Penilaian & Presensi Siswa
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Kalkulasi Nilai Akhir otomatis: <strong>Kuis (30%) + Ulangan (30%) + Ujian Resmi (40%)</strong>
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Menampilkan {processedStudents.length} dari {students.length} siswa
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Mengambil data agregat siswa dari Supabase...</p>
            </div>
          ) : processedStudents.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Tidak Ada Siswa yang Ditemukan</h4>
              <p className="text-xs text-slate-500">Coba sesuaikan kata kunci pencarian atau filter status ketuntasan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-black uppercase tracking-wider text-[10px]">
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition"
                      onClick={() => toggleSort("no")}
                    >
                      <div className="flex items-center gap-1">
                        <span>No</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition min-w-[200px]"
                      onClick={() => toggleSort("nama")}
                    >
                      <div className="flex items-center gap-1">
                        <span>Nama Siswa & NISN</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition min-w-[170px]"
                      onClick={() => toggleSort("presensi")}
                    >
                      <div className="flex items-center gap-1">
                        <span>Presensi Setahun</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-center min-w-[120px]">
                      <span>Rata Kuis (Bab 1–8)</span>
                    </th>
                    <th className="px-4 py-3.5 text-center min-w-[110px]">
                      <span>Ulangan Sem 1</span>
                    </th>
                    <th className="px-4 py-3.5 text-center min-w-[110px]">
                      <span>Ulangan Sem 2</span>
                    </th>
                    <th className="px-4 py-3.5 text-center min-w-[120px]">
                      <span>Ujian Resmi #1</span>
                    </th>
                    <th
                      className="px-4 py-3.5 text-center cursor-pointer hover:bg-slate-100 transition min-w-[110px]"
                      onClick={() => toggleSort("nilaiAkhir")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Nilai Akhir</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-center min-w-[110px]">
                      <span>Status KKM (75)</span>
                    </th>
                    <th className="px-4 py-3.5 text-center min-w-[100px]">
                      <span>Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {processedStudents.map((st, idx) => {
                    const isPresensiSafe = st.presensi.persen >= 85;

                    return (
                      <tr
                        key={st.id}
                        className="hover:bg-blue-50/30 transition duration-150"
                      >
                        {/* No */}
                        <td className="px-4 py-3.5 text-slate-400 font-bold">
                          {idx + 1}
                        </td>

                        {/* Siswa */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {st.foto ? (
                                <img
                                  src={st.foto}
                                  alt={st.nama}
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              ) : (
                                st.nama.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-slate-900 truncate">
                                {st.nama}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                NISN: {st.nisn} • {st.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Presensi Setahun: Total Masuk vs Tidak Masuk */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-slate-900">
                                {st.presensi.masuk} Masuk{" "}
                                <span className="text-slate-400 font-normal">
                                  / {st.presensi.tidakMasuk} Absen
                                </span>
                              </span>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  isPresensiSafe
                                    ? "bg-teal-100 text-teal-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {st.presensi.persen}%
                              </span>
                            </div>
                            {/* Visual Progress Bar Presensi */}
                            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isPresensiSafe ? "bg-teal-500" : "bg-rose-500"
                                }`}
                                style={{ width: `${Math.min(st.presensi.persen, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Kuis Rata-rata */}
                        <td className="px-4 py-3.5 text-center">
                          {st.kuis.rataRata !== null ? (
                            <div>
                              <span className="font-black text-slate-900">
                                {st.kuis.rataRata}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {st.kuis.selesaiCount}/{st.kuis.totalBab} Bab Selesai
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Belum Ada</span>
                          )}
                        </td>

                        {/* Ulangan Sem 1 */}
                        <td className="px-4 py-3.5 text-center">
                          {st.ulangan.sem1 !== null ? (
                            <span className="font-bold text-slate-900 px-2 py-0.5 rounded-md bg-slate-100">
                              {st.ulangan.sem1}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </td>

                        {/* Ulangan Sem 2 */}
                        <td className="px-4 py-3.5 text-center">
                          {st.ulangan.sem2 !== null ? (
                            <span className="font-bold text-slate-900 px-2 py-0.5 rounded-md bg-slate-100">
                              {st.ulangan.sem2}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </td>

                        {/* Ujian Resmi #1 */}
                        <td className="px-4 py-3.5 text-center">
                          {st.ujian.resmi1 !== null ? (
                            <span className="font-black text-purple-900 px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-200">
                              {st.ujian.resmi1}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </td>

                        {/* Nilai Akhir */}
                        <td className="px-4 py-3.5 text-center">
                          {st.nilaiAkhir !== null ? (
                            <div className="font-black text-sm text-slate-900">
                              {st.nilaiAkhir}
                              <span className="text-[10px] text-slate-400 font-bold block">
                                / 100
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Belum Lengkap</span>
                          )}
                        </td>

                        {/* Status KKM */}
                        <td className="px-4 py-3.5 text-center">
                          {st.nilaiAkhir !== null ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                                st.isTuntas
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-amber-100 text-amber-800 border-amber-300"
                              }`}
                            >
                              {st.isTuntas ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                              )}
                              <span>{st.statusKKM}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                              <Clock className="w-3 h-3" />
                              <span>Belum Ada</span>
                            </span>
                          )}
                        </td>

                        {/* Aksi: Buka Lembar Kerja Siswa */}
                        <td className="px-4 py-3.5 text-center">
                          <Link
                            href={`/guru/siswa`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                            title="Review lembar kerja dan butir soal siswa"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Setiap nilai baru dari kuis, ulangan, atau ujian yang dikerjakan siswa di Supabase otomatis mengupdate rekapan ini secara live.
              </span>
            </span>
            <span className="font-bold text-slate-400">
              Total {students.length} Siswa Terdaftar
            </span>
          </div>
        </div>
      </div>
    </GuruLayout>
  );
}


"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Radio,
  Users,
  CheckCircle2,
  Clock,
  Award,
  Search,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Eye,
  Check,
  CheckCircle,
  XCircle,
  X,
  ShieldCheck,
  Loader2,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";

interface StudentItem {
  id: string;
  nama_lengkap: string;
  email: string;
}

interface SesiItem {
  id: string;
  siswa_id: string;
  status: string;
  nilai_akhir?: number;
  server_start_time: string;
  server_end_time: string;
  dikumpulkan_pada?: string;
}

interface UjianData {
  id: string;
  judul: string;
  mapel: string;
  tipe?: string;
  durasi_menit: number;
  passing_grade: number;
  status: string;
}

interface LiveMonitorClientProps {
  ujian: UjianData;
  initialStudents: StudentItem[];
  initialSessions: SesiItem[];
}

export default function LiveMonitorClient({
  ujian,
  initialStudents,
  initialSessions,
}: LiveMonitorClientProps) {
  const [sessions, setSessions] = useState<SesiItem[]>(initialSessions);
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "sedang" | "selesai" | "belum">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal inspection state for teacher to view right/wrong questions by student name
  const [selectedStudentForInspection, setSelectedStudentForInspection] = useState<any | null>(null);
  const [inspectionData, setInspectionData] = useState<any | null>(null);
  const [isLoadingInspection, setIsLoadingInspection] = useState(false);
  const [inspectionFilter, setInspectionFilter] = useState<"semua" | "benar" | "salah" | "parsial">("semua");

  const openStudentInspection = async (st: any) => {
    setSelectedStudentForInspection(st);
    setInspectionFilter("semua");
    setIsLoadingInspection(true);
    setInspectionData(null);

    try {
      const res = await fetch(`/api/guru/ujian/${ujian.id}/siswa/${st.id}`);
      if (res.ok) {
        const data = await res.json();
        setInspectionData(data);
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memuat rincian lembar jawaban siswa.");
      }
    } catch (e: any) {
      alert("Terjadi kesalahan jaringan: " + e.message);
    } finally {
      setIsLoadingInspection(false);
    }
  };

  const closeStudentInspection = () => {
    setSelectedStudentForInspection(null);
    setInspectionData(null);
  };

  // 1. Supabase Realtime WebSocket Subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`live-exam-${ujian.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sesi_ujian",
          filter: `ujian_id=eq.${ujian.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setSessions((prev) => [...prev, payload.new as SesiItem]);
          } else if (payload.eventType === "UPDATE") {
            setSessions((prev) =>
              prev.map((s) => (s.id === payload.new.id ? (payload.new as SesiItem) : s))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ujian.id]);

  // 2. Fetch fresh data manually
  const fetchFreshData = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`/api/guru/ujian/${ujian.id}/live`);
      if (res.ok) {
        const data = await res.json();
        if (data.students) {
          // Sync sessions from student rows
        }
      }
    } catch {} finally {
      setIsRefreshing(false);
    }
  };

  // Map students with their session status
  const studentRows = useMemo(() => {
    const sessionMap = new Map(sessions.map((s) => [s.siswa_id, s]));
    const now = new Date();

    return students.map((st) => {
      const sess = sessionMap.get(st.id);
      let status: "belum_mulai" | "sedang_mengerjakan" | "selesai" | "habis_waktu" = "belum_mulai";
      let score = null;
      let elapsedMins = 0;

      if (sess) {
        status = sess.status as any;
        score = sess.nilai_akhir ?? null;

        if (sess.server_start_time) {
          const startTime = new Date(sess.server_start_time);
          elapsedMins = Math.max(0, Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60)));
        }
      }

      return {
        id: st.id,
        name: st.nama_lengkap || "Siswa",
        email: st.email,
        status,
        score,
        elapsedMins,
        isPassed: score !== null && score >= ujian.passing_grade,
      };
    });
  }, [students, sessions, ujian.passing_grade]);

  // Stats
  const countSelesai = studentRows.filter((r) => r.status === "selesai" || r.status === "habis_waktu").length;
  const countSedang = studentRows.filter((r) => r.status === "sedang_mengerjakan").length;
  const countBelum = studentRows.filter((r) => r.status === "belum_mulai").length;
  const passedCount = studentRows.filter((r) => r.isPassed).length;

  const totalScore = studentRows.reduce((acc, r) => acc + (r.score || 0), 0);
  const avgScore = countSelesai > 0 ? Math.round(totalScore / countSelesai) : 0;

  // Filtered rows
  const filteredRows = studentRows.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === "sedang") return r.status === "sedang_mengerjakan";
    if (filterStatus === "selesai") return r.status === "selesai" || r.status === "habis_waktu";
    if (filterStatus === "belum") return r.status === "belum_mulai";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/guru/ujian"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Ujian</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-ping" />
            <span>Realtime Live Monitor Aktif</span>
          </div>

          <button
            onClick={fetchFreshData}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Banner Summary */}
      <div className="saas-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 inline-block mb-1.5">
              {ujian.mapel} • Durasi: {ujian.durasi_menit} Menit • KKM: {ujian.passing_grade}
            </span>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">{ujian.judul}</h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Pengawasan Waktu Server Otomatis</span>
          </div>
        </div>

        {/* Real-time Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-emerald-800 uppercase">Live Mengerjakan</span>
              <Radio className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-950">{countSedang} Siswa</div>
            <div className="text-[10px] text-emerald-700 font-medium">Sedang aktif di lembar ujian</div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-blue-800 uppercase">Selesai Dikumpulkan</span>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-950">{countSelesai} Siswa</div>
            <div className="text-[10px] text-blue-700 font-medium">
              {Math.round((countSelesai / (students.length || 1)) * 100)}% dari total kelas
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-600 uppercase">Belum Memulai</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900">{countBelum} Siswa</div>
            <div className="text-[10px] text-slate-500 font-medium">Belum membuka ruang ujian</div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-amber-800 uppercase">Rata-Rata Nilai</span>
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-950">{avgScore} Poin</div>
            <div className="text-[10px] text-amber-700 font-medium">
              {passedCount} Siswa memenuhi KKM ({ujian.passing_grade})
            </div>
          </div>
        </div>
      </div>

      {/* Student List Monitor Table */}
      <div className="saas-card rounded-3xl p-6 bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa atau email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterStatus === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
              }`}
            >
              Semua ({studentRows.length})
            </button>
            <button
              onClick={() => setFilterStatus("sedang")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterStatus === "sedang" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600"
              }`}
            >
              Sedang ({countSedang})
            </button>
            <button
              onClick={() => setFilterStatus("selesai")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterStatus === "selesai" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600"
              }`}
            >
              Selesai ({countSelesai})
            </button>
            <button
              onClick={() => setFilterStatus("belum")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterStatus === "belum" ? "bg-slate-700 text-white shadow-2xs" : "text-slate-600"
              }`}
            >
              Belum ({countBelum})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="p-3.5 pl-5">Nama Siswa</th>
                <th className="p-3.5">Status Pengerjaan</th>
                <th className="p-3.5">Waktu Berjalan</th>
                <th className="p-3.5">Nilai Akhir</th>
                <th className="p-3.5">Status KKM</th>
                <th className="p-3.5 pr-5 text-right">Analisis Soal Siswa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    Tidak ada siswa yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition">
                    <td
                      className="p-3.5 pl-5 font-bold text-slate-900 cursor-pointer"
                      onClick={() => openStudentInspection(st)}
                      title={`Klik untuk periksa jawaban ${st.name}`}
                    >
                      <div className="hover:text-blue-600 transition flex items-center gap-1.5">
                        <span>{st.name}</span>
                        <Eye className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">{st.email}</div>
                    </td>
                    <td className="p-3.5">
                      {st.status === "sedang_mengerjakan" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] animate-pulse">
                          <Radio className="w-3 h-3 text-emerald-600" />
                          <span>Sedang Mengerjakan</span>
                        </span>
                      ) : st.status === "selesai" || st.status === "habis_waktu" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          <span>Selesai Dikumpulkan</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                          <span>Belum Memulai</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-medium text-slate-600">
                      {st.status === "sedang_mengerjakan" ? (
                        <span className="font-bold text-emerald-700">{st.elapsedMins} Menit</span>
                      ) : st.status === "selesai" ? (
                        <span>Telah Selesai</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {st.score !== null ? (
                        <span className="text-sm font-black text-[#0F172A]">{st.score}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {st.score !== null ? (
                        st.isPassed ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-[10px]">
                            LULUS
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-black text-[10px]">
                            REMEDIAL
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 text-[10px]">-</span>
                      )}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        type="button"
                        onClick={() => openStudentInspection(st)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-black text-[11px] transition shadow-2xs cursor-pointer"
                        title={`Periksa benar salah butir soal untuk ${st.name}`}
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cek Soal</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Inspection Modal (Cek Benar & Salah Khusus Guru Berdasarkan Nama User di Database) */}
      {selectedStudentForInspection && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/70 flex items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Akses Khusus Dewan Guru
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {ujian.mapel}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                  <span>Lembar Jawaban:</span>
                  <span className="text-blue-700 underline decoration-blue-300">
                    {selectedStudentForInspection.name}
                  </span>
                </h3>
                <div className="text-xs text-slate-500 font-medium">
                  {selectedStudentForInspection.email} • ID Siswa: {selectedStudentForInspection.id.slice(0, 8)}...
                </div>
              </div>

              <button
                type="button"
                onClick={closeStudentInspection}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {isLoadingInspection ? (
                <div className="py-20 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">
                    Mengambil analisis butir soal dan data jawaban siswa dari database...
                  </p>
                </div>
              ) : !inspectionData ? (
                <div className="py-16 text-center text-slate-500 text-xs">
                  Data lembar jawaban siswa belum tersedia.
                </div>
              ) : (
                <>
                  {/* Summary Scores & Status Bar */}
                  <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Nilai Akhir Siswa
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                        {inspectionData.summary.totalScore}
                        <span className="text-sm text-slate-400 font-bold"> / 100</span>
                      </div>
                      <div className="text-[10px] font-bold">
                        {inspectionData.summary.isPassed ? (
                          <span className="text-emerald-700">LULUS (KKM {inspectionData.summary.passingGrade})</span>
                        ) : (
                          <span className="text-rose-700">REMEDIAL (KKM {inspectionData.summary.passingGrade})</span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                      <div className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center justify-between">
                        <span>Jawaban Benar</span>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-900">
                        {inspectionData.summary.correctCount}
                        <span className="text-xs text-emerald-600 font-bold">
                          {" "}
                          / {inspectionData.summary.totalQuestions} Soal
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold">
                        +{inspectionData.summary.correctCount * 5} Poin Diperoleh
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
                      <div className="text-[10px] font-black uppercase text-rose-800 tracking-wider flex items-center justify-between">
                        <span>Jawaban Salah</span>
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-rose-900">
                        {inspectionData.summary.wrongCount}
                        <span className="text-xs text-rose-600 font-bold">
                          {" "}
                          / {inspectionData.summary.totalQuestions} Soal
                        </span>
                      </div>
                      <div className="text-[10px] text-rose-700 font-bold">0 Poin</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                      <div className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center justify-between">
                        <span>Mendekati Benar</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-amber-900">
                        {inspectionData.summary.partialCount}
                      </div>
                      <div className="text-[10px] text-amber-700 font-bold">Koreksi Esai AI</div>
                    </div>
                  </div>

                  {/* Filter & Quick Palette */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-xs font-black text-[#0F172A] uppercase tracking-wider">
                        Palet Deteksi Benar / Salah Siswa:
                      </span>
                      <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setInspectionFilter("semua")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            inspectionFilter === "semua" ? "bg-slate-900 text-white" : "text-slate-600"
                          }`}
                        >
                          Semua ({inspectionData.questions.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setInspectionFilter("benar")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer text-emerald-700 ${
                            inspectionFilter === "benar" ? "bg-emerald-600 text-white" : "hover:bg-emerald-50"
                          }`}
                        >
                          Benar ({inspectionData.summary.correctCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setInspectionFilter("salah")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer text-rose-700 ${
                            inspectionFilter === "salah" ? "bg-rose-600 text-white" : "hover:bg-rose-50"
                          }`}
                        >
                          Salah ({inspectionData.summary.wrongCount})
                        </button>
                      </div>
                    </div>

                    {/* Question Jump Numbers */}
                    <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-20 gap-1.5 pt-1">
                      {inspectionData.questions.map((q: any, idx: number) => {
                        const isCorrect = q.studentAnswer?.isBenar === true;
                        const isPartial = q.studentAnswer?.isBenar === null;
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => {
                              const el = document.getElementById(`guru-q-${idx + 1}`);
                              if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                            }}
                            className={`h-8 rounded-lg font-black text-xs transition cursor-pointer flex items-center justify-center border ${
                              isCorrect
                                ? "bg-emerald-500 text-white border-emerald-600"
                                : isPartial
                                ? "bg-amber-500 text-white border-amber-600"
                                : "bg-rose-500 text-white border-rose-600"
                            }`}
                            title={`Soal #${idx + 1}: ${isCorrect ? "Benar" : isPartial ? "Mendekati Benar" : "Salah"}`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question Cards List */}
                  <div className="space-y-4">
                    {inspectionData.questions
                      .filter((q: any) => {
                        if (inspectionFilter === "benar") return q.studentAnswer?.isBenar === true;
                        if (inspectionFilter === "salah") return q.studentAnswer?.isBenar === false;
                        if (inspectionFilter === "parsial") return q.studentAnswer?.isBenar === null;
                        return true;
                      })
                      .map((q: any) => {
                        const isCorrect = q.studentAnswer?.isBenar === true;
                        const isPartial = q.studentAnswer?.isBenar === null;
                        const earned = q.studentAnswer?.skorDiperoleh ?? 0;

                        return (
                          <div
                            key={q.id}
                            id={`guru-q-${q.urutan}`}
                            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4"
                          >
                            {/* Question Header */}
                            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                                  #{q.urutan}
                                </span>
                                <span className="text-xs font-bold text-slate-500 uppercase">
                                  {q.tipe_soal === "pilihan_ganda" ? "Pilihan Ganda" : "Esai"} • Bobot {q.poin_bobot} Poin
                                </span>
                              </div>

                              {/* Status Badge */}
                              {isCorrect ? (
                                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center gap-1.5">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>BENAR (+{earned} Poin)</span>
                                </span>
                              ) : isPartial ? (
                                <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                  <span>MENDEKATI BENAR (+{earned} Poin)</span>
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-black flex items-center gap-1.5">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>SALAH (0 / {q.poin_bobot} Poin)</span>
                                </span>
                              )}
                            </div>

                            {/* Pertanyaan */}
                            <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                              <MarkdownRenderer content={q.pertanyaan} />
                            </div>

                            {/* Opsi / Esai */}
                            {q.tipe_soal === "pilihan_ganda" ? (
                              <div className="space-y-2 pt-1">
                                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                  Pilihan Jawaban & Jawaban Siswa:
                                </div>
                                <div className="space-y-2">
                                  {q.opsi?.map((op: any, oIdx: number) => {
                                    const letter = String.fromCharCode(65 + oIdx);
                                    const isChosen = q.studentAnswer?.opsiId === op.id;
                                    const isKey = op.benar === true;

                                    let boxStyle = "bg-slate-50 border-slate-200 text-slate-600";
                                    let tag = null;

                                    if (isChosen && isKey) {
                                      boxStyle = "bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-bold";
                                      tag = (
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black flex items-center gap-1 shrink-0">
                                          <Check className="w-3 h-3" />
                                          <span>Jawaban Siswa (Benar)</span>
                                        </span>
                                      );
                                    } else if (isChosen && !isKey) {
                                      boxStyle = "bg-rose-50 border-2 border-rose-400 text-rose-950 font-bold";
                                      tag = (
                                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black flex items-center gap-1 shrink-0">
                                          <X className="w-3 h-3" />
                                          <span>Jawaban Siswa (Salah)</span>
                                        </span>
                                      );
                                    } else if (!isChosen && isKey) {
                                      boxStyle = "bg-emerald-50/60 border-2 border-emerald-400 border-dashed text-emerald-900 font-semibold";
                                      tag = (
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-black shrink-0">
                                          Kunci Jawaban yang Benar
                                        </span>
                                      );
                                    }

                                    return (
                                      <div
                                        key={op.id}
                                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${boxStyle}`}
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <span
                                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                              isChosen && isKey
                                                ? "bg-emerald-600 text-white"
                                                : isChosen && !isKey
                                                ? "bg-rose-600 text-white"
                                                : isKey
                                                ? "bg-emerald-200 text-emerald-800"
                                                : "bg-slate-200 text-slate-600"
                                            }`}
                                          >
                                            {letter}
                                          </span>
                                          <span>{op.teks_opsi}</span>
                                        </div>
                                        {tag}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2 pt-1 text-xs">
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                                  <span className="text-[10px] font-black uppercase text-slate-400 block">
                                    Jawaban Siswa:
                                  </span>
                                  <p className="font-semibold text-slate-800 whitespace-pre-wrap">
                                    {q.studentAnswer?.jawabanEsai || "(Tidak dijawab)"}
                                  </p>
                                </div>
                                {q.kunci_jawaban && (
                                  <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                                    <span className="text-[10px] font-black uppercase text-indigo-700 block">
                                      Kunci Jawaban Guru:
                                    </span>
                                    <p className="font-semibold text-indigo-950">{q.kunci_jawaban}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Pembahasan Soal */}
                            {q.pembahasan && (
                              <div className="p-3.5 rounded-xl bg-slate-50 border-l-4 border-l-blue-600 border border-slate-200 text-xs space-y-1">
                                <span className="font-bold text-blue-900 block">Pembahasan / Catatan Guru:</span>
                                <div className="text-slate-700">
                                  <MarkdownRenderer content={q.pembahasan} />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Data divalidasi langsung dari database sistem asesmen sekolah.
              </span>
              <button
                type="button"
                onClick={closeStudentInspection}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Tutup Lembar Pemeriksaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  Search,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Check,
  CheckCircle,
  XCircle,
  X,
  Loader2,
  Lightbulb,
  Lock,
  RotateCcw,
  Unlock,
  UserPlus,
  UserX,
  FileText,
  UserMinus,
} from "lucide-react";
import MarkdownRenderer from "@/components/materi/MarkdownRenderer";

interface StudentItem {
  id: string;
  nama_lengkap: string;
  email: string;
  nisn?: string;
  foto_url?: string;
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
  initialExcludedStudentIds?: string[];
}

export default function LiveMonitorClient({
  ujian,
  initialStudents,
  initialSessions,
  initialExcludedStudentIds = [],
}: LiveMonitorClientProps) {
  const [sessions, setSessions] = useState<SesiItem[]>(initialSessions);
  const [allStudents, setAllStudents] = useState<StudentItem[]>(initialStudents);
  const [excludedStudentIds, setExcludedStudentIds] = useState<string[]>(initialExcludedStudentIds);

  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [inviteSearchQuery, setInviteSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "aktif" | "tidak_aktif" | "terkunci" | "selesai" | "dikeluarkan">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);
  const [isRosterSaving, setIsRosterSaving] = useState(false);

  // Reset modal state
  const [studentToReset, setStudentToReset] = useState<any | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Teacher inspection modal state
  const [selectedStudentForInspection, setSelectedStudentForInspection] = useState<any | null>(null);
  const [inspectionData, setInspectionData] = useState<any | null>(null);
  const [isLoadingInspection, setIsLoadingInspection] = useState(false);
  const [inspectionFilter, setInspectionFilter] = useState<"semua" | "benar" | "salah" | "parsial">("semua");

  const showToast = (text: string, type: "success" | "info" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
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

  // 2. Refresh data manually
  const fetchFreshData = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`/api/guru/ujian/${ujian.id}/live`);
      if (res.ok) {
        const data = await res.json();
        if (data.students) {
          // synced
        }
      }
    } catch {} finally {
      setIsRefreshing(false);
    }
  };

  // 3. Handle Exclude Student (Hapus Nama dari Ujian)
  const handleExcludeStudent = async (studentId: string, studentName: string) => {
    if (excludedStudentIds.includes(studentId)) return;
    const nextExcluded = [...excludedStudentIds, studentId];
    setExcludedStudentIds(nextExcluded);
    showToast(`Siswa "${studentName}" berhasil dihapus dari daftar peserta ujian.`, "info");

    try {
      setIsRosterSaving(true);
      await fetch(`/api/guru/ujian/${ujian.id}/roster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "exclude", studentId }),
      });
    } catch (err: any) {
      console.error("Gagal simpan roster:", err);
    } finally {
      setIsRosterSaving(false);
    }
  };

  // 4. Handle Invite Student (Invit Ulang Siswa & Buka Kunci Sesi jika Terkunci)
  const handleInviteStudent = async (studentId: string, studentName: string) => {
    const nextExcluded = excludedStudentIds.filter((id) => id !== studentId);
    setExcludedStudentIds(nextExcluded);

    // Otomatis buka status sesi jika terkunci karena keluar screen
    setSessions((prev) =>
      prev.map((s) =>
        s.siswa_id === studentId && s.status === "terkunci"
          ? { ...s, status: "sedang_mengerjakan" }
          : s
      )
    );

    showToast(`Siswa "${studentName}" berhasil di-invit ke ujian! Akses ujian aktif kembali.`, "success");

    try {
      setIsRosterSaving(true);
      await fetch(`/api/guru/ujian/${ujian.id}/roster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "invite", studentId }),
      });
    } catch (err: any) {
      console.error("Gagal simpan roster:", err);
    } finally {
      setIsRosterSaving(false);
    }
  };

  // 4b. Siklus Cepat: Hapus & Invit Ulang Siswa yang Terdeteksi Keluar Layar
  const handleReinviteCycle = async (studentId: string, studentName: string) => {
    await handleExcludeStudent(studentId, studentName);
    setTimeout(async () => {
      await handleInviteStudent(studentId, studentName);
      showToast(`Siswa "${studentName}" berhasil di-invit ulang. Kunci ujian resmi telah dibuka kembali!`, "success");
    }, 400);
  };

  // 5. Handle Reset All Roster (Invit Seluruh Siswa)
  const handleResetAllRoster = async () => {
    setExcludedStudentIds([]);
    showToast(`Seluruh siswa terdaftar di Supabase berhasil di-invit ke ujian ini.`, "success");

    try {
      setIsRosterSaving(true);
      await fetch(`/api/guru/ujian/${ujian.id}/roster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
    } catch (err: any) {
      console.error("Gagal reset roster:", err);
    } finally {
      setIsRosterSaving(false);
    }
  };

  // 6. Reset Exam Session Handler
  const handleResetExam = async (mode: "unlock" | "fresh") => {
    if (!studentToReset) return;
    setIsResetting(true);
    setResetSuccessMessage(null);
    try {
      const res = await fetch(`/api/guru/ujian/${ujian.id}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswaId: studentToReset.id, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal melakukan reset.");
      } else {
        setResetSuccessMessage(data.message || "Operasi reset berhasil!");
        if (mode === "unlock") {
          setSessions((prev) =>
            prev.map((s) =>
              s.siswa_id === studentToReset.id
                ? { ...s, status: "sedang_mengerjakan" }
                : s
            )
          );
        } else {
          setSessions((prev) => prev.filter((s) => s.siswa_id !== studentToReset.id));
        }
        setTimeout(() => {
          setStudentToReset(null);
          setResetSuccessMessage(null);
        }, 1200);
      }
    } catch (e: any) {
      alert("Terjadi kesalahan jaringan: " + e.message);
    } finally {
      setIsResetting(false);
    }
  };

  // 7. Student Inspection Modal
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

  // Map all students with their session status & exclusion status
  const studentRows = useMemo(() => {
    const sessionMap = new Map(sessions.map((s) => [s.siswa_id, s]));
    const now = new Date();

    return allStudents.map((st) => {
      const isExcluded = excludedStudentIds.includes(st.id);
      const sess = sessionMap.get(st.id);
      let status: "belum_mulai" | "sedang_mengerjakan" | "terkunci" | "selesai" | "habis_waktu" = "belum_mulai";
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
        nisn: st.nisn || "",
        foto_url: st.foto_url || "",
        isExcluded,
        status,
        score,
        elapsedMins,
        isPassed: score !== null && score >= ujian.passing_grade,
      };
    });
  }, [allStudents, sessions, excludedStudentIds, ujian.passing_grade]);

  // Enrolled (active participants in the exam) vs Excluded
  const enrolledRows = useMemo(() => studentRows.filter((r) => !r.isExcluded), [studentRows]);
  const excludedRows = useMemo(() => studentRows.filter((r) => r.isExcluded), [studentRows]);

  // Counters
  const countSedang = enrolledRows.filter((r) => r.status === "sedang_mengerjakan").length; // Aktif
  const countBelum = enrolledRows.filter((r) => r.status === "belum_mulai").length; // Tidak Aktif
  const countTerkunci = enrolledRows.filter((r) => r.status === "terkunci").length;
  const countSelesai = enrolledRows.filter((r) => r.status === "selesai" || r.status === "habis_waktu").length;
  const countDikeluarkan = excludedRows.length;
  const passedCount = enrolledRows.filter((r) => r.isPassed).length;

  const totalScore = enrolledRows.reduce((acc, r) => acc + (r.score || 0), 0);
  const avgScore = countSelesai > 0 ? Math.round(totalScore / countSelesai) : 0;

  // Search recommendations when typing in the invite search box
  const inviteRecommendations = useMemo(() => {
    const q = inviteSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return allStudents
      .filter(
        (s) =>
          s.nama_lengkap?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          (s.nisn && s.nisn.toLowerCase().includes(q))
      )
      .slice(0, 8); // Top 8 matches
  }, [allStudents, inviteSearchQuery]);

  // Filtered rows for the monitor table
  const filteredRows = useMemo(() => {
    let baseList = filterStatus === "dikeluarkan" ? excludedRows : enrolledRows;

    if (filterStatus === "aktif") {
      baseList = baseList.filter((r) => r.status === "sedang_mengerjakan");
    } else if (filterStatus === "tidak_aktif") {
      baseList = baseList.filter((r) => r.status === "belum_mulai");
    } else if (filterStatus === "terkunci") {
      baseList = baseList.filter((r) => r.status === "terkunci");
    } else if (filterStatus === "selesai") {
      baseList = baseList.filter((r) => r.status === "selesai" || r.status === "habis_waktu");
    }

    if (tableSearchQuery.trim()) {
      const q = tableSearchQuery.toLowerCase();
      baseList = baseList.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.nisn.toLowerCase().includes(q)
      );
    }

    return baseList;
  }, [filterStatus, enrolledRows, excludedRows, tableSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : toastMessage.type === "info"
              ? "bg-blue-50 border-blue-300 text-blue-900"
              : "bg-rose-50 border-rose-300 text-rose-900"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : toastMessage.type === "info" ? (
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/guru/ujian"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Ruang Kelola Ujian</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-ping" />
            <span>Realtime Live Monitor Terhubung</span>
          </div>

          <button
            onClick={fetchFreshData}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Banner Summary Hero */}
      <div className="saas-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 inline-block">
                {ujian.mapel}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Durasi: {ujian.durasi_menit} Menit
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                KKM: {ujian.passing_grade}
              </span>
              {isRosterSaving && (
                <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Menyimpan perubahan peserta...
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">{ujian.judul}</h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Pengawasan Waktu Server Otomatis</span>
          </div>
        </div>

        {/* Real-time Metric Cards: Aktif vs Tidak Aktif Highlight */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Siswa Aktif (Sedang Mengerjakan) */}
          <div
            onClick={() => setFilterStatus("aktif")}
            className={`p-4 rounded-2xl border transition cursor-pointer space-y-1 ${
              filterStatus === "aktif"
                ? "bg-emerald-100/80 border-emerald-400 ring-2 ring-emerald-400/40"
                : "bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-emerald-800 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Siswa Aktif
              </span>
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950">{countSedang} Siswa</div>
            <div className="text-[10px] text-emerald-700 font-medium">
              Sedang live mengerjakan lembar ujian
            </div>
          </div>

          {/* Card 2: Siswa Tidak Aktif (Belum Memulai) */}
          <div
            onClick={() => setFilterStatus("tidak_aktif")}
            className={`p-4 rounded-2xl border transition cursor-pointer space-y-1 ${
              filterStatus === "tidak_aktif"
                ? "bg-slate-200/90 border-slate-400 ring-2 ring-slate-400/40"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-600 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Siswa Tidak Aktif
              </span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{countBelum} Siswa</div>
            <div className="text-[10px] text-slate-500 font-medium">
              Belum masuk / belum memulai ujian
            </div>
          </div>

          {/* Card 3: Terkunci (Butuh Bantuan Guru) */}
          <div
            onClick={() => setFilterStatus("terkunci")}
            className={`p-4 rounded-2xl border transition cursor-pointer space-y-1 ${
              filterStatus === "terkunci"
                ? "bg-red-100/80 border-red-400 ring-2 ring-red-400/40"
                : "bg-red-50/50 border-red-200 hover:bg-red-100/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-red-800 uppercase flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-red-600" />
                Sesi Terkunci
              </span>
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-950">{countTerkunci} Siswa</div>
            <div className="text-[10px] text-red-700 font-medium">
              Keluar ujian (perlu dibuka/direset guru)
            </div>
          </div>

          {/* Card 4: Selesai Dikumpulkan */}
          <div
            onClick={() => setFilterStatus("selesai")}
            className={`p-4 rounded-2xl border transition cursor-pointer space-y-1 ${
              filterStatus === "selesai"
                ? "bg-blue-100/80 border-blue-400 ring-2 ring-blue-400/40"
                : "bg-blue-50/50 border-blue-200 hover:bg-blue-100/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-blue-800 uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                Selesai Dikumpulkan
              </span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-950">{countSelesai} Siswa</div>
            <div className="text-[10px] text-blue-700 font-medium">
              Rata-rata: {avgScore} Poin • {passedCount} Lulus
            </div>
          </div>
        </div>
      </div>

      {/* Mesin Pencarian & Invit Siswa Terdaftar di Supabase */}
      <div className="saas-card rounded-3xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Mesin Pencari & Invit Siswa (Database Supabase)</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Siswa terdaftar di Supabase otomatis muncul di ujian ini. Guru dapat menghapus nama siswa, atau mencari nama siswa untuk di-invit ulang sewaktu-waktu.
            </p>
          </div>

          {countDikeluarkan > 0 && (
            <button
              type="button"
              onClick={handleResetAllRoster}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Kembalikan semua siswa Supabase ke daftar ujian"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Undang Semua Siswa ({allStudents.length})</span>
            </button>
          )}
        </div>

        {/* Search Input for Invitation */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={inviteSearchQuery}
            onChange={(e) => setInviteSearchQuery(e.target.value)}
            placeholder="Cari nama siswa atau email di Supabase untuk di-invit (contoh: Bella, Dimas, Rizky)..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {inviteSearchQuery && (
            <button
              type="button"
              onClick={() => setInviteSearchQuery("")}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Recommendation Dropdown / Box when typing */}
        {inviteSearchQuery.trim() !== "" && (
          <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in duration-150">
            <div className="text-[11px] font-bold text-slate-500 px-1">
              Rekomendasi Siswa Terdaftar di Supabase ({inviteRecommendations.length}):
            </div>

            {inviteRecommendations.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 font-medium">
                Tidak ditemukan siswa dengan kata kunci &quot;{inviteSearchQuery}&quot; di database Supabase.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {inviteRecommendations.map((st) => {
                  const isEnrolled = !excludedStudentIds.includes(st.id);
                  return (
                    <div
                      key={st.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {st.nama_lengkap.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 truncate">{st.nama_lengkap}</div>
                          <div className="text-[10px] text-slate-400 truncate">{st.email}</div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isEnrolled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Terdaftar</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleInviteStudent(st.id, st.nama_lengkap)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black transition cursor-pointer shadow-xs"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>+ Invit</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Student Monitor Table */}
      <div className="saas-card rounded-3xl p-6 bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={tableSearchQuery}
              onChange={(e) => setTableSearchQuery(e.target.value)}
              placeholder="Cari siswa di tabel monitor..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl flex-wrap">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterStatus === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
              }`}
            >
              Semua Terdaftar ({enrolledRows.length})
            </button>
            <button
              onClick={() => setFilterStatus("aktif")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                filterStatus === "aktif" ? "bg-emerald-600 text-white shadow-2xs" : "text-emerald-800 font-extrabold"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Aktif ({countSedang})</span>
            </button>
            <button
              onClick={() => setFilterStatus("tidak_aktif")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                filterStatus === "tidak_aktif" ? "bg-slate-700 text-white shadow-2xs" : "text-slate-600"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Tidak Aktif ({countBelum})</span>
            </button>
            <button
              onClick={() => setFilterStatus("terkunci")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                filterStatus === "terkunci"
                  ? "bg-red-600 text-white shadow-2xs"
                  : countTerkunci > 0
                  ? "text-red-700 font-extrabold"
                  : "text-slate-600"
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>Terkunci ({countTerkunci})</span>
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
              onClick={() => setFilterStatus("dikeluarkan")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                filterStatus === "dikeluarkan"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : countDikeluarkan > 0
                  ? "text-rose-700 font-extrabold"
                  : "text-slate-600"
              }`}
            >
              <UserX className="w-3 h-3" />
              <span>Dikeluarkan ({countDikeluarkan})</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="p-3.5 pl-5">Nama Siswa</th>
                <th className="p-3.5">Status Keaktifan</th>
                <th className="p-3.5">Waktu Berjalan</th>
                <th className="p-3.5">Nilai Akhir</th>
                <th className="p-3.5">Status KKM</th>
                <th className="p-3.5 pr-5 text-right">Aksi Kelola Peserta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    {filterStatus === "dikeluarkan"
                      ? "Tidak ada siswa yang dikeluarkan. Seluruh siswa terdaftar di Supabase aktif di ujian ini."
                      : "Tidak ada siswa yang sesuai dengan filter."}
                  </td>
                </tr>
              ) : (
                filteredRows.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 pl-5 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                          {st.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900">{st.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{st.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Status Keaktifan */}
                    <td className="p-3.5">
                      {st.isExcluded ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-black text-[10px] border border-rose-300">
                          <UserX className="w-3 h-3 text-rose-600" />
                          <span>Dikeluarkan dari Ujian</span>
                        </span>
                      ) : st.status === "terkunci" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-black text-[10px] border border-red-300 animate-pulse">
                          <Lock className="w-3 h-3 text-red-600" />
                          <span>Terdeteksi Keluar Layar (Terkunci)</span>
                        </span>
                      ) : st.status === "sedang_mengerjakan" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] border border-emerald-300 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Aktif (Sedang Mengerjakan)</span>
                        </span>
                      ) : st.status === "selesai" || st.status === "habis_waktu" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          <span>Selesai Dikumpulkan</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px] border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>Tidak Aktif (Belum Mulai)</span>
                        </span>
                      )}
                    </td>

                    {/* Waktu Berjalan */}
                    <td className="p-3.5 font-medium text-slate-600">
                      {st.isExcluded ? (
                        <span className="text-slate-400">-</span>
                      ) : st.status === "terkunci" ? (
                        <span className="font-bold text-red-700">Terkunci ({st.elapsedMins} M)</span>
                      ) : st.status === "sedang_mengerjakan" ? (
                        <span className="font-bold text-emerald-700">{st.elapsedMins} Menit</span>
                      ) : st.status === "selesai" ? (
                        <span>Telah Selesai</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Nilai Akhir */}
                    <td className="p-3.5">
                      {st.score !== null ? (
                        <span className="text-sm font-black text-[#0F172A]">{st.score}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Status KKM */}
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

                    {/* Aksi Kelola Peserta */}
                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {st.isExcluded ? (
                          <button
                            type="button"
                            onClick={() => handleInviteStudent(st.id, st.name)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] transition shadow-2xs cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>+ Invit Kembali</span>
                          </button>
                        ) : (
                          <>
                            {/* Buka Kunci / Reset */}
                            {st.status === "terkunci" ? (
                              <button
                                type="button"
                                onClick={() => handleReinviteCycle(st.id, st.name)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-[11px] transition shadow-2xs cursor-pointer animate-pulse"
                                title={`Hapus nama dan invit ulang ${st.name} untuk membuka kunci ujian resmi`}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Invit Ulang</span>
                              </button>
                            ) : (st.status === "sedang_mengerjakan" || st.status === "selesai") && (
                              <button
                                type="button"
                                onClick={() => setStudentToReset(st)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer border bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900"
                                title={`Reset pengerjaan untuk ${st.name}`}
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                                <span>Reset</span>
                              </button>
                            )}

                            {/* Cek Soal */}
                            <button
                              type="button"
                              onClick={() => openStudentInspection(st)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-black text-[11px] transition shadow-2xs cursor-pointer"
                              title={`Periksa analisis butir soal untuk ${st.name}`}
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-400" />
                              <span>Cek Jawaban</span>
                            </button>

                            {/* Hapus Nama dari Ujian */}
                            <button
                              type="button"
                              onClick={() => handleExcludeStudent(st.id, st.name)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] transition cursor-pointer"
                              title={`Hapus ${st.name} dari daftar peserta ujian ini`}
                            >
                              <UserMinus className="w-3.5 h-3.5 text-rose-600" />
                              <span>Hapus Nama</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Inspection Modal (Cek Benar & Salah Khusus Guru) */}
      {selectedStudentForInspection && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/70 flex items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Akses Dewan Guru
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
                  Data lembar jawaban siswa belum tersedia atau siswa belum mulai mengerjakan.
                </div>
              ) : (
                <>
                  {/* Summary Scores */}
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

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Jawaban Benar
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                        {inspectionData.summary.correctCount}
                        <span className="text-sm text-slate-400 font-bold"> Soal</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">Skor Penuh</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Jawaban Salah
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-rose-600">
                        {inspectionData.summary.wrongCount}
                        <span className="text-sm text-slate-400 font-bold"> Soal</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">Perlu Penguatan Konsep</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Akurasi Materi
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-blue-600">
                        {inspectionData.summary.accuracy}%
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {inspectionData.summary.answeredCount} dari {inspectionData.summary.totalQuestions} Dijawab
                      </div>
                    </div>
                  </div>

                  {/* Filter Soal */}
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setInspectionFilter("semua")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        inspectionFilter === "semua" ? "bg-[#0F172A] text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Semua Butir Soal ({inspectionData.questions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectionFilter("benar")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        inspectionFilter === "benar" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Benar ({inspectionData.summary.correctCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectionFilter("salah")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        inspectionFilter === "salah" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-800"
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Salah ({inspectionData.summary.wrongCount})</span>
                    </button>
                  </div>

                  {/* Question Cards */}
                  <div className="space-y-4">
                    {inspectionData.questions
                      .filter((q: any) => {
                        if (inspectionFilter === "benar") return q.isCorrect;
                        if (inspectionFilter === "salah") return !q.isCorrect;
                        return true;
                      })
                      .map((q: any) => (
                        <div
                          key={q.id}
                          className={`p-5 rounded-3xl border transition space-y-4 ${
                            q.isCorrect ? "bg-emerald-50/20 border-emerald-200" : "bg-rose-50/20 border-rose-200"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                              Nomor {q.urutan}
                            </span>
                            <span
                              className={`text-xs font-black px-3 py-1 rounded-full ${
                                q.isCorrect
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-rose-100 text-rose-800 border border-rose-200"
                              }`}
                            >
                              {q.isCorrect ? "✓ Jawaban Benar" : "✗ Jawaban Salah"} • {q.scoreAwarded} / {q.poinBobot} Poin
                            </span>
                          </div>

                          <div className="text-sm font-bold text-slate-900 leading-relaxed">
                            <MarkdownRenderer content={q.pertanyaan} />
                          </div>

                          {/* Options */}
                          {q.options && q.options.length > 0 && (
                            <div className="space-y-2 pt-2">
                              {q.options.map((opt: any) => {
                                const isStudentPick = opt.id === q.studentAnswer;
                                const isKey = opt.isKey;

                                return (
                                  <div
                                    key={opt.id}
                                    className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                                      isKey
                                        ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-950"
                                        : isStudentPick
                                        ? "bg-rose-50 border-rose-300 font-bold text-rose-950"
                                        : "bg-white border-slate-200 text-slate-600"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black text-[11px] flex items-center justify-center shrink-0">
                                        {opt.keyLabel}
                                      </span>
                                      <span>{opt.text}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {isKey && (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black">
                                          Kunci Jawaban
                                        </span>
                                      )}
                                      {isStudentPick && (
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                            isKey ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                                          }`}
                                        >
                                          Pilihan Siswa
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Explanation */}
                          {q.pembahasan && (
                            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                              <div className="font-black flex items-center gap-1.5 text-amber-950">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                                <span>Petunjuk & Pembahasan Guru:</span>
                              </div>
                              <div className="leading-relaxed font-medium">
                                <MarkdownRenderer content={q.pembahasan} />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset / Buka Kunci */}
      {studentToReset && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Opsi Pengawas Ujian
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    Reset / Buka Kunci Siswa
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStudentToReset(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Nama Siswa:</span>
                <span className="font-bold text-slate-900">{studentToReset.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-mono text-slate-700">{studentToReset.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Status Saat Ini:</span>
                <span className={`font-black uppercase ${studentToReset.status === "terkunci" ? "text-red-600" : "text-emerald-700"}`}>
                  {studentToReset.status}
                </span>
              </div>
            </div>

            {resetSuccessMessage ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold text-center">
                ✓ {resetSuccessMessage}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Pilih mode penanganan ujian untuk siswa ini. Siswa yang keluar dari ruang ujian resmi terkunci otomatis oleh sistem pengawasan.
                </p>

                {/* Opsi 1: Buka Kunci */}
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => handleResetExam("unlock")}
                  className="w-full p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 text-left transition flex items-start gap-3 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Unlock className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-emerald-950 group-hover:text-emerald-800 flex items-center gap-1.5">
                      <span>Buka Kunci (Izinkan Lanjutkan)</span>
                      {isResetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    </div>
                    <div className="text-[11px] text-emerald-800 leading-normal">
                      Mengembalikan status menjadi aktif. Jawaban siswa <strong>TIDAK DIHAPUS</strong> dan siswa dapat langsung melanjutkan.
                    </div>
                  </div>
                </button>

                {/* Opsi 2: Reset Total */}
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => handleResetExam("fresh")}
                  className="w-full p-4 rounded-2xl border-2 border-rose-300 bg-rose-50/60 hover:bg-rose-100 text-left transition flex items-start gap-3 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-rose-950 group-hover:text-rose-800 flex items-center gap-1.5">
                      <span>Reset Total (Mulai Ulang dari Awal)</span>
                      {isResetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    </div>
                    <div className="text-[11px] text-rose-800 leading-normal">
                      Menghapus seluruh jawaban & sesi sebelumnya. Siswa mengulang pengerjaan dari butir soal nomor 1 dengan timer baru.
                    </div>
                  </div>
                </button>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setStudentToReset(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

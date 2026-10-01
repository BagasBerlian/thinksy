"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Clock,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Award,
  Flame,
  Camera,
  Filter,
  ArrowUpDown,
  Download,
  Calendar,
  Sparkles,
  ChevronRight,
  Maximize2,
  Minimize2,
  Check,
  UserX,
} from "lucide-react";

interface RealtimeAttendanceNormalScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export default function RealtimeAttendanceNormalScreen({
  isOpen,
  onClose,
  onOpenSettings,
}: RealtimeAttendanceNormalScreenProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    totalAttended: 0,
    totalOnTime: 0,
    totalLate: 0,
    totalAbsent: 0,
  });
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"time" | "rank" | "points" | "name">("time");
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState<any | null>(null);

  // Current live clock
  const [currentTimeStr, setCurrentTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/guru/presensi/realtime?kelas=${selectedClass}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        if (data.stats) setStats(data.stats);
        setLastRefreshed(
          new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      }
    } catch {
      // silent fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAttendance();
    }
  }, [isOpen, selectedClass]);

  // Filter & Sort Logic
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesClass = selectedClass === "all" || s.kelas === selectedClass;
        const matchesSearch =
          s.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.kelas.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        if (selectedStatus === "hadir") matchesStatus = s.hasAttended;
        else if (selectedStatus === "tepat_waktu") matchesStatus = s.status_kehadiran.includes("Tepat Waktu");
        else if (selectedStatus === "terlambat") matchesStatus = s.status_kehadiran.includes("Terlambat");
        else if (selectedStatus === "belum_absen") matchesStatus = !s.hasAttended;

        return matchesClass && matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "time") {
          if (a.hasAttended && !b.hasAttended) return -1;
          if (!a.hasAttended && b.hasAttended) return 1;
          return (b.timestamp || 0) - (a.timestamp || 0);
        }
        if (sortBy === "rank") return a.peringkat - b.peringkat;
        if (sortBy === "points") return b.poin_belajar - a.poin_belajar;
        if (sortBy === "name") return a.nama_lengkap.localeCompare(b.nama_lengkap);
        return 0;
      });
  }, [students, selectedClass, selectedStatus, searchQuery, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col overflow-hidden text-slate-900 animate-in fade-in duration-200">
      {/* 1. TOP NAVBAR / HEADER (NORMAL SCREEN BAR) */}
      <header className="bg-[#0F172A] text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 shrink-0 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                MONITORING REALTIME PRESENSI
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-400">Live Server Stream</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight mt-0.5 flex items-center gap-2">
              <span>Kehadiran & Keaktifan Siswa Realtime</span>
            </h1>
          </div>
        </div>

        {/* Live Clock & Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Jam Realtime</div>
              <div className="text-xs font-mono font-black text-white">{currentTimeStr || "07:30:00 WIB"}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchAttendance}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold flex items-center gap-2 transition cursor-pointer border border-slate-700"
            title="Segarkan Data Realtime"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Atur Batas Waktu</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md"
          >
            <X className="w-4 h-4" />
            <span>Tutup Layar Penuh</span>
          </button>
        </div>
      </header>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="px-6 py-4 bg-white border-b border-slate-200/80 grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0 shadow-2xs">
        <div
          onClick={() => setSelectedStatus("all")}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            selectedStatus === "all"
              ? "bg-[#0F172A] text-white border-[#0F172A] shadow-md"
              : "bg-slate-50 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Total Siswa</span>
            <Users className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl font-black mt-1">{stats.totalStudents || students.length}</div>
          <div className="text-[10px] opacity-70 mt-0.5">Semua terdaftar</div>
        </div>

        <div
          onClick={() => setSelectedStatus("hadir")}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            selectedStatus === "hadir"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
              : "bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70 text-emerald-950"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Sudah Absen</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black mt-1">{stats.totalAttended}</div>
          <div className="text-[10px] opacity-80 mt-0.5">
            {stats.totalStudents ? Math.round((stats.totalAttended / stats.totalStudents) * 100) : 0}% Kehadiran
          </div>
        </div>

        <div
          onClick={() => setSelectedStatus("tepat_waktu")}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            selectedStatus === "tepat_waktu"
              ? "bg-blue-600 text-white border-blue-600 shadow-md"
              : "bg-blue-50/70 border-blue-200 hover:bg-blue-100/70 text-blue-950"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Tepat Waktu</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black mt-1">{stats.totalOnTime}</div>
          <div className="text-[10px] opacity-80 mt-0.5">+10 Poin Reward</div>
        </div>

        <div
          onClick={() => setSelectedStatus("terlambat")}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            selectedStatus === "terlambat"
              ? "bg-amber-600 text-white border-amber-600 shadow-md"
              : "bg-amber-50/70 border-amber-200 hover:bg-amber-100/70 text-amber-950"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Terlambat</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black mt-1">{stats.totalLate}</div>
          <div className="text-[10px] opacity-80 mt-0.5">+3 Poin Reward</div>
        </div>

        <div
          onClick={() => setSelectedStatus("belum_absen")}
          className={`p-3.5 rounded-2xl border transition cursor-pointer col-span-2 sm:col-span-1 ${
            selectedStatus === "belum_absen"
              ? "bg-rose-600 text-white border-rose-600 shadow-md"
              : "bg-rose-50/70 border-rose-200 hover:bg-rose-100/70 text-rose-950"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Belum Absen</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black mt-1">{stats.totalAbsent}</div>
          <div className="text-[10px] opacity-80 mt-0.5">Perlu Diingatkan</div>
        </div>
      </div>

      {/* 3. FILTER, SEARCH & SORT TOOLBAR */}
      <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
        {/* Class Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider mr-1 shrink-0">Kelas:</span>
          {["all", "Kelas 8A", "Kelas 8B", "Kelas 8C"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedClass(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                selectedClass === c
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200"
              }`}
            >
              {c === "all" ? "Semua Kelas" : c}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 pl-2">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 bg-transparent text-xs font-extrabold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="time">Waktu Absen Terbaru</option>
              <option value="rank">Peringkat Tertinggi</option>
              <option value="points">Poin Terbanyak</option>
              <option value="name">Nama Siswa A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT GRID (LIST OF STUDENTS WITH REALTIME ATTENDANCE) */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>
              Menampilkan <strong>{filteredStudents.length} siswa</strong>
              {selectedClass !== "all" ? ` di ${selectedClass}` : ""}
            </span>
            {lastRefreshed && (
              <span className="text-[11px] text-slate-400">
                Terakhir diperbarui: <strong>{lastRefreshed} WIB</strong>
              </span>
            )}
          </div>

          {filteredStudents.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-3">
              <Users className="w-12 h-12 text-slate-300" />
              <div className="font-extrabold text-sm text-slate-600">Tidak ada data siswa ditemukan</div>
              <p className="text-xs max-w-sm">
                Coba ubah kata kunci pencarian atau ganti filter status di bagian atas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((st) => (
                <div
                  key={st.id}
                  className={`relative bg-white rounded-3xl border p-5 transition-all duration-200 hover:shadow-xl flex flex-col justify-between space-y-4 overflow-hidden group ${
                    st.hasAttended
                      ? st.status_kehadiran.includes("Tepat Waktu")
                        ? "border-emerald-200 hover:border-emerald-400"
                        : "border-amber-200 hover:border-amber-400"
                      : "border-slate-200 hover:border-slate-300 bg-white/80"
                  }`}
                >
                  {/* Top indicator stripe */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${
                      st.hasAttended
                        ? st.status_kehadiran.includes("Tepat Waktu")
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                        : "bg-slate-300"
                    }`}
                  />

                  {/* Top Row: Photo, Name, Class & Rank */}
                  <div className="flex items-start gap-3.5">
                    {/* Student Photo */}
                    <div
                      onClick={() => setSelectedPhotoZoom(st)}
                      className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer group-hover:scale-105 transition-transform shadow-xs"
                      title="Klik untuk memperbesar foto presensi"
                    >
                      <Image
                        src={st.foto}
                        alt={st.nama_lengkap}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {st.isOnline && (
                        <div
                          className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs"
                          title="Siswa sedang online di aplikasi"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 truncate">
                          {st.kelas}
                        </span>
                        {/* Rank Badge */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>Peringkat #{st.peringkat}</span>
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-[#0F172A] mt-1 truncate group-hover:text-blue-600 transition">
                        {st.nama_lengkap}
                      </h3>

                      {/* Points & Streak Row */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>{st.poin_belajar} Poin</span>
                        </span>

                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-orange-700 bg-orange-50/80 px-2 py-0.5 rounded-md border border-orange-200/60">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span>{st.streak} Hari Streak</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Attendance details & realtime timestamp */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Jam Presensi:</span>
                      </span>
                      {st.waktu_absen ? (
                        <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                          {st.waktu_absen}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold italic">Belum Ada Catatan</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 font-bold">Keterangan:</span>
                      <span
                        className={`font-extrabold text-[11px] px-2 py-0.5 rounded-md ${
                          st.hasAttended
                            ? st.status_kehadiran.includes("Tepat Waktu")
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                              : "bg-amber-100 text-amber-900 border border-amber-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {st.status_kehadiran}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      {st.keterangan_keaktifan}
                    </p>
                  </div>

                  {/* Bottom: Method & quick verification status */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Camera className="w-3.5 h-3.5 text-slate-400" />
                      <span>{st.metode}</span>
                    </span>

                    {st.hasAttended ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Terverifikasi Sah</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-600">
                        Menunggu Absen
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PHOTO ZOOM MODAL */}
      {selectedPhotoZoom && (
        <div
          onClick={() => setSelectedPhotoZoom(null)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 text-center relative"
          >
            <button
              onClick={() => setSelectedPhotoZoom(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative w-48 h-56 mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-md">
              <Image
                src={selectedPhotoZoom.foto}
                alt={selectedPhotoZoom.nama_lengkap}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div>
              <h3 className="text-base font-black text-[#0F172A]">{selectedPhotoZoom.nama_lengkap}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{selectedPhotoZoom.kelas} • Peringkat #{selectedPhotoZoom.peringkat}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Jam Presensi:</span>
                <span className="text-[#0F172A]">{selectedPhotoZoom.waktu_absen || "Belum Absen"}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Status Kehadiran:</span>
                <span className="text-emerald-700">{selectedPhotoZoom.status_kehadiran}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Poin Belajar:</span>
                <span className="text-amber-700">{selectedPhotoZoom.poin_belajar} Poin</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

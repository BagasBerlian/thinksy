"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";
import {
  Download,
  Plus,
  Users,
  UserCheck,
  Building,
  ChevronRight,
  MapPin,
  Phone,
  Globe,
  Edit,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Sparkles,
  Calendar,
  CheckCircle2,
  Shield,
  Loader2,
  X,
  Save,
  AlertCircle,
} from "lucide-react";

interface TeacherItem {
  id: string;
  initials: string;
  name: string;
  status: string;
  statusColor: string;
  statusDot: string;
}

interface SekolahInfo {
  id?: string;
  nama: string;
  npsn: string;
  alamat?: string;
  motto?: string;
  deskripsi?: string;
}

export default function AdminSekolahDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalGuru: 0,
    totalKelas: 0,
    totalPresensiToday: 0,
    teacherList: [] as TeacherItem[],
    sekolah: {
      nama: "SMA Negeri 1 Jakarta",
      npsn: "1010101",
      alamat: "Jl. Budi Utomo No.7, Pasar Baru, Jakarta Pusat",
      motto: "Unggul & Berkarakter AI",
    } as SekolahInfo,
  });

  // Modal edit profil sekolah state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nama: "",
    npsn: "",
    alamat: "",
    motto: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
          setEditForm({
            nama: data.stats.sekolah?.nama || "",
            npsn: data.stats.sekolah?.npsn || "",
            alamat: data.stats.sekolah?.alamat || "",
            motto: data.stats.sekolah?.motto || "",
          });
        }
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleSaveSekolah = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/sekolah", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.error || "Gagal memperbarui profil sekolah.");
        return;
      }

      setShowEditModal(false);
      fetchDashboardStats();
    } catch {
      setSaveError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* 1. HERO HEADER WITH GRADIENT */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-6 sm:p-8 overflow-hidden border border-slate-700/50">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-extrabold">
                  <Shield className="w-3.5 h-3.5" />
                  Admin Sekolah
                </span>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/10 text-slate-300 border border-white/10">
                  NPSN: {stats.sekolah?.npsn || "1010101"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {stats.sekolah?.nama || "SMA Negeri 1 Jakarta"}
              </h1>
              <p className="text-slate-400 text-sm font-medium">
                {stats.sekolah?.motto || "Dashboard Administrasi Akademik Utama"}
              </p>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-extrabold flex items-center gap-2 transition backdrop-blur-sm cursor-pointer"
                >
                  <Edit className="w-4 h-4 text-slate-300" />
                  Edit Profil Sekolah
                </button>
                <Link
                  href="/admin/guru"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Undang Guru
                </Link>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center min-w-[180px] shrink-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Semester
              </div>
              <div className="text-lg font-extrabold text-white flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                Ganjil 2024/25
              </div>
              <div className="inline-flex items-center gap-1 mt-2 text-emerald-400 text-[10px] font-bold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Sistem Terintegrasi
              </div>
            </div>
          </div>
        </div>

        {/* 2. STAT CARDS WITH REALTIME DATA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Real-time
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#0F172A]">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalSiswa}
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                Total Siswa Terdaftar
              </div>
            </div>
          </div>

          <div className="group bg-[#0F172A] p-5 rounded-2xl border border-slate-800 text-white shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                Guru
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-white">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalGuru}
              </div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
                Total Guru Aktif
              </div>
            </div>
          </div>

          <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                Kelas
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#0F172A]">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalKelas}
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                Kelas Terdaftar
              </div>
            </div>
          </div>

          <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                Hari Ini
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#0F172A]">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalPresensiToday}
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                Siswa Absen Hari Ini
              </div>
            </div>
          </div>
        </div>

        {/* 3. MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Daftar Guru Terbaru */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4.5 h-4.5 text-blue-600" />
                  <h2 className="text-sm font-extrabold text-[#0F172A]">
                    Daftar Guru Terdaftar
                  </h2>
                </div>
                <Link
                  href="/admin/guru"
                  className="text-xs font-extrabold text-slate-500 hover:text-[#0F172A] flex items-center gap-1 transition"
                >
                  Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" /> Memuat daftar guru...
                </div>
              ) : stats.teacherList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Belum ada guru yang terdaftar. Gunakan menu Manajemen Guru untuk mengundang guru baru.
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {stats.teacherList.map((t, idx) => (
                    <div
                      key={idx}
                      className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                        {t.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-extrabold text-[#0F172A]">
                          {t.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-400 font-mono">Guru Pengajar</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${t.statusDot}`} />
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${t.statusColor}`}
                        >
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Banner */}
            <div className="relative rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-6 overflow-hidden border border-slate-700/50">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 max-w-md">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Manajemen Terintegrasi
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Sinkronisasi Data Akademik
                  </h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Setiap perubahan kelas dan wali kelas langsung terhubung secara live ke Dashboard Guru dan Dashboard Siswa.
                  </p>
                </div>
                <Link
                  href="/admin/kelas"
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-[#0F172A] text-xs font-extrabold shrink-0 transition shadow-lg cursor-pointer flex items-center gap-2"
                >
                  Kelola Kelas
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profil Sekolah Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="h-24 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] relative flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-white text-[#0F172A] flex items-center justify-center font-extrabold shadow-xl z-10 border-4 border-white">
                  <Building className="w-7 h-7 text-[#0F172A]" />
                </div>
              </div>

              <div className="px-5 pb-5 pt-4 space-y-4">
                <div className="text-center">
                  <h3 className="text-base font-extrabold text-[#0F172A]">
                    {stats.sekolah?.nama || "Sekolah AI MVP"}
                  </h3>
                  <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Terverifikasi System
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-700">Alamat</div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                        {stats.sekolah?.alamat || "Alamat Belum Diatur"}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-700">NPSN</div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {stats.sekolah?.npsn || "1010101"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowEditModal(true)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-500" />
                  Edit Profil Sekolah
                </button>
              </div>
            </div>

            {/* Tips Admin Card */}
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 overflow-hidden">
              <div className="relative space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-xs text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Tips Admin Sekolah
                </div>
                <p className="text-xs text-amber-800/90 font-medium leading-relaxed">
                  Gunakan menu{" "}
                  <Link href="/admin/guru" className="underline font-bold">
                    Manajemen Guru
                  </Link>{" "}
                  untuk mengundang guru baru. Guru yang mendaftar dengan email terundang akan otomatis memperoleh akses Dashboard Guru.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDIT PROFIL SEKOLAH */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-md w-full relative space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#0F172A]">
                Edit Profil Sekolah
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSekolah} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  value={editForm.nama}
                  onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  NPSN
                </label>
                <input
                  type="text"
                  value={editForm.npsn}
                  onChange={(e) => setEditForm({ ...editForm, npsn: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Alamat Lengkap
                </label>
                <textarea
                  rows={2}
                  value={editForm.alamat}
                  onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Motto Sekolah
                </label>
                <input
                  type="text"
                  value={editForm.motto}
                  onChange={(e) => setEditForm({ ...editForm, motto: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white"
                />
              </div>

              {saveError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

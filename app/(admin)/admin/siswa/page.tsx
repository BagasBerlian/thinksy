"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Search,
  GraduationCap,
  AlertTriangle,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  UserCheck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface StudentItem {
  id: string;
  initials: string;
  name: string;
  gender: string;
  email: string;
  nisn: string;
  class: string;
  kelas_id: string | null;
  status: string;
  statusColor: string;
  poin: number;
  streak: number;
}

interface ClassOption {
  id: string;
  name: string;
}

export default function AdminSiswaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("Semua Kelas");

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classesOptions, setClassesOptions] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch student list
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/admin/siswa", window.location.origin);
      if (searchQuery) url.searchParams.set("search", searchQuery);
      if (selectedClassFilter && selectedClassFilter !== "Semua Kelas") {
        url.searchParams.set("kelas_id", selectedClassFilter);
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setStudents(data.siswa || []);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedClassFilter]);

  // Fetch class list for dropdowns
  const fetchClassesOptions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/kelas");
      if (res.ok) {
        const data = await res.json();
        setClassesOptions(data.kelas || []);
      }
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    fetchClassesOptions();
  }, [fetchClassesOptions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  // Update student class assignment
  const handleAssignClass = async (siswaId: string, newKelasId: string) => {
    if (!newKelasId) return;

    setUpdatingStudentId(siswaId);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siswa_id: siswaId,
          kelas_id: newKelasId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Gagal memperbarui kelas siswa.");
        return;
      }

      setSuccessMsg("Kelas siswa berhasil diperbarui.");
      fetchStudents();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setUpdatingStudentId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 1. HEADER TITLE */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Direktori Siswa & Alokasi Kelas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Kelola data peserta didik, alokasi kelas, dan status akademik siswa secara real-time.
          </p>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
            <CheckCircle className="w-5 h-5 shrink-0 text-green-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 2. SEARCH & ACTION BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Nama Siswa..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
              />
            </div>

            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="Semua Kelas">Semua Kelas</option>
              {classesOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. METRIC CARDS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Siswa Aktif */}
          <div className="bg-[#0F172A] p-6 rounded-3xl border border-slate-800 text-white shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                TOTAL SISWA TERDAFTAR
              </div>
              <div className="text-3xl font-extrabold text-white">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : students.length}
              </div>
              <p className="text-[11px] text-amber-400 font-extrabold pt-1">
                ↗ Real-time Database Supabase
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Status Integrasi */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              ALOKASI KELAS AKTIF
            </div>
            <div className="flex items-center justify-between text-xs font-extrabold pt-2">
              <div className="text-center px-2">
                <div className="text-slate-400 text-[10px]">TERALOKASI</div>
                <div className="text-base text-emerald-600 mt-0.5">
                  {students.filter((s) => s.class !== "Belum Ada Kelas").length}
                </div>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="text-center px-2">
                <div className="text-slate-400 text-[10px]">BELUM KELAS</div>
                <div className="text-base text-amber-600 mt-0.5">
                  {students.filter((s) => s.class === "Belum Ada Kelas").length}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Info Sinkronisasi */}
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-200 text-blue-900 shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>SINKRONISASI OTOMATIS</span>
            </div>
            <div>
              <p className="text-[11px] text-blue-800 font-medium mt-0.5 leading-relaxed">
                Setiap pergantian kelas siswa langsung terupdate di jadwal, presensi, dan tugas Dashboard Guru & Siswa.
              </p>
            </div>
          </div>
        </div>

        {/* 4. TABLE CONTAINER */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#0F172A]">
              Daftar Peserta Didik
            </h2>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 transition cursor-pointer">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 transition cursor-pointer">
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-4">NAMA LENGKAP</th>
                  <th className="px-4 py-4">ID SISWA</th>
                  <th className="px-4 py-4">KELAS AKTIF</th>
                  <th className="px-4 py-4">POIN AI</th>
                  <th className="px-4 py-4">STATUS</th>
                  <th className="px-4 py-4 text-right">PINDAH KELAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-500" /> Memuat data siswa...
                      </div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Tidak ada data siswa ditemukan.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0F172A] text-amber-400 flex items-center justify-center font-extrabold text-xs shrink-0">
                          {s.initials}
                        </div>
                        <div>
                          <div className="font-extrabold text-[#0F172A]">{s.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium">Peserta Didik</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-mono text-slate-600 font-medium text-[11px]">{s.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          s.class === "Belum Ada Kelas"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}>
                          {s.class}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-extrabold text-amber-600">{s.poin} Poin</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${s.statusColor}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {updatingStudentId === s.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                          ) : (
                            <select
                              defaultValue={s.kelas_id || ""}
                              onChange={(e) => handleAssignClass(s.id, e.target.value)}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
                            >
                              <option value="" disabled>
                                Pilih Kelas
                              </option>
                              {classesOptions.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
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
      </div>
    </AdminLayout>
  );
}

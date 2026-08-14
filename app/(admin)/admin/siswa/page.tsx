"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Plus,
  Search,
  GraduationCap,
  AlertTriangle,
  Printer,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";

export default function AdminSiswaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("Semua Kelas");

  const students = [
    {
      initials: "AM",
      name: "Ahmad Maulana",
      gender: "Laki-laki",
      email: "ahmad.m@student.sch.id",
      nisn: "0045123987",
      class: "11-A IPA",
      status: "Aktif",
      statusColor: "bg-blue-100 text-blue-800 border-blue-200",
      locked: false,
    },
    {
      initials: "BS",
      name: "Bunga Safira",
      gender: "Perempuan",
      email: "bunga.s@student.sch.id",
      nisn: "0045123988",
      class: "10-A IPA",
      status: "Cuti",
      statusColor: "bg-amber-100 text-amber-900 border-amber-200",
      locked: false,
    },
    {
      initials: "DP",
      name: "Dimas Pratama",
      gender: "Laki-laki",
      email: "dimas.p@student.sch.id",
      nisn: "0039871234",
      class: "12-A IPA (Lulus)",
      status: "Lulus",
      statusColor: "bg-slate-100 text-slate-700 border-slate-200",
      locked: true,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 1. HEADER TITLE */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Direktori Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Kelola data peserta didik, mutasi kelas, dan status akademik dalam satu tampilan komprehensif.
          </p>
        </div>

        {/* 2. SEARCH & ACTION BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari NISN atau Nama..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
              />
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="Semua Kelas">Semua Kelas</option>
              <option value="10-A IPA">10-A IPA</option>
              <option value="11-A IPA">11-A IPA</option>
              <option value="12-A IPA">12-A IPA</option>
            </select>
          </div>

          <button className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-2 shadow-xs transition cursor-pointer shrink-0">
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Tambah Siswa Baru</span>
          </button>
        </div>

        {/* 3. METRIC CARDS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Siswa Aktif (Dark Card) */}
          <div className="bg-[#0F172A] p-6 rounded-3xl border border-slate-800 text-white shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                TOTAL SISWA AKTIF
              </div>
              <div className="text-3xl font-extrabold text-white">842</div>
              <p className="text-[11px] text-amber-400 font-extrabold pt-1">
                ↗ +12 siswa bulan ini
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Distribusi Jurusan */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              DISTRIBUSI JURUSAN
            </div>
            <div className="flex items-center justify-between text-xs font-extrabold pt-2">
              <div className="text-center px-2">
                <div className="text-slate-400 text-[10px]">IPA</div>
                <div className="text-base text-[#0F172A] mt-0.5">420</div>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="text-center px-2">
                <div className="text-slate-400 text-[10px]">IPS</div>
                <div className="text-base text-[#0F172A] mt-0.5">310</div>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="text-center px-2">
                <div className="text-slate-400 text-[10px]">BHS</div>
                <div className="text-base text-[#0F172A] mt-0.5">112</div>
              </div>
            </div>
          </div>

          {/* Card 3: Butuh Perhatian */}
          <div className="bg-red-50 p-6 rounded-3xl border border-red-200 text-red-900 shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-red-700 uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>BUTUH PERHATIAN</span>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-red-900">14</div>
              <p className="text-[11px] text-red-700 font-medium mt-0.5">
                Siswa belum memperbarui dokumen semester ini.
              </p>
            </div>
            <button className="text-xs font-extrabold text-red-700 hover:underline text-left cursor-pointer">
              Tinjau Sekarang →
            </button>
          </div>
        </div>

        {/* 4. TABLE CONTAINER */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
          {/* Table Header Controls */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#0F172A]">
              Daftar Siswa
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
                  <th className="p-4 w-10 text-center">
                    <input type="checkbox" className="rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A]" />
                  </th>
                  <th className="px-4 py-4">NAMA LENGKAP</th>
                  <th className="px-4 py-4">EMAIL / NISN</th>
                  <th className="px-4 py-4">KELAS</th>
                  <th className="px-4 py-4">STATUS</th>
                  <th className="px-4 py-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {students.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 text-center">
                      <input type="checkbox" className="rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A]" />
                    </td>
                    <td className="px-4 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0F172A] text-amber-400 flex items-center justify-center font-extrabold text-xs shrink-0">
                        {s.initials}
                      </div>
                      <div>
                        <div className="font-extrabold text-[#0F172A]">
                          {s.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {s.gender}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-mono text-slate-600 font-medium">{s.email}</div>
                      <div className="font-mono text-slate-400 text-[11px]">{s.nisn}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <select
                          defaultValue={s.class}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
                        >
                          <option value={s.class}>{s.class}</option>
                        </select>
                        {s.locked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${s.statusColor}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Menampilkan 1 hingga 10 dari 842 siswa</span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-3 py-1 rounded-lg bg-[#0F172A] text-white font-extrabold">
                1
              </button>
              <button className="px-3 py-1 rounded-lg hover:bg-slate-200 text-slate-700 font-extrabold cursor-pointer">
                2
              </button>
              <button className="px-3 py-1 rounded-lg hover:bg-slate-200 text-slate-700 font-extrabold cursor-pointer">
                3
              </button>
              <span className="px-1 text-slate-400">...</span>
              <button className="px-3 py-1 rounded-lg hover:bg-slate-200 text-slate-700 font-extrabold cursor-pointer">
                85
              </button>
              <button className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

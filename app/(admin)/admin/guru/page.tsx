"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

export default function AdminGuruPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const teachers = [
    {
      initials: "AR",
      name: "Ahmad Ridwan, S.Pd., M.Si.",
      role: "Guru Matematika",
      email: "ahmad.ridwan@sekolah.sch.id",
      status: "Aktif",
      statusColor: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      initials: "BS",
      name: "Budi Santoso, M.Pd.",
      role: "Guru Bahasa Indonesia",
      email: "budi.santoso@sekolah.sch.id",
      status: "Cuti",
      statusColor: "bg-amber-100 text-amber-900 border-amber-200",
    },
    {
      initials: "CW",
      name: "Citra Wulandari, S.Si.",
      role: "Guru Biologi",
      email: "citra.wulandari@sekolah.sch.id",
      status: "Nonaktif",
      statusColor: "bg-red-100 text-red-800 border-red-200",
    },
    {
      initials: "DW",
      name: "Dina Wijaya, S.E.",
      role: "Guru Ekonomi",
      email: "dina.wijaya@sekolah.sch.id",
      status: "Aktif",
      statusColor: "bg-blue-100 text-blue-800 border-blue-200",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 1. HEADER TITLE & ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Direktori Guru
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Kelola data tenaga pendidik dan status kepegawaian.
            </p>
          </div>

          <button className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-2 shadow-xs transition cursor-pointer shrink-0">
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Tambah Guru</span>
          </button>
        </div>

        {/* 2. TABLE CONTAINER */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 transition cursor-pointer">
                <Filter className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 transition cursor-pointer">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">NAMA LENGKAP</th>
                  <th className="px-6 py-4">EMAIL</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {teachers.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-extrabold text-xs shrink-0">
                        {t.initials}
                      </div>
                      <div>
                        <div className="font-extrabold text-[#0F172A]">
                          {t.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {t.role}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500 font-medium">
                      {t.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${t.statusColor}`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
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
            <span>Menampilkan 1 hingga 4 dari 42 guru</span>
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

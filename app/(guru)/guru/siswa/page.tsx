"use client";

import { useState } from "react";
import GuruLayout from "@/components/guru/GuruLayout";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  ChevronRight,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function GuruDaftarSiswaPage() {
  const [selectedClass, setSelectedClass] = useState("8A");
  const [searchQuery, setSearchQuery] = useState("");

  const students = [
    {
      id: "1",
      name: "Ahmad Raihan",
      nis: "19283746",
      class: "8A",
      attendance: "98%",
      score: 82,
      status: "Aktif",
      needAttention: false,
    },
    {
      id: "2",
      name: "Siti Putri",
      nis: "19283747",
      class: "8A",
      attendance: "95%",
      score: 92,
      status: "Aktif",
      needAttention: false,
    },
    {
      id: "3",
      name: "Budi Pratama",
      nis: "19283748",
      class: "8A",
      attendance: "85%",
      score: 62,
      status: "Perlu Perhatian",
      needAttention: true,
    },
    {
      id: "4",
      name: "Dewi Lestari",
      nis: "19283749",
      class: "8B",
      attendance: "90%",
      score: 75,
      status: "Aktif",
      needAttention: false,
    },
  ];

  const filteredStudents = students.filter(
    (s) =>
      (selectedClass === "Semua" || s.class === selectedClass) &&
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <GuruLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-500" />
              <span>Manajemen Kelas & Data Siswa</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Pantau kemajuan individu, kehadiran, dan aktivitas belajar siswa.
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa atau NIS..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-extrabold text-slate-500">Pilih Kelas:</span>
            {["Semua", "8A", "8B", "8C"].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedClass(c)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  selectedClass === c
                    ? "bg-[#0F172A] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {c === "Semua" ? "Semua Kelas" : `Kelas ${c}`}
              </button>
            ))}
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">NAMA SISWA</th>
                  <th className="px-6 py-4">NIS</th>
                  <th className="px-6 py-4">KELAS</th>
                  <th className="px-6 py-4">KEHADIRAN</th>
                  <th className="px-6 py-4">RATA-RATA SKOR</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-extrabold text-[#0F172A]">
                      {s.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400 font-semibold">
                      {s.nis}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      Kelas {s.class}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-[#0F172A]">
                      {s.attendance}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#0F172A]">
                          {s.score}%
                        </span>
                        <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.score >= 75 ? "bg-[#0F172A]" : "bg-red-500"
                            }`}
                            style={{ width: `${s.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {s.needAttention ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-extrabold">
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                          <span>Perlu Perhatian</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Aktif</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/guru/siswa/${s.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-[11px] transition shadow-xs cursor-pointer"
                      >
                        <span>Detail Progress</span>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </GuruLayout>
  );
}

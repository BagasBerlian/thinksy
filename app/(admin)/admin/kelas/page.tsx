"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import {
  Plus,
  BookOpen,
  Users,
  ChevronRight,
  UserCheck,
} from "lucide-react";

import { useState } from "react";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";

export default function AdminKelasPage() {
  const { broadcastEvent } = useRealtimeDashboard();
  const [classes, setClasses] = useState([
    {
      id: "7a",
      name: "Kelas 7A",
      academicYear: "2024/2025",
      homeroomTeacher: "Ibu Siti Aminah, S.Pd",
      initials: "SA",
      studentsCount: 32,
    },
    {
      id: "7b",
      name: "Kelas 7B",
      academicYear: "2024/2025",
      homeroomTeacher: "Bapak Budi Santoso, M.Pd",
      initials: "BS",
      studentsCount: 30,
    },
    {
      id: "8a",
      name: "Kelas 8A",
      academicYear: "2024/2025",
      homeroomTeacher: "Ibu Rini Wati, S.Si",
      initials: "RW",
      studentsCount: 34,
    },
  ]);

  const handleAddClass = () => {
    const newClassName = `Kelas 8B`;
    setClasses((prev) => [
      ...prev,
      {
        id: "8b",
        name: newClassName,
        academicYear: "2024/2025",
        homeroomTeacher: "Bapak Andi Wijaya, S.Pd",
        initials: "AW",
        studentsCount: 30,
      },
    ]);
    broadcastEvent("CLASS_CREATED", { nama_kelas: newClassName });
  };


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 1. HEADER TITLE & ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-amber-500" />
              <span>Manajemen Kelas</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
              Kelola daftar kelas, tahun ajaran, dan penugasan wali kelas untuk tahun akademik berjalan.
            </p>
          </div>

          <button
            onClick={handleAddClass}
            className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-2 shadow-xs transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Buat Kelas Baru</span>
          </button>
        </div>

        {/* 2. CLASS CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6 hover:border-[#0F172A] hover:shadow-md transition group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-[#0F172A]">
                    {cls.name}
                  </h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {cls.academicYear}
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-9 h-9 rounded-full bg-[#0F172A] text-amber-400 flex items-center justify-center font-extrabold text-xs shrink-0">
                    {cls.initials}
                  </div>
                  <div>
                    <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                      WALI KELAS
                    </div>
                    <div className="text-xs font-extrabold text-[#0F172A] line-clamp-1">
                      {cls.homeroomTeacher}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>{cls.studentsCount} Siswa</span>
                  </div>

                  {/* Stacked Avatar Circles */}
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white" />
                    <div className="w-6 h-6 rounded-full bg-slate-400 border-2 border-white" />
                    <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white border-2 border-white text-[8px] font-bold flex items-center justify-center">
                      +{cls.studentsCount - 2}
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-extrabold transition cursor-pointer">
                Lihat Detail
              </button>
            </div>
          ))}

          {/* Tambah Kelas Baru Card */}
          <div
            onClick={handleAddClass}
            className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3 hover:border-[#0F172A] transition cursor-pointer group min-h-[260px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center group-hover:scale-110 transition shadow-xs">
              <Plus className="w-6 h-6 text-[#0F172A]" />
            </div>
            <h3 className="text-sm font-extrabold text-[#0F172A]">
              Tambah Kelas Baru
            </h3>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

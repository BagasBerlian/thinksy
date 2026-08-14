import GuruLayout from "@/components/guru/GuruLayout";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  AlertTriangle,
  Bot,
  FileCheck,
  Plus,
  ArrowRight,
  Clock,
  ChevronRight,
  BookOpen,
} from "lucide-react";

export default function GuruDashboardPage() {
  const userProfile = {
    nama_lengkap: "Ibu Siti Rahmawati",
    email: "siti.rahmawati@sekolah.sch.id",
    peran: "guru",
  };

  const activeClasses = [
    {
      id: "8a",
      name: "8A",
      title: "Matematika 8–A",
      chapter: "Bab 4: Persamaan Linear Dua Variabel",
      studentsCount: 32,
      progress: 72,
    },
    {
      id: "8b",
      name: "8B",
      title: "Matematika 8–B",
      chapter: "Bab 4: Persamaan Linear Dua Variabel",
      studentsCount: 30,
      progress: 65,
    },
    {
      id: "8c",
      name: "8C",
      title: "Matematika 8–C",
      chapter: "Bab 3: Relasi dan Fungsi",
      studentsCount: 31,
      progress: 88,
    },
  ];

  return (
    <GuruLayout userProfile={userProfile}>
      <div className="space-y-8">
        {/* 1. WELCOME HEADER BANNER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Selamat Datang Kembali, Ibu Siti
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              Senin, 14 Agustus 2023 • Semester Ganjil 2023/2024
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[#0F172A] text-xs font-bold w-fit">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>08:30 WIB – Sesi Aktif</span>
          </div>
        </div>

        {/* 2. TOP METRIC STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Stat 1: Rata-rata Skor Kelas */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Rata-rata Skor Kelas
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[#0F172A]">78%</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +2.4%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium pt-1">
                Dibandingkan bulan lalu
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Stat 2: Total Siswa */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Total Siswa
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#0F172A]">124</span>
                <span className="text-xs text-slate-500 font-bold">Siswa</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium pt-1">
                Terbagi dalam 4 kelas aktif
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Stat 3: Perlu Perhatian */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Perlu Perhatian
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-red-600">5</span>
                <span className="text-xs text-red-600 font-bold">Siswa</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium pt-1">
                Skor rata-rata di bawah 65%
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 3. AI TASK QUEUE BANNER */}
        <div className="rounded-3xl bg-[#0F172A] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-extrabold border border-slate-700">
              <Bot className="w-4 h-4" />
              <span>AI Task Queue</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Antrean Tugas Menunggu
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Ada 12 set soal baru dari AI dan 45 esai siswa yang perlu ditinjau sebelum sesi belajar besok dimulai.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/guru/soal/eksplorasi"
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#0F172A] text-xs font-extrabold flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Review Soal AI</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-[#0F172A] text-amber-400 text-[10px] font-extrabold">
                12
              </span>
            </Link>

            <Link
              href="/guru/penilaian"
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold flex items-center gap-2 border border-slate-700 shadow-xs transition cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Penilaian Esai</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 text-[10px] font-extrabold">
                45
              </span>
            </Link>
          </div>
        </div>

        {/* 4. ACTIVE CLASS LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[#0F172A]">
                Daftar Kelas Aktif
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Mata Pelajaran: Matematika Kelas 8
              </p>
            </div>
            <Link
              href="/guru/siswa"
              className="text-xs font-extrabold text-[#0F172A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {activeClasses.map((cls) => (
              <Link
                key={cls.id}
                href="/guru/siswa"
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-[#0F172A] hover:shadow-md transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-[#0F172A]">
                      {cls.name}
                    </span>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full">
                      <Users className="w-3 h-3 text-slate-400" /> {cls.studentsCount}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-[#0F172A] group-hover:text-blue-600 transition">
                      {cls.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">
                      {cls.chapter}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-slate-400">Rata-rata Penyelesaian</span>
                    <span className="text-[#0F172A]">{cls.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#0F172A] rounded-full transition-all duration-500"
                      style={{ width: `${cls.progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}

            {/* Tambah Kelas Baru Card */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-5 flex flex-col items-center justify-center text-center space-y-2 hover:border-[#0F172A] transition cursor-pointer group min-h-[190px]">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center group-hover:scale-110 transition">
                <Plus className="w-5 h-5 text-[#0F172A]" />
              </div>
              <h3 className="text-xs font-extrabold text-[#0F172A]">
                Tambah Kelas Baru
              </h3>
              <p className="text-[11px] text-slate-400 font-medium max-w-[160px]">
                Buat kelas atau import dari data sekolah
              </p>
            </div>
          </div>
        </div>
      </div>
    </GuruLayout>
  );
}

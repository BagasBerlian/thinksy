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
  Sparkles,
  BarChart3,
  GraduationCap,
  Target,
  Zap,
  Calendar,
  CheckCircle2,
  Activity,
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
      avgScore: 81,
      color: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      id: "8b",
      name: "8B",
      title: "Matematika 8–B",
      chapter: "Bab 4: Persamaan Linear Dua Variabel",
      studentsCount: 30,
      progress: 65,
      avgScore: 74,
      color: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
    },
    {
      id: "8c",
      name: "8C",
      title: "Matematika 8–C",
      chapter: "Bab 3: Relasi dan Fungsi",
      studentsCount: 31,
      progress: 88,
      avgScore: 85,
      color: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Esai dinilai",
      detail: "Rina Kartika — Kelas 8A",
      time: "10 menit lalu",
      icon: FileCheck,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50",
    },
    {
      id: 2,
      action: "Soal AI diterbitkan",
      detail: "Bab 4: SPLDV — 15 soal",
      time: "1 jam lalu",
      icon: Bot,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
    },
    {
      id: 3,
      action: "Presensi diverifikasi",
      detail: "Kelas 8C — 31/31 hadir",
      time: "2 jam lalu",
      icon: CheckCircle2,
      iconColor: "text-violet-500",
      iconBg: "bg-violet-50",
    },
    {
      id: 4,
      action: "Kuis dikirim ke siswa",
      detail: "Bab 3: Relasi & Fungsi",
      time: "3 jam lalu",
      icon: Target,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-50",
    },
  ];

  return (
    <GuruLayout userProfile={userProfile}>
      <div className="space-y-8">
        {/* 1. WELCOME HERO BANNER */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-6 sm:p-8 overflow-hidden border border-slate-700/50">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Panel Guru
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <Activity className="w-3.5 h-3.5" />
                  Semester Ganjil 2024/2025
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Selamat Datang, Ibu Siti 👋
              </h1>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Ada <span className="text-amber-400 font-bold">12 soal AI</span> dan <span className="text-blue-400 font-bold">45 esai siswa</span> yang menunggu ditinjau hari ini.
              </p>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/guru/soal/eksplorasi"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
                >
                  <Bot className="w-4 h-4" />
                  Review Soal AI
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-950/20 text-[10px]">12</span>
                </Link>
                <Link
                  href="/guru/penilaian"
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold flex items-center gap-2 border border-white/10 backdrop-blur-sm transition"
                >
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Penilaian Esai
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px]">45</span>
                </Link>
              </div>
            </div>

            {/* Right side: Time & Date widget */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center min-w-[180px]">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Hari Ini
                </div>
                <div className="flex items-center justify-center gap-2 text-white">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <span className="text-lg font-extrabold">Senin, 14 Agt</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-emerald-400 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>08:30 WIB — Sesi Aktif</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. STAT CARDS WITH MICRO-ANIMATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Stat 1: Rata-rata Skor */}
          <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +2.4%
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#0F172A]">78%</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Rata-rata Skor Kelas</div>
            </div>
          </div>

          {/* Stat 2: Total Siswa */}
          <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">4 Kelas</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#0F172A]">124</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Total Siswa Aktif</div>
            </div>
          </div>

          {/* Stat 3: Soal Dibuat */}
          <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">Bulan ini</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#0F172A]">48</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Soal Dibuat & Diterbitkan</div>
            </div>
          </div>

          {/* Stat 4: Perlu Perhatian */}
          <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Skor &lt;65%</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-red-600">5</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Siswa Perlu Perhatian</div>
            </div>
          </div>
        </div>

        {/* 3. MAIN CONTENT: CLASSES + ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active Classes (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#0F172A] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  Kelas Aktif Saya
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Mata Pelajaran: Matematika Kelas 8
                </p>
              </div>
              <Link
                href="/guru/siswa"
                className="text-xs font-extrabold text-[#0F172A] hover:text-blue-600 flex items-center gap-1 transition"
              >
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeClasses.map((cls) => (
                <Link
                  key={cls.id}
                  href="/guru/siswa"
                  className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300"
                >
                  {/* Top gradient bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${cls.color}`} />

                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cls.color} flex items-center justify-center text-white font-extrabold text-sm shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                          {cls.name}
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-[#0F172A] group-hover:text-blue-600 transition">
                            {cls.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5 line-clamp-1">
                            {cls.chapter}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mini Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <div className="text-lg font-extrabold text-[#0F172A]">{cls.studentsCount}</div>
                        <div className="text-[10px] text-slate-400 font-bold">Siswa</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <div className="text-lg font-extrabold text-[#0F172A]">{cls.avgScore}%</div>
                        <div className="text-[10px] text-slate-400 font-bold">Rata-rata</div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-400">Penyelesaian Materi</span>
                        <span className="text-[#0F172A]">{cls.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${cls.color} transition-all duration-700`}
                          style={{ width: `${cls.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Add New Class Card */}
            <div className="bg-slate-50/50 border-2 border-dashed border-slate-300 rounded-2xl p-6 flex items-center justify-center text-center hover:border-[#0F172A] hover:bg-slate-50 transition cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-extrabold text-[#0F172A]">Tambah Kelas Baru</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Import dari data sekolah atau buat manual</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Activity Feed (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Activity Feed */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Aktivitas Terkini
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Real-time
                </span>
              </div>

              <div className="divide-y divide-slate-50">
                {recentActivity.map((act) => {
                  const IconComp = act.icon;
                  return (
                    <div
                      key={act.id}
                      className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50/50 transition"
                    >
                      <div className={`w-8 h-8 rounded-lg ${act.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <IconComp className={`w-4 h-4 ${act.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#0F172A]">{act.action}</p>
                        <p className="text-[11px] text-slate-500 font-medium truncate">{act.detail}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap shrink-0">{act.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Link: Buat Soal */}
            <Link
              href="/buat-soal"
              className="group block bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl p-5 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 shadow-sm hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Bot className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Buat Soal dengan AI</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Powered by Gemini AI</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold">Generate soal otomatis berdasarkan BAB</span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Quick Link: Jadwal */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-500" />
                Jadwal Hari Ini
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="text-center leading-none shrink-0">
                    <div className="text-xs font-extrabold text-blue-700">08:00</div>
                    <div className="text-[10px] text-blue-400 font-medium">WIB</div>
                  </div>
                  <div className="h-8 w-0.5 bg-blue-200 rounded-full shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-blue-800">Matematika 8–A</div>
                    <div className="text-[10px] text-blue-500 font-medium">Ruang 204</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="text-center leading-none shrink-0">
                    <div className="text-xs font-extrabold text-emerald-700">10:00</div>
                    <div className="text-[10px] text-emerald-400 font-medium">WIB</div>
                  </div>
                  <div className="h-8 w-0.5 bg-emerald-200 rounded-full shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-800">Matematika 8–B</div>
                    <div className="text-[10px] text-emerald-500 font-medium">Ruang 301</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="text-center leading-none shrink-0">
                    <div className="text-xs font-extrabold text-amber-700">13:00</div>
                    <div className="text-[10px] text-amber-400 font-medium">WIB</div>
                  </div>
                  <div className="h-8 w-0.5 bg-amber-200 rounded-full shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-amber-800">Matematika 8–C</div>
                    <div className="text-[10px] text-amber-500 font-medium">Ruang 105</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GuruLayout>
  );
}

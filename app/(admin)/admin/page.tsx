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
  GraduationCap,
  BookOpen,
  BarChart3,
  Sparkles,
  Activity,
  Calendar,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function AdminSekolahDashboardPage() {
  const teacherList = [
    {
      initials: "BW",
      name: "Budi Santoso, M.Pd.",
      nip: "198005122005011003",
      subject: "Matematika",
      status: "Aktif",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      statusDot: "bg-emerald-500",
    },
    {
      initials: "SD",
      name: "Siti Aminah, S.Si.",
      nip: "198511232010122001",
      subject: "Biologi",
      status: "Aktif",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      statusDot: "bg-emerald-500",
    },
    {
      initials: "AW",
      name: "Andi Wijaya, S.Pd.",
      nip: "199002152015031005",
      subject: "Fisika",
      status: "Cuti",
      statusColor: "bg-amber-50 text-amber-800 border-amber-200",
      statusDot: "bg-amber-500",
    },
    {
      initials: "RH",
      name: "Rina Haryanti, M.A.",
      nip: "198207082008012004",
      subject: "Bahasa Inggris",
      status: "Aktif",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      statusDot: "bg-emerald-500",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* 1. HERO HEADER WITH GRADIENT */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-6 sm:p-8 overflow-hidden border border-slate-700/50">
          {/* Decorative blobs */}
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
                  ID: 1010101
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                SMA Negeri 1 Jakarta
              </h1>
              <p className="text-slate-400 text-sm font-medium">
                Dashboard Administrasi Akademik Utama
              </p>

              <div className="flex items-center gap-3 pt-1">
                <button className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-extrabold flex items-center gap-2 transition backdrop-blur-sm cursor-pointer">
                  <Download className="w-4 h-4 text-slate-300" />
                  Laporan
                </button>
                <button className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer">
                  <Plus className="w-4 h-4" />
                  Tambah Data
                </button>
              </div>
            </div>

            {/* Right side: Quick date info */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center min-w-[180px] shrink-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Semester</div>
              <div className="text-lg font-extrabold text-white flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                Ganjil 2024/25
              </div>
              <div className="inline-flex items-center gap-1 mt-2 text-emerald-400 text-[10px] font-bold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Akreditasi A (Unggul)
              </div>
            </div>
          </div>
        </div>

        {/* 2. STAT CARDS WITH HOVER ANIMATIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12%
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#0F172A]">1,240</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Total Siswa Aktif</div>
            </div>
          </div>

          <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Stabil</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#0F172A]">85</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Total Guru Aktif</div>
            </div>
          </div>

          <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">95%</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#0F172A]">32</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Kelas Aktif</div>
            </div>
          </div>

          <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +5%
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#0F172A]">82%</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Rata-rata Kelulusan</div>
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
                    Daftar Guru Terbaru
                  </h2>
                </div>
                <Link
                  href="/admin/guru"
                  className="text-xs font-extrabold text-slate-500 hover:text-[#0F172A] flex items-center gap-1 transition"
                >
                  Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-50">
                {teacherList.map((t, idx) => (
                  <div key={idx} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                      {t.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-extrabold text-[#0F172A]">{t.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400 font-mono">{t.nip}</span>
                        <span className="text-slate-200">·</span>
                        <span className="text-[11px] text-slate-500 font-bold">{t.subject}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${t.statusDot}`} />
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${t.statusColor}`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Banner: Tahun Ajaran Baru */}
            <div className="relative rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-6 overflow-hidden border border-slate-700/50">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 max-w-md">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Persiapan Baru
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Tahun Ajaran Baru 2024/2025
                  </h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Persiapkan data akademik sebelum periode pendaftaran siswa baru dimulai.
                  </p>
                </div>
                <button className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-[#0F172A] text-xs font-extrabold shrink-0 transition shadow-lg cursor-pointer flex items-center gap-2">
                  Mulai Persiapan
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profil Sekolah Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Header gradient */}
              <div className="h-24 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50" />
                <div className="w-14 h-14 rounded-2xl bg-white text-[#0F172A] flex items-center justify-center font-extrabold shadow-xl z-10 border-4 border-white">
                  <Building className="w-7 h-7 text-[#0F172A]" />
                </div>
              </div>

              <div className="px-5 pb-5 pt-4 space-y-4">
                <div className="text-center">
                  <h3 className="text-base font-extrabold text-[#0F172A]">Profil Sekolah</h3>
                  <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Akreditasi A (Unggul)
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-700">Alamat</div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                        Jl. Budi Utomo No.7, Pasar Baru, Jakarta Pusat, 10710
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-700">Kontak</div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">+62 21 345678</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-700">Website</div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">www.sman1jkt.sch.id</p>
                    </div>
                  </div>
                </div>

                <button className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer">
                  <Edit className="w-3.5 h-3.5 text-slate-500" />
                  Edit Profil Sekolah
                </button>
              </div>
            </div>

            {/* Tips Admin Card */}
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/30 rounded-full blur-2xl" />
              <div className="relative space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-xs text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Tips Admin
                </div>
                <p className="text-xs text-amber-800/90 font-medium leading-relaxed">
                  Pastikan NIP guru terisi dengan benar untuk sinkronisasi dengan Dapodik pusat. Gunakan menu{" "}
                  <Link href="/admin/guru" className="underline font-bold">
                    Manajemen Guru
                  </Link>{" "}
                  untuk mengundang guru baru.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

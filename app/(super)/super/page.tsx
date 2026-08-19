import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "../../(auth)/actions";
import {
  BrainCircuit,
  ShieldCheck,
  Building,
  UserCog,
  DollarSign,
  LogOut,
  Bell,
  Search,
  Plus,
  Sparkles,
  FolderOpen,
  LayoutDashboard,
  Layers,
  ArrowRight,
  Activity,
  Globe,
  Shield,
  Zap,
  Server,
  Database,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

export default async function SuperAdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let superName = "Super Admin";
  let superEmail = user?.email || "super@thinksy.ai";

  if (user) {
    const { data: profil } = await supabase
      .from("profil")
      .select("nama_lengkap")
      .eq("id", user.id)
      .single();
    if (profil?.nama_lengkap) {
      superName = profil.nama_lengkap;
    }
  }

  const initials = superName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white font-sans flex flex-col">
      {/* 1. TOP HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800/80 shadow-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/super" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-lg shadow-amber-500/20 group-hover:scale-105 transition duration-200">
                <BrainCircuit className="w-5.5 h-5.5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                THINKSY{" "}
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider ml-1 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  Super Admin
                </span>
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5" />
            <input
              type="text"
              placeholder="Cari tenant sekolah, admin, atau log..."
              className="pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 w-80 transition backdrop-blur-sm"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button className="relative p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition cursor-pointer backdrop-blur-sm">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[#0F172A] animate-pulse" />
            </button>

            <div className="flex items-center space-x-2 bg-slate-800/50 border border-slate-700/50 p-1.5 pr-3 rounded-xl backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
                {initials || "SA"}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-extrabold text-white truncate max-w-[120px]">
                  {superName}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold truncate max-w-[120px]">
                  {superEmail}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT */}
      <div className="flex-1 flex mx-auto w-full max-w-7xl">
        {/* LEFT SIDEBAR */}
        <aside className="w-64 border-r border-slate-800/60 bg-[#0F172A]/60 p-5 flex flex-col justify-between hidden md:flex shrink-0 backdrop-blur-sm">
          <nav className="space-y-1.5">
            <Link
              href="/super"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Global Overview</span>
              </div>
            </Link>

            <Link
              href="/super/sekolah"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-slate-400 hover:bg-slate-800/50 hover:text-white transition"
            >
              <Building className="w-4 h-4" />
              <span>Tenant / Sekolah</span>
            </Link>

            <Link
              href="/super/admin-sekolah"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-slate-400 hover:bg-slate-800/50 hover:text-white transition"
            >
              <UserCog className="w-4 h-4" />
              <span>Admin Sekolah</span>
            </Link>
          </nav>

          <form action={logoutAction} className="pt-6 border-t border-slate-800/60">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 text-xs font-extrabold text-red-400 bg-red-500/10 hover:bg-red-500/20 py-2.5 px-4 rounded-xl border border-red-500/20 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Akun</span>
            </button>
          </form>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
          {/* WELCOME BANNER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Dashboard Super Admin
              </h1>
              <p className="text-sm text-slate-400 font-medium mt-1">
                Kontrol utama infrastruktur platform dan alokasi sumber daya.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4" />
              <span>Privileged Access</span>
            </div>
          </div>

          {/* STAT WIDGETS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="group bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5 hover:border-blue-500/30 transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Building className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded-full">Tenant</span>
              </div>
              <span className="text-3xl font-extrabold text-white">0</span>
              <div className="text-[11px] text-slate-400 font-semibold mt-1">Total Tenant Sekolah</div>
            </div>

            <div className="group bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5 hover:border-amber-500/30 transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UserCog className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded-full">Akun</span>
              </div>
              <span className="text-3xl font-extrabold text-white">0</span>
              <div className="text-[11px] text-slate-400 font-semibold mt-1">Total Admin Sekolah</div>
            </div>

            <div className="group bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5 hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded-full">API</span>
              </div>
              <span className="text-3xl font-extrabold text-emerald-400">$0.00</span>
              <div className="text-[11px] text-slate-400 font-semibold mt-1">AI Usage Cost</div>
            </div>
          </div>

          {/* HERO CONTROL CONTAINER */}
          <section className="relative bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-800/60 rounded-2xl p-6 sm:p-8 border border-slate-700/50 overflow-hidden backdrop-blur-sm">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

            <div className="relative space-y-5">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Control Panel
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Pusat Kontrol Infrastruktur
                </h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xl">
                  Sistem THINKSY siap beroperasi. Daftarkan tenant sekolah baru atau kelola akun Admin Sekolah untuk memantau performa platform.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/super/sekolah"
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Registrasi Tenant Sekolah
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/super/admin-sekolah"
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 backdrop-blur-sm"
                >
                  <UserCog className="w-4 h-4 text-amber-400" />
                  Kelola Admin Sekolah
                </Link>
              </div>
            </div>
          </section>

          {/* SYSTEM STATUS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/30 rounded-2xl border border-slate-700/40 p-5 flex items-center gap-4 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Server className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  Server Status
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-[11px] text-emerald-400 font-bold mt-0.5">Operational</div>
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-2xl border border-slate-700/40 p-5 flex items-center gap-4 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  Database
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-[11px] text-blue-400 font-bold mt-0.5">Supabase PostgreSQL</div>
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-2xl border border-slate-700/40 p-5 flex items-center gap-4 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  AI Engine
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-[11px] text-violet-400 font-bold mt-0.5">Gemini API Active</div>
              </div>
            </div>
          </div>

          {/* EMPTY STATE DATA SECTION */}
          <section className="bg-slate-800/20 rounded-2xl border border-slate-700/40 p-10 text-center space-y-5 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-slate-500 flex items-center justify-center mx-auto">
              <FolderOpen className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="text-base font-extrabold text-white">
                Belum Ada Tenant Sekolah
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Belum ada tenant sekolah atau akun admin sekolah terdaftar. Gunakan tombol di atas untuk mendaftarkan tenant pertama.
              </p>
            </div>
            <Link
              href="/super/sekolah"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              Mulai Registrasi
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
}

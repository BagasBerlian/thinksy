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
      <header className="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/super" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center font-bold text-amber-400 shadow-xs border border-amber-500/30 group-hover:scale-105 transition duration-200">
                <BrainCircuit className="w-5.5 h-5.5 text-amber-400" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                THINKSY{" "}
                <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider ml-1 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
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
              className="pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 w-80 transition"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer">
              <Bell className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1.5 pr-3 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs">
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
        <aside className="w-64 border-r border-slate-800/80 bg-[#0F172A]/80 p-5 flex flex-col justify-between hidden md:flex shrink-0">
          <nav className="space-y-1.5">
            <Link
              href="/super"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 text-slate-950 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-slate-950" />
                <span>Global Overview</span>
              </div>
            </Link>

            <Link
              href="/super/sekolah"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <Building className="w-4 h-4 text-slate-400" />
              <span>Tenant / Sekolah</span>
            </Link>

            <Link
              href="/super/admin-sekolah"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <UserCog className="w-4 h-4 text-slate-400" />
              <span>Admin Sekolah</span>
            </Link>
          </nav>

          <form action={logoutAction} className="pt-6 border-t border-slate-800">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 text-xs font-extrabold text-red-400 bg-red-950/30 hover:bg-red-950/60 py-2.5 px-4 rounded-xl border border-red-900/40 transition cursor-pointer"
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
                Dashboard Super Admin System
              </h1>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Kontrol utama infrastruktur platform, pendaftaran tenant sekolah, dan alokasi sumber daya.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-extrabold self-start sm:self-auto">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Super Admin Privileged Access</span>
            </div>
          </div>

          {/* STAT WIDGETS (CLEAN EMPTY SLATE) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xs space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Total Tenant Sekolah
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white">0</span>
                <span className="text-xs text-slate-500 font-semibold">Sekolah</span>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xs space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Total Admin Sekolah
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white">0</span>
                <span className="text-xs text-slate-500 font-semibold">Akun</span>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xs space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                AI Usage Cost
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-amber-400">$0.00</span>
                <span className="text-xs text-slate-500 font-semibold">Anthropic API</span>
              </div>
            </div>
          </div>

          {/* HERO CONTROL CONTAINER */}
          <section className="bg-gradient-to-r from-[#0F172A] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800 space-y-4">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Super Admin Control Panel</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Pusat Kontrol Infrastruktur System
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Sistem Super Admin THINKSY siap beroperasi. Silakan daftarkan tenant sekolah baru atau kelola akun Admin Sekolah untuk memantau performa sistem secara lintas platform.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/super/sekolah"
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrasi Tenant Sekolah Baru</span>
              </Link>
              <Link
                href="/super/admin-sekolah"
                className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Admin Sekolah</span>
              </Link>
            </div>
          </section>

          {/* EMPTY STATE DATA SECTION */}
          <section className="bg-slate-900/60 rounded-3xl border border-slate-800 p-8 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center mx-auto">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-extrabold text-white">
                Belum Ada Tenant Sekolah Terdaftar
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Belum ada tenant sekolah atau akun admin sekolah yang terdaftar dalam sistem. Gunakan tombol di atas untuk mendaftarkan tenant sekolah pertama.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

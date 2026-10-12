"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BrainCircuit,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Users,
  FileText,
  Bot,
  CheckSquare,
  X,
  Shield,
  HelpCircle,
  ChevronDown,
  Wifi,
  Save,
  CheckCircle2,
  Key,
  Sliders,
  Menu,
  GraduationCap,
  Clock,
  Palette,
  Coins,
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import FloatingGuruSpeedDial from "@/components/guru/FloatingGuruSpeedDial";

export type GuruNavView = "beranda" | "manajemen_siswa" | "manajemen_kelas" | "pengelolaan" | "pengaturan";

interface GuruLayoutProps {
  children: React.ReactNode;
  userProfile?: {
    nama_lengkap: string;
    email: string;
    peran: string;
  };
  activeView?: GuruNavView;
  onViewChange?: (view: GuruNavView) => void;
}

export default function GuruLayout({
  children,
  userProfile,
  activeView,
  onViewChange,
}: GuruLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    siswa: any[];
    materi: any[];
    soal: any[];
    total: number;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search to Supabase
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults(null);
      setIsSearchDropdownOpen(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/guru/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setIsSearchDropdownOpen(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Click outside search container to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Settings Modal Form State
  const [settingsNama, setSettingsNama] = useState(userProfile?.nama_lengkap || "Ibu Siti Rahmawati, M.Pd.");
  const [settingsEmail, setSettingsEmail] = useState(userProfile?.email || "siti.rahmawati@sekolah.sch.id");
  const [settingsMapel, setSettingsMapel] = useState("Matematika SMP Kelas 8");
  const [settingsNip, setSettingsNip] = useState("198511232010122001");
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<"profil" | "ai" | "notif" | "keamanan">("profil");

  useEffect(() => {
    async function fetchLoggedUser() {
      if (!userProfile) {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profil } = await supabase
              .from("profil")
              .select("nama_lengkap, email, peran")
              .eq("id", user.id)
              .single();
            if (profil) {
              setSettingsNama(profil.nama_lengkap || user.email?.split("@")[0] || "Pengajar");
              setSettingsEmail(profil.email || user.email || "");
            }
          }
        } catch {
          // ignore
        }
      }
    }
    fetchLoggedUser();
  }, [userProfile]);

  const teacherName = settingsNama;
  const teacherRole = userProfile?.peran === "superadmin" ? "Administrator" : "Guru Matematika";

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Esai Baru Memerlukan Penilaian",
      desc: "5 esai dari Kelas 8 telah dikirim dan menunggu validasi Anda.",
      time: "5 menit yang lalu",
    },
    {
      id: 2,
      title: "Draft Soal Siap Ditinjau",
      desc: "Bank evaluasi telah menghasilkan 12 set soal Eksplorasi Aljabar Baru.",
      time: "25 menit yang lalu",
    },
    {
      id: 3,
      title: "Laporan Kehadiran Kelas 8",
      desc: "Presensi 15 siswa Kelas 8 telah diverifikasi otomatis.",
      time: "2 jam yang lalu",
    },
  ]);

  // Real-time listener across dashboards
  const { isConnected } = useRealtimeDashboard((event) => {
    if (event.type === "NEW_ESSAY_SUBMISSION") {
      setNotifications((prev) => [
        {
          id: Date.now(),
          title: "Siswa Mengirimkan Jawaban Esai",
          desc: "Jawaban esai baru telah masuk ke antrean penilaian Anda.",
          time: "Baru saja",
        },
        ...prev,
      ]);
    } else if (event.type === "ATTENDANCE_CHECKIN") {
      setNotifications((prev) => [
        {
          id: Date.now(),
          title: "Presensi Selfie Siswa Berhasil",
          desc: `${event.payload?.studentName || "Siswa"} telah mengirimkan presensi selfie pada pukul ${event.payload?.time || "sekarang"}.`,
          time: "Baru saja",
        },
        ...prev,
      ]);
    } else if (event.type === "ATTENDANCE_VERIFIED") {
      setNotifications((prev) => [
        {
          id: Date.now(),
          title: "Absensi Kelas Terverifikasi",
          desc: "Status presensi kehadiran siswa telah diverifikasi resmi.",
          time: "Baru saja",
        },
        ...prev,
      ]);
    } else if (event.type === "NOTIFICATION_RECEIVED") {
      if (event.payload?.judul) {
        setNotifications((prev) => [
          {
            id: Date.now(),
            title: event.payload.judul,
            desc: event.payload.pesan || "Notifikasi sistem baru diterima.",
            time: "Baru saja",
          },
          ...prev,
        ]);
      }
    } else if (event.type === "CLASS_CREATED") {
      setNotifications((prev) => [
        {
          id: Date.now(),
          title: "Kelas Baru Ditambahkan oleh Admin",
          desc: `Kelas ${event.payload?.nama_kelas || "Baru"} telah dialokasikan.`,
          time: "Baru saja",
        },
        ...prev,
      ]);
    }
  });

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profil").update({
          nama_lengkap: settingsNama,
          email: settingsEmail,
        }).eq("id", user.id);
      }
    } catch {
      // ignore
    }
    setSettingsSavedSuccess(true);
    setTimeout(() => {
      setSettingsSavedSuccess(false);
      setIsSettingsModalOpen(false);
    }, 2000);
  };

  // Theme state and listener for dynamic screen color palette
  const [currentTheme, setCurrentTheme] = useState("slate");

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("thinksy_guru_theme");
      if (savedTheme) setCurrentTheme(savedTheme);
      const handleThemeChanged = (e: any) => {
        if (e.detail?.themeId) setCurrentTheme(e.detail.themeId);
      };
      window.addEventListener("guru_theme_changed", handleThemeChanged);
      return () => window.removeEventListener("guru_theme_changed", handleThemeChanged);
    } catch {
      // ignore
    }
  }, []);

  const THEME_STYLES: Record<string, {
    sidebarActive: string;
    activeIcon: string;
    badge: string;
    headerAccent: string;
    pageBg: string;
  }> = {
    slate: {
      sidebarActive: "bg-[#0F172A] text-white shadow-xs",
      activeIcon: "text-amber-400",
      badge: "text-amber-700 bg-amber-50 border-amber-200",
      headerAccent: "border-slate-200",
      pageBg: "bg-[#F8FAFC]",
    },
    blue: {
      sidebarActive: "bg-[#0369A1] text-white shadow-xs",
      activeIcon: "text-sky-300",
      badge: "text-sky-700 bg-sky-50 border-sky-200",
      headerAccent: "border-sky-200",
      pageBg: "bg-[#F0F9FF]",
    },
    emerald: {
      sidebarActive: "bg-[#047857] text-white shadow-xs",
      activeIcon: "text-emerald-300",
      badge: "text-emerald-700 bg-emerald-50 border-emerald-200",
      headerAccent: "border-emerald-200",
      pageBg: "bg-[#F0FDF4]",
    },
    purple: {
      sidebarActive: "bg-[#1E3A8A] text-white shadow-xs",
      activeIcon: "text-sky-300",
      badge: "text-blue-700 bg-blue-50 border-blue-200",
      headerAccent: "border-blue-200",
      pageBg: "bg-[#F8FAFC]",
    },
    amber: {
      sidebarActive: "bg-[#B45309] text-white shadow-xs",
      activeIcon: "text-amber-300",
      badge: "text-amber-700 bg-amber-50 border-amber-200",
      headerAccent: "border-amber-200",
      pageBg: "bg-[#FFFBEB]",
    },
    dark: {
      sidebarActive: "bg-[#020617] text-white shadow-xs border border-slate-700",
      activeIcon: "text-cyan-400",
      badge: "text-cyan-400 bg-slate-800 border-slate-700",
      headerAccent: "border-slate-800",
      pageBg: "bg-[#090D16]",
    },
  };

  const activeThemeStyles = THEME_STYLES[currentTheme] || THEME_STYLES.slate;

  // Determine current active view
  const currentNavView: GuruNavView =
    activeView ||
    (pathname === "/guru"
      ? "beranda"
      : pathname.startsWith("/guru/siswa")
      ? "manajemen_siswa"
      : pathname.startsWith("/guru/soal") || pathname.startsWith("/guru/penilaian")
      ? "pengelolaan"
      : "beranda");

  // FITUR NAVBAR KIRI PERSIS SESUAI PERINTAH PENGGUNA:
  // 1. Beranda
  // 2. Manajemen Siswa (sebelumnya "Management kelas")
  // 3. Management Kelas (Tab Baru)
  // 4. Pengelolaan
  // 5. Pengaturan
  const navItems = [
    {
      id: "beranda" as GuruNavView,
      label: "Beranda",
      icon: LayoutDashboard,
      active: currentNavView === "beranda",
    },
    {
      id: "manajemen_siswa" as GuruNavView,
      label: "Manajemen Siswa",
      icon: Users,
      active: currentNavView === "manajemen_siswa",
    },
    {
      id: "manajemen_kelas" as GuruNavView,
      label: "Management Kelas",
      icon: GraduationCap,
      active: currentNavView === "manajemen_kelas",
    },
    {
      id: "pengelolaan" as GuruNavView,
      label: "Pengelolaan",
      icon: Sliders,
      active: currentNavView === "pengelolaan",
    },
    {
      id: "pengaturan" as GuruNavView,
      label: "Pengaturan",
      icon: Settings,
      active: currentNavView === "pengaturan",
    },
  ];

  return (
    <div className={`flex min-h-screen ${activeThemeStyles.pageBg} text-slate-900 font-sans transition-colors duration-200`}>
      {/* MOBILE BACKDROP DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition duration-200"
        />
      )}

      {/* 1. SIDEBAR NAV (MATCHING DASHBOARD SISWA CLASSROOM PALETTE) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 border-r border-slate-200/80 bg-white py-4 px-3 flex flex-col justify-between shrink-0 shadow-none transition-transform duration-200 ease-in-out select-none ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-4">
          {/* Logo THINKSY + Panel Guru & Close Mobile Button */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 px-2">
            <Link href="/guru" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="THINKSY Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-[#0F172A] font-sans">
                  THINKSY
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="text-[11px] font-sans text-slate-500 font-medium">
                    Panel Guru
                  </div>
                  {isConnected && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>
              </div>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items (Matching ClassroomSidebar rounded-r-full & #1967D2 theme) */}
          <nav className="space-y-1 text-sm font-medium pr-1">
            {navItems.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onViewChange) {
                      onViewChange(item.id);
                      const targetUrl = item.id === "beranda" ? "/guru" : `/guru?tab=${item.id}`;
                      window.history.pushState(null, "", targetUrl);
                    } else {
                      router.push(item.id === "beranda" ? "/guru" : `/guru?tab=${item.id}`);
                    }
                  }}
                  className={`w-full py-2.5 px-4 flex items-center gap-3.5 text-sm font-medium rounded-r-full transition-colors cursor-pointer text-left ${
                    item.active
                      ? "bg-[#E8F0FE] text-[#1967D2] font-semibold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <IconComp className={`w-5 h-5 shrink-0 ${item.active ? "text-[#1967D2]" : "text-slate-600"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Navigasi Evaluasi Sesuai Spesifikasi Guru */}
            <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bank Soal & Asesmen
            </div>

            <Link
              href="/guru/soal"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full py-2.5 px-4 flex items-center gap-3.5 text-sm font-medium rounded-r-full transition-colors cursor-pointer text-left ${
                pathname.startsWith("/guru/soal")
                  ? "bg-[#E8F0FE] text-[#1967D2] font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <FileText className={`w-5 h-5 shrink-0 ${pathname.startsWith("/guru/soal") ? "text-[#1967D2]" : "text-slate-500"}`} />
              <span>Bank Soal</span>
            </Link>

            <Link
              href="/guru/penilaian"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full py-2.5 px-4 flex items-center gap-3.5 text-sm font-medium rounded-r-full transition-colors cursor-pointer text-left ${
                pathname.startsWith("/guru/penilaian")
                  ? "bg-[#E8F0FE] text-[#1967D2] font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <CheckSquare className={`w-5 h-5 shrink-0 ${pathname.startsWith("/guru/penilaian") ? "text-[#1967D2]" : "text-slate-500"}`} />
              <span>Penilaian Esai AI</span>
            </Link>

            {/* Link Khusus: Monitoring Biaya & Token AI */}
            <Link
              href="/guru/biaya"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full py-2.5 px-4 flex items-center gap-3.5 text-sm font-medium rounded-r-full transition-colors cursor-pointer text-left ${
                pathname === "/guru/biaya"
                  ? "bg-[#E8F0FE] text-[#1967D2] font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Coins className={`w-5 h-5 shrink-0 ${pathname === "/guru/biaya" ? "text-[#1967D2]" : "text-emerald-600"}`} />
              <span>Biaya & Token AI</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <form action={logoutAction} className="pt-3 border-t border-slate-200/80 px-2">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 py-2.5 px-3 rounded-xl transition cursor-pointer border border-rose-200/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </button>
        </form>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer shrink-0"
            aria-label="Buka Menu Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Global Search Input with Real Supabase Integration */}
          <div ref={searchContainerRef} className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => {
                if (searchResults && searchQuery.trim().length >= 2) {
                  setIsSearchDropdownOpen(true);
                }
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi, soal, atau siswa..."
              className="w-full pl-9 pr-8 py-2 bg-slate-100/90 border border-slate-200/80 rounded-full text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1967D2] focus:ring-2 focus:ring-blue-100 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults(null);
                  setIsSearchDropdownOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Live Search Results Dropdown */}
            {isSearchDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 max-h-[460px] overflow-y-auto space-y-3">
                {/* Search Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-semibold text-slate-900">
                  <div className="flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <span>Database: &quot;{searchQuery}&quot;</span>
                  </div>
                  {isSearching ? (
                    <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[#1967D2] rounded-full animate-ping" />
                      Mencari...
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                      {searchResults?.total || 0} hasil
                    </span>
                  )}
                </div>

                {isSearching ? (
                  <div className="py-6 text-center text-xs text-slate-500 space-y-2">
                    <div className="w-5 h-5 border-2 border-blue-200 border-t-[#1967D2] rounded-full animate-spin mx-auto" />
                    <p className="font-medium">Mencari di database...</p>
                  </div>
                ) : searchResults && searchResults.total === 0 ? (
                  /* Empty State */
                  <div className="py-6 px-4 text-center space-y-1.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-200">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Tidak Ada Data Ditemukan
                    </h4>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Tidak ada rekaman yang cocok dengan pencarian &quot;{searchQuery}&quot;.
                    </p>
                  </div>
                ) : searchResults ? (
                  <div className="space-y-3">
                    {/* 1. Siswa Results */}
                    {searchResults.siswa && searchResults.siswa.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-500" />
                          <span>Siswa ({searchResults.siswa.length})</span>
                        </div>
                        <div className="space-y-1">
                          {searchResults.siswa.map((st: any) => (
                            <div
                              key={st.id}
                              onClick={() => {
                                setIsSearchDropdownOpen(false);
                                if (onViewChange) {
                                  onViewChange("manajemen_kelas");
                                } else {
                                  router.push("/guru");
                                }
                              }}
                              className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-center justify-between gap-3 cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-full bg-[#1967D2] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                  {st.nama_lengkap.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-[#1967D2] truncate">
                                    {st.nama_lengkap}
                                  </h5>
                                  <span className="text-[11px] text-slate-500">
                                    NISN {st.nisn} • {st.kelas}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#1967D2] border border-blue-200 shrink-0">
                                {st.poin} Poin
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. Materi & Bab Results */}
                    {searchResults.materi && searchResults.materi.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-slate-100">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-500" />
                          <span>Materi & Bab ({searchResults.materi.length})</span>
                        </div>
                        <div className="space-y-1">
                          {searchResults.materi.map((m: any) => (
                            <Link
                              key={m.id}
                              href={m.href}
                              onClick={() => setIsSearchDropdownOpen(false)}
                              className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-center justify-between gap-3 cursor-pointer group"
                            >
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-slate-900 group-hover:text-[#1967D2] truncate">
                                  {m.judul}
                                </h5>
                                <span className="text-[11px] text-slate-500">
                                  {m.mata_pelajaran} • Bab #{m.urutan}
                                </span>
                              </div>
                              <span className="text-[11px] font-semibold text-[#1967D2] group-hover:translate-x-0.5 transition">
                                Buka →
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Soal Results */}
                    {searchResults.soal && searchResults.soal.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-slate-100">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-500" />
                          <span>Bank Soal ({searchResults.soal.length})</span>
                        </div>
                        <div className="space-y-1">
                          {searchResults.soal.map((s: any) => (
                            <Link
                              key={s.id}
                              href={s.href}
                              onClick={() => setIsSearchDropdownOpen(false)}
                              className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-center justify-between gap-3 cursor-pointer group"
                            >
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-slate-900 group-hover:text-[#1967D2] truncate">
                                  {s.judul}
                                </h5>
                                <span className="text-[11px] text-slate-500 uppercase">
                                  {s.tipe} • Status: {s.status}
                                </span>
                              </div>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#1967D2] border border-blue-200 shrink-0">
                                Lihat Soal →
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Right Header Icons & Profile */}
          <div className="flex items-center space-x-2.5">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                aria-label="Notifikasi"
                className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              {/* Notification Drawer */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3.5 z-50 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-[#1967D2]" />
                      <span className="font-bold text-xs text-slate-900">
                        Notifikasi
                      </span>
                    </div>
                    <button
                      onClick={() => setIsNotificationOpen(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1 hover:bg-slate-100/70 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {notif.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none cursor-pointer group p-1.5 rounded-full hover:bg-slate-100 transition border border-slate-200/60"
              >
                <div className="w-8 h-8 rounded-full bg-[#1967D2] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {teacherName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div className="text-left hidden sm:block pr-1">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {teacherName}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight">
                    {teacherRole}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition" />
              </button>

              {/* Profile Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 z-50 animate-in fade-in duration-100 font-sans">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Akun Pengajar:
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                      {teacherName}
                    </div>
                    <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-[#1967D2] text-[10px] font-semibold border border-blue-200">
                      <Shield className="w-3 h-3 text-[#1967D2]" />
                      <span>{teacherRole}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs font-medium">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsSettingsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition cursor-pointer text-left"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Pengaturan Akun</span>
                    </button>

                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer text-left font-semibold"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Keluar Akun</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {children}
        </main>
      </div>

      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* MODAL PENGATURAN PROFIL & AKUN GURU (MENU PENGATURAN)     */}
      {/* ======================================================== */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-100">
          <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl font-sans">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1967D2] flex items-center justify-center shrink-0 border border-blue-100">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base">Pengaturan Profil & Sistem</h2>
                  <p className="text-xs text-slate-500">Konfigurasi akun pengajar, preferensi tutor, dan notifikasi</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs Bar */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
              <button
                onClick={() => setActiveSettingsTab("profil")}
                className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer text-center ${
                  activeSettingsTab === "profil" ? "bg-white text-[#1967D2] shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Profil Guru
              </button>
              <button
                onClick={() => setActiveSettingsTab("ai")}
                className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer text-center ${
                  activeSettingsTab === "ai" ? "bg-white text-[#1967D2] shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Preferensi AI
              </button>
              <button
                onClick={() => setActiveSettingsTab("notif")}
                className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer text-center ${
                  activeSettingsTab === "notif" ? "bg-white text-[#1967D2] shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Notifikasi
              </button>
              <button
                onClick={() => setActiveSettingsTab("keamanan")}
                className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer text-center ${
                  activeSettingsTab === "keamanan" ? "bg-white text-[#1967D2] shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Keamanan
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSettings} className="space-y-4">
              {activeSettingsTab === "profil" && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Nama Lengkap & Gelar
                      </label>
                      <input
                        type="text"
                        value={settingsNama}
                        onChange={(e) => setSettingsNama(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#1967D2] focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Email Utama
                      </label>
                      <input
                        type="email"
                        value={settingsEmail}
                        onChange={(e) => setSettingsEmail(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#1967D2] focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Mata Pelajaran & Tingkat
                      </label>
                      <input
                        type="text"
                        value={settingsMapel}
                        onChange={(e) => setSettingsMapel(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#1967D2] focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        NIP / NUPTK
                      </label>
                      <input
                        type="text"
                        value={settingsNip}
                        onChange={(e) => setSettingsNip(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#1967D2] focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsTab === "ai" && (
                <div className="space-y-3.5">
                  <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-1">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-[#1967D2]" /> Preferensi Tutor AI Sokratik
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Menentukan gaya pembimbingan dan distribusi tingkat kesulitan materi evaluasi otomatis.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Gaya Pembimbingan Sokratik
                    </label>
                    <select className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#1967D2]">
                      <option>Fun, Ramah & Bertahap (Default)</option>
                      <option>Tegas & Berfokus pada Pembuktian</option>
                      <option>Eksploratif & Bebas Tantangan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Target Tingkat Kesulitan Auto-Generate Soal AI
                    </label>
                    <select className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#1967D2]">
                      <option>Seimbang (Mudah 30%, Sedang 50%, Sulit 20%)</option>
                      <option>Tinggi (HOTS / AKM Matematika)</option>
                      <option>Dasar (Penguatan Konsep Awal)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeSettingsTab === "notif" && (
                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Email Notifikasi Esai Baru</div>
                      <div className="text-[11px] text-slate-500">Kirim email saat siswa mengirimkan jawaban esai</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#1967D2] cursor-pointer" />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Laporan Ringkasan Presensi Harian</div>
                      <div className="text-[11px] text-slate-500">Terima ringkasan selfie presensi setiap pukul 08.00 WIB</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#1967D2] cursor-pointer" />
                  </div>
                </div>
              )}

              {activeSettingsTab === "keamanan" && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      placeholder="Masukkan kata sandi baru (min. 8 karakter)"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#1967D2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      placeholder="Ulangi kata sandi baru"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#1967D2]"
                    />
                  </div>
                </div>
              )}

              {settingsSavedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pengaturan akun berhasil disimpan.</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-3 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1967D2] hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING SPEED DIAL (+ / X) MENU WIDGET */}
      <FloatingGuruSpeedDial />
    </div>
  );
}

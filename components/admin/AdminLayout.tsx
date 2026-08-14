"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpen,
  X,
  Shield,
  HelpCircle,
  ChevronDown,
  Info,
  Wifi,
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";

interface AdminLayoutProps {
  children: React.ReactNode;
  userProfile?: {
    nama_lengkap: string;
    email: string;
    peran: string;
  };
}

export default function AdminLayout({ children, userProfile }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const adminName = userProfile?.nama_lengkap || "Admin Akademik";
  const adminRole = "ADMINISTRATOR";

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Permintaan Mutasi Siswa",
      desc: "2 siswa mengajukan mutasi kelas untuk semester baru.",
      time: "10 menit yang lalu",
    },
    {
      id: 2,
      title: "Pembaharuan NIP Guru",
      desc: "Data NIP 5 guru telah disinkronisasi dengan Dapodik.",
      time: "1 jam yang lalu",
    },
  ]);

  // Real-time listener for Admin Dashboard
  const { isConnected } = useRealtimeDashboard((event) => {
    if (event.type === "STUDENT_ADDED" || event.type === "ATTENDANCE_CHECKIN") {
      setNotifications((prev) => [
        {
          id: Date.now(),
          title: "Aktivitas Siswa Terdeteksi",
          desc: "Aktivitas akademik siswa diperbarui secara real-time.",
          time: "Baru saja",
        },
        ...prev,
      ]);
    } else if (event.type === "TEACHER_ADDED") {
      setNotifications((prev) => [
        {
          id: Date.now(),
          title: "Guru Baru Terdaftar",
          desc: "Akun pengajar baru telah aktif di sistem.",
          time: "Baru saja",
        },
        ...prev,
      ]);
    }
  });

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "Manajemen Guru",
      href: "/admin/guru",
      icon: Users,
      active: pathname === "/admin/guru",
    },
    {
      label: "Manajemen Siswa",
      href: "/admin/siswa",
      icon: UserPlus,
      active: pathname === "/admin/siswa",
    },
    {
      label: "Manajemen Kelas",
      href: "/admin/kelas",
      icon: BookOpen,
      active: pathname === "/admin/kelas",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* 1. SIDEBAR NAV (THINKSY BRANDING & PALETTE) */}
      <aside className="w-64 border-r border-slate-200 bg-white p-5 flex flex-col justify-between shrink-0 shadow-xs">
        <div className="space-y-6">
          {/* Logo THINKSY + Admin Sekolah */}
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-[#0F172A] flex items-center justify-center font-bold text-white shadow-sm border border-slate-700 group-hover:scale-105 transition duration-200">
              <BrainCircuit className="w-5.5 h-5.5 text-amber-400" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#0F172A]">
                THINKSY
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full w-fit uppercase tracking-wider">
                  Admin Sekolah
                </div>
                {isConnected && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                    <Wifi className="w-2.5 h-2.5 text-emerald-600 animate-pulse" /> Live
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="space-y-1.5 text-xs font-bold text-slate-600">
            {navItems.map((item) => {
              const IconComp = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-3 transition cursor-pointer ${
                    item.active
                      ? "bg-[#0F172A] text-white shadow-xs"
                      : "hover:bg-slate-100 hover:text-[#0F172A]"
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${item.active ? "text-amber-400" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Versi 1.0.4</span>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 text-xs font-extrabold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 py-2.5 px-4 rounded-xl transition cursor-pointer border border-red-100"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Akun</span>
            </button>
          </form>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Global Search Input */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari data..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition"
            />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                aria-label="Notifikasi"
                className="relative p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#0F172A] hover:bg-slate-200 shadow-xs transition cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
              </button>

              {/* Notification Drawer */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white border border-slate-200 p-4 z-50 shadow-2xl animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="font-extrabold text-xs text-[#0F172A]">
                        Notifikasi Admin Sekolah
                      </span>
                    </div>
                    <button
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-[#0F172A] hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0F172A]">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-snug">
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
                className="flex items-center space-x-2.5 focus:outline-none cursor-pointer group p-1 rounded-xl hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-slate-700 group-hover:scale-105 transition duration-200">
                  AA
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-extrabold text-[#0F172A] leading-tight">
                    {adminName}
                  </div>
                  <div className="text-[9px] text-slate-400 font-extrabold tracking-wider uppercase leading-tight">
                    {adminRole}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white border border-slate-200 p-3 z-50 shadow-2xl animate-in fade-in duration-150">
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 mb-2">
                    <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Akun Pengelola:
                    </div>
                    <div className="text-xs font-extrabold text-[#0F172A] truncate">
                      {adminName}
                    </div>
                    <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      <Shield className="w-3 h-3 text-blue-600" />
                      <span>{adminRole}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
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
        <main className="flex-1 p-6 sm:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

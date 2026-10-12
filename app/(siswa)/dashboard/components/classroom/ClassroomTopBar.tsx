"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Plus,
  LayoutGrid,
  Bell,
  CheckCircle2,
  Clock,
  Camera,
  Settings,
  User,
  LogOut,
  Sparkles,
  Gamepad2,
  MessageSquare,
  BookOpen,
  FileText,
  HelpCircle,
  X,
  ExternalLink,
  Shield,
  Layers,
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { NotificationItem, SekolahData } from "../../types";

interface ClassroomTopBarProps {
  onToggleSidebar: () => void;
  studentName: string;
  studentPhoto?: string | null;
  isCheckedIn: boolean;
  checkInStatus: string | null;
  checkInTime: string | null;
  isPresensiClosed: () => boolean;
  onStartAttendance: () => void;
  notifications: NotificationItem[];
  onMarkAllNotificationsAsRead: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenNotes: () => void;
  onOpenGames: () => void;
  onOpenChat: () => void;
  onOpenHelp: () => void;
  sekolahData?: SekolahData | null;
}

export default function ClassroomTopBar({
  onToggleSidebar,
  studentName,
  studentPhoto,
  isCheckedIn,
  checkInStatus,
  checkInTime,
  isPresensiClosed,
  onStartAttendance,
  notifications,
  onMarkAllNotificationsAsRead,
  onOpenSettings,
  onOpenProfile,
  onOpenNotes,
  onOpenGames,
  onOpenChat,
  onOpenHelp,
  sekolahData,
}: ClassroomTopBarProps) {
  const router = useRouter();
  const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const appsMenuRef = useRef<HTMLDivElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (appsMenuRef.current && !appsMenuRef.current.contains(target)) {
        setIsAppsMenuOpen(false);
      }
      if (plusMenuRef.current && !plusMenuRef.current.contains(target)) {
        setIsPlusMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstLetter = (studentName || "S").trim().charAt(0).toUpperCase();
  const unreadNotifCount = notifications.filter((n) => !n.dibaca).length;
  const isClosed = isPresensiClosed();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full h-16 bg-white border-b border-slate-200/80 px-3 sm:px-5 flex items-center justify-between select-none shadow-2xs">
      {/* LEFT: Hamburger & Classroom Brand Logo */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Hamburger Menu Button */}
        <button
          onClick={onToggleSidebar}
          aria-label="Main menu"
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* THINKSY Branding */}
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-90 transition group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 relative shrink-0 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="THINKSY Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <span className="text-[20px] font-black text-[#0F172A] tracking-tight font-sans">
            THINKSY
          </span>
        </Link>
      </div>

      {/* RIGHT: Presensi Status, Plus Icon, Google Apps Icon, Notifications, Profile Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Presensi Status / Quick Button */}
        <div className="mr-1">
          {isCheckedIn ? (
            <div
              title={`Presensi hari ini telah dicatat (${
                checkInStatus || "Hadir"
              }) pada ${checkInTime || "07:15 WIB"}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline font-medium">Hadir</span>
              <span className="hidden lg:inline text-emerald-700 text-[11px]">
                ({checkInTime || "07:15"})
              </span>
            </div>
          ) : isClosed ? (
            <div
              title="Batas waktu presensi telah berakhir"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
            >
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Presensi Ditutup</span>
            </div>
          ) : (
            <button
              onClick={onStartAttendance}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Presensi</span>
            </button>
          )}
        </div>

        {/* Plus (+) Button Dropdown */}
        <div className="relative" ref={plusMenuRef}>
          <button
            onClick={() => {
              setIsPlusMenuOpen(!isPlusMenuOpen);
              setIsAppsMenuOpen(false);
              setIsProfileMenuOpen(false);
              setIsNotificationOpen(false);
            }}
            aria-label="Create or join a class"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>

          {isPlusMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  alert("Fitur Gabung Kelas: Masukkan kode kelas yang diberikan oleh guru pengampu.");
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span>Gabung ke Kelas</span>
              </button>
              <button
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  onOpenNotes();
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Buat Catatan Belajar</span>
              </button>
            </div>
          )}
        </div>

        {/* Google Apps (9-dot Grid) Icon */}
        <div className="relative" ref={appsMenuRef}>
          <button
            onClick={() => {
              setIsAppsMenuOpen(!isAppsMenuOpen);
              setIsPlusMenuOpen(false);
              setIsProfileMenuOpen(false);
              setIsNotificationOpen(false);
            }}
            aria-label="Google apps"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95 cursor-pointer"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>

          {isAppsMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
                Aplikasi & Fitur Belajar
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setIsAppsMenuOpen(false);
                    onOpenGames();
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-slate-100 transition text-center cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700">Game Hub</span>
                </button>

                <button
                  onClick={() => {
                    setIsAppsMenuOpen(false);
                    onOpenChat();
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-slate-100 transition text-center cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700">Diskusi</span>
                </button>

                <button
                  onClick={() => {
                    setIsAppsMenuOpen(false);
                    onOpenNotes();
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-slate-100 transition text-center cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700">Catatan</span>
                </button>

                <button
                  onClick={() => {
                    setIsAppsMenuOpen(false);
                    router.push("/belajar");
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-slate-100 transition text-center cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700">Modul</span>
                </button>

                <button
                  onClick={() => {
                    setIsAppsMenuOpen(false);
                    router.push("/ujian");
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-slate-100 transition text-center cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700">Ruang Ujian</span>
                </button>

                <button
                  onClick={() => {
                    setIsAppsMenuOpen(false);
                    onOpenHelp();
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-slate-100 transition text-center cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700">Bantuan</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsAppsMenuOpen(false);
              setIsPlusMenuOpen(false);
              setIsProfileMenuOpen(false);
            }}
            aria-label="Notifications"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95 cursor-pointer relative"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white" />
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-800">Notifikasi</span>
                {unreadNotifCount > 0 && (
                  <button
                    onClick={onMarkAllNotificationsAsRead}
                    className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Tidak ada notifikasi baru
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs ${
                        !n.dibaca ? "bg-blue-50/50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-semibold text-slate-800">{n.title}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">
                        {n.desc}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{n.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar (Purple "S" circle matching the screenshot!) */}
        <div className="relative ml-1" ref={profileMenuRef}>
          <button
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsAppsMenuOpen(false);
              setIsPlusMenuOpen(false);
              setIsNotificationOpen(false);
            }}
            aria-label="Google Account"
            className="w-9 h-9 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center font-semibold text-sm shadow-xs transition active:scale-95 cursor-pointer overflow-hidden border border-purple-800/20"
          >
            {studentPhoto ? (
              <img
                src={studentPhoto}
                alt={studentName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{firstLetter}</span>
            )}
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {firstLetter}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-800 truncate">
                    {studentName}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {sekolahData?.nama || "SMKS Muhammadiyah Pakem"}
                  </div>
                </div>
              </div>

              <div className="py-2 space-y-1">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Profil Siswa</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Pengaturan</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={async () => {
                    setIsProfileMenuOpen(false);
                    await logoutAction();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Camera,
  Loader2,
  Bell,
  X,
  Shield,
  Settings,
  HelpCircle,
  LogOut,
  User,
  Home,
  BookOpen,
  Award,
  Trophy,
  Sparkles,
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { NotificationItem, SekolahData } from "../../types";
import { usePathname, useRouter } from "next/navigation";
import { getStoredStudentPhoto } from "@/lib/student-settings";

interface StudentNavbarProps {
  isDarkMode: boolean;
  sekolahData?: SekolahData | null;
  activeTab?: "Home" | "Belajar" | "Ruang Ujian" | "Peringkat" | "Pencapaian";
  setActiveTab?: (tab: "Home" | "Belajar" | "Ruang Ujian" | "Peringkat" | "Pencapaian") => void;
  isCheckedIn: boolean;
  checkInStatus: string | null;
  checkInTime: string | null;
  isPresensiClosed: () => boolean;
  onStartAttendance: () => void;
  isSubmittingAttendance?: boolean;
  notifications: NotificationItem[];
  onMarkAllNotificationsAsRead: () => void;
  studentName: string;
  studentPhoto?: string | null;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenProfile: () => void;
}

export default function StudentNavbar({
  isDarkMode,
  sekolahData,
  activeTab = "Home",
  setActiveTab,
  isCheckedIn,
  checkInStatus,
  checkInTime,
  isPresensiClosed,
  onStartAttendance,
  isSubmittingAttendance = false,
  notifications,
  onMarkAllNotificationsAsRead,
  studentName,
  studentPhoto,
  onOpenSettings,
  onOpenHelp,
  onOpenProfile,
}: StudentNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const mobileTabContainerRef = useRef<HTMLElement | null>(null);

  // Sync photo with props or localStorage
  const [currentPhoto, setCurrentPhoto] = useState<string>(() => {
    return studentPhoto || getStoredStudentPhoto();
  });

  useEffect(() => {
    if (studentPhoto) {
      setCurrentPhoto(studentPhoto);
    }
    const handlePhotoChange = (e: any) => {
      if (e.detail) setCurrentPhoto(e.detail);
    };
    window.addEventListener("thinksy_photo_change", handlePhotoChange);
    return () => {
      window.removeEventListener("thinksy_photo_change", handlePhotoChange);
    };
  }, [studentPhoto]);

  const initials = studentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const closed = isPresensiClosed();

  // Determine active state
  const isHomeActive = pathname === "/" || pathname === "/dashboard" ? (activeTab === "Home") : false;
  const isBelajarActive = pathname.startsWith("/belajar");
  const isUjianActive = pathname.startsWith("/ujian");
  const isPeringkatActive = activeTab === "Peringkat";
  const isPencapaianActive = activeTab === "Pencapaian";

  const navTabs = [
    {
      id: "Home",
      label: "Home",
      icon: Home,
      isActive: isHomeActive,
      onClick: () => {
        if (pathname !== "/" && pathname !== "/dashboard") {
          router.push("/");
        } else if (setActiveTab) {
          setActiveTab("Home");
        }
      },
    },
    {
      id: "Belajar",
      label: "Belajar",
      icon: BookOpen,
      isActive: isBelajarActive,
      href: "/belajar",
    },
    {
      id: "Ruang Ujian",
      label: "Ruang Ujian",
      icon: Award,
      isActive: isUjianActive,
      href: "/ujian",
    },
    {
      id: "Peringkat",
      label: "Peringkat",
      icon: Trophy,
      isActive: isPeringkatActive,
      onClick: () => {
        if (pathname !== "/" && pathname !== "/dashboard") {
          router.push("/?tab=peringkat");
        } else if (setActiveTab) {
          setActiveTab("Peringkat");
        }
      },
    },
    {
      id: "Pencapaian",
      label: "Pencapaian",
      icon: Sparkles,
      isActive: isPencapaianActive,
      onClick: () => {
        if (pathname !== "/" && pathname !== "/dashboard") {
          router.push("/?tab=pencapaian");
        } else if (setActiveTab) {
          setActiveTab("Pencapaian");
        }
      },
    },
  ];

  // Auto-scroll active tab into view in mobile horizontal bar
  useEffect(() => {
    if (mobileTabContainerRef.current) {
      const activeEl = mobileTabContainerRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeTab, pathname]);

  return (
    <>
      <header className="sticky top-2.5 sm:top-5 z-40 w-full px-2.5 sm:px-6 pointer-events-none transition-all duration-300">
        <div
          className={`mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between px-3 sm:px-6 py-2 sm:py-2.5 rounded-2xl md:rounded-full border backdrop-blur-xl shadow-lg sm:shadow-xl pointer-events-auto transition-all duration-300 ${
            isDarkMode
              ? "bg-slate-900/95 border-slate-700/80 text-white shadow-slate-950/40"
              : "bg-white/95 border-slate-200/90 text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.12)] hover:border-slate-300 ring-1 ring-slate-900/5"
          }`}
        >
          {/* Main Top Row (Logo, Desktop Tabs, and Header Controls) */}
          <div className="flex items-center justify-between w-full">
            {/* Left: Brand Vector Logo & Desktop Nav Tabs */}
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group shrink-0">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full overflow-hidden shadow-xs border border-slate-200 group-hover:scale-105 transition-transform duration-200 bg-white flex items-center justify-center p-1 shrink-0">
                  <img
                    src="/logo.png"
                    alt="THINKSY Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-black text-sm sm:text-lg tracking-tight font-sans text-[#0F172A] dark:text-white">
                  THINKSY
                </span>
              </Link>

              {/* Navigation Tabs (Navbar Siswa: Desktop / Tablet) */}
              <nav className="hidden md:flex items-center space-x-1 py-0.5">
                {navTabs.map((tab) => {
                  const desktopTabClass = `px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    tab.isActive
                      ? isDarkMode
                        ? "bg-white text-slate-900 shadow-xs font-extrabold scale-100"
                        : "bg-[#0F172A] text-white shadow-xs font-extrabold scale-100"
                      : isDarkMode
                      ? "text-slate-300 hover:text-white hover:bg-slate-800"
                      : "text-slate-600 hover:text-[#0F172A] hover:bg-slate-100/80"
                  }`;

                  if (tab.href) {
                    return (
                      <Link key={tab.id} href={tab.href} className={desktopTabClass}>
                        {tab.label}
                      </Link>
                    );
                  }

                  return (
                    <button key={tab.id} onClick={tab.onClick} className={desktopTabClass}>
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right Header Controls (Presensi, Notification, Profile) */}
            <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
              {/* Presensi Button in Navbar */}
              <div className="relative">
                {isCheckedIn ? (
                  <div
                    title={`Presensi hari ini telah dicatat (${
                      checkInStatus || "Hadir"
                    }) pada pukul ${checkInTime || "08.00"} WIB`}
                    className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold shadow-2xs border ${
                      checkInStatus?.includes("Terlambat")
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        checkInStatus?.includes("Terlambat")
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    />
                    <span className="hidden sm:inline">
                      {checkInStatus?.includes("Terlambat") ? "Terlambat" : "Hadir"}{" "}
                      ({checkInTime || "08.00"})
                    </span>
                    <span className="sm:hidden">
                      {checkInStatus?.includes("Terlambat") ? "Terlambat" : "Hadir"}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={onStartAttendance}
                    disabled={isSubmittingAttendance}
                    title={
                      closed
                        ? "Batas waktu presensi (>08.00 WIB) telah berakhir"
                        : "Verifikasi presensi kehadiran hari ini dengan AI Liveness"
                    }
                    className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50 ${
                      closed
                        ? "bg-rose-50/70 border-rose-200 text-rose-700 hover:bg-rose-100/80"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-[#0F172A]"
                    }`}
                  >
                    {isSubmittingAttendance ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    ) : closed ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span className="hidden sm:inline">
                      {closed ? "Presensi (Ditutup)" : "Presensi"}
                    </span>
                    <span className="sm:hidden">Presensi</span>
                  </button>
                )}
              </div>

              {/* Real-Time Notification Bell Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsNotificationOpen(!isNotificationOpen);
                    setIsDropdownOpen(false);
                  }}
                  aria-label="Notifikasi"
                  className="relative p-2 sm:p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#0F172A] shadow-2xs transition-all cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.some((n) => !n.dibaca) && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-extrabold ring-2 ring-white animate-pulse">
                      {notifications.filter((n) => !n.dibaca).length}
                    </span>
                  )}
                </button>

                {/* Notification Drawer Popup */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-24px)] sm:w-96 rounded-2xl saas-modal border border-slate-200 p-4 z-50 shadow-2xl animate-in fade-in duration-150 bg-white text-slate-900">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-600" />
                        <span className="font-extrabold text-sm text-[#0F172A]">
                          Log Notifikasi User
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {notifications.some((n) => !n.dibaca) && (
                          <button
                            onClick={onMarkAllNotificationsAsRead}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                          >
                            Tandai Dibaca
                          </button>
                        )}
                        <button
                          onClick={() => setIsNotificationOpen(false)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">
                          Belum ada notifikasi.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              if (notif.link_url) {
                                setIsNotificationOpen(false);
                                router.push(notif.link_url);
                              }
                            }}
                            className={`p-3 rounded-xl border space-y-1 transition ${
                              notif.link_url ? "cursor-pointer hover:shadow-sm" : ""
                            } ${
                              notif.dibaca
                                ? "bg-slate-50/70 border-slate-200/60 opacity-80"
                                : "bg-blue-50/50 border-blue-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                                {!notif.dibaca && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                )}
                                <span>{notif.title}</span>
                              </span>
                              <span className="text-[10px] text-slate-500 font-semibold shrink-0">
                                {notif.time}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 leading-snug">
                              {notif.desc}
                            </p>
                            {notif.link_url && (
                              <span className="text-[10px] text-blue-600 font-bold hover:underline inline-block pt-0.5">
                                Buka tautan →
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen);
                    setIsNotificationOpen(false);
                  }}
                  className="flex items-center space-x-2 focus:outline-none cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-slate-200 group-hover:scale-105 transition-transform duration-200 overflow-hidden relative">
                    {currentPhoto ? (
                      <img
                        src={currentPhoto}
                        alt={studentName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      initials
                    )}
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 max-w-[calc(100vw-24px)] rounded-2xl saas-modal border border-slate-200 p-3 z-50 shadow-2xl animate-in fade-in duration-150 bg-white text-slate-900">
                    <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 text-white shrink-0 flex items-center justify-center font-bold text-xs border border-slate-300">
                        {currentPhoto ? (
                          <img src={currentPhoto} alt={studentName} className="w-full h-full object-cover" />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                          Nama Akun:
                        </div>
                        <div className="text-xs font-extrabold text-[#0F172A] truncate">
                          {studentName}
                        </div>
                        <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                          <Shield className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Siswa</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          onOpenSettings();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 hover:text-[#0F172A] rounded-xl transition cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-700" />
                        <span>Pengaturan Akun</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenHelp();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 hover:text-[#0F172A] rounded-xl transition cursor-pointer"
                      >
                        <HelpCircle className="w-4 h-4 text-slate-700" />
                        <span>Pusat Bantuan</span>
                      </button>

                      <form action={logoutAction}>
                        <button
                          type="submit"
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Log Out</span>
                        </button>
                      </form>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => {
                          onOpenProfile();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full py-2.5 px-4 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>View Profile Card</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation Tabs Strip (Mode HP: selalu terlihat jelas & leluasa diakses) */}
          <nav
            ref={mobileTabContainerRef}
            aria-label="Navigasi Menu Siswa"
            className={`flex md:hidden items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pt-2 mt-1.5 border-t -mx-1 px-1 ${
              isDarkMode ? "border-slate-800" : "border-slate-100"
            }`}
          >
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const content = (
                <>
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                      tab.isActive
                        ? isDarkMode
                          ? "text-slate-900"
                          : "text-white"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span className="truncate">{tab.label}</span>
                </>
              );

              const mobileTabClass = `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 active:scale-95 group ${
                tab.isActive
                  ? isDarkMode
                    ? "bg-white text-slate-900 shadow-sm font-black scale-[1.02]"
                    : "bg-[#0F172A] text-white shadow-sm font-black scale-[1.02]"
                  : isDarkMode
                  ? "text-slate-300 hover:text-white hover:bg-slate-800/90 bg-slate-800/40"
                  : "text-slate-600 hover:text-[#0F172A] hover:bg-slate-100/90 bg-slate-50/80"
              }`;

              if (tab.href) {
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    data-active={tab.isActive ? "true" : undefined}
                    className={mobileTabClass}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={tab.onClick}
                  data-active={tab.isActive ? "true" : undefined}
                  className={mobileTabClass}
                >
                  {content}
                </button>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}


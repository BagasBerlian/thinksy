"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Plus,
  LayoutGrid,
  FileText,
  BookOpen,
  Layers,
  HelpCircle,
  GraduationCap,
  LogOut,
  Mail,
  User,
  CheckCircle2,
  Calendar,
  X,
  Sparkles,
} from "lucide-react";
import LanguageToggle from "@/components/layout/LanguageToggle";
import { useLanguage } from "@/hooks/useLanguage";
import { logoutAction } from "@/app/(auth)/actions";

interface GuruClassroomTopBarProps {
  onToggleSidebar: () => void;
  teacherName?: string;
  teacherEmail?: string;
  teacherPhoto?: string | null;
  teacherRole?: string;
  schoolName?: string;
  onOpenCreateClass?: () => void;
  onOpenCreateTask?: () => void;
  onOpenHelp?: () => void;
}

export default function GuruClassroomTopBar({
  onToggleSidebar,
  teacherName = "Ibu Siti Rahmawati, M.Pd.",
  teacherEmail = "siti.rahmawati@sekolah.sch.id",
  teacherPhoto = "/images/foto-guru.jpg",
  teacherRole = "Wali Kelas & Guru Matematika",
  schoolName = "SMK Muhammadiyah 1",
  onOpenCreateClass,
  onOpenCreateTask,
  onOpenHelp,
}: GuruClassroomTopBarProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const appsMenuRef = useRef<HTMLDivElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstLetter = (teacherName || "G").trim().charAt(0).toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full h-16 bg-white border-b border-slate-200/80 px-3 sm:px-5 flex items-center justify-between select-none shadow-2xs">
      {/* LEFT: Hamburger & Classroom Brand Logo */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Hamburger Menu Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Main menu"
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* THINKSY Branding */}
        <Link
          href="/guru"
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

      {/* RIGHT: Language Switcher, Plus (+) Dropdown, Apps (9 dots), Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">

        {/* Global Language Switcher (ID | EN) */}
        <LanguageToggle className="mx-1 shrink-0" />

        {/* Plus (+) Button Dropdown */}
        <div className="relative" ref={plusMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsPlusMenuOpen(!isPlusMenuOpen);
              setIsAppsMenuOpen(false);
              setIsProfileMenuOpen(false);
            }}
            aria-label="Create class or announcement"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>

          {isPlusMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* 1. Buat Kelas Baru & Token */}
              <button
                type="button"
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  if (onOpenCreateClass) onOpenCreateClass();
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#0B57D0] hover:bg-blue-50/80 flex items-center gap-3 transition cursor-pointer border-b border-slate-100"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-[#0B57D0] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold">Buat Kelas Baru & Token</div>
                  <div className="text-[10px] text-slate-400 font-normal">Matematika, IPA, B. Indo, dll.</div>
                </div>
              </button>

              {/* 2. Buat Tugas / Materi Baru */}
              <button
                type="button"
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  if (onOpenCreateTask) {
                    onOpenCreateTask();
                  } else if (onOpenCreateClass) {
                    onOpenCreateClass();
                  }
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Buat Tugas / Materi Baru</span>
              </button>

              {/* 3. Generator Soal AI */}
              <button
                type="button"
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  router.push("/guru/buat-soal");
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Generator Soal AI</span>
              </button>
            </div>
          )}
        </div>

        {/* Google Apps (9-dot Grid) Icon */}
        <div className="relative" ref={appsMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsAppsMenuOpen(!isAppsMenuOpen);
              setIsPlusMenuOpen(false);
              setIsProfileMenuOpen(false);
            }}
            aria-label="Google apps"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95 cursor-pointer"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>

          {isAppsMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
                Aplikasi & Portal Akademik
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAppsMenuOpen(false);
                    router.push("/guru");
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-slate-100 transition text-center cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700">Classroom Guru</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAppsMenuOpen(false);
                    router.push("/guru/soal");
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-slate-100 transition text-center cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700">Bank Soal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAppsMenuOpen(false);
                    router.push("/guru/penilaian");
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-slate-100 transition text-center cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700">Penilaian</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAppsMenuOpen(false);
                    if (onOpenHelp) onOpenHelp();
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-slate-100 transition text-center cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700">{t.help}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAppsMenuOpen(false);
                    if (typeof document !== "undefined") {
                      document.cookie = "user_role=siswa; path=/; max-age=86400";
                    }
                    router.push("/");
                  }}
                  className="col-span-2 mt-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-slate-700"
                >
                  <GraduationCap className="w-4 h-4 text-slate-600" />
                  <span>Buka Dashboard Siswa</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="relative ml-1" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsAppsMenuOpen(false);
              setIsPlusMenuOpen(false);
            }}
            aria-label="Profil Guru"
            className="w-10 h-10 rounded-full bg-white hover:ring-2 hover:ring-blue-400 text-slate-800 flex items-center justify-center font-semibold text-sm shadow-xs transition active:scale-95 cursor-pointer overflow-hidden border border-slate-200"
          >
            {teacherPhoto ? (
              <img
                src={teacherPhoto}
                alt={teacherName}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <span className="w-full h-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {firstLetter}
              </span>
            )}
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-84 bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-5 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
              {/* Header */}
              <div className="flex items-center justify-between pb-3">
                <h3 className="text-base font-bold text-slate-800 font-sans tracking-tight">
                  Profil Pendidik
                </h3>
              </div>

              {/* Baris Identitas */}
              <div className="flex items-start gap-3.5 pt-1">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-50 border-2 border-slate-100 shadow-xs shrink-0 flex items-center justify-center">
                  {teacherPhoto ? (
                    <img
                      src={teacherPhoto}
                      alt={teacherName}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                      {firstLetter}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {teacherName}
                  </div>
                  <div className="text-xs text-slate-500 leading-tight mt-0.5 truncate">
                    {schoolName}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{teacherEmail}</span>
                  </div>
                </div>
              </div>

              {/* Garis Pemisah */}
              <div className="my-4 border-t border-slate-100" />

              {/* Informasi Akademik */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800">
                  Peran & Penugasan
                </div>
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <User className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{teacherRole}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Kelas Binaan: Matematika (Kelas 8)</span>
                  </div>
                </div>
              </div>

              {/* Garis Pemisah */}
              <div className="my-4 border-t border-slate-100" />

              {/* Button Keluar */}
              <button
                type="button"
                onClick={async () => {
                  setIsProfileMenuOpen(false);
                  await logoutAction();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-rose-300 text-rose-500 hover:bg-rose-50 flex items-center justify-center gap-2 text-sm font-semibold transition active:scale-95 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import {
  Home,
  Calendar,
  GraduationCap,
  ClipboardCheck,
  Archive,
  Settings,
  ChevronDown,
  ChevronUp,
  Trophy,
  Award,
  BookOpen,
} from "lucide-react";

export type ClassroomViewMode =
  | "home"
  | "calendar"
  | "todo"
  | "archived"
  | "peringkat"
  | "pencapaian"
  | "matematika"
  | "indonesia"
  | "inggris";

interface ClassroomSidebarProps {
  isOpen: boolean;
  activeView: ClassroomViewMode;
  onSelectView: (view: ClassroomViewMode) => void;
  onOpenSettings: () => void;
  todoCount?: number;
}

export default function ClassroomSidebar({
  isOpen,
  activeView,
  onSelectView,
  onOpenSettings,
  todoCount,
}: ClassroomSidebarProps) {
  const [isEnrolledOpen, setIsEnrolledOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <aside className="fixed top-16 left-0 bottom-0 z-30 w-68 sm:w-72 bg-white border-r border-slate-200/80 py-3 flex flex-col select-none overflow-y-auto custom-scrollbar shadow-lg md:shadow-none animate-in fade-in slide-in-from-left-4 duration-200">
      <div className="space-y-1 pr-3">
        {/* 1. HOME */}
        <button
          onClick={() => onSelectView("home")}
          className={`w-full py-3 px-6 flex items-center gap-4 text-sm font-medium rounded-r-full transition-colors cursor-pointer ${
            activeView === "home"
              ? "bg-[#E8F0FE] text-[#1967D2] font-semibold"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Home className={`w-5 h-5 ${activeView === "home" ? "text-[#1967D2]" : "text-slate-600"}`} />
          <span>Home</span>
        </button>

        {/* 2. PENCAPAIAN */}
        <button
          onClick={() => onSelectView("pencapaian")}
          className={`w-full py-3 px-6 flex items-center gap-4 text-sm font-medium rounded-r-full transition-colors cursor-pointer ${
            activeView === "pencapaian"
              ? "bg-[#E8F0FE] text-[#1967D2] font-semibold"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Award className={`w-5 h-5 ${activeView === "pencapaian" ? "text-[#1967D2]" : "text-slate-600"}`} />
          <span>Pencapaian</span>
        </button>

        {/* 3. PERINGKAT (Di bawah Pencapaian) */}
        <button
          onClick={() => onSelectView("peringkat")}
          className={`w-full py-3 px-6 flex items-center gap-4 text-sm font-medium rounded-r-full transition-colors cursor-pointer ${
            activeView === "peringkat"
              ? "bg-[#E8F0FE] text-[#1967D2] font-semibold"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Trophy className={`w-5 h-5 ${activeView === "peringkat" ? "text-[#1967D2]" : "text-slate-600"}`} />
          <span>Peringkat</span>
        </button>

        {/* DIVIDER */}
        <div className="my-2 border-t border-slate-200 mx-4" />

        {/* 4. RUANG BELAJAR (Menggantikan ENROLLED) */}
        <div>
          <button
            onClick={() => setIsEnrolledOpen(!isEnrolledOpen)}
            className="w-full py-2.5 px-6 flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-slate-50 rounded-r-full transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Ruang Belajar</span>
            </div>
            {isEnrolledOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isEnrolledOpen && (
            <div className="space-y-0.5 mt-1">
              {/* To-do */}
              <button
                onClick={() => onSelectView("todo")}
                className={`w-full py-2.5 px-6 flex items-center justify-between text-sm font-medium rounded-r-full transition-colors cursor-pointer ${
                  activeView === "todo"
                    ? "bg-[#E8F0FE] text-[#1967D2] font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <ClipboardCheck className={`w-5 h-5 ${activeView === "todo" ? "text-[#1967D2]" : "text-slate-600"}`} />
                  <span>To-do</span>
                </div>
                {typeof todoCount === "number" && todoCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1967D2] text-white shrink-0">
                    {todoCount}
                  </span>
                )}
              </button>

              {/* Mata Pelajaran 1: Matematika */}
              <button
                onClick={() => onSelectView("matematika")}
                className={`w-full py-2.5 px-6 flex items-center gap-3.5 text-sm font-medium rounded-r-full transition-colors cursor-pointer ${
                  activeView === "matematika"
                    ? "bg-[#E8F0FE] text-[#1967D2] font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  M
                </div>
                <span className="truncate text-xs font-semibold">Matematika</span>
              </button>

              {/* Mata Pelajaran 2: Bahasa Indonesia */}
              <button
                onClick={() => onSelectView("indonesia")}
                className={`w-full py-2.5 px-6 flex items-center gap-3.5 text-sm font-medium rounded-r-full transition-colors cursor-pointer ${
                  activeView === "indonesia"
                    ? "bg-[#E8F0FE] text-[#1967D2] font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  B
                </div>
                <span className="truncate text-xs font-semibold">Bahasa Indonesia</span>
              </button>

              {/* Mata Pelajaran 3: Bahasa Inggris */}
              <button
                onClick={() => onSelectView("inggris")}
                className={`w-full py-2.5 px-6 flex items-center gap-3.5 text-sm font-medium rounded-r-full transition-colors cursor-pointer ${
                  activeView === "inggris"
                    ? "bg-[#E8F0FE] text-[#1967D2] font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  I
                </div>
                <span className="truncate text-xs font-semibold">Bahasa Inggris</span>
              </button>
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div className="my-2 border-t border-slate-200 mx-4" />

        {/* PENGATURAN */}
        <button
          onClick={onOpenSettings}
          className="w-full py-3 px-6 flex items-center gap-4 text-sm font-medium rounded-r-full text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Settings className="w-5 h-5 text-slate-600" />
          <span>Pengaturan</span>
        </button>
      </div>
    </aside>
  );
}

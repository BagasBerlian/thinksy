"use client";

import { useState } from "react";
import {
  Home,
  Calendar,
  Users,
  FolderKanban,
  Archive,
  Settings,
  ChevronDown,
  ChevronUp,
  Plus,
  UserCheck,
} from "lucide-react";

export type GuruClassroomViewMode =
  | "home"
  | "calendar"
  | "presensi"
  | "to_review"
  | "matematika"
  | "archived"
  | "settings"
  | string;

export interface SidebarClassItem {
  id: string;
  name: string;
  themeColor?: string;
  subjectCode?: string;
}

interface GuruClassroomSidebarProps {
  isOpen: boolean;
  activeView: GuruClassroomViewMode;
  onSelectView: (view: GuruClassroomViewMode) => void;
  pendingReviewCount?: number;
  classes?: SidebarClassItem[];
  archivedCount?: number;
  onCreateClassClick?: () => void;
  className?: string;
}

export default function GuruClassroomSidebar({
  isOpen,
  activeView,
  onSelectView,
  pendingReviewCount = 2,
  classes = [
    { id: "mat-8", name: "Matematika (Kelas 8)", themeColor: "#1967D2" },
  ],
  archivedCount = 0,
  onCreateClassClick,
}: GuruClassroomSidebarProps) {
  const [isTeachingOpen, setIsTeachingOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-68 sm:w-72 bg-white border-r border-slate-200/80 z-30 flex flex-col py-3 select-none overflow-y-auto">
      <div className="space-y-1">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => onSelectView("home")}
          className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full mr-3 text-sm font-medium transition cursor-pointer text-left ${
            activeView === "home"
              ? "bg-[#D3E3FD] text-[#041E49] font-semibold"
              : "text-[#444746] hover:bg-slate-100/80"
          }`}
        >
          <Home
            className={`w-5 h-5 shrink-0 ${
              activeView === "home" ? "text-[#041E49]" : "text-[#444746]"
            }`}
          />
          <span>Home</span>
        </button>

        {/* 2. Calendar */}
        <button
          type="button"
          onClick={() => onSelectView("calendar")}
          className={`w-full flex items-center gap-4 px-6 py-3 rounded-r-full mr-3 text-sm font-medium transition cursor-pointer text-left ${
            activeView === "calendar"
              ? "bg-[#D3E3FD] text-[#041E49] font-semibold"
              : "text-[#444746] hover:bg-slate-100/80"
          }`}
        >
          <Calendar
            className={`w-5 h-5 shrink-0 ${
              activeView === "calendar" ? "text-[#041E49]" : "text-[#444746]"
            }`}
          />
          <span>Calendar</span>
        </button>

        {/* 3. Presensi & Siswa (Menu Mandiri Terpisah dari Teaching) */}
        <button
          type="button"
          onClick={() => onSelectView("presensi")}
          className={`w-full flex items-center justify-between px-6 py-3 rounded-r-full mr-3 text-sm font-medium transition cursor-pointer text-left ${
            activeView === "presensi"
              ? "bg-[#D3E3FD] text-[#041E49] font-semibold"
              : "text-[#444746] hover:bg-slate-100/80"
          }`}
        >
          <div className="flex items-center gap-4 min-w-0">
            <UserCheck
              className={`w-5 h-5 shrink-0 ${
                activeView === "presensi" ? "text-[#041E49]" : "text-[#444746]"
              }`}
            />
            <span className="truncate">Presensi & Siswa</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
            Harian
          </span>
        </button>

        {/* 4. Teaching Section (Accordion - Khusus Kelas Mengajar) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsTeachingOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-6 py-3 rounded-r-full mr-3 text-sm font-medium text-[#444746] hover:bg-slate-100/80 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-4 min-w-0">
              <Users className="w-5 h-5 text-[#444746] shrink-0" />
              <span className="font-medium text-slate-800">Teaching</span>
            </div>
            {isTeachingOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
            )}
          </button>

          {/* Sub-items when Teaching is expanded */}
          {isTeachingOpen && (
            <div className="space-y-1 pt-0.5">
              {/* To review */}
              <button
                type="button"
                onClick={() => onSelectView("to_review")}
                className={`w-full flex items-center justify-between pl-12 pr-6 py-2.5 rounded-r-full mr-3 text-sm transition cursor-pointer text-left ${
                  activeView === "to_review"
                    ? "bg-[#D3E3FD] text-[#041E49] font-semibold"
                    : "text-[#444746] hover:bg-slate-100/80 font-medium"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <FolderKanban
                    className={`w-5 h-5 shrink-0 ${
                      activeView === "to_review"
                        ? "text-[#041E49]"
                        : "text-[#444746]"
                    }`}
                  />
                  <span>To review</span>
                </div>
                {typeof pendingReviewCount === "number" && pendingReviewCount > 0 && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      activeView === "to_review"
                        ? "bg-[#0B57D0] text-white"
                        : "bg-blue-100 text-[#0B57D0]"
                    }`}
                  >
                    {pendingReviewCount}
                  </span>
                )}
              </button>

              {/* Dynamic Class Items */}
              {classes.map((cls) => {
                const isSelected =
                  activeView === cls.id ||
                  (activeView === "matematika" && cls.id === "mat-8");
                const initial = cls.name.charAt(0).toUpperCase() || "K";

                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => onSelectView(cls.id)}
                    className={`w-full flex items-center gap-3.5 pl-12 pr-6 py-2.5 rounded-r-full mr-3 text-sm transition cursor-pointer text-left ${
                      isSelected
                        ? "bg-[#D3E3FD] text-[#041E49] font-semibold"
                        : "text-[#444746] hover:bg-slate-100/80 font-medium"
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white"
                      style={{
                        backgroundColor: cls.themeColor || "#1967D2",
                      }}
                    >
                      {initial}
                    </div>
                    <span className="truncate">{cls.name}</span>
                  </button>
                );
              })}

              {/* Quick "Buat Kelas Baru" button under Teaching */}
              {onCreateClassClick && (
                <button
                  type="button"
                  onClick={onCreateClassClick}
                  className="w-full flex items-center gap-3 pl-12 pr-6 py-2 rounded-r-full mr-3 text-xs font-semibold text-[#0B57D0] hover:bg-blue-50/70 transition cursor-pointer text-left"
                >
                  <Plus className="w-4 h-4 shrink-0 text-[#0B57D0]" />
                  <span>Buat Kelas Baru</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-slate-200" />

      {/* 4. Bottom Items: Archived classes & Settings */}
      <div className="space-y-1 mt-auto pb-4">
        <button
          type="button"
          onClick={() => onSelectView("archived")}
          className={`w-full flex items-center justify-between px-6 py-2.5 rounded-r-full mr-3 text-sm font-medium transition cursor-pointer text-left ${
            activeView === "archived"
              ? "bg-[#D3E3FD] text-[#041E49] font-semibold"
              : "text-[#444746] hover:bg-slate-100/80"
          }`}
        >
          <div className="flex items-center gap-4">
            <Archive
              className={`w-5 h-5 shrink-0 ${
                activeView === "archived" ? "text-[#041E49]" : "text-[#444746]"
              }`}
            />
            <span>Archived classes</span>
          </div>
          {archivedCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {archivedCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectView("settings")}
          className={`w-full flex items-center gap-4 px-6 py-2.5 rounded-r-full mr-3 text-sm font-medium transition cursor-pointer text-left ${
            activeView === "settings"
              ? "bg-[#D3E3FD] text-[#041E49] font-semibold"
              : "text-[#444746] hover:bg-slate-100/80"
          }`}
        >
          <Settings
            className={`w-5 h-5 shrink-0 ${
              activeView === "settings" ? "text-[#041E49]" : "text-[#444746]"
            }`}
          />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}

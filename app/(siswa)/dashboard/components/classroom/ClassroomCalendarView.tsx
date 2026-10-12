"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { CalendarWeekItem, AgendaAkademikItem, ScheduleItem } from "../../types";

interface ClassroomCalendarViewProps {
  calendarWeeks: CalendarWeekItem[];
  agendasData: AgendaAkademikItem[];
  schedulesData?: ScheduleItem[];
  onBackToHome: () => void;
}

export default function ClassroomCalendarView({
  calendarWeeks,
  agendasData,
  schedulesData = [],
  onBackToHome,
}: ClassroomCalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Flatten days from weeks
  const allDays = calendarWeeks.flatMap((w) => w.days);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Kalender Akademik & Jadwal (Calendar)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau agenda ulangan semester, jadwal kelas tatap muka, dan aktivitas sekolah.
          </p>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Oktober 2026 • Semester Ganjil
          </h2>
          <div className="text-xs text-slate-500 font-medium">
            Tahun Ajaran 2026/2027
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div>Sen</div>
          <div>Sel</div>
          <div>Rab</div>
          <div>Kam</div>
          <div>Jum</div>
          <div className="text-amber-500">Sab</div>
          <div className="text-rose-500">Min</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {allDays.slice(0, 35).map((d, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDay(d.day)}
              className={`p-3 rounded-2xl min-h-[72px] sm:min-h-[85px] flex flex-col justify-between text-left transition border cursor-pointer ${
                d.isToday
                  ? "bg-blue-50/80 border-blue-300 text-blue-900 ring-2 ring-blue-500/20"
                  : selectedDay === d.day
                  ? "bg-slate-100 border-slate-300 text-slate-900"
                  : d.isCurrentMonth
                  ? "bg-white hover:bg-slate-50 border-slate-150 text-slate-800"
                  : "bg-slate-50/40 border-transparent text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-bold ${d.isToday ? "text-[#1967D2]" : ""}`}>
                  {d.day}
                </span>
                {d.isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </div>

              {d.schedule && (
                <div className="w-full text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded truncate">
                  {d.schedule.bab}
                </div>
              )}

              {d.agendas && d.agendas.length > 0 && (
                <div className="w-full text-[10px] font-bold text-purple-700 bg-purple-100/70 px-1.5 py-0.5 rounded truncate">
                  {d.agendas[0].judul}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Agendas List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Agenda Akademik Bulan Ini ({agendasData.length} Agenda)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {agendasData.map((ag) => (
            <div
              key={ag.id}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-xs sm:text-sm text-slate-800">
                  {ag.judul}
                </div>
                <div className="text-[11px] text-slate-500">
                  Tanggal: {ag.tanggal} {ag.jam_mulai ? `• ${ag.jam_mulai} WIB` : ""}
                </div>
                {ag.deskripsi && (
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    {ag.deskripsi}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

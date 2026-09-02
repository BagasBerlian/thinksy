"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface ScheduleItem {
  id: string;
  subject: string;
  teacher: string;
  day: string;
  startTime: string;
  endTime: string;
  time: string;
  room: string;
}

interface ScheduleClientProps {
  userProfile: {
    nama_lengkap: string;
    email: string;
  };
  initialSchedules: ScheduleItem[];
}

export default function ScheduleClient({
  userProfile,
  initialSchedules,
}: ScheduleClientProps) {
  const [viewMode, setViewMode] = useState<"today" | "week">("today");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Helper to determine real-time WIB status of schedule
  const getScheduleStatus = (item: ScheduleItem) => {
    if (!now) return { status: "BELUM DIMULAI", label: "Belum Dimulai", badgeClass: "bg-slate-100 text-slate-600 border-slate-200" };

    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTotalMin = currentHour * 60 + currentMin;

    const [startH, startM] = item.startTime.split(":").map(Number);
    const [endH, endM] = item.endTime.split(":").map(Number);

    const startTotalMin = startH * 60 + (startM || 0);
    const endTotalMin = endH * 60 + (endM || 0);

    if (currentTotalMin >= startTotalMin && currentTotalMin < endTotalMin) {
      const remainingMin = endTotalMin - currentTotalMin;
      return {
        status: "SEDANG BERLANGSUNG",
        label: `🟢 Sedang Berlangsung (${remainingMin}m tersisa)`,
        badgeClass: "bg-emerald-500 text-white shadow-sm font-bold border-emerald-400 animate-pulse",
        isLive: true,
      };
    } else if (currentTotalMin < startTotalMin) {
      const diffMin = startTotalMin - currentTotalMin;
      if (diffMin <= 60) {
        return {
          status: "BERIKUTNYA",
          label: `🔵 Akan dimulai dalam ${diffMin} menit`,
          badgeClass: "bg-blue-500 text-white shadow-xs font-bold border-blue-400",
          isNext: true,
        };
      }
      return {
        status: "BELUM DIMULAI",
        label: `⚪ Belum Dimulai`,
        badgeClass: "bg-slate-100 text-slate-600 border-slate-200 font-semibold",
      };
    } else {
      return {
        status: "SELESAI",
        label: `✓ Selesai`,
        badgeClass: "bg-slate-200 text-slate-500 font-medium",
      };
    }
  };

  const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl overflow-hidden shadow-xs border border-slate-200 bg-white flex items-center justify-center p-0.5">
                <img src="/logo.png" alt="Thinksy Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-[#0F172A] tracking-tight">
                  Jadwal Saya
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Lihat agenda pembelajaran terintegrasi Thinksy
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-8 space-y-6">
        {/* Toggle Mode Banner */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Real-time Schedule Sync
            </span>
            <h2 className="text-xl font-extrabold text-[#0F172A]">
              Agenda Pembelajaran Sekolah
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Jadwal terhubung langsung dengan kelola kelas Guru & Admin Sekolah.
            </p>
          </div>

          {/* Toggle View Buttons */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setViewMode("today")}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === "today"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              [ Hari Ini ]
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === "week"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              [ Minggu Ini ]
            </button>
          </div>
        </div>

        {/* View Mode: Today Timeline */}
        {viewMode === "today" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-500" /> Timeline Hari Ini
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                {now ? now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Hari Ini"}
              </span>
            </div>

            {initialSchedules.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-600">Belum ada jadwal untuk hari ini.</p>
                <p className="text-xs text-slate-400 mt-1">Nikmati waktu luangmu atau buat catatan di My Notes!</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pl-6 sm:pl-8 py-2">
                {initialSchedules.map((item) => {
                  const statusObj = getScheduleStatus(item);
                  return (
                    <div key={item.id} className="relative group">
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-4 border-white shadow-xs ${
                          statusObj.isLive
                            ? "bg-emerald-500 ring-4 ring-emerald-100"
                            : statusObj.isNext
                            ? "bg-blue-500 ring-4 ring-blue-100"
                            : "bg-slate-300"
                        }`}
                      />

                      {/* Content Card */}
                      <div
                        className={`p-5 rounded-2xl border transition duration-200 ${
                          statusObj.isLive
                            ? "bg-emerald-50/40 border-emerald-300 shadow-sm ring-1 ring-emerald-400/30"
                            : statusObj.isNext
                            ? "bg-blue-50/30 border-blue-200 shadow-xs"
                            : "bg-slate-50/60 border-slate-200/80"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-extrabold text-[#0F172A] bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                              {item.time}
                            </span>
                            <span
                              className={`text-[11px] px-2.5 py-0.5 rounded-full border ${statusObj.badgeClass}`}
                            >
                              {statusObj.label}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-lg font-bold text-[#0F172A] tracking-tight">
                          {item.subject}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-600 font-medium">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span>Guru: <strong>{item.teacher}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>Ruangan: <strong>{item.room}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* View Mode: Week Grid */}
        {viewMode === "week" && (
          <div className="space-y-6">
            {daysOfWeek.map((dayName) => {
              const daySchedules = initialSchedules.filter(
                (s) => s.day.toLowerCase() === dayName.toLowerCase()
              );
              return (
                <div
                  key={dayName}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-amber-500" /> {dayName}
                    </h3>
                    <span className="text-xs font-bold text-slate-400">
                      {daySchedules.length} Sesi Terjadwal
                    </span>
                  </div>

                  {daySchedules.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">Tidak ada kelas terjadwal untuk hari {dayName}.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {daySchedules.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition"
                        >
                          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#0F172A] mb-2">
                            <span>{item.time}</span>
                            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                              {item.room}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#0F172A]">{item.subject}</h4>
                          <p className="text-xs text-slate-500 mt-1">Guru: {item.teacher}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

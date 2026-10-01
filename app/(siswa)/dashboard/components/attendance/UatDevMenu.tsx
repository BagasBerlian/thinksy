"use client";

import { useState, useEffect } from "react";
import {
  Timer,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Clock,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

interface UatDevMenuProps {
  mockTime: string | null;
  setMockTime: (time: string | null) => void;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function UatDevMenu({
  mockTime,
  setMockTime,
  isOpen = false,
  setIsOpen,
}: UatDevMenuProps) {
  const [mounted, setMounted] = useState(false);
  // Default to minimized if stored in localStorage, otherwise check isOpen prop
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [customTime, setCustomTime] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("thinksy_uat_minimized");
      if (stored !== null) {
        setIsMinimized(stored === "true");
      } else {
        // If not stored yet, default to minimized if no mock time is active
        setIsMinimized(!Boolean(mockTime));
      }
    } catch {
      setIsMinimized(true);
    }
  }, [mockTime]);

  if (!mounted) {
    return null;
  }

  const currentRealTime = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleTimeChange = (newVal: string | null) => {
    setMockTime(newVal);
    try {
      if (newVal) {
        localStorage.setItem("thinksy_mock_time", newVal);
      } else {
        localStorage.removeItem("thinksy_mock_time");
      }
      window.dispatchEvent(new Event("thinksy_mock_time_change"));
    } catch {}
  };

  const handleToggleMinimize = (minimized: boolean) => {
    setIsMinimized(minimized);
    if (setIsOpen) {
      setIsOpen(!minimized);
    }
    try {
      localStorage.setItem("thinksy_uat_minimized", String(minimized));
    } catch {}
  };

  const handleApplyCustomTime = () => {
    if (customTime.trim()) {
      handleTimeChange(customTime.trim());
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 font-sans select-none">
      {/* ─── KONDISI 1: MINIMIZED (TIDAK MENGHALANGI PANDANGAN) ─── */}
      {isMinimized ? (
        <button
          type="button"
          onClick={() => handleToggleMinimize(false)}
          className={`group flex items-center gap-2 px-3 py-2 rounded-full border shadow-xl backdrop-blur-md transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
            mockTime
              ? "bg-amber-950/90 text-amber-200 border-amber-500/60 shadow-amber-950/40 ring-2 ring-amber-400/30"
              : "bg-[#0F172A]/90 hover:bg-[#0F172A] text-slate-200 border-slate-700/80 hover:border-slate-500 shadow-slate-950/50"
          }`}
          title="Klik untuk membuka Pengaturan Simulasi Jam Presensi (UAT)"
        >
          <div className="relative flex items-center justify-center">
            <Timer
              className={`w-4 h-4 shrink-0 transition-transform group-hover:rotate-12 ${
                mockTime ? "text-amber-400 animate-pulse" : "text-emerald-400"
              }`}
            />
            <span
              className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                mockTime ? "bg-amber-400 animate-ping" : "bg-emerald-400"
              }`}
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {mockTime ? (
              <>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  UAT:
                </span>
                <span className="text-white font-extrabold">{mockTime} WIB</span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-medium text-slate-300">UAT Jam</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({currentRealTime})
                </span>
              </>
            )}
          </div>

          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors ml-0.5" />
        </button>
      ) : (
        /* ─── KONDISI 2: EXPANDED (MENU PENGATURAN JAM LENGKAP) ─── */
        <div className="bg-[#0F172A]/95 text-white backdrop-blur-md border border-slate-700/90 rounded-2xl shadow-2xl p-3.5 flex flex-col gap-3 text-xs w-77.5 sm:w-85 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* Header Card dengan Tombol Minimize */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Timer className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-xs leading-none">
                  UAT Simulasi Presensi
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Uji coba status kehadiran siswa
                </p>
              </div>
            </div>

            {/* Tombol Minimize */}
            <button
              type="button"
              onClick={() => handleToggleMinimize(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Minimize panel UAT agar tidak menghalangi pandangan"
            >
              <span>Minimize</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Preset Waktu Presensi */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pilih Skenario Waktu:
            </label>
            <select
              value={mockTime || ""}
              onChange={(e) => handleTimeChange(e.target.value || null)}
              suppressHydrationWarning
              className="w-full bg-slate-800/90 hover:bg-slate-800 text-white font-medium text-xs rounded-xl px-2.5 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer transition-colors"
            >
              <option value="" suppressHydrationWarning>
                🕒 Waktu Nyata Sekarang ({currentRealTime} WIB)
              </option>
              <option value="06:30">
                🟢 06:30 WIB (Tepat Waktu • +10 Poin)
              </option>
              <option value="07:15">
                🟡 07:15 WIB (Batas Tepat Waktu • +10 Poin)
              </option>
              <option value="07:45">
                🟠 07:45 WIB (Terlambat • +3 Poin)
              </option>
              <option value="08:15">
                🔴 08:15 WIB (Lewat Batas Akhir • Alpha)
              </option>
            </select>
          </div>

          {/* Custom Time Input (Opsional) */}
          <div className="pt-1 flex items-center gap-1.5">
            <div className="relative flex-1">
              <Clock className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Custom jam (HH:mm)..."
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyCustomTime()}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-2 py-1 text-[11px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyCustomTime}
              disabled={!customTime.trim()}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-[10px] transition-colors cursor-pointer disabled:pointer-events-none"
            >
              Set
            </button>
          </div>

          {/* Status Bar & Reset Button */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
            {mockTime ? (
              <>
                <span className="flex items-center gap-1.5 text-amber-300 font-extrabold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Simulasi: {mockTime} WIB
                </span>
                <button
                  type="button"
                  onClick={() => handleTimeChange(null)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white hover:underline text-[10px] font-semibold cursor-pointer transition-colors"
                  title="Kembalikan jam ke waktu nyata lokal"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Nyata
                </button>
              </>
            ) : (
              <span className="text-slate-400 text-[10px] flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Menggunakan jam nyata perangkat
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

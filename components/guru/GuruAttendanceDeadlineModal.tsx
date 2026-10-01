"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Bell,
  Sparkles,
  Info,
  RotateCcw,
} from "lucide-react";

interface GuruAttendanceDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function GuruAttendanceDeadlineModal({
  isOpen,
  onClose,
  onSaved,
}: GuruAttendanceDeadlineModalProps) {
  const [mode, setMode] = useState<"sementara" | "selamanya">("selamanya");

  const [schedule, setSchedule] = useState({
    senin: "07:30",
    selasa: "07:30",
    rabu: "07:30",
    kamis: "07:30",
    jumat: "07:15",
  });

  const [jamMasuk, setJamMasuk] = useState("07:00");
  const [jamTerlambat, setJamTerlambat] = useState("07:15");
  const [broadcastNotif, setBroadcastNotif] = useState(true);

  const [todayDeadline, setTodayDeadline] = useState("07:30");
  const [todayStr, setTodayStr] = useState("");
  const [needsReconfig, setNeedsReconfig] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/guru/presensi-deadline");
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setMode(data.config.mode || "selamanya");
            if (data.config.schedule) {
              setSchedule(data.config.schedule);
            }
            if (data.config.jam_masuk) setJamMasuk(data.config.jam_masuk);
            if (data.config.jam_terlambat) setJamTerlambat(data.config.jam_terlambat);
          }
          setTodayDeadline(data.todayDeadline || "07:30");
          setTodayStr(data.todayStr || new Date().toISOString().split("T")[0]);
          setNeedsReconfig(Boolean(data.needsReconfiguration));
        }
      } catch {
        // silent fallback
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/guru/presensi-deadline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          schedule,
          jam_masuk: jamMasuk,
          jam_terlambat: jamTerlambat,
          broadcastNotif,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          text: `${data.message} ${
            data.notifiedStudentsCount > 0
              ? `(Notifikasi terkirim ke ${data.notifiedStudentsCount} akun siswa di Supabase)`
              : ""
          }`,
        });
        if (onSaved) onSaved();
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setStatusMessage({
          text: data.error || "Gagal menyimpan pengaturan absensi.",
          isError: true,
        });
      }
    } catch {
      setStatusMessage({ text: "Terjadi kesalahan koneksi.", isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-amber-400 flex items-center justify-center font-black shadow-md">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                  KONTROL ABSENSI SEKOLAH
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Sinkronisasi Otomatis Supabase
                </span>
              </div>
              <h2 className="text-lg font-black text-[#0F172A] mt-0.5">
                Pengaturan Waktu & Tenggat Absensi Siswa
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Tentukan jam batas akhir presensi harian serta otomatis siarkan notifikasi tenggat ke seluruh siswa.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <span className="text-xs font-bold">Memuat konfigurasi absensi...</span>
            </div>
          ) : (
            <>
              {needsReconfig && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <div className="font-black">Setelan Sementara Kemarin Telah Berakhir</div>
                    <p className="font-medium text-amber-800">
                      Karena sebelumnya disetel sebagai <strong>"Sementara"</strong>, Anda perlu mengatur ulang jam tenggat presensi hari ini.
                    </p>
                  </div>
                </div>
              )}

              {statusMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 ${
                    statusMessage.isError
                      ? "bg-rose-50 border border-rose-200 text-rose-800"
                      : "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  }`}
                >
                  {statusMessage.isError ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* 1. Mode Stelan: Sementara vs Selamanya */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>1. Masa Berlaku Pengaturan</span>
                  <span className="text-[10px] text-slate-400">Pilih Mode</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option: Sementara */}
                  <div
                    onClick={() => setMode("sementara")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      mode === "sementara"
                        ? "bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/40 shadow-xs"
                        : "bg-white hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        mode === "sementara"
                          ? "border-amber-600 bg-amber-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {mode === "sementara" && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#0F172A] flex items-center gap-1.5">
                        <span>Sementara (Hari Ini Saja)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                        Hanya berlaku hari ini ({todayStr}). Besok guru harus mengatur ulang jam tenggat absen siswa.
                      </p>
                    </div>
                  </div>

                  {/* Option: Selamanya */}
                  <div
                    onClick={() => setMode("selamanya")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      mode === "selamanya"
                        ? "bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-400/40 shadow-xs"
                        : "bg-white hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        mode === "selamanya"
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {mode === "selamanya" && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#0F172A] flex items-center gap-1.5">
                        <span>Selamanya (Senin s/d Jumat)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                        Otomatis berlaku permanen setiap hari Senin hingga Jumat. Tidak perlu atur ulang setiap hari.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Jadwal Jam Tenggat Per Hari (Senin - Jumat) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800">
                    2. Jam Batas Akhir (Tenggat) Absen Setiap Hari
                  </label>
                  <span className="text-[11px] font-bold text-slate-400">Format 24 Jam (WIB)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { key: "senin", label: "Senin" },
                    { key: "selasa", label: "Selasa" },
                    { key: "rabu", label: "Rabu" },
                    { key: "kamis", label: "Kamis" },
                    { key: "jumat", label: "Jumat" },
                  ].map((day) => (
                    <div
                      key={day.key}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-center"
                    >
                      <div className="text-[11px] font-black text-slate-700">{day.label}</div>
                      <input
                        type="time"
                        value={(schedule as any)[day.key]}
                        onChange={(e) =>
                          setSchedule((prev) => ({
                            ...prev,
                            [day.key]: e.target.value,
                          }))
                        }
                        required
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="text-[9px] text-slate-400 font-semibold">Tenggat Tutup</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Parameter Pendukung: Jam Masuk & Terlambat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                    <span>Jam Buka Presensi (Masuk)</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Tepat Waktu (+10 Poin)
                    </span>
                  </label>
                  <input
                    type="time"
                    value={jamMasuk}
                    onChange={(e) => setJamMasuk(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                    <span>Mulai Terhitung Terlambat</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Terlambat (+3 Poin)
                    </span>
                  </label>
                  <input
                    type="time"
                    value={jamTerlambat}
                    onChange={(e) => setJamTerlambat(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* 4. Checkbox Siarkan Notifikasi Otomatis ke Siswa */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={broadcastNotif}
                    onChange={(e) => setBroadcastNotif(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-blue-600" />
                      <span>Otomatis Kirim Notifikasi Tenggat ke Seluruh Siswa di Database</span>
                    </div>
                    <p className="text-[11px] text-blue-800/90 font-medium mt-0.5">
                      Di setiap akun siswa yang terdaftar di Supabase akan muncul notifikasi waktu batas akhir presensi hari ini.
                    </p>
                  </div>
                </label>

                {/* Preview Notifikasi Siswa */}
                {broadcastNotif && (
                  <div className="mt-2.5 p-3 rounded-xl bg-white border border-blue-200 text-left space-y-1 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Pratinjau Notifikasi di Layar Siswa:
                    </div>
                    <div className="text-xs font-black text-[#0F172A] flex items-center gap-1.5">
                      <span>⏰ Batas Presensi Hari Ini Ditutup Pukul {schedule.senin} WIB</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Pemberitahuan Guru: Batas akhir presensi kehadiran siswa hari ini telah ditetapkan hingga pukul {schedule.senin} WIB ({mode === "sementara" ? "Pengaturan Sementara Hari Ini" : "Jadwal Tetap Senin s/d Jumat"}). Harap segera lakukan absensi kehadiran dan selfie sebelum waktu habis!
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="flex-2 py-3 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <Save className="w-4 h-4 text-amber-400" />
              )}
              <span>
                {isSaving
                  ? "Menyimpan & Menyiarkan Notifikasi..."
                  : `Simpan Pengaturan Absensi (${mode === "sementara" ? "Sementara" : "Selamanya"})`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

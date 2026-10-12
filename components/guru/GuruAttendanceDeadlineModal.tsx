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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 animate-in fade-in duration-100 font-mono text-zinc-900">
      <div className="relative w-full max-w-2xl bg-white border border-zinc-950 shadow-none overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-zinc-950 text-white flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-zinc-200 text-zinc-800 border border-zinc-300">
                  Kontrol Absensi
                </span>
                <span className="text-[10px] text-zinc-500">
                  Database Realtime
                </span>
              </div>
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-tight mt-0.5">
                Pengaturan Waktu & Tenggat Absensi Siswa
              </h2>
              <p className="text-[11px] text-zinc-500">
                Tentukan jam batas akhir presensi harian dan siarkan ke seluruh siswa.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-900 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-bold">Memuat konfigurasi absensi...</span>
            </div>
          ) : (
            <>
              {needsReconfig && (
                <div className="p-3 bg-zinc-100 border border-zinc-400 text-zinc-900 flex items-start gap-2.5">
                  <RotateCcw className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold uppercase text-[11px]">Setelan Sementara Telah Berakhir</div>
                    <p className="text-zinc-600">
                      Karena sebelumnya disetel sebagai <strong>"Sementara"</strong>, atur ulang jam tenggat presensi hari ini.
                    </p>
                  </div>
                </div>
              )}

              {statusMessage && (
                <div
                  className={`p-2.5 text-xs font-bold flex items-center gap-2 border ${
                    statusMessage.isError
                      ? "bg-red-50 border-red-300 text-red-800"
                      : "bg-zinc-100 border-zinc-950 text-zinc-950"
                  }`}
                >
                  {statusMessage.isError ? (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* 1. Mode Stelan: Sementara vs Selamanya */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-900 flex items-center justify-between">
                  <span>1. Masa Berlaku Pengaturan</span>
                  <span className="text-[10px] text-zinc-400">Pilih Mode</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option: Sementara */}
                  <div
                    onClick={() => setMode("sementara")}
                    className={`p-3 border transition cursor-pointer flex items-start gap-2.5 ${
                      mode === "sementara"
                        ? "bg-zinc-100 border-zinc-950"
                        : "bg-white hover:bg-zinc-50 border-zinc-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deadline_mode"
                      checked={mode === "sementara"}
                      onChange={() => setMode("sementara")}
                      className="mt-0.5 accent-zinc-950"
                    />
                    <div>
                      <div className="text-xs font-bold text-zinc-950">
                        Sementara (Hari Ini Saja)
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-0.5 leading-normal">
                        Hanya berlaku hari ini ({todayStr}). Besok kembali ke default.
                      </p>
                    </div>
                  </div>

                  {/* Option: Selamanya */}
                  <div
                    onClick={() => setMode("selamanya")}
                    className={`p-3 border transition cursor-pointer flex items-start gap-2.5 ${
                      mode === "selamanya"
                        ? "bg-zinc-100 border-zinc-950"
                        : "bg-white hover:bg-zinc-50 border-zinc-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deadline_mode"
                      checked={mode === "selamanya"}
                      onChange={() => setMode("selamanya")}
                      className="mt-0.5 accent-zinc-950"
                    />
                    <div>
                      <div className="text-xs font-bold text-zinc-950">
                        Selamanya (Senin - Jumat)
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-0.5 leading-normal">
                        Berlaku permanen setiap hari kerja. Tidak perlu diulang.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Jadwal Jam Tenggat Per Hari (Senin - Jumat) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-900">
                    2. Jam Batas Akhir (Tenggat) Absen Setiap Hari
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">Format 24 Jam WIB</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { key: "senin", label: "Senin" },
                    { key: "selasa", label: "Selasa" },
                    { key: "rabu", label: "Rabu" },
                    { key: "kamis", label: "Kamis" },
                    { key: "jumat", label: "Jumat" },
                  ].map((day) => (
                    <div
                      key={day.key}
                      className="p-2.5 bg-zinc-50 border border-zinc-200 space-y-1 text-center"
                    >
                      <div className="text-[11px] font-bold text-zinc-800 uppercase">{day.label}</div>
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
                        className="w-full px-1.5 py-1 bg-white border border-zinc-300 text-xs font-mono font-bold text-center text-zinc-900 focus:outline-none focus:border-zinc-950"
                      />
                      <div className="text-[9px] text-zinc-400">Tenggat Tutup</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Parameter Pendukung: Jam Masuk & Terlambat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 bg-zinc-50 border border-zinc-200 space-y-1">
                  <label className="text-xs font-bold text-zinc-900 flex items-center justify-between">
                    <span>Jam Buka Presensi (Masuk)</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-zinc-200 text-zinc-800 border border-zinc-300">
                      +10 Poin
                    </span>
                  </label>
                  <input
                    type="time"
                    value={jamMasuk}
                    onChange={(e) => setJamMasuk(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 bg-white border border-zinc-300 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div className="p-2.5 bg-zinc-50 border border-zinc-200 space-y-1">
                  <label className="text-xs font-bold text-zinc-900 flex items-center justify-between">
                    <span>Mulai Terhitung Terlambat</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-zinc-200 text-zinc-800 border border-zinc-300">
                      +3 Poin
                    </span>
                  </label>
                  <input
                    type="time"
                    value={jamTerlambat}
                    onChange={(e) => setJamTerlambat(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 bg-white border border-zinc-300 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:border-zinc-950"
                  />
                </div>
              </div>

              {/* 4. Checkbox Siarkan Notifikasi Otomatis ke Siswa */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={broadcastNotif}
                    onChange={(e) => setBroadcastNotif(e.target.checked)}
                    className="w-4 h-4 accent-zinc-950 mt-0.5 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-zinc-950 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-zinc-700" />
                      <span>Otomatis Kirim Notifikasi Tenggat ke Seluruh Siswa</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-0.5">
                      Setiap akun siswa di database menerima notifikasi waktu batas akhir presensi hari ini.
                    </p>
                  </div>
                </label>

                {/* Preview Notifikasi Siswa */}
                {broadcastNotif && (
                  <div className="p-2.5 bg-white border border-zinc-300 text-left space-y-1">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      Pratinjau Notifikasi Siswa:
                    </div>
                    <div className="text-xs font-bold text-zinc-950">
                      Batas Presensi Hari Ini Ditutup Pukul {schedule.senin} WIB
                    </div>
                    <p className="text-[10px] text-zinc-600">
                      Pemberitahuan Guru: Batas akhir presensi kehadiran siswa hari ini telah ditetapkan hingga pukul {schedule.senin} WIB ({mode === "sementara" ? "Pengaturan Sementara" : "Jadwal Tetap"}).
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
              className="flex-1 py-2 border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="flex-2 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>
                {isSaving
                  ? "Menyimpan..."
                  : `Simpan Pengaturan Absensi (${mode === "sementara" ? "Sementara" : "Selamanya"})`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

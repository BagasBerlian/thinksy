"use client";

import { useState, useEffect } from "react";
import { Clock, ShieldCheck, X, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface AttendanceLimitConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function AttendanceLimitConfigModal({
  isOpen,
  onClose,
  onSaved,
}: AttendanceLimitConfigModalProps) {
  const [jamMasuk, setJamMasuk] = useState("07:15");
  const [jamTerlambat, setJamTerlambat] = useState("07:30");
  const [jamTutup, setJamTutup] = useState("08:00");
  const [sekolahNama, setSekolahNama] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function loadCurrentLimits() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/sekolah/jam-presensi");
        if (res.ok) {
          const data = await res.json();
          if (data.sekolah) {
            setSekolahNama(data.sekolah.nama || "Sekolah");
            if (data.sekolah.jam_masuk) setJamMasuk(data.sekolah.jam_masuk.substring(0, 5));
            if (data.sekolah.jam_terlambat) setJamTerlambat(data.sekolah.jam_terlambat.substring(0, 5));
            if (data.sekolah.jam_tutup) setJamTutup(data.sekolah.jam_tutup.substring(0, 5));
          }
        }
      } catch {} finally {
        setIsLoading(false);
      }
    }

    loadCurrentLimits();
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/sekolah/jam-presensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jam_masuk: jamMasuk,
          jam_terlambat: jamTerlambat,
          jam_tutup: jamTutup,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage("Batas waktu presensi berhasil disimpan & disinkronkan ke seluruh siswa!");
        if (onSaved) onSaved();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setStatusMessage(data.error || "Gagal menyimpan perubahan");
      }
    } catch {
      setStatusMessage("Terjadi kesalahan koneksi");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-100 text-zinc-900">
      <div className="relative w-full max-w-md bg-white border border-zinc-950 shadow-none overflow-hidden font-mono">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 text-zinc-400 hover:text-zinc-900 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-zinc-950 text-white flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Kontrol Waktu Sekolah
              </span>
              <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-tight">
                Atur Batas Waktu Presensi
              </h3>
              <p className="text-[10px] text-zinc-500">
                {sekolahNama || "Sinkronisasi Realtime Database"}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 space-y-3">
          {isLoading ? (
            <div className="py-8 flex items-center justify-center gap-2 text-xs text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memuat data konfigurasi...</span>
            </div>
          ) : (
            <>
              {statusMessage && (
                <div
                  className={`p-2.5 text-xs font-bold flex items-center gap-2 border ${
                    statusMessage.includes("berhasil")
                      ? "bg-zinc-100 border-zinc-950 text-zinc-950"
                      : "bg-red-50 border-red-300 text-red-800"
                  }`}
                >
                  {statusMessage.includes("berhasil") ? (
                    <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{statusMessage}</span>
                </div>
              )}

              <div className="space-y-2.5">
                {/* 1. Jam Masuk (Tepat Waktu) */}
                <div className="p-2.5 bg-zinc-50 border border-zinc-200 space-y-1">
                  <label className="text-xs font-bold text-zinc-900 flex items-center justify-between">
                    <span>1. Jam Masuk (Tepat Waktu)</span>
                    <span className="text-[10px] text-zinc-800 bg-zinc-200 px-1.5 py-0.2 border border-zinc-300 font-bold">
                      +10 Poin Reward
                    </span>
                  </label>
                  <p className="text-[10px] text-zinc-500">
                    Siswa presensi sebelum jam ini tercatat Hadir Tepat Waktu.
                  </p>
                  <input
                    type="time"
                    value={jamMasuk}
                    onChange={(e) => setJamMasuk(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:border-zinc-950"
                  />
                </div>

                {/* 2. Jam Terlambat */}
                <div className="p-2.5 bg-zinc-50 border border-zinc-200 space-y-1">
                  <label className="text-xs font-bold text-zinc-900 flex items-center justify-between">
                    <span>2. Jam Terlambat</span>
                    <span className="text-[10px] text-zinc-800 bg-zinc-200 px-1.5 py-0.2 border border-zinc-300 font-bold">
                      +3 Poin Reward
                    </span>
                  </label>
                  <p className="text-[10px] text-zinc-500">
                    Siswa presensi antara Jam Masuk dan Jam Tutup tercatat Terlambat.
                  </p>
                  <input
                    type="time"
                    value={jamTerlambat}
                    onChange={(e) => setJamTerlambat(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:border-zinc-950"
                  />
                </div>

                {/* 3. Jam Tutup Presensi (Alpha) */}
                <div className="p-2.5 bg-zinc-50 border border-zinc-200 space-y-1">
                  <label className="text-xs font-bold text-zinc-900 flex items-center justify-between">
                    <span>3. Jam Tutup Presensi</span>
                    <span className="text-[10px] text-red-700 bg-red-50 px-1.5 py-0.2 border border-red-200 font-bold">
                      Status Alpha (Terkunci)
                    </span>
                  </label>
                  <p className="text-[10px] text-zinc-500">
                    Setelah jam ini, formulir presensi siswa dikunci otomatis dengan status Alpha.
                  </p>
                  <input
                    type="time"
                    value={jamTutup}
                    onChange={(e) => setJamTutup(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:border-zinc-950"
                  />
                </div>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

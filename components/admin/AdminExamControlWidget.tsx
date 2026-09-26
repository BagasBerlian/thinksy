"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  Unlock,
  Lock,
  Calendar,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Sliders,
  Sparkles,
} from "lucide-react";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";

interface CategoryControlState {
  isOn: boolean;
  durasiMenit: number;
  jamMulai: string;
  jamSelesai: string;
  isSaving: boolean;
}

export default function AdminExamControlWidget() {
  const [ulanganState, setUlanganState] = useState<CategoryControlState>({
    isOn: true,
    durasiMenit: 60,
    jamMulai: "07:30",
    jamSelesai: "14:00",
    isSaving: false,
  });

  const [ujianState, setUjianState] = useState<CategoryControlState>({
    isOn: true,
    durasiMenit: 90,
    jamMulai: "08:00",
    jamSelesai: "15:00",
    isSaving: false,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { broadcastEvent } = useRealtimeDashboard();

  // Load existing configuration from API
  const loadConfig = async () => {
    try {
      const res = await fetch("/api/admin/ujian/control");
      if (res.ok) {
        const data = await res.json();
        if (data.ulangan) {
          setUlanganState((prev) => ({
            ...prev,
            isOn: data.ulangan.isOn,
            durasiMenit: data.ulangan.durasi_menit || 60,
          }));
        }
        if (data.ujian) {
          setUjianState((prev) => ({
            ...prev,
            isOn: data.ujian.isOn,
            durasiMenit: data.ujian.durasi_menit || 90,
          }));
        }
      }
    } catch (err) {
      console.warn("Failed to load admin exam control status:", err);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4500);
  };

  // Toggle or Save Category
  const handleSaveCategory = async (
    category: "ulangan" | "ujian",
    targetState: CategoryControlState,
    overrideStatus?: boolean
  ) => {
    const isTargetOn = overrideStatus !== undefined ? overrideStatus : targetState.isOn;

    if (category === "ulangan") {
      setUlanganState((prev) => ({ ...prev, isSaving: true }));
    } else {
      setUjianState((prev) => ({ ...prev, isSaving: true }));
    }

    try {
      const now = new Date();
      const [startHour, startMin] = targetState.jamMulai.split(":").map(Number);
      const [endHour, endMin] = targetState.jamSelesai.split(":").map(Number);

      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour || 7, startMin || 30);
      const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour || 14, endMin || 0);

      const res = await fetch("/api/admin/ujian/control", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          status: isTargetOn ? "dipublikasi" : "ditutup",
          durasiMenit: targetState.durasiMenit,
          waktuMulai: startTime.toISOString(),
          waktuBerakhir: endTime.toISOString(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (category === "ulangan") {
          setUlanganState((prev) => ({ ...prev, isOn: isTargetOn }));
        } else {
          setUjianState((prev) => ({ ...prev, isOn: isTargetOn }));
        }

        // Broadcast to student and teacher dashboards
        broadcastEvent("EXAM_STATUS_CHANGED", {
          category,
          status: isTargetOn ? "dipublikasi" : "ditutup",
          durasi_menit: targetState.durasiMenit,
        });

        const label = category === "ulangan" ? "Ulangan Harian Siswa" : "Ujian Resmi (PTS) Siswa";
        showToast(
          isTargetOn
            ? `✅ Akses ${label} DIBUKA (ON) oleh Admin Sekolah! Durasi ${targetState.durasiMenit} Menit diterapkan.`
            : `🔒 Akses ${label} DITUTUP (OFF) oleh Admin Sekolah! Seluruh card siswa kini terkunci.`
        );
      } else {
        alert("Gagal memperbarui status asesmen: " + (data.error || "Kesalahan server"));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      if (category === "ulangan") {
        setUlanganState((prev) => ({ ...prev, isSaving: false }));
      } else {
        setUjianState((prev) => ({ ...prev, isSaving: false }));
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6 relative overflow-hidden">
      {/* Top Accent Gradient */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-[#0F172A] text-white text-xs font-bold flex items-center justify-between shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top duration-200">
          <span className="leading-relaxed">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-3 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-black uppercase tracking-wider mb-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Otoritas Master Admin Sekolah</span>
          </div>
          <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
            Kontrol Jadwal & Akses Ujian Siswa (2 Master Card)
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5 max-w-2xl">
            Admin Sekolah memegang kontrol sentral untuk mengatur kapan akses <strong className="text-emerald-700">ON</strong> atau <strong className="text-slate-700">OFF</strong> asesmen di Dashboard Siswa, serta menentukan jadwal jam dan durasi pengerjaan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Live Sync Siswa & Guru
          </span>
        </div>
      </div>

      {/* 2 MASTER CARDS FOR ADMIN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= CARD 1: KONTROL ULANGAN SISWA ================= */}
        <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/40 to-white p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Header Card */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-[#0F172A]">Ulangan Harian</h3>
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase">
                      Card 1 Siswa
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Evaluasi Formatif Terjadwal
                  </p>
                </div>
              </div>

              {/* Master Toggle ON / OFF */}
              <button
                type="button"
                onClick={() => handleSaveCategory("ulangan", ulanganState, !ulanganState.isOn)}
                disabled={ulanganState.isSaving}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-xs ${
                  ulanganState.isOn
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300"
                }`}
              >
                {ulanganState.isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : ulanganState.isOn ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>AKSES SISWA: ON</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>AKSES SISWA: OFF</span>
                  </>
                )}
              </button>
            </div>

            {/* Status Notice */}
            <div
              className={`p-3 rounded-2xl border text-xs leading-relaxed font-semibold flex items-center gap-2.5 ${
                ulanganState.isOn
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                  : "bg-slate-100 border-slate-200 text-slate-600"
              }`}
            >
              {ulanganState.isOn ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                  <span>Card Ulangan di dashboard siswa <strong>DAPAT DIAKSES</strong> (Siswa bisa memilih mapel dan input token).</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Card Ulangan di dashboard siswa <strong>TERKUNCI (OFF)</strong>. Siswa tidak bisa mengklik card ini.</span>
                </>
              )}
            </div>

            {/* Form Pengaturan Waktu & Jadwal */}
            <div className="space-y-3 pt-2 border-t border-indigo-100">
              <span className="text-xs font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Pengaturan Waktu & Jadwal Ulangan
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Jam Mulai */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Jam Mulai</label>
                  <input
                    type="time"
                    value={ulanganState.jamMulai}
                    onChange={(e) =>
                      setUlanganState((prev) => ({ ...prev, jamMulai: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Jam Selesai */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Jam Selesai</label>
                  <input
                    type="time"
                    value={ulanganState.jamSelesai}
                    onChange={(e) =>
                      setUlanganState((prev) => ({ ...prev, jamSelesai: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Durasi Pengerjaan */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Durasi (Menit)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={10}
                      max={180}
                      value={ulanganState.durasiMenit}
                      onChange={(e) =>
                        setUlanganState((prev) => ({
                          ...prev,
                          durasiMenit: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 pl-7 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500"
                    />
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Save Button */}
          <div className="pt-3 border-t border-indigo-100">
            <button
              type="button"
              onClick={() => handleSaveCategory("ulangan", ulanganState)}
              disabled={ulanganState.isSaving}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {ulanganState.isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menerapkan Perubahan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Simpan & Terapkan ke Dashboard Siswa</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ================= CARD 2: KONTROL UJIAN RESMI SISWA ================= */}
        <div className="rounded-3xl border border-slate-300 bg-gradient-to-b from-slate-50 to-white p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Header Card */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-bold shadow-xs">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-[#0F172A]">Ujian Resmi (PTS)</h3>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-800 text-[10px] font-black uppercase">
                      Card 2 Siswa
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Asesmen Sumatif Terstandar
                  </p>
                </div>
              </div>

              {/* Master Toggle ON / OFF */}
              <button
                type="button"
                onClick={() => handleSaveCategory("ujian", ujianState, !ujianState.isOn)}
                disabled={ujianState.isSaving}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-xs ${
                  ujianState.isOn
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300"
                }`}
              >
                {ujianState.isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : ujianState.isOn ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>AKSES SISWA: ON</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>AKSES SISWA: OFF</span>
                  </>
                )}
              </button>
            </div>

            {/* Status Notice */}
            <div
              className={`p-3 rounded-2xl border text-xs leading-relaxed font-semibold flex items-center gap-2.5 ${
                ujianState.isOn
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                  : "bg-slate-100 border-slate-200 text-slate-600"
              }`}
            >
              {ujianState.isOn ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                  <span>Card Ujian Resmi di dashboard siswa <strong>DAPAT DIAKSES</strong> (Siswa bisa memilih mapel dan input token).</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Card Ujian Resmi di dashboard siswa <strong>TERKUNCI (OFF)</strong>. Siswa tidak bisa mengklik card ini.</span>
                </>
              )}
            </div>

            {/* Form Pengaturan Waktu & Jadwal */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <span className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Pengaturan Waktu & Jadwal Ujian PTS
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Jam Mulai */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Jam Mulai</label>
                  <input
                    type="time"
                    value={ujianState.jamMulai}
                    onChange={(e) =>
                      setUjianState((prev) => ({ ...prev, jamMulai: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Jam Selesai */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Jam Selesai</label>
                  <input
                    type="time"
                    value={ujianState.jamSelesai}
                    onChange={(e) =>
                      setUjianState((prev) => ({ ...prev, jamSelesai: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Durasi Pengerjaan */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Durasi (Menit)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={10}
                      max={240}
                      value={ujianState.durasiMenit}
                      onChange={(e) =>
                        setUjianState((prev) => ({
                          ...prev,
                          durasiMenit: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 pl-7 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:ring-1 focus:ring-blue-500"
                    />
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Save Button */}
          <div className="pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => handleSaveCategory("ujian", ujianState)}
              disabled={ujianState.isSaving}
              className="w-full py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {ujianState.isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menerapkan Perubahan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Simpan & Terapkan ke Dashboard Siswa</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

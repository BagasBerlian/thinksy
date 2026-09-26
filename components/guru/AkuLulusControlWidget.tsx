"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Clock,
  FileText,
  Radio,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Eye,
  Sliders,
  Sparkles,
  Key,
  Copy,
  Check,
  Edit2,
  BookOpen,
  PlusCircle,
} from "lucide-react";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";

export interface ExamControlItem {
  id: string;
  judul: string;
  tipe: "ulangan" | "ujian";
  mapel: string;
  durasi_menit: number;
  passing_grade: number;
  status: "dipublikasi" | "ditutup" | string;
  token?: string;
}

const DEFAULT_EXAMS: ExamControlItem[] = [
  {
    id: "e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    judul: "Ulangan Harian 1: Bilangan Berpangkat & Aljabar",
    tipe: "ulangan",
    mapel: "Matematika",
    durasi_menit: 60,
    passing_grade: 75,
    status: "dipublikasi",
    token: "MTK-ULG26",
  },
  {
    id: "e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    judul: "Ulangan Harian: Teks LHO & Kalimat Efektif",
    tipe: "ulangan",
    mapel: "Bahasa Indonesia",
    durasi_menit: 60,
    passing_grade: 75,
    status: "dipublikasi",
    token: "IND-ULG26",
  },
  {
    id: "e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
    judul: "Ulangan Harian: Descriptive Text & Daily Routines",
    tipe: "ulangan",
    mapel: "Bahasa Inggris",
    durasi_menit: 60,
    passing_grade: 75,
    status: "dipublikasi",
    token: "ENG-ULG26",
  },
  {
    id: "e5eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
    judul: "Penilaian Tengah Semester (PTS) Matematika Terpadu",
    tipe: "ujian",
    mapel: "Matematika",
    durasi_menit: 90,
    passing_grade: 75,
    status: "dipublikasi",
    token: "MTK-PTS26",
  },
  {
    id: "e6eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
    judul: "Penilaian Tengah Semester (PTS) Bahasa Indonesia",
    tipe: "ujian",
    mapel: "Bahasa Indonesia",
    durasi_menit: 90,
    passing_grade: 75,
    status: "dipublikasi",
    token: "IND-PTS26",
  },
  {
    id: "e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    judul: "Penilaian Tengah Semester (PTS) Bahasa Inggris",
    tipe: "ujian",
    mapel: "Bahasa Inggris",
    durasi_menit: 90,
    passing_grade: 75,
    status: "dipublikasi",
    token: "ENG-PTS26",
  },
];

export default function AkuLulusControlWidget() {
  const [exams, setExams] = useState<ExamControlItem[]>(DEFAULT_EXAMS);
  const [selectedMapelUlangan, setSelectedMapelUlangan] = useState<string>("Matematika");
  const [selectedMapelUjian, setSelectedMapelUjian] = useState<string>("Matematika");

  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Token State
  const [editingTokenExamId, setEditingTokenExamId] = useState<string | null>(null);
  const [tempTokenValue, setTempTokenValue] = useState<string>("");
  const [isSavingToken, setIsSavingToken] = useState<boolean>(false);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Edit Duration State
  const [editingDurationExamId, setEditingDurationExamId] = useState<string | null>(null);
  const [tempDurationValue, setTempDurationValue] = useState<number>(60);
  const [isSavingDuration, setIsSavingDuration] = useState<boolean>(false);

  const { broadcastEvent } = useRealtimeDashboard((event) => {
    if (event.type === "EXAM_STATUS_CHANGED" && event.payload) {
      const { ujianId, status, token, durasi_menit } = event.payload;
      setExams((prev) =>
        prev.map((e) => {
          if (e.id === ujianId) {
            return {
              ...e,
              ...(status ? { status } : {}),
              ...(token ? { token } : {}),
              ...(durasi_menit ? { durasi_menit } : {}),
            };
          }
          return e;
        })
      );
    }
  });

  // Fetch all exams from DB
  const loadExams = async () => {
    try {
      const res = await fetch("/api/guru/ujian");
      if (res.ok) {
        const data = await res.json();
        if (data.exams && data.exams.length > 0) {
          const apiExams: any[] = data.exams;
          setExams((prev) => {
            const mapped = DEFAULT_EXAMS.map((def) => {
              const found = apiExams.find(
                (x) => x.id === def.id || (x.mapel === def.mapel && x.tipe === def.tipe)
              );
              if (found) {
                return {
                  id: found.id,
                  judul: found.judul,
                  tipe: found.tipe || def.tipe,
                  mapel: found.mapel || def.mapel,
                  durasi_menit: found.durasi_menit || def.durasi_menit,
                  passing_grade: found.passing_grade || def.passing_grade,
                  status: found.status || def.status,
                  token: found.token || def.token,
                };
              }
              return def;
            });
            return mapped;
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch exams from API, using default list:", err);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  // Handle ON / OFF Toggle
  const handleToggle = async (item: ExamControlItem) => {
    const isCurrentlyOpen = item.status === "dipublikasi";
    const nextStatus = isCurrentlyOpen ? "ditutup" : "dipublikasi";

    setLoadingIds((prev) => ({ ...prev, [item.id]: true }));

    // Optimistic UI update
    setExams((prev) =>
      prev.map((e) => (e.id === item.id ? { ...e, status: nextStatus } : e))
    );

    try {
      const res = await fetch("/api/guru/ujian", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ujianId: item.id, status: nextStatus }),
      });

      if (res.ok) {
        broadcastEvent("EXAM_STATUS_CHANGED", {
          ujianId: item.id,
          status: nextStatus,
          mapel: item.mapel,
          tipe: item.tipe,
        });

        const label = item.tipe === "ulangan" ? "Ulangan Harian" : "Ujian PTS";
        showToast(
          nextStatus === "dipublikasi"
            ? `✅ Akses ${label} (${item.mapel}) DIBUKA (ON)! Siswa sekarang bisa mengakses soal.`
            : `🔒 Akses ${label} (${item.mapel}) DITUTUP (OFF)! Card siswa terkunci.`
        );
      } else {
        setExams((prev) =>
          prev.map((e) => (e.id === item.id ? { ...e, status: item.status } : e))
        );
        alert("Gagal mengubah status ujian. Silakan coba lagi.");
      }
    } catch (err: any) {
      setExams((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, status: item.status } : e))
      );
      alert("Terjadi kesalahan jaringan: " + err.message);
    } finally {
      setLoadingIds((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  // Handle Token Copy
  const handleCopyToken = (examId: string, token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedTokenId(examId);
    showToast(`📋 Token [${token}] berhasil disalin ke clipboard! Bagikan kode ini ke siswa.`);
    setTimeout(() => {
      setCopiedTokenId(null);
    }, 2500);
  };

  // Handle Token Edit
  const startEditingToken = (item: ExamControlItem) => {
    setEditingTokenExamId(item.id);
    setTempTokenValue(item.token || "");
  };

  const saveTokenEdit = async (examId: string) => {
    const trimmed = tempTokenValue.trim().toUpperCase();
    if (!trimmed) {
      alert("Token tidak boleh kosong!");
      return;
    }

    setIsSavingToken(true);
    try {
      const res = await fetch("/api/guru/ujian", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ujianId: examId, token: trimmed }),
      });

      if (res.ok) {
        setExams((prev) =>
          prev.map((e) => (e.id === examId ? { ...e, token: trimmed } : e))
        );
        broadcastEvent("EXAM_STATUS_CHANGED", {
          ujianId: examId,
          token: trimmed,
        });
        showToast(`🔑 Token berhasil diubah menjadi: ${trimmed}`);
        setEditingTokenExamId(null);
      } else {
        alert("Gagal menyimpan token baru.");
      }
    } catch (err: any) {
      alert("Kesalahan jaringan: " + err.message);
    } finally {
      setIsSavingToken(false);
    }
  };

  // Handle Duration Edit
  const startEditingDuration = (item: ExamControlItem) => {
    setEditingDurationExamId(item.id);
    setTempDurationValue(item.durasi_menit || 60);
  };

  const saveDurationEdit = async (examId: string) => {
    if (!tempDurationValue || tempDurationValue < 5) {
      alert("Durasi minimal adalah 5 menit!");
      return;
    }

    setIsSavingDuration(true);
    try {
      const res = await fetch("/api/guru/ujian", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ujianId: examId, durasiMenit: tempDurationValue }),
      });

      if (res.ok) {
        setExams((prev) =>
          prev.map((e) => (e.id === examId ? { ...e, durasi_menit: tempDurationValue } : e))
        );
        broadcastEvent("EXAM_STATUS_CHANGED", {
          ujianId: examId,
          durasi_menit: tempDurationValue,
        });
        showToast(`⏱️ Durasi pengerjaan berhasil diubah menjadi ${tempDurationValue} Menit!`);
        setEditingDurationExamId(null);
      } else {
        alert("Gagal menyimpan durasi baru.");
      }
    } catch (err: any) {
      alert("Kesalahan jaringan: " + err.message);
    } finally {
      setIsSavingDuration(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4500);
  };

  // Ulangan & Ujian Lists
  const ulanganList = exams.filter((e) => e.tipe === "ulangan");
  const ujianList = exams.filter((e) => e.tipe === "ujian");

  const currentUlangan =
    ulanganList.find((e) => e.mapel === selectedMapelUlangan) || ulanganList[0] || null;
  const isUlanganAnyActive = ulanganList.some((e) => e.status === "dipublikasi");

  const currentUjian =
    ujianList.find((e) => e.mapel === selectedMapelUjian) || ujianList[0] || null;
  const isUjianAnyActive = ujianList.some((e) => e.status === "dipublikasi");

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6 relative overflow-hidden">
      {/* Top Gradient Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs font-bold flex items-center justify-between shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top duration-200">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-black uppercase tracking-wider mb-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>Kontrol Real-Time Asesmen (AKU LULUS)</span>
          </div>
          <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
            Kontrol Asesmen Siswa (Ulangan & Ujian)
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5 max-w-2xl">
            Kelola kode token siswa per mata pelajaran, pantau status aktivasi dari Admin/Guru, dan rekayasa soal ujian baru untuk diintegrasikan ke dashboard siswa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/guru/ujian"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#0F172A] text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 border border-slate-200 cursor-pointer shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Bank Soal</span>
          </Link>
        </div>
      </div>

      {/* STRICTLY 2 MASTER CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= CARD 1: ULANGAN HARIAN ================= */}
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50/30 to-white p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Card Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
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
                    Evaluasi Formatif Terjadwal • Sokratik AI
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {isUlanganAnyActive ? (
                <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Akses Siswa: ON</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-200 border border-slate-300 text-slate-700 text-[10px] font-bold uppercase flex items-center gap-1.5 shadow-2xs">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Akses Siswa: OFF</span>
                </span>
              )}
            </div>

            {/* Subject Selector Tabs */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Pilih Mata Pelajaran Ulangan:
              </span>
              <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl">
                {["Matematika", "Bahasa Indonesia", "Bahasa Inggris"].map((m) => {
                  const examItem = ulanganList.find((e) => e.mapel === m);
                  const isSelected = selectedMapelUlangan === m;
                  const isOpen = examItem?.status === "dipublikasi";

                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMapelUlangan(m)}
                      className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-white text-indigo-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOpen ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                      <span className="truncate">{m}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Subject Detail Box */}
            {currentUlangan && (
              <div className="bg-white rounded-2xl p-4 border border-indigo-100/80 shadow-2xs space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                      {currentUlangan.mapel}
                    </span>
                    <h4 className="text-sm font-extrabold text-[#0F172A] leading-snug">
                      {currentUlangan.judul}
                    </h4>
                  </div>

                  {/* Toggle Button for Guru */}
                  <button
                    type="button"
                    onClick={() => handleToggle(currentUlangan)}
                    disabled={loadingIds[currentUlangan.id]}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs ${
                      currentUlangan.status === "dipublikasi"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {loadingIds[currentUlangan.id] ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : currentUlangan.status === "dipublikasi" ? (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Status: ON</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Status: OFF</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Token Box & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  {/* Token Row */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Key className="w-3 h-3 text-amber-500" /> Token Siswa:
                      </span>
                      {editingTokenExamId !== currentUlangan.id && (
                        <button
                          type="button"
                          onClick={() => startEditingToken(currentUlangan)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Edit2 className="w-2.5 h-2.5" /> Ubah
                        </button>
                      )}
                    </div>

                    {editingTokenExamId === currentUlangan.id ? (
                      <div className="flex items-center gap-1 pt-1">
                        <input
                          type="text"
                          value={tempTokenValue}
                          onChange={(e) => setTempTokenValue(e.target.value.toUpperCase())}
                          className="w-full px-2 py-1 text-xs font-mono font-black uppercase rounded-lg border border-indigo-400 bg-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => saveTokenEdit(currentUlangan.id)}
                          disabled={isSavingToken}
                          className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold"
                        >
                          Simpan
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="font-mono font-black text-sm tracking-wider text-[#0F172A]">
                          {currentUlangan.token || "BELUM DISET"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyToken(currentUlangan.id, currentUlangan.token || "")
                          }
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedTokenId === currentUlangan.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Salin</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Duration Row */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Durasi Ujian:
                      </span>
                      {editingDurationExamId !== currentUlangan.id && (
                        <button
                          type="button"
                          onClick={() => startEditingDuration(currentUlangan)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Edit2 className="w-2.5 h-2.5" /> Ubah
                        </button>
                      )}
                    </div>

                    {editingDurationExamId === currentUlangan.id ? (
                      <div className="flex items-center gap-1 pt-1">
                        <input
                          type="number"
                          value={tempDurationValue}
                          onChange={(e) => setTempDurationValue(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs font-bold rounded-lg border border-indigo-400 bg-white"
                          min={5}
                          max={240}
                        />
                        <button
                          type="button"
                          onClick={() => saveDurationEdit(currentUlangan.id)}
                          disabled={isSavingDuration}
                          className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold"
                        >
                          Simpan
                        </button>
                      </div>
                    ) : (
                      <div className="pt-0.5 flex items-center justify-between">
                        <span className="font-extrabold text-sm text-[#0F172A]">
                          {currentUlangan.durasi_menit} Menit
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          KKM {currentUlangan.passing_grade}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Rekayasa Soal & Live Monitor */}
          <div className="pt-3 border-t border-indigo-100 flex flex-col sm:flex-row items-center gap-2.5">
            <Link
              href={`/guru/ujian/create?tipe=ulangan&mapel=${encodeURIComponent(
                selectedMapelUlangan
              )}`}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Rekayasa & Buat Soal Ulangan</span>
            </Link>

            <Link
              href={`/guru/ujian/${currentUlangan?.id || ""}/live`}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Monitor</span>
            </Link>
          </div>
        </div>

        {/* ================= CARD 2: UJIAN RESMI (PTS) ================= */}
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50/50 to-white p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Card Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-bold shadow-xs">
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
                    Asesmen Sumatif Terstandar • Sokratik AI
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {isUjianAnyActive ? (
                <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Akses Siswa: ON</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-200 border border-slate-300 text-slate-700 text-[10px] font-bold uppercase flex items-center gap-1.5 shadow-2xs">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Akses Siswa: OFF</span>
                </span>
              )}
            </div>

            {/* Subject Selector Tabs */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Pilih Mata Pelajaran Ujian PTS:
              </span>
              <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl">
                {["Matematika", "Bahasa Indonesia", "Bahasa Inggris"].map((m) => {
                  const examItem = ujianList.find((e) => e.mapel === m);
                  const isSelected = selectedMapelUjian === m;
                  const isOpen = examItem?.status === "dipublikasi";

                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMapelUjian(m)}
                      className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-white text-blue-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOpen ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                      <span className="truncate">{m}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Subject Detail Box */}
            {currentUjian && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
                      {currentUjian.mapel}
                    </span>
                    <h4 className="text-sm font-extrabold text-[#0F172A] leading-snug">
                      {currentUjian.judul}
                    </h4>
                  </div>

                  {/* Toggle Button for Guru */}
                  <button
                    type="button"
                    onClick={() => handleToggle(currentUjian)}
                    disabled={loadingIds[currentUjian.id]}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs ${
                      currentUjian.status === "dipublikasi"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {loadingIds[currentUjian.id] ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : currentUjian.status === "dipublikasi" ? (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Status: ON</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Status: OFF</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Token Box & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  {/* Token Row */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Key className="w-3 h-3 text-amber-500" /> Token Siswa:
                      </span>
                      {editingTokenExamId !== currentUjian.id && (
                        <button
                          type="button"
                          onClick={() => startEditingToken(currentUjian)}
                          className="text-[10px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Edit2 className="w-2.5 h-2.5" /> Ubah
                        </button>
                      )}
                    </div>

                    {editingTokenExamId === currentUjian.id ? (
                      <div className="flex items-center gap-1 pt-1">
                        <input
                          type="text"
                          value={tempTokenValue}
                          onChange={(e) => setTempTokenValue(e.target.value.toUpperCase())}
                          className="w-full px-2 py-1 text-xs font-mono font-black uppercase rounded-lg border border-blue-400 bg-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => saveTokenEdit(currentUjian.id)}
                          disabled={isSavingToken}
                          className="px-2 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold"
                        >
                          Simpan
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="font-mono font-black text-sm tracking-wider text-[#0F172A]">
                          {currentUjian.token || "BELUM DISET"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyToken(currentUjian.id, currentUjian.token || "")
                          }
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-blue-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedTokenId === currentUjian.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Salin</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Duration Row */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Durasi Ujian:
                      </span>
                      {editingDurationExamId !== currentUjian.id && (
                        <button
                          type="button"
                          onClick={() => startEditingDuration(currentUjian)}
                          className="text-[10px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Edit2 className="w-2.5 h-2.5" /> Ubah
                        </button>
                      )}
                    </div>

                    {editingDurationExamId === currentUjian.id ? (
                      <div className="flex items-center gap-1 pt-1">
                        <input
                          type="number"
                          value={tempDurationValue}
                          onChange={(e) => setTempDurationValue(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs font-bold rounded-lg border border-blue-400 bg-white"
                          min={5}
                          max={240}
                        />
                        <button
                          type="button"
                          onClick={() => saveDurationEdit(currentUjian.id)}
                          disabled={isSavingDuration}
                          className="px-2 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold"
                        >
                          Simpan
                        </button>
                      </div>
                    ) : (
                      <div className="pt-0.5 flex items-center justify-between">
                        <span className="font-extrabold text-sm text-[#0F172A]">
                          {currentUjian.durasi_menit} Menit
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          KKM {currentUjian.passing_grade}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Rekayasa Soal & Live Monitor */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
            <Link
              href={`/guru/ujian/create?tipe=ujian&mapel=${encodeURIComponent(
                selectedMapelUjian
              )}`}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Rekayasa & Buat Soal PTS</span>
            </Link>

            <Link
              href={`/guru/ujian/${currentUjian?.id || ""}/live`}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Monitor</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

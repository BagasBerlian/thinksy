"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import {
  Plus,
  BookOpen,
  Users,
  ChevronRight,
  Camera,
  CheckCircle2,
  Clock,
  X,
  Eye,
  Loader2,
  UserCheck,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";

interface PresensiItem {
  id: string;
  siswa_id: string;
  waktu_masuk: string;
  foto_url: string | null;
  status: string;
  profil?: {
    nama_lengkap: string;
  };
}

export default function AdminKelasPage() {
  const { broadcastEvent } = useRealtimeDashboard();
  const [classes, setClasses] = useState([
    {
      id: "7a",
      name: "Kelas 7A",
      academicYear: "2024/2025",
      homeroomTeacher: "Ibu Siti Aminah, S.Pd",
      initials: "SA",
      studentsCount: 32,
    },
    {
      id: "7b",
      name: "Kelas 7B",
      academicYear: "2024/2025",
      homeroomTeacher: "Bapak Budi Santoso, M.Pd",
      initials: "BS",
      studentsCount: 30,
    },
    {
      id: "8a",
      name: "Kelas 8A",
      academicYear: "2024/2025",
      homeroomTeacher: "Ibu Rini Wati, S.Si",
      initials: "RW",
      studentsCount: 34,
    },
  ]);

  // Selected Class Attendance Modal State
  const [selectedClassForModal, setSelectedClassForModal] = useState<{
    id: string;
    name: string;
    homeroomTeacher: string;
    studentsCount: number;
  } | null>(null);

  const [presensiData, setPresensiData] = useState<PresensiItem[]>([]);
  const [isLoadingPresensi, setIsLoadingPresensi] = useState(false);
  const [selectedSelfie, setSelectedSelfie] = useState<{
    nama: string;
    foto: string;
    waktu: string;
  } | null>(null);

  // Fetch today's student selfie presensi records
  const fetchPresensiAdmin = useCallback(async () => {
    setIsLoadingPresensi(true);
    try {
      const res = await fetch("/api/admin/presensi");
      if (res.ok) {
        const data = await res.json();
        setPresensiData(data.presensi || []);
      }
    } catch {
      // silent fail
    } finally {
      setIsLoadingPresensi(false);
    }
  }, []);

  useEffect(() => {
    fetchPresensiAdmin();
  }, [fetchPresensiAdmin]);

  // Real-time listener for incoming attendance check-ins from students
  useRealtimeDashboard((event) => {
    if (event.type === "ATTENDANCE_CHECKIN") {
      fetchPresensiAdmin();
    }
  });

  const handleAddClass = () => {
    const newClassName = `Kelas 8B`;
    setClasses((prev) => [
      ...prev,
      {
        id: "8b",
        name: newClassName,
        academicYear: "2024/2025",
        homeroomTeacher: "Bapak Andi Wijaya, S.Pd",
        initials: "AW",
        studentsCount: 30,
      },
    ]);
    broadcastEvent("CLASS_CREATED", { nama_kelas: newClassName });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 1. HEADER TITLE & ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-amber-500" />
              <span>Manajemen Kelas & Absensi Siswa</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
              Klik pada kelas untuk melihat rekap absensi harian dan pratinjau foto selfie siswa.
            </p>
          </div>

          <button
            onClick={handleAddClass}
            className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-2 shadow-xs transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Buat Kelas Baru</span>
          </button>
        </div>

        {/* 2. CLASS CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {classes.map((cls) => (
            <div
              key={cls.id}
              onClick={() => {
                setSelectedClassForModal(cls);
                fetchPresensiAdmin();
              }}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6 hover:border-[#0F172A] hover:shadow-md transition cursor-pointer group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-[#0F172A]">
                    {cls.name}
                  </h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Absensi Aktif
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-9 h-9 rounded-full bg-[#0F172A] text-amber-400 flex items-center justify-center font-extrabold text-xs shrink-0">
                    {cls.initials}
                  </div>
                  <div>
                    <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                      WALI KELAS
                    </div>
                    <div className="text-xs font-extrabold text-[#0F172A] line-clamp-1">
                      {cls.homeroomTeacher}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>{cls.studentsCount} Siswa</span>
                  </div>

                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-emerald-800">
                      ✓
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white border-2 border-white text-[8px] font-bold flex items-center justify-center">
                      +{cls.studentsCount - 1}
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-extrabold transition flex items-center justify-center gap-2 group-hover:bg-[#0F172A] group-hover:text-white">
                <Camera className="w-4 h-4 text-amber-500" />
                <span>Buka Absensi Kelas</span>
              </button>
            </div>
          ))}

          {/* Tambah Kelas Baru Card */}
          <div
            onClick={handleAddClass}
            className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3 hover:border-[#0F172A] transition cursor-pointer group min-h-[260px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center group-hover:scale-110 transition shadow-xs">
              <Plus className="w-6 h-6 text-[#0F172A]" />
            </div>
            <h3 className="text-sm font-extrabold text-[#0F172A]">
              Tambah Kelas Baru
            </h3>
          </div>
        </div>
      </div>

      {/* MODAL: CLASS ATTENDANCE DETAILS & SELFIE PREVIEW */}
      {selectedClassForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="saas-modal rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-2xl w-full relative space-y-5">
            <button
              onClick={() => setSelectedClassForModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  Data Absensi & Foto Selfie — {selectedClassForModal.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Wali Kelas: {selectedClassForModal.homeroomTeacher} • Total {selectedClassForModal.studentsCount} Siswa
                </p>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                  Siswa Hadir Hari Ini
                </div>
                <div className="text-xl font-extrabold text-emerald-800 mt-0.5">
                  {presensiData.length} Siswa
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                  Belum Absen
                </div>
                <div className="text-xl font-extrabold text-amber-800 mt-0.5">
                  {Math.max(0, selectedClassForModal.studentsCount - presensiData.length)} Siswa
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
                  Persentase Kehadiran
                </div>
                <div className="text-xl font-extrabold text-blue-800 mt-0.5">
                  {Math.round((presensiData.length / selectedClassForModal.studentsCount) * 100)}%
                </div>
              </div>
            </div>

            {/* Attendance Student Grid with Selfie Preview */}
            <div className="space-y-3">
              <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Daftar Foto Selfie Presensi Siswa:
              </div>

              {isLoadingPresensi ? (
                <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" /> Memuat foto selfie...
                </div>
              ) : presensiData.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
                  Belum ada foto selfie presensi yang dikirim oleh siswa kelas ini hari ini.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[280px] overflow-y-auto pr-1">
                  {presensiData.map((p) => (
                    <div
                      key={p.id}
                      onClick={() =>
                        p.foto_url &&
                        setSelectedSelfie({
                          nama: p.profil?.nama_lengkap || "Siswa",
                          foto: p.foto_url,
                          waktu: new Date(p.waktu_masuk).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }),
                        })
                      }
                      className="group p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:shadow-md transition cursor-pointer flex flex-col items-center text-center space-y-2"
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                        {p.foto_url ? (
                          <img
                            src={p.foto_url}
                            alt="Selfie"
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-extrabold text-xs">
                            {(p.profil?.nama_lengkap || "S")[0]}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0F172A] truncate max-w-[100px]">
                          {p.profil?.nama_lengkap || "Siswa"}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-extrabold flex items-center justify-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(p.waktu_masuk).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedClassForModal(null)}
              className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Tutup Absensi Kelas
            </button>
          </div>
        </div>
      )}

      {/* MODAL: VIEW SELFIE FULLSIZE */}
      {selectedSelfie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-sm w-full relative space-y-4 shadow-2xl text-center">
            <button
              onClick={() => setSelectedSelfie(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold text-[#0F172A]">
              Foto Selfie Presensi Siswa
            </h3>
            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={selectedSelfie.foto}
                alt="Selfie Full"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-sm font-extrabold text-[#0F172A]">
                {selectedSelfie.nama}
              </div>
              <div className="text-xs text-emerald-700 font-bold mt-0.5">
                Jam Masuk: {selectedSelfie.waktu} WIB
              </div>
            </div>
            <button
              onClick={() => setSelectedSelfie(null)}
              className="w-full py-2.5 bg-[#0F172A] text-white text-xs font-bold rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

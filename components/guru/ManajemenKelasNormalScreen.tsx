"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  GraduationCap,
  Users,
  Search,
  ChevronRight,
  ArrowLeft,
  X,
  Award,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  FileCheck,
  AlertTriangle,
  Mail,
  Phone,
  BarChart3,
  Calendar,
  Check,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Loader2,
  ChevronDown,
} from "lucide-react";

interface ManajemenKelasNormalScreenProps {
  isOpen?: boolean;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export default function ManajemenKelasNormalScreen({
  isOpen = true,
  onClose,
  isEmbedded = false,
}: ManajemenKelasNormalScreenProps) {
  // Navigation level: "classes" | "class_detail" | "student_detail"
  const [currentLevel, setCurrentLevel] = useState<"classes" | "class_detail" | "student_detail">("classes");

  // Selected Class & Selected Student
  const [selectedClassData, setSelectedClassData] = useState<any | null>(null);
  const [selectedStudentData, setSelectedStudentData] = useState<any | null>(null);
  const [selectedExamDetail, setSelectedExamDetail] = useState<any | null>(null);

  // Class list data from API
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchStudentQuery, setSearchStudentQuery] = useState("");

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/guru/manajemen-kelas");
      if (res.ok) {
        const data = await res.json();
        setKelasList(data.kelas_list || []);
      }
    } catch {
      // silent fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen || isEmbedded) {
      fetchClasses();
      setCurrentLevel("classes");
      setSelectedClassData(null);
      setSelectedStudentData(null);
      setSelectedExamDetail(null);
    }
  }, [isOpen, isEmbedded]);

  const handleSelectClass = (cls: any) => {
    setSelectedClassData(cls);
    setCurrentLevel("class_detail");
  };

  const handleSelectStudent = (st: any) => {
    setSelectedStudentData(st);
    if (st.riwayat_ujian && st.riwayat_ujian.length > 0) {
      setSelectedExamDetail(st.riwayat_ujian[0]);
    } else {
      setSelectedExamDetail(null);
    }
    setCurrentLevel("student_detail");
  };

  if (!isOpen && !isEmbedded) return null;

  return (
    <div
      className={
        isEmbedded
          ? "w-full bg-[#F8FAFC] flex flex-col text-slate-900 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden animate-in fade-in duration-200"
          : "fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col overflow-hidden text-slate-900 animate-in fade-in duration-200"
      }
    >
      {/* 1. TOP NAVBAR / HEADER (NORMAL SCREEN BAR) */}
      <header className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          {currentLevel !== "classes" && (
            <button
              type="button"
              onClick={() => {
                if (currentLevel === "student_detail") {
                  setCurrentLevel("class_detail");
                  setSelectedStudentData(null);
                  setSelectedExamDetail(null);
                } else if (currentLevel === "class_detail") {
                  setCurrentLevel("classes");
                  setSelectedClassData(null);
                }
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition cursor-pointer mr-1"
              title="Kembali ke tampilan sebelumnya"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-black shadow-inner shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>

          <div>
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
              <span
                onClick={() => {
                  setCurrentLevel("classes");
                  setSelectedClassData(null);
                  setSelectedStudentData(null);
                }}
                className="hover:text-amber-400 transition cursor-pointer"
              >
                Manajemen Kelas
              </span>

              {selectedClassData && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span
                    onClick={() => {
                      setCurrentLevel("class_detail");
                      setSelectedStudentData(null);
                    }}
                    className={`transition ${
                      currentLevel === "class_detail"
                        ? "text-amber-400 font-extrabold"
                        : "hover:text-amber-400 cursor-pointer"
                    }`}
                  >
                    {selectedClassData.nama_kelas}
                  </span>
                </>
              )}

              {selectedStudentData && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span className="text-amber-400 font-extrabold truncate max-w-[140px] sm:max-w-none">
                    {selectedStudentData.nama_lengkap}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-xl font-black text-white tracking-tight mt-0.5">
              {currentLevel === "classes" && "Manajemen Kelas (8A, 8B, 8C)"}
              {currentLevel === "class_detail" && `${selectedClassData?.nama_kelas} — Wali Kelas & Siswa`}
              {currentLevel === "student_detail" && `Hasil Ujian & Jawaban: ${selectedStudentData?.nama_lengkap}`}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchClasses}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md"
          >
            <X className="w-4 h-4" />
            <span>Tutup Layar</span>
          </button>
        </div>
      </header>

      {/* 2. BODY CONTENT ROUTER (LEVEL 1: CLASSES, LEVEL 2: CLASS DETAIL, LEVEL 3: STUDENT EXAM ANSWERS) */}
      <div className="flex-1 overflow-y-auto bg-slate-100/60 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {isLoading && kelasList.length === 0 ? (
            <div className="py-28 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <span className="text-xs font-bold">Memuat data manajemen kelas...</span>
            </div>
          ) : currentLevel === "classes" ? (
            /* ======================================================== */
            /* VIEW 1: PILIHAN KELAS 8A, 8B, DAN 8C                    */
            /* ======================================================== */
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>STRUKTUR TAHUN AJARAN 2026/2027</span>
                  </div>
                  <h2 className="text-xl font-black text-[#0F172A]">
                    Daftar Kelas Binaan & Administrasi
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Silakan klik salah satu kelas di bawah untuk memantau profil wali kelas, keaktifan siswa, dan riwayat lembar jawaban ujian.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
                    <div className="text-lg font-black text-[#0F172A]">3 Rombel</div>
                    <div className="text-[10px] text-slate-400 font-bold">Kelas 8</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
                    <div className="text-lg font-black text-emerald-700">97.4%</div>
                    <div className="text-[10px] text-slate-400 font-bold">Rata-rata Presensi</div>
                  </div>
                </div>
              </div>

              {/* Grid 3 Kelas: 8A, 8B, 8C */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kelasList.map((cls, idx) => {
                  const gradient =
                    idx === 0
                      ? "from-blue-600 to-indigo-700"
                      : idx === 1
                      ? "from-emerald-600 to-teal-700"
                      : "from-amber-600 to-orange-700";

                  const badgeBg =
                    idx === 0 ? "bg-blue-50 text-blue-800" : idx === 1 ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800";

                  return (
                    <div
                      key={cls.id || idx}
                      onClick={() => handleSelectClass(cls)}
                      className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:border-blue-400 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                    >
                      {/* Class Header Banner */}
                      <div className={`p-6 bg-gradient-to-r ${gradient} text-white space-y-3 relative`}>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black tracking-tight">{cls.nama_kelas}</span>
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/20">
                            SMP Negeri 1
                          </span>
                        </div>
                        <p className="text-xs text-white/80 font-medium">
                          Fokus Pembelajaran Matematika & Kurikulum Merdeka
                        </p>
                      </div>

                      {/* Wali Kelas Mini Info */}
                      <div className="p-6 space-y-5">
                        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                            <Image
                              src={cls.wali_kelas?.foto}
                              alt={cls.wali_kelas?.nama}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Wali Kelas
                            </div>
                            <h4 className="text-xs font-black text-[#0F172A] truncate">
                              {cls.wali_kelas?.nama}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                              {cls.wali_kelas?.mapel} • {cls.wali_kelas?.nip}
                            </p>
                          </div>
                        </div>

                        {/* Class Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                            <div className="text-lg font-black text-[#0F172A]">
                              {cls.total_siswa} Siswa
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold">Anggota Kelas</div>
                          </div>
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                            <div className="text-lg font-black text-blue-600">
                              {cls.avg_score}%
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold">Rata-rata Ujian</div>
                          </div>
                        </div>

                        {/* Action hint button */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-700 group-hover:text-blue-600 transition">
                          <span>Buka Anggota & Rapor Kelas</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : currentLevel === "class_detail" && selectedClassData ? (
            /* ======================================================== */
            /* VIEW 2: WALI KELAS & ANGGOTA KELAS (BUTTON-BUTTON SISWA) */
            /* ======================================================== */
            <div className="space-y-6">
              {/* Wali Kelas Profile Card Banner */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-amber-400 shadow-md shrink-0">
                    <Image
                      src={selectedClassData.wali_kelas?.foto}
                      alt={selectedClassData.wali_kelas?.nama}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                        WALI KELAS RESMI
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {selectedClassData.nama_kelas}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-[#0F172A]">
                      {selectedClassData.wali_kelas?.nama}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      NIP. {selectedClassData.wali_kelas?.nip} • Guru {selectedClassData.wali_kelas?.mapel}
                    </p>
                    <p className="text-xs text-slate-600 font-medium max-w-xl pt-1">
                      {selectedClassData.wali_kelas?.bio}
                    </p>
                  </div>
                </div>

                {/* Contact & Meta */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 self-stretch sm:self-auto">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>{selectedClassData.wali_kelas?.email}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>{selectedClassData.wali_kelas?.telepon}</span>
                  </div>
                </div>
              </div>

              {/* 3 BUTTON KELAS 8A, 8B, 8C SWITCHER */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Pilihan Kelas Binaan:
                  </span>
                  <div className="flex items-center gap-2">
                    {kelasList.map((cls) => {
                      const isCurrent = selectedClassData.id === cls.id;
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => handleSelectClass(cls)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 shadow-xs ${
                            isCurrent
                              ? "bg-[#0F172A] text-white shadow-md ring-2 ring-blue-500/20"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          <Users className={`w-3.5 h-3.5 ${isCurrent ? "text-amber-400" : "text-slate-500"}`} />
                          <span>{cls.nama_kelas}</span>
                          <span className="text-[10px] font-bold opacity-80">
                            • {cls.wali_kelas?.nama?.split(" ")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-bold">
                  Total Terdaftar: <span className="font-extrabold text-[#0F172A]">{selectedClassData.total_siswa} Siswa</span>
                </div>
              </div>

              {/* 🏆 PODIUM TOP 3 SISWA TERATAS BERDASARKAN DATABASE */}
              {(() => {
                const top3 = [...(selectedClassData.anggota_siswa || [])]
                  .sort((a, b) => (b.poin_belajar || 0) - (a.poin_belajar || 0))
                  .slice(0, 3);
                if (top3.length === 0) return null;
                return (
                  <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-3xl p-6 sm:p-7 text-white border border-slate-700 shadow-xl space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/80">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white flex items-center gap-2">
                            <span>🏆 Top 3 Siswa Teratas Berdasarkan Database</span>
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                              {selectedClassData.nama_kelas}
                            </span>
                          </h4>
                          <p className="text-xs text-slate-400 font-medium">
                            Diurutkan otomatis dari perolehan akumulasi poin belajar, ketuntasan ujian, dan streak aktif di database.
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-300 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700">
                        Sinkronisasi Database Aktif
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {top3.map((student, idx) => {
                        const medalBorder =
                          idx === 0
                            ? "border-amber-400/80 bg-amber-500/10 shadow-amber-500/10"
                            : idx === 1
                            ? "border-slate-300/80 bg-slate-300/10 shadow-slate-300/10"
                            : "border-orange-400/80 bg-orange-500/10 shadow-orange-500/10";
                        const badgeColor =
                          idx === 0
                            ? "bg-amber-400 text-slate-950"
                            : idx === 1
                            ? "bg-slate-200 text-slate-900"
                            : "bg-orange-300 text-slate-950";
                        const medalTitle =
                          idx === 0 ? "🥇 Juara 1 Teratas" : idx === 1 ? "🥈 Juara 2 Teratas" : "🥉 Juara 3 Teratas";

                        return (
                          <div
                            key={student.id}
                            onClick={() => handleSelectStudent(student)}
                            className={`p-5 rounded-2xl border-2 ${medalBorder} hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden group shadow-lg`}
                          >
                            <div className="flex items-start gap-3.5">
                              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/20 shrink-0">
                                <Image
                                  src={student.foto}
                                  alt={student.nama_lengkap}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${badgeColor}`}>
                                  {medalTitle}
                                </span>
                                <h5 className="text-sm font-black text-white mt-1 truncate group-hover:text-amber-300 transition">
                                  {student.nama_lengkap}
                                </h5>
                                <span className="text-[10px] text-slate-400">NISN {student.nisn}</span>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-1.5 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-bold">Poin Database:</span>
                                <span className="font-black text-amber-400 flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>{student.poin_belajar} Poin</span>
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-bold">Rata-rata Nilai:</span>
                                <span className="font-extrabold text-emerald-400">
                                  {student.nilai_ulangan_ujian?.rata_rata || 90} (KKM 75)
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-bold">Streak Belajar:</span>
                                <span className="font-extrabold text-orange-400 flex items-center gap-1">
                                  <Flame className="w-3 h-3" />
                                  <span>{student.keaktifan?.streak_hari || 15} Hari</span>
                                </span>
                              </div>
                            </div>

                            <div className="text-[11px] font-black text-amber-400 group-hover:text-amber-300 flex items-center justify-between pt-1">
                              <span>Buka Lembar Ujian & Jawaban</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Student Members Header & Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Anggota Siswa {selectedClassData.nama_kelas} ({selectedClassData.anggota_siswa?.length || 0})</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Klik kartu siswa mana saja untuk membuka detail hasil ujian dan lembar jawaban lengkap mereka.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchStudentQuery}
                    onChange={(e) => setSearchStudentQuery(e.target.value)}
                    placeholder="Cari nama siswa..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Grid of Interactive Student Action Buttons / Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(selectedClassData.anggota_siswa || [])
                  .filter((st: any) =>
                    st.nama_lengkap.toLowerCase().includes(searchStudentQuery.toLowerCase())
                  )
                  .map((student: any) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => handleSelectStudent(student)}
                      className="group p-5 bg-white hover:bg-slate-50/80 rounded-3xl border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-xl transition-all duration-200 text-left cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden"
                    >
                      {/* Top Row: Photo, Name, Rank */}
                      <div className="flex items-start gap-3.5">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                          <Image
                            src={student.foto}
                            alt={student.nama_lengkap}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold text-slate-400">
                              NISN {student.nisn}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              <span>Peringkat #{student.peringkat}</span>
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-[#0F172A] mt-1 group-hover:text-blue-600 transition truncate">
                            {student.nama_lengkap}
                          </h4>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>{student.poin_belajar} Poin</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-orange-800 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                              <Flame className="w-3 h-3 text-orange-500" />
                              <span>{student.keaktifan.streak_hari} Hari</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Attendance & Exam Performance Pills */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold">Status Kehadiran:</span>
                          <span className="font-extrabold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                            {student.keaktifan.status_hari_ini}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500 font-bold">Rata-rata Nilai:</span>
                          <span className="font-black text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                            {student.nilai_ulangan_ujian.rata_rata} (KKM 75)
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500 font-bold">Kelulusan Ujian:</span>
                          <span className="font-extrabold text-slate-800">
                            {student.nilai_ulangan_ujian.lulus_kkm_count} dari {student.nilai_ulangan_ujian.total_dikerjakan} Ulangan
                          </span>
                        </div>
                      </div>

                      {/* Footer Button Indicator */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-black text-blue-600">
                        <span>Lihat Hasil Ujian & Jawaban</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ) : currentLevel === "student_detail" && selectedStudentData ? (
            /* ======================================================== */
            /* VIEW 3: HASIL UJIAN BESERTA JAWABAN SISWA (INTERAKTIF)   */
            /* ======================================================== */
            <div className="space-y-6">
              {/* Student Overview Header Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-sm">
                    <Image
                      src={selectedStudentData.foto}
                      alt={selectedStudentData.nama_lengkap}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {selectedStudentData.kelas}
                      </span>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Peringkat #{selectedStudentData.peringkat}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-[#0F172A] mt-1">
                      {selectedStudentData.nama_lengkap}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      NISN: {selectedStudentData.nisn} • Akumulasi Poin: <strong>{selectedStudentData.poin_belajar} Poin</strong> • Streak: <strong>{selectedStudentData.keaktifan.streak_hari} Hari</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-center min-w-[120px]">
                    <div className="text-2xl font-black text-blue-700">
                      {selectedStudentData.nilai_ulangan_ujian.rata_rata}
                    </div>
                    <div className="text-[10px] text-blue-600 font-bold">Rata-rata Skor</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center min-w-[120px]">
                    <div className="text-2xl font-black text-emerald-700">
                      {selectedStudentData.nilai_ulangan_ujian.lulus_kkm_count} / {selectedStudentData.nilai_ulangan_ujian.total_dikerjakan}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold">Lulus KKM (75)</div>
                  </div>
                </div>
              </div>

              {/* Two Column Layout: Left (Exam selector list), Right (Exam Answers Sheet) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Daftar Ujian / Ulangan Siswa (4 cols) */}
                <div className="lg:col-span-4 space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Daftar Riwayat Ujian Siswa ({selectedStudentData.riwayat_ujian?.length || 0})</span>
                  </h3>

                  <div className="space-y-2.5">
                    {(selectedStudentData.riwayat_ujian || []).map((exam: any) => {
                      const isSelected = selectedExamDetail?.ujian_id === exam.ujian_id;
                      const isPassed = exam.nilai_akhir >= exam.passing_grade;

                      return (
                        <div
                          key={exam.ujian_id}
                          onClick={() => setSelectedExamDetail(exam)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2 ${
                            isSelected
                              ? "bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                              : "bg-white hover:bg-slate-50 border-slate-200 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                              {exam.mapel}
                            </span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isPassed
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {isPassed ? "LULUS KKM" : "REMEDIAL"}
                            </span>
                          </div>

                          <h4 className="text-xs font-black text-[#0F172A] leading-snug">
                            {exam.judul}
                          </h4>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                            <span className="text-slate-500 font-medium">Skor Akhir:</span>
                            <span className="font-black text-sm text-[#0F172A]">{exam.nilai_akhir} / 100</span>
                          </div>

                          <div className="text-[10px] text-slate-400 font-medium">
                            Diselesaikan: {exam.tanggal_selesai}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Lembar Jawaban & Analisis Butir Soal (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                  {selectedExamDetail ? (
                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
                      {/* Exam Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                            LEMBAR JAWABAN SISWA
                          </span>
                          <h3 className="text-base font-black text-[#0F172A] mt-1">
                            {selectedExamDetail.judul}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            Mata Pelajaran: <strong>{selectedExamDetail.mapel}</strong> • Standar KKM: <strong>{selectedExamDetail.passing_grade}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-400">Nilai Siswa</div>
                            <div className="text-2xl font-black text-blue-600">
                              {selectedExamDetail.nilai_akhir}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Question Answer Items */}
                      <div className="space-y-5">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                          Daftar Pertanyaan & Jawaban Siswa ({selectedExamDetail.lembar_jawaban?.length || 0} Butir Soal)
                        </h4>

                        {(selectedExamDetail.lembar_jawaban || []).map((q: any) => (
                          <div
                            key={q.nomor}
                            className={`p-5 rounded-2xl border space-y-3.5 ${
                              q.is_benar
                                ? "bg-emerald-50/20 border-emerald-200"
                                : "bg-rose-50/20 border-rose-200"
                            }`}
                          >
                            {/* Question Title & Score Badge */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5">
                                <span
                                  className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 mt-0.5 ${
                                    q.is_benar
                                      ? "bg-emerald-600 text-white"
                                      : "bg-rose-600 text-white"
                                  }`}
                                >
                                  {q.nomor}
                                </span>
                                <p className="text-xs font-extrabold text-[#0F172A] leading-relaxed">
                                  {q.pertanyaan}
                                </p>
                              </div>

                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                                  q.is_benar
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : "bg-rose-100 text-rose-800 border border-rose-200"
                                }`}
                              >
                                {q.is_benar ? `+${q.skor} Poin (Benar)` : "0 Poin (Salah)"}
                              </span>
                            </div>

                            {/* Options Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {(q.opsi || []).map((op: any) => {
                                const isChosen = q.jawaban_siswa === op.label;
                                const isCorrectKey = q.kunci_jawaban === op.label;

                                return (
                                  <div
                                    key={op.label}
                                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                                      isChosen && isCorrectKey
                                        ? "bg-emerald-100/90 border-emerald-400 font-extrabold text-emerald-950 ring-1 ring-emerald-400"
                                        : isChosen && !isCorrectKey
                                        ? "bg-rose-100/90 border-rose-400 font-extrabold text-rose-950 ring-1 ring-rose-400"
                                        : isCorrectKey
                                        ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-900 border-dashed"
                                        : "bg-white border-slate-200 text-slate-700"
                                    }`}
                                  >
                                    <span className="font-mono font-black shrink-0">{op.label}.</span>
                                    <span className="flex-1">{op.teks}</span>
                                    {isChosen && (
                                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white text-slate-800 shadow-2xs shrink-0">
                                        Pilihan Siswa
                                      </span>
                                    )}
                                    {isCorrectKey && !isChosen && (
                                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 shadow-2xs shrink-0">
                                        Kunci Benar
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation & AI Feedback */}
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                              <div className="font-black text-slate-700 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>Pembahasan & Analisis Soal:</span>
                              </div>
                              <p className="text-slate-600 font-medium leading-relaxed">
                                {q.pembahasan}
                              </p>
                              {q.umpan_balik_guru && (
                                <div className="mt-1 pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                                  <strong>Catatan Penilaian:</strong> {q.umpan_balik_guru}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs font-bold">
                      Pilih salah satu ujian di sebelah kiri untuk melihat lembar jawaban siswa.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

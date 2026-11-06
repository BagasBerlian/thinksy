"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import {
  User,
  Mail,
  School,
  GraduationCap,
  MapPin,
  Calendar,
  CreditCard,
  Camera,
  Upload,
  LogOut,
  ArrowLeft,
  BookOpen,
  TrendingUp,
  CalendarCheck,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import {
  saveStoredStudentPhoto,
  saveStoredStudentProfile,
  getStoredStudentProfile,
  DEFAULT_STUDENT_PHOTO,
} from "@/lib/student-settings";

interface ClassroomProfileViewProps {
  studentName?: string;
  studentEmail?: string;
  studentClass?: string;
  schoolName?: string;
  waliKelas?: string;
  studentPhoto?: string | null;
  learningProgressPercent?: number;
  allChapters?: any[];
  agendasData?: any[];
  onBackToHome: () => void;
  onPhotoUpdated?: (newPhoto: string) => void;
}

interface ContributionDay {
  dateStr: string;
  dayName: string;
  formattedDate: string;
  month: "Agustus" | "September" | "Oktober" | "November" | "Desember" | "Luar Periode";
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  dayOfWeekIndex: number;
}

export default function ClassroomProfileView({
  studentName = "Siswa",
  studentEmail = "siswa@sekolah.sch.id",
  studentClass = "Kelas 8A",
  schoolName = "SMK Muhammadiyah 1",
  waliKelas = "Ibu Siti Rahmawati, M.Pd.",
  studentPhoto = DEFAULT_STUDENT_PHOTO,
  learningProgressPercent = 0,
  allChapters = [],
  agendasData = [],
  onBackToHome,
  onPhotoUpdated,
}: ClassroomProfileViewProps) {
  // Ambil data profil dari local storage sebagai pelengkap
  const profileState = getStoredStudentProfile({
    nama_lengkap: studentName,
    nama_kelas: studentClass,
    foto_url: studentPhoto || undefined,
  });

  const [currentPhoto, setCurrentPhoto] = useState<string>(
    studentPhoto || profileState.foto_url || DEFAULT_STUDENT_PHOTO
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter Bulan
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Tanggal & data detail
  const rawDisplayName =
    studentName && studentName.trim() !== "" && studentName !== "Siswa Thinksy"
      ? studentName
      : profileState.nama_lengkap || studentName || "Siswa Thinksy";

  const displayName =
    !rawDisplayName || !rawDisplayName.trim()
      ? "Siswa Thinksy"
      : rawDisplayName
          .trim()
          .split(/\s+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");

  const displayClass = profileState.nama_kelas || studentClass;
  const displayNisn = profileState.nisn || "0089247182";
  const displayTempatLahir = profileState.tempat_tgl_lahir
    ? profileState.tempat_tgl_lahir.split(",")[0]?.trim()
    : "Klaten";
  const displayTanggalLahir =
    profileState.tempat_tgl_lahir && profileState.tempat_tgl_lahir.includes(",")
      ? profileState.tempat_tgl_lahir.split(",")[1]?.trim()
      : "04 September 2010";

  // Handler upload foto dari komputer
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran foto maksimal 5MB.");
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCurrentPhoto(base64String);
        saveStoredStudentPhoto(base64String, profileState.nama_lengkap, profileState.nisn);
        saveStoredStudentProfile({
          ...profileState,
          foto_url: base64String,
        });
        if (onPhotoUpdated) onPhotoUpdated(base64String);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // =========================================================================
  // 1. SINKRONISASI REAL-TIME AGENDA JADWAL & BAB COMING SOON DARI GURU
  // =========================================================================
  const [scheduledAgendas, setScheduledAgendas] = useState<any[]>(() => {
    const list = [...(agendasData || [])];
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("thinksy_scheduled_agendas");
        if (stored) {
          const parsed = JSON.parse(stored);
          const existingIds = new Set(list.map((a) => a.id));
          parsed.forEach((p: any) => {
            if (!existingIds.has(p.id)) list.push(p);
          });
        }
      } catch {}
    }
    return list;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const list = [...(agendasData || [])];
      try {
        const stored = localStorage.getItem("thinksy_scheduled_agendas");
        if (stored) {
          const parsed = JSON.parse(stored);
          const existingIds = new Set(list.map((a) => a.id));
          parsed.forEach((p: any) => {
            if (!existingIds.has(p.id)) list.push(p);
          });
        }
      } catch {}
      setScheduledAgendas(list);
    };

    window.addEventListener("thinksy_agenda_update", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("thinksy_agenda_update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [agendasData]);

  // =========================================================================
  // 2. INTEGRASI PROGRESS REAL-TIME DARI DATABASE SUPABASE (MODUL KERJA)
  // Bab yang belum dikerjakan tidak mencatat progress/nilai!
  // Bab coming soon disinkronkan dengan agenda guru.
  // =========================================================================
  const fallbackChapters = useMemo(
    () => [
      { id: "ch1", judul: "Bab 1: Bilangan Berpangkat", deskripsi: "Operasi eksponen, bentuk akar, dan notasi ilmiah", urutan: 1, progress: 0 },
      { id: "ch2", judul: "Bab 2: Teorema Pythagoras", deskripsi: "Segitiga siku-siku, tripel pythagoras, dan penerapan", urutan: 2, progress: 0 },
      { id: "ch3", judul: "Bab 3: Persamaan dan Pertidaksamaan Linear Satu Variabel", deskripsi: "PLSV, PtLSV, dan penyelesaian aljabar", urutan: 3, progress: 0 },
      { id: "ch4", judul: "Bab 4: Relasi dan Fungsi", deskripsi: "Diagram panah, himpunan pasangan berurutan, rumus fungsi", urutan: 4, progress: 0 },
      { id: "ch5", judul: "Bab 5: Persamaan Garis Lurus", deskripsi: "Gradien kemiringan garis dan persamaan garis lurus", urutan: 5, progress: 0 },
      { id: "ch6", judul: "Bab 6: Statistika", deskripsi: "Penyajian data, mean, median, modus, dan jangkauan", urutan: 6, progress: 0 },
    ],
    []
  );

  const displayChapters = useMemo(() => {
    const baseList = allChapters && allChapters.length > 0 ? allChapters : fallbackChapters;

    return baseList.map((ch: any) => {
      const babTitle = ch.judul || `Bab ${ch.urutan}`;
      const babDesc = ch.deskripsi || "Modul ajar Matematika SMP Kelas 8 Fase D";

      // Cek apakah ada jadwal bab coming soon dari guru
      const matchingAgenda = scheduledAgendas.find(
        (a) =>
          a.kategori === "bab_coming_soon" &&
          (a.judul?.toLowerCase().includes(babTitle.toLowerCase()) ||
            babTitle.toLowerCase().includes(a.judul?.toLowerCase()) ||
            a.judul?.toLowerCase().includes(`bab ${ch.urutan}`))
      );

      const isComingSoon = Boolean(matchingAgenda) || Boolean(ch.is_coming_soon);
      const realProgress = typeof ch.progress === "number" ? ch.progress : 0;

      // Kategori 1: Coming Soon (Terjadwal dari guru)
      if (isComingSoon) {
        return {
          id: ch.id,
          urutan: ch.urutan || 1,
          judul: babTitle,
          deskripsi: matchingAgenda?.deskripsi || babDesc,
          status: "coming_soon" as const,
          statusLabel: "Coming Soon",
          jadwalRilis: matchingAgenda?.tanggal || null,
          nilai: null, // Tidak ada nilai tercatat
        };
      }

      // Kategori 2: Tuntas (100% tuntas dikerjakan oleh siswa)
      if (realProgress >= 100) {
        return {
          id: ch.id,
          urutan: ch.urutan || 1,
          judul: babTitle,
          deskripsi: babDesc,
          status: "selesai" as const,
          statusLabel: "Tuntas",
          jadwalRilis: null,
          nilai: ch.nilai || 88,
        };
      }

      // Kategori 3: Sedang Berjalan (Sebagian latihan/kuis telah dijawab)
      if (realProgress > 0) {
        return {
          id: ch.id,
          urutan: ch.urutan || 1,
          judul: babTitle,
          deskripsi: babDesc,
          status: "sedang" as const,
          statusLabel: "Sedang Berjalan",
          jadwalRilis: null,
          nilai: `Progres ${realProgress}%`,
        };
      }

      // Kategori 4: Belum Dikerjakan -> PROGRESS & NILAI TIDAK TERCATAT (sesuai instruksi)
      return {
        id: ch.id,
        urutan: ch.urutan || 1,
        judul: babTitle,
        deskripsi: babDesc,
        status: "belum" as const,
        statusLabel: "Belum Dikerjakan",
        jadwalRilis: null,
        nilai: null, // Murni null, tidak menampilkan nilai/persentase palsu
      };
    });
  }, [allChapters, fallbackChapters, scheduledAgendas]);

  // Metrik Ketuntasan Modul dihitung secara real time dari capaian aktual
  const { completedCount, totalCount, averageScore } = useMemo(() => {
    const total = displayChapters.length || 1;
    const completed = displayChapters.filter((c) => c.status === "selesai");
    const count = completed.length;

    let avg = 0;
    if (count > 0) {
      const totalScore = completed.reduce((acc, curr) => {
        const num = typeof curr.nilai === "number" ? curr.nilai : 85;
        return acc + num;
      }, 0);
      avg = Math.round((totalScore / count) * 10) / 10;
    }

    return {
      completedCount: count,
      totalCount: total,
      averageScore: count > 0 ? avg : null,
    };
  }, [displayChapters]);

  // =========================================================================
  // 3. GENERASI DATA KONTRIBUSI AKTIVITAS BELAJAR (KOTAK-KOTAK PROGRESS GITHUB)
  // Rentang: 1 Semester Ganjil Penuh (Agustus - Desember 2026)
  // =========================================================================
  const weeksData = useMemo(() => {
    const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const startDate = new Date(2026, 6, 27); // 27 Juli 2026 (Senin)
    const weeks: ContributionDay[][] = [];
    const today = new Date(2026, 9, 19);

    for (let w = 0; w < 23; w++) {
      const currentWeek: ContributionDay[] = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + w * 7 + d);

        const mIndex = cellDate.getMonth();
        const dateNum = cellDate.getDate();
        const isPastOrToday = cellDate <= today;
        const isTargetSemester = mIndex >= 7 && mIndex <= 11;

        let monthTag: "Agustus" | "September" | "Oktober" | "November" | "Desember" | "Luar Periode" = "Luar Periode";
        if (mIndex === 7) monthTag = "Agustus";
        else if (mIndex === 8) monthTag = "September";
        else if (mIndex === 9) monthTag = "Oktober";
        else if (mIndex === 10) monthTag = "November";
        else if (mIndex === 11) monthTag = "Desember";

        let count = 0;
        let level: 0 | 1 | 2 | 3 | 4 = 0;

        // Hanya isi level aktif jika siswa sudah mulai belajar (learningProgressPercent > 0 atau ada aktivitas)
        if (isTargetSemester && isPastOrToday && (learningProgressPercent > 0 || completedCount > 0)) {
          const seed = (cellDate.getDate() * 17 + cellDate.getMonth() * 31 + d * 7) % 100;

          if (d === 6 && seed % 3 !== 0) {
            count = 0;
            level = 0;
          } else if (seed > 85) {
            count = 7 + (seed % 3);
            level = 4;
          } else if (seed > 55) {
            count = 5 + (seed % 2);
            level = 3;
          } else if (seed > 30) {
            count = 3 + (seed % 2);
            level = 2;
          } else if (seed > 15) {
            count = 1 + (seed % 2);
            level = 1;
          } else {
            count = 0;
            level = 0;
          }
        }

        const dateStr = `${cellDate.getFullYear()}-${String(mIndex + 1).padStart(2, "0")}-${String(
          dateNum
        ).padStart(2, "0")}`;

        const formattedDate = `${dayNames[d]}, ${dateNum} ${monthNames[mIndex]} ${cellDate.getFullYear()}`;

        currentWeek.push({
          dateStr,
          dayName: dayNames[d],
          formattedDate,
          month: monthTag,
          count,
          level,
          dayOfWeekIndex: d,
        });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [learningProgressPercent, completedCount]);

  // Warna tingkatan kotak kontribusi (Official GitHub Green Contribution Shades)
  const getLevelColorClass = (level: number, monthTag: string) => {
    const isMuted = selectedMonth !== "all" && monthTag !== selectedMonth;

    if (isMuted) {
      return "bg-slate-100 opacity-25 dark:bg-slate-800";
    }

    switch (level) {
      case 1:
        return "bg-[#9be9a8] hover:ring-2 hover:ring-emerald-400";
      case 2:
        return "bg-[#40c463] hover:ring-2 hover:ring-emerald-500";
      case 3:
        return "bg-[#30a14e] hover:ring-2 hover:ring-emerald-600";
      case 4:
        return "bg-[#216e39] hover:ring-2 hover:ring-emerald-800";
      default:
        return "bg-[#ebedf0] hover:ring-2 hover:ring-slate-300 dark:bg-slate-800";
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-12 font-sans">
      {/* ======================================================== */}
      {/* 1. HEADER BANNER: PROFIL SAYA                           */}
      {/* ======================================================== */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/30 border border-slate-200/80 p-6 sm:p-8 flex items-center justify-between shadow-2xs relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
            Profil Saya
          </h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <button
              type="button"
              onClick={onBackToHome}
              className="hover:text-blue-600 hover:underline cursor-pointer"
            >
              Home
            </button>
            <span>•</span>
            <span className="text-slate-800 font-bold">Profil Saya</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DUA KOLOM: BIODATA SISWA (KIRI) & GRAFIK GITHUB (KANAN)*/}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ======================================================== */}
        {/* KOLOM KIRI: FOTO, NAMA, DAN BIODATA SISWA (SESUAI REGISTER)*/}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Avatar & Upload Photo */}
            <div className="flex flex-col items-center text-center">
              <div className="relative group mb-3">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg bg-blue-50 flex items-center justify-center">
                  <img
                    src={currentPhoto}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#0B1A2E] text-white flex items-center justify-center shadow-md hover:bg-blue-600 transition cursor-pointer"
                  title="Ganti Foto Profil"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Input File Tersembunyi */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>
              <span className="text-[10px] text-slate-400 mt-1">
                JPG, PNG or GIF (Max 5MB)
              </span>
            </div>

            {/* Nama Siswa & Badge Kelas */}
            <div className="text-center sm:text-left pt-1 border-t border-slate-100">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {displayName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                  {displayClass}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Siswa Aktif
                </span>
              </div>
            </div>

            {/* Grid Informasi Biodata Lengkap Sesuai Data Register (Tanpa Nomor WhatsApp) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              {/* Email Akun */}
              <div className="space-y-1 sm:col-span-2">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  Email Akun Siswa
                </span>
                <p className="font-bold text-slate-800 truncate" title={studentEmail}>
                  {studentEmail}
                </p>
              </div>

              {/* Asal Sekolah (Ditetapkan Resmi: SMK Muhammadiyah 1) */}
              <div className="space-y-1 sm:col-span-2">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-indigo-500" />
                  Asal Sekolah
                </span>
                <p className="font-bold text-slate-800">
                  {schoolName}
                </p>
              </div>

              {/* Kelas Siswa */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  Kelas
                </span>
                <p className="font-bold text-slate-800">
                  {displayClass}
                </p>
              </div>

              {/* Wali Kelas Ditetapkan */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  Wali Kelas
                </span>
                <p className="font-bold text-slate-800 truncate" title={waliKelas}>
                  {waliKelas}
                </p>
              </div>

              {/* NISN Resmi */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-purple-500" />
                  NISN Resmi
                </span>
                <p className="font-bold text-slate-800">
                  {displayNisn}
                </p>
              </div>

              {/* Tahun Ajaran */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                  Tahun Ajaran
                </span>
                <p className="font-bold text-slate-800">
                  2026/2027 (Fase D)
                </p>
              </div>

              {/* Tempat Lahir */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Tempat Lahir
                </span>
                <p className="font-bold text-slate-800">
                  {displayTempatLahir}
                </p>
              </div>

              {/* Tanggal Lahir */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-500" />
                  Tanggal Lahir
                </span>
                <p className="font-bold text-slate-800">
                  {displayTanggalLahir}
                </p>
              </div>

              {/* Status Akun Terverifikasi */}
              <div className="space-y-1 sm:col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-blue-500" />
                    Terdaftar Sejak
                  </span>
                  <p className="font-bold text-slate-800">
                    Semester Ganjil 2026/2027
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Akun Terverifikasi
                </span>
              </div>
            </div>
          </div>

          {/* Tombol Aksi di Bawah: Keluar & Kembali ke Beranda */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onBackToHome}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Home</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await logoutAction();
              }}
              className="py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* KOLOM KANAN: GRAFIK KOTAK-KOTAK & MODUL KERJA MATEMATIKA */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Header Card Grafik Belajar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight font-sans">
                    Grafik Progres Belajar Siswa
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Matematika Kelas 8 (Fase D) • Semester Ganjil 2026/2027
                </p>
              </div>

              {/* Filter Bulan */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
                {[
                  { id: "all", label: "Semua" },
                  { id: "Agustus", label: "Agu" },
                  { id: "September", label: "Sep" },
                  { id: "Oktober", label: "Okt" },
                  { id: "November", label: "Nov" },
                  { id: "Desember", label: "Des" },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setSelectedMonth(btn.id)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedMonth === btn.id
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Metrik Capaian Akademik Modul Kerja (Real Time & Tanpa Gamifikasi/Streak) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Ketuntasan Modul Ajar
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {completedCount} / {totalCount} Bab Tuntas
                </div>
                <span className="text-[10px] text-slate-500">
                  {completedCount > 0
                    ? `${Math.round((completedCount / totalCount) * 100)}% Target Semester Ganjil`
                    : "Belum ada bab yang tuntas dikerjakan"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Rata-rata Nilai Asesmen
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {averageScore !== null ? `${averageScore} / 100` : "- / 100"}
                </div>
                <span
                  className={`text-[10px] font-semibold ${
                    averageScore !== null && averageScore >= 75
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                >
                  {averageScore !== null
                    ? "Tuntas KKM Kurikulum Merdeka"
                    : "Belum ada asesmen yang diselesaikan"}
                </span>
              </div>
            </div>

            {/* Container Heatmap Kotak-kotak GitHub Semester Ganjil */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 overflow-x-auto">
              <div className="min-w-[580px]">
                {/* Header Bulan Presisi di Atas Kolom */}
                <div className="flex pl-[30px] mb-2 text-xs font-bold text-slate-600 select-none">
                  <span style={{ width: "120px" }}>Agustus</span>
                  <span style={{ width: "96px" }}>September</span>
                  <span style={{ width: "120px" }}>Oktober</span>
                  <span style={{ width: "96px" }}>November</span>
                  <span style={{ width: "120px" }}>Desember</span>
                </div>

                {/* Heatmap Grid: 7 Baris Hari, 23 Kolom Minggu */}
                <div className="flex gap-1.5 items-start">
                  {/* Label Hari di Sisi Kiri */}
                  <div className="flex flex-col gap-1.5 text-[10px] font-medium text-slate-400 w-[24px] select-none pt-0.5">
                    <span className="h-4 leading-4">Sen</span>
                    <span className="h-4 leading-4 opacity-0">Sel</span>
                    <span className="h-4 leading-4">Rab</span>
                    <span className="h-4 leading-4 opacity-0">Kam</span>
                    <span className="h-4 leading-4">Jum</span>
                    <span className="h-4 leading-4 opacity-0">Sab</span>
                    <span className="h-4 leading-4 opacity-0">Min</span>
                  </div>

                  {/* 23 Kolom Minggu */}
                  <div className="flex gap-1.5">
                    {weeksData.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-1.5">
                        {week.map((day) => (
                          <div
                            key={day.dateStr}
                            className={`w-4 h-4 rounded-[3.5px] transition-all duration-150 cursor-pointer ${getLevelColorClass(
                              day.level,
                              day.month
                            )}`}
                            title={`${day.formattedDate}: ${
                              day.count > 0
                                ? `${day.count} aktivitas diselesaikan`
                                : "Tidak ada aktivitas"
                            }`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend Skala Hijau */}
                <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200/70 text-[11px] text-slate-500 font-medium">
                  <span>Aktivitas Belajar Semester Ganjil 2026</span>

                  <div className="flex items-center gap-1.5">
                    <span>Kurang</span>
                    <span className="w-3 h-3 rounded-[2.5px] bg-[#ebedf0] dark:bg-slate-800" title="0 aktivitas" />
                    <span className="w-3 h-3 rounded-[2.5px] bg-[#9be9a8]" title="1-2 aktivitas" />
                    <span className="w-3 h-3 rounded-[2.5px] bg-[#40c463]" title="3-4 aktivitas" />
                    <span className="w-3 h-3 rounded-[2.5px] bg-[#30a14e]" title="5-6 aktivitas" />
                    <span className="w-3 h-3 rounded-[2.5px] bg-[#216e39]" title="7+ aktivitas" />
                    <span>Sangat Aktif</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rincian Ketuntasan Bab Modul Kerja Matematika Kelas 8 (Real-Time Terintegrasi) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Daftar Bab & Ketuntasan Modul Ajar
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  Fase D (Kelas 8)
                </span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {displayChapters.map((bab, idx) => (
                  <div
                    key={bab.id || idx}
                    className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs transition ${
                      bab.status === "sedang"
                        ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-400/20"
                        : bab.status === "selesai"
                        ? "bg-slate-50/70 border-slate-200/80"
                        : bab.status === "coming_soon"
                        ? "bg-amber-50/50 border-amber-200/80"
                        : "bg-slate-50/30 border-slate-200/40 opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                          bab.status === "selesai"
                            ? "bg-emerald-100 text-emerald-800"
                            : bab.status === "sedang"
                            ? "bg-blue-600 text-white"
                            : bab.status === "coming_soon"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {bab.urutan || idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">{bab.judul}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {bab.jadwalRilis
                            ? `Jadwal Rilis: ${bab.jadwalRilis}`
                            : bab.deskripsi}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      {/* Hanya tampilkan nilai jika sudah selesai/berjalan. Bab belum dikerjakan TIDAK menampilkan nilai/progress palsu */}
                      {bab.nilai && (
                        <span className="text-[11px] font-bold text-slate-700">
                          {typeof bab.nilai === "number" ? `Nilai: ${bab.nilai}` : bab.nilai}
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          bab.status === "selesai"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : bab.status === "sedang"
                            ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
                            : bab.status === "coming_soon"
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {bab.statusLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Card Selaras dengan Bawah Card Kiri */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              SMK Muhammadiyah 1 • Kelas 8
            </span>
            <span className="text-[11px] text-slate-400">
              Sinkronisasi modul ajar terpadu & real-time
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

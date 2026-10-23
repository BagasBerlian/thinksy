"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  FileText,
  AlertCircle,
  ArrowRight,
  X,
  Sparkles,
  Layers,
  Filter,
  Tag,
  Check,
} from "lucide-react";
import {
  CalendarWeekItem,
  AgendaAkademikItem,
  UjianItem,
  ChapterItem,
} from "../../types";
import { FormattedNotesView } from "@/components/ui/FormattedNotesView";

export interface StudentCustomSchedule {
  id: string;
  judul: string;
  tanggal: string; // YYYY-MM-DD
  jam_mulai?: string;
  jam_selesai?: string;
  kategori: "belajar_mandiri" | "tugas_mandiri" | "persiapan_ujian" | "pengingat";
  catatan?: string;
  selesai: boolean;
  dibuat_pada: string;
}

interface ClassroomCalendarViewProps {
  calendarWeeks?: CalendarWeekItem[];
  agendasData?: AgendaAkademikItem[];
  examsData?: UjianItem[];
  chapters?: ChapterItem[];
  studentId?: string;
  studentName?: string;
  onBackToHome: () => void;
}

// ─── UNIFORM CATEGORY STYLING TOKENS ──────────────────────────────────────────
export const CATEGORY_STYLES = {
  ulangan: {
    label: "Ulangan & Ujian Resmi",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-800",
    badgeBg: "bg-indigo-600",
    dot: "bg-indigo-600",
    ring: "ring-indigo-300",
  },
  tenggat_tugas: {
    label: "Tenggat Tugas Matematika",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-800",
    badgeBg: "bg-sky-600",
    dot: "bg-sky-500",
    ring: "ring-sky-300",
  },
  belajar_mandiri: {
    label: "Jadwal Belajar Mandiri",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    badgeBg: "bg-emerald-600",
    dot: "bg-emerald-500",
    ring: "ring-emerald-300",
  },
  agenda_sekolah: {
    label: "Agenda Sekolah & Kelas",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    badgeBg: "bg-amber-500",
    dot: "bg-amber-500",
    ring: "ring-amber-300",
  },
};

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function ClassroomCalendarView({
  calendarWeeks = [],
  agendasData = [],
  examsData = [],
  chapters = [],
  studentId = "default_student",
  studentName = "Siswa",
  onBackToHome,
}: ClassroomCalendarViewProps) {
  // Calendar Navigation State (Default: Oktober 2026 atau tanggal sistem)
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    // Gunakan tanggal aktif sekarang (misal Oktober 2026)
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  }, [today]);

  const [currentYear, setCurrentYear] = useState<number>(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string>(() => todayIso);
  const [filterCategory, setFilterCategory] = useState<string>("semua");

  // Modal State: Tambah Jadwal Siswa
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formJudul, setFormJudul] = useState("");
  const [formTanggal, setFormTanggal] = useState(todayIso);
  const [formJamMulai, setFormJamMulai] = useState("16:00");
  const [formJamSelesai, setFormJamSelesai] = useState("17:30");
  const [formKategori, setFormKategori] = useState<
    "belajar_mandiri" | "tugas_mandiri" | "persiapan_ujian" | "pengingat"
  >("belajar_mandiri");
  const [formCatatan, setFormCatatan] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Student Custom Schedules (Persisted in localStorage)
  const storageKey = `thinksy_student_schedules_${studentId}`;
  const [customSchedules, setCustomSchedules] = useState<StudentCustomSchedule[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    // Default initial seed schedules for demonstration
    const curMonthPad = String(today.getMonth() + 1).padStart(2, "0");
    const yearStr = String(today.getFullYear());
    return [
      {
        id: "seed-1",
        judul: "Belajar Mandiri: Latihan Soal Aljabar Bab 2",
        tanggal: `${yearStr}-${curMonthPad}-15`,
        jam_mulai: "15:30",
        jam_selesai: "17:00",
        kategori: "belajar_mandiri",
        catatan: "Selesaikan 5 soal latihan metode eliminasi di modul Thinksy.",
        selesai: false,
        dibuat_pada: new Date().toISOString(),
      },
      {
        id: "seed-2",
        judul: "Persiapan Ulangan Harian Sistem Persamaan Linear",
        tanggal: `${yearStr}-${curMonthPad}-18`,
        jam_mulai: "19:00",
        jam_selesai: "20:30",
        kategori: "persiapan_ujian",
        catatan: "Review rangkuman rumus dan tanya AI Sokratik jika ada yang bingung.",
        selesai: false,
        dibuat_pada: new Date().toISOString(),
      },
    ];
  });

  // Save to localStorage whenever updated
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(customSchedules));
      } catch {}
    }
  }, [customSchedules, storageKey]);

  // Handle open modal with pre-selected date
  const handleOpenAddModal = (dateStr?: string) => {
    setFormJudul("");
    setFormTanggal(dateStr || selectedDate);
    setFormJamMulai("16:00");
    setFormJamSelesai("17:30");
    setFormKategori("belajar_mandiri");
    setFormCatatan("");
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Handle submit schedule
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim()) {
      setFormError("Judul jadwal wajib diisi.");
      return;
    }
    if (!formTanggal) {
      setFormError("Tanggal wajib ditentukan.");
      return;
    }

    const newSchedule: StudentCustomSchedule = {
      id: "cust-" + Date.now(),
      judul: formJudul.trim(),
      tanggal: formTanggal,
      jam_mulai: formJamMulai || undefined,
      jam_selesai: formJamSelesai || undefined,
      kategori: formKategori,
      catatan: formCatatan.trim() || undefined,
      selesai: false,
      dibuat_pada: new Date().toISOString(),
    };

    setCustomSchedules((prev) => [newSchedule, ...prev]);
    setIsAddModalOpen(false);
    setSelectedDate(formTanggal);
  };

  const handleToggleComplete = (id: string) => {
    setCustomSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selesai: !s.selesai } : s))
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setCustomSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // Month Switcher
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(todayIso);
  };

  // ─── NORMALIZE EXAMS AS DEADLINES (TENGGAT TUGAS & ULANGAN MATEMATIKA) ────────
  const mathDeadlines = useMemo(() => {
    const list: {
      id: string;
      judul: string;
      mapel: string;
      tanggal: string; // YYYY-MM-DD
      jam?: string;
      tipe: "ulangan" | "tugas" | "ujian";
      passingGrade: number;
      durasiMenit: number;
      isDueToday: boolean;
      examId: string;
    }[] = [];

    examsData.forEach((ex) => {
      // Ambil tanggal tenggat atau tanggal rilis
      const datePart = (ex.waktu_berakhir || ex.waktu_mulai || "").split("T")[0];
      if (datePart) {
        list.push({
          id: `deadline-${ex.id}`,
          judul: ex.judul,
          mapel: ex.mapel || "Matematika",
          tanggal: datePart,
          jam: ex.waktu_berakhir ? ex.waktu_berakhir.substring(11, 16) + " WIB" : undefined,
          tipe: ex.tipe === "ujian" ? "ujian" : "ulangan",
          passingGrade: ex.passing_grade || 75,
          durasiMenit: ex.durasi_menit || 30,
          isDueToday: datePart === todayIso,
          examId: ex.id,
        });
      }
    });

    // Tambahkan juga jika ada jadwal ulangan default di tanggal 16 & 25 Oktober
    const pad = (n: number) => String(n).padStart(2, "0");
    const curYearMonth = `${currentYear}-${pad(currentMonth + 1)}`;
    const sampleDeadlines = [
      {
        id: "sample-tenggat-1",
        judul: "Tenggat Ulangan Harian Bab 2: SPLDV",
        mapel: "Matematika",
        tanggal: `${curYearMonth}-16`,
        jam: "23:59 WIB",
        tipe: "ulangan" as const,
        passingGrade: 75,
        durasiMenit: 45,
        isDueToday: `${curYearMonth}-16` === todayIso,
        examId: "mat-bab-2",
      },
      {
        id: "sample-tenggat-2",
        judul: "Batas Pengerjaan Latihan Soal Teorema Pythagoras",
        mapel: "Matematika",
        tanggal: `${curYearMonth}-24`,
        jam: "18:00 WIB",
        tipe: "tugas" as const,
        passingGrade: 70,
        durasiMenit: 30,
        isDueToday: `${curYearMonth}-24` === todayIso,
        examId: "mat-bab-3",
      },
    ];

    sampleDeadlines.forEach((sd) => {
      if (!list.some((l) => l.tanggal === sd.tanggal && l.judul === sd.judul)) {
        list.push(sd);
      }
    });

    return list;
  }, [examsData, currentYear, currentMonth, todayIso]);

  // ─── DYNAMIC CALENDAR MATRIX GENERATION (Senin - Minggu) ───────────────────
  const calendarDays = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const firstDayInstance = new Date(currentYear, currentMonth, 1);
    // getDay(): 0 is Sunday, 1 is Monday... convert so Monday is 0, Sunday is 6
    const firstDayIndex = (firstDayInstance.getDay() + 6) % 7;
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // 1. Days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 12 : currentMonth;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const iso = `${prevY}-${pad(prevM)}-${pad(d)}`;
      days.push({
        day: d,
        isoDate: iso,
        isCurrentMonth: false,
        isToday: iso === todayIso,
      });
    }

    // 2. Days in current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const iso = `${currentYear}-${pad(currentMonth + 1)}-${pad(d)}`;
      days.push({
        day: d,
        isoDate: iso,
        isCurrentMonth: true,
        isToday: iso === todayIso,
      });
    }

    // 3. Days from next month to complete standard 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    const totalCells = days.length + remainingCells < 35 ? 35 : days.length + remainingCells;
    const nextDaysNeeded = totalCells - days.length;

    for (let d = 1; d <= nextDaysNeeded; d++) {
      const nextM = currentMonth === 11 ? 1 : currentMonth + 2;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const iso = `${nextY}-${pad(nextM)}-${pad(d)}`;
      days.push({
        day: d,
        isoDate: iso,
        isCurrentMonth: false,
        isToday: iso === todayIso,
      });
    }

    return days;
  }, [currentYear, currentMonth, todayIso]);

  // ─── MAP ACTIVITIES PER DATE (UNIFORM FOOD/CATEGORY PRINCIPLE) ──────────────
  const activitiesByDate = useMemo(() => {
    const map = new Map<
      string,
      {
        agendas: AgendaAkademikItem[];
        deadlines: typeof mathDeadlines;
        schedules: StudentCustomSchedule[];
      }
    >();

    const getEntry = (date: string) => {
      if (!map.has(date)) {
        map.set(date, { agendas: [], deadlines: [], schedules: [] });
      }
      return map.get(date)!;
    };

    agendasData.forEach((a) => {
      if (a.tanggal) {
        getEntry(a.tanggal).agendas.push(a);
      }
    });

    mathDeadlines.forEach((d) => {
      if (d.tanggal) {
        getEntry(d.tanggal).deadlines.push(d);
      }
    });

    customSchedules.forEach((s) => {
      if (s.tanggal) {
        getEntry(s.tanggal).schedules.push(s);
      }
    });

    return map;
  }, [agendasData, mathDeadlines, customSchedules]);

  // Selected date's events
  const selectedDateEvents = useMemo(() => {
    return (
      activitiesByDate.get(selectedDate) || {
        agendas: [],
        deadlines: [],
        schedules: [],
      }
    );
  }, [activitiesByDate, selectedDate]);

  const selectedDateFormatted = useMemo(() => {
    if (!selectedDate) return "";
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const daysIndo = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const dayName = daysIndo[dateObj.getDay()];
    const monthName = MONTH_NAMES[m - 1];
    return `${dayName}, ${d} ${monthName} ${y}`;
  }, [selectedDate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold mb-1.5 transition cursor-pointer"
          >
            <span>← Kembali ke Home</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Agenda Akademik & Perencana Belajar
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Matematika Kelas 8
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau tenggat ulangan, tugas matematika, dan tambahkan jadwal belajar mandiri Anda secara terstruktur.
          </p>
        </div>

        {/* Action Button: Tambah Jadwal Saya */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenAddModal(selectedDate)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Jadwal Saya</span>
          </button>
        </div>
      </div>

      {/* 2. UNIFORM CATEGORY LEGEND (PANDUAN PENANDA & WARNA SERAGAM) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <Tag className="w-4 h-4 text-blue-600" />
          <span>Panduan Penanda Tanggal:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Legend 1: Ulangan */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span>Ulangan & Ujian</span>
          </div>

          {/* Legend 2: Tenggat Tugas */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-sky-600" />
            <span>Tenggat Tugas Matematika</span>
          </div>

          {/* Legend 3: Belajar Mandiri */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Jadwal Belajar Saya</span>
          </div>

          {/* Legend 4: Agenda Sekolah */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Agenda Sekolah / Kelas</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: CALENDAR GRID (LEFT 2/3) + DETAIL AGENDA PANEL (RIGHT 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: INTERACTIVE MONTH CALENDAR */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
          {/* Month Switcher Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900 tracking-tight font-heading">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                Semester Ganjil
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleJumpToToday}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Hari Ini
              </button>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={handlePrevMonth}
                  title="Bulan Sebelumnya"
                  className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  title="Bulan Berikutnya"
                  className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            {DAY_NAMES.map((name, i) => (
              <div
                key={name}
                className={`py-1 ${
                  i === 5 ? "text-amber-500" : i === 6 ? "text-rose-500" : ""
                }`}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((d, idx) => {
              const events = activitiesByDate.get(d.isoDate);
              const hasAgendas = (events?.agendas.length || 0) > 0;
              const hasDeadlines = (events?.deadlines.length || 0) > 0;
              const hasCustom = (events?.schedules.length || 0) > 0;
              const isSelected = d.isoDate === selectedDate;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(d.isoDate)}
                  className={`group relative p-2 sm:p-2.5 rounded-2xl min-h-[92px] sm:min-h-[105px] flex flex-col justify-between text-left transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-md border-slate-900 ring-2 ring-slate-900/30 scale-[1.02] z-10"
                      : d.isToday
                      ? "bg-blue-50/70 border-blue-400 text-slate-900 ring-1 ring-blue-400/40"
                      : d.isCurrentMonth
                      ? "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800 hover:border-slate-300"
                      : "bg-slate-50/30 border-transparent text-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  {/* Top Bar of Day Cell */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-black ${
                        isSelected
                          ? "text-white"
                          : d.isToday
                          ? "text-blue-600 font-extrabold"
                          : d.isCurrentMonth
                          ? "text-slate-800"
                          : "text-slate-300"
                      }`}
                    >
                      {d.day}
                    </span>

                    {/* Quick Add Button on Hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddModal(d.isoDate);
                      }}
                      title="Tambah Jadwal Saya di tanggal ini"
                      className={`opacity-0 group-hover:opacity-100 transition p-1 rounded-md text-[10px] ${
                        isSelected
                          ? "bg-white/20 text-white hover:bg-white/30"
                          : "bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-500"
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Visual Event Badges in Cell (Seragam Makanan yang Sama) */}
                  <div className="space-y-1 my-1 overflow-hidden">
                    {/* 1. Tenggat Tugas Matematika Badge */}
                    {hasDeadlines && (
                      <div
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-md truncate flex items-center gap-1 ${
                          isSelected
                            ? "bg-sky-400 text-slate-950 font-bold"
                            : "bg-sky-100 text-sky-900 border border-sky-300"
                        }`}
                        title={events?.deadlines.map((x) => x.judul).join(", ")}
                      >
                        <Clock className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">Tenggat Math</span>
                      </div>
                    )}

                    {/* 2. Ulangan / Ujian Badge */}
                    {hasAgendas && (
                      <div
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-md truncate flex items-center gap-1 ${
                          isSelected
                            ? "bg-indigo-300 text-indigo-950 font-bold"
                            : "bg-indigo-100 text-indigo-900 border border-indigo-300"
                        }`}
                        title={events?.agendas.map((x) => x.judul).join(", ")}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                        <span className="truncate">{events?.agendas[0].judul}</span>
                      </div>
                    )}

                    {/* 3. Belajar Mandiri Siswa Badge */}
                    {hasCustom && (
                      <div
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate flex items-center gap-1 ${
                          isSelected
                            ? "bg-emerald-300 text-emerald-950"
                            : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                        }`}
                        title={events?.schedules.map((x) => x.judul).join(", ")}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        <span className="truncate">{events?.schedules[0].judul}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Indicator Dots */}
                  <div className="flex items-center gap-1 pt-0.5">
                    {hasDeadlines && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-sky-300" : "bg-sky-500"
                        }`}
                      />
                    )}
                    {hasAgendas && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-indigo-300" : "bg-indigo-600"
                        }`}
                      />
                    )}
                    {hasCustom && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-emerald-300" : "bg-emerald-500"
                        }`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL AGENDA TANGGAL TERPILIH & JADWAL PRIBADI */}
        <div className="space-y-5">
          {/* Daily Detail Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                  Rincian Tanggal
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading">
                  {selectedDateFormatted}
                </h3>
              </div>
              <button
                onClick={() => handleOpenAddModal(selectedDate)}
                title="Tambah Jadwal Baru di Tanggal Ini"
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* SECTION A: TENGGAT TUGAS & ULANGAN MATEMATIKA HARI INI */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  <span>Tenggat Tugas Matematika</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                  {selectedDateEvents.deadlines.length} Tugas
                </span>
              </div>

              {selectedDateEvents.deadlines.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-150 text-xs text-slate-400 text-center">
                  Tidak ada tenggat tugas matematika di tanggal ini.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDateEvents.deadlines.map((dl) => (
                    <div
                      key={dl.id}
                      className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-sky-950 leading-snug">
                            {dl.judul}
                          </div>
                          <div className="text-[11px] text-sky-700 mt-0.5">
                            Batas Waktu: {dl.jam || "23:59 WIB"} • KKM: {dl.passingGrade}
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-sky-600 text-white shrink-0">
                          Wajib
                        </span>
                      </div>

                      <Link
                        href="/ujian"
                        className="w-full py-1.5 rounded-xl bg-white hover:bg-sky-600 text-sky-800 hover:text-white border border-sky-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Kerjakan Tugas / Ulangan →</span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION B: AGENDA SEKOLAH & ULANGAN RESMI */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Agenda Sekolah & Ulangan</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                  {selectedDateEvents.agendas.length} Agenda
                </span>
              </div>

              {selectedDateEvents.agendas.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-150 text-xs text-slate-400 text-center">
                  Tidak ada agenda resmi sekolah pada tanggal ini.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDateEvents.agendas.map((ag) => (
                    <div
                      key={ag.id}
                      className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/90 shadow-2xs space-y-1"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs font-bold text-indigo-950">
                          {ag.judul}
                        </span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-600 text-white shrink-0">
                          {ag.kategori}
                        </span>
                      </div>
                      {ag.deskripsi && (
                        <div className="p-2.5 rounded-xl bg-white/90 border border-indigo-200/80 shadow-2xs my-1">
                          <FormattedNotesView content={ag.deskripsi} />
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] font-semibold text-indigo-700 pt-0.5">
                        {ag.jam_mulai && <span>⏰ {ag.jam_mulai.substring(0, 5)} WIB</span>}
                        {ag.lokasi && <span>📍 {ag.lokasi}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION C: JADWAL BELAJAR MANDIRI SAYA (CUSTOM SISWA) */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Jadwal Belajar Saya</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {selectedDateEvents.schedules.length} Kegiatan
                </span>
              </div>

              {selectedDateEvents.schedules.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-50/40 border border-dashed border-emerald-200 text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    Belum ada jadwal belajar yang Anda buat untuk hari ini.
                  </p>
                  <button
                    onClick={() => handleOpenAddModal(selectedDate)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat Jadwal Mandiri Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDateEvents.schedules.map((sch) => (
                    <div
                      key={sch.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        sch.selesai
                          ? "bg-slate-50 border-slate-200 text-slate-400"
                          : "bg-emerald-50/80 border-emerald-200 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleComplete(sch.id)}
                            title={sch.selesai ? "Tandai Belum Selesai" : "Tandai Selesai"}
                            className="mt-0.5 text-emerald-600 hover:text-emerald-800 cursor-pointer shrink-0"
                          >
                            {sch.selesai ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-emerald-400 hover:text-emerald-600" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <div
                              className={`text-xs font-bold leading-snug truncate ${
                                sch.selesai
                                  ? "line-through text-slate-400"
                                  : "text-emerald-950"
                              }`}
                            >
                              {sch.judul}
                            </div>
                            <div className="text-[11px] text-emerald-800/80 mt-0.5">
                              {sch.jam_mulai ? `${sch.jam_mulai} - ${sch.jam_selesai || ""} WIB` : "Waktu Fleksibel"}
                            </div>
                            {sch.catatan && (
                              <div className="mt-1 p-2 rounded-xl bg-white/80 border border-emerald-200/60 text-[11px] shadow-2xs">
                                <FormattedNotesView content={sch.catatan} />
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteSchedule(sch.id)}
                          title="Hapus Jadwal"
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. MODAL INTERAKTIF: TAMBAH JADWAL SAYA ──────────────────────────────── */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                    Tambah Jadwal Belajar Saya
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Jadwal mandiri khusus Anda untuk memantau tugas & target belajar
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSchedule} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {formError}
                </div>
              )}

              {/* Input 1: Judul Kegiatan */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Judul Kegiatan / Target Belajar *
                </label>
                <input
                  type="text"
                  required
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  placeholder="Misal: Latihan Soal Persamaan Linear Bab 2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                />
              </div>

              {/* Input 2: Tanggal & Waktu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    required
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={formJamMulai}
                    onChange={(e) => setFormJamMulai(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={formJamSelesai}
                    onChange={(e) => setFormJamSelesai(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Input 3: Kategori Penanda Warna */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kategori / Penanda Warna
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setFormKategori("belajar_mandiri")}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                      formKategori === "belajar_mandiri"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-400/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Belajar Mandiri</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormKategori("tugas_mandiri")}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                      formKategori === "tugas_mandiri"
                        ? "bg-sky-50 border-sky-400 text-sky-900 ring-2 ring-sky-400/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                    <span>Tugas Mandiri</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormKategori("persiapan_ujian")}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                      formKategori === "persiapan_ujian"
                        ? "bg-indigo-50 border-indigo-400 text-indigo-900 ring-2 ring-indigo-400/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                    <span>Persiapan Ujian</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormKategori("pengingat")}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                      formKategori === "pengingat"
                        ? "bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span>Pengingat Khusus</span>
                  </button>
                </div>
              </div>

              {/* Input 4: Catatan Pengingat */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Catatan Pengingat (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  placeholder="Tuliskan materi yang ingin dituntaskan atau catatan rumus..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Simpan Jadwal Saya
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

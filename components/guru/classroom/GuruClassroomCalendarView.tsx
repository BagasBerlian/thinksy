"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  Bell,
  X,
  Check,
  RefreshCw,
  BookOpen,
  Layers,
  Trash2,
  Sparkles,
  Bold,
  Italic,
  Underline,
  List,
  FileText,
  Eye,
  Edit3,
  CalendarDays,
} from "lucide-react";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { FormattedNotesView } from "@/components/ui/FormattedNotesView";

export interface AcademicAgendaItem {
  id: string;
  judul: string;
  deskripsi?: string;
  kategori: "kbm" | "tugas" | "ujian";
  tanggal: string; // YYYY-MM-DD
  jam: string;
  lokasi: string;
  badgeLabel?: string;
  siswaCount?: number;
}

interface GuruClassroomCalendarViewProps {
  onBackToClass?: () => void;
}

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

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

// Initial academic schedules spanning 2026 - 2027
const INITIAL_AGENDAS: AcademicAgendaItem[] = [
  {
    id: "acad-1",
    judul: "Matematika (Kelas 8) • Pembelajaran Tatap Muka",
    deskripsi: "Pembelajaran tatap muka materi Bilangan Berpangkat & Bentuk Akar",
    kategori: "kbm",
    tanggal: "2026-10-19",
    jam: "07:30 - 09:00 WIB",
    lokasi: "Ruang 8-A",
    badgeLabel: "Hari Ini",
    siswaCount: 32,
  },
  {
    id: "acad-2",
    judul: "Tenggat: Latihan Soal Bilangan Berpangkat",
    deskripsi: "Pengumpulan tugas latihan perkalian dan pembagian pangkat bulat",
    kategori: "tugas",
    tanggal: "2026-10-20",
    jam: "Pukul 12:00 WIB",
    lokasi: "Google Classroom",
    badgeLabel: "Besok",
    siswaCount: 32,
  },
  {
    id: "acad-3",
    judul: "Kuis Formatif Bab 1 Bilangan Berpangkat",
    deskripsi: "Kuis formatif daring evaluasi eksponen",
    kategori: "ujian",
    tanggal: "2026-10-23",
    jam: "08:00 - 09:30 WIB",
    lokasi: "Lab CBT 1",
    badgeLabel: "Jumat Ini",
    siswaCount: 32,
  },
  {
    id: "acad-4",
    judul: "Tenggat: Latihan Soal Cerita Teorema Pythagoras",
    deskripsi: "Latihan pemodelan segitiga siku-siku dan tripel pythagoras",
    kategori: "tugas",
    tanggal: "2026-10-27",
    jam: "Pukul 23:59 WIB",
    lokasi: "Google Classroom",
    siswaCount: 32,
  },
  {
    id: "acad-5",
    judul: "Penilaian Tengah Semester (PTS) Ganjil",
    deskripsi: "PTS resmi Matematika Kelas 8 Fase D",
    kategori: "ujian",
    tanggal: "2026-11-02",
    jam: "07:30 - 09:30 WIB",
    lokasi: "Ruang 8-A",
    siswaCount: 32,
  },
  {
    id: "acad-6",
    judul: "Penilaian Akhir Semester (PAS) Ganjil",
    deskripsi: "Ujian Akhir Semester Ganjil TA 2026/2027",
    kategori: "ujian",
    tanggal: "2026-12-07",
    jam: "07:30 - 09:30 WIB",
    lokasi: "Ruang 8-A",
    siswaCount: 32,
  },
  {
    id: "acad-7",
    judul: "Awal Masuk Pembelajaran Semester Genap",
    deskripsi: "Hari pertama KBM Semester Genap 2027",
    kategori: "kbm",
    tanggal: "2027-01-04",
    jam: "07:30 - 09:00 WIB",
    lokasi: "Ruang 8-A",
    siswaCount: 32,
  },
];

export default function GuruClassroomCalendarView({}: GuruClassroomCalendarViewProps) {
  // Calendar month & year navigator (2026 - 2027)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = Oktober

  // Selected date for viewing / editing
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-10-19");
  const [agendas, setAgendas] = useState<AcademicAgendaItem[]>(INITIAL_AGENDAS);

  // Popup Modal State (Untuk bikin jadwal saat pencet nomor)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDateStr, setModalDateStr] = useState<string>("2026-10-19");
  const [editingAgendaId, setEditingAgendaId] = useState<string | null>(null);

  // Simple Form Inputs
  const [formJudul, setFormJudul] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [isPreviewNotes, setIsPreviewNotes] = useState(false);
  const [formJam, setFormJam] = useState("Pukul 09:00 WIB");
  const [formKategori, setFormKategori] = useState<"tugas" | "kbm" | "ujian">("tugas");
  const [formLokasi, setFormLokasi] = useState("Ruang 8-A");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(
    null
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Real-time Dashboard Hook
  const { broadcastEvent } = useRealtimeDashboard();

  const showToast = (text: string, type: "success" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper format date in Indonesian (e.g. "Senin, 19 Oktober 2026")
  const formatIndonesianDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to get Indonesian Day Name (e.g. "Kamis")
  const getIndonesianDayName = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString("id-ID", { weekday: "long" });
    } catch {
      return "";
    }
  };

  // Helper to shift date (+1 day, +7 days, etc.)
  const addDaysToDate = (dateStr: string, daysToAdd: number) => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      dt.setDate(dt.getDate() + daysToAdd);
      const newY = dt.getFullYear();
      const newM = String(dt.getMonth() + 1).padStart(2, "0");
      const newD = String(dt.getDate()).padStart(2, "0");
      return `${newY}-${newM}-${newD}`;
    } catch {
      return dateStr;
    }
  };

  // Format Notes Helpers (B, I, U, • List, Snippets)
  const applyFormatting = (prefix: string, suffix: string, defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setFormDeskripsi((prev) => prev + prefix + defaultText + suffix);
      return;
    }

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const text = formDeskripsi;

    const rawSelected = text.substring(start, end);
    if (!rawSelected) {
      const replacement = `${prefix}${defaultText}${suffix}`;
      const newText = text.substring(0, start) + replacement + text.substring(end);
      setFormDeskripsi(newText);
      setTimeout(() => {
        textarea.focus();
        const cursorTarget = start + prefix.length + defaultText.length;
        textarea.setSelectionRange(cursorTarget, cursorTarget);
      }, 0);
      return;
    }

    // Smart whitespace trimming
    const leading = rawSelected.match(/^(\s*)/)?.[1] || "";
    const trailing = rawSelected.match(/(\s*)$/)?.[1] || "";
    const core = rawSelected.substring(leading.length, rawSelected.length - trailing.length);

    if (!core) {
      return;
    }

    // Toggle off if already wrapped
    if (core.startsWith(prefix) && core.endsWith(suffix) && core.length >= prefix.length + suffix.length) {
      const unwrapped = core.slice(prefix.length, core.length - suffix.length);
      const replacement = leading + unwrapped + trailing;
      const newText = text.substring(0, start) + replacement + text.substring(end);
      setFormDeskripsi(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + leading.length, start + leading.length + unwrapped.length);
      }, 0);
      return;
    }

    const replacement = `${leading}${prefix}${core}${suffix}${trailing}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setFormDeskripsi(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + leading.length, start + leading.length + prefix.length + core.length + suffix.length);
    }, 0);
  };

  const insertBullet = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setFormDeskripsi((prev) => prev + (prev.endsWith("\n") ? "" : "\n") + "• ");
      return;
    }
    const start = textarea.selectionStart;
    const text = formDeskripsi;
    const needsNewline = start > 0 && text[start - 1] !== "\n";
    const insertion = (needsNewline ? "\n" : "") + "• ";
    const newText = text.substring(0, start) + insertion + text.substring(start);
    setFormDeskripsi(newText);
    setTimeout(() => {
      textarea.focus();
      const newPos = start + insertion.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const insertSnippet = (snippetText: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setFormDeskripsi((prev) => prev + (prev.endsWith("\n") ? "" : "\n") + snippetText);
      return;
    }
    const start = textarea.selectionStart;
    const text = formDeskripsi;
    const needsNewline = start > 0 && text[start - 1] !== "\n";
    const insertion = (needsNewline ? "\n" : "") + snippetText;
    const newText = text.substring(0, start) + insertion + text.substring(start);
    setFormDeskripsi(newText);
    setTimeout(() => {
      textarea.focus();
      const newPos = start + insertion.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      if (currentYear > 2024) {
        setCurrentYear(currentYear - 1);
        setCurrentMonth(11);
      }
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      if (currentYear < 2030) {
        setCurrentYear(currentYear + 1);
        setCurrentMonth(0);
      }
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(9); // Oktober
    setSelectedDateStr("2026-10-19");
  };

  // "Tinggal pencet nomer" -> Langsung buka form tulis judul, notes & pilih waktu
  const handleDateCellClick = (isoDate: string) => {
    setSelectedDateStr(isoDate);
    setModalDateStr(isoDate);
    setEditingAgendaId(null);
    setFormJudul("");
    setFormDeskripsi("");
    setIsPreviewNotes(false);
    setFormJam("Pukul 09:00 WIB");
    setFormKategori("tugas");
    setFormLokasi("Ruang 8-A");
    setIsModalOpen(true);
  };

  // Edit existing agenda
  const handleEditAgenda = (agenda: AcademicAgendaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedDateStr(agenda.tanggal);
    setModalDateStr(agenda.tanggal);
    setEditingAgendaId(agenda.id);
    setFormJudul(agenda.judul);
    setFormDeskripsi(agenda.deskripsi || "");
    setIsPreviewNotes(false);
    setFormJam(agenda.jam);
    setFormKategori(agenda.kategori);
    setFormLokasi(agenda.lokasi);
    setIsModalOpen(true);
  };

  // Delete agenda
  const handleDeleteAgenda = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAgendas((prev) => prev.filter((a) => a.id !== id));
    showToast("Jadwal berhasil dihapus.", "info");

    try {
      await fetch(`/api/guru/agenda?id=${id}`, { method: "DELETE" });
    } catch {}
  };

  // Simpan Jadwal & Kirim Notifikasi Real-time ke Siswa
  const handleSaveAgenda = async () => {
    if (!formJudul.trim()) {
      showToast("Tuliskan judul jadwal terlebih dahulu.", "info");
      return;
    }

    setIsSaving(true);
    const dateFormatted = formatIndonesianDate(modalDateStr);
    const isNew = !editingAgendaId;
    const agendaId = editingAgendaId || `acad-${Date.now()}`;

    const deskripsiFinal =
      formDeskripsi.trim() || `Jadwal kegiatan akademik Matematika Kelas 8: ${formJudul.trim()}.`;

    const newOrUpdatedItem: AcademicAgendaItem = {
      id: agendaId,
      judul: formJudul.trim(),
      deskripsi: deskripsiFinal,
      kategori: formKategori,
      tanggal: modalDateStr,
      jam: formJam.trim() || "07:30 - 09:00 WIB",
      lokasi: formLokasi.trim() || "Ruang 8-A",
      siswaCount: 32,
    };

    try {
      // 1. API Database Call
      try {
        await fetch("/api/guru/agenda", {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: newOrUpdatedItem.id,
            judul: newOrUpdatedItem.judul,
            deskripsi: newOrUpdatedItem.deskripsi,
            kategori: newOrUpdatedItem.kategori,
            tanggal: newOrUpdatedItem.tanggal,
            jam_mulai: newOrUpdatedItem.jam,
            lokasi: newOrUpdatedItem.lokasi,
          }),
        });
      } catch {}

      // 2. Real-time Broadcast ke Dashboard Seluruh Siswa
      const notifMessage = `Guru ${isNew ? "menambahkan jadwal baru" : "memperbarui jadwal"}: "${
        newOrUpdatedItem.judul
      }" pada ${dateFormatted} (${newOrUpdatedItem.jam}).`;

      await broadcastEvent("ACADEMIC_CALENDAR_UPDATED", {
        agenda: newOrUpdatedItem,
        judul: newOrUpdatedItem.judul,
        deskripsi: newOrUpdatedItem.deskripsi,
        tanggal: newOrUpdatedItem.tanggal,
        tanggalFormatted: dateFormatted,
        jam: newOrUpdatedItem.jam,
        message: notifMessage,
      });

      // 3. Cross-tab Local Storage Sync (Notifikasi langsung muncul di tab siswa yang terbuka)
      try {
        localStorage.setItem(
          "thinksy_realtime_calendar_event",
          JSON.stringify({
            agenda: newOrUpdatedItem,
            judul: newOrUpdatedItem.judul,
            deskripsi: newOrUpdatedItem.deskripsi,
            tanggal: newOrUpdatedItem.tanggal,
            tanggalFormatted: dateFormatted,
            jam: newOrUpdatedItem.jam,
            message: notifMessage,
            timestamp: Date.now(),
          })
        );
      } catch {}

      // 4. Update Teacher Agenda State
      setAgendas((prev) => {
        if (isNew) {
          return [newOrUpdatedItem, ...prev];
        }
        return prev.map((a) => (a.id === newOrUpdatedItem.id ? newOrUpdatedItem : a));
      });

      // Sinkronkan tanggal aktif kalender dengan tanggal yang baru dijadwalkan
      setSelectedDateStr(modalDateStr);

      setIsModalOpen(false);
      showToast(
        `✅ Berhasil disimpan! Jadwal & catatan materi telah terintegrasi ke dashboard siswa.`,
        "success"
      );
    } catch {
      showToast("Gagal menyimpan jadwal.", "info");
    } finally {
      setIsSaving(false);
    }
  };

  // Build Month Days Matrix (Senin s/d Minggu)
  const calendarGrid = useMemo(() => {
    // Total days in current month
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    // First day of month (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    // Convert to Monday = 0, ..., Sunday = 6
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    // Previous month total days for padding
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // 1. Padding days from previous month
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        dayNum: prevMonthDays - i,
        isCurrentMonth: false,
        isoDate: "",
        agendas: [] as AcademicAgendaItem[],
      });
    }

    // 2. Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      const isoDate = `${currentYear}-${monthStr}-${dayStr}`;

      const dayAgendas = agendas.filter((a) => a.tanggal === isoDate);

      days.push({
        dayNum: d,
        isCurrentMonth: true,
        isoDate,
        agendas: dayAgendas,
        isToday: isoDate === "2026-10-19",
      });
    }

    // 3. Padding days for next month to complete the grid (multiples of 7)
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        days.push({
          dayNum: i,
          isCurrentMonth: false,
          isoDate: "",
          agendas: [] as AcademicAgendaItem[],
        });
      }
    }

    return days;
  }, [currentYear, currentMonth, agendas]);

  // Agendas for selected date or current month
  const selectedDateAgendas = useMemo(() => {
    return agendas.filter((a) => a.tanggal === selectedDateStr);
  }, [agendas, selectedDateStr]);

  const currentMonthAgendas = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    return agendas.filter((a) => a.tanggal.startsWith(monthPrefix));
  }, [agendas, currentYear, currentMonth]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-semibold transition-all animate-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === "success"
              ? "bg-[#0B57D0] text-white border border-blue-400"
              : "bg-slate-900 text-white border border-slate-700"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          ) : (
            <Bell className="w-5 h-5 text-amber-300 shrink-0 animate-bounce" />
          )}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER SECTION: Title, Real-time indicator & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0B57D0] to-[#2563EB] text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
                Calendar Akademik
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Real-time ke Siswa</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pencet angka tanggal untuk langsung membuat atau mengatur jadwal. Siswa menerima notifikasi otomatis.
            </p>
          </div>
        </div>

        {/* Quick Action: Tambah Jadwal & Lompat Hari Ini */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            Hari Ini
          </button>

          <button
            type="button"
            onClick={() => handleDateCellClick(selectedDateStr || "2026-10-19")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B57D0] hover:bg-[#0842a0] text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Jadwal</span>
          </button>
        </div>
      </div>

      {/* MONTH & YEAR NAVIGATOR (2026 - 2027) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Month & Year Title with Previous / Next Arrows */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={currentYear === 2026 && currentMonth === 0}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={currentYear === 2027 && currentMonth === 11}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              title="Bulan berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Tahun Ajaran 2026 / 2027 • Kelas 8-A Matematika
            </p>
          </div>
        </div>

        {/* Month & Year Selectors (Tahun disamakan seperti bulan, jadi bisa milih keduanya) */}
        <div className="flex items-center gap-2">
          {/* Month Dropdown */}
          <div className="relative">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              aria-label="Pilih Bulan"
              className="text-xs bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl pl-3.5 pr-8 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition shadow-2xs appearance-none"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Year Dropdown (Sama persis seperti dropdown bulan) */}
          <div className="relative">
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              aria-label="Pilih Tahun"
              className="text-xs bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl pl-3.5 pr-8 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition shadow-2xs appearance-none"
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* MONTHLY CALENDAR GRID (Senin s/d Minggu, Angka 1-31, Pencet Nomor Langsung Jadwalkan) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Day Header Row */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80 text-center py-2.5">
          {DAY_LABELS.map((label, idx) => (
            <div
              key={label}
              className={`text-xs font-bold uppercase tracking-wider ${
                idx >= 5 ? "text-rose-500" : "text-slate-500"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Date Number Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {calendarGrid.map((cell, idx) => {
            if (!cell.isCurrentMonth) {
              return (
                <div
                  key={`pad-${idx}`}
                  className="min-h-[75px] sm:min-h-[90px] p-2 bg-slate-50/40 text-slate-300 font-bold text-xs select-none pointer-events-none"
                >
                  {cell.dayNum}
                </div>
              );
            }

            const isSelected = selectedDateStr === cell.isoDate;
            const hasAgendas = cell.agendas.length > 0;

            return (
              <div
                key={cell.isoDate}
                onClick={() => handleDateCellClick(cell.isoDate)}
                className={`min-h-[75px] sm:min-h-[95px] p-2 sm:p-2.5 transition-all cursor-pointer relative flex flex-col justify-between group ${
                  isSelected
                    ? "bg-blue-50/70 ring-2 ring-inset ring-[#0B57D0]"
                    : "hover:bg-slate-50 hover:shadow-2xs"
                }`}
                title={`Pencet nomor ${cell.dayNum} untuk jadwalkan kegiatan`}
              >
                {/* Top Number Row */}
                <div className="flex items-center justify-between">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition ${
                      cell.isToday
                        ? "bg-[#0B57D0] text-white shadow-xs"
                        : isSelected
                        ? "text-[#0B57D0] font-black"
                        : "text-slate-700 group-hover:text-[#0B57D0]"
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {/* Plus icon on hover for quick add prompt */}
                  <span className="opacity-0 group-hover:opacity-100 transition text-[10px] text-blue-600 font-extrabold flex items-center gap-0.5 bg-blue-100 px-1.5 py-0.5 rounded-md">
                    + Jadwal
                  </span>
                </div>

                {/* Agendas Preview Chips inside the Date Cell */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {cell.agendas.slice(0, 2).map((a) => (
                    <div
                      key={a.id}
                      onClick={(e) => handleEditAgenda(a, e)}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md truncate cursor-pointer transition shadow-3xs ${
                        a.kategori === "kbm"
                          ? "bg-blue-100 text-blue-900 hover:bg-blue-200"
                          : a.kategori === "tugas"
                          ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                          : "bg-purple-100 text-purple-900 hover:bg-purple-200"
                      }`}
                      title={`${a.judul} (${a.jam})`}
                    >
                      {a.judul}
                    </div>
                  ))}

                  {cell.agendas.length > 2 && (
                    <div className="text-[9px] font-bold text-slate-400 pl-1">
                      +{cell.agendas.length - 2} jadwal lainnya
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AGENDA SUMMARY SECTION (Daftar Agenda Tanggal Terpilih & Bulan Ini) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Agenda {formatIndonesianDate(selectedDateStr)}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {selectedDateAgendas.length > 0
                ? `${selectedDateAgendas.length} kegiatan terjadwal di tanggal ini`
                : "Belum ada agenda pada tanggal ini. Klik tombol di bawah atau nomor kalender untuk menambahkan."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleDateCellClick(selectedDateStr)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#0B57D0] hover:bg-blue-100 text-xs font-bold transition cursor-pointer self-start sm:self-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Jadwalkan di Tanggal Ini</span>
          </button>
        </div>

        {/* Selected Date Agendas */}
        {selectedDateAgendas.length > 0 ? (
          <div className="space-y-2.5">
            {selectedDateAgendas.map((item) => (
              <div
                key={item.id}
                onClick={() => handleEditAgenda(item)}
                className="p-4 rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-xs transition bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      item.kategori === "kbm"
                        ? "bg-blue-600 text-white"
                        : item.kategori === "tugas"
                        ? "bg-amber-500 text-white"
                        : "bg-purple-600 text-white"
                    }`}
                  >
                    {item.kategori === "kbm" ? (
                      <BookOpen className="w-4 h-4" />
                    ) : item.kategori === "tugas" ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <Layers className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition block">
                      {item.judul}
                    </span>
                    <span className="text-xs text-slate-500 font-medium block">
                      {item.jam} • {item.lokasi}
                    </span>
                    {item.deskripsi && (
                      <div className="mt-1.5 p-2.5 rounded-xl bg-white/90 border border-slate-200/80 text-xs">
                        <FormattedNotesView content={item.deskripsi} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => handleEditAgenda(item, e)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-xs font-bold text-slate-700 transition"
                  >
                    Ubah
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteAgenda(item.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Hapus jadwal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Fallback: Tampilkan Agenda Lain di Bulan Berjalan */
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Jadwal Lain di Bulan {MONTH_NAMES[currentMonth]} {currentYear}:
            </div>
            {currentMonthAgendas.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => handleEditAgenda(item)}
                className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 transition flex items-center justify-between cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 text-xs block">
                    {item.judul}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {formatIndonesianDate(item.tanggal)} • {item.jam}
                  </span>
                  {item.deskripsi && (
                    <div className="mt-1 p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] max-w-md">
                      <FormattedNotesView content={item.deskripsi} />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Ubah Tanggal
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POPUP MODAL: ATUR HARI/TANGGAL -> TULIS JUDUL -> NOTES DENGAN FORMAT TEBAL/MIRING/LIST -> PILIH WAKTU -> SINKRONISASI KE SISWA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[94vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/90 via-slate-50 to-amber-50/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0B57D0] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingAgendaId ? "Ubah Jadwal & Catatan" : "Buat Jadwal Baru"}
                  </h3>
                  <p className="text-xs text-[#0B57D0] font-bold flex items-center gap-1.5">
                    <span>📅 {formatIndonesianDate(modalDateStr)}</span>
                    <span className="w-1 h-1 rounded-full bg-blue-400" />
                    <span className="text-blue-800">Hari {getIndonesianDayName(modalDateStr)}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: User-Friendly Form with Scroll */}
            <div className="p-5 sm:p-6 space-y-4.5 text-xs sm:text-sm overflow-y-auto flex-1">
              {/* 1. Atur Hari & Tanggal Pelaksanaan */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>1. Atur Hari & Tanggal Pelaksanaan</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Hari {getIndonesianDayName(modalDateStr)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  {/* Date Picker Input */}
                  <div className="sm:col-span-7">
                    <input
                      type="date"
                      value={modalDateStr}
                      onChange={(e) => {
                        if (e.target.value) {
                          setModalDateStr(e.target.value);
                        }
                      }}
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                    />
                  </div>

                  {/* Quick Shift Shortcut Buttons */}
                  <div className="sm:col-span-5 grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setModalDateStr("2026-10-19")}
                      className="px-2 py-2 text-[10px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition text-center cursor-pointer"
                      title="Atur ke Hari Ini"
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalDateStr((d) => addDaysToDate(d, 1))}
                      className="px-2 py-2 text-[10px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition text-center cursor-pointer"
                      title="Tambah 1 Hari (Besok)"
                    >
                      +1 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalDateStr((d) => addDaysToDate(d, 7))}
                      className="px-2 py-2 text-[10px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition text-center cursor-pointer"
                      title="Tambah 7 Hari (Minggu Depan)"
                    >
                      +7 Hari
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Tulis Judul Jadwal / Tugas */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Tulis Judul Jadwal / Tugas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  placeholder="Contoh: Tenggat: Latihan Soal Teorema Pythagoras"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              {/* 3. Kotak Catatan & Deskripsi Materi (Gaya Notes dengan Toolbar Tebal, Miring, Garis Bawah, List) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>3. Catatan & Deskripsi Materi (Gaya Notes)</span>
                  </label>

                  {/* Mode Tulis / Pratinjau Switch */}
                  <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-150 border border-slate-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setIsPreviewNotes(false)}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                        !isPreviewNotes
                          ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Tulis</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPreviewNotes(true)}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                        isPreviewNotes
                          ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Pratinjau Notes</span>
                    </button>
                  </div>
                </div>

                {/* Notes Container Box */}
                <div className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/40 to-amber-50/10 overflow-hidden shadow-2xs">
                  {/* Formatting Toolbar (Tebal, Miring, Underline, Bullet List, Snippets) */}
                  <div className="px-3 py-2 border-b border-amber-200/80 bg-amber-100/50 flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => applyFormatting("**", "**", "teks tebal")}
                        title="Tebal / Bold (**teks**)"
                        className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-slate-800 border border-amber-300/80 flex items-center justify-center font-black text-xs shadow-2xs hover:text-blue-700 transition cursor-pointer"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("*", "*", "teks miring")}
                        title="Miring / Italic (*teks*)"
                        className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-slate-800 border border-amber-300/80 flex items-center justify-center text-xs shadow-2xs hover:text-blue-700 transition cursor-pointer"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("<u>", "</u>", "teks garis bawah")}
                        title="Garis Bawah / Underline (<u>teks</u>)"
                        className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-slate-800 border border-amber-300/80 flex items-center justify-center text-xs shadow-2xs hover:text-blue-700 transition cursor-pointer"
                      >
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={insertBullet}
                        title="Poin Daftar (• Item)"
                        className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-slate-800 border border-amber-300/80 flex items-center justify-center text-xs shadow-2xs hover:text-blue-700 transition cursor-pointer"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-px h-4 bg-amber-300 mx-1" />

                      {/* Template Snippets */}
                      <div className="hidden sm:flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => insertSnippet("\n[Materi]: ")}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 hover:bg-white text-slate-700 border border-amber-300/70 hover:text-blue-700 transition cursor-pointer"
                        >
                          + [Materi]
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet("\n[Catatan]: ")}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 hover:bg-white text-slate-700 border border-amber-300/70 hover:text-blue-700 transition cursor-pointer"
                        >
                          + [Catatan]
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet("\n[Instruksi]: ")}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 hover:bg-white text-slate-700 border border-amber-300/70 hover:text-blue-700 transition cursor-pointer"
                        >
                          + [Instruksi]
                        </button>
                      </div>
                    </div>

                    <span className="text-[10px] text-amber-900/80 font-bold hidden sm:inline">
                      Notes Toolbar
                    </span>
                  </div>

                  {/* Notes Content: Textarea or Live Preview */}
                  <div className="p-3">
                    {!isPreviewNotes ? (
                      <div>
                        <textarea
                          ref={textareaRef}
                          rows={4}
                          value={formDeskripsi}
                          onChange={(e) => setFormDeskripsi(e.target.value)}
                          placeholder="Tuliskan catatan materi, rumus penting, instruksi pengerjaan tugas, atau pengingat belajar di sini...&#10;Contoh:&#10;**Materi Pokok:** Bilangan Berpangkat Bulat Positif&#10;• Buka Buku Bab 1 Halaman *24 - 30*&#10;• Kerjakan soal latihan nomor <u>1 sampai 5</u>"
                          className="w-full text-xs sm:text-[13px] p-2.5 rounded-xl border border-amber-200/90 bg-white text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-amber-400 leading-relaxed resize-y min-h-[95px] placeholder:text-slate-400"
                        />
                        <div className="flex items-center justify-between text-[10px] text-amber-900/80 mt-1 font-medium">
                          <span>
                            Format didukung: <strong>**tebal**</strong>, <em>*miring*</em>, <u>&lt;u&gt;garis bawah&lt;/u&gt;</u>, • daftar poin.
                          </span>
                          <span className="text-slate-400 font-normal">
                            {formDeskripsi.length} karakter
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-white border border-amber-200/80 min-h-[95px] space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 pb-1 border-b border-amber-100">
                          <Eye className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pratinjau Catatan di Dashboard Siswa:</span>
                        </div>
                        <FormattedNotesView
                          content={formDeskripsi}
                          emptyPlaceholder="Catatan masih kosong. Klik 'Tulis' untuk menambahkan catatan materi."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Pilih Waktu Pelaksanaan */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  4. Pilih Waktu Pelaksanaan
                </label>

                {/* Preset Waktu Kilat */}
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {["07:30 WIB", "09:00 WIB", "12:00 WIB", "23:59 WIB"].map((timePreset) => (
                    <button
                      key={timePreset}
                      type="button"
                      onClick={() => setFormJam(`Pukul ${timePreset}`)}
                      className={`py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition border cursor-pointer text-center ${
                        formJam.includes(timePreset)
                          ? "bg-blue-50 border-blue-500 text-[#0B57D0]"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {timePreset}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={formJam}
                  onChange={(e) => setFormJam(e.target.value)}
                  placeholder="Contoh: 07:30 - 09:00 WIB atau Pukul 12:00 WIB"
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              {/* 5. Kategori */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  5. Kategori
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "tugas", label: "⏰ Tugas", style: "text-amber-700 bg-amber-50 border-amber-300" },
                    { id: "kbm", label: "📘 Tatap Muka", style: "text-blue-700 bg-blue-50 border-blue-300" },
                    { id: "ujian", label: "🏆 Ujian / Kuis", style: "text-purple-700 bg-purple-50 border-purple-300" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormKategori(cat.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer text-center ${
                        formKategori === cat.id
                          ? `${cat.style} ring-2 ring-blue-500/20 shadow-2xs font-extrabold`
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Notice */}
              <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-start gap-2.5">
                <Bell className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-900 font-medium leading-relaxed">
                  Saat disimpan, jadwal dan catatan notes ini langsung <strong>muncul di kalender siswa</strong> dan mengirimkan notifikasi <em>real-time</em> ke dashboard mereka.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveAgenda}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B57D0] hover:bg-[#0842a0] text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Simpan & Beritahu Siswa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

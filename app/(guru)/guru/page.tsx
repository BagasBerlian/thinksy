"use client";

import { useState, useEffect, useCallback } from "react";
import GuruLayout, { GuruNavView } from "@/components/guru/GuruLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import AttendanceLimitConfigModal from "@/components/guru/AttendanceLimitConfigModal";
import StudentLeaderboardWidget from "@/components/guru/StudentLeaderboardWidget";
import GuruNotificationModal from "@/components/guru/GuruNotificationModal";
import GuruAttendanceDeadlineModal from "@/components/guru/GuruAttendanceDeadlineModal";
import RealtimeAttendanceNormalScreen from "@/components/guru/RealtimeAttendanceNormalScreen";
import ManajemenKelasNormalScreen from "@/components/guru/ManajemenKelasNormalScreen";
import ManagementKelasTabScreen from "@/components/guru/ManagementKelasTabScreen";
import CardGuruProfile from "@/components/guru/CardGuruProfile";
import KelasSoalConfigModal from "@/components/guru/KelasSoalConfigModal";
import PengelolaanNormalScreen from "@/components/guru/PengelolaanNormalScreen";
import PengaturanNormalScreen, { DEFAULT_LAYOUT_CONFIG, GuruLayoutConfig } from "@/components/guru/PengaturanNormalScreen";
import {
  TrendingUp,
  Users,
  AlertTriangle,
  Bot,
  FileCheck,
  Plus,
  ArrowRight,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Send,
  BarChart3,
  GraduationCap,
  Bell,
  Target,
  Zap,
  Calendar,
  CheckCircle2,
  Activity,
  X,
  Loader2,
  CheckCircle,
  Search,
  BookMarked,
  Edit,
  Trash2,
  Save,
  Eye,
  Sliders,
  Camera,
  UserCheck,
  UserX,
  Wifi,
  Maximize2,
  ShieldCheck,
  Filter,
  Award,
  AlertCircle,
  CheckSquare,
  FileText,
  MapPin,
  ExternalLink,
  Lock,
  Unlock,
} from "lucide-react";

interface ClassCardData {
  id: string;
  name: string;
  title: string;
  chapter: string;
  studentsCount: number;
  progress: number;
  avgScore: number;
  color: string;
  iconBg: string;
  iconColor: string;
}

interface StudentAttendance {
  id: string;
  name: string;
  class: string;
  isOnline: boolean;
  hasAttended: boolean;
  timeIn: string | null;
  selfieUrl: string;
  status: "Hadir" | "Terverifikasi" | "Terlambat" | "Izin" | "Sakit" | "Alpha" | "Belum Absen" | string;
  scoreAvg: number;
  streak?: number;
  points?: number;
}

interface ScheduleItem {
  id: string;
  time: string;
  className: string;
  room: string;
  topic: string;
  studentsCount: number;
  colorBg: string;
  colorText: string;
  colorBorder: string;
}

export default function GuruDashboardPage() {
  const router = useRouter();

  const userProfile = {
    nama_lengkap: "Ibu Siti Rahmawati",
    email: "siti.rahmawati@sekolah.sch.id",
    peran: "guru",
  };

  const initialClasses: ClassCardData[] = [
    {
      id: "8a",
      name: "8A",
      title: "Matematika 8–A",
      chapter: "Bab 4: Persamaan Linear Dua Variabel",
      studentsCount: 32,
      progress: 72,
      avgScore: 81,
      color: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      id: "8b",
      name: "8B",
      title: "Matematika 8–B",
      chapter: "Bab 4: Persamaan Linear Dua Variabel",
      studentsCount: 30,
      progress: 65,
      avgScore: 74,
      color: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
    },
    {
      id: "8c",
      name: "8C",
      title: "Matematika 8–C",
      chapter: "Bab 3: Relasi dan Fungsi",
      studentsCount: 31,
      progress: 88,
      avgScore: 85,
      color: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
    },
  ];

  const [classList, setClassList] = useState<ClassCardData[]>(initialClasses);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const [isPresenceModalOpen, setIsPresenceModalOpen] = useState(false);
  const [isAttendanceConfigOpen, setIsAttendanceConfigOpen] = useState(false);

  // Active View State (Beranda | Management kelas | Pengelolaan | Pengaturan)
  const [activeView, setActiveView] = useState<GuruNavView>("beranda");
  const [layoutConfig, setLayoutConfig] = useState<GuruLayoutConfig>(DEFAULT_LAYOUT_CONFIG);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as GuruNavView;
      if (tab && ["beranda", "manajemen_siswa", "manajemen_kelas", "pengelolaan", "pengaturan"].includes(tab)) {
        setActiveView(tab);
      }
    } catch {
      // ignore
    }

    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab") as GuruNavView;
        if (tab && ["beranda", "manajemen_siswa", "manajemen_kelas", "pengelolaan", "pengaturan"].includes(tab)) {
          setActiveView(tab);
        } else {
          setActiveView("beranda");
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("thinksy_guru_layout");
      if (saved) setLayoutConfig(JSON.parse(saved));
      const handleLayoutChanged = (e: any) => {
        if (e.detail) setLayoutConfig(e.detail);
      };
      window.addEventListener("guru_layout_changed", handleLayoutChanged);
      return () => window.removeEventListener("guru_layout_changed", handleLayoutChanged);
    } catch {
      // ignore
    }
  }, []);

  // New Features States: Notifikasi, Batas Absensi, Realtime Screen, Manajemen Kelas Screen
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAttendanceDeadlineModalOpen, setIsAttendanceDeadlineModalOpen] = useState(false);
  const [isRealtimeAttendanceOpen, setIsRealtimeAttendanceOpen] = useState(false);
  const [isManajemenKelasOpen, setIsManajemenKelasOpen] = useState(false);

  // Teacher Card Profile States (Modal & Inline Toggle)
  const [isCardGuruModalOpen, setIsCardGuruModalOpen] = useState(false);
  const [isCardGuruInlineOpen, setIsCardGuruInlineOpen] = useState(false);

  useEffect(() => {
    if (!isCardGuruModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCardGuruModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCardGuruModalOpen]);

  // New Stat Modals States
  const [isScoreAvgModalOpen, setIsScoreAvgModalOpen] = useState(false);
  const [isQuestionsStatModalOpen, setIsQuestionsStatModalOpen] = useState(false);
  const [isStrugglingStudentsModalOpen, setIsStrugglingStudentsModalOpen] = useState(false);
  const [selectedScheduleModal, setSelectedScheduleModal] = useState<ScheduleItem | null>(null);

  // Kelas Soal Config Modal State
  const [isKelasSoalConfigOpen, setIsKelasSoalConfigOpen] = useState(false);
  const [selectedKelasForSoal, setSelectedKelasForSoal] = useState<{ id: string; name: string; title: string } | null>(null);

  const handleOpenKelasSoalSetting = (cls: { id: string; name: string; title: string }) => {
    setSelectedKelasForSoal(cls);
    setIsKelasSoalConfigOpen(true);
  };

  const [searchQuery, setSearchQuery] = useState("");

  // Student Attendance Modal States
  const [presenceFilter, setPresenceFilter] = useState<"all" | "hadir" | "online" | "offline">("all");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedSelfieZoom, setSelectedSelfieZoom] = useState<StudentAttendance | null>(null);
  const [editingPresenceStudent, setEditingPresenceStudent] = useState<StudentAttendance | null>(null);
  const [editStatusValue, setEditStatusValue] = useState<string>("Hadir (Tepat Waktu)");
  const [editTimeValue, setEditTimeValue] = useState<string>("07:30");
  const [isSavingPresence, setIsSavingPresence] = useState(false);

  // Selected Class for Detail & Edit Modal
  const [selectedClass, setSelectedClass] = useState<ClassCardData | null>(null);
  const [isEditingInModal, setIsEditingInModal] = useState(false);

  // Form states for Add Class & Draft Lesson
  const [kodeKelas, setKodeKelas] = useState("");
  const [namaKelas, setNamaKelas] = useState("");
  const [judulBab, setJudulBab] = useState("");
  const [deskripsiMateri, setDeskripsiMateri] = useState("");
  const [jumlahSiswa, setJumlahSiswa] = useState("30");
  const [pilihanWarna, setPilihanWarna] = useState("bg-slate-900");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form states for Edit Class Modal
  const [editTitle, setEditTitle] = useState("");
  const [editName, setEditName] = useState("");
  const [editChapter, setEditChapter] = useState("");
  const [editStudents, setEditStudents] = useState(30);
  const [editProgress, setEditProgress] = useState(70);
  const [editAvgScore, setEditAvgScore] = useState(80);
  const [editColor, setEditColor] = useState("");

  // Sample Student Attendance Data
  const sampleStudentsAttendance: StudentAttendance[] = [
    {
      id: "s1",
      name: "Ahmad Raihan",
      class: "Kelas 8",
      isOnline: true,
      hasAttended: true,
      timeIn: "07:38 WIB",
      selfieUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
      status: "Terverifikasi",
      scoreAvg: 88,
    },
    {
      id: "s2",
      name: "Siti Rahma Putri",
      class: "Kelas 8",
      isOnline: true,
      hasAttended: true,
      timeIn: "07:42 WIB",
      selfieUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      status: "Terverifikasi",
      scoreAvg: 92,
    },
    {
      id: "s3",
      name: "Budi Pratama",
      class: "Kelas 8",
      isOnline: false,
      hasAttended: true,
      timeIn: "07:50 WIB",
      selfieUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      status: "Hadir",
      scoreAvg: 76,
    },
    {
      id: "s4",
      name: "Dewi Kartika",
      class: "Kelas 8",
      isOnline: true,
      hasAttended: true,
      timeIn: "07:45 WIB",
      selfieUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
      status: "Terverifikasi",
      scoreAvg: 85,
    },
    {
      id: "s5",
      name: "Eko Prasetyo",
      class: "Kelas 8",
      isOnline: false,
      hasAttended: false,
      timeIn: null,
      selfieUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      status: "Belum Absen",
      scoreAvg: 62,
    },
    {
      id: "s6",
      name: "Fira Anindya",
      class: "Kelas 8",
      isOnline: true,
      hasAttended: true,
      timeIn: "07:55 WIB",
      selfieUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80",
      status: "Terverifikasi",
      scoreAvg: 81,
    },
    {
      id: "s7",
      name: "Gilang Ramadhan",
      class: "Kelas 8",
      isOnline: false,
      hasAttended: false,
      timeIn: null,
      selfieUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
      status: "Belum Absen",
      scoreAvg: 58,
    },
  ];

  const [studentPresenceList, setStudentPresenceList] = useState<StudentAttendance[]>(sampleStudentsAttendance);

  const scheduleList: ScheduleItem[] = [
    {
      id: "sch-1",
      time: "08:00 WIB",
      className: "Matematika 8–A",
      room: "Ruang 204",
      topic: "Bab 4: Persamaan Linear Dua Variabel (Metode Substitusi)",
      studentsCount: 32,
      colorBg: "bg-blue-50",
      colorText: "text-blue-700",
      colorBorder: "border-blue-100",
    },
    {
      id: "sch-2",
      time: "10:00 WIB",
      className: "Matematika 8–B",
      room: "Ruang 301",
      topic: "Bab 4: Persamaan Linear Dua Variabel (Metode Eliminasi)",
      studentsCount: 30,
      colorBg: "bg-emerald-50",
      colorText: "text-emerald-700",
      colorBorder: "border-emerald-100",
    },
    {
      id: "sch-3",
      time: "13:00 WIB",
      className: "Matematika 8–C",
      room: "Ruang 105",
      topic: "Bab 3: Relasi dan Fungsi (Diagram Panah)",
      studentsCount: 31,
      colorBg: "bg-amber-50",
      colorText: "text-amber-700",
      colorBorder: "border-amber-100",
    },
  ];

  const [dbTotalSiswa, setDbTotalSiswa] = useState<number | null>(null);
  const [dbTotalSoal, setDbTotalSoal] = useState<number | null>(null);
  const [dbPendingGrading, setDbPendingGrading] = useState<number | null>(null);
  const [dbAvgScore, setDbAvgScore] = useState<number>(78);
  const [dbStrugglingCount, setDbStrugglingCount] = useState<number>(0);
  const [dbStrugglingList, setDbStrugglingList] = useState<any[]>([]);

  // Broadcast Modal state
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [bJudul, setBJudul] = useState("");
  const [bDeskripsi, setBDeskripsi] = useState("");
  const [bTenggat, setBTenggat] = useState("");
  const [bKategori, setBKategori] = useState("kuis");
  const [bUrgensi, setBUrgensi] = useState("normal");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Fetch real database counts & stats on mount
  const fetchRealStats = useCallback(async () => {
    try {
      const res = await fetch("/api/guru/stats");
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setDbTotalSiswa(data.stats.totalSiswa);
          setDbTotalSoal(data.stats.totalSoalPublished);
          setDbPendingGrading(data.stats.pendingGrading);
          setDbAvgScore(data.stats.averageClassScore);
          setDbStrugglingCount(data.stats.strugglingCount);
        }
        if (data.strugglingStudents && data.strugglingStudents.length > 0) {
          setDbStrugglingList(data.strugglingStudents);
        }
      }

      // Ambil data presensi dan siswa real-time langsung dari Supabase
      const presRes = await fetch("/api/guru/presensi/realtime").catch(() => null);
      if (presRes && presRes.ok) {
        const presData = await presRes.json();
        if (presData.students && presData.students.length > 0) {
          setStudentPresenceList(
            presData.students.map((st: any) => ({
              id: st.id,
              name: st.nama_lengkap,
              class: st.kelas || "Kelas 8",
              isOnline: Boolean(st.isOnline),
              hasAttended: Boolean(st.hasAttended),
              timeIn: st.waktu_absen || null,
              selfieUrl: st.foto || "/images/pasfoto-siswa-1.jpg",
              status: st.status_kehadiran || "Belum Absen",
              scoreAvg: 85,
              streak: st.streak || 5,
              points: st.poin_belajar || 400,
            }))
          );
        }
      }

      // Ambil konfigurasi misi guru
      const misiRes = await fetch("/api/guru/misi").catch(() => null);
      if (misiRes && misiRes.ok) {
        const misiData = await misiRes.json();
        if (misiData.missions && misiData.missions.length > 0) {
          setTeacherCustomMissions(misiData.missions);
        }
      }
    } catch {
      // silent fallback
    }
  }, []);

  useEffect(() => {
    fetchRealStats();
    try {
      const savedAutoNotif = localStorage.getItem("thinksy_auto_notif_settings");
      if (savedAutoNotif) setAutoNotifSettings(JSON.parse(savedAutoNotif));
      const savedWeekly = localStorage.getItem("thinksy_weekly_schedule");
      if (savedWeekly) setWeeklySchedule(JSON.parse(savedWeekly));
    } catch {
      // ignore
    }
  }, [fetchRealStats]);

  // Real-time updates for teacher main dashboard
  const { broadcastEvent } = useRealtimeDashboard((event) => {
    if (
      event.type === "ATTENDANCE_CHECKIN" ||
      event.type === "ATTENDANCE_VERIFIED" ||
      event.type === "NEW_ESSAY_SUBMISSION"
    ) {
      fetchRealStats();
    }
  });

  const handleSaveStudentPresence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPresenceStudent) return;
    setIsSavingPresence(true);
    try {
      const res = await fetch("/api/guru/presensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_student_presence",
          siswaId: editingPresenceStudent.id,
          status: editStatusValue,
          waktuMasuk: editTimeValue,
        }),
      });

      if (res.ok) {
        setStudentPresenceList((prev) =>
          prev.map((s) =>
            s.id === editingPresenceStudent.id
              ? {
                  ...s,
                  status: editStatusValue as any,
                  timeIn: `${editTimeValue} WIB`,
                  hasAttended: editStatusValue !== "Alpha" && editStatusValue !== "Belum Absen",
                }
              : s
          )
        );

        broadcastEvent("ATTENDANCE_VERIFIED", {
          siswaId: editingPresenceStudent.id,
          status: editStatusValue,
          waktu_masuk: editTimeValue,
        });

        setNotification(`Kehadiran ${editingPresenceStudent.name} (${editTimeValue} WIB) berhasil diatur!`);
        setTimeout(() => setNotification(null), 4000);
        setEditingPresenceStudent(null);
      } else {
        alert("Gagal memperbarui status presensi.");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSavingPresence(false);
    }
  };

  // Load existing classes from API on mount
  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await fetch("/api/guru/kelas");
        if (res.ok) {
          const data = await res.json();
          if (data.kelas && data.kelas.length > 0) {
            const apiClasses = data.kelas.map((k: any, idx: number) => {
              const code = k.nama_kelas.length <= 3 ? k.nama_kelas : `8${String.fromCharCode(68 + idx)}`;
              const colors = [
                "bg-slate-900",
                "bg-blue-900",
                "bg-emerald-900",
                "bg-amber-900",
              ];
              return {
                id: k.id,
                name: code,
                title: k.nama_kelas.includes("Matematika") ? k.nama_kelas : `Matematika ${k.nama_kelas}`,
                chapter: "Bab 5: Draft Pelajaran Baru",
                studentsCount: 30,
                progress: 0,
                avgScore: 0,
                color: colors[idx % colors.length],
                iconBg: "bg-slate-800",
                iconColor: "text-slate-300",
              };
            });
            setClassList((prev) => {
              const existingIds = new Set(prev.map((c) => c.id));
              const uniqueApiClasses = apiClasses.filter((c: any) => !existingIds.has(c.id));
              return [...prev, ...uniqueApiClasses];
            });
          }
        }
      } catch {
        // silent fallback
      }
    }
    loadClasses();
  }, []);

  // Open Detail / Edit Modal for a specific card
  const handleOpenDetail = (cls: ClassCardData, startInEditMode = false) => {
    setSelectedClass(cls);
    setEditTitle(cls.title);
    setEditName(cls.name);
    setEditChapter(cls.chapter);
    setEditStudents(cls.studentsCount);
    setEditProgress(cls.progress);
    setEditAvgScore(cls.avgScore);
    setEditColor(cls.color);
    setIsEditingInModal(startInEditMode);
  };

  // Save Edit Changes
  const handleSaveEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/guru/kelas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedClass.id,
          namaKelas: editTitle,
          judulBab: editChapter,
          jumlahSiswa: editStudents,
          progress: editProgress,
          avgScore: editAvgScore,
        }),
      });

      const updatedClass: ClassCardData = {
        ...selectedClass,
        title: editTitle.trim(),
        name: editName.trim().toUpperCase(),
        chapter: editChapter.trim(),
        studentsCount: Number(editStudents),
        progress: Number(editProgress),
        avgScore: Number(editAvgScore),
        color: editColor,
      };

      setClassList((prev) => prev.map((c) => (c.id === selectedClass.id ? updatedClass : c)));
      setSelectedClass(updatedClass);
      setIsEditingInModal(false);
      setNotification(`Data kelas "${updatedClass.title}" berhasil diperbarui!`);
      setTimeout(() => setNotification(null), 5000);
    } catch {
      setNotification("Gagal menyimpan perubahan ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Class Card
  const handleDeleteClass = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kelas "${title}"?`)) return;

    try {
      await fetch(`/api/guru/kelas?id=${id}`, { method: "DELETE" });
      setClassList((prev) => prev.filter((c) => c.id !== id));
      setSelectedClass(null);
      setNotification(`Kelas "${title}" berhasil dihapus.`);
      setTimeout(() => setNotification(null), 5000);
    } catch {
      alert("Gagal menghapus kelas.");
    }
  };

  // Add Class Submit
  const handleAddClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKelas.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/guru/kelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaKelas: namaKelas.trim(),
          judulBab: judulBab.trim() || "Bab Pelajaran Baru",
          deskripsiMateri: deskripsiMateri.trim(),
          jumlahSiswa: Number(jumlahSiswa) || 30,
        }),
      });

      const data = await res.json();
      const shortCode = kodeKelas.trim() || (namaKelas.length <= 4 ? namaKelas.trim() : `8${String.fromCharCode(68 + classList.length)}`);

      const newClassItem: ClassCardData = {
        id: data.kelas?.id || `cls-${Date.now()}`,
        name: shortCode.toUpperCase(),
        title: namaKelas.startsWith("Matematika") ? namaKelas.trim() : `Matematika ${namaKelas.trim()}`,
        chapter: judulBab.trim() || "Bab Pelajaran Baru (Draft)",
        studentsCount: Number(jumlahSiswa) || 30,
        progress: 0,
        avgScore: 0,
        color: pilihanWarna,
        iconBg: "bg-[#0F172A]/20",
        iconColor: "text-amber-400",
      };

      setClassList((prev) => [newClassItem, ...prev]);
      setNotification(`Kelas "${newClassItem.title}" dan draft pelajaran berhasil ditambahkan!`);
      setIsAddModalOpen(false);

      setKodeKelas("");
      setNamaKelas("");
      setJudulBab("");
      setDeskripsiMateri("");
      setJumlahSiswa("30");

      setTimeout(() => setNotification(null), 5000);
    } catch {
      const shortCode = kodeKelas.trim() || `8${String.fromCharCode(68 + classList.length)}`;
      const newClassItem: ClassCardData = {
        id: `cls-${Date.now()}`,
        name: shortCode.toUpperCase(),
        title: namaKelas.startsWith("Matematika") ? namaKelas.trim() : `Matematika ${namaKelas.trim()}`,
        chapter: judulBab.trim() || "Bab Pelajaran Baru (Draft)",
        studentsCount: Number(jumlahSiswa) || 30,
        progress: 0,
        avgScore: 0,
        color: pilihanWarna,
        iconBg: "bg-[#0F172A]/20",
        iconColor: "text-amber-400",
      };
      setClassList((prev) => [newClassItem, ...prev]);
      setNotification(`Kelas "${newClassItem.title}" dan draft pelajaran berhasil dibuat!`);
      setIsAddModalOpen(false);
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const recentActivity = [
    {
      id: 1,
      action: "Esai dinilai",
      detail: "Rina Kartika — Kelas 8",
      time: "10 menit lalu",
      icon: FileCheck,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50",
      link: "/guru/penilaian",
    },
    {
      id: 2,
      action: "Soal evaluasi diterbitkan",
      detail: "Bab 4: SPLDV — 15 soal",
      time: "1 jam lalu",
      icon: Bot,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
      link: "/guru/soal/eksplorasi",
    },
    {
      id: 3,
      action: "Presensi diverifikasi",
      detail: "Kelas 8 — 15/15 hadir",
      time: "2 jam lalu",
      icon: CheckCircle2,
      iconColor: "text-emerald-700",
      iconBg: "bg-emerald-50",
      link: "#presensi",
    },
    {
      id: 4,
      action: "Kuis dikirim ke siswa",
      detail: "Bab 3: Relasi & Fungsi",
      time: "3 jam lalu",
      icon: Target,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-50",
      link: "/guru/soal/latihan",
    },
  ];

  const totalSiswaAktif = classList.reduce((sum, c) => sum + (c.studentsCount || 0), 0);
  const totalHadir = studentPresenceList.filter((s) => s.hasAttended).length;
  const totalOnline = studentPresenceList.filter((s) => s.isOnline).length;
  const totalOfflineOrAbsent = studentPresenceList.filter((s) => !s.hasAttended || !s.isOnline).length;

  const filteredStudents = studentPresenceList.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      st.class.toLowerCase().includes(studentSearch.toLowerCase());

    if (presenceFilter === "hadir") return matchesSearch && st.hasAttended;
    if (presenceFilter === "online") return matchesSearch && st.isOnline;
    if (presenceFilter === "offline") return matchesSearch && (!st.isOnline || !st.hasAttended);
    return matchesSearch;
  });

  const strugglingStudents = [
    { id: "st-1", name: "Eko Prasetyo", class: "Kelas 8", score: 62, topic: "Persamaan Linear Dua Variabel", status: "Butuh Remedial" },
    { id: "st-2", name: "Gilang Ramadhan", class: "Kelas 8", score: 58, topic: "Relasi dan Fungsi (Diagram Panah)", status: "Butuh Bimbingan Sokratik" },
    { id: "st-3", name: "Nanda Kurnia", class: "Kelas 8", score: 60, topic: "Operasi Bentuk Aljabar", status: "Tugas Tambahan" },
    { id: "st-4", name: "Rian Hidayat", class: "Kelas 8", score: 64, topic: "Sistem Persamaan Linear", status: "Kuis Remedial" },
    { id: "st-5", name: "Tania Safitri", class: "Kelas 8", score: 61, topic: "Pemfaktoran Persamaan Kuadrat", status: "Butuh Review Guru" },
  ];

  // ========================================================
  // PUSAT KENDALI FITUR SISWA (STUDENT CONTROL HUB STATES)
  // Memastikan semua fitur di dashboard siswa dapat dikontrol oleh guru
  // ========================================================
  const [studentControlTab, setStudentControlTab] = useState<
    "presensi" | "kurikulum" | "bank_soal" | "penilaian" | "jadwal_agenda" | "misi_leaderboard" | "broadcast"
  >("presensi");

  // 1. Kontrol Aturan Jam Sekolah & Presensi Siswa
  const [schoolJamMasuk, setSchoolJamMasuk] = useState("07:00");
  const [schoolJamTerlambat, setSchoolJamTerlambat] = useState("07:15");
  const [schoolJamTutup, setSchoolJamTutup] = useState("08:00");
  const [isSavingSchoolHours, setIsSavingSchoolHours] = useState(false);

  // Jadwal Mingguan Presensi (Senin s/d Sabtu)
  const [weeklySchedule, setWeeklySchedule] = useState({
    senin: { active: true, jamMasuk: "07:00", jamTerlambat: "07:15", jamAlpha: "07:30" },
    selasa: { active: true, jamMasuk: "07:00", jamTerlambat: "07:15", jamAlpha: "07:30" },
    rabu: { active: true, jamMasuk: "07:00", jamTerlambat: "07:15", jamAlpha: "07:30" },
    kamis: { active: true, jamMasuk: "07:00", jamTerlambat: "07:15", jamAlpha: "07:30" },
    jumat: { active: true, jamMasuk: "07:00", jamTerlambat: "07:15", jamAlpha: "07:15" },
    sabtu: { active: false, jamMasuk: "07:00", jamTerlambat: "07:15", jamAlpha: "07:30" },
  });
  const [isWeeklyScheduleExpanded, setIsWeeklyScheduleExpanded] = useState(false);

  const handleSaveSchoolHours = async () => {
    setIsSavingSchoolHours(true);
    try {
      const schedulePayload = {
        senin: weeklySchedule.senin.jamAlpha,
        selasa: weeklySchedule.selasa.jamAlpha,
        rabu: weeklySchedule.rabu.jamAlpha,
        kamis: weeklySchedule.kamis.jamAlpha,
        jumat: weeklySchedule.jumat.jamAlpha,
        sabtu: weeklySchedule.sabtu.jamAlpha,
      };

      const res = await fetch("/api/guru/presensi-deadline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jam_masuk: schoolJamMasuk,
          jam_terlambat: schoolJamTerlambat,
          jam_tutup: schoolJamTutup,
          schedule: schedulePayload,
          mode: "selamanya",
        }),
      });
      if (res.ok) {
        localStorage.setItem("thinksy_weekly_schedule", JSON.stringify(weeklySchedule));
        setNotification(`Aturan jam presensi diperbarui: Masuk ${schoolJamMasuk}, Terlambat ${schoolJamTerlambat}, Tutup ${schoolJamTutup}`);
      } else {
        localStorage.setItem("thinksy_weekly_schedule", JSON.stringify(weeklySchedule));
        setNotification(`Jam presensi disimpan secara lokal di sistem.`);
      }
    } catch {
      localStorage.setItem("thinksy_weekly_schedule", JSON.stringify(weeklySchedule));
      setNotification(`Jam presensi disimpan secara lokal di sistem.`);
    } finally {
      setIsSavingSchoolHours(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleSaveWeeklySchedule = async () => {
    await handleSaveSchoolHours();
  };

  const handleQuickUpdateStudentStatus = async (
    studentId: string,
    studentName: string,
    newStatus: string
  ) => {
    let waktuMasukFormatted = "07:10";
    if (newStatus === "Terlambat") waktuMasukFormatted = "07:25";
    if (newStatus === "Izin" || newStatus === "Sakit") waktuMasukFormatted = "07:00";
    if (newStatus === "Alpha" || newStatus === "Belum Absen") waktuMasukFormatted = "";

    setStudentPresenceList((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              status: newStatus as any,
              hasAttended: newStatus !== "Alpha" && newStatus !== "Belum Absen",
              timeIn: waktuMasukFormatted ? `${waktuMasukFormatted} WIB` : null,
            }
          : s
      )
    );

    try {
      await fetch("/api/guru/presensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_student_presence",
          siswaId: studentId,
          status: newStatus,
          waktuMasuk: waktuMasukFormatted,
        }),
      });

      broadcastEvent("ATTENDANCE_VERIFIED", {
        siswaId: studentId,
        status: newStatus,
      });

      setNotification(`Status presensi ${studentName} berhasil diubah: ${newStatus}`);
    } catch {
      setNotification(`Status presensi ${studentName} diperbarui: ${newStatus}`);
    } finally {
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const handleMassVerifyAllPresence = async () => {
    try {
      const res = await fetch("/api/guru/presensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mass_verify",
          presensiIds: studentPresenceList.map((s) => s.id),
        }),
      });
      setStudentPresenceList((prev) =>
        prev.map((s) => ({
          ...s,
          hasAttended: true,
          status: "Terverifikasi",
        }))
      );
      setNotification("Seluruh presensi siswa hari ini berhasil diverifikasi resmi!");
      setTimeout(() => setNotification(null), 4000);
    } catch {
      setStudentPresenceList((prev) =>
        prev.map((s) => ({
          ...s,
          hasAttended: true,
          status: "Terverifikasi",
        }))
      );
      setNotification("Seluruh presensi siswa hari ini berhasil diverifikasi!");
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // 2. Kontrol Kurikulum & Bab Pembelajaran (Modul Siswa)
  const [chaptersControl, setChaptersControl] = useState([
    {
      id: "ch-1",
      nomor: 1,
      judul: "Bilangan Berpangkat & Bentuk Akar",
      mapel: "Matematika",
      semester: 1,
      isOpen: true,
      aiTutorEnabled: true,
      totalMateri: 4,
      tuntasPercent: 92,
    },
    {
      id: "ch-2",
      nomor: 2,
      judul: "Teorema Pythagoras & Segitiga",
      mapel: "Matematika",
      semester: 1,
      isOpen: true,
      aiTutorEnabled: true,
      totalMateri: 3,
      tuntasPercent: 84,
    },
    {
      id: "ch-3",
      nomor: 3,
      judul: "Relasi dan Fungsi",
      mapel: "Matematika",
      semester: 1,
      isOpen: true,
      aiTutorEnabled: true,
      totalMateri: 4,
      tuntasPercent: 78,
    },
    {
      id: "ch-4",
      nomor: 4,
      judul: "Persamaan Linear Dua Variabel (SPLDV)",
      mapel: "Matematika",
      semester: 1,
      isOpen: true,
      aiTutorEnabled: true,
      totalMateri: 5,
      tuntasPercent: 65,
    },
    {
      id: "ch-5",
      nomor: 5,
      judul: "Statistika & Peluang Matematika",
      mapel: "Matematika",
      semester: 2,
      isOpen: false,
      aiTutorEnabled: false,
      totalMateri: 4,
      tuntasPercent: 10,
    },
  ]);

  const handleToggleChapter = (chapterId: string) => {
    setChaptersControl((prev) =>
      prev.map((ch) => {
        if (ch.id === chapterId) {
          const nextState = !ch.isOpen;
          setNotification(`Akses siswa untuk "${ch.judul}" ${nextState ? "DIBUKA" : "DIKUNCI"}.`);
          setTimeout(() => setNotification(null), 3500);
          return { ...ch, isOpen: nextState };
        }
        return ch;
      })
    );
  };

  const handleToggleAiTutor = (chapterId: string) => {
    setChaptersControl((prev) =>
      prev.map((ch) => {
        if (ch.id === chapterId) {
          const nextState = !ch.aiTutorEnabled;
          setNotification(`Bimbingan AI Sokratik untuk "${ch.judul}" ${nextState ? "DIAKTIFKAN" : "DINONAKTIFKAN"}.`);
          setTimeout(() => setNotification(null), 3500);
          return { ...ch, aiTutorEnabled: nextState };
        }
        return ch;
      })
    );
  };

  // 3. Kontrol Bank Soal & Review Gate AI
  const [aiDraftQuestions, setAiDraftQuestions] = useState([
    {
      id: "dr-1",
      bab: "Bab 4: SPLDV",
      soal: "Dua bilangan cacah berjumlah 38 dan selisihnya 12. Model matematika dan hasil kali kedua bilangan tersebut adalah...",
      tipe: "Pilihan Ganda",
      kesulitan: "Sedang",
      status: "pending",
    },
    {
      id: "dr-2",
      bab: "Bab 4: SPLDV",
      soal: "Sebuah tempat parkir menampung 84 kendaraan motor dan mobil. Jika total roda 220 buah, tentukan pendapatan parkir bila motor Rp2.000 dan mobil Rp5.000.",
      tipe: "Esai Terstruktur",
      kesulitan: "Tinggi",
      status: "pending",
    },
    {
      id: "dr-3",
      bab: "Bab 3: Relasi & Fungsi",
      soal: "Diketahui f(x) = ax + b dengan f(2) = 11 dan f(-1) = 2. Tentukan nilai f(5) beserta himpunan pasangannya.",
      tipe: "Pilihan Ganda",
      kesulitan: "Mudah",
      status: "pending",
    },
  ]);

  const [dailyAiLimit, setDailyAiLimit] = useState(20);

  const handleApproveAiQuestion = (qId: string) => {
    setAiDraftQuestions((prev) => prev.filter((q) => q.id !== qId));
    setDbTotalSoal((prev) => (prev ?? 2050) + 1);
    setNotification("Soal AI berhasil disetujui & dipublikasikan ke Bank Soal Siswa!");
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRejectAiQuestion = (qId: string) => {
    setAiDraftQuestions((prev) => prev.filter((q) => q.id !== qId));
    setNotification("Draft soal AI ditolak & dihapus dari antrean.");
    setTimeout(() => setNotification(null), 3500);
  };

  // 4. Kontrol Penilaian & Validasi Esai (AI Grading + Teacher Override)
  const [essaySubmissions, setEssaySubmissions] = useState([
    {
      id: "es-1",
      siswa: "Ahmad Raihan",
      kelas: "Kelas 8",
      soal: "Uraian Metode Eliminasi & Substitusi SPLDV",
      aiScore: 85,
      teacherScore: 88,
      aiReasoning: "Langkah eliminasi variabel y sistematis, kesimpulan (x, y) = (4, 3) tepat.",
      teacherNotes: "Runtut dan bersih, pertahankan ketelitian.",
      status: "menunggu",
    },
    {
      id: "es-2",
      siswa: "Gilang Ramadhan",
      kelas: "Kelas 8",
      soal: "Menentukan Domain Relasi Fungsi",
      aiScore: 65,
      teacherScore: 70,
      aiReasoning: "Domain belum mengikutsertakan nol, langkah pembuktian terputus di langkah akhir.",
      teacherNotes: "Perhatikan kembali elemen himpunan semesta.",
      status: "menunggu",
    },
    {
      id: "es-3",
      siswa: "Dewi Kartika",
      kelas: "Kelas 8",
      soal: "Penerapan Teorema Pythagoras pada Balok Ruang",
      aiScore: 92,
      teacherScore: 95,
      aiReasoning: "Penggunaan rumus diagonal ruang tepat dan disertai sketsa pemodelan.",
      teacherNotes: "Sangat baik, pembuktian analitis lengkap.",
      status: "menunggu",
    },
  ]);

  const handleApproveEssayGrade = (essayId: string) => {
    setEssaySubmissions((prev) =>
      prev.map((e) => (e.id === essayId ? { ...e, status: "disetujui" } : e))
    );
    setDbPendingGrading((prev) => Math.max(0, (prev ?? 14) - 1));
    setNotification("Nilai esai berhasil divalidasi dan dikirim ke dashboard siswa!");
    setTimeout(() => setNotification(null), 3500);
  };

  // 5. Kontrol Jadwal Pelajaran Mingguan Siswa
  const [weeklySchedules, setWeeklySchedules] = useState([
    { id: "js-1", hari: "Senin", jam: "07:30 - 09:30 WIB", mapel: "Matematika", kelas: "Kelas 8", ruangan: "Ruang 8", guru: "Ibu Siti Rahmawati, M.Pd." },
    { id: "js-2", hari: "Selasa", jam: "10:00 - 12:00 WIB", mapel: "Matematika", kelas: "Kelas 8", ruangan: "Lab Matematika", guru: "Ibu Siti Rahmawati, M.Pd." },
    { id: "js-3", hari: "Rabu", jam: "07:30 - 09:30 WIB", mapel: "Matematika", kelas: "Kelas 8", ruangan: "Ruang 8", guru: "Ibu Siti Rahmawati, M.Pd." },
    { id: "js-4", hari: "Kamis", jam: "10:00 - 12:00 WIB", mapel: "Matematika", kelas: "Kelas 8", ruangan: "Lab Komputer", guru: "Ibu Siti Rahmawati, M.Pd." },
  ]);

  // 6. Kontrol Agenda Kalender Akademik Siswa
  const [academicAgendas, setAcademicAgendas] = useState([
    { id: "ag-1", tanggal: "2026-10-12", judul: "Ulangan Harian 1: SPLDV Terpadu", kategori: "ulangan", jam: "08:00 WIB", status: "Terjadwal" },
    { id: "ag-2", tanggal: "2026-10-20", judul: "Penilaian Tengah Semester (PTS) Ganjil", kategori: "ujian", jam: "07:30 WIB", status: "Wajib" },
    { id: "ag-3", tanggal: "2026-10-25", judul: "Batas Akhir Pengumpulan Portofolio Sokratik", kategori: "tugas", jam: "15:00 WIB", status: "Tenggat" },
  ]);

  // 7. Kontrol Misi Harian Target Belajar Siswa
  const [missionsConfig, setMissionsConfig] = useState({
    targetSoal: 5,
    poinSoal: 50,
    targetSubmateri: 1,
    poinSubmateri: 30,
    targetPresensi: "07:15",
    poinPresensi: 20,
  });

  // State Misi Kustom yang Ditambahkan Guru untuk Diklaim Siswa
  const [teacherCustomMissions, setTeacherCustomMissions] = useState<any[]>([
    {
      id: "misi-default-1",
      judul: "Selesaikan 1 Latihan Mandiri SPLDV",
      deskripsi: "Kerjakan minimal 1 latihan soal Bab 4 di menu Latihan Siswa hari ini.",
      kategori: "akademik",
      target_max: 1,
      poin_hadiah: 50,
      aktif: true,
      total_klaim: 28,
    },
    {
      id: "misi-default-2",
      judul: "Diskusi Konsep Bersama AI Sokratik",
      deskripsi: "Ajukan minimal 2 pertanyaan dan diskusikan langkah penyelesaian soal dengan AI Tutor.",
      kategori: "sokratik",
      target_max: 2,
      poin_hadiah: 35,
      aktif: true,
      total_klaim: 24,
    },
    {
      id: "misi-default-3",
      judul: "Presensi Pagi Tepat Waktu (<07:15 WIB)",
      deskripsi: "Lakukan selfie verifikasi kehadiran sebelum jam batas terlambat.",
      kategori: "presensi",
      target_max: 1,
      poin_hadiah: 25,
      aktif: true,
      total_klaim: 31,
    },
  ]);
  const [newMisiJudul, setNewMisiJudul] = useState("");
  const [newMisiDeskripsi, setNewMisiDeskripsi] = useState("");
  const [newMisiKategori, setNewMisiKategori] = useState<"akademik" | "presensi" | "sokratik" | "tantangan" | "kuis">("akademik");
  const [newMisiTarget, setNewMisiTarget] = useState(1);
  const [newMisiPoin, setNewMisiPoin] = useState(30);
  const [isAddingMisi, setIsAddingMisi] = useState(false);

  const handleSaveMissions = () => {
    localStorage.setItem("thinksy_missions_config", JSON.stringify(missionsConfig));
    setNotification("Target misi harian & reward poin siswa berhasil disimpan!");
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreateCustomMisi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMisiJudul.trim() || !newMisiDeskripsi.trim()) return;

    setIsAddingMisi(true);
    try {
      const res = await fetch("/api/guru/misi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          judul: newMisiJudul.trim(),
          deskripsi: newMisiDeskripsi.trim(),
          kategori: newMisiKategori,
          target_max: newMisiTarget,
          poin_hadiah: newMisiPoin,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.missions) setTeacherCustomMissions(data.missions);
        setNotification(`Misi "${newMisiJudul}" berhasil diterbitkan dan siap diklaim siswa!`);
        setNewMisiJudul("");
        setNewMisiDeskripsi("");
        setNewMisiTarget(1);
        setNewMisiPoin(30);
      } else {
        const newM = {
          id: `misi-${Date.now()}`,
          judul: newMisiJudul.trim(),
          deskripsi: newMisiDeskripsi.trim(),
          kategori: newMisiKategori,
          target_max: newMisiTarget,
          poin_hadiah: newMisiPoin,
          aktif: true,
          total_klaim: 0,
        };
        setTeacherCustomMissions((prev) => [newM, ...prev]);
        setNotification(`Misi "${newMisiJudul}" berhasil ditambahkan & disimpan!`);
        setNewMisiJudul("");
        setNewMisiDeskripsi("");
      }
    } catch {
      const newM = {
        id: `misi-${Date.now()}`,
        judul: newMisiJudul.trim(),
        deskripsi: newMisiDeskripsi.trim(),
        kategori: newMisiKategori,
        target_max: newMisiTarget,
        poin_hadiah: newMisiPoin,
        aktif: true,
        total_klaim: 0,
      };
      setTeacherCustomMissions((prev) => [newM, ...prev]);
      setNotification(`Misi "${newMisiJudul}" tersimpan secara lokal!`);
      setNewMisiJudul("");
      setNewMisiDeskripsi("");
    } finally {
      setIsAddingMisi(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleToggleMisi = async (misiId: string) => {
    setTeacherCustomMissions((prev) =>
      prev.map((m) => (m.id === misiId ? { ...m, aktif: !m.aktif } : m))
    );
    await fetch("/api/guru/misi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", missionId: misiId }),
    }).catch(() => null);
    setNotification("Status misi siswa diperbarui!");
    setTimeout(() => setNotification(null), 2500);
  };

  const handleDeleteMisi = async (misiId: string) => {
    setTeacherCustomMissions((prev) => prev.filter((m) => m.id !== misiId));
    await fetch("/api/guru/misi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", missionId: misiId }),
    }).catch(() => null);
    setNotification("Misi berhasil dihapus.");
    setTimeout(() => setNotification(null), 2500);
  };

  // 8. Kontrol Siaran Broadcast & Notifikasi Siswa
  const [autoNotifSettings, setAutoNotifSettings] = useState({
    pengingatPresensi: true,
    deadlineTugas: true,
    pengumumanNilai: true,
    ucapanSemangat: true,
    aksesUjian: true,
  });

  const [broadcastDirectTitle, setBroadcastDirectTitle] = useState("");
  const [broadcastDirectMessage, setBroadcastDirectMessage] = useState("");
  const [broadcastDirectType, setBroadcastDirectType] = useState<"info" | "penting" | "tugas">("info");
  const [broadcastTargetAudience, setBroadcastTargetAudience] = useState("seluruh_siswa");
  const [isSendingDirectBroadcast, setIsSendingDirectBroadcast] = useState(false);

  const [notificationHistory, setNotificationHistory] = useState([
    {
      id: "nh-1",
      judul: "⏰ Pengingat Presensi Pagi Hari",
      pesan: "Batas presensi mandiri adalah pukul 07:15 WIB. Pastikan lakukan verifikasi kamera sebelum jam tutup.",
      tipe: "penting",
      target: "Seluruh Siswa",
      waktu: "Hari ini, 06:45 WIB",
    },
    {
      id: "nh-2",
      judul: "📝 Asesmen Resmi Dibuka: Ulangan SPLDV",
      pesan: "Akses ke ruang ulangan AKU LULUS telah dibuka. Siapkan alat tulis dan token ujian.",
      tipe: "tugas",
      target: "Kelas 8A, 8B",
      waktu: "Kemarin, 08:00 WIB",
    },
  ]);

  const handleSaveAutoNotif = () => {
    localStorage.setItem("thinksy_auto_notif_settings", JSON.stringify(autoNotifSettings));
    setNotification("Pengaturan notifikasi otomatis siswa berhasil disimpan!");
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSendDirectBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastDirectTitle.trim() || !broadcastDirectMessage.trim()) return;

    setIsSendingDirectBroadcast(true);
    try {
      const newNotifItem = {
        id: `nh-${Date.now()}`,
        judul: broadcastDirectTitle.trim(),
        pesan: broadcastDirectMessage.trim(),
        tipe: broadcastDirectType,
        target: broadcastTargetAudience === "seluruh_siswa" ? "Seluruh Siswa" : broadcastTargetAudience,
        waktu: "Baru saja",
      };

      setNotificationHistory((prev) => [newNotifItem, ...prev]);

      broadcastEvent("NOTIFICATION_RECEIVED", {
        judul: broadcastDirectTitle.trim(),
        pesan: broadcastDirectMessage.trim(),
        tipe: broadcastDirectType,
      });

      await fetch("/api/guru/notifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: broadcastDirectTitle.trim(),
          pesan: broadcastDirectMessage.trim(),
          tipe: broadcastDirectType,
          targetAudience: broadcastTargetAudience,
        }),
      }).catch(() => null);

      setNotification(`Notifikasi "${broadcastDirectTitle}" berhasil disiarkan dan disimpan!`);
      setBroadcastDirectTitle("");
      setBroadcastDirectMessage("");
    } catch {
      setNotification("Notifikasi disiarkan ke siswa!");
    } finally {
      setIsSendingDirectBroadcast(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <GuruLayout
      userProfile={userProfile}
      activeView={activeView}
      onViewChange={setActiveView}
    >
      <div className="space-y-6">
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-500/40 animate-in fade-in slide-in-from-top duration-200">
            <CheckCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs font-bold">{notification}</span>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. VIEW BERANDA: PUSAT KENDALI FITUR SISWA & COMMAND CENTER */}
        {activeView === "beranda" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* ARCHITECTURAL COMMAND CENTER HEADER (EDUCATIONAL BLUE GRADIENT THEME) */}
            <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 border border-blue-900/40 p-6 sm:p-8 text-white shadow-sm overflow-hidden font-sans">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                {/* Kolom Kiri: Metadata & Heading */}
                <div className="space-y-3.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      SEKOLAH PENGGERAK • FASE D
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white/90 text-xs font-semibold">
                      KURIKULUM MERDEKA
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      SYNC REALTIME AKTIF
                    </span>
                  </div>

                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                      Pusat Kendali Pengajar & Fitur Siswa
                    </h1>
                    <p className="text-blue-100 text-xs sm:text-sm font-normal leading-relaxed mt-1">
                      Kelola seluruh modul belajar, asesmen resmi (AKU LULUS), jam presensi, kurasi AI Sokratik, dan evaluasi siswa secara langsung dari satu panel terintegrasi.
                    </p>
                  </div>

                  {/* Telemetry Strip Ringkas */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/95 font-medium flex items-center gap-2 text-xs">
                      <Users className="w-3.5 h-3.5 text-blue-200" />
                      <span>{dbTotalSiswa ?? totalSiswaAktif} Siswa (8A, 8B, 8C)</span>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/95 font-medium flex items-center gap-2 text-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>Tutup Presensi: {schoolJamTutup} WIB</span>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/95 font-medium flex items-center gap-2 text-xs">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{dbPendingGrading ?? 14} Esai Perlu Verifikasi</span>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Kartu Profil Guru Trigger */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
                  <div
                    onClick={() => setIsCardGuruModalOpen(true)}
                    className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition flex items-center gap-3.5 cursor-pointer group shadow-xs"
                    title="Buka Kartu Identitas Guru Lengkap"
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20 relative bg-slate-800">
                        <Image
                          src="/images/foto-guru.jpg"
                          alt="Ibu Siti Rahmawati, M.Pd."
                          fill
                          sizes="60px"
                          className="object-cover object-top"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full shadow-xs border border-white/30 flex items-center justify-center">
                        <ShieldCheck className="w-3 h-3" />
                      </div>
                    </div>

                    <div className="min-w-0 pr-1">
                      <span className="text-[10px] font-sans uppercase tracking-wider text-amber-300 font-bold block">
                        KREDENSIAL PENDIDIK
                      </span>
                      <h4 className="text-sm font-bold text-white truncate">
                        Ibu Siti Rahmawati, M.Pd.
                      </h4>
                      <p className="text-[11px] font-sans text-blue-100 truncate">
                        NIP: 19880415 201001 2 012
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCardGuruModalOpen(true)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#1967D2] hover:bg-blue-600 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-white" />
                      <span>Buka Kartu Guru</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCardGuruInlineOpen((prev) => !prev)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isCardGuruInlineOpen
                          ? "bg-white/25 border-white/30 text-white"
                          : "bg-white/10 hover:bg-white/15 border-white/20 text-white"
                      }`}
                    >
                      {isCardGuruInlineOpen ? (
                        <>
                          <span>Tutup di Halaman</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>Di Halaman</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD GURU INLINE (IF TOGGLED) */}
            {isCardGuruInlineOpen && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <CardGuruProfile
                  onClose={() => setIsCardGuruInlineOpen(false)}
                  onOpenSettings={() => {
                    setActiveView("pengaturan");
                    window.history.pushState(null, "", "/guru?tab=pengaturan");
                  }}
                />
              </div>
            )}

            {/* ======================================================== */}
            {/* 1. RINGKASAN KELAS: RATA-RATA SKOR & SISWA YANG TERTINGGAL */}
            {/* ======================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* KARTU 1: RATA-RATA SKOR KELAS */}
              <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200/90 p-6 space-y-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-[#1967D2] flex items-center justify-center font-bold shrink-0">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#0F172A] text-sm">Rata-Rata Skor Kelas</h3>
                      <span className="text-[11px] text-slate-500 font-medium">Evaluasi pemahaman aktif</span>
                    </div>
                  </div>
                  <span className="text-xl font-black text-[#1967D2]">80%</span>
                </div>

                {/* Breakdown per rombel */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">Kelas 8-A (Matematika)</span>
                      <span className="text-[10px] text-slate-500">32 Siswa Terdaftar</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-[#1967D2] font-black text-xs">
                      81%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">Kelas 8-B (Matematika)</span>
                      <span className="text-[10px] text-slate-500">30 Siswa Terdaftar</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-xs">
                      74%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">Kelas 8-C (Matematika)</span>
                      <span className="text-[10px] text-slate-500">31 Siswa Terdaftar</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                      85%
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ketuntasan Belajar: 85%</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Nilai dihitung dari rata-rata pengerjaan modul konsep, latihan bab, dan kuis mandiri siswa.
                  </p>
                </div>
              </div>

              {/* KARTU 2: DAFTAR SISWA YANG TERTINGGAL (<65%) */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-xs flex flex-col justify-between">
                <div className="space-y-1 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-[#0F172A] text-sm">Siswa yang Tertinggal (Skor &lt; 65%)</h3>
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                          {strugglingStudents.length} Perlu Perhatian
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Siswa dengan capaian di bawah target KKM yang memerlukan bimbingan intervensi
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/guru/siswa"
                    className="text-xs font-bold text-[#1967D2] hover:underline flex items-center gap-1 shrink-0 self-start sm:self-auto"
                  >
                    <span>Semua Siswa</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* List Siswa yang Tertinggal */}
                <div className="space-y-2.5">
                  {strugglingStudents.map((st, idx) => (
                    <div
                      key={st.id || idx}
                      className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-100 hover:border-rose-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-slate-900 truncate">{st.name}</h4>
                          <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                            {st.class}
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-700 font-medium">
                          Materi Lemah: <span className="font-semibold">{st.topic}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                        <div className="text-right">
                          <span className="text-sm font-black text-rose-600 block leading-tight">{st.score}%</span>
                          <span className="text-[9px] font-bold text-slate-500 block">{st.status}</span>
                        </div>
                        <Link
                          href={`/guru/siswa/${st.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-[#1967D2] text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                        >
                          <span>Riwayat & Jawaban</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* PUSAT KENDALI FITUR SISWA (STUDENT CONTROL HUB)         */}
            {/* ======================================================== */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6 font-sans">
              {/* Hub Title & Navigation Tabs */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight font-sans">
                      Pusat Kendali Pengajar
                    </h2>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Pilih modul di bawah ini untuk mengendalikan apa yang diakses, dikerjakan, dan dilihat oleh siswa secara real-time.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      7 Modul Kendali
                    </span>
                  </div>
                </div>

                {/* Tab Switcher: 7 Feature Modules (Tanpa Ujian & Ulangan) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                  {[
                    { id: "presensi", label: "Presensi & Jam Sekolah", icon: Camera },
                    { id: "kurikulum", label: "Kurikulum & Bab Siswa", icon: BookOpen },
                    { id: "bank_soal", label: "Bank Soal & Kurasi AI", icon: Bot },
                    { id: "penilaian", label: "Validasi Nilai Esai", icon: FileCheck },
                    { id: "jadwal_agenda", label: "Jadwal & Agenda Kalender", icon: Calendar },
                    { id: "misi_leaderboard", label: "Target Misi & Leaderboard", icon: Target },
                    { id: "broadcast", label: "Siaran Notifikasi Siswa", icon: Bell },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = studentControlTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setStudentControlTab(tab.id as any)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                          isActive
                            ? "bg-[#1967D2] text-white border-[#1967D2] shadow-xs"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ===================================================== */}
              {/* MODUL 2: PRESENSI & ATURAN JAM SEKOLAH SISWA         */}
              {/* ===================================================== */}
              {studentControlTab === "presensi" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* 1. Aturan Jam Sekolah & Jadwal Mingguan yang Sinkron ke Siswa */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-black text-sm text-[#0F172A] flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>Aturan Batas Waktu & Jam Presensi Siswa</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Menentukan batas perhitungan Hadir Tepat Waktu, Terlambat, dan Jam Tutup / Alpha yang sinkron otomatis ke dashboard siswa.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleSaveSchoolHours}
                          disabled={isSavingSchoolHours}
                          className="px-3.5 py-2 rounded-xl bg-[#1967D2] hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5 text-white" />
                          <span>{isSavingSchoolHours ? "Menyimpan..." : "Simpan Aturan Presensi"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsWeeklyScheduleExpanded((prev) => !prev)}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-600" />
                          <span>{isWeeklyScheduleExpanded ? "Tutup Jadwal Mingguan" : "Atur Jadwal Mingguan (Senin–Sabtu)"}</span>
                          {isWeeklyScheduleExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* 3 Input Jam Presensi Harian */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          1. Jam Mulai Presensi (Jam Masuk)
                        </label>
                        <input
                          type="time"
                          value={schoolJamMasuk}
                          onChange={(e) => setSchoolJamMasuk(e.target.value)}
                          className="w-full text-sm font-semibold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1967D2]"
                        />
                        <span className="text-[10px] text-emerald-600 font-semibold block">Siswa presensi jam ini = Hadir Tepat Waktu</span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          2. Batas Toleransi Terlambat
                        </label>
                        <input
                          type="time"
                          value={schoolJamTerlambat}
                          onChange={(e) => setSchoolJamTerlambat(e.target.value)}
                          className="w-full text-sm font-semibold text-amber-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1967D2]"
                        />
                        <span className="text-[10px] text-amber-600 font-semibold block">Lewat dari jam ini = Berstatus Terlambat</span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          3. Jam Tutup Presensi (Batas Alpha)
                        </label>
                        <input
                          type="time"
                          value={schoolJamTutup}
                          onChange={(e) => setSchoolJamTutup(e.target.value)}
                          className="w-full text-sm font-semibold text-rose-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1967D2]"
                        />
                        <span className="text-[10px] text-rose-600 font-semibold block">Lewat jam ini kamera ditutup = Ditandai Alpha</span>
                      </div>
                    </div>

                    {/* Form Jadwal Mingguan Presensi (Senin s/d Sabtu) */}
                    {isWeeklyScheduleExpanded && (
                      <div className="mt-4 p-4 rounded-xl bg-white border border-blue-200/80 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#1967D2]" />
                              <span>Pengaturan Jam Presensi Mingguan (Senin s/d Sabtu)</span>
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              Sesuaikan jam masuk, batas terlambat, dan jam tutup alpha untuk setiap hari kegiatan belajar mengajar.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleSaveWeeklySchedule}
                            disabled={isSavingSchoolHours}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                          >
                            <Save className="w-3 h-3" />
                            <span>Simpan Jadwal Mingguan</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {[
                            { key: "senin", label: "Senin" },
                            { key: "selasa", label: "Selasa" },
                            { key: "rabu", label: "Rabu" },
                            { key: "kamis", label: "Kamis" },
                            { key: "jumat", label: "Jumat" },
                            { key: "sabtu", label: "Sabtu" },
                          ].map((day) => {
                            const dayData = (weeklySchedule as any)[day.key];
                            return (
                              <div
                                key={day.key}
                                className={`p-3 rounded-xl border transition ${
                                  dayData.active ? "bg-slate-50/70 border-slate-200" : "bg-slate-100/60 border-slate-200 opacity-60"
                                }`}
                              >
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                                  <span className="font-bold text-xs text-slate-800">{day.label}</span>
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={dayData.active}
                                      onChange={(e) =>
                                        setWeeklySchedule({
                                          ...weeklySchedule,
                                          [day.key]: { ...dayData, active: e.target.checked },
                                        })
                                      }
                                      className="rounded text-[#1967D2] focus:ring-0 w-3.5 h-3.5"
                                    />
                                    <span className="text-[11px] font-semibold text-slate-600">
                                      {dayData.active ? "Masuk" : "Libur"}
                                    </span>
                                  </label>
                                </div>

                                {dayData.active ? (
                                  <div className="space-y-1.5 text-[11px]">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-500">Masuk:</span>
                                      <input
                                        type="time"
                                        value={dayData.jamMasuk}
                                        onChange={(e) =>
                                          setWeeklySchedule({
                                            ...weeklySchedule,
                                            [day.key]: { ...dayData, jamMasuk: e.target.value },
                                          })
                                        }
                                        className="text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-200 bg-white"
                                      />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-amber-600">Terlambat:</span>
                                      <input
                                        type="time"
                                        value={dayData.jamTerlambat}
                                        onChange={(e) =>
                                          setWeeklySchedule({
                                            ...weeklySchedule,
                                            [day.key]: { ...dayData, jamTerlambat: e.target.value },
                                          })
                                        }
                                        className="text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-200 bg-white text-amber-700"
                                      />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-rose-600">Tutup Alpha:</span>
                                      <input
                                        type="time"
                                        value={dayData.jamAlpha}
                                        onChange={(e) =>
                                          setWeeklySchedule({
                                            ...weeklySchedule,
                                            [day.key]: { ...dayData, jamAlpha: e.target.value },
                                          })
                                        }
                                        className="text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-200 bg-white text-rose-700"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-4 text-xs text-slate-400 font-medium">
                                    Hari Libur Sekolah
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Live Actions & Telemetry Strip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-xs font-semibold text-slate-700">
                        Total: <span className="text-slate-900 font-extrabold">{studentPresenceList.length}</span> Siswa
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="text-xs font-semibold text-emerald-700">
                        Sudah Absen: <span className="font-extrabold">{studentPresenceList.filter((s) => s.hasAttended).length}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="text-xs font-semibold text-rose-600">
                        Belum Absen: <span className="font-extrabold">{studentPresenceList.filter((s) => !s.hasAttended).length}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Online Web: <span className="font-extrabold">{studentPresenceList.filter((s) => s.isOnline).length}</span></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleMassVerifyAllPresence}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verifikasi Massal Hari Ini</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRealtimeAttendanceOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Monitoring Layar Penuh</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. Tabel Presensi Siswa Real-Time Supabase & Kontrol Status */}
                  <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                    {/* Header Filter & Searching */}
                    <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                        {[
                          { id: "all", label: "Semua Siswa" },
                          { id: "hadir", label: "Sudah Absen" },
                          { id: "offline", label: "Belum Absen" },
                          { id: "online", label: "Online Membuka Web" },
                        ].map((flt) => (
                          <button
                            key={flt.id}
                            type="button"
                            onClick={() => setPresenceFilter(flt.id as any)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer border ${
                              presenceFilter === flt.id
                                ? "bg-[#1967D2] text-white border-[#1967D2]"
                                : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200"
                            }`}
                          >
                            {flt.label}
                          </button>
                        ))}
                      </div>

                      {/* Mesin Searching Cari Siswa / Kelas */}
                      <div className="relative shrink-0">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari nama siswa atau kelas..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="text-xs bg-white pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1967D2] w-full sm:w-60 font-medium"
                        />
                        {studentSearch && (
                          <button
                            type="button"
                            onClick={() => setStudentSearch("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="overflow-x-auto max-h-[460px]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/90 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0 font-bold z-10 backdrop-blur-xs">
                          <tr>
                            <th className="py-3 px-4">Foto Wajah</th>
                            <th className="py-3 px-3">Data Siswa (Supabase)</th>
                            <th className="py-3 px-3">Rombel</th>
                            <th className="py-3 px-3">Status Web</th>
                            <th className="py-3 px-3">Status Presensi</th>
                            <th className="py-3 px-3">Waktu Masuk</th>
                            <th className="py-3 px-4 text-right">Ubah Status oleh Guru</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {filteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-10 text-slate-400">
                                Tidak ada siswa yang sesuai pencarian atau filter.
                              </td>
                            </tr>
                          ) : (
                            filteredStudents.map((st) => (
                              <tr key={st.id} className="hover:bg-slate-50/80 transition">
                                {/* Foto Muka Real-Time */}
                                <td className="py-2.5 px-4">
                                  <div
                                    onClick={() => setSelectedSelfieZoom(st)}
                                    className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group shrink-0"
                                    title="Klik untuk zoom foto wajah real-time"
                                  >
                                    <Image
                                      src={st.selfieUrl}
                                      alt={st.name}
                                      fill
                                      className="object-cover group-hover:scale-110 transition duration-200"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                      <Maximize2 className="w-3 h-3 text-white" />
                                    </div>
                                    {/* Online dot indicator on corner */}
                                    <span
                                      className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-white ${
                                        st.isOnline ? "bg-emerald-500" : "bg-slate-400"
                                      }`}
                                    />
                                  </div>
                                </td>

                                {/* Nama Siswa & Data Supabase */}
                                <td className="py-2.5 px-3">
                                  <div className="font-bold text-slate-900">{st.name}</div>
                                  <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                    <span>Streak: 🔥 {st.streak ?? 5} hari</span>
                                    <span>•</span>
                                    <span className="text-[#1967D2] font-semibold">{st.points ?? 450} Poin</span>
                                  </div>
                                </td>

                                {/* Rombel */}
                                <td className="py-2.5 px-3 text-slate-600 font-semibold">
                                  {st.class}
                                </td>

                                {/* Status Web (Online / Offline) */}
                                <td className="py-2.5 px-3">
                                  {st.isOnline ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      <span>Online di Web</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                      Offline
                                    </span>
                                  )}
                                </td>

                                {/* Status Presensi (Sudah Absen / Belum) */}
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                      st.status === "Terverifikasi" || st.status === "Hadir" || st.status.includes("Tepat Waktu")
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                        : st.status.includes("Terlambat")
                                        ? "bg-amber-50 text-amber-800 border-amber-200"
                                        : st.status === "Izin"
                                        ? "bg-blue-50 text-blue-800 border-blue-200"
                                        : st.status === "Sakit"
                                        ? "bg-purple-50 text-purple-800 border-purple-200"
                                        : "bg-rose-50 text-rose-700 border-rose-200"
                                    }`}
                                  >
                                    {st.hasAttended ? `✓ ${st.status}` : "Belum Absen"}
                                  </span>
                                </td>

                                {/* Waktu Masuk */}
                                <td className="py-2.5 px-3 text-slate-700 font-medium">
                                  {st.timeIn || "—"}
                                </td>

                                {/* Tombol Ubah Status Guru */}
                                <td className="py-2.5 px-4 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleQuickUpdateStudentStatus(st.id, st.name, "Hadir (Tepat Waktu)")}
                                      title="Set Hadir Tepat Waktu"
                                      className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 cursor-pointer transition"
                                    >
                                      Hadir
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickUpdateStudentStatus(st.id, st.name, "Terlambat")}
                                      title="Set Terlambat"
                                      className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 cursor-pointer transition"
                                    >
                                      Terlambat
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickUpdateStudentStatus(st.id, st.name, "Izin")}
                                      title="Set Izin"
                                      className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200 cursor-pointer transition"
                                    >
                                      Izin
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickUpdateStudentStatus(st.id, st.name, "Sakit")}
                                      title="Set Sakit"
                                      className="px-2 py-0.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200 cursor-pointer transition"
                                    >
                                      Sakit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickUpdateStudentStatus(st.id, st.name, "Alpha")}
                                      title="Set Alpha"
                                      className="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200 cursor-pointer transition"
                                    >
                                      Alpa
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* MODUL 3: KURIKULUM & BAB PEMBELAJARAN (MODUL SISWA)  */}
              {/* ===================================================== */}
              {studentControlTab === "kurikulum" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Kontrol Akses Bab Matematika Kelas 8 & AI Tutor Gate
                      </span>
                      <span className="text-slate-500">
                        Atur bab mana saja yang terbuka untuk dipelajari siswa dan aktifkan bimbingan dialogis AI Sokratik per modul.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        4 Bab Terbuka
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {chaptersControl.map((ch) => (
                      <div
                        key={ch.id}
                        className="p-4.5 rounded-2xl bg-white border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition shadow-2xs"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-semibold text-[10px] border border-slate-200">
                              Bab {ch.nomor}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              Semester {ch.semester}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                ch.isOpen
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {ch.isOpen ? "Akses Terbuka" : "Terkunci"}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900">{ch.judul}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>{ch.totalMateri} Submateri</span>
                            <span>•</span>
                            <span>Ketuntasan Siswa: {ch.tuntasPercent}%</span>
                          </div>
                        </div>

                        {/* Controls per Bab */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {/* Toggle Akses Bab */}
                          <button
                            type="button"
                            onClick={() => handleToggleChapter(ch.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                              ch.isOpen
                                ? "bg-slate-900 hover:bg-slate-800 text-white border-slate-900"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                            }`}
                          >
                            {ch.isOpen ? (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Kunci Bab</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Buka Akses Siswa</span>
                              </>
                            )}
                          </button>

                          {/* Toggle Sokratik AI Tutor */}
                          <button
                            type="button"
                            onClick={() => handleToggleAiTutor(ch.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                              ch.aiTutorEnabled
                                ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                            }`}
                          >
                            <Bot className={`w-3.5 h-3.5 ${ch.aiTutorEnabled ? "text-amber-600" : "text-slate-400"}`} />
                            <span>{ch.aiTutorEnabled ? "AI Sokratik: Aktif" : "AI Sokratik: Nonaktif"}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* MODUL 4: BANK SOAL & REVIEW GATE AI (EKSLPORASI)      */}
              {/* ===================================================== */}
              {studentControlTab === "bank_soal" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Human-in-the-Loop Review Gate Soal Eksplorasi AI
                      </span>
                      <span className="text-slate-500">
                        Soal yang digenerate AI tidak akan muncul di dashboard siswa sebelum guru meninjau dan menerbitkannya.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/guru/soal/latihan"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs"
                      >
                        Bank Soal Manual
                      </Link>
                      <Link
                        href="/guru/soal/eksplorasi"
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs"
                      >
                        Generator Batch AI
                      </Link>
                    </div>
                  </div>

                  {/* Kuota AI Sokratik Harian Control */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-xs text-slate-900">Batas Pesan Chat AI Tutor per Hari</div>
                      <div className="text-[11px] text-slate-500">Siswa dibatasi agar berpikir mandiri tanpa bergantung pada AI.</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={50}
                        value={dailyAiLimit}
                        onChange={(e) => setDailyAiLimit(Number(e.target.value) || 20)}
                        className="w-20 px-2.5 py-1.5 text-xs font-semibold text-slate-900 rounded-xl border border-slate-300"
                      />
                      <span className="text-xs text-slate-600 font-semibold">pesan / hari</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNotification(`Batas interaksi AI disetel ke ${dailyAiLimit} pesan/hari.`);
                          setTimeout(() => setNotification(null), 3000);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#1967D2] hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>

                  {/* Antrean Draft Soal AI */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Antrean Draft Soal AI Menunggu Persetujuan Guru ({aiDraftQuestions.length})
                    </h3>

                    {aiDraftQuestions.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 font-medium bg-slate-50 rounded-xl border border-slate-200">
                        Tidak ada antrean draft soal AI saat ini. Semua soal telah diterbitkan.
                      </div>
                    ) : (
                      aiDraftQuestions.map((q) => (
                        <div
                          key={q.id}
                          className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 hover:border-slate-300 transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                                {q.bab}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                                {q.tipe}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                                Kesulitan: {q.kesulitan}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleApproveAiQuestion(q.id)}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                              >
                                Setujui & Terbitkan ke Siswa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectAiQuestion(q.id)}
                                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs border border-slate-200 transition cursor-pointer"
                              >
                                Tolak
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                            "{q.soal}"
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* MODUL 5: VALIDASI NILAI ESAI (HUMAN-IN-THE-LOOP)      */}
              {/* ===================================================== */}
              {studentControlTab === "penilaian" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Validasi & Override Nilai Esai Siswa
                      </span>
                      <span className="text-slate-500">
                        AI memberikan rekomendasi nilai awal. Guru memiliki hak mutlak untuk menyetujui, menaikkan, atau menurunkan skor.
                      </span>
                    </div>
                    <Link
                      href="/guru/penilaian-siswa"
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs shrink-0"
                    >
                      Buka Lembar Penilaian Lengkap
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {essaySubmissions.map((es) => (
                      <div
                        key={es.id}
                        className="p-4 rounded-xl bg-white border border-slate-200 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <div>
                            <div className="font-black text-sm text-[#0F172A]">{es.siswa}</div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {es.kelas} • {es.soal}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                                Rekomendasi AI
                              </span>
                              <span className="font-bold text-[#1967D2] text-sm">
                                {es.aiScore} / 100
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                                Nilai Akhir Guru
                              </span>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={es.teacherScore}
                                onChange={(e) => {
                                  const val = Number(e.target.value) || 0;
                                  setEssaySubmissions((prev) =>
                                    prev.map((item) =>
                                      item.id === es.id ? { ...item, teacherScore: val } : item
                                    )
                                  );
                                }}
                                className="w-16 px-2 py-1 text-xs font-bold text-slate-900 rounded-xl border border-slate-300 text-center"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                          <div className="text-[11px] text-slate-600">
                            <strong>Analisis AI:</strong> {es.aiReasoning}
                          </div>
                          <div className="text-[11px] text-slate-800">
                            <strong>Catatan Guru ke Siswa:</strong>{" "}
                            <input
                              type="text"
                              value={es.teacherNotes}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEssaySubmissions((prev) =>
                                  prev.map((item) =>
                                    item.id === es.id ? { ...item, teacherNotes: val } : item
                                  )
                                );
                              }}
                              className="w-full bg-white px-2 py-1 rounded border border-slate-200 text-xs mt-1 font-medium"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleApproveEssayGrade(es.id)}
                            disabled={es.status === "disetujui"}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                          >
                            {es.status === "disetujui" ? "Nilai Terbit ke Siswa ✓" : "Validasi & Terbitkan Nilai"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* MODUL 6: JADWAL & AGENDA KALENDER SISWA              */}
              {/* ===================================================== */}
              {studentControlTab === "jadwal_agenda" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-150">
                  {/* Kolom 1: Jadwal Mingguan Pelajaran Siswa */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        Jadwal Mingguan yang Tampil di Dashboard Siswa
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setWeeklySchedules((prev) => [
                            ...prev,
                            {
                              id: `js-${Date.now()}`,
                              hari: "Jumat",
                              jam: "08:00 - 09:30 WIB",
                              mapel: "Matematika",
                              kelas: "Kelas 8",
                              ruangan: "Lab Komputer",
                              guru: "Ibu Siti Rahmawati, M.Pd.",
                            },
                          ]);
                          setNotification("Slot jadwal mingguan baru ditambahkan!");
                          setTimeout(() => setNotification(null), 3000);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#1967D2] hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        + Tambah Slot
                      </button>
                    </div>

                    <div className="space-y-2">
                      {weeklySchedules.map((sch) => (
                        <div
                          key={sch.id}
                          className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{sch.mapel} ({sch.kelas})</div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {sch.hari} • {sch.jam} • {sch.ruangan}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setWeeklySchedules((prev) => prev.filter((s) => s.id !== sch.id));
                              setNotification("Jadwal dihapus dari tampilan siswa.");
                              setTimeout(() => setNotification(null), 3000);
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Hapus Jadwal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kolom 2: Agenda Kalender Akademik Siswa */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        Agenda Kalender Akademik Siswa
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setAcademicAgendas((prev) => [
                            ...prev,
                            {
                              id: `ag-${Date.now()}`,
                              tanggal: "2026-10-30",
                              judul: "Review Formatif AI Sokratik",
                              kategori: "agenda",
                              jam: "09:00 WIB",
                              status: "Terjadwal",
                            },
                          ]);
                          setNotification("Agenda baru diterbitkan ke kalender siswa!");
                          setTimeout(() => setNotification(null), 3000);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#1967D2] hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        + Tambah Agenda
                      </button>
                    </div>

                    <div className="space-y-2">
                      {academicAgendas.map((ag) => (
                        <div
                          key={ag.id}
                          className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{ag.judul}</div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {ag.tanggal} • {ag.jam}
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {ag.kategori.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* MODUL 7: TARGET MISI HARIAN & LEADERBOARD SISWA      */}
              {/* ===================================================== */}
              {studentControlTab === "misi_leaderboard" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* 1. Pengaturan Target Belajar Siswa Default */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                          <Target className="w-4 h-4 text-[#1967D2]" />
                          <span>Konfigurasi Target Misi Harian Otomatis Siswa</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Misi otomatis harian ini tampil di tab &apos;Belajar&apos; dashboard siswa untuk membangun konsistensi belajar.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveMissions}
                        className="px-4 py-2 rounded-xl bg-[#1967D2] hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan Target Misi</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Soal Mandiri</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={missionsConfig.targetSoal}
                            onChange={(e) => setMissionsConfig({ ...missionsConfig, targetSoal: Number(e.target.value) || 5 })}
                            className="w-20 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:border-[#1967D2]"
                          />
                          <span className="text-xs text-slate-600 font-semibold">soal / hari</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold block">Reward: +{missionsConfig.poinSoal} Poin Belajar</span>
                      </div>

                      <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Submateri Tuntas</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={missionsConfig.targetSubmateri}
                            onChange={(e) => setMissionsConfig({ ...missionsConfig, targetSubmateri: Number(e.target.value) || 1 })}
                            className="w-20 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:border-[#1967D2]"
                          />
                          <span className="text-xs text-slate-600 font-semibold">materi / hari</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold block">Reward: +{missionsConfig.poinSubmateri} Poin Belajar</span>
                      </div>

                      <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Presensi Pagi Sebelum</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={missionsConfig.targetPresensi}
                            onChange={(e) => setMissionsConfig({ ...missionsConfig, targetPresensi: e.target.value })}
                            className="w-28 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:border-[#1967D2]"
                          />
                          <span className="text-xs text-slate-600 font-semibold">WIB</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold block">Reward: +{missionsConfig.poinPresensi} Poin & Streak</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Guru Menambahkan Misi Baru yang Bisa Diklaim oleh Siswa */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span>Buat & Terbitkan Misi Siswa Baru (Bisa Diklaim)</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Guru dapat menambahkan misi tantangan khusus yang langsung muncul di dashboard seluruh siswa untuk diselesaikan dan diklaim poinnya.
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                        {teacherCustomMissions.length} Misi Aktif
                      </span>
                    </div>

                    <form onSubmit={handleCreateCustomMisi} className="space-y-3.5 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="lg:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Judul Misi Siswa</label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Selesaikan Latihan Bab 4 SPLDV Eliminasi"
                            value={newMisiJudul}
                            onChange={(e) => setNewMisiJudul(e.target.value)}
                            className="w-full text-xs bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1967D2] font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Kategori Misi</label>
                          <select
                            value={newMisiKategori}
                            onChange={(e) => setNewMisiKategori(e.target.value as any)}
                            className="w-full text-xs bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1967D2] font-semibold"
                          >
                            <option value="akademik">Akademik & Materi</option>
                            <option value="sokratik">AI Sokratik Tutor</option>
                            <option value="presensi">Presensi & Kehadiran</option>
                            <option value="tantangan">Tantangan Khusus</option>
                            <option value="kuis">Kuis / Latihan</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Reward Hadiah Poin</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={5}
                              max={500}
                              step={5}
                              value={newMisiPoin}
                              onChange={(e) => setNewMisiPoin(Number(e.target.value) || 30)}
                              className="w-full text-xs bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1967D2] font-bold text-emerald-700"
                            />
                            <span className="text-xs font-bold text-slate-600 shrink-0">Poin</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Petunjuk / Panduan untuk Siswa</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="Jelaskan apa yang harus dilakukan siswa untuk menyelesaikan misi ini..."
                          value={newMisiDeskripsi}
                          onChange={(e) => setNewMisiDeskripsi(e.target.value)}
                          className="w-full text-xs bg-white p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1967D2] font-medium"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={isAddingMisi}
                          className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isAddingMisi ? "Menerbitkan..." : "Terbitkan Misi untuk Siswa"}</span>
                        </button>
                      </div>
                    </form>

                    {/* Daftar Misi yang Aktif Diterbitkan */}
                    <div className="space-y-2.5 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Daftar Misi Aktif yang Dapat Diklaim Siswa
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {teacherCustomMissions.map((misi) => (
                          <div
                            key={misi.id}
                            className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                              misi.aktif ? "bg-white border-slate-200 shadow-xs" : "bg-slate-50 border-slate-200 opacity-60"
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#1967D2] border border-blue-200">
                                  {misi.kategori}
                                </span>
                                <span className="text-[11px] font-extrabold text-emerald-700">
                                  +{misi.poin_hadiah} Poin
                                </span>
                              </div>
                              <h5 className="font-bold text-xs text-slate-900 truncate">{misi.judul}</h5>
                              <p className="text-[11px] text-slate-500 line-clamp-2">{misi.deskripsi}</p>
                              <div className="text-[10px] text-slate-400 pt-0.5">
                                Diklaim oleh: <span className="font-bold text-slate-700">{misi.total_klaim ?? 0} Siswa</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleMisi(misi.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition ${
                                  misi.aktif
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                                }`}
                              >
                                {misi.aktif ? "Aktif" : "Nonaktif"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMisi(misi.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Hapus Misi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Leaderboard Siswa Widget */}
                  <StudentLeaderboardWidget />
                </div>
              )}

              {/* ===================================================== */}
              {/* MODUL 8: SIARAN BROADCAST & NOTIFIKASI SISWA         */}
              {/* ===================================================== */}
              {studentControlTab === "broadcast" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* 1. Settingan Notifikasi Otomatis Siswa */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#1967D2]" />
                          <span>Settingan Notifikasi Otomatis Siswa</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Aktifkan notifikasi otomatis yang dikirimkan oleh sistem ke dashboard siswa berdasarkan jadwal dan kegiatan belajar.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveAutoNotif}
                        className="px-4 py-2 rounded-xl bg-[#1967D2] hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan Notifikasi Otomatis</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        {
                          key: "pengingatPresensi",
                          title: "⏰ Pengingat Presensi Pagi",
                          desc: "Ingatkan siswa 15 menit sebelum batas masuk dan peringatan mendekati jam terlambat.",
                        },
                        {
                          key: "deadlineTugas",
                          title: "📝 Pengingat Batas Tugas / PR",
                          desc: "Kirim notifikasi H-1 sebelum deadline tugas atau kuis berakhir ke siswa yang belum selesai.",
                        },
                        {
                          key: "pengumumanNilai",
                          title: "🏆 Pengumuman Nilai Keluar",
                          desc: "Beritahu siswa secara otomatis saat nilai asesmen atau esai selesai divalidasi guru.",
                        },
                        {
                          key: "ucapanSemangat",
                          title: "🔥 Ucapan Semangat & Streak",
                          desc: "Kirim pesan motivasi belajar dan konfirmasi penambahan streak saat siswa membuka web hari ini.",
                        },
                        {
                          key: "aksesUjian",
                          title: "🔐 Ruang Ujian / Ulangan Dibuka",
                          desc: "Kirim alert notifikasi pop-up ketika guru membuka sesi ujian resmi AKU LULUS.",
                        },
                      ].map((item) => {
                        const isChecked = (autoNotifSettings as any)[item.key];
                        return (
                          <div
                            key={item.key}
                            onClick={() =>
                              setAutoNotifSettings({
                                ...autoNotifSettings,
                                [item.key]: !isChecked,
                              })
                            }
                            className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                              isChecked
                                ? "bg-white border-blue-200 shadow-xs"
                                : "bg-slate-100/60 border-slate-200 opacity-60"
                            }`}
                          >
                            <div className="space-y-1">
                              <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                              <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded text-[#1967D2] focus:ring-0 w-4 h-4 mt-0.5 shrink-0"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Form Guru Menambahkan Notifikasi Manual Baru */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                          <Send className="w-4 h-4 text-emerald-600" />
                          <span>Siarkan Notifikasi Manual Baru ke Siswa</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Pesan yang dibuat di sini akan langsung tersimpan di pusat notifikasi siswa dan muncul sebagai pop-up real-time di layar siswa.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsNotificationModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition"
                      >
                        Buka 7 Template Cepat
                      </button>
                    </div>

                    <form onSubmit={handleSendDirectBroadcast} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Judul Pengumuman</label>
                          <input
                            type="text"
                            required
                            value={broadcastDirectTitle}
                            onChange={(e) => setBroadcastDirectTitle(e.target.value)}
                            placeholder="Contoh: Pengingat Ulangan Harian SPLDV Pukul 08:00 WIB"
                            className="w-full text-xs bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1967D2] font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Tingkat Urgensi</label>
                          <select
                            value={broadcastDirectType}
                            onChange={(e) => setBroadcastDirectType(e.target.value as any)}
                            className="w-full text-xs bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1967D2] font-semibold"
                          >
                            <option value="info">Informasi Umum (Netral)</option>
                            <option value="penting">Penting & Mendesak (Amber)</option>
                            <option value="tugas">Instruksi Tugas (Indigo)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Isi Pesan Notifikasi ke Siswa</label>
                          <textarea
                            required
                            rows={3}
                            value={broadcastDirectMessage}
                            onChange={(e) => setBroadcastDirectMessage(e.target.value)}
                            placeholder="Tuliskan instruksi lengkap untuk siswa..."
                            className="w-full text-xs bg-white p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1967D2] font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Target Penerima Siswa</label>
                          <select
                            value={broadcastTargetAudience}
                            onChange={(e) => setBroadcastTargetAudience(e.target.value)}
                            className="w-full text-xs bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1967D2] font-semibold"
                          >
                            <option value="seluruh_siswa">Seluruh Siswa Terdaftar</option>
                            <option value="Kelas 8A">Khusus Kelas 8A</option>
                            <option value="Kelas 8B">Khusus Kelas 8B</option>
                            <option value="Kelas 8C">Khusus Kelas 8C</option>
                          </select>
                          <p className="text-[10px] text-slate-500 pt-1">
                            Pesan akan terkirim sesuai filter sasaran.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={isSendingDirectBroadcast}
                          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <Bell className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isSendingDirectBroadcast ? "Menyiarkan..." : "Simpan & Siarkan Sekarang ke Siswa"}</span>
                        </button>
                      </div>
                    </form>

                    {/* Riwayat Notifikasi yang Pernah Dibuat Guru */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Riwayat Notifikasi Terkirim
                      </h4>
                      <div className="space-y-2">
                        {notificationHistory.map((notif) => (
                          <div
                            key={notif.id}
                            className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 truncate">{notif.judul}</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                                  {notif.target}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">{notif.pesan}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0">{notif.waktu}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. VIEW MANAJEMEN SISWA: HASIL KESELURUHAN SISWA & POIN */}
        {activeView === "manajemen_siswa" && (
          <div className="animate-in fade-in duration-150">
            <ManajemenKelasNormalScreen
              isEmbedded={true}
              onClose={() => {
                setActiveView("beranda");
                window.history.pushState(null, "", "/guru");
              }}
            />
          </div>
        )}

        {/* 3. VIEW MANAGEMENT KELAS: 3 CARD (RUANG BELAJAR, RUANG UJIAN & ULANGAN, SETTING PROFILE SISWA & KARTU PELAJAR) */}
        {activeView === "manajemen_kelas" && (
          <div className="animate-in fade-in duration-150">
            <ManagementKelasTabScreen
              onNavigateView={(view) => {
                if (view === "beranda") {
                  setActiveView("beranda");
                  window.history.pushState(null, "", "/guru");
                } else if (view === "pengaturan") {
                  setActiveView("pengaturan");
                  window.history.pushState(null, "", "/guru?view=pengaturan");
                } else if (view === "manajemen_siswa") {
                  setActiveView("manajemen_siswa");
                  window.history.pushState(null, "", "/guru?view=manajemen_siswa");
                } else if (view === "pengelolaan") {
                  setActiveView("pengelolaan");
                  window.history.pushState(null, "", "/guru?view=pengelolaan");
                }
              }}
            />
          </div>
        )}

        {/* 3. VIEW PENGELOLAAN: NORMAL SCREEN (KELOLA KUIS, KELOLA SIMULASI, KELOLA RUANG UJIAN -> ULANGAN, UJIAN) */}
        {activeView === "pengelolaan" && (
          <div className="animate-in fade-in duration-150">
            <PengelolaanNormalScreen
              onNavigateHome={() => {
                setActiveView("beranda");
                window.history.pushState(null, "", "/guru");
              }}
            />
          </div>
        )}

        {/* 4. VIEW PENGATURAN: NORMAL SCREEN (SETTING TATA LETAK HOMESCREEN & WARNA TEMA GURU) */}
        {activeView === "pengaturan" && (
          <div className="animate-in fade-in duration-150">
            <PengaturanNormalScreen />
          </div>
        )}

  </div>

      {/* ======================================================== */}
      {/* 4. MODAL STAT 1: ANALISIS RATA-RATA SKOR KELAS (78%)      */}
      {/* ======================================================== */}
      {isScoreAvgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#0F172A] text-lg">Analisis & Performa Skor Kelas</h2>
                  <p className="text-xs text-slate-500 font-medium">Rata-rata skor keseluruhan siswa: **78% (+2.4% bulan ini)**</p>
                </div>
              </div>
              <button onClick={() => setIsScoreAvgModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="text-xl font-extrabold text-emerald-700">96%</div>
                <div className="text-[10px] text-emerald-600 font-bold">Skor Tertinggi</div>
                <div className="text-[9px] text-slate-400 mt-0.5 truncate">Ahmad Raihan (8A)</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="text-xl font-extrabold text-blue-700">78%</div>
                <div className="text-[10px] text-blue-600 font-bold">Rata-rata Sekolah</div>
                <div className="text-[9px] text-slate-400 mt-0.5">3 Kelas Terdaftar</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100">
                <div className="text-xl font-extrabold text-red-700">58%</div>
                <div className="text-[10px] text-red-600 font-bold">Skor Terendah</div>
                <div className="text-[9px] text-slate-400 mt-0.5 truncate">Gilang Ramadhan (8C)</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Breakdown Rata-rata Skor Per Kelas</h3>
              <div className="space-y-2">
                {classList.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold">
                    <span className="text-[#0F172A]">{c.title} ({c.name})</span>
                    <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-extrabold">{c.avgScore > 0 ? `${c.avgScore}%` : "Baru"}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
              <div className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-zinc-950" /> Rekomendasi Pembelajaran AI Sokratik
              </div>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                Rata-rata kelas meningkat +2.4%. Disarankan fokus memberikan latihan tambahan pada bab **Persamaan Linear Dua Variabel** bagi siswa dengan skor &lt;65%.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsScoreAvgModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-extrabold">Tutup Analisis</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL STAT 3: BANK SOAL & KONTEN DITERBITKAN (48)       */}
      {/* ======================================================== */}
      {isQuestionsStatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#0F172A] text-lg">Bank Soal & Konten Diterbitkan</h2>
                  <p className="text-xs text-slate-500 font-medium">Total **48 Soal** telah dibuat & diterbitkan bulan ini</p>
                </div>
              </div>
              <button onClick={() => setIsQuestionsStatModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="text-2xl font-extrabold text-blue-700">28</div>
                <div className="text-xs font-bold text-blue-800">Soal Manual Guru</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Disusun manual di Bank Soal</div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <div className="text-2xl font-extrabold text-amber-700">20</div>
                <div className="text-xs font-bold text-amber-800">Soal AI Generated</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Gemini 2.5 Flash Sokratik</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Aksi Cepat Manajemen Soal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Link
                  href="/guru/soal/latihan"
                  onClick={() => setIsQuestionsStatModalOpen(false)}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-[#0F172A] transition"
                >
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" /> Bank Soal Manual</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link
                  href="/guru/soal/eksplorasi"
                  onClick={() => setIsQuestionsStatModalOpen(false)}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-[#0F172A] transition"
                >
                  <span className="flex items-center gap-2"><Bot className="w-4 h-4 text-amber-600" /> Kurasi Soal AI</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <Link
                href="/guru/soal/eksplorasi"
                onClick={() => setIsQuestionsStatModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" /> Buat Soal AI Baru
              </Link>
              <button onClick={() => setIsQuestionsStatModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL STAT 4: SISWA PERLU PERHATIAN (<65%) (5 SISWA)  */}
      {/* ======================================================== */}
      {isStrugglingStudentsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#0F172A] text-lg">Siswa Perlu Perhatian & Intervensi (5)</h2>
                  <p className="text-xs text-slate-500 font-medium">Daftar siswa dengan skor rata-rata di bawah **65%** yang membutuhkan bimbingan</p>
                </div>
              </div>
              <button onClick={() => setIsStrugglingStudentsModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {strugglingStudents.map((st) => (
                <div key={st.id} className="p-4 rounded-2xl bg-red-50/50 border border-red-100 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-[#0F172A]">{st.name}</h4>
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">{st.class}</span>
                    </div>
                    <p className="text-[11px] text-red-700 font-semibold">Materi Lemah: {st.topic}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-extrabold text-red-600">{st.score}%</div>
                      <div className="text-[9px] text-slate-500 font-bold">{st.status}</div>
                    </div>
                    <Link
                      href={`/guru/siswa`}
                      onClick={() => setIsStrugglingStudentsModalOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
                    >
                      Bimbingan
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsStrugglingStudentsModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-extrabold">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. MODAL DETAIL JADWAL KELAS (CLICKABLE SCHEDULE ITEM)   */}
      {/* ======================================================== */}
      {selectedScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 text-left relative">
            <button onClick={() => setSelectedScheduleModal(null)} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{selectedScheduleModal.time}</span>
                <h3 className="text-lg font-extrabold text-[#0F172A]">{selectedScheduleModal.className}</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedScheduleModal.room} · {selectedScheduleModal.studentsCount} Siswa</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Topik Pelajaran Sesi Ini</div>
              <p className="text-xs font-bold text-[#0F172A]">{selectedScheduleModal.topic}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedScheduleModal(null);
                  setIsPresenceModalOpen(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Camera className="w-4 h-4" /> Cek Presensi
              </button>
              <button
                onClick={() => {
                  setSelectedScheduleModal(null);
                  router.push("/guru/siswa");
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>Buka Kelas</span> <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. MODAL STATUS SISWA, PRESENSI & FOTO SELFIE ABSENSI    */}
      {/* ======================================================== */}
      {isPresenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#0F172A] text-lg flex items-center gap-2">
                    Status Kehadiran & Foto Absensi Siswa
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Klik kartu angka di bawah untuk memfilter daftar siswa secara instan.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAttendanceConfigOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Atur Batas Waktu</span>
                </button>
                <button
                  onClick={() => setIsPresenceModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Top Stat Bar (BISA DIKLIK KEDUA-DUANYA UNTUK FILTER LIST) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                onClick={() => setPresenceFilter("all")}
                className={`p-3.5 rounded-2xl text-center cursor-pointer transition-all duration-200 ${
                  presenceFilter === "all"
                    ? "bg-[#0F172A] text-white shadow-md ring-2 ring-[#0F172A]"
                    : "bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[#0F172A]"
                }`}
              >
                <div className="text-xl font-extrabold">{totalSiswaAktif}</div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${presenceFilter === "all" ? "text-amber-400" : "text-slate-500"}`}>
                  TOTAL SISWA
                </div>
              </div>

              <div
                onClick={() => setPresenceFilter("hadir")}
                className={`p-3.5 rounded-2xl text-center cursor-pointer transition-all duration-200 ${
                  presenceFilter === "hadir"
                    ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500"
                    : "bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900"
                }`}
              >
                <div className="text-xl font-extrabold">{totalHadir}</div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${presenceFilter === "hadir" ? "text-emerald-100" : "text-emerald-700"}`}>
                  SUDAH ABSEN
                </div>
              </div>

              <div
                onClick={() => setPresenceFilter("online")}
                className={`p-3.5 rounded-2xl text-center cursor-pointer transition-all duration-200 ${
                  presenceFilter === "online"
                    ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-500"
                    : "bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-900"
                }`}
              >
                <div className="text-xl font-extrabold">{totalOnline}</div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${presenceFilter === "online" ? "text-blue-100" : "text-blue-700"}`}>
                  SEDANG ONLINE
                </div>
              </div>

              <div
                onClick={() => setPresenceFilter("offline")}
                className={`p-3.5 rounded-2xl text-center cursor-pointer transition-all duration-200 ${
                  presenceFilter === "offline"
                    ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-500"
                    : "bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900"
                }`}
              >
                <div className="text-xl font-extrabold">{totalOfflineOrAbsent}</div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${presenceFilter === "offline" ? "text-amber-100" : "text-amber-800"}`}>
                  BELUM ABSEN / OFFLINE
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setPresenceFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    presenceFilter === "all"
                      ? "bg-[#0F172A] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Semua Siswa
                </button>
                <button
                  onClick={() => setPresenceFilter("hadir")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    presenceFilter === "hadir"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Sudah Absen ({totalHadir})
                </button>
                <button
                  onClick={() => setPresenceFilter("online")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    presenceFilter === "online"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Sedang Online ({totalOnline})
                </button>
                <button
                  onClick={() => setPresenceFilter("offline")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    presenceFilter === "offline"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Belum Absen / Offline
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Cari nama siswa / kelas..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            {/* Students Presence Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredStudents.map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition-all shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      onClick={() => setSelectedSelfieZoom(st)}
                      className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-amber-500 transition cursor-pointer shrink-0 group/photo shadow-xs"
                      title="Klik untuk perbesar foto selfie"
                    >
                      <img
                        src={st.selfieUrl}
                        alt={st.name}
                        className="w-full h-full object-cover group-hover/photo:scale-110 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition flex items-center justify-center text-white">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-[#0F172A] truncate">{st.name}</h4>
                        {st.isOnline ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                            Offline
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 font-semibold">{st.class}</p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {st.hasAttended ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {st.timeIn}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            <UserX className="w-3 h-3 text-amber-600" />
                            Belum Absen
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPresenceStudent(st);
                        setEditStatusValue(st.status === "Belum Absen" ? "Hadir (Tepat Waktu)" : st.status);
                        setEditTimeValue(st.timeIn ? st.timeIn.split(" ")[0] : "07:30");
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold transition flex items-center gap-1 shadow-xs cursor-pointer"
                      title="Atur jam & status kehadiran siswa ini"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Atur Jam</span>
                    </button>
                    <Link
                      href={`/guru/siswa`}
                      onClick={() => setIsPresenceModalOpen(false)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-[#0F172A] hover:text-white text-slate-700 transition flex items-center gap-1 text-xs font-bold"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Modal */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Menampilkan {filteredStudents.length} siswa hari ini</span>
              <button
                onClick={() => setIsPresenceModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-extrabold hover:bg-slate-800 transition cursor-pointer"
              >
                Tutup Pilihan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8.1 MODAL ATUR JAM & STATUS KEHADIRAN SISWA               */}
      {/* ======================================================== */}
      {editingPresenceStudent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0F172A]">Atur Jam & Status Kehadiran</h3>
                  <p className="text-xs text-slate-500 font-medium">{editingPresenceStudent.name} · {editingPresenceStudent.class}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPresenceStudent(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentPresence} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status Kehadiran
                </label>
                <select
                  value={editStatusValue}
                  onChange={(e) => setEditStatusValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Hadir (Tepat Waktu)">Hadir (Tepat Waktu)</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Izin">Izin (Surat Keterangan)</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Alpha">Alpha (Tanpa Keterangan)</option>
                  <option value="Terverifikasi">Terverifikasi Resmi</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jam Kehadiran Masuk (WIB)
                </label>
                <input
                  type="time"
                  required
                  value={editTimeValue}
                  onChange={(e) => setEditTimeValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPresenceStudent(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingPresence}
                  className="flex-1 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSavingPresence ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    <Save className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{isSavingPresence ? "Menyimpan..." : "Simpan Jam Kehadiran"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. MODAL ZOOM FOTO SELFIE ABSENSI                        */}
      {/* ======================================================== */}
      {selectedSelfieZoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5 text-center relative">
            <button
              onClick={() => setSelectedSelfieZoom(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Verifikasi Kamera Selfie
              </span>
              <h3 className="text-lg font-extrabold text-[#0F172A]">{selectedSelfieZoom.name}</h3>
              <p className="text-xs text-slate-500 font-semibold">
                {selectedSelfieZoom.class} · {selectedSelfieZoom.timeIn || "Belum Absen"}
              </p>
            </div>

            <div className="relative w-full h-72 rounded-2xl overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-900">
              <img
                src={selectedSelfieZoom.selfieUrl}
                alt={selectedSelfieZoom.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/80 text-white text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> Foto Sah (Kamera Selfie)
                </span>
                <span className="text-[10px] text-slate-300 font-semibold">{selectedSelfieZoom.timeIn}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setNotification(`Presensi selfie ${selectedSelfieZoom.name} berhasil diverifikasi!`);
                  setSelectedSelfieZoom(null);
                  setTimeout(() => setNotification(null), 4000);
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verifikasi Presensi Valid</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 10. MODAL DETAIL & EDIT KELAS CARD                       */}
      {/* ======================================================== */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl bg-[#090D16] border border-slate-700 text-white flex items-center justify-center font-extrabold text-base shadow-sm shrink-0"
                >
                  {selectedClass.name}
                </div>
                <div>
                  <h2 className="font-extrabold text-[#0F172A] text-lg">{selectedClass.title}</h2>
                  <p className="text-xs text-slate-500 font-medium">{selectedClass.chapter}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingInModal(!isEditingInModal)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer border ${
                    isEditingInModal
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  }`}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{isEditingInModal ? "Mode Buka" : "Edit Kelas"}</span>
                </button>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isEditingInModal ? (
              <form onSubmit={handleSaveEditClass} className="space-y-4">
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-semibold flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Anda dalam mode **Edit Data Kelas**. Perubahan akan diperbarui pada kartu dashboard.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                      Kode Kelas
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                      Nama Lengkap Kelas
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    Judul Bab / Pelajaran Berjalan
                  </label>
                  <input
                    type="text"
                    value={editChapter}
                    onChange={(e) => setEditChapter(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                      Jumlah Siswa
                    </label>
                    <input
                      type="number"
                      value={editStudents}
                      onChange={(e) => setEditStudents(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                      Rata-rata Skor (%)
                    </label>
                    <input
                      type="number"
                      value={editAvgScore}
                      onChange={(e) => setEditAvgScore(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                      Penyelesaian (%)
                    </label>
                    <input
                      type="number"
                      value={editProgress}
                      onChange={(e) => setEditProgress(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    Tema Warna Card
                  </label>
                  <select
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none"
                  >
                    <option value="bg-slate-900">Slate Solid (Hitam Arsitektural)</option>
                    <option value="bg-blue-900">Oxford Navy (Biru Akademis)</option>
                    <option value="bg-emerald-900">Pine Emerald (Hijau Keasramaan)</option>
                    <option value="bg-amber-900">Warm Ochre (Emas Klasik)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingInModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                  >
                    Batal Edit
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <Save className="w-4 h-4 text-amber-400" />}
                    <span>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                    <div className="text-xl font-extrabold text-[#0F172A]">{selectedClass.studentsCount}</div>
                    <div className="text-[10px] text-blue-600 font-bold mt-0.5">Siswa Terdaftar</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
                    <div className="text-xl font-extrabold text-[#0F172A]">
                      {selectedClass.avgScore > 0 ? `${selectedClass.avgScore}%` : "Baru"}
                    </div>
                    <div className="text-[10px] text-amber-600 font-bold mt-0.5">Rata-rata Skor</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                    <div className="text-xl font-extrabold text-[#0F172A]">{selectedClass.progress}%</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Progress Pelajaran</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-blue-600" />
                    Sub-Materi & Modul Pembelajaran Aktif
                  </h3>

                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-[#0F172A]">
                      <span>1. Pengenalan Konsep & Rumus Dasar</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">Selesai</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-[#0F172A]">
                      <span>2. Latihan Soal Interaktif + AI Sokratik</span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px]">Berlangsung</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-[#0F172A]">
                      <span>3. Kuis Berwaktu & Evaluasi Esai</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px]">Draft Pelajaran</span>
                    </div>
                  </div>
                </div>

                {/* Banner Integrasi Soal Kelas Aktif */}
                <div className="p-4 rounded-2xl border border-blue-200/80 bg-blue-50/70 text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold tracking-tight text-[#0F172A] flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#1967D2]" />
                      Konfigurasi Soal & Asesmen Kelas Aktif
                    </div>
                    <p className="text-[11px] font-sans text-slate-600 font-medium">
                      Kelola daftar soal terpasang, parameter timer KKM, dan status pengerjaan siswa.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const cls = selectedClass;
                      setSelectedClass(null);
                      handleOpenKelasSoalSetting(cls);
                    }}
                    className="px-3.5 py-2 bg-[#1967D2] hover:bg-blue-600 text-white font-sans text-xs font-bold rounded-xl shadow-xs transition cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Setting Soal</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => handleDeleteClass(selectedClass.id, selectedClass.title)}
                    className="px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Kelas</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingInModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-extrabold flex items-center gap-2 transition cursor-pointer border border-slate-200"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                      <span>Edit Data Kelas</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClass(null);
                        router.push("/guru/siswa");
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shadow-md"
                    >
                      <span>Buka Manajemen Siswa</span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 11. MODAL TAMBAH KELAS BARU & DRAFT PELAJARAN            */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#0F172A] text-base">Tambah Kelas Baru & Pelajaran</h2>
                  <p className="text-xs text-slate-500 font-medium">Buat kelas baru dan buatkan draft materi awal</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClassSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    Kode (Singkatan) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={kodeKelas}
                    onChange={(e) => setKodeKelas(e.target.value)}
                    placeholder="contoh: 8D"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    Nama Lengkap Kelas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={namaKelas}
                    onChange={(e) => setNamaKelas(e.target.value)}
                    required
                    placeholder="contoh: Matematika 8–D"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Judul Bab / Pelajaran Pertama (Draft)
                </label>
                <div className="relative">
                  <BookMarked className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={judulBab}
                    onChange={(e) => setJudulBab(e.target.value)}
                    placeholder="contoh: Bab 5: Teorema Pythagoras"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Deskripsi / Rencana Materi Pelajaran
                </label>
                <textarea
                  value={deskripsiMateri}
                  onChange={(e) => setDeskripsiMateri(e.target.value)}
                  placeholder="contoh: Pengenalan konsep segitiga siku-siku, pembuktian luas kuadrat sisi miring, dan penyelesaian soal..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    Estimasi Jumlah Siswa
                  </label>
                  <input
                    type="number"
                    value={jumlahSiswa}
                    onChange={(e) => setJumlahSiswa(e.target.value)}
                    min={1}
                    max={60}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    Warna Tema Card Kelas
                  </label>
                  <select
                    value={pilihanWarna}
                    onChange={(e) => setPilihanWarna(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none"
                  >
                    <option value="bg-slate-900">Slate Solid (Hitam Arsitektural)</option>
                    <option value="bg-blue-900">Oxford Navy (Biru Akademis)</option>
                    <option value="bg-emerald-900">Pine Emerald (Hijau Keasramaan)</option>
                    <option value="bg-amber-900">Warm Ochre (Emas Klasik)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    <Plus className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{isSubmitting ? "Menyimpan..." : "Simpan & Buat Draft"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 12. MODAL LIHAT SEMUA KELAS                               */}
      {/* ======================================================== */}
      {isViewAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-extrabold text-[#0F172A] text-lg flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                  Seluruh Kelas Saya ({classList.length})
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Klik kartu mana saja untuk membuka detail atau mengedit data kelas
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsViewAllModalOpen(false);
                    router.push("/guru/siswa");
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition cursor-pointer"
                >
                  <span>Kelola di Manajemen Siswa</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
                <button
                  onClick={() => setIsViewAllModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama kelas atau judul bab pelajaran..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classList
                .filter(
                  (c) =>
                    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => {
                      setIsViewAllModalOpen(false);
                      handleOpenDetail(cls, false);
                    }}
                    className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 p-5 space-y-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl bg-[#090D16] border border-slate-700 flex items-center justify-center text-white font-extrabold text-sm shadow-sm shrink-0"
                      >
                        {cls.name}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#0F172A] group-hover:text-blue-600 transition">
                          {cls.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                          {cls.chapter}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-base font-extrabold text-[#0F172A]">{cls.studentsCount}</div>
                        <div className="text-[10px] text-slate-400 font-bold">Siswa</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-base font-extrabold text-[#0F172A]">
                          {cls.avgScore > 0 ? `${cls.avgScore}%` : "Baru"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">Rata-rata</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-sans text-slate-500">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsViewAllModalOpen(false);
                          handleOpenKelasSoalSetting(cls);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#1967D2] rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Sliders className="w-3 h-3 text-[#1967D2]" />
                        <span>Setting Soal</span>
                      </button>

                      <div className="flex items-center gap-1 text-slate-400 group-hover:text-[#1967D2] transition font-medium">
                        <span>Detail</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Menampilkan {classList.length} kelas aktif</span>
              <button
                onClick={() => {
                  setIsViewAllModalOpen(false);
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kelas Baru Lagi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. MODAL BROADCAST TUGAS & PENGUMUMAN KE DASHBOARD SISWA */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 bg-[#0F172A] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">Siarkan Tugas & Pengumuman</h2>
                  <p className="text-xs text-slate-400 font-medium">Tugas akan muncul di Dashboard & Notifikasi Siswa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!bJudul.trim() || !bTenggat) return;
              setIsBroadcasting(true);
              try {
                const res = await fetch("/api/guru/tugas", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    judul: bJudul.trim(),
                    deskripsi: bDeskripsi.trim(),
                    tenggatWaktu: bTenggat,
                    kategori: bKategori,
                    tingkatUrgensi: bUrgensi,
                  }),
                });
                const data = await res.json();
                if (res.ok) {
                  setNotification(`Sukses: Tugas "${bJudul}" telah disiarkan ke dashboard semua siswa!`);
                  setIsBroadcastModalOpen(false);
                  setBJudul("");
                  setBDeskripsi("");
                  setBTenggat("");
                  setTimeout(() => setNotification(null), 5000);
                } else {
                  alert(data.error || "Gagal menyiarkan tugas.");
                }
              } catch {
                setNotification(`Tugas "${bJudul}" berhasil disiarkan!`);
                setIsBroadcastModalOpen(false);
                setTimeout(() => setNotification(null), 5000);
              } finally {
                setIsBroadcasting(false);
              }
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Tugas / Pengumuman *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kuis Harian Bab 4 - Persamaan Linear"
                  value={bJudul}
                  onChange={(e) => setBJudul(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi / Petunjuk Pengerjaan
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan detail petunjuk, bab terkait, atau instruksi pengerjaan..."
                  value={bDeskripsi}
                  onChange={(e) => setBDeskripsi(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Tenggat Waktu *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={bTenggat}
                    onChange={(e) => setBTenggat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Kategori
                  </label>
                  <select
                    value={bKategori}
                    onChange={(e) => setBKategori(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="kuis">Kuis / Latihan</option>
                    <option value="tugas">Tugas Rumah (PR)</option>
                    <option value="ujian">Ujian / Asesmen</option>
                    <option value="pengumuman">Pengumuman</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Urgensi
                  </label>
                  <select
                    value={bUrgensi}
                    onChange={(e) => setBUrgensi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="tinggi">Tinggi (Urgensi Red)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-extrabold text-xs hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isBroadcasting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyiarkan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Siarkan ke Dashboard Siswa</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL ATUR BATAS WAKTU PRESENSI SEKOLAH */}
      <AttendanceLimitConfigModal
        isOpen={isAttendanceConfigOpen}
        onClose={() => setIsAttendanceConfigOpen(false)}
      />

      {/* ======================================================== */}
      {/* 10. FITUR BARU GURU (NOTIFIKASI, ABSENSI, NORMAL SCREENS) */}
      {/* ======================================================== */}
      {/* FITUR 1: PENGATURAN NOTIFIKASI SISWA & PENJADWALAN */}
      <GuruNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onSuccess={() => {
          setNotification("Notifikasi berhasil disiarkan / dijadwalkan!");
          setTimeout(() => setNotification(null), 4000);
        }}
      />

      {/* FITUR 2: PENGATURAN BATAS WAKTU & TENGGAT ABSENSI */}
      <GuruAttendanceDeadlineModal
        isOpen={isAttendanceDeadlineModalOpen}
        onClose={() => setIsAttendanceDeadlineModalOpen(false)}
        onSaved={() => {
          setNotification("Batas waktu absensi berhasil diatur & notifikasi tenggat disiarkan!");
          setTimeout(() => setNotification(null), 4000);
        }}
      />

      {/* FITUR 3: NORMAL SCREEN: MONITORING REALTIME ABSENSI SISWA */}
      <RealtimeAttendanceNormalScreen
        isOpen={isRealtimeAttendanceOpen}
        onClose={() => setIsRealtimeAttendanceOpen(false)}
        onOpenSettings={() => {
          setIsRealtimeAttendanceOpen(false);
          setIsAttendanceDeadlineModalOpen(true);
        }}
      />

      {/* FITUR 4: NORMAL SCREEN: MANAJEMEN KELAS (8A, 8B, 8C) */}
      <ManajemenKelasNormalScreen
        isOpen={isManajemenKelasOpen}
        onClose={() => setIsManajemenKelasOpen(false)}
      />

      {/* ======================================================== */}
      {/* MODAL POPUP: KARTU GURU (MUNCUL KETIKA BUTTON DIKLIK)     */}
      {/* ======================================================== */}
      {isCardGuruModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/60 animate-in fade-in duration-150">
          <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      Kartu Pengenal Resmi Guru
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      Kemendikbudristek RI
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                    Profil Pendidik • Ibu Siti Rahmawati, M.Pd.
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCardGuruModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Tutup (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content: Scrollable CardGuruProfile */}
            <div className="overflow-y-auto p-4 sm:p-6 bg-[#F8FAFC]">
              <CardGuruProfile
                onClose={() => setIsCardGuruModalOpen(false)}
                onOpenSettings={() => {
                  setIsCardGuruModalOpen(false);
                  setActiveView("pengaturan");
                  window.history.pushState(null, "", "/guru?tab=pengaturan");
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 12. MODAL SETTING SOAL KELAS AKTIF */}
      {isKelasSoalConfigOpen && selectedKelasForSoal && (
        <KelasSoalConfigModal
          isOpen={isKelasSoalConfigOpen}
          onClose={() => {
            setIsKelasSoalConfigOpen(false);
            setSelectedKelasForSoal(null);
          }}
          kelasId={selectedKelasForSoal.id}
          kelasName={selectedKelasForSoal.name}
          kelasTitle={selectedKelasForSoal.title}
          mapel="Matematika"
          onUpdated={() => {
            setNotification(`Pengaturan soal untuk ${selectedKelasForSoal.title} berhasil diperbarui!`);
            setTimeout(() => setNotification(null), 4000);
          }}
        />
      )}
    </GuruLayout>
  );
}

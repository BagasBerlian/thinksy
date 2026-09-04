"use client";

import { useState, useRef, useEffect } from "react";
import {
  BrainCircuit,
  Bell,
  User,
  Settings,
  LogOut,
  Sparkles,
  Trophy,
  Flame,
  Calendar,
  Clock,
  ChevronRight,
  BookOpen,
  X,
  FileText,
  CheckCircle2,
  Lock,
  Plus,
  MessageSquare,
  Search,
  Trash2,
  HelpCircle,
  Target,
  Camera,
  Sun,
  Moon,
  Loader2,
  RefreshCw,
  Award,
  GraduationCap,
  Globe,
  Gift,
  ExternalLink,
  TriangleAlert,
  Shield,
  Send,
  Flag,
  Share2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { logoutAction } from "../../(auth)/actions";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import GeneralAiChat from "@/components/tutor/GeneralAiChat";

export interface SekolahLink {
  label: string;
  url: string;
  icon?: string;
}

export interface SekolahData {
  id: string;
  nama: string;
  motto?: string | null;
  deskripsi?: string | null;
  bg_image_url?: string | null;
  links?: SekolahLink[] | null;
  alamat?: string | null;
  npsn?: string | null;
}

export interface PeerStudent {
  id: string;
  name: string;
  avatarUrl?: string | null;
  initials: string;
}

export interface CalendarDayItem {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  status: "today" | "streak" | "past" | "scheduled" | "normal" | "muted";
  fullDateStr: string;
  schedule: {
    bab: string;
    jam: string;
    room?: string;
    teacher?: string;
  } | null;
}

export interface CalendarWeekItem {
  weekIndex: number;
  hasStreakBadge: boolean;
  streakCount: number;
  days: CalendarDayItem[];
}

interface StudentDashboardProps {
  userProfile: {
    nama_lengkap: string;
    email: string;
    peran: string;
    poin: number;
    streak: number;
    rank: number;
    totalStudents: number;
    isCheckedIn: boolean;
    checkInTime: string | null;
    fotoSelfie?: string | null;
  };
  sekolahData?: SekolahData | null;
  schedulesData?: Array<{
    id: string;
    subject: string;
    teacher: string;
    day: string;
    time: string;
    room: string;
  }>;
  chapters: Array<{
    id: string;
    judul: string;
    deskripsi: string | null;
    urutan: number;
    progress?: number;
    materi?: Array<{
      id: string;
      judul: string;
      urutan: number;
    }>;
  }>;
  peerStudents?: PeerStudent[];
  completedQuizCount?: number;
  answeredSoalCount?: number;
  totalSoalCount?: number;
  learningProgressPercent?: number;
}

export default function StudentDashboardClient({
  userProfile,
  sekolahData,
  schedulesData,
  chapters = [],
  peerStudents = [],
  completedQuizCount = 0,
  answeredSoalCount = 0,
  totalSoalCount = 10,
  learningProgressPercent = 0,
}: StudentDashboardProps) {
  // Navigation Tabs State
  const [activeTab, setActiveTab] = useState<
    "Belajar" | "Kursus Saya" | "Peringkat" | "Pencapaian"
  >("Belajar");

  // UI Modals & Drawers State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // FAB & Student Learning Hub Feature Modals State
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isMyNotesOpen, setIsMyNotesOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);

  // My Notes State & Persistence
  const [notes, setNotes] = useState<Array<{ id: string; judul: string; konten: string; mata_pelajaran: string; dibuat_pada: string }>>([
    { id: "n1", judul: "Rangkuman Fotosintesis & Kloroplas", konten: "Fotosintesis terjadi di membran tilakoid kloroplas memanfaatkan energi foton cahaya matahari...", mata_pelajaran: "IPA Biologi", dibuat_pada: "31 Agustus 2026" },
    { id: "n2", judul: "Persiapan Ujian Matematika (Pythagoras)", konten: "Segitiga siku-siku memenuhi c^2 = a^2 + b^2. Tripel pythagoras populer: (3,4,5), (5,12,13), (7,24,25), (8,15,17).", mata_pelajaran: "Matematika", dibuat_pada: "30 Agustus 2026" },
  ]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteSubject, setNoteSubject] = useState("Matematika");
  const [notesSearch, setNotesSearch] = useState("");

  // Fetch student notes from API
  useEffect(() => {
    async function loadNotes() {
      try {
        const res = await fetch("/api/siswa/catatan");
        if (res.ok) {
          const data = await res.json();
          if (data.notes && data.notes.length > 0) {
            setNotes(
              data.notes.map((n: any) => ({
                id: n.id,
                judul: n.judul,
                konten: n.konten,
                mata_pelajaran: n.mata_pelajaran || "Umum",
                dibuat_pada: new Date(n.dibuat_pada).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
              }))
            );
          }
        }
      } catch {}
    }
    loadNotes();
  }, []);

  const handleCreateNote = async () => {
    if (!noteTitle.trim()) return;
    const newNoteObj = {
      id: Date.now().toString(),
      judul: noteTitle,
      konten: noteContent,
      mata_pelajaran: noteSubject,
      dibuat_pada: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    };
    setNotes([newNoteObj, ...notes]);
    setNoteTitle("");
    setNoteContent("");

    try {
      await fetch("/api/siswa/catatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judul: noteTitle, konten: noteContent, mata_pelajaran: noteSubject }),
      });
    } catch {}
  };

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/siswa/catatan?id=${id}`, { method: "DELETE" });
    } catch {}
  };

  // Global School Chat State & API Sync
  const [globalChats, setGlobalChats] = useState<Array<{ id: string; nama_penulis: string; kelas_penulis: string; konten: string; minat_kategori: string; jumlah_suka: number; jumlah_komentar: number; dibuat_pada: string }>>([
    { id: "c1", nama_penulis: "Raka Prasetya", kelas_penulis: "XI RPL 1", konten: "Siapa yang berminat ikut seleksi Lomba Robotik antar sekolah bulan ini?", minat_kategori: "Robotik", jumlah_suka: 5, jumlah_komentar: 2, dibuat_pada: "10 menit lalu" },
    { id: "c2", nama_penulis: "Naya Anindita", kelas_penulis: "XII DKV", konten: "Ada yang mau diskusi belajar bersama mengenai soal penalaran Pythagoras?", minat_kategori: "Matematika", jumlah_suka: 8, jumlah_komentar: 1, dibuat_pada: "25 menit lalu" },
  ]);
  const [newChatContent, setNewChatContent] = useState("");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [chatSearchResults, setChatSearchResults] = useState<{ students: any[]; communities: any[] }>({ students: [], communities: [] });
  const [reportReason, setReportReason] = useState("");
  const [reportingChatId, setReportingChatId] = useState<string | null>(null);

  // Chat Comments & Likes State
  const [expandedCommentsChatId, setExpandedCommentsChatId] = useState<string | null>(null);
  const [chatComments, setChatComments] = useState<Record<string, Array<{ id: string; nama_penulis: string; kelas_penulis: string; konten: string; dibuat_pada: string }>>>({
    c1: [
      { id: "cm1", nama_penulis: "Budi Santoso", kelas_penulis: "Kelas 8B", konten: "Saya tertarik ikut seleksi robotik!", dibuat_pada: "5 menit lalu" },
      { id: "cm2", nama_penulis: "Siti Aminah", kelas_penulis: "XI IPA 2", konten: "Bisa hubungi siapa untuk info lebih lanjut?", dibuat_pada: "2 menit lalu" },
    ],
    c2: [
      { id: "cm3", nama_penulis: "Andi Wijaya", kelas_penulis: "Kelas 8A", konten: "Boleh banget, nanti sore di perpustakaan ya!", dibuat_pada: "15 menit lalu" },
    ],
  });
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [loadingCommentsId, setLoadingCommentsId] = useState<string | null>(null);

  // Fetch Global Chat Feed from API
  useEffect(() => {
    async function loadGlobalChat() {
      try {
        const res = await fetch("/api/siswa/chat");
        if (res.ok) {
          const data = await res.json();
          if (data.chats && data.chats.length > 0) {
            setGlobalChats(
              data.chats.map((c: any) => ({
                id: c.id,
                nama_penulis: c.nama_penulis,
                kelas_penulis: c.kelas_penulis || "Siswa",
                konten: c.konten,
                minat_kategori: c.minat_kategori || "Umum",
                jumlah_suka: c.jumlah_suka || 0,
                jumlah_komentar: c.jumlah_komentar || 0,
                dibuat_pada: new Date(c.dibuat_pada).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
              }))
            );
          }
        }
      } catch {}
    }
    loadGlobalChat();
  }, []);

  const handleSendChat = async () => {
    if (!newChatContent.trim()) return;
    const tempId = Date.now().toString();
    const newChatObj = {
      id: tempId,
      nama_penulis: studentName,
      kelas_penulis: "Kelas 8A",
      konten: newChatContent.trim(),
      minat_kategori: "Diskusi",
      jumlah_suka: 0,
      jumlah_komentar: 0,
      dibuat_pada: "Baru saja",
    };
    setGlobalChats((prev) => [newChatObj, ...prev]);
    const sentText = newChatContent.trim();
    setNewChatContent("");

    try {
      const res = await fetch("/api/siswa/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ konten: sentText, minat_kategori: "Diskusi" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.chat) {
          const serverChat = {
            id: data.chat.id,
            nama_penulis: data.chat.nama_penulis,
            kelas_penulis: data.chat.kelas_penulis || "Kelas 8A",
            konten: data.chat.konten,
            minat_kategori: data.chat.minat_kategori || "Diskusi",
            jumlah_suka: data.chat.jumlah_suka || 0,
            jumlah_komentar: data.chat.jumlah_komentar || 0,
            dibuat_pada: "Baru saja",
          };
          setGlobalChats((prev) => prev.map((c) => (c.id === tempId ? serverChat : c)));
          broadcastEvent("CHAT_POSTED", { chat: serverChat });
        }
      }
    } catch {}
  };

  const handleLikeChat = async (chatId: string) => {
    let updatedLikes = 0;
    setGlobalChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          updatedLikes = c.jumlah_suka + 1;
          return { ...c, jumlah_suka: updatedLikes };
        }
        return c;
      })
    );

    broadcastEvent("CHAT_LIKED", { chatId, newLikes: updatedLikes });

    try {
      const res = await fetch("/api/siswa/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", chatId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.newLikes === "number") {
          setGlobalChats((prev) =>
            prev.map((c) => (c.id === chatId ? { ...c, jumlah_suka: data.newLikes } : c))
          );
        }
      }
    } catch {}
  };

  const handleToggleComments = async (chatId: string) => {
    if (expandedCommentsChatId === chatId) {
      setExpandedCommentsChatId(null);
      return;
    }
    setExpandedCommentsChatId(chatId);

    setLoadingCommentsId(chatId);
    try {
      const res = await fetch(`/api/siswa/chat?chat_id=${chatId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.comments) && data.comments.length > 0) {
          const formatted = data.comments.map((cm: any) => ({
            id: cm.id,
            nama_penulis: cm.nama_penulis,
            kelas_penulis: cm.kelas_penulis || "Siswa",
            konten: cm.konten,
            dibuat_pada: new Date(cm.dibuat_pada).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          }));
          setChatComments((prev) => ({ ...prev, [chatId]: formatted }));
        }
      }
    } catch {
      // silent fail
    } finally {
      setLoadingCommentsId(null);
    }
  };

  const handleSendReply = async (chatId: string) => {
    const replyText = (replyInputs[chatId] || "").trim();
    if (!replyText) return;

    const tempComment = {
      id: Date.now().toString(),
      nama_penulis: studentName,
      kelas_penulis: "Kelas 8A",
      konten: replyText,
      dibuat_pada: "Baru saja",
    };

    setChatComments((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), tempComment],
    }));

    let newCount = 0;
    setGlobalChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          newCount = c.jumlah_komentar + 1;
          return { ...c, jumlah_komentar: newCount };
        }
        return c;
      })
    );

    setReplyInputs((prev) => ({ ...prev, [chatId]: "" }));

    broadcastEvent("CHAT_COMMENTED", { chatId, comment: tempComment, newCommentCount: newCount });

    try {
      const res = await fetch("/api/siswa/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "comment", chatId, konten: replyText }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          const serverComment = {
            id: data.comment.id,
            nama_penulis: data.comment.nama_penulis,
            kelas_penulis: data.comment.kelas_penulis || "Kelas 8A",
            konten: data.comment.konten,
            dibuat_pada: "Baru saja",
          };
          setChatComments((prev) => ({
            ...prev,
            [chatId]: (prev[chatId] || []).map((cm) => (cm.id === tempComment.id ? serverComment : cm)),
          }));
        }
        if (typeof data.newCommentCount === "number") {
          setGlobalChats((prev) =>
            prev.map((c) => (c.id === chatId ? { ...c, jumlah_komentar: data.newCommentCount } : c))
          );
        }
      }
    } catch {}
  };

  const handleSearchStudents = async (query: string) => {
    setChatSearchQuery(query);
    if (!query.trim()) {
      setChatSearchResults({ students: [], communities: [] });
      return;
    }
    try {
      const res = await fetch(`/api/siswa/chat?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setChatSearchResults({ students: data.students || [], communities: data.communities || [] });
      }
    } catch {}
  };

  const handleReportContent = async (chatId: string) => {
    if (!reportReason.trim()) return;
    try {
      await fetch("/api/siswa/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "report", chatId, alasan: reportReason }),
      });
      setReportingChatId(null);
      setReportReason("");
      alert("Laporan Anda telah berhasil dikirimkan ke Tim Moderasi Sekolah.");
    } catch {}
  };

  // Theme Mode & Tutor Guidance State (Persisted in localStorage)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tutorGuidanceLevel, setTutorGuidanceLevel] = useState<string>("sedang");

  // Daily Missions State
  const [dailyMissions, setDailyMissions] = useState<any[]>([]);
  const [isClaimingMissionId, setIsClaimingMissionId] = useState<string | null>(null);
  const [isMissionsLoading, setIsMissionsLoading] = useState(true);

  // Guard tab for unassigned student
  useEffect(() => {
    if (!sekolahData && activeTab !== "Belajar") {
      setActiveTab("Belajar");
    }
  }, [sekolahData, activeTab]);

  // Load persisted theme & guidance level on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("thinksy_theme");
      if (savedTheme === "dark") {
        setIsDarkMode(true);
      } else if (savedTheme === "light") {
        setIsDarkMode(false);
      }

      const savedGuidance = localStorage.getItem("thinksy_tutor_guidance");
      if (savedGuidance) {
        setTutorGuidanceLevel(savedGuidance);
      }
    } catch {
      // ignore SSR or localStorage access error
    }
  }, []);

  // Dynamic Gamification State (Points, Streak, Presensi)
  const [learningPoints, setLearningPoints] = useState(userProfile?.poin ?? 0);
  const [dailyStreak, setDailyStreak] = useState(userProfile?.streak ?? 0);
  const [isCheckedIn, setIsCheckedIn] = useState(userProfile?.isCheckedIn || false);
  const [checkInTime, setCheckInTime] = useState<string | null>(
    userProfile?.checkInTime || null
  );
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(
    userProfile?.fotoSelfie || null
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);
  const [faceDetectorStatus, setFaceDetectorStatus] = useState<string>("Posisikan diri Anda di depan kamera");
  const [toastNotification, setToastNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
    time: string;
  } | null>(null);

  // Cross-Browser Camera Access
  const handleStartCamera = async () => {
    try {
      setIsAttendanceModalOpen(true);
      setIsCameraActive(true);
      setFaceDetectorStatus("Posisikan diri Anda di depan kamera lalu klik Ambil Foto Presensi");

      let stream: MediaStream | null = null;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } else {
        const legacyGetUserMedia =
          (navigator as any).getUserMedia ||
          (navigator as any).webkitGetUserMedia ||
          (navigator as any).mozGetUserMedia ||
          (navigator as any).msGetUserMedia;
        if (legacyGetUserMedia) {
          stream = await new Promise((resolve, reject) => {
            legacyGetUserMedia.call(navigator, { video: true }, resolve, reject);
          });
        }
      }

      if (stream) {
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play().catch(() => { });
        }
      }
    } catch (err: any) {
      console.error("[CAMERA ERROR]", err);
      setIsCameraActive(true);
    }
  };

  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.setAttribute("playsinline", "true");
      videoRef.current.play().catch(() => { });
    }
  }, [isCameraActive, cameraStream]);

  // Stop Camera Stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const studentName = userProfile?.nama_lengkap || "Budi Kartika";
  const studentEmail = userProfile?.email || "budi.kartika@sekolah.sch.id";

  const [notifications, setNotifications] = useState<
    Array<{
      id: string | number;
      title: string;
      desc: string;
      time: string;
      type: string;
      dibaca?: boolean;
    }>
  >([]);

  // Dynamic Leaderboard State & Real-Time Rank
  const [currentUserRank, setCurrentUserRank] = useState<number>(userProfile?.rank || 1);
  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(userProfile?.totalStudents || 1);
  const [leaderboardList, setLeaderboardList] = useState<
    Array<{
      rank: number;
      id: string;
      name: string;
      points: number;
      streak: number;
      school: string;
      isCurrentUser: boolean;
    }>
  >([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  // Fetch Notifications from Database
  const fetchNotificationsFromDB = async () => {
    try {
      const res = await fetch("/api/siswa/notifikasi");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch {
      // fallback
    }
  };

  // Fetch Leaderboard from API
  const fetchLeaderboardFromDB = async () => {
    setIsLoadingLeaderboard(true);
    try {
      const res = await fetch("/api/siswa/peringkat");
      if (res.ok) {
        const data = await res.json();
        if (data.leaderboard) {
          setLeaderboardList(data.leaderboard);
          const currentStudentInBoard = data.leaderboard.find((st: any) => st.isCurrentUser);
          if (currentStudentInBoard) {
            setCurrentUserRank(currentStudentInBoard.rank);
          }
          if (data.totalStudents) {
            setTotalStudentsCount(data.totalStudents);
          }
        }
      }
    } catch {
      // silent fail fallback
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const fetchMissionsFromDB = async () => {
    setIsMissionsLoading(true);
    try {
      const res = await fetch("/api/siswa/misi");
      if (res.ok) {
        const data = await res.json();
        const list = data.missions || data.misi;
        if (Array.isArray(list)) {
          setDailyMissions(list);
        }
      }
    } catch {
      // silent fail
    } finally {
      setIsMissionsLoading(false);
    }
  };

  const fetchPresensiStatusFromDB = async () => {
    try {
      const res = await fetch("/api/siswa/presensi");
      if (res.ok) {
        const data = await res.json();
        if (data.isCheckedIn) {
          setIsCheckedIn(true);
          setCheckInTime(data.checkInTime || null);
          setCapturedSelfie(data.foto_url || null);
        } else {
          setIsCheckedIn(false);
          setCheckInTime(null);
          setCapturedSelfie(null);
        }
      }
    } catch {
      // silent fail
    }
  };

  useEffect(() => {
    fetchPresensiStatusFromDB();
    fetchNotificationsFromDB();
    fetchLeaderboardFromDB();
    fetchMissionsFromDB();
  }, []);

  // Save Settings & Persist Theme/Guidance Level
  const handleSaveSettings = () => {
    try {
      localStorage.setItem("thinksy_theme", isDarkMode ? "dark" : "light");
      localStorage.setItem("thinksy_tutor_guidance", tutorGuidanceLevel);
    } catch {
      // ignore
    }
    setIsSettingsModalOpen(false);
    setToastNotification({
      show: true,
      title: "Pengaturan Disimpan",
      message: "Preferensi mode tampilan & bimbingan Tutor AI berhasil diperbarui.",
      time: "Baru saja",
    });
    setTimeout(() => setToastNotification(null), 5000);
  };

  // Claim Daily Mission
  const handleClaimMission = async (misiId: string) => {
    setIsClaimingMissionId(misiId);
    try {
      const res = await fetch("/api/siswa/misi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ misiId }),
      });
      const data = await res.json();

      if (res.ok && data.success === true) {
        setToastNotification({
          show: true,
          title: "Klaim Misi Berhasil! 🎉",
          message: data.message || `Selamat! +${data.poinDitambahkan || 20} Poin ditambahkan.`,
          time: "Baru saja",
        });
        if (typeof data.poinTotal === "number") {
          setLearningPoints(data.poinTotal);
        } else {
          setLearningPoints((prev) => prev + (data.poinDitambahkan || 20));
        }
        fetchMissionsFromDB();
        setTimeout(() => setToastNotification(null), 5000);
      } else {
        setToastNotification({
          show: true,
          title: "Misi Belum Selesai ⚠️",
          message: data.error || "Kamu belum menyelesaikan target misi ini hari ini. Silakan kerjakan terlebih dahulu!",
          time: "Baru saja",
        });
        setTimeout(() => setToastNotification(null), 6000);
      }
    } catch (err: any) {
      setToastNotification({
        show: true,
        title: "Kesalahan Koneksi ⚠️",
        message: "Gagal terhubung ke server. Coba lagi.",
        time: "Baru saja",
      });
      setTimeout(() => setToastNotification(null), 5000);
    } finally {
      setIsClaimingMissionId(null);
    }
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
    try {
      await fetch("/api/siswa/notifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_as_read" }),
      });
    } catch {
      // ignore error
    }
  };

  const { broadcastEvent } = useRealtimeDashboard((event) => {
    if (event.type === "SOAL_PUBLISHED") {
      setNotifications((prev) => [
        {
          id: Date.now(),
          title: "Soal Latihan Baru Diterbitkan",
          desc: "Guru telah menerbitkan soal eksplorasi baru untuk kelas Anda.",
          time: "Baru saja",
          type: "info",
        },
        ...prev,
      ]);
    } else if (event.type === "ESSAY_GRADED") {
      setNotifications((prev) => [
        {
          id: Date.now(),
          title: "Hasil Penilaian Esai Keluar",
          desc: "Jawaban esai Anda telah dinilai oleh Guru.",
          time: "Baru saja",
          type: "info",
        },
        ...prev,
      ]);
    } else if (event.type === "ATTENDANCE_VERIFIED") {
      fetchNotificationsFromDB();
      setToastNotification({
        show: true,
        title: "Presensi Terverifikasi! 🎉",
        message: "Presensi dan kehadiran Anda telah diverifikasi oleh Guru.",
        time: "Baru saja",
      });
      setTimeout(() => setToastNotification(null), 5000);
      setNotifications((prev) => [
        {
          id: Date.now(),
          title: "Presensi Terverifikasi 🎉",
          desc: "Foto presensi dan kehadiran Anda hari ini telah diverifikasi resmi oleh Guru.",
          time: "Baru saja",
          type: "info",
        },
        ...prev,
      ]);
    } else if (event.type === "NOTIFICATION_RECEIVED") {
      fetchNotificationsFromDB();
      if (event.payload?.judul) {
        setToastNotification({
          show: true,
          title: event.payload.judul,
          message: event.payload.pesan || "Notifikasi baru diterima.",
          time: "Baru saja",
        });
        setTimeout(() => setToastNotification(null), 5000);
      }
    } else if (event.type === "CHAT_POSTED") {
      if (event.payload?.chat) {
        setGlobalChats((prev) => [event.payload.chat, ...prev.filter((c) => c.id !== event.payload.chat.id)]);
      }
    } else if (event.type === "CHAT_LIKED") {
      if (event.payload?.chatId && typeof event.payload?.newLikes === "number") {
        setGlobalChats((prev) =>
          prev.map((c) => (c.id === event.payload.chatId ? { ...c, jumlah_suka: event.payload.newLikes } : c))
        );
      }
    } else if (event.type === "CHAT_COMMENTED") {
      if (event.payload?.chatId && event.payload?.comment) {
        const { chatId, comment, newCommentCount } = event.payload;
        setGlobalChats((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, jumlah_komentar: newCommentCount || c.jumlah_komentar + 1 } : c))
        );
        setChatComments((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []).filter((cm) => cm.id !== comment.id), comment],
        }));
      }
    }
  });

  // Take Camera Selfie Photo & Send to Database
  const handleTakeSelfie = async () => {
    let photoBase64: string | null = null;

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        photoBase64 = canvas.toDataURL("image/jpeg", 0.85);
      }
    }

    stopCamera();
    setIsSubmittingAttendance(true);

    const now = new Date();
    const formattedTime = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      const res = await fetch("/api/siswa/presensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foto_base64: photoBase64 }),
      });
      const data = await res.json();

      if (res.ok) {
        setIsCheckedIn(true);
        setCheckInTime(formattedTime);
        setCapturedSelfie(photoBase64 || "selfie-captured");
        if (typeof data.user?.streak === "number") {
          setDailyStreak(data.user.streak);
        }
        if (typeof data.user?.poin === "number") {
          setLearningPoints(data.user.poin);
        }

        fetchMissionsFromDB();

        setToastNotification({
          show: true,
          title: "Presensi Berhasil!",
          message: `Foto presensi kehadiran Anda telah dicatat pada pukul ${formattedTime} WIB.`,
          time: formattedTime,
        });

        setNotifications((prev) => [
          {
            id: Date.now(),
            title: "Presensi Selfie Berhasil",
            desc: `Foto presensi kehadiran Anda telah dicatat pada pukul ${formattedTime} WIB.`,
            time: "Baru saja",
            type: "urgent",
          },
          ...prev,
        ]);

        setTimeout(() => {
          setToastNotification(null);
        }, 5000);

        broadcastEvent("ATTENDANCE_CHECKIN", {
          studentName,
          time: formattedTime,
        });
      } else {
        alert(data.error || "Gagal mencatat presensi.");
      }
    } catch {
      setIsCheckedIn(true);
      setCheckInTime(formattedTime);
      setCapturedSelfie(photoBase64 || "selfie-captured");

      setToastNotification({
        show: true,
        title: "Presensi Berhasil!",
        message: `Foto presensi kehadiran Anda telah dicatat pada pukul ${formattedTime} WIB.`,
        time: formattedTime,
      });

      setTimeout(() => {
        setToastNotification(null);
      }, 5000);
    } finally {
      setIsSubmittingAttendance(false);
      setIsAttendanceModalOpen(false);
    }
  };

  // Top 3 chapters sorted by highest student progress
  const sortedChapters = [...chapters].sort((a, b) => (b.progress || 0) - (a.progress || 0));
  const top3Chapters = sortedChapters.slice(0, 3);

  // Generate September 2026 Custom Calendar with clear distinctions for today, streak, past, and scheduled days
  const calendarWeeks: CalendarWeekItem[] = [
    {
      weekIndex: 0,
      hasStreakBadge: true,
      streakCount: Math.min(dailyStreak, 3), // Streak achieved in this week: 3
      days: [
        {
          day: 31,
          isCurrentMonth: false,
          isToday: false,
          status: "muted" as const,
          fullDateStr: "Senin, 31 Agustus 2026",
          schedule: { bab: "Bab 1: Bilangan Bulat & Garis Bilangan", jam: "08:00 - 09:30 WIB", room: "Ruang 8A", teacher: "Ibu Siti Rahmawati, M.Pd." },
        },
        {
          day: 1,
          isCurrentMonth: true,
          isToday: false,
          status: "streak" as const,
          fullDateStr: "Selasa, 1 September 2026",
          schedule: { bab: "Pendalaman Mandiri & Latihan Soal", jam: "09:00 - 10:00 WIB", room: "Perpustakaan", teacher: "Tutor AI" },
        },
        {
          day: 2,
          isCurrentMonth: true,
          isToday: false,
          status: "streak" as const,
          fullDateStr: "Rabu, 2 September 2026",
          schedule: { bab: "Bab 1: Operasi Hitung Bilangan Bulat", jam: "10:00 - 11:30 WIB", room: "Ruang 8A", teacher: "Budi Santoso, S.Pd." },
        },
        {
          day: 3,
          isCurrentMonth: true,
          isToday: true,
          status: "today" as const,
          fullDateStr: "Kamis, 3 September 2026 (Hari Ini)",
          schedule: { bab: "Bab 1: Eksplorasi Sokratik AI & Kuis", jam: "08:00 - 09:30 WIB", room: "Lab Komputer", teacher: "thinksy AI Tutor" },
        },
        {
          day: 4,
          isCurrentMonth: true,
          isToday: false,
          status: "scheduled" as const,
          fullDateStr: "Jumat, 4 September 2026",
          schedule: { bab: "Bab 1: FPB, KPK & Faktorisasi Prima", jam: "08:00 - 09:30 WIB", room: "Lab Komputer", teacher: "thinksy AI Tutor" },
        },
        {
          day: 5,
          isCurrentMonth: true,
          isToday: false,
          status: "normal" as const,
          fullDateStr: "Sabtu, 5 September 2026",
          schedule: null,
        },
        {
          day: 6,
          isCurrentMonth: true,
          isToday: false,
          status: "normal" as const,
          fullDateStr: "Minggu, 6 September 2026",
          schedule: null,
        },
      ],
    },
    {
      weekIndex: 1,
      hasStreakBadge: false,
      streakCount: 0,
      days: [
        {
          day: 7,
          isCurrentMonth: true,
          isToday: false,
          status: "scheduled" as const,
          fullDateStr: "Senin, 7 September 2026",
          schedule: { bab: "Bab 2: Bentuk Aljabar & Variabel", jam: "08:00 - 09:30 WIB", room: "Ruang 8A", teacher: "Ibu Siti Rahmawati, M.Pd." },
        },
        {
          day: 8,
          isCurrentMonth: true,
          isToday: false,
          status: "normal" as const,
          fullDateStr: "Selasa, 8 September 2026",
          schedule: null,
        },
        {
          day: 9,
          isCurrentMonth: true,
          isToday: false,
          status: "scheduled" as const,
          fullDateStr: "Rabu, 9 September 2026",
          schedule: { bab: "Bab 2: Operasi Penjumlahan Aljabar", jam: "10:00 - 11:30 WIB", room: "Ruang 8A", teacher: "Budi Santoso, S.Pd." },
        },
        {
          day: 10,
          isCurrentMonth: true,
          isToday: false,
          status: "scheduled" as const,
          fullDateStr: "Kamis, 10 September 2026",
          schedule: { bab: "Bab 2: Latihan Mandiri Aljabar", jam: "08:00 - 09:30 WIB", room: "Lab Komputer", teacher: "thinksy AI" },
        },
        {
          day: 11,
          isCurrentMonth: true,
          isToday: false,
          status: "scheduled" as const,
          fullDateStr: "Jumat, 11 September 2026",
          schedule: { bab: "Bab 2: Perkalian & Pemfaktoran Aljabar", jam: "08:00 - 09:30 WIB", room: "Lab Komputer", teacher: "thinksy AI Tutor" },
        },
        {
          day: 12,
          isCurrentMonth: true,
          isToday: false,
          status: "normal" as const,
          fullDateStr: "Sabtu, 12 September 2026",
          schedule: null,
        },
        {
          day: 13,
          isCurrentMonth: true,
          isToday: false,
          status: "normal" as const,
          fullDateStr: "Minggu, 13 September 2026",
          schedule: null,
        },
      ],
    },
    {
      weekIndex: 2,
      hasStreakBadge: false,
      streakCount: 0,
      days: [
        {
          day: 14,
          isCurrentMonth: true,
          isToday: false,
          status: "scheduled" as const,
          fullDateStr: "Senin, 14 September 2026",
          schedule: { bab: "Bab 3: Persamaan Linear Satu Variabel", jam: "08:00 - 09:30 WIB", room: "Ruang 8A", teacher: "Ibu Siti Rahmawati, M.Pd." },
        },
        {
          day: 15,
          isCurrentMonth: true,
          isToday: false,
          status: "normal" as const,
          fullDateStr: "Selasa, 15 September 2026",
          schedule: null,
        },
        {
          day: 16,
          isCurrentMonth: true,
          isToday: false,
          status: "scheduled" as const,
          fullDateStr: "Rabu, 16 September 2026",
          schedule: { bab: "Bab 3: Pertidaksamaan Linear (PTLSV)", jam: "10:00 - 11:30 WIB", room: "Ruang 8A", teacher: "Budi Santoso, S.Pd." },
        },
        {
          day: 17,
          isCurrentMonth: true,
          isToday: false,
          status: "normal" as const,
          fullDateStr: "Kamis, 17 September 2026",
          schedule: null,
        },
        {
          day: 18,
          isCurrentMonth: true,
          isToday: false,
          status: "scheduled" as const,
          fullDateStr: "Jumat, 18 September 2026",
          schedule: { bab: "Bab 3: Kuis & Studi Kasus Kontekstual", jam: "08:00 - 09:30 WIB", room: "Lab Komputer", teacher: "thinksy AI Tutor" },
        },
        {
          day: 19,
          isCurrentMonth: true,
          isToday: false,
          status: "normal" as const,
          fullDateStr: "Sabtu, 19 September 2026",
          schedule: null,
        },
        {
          day: 20,
          isCurrentMonth: true,
          isToday: false,
          status: "normal" as const,
          fullDateStr: "Minggu, 20 September 2026",
          schedule: null,
        },
      ],
    },
    {
      weekIndex: 3,
      hasStreakBadge: false,
      streakCount: 0,
      days: [
        {
          day: 21,
          isCurrentMonth: true,
          isToday: false,
          status: "scheduled" as const,
          fullDateStr: "Senin, 21 September 2026",
          schedule: { bab: "Bab 4: Perbandingan Senilai & Skala", jam: "08:00 - 09:30 WIB", room: "Ruang 8A", teacher: "Ibu Siti Rahmawati, M.Pd." },
        },
        {
          day: 22,
          isCurrentMonth: true,
          isToday: false,
          status: "normal" as const,
          fullDateStr: "Selasa, 22 September 2026",
          schedule: null,
        },
        {
          day: 23,
          isCurrentMonth: true,
          isToday: false,
          status: "scheduled" as const,
          fullDateStr: "Rabu, 23 September 2026",
          schedule: { bab: "Bab 4: Perbandingan Berbalik Nilai", jam: "10:00 - 11:30 WIB", room: "Ruang 8A", teacher: "Budi Santoso, S.Pd." },
        },
        {
          day: 24,
          isCurrentMonth: true,
          isToday: false,
          status: "normal" as const,
          fullDateStr: "Kamis, 24 September 2026",
          schedule: null,
        },
        {
          day: 25,
          isCurrentMonth: true,
          isToday: false,
          status: "scheduled" as const,
          fullDateStr: "Jumat, 25 September 2026",
          schedule: { bab: "Bab 4: Asesmen Formatif Perbandingan", jam: "08:00 - 09:30 WIB", room: "Lab Komputer", teacher: "thinksy AI Tutor" },
        },
        {
          day: 26,
          isCurrentMonth: true,
          isToday: false,
          status: "normal" as const,
          fullDateStr: "Sabtu, 26 September 2026",
          schedule: null,
        },
        {
          day: 27,
          isCurrentMonth: true,
          isToday: false,
          status: "normal" as const,
          fullDateStr: "Minggu, 27 September 2026",
          schedule: null,
        },
      ],
    },
    {
      weekIndex: 4,
      hasStreakBadge: false,
      streakCount: 0,
      days: [
        {
          day: 28,
          isCurrentMonth: true,
          isToday: false,
          status: "scheduled" as const,
          fullDateStr: "Senin, 28 September 2026",
          schedule: { bab: "Bab 5: Bangun Datar Segitiga & Segiempat", jam: "08:00 - 09:30 WIB", room: "Ruang 8A", teacher: "Ibu Siti Rahmawati, M.Pd." },
        },
        {
          day: 29,
          isCurrentMonth: true,
          isToday: false,
          status: "normal" as const,
          fullDateStr: "Selasa, 29 September 2026",
          schedule: null,
        },
        {
          day: 30,
          isCurrentMonth: true,
          isToday: false,
          status: "scheduled" as const,
          fullDateStr: "Rabu, 30 September 2026",
          schedule: { bab: "Bab 5: Keliling & Luas Bangun Datar", jam: "10:00 - 11:30 WIB", room: "Ruang 8A", teacher: "Budi Santoso, S.Pd." },
        },
        {
          day: 1,
          isCurrentMonth: false,
          isToday: false,
          status: "muted" as const,
          fullDateStr: "Kamis, 1 Oktober 2026",
          schedule: { bab: "Bab 5: Lingkaran & Sudut", jam: "08:00 - 09:30 WIB", room: "Lab Komputer", teacher: "thinksy AI Tutor" },
        },
        {
          day: 2,
          isCurrentMonth: false,
          isToday: false,
          status: "muted" as const,
          fullDateStr: "Jumat, 2 Oktober 2026",
          schedule: null,
        },
        {
          day: 3,
          isCurrentMonth: false,
          isToday: false,
          status: "muted" as const,
          fullDateStr: "Sabtu, 3 Oktober 2026",
          schedule: null,
        },
        {
          day: 4,
          isCurrentMonth: false,
          isToday: false,
          status: "muted" as const,
          fullDateStr: "Minggu, 4 Oktober 2026",
          schedule: null,
        },
      ],
    },
  ];

  return (
    <div
      className={`min-h-screen font-sans pb-20 transition-colors duration-200 ${
        isDarkMode ? "bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-slate-900"
      }`}
    >
      {/* 1. ENTERPRISE SAAS NAVBAR */}
      <header
        className={`sticky top-0 z-40 saas-nav border-b ${
          isDarkMode
            ? "bg-slate-900/90 border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Left: Brand Vector Logo & Nav Tabs */}
          <div className="flex items-center space-x-6 sm:space-x-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 rounded-xl overflow-hidden shadow-xs border border-slate-200 group-hover:scale-105 transition duration-200 bg-white flex items-center justify-center p-0.5">
                <img src="/logo.png" alt="THINKSY Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-xl tracking-tight font-sans text-[#0F172A]">
                THINKSY
              </span>
            </Link>

            {/* Navigation Tabs */}
            <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
              {(
                ["Belajar", "Kursus Saya", "Peringkat", "Pencapaian"] as const
              ).map((tab) => {
                const isDisabled = !sekolahData && tab !== "Belajar";
                return (
                  <button
                    key={tab}
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) {
                        setActiveTab(tab);
                      }
                    }}
                    title={isDisabled ? "Fitur dibatasi - Akun belum terhubung ke sekolah" : undefined}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      isDisabled
                        ? "opacity-40 cursor-not-allowed text-slate-400 bg-slate-100/50"
                        : activeTab === tab
                        ? "bg-[#0F172A] text-white shadow-xs cursor-pointer"
                        : "text-slate-700 hover:text-[#0F172A] hover:bg-slate-100 cursor-pointer"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-2.5">
            {/* Presensi Selfie Button in Navbar */}
            <div className="relative">
              {isCheckedIn ? (
                <div
                  title={`Presensi hari ini telah dicatat pada pukul ${checkInTime || "08.00"} WIB`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="hidden sm:inline">Hadir ({checkInTime || "08.00"})</span>
                  <span className="sm:hidden">Hadir</span>
                </div>
              ) : (
                <button
                  onClick={handleStartCamera}
                  disabled={isSubmittingAttendance}
                  title="Ambil foto presensi selfie kehadiran hari ini"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#0F172A] text-xs font-bold shadow-2xs transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAttendance ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  ) : (
                    <Camera className="w-4 h-4 text-emerald-600" />
                  )}
                  <span className="hidden sm:inline">Presensi</span>
                </button>
              )}
            </div>

            {/* Real-Time Notification Bell Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsDropdownOpen(false);
                }}
                aria-label="Notifikasi"
                className="relative p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#0F172A] hover:bg-slate-50 shadow-2xs transition cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => !n.dibaca) && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-extrabold ring-2 ring-white animate-pulse">
                    {notifications.filter((n) => !n.dibaca).length}
                  </span>
                )}
              </button>

              {/* Notification Drawer Popup */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl saas-modal border border-slate-200 p-4 z-50 shadow-2xl animate-in fade-in duration-150 bg-white">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="font-extrabold text-sm text-[#0F172A]">
                        Log Notifikasi User
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {notifications.some((n) => !n.dibaca) && (
                        <button
                          onClick={handleMarkAllNotificationsAsRead}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                        >
                          Tandai Dibaca
                        </button>
                      )}
                      <button
                        onClick={() => setIsNotificationOpen(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Belum ada notifikasi.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-xl border space-y-1 transition ${
                            notif.dibaca
                              ? "bg-slate-50/70 border-slate-200/60 opacity-80"
                              : "bg-blue-50/50 border-blue-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                              {!notif.dibaca && (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                              )}
                              <span>{notif.title}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold shrink-0">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-snug">
                            {notif.desc}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setIsNotificationOpen(false);
                }}
                className="flex items-center space-x-2 focus:outline-none cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-slate-700 group-hover:scale-105 transition duration-200 overflow-hidden">
                  {capturedSelfie ? (
                    <img
                      src={capturedSelfie}
                      alt="Selfie"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    studentName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                  )}
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl saas-modal border border-slate-200 p-3 z-50 shadow-2xl animate-in fade-in duration-150 bg-white">
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 mb-2">
                    <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                      Nama Akun:
                    </div>
                    <div className="text-sm font-extrabold text-[#0F172A] truncate">
                      {studentName}
                    </div>
                    <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      <span>Siswa</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setIsSettingsModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 hover:text-[#0F172A] rounded-xl transition cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-700" />
                      <span>Pengaturan Akun</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsHelpModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 hover:text-[#0F172A] rounded-xl transition cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-700" />
                      <span>Pusat Bantuan</span>
                    </button>

                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Log Out</span>
                      </button>
                    </form>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full py-2.5 px-4 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>View Profile Card</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* TAB CONTENT RENDERER */}
      {activeTab === "Belajar" && (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 space-y-8">
          {!sekolahData ? (
            <section className="relative rounded-3xl overflow-hidden shadow-xl border border-amber-500/30 text-white bg-slate-900 w-full mb-8">
              <div className="absolute inset-0 bg-linear-to-r from-amber-950/40 via-slate-900 to-slate-950 opacity-90" />
              <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 max-w-3xl">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                    <TriangleAlert className="w-7 h-7 text-amber-400" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Profil Sekolah Belum Ditemukan
                    </h1>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                      Halo, <strong className="text-white">{studentName}</strong>! Akun siswa Anda saat ini belum dihubungkan dengan database sekolah manapun di platform Thinksy.
                    </p>

                    <div className="mt-3 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs font-semibold leading-relaxed flex items-start gap-2.5 shadow-xs">
                      <HelpCircle className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        Jika akun Anda belum terdaftar di database sekolah, akses fitur pembelajaran akan dibatasi. Silakan laporkan kepada <strong>Wali Kelas</strong> atau <strong>Admin Sekolah</strong> Anda untuk penautan akun.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
                  <button
                    onClick={() => window.location.reload()}
                    className="py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition duration-200 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-950" />
                    <span>Muat Ulang Halaman</span>
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <section className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-800 text-white bg-slate-900">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform hover:scale-105"
                style={{
                  backgroundImage: `url('${sekolahData.bg_image_url || "/images/smk-muh1-playen.jpg"}')`,
                }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/85 to-slate-900/60 backdrop-blur-[1px]" />

              <div className="relative z-10 p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-extrabold uppercase tracking-wider shadow-xs backdrop-blur-md">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>Kurikulum Merdeka • Sekolah Pusat Keunggulan</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                  {sekolahData.nama}
                </h1>

                {sekolahData.motto && (
                  <p className="text-amber-400 font-extrabold text-sm sm:text-base tracking-wide drop-shadow-sm max-w-2xl">
                    ✨ {sekolahData.motto}
                  </p>
                )}

                {sekolahData.deskripsi && (
                  <p className="text-slate-200 text-xs sm:text-sm max-w-3xl leading-relaxed font-medium mt-1">
                    {sekolahData.deskripsi}
                  </p>
                )}

                {sekolahData.links && sekolahData.links.length > 0 && (
                  <div className="flex flex-wrap justify-center items-center gap-3 pt-3">
                    {sekolahData.links.slice(0, 3).map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/20 hover:border-white/40 transition duration-200 shadow-sm cursor-pointer hover:scale-105"
                      >
                        <Globe className="w-3.5 h-3.5 text-amber-400" />
                        <span>{link.label}</span>
                        <ExternalLink className="w-3 h-3 text-slate-300 ml-0.5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* TOP 2-CARD LAYOUT: STUDENT LEARNING HUB */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CARD KIRI: Student Overview, Quick Action & Linear Metrics */}
            <div className="lg:col-span-2 saas-card p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden bg-white flex flex-col justify-between space-y-5">
              <div className="space-y-1.5">
                {/* Greeting Title & Simpler Rank */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                    Selamat Datang Kembali, {studentName.split(" ")[0]}!
                  </h2>
                  <span className="text-xs font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 tracking-wide">
                    #{currentUserRank}
                  </span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium max-w-xl">
                  Selesaikan tugas harianmu dan tingkatkan pemahamanmu bersama Tutor AI Thinksy.
                </p>
              </div>

              {/* Quick Resume Card / Target Pembelajaran Terakhir */}
              {top3Chapters && top3Chapters.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/40 border border-blue-100/80 shadow-2xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
                        Lanjutkan Pembelajaran Terakhir
                      </div>
                      <div className="text-sm font-black text-[#0F172A] line-clamp-1">
                        {top3Chapters[0].judul}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/bab/${top3Chapters[0].id}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition shadow-xs cursor-pointer hover:scale-105 shrink-0"
                  >
                    <span>Lanjut Belajar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Linear Metrics Row: Progress Ring, Poin, Streak */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                {/* 1. Ring Progress */}
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-blue-600 transition-all duration-500"
                        strokeDasharray={`${learningProgressPercent}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-black text-[#0F172A]">
                      {learningProgressPercent}%
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      PROGRES
                    </div>
                    <div className="text-sm font-black text-slate-800">
                      {learningProgressPercent}% Selesai
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block h-8 w-px bg-slate-200" />

                {/* 2. Poin Belajar */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
                    <Trophy className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      POIN BELAJAR
                    </div>
                    <div className="text-sm font-black text-slate-900">
                      {learningPoints.toLocaleString("id-ID")} <span className="text-xs font-semibold text-slate-500">Poin</span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block h-8 w-px bg-slate-200" />

                {/* 3. Daily Streak */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-600 flex items-center justify-center font-bold">
                    <Flame className="w-5 h-5 text-orange-500 fill-orange-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      DAILY STREAK
                    </div>
                    <div className="text-sm font-black text-slate-900">
                      {dailyStreak} <span className="text-xs font-semibold text-slate-500">Hari</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD KANAN: Custom Calendar View (Clean, Light Theme) */}
            <div className="lg:col-span-1 p-5 sm:p-6 rounded-3xl bg-white text-slate-900 shadow-xs border border-slate-200 flex flex-col justify-between space-y-4 relative">
              {/* Header: Month Year */}
              <div className="pb-1">
                <h3 className="text-xl font-black text-[#0F172A] tracking-tight">
                  September 2026
                </h3>
              </div>

              {/* Days of Week Header Row */}
              <div className="grid grid-cols-8 gap-1 text-center text-xs font-bold text-slate-400">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
                <span></span>
              </div>

              {/* Calendar Date Grid (5 Weeks) */}
              <div className="space-y-2">
                {calendarWeeks.map((week, wIdx) => (
                  <div key={wIdx} className="grid grid-cols-8 gap-1 items-center">
                    {week.days.map((dayObj, dIdx) => (
                      <div key={dIdx} className="relative group/day flex items-center justify-center">
                        {/* 1. Hari Ini (Today) */}
                        {dayObj.status === "today" ? (
                          <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border-2 border-blue-600 bg-blue-50/60 text-blue-700 font-black flex items-center justify-center text-xs shadow-xs cursor-pointer ring-2 ring-blue-500/20 hover:scale-105 transition duration-150">
                            {dayObj.day}
                          </div>
                        ) : /* 2. Hari Terdeteksi Streak */
                        dayObj.status === "streak" ? (
                          <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-orange-50 border border-orange-300 text-orange-700 font-black flex items-center justify-center text-xs shadow-2xs cursor-pointer hover:scale-105 hover:bg-orange-100 transition duration-150">
                            {dayObj.day}
                          </div>
                        ) : /* 3. Hari yang Ada Jadwal Bab (Background Abu-abu & Hoverable) */
                        dayObj.status === "scheduled" ? (
                          <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-slate-100 border border-slate-200 text-slate-900 font-bold flex items-center justify-center text-xs shadow-2xs cursor-pointer hover:bg-slate-200 hover:border-slate-400 hover:scale-105 transition duration-150">
                            {dayObj.day}
                          </div>
                        ) : /* 4. Hari yang Sudah Dilewati (Past) */
                        dayObj.status === "past" ? (
                          <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border border-slate-100 text-slate-400 font-medium flex items-center justify-center text-xs cursor-pointer hover:bg-slate-50 transition duration-150">
                            {dayObj.day}
                          </div>
                        ) : /* 5. Hari Luar Bulan (Muted) */
                        !dayObj.isCurrentMonth ? (
                          <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center text-xs font-semibold text-slate-300 cursor-pointer hover:text-slate-400 transition duration-150">
                            {dayObj.day}
                          </div>
                        ) : /* 6. Hari Normal Tanpa Jadwal */ (
                          <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border border-slate-200 text-slate-600 font-medium flex items-center justify-center text-xs cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition duration-150">
                            {dayObj.day}
                          </div>
                        )}

                        {/* Hover Tooltip - Clean Light Theme */}
                        {(dayObj.schedule || dayObj.status === "streak" || dayObj.status === "today" || dayObj.status === "past") && (
                          <div
                            className={`absolute ${
                              wIdx <= 1 ? "top-full mt-2" : "bottom-full mb-2"
                            } ${
                              dIdx <= 1 ? "left-0" : dIdx >= 5 ? "right-0" : "left-1/2 -translate-x-1/2"
                            } w-56 p-3 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 pointer-events-none opacity-0 group-hover/day:opacity-100 transition-all duration-200 z-50 text-left`}
                          >
                            {/* Header: Date + State Status */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
                              <span className="text-[11px] font-bold text-slate-500">
                                {dayObj.fullDateStr}
                              </span>
                              {dayObj.status === "today" ? (
                                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                  Hari Ini
                                </span>
                              ) : dayObj.status === "streak" ? (
                                <span className="text-[10px] font-extrabold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                  <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                                  Streak
                                </span>
                              ) : dayObj.schedule ? (
                                <span className="text-[10px] font-bold text-slate-500">
                                  Terjadwal
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400">
                                  Selesai
                                </span>
                              )}
                            </div>

                            {/* Body: Chapter Name or Activity Info */}
                            {dayObj.schedule ? (
                              <div className="space-y-1">
                                <div className="text-xs font-black text-[#0F172A] leading-snug">
                                  {dayObj.schedule.bab}
                                </div>
                                <div className="text-[11px] text-blue-600 font-bold flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <span>{dayObj.schedule.jam}</span>
                                </div>
                                {dayObj.schedule.room && (
                                  <div className="text-[10px] text-slate-500 font-medium">
                                    📍 {dayObj.schedule.room} {dayObj.schedule.teacher ? `• ${dayObj.schedule.teacher}` : ""}
                                  </div>
                                )}
                              </div>
                            ) : dayObj.status === "streak" ? (
                              <div className="space-y-0.5">
                                <div className="text-xs font-black text-orange-700">
                                  Streak Belajar Aktif 🔥
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium">
                                  Presensi & aktivitas harian terselesaikan dengan baik.
                                </div>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-500">
                                Tidak ada jadwal kelas pada tanggal ini.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Right Streak Column: Flame badge sesuai streak mingguan siswa */}
                    <div className="flex items-center justify-center">
                      {week.hasStreakBadge && week.streakCount > 0 ? (
                        <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-gradient-to-tr from-orange-600 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 font-black text-xs">
                          <Flame className="w-4 h-4 fill-white" />
                          <span className="ml-0.5">{week.streakCount}</span>
                        </div>
                      ) : (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-slate-200" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* DAILY MISSIONS WIDGET */}
          <div className="relative">
            {!sekolahData && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-[2.5px] rounded-3xl p-4 text-center">
                <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-amber-400 border border-slate-700 flex items-center justify-center shadow-lg mb-1.5">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider bg-slate-950/80 px-3.5 py-1 rounded-full border border-slate-700 shadow-sm">
                  Fitur Dikunci
                </span>
                <p className="text-[11px] text-slate-200 font-semibold mt-1">
                  Misi Harian tidak bisa diakses — Akun belum terhubung ke sekolah
                </p>
              </div>
            )}
            <section className={`saas-card rounded-3xl p-6 border border-slate-200/90 shadow-sm bg-white space-y-5 ${!sekolahData ? "filter blur-[2.5px] select-none pointer-events-none opacity-60" : ""}`}>
              {/* Header Misi Harian (Clean) */}
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Misi Harian Siswa
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Selesaikan tantangan belajar harian untuk mengklaim bonus Poin & tingkatkan peringkatmu!
                </p>
              </div>

              {/* Grid Kartu Misi Harian */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {isMissionsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-3xl border bg-slate-50/80 border-slate-100 space-y-4 animate-pulse"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                        <div className="h-5 bg-amber-100 rounded-xl w-16" />
                      </div>
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-9 bg-slate-200 rounded-2xl w-full" />
                    </div>
                  ))
                ) : dailyMissions.length === 0 ? (
                  <div className="col-span-3 text-center py-8 bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold flex flex-col items-center justify-center gap-2">
                    <Target className="w-8 h-8 text-slate-300" />
                    <span>Misi harian tidak tersedia. Pastikan akun Anda terhubung ke sekolah.</span>
                  </div>
                ) : (
                  dailyMissions.map((misi) => {
                    const isCompleted = Number(misi.progres_saat_ini) >= Number(misi.target_max);
                    const isClaimed = Boolean(misi.diklaim);

                    return (
                      <div
                        key={misi.id}
                        className={`group relative rounded-3xl border p-5 transition-all duration-300 flex flex-col justify-between space-y-4 overflow-hidden ${
                          isClaimed
                            ? "bg-emerald-50/40 border-emerald-200/90 shadow-xs"
                            : isCompleted
                            ? "bg-amber-50/50 border-amber-300 shadow-md shadow-amber-500/10 ring-1 ring-amber-300"
                            : "bg-white hover:bg-slate-50/60 border-slate-200 hover:border-slate-300 shadow-xs"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-amber-950 transition-colors leading-snug">
                              {misi.judul}
                            </h3>
                            <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                              +{misi.poin_hadiah || 20} Poin
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            {misi.deskripsi || "Selesaikan target misi ini hari ini."}
                          </p>
                        </div>

                        {/* Tombol Aksi Misi - Hanya Klaim */}
                        <div className="pt-2">
                          {isClaimed ? (
                            <button
                              disabled
                              className="w-full py-2.5 rounded-2xl bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center gap-1.5 cursor-not-allowed border border-emerald-200"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Sudah Diklaim ✓</span>
                            </button>
                          ) : isCompleted ? (
                            <button
                              onClick={() => handleClaimMission(misi.id)}
                              disabled={isClaimingMissionId === misi.id}
                              className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              {isClaimingMissionId === misi.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4 fill-white" />
                              )}
                              <span>Klaim +{misi.poin_hadiah || 20} Poin</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleClaimMission(misi.id)}
                              disabled={isClaimingMissionId === misi.id}
                              className={`w-full py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                                isCompleted
                                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 active:scale-[0.98]"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {isClaimingMissionId === misi.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : null}
                              <span>Klaim</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* ACTIVE CLASSES GRID (TOP 3 HIGHEST PROGRESS WITH USER BADGES) */}
          <div className="relative">
            {!sekolahData && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-[2.5px] rounded-3xl p-4 text-center">
                <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-amber-400 border border-slate-700 flex items-center justify-center shadow-lg mb-1.5">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-wider bg-slate-950/80 px-3.5 py-1 rounded-full border border-slate-700 shadow-sm">
                  Fitur Dikunci
                </span>
                <p className="text-[11px] text-slate-200 font-semibold mt-1">
                  Kelas Aktif & Modul Materi tidak bisa diakses — Akun belum terhubung ke sekolah
                </p>
              </div>
            )}
            <section className={`space-y-4 ${!sekolahData ? "filter blur-[2.5px] select-none pointer-events-none opacity-60" : ""}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>Kelas Aktif Saya</span>
                </h2>
                <button
                  onClick={() => setActiveTab("Kursus Saya")}
                  className="px-4 py-2 rounded-xl bg-[#0F172A] text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {top3Chapters.map((cls, idx) => (
                  <Link
                    key={cls.id}
                    href={`/bab/${cls.id}`}
                    className="saas-card saas-card-hover rounded-3xl p-6 border border-slate-200 flex flex-col justify-between space-y-5 shadow-xs group bg-white"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                          Bab {cls.urutan || idx + 1}
                        </span>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Matematika • Kelas 8 (Fase D)
                        </div>
                        <h3 className="text-lg font-extrabold text-[#0F172A] group-hover:text-blue-600 transition">
                          {cls.judul}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {cls.deskripsi || "Capaian Pembelajaran Kurikulum Merdeka Matematika SMP Kelas 8."}
                        </p>
                      </div>
                    </div>

                    {/* User Avatar Badges (Enrolled Peer Students in Class) */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center -space-x-2 overflow-hidden py-1">
                        {peerStudents.slice(0, 4).map((peer) => (
                          <div
                            key={peer.id}
                            title={peer.name}
                            className="relative group/avatar inline-block"
                          >
                            <div className="w-8 h-8 rounded-full ring-2 ring-white bg-[#0F172A] text-white flex items-center justify-center text-[10px] font-extrabold shadow-xs overflow-hidden transition-transform duration-200 group-hover/avatar:scale-115 group-hover/avatar:z-20 cursor-pointer">
                              {peer.avatarUrl ? (
                                <img src={peer.avatarUrl} alt={peer.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{peer.initials}</span>
                              )}
                            </div>
                          </div>
                        ))}
                        {peerStudents.length > 4 && (
                          <div
                            title={`${peerStudents.length - 4} siswa lainnya`}
                            className="w-8 h-8 rounded-full ring-2 ring-white bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-black shadow-xs cursor-pointer hover:bg-slate-200"
                          >
                            +{peerStudents.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <span>Mulai</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </main>
      )}

      {/* 2. TAB: PERINGKAT */}
      {activeTab === "Peringkat" && (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 space-y-8 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
                <Trophy className="w-7 h-7 text-amber-500" />
                <span>Peringkat Siswa Per Sekolah</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
                Peringkat diperbarui secara real-time berdasarkan total Poin Belajar siswa di lingkungan sekolah yang sama.
              </p>
            </div>

            <button
              onClick={fetchLeaderboardFromDB}
              className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-[#0F172A] text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLeaderboard ? "animate-spin text-amber-500" : ""}`} />
              <span>Refresh Peringkat</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Daftar Siswa Berprestasi (Khusus Akun Siswa)</span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {leaderboardList.length} Siswa Terdaftar
              </span>
            </div>

            {isLoadingLeaderboard ? (
              <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                <span>Memuat data peringkat siswa...</span>
              </div>
            ) : leaderboardList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Belum ada data siswa di papan peringkat.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Peringkat</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">Sekolah</th>
                      <th className="py-3 px-4 text-center">Daily Streak</th>
                      <th className="py-3 px-4 text-right">Total Poin Belajar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {leaderboardList.map((st) => (
                      <tr
                        key={st.id}
                        className={`transition hover:bg-slate-50/80 ${
                          st.isCurrentUser ? "bg-amber-50/80 font-bold border-l-4 border-l-amber-500" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          {st.rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-extrabold text-xs shadow-xs">
                              👑 1
                            </span>
                          ) : st.rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-extrabold text-xs">
                              🥈 2
                            </span>
                          ) : st.rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-900 font-extrabold text-xs">
                              🥉 3
                            </span>
                          ) : (
                            <span className="text-slate-500 font-bold pl-2">
                              #{st.rank}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                          <div className="flex items-center gap-2">
                            <span>{st.name}</span>
                            {st.isCurrentUser && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">
                                Akun Anda
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {st.school}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 font-extrabold text-[10px]">
                            <Flame className="w-3 h-3 text-orange-500" />
                            <span>{st.streak} Hari</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-[#0F172A]">
                          <span className="text-amber-600">{st.points.toLocaleString("id-ID")}</span> Poin
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      )}

      {/* 3. TAB: KURSUS SAYA */}
      {activeTab === "Kursus Saya" && (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-blue-600" />
              <span>Kursus & Bab Pembelajaran</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
              Pilih bab pembelajaran untuk mulai mempelajari materi dan mengerjakan kuis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {chapters.map((cls, idx) => (
              <Link
                key={cls.id}
                href={`/bab/${cls.id}`}
                className="saas-card saas-card-hover rounded-3xl p-6 border border-slate-200 flex flex-col justify-between space-y-5 shadow-xs group bg-white"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                      Bab {cls.urutan || idx + 1}
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Matematika • Kelas 8 (Fase D)
                    </div>
                    <h3 className="text-xl font-extrabold text-[#0F172A] group-hover:text-blue-600 transition">
                      {cls.judul}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {cls.deskripsi || "Capaian Pembelajaran Kurikulum Merdeka Matematika SMP Kelas 8."}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center -space-x-2 overflow-hidden py-1">
                    {peerStudents.slice(0, 4).map((peer) => (
                      <div
                        key={peer.id}
                        title={peer.name}
                        className="relative group/avatar inline-block"
                      >
                        <div className="w-8 h-8 rounded-full ring-2 ring-white bg-[#0F172A] text-white flex items-center justify-center text-[10px] font-extrabold shadow-xs overflow-hidden transition-transform duration-200 group-hover/avatar:scale-115 group-hover/avatar:z-20 cursor-pointer">
                          {peer.avatarUrl ? (
                            <img src={peer.avatarUrl} alt={peer.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{peer.initials}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                    <span>Pelajari Bab</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      )}

      {/* 4. TAB: PENCAPAIAN */}
      {activeTab === "Pencapaian" && (() => {
        const studentBadges = [
          {
            id: "b1",
            title: "Langkah Pertama",
            desc: "Menyelesaikan 1 kuis atau latihan pertama.",
            icon: "🚀",
            bgColor: "bg-blue-100 text-blue-700 border-blue-200",
            isUnlocked: completedQuizCount >= 1,
            progressText: `${completedQuizCount}/1 Kuis`,
            progressPercent: Math.min(100, Math.round((completedQuizCount / 1) * 100)),
          },
          {
            id: "b2",
            title: "Master Kuis",
            desc: "Menyelesaikan minimal 5 kuis/latihan.",
            icon: "🏆",
            bgColor: "bg-amber-100 text-amber-700 border-amber-200",
            isUnlocked: completedQuizCount >= 5,
            progressText: `${completedQuizCount}/5 Kuis`,
            progressPercent: Math.min(100, Math.round((completedQuizCount / 5) * 100)),
          },
          {
            id: "b3",
            title: "Pejuang Streak",
            desc: "Kehadiran harian berturut-turut 7 hari.",
            icon: "🔥",
            bgColor: "bg-orange-100 text-orange-700 border-orange-200",
            isUnlocked: dailyStreak >= 7,
            progressText: `${dailyStreak}/7 Hari`,
            progressPercent: Math.min(100, Math.round((dailyStreak / 7) * 100)),
          },
          {
            id: "b4",
            title: "Pembelajar Hebat",
            desc: "Mengumpulkan minimal 1.000 Poin Belajar.",
            icon: "⭐",
            bgColor: "bg-purple-100 text-purple-700 border-purple-200",
            isUnlocked: learningPoints >= 1000,
            progressText: `${learningPoints.toLocaleString("id-ID")}/1.000 Poin`,
            progressPercent: Math.min(100, Math.round((learningPoints / 1000) * 100)),
          },
          {
            id: "b5",
            title: "Penjelajah Soal",
            desc: "Menjawab minimal 10 soal matematika.",
            icon: "🎯",
            bgColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
            isUnlocked: answeredSoalCount >= 10,
            progressText: `${answeredSoalCount}/10 Soal`,
            progressPercent: Math.min(100, Math.round((answeredSoalCount / 10) * 100)),
          },
          {
            id: "b6",
            title: "Bintang Matematika",
            desc: "Mengumpulkan 1.500+ Poin & 10 Kuis.",
            icon: "👑",
            bgColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
            isUnlocked: learningPoints >= 1500 && completedQuizCount >= 10,
            progressText: `${completedQuizCount}/10 Kuis`,
            progressPercent: Math.min(100, Math.round((completedQuizCount / 10) * 100)),
          },
        ];

        const unlockedCount = studentBadges.filter((b) => b.isUnlocked).length;

        return (
          <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
                  <Gift className="w-7 h-7 text-purple-600" />
                  <span>Pencapaian & Lencana Siswa</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
                  Lencana penghargaan atas konsistensi belajar dan penyelesaian kuis Anda.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold shrink-0">
                <span>{unlockedCount} dari {studentBadges.length} Lencana Terbuka</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {studentBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`saas-card rounded-3xl p-6 border flex flex-col justify-between space-y-4 transition ${
                    badge.isUnlocked
                      ? "bg-white border-slate-200 shadow-xs"
                      : "bg-slate-50/70 border-slate-200/70 opacity-75"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-2xl shrink-0 border ${
                        badge.isUnlocked
                          ? badge.bgColor
                          : "bg-slate-200 text-slate-400 border-slate-300"
                      }`}
                    >
                      {badge.icon}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-extrabold text-[#0F172A]">
                          {badge.title}
                        </h3>
                        {badge.isUnlocked ? (
                          <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            Terbuka ✓
                          </span>
                        ) : (
                          <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold border border-slate-300">
                            Terkunci 🔒
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {badge.desc}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-400">Progres Lencana</span>
                      <span className={badge.isUnlocked ? "text-emerald-700 font-extrabold" : "text-slate-600"}>
                        {badge.progressText}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          badge.isUnlocked ? "bg-emerald-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${badge.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        );
      })()}

      {/* MODAL: LIVE WEBCAM SELFIE ATTENDANCE */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="saas-modal rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full relative space-y-4 bg-white">
            <button
              onClick={() => {
                stopCamera();
                setIsAttendanceModalOpen(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center">
                <Camera className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  Foto Presensi Selfie
                </h3>
                <p className="text-xs text-slate-500">
                  Ambil foto selfie kehadiran Anda secara resmi hari ini
                </p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4">
                  <div className="px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/20 bg-slate-900/80 text-white text-[11px] font-extrabold flex items-center gap-2 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{faceDetectorStatus}</span>
                  </div>

                  <div className="w-44 h-56 rounded-3xl border-2 border-dashed border-white/60 relative flex flex-col items-center justify-center gap-2">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white rounded-br-xl" />
                  </div>

                  <div className="text-[10px] text-slate-300 bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-xs font-semibold text-center">
                    Foto presensi akan disimpan secara resmi untuk verifikasi kehadiran.
                  </div>
                </div>
              )}

              {!isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white space-y-3 bg-slate-900/90">
                  <Camera className="w-10 h-10 text-emerald-400 animate-bounce" />
                  <p className="text-xs text-slate-300 font-medium">
                    Klik tombol di bawah untuk mengaktifkan kamera webcam
                  </p>
                  <button
                    onClick={handleStartCamera}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
                  >
                    Aktifkan Kamera
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setIsAttendanceModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={!isCameraActive || isSubmittingAttendance}
                onClick={handleTakeSelfie}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-40 cursor-pointer shadow-md"
              >
                {isSubmittingAttendance ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
                <span>
                  {isSubmittingAttendance
                    ? "Menyimpan Presensi..."
                    : "Ambil Foto Presensi"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP-RIGHT REACT TOAST NOTIFICATION */}
      {toastNotification?.show && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-[#0F172A] text-white rounded-2xl p-4 border border-emerald-500/50 shadow-2xl animate-in slide-in-from-top-5 duration-300 flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-white">
                {toastNotification.title}
              </h4>
              <span className="text-[10px] text-emerald-400 font-semibold">
                {toastNotification.time}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              {toastNotification.message}
            </p>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MODAL: VIEW PROFILE CARD */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="saas-modal rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full relative space-y-6 bg-white">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="w-20 h-20 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-2xl font-extrabold shadow-md border-4 border-white overflow-hidden">
                {capturedSelfie ? (
                  <img
                    src={capturedSelfie}
                    alt="Selfie"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  studentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                )}
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-[#0F172A]">
                  {studentName}
                </h3>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {studentEmail}
                </div>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Siswa • Terverifikasi</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                  Total Poin
                </div>
                <div className="text-lg font-extrabold text-[#0F172A] mt-0.5">
                  {learningPoints.toLocaleString("id-ID")} Poin
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-center">
                <div className="text-[10px] text-orange-700 font-bold uppercase tracking-wider">
                  Daily Streak
                </div>
                <div className="text-lg font-extrabold text-[#0F172A] mt-0.5">
                  {dailyStreak} Hari
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full py-3 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Tutup Profil
            </button>
          </div>
        </div>
      )}

      {/* MODAL: PENGATURAN & DARK MODE TOGGLE */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="saas-modal rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full relative space-y-5 bg-white">
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center">
                <Settings className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  Pengaturan Akun & Tampilan
                </h3>
                <p className="text-xs text-slate-500">
                  Preferensi Mode & Bimbingan AI
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Mode Gelap / Terang (Theme Toggle)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isDarkMode ? "Mode Gelap Aktif" : "Mode Terang Aktif"}
                  </div>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-xl bg-[#0F172A] text-amber-400 hover:bg-slate-800 transition cursor-pointer"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Tingkat Bimbingan Tutor AI
                </label>
                <select
                  value={tutorGuidanceLevel}
                  onChange={(e) => setTutorGuidanceLevel(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="sedang">
                    Sedang (Bimbingan Sokratik Bertahap)
                  </option>
                  <option value="tinggi">
                    Detail (Bimbingan Lengkap dengan Contoh)
                  </option>
                  <option value="ringkas">Ringkas (Petunjuk Singkat)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>
      )}

      {/* MODAL: PUSAT BANTUAN */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="saas-modal rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-lg w-full relative space-y-5 max-h-[85vh] overflow-y-auto bg-white">
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  Pusat Bantuan & Layanan Belajar
                </h3>
                <p className="text-xs text-slate-500">
                  Panduan Penggunaan Aplikasi & Dukungan Sekolah
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
                <h4 className="font-extrabold text-indigo-900 text-sm flex items-center gap-2">
                  <span>🤖 Cara Kerja Tutor AI Sokratik</span>
                </h4>
                <p className="text-indigo-800 leading-relaxed font-medium">
                  Tutor AI THINKSY memandu Anda dengan pertanyaan bertahap (*metode Sokratik*). AI tidak memberikan jawaban akhir secara instan agar pemahaman konsep matematika Anda terbentuk secara mandiri.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-[#0F172A] text-xs uppercase tracking-wider">
                  Pertanyaan Sering Diajukan (FAQ)
                </h4>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">1. Bagaimana cara menambah Poin Belajar?</div>
                  <div className="text-slate-600 leading-relaxed">
                    Poin didapatkan setiap kali Anda mengklaim misi harian, presensi selfie harian, dan menyelesaikan kuis/latihan dengan benar.
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">2. Mengapa kuis bertimer otomatis terkumpul?</div>
                  <div className="text-slate-600 leading-relaxed">
                    Sesi Kuis & Asesmen memiliki batas waktu 15 menit. Saat waktu habis (00:00), sistem secara otomatis mengumpulkan seluruh jawaban Anda ke server.
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">3. Presensi Selfie Harian & Daily Streak</div>
                  <div className="text-slate-600 leading-relaxed">
                    Ambil foto selfie presensi setiap hari sekolah. Jika hadir kemarin, streak bertambah 1. Jika terlewat, streak kembali mulai dari 1.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center space-y-1">
                <div className="font-extrabold text-slate-900">Butuh Bantuan Kendala Teknis?</div>
                <div className="text-slate-500 text-[11px]">
                  Hubungi Admin Sekolah atau Wali Kelas Anda untuk masalah akun.
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Tutup Pusat Bantuan
            </button>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON (FAB) (+) */}
      <div className="fixed bottom-6 right-6 z-50">
        {isFabOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col items-end gap-3 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <button
              onClick={() => {
                setIsMyNotesOpen(true);
                setIsFabOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-extrabold shadow-xl border border-slate-200 group transition transform hover:scale-105 cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-700">My Notes 📝</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                <FileText className="w-4.5 h-4.5" />
              </div>
            </button>

            <button
              onClick={() => {
                setIsAiAssistantOpen(true);
                setIsFabOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-extrabold shadow-xl border border-slate-200 group transition transform hover:scale-105 cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-700">AI Assistant 🤖</span>
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <BrainCircuit className="w-4.5 h-4.5" />
              </div>
            </button>

            <button
              onClick={() => {
                setIsGlobalChatOpen(true);
                setIsFabOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-extrabold shadow-xl border border-slate-200 group transition transform hover:scale-105 cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-700">Global Chat 💬</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Globe className="w-4.5 h-4.5" />
              </div>
            </button>
          </div>
        )}

        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          aria-label="Action Menu"
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white font-extrabold text-2xl transition duration-300 cursor-pointer transform hover:scale-105 ${
            isFabOpen
              ? "bg-slate-900 rotate-45 border-2 border-slate-700"
              : "bg-linear-to-br from-[#0F172A] via-[#1E293B] to-amber-500 border-2 border-amber-400/50 shadow-amber-500/20"
          }`}
        >
          +
        </button>
      </div>

      {/* MODAL 1: MY NOTES */}
      {isMyNotesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 max-w-2xl w-full relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsMyNotesOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 border border-amber-200 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  MY NOTES — Catatan Pribadi Siswa
                </h3>
                <p className="text-xs text-slate-500">
                  Private & Terisolasi — Hanya Anda yang dapat melihat catatan ini.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-500" />
                <span>+ Buat Catatan Baru</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Judul Catatan..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="sm:col-span-2 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <select
                  value={noteSubject}
                  onChange={(e) => setNoteSubject(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Matematika">Matematika</option>
                  <option value="IPA Biologi">IPA Biologi</option>
                  <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  <option value="Informatika">Informatika</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>
              <textarea
                placeholder="Tuliskan isi catatan atau rangkuman materi..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <button
                onClick={handleCreateNote}
                className="w-full py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer shadow-sm"
              >
                Simpan Catatan
              </button>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari catatan berdasarkan judul atau isi..."
                  value={notesSearch}
                  onChange={(e) => setNotesSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none"
                />
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {notes
                  .filter(
                    (n) =>
                      n.judul.toLowerCase().includes(notesSearch.toLowerCase()) ||
                      n.konten.toLowerCase().includes(notesSearch.toLowerCase())
                  )
                  .map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start justify-between gap-4 hover:border-slate-300 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            {note.mata_pelajaran}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {note.dibuat_pada}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#0F172A]">{note.judul}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{note.konten}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-slate-400 hover:text-red-600 transition p-1 cursor-pointer"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AI ASSISTANT FULL SCREEN */}
      {isAiAssistantOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white shrink-0 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <BrainCircuit className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                  <span>Thinksy AI Assistant</span>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Full Screen Workspace
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Pencarian Informasi & Pendampingan Tugas Sekolah 24/7
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAiAssistantOpen(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition duration-150 cursor-pointer border border-slate-200 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
              <span>Back</span>
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <GeneralAiChat studentName={studentName} />
          </div>
        </div>
      )}

      {/* MODAL 3: GLOBAL SCHOOL CHAT */}
      {isGlobalChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 max-w-2xl w-full relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsGlobalChatOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  GLOBAL SCHOOL CHAT
                </h3>
                <p className="text-xs text-slate-500">
                  Komunitas internal sekolah — Temukan teman belajar & kelompok akademis.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="🔍 Cari siswa, kelas, minat, atau komunitas..."
                  value={chatSearchQuery}
                  onChange={(e) => handleSearchStudents(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none"
                />
              </div>

              {chatSearchQuery.trim() && (
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
                  <div className="text-xs font-bold text-blue-900">Hasil Pencarian internal Sekolah:</div>
                  {chatSearchResults.students.length === 0 && chatSearchResults.communities.length === 0 ? (
                    <p className="text-xs text-slate-500">Tidak ditemukan siswa atau komunitas cocok.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {chatSearchResults.students.map((s) => (
                        <div key={s.id} className="p-2.5 bg-white rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-[#0F172A]">{s.name}</span>
                            <span className="text-slate-500 ml-2">({s.class}) — Minat: {s.interest}</span>
                          </div>
                          <button className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px]">
                            Hubungi
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Bagikan pertanyaan atau ajakan belajar bersama..."
                value={newChatContent}
                onChange={(e) => setNewChatContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSendChat}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {globalChats.map((chat) => (
                <div key={chat.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold">
                        {chat.nama_penulis.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0F172A]">
                          {chat.nama_penulis} <span className="text-slate-400 font-normal">({chat.kelas_penulis})</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{chat.dibuat_pada}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setReportingChatId(chat.id)}
                      className="text-slate-400 hover:text-red-500 text-[10px] flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Flag className="w-3 h-3" /> Laporkan
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{chat.konten}</p>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1 border-t border-slate-200/50">
                    <button
                      onClick={() => handleLikeChat(chat.id)}
                      className="flex items-center gap-1.5 hover:text-red-500 transition cursor-pointer text-slate-600 font-bold"
                    >
                      <span className="text-red-500">❤️</span>
                      <span>{chat.jumlah_suka} Suka</span>
                    </button>

                    <button
                      onClick={() => handleToggleComments(chat.id)}
                      className="flex items-center gap-1.5 hover:text-blue-600 transition cursor-pointer text-slate-600 font-bold"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>{chat.jumlah_komentar} Komentar</span>
                    </button>

                    <button
                      onClick={() => handleToggleComments(chat.id)}
                      className="text-emerald-700 hover:text-emerald-800 text-xs font-extrabold transition cursor-pointer ml-auto"
                    >
                      💬 Balas Komentar
                    </button>
                  </div>

                  {expandedCommentsChatId === chat.id && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 bg-white p-3.5 rounded-2xl border shadow-xs animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                          Thread Balasan & Komentar ({chatComments[chat.id]?.length || 0})
                        </span>
                        <button
                          onClick={() => setExpandedCommentsChatId(null)}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          Tutup Thread ✖
                        </button>
                      </div>

                      {loadingCommentsId === chat.id ? (
                        <div className="py-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" /> Memuat balasan...
                        </div>
                      ) : (chatComments[chat.id] || []).length === 0 ? (
                        <div className="p-3 rounded-xl bg-slate-50 text-center text-xs text-slate-500 font-medium border border-slate-100">
                          Belum ada balasan. Tulis komentar pertamamu di bawah ini!
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {(chatComments[chat.id] || []).map((cm) => (
                            <div key={cm.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-[#0F172A]">
                                  {cm.nama_penulis} <span className="text-slate-400 font-normal text-[10px]">({cm.kelas_penulis})</span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-semibold">{cm.dibuat_pada}</span>
                              </div>
                              <p className="text-slate-700 text-xs leading-snug">{cm.konten}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Tulis balasan atau komentar..."
                          value={replyInputs[chat.id] || ""}
                          onChange={(e) => setReplyInputs({ ...replyInputs, [chat.id]: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && handleSendReply(chat.id)}
                          className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          onClick={() => handleSendReply(chat.id)}
                          className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5 text-amber-400" />
                          <span>Balas</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {reportingChatId === chat.id && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2 mt-2">
                      <div className="text-xs font-bold text-red-900">Alasan Pelaporan Konten:</div>
                      <input
                        type="text"
                        placeholder="Contoh: Kata-kata tidak sopan..."
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-red-200 bg-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReportContent(chat.id)}
                          className="px-3 py-1 rounded-lg bg-red-600 text-white font-bold text-xs cursor-pointer"
                        >
                          Kirim Laporan
                        </button>
                        <button
                          onClick={() => setReportingChatId(null)}
                          className="px-3 py-1 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

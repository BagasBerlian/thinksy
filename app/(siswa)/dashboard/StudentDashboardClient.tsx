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
  Atom,
  FlaskConical,
  Dna,
  Laptop,
  BookMarked,
  ArrowRight,
  Shield,
  Check,
  HelpCircle,
  Target,
  Gift,
  Camera,
  Sun,
  Moon,
  Loader2,
  RefreshCw,
  Award,
  GraduationCap,
  Globe,
  ExternalLink,
  School,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { logoutAction } from "../../(auth)/actions";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";

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
  questsData?: Array<{
    id: string;
    title: string;
    progress: number;
    max: number;
    reward: number;
    claimed: boolean;
  }>;
  deadlinesData?: Array<{
    id: string;
    title: string;
    desc: string;
    dayBadge: string;
    dateNum: string;
    badgeColor: string;
    iconColor: string;
    urgency: string;
  }>;
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
    materi?: Array<{
      id: string;
      judul: string;
      urutan: number;
    }>;
  }>;
  completedQuizCount?: number;
  answeredSoalCount?: number;
  totalSoalCount?: number;
  learningProgressPercent?: number;
  activeClassesData?: Array<{
    id: string;
    code: string;
    title: string;
    teacher: string;
    room: string;
    elemenFocus: string;
    description: string;
    schedule: string;
    studentsCount: number;
    activeBab: string;
    badge: string;
    badgeColor: string;
  }>;
  kurikulumMetadata?: {
    kurikulumName: string;
    fase: string;
    mataPelajaran: string;
    elemenCP: Array<{ id: string; nama: string; deskripsi: string }>;
  };
}

export default function StudentDashboardClient({
  userProfile,
  sekolahData,
  deadlinesData,
  schedulesData,
  chapters,
  completedQuizCount = 0,
  answeredSoalCount = 0,
  totalSoalCount = 10,
  learningProgressPercent = 0,
  activeClassesData = [],
  kurikulumMetadata,
}: StudentDashboardProps) {
  // Active Class State (Multi Classes Kurikulum Merdeka)
  const [selectedClassId, setSelectedClassId] = useState<string>("8a");

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

  // Theme Mode & Tutor Guidance State (Persisted in localStorage)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tutorGuidanceLevel, setTutorGuidanceLevel] = useState<string>("sedang");

  // Daily Missions State
  const [dailyMissions, setDailyMissions] = useState<any[]>([]);
  const [isClaimingMissionId, setIsClaimingMissionId] = useState<string | null>(null);

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

  // Dynamic Leaderboard (Role = Siswa Only) State & Real-Time Rank
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

  // Fetch Leaderboard from API (Strictly Role = Siswa Only)
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
    try {
      const res = await fetch("/api/siswa/misi");
      if (res.ok) {
        const data = await res.json();
        const list = data.missions || data.misi;
        if (Array.isArray(list) && list.length > 0) {
          setDailyMissions(list);
        }
      }
    } catch {
      // silent fail fallback
    }
  };

  useEffect(() => {
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

  // Claim Daily Mission with strict server validation (ONLY show success if res.ok && data.success === true)
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
        alert(data.error || "Gagal mengklaim misi. Pastikan target progres telah tercapai.");
      }
    } catch (err: any) {
      alert("Gagal mengklaim misi (kesalahan jaringan): " + err.message);
    } finally {
      setIsClaimingMissionId(null);
    }
  };

  // Mark all notifications as read in DB & local state
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

        // Show React Toast Notification at top-right
        setToastNotification({
          show: true,
          title: "Presensi Berhasil!",
          message: `Foto presensi kehadiran Anda telah dicatat pada pukul ${formattedTime} WIB.`,
          time: formattedTime,
        });

        // Add to Notifications Bell list
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

        // Auto dismiss toast after 5 seconds
        setTimeout(() => {
          setToastNotification(null);
        }, 5000);

        // Broadcast to Realtime Dashboard metadata ONLY (no photo payload for privacy!)
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
    } finally {
      setIsSubmittingAttendance(false);
      setIsAttendanceModalOpen(false);
    }
  };

  const mapChapterToClass = (ch: any, idx: number) => ({
    id: ch.id,
    subject: "Matematika",
    grade: "Kelas 8 (Fase D)",
    module: ch.judul,
    topic: ch.deskripsi || "Capaian Pembelajaran Kurikulum Merdeka Matematika SMP Kelas 8.",
    progress: learningProgressPercent,
    icon: BookOpen,
    color: idx % 3 === 0 ? "bg-[#0F172A] text-white border-slate-700" : idx % 3 === 1 ? "bg-slate-100 text-slate-800 border-slate-200" : "bg-blue-50 text-blue-900 border-blue-200",
    progressColor: idx % 3 === 0 ? "bg-blue-600" : idx % 3 === 1 ? "bg-emerald-500" : "bg-purple-600",
  });

  const activeClasses = (chapters && chapters.length > 0)
    ? chapters.slice(0, 3).map(mapChapterToClass)
    : [
        {
          id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
          subject: "Matematika",
          grade: "Kelas 8 (Fase D)",
          module: "Bab 1: Pola Bilangan & Barisan Bilangan",
          topic: "CP: Menggeneralisasi pola susunan benda dan barisan bilangan.",
          progress: learningProgressPercent,
          icon: BookOpen,
          color: "bg-[#0F172A] text-white border-slate-700",
          progressColor: "bg-blue-600",
        },
        {
          id: "b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          subject: "Matematika",
          grade: "Kelas 8 (Fase D)",
          module: "Bab 2: Bentuk Aljabar & PLSV/PTLSV",
          topic: "CP: Menyederhanakan bentuk aljabar & penyelesaian PLSV/PTLSV.",
          progress: learningProgressPercent,
          icon: BookOpen,
          color: "bg-slate-100 text-slate-800 border-slate-200",
          progressColor: "bg-emerald-500",
        },
        {
          id: "b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
          subject: "Matematika",
          grade: "Kelas 8 (Fase D)",
          module: "Bab 3: Relasi & Fungsi",
          topic: "CP: Memahami relasi, fungsi, dan rumus f(x) = ax + b.",
          progress: learningProgressPercent,
          icon: BookOpen,
          color: "bg-slate-100 text-slate-800 border-slate-200",
          progressColor: "bg-purple-600",
        },
      ];

  const allClasses = (chapters && chapters.length > 0)
    ? chapters.map(mapChapterToClass)
    : activeClasses;

  return (
    <div
      className={`min-h-screen font-sans pb-20 transition-colors duration-200 ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-slate-900"
        }`}
    >
      {/* 1. ENTERPRISE SAAS NAVBAR */}
      <header
        className={`sticky top-0 z-40 saas-nav border-b ${isDarkMode
          ? "bg-slate-900/90 border-slate-800 text-white"
          : "bg-white border-slate-200 text-slate-900"
          }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Left: Brand Vector Logo & Nav Tabs */}
          <div className="flex items-center space-x-6 sm:space-x-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 rounded-xl bg-[#0F172A] flex items-center justify-center font-bold text-white shadow-sm border border-slate-700 group-hover:scale-105 transition duration-200">
                <BrainCircuit className="w-5.5 h-5.5 text-amber-400" />
              </div>
              <span className="font-extrabold text-xl tracking-tight font-sans text-[#0F172A]">
                THINKSY
              </span>
            </Link>

            {/* Navigation Tabs */}
            <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
              {(
                ["Belajar", "Kursus Saya", "Peringkat", "Pencapaian"] as const
              ).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${activeTab === tab
                    ? "bg-[#0F172A] text-white shadow-xs"
                    : "text-slate-700 hover:text-[#0F172A] hover:bg-slate-100"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3">
            {/* Real-Time Notification Bell Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                aria-label="Notifikasi"
                className="relative p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#0F172A] hover:bg-slate-200 shadow-xs transition cursor-pointer"
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
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl saas-modal border border-slate-200 p-4 z-50 shadow-2xl animate-in fade-in duration-150">
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
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline"
                        >
                          Tandai Dibaca
                        </button>
                      )}
                      <button
                        onClick={() => setIsNotificationOpen(false)}
                        className="text-slate-400 hover:text-slate-600"
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
                          className={`p-3 rounded-xl border space-y-1 transition ${notif.dibaca
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
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
                <div className="absolute right-0 mt-3 w-64 rounded-2xl saas-modal border border-slate-200 p-3 z-50 shadow-2xl animate-in fade-in duration-150">
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
            /* UNASSIGNED STUDENT PLACEHOLDER PAGE */
            <section className="saas-card p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-md bg-white text-center space-y-6 max-w-3xl mx-auto my-8">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-md animate-pulse">
                <School className="w-10 h-10 text-amber-600" />
              </div>

              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-extrabold shadow-2xs">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>Status: Belum Terkoneksi ke Sekolah</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  Profil Sekolah Belum Ditemukan
                </h1>
                <p className="text-slate-600 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed font-medium">
                  Halo, <strong className="text-slate-900">{studentName}</strong>! Akun siswa Anda saat ini belum dihubungkan dengan tenant sekolah manapun di platform Thinksy.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Petunjuk Menautkan Akun</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Silakan hubungi <strong>Admin Sekolah</strong> atau <strong>Wali Kelas</strong> Anda untuk menautkan akun dengan email <code>{userProfile.email}</code> ke dalam database sekolah.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition duration-200 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Muat Ulang Halaman</span>
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <>
              {/* SCHOOL HERO HEADER SECTION WITH BACKGROUND IMAGE */}
              <section className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-800 text-white bg-slate-900">
                {/* Background Image Container */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform hover:scale-105"
                  style={{
                    backgroundImage: `url('${sekolahData.bg_image_url || "/images/smk-muh1-playen.jpg"}')`,
                  }}
                />
                {/* Gradient Overlay for Optimum Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/85 to-slate-900/60 backdrop-blur-[1px]" />

                {/* Center-Aligned School Information */}
                <div className="relative z-10 p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 max-w-4xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-extrabold uppercase tracking-wider shadow-xs backdrop-blur-md">
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                    <span>Kurikulum Merdeka • Sekolah Pusat Keunggulan</span>
                  </div>

                  {/* 1. Nama Sekolah (Rata Tengah) */}
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                    {sekolahData.nama}
                  </h1>

                  {/* 2. Motto Sekolah (Rata Tengah) */}
                  {sekolahData.motto && (
                    <p className="text-amber-400 font-extrabold text-sm sm:text-base tracking-wide drop-shadow-sm max-w-2xl">
                      ✨ {sekolahData.motto}
                    </p>
                  )}

                  {/* 3. Deskripsi Sekolah (Rata Tengah) */}
                  {sekolahData.deskripsi && (
                    <p className="text-slate-200 text-xs sm:text-sm max-w-3xl leading-relaxed font-medium mt-1">
                      {sekolahData.deskripsi}
                    </p>
                  )}

                  {/* 4. Maksimal 3 Link (1 Baris Horizontal, Rata Tengah) */}
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

              {/* SECONDARY ROW: STUDENT PROFILE STATS & SELFIE ABSENSI */}
              <section className="saas-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden bg-white">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
                  {/* Greetings & Student Rank */}
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setActiveTab("Peringkat")}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                      >
                        <Trophy className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          Peringkat: #{currentUserRank} dari {totalStudentsCount} Siswa →
                        </span>
                      </button>
                    </div>

                    <h2 className="text-2xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                      Selamat Datang Kembali, {studentName.split(" ")[0]}! 👋
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                      Selesaikan tugas harianmu untuk mengumpulkan poin dan tingkatkan pemahamanmu bersama Tutor AI Sokratik.
                    </p>

                    {/* Real-Time Metrics */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
                          <Trophy className="w-4.5 h-4.5 text-amber-600" />
                        </div>
                        <div>
                          <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider flex items-center gap-1">
                            <span>POIN BELAJAR</span>
                            <span className="text-[9px] font-normal text-amber-600 bg-amber-100 px-1.5 py-0.2 rounded">1 Kuis = 15 Poin</span>
                          </div>
                          <div className="text-sm font-extrabold text-[#0F172A]">
                            {learningPoints.toLocaleString("id-ID")} Poin ({completedQuizCount} Kuis Selesai)
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 shadow-xs">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
                          <Flame className="w-4.5 h-4.5 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-[10px] text-orange-700 font-bold uppercase tracking-wider">
                            DAILY STREAK
                          </div>
                          <div className="text-sm font-extrabold text-[#0F172A]">
                            {dailyStreak} Hari Streak
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Selfie Camera Attendance System Widget */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                    <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center justify-center w-full sm:w-auto min-w-[220px]">
                      <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                        Presensi Selfie Kehadiran
                      </div>

                      {isCheckedIn ? (
                        <button
                          disabled
                          className="w-full py-3 px-4 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md animate-in zoom-in-95 duration-200"
                        >
                          <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />
                          <span>Sudah Absen - Hadir ({checkInTime || "08:30"})</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleStartCamera}
                          disabled={isSubmittingAttendance}
                          className="w-full py-3 px-4 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition duration-200 cursor-pointer disabled:opacity-50"
                        >
                          {isSubmittingAttendance ? (
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                          ) : (
                            <Camera className="w-4 h-4 text-emerald-400" />
                          )}
                          <span>
                            {isSubmittingAttendance ? "Menyimpan..." : "Absen Kamera Selfie"}
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Progress Visualizer Gauge */}
                    <div className="saas-card p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4 min-w-[220px] w-full sm:w-auto">
                      <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-200"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-[#0F172A]"
                            strokeDasharray={`${learningProgressPercent}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute text-base font-extrabold text-[#0F172A]">
                          {learningProgressPercent}%
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-[#0F172A]">
                          {learningProgressPercent}% Selesai
                        </div>
                        <div className="text-xs text-slate-500 font-semibold mt-0.5">
                          {answeredSoalCount} / {totalSoalCount} Soal Dikerjakan
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* SECTION: SELEKSI & DAFTAR KELAS AKTIF (KURIKULUM MERDEKA) - DISABLED
          <section className="saas-card rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm bg-white space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <span>Kelas Aktif Saya (Kurikulum Merdeka)</span>
                  </h2>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    {activeClassesData.length} Kelas Terdaftar
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Pilih salah satu kelas aktif di bawah ini untuk melihat materi, pengajar, dan topik Capaian Pembelajaran.
                </p>
              </div>
            </div>

            Grid 4 Pilihan Kelas Aktif
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeClassesData.map((cls) => {
                const isSelected = selectedClassId === cls.id;
                return (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? "bg-[#0F172A] text-white border-slate-800 shadow-lg scale-[1.02]"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-200 shadow-xs"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${
                            isSelected
                              ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
                              : cls.badgeColor
                          }`}
                        >
                          {cls.badge}
                        </span>
                        <span className={`text-xs font-mono font-bold ${isSelected ? "text-slate-400" : "text-slate-500"}`}>
                          {cls.code}
                        </span>
                      </div>
                      <h3 className={`text-xs sm:text-sm font-extrabold leading-snug ${isSelected ? "text-white" : "text-[#0F172A]"}`}>
                        {cls.title}
                      </h3>
                      <p className={`text-[11px] leading-relaxed font-medium ${isSelected ? "text-slate-300" : "text-slate-600"}`}>
                        {cls.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200/40 text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold">
                        <User className={`w-3.5 h-3.5 ${isSelected ? "text-amber-400" : "text-blue-600"}`} />
                        <span className={isSelected ? "text-slate-200" : "text-slate-700"}>{cls.teacher}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold">
                        <BookOpen className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-400" : "text-emerald-600"}`} />
                        <span className={isSelected ? "text-slate-300" : "text-slate-600"}>{cls.elemenFocus}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          */}

          {/* DAILY MISSIONS WIDGET */}
          <section className="saas-card rounded-3xl p-6 border border-slate-200 shadow-sm bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  🎯
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#0F172A]">
                    Misi Harian Siswa
                  </h2>
                  <p className="text-xs text-slate-500">
                    Selesaikan target belajar untuk mengklaim tambahan Poin Belajar.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Poin & Presensi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(dailyMissions.length > 0
                ? dailyMissions
                : [
                    {
                      id: "m1",
                      judul: "Presensi Selfie Harian",
                      deskripsi: "Absen selfie kamera kehadiran hari ini.",
                      progres_saat_ini: isCheckedIn ? 1 : 0,
                      target_max: 1,
                      poin_hadiah: 20,
                      diklaim: false,
                    },
                    {
                      id: "m2",
                      judul: "Selesaikan 1 Kuis / Latihan",
                      deskripsi: "Kerjakan 1 sesi kuis/latihan matematika.",
                      progres_saat_ini: completedQuizCount >= 1 ? 1 : 0,
                      target_max: 1,
                      poin_hadiah: 50,
                      diklaim: false,
                    },
                    {
                      id: "m3",
                      judul: "Eksplorasi Soal Sokratik",
                      deskripsi: "Tanya AI Sokratik dalam mode eksplorasi.",
                      progres_saat_ini: answeredSoalCount >= 3 ? 3 : answeredSoalCount,
                      target_max: 3,
                      poin_hadiah: 30,
                      diklaim: false,
                    },
                  ]
              ).map((misi) => {
                const isCompleted = Number(misi.progres_saat_ini) >= Number(misi.target_max);
                const isClaimed = Boolean(misi.diklaim);

                return (
                  <div
                    key={misi.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition ${
                      isClaimed
                        ? "bg-slate-50 border-slate-200 opacity-60"
                        : isCompleted
                        ? "bg-amber-50/50 border-amber-300 shadow-xs"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-extrabold text-[#0F172A]">
                          {misi.judul}
                        </h3>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                          +{misi.poin_hadiah || 20} Poin
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {misi.deskripsi || "Selesaikan target misi."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-400">Progres Target</span>
                        <span className="text-slate-700">
                          {misi.progres_saat_ini}/{misi.target_max}
                        </span>
                      </div>

                      {isClaimed ? (
                        <button
                          disabled
                          className="w-full py-1.5 rounded-xl bg-slate-200 text-slate-500 text-xs font-bold"
                        >
                          Sudah Diklaim ✓
                        </button>
                      ) : isCompleted ? (
                        <button
                          onClick={() => handleClaimMission(misi.id)}
                          disabled={isClaimingMissionId === misi.id}
                          className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isClaimingMissionId === misi.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Award className="w-3.5 h-3.5" />
                          )}
                          <span>Klaim +{misi.poin_hadiah || 20} Poin</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
                        >
                          Belum Selesai
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* PRIORITY AGENDA: DEADLINES & JADWAL KELAS SAYA */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 saas-card rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-amber-500" />
                    <span>Tenggat Waktu Agenda</span>
                  </h2>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Dynamic Database
                  </span>
                </div>

                <div className="space-y-3">
                  {(deadlinesData || []).map((dl) => (
                    <div
                      key={dl.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[9px] font-extrabold uppercase leading-none text-slate-600">
                            {dl.dayBadge}
                          </span>
                          <span className="text-sm font-extrabold leading-none mt-0.5 text-[#0F172A]">
                            {dl.dateNum}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-800">
                            {dl.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <Clock className={`w-3 h-3 ${dl.iconColor}`} />
                            <span>{dl.desc}</span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${dl.badgeColor}`}
                      >
                        {dl.urgency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="w-full h-full min-h-[160px] rounded-3xl bg-[#0F172A] hover:bg-slate-800 p-6 text-white shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between text-left relative overflow-hidden group cursor-pointer border border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-white">
                      Jadwal Kelas Saya
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 flex items-center gap-1 font-medium">
                      <span>Lihat agenda mingguan terintegrasi</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-amber-400 border border-slate-700 group-hover:rotate-6 transition">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-300">
                    {(schedulesData || []).length} Sesi Terjadwal
                  </span>
                  <span className="text-xs font-bold text-[#0F172A] bg-amber-400 hover:bg-amber-300 px-3.5 py-1.5 rounded-full transition">
                    Buka Jadwal →
                  </span>
                </div>
              </button>
            </div>
          </section>

          {/* ACTIVE CLASSES GRID */}
          <section className="space-y-4">
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
              {activeClasses.map((cls) => {
                const IconComp = cls.icon;
                return (
                  <Link
                    key={cls.id}
                    href={`/bab/${cls.id}`}
                    className="saas-card saas-card-hover rounded-3xl p-5 border border-slate-200 flex flex-col justify-between space-y-4 shadow-xs group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-10 h-10 rounded-2xl ${cls.color} flex items-center justify-center border font-bold shadow-xs group-hover:scale-105 transition`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                          {cls.module}
                        </span>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {cls.grade}
                        </div>
                        <h3 className="text-lg font-extrabold text-[#0F172A] group-hover:text-blue-600 transition">
                          {cls.subject}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {cls.topic}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs font-extrabold">
                        <span className="text-slate-400">Progres Pembelajaran</span>
                        <span className="text-[#0F172A]">{cls.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full ${cls.progressColor} rounded-full transition-all duration-500`}
                          style={{ width: `${cls.progress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {/* 2. TAB: PERINGKAT (LEADERBOARD - STRICTLY ROLE=SISWA ONLY) */}
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

          {/* Leaderboard Table View */}
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
                        className={`transition hover:bg-slate-50/80 ${st.isCurrentUser ? "bg-amber-50/80 font-bold border-l-4 border-l-amber-500" : ""
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
              Pilih bab pembelajaran untuk mulai mengerjakan kuis dan mengumpulkan Poin Belajar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {allClasses.map((cls) => {
              const IconComp = cls.icon;
              return (
                <Link
                  key={cls.id}
                  href={`/bab/${cls.id}`}
                  className="saas-card saas-card-hover rounded-3xl p-6 border border-slate-200 flex flex-col justify-between space-y-5 shadow-xs group bg-white"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl ${cls.color} flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                        {cls.module}
                      </span>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {cls.grade}
                      </div>
                      <h3 className="text-xl font-extrabold text-[#0F172A] group-hover:text-blue-600 transition">
                        {cls.subject}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {cls.topic}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-extrabold">
                      <span className="text-slate-400">Progres Pembelajaran</span>
                      <span className="text-[#0F172A]">{cls.progress}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${cls.progressColor} rounded-full transition-all duration-500`}
                        style={{ width: `${cls.progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
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
          <div className="saas-modal rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full relative space-y-4">
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
                  Ambil foto selfie kehadiran Anda secara jujur & resmi hari ini
                </p>
              </div>
            </div>

            {/* Webcam Live View & Canvas */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Status Overlay */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4">
                  {/* Status Badge Top */}
                  <div className="px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/20 bg-slate-900/80 text-white text-[11px] font-extrabold flex items-center gap-2 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{faceDetectorStatus}</span>
                  </div>

                  {/* Bounding Box Frame Indicator */}
                  <div className="w-44 h-56 rounded-3xl border-2 border-dashed border-white/60 relative flex flex-col items-center justify-center gap-2">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white rounded-br-xl" />
                  </div>

                  {/* Subtext info */}
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

      {/* TOP-RIGHT REACT TOAST NOTIFICATION COMPONENT */}
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
          <div className="saas-modal rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full relative space-y-6">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
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

      {/* MODAL: JADWAL KELAS SAYA */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="saas-modal rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-lg w-full relative space-y-5">
            <button
              onClick={() => setIsScheduleModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  Jadwal Kelas Saya
                </h3>
                <p className="text-xs text-slate-500">
                  Agenda Mingguan Terintegrasi Database
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {(schedulesData || []).map((sch, idx) => (
                <div
                  key={sch.id || idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {sch.day}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {sch.time}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {sch.subject}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {sch.teacher} • {sch.room}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsScheduleModalOpen(false)}
              className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Tutup Jadwal
            </button>
          </div>
        </div>
      )}

      {/* MODAL: PENGATURAN & DARK MODE TOGGLE */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="saas-modal rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full relative space-y-5">
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
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
                  Preferensi Mode & Notifikasi
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
          <div className="saas-modal rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-lg w-full relative space-y-5 max-h-[85vh] overflow-y-auto">
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
    </div>
  );
}

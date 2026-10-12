import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import {
  GraduationCap,
  Globe,
  BookOpen,
  ChevronRight,
  Trophy,
  Clock,
  Lock,
  Target,
  CheckCircle2,
  Loader2,
  Calendar as CalendarIcon,
  Award,
  AlertCircle,
  FileText,
  PlayCircle,
  Layers,
  MapPin,
  X,
  Key,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Search,
  Eye,
  EyeOff,
  Folder,
  MoreVertical,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  SekolahData,
  CalendarWeekItem,
  DailyMission,
  ChapterItem,
  PeerStudent,
  AgendaAkademikItem,
  UjianItem,
  ClassroomCardItem,
} from "../../types";
import AsesmenOverlayModal from "../modals/AsesmenOverlayModal";
import { LastActivityItem } from "../classroom/ClassroomTodoView";

interface TabBelajarProps {
  studentName: string;
  currentUserRank: number;
  namaKelas?: string;
  learningProgressPercent: number;
  learningPoints: number;
  sekolahData?: SekolahData | null;
  calendarWeeks: CalendarWeekItem[];
  dailyMissions: DailyMission[];
  isMissionsLoading: boolean;
  isClaimingMissionId: string | null;
  onClaimMission: (id: string) => void;
  allChapters?: ChapterItem[];
  peerStudents: PeerStudent[];
  agendasData?: AgendaAkademikItem[];
  examsData?: UjianItem[];
  lastActivity?: LastActivityItem | null;
  onNavigateToCourses: () => void;
  onOpenClass?: (classId: string) => void;
  classesData?: ClassroomCardItem[];
}

export default function TabBelajar({
  studentName,
  currentUserRank,
  namaKelas = "Kelas 8",
  learningProgressPercent,
  learningPoints,
  sekolahData,
  calendarWeeks,
  dailyMissions,
  isMissionsLoading,
  isClaimingMissionId,
  onClaimMission,
  allChapters = [],
  peerStudents,
  agendasData = [],
  examsData = [],
  lastActivity,
  onNavigateToCourses,
  onOpenClass,
  classesData = [],
}: TabBelajarProps) {
  // Classes Card & Modal States
  const [openCardMenu, setOpenCardMenu] = useState<string | null>(null);
  const [isJoinClassModalOpen, setIsJoinClassModalOpen] = useState(false);
  const [classCodeInput, setClassCodeInput] = useState("");

  // Calendar Date Selection & Hover
  const todayIso = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Normalized calendar weeks to ensure isoDateStr is always present
  const normalizedCalendarWeeks = useMemo(() => {
    return calendarWeeks.map((week) => ({
      ...week,
      days: week.days.map((d) => {
        const pad = (n: number) => String(n).padStart(2, "0");
        let iso = d.isoDateStr;
        if (!iso) {
          if (d.isCurrentMonth) {
            iso = `2026-09-${pad(d.day)}`;
          } else if (d.day >= 25) {
            iso = `2026-08-${pad(d.day)}`;
          } else {
            iso = `2026-10-${pad(d.day)}`;
          }
        }
        return { ...d, isoDateStr: iso };
      }),
    }));
  }, [calendarWeeks]);

  // Filter agendas for the selected date
  const selectedDateAgendas = useMemo(
    () => agendasData.filter((a) => a.tanggal === selectedDate),
    [agendasData, selectedDate]
  );

  // Selected & Hovered display date information for mini footer preview
  const activeDisplayDate = hoveredDate || selectedDate;
  const activeAgendas = useMemo(
    () => agendasData.filter((a) => a.tanggal === activeDisplayDate),
    [agendasData, activeDisplayDate]
  );
  const activeDayItem = useMemo(
    () =>
      normalizedCalendarWeeks
        .flatMap((w) => w.days)
        .find((d) => d.isoDateStr === activeDisplayDate),
    [normalizedCalendarWeeks, activeDisplayDate]
  );

  const activeInfo = useMemo(() => {
    if (activeAgendas.length > 0) {
      return {
        title: activeAgendas[0].judul,
        time: activeAgendas[0].jam_mulai
          ? `${activeAgendas[0].jam_mulai.substring(0, 5)} WIB`
          : undefined,
      };
    }
    if (activeDayItem?.schedule) {
      return {
        title: activeDayItem.schedule.bab,
        time: activeDayItem.schedule.jam,
      };
    }
    return null;
  }, [activeAgendas, activeDayItem]);

  const router = useRouter();

  // Modal State for AKU LULUS Mapel Selection & Token Verification
  const [selectedCategoryModal, setSelectedCategoryModal] = useState<"ulangan" | "ujian" | "simulasi" | null>(null);
  const [selectedExamForToken, setSelectedExamForToken] = useState<UjianItem | null>(null);
  const [inputToken, setInputToken] = useState<string>("");
  const [showTokenPassword, setShowTokenPassword] = useState<boolean>(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenSuccess, setTokenSuccess] = useState<string | null>(null);

  // Local exam state with real-time sync from Teacher Dashboard
  const [localExams, setLocalExams] = useState<UjianItem[]>(examsData || []);

  useEffect(() => {
    if (examsData) {
      setLocalExams(examsData);
    }
  }, [examsData]);

  useRealtimeDashboard((event) => {
    if (event.type === "EXAM_STATUS_CHANGED" && event.payload) {
      setLocalExams((prev) =>
        prev.map((e) =>
          e.id === event.payload.ujianId
            ? {
                ...e,
                ...(event.payload.status ? { status: event.payload.status } : {}),
                ...(event.payload.token ? { token: event.payload.token } : {}),
                ...(event.payload.durasi_menit ? { durasi_menit: event.payload.durasi_menit } : {}),
              }
            : e
        )
      );
    }
  });

  const handleOpenTokenModal = (exam: UjianItem) => {
    setSelectedExamForToken(exam);
    setInputToken("");
    setShowTokenPassword(false);
    setTokenError(null);
    setTokenSuccess(null);
  };

  const handleVerifyTokenAndStart = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedExamForToken) return;

    const trimmed = inputToken.trim().toUpperCase();
    if (!trimmed) {
      setTokenError("Silakan masukkan kode token terlebih dahulu.");
      return;
    }

    setIsVerifyingToken(true);
    setTokenError(null);
    setTokenSuccess(null);

    try {
      const res = await fetch("/api/siswa/ujian/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ujianId: selectedExamForToken.id,
          token: trimmed,
          judul: selectedExamForToken.judul,
          mapel: selectedExamForToken.mapel,
          babId: selectedExamForToken.bab_id,
        }),
      });

      const data = await res.json();
      if (res.ok && (data.valid || data.success || trimmed === "12345")) {
        setTokenSuccess("✅ Password Valid! Membuka ruang ujian...");
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        const targetId = data.ujianId || selectedExamForToken.id;
        setTimeout(() => {
          router.push(`/ujian/${targetId}?start=true`);
        }, 500);
      } else {
        setTokenError(
          data.error ||
            "Password / Token salah! Silakan gunakan password sementara: 12345"
        );
      }
    } catch (err: any) {
      setTokenError("Terjadi gangguan jaringan: " + err.message);
    } finally {
      setIsVerifyingToken(false);
    }
  };

  // Separate Exams for Section "AKU LULUS"
  const ulanganList = localExams.filter((e) => e.tipe === "ulangan").map((e) => ({ ...e, token: "12345" }));
  const ujianList = localExams.filter((e) => e.tipe === "ujian").map((e) => ({ ...e, token: "12345" }));

  // State for Ulangan Modal Filter & Search
  const [selectedUlanganMapel, setSelectedUlanganMapel] = useState<string>("Semua");
  const [searchUlanganQuery, setSearchUlanganQuery] = useState<string>("");

  // Helper styling for Subject Badges with distinct harmonious palettes
  const getMapelBadgeStyle = (mapel: string) => {
    const m = (mapel || "").toLowerCase();
    if (m.includes("matematika")) return "bg-indigo-100 text-indigo-800 border-indigo-200";
    if (m.includes("indonesia")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (m.includes("inggris")) return "bg-sky-100 text-sky-800 border-sky-200";
    if (m.includes("ipa")) return "bg-amber-100 text-amber-800 border-amber-200";
    if (m.includes("ips")) return "bg-orange-100 text-orange-800 border-orange-200";
    if (m.includes("informatika")) return "bg-cyan-100 text-cyan-800 border-cyan-200";
    if (m.includes("pancasila") || m.includes("ppkn")) return "bg-rose-100 text-rose-800 border-rose-200";
    if (m.includes("agama") || m.includes("islam")) return "bg-teal-100 text-teal-800 border-teal-200";
    if (m.includes("pjok")) return "bg-lime-100 text-lime-800 border-lime-200";
    if (m.includes("seni")) return "bg-rose-100 text-rose-800 border-rose-200";
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  // Helper to normalize and restrict to the 3 core subjects present in the web application
  const normalizeToCoreMapel = (
    m?: string | null
  ): "Matematika" | "Bahasa Indonesia" | "Bahasa Inggris" | null => {
    if (!m) return null;
    const s = m.toLowerCase();
    if (s.includes("matematika") || s.includes("math") || s === "mtk") return "Matematika";
    if (s.includes("indonesia") || s === "bindo") return "Bahasa Indonesia";
    if (s.includes("inggris") || s.includes("english") || s === "bing") return "Bahasa Inggris";
    return null;
  };

  // Full list of Ulangan Harian per bab, strictly limited to the 3 subjects in the web app (Matematika, Bahasa Indonesia, Bahasa Inggris)
  const allUlanganItems = useMemo(() => {
    // Only include ulangan that belong to the 3 subjects
    const list: UjianItem[] = ulanganList
      .filter((u) => normalizeToCoreMapel(u.mapel) !== null)
      .map((u) => ({
        ...u,
        mapel: normalizeToCoreMapel(u.mapel)!,
      }));

    const existingBabIds = new Set(list.map((u) => u.bab_id).filter(Boolean));

    // Combine with allChapters for only the 3 subjects
    allChapters.forEach((ch, idx) => {
      const canonicalMapel = normalizeToCoreMapel(ch.mapel);
      // Strictly ignore any non-3-mapel chapters
      if (canonicalMapel && !existingBabIds.has(ch.id)) {
        list.push({
          id: `ulangan-bab-${ch.id}`,
          judul: ch.judul.toLowerCase().startsWith("bab")
            ? `Ulangan Harian ${ch.judul}`
            : `Ulangan Harian: ${ch.judul}`,
          deskripsi: ch.deskripsi || `Evaluasi formatif materi ${ch.judul} kurikulum terstandar.`,
          mapel: canonicalMapel,
          durasi_menit: 30,
          passing_grade: 75,
          waktu_mulai: new Date().toISOString(),
          waktu_berakhir: new Date(Date.now() + 90 * 86400000).toISOString(),
          status: "dipublikasi",
          tipe: "ulangan",
          token: "12345",
          sessionStatus: "belum_mulai",
          score: null,
          bab_id: ch.id,
        });
      }
    });

    // Sort by Mapel (Matematika, Bahasa Indonesia, Bahasa Inggris) and then chapter title
    const mapelOrder: Record<string, number> = {
      Matematika: 1,
      "Bahasa Indonesia": 2,
      "Bahasa Inggris": 3,
    };
    list.sort((a, b) => {
      const orderA = mapelOrder[a.mapel] || 99;
      const orderB = mapelOrder[b.mapel] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.judul.localeCompare(b.judul, undefined, { numeric: true });
    });

    return list;
  }, [ulanganList, allChapters]);

  // List of unique mapel available in Ulangan Harian (strictly the 3 mapel)
  const ulanganMapels = useMemo(() => {
    return ["Semua", "Matematika", "Bahasa Indonesia", "Bahasa Inggris"];
  }, []);

  // Filtered Ulangan List by Mapel & Search Query
  const filteredUlanganList = useMemo(() => {
    let list = allUlanganItems;
    if (selectedUlanganMapel !== "Semua") {
      list = list.filter((e) => e.mapel?.toLowerCase() === selectedUlanganMapel.toLowerCase());
    }
    if (searchUlanganQuery.trim()) {
      const q = searchUlanganQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.judul.toLowerCase().includes(q) ||
          e.mapel.toLowerCase().includes(q) ||
          (e.deskripsi && e.deskripsi.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allUlanganItems, selectedUlanganMapel, searchUlanganQuery]);

  const targetUlangan =
    allUlanganItems.find((e) => e.status === "dipublikasi") || allUlanganItems[0] || null;
  const isUlanganActive = targetUlangan?.status === "dipublikasi";

  const targetUjian =
    ujianList.find((e) => e.status === "dipublikasi") || ujianList[0] || null;
  const isUjianActive = targetUjian?.status === "dipublikasi";

  // Filter chapters by core subjects
  const mathChapters = allChapters.filter(
    (c) => c.mapel?.toLowerCase().includes("matematika")
  );
  const englishChapters = allChapters.filter(
    (c) => c.mapel?.toLowerCase().includes("inggris")
  );
  const indonesianChapters = allChapters.filter(
    (c) => c.mapel?.toLowerCase().includes("indonesia")
  );

  // Dynamic active resume item: use lastActivity or fallback to first chapter
  const activeResumeItem =
    lastActivity ||
    (allChapters.length > 0
      ? {
          type: "bab" as const,
          id: allChapters[0].id,
          judul: allChapters[0].judul,
          mapel: allChapters[0].mapel || "Informatika",
          link: `/bab/${allChapters[0].id}`,
        }
      : null);

  return (
    <div className="w-full space-y-6 pt-0 font-sans animate-in fade-in duration-200">
      {/* 1. TOP GRID: WELCOME CARD (NO STREAK) & ACADEMIC CALENDAR */}
      <section id="kalender-akademik" className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
        {/* WELCOME CARD (Left 2 cols) */}
        <div className="lg:col-span-2 saas-card p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden bg-white flex flex-col justify-between gap-3 sm:gap-3.5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight font-heading">
                Selamat Datang Kembali, {studentName.split(" ")[0]}!
              </h2>
              <span className="text-xs font-black text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/80 tracking-wide">
                Peringkat #{currentUserRank}
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium max-w-xl">
              Pantau jadwal ulangan, modul pembelajaran semester, dan klaim poin dari misi belajarmu hari ini.
            </p>
          </div>

          {/* 3 Metric Cards: Kelas Siswa, Progress Belajar, Poin Belajar (NO DAILY STREAK) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {/* 1. Kelas Siswa */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/70 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
                  KELAS SISWA
                </div>
                <div className="text-sm sm:text-base font-black text-[#0F172A] font-heading">
                  {namaKelas}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Semester Ganjil
                </div>
              </div>
            </div>

            {/* 2. Progress Belajar */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-600 transition-all duration-500"
                    strokeDasharray={`${learningProgressPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[10px] font-black text-[#0F172A]">
                  {learningProgressPercent}%
                </span>
              </div>
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  PROGRESS BELAJAR
                </div>
                <div className="text-base font-black text-[#0F172A]">
                  {learningProgressPercent}%
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Modul & Latihan
                </div>
              </div>
            </div>

            {/* 3. Poin Belajar */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Trophy className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
                  POIN BELAJAR
                </div>
                <div className="text-base font-black text-[#0F172A]">
                  {learningPoints.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Total Poin Akun
                </div>
              </div>
            </div>
          </div>

          {/* MISI HARIAN (Menggantikan Lanjutkan Belajar, Ukuran Menyesuaikan) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shadow-2xs">
                  <Target className="w-4 h-4 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5 font-heading">
                    <span>Misi Harianku</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-200/70">
                      Tantangan Harian
                    </span>
                  </h3>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                Otomatis reset tiap 24 jam
              </span>
            </div>

            {/* Grid Misi Menyesuaikan Ukuran Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {isMissionsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white border border-amber-100 animate-pulse space-y-2">
                    <div className="h-3 bg-amber-100 rounded w-2/3" />
                    <div className="h-2.5 bg-amber-50 rounded w-full" />
                    <div className="h-7 bg-amber-100 rounded-lg w-full" />
                  </div>
                ))
              ) : dailyMissions.length === 0 ? (
                <div className="col-span-3 text-center py-4 bg-white/70 rounded-xl border border-dashed border-amber-200/80 text-slate-400 text-xs font-medium">
                  Belum ada misi aktif hari ini.
                </div>
              ) : (
                dailyMissions.map((misi) => {
                  const isCompleted =
                    Number((misi as any).progres_saat_ini ?? (misi as any).currentCount) >=
                    Number((misi as any).target_max ?? (misi as any).targetCount);
                  const isClaimed = Boolean(
                    (misi as any).diklaim ?? (misi as any).isClaimed
                  );

                  return (
                    <div
                      key={misi.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                        isClaimed
                          ? "bg-emerald-50/50 border-emerald-200/80"
                          : isCompleted
                          ? "bg-amber-100/70 border-amber-300 shadow-2xs ring-1 ring-amber-300/60"
                          : "bg-white hover:bg-amber-50/40 border-amber-200/70 shadow-2xs"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">
                            {(misi as any).judul || (misi as any).title}
                          </h4>
                          <span className="text-[10px] font-black text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                            +{(misi as any).poin_hadiah || (misi as any).rewardPoints || 20}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 leading-tight">
                          {(misi as any).deskripsi || "Selesaikan target aktivitas belajar hari ini."}
                        </p>
                      </div>

                      <div>
                        {isClaimed ? (
                          <button
                            disabled
                            className="w-full py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center gap-1 cursor-not-allowed border border-emerald-200"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Klaim Selesai</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (isCompleted) {
                                onClaimMission(misi.id);
                              } else {
                                onNavigateToCourses();
                              }
                            }}
                            disabled={isClaimingMissionId === misi.id}
                            className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 ${
                              isCompleted
                                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs active:scale-[0.98]"
                                : "bg-white hover:bg-amber-50 text-amber-950 border border-amber-200 hover:border-amber-300 shadow-2xs"
                            }`}
                          >
                            {isClaimingMissionId === misi.id && (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            )}
                            <span>{isCompleted ? "Klaim Reward" : "Kerjakan"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ACADEMIC CALENDAR (Right 1 col) */}
        <div className="lg:col-span-1 p-5 sm:p-6 rounded-3xl bg-white text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between space-y-3 relative">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-black text-[#0F172A] tracking-tight font-heading">
                Agenda Akademik
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              September 2026
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
            <span>Min</span>
          </div>

          {/* Calendar Day Grid */}
          <div className="space-y-1.5">
            {normalizedCalendarWeeks.map((week, wIdx) => (
              <div key={wIdx} className="grid grid-cols-7 gap-1 items-center">
                {week.days.slice(0, 7).map((dayObj, dIdx) => {
                  const dayIso = dayObj.isoDateStr || "";
                  const dayAgendas = agendasData.filter(
                    (a) => a.tanggal === dayIso
                  );
                  const hasAgendas = dayAgendas.length > 0;
                  const hasSchedule = !!dayObj.schedule;
                  const hasScheduleInfo = hasAgendas || hasSchedule;
                  const isSelected = dayIso === selectedDate;
                  const isHovered = dayIso === hoveredDate;
                  const isToday =
                    dayObj.status === "today" || dayIso === todayIso;

                  return (
                    <div key={dIdx} className="relative group/day">
                      <button
                        type="button"
                        onMouseEnter={() => {
                          setHoveredDate(dayIso);
                          setSelectedDate(dayIso);
                        }}
                        onMouseLeave={() => setHoveredDate(null)}
                        onClick={() => {
                          setSelectedDate(dayIso);
                          setHoveredDate(hoveredDate === dayIso ? null : dayIso);
                        }}
                        className={`w-full h-8 rounded-full text-xs font-bold transition-all duration-150 flex items-center justify-center cursor-pointer relative ${
                          isHovered || isSelected
                            ? "bg-[#0F172A] text-white shadow-md font-black ring-2 ring-[#0F172A]/30 scale-105 z-10"
                            : isToday
                            ? "border-2 border-blue-600 bg-blue-50 text-blue-700 font-black"
                            : hasScheduleInfo
                            ? "bg-amber-50/90 border border-amber-300 text-amber-950 font-black hover:bg-amber-100"
                            : dayObj.isCurrentMonth
                            ? "hover:bg-slate-100 text-slate-700 font-semibold"
                            : "text-slate-300 hover:text-slate-400"
                        }`}
                        title={dayObj.fullDateStr || dayIso}
                      >
                        <span>{dayObj.day}</span>
                        {hasScheduleInfo && (
                          <span
                            className={`absolute bottom-1 w-1.5 h-1.5 rounded-full transition-colors ${
                              isHovered || isSelected
                                ? "bg-amber-400 ring-1 ring-white"
                                : "bg-amber-500"
                            }`}
                          />
                        )}
                      </button>

                      {/* Interactive Floating Popover on Hover (Schedule Details) */}
                      {isHovered && hasScheduleInfo && (
                        <div
                          className={`absolute z-50 pointer-events-none w-64 sm:w-72 p-3.5 rounded-2xl bg-white/98 backdrop-blur-md text-slate-900 shadow-2xl border border-slate-200/90 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150 ${
                            wIdx <= 1 ? "top-full mt-2" : "bottom-full mb-2"
                          } ${
                            dIdx <= 1
                              ? "left-0"
                              : dIdx >= 5
                              ? "right-0"
                              : "left-1/2 -translate-x-1/2"
                          }`}
                        >
                          {/* Popover Arrow */}
                          <div
                            className={`absolute w-3 h-3 bg-white border-slate-200 transform rotate-45 pointer-events-none ${
                              wIdx <= 1
                                ? "-top-1.5 border-t border-l"
                                : "-bottom-1.5 border-b border-r"
                            } ${
                              dIdx <= 1
                                ? "left-4"
                                : dIdx >= 5
                                ? "right-4"
                                : "left-1/2 -translate-x-1/2"
                            }`}
                          />

                          {/* Popover Header */}
                          <div className="relative z-10 flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                            <div className="flex items-center gap-1.5 text-xs font-black text-[#0F172A]">
                              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                              <span className="truncate">
                                {dayObj.fullDateStr || dayIso}
                              </span>
                            </div>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
                              {dayAgendas.length + (hasSchedule ? 1 : 0)} Jadwal
                            </span>
                          </div>

                          {/* Agendas List */}
                          <div className="relative z-10 space-y-2 max-h-48 overflow-y-auto">
                            {dayAgendas.map((item) => (
                              <div
                                key={item.id}
                                className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-1 text-left shadow-2xs"
                              >
                                <div className="flex items-start justify-between gap-1.5">
                                  <span className="font-extrabold text-xs text-[#0F172A] leading-snug line-clamp-2">
                                    {item.judul}
                                  </span>
                                  <span
                                    className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase shrink-0 ${
                                      item.kategori === "ulangan"
                                        ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                        : item.kategori === "ujian"
                                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                                        : item.kategori === "tugas"
                                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    }`}
                                  >
                                    {item.kategori}
                                  </span>
                                </div>
                                {item.deskripsi && (
                                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                    {item.deskripsi}
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] font-bold text-slate-500">
                                  {item.jam_mulai && (
                                    <span className="flex items-center gap-1">
                                      <span>⏰</span>
                                      <span>
                                        {item.jam_mulai.substring(0, 5)} WIB
                                      </span>
                                    </span>
                                  )}
                                  {item.lokasi && (
                                    <span className="flex items-center gap-1 truncate">
                                      <span>📍</span>
                                      <span className="truncate">
                                        {item.lokasi}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}

                            {/* Class Schedule if present */}
                            {dayObj.schedule && (
                              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/70 space-y-1 text-left">
                                <div className="flex items-start justify-between gap-1.5">
                                  <span className="font-extrabold text-xs text-blue-950 leading-snug line-clamp-2">
                                    {dayObj.schedule.bab}
                                  </span>
                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                                    Jadwal Kelas
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] font-bold text-slate-600">
                                  <span className="flex items-center gap-1">
                                    <span>⏰</span>
                                    <span>{dayObj.schedule.jam}</span>
                                  </span>
                                  {dayObj.schedule.room && (
                                    <span className="flex items-center gap-1 truncate">
                                      <span>📍</span>
                                      <span className="truncate">
                                        {dayObj.schedule.room}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Mini Sleek Interactive Footer Strip */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] min-h-[26px]">
            {activeInfo ? (
              <div className="flex items-center gap-1.5 text-blue-700 font-extrabold truncate animate-in fade-in duration-150">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                <span className="truncate">{activeInfo.title}</span>
                {activeInfo.time && (
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    ({activeInfo.time})
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between w-full text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  <span className="text-[10px] font-bold text-slate-600">
                    Ada Jadwal
                  </span>
                </span>
                <span className="text-[10px] text-slate-400">
                  Arahkan kursor ke tanggal
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. CLASSES SECTION (GOOGLE CLASSROOM REPLICA MATCHING SCREENSHOT) */}
      <section id="classes" className="space-y-4 pt-2">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl sm:text-2xl font-normal text-slate-800 tracking-tight font-sans">
            Classes
          </h2>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsJoinClassModalOpen(true)}
              title="Create or join a class"
              className="inline-flex items-center gap-1.5 text-[#1967D2] hover:bg-blue-50 px-3.5 py-1.5 rounded-full font-medium text-xs sm:text-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add class</span>
            </button>
          </div>
        </div>

        {/* Classes Grid (Dynamic Cards with Real Teachers from Database) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(classesData && classesData.length > 0
            ? classesData
            : [
                {
                  id: "class_matematika",
                  nama_kelas: "Matematika",
                  nama_guru: "Ibu Rani Kamayasha, S.Pd.",
                  foto_guru: null,
                  banner_color: "#4338CA",
                  banner_pattern: "matematika" as const,
                },
                {
                  id: "class_indonesia",
                  nama_kelas: "Bahasa Indonesia",
                  nama_guru: "Ibu Rani Kamayasha, S.Pd.",
                  foto_guru: null,
                  banner_color: "#047857",
                  banner_pattern: "indonesia" as const,
                },
                {
                  id: "class_inggris",
                  nama_kelas: "Bahasa Inggris",
                  nama_guru: "Ibu Siti Rahmawati, M.Pd.",
                  foto_guru: "/images/foto-guru.jpg",
                  banner_color: "#0284C7",
                  banner_pattern: "inggris" as const,
                },
              ]
          ).map((cls, idx) => {
            const isMenuOpen = openCardMenu === cls.id;
            const nameParts = (cls.nama_guru || "Guru").trim().split(" ");
            const initials =
              nameParts.length >= 2
                ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
                : (nameParts[0][0] || "G").toUpperCase();

            const avatarBgColors = [
              "bg-indigo-600",
              "bg-emerald-600",
              "bg-sky-600",
              "bg-amber-600",
              "bg-teal-600",
            ];
            const avatarBg = avatarBgColors[idx % avatarBgColors.length];

            return (
              <div
                key={cls.id || idx}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative group"
              >
                {/* Header Banner */}
                <div
                  style={{ backgroundColor: cls.banner_color || "#4338CA" }}
                  className="h-34 sm:h-36 relative p-4 flex flex-col justify-between select-none overflow-hidden"
                >
                  {/* Decorative artwork for 3 mapel */}
                  {cls.banner_pattern === "matematika" || cls.nama_kelas.toLowerCase().includes("matematika") ? (
                    <div className="absolute top-2 right-3 opacity-30 pointer-events-none select-none">
                      <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                        <path d="M 50 15 L 25 85" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                        <path d="M 50 15 L 75 85" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="50" cy="15" r="5" fill="#FFFFFF" />
                        <path d="M 35 60 A 20 20 0 0 0 65 60" stroke="#FDE047" strokeWidth="2.5" strokeDasharray="3 3" fill="none" />
                        <text x="43" y="55" fill="#FDE047" fontSize="14" fontWeight="bold">π</text>
                        <path d="M 10 75 Q 40 40 70 85 T 95 30" stroke="#A5B4FC" strokeWidth="1.8" fill="none" />
                      </svg>
                    </div>
                  ) : cls.banner_pattern === "indonesia" || cls.nama_kelas.toLowerCase().includes("indonesia") ? (
                    <div className="absolute top-2 right-3 opacity-30 pointer-events-none select-none">
                      <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                        <path d="M 20 35 C 35 30, 48 33, 50 38 C 52 33, 65 30, 80 35 L 80 75 C 65 70, 52 73, 50 78 C 48 73, 35 70, 20 75 Z" fill="#FFFFFF" opacity="0.8" />
                        <line x1="50" y1="38" x2="50" y2="78" stroke="#065F46" strokeWidth="2" />
                        <path d="M 75 15 C 72 30, 60 45, 52 50 L 53 48 C 58 40, 66 30, 75 15" stroke="#FEF08A" strokeWidth="3" fill="#FEF08A" />
                        <line x1="28" y1="46" x2="44" y2="46" stroke="#065F46" strokeWidth="1.5" />
                        <line x1="28" y1="54" x2="44" y2="54" stroke="#065F46" strokeWidth="1.5" />
                        <line x1="56" y1="46" x2="72" y2="46" stroke="#065F46" strokeWidth="1.5" />
                        <line x1="56" y1="54" x2="72" y2="54" stroke="#065F46" strokeWidth="1.5" />
                      </svg>
                    </div>
                  ) : cls.banner_pattern === "inggris" || cls.nama_kelas.toLowerCase().includes("inggris") ? (
                    <div className="absolute top-2 right-3 opacity-30 pointer-events-none select-none">
                      <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="50" r="32" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
                        <ellipse cx="50" cy="50" rx="16" ry="32" stroke="#FFFFFF" strokeWidth="1.8" fill="none" opacity="0.8" />
                        <line x1="18" y1="50" x2="82" y2="50" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
                        <rect x="52" y="20" width="36" height="24" rx="6" fill="#38BDF8" opacity="0.95" />
                        <polygon points="58,44 54,52 66,44" fill="#38BDF8" opacity="0.95" />
                        <text x="59" y="36" fill="#0C4A6E" fontSize="10" fontWeight="bold">ABC</text>
                      </svg>
                    </div>
                  ) : (
                    <div className="absolute inset-0 opacity-20 pointer-events-none select-none">
                      <svg className="w-full h-full" viewBox="0 0 200 100" fill="none">
                        <circle cx="170" cy="20" r="35" stroke="white" strokeWidth="2" />
                        <path d="M 120 80 C 140 40, 180 40, 200 80" stroke="white" strokeWidth="2" />
                        <rect x="140" y="50" width="25" height="25" rx="4" stroke="white" strokeWidth="1.5" />
                      </svg>
                    </div>
                  )}

                  {/* Title & Real Teacher Name from Database */}
                  <div className="relative z-10 space-y-0.5 max-w-[70%]">
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenClass) onOpenClass(cls.id);
                        else onNavigateToCourses();
                      }}
                      className="text-left font-semibold text-lg sm:text-xl text-white group-hover:underline tracking-tight line-clamp-1 block cursor-pointer"
                    >
                      {cls.nama_kelas}
                    </button>
                    <p className="text-xs text-white/90 font-normal truncate" title={cls.nama_guru}>
                      {cls.nama_guru}
                    </p>
                  </div>

                  {/* Circular Teacher Photo from Database (or Initial Avatar Fallback) */}
                  <div className="absolute -bottom-8 right-4 w-18 h-18 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-200 z-20 flex items-center justify-center">
                    {cls.foto_guru ? (
                      <img
                        src={cls.foto_guru}
                        alt={cls.nama_guru}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className={`w-full h-full ${avatarBg} text-white font-black text-xl flex items-center justify-center select-none shadow-inner`}>
                        {initials}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="pt-9 pb-5 px-4 min-h-[95px] flex flex-col justify-between bg-white" />

                {/* Card Footer with 3 Google Classroom Icons */}
                <div className="border-t border-slate-100 py-2.5 px-4 flex items-center justify-end gap-3 text-slate-500 bg-white relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenClass) onOpenClass(cls.id);
                      else onNavigateToCourses();
                    }}
                    title="Buka tugas Anda untuk kelas ini"
                    className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <circle cx="12" cy="10" r="3" />
                      <path d="M7 17c0-2 2-3 5-3s5 1 5 3" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenClass) onOpenClass(cls.id);
                      else onNavigateToCourses();
                    }}
                    title="Buka folder kelas di Google Drive"
                    className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                  >
                    <Folder className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenCardMenu(isMenuOpen ? null : cls.id);
                    }}
                    title="Opsi Lainnya"
                    className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu (Matching Image 2) */}
                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setOpenCardMenu(null)}
                      />
                      <div className="absolute right-3 bottom-11 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs font-medium text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenCardMenu(null);
                            alert(`Pindahkan urutan kelas: ${cls.nama_kelas}`);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 transition cursor-pointer block"
                        >
                          Move
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenCardMenu(null);
                            alert(`Kelas ${cls.nama_kelas} disembunyikan`);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 transition cursor-pointer block"
                        >
                          Hide
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenCardMenu(null);
                            alert(`Batalkan pendaftaran kelas: ${cls.nama_kelas}`);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 transition cursor-pointer block"
                        >
                          Unenroll
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          type="button"
                          onClick={() => {
                            setOpenCardMenu(null);
                            alert(`Laporkan penyalahgunaan kelas: ${cls.nama_kelas}`);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 transition cursor-pointer block text-slate-700 hover:text-rose-600"
                        >
                          Report abuse
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODAL GABUNG KELAS (+ ADD CLASS MODAL) */}
      {isJoinClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 tracking-tight font-sans">
                Gabung ke Kelas
              </h3>
              <button
                type="button"
                onClick={() => setIsJoinClassModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-900">Masuk sebagai:</div>
                <div className="font-semibold text-blue-700">
                  {studentName} ({studentName.toLowerCase().replace(/\s+/g, ".")}@sekolah.sch.id)
                </div>
                <div className="text-[11px] text-slate-400">
                  Untuk beralih akun, silakan gunakan menu akun profil.
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Kode Kelas
                </label>
                <p className="text-[11px] text-slate-500">
                  Mintalah kode kelas kepada guru pengampu Anda, lalu masukkan di bawah ini.
                </p>
                <input
                  type="text"
                  value={classCodeInput}
                  onChange={(e) => setClassCodeInput(e.target.value)}
                  placeholder="Contoh: sci-8a-2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-mono tracking-wider transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsJoinClassModalOpen(false);
                  setClassCodeInput("");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!classCodeInput.trim()) {
                    alert("Masukkan kode kelas terlebih dahulu!");
                    return;
                  }
                  alert(`Berhasil mengirim permintaan bergabung dengan kode kelas: ${classCodeInput}`);
                  setIsJoinClassModalOpen(false);
                  setClassCodeInput("");
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Gabung
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

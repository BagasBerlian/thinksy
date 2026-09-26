import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import {
  TriangleAlert,
  HelpCircle,
  RefreshCw,
  GraduationCap,
  Globe,
  ExternalLink,
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
  Sparkles,
  X,
  Key,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Search,
} from "lucide-react";
import {
  SekolahData,
  CalendarWeekItem,
  DailyMission,
  ChapterItem,
  PeerStudent,
  AgendaAkademikItem,
  UjianItem,
} from "../../types";

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
  onNavigateToCourses: () => void;
}

export default function TabBelajar({
  studentName,
  currentUserRank,
  namaKelas = "Kelas 8A",
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
  onNavigateToCourses,
}: TabBelajarProps) {
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
  const [selectedCategoryModal, setSelectedCategoryModal] = useState<"ulangan" | "ujian" | null>(null);
  const [selectedExamForToken, setSelectedExamForToken] = useState<UjianItem | null>(null);
  const [inputToken, setInputToken] = useState<string>("");
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
      if (res.ok && (data.valid || data.success)) {
        setTokenSuccess("✅ Password Valid! Membuka ruang ujian...");
        const targetId = data.ujianId || selectedExamForToken.id;
        setTimeout(() => {
          router.push(`/ujian/${targetId}`);
        }, 600);
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
    if (m.includes("seni")) return "bg-purple-100 text-purple-800 border-purple-200";
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

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 space-y-8 pb-16 font-sans">
      {/* 1. SCHOOL BANNER */}
      {!sekolahData ? (
        <section className="relative rounded-3xl overflow-hidden shadow-xl border border-amber-500/30 text-white bg-slate-900 w-full mb-8">
          <div className="absolute inset-0 bg-linear-to-r from-amber-950/40 via-slate-900 to-slate-950 opacity-90" />
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
                    Jika akun Anda belum terdaftar di database sekolah, silakan laporkan kepada <strong>Wali Kelas</strong> atau <strong>Admin Sekolah</strong> Anda untuk penautan akun.
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
              backgroundImage: `url('${
                sekolahData.bg_image_url || "/images/smk-muh-pakem.png"
              }')`,
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/85 to-slate-900/60 backdrop-blur-[1px]" />

          <div className="relative z-10 p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-extrabold uppercase tracking-wider shadow-xs backdrop-blur-md">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Kurikulum Merdeka • Sekolah Pusat Keunggulan & Pesantren Vokasi</span>
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

      {/* 2. TOP GRID: WELCOME CARD (NO STREAK) & ACADEMIC CALENDAR */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* WELCOME CARD (Left 2 cols) */}
        <div className="lg:col-span-2 saas-card p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden bg-white flex flex-col gap-3.5 sm:gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                Selamat Datang Kembali, {studentName.split(" ")[0]}!
              </h2>
              <span className="text-xs font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 tracking-wide">
                Peringkat #{currentUserRank}
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium max-w-xl">
              Pantau jadwal ulangan, modul pembelajaran semester, dan klaim poin dari misi belajarmu hari ini.
            </p>
          </div>

          {/* 3 Metric Cards: Kelas Siswa, Progress Belajar, Poin Belajar (NO DAILY STREAK) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Kelas Siswa */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
                  KELAS SISWA
                </div>
                <div className="text-base font-black text-[#0F172A]">
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

          {/* Quick Resume Card - tightly placed under metric cards */}
          {mathChapters.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-linear-to-r from-blue-50/90 via-slate-50 to-indigo-50/50 border border-blue-100 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
                    Lanjutkan Pembelajaran Terakhir
                  </div>
                  <div className="text-sm font-black text-[#0F172A] line-clamp-1">
                    {mathChapters[0].judul}
                  </div>
                </div>
              </div>
              <Link
                href={`/bab/${mathChapters[0].id}`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition shadow-xs cursor-pointer hover:scale-105 shrink-0"
              >
                <span>Lanjutkan Belajar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* ACADEMIC CALENDAR (Right 1 col) */}
        <div className="lg:col-span-1 p-5 sm:p-6 rounded-3xl bg-white text-slate-900 shadow-xs border border-slate-200 flex flex-col justify-between space-y-3.5 relative">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-black text-[#0F172A] tracking-tight">
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
                                        ? "bg-purple-100 text-purple-800 border border-purple-200"
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

      {/* 3. SECTION "AKU LULUS" (ULANGAN & UJIAN) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Evaluasi & Asesmen Terstandar</span>
            </div>
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
              AKU LULUS
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Akses Ulangan Harian dan Ujian resmi yang telah diaktifkan oleh Guru dengan metode pengerjaan Sokratik terpandu.
            </p>
          </div>

          <Link
            href="/ujian"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>Semua Riwayat Ujian</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: ULANGAN */}
          {(() => {
            const activeCount = allUlanganItems.filter((e) => e.status === "dipublikasi").length;
            const isAnyActive = activeCount > 0;

            return (
              <div
                onClick={isAnyActive ? () => setSelectedCategoryModal("ulangan") : undefined}
                className={`saas-card rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  isAnyActive
                    ? "bg-white border-indigo-200 shadow-sm hover:border-indigo-400 hover:shadow-md cursor-pointer group"
                    : "bg-slate-50/90 border-slate-200/90 text-slate-400 cursor-not-allowed select-none opacity-85"
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shadow-xs transition ${
                          isAnyActive
                            ? "bg-indigo-600 text-white group-hover:scale-105"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {isAnyActive ? <FileText className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="font-black text-base text-[#0F172A] block leading-tight">
                          Ulangan Harian
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Evaluasi Formatif Per Bab
                        </span>
                      </div>
                    </div>

                    {isAnyActive ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase flex items-center gap-1.5 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                        <span>{activeCount} Bab Ulangan Aktif (ON)</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-slate-200/90 border border-slate-300 text-slate-600 text-[10px] font-extrabold uppercase flex items-center gap-1.5 shadow-2xs">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Akses Ditutup (OFF)</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isAnyActive ? (
                      <>
                        Uji pemahaman materi bab dengan metode <strong>Sokratik AI</strong>. Terdapat evaluasi formatif per bab khusus 3 mata pelajaran (Matematika, Bahasa Indonesia, Bahasa Inggris).
                      </>
                    ) : (
                      <span className="text-slate-400 italic">
                        Akses Ulangan Harian saat ini sedang ditutup. Guru atau Admin Sekolah belum mengaktifkan asesmen ini.
                      </span>
                    )}
                  </p>

                  {/* Subject Pills Preview */}
                  <div className="flex items-center flex-wrap gap-2 pt-1">
                    {["Matematika", "Bahasa Indonesia", "Bahasa Inggris"].map((m) => {
                      const items = allUlanganItems.filter((e) =>
                        e.mapel?.toLowerCase().includes(m.toLowerCase())
                      );
                      const isItemOpen = items.some((e) => e.status === "dipublikasi");

                      return (
                        <span
                          key={m}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                            isItemOpen
                              ? "bg-indigo-50/80 border-indigo-200 text-indigo-800"
                              : "bg-slate-100 border-slate-200 text-slate-400"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isItemOpen ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          <span>
                            {m} ({items.length} Bab)
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Button */}
                {isAnyActive ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategoryModal("ulangan");
                    }}
                    className="w-full py-3 rounded-2xl bg-indigo-600 group-hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <PlayCircle className="w-4 h-4 text-amber-300" />
                    <span>Pilih Ulangan Harian Per Bab</span>
                    <ChevronRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 rounded-2xl bg-slate-200 border border-slate-300 text-slate-500 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed select-none"
                    title="Akses Ulangan Harian belum diaktifkan oleh Guru atau Admin Sekolah"
                  >
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>Akses Terkunci (Menunggu Guru/Admin)</span>
                  </button>
                )}
              </div>
            );
          })()}

          {/* Card 2: UJIAN RESMI (PTS) */}
          {(() => {
            const activeCount = ujianList.filter((e) => e.status === "dipublikasi").length;
            const isAnyActive = activeCount > 0;

            return (
              <div
                onClick={isAnyActive ? () => setSelectedCategoryModal("ujian") : undefined}
                className={`saas-card rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  isAnyActive
                    ? "bg-white border-blue-200 shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer group"
                    : "bg-slate-50/90 border-slate-200/90 text-slate-400 cursor-not-allowed select-none opacity-85"
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shadow-xs transition ${
                          isAnyActive
                            ? "bg-[#0F172A] text-white group-hover:scale-105"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {isAnyActive ? <Clock className="w-5 h-5 text-amber-400" /> : <Lock className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="font-black text-base text-[#0F172A] block leading-tight">
                          Ujian Resmi (PTS)
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Asesmen Sumatif Terstandar
                        </span>
                      </div>
                    </div>

                    {isAnyActive ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase flex items-center gap-1.5 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                        <span>{activeCount} Mapel Aktif (ON)</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-slate-200/90 border border-slate-300 text-slate-600 text-[10px] font-extrabold uppercase flex items-center gap-1.5 shadow-2xs">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Akses Ditutup (OFF)</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isAnyActive ? (
                      <>
                        Asesmen resmi terjadwal dengan alokasi waktu presisi. Wajib memasukkan <strong>Kode Token Guru</strong> sebelum memulai soal.
                      </>
                    ) : (
                      <span className="text-slate-400 italic">
                        Akses Ujian Resmi saat ini sedang ditutup. Guru atau Admin Sekolah belum mengaktifkan asesmen ini.
                      </span>
                    )}
                  </p>

                  {/* Subject Pills Preview */}
                  <div className="flex items-center flex-wrap gap-2 pt-1">
                    {["Matematika", "Bahasa Indonesia", "Bahasa Inggris"].map((m) => {
                      const item = ujianList.find((e) => e.mapel === m);
                      const isItemOpen = item?.status === "dipublikasi";

                      return (
                        <span
                          key={m}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                            isItemOpen
                              ? "bg-blue-50/80 border-blue-200 text-blue-800"
                              : "bg-slate-100 border-slate-200 text-slate-400"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isItemOpen ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          <span>{m}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Button */}
                {isAnyActive ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategoryModal("ujian");
                    }}
                    className="w-full py-3 rounded-2xl bg-[#0F172A] group-hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <PlayCircle className="w-4 h-4 text-amber-400" />
                    <span>Pilih Mata Pelajaran Ujian PTS</span>
                    <ChevronRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 rounded-2xl bg-slate-200 border border-slate-300 text-slate-500 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed select-none"
                    title="Akses Ujian Resmi belum diaktifkan oleh Guru atau Admin Sekolah"
                  >
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>Akses Terkunci (Menunggu Guru/Admin)</span>
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      </section>

      {/* 4. SECTION "KELAS AKTIF" (3 CORE SUBJECTS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Kelas Aktif</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              3 Mata Pelajaran Utama Kelas 8. Klik kartu untuk langsung masuk ke materi dan bab di tab Belajar.
            </p>
          </div>
          <Link
            href="/belajar"
            className="px-4 py-2 rounded-xl bg-[#0F172A] text-white hover:bg-slate-800 text-xs font-bold transition cursor-pointer shadow-xs"
          >
            Buka Halaman Belajar
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: MATEMATIKA */}
          <Link
            href={`/belajar?mapel=Matematika${mathChapters[0]?.id ? `&babId=${mathChapters[0].id}` : ""}`}
            className="saas-card saas-card-hover rounded-3xl p-6 border border-slate-200 hover:border-blue-400 flex flex-col justify-between space-y-5 shadow-xs hover:shadow-md group bg-white cursor-pointer transition-all duration-200"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-700 uppercase tracking-wider">
                  6 Bab • 2 Semester
                </span>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mata Pelajaran Wajib
                </div>
                <h3 className="text-lg font-black text-[#0F172A] group-hover:text-blue-600 transition">
                  Matematika
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Guru: <strong>Ibu Siti Rahmawati, M.Pd.</strong>
                </p>
                <div className="mt-2 text-xs text-slate-500 font-medium">
                  Materi Terakhir:{" "}
                  <span className="text-[#0F172A] font-bold">
                    {mathChapters[0]?.judul || "Bab 1: Bilangan Berpangkat"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                Ulangan Harian 1 Aktif
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 group-hover:translate-x-1 transition">
                <span>Buka Belajar Bab</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          {/* Card 2: BAHASA INGGRIS */}
          <Link
            href={`/belajar?mapel=Bahasa%20Inggris${englishChapters[0]?.id ? `&babId=${englishChapters[0].id}` : ""}`}
            className="saas-card saas-card-hover rounded-3xl p-6 border border-slate-200 hover:border-indigo-400 flex flex-col justify-between space-y-5 shadow-xs hover:shadow-md group bg-white cursor-pointer transition-all duration-200"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                  6 Bab • 2 Semester
                </span>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mata Pelajaran Wajib
                </div>
                <h3 className="text-lg font-black text-[#0F172A] group-hover:text-indigo-600 transition">
                  Bahasa Inggris
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Guru: <strong>Budi Santoso, S.Pd.</strong>
                </p>
                <div className="mt-2 text-xs text-slate-500 font-medium">
                  Materi Terakhir:{" "}
                  <span className="text-[#0F172A] font-bold">
                    {englishChapters[0]?.judul || "Bab 1: Congratulation and Compliment"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                PTS Ganjil Tersedia
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 group-hover:translate-x-1 transition">
                <span>Buka Belajar Bab</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          {/* Card 3: BAHASA INDONESIA */}
          <Link
            href={`/belajar?mapel=Bahasa%20Indonesia${indonesianChapters[0]?.id ? `&babId=${indonesianChapters[0].id}` : ""}`}
            className="saas-card saas-card-hover rounded-3xl p-6 border border-slate-200 hover:border-emerald-400 flex flex-col justify-between space-y-5 shadow-xs hover:shadow-md group bg-white cursor-pointer transition-all duration-200"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                  6 Bab • 2 Semester
                </span>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mata Pelajaran Wajib
                </div>
                <h3 className="text-lg font-black text-[#0F172A] group-hover:text-emerald-600 transition">
                  Bahasa Indonesia
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Guru: <strong>Dra. Nurul Hidayah</strong>
                </p>
                <div className="mt-2 text-xs text-slate-500 font-medium">
                  Materi Terakhir:{" "}
                  <span className="text-[#0F172A] font-bold">
                    {indonesianChapters[0]?.judul || "Bab 1: Menulis Teks LHO"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                Tugas Proyek LHO
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 group-hover:translate-x-1 transition">
                <span>Buka Belajar Bab</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. MISI HARIAN SISWA (WITH REWARDS & AUTO-CLAIM) */}
      <section className="saas-card rounded-3xl p-6 border border-slate-200 shadow-sm bg-white space-y-5">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Misi Harian Siswa
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Selesaikan tantangan harian untuk mengklaim reward poin. Misi otomatis terklaim dalam 24 jam.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Server-Timed Quests</span>
          </div>
        </div>

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
              <span>Belum ada misi harian yang aktif hari ini.</span>
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
                  className={`group relative rounded-3xl border p-5 transition-all duration-300 flex flex-col justify-between space-y-4 overflow-hidden ${
                    isClaimed
                      ? "bg-emerald-50/40 border-emerald-200 shadow-xs"
                      : isCompleted
                      ? "bg-amber-50/50 border-amber-300 shadow-md shadow-amber-500/10 ring-1 ring-amber-300"
                      : "bg-white hover:bg-slate-50/60 border-slate-200 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-amber-950 transition-colors leading-snug">
                        {(misi as any).judul || (misi as any).title}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                        +{(misi as any).poin_hadiah || (misi as any).rewardPoints || 20} Poin
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {(misi as any).deskripsi || "Selesaikan target aktivitas belajar ini hari ini."}
                    </p>
                  </div>

                  <div className="pt-2">
                    {isClaimed ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-2xl bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center gap-1.5 cursor-not-allowed border border-emerald-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Sudah Diklaim</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onClaimMission(misi.id)}
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
                        <span>{isCompleted ? "Klaim Reward" : "Kerjakan"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 6. NORMAL SCREEN VIEW: PEMILIHAN ASESMEN (AKU LULUS) */}
      {selectedCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-y-auto animate-in fade-in duration-150 text-slate-900 font-sans">
          {/* Top Sticky Header */}
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs shrink-0">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryModal(null);
                    setSearchUlanganQuery("");
                    setSelectedUlanganMapel("Semua");
                  }}
                  className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer font-bold text-xs shrink-0"
                  title="Kembali ke Beranda"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Kembali ke Beranda</span>
                </button>
                <div className="h-5 w-px bg-slate-200 hidden sm:block" />
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black shadow-xs shrink-0 ${
                      selectedCategoryModal === "ulangan"
                        ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                        : "bg-sky-50 text-sky-600 border border-sky-200"
                    }`}
                  >
                    {selectedCategoryModal === "ulangan" ? (
                      <FileText className="w-4.5 h-4.5" />
                    ) : (
                      <Clock className="w-4.5 h-4.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {selectedCategoryModal === "ulangan"
                          ? "Asesmen Formatif Per Bab"
                          : "Asesmen Sumatif Terstandar"}
                      </span>
                      <span className="text-xs font-bold text-slate-400 hidden md:inline">
                        Tingkat Kelas 8 • Fase D
                      </span>
                    </div>
                    <h2 className="text-sm sm:text-base font-black text-[#0F172A] truncate">
                      {selectedCategoryModal === "ulangan"
                        ? "Daftar Ulangan Harian Per Bab"
                        : "Daftar Ujian Resmi (PTS)"}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryModal(null);
                    setSearchUlanganQuery("");
                    setSelectedUlanganMapel("Semua");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Tutup Halaman</span>
                </button>
              </div>
            </div>
          </header>

          {/* Normal Screen Body Container */}
          <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
            {/* Header Hero Banner */}
            <div className="saas-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Top Accent Gradient Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

              <div className="space-y-2 max-w-2xl pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {selectedCategoryModal === "ulangan"
                      ? "Evaluasi Formatif Per Bab • Sokratik AI"
                      : "Evaluasi Sumatif Terstandar • Sokratik AI"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  {selectedCategoryModal === "ulangan"
                    ? "Pilih Mata Pelajaran — Ulangan Harian Per Bab"
                    : "Pilih Mata Pelajaran — Ujian Resmi (PTS)"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {selectedCategoryModal === "ulangan"
                    ? "Daftar ulangan formatif per bab untuk 3 mata pelajaran (Matematika, Bahasa Indonesia, Bahasa Inggris) dengan bimbingan Sokratik AI. Pilih bab dan masukkan token dari Guru."
                    : "Pengerjaan asesmen resmi bersifat Sokratik AI. Pilih mata pelajaran aktif di bawah ini dan masukkan token dari Guru untuk mulai mengerjakan."}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                      selectedCategoryModal === "ulangan"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {selectedCategoryModal === "ulangan" ? (
                      <FileText className="w-6 h-6" />
                    ) : (
                      <Clock className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#0F172A]">
                      {selectedCategoryModal === "ulangan"
                        ? `${allUlanganItems.length} Bab Ulangan`
                        : "3 Mata Pelajaran"}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Tingkat Kelas 8 SMP
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Body - preserved exactly */}
            {selectedCategoryModal === "ujian" ? (
              /* KHUSUS UJIAN: HANYA MEMUNCULKAN 3 MAPEL */
              <div className="space-y-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                  MATA PELAJARAN UJIAN RESMI TERSEDIA
                </div>
                <div className="space-y-3.5">
                  {["Matematika", "Bahasa Indonesia", "Bahasa Inggris"].map((m) => {
                    const exam =
                      ujianList.find((e) =>
                        e.mapel?.toLowerCase().includes(m.toLowerCase())
                      ) || null;
                    const isOpen = exam?.status === "dipublikasi";
                    const isCompleted = exam?.sessionStatus === "selesai";

                    return (
                      <div
                        key={m}
                        onClick={
                          isOpen && exam && !isCompleted
                            ? () => {
                                handleOpenTokenModal(exam);
                              }
                            : undefined
                        }
                        className={`saas-card rounded-2xl p-5 sm:p-6 border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isOpen
                            ? "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer group"
                            : "bg-slate-50/70 border-slate-200/80 opacity-80 cursor-not-allowed select-none"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center flex-wrap gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${getMapelBadgeStyle(
                                m
                              )}`}
                            >
                              {m}
                            </span>

                            {isOpen ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                <span>Akses Terbuka (ON)</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold uppercase flex items-center gap-1">
                                <Lock className="w-3 h-3 text-slate-500" />
                                <span>Akses Ditutup (OFF)</span>
                              </span>
                            )}

                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Sokratik AI
                            </span>
                          </div>

                          <h4 className="text-base font-extrabold text-[#0F172A] group-hover:text-indigo-600 transition">
                            {exam?.judul || `Penilaian Tengah Semester (PTS) ${m}`}
                          </h4>

                          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {exam?.durasi_menit || 90} Menit (Diatur Guru)
                            </span>
                            <span>•</span>
                            <span>KKM: {exam?.passing_grade || 75}</span>
                            {exam?.score !== null && exam?.score !== undefined && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700 font-black">
                                  Nilai Anda: {exam.score}/100
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="sm:shrink-0">
                          {isCompleted ? (
                            <Link
                              href={`/ujian/${exam?.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <Award className="w-4 h-4 text-emerald-600" />
                              <span>Lihat Hasil Ujian</span>
                            </Link>
                          ) : isOpen && exam ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTokenModal(exam);
                              }}
                              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                            >
                              <Key className="w-4 h-4 text-amber-300" />
                              <span>Masukkan Token & Kerjakan</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
                              title="Guru sedang menutup akses untuk mata pelajaran ini"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Ditutup oleh Guru</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* KHUSUS ULANGAN: MACAM-MACAM LIST PER BAB SERTA TERTERA MAPELNYA */
              <div className="space-y-4">
                {/* Controls: Filter Pills & Search */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  {/* Mapel Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {ulanganMapels.map((m) => {
                      const count =
                        m === "Semua"
                          ? allUlanganItems.length
                          : allUlanganItems.filter(
                              (u) => u.mapel?.toLowerCase() === m.toLowerCase()
                            ).length;
                      const isSelected = selectedUlanganMapel === m;

                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSelectedUlanganMapel(m)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 flex items-center gap-2 border ${
                            isSelected
                              ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                              : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200"
                          }`}
                        >
                          <span>{m}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchUlanganQuery}
                      onChange={(e) => setSearchUlanganQuery(e.target.value)}
                      placeholder="Cari judul bab, materi, atau mata pelajaran ulangan..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                    {searchUlanganQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchUlanganQuery("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* List of Ulangan Per Bab */}
                <div className="space-y-3.5">
                  {filteredUlanganList.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2 shadow-xs">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">
                        Tidak ada ulangan harian yang cocok dengan pencarian Anda.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUlanganMapel("Semua");
                          setSearchUlanganQuery("");
                        }}
                        className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    </div>
                  ) : (
                    filteredUlanganList.map((exam) => {
                      const isOpen = exam.status === "dipublikasi";
                      const isCompleted = exam.sessionStatus === "selesai";

                      return (
                        <div
                          key={exam.id}
                          onClick={
                            isOpen && !isCompleted
                              ? () => {
                                  handleOpenTokenModal(exam);
                                }
                              : undefined
                          }
                          className={`saas-card rounded-2xl p-5 sm:p-6 border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isOpen
                              ? "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer group"
                              : "bg-slate-50/70 border-slate-200/80 opacity-80 cursor-not-allowed select-none"
                          }`}
                        >
                          <div className="space-y-2">
                            {/* Badges: Mapel & Status */}
                            <div className="flex items-center flex-wrap gap-2">
                              {/* TERTERA MAPELNYA SECARA JELAS */}
                              <span
                                className={`px-2.5 py-0.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${getMapelBadgeStyle(
                                  exam.mapel
                                )}`}
                              >
                                {exam.mapel}
                              </span>

                              {isOpen ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                  <span>Akses Terbuka (ON)</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold uppercase flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-slate-500" />
                                  <span>Akses Ditutup (OFF)</span>
                                </span>
                              )}

                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Sokratik AI
                              </span>
                            </div>

                            {/* Judul Ulangan Per Bab */}
                            <h4 className="text-sm sm:text-base font-extrabold text-[#0F172A] group-hover:text-indigo-600 transition leading-snug">
                              {exam.judul}
                            </h4>

                            {/* Info durasi, KKM & nilai */}
                            <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 font-medium">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {exam.durasi_menit || 30} Menit (Diatur Guru)
                              </span>
                              <span>•</span>
                              <span>KKM: {exam.passing_grade || 75}</span>
                              {exam.score !== null && exam.score !== undefined && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-black">
                                    Nilai Anda: {exam.score}/100
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Tombol Aksi */}
                          <div className="sm:shrink-0">
                            {isCompleted ? (
                              <Link
                                href={`/ujian/${exam.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
                              >
                                <Award className="w-4 h-4 text-emerald-600" />
                                <span>Lihat Hasil & Pembahasan</span>
                              </Link>
                            ) : isOpen ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenTokenModal(exam);
                                }}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-xs whitespace-nowrap"
                              >
                                <Key className="w-4 h-4 text-amber-300" />
                                <span>Masukkan Token & Kerjakan</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed select-none whitespace-nowrap"
                                title="Guru sedang menutup akses untuk ulangan bab ini"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Ditutup oleh Guru</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 pb-8">
              <span className="text-xs text-slate-400">
                Hubungi Guru pengampu jika asesmen yang ingin Anda kerjakan belum dibuka.
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryModal(null);
                  setSearchUlanganQuery("");
                  setSelectedUlanganMapel("Semua");
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-white transition cursor-pointer shadow-2xs"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL INTERAKTIF: INPUT & VERIFIKASI TOKEN GURU */}
      {selectedExamForToken && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 space-y-5 relative">
            {/* Top Gold Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-600" />

            <button
              type="button"
              onClick={() => setSelectedExamForToken(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Autentikasi Ujian • {selectedExamForToken.mapel}
                </span>
                <h3 className="text-lg font-black text-[#0F172A] leading-tight">
                  Masukkan Token Ujian
                </h3>
              </div>
            </div>

            {/* Exam Details Pill */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="font-extrabold text-[#0F172A]">
                {selectedExamForToken.judul}
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-medium text-[11px]">
                <span>⏱️ Durasi: {selectedExamForToken.durasi_menit} Menit</span>
                <span>•</span>
                <span className="text-indigo-600 font-bold">Model Sokratik AI</span>
              </div>
            </div>

            {/* Information Notice */}
            <p className="text-xs text-slate-500 leading-relaxed">
              Gunakan password sementara resmi: <strong className="text-slate-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">12345</strong>. Setelah token berhasil diverifikasi, Anda akan langsung diarahkan ke lembar ujian.
            </p>

            {/* Token Form */}
            <form onSubmit={handleVerifyTokenAndStart} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#0F172A] uppercase tracking-wider block">
                  Password / Kode Token Masuk:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                    placeholder="PASSWORD: 12345"
                    className="w-full px-4 py-3 text-center text-lg font-mono font-black tracking-widest uppercase rounded-2xl border-2 border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 bg-white transition outline-none"
                    autoFocus
                    required
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Error Message */}
              {tokenError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{tokenError}</span>
                </div>
              )}

              {/* Success Message */}
              {tokenSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{tokenSuccess}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedExamForToken(null)}
                  disabled={isVerifyingToken}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingToken || !inputToken.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-xs"
                >
                  {isVerifyingToken ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <span>Verifikasi & Mulai Ujian</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

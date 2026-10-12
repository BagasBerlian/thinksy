"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  Globe,
  ArrowLeft,
  GraduationCap,
  Clock,
  Award,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

interface RuangUjianSubjectsViewProps {
  examsData?: any[];
  userProfile?: {
    nama_lengkap?: string;
    nama_kelas?: string;
    tingkat_kelas?: number;
    nisn?: string | null;
  };
  onBackToHome: () => void;
  onSelectExamTab?: (tab: "ulangan" | "ujian") => void;
}

interface OfficialExamSubject {
  id: string;
  key: "matematika" | "indonesia" | "inggris";
  name: string;
  code: string;
  curriculum: string;
  desc: string;
  durasi: number;
  kkm: number;
  totalSoal: number;
  icon: typeof BookOpen;
  defaultToken: string;
  badgeColor: string;
  accentBorder: string;
}

// Requirement 3: EXACTLY 3 Mapel (Matematika, Bahasa Indonesia, Bahasa Inggris)
const OFFICIAL_EXAM_SUBJECTS: OfficialExamSubject[] = [
  {
    id: "e5eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
    key: "matematika",
    name: "Matematika",
    code: "MTK-PTS8",
    curriculum: "Kurikulum Merdeka • Fase D",
    desc: "Asesmen sumatif resmi mata pelajaran Matematika mencakup Aljabar, Teorema Pythagoras, dan Relasi Fungsi.",
    durasi: 90,
    kkm: 75,
    totalSoal: 35,
    icon: BookOpen,
    defaultToken: "MTK-PTS26",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    accentBorder: "hover:border-blue-300",
  },
  {
    id: "e6eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
    key: "indonesia",
    name: "Bahasa Indonesia",
    code: "BIN-PTS8",
    curriculum: "Kurikulum Merdeka • Fase D",
    desc: "Asesmen sumatif resmi mata pelajaran Bahasa Indonesia mencakup Teks LHO, Analisis Wacana Kritis, Puisi Rakyat, dan Kebahasaan.",
    durasi: 90,
    kkm: 75,
    totalSoal: 40,
    icon: FileText,
    defaultToken: "IND-PTS26",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    accentBorder: "hover:border-emerald-300",
  },
  {
    id: "e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    key: "inggris",
    name: "Bahasa Inggris",
    code: "ENG-PTS8",
    curriculum: "Kurikulum Merdeka • Fase D",
    desc: "Asesmen sumatif resmi mata pelajaran Bahasa Inggris mencakup Reading Comprehension, Functional Text, Grammar, and Vocabulary.",
    durasi: 90,
    kkm: 75,
    totalSoal: 40,
    icon: Globe,
    defaultToken: "ENG-PTS26",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    accentBorder: "hover:border-purple-300",
  },
];

export default function RuangUjianSubjectsView({
  examsData = [],
  userProfile,
  onBackToHome,
  onSelectExamTab,
}: RuangUjianSubjectsViewProps) {
  const router = useRouter();

  // Selected subject for Token Modal
  const [selectedSubject, setSelectedSubject] = useState<OfficialExamSubject | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenTokenModal = (subj: OfficialExamSubject) => {
    setSelectedSubject(subj);
    setTokenInput("");
    setErrorMessage(null);
    setShowPassword(false);
  };

  const handleCloseModal = () => {
    if (isVerifying) return;
    setSelectedSubject(null);
    setTokenInput("");
    setErrorMessage(null);
  };

  const handleVerifyAndStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;

    const trimmed = tokenInput.trim();
    if (!trimmed) {
      setErrorMessage("Silakan masukkan kode token ujian terlebih dahulu.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      // Find matching exam from examsData if available, otherwise use subject id
      const matchedExam = examsData.find(
        (ex) =>
          ex.mapel?.toLowerCase().includes(selectedSubject.name.toLowerCase()) ||
          ex.id === selectedSubject.id
      );

      const targetId = matchedExam?.id || selectedSubject.id;

      // Verify token via API
      const res = await fetch("/api/siswa/ujian/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ujianId: targetId,
          token: trimmed,
          judul: matchedExam?.judul || `Ujian Sumatif ${selectedSubject.name}`,
          mapel: selectedSubject.name,
        }),
      });

      const data = await res.json();

      if (res.ok && (data.valid || data.success || trimmed.toUpperCase() === "12345" || trimmed.toUpperCase() === selectedSubject.defaultToken)) {
        // Request fullscreen for CBT standard
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        const finalUjianId = data.ujianId || targetId;
        router.push(`/ujian/${finalUjianId}?start=true`);
      } else {
        setErrorMessage(
          data.error ||
            `Kode token tidak valid. Hubungi pengawas ruang atau gunakan token default: ${selectedSubject.defaultToken} atau 12345.`
        );
        setIsVerifying(false);
      }
    } catch (err) {
      if (trimmed.toUpperCase() === "12345" || trimmed.toUpperCase() === selectedSubject.defaultToken) {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        router.push(`/ujian/${selectedSubject.id}?start=true`);
        return;
      }
      setErrorMessage("Koneksi gagal. Pastikan jaringan internet aktif.");
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 font-sans">
      {/* 1. Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button
            onClick={onBackToHome}
            className="hover:text-blue-600 transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <span>/</span>
          <span>Ruang Ujian</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">Ujian Resmi (PTS / PAS)</span>
        </div>

        {onSelectExamTab && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Pindah ke:</span>
            <button
              onClick={() => onSelectExamTab("ulangan")}
              className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              ← Ulangan Harian Per Bab
            </button>
          </div>
        )}
      </div>

      {/* 2. Professional Header Banner (Clean Solid Educational Styling - No AI Gradients) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold">
              PENILAIAN SUMATIF RESMI SEKOLAH
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium">
              Tahun Ajaran 2026/2027
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium">
              Kelas {userProfile?.tingkat_kelas || 8} ({userProfile?.nama_kelas || "Kelas 8"})
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Ruang Ujian Resmi Siswa
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-normal mt-0.5">
                Pilih mata pelajaran yang akan diujikan di bawah ini, masukkan kode token resmi dari pengawas ruang, lalu mulai pengerjaan ujian.
              </p>
            </div>
          </div>

          {/* Security & Standard Rules Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Waktu Terpantau Server</span>
            </div>
            <div className="flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Akses Token Pengawas Ruang</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>CBT Mode (Layar Penuh Otomatis)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section Title & Guidance */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
            Daftar Mata Pelajaran Ujian Resmi (3 Mapel)
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            Klik tombol mata pelajaran untuk memasukkan token dan membuka lembar soal ujian.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          3 Mapel Aktif
        </span>
      </div>

      {/* 4. EXACTLY 3 SUBJECT CARDS (Matematika, Bahasa Indonesia, Bahasa Inggris) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {OFFICIAL_EXAM_SUBJECTS.map((subj) => {
          const Icon = subj.icon;
          return (
            <div
              key={subj.key}
              className={`bg-white rounded-3xl border border-slate-200/90 shadow-2xs ${subj.accentBorder} transition-all duration-200 p-6 flex flex-col justify-between space-y-5 hover:shadow-md group`}
            >
              <div className="space-y-4">
                {/* Subject Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <Icon className="w-6 h-6 text-slate-700" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${subj.badgeColor}`}>
                    {subj.code}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition">
                    {subj.name}
                  </h3>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    {subj.curriculum}
                  </div>
                  <p className="text-xs text-slate-600 font-normal mt-2 leading-relaxed line-clamp-3">
                    {subj.desc}
                  </p>
                </div>

                {/* Exam Parameters */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500">Durasi Ujian:</span>
                    <strong className="font-bold text-slate-900">{subj.durasi} Menit</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500">Passing Grade:</span>
                    <strong className="font-bold text-emerald-700">KKM {subj.kkm}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500">Alokasi Soal:</span>
                    <strong className="font-bold text-slate-900">{subj.totalSoal} Soal</strong>
                  </div>
                </div>
              </div>

              {/* Action Button: Opens Token Modal directly */}
              <button
                type="button"
                onClick={() => handleOpenTokenModal(subj)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-2 group-hover:bg-blue-600"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-300" />
                <span>Mulai Ujian {subj.name}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* 5. Clean Modal Dialog for Token Input */}
      {selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold shrink-0">
                  <KeyRound className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Token Ujian {selectedSubject.name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {selectedSubject.code} • KKM {selectedSubject.kkm}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isVerifying}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student & Exam Info Strip */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Peserta:</span>
                <strong className="text-slate-900">{userProfile?.nama_lengkap || "Siswa"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kelas:</span>
                <strong className="text-slate-900">{userProfile?.nama_kelas || "Kelas 8"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <strong className="text-slate-900">{selectedSubject.durasi} Menit</strong>
              </div>
            </div>

            {/* Token Input Form */}
            <form onSubmit={handleVerifyAndStartExam} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kode Token / Password Ujian
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={tokenInput}
                    onChange={(e) => {
                      setTokenInput(e.target.value.toUpperCase());
                      setErrorMessage(null);
                    }}
                    placeholder={`Masukkan token (contoh: ${selectedSubject.defaultToken})`}
                    disabled={isVerifying}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-mono text-center font-bold tracking-widest text-sm transition text-slate-900"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  Minta kode token resmi dari Pengawas Ruang (Token simulasi:{" "}
                  <code className="font-mono font-bold text-blue-600">{selectedSubject.defaultToken}</code> atau{" "}
                  <code className="font-mono font-bold text-blue-600">12345</code>).
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isVerifying}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || !tokenInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <span>Mulai Ujian Sekarang</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

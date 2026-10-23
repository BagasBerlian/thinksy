"use client";

import { useState, useRef, useTransition } from "react";
import { registerAction } from "../actions";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  School,
  MapPin,
  Calendar,
  CreditCard,
  Camera,
  Upload,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  saveStoredStudentProfile,
  saveStoredStudentPhoto,
  DEFAULT_STUDENT_PHOTO,
  FEMALE_STUDENT_PHOTO,
} from "@/lib/student-settings";

// Data Wali Kelas otomatis berdasarkan pilihan kelas
const KELAS_OPTIONS = [
  {
    id: "Kelas 8A",
    label: "Kelas 8A (Unggulan)",
    waliKelas: "Ibu Siti Rahmawati, M.Pd.",
    ruang: "Lab Matematika & Komputer 1",
  },
  {
    id: "Kelas 8B",
    label: "Kelas 8B (Reguler)",
    waliKelas: "Bapak Budi Santoso, S.Pd.",
    ruang: "Gedung Teori Lantai 2",
  },
  {
    id: "Kelas 8C",
    label: "Kelas 8C (Reguler)",
    waliKelas: "Dra. Nurul Hidayah",
    ruang: "Gedung Teori Lantai 2",
  },
];

// Opsi Preset Foto Siswa
const PRESET_AVATARS = [
  {
    id: "siswa-1",
    label: "Siswa Putra",
    sublabel: "Seragam Resmi",
    src: DEFAULT_STUDENT_PHOTO,
  },
  {
    id: "siswi-1",
    label: "Siswi Putri",
    sublabel: "Hijab Rapi",
    src: FEMALE_STUDENT_PHOTO,
  },
  {
    id: "avatar-ai",
    label: "Pelajar AI",
    sublabel: "Digital Avatar",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
];

export default function DaftarPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Step state: 1 = Form Pendaftaran, 2 = Pembuatan Profile Foto
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields State
  const [namaLengkap, setNamaLengkap] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [namaKelas, setNamaKelas] = useState("Kelas 8A");
  const [nisn, setNisn] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Foto Profil State
  const [selectedPhoto, setSelectedPhoto] = useState<string>(DEFAULT_STUDENT_PHOTO);
  const [customPhotoPreview, setCustomPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handler validasi Step 1 dan lanjut ke Step 2 (Pembuatan Foto Siswa)
  const handleProceedToPhotoStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!namaLengkap.trim() || namaLengkap.trim().length < 3) {
      setErrorMessage("Nama lengkap minimal 3 karakter.");
      return;
    }

    if (!tempatLahir.trim() || !tanggalLahir) {
      setErrorMessage("Tempat dan tanggal lahir wajib dilengkapi.");
      return;
    }

    if (!nisn.trim()) {
      setErrorMessage("NISN wajib diisi.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Alamat email tidak valid.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Kata sandi minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    // Lanjut ke Step 2 (Pembuatan Profile Foto)
    setStep(2);
    // Scroll right container to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handler upload foto custom dari perangkat
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setErrorMessage("Ukuran foto maksimal 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCustomPhotoPreview(base64String);
        setSelectedPhoto(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler Final Submit Pendaftaran
  const handleFinalSubmit = async () => {
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("nama_lengkap", namaLengkap.trim());
    formData.append("email", email.trim());
    formData.append("password", password);
    formData.append("tempat_lahir", tempatLahir.trim());
    formData.append("tanggal_lahir", tanggalLahir);
    formData.append("nama_kelas", namaKelas);
    formData.append("nisn", nisn.trim());
    formData.append("foto_url", selectedPhoto);
    formData.append("asal_sekolah", "SMK Muhammadiyah 1");

    startTransition(async () => {
      try {
        const res = await registerAction(null, formData);

        if (res?.error) {
          setErrorMessage(res.error);
          return;
        }

        // Simpan ke local storage agar profil siswa langsung aktif & terisi
        saveStoredStudentProfile({
          nama_lengkap: namaLengkap.trim(),
          nama_kelas: namaKelas,
          nis: nisn.slice(-6) || "260481",
          nisn: nisn.trim(),
          jurusan: "Fase D (Kurikulum Merdeka)",
          tempat_tgl_lahir: `${tempatLahir.trim()}, ${tanggalLahir}`,
          jenis_kelamin: selectedPhoto === FEMALE_STUDENT_PHOTO ? "Perempuan" : "Laki-laki",
          agama: "Islam",
          tahun_ajaran: "2026/2027",
          foto_url: selectedPhoto,
        });
        saveStoredStudentPhoto(selectedPhoto);

        if (res?.success) {
          setSuccessMessage(
            res.message || "Pendaftaran akun siswa berhasil! Mengalihkan ke dashboard..."
          );
          setTimeout(() => {
            router.push("/");
          }, 1200);
        }
      } catch (err: any) {
        console.error("Gagal mendaftar:", err);
        setErrorMessage("Terjadi kesalahan sistem saat mendaftar. Silakan coba lagi.");
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#081220] font-sans antialiased text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* ======================================================== */}
      {/* SISI KIRI: BRANDING & 3D HERO VISUAL PALLETE THINKSY     */}
      {/* ======================================================== */}
      <div className="lg:w-1/2 min-h-full relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-[#0B1A2E] via-[#0D2342] to-[#071324] text-white overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
        {/* Ambient Radial Glowing Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#1E3A8A_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        {/* Header Logo Thinksy (Hanya logo dan tulisan Thinksy) */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 shadow-xl shadow-blue-900/30 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Thinksy Logo"
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white font-sans">
            Thinksy
          </span>
        </div>

        {/* Centerpiece Hero 3D Illustration & Headlines */}
        <div className="relative z-10 my-auto py-8 sm:py-12 flex flex-col items-center text-center max-w-lg mx-auto">
          {/* Container Gambar 3D Hero */}
          <div className="relative w-full max-w-[340px] sm:max-w-[400px] aspect-[4/3] mb-8 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(8,20,40,0.6)] border border-white/10 group">
            <img
              src="/images/thinksy-hero.jpg"
              alt="Mulai Perjalanan Belajarmu - Thinksy"
              className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
            />
            {/* Soft inner glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A2E]/80 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
            Mulai Perjalanan Belajarmu
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed font-normal max-w-md">
            Bergabunglah dengan ribuan siswa yang telah sukses meraih prestasi dan menguasai matematika bersama ekosistem cerdas Thinksy.
          </p>
        </div>

        {/* Footer Sisi Kiri */}
        <div className="relative z-10 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 border-t border-white/10">
          <span>&copy; {new Date().getFullYear()} Thinksy Education. Hak Cipta Dilindungi.</span>
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span className="hover:text-white cursor-pointer transition-colors">Bantuan</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privasi</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Syarat Ketentuan</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SISI KANAN: FORM PENDAFTARAN SCROLLABLE & DIPERBESAR     */}
      {/* ======================================================== */}
      <div className="lg:w-1/2 min-h-screen bg-[#F8FAFC] flex flex-col justify-start items-center py-10 px-4 sm:px-8 lg:px-12 overflow-y-auto">
        {/* Main Card Container Diperbesar & Nyaman di Scroll */}
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-10 my-auto">

          {/* Heading Card */}
          <div className="mb-6 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1A2E] tracking-tight">
              {step === 1 ? "Buat Akun Siswa" : "Lengkapi Pasfoto Profil"}
            </h1>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              {step === 1
                ? "Lengkapi data diri Anda untuk pendaftaran resmi di Thinksy."
                : "Pilih foto profil resmi Anda untuk Kartu Pelajar Digital & Sistem Akademik."}
            </p>
          </div>

          {/* Pesan Error / Sukses */}
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold">Perhatian</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm animate-in fade-in duration-200">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-semibold">Sukses</p>
                <p className="mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 1: FORMULIR BIODATA SISWA LENGKAP                   */}
          {/* ======================================================== */}
          {step === 1 && (
            <form onSubmit={handleProceedToPhotoStep} className="space-y-4 sm:space-y-5">
              {/* 1. Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 tracking-wide">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    required
                    minLength={3}
                    placeholder="Masukkan nama lengkap sesuai rapor"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 shadow-xs"
                  />
                </div>
              </div>

              {/* 2. Asal Sekolah (DITETAPKAN & TERKUNCI: SMK Muhammadiyah 1) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 tracking-wide">
                    Asal Sekolah
                  </label>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Ditetapkan Resmi
                  </span>
                </div>
                <div className="relative flex items-center">
                  <School className="w-5 h-5 text-blue-600 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    readOnly
                    value="SMK Muhammadiyah 1"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-100/90 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed select-none shadow-xs"
                  />
                  <div className="absolute right-4 text-slate-400 flex items-center">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Sekolah pendaftar dikunci khusus untuk siswa SMK Muhammadiyah 1.
                </p>
              </div>


              {/* 4. Tempat Lahir & Tanggal Lahir (2 Kolom) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 tracking-wide">
                    Tempat Lahir <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      value={tempatLahir}
                      onChange={(e) => setTempatLahir(e.target.value)}
                      required
                      placeholder="Kota / Kab Lahir"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 tracking-wide">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Calendar className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type="date"
                      value={tanggalLahir}
                      onChange={(e) => setTanggalLahir(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Pilihan Kelas (Fase D) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 tracking-wide">
                  Pilihan Kelas (Fase D) <span className="text-red-500">*</span>
                </label>
                <select
                  value={namaKelas}
                  onChange={(e) => setNamaKelas(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm text-slate-800 font-semibold focus:outline-none transition-all duration-200 cursor-pointer shadow-xs"
                >
                  {KELAS_OPTIONS.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. NISN */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 tracking-wide">
                  NISN (Nomor Induk Siswa Nasional) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <CreditCard className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value.replace(/[^0-9]/g, ""))}
                    required
                    maxLength={10}
                    placeholder="Contoh: 0089247182"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 shadow-xs"
                  />
                </div>
              </div>

              {/* 7. Alamat Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 tracking-wide">
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="nama.siswa@gmail.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 shadow-xs"
                  />
                </div>
              </div>

              {/* 8. Kata Sandi & Konfirmasi Kata Sandi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 tracking-wide">
                    Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Min. 8 karakter"
                      className="w-full pl-12 pr-11 py-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 tracking-wide">
                    Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Ulangi kata sandi"
                      className="w-full pl-12 pr-11 py-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-200 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tombol Lanjut: Pembuatan Profile Foto Siswa */}
              <button
                type="submit"
                className="w-full mt-4 py-4 bg-[#0B1A2E] hover:bg-[#132A4A] text-white font-bold text-sm sm:text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-blue-950/20 hover:shadow-xl cursor-pointer active:scale-[0.99]"
              >
                <span>Daftar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Divider Atau */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Atau
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Daftar dengan Google (sesuai referensi gambar) */}
              <Link
                href="/masuk"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.53 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.89 3.02C6.2 7.74 8.87 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.97 3.7-8.62z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.78c-.25-.74-.39-1.53-.39-2.36s.14-1.62.39-2.36L1.39 7.04C.5 8.84 0 10.86 0 13s.5 4.16 1.39 5.96l3.89-3.18z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.11.75-2.53 1.2-4.23 1.2-3.13 0-5.8-2.7-6.72-5.54l-3.89 3.02C3.37 20.33 7.35 23 12 23z"
                  />
                </svg>
                <span>Daftar dengan Google</span>
              </Link>
            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 2: PEMBUATAN / PEMILIHAN PROFILE FOTO SISWA        */}
          {/* ======================================================== */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Preview Foto Siswa Terpilih */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-slate-50 to-blue-50/30 border border-slate-200/80 text-center">
                <div className="relative group mb-3">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl shadow-blue-900/15 bg-slate-200">
                    <img
                      src={selectedPhoto}
                      alt="Preview Foto Siswa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#0B1A2E] text-white flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors cursor-pointer"
                    title="Ganti atau Unggah Foto"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {namaLengkap || "Nama Siswa"}
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                    {namaKelas}
                  </span>
                  <span>•</span>
                  <span>SMK Muhammadiyah 1</span>
                  <span>•</span>
                  <span>NISN: {nisn || "-"}</span>
                </div>
              </div>

              {/* Pilihan Avatar Siap Pakai */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 tracking-wide">
                  Pilih Pasfoto Resmi Siswa
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(av.src);
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                        selectedPhoto === av.src
                          ? "border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden mb-2 border-2 border-white shadow-sm">
                        <img src={av.src} alt={av.label} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">{av.label}</span>
                      <span className="text-[10px] text-slate-400">{av.sublabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Opsi Unggah Foto Sendiri */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 tracking-wide">
                  Atau Unggah Pasfoto Pribadi
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Unggah dari Komputer / Smartphone (Maks. 4MB)</span>
                </button>
              </div>

              {/* Tombol Aksi Step 2 */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setStep(1)}
                  className="w-full sm:w-1/3 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Ubah Data</span>
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleFinalSubmit}
                  className="w-full sm:w-2/3 py-3.5 px-4 bg-[#0B1A2E] hover:bg-[#132A4A] text-white font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-950/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Menyimpan Akun & Foto...</span>
                    </>
                  ) : (
                    <>
                      <span>Selesaikan & Masuk Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Footer Card: Link ke Login jika sudah punya akun */}
          <div className="mt-8 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Sudah punya akun terdaftar?{" "}
              <Link
                href="/masuk"
                className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors"
              >
                Masuk Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

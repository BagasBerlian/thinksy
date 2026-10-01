"use client";

import { useState, useEffect } from "react";
import {
  X,
  Printer,
  Layers,
  FileText,
  RotateCw,
  QrCode,
  ShieldCheck,
  Building2,
  Edit3,
  Award,
  Sparkles,
} from "lucide-react";
import { SekolahData } from "../../types";
import {
  getStoredStudentProfile,
  getStoredStudentPhoto,
  DEFAULT_STUDENT_PHOTO,
  StudentCardProfile,
} from "@/lib/student-settings";

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentEmail: string;
  learningPoints: number;
  dailyStreak: number;
  nisn?: string | null;
  nis?: string | null;
  namaKelas?: string | null;
  jurusan?: string | null;
  tahunAjaran?: string | null;
  fotoUrl?: string | null;
  sekolahData?: SekolahData | null;
  onOpenSettings?: () => void;
}

export default function StudentProfileModal({
  isOpen,
  onClose,
  studentName,
  studentEmail,
  learningPoints,
  dailyStreak,
  nisn,
  nis,
  namaKelas,
  jurusan,
  tahunAjaran,
  fotoUrl,
  sekolahData,
  onOpenSettings,
}: StudentProfileModalProps) {
  const [cardSide, setCardSide] = useState<"front" | "back">("front");
  const [profileState, setProfileState] = useState<StudentCardProfile>(() => {
    return getStoredStudentProfile({
      nama_lengkap: studentName,
      nama_kelas: namaKelas || undefined,
      nis: nis || undefined,
      nisn: nisn || undefined,
      jurusan: jurusan || undefined,
      tahun_ajaran: tahunAjaran || undefined,
      foto_url: fotoUrl || undefined,
    });
  });

  // Sinkronisasi data dinamis dari storage / event perubahan
  useEffect(() => {
    if (isOpen) {
      const current = getStoredStudentProfile({
        nama_lengkap: studentName,
        nama_kelas: namaKelas || undefined,
        nis: nis || undefined,
        nisn: nisn || undefined,
        jurusan: jurusan || undefined,
        tahun_ajaran: tahunAjaran || undefined,
        foto_url: fotoUrl || undefined,
      });
      setProfileState(current);
    }

    const handleProfileChange = (e: any) => {
      if (e.detail) {
        setProfileState(e.detail);
      }
    };
    window.addEventListener("thinksy_profile_change", handleProfileChange);
    return () => {
      window.removeEventListener("thinksy_profile_change", handleProfileChange);
    };
  }, [isOpen, studentName, namaKelas, nis, nisn, jurusan, tahunAjaran, fotoUrl]);

  if (!isOpen) return null;

  const displayName = profileState.nama_lengkap || studentName;
  const activeClass = profileState.nama_kelas || namaKelas || "Kelas 8";
  const activeMajor = profileState.jurusan || jurusan || "Teknik Komputer & Jaringan";
  const activeYear = profileState.tahun_ajaran || tahunAjaran || "2026/2027";
  const activeNis = profileState.nis || nis || "260481";
  const activeNisn = profileState.nisn || nisn || "0089247182";
  const activeBirth = profileState.tempat_tgl_lahir || "Gunungkidul, 12 Agustus 2010";
  const activeGenderReligion = `${profileState.jenis_kelamin || "Laki-laki"} / ${profileState.agama || "Islam"}`;
  const displayPhoto = getStoredStudentPhoto(profileState.foto_url || fotoUrl);

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handlePrint = () => {
    window.print();
  };

  const schoolName = sekolahData?.nama || "SMK Muhammadiyah 1 Playen";
  const schoolAddress =
    sekolahData?.alamat ||
    "Jl. Logandeng No. 1, Playen, Gunungkidul, D.I. Yogyakarta 55861";
  const schoolNpsn = sekolahData?.npsn || "20402099";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-100 rounded-3xl shadow-2xl border border-slate-300 overflow-hidden text-slate-900 transition-all flex flex-col max-h-[94vh]">
        {/* MODAL CONTROL HEADER (Non-print) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 shrink-0 print:hidden gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 hidden sm:inline">
              Kartu Tanda Pelajar Resmi
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 sm:hidden">
              KTPelajar
            </span>
          </div>

          {/* Toggle Sisi Kartu (Depan / Belakang) & Edit Button */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setCardSide("front")}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  cardSide === "front"
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Kartu Depan</span>
              </button>
              <button
                type="button"
                onClick={() => setCardSide("back")}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  cardSide === "back"
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ketentuan (Belakang)</span>
                <span className="sm:hidden">Belakang</span>
              </button>
            </div>

            {/* Button Edit Data Kartu (Membuka Pengaturan Layar Normal) */}
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Edit Nama, Kelas, Pasfoto, atau NIS di Pengaturan"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Edit Data & Foto</span>
                <span className="sm:hidden">Edit</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE / SCROLLABLE CARD AREA */}
        <div className="p-4 sm:p-6 overflow-y-auto print:p-0 print:overflow-visible">
          {/* ══════════════════════════════════════════════════════════
              SISI DEPAN: KARTU TANDA PELAJAR RESMI (FORMAT STANDAR NASIONAL)
             ══════════════════════════════════════════════════════════ */}
          {cardSide === "front" ? (
            <div className="relative rounded-2xl bg-white border-2 border-slate-300 shadow-xl overflow-hidden print:shadow-none print:border-2 text-[#0F172A]">
              {/* Latar Belakang Pola Guilloche Halus Khas Kartu Resmi */}
              <div
                className="absolute inset-0 opacity-[0.035] pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(#0F172A 1.5px, transparent 1.5px), radial-gradient(#0F172A 1.5px, #ffffff 1.5px)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 10px 10px",
                }}
              />

              {/* 1. KOP KARTU RESMI SEKOLAH */}
              <div className="px-5 pt-4 pb-3 bg-white">
                <div className="flex items-center justify-between gap-3">
                  {/* Logo Tut Wuri Handayani / Lambang Pendidikan */}
                  <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-13 h-13 text-[#0F172A]" fill="currentColor">
                      {/* Logo Tut Wuri Handayani Silhouette */}
                      <circle cx="50" cy="50" r="46" fill="#1E3A8A" />
                      <circle cx="50" cy="50" r="41" fill="#FFFFFF" />
                      <polygon points="50,15 62,38 88,40 68,58 74,84 50,70 26,84 32,58 12,40 38,38" fill="#F59E0B" />
                      <circle cx="50" cy="50" r="18" fill="#1E3A8A" />
                      <polygon points="50,38 56,48 67,49 59,57 61,68 50,62 39,68 41,57 33,49 44,48" fill="#FFFFFF" />
                    </svg>
                  </div>

                  {/* Teks Identitas Instansi & Sekolah */}
                  <div className="flex-1 text-center space-y-0.5">
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      MAJELIS PENDIDIKAN DASAR DAN MENENGAH
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-[#0F172A] tracking-tight leading-tight uppercase">
                      {schoolName}
                    </h2>
                    <p className="text-[9px] sm:text-[10px] text-slate-600 font-medium leading-tight">
                      {schoolAddress}
                    </p>
                    <p className="text-[8.5px] sm:text-[9.5px] text-slate-500 font-semibold tracking-wide">
                      NPSN: {schoolNpsn} • Akreditasi: A • Telp: (0274) 391032
                    </p>
                  </div>

                  {/* Logo Sekolah / Emblem Resmi */}
                  <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                    <img
                      src="/images/smk-muh-pakem-logo.png"
                      alt="Logo Sekolah"
                      className="w-13 h-13 object-contain"
                      onError={(e) => {
                        // Fallback emblem jika gambar lokal tidak termuat
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 font-black text-xs">
                              MUPA
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Garis Pembatas Kop Resmi (Garis Ganda) */}
                <div className="mt-2.5">
                  <div className="h-[2px] bg-[#0F172A]" />
                  <div className="h-[1px] bg-[#0F172A] mt-[1.5px]" />
                </div>
              </div>

              {/* 2. PITA JUDUL KARTU */}
              <div className="bg-[#1E3A8A] text-white py-1 text-center font-black tracking-widest uppercase text-xs sm:text-sm shadow-xs border-y border-amber-400">
                <span>KARTU TANDA PELAJAR</span>
                <span className="text-[9px] font-medium tracking-wider text-amber-200 ml-1.5 opacity-90 hidden sm:inline">
                  (STUDENT IDENTITY CARD)
                </span>
              </div>

              {/* 3. KONTEN IDENTITAS SISWA (PASFOTO + BIODATA TABULAR) */}
              <div className="p-4 sm:p-6 bg-white">
                <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-start">
                  {/* Kolom Kiri: Pasfoto 3x4 Resmi, Hologram & Barcode Pelajar */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="relative">
                      {/* Pasfoto Resmi Standar 3x4 (Latar Merah Formal Indonesia - Wajib Ada Fotonya) */}
                      <div className="w-[110px] h-[146px] rounded-md bg-[#C51E1E] border-2 border-slate-700 shadow-sm overflow-hidden flex items-center justify-center relative">
                        <img
                          src={displayPhoto}
                          alt={displayName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_STUDENT_PHOTO;
                          }}
                        />
                      </div>

                      {/* Cap / Stempel Sekolah Fisik Timbul (Warna Ungu Stempel Basah) */}
                      <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full border-2 border-indigo-700/80 bg-indigo-50/20 backdrop-blur-[0.5px] -rotate-12 flex flex-col items-center justify-center text-[7px] font-black text-indigo-900 pointer-events-none shadow-xs">
                        <span className="leading-tight text-center px-1 font-bold">
                          SMK MUH 1
                        </span>
                        <span className="text-[8px] text-indigo-800 font-extrabold my-0.2">
                          ★ CAP ★
                        </span>
                        <span className="leading-tight text-center px-1 font-bold">
                          TERDAFTAR
                        </span>
                      </div>
                    </div>

                    {/* Barcode Fisik Resmi Siswa (Format 1D Code 128) */}
                    <div className="mt-3 flex flex-col items-center w-full">
                      {/* Simulasi Garis Barcode Presisi */}
                      <div
                        className="h-7 w-28 bg-white border border-slate-300 px-1 py-0.5 flex items-center justify-between"
                        title={`Barcode NIS: ${activeNis}`}
                      >
                        <div className="w-[2px] h-full bg-black" />
                        <div className="w-[1px] h-full bg-black" />
                        <div className="w-[3px] h-full bg-black" />
                        <div className="w-[1px] h-full bg-black" />
                        <div className="w-[2px] h-full bg-black" />
                        <div className="w-[4px] h-full bg-black" />
                        <div className="w-[1px] h-full bg-black" />
                        <div className="w-[2px] h-full bg-black" />
                        <div className="w-[3px] h-full bg-black" />
                        <div className="w-[1px] h-full bg-black" />
                        <div className="w-[2px] h-full bg-black" />
                        <div className="w-[4px] h-full bg-black" />
                        <div className="w-[1px] h-full bg-black" />
                        <div className="w-[3px] h-full bg-black" />
                        <div className="w-[2px] h-full bg-black" />
                      </div>
                      <span className="text-[8.5px] font-mono font-bold text-slate-700 tracking-widest mt-0.5">
                        * {activeNis} *
                      </span>
                    </div>

                    {/* Hologram / Security Seal Pelajar Nasional */}
                    <div className="mt-2.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 border border-amber-400/80 text-[7.5px] font-black text-amber-900 tracking-wider flex items-center gap-1 shadow-2xs select-none">
                      <ShieldCheck className="w-3 h-3 text-amber-700 shrink-0" />
                      <span>KEMDIKBUD • RESMI</span>
                    </div>
                  </div>

                  {/* Kolom Kanan: Biodata Siswa Format Titik Dua (Standar Kartu Pelajar Asli) */}
                  <div className="flex-1 w-full space-y-2 text-xs">
                    <table className="w-full border-collapse">
                      <tbody className="divide-y divide-slate-100">
                        {/* Nama Siswa */}
                        <tr>
                          <td className="py-1.5 pr-2 font-bold text-slate-700 w-36 whitespace-nowrap">
                            Nama Lengkap
                          </td>
                          <td className="py-1.5 px-1 font-bold text-slate-700 w-3">:</td>
                          <td className="py-1.5 pl-2 font-black text-[#0F172A] text-sm uppercase tracking-tight">
                            {displayName}
                          </td>
                        </tr>

                        {/* NIS / NISN */}
                        <tr>
                          <td className="py-1.5 pr-2 font-bold text-slate-700 whitespace-nowrap">
                            NIS / NISN
                          </td>
                          <td className="py-1.5 px-1 font-bold text-slate-700">:</td>
                          <td className="py-1.5 pl-2 font-mono font-extrabold text-[#0F172A]">
                            {activeNis} / {activeNisn}
                          </td>
                        </tr>

                        {/* KELAS */}
                        <tr className="bg-amber-50/60">
                          <td className="py-1.5 pr-2 font-black text-amber-950 whitespace-nowrap">
                            Kelas
                          </td>
                          <td className="py-1.5 px-1 font-black text-amber-950">:</td>
                          <td className="py-1.5 pl-2 font-black text-[#0F172A] text-sm">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-xs mr-2">
                              {activeClass}
                            </span>
                            <span className="text-slate-600 font-semibold text-[11px]">
                              (Semester Aktif)
                            </span>
                          </td>
                        </tr>

                        {/* Kompetensi Keahlian / Jurusan */}
                        <tr>
                          <td className="py-1.5 pr-2 font-bold text-slate-700 whitespace-nowrap">
                            Kompetensi Keahlian
                          </td>
                          <td className="py-1.5 px-1 font-bold text-slate-700">:</td>
                          <td className="py-1.5 pl-2 font-extrabold text-[#0F172A]">
                            {activeMajor}
                          </td>
                        </tr>

                        {/* Tempat, Tanggal Lahir */}
                        <tr>
                          <td className="py-1.5 pr-2 font-bold text-slate-700 whitespace-nowrap">
                            Tempat, Tgl Lahir
                          </td>
                          <td className="py-1.5 px-1 font-bold text-slate-700">:</td>
                          <td className="py-1.5 pl-2 font-semibold text-slate-800">
                            {activeBirth}
                          </td>
                        </tr>

                        {/* Jenis Kelamin & Agama */}
                        <tr>
                          <td className="py-1.5 pr-2 font-bold text-slate-700 whitespace-nowrap">
                            Jenis Kelamin / Agama
                          </td>
                          <td className="py-1.5 px-1 font-bold text-slate-700">:</td>
                          <td className="py-1.5 pl-2 font-semibold text-slate-800">
                            {activeGenderReligion}
                          </td>
                        </tr>

                        {/* Tahun Pelajaran */}
                        <tr>
                          <td className="py-1.5 pr-2 font-bold text-slate-700 whitespace-nowrap">
                            Tahun Pelajaran
                          </td>
                          <td className="py-1.5 px-1 font-bold text-slate-700">:</td>
                          <td className="py-1.5 pl-2 font-semibold text-slate-800">
                            {activeYear}
                          </td>
                        </tr>

                        {/* Masa Berlaku */}
                        <tr>
                          <td className="py-1.5 pr-2 font-bold text-slate-700 whitespace-nowrap">
                            Masa Berlaku
                          </td>
                          <td className="py-1.5 px-1 font-bold text-slate-700">:</td>
                          <td className="py-1.5 pl-2 font-bold text-emerald-800">
                            Selama Menjadi Siswa Aktif
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. FOOTER IDENTITAS DEPAN: QR CODE & PENGESAHAN KEPALA SEKOLAH */}
                <div className="mt-5 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* QR Code Verifikasi Siswa */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-400 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                      <QrCode className="w-full h-full text-[#0F172A]" />
                    </div>
                    <div className="text-[9px] text-slate-600 leading-tight">
                      <div className="font-bold text-[#0F172A]">
                        ID SISWA RESMI: {activeNis}
                      </div>
                      <div>Sah digunakan untuk KBM, Presensi, dan Asesmen.</div>
                    </div>
                  </div>

                  {/* Blok Tanda Tangan & Stempel Resmi Kepala Sekolah */}
                  <div className="flex flex-col items-center text-center relative shrink-0">
                    <span className="text-[10px] text-slate-600 font-semibold">
                      Playen, Juli 2026
                    </span>
                    <span className="text-[10px] text-slate-700 font-bold">
                      Kepala Sekolah,
                    </span>

                    {/* Area Tanda Tangan & Cap Basah Resmi */}
                    <div className="relative w-36 h-12 flex items-center justify-center my-0.5">
                      {/* Cap / Stempel Sekolah Biru-Ungu Basah */}
                      <div className="absolute left-1 w-12 h-12 rounded-full border-2 border-indigo-700/75 bg-indigo-50/20 flex flex-col items-center justify-center text-[6px] font-black text-indigo-900 pointer-events-none -rotate-6">
                        <span>SMK MUH 1</span>
                        <span className="text-[7px]">PLAYEN</span>
                      </div>

                      {/* Simulasi Goresan Tanda Tangan Resmi */}
                      <svg viewBox="0 0 140 40" className="w-28 h-9 text-[#0F172A] z-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M10 25 C 25 10, 35 35, 45 15 C 55 5, 60 30, 75 20 C 85 10, 95 30, 110 15 C 120 5, 125 25, 135 20" />
                        <path d="M40 28 L 90 28" />
                      </svg>
                    </div>

                    <span className="text-[11px] font-black text-[#0F172A] underline">
                      Drs. H. Suwardi, M.Pd.
                    </span>
                    <span className="text-[9px] font-mono text-slate-600">
                      NIP. 19680514 199412 1 002
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ══════════════════════════════════════════════════════════
               SISI BELAKANG: KETENTUAN DAN TATA TERTIB KARTU PELAJAR RESMI
             ══════════════════════════════════════════════════════════ */
            <div className="relative rounded-2xl bg-white border-2 border-slate-300 shadow-xl overflow-hidden print:shadow-none print:border-2 text-[#0F172A] p-6 sm:p-7 space-y-5">
              {/* Latar Belakang Pola Guilloche Halus */}
              <div
                className="absolute inset-0 opacity-[0.035] pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(#0F172A 1.5px, transparent 1.5px), radial-gradient(#0F172A 1.5px, #ffffff 1.5px)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 10px 10px",
                }}
              />

              {/* 1. Header Belakang */}
              <div className="text-center space-y-1 pb-3 border-b-2 border-slate-900">
                <h3 className="text-sm sm:text-base font-black uppercase text-[#0F172A] tracking-wider">
                  {schoolName}
                </h3>
                <p className="text-[10px] text-slate-600 font-medium">
                  {schoolAddress} • NPSN: {schoolNpsn}
                </p>
                <div className="inline-block px-3 py-1 rounded-full bg-[#1E3A8A] text-white text-xs font-black uppercase tracking-wider mt-1">
                  KETENTUAN & TATA TERTIB KARTU TANDA PELAJAR
                </div>
              </div>

              {/* 2. Daftar Ketentuan Resmi (Sesuai Referensi Resmi Sekolah Indonesia) */}
              <div className="space-y-3 text-xs leading-relaxed text-slate-800">
                <ol className="list-decimal pl-5 space-y-2.5 font-medium">
                  <li>
                    <strong className="text-[#0F172A]">Identitas Sah Siswa:</strong>{" "}
                    Kartu Tanda Pelajar ini adalah bukti identitas sah siswa dan kartu kepesertaan asesmen resmi yang diterbitkan oleh pihak sekolah dan diakui oleh Dinas Pendidikan.
                  </li>
                  <li>
                    <strong className="text-[#0F172A]">Kewajiban Penggunaan:</strong>{" "}
                    Siswa pemegang kartu terdaftar aktif pada rombongan belajar{" "}
                    <span className="font-black text-[#0F172A] bg-amber-100 px-1 rounded">
                      {activeClass}
                    </span>{" "}
                    Tahun Pelajaran{" "}
                    <span className="font-bold">{activeYear}</span>. Kartu ini{" "}
                    <strong>wajib selalu dibawa</strong> saat berada di lingkungan sekolah, mengikuti Kegiatan Belajar Mengajar (KBM), presensi kehadiran, Ulangan Harian, Asesmen Tengah Semester, serta Ujian Akhir Semester.
                  </li>
                  <li>
                    <strong className="text-[#0F172A]">Larangan Keras:</strong>{" "}
                    Kartu ini hanya berlaku untuk siswa yang namanya tercantum. Dilarang keras memindahtangankan, meminjamkan, atau memalsukan identitas kartu kepada orang lain. Pelanggaran dikenakan sanksi tata tertib sekolah dan diskualifikasi nilai ujian.
                  </li>
                  <li>
                    <strong className="text-[#0F172A]">Verifikasi Digital & Fasilitas:</strong>{" "}
                    Barcode dan QR Code pada kartu ini digunakan untuk absensi presensi digital, peminjaman buku perpustakaan sekolah, serta validasi masuk ruang ujian.
                  </li>
                  <li>
                    <strong className="text-[#0F172A]">Kehilangan & Kerusakan:</strong>{" "}
                    Apabila kartu ini hilang, rusak, atau terjadi kesalahan cetak data, siswa diwajibkan segera melapor kepada bagian Tata Usaha (TU) sekolah atau Guru Wali Kelas untuk penerbitan kartu pengganti.
                  </li>
                  <li>
                    <strong className="text-[#0F172A]">Pemberitahuan Penemuan:</strong>{" "}
                    Barangsiapa yang menemukan kartu tanda pelajar ini, mohon dengan hormat untuk mengembalikannya ke Sekretariat Tata Usaha {schoolName}, {schoolAddress}.
                  </li>
                </ol>
              </div>

              {/* 3. Pengesahan Bagian Belakang */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="text-[10px] text-slate-600 space-y-1">
                  <div className="font-bold text-[#0F172A] uppercase">
                    DATA ADMINISTRASI KESISWAAN
                  </div>
                  <div>• Terdaftar Resmi di Pangkalan Data Dapodik Kemdikbudristek</div>
                  <div>• Berlaku selama aktif menempuh pendidikan di {schoolName}</div>
                  <div>• Kelas: <strong className="text-[#0F172A]">{activeClass}</strong> | NIS: <strong className="text-[#0F172A]">{activeNis}</strong></div>
                </div>

                <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                  <span className="text-[10px] text-slate-600 font-semibold">
                    Ditetapkan di Playen, {activeYear.split("/")[0]}
                  </span>
                  <span className="text-[10px] font-bold text-slate-800">
                    a.n. Kepala Sekolah, Bagian Kesiswaan
                  </span>
                  <div className="w-28 h-9 my-1 flex items-center justify-center sm:justify-end">
                    <span className="px-2.5 py-0.5 rounded border border-indigo-700/60 bg-indigo-50/50 text-indigo-900 font-black text-[9px] -rotate-3">
                      TERVALIDASI
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-[#0F172A]">
                    Tata Usaha {schoolName}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER ACTIONS (Non-print) */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <button
            type="button"
            onClick={() => setCardSide(cardSide === "front" ? "back" : "front")}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer border border-slate-300"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>
              {cardSide === "front"
                ? "Balik ke Ketentuan (Belakang)"
                : "Kembali ke Kartu Depan"}
            </span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer border border-slate-300"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>Cetak Kartu</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-black transition cursor-pointer shadow-md"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

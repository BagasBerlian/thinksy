"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Award,
  BookOpen,
  Mail,
  Phone,
  CheckCircle2,
  ShieldCheck,
  Edit3,
  X,
} from "lucide-react";

interface CardGuruProfileProps {
  onOpenSettings?: () => void;
  onClose?: () => void;
}

export default function CardGuruProfile({ onOpenSettings, onClose }: CardGuruProfileProps) {
  const [activeTab, setActiveTab] = useState<"ringkasan" | "kompetensi" | "jadwal">("ringkasan");

  const guruData = {
    nama: "Ibu Siti Rahmawati, M.Pd.",
    gelar: "M.Pd. (Magister Pendidikan Matematika)",
    foto: "/images/foto-guru.jpg",
    jabatan: "Guru Penggerak Matematika & Wali Kelas 8",
    umur: "38 Tahun (Lahir: 15 April 1988)",
    nip: "19880415 201001 2 012",
    nuptk: "4147 7666 6821 0032",
    sekolah: "SMKS Muhammadiyah Pakem (Sekolah Pusat Keunggulan)",
    pendidikan: "S2 Pendidikan Matematika — Universitas Negeri Yogyakarta (UNY)",
    pengalaman: "14 Tahun Pengabdian",
    statusKepegawaian: "PNS / Penata Tk. I (Gol. III/d)",
    statusSertifikasi: "Pendidik Profesional Tersertifikasi (Kemendikbudristek)",
    email: "siti.rahmawati@smkmuhpakem.sch.id",
    telepon: "+62 812-3456-7890",
    mapel: "Matematika Fase D (Kelas 8)",
    rombelBinaan: "Kelas 8",
    totalSiswa: "62 Siswa Binaan (93 Total Siswa)",
    bebanMengajar: "24 Jam Pelajaran (JP) / Minggu",
    indeksKepuasan: "98.4%",
    motto:
      "Mendidik dengan dialog terarah. Membimbing siswa menemukan logika matematika secara terstruktur, kritis, dan berkarakter.",
  };

  return (
    <div className="relative bg-white border border-slate-200/90 rounded-3xl shadow-sm text-slate-900 font-sans overflow-hidden">
      {/* Dossier Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center font-bold text-xs border border-white/20">
            GR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-blue-200 font-bold">
                PROFIL PENDIDIK
              </span>
              <span className="text-white/40 text-xs">•</span>
              <span className="text-[11px] text-white/90">
                Data Kepegawaian & Akademik
              </span>
            </div>
            <p className="text-xs text-blue-100 font-medium mt-0.5">
              SMKS Muhammadiyah Pakem
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-200" />
              <span>Kelola Akun</span>
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition cursor-pointer"
              title="Tutup Kartu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Body Dossier */}
      <div className="p-5 space-y-5">
        {/* Profile Identity Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 relative bg-slate-100 shadow-xs">
                <Image
                  src={guruData.foto}
                  alt={guruData.nama}
                  fill
                  sizes="100px"
                  className="object-cover object-top"
                  priority
                />
              </div>
              <div
                className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-xs"
                title="Pendidik Terverifikasi"
              >
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-[#1967D2] text-[10px] font-semibold rounded-full border border-blue-200">
                  Guru Penggerak
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-200">
                  PNS Bersertifikat
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-full border border-indigo-200">
                  Wali Kelas 8
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {guruData.nama}
              </h2>

              <p className="text-xs font-medium text-slate-600 flex items-center gap-2 flex-wrap">
                <span className="text-slate-900 font-bold">{guruData.jabatan}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{guruData.sekolah}</span>
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5 flex-wrap">
                <span className="bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200 text-[11px] font-medium">
                  NIP: {guruData.nip}
                </span>
                <span className="bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200 text-[11px] font-medium">
                  NUPTK: {guruData.nuptk}
                </span>
                <span className="bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200 text-[11px] font-medium">
                  Masa Kerja: {guruData.pengalaman}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bento Box */}
          <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="text-left md:text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Indeks Kinerja
              </div>
              <div className="text-base font-bold text-emerald-600">
                {guruData.indeksKepuasan}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Beban Mengajar
              </div>
              <div className="text-xs font-semibold text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                {guruData.bebanMengajar}
              </div>
            </div>
          </div>
        </div>

        {/* Segmented Control Tabs */}
        <div className="space-y-3.5">
          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("ringkasan")}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${
                activeTab === "ringkasan"
                  ? "bg-white text-[#1967D2] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Biodata & Kepegawaian
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("kompetensi")}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${
                activeTab === "kompetensi"
                  ? "bg-white text-[#1967D2] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Kompetensi & Sertifikasi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("jadwal")}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${
                activeTab === "jadwal"
                  ? "bg-white text-[#1967D2] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Kontak & Penugasan
            </button>
          </div>

          {/* TAB 1: BIODATA & KEPEGAWAIAN */}
          {activeTab === "ringkasan" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Informasi Pegawai
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Status Kepegawaian</span>
                    <span className="font-semibold text-slate-900">{guruData.statusKepegawaian}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Usia / Tanggal Lahir</span>
                    <span className="font-semibold text-slate-900">{guruData.umur}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Mata Pelajaran Pokok</span>
                    <span className="font-semibold text-slate-900">{guruData.mapel}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Rombongan Belajar</span>
                    <span className="font-semibold text-slate-900">{guruData.rombelBinaan}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Total Siswa Dibina</span>
                    <span className="font-semibold text-slate-900">{guruData.totalSiswa}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Komitmen Pedagogik
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                    &ldquo;{guruData.motto}&rdquo;
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <BookOpen className="w-3.5 h-3.5 text-[#1967D2] shrink-0" />
                  <span>Pendekatan dialogis kurikulum matematika adaptif</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KOMPETENSI & SERTIFIKASI */}
          {activeTab === "kompetensi" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Riwayat Pendidikan
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-0.5 shadow-2xs">
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      <span>S2 Pendidikan Matematika</span>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        2014 – 2016
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Universitas Negeri Yogyakarta (UNY) — Cum Laude
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-0.5 shadow-2xs">
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      <span>S1 Pendidikan Matematika</span>
                      <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        2006 – 2010
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Universitas Sebelas Maret (UNS) Surakarta
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Sertifikasi & Lisensi
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200/80 text-slate-800 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Sertifikat Pendidik Profesional (Kemendikbudristek)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200/80 text-slate-800 shadow-2xs">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Fasilitator Guru Penggerak Nasional (2022)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200/80 text-slate-800 shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-[#1967D2] shrink-0" />
                    <span>Pelatihan Pembelajaran Terstruktur (2026)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KONTAK & PENUGASAN */}
          {activeTab === "jadwal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Saluran Komunikasi
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <Mail className="w-4 h-4 text-[#1967D2] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Surel</div>
                      <div className="font-semibold text-xs text-slate-900 truncate">{guruData.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Telepon</div>
                      <div className="font-semibold text-xs text-slate-900">{guruData.telepon}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Jadwal Tatap Muka
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex justify-between items-center shadow-2xs">
                    <div>
                      <div className="font-bold text-slate-900">Kelas 8 (Wali Kelas)</div>
                      <div className="text-[11px] text-slate-500">Senin & Rabu (07:30 – 09:30 WIB)</div>
                    </div>
                    <span className="text-[10px] font-semibold bg-blue-50 text-[#1967D2] px-2 py-0.5 rounded-full border border-blue-200">
                      32 Siswa
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex justify-between items-center shadow-2xs">
                    <div>
                      <div className="font-bold text-slate-900">Kelas 8 (Pengajar Utama)</div>
                      <div className="text-[11px] text-slate-500">Selasa & Kamis (10:00 – 12:00 WIB)</div>
                    </div>
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                      30 Siswa
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

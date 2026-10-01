"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Award,
  Sparkles,
  BookOpen,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  Edit3,
} from "lucide-react";

interface CardGuruProfileProps {
  onOpenSettings?: () => void;
}

export default function CardGuruProfile({ onOpenSettings }: CardGuruProfileProps) {
  const [activeTab, setActiveTab] = useState<"ringkasan" | "kompetensi" | "jadwal">("ringkasan");

  const guruData = {
    nama: "Ibu Siti Rahmawati, M.Pd.",
    gelar: "M.Pd. (Magister Pendidikan Matematika)",
    foto: "/images/foto-guru.jpg",
    jabatan: "Guru Penggerak Matematika & Wali Kelas 8A",
    umur: "38 Tahun (Lahir: 15 April 1988)",
    nip: "19880415 201001 2 012",
    nuptk: "4147 7666 6821 0032",
    sekolah: "SMP Negeri 1 (Sekolah Penggerak)",
    pendidikan: "S2 Pendidikan Matematika — Universitas Negeri Yogyakarta (UNY)",
    pengalaman: "14 Tahun Pengabdian",
    statusKepegawaian: "PNS / Penata Tk. I (Gol. III/d)",
    statusSertifikasi: "Pendidik Profesional Tersertifikasi (Kemendikbudristek)",
    email: "siti.rahmawati@sekolah.sch.id",
    telepon: "+62 812-3456-7890",
    mapel: "Matematika Fase D (Kelas 8A, 8B, 8C)",
    rombelBinaan: "Kelas 8A & Kelas 8B",
    totalSiswa: "62 Siswa Binaan (93 Total Siswa)",
    bebanMengajar: "24 Jam Pelajaran (JP) / Minggu",
    indeksKepuasan: "98.4%",
    motto:
      "Mendidik dengan metode dialog Sokratik Kurikulum Merdeka. Membimbing siswa menemukan logika matematika secara mandiri, kritis, dan berkarakter Profil Pelajar Pancasila.",
  };

  return (
    <div className="relative rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Decorative Top Accent Bar */}
      <div className="h-2 bg-gradient-to-r from-amber-500 via-indigo-600 to-blue-600 w-full" />

      {/* Main Container */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Top Profile Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          {/* Avatar & Identitas Guru */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Foto Guru dengan Verified Ring */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-lg relative bg-slate-100 group">
                <Image
                  src={guruData.foto}
                  alt={guruData.nama}
                  fill
                  sizes="120px"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
              {/* Badge Official Guru */}
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl shadow-md border-2 border-white flex items-center justify-center" title="Guru Terverifikasi Resmi">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            {/* Nama, Jabatan, Badges */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-black border border-amber-200">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  Guru Penggerak Angkatan 5
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  PNS Bersertifikat
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 text-[11px] font-bold border border-purple-200">
                  Wali Kelas 8A
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                {guruData.nama}
              </h2>

              <p className="text-sm font-bold text-slate-600 flex items-center gap-2 flex-wrap">
                <span className="text-indigo-600 font-extrabold">{guruData.jabatan}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{guruData.sekolah}</span>
              </p>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-0.5 flex-wrap">
                <span className="flex items-center gap-1.5 text-slate-700 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Umur: {guruData.umur}
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  NIP: {guruData.nip}
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  {guruData.pengalaman}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition cursor-pointer shadow-sm hover:shadow shrink-0"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>Kelola Profil Guru</span>
            </button>
          )}
        </div>


        {/* Tab Navigation for Detailed Biodata */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <button
              onClick={() => setActiveTab("ringkasan")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === "ringkasan"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Biodata & Jabatan Lengkap
            </button>
            <button
              onClick={() => setActiveTab("kompetensi")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === "kompetensi"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Sertifikasi & Riwayat Pendidikan
            </button>
            <button
              onClick={() => setActiveTab("jadwal")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === "jadwal"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Kontak & Penugasan
            </button>
          </div>

          {/* Tab 1: Biodata & Jabatan */}
          {activeTab === "ringkasan" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Informasi Kepegawaian & Posisi
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-bold">Jabatan Utama:</span>
                    <span className="font-extrabold text-[#0F172A]">{guruData.jabatan}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-bold">Umur & Tanggal Lahir:</span>
                    <span className="font-extrabold text-[#0F172A]">{guruData.umur}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-bold">NIP Guru:</span>
                    <span className="font-extrabold text-indigo-700">{guruData.nip}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-bold">NUPTK Resmi:</span>
                    <span className="font-extrabold text-slate-700">{guruData.nuptk}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-bold">Pangkat / Golongan:</span>
                    <span className="font-extrabold text-emerald-700">{guruData.statusKepegawaian}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                    Misi & Pendekatan Pedagogik AI Sokratik
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed italic bg-white p-3 rounded-xl border border-slate-200">
                    "{guruData.motto}"
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-slate-500">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Menerapkan bimbingan adaptif Thinksy AI untuk eksplorasi matematika</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Kompetensi & Pendidikan */}
          {activeTab === "kompetensi" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2.5 text-xs">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                  Riwayat Akademik Guru
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <div className="font-black text-[#0F172A] flex items-center justify-between">
                    <span>S2 Pendidikan Matematika</span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">2014 - 2016</span>
                  </div>
                  <p className="text-slate-500 font-medium text-[11px]">Universitas Negeri Yogyakarta (UNY) — Predikat Cum Laude</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <div className="font-black text-[#0F172A] flex items-center justify-between">
                    <span>S1 Pendidikan Matematika</span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">2006 - 2010</span>
                  </div>
                  <p className="text-slate-500 font-medium text-[11px]">Universitas Sebelas Maret (UNS) Surakarta</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2.5 text-xs">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                  Sertifikasi & Lisensi Pendidik
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Sertifikat Pendidik Profesional (Kemendikbudristek RI)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold">
                    <Award className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Sertifikat Kelulusan Fasilitator Guru Penggerak (2022)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-bold">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Pelatihan AI Sokratik dalam Pembelajaran Matematika (Thinksy 2026)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Kontak & Penugasan */}
          {activeTab === "jadwal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3 text-xs">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Saluran Kontak Resmi Guru
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200">
                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Surel / Email Sekolah</div>
                      <div className="font-extrabold text-[#0F172A] truncate">{guruData.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Telepon / WhatsApp Guru</div>
                      <div className="font-extrabold text-[#0F172A]">{guruData.telepon}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3 text-xs">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Penugasan Rombel & Jadwal Aktif
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="font-black text-[#0F172A]">Kelas 8A (Wali Kelas)</div>
                      <div className="text-[11px] text-slate-500 font-medium">Senin & Rabu (07:30 - 09:30 WIB)</div>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">32 Siswa</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="font-black text-[#0F172A]">Kelas 8B (Pengajar Utama)</div>
                      <div className="text-[11px] text-slate-500 font-medium">Selasa & Kamis (10:00 - 12:00 WIB)</div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">30 Siswa</span>
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

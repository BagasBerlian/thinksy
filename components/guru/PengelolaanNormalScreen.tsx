"use client";

import Link from "next/link";
import {
  Sliders,
  Bot,
  FileCheck,
  Plus,
  Settings,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Filter,
} from "lucide-react";

interface PengelolaanNormalScreenProps {
  onNavigateHome?: () => void;
}

export default function PengelolaanNormalScreen({
  onNavigateHome,
}: PengelolaanNormalScreenProps) {
  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5 text-blue-600 font-bold">
              <Sliders className="w-3.5 h-3.5" />
              <span>Pengelolaan</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Pusat Pengelolaan Pembelajaran & Soal
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Kelola bank soal kurikulum, konfirmasi penilaian esai AI, dan rancang modul materi pembelajaran.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-mono font-bold flex items-center gap-1.5 rounded-xl shrink-0">
          <Settings className="w-3.5 h-3.5 text-zinc-900" />
          <span>Panel Pengelolaan Guru</span>
        </div>
      </div>

      {/* 2. BODY CONTENT: 3 KARTU PENGELOLAAN SESUAI SPESIFIKASI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: DAFTAR SOAL & FILTER STATUS */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 p-6 flex flex-col justify-between space-y-6 group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-[#1967D2] flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <Filter className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                /guru/soal
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-[#0F172A] group-hover:text-blue-600 transition flex items-center gap-2">
                <span>Daftar Bank Soal</span>
                <ChevronRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Kelola daftar soal matematika, filter status <strong>Review</strong>, <strong>Dipublikasi</strong>, atau <strong>Draft</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-bold">Filter Status:</span>
                <span className="font-extrabold text-blue-700">Review, Terbit, Draft</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-bold">Pencarian:</span>
                <span className="font-extrabold text-slate-700">Keyword & Filter Bab</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <Link
              href="/guru/soal"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#0F172A] group-hover:bg-[#1967D2] text-white text-xs font-black transition cursor-pointer shadow-md"
            >
              <span>Buka Daftar Soal</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* CARD 2: ANTREAN PENILAIAN ESAI AI */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all duration-300 p-6 flex flex-col justify-between space-y-6 group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <FileCheck className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                /guru/penilaian
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-[#0F172A] group-hover:text-emerald-600 transition flex items-center gap-2">
                <span>Penilaian Esai AI</span>
                <ChevronRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Antrean jawaban esai siswa yang telah dinilai otomatis oleh model AI dan memerlukan konfirmasi / review resmi guru.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-bold">Metode Koreksi:</span>
                <span className="font-extrabold text-emerald-700">AI Scoring + Rubrik Guru</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-bold">Status Antrean:</span>
                <span className="font-extrabold text-amber-700">Perlu Konfirmasi Guru</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <Link
              href="/guru/penilaian"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#0F172A] group-hover:bg-emerald-600 text-white text-xs font-black transition cursor-pointer shadow-md"
            >
              <span>Buka Antrean Penilaian</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* CARD 3: BUAT SOAL BARU & REVIEW GATE */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-purple-400 transition-all duration-300 p-6 flex flex-col justify-between space-y-6 group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <Plus className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                /guru/buat-soal
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-[#0F172A] group-hover:text-purple-600 transition flex items-center gap-2">
                <span>Editor & Generator Soal</span>
                <ChevronRight className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Tulis soal mandiri atau generate paket soal berbantuan AI dengan review gate sebelum diterbitkan ke siswa.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-bold">Review Gate:</span>
                <span className="font-extrabold text-purple-700">Tombol Terbitkan Aktif</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-bold">Format:</span>
                <span className="font-extrabold text-slate-700">Pilihan Ganda & Esai KaTeX</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <Link
              href="/guru/buat-soal"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#0F172A] group-hover:bg-purple-600 text-white text-xs font-black transition cursor-pointer shadow-md"
            >
              <span>Buat & Terbitkan Soal</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

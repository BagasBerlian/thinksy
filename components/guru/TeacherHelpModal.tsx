"use client";

import { useState } from "react";
import {
  HelpCircle,
  X,
  BookOpen,
  FileText,
  Bot,
  UserCheck,
  LifeBuoy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

interface TeacherHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TeacherHelpModal({
  isOpen,
  onClose,
}: TeacherHelpModalProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>("classroom");

  if (!isOpen) return null;

  const toggleAccordion = (id: string) => {
    setActiveAccordion((prev) => (prev === id ? null : id));
  };

  const guides = [
    {
      id: "classroom",
      icon: BookOpen,
      iconColor: "text-blue-600 bg-blue-50 border-blue-200",
      title: "Classroom Guru & Manajemen Kelas",
      desc: "Panduan membuat kelas, membagikan token, dan mengelola tugas",
      items: [
        {
          q: "Bagaimana cara membuat kelas baru?",
          a: "Klik ikon Tambah (+) di navbar atas > pilih 'Buat Kelas Baru & Token'. Isi nama kelas, mata pelajaran (Matematika Kelas 8), ruang, dan pilih tema warna banner kelas.",
        },
        {
          q: "Bagaimana cara siswa bergabung ke kelas?",
          a: "Setiap kelas memiliki Kode Token unik (misalnya: MAT-8A). Berikan kode tersebut kepada siswa untuk dimasukkan pada menu 'Gabung Kelas' di dashboard siswa mereka.",
        },
        {
          q: "Bagaimana cara mengunggah tugas atau materi?",
          a: "Buka kelas yang Anda tuju > masuk ke tab 'Classwork (Tugas Kelas)' > klik tombol '+ Buat Tugas Baru' > tentukan judul, instruksi, batas waktu pengumpulan, dan materi referensi.",
        },
      ],
    },
    {
      id: "bank_soal",
      icon: FileText,
      iconColor: "text-indigo-600 bg-indigo-50 border-indigo-200",
      title: "Bank Soal & Generator AI",
      desc: "Kurasi soal, filter bab Kurikulum Merdeka, dan terbitkan soal",
      items: [
        {
          q: "Bagaimana menyaring soal berdasarkan Bab pembelajaran?",
          a: "Buka Bank Soal melalui menu 9-titik (Aplikasi & Portal Akademik). Gunakan dropdown 'Semua Bab' untuk memfilter soal per bab (contoh: Teorema Pythagoras, Persamaan Linear, dll).",
        },
        {
          q: "Bagaimana alur tinjauan Review Gate soal AI?",
          a: "Semua soal yang dihasilkan oleh Generator AI tidak langsung tayang ke siswa, melainkan berstatus 'Draft / Perlu Review'. Guru dapat mengklik 'Edit & Tinjau' untuk memeriksa kunci jawaban dan pembahasan, lalu menekan 'Terbitkan' agar soal masuk ke latihan siswa.",
        },
      ],
    },
    {
      id: "penilaian",
      icon: Bot,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
      title: "Penilaian & Koreksi Esai AI",
      desc: "Koreksi otomatis jawaban esai siswa berbasis rubrik kriteria",
      items: [
        {
          q: "Bagaimana AI memberikan nilai pada jawaban esai?",
          a: "AI menganalisis jawaban esai siswa berdasarkan 4 rubrik: Pemahaman Konsep (30%), Ketepatan Langkah Matematika (30%), Kebenaran Jawaban Akhir (25%), dan Kejelasan Struktur Penjelasan (15%).",
        },
        {
          q: "Apakah guru dapat merevisi skor yang diberikan AI?",
          a: "Tentu saja. Guru memiliki kendali penuh! Anda dapat mengubah angka nilai secara manual di kolom input nilai, menambahkan catatan masukan untuk siswa, lalu klik 'Simpan & Setujui Nilai'.",
        },
      ],
    },
    {
      id: "presensi",
      icon: UserCheck,
      iconColor: "text-amber-600 bg-amber-50 border-amber-200",
      title: "Presensi & Kehadiran Siswa",
      desc: "Verifikasi kehadiran harian dan rekap status presensi",
      items: [
        {
          q: "Bagaimana presensi kehadiran siswa dicatat?",
          a: "Siswa melakukan presensi foto selfie setiap pagi sekolah sebelum jam batas (08.00 WIB). Kehadiran sebelum jam batas tercatat Hadir Tepat Waktu, melewati jam batas tercatat Terlambat, dan jika tidak absen tercatat Alpha.",
        },
        {
          q: "Di mana guru memverifikasi presensi?",
          a: "Buka menu 'Presensi & Siswa' di sidebar kiri. Guru dapat melihat foto presensi harian, mengubah status kehadiran siswa jika diperlukan (misal: Sakit/Izin), dan menekan 'Simpan & Verifikasi'.",
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-200/80 flex items-center justify-between shrink-0 bg-slate-50/60">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#041E49] text-white flex items-center justify-center shadow-xs shrink-0">
              <LifeBuoy className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Pusat Bantuan & Panduan Pendidik
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Panduan praktis fitur Thinksy LMS untuk Guru & Wali Kelas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal bantuan"
            className="w-9 h-9 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body with Accordions */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1 text-slate-800 text-xs">
          {guides.map((g) => {
            const Icon = g.icon;
            const isOpen = activeAccordion === g.id;

            return (
              <div
                key={g.id}
                className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs transition"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(g.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition cursor-pointer gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${g.iconColor}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900">
                        {g.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {g.desc}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-slate-400">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-slate-100 bg-slate-50/40">
                    {g.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1"
                      >
                        <div className="font-bold text-slate-900 text-xs">
                          {item.q}
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Kontak Bantuan Teknis */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 flex items-center justify-between gap-4 mt-4">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900 text-xs">
                Butuh Bantuan Kendala Akun / Kurikulum?
              </div>
              <div className="text-[11px] text-slate-600">
                Email Dukungan: <span className="font-semibold text-blue-700">support@thinksy.id</span> • Administrator Sekolah: SMK Muhammadiyah 1
              </div>
            </div>
            <a
              href="mailto:support@thinksy.id"
              className="px-3.5 py-2 rounded-xl bg-[#041E49] hover:bg-[#072c69] text-white font-semibold text-[11px] transition shrink-0 flex items-center gap-1.5"
            >
              <span>Hubungi Tim</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200/80 bg-slate-50/60 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition cursor-pointer"
          >
            Tutup Pusat Bantuan
          </button>
        </div>
      </div>
    </div>
  );
}

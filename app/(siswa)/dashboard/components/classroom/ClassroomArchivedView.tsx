"use client";

import Link from "next/link";
import { Archive, Award, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { UjianItem } from "../../types";

interface ClassroomArchivedViewProps {
  examsData: UjianItem[];
  onBackToHome: () => void;
}

export default function ClassroomArchivedView({
  examsData,
  onBackToHome,
}: ClassroomArchivedViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Ruang Asesmen & Ujian Diarsipkan (Archived Classes & Exams)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar sesi penilaian formatif, ujian tengah semester (PTS), dan riwayat ujian yang telah selesai.
          </p>
        </div>

        <Link
          href="/ujian"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          <span>Buka Portal Ujian CBT Lengkap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {examsData.map((exam) => (
          <div
            key={exam.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {exam.mapel}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    exam.sessionStatus === "selesai"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {exam.sessionStatus === "selesai" ? "Selesai" : "Tersedia"}
                </span>
              </div>

              <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                {exam.judul}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                {exam.deskripsi || "Asesmen evaluasi pemahaman materi semester ganjil."}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Durasi: {exam.durasi_menit} Menit
              </span>
              <Link
                href="/ujian"
                className="font-bold text-[#1967D2] hover:underline"
              >
                Lihat Detail →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

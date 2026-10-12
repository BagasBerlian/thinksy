"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  ArrowRight,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { DailyMission, UjianItem } from "../../types";

export interface LastActivityItem {
  type: "bab" | "quiz";
  id: string;
  judul: string;
  mapel: string;
  link: string;
  updatedAt?: string;
}

interface ClassroomTodoViewProps {
  dailyMissions: DailyMission[];
  isMissionsLoading: boolean;
  isClaimingMissionId: string | null;
  onClaimMission: (id: string) => void;
  examsData: UjianItem[];
  lastActivity?: LastActivityItem | null;
  onBackToHome: () => void;
}

export default function ClassroomTodoView({
  dailyMissions,
  isMissionsLoading,
  isClaimingMissionId,
  onClaimMission,
  examsData,
  lastActivity,
  onBackToHome,
}: ClassroomTodoViewProps) {
  const [filterTab, setFilterTab] = useState<"assigned" | "missing" | "done">("assigned");

  const pendingMissions = dailyMissions.filter((m) => !m.isClaimed);
  const doneMissions = dailyMissions.filter((m) => m.isClaimed);
  const activeExams = examsData.filter(
    (e) => e.status === "dipublikasi" && e.sessionStatus !== "selesai"
  );
  const finishedExams = examsData.filter((e) => e.sessionStatus === "selesai");
  const assignedCount = pendingMissions.length + activeExams.length + (lastActivity ? 1 : 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold mb-1.5 transition cursor-pointer"
          >
            <span>← Kembali ke Home</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Daftar Tugas & Misi (To-do)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola seluruh penugasan mandiri, materi terakhir, misi harian Thinksy, dan jadwal asesmen formatif.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold">
          <button
            onClick={() => setFilterTab("assigned")}
            className={`px-4 py-1.5 rounded-full transition cursor-pointer ${
              filterTab === "assigned"
                ? "bg-white text-[#1967D2] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Ditugaskan ({assignedCount})
          </button>
          <button
            onClick={() => setFilterTab("done")}
            className={`px-4 py-1.5 rounded-full transition cursor-pointer ${
              filterTab === "done"
                ? "bg-white text-[#1967D2] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Selesai ({doneMissions.length + finishedExams.length})
          </button>
        </div>
      </div>

      {/* Content based on tab */}
      {filterTab === "assigned" && (
        <div className="space-y-6">
          {/* Section 0: Lanjutkan Pembelajaran Terakhir (Integrasi Bab/Kuis Terakhir) */}
          {lastActivity && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Pembelajaran & Kuis Terakhir</span>
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-400 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
                        {lastActivity.type === "quiz" ? "Kuis Terakhir" : "Lanjutkan Pembelajaran Terakhir"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200/70">
                        {lastActivity.mapel || "Informatika"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200/70">
                        Belum Selesai
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-black text-[#0F172A]">
                      {lastActivity.judul}
                    </div>
                  </div>
                </div>
                <Link
                  href={lastActivity.link}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition shadow-xs cursor-pointer hover:scale-105 shrink-0 self-end sm:self-center"
                >
                  <span>{lastActivity.type === "quiz" ? "Lanjutkan Kuis" : "Lanjutkan Belajar"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Section 1: Misi Harian Belajar */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
              <span>Misi harianku ({pendingMissions.length})</span>
            </h2>

            {pendingMissions.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                🎉 Luar biasa! Seluruh misi belajar hari ini telah Anda selesaikan.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {pendingMissions.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                        {m.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Target: {m.currentCount} dari {m.targetCount} tercapai
                      </div>
                      <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Hadiah: +{m.rewardPoints} Poin</span>
                      </div>
                    </div>

                    {m.isCompleted ? (
                      <button
                        onClick={() => onClaimMission(m.id)}
                        disabled={isClaimingMissionId === m.id}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
                      >
                        {isClaimingMissionId === m.id ? "Memproses..." : "Klaim Poin"}
                      </button>
                    ) : (
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium shrink-0">
                        Belum Selesai
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Ulangan & Ujian Mendatang */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Ulangan & Ujian Aktif ({activeExams.length})</span>
            </h2>

            {activeExams.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                Tidak ada ulangan atau ujian aktif yang membutuhkan pengerjaan saat ini.
              </div>
            ) : (
              <div className="space-y-3">
                {activeExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{exam.judul}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {exam.mapel} • Durasi {exam.durasi_menit} Menit • Passing Grade {exam.passing_grade}
                      </p>
                    </div>

                    <Link
                      href="/ujian"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition self-end sm:self-center"
                    >
                      <span>Masuk Ruang Ujian</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {filterTab === "done" && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Misi & Tugas yang Telah Diselesaikan
          </h2>

          <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {doneMissions.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">{m.title}</div>
                    <div className="text-[11px] text-slate-400">Poin Belajar Telah Diklaim</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  +{m.rewardPoints} Poin
                </span>
              </div>
            ))}

            {finishedExams.map((e) => (
              <div key={e.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">{e.judul}</div>
                    <div className="text-[11px] text-slate-400">{e.mapel} • Ujian Selesai</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                  Nilai: {e.score ?? "Terkumpul"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

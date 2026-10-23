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
import { useLanguage } from "@/hooks/useLanguage";

export interface LastActivityItem {
  type: "bab" | "quiz";
  id: string;
  judul: string;
  mapel: string;
  link: string;
  updatedAt?: string;
}

interface ClassroomTodoViewProps {
  dailyMissions?: DailyMission[];
  isMissionsLoading?: boolean;
  isClaimingMissionId?: string | null;
  onClaimMission?: (id: string) => void;
  examsData: UjianItem[];
  lastActivity?: LastActivityItem | null;
  onBackToHome: () => void;
}

export default function ClassroomTodoView({
  examsData,
  lastActivity,
  onBackToHome,
}: ClassroomTodoViewProps) {
  const { t } = useLanguage();
  const [filterTab, setFilterTab] = useState<"assigned" | "missing" | "done">("assigned");

  const activeExams = examsData.filter(
    (e) => e.status === "dipublikasi" && e.sessionStatus !== "selesai"
  );
  const finishedExams = examsData.filter((e) => e.sessionStatus === "selesai");
  const assignedCount = activeExams.length + (lastActivity ? 1 : 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold mb-1.5 transition cursor-pointer"
          >
            <span>{t.backToHome}</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {t.assignmentsAndTasks}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.todoSubtitle}
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
            {t.assigned} ({assignedCount})
          </button>
          <button
            onClick={() => setFilterTab("done")}
            className={`px-4 py-1.5 rounded-full transition cursor-pointer ${
              filterTab === "done"
                ? "bg-white text-[#1967D2] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.done} ({finishedExams.length})
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
                <span>{t.recentLearning}</span>
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-400 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
                        {lastActivity.type === "quiz" ? t.continueQuiz : t.continueLearning}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200/70">
                        {lastActivity.mapel || "Matematika"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200/70">
                        {t.inProgress}
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
                  <span>{lastActivity.type === "quiz" ? t.continueQuiz : t.continueLearning}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Section: Ulangan & Ujian Mendatang */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>{t.activeExamsCount} ({activeExams.length})</span>
            </h2>

            {activeExams.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                {t.noActiveExams}
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
                        {exam.mapel} • {exam.durasi_menit} Min • Passing Grade {exam.passing_grade}
                      </p>
                    </div>

                    <Link
                      href="/ujian"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition self-end sm:self-center"
                    >
                      <span>{t.enterExamRoom}</span>
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
            {t.completedTasks}
          </h2>

          {finishedExams.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              {t.noCompletedExams}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {finishedExams.map((e) => (
                <div key={e.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800">{e.judul}</div>
                      <div className="text-[11px] text-slate-400">{e.mapel} • {t.done}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                    {e.score !== undefined && e.score !== null ? `Score: ${e.score}` : t.done}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

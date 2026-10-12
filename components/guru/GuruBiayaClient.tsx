"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Coins,
  Cpu,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  Sparkles,
  Bot,
  FileCheck2,
  ListOrdered,
  ChevronRight,
  RefreshCw,
  Search,
  Zap,
} from "lucide-react";

export interface LogAiItem {
  id: string;
  fitur: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  biaya_usd: number;
  biaya_idr: number;
  dibuat_pada: string;
}

export interface DailyAggregate {
  date: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  costIdr: number;
}

export interface FeatureAggregate {
  fitur: string;
  label: string;
  count: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costIdr: number;
}

interface GuruBiayaClientProps {
  summary: {
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalTokens: number;
    totalBiayaUsd: number;
    totalBiayaIdr: number;
    todayPromptTokens: number;
    todayCompletionTokens: number;
    todayTokens: number;
    todayCostIdr: number;
  };
  dailyAggregates: DailyAggregate[];
  featureAggregates: FeatureAggregate[];
  recentLogs: LogAiItem[];
}

export default function GuruBiayaClient({
  summary,
  dailyAggregates,
  featureAggregates,
  recentLogs,
}: GuruBiayaClientProps) {
  const [activeTab, setActiveTab] = useState<"daily" | "features" | "logs">("daily");
  const [searchQuery, setSearchQuery] = useState("");

  const formatNumber = (num: number) => num.toLocaleString("id-ID");
  const formatRupiah = (num: number) => `Rp ${Math.round(num).toLocaleString("id-ID")}`;

  const getFeatureBadge = (fitur: string) => {
    switch (fitur) {
      case "tutor_sokratik":
        return {
          label: "Tutor Sokratik AI",
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: Bot,
        };
      case "grading_esai":
        return {
          label: "Grading Esai Otomatis",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: FileCheck2,
        };
      case "generate_soal":
        return {
          label: "Generator Soal Pembelajaran",
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          icon: ListOrdered,
        };
      default:
        return {
          label: fitur,
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          icon: Sparkles,
        };
    }
  };

  const filteredLogs = recentLogs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return log.fitur.toLowerCase().includes(q) || log.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ─── 1. HEADER SECTION (Anti-AI Human Touch) ─── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Monitoring Biaya & Token AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
            Pantau total token masuk, token keluar, dan estimasi biaya operasional model Claude AI per hari secara transparan dan akurat.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/guru"
            className="py-2.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>

      {/* ─── 2. EMPAT KARTU VISUAL RINGKAS (Modern Soft Educational) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Akumulasi Biaya Hari Ini */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Estimasi Biaya Hari Ini
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight">
              {formatRupiah(summary.todayCostIdr)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Total Keseluruhan:</span>
              <strong className="text-emerald-700 font-bold">{formatRupiah(summary.totalBiayaIdr)}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Token Masuk (Prompt) */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Token Masuk (Prompt)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shadow-2xs">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight">
              {formatNumber(summary.totalPromptTokens)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Hari ini:</span>
              <strong className="text-blue-700 font-bold">+{formatNumber(summary.todayPromptTokens)} tokens</strong>
            </div>
          </div>
        </div>

        {/* Card 3: Token Keluar (Completion) */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Token Keluar (Output)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shadow-2xs">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight">
              {formatNumber(summary.totalCompletionTokens)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Hari ini:</span>
              <strong className="text-purple-700 font-bold">+{formatNumber(summary.todayCompletionTokens)} tokens</strong>
            </div>
          </div>
        </div>

        {/* Card 4: Total Penggunaan Token */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Akumulasi Total Token
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shadow-2xs">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight">
              {formatNumber(summary.totalTokens)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Biaya Global:</span>
              <strong className="text-amber-700 font-bold">${summary.totalBiayaUsd.toFixed(4)} USD</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. TAB CONTROLS (Daily Breakdown, Feature Breakdown, Activity Logs) ─── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 text-xs font-bold gap-1 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeTab === "daily"
                  ? "bg-white text-emerald-800 shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Biaya Per Hari</span>
            </button>
            <button
              onClick={() => setActiveTab("features")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeTab === "features"
                  ? "bg-white text-emerald-800 shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Rincian Fitur</span>
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeTab === "logs"
                  ? "bg-white text-emerald-800 shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Log Transaksi ({recentLogs.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Kurs Konversi: <strong>1 USD = Rp 16.000</strong>
          </div>
        </div>

        {/* TAB 1: DAILY ACCUMULATION */}
        {activeTab === "daily" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dailyAggregates.map((day, idx) => (
                <div
                  key={day.date}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-emerald-200 transition space-y-3 shadow-2xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 font-heading">
                      {new Date(day.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {idx === 0 && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Hari Ini
                      </span>
                    )}
                  </div>

                  <div className="pt-1">
                    <div className="text-xl font-black text-emerald-800 font-heading">
                      {formatRupiah(day.costIdr)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ${day.costUsd.toFixed(4)} USD
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Token Masuk</span>
                      <strong className="text-slate-700">{formatNumber(day.promptTokens)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Token Keluar</span>
                      <strong className="text-slate-700">{formatNumber(day.completionTokens)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: FEATURE BREAKDOWN */}
        {activeTab === "features" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featureAggregates.map((feat) => {
              const meta = getFeatureBadge(feat.fitur);
              const IconComp = meta.icon;

              return (
                <div
                  key={feat.fitur}
                  className="p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                      <IconComp className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 font-heading leading-tight">
                        {feat.label}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {feat.count} kali eksekusi
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="text-2xl font-black text-slate-900 font-heading">
                      {formatRupiah(feat.costIdr)}
                    </div>
                    <div className="text-xs text-slate-500">
                      Total {formatNumber(feat.totalTokens)} tokens
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Prompt (Masuk):</span>
                      <strong>{formatNumber(feat.promptTokens)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Completion (Keluar):</span>
                      <strong>{formatNumber(feat.completionTokens)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: ACTIVITY LOGS */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari fitur AI atau ID transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-extrabold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Fitur AI</th>
                    <th className="py-3 px-4">Token Masuk</th>
                    <th className="py-3 px-4">Token Keluar</th>
                    <th className="py-3 px-4">Total Token</th>
                    <th className="py-3 px-4">Estimasi Biaya</th>
                    <th className="py-3 px-4 text-right">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLogs.map((item) => {
                    const badge = getFeatureBadge(item.fitur);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">{formatNumber(item.prompt_tokens)}</td>
                        <td className="py-3 px-4 font-mono">{formatNumber(item.completion_tokens)}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatNumber(item.total_tokens)}</td>
                        <td className="py-3 px-4 font-bold text-emerald-700 font-mono">
                          {formatRupiah(item.biaya_idr)}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                          {new Date(item.dibuat_pada).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { Trophy, RefreshCw, Loader2, Crown } from "lucide-react";
import { LeaderboardStudent } from "../../types";

/* -------------------------------------------------------------------------- */
/* REALISTIC METALLIC MEDAL ICONS (TOP 3)                                    */
/* -------------------------------------------------------------------------- */

function GoldMedalIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Medali Emas Juara 1"
    >
      <defs>
        {/* Ribbon Gradients */}
        <linearGradient id="goldRibbonL" x1="16" y1="2" x2="30" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="50%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
        <linearGradient id="goldRibbonR" x1="48" y1="2" x2="34" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
        <linearGradient id="goldRibbonStripeL" x1="20" y1="2" x2="31" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>
        <linearGradient id="goldRibbonStripeR" x1="44" y1="2" x2="33" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#FACC15" />
        </linearGradient>

        {/* Metallic Coin Gradients */}
        <linearGradient id="goldRim" x1="14" y1="20" x2="50" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="25%" stopColor="#FACC15" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="75%" stopColor="#CA8A04" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <radialGradient id="goldFace" cx="30" cy="36" r="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="45%" stopColor="#FDE047" />
          <stop offset="80%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
        <linearGradient id="goldNumberGrad" x1="32" y1="30" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <filter id="goldGlow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#78350F" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Ribbons */}
      <g filter="url(#goldGlow)">
        <path d="M18 2 L32 24 L27 25 L13 2 Z" fill="url(#goldRibbonL)" />
        <path d="M21 2 L31 23 L28.5 23.5 L18.5 2 Z" fill="url(#goldRibbonStripeL)" />
        <path d="M46 2 L32 24 L37 25 L51 2 Z" fill="url(#goldRibbonR)" />
        <path d="M43 2 L33 23 L35.5 23.5 L45.5 2 Z" fill="url(#goldRibbonStripeR)" />
      </g>

      {/* Hanger Ring */}
      <rect x="29" y="21" width="6" height="5" rx="1.5" fill="url(#goldRim)" />

      {/* Outer Coin Body */}
      <circle cx="32" cy="40" r="19" fill="url(#goldRim)" filter="url(#goldGlow)" />
      <circle cx="32" cy="40" r="16.5" fill="none" stroke="#FEF08A" strokeWidth="0.8" opacity="0.9" />
      <circle cx="32" cy="40" r="15.5" fill="url(#goldFace)" />

      {/* Specular Highlight Arc */}
      <path
        d="M20 33 C 24 25, 40 25, 44 33 C 39 28, 25 28, 20 33 Z"
        fill="#FFFFFF"
        opacity="0.55"
      />

      {/* Laurel Wreath Engravings */}
      <path d="M21 41 C 21 37, 23 33, 27 30 C 26 33, 24 37, 25 41 Z" fill="#92400E" opacity="0.7" />
      <path d="M23 44 C 23 41, 25 38, 28 36 C 27 38, 26 41, 26 44 Z" fill="#92400E" opacity="0.6" />
      <path d="M43 41 C 43 37, 41 33, 37 30 C 38 33, 40 37, 39 41 Z" fill="#92400E" opacity="0.7" />
      <path d="M41 44 C 41 41, 39 38, 36 36 C 37 38, 38 41, 38 44 Z" fill="#92400E" opacity="0.6" />

      {/* Star above number */}
      <polygon
        points="32,27 33.2,30.2 36.5,30.4 34,32.4 34.8,35.6 32,33.8 29.2,35.6 30,32.4 27.5,30.4 30.8,30.2"
        fill="#FFFFFF"
        filter="drop-shadow(0px 1px 1px #92400E)"
      />

      {/* Number 1 */}
      <text
        x="32"
        y="48"
        textAnchor="middle"
        fontSize="16"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        fill="url(#goldNumberGrad)"
        filter="drop-shadow(0px 1.5px 1px #78350F)"
        letterSpacing="-0.5px"
      >
        1
      </text>
    </svg>
  );
}

function SilverMedalIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Medali Perak Juara 2"
    >
      <defs>
        {/* Ribbon Gradients (Royal Blue & Silver Stripe) */}
        <linearGradient id="silverRibbonL" x1="16" y1="2" x2="30" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="silverRibbonR" x1="48" y1="2" x2="34" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="silverRibbonStripeL" x1="20" y1="2" x2="31" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        <linearGradient id="silverRibbonStripeR" x1="44" y1="2" x2="33" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        {/* Silver Metallic Coin Gradients */}
        <linearGradient id="silverRim" x1="14" y1="20" x2="50" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="75%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <radialGradient id="silverFace" cx="30" cy="36" r="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#E2E8F0" />
          <stop offset="80%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </radialGradient>
        <linearGradient id="silverNumberGrad" x1="32" y1="30" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <filter id="silverGlow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#334155" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* Ribbons */}
      <g filter="url(#silverGlow)">
        <path d="M18 2 L32 24 L27 25 L13 2 Z" fill="url(#silverRibbonL)" />
        <path d="M21 2 L31 23 L28.5 23.5 L18.5 2 Z" fill="url(#silverRibbonStripeL)" />
        <path d="M46 2 L32 24 L37 25 L51 2 Z" fill="url(#silverRibbonR)" />
        <path d="M43 2 L33 23 L35.5 23.5 L45.5 2 Z" fill="url(#silverRibbonStripeR)" />
      </g>

      {/* Hanger Ring */}
      <rect x="29" y="21" width="6" height="5" rx="1.5" fill="url(#silverRim)" />

      {/* Outer Coin Body */}
      <circle cx="32" cy="40" r="19" fill="url(#silverRim)" filter="url(#silverGlow)" />
      <circle cx="32" cy="40" r="16.5" fill="none" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.9" />
      <circle cx="32" cy="40" r="15.5" fill="url(#silverFace)" />

      {/* Specular Highlight Arc */}
      <path
        d="M20 33 C 24 25, 40 25, 44 33 C 39 28, 25 28, 20 33 Z"
        fill="#FFFFFF"
        opacity="0.65"
      />

      {/* Laurel Wreath Engravings */}
      <path d="M21 41 C 21 37, 23 33, 27 30 C 26 33, 24 37, 25 41 Z" fill="#334155" opacity="0.5" />
      <path d="M23 44 C 23 41, 25 38, 28 36 C 27 38, 26 41, 26 44 Z" fill="#334155" opacity="0.4" />
      <path d="M43 41 C 43 37, 41 33, 37 30 C 38 33, 40 37, 39 41 Z" fill="#334155" opacity="0.5" />
      <path d="M41 44 C 41 41, 39 38, 36 36 C 37 38, 38 41, 38 44 Z" fill="#334155" opacity="0.4" />

      {/* Number 2 */}
      <text
        x="32"
        y="47"
        textAnchor="middle"
        fontSize="16"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        fill="url(#silverNumberGrad)"
        filter="drop-shadow(0px 1.5px 1px #334155)"
        letterSpacing="-0.5px"
      >
        2
      </text>
    </svg>
  );
}

function BronzeMedalIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Medali Perunggu Juara 3"
    >
      <defs>
        {/* Ribbon Gradients (Emerald & Warm Bronze Stripe) */}
        <linearGradient id="bronzeRibbonL" x1="16" y1="2" x2="30" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
        <linearGradient id="bronzeRibbonR" x1="48" y1="2" x2="34" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="bronzeRibbonStripeL" x1="20" y1="2" x2="31" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
        <linearGradient id="bronzeRibbonStripeR" x1="44" y1="2" x2="33" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFEDD5" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>

        {/* Bronze Metallic Coin Gradients */}
        <linearGradient id="bronzeRim" x1="14" y1="20" x2="50" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="25%" stopColor="#FB923C" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="75%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#7C2D12" />
        </linearGradient>
        <radialGradient id="bronzeFace" cx="30" cy="36" r="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFEDD5" />
          <stop offset="45%" stopColor="#FDBA74" />
          <stop offset="80%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#9A3412" />
        </radialGradient>
        <linearGradient id="bronzeNumberGrad" x1="32" y1="30" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#FFEDD5" />
          <stop offset="100%" stopColor="#7C2D12" />
        </linearGradient>
        <filter id="bronzeGlow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#7C2D12" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Ribbons */}
      <g filter="url(#bronzeGlow)">
        <path d="M18 2 L32 24 L27 25 L13 2 Z" fill="url(#bronzeRibbonL)" />
        <path d="M21 2 L31 23 L28.5 23.5 L18.5 2 Z" fill="url(#bronzeRibbonStripeL)" />
        <path d="M46 2 L32 24 L37 25 L51 2 Z" fill="url(#bronzeRibbonR)" />
        <path d="M43 2 L33 23 L35.5 23.5 L45.5 2 Z" fill="url(#bronzeRibbonStripeR)" />
      </g>

      {/* Hanger Ring */}
      <rect x="29" y="21" width="6" height="5" rx="1.5" fill="url(#bronzeRim)" />

      {/* Outer Coin Body */}
      <circle cx="32" cy="40" r="19" fill="url(#bronzeRim)" filter="url(#bronzeGlow)" />
      <circle cx="32" cy="40" r="16.5" fill="none" stroke="#FED7AA" strokeWidth="0.8" opacity="0.9" />
      <circle cx="32" cy="40" r="15.5" fill="url(#bronzeFace)" />

      {/* Specular Highlight Arc */}
      <path
        d="M20 33 C 24 25, 40 25, 44 33 C 39 28, 25 28, 20 33 Z"
        fill="#FFFFFF"
        opacity="0.55"
      />

      {/* Laurel Wreath Engravings */}
      <path d="M21 41 C 21 37, 23 33, 27 30 C 26 33, 24 37, 25 41 Z" fill="#7C2D12" opacity="0.6" />
      <path d="M23 44 C 23 41, 25 38, 28 36 C 27 38, 26 41, 26 44 Z" fill="#7C2D12" opacity="0.5" />
      <path d="M43 41 C 43 37, 41 33, 37 30 C 38 33, 40 37, 39 41 Z" fill="#7C2D12" opacity="0.6" />
      <path d="M41 44 C 41 41, 39 38, 36 36 C 37 38, 38 41, 38 44 Z" fill="#7C2D12" opacity="0.5" />

      {/* Number 3 */}
      <text
        x="32"
        y="47"
        textAnchor="middle"
        fontSize="16"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        fill="url(#bronzeNumberGrad)"
        filter="drop-shadow(0px 1.5px 1px #7C2D12)"
        letterSpacing="-0.5px"
      >
        3
      </text>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

interface TabPeringkatProps {
  leaderboardList: LeaderboardStudent[];
  isLoadingLeaderboard: boolean;
  onRefreshLeaderboard: () => void;
}

export default function TabPeringkat({
  leaderboardList,
  isLoadingLeaderboard,
  onRefreshLeaderboard,
}: TabPeringkatProps) {
  const hasTop3 = leaderboardList.length >= 3;
  const top1 = hasTop3 ? leaderboardList[0] : null;
  const top2 = hasTop3 ? leaderboardList[1] : null;
  const top3 = hasTop3 ? leaderboardList[2] : null;

  // Best practice: jika ada Top 3, tabel hanya menampilkan peringkat 4 dan seterusnya agar tidak duplikat dengan podium
  const tableStudents = hasTop3 ? leaderboardList.slice(3) : leaderboardList;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-14 space-y-8 animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <span>Peringkat Siswa Per Sekolah</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
            Peringkat diperbarui secara otomatis dan terhitung real-time langsung dari database setiap kali ada perolehan Poin Belajar baru.
          </p>
        </div>

        <button
          onClick={onRefreshLeaderboard}
          disabled={isLoadingLeaderboard}
          className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-[#0F172A] text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isLoadingLeaderboard ? "animate-spin text-amber-500" : ""
            }`}
          />
          <span>{isLoadingLeaderboard ? "Menyinkronkan..." : "Refresh Peringkat"}</span>
        </button>
      </div>

      {/* UNIFIED LEADERBOARD CONTAINER (Top 3 Podium + Continuation Table) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* TOP 3 PODIUM SECTION (Puncak Prestasi) */}
        {hasTop3 && (
          <div className="p-5 sm:p-8 bg-gradient-to-b from-slate-50/80 via-slate-50/30 to-white border-b border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-5xl mx-auto pt-3 pb-2">
              {/* Rank 2 (Silver) */}
              {top2 && (
                <div
                  className={`rounded-3xl p-5 border transition-all relative flex flex-col items-center text-center space-y-3 order-2 md:order-1 ${
                    top2.isCurrentUser
                      ? "bg-slate-50 border-slate-300 ring-2 ring-blue-500/20"
                      : "bg-white border-slate-200 shadow-2xs hover:shadow-sm"
                  }`}
                >
                  <div className="relative flex items-center justify-center my-0.5">
                    <div className="absolute inset-0 bg-slate-400/15 rounded-full blur-md scale-110" />
                    <SilverMedalIcon className="w-14 h-14 sm:w-16 sm:h-16 relative z-10 transition-transform duration-300 hover:scale-105" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Peringkat 2
                    </span>
                    <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center justify-center gap-1.5 mt-0.5">
                      <span className={top2.isCurrentUser ? "text-blue-600 font-black" : ""}>{top2.name}</span>
                      {top2.isCurrentUser && (
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[9px] font-black">
                          Anda
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">{top2.school}</p>
                  </div>
                  <div className="pt-2.5 border-t border-slate-100 w-full flex items-center justify-between text-xs px-2">
                    <span className="text-slate-400 text-[11px] font-medium">Poin Belajar</span>
                    <span className="font-black text-slate-800">
                      {top2.points.toLocaleString("id-ID")} XP
                    </span>
                  </div>
                </div>
              )}

              {/* Rank 1 (Gold - Center & Elevated) */}
              {top1 && (
                <div
                  className={`rounded-3xl p-6 border-2 transition-all relative flex flex-col items-center text-center space-y-3 order-1 md:order-2 shadow-md hover:shadow-lg ${
                    top1.isCurrentUser
                      ? "bg-amber-50/90 border-amber-400 ring-4 ring-amber-400/20"
                      : "bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 border-amber-300"
                  }`}
                >
                  <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Crown className="w-3 h-3 text-amber-950" />
                    <span>Puncak Prestasi</span>
                  </div>
                  <div className="relative flex items-center justify-center my-1">
                    <div className="absolute inset-0 bg-amber-400/25 rounded-full blur-lg scale-125" />
                    <GoldMedalIcon className="w-16 h-16 sm:w-20 sm:h-20 relative z-10 transition-transform duration-300 hover:scale-105" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase text-amber-700 tracking-wider">
                      Juara 1 Sekolah
                    </span>
                    <h3 className="text-base font-black text-[#0F172A] flex items-center justify-center gap-1.5 mt-0.5">
                      <span className={top1.isCurrentUser ? "text-amber-800 font-black" : ""}>{top1.name}</span>
                      {top1.isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          Akun Anda
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">{top1.school}</p>
                  </div>
                  <div className="pt-2.5 border-t border-amber-200/60 w-full flex items-center justify-between text-xs px-3">
                    <span className="text-amber-800/70 text-xs font-semibold">Total Poin Belajar</span>
                    <span className="font-black text-amber-600 text-sm">
                      {top1.points.toLocaleString("id-ID")} Poin
                    </span>
                  </div>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {top3 && (
                <div
                  className={`rounded-3xl p-5 border transition-all relative flex flex-col items-center text-center space-y-3 order-3 ${
                    top3.isCurrentUser
                      ? "bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20"
                      : "bg-white border-slate-200 shadow-2xs hover:shadow-sm"
                  }`}
                >
                  <div className="relative flex items-center justify-center my-0.5">
                    <div className="absolute inset-0 bg-amber-600/15 rounded-full blur-md scale-110" />
                    <BronzeMedalIcon className="w-14 h-14 sm:w-16 sm:h-16 relative z-10 transition-transform duration-300 hover:scale-105" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                      Peringkat 3
                    </span>
                    <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center justify-center gap-1.5 mt-0.5">
                      <span className={top3.isCurrentUser ? "text-blue-600 font-black" : ""}>{top3.name}</span>
                      {top3.isCurrentUser && (
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[9px] font-black">
                          Anda
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">{top3.school}</p>
                  </div>
                  <div className="pt-2.5 border-t border-slate-100 w-full flex items-center justify-between text-xs px-2">
                    <span className="text-slate-400 text-[11px] font-medium">Poin Belajar</span>
                    <span className="font-black text-slate-800">
                      {top3.points.toLocaleString("id-ID")} XP
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOADING & EMPTY STATES */}
        {isLoadingLeaderboard && leaderboardList.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            <span>Memuat data peringkat siswa secara real-time...</span>
          </div>
        ) : leaderboardList.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-3 px-4">
            <Trophy className="w-9 h-9 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-600 text-sm">Belum ada data siswa di papan peringkat.</p>
            <p className="text-slate-400 max-w-sm mx-auto text-[11px]">
              Selesaikan materi dan kuis untuk menjadi yang pertama mencetak poin di sekolahmu!
            </p>
            <button
              onClick={onRefreshLeaderboard}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
            >
              Segarkan Data
            </button>
          </div>
        ) : (
          <div>
            {/* CONTINUATION TABLE */}
            {tableStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                      <th className="py-3.5 px-4 sm:px-6">Peringkat</th>
                      <th className="py-3.5 px-4 sm:px-6">Nama Siswa</th>
                      <th className="py-3.5 px-4 sm:px-6">Sekolah</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Total Poin Belajar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {tableStudents.map((st) => (
                      <tr
                        key={st.id}
                        className={`transition-colors hover:bg-slate-50/80 ${
                          st.isCurrentUser
                            ? "bg-blue-50/30 hover:bg-blue-50/50 font-bold border-l-4 border-l-blue-400"
                            : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 sm:px-6 font-black">
                          {st.rank === 1 ? (
                            <span className="inline-flex items-center justify-center min-w-7 h-7 px-1.5 rounded-lg bg-amber-400 text-amber-950 font-black text-xs shadow-xs border border-amber-300">
                              #1
                            </span>
                          ) : st.rank === 2 ? (
                            <span className="inline-flex items-center justify-center min-w-7 h-7 px-1.5 rounded-lg bg-slate-200 text-slate-800 font-black text-xs border border-slate-300">
                              #2
                            </span>
                          ) : st.rank === 3 ? (
                            <span className="inline-flex items-center justify-center min-w-7 h-7 px-1.5 rounded-lg bg-amber-100 text-amber-900 font-black text-xs border border-amber-300">
                              #3
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center justify-center min-w-7 h-7 px-1.5 rounded-lg text-xs font-extrabold ${
                                st.isCurrentUser
                                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                                  : "bg-slate-100/90 text-slate-600 border border-slate-200/60"
                              }`}
                            >
                              #{st.rank}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 font-bold">
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                st.isCurrentUser
                                  ? "text-blue-600 font-extrabold"
                                  : "text-[#0F172A]"
                              }
                            >
                              {st.name}
                            </span>
                            {st.isCurrentUser && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-[9px] font-black shrink-0">
                                Akun Anda
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-slate-600">{st.school}</td>
                        <td className="py-3.5 px-4 sm:px-6 text-right font-extrabold text-[#0F172A]">
                          <span className="text-amber-600 text-sm">
                            {st.points.toLocaleString("id-ID")}
                          </span>{" "}
                          Poin
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : hasTop3 ? (
              <div className="py-10 px-6 text-center text-xs text-slate-500 space-y-1">
                <p className="font-bold text-slate-700">
                  Seluruh siswa terdaftar ({leaderboardList.length} siswa) telah ditampilkan pada podium 3 besar di atas.
                </p>
                <p className="text-slate-400 text-[11px]">
                  Siswa lainnya akan otomatis muncul di tabel ini setelah mulai mengumpulkan poin belajar.
                </p>
              </div>
            ) : null}

            {/* Table Footer Summary */}
            {leaderboardList.length > 0 && (
              <div className="px-4 sm:px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-600">
                  {hasTop3 && tableStudents.length > 0
                    ? `Menampilkan peringkat 4 hingga ${leaderboardList.length} (total ${leaderboardList.length} siswa terdaftar)`
                    : `Menampilkan total ${leaderboardList.length} siswa terdaftar`}
                </span>
                <span className="text-[11px] text-slate-400">
                  Poin diperbarui secara otomatis dan real-time
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

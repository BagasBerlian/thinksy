"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Palette,
  Layout,
  CheckCircle2,
  Save,
  Check,
  Eye,
  Sliders,
  Sparkles,
  Columns,
  Grid,
  Maximize,
  Moon,
  Sun,
  Shield,
  RotateCcw,
} from "lucide-react";

export interface GuruLayoutConfig {
  layoutStyle: "grid" | "single" | "compact";
  showCardGuru: boolean;
  showAkuLulusControl: boolean;
  showQuickStats: boolean;
  showLeaderboardPreview: boolean;
}

export const DEFAULT_LAYOUT_CONFIG: GuruLayoutConfig = {
  layoutStyle: "grid",
  showCardGuru: true,
  showAkuLulusControl: true,
  showQuickStats: true,
  showLeaderboardPreview: true,
};

export const GURU_THEMES = [
  {
    id: "slate",
    name: "Midnight Slate & Amber",
    subtitle: "Tema Standar THINKSY — Kontras elegan & profesional",
    primaryColor: "#0F172A",
    accentColor: "#F59E0B",
    bgClass: "bg-[#F8FAFC]",
    previewBg: "from-[#0F172A] to-[#1E293B]",
    borderClass: "border-slate-200",
  },
  {
    id: "blue",
    name: "Royal Sapphire (Biru)",
    subtitle: "Fokus akademik, tenang, dan terstruktur",
    primaryColor: "#0369A1",
    accentColor: "#38BDF8",
    bgClass: "bg-[#F0F9FF]",
    previewBg: "from-[#0C4A6E] to-[#0284C7]",
    borderClass: "border-sky-200",
  },
  {
    id: "emerald",
    name: "Emerald Education (Hijau)",
    subtitle: "Harmonis, segar, dan berwawasan lingkungan",
    primaryColor: "#047857",
    accentColor: "#34D399",
    bgClass: "bg-[#F0FDF4]",
    previewBg: "from-[#064E3B] to-[#059669]",
    borderClass: "border-emerald-200",
  },
  {
    id: "purple",
    name: "Amethyst Purple (Ungu)",
    subtitle: "Kreatif, modern, dan bernalar tinggi",
    primaryColor: "#6D28D9",
    accentColor: "#C084FC",
    bgClass: "bg-[#FAF5FF]",
    previewBg: "from-[#4C1D95] to-[#7C3AED]",
    borderClass: "border-purple-200",
  },
  {
    id: "amber",
    name: "Golden Sunset (Kuning Emas)",
    subtitle: "Hangat, ramah, dan membakar semangat belajar",
    primaryColor: "#B45309",
    accentColor: "#FBBF24",
    bgClass: "bg-[#FFFBEB]",
    previewBg: "from-[#78350F] to-[#D97706]",
    borderClass: "border-amber-200",
  },
  {
    id: "dark",
    name: "Midnight OLED (Mode Gelap)",
    subtitle: "Minim silau untuk sesi evaluasi malam hari",
    primaryColor: "#020617",
    accentColor: "#38BDF8",
    bgClass: "bg-[#090D16]",
    previewBg: "from-[#020617] to-[#0F172A]",
    borderClass: "border-slate-800",
  },
];

export default function PengaturanNormalScreen() {
  const [layoutConfig, setLayoutConfig] = useState<GuruLayoutConfig>(DEFAULT_LAYOUT_CONFIG);
  const [activeThemeId, setActiveThemeId] = useState<string>("slate");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Load persisted settings on mount
  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem("thinksy_guru_layout");
      if (savedLayout) {
        setLayoutConfig(JSON.parse(savedLayout));
      }
      const savedTheme = localStorage.getItem("thinksy_guru_theme");
      if (savedTheme) {
        setActiveThemeId(savedTheme);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSelectTheme = (themeId: string) => {
    setActiveThemeId(themeId);
    try {
      localStorage.setItem("thinksy_guru_theme", themeId);
      window.dispatchEvent(new CustomEvent("guru_theme_changed", { detail: { themeId } }));
    } catch {
      // ignore
    }
    setSaveSuccessMessage(`Tema warna berhasil diubah ke: ${GURU_THEMES.find(t => t.id === themeId)?.name}`);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleSaveLayout = () => {
    try {
      localStorage.setItem("thinksy_guru_layout", JSON.stringify(layoutConfig));
      window.dispatchEvent(new CustomEvent("guru_layout_changed", { detail: layoutConfig }));
    } catch {
      // ignore
    }
    setSaveSuccessMessage("Pengaturan tata letak Homescreen berhasil disimpan!");
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  const handleResetLayout = () => {
    setLayoutConfig(DEFAULT_LAYOUT_CONFIG);
    try {
      localStorage.setItem("thinksy_guru_layout", JSON.stringify(DEFAULT_LAYOUT_CONFIG));
      window.dispatchEvent(new CustomEvent("guru_layout_changed", { detail: DEFAULT_LAYOUT_CONFIG }));
    } catch {
      // ignore
    }
    setSaveSuccessMessage("Tata letak Homescreen dikembalikan ke default.");
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER BANNER NORMAL SCREEN PENGATURAN */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-black border border-slate-200">
            <Settings className="w-3.5 h-3.5 text-indigo-600" />
            <span>NORMAL SCREEN: PENGATURAN LAYAR GURU</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Pengaturan Tata Letak & Warna Tema
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Kustomisasi tata letak Homescreen guru dan pilih skema palet warna yang paling nyaman untuk proses mengajar Anda.
          </p>
        </div>

        {/* Action Button Save */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleResetLayout}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
            title="Reset ke Standar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>
          <button
            onClick={handleSaveLayout}
            className="px-5 py-2.5 rounded-2xl bg-[#0F172A] hover:bg-indigo-600 text-white text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-black flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button onClick={() => setSaveSuccessMessage(null)} className="text-emerald-700 font-bold hover:underline">
            Tutup
          </button>
        </div>
      )}

      {/* 2. BAGIAN 1: PENGATURAN TATA LETAK / LAYOUT HOMESCREEN */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black border border-indigo-200">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0F172A]">
                1. Tata Letak (Layout) Homescreen Guru
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Pilih gaya presentasi dan komponen yang ingin ditampilkan saat membuka halaman Beranda.
              </p>
            </div>
          </div>
        </div>

        {/* Gaya Layout Selector */}
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
            Pilihan Format Tampilan:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Opsi 1: Modern Grid */}
            <div
              onClick={() => setLayoutConfig({ ...layoutConfig, layoutStyle: "grid" })}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                layoutConfig.layoutStyle === "grid"
                  ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <Grid className={`w-5 h-5 ${layoutConfig.layoutStyle === "grid" ? "text-indigo-600" : "text-slate-400"}`} />
                {layoutConfig.layoutStyle === "grid" && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                    Dipilih
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-sm font-black text-[#0F172A]">Modern Grid (2 Kolom)</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                  Susunan kartu seimbang dan dinamis. Rekomendasi standar layar laptop/desktop.
                </p>
              </div>
            </div>

            {/* Opsi 2: Single Column */}
            <div
              onClick={() => setLayoutConfig({ ...layoutConfig, layoutStyle: "single" })}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                layoutConfig.layoutStyle === "single"
                  ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <Columns className={`w-5 h-5 ${layoutConfig.layoutStyle === "single" ? "text-indigo-600" : "text-slate-400"}`} />
                {layoutConfig.layoutStyle === "single" && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                    Dipilih
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-sm font-black text-[#0F172A]">Lebar Penuh (1 Kolom)</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                  Fokus membaca kartu satu per satu secara linear ke bawah tanpa distraksi.
                </p>
              </div>
            </div>

            {/* Opsi 3: Compact Mode */}
            <div
              onClick={() => setLayoutConfig({ ...layoutConfig, layoutStyle: "compact" })}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                layoutConfig.layoutStyle === "compact"
                  ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <Maximize className={`w-5 h-5 ${layoutConfig.layoutStyle === "compact" ? "text-indigo-600" : "text-slate-400"}`} />
                {layoutConfig.layoutStyle === "compact" && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                    Dipilih
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-sm font-black text-[#0F172A]">Mode Kompak Ringkas</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                  Merapatkan jarak antar komponen untuk pemantauan cepat dalam satu layar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toggles Komponen Homescreen */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
            Komponen yang Ditampilkan di Homescreen:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Toggle 1: Card Guru */}
            <label className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-black text-[#0F172A] block">
                  CARD GURU (Foto, Jabatan, Umur, NIP)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Kartu profil lengkap pendidik di bagian atas Beranda.
                </span>
              </div>
              <input
                type="checkbox"
                checked={layoutConfig.showCardGuru}
                onChange={(e) => setLayoutConfig({ ...layoutConfig, showCardGuru: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            {/* Toggle 2: Panel Kontrol AkuLulus */}
            <label className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-black text-[#0F172A] block">
                  Settingan Ujian & Ulangan (Kontrol AkuLulus)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Sakelar sakral tombol buka/tutup asesmen untuk siswa.
                </span>
              </div>
              <input
                type="checkbox"
                checked={layoutConfig.showAkuLulusControl}
                onChange={(e) => setLayoutConfig({ ...layoutConfig, showAkuLulusControl: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            {/* Toggle 3: Statistik Cepat */}
            <label className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-black text-[#0F172A] block">
                  Statistik Ringkas & Jam Mengajar
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Kartu ringkasan 24 JP, 3 Rombel Binaan, dan 98.4% kepuasan.
                </span>
              </div>
              <input
                type="checkbox"
                checked={layoutConfig.showQuickStats}
                onChange={(e) => setLayoutConfig({ ...layoutConfig, showQuickStats: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            {/* Toggle 4: Leaderboard Top Siswa */}
            <label className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-black text-[#0F172A] block">
                  Pratinjau Leaderboard Top 3 Siswa
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Cuplikan siswa dengan poin tertinggi langsung di Beranda.
                </span>
              </div>
              <input
                type="checkbox"
                checked={layoutConfig.showLeaderboardPreview}
                onChange={(e) => setLayoutConfig({ ...layoutConfig, showLeaderboardPreview: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 3. BAGIAN 2: WARNA TEMA DI LAYAR GURU */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black border border-amber-200">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0F172A]">
                2. Warna Tema di Layar Guru
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Pilih skema warna tema layar guru. Perubahan akan langsung diaplikasikan secara real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Grid Palet Tema */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GURU_THEMES.map((theme) => {
            const isSelected = activeThemeId === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-400/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                {/* Visual Header Banner of Theme */}
                <div className={`h-16 rounded-2xl bg-gradient-to-r ${theme.previewBg} p-3 flex items-center justify-between text-white shadow-inner`}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-xs"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <span className="text-xs font-black">{theme.name.split(" ")[0]}</span>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-black text-[#0F172A] flex items-center justify-between">
                    <span>{theme.name}</span>
                    {isSelected && (
                      <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Aktif
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                    {theme.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                  <span className="text-[10px] font-bold text-slate-400">Palet Aksara & Navigasi</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

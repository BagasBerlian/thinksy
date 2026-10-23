"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Palette,
  Sparkles,
  Check,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import {
  ClassBannerGraphic,
  resolveIllustrationType,
} from "./ClassBannerGraphics";
import { THEME_COLORS } from "./CreateClassModal";

// Presets foto sekolah & edukasi berkualitas tinggi
export const PRESET_BANNER_PHOTOS = [
  {
    id: "lab-komputer",
    title: "Lab Komputer & TI",
    url: "/images/smk-muh-pakem-lab.jpg",
    category: "Teknologi",
  },
  {
    id: "kegiatan-belajar",
    title: "Kegiatan Belajar Aktif",
    url: "/images/smk-muh-pakem-kegiatan.jpg",
    category: "Akademik",
  },
  {
    id: "gedung-sekolah",
    title: "Gedung Sekolah & Kampus",
    url: "/images/smk-muh-pakem-gedung.jpg",
    category: "Sekolah",
  },
  {
    id: "thinksy-hero",
    title: "Modern Digital Class",
    url: "/images/thinksy-hero.jpg",
    category: "Modern",
  },
  {
    id: "praktik-industri",
    title: "Ruang Praktik Industri",
    url: "/images/smk-muh-pakem-industri.jpg",
    category: "Vokasi",
  },
  {
    id: "perpustakaan",
    title: "Perpustakaan & Literasi",
    url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
    category: "Literasi",
  },
];

// Pilihan Ikon Ilustrasi Visual Google Classroom
export const PRESET_ILLUSTRATIONS = [
  { id: "math", name: "Matematika & Rumus", desc: "Geometri, Aljabar, f(x)", icon: "📐" },
  { id: "english", name: "Bahasa Inggris", desc: 'Speech Bubbles "Hello!" & "Great!"', icon: "💬" },
  { id: "science", name: "IPA & Sains", desc: "Mikroskop, Lab Flask, Atom", icon: "🔬" },
  { id: "tech", name: "Informatika & Coding", desc: "Laptop, Kode, < / >", icon: "💻" },
  { id: "literature", name: "Bahasa & Sastra", desc: "Buku Terbuka & Pena Emas", icon: "📚" },
];

export interface CustomizeBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  classNameTitle?: string;
  sectionTitle?: string;
  roomTitle?: string;
  tokenCode?: string;
  initialType?: "illustration" | "photo";
  initialIllustration?: string;
  initialPhotoUrl?: string;
  initialThemeColor?: string;
  initialBgGradient?: string;
  onSave: (data: {
    bannerType: "illustration" | "photo";
    bannerIllustration: string;
    bannerPhotoUrl: string;
    themeColor: string;
    bgGradient: string;
  }) => void;
}

export default function CustomizeBannerModal({
  isOpen,
  onClose,
  classNameTitle = "Kelas",
  sectionTitle = "Fase D Kurikulum Merdeka",
  roomTitle = "Ruang Kelas",
  tokenCode = "thinksy",
  initialType = "illustration",
  initialIllustration = "math",
  initialPhotoUrl = "",
  initialThemeColor = "#2563EB",
  initialBgGradient = "from-blue-600 via-indigo-600 to-slate-950",
  onSave,
}: CustomizeBannerModalProps) {
  const [activeTab, setActiveTab] = useState<"illustration" | "photo">(
    initialType || (initialPhotoUrl ? "photo" : "illustration")
  );
  const [selectedIllustration, setSelectedIllustration] = useState<string>(
    initialIllustration || resolveIllustrationType("", classNameTitle)
  );
  const [photoUrl, setPhotoUrl] = useState<string>(
    initialPhotoUrl || PRESET_BANNER_PHOTOS[0].url
  );
  const [themeColor, setThemeColor] = useState<string>(initialThemeColor);
  const [bgGradient, setBgGradient] = useState<string>(initialBgGradient);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle upload foto dari komputer guru
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Pilih file foto/gambar yang valid (JPG, PNG, atau WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file foto maksimal 5MB.");
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoUrl(reader.result);
        setActiveTab("photo");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave({
      bannerType: activeTab,
      bannerIllustration: selectedIllustration,
      bannerPhotoUrl: activeTab === "photo" ? photoUrl : "",
      themeColor,
      bgGradient,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B57D0]/10 text-[#0B57D0] flex items-center justify-center font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">
                Sesuaikan Banner & Tampilan Kelas
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Pilih antara Ikon Ilustrasi Google Classroom atau Unggah Foto Kustom
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* LIVE BANNER PREVIEW */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-[#0B57D0]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pratinjau Banner Langsung (Live Preview)</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Mode: {activeTab === "photo" ? "📷 Foto Kustom" : "🎨 Ikon Ilustrasi"}
              </span>
            </div>

            {/* Banner Mockup Box */}
            <div
              className={`relative rounded-3xl bg-gradient-to-r ${bgGradient} text-white p-6 sm:p-7 overflow-hidden shadow-md min-h-[160px] sm:min-h-[190px] flex flex-col justify-between border border-white/20`}
              style={{ backgroundColor: themeColor }}
            >
              {/* Class Graphic Component */}
              <ClassBannerGraphic
                bannerType={activeTab}
                bannerIllustration={selectedIllustration}
                bannerPhotoUrl={photoUrl}
                subjectName={classNameTitle}
                isCompact={false}
              />

              {/* Text Header (Guaranteed readable via relative z-10 & shadow) */}
              <div className="relative z-10 space-y-1 max-w-xs sm:max-w-md drop-shadow-sm">
                <span className="inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 mb-1">
                  {roomTitle || "Ruang Kelas"}
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                  {classNameTitle}
                </h4>
                <p className="text-xs text-white/90 font-medium">
                  {sectionTitle}
                </p>
              </div>

              {/* Token badge at bottom */}
              <div className="relative z-10 flex items-center justify-between pt-3">
                <span className="text-[11px] text-white/80 font-medium">
                  Pengajar: Guru Pengampu
                </span>
                <span className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-white font-mono text-xs font-bold border border-white/20 shadow-xs">
                  Token: {tokenCode.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* TABS SELECTOR: IKON ILUSTRASI vs FOTO KUSTOM */}
          <div className="flex p-1 bg-slate-100 rounded-2xl gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("illustration")}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === "illustration"
                  ? "bg-white text-[#0B57D0] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Ikon & Ilustrasi Otomatis (Default)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("photo")}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === "photo"
                  ? "bg-white text-[#0B57D0] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Unggah Foto & Galeri</span>
            </button>
          </div>

          {/* TAB 1: PILIHAN ILUSTRASI */}
          {activeTab === "illustration" && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Desain Ilustrasi Mapel (Google Classroom Style)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_ILLUSTRATIONS.map((illu) => {
                  const isSelected = selectedIllustration === illu.id;
                  return (
                    <button
                      key={illu.id}
                      type="button"
                      onClick={() => setSelectedIllustration(illu.id)}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-blue-50/90 border-[#0B57D0] ring-2 ring-blue-500/20 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-2xl p-1.5 rounded-xl bg-slate-100/80">
                        {illu.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">
                            {illu.name}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#0B57D0] stroke-[3]" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {illu.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PILIHAN FOTO & UNGGAH FOTO */}
          {activeTab === "photo" && (
            <div className="space-y-4">
              {/* Tombol Unggah File Sendiri */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 hover:bg-blue-50/70 transition flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B57D0] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      Unggah Foto dari Perangkat Guru
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Format JPG, PNG, atau WEBP (Maksimal 5MB)
                    </p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-100/60 font-bold text-xs transition cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  Pilih File Foto
                </button>
              </div>

              {uploadError && (
                <p className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                  {uploadError}
                </p>
              )}

              {/* Galeri Preset Foto Sekolah & Pembelajaran */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Atau Pilih dari Galeri Foto Sekolah Pilihan
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_BANNER_PHOTOS.map((preset) => {
                    const isSelected = photoUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setPhotoUrl(preset.url);
                          setActiveTab("photo");
                        }}
                        className={`group relative rounded-2xl overflow-hidden border-2 text-left transition cursor-pointer aspect-video ${
                          isSelected
                            ? "border-[#0B57D0] ring-2 ring-blue-500/30 shadow-md scale-[1.02]"
                            : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        <div className="absolute bottom-1.5 left-2 right-2">
                          <p className="text-[10px] font-bold text-white truncate drop-shadow-xs">
                            {preset.title}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#0B57D0] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PILIHAN WARNA & GRADASI BANNER */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span>Warna Gradasi Banner</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Berfungsi sebagai latar kontras foto / ilustrasi
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {THEME_COLORS.map((t) => {
                const isSelected = themeColor === t.color;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setThemeColor(t.color);
                      setBgGradient(t.gradient);
                    }}
                    className={`group relative flex flex-col items-center gap-1 p-1 rounded-2xl transition cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/80 ring-2 ring-blue-500 shadow-2xs"
                        : "hover:bg-slate-100/70"
                    }`}
                    title={t.label}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-xs border border-white/40 ${
                        isSelected
                          ? "scale-105 shadow-md ring-2 ring-white"
                          : "group-hover:scale-105 opacity-90 group-hover:opacity-100"
                      }`}
                      style={{ background: t.swatchBg }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />}
                    </div>
                    <span
                      className={`text-[9px] font-bold truncate max-w-[55px] text-center ${
                        isSelected ? "text-blue-700" : "text-slate-500 group-hover:text-slate-800"
                      }`}
                    >
                      {t.label.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#0B57D0] hover:bg-blue-700 transition shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan Banner ke Kelas</span>
          </button>
        </div>
      </div>
    </div>
  );
}

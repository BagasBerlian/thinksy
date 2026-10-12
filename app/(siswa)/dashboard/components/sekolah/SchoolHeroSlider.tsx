"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Globe,
  ExternalLink,
  MapPin,
  Sparkles,
  Pause,
  Play,
  Building2,
  Monitor,
  HeartHandshake,
  Factory,
  Compass,
} from "lucide-react";
import { SekolahData } from "../../types";

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export interface DocumentationSlide {
  id: string;
  title: string;
  category: string;
  highlight: string;
  description: string;
  imageUrl: string;
  icon: typeof Building2;
}

const DEFAULT_SLIDES: DocumentationSlide[] = [
  {
    id: "gedung",
    title: "Gedung Kampus 2 & Bengkel Industri",
    category: "Fasilitas Unggulan",
    highlight: "Sekolah Pusat Keunggulan (SMK PK)",
    description: "Gedung baru Pusat Keunggulan terintegrasi dengan Bengkel Resmi Daihatsu & United Tractors untuk pembinaan budaya industri.",
    imageUrl: "/images/smk-muh-pakem-gedung.jpg",
    icon: Building2,
  },
  {
    id: "lab",
    title: "Studio Komputer & Desain Arsitektur DPIB",
    category: "Ruang Praktik Digital",
    highlight: "DPIB & Rekayasa Perangkat Lunak",
    description: "Laboratorium komputasi dan studio perancangan gedung berstandar modern untuk mengasah keahlian teknologi masa depan.",
    imageUrl: "/images/smk-muh-pakem-lab.jpg",
    icon: Monitor,
  },
  {
    id: "gerbang",
    title: "Penyambutan Siswa & Budaya 5S",
    category: "Pesantren Vokasi",
    highlight: "Pendidikan Karakter & Kedisiplinan",
    description: "Pembiasaan Senyum, Sapa, Salam, Sopan, dan Santun di gerbang sekolah menyambut generasi santri vokasi berakhlak mulia.",
    imageUrl: "/images/smk-muh-pakem-gerbang.jpg",
    icon: HeartHandshake,
  },
  {
    id: "industri",
    title: "Kunjungan Industri & Teaching Factory",
    category: "Link & Match DUDI",
    highlight: "Kemitraan Industri Berskala Nasional",
    description: "Sinergi langsung dengan industri manufaktur dan transportasi memastikan lulusan memiliki kompetensi nyata siap kerja.",
    imageUrl: "/images/smk-muh-pakem-industri.jpg",
    icon: Factory,
  },
  {
    id: "kegiatan",
    title: "Kepanduan Hizbul Wathan & Kemandirian",
    category: "Pengembangan Diri",
    highlight: "Karakter Unggul Pelajar Muhammadiyah",
    description: "Penggemblengan mental tangguh, kepemimpinan, dan kerja sama tim melalui kepanduan Hizbul Wathan dan kegiatan kepesantrenan.",
    imageUrl: "/images/smk-muh-pakem-kegiatan.jpg",
    icon: Compass,
  },
];

interface SchoolHeroSliderProps {
  sekolahData: SekolahData;
}

export default function SchoolHeroSlider({ sekolahData }: SchoolHeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const slides = DEFAULT_SLIDES;
  const activeSlide = slides[currentIndex];

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Auto-play timer (5.5 seconds per slide)
  useEffect(() => {
    if (!isAutoPlay || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      goToNext();
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlay, isHovered, goToNext]);

  // Touch Swipe Handlers for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      goToNext(); // Swiped left -> next
    } else if (diff < -50) {
      goToPrev(); // Swiped right -> prev
    }
    setTouchStartX(null);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrev();
    if (e.key === "ArrowRight") goToNext();
  };

  return (
    <section
      aria-label="Dokumentasi dan Profil Resmi SMKS Muhammadiyah Pakem"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="group relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 text-white bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
    >
      {/* ============================================================== */}
      {/* 1. BACKGROUND IMAGE SLIDER WITH SMOOTH TRANSITIONS             */}
      {/* ============================================================== */}
      <div className="absolute inset-0 overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-1" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              <div
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-7000 ease-out transform opacity-40 mix-blend-overlay ${
                  isActive ? "scale-105" : "scale-100"
                }`}
                style={{ backgroundImage: `url('${slide.imageUrl}')` }}
              />
            </div>
          );
        })}

        {/* Multi-layered soft modern gradient wash for crystal-clear readability */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/90 via-indigo-950/75 to-blue-900/40 z-2" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent z-2" />

        {/* Visual Circle Accents di Sudut (Transparan) */}
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full border border-white/10 pointer-events-none z-3" />
        <div className="absolute -top-28 -left-28 w-96 h-96 rounded-full border border-white/5 pointer-events-none z-3" />
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-blue-500/15 blur-2xl pointer-events-none z-3" />

        <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full border border-amber-400/15 pointer-events-none z-3" />
        <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full border border-white/5 pointer-events-none z-3" />
        <div className="absolute -bottom-10 -right-10 w-52 h-52 rounded-full bg-amber-500/15 blur-2xl pointer-events-none z-3" />
      </div>

      {/* ============================================================== */}
      {/* 2. TOP SLIDE BADGE & AUTOPLAY CONTROL                          */}
      {/* ============================================================== */}
      <div className="relative z-10 px-5 sm:px-8 pt-5 sm:pt-6 flex items-center justify-between gap-3">
        {/* Curated status tag */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-blue-300 text-xs font-semibold backdrop-blur-md shadow-xs">
          <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="truncate">Kurikulum Merdeka • SMK Pusat Keunggulan & Pesantren Vokasi</span>
        </div>

        {/* Slide Counter & Pause/Play Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-[11px] font-mono font-bold text-slate-300 backdrop-blur-md">
            <span className="text-amber-400">{String(currentIndex + 1).padStart(2, "0")}</span>
            <span className="text-slate-500"> / </span>
            <span>{String(slides.length).padStart(2, "0")}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            title={isAutoPlay ? "Jeda slideshow" : "Putar otomatis slideshow"}
            className="w-7 h-7 rounded-full bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition duration-150 cursor-pointer backdrop-blur-md"
          >
            {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-amber-400 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. HERO CONTENT: LOGO, IDENTITY, MOTTO & PROGRAM               */}
      {/* ============================================================== */}
      <div className="relative z-10 px-5 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
        {/* Left Side: School Emblem & Core Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 max-w-3xl">
          {/* Logo Badge */}
          <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-900/90 border border-slate-700/90 p-2.5 shadow-xl backdrop-blur-md flex items-center justify-center group-hover:border-blue-500/40 transition duration-300">
            <Image
              src="/images/smk-muh-pakem-logo.png"
              alt="Logo Resmi SMKS Muhammadiyah Pakem"
              width={88}
              height={88}
              priority
              className="w-full h-full object-contain filter drop-shadow-md"
            />
            <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-xs">
              MUPA
            </span>
          </div>

          {/* Titles & Description */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                NPSN: {sekolahData.npsn || "20401318"} • Terakreditasi
              </span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-xs font-semibold text-emerald-400">
                Sleman, D.I. Yogyakarta
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md leading-tight">
              {sekolahData.nama || "SMKS Muhammadiyah Pakem"}
            </h1>

            {/* Motto */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{sekolahData.motto || "Pusat Keunggulan & Pesantren Vokasi • Bahagia Bersama"}</span>
            </div>

            {/* School Description */}
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal max-w-2xl pt-1">
              {sekolahData.deskripsi ||
                "SMKS Muhammadiyah Pakem (MUPA) merupakan Sekolah Pusat Keunggulan dan Pesantren Vokasi yang berkomitmen mencetak generasi muda berakhlak mulia, terampil, mandiri, dan menguasai keahlian industri masa depan."}
            </p>

            {/* Flagship Vocational Competencies */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1 text-[11px] text-slate-300 font-medium">
              <span className="text-slate-400 text-xs font-semibold mr-1">Kompetensi Keahlian:</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60">DPIB (Arsitek)</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60">Teknik Otomotif (TKR & TSM)</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60">RPL (Programmer)</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60">Perbankan Syariah</span>
            </div>
          </div>
        </div>

        {/* Right Side: Current Active Photo Spotlight Card */}
        <div className="w-full lg:w-80 shrink-0 bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <activeSlide.icon className="w-3.5 h-3.5" />
              <span>{activeSlide.category}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Foto {currentIndex + 1} dari {slides.length}
            </span>
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-white leading-snug">
              {activeSlide.title}
            </h2>
            <p className="text-[11px] text-slate-300 font-medium mt-1 leading-relaxed line-clamp-3">
              {activeSlide.description}
            </p>
          </div>

          <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="text-blue-300 font-semibold">{activeSlide.highlight}</span>
            <span className="italic">Geser untuk melihat lainnya</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. OFFICIAL LINKS & SLIDE NAVIGATION STRIP                     */}
      {/* ============================================================== */}
      <div className="relative z-10 px-5 sm:px-8 pb-5 sm:pb-6 flex flex-col md:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/70 bg-slate-950/40 backdrop-blur-xs">
        {/* Left: Quick Action Links */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 w-full md:w-auto">
          {sekolahData.links && sekolahData.links.length > 0 ? (
            sekolahData.links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700/80 hover:border-slate-500 transition duration-200 shadow-xs cursor-pointer hover:scale-102"
              >
                {link.icon === "Globe" ? (
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                ) : link.icon === "Instagram" ? (
                  <InstagramIcon className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{link.label}</span>
                <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
              </a>
            ))
          ) : (
            <>
              <a
                href="https://smkmuhpakem.sch.id"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700/80 hover:border-slate-500 transition duration-200 shadow-xs cursor-pointer hover:scale-102"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Website Resmi</span>
                <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
              </a>
              <a
                href="https://smkmuhpakem.sch.id/ppdb/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700/80 hover:border-slate-500 transition duration-200 shadow-xs cursor-pointer hover:scale-102"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Portal PPDB</span>
                <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
              </a>
              <a
                href="https://www.instagram.com/smkmuhpakem/?hl=id"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700/80 hover:border-slate-500 transition duration-200 shadow-xs cursor-pointer hover:scale-102"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-rose-400" />
                <span>Instagram</span>
                <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
              </a>
            </>
          )}

          {/* Maps Link */}
          <a
            href="https://maps.google.com/maps?q=SMK%20Muhammadiyah%20Pakem"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 hover:border-slate-600 transition duration-200 shadow-xs cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lokasi Kampus</span>
          </a>
        </div>

        {/* Right: Slide Controls (Prev, Indicators, Next) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Previous Arrow */}
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Dokumentasi sebelumnya"
            className="w-8 h-8 rounded-full bg-slate-900/90 hover:bg-blue-600 border border-slate-700/80 hover:border-blue-500 text-slate-200 hover:text-white flex items-center justify-center transition duration-200 cursor-pointer shadow-md active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Slide Indicators / Thumbnail Dots */}
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Pilih foto dokumentasi">
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Lihat foto ${idx + 1}: ${slide.title}`}
                  onClick={() => goToSlide(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? "w-7 h-2.5 bg-amber-400 shadow-xs"
                      : "w-2.5 h-2.5 bg-slate-700 hover:bg-slate-500"
                  }`}
                />
              );
            })}
          </div>

          {/* Next Arrow */}
          <button
            type="button"
            onClick={goToNext}
            aria-label="Dokumentasi selanjutnya"
            className="w-8 h-8 rounded-full bg-slate-900/90 hover:bg-blue-600 border border-slate-700/80 hover:border-blue-500 text-slate-200 hover:text-white flex items-center justify-center transition duration-200 cursor-pointer shadow-md active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. BOTTOM QUICK-JUMP TABS (FOTO YANG DIGESER-GESER)             */}
      {/* ============================================================== */}
      <div className="relative z-10 hidden sm:flex items-center gap-1 px-4 sm:px-6 py-2 bg-slate-950/80 border-t border-slate-900 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider shrink-0 mr-2">
          Galeri Dokumentasi:
        </span>
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const IconComp = slide.icon;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-slate-800 text-amber-300 border border-amber-400/30 shadow-xs"
                  : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <IconComp className={`w-3 h-3 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
              <span className="truncate max-w-[150px]">{slide.title.split("&")[0].trim()}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

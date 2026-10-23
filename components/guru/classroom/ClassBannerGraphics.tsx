"use client";

import React from "react";

interface ClassBannerGraphicProps {
  bannerType?: "illustration" | "photo";
  bannerIllustration?: string;
  bannerPhotoUrl?: string;
  subjectName?: string;
  className?: string;
  isCompact?: boolean;
}

/**
 * Renders subject-specific Google Classroom-style SVG illustrations or custom photos
 * on the right side of class banners.
 */
export function ClassBannerGraphic({
  bannerType = "illustration",
  bannerIllustration = "math",
  bannerPhotoUrl,
  subjectName = "",
  className = "",
  isCompact = false,
}: ClassBannerGraphicProps) {
  // 1. If photo is selected and available, render the photo banner
  if (bannerType === "photo" && bannerPhotoUrl) {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit] ${className}`}>
        <img
          src={bannerPhotoUrl}
          alt={subjectName || "Banner Kelas"}
          className="w-full h-full object-cover opacity-85 scale-105"
        />
        {/* Gradient overlay to guarantee readability of title & text */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent" />
      </div>
    );
  }

  // 2. Default SVG Illustration (Matches Google Classroom aesthetics)
  const illuType = resolveIllustrationType(bannerIllustration, subjectName);

  return (
    <div
      className={`absolute right-0 top-0 bottom-0 pointer-events-none overflow-hidden flex items-center justify-end select-none ${
        isCompact ? "w-1/2 pr-3 opacity-90" : "w-3/5 pr-6 opacity-90"
      } ${className}`}
    >
      {renderIllustrationSvg(illuType, isCompact)}
    </div>
  );
}

/**
 * Determine illustration type from string or subject name
 */
export function resolveIllustrationType(type?: string, subjectName: string = ""): string {
  const normSubject = subjectName.toLowerCase();

  if (type && ["math", "science", "english", "literature", "tech", "social", "art", "islamic", "sports"].includes(type)) {
    return type;
  }

  if (normSubject.includes("mat") || normSubject.includes("aljabar") || normSubject.includes("hitung")) return "math";
  if (normSubject.includes("ipa") || normSubject.includes("fisika") || normSubject.includes("biologi") || normSubject.includes("kimia")) return "science";
  if (normSubject.includes("inggris") || normSubject.includes("english")) return "english";
  if (normSubject.includes("indonesia") || normSubject.includes("sastra") || normSubject.includes("buku")) return "literature";
  if (normSubject.includes("komputer") || normSubject.includes("informatika") || normSubject.includes("tik") || normSubject.includes("coding")) return "tech";
  if (normSubject.includes("ips") || normSubject.includes("sejarah") || normSubject.includes("geografi")) return "social";
  if (normSubject.includes("seni") || normSubject.includes("musik") || normSubject.includes("budaya")) return "art";
  if (normSubject.includes("agama") || normSubject.includes("islam") || normSubject.includes("pai")) return "islamic";
  if (normSubject.includes("olahraga") || normSubject.includes("pjok") || normSubject.includes("jasmani")) return "sports";

  return "math";
}

function renderIllustrationSvg(type: string, isCompact: boolean) {
  const scale = isCompact ? "max-h-[140px]" : "max-h-[210px]";

  // 1. ENGLISH: Globe & Speech Bubbles "Hello!" & "Great!" (Matches User Screenshot 2)
  if (type === "english") {
    return (
      <svg viewBox="0 0 500 240" className={`h-full ${scale} w-auto drop-shadow-md`}>
        {/* Globe Base Circle */}
        <circle cx="390" cy="120" r="75" fill="#78350F" opacity="0.3" stroke="#FDE68A" strokeWidth="3" />
        <ellipse cx="390" cy="120" rx="75" ry="30" fill="none" stroke="#FDE68A" strokeWidth="2" opacity="0.6" />
        <line x1="390" y1="45" x2="390" y2="195" stroke="#FDE68A" strokeWidth="2" opacity="0.6" />

        {/* Golden Speech Bubble "Hello!" */}
        <path
          d="M260 60 Q290 40 330 60 Q370 80 340 100 L320 120 L315 100 Q260 100 260 60 Z"
          fill="#D97706"
          stroke="#FCD34D"
          strokeWidth="2"
        />
        <text x="278" y="80" fill="#FFFFFF" fontSize="17" fontWeight="800" fontFamily="sans-serif">
          Hello!
        </text>

        {/* Blue Speech Bubble "Great!" */}
        <path
          d="M365 135 Q395 115 440 135 Q470 155 440 178 L430 200 L420 178 Q365 178 365 135 Z"
          fill="#2563EB"
          stroke="#93C5FD"
          strokeWidth="2"
        />
        <text x="385" y="157" fill="#FFFFFF" fontSize="17" fontWeight="800" fontFamily="sans-serif">
          Great!
        </text>
      </svg>
    );
  }

  // 2. MATH: Ruler, Compass, Geometry triangle, Formulas
  if (type === "math") {
    return (
      <svg viewBox="0 0 500 240" className={`h-full ${scale} w-auto drop-shadow-md`}>
        {/* Geometry Circle & Grid */}
        <circle cx="390" cy="115" r="80" fill="#1D4ED8" opacity="0.25" stroke="#93C5FD" strokeWidth="2" />
        <polygon points="270,185 435,185 435,65" fill="none" stroke="#60A5FA" strokeWidth="4" />
        <rect x="420" y="170" width="15" height="15" fill="none" stroke="#93C5FD" strokeWidth="2" />

        {/* Formulas in vibrant colors */}
        <text x="295" y="215" fill="#BFDBFE" fontSize="20" fontWeight="bold" fontFamily="monospace">
          a² + b² = c²
        </text>
        <text x="445" y="115" fill="#FDE047" fontSize="24" fontWeight="bold" fontFamily="sans-serif">
          f(x)
        </text>
        <text x="245" y="80" fill="#6EE7B7" fontSize="26" fontWeight="bold" fontFamily="sans-serif">
          √x
        </text>

        {/* Geometric Protractor / Ruler Compass */}
        <line x1="290" y1="35" x2="360" y2="185" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
        <line x1="430" y1="35" x2="360" y2="185" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
        <circle cx="360" cy="35" r="6" fill="#FBBF24" />
      </svg>
    );
  }

  // 3. SCIENCE: Microscope, Flask with bubbles, Atom orbit
  if (type === "science") {
    return (
      <svg viewBox="0 0 500 240" className={`h-full ${scale} w-auto drop-shadow-md`}>
        {/* Atom Orbits */}
        <ellipse cx="380" cy="115" rx="80" ry="25" fill="none" stroke="#34D399" strokeWidth="3" transform="rotate(-30 380 115)" opacity="0.6" />
        <ellipse cx="380" cy="115" rx="80" ry="25" fill="none" stroke="#6EE7B7" strokeWidth="3" transform="rotate(30 380 115)" opacity="0.6" />
        <circle cx="380" cy="115" r="10" fill="#10B981" />

        {/* Conical Chemistry Flask */}
        <path d="M260 185 L320 185 L300 130 L300 95 L280 95 L280 130 Z" fill="#047857" stroke="#A7F3D0" strokeWidth="3" opacity="0.85" />
        <ellipse cx="290" cy="180" rx="20" ry="5" fill="#6EE7B7" />
        {/* Bubbles */}
        <circle cx="285" cy="150" r="4" fill="#FFFFFF" opacity="0.9" />
        <circle cx="295" cy="135" r="3" fill="#FFFFFF" opacity="0.9" />
        <circle cx="290" cy="115" r="5" fill="#FFFFFF" opacity="0.9" />
      </svg>
    );
  }

  // 4. TECH / INFORMATIKA: Laptop mockup, code lines, mobile
  if (type === "tech") {
    return (
      <svg viewBox="0 0 500 240" className={`h-full ${scale} w-auto drop-shadow-md`}>
        {/* Laptop Screen */}
        <rect x="300" y="45" width="180" height="120" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="4" />
        <rect x="312" y="58" width="156" height="88" rx="4" fill="#0284C7" opacity="0.8" />
        {/* Code Lines on Screen */}
        <rect x="325" y="70" width="100" height="8" rx="2" fill="#E0F2FE" />
        <rect x="325" y="85" width="130" height="7" rx="2" fill="#7DD3FC" />
        <rect x="325" y="98" width="80" height="7" rx="2" fill="#38BDF8" />
        <rect x="325" y="111" width="115" height="7" rx="2" fill="#BAE6FD" />
        {/* Base */}
        <path d="M275 168 L505 168 L485 185 L295 185 Z" fill="#94A3B8" />

        {/* Terminal Brackets */}
        <text x="240" y="90" fill="#38BDF8" fontSize="32" fontWeight="bold" fontFamily="monospace">&lt;/&gt;</text>
      </svg>
    );
  }

  // 5. LITERATURE / BAHASA: Open book, quill, scrolls
  if (type === "literature") {
    return (
      <svg viewBox="0 0 500 240" className={`h-full ${scale} w-auto drop-shadow-md`}>
        <path d="M260 180 Q330 160 400 180 L400 80 Q330 60 260 80 Z" fill="#6D28D9" stroke="#DDD6FE" strokeWidth="3" />
        <path d="M400 180 Q470 160 540 180 L540 80 Q470 60 400 80 Z" fill="#5B21B6" stroke="#DDD6FE" strokeWidth="3" />
        <path d="M280 60 Q310 20 350 10 Q340 40 310 80 Z" fill="#FBBF24" />
        <line x1="310" y1="80" x2="290" y2="110" stroke="#F59E0B" strokeWidth="3" />
        <text x="320" y="210" fill="#E9D5FF" fontSize="18" fontWeight="bold">Sastra & Literasi</text>
      </svg>
    );
  }

  // 6. DEFAULT / OTHERS
  return (
    <svg viewBox="0 0 500 240" className={`h-full ${scale} w-auto drop-shadow-md`}>
      <circle cx="390" cy="115" r="80" fill="#FFFFFF" opacity="0.15" />
      <polygon points="270,185 435,185 435,65" fill="none" stroke="#FFFFFF" strokeWidth="3" opacity="0.7" />
      <text x="310" y="140" fill="#FFFFFF" fontSize="36" fontWeight="900" opacity="0.8">📚 ✨</text>
    </svg>
  );
}

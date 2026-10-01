"use client";

export interface StudentCardProfile {
  nama_lengkap: string;
  nama_kelas: string;
  nis: string;
  nisn: string;
  jurusan: string;
  tempat_tgl_lahir: string;
  jenis_kelamin: string;
  agama: string;
  tahun_ajaran: string;
  foto_url: string;
}

export type ThemeMode = "light" | "dark" | "dim";
export type ThemeColorAccent = "blue" | "purple" | "emerald" | "amber" | "rose" | "slate";

export const DEFAULT_STUDENT_PHOTO = "/images/pasfoto-siswa-1.jpg";
export const FEMALE_STUDENT_PHOTO = "/images/pasfoto-siswi-1.jpg";

export const THEME_COLOR_OPTIONS: {
  id: ThemeColorAccent;
  label: string;
  hex: string;
  bgHex: string;
  borderHex: string;
  description: string;
}[] = [
  {
    id: "blue",
    label: "Biru Sapphire",
    hex: "#2563EB",
    bgHex: "#EFF6FF",
    borderHex: "#BFDBFE",
    description: "Format Standar Resmi Kemdikbud",
  },
  {
    id: "purple",
    label: "Ungu Amethyst",
    hex: "#7C3AED",
    bgHex: "#FAF5FF",
    borderHex: "#E9D5FF",
    description: "Warna Khas Sokratik AI Thinksy",
  },
  {
    id: "emerald",
    label: "Zamrud Hijau",
    hex: "#059669",
    bgHex: "#ECFDF5",
    borderHex: "#A7F3D0",
    description: "Cerdas, Segar, dan Akademis",
  },
  {
    id: "amber",
    label: "Sunset Amber",
    hex: "#D97706",
    bgHex: "#FFFBEB",
    borderHex: "#FDE68A",
    description: "Hangat, Berenergi & Aktif",
  },
  {
    id: "rose",
    label: "Crimson Ruby",
    hex: "#E11D48",
    bgHex: "#FFF1F2",
    borderHex: "#FECDD3",
    description: "Berani, Tegas & Berprestasi",
  },
  {
    id: "slate",
    label: "Slate Onyx",
    hex: "#334155",
    bgHex: "#F8FAFC",
    borderHex: "#E2E8F0",
    description: "Minimalis Modern Eksekutif",
  },
];

export const DEFAULT_PROFILE: StudentCardProfile = {
  nama_lengkap: "SYAA PX",
  nama_kelas: "Kelas 8",
  nis: "260481",
  nisn: "0089247182",
  jurusan: "Teknik Komputer & Jaringan",
  tempat_tgl_lahir: "Gunungkidul, 12 Agustus 2010",
  jenis_kelamin: "Laki-laki",
  agama: "Islam",
  tahun_ajaran: "2026/2027",
  foto_url: DEFAULT_STUDENT_PHOTO,
};

/**
 * Mendapatkan foto siswa aktif.
 * Wajib selalu ada foto (tidak boleh kosong atau sekadar inisial).
 */
export function getStoredStudentPhoto(fallback?: string | null): string {
  if (typeof window === "undefined") {
    return fallback || DEFAULT_STUDENT_PHOTO;
  }
  try {
    const saved = localStorage.getItem("thinksy_student_photo");
    if (saved && saved.trim().length > 0) return saved;
  } catch {}
  return fallback || DEFAULT_STUDENT_PHOTO;
}

/**
 * Menyimpan foto siswa aktif ke localStorage dan menyiarkan event perubahan.
 */
export function saveStoredStudentPhoto(photoUrl: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("thinksy_student_photo", photoUrl);
    window.dispatchEvent(new CustomEvent("thinksy_photo_change", { detail: photoUrl }));
  } catch {}
}

/**
 * Mengambil biodata profil kartu pelajar dari localStorage dengan fallback data awal.
 */
export function getStoredStudentProfile(fallback?: Partial<StudentCardProfile>): StudentCardProfile {
  if (typeof window === "undefined") {
    return { ...DEFAULT_PROFILE, ...(fallback || {}) };
  }
  try {
    const saved = localStorage.getItem("thinksy_student_profile");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_PROFILE,
        ...(fallback || {}),
        ...parsed,
        foto_url: getStoredStudentPhoto(parsed.foto_url || fallback?.foto_url),
      };
    }
  } catch {}

  const photo = getStoredStudentPhoto(fallback?.foto_url);
  return {
    ...DEFAULT_PROFILE,
    ...(fallback || {}),
    foto_url: photo,
  };
}

/**
 * Menyimpan biodata profil kartu pelajar ke localStorage.
 */
export function saveStoredStudentProfile(profile: StudentCardProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("thinksy_student_profile", JSON.stringify(profile));
    saveStoredStudentPhoto(profile.foto_url);
    window.dispatchEvent(new CustomEvent("thinksy_profile_change", { detail: profile }));
  } catch {}
}

/**
 * Mengambil mode tema yang tersimpan (light, dark, dim).
 */
export function getStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem("thinksy_theme_mode") as ThemeMode;
    if (saved === "dark" || saved === "dim" || saved === "light") return saved;
    // Cek kompatibilitas tema lama
    const legacy = localStorage.getItem("thinksy_theme");
    if (legacy === "dark") return "dark";
  } catch {}
  return "light";
}

/**
 * Mengambil warna aksen tema yang tersimpan.
 */
export function getStoredThemeColor(): ThemeColorAccent {
  if (typeof window === "undefined") return "blue";
  try {
    const saved = localStorage.getItem("thinksy_theme_color") as ThemeColorAccent;
    if (["blue", "purple", "emerald", "amber", "rose", "slate"].includes(saved)) {
      return saved;
    }
  } catch {}
  return "blue";
}

/**
 * Menerapkan tema gelap/terang dan warna aksen secara dinamis ke elemen <html>.
 */
export function applyTheme(mode: ThemeMode, color: ThemeColorAccent): void {
  if (typeof window === "undefined") return;
  try {
    const root = document.documentElement;

    // Set class dark atau hapus
    if (mode === "dark" || mode === "dim") {
      root.classList.add("dark");
      if (mode === "dim") {
        root.setAttribute("data-mode", "dim");
      } else {
        root.removeAttribute("data-mode");
      }
    } else {
      root.classList.remove("dark");
      root.removeAttribute("data-mode");
    }

    // Set atribut warna aksen
    root.setAttribute("data-accent", color);

    // Simpan ke localStorage
    localStorage.setItem("thinksy_theme_mode", mode);
    localStorage.setItem("thinksy_theme", mode === "dark" || mode === "dim" ? "dark" : "light");
    localStorage.setItem("thinksy_theme_color", color);

    // Siarkan event perubahan
    window.dispatchEvent(
      new CustomEvent("thinksy_theme_change", { detail: { mode, color } })
    );
  } catch {}
}

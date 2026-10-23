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
  is_locked?: boolean;
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
    label: "Biru Oxford / Navy",
    hex: "#1E3A8A",
    bgHex: "#F0F4F8",
    borderHex: "#BFDBFE",
    description: "Format Standar Resmi Akademik",
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
  nama_lengkap: "Siswa Thinksy",
  nama_kelas: "Kelas 8",
  nis: "260481",
  nisn: "0089247182",
  jurusan: "Fase D (Kurikulum Merdeka)",
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
export function saveStoredStudentPhoto(photoUrl: string, studentName?: string, nisn?: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("thinksy_student_photo", photoUrl);

    // 1. Simpan ke map foto per NISN & Nama siswa
    const rawMap = localStorage.getItem("thinksy_student_photos_map");
    const map = rawMap ? JSON.parse(rawMap) : {};
    if (nisn && nisn.trim()) map[nisn.trim()] = photoUrl;
    if (studentName && studentName.trim()) {
      map[studentName.trim().toLowerCase()] = photoUrl;
    }
    // Default active student
    map["active_student"] = photoUrl;
    localStorage.setItem("thinksy_student_photos_map", JSON.stringify(map));

    // 2. Perbarui thinksy_joined_students jika sudah ada daftar siswa bergabung
    const rawJoined = localStorage.getItem("thinksy_joined_students");
    if (rawJoined) {
      const list = JSON.parse(rawJoined);
      if (Array.isArray(list)) {
        const normName = (studentName || "").toLowerCase().trim();
        const normNisn = (nisn || "").trim();
        const updated = list.map((st: any) => {
          const sName = (st.name || st.nama_lengkap || "").toLowerCase().trim();
          const sNisn = (st.nisn || "").trim();
          if (
            (normNisn && sNisn === normNisn) ||
            (normName && (sName === normName || sName.includes(normName) || normName.includes(sName)))
          ) {
            return { ...st, foto: photoUrl, foto_url: photoUrl };
          }
          return st;
        });
        localStorage.setItem("thinksy_joined_students", JSON.stringify(updated));
      }
    }

    // 3. Siarkan event agar Dashboard Guru dan komponen lain langsung terupdate seketika
    window.dispatchEvent(new CustomEvent("thinksy_photo_change", { detail: photoUrl }));
    window.dispatchEvent(new CustomEvent("thinksy_joined_students_updated"));

    // 4. Kirim ke API Supabase secara asinkron
    fetch("/api/siswa/profil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foto_url: photoUrl, nama_lengkap: studentName, nisn }),
    }).catch(() => {});
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
      // Data dari database autentikasi (fallback) adalah single source of truth untuk identitas akun resmi
      const dbNama =
        fallback?.nama_lengkap &&
        fallback.nama_lengkap.trim() !== "" &&
        fallback.nama_lengkap !== "Siswa Thinksy"
          ? fallback.nama_lengkap
          : null;

      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        ...(fallback || {}),
        nama_lengkap: dbNama || parsed.nama_lengkap || DEFAULT_PROFILE.nama_lengkap,
        foto_url: getStoredStudentPhoto(fallback?.foto_url || parsed.foto_url),
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
    saveStoredStudentPhoto(profile.foto_url, profile.nama_lengkap, profile.nisn);
    window.dispatchEvent(new CustomEvent("thinksy_profile_change", { detail: profile }));
  } catch {}
}

/**
 * Helper untuk menyelesaikan foto profil siswa di Dashboard Guru:
 * Jika siswa mengganti foto profilnya di dashboard siswa,
 * Dashboard Guru akan langsung menampilkan foto terbaru pilihan siswa tersebut!
 */
export function resolveStudentPhoto(student: {
  id?: string;
  name?: string;
  nama_lengkap?: string;
  nisn?: string;
  foto?: string | null;
  foto_url?: string | null;
}): string {
  if (typeof window === "undefined") {
    return student.foto || student.foto_url || DEFAULT_STUDENT_PHOTO;
  }

  try {
    const stdName = (student.name || student.nama_lengkap || "").trim().toLowerCase();
    const stdNisn = (student.nisn || "").trim();
    const stdId = (student.id || "").trim();

    // 1. Cek map foto tersimpan berdasarkan NISN, Nama, atau ID
    const rawMap = localStorage.getItem("thinksy_student_photos_map");
    if (rawMap) {
      const map = JSON.parse(rawMap);
      if (stdNisn && map[stdNisn]) return map[stdNisn];
      if (stdName && map[stdName]) return map[stdName];
      if (stdId && map[stdId]) return map[stdId];
    }

    // 2. Cek daftar siswa yang bergabung (thinksy_joined_students)
    const rawJoined = localStorage.getItem("thinksy_joined_students");
    if (rawJoined) {
      const list = JSON.parse(rawJoined);
      if (Array.isArray(list)) {
        const found = list.find(
          (s: any) =>
            (stdNisn && s.nisn === stdNisn) ||
            (stdName && (s.name || s.nama_lengkap || "").toLowerCase() === stdName) ||
            (stdId && s.id === stdId)
        );
        if (found && (found.foto || found.foto_url)) {
          return found.foto || found.foto_url;
        }
      }
    }

    // 3. Cek profil aktif siswa (thinksy_student_profile)
    const rawProfile = localStorage.getItem("thinksy_student_profile");
    if (rawProfile) {
      const p = JSON.parse(rawProfile);
      const pName = (p.nama_lengkap || "").trim().toLowerCase();
      const pNisn = (p.nisn || "").trim();

      // Cocokkan NISN atau Nama
      if (
        (stdNisn && pNisn && stdNisn === pNisn) ||
        (stdName && pName && (stdName === pName || pName.includes(stdName) || stdName.includes(pName)))
      ) {
        if (p.foto_url && p.foto_url.trim().length > 0) return p.foto_url;
      }
    }

    // 4. Jika student saat ini cocok dengan siswa aktif di sesi lokal
    const activePhoto = localStorage.getItem("thinksy_student_photo");
    if (activePhoto && activePhoto.trim().length > 0) {
      if (
        stdName.includes("siswa thinksy") ||
        stdName.includes("budi kartika") ||
        stdName.includes("ahmad raihan") ||
        stdName.includes("devida amanda")
      ) {
        return activePhoto;
      }
    }
  } catch {}

  return student.foto || student.foto_url || DEFAULT_STUDENT_PHOTO;
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

export type SettingsLanguage = "id" | "en";

export function getStoredLanguage(): SettingsLanguage {
  if (typeof window === "undefined") return "id";
  try {
    const saved = localStorage.getItem("thinksy_language") as SettingsLanguage;
    if (saved === "id" || saved === "en") return saved;
  } catch {}
  return "id";
}

export function saveStoredLanguage(lang: SettingsLanguage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("thinksy_language", lang);
    window.dispatchEvent(
      new CustomEvent("thinksy_language_change", { detail: lang })
    );
  } catch {}
}

export function isStoredProfileLocked(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const saved = localStorage.getItem("thinksy_profile_locked");
    if (saved !== null) {
      return saved === "true";
    }
  } catch {}
  return true; // Default locked by guru for official school data
}

export function saveStoredProfileLocked(locked: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("thinksy_profile_locked", String(locked));
    window.dispatchEvent(
      new CustomEvent("thinksy_profile_lock_change", { detail: locked })
    );
  } catch {}
}

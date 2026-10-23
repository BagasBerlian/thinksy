"use client";

import { useState, useEffect } from "react";

export interface ActiveClassTheme {
  id: string;
  name: string;
  mapel: string;
  section: string;
  room: string;
  subjectCode: string;
  themeColor: string;
  bgGradient: string;
  bannerType: "illustration" | "photo";
  bannerIllustration: string;
  bannerPhotoUrl: string;
  teacherName?: string;
  description?: string;
}

export const DEFAULT_CLASS_THEME: ActiveClassTheme = {
  id: "mat-8",
  name: "Matematika (Kelas 8)",
  mapel: "Matematika",
  section: "Fase D • Kurikulum Merdeka",
  room: "Ruang 8-A",
  subjectCode: "mtk8xpk",
  themeColor: "#1967D2",
  bgGradient: "from-blue-700 via-indigo-700 to-slate-900",
  bannerType: "illustration",
  bannerIllustration: "math",
  bannerPhotoUrl: "",
  teacherName: "Ibu Siti Rahmawati, M.Pd.",
  description: "Aljabar, Teorema Pythagoras, Persamaan Linear, Statistika, Peluang & Penalaran Matematika.",
};

/**
 * Membaca data tema dan kustomisasi banner kelas dari pengaturan Guru di localStorage
 */
export function getStoredClassTheme(subjectName: string = "Matematika"): ActiveClassTheme {
  if (typeof window === "undefined") return DEFAULT_CLASS_THEME;

  try {
    const raw = localStorage.getItem("thinksy_guru_classes");
    if (!raw) return DEFAULT_CLASS_THEME;

    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) return DEFAULT_CLASS_THEME;

    const norm = subjectName.toLowerCase();
    const found =
      list.find((c: any) => {
        const cName = (c.name || "").toLowerCase();
        const cMapel = (c.mapel || "").toLowerCase();
        return cName.includes(norm) || cMapel.includes(norm);
      }) || list[0];

    return {
      id: found.id || DEFAULT_CLASS_THEME.id,
      name: found.name || DEFAULT_CLASS_THEME.name,
      mapel: found.mapel || DEFAULT_CLASS_THEME.mapel,
      section: found.section || DEFAULT_CLASS_THEME.section,
      room: found.room || DEFAULT_CLASS_THEME.room,
      subjectCode: found.subjectCode || DEFAULT_CLASS_THEME.subjectCode,
      themeColor: found.themeColor || DEFAULT_CLASS_THEME.themeColor,
      bgGradient: found.bgGradient || DEFAULT_CLASS_THEME.bgGradient,
      bannerType: found.bannerType || (found.bannerPhotoUrl ? "photo" : "illustration"),
      bannerIllustration: found.bannerIllustration || "math",
      bannerPhotoUrl: found.bannerPhotoUrl || "",
      teacherName:
        found.teacher?.name ||
        found.teacherName ||
        DEFAULT_CLASS_THEME.teacherName,
      description: found.description || DEFAULT_CLASS_THEME.description,
    };
  } catch {
    return DEFAULT_CLASS_THEME;
  }
}

/**
 * Hook reaktif agar setiap kali guru mengupdate kelas di dashboard guru,
 * header belakang di dashboard siswa langsung terupdate seketika
 */
export function useActiveClassTheme(subjectName: string = "Matematika") {
  const [theme, setTheme] = useState<ActiveClassTheme>(() =>
    getStoredClassTheme(subjectName)
  );

  useEffect(() => {
    // Sinkronkan saat mount
    setTheme(getStoredClassTheme(subjectName));

    const handleSync = () => {
      setTheme(getStoredClassTheme(subjectName));
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("thinksy_guru_classes_updated", handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("thinksy_guru_classes_updated", handleSync);
    };
  }, [subjectName]);

  return theme;
}

/**
 * Pemicu broadcast ketika guru mengubah kelas agar siswa langsung tersinkronkan
 */
export function notifyClassUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("thinksy_guru_classes_updated"));
  }
}

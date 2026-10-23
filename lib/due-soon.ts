"use client";

import { useState, useEffect } from "react";

export interface DueSoonItem {
  id: string;
  type: "bab" | "class";
  title: string;
  subtitle?: string;
  description?: string;
  subjectName: string;
  classId: string;
  babId?: string;
  babNomor?: number;
  dueSoonDate: string; // ISO format e.g. "2026-10-27T08:00"
  isScheduled: boolean;
  isOpen: boolean;
  createdAt: string;
  themeColor?: string;
}

const INDONESIAN_DAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/**
 * Format tanggal due soon menjadi teks ramah pengguna
 * Contoh: "Senin, 27 Oktober 2026 • 08:00 WIB"
 */
export function formatDueSoonDisplay(dateString?: string): {
  dayDate: string;
  time: string;
  full: string;
  isPast: boolean;
  remainingText: string;
} {
  if (!dateString) {
    return {
      dayDate: "-",
      time: "-",
      full: "-",
      isPast: true,
      remainingText: "Tersedia sekarang",
    };
  }

  try {
    const target = new Date(dateString);
    if (isNaN(target.getTime())) {
      return {
        dayDate: dateString,
        time: "",
        full: dateString,
        isPast: false,
        remainingText: "Segera rilis",
      };
    }

    const now = new Date();
    const isPast = now >= target;

    const dayName = INDONESIAN_DAYS[target.getDay()];
    const dateNum = target.getDate();
    const monthName = INDONESIAN_MONTHS[target.getMonth()];
    const year = target.getFullYear();
    const hours = String(target.getHours()).padStart(2, "0");
    const minutes = String(target.getMinutes()).padStart(2, "0");

    const dayDate = `${dayName}, ${dateNum} ${monthName} ${year}`;
    const time = `${hours}:${minutes} WIB`;
    const full = `${dayDate} • ${time}`;

    // Hitung sisa waktu
    let remainingText = "Tersedia sekarang";
    if (!isPast) {
      const diffMs = target.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        remainingText = `${diffDays} hari lagi`;
      } else if (diffHours > 0) {
        remainingText = `${diffHours} jam lagi`;
      } else {
        const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
        remainingText = `${diffMinutes} menit lagi`;
      }
    }

    return {
      dayDate,
      time,
      full,
      isPast,
      remainingText,
    };
  } catch {
    return {
      dayDate: dateString,
      time: "",
      full: dateString,
      isPast: false,
      remainingText: "Segera rilis",
    };
  }
}

/**
 * Cek apakah jadwal due soon sudah tercapai (sudah boleh diakses)
 */
export function isDueSoonReleased(dueSoonDate?: string): boolean {
  if (!dueSoonDate) return true;
  try {
    const target = new Date(dueSoonDate);
    if (isNaN(target.getTime())) return true;
    return new Date() >= target;
  } catch {
    return true;
  }
}

/**
 * Mengambil semua item Due soon dari:
 * 1. Bab-bab yang dijadwalkan (thinksy_custom_babs)
 * 2. Kelas-kelas baru yang dijadwalkan (thinksy_guru_classes)
 */
export function getAllDueSoonItems(): DueSoonItem[] {
  if (typeof window === "undefined") return [];

  const items: DueSoonItem[] = [];

  // 1. Ambil dari Bab Pembelajaran (thinksy_custom_babs)
  try {
    const rawBabs = localStorage.getItem("thinksy_custom_babs");
    if (rawBabs) {
      const babsObj = JSON.parse(rawBabs);
      if (babsObj && typeof babsObj === "object") {
        Object.entries(babsObj).forEach(([babKey, babVal]: [string, any]) => {
          if (babVal && babVal.dueSoonDate && babVal.isScheduled) {
            // Ekstrak nomor bab dari key jika ada, misal 'mat-bab-2'
            const nomorMatch = babKey.match(/\d+$/);
            const babNomor = nomorMatch ? parseInt(nomorMatch[0], 10) : 1;

            items.push({
              id: `due-bab-${babKey}`,
              type: "bab",
              title: babVal.judul || `Bab ${babNomor}`,
              subtitle: `Matematika (Kelas 8) • Bab ${babNomor}`,
              description: babVal.deskripsi || "Modul bab pembelajaran terjadwal.",
              subjectName: "Matematika",
              classId: "mat-8",
              babId: babKey,
              babNomor,
              dueSoonDate: babVal.dueSoonDate,
              isScheduled: true,
              isOpen: babVal.isOpen !== false,
              createdAt: babVal.updatedAt || new Date().toISOString(),
              themeColor: "#1967D2",
            });
          }
        });
      }
    }
  } catch (err) {
    console.warn("[getAllDueSoonItems babs error]:", err);
  }

  // 2. Ambil dari Kelas / Mapel Baru yang dijadwalkan (thinksy_guru_classes)
  try {
    const rawClasses = localStorage.getItem("thinksy_guru_classes");
    if (rawClasses) {
      const classList = JSON.parse(rawClasses);
      if (Array.isArray(classList)) {
        classList.forEach((cls: any) => {
          if (cls && cls.dueSoonDate && cls.isScheduled) {
            items.push({
              id: `due-class-${cls.id}`,
              type: "class",
              title: cls.name || "Kelas Baru",
              subtitle: `${cls.section || "Kelas 8"} • ${cls.room || "Ruang Kelas"}`,
              description: cls.description || "Kelas mata pelajaran baru terjadwal.",
              subjectName: cls.mapel || cls.name,
              classId: cls.id,
              dueSoonDate: cls.dueSoonDate,
              isScheduled: true,
              isOpen: isDueSoonReleased(cls.dueSoonDate),
              createdAt: cls.createdAt || new Date().toISOString(),
              themeColor: cls.themeColor || "#2563EB",
            });
          }
        });
      }
    }
  } catch (err) {
    console.warn("[getAllDueSoonItems classes error]:", err);
  }

  // Sort berdasarkan dueSoonDate terdekat
  items.sort((a, b) => new Date(a.dueSoonDate).getTime() - new Date(b.dueSoonDate).getTime());

  return items;
}

/**
 * Menyimpan pengaturan Due soon untuk Bab tertentu ke localStorage
 */
export function saveBabDueSoonSettings(
  babId: string,
  data: {
    judul: string;
    deskripsi?: string;
    nomor?: number;
    dueSoonDate: string;
    isScheduled: boolean;
    isOpen: boolean;
    supabaseId?: string;
    modules?: any[];
    features?: any;
    quiz?: any;
  }
) {
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem("thinksy_custom_babs") || "{}";
    const existing = JSON.parse(raw);

    const payload = {
      judul: data.judul.trim(),
      deskripsi: data.deskripsi?.trim() || "",
      dueSoonDate: data.dueSoonDate,
      isScheduled: data.isScheduled,
      isOpen: data.isOpen,
      modules: data.modules,
      features: data.features,
      quiz: data.quiz,
      updatedAt: new Date().toISOString(),
    };

    const updated = {
      ...existing,
      [babId]: {
        ...existing[babId],
        ...payload,
      },
      ...(data.supabaseId
        ? {
            [data.supabaseId]: {
              ...existing[data.supabaseId],
              ...payload,
            },
          }
        : {}),
    };

    localStorage.setItem("thinksy_custom_babs", JSON.stringify(updated));

    // Siarkan event sinkronisasi realtime
    window.dispatchEvent(
      new CustomEvent("thinksy_due_soon_updated", {
        detail: {
          babId,
          ...data,
        },
      })
    );
    window.dispatchEvent(
      new CustomEvent("thinksy_bab_updated", {
        detail: {
          id: babId,
          supabaseId: data.supabaseId,
          judul: data.judul.trim(),
          deskripsi: data.deskripsi?.trim() || "",
          isOpen: data.isOpen,
          dueSoonDate: data.dueSoonDate,
          isScheduled: data.isScheduled,
        },
      })
    );
  } catch (err) {
    console.error("[saveBabDueSoonSettings error]:", err);
  }
}

/**
 * Hook untuk berlangganan perubahan item Due Soon di dashboard siswa
 */
export function useDueSoonItems() {
  const [items, setItems] = useState<DueSoonItem[]>(() => getAllDueSoonItems());

  useEffect(() => {
    setItems(getAllDueSoonItems());

    const handleSync = () => {
      setItems(getAllDueSoonItems());
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("thinksy_due_soon_updated", handleSync);
    window.addEventListener("thinksy_bab_updated", handleSync);
    window.addEventListener("thinksy_guru_classes_updated", handleSync);

    // Refresh countdown setiap 30 detik
    const interval = setInterval(() => {
      setItems(getAllDueSoonItems());
    }, 30000);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("thinksy_due_soon_updated", handleSync);
      window.removeEventListener("thinksy_bab_updated", handleSync);
      window.removeEventListener("thinksy_guru_classes_updated", handleSync);
      clearInterval(interval);
    };
  }, []);

  return items;
}

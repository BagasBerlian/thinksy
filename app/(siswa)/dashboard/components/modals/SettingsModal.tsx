"use client";

import { useState, useEffect, useRef } from "react";
import {
  Settings,
  X,
  Sun,
  Moon,
  Upload,
  Camera,
  Check,
  Save,
  User,
  Palette,
  Eye,
  Sparkles,
  ArrowLeft,
  FileText,
  BadgeCheck,
  Maximize2,
  Minimize2,
  RefreshCw,
  Layers,
  Bell,
  Globe,
  ChevronDown,
  ChevronUp,
  Plus,
  Loader2,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  StudentCardProfile,
  ThemeMode,
  ThemeColorAccent,
  DEFAULT_STUDENT_PHOTO,
  FEMALE_STUDENT_PHOTO,
  THEME_COLOR_OPTIONS,
  getStoredStudentProfile,
  saveStoredStudentProfile,
  getStoredThemeMode,
  getStoredThemeColor,
  applyTheme,
  saveStoredStudentPhoto,
  SettingsLanguage,
  getStoredLanguage,
  saveStoredLanguage,
  isStoredProfileLocked,
} from "@/lib/student-settings";

// Google Classroom Style Switch Component
function ClassroomToggle({
  checked,
  onChange,
  disabled = false,
  id,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden ${
        disabled ? "opacity-35 cursor-not-allowed" : ""
      } ${checked ? "bg-[#1967D2]" : "bg-slate-300 dark:bg-slate-700"}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-1 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

const NOTIF_TEXTS = {
  en: {
    headerTag: "Student Settings",
    headerTitle: "Settings & Notifications",
    notificationsCardTitle: "Notifications",
    emailHeading: "Email",
    emailSub: "These settings apply to the notifications you get by email.",
    learnMore: "Learn more",
    allowEmail: "Allow email notifications",
    commentsHeading: "Comments",
    commentsOnPosts: "Comments on your posts",
    commentsMention: "Comments that mention you",
    privateComments: "Private comments on work",
    classesHeading: "Classes you're enrolled in",
    workFromTeachers: "Work and other posts from teachers",
    returnedWork: "Returned work and grades from your teachers",
    invitations: "Invitations to join classes as a student",
    dueDateReminders: "Due-date reminders for your work",
    classNotificationsHeading: "Class notifications",
    classNotificationsSub: "These settings apply to both your email and device notifications for each class",
    noClasses: "No classes found yet.",
    addNewClass: "Add New Class",
    classNamePlaceholder: "Class name (e.g. Robotik & Coding)",
    addClassBtn: "Add",
    realtimeSyncBadge: "Real-time sync active",
    languageSettingHeading: "Language / Bahasa",
    languageSettingSub: "Choose display language for the application",
    saveSettings: "Save Settings",
    saved: "Saved!",
    close: "Close",
    back: "Back",
    tabNotifikasi: "Notifications",
    tabProfil: "Student Card & Profile",
    tabTampilan: "Appearance & Themes",
    tabAi: "AI Tutor",
  },
  id: {
    headerTag: "Pengaturan Siswa",
    headerTitle: "Pengaturan & Notifikasi",
    notificationsCardTitle: "Notifikasi",
    emailHeading: "Email",
    emailSub: "Setelan ini berlaku untuk notifikasi yang Anda terima melalui email.",
    learnMore: "Pelajari lebih lanjut",
    allowEmail: "Izinkan notifikasi email",
    commentsHeading: "Komentar",
    commentsOnPosts: "Komentar pada postingan Anda",
    commentsMention: "Komentar yang menyebutkan Anda",
    privateComments: "Komentar pribadi untuk tugas",
    classesHeading: "Kelas yang Anda ikuti",
    workFromTeachers: "Tugas dan postingan lain dari pengajar",
    returnedWork: "Tugas yang dikembalikan dan nilai dari pengajar",
    invitations: "Undangan untuk bergabung dengan kelas sebagai siswa",
    dueDateReminders: "Pengingat batas waktu untuk tugas Anda",
    classNotificationsHeading: "Notifikasi kelas",
    classNotificationsSub: "Setelan ini berlaku untuk notifikasi email dan perangkat untuk setiap kelas",
    noClasses: "Belum ada kelas yang terdaftar.",
    addNewClass: "Tambah Kelas Baru",
    classNamePlaceholder: "Nama kelas (contoh: Robotik & Coding)",
    addClassBtn: "Tambah",
    realtimeSyncBadge: "Tersinkronisasi real-time",
    languageSettingHeading: "Bahasa / Language",
    languageSub: "Pilih bahasa tampilan untuk aplikasi",
    languageSettingSub: "Pilih bahasa tampilan untuk aplikasi",
    saveSettings: "Simpan Pengaturan",
    saved: "Tersimpan!",
    close: "Tutup",
    back: "Kembali",
    tabNotifikasi: "Notifikasi",
    tabProfil: "Kartu Pelajar & Biodata",
    tabTampilan: "Mode Gelap & Tema Warna",
    tabAi: "Preferensi Tutor AI",
  },
};


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (val: boolean) => void;
  tutorGuidanceLevel?: string;
  setTutorGuidanceLevel?: (val: string) => void;
  profileData?: Partial<StudentCardProfile>;
  onSaveProfile?: (updatedData: StudentCardProfile) => void;
  onSave?: () => void;
  onOpenProfileCard?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  isDarkMode: externalDarkMode,
  setIsDarkMode: externalSetDarkMode,
  tutorGuidanceLevel: externalGuidance,
  setTutorGuidanceLevel: externalSetGuidance,
  profileData,
  onSaveProfile,
  onSave,
  onOpenProfileCard,
}: SettingsModalProps) {
  // Active Tab: "notifikasi", "profil", "tampilan", "ai"
  const [activeTab, setActiveTab] = useState<"notifikasi" | "profil" | "tampilan" | "ai">("notifikasi");

  // Language State
  const [language, setLanguage] = useState<SettingsLanguage>(() => {
    return getStoredLanguage();
  });
  const dict = NOTIF_TEXTS[language] || NOTIF_TEXTS.id;

  const handleSelectLanguage = (lang: SettingsLanguage) => {
    setLanguage(lang);
    saveStoredLanguage(lang);
  };

  // Google Classroom Notifications Settings State
  const [allowEmailNotifications, setAllowEmailNotifications] = useState(true);
  const [commentsOnPosts, setCommentsOnPosts] = useState(true);
  const [commentsMentionYou, setCommentsMentionYou] = useState(true);
  const [privateCommentsOnWork, setPrivateCommentsOnWork] = useState(true);
  const [workFromTeachers, setWorkFromTeachers] = useState(true);
  const [returnedWorkGrades, setReturnedWorkGrades] = useState(true);
  const [invitationsToJoinClasses, setInvitationsToJoinClasses] = useState(true);
  const [dueDateReminders, setDueDateReminders] = useState(true);

  // Dynamic Class Notifications List (Real-time synced)
  interface ClassItem {
    id: string;
    nama: string;
    initial: string;
    colorBg: string;
    colorText: string;
  }
  const [classesList, setClassesList] = useState<ClassItem[]>([]);
  const [classToggles, setClassToggles] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("thinksy_class_toggles");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {};
  });
  const [isClassNotificationsExpanded, setIsClassNotificationsExpanded] = useState(true);
  const [newClassName, setNewClassName] = useState("");
  const [isAddingClass, setIsAddingClass] = useState(false);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/siswa/kelas");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.classes)) {
          setClassesList(data.classes);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch classes:", err);
    }
  };

  // Real-time synchronization for classes
  useEffect(() => {
    if (isOpen) {
      fetchClasses();

      const supabase = createClient();
      const channel = supabase
        .channel("realtime-settings-kelas")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "kelas" },
          () => {
            fetchClasses();
          }
        )
        .subscribe();

      const handleUpdateEvent = () => fetchClasses();
      window.addEventListener("thinksy_classes_update", handleUpdateEvent);

      return () => {
        supabase.removeChannel(channel);
        window.removeEventListener("thinksy_classes_update", handleUpdateEvent);
      };
    }
  }, [isOpen]);

  // Load saved notifications preferences
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("thinksy_notification_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.allowEmailNotifications === "boolean") setAllowEmailNotifications(parsed.allowEmailNotifications);
          if (typeof parsed.commentsOnPosts === "boolean") setCommentsOnPosts(parsed.commentsOnPosts);
          if (typeof parsed.commentsMentionYou === "boolean") setCommentsMentionYou(parsed.commentsMentionYou);
          if (typeof parsed.privateCommentsOnWork === "boolean") setPrivateCommentsOnWork(parsed.privateCommentsOnWork);
          if (typeof parsed.workFromTeachers === "boolean") setWorkFromTeachers(parsed.workFromTeachers);
          if (typeof parsed.returnedWorkGrades === "boolean") setReturnedWorkGrades(parsed.returnedWorkGrades);
          if (typeof parsed.invitationsToJoinClasses === "boolean") setInvitationsToJoinClasses(parsed.invitationsToJoinClasses);
          if (typeof parsed.dueDateReminders === "boolean") setDueDateReminders(parsed.dueDateReminders);
        }
      } catch {}
    }
  }, [isOpen]);

  const handleCreateNewClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setIsAddingClass(true);
    try {
      const res = await fetch("/api/siswa/kelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_kelas: newClassName.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.class) {
        setNewClassName("");
        fetchClasses();
        window.dispatchEvent(new CustomEvent("thinksy_classes_update"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingClass(false);
    }
  };

  // Profile Form State
  const [formData, setFormData] = useState<StudentCardProfile>(() => {
    return getStoredStudentProfile(profileData);
  });

  // Photo State (Wajib selalu ada)
  const [photoUrl, setPhotoUrl] = useState<string>(() => {
    return formData.foto_url || DEFAULT_STUDENT_PHOTO;
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Theme & Appearance State
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return getStoredThemeMode();
  });
  const [themeColor, setThemeColor] = useState<ThemeColorAccent>(() => {
    return getStoredThemeColor();
  });

  // Tutor Guidance
  const [guidanceLevel, setGuidanceLevel] = useState<string>(() => {
    if (externalGuidance) return externalGuidance;
    if (typeof window !== "undefined") {
      return localStorage.getItem("thinksy_tutor_guidance") || "sedang";
    }
    return "sedang";
  });

  // Saved notification feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isProfileLockedByGuru, setIsProfileLockedByGuru] = useState<boolean>(() => isStoredProfileLocked());

  // Sync initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      const current = getStoredStudentProfile(profileData);
      setFormData(current);
      setPhotoUrl(current.foto_url || DEFAULT_STUDENT_PHOTO);
      const mode = getStoredThemeMode();
      setThemeMode(mode);
      setThemeColor(getStoredThemeColor());
      setIsProfileLockedByGuru(isStoredProfileLocked());
      if (externalGuidance) setGuidanceLevel(externalGuidance);
    }

    const handleLockEvent = (e: any) => {
      if (typeof e.detail === "boolean") {
        setIsProfileLockedByGuru(e.detail);
      }
    };
    window.addEventListener("thinksy_profile_lock_change", handleLockEvent);
    return () => window.removeEventListener("thinksy_profile_lock_change", handleLockEvent);
  }, [isOpen, profileData, externalGuidance]);

  if (!isOpen) return null;

  // Handle Photo File Upload (Convert to Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("Ukuran foto maksimal 4MB untuk menjaga kecepatan sistem.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPhotoUrl(result);
        setFormData((prev) => ({ ...prev, foto_url: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Theme Mode Selection
  const handleSelectMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    applyTheme(mode, themeColor);
    if (externalSetDarkMode) {
      externalSetDarkMode(mode === "dark" || mode === "dim");
    }
  };

  // Handle Theme Color Selection
  const handleSelectColor = (color: ThemeColorAccent) => {
    setThemeColor(color);
    applyTheme(themeMode, color);
  };

  // Save All Settings
  const handleSaveAll = () => {
    const finalProfile: StudentCardProfile = {
      ...formData,
      foto_url: photoUrl || DEFAULT_STUDENT_PHOTO,
    };

    // 1. Simpan profil & foto ke storage
    saveStoredStudentProfile(finalProfile);

    // 2. Simpan preferensi tema & warna
    applyTheme(themeMode, themeColor);
    if (externalSetDarkMode) {
      externalSetDarkMode(themeMode === "dark" || themeMode === "dim");
    }

    // 3. Simpan preferensi bimbingan AI
    try {
      localStorage.setItem("thinksy_tutor_guidance", guidanceLevel);
      if (externalSetGuidance) {
        externalSetGuidance(guidanceLevel);
      }
    } catch {}

    // 4. Simpan preferensi notifikasi & bahasa
    try {
      const notifSettings = {
        allowEmailNotifications,
        commentsOnPosts,
        commentsMentionYou,
        privateCommentsOnWork,
        workFromTeachers,
        returnedWorkGrades,
        invitationsToJoinClasses,
        dueDateReminders,
      };
      localStorage.setItem("thinksy_notification_settings", JSON.stringify(notifSettings));
      localStorage.setItem("thinksy_class_toggles", JSON.stringify(classToggles));
      saveStoredLanguage(language);
    } catch {}

    // 5. Callback ke parent
    if (onSaveProfile) {
      onSaveProfile(finalProfile);
    }
    if (onSave) {
      onSave();
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] dark:bg-[#090D16] flex flex-col text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar animate-in fade-in duration-200">
      {/* ════════════════════════════════════════════════════════════
          1. STICKY TOP HEADER (NORMAL SCREEN LAYOUT)
         ════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-2xs shrink-0 relative">
        {/* Tombol Back di Paling Kiri */}
        <div className="absolute left-3.5 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-10">
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
            title="Tutup & Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden min-[1360px]:inline">Kembali</span>
          </button>
        </div>

        <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Header Title: Sejajar dengan Card di Bawah */}
          <div className="flex items-center gap-2.5 min-w-0 pl-11 sm:pl-12 min-[1280px]:pl-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black shadow-xs shrink-0 bg-blue-50 dark:bg-blue-950/40 text-[#1967D2] border border-blue-200 dark:border-blue-800">
              <Settings className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {dict.headerTag}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-[#0F172A] dark:text-white truncate">
                {dict.headerTitle}
              </h2>
            </div>
          </div>

          {/* Action Buttons Header */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher in Header */}
            <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleSelectLanguage("id")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  language === "id"
                    ? "bg-white dark:bg-slate-900 text-[#1967D2] shadow-xs font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Bahasa Indonesia"
              >
                <span>🇮🇩</span>
                <span className="hidden md:inline">ID</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectLanguage("en")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  language === "en"
                    ? "bg-white dark:bg-slate-900 text-[#1967D2] shadow-xs font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="English"
              >
                <span>🇬🇧</span>
                <span className="hidden md:inline">EN</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saveSuccess}
              className="px-4 py-2 rounded-xl bg-[#0F172A] dark:bg-[#1967D2] hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-75"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{dict.saved}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-blue-400 dark:text-white" />
                  <span className="hidden sm:inline">{dict.saveSettings}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">{dict.close}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════
          2. MAIN BODY (NORMAL SCREEN SPACE)
         ════════════════════════════════════════════════════════════ */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Hero Banner Pengaturan */}
        <div className="saas-card rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
              Pusat Pengaturan Siswa & Kartu Resmi
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Atur pasfoto wajib resmi, edit identitas nama & kelas Kartu Tanda Pelajar, pilih tema warna tampilan, serta mode gelap/terang.
            </p>
          </div>

          {/* Quick Preview Badge */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            {onOpenProfileCard && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProfileCard();
                }}
                className="px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Layers className="w-4 h-4" />
                <span>Lihat Kartu Pelajar</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Selector Nav */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs font-bold w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("notifikasi")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === "notifikasi"
                ? "bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white shadow-xs font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Bell className="w-4 h-4 text-[#1967D2]" />
            <span>{dict.tabNotifikasi}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profil")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === "profil"
                ? "bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white shadow-xs font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <User className="w-4 h-4 text-blue-600" />
            <span>{dict.tabProfil}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tampilan")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === "tampilan"
                ? "bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white shadow-xs font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Palette className="w-4 h-4 text-amber-500" />
            <span>{dict.tabTampilan}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === "ai"
                ? "bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white shadow-xs font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{dict.tabAi}</span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════
            TAB 0: GOOGLE CLASSROOM NOTIFICATIONS (MATCHING SCREENSHOT)
           ════════════════════════════════════════════════════════════ */}
        {activeTab === "notifikasi" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Language Selection Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#1967D2] flex items-center justify-center font-bold shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {dict.languageSettingHeading}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {dict.languageSettingSub}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => handleSelectLanguage("id")}
                  className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    language === "id"
                      ? "bg-white dark:bg-slate-900 text-[#1967D2] shadow-xs font-extrabold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>🇮🇩</span>
                  <span>Bahasa Indonesia</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLanguage("en")}
                  className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    language === "en"
                      ? "bg-white dark:bg-slate-900 text-[#1967D2] shadow-xs font-extrabold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>English</span>
                </button>
              </div>
            </div>

            {/* Google Classroom Notifications Card (Matching Exact Screenshot) */}
            <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-300/90 dark:border-slate-800 p-6 sm:p-8 space-y-7 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-normal text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                  {dict.notificationsCardTitle}
                </h2>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{dict.realtimeSyncBadge}</span>
                </div>
              </div>

              {/* 1. EMAIL */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium text-slate-800 dark:text-slate-100">
                    {dict.emailHeading}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {dict.emailSub}{" "}
                    <a
                      href="#learn-more"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(
                          language === "en"
                            ? "Email notifications keep you informed about assignments, comments, and classroom activities."
                            : "Notifikasi email membuat Anda selalu mengetahui tugas, komentar, dan aktivitas kelas terbaru."
                        );
                      }}
                      className="text-[#1967D2] hover:underline cursor-pointer"
                    >
                      {dict.learnMore}
                    </a>
                  </p>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-normal text-slate-800 dark:text-slate-200">
                    {dict.allowEmail}
                  </span>
                  <ClassroomToggle
                    id="toggle-allow-email"
                    checked={allowEmailNotifications}
                    onChange={(val) => setAllowEmailNotifications(val)}
                  />
                </div>
              </div>

              {/* 2. COMMENTS */}
              <div
                className={`space-y-4 transition-opacity ${
                  allowEmailNotifications ? "opacity-100" : "opacity-40"
                }`}
              >
                <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {dict.commentsHeading}
                </h3>
                <div className="space-y-3.5 pl-0.5">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-normal text-slate-800 dark:text-slate-200">
                      {dict.commentsOnPosts}
                    </span>
                    <ClassroomToggle
                      checked={commentsOnPosts && allowEmailNotifications}
                      onChange={(val) => setCommentsOnPosts(val)}
                      disabled={!allowEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-normal text-slate-800 dark:text-slate-200">
                      {dict.commentsMention}
                    </span>
                    <ClassroomToggle
                      checked={commentsMentionYou && allowEmailNotifications}
                      onChange={(val) => setCommentsMentionYou(val)}
                      disabled={!allowEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-normal text-slate-800 dark:text-slate-200">
                      {dict.privateComments}
                    </span>
                    <ClassroomToggle
                      checked={privateCommentsOnWork && allowEmailNotifications}
                      onChange={(val) => setPrivateCommentsOnWork(val)}
                      disabled={!allowEmailNotifications}
                    />
                  </div>
                </div>
              </div>

              {/* 3. CLASSES YOU'RE ENROLLED IN */}
              <div
                className={`space-y-4 transition-opacity ${
                  allowEmailNotifications ? "opacity-100" : "opacity-40"
                }`}
              >
                <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {dict.classesHeading}
                </h3>
                <div className="space-y-3.5 pl-0.5">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-normal text-slate-800 dark:text-slate-200">
                      {dict.workFromTeachers}
                    </span>
                    <ClassroomToggle
                      checked={workFromTeachers && allowEmailNotifications}
                      onChange={(val) => setWorkFromTeachers(val)}
                      disabled={!allowEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-normal text-slate-800 dark:text-slate-200">
                      {dict.returnedWork}
                    </span>
                    <ClassroomToggle
                      checked={returnedWorkGrades && allowEmailNotifications}
                      onChange={(val) => setReturnedWorkGrades(val)}
                      disabled={!allowEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-normal text-slate-800 dark:text-slate-200">
                      {dict.invitations}
                    </span>
                    <ClassroomToggle
                      checked={invitationsToJoinClasses && allowEmailNotifications}
                      onChange={(val) => setInvitationsToJoinClasses(val)}
                      disabled={!allowEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-normal text-slate-800 dark:text-slate-200">
                      {dict.dueDateReminders}
                    </span>
                    <ClassroomToggle
                      checked={dueDateReminders && allowEmailNotifications}
                      onChange={(val) => setDueDateReminders(val)}
                      disabled={!allowEmailNotifications}
                    />
                  </div>
                </div>
              </div>

              {/* DIVIDER */}
              <hr className="border-slate-200 dark:border-slate-800 -mx-6 sm:-mx-8" />

              {/* 4. CLASS NOTIFICATIONS (COLLAPSIBLE WITH CHEVRON) */}
              <div className="space-y-4">
                <div
                  onClick={() =>
                    setIsClassNotificationsExpanded(!isClassNotificationsExpanded)
                  }
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <div>
                    <h3 className="text-base font-medium text-slate-800 dark:text-slate-100 group-hover:text-[#1967D2] transition">
                      {dict.classNotificationsHeading}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {dict.classNotificationsSub}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Toggle class notifications dropdown"
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {isClassNotificationsExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {isClassNotificationsExpanded && (
                  <div className="space-y-3.5 pt-2 animate-in fade-in duration-200">
                    {classesList.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 text-center">
                        {dict.noClasses}
                      </div>
                    ) : (
                      classesList.map((cls) => {
                        const isEnabled = classToggles[cls.id] ?? true;
                        return (
                          <div
                            key={cls.id}
                            className="flex items-center justify-between py-1.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-1 rounded-xl transition"
                          >
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`w-8 h-8 rounded-full ${cls.colorBg} ${cls.colorText} flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs`}
                              >
                                {cls.initial}
                              </div>
                              <span className="text-sm font-normal text-slate-800 dark:text-slate-200">
                                {cls.nama}
                              </span>
                            </div>
                            <ClassroomToggle
                              checked={isEnabled}
                              onChange={(val) => {
                                setClassToggles((prev) => {
                                  const updated = { ...prev, [cls.id]: val };
                                  if (typeof window !== "undefined") {
                                    localStorage.setItem(
                                      "thinksy_class_toggles",
                                      JSON.stringify(updated)
                                    );
                                  }
                                  return updated;
                                });
                              }}
                            />
                          </div>
                        );
                      })
                    )}

                    {/* Inline Form to Add Class in Realtime */}
                    <form
                      onSubmit={handleCreateNewClass}
                      className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-2"
                    >
                      <input
                        type="text"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder={dict.classNamePlaceholder}
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1967D2]"
                      />
                      <button
                        type="submit"
                        disabled={isAddingClass || !newClassName.trim()}
                        className="px-4 py-2 rounded-xl bg-[#1967D2] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {isAddingClass ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>{dict.addClassBtn}</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB 1: FOTO RESMI & BIODATA SISWA (KARTU PELAJAR)
           ════════════════════════════════════════════════════════════ */}
        {activeTab === "profil" && (
          <div className="space-y-6">
            {/* Bagian 1: Foto Siswa (Wajib Ada Fotonya) */}
            <div className="saas-card rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-base font-black text-[#0F172A] dark:text-white">
                      1. Foto Resmi Siswa (Wajib Terpasang)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sesuai ketentuan, setiap siswa wajib memiliki pasfoto resmi aktif untuk dicantumkan pada Kartu Tanda Pelajar.
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-black border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 self-start sm:self-auto">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>Status: Foto Aktif & Terverifikasi</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-7">
                {/* 3x4 Pasfoto Preview Frame */}
                <div className="flex flex-col items-center shrink-0 space-y-2">
                  <div className="relative group">
                    <div className="w-[120px] h-[160px] rounded-xl bg-[#C51E1E] border-3 border-slate-800 shadow-md overflow-hidden relative">
                      <img
                        src={photoUrl}
                        alt="Pasfoto Resmi Siswa"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Badge Rasio 3x4 */}
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white font-mono text-[9px] font-bold">
                        3x4 Resmi
                      </div>
                    </div>

                    {/* Cap Resmi Sekolah Overlay */}
                    <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full border-2 border-indigo-700/80 bg-indigo-50/30 backdrop-blur-[0.5px] -rotate-12 flex flex-col items-center justify-center text-[7px] font-black text-indigo-900 pointer-events-none shadow-xs">
                      <span className="leading-tight text-center px-1 font-bold">SMK MUH 1</span>
                      <span className="text-[8px] text-indigo-800 font-extrabold">★ CAP ★</span>
                      <span className="leading-tight text-center px-1 font-bold">TERDAFTAR</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">Pratinjau Kartu Pelajar</span>
                </div>

                {/* Upload & Preset Options */}
                <div className="flex-1 w-full space-y-5">
                  {/* File Upload Button */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="text-xs font-black text-[#0F172A] dark:text-white flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>Unggah Foto Sendiri dari Perangkat</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Pilih foto formal berpakaian rapi / seragam sekolah dengan latar belakang merah atau biru. Format JPG, PNG, atau WEBP.
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Pilih File Foto</span>
                      </button>
                      <span className="text-[10px] text-slate-500 font-medium">Maksimal 4MB</span>
                    </div>
                  </div>

                  {/* Preset Official Avatars */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                      Atau Gunakan Template Pasfoto Resmi Standar Sekolah:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Preset 1: Laki-laki */}
                      <div
                        onClick={() => {
                          setPhotoUrl(DEFAULT_STUDENT_PHOTO);
                          setFormData((prev) => ({ ...prev, foto_url: DEFAULT_STUDENT_PHOTO }));
                        }}
                        className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${
                          photoUrl === DEFAULT_STUDENT_PHOTO
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <img
                          src={DEFAULT_STUDENT_PHOTO}
                          alt="Siswa Formal"
                          className="w-12 h-14 object-cover rounded-lg border border-slate-400 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-black text-[#0F172A] dark:text-white">
                            Pasfoto Siswa Formal
                          </div>
                          <div className="text-[10px] text-slate-500">Seragam Putih Abu-abu & Dasi</div>
                          {photoUrl === DEFAULT_STUDENT_PHOTO && (
                            <span className="text-[10px] font-black text-blue-600 flex items-center gap-1 mt-0.5">
                              <Check className="w-3 h-3" /> Dipilih
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Preset 2: Perempuan */}
                      <div
                        onClick={() => {
                          setPhotoUrl(FEMALE_STUDENT_PHOTO);
                          setFormData((prev) => ({ ...prev, foto_url: FEMALE_STUDENT_PHOTO }));
                        }}
                        className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${
                          photoUrl === FEMALE_STUDENT_PHOTO
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <img
                          src={FEMALE_STUDENT_PHOTO}
                          alt="Siswi Berhijab"
                          className="w-12 h-14 object-cover rounded-lg border border-slate-400 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-black text-[#0F172A] dark:text-white">
                            Pasfoto Siswi Berhijab
                          </div>
                          <div className="text-[10px] text-slate-500">Seragam Formal & Jilbab Putih</div>
                          {photoUrl === FEMALE_STUDENT_PHOTO && (
                            <span className="text-[10px] font-black text-blue-600 flex items-center gap-1 mt-0.5">
                              <Check className="w-3 h-3" /> Dipilih
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian 2: Biodata Kartu Tanda Pelajar (Dikelola oleh Guru) */}
            <div className="saas-card rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black text-[#0F172A] dark:text-white flex items-center gap-2">
                    <span>2. Informasi & Biodata Kartu Tanda Pelajar</span>
                    {isProfileLockedByGuru && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300">
                        Dikelola Guru
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isProfileLockedByGuru
                      ? "Data resmi Kartu Pelajar (Nama, Kelas, NISN, Jurusan, TTL, Agama) dikelola langsung oleh Guru melalui Dashboard Guru."
                      : "Ubah data nama, kelas, NIS/NISN, serta jurusan tanpa menghapus format data resmi lainnya."}
                  </p>
                </div>
              </div>

              {isProfileLockedByGuru && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-extrabold block">Pengaturan Profil Resmi Dikunci oleh Guru</span>
                    <p className="font-medium opacity-90 leading-relaxed">
                      Sesuai kebijakan sekolah, pengeditan data resmi Kartu Pelajar dipindahkan ke Dashboard Guru agar data terstandar. Untuk perubahan data resmi, silakan hubungi wali kelas.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Nama Lengkap */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nama Lengkap Siswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={isProfileLockedByGuru}
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    placeholder="Contoh: SYAA PX"
                    className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isProfileLockedByGuru ? "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900" : ""
                    }`}
                  />
                </div>

                {/* Kelas */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kelas / Rombel <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={isProfileLockedByGuru}
                    value={formData.nama_kelas}
                    onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
                    placeholder="Contoh: Kelas 8, Kelas 9, Kelas 10 TKJ"
                    className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isProfileLockedByGuru ? "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900" : ""
                    }`}
                  />
                  {!isProfileLockedByGuru && (
                    <div className="flex gap-1.5 pt-1">
                      {["Kelas 8", "Kelas 7", "Kelas 9", "Kelas 10 TKJ"].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setFormData({ ...formData, nama_kelas: k })}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-bold cursor-pointer"
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Kompetensi Keahlian / Jurusan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kompetensi Keahlian / Jurusan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={isProfileLockedByGuru}
                    value={formData.jurusan}
                    onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                    placeholder="Contoh: Teknik Komputer & Jaringan"
                    className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isProfileLockedByGuru ? "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900" : ""
                    }`}
                  />
                </div>

                {/* NIS */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nomor Induk Siswa (NIS)
                  </label>
                  <input
                    type="text"
                    disabled={isProfileLockedByGuru}
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    placeholder="Contoh: 260481"
                    className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isProfileLockedByGuru ? "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900" : ""
                    }`}
                  />
                </div>

                {/* NISN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    NISN Nasional
                  </label>
                  <input
                    type="text"
                    disabled={isProfileLockedByGuru}
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    placeholder="Contoh: 0089247182"
                    className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isProfileLockedByGuru ? "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900" : ""
                    }`}
                  />
                </div>

                {/* Tempat, Tanggal Lahir */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tempat, Tanggal Lahir
                  </label>
                  <input
                    type="text"
                    disabled={isProfileLockedByGuru}
                    value={formData.tempat_tgl_lahir}
                    onChange={(e) => setFormData({ ...formData, tempat_tgl_lahir: e.target.value })}
                    placeholder="Contoh: Gunungkidul, 12 Agustus 2010"
                    className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isProfileLockedByGuru ? "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900" : ""
                    }`}
                  />
                </div>

                {/* Jenis Kelamin */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Jenis Kelamin
                  </label>
                  <select
                    disabled={isProfileLockedByGuru}
                    value={formData.jenis_kelamin}
                    onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white focus:outline-none ${
                      isProfileLockedByGuru ? "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900" : "cursor-pointer"
                    }`}
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                {/* Agama */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Agama
                  </label>
                  <select
                    disabled={isProfileLockedByGuru}
                    value={formData.agama}
                    onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white focus:outline-none ${
                      isProfileLockedByGuru ? "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900" : "cursor-pointer"
                    }`}
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>

                {/* Tahun Pelajaran */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tahun Pelajaran
                  </label>
                  <input
                    type="text"
                    value={formData.tahun_ajaran}
                    onChange={(e) => setFormData({ ...formData, tahun_ajaran: e.target.value })}
                    placeholder="Contoh: 2026/2027"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB 2: MODE GELAP / TERANG & BERBAGAI MACAM WARNA
           ════════════════════════════════════════════════════════════ */}
        {activeTab === "tampilan" && (
          <div className="space-y-6">
            {/* Bagian Mode Dasar (Terang / Gelap / Redup) */}
            <div className="saas-card rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="space-y-0.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-[#0F172A] dark:text-white">
                  1. Mode Gelap / Terang (Theme Mode)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pilih kenyamanan visual untuk membaca materi, latihan soal, dan navigasi dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Mode Terang */}
                <button
                  type="button"
                  onClick={() => handleSelectMode("light")}
                  className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-3 cursor-pointer ${
                    themeMode === "light"
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Sun className="w-5 h-5" />
                    </div>
                    {themeMode === "light" && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#0F172A] dark:text-white">Mode Terang</div>
                    <div className="text-[10px] text-slate-500">Latar bersih, kontras tinggi di siang hari</div>
                  </div>
                </button>

                {/* Mode Gelap */}
                <button
                  type="button"
                  onClick={() => handleSelectMode("dark")}
                  className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-3 cursor-pointer ${
                    themeMode === "dark"
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
                      <Moon className="w-5 h-5" />
                    </div>
                    {themeMode === "dark" && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#0F172A] dark:text-white">Mode Gelap (OLED)</div>
                    <div className="text-[10px] text-slate-500">Warna pekat elegan, hemat baterai & mata</div>
                  </div>
                </button>

                {/* Mode Redup */}
                <button
                  type="button"
                  onClick={() => handleSelectMode("dim")}
                  className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-3 cursor-pointer ${
                    themeMode === "dim"
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center">
                      <Eye className="w-5 h-5" />
                    </div>
                    {themeMode === "dim" && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#0F172A] dark:text-white">Mode Redup (Eye-Care)</div>
                    <div className="text-[10px] text-slate-500">Abu-abu lembut, nyaman untuk belajar malam</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Bagian Berbagai Macam Warna (Color Themes) */}
            <div className="saas-card rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="space-y-0.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Palette className="w-4.5 h-4.5 text-amber-500" />
                  <h3 className="text-base font-black text-[#0F172A] dark:text-white">
                    2. Pilihan Berbagai Macam Warna Tema (Color Palette)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sesuaikan warna aksen tombol, kartu sorotan, dan elemen dashboard sesuai warna favorit Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {THEME_COLOR_OPTIONS.map((c) => {
                  const isSelected = themeColor === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectColor(c.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition flex items-center gap-3.5 cursor-pointer ${
                        isSelected
                          ? "border-blue-600 dark:border-blue-500 bg-slate-50 dark:bg-slate-800/80 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {/* Color Circle Swatch */}
                      <div
                        className="w-10 h-10 rounded-2xl shadow-sm shrink-0 flex items-center justify-center text-white"
                        style={{ backgroundColor: c.hex }}
                      >
                        {isSelected && <Check className="w-5 h-5 drop-shadow" />}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-black text-[#0F172A] dark:text-white flex items-center gap-1.5">
                          <span>{c.label}</span>
                          {isSelected && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                              Aktif
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {c.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB 3: PREFERENSI TUTOR AI
           ════════════════════════════════════════════════════════════ */}
        {activeTab === "ai" && (
          <div className="saas-card rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="space-y-0.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-[#0F172A] dark:text-white">
                Tingkat Bimbingan Tutor Sokratik AI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih gaya interaksi AI saat Anda mengerjakan kuis atau membaca rangkuman materi.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "sedang",
                  title: "Sedang (Bimbingan Sokratik Bertahap) — Direkomendasikan",
                  desc: "AI memberikan umpan balik langkah demi langkah agar siswa berpikir kritis secara mandiri.",
                },
                {
                  id: "tinggi",
                  title: "Detail (Bimbingan Lengkap dengan Contoh)",
                  desc: "AI memberikan penjelasan rinci beserta contoh analogi kehidupan sehari-hari.",
                },
                {
                  id: "ringkas",
                  title: "Ringkas (Petunjuk Singkat & Rumus Utama)",
                  desc: "AI hanya memberikan kata kunci dan rumus penting tanpa narasi panjang.",
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 cursor-pointer transition ${
                    guidanceLevel === opt.id
                      ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="guidanceLevel"
                    value={opt.id}
                    checked={guidanceLevel === opt.id}
                    onChange={(e) => setGuidanceLevel(e.target.value)}
                    className="mt-1 w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-black text-[#0F172A] dark:text-white">
                      {opt.title}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            FOOTER ACTION BAR
           ════════════════════════════════════════════════════════════ */}
        <div className="saas-card rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
            Perubahan foto, identitas kartu pelajar, dan tema warna akan langsung tersimpan secara permanen.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saveSuccess}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#0F172A] dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-75"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Berhasil Disimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-400 dark:text-slate-950" />
                  <span>Simpan Semua Pengaturan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

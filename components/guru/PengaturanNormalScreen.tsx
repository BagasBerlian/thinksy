"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Palette,
  Layout,
  CheckCircle2,
  Save,
  Check,
  RotateCcw,
  Bell,
  Globe,
  ChevronDown,
  ChevronUp,
  Plus,
  Loader2,
  Grid,
  Columns,
  Maximize,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Bot,
  Zap,
  GraduationCap,
  Award,
  HelpCircle,
  Eye,
  Sliders,
  Clock,
  BookOpen,
  MessageSquare,
  Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  SettingsLanguage,
  getStoredLanguage,
  saveStoredLanguage,
} from "@/lib/student-settings";
import {
  getStoredAiSettings,
  saveStoredAiSettings,
  AiGuruSettings,
  DEFAULT_AI_SETTINGS,
} from "@/lib/ai-config";

export interface GuruLayoutConfig {
  layoutStyle: "grid" | "single" | "compact";
  showCardGuru: boolean;
  showAkuLulusControl: boolean;
  showQuickStats: boolean;
}

export const DEFAULT_LAYOUT_CONFIG: GuruLayoutConfig = {
  layoutStyle: "grid",
  showCardGuru: true,
  showAkuLulusControl: true,
  showQuickStats: true,
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
    name: "Oxford Navy (Biru Keasramaan)",
    subtitle: "Akademik, solid, terpercaya, dan fokus belajar",
    primaryColor: "#1E3A8A",
    accentColor: "#38BDF8",
    bgClass: "bg-[#F8FAFC]",
    previewBg: "from-[#0F172A] to-[#1E3A8A]",
    borderClass: "border-blue-200",
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
];

// Google Classroom Style Switch Component (Thinksy Blue #1967D2)
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
      } ${checked ? "bg-[#1967D2]" : "bg-slate-300"}`}
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

const SETTINGS_TEXTS = {
  en: {
    headerTag: "TEACHER SETTINGS",
    headerTitle: "Settings & Notifications",
    headerDesc:
      "Configure email alerts, comments, real-time class notifications, display language, and teacher workspace layout.",
    notificationsCardTitle: "Notifications",
    emailHeading: "Email",
    emailSub: "These settings apply to the notifications you get by email.",
    learnMore: "Learn more",
    allowEmail: "Allow email notifications",
    commentsHeading: "Comments",
    commentsOnPosts: "Comments on your posts",
    commentsMention: "Comments that mention you",
    privateComments: "Private comments on work",
    classesHeading: "Classes you teach",
    workFromTeachers: "Work and other posts from classes",
    returnedWork: "Returned work and grades from students",
    invitations: "Invitations to join classes as a teacher",
    dueDateReminders: "Due-date reminders for student work",
    classNotificationsHeading: "Class notifications",
    classNotificationsSub:
      "These settings apply to both your email and device notifications for each class",
    noClasses: "No classes found yet.",
    addNewClass: "Add New Class",
    classNamePlaceholder: "Class name (e.g. Robotik & Coding, 8A)",
    addClassBtn: "Add",
    realtimeSyncBadge: "Real-time sync active",
    languageSettingHeading: "Language / Bahasa",
    languageSettingSub: "Choose display language for the application",
    tabNotifikasi: "Notifications",
    tabBahasa: "Language",
    tabLayout: "Layout & Appearance",
    saveSettings: "Save Settings",
    saved: "Settings saved successfully!",
    resetDefault: "Reset Default",
    layoutTitle: "Homescreen Layout Format",
    layoutDesc: "Select the presentation style and widgets displayed on your Homescreen.",
    themeTitle: "Teacher Theme Color",
    themeDesc: "Choose your workspace color palette for a comfortable teaching experience.",
  },
  id: {
    headerTag: "PENGATURAN GURU",
    headerTitle: "Pengaturan & Notifikasi",
    headerDesc:
      "Kelola preferensi notifikasi email, komentar, notifikasi kelas terintegrasi real-time, bahasa tampilan, dan tata letak dashboard.",
    notificationsCardTitle: "Notifikasi",
    emailHeading: "Email",
    emailSub: "Setelan ini berlaku untuk notifikasi yang Anda terima melalui email.",
    learnMore: "Pelajari lebih lanjut",
    allowEmail: "Izinkan notifikasi email",
    commentsHeading: "Komentar",
    commentsOnPosts: "Komentar pada postingan Anda",
    commentsMention: "Komentar yang menyebutkan Anda",
    privateComments: "Komentar pribadi untuk tugas",
    classesHeading: "Kelas yang Anda ajar",
    workFromTeachers: "Tugas dan postingan lain dari rombel binaan",
    returnedWork: "Tugas yang dikembalikan dan nilai dari siswa",
    invitations: "Undangan untuk mengajar atau bergabung dengan kelas",
    dueDateReminders: "Pengingat batas waktu untuk tugas & ujian siswa",
    classNotificationsHeading: "Notifikasi kelas",
    classNotificationsSub:
      "Setelan ini berlaku untuk notifikasi email dan perangkat untuk setiap kelas",
    noClasses: "Belum ada kelas yang terdaftar.",
    addNewClass: "Tambah Kelas Baru",
    classNamePlaceholder: "Nama kelas (contoh: Robotik & Coding, 8A)",
    addClassBtn: "Tambah",
    realtimeSyncBadge: "Tersinkronisasi real-time",
    languageSettingHeading: "Bahasa / Language",
    languageSettingSub: "Pilih bahasa tampilan untuk aplikasi",
    tabNotifikasi: "Notifikasi",
    tabBahasa: "Bahasa",
    tabLayout: "Tata Letak & Tema",
    saveSettings: "Simpan Pengaturan",
    saved: "Pengaturan berhasil disimpan!",
    resetDefault: "Reset Default",
    layoutTitle: "Tata Letak (Layout) Homescreen Guru",
    layoutDesc: "Pilih format tampilan dan komponen yang ingin ditampilkan di Beranda guru.",
    themeTitle: "Warna Tema di Layar Guru",
    themeDesc: "Pilih skema warna tema layar guru yang paling nyaman untuk proses mengajar Anda.",
  },
};

interface ClassItem {
  id: string;
  nama: string;
  initial: string;
  colorBg: string;
  colorText: string;
}

export default function PengaturanNormalScreen() {
  const [activeTab, setActiveTab] = useState<"notifikasi" | "bahasa" | "layout" | "ai_tutor">("notifikasi");
  const [layoutConfig, setLayoutConfig] = useState<GuruLayoutConfig>(DEFAULT_LAYOUT_CONFIG);
  const [activeThemeId, setActiveThemeId] = useState<string>("slate");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // AI Configuration State (2 Tipe: Kelas & Kuis)
  const [aiConfig, setAiConfig] = useState<AiGuruSettings>(() => getStoredAiSettings());
  const [previewMode, setPreviewMode] = useState<"kelas" | "kuis">("kuis");

  // Language state (Indonesian & English)
  const [language, setLanguage] = useState<SettingsLanguage>(() => {
    return getStoredLanguage();
  });
  const dict = SETTINGS_TEXTS[language] || SETTINGS_TEXTS.id;

  const handleSelectLanguage = (lang: SettingsLanguage) => {
    setLanguage(lang);
    saveStoredLanguage(lang);
    setSaveSuccessMessage(
      lang === "id" ? "Bahasa tampilan diubah ke Bahasa Indonesia" : "Display language changed to English"
    );
    setTimeout(() => setSaveSuccessMessage(null), 3000);
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

  // Real-time Class Notifications List
  const [classesList, setClassesList] = useState<ClassItem[]>([]);
  const [classToggles, setClassToggles] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("thinksy_guru_class_toggles");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {};
  });
  const [isClassNotificationsExpanded, setIsClassNotificationsExpanded] = useState(true);
  const [newClassName, setNewClassName] = useState("");
  const [isAddingClass, setIsAddingClass] = useState(false);

  // Fetch classes dynamically
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
      console.warn("Failed to fetch classes in PengaturanNormalScreen:", err);
    }
  };

  // Real-time synchronization for classes (Supabase postgres_changes + custom event)
  useEffect(() => {
    fetchClasses();

    const supabase = createClient();
    const channel = supabase
      .channel("realtime-pengaturan-guru-kelas")
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
  }, []);

  // Load persisted layout and settings on mount
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
      const savedNotifs = localStorage.getItem("thinksy_guru_notifications");
      if (savedNotifs) {
        const parsed = JSON.parse(savedNotifs);
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
  }, []);

  // Add new class handler (Instantly updates real-time in student & teacher)
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
        await fetchClasses();
        window.dispatchEvent(new CustomEvent("thinksy_classes_update"));
        setSaveSuccessMessage(
          language === "en"
            ? `Class "${data.class.nama}" added & synced in real-time!`
            : `Kelas "${data.class.nama}" berhasil ditambahkan & tersinkron real-time!`
        );
        setTimeout(() => setSaveSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingClass(false);
    }
  };

  const handleSelectTheme = (themeId: string) => {
    setActiveThemeId(themeId);
    try {
      localStorage.setItem("thinksy_guru_theme", themeId);
      window.dispatchEvent(new CustomEvent("guru_theme_changed", { detail: { themeId } }));
    } catch {}
    setSaveSuccessMessage(
      language === "en"
        ? `Theme palette changed to: ${GURU_THEMES.find((t) => t.id === themeId)?.name}`
        : `Tema warna berhasil diubah ke: ${GURU_THEMES.find((t) => t.id === themeId)?.name}`
    );
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleSaveAll = () => {
    try {
      // 1. Save notification settings
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
      localStorage.setItem("thinksy_guru_notifications", JSON.stringify(notifSettings));
      localStorage.setItem("thinksy_guru_class_toggles", JSON.stringify(classToggles));

      // 2. Save layout config
      localStorage.setItem("thinksy_guru_layout", JSON.stringify(layoutConfig));
      window.dispatchEvent(new CustomEvent("guru_layout_changed", { detail: layoutConfig }));

      // 3. Save AI configuration
      saveStoredAiSettings(aiConfig);
    } catch {}

    setSaveSuccessMessage(dict.saved);
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  const handleSaveAiConfig = () => {
    saveStoredAiSettings(aiConfig);
    setSaveSuccessMessage("Konfigurasi AI Siswa (Kelas & Kuis) berhasil disimpan & disinkronkan ke seluruh siswa!");
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  const handleResetLayout = () => {
    setLayoutConfig(DEFAULT_LAYOUT_CONFIG);
    try {
      localStorage.setItem("thinksy_guru_layout", JSON.stringify(DEFAULT_LAYOUT_CONFIG));
      window.dispatchEvent(new CustomEvent("guru_layout_changed", { detail: DEFAULT_LAYOUT_CONFIG }));
    } catch {}
    setSaveSuccessMessage(
      language === "en" ? "Homescreen layout reset to default." : "Tata letak Homescreen dikembalikan ke default."
    );
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ════════════════════════════════════════════════════════════
          1. HEADER BANNER NORMAL SCREEN PENGATURAN
         ════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {dict.headerTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            {dict.headerDesc}
          </p>
        </div>

        {/* Action Buttons & Language Quick Switch */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Language Switcher Pill */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold border border-slate-200/80">
            <button
              type="button"
              onClick={() => handleSelectLanguage("id")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                language === "id"
                  ? "bg-white text-[#1967D2] shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Bahasa Indonesia"
            >
              <span>🇮🇩</span>
              <span className="hidden sm:inline">ID</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectLanguage("en")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                language === "en"
                  ? "bg-white text-[#1967D2] shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="English"
            >
              <span>🇬🇧</span>
              <span className="hidden sm:inline">EN</span>
            </button>
          </div>

          <button
            onClick={handleResetLayout}
            className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title={dict.resetDefault}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{dict.resetDefault}</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-2xl bg-[#1967D2] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4 text-white" />
            <span>{dict.saveSettings}</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            className="text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Sub Navigation Segmented Tabs (Google Classroom Rounded Pill) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 w-fit text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("notifikasi")}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === "notifikasi"
              ? "bg-white text-[#1967D2] shadow-xs font-extrabold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Bell className="w-4 h-4 text-[#1967D2]" />
          <span>{dict.tabNotifikasi}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bahasa")}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === "bahasa"
              ? "bg-white text-[#1967D2] shadow-xs font-extrabold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Globe className="w-4 h-4 text-indigo-600" />
          <span>{dict.tabBahasa}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("layout")}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === "layout"
              ? "bg-white text-[#1967D2] shadow-xs font-extrabold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layout className="w-4 h-4 text-amber-500" />
          <span>{dict.tabLayout}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ai_tutor")}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === "ai_tutor"
              ? "bg-[#193446] text-[#E9C77B] shadow-sm font-extrabold ring-2 ring-amber-400/40"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Pengaturan AI Siswa</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-600 font-black">
            2 Tipe
          </span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB 1: GOOGLE CLASSROOM NOTIFICATIONS (MATCHING SCREENSHOT)
         ════════════════════════════════════════════════════════════ */}
      {activeTab === "notifikasi" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Language Switcher Card on Top of Notifications */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1967D2] flex items-center justify-center font-bold shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {dict.languageSettingHeading}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {dict.languageSettingSub}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => handleSelectLanguage("id")}
                className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  language === "id"
                    ? "bg-white text-[#1967D2] shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
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
                    ? "bg-white text-[#1967D2] shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>

          {/* Main Google Classroom Notifications Card (Matching Exact Screenshot) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-7 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-normal text-slate-800 font-sans tracking-tight">
                {dict.notificationsCardTitle}
              </h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{dict.realtimeSyncBadge}</span>
              </div>
            </div>



            {/* 2. COMMENTS */}
            <div
              className={`space-y-4 transition-opacity ${
                allowEmailNotifications ? "opacity-100" : "opacity-40"
              }`}
            >
              <h3 className="text-sm font-medium text-slate-800">
                {dict.commentsHeading}
              </h3>
              <div className="space-y-3.5 pl-0.5">
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-normal text-slate-800">
                    {dict.commentsOnPosts}
                  </span>
                  <ClassroomToggle
                    checked={commentsOnPosts && allowEmailNotifications}
                    onChange={(val) => setCommentsOnPosts(val)}
                    disabled={!allowEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-normal text-slate-800">
                    {dict.commentsMention}
                  </span>
                  <ClassroomToggle
                    checked={commentsMentionYou && allowEmailNotifications}
                    onChange={(val) => setCommentsMentionYou(val)}
                    disabled={!allowEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-normal text-slate-800">
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

            {/* 3. CLASSES YOU TEACH */}
            <div
              className={`space-y-4 transition-opacity ${
                allowEmailNotifications ? "opacity-100" : "opacity-40"
              }`}
            >
              <h3 className="text-sm font-medium text-slate-800">
                {dict.classesHeading}
              </h3>
              <div className="space-y-3.5 pl-0.5">
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-normal text-slate-800">
                    {dict.workFromTeachers}
                  </span>
                  <ClassroomToggle
                    checked={workFromTeachers && allowEmailNotifications}
                    onChange={(val) => setWorkFromTeachers(val)}
                    disabled={!allowEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-normal text-slate-800">
                    {dict.returnedWork}
                  </span>
                  <ClassroomToggle
                    checked={returnedWorkGrades && allowEmailNotifications}
                    onChange={(val) => setReturnedWorkGrades(val)}
                    disabled={!allowEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-normal text-slate-800">
                    {dict.invitations}
                  </span>
                  <ClassroomToggle
                    checked={invitationsToJoinClasses && allowEmailNotifications}
                    onChange={(val) => setInvitationsToJoinClasses(val)}
                    disabled={!allowEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-normal text-slate-800">
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
            <hr className="border-slate-200 -mx-6 sm:-mx-8" />

            {/* 4. CLASS NOTIFICATIONS (COLLAPSIBLE WITH CHEVRON & REAL-TIME SYNC) */}
            <div className="space-y-4">
              <div
                onClick={() => setIsClassNotificationsExpanded(!isClassNotificationsExpanded)}
                className="flex items-center justify-between cursor-pointer select-none group"
              >
                <div>
                  <h3 className="text-base font-medium text-slate-800 group-hover:text-[#1967D2] transition">
                    {dict.classNotificationsHeading}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">
                    {dict.classNotificationsSub}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Toggle class notifications dropdown"
                  className="p-1.5 text-slate-500 hover:text-slate-800 transition rounded-full hover:bg-slate-100 cursor-pointer"
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
                  {/* Dynamic Class List */}
                  {classesList.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-500 text-center font-medium">
                      {dict.noClasses}
                    </div>
                  ) : (
                    classesList.map((cls) => {
                      const isEnabled = classToggles[cls.id] ?? true;
                      return (
                        <div
                          key={cls.id}
                          className="flex items-center justify-between py-1.5 hover:bg-slate-50 px-2 rounded-xl transition"
                        >
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`w-8 h-8 rounded-full ${cls.colorBg} ${cls.colorText} flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs`}
                            >
                              {cls.initial}
                            </div>
                            <span className="text-sm font-normal text-slate-800">
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
                                    "thinksy_guru_class_toggles",
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

                  {/* Quick Add Class Form (Real-time sync testable) */}
                  <form
                    onSubmit={handleCreateNewClass}
                    className="pt-3 border-t border-slate-100 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder={dict.classNamePlaceholder}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-[#1967D2] transition font-sans"
                    />
                    <button
                      type="submit"
                      disabled={isAddingClass || !newClassName.trim()}
                      className="px-4 py-2 rounded-xl bg-[#1967D2] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
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
          TAB 2: BAHASA (LANGUAGE)
         ════════════════════════════════════════════════════════════ */}
      {activeTab === "bahasa" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1967D2] flex items-center justify-center font-black">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">
                {dict.languageSettingHeading}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {dict.languageSettingSub}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Opsi 1: Bahasa Indonesia */}
            <div
              onClick={() => handleSelectLanguage("id")}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                language === "id"
                  ? "border-[#1967D2] bg-blue-50/50 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🇮🇩</span>
                {language === "id" && (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#1967D2] text-white">
                    Aktif
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A]">Bahasa Indonesia</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Format bahasa baku Indonesia untuk modul evaluasi, kurikulum, dan asesmen.
                </p>
              </div>
            </div>

            {/* Opsi 2: English */}
            <div
              onClick={() => handleSelectLanguage("en")}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                language === "en"
                  ? "border-[#1967D2] bg-blue-50/50 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🇬🇧</span>
                {language === "en" && (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#1967D2] text-white">
                    Active
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A]">English (International)</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Standard educational English for prompts, instructions, and reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 3: TATA LETAK & TEMA GURU
         ════════════════════════════════════════════════════════════ */}
      {activeTab === "layout" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Format Tampilan */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                <Layout className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">
                  {dict.layoutTitle}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {dict.layoutDesc}
                </p>
              </div>
            </div>

            {/* Layout Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setLayoutConfig({ ...layoutConfig, layoutStyle: "grid" })}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  layoutConfig.layoutStyle === "grid"
                    ? "border-[#1967D2] bg-blue-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Grid className={`w-5 h-5 ${layoutConfig.layoutStyle === "grid" ? "text-[#1967D2]" : "text-slate-400"}`} />
                  {layoutConfig.layoutStyle === "grid" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1967D2] text-white">
                      Dipilih
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A]">Modern Grid (2 Kolom)</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                    Susunan kartu seimbang dan dinamis untuk layar laptop/desktop.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setLayoutConfig({ ...layoutConfig, layoutStyle: "single" })}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  layoutConfig.layoutStyle === "single"
                    ? "border-[#1967D2] bg-blue-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Columns className={`w-5 h-5 ${layoutConfig.layoutStyle === "single" ? "text-[#1967D2]" : "text-slate-400"}`} />
                  {layoutConfig.layoutStyle === "single" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1967D2] text-white">
                      Dipilih
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A]">Lebar Penuh (1 Kolom)</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                    Fokus membaca kartu satu per satu secara linear ke bawah tanpa distraksi.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setLayoutConfig({ ...layoutConfig, layoutStyle: "compact" })}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  layoutConfig.layoutStyle === "compact"
                    ? "border-[#1967D2] bg-blue-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Maximize className={`w-5 h-5 ${layoutConfig.layoutStyle === "compact" ? "text-[#1967D2]" : "text-slate-400"}`} />
                  {layoutConfig.layoutStyle === "compact" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1967D2] text-white">
                      Dipilih
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A]">Mode Kompak Ringkas</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                    Merapatkan jarak antar komponen untuk pemantauan cepat dalam satu layar.
                  </p>
                </div>
              </div>
            </div>

            {/* Homescreen Widgets Toggles */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Komponen yang Ditampilkan di Homescreen:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <label className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-[#0F172A] block">
                      Kredensial Guru (Foto, NIP, Jabatan)
                    </span>
                    <span className="text-[11px] text-slate-500 block font-medium">
                      Kartu profil lengkap pendidik di bagian atas Beranda.
                    </span>
                  </div>
                  <ClassroomToggle
                    checked={layoutConfig.showCardGuru}
                    onChange={(val) => setLayoutConfig({ ...layoutConfig, showCardGuru: val })}
                  />
                </label>

                <label className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-[#0F172A] block">
                      Settingan Ujian & Ulangan (Kontrol AkuLulus)
                    </span>
                    <span className="text-[11px] text-slate-500 block font-medium">
                      Sakelar buka/tutup asesmen untuk siswa.
                    </span>
                  </div>
                  <ClassroomToggle
                    checked={layoutConfig.showAkuLulusControl}
                    onChange={(val) => setLayoutConfig({ ...layoutConfig, showAkuLulusControl: val })}
                  />
                </label>

                <label className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-[#0F172A] block">
                      Statistik Ringkas & Jam Mengajar
                    </span>
                    <span className="text-[11px] text-slate-500 block font-medium">
                      Kartu ringkasan jam mengajar dan rombel binaan.
                    </span>
                  </div>
                  <ClassroomToggle
                    checked={layoutConfig.showQuickStats}
                    onChange={(val) => setLayoutConfig({ ...layoutConfig, showQuickStats: val })}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Theme Palette Options */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">
                  {dict.themeTitle}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {dict.themeDesc}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GURU_THEMES.map((theme) => {
                const isSelected = activeThemeId === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? "border-[#1967D2] bg-blue-50/40 shadow-xs ring-2 ring-blue-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div
                      className="h-16 rounded-2xl p-3 flex items-center justify-between text-white shadow-xs border border-black/10"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-xs"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                        <span className="text-xs font-bold">{theme.name.split(" ")[0]}</span>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#0F172A] flex items-center justify-between">
                        <span>{theme.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-[#1967D2] bg-blue-100 px-2.5 py-0.5 rounded-full">
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
                      <span className="text-[10px] font-semibold text-slate-400">Palet Aksara & Navigasi</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 4: PENGATURAN AI SISWA (2 TIPE: KELAS & KUIS)
         ════════════════════════════════════════════════════════════ */}
      {activeTab === "ai_tutor" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Hero Banner Header */}
          <div className="bg-[#193446] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E9C77B] text-xs font-black border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
                  <span>KONTROL PEDAGOGI & TOKEN THINKSY AI</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Pengaturan AI Siswa: <span className="text-[#E9C77B]">Kelas & Kuis</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  Kelola batasan token, tingkat bimbingan Sokratik, dan proteksi anti-kunci jawaban secara terpisah antara sesi belajar di kelas dan sesi pengerjaan kuis/ujian.
                </p>
              </div>

              {/* Status Indicators Pill */}
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 space-y-1">
                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>Status AI di Kelas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${aiConfig.kelas.enabled ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                    <span className="text-xs font-black text-white">
                      {aiConfig.kelas.enabled ? `Aktif (${aiConfig.kelas.dailyTokens} Token/Hari)` : "Nonaktif"}
                    </span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 space-y-1">
                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Status AI di Kuis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${aiConfig.kuis.enabled ? "bg-amber-400 animate-pulse" : "bg-slate-400"}`} />
                    <span className="text-xs font-black text-white">
                      {aiConfig.kuis.enabled ? `Dibatasi Ketat (${aiConfig.kuis.tokensPerQuiz} Bantuan)` : "Terkunci"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Dua Kolom: Tipe 1 & Tipe 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ═══════════════════════════════════════════════════════════ */}
            {/* TIPE 1: AI DI KELAS (RUANG BELAJAR & MATERI)                 */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                {/* Header Card Tipe 1 */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-inner border border-blue-100">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                          TIPE 1
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-[#0F172A]">
                          AI di Ruang Kelas
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Materi bacaan, eksplorasi bab, dan latihan mandiri harian
                      </p>
                    </div>
                  </div>

                  <ClassroomToggle
                    id="toggle-ai-kelas"
                    checked={aiConfig.kelas.enabled}
                    onChange={(val) =>
                      setAiConfig((prev) => ({
                        ...prev,
                        kelas: { ...prev.kelas, enabled: val },
                      }))
                    }
                  />
                </div>

                {/* Content Settings Tipe 1 */}
                <div className={`space-y-5 transition-opacity ${aiConfig.kelas.enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                  {/* Slider Kuota Token Harian */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Batas Kuota Token Harian per Siswa</span>
                      </label>
                      <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
                        {aiConfig.kelas.dailyTokens >= 100 ? "Tanpa Batas" : `${aiConfig.kelas.dailyTokens} Token / Hari`}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={5}
                      value={aiConfig.kelas.dailyTokens}
                      onChange={(e) =>
                        setAiConfig((prev) => ({
                          ...prev,
                          kelas: { ...prev.kelas, dailyTokens: parseInt(e.target.value, 10) },
                        }))
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[10, 20, 50, 100].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setAiConfig((prev) => ({
                              ...prev,
                              kelas: { ...prev.kelas, dailyTokens: val },
                            }))
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            aiConfig.kelas.dailyTokens === val
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {val === 100 ? "Tanpa Batas" : `${val} Token`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode Respon / Tingkat Bimbingan */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">
                      Tingkat Bimbingan Sokratik (Pedagogi)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        {
                          id: "socratic",
                          title: "Sokratik Murni",
                          desc: "Memancing pemikiran dengan pertanyaan balik reflektif",
                        },
                        {
                          id: "step_by_step",
                          title: "Step-by-Step",
                          desc: "Petunjuk alur penyelesaian bertahap",
                        },
                        {
                          id: "concept_summary",
                          title: "Konsep Dasar",
                          desc: "Ringkasan teori & analogi kehidupan nyata",
                        },
                      ].map((item) => {
                        const isSelected = aiConfig.kelas.guidanceLevel === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() =>
                              setAiConfig((prev) => ({
                                ...prev,
                                kelas: {
                                  ...prev.kelas,
                                  guidanceLevel: item.id as any,
                                },
                              }))
                            }
                            className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "border-blue-600 bg-blue-50/50 shadow-xs"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            <span className="text-xs font-black text-slate-900">{item.title}</span>
                            <span className="text-[10px] text-slate-500 font-medium mt-1 leading-snug">
                              {item.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Toggle Penjelasan Rumus */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Izinkan Penjelasan Rumus Matematika (LaTeX)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        AI boleh merender format rumus matematika resmi
                      </span>
                    </div>
                    <ClassroomToggle
                      id="toggle-rumus"
                      checked={aiConfig.kelas.allowExplanation}
                      onChange={(val) =>
                        setAiConfig((prev) => ({
                          ...prev,
                          kelas: { ...prev.kelas, allowExplanation: val },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Pengaturan langsung aktif di bab materi</span>
                <span className="font-bold text-blue-600">Mode Belajar Mandiri</span>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* TIPE 2: AI DI KUIS & UJIAN (ASESMEN KETAT)                    */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                {/* Header Card Tipe 2 */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shadow-inner border border-amber-100">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                          TIPE 2
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-[#0F172A]">
                          AI di Kuis & Ujian
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Asesmen berbatas waktu, penilaian akhir bab, & ujian resmi
                      </p>
                    </div>
                  </div>

                  <ClassroomToggle
                    id="toggle-ai-kuis"
                    checked={aiConfig.kuis.enabled}
                    onChange={(val) =>
                      setAiConfig((prev) => ({
                        ...prev,
                        kuis: { ...prev.kuis, enabled: val },
                      }))
                    }
                  />
                </div>

                {/* Content Settings Tipe 2 */}
                <div className={`space-y-5 transition-opacity ${aiConfig.kuis.enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                  {/* Slider Kuota Bantuan Kuis (Ketat) */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <span>Batas Bantuan AI per Sesi Kuis (Ketat)</span>
                      </label>
                      <span className="font-mono text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-200">
                        {aiConfig.kuis.tokensPerQuiz} Bantuan / Sesi Kuis
                      </span>
                    </div>

                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={aiConfig.kuis.tokensPerQuiz}
                      onChange={(e) =>
                        setAiConfig((prev) => ({
                          ...prev,
                          kuis: { ...prev.kuis, tokensPerQuiz: parseInt(e.target.value, 10) },
                        }))
                      }
                      className="w-full accent-amber-600 cursor-pointer"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[1, 3, 5, 10].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setAiConfig((prev) => ({
                              ...prev,
                              kuis: { ...prev.kuis, tokensPerQuiz: val },
                            }))
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            aiConfig.kuis.tokensPerQuiz === val
                              ? "bg-amber-600 text-white shadow-xs"
                              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {val === 3 ? "3 (Rekomendasi)" : `${val} Bantuan`}
                        </button>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-500 italic pt-1">
                      Bila token habis, input AI otomatis terkunci dan siswa wajib menyelesaikan sisa soal secara mandiri.
                    </p>
                  </div>

                  {/* Mode Proteksi Anti-Bocoran Kunci Jawaban */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Proteksi Anti-Bocoran Kunci Jawaban (Zero-Answer Mode)
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        WAJIB AKTIF
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      AI mendeteksi dan secara otomatis menolak apabila siswa meminta kunci jawaban (A/B/C/D) atau hasil hitungan final. AI hanya memberikan arahan logika berpikir.
                    </p>
                  </div>

                  {/* Cooldown Antar Pertanyaan */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Jeda Waktu Antar Pertanyaan (Cooldown)</span>
                      </label>
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {aiConfig.kuis.cooldownSeconds === 0 ? "Tanpa Jeda" : `${aiConfig.kuis.cooldownSeconds} Detik`}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {[0, 30, 60].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() =>
                            setAiConfig((prev) => ({
                              ...prev,
                              kuis: { ...prev.kuis, cooldownSeconds: sec },
                            }))
                          }
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            aiConfig.kuis.cooldownSeconds === sec
                              ? "bg-slate-900 text-white shadow-xs"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {sec === 0 ? "0 Detik" : `${sec} Detik`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Terintegrasi di Lembar Ujian & Kuis Bab</span>
                <span className="font-bold text-amber-700">Proteksi Asesmen Otomatis</span>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* PRATINJAU LANGSUNG TAMPILAN SISWA (INTERACTIVE PREVIEW)     */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#0F172A]">
                    Pratinjau Tampilan Siswa (Live Preview)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Lihat bagaimana tampilan widget Thinksy AI yang dilihat siswa sesuai konfigurasi yang Anda atur
                  </p>
                </div>
              </div>

              {/* Mode Toggle Switcher */}
              <div className="inline-flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewMode("kelas")}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    previewMode === "kelas"
                      ? "bg-white text-blue-700 shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Mode Kelas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("kuis")}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    previewMode === "kuis"
                      ? "bg-[#193446] text-[#E9C77B] shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode Kuis</span>
                </button>
              </div>
            </div>

            {/* Live Chat Component Box (Matching Screenshot 100%) */}
            <div className="max-w-xl mx-auto rounded-3xl border border-slate-200 shadow-lg overflow-hidden bg-white text-slate-900">
              {/* Header Box */}
              <div className="bg-[#193446] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 p-1 flex items-center justify-center shrink-0 border border-white/15">
                    <img src="/logo.png" alt="thinksy AI" className="w-full h-full object-contain drop-shadow-xs" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-[#E9C77B] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#E9C77B] animate-spin" style={{ animationDuration: "3s" }} />
                      thinksy AI {previewMode === "kuis" && <span className="text-[10px] text-amber-200 font-bold ml-1 px-1.5 py-0.2 rounded-md bg-amber-500/30 border border-amber-400/40">KUIS</span>}
                    </h5>
                    <p className="text-[10px] text-slate-300 font-medium">
                      {previewMode === "kuis"
                        ? "Bimbingan Sokratik Kuis • Anti-Kunci Jawaban"
                        : "Panduan Step-by-Step Tanpa Kunci Jawaban"}
                    </p>
                  </div>
                </div>

                <div>
                  {previewMode === "kuis" ? (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Kuota Kuis: {aiConfig.kuis.tokensPerQuiz}/{aiConfig.kuis.tokensPerQuiz}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-white/10 px-2.5 py-1 rounded-full text-slate-200 border border-white/10">
                      Sisa Kuota: {aiConfig.kelas.dailyTokens}/{aiConfig.kelas.dailyTokens}
                    </span>
                  )}
                </div>
              </div>

              {/* Body Messages Preview */}
              <div className="p-4 bg-slate-50/60 space-y-3.5 text-xs">
                {/* AI Welcome Bubble */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                    <img src="/logo.png" alt="AI" className="w-full h-full object-contain" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl p-3.5 bg-white text-slate-800 border border-slate-200/90 shadow-2xs rounded-tl-xs leading-relaxed">
                    Halo! Saya <strong>thinksy Socratic AI Tutor</strong> 🤖🦉. Ada konsep atau soal yang ingin kita bedah bersama? Saya akan membantumu menalar dan memahaminya langkah demi langkah secara mendalam!
                  </div>
                </div>

                {/* Sample User Bubble */}
                <div className="flex items-start gap-2.5 flex-row-reverse">
                  <div className="w-7 h-7 rounded-xl bg-[#193446] text-[#E9C77B] flex items-center justify-center shrink-0 shadow-xs text-[10px] font-black">
                    S
                  </div>
                  <div className="max-w-[85%] rounded-2xl p-3 bg-[#193446] text-white shadow-2xs rounded-tr-xs leading-relaxed font-medium">
                    Jelaskan secara ringkas poin penting dari Bab 1: Bilangan Berpangkat & Bentuk Akar
                  </div>
                </div>
              </div>

              {/* Sample Input Bar */}
              <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  disabled
                  placeholder="Tanyakan hal yang belum kamu pahami..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-400 bg-slate-50/50"
                />
                <button
                  type="button"
                  disabled
                  className="p-2.5 rounded-xl bg-[#193446] text-[#E9C77B] font-bold shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 font-medium">
              💡 Perubahan akan langsung disiarkan secara real-time ke semua browser siswa yang sedang aktif.
            </div>

            <button
              type="button"
              onClick={handleSaveAiConfig}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#193446] hover:bg-[#132836] text-[#E9C77B] font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4 text-[#E9C77B]" />
              <span>Simpan & Terapkan Konfigurasi AI</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

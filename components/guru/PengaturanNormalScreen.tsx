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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  SettingsLanguage,
  getStoredLanguage,
  saveStoredLanguage,
} from "@/lib/student-settings";

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
  const [activeTab, setActiveTab] = useState<"notifikasi" | "bahasa" | "layout">("notifikasi");
  const [layoutConfig, setLayoutConfig] = useState<GuruLayoutConfig>(DEFAULT_LAYOUT_CONFIG);
  const [activeThemeId, setActiveThemeId] = useState<string>("slate");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

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
    } catch {}

    setSaveSuccessMessage(dict.saved);
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

            {/* 1. EMAIL */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium text-slate-800">
                  {dict.emailHeading}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">
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
                <span className="text-sm font-normal text-slate-800">
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

                <label className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-xs font-bold text-[#0F172A] block">
                      Pratinjau Leaderboard Top Siswa
                    </span>
                    <span className="text-[11px] text-slate-500 block font-medium">
                      Cuplikan siswa dengan poin tertinggi langsung di Beranda.
                    </span>
                  </div>
                  <ClassroomToggle
                    checked={layoutConfig.showLeaderboardPreview}
                    onChange={(val) => setLayoutConfig({ ...layoutConfig, showLeaderboardPreview: val })}
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
    </div>
  );
}

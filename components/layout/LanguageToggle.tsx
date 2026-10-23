"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  variant?: "light" | "dark" | "compact";
  className?: string;
}

export default function LanguageToggle({
  variant = "light",
  className = "",
}: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  const isDark = variant === "dark";

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full border text-xs font-bold select-none transition shadow-2xs ${
        isDark
          ? "bg-slate-800/80 border-slate-700 text-slate-300"
          : "bg-slate-100 border-slate-200/90 text-slate-600"
      } ${className}`}
      role="group"
      aria-label="Pilih Bahasa / Select Language"
    >
      <div className="flex items-center gap-1 pl-1.5 pr-0.5 text-slate-400">
        <Globe className="w-3.5 h-3.5" />
      </div>

      <button
        type="button"
        onClick={() => setLanguage("id")}
        className={`px-2 py-0.5 rounded-full transition-all cursor-pointer font-extrabold ${
          language === "id"
            ? isDark
              ? "bg-[#1967D2] text-white shadow-xs scale-100"
              : "bg-white text-[#1967D2] shadow-xs scale-100"
            : isDark
            ? "hover:text-white opacity-70"
            : "hover:text-slate-900 opacity-70"
        }`}
        title="Bahasa Indonesia"
      >
        ID
      </button>

      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2 py-0.5 rounded-full transition-all cursor-pointer font-extrabold ${
          language === "en"
            ? isDark
              ? "bg-[#1967D2] text-white shadow-xs scale-100"
              : "bg-white text-[#1967D2] shadow-xs scale-100"
            : isDark
            ? "hover:text-white opacity-70"
            : "hover:text-slate-900 opacity-70"
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
}

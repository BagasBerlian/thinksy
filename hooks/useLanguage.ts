"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getStoredLanguage,
  saveStoredLanguage,
  SettingsLanguage,
} from "@/lib/student-settings";
import { translations, TranslationDictionary } from "@/lib/i18n";

export function useLanguage() {
  const [language, setLanguageState] = useState<SettingsLanguage>(() => {
    return getStoredLanguage();
  });

  useEffect(() => {
    // Initial sync
    setLanguageState(getStoredLanguage());

    const handleLangChange = (e: any) => {
      if (e?.detail && (e.detail === "id" || e.detail === "en")) {
        setLanguageState(e.detail);
      } else {
        setLanguageState(getStoredLanguage());
      }
    };

    window.addEventListener("thinksy_language_change", handleLangChange);
    window.addEventListener("storage", handleLangChange);
    return () => {
      window.removeEventListener("thinksy_language_change", handleLangChange);
      window.removeEventListener("storage", handleLangChange);
    };
  }, []);

  const setLanguage = useCallback((newLang: SettingsLanguage) => {
    setLanguageState(newLang);
    saveStoredLanguage(newLang);
  }, []);

  const toggleLanguage = useCallback(() => {
    const nextLang: SettingsLanguage = language === "id" ? "en" : "id";
    setLanguage(nextLang);
  }, [language, setLanguage]);

  const t: TranslationDictionary = translations[language] || translations.id;

  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
  };
}

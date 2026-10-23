"use client";

export interface AiGuruSettings {
  kelas: {
    enabled: boolean;
    dailyTokens: number;
    guidanceLevel: "socratic" | "step_by_step" | "concept_summary";
    allowExplanation: boolean;
  };
  kuis: {
    enabled: boolean;
    tokensPerQuiz: number;
    strictAntiCheat: boolean;
    cooldownSeconds: number;
    showQuotaWarning: boolean;
  };
}

export const DEFAULT_AI_SETTINGS: AiGuruSettings = {
  kelas: {
    enabled: true,
    dailyTokens: 20,
    guidanceLevel: "socratic",
    allowExplanation: true,
  },
  kuis: {
    enabled: true,
    tokensPerQuiz: 5,
    strictAntiCheat: true,
    cooldownSeconds: 30,
    showQuotaWarning: true,
  },
};

const STORAGE_KEY = "thinksy_ai_guru_settings";

/**
 * Mendapatkan konfigurasi AI yang diatur Guru dari storage / default
 */
export function getStoredAiSettings(): AiGuruSettings {
  if (typeof window === "undefined") {
    return DEFAULT_AI_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        kelas: { ...DEFAULT_AI_SETTINGS.kelas, ...(parsed.kelas || {}) },
        kuis: { ...DEFAULT_AI_SETTINGS.kuis, ...(parsed.kuis || {}) },
      };
    }
  } catch (err) {
    console.warn("Failed to parse stored AI settings:", err);
  }
  return DEFAULT_AI_SETTINGS;
}

/**
 * Menyimpan konfigurasi AI guru ke storage & menyiarkan event ke seluruh komponen
 */
export function saveStoredAiSettings(settings: AiGuruSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("thinksy_ai_settings_change", { detail: settings }));

    // Simpan ke API secara asinkron
    fetch("/api/guru/ai-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    }).catch(() => {});
  } catch (err) {
    console.error("Failed to save AI settings:", err);
  }
}

/**
 * Mengelola kuota token siswa per sesi kuis
 */
export function getQuizTokensRemaining(quizId: string, maxTokens: number = 5): number {
  if (typeof window === "undefined") return maxTokens;
  try {
    const key = `thinksy_quiz_tokens_${quizId}`;
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      const val = parseInt(stored, 10);
      return isNaN(val) ? maxTokens : Math.max(0, val);
    }
  } catch {}
  return maxTokens;
}

export function decrementQuizToken(quizId: string, maxTokens: number = 5): number {
  if (typeof window === "undefined") return maxTokens - 1;
  try {
    const key = `thinksy_quiz_tokens_${quizId}`;
    const current = getQuizTokensRemaining(quizId, maxTokens);
    const updated = Math.max(0, current - 1);
    localStorage.setItem(key, updated.toString());
    window.dispatchEvent(new CustomEvent("thinksy_quiz_token_decremented", { detail: { quizId, remaining: updated } }));
    return updated;
  } catch {
    return Math.max(0, maxTokens - 1);
  }
}

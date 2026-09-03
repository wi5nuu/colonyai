import { create } from "zustand";
import { persist } from "zustand/middleware";
import { en } from "./dict-en";
import { id } from "./dict-id";

type Language = "en" | "id";

interface TranslationStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const dictionaries = { en, id };

// Helper to access nested properties safely
const getNestedValue = (obj: any, path: string): string | undefined => {
  return path
    .split(".")
    .reduce((acc: any, part: string) => acc && acc[part], obj);
};

// Build a t() function bound to a specific language
const buildTranslator =
  (lang: Language) =>
  (key: string, params?: Record<string, string | number>): string => {
    const dict = dictionaries[lang];
    let value = getNestedValue(dict, key);
    
    // Fallback to English if key is missing in Indonesian
    if (value === undefined && lang !== "en") {
      value = getNestedValue(dictionaries.en, key);
    }

    if (value === undefined) return key;

    // Handle interpolation if params are provided
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = (value as string).replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
      });
    }

    return value;
  };

export const useTranslationStore = create<TranslationStore>()(
  persist(
    (set) => ({
      language: "en" as Language,
      t: buildTranslator("en"),
      setLanguage: (lang: Language) => {
        // Apply to <html> immediately so browser reacts (context menu, spell-check, etc.)
        if (typeof document !== "undefined") {
          const htmlLang = lang === "id" ? "id" : "en";
          document.documentElement.lang = htmlLang;
          document.cookie = `lang=${htmlLang};path=/;max-age=31536000`;
        }
        set({
          language: lang,
          // Rebuild t so every subscriber re-renders with the new language
          t: buildTranslator(lang),
        });
      },
    }),
    {
      name: "colony-language-storage",
      version: 1, // Increment this to clear stale cached state
      // Only persist 'language' — functions cannot be serialized
      partialize: (state) => ({ language: state.language }),
      // After rehydration from localStorage, rebuild t() and apply lang to <html>
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Validate language value is one of the allowed values
          const validLanguages: Language[] = ["en", "id"];
          if (!validLanguages.includes(state.language)) {
            state.language = "en";
          }
          state.t = buildTranslator(state.language);
          // Re-apply lang to <html> on page load / hydration
          if (typeof document !== "undefined") {
            const htmlLang = state.language === "id" ? "id" : "en";
            document.documentElement.lang = htmlLang;
            document.cookie = `lang=${htmlLang};path=/;max-age=31536000`;
          }
        }
      },
      skipHydration: true,
    },
  ),
);

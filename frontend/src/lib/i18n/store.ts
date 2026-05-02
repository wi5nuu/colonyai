import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { en } from './dict-en';
import { id } from './dict-id';

type Language = 'en' | 'id';

interface TranslationStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const dictionaries = { en, id };

// Helper to access nested properties safely
const getNestedValue = (obj: any, path: string): string | undefined => {
  return path.split('.').reduce((acc: any, part: string) => acc && acc[part], obj);
};

// Build a t() function bound to a specific language
const buildTranslator = (lang: Language) => (key: string): string => {
  const dict = dictionaries[lang];
  const value = getNestedValue(dict, key);
  // Fallback to English if key is missing in Indonesian
  if (value === undefined && lang !== 'en') {
    return getNestedValue(dictionaries.en, key) ?? key;
  }
  return value ?? key;
};

export const useTranslationStore = create<TranslationStore>()(
  persist(
    (set) => ({
      language: 'en' as Language,
      t: buildTranslator('en'),
      setLanguage: (lang: Language) =>
        set({
          language: lang,
          // Rebuild t so every subscriber re-renders with the new language
          t: buildTranslator(lang),
        }),
    }),
    {
      name: 'colony-language-storage',
      version: 1, // Increment this to clear stale cached state
      // Only persist 'language' — functions cannot be serialized
      partialize: (state) => ({ language: state.language }),
      // After rehydration from localStorage, rebuild t() from the saved language
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = buildTranslator(state.language);
        }
      },
    }
  )
);

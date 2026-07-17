"use client";

import { useTranslationStore } from "@/lib/i18n/store";


export function LanguageSwitcher() {
  // Subscribe to language explicitly so the component re-renders on change
  const language = useTranslationStore((state) => state.language);
  const setLanguage = useTranslationStore((state) => state.setLanguage);

  const isEnglish = language === "en";

  return (
    <div className="flex items-center gap-1.5 px-1">
      <button
        onClick={() => {
          setLanguage("en");
          document.documentElement.lang = "en";
          document.cookie = "lang=en;path=/;max-age=31536000";
        }}
        title="Switch to English"
        className={`px-1 py-1 rounded-none text-[9px] font-black uppercase tracking-widest transition-colors ${
          isEnglish
            ? "text-slate-900 dark:text-white"
            : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
        }`}
      >
        EN
      </button>
      <div className="w-[1px] h-3 bg-slate-300 dark:bg-slate-700" />
      <button
        onClick={() => {
          setLanguage("id");
          document.documentElement.lang = "id";
          document.cookie = "lang=id;path=/;max-age=31536000";
        }}
        title="Beralih ke Bahasa Indonesia"
        className={`px-1 py-1 rounded-none text-[9px] font-black uppercase tracking-widest transition-colors ${
          !isEnglish
            ? "text-slate-900 dark:text-white"
            : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
        }`}
      >
        ID
      </button>
    </div>
  );
}

"use client";

import { useTranslationStore } from "@/lib/i18n/store";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  // Subscribe to language explicitly so the component re-renders on change
  const language = useTranslationStore((state) => state.language);
  const setLanguage = useTranslationStore((state) => state.setLanguage);

  const isEnglish = language === "en";

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100/80 border border-slate-100 shadow-sm">
      <button
        onClick={() => {
          setLanguage("en");
          document.documentElement.lang = "en";
          document.cookie = "lang=en;path=/;max-age=31536000";
        }}
        title="Switch to English"
        className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all duration-200 ${
          isEnglish
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-400 hover:text-slate-700"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => {
          setLanguage("id");
          document.documentElement.lang = "id";
          document.cookie = "lang=id;path=/;max-age=31536000";
        }}
        title="Beralih ke Bahasa Indonesia"
        className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all duration-200 ${
          !isEnglish
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-400 hover:text-slate-700"
        }`}
      >
        ID
      </button>
    </div>
  );
}

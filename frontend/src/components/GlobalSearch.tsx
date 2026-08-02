"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, FlaskConical, Building2, Calendar, ClipboardCheck, CornerDownLeft, Sparkles } from "lucide-react";
import { useTranslationStore } from "@/lib/i18n/store";
import { useAuthStore } from "@/lib/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface SearchItem {
  id: string;
  type: "specimen" | "laboratory";
  titleEN: string;
  titleID: string;
  detailsEN: string;
  detailsID: string;
  statusEN: string;
  statusID: string;
  date: string;
}

interface SearchResponse {
  items: SearchItem[];
  total: number;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "specimen" | "laboratory">("all");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { language, t } = useTranslationStore();
  const accessToken = useAuthStore((state) => state.accessToken);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === "k") || e.key === "/") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const focusTimer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(focusTimer);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickSearch = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-trigger-search]")) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    document.addEventListener("click", handleClickSearch);
    return () => document.removeEventListener("click", handleClickSearch);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        params.set("limit", "10");

        // BUG-6 FIX: Send auth token — backend now requires authentication on search
        const headers: Record<string, string> = {};
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

        const res = await fetch(`${API_URL}/api/v1/search?${params.toString()}`, { headers });
        if (!res.ok) throw new Error("Search failed");

        const data: SearchResponse = await res.json();
        setItems(data.items);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const filteredItems = items.filter((item) => {
    const matchesTab = tab === "all" || item.type === tab;
    return matchesTab;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-24 px-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        onClick={() => setIsOpen(false)}
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-2xl rounded-xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="relative border-b border-slate-100 dark:border-slate-800 p-5 flex items-center">
          <Search className="w-5 h-5 text-[#0055ff] dark:text-[#00f2ff] mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("common.searchPlaceholder")}
            className="w-full bg-transparent outline-none text-slate-850 dark:text-white text-base font-medium placeholder-slate-400"
          />
          
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-650 transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-50 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20">
          {(["all", "specimen", "laboratory"] as const).map((tabType) => (
            <button
              key={tabType}
              onClick={() => setTab(tabType)}
              className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-widest transition-all rounded-md border ${
                tab === tabType
                  ? "bg-[#1a237e] dark:bg-[#00f2ff] text-white dark:text-slate-950 border-[#1a237e] dark:border-[#00f2ff]"
                  : "bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-[#1a237e] dark:hover:border-[#00f2ff]"
              }`}
            >
              {tabType === "all" ? t("common.allResults") : tabType}
            </button>
          ))}
        </div>

        <div className="max-h-[350px] overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 border-2 border-[#0055ff] dark:border-[#00f2ff] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Searching...
              </p>
            </div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:bg-[#0055ff]/5 dark:hover:bg-[#00f2ff]/5 hover:border-[#0055ff] dark:hover:border-[#00f2ff] transition-all group cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-[#0055ff] dark:group-hover:bg-[#00f2ff] group-hover:text-white transition-all">
                    {item.type === "specimen" ? (
                      <FlaskConical className="w-5 h-5" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-[#0055ff] dark:text-[#00f2ff] uppercase tracking-widest">
                        {item.id}
                      </span>
                      <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 uppercase">
                        {language === "en" ? item.statusEN : item.statusID}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-[#0055ff] dark:group-hover:text-[#00f2ff] transition-colors">
                      {language === "en" ? item.titleEN : item.titleID}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-relaxed font-semibold">
                      {language === "en" ? item.detailsEN : item.detailsID}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#00f2ff]" />
                    {item.date}
                  </span>
                  <span className="text-[9px] font-black text-slate-300 dark:text-slate-700 group-hover:text-[#0055ff] dark:group-hover:text-[#00f2ff] uppercase tracking-widest flex items-center gap-1 transition-colors">
                    View
                    <CornerDownLeft className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {t("common.noRecords")}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {t("common.noRecordsDesc")}
              </p>
            </div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 p-3 px-5 flex items-center justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span>ESC to close</span>
            <span>Tab to navigate</span>
          </div>
          <span className="text-[#0055ff] dark:text-[#00f2ff] flex items-center gap-1.5">
            <ClipboardCheck className="w-3.5 h-3.5" />
            ISO-17025 Certified Database
          </span>
        </div>

      </div>
    </div>
  );
}

"use client";

import React from "react";
import {
  ChevronRight,
  ExternalLink,
  FlaskConical,
  Search,
  Copy,
  BookOpen,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslationStore } from "@/lib/i18n/store";

interface DocumentationSidebarProps {
  showDocs: boolean;
  setShowDocs: (show: boolean) => void;
  directory: string;
  title: string;
  description: string;
  children: React.ReactNode;
  rawText?: string; // Content to be copied/searched
}

export function DocumentationSidebar({
  showDocs,
  setShowDocs,
  directory,
  title,
  description,
  children,
  rawText,
}: DocumentationSidebarProps) {
  const { t } = useTranslationStore();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  if (!showDocs) return null;

  const handleCopyDocs = () => {
    const text =
      rawText || `${title}\n${description}\n\nDocumentation content...`;
    navigator.clipboard.writeText(text);
    toast.success(t("overview.docsUiCopySuccess"), {
      description: t("overview.docsUiCopyDesc"),
      icon: "📋",
    });
  };

  return (
    <div className="w-full sm:w-80 lg:w-[350px] flex flex-col bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300 fixed right-0 top-14 sm:top-16 bottom-0 z-[60] sm:z-30 transition-colors duration-300">
      {/* Header Section */}
      <div className="px-2 py-2 sm:px-3 sm:py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-950 sticky top-0 z-10 transition-colors">
        <button
          onClick={() => setShowDocs(false)}
          className="p-1 sm:p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group flex-shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
        </button>
        <div className="flex flex-col">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">
            {t("overview.docsUiDocumentation")}
          </h3>
          <button
            onClick={() =>
              toast.info(t("overview.docsUiLoadingPortal"), { icon: "🌐" })
            }
            className="text-[8px] sm:text-[9px] text-primary hover:underline flex items-center gap-1 mt-0.5 font-black uppercase tracking-widest text-left"
          >
            {t("overview.docsUiFullView")} <ExternalLink className="w-2 h-2" />
          </button>
        </div>
      </div>

      {/* Docs Body */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3 sm:p-4 space-y-4 bg-white dark:bg-slate-900 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
              <FlaskConical className="w-3 h-3 text-white" />
            </div>
            <span className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white tracking-tight uppercase">
              {t("overview.docsUiColonyAIDocs")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-1 rounded transition-all ${isSearchOpen ? "bg-primary text-white" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400"}`}
            >
              <Search className="w-3 h-3 cursor-pointer" />
            </button>
            <button
              onClick={() =>
                toast.info(t("overview.docsUiAccessingIndex"), { icon: "📚" })
              }
              className="w-6 h-6 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <BookOpen className="w-3 h-3 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input
                type="text"
                placeholder={t("overview.docsUiSearchPlaceholder")}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-8 py-2 text-[10px] font-bold text-black dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-2.5 h-2.5 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 p-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 w-fit shadow-sm">
          <button
            onClick={() =>
              toast.info(t("overview.docsUiReturningRoot"), { icon: "📁" })
            }
            className="flex items-center gap-1 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          >
            {t("overview.docsUiPage")} <ChevronRight className="w-2 h-2" />
          </button>
          <span className="text-[8px] sm:text-[9px] font-black text-slate-900 dark:text-white px-1.5 uppercase">
            {t("overview.systemOverview")}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-black text-slate-400 uppercase">
            <span>{t("overview.docsUiDir")}</span>
            <ChevronRight className="w-2 h-2" />
            <span className="text-slate-900 dark:text-slate-100 tracking-tighter truncate max-w-[100px]">
              {directory}
            </span>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleCopyDocs}
              className="flex items-center gap-1 px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[8px] sm:text-[9px] font-black text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm uppercase tracking-widest"
            >
              <Copy className="w-2 h-2" /> {t("overview.docsUiCopy")}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {isSearchOpen && searchQuery && (
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 space-y-2 animate-in fade-in zoom-in-95 duration-200 shadow-sm">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                <Search className="w-3 h-3" />{" "}
                {t("overview.docsUiSearchResults")}: "{searchQuery}"
              </h4>
              <div className="space-y-2">
                {rawText?.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                  <div className="p-2.5 bg-white dark:bg-slate-900 border border-primary/20 dark:border-primary/40 rounded-md shadow-sm border-l-4 border-l-primary">
                    <p className="text-[9px] text-slate-700 dark:text-slate-200 font-bold leading-relaxed">
                      "
                      {rawText.substring(
                        Math.max(
                          0,
                          rawText
                            .toLowerCase()
                            .indexOf(searchQuery.toLowerCase()) - 30,
                        ),
                        Math.min(
                          rawText.length,
                          rawText
                            .toLowerCase()
                            .indexOf(searchQuery.toLowerCase()) + 100,
                        ),
                      )}
                      ..."
                    </p>
                    <p className="text-[8px] text-primary font-black uppercase mt-2">
                      {t("overview.docsUiFoundInProtocol")}
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-md">
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold italic">
                      {t("overview.docsUiNoMatch")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Title Section */}
          <div className="pb-2">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-1 uppercase">
              {title}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed font-bold italic">
              {description}
            </p>
          </div>

          {/* Main Content Rendered Here */}
          <div className="prose-tighter">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function DocumentationToggle({
  showDocs,
  setShowDocs,
  text,
}: {
  showDocs: boolean;
  setShowDocs: (s: boolean) => void;
  text?: string;
}) {
  if (showDocs) return null;
  return (
    <button
      onClick={() => setShowDocs(true)}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95 group"
    >
      <div className="w-5 h-5 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
        <BookOpen className="w-3 h-3 text-primary" />
      </div>
      {text}
    </button>
  );
}

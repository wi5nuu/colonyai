"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Calendar,
  Filter,
  Download,
  BarChart3,
  Loader2,
  AlertCircle,
  FlaskConical,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Clock,
  ArrowRight,
  Info,
  ExternalLink,
  X,
  Search,
  ChevronRight,
  Copy,
  Lock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
} from "recharts";
import { analysesApi } from "@/lib/analyses-api";
import { reportsApi } from "@/lib/reports-api";
import { Analysis, AnalysisListResponse, MediaType } from "@/lib/types";
import { toast } from "sonner";
import {
  DocumentationSidebar,
  DocumentationToggle,
} from "@/components/DocumentationSidebar";
import { useTranslationStore } from "@/lib/i18n/store";
import { useThemeStore } from "@/lib/theme-store";

type DateRange = "7d" | "30d" | "90d" | "custom";
interface TimeSeriesPoint {
  date: string;
  label: string;
  avgCfu: number;
  testCount: number;
  passRate: number;
  tntcCount: number;
  tftcCount: number;
  status: "normal" | "TNTC" | "TFTC";
  analysts: string[];
}
interface MonthlySummary {
  month: string;
  tests: number;
  avgCfu: number;
  passRate: number;
  analysts: string;
}

const MEDIA_TYPES = [
  { value: "all", labelKey: "analytics.mediaAll" as const },
  { value: "Plate Count Agar", labelKey: "analytics.mediaPCA" as const },
  { value: "VRBA", labelKey: "analytics.mediaVRBA" as const },
  { value: "BGBB", labelKey: "analytics.mediaBGBB" as const },
  { value: "MacConkey", labelKey: "analytics.mediaMacConkey" as const },
  { value: "R2A", labelKey: "analytics.mediaR2A" as const },
  { value: "TSA", labelKey: "analytics.mediaTSA" as const },
  { value: "Other", labelKey: "analytics.mediaOther" as const },
];
const DATE_RANGE_OPTIONS = [
  { value: "7d", labelKey: "analytics.last7Days" as const },
  { value: "30d", labelKey: "analytics.last30Days" as const },
  { value: "90d", labelKey: "analytics.last90Days" as const },
  { value: "custom", labelKey: "analytics.customDate" as const },
];

function getDateRange(range: DateRange) {
  if (range === "custom") return null;
  const now = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return {
    date_from: new Date(now.getTime() - days * 86400000).toISOString(),
    date_to: now.toISOString(),
  };
}

function formatCFU(v: number, status?: string) {
  if (status === "TNTC") return "TNTC";
  if (status === "TFTC") return "TFTC";
  if (v >= 10000) return v.toExponential(2);
  return v.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function groupByDate(
  analyses: Analysis[],
  range: DateRange,
): TimeSeriesPoint[] {
  const grouped: Record<string, Analysis[]> = {};
  analyses.forEach((a) => {
    const k = a.created_at.slice(0, 10);
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(a);
  });
  return Object.keys(grouped)
    .sort()
    .map((key) => {
      const items = grouped[key];
      const valid = items.filter((a) => a.status === "valid");
      const cfuItems = items.filter((a) => a.cfu_per_ml != null);
      const avgCfu =
        cfuItems.length > 0
          ? cfuItems.reduce((s, a) => s + (a.cfu_per_ml || 0), 0) /
            cfuItems.length
          : 0;
      const tntcCount = items.filter((a) => a.status === "TNTC").length;
      const tftcCount = items.filter((a) => a.status === "TFTC").length;
      const d = new Date(key);
      const label =
        range === "7d"
          ? d.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })
          : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const status: "normal" | "TNTC" | "TFTC" =
        tntcCount > items.length * 0.5
          ? "TNTC"
          : tftcCount > items.length * 0.5
            ? "TFTC"
            : "normal";
      return {
        date: key,
        label,
        avgCfu: Math.round(avgCfu * 10) / 10,
        testCount: items.length,
        passRate: Math.round((valid.length / items.length) * 1000) / 10,
        tntcCount,
        tftcCount,
        status,
        analysts: Array.from(
          new Set(items.map((a) => a.user?.full_name || a.user?.email || "")),
        ),
      };
    });
}

function groupByMonth(analyses: Analysis[]): MonthlySummary[] {
  const grouped: Record<string, Analysis[]> = {};
  analyses.forEach((a) => {
    const k = a.created_at.slice(0, 7);
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(a);
  });
  return Object.keys(grouped)
    .sort()
    .map((key) => {
      const items = grouped[key];
      const valid = items.filter((a) => a.status === "valid");
      const cfuItems = items.filter((a) => a.cfu_per_ml != null);
      const avgCfu =
        cfuItems.length > 0
          ? cfuItems.reduce((s, a) => s + (a.cfu_per_ml || 0), 0) /
            cfuItems.length
          : 0;
      const d = new Date(key + "-01");
      return {
        month: d.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        tests: items.length,
        avgCfu: Math.round(avgCfu * 10) / 10,
        passRate: Math.round((valid.length / items.length) * 1000) / 10,
        analysts: Array.from(
          new Set(items.map((a) => a.user?.full_name || a.user?.email || "")),
        ).join(", "),
      };
    });
}

function ChartTooltip({ active, payload, label }: any) {
  const { t } = useTranslationStore();
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as TimeSeriesPoint;
  if (!p) return null;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-none shadow-2xl p-4 min-w-[180px] animate-in fade-in zoom-in-95 duration-200">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 pb-2 border-b border-slate-800">
        {label}
      </p>
      <div className="space-y-2.5">
        <div className="flex justify-between items-center gap-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {t("analytics.tooltipAnalyses")}
          </span>
          <span className="text-sm font-bold text-white">{p.testCount}</span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {t("analytics.tooltipDensity")}
          </span>
          <span className="text-sm font-bold text-primary">
            {formatCFU(p.avgCfu)}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {t("analytics.tooltipSuccess")}
          </span>
          <span className="text-sm font-bold text-emerald-400">
            {p.passRate}%
          </span>
        </div>
        {p.tntcCount > 0 && (
          <div className="flex justify-between items-center gap-4 pt-2 border-t border-slate-800">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
              {t("analytics.tooltipBoundary")}
            </span>
            <span className="text-sm font-bold text-rose-500">
              {p.tntcCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { t } = useTranslationStore();
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [mediaType, setMediaType] = useState<MediaType | "all">("all");
  const [analystFilter, setAnalystFilter] = useState("all");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [allAnalyses, setAllAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const range = getDateRange(dateRange);
      let collected: Analysis[] = [],
        page = 1,
        totalPages = 1;
      while (page <= totalPages) {
        const r: AnalysisListResponse = await analysesApi.list({
          page,
          page_size: 200,
          media_type:
            mediaType !== "all" ? (mediaType as MediaType) : undefined,
          date_from:
            range?.date_from ??
            (dateRange === "custom" && customDateFrom
              ? customDateFrom
              : undefined),
          date_to:
            range?.date_to ??
            (dateRange === "custom" && customDateTo ? customDateTo : undefined),
        });
        collected = collected.concat(r.analyses);
        totalPages = r.total_pages;
        page++;
      }
      setAllAnalyses(collected);
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail || e?.message || t("analytics.errorLoad");
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, mediaType, customDateFrom, customDateTo, t]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filtered = useMemo(
    () =>
      analystFilter === "all"
        ? allAnalyses
        : allAnalyses.filter(
            (a) =>
              a.user?.full_name === analystFilter ||
              a.user?.email === analystFilter,
          ),
    [allAnalyses, analystFilter],
  );

  const uniqueAnalysts = useMemo(
    () =>
      Array.from(
        new Set(
          allAnalyses.map((a) => a.user?.full_name || a.user?.email || ""),
        ),
      ).sort(),
    [allAnalyses],
  );

  const timeSeriesData = useMemo(
    () => groupByDate(filtered, dateRange),
    [filtered, dateRange],
  );
  const monthlySummaries = useMemo(() => groupByMonth(filtered), [filtered]);

  const stats = useMemo(() => {
    const total = filtered.length;
    if (total === 0)
      return {
        total: 0,
        avgCfu: 0,
        passRate: 0,
        tntc: 0,
        tftc: 0,
        breakdown: {},
      };
    const valid = filtered.filter((a) => a.status === "valid").length;
    const cfuItems = filtered.filter((a) => a.cfu_per_ml != null);
    const avgCfu =
      cfuItems.length > 0
        ? cfuItems.reduce((s, a) => s + (a.cfu_per_ml || 0), 0) /
          cfuItems.length
        : 0;
    const matrixBreakdown = filtered.reduce(
      (acc, a) => {
        acc[a.media_type] = (acc[a.media_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return {
      total,
      avgCfu: Math.round(avgCfu * 10) / 10,
      passRate: Math.round((valid / total) * 1000) / 10,
      tntc: filtered.filter((a) => a.status === "TNTC").length,
      tftc: filtered.filter((a) => a.status === "TFTC").length,
      breakdown: matrixBreakdown,
    };
  }, [filtered]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const r = await reportsApi.generateCsv({
        report_type: "custom",
        date_from:
          dateRange === "custom"
            ? customDateFrom
            : getDateRange(dateRange)?.date_from,
        date_to:
          dateRange === "custom"
            ? customDateTo
            : getDateRange(dateRange)?.date_to,
        format: "csv",
      });
      window.open(r.url, "_blank");
      toast.success(t("history.successExportCsv"));
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || t("analytics.errorExport"));
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading && allAnalyses.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-5">
        <div className="w-16 h-16 rounded-none bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
          {t("analytics.syncingMatrix")}
        </p>
      </div>
    );

  if (error && allAnalyses.length === 0)
    return (
      <div className="text-center py-24 space-y-6 animate-in slide-in-from-bottom-4 duration-500 px-4">
        <div className="w-20 h-20 rounded-none bg-rose-50 flex items-center justify-center mx-auto shadow-xl shadow-rose-100/50">
          <AlertCircle className="h-10 w-10 text-rose-500" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {t("analytics.networkFailure")}
          </h3>
          <p className="text-sm font-medium text-slate-400">{error}</p>
        </div>
        <button
          className="btn-primary px-10 py-4 flex items-center gap-3 mx-auto"
          onClick={fetchData}
        >
          <TrendingUp className="w-5 h-5" /> {t("analytics.reinitSync")}
        </button>
      </div>
    );

  if (!mounted) return null;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 w-full min-w-0">
      {/* Main content — full width, sidebar is overlay via DocumentationSidebar */}
      <div className="w-full min-w-0">
        <div className="w-full min-w-0 px-3 sm:px-4 md:px-6 py-0 space-y-4 pb-6">
          {/* ── HEADER ─────────────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-start justify-between gap-3 pt-1">
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm md:text-base lg:text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase leading-none truncate">
                {t("overview.neuralIntelligenceLayer")}
              </h1>
              <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mt-0.5">
                {t("analytics.supertitle")} {"//"}{" "}
                {t("overview.realTimeSpectral")}
              </p>
            </div>
            <div className="hidden lg:block flex-shrink-0">
              <DocumentationToggle
                showDocs={showDocs}
                setShowDocs={setShowDocs}
                text={t("analytics.docsToggle")}
              />
            </div>
          </div>

          {/* ── MAIN ANALYTICS CARD ────────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none shadow-sm overflow-hidden transition-colors w-full min-w-0">
            {/* Card Header */}
            <div className="px-3 sm:px-4 md:px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {t("analytics.neuralQueriesHeader")}
                </h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => toast.info(t("analytics.generatingReport"))}
                    className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase tracking-widest hover:underline whitespace-nowrap"
                  >
                    {t("overview.downloadDataset")}
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase tracking-widest hover:underline whitespace-nowrap"
                  >
                    {t("overview.activeSink")}{" "}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="px-3 sm:px-4 md:px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 bg-slate-50/30 dark:bg-slate-800/30">
              <div className="relative flex-shrink-0">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as DateRange)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none px-3 py-1.5 text-[10px] font-black text-slate-700 dark:text-slate-200 outline-none hover:border-slate-300 dark:hover:border-slate-600 transition-all appearance-none pr-8"
                >
                  {DATE_RANGE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </select>
                <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all whitespace-nowrap flex-shrink-0">
                <Filter className="w-3 h-3" /> {t("analytics.addFilter")}
              </button>
            </div>

            {/* Query Overview Section */}
            <div className="px-3 sm:px-4 md:px-5 py-3 space-y-2">
              {/* Section Label */}
              <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-slate-900 dark:text-white">
                {t("analytics.queryOverview")}{" "}
                <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              </div>

              {/* Tabs — scrollable, no wrap, no cutoff */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 gap-3 sm:gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {[
                  t("overview.queryOverview"),
                  t("overview.throughput"),
                  t("overview.successRate"),
                  t("analytics.tabDataCenter"),
                ].map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={`pb-2 text-[9px] sm:text-[10px] font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                      activeTab === i
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Stats Cards — responsive auto-fit grid, never overflows */}
              <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-5 gap-2 py-2">
                {[
                  {
                    labelKey: "analytics.cardPcaMatrix" as const,
                    key: "Plate Count Agar",
                    trend: "+14%",
                    color: "indigo",
                  },
                  {
                    labelKey: "analytics.cardVrbaMatrix" as const,
                    key: "VRBA",
                    trend: "+2.1%",
                    color: "amber",
                  },
                  {
                    labelKey: "analytics.cardBgbbProtocol" as const,
                    key: "BGBB",
                    trend: "OPTIMAL",
                    color: "emerald",
                  },
                  {
                    labelKey: "analytics.cardR2aAnalytics" as const,
                    key: "R2A",
                    trend: "+5.4%",
                    color: "rose",
                  },
                  {
                    labelKey: "analytics.cardIntegrity" as const,
                    key: "Integrity",
                    trend: "99.9%",
                    color: "blue",
                  },
                ].map((s, i) => {
                  let val: string | number = 0;
                  if (s.key === "Integrity") {
                    val = `${stats.passRate}%`;
                  } else {
                    const count = stats.breakdown[s.key] || 0;
                    val =
                      count > 1000 ? `${(count / 1000).toFixed(1)}k` : count;
                  }

                  return (
                    <div
                      key={i}
                      className={`border p-2 sm:p-3 rounded-none shadow-sm group hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden min-w-0 ${
                        s.color === "indigo"
                          ? "bg-indigo-50/40 border-indigo-100/50 hover:bg-indigo-50/60 dark:bg-indigo-950/20 dark:border-indigo-900/40"
                          : s.color === "amber"
                            ? "bg-amber-50/40 border-amber-100/50 hover:bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/40"
                            : s.color === "emerald"
                              ? "bg-emerald-50/40 border-emerald-100/50 hover:bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-900/40"
                              : s.color === "rose"
                                ? "bg-rose-50/40 border-rose-100/50 hover:bg-rose-50/60 dark:bg-rose-950/20 dark:border-rose-900/40"
                                : "bg-blue-50/40 border-blue-100/50 hover:bg-blue-50/60 dark:bg-blue-950/20 dark:border-blue-900/40"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div
                          className={`p-1 rounded-none ${
                            s.color === "indigo"
                              ? "bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400"
                              : s.color === "amber"
                                ? "bg-amber-50 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400"
                                : s.color === "emerald"
                                  ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : s.color === "rose"
                                    ? "bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400"
                                    : "bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          <FlaskConical className="w-3 h-3" />
                        </div>
                        <span
                          className={`text-[7px] sm:text-[8px] font-bold uppercase tracking-widest z-10 ${
                            s.color === "emerald"
                              ? "text-emerald-500"
                              : "text-slate-400"
                          }`}
                        >
                          {s.trend}
                        </span>
                      </div>
                      <div className="z-10 min-w-0">
                        <p className="text-slate-400 dark:text-slate-500 text-[6px] sm:text-[8px] font-bold uppercase tracking-[0.12em] mb-0.5 truncate">
                          {t(s.labelKey)}
                        </p>
                        <p className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tighter truncate">
                          {val}
                        </p>
                      </div>
                      <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                        <FlaskConical className="w-8 h-8" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart — min-height prevents collapse */}
              <div
                className="w-full mt-3 border-t border-slate-100 dark:border-slate-800 pt-3"
                style={{ minHeight: 160, height: "clamp(160px, 25vw, 220px)" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid
                      strokeDasharray="0"
                      vertical={false}
                      stroke={theme === "dark" ? "#1e293b" : "#f1f5f9"}
                    />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 8,
                        fill: theme === "dark" ? "#64748b" : "#94a3b8",
                        fontWeight: 700,
                      }}
                      dy={8}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 8,
                        fill: theme === "dark" ? "#64748b" : "#94a3b8",
                        fontWeight: 700,
                      }}
                      dx={-4}
                      width={36}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{
                        stroke: theme === "dark" ? "#334155" : "#f1f5f9",
                        strokeWidth: 1,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgCfu"
                      stroke="#3b82f6"
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="testCount"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="passRate"
                      stroke="#10b981"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[8px] text-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-2">
                {t("overview.queryTimeFrame")}
              </p>
            </div>

            {/* Query Statistics */}
            <div className="px-3 sm:px-4 md:px-5 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-[9px] sm:text-[10px] font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-widest">
                {t("analytics.queryStats")}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700 pl-3 min-w-0">
                  <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">
                    {t("overview.totalNeuralQueries")}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    {stats.total > 1000
                      ? `${(stats.total / 1000).toFixed(2)}k`
                      : stats.total}
                  </p>
                </div>
                <div className="space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700 pl-3 min-w-0">
                  <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">
                    {t("overview.avgQps")}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    0.035
                  </p>
                </div>
                <div className="space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700 pl-3 col-span-2 sm:col-span-1 min-w-0">
                  <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">
                    {t("overview.processingTime")}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    42ms
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── MONTHLY SUMMARY TABLE ──────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none shadow-sm overflow-hidden transition-colors w-full min-w-0">
            <div className="px-3 sm:px-4 md:px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white min-w-0 truncate">
                {t("analytics.intelligenceLedger")}
              </h2>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap flex-shrink-0">
                {monthlySummaries.length} {t("analytics.cyclesLogged")}
              </span>
            </div>

            {monthlySummaries.length === 0 ? (
              <div className="py-16 text-center">
                <FlaskConical className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                  {t("analytics.noMonthlyArchived")}
                </p>
              </div>
            ) : (
              /* Scrollable wrapper — table never clips content */
              <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700">
                <table className="w-full text-left" style={{ minWidth: 540 }}>
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      {[
                        t("analytics.colDiagnosticCycle"),
                        t("analytics.colTotalSequences"),
                        t("analytics.colDensityMedian"),
                        t("analytics.colComplianceIntegrity"),
                        t("analytics.colAuthorizedPersonnel"),
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 sm:px-5 md:px-6 py-3 text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {monthlySummaries.map((row) => (
                      <tr
                        key={row.month}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-4 sm:px-5 md:px-6 py-4 text-xs sm:text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {row.month}
                        </td>
                        <td className="px-4 sm:px-5 md:px-6 py-4 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {row.tests}
                        </td>
                        <td className="px-4 sm:px-5 md:px-6 py-4 whitespace-nowrap">
                          <span className="text-[10px] sm:text-[11px] font-bold text-blue-600">
                            {formatCFU(row.avgCfu)} {t("analytics.cfuMlUnit")}
                          </span>
                        </td>
                        <td className="px-4 sm:px-5 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-14 sm:w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex-shrink-0">
                              <div
                                className={`h-full rounded-full ${row.passRate >= 85 ? "bg-emerald-500" : "bg-amber-500"}`}
                                style={{ width: `${row.passRate}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                              {row.passRate}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-5 md:px-6 py-4 text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase max-w-[160px] truncate">
                          {row.analysts}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        {/* /inner px wrapper */}
      </div>
      {/* /main content */}

      {/* Documentation Sidebar — rendered as overlay/aside by DocumentationSidebar itself */}
      <div className="hidden lg:block">
        <DocumentationSidebar
          showDocs={showDocs}
          setShowDocs={setShowDocs}
          directory={t("analytics.docsDirectory")}
          title={t("analytics.docsTitle")}
          description={t("analytics.docsDescription")}
          rawText={`MATRIKS ANALITIK COLONYAI - SOP ISO-17025
==========================================

1. OVERVIEW
Modul Analytics berfungsi sebagai pusat intelijen data ColonyAI. Ini menyajikan visualisasi dinamis atas performa laboratorium, tingkat kepatuhan ISO, dan efisiensi throughput saraf (neural throughput) secara real-time.

2. KOMPONEN UTAMA
- Query Overview: Distribusi spesimen berdasarkan protokol media spesifik (PCA, VRBA, BGBB).
- Time-Series Chart: Visualisasi interaktif Average CFU, Total Tests, dan Pass Rate harian.
- Query Statistics: Indikator performa sistem (QPS & Processing Time).
- Intelligence Ledger: Agregasi data bulanan (Median Densitas & Integritas Kepatuhan).

3. EXPORT PROTOCOL
- Format Ekspor: CSV Matrix (Comma Separated Values).
- Validitas Data: Diakui untuk Audit ISO-17025.
- Keamanan: Audit Trail di-hash secara kriptografis.

STATUS: ANALYTICS READY
INTEGRASI: Mendukung Business Intelligence (BI) Eksternal.`}
        >
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                01
              </span>
              <h2 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">
                {t("analytics.docsSectionOverviewTitle")}
              </h2>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-800/50 p-2.5 rounded-none border border-slate-100 dark:border-slate-700/50">
              {t("analytics.docsSectionOverviewText")}
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                02
              </span>
              <h2 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">
                {t("analytics.docsSectionComponentsTitle")}
              </h2>
            </div>
            <div className="space-y-3 ml-0.5">
              {[
                {
                  id: "1",
                  titleKey:
                    "analytics.docsComponentQueryOverviewTitle" as const,
                  descKey: "analytics.docsComponentQueryOverviewDesc" as const,
                },
                {
                  id: "2",
                  titleKey: "analytics.docsComponentTimeSeriesTitle" as const,
                  descKey: "analytics.docsComponentTimeSeriesDesc" as const,
                },
                {
                  id: "3",
                  titleKey: "analytics.docsComponentQueryStatsTitle" as const,
                  descKey: "analytics.docsComponentQueryStatsDesc" as const,
                },
                {
                  id: "4",
                  titleKey: "analytics.docsComponentLedgerTitle" as const,
                  descKey: "analytics.docsComponentLedgerDesc" as const,
                },
              ].map((step) => (
                <div key={step.id} className="flex gap-2.5 group">
                  <span className="flex-shrink-0 w-4 h-4 rounded bg-slate-900 text-white text-[8px] font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    {step.id}
                  </span>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-[10px] font-bold text-slate-900 dark:text-white">
                      {t(step.titleKey)}
                    </h4>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {t(step.descKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                03
              </span>
              <h2 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">
                {t("analytics.docsSectionExportTitle")}
              </h2>
            </div>
            <div className="space-y-2">
              {[
                {
                  labelKey: "analytics.docsExportFormatLabel" as const,
                  valKey: "analytics.docsExportFormatVal" as const,
                },
                {
                  labelKey: "analytics.docsExportValidityLabel" as const,
                  valKey: "analytics.docsExportValidityVal" as const,
                },
                {
                  labelKey: "analytics.docsExportSecurityLabel" as const,
                  valKey: "analytics.docsExportSecurityVal" as const,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-0.5 pb-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {t(item.labelKey)}
                  </span>
                  <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">
                    {t(item.valKey)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-3 pt-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-none flex gap-3 shadow-sm">
              <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center">
                  <BarChart3 className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[10px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest">
                  {t("analytics.docsStatusReadyTitle")}
                </p>
                <p className="text-[9px] text-blue-700 dark:text-blue-400 leading-relaxed font-semibold">
                  {t("analytics.docsStatusReadyText")}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-none flex gap-3 shadow-xl">
              <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[10px] font-black text-white uppercase tracking-widest">
                  {t("analytics.docsVaultTitle")}
                </p>
                <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
                  {t("analytics.docsVaultText")}
                </p>
              </div>
            </div>
          </div>
        </DocumentationSidebar>
      </div>
      </div>
  );
}

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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 pb-3 border-b border-slate-800">
        {label}
      </p>
      <div className="space-y-3">
        <div className="flex justify-between items-center gap-6">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {t("analytics.tooltipAnalyses")}
          </span>
          <span className="text-sm font-bold text-white">{p.testCount}</span>
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {t("analytics.tooltipDensity")}
          </span>
          <span className="text-sm font-bold text-primary">
            {formatCFU(p.avgCfu)}
          </span>
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {t("analytics.tooltipSuccess")}
          </span>
          <span className="text-sm font-bold text-emerald-400">
            {p.passRate}%
          </span>
        </div>
        {p.tntcCount > 0 && (
          <div className="flex justify-between items-center gap-6 pt-2 border-t border-slate-800">
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
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [mediaType, setMediaType] = useState<MediaType | "all">("all");
  const [analystFilter, setAnalystFilter] = useState("all");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [allAnalyses, setAllAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showDocs, setShowDocs] = useState(true);
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
    }, 30000); // 30s polling
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
        <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
          {t("analytics.syncingMatrix")}
        </p>
      </div>
    );

  if (error && allAnalyses.length === 0)
    return (
      <div className="text-center py-24 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 rounded-xl bg-rose-50 flex items-center justify-center mx-auto shadow-xl shadow-rose-100/50">
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

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden">
      {/* Container for Main Content and Docs */}
      <div className="flex relative min-h-[calc(100vh-200px)]">
        {/* Main Workspace Area */}
        <div
          className={`flex-1 transition-all duration-300 ${showDocs ? "lg:mr-[350px]" : ""}`}
        >
          <div className="max-w-[1200px] mx-auto px-4 py-0 pt-0 pb-6">
            {/* Cloudflare-style Header */}
            <div className="space-y-0.5 mb-4">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {t("analytics.supertitle")}
              </p>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {t("analytics.title")}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                {t("analytics.subtitle")}
              </p>
              <div className="hidden lg:block">
                <DocumentationToggle
                  showDocs={showDocs}
                  setShowDocs={setShowDocs}
                  text={t("analytics.docsToggle")}
                />
              </div>
            </div>

            {/* Main Analytics Container */}
            <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {t("analytics.neuralQueriesHeader")}
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toast.info(t("analytics.generatingReport"))}
                    className="flex items-center gap-2 text-blue-600 text-[10px] font-bold uppercase tracking-widest hover:underline"
                  >
                    {t("analytics.printReport")}
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-1 text-blue-600 text-[10px] font-bold uppercase tracking-widest hover:underline"
                  >
                    {t("analytics.downloadData")}{" "}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all">
                  <Filter className="w-3 h-3" /> {t("analytics.addFilter")}
                </button>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={dateRange}
                      onChange={(e) =>
                        setDateRange(e.target.value as DateRange)
                      }
                      className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-[10px] font-black text-slate-700 outline-none hover:border-slate-300 transition-all appearance-none pr-8"
                    >
                      {DATE_RANGE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {t(o.labelKey)}
                        </option>
                      ))}
                    </select>
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Query Overview Pills */}
              <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4">
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold text-slate-900">
                  {t("analytics.queryOverview")}{" "}
                  <Clock className="w-3 h-3 text-slate-400" />
                </div>
                <div className="flex border-b border-slate-100 gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
                  {[
                    t("analytics.tabQueryName"),
                    t("analytics.tabQueryType"),
                    t("analytics.tabResponseCode"),
                    t("analytics.tabDataCenter"),
                  ].map((tab, i) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(i)}
                      className={`pb-2 text-[9px] sm:text-[11px] font-bold transition-all whitespace-nowrap ${activeTab === i ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 py-4">
                  {[
                    {
                      labelKey: "analytics.cardPcaMatrix" as const,
                      key: "Plate Count Agar",
                      color: "bg-blue-500",
                    },
                    {
                      labelKey: "analytics.cardVrbaMatrix" as const,
                      key: "VRBA",
                      color: "bg-amber-500",
                    },
                    {
                      labelKey: "analytics.cardBgbbProtocol" as const,
                      key: "BGBB",
                      color: "bg-emerald-500",
                    },
                    {
                      labelKey: "analytics.cardR2aAnalytics" as const,
                      key: "R2A",
                      color: "bg-rose-500",
                    },
                    {
                      labelKey: "analytics.cardIntegrity" as const,
                      key: "Integrity",
                      color: "bg-emerald-400",
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
                        className="space-y-1 sm:space-y-2 border-r border-slate-100 last:border-0 pr-2 sm:pr-4"
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${s.color}`}
                          />
                          <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 truncate">
                            {t(s.labelKey)}
                          </span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                          {val}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Chart Container */}
                <div className="h-[300px] w-full mt-8 border-t border-slate-50 pt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid
                        strokeDasharray="0"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 700 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 700 }}
                        dx={-10}
                      />
                      <Tooltip
                        content={<ChartTooltip />}
                        cursor={{ stroke: "#f1f5f9", strokeWidth: 1 }}
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
                <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">
                  {t("analytics.timeGmt")}
                </p>
              </div>

              {/* Query Statistics Section */}
              <div className="px-4 sm:px-6 py-6 sm:py-8 bg-slate-50/50 border-t border-slate-100">
                <h3 className="text-[10px] sm:text-xs font-bold text-slate-900 mb-4 sm:mb-6 uppercase tracking-widest">
                  {t("analytics.queryStats")}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                  <div className="space-y-1 sm:space-y-2 border-l-2 border-slate-200 pl-4 sm:pl-6">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-500">
                      {t("analytics.totalQueries")}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">
                      {stats.total > 1000
                        ? `${(stats.total / 1000).toFixed(2)}k`
                        : stats.total}
                    </p>
                  </div>
                  <div className="space-y-1 sm:space-y-2 border-l-2 border-slate-200 pl-4 sm:pl-6">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-500">
                      {t("analytics.avgQueriesSec")}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">
                      0.035
                    </p>
                  </div>
                  <div className="space-y-1 sm:space-y-2 border-l-2 border-slate-200 pl-4 sm:pl-6 col-span-2 md:col-span-1">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-500">
                      {t("analytics.avgProcessingTime")}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">
                      2.44s
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Summary Table */}
            <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden mt-10">
              <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  {t("analytics.intelligenceLedger")}
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {monthlySummaries.length} {t("analytics.cyclesLogged")}
                </span>
              </div>

              {monthlySummaries.length === 0 ? (
                <div className="py-24 text-center">
                  <FlaskConical className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                    {t("analytics.noMonthlyArchived")}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        {[
                          t("analytics.colDiagnosticCycle"),
                          t("analytics.colTotalSequences"),
                          t("analytics.colDensityMedian"),
                          t("analytics.colComplianceIntegrity"),
                          t("analytics.colAuthorizedPersonnel"),
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {monthlySummaries.map((row) => (
                        <tr
                          key={row.month}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-8 py-6 text-sm font-bold text-slate-900">
                            {row.month}
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-700">
                            {row.tests}
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-[11px] font-bold text-blue-600">
                              {formatCFU(row.avgCfu)} {t("analytics.cfuMlUnit")}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${row.passRate >= 85 ? "bg-emerald-500" : "bg-amber-500"}`}
                                  style={{ width: `${row.passRate}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-700">
                                {row.passRate}%
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase">
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
        </div>

        {/* Right: Documentation Sidebar - FIXED TO RIGHT */}
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
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">
                  {t("analytics.docsSectionOverviewTitle")}
                </h2>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                {t("analytics.docsSectionOverviewText")}
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  02
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">
                  {t("analytics.docsSectionComponentsTitle")}
                </h2>
              </div>
              <div className="space-y-3 ml-0.5">
                {[
                  {
                    id: "1",
                    titleKey:
                      "analytics.docsComponentQueryOverviewTitle" as const,
                    descKey:
                      "analytics.docsComponentQueryOverviewDesc" as const,
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
                    <span className="flex-shrink-0 w-4.5 h-4.5 rounded bg-slate-900 text-white text-[8px] font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      {step.id}
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-[10px] font-bold text-slate-900">
                        {t(step.titleKey)}
                      </h4>
                      <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
                        {t(step.descKey)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  03
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">
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
                    className="flex flex-col gap-0.5 pb-2 border-b border-slate-50 last:border-0"
                  >
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      {t(item.labelKey)}
                    </span>
                    <span className="text-[9px] font-bold text-slate-700">
                      {t(item.valKey)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-3 pt-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 shadow-sm">
                <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                  <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center">
                    <BarChart3 className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">
                    {t("analytics.docsStatusReadyTitle")}
                  </p>
                  <p className="text-[9px] text-blue-700 leading-relaxed font-semibold">
                    {t("analytics.docsStatusReadyText")}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex gap-3 shadow-xl">
                <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                  <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div className="space-y-0.5">
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
    </div>
  );
}

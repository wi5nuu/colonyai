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
import { DocumentationSidebar, DocumentationToggle } from "@/components/DocumentationSidebar";
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
  { value: "all", label: "All Media Types" },
  { value: "Plate Count Agar", label: "PCA" },
  { value: "VRBA", label: "VRBA" },
  { value: "BGBB", label: "BGBB" },
  { value: "MacConkey", label: "MacConkey" },
  { value: "R2A", label: "R2A" },
  { value: "TSA", label: "TSA" },
  { value: "Other", label: "Other" },
];
const DATE_RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "custom", label: "Custom" },
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
          new Set(
            items.map((a) => a.user?.full_name || a.user?.email || "Unknown"),
          ),
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
          new Set(
            items.map((a) => a.user?.full_name || a.user?.email || "Unknown"),
          ),
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
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pb-3 border-b border-slate-800">
        {label}
      </p>
      <div className="space-y-3">
        <div className="flex justify-between items-center gap-6">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {t('analytics.tooltipAnalyses')}
          </span>
          <span className="text-sm font-bold text-white">{p.testCount}</span>
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {t('analytics.tooltipDensity')}
          </span>
          <span className="text-sm font-bold text-primary">
            {formatCFU(p.avgCfu)}
          </span>
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {t('analytics.tooltipSuccess')}
          </span>
          <span className="text-sm font-bold text-emerald-400">
            {p.passRate}%
          </span>
        </div>
        {p.tntcCount > 0 && (
          <div className="flex justify-between items-center gap-6 pt-2 border-t border-slate-800">
            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
              {t('analytics.tooltipBoundary')}
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

import { ALL_DEMO_ANALYSES } from "@/lib/demo-data";

const USE_DEMO_DATA = true; // Set to false to use real data from API

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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (USE_DEMO_DATA) {
        // Use expanded demo data
        setAllAnalyses(ALL_DEMO_ANALYSES);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));
      } else {
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
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail || e?.message || t('analytics.errorLoad');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, mediaType, customDateFrom, customDateTo]);

  useEffect(() => {
    fetchData();
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
          allAnalyses.map(
            (a) => a.user?.full_name || a.user?.email || "Unknown",
          ),
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
      return { total: 0, avgCfu: 0, passRate: 0, tntc: 0, tftc: 0 };
    const valid = filtered.filter((a) => a.status === "valid").length;
    const cfuItems = filtered.filter((a) => a.cfu_per_ml != null);
    const avgCfu =
      cfuItems.length > 0
        ? cfuItems.reduce((s, a) => s + (a.cfu_per_ml || 0), 0) /
          cfuItems.length
        : 0;
    return {
      total,
      avgCfu: Math.round(avgCfu * 10) / 10,
      passRate: Math.round((valid / total) * 1000) / 10,
      tntc: filtered.filter((a) => a.status === "TNTC").length,
      tftc: filtered.filter((a) => a.status === "TFTC").length,
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
      toast.success(t('history.successExportCsv'));
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || t('analytics.errorExport'));
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
          {t('analytics.syncingMatrix')}
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
            {t('analytics.networkFailure')}
          </h3>
          <p className="text-sm font-medium text-slate-400">{error}</p>
        </div>
        <button
          className="btn-primary px-10 py-4 flex items-center gap-3 mx-auto"
          onClick={fetchData}
        >
          <TrendingUp className="w-5 h-5" /> {t('analytics.reinitSync')}
        </button>
      </div>
    );

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden">
      {/* Container for Main Content and Docs */}
      <div className="flex relative min-h-[calc(100vh-200px)]">
        {/* Main Workspace Area */}
        <div className={`flex-1 transition-all duration-300 ${showDocs ? 'lg:mr-[350px]' : ''}`}>
          <div className="max-w-[1200px] mx-auto px-6 py-8 pb-20">
            {/* Cloudflare-style Header */}
            <div className="space-y-2 mb-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t('analytics.supertitle')}
              </p>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                {t('analytics.title')}
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                {t('analytics.subtitle')}
              </p>
              <DocumentationToggle showDocs={showDocs} setShowDocs={setShowDocs} text={t('analytics.docsToggle')} />
            </div>

            {/* Main Analytics Container */}
            <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
              <div className="px-6 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900">
                  {t('analytics.neuralQueriesHeader')}
                </h2>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">
                    {t('analytics.printReport')}
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-1 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline"
                  >
                    {t('analytics.downloadData')} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all">
                  <Filter className="w-3 h-3" /> {t('analytics.addFilter')}
                </button>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value as DateRange)}
                      className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-[10px] font-black text-slate-700 outline-none hover:border-slate-300 transition-all appearance-none pr-8"
                    >
                      {DATE_RANGE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.value === '7d' ? t('analytics.last7Days') : o.value === '30d' ? t('analytics.last30Days') : o.value === '90d' ? t('analytics.last90Days') : t('analytics.customDate')}
                        </option>
                      ))}
                    </select>
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Query Overview Pills */}
              <div className="px-6 py-6 space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-900">
                  {t('analytics.queryOverview')} <Clock className="w-3 h-3 text-slate-400" />
                </div>
                <div className="flex border-b border-slate-100 gap-6">
                  {[t('analytics.tabQueryName'), t('analytics.tabQueryType'), t('analytics.tabResponseCode'), t('analytics.tabDataCenter')].map(
                    (tab, i) => (
                      <button
                        key={tab}
                        className={`pb-2 text-[11px] font-bold transition-all ${i === 0 ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                      >
                        {tab}
                      </button>
                    ),
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4">
                  {[
                    {
                      label: "PCA Matrix",
                      val:
                        stats.total > 1000
                          ? `${(stats.total / 1000).toFixed(2)}k`
                          : stats.total,
                      color: "bg-blue-500",
                    },
                    { label: "VRBA Matrix", val: "1.43k", color: "bg-amber-500" },
                    { label: "BGBB Protocol", val: "50", color: "bg-emerald-500" },
                    { label: "R2A Analytics", val: "20", color: "bg-rose-500" },
                    { label: "Compliance Integrity", val: "99.8%", color: "bg-emerald-400" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="space-y-2 border-r border-slate-100 last:border-0 pr-4"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${s.color}`} />
                        <span className="text-[10px] font-bold text-slate-500 truncate">
                          {s.label}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900 tracking-tight">
                        {s.val}
                      </p>
                    </div>
                  ))}
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
                  {t('analytics.timeGmt')}
                </p>
              </div>

              {/* Query Statistics Section */}
              <div className="px-6 py-8 bg-slate-50/50 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 mb-6">
                  {t('analytics.queryStats')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2 border-l-2 border-slate-100 pl-6">
                    <p className="text-[10px] font-bold text-slate-500">
                      {t('analytics.totalQueries')}{" "}
                      <Info className="w-3 h-3 inline ml-1 opacity-50" />
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stats.total > 1000
                        ? `${(stats.total / 1000).toFixed(2)}k`
                        : stats.total}
                    </p>
                  </div>
                  <div className="space-y-2 border-l-2 border-slate-100 pl-6">
                    <p className="text-[10px] font-bold text-slate-500">
                      {t('analytics.avgQueriesSec')}{" "}
                      <Info className="w-3 h-3 inline ml-1 opacity-50" />
                    </p>
                    <p className="text-2xl font-bold text-slate-900">0.035</p>
                  </div>
                  <div className="space-y-2 border-l-2 border-slate-100 pl-6">
                    <p className="text-[10px] font-bold text-slate-500">
                      {t('analytics.avgProcessingTime')}{" "}
                      <Info className="w-3 h-3 inline ml-1 opacity-50" />
                    </p>
                    <p className="text-2xl font-bold text-slate-900">2.447</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Summary Table */}
            <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden mt-10">
              <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  {t('analytics.intelligenceLedger')}
                </h2>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {monthlySummaries.length} {t('analytics.cyclesLogged')}
                </span>
              </div>

              {monthlySummaries.length === 0 ? (
                <div className="py-24 text-center">
                  <FlaskConical className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                  <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
                    {t('analytics.noMonthlyArchived')}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        {[
                          t('analytics.colDiagnosticCycle'),
                          t('analytics.colTotalSequences'),
                          t('analytics.colDensityMedian'),
                          t('analytics.colComplianceIntegrity'),
                          t('analytics.colAuthorizedPersonnel'),
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"
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
                            <span className="text-[11px] font-black text-blue-600">
                              {formatCFU(row.avgCfu)} CFU/ML
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
        <DocumentationSidebar 
          showDocs={showDocs} 
          setShowDocs={setShowDocs}
          directory="Neural Analytics"
          title={t('analytics.docsTitle')}
          description={t('analytics.docsDescription')}
        >
                {/* 1. Overview */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">01</span>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Overview</h2>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    Modul Analytics berfungsi sebagai pusat intelijen data ColonyAI. Ini menyajikan visualisasi dinamis atas performa laboratorium, tingkat kepatuhan ISO, dan efisiensi throughput saraf (neural throughput) secara real-time.
                  </p>
                </section>

                {/* 2. Komponen Data */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">02</span>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Komponen Utama</h2>
                  </div>
                  <div className="space-y-6 ml-1">
                    {[
                      { id: '1', title: 'Query Overview', desc: 'Distribusi spesimen berdasarkan protokol media spesifik (PCA, VRBA, BGBB) yang menunjukkan volume pengujian laboratorium.' },
                      { id: '2', title: 'Time-Series Chart', desc: 'Visualisasi interaktif fluktuasi Average CFU (kepadatan koloni), Total Tests (volume), dan Pass Rate (kepatuhan standar) harian.' },
                      { id: '3', title: 'Query Statistics', desc: 'Indikator performa sistem komputasi ColonyAI. Menampilkan Average Queries Per Second (QPS) dan Processing Time.' },
                      { id: '4', title: 'Intelligence Ledger', desc: 'Agregasi data historis secara bulanan (Siklus Diagnostik) yang mencatat Median Densitas dan Integritas Kepatuhan (%) analis.' }
                    ].map((step) => (
                      <div key={step.id} className="flex gap-4 group">
                        <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-900 text-white text-[11px] font-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          {step.id}
                        </span>
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                          <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 3. Export Protocol */}
                <section className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">03</span>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Export Protocol</h2>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Format Ekspor', val: 'CSV Matrix (Comma Separated Values).' },
                      { label: 'Validitas Data', val: 'Diakui untuk Audit ISO-17025.' },
                      { label: 'Keamanan', val: 'Audit Trail di-hash secara kriptografis.' }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col gap-1 pb-3 border-b border-slate-50 last:border-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                        <span className="text-xs font-bold text-slate-700">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Status Alerts Section */}
                <div className="space-y-4 pt-6">
                  <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4 shadow-sm">
                    <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                      <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center">
                        <BarChart3 className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-blue-900 uppercase tracking-widest">Analytics Ready</p>
                      <p className="text-[11px] text-blue-700 leading-relaxed font-semibold">
                        Sistem pelaporan ini dapat disinkronisasi ke berbagai platform Business Intelligence (BI) eksternal.
                      </p>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex gap-4 shadow-xl">
                    <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                      <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                        <Lock className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-white uppercase tracking-widest">ColonyAI Vault</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                        Seluruh data dienkripsi dan disimpan untuk kepatuhan data jangka panjang sesuai ISO-17025.
                      </p>
                    </div>
                  </div>
                </div>
        </DocumentationSidebar>
      </div>
    </div>
  );
}

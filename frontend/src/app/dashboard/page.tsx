"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  FlaskConical,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Download,
  FileText,
  Table as TableIcon,
  History as HistoryIcon,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Shield,
  Beaker,
  Calendar,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { dashboardApi } from "@/lib/dashboard-api";
import { DashboardStats, Analysis } from "@/lib/types";
import { DashboardSkeleton } from "@/components/skeleton";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";
import { useTranslationStore } from "@/lib/i18n/store";
import { useThemeStore } from "@/lib/theme-store";

import {
  DocumentationSidebar,
  DocumentationToggle,
} from "@/components/DocumentationSidebar";

const POLLING_INTERVAL = 30000;

export default function DashboardPage() {
  const { t } = useTranslationStore();
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaFilter, setMediaFilter] = useState<string>("all");
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const [activeIntelTab, setActiveIntelTab] = useState(0);

  const loadStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data: DashboardStats = await dashboardApi.getStats();

      if (isMountedRef.current) {
        setStats(data);
        setFilteredAnalyses(data.recent_analyses);
        if (isRefresh) {
          toast.success("Dashboard updated");
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
      if (isRefresh) toast.error("Failed to refresh");
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadStats();
    pollingRef.current = setInterval(() => {
      if (isMountedRef.current && document.visibilityState === "visible")
        loadStats(true);
    }, POLLING_INTERVAL);
    return () => {
      isMountedRef.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [loadStats]);

  useEffect(() => {
    if (!stats) return;
    let filtered = [...stats.recent_analyses];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.sample_id.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.media_type.toLowerCase().includes(q),
      );
    }
    if (mediaFilter !== "all")
      filtered = filtered.filter((a) => a.media_type === mediaFilter);
    setFilteredAnalyses(filtered);
  }, [searchQuery, mediaFilter, stats]);

  const mediaTypes = stats
    ? Array.from(new Set(stats.recent_analyses.map((a) => a.media_type)))
    : [];
  const weeklyTotal = stats
    ? stats.weekly_trend.reduce((s, d) => s + d.analyses, 0)
    : 0;

  // Transform weekly_trend for area chart with dot style
  const chartData =
    stats?.weekly_trend.map((d) => ({
      name: d.day,
      analyses: d.analyses,
    })) || [];

  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const isOperational = user?.role === "analyst" || user?.role === "admin";

  const [showDocs, setShowDocs] = useState(true);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative bg-[#f4f7f6] dark:bg-slate-950 transition-colors duration-300">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 ${showDocs ? "lg:mr-[350px]" : ""}`}
        >
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-0 sm:py-0">
            {/* Greeting Section */}
            <div className="mb-2 sm:mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  {t("overview.greeting")}{" "}
                  {user?.full_name?.split(" ")[0] || "Lead"} !
                </h1>
                <p className="text-slate-400 dark:text-slate-500 mt-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                  {t("overview.subtitle")}
                </p>
              </div>
              <div className="hidden lg:block">
                <DocumentationToggle
                  showDocs={showDocs}
                  setShowDocs={setShowDocs}
                  text={t("overview.docsTitle")}
                />
              </div>
            </div>

            {/* Summary Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
              {[
                {
                  label: t("overview.totalAnalyses"),
                  value: stats?.total_analyses || 0,
                  icon: FlaskConical,
                  trend: "+14%",
                  color: "indigo",
                },
                {
                  label: t("overview.neuralConfidence"),
                  value: `${stats?.neural_confidence || 0}%`,
                  icon: Zap,
                  trend: "+2.1%",
                  color: "emerald",
                },
                {
                  label: t("overview.pendingAudit"),
                  value: stats?.pending_review || 0,
                  icon: Clock,
                  trend: "-3",
                  color: "amber",
                },
                {
                  label: t("overview.systemLatency"),
                  value: `${stats?.system_latency_ms || 0}ms`,
                  icon: Activity,
                  trend: "Optimal",
                  color: "blue",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`backdrop-blur-sm border p-2 sm:p-4 rounded-xl shadow-sm group hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden ${
                    card.color === "indigo"
                      ? "bg-indigo-50/40 border-indigo-100/50 hover:bg-indigo-50/60 dark:bg-indigo-950/20 dark:border-indigo-900/40"
                      : card.color === "emerald"
                        ? "bg-emerald-50/40 border-emerald-100/50 hover:bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-900/40"
                        : card.color === "amber"
                          ? "bg-amber-50/40 border-amber-100/50 hover:bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/40"
                          : "bg-blue-50/40 border-blue-100/50 hover:bg-blue-50/60 dark:bg-blue-950/20 dark:border-blue-900/40"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 sm:mb-2">
                    <div
                      className={`p-1 sm:p-1.5 rounded-sm transition-colors ${
                        card.color === "indigo"
                          ? "bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30"
                          : card.color === "emerald"
                            ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30"
                            : card.color === "amber"
                              ? "bg-amber-50 text-amber-500 dark:bg-amber-900/30"
                              : "bg-blue-50 text-blue-500 dark:bg-blue-900/30"
                      }`}
                    >
                      <card.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                    <span
                      className={`text-[7px] sm:text-[9px] font-bold ${
                        card.trend.includes("+")
                          ? "text-emerald-500"
                          : card.trend.includes("-")
                            ? "text-rose-500"
                            : "text-slate-400"
                      } uppercase tracking-widest`}
                    >
                      {card.trend}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 text-[6px] sm:text-[8px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-0.5">
                      {card.label}
                    </p>
                    <p className="text-sm sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tighter">
                      {card.value}
                    </p>
                  </div>
                  <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                    <card.icon className="w-8 h-8 sm:w-12 sm:h-12" />
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
              {/* Left Column - 8/12 */}
              <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Job Applied / Specimen Trend Chart */}
                  <div className="dashboard-card col-span-1 rounded-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-[0.2em]">
                          {t("overview.specimenTrend")}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                          {t("overview.rolling7day")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                          {t("common.active")}
                        </span>
                      </div>
                    </div>
                    <div className="h-40 sm:h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient
                              id="colorAnalyses"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#6366f1"
                                stopOpacity={0.1}
                              />
                              <stop
                                offset="95%"
                                stopColor="#6366f1"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke={theme === "dark" ? "#1e293b" : "#f1f5f9"}
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: theme === "dark" ? "#64748b" : "#94a3b8",
                              fontSize: 9,
                              fontWeight: 700,
                            }}
                            dy={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: theme === "dark" ? "#64748b" : "#94a3b8",
                              fontSize: 9,
                              fontWeight: 700,
                            }}
                            dx={-10}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "8px",
                              border: "none",
                              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                              fontSize: "10px",
                              fontWeight: "bold",
                              backgroundColor: "rgba(15, 23, 42, 0.95)",
                              color: "#fff",
                            }}
                            itemStyle={{ color: "#fff" }}
                          />
                          <Area
                            type="stepAfter"
                            dataKey="analyses"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorAnalyses)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Project Overview / Analysis Breakdown */}
                  <div className="dashboard-card col-span-1 rounded-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-[0.2em]">
                        {t("overview.analysisBreakdown")}
                      </h3>
                      <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase outline-none cursor-pointer hover:border-primary/30 transition-colors appearance-none pr-6 relative">
                        <option>Batch: 2026-04</option>
                        <option>Batch: 2026-03</option>
                        <option>Batch: 2026-02</option>
                      </select>
                    </div>
                    <div className="text-center mb-3 sm:mb-6">
                      <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">
                        {stats?.total_analyses || 0}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5 sm:mt-1 uppercase tracking-[0.2em]">
                        {t("overview.analyzedSpecimens")}
                      </p>
                    </div>
                    {/* Segmented Progress Bar */}
                    <div className="flex h-1.5 sm:h-2 w-full rounded-full overflow-hidden mb-3 sm:mb-6 bg-slate-100 dark:bg-slate-800 transition-colors">
                      <div
                        className="bg-emerald-500"
                        style={{
                          width: `${((stats?.verified_count || 0) / (stats?.total_analyses || 1)) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-amber-500"
                        style={{
                          width: `${((stats?.pending_review || 0) / (stats?.total_analyses || 1)) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-rose-500"
                        style={{
                          width: `${((stats?.failed_count || 0) / (stats?.total_analyses || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          label: t("common.verified"),
                          val: stats?.verified_count || 0,
                          color: "text-emerald-500",
                        },
                        {
                          label: t("common.review"),
                          val: stats?.pending_review || 0,
                          color: "text-amber-500",
                        },
                        {
                          label: t("common.failed"),
                          val: stats?.failed_count || 0,
                          color: "text-rose-500",
                        },
                      ].map((item, i) => (
                        <div key={i} className="text-center">
                          <p className={`text-base font-black ${item.color}`}>
                            {item.val}
                          </p>
                          <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">
                            {item.label}
                          </p>
                        </div>
                      ))}
                    </div>
                    {isOperational && (
                      <button
                        onClick={() => router.push("/dashboard/upload")}
                        className="w-full mt-4 sm:mt-6 py-2 sm:py-2.5 bg-primary rounded-sm text-[9px] sm:text-[10px] font-bold text-slate-900 uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                      >
                        {t("nav.newAnalysis")}{" "}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {!isOperational && (
                      <button
                        onClick={() => router.push("/dashboard/history")}
                        className="w-full mt-4 sm:mt-6 py-2 sm:py-2.5 bg-primary rounded-sm text-[9px] sm:text-[10px] font-bold text-slate-900 uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                      >
                        {t("overview.goToGlobalArchive")}{" "}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Performance Listed / Recent Analyses Table */}
                <div className="dashboard-card rounded-sm">
                  <div className="flex items-center justify-between mb-3 sm:mb-6">
                    <h3 className="font-black text-slate-900 text-[10px] sm:text-xs uppercase tracking-[0.2em]">
                      {t("overview.neuralOutputRegistry")}
                    </h3>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                        <input
                          type="text"
                          placeholder={t("common.search")}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm pl-8 pr-4 py-1.5 text-[10px] font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary/20 w-48 transition-colors"
                        />
                      </div>
                      <button className="p-1.5 sm:p-2 bg-slate-50 dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 transition-colors">
                        <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
                          <th className="pb-4 font-black">
                            {t("overview.specimenId")}
                          </th>
                          <th className="pb-4 hidden xs:table-cell font-black">
                            {t("overview.mediaMatrix")}
                          </th>
                          <th className="pb-4 font-black">
                            {t("overview.yield")}
                          </th>
                          <th className="pb-4 text-right font-black">
                            {t("common.status")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {stats?.recent_analyses.map((a, i) => (
                          <tr
                            key={i}
                            className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                          >
                            <td className="py-2">
                              <span className="text-[11px] font-black text-slate-900 font-mono tracking-tight">
                                {a.sample_id}
                              </span>
                              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5 flex items-center gap-1">
                                {a.user?.organization_name || "ColonyAI Global"}{" "}
                                <span className="text-slate-300 dark:text-slate-700">
                                  •
                                </span>{" "}
                                {a.user?.full_name || "Unknown"}
                              </p>
                              <p className="xs:hidden text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter mt-0.5">
                                {a.media_type}
                              </p>
                            </td>
                            <td className="py-2 hidden xs:table-cell">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {a.media_type}
                              </span>
                            </td>
                            <td className="py-2">
                              <span className="text-[11px] font-black text-slate-900 dark:text-white">
                                {a.colony_count}
                              </span>
                              <span className="text-[9px] text-slate-400 ml-1 font-bold uppercase tracking-tighter">
                                {t("overview.cfuUnit")}
                              </span>
                            </td>
                            <td className="py-2 text-right">
                              <span
                                className={`px-2 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest border shadow-sm ${
                                  a.status === "completed"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    : a.status === "processing"
                                      ? "bg-amber-50 text-amber-600 border-amber-100"
                                      : "bg-rose-50 text-rose-600 border-rose-100"
                                }`}
                              >
                                {t(`common.${a.status}`)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column - 4/12 */}
              <div className="lg:col-span-4 space-y-3">
                {/* Stats Bar */}
                <div className="dashboard-card p-3 sm:p-4">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center divide-x divide-slate-100">
                    <div>
                      <p className="text-slate-400 text-[8px] sm:text-[10px] font-bold uppercase mb-1 sm:mb-2">
                        {t("common.verified")}
                      </p>
                      <p className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white">
                        {stats?.verified_count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[8px] sm:text-[10px] font-bold uppercase mb-1 sm:mb-2">
                        {t("common.review")}
                      </p>
                      <p className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white">
                        {stats?.pending_review || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[8px] sm:text-[10px] font-bold uppercase mb-1 sm:mb-2">
                        {t("common.failed")}
                      </p>
                      <p className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white">
                        {stats?.failed_count || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* System Health Terminal */}
                <div className="dashboard-card rounded-sm p-0 overflow-hidden border-slate-200 dark:border-slate-800">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                      {t("overview.neuralNodeStatus")}
                    </h3>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="p-3 space-y-3">
                    {[
                      {
                        id: "NODE-01-A",
                        status: t("common.active"),
                        load: "12%",
                        color: "text-emerald-500",
                      },
                      {
                        id: "NODE-02-A",
                        status: t("common.active"),
                        load: "45%",
                        color: "text-emerald-500",
                      },
                      {
                        id: "NODE-01-B",
                        status: t("overview.idle"),
                        load: "0%",
                        color: "text-slate-300",
                      },
                      {
                        id: "NODE-02-B",
                        status: t("overview.standby"),
                        load: "2%",
                        color: "text-amber-500",
                      },
                    ].map((node, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 font-mono tracking-tighter">
                            {node.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-[9px] font-black uppercase tracking-widest ${node.color}`}
                          >
                            {node.status}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 tabular-nums w-8 text-right">
                            {node.load}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {t("overview.clusterSecure")}
                    </span>
                    <span className="text-[9px] font-bold text-slate-900 dark:text-white">
                      {t("overview.online")}
                    </span>
                  </div>
                </div>
                {/* Today Events */}
                <Link
                  href="/dashboard/audit"
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4 text-slate-900 dark:text-white flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        {t("overview.todayEvents")}
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {t("overview.batchAudit")}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Recent Alerts */}
                <div className="dashboard-card p-3">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">
                    {t("overview.recentSystemAlerts")}
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        name: "ISO-VRBA-005",
                        desc: t("overview.lowReliability"),
                        time: "Only today",
                        color: "rose",
                      },
                      {
                        name: "ISO-PCA-B2026",
                        desc: t("overview.syncingLedger"),
                        time: "20-25",
                        color: "primary",
                      },
                    ].map((alert, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-8 h-8 rounded-full bg-${alert.color}/10 flex items-center justify-center`}
                          >
                            <Activity
                              className={`w-4 h-4 text-${alert.color === "rose" ? "rose-500" : "primary"}`}
                            />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-800">
                              {alert.name}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                              {alert.desc}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-black ${alert.color === "rose" ? "text-rose-500" : "text-slate-400"}`}
                        >
                          {alert.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Small Chart */}
                <div className="dashboard-card rounded-sm p-2 sm:p-3">
                  <div className="h-20 sm:h-28 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <Area
                          type="step"
                          dataKey="analyses"
                          stroke="#10b981"
                          strokeWidth={2}
                          fillOpacity={0}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                      {t("overview.diagnosticYield")}
                    </p>
                    <div className="flex items-center gap-1 text-emerald-500">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-xs font-black">+12%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Cloudflare-style Intelligence Section at Bottom */}
            <div className="mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
              <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/50">
                <div>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                    {t("overview.neuralIntelligenceLayer")}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    {t("overview.realTimeSpectral")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline">
                    {t("overview.downloadDataset")}
                  </button>
                  <div className="h-3 w-[1px] bg-slate-200 dark:bg-slate-700" />
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      {t("overview.activeSink")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Query Overview Dashboard */}
              <div className="px-5 py-3 space-y-4">
                <div className="flex border-b border-slate-100 dark:border-slate-800 gap-6">
                  {[
                    t("overview.queryOverview"),
                    t("overview.throughput"),
                    t("overview.successRate"),
                  ].map((tab, i) => (
                    <button
                      key={tab}
                      onClick={() => setActiveIntelTab(i)}
                      className={`pb-2 text-[10px] font-bold uppercase tracking-widest transition-all ${activeIntelTab === i ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {stats &&
                    Object.entries(stats.matrix_breakdown)
                      .slice(0, 5)
                      .map(([label, val], i) => (
                        <div
                          key={i}
                          className="border-r border-slate-50 dark:border-slate-800 last:border-0 pr-4"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${["bg-blue-500", "bg-amber-500", "bg-emerald-500", "bg-rose-500", "bg-purple-500"][i % 5]}`}
                            />
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 truncate uppercase">
                              {t("overview.matrixData", { label })}
                            </span>
                          </div>
                          <p className="text-base font-bold text-slate-900 dark:text-white tracking-tighter">
                            {val}
                          </p>
                        </div>
                      ))}
                  {(!stats ||
                    Object.keys(stats.matrix_breakdown).length === 0) && (
                    <p className="text-[10px] text-slate-400 italic col-span-5">
                      {t("overview.noMatrixData")}
                    </p>
                  )}
                </div>

                {/* Detailed Chart - Compact Height */}
                <div className="h-[140px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="0"
                        vertical={false}
                        stroke={theme === "dark" ? "#1e293b" : "#f1f5f9"}
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 8,
                          fill: theme === "dark" ? "#64748b" : "#cbd5e1",
                          fontWeight: 900,
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 8,
                          fill: theme === "dark" ? "#64748b" : "#cbd5e1",
                          fontWeight: 700,
                        }}
                        dx={-10}
                      />
                      <Tooltip
                        contentStyle={{ fontSize: "10px", borderRadius: "4px" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="analyses"
                        stroke="#3b82f6"
                        strokeWidth={1}
                        dot={false}
                        activeDot={{ r: 3, fill: "#3b82f6" }}
                      />
                      <Line
                        type="step"
                        dataKey="analyses"
                        stroke="#f59e0b"
                        strokeWidth={1}
                        dot={false}
                        strokeDasharray="3 3"
                        opacity={0.5}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[8px] text-center text-slate-300 font-bold uppercase tracking-[0.3em]">
                  {t("overview.queryTimeFrame")}
                </p>
              </div>

              {/* Intelligence Stats - Compact Row */}
              <div className="px-5 py-5 bg-slate-50/50 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border-l-2 border-blue-500 pl-4">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                      {t("overview.totalNeuralQueries")}{" "}
                      <Info className="w-2.5 h-2.5 inline ml-1 opacity-30" />
                    </p>
                    <p className="text-base font-bold text-slate-900 tracking-tighter">
                      {stats?.total_analyses || 0}
                    </p>
                  </div>
                  <div className="border-l-2 border-slate-200 dark:border-slate-800 pl-4">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                      {t("overview.avgQps")}{" "}
                      <Info className="w-2.5 h-2.5 inline ml-1 opacity-30" />
                    </p>
                    <p className="text-base font-bold text-slate-900 dark:text-white tracking-tighter">
                      0.035
                    </p>
                  </div>
                  <div className="border-l-2 border-slate-200 dark:border-slate-800 pl-4">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                      {t("overview.processingTime")}{" "}
                      <Info className="w-2.5 h-2.5 inline ml-1 opacity-30" />
                    </p>
                    <p className="text-base font-bold text-slate-900 dark:text-white tracking-tighter">
                      {stats?.system_latency_ms || 0}
                      <span className="text-[10px] ml-0.5 text-slate-400 dark:text-slate-500 font-bold uppercase">
                        ms
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Sidebar */}
        <div className="hidden lg:block">
          <DocumentationSidebar
            showDocs={showDocs}
            setShowDocs={setShowDocs}
            directory={t("overview.docsDirectory")}
            title={t("overview.docsNeuralControlCenter")}
            description={t("overview.docsOperationalSummary")}
            rawText={t("overview.docsRawText")}
          >
            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  01
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">
                  {t("overview.docsSection1Title")}
                </h2>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-sm border border-slate-100 dark:border-slate-800">
                {t("overview.docsSection1Text")}
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  02
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">
                  {t("overview.docsSection2Title")}
                </h2>
              </div>
              <div className="space-y-3 ml-0.5">
                {[
                  {
                    id: "1",
                    title: t("overview.docsComponent1Title"),
                    desc: t("overview.docsComponent1Desc"),
                  },
                  {
                    id: "2",
                    title: t("overview.docsComponent2Title"),
                    desc: t("overview.docsComponent2Desc"),
                  },
                  {
                    id: "3",
                    title: t("overview.docsComponent3Title"),
                    desc: t("overview.docsComponent3Desc"),
                  },
                ].map((item) => (
                  <div key={item.id} className="flex gap-2.5">
                    <span className="flex-shrink-0 w-4.5 h-4.5 rounded bg-slate-900 text-white text-[8px] font-bold flex items-center justify-center shadow-lg">
                      {item.id}
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-[10px] font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </DocumentationSidebar>
        </div>
      </div>
    </div>
  );
}

// Dot Matrix Mini Chart Component
function DotMatrixChart({
  data,
  color,
}: {
  data: { name: string; analyses: number }[];
  color: string;
}) {
  const maxVal = Math.max(...data.map((d) => d.analyses), 1);
  return (
    <div className="flex items-end gap-1 h-10">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          {Array.from({ length: Math.ceil((d.analyses / maxVal) * 5) }).map(
            (_, j) => (
              <div
                key={j}
                className="w-1.5 h-1.5 rounded-full opacity-60"
                style={{ backgroundColor: color }}
              />
            ),
          )}
        </div>
      ))}
    </div>
  );
}

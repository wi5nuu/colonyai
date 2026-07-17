"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  TrendingUp,
  Clock,
  Zap,
  Activity,
  Cpu,
  ArrowUpRight,
  Plus,
  FileText,
  Shield,
  Beaker,
  History as HistoryIcon,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
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
} from "recharts";
import { dashboardApi } from "@/lib/dashboard-api";
import { DashboardStats, Analysis } from "@/lib/types";
import { DashboardSkeleton } from "@/components/skeleton";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";
import { useTranslationStore } from "@/lib/i18n/store";
import { useThemeStore } from "@/lib/theme-store";

const POLLING_INTERVAL = 10000;

export default function DashboardPage() {
  const { t } = useTranslationStore();
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await dashboardApi.getStats();
      if (isMountedRef.current) {
        setStats(data);
        setFilteredAnalyses(data.recent_analyses);
      }
    } catch (error) {
      console.error("Dashboard Load Error:", error);
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
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") loadStats(true);
    }, POLLING_INTERVAL);
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [loadStats]);

  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!mounted) return null;
  if (isLoading) return <DashboardSkeleton />;

  const chartData =
    stats?.weekly_trend.map((d) => ({ name: d.day, val: d.analyses })) || [];

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        <div className="flex-1 transition-all duration-300">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-8 py-0 sm:py-0 space-y-4 sm:space-y-6">
            {/* HEADER SECTION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 sm:mb-6 pt-0">
              <div>
                <h1 className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                  {t("dashboard.strategicCommandCenter")}
                </h1>
                <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
                  Welcome Back,{" "}
                  <span className="text-primary font-black">
                    {user?.full_name?.split(" ")[0]}!
                  </span>{" "}
                  {"//"}{" "}
                  {t("dashboard.operationalStatus")}
                </p>
              </div>

          {user?.role && ["analyst", "admin", "super_admin"].includes(user.role) && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => router.push("/dashboard/upload")}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-none font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-primary" />
                {t("dashboard.newAnalysis")}
              </button>
            </div>
          )}
        </div>

        {/* STATS GRID - HIGH FIDELITY */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Total Specimens",
              val: stats?.total_analyses,
              icon: FlaskConical,
              color: "text-blue-500",
              bg: "bg-blue-500/5",
              trend: "+12.5%",
            },
            {
              label: "Neural Accuracy",
              val: `${stats?.neural_confidence}%`,
              icon: Zap,
              color: "text-emerald-500",
              bg: "bg-emerald-500/5",
              trend: "Optimal",
            },
            {
              label: "Pending Audit",
              val: stats?.pending_review,
              icon: Clock,
              color: "text-amber-500",
              bg: "bg-amber-500/5",
              trend: "-2",
            },
            {
              label: "System Uptime",
              val: "99.9%",
              icon: Activity,
              color: "text-purple-500",
              bg: "bg-purple-500/5",
              trend: "Live",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 p-3 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"
            >
              <div
                className={`absolute top-0 right-0 w-16 h-16 ${s.bg} rounded-full blur-2xl -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-700`}
              />
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div
                  className={`p-1.5 ${s.bg} rounded-none border border-white dark:border-slate-800 shadow-sm`}
                >
                  <s.icon className={`w-3 h-3 ${s.color}`} />
                </div>
                <span
                  className={`text-[7px] font-black ${s.color} uppercase tracking-widest`}
                >
                  {s.trend}
                </span>
              </div>
              <div className="relative z-10">
                <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest mb-0.5">
                  {s.label}
                </p>
                <p className="text-sm font-black text-slate-900 dark:text-white tracking-tighter">
                  {s.val}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN DATA SECTION */}
        <div className="grid grid-cols-12 gap-4">
          {/* LEFT: ANALYTICS */}
          <div className="col-span-12 lg:col-span-8 space-y-3">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                    Analytical Throughput
                  </h3>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    Real-time Specimen Trend (Rolling 7D)
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary font-black text-[8px] uppercase tracking-widest italic">
                    Live Feed
                  </span>
                </div>
              </div>

              <div className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="chartGradient"
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
                      tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                      itemStyle={{ color: "#818cf8" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="val"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fill="url(#chartGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* NEURAL OUTPUT REGISTRY (TABLE) */}
            <div className="bg-white dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                    Neural Output Registry
                  </h3>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    Validated Analysis Records
                  </p>
                </div>
                <button
                  onClick={() => router.push("/dashboard/history")}
                  className="text-[8px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All <ArrowUpRight className="w-2.5 h-2.5" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <th className="px-3 py-2">SPECIMEN ID</th>
                      <th className="px-3 py-2">MATRIX</th>
                      <th className="px-3 py-2">CFU</th>
                      <th className="px-3 py-2 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {stats?.recent_analyses.slice(0, 6).map((a, i) => (
                      <tr
                        key={i}
                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-3 py-2">
                          <span className="text-[9px] font-black text-slate-900 dark:text-white font-mono">
                            {a.sample_id}
                          </span>
                          <p className="text-[7px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                            {new Date(a.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                            {a.media_type}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-baseline gap-1">
                            <span className="text-[9px] font-black text-slate-900 dark:text-white">
                              {a.colony_count}
                            </span>
                            <span className="text-[7px] font-bold text-slate-400 uppercase">
                              cfu
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span
                            className={`px-1.5 py-0.5 text-[7px] font-black uppercase tracking-tighter border ${
                              a.status === "completed"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-amber-50 text-amber-600 border-amber-100"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: SYSTEM HEALTH & QUICK ACTIONS */}
          <div className="col-span-12 lg:col-span-4 space-y-3">
            {/* QUICK ACTIONS GRID */}
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: t("dashboard.reports"),
                  icon: FileText,
                  href: "/dashboard/reports",
                  color: "text-blue-500",
                  roles: ["manager", "auditor", "admin", "super_admin"],
                },
                {
                  label: "Simulator",
                  icon: Beaker,
                  href: "/dashboard/simulator",
                  color: "text-rose-500",
                  roles: ["analyst", "admin", "super_admin"],
                },
                {
                  label: t("dashboard.auditLedger"),
                  icon: Shield,
                  href: "/dashboard/audit",
                  color: "text-purple-500",
                  roles: ["manager", "auditor", "admin", "super_admin"],
                },
                {
                  label: t("dashboard.history"),
                  icon: HistoryIcon,
                  href: "/dashboard/history",
                  color: "text-amber-500",
                  roles: ["analyst", "manager", "auditor", "admin", "super_admin"],
                },
              ]
                .filter((item) => !user?.role || item.roles.includes(user.role))
                .map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="bg-white dark:bg-slate-900 p-2.5 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary transition-all group text-center"
                  >
                    <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-none mb-1.5 w-fit mx-auto group-hover:scale-110 transition-transform">
                      <item.icon className={`w-3 h-3 ${item.color}`} />
                    </div>
                    <p className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">
                      {item.label}
                    </p>
                  </Link>
                ))}
            </div>

            {/* NEURAL NODE STATUS */}
            <div className="bg-slate-900 rounded-none border border-slate-800 p-3 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />

              <div className="flex items-center justify-between mb-3 relative z-10">
                <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50">
                  Neural Node Monitoring
                </h3>
                <Activity className="w-3 h-3 text-primary animate-pulse" />
              </div>

              <div className="space-y-2.5 relative z-10">
                {[
                  { id: "NODE-ALFA-01",    status: "Active",  load: "24%", color: "bg-emerald-500" },
                  { id: "INFERENCE-CPU-X", status: "Active",  load: "12%", color: "bg-emerald-500" },
                  { id: "BATCH-LEDGER",    status: "Syncing", load: "88%", color: "bg-blue-400"    },
                  { id: "UPLINK-CLOUD",    status: "Standby", load: "0.2%",color: "bg-slate-500"   },
                ].map((node, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-[8px] font-bold">
                      <span className="text-white/40 font-mono tracking-tighter">{node.id}</span>
                      <span className="text-white/70">{node.status}</span>
                    </div>
                    <div className="w-full h-0.5 bg-white/5 overflow-hidden">
                      <div className={`h-full ${node.color} transition-all duration-1000`} style={{ width: node.load }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[7px] font-bold uppercase tracking-widest text-white/30">
                <span>Security Level: 05</span>
                <span className="text-emerald-500">Secure</span>
              </div>
            </div>

            {/* ANALYTICAL YIELD MINI-CARD */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-none p-3 text-white shadow-lg relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 opacity-20">
                <TrendingUp className="w-16 h-16" />
              </div>
              <p className="text-[8px] font-bold uppercase tracking-[0.1em] mb-1 opacity-70">
                Diagnostic Efficiency
              </p>
              <h4 className="text-base font-black tracking-tighter mb-1.5">
                +418.2%
              </h4>
              <p className="text-[8px] font-medium leading-relaxed opacity-90">
                Automation throughput reducing analysis latency by 92% vs. manual counting.
              </p>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}

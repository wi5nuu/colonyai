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
  const { t, language } = useTranslationStore();
  const isId = language === "id";
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
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 px-4 sm:px-0 pt-0 pb-6">
      <div className="max-w-[1500px] mx-auto px-6 space-y-6 pt-0">
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-none bg-slate-900 flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                  {isId
                    ? "Pusat Komando Strategis"
                    : "Strategic Command Center"}
                </h1>
                <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
                  Welcome Back,{" "}
                  <span className="text-primary font-black">
                    {user?.full_name?.split(" ")[0]}!
                  </span>{" "}
                  {"//"}{" "}
                  {isId
                    ? "Status Operasional: Aktif"
                    : "Operational Status: Active"}
                </p>
              </div>
            </div>
          </div>

          {user?.role && ["analyst", "admin"].includes(user.role) && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => router.push("/dashboard/upload")}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-none font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-primary" />
                {isId ? "Analisis Baru" : "New Analysis"}
              </button>
            </div>
          )}
        </div>

        {/* STATS GRID - HIGH FIDELITY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"
            >
              <div
                className={`absolute top-0 right-0 w-24 h-24 ${s.bg} rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-700`}
              />
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div
                  className={`p-2 ${s.bg} rounded-none border border-white dark:border-slate-800 shadow-sm`}
                >
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <span
                  className={`text-[8px] font-black ${s.color} uppercase tracking-widest`}
                >
                  {s.trend}
                </span>
              </div>
              <div className="relative z-10">
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">
                  {s.label}
                </p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {s.val}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN DATA SECTION */}
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT: ANALYTICS */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                    Analytical Throughput
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Real-time Specimen Trend (Rolling 7D)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary font-black text-[9px] uppercase tracking-widest italic">
                    Live Feed
                  </span>
                </div>
              </div>

              <div className="h-[240px] w-full">
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
              <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                    Neural Output Registry
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Validated Analysis Records
                  </p>
                </div>
                <button 
                  onClick={() => router.push("/dashboard/history")}
                  className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View Full History <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <th className="px-6 py-3">SPECIMEN ID</th>
                      <th className="px-6 py-3">MATRIX</th>
                      <th className="px-6 py-3">CFU COUNT</th>
                      <th className="px-6 py-3 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {stats?.recent_analyses.slice(0, 6).map((a, i) => (
                      <tr
                        key={i}
                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <span className="text-[11px] font-black text-slate-900 dark:text-white font-mono">
                            {a.sample_id}
                          </span>
                          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                            {new Date(a.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            {a.media_type}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {a.colony_count}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">
                              CFU
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border ${
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
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* QUICK ACTIONS GRID */}
            <div className={`grid ${
              [
                {
                  label: isId ? "Laporan" : "Reports",
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
                  roles: ["analyst", "admin"],
                },
                {
                  label: isId ? "Catatan Audit" : "Audit Ledger",
                  icon: Shield,
                  href: "/dashboard/audit",
                  color: "text-purple-500",
                  roles: ["manager", "auditor", "admin", "super_admin"],
                },
                {
                  label: isId ? "Riwayat" : "History",
                  icon: HistoryIcon,
                  href: "/dashboard/history",
                  color: "text-amber-500",
                  roles: ["analyst", "manager", "auditor", "admin"],
                },
              ].filter(item => !user?.role || item.roles.includes(user.role)).length <= 2 
                ? "grid-cols-2" 
                : "grid-cols-2"
            } gap-4`}>
              {[
                {
                  label: isId ? "Laporan" : "Reports",
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
                  roles: ["analyst", "admin"],
                },
                {
                  label: isId ? "Catatan Audit" : "Audit Ledger",
                  icon: Shield,
                  href: "/dashboard/audit",
                  color: "text-purple-500",
                  roles: ["manager", "auditor", "admin", "super_admin"],
                },
                {
                  label: isId ? "Riwayat" : "History",
                  icon: HistoryIcon,
                  href: "/dashboard/history",
                  color: "text-amber-500",
                  roles: ["analyst", "manager", "auditor", "admin"],
                },
              ]
                .filter((item) => !user?.role || item.roles.includes(user.role))
                .map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="bg-white dark:bg-slate-900 p-4 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary transition-all group text-center"
                  >
                    <div
                      className={`p-2.5 bg-slate-50 dark:bg-slate-800 rounded-none mb-2 w-fit mx-auto group-hover:scale-110 transition-transform`}
                    >
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">
                      {item.label}
                    </p>
                  </Link>
                ))}
            </div>

            {/* NEURAL NODE STATUS */}
            <div className="bg-slate-900 rounded-none border border-slate-800 p-6 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
                  Neural Node Monitoring
                </h3>
                <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
              </div>

              <div className="space-y-4 relative z-10">
                {[
                  {
                    id: "NODE-ALFA-01",
                    status: "Active",
                    load: "24%",
                    color: "bg-emerald-500",
                  },
                  {
                    id: "INFERENCE-CPU-X",
                    status: "Active",
                    load: "12%",
                    color: "bg-emerald-500",
                  },
                  {
                    id: "BATCH-LEDGER",
                    status: "Syncing",
                    load: "88%",
                    color: "bg-blue-400",
                  },
                  {
                    id: "UPLINK-CLOUD",
                    status: "Standby",
                    load: "0.2%",
                    color: "bg-slate-500",
                  },
                ].map((node, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-white/40 font-mono tracking-tighter">
                        {node.id}
                      </span>
                      <span className="text-white/80">{node.status}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${node.color} transition-all duration-1000`}
                        style={{ width: node.load }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-white/30">
                <span>Cluster Security Level: 05</span>
                <span className="text-emerald-500">Secure</span>
              </div>
            </div>

            {/* ANALYTICAL YIELD MINI-CARD */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-none p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -bottom-6 -right-6 opacity-20">
                <TrendingUp className="w-24 h-24" />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] mb-1.5 opacity-70">
                Diagnostic Efficiency
              </p>
              <h4 className="text-2xl font-black tracking-tighter mb-3">
                +418.2%
              </h4>
              <p className="text-[10px] font-medium leading-relaxed opacity-90">
                Automation throughput has reached critical mass, reducing
                analysis latency by 92% compared to manual counting methods.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

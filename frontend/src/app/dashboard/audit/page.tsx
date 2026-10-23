"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Download,
  History,
  User,
  Activity,
  Clock,
  Terminal,
  AlertCircle,
  Loader2,
  X,
  Lock,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  RefreshCw,
  Maximize,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import api from "@/lib/api";
import {
  DocumentationSidebar,
  DocumentationToggle,
} from "@/components/DocumentationSidebar";
import { useTranslationStore } from "@/lib/i18n/store";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  user_name: string;
  organization_name?: string;
  timestamp: string;
  status: string;
  previous_hash?: string;
  current_hash?: string;
  ip_address?: string;
  user_agent?: string;
}

export default function AuditPage() {
  const { t } = useTranslationStore();
  const { user: currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDocs, setShowDocs] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const ACTION_TYPES = [
    "ALL",
    "AUTH_LOGIN",
    "AUTH_LOGOUT",
    "USER_CREATE",
    "USER_UPDATE",
    "USER_DELETE",
    "ORG_CREATE",
    "ORG_UPDATE",
    "ANALYSIS_CREATE",
    "ANALYSIS_DELETE",
    "REPORT_EXPORT",
  ];

  const exportCSV = () => {
    const headers = ["id", "timestamp", "action", "resource_type", "resource_id", "user_name", "organization_name", "status", "ip_address", "current_hash"];
    const rows = filteredLogs.map((l) =>
      headers.map((h) => {
        const val = (l as any)[h] ?? "";
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<any[]>("/api/v1/audit/", {
          params: { limit: 100 },
        });
        setLogs(response.data);
      } catch (err: any) {
        const msg =
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to load audit log.";
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = actionFilter === "ALL" || l.action === actionFilter;
    return matchesSearch && matchesFilter;
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        <div className="flex-1 transition-all duration-300">
          <div className="max-w-[1500px] mx-auto px-3 py-0 space-y-3 pb-3">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2 pt-0">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                    {t("audit.title") || "Audit Ledger"}
                  </h1>
                </div>
                <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5">
                  {t("audit.subtitle") || "Immutable Cryptographic Log Stream"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none py-1 pl-6 pr-2 text-[9px] font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-primary/50 transition-colors w-36 sm:w-44"
                  />
                </div>
                {/* Filter dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilterMenu((v) => !v)}
                    className="flex items-center gap-1.5 px-2 py-1 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[9px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest hover:border-primary/50 transition-colors"
                  >
                    <Activity className="w-3 h-3" />
                    {actionFilter === "ALL" ? "All Actions" : actionFilter}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </button>
                  {showFilterMenu && (
                    <div className="absolute right-0 top-full mt-1 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg min-w-[160px]">
                      {ACTION_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => { setActionFilter(type); setShowFilterMenu(false); }}
                          className={`w-full text-left px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                            actionFilter === type
                              ? "bg-primary/10 text-primary"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Export CSV */}
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-1.5 px-2 py-1 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[9px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Export CSV
                </button>
                {/* Live badge */}
                <div className="flex items-center gap-1.5 px-2 py-1 border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live</span>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-1">
              <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Total Events</p>
                <p className="text-base font-black text-slate-900 dark:text-white leading-tight">{logs.length}</p>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Filtered</p>
                <p className="text-base font-black text-primary leading-tight">{filteredLogs.length}</p>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Auth Events</p>
                <p className="text-base font-black text-amber-500 leading-tight">
                  {logs.filter((l) => l.action.startsWith("AUTH_")).length}
                </p>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Hash Verified</p>
                <p className="text-base font-black text-emerald-500 leading-tight">
                  {logs.filter((l) => !!l.current_hash).length}
                </p>
              </div>
            </div>

            {/* Log Stream */}
            <div className="flex-1 overflow-auto bg-transparent relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-950/50 z-20 backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              <table className="w-full text-left text-[11px] font-mono whitespace-nowrap">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10">
                  <tr>
                    <th className="px-3 py-2 font-bold text-[9px] text-slate-900 dark:text-white uppercase tracking-widest">Time</th>
                    <th className="px-3 py-2 font-bold text-[9px] text-slate-900 dark:text-white uppercase tracking-widest">Status</th>
                    <th className="px-3 py-2 font-bold text-[9px] text-slate-900 dark:text-white uppercase tracking-widest hidden sm:table-cell">Host</th>
                    <th className="px-3 py-2 font-bold text-[9px] text-slate-900 dark:text-white uppercase tracking-widest hidden md:table-cell">Request</th>
                    <th className="px-3 py-2 font-bold text-[9px] text-slate-900 dark:text-white uppercase tracking-widest w-full">Messages</th>
                    <th className="px-3 py-2 font-bold text-[9px] text-slate-900 dark:text-white uppercase tracking-widest hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-500" />
                        Chain
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50 bg-white dark:bg-transparent">
                  {filteredLogs.map((log, idx) => {
                    const prevLog = idx > 0 ? filteredLogs[idx - 1] : null;
                    const chainOk = !prevLog || !log.previous_hash || !prevLog.current_hash
                      ? null
                      : log.previous_hash === prevLog.current_hash;
                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="px-3 py-1.5 text-slate-600 dark:text-slate-400">
                          {(() => {
                            const ts = log.timestamp.endsWith("Z") ? log.timestamp : `${log.timestamp}Z`;
                            const dateObj = new Date(ts);
                            const monthDay = dateObj.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toUpperCase();
                            const timeStr = dateObj.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
                            const msVal = String(dateObj.getMilliseconds()).padStart(3, "0").slice(0, 2);
                            return (
                              <>
                                <span className="text-slate-400 dark:text-slate-600 mr-2 hidden sm:inline">{monthDay}</span>
                                {timeStr}.{msVal}
                              </>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 dark:text-slate-400 font-bold">{log.action === "AUTH_LOGIN" ? "GET" : "POST"}</span>
                            <span className={`font-black ${log.status === "success" ? "text-emerald-500" : "text-red-500"}`}>
                              {log.status === "success" ? "200" : "500"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-1.5 text-slate-700 dark:text-slate-300 font-medium hidden sm:table-cell">
                          {log.ip_address || "127.0.0.1"}
                        </td>
                        <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400 hidden md:table-cell" title={log.user_agent}>
                          <span className="flex items-center gap-1.5">
                            <Terminal className="w-3 h-3 text-primary" /> /api/{log.resource_type}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-slate-600 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs md:max-w-lg lg:max-w-2xl">
                          <span className="text-slate-900 dark:text-white font-bold mr-2">[{log.user_name}]</span>
                          {log.action}
                          <span className="text-slate-400 dark:text-slate-600 hidden md:inline"> — {log.current_hash?.slice(0, 24)}…</span>
                        </td>
                        <td className="px-3 py-1.5 hidden sm:table-cell">
                          {log.current_hash ? (
                            chainOk === null ? (
                              <span title="Hash present" className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                                <Lock className="w-3 h-3" /> OK
                              </span>
                            ) : chainOk ? (
                              <span title="Chain intact" className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                                <Lock className="w-3 h-3" /> OK
                              </span>
                            ) : (
                              <span title="Chain break detected" className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase tracking-widest">
                                <AlertCircle className="w-3 h-3" /> BREAK
                              </span>
                            )
                          ) : (
                            <span className="text-[8px] text-slate-400 uppercase tracking-widest">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!isLoading && filteredLogs.length === 0 && (
                <div className="text-center py-20 text-slate-500 text-xs font-sans font-bold uppercase tracking-widest">
                  No logs found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Overlay */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
                  Log Integrity Hash Payload
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] bg-slate-50 dark:bg-slate-950">
              <pre className="text-xs text-slate-900 dark:text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

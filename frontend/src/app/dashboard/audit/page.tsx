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
  timestamp: string;
  status: string;
  previous_hash?: string;
  current_hash?: string;
}

export default function AuditPage() {
  const { t } = useTranslationStore();
  const { user: currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDocs, setShowDocs] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLog, setSelectedLog] = useState<any | null>(null);

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
          "Gagal memuat audit log.";
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.user_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative">
      {/* Detail Overlay */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Event Integrity Details</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Immutable Sequence #{selectedLog.id.slice(0,12)}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Action</p>
                  <p className="text-sm font-bold text-slate-200">{selectedLog.action}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Analyst Node</p>
                  <p className="text-sm font-bold text-slate-200">{selectedLog.user_name}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Metadata (Raw JSON)</p>
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/50 font-mono text-[11px] text-emerald-500/80 leading-relaxed overflow-x-auto shadow-inner">
                  <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Security Hashes</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <Lock className="w-3.5 h-3.5 text-primary opacity-50" />
                    <span className="text-[9px] font-mono text-slate-400 break-all uppercase">CURRENT: {selectedLog.current_hash}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <History className="w-3.5 h-3.5 text-slate-600 opacity-50" />
                    <span className="text-[9px] font-mono text-slate-600 break-all uppercase">PREVIOUS: {selectedLog.previous_hash || 'CHAIN_START'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-950/50 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Close Stream
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex relative min-h-[calc(100vh-200px)]">
        <div
          className={`flex-1 transition-all duration-300 ${showDocs ? "lg:mr-[350px]" : ""}`}
        >
          <div className="max-w-[1500px] mx-auto px-6 py-0 pt-0">
            <div className="space-y-4">
              {/* Audit Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg shadow-sm flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight uppercase">
                      {t("audit.title")}
                    </h1>
                  </div>
                  <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {t("audit.subtitle")}
                  </p>
                  <div className="hidden lg:block">
                    <DocumentationToggle
                      showDocs={showDocs}
                      setShowDocs={setShowDocs}
                      text={t("audit.docsToggle")}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative group flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder={t("audit.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-lg text-[10px] sm:text-[11px] font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all w-full sm:w-72 shadow-sm"
                    />
                  </div>
                  <button className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Terminal View */}
              <div className="space-y-6">
                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden shadow-slate-900/40">
                  <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                      <div className="flex items-center gap-2.5">
                        <Terminal className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          {t("audit.eventStream")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                    </div>
                  </div>

                  {/* Loading State */}
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">
                        Syncing Audit Stream...
                      </p>
                    </div>
                  )}

                  {/* Error State */}
                  {!isLoading && error && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                      <AlertCircle className="w-10 h-10 text-rose-500" />
                      <p className="text-[11px] font-bold text-slate-400">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Empty State */}
                  {!isLoading && !error && filteredLogs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                      <History className="w-10 h-10 text-slate-700" />
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                        No audit events recorded yet
                      </p>
                    </div>
                  )}

                  {/* Mobile Cards */}
                  {!isLoading && filteredLogs.length > 0 && (
                    <div className="block sm:hidden divide-y divide-slate-800">
                      {filteredLogs.map((log) => (
                        <div key={log.id} className="p-4 space-y-3 cursor-pointer hover:bg-slate-800/30 transition-colors" onClick={() => setSelectedLog(log)}>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">
                              {log.id.slice(0, 8)}
                            </span>
                            <span
                              className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
                                log.resource_type === "security" ||
                                log.resource_type === "auth"
                                  ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                  : log.resource_type === "system"
                                    ? "bg-primary/10 text-primary border-primary/20"
                                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              }`}
                            >
                              {log.action}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3 text-slate-600" />
                              <span className="text-[10px] font-bold text-slate-300 truncate max-w-[120px]">
                                {log.user_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-slate-600" />
                              <span className="text-[9px] font-medium text-slate-500">
                                {new Date(log.timestamp).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-slate-800/50">
                            <span className="text-[7px] font-mono text-emerald-500 opacity-40 uppercase tracking-tighter block">
                              Hash: {log.current_hash?.substring(0, 24) || "N/A"}...
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Desktop Table */}
                  {!isLoading && filteredLogs.length > 0 && (
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-left whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-900/30">
                            {[
                              t("audit.colSequenceId"),
                              t("audit.colActionProtocol"),
                              t("audit.colSourceAnalyst"),
                              t("audit.colTimestamp"),
                              t("audit.colLayer"),
                              "Integrity Chain",
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {filteredLogs.map((log) => (
                            <tr
                              key={log.id}
                              className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                              onClick={() => setSelectedLog(log)}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-primary transition-colors" />
                                  <span className="text-[11px] font-mono font-bold text-slate-400 group-hover:text-slate-200">
                                    {log.id.slice(0, 8)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`text-[9px] font-black px-2 py-1 rounded border ${
                                    log.resource_type === "security" ||
                                    log.resource_type === "auth"
                                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                      : log.resource_type === "system"
                                        ? "bg-primary/10 text-primary border-primary/20"
                                        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  }`}
                                >
                                  {log.action}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <User className="w-3 h-3 text-slate-600" />
                                  <span className="text-[11px] font-bold text-slate-300">
                                    {log.user_name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3 text-slate-600" />
                                  <span className="text-[10px] font-medium text-slate-500">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Activity className="w-3 h-3 text-slate-600" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {log.resource_type}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                  <span className="text-[7px] font-mono text-emerald-500 opacity-50 uppercase tracking-tighter">
                                    Current:{" "}
                                    {log.current_hash?.substring(0, 16) || "N/A"}
                                    ...
                                  </span>
                                  <span className="text-[7px] font-mono text-slate-600 uppercase tracking-tighter">
                                    Previous:{" "}
                                    {log.previous_hash?.substring(0, 16) ||
                                      "CHAIN_START"}
                                    ...
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      title: "Security Violations",
                      value: logs.filter(
                        (l) =>
                          l.resource_type === "security" ||
                          l.resource_type === "auth",
                      ).length.toString(),
                      icon: AlertCircle,
                      color: "emerald",
                    },
                    {
                      title: "Data Transactions",
                      value: logs.length.toString(),
                      icon: History,
                      color: "primary",
                    },
                    {
                      title: "Protocol Uptime",
                      value: "99.99%",
                      icon: Clock,
                      color: "purple",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="dashboard-card p-6 group hover:scale-[1.02] transition-all rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg bg-${s.color === "primary" ? "primary" : s.color === "purple" ? "purple-500" : "emerald-500"}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}
                        >
                          <s.icon
                            className={`w-5 h-5 text-${s.color === "primary" ? "primary" : s.color === "purple" ? "purple-500" : "emerald-500"}`}
                          />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">
                            {s.title}
                          </p>
                          <p className="text-xl font-bold text-slate-900 tracking-tight">
                            {s.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right: Documentation Sidebar */}
        <div className="hidden lg:block">
          <DocumentationSidebar
            showDocs={showDocs}
            setShowDocs={setShowDocs}
            directory="Compliance Logs"
            title="Log Keamanan & Audit"
            description="Rekam jejak immutable seluruh aktivitas sistem sesuai standar ISO-17025."
            rawText={`LOG KEAMANAN & AUDIT COLONYAI - ISO-17025
============================================

1. OVERVIEW: SECURITY LEDGER
Security Ledger menyimpan seluruh rekam jejak aktivitas (Audit Trail) yang terjadi di dalam sistem ColonyAI secara immutable (tidak dapat diubah).

2. AUDIT PROTOCOL
A. TRACEABILITY: Setiap entri memuat Sequence ID unik, protokol aksi (Action Protocol), dan Source Analyst.
B. LAYER TRACKING: Kategorisasi log ke dalam Security (otorisasi), System (konfigurasi), dan Data (proses spesimen).
C. INTEGRITY CHAIN: Verifikasi integritas data menggunakan hash kriptografis yang menghubungkan setiap log dengan log sebelumnya.

3. SEARCH & EXPORT
- Filter Pencarian: Melacak anomali atau Security Violations secara instan.
- Download: Ekspor log terenkripsi untuk keperluan audit eksternal.

STATUS: SECURE CHAIN ACTIVE
INTEGRITAS: 100% IMMUTABLE`}
          >
            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  01
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">
                  Overview
                </h2>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                Security Ledger menyimpan seluruh rekam jejak aktivitas (Audit
                Trail) yang terjadi di dalam sistem ColonyAI. Log ini bersifat
                immutable (tidak dapat diubah) dan merupakan syarat wajib
                kelulusan sertifikasi ISO-17025.
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  02
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">
                  Audit Protocol
                </h2>
              </div>
              <div className="space-y-3 ml-0.5">
                {[
                  {
                    id: "1",
                    title: "Traceability",
                    desc: "Setiap entri memuat Sequence ID unik, protokol aksi (Action Protocol), dan Source Analyst yang melakukan tindakan.",
                  },
                  {
                    id: "2",
                    title: "Layer Tracking",
                    desc: "Sistem mengkategorikan log ke dalam lapisan (Layer) seperti Security (otorisasi), System (perubahan config), dan Data (proses spesimen).",
                  },
                  {
                    id: "3",
                    title: "Search & Export",
                    desc: "Gunakan filter pencarian untuk melacak anomali (Security Violations). Tombol Download memungkinkan ekspor log dalam format terenkripsi.",
                  },
                ].map((step) => (
                  <div key={step.id} className="flex gap-2.5 group">
                    <span className="flex-shrink-0 w-4.5 h-4.5 rounded bg-slate-900 text-white text-[8px] font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      {step.id}
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-[10px] font-bold text-slate-900">
                        {step.title}
                      </h4>
                      <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
                        {step.desc}
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

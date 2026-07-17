"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Loader2,
  FlaskConical,
  History,
  ChevronLeft,
  ChevronRight,
  Database,
  ShieldCheck,
  Activity,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { analysesApi } from "@/lib/analyses-api";
import { reportsApi } from "@/lib/reports-api";
import {
  DocumentationSidebar,
  DocumentationToggle,
} from "@/components/DocumentationSidebar";
import { useTranslationStore } from "@/lib/i18n/store";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";
import { AnalysisListResponse, MediaType, ReportType } from "@/lib/types";

export default function HistoryPage() {
  const { t } = useTranslationStore();
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [mediaFilter, setMediaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [data, setData] = useState<AnalysisListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showDocs, setShowDocs] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; sampleId: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const pageSize = 12;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const result = await analysesApi.list({
          page,
          page_size: pageSize,
          search: searchTerm || undefined,
          media_type:
            mediaFilter !== "all" ? (mediaFilter as MediaType) : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        });
        setData(result);
      } catch (error: any) {
        toast.error(
          error.response?.data?.detail || t("history.errorLoadHistory"),
        );
      } finally {
        setIsLoading(false);
      }
    };
    const debounce = setTimeout(loadHistory, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, mediaFilter, statusFilter, page, t]);

  const handleViewAnalysis = (id: string) =>
    router.push(`/dashboard/results/${id}`);

  const handleExportCsv = async () => {
    if (!data?.analyses || data.analyses.length === 0) {
      toast.error(t("history.errorNoAnalyses"));
      return;
    }
    try {
      const report = await reportsApi.generateCsv({
        report_type: "custom" as ReportType,
        format: "csv",
      });
      await reportsApi.downloadReport(
        report.url.split("/").pop() || "latest",
        report.filename || "export.csv",
      );
      toast.success(t("history.successExportCsv"));
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t("history.errorExportCsv"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await analysesApi.delete(deleteTarget.id);
      toast.success(t("history.successDelete"));
      setDeleteTarget(null);
      const result = await analysesApi.list({
        page,
        page_size: pageSize,
        search: searchTerm || undefined,
        media_type:
          mediaFilter !== "all" ? (mediaFilter as MediaType) : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setData(result);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t("history.errorDelete"));
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCFU = (cfu: number | null, warnings: string[] | null) => {
    if (warnings?.some((w) => w.includes("TNTC"))) return "TNTC";
    if (warnings?.some((w) => w.includes("TFTC"))) return "TFTC";
    if (cfu === null) return "—";
    if (cfu >= 10000) return cfu.toExponential(2);
    return cfu.toLocaleString();
  };

  const analyses = data?.analyses || [];
  const totalPages = data?.total_pages || 1;
  const total = data?.total || 0;

  if (!mounted) return null;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        <div
          className={`flex-1 transition-all duration-300 ${showDocs ? "lg:mr-[350px]" : ""}`}
        >
          <div className="max-w-[1500px] mx-auto px-4 sm:px-8 py-0 sm:py-0 space-y-4 sm:space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 sm:mb-6 pt-0">
          <div className="space-y-1">
            <div>
              <h1 className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                {t("history.title")}
              </h1>
              <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
                Validated Analytical Repository // Neural Ledger
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-900 dark:bg-black p-3 rounded-none shadow-xl text-white border border-white/5 flex items-center gap-4">
              <div className="space-y-0.5">
                <p className="text-[7px] font-black text-white/40 uppercase tracking-widest leading-none">Security Standard</p>
                <p className="text-[10px] font-bold text-primary">AES-256-GCM</p>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div className="space-y-0.5">
                <p className="text-[7px] font-black text-white/40 uppercase tracking-widest leading-none">Ledger Nodes</p>
                <p className="text-[10px] font-bold text-white tracking-tighter">{total} Specimens</p>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest">Active</span>
              </div>
            </div>

            <button
              onClick={handleExportCsv}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-none font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              {t("history.exportCsv")}
            </button>
          </div>
        </div>

        {/* FILTERS BAR */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t("history.searchPlaceholder")}
              className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-none pl-12 pr-4 py-3 text-[11px] font-black uppercase tracking-widest placeholder:text-slate-400 dark:placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <select
              value={mediaFilter}
              onChange={(e) => setMediaFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border-none rounded-none px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="all">{t("history.allMedia")}</option>
              <option value="Plate Count Agar">PCA Protocol</option>
              <option value="VRBA">VRBA Protocol</option>
              <option value="BGBB">BGBB Protocol</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border-none rounded-none px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="all">{t("history.allStatuses")}</option>
              <option value="valid">{t("history.verifiedOnly")}</option>
              <option value="TNTC">Critical (TNTC)</option>
            </select>
          </div>
        </div>

        {/* LEDGER TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="px-4 py-2.5">Specimen Registry</th>
                  <th className="px-4 py-2.5">Matrix</th>
                  <th className="px-4 py-2.5">Analytical Yield</th>
                  <th className="px-4 py-2.5">Audit Status</th>
                  <th className="px-4 py-2.5">Neural Trust</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-4 py-3 h-10 bg-slate-50/20" />
                    </tr>
                  ))
                ) : analyses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Database className="w-8 h-8 text-slate-200 mb-3" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No matching records found in neural ledger</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  analyses.map((a: any) => (
                    <tr
                      key={a.id}
                      onClick={() => handleViewAnalysis(a.id)}
                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-none bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                            <FlaskConical className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div>
                            <span className="text-[11px] font-black text-slate-900 dark:text-white font-mono tracking-tight">{a.sample_id}</span>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{new Date(a.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{a.media_type}</span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[12px] font-black text-slate-900 dark:text-white">{formatCFU(a.cfu_per_ml, a.warnings)}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">CFU/mL</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1 h-1 rounded-full ${a.is_valid_for_reporting ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className={`text-[9px] font-black uppercase tracking-tighter ${a.is_valid_for_reporting ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {a.is_valid_for_reporting ? 'Verified' : 'Pending Audit'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col gap-0.5 w-20">
                          <div className="flex justify-between text-[8px] font-bold uppercase tracking-tighter">
                            <span className="text-slate-400">Trust</span>
                            <span className="text-slate-900 dark:text-white">{(a.confidence_score * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-0.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${a.confidence_score * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewAnalysis(a.id); }}
                            className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-none shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                          {user?.role !== "auditor" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: a.id, sampleId: a.sample_id }); }}
                              className="p-1 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-none transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-900 dark:text-white">{analyses.length}</span> of {total} records
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none disabled:opacity-30 hover:bg-slate-50 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Page {page} of {totalPages}
              </div>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none disabled:opacity-30 hover:bg-slate-50 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

          </div>
        </div>

        {/* Documentation Sidebar */}
        <DocumentationSidebar
          showDocs={showDocs}
          setShowDocs={setShowDocs}
          directory={t("history.docsDirectory") || "Neural Repository Audit SOP"}
          title={t("history.docsTitle") || "Analytical History Ledger"}
          description={t("history.docsDescription") || "Comprehensive database of all biological specimens processed by the ColonyAI neural engine."}
          rawText={`NEURAL ANALYTICAL REPOSITORY
==========================

1. DATA INTEGRITY
All analysis result data is stored in an AES-256 encrypted ledger. Each row represents one validated biological specimen.

2. AUDIT STATUS
- Completed: Analysis finished and ready for export.
- Pending: Requires manual verification by senior analyst.

3. DATA EXPORT
Use the 'Export Hub' button to download the entire repository in CSV format for external reporting.`}
        />
      </div>

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-sm">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  Confirm Delete
                </h3>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Modal body */}
            <div className="px-5 py-5 space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                You are about to permanently delete the following analysis:
              </p>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Sample ID</p>
                <p className="text-sm font-black text-slate-900 dark:text-white font-mono">{deleteTarget.sampleId}</p>
              </div>
              <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest">
                This action cannot be undone.
              </p>
            </div>
            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-[9px] font-black uppercase tracking-widest bg-rose-500 hover:bg-rose-600 text-white transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

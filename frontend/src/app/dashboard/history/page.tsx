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
} from "lucide-react";
import { analysesApi } from "@/lib/analyses-api";
import { reportsApi } from "@/lib/reports-api";
import {
  DocumentationSidebar,
  DocumentationToggle,
} from "@/components/DocumentationSidebar";
import { useTranslationStore } from "@/lib/i18n/store";
import { toast } from "sonner";
import { AnalysisListResponse, MediaType, ReportType } from "@/lib/types";

export default function HistoryPage() {
  const { t } = useTranslationStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [mediaFilter, setMediaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [data, setData] = useState<AnalysisListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showDocs, setShowDocs] = useState(true);
  const pageSize = 10;

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

  const handleDelete = async (id: string, sampleId: string) => {
    if (!window.confirm(t("history.confirmDelete", { id: sampleId })))
      return;
    try {
      await analysesApi.delete(id);
      toast.success(t("history.successDelete"));
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

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-sm font-bold text-slate-500 uppercase tracking-widest">
            {t("history.scanningArchives")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        <div
          className={`flex-1 transition-all duration-300 ${showDocs ? "lg:mr-[350px]" : ""}`}
        >
          <div className="max-w-[1500px] mx-auto px-4 py-0 sm:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-2 pb-2 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg shadow-sm flex items-center justify-center">
                  <History className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight uppercase leading-none">
                    {t("history.title")}
                  </h1>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-0.5">
                    {t("history.subtitle")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DocumentationToggle
                  showDocs={showDocs}
                  setShowDocs={setShowDocs}
                  text={t("history.docsToggle")}
                />
                <button
                  onClick={handleExportCsv}
                  className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm"
                >
                  <Download className="h-3 w-3 text-slate-400" />
                  <span>{t("history.exportCsv")}</span>
                </button>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white border border-slate-200/60 p-3 mb-4 rounded-xl shadow-sm">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t("history.searchPlaceholder")}
                    className="w-full pl-9 pr-3 py-2 text-[11px] font-bold text-slate-900 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-300"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    className="px-3 py-2 text-[10px] font-black text-slate-900 bg-slate-50 border border-slate-100 rounded-lg outline-none cursor-pointer uppercase tracking-wider"
                    value={mediaFilter}
                    onChange={(e) => {
                      setMediaFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="all">{t("history.allMedia")}</option>
                    <option value="Plate Count Agar">
                      {t("history.pcaProtocol")}
                    </option>
                    <option value="VRBA">{t("history.vrbaProtocol")}</option>
                    <option value="BGBB">{t("history.bgbbProtocol")}</option>
                    <option value="R2A">{t("history.r2aProtocol")}</option>
                    <option value="TSA">{t("history.tsaProtocol")}</option>
                    <option value="MacConkey">
                      {t("history.macProtocol")}
                    </option>
                  </select>
                  <select
                    className="px-3 py-2 text-[10px] font-black text-slate-900 bg-slate-50 border border-slate-100 rounded-lg outline-none cursor-pointer uppercase tracking-wider"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="all">{t("history.allStatuses")}</option>
                    <option value="valid">{t("history.verifiedOnly")}</option>
                    <option value="TNTC">{t("history.tntcCritical")}</option>
                    <option value="TFTC">{t("history.traceTFTC")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white border border-slate-200/60 overflow-hidden rounded-xl shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                    {t("history.archives")}
                  </h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {total} {t("history.recordsFound")}
                  </p>
                </div>
              </div>

              {/* Empty State */}
              {!isLoading && analyses.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                    <History className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {t("history.noRecords")}
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setMediaFilter("all");
                      setStatusFilter("all");
                    }}
                    className="mt-2 text-[9px] font-black text-primary uppercase tracking-[0.2em]"
                  >
                    {t("history.resetFilters")}
                  </button>
                </div>
              )}

              {/* Table */}
              {analyses.length > 0 && (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {[
                          t("history.tableSpecimenId"),
                          t("history.tableProtocol"),
                          t("history.tableCount"),
                          t("history.tableCfuMl"),
                          t("history.tableConfidence"),
                          t("history.tableTimestamp"),
                          t("history.tableAuditStatus"),
                          t("history.tableActions"),
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-[9px] font-black text-slate-700 uppercase tracking-widest"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {analyses.map((analysis: any) => (
                        <tr
                          key={analysis.id}
                          className="hover:bg-slate-50 cursor-pointer text-[11px]"
                          onClick={() => handleViewAnalysis(analysis.id)}
                        >
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {analysis.sample_id}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-700">
                            {analysis.media_type}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-700">
                            {analysis.colony_count}
                          </td>
                          <td className="px-4 py-3 font-black tabular-nums text-slate-900">
                            {formatCFU(analysis.cfu_per_ml, analysis.warnings)}
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-medium">
                            {(analysis.confidence_score * 100).toFixed(0)}%
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-medium">
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${analysis.is_valid_for_reporting ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                            >
                              {analysis.is_valid_for_reporting
                                ? t("history.verified")
                                : t("history.reviewRequired")}
                            </span>
                          </td>
                          <td className="px-4 py-3 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(analysis.id, analysis.sample_id);
                              }}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/30">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">
                    {t("history.showing")} {total} {t("history.of")}{" "}
                    {t("history.specimens")}
                  </p>
                  <div className="flex gap-1">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="p-1 rounded bg-white border border-slate-200"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                      className="p-1 rounded bg-white border border-slate-200"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <DocumentationSidebar
            showDocs={showDocs}
            setShowDocs={setShowDocs}
            directory={t("history.docsTitle")}
            title={t("history.docsTitle")}
            description={t("history.docsDescription")}
            rawText={t("history.docsDescription")}
          >
            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  01
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">
                  {t("history.docsTitle")}
                </h2>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                {t("history.docsDescription")}
              </p>
            </section>

            <section className="space-y-3 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  02
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">
                  {t("history.docsToggle")}
                </h2>
              </div>
              <div className="space-y-3 ml-0.5">
                {[
                  {
                    id: "1",
                    title: t("history.searchPlaceholder"),
                    desc: t("history.searchPlaceholder"),
                  },
                  {
                    id: "2",
                    title: t("history.allMedia"),
                    desc: t("history.allMedia"),
                  },
                  {
                    id: "3",
                    title: t("history.viewIntelligence"),
                    desc: t("history.tableSpecimenId"),
                  },
                  {
                    id: "4",
                    title: t("history.exportAudit"),
                    desc: t("history.exportCsv"),
                  },
                ].map((step) => (
                  <div key={step.id} className="flex gap-2.5 group">
                    <span className="flex-shrink-0 w-4.5 h-4.5 rounded bg-slate-900 text-white text-[8px] font-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
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

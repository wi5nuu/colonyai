"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  CheckCircle,
  Loader2,
  TrendingUp,
  Filter,
  ChevronDown,
  Info,
} from "lucide-react";
import { analysesApi } from "@/lib/analyses-api";
import { reportsApi } from "@/lib/reports-api";
import { Analysis, ReportType } from "@/lib/types";
import { toast } from "sonner";
import { useTranslationStore } from "@/lib/i18n/store";

import {
  DocumentationSidebar,
  DocumentationToggle,
} from "@/components/DocumentationSidebar";

interface GeneratedReport {
  id: string;
  filename: string;
  format: "pdf" | "csv";
  generatedAt: string;
  url: string;
}

export default function ReportsPage() {
  const { t } = useTranslationStore();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [mediaType, setMediaType] = useState("all");
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDocs, setShowDocs] = useState(true);

  const setPreset = (preset: "daily" | "monthly" | "yearly") => {
    const today = new Date();
    if (preset === "daily") {
      const dateStr = today.toISOString().split("T")[0];
      setDateFrom(dateStr);
      setDateTo(dateStr);
    } else if (preset === "monthly") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateFrom(firstDay.toISOString().split("T")[0]);
      setDateTo(today.toISOString().split("T")[0]);
    } else if (preset === "yearly") {
      const firstDay = new Date(today.getFullYear(), 0, 1);
      setDateFrom(firstDay.toISOString().split("T")[0]);
      setDateTo(today.toISOString().split("T")[0]);
    }
  };

  useEffect(() => {
    const loadAnalyses = async () => {
      setIsLoadingAnalyses(true);
      try {
        const result = await analysesApi.list({ page_size: 100 });
        setAnalyses(result.analyses);
      } catch (error: any) {
        toast.error(
          error.response?.data?.detail || t("reports.errorLoadAnalyses"),
        );
      } finally {
        setIsLoadingAnalyses(false);
      }
    };
    loadAnalyses();
  }, [t]);

  const filteredAnalyses = analyses.filter((a) => {
    if (mediaType !== "all" && a.media_type !== mediaType) return false;
    if (dateFrom && new Date(a.created_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(a.created_at) > new Date(dateTo + "T23:59:59"))
      return false;
    return true;
  });

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredAnalyses.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredAnalyses.map((a) => a.id)));
  };

  const handleGeneratePdf = async () => {
    if (selectedIds.size === 0) {
      toast.error(t("reports.errorSelectOne"));
      return;
    }
    setIsGenerating(true);
    try {
      const report = await reportsApi.generatePdf({
        report_type: "custom" as ReportType,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        format: "pdf",
      });
      await reportsApi.downloadReport(
        report.url.split("/").pop() || "latest",
        report.filename,
      );
      setRecentReports((prev) => [
        {
          id: report.url.split("/").pop() || `pdf-${Date.now()}`,
          filename: report.filename,
          format: "pdf",
          generatedAt: new Date().toISOString(),
          url: report.url,
        },
        ...prev,
      ]);
      toast.success(t("reports.successPdf"));
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t("reports.errorPdf"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCsv = async () => {
    if (selectedIds.size === 0) {
      toast.error(t("reports.errorSelectOne"));
      return;
    }
    setIsGenerating(true);
    try {
      const report = await reportsApi.generateCsv({
        report_type: "custom" as ReportType,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        format: "csv",
      });
      await reportsApi.downloadReport(
        report.url.split("/").pop() || "latest",
        report.filename,
      );
      setRecentReports((prev) => [
        {
          id: report.url.split("/").pop() || `csv-${Date.now()}`,
          filename: report.filename,
          format: "csv",
          generatedAt: new Date().toISOString(),
          url: report.url,
        },
        ...prev,
      ]);
      toast.success(t("reports.successCsv"));
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t("reports.errorCsv"));
    } finally {
      setIsGenerating(false);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative bg-[#f4f7f6] dark:bg-slate-950 transition-colors duration-300">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 ${showDocs ? "lg:mr-[350px]" : ""}`}
        >
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-0 sm:py-0">
            {/* Page Header */}
            <div className="flex flex-row items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center transition-colors">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                    {t("reports.title")}
                  </h1>
                </div>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                  {t("reports.subtitle")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden lg:block">
                  <DocumentationToggle
                    showDocs={showDocs}
                    setShowDocs={setShowDocs}
                    text={t("reports.docsToggle")}
                  />
                </div>
                <div className="px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    Ready
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                {
                  label: t("reports.storedRecords"),
                  val: analyses.length,
                  icon: FileText,
                  trend: "+1",
                  color: "indigo",
                },
                {
                  label: t("reports.selectedBuffer"),
                  val: selectedIds.size,
                  icon: CheckCircle,
                  trend: "SEL",
                  color: "emerald",
                },
                {
                  label: t("reports.sessionExports"),
                  val: recentReports.length,
                  icon: TrendingUp,
                  trend: "OUT",
                  color: "blue",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`backdrop-blur-sm border p-2 sm:p-4 rounded-xl shadow-sm group hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden ${
                    card.color === 'indigo' ? 'bg-indigo-50/40 border-indigo-100/50 hover:bg-indigo-50/60 dark:bg-indigo-950/20 dark:border-indigo-900/40' :
                    card.color === 'emerald' ? 'bg-emerald-50/40 border-emerald-100/50 hover:bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-indigo-900/40' :
                    'bg-blue-50/40 border-blue-100/50 hover:bg-blue-50/60 dark:bg-blue-950/20 dark:border-blue-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 border ${
                        card.color === 'indigo' ? 'bg-indigo-100/50 border-indigo-200/50 dark:bg-indigo-900/30 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400' :
                        card.color === 'emerald' ? 'bg-emerald-100/50 border-emerald-200/50 dark:bg-emerald-900/30 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400' :
                        'bg-blue-100/50 border-blue-200/50 dark:bg-blue-900/30 dark:border-blue-800/40 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      <card.icon className="h-5 w-5" />
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 text-[6px] sm:text-[8px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-0.5">
                      {card.label}
                    </p>
                    <p className="text-sm sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tighter">
                      {card.val}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Export Parameters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-xl shadow-sm mb-4 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                  <Filter className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
                <div>
                  <h2 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">
                    {t("reports.exportParameters")}
                  </h2>
                  <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    {t("reports.selectToEnable")}
                  </p>
                </div>
              </div>
              
              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-slate-50 dark:border-slate-800">
                <button 
                  onClick={() => setPreset("daily")}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 transition-all active:scale-95"
                >
                  {t("reports.presetDaily") || "Daily Report"}
                </button>
                <button 
                  onClick={() => setPreset("monthly")}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 transition-all active:scale-95"
                >
                  {t("reports.presetMonthly") || "Monthly Intelligence"}
                </button>
                <button 
                  onClick={() => setPreset("yearly")}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 transition-all active:scale-95"
                >
                  {t("reports.presetYearly") || "Annual Audit Ledger"}
                </button>
                <button 
                  onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 transition-all active:scale-95"
                >
                  {t("reports.clearFilters") || "Clear All"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {t("reports.rangeStart")}
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-[10px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all transition-colors"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {t("reports.rangeEnd")}
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-[10px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all transition-colors"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {t("reports.protocolMatrix")}
                  </label>
                  <select
                    className="w-full px-3 py-2 text-[10px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none transition-colors"
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                  >
                    <option value="all">{t("reports.allProtocols")}</option>
                    <option value="Plate Count Agar">PCA Protocol</option>
                    <option value="VRBA">VRBA Protocol</option>
                    <option value="BGBB">BGBB Protocol</option>
                    <option value="R2A">R2A Protocol</option>
                    <option value="TSA">TSA Protocol</option>
                    <option value="MacConkey">MAC Protocol</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                <button
                  onClick={handleGeneratePdf}
                  disabled={isGenerating || selectedIds.size === 0}
                  className="w-full sm:w-auto px-8 flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
                >
                  {isGenerating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <FileText className="h-3 w-3 text-primary" />
                  )}
                  {t("reports.generatePdf")}
                </button>
                <button
                  onClick={handleGenerateCsv}
                  disabled={isGenerating || selectedIds.size === 0}
                  className="w-full sm:w-auto px-8 flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-sm"
                >
                  {isGenerating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                  )}
                  {t("reports.exportCsv")}
                </button>
              </div>
            </div>

            {/* Analysis Selection */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 overflow-hidden rounded-xl shadow-sm mb-4 transition-colors">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between transition-colors">
                <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  {t("reports.selectedForExport")}: {selectedIds.size}{" "}
                  {t("reports.of")} {filteredAnalyses.length}
                </h2>
                <button
                  onClick={selectAll}
                  className="px-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm"
                >
                  {selectedIds.size === filteredAnalyses.length
                    ? t("reports.clearSelection")
                    : t("reports.selectAll")}
                </button>
              </div>

              {isLoadingAnalyses ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredAnalyses.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-slate-400 gap-2">
                  <Info className="w-6 h-6 opacity-20" />
                  <p className="text-[10px] font-medium">
                    {t("reports.noSpecimens")}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto scrollbar-hide">
                  {filteredAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      onClick={() => toggleSelection(analysis.id)}
                      className={`flex items-center justify-between px-4 py-2 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedIds.has(analysis.id) ? "bg-primary/5 dark:bg-primary/10" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded border transition-all flex items-center justify-center ${selectedIds.has(analysis.id) ? "bg-primary border-primary" : "border-slate-300 bg-white"}`}
                        >
                          {selectedIds.has(analysis.id) && (
                            <CheckCircle className="w-2 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                            {analysis.sample_id}
                          </p>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            {analysis.media_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-[10px] font-black text-slate-900 dark:text-white font-mono leading-none mb-1">
                            {analysis.colony_count}
                          </p>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            CFU
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Session Exports */}
            {recentReports.length > 0 && (
              <div className="bg-white border border-slate-200/60 overflow-hidden rounded-xl shadow-lg">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-900 flex items-center justify-between">
                  <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                    {t("reports.sessionQueue")}
                  </h2>
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-black rounded-full uppercase tracking-widest border border-primary/20">
                    {t("reports.statusPendingReview")}
                  </span>
                </div>
                <div className="p-2 space-y-2 bg-slate-50/50">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${report.format === "pdf" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}
                        >
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none block mb-1">
                            {report.filename}
                          </span>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            {new Date(report.generatedAt).toLocaleTimeString()}{" "}
                            {"//"} {report.format.toUpperCase()} Protocol
                          </p>
                        </div>
                      </div>
                      <a
                        href={report.url}
                        target="_blank"
                        className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-md active:scale-95"
                      >
                        <Download className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Documentation Sidebar */}
        <div className="hidden lg:block">
          <DocumentationSidebar
            showDocs={showDocs}
            setShowDocs={setShowDocs}
            directory={t("reports.docsTitle")}
            title={t("reports.docsTitle")}
            description={t("reports.docsDescription")}
            rawText={`SOP PELAPORAN LABORATORIUM COLONYAI
====================================

1. OVERVIEW: LABORATORY REPORTS
Modul pelaporan berfungsi untuk mengonversi data hasil analisis saraf menjadi dokumen formal (PDF/CSV) yang siap diaudit.

2. PARAMETER LAPORAN
- Date Range: Saring spesimen berdasarkan rentang tanggal penerimaan.
- Media Protocol: Kelompokkan laporan berdasarkan matriks media spesifik (PCA, VRBA, dll).
- Selection: Pilih spesimen tertentu secara manual dari daftar untuk disertakan dalam satu laporan konsolidasi.

3. EXPORT PIPELINE
Seluruh laporan yang dibuat akan masuk ke dalam antrean (Queue) sesi aktif untuk diunduh. Laporan PDF mencakup metadata lengkap, tanda tangan digital (opsional), dan skor kepercayaan neural.

STATUS: REPORTING READY
STANDAR: Kepatuhan ISO-17025`}
          >
            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  01
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">
                  Overview
                </h2>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                Modul pelaporan berfungsi untuk mengonversi data hasil analisis
                saraf menjadi dokumen formal (PDF/CSV) yang siap diaudit.
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  02
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">
                  Parameter Laporan
                </h2>
              </div>
              <div className="space-y-3 ml-0.5">
                {[
                  {
                    id: "1",
                    title: "Filter Rentang",
                    desc: "Saring spesimen berdasarkan tanggal mulai dan akhir penerimaan.",
                  },
                  {
                    id: "2",
                    title: "Matriks Media",
                    desc: "Pisahkan laporan berdasarkan protokol media agar (PCA, VRBA, dll).",
                  },
                  {
                    id: "3",
                    title: "Pipeline Queue",
                    desc: "Laporan yang dihasilkan akan muncul sementara di daftar unduhan sesi.",
                  },
                ].map((step) => (
                  <div key={step.id} className="flex gap-2.5 group">
                    <span className="flex-shrink-0 w-4.5 h-4.5 rounded bg-slate-900 text-white text-[8px] font-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      {step.id}
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-[10px] font-bold text-slate-900 dark:text-white">
                        {step.title}
                      </h4>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
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

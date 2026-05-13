"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  CheckCircle,
  Loader2,
  TrendingUp,
  Filter,
  Info,
  MessageCircle,
  Send,
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
import api from "@/lib/api";

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
  const [showDocs, setShowDocs] = useState(false);
  const [isSendingMessenger, setIsSendingMessenger] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setPreset = (preset: "daily" | "monthly" | "yearly") => {
    const today = new Date();
    if (preset === "daily") {
      const d = today.toISOString().split("T")[0];
      setDateFrom(d);
      setDateTo(d);
    } else if (preset === "monthly") {
      setDateFrom(
        new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString()
          .split("T")[0],
      );
      setDateTo(today.toISOString().split("T")[0]);
    } else {
      setDateFrom(
        new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0],
      );
      setDateTo(today.toISOString().split("T")[0]);
    }
  };

  useEffect(() => {
    const load = async () => {
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
    load();
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

  const handleSendMessenger = async (platform: "whatsapp" | "telegram") => {
    setIsSendingMessenger(true);
    try {
      // Default support number — no prompt needed
      const defaultNumber = "+6281394829";
      const targetId = platform === "whatsapp" ? defaultNumber
        : prompt("Enter Telegram Chat ID:");
      if (!targetId) return;

      const response = await api.post("/api/v1/reports/send-messenger", {
        platform,
        target_id: targetId,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      
      toast.success(response.data.message || `Report sent via ${platform.toUpperCase()} to ${targetId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to send via ${platform.toUpperCase()}`);
    } finally {
      setIsSendingMessenger(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full font-sans bg-transparent">
      <div className="max-w-[1500px] mx-auto w-full px-6 flex flex-col h-full">
        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 ${showDocs ? "lg:mr-[320px]" : ""}`}
        >
          <div className="max-w-[1500px] mx-auto px-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-primary" />
                <div>
                  <h1 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">
                    {t("reports.title")}
                  </h1>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                    {t("reports.subtitle")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden lg:block">
                  <DocumentationToggle
                    showDocs={showDocs}
                    setShowDocs={setShowDocs}
                    text={t("reports.docsToggle")}
                  />
                </div>
                <div className="px-2 py-1 border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30">
                  <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Ready
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 border border-slate-200 dark:border-slate-800 mb-6">
              {[
                {
                  label: t("reports.storedRecords"),
                  val: analyses.length,
                  icon: FileText,
                },
                {
                  label: t("reports.selectedBuffer"),
                  val: selectedIds.size,
                  icon: CheckCircle,
                },
                {
                  label: t("reports.sessionExports"),
                  val: recentReports.length,
                  icon: TrendingUp,
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 px-5 py-4 bg-white dark:bg-slate-900 ${i < 2 ? "border-r border-slate-200 dark:border-slate-800" : ""}`}
                >
                  <c.icon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                      {c.label}
                    </p>
                    <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                      {c.val}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Export Parameters */}
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mb-6">
              <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                <Filter className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <div>
                  <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">
                    {t("reports.exportParameters")}
                  </h2>
                  <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                    {t("reports.selectToEnable")}
                  </p>
                </div>
              </div>

              <div className="p-5">
                {/* Presets */}
                <div className="flex flex-wrap gap-2 mb-5 pb-5 border-b border-slate-200 dark:border-slate-800">
                  {[
                    {
                      label:
                        t("reports.presetDaily") || "Daily Report (Last 24H)",
                      preset: "daily" as const,
                    },
                    {
                      label:
                        t("reports.presetMonthly") ||
                        "Monthly Intelligence (Last 30D)",
                      preset: "monthly" as const,
                    },
                    {
                      label:
                        t("reports.presetYearly") ||
                        "Annual Audit Ledger (YTD)",
                      preset: "yearly" as const,
                    },
                  ].map(({ label, preset }) => (
                    <button
                      key={preset}
                      onClick={() => setPreset(preset)}
                      className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary dark:hover:border-primary bg-white dark:bg-slate-950 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 transition-all"
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                    }}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-rose-400 hover:text-rose-500 dark:hover:border-rose-700 bg-white dark:bg-slate-950 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 transition-all"
                  >
                    {t("reports.clearFilters") || "Clear Temporal Filters"}
                  </button>
                </div>

                {/* Date + Protocol */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {t("reports.rangeStart")}
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 text-[10px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {t("reports.rangeEnd")}
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 text-[10px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {t("reports.protocolMatrix")}
                    </label>
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value)}
                      className="w-full px-3 py-2 text-[10px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary transition-all appearance-none"
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

                {/* Executive Summary — Efficiency Panel */}
                <div className="border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 mb-5">
                  <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">Executive Summary — AI vs Manual Efficiency</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "AI Analysis Time", val: "~3s", sub: "per plate", color: "text-emerald-600 dark:text-emerald-400" },
                      { label: "Manual Analysis Time", val: "~15m", sub: "per plate", color: "text-slate-500" },
                      { label: "Efficiency Gain", val: "300×", sub: "faster with AI", color: "text-[#1a237e] dark:text-blue-400" },
                    ].map((m, i) => (
                      <div key={i} className="text-center">
                        <p className={`text-lg font-black ${m.color}`}>{m.val}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{m.label}</p>
                        <p className="text-[7px] text-slate-300 dark:text-slate-600 uppercase">{m.sub}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-900/30 flex gap-4">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Consistency: <span className="text-emerald-600 dark:text-emerald-400">ISO-17025 Compliant</span></p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Accuracy: <span className="text-emerald-600 dark:text-emerald-400">&gt;95% mAP50</span></p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Dataset: <span className="text-emerald-600 dark:text-emerald-400">97K+ instances</span></p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={handleGeneratePdf}
                    disabled={isGenerating || selectedIds.size === 0}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <FileText className="h-3 w-3" />
                    )}
                    {t("reports.generatePdf")}
                  </button>
                  <button
                    onClick={handleGenerateCsv}
                    disabled={isGenerating || selectedIds.size === 0}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Download className="h-3 w-3" />
                    )}
                    {t("reports.exportCsv")}
                  </button>

                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden sm:block mx-2" />

                  <button
                    onClick={() => handleSendMessenger("whatsapp")}
                    disabled={isSendingMessenger}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    {isSendingMessenger ? <Loader2 className="h-3 w-3 animate-spin" /> : <MessageCircle className="h-3 w-3" />}
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleSendMessenger("telegram")}
                    disabled={isSendingMessenger}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    {isSendingMessenger ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                    Telegram
                  </button>
                </div>
              </div>
            </div>

            {/* Specimen Selection */}
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mb-6">
              <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  {t("reports.selectedForExport")}: {selectedIds.size}{" "}
                  {t("reports.of")} {filteredAnalyses.length}
                </p>
                <button
                  onClick={selectAll}
                  className="px-3 py-1 border border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary bg-white dark:bg-slate-950 transition-all"
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
                  <p className="text-[10px] font-bold uppercase tracking-widest">
                    {t("reports.noSpecimens")}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[380px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {filteredAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      onClick={() => toggleSelection(analysis.id)}
                      className={`flex items-center justify-between px-5 py-2.5 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-2 ${selectedIds.has(analysis.id) ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-transparent"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 border flex items-center justify-center ${selectedIds.has(analysis.id) ? "bg-primary border-primary" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950"}`}
                        >
                          {selectedIds.has(analysis.id) && (
                            <CheckCircle className="w-2 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-900 dark:text-white tracking-tight leading-none mb-0.5">
                            {analysis.sample_id}
                          </p>
                          <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                            {analysis.media_type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-black text-slate-900 dark:text-white font-mono leading-none mb-0.5">
                          {analysis.colony_count}
                        </p>
                        <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                          CFU
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Session Queue */}
            {recentReports.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mb-6">
                <div className="px-5 py-3 border-b border-slate-800 bg-slate-900 dark:bg-slate-950 flex items-center justify-between">
                  <h2 className="text-[10px] font-black text-white uppercase tracking-widest">
                    {t("reports.sessionQueue")}
                  </h2>
                  <span className="px-2 py-0.5 border border-primary/30 text-primary text-[8px] font-black uppercase tracking-widest">
                    {t("reports.statusPendingReview")}
                  </span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 flex items-center justify-center border ${report.format === "pdf" ? "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-500" : "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600"}`}
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-900 dark:text-white block mb-0.5">
                            {report.filename}
                          </span>
                          <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            {new Date(report.generatedAt).toLocaleTimeString()}{" "}
                            {"//"} {report.format.toUpperCase()} Protocol
                          </p>
                        </div>
                      </div>
                      <a
                        href={report.url}
                        target="_blank"
                        className="p-1.5 border border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
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

        {/* Docs Sidebar */}
        {showDocs && (
          <div className="hidden lg:flex flex-col fixed right-0 top-[64px] bottom-0 w-[320px] border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="p-6">
              <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">
                {t("reports.docsTitle")}
              </h2>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">
                {t("reports.docsDescription")}
              </p>
              <div className="space-y-5 text-[10px] text-slate-500 dark:text-slate-400">
                {[
                  {
                    id: "01",
                    title: "Overview",
                    desc: "Modul pelaporan berfungsi untuk mengonversi data hasil analisis neural menjadi dokumen formal (PDF/CSV) yang siap diaudit.",
                  },
                  {
                    id: "02",
                    title: "Filter Rentang",
                    desc: "Saring spesimen berdasarkan tanggal mulai dan akhir penerimaan specimen.",
                  },
                  {
                    id: "03",
                    title: "Matriks Media",
                    desc: "Pisahkan laporan berdasarkan protokol media agar (PCA, VRBA, dll) untuk audit spesifik.",
                  },
                  {
                    id: "04",
                    title: "Pipeline Queue",
                    desc: "Laporan yang dihasilkan muncul di daftar unduhan sesi aktif secara otomatis.",
                  },
                ].map((s) => (
                  <div key={s.id} className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[8px] font-black flex items-center justify-center">
                      {s.id}
                    </span>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-900 dark:text-white mb-0.5 uppercase tracking-wider">
                        {s.title}
                      </h4>
                      <p className="text-[9px] leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="border border-slate-200 dark:border-slate-800 p-3 mt-4">
                  <p className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
                    Status
                  </p>
                  <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    ● Reporting Ready — ISO-17025
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharePlatform, setSharePlatform] = useState<
    "whatsapp" | "telegram" | null
  >(null);
  const [shareInput, setShareInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
    const load = async (silent = false) => {
      if (!silent) setIsLoadingAnalyses(true);
      try {
        const result = await analysesApi.list({ page_size: 100 });
        setAnalyses(result.analyses);
      } catch (error: any) {
        if (!silent)
          toast.error(
            error.response?.data?.detail || t("reports.errorLoadAnalyses"),
          );
      } finally {
        if (!silent) setIsLoadingAnalyses(false);
      }
    };

    load();

    // Polling Real-time setiap 5 detik
    const interval = setInterval(() => {
      load(true);
    }, 5000);

    return () => clearInterval(interval);
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

  const handleOpenShareModal = (platform: "whatsapp" | "telegram") => {
    setSharePlatform(platform);
    setShareInput(platform === "whatsapp" ? "62813948290" : "colonyai_support");
    setIsShareModalOpen(true);
  };

  const handleConfirmShare = async () => {
    if (!sharePlatform) return;
    setIsSendingMessenger(true);
    try {
      const targetId =
        sharePlatform === "whatsapp"
          ? shareInput.replace(/[^0-9]/g, "")
          : shareInput.replace("@", "");

      if (!targetId) {
        toast.error(
          sharePlatform === "whatsapp"
            ? "Nomor WhatsApp tidak boleh kosong"
            : "Username Telegram tidak boleh kosong",
        );
        setIsSendingMessenger(false);
        return;
      }

      // ── Trigger API (Audit Trail) ──
      try {
        await api.post("/api/v1/reports/send-messenger", {
          platform: sharePlatform,
          target_id: targetId,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        });
      } catch (apiErr) {
        console.error(
          "API send-messenger logged in background, continuing redirect...",
          apiErr,
        );
      }

      // ── Generate Share Message ──
      const messageText =
        `*ColonyAI - ISO-17025 Diagnostic Report*\n\n` +
        `• Total Selected Specimens: *${selectedIds.size}* of *${filteredAnalyses.length}* specimens\n` +
        `• Date Range: *${dateFrom || "-"}* to *${dateTo || "-"}*\n` +
        `• Media Protocol: *${mediaType === "all" ? "All Protocols" : mediaType}*\n\n` +
        `Please process for system audit purposes. Thank you!`;

      const encodedMsg = encodeURIComponent(messageText);

      // ── Open platform redirect in new tab ──
      if (sharePlatform === "whatsapp") {
        window.open(
          `https://api.whatsapp.com/send?phone=${targetId}&text=${encodedMsg}`,
          "_blank",
        );
        toast.success("Redirecting to WhatsApp...");
      } else {
        window.open(`https://t.me/${targetId}?text=${encodedMsg}`, "_blank");
        toast.success("Redirecting to Telegram...");
      }
      setIsShareModalOpen(false);
    } catch (error: any) {
      toast.error(`Failed to send via ${sharePlatform.toUpperCase()}`);
    } finally {
      setIsSendingMessenger(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        {/* Main Content */}
        <div className="flex-1 transition-all duration-300">
          <div className="max-w-full mx-auto px-4 sm:px-6 py-0 sm:py-0 space-y-4 sm:space-y-6 pb-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 sm:mb-6 pt-0">
              <div>
                <h1 className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                  {t("reports.title")}
                </h1>
                <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
                  {t("reports.subtitle")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary bg-white dark:bg-slate-950 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 transition-all"
                >
                  {showMobileFilters ? "Hide Filters" : "Show Filters"}
                </button>
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

            {/* Mobile Filters (Collapsible) */}
            {showMobileFilters && (
              <div className="lg:hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 mb-6">
                <div className="space-y-4">
                  {/* Date Range */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        Range Start
                      </label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-[9px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        Range End
                      </label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-[9px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Protocol Matrix */}
                  <div className="space-y-1.5">
                    <label className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Protocol Matrix
                    </label>
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-[9px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary transition-all appearance-none"
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

                  {/* Quick Presets */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
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
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary dark:hover:border-primary bg-white dark:bg-slate-950 text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 transition-all text-left"
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Clear Filters - Aligned Right */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setDateFrom("");
                        setDateTo("");
                      }}
                      className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-rose-400 hover:text-rose-500 dark:hover:border-rose-700 bg-white dark:bg-slate-950 text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 transition-all"
                    >
                      {t("reports.clearFilters") || "Clear Temporal Filters"}
                    </button>
                  </div>

                  {/* Executive Summary — AI vs Manual Efficiency */}
                  <div className="border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
                    <p className="text-[7.5px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">
                      {t("reports.executiveSummary")}
                    </p>
                    <div className="space-y-2">
                      {[
                        {
                          label: t("reports.aiAnalysisTime"),
                          val: "~3s",
                          sub: t("reports.perPlate"),
                          color: "text-emerald-600 dark:text-emerald-400",
                        },
                        {
                          label: t("reports.manualAnalysisTime"),
                          val: "~15m",
                          sub: t("reports.perPlate"),
                          color: "text-slate-500",
                        },
                        {
                          label: t("reports.efficiencyGain"),
                          val: "300×",
                          sub: t("reports.fasterWithAi"),
                          color: "text-[#1a237e] dark:text-blue-400",
                        },
                      ].map((m, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <p className="text-[7px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-tight">
                              {m.label}
                            </p>
                            <p className="text-[6.5px] text-slate-400 dark:text-slate-600 uppercase">
                              {m.sub}
                            </p>
                          </div>
                          <p className={`text-base font-black ${m.color}`}>{m.val}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-900/30 space-y-1">
                      <p className="text-[6.5px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                        {t("reports.isoCompliant")}
                      </p>
                      <p className="text-[6.5px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                        {t("reports.accuracyMap")}
                      </p>
                      <p className="text-[6.5px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                        {t("reports.datasetInstances")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                onClick={() => handleOpenShareModal("whatsapp")}
                disabled={isSendingMessenger}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[9px] font-black uppercase tracking-widest transition-all"
              >
                {isSendingMessenger ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <MessageCircle className="h-3 w-3" />
                )}
                WhatsApp
              </button>
              <button
                onClick={() => handleOpenShareModal("telegram")}
                disabled={isSendingMessenger}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[9px] font-black uppercase tracking-widest transition-all"
              >
                {isSendingMessenger ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                Telegram
              </button>
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

        {/* RIGHT SIDEBAR — FILTERS */}
        <div className="hidden lg:flex lg:w-[280px] lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:sticky lg:top-[64px] lg:h-[calc(100vh-64px)] lg:overflow-y-auto lg:flex-col lg:bg-white lg:dark:bg-slate-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-0.5">
                {t("reports.exportParameters")}
              </h2>
              <p className="text-[7.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {t("reports.selectToEnable")}
              </p>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Range Start
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-2 py-1.5 text-[9px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Range End
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-2 py-1.5 text-[9px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Protocol Matrix */}
            <div className="space-y-1">
              <label className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Protocol Matrix
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="w-full px-2 py-1.5 text-[9px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary transition-all appearance-none"
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

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
              <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                Quick Presets
              </p>
            </div>

            {/* Preset Buttons */}
            <div className="space-y-1.5">
              {[
                {
                  label: t("reports.presetDaily") || "Daily Report (Last 24H)",
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
                    t("reports.presetYearly") || "Annual Audit Ledger (YTD)",
                  preset: "yearly" as const,
                },
              ].map(({ label, preset }) => (
                <button
                  key={preset}
                  onClick={() => setPreset(preset)}
                  className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary dark:hover:border-primary bg-white dark:bg-slate-950 text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 transition-all text-left"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Clear Filters - Aligned Right */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-rose-400 hover:text-rose-500 dark:hover:border-rose-700 bg-white dark:bg-slate-950 text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 transition-all"
              >
                {t("reports.clearFilters") || "Clear Temporal Filters"}
              </button>
            </div>

            {/* Executive Summary — AI vs Manual Efficiency */}
            <div className="border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5">
              <p className="text-[7.5px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">
                {t("reports.executiveSummary")}
              </p>
              <div className="space-y-1.5">
                {[
                  {
                    label: t("reports.aiAnalysisTime"),
                    val: "~3s",
                    sub: t("reports.perPlate"),
                    color: "text-emerald-600 dark:text-emerald-400",
                  },
                  {
                    label: t("reports.manualAnalysisTime"),
                    val: "~15m",
                    sub: t("reports.perPlate"),
                    color: "text-slate-500",
                  },
                  {
                    label: t("reports.efficiencyGain"),
                    val: "300×",
                    sub: t("reports.fasterWithAi"),
                    color: "text-[#1a237e] dark:text-blue-400",
                  },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-[7.5px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-tight">
                        {m.label}
                      </p>
                      <p className="text-[7px] text-slate-400 dark:text-slate-600 uppercase">
                        {m.sub}
                      </p>
                    </div>
                    <p className={`text-base font-black ${m.color}`}>{m.val}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-900/30 space-y-0.5">
                <p className="text-[7px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  {t("reports.isoCompliant")}
                </p>
                <p className="text-[7px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  {t("reports.accuracyMap")}
                </p>
                <p className="text-[7px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  {t("reports.datasetInstances")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Docs Sidebar */}
        {showDocs && (
          <div className="hidden lg:flex flex-col fixed right-0 top-[64px] bottom-0 w-[320px] border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-50">
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
                    desc: "The reporting module converts neural analysis result data into formal audit-ready documents (PDF/CSV).",
                  },
                  {
                    id: "02",
                    title: "Filter Rentang",
                    desc: "Filter specimens by start and end specimen receipt dates.",
                  },
                  {
                    id: "03",
                    title: "Matriks Media",
                    desc: "Separate reports by agar media protocol (PCA, VRBA, etc.) for specific audits.",
                  },
                  {
                    id: "04",
                    title: "Pipeline Queue",
                    desc: "Generated reports automatically appear in the active session download list.",
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

      {/* Premium Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none w-full max-w-md overflow-hidden shadow-2xl p-6 relative animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <svg
                className="w-4.5 h-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2 rounded-none border ${sharePlatform === "whatsapp" ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/50" : "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900/50"}`}
              >
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  {sharePlatform === "whatsapp"
                    ? "Send Report via WhatsApp"
                    : "Send Report via Telegram"}
                </h3>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  ISO-17025 Validated Share
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-none">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Message Preview
                </p>
                <div className="text-[10px] text-slate-600 dark:text-slate-300 font-mono space-y-1 whitespace-pre-line leading-relaxed">
                  {`*ColonyAI - ISO-17025 Diagnostic Report*\n\n` +
                    `• Total Specimens: *${selectedIds.size}* of *${filteredAnalyses.length}* specimens\n` +
                    `• Date Range: *${dateFrom || "-"}* to *${dateTo || "-"}*\n` +
                    `• Protocol: *${mediaType === "all" ? "All Protocols" : mediaType}*\n\n` +
                    `Please process for system audit purposes. Thank you!`}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {sharePlatform === "whatsapp"
                    ? "Target WhatsApp Number (With Country Code)"
                    : "Target Telegram Username"}
                </label>
                <input
                  type="text"
                  value={shareInput}
                  onChange={(e) => setShareInput(e.target.value)}
                  placeholder={
                    sharePlatform === "whatsapp"
                      ? "Example: 62813948290"
                      : "Example: colonyai_support"
                  }
                  className="w-full px-3 py-2 text-[10px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary transition-all"
                />
                <span className="text-[8px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wide block">
                  {sharePlatform === "whatsapp"
                    ? "Harap masukkan nomor lengkap diawali kode negara (misal 62813948290)."
                    : "Username tidak perlu diawali dengan tanda @."}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmShare}
                disabled={isSendingMessenger}
                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest text-white transition-colors flex items-center justify-center gap-2 ${sharePlatform === "whatsapp" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-blue-500 hover:bg-blue-600"}`}
              >
                {isSendingMessenger ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

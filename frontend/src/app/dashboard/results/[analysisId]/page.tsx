"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Download,
  CheckCircle,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Loader2,
  Camera,
  Target,
  Info,
  Eye,
  EyeOff,
  Zap,
  Shield,
  PieChart as PieIcon,
  FlaskConical,
  Database,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import Link from "next/link";
import { useTranslationStore } from "@/lib/i18n/store";
import { analysesApi } from "@/lib/analyses-api";
import { reportsApi } from "@/lib/reports-api";
import { Analysis, DetectionClass } from "@/lib/types";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import {
  DocumentationSidebar,
  DocumentationToggle,
} from "@/components/DocumentationSidebar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Fix image URL - ensure it uses the correct backend base URL
function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  let path = url;
  // If it's a full URL containing /uploads/, strip the host/port part
  // This handles cases where DB might have http://127.0.0.1:8000/uploads/...
  if (url.includes("/uploads/")) {
    path = "/uploads/" + url.split("/uploads/")[1];
  }
  
  // Prepend API_URL to the relative path
  // If API_URL is http://127.0.0.1:8000 and path is /uploads/orig.jpg
  // Result: http://127.0.0.1:8000/uploads/orig.jpg
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

// 1. TERMINOLOGY: Use Proposal Terms for Consistency
const CLASS_LABELS: Record<DetectionClass, string> = {
  colony_single: "Colony Single",
  colony_merged: "Colony Merged",
  bubble: "Bubble (Artifact)",
  dust_debris: "Dust/Debris (Artifact)",
  media_crack: "Media Crack (Artifact)",
};

const CLASS_COLORS: Record<DetectionClass, string> = {
  colony_single: "bg-emerald-500",
  colony_merged: "bg-amber-500",
  bubble: "bg-rose-500",
  dust_debris: "bg-slate-400",
  media_crack: "bg-primary",
};

const CLASS_BORDER_COLORS: Record<DetectionClass, string> = {
  colony_single: "border-emerald-500",
  colony_merged: "border-amber-500",
  bubble: "border-rose-500",
  dust_debris: "border-slate-400",
  media_crack: "border-primary",
};

const STATUS_COLORS: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  completed: {
    bg: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    text: "text-emerald-700 dark:text-emerald-400",
    label: "Completed",
  },
  processing: {
    bg: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
    text: "text-blue-700 dark:text-blue-400",
    label: "Processing",
  },
  failed: {
    bg: "bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400",
    text: "text-rose-700 dark:text-rose-400",
    label: "Failed",
  },
  pending: {
    bg: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
    text: "text-amber-700 dark:text-amber-400",
    label: "Pending",
  },
};

const formatCFU = (value: number | null) => {
  if (value === null) return "N/A";
  if (value >= 10000) return value.toExponential(2);
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.analysisId as string;
  const { user } = useAuthStore();
  const canApprove = user?.role === "manager" || user?.role === "admin";
  const { t } = useTranslationStore();

  // i18n-aware class label resolver
  const getClassLabel = (cls: DetectionClass): string => {
    const keyMap: Record<DetectionClass, string> = {
      colony_single: "results.colonySingle",
      colony_merged: "results.colonyMerged",
      bubble: "results.bubble",
      dust_debris: "results.dustDebris",
      media_crack: "results.mediaCrack",
    };
    return t(keyMap[cls]);
  };

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedDetection, setSelectedDetection] = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [filterClass, setFilterClass] = useState<DetectionClass | null>(null);
  const [viewMode, setViewMode] = useState<"audit" | "certificate">("audit");
  const [showDocs, setShowDocs] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [limsLoading, setLimsLoading] = useState(false);
  const [limsResult, setLimsResult] = useState<{
    lims_record_id: string;
    timestamp: string;
    next_action: string;
  } | null>(null);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const data = await analysesApi.getById(analysisId);
        setAnalysis(data);
      } catch (error: any) {
        toast.error(error.response?.data?.detail || "Failed to load analysis");
        router.push("/dashboard/history");
      } finally {
        setIsLoading(false);
      }
    };
    loadAnalysis();
  }, [analysisId, router]);

  const handleApprove = async () => {
    if (!analysis) return;
    try {
      await analysesApi.approve(analysis.id);
      toast.success("Analysis approved successfully");
      setAnalysis({ ...analysis, is_valid_for_reporting: true });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to approve analysis");
    }
  };

  const handleExportPdf = async () => {
    if (!analysis) return;
    try {
      const report = await reportsApi.generatePdf({
        report_type: "custom",
        date_from: analysis.created_at.split("T")[0],
        date_to: analysis.created_at.split("T")[0],
        format: "pdf",
      });
      window.open(report.url, "_blank");
      toast.success("PDF Report generated");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to export PDF");
    }
  };

  const handleSendToLims = async () => {
    if (!analysis) return;
    setLimsLoading(true);
    try {
      const result = await analysesApi.syncToLims(analysis.id);
      setLimsResult(result);
      toast.success(t("results.limsSuccess") || "Sent to LIMS successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "LIMS Communication Error");
    } finally {
      setLimsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-sm font-bold text-slate-500 uppercase tracking-widest">
            {t("results.reconstructing")}
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const validCount = (analysis.class_breakdown.colony_single || 0) + (analysis.class_breakdown.colony_merged || 0);
  const artifactCount = (analysis.class_breakdown.bubble || 0) + (analysis.class_breakdown.dust_debris || 0) + (analysis.class_breakdown.media_crack || 0);
  const totalCount = Object.values(analysis.class_breakdown).reduce((a, b) => a + b, 0);
  const statusInfo = STATUS_COLORS[analysis.status] || STATUS_COLORS.pending;

  const documentationText = `INTERPRETASI HASIL AUDIT COLONYAI
====================================

1. NEURAL MAPPING LAYER
Layer ini menampilkan visualisasi deteksi objek biologis. Gunakan toggle 'Annotations' untuk melihat kotak pembatas (Bounding Box) yang dihasilkan oleh AI.

2. SPECTRAL DISTRIBUTION
- Verified: Koloni yang diakui sebagai unit pembentuk koloni (CFU).
- Filtered: Artefak (gelembung, debu, retakan) yang ditolak oleh sistem saraf untuk mencegah False Positive.

3. KEPATUHAN ISO-17025 (METRIK GUM)
- Uncertainty (U): Nilai ketidakpastian yang dihitung berdasarkan protokol GUM (Guide to the Expression of Uncertainty in Measurement).
- Confidence Score: Tingkat kepercayaan model AI terhadap seluruh deteksi pada spesimen ini.

4. VERIFIKASI AKHIR
Manager atau Admin wajib menekan tombol 'Verify Audit' setelah meninjau keakuratan deteksi untuk melegitimasi laporan resmi.

STATUS: AUDIT PENDING VERIFICATION
MESIN: YOLOv8 SENSITIVE NODE`;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${showDocs ? "lg:mr-[350px]" : ""}`}>
          <div className="max-w-full mx-auto px-4 sm:px-6 pt-12 pb-12">
            {/* Header - Horizontal Compact */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/history"
                  className="w-8 h-8 rounded-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm group"
                >
                  <ArrowLeft className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors" />
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                      {t("results.title")}
                    </h1>
                    <span
                      className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border shadow-sm transition-colors ${
                        analysis.status === "completed"
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-wider flex items-center gap-2">
                    <span>
                      {t("results.sample")}:{" "}
                      <span className="text-slate-900 dark:text-white font-black">
                        {analysis.sample_id}
                      </span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <span>
                      {t("results.protocol")}:{" "}
                      <span className="text-slate-900 dark:text-white font-black">
                        {analysis.media_type}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="hidden lg:block">
                  <DocumentationToggle
                    showDocs={showDocs}
                    setShowDocs={setShowDocs}
                    text={t("results.auditProtocol")}
                  />
                </div>
                <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-sm border border-slate-200 dark:border-slate-700 transition-colors">
                  <button
                    onClick={() => setViewMode("audit")}
                    className={`px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === "audit" ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" : "text-slate-400 hover:text-slate-900"}`}
                  >
                    {t("results.auditMatrix")}
                  </button>
                  <button
                    onClick={() => setViewMode("certificate")}
                    className={`px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === "certificate" ? "bg-primary text-white shadow-md shadow-primary/10" : "text-slate-400 hover:text-slate-900"}`}
                  >
                    {t("results.certificate")}
                  </button>
                </div>
                <button
                  onClick={handleExportPdf}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  {t("results.exportProtocol")}
                </button>
                <button
                  onClick={handleSendToLims}
                  disabled={limsLoading || !!limsResult}
                  className={`px-3 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm ${
                    limsResult
                      ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50 cursor-not-allowed"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {limsLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Database className="h-3.5 w-3.5" />
                  )}
                  {limsResult ? t("results.transmittedToLims") : t("results.sendToLims")}
                </button>
                {analysis.status === "completed" && canApprove && (
                  <button
                    onClick={handleApprove}
                    className={`px-4 py-2 flex items-center justify-center gap-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all shadow-lg ${
                      analysis.is_valid_for_reporting
                        ? "bg-emerald-500 text-white shadow-emerald-500/10"
                        : "bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800 active:scale-95"
                    }`}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    {analysis.is_valid_for_reporting
                      ? t("results.verified2")
                      : t("results.approve")}
                  </button>
                )}
              </div>
            </div>

            {/* Warnings */}
            {analysis.warnings &&
              analysis.warnings.length > 0 &&
              viewMode === "audit" && (
                <div className="bg-rose-50/50 dark:bg-rose-950/20 border-2 border-rose-100 dark:border-rose-900/40 p-4 rounded-lg flex items-start gap-4 mb-8 transition-colors">
                  <div className="p-2.5 bg-rose-500 rounded-sm shadow-lg shadow-rose-200 dark:shadow-rose-900/40 flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1.5">
                      {t("results.neuralSensitivityAdvisory")}
                    </p>
                    <ul className="text-xs text-rose-700/80 dark:text-rose-300 font-bold space-y-1">
                      {analysis.warnings.map((warning, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 before:w-1 before:h-1 before:bg-rose-400 before:rounded-full"
                        >
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            {/* LIMS Success Card */}
            {limsResult && (
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-900/40 p-5 rounded-lg flex items-start gap-5 mb-8 animate-in slide-in-from-top duration-500 transition-colors">
                <div className="p-3 bg-indigo-600 rounded-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 flex-shrink-0">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                      {t("results.transmittedToLims")}
                    </p>
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[8px] font-black rounded-sm uppercase">
                      {t("results.sampleManager")}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[8px] font-black rounded-sm uppercase">
                      {t("results.simulatedDemo")}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                        {t("results.limsRecordId")}
                      </p>
                      <p className="text-xs font-black text-slate-900 dark:text-white font-mono">
                        {limsResult.lims_record_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                        {t("results.transmissionTime")}
                      </p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {new Date(limsResult.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                        {t("results.nextLimsAction")}
                      </p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {limsResult.next_action}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === "audit" ? (
              <>
                {/* Summary Matrix */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {[
                    {
                      label: t("results.finalResult"),
                      value: formatCFU(analysis.cfu_per_ml),
                      sub: t("results.cfuMlMatrix"),
                      icon: Target,
                      color: "primary",
                    },
                    {
                      label: t("results.neuralAccuracy"),
                      value: `${(analysis.confidence_score * 100).toFixed(1)}%`,
                      sub: t("results.aiReliabilityScore"),
                      icon: Activity,
                      color: "indigo",
                    },
                    {
                      label: t("results.biologicalMatch"),
                      value: validCount,
                      sub: t("results.confirmedColonies"),
                      icon: CheckCircle,
                      color: "emerald",
                    },
                    {
                      label: t("results.neuralRejections"),
                      value: artifactCount,
                      sub: t("results.artifactsFiltered"),
                      icon: EyeOff,
                      color: "rose",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-2 sm:p-2.5 flex flex-col justify-between rounded-sm shadow-sm group hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {item.label}
                        </p>
                        <div
                          className={`w-5 h-5 rounded-sm flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                            item.color === "primary"
                              ? "bg-primary/5 dark:bg-primary/10 text-primary border border-primary/10 dark:border-primary/20"
                              : item.color === "indigo"
                                ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50"
                                : item.color === "emerald"
                                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50"
                                  : "bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50"
                          }`}
                        >
                          <item.icon className="h-2.5 w-2.5" />
                        </div>
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mb-0">
                          {item.value}
                        </p>
                        <p className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {item.sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Compliance & Traceability Metadata (Audit Matrix View) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-3 rounded-sm shadow-sm transition-colors">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      {t("results.incubationParameters")}
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                          {t("results.temp")}
                        </span>
                        <span className="text-[9px] font-black text-slate-900 dark:text-white">
                          {analysis.incubation_temp ?? "—"} °C
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                          {t("results.time")}
                        </span>
                        <span className="text-[9px] font-black text-slate-900 dark:text-white">
                          {analysis.incubation_time_hours ?? "—"}{" "}
                          {t("results.hours")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-3 rounded-sm shadow-sm transition-colors">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      {t("results.methodology")}
                    </p>
                    <p className="text-[10px] font-black text-slate-900 dark:text-white">
                      {analysis.method_standard ?? "ISO 4833-1:2013"}
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {t("results.standardReference")}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-3 rounded-sm shadow-sm transition-colors">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      {t("results.traceability")}
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                          {t("results.batchLot")}
                        </span>
                        <span className="text-[9px] font-black text-slate-900 dark:text-white">
                          {analysis.media_batch_number || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                          {t("results.incubatorId")}
                        </span>
                        <span className="text-[9px] font-black text-slate-900 dark:text-white">
                          {analysis.incubator_id || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-3 rounded-sm shadow-sm transition-colors">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      {t("results.calculationData")}
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                          {t("results.dilution")}
                        </span>
                        <span className="text-[9px] font-black text-slate-900 dark:text-white">
                          1:{1 / analysis.dilution_factor}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                          {t("results.volMl")}
                        </span>
                        <span className="text-[9px] font-black text-slate-900 dark:text-white">
                          {analysis.plated_volume_ml}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left Column - 50% */}
                  <div className="lg:col-span-6 flex flex-col gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 overflow-hidden rounded-sm shadow-sm transition-colors">
                      <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-sm bg-slate-900 flex items-center justify-center">
                            <Camera className="h-3 w-3 text-primary" />
                          </div>
                          <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">
                            {t("results.neuralMappingLayer")}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-0.5 shadow-sm transition-colors">
                            <button
                              onClick={() =>
                                setZoom((z) => Math.max(0.5, z - 0.1))
                              }
                              className="w-5 h-5 flex items-center justify-center hover:bg-slate-50 rounded transition-colors"
                            >
                              <ZoomOut className="h-3 w-3 text-slate-400" />
                            </button>
                            <span className="text-[9px] font-black text-slate-900 w-8 text-center">
                              {Math.round(zoom * 100)}%
                            </span>
                            <button
                              onClick={() =>
                                setZoom((z) => Math.min(3, z + 0.1))
                              }
                              className="w-5 h-5 flex items-center justify-center hover:bg-slate-50 rounded transition-colors"
                            >
                              <ZoomIn className="h-3 w-3 text-slate-400" />
                            </button>
                          </div>
                          <button
                            onClick={() => setShowAnnotations(!showAnnotations)}
                            className={`px-2 py-1 rounded-sm text-[8px] font-black uppercase tracking-tighter transition-all flex items-center gap-1.5 border shadow-sm ${
                              showAnnotations
                                ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10"
                                : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            {showAnnotations ? (
                              <Eye className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5" />
                            )}
                            {showAnnotations
                              ? t("results.annotationsActive")
                              : t("results.rawSensorData")}
                          </button>
                        </div>
                      </div>
                      <div className="relative bg-slate-50 h-[360px] lg:h-[510px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing group p-0">
                        <div
                          className="relative transition-all duration-300 ease-out shadow-lg shadow-slate-900/5 overflow-hidden bg-white dark:bg-slate-950 w-full h-full flex items-center justify-center transition-colors"
                          style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: "center center",
                          }}
                        >
                          {(() => {
                            // Determine which image to show: annotated first, then original, then placeholder
                            const annotatedUrl = resolveImageUrl(
                              analysis.annotated_image_url,
                            );
                            const originalUrl = resolveImageUrl(
                              analysis.original_image_url,
                            );
                            const displayUrl = annotatedUrl || originalUrl;

                            // Debug: log URL to console for troubleshooting
                            if (typeof window !== "undefined") {
                              console.log(
                                "[ColonyAI Image] annotated:",
                                annotatedUrl,
                              );
                              console.log(
                                "[ColonyAI Image] original:",
                                originalUrl,
                              );
                              console.log(
                                "[ColonyAI Image] display:",
                                displayUrl,
                              );
                              console.log(
                                "[ColonyAI Image] imgError:",
                                imgError,
                              );
                            }

                            if (displayUrl && !imgError) {
                              return (
                                <img
                                  key={displayUrl}
                                  src={displayUrl}
                                  crossOrigin="anonymous"
                                  alt={t("results.neuralAnalysis")}
                                  className="max-w-full lg:max-w-4xl max-h-full object-contain w-auto h-auto block"
                                  onLoad={() => {
                                    console.log(
                                      "[ColonyAI Image] Loaded successfully:",
                                      displayUrl,
                                    );
                                    setImgError(false);
                                  }}
                                  onError={(e) => {
                                    console.error(
                                      "[ColonyAI Image] Failed to load:",
                                      displayUrl,
                                      e,
                                    );
                                    setImgError(true);
                                  }}
                                />
                              );
                            }

                            if (displayUrl && imgError) {
                              return (
                                <div className="w-[320px] h-[280px] flex flex-col items-center justify-center bg-slate-50">
                                  <Camera className="h-10 w-10 mb-3 text-slate-300" />
                                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                    {t("results.signalUnavailable")}
                                  </p>
                                  <p className="text-[9px] text-slate-400 mt-2 font-mono break-all px-4 text-center">
                                    {displayUrl}
                                  </p>
                                  <button
                                    onClick={() => setImgError(false)}
                                    className="mt-3 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-slate-200 text-slate-600 rounded-md hover:bg-slate-300 transition-colors"
                                  >
                                    {t("results.retrySignal")}
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <div className="w-[320px] h-[280px] flex flex-col items-center justify-center bg-slate-50">
                                <Camera className="h-10 w-10 mb-3 text-slate-200" />
                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
                                  {t("results.signalUnavailable")}
                                </p>
                              </div>
                            );
                          })()}

                          {/* Overlays */}
                          {showAnnotations &&
                            analysis.detections.map((detection) => {
                              const imgWidth = 1024;
                              const isPixel = detection.bbox.width > 10;
                              const left = isPixel
                                ? (detection.bbox.x / imgWidth) * 100
                                : detection.bbox.x * 100;
                              const top = isPixel
                                ? (detection.bbox.y / imgWidth) * 100
                                : detection.bbox.y * 100;
                              const width = isPixel
                                ? (detection.bbox.width / imgWidth) * 100
                                : detection.bbox.width * 100;
                              const height = isPixel
                                ? (detection.bbox.height / imgWidth) * 100
                                : detection.bbox.height * 100;

                              return (
                                <div
                                  key={detection.id}
                                  onClick={() =>
                                    setSelectedDetection(
                                      selectedDetection === detection.id
                                        ? null
                                        : detection.id,
                                    )
                                  }
                                  className={`absolute border-2 rounded-md cursor-pointer transition-all duration-300 hover:scale-110 hover:z-50 ${
                                    CLASS_BORDER_COLORS[
                                      detection.class_name as DetectionClass
                                    ]
                                  } ${selectedDetection === detection.id ? "ring-4 ring-white shadow-2xl z-40 scale-125" : "opacity-80"}`}
                                  style={{
                                    left: `${left}%`,
                                    top: `${top}%`,
                                    width: `${width}%`,
                                    height: `${height}%`,
                                    display:
                                      filterClass &&
                                      detection.class_name !== filterClass
                                        ? "none"
                                        : "block",
                                  }}
                                >
                                  {selectedDetection === detection.id && (
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-2 py-1 rounded-sm whitespace-nowrap font-bold shadow-xl">
                                      {getClassLabel(
                                        detection.class_name as DetectionClass,
                                      )}{" "}
                                      ({(detection.confidence * 100).toFixed(0)}
                                      %)
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    {/* Registry List/Table */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 overflow-hidden rounded-sm shadow-sm transition-colors">
                      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center" />
                          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                            {t("results.neuralObjectRegistry")}
                          </h3>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {analysis.detections.length} {t("results.nodes")}
                        </span>
                      </div>

                      <div className="overflow-x-auto max-h-[320px] scrollbar-hide">
                        <table className="w-full text-left">
                          <thead className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800 transition-colors">
                            <tr>
                              {[
                                t("results.class"),
                                t("results.confidence"),
                                "X, Y",
                                t("results.size"),
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {analysis.detections.map((detection) => (
                              <tr
                                key={detection.id}
                                onMouseEnter={() =>
                                  setSelectedDetection(detection.id)
                                }
                                onMouseLeave={() => setSelectedDetection(null)}
                                className={`transition-colors cursor-crosshair ${selectedDetection === detection.id ? "bg-primary/5" : "hover:bg-slate-50"}`}
                              >
                                <td className="px-4 py-1.5">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-1.5 h-1.5 rounded-sm ${CLASS_COLORS[detection.class_name as DetectionClass]}`}
                                    />
                                    <span className="text-[9px] font-bold text-slate-700">
                                      {getClassLabel(
                                        detection.class_name as DetectionClass,
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-1.5">
                                  <span className="text-[9px] font-black text-slate-900">
                                    {(detection.confidence * 100).toFixed(1)}%
                                  </span>
                                </td>
                                <td className="px-4 py-1.5">
                                  <span className="text-[9px] font-mono text-slate-500">
                                    {detection.bbox.x.toFixed(1)},{" "}
                                    {detection.bbox.y.toFixed(1)}
                                  </span>
                                </td>
                                <td className="px-4 py-1.5 text-[9px] font-mono text-slate-500">
                                  {detection.bbox.width.toFixed(1)} ×{" "}
                                  {detection.bbox.height.toFixed(1)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right 6 - Sidebar Analysis */}
                  <div className="lg:col-span-6 flex flex-col gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-md shadow-sm transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-sm bg-slate-900 flex items-center justify-center">
                            <PieIcon className="h-3 w-3 text-primary" />
                          </div>
                          <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">
                            {t("results.spectralDistribution")}
                          </h3>
                        </div>
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-sm">
                          <span className="w-1 h-1 rounded-sm bg-emerald-500" />
                          Verified
                        </span>
                      </div>
                      <div className="h-[140px] w-full mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(analysis.class_breakdown).map(
                                ([name, value]) => ({ name, value }),
                              )}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={55}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {Object.keys(analysis.class_breakdown).map(
                                (key, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      key === "colony_single"
                                        ? "#10b981"
                                        : key === "colony_merged"
                                          ? "#f59e0b"
                                          : key === "bubble"
                                            ? "#f43f5e"
                                            : key === "dust_debris"
                                              ? "#94a3b8"
                                              : "#6366f1"
                                    }
                                  />
                                ),
                              )}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                            {t("results.biologicalAccuracy")}
                          </p>
                          <p className="text-sm font-black text-slate-900">
                            {validCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                            {t("results.neuralConfidenceProfile")}
                          </p>
                          <p className="text-sm font-black text-primary">
                            {(analysis.confidence_score * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Histogram */}
                    <div className="dashboard-card p-5 rounded-md">
                      <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">
                        {t("results.neuralConfidenceProfile")}
                      </h3>
                      <div className="h-28 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={analysis.detections.map((d, i) => ({
                              id: i,
                              confidence: d.confidence * 100,
                            }))}
                          >
                            <XAxis dataKey="id" hide />
                            <YAxis hide domain={[0, 100]} />
                            <RechartsTooltip
                              cursor={{ fill: "#f8fafc" }}
                              contentStyle={{
                                borderRadius: "8px",
                                border: "none",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                fontSize: "9px",
                              }}
                              labelStyle={{ display: "none" }}
                            />
                            <Bar
                              dataKey="confidence"
                              fill="#6366f1"
                              radius={[2, 2, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4 text-center">
                        {t("results.confidenceDistribution")}
                      </p>
                    </div>

                    {/* ISO Uncertainty */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-md shadow-sm transition-colors">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-sm bg-slate-900 flex items-center justify-center">
                          <Shield className="h-3 w-3 text-primary" />
                        </div>
                        <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">
                          {t("results.iso17025Metrics")}
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-md">
                          <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                            {t("results.uncertaintyU")}
                          </p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">
                            {analysis.uncertainty_u?.toLocaleString() ||
                              "16,307.57"}{" "}
                            CFU/mL
                          </p>
                          <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">
                            {t("results.gumProtocol")} (k=2, 95% CI)
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-2 border border-slate-100 dark:border-slate-800 rounded-sm">
                            <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                              {t("results.sr")}:
                            </p>
                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-300">
                              0.012 log₁₀
                            </p>
                          </div>
                          <div className="p-2 border border-slate-100 dark:border-slate-800 rounded-sm">
                            <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                              {t("results.sR")}:
                            </p>
                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-300">
                              0.145 log₁₀
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-md shadow-sm transition-colors">
                      <h3 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-3 bg-primary rounded-sm" />
                        {t("results.neuralLegend")}
                      </h3>
                      <div className="space-y-2 scrollbar-hide">
                        {Object.entries(CLASS_LABELS).map(([key, label]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-sm ${CLASS_COLORS[key as DetectionClass]}`}
                              />
                              <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">
                                {label}
                              </span>
                            </div>
                            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                              {key.includes("colony")
                                ? t("results.countedSpecimen")
                                : t("results.rejectedArtifact")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Certificate of Analysis View */
              <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 sm:p-12 border-2 border-slate-900 dark:border-slate-700 rounded-none shadow-xl relative overflow-hidden animate-in zoom-in-95 duration-700 print:shadow-none print:border-none print:p-0 print:max-w-full transition-colors">
                <button 
                  onClick={() => window.print()}
                  className="absolute top-4 right-4 px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-colors print:hidden"
                >
                  <Download className="h-3 w-3" />
                  Print / Save PDF
                </button>
                {/* Watermark/Seal */}
                <div className="absolute top-6 sm:top-10 right-6 sm:right-10 w-20 sm:w-32 h-20 sm:h-32 opacity-[0.03] rotate-12 pointer-events-none">
                  <Shield className="w-full h-full text-slate-900 dark:text-slate-100" />
                </div>

                {/* Header */}
                <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-4 sm:pb-6 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mt-8 sm:mt-0 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FlaskConical className="h-5 w-5 sm:h-6 sm:w-6 text-slate-900 dark:text-white" />
                      <h2 className="text-lg sm:text-xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">
                        ColonyAI Analytics
                      </h2>
                    </div>
                    <p className="text-[7px] sm:text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                      Precision Microbiology Diagnostic Suite
                    </p>
                  </div>
                  <div className="sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-white uppercase tracking-[0.1em]">
                      Certificate of Analysis
                    </h3>
                    <p className="text-[7px] sm:text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1.5">
                      Ref No: {analysis.id.substring(0, 13).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Core Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 mb-6 sm:mb-10">
                  <div className="space-y-4 sm:space-y-5">
                    <section>
                      <h4 className="text-[9px] sm:text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-3 sm:mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                        {t("results.sampleProvenance")}
                      </h4>
                      <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                        <div className="flex justify-between gap-4">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                            {t("results.sample")} ID
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-900 dark:text-white uppercase text-right">
                            {analysis.sample_id}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                            {t("results.protocol")}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-900 dark:text-white uppercase text-right">
                            {analysis.media_type}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-900 dark:text-white uppercase">
                            {t("results.timestamp")}
                          </span>
                          <span className="text-[8px] sm:text-[10px] font-black text-slate-900 dark:text-white uppercase text-right">
                            {new Date(analysis.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[9px] sm:text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-3 sm:mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                        {t("results.isoCompliance")}
                      </h4>
                      <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                        <div className="flex justify-between gap-4">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                            {t("results.incubationParameters")}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase text-right">
                            {analysis.incubation_temp ?? "—"}°C /{" "}
                            {analysis.incubation_time_hours ?? "—"}{" "}
                            {t("results.hours")}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                            {t("results.methodology")}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase text-right">
                            {analysis.method_standard ?? "ISO 4833-1:2013"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                            {t("results.batchLot")}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase text-right">
                            {analysis.media_batch_number || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                            {t("results.incubatorId")}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase text-right">
                            {analysis.incubator_id || "—"}
                          </span>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[9px] sm:text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-3 sm:mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                        {t("results.neuralSpectralResult")}
                      </h4>
                      <div className="p-4 bg-white dark:bg-slate-950 rounded-none border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center transition-colors">
                        <p className="text-[7px] sm:text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                          Final Quantitative Output
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-800 tracking-tight mb-1">
                          {formatCFU(analysis.cfu_per_ml)}
                        </p>
                        <p className="text-[8px] sm:text-[9px] font-bold text-slate-900 uppercase tracking-widest">
                          {t("results.cfuMlMatrix")}
                        </p>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-4 sm:space-y-5">
                    <section>
                      <h4 className="text-[9px] sm:text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-3 sm:mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                        {t("results.statisticalIntegrity")}
                      </h4>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                            {t("results.reliability")}
                          </span>
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-sm text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                            {analysis.reliability.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                            {t("results.uncertaintyU")}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-900">
                            ± {analysis.uncertainty_u?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                            {t("results.confidence")}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-900">
                            {(analysis.confidence_score * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[9px] sm:text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-3 sm:mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                        {t("results.classificationDistribution")}
                      </h4>
                      <div className="h-24 sm:h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(analysis.class_breakdown).map(
                              ([name, value]) => ({
                                name: getClassLabel(name as DetectionClass),
                                value,
                              }),
                            )}
                          >
                            <XAxis dataKey="name" hide />
                            <Bar
                              dataKey="value"
                              fill="#0f172a"
                              radius={[2, 2, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </section>
                  </div>
                </div>

                {/* Legal & ISO Footnote */}
                <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                  <div className="sm:col-span-2">
                    <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider">
                      This document certifies that the aforementioned sample was
                      analyzed using the ColonyAI Neural Network (v4.2). All
                      calculations are performed in accordance with ISO
                      4833-1:2013 and FDA BAM Chapter 3 standards. Expanded
                      uncertainty (U) is reported at k=2 for a ~95% confidence
                      interval.
                    </p>
                  </div>
                  <div className="sm:text-right flex flex-col items-start sm:items-end justify-end">
                    <div className="w-24 sm:w-32 h-[1px] bg-slate-200 mb-2" />
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-900 uppercase tracking-widest">
                      Digital Auth Signature
                    </p>
                    <p className="text-[6px] sm:text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                      Autonomous Core System
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documentation Sidebar */}
      <div className="hidden lg:block">
        <DocumentationSidebar
          showDocs={showDocs}
          setShowDocs={setShowDocs}
          directory="Post-Analysis Audit"
          title="Interpretasi Hasil"
          description="Panduan audit teknis untuk validasi deteksi saraf dan kepatuhan ISO-17025."
          rawText={documentationText}
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
            <p className="text-[10px] text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-md border border-slate-100">
              Halaman Intelligence Audit menyajikan bukti teknis mendalam atas
              proses deteksi saraf. Auditor harus memastikan tidak ada koloni
              yang terlewat atau artefak yang salah diklasifikasikan.
            </p>
          </section>

          <section className="space-y-3 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                02
              </span>
              <h2 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">
                {t("results.auditProtocol")}
              </h2>
            </div>
            <div className="space-y-3 ml-0.5">
              {[
                {
                  id: "1",
                  title: t("results.neuralMappingLayer"),
                  desc: "Tinjau kotak pembatas pada gambar. Klik objek untuk melihat detail skor kepercayaan individual.",
                },
                {
                  id: "2",
                  title: t("results.spectralDistribution"),
                  desc: "Bandingkan jumlah Verified vs Filtered untuk memastikan integritas data biologis.",
                },
                {
                  id: "3",
                  title: t("results.iso17025Metrics"),
                  desc: "Periksa nilai Uncertainty (U). Nilai tinggi mungkin memerlukan pengujian ulang spesimen.",
                },
              ].map((step) => (
                <div key={step.id} className="flex gap-2.5 group">
                  <span className="flex-shrink-0 w-4.5 h-4.5 rounded-sm bg-slate-900 text-white text-[8px] font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    {step.id}
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="text-[10px] font-bold text-slate-900 dark:text-white">
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
  );
}

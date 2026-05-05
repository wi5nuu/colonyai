"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
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
  BarChart3,
  FlaskConical,
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
  // Already absolute URL
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Relative path - prepend API_URL
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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
    bg: "bg-emerald-100 text-emerald-700",
    text: "text-emerald-700",
    label: "Completed",
  },
  processing: {
    bg: "bg-blue-100 text-blue-700",
    text: "text-blue-700",
    label: "Processing",
  },
  failed: {
    bg: "bg-rose-100 text-rose-700",
    text: "text-rose-700",
    label: "Failed",
  },
  pending: {
    bg: "bg-amber-100 text-amber-700",
    text: "text-amber-700",
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
  const [selectedDetection, setSelectedDetection] = useState<string | null>(
    null,
  );
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [filterClass, setFilterClass] = useState<DetectionClass | null>(null);
  const [viewMode, setViewMode] = useState<"audit" | "certificate">("audit");
  const [showDocs, setShowDocs] = useState(true);
  const [imgError, setImgError] = useState(false);

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

  const validCount =
    (analysis.class_breakdown.colony_single || 0) +
    (analysis.class_breakdown.colony_merged || 0);
  const artifactCount =
    (analysis.class_breakdown.bubble || 0) +
    (analysis.class_breakdown.dust_debris || 0) +
    (analysis.class_breakdown.media_crack || 0);
  const totalCount = Object.values(analysis.class_breakdown).reduce(
    (a, b) => a + b,
    0,
  );
  const statusInfo = STATUS_COLORS[analysis.status] || STATUS_COLORS.pending;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 ${showDocs ? "lg:mr-[350px]" : ""}`}
        >
          <div className="max-w-[1500px] mx-auto px-4 sm:px-8 py-0 sm:py-0">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-100 mb-8 sm:mb-10">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard/history"
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm group"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                </Link>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">
                      {t("results.title")}
                    </h1>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                        analysis.status === "completed"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-black uppercase tracking-[0.3em] flex items-center gap-3">
                    <span>
                      {t("results.sample")}:{" "}
                      <span className="text-slate-900">
                        {analysis.sample_id}
                      </span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span>
                      {t("results.protocol")}:{" "}
                      <span className="text-slate-900">
                        {analysis.media_type}
                      </span>
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="hidden lg:block">
                  <DocumentationToggle
                    showDocs={showDocs}
                    setShowDocs={setShowDocs}
                    text={t("results.auditProtocol")}
                  />
                </div>
                <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setViewMode("audit")}
                    className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "audit" ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" : "text-slate-400 hover:text-slate-900"}`}
                  >
                    {t("results.auditMatrix")}
                  </button>
                  <button
                    onClick={() => setViewMode("certificate")}
                    className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "certificate" ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-slate-400 hover:text-slate-900"}`}
                  >
                    {t("results.certificate")}
                  </button>
                </div>
                <button
                  onClick={handleExportPdf}
                  className="px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  {t("results.exportProtocol")}
                </button>
                {analysis.status === "completed" && canApprove && (
                  <button
                    onClick={handleApprove}
                    className={`px-6 py-3.5 flex items-center justify-center gap-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${
                      analysis.is_valid_for_reporting
                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                        : "bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800 active:scale-95"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
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
                <div className="bg-rose-50/50 border-2 border-rose-100 p-4 rounded-xl flex items-start gap-4 mb-8">
                  <div className="p-2.5 bg-rose-500 rounded-lg shadow-lg shadow-rose-200 flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1.5">
                      {t("results.neuralSensitivityAdvisory")}
                    </p>
                    <ul className="text-xs text-rose-700/80 font-bold space-y-1">
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

            {viewMode === "audit" ? (
              <>
                {/* Summary Matrix */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                      icon: BarChart3,
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
                      className="bg-white border border-slate-200/60 p-4 flex flex-col justify-between rounded-xl shadow-sm group hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {item.label}
                        </p>
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                            item.color === "primary"
                              ? "bg-primary/5 text-primary border border-primary/10"
                              : item.color === "indigo"
                                ? "bg-indigo-50 text-indigo-500 border border-indigo-100"
                                : item.color === "emerald"
                                  ? "bg-emerald-50 text-emerald-500 border border-emerald-100"
                                  : "bg-rose-50 text-rose-500 border border-rose-100"
                          }`}
                        >
                          <item.icon className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-slate-900 tracking-tight mb-0.5">
                          {item.value}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {item.sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Compliance & Traceability Metadata (Audit Matrix View) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                      {t("results.incubationParameters")}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {t("results.temp")}
                        </span>
                        <span className="text-[10px] font-black text-slate-900">
                          {analysis.incubation_temp ?? "—"} °C
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">
                          {t("results.time")}
                        </span>
                        <span className="text-[11px] font-black text-slate-900">
                          {analysis.incubation_time_hours ?? "—"}{" "}
                          {t("results.hours")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                      {t("results.methodology")}
                    </p>
                    <p className="text-[11px] font-black text-slate-900">
                      {analysis.method_standard ?? "ISO 4833-1:2013"}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {t("results.standardReference")}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                      {t("results.traceability")}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {t("results.batchLot")}
                        </span>
                        <span className="text-[10px] font-black text-slate-900">
                          {analysis.media_batch_number || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {t("results.incubatorId")}
                        </span>
                        <span className="text-[10px] font-black text-slate-900">
                          {analysis.incubator_id || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                      {t("results.calculationData")}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {t("results.dilution")}
                        </span>
                        <span className="text-[10px] font-black text-slate-900">
                          1:{1 / analysis.dilution_factor}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {t("results.volMl")}
                        </span>
                        <span className="text-[10px] font-black text-slate-900">
                          {analysis.plated_volume_ml}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Visualizer - Left 8 */}
                  <div className="lg:col-span-8 flex flex-col gap-4">
                    <div className="bg-white border border-slate-200/60 overflow-hidden rounded-xl shadow-sm">
                      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
                            <Camera className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                            {t("results.neuralMappingLayer")}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                            <button
                              onClick={() =>
                                setZoom((z) => Math.max(0.5, z - 0.1))
                              }
                              className="w-6 h-6 flex items-center justify-center hover:bg-slate-50 rounded-md transition-colors"
                            >
                              <ZoomOut className="h-3.5 w-3.5 text-slate-400" />
                            </button>
                            <span className="text-[10px] font-black text-slate-900 w-10 text-center">
                              {Math.round(zoom * 100)}%
                            </span>
                            <button
                              onClick={() =>
                                setZoom((z) => Math.min(3, z + 0.1))
                              }
                              className="w-6 h-6 flex items-center justify-center hover:bg-slate-50 rounded-md transition-colors"
                            >
                              <ZoomIn className="h-3.5 w-3.5 text-slate-400" />
                            </button>
                          </div>
                          <button
                            onClick={() => setShowAnnotations(!showAnnotations)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border shadow-sm ${
                              showAnnotations
                                ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20"
                                : "bg-white text-slate-400 border-slate-200 hover:text-slate-900"
                            }`}
                          >
                            {showAnnotations ? (
                              <Eye className="h-4 w-4 text-primary" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                            {showAnnotations
                              ? t("results.annotationsActive")
                              : t("results.rawSensorData")}
                          </button>
                        </div>
                      </div>
                      <div className="relative bg-slate-100/50 min-h-[260px] sm:min-h-[380px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing group">
                        <div
                          className="relative transition-all duration-500 ease-out shadow-xl shadow-slate-900/10 rounded-2xl overflow-hidden bg-white"
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
                              // Add cache-busting timestamp to force browser reload
                              const cacheBustedUrl = `${displayUrl}${displayUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;
                              return (
                                <img
                                  key={cacheBustedUrl}
                                  src={cacheBustedUrl}
                                  alt={t("results.neuralAnalysis")}
                                  className="max-w-full sm:max-w-[480px] w-auto h-auto block"
                                  onLoad={() => {
                                    console.log(
                                      "[ColonyAI Image] Loaded successfully:",
                                      cacheBustedUrl,
                                    );
                                    setImgError(false);
                                  }}
                                  onError={(e) => {
                                    console.error(
                                      "[ColonyAI Image] Failed to load:",
                                      cacheBustedUrl,
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
                                    className="mt-3 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
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
                                  className={`absolute border-2 rounded-lg cursor-pointer transition-all duration-300 hover:scale-110 hover:z-50 ${
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
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-2 py-1 rounded-full whitespace-nowrap font-bold shadow-xl">
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
                    <div className="bg-white border border-slate-200/60 overflow-hidden rounded-xl shadow-sm">
                      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
                            <BarChart3 className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                            {t("results.neuralObjectRegistry")}
                          </h3>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {analysis.detections.length} {t("results.nodes")}
                        </span>
                      </div>

                      <div className="overflow-x-auto max-h-[320px]">
                        <table className="w-full text-left">
                          <thead className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100">
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
                          <tbody className="divide-y divide-slate-50">
                            {analysis.detections
                              .filter(
                                (d) =>
                                  !filterClass || d.class_name === filterClass,
                              )
                              .map((detection) => (
                                <tr
                                  key={detection.id}
                                  className={`hover:bg-slate-50/80 cursor-pointer transition-all ${selectedDetection === detection.id ? "bg-primary/5" : ""}`}
                                  onClick={() =>
                                    setSelectedDetection(detection.id)
                                  }
                                >
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-2.5 h-2.5 rounded-full ${CLASS_COLORS[detection.class_name as DetectionClass]} flex-shrink-0`}
                                      />
                                      <span className="text-[11px] font-bold text-slate-700">
                                        {getClassLabel(
                                          detection.class_name as DetectionClass,
                                        )}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className="bg-primary h-full rounded-full transition-all duration-1000"
                                          style={{
                                            width: `${detection.confidence * 100}%`,
                                          }}
                                        />
                                      </div>
                                      <span className="text-[10px] font-black text-slate-900 font-mono">
                                        {(detection.confidence * 100).toFixed(
                                          1,
                                        )}
                                        %
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-[10px] font-bold text-slate-400 font-mono">
                                    {detection.bbox.x.toFixed(1)},{" "}
                                    {detection.bbox.y.toFixed(1)}
                                  </td>
                                  <td className="px-4 py-3 text-[10px] font-bold text-slate-400 font-mono">
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

                  {/* Right 4 - Sidebar Analysis */}
                  <div className="lg:col-span-4 flex flex-col gap-4">
                    {/* 5-Class Visual Breakdown */}
                    <div className="dashboard-card p-5 flex flex-col">
                      <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">
                        {t("results.spectralDistribution")}
                      </h3>
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-full h-36">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  {
                                    name: t("results.verified"),
                                    value: validCount,
                                    color: "#10b981",
                                  },
                                  {
                                    name: t("results.filtered"),
                                    value: artifactCount,
                                    color: "#f43f5e",
                                  },
                                ]}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {[
                                  {
                                    name: t("results.verified"),
                                    color: "#10b981",
                                  },
                                  {
                                    name: t("results.filtered"),
                                    color: "#f43f5e",
                                  },
                                ].map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="none"
                                  />
                                ))}
                              </Pie>
                              <RechartsTooltip
                                contentStyle={{
                                  borderRadius: "12px",
                                  border: "none",
                                  boxShadow:
                                    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full mt-6">
                          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                              {t("results.verified")}
                            </p>
                            <p className="text-xl font-black text-emerald-900">
                              {validCount}
                            </p>
                          </div>
                          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-center">
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">
                              {t("results.filtered")}
                            </p>
                            <p className="text-xl font-black text-rose-900">
                              {artifactCount}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-50 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {t("results.biologicalAccuracy")}
                          </span>
                          <span className="text-lg font-black text-emerald-500">
                            {(analysis.confidence_score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Histogram */}
                    <div className="dashboard-card p-5">
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
                    <div className="dashboard-card p-5 bg-slate-900 text-white shadow-lg shadow-slate-900/20">
                      <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 text-white/60 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        {t("results.iso17025Metrics")}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">
                            {t("results.uncertaintyU")}
                          </p>
                          <p className="text-2xl font-black">
                            {analysis.uncertainty_u?.toLocaleString() || "0.00"}{" "}
                            <span className="text-xs text-white/40">
                              CFU/mL
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse flex-shrink-0" />
                          <div className="flex flex-col">
                            <p className="text-[9px] font-bold text-white/60 leading-relaxed uppercase tracking-wider">
                              {t("results.gumProtocol")}
                            </p>
                            <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 opacity-40">
                              <span className="text-[7px] uppercase font-black tracking-widest">
                                Sr:
                              </span>
                              <span className="text-[7px] font-mono">
                                0.012 log₁₀
                              </span>
                              <span className="text-[7px] uppercase font-black tracking-widest">
                                SR:
                              </span>
                              <span className="text-[7px] font-mono">
                                0.145 log₁₀
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Legend Quick Reference */}
                    <div className="dashboard-card p-5">
                      <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">
                        {t("results.neuralLegend")}
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {(Object.keys(CLASS_LABELS) as DetectionClass[]).map(
                          (cls) => (
                            <div
                              key={cls}
                              onClick={() =>
                                setFilterClass(filterClass === cls ? null : cls)
                              }
                              className={`flex items-center gap-4 group cursor-pointer p-2 rounded-xl transition-all ${filterClass === cls ? "bg-slate-900 text-white shadow-lg" : "hover:bg-slate-50"}`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg ${CLASS_COLORS[cls]} bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform`}
                              >
                                <div
                                  className={`w-2.5 h-2.5 rounded-full ${CLASS_COLORS[cls]} shadow-sm shadow-black/10`}
                                />
                              </div>
                              <div>
                                <p
                                  className={`text-[11px] font-bold ${filterClass === cls ? "text-white" : "text-slate-700"}`}
                                >
                                  {getClassLabel(cls)}
                                </p>
                                <p
                                  className={`text-[8px] font-black uppercase tracking-widest ${filterClass === cls ? "text-primary/70" : "text-slate-400"}`}
                                >
                                  {cls.includes("colony")
                                    ? t("results.countedSpecimen")
                                    : t("results.rejectedArtifact")}
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Certificate of Analysis View */
              <div className="max-w-4xl mx-auto bg-white p-6 sm:p-12 lg:p-20 rounded-[2rem] sm:rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-slate-50 relative overflow-hidden animate-in zoom-in-95 duration-700">
                {/* Watermark/Seal */}
                <div className="absolute top-6 sm:top-10 right-6 sm:right-10 w-20 sm:w-32 h-20 sm:h-32 opacity-[0.03] rotate-12 pointer-events-none">
                  <Shield className="w-full h-full text-slate-900" />
                </div>

                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-6 sm:pb-10 mb-8 sm:mb-12 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                      <FlaskConical className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      <h2 className="text-xl sm:text-3xl font-black tracking-tighter uppercase">
                        ColonyAI <span className="text-primary">Analytics</span>
                      </h2>
                    </div>
                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                      Precision Microbiology Diagnostic Suite
                    </p>
                  </div>
                  <div className="sm:text-right border-t sm:border-t-0 pt-6 sm:pt-0 border-slate-100">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                      Certificate of Analysis
                    </h3>
                    <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Ref No: {analysis.id.substring(0, 13).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Core Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-16 mb-10 sm:mb-16">
                  <div className="space-y-6 sm:space-y-8">
                    <section>
                      <h4 className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3 sm:mb-4 border-b border-slate-100 pb-2">
                        Sample Provenance
                      </h4>
                      <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                        <div className="flex justify-between gap-4">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                            Sample ID
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase text-right">
                            {analysis.sample_id}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                            {t("results.protocol")}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase text-right">
                            {analysis.media_type}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase">
                            Timestamp
                          </span>
                          <span className="text-[8px] sm:text-[10px] font-black text-slate-900 uppercase text-right">
                            {new Date(analysis.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3 sm:mb-4 border-b border-slate-100 pb-2">
                        ISO Compliance & Traceability
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
                      <h4 className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3 sm:mb-4 border-b border-slate-100 pb-2">
                        Neural Spectral Result
                      </h4>
                      <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center">
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">
                          Final Quantitative Output
                        </p>
                        <p className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter mb-1">
                          {formatCFU(analysis.cfu_per_ml)}
                        </p>
                        <p className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest">
                          {t("results.cfuMlMatrix")}
                        </p>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6 sm:space-y-8">
                    <section>
                      <h4 className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3 sm:mb-4 border-b border-slate-100 pb-2">
                        Statistical Integrity
                      </h4>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                            {t("results.reliability")}
                          </span>
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-emerald-100">
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
                      <h4 className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3 sm:mb-4 border-b border-slate-100 pb-2">
                        Classification Distribution
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
                              fill="#6366f1"
                              radius={[3, 3, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </section>
                  </div>
                </div>

                {/* Legal & ISO Footnote */}
                <div className="mt-10 sm:mt-20 pt-8 sm:pt-10 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
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
          rawText={`INTERPRETASI HASIL AUDIT COLONYAI
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
MESIN: YOLOv8 SENSITIVE NODE`}
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
              <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">
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
  );
}

"use client";

import { useState, useCallback, useMemo } from "react";
import {
  X,
  Check,
  Save,
  ClipboardList,
  ZoomIn,
  ZoomOut,
  PanelRight,
} from "lucide-react";
import { toast } from "sonner";
import { analysesApi } from "@/lib/analyses-api";
import {
  Analysis,
  DetectionClass,
  CorrectionSession,
} from "@/lib/types";
import {
  CLASS_VISUAL_STYLES,
  ALL_DETECTION_CLASSES,
} from "@/lib/detection-styles";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const CLASS_OPTIONS: { value: string; label: string; color: string }[] = [
  ...ALL_DETECTION_CLASSES.map((cls) => ({
    value: cls,
    label: `${CLASS_VISUAL_STYLES[cls].labelPrefix} ${CLASS_VISUAL_STYLES[cls].labelEn}`,
    color: CLASS_VISUAL_STYLES[cls].color,
  })),
  { value: "removed", label: "✕ Remove (False Positive)", color: "#6b7280" },
];

function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  let path = url;
  if (url.includes("/uploads/")) {
    path = "/uploads/" + url.split("/uploads/")[1];
  }
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

interface CorrectionCanvasProps {
  analysis: Analysis;
  onClose: () => void;
  onComplete?: (session: CorrectionSession) => void;
}

export default function CorrectionCanvas({
  analysis,
  onClose,
  onComplete,
}: CorrectionCanvasProps) {
  const [session, setSession] = useState<CorrectionSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDetection, setSelectedDetection] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [correctionMap, setCorrectionMap] = useState<
    Record<string, { detectionId: string | null; origClass: string | null; newClass: string }>
  >({});

  const imageUrl = resolveImageUrl(
    analysis.annotated_image_url || analysis.original_image_url,
  );

  const startSession = useCallback(async () => {
    setLoading(true);
    try {
      const s = await analysesApi.startCorrectionSession(analysis.id);
      setSession(s);
      toast.success("Correction session started");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || "Failed to start session");
    } finally {
      setLoading(false);
    }
  }, [analysis.id]);

  const handleClassChange = useCallback(
    async (detectionId: string, oldClass: string | null, newClass: string) => {
      if (!session) return;
      try {
        const updated = await analysesApi.saveCorrection(analysis.id, {
          detection_id: detectionId,
          original_class: oldClass,
          corrected_class: newClass,
        });
        setSession(updated);
        setCorrectionMap((prev) => ({
          ...prev,
          [detectionId]: { detectionId, origClass: oldClass, newClass },
        }));
        toast.success(`Corrected to ${newClass}`);
      } catch {
        toast.error("Failed to save correction");
      }
    },
    [session, analysis.id],
  );

  const finishSession = useCallback(async () => {
    setLoading(true);
    try {
      const s = await analysesApi.finishCorrectionSession(analysis.id);
      setSession(s);
      toast.success(
        `Session complete! Accuracy: ${((s.accuracy ?? 0) * 100).toFixed(1)}%`,
      );
      onComplete?.(s);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || "Failed to finish session");
    } finally {
      setLoading(false);
    }
  }, [analysis.id, onComplete]);

  const correctedIds = useMemo(
    () => new Set(Object.keys(correctionMap)),
    [correctionMap],
  );

  return (
    <div className="fixed top-14 inset-x-0 bottom-0 z-[60] bg-white dark:bg-slate-950 flex flex-col">
      {/* ── Ultra-minimal Header Bar ── */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0 h-9">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Correction Canvas
          </span>
          {session && (
            <span className="text-[9px] text-slate-400 font-medium ml-2">
              {session.total_corrections} saved
              {session.accuracy !== null &&
                ` · ${(session.accuracy * 100).toFixed(1)}%`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
            className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-none"
          >
            <ZoomOut className="w-3 h-3 text-slate-500" />
          </button>
          <span className="text-[9px] font-bold text-slate-400 w-8 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
            className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-none"
          >
            <ZoomIn className="w-3 h-3 text-slate-500" />
          </button>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

          {!session ? (
            <button
              onClick={startSession}
              disabled={loading}
              className="text-[8px] font-black uppercase tracking-widest bg-emerald-500 text-white px-2 py-1 hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Start Review"}
            </button>
          ) : (
            <button
              onClick={finishSession}
              disabled={loading || session.corrections.length === 0}
              className="text-[8px] font-black uppercase tracking-widest bg-[#1a237e] text-white px-2 py-1 hover:bg-[#0d1555] transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Save className="w-2.5 h-2.5" />
              {loading ? "..." : "Finish"}
            </button>
          )}

          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-none ${sidebarOpen ? "bg-slate-100 dark:bg-slate-800" : ""}`}
            title="Toggle sidebar"
          >
            <PanelRight className="w-3 h-3 text-slate-500" />
          </button>

          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-none text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Main Area: Image + optional Sidebar ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Image Canvas */}
        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 flex items-start justify-center p-4">
          {!imageUrl ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
              No image available
            </div>
          ) : (
            <div
              className="relative inline-block"
              style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
            >
              <img
                src={imageUrl}
                alt="Analysis"
                className="block max-w-none"
                draggable={false}
              />

              {session &&
                (analysis.detections ?? []).map((detection) => {
                  const isCorrected = correctedIds.has(detection.id);
                  const isSelected = selectedDetection === detection.id;
                  const style =
                    CLASS_VISUAL_STYLES[
                      detection.class_name as DetectionClass
                    ] ?? CLASS_VISUAL_STYLES.dust_debris;

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
                    <div key={detection.id} className="absolute inset-0 pointer-events-none">
                      <div
                        onClick={() =>
                          setSelectedDetection(
                            isSelected ? null : detection.id,
                          )
                        }
                        className="pointer-events-auto absolute cursor-pointer transition-all duration-200 hover:z-50"
                        style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
                      >
                        <div
                          className={`w-full h-full border-2 ${
                            isCorrected ? "border-emerald-400" : isSelected ? "border-white" : ""
                          }`}
                          style={{
                            borderColor: isCorrected ? undefined : isSelected ? undefined : style.color,
                            borderStyle: style.borderStyle,
                            backgroundColor: isCorrected
                              ? "rgba(52, 211, 153, 0.15)"
                              : isSelected
                                ? "rgba(255,255,255,0.1)"
                                : `${style.color}15`,
                          }}
                        />

                        {isSelected && (
                          <div className="absolute -top-6 left-0 bg-slate-900 text-white text-[8px] px-1.5 py-0.5 whitespace-nowrap font-bold z-50 shadow-lg">
                            {style.labelEn} ({(detection.confidence * 100).toFixed(0)}%)
                          </div>
                        )}

                        {isSelected && session && (
                          <div
                            className="absolute top-full left-0 mt-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50 min-w-[180px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2 py-1 border-b border-slate-100 dark:border-slate-700">
                              Correct to:
                            </div>
                            {CLASS_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() =>
                                  handleClassChange(detection.id, detection.class_name, opt.value)
                                }
                                className={`w-full text-left text-[10px] font-medium px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors ${
                                  correctionMap[detection.id]?.newClass === opt.value
                                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                                    : "text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                <span className="w-2 h-2 rounded-none inline-block shrink-0" style={{ backgroundColor: opt.color }} />
                                <span className="truncate">{opt.label}</span>
                                {correctionMap[detection.id]?.newClass === opt.value && (
                                  <Check className="w-2.5 h-2.5 ml-auto shrink-0" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {isCorrected && !isSelected && (
                          <div className="absolute -top-4 left-0 bg-emerald-500 text-white text-[7px] px-1 py-0.5 font-bold whitespace-nowrap">
                            {correctionMap[detection.id]?.newClass ?? ""}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* ── Collapsible Sidebar ── */}
        {sidebarOpen && (
          <div className="w-56 flex-shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col overflow-y-auto">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
              <h3 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Session
              </h3>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">Detections</span>
                  <span className="text-slate-900 dark:text-white font-bold">{analysis.detections.length}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">Corrected</span>
                  <span className="text-emerald-500 font-bold">{session?.corrections.length ?? 0}</span>
                </div>
                {session?.accuracy !== null && (
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500 font-medium">Accuracy</span>
                    <span className="text-[#1a237e] dark:text-[#00f2ff] font-bold">
                      {((session?.accuracy ?? 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">
                Legend
              </h3>
              <div className="space-y-1.5">
                {ALL_DETECTION_CLASSES.map((cls) => {
                  const s = CLASS_VISUAL_STYLES[cls];
                  return (
                    <div key={cls} className="flex items-center gap-1.5 text-[10px]">
                      <span
                        className="w-2.5 h-2.5 flex-shrink-0"
                        style={{
                          backgroundColor: s.color,
                          opacity: 0.5,
                          border: `1px ${s.borderStyle} ${s.color}`,
                        }}
                      />
                      <span className="text-slate-600 dark:text-slate-400 font-medium truncate">{s.labelEn}</span>
                    </div>
                  );
                })}
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-2.5 h-2.5 flex-shrink-0 bg-red-500 opacity-50" />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Removed (FP)</span>
                </div>
              </div>
            </div>

            <div className="p-3">
              <h3 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">
                How to Use
              </h3>
              <ol className="space-y-1 text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                <li>1. Click <strong>Start Review</strong></li>
                <li>2. Click a bounding box</li>
                <li>3. Select correct class</li>
                <li>4. Click <strong>Finish</strong></li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* ── Ultra-minimal Footer ── */}
      <div className="flex items-center justify-between px-3 py-0.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0 h-6">
        <div className="flex items-center gap-2 text-[8px] text-slate-400 font-medium">
          <span>{analysis.sample_id}</span>
          <span className="w-px h-2 bg-slate-300 dark:bg-slate-700" />
          <span>{analysis.media_type}</span>
        </div>
        <span className={`text-[8px] font-bold uppercase tracking-wider ${!session ? "text-amber-500" : "text-emerald-500"}`}>
          {!session ? "Click Start Review" : `${session.corrections.length} correction(s) saved`}
        </span>
      </div>
    </div>
  );
}

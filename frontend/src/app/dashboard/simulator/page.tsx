"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslationStore } from "@/lib/i18n/store";
import {
  DocumentationSidebar,
  DocumentationToggle,
} from "@/components/DocumentationSidebar";
import {
  FlaskConical,
  Zap,
  ShieldCheck,
  Search,
  Info,
  Target,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  Beaker,
  CheckCircle2,
  ArrowRight,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface Detection {
  id: string;
  class:
    | "colony_single"
    | "colony_merged"
    | "bubble"
    | "dust_debris"
    | "media_crack";
  confidence: number;
  x: number;
  y: number;
  size: number;
}

// Sesuai 5-class model: colony_single, colony_merged, bubble, dust_debris, media_crack
const CLASS_CONFIG = {
  colony_single: {
    color: "bg-emerald-500",
    border: "border-emerald-500",
    label: "simulator.targetLabel",
    valid: true,
  },
  colony_merged: {
    color: "bg-amber-500",
    border: "border-amber-500",
    label: "simulator.targetLabel",
    valid: true,
  },
  bubble: {
    color: "bg-blue-400",
    border: "border-blue-400",
    label: "simulator.artifactLabel",
    valid: false,
  },
  dust_debris: {
    color: "bg-slate-400",
    border: "border-slate-400",
    label: "simulator.artifactLabel",
    valid: false,
  },
  media_crack: {
    color: "bg-rose-500",
    border: "border-rose-500",
    label: "simulator.artifactLabel",
    valid: false,
  },
};

export default function SimulatorPage() {
  const { t } = useTranslationStore();
  const [showDocs, setShowDocs] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [manualCount, setManualCount] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setAnalysisResult(null);
    }
  };

  const startSimulation = async () => {
    if (!file) {
      toast.error(t("simulator.awaitingInput"));
      return;
    }

    setIsSimulating(true);
    const formData = new FormData();
    formData.append("file", file);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${API_URL}/api/v1/analyses/simulate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.detail || t("simulator.spectralDeconstruction"),
        );
      }

      const data = await response.json();
      setAnalysisResult(data);
      // Map class_name langsung dari model — 5 class asli tanpa konversi
      setDetections(
        data.detections.map((d: any) => ({
          id: d.id,
          class: d.class_name as Detection["class"],
          confidence: d.confidence,
          x: (d.bbox.x / 512) * 100,
          y: (d.bbox.y / 512) * 100,
          size: Math.max(8, (d.bbox.width / 512) * 100),
        })),
      );
      toast.success(t("simulator.analysisComplete"));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const aiCount = analysisResult?.colony_count || 0;
  const agreementRate =
    manualCount > 0
      ? Math.max(
          0,
          100 - (Math.abs(aiCount - manualCount) / manualCount) * 100,
        ).toFixed(1)
      : "0.0";

  if (!mounted) return null;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative bg-[#f4f7f6] dark:bg-slate-950 transition-colors duration-300">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        <div
          className={`flex-1 transition-all duration-300 ${showDocs ? "lg:mr-[350px]" : ""}`}
        >
          <div className="space-y-2 max-w-[1500px] mx-auto px-2 py-0 pt-0 sm:px-8 sm:py-0 sm:pt-0">
            {/* Simulation Control Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 mb-1 sm:mb-2">
              <div>
                <div className="flex items-center gap-3 mb-0.5">
                  <div className="w-8 h-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight uppercase leading-none">
                    {t("simulator.title")}
                  </h1>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-1">
                  {t("simulator.subtitle")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <DocumentationToggle
                  showDocs={showDocs}
                  setShowDocs={setShowDocs}
                />
                <label className="cursor-pointer px-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm flex items-center gap-3">
                  <Beaker className="w-4 h-4" />
                  {t("simulator.initDiagnostic")}
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
                <button
                  onClick={startSimulation}
                  disabled={isSimulating || !file}
                  className="bg-primary text-slate-900 py-3.5 px-6 flex items-center gap-3 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-slate-900 ${isSimulating ? "animate-spin" : ""}`}
                  />
                  <span className="uppercase tracking-widest text-[10px] font-bold">
                    {isSimulating
                      ? t("simulator.processingSequence")
                      : t("simulator.runDiagnostics")}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
              {/* Visualizer Arena */}
              <div className="lg:col-span-6 space-y-6">
                <div className="relative aspect-[4/3] bg-slate-900 rounded-xl border-[4px] sm:border-[6px] border-slate-800 dark:border-slate-900 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-[85%] h-[85%] rounded-full bg-slate-800/30 border border-white/5 shadow-[inset_0_0_60px_rgba(0,0,0,0.5)] overflow-hidden">
                      <div
                        className={`absolute inset-0 transition-opacity duration-1000 ${(detections.length > 0 || previewUrl) && !isSimulating ? "opacity-70" : "opacity-15"}`}
                      >
                        {previewUrl && (
                          <img
                            src={previewUrl}
                            alt={t("simulator.initDiagnostic")}
                            className="w-full h-full object-cover rounded-full mix-blend-luminosity"
                          />
                        )}
                        <div className="absolute inset-0 bg-primary/5" />
                      </div>

                      {!isSimulating && detections.length > 0 && (
                        <div className="absolute inset-0 animate-in fade-in duration-700">
                          {detections
                            .filter(
                              (d) =>
                                !selectedClass || d.class === selectedClass,
                            )
                            .map((d) => (
                              <div
                                key={d.id}
                                className={`absolute rounded-full border-2 ${CLASS_CONFIG[d.class as keyof typeof CLASS_CONFIG].border} transition-all duration-300 hover:scale-150 cursor-pointer z-10`}
                                style={{
                                  left: `${d.x}%`,
                                  top: `${d.y}%`,
                                  width: `${d.size * 1.5}px`,
                                  height: `${d.size * 1.5}px`,
                                  backgroundColor: `${CLASS_CONFIG[d.class as keyof typeof CLASS_CONFIG].color.replace("bg-", "")}40`,
                                  boxShadow: `0 0 12px ${CLASS_CONFIG[d.class as keyof typeof CLASS_CONFIG].color.replace("bg-", "")}50`,
                                }}
                              />
                            ))}
                        </div>
                      )}

                      {isSimulating && (
                        <div className="absolute inset-0 flex items-center justify-center z-50 bg-slate-950/70 backdrop-blur-sm">
                          <div className="flex flex-col items-center gap-6">
                            <div className="w-16 h-16 border-3 border-primary/10 border-t-primary rounded-full animate-spin" />
                            <p className="text-[9px] font-bold text-slate-900 uppercase tracking-[0.4em] animate-pulse">
                              {t("simulator.neuralMapping")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {(
                    Object.entries(CLASS_CONFIG) as [
                      keyof typeof CLASS_CONFIG,
                      any,
                    ][]
                  ).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setSelectedClass(selectedClass === key ? null : key)
                      }
                      className={`bg-white dark:bg-slate-900 border p-2 rounded-xl transition-all duration-300 text-left relative overflow-hidden ${
                        selectedClass === key
                          ? "border-primary ring-2 ring-primary/20 shadow-sm"
                          : "border-slate-200/40 dark:border-slate-800"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${cfg.color} mb-1.5`}
                      />
                      <p className="text-[8px] font-bold text-slate-900 dark:text-white uppercase tracking-wider leading-tight truncate">
                        {t(cfg.label)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Analytics Panel */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-50 dark:border-slate-800 pb-2">
                    <h3 className="text-[9px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                      {t("simulator.analysisCertificate")}
                    </h3>
                    <div className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <span className="text-[8px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">
                        {t("simulator.accuracy")}: {agreementRate}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                        {t("simulator.total")}
                      </p>
                      <input
                        type="number"
                        value={manualCount}
                        onChange={(e) =>
                          setManualCount(parseInt(e.target.value) || 0)
                        }
                        className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter bg-slate-50 dark:bg-slate-800 border-none w-full p-1.5 rounded-lg outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-[9px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                        {t("simulator.validCfu")}
                      </p>
                      <p className="text-2xl font-bold text-primary tracking-tighter leading-none pt-1.5">
                        {aiCount}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 mb-4">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                        {t("simulator.confidence")}
                      </span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {(analysisResult?.confidence_score * 100 || 0).toFixed(
                          1,
                        )}
                        %
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-white dark:bg-slate-700 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600">
                      <div
                        className="h-full bg-primary transition-all duration-1000 shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
                        style={{
                          width: `${analysisResult?.confidence_score * 100 || 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t("simulator.exportLedger")}
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-slate-900 shadow-sm relative overflow-hidden group">
                  <div className="absolute -bottom-6 -right-6 opacity-[0.05] group-hover:scale-125 transition-transform duration-1000">
                    <Zap className="w-32 h-32" />
                  </div>
                  <h4 className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] mb-3">
                    {t("simulator.meanVelocity")}
                  </h4>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-2 border-primary/30 pl-4">
                    "{t("simulator.filteredNoise")}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Sidebar */}
        <div className="hidden lg:block">
          <DocumentationSidebar
            showDocs={showDocs}
            setShowDocs={setShowDocs}
            directory={t("simulator.docsToggle")}
            title={t("simulator.docsTitle")}
            description={t("simulator.docsDescription")}
            rawText={t("simulator.docsDescription")}
          >
            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  01
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">
                  {t("simulator.docsTitle")}
                </h2>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                {t("simulator.docsDescription")}
              </p>
            </section>
            <section className="space-y-3 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  02
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">
                  {t("simulator.runDiagnostics")}
                </h2>
              </div>
              <div className="space-y-3 ml-0.5">
                {[
                  {
                    id: "1",
                    title: t("simulator.initDiagnostic"),
                    desc: t("simulator.awaitingInput"),
                  },
                  {
                    id: "2",
                    title: t("simulator.runDiagnostics"),
                    desc: t("simulator.initializingEngine"),
                  },
                  {
                    id: "3",
                    title: t("simulator.total"),
                    desc: t("simulator.processingSequence"),
                  },
                  {
                    id: "4",
                    title: t("simulator.accuracy"),
                    desc: t("simulator.linkActive"),
                  },
                  {
                    id: "5",
                    title: t("simulator.spectralDeconstruction"),
                    desc: t("simulator.compliant"),
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

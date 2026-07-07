"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslationStore } from "@/lib/i18n/store";
import {
  DocumentationSidebar,
  DocumentationToggle,
} from "@/components/DocumentationSidebar";
import {
  Zap,
  ShieldCheck,
  Target,
  RefreshCw,
  Beaker,
  CheckCircle2,
  Download,
  Activity,
  Layers,
  Fingerprint,
  Cpu,
  ArrowRightLeft,
  Info,
  Timer,
  AlertTriangle,
  Eye,
  Play,
  Square,
  RotateCcw,
  Crosshair,
  Award,
  Volume2,
  VolumeX,
  LayoutGrid,
  Sparkles,
  MousePointerClick,
  Clock,
  Gauge,
  Percent,
  Trash2
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";
import { simulatorApi } from "@/lib/simulator-api";

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

interface ManualClick {
  id: string;
  x: number;
  y: number;
  class: string;
  timestamp: number;
  clickDelta: number;
  isJittered: boolean;
}

interface Ripple {
  id: string;
  x: number;
  y: number;
}

const CLASS_CONFIG: Record<string, { color: string; text: string; border: string; label: string; isArtifact: boolean }> = {
  colony_single: {
    color: "bg-emerald-500",
    text: "text-emerald-500",
    border: "border-emerald-500",
    label: "Colony (Single)",
    isArtifact: false,
  },
  colony_merged: {
    color: "bg-amber-500",
    text: "text-amber-500",
    border: "border-amber-500",
    label: "Colony (Merged)",
    isArtifact: false,
  },
  bubble: {
    color: "bg-blue-400",
    text: "text-blue-400",
    border: "border-blue-400",
    label: "Bubble",
    isArtifact: true,
  },
  dust_debris: {
    color: "bg-slate-400",
    text: "text-slate-400",
    border: "border-slate-400",
    label: "Dust/Debris",
    isArtifact: true,
  },
  media_crack: {
    color: "bg-rose-500",
    text: "text-rose-500",
    border: "border-rose-500",
    label: "Media Crack",
    isArtifact: true,
  },
};

export default function SimulatorPage() {
  const { t } = useTranslationStore();
  const { accessToken } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // ============================================================
  // Advanced Manual Simulator State
  // ============================================================
  const [isManualCountingMode, setIsManualCountingMode] = useState(false);
  const [manualClicks, setManualClicks] = useState<ManualClick[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("colony_single");
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showSpatialOverlap, setShowSpatialOverlap] = useState(false);
  const [hasFinishedManualCount, setHasFinishedManualCount] = useState(false);

  // New Upgrade States
  const [difficulty, setDifficulty] = useState<'standard' | 'double' | 'dim'>('standard');
  const [gridType, setGridType] = useState<'none' | 'rectangular' | 'radial'>('none');
  const [isMuted, setIsMuted] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Timer Ref for millisecond stopwatch
  const timerRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Precise Stopwatch Timer Effect
  useEffect(() => {
    if (isTimerRunning) {
      const startTime = Date.now() - timeSpent * 1000;
      timerRef.current = setInterval(() => {
        setTimeSpent((Date.now() - startTime) / 1000);
      }, 50);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerRunning]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setFile(selected);
        setAnalysisResult(null);
        setDetections([]);
        resetManualSimulation();
        console.log("Image loaded successfully");
      };
      reader.readAsDataURL(selected);
    }
  };

  const startSimulation = async () => {
    if (!file) {
      toast.error(t("simulator.selectPlateFirst"));
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
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Inference Error");
      }

      const data = await response.json();
      setAnalysisResult(data);
      setDetections(
        data.detections.map((d: any) => ({
          id: d.id,
          class: d.class_name as Detection["class"],
          confidence: d.confidence,
          x: (d.bbox.x / 640) * 100,
          y: (d.bbox.y / 640) * 100,
          size: Math.max(8, (d.bbox.width / 640) * 100),
        }))
      );
      toast.success(t("simulator.aiAnalysisComplete"));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  // ============================================================
  // Fatigue & Jitter Math Model
  // ============================================================
  const clickCount = manualClicks.length;

  // Calculate fatigue multiplier depending on the difficulty mode
  const fatigueMultiplier = difficulty === 'double' ? 2.0 : difficulty === 'dim' ? 3.0 : 1.0;

  const cognitiveFatigue = Math.min(
    100,
    Math.round((clickCount * 0.45 + timeSpent * 0.05) * fatigueMultiplier)
  );

  const eyeStrain = Math.min(
    100,
    Math.round(
      (clickCount * 0.55 + (timeSpent > 30 ? (timeSpent - 30) * 0.15 : 0)) *
      (difficulty === 'dim' ? 3.5 : fatigueMultiplier)
    )
  );

  const reactionTime = clickCount > 0
    ? (manualClicks.reduce((sum, c) => sum + c.clickDelta, 0) / clickCount).toFixed(2)
    : "0.00";

  // Hand-eye coordination drift in percentage points
  const currentJitterDrift = cognitiveFatigue > 45 ? ((cognitiveFatigue - 45) * 0.12) : 0;
  const jitterDrift = currentJitterDrift.toFixed(1);

  // Critical fatigue threshold
  const isFatigueCritical = cognitiveFatigue > 75 || eyeStrain > 75;

  // Web Audio Synth Tick
  const playTickSound = (fatigue: number, isRemoval = false) => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (isRemoval) {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // Low warning sound
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else {
        osc.type = "sine";
        // Frequency drops as fatigue increases (coordination decay pitch shift)
        const frequency = Math.max(180, 600 - fatigue * 4);
        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      }
    } catch (e) {}
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isManualCountingMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // 1. Check if clicked near an existing marker to delete it (Undo/Correction mode)
    const CLICK_DELETE_RADIUS = 2.2; // proximity limit in % scale
    const nearestClickIndex = manualClicks.findIndex(c =>
      Math.sqrt(Math.pow(c.x - clickX, 2) + Math.pow(c.y - clickY, 2)) < CLICK_DELETE_RADIUS
    );

    if (nearestClickIndex !== -1) {
      // Remove the marker!
      setManualClicks((prev) => prev.filter((_, idx) => idx !== nearestClickIndex));
      playTickSound(cognitiveFatigue, true);
      toast.success(t("simulator.colonyMarkerRemoved"), { duration: 1000 });
      return;
    }

    // 2. Play subtle dynamic ripple animation
    const rippleId = Math.random().toString(36).substring(2, 9);
    setRipples((prev) => [...prev, { id: rippleId, x: clickX, y: clickY }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter(r => r.id !== rippleId));
    }, 800);

    // 3. Apply simulated fatigue drift (human coordination loss)
    let finalX = clickX;
    let finalY = clickY;
    let isJittered = false;

    if (currentJitterDrift > 0) {
      isJittered = true;
      // Add random displacement based on current jitter drift level
      finalX += (Math.random() - 0.5) * currentJitterDrift * 1.6;
      finalY += (Math.random() - 0.5) * currentJitterDrift * 1.6;

      // Keep inside boundary (0-100)
      finalX = Math.max(0, Math.min(100, finalX));
      finalY = Math.max(0, Math.min(100, finalY));
    }

    const now = Date.now();
    const lastClickTime = manualClicks.length > 0
      ? manualClicks[manualClicks.length - 1].timestamp
      : now;
    const clickDelta = (now - lastClickTime) / 1000;

    const newClick: ManualClick = {
      id: Math.random().toString(36).substring(2, 11),
      x: finalX,
      y: finalY,
      class: selectedClass,
      timestamp: now,
      clickDelta: Math.min(10, clickDelta),
      isJittered
    };

    setManualClicks((prev) => [...prev, newClick]);
    playTickSound(cognitiveFatigue);
  };

  const undoLastClick = () => {
    if (manualClicks.length === 0) return;
    setManualClicks((prev) => prev.slice(0, -1));
    playTickSound(cognitiveFatigue, true);
    toast.success(t("simulator.lastMarkUndone"));
  };

  const startManualSimulation = () => {
    if (!previewUrl) {
      toast.error(t("simulator.uploadImageFirst"));
      return;
    }
    setIsManualCountingMode(true);
    setHasFinishedManualCount(false);
    setManualClicks([]);
    setTimeSpent(0);
    setIsTimerRunning(true);
    toast.success(t("simulator.manualSimulatorActive"));
  };

  const finishManualSimulation = () => {
    setIsTimerRunning(false);
    setIsManualCountingMode(false);
    setHasFinishedManualCount(true);
    toast.success(t("simulator.manualSimulationFinished"));
  };

  const resetManualSimulation = () => {
    setIsTimerRunning(false);
    setIsManualCountingMode(false);
    setHasFinishedManualCount(false);
    setManualClicks([]);
    setTimeSpent(0);
    setShowSpatialOverlap(false);
  };

  // ============================================================
  // Spatial Comparison Algorithm (Bipartite Greedy Matching)
  // ============================================================
  const getSpatialAgreementDetails = () => {
    if (detections.length === 0 && manualClicks.length === 0) {
      return {
        tp: 0,
        fp: 0,
        fn: 0,
        agreement: 100,
        precision: 100,
        recall: 100,
        f1: 100,
        matchedPairs: [],
        matchedAiIds: new Set<string>(),
        matchedClickIds: new Set<string>()
      };
    }

    const PROXIMITY_THRESHOLD = 5.5; // distance in percentage points (approx 28px on a 500px canvas)

    // Calculate all pairwise distances between manual clicks and AI detections
    interface DistancePair {
      detIndex: number;
      clickIndex: number;
      dist: number;
    }
    const allPairs: DistancePair[] = [];

    detections.forEach((det, detIdx) => {
      const detCenterX = det.x + det.size / 2;
      const detCenterY = det.y + det.size / 2;

      manualClicks.forEach((click, clickIdx) => {
        const distance = Math.sqrt(
          Math.pow(click.x - detCenterX, 2) + Math.pow(click.y - detCenterY, 2)
        );
        if (distance <= PROXIMITY_THRESHOLD) {
          allPairs.push({ detIndex: detIdx, clickIndex: clickIdx, dist: distance });
        }
      });
    });

    // Sort distances in ascending order (shortest distance matched first - Greedy Bipartite Matching)
    allPairs.sort((a, b) => a.dist - b.dist);

    const matchedDetIndices = new Set<number>();
    const matchedClickIndices = new Set<number>();

    interface MatchedLink {
      detId: string;
      clickId: string;
      detX: number;
      detY: number;
      clickX: number;
      clickY: number;
    }
    const matchedPairs: MatchedLink[] = [];
    const matchedAiIds = new Set<string>();
    const matchedClickIds = new Set<string>();

    allPairs.forEach((pair) => {
      if (!matchedDetIndices.has(pair.detIndex) && !matchedClickIndices.has(pair.clickIndex)) {
        matchedDetIndices.add(pair.detIndex);
        matchedClickIndices.add(pair.clickIndex);

        const det = detections[pair.detIndex];
        const click = manualClicks[pair.clickIndex];

        matchedPairs.push({
          detId: det.id,
          clickId: click.id,
          detX: det.x + det.size / 2,
          detY: det.y + det.size / 2,
          clickX: click.x,
          clickY: click.y
        });

        matchedAiIds.add(det.id);
        matchedClickIds.add(click.id);
      }
    });

    const tp = matchedPairs.length;
    // FP: AI detected things that the analyst didn't mark (AI True positives are tp, so fp is detections - tp)
    const fp = Math.max(0, detections.length - tp);
    // FN: Clicks marked by analyst that AI didn't catch
    const fn = Math.max(0, manualClicks.length - tp);

    const agreement = (tp + fp + fn) > 0 ? (tp / (tp + fp + fn)) * 100 : 100;
    const precision = (tp + fp) > 0 ? (tp / (tp + fp)) * 100 : 100;
    const recall = (tp + fn) > 0 ? (tp / (tp + fn)) * 100 : 100;
    const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 100;

    return {
      tp,
      fp,
      fn,
      agreement: Math.round(agreement * 10) / 10,
      precision: Math.round(precision * 10) / 10,
      recall: Math.round(recall * 10) / 10,
      f1: Math.round(f1 * 10) / 10,
      matchedPairs,
      matchedAiIds,
      matchedClickIds,
    };
  };

  const spatialResult = getSpatialAgreementDetails();
  const aiCount = analysisResult?.colony_count || 0;

  // Stopwatch time formatting
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    const tenths = Math.floor((secs % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}.${tenths}`;
  };

  // Clicks Per Minute (CPM)
  const cpm = timeSpent > 2 ? Math.round((manualClicks.length / timeSpent) * 60) : 0;

  // Annual ROI calculation based on active manual time
  const platesPerYear = 12000;
  const avgManualTime = timeSpent > 5 ? timeSpent : 45.0; // Assume 45 seconds average if simulator not run
  const aiProcessingTime = 0.82;
  const annualHoursSaved = Math.max(
    0,
    Math.round((platesPerYear * (avgManualTime - aiProcessingTime)) / 3600)
  );

  // Save comparison data to DB
  const saveComparisonToDb = async () => {
    if (!analysisResult) return;
    setIsSaving(true);
    try {
      const breakdown = manualClicks.reduce((acc: Record<string, number>, click) => {
        acc[click.class] = (acc[click.class] || 0) + 1;
        return acc;
      }, {});

      // Build AI class breakdown from analysisResult for sandbox mode
      const aiBreakdown: Record<string, number> = analysisResult.class_breakdown || {};
      const aiTotalValid = (aiBreakdown.colony_single || 0) + (aiBreakdown.colony_merged || 0);

      await simulatorApi.saveComparison({
        analysis_id: analysisResult.id,
        manual_colony_single: breakdown.colony_single || 0,
        manual_colony_merged: breakdown.colony_merged || 0,
        manual_bubble: breakdown.bubble || 0,
        manual_dust_debris: breakdown.dust_debris || 0,
        manual_media_crack: breakdown.media_crack || 0,
        notes: `Simulasi accuracy: ${spatialResult.agreement}%. Fatigue level: ${cognitiveFatigue}%. CPM: ${cpm}. Kecepatan reaksi: ${reactionTime}s. Mode: ${difficulty}. [SANDBOX]`,
        // Sandbox mode fields — sent when analysis_id is transient (not in DB)
        ai_class_breakdown: aiBreakdown,
        ai_total_valid: aiTotalValid,
        overall_accuracy: spatialResult.agreement,
      });

      toast.success(t("simulator.comparisonSaved"));
    } catch (err) {
      toast.error(t("simulator.comparisonFailed"));
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        <div className="flex-1 transition-all duration-300">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-8 py-0 sm:py-0 space-y-4 sm:space-y-6 pb-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 sm:mb-6 pt-0">
              <div>
                <h1 className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                  {t("simulator.spatialComparativeSimulator")}
                </h1>
                <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
                  ColonyAI Sandbox // <span className="text-emerald-500 font-black">FATIGUE & SPATIAL PRECISION PROTOCOL</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-none border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all cursor-pointer">
                  <Beaker className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                    {t("simulator.uploadPlate")}
                  </span>
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>

                <button
                  onClick={startSimulation}
                  disabled={isSimulating || !file}
                  className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 px-4 py-2 rounded-none font-black text-[9px] uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  {isSimulating ? t("simulator.aiProcessing") : t("simulator.runAiAnalysis")}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6 w-full">
        {/* LEFT COLUMN: VISUALIZER */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 p-3 shadow-xl relative overflow-hidden group transition-all duration-300">

            {/* Live Timer & Click Counter Overlay (Manual Mode Only) */}
            {isManualCountingMode && (
              <div className="absolute top-6 left-6 z-40 bg-slate-950/95 backdrop-blur-md px-4 py-2.5 border border-emerald-500/30 flex items-center gap-4 text-white shadow-2xl">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">STOPWATCH</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{formatTime(timeSpent)}</span>
                </div>
                <div className="w-[1px] h-4 bg-white/20" />
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-emerald-400" />
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">TALLY</span>
                  <span className="text-sm font-mono font-bold text-white">{clickCount}</span>
                </div>
              </div>
            )}

            {/* Mute and Grid Settings Quick Toggle Overlay */}
            {isManualCountingMode && (
              <div className="absolute top-6 right-6 z-40 flex gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 bg-slate-950/90 hover:bg-slate-900 border border-white/10 text-white transition-all shadow-lg"
                  title={isMuted ? "Unmute Audio" : "Mute Audio"}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
                <button
                  onClick={undoLastClick}
                  disabled={manualClicks.length === 0}
                  className="p-2 bg-slate-950/90 hover:bg-slate-900 border border-white/10 text-white disabled:opacity-40 transition-all shadow-lg"
                  title="Undo Last Mark"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            )}

            {/* Main Plate View Container */}
            <div className="relative aspect-square bg-[#0c0c0e] rounded-none overflow-hidden flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

              <div
                onClick={handleImageClick}
                className={`relative w-[94%] h-[94%] rounded-full overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.95)] ring-4 ring-slate-800/40 bg-slate-950 ${
                  isManualCountingMode ? "cursor-crosshair active:scale-[0.995] transition-all" : "cursor-default"
                }`}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    className={`w-full h-full object-cover transition-all duration-500 select-none ${
                      isSimulating ? 'opacity-30 grayscale blur-md' : 'opacity-100'
                    } ${isManualCountingMode ? 'brightness-[1.10] contrast-[1.05]' : ''} ${
                      difficulty === 'dim' && isManualCountingMode ? 'brightness-[0.6] contrast-[0.85] saturate-[0.8]' : ''
                    }`}
                    draggable={false}
                    alt="Petri Dish Plate"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
                    <Layers className="w-12 h-12 opacity-10 animate-pulse" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">
                      {t("simulator.awaitingSpecimenPlate")}
                    </p>
                  </div>
                )}

                {/* Circular sectors / Wolfhuegel grids overlay */}
                {gridType === 'rectangular' && isManualCountingMode && (
                  <div className="absolute inset-0 pointer-events-none z-10 opacity-25 select-none grid grid-cols-6 grid-rows-6">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className="border border-emerald-400" />
                    ))}
                  </div>
                )}

                {gridType === 'radial' && isManualCountingMode && (
                  <div className="absolute inset-0 pointer-events-none z-10 opacity-25 select-none flex items-center justify-center">
                    <div className="absolute w-[25%] h-[25%] rounded-full border border-emerald-400 border-dashed" />
                    <div className="absolute w-[50%] h-[50%] rounded-full border border-emerald-400 border-dashed" />
                    <div className="absolute w-[75%] h-[75%] rounded-full border border-emerald-400 border-dashed" />
                    <div className="absolute w-full h-[1px] bg-emerald-400 rotate-0" />
                    <div className="absolute w-full h-[1px] bg-emerald-400 rotate-45" />
                    <div className="absolute w-full h-[1px] bg-emerald-400 rotate-90" />
                    <div className="absolute w-full h-[1px] bg-emerald-400 rotate-135" />
                  </div>
                )}

                {/* AI Detections Layer */}
                {!isSimulating && detections.length > 0 && (
                  <div className="absolute inset-0 z-20">
                    {detections.map((d) => {
                      const isMatched = spatialResult.matchedAiIds.has(d.id);

                      // Dynamic visual style showing spatial overlap
                      let borderClass = CLASS_CONFIG[d.class].border;
                      let bgOpacity = "15";

                      if (showSpatialOverlap) {
                        borderClass = isMatched
                          ? "border-emerald-400 border-2 ring-1 ring-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          : "border-rose-500 border border-dashed ring-1 ring-rose-500/20";
                        bgOpacity = isMatched ? "10" : "05";
                      }

                      return (
                        <div
                          key={d.id}
                          className={`absolute rounded-full border ${borderClass} transition-all duration-200 hover:scale-125 hover:z-50 group/det`}
                          style={{
                            left: `${d.x}%`,
                            top: `${d.y}%`,
                            width: `${d.size}%`,
                            height: `${d.size}%`,
                            backgroundColor: `${CLASS_CONFIG[d.class].color.replace('bg-', '')}${bgOpacity}`
                          }}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/det:opacity-100 transition-all scale-75 group-hover/det:scale-100 whitespace-nowrap bg-slate-950 text-white text-[8px] font-mono px-2 py-0.5 border border-white/10 z-50">
                            {showSpatialOverlap && (isMatched ? "✅ MATCH | " : "❌ AI FP (Debris) | ")}
                            {CLASS_CONFIG[d.class].label} ({(d.confidence * 100).toFixed(0)}%)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dynamic Spatial Overlay Connecting Lines */}
                {showSpatialOverlap && !isSimulating && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                    {spatialResult.matchedPairs.map((pair, idx) => (
                      <line
                        key={idx}
                        x1={`${pair.clickX}%`}
                        y1={`${pair.clickY}%`}
                        x2={`${pair.detX}%`}
                        y2={`${pair.detY}%`}
                        stroke="#10B981"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        className="animate-pulse"
                      />
                    ))}
                  </svg>
                )}

                {/* Manual Clicks Layer */}
                {manualClicks.map((click) => {
                  const isMatched = spatialResult.matchedClickIds.has(click.id);
                  let customStyle = "w-3 h-3 bg-emerald-400 border-white text-emerald-950";

                  if (showSpatialOverlap) {
                    customStyle = isMatched
                      ? "w-3.5 h-3.5 bg-emerald-400 border-white ring-2 ring-emerald-500/40"
                      : "w-4 h-4 bg-amber-400 border-slate-950 border-2 ring-2 ring-amber-400/40 border-dashed animate-bounce";
                  }

                  return (
                    <div
                      key={click.id}
                      className={`absolute rounded-full border -translate-x-1/2 -translate-y-1/2 z-30 shadow-md flex items-center justify-center group/click transition-all cursor-pointer ${customStyle}`}
                      style={{
                        left: `${click.x}%`,
                        top: `${click.y}%`,
                      }}
                      title="Click to remove mark"
                    >
                      <span className="text-[6.5px] font-black select-none">
                        {showSpatialOverlap && !isMatched ? "FN" : clickCount - manualClicks.findIndex(c => c.id === click.id)}
                      </span>
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/click:opacity-100 transition-all scale-75 group-hover/click:scale-100 whitespace-nowrap bg-slate-950 text-white text-[8px] font-mono px-1.5 py-0.5 border border-white/10 z-50">
                        CFU-{manualClicks.findIndex(c => c.id === click.id) + 1} ({CLASS_CONFIG[click.class].label.replace("Colony ", "")})
                        <span className="block text-[6.5px] text-rose-400 mt-0.5 text-center font-bold">CLICK TO REMOVE</span>
                      </div>
                    </div>
                  );
                })}

                {/* Interactive Click Ripple Animations */}
                {ripples.map((ripple) => (
                  <div
                    key={ripple.id}
                    className="absolute rounded-full border border-emerald-400/80 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-ping"
                    style={{
                      left: `${ripple.x}%`,
                      top: `${ripple.y}%`,
                      width: "35px",
                      height: "35px"
                    }}
                  />
                ))}

                {/* Cognitive/Visual Fatigue Vignette Overlay */}
                {isFatigueCritical && isManualCountingMode && (
                  <div className="absolute inset-0 rounded-full border-4 border-rose-500/60 pointer-events-none z-30 animate-pulse shadow-[inset_0_0_40px_rgba(244,63,94,0.5)]" />
                )}

                {/* Scanline Effect during simulation */}
                {isSimulating && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/25 to-transparent h-1/2 w-full animate-scanline z-15" />
                )}
              </div>
            </div>

            {/* Grid Overlay Controls (Interactive Wolfhuegel selector) */}
            {isManualCountingMode && (
              <div className="mt-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-2.5 border border-slate-100 dark:border-slate-800 rounded-none">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {t("simulator.laboratoryCounterGrid")}
                  </span>
                </div>
                <div className="flex gap-2">
                  {(['none', 'rectangular', 'radial'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setGridType(type)}
                      className={`px-3 py-1 text-[8.5px] font-black uppercase tracking-wider border transition-all ${
                        gridType === type
                          ? "bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 border-transparent shadow-sm"
                          : "bg-transparent text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {type === 'none' ? t("simulator.noGrid") : type === 'rectangular' ? "Wolfhuegel" : t("simulator.radialWedges")}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("simulator.aiLatency")}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">0.82s <span className="text-[9px] text-emerald-500 font-bold tracking-normal">Real-time</span></p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("simulator.humanTally")}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{manualClicks.length} <span className="text-[9px] text-blue-500 font-bold tracking-normal">{timeSpent.toFixed(1)}s</span></p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("simulator.spatialMatch")}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {detections.length > 0 || manualClicks.length > 0 ? `${spatialResult.agreement}%` : "--"}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("simulator.aiObjects")}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{detections.length}</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROL & ANLAYTICS */}
        <div className="col-span-12 lg:col-span-5 space-y-6">

          {/* SIMULATOR CONTROLLER */}
          <div className="bg-slate-900 rounded-none p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-emerald-500" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">
                  {t("simulator.simulatorControlCenter")}
                </h2>
              </div>
              <span className="text-[8px] font-mono bg-white/10 px-2 py-0.5 border border-white/10 text-emerald-400">
                ACTIVE PIPELINE
              </span>
            </div>

            {/* Phase 1: Not active and no clicks yet */}
            {!isManualCountingMode && !hasFinishedManualCount && (
              <div className="space-y-5">
                <p className="text-[10.5px] text-slate-400 leading-relaxed font-medium">
                  {t("simulator.focusTestDescription")}
                </p>

                {/* Lab difficulty selector (Fatigue Presets) */}
                <div className="bg-white/5 p-4 border border-white/5 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-300">
                      {t("simulator.selectShiftWorkloadPreset")}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['standard', 'double', 'dim'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setDifficulty(mode)}
                        className={`py-2 px-1 text-[8.5px] font-black uppercase border transition-all ${
                          difficulty === mode
                            ? "bg-white/10 border-emerald-400 text-emerald-400"
                            : "bg-transparent border-white/5 text-slate-400 hover:border-white/10"
                        }`}
                      >
                        {mode === 'standard' ? t("simulator.standardShift") : mode === 'double' ? t("simulator.doubleShift") : t("simulator.dimLighting")}
                      </button>
                    ))}
                  </div>
                  <p className="text-[8px] text-slate-500 italic">
                    {difficulty === 'standard' && t("simulator.standardShiftDescription")}
                    {difficulty === 'double' && t("simulator.doubleShiftDescription")}
                    {difficulty === 'dim' && t("simulator.dimLightingDescription")}
                  </p>
                </div>

                <button
                  onClick={startManualSimulation}
                  disabled={!previewUrl}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-slate-950 font-black text-[10px] py-3.5 tracking-widest uppercase hover:opacity-90 transition-all disabled:opacity-30 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  {t("simulator.startManualCount")}
                </button>
              </div>
            )}

            {/* Phase 2: Counting Active */}
            {isManualCountingMode && (
              <div className="space-y-5">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                    {t("simulator.selectColonyClass")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(CLASS_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedClass(key)}
                        className={`flex items-center gap-2 px-3 py-2 border text-[9px] font-black transition-all ${
                          selectedClass === key
                            ? "bg-white/10 border-emerald-400 text-emerald-400"
                            : "bg-transparent border-white/5 text-slate-400 hover:border-white/10"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${cfg.color}`} />
                        {cfg.label.replace("Colony ", "")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 p-4 border border-white/5 space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">{t("simulator.avgClickInterval")}</span>
                    <span className="font-mono text-emerald-400 font-bold">{reactionTime}s</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">{t("simulator.handCoordinationJitter")}</span>
                    <span className="font-mono text-amber-400 font-bold">+{jitterDrift}px</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">{t("simulator.cpmThroughput")}</span>
                    <span className="font-mono text-blue-400 font-bold">{cpm} cpm</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={resetManualSimulation}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-3 border border-white/5 transition-all text-[10px] font-bold uppercase tracking-widest text-rose-400"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {t("simulator.reset")}
                  </button>
                  <button
                    onClick={finishManualSimulation}
                    className="flex items-center justify-center gap-2 bg-emerald-500 text-slate-950 py-3 font-black transition-all hover:opacity-90 text-[10px] uppercase tracking-widest"
                  >
                    <Square className="w-3.5 h-3.5 fill-slate-950" />
                    {t("simulator.finishCount")}
                  </button>
                </div>
              </div>
            )}

            {/* Phase 3: Completed Manual Count */}
            {hasFinishedManualCount && (
              <div className="space-y-5">
                <div className="bg-white/5 rounded-none p-4 border border-white/5 grid grid-cols-2 gap-4">
                  <div className="text-center border-r border-white/5">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {t("simulator.manualCount")}
                    </p>
                    <p className="text-3xl font-black text-white font-mono">{manualClicks.length}</p>
                    <p className="text-[8px] text-slate-400 mt-1">in {formatTime(timeSpent)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {t("simulator.aiTotalCount")}
                    </p>
                    <p className="text-3xl font-black text-emerald-400 font-mono">{aiCount}</p>
                    <p className="text-[8px] text-slate-400 mt-1">in 0.82s</p>
                  </div>
                </div>

                {detections.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[10.5px] border-b border-white/5 pb-2">
                      <span className="text-slate-400 font-bold">{t("simulator.spatialOverlapAgreement")}</span>
                      <span className="font-black text-emerald-400 font-mono text-sm">{spatialResult.agreement}%</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] border-b border-white/5 pb-2">
                      <span className="text-slate-400">{t("simulator.truePositives")}</span>
                      <span className="font-bold text-white font-mono">{spatialResult.tp} matches</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] border-b border-white/5 pb-2">
                      <span className="text-slate-400">{t("simulator.aiFalsePositives")}</span>
                      <span className="font-bold text-rose-400 font-mono">{spatialResult.fp} artifacts</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] border-b border-white/5 pb-2">
                      <span className="text-slate-400">{t("simulator.aiFalseNegatives")}</span>
                      <span className="font-bold text-amber-400 font-mono">{spatialResult.fn} colonies</span>
                    </div>

                    {/* Spatial toggle */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">
                          {t("simulator.visualizeSpatialMapping")}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showSpatialOverlap}
                          onChange={(e) => setShowSpatialOverlap(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={resetManualSimulation}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-3 border border-white/5 transition-all text-[10px] font-bold uppercase tracking-widest"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {t("simulator.resetSim")}
                  </button>
                  <button
                    onClick={saveComparisonToDb}
                    disabled={detections.length === 0 || isSaving}
                    className="flex items-center justify-center gap-2 bg-emerald-500 text-slate-950 py-3 font-black transition-all hover:opacity-90 text-[10px] uppercase tracking-widest disabled:opacity-30"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    {isSaving ? t("simulator.saving") : t("simulator.saveComparison")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC FATIGUE SIMULATION PANEL */}
          <div className="bg-white dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 p-6 shadow-xl relative overflow-hidden transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-amber-500" />
              <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                {t("simulator.humanFatigueAnalyzer")}
              </h3>
            </div>

            <div className="space-y-4">
              {/* Cognitive Load */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase">Cognitive Load Index</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{cognitiveFatigue}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      cognitiveFatigue > 75 ? "bg-rose-500 animate-pulse" : cognitiveFatigue > 40 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${cognitiveFatigue}%` }}
                  />
                </div>
              </div>

              {/* Eye Strain */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase">Eye Strain Level</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{eyeStrain}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      eyeStrain > 75 ? "bg-rose-500 animate-pulse" : eyeStrain > 40 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${eyeStrain}%` }}
                  />
                </div>
              </div>

              {/* Fatigue Diagnostics Alert */}
              {isFatigueCritical && isManualCountingMode && (
                <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-3 flex gap-3 text-slate-700 dark:text-slate-300 transition-all">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 leading-none">
                      {t("simulator.criticalFatigueAlarm")}
                    </p>
                    <p className="text-[9.5px] italic mt-1 leading-relaxed">
                      {t("simulator.fatigueDiagnosis", { jitterDrift })}
                    </p>
                  </div>
                </div>
              )}

              {/* Fatigue math explainer */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <p className="text-[9px] leading-relaxed italic">
                  {t("simulator.fatigueMathExplainer")}
                </p>
              </div>
            </div>
          </div>

          {/* ROI BUSINESS CASE / TIME SAVED CALCULATOR */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 rounded-none border border-emerald-500/20 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />

            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-5 h-5 text-emerald-400" />
              <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                {t("simulator.roiEfficiency")}
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                    {t("simulator.labHoursSavedPerYear")}
                  </p>
                  <p className="text-[8.5px] text-slate-500 mt-0.5">
                    {t("simulator.hoursSavedDisclaimer")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-white font-mono animate-pulse">{annualHoursSaved}</span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">HOURS</span>
                </div>
              </div>

              <div className="w-full h-1 bg-white/5" />

              <div className="grid grid-cols-2 gap-4 text-[9.5px]">
                <div className="bg-slate-900/60 p-3 border border-white/5">
                  <span className="text-slate-400 block mb-1 uppercase font-black">{t("simulator.cpmThroughputLabel")}</span>
                  <span className="font-mono text-sm text-white font-bold">{cpm} cpm</span>
                </div>
                <div className="bg-slate-900/60 p-3 border border-white/5">
                  <span className="text-slate-400 block mb-1 uppercase font-black">{t("simulator.aiLimsProcess")}</span>
                  <span className="font-mono text-sm text-emerald-400 font-bold">0.82s</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI ACCURACY BENCHMARK CARD */}
          {detections.length > 0 && hasFinishedManualCount && (
            <div className="bg-white dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 p-6 shadow-xl transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-emerald-500" />
                <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                  {t("simulator.academicComparativeMetrics")}
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800/50">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {t("simulator.aiPrecision")}
                  </p>
                  <p className="text-xl font-black text-emerald-500 font-mono">{spatialResult.precision}%</p>
                  <p className="text-[6.5px] text-slate-400 mt-1 uppercase tracking-tighter">Matches / AI Detections</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800/50">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {t("simulator.aiRecall")}
                  </p>
                  <p className="text-xl font-black text-blue-500 font-mono">{spatialResult.recall}%</p>
                  <p className="text-[6.5px] text-slate-400 mt-1 uppercase tracking-tighter">Matches / Human Clicks</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800/50">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {t("simulator.f1Score")}
                  </p>
                  <p className="text-xl font-black text-amber-500 font-mono">{spatialResult.f1}%</p>
                  <p className="text-[6.5px] text-slate-400 mt-1 uppercase tracking-tighter">Harmonic Mean Precision/Recall</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <style jsx global>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .animate-scanline {
          animation: scanline 2.5s linear infinite;
        }
        @keyframes ripple {
          0% {
            width: 0px;
            height: 0px;
            opacity: 1;
          }
          100% {
            width: 45px;
            height: 45px;
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ripple 0.8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
        }
      `}</style>
          </div>
        </div>
      </div>
    </div>
  );
}

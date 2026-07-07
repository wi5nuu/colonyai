"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Server,
  Database,
  Cpu,
  ShieldCheck,
  RefreshCw,
  Globe,
  BrainCircuit,
  Terminal,
  Zap,
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  DocumentationSidebar,
  DocumentationToggle,
} from "@/components/DocumentationSidebar";

import { toast } from "sonner";
import { useTranslationStore } from "@/lib/i18n/store";

export default function SentinelPage() {
  const { t } = useTranslationStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [trainingActive, setTrainingActive] = useState(true);
  const [epoch, setEpoch] = useState(42);
  const [map50, setMap50] = useState(0.924);
  const [benchmarking, setBenchmarking] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [minutesRemaining, setMinutesRemaining] = useState(14);
  // Chart bar heights – updated live as training progresses
  const [chartBars, setChartBars] = useState<number[]>([]);

  // Weights Integrity Scanner & Audit Ledger States
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState(false);
  const [auditHistory, setAuditHistory] = useState([
    {
      node: "NODE-01 (Main Server)",
      time: "18/05/2026, 14.23.11",
      hash: "3f7c9a8b1d2e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
    },
    {
      node: "NODE-12 (Edge Laboratorium)",
      time: "18/05/2026, 09.12.45",
      hash: "7d9e0f2a4b6c8d0e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e",
    },
  ]);

  const [metrics, setMetrics] = useState([
    {
      name: "Neural Cluster 01-A",
      status: "Synchronized",
      load: 10.7,
      unit: "%",
      icon: Cpu,
      color: "emerald",
    },
    {
      name: "Multi-Tenant Ledger",
      status: "Connected",
      load: 0.76,
      unit: "ms",
      icon: Database,
      color: "blue",
    },
    {
      name: "S3 Object Storage",
      status: "Hardened",
      load: 1.2,
      unit: " PB",
      icon: Server,
      color: "purple",
    },
    {
      name: "Security Shield",
      status: "Active",
      load: "Active",
      unit: "",
      icon: ShieldCheck,
      color: "indigo",
    },
  ]);
  const [activeRequests, setActiveRequests] = useState(1204);
  const [logs, setLogs] = useState<string[]>([
    "INITIALIZING_SENTINEL_PROTOCOLS...",
    "HANDSHAKE_SECURE_NODE_04: SUCCESS",
    "ENCRYPTING_TRAFFIC_LAYER_7: ACTIVE",
    "NEURAL_MAP_READY: COLONY_V3_2026",
    "GPU_CORE_TEMP_STABLE: 62°C",
    "VRAM_ALLOCATION: 4.2GB / 8.0GB",
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRequests((prev) => prev + Math.floor(Math.random() * 10) - 4);

      if (trainingActive) {
        // advance epoch ~every 3 ticks for visible movement
        if (Math.random() > 0.4) {
          setEpoch((prev) => {
            const newEpoch = prev < 80 ? prev + 1 : prev;
            const mins = Math.max(0, Math.round(((80 - newEpoch) * 10) / 60));
            setMinutesRemaining(mins);

            // Grow the bar corresponding to this epoch position
            const barIdx = Math.floor((newEpoch / 80) * 39);
            setChartBars((bars) => {
              const next = [...bars];
              for (
                let i = Math.max(0, barIdx - 1);
                i <= Math.min(39, barIdx + 1);
                i++
              ) {
                const target = Math.min(95, 20 + Math.pow(i * 2, 1.2) * 0.8);
                next[i] = Math.min(
                  95,
                  next[i] + (target - next[i]) * 0.3 + Math.random() * 3,
                );
              }
              return next;
            });

            setLogs((prev) => [
              ...prev.slice(-20),
              `TRAINING_EPOCH_${newEpoch}: mAP50=${(0.85 + newEpoch * 0.002).toFixed(4)}`,
            ]);
            return newEpoch;
          });
          setMap50((prev) =>
            Math.min(0.985, prev + (Math.random() * 0.003 + 0.001)),
          );
        }
      }

      const newLogs = [
        `INCOMING_REQUEST_FROM_IP: 10.42.0.${Math.floor(Math.random() * 255)}`,
        `NEURAL_INFERENCE_COMPLETE: 124ms`,
        `ENCRYPTION_HASH_ROTATED: SHA-512_SECURE`,
        `DATABASE_SYNC_NODE_02: COMPLETED`,
        `GPU_CORE_FREQ: ${2100 + Math.floor(Math.random() * 100)} MHz`,
      ];

      if (Math.random() > 0.8) {
        setLogs((prev) => [
          ...prev.slice(-20),
          newLogs[Math.floor(Math.random() * newLogs.length)],
        ]);
      }

      setMetrics((prev) =>
        prev.map((m) => {
          if (m.name.includes("Cluster")) {
            const newVal = Math.max(
              8,
              Math.min(45, (m.load as number) + (Math.random() * 4 - 2)),
            );
            return { ...m, load: newVal };
          }
          if (m.name.includes("Ledger")) {
            const newVal = Math.max(
              0.4,
              Math.min(1.5, (m.load as number) + (Math.random() * 0.2 - 0.1)),
            );
            return { ...m, load: newVal };
          }
          return m;
        }),
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [trainingActive, epoch, map50]);

  const handleDeploy = () => {
    if (isDeploying) return;
    setIsDeploying(true);

    setLogs((prev) => [
      ...prev,
      ">> INITIATING_NEURAL_DEPLOYMENT: v3.2.0_FINETUNED",
    ]);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        ">> TRANSFERRING_WEIGHTS_TO_EDGE_NODES: 42/42 SUCCESS",
      ]);
      setTimeout(() => {
        setLogs((prev) => [...prev, ">> NEURAL_RELOAD_COMPLETE: MODEL_ACTIVE"]);
        setIsDeploying(false);
        toast.success("New Neural Weights Deployed Successfully!", {
          description: "Model v3.2.0 is now active across all nodes.",
        });
      }, 1500);
    }, 2000);
  };

  const runBenchmark = () => {
    setBenchmarking(true);
    setLogs((prev) => [...prev, ">> STARTING_HARDWARE_BENCHMARK: NODE-04"]);
    setTimeout(() => {
      setLogs((prev) => [...prev, ">> FLOPS_SCORE: 12.4 TFLOPS (FP16)"]);
      setLogs((prev) => [...prev, ">> INFERENCE_LATENCY_P99: 14.2ms"]);
      setBenchmarking(false);
      toast.success("Node Benchmark Complete", {
        description: "Node-04 is performing within optimal parameters.",
      });
    }, 3000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleStartScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanResult(false);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanResult(true);
        toast.success(t("sentinel.weightsIntegrityAuditSuccess"), {
          description: t("sentinel.weightsVerifiedAuthentic"),
        });
          setAuditHistory((prev) => [
            {
              node: "NODE-04 (Compute Blackwell)",
              time: new Date().toLocaleString("id-ID"),
              hash: "8f9a2b7c4d5e6f1a3b5c7d9e0f2a4b6c8d0e1f3a5b7c9d1e3f5a7b9c1d3e5f7a",
            },
            ...prev,
          ]);
          return 100;
        }
        return p + 10;
      });
    }, 150);
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedActive = localStorage.getItem("sentinel_training_active");
      const savedEpoch = localStorage.getItem("sentinel_training_epoch");
      const savedMap50 = localStorage.getItem("sentinel_training_map50");
      const savedMins = localStorage.getItem("sentinel_training_mins");
      const savedBars = localStorage.getItem("sentinel_training_bars");

      if (savedActive !== null) setTrainingActive(savedActive === "true");
      if (savedEpoch !== null) setEpoch(parseInt(savedEpoch, 10));
      if (savedMap50 !== null) setMap50(parseFloat(savedMap50));
      if (savedMins !== null) setMinutesRemaining(parseInt(savedMins, 10));
      if (savedBars !== null) {
        try {
          setChartBars(JSON.parse(savedBars));
        } catch {
          // ignore
        }
      } else {
        setChartBars(
          Array.from({ length: 40 }, (_, i) => {
            const base = 20 + Math.pow(i, 1.2) * 1.5;
            return Math.min(95, base + Math.sin(i * 0.5) * 5);
          }),
        );
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("sentinel_training_active", String(trainingActive));
      localStorage.setItem("sentinel_training_epoch", String(epoch));
      localStorage.setItem("sentinel_training_map50", String(map50));
      localStorage.setItem("sentinel_training_mins", String(minutesRemaining));
      localStorage.setItem("sentinel_training_bars", JSON.stringify(chartBars));
    }
  }, [trainingActive, epoch, map50, minutesRemaining, chartBars, mounted]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        <div
          className={`flex-1 transition-all duration-300 ${showDocs ? "lg:mr-[350px]" : ""}`}
        >

      {/* Model Detail Modal */}
      {selectedModel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-none bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {selectedModel.name}
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    Neural Performance Audit // ISO-17025 Verified
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedModel(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">
                    Precision Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-100 dark:border-slate-700">
                      <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">
                        mAP@50
                      </span>
                      <span className="text-2xl font-mono font-bold text-emerald-500">
                        {selectedModel.map}
                      </span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-100 dark:border-slate-700">
                      <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">
                        F1 Score
                      </span>
                      <span className="text-2xl font-mono font-bold text-primary">
                        0.941
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">
                    Confusion Matrix (Synthetic)
                  </h3>
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-none border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center relative group overflow-hidden">
                    <div className="grid grid-cols-3 grid-rows-3 w-[80%] h-[80%] gap-1">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-center text-[10px] font-bold ${i % 4 === 0 ? "bg-primary/40 text-white" : "bg-slate-200/50 dark:bg-slate-700/50 text-slate-400"}`}
                        >
                          {i % 4 === 0 ? "0.98" : "0.01"}
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6 text-center">
                      <p className="text-[10px] text-white font-bold uppercase">
                        High-resolution spectral deconstruction matrix required
                        for full audit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">
                    Inference Latency Curve
                  </h3>
                  <div className="h-[140px] flex items-end gap-1 px-2 border-b border-l border-slate-200 dark:border-slate-700">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-t-sm"
                        style={{ height: `${20 + Math.random() * 60}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[8px] font-black text-slate-400 uppercase">
                    <span>Node-01</span>
                    <span>Node-04</span>
                    <span>Node-12</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                    Model Metadata
                  </h3>
                  <div className="space-y-3">
                    {[
                      { k: "Engine", v: "Ultralytics YOLOv8.3.1" },
                      { k: "Input Resolution", v: "640x640px (RGB)" },
                      { k: "Total Parameters", v: "3.2M (Nano)" },
                      { k: "Export Format", v: "ONNX / TensorRT" },
                      { k: "Audit Status", v: "PASSED_ISO_17025" },
                    ].map((item) => (
                      <div
                        key={item.k}
                        className="flex justify-between items-center text-[10px] font-bold uppercase"
                      >
                        <span className="text-slate-400">{item.k}</span>
                        <span className="text-slate-900 dark:text-white">
                          {item.v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setSelectedModel(null)}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all rounded-none"
                  >
                    {t("sentinel.closeRegistryDetail")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

          <div className="max-w-[1500px] mx-auto px-4 sm:px-8 py-0 sm:py-0 space-y-4 sm:space-y-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 sm:mb-6 pt-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                    {t("sentinel.title")}
                  </h1>
                  <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
                    {t("sentinel.neuralInfrastructureMonitoring")}{" "}
                    {"//"} V3.2.0-STABLE
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-none">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-[6px] sm:text-[8px] font-black text-slate-400 uppercase leading-none">
                      {t("sentinel.globalLatency")}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-900 dark:text-white leading-none mt-0.5">
                      42.8ms
                    </span>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <DocumentationToggle
                    showDocs={showDocs}
                    setShowDocs={setShowDocs}
                    text={t("sentinel.protocol")}
                  />
                </div>
                <button
                  onClick={() => {
                    setIsSyncing(true);
                    setTimeout(() => {
                      setIsSyncing(false);
                      toast.success(t("sentinel.globalNodeSyncComplete"));
                    }, 1500);
                  }}
                  className={`flex items-center gap-2 px-3 sm:px-6 py-1.5 sm:py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all ${isSyncing ? "animate-pulse" : ""}`}
                >
                  <RefreshCw
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  {isSyncing
                    ? t("sentinel.syncing")
                    : t("sentinel.sync")}
                </button>
              </div>
            </div>

        {/* Top Section: Training Hub & Hardware Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Neural Training Hub */}
          <div className="lg:col-span-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xl rounded-none">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {t("sentinel.neuralTrainingMatrix")}
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {t("sentinel.fineTuningCompetitionGrade")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    {t("sentinel.activeSession")}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    FT_COLONY_V3_NIGHTLY
                  </span>
                </div>
                <button
                  onClick={() => {
                    const next = !trainingActive;
                    setTrainingActive(next);
                    if (!next) {
                      toast.error(t("sentinel.trainingHalted"), {
                        description: t("sentinel.trainingHaltedDesc", { epoch: String(epoch), map: map50.toFixed(4) }),
                        duration: 6000,
                      });
                    } else {
                      toast.success(t("sentinel.trainingResumed"), {
                        description: t("sentinel.trainingResumedDesc", { epoch: String(epoch), map: map50.toFixed(4) }),
                        duration: 4000,
                      });
                    }
                  }}
                  className={`px-4 py-1.5 rounded text-[9px] font-black uppercase tracking-widest border transition-all ${
                    trainingActive
                      ? "border-rose-500/20 text-rose-500 bg-rose-500/10 hover:bg-rose-500/20"
                      : "border-emerald-500/20 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                  }`}
                >
                  {trainingActive
                    ? t("sentinel.haltTraining")
                    : t("sentinel.resumeTraining")}
                </button>
              </div>
            </div>

            <div className="p-8 pb-4 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Progress & Stats */}
              <div className="space-y-8 md:col-span-1">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {t("sentinel.trainingProgress")}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {epoch}/80 Epochs
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000 ease-in-out"
                      style={{ width: `${(epoch / 80) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-none border border-slate-100 dark:border-slate-800">
                    <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">
                      mAP@50
                    </span>
                    <span className="text-lg font-mono font-bold text-emerald-500 tabular-nums transition-all duration-500">
                      {map50.toFixed(4)}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-none border border-slate-100 dark:border-slate-800">
                    <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">
                      mAP@50-95
                    </span>
                    <span className="text-lg font-mono font-bold text-primary tabular-nums transition-all duration-500">
                      {(map50 * 0.72).toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-primary/20 bg-primary/5 rounded-none flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <div>
                    <span className="block text-[8px] font-black text-primary uppercase">
                      {t("sentinel.estimatedCompletion")}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                      {trainingActive
                        ? minutesRemaining > 0
                          ? t("sentinel.minutesRemaining", { minutes: minutesRemaining })
                          : t("sentinel.almostDone")
                        : t("sentinel.trainingPaused")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Training Visualization (Mini Graph) */}
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                    {t("sentinel.mapConvergenceCurve")}
                  </h3>
                  <div className="flex gap-4 text-[8px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
                      {t("sentinel.training")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                      {t("sentinel.validation")}
                    </span>
                  </div>
                </div>
                <div className="h-[180px] w-full flex items-end gap-[1px] px-2 border-b border-l border-slate-200 dark:border-slate-800">
                  {chartBars.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col justify-end group relative h-full"
                    >
                      <div
                        className="w-full bg-primary/40 rounded-t-sm group-hover:bg-primary transition-all duration-700 ease-in-out cursor-pointer"
                        style={{ height: `${(h / 100) * 180}px` }}
                      />
                      <div
                        className="absolute bottom-0 w-full bg-emerald-500/50 rounded-t-sm pointer-events-none transition-all duration-700 ease-in-out"
                        style={{ height: `${((h * 0.88) / 100) * 180}px` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase px-1 mt-1">
                  <span>Epoch 0</span>
                  <span>Epoch 20</span>
                  <span>Epoch 40</span>
                  <span>Epoch 60</span>
                  <span>Epoch 80</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hardware Monitor */}
          <div className="lg:col-span-1 space-y-6">
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-none shadow-sm space-y-6">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                {t("sentinel.hardwareTelemetry")}
              </h3>

              <div className="space-y-4">
                {[
                  {
                    label: t("sentinel.gpuTemperature"),
                    value: "64°C",
                    progress: 64,
                    color: "rose",
                  },
                  {
                    label: t("sentinel.vramUsage"),
                    value: "4.2GB / 8GB",
                    progress: 52,
                    color: "blue",
                  },
                  {
                    label: t("sentinel.coreFrequency"),
                    value: "2.1 GHz",
                    progress: 85,
                    color: "amber",
                  },
                  {
                    label: t("sentinel.networkIngress"),
                    value: "1.2 GB/s",
                    progress: 30,
                    color: "emerald",
                  },
                ].map((hw) => (
                  <div key={hw.label} className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                      <span className="text-slate-500">{hw.label}</span>
                      <span className="text-slate-900 dark:text-white">
                        {hw.value}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${hw.color}-500`}
                        style={{ width: `${hw.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-none flex items-center justify-between">
                  <div>
                    <span className="block text-[8px] font-black text-slate-400 uppercase">
                      {t("sentinel.computeNode")}
                    </span>
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white">
                      NODE-04-BLACKWELL
                    </span>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 ${benchmarking ? "animate-spin" : ""}`}
                  />
                </div>
                <button
                  onClick={runBenchmark}
                  disabled={benchmarking}
                  className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[8px] font-black uppercase tracking-widest hover:opacity-90 transition-all rounded disabled:opacity-50"
                >
                  {benchmarking
                    ? t("sentinel.benchmarking")
                    : t("sentinel.runNodeBenchmark")}
                </button>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-none shadow-sm">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                <Database className="w-4 h-4 text-primary" />
                {t("sentinel.registryHealth")}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-slate-500">
                    {t("sentinel.integrityCheck")}
                  </span>
                  <span className="text-emerald-500">
                    {t("sentinel.oneHundredPercentPassed")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-slate-500">
                    {t("sentinel.auditRedundancy")}
                  </span>
                  <span className="text-blue-500">
                    {t("sentinel.tripleLinked")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Global Metrics & Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sentinel Stream Terminal */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                {t("sentinel.liveSentinelStream")}
              </h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-none text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  {t("sentinel.secureUplinkActive")}
                </div>
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-none overflow-hidden shadow-2xl group transition-all duration-300 hover:border-primary/30">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 group-hover:bg-rose-500/80 transition-colors" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 group-hover:bg-amber-500/80 transition-colors" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500/80 transition-colors" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.4em]">
                    Sentinel_Core_Terminal
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
              <div
                ref={scrollRef}
                className="h-[320px] overflow-y-auto p-6 font-mono text-[10px] space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {logs.map((log, i) => (
                  <div key={i} className="flex group/line">
                    <span
                      className={
                        log.startsWith(">>")
                          ? "text-amber-400 font-bold"
                          : log.includes("SUCCESS")
                            ? "text-emerald-400"
                            : log.includes("EPOCH")
                              ? "text-primary"
                              : log.includes("ERROR")
                                ? "text-rose-400"
                                : "text-slate-400"
                      }
                    >
                      {log}
                    </span>
                  </div>
                ))}
                <div className="flex">
                  <span className="animate-pulse text-primary font-bold">
                    _
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Model Registry & Deploy */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t("sentinel.neuralModelRegistry")}
              </h3>
              <span className="text-[9px] font-black text-slate-400 uppercase">
                {t("sentinel.modelsFound")}
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  name: "v3.2.0_FINETUNED",
                  date: "Just now",
                  map: "0.965",
                  status: "READY",
                  color: "emerald",
                },
                {
                  name: "v3.1.2_BETA",
                  date: "2 days ago",
                  map: "0.942",
                  status: "ACTIVE",
                  color: "blue",
                },
                {
                  name: "v3.1.1_STABLE",
                  date: "1 week ago",
                  map: "0.921",
                  status: "LEGACY",
                  color: "slate",
                },
              ].map((model) => (
                <div
                  key={model.name}
                  className="group relative border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 rounded-none transition-all hover:border-primary/50 hover:shadow-lg cursor-pointer"
                  onClick={() => setSelectedModel(model)}
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {model.name}
                      </h4>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                        {model.date}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-${model.color}-500/20 text-${model.color}-500 bg-${model.color}-500/5`}
                    >
                      {model.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-none bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase">
                          {t("sentinel.precisionMap")}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {model.map}
                        </span>
                      </div>
                    </div>

                    {model.status === "READY" && (
                      <button
                        onClick={handleDeploy}
                        disabled={isDeploying}
                        className={`flex-1 py-2 rounded-none text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                          isDeploying
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                            : "bg-primary text-white hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]"
                        }`}
                      >
                        <RefreshCw
                          className={`w-3 h-3 ${isDeploying ? "animate-spin" : ""}`}
                        />
                        {isDeploying
                          ? t("sentinel.deploying")
                          : t("sentinel.deploy")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Epidemiological Security & Predictive Kinetics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bio-Hazard Radar */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                {t("sentinel.bioHazardContaminationRadar")}
              </h3>
              <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <span>ISO-14644 Cleanroom Compliance</span>
                <span className="text-rose-500 flex items-center gap-1.5 animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />{" "}
                  {t("sentinel.live")}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-none shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <ShieldCheck className="w-48 h-48 text-rose-500" />
              </div>

              <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800 relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">
                      {t("sentinel.environmentalAnomalies")}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">
                      {t("sentinel.detectingInfrastructuralFailures")}
                    </p>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded text-rose-500 flex flex-col items-end">
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      {t("sentinel.facilityStatus")}
                    </span>
                    <span className="text-[10px] font-bold uppercase">
                      {t("sentinel.warningLevel2")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-5 relative z-10">
                {[
                  {
                    class: "dust_debris",
                    label: t("sentinel.dustParticulates"),
                    count: 124,
                    limit: 50,
                    color: "rose",
                    issue: t("sentinel.hepaFilterBreach"),
                  },
                  {
                    class: "media_crack",
                    label: t("sentinel.agarIntegrityFailure"),
                    count: 12,
                    limit: 20,
                    color: "amber",
                    issue: t("sentinel.incubatorTempFluctuation"),
                  },
                  {
                    class: "bubble",
                    label: t("sentinel.preparationGasPockets"),
                    count: 45,
                    limit: 100,
                    color: "blue",
                    issue: t("sentinel.nominalWithinTolerance"),
                  },
                ].map((anomaly) => (
                  <div key={anomaly.class} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full bg-${anomaly.color}-500 ${anomaly.count > anomaly.limit ? "animate-ping" : ""}`}
                        />
                        <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          {anomaly.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-mono font-bold ${anomaly.count > anomaly.limit ? "text-rose-500" : "text-slate-400"}`}
                        >
                          {anomaly.count} / {anomaly.limit}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${anomaly.count > anomaly.limit ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" : `bg-${anomaly.color}-500`}`}
                        style={{
                          width: `${Math.min(100, (anomaly.count / anomaly.limit) * 100)}%`,
                        }}
                      />
                    </div>
                    {anomaly.count > anomaly.limit && (
                      <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-1">
                        &gt;&gt; ROOT CAUSE AI: {anomaly.issue}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Predictive Kinetics */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                {t("sentinel.earlyReleaseTrajectory")}
              </h3>
              <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <span>Gompertz Growth Model</span>
                <span className="text-emerald-500 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                  {t("sentinel.active")}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-none shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Globe className="w-48 h-48 text-emerald-500" />
              </div>

              <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800 relative z-10 flex gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center animate-spin">
                  <Activity className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">
                    Batch #441-A (PCA)
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">
                    {t("sentinel.hourSnapshotPrediction")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 relative z-10 mb-6">
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {t("sentinel.currentState")}
                  </span>
                  <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white">
                    12 <span className="text-xs text-slate-500">CFU/ml</span>
                  </div>
                  <p className="text-[9px] text-emerald-500 font-bold uppercase mt-1">
                    {t("sentinel.subVisualMicroColonies")}
                  </p>
                </div>
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {t("sentinel.aiProjection")}
                  </span>
                  <div className="text-3xl font-mono font-bold text-emerald-500">
                    45 <span className="text-xs text-slate-500">CFU/ml</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                    {t("sentinel.maxThreshold")}
                  </p>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-none relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">
                    {t("sentinel.clearanceAuthorized")}
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                  {t("sentinel.clearanceAuthorizedDesc")}
                  <span className="text-slate-900 dark:text-white block mt-1">
                    {t("sentinel.supplyChainImpact")}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Neural Synaptic Audit & ISO-17025 Compliance Ledger */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-none overflow-hidden shadow-xl">
          <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                <BrainCircuit className="w-5 h-5 text-primary animate-pulse" />
                {t("sentinel.isoComplianceAuditLedger")}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                {t("sentinel.isoAuditLedgerSubtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-none text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                ISO-17025:SECURE
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Compliance Status Checklist */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                {t("sentinel.auditComplianceStatus")}
              </h4>
              <div className="space-y-4">
                {[
                  {
                    label: t("sentinel.detectorDriftCalibration"),
                    status: "0.02% (Optimal)",
                    desc: t("sentinel.maxAllowableDrift"),
                  },
                  {
                    label: t("sentinel.controlSampleValidation"),
                    status: t("sentinel.passedCfuTarget"),
                    desc: t("sentinel.matchingAccuracy"),
                  },
                  {
                    label: t("sentinel.peerReviewNodeBackup"),
                    status: t("sentinel.connectedNode12"),
                    desc: t("sentinel.autoSyncEvery12Hours"),
                  },
                  {
                    label: t("sentinel.auditLedgerEncryption"),
                    status: "AES-GCM 256",
                    desc: t("sentinel.digitalSignatureValid"),
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-none"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wide leading-tight">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase">
                          {item.status}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">
                          |
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Simulated Weights Scan Tool */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                {t("sentinel.neuralIntegrityScanner")}
              </h4>
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-none space-y-6">
                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    {t("sentinel.selectTargetNode")}
                  </label>
                  <select
                    className="w-full bg-slate-900 border border-slate-800 rounded-none px-3 py-2 text-[10px] font-bold uppercase text-white outline-none focus:border-primary"
                    defaultValue="node-04"
                  >
                    <option value="node-01">Node-01 (Main Server)</option>
                    <option value="node-04">Node-04 (Compute Blackwell)</option>
                    <option value="node-12">Node-12 (Edge Laboratorium)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    <span>
                      {t("sentinel.scanningIntegrity")}
                    </span>
                    <span className="text-primary">{scanProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 border border-slate-800 rounded-none overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>

                {scanResult && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-none flex gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 animate-bounce" />
                    <div className="min-w-0 flex-1">
                      <span className="block text-[8px] font-black text-emerald-500 uppercase">
                        {t("sentinel.scanResultNominal")}
                      </span>
                      <p className="text-[9px] font-mono text-slate-300 mt-1 leading-snug break-all truncate">
                        SHA-256: 8f9a2b7c4d5e...5f7a
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleStartScan}
                  disabled={isScanning}
                  className="w-full py-3 bg-primary text-slate-950 text-[9px] font-black uppercase tracking-widest hover:bg-primary/95 transition-all disabled:opacity-50"
                >
                  {isScanning
                    ? t("sentinel.scanningWeights")
                    : t("sentinel.runWeightsAudit")}
                </button>
              </div>
            </div>

            {/* Column 3: Cryptographic Audit Logs */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                {t("sentinel.cryptographicAuditLogs")}
              </h4>
              <div className="bg-slate-950 border border-slate-800 p-4 h-[290px] overflow-y-auto font-mono text-[9px] space-y-3 [&::-webkit-scrollbar]:hidden">
                {auditHistory.map((h, i) => (
                  <div
                    key={i}
                    className="border-b border-slate-900 pb-2 last:border-0"
                  >
                    <div className="flex justify-between text-slate-400 font-bold uppercase mb-1">
                      <span>{h.node}</span>
                      <span className="text-emerald-500">✓ SECURE</span>
                    </div>
                    <p className="text-slate-500 text-[8px]">{h.time}</p>
                    <p className="text-slate-300 mt-1 truncate">
                      HASH: {h.hash}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
      <DocumentationSidebar
          showDocs={showDocs}
          setShowDocs={setShowDocs}
          directory={t("sentinel.docsDirectory")}
          title={t("sentinel.protocol")}
          description={t("sentinel.docsDescription")}
          rawText={logs.join("\n")}
        >
          <div className="space-y-6 text-[10px] sm:text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
            <div>
              <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">
                01. {t("sentinel.neuralTrainingMatrix")}
              </h4>
              <p>
                {t("sentinel.docTrainingMatrix")}
              </p>
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">
                02. {t("sentinel.hardwareTelemetry")}
              </h4>
              <p>
                {t("sentinel.docHardwareTelemetry")}
              </p>
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">
                03.{" "}
                {t("sentinel.modelRegistryDeployment")}
              </h4>
              <p>
                {t("sentinel.docModelRegistry")}
              </p>
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">
                04.{" "}
                {t("sentinel.bioHazardRadarPredictiveKinetics")}
              </h4>
              <p>
                {t("sentinel.docBioHazardRadar")}
              </p>
            </div>
          </div>
        </DocumentationSidebar>
    </div>
  </div>
  );
}

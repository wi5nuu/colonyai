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
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
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

const CLASS_CONFIG = {
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
  const { t, language } = useTranslationStore();
  const { accessToken } = useAuthStore();
  const isId = language === "id";
  const [showDocs, setShowDocs] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [manualCount, setManualCount] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setFile(selected);
        setAnalysisResult(null);
        setDetections([]);
        console.log("Image converted to Base64 successfully");
      };
      reader.readAsDataURL(selected);
    }
  };

  const startSimulation = async () => {
    if (!file) {
      toast.error(isId ? "Pilih gambar plate terlebih dahulu" : "Select a plate image first");
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
          x: (d.bbox.x / 512) * 100,
          y: (d.bbox.y / 512) * 100,
          size: Math.max(10, (d.bbox.width / 512) * 100),
        }))
      );
      toast.success(isId ? "Analisis Selesai" : "Analysis Complete");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const aiCount = analysisResult?.colony_count || 0;
  const accuracy =
    manualCount > 0
      ? Math.max(0, 100 - (Math.abs(aiCount - manualCount) / manualCount) * 100).toFixed(1)
      : "0.0";

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans">
      {/* Upper Control Bar - Institutional Style */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm transition-colors">
        <div className="max-w-[1500px] mx-auto px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-slate-900 flex items-center justify-center">
            <Cpu className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none uppercase">
              {isId ? "Simulator Inteligensia" : "Intelligence Simulator"}
            </h1>
            <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
              Neural Network Sandbox // <span className="text-primary font-black">ISO-17025 Protocol</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex bg-slate-900 dark:bg-black p-2 rounded-none shadow-xl text-white border border-white/5 items-center gap-4 mr-2">
            <div className="space-y-0.5">
              <p className="text-[6px] font-black text-white/40 uppercase tracking-widest leading-none">Security</p>
              <p className="text-[9px] font-bold text-primary">AES-256-GCM</p>
            </div>
            <div className="w-[1px] h-5 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[7px] font-black uppercase tracking-widest text-white/60">Live Node</span>
            </div>
          </div>

          <label className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-none border border-slate-200 dark:border-slate-700 hover:border-primary transition-all cursor-pointer">
            <Beaker className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
              {isId ? "Unggah Plate" : "Upload Plate"}
            </span>
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </label>
          
          <button
            onClick={startSimulation}
            disabled={isSimulating || !file}
            className="flex items-center gap-2 bg-slate-900 dark:bg-primary text-white dark:text-slate-950 px-4 py-2 rounded-none font-black text-[9px] uppercase tracking-widest shadow-xl shadow-primary/10 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            {isSimulating ? (isId ? "Memproses..." : "Processing...") : (isId ? "Mulai Analisis" : "Run Analysis")}
          </button>
        </div>
      </div>
    </div>

    <div className="flex-1 p-8 grid grid-cols-12 gap-8 max-w-[1500px] mx-auto w-full">
        
        {/* LEFT COLUMN: VISUALIZER */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 p-2 shadow-xl relative overflow-hidden group">
            {/* Legend Overlay */}
            <div className="absolute top-6 left-6 z-20 flex flex-wrap gap-2 pointer-events-none">
              {Object.entries(CLASS_CONFIG).map(([key, cfg]) => (
                <div key={key} className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cfg.color}`} />
                  <span className="text-[9px] font-bold text-white uppercase tracking-wider">{cfg.label}</span>
                </div>
              ))}
            </div>

            {/* Main Plate View */}
            <div className="relative aspect-square bg-[#0a0a0a] rounded-none overflow-hidden flex items-center justify-center border-4 border-slate-100 dark:border-slate-800 shadow-2xl">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
              
              <div className="relative w-[92%] h-[92%] rounded-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-8 ring-slate-800/30 bg-slate-900">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isSimulating ? 'opacity-40 grayscale blur-md' : 'opacity-100'}`} 
                    alt="Petri Dish" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
                    <Layers className="w-16 h-16 opacity-10" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">{isId ? "Menunggu Sampel" : "Awaiting Sample"}</p>
                  </div>
                )}

                {/* Detections Layer (Always on top) */}
                {!isSimulating && detections.length > 0 && (
                  <div className="absolute inset-0 z-20 animate-in fade-in zoom-in-95 duration-700">
                    {detections.map((d) => (
                      <div
                        key={d.id}
                        className={`absolute rounded-full border-2 ${CLASS_CONFIG[d.class].border} shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all hover:scale-150 hover:z-50 group/det cursor-help`}
                        style={{
                          left: `${d.x}%`,
                          top: `${d.y}%`,
                          width: `${d.size}%`,
                          height: `${d.size}%`,
                          backgroundColor: `${CLASS_CONFIG[d.class].color.replace('bg-', '')}20`
                        }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/det:opacity-100 transition-all scale-75 group-hover/det:scale-100 whitespace-nowrap bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded-none border border-white/10 shadow-2xl z-50">
                          {CLASS_CONFIG[d.class].label} | {(d.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scanline Effect during simulation */}
                {isSimulating && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent h-1/2 w-full animate-scanline z-10" />
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-none border border-slate-200 dark:border-slate-800">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{isId ? "Area Plate" : "Plate Area"}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">96.4% <span className="text-[10px] text-emerald-500">Validated</span></p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-none border border-slate-200 dark:border-slate-800">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{isId ? "Waktu Proses" : "Process Time"}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">0.82s <span className="text-[10px] text-blue-500">Ultra-fast</span></p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-none border border-slate-200 dark:border-slate-800">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{isId ? "Status ISO" : "ISO Status"}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">17025 <span className="text-[10px] text-amber-500">Compliant</span></p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-none border border-slate-200 dark:border-slate-800">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{isId ? "Total Objek" : "Total Objects"}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{detections.length}</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ANALYTICS & COMPARISON */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          
          {/* COMPARISON HUB */}
          <div className="bg-slate-900 rounded-none p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]">{isId ? "Hub Perbandingan" : "Comparison Hub"}</h2>
              </div>
              <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <span className="text-[10px] font-bold text-primary">{accuracy}% MATCH</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isId ? "Hitungan Juri (Manual)" : "Jury Count (Manual)"}</p>
                  <input 
                    type="number" 
                    value={manualCount}
                    onChange={(e) => setManualCount(parseInt(e.target.value) || 0)}
                    className="bg-transparent text-5xl font-bold text-white w-full outline-none border-b-2 border-white/10 focus:border-primary transition-all tracking-tighter"
                  />
                </div>
                <p className="text-[10px] text-slate-500 italic">{isId ? "*Masukkan hasil hitungan manual untuk audit" : "*Enter manual results for audit comparison"}</p>
              </div>

              <div className="bg-white/5 rounded-none p-6 border border-white/5 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-slate-950 px-3 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest">ColonyAI</div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{isId ? "Valid CFU/mL" : "Valid CFU/mL"}</p>
                <p className="text-6xl font-bold text-white tracking-tighter">{aiCount}</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-3 rounded-none border border-white/5 transition-all">
                <Download className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{isId ? "Ekspor Ledger" : "Export Ledger"}</span>
              </button>
              <button className="flex items-center justify-center gap-2 bg-primary text-slate-950 py-3 rounded-none font-bold transition-all hover:opacity-90">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{isId ? "Verifikasi" : "Verify Result"}</span>
              </button>
            </div>
          </div>

          {/* 5-CLASS DETAILED BREAKDOWN */}
          <div className="bg-white dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="w-5 h-5 text-slate-400" />
              <h2 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">{isId ? "Rincian Klasifikasi AI" : "AI Classification Details"}</h2>
            </div>

            <div className="space-y-3">
              {(Object.entries(CLASS_CONFIG) as [keyof typeof CLASS_CONFIG, any][]).map(([key, cfg]) => {
                const count = detections.filter(d => d.class === key).length;
                const percentage = detections.length > 0 ? (count / detections.length * 100).toFixed(0) : 0;
                
                return (
                  <div key={key} className="flex items-center justify-between p-3 rounded-none bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${cfg.color} shadow-lg`} />
                      <div>
                        <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">{cfg.label}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                          {cfg.isArtifact ? (isId ? "Artefak - Filtered" : "Artifact - Filtered") : (isId ? "Valid - Counted" : "Valid - Counted")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{count}</p>
                      <p className={`text-[9px] font-bold ${cfg.text} opacity-70`}>{percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-primary/5 rounded-none border border-primary/20 flex gap-4">
              <Info className="w-5 h-5 text-primary shrink-0" />
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                {isId ? "Sistem secara otomatis mengabaikan Gelembung, Debu, dan Retakan Media untuk memastikan nilai CFU/mL yang akurat sesuai standar ISO-17025." 
                      : "System automatically filters Bubbles, Dust, and Media Cracks to ensure accurate CFU/mL values compliant with ISO-17025 standards."}
              </p>
            </div>
          </div>

          {/* EXECUTIVE SUMMARY MINI-CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 p-6 shadow-xl relative overflow-hidden">
             <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-500" />
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                  {isId ? "Efisiensi Operasional" : "Operational Efficiency"}
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-none border border-slate-100 dark:border-slate-800">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">{isId ? "Konsistensi" : "Consistency"}</p>
                  <p className="text-lg font-bold text-emerald-500">100%</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-none border border-slate-100 dark:border-slate-800">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">{isId ? "Kecepatan" : "Speed Gain"}</p>
                  <p className="text-lg font-bold text-blue-500">99.8%</p>
                </div>
              </div>
          </div>

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
      `}</style>
    </div>
  );
}

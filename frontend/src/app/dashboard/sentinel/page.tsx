'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Activity, Server, Database, Cpu, ShieldCheck, RefreshCw, Globe, BrainCircuit, Terminal, Zap, X, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { 
  DocumentationSidebar, 
  DocumentationToggle 
} from "@/components/DocumentationSidebar";

import { toast } from "sonner";
import { useTranslationStore } from "@/lib/i18n/store";

export default function SentinelPage() {
  const { t, language } = useTranslationStore();
  const isId = language === 'id';
  const [isSyncing, setIsSyncing] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [showDocs, setShowDocs] = useState(false)
  const [trainingActive, setTrainingActive] = useState(true)
  const [epoch, setEpoch] = useState(42)
  const [map50, setMap50] = useState(0.924)
  const [benchmarking, setBenchmarking] = useState(false)
  const [selectedModel, setSelectedModel] = useState<any>(null)
  
  const [metrics, setMetrics] = useState([
    { name: 'Neural Cluster 01-A', status: 'Synchronized', load: 10.7, unit: '%', icon: Cpu, color: 'emerald' },
    { name: 'Multi-Tenant Ledger', status: 'Connected', load: 0.76, unit: 'ms', icon: Database, color: 'blue' },
    { name: 'S3 Object Storage', status: 'Hardened', load: 1.2, unit: ' PB', icon: Server, color: 'purple' },
    { name: 'Security Shield', status: 'Active', load: 'Active', unit: '', icon: ShieldCheck, color: 'indigo' },
  ])
  const [activeRequests, setActiveRequests] = useState(1204)
  const [logs, setLogs] = useState<string[]>([
    "INITIALIZING_SENTINEL_PROTOCOLS...",
    "HANDSHAKE_SECURE_NODE_04: SUCCESS",
    "ENCRYPTING_TRAFFIC_LAYER_7: ACTIVE",
    "NEURAL_MAP_READY: COLONY_V3_2026",
    "GPU_CORE_TEMP_STABLE: 62°C",
    "VRAM_ALLOCATION: 4.2GB / 8.0GB"
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRequests(prev => prev + Math.floor(Math.random() * 10) - 4)
      
      if (trainingActive) {
        if (Math.random() > 0.7) {
          setEpoch(prev => (prev < 80 ? prev + 1 : prev))
          setMap50(prev => Math.min(0.985, prev + (Math.random() * 0.002)))
          setLogs(prev => [...prev.slice(-20), `TRAINING_EPOCH_${epoch + 1}: mAP50=${map50.toFixed(4)}`])
        }
      }

      const newLogs = [
        `INCOMING_REQUEST_FROM_IP: 10.42.0.${Math.floor(Math.random() * 255)}`,
        `NEURAL_INFERENCE_COMPLETE: 124ms`,
        `ENCRYPTION_HASH_ROTATED: SHA-512_SECURE`,
        `DATABASE_SYNC_NODE_02: COMPLETED`,
        `GPU_CORE_FREQ: ${2100 + Math.floor(Math.random() * 100)} MHz`
      ]
      
      if (Math.random() > 0.8) {
        setLogs(prev => [...prev.slice(-20), newLogs[Math.floor(Math.random() * newLogs.length)]])
      }

      setMetrics(prev => prev.map(m => {
        if (m.name.includes('Cluster')) {
          const newVal = Math.max(8, Math.min(45, m.load as number + (Math.random() * 4 - 2)))
          return { ...m, load: newVal }
        }
        if (m.name.includes('Ledger')) {
          const newVal = Math.max(0.4, Math.min(1.5, m.load as number + (Math.random() * 0.2 - 0.1)))
          return { ...m, load: newVal }
        }
        return m
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [trainingActive, epoch, map50])

  const handleDeploy = () => {
    if (isDeploying) return
    setIsDeploying(true)
    
    setLogs(prev => [...prev, ">> INITIATING_NEURAL_DEPLOYMENT: v3.2.0_FINETUNED"])
    
    setTimeout(() => {
      setLogs(prev => [...prev, ">> TRANSFERRING_WEIGHTS_TO_EDGE_NODES: 42/42 SUCCESS"])
      setTimeout(() => {
        setLogs(prev => [...prev, ">> NEURAL_RELOAD_COMPLETE: MODEL_ACTIVE"])
        setIsDeploying(false)
        toast.success("New Neural Weights Deployed Successfully!", {
          description: "Model v3.2.0 is now active across all nodes."
        })
      }, 1500)
    }, 2000)
  }

  const runBenchmark = () => {
    setBenchmarking(true)
    setLogs(prev => [...prev, ">> STARTING_HARDWARE_BENCHMARK: NODE-04"])
    setTimeout(() => {
      setLogs(prev => [...prev, ">> FLOPS_SCORE: 12.4 TFLOPS (FP16)"])
      setLogs(prev => [...prev, ">> INFERENCE_LATENCY_P99: 14.2ms"])
      setBenchmarking(false)
      toast.success("Node Benchmark Complete", {
        description: "Node-04 is performing within optimal parameters."
      })
    }, 3000)
  }

  useEffect(() => {
    if (scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 relative bg-white dark:bg-slate-950 transition-colors duration-300 min-h-[calc(100vh-64px)]">
      
      {/* Documentation Sidebar Overlay */}
      <DocumentationSidebar 
        showDocs={showDocs} 
        setShowDocs={setShowDocs} 
        directory="System / Sentinel" 
        title="Sentinel Protocol" 
        description="Global system monitoring and neural deployment control center."
        rawText={logs.join('\n')}
      >
        <div className="space-y-6 text-[10px] sm:text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
           <div>
             <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">01. Inference Cluster</h4>
             <p>Monitoring real-time compute load across distributed GPU nodes. Thresholds are calibrated for Blackwell architecture (RTX 5050 series). Standard operational ceiling: 85% Load.</p>
           </div>
           <div>
             <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">02. Deployment Lifecycle</h4>
             <p>Neural weights are delivered via secure gRPC stream. Every deployment undergoes atomic verification before reloading inference engines. ISO-17025 compliance requires cryptographic signing of all weights.</p>
           </div>
           <div>
             <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">03. Fine-Tuning SOP</h4>
             <p>Automated hyperparameter optimization is active. Early stopping is triggered if mAP convergence fails to improve for 20 consecutive epochs.</p>
           </div>
        </div>
      </DocumentationSidebar>

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
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedModel.name}</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Neural Performance Audit // ISO-17025 Verified</p>
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
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Precision Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-100 dark:border-slate-700">
                          <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">mAP@50</span>
                          <span className="text-2xl font-mono font-bold text-emerald-500">{selectedModel.map}</span>
                       </div>
                       <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-100 dark:border-slate-700">
                          <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">F1 Score</span>
                          <span className="text-2xl font-mono font-bold text-primary">0.941</span>
                       </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Confusion Matrix (Synthetic)</h3>
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-none border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center relative group overflow-hidden">
                       <div className="grid grid-cols-3 grid-rows-3 w-[80%] h-[80%] gap-1">
                          {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className={`flex items-center justify-center text-[10px] font-bold ${i % 4 === 0 ? 'bg-primary/40 text-white' : 'bg-slate-200/50 dark:bg-slate-700/50 text-slate-400'}`}>
                              {i % 4 === 0 ? '0.98' : '0.01'}
                            </div>
                          ))}
                       </div>
                       <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6 text-center">
                          <p className="text-[10px] text-white font-bold uppercase">High-resolution spectral deconstruction matrix required for full audit.</p>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Inference Latency Curve</h3>
                    <div className="h-[140px] flex items-end gap-1 px-2 border-b border-l border-slate-200 dark:border-slate-700">
                       {Array.from({ length: 30 }).map((_, i) => (
                         <div key={i} className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-t-sm" style={{ height: `${20 + Math.random() * 60}%` }} />
                       ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[8px] font-black text-slate-400 uppercase">
                       <span>Node-01</span>
                       <span>Node-04</span>
                       <span>Node-12</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Model Metadata</h3>
                     <div className="space-y-3">
                        {[
                          { k: 'Engine', v: 'Ultralytics YOLOv8.3.1' },
                          { k: 'Input Resolution', v: '640x640px (RGB)' },
                          { k: 'Total Parameters', v: '3.2M (Nano)' },
                          { k: 'Export Format', v: 'ONNX / TensorRT' },
                          { k: 'Audit Status', v: 'PASSED_ISO_17025' },
                        ].map(item => (
                          <div key={item.k} className="flex justify-between items-center text-[10px] font-bold uppercase">
                             <span className="text-slate-400">{item.k}</span>
                             <span className="text-slate-900 dark:text-white">{item.v}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="pt-4">
                     <button 
                       onClick={() => setSelectedModel(null)}
                       className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all rounded-none"
                     >
                        Close Registry Detail
                     </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1500px] mx-auto px-6 py-6 sm:py-10 w-full space-y-12">
        
        {/* Header & Status Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-1 flex items-center gap-3">
              <ShieldCheck className="w-10 h-10 text-primary" />
              {isId ? "Sentinel Sistem" : "Systems Sentinel"}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">{isId ? "Pemantauan Infrastruktur Neural" : "Neural Infrastructure Monitoring"} // V3.2.0-STABLE</p>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isId ? "Sistem Normal" : "System Nominal"}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-none">
              <Activity className="w-4 h-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase leading-none">{isId ? "Latensi Global" : "Global Latency"}</span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">42.8ms</span>
              </div>
            </div>
            <DocumentationToggle showDocs={showDocs} setShowDocs={setShowDocs} text={isId ? "Protokol Sentinel" : "Sentinel Protocol"} />
            <button 
              onClick={() => {
                setIsSyncing(true)
                setTimeout(() => {
                  setIsSyncing(false)
                  toast.success(isId ? "Sinkronisasi Node Global Selesai" : "Global Node Synchronization Complete")
                }, 1500)
              }}
              className={`flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all ${isSyncing ? 'animate-pulse' : ''}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? (isId ? 'Menyinkronkan...' : 'Syncing...') : (isId ? 'Sinkronisasi Klaster' : 'Sync Cluster')}
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
                  {isId ? "Matriks Pelatihan Neural" : "Neural Training Matrix"}
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">{isId ? "Fine-tuning untuk Akurasi Standar Kompetisi" : "Fine-tuning for Competition-Grade Accuracy"}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">{isId ? "Sesi Aktif" : "Active Session"}</span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">FT_COLONY_V3_NIGHTLY</span>
                </div>
                <button 
                  onClick={() => setTrainingActive(!trainingActive)}
                  className={`px-4 py-1.5 rounded text-[9px] font-black uppercase tracking-widest border transition-all ${
                    trainingActive 
                    ? 'border-rose-500/20 text-rose-500 bg-rose-500/10 hover:bg-rose-500/20' 
                    : 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20'
                  }`}
                >
                  {trainingActive ? (isId ? 'Hentikan Pelatihan' : 'Halt Training') : (isId ? 'Lanjutkan Pelatihan' : 'Resume Training')}
                </button>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Progress & Stats */}
              <div className="space-y-8 md:col-span-1">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isId ? "Progres Pelatihan" : "Training Progress"}</span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{epoch}/80 Epochs</span>
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
                    <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">mAP@50</span>
                    <span className="text-lg font-mono font-bold text-emerald-500">{map50.toFixed(4)}</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-none border border-slate-100 dark:border-slate-800">
                    <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">mAP@50-95</span>
                    <span className="text-lg font-mono font-bold text-primary">{(map50 * 0.72).toFixed(4)}</span>
                  </div>
                </div>

                <div className="p-4 border border-primary/20 bg-primary/5 rounded-none flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <div>
                    <span className="block text-[8px] font-black text-primary uppercase">Estimated Completion</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">~14 Minutes Remaining</span>
                  </div>
                </div>
              </div>

              {/* Training Visualization (Mini Graph) */}
              <div className="md:col-span-2 space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">mAP Convergence Curve</h3>
                    <div className="flex gap-4 text-[8px] font-black uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Training</span>
                       <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Validation</span>
                    </div>
                 </div>
                 <div className="h-[180px] w-full flex items-end gap-1 px-2 border-b border-l border-slate-200 dark:border-slate-800">
                    {Array.from({ length: 40 }).map((_, i) => {
                      const baseH = 20 + Math.pow(i, 1.2) * 1.5;
                      const noise = Math.sin(i * 0.5) * 5 + (Math.random() * 5);
                      const h = Math.min(95, baseH + noise);
                      return (
                        <div key={i} className="flex-1 flex flex-col justify-end group relative">
                          <div 
                            className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary transition-colors cursor-pointer"
                            style={{ height: `${h}%` }}
                          />
                          <div 
                            className="absolute bottom-0 w-full bg-emerald-500/40 rounded-t-sm pointer-events-none"
                            style={{ height: `${h * 0.88}%` }}
                          />
                        </div>
                      )
                    })}
                 </div>
                 <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase px-1">
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
                Hardware Telemetry
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: 'GPU Temperature', value: '64°C', progress: 64, color: 'rose' },
                  { label: 'VRAM Usage', value: '4.2GB / 8GB', progress: 52, color: 'blue' },
                  { label: 'Core Frequency', value: '2.1 GHz', progress: 85, color: 'amber' },
                  { label: 'Network Ingress', value: '1.2 GB/s', progress: 30, color: 'emerald' },
                ].map(hw => (
                  <div key={hw.label} className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                      <span className="text-slate-500">{hw.label}</span>
                      <span className="text-slate-900 dark:text-white">{hw.value}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-${hw.color}-500`} style={{ width: `${hw.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-none flex items-center justify-between">
                    <div>
                       <span className="block text-[8px] font-black text-slate-400 uppercase">Compute Node</span>
                       <span className="text-[10px] font-bold text-slate-900 dark:text-white">NODE-04-BLACKWELL</span>
                    </div>
                    <div className={`w-8 h-8 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 ${benchmarking ? 'animate-spin' : ''}`} />
                 </div>
                 <button 
                  onClick={runBenchmark}
                  disabled={benchmarking}
                  className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[8px] font-black uppercase tracking-widest hover:opacity-90 transition-all rounded disabled:opacity-50"
                 >
                   {benchmarking ? 'Benchmarking...' : 'Run Node Benchmark'}
                 </button>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-none shadow-sm">
               <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                <Database className="w-4 h-4 text-primary" />
                Registry Health
              </h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                    <span className="text-slate-500">Integrity Check</span>
                    <span className="text-emerald-500">100% Passed</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                    <span className="text-slate-500">Audit Redundancy</span>
                    <span className="text-blue-500">Triple Linked</span>
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
                Live Sentinel Stream
              </h3>
              <div className="flex gap-2">
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-none text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    Secure Uplink Active
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
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.4em]">Sentinel_Core_Terminal</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
              <div 
                ref={scrollRef}
                className="h-[320px] overflow-y-auto p-6 font-mono text-[10px] space-y-2 scrollbar-thin scrollbar-thumb-slate-800"
              >
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-4 group/line">
                    <span className="text-slate-700 select-none w-10 text-right">{String(i + 1).padStart(3, '0')}</span>
                    <span className={
                      log.startsWith('>>') ? 'text-amber-400 font-bold' : 
                      log.includes('SUCCESS') ? 'text-emerald-400' : 
                      log.includes('EPOCH') ? 'text-primary' :
                      log.includes('ERROR') ? 'text-rose-400' :
                      'text-slate-400'
                    }>
                      {log}
                    </span>
                  </div>
                ))}
                <div className="flex gap-4">
                   <span className="text-slate-700 select-none w-10 text-right">{logs.length + 1}</span>
                   <span className="animate-pulse text-primary font-bold">_</span>
                </div>
              </div>
            </div>
          </div>

          {/* Model Registry & Deploy */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Neural Model Registry
              </h3>
              <span className="text-[9px] font-black text-slate-400 uppercase">3 Models Found</span>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'v3.2.0_FINETUNED', date: 'Just now', map: '0.965', status: 'READY', color: 'emerald' },
                { name: 'v3.1.2_BETA', date: '2 days ago', map: '0.942', status: 'ACTIVE', color: 'blue' },
                { name: 'v3.1.1_STABLE', date: '1 week ago', map: '0.921', status: 'LEGACY', color: 'slate' },
              ].map((model) => (
                <div 
                  key={model.name} 
                  className="group relative border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 rounded-none transition-all hover:border-primary/50 hover:shadow-lg cursor-pointer"
                  onClick={() => setSelectedModel(model)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{model.name}</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{model.date}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-${model.color}-500/20 text-${model.color}-500 bg-${model.color}-500/5`}>
                      {model.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-none bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                        <TrendingUp className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Precision mAP</span>
                        <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{model.map}</span>
                      </div>
                    </div>
                    
                    {model.status === 'READY' && (
                      <button 
                        onClick={handleDeploy}
                        disabled={isDeploying}
                        className={`flex-1 py-2.5 rounded-none text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                          isDeploying 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                          : 'bg-primary text-white hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]'
                        }`}
                      >
                        <RefreshCw className={`w-3 h-3 ${isDeploying ? 'animate-spin' : ''}`} />
                        {isDeploying ? 'Deploying...' : 'Deploy to Nodes'}
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
                {isId ? "Radar Kontaminasi Bio-Hazard" : "Bio-Hazard Contamination Radar"}
              </h3>
              <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <span>ISO-14644 Cleanroom Compliance</span>
                <span className="text-rose-500 flex items-center gap-1.5 animate-pulse"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {isId ? "Aktif" : "Live"}</span>
              </div>
            </div>
            
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-none shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <ShieldCheck className="w-48 h-48 text-rose-500" />
              </div>

              <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800 relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{isId ? "Anomali Lingkungan" : "Environmental Anomalies"}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{isId ? "Mendeteksi kegagalan fasilitas melalui klasifikasi artefak AI" : "Detecting infrastructural failures via AI Artifact classification"}</p>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded text-rose-500 flex flex-col items-end">
                    <span className="text-[8px] font-black uppercase tracking-widest">{isId ? "Status Fasilitas" : "Facility Status"}</span>
                    <span className="text-[10px] font-bold uppercase">{isId ? "Peringatan Level 2" : "Warning Level 2"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5 relative z-10">
                {[
                  { class: 'dust_debris', label: isId ? 'Debu & Partikulat' : 'Dust & Particulates', count: 124, limit: 50, color: 'rose', issue: isId ? 'Kebocoran Filter HEPA Terdeteksi (Jalur B)' : 'HEPA Filter Breach Detected (Line B)' },
                  { class: 'media_crack', label: isId ? 'Kegagalan Integritas Agar' : 'Agar Integrity Failure', count: 12, limit: 20, color: 'amber', issue: isId ? 'Fluktuasi Suhu Inkubator (-2.1°C)' : 'Incubator Temp Fluctuation (-2.1°C)' },
                  { class: 'bubble', label: isId ? 'Gelembung Gas Preparasi' : 'Preparation Gas Pockets', count: 45, limit: 100, color: 'blue', issue: isId ? 'Normal dalam batas toleransi' : 'Nominal within tolerance' },
                ].map(anomaly => (
                  <div key={anomaly.class} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-${anomaly.color}-500 ${anomaly.count > anomaly.limit ? 'animate-ping' : ''}`} />
                        <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">{anomaly.label}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-mono font-bold ${anomaly.count > anomaly.limit ? 'text-rose-500' : 'text-slate-400'}`}>
                          {anomaly.count} / {anomaly.limit}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${anomaly.count > anomaly.limit ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : `bg-${anomaly.color}-500`}`} 
                        style={{ width: `${Math.min(100, (anomaly.count / anomaly.limit) * 100)}%` }} 
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
                {isId ? "Proyeksi Rilis Awal" : "Early-Release Trajectory"}
              </h3>
              <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <span>Gompertz Growth Model</span>
                <span className="text-emerald-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {isId ? "Aktif" : "Active"}</span>
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
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Batch #441-A (PCA)</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{isId ? "Cuplikan 18 Jam ➔ Proyeksi 48 Jam" : "18H Snapshot ➔ 48H Prediction"}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6 relative z-10 mb-6">
                 <div>
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{isId ? "Status Saat Ini (18j)" : "Current State (18h)"}</span>
                    <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white">12 <span className="text-xs text-slate-500">CFU/ml</span></div>
                    <p className="text-[9px] text-emerald-500 font-bold uppercase mt-1">{isId ? "Mikro-koloni tak kasat mata terdeteksi" : "Sub-visual micro-colonies detected"}</p>
                 </div>
                 <div>
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{isId ? "Proyeksi AI (48j)" : "AI Projection (48h)"}</span>
                    <div className="text-3xl font-mono font-bold text-emerald-500">45 <span className="text-xs text-slate-500">CFU/ml</span></div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{isId ? "Batas Maksimal: 250 CFU/ml" : "Max Threshold: 250 CFU/ml"}</p>
                 </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-none relative z-10">
                 <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">{isId ? "Izin Rilis Diberikan" : "Clearance Authorized"}</span>
                 </div>
                 <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                   {isId 
                     ? "Berdasarkan proyeksi lintasan pembelahan sel AI, Batch #441-A dijamin lulus batas keamanan 48 jam."
                     : "Based on AI cellular division trajectory, Batch #441-A is guaranteed to pass the 48h safety threshold."} 
                   <span className="text-slate-900 dark:text-white block mt-1">
                     {isId ? "Dampak Logistik: Menghemat 30 jam waktu tunggu gudang." : "Supply Chain Impact: Save 30 hours of holding time."}
                   </span>
                 </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


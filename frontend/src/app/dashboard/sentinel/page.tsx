'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Activity, Server, Database, Cpu, ShieldCheck, RefreshCw, Globe, BrainCircuit, Terminal, Zap } from 'lucide-react'
import { 
  DocumentationSidebar, 
  DocumentationToggle 
} from "@/components/DocumentationSidebar";

import { toast } from "sonner";
import { useTranslationStore } from "@/lib/i18n/store";

export default function SentinelPage() {
  const { t } = useTranslationStore();
  const [isSyncing, setIsSyncing] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [showDocs, setShowDocs] = useState(true)
  
  const [metrics, setMetrics] = useState([
    { name: 'Neural Processing Cluster', status: 'Synchronized', load: 10.7, unit: '%', icon: Cpu, color: 'emerald' },
    { name: 'Multi-Tenant Database', status: 'Connected', load: 0.76, unit: 'ms', icon: Database, color: 'blue' },
    { name: 'S3 Object Storage', status: 'Hardened', load: 1.2, unit: ' PB', icon: Server, color: 'purple' },
    { name: 'Security Shield', status: 'Active', load: 'Active', unit: '', icon: ShieldCheck, color: 'indigo' },
  ])
  const [activeRequests, setActiveRequests] = useState(1204)
  const [logs, setLogs] = useState<string[]>([
    "INITIALIZING_SENTINEL_PROTOCOLS...",
    "HANDSHAKE_SECURE_NODE_04: SUCCESS",
    "ENCRYPTING_TRAFFIC_LAYER_7: ACTIVE",
    "NEURAL_MAP_READY: COLONY_V3_2026"
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRequests(prev => prev + Math.floor(Math.random() * 10) - 4)
      
      const newLogs = [
        `INCOMING_REQUEST_FROM_IP: 10.42.0.${Math.floor(Math.random() * 255)}`,
        `NEURAL_INFERENCE_COMPLETE: 124ms`,
        `ENCRYPTION_HASH_ROTATED: SHA-512_SECURE`,
        `DATABASE_SYNC_NODE_02: COMPLETED`
      ]
      setLogs(prev => [...prev.slice(-15), newLogs[Math.floor(Math.random() * newLogs.length)]])

      // Fluctuate metrics
      setMetrics(prev => prev.map(m => {
        if (m.name === 'Neural Processing Cluster') {
          const newVal = Math.max(8, Math.min(25, m.load as number + (Math.random() * 2 - 1)))
          return { ...m, load: newVal }
        }
        if (m.name === 'Multi-Tenant Database') {
          const newVal = Math.max(0.4, Math.min(1.5, m.load as number + (Math.random() * 0.2 - 0.1)))
          return { ...m, load: newVal }
        }
        return m
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleDeploy = () => {
    if (isDeploying) return
    setIsDeploying(true)
    
    // Add log
    setLogs(prev => [...prev, ">> INITIATING_NEURAL_DEPLOYMENT: v3.1.2_BETA"])
    
    setTimeout(() => {
      setLogs(prev => [...prev, ">> TRANSFERRING_WEIGHTS_TO_EDGE_NODES: 42/42 SUCCESS"])
      setTimeout(() => {
        setLogs(prev => [...prev, ">> NEURAL_RELOAD_COMPLETE: MODEL_ACTIVE"])
        setIsDeploying(false)
        toast.success("New Neural Weights Deployed Successfully!")
      }, 1500)
    }, 2000)
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
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative bg-[#f4f7f6] dark:bg-slate-950 transition-colors duration-300">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${showDocs ? 'lg:mr-[350px]' : ''}`}>
          <div className="max-w-[1500px] mx-auto px-4 sm:px-8 py-0 sm:py-0">
            <div className="space-y-6 pt-0">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center shadow-sm transition-colors">
                      <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Systems Sentinel</h1>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Real-Time Global Infrastructure Monitoring</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="hidden lg:block">
                    <DocumentationToggle
                      showDocs={showDocs}
                      setShowDocs={setShowDocs}
                      text="Protokol Sentinel"
                    />
                  </div>
                  <button 
                    onClick={() => { setIsSyncing(true); setTimeout(() => setIsSyncing(false), 2000); }}
                    className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[9px] font-bold text-slate-900 dark:text-white uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
                    Force Global Sync
                  </button>
                </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {metrics.map((m, i) => (
                  <div 
                    key={i} 
                    className={`backdrop-blur-sm border p-2 sm:p-4 rounded-xl shadow-sm hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden group ${
                      m.color === 'emerald' ? 'bg-emerald-50/40 border-emerald-100/50 hover:bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-900/40' :
                      m.color === 'blue' ? 'bg-blue-50/40 border-blue-100/50 hover:bg-blue-50/60 dark:bg-blue-950/20 dark:border-blue-900/40' :
                      m.color === 'purple' ? 'bg-purple-50/40 border-purple-100/50 hover:bg-purple-50/60 dark:bg-purple-950/20 dark:border-purple-900/40' :
                      'bg-indigo-50/40 border-indigo-100/50 hover:bg-indigo-50/60 dark:bg-indigo-950/20 dark:border-indigo-900/40'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                      <div className={`p-1 sm:p-1.5 rounded-sm transition-colors ${
                        m.color === 'emerald' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        m.color === 'blue' ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400' :
                        m.color === 'purple' ? 'bg-purple-50 text-purple-500 dark:bg-purple-900/30 dark:text-purple-400' :
                        'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400'
                      }`}>
                        <m.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <span className={`text-[7px] sm:text-[9px] font-bold ${m.color === 'emerald' ? 'text-emerald-500' : 'text-slate-400'} uppercase tracking-widest z-10`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="z-10">
                      <p className="text-slate-400 dark:text-slate-500 text-[6px] sm:text-[8px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-0.5">
                        {m.name}
                      </p>
                      <h3 className="text-sm sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tighter tabular-nums">
                        {typeof m.load === 'number' ? m.load.toFixed(m.name === 'Multi-Tenant Database' ? 2 : 1) : m.load}{m.unit}
                      </h3>
                    </div>
                    
                    <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                       <m.icon className="w-8 h-8 sm:w-12 sm:h-12" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white relative overflow-hidden transition-colors">
                <div className="relative z-10 space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3">
                     <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                     <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight">Global Traffic Matrix</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                     <div className="space-y-0.5">
                        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Requests</p>
                        <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{activeRequests.toLocaleString()} <span className="text-[9px] text-emerald-500">/sec</span></p>
                     </div>
                     <div className="space-y-0.5">
                        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Node Uptime</p>
                        <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">99.998%</p>
                     </div>
                     <div className="space-y-0.5">
                        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Security Anomalies</p>
                        <p className="text-lg sm:text-xl font-bold text-emerald-500">0</p>
                     </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Neural Node Status */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm transition-colors">
                   <div className="flex items-center gap-3 mb-5 sm:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/5 dark:bg-primary/10 rounded-xl flex items-center justify-center">
                         <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <h3 className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Neural Node Status</h3>
                   </div>
                   
                   <div className="space-y-3 sm:space-y-4">
                      {[
                        { id: "NODE-01-A", status: t("common.active"), load: 12, color: "emerald" },
                        { id: "NODE-02-A", status: t("common.active"), load: 45, color: "emerald" },
                        { id: "NODE-01-B", status: t("overview.idle"), load: 0, color: "slate" },
                        { id: "NODE-02-B", status: t("overview.standby"), load: 2, color: "amber" },
                      ].map((node, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-primary/30 transition-all group">
                           <div className="flex items-center gap-2.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${node.color === 'emerald' ? 'bg-emerald-500 animate-pulse' : node.color === 'amber' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                              <div>
                                 <p className="text-[9px] font-bold text-slate-900 dark:text-white">{node.id}</p>
                                 <p className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase">{node.status}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-900 dark:text-white">{node.load}%</p>
                              <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                                 <div 
                                    className={`h-full transition-all duration-1000 ${node.color === 'emerald' ? 'bg-emerald-500' : node.color === 'amber' ? 'bg-amber-500' : 'bg-slate-400'}`} 
                                    style={{ width: `${node.load}%` }} 
                                 />
                              </div>
                           </div>
                        </div>
                      ))}

                      <div className="pt-2 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between p-3 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/10 dark:border-primary/20">
                           <div className="flex items-center gap-2">
                              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                              <span className="text-[8px] sm:text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Cluster Secure</span>
                           </div>
                           <span className="text-[8px] sm:text-[9px] font-black text-primary animate-pulse">Online</span>
                        </div>
                      </div>
                   </div>
                </div>

                 {/* Live Logs Terminal & Today Events */}
                 <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex-1">
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                             <Terminal className="w-4 h-4 text-emerald-500" />
                             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Infrastructure Logs</h3>
                          </div>
                          <div className="flex gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                             <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                             <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                          </div>
                       </div>
                       
                       <div 
                         ref={scrollRef}
                         className="h-[120px] sm:h-[150px] overflow-y-auto font-mono text-[9px] text-emerald-500/60 space-y-1 no-scrollbar"
                       >
                          {logs.map((log, i) => (
                             <div key={i} className="flex gap-2">
                                <span className="text-slate-700">[{new Date().toLocaleTimeString()}]</span>
                                <span className={log.includes('SUCCESS') || log.includes('COMPLETED') ? 'text-emerald-400' : ''}>{log}</span>
                             </div>
                          ))}
                       </div>
                       
                       <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
                    </div>

                    {/* Today Events */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                             <Activity className="w-4 h-4 text-primary" />
                             <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Today Events</h3>
                          </div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live Flow</span>
                       </div>
                       <div className="space-y-3">
                          <div className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                             <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-bold text-slate-900 dark:text-white">Batch Audit</span>
                             </div>
                             <span className="text-[9px] font-black text-primary">COMPLETED</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                             <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-[10px] font-bold text-slate-900 dark:text-white">Low Reliability</span>
                             </div>
                             <span className="text-[9px] font-black text-amber-500">RESOLVING</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                             <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-bold text-slate-900 dark:text-white">Syncing Ledger</span>
                             </div>
                             <span className="text-[9px] font-black text-emerald-500">ACTIVE</span>
                          </div>
                       </div>
                    </div>
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
            directory="Infrastructure"
            title="Sentinel Observatory"
            description="Panduan pemantauan kesehatan infrastruktur dan mitigasi anomali sistem."
            rawText={`SENTINEL OBSERVATORY COLONYAI
==============================

1. INFRASTRUCTURE MONITORING
Memantau secara real-time empat pilar utama ColonyAI: Neural Cluster, Multi-Tenant DB, S3 Storage, dan Security Shield.

2. GLOBAL TRAFFIC MATRIX
- Active Requests: Beban lalu lintas saat ini di seluruh node.
- Node Uptime: Persentase ketersediaan server secara global.
- Security Anomalies: Deteksi upaya penetrasi atau kegagalan otentikasi massal.

3. MITIGASI ANOMALI
Jika indikator berubah menjadi warna Rose (Failed/Warning), Administrator wajib melakukan 'Force Global Sync' untuk menyinkronkan ulang status klaster.

STATUS: INFRASTRUCTURE SECURE
MONITOR: CONTINUOUS`}
          >
            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">01</span>
                <h2 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">Overview</h2>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                Sentinel Observatory adalah mata rantai terakhir dalam keamanan sistem ColonyAI. Memberikan visibilitas 360 derajat atas setiap paket data yang melewati infrastruktur kita.
              </p>
            </section>

            <section className="space-y-3 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">02</span>
                <h2 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">Observatory Protocol</h2>
              </div>
              <div className="space-y-3 ml-0.5">
                {[
                  { id: '1', title: 'Cluster Health', desc: 'Pastikan seluruh pilar berstatus Optimal atau Synchronized untuk integritas data.' },
                  { id: '2', title: 'Traffic Scaling', desc: 'Pantau Active Requests untuk memprediksi kebutuhan scaling infrastruktur otomatis.' },
                  { id: '3', title: 'Global Sync', desc: 'Gunakan fitur Force Sync hanya jika terjadi latensi data antar tenant.' }
                ].map((step) => (
                  <div key={step.id} className="flex gap-2.5 group">
                     <span className="flex-shrink-0 w-4.5 h-4.5 rounded bg-slate-900 text-white text-[8px] font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        {step.id}
                     </span>
                     <div className="space-y-0.5">
                        <h4 className="text-[10px] font-bold text-slate-900 dark:text-white">{step.title}</h4>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{step.desc}</p>
                     </div>
                  </div>
                ))}
              </div>
            </section>
          </DocumentationSidebar>
        </div>
      </div>
    </div>
  )
}

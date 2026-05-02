'use client'

import React, { useState, useEffect } from 'react'
import { Activity, Server, Database, Cpu, ShieldCheck, RefreshCw, Globe } from 'lucide-react'
import { 
  DocumentationSidebar, 
  DocumentationToggle 
} from "@/components/DocumentationSidebar";

export default function SentinelPage() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [showDocs, setShowDocs] = useState(true)
  
  const metrics = [
    { name: 'Neural Processing Cluster', status: 'Optimal', load: '12%', icon: Cpu, color: 'text-emerald-500' },
    { name: 'Multi-Tenant Database', status: 'Synchronized', load: '0.8ms', icon: Database, color: 'text-blue-500' },
    { name: 'S3 Object Storage', status: 'Connected', load: '1.2 PB', icon: Server, color: 'text-purple-500' },
    { name: 'Security Shield', status: 'Hardened', load: 'Active', icon: ShieldCheck, color: 'text-primary' },
  ]
  const [activeRequests, setActiveRequests] = useState(1204)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRequests(prev => prev + Math.floor(Math.random() * 10) - 4)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${showDocs ? 'lg:mr-[350px]' : ''}`}>
          <div className="max-w-[1500px] mx-auto px-4 sm:px-8 py-0 sm:py-0">
            <div className="space-y-6 pt-0">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                      <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Systems Sentinel</h1>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Real-Time Global Infrastructure Monitoring</p>
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
                    className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-bold text-slate-900 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isSyncing ? 'animate-spin' : ''}`} />
                    Force Global Sync
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                  <div key={i} className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <m.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${m.color}`} />
                      </div>
                      <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-bold uppercase tracking-widest border border-emerald-100">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                        {m.status}
                      </div>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{m.name}</p>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{m.load}</h3>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 text-slate-900 relative overflow-hidden">
                <div className="relative z-10 space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3">
                     <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                     <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight">Global Traffic Matrix</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
                     <div className="space-y-1">
                        <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Requests</p>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900">{activeRequests.toLocaleString()} <span className="text-[9px] text-emerald-500">/sec</span></p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Node Uptime</p>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900">99.998%</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Security Anomalies</p>
                        <p className="text-xl sm:text-2xl font-bold text-emerald-500">0</p>
                     </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
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
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">Overview</h2>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                Sentinel Observatory adalah mata rantai terakhir dalam keamanan sistem ColonyAI. Memberikan visibilitas 360 derajat atas setiap paket data yang melewati infrastruktur kita.
              </p>
            </section>

            <section className="space-y-3 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">02</span>
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">Observatory Protocol</h2>
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
                        <h4 className="text-[10px] font-bold text-slate-900">{step.title}</h4>
                        <p className="text-[9px] text-slate-500 leading-relaxed font-medium">{step.desc}</p>
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

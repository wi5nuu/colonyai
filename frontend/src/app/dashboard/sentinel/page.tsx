'use client'

import React, { useState, useEffect } from 'react'
import { Activity, Server, Database, Cpu, ShieldCheck, RefreshCw, Globe } from 'lucide-react'

export default function SentinelPage() {
  const [isSyncing, setIsSyncing] = useState(false)
  
  const metrics = [
    { name: 'Neural Processing Cluster', status: 'Optimal', load: '12%', icon: Cpu, color: 'text-emerald-500' },
    { name: 'Multi-Tenant Database', status: 'Synchronized', load: '0.8ms', icon: Database, color: 'text-blue-500' },
    { name: 'S3 Object Storage', status: 'Connected', load: '1.2 PB', icon: Server, color: 'text-purple-500' },
    { name: 'Security Shield', status: 'Hardened', load: 'Active', icon: ShieldCheck, color: 'text-primary' },
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Systems Sentinel</h1>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Real-Time Global Infrastructure Monitoring</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => { setIsSyncing(true); setTimeout(() => setIsSyncing(false), 2000); }}
          className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 text-slate-400 ${isSyncing ? 'animate-spin' : ''}`} />
          Force Global Sync
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <m.icon className={`w-6 h-6 ${m.color}`} />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {m.status}
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.name}</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{m.load}</h3>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
             <Globe className="w-6 h-6 text-primary" />
             <h3 className="text-xl font-black uppercase tracking-tight">Global Traffic Matrix</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             <div className="space-y-2">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Requests</p>
                <p className="text-4xl font-black text-white">1,204 <span className="text-xs text-emerald-500">/sec</span></p>
             </div>
             <div className="space-y-2">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Node Uptime</p>
                <p className="text-4xl font-black text-white">99.998%</p>
             </div>
             <div className="space-y-2">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Security Anomalies</p>
                <p className="text-4xl font-black text-emerald-500">0</p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

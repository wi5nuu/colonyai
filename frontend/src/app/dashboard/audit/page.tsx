'use client'

import { useState } from 'react'
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  History, 
  User, 
  Activity, 
  Clock,
  Terminal,
  AlertCircle
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { DEMO_AUDIT_LOGS } from '@/lib/demo-data'
import { DocumentationSidebar, DocumentationToggle } from "@/components/DocumentationSidebar"
import { useTranslationStore } from '@/lib/i18n/store'

const USE_DEMO_DATA = true // Set to false to use real data from API

export default function AuditPage() {
  const { t } = useTranslationStore()
  const { user: currentUser } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showDocs, setShowDocs] = useState(true)

  const [logs] = useState<any[]>(USE_DEMO_DATA ? DEMO_AUDIT_LOGS : [
    { id: 'LOG-001', action: 'NODE_LOGIN_SUCCESS', user_name: 'admin@colonyai.diag', timestamp: '2026-04-23 09:12:45', details: 'Authorized session established via Node Alpha', ip: '192.168.1.42', resource_type: 'security' },
  ])

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        <div className={`flex-1 transition-all duration-300 ${showDocs ? 'lg:mr-[350px]' : ''}`}>
          <div className="max-w-[1500px] mx-auto px-6 py-8">
            <div className="space-y-10">
              {/* Audit Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-slate-900 rounded-lg shadow-xl flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('audit.title')}</h1>
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t('audit.subtitle')}</p>
                  <DocumentationToggle showDocs={showDocs} setShowDocs={setShowDocs} text={t('audit.docsToggle')} />
                </div>
        
        <div className="flex items-center gap-3">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder={t('audit.searchPlaceholder')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-lg text-[11px] font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all w-72 shadow-sm"
              />
           </div>
           <button className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm">
              <Download className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Terminal View */}
      <div className="space-y-6">
         <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden shadow-slate-900/40">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('audit.eventStream')}</span>
                  </div>
               </div>
               <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
               </div>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left whitespace-nowrap">
                  <thead>
                     <tr className="border-b border-slate-800 bg-slate-900/30">
                         {[t('audit.colSequenceId'), t('audit.colActionProtocol'), t('audit.colSourceAnalyst'), t('audit.colTimestamp'), t('audit.colLayer'), 'Integrity Chain'].map(h => (
                            <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{h}</th>
                         ))}
                     </tr>
                  </thead>
                <tbody className="divide-y divide-slate-800">
                   {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition-colors group">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-primary transition-colors" />
                               <span className="text-[11px] font-mono font-bold text-slate-400 group-hover:text-slate-200">{log.id}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className={`text-[9px] font-black px-2 py-1 rounded border ${
                               log.resource_type === 'security' || log.resource_type === 'auth' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                               log.resource_type === 'system' ? 'bg-primary/10 text-primary border-primary/20' :
                               'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            }`}>
                               {log.action}
                            </span>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <User className="w-3 h-3 text-slate-600" />
                               <span className="text-[11px] font-bold text-slate-300">{log.user_name}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <Clock className="w-3 h-3 text-slate-600" />
                               <span className="text-[10px] font-medium text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <Activity className="w-3 h-3 text-slate-600" />
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.resource_type}</span>
                            </div>
                         </td>
                          <td className="px-6 py-4">
                             <div className="flex flex-col gap-1">
                                <span className="text-[7px] font-mono text-emerald-500 opacity-50 uppercase tracking-tighter">Current: {log.current_hash?.substring(0, 16) || 'N/A'}...</span>
                                <span className="text-[7px] font-mono text-slate-600 uppercase tracking-tighter">Previous: {log.previous_hash?.substring(0, 16) || 'CHAIN_START'}...</span>
                             </div>
                          </td>
                      </tr>
                   ))}
                </tbody>
               </table>
            </div>
         </div>

         {/* Summary Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Security Violations', value: '0', icon: AlertCircle, color: 'emerald' },
            { title: 'Data Transactions', value: '1,242', icon: History, color: 'primary' },
            { title: 'Protocol Uptime', value: '99.99%', icon: Clock, color: 'purple' },
          ].map((s, i) => (
            <div key={i} className="dashboard-card p-6 group hover:scale-[1.02] transition-all rounded-xl">
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-${s.color === 'primary' ? 'primary' : s.color === 'purple' ? 'purple-500' : 'emerald-500'}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                     <s.icon className={`w-5 h-5 text-${s.color === 'primary' ? 'primary' : s.color === 'purple' ? 'purple-500' : 'emerald-500'}`} />
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">{s.title}</p>
                     <p className="text-xl font-bold text-slate-900 tracking-tight">{s.value}</p>
                  </div>
               </div>
            </div>
          ))}
         </div>
      </div>
            </div>
          </div>
        </div>
        <DocumentationSidebar 
          showDocs={showDocs} 
          setShowDocs={setShowDocs}
          directory="Compliance Logs"
          title={t('audit.docsTitle')}
          description={t('audit.docsDescription')}
        >
          <section className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">01</span>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Overview</h2>
             </div>
             <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                Security Ledger menyimpan seluruh rekam jejak aktivitas (Audit Trail) yang terjadi di dalam sistem ColonyAI. Log ini bersifat immutable (tidak dapat diubah) dan merupakan syarat wajib kelulusan sertifikasi ISO-17025.
             </p>
          </section>

          <section className="space-y-6 pt-2">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">02</span>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Audit Protocol</h2>
             </div>
             <div className="space-y-6 ml-1">
                {[
                  { id: '1', title: 'Traceability', desc: 'Setiap entri memuat Sequence ID unik, protokol aksi (Action Protocol), dan Source Analyst yang melakukan tindakan.' },
                  { id: '2', title: 'Layer Tracking', desc: 'Sistem mengkategorikan log ke dalam lapisan (Layer) seperti Security (otorisasi), System (perubahan config), dan Data (proses spesimen).' },
                  { id: '3', title: 'Search & Export', desc: 'Gunakan filter pencarian untuk melacak anomali (Security Violations). Tombol Download memungkinkan ekspor log dalam format terenkripsi.' }
                ].map((step) => (
                  <div key={step.id} className="flex gap-4 group">
                     <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-900 text-white text-[11px] font-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        {step.id}
                     </span>
                     <div className="space-y-1.5">
                        <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                        <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </section>
        </DocumentationSidebar>
      </div>
    </div>
  )
}

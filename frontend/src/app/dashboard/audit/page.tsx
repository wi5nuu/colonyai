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

interface AuditLog {
  id: string
  action: string
  user: string
  timestamp: string
  details: string
  ip: string
  type: 'security' | 'operation' | 'system'
}

export default function AuditPage() {
  const { user: currentUser } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')

  const [logs] = useState<AuditLog[]>([
    { id: 'LOG-001', action: 'NODE_LOGIN_SUCCESS', user: 'admin@colonyai.diag', timestamp: '2026-04-23 09:12:45', details: 'Authorized session established via Node Alpha', ip: '192.168.1.42', type: 'security' },
    { id: 'LOG-002', action: 'ANALYSIS_CREATED', user: 'analyst@colonyai.diag', timestamp: '2026-04-23 09:45:12', details: 'Specimen ISO-PCA-B2026-001 processed (65 CFU detected)', ip: '192.168.1.15', type: 'operation' },
    { id: 'LOG-003', action: 'REPORT_EXPORTED', user: 'manager@colonyai.diag', timestamp: '2026-04-23 10:22:00', details: 'Monthly compliance report generated (PDF)', ip: '192.168.1.10', type: 'operation' },
    { id: 'LOG-004', action: 'SECURITY_ACCESS_DENIED', user: 'guest_node_7', timestamp: '2026-04-23 11:05:33', details: 'Multiple failed login attempts detected', ip: '10.0.0.88', type: 'security' },
    { id: 'LOG-005', action: 'USER_PROVISIONED', user: 'admin@colonyai.diag', timestamp: '2026-04-23 11:30:10', details: 'New analyst account created: trainee@colonyai.diag', ip: '192.168.1.42', type: 'system' },
  ])

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.user.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8">
      {/* Audit Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-600 rounded-lg shadow-xl">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Security Ledger</h1>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Immutable Audit Trail // ISO 17025 Compliant Logging</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Action/User..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500/20 transition-all w-64"
              />
           </div>
           <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
              <Download className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Terminal View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 space-y-4">
           <div className="bg-slate-900 rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-rose-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Event Stream</span>
                 </div>
                 <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                 </div>
              </div>
              
              <div className="p-0 overflow-x-auto">
                 <table className="w-full text-left whitespace-nowrap">
                    <thead>
                       <tr className="border-b border-slate-800 bg-slate-950/50">
                          {['Event ID', 'Action', 'Entity/User', 'Timestamp', 'Status'].map(h => (
                             <th key={h} className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                          ))}
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-mono">
                       {filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                             <td className="px-8 py-5 text-xs text-rose-500 font-bold">{log.id}</td>
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-2">
                                   <Activity className="w-3 h-3 text-slate-600" />
                                   <span className="text-xs text-white font-black tracking-tight">{log.action}</span>
                                </div>
                             </td>
                             <td className="px-8 py-5 text-xs text-slate-400">{log.user}</td>
                             <td className="px-8 py-5 text-xs text-slate-500">{log.timestamp}</td>
                             <td className="px-8 py-5">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                                   log.type === 'security' ? 'bg-rose-500/10 text-rose-500' :
                                   log.type === 'system' ? 'bg-blue-500/10 text-blue-500' :
                                   'bg-emerald-500/10 text-emerald-500'
                                }`}>
                                   {log.type}
                                </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Detail Sidebar Mock */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Security Alerts', value: '0', icon: AlertCircle, color: 'emerald' },
                { title: 'Data Transactions', value: '1,242', icon: History, color: 'blue' },
                { title: 'System Uptime', value: '99.98%', icon: Clock, color: 'blue' },
              ].map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                   <div className={`p-3 bg-${s.color}-50 rounded-2xl`}>
                      <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.title}</p>
                      <p className="text-xl font-black text-slate-900 tracking-tighter">{s.value}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}

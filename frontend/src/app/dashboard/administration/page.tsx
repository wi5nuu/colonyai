'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  UserPlus, 
  ShieldAlert, 
  Settings2, 
  Key, 
  Activity, 
  Trash2, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Database,
  Lock,
  ShieldCheck
} from 'lucide-react'
import { toast } from 'sonner'

import api from '@/lib/api'

interface Analyst {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastActive: string
  clearance: string
}

import { DEMO_AUDIT_LOGS, DEMO_ANALYSTS } from '@/lib/demo-data'

const USE_DEMO_DATA = true // Set to false to use real data from server

export default function AdministrationPage() {
  const [analysts, setAnalysts] = useState<Analyst[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [performance, setPerformance] = useState({
    throughput: 4.2,
    latency: 4,
    uptime: 99.98
  })

  // Fetch Real Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (USE_DEMO_DATA) {
          // Use expanded demo data for presentation
          setAnalysts(DEMO_ANALYSTS)
          setAuditLogs(DEMO_AUDIT_LOGS.slice(0, 5)) // Show only top 5 in preview
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 800))
        } else {
          const [usersRes, auditRes] = await Promise.all([
            api.get<any[]>('/api/v1/users/'),
            api.get<any[]>('/api/v1/audit/')
          ])

          // Map backend users to Analyst interface
          const mappedUsers = usersRes.data.map(u => ({
            id: u.id,
            name: u.full_name,
            email: u.email,
            role: u.role === 'system_admin' ? 'admin' : u.role,
            status: 'active',
            lastActive: 'Online',
            clearance: u.role === 'system_admin' ? 'Level-04' : 'Class-01'
          }))

          setAnalysts(mappedUsers)
          setAuditLogs(auditRes.data)
        }
      } catch (err) {
        console.error('Failed to fetch admin data:', err)
        toast.error('Gagal mengambil data nyata dari server.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Simulated Performance Fluctuations (Representing live sensor data)
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformance(prev => ({
        ...prev,
        throughput: parseFloat((prev.throughput + (Math.random() * 0.4 - 0.2)).toFixed(2)),
        latency: Math.max(2, Math.min(10, prev.latency + (Math.floor(Math.random() * 3) - 1)))
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const [showAddModal, setShowAddModal] = useState(false)

  const handleToggleStatus = (id: string) => {
    setAnalysts(prev => prev.map(a => {
      if (a.id === id) {
        const newStatus = a.status === 'active' ? 'suspended' : 'active'
        toast.info(`Analyst ${a.name} status updated to ${newStatus}`)
        return { ...a, status: newStatus }
      }
      return a
    }))
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header Administration */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-slate-900 rounded-lg shadow-xl flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-primary" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Node Governance</h1>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-0.5">Laboratory OS // Authorization Protocol v2.4 // L01-Admin</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              Backup Matrix
           </button>
           <button 
             onClick={() => setShowAddModal(true)}
             className="bg-slate-900 text-white py-2 px-5 flex items-center gap-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
           >
             <UserPlus className="w-4 h-4 text-primary" />
             Provision New Node
           </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Clusters', value: '12/12', sub: 'Cluster health: optimal', icon: Activity, color: 'emerald' },
          { label: 'Neural Throughput', value: `${performance.throughput} Gbps`, sub: 'Matrix bandwidth sync', icon: Database, color: 'primary' },
          { label: 'Audit Compliance', value: 'ISO-17025', sub: 'Standard LIMS level', icon: ShieldCheck, color: 'purple' },
          { label: 'Total Registry', value: analysts.length.toString(), sub: 'Authorized Personnel', icon: Users, color: 'slate' },
        ].map((s, i) => (
          <div key={i} className="dashboard-card p-4 rounded-lg flex flex-col justify-between border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded bg-slate-50 flex items-center justify-center`}>
                   <s.icon className={`w-3.5 h-3.5 text-${s.color === 'primary' ? 'primary' : s.color === 'purple' ? 'purple-500' : s.color === 'emerald' ? 'emerald-500' : 'slate-400'}`} />
                </div>
                <div className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded tracking-tighter">LIVE</div>
             </div>
             <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <p className="text-xl font-black text-slate-900 tracking-tighter mt-1">{s.value}</p>
                <p className="text-[8px] font-bold text-slate-300 uppercase mt-0.5">{s.sub}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Personnel Table */}
        <div className="lg:col-span-8 space-y-6">
           <div className="dashboard-card overflow-hidden !p-0 rounded-lg border-slate-100 shadow-sm">
             <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
               <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Authorized Personnel Registry</h3>
               <span className="text-[9px] font-bold text-slate-400">Total: {analysts.length} Nodes</span>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-white/80 border-b border-slate-50">
                   <tr>
                     {['Identity', 'System Role', 'Clearance', 'Status', 'Heartbeat', 'Action'].map(h => (
                       <th key={h} className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                     ))}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {analysts.map((a) => (
                     <tr key={a.id} className="group hover:bg-slate-50/50 transition-all">
                       <td className="px-5 py-3">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded bg-slate-900 text-primary flex items-center justify-center font-black text-[10px] shadow-sm">
                             {a.name.split(' ').map(n => n[0]).join('')}
                           </div>
                           <div>
                             <p className="text-[11px] font-black text-slate-900">{a.name}</p>
                             <p className="text-[9px] font-medium text-slate-400">{a.email}</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-5 py-3">
                         <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest ${
                           a.role === 'admin' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-50 text-slate-400 border-slate-100'
                         }`}>
                           {a.role}
                         </span>
                       </td>
                       <td className="px-5 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">{a.clearance}</td>
                       <td className="px-5 py-3">
                         <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border w-fit ${
                           a.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                         }`}>
                           <div className={`w-1 h-1 rounded-full ${a.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                           <span className="text-[8px] font-black uppercase tracking-widest">{a.status}</span>
                         </div>
                       </td>
                       <td className="px-5 py-3 text-[9px] font-bold text-slate-400 uppercase">{a.lastActive}</td>
                       <td className="px-5 py-3">
                         <button 
                           onClick={() => handleToggleStatus(a.id)}
                           className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>

           {/* Recent Audit Trail Preview */}
           <div className="dashboard-card overflow-hidden !p-0 rounded-lg border-slate-100 shadow-sm">
              <div className="px-5 py-3 border-b border-slate-50 bg-slate-900 flex items-center justify-between">
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Recent System Audit Trail</h3>
                <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">View Full Ledger</button>
              </div>
              <div className="divide-y divide-slate-50">
                 {auditLogs.map((log) => (
                    <div key={log.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-all">
                       <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-slate-300 font-mono">{log.id.substring(0, 8)}</span>
                          <div>
                             <p className="text-[11px] font-black text-slate-900 tracking-tight">{log.action}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Executor: {log.user_name} // Resource: {log.resource_type}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest ${
                             log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                             {log.status}
                          </span>
                          <p className="text-[9px] font-bold text-slate-300 mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar Info - Governance Context */}
        <div className="lg:col-span-4 space-y-6">
           <div className="dashboard-card p-5 rounded-lg border-slate-100 shadow-sm bg-slate-50/50">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">Node Performance Matrix</h4>
              <div className="space-y-4">
                 {[
                   { label: 'Uptime (Global)', val: `${performance.uptime}%` },
                   { label: 'Throughput', val: `${performance.throughput} Gbps` },
                   { label: 'Sync Latency', val: `${performance.latency}ms (P95)` },
                   { label: 'Matrix Patch', val: 'v2.4.1-stable' },
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{stat.label}</span>
                      <span className="text-[11px] font-black text-slate-900 font-mono">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="dashboard-card p-5 rounded-lg border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200">
              <div className="flex items-center gap-3 mb-4">
                 <ShieldCheck className="w-5 h-5 text-primary" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">System Integrity Protocol</h4>
              </div>
              <p className="text-[11px] font-bold leading-relaxed text-slate-400">
                 As a Level-01 Administrator, every state modification in this node is committed to the <span className="text-primary">immutable neural audit ledger</span>. Provisioning new analysts requires multi-factor cryptographic authorization in production.
              </p>
              <button className="w-full mt-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded text-[9px] font-black uppercase tracking-[0.2em] transition-all">
                 Download Security SOP
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}



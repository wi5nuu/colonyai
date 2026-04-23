'use client'

import { useState } from 'react'
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
  Lock
} from 'lucide-react'
import { toast } from 'sonner'

interface Analyst {
  id: string
  name: string
  email: string
  role: 'analyst' | 'viewer' | 'admin'
  status: 'active' | 'suspended'
  lastActive: string
  clearance: string
}

export default function AdministrationPage() {
  const [analysts, setAnalysts] = useState<Analyst[]>([
    { id: '1', name: 'Analyst Primary', email: 'analyst@colonyai.diag', role: 'analyst', status: 'active', lastActive: '2 mins ago', clearance: 'Class-01' },
    { id: '2', name: 'Manager HQ', email: 'manager@colonyai.diag', role: 'viewer', status: 'active', lastActive: '1 hour ago', clearance: 'Class-02' },
    { id: '3', name: 'Security Audit', email: 'audit@colonyai.diag', role: 'viewer', status: 'suspended', lastActive: '2 days ago', clearance: 'Class-02' },
  ])

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
    <div className="min-h-screen bg-slate-50 p-6 space-y-8">
      {/* Header Administration */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-900 rounded-lg shadow-xl">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Node Administration</h1>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">System Governance // Authorization Ledger v1.2</p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/20"
        >
          <UserPlus className="w-4 h-4" />
          Provision New Analyst
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Nodes', value: '12', sub: 'In-Network', icon: Activity, color: 'blue' },
          { label: 'Data Clearance', value: 'ISO-17025', sub: 'Protocol Level', icon: ShieldAlert, color: 'emerald' },
          { label: 'Database Health', value: '99.9%', sub: 'No Latency', icon: Database, color: 'orange' },
          { label: 'User Count', value: analysts.length.toString(), sub: 'Authorized', icon: Users, color: 'slate' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:shadow-md transition-all">
             <div className="flex items-center justify-between mb-4">
                <div className={`p-2 bg-${s.color}-50 rounded-xl`}>
                   <s.icon className={`w-4 h-4 text-${s.color}-600`} />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{s.label}</p>
             <p className="text-2xl font-black text-slate-900 mt-2">{s.value}</p>
             <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* User Table Arena */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Authorized Personnel Registry</h3>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Real-time Sync Active</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                {['Analyst Identity', 'Provisioned Role', 'Clearance', 'Status', 'Last Heartbeat', 'Actions'].map(h => (
                  <th key={h} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {analysts.map((a) => (
                <tr key={a.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg">
                        {a.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-tight">{a.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                      a.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {a.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Key className="w-3 h-3 text-slate-300" />
                      <span className="text-xs font-black text-slate-600 tracking-tighter">{a.clearance}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border w-fit ${
                      a.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                    }`}>
                      {a.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{a.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-400">{a.lastActive}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => handleToggleStatus(a.id)}
                         className={`p-2 rounded-xl border transition-all ${
                           a.status === 'active' ? 'border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white' : 'border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                         }`}
                         title={a.status === 'active' ? 'Suspend Analyst' : 'Restore Analyst'}
                       >
                         {a.status === 'active' ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                       </button>
                       <button className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                         <Settings2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-8 rounded-[32px] bg-slate-900 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-12 opacity-5">
            <Database className="w-64 h-64" />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
               <h4 className="text-xl font-black mb-2 uppercase tracking-tight">System Integrity Notice</h4>
               <p className="text-sm text-slate-400 font-medium leading-relaxed">
                 As a Super Admin, every action you take in this node is recorded in the <strong>immutable audit ledger</strong>. 
                 Provisioning new analysts requires double-factor authorization from the Chief Medical Officer in production environments.
               </p>
            </div>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
               View System Audit Logs
            </button>
         </div>
      </div>
    </div>
  )
}

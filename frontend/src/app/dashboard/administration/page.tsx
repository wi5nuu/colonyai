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
  ShieldCheck,
  Download,
  FileText,
  FileSpreadsheet,
  BarChart3,
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
import { DocumentationSidebar, DocumentationToggle } from "@/components/DocumentationSidebar"
import { useTranslationStore } from '@/lib/i18n/store'

const USE_DEMO_DATA = true // Set to false to use real data from server

export default function AdministrationPage() {
  const { t } = useTranslationStore()
  const [analysts, setAnalysts] = useState<Analyst[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [performance, setPerformance] = useState({
    throughput: 4.2,
    latency: 4,
    uptime: 99.98
  })
  const [showDocs, setShowDocs] = useState(true)

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
  const [downloadingPdf, setDownloadingPdf]   = useState(false)
  const [downloadingXls, setDownloadingXls]   = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true)
    try {
      const authStorage = localStorage.getItem('auth-storage')
      const token = authStorage ? JSON.parse(authStorage).state?.accessToken : null
      const res = await fetch(`${API_URL}/api/v1/reports/admin/pdf-all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Gagal mengunduh PDF')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href    = url
      a.download = `colonyai-admin-report-${new Date().toISOString().slice(0,10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF berhasil diunduh!')
    } catch (e: any) {
      toast.error(e.message || 'Gagal mengunduh PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const handleDownloadExcel = async () => {
    setDownloadingXls(true)
    try {
      const authStorage = localStorage.getItem('auth-storage')
      const token = authStorage ? JSON.parse(authStorage).state?.accessToken : null
      const res = await fetch(`${API_URL}/api/v1/reports/admin/excel-all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Gagal mengunduh Excel')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href    = url
      a.download = `colonyai-admin-analytics-${new Date().toISOString().slice(0,10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Excel Analytics berhasil diunduh!')
    } catch (e: any) {
      toast.error(e.message || 'Gagal mengunduh Excel')
    } finally {
      setDownloadingXls(false)
    }
  }

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
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden pb-12">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        <div className={`flex-1 transition-all duration-300 ${showDocs ? 'lg:mr-[350px]' : ''}`}>
          <div className="max-w-[1500px] mx-auto px-6 py-8">
            <div className="space-y-6">
              {/* Header Administration */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg shadow-xl flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{t('admin.title')}</h1>
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-0.5">{t('admin.subtitle')}</p>
                  <DocumentationToggle showDocs={showDocs} setShowDocs={setShowDocs} text={t('admin.docsToggle')} />
                </div>
        
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              {t('admin.backupMatrix')}
           </button>
           <button 
             onClick={() => setShowAddModal(true)}
             className="bg-slate-900 text-white py-2 px-5 flex items-center gap-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
           >
             <UserPlus className="w-4 h-4 text-primary" />
             {t('admin.provisionNode')}
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
      
      {/* Real-time Kernel Vitals */}
      <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Neural Kernel: Stable</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-4">
               {[
                  { label: 'CPU', val: '14%' },
                  { label: 'RAM', val: '2.4 / 16 GB' },
                  { label: 'GPU', val: 'RTX 5050 (8% Load)' }
               ].map((v, i) => (
                  <div key={i} className="flex flex-col">
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{v.label}</span>
                     <span className="text-[10px] font-bold text-slate-700">{v.val}</span>
                  </div>
               ))}
            </div>
         </div>
         <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Uptime: 142d 06h 12m
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Personnel Table */}
        <div className="lg:col-span-8 space-y-6">
           <div className="dashboard-card overflow-hidden !p-0 rounded-lg border-slate-100 shadow-sm">
             <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
               <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{t('admin.personnelRegistry')}</h3>
               <span className="text-[9px] font-bold text-slate-400">{t('admin.total')}: {analysts.length} {t('admin.nodes')}</span>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-white/80 border-b border-slate-50">
                   <tr>
                     {[t('admin.colIdentity'), t('admin.colRole'), t('admin.colClearance'), t('admin.colStatus'), t('admin.colHeartbeat'), t('admin.colAction')].map(h => (
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
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">{t('admin.recentAudit')}</h3>
                <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">{t('admin.viewFullLedger')}</button>
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

        {/* Export Center */}
        <div className="lg:col-span-12">
          <div className="dashboard-card overflow-hidden !p-0 rounded-lg border-slate-100 shadow-sm">
            <div className="px-5 py-3 border-b border-slate-50 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Admin Export Center</h3>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Admin Only</span>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PDF Export */}
              <div className="border border-slate-100 rounded-lg p-4 flex flex-col gap-3 bg-slate-50/30 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900">Master PDF Report</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Semua analisis seluruh analis</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Laporan PDF komprehensif berisi: ringkasan global, breakdown per-analis, tren bulanan, dan detail setiap sampel yang pernah dianalisis.
                </p>
                <div className="flex flex-wrap gap-1 mb-1">
                  {['Global Summary','Per-User Breakdown','Monthly Trend','All Samples'].map(tag => (
                    <span key={tag} className="text-[8px] font-black px-1.5 py-0.5 rounded bg-red-50 text-red-500 border border-red-100 uppercase tracking-wider">{tag}</span>
                  ))}
                </div>
                <button
                  id="btn-admin-download-pdf"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-wait text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm shadow-red-100"
                >
                  {downloadingPdf ? (
                    <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating PDF...</>
                  ) : (
                    <><Download className="w-3.5 h-3.5" />Download PDF — Semua Data</>
                  )}
                </button>
              </div>

              {/* Excel Export */}
              <div className="border border-slate-100 rounded-lg p-4 flex flex-col gap-3 bg-slate-50/30 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900">Analytics Excel (.xlsx)</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">6 sheet statistik lengkap</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  File Excel multi-sheet dengan statistik super lengkap: ringkasan global, analitik per-analis, tren bulanan, breakdown media agar, distribusi CFU, dan semua raw record.
                </p>
                <div className="flex flex-wrap gap-1 mb-1">
                  {['📊 Global Stats','👤 Per-User','📅 Monthly','🧪 Media','📈 CFU Dist.','📋 Raw Records'].map(tag => (
                    <span key={tag} className="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">{tag}</span>
                  ))}
                </div>
                <button
                  id="btn-admin-download-excel"
                  onClick={handleDownloadExcel}
                  disabled={downloadingXls}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-wait text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm shadow-emerald-100"
                >
                  {downloadingXls ? (
                    <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating Excel...</>
                  ) : (
                    <><Download className="w-3.5 h-3.5" />Download Excel — Analytics Lengkap</>
                  )}
                </button>
              </div>
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
          </div>
        </div>
        <DocumentationSidebar 
          showDocs={showDocs} 
          setShowDocs={setShowDocs}
          directory="System Control"
          title="Node Governance"
          description="Standard Operating Procedure (SOP) for managing analysts and observing real-time system performance."
        >
          <section className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">01</span>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Overview</h2>
             </div>
             <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                Modul Node Governance dirancang secara khusus untuk Administrator. Halaman ini adalah pusat komando untuk memberikan otorisasi kepada staf (Analyst Registry) serta memantau kesehatan operasional server (Performance Matrix).
             </p>
          </section>

          <section className="space-y-6 pt-2">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">02</span>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Governance Protocol</h2>
             </div>
             <div className="space-y-6 ml-1">
                {[
                  { id: '1', title: 'Analyst Provisioning', desc: 'Gunakan fitur "Provision New Node" untuk mendaftarkan akun analis baru dengan izin spesifik (Clearance Level).' },
                  { id: '2', title: 'Access Revocation', desc: 'Sesuai dengan protokol mitigasi risiko, Administrator dapat membekukan akses (Suspend) setiap analis melalui Action Toggle pada tabel Registry.' },
                  { id: '3', title: 'System Auditing', desc: 'Kolom Recent System Audit Trail memberikan cuplikan cepat (snapshot) atas modifikasi sistem terbaru.' }
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

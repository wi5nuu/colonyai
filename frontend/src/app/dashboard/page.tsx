'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  FlaskConical,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Download,
  FileText,
  Table as TableIcon,
  History as HistoryIcon,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Shield,
  Beaker,
  Calendar,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  Info
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { dashboardApi } from '@/lib/dashboard-api'
import { DashboardStats, Analysis } from '@/lib/types'
import { DashboardSkeleton } from '@/components/skeleton'
import { useAuthStore } from '@/lib/auth-store'
import { toast } from 'sonner'
import { useTranslationStore } from '@/lib/i18n/store'

const POLLING_INTERVAL = 30000


export default function DashboardPage() {
  const { t } = useTranslationStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mediaFilter, setMediaFilter] = useState<string>('all')
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([])
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  const loadStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const data: DashboardStats = await dashboardApi.getStats()

      if (isMountedRef.current) {
        setStats(data)
        setFilteredAnalyses(data.recent_analyses)
        if (isRefresh) {
          toast.success('Dashboard updated')
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
      if (isRefresh) toast.error('Failed to refresh')
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    loadStats()
    pollingRef.current = setInterval(() => {
      if (isMountedRef.current && document.visibilityState === 'visible') loadStats(true)
    }, POLLING_INTERVAL)
    return () => {
      isMountedRef.current = false
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [loadStats])

  useEffect(() => {
    if (!stats) return
    let filtered = [...stats.recent_analyses]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(a =>
        a.sample_id.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.media_type.toLowerCase().includes(q)
      )
    }
    if (mediaFilter !== 'all') filtered = filtered.filter(a => a.media_type === mediaFilter)
    setFilteredAnalyses(filtered)
  }, [searchQuery, mediaFilter, stats])

  const mediaTypes = stats ? Array.from(new Set(stats.recent_analyses.map(a => a.media_type))) : []
  const weeklyTotal = stats ? stats.weekly_trend.reduce((s, d) => s + d.analyses, 0) : 0

  // Transform weekly_trend for area chart with dot style
  const chartData = stats?.weekly_trend.map(d => ({
    name: d.day,
    analyses: d.analyses
  })) || []

  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const isOperational = user?.role === 'analyst' || user?.role === 'admin'


  if (isLoading) return <div className="p-6"><DashboardSkeleton /></div>
  
  return (
    <div className="animate-in fade-in duration-500">
      {/* Greeting Section */}
      <div className="mb-2 sm:mb-8">
        <h1 className="text-sm sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('overview.greeting')} {user?.full_name?.split(' ')[0] || 'Lead'} !
        </h1>
        <p className="text-slate-400 mt-0.5 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">{t('overview.subtitle')}</p>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
        {[
          { label: t('overview.totalAnalyses'), value: stats?.total_analyses || 0, icon: FlaskConical, trend: '+14%', color: 'indigo' },
          { label: t('overview.neuralConfidence'), value: `${stats?.neural_confidence || 0}%`, icon: Zap, trend: '+2.1%', color: 'emerald' },
          { label: t('overview.pendingAudit'), value: stats?.pending_review || 0, icon: Clock, trend: '-3', color: 'amber' },
          { label: t('overview.systemLatency'), value: `${stats?.system_latency_ms || 0}ms`, icon: Activity, trend: 'Optimal', color: 'blue' },
        ].map((card, i) => (
          <div key={i} className="bg-white border border-slate-200/60 p-2.5 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm group hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start mb-2 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-slate-50 group-hover:bg-primary/5 rounded-lg sm:rounded-xl transition-colors">
                <card.icon className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 group-hover:text-primary" />
              </div>
              <span className={`text-[8px] sm:text-[10px] font-black ${card.trend.includes('+') ? 'text-emerald-500' : 'text-slate-400'} uppercase tracking-widest`}>{card.trend}</span>
            </div>
            <div>
              <p className="text-slate-400 text-[7px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1">{card.label}</p>
              <p className="text-base sm:text-3xl font-black text-slate-900 tabular-nums tracking-tighter">{card.value}</p>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
               <card.icon className="w-10 h-10 sm:w-16 sm:h-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-8">
        {/* Left Column - 8/12 */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-8">
            {/* Job Applied / Specimen Trend Chart */}
            <div className="dashboard-card col-span-1 rounded-lg">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="font-black text-slate-900 text-xs uppercase tracking-[0.2em]">{t('overview.specimenTrend')}</h3>
                   <p className="text-[10px] text-slate-400 font-bold mt-0.5">{t('overview.rolling7day')}</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">{t('common.active')}</span>
                </div>
              </div>
              <div className="h-48 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                    />
                    <Area type="stepAfter" dataKey="analyses" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorAnalyses)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Project Overview / Analysis Breakdown */}
            <div className="dashboard-card col-span-1 rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-[0.2em]">{t('overview.analysisBreakdown')}</h3>
                <div className="bg-slate-50 border border-slate-200 rounded px-2 py-1 flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                  Batch: 2026-04 <ChevronDown className="w-3 h-3" />
                </div>
              </div>
              <div className="text-center mb-4 sm:mb-8">
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter">{stats?.total_analyses || 0}</p>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-black mt-0.5 sm:mt-1 uppercase tracking-[0.2em]">{t('overview.analyzedSpecimens')}</p>
              </div>
              {/* Segmented Progress Bar */}
              <div className="flex h-1.5 sm:h-2 w-full rounded-full overflow-hidden mb-4 sm:mb-8 bg-slate-100">
                <div className="bg-emerald-500" style={{ width: `${(stats?.verified_count || 0) / (stats?.total_analyses || 1) * 100}%` }} />
                <div className="bg-amber-500" style={{ width: `${(stats?.pending_review || 0) / (stats?.total_analyses || 1) * 100}%` }} />
                <div className="bg-rose-500" style={{ width: `${(stats?.failed_count || 0) / (stats?.total_analyses || 1) * 100}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                   { label: t('common.verified'), val: stats?.verified_count || 0, color: 'text-emerald-500' },
                   { label: t('common.review'), val: stats?.pending_review || 0, color: 'text-amber-500' },
                   { label: t('common.failed'), val: stats?.failed_count || 0, color: 'text-rose-500' }
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <p className={`text-base font-black ${item.color}`}>{item.val}</p>
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
              {isOperational && (
                <button 
                  onClick={() => router.push('/dashboard/upload')}
                  className="w-full mt-4 sm:mt-10 py-2.5 sm:py-3 bg-slate-900 rounded-lg text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20"
                >
                  {t('nav.newAnalysis')} <ArrowRight className="w-3 h-3" />
                </button>
              )}
              {!isOperational && (
                <button 
                  onClick={() => router.push('/dashboard/history')}
                  className="w-full mt-4 sm:mt-10 py-2.5 sm:py-3 bg-slate-900 rounded-lg text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20"
                >
                  {t('overview.goToGlobalArchive')} <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Performance Listed / Recent Analyses Table */}
          <div className="dashboard-card rounded-lg">
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <h3 className="font-black text-slate-900 text-[10px] sm:text-xs uppercase tracking-[0.2em]">{t('overview.neuralOutputRegistry')}</h3>
              <div className="flex items-center gap-2 sm:gap-3">
                 <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder={t('common.search')} 
                      className="bg-slate-50 border border-slate-200 rounded-md pl-8 pr-4 py-1.5 text-[10px] font-bold text-slate-900 outline-none focus:ring-1 focus:ring-primary/20 w-48"
                    />
                 </div>
                 <button className="p-1.5 sm:p-2 bg-slate-50 rounded-md border border-slate-200">
                   <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                 </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="pb-4 font-black">{t('overview.specimenId')}</th>
                    <th className="pb-4 hidden xs:table-cell font-black">{t('overview.mediaMatrix')}</th>
                    <th className="pb-4 font-black">{t('overview.yield')}</th>
                    <th className="pb-4 text-right font-black">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats?.recent_analyses.map((a, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                      <td className="py-4">
                        <span className="text-[11px] font-black text-slate-900 font-mono tracking-tight">{a.sample_id}</span>
                        <p className="xs:hidden text-[7px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{a.media_type}</p>
                      </td>
                      <td className="py-4 hidden xs:table-cell">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{a.media_type}</span>
                      </td>
                      <td className="py-4">
                         <span className="text-[11px] font-black text-slate-900">{a.colony_count}</span>
                         <span className="text-[9px] text-slate-400 ml-1 font-bold uppercase tracking-tighter">CFU</span>
                      </td>
                      <td className="py-4 text-right">
                         <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shadow-sm ${
                            a.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            a.status === 'processing' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                         }`}>
                            {t(`common.${a.status}`)}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - 4/12 */}
        <div className="lg:col-span-4 space-y-4">
          {/* Stats Bar */}
          <div className="dashboard-card p-3 sm:p-5">
             <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center divide-x divide-slate-100">
                <div>
                   <p className="text-slate-400 text-[8px] sm:text-[10px] font-bold uppercase mb-1 sm:mb-2">{t('common.verified')}</p>
                   <p className="text-sm sm:text-xl font-bold text-slate-900">{stats?.verified_count || 0}</p>
                </div>
                <div>
                   <p className="text-slate-400 text-[8px] sm:text-[10px] font-bold uppercase mb-1 sm:mb-2">{t('common.review')}</p>
                   <p className="text-sm sm:text-xl font-bold text-slate-900">{stats?.pending_review || 0}</p>
                </div>
                <div>
                   <p className="text-slate-400 text-[8px] sm:text-[10px] font-bold uppercase mb-1 sm:mb-2">{t('common.failed')}</p>
                   <p className="text-sm sm:text-xl font-bold text-slate-900">{stats?.failed_count || 0}</p>
                </div>
             </div>
          </div>

          {/* System Health Terminal */}
          <div className="dashboard-card rounded-lg p-0 overflow-hidden border-slate-200">
             <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">{t('overview.neuralNodeStatus')}</h3>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             </div>
             <div className="p-4 space-y-3">
                {[
                  { id: 'NODE-01-A', status: t('common.active'), load: '12%', color: 'text-emerald-500' },
                  { id: 'NODE-02-A', status: t('common.active'), load: '45%', color: 'text-emerald-500' },
                  { id: 'NODE-01-B', status: 'Idle', load: '0%', color: 'text-slate-300' },
                  { id: 'NODE-02-B', status: 'Standby', load: '2%', color: 'text-amber-500' },
                ].map((node, i) => (
                   <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                         <div className={`w-1 h-4 rounded-full ${node.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                         <span className="text-[11px] font-black text-slate-800 font-mono tracking-tighter">{node.id}</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className={`text-[9px] font-black uppercase tracking-widest ${node.color}`}>{node.status}</span>
                         <span className="text-[10px] font-bold text-slate-400 tabular-nums w-8 text-right">{node.load}</span>
                      </div>
                   </div>
                ))}
             </div>
             <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cluster 01-B // SECURE</span>
                <span className="text-[9px] font-bold text-slate-900">100% ONLINE</span>
             </div>
          </div>

          {/* Today Events */}
          <div className="bg-slate-900 rounded-lg p-4 text-white flex items-center justify-between group cursor-pointer hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
             <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                   <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">{t('overview.todayEvents')}</p>
                   <p className="text-sm font-bold">Batch Audit ISO-17025</p>
                </div>
             </div>
             <ChevronRight className="w-5 h-5 text-white/40 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Recent Alerts */}
          <div className="dashboard-card p-4">
             <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">{t('overview.recentSystemAlerts')}</h3>
             <div className="space-y-4">
                {[
                  { name: 'ISO-VRBA-005', desc: 'Low reliability detection', time: 'Only today', color: 'rose' },
                  { name: 'ISO-PCA-B2026', desc: 'Syncing with central ledger', time: '20-25', color: 'primary' },
                ].map((alert, i) => (
                  <div key={i} className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full bg-${alert.color}/10 flex items-center justify-center`}>
                           <Activity className={`w-4 h-4 text-${alert.color === 'rose' ? 'rose-500' : 'primary'}`} />
                        </div>
                        <div>
                           <p className="text-[11px] font-black text-slate-800">{alert.name}</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{alert.desc}</p>
                        </div>
                     </div>
                     <span className={`text-[9px] font-black ${alert.color === 'rose' ? 'text-rose-500' : 'text-slate-400'}`}>{alert.time}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Bottom Small Chart */}
          <div className="dashboard-card rounded-lg p-3 sm:p-4">
             <div className="h-20 sm:h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                      <Area type="step" dataKey="analyses" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
             <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{t('overview.diagnosticYield')}</p>
                <div className="flex items-center gap-1 text-emerald-500">
                   <ArrowUpRight className="w-4 h-4" />
                   <span className="text-xs font-black">+12%</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Cloudflare-style Intelligence Section at Bottom */}
      <div className="mt-4 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
           <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">{t('overview.neuralIntelligenceLayer')}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('overview.realTimeSpectral')}</p>
           </div>
           <div className="flex items-center gap-4">
              <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">{t('overview.downloadDataset')}</button>
              <div className="h-3 w-[1px] bg-slate-200" />
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{t('overview.activeSink')}</span>
              </div>
           </div>
        </div>

        {/* Query Overview Dashboard */}
        <div className="px-6 py-4 space-y-4">
           <div className="flex border-b border-slate-100 gap-6">
              {[t('overview.queryOverview'), t('overview.throughput'), t('overview.successRate')].map((tab, i) => (
                 <button key={tab} className={`pb-2 text-[10px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    {tab}
                 </button>
              ))}
           </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats && Object.entries(stats.matrix_breakdown).slice(0, 5).map(([label, val], i) => (
                <div key={i} className="border-r border-slate-50 last:border-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                     <div className={`w-1.5 h-1.5 rounded-full ${['bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500', 'bg-purple-500'][i % 5]}`} />
                     <span className="text-[9px] font-bold text-slate-400 truncate uppercase">{label} Matrix</span>
                  </div>
                  <p className="text-base font-black text-slate-900 tracking-tighter">{val}</p>
                </div>
              ))}
              {(!stats || Object.keys(stats.matrix_breakdown).length === 0) && (
                <p className="text-[10px] text-slate-400 italic col-span-5">No matrix data available</p>
              )}
            </div>

           {/* Detailed Chart - Compact Height */}
           <div className="h-[180px] w-full pt-4">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chartData}>
                 <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#cbd5e1', fontWeight: 900 }} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#cbd5e1', fontWeight: 700 }} dx={-10} />
                 <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '4px' }} />
                 <Line type="monotone" dataKey="analyses" stroke="#3b82f6" strokeWidth={1} dot={false} activeDot={{ r: 3, fill: '#3b82f6' }} />
                 <Line type="step" dataKey="analyses" stroke="#f59e0b" strokeWidth={1} dot={false} strokeDasharray="3 3" opacity={0.5} />
               </LineChart>
             </ResponsiveContainer>
           </div>
           <p className="text-[8px] text-center text-slate-300 font-bold uppercase tracking-[0.3em]">Neural Query Time Frame (GMT+7)</p>
        </div>

        {/* Intelligence Stats - Compact Row */}
        <div className="px-6 py-6 bg-slate-50/50 border-t border-slate-100">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="border-l-2 border-blue-500 pl-4">
                 <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{t('overview.totalNeuralQueries')} <Info className="w-2.5 h-2.5 inline ml-1 opacity-30" /></p>
                 <p className="text-base font-black text-slate-900 tracking-tighter">{stats?.total_analyses || 0}</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4">
                 <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{t('overview.avgQps')} <Info className="w-2.5 h-2.5 inline ml-1 opacity-30" /></p>
                 <p className="text-base font-black text-slate-900 tracking-tighter">0.035</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4">
                 <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{t('overview.processingTime')} <Info className="w-2.5 h-2.5 inline ml-1 opacity-30" /></p>
                 <p className="text-base font-black text-slate-900 tracking-tighter">{stats?.system_latency_ms || 0}<span className="text-[10px] ml-0.5 text-slate-400 font-bold uppercase">ms</span></p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

// Dot Matrix Mini Chart Component
function DotMatrixChart({ data, color }: { data: { name: string; analyses: number }[]; color: string }) {
  const maxVal = Math.max(...data.map(d => d.analyses), 1)
  return (
    <div className="flex items-end gap-1 h-10">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          {Array.from({ length: Math.ceil((d.analyses / maxVal) * 5) }).map((_, j) => (
            <div key={j} className="w-1.5 h-1.5 rounded-full opacity-60" style={{ backgroundColor: color }} />
          ))}
        </div>
      ))}
    </div>
  )
}

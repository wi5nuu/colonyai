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
  Beaker
} from 'lucide-react'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts'
import { dashboardApi } from '@/lib/dashboard-api'
import { DashboardStats, Analysis } from '@/lib/types'
import { DashboardSkeleton } from '@/components/skeleton'
import { useAuthStore } from '@/lib/auth-store'
import { toast } from 'sonner'

const POLLING_INTERVAL = 30000

export default function DashboardPage() {
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
      const data = await dashboardApi.getStats()
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

  const { user } = useAuthStore()
  const isManager = user?.role === 'viewer'

  if (isLoading) return <div className="p-6"><DashboardSkeleton /></div>
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            {isManager ? 'Managerial Intelligence' : 'Laboratory Overview'}
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">
            {isManager ? 'Class-02 Oversight // Laboratory Network Status' : 'Class-01 Operational // Real-time Diagnostics'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => loadStats(true)} disabled={isRefreshing} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-150 shadow-sm">
            <RefreshCw className={`h-5 w-5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          {!isManager && (
            <Link href="/dashboard/upload" className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors duration-150 shadow-sm">
              <Upload className="h-4 w-4" /> New Analysis
            </Link>
          )}
        </div>
      </div>

      {isManager && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
           {[
             { label: 'Analyst Throughput', value: '14.2', sub: 'Units / Hour', icon: Activity, color: 'blue' },
             { label: 'Network Latency', value: '42ms', sub: 'Global Sync', icon: Zap, color: 'blue' },
             { label: 'Integrity Score', value: '99.8%', sub: 'Compliance Ready', icon: Shield, color: 'emerald' },
             { label: 'System Uptime', value: '100%', sub: 'Node Active', icon: CheckCircle, color: 'blue' },
           ].map((m, i) => (
             <div key={i} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <m.icon className="w-12 h-12 text-white" />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{m.label}</p>
                <p className="text-2xl font-black text-white tracking-tighter">{m.value}</p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{m.sub}</p>
                <div className={`absolute bottom-0 left-0 h-1 bg-${m.color}-500 w-full opacity-30`} />
             </div>
           ))}
        </div>
      )}

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 transition-all duration-150 hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats?.recent_analyses?.filter(a => (Date.now() - new Date(a.created_at).getTime()) / 3600000 < 24).length || 0}</p>
            <p className="text-sm text-slate-500 font-medium">New specimens (24h)</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 transition-all duration-150 hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats?.pending_review || 0}</p>
            <p className="text-sm text-slate-500 font-medium">Pending review</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 transition-all duration-150 hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{weeklyTotal || 0}</p>
            <p className="text-sm text-slate-500 font-medium">This week</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Plates */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Beaker className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">+{weeklyTotal} this week</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{(stats?.total_analyses || 0).toLocaleString()}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">Total Plates Analyzed</p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <DotMatrixChart data={chartData} color="#2563eb" />
          </div>
        </div>

        {/* Time Saved */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">~15 min/plate</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{Math.round((stats?.total_analyses || 0) * 0.25)}h</p>
            <p className="text-sm font-medium text-slate-500 mt-1">Time Saved</p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <DotMatrixChart data={chartData} color="#9333ea" />
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${(stats?.success_rate || 0) >= 90 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                {(stats?.success_rate || 0) >= 90 ? 'Excellent' : 'Review'}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{(stats?.success_rate || 0).toFixed(1)}%</p>
            <p className="text-sm font-medium text-slate-500 mt-1">Success Rate</p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 w-full">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats?.success_rate || 0}%` }} />
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-rose-600" />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${(stats?.pending_review || 0) > 0 ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>
                {(stats?.pending_review || 0) > 0 ? 'Action needed' : 'All clear'}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.pending_review || 0}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">Pending Review</p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <DotMatrixChart data={chartData} color="#e11d48" />
          </div>
        </div>
      </div>

      {/* Chart & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Analysis Throughput</h3>
              <p className="text-sm text-slate-500 font-medium">Last 7 days performance</p>
            </div>
            <div className="flex items-center">
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">{chartData[0]?.name} - {chartData[6]?.name}</span>
            </div>
          </div>
          <div className="h-[280px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#2563eb', fontWeight: 600 }}
                  labelStyle={{ color: '#64748b', fontWeight: 500, marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="analyses" stroke="#2563eb" strokeWidth={3} fill="url(#colorAnalyses)" dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Summary Stats */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{weeklyTotal}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily Avg</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{(weeklyTotal / 7).toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Peak</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {chartData.length > 0 
                  ? chartData.reduce((m, d) => d.analyses > m.analyses ? d : m, chartData[0])?.name 
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {[
              { icon: Upload, title: 'New Analysis', desc: 'Upload plate image', href: '/dashboard/upload', color: 'blue' },
              { icon: HistoryIcon, title: 'View History', desc: 'Browse past results', href: '/dashboard/history', color: 'blue' },
              { icon: BarChart3, title: 'Analytics', desc: 'Detailed insights', href: '/dashboard/analytics', color: 'purple' },
              { icon: FileText, title: 'Reports', desc: 'Export PDF/CSV', href: '/dashboard/reports', color: 'emerald' },
            ].map((item, i) => (
              <Link key={i} href={item.href} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-slate-100 transition-colors duration-150 group">
                <div className={`w-10 h-10 rounded-xl bg-${item.color}-100 border border-${item.color}-200 flex items-center justify-center transition-transform duration-150`}>
                  <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Analyses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Analyses</h3>
              <p className="text-sm font-medium text-slate-500">{filteredAnalyses.length} of {stats?.recent_analyses?.length || 0} shown</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Search ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm w-48 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select value={mediaFilter} onChange={(e) => setMediaFilter(e.target.value)} className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer">
                  <option value="all">All Media</option>
                  {mediaTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto w-full pb-2">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Sample ID', 'Media', 'Count', 'CFU/ml', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAnalyses.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-150">
                        <FlaskConical className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{a.sample_id}</p>
                        <p className="text-xs text-slate-400 font-mono tracking-wider">{a.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold tracking-wide">{a.media_type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{a.colony_count}</td>
                  <td className="px-6 py-4">
                    {a.cfu_per_ml == null
                      ? <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md font-bold tracking-widest uppercase">{a.warnings?.some(w => w.includes('TNTC')) ? 'TNTC' : 'TFTC'}</span>
                      : <span className="text-sm font-mono font-bold text-slate-900">{a.cfu_per_ml >= 10000 ? a.cfu_per_ml.toExponential(1) : a.cfu_per_ml.toLocaleString()}</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-widest uppercase border ${
                      a.status === 'completed' && a.is_valid_for_reporting ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      a.status === 'completed' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      a.status === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {a.status === 'completed' ? (a.is_valid_for_reporting ? 'Verified' : 'Review') : a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">
                    {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAnalyses.length === 0 && (
            <div className="py-16 text-center bg-slate-50/50">
              <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">No diagnostic records found</p>
            </div>
          )}
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

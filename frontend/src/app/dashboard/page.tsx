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

  if (isLoading) return <div className="p-6"><DashboardSkeleton /></div>
  if (!stats) return (
    <div className="text-center py-20">
      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">Failed to load dashboard</p>
      <button onClick={() => loadStats()} className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-full text-sm">Retry</button>
    </div>
  )
  if (stats.total_analyses === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-3xl bg-orange-100 flex items-center justify-center mb-6">
        <FlaskConical className="h-10 w-10 text-orange-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ColonyAI</h2>
      <p className="text-gray-500 mb-8 max-w-md">Upload your first agar plate image to begin AI-powered colony analysis.</p>
      <div className="flex gap-3">
        <Link href="/dashboard/upload" className="px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">Upload First Plate</Link>
        <Link href="/dashboard/history" className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">View History</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laboratory Overview</h1>
          <p className="text-gray-500 mt-1">Real-time analytics for microbiological diagnostics</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => loadStats(true)} disabled={isRefreshing} className="p-2.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
            <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link href="/dashboard/upload" className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
            <Upload className="h-4 w-4" /> New Analysis
          </Link>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.recent_analyses.filter(a => (Date.now() - new Date(a.created_at).getTime()) / 3600000 < 24).length}</p>
            <p className="text-sm text-gray-500">New specimens (24h)</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.pending_review}</p>
            <p className="text-sm text-gray-500">Pending review</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{weeklyTotal}</p>
            <p className="text-sm text-gray-500">This week</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Plates */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Beaker className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">+{weeklyTotal} this week</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total_analyses.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Total Plates Analyzed</p>
          {/* Dot Matrix Chart */}
          <div className="mt-4">
            <DotMatrixChart data={chartData} color="#f97316" />
          </div>
        </div>

        {/* Time Saved */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">~15 min/plate</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{Math.round(stats.total_analyses * 0.25)}h</p>
          <p className="text-sm text-gray-500 mt-1">Time Saved</p>
          <div className="mt-4">
            <DotMatrixChart data={chartData} color="#a855f7" />
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${stats.success_rate >= 90 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
              {stats.success_rate >= 90 ? 'Excellent' : 'Review'}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.success_rate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500 mt-1">Success Rate</p>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${stats.success_rate}%` }} />
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-rose-600" />
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${stats.pending_review > 0 ? 'text-rose-600 bg-rose-50' : 'text-green-600 bg-green-50'}`}>
              {stats.pending_review > 0 ? 'Action needed' : 'All clear'}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pending_review}</p>
          <p className="text-sm text-gray-500 mt-1">Pending Review</p>
          <div className="mt-4">
            <DotMatrixChart data={chartData} color="#f43f5e" />
          </div>
        </div>
      </div>

      {/* Chart & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Main Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analysis Throughput</h3>
              <p className="text-sm text-gray-500">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">{chartData[0]?.name} - {chartData[6]?.name}</span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: '#f97316', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="analyses" stroke="#f97316" strokeWidth={2.5} fill="url(#colorAnalyses)" dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#f97316' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Summary Stats */}
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{weeklyTotal}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Daily Avg</p>
              <p className="text-xl font-bold text-gray-900">{(weeklyTotal / 7).toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Peak</p>
              <p className="text-xl font-bold text-gray-900">{chartData.reduce((m, d) => d.analyses > m.analyses ? d : m, chartData[0])?.name}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { icon: Upload, title: 'New Analysis', desc: 'Upload plate image', href: '/dashboard/upload', color: 'orange' },
              { icon: HistoryIcon, title: 'View History', desc: 'Browse past results', href: '/dashboard/history', color: 'blue' },
              { icon: BarChart3, title: 'Analytics', desc: 'Detailed insights', href: '/dashboard/analytics', color: 'purple' },
              { icon: FileText, title: 'Reports', desc: 'Export PDF/CSV', href: '/dashboard/reports', color: 'emerald' },
            ].map((item, i) => (
              <Link key={i} href={item.href} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                <div className={`w-10 h-10 rounded-xl bg-${item.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Analyses Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Analyses</h3>
              <p className="text-sm text-gray-500">{filteredAnalyses.length} of {stats.recent_analyses.length} shown</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-3 py-2 bg-gray-50 border-0 rounded-full text-sm w-48 focus:ring-2 focus:ring-orange-200 focus:bg-white transition-all" />
              </div>
              <select value={mediaFilter} onChange={(e) => setMediaFilter(e.target.value)} className="py-2 px-3 bg-gray-50 border-0 rounded-full text-sm focus:ring-2 focus:ring-orange-200">
                <option value="all">All Media</option>
                {mediaTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Sample ID', 'Media', 'Count', 'CFU/ml', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAnalyses.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                        <FlaskConical className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{a.sample_id}</p>
                        <p className="text-xs text-gray-400 font-mono">{a.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{a.media_type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{a.colony_count}</td>
                  <td className="px-6 py-4">
                    {a.cfu_per_ml == null
                      ? <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-medium">{a.warnings?.some(w => w.includes('TNTC')) ? 'TNTC' : 'TFTC'}</span>
                      : <span className="text-sm font-mono font-semibold text-gray-900">{a.cfu_per_ml >= 10000 ? a.cfu_per_ml.toExponential(1) : a.cfu_per_ml.toLocaleString()}</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      a.status === 'completed' && a.is_valid_for_reporting ? 'bg-emerald-100 text-emerald-700' :
                      a.status === 'completed' ? 'bg-amber-100 text-amber-700' :
                      a.status === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {a.status === 'completed' ? (a.is_valid_for_reporting ? 'Verified' : 'Review') : a.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAnalyses.length === 0 && (
            <div className="py-12 text-center">
              <Search className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No results found</p>
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

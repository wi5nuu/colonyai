'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { TrendingUp, Calendar, Filter, Download, BarChart3, Loader2, AlertCircle, FlaskConical, Users, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Scatter } from 'recharts'
import { analysesApi } from '@/lib/analyses-api'
import { reportsApi } from '@/lib/reports-api'
import { Analysis, AnalysisListResponse, MediaType } from '@/lib/types'
import { toast } from 'sonner'

type DateRange = '7d' | '30d' | '90d' | 'custom'
interface TimeSeriesPoint { date: string; label: string; avgCfu: number; testCount: number; passRate: number; tntcCount: number; tftcCount: number; status: 'normal' | 'TNTC' | 'TFTC'; analysts: string[] }
interface MonthlySummary { month: string; tests: number; avgCfu: number; passRate: number; analysts: string }

const MEDIA_TYPES = [
  { value: 'all', label: 'All Media Types' }, { value: 'Plate Count Agar', label: 'PCA' },
  { value: 'VRBA', label: 'VRBA' }, { value: 'BGBB', label: 'BGBB' },
  { value: 'MacConkey', label: 'MacConkey' }, { value: 'R2A', label: 'R2A' },
  { value: 'TSA', label: 'TSA' }, { value: 'Other', label: 'Other' },
]
const DATE_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' }, { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' }, { value: 'custom', label: 'Custom' },
]

function getDateRange(range: DateRange) {
  if (range === 'custom') return null
  const now = new Date()
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  return { date_from: new Date(now.getTime() - days * 86400000).toISOString(), date_to: now.toISOString() }
}

function formatCFU(v: number, status?: string) {
  if (status === 'TNTC') return 'TNTC'
  if (status === 'TFTC') return 'TFTC'
  if (v >= 10000) return v.toExponential(2)
  return v.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

function groupByDate(analyses: Analysis[], range: DateRange): TimeSeriesPoint[] {
  const grouped: Record<string, Analysis[]> = {}
  analyses.forEach((a) => { const k = a.created_at.slice(0, 10); if (!grouped[k]) grouped[k] = []; grouped[k].push(a) })
  return Object.keys(grouped).sort().map((key) => {
    const items = grouped[key]
    const valid = items.filter(a => a.status === 'valid')
    const cfuItems = items.filter(a => a.cfu_per_ml != null)
    const avgCfu = cfuItems.length > 0 ? cfuItems.reduce((s, a) => s + (a.cfu_per_ml || 0), 0) / cfuItems.length : 0
    const tntcCount = items.filter(a => a.status === 'TNTC').length
    const tftcCount = items.filter(a => a.status === 'TFTC').length
    const d = new Date(key)
    const label = range === '7d' ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const status: 'normal' | 'TNTC' | 'TFTC' = tntcCount > items.length * 0.5 ? 'TNTC' : tftcCount > items.length * 0.5 ? 'TFTC' : 'normal'
    return { date: key, label, avgCfu: Math.round(avgCfu * 10) / 10, testCount: items.length, passRate: Math.round((valid.length / items.length) * 1000) / 10, tntcCount, tftcCount, status, analysts: Array.from(new Set(items.map(a => a.user?.full_name || a.user?.email || 'Unknown'))) }
  })
}

function groupByMonth(analyses: Analysis[]): MonthlySummary[] {
  const grouped: Record<string, Analysis[]> = {}
  analyses.forEach((a) => { const k = a.created_at.slice(0, 7); if (!grouped[k]) grouped[k] = []; grouped[k].push(a) })
  return Object.keys(grouped).sort().map((key) => {
    const items = grouped[key]
    const valid = items.filter(a => a.status === 'valid')
    const cfuItems = items.filter(a => a.cfu_per_ml != null)
    const avgCfu = cfuItems.length > 0 ? cfuItems.reduce((s, a) => s + (a.cfu_per_ml || 0), 0) / cfuItems.length : 0
    const d = new Date(key + '-01')
    return { month: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), tests: items.length, avgCfu: Math.round(avgCfu * 10) / 10, passRate: Math.round((valid.length / items.length) * 1000) / 10, analysts: Array.from(new Set(items.map(a => a.user?.full_name || a.user?.email || 'Unknown'))).join(', ') }
  })
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0]?.payload as TimeSeriesPoint
  if (!p) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 min-w-[180px]">
      <p className="text-xs font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">{label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-6"><span className="text-xs text-slate-500">Tests</span><span className="text-xs font-bold text-slate-900">{p.testCount}</span></div>
        <div className="flex justify-between gap-6"><span className="text-xs text-slate-500">Avg CFU/ml</span><span className="text-xs font-bold text-orange-600">{formatCFU(p.avgCfu)}</span></div>
        <div className="flex justify-between gap-6"><span className="text-xs text-slate-500">Pass Rate</span><span className="text-xs font-bold text-emerald-600">{p.passRate}%</span></div>
        {p.tntcCount > 0 && <div className="flex justify-between gap-6"><span className="text-xs text-rose-500">TNTC</span><span className="text-xs font-bold text-rose-600">{p.tntcCount}</span></div>}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [mediaType, setMediaType] = useState<MediaType | 'all'>('all')
  const [analystFilter, setAnalystFilter] = useState('all')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  const [allAnalyses, setAllAnalyses] = useState<Analysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true); setError(null)
    try {
      const range = getDateRange(dateRange)
      let collected: Analysis[] = [], page = 1, totalPages = 1
      while (page <= totalPages) {
        const r: AnalysisListResponse = await analysesApi.list({ page, page_size: 200, media_type: mediaType !== 'all' ? mediaType as MediaType : undefined, date_from: range?.date_from ?? (dateRange === 'custom' && customDateFrom ? customDateFrom : undefined), date_to: range?.date_to ?? (dateRange === 'custom' && customDateTo ? customDateTo : undefined) })
        collected = collected.concat(r.analyses); totalPages = r.total_pages; page++
      }
      setAllAnalyses(collected)
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || 'Failed to load analytics'
      setError(msg); toast.error(msg)
    } finally { setIsLoading(false) }
  }, [dateRange, mediaType, customDateFrom, customDateTo])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = useMemo(() => analystFilter === 'all' ? allAnalyses : allAnalyses.filter(a => a.user?.full_name === analystFilter || a.user?.email === analystFilter), [allAnalyses, analystFilter])
  const uniqueAnalysts = useMemo(() => Array.from(new Set(allAnalyses.map(a => a.user?.full_name || a.user?.email || 'Unknown'))).sort(), [allAnalyses])
  const timeSeriesData = useMemo(() => groupByDate(filtered, dateRange), [filtered, dateRange])
  const monthlySummaries = useMemo(() => groupByMonth(filtered), [filtered])
  const stats = useMemo(() => {
    const total = filtered.length
    if (total === 0) return { total: 0, avgCfu: 0, passRate: 0, tntc: 0, tftc: 0 }
    const valid = filtered.filter(a => a.status === 'valid').length
    const cfuItems = filtered.filter(a => a.cfu_per_ml != null)
    const avgCfu = cfuItems.length > 0 ? cfuItems.reduce((s, a) => s + (a.cfu_per_ml || 0), 0) / cfuItems.length : 0
    return { total, avgCfu: Math.round(avgCfu * 10) / 10, passRate: Math.round((valid / total) * 1000) / 10, tntc: filtered.filter(a => a.status === 'TNTC').length, tftc: filtered.filter(a => a.status === 'TFTC').length }
  }, [filtered])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const r = await reportsApi.generateCsv({ report_type: 'custom', date_from: dateRange === 'custom' ? customDateFrom : getDateRange(dateRange)?.date_from, date_to: dateRange === 'custom' ? customDateTo : getDateRange(dateRange)?.date_to, format: 'csv' })
      window.open(r.url, '_blank'); toast.success('CSV exported')
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Export failed') }
    finally { setIsExporting(false) }
  }

  if (isLoading && allAnalyses.length === 0) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" /><p className="mt-3 text-sm font-medium text-slate-500">Loading analytics...</p></div>
    </div>
  )

  if (error && allAnalyses.length === 0) return (
    <div className="text-center py-20">
      <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
      <p className="text-slate-600 mb-4">{error}</p>
      <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold" onClick={fetchData}>Retry</button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics</h1>
          <p className="text-slate-500 mt-1.5">ISO 17025 microbiological performance dashboard</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors duration-150 shadow-sm">
            <TrendingUp className="h-4 w-4" /> Refresh
          </button>
          <button onClick={handleExport} disabled={isExporting || filtered.length === 0} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold transition-colors duration-150 shadow-sm">
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Period</label>
            <select className="w-full px-3 py-2.5 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none" value={dateRange} onChange={e => setDateRange(e.target.value as DateRange)}>
              {DATE_RANGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"><FlaskConical className="h-3 w-3" /> Media Type</label>
            <select className="w-full px-3 py-2.5 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none" value={mediaType} onChange={e => setMediaType(e.target.value as MediaType | 'all')}>
              {MEDIA_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"><Users className="h-3 w-3" /> Analyst</label>
            <select className="w-full px-3 py-2.5 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none" value={analystFilter} onChange={e => setAnalystFilter(e.target.value)}>
              <option value="all">All Personnel</option>
              {uniqueAnalysts.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          {dateRange === 'custom' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Custom Range</label>
              <div className="flex gap-2">
                <input type="date" className="flex-1 px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={customDateFrom} onChange={e => setCustomDateFrom(e.target.value)} />
                <input type="date" className="flex-1 px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={customDateTo} onChange={e => setCustomDateTo(e.target.value)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Tests', val: stats.total, icon: BarChart3, bg: 'bg-orange-50 border-orange-100', ic: 'text-orange-600', vl: 'text-slate-900' },
          { label: 'Avg CFU/ml', val: formatCFU(stats.avgCfu), icon: TrendingUp, bg: 'bg-blue-50 border-blue-100', ic: 'text-blue-600', vl: 'text-slate-900' },
          { label: 'Pass Rate', val: `${stats.passRate}%`, icon: CheckCircle2, bg: 'bg-emerald-50 border-emerald-100', ic: 'text-emerald-600', vl: 'text-emerald-700' },
          { label: 'TNTC Critical', val: stats.tntc, icon: XCircle, bg: 'bg-rose-50 border-rose-100', ic: 'text-rose-600', vl: 'text-rose-700' },
          { label: 'TFTC Warning', val: stats.tftc, icon: AlertTriangle, bg: 'bg-amber-50 border-amber-100', ic: 'text-amber-600', vl: 'text-amber-700' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-3 ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.ic}`} />
            </div>
            <p className={`text-2xl font-bold ${s.vl}`}>{s.val}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">CFU Density Trend</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Temporal distribution of colony concentrations</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Pass</span>
            <span className="flex items-center gap-1.5 text-rose-600"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />TNTC</span>
            <span className="flex items-center gap-1.5 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />TFTC</span>
          </div>
        </div>
        {timeSeriesData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-400">No data for selected period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} dx={-8} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="avgCfu" stroke="#ea580c" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#ea580c', strokeWidth: 2, stroke: '#fff' }} />
              <Scatter dataKey="avgCfu" data={timeSeriesData} shape={(props: any) => {
                const { cx, cy, payload } = props
                const color = payload.status === 'TNTC' ? '#ef4444' : payload.status === 'TFTC' ? '#eab308' : '#22c55e'
                return <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />
              }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Monthly Ledger</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">ISO 17025 Aggregated Monthly Report</p>
          </div>
          {monthlySummaries.length > 0 && <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">{monthlySummaries.length} months</span>}
        </div>
        {monthlySummaries.length === 0 ? (
          <div className="text-center py-16"><p className="text-sm font-medium text-slate-400">No monthly data found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {['Month', 'Total Tests', 'Avg CFU/ml', 'Compliance Rate', 'Analysts'].map(h => (
                    <th key={h} className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlySummaries.map((row) => (
                  <tr key={row.month} className="hover:bg-slate-50/80 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{row.month}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{row.tests} analyses</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md">{formatCFU(row.avgCfu)} CFU/ml</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${row.passRate >= 80 ? 'bg-emerald-500' : row.passRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${row.passRate}%` }} />
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${row.passRate >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : row.passRate >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-rose-700 bg-rose-50 border-rose-200'}`}>{row.passRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{row.analysts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

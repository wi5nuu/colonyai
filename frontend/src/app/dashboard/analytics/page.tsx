'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  TrendingUp,
  Calendar,
  Filter,
  Download,
  BarChart3,
  Loader2,
  AlertCircle,
  FlaskConical,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Scatter,
  ComposedChart,
} from 'recharts'
import { analysesApi } from '@/lib/analyses-api'
import { reportsApi } from '@/lib/reports-api'
import { Analysis, AnalysisListResponse, MediaType } from '@/lib/types'
import { toast } from 'sonner'

// ============================================================
// Type definitions
// ============================================================

type DateRange = '7d' | '30d' | '90d' | 'custom'

interface TimeSeriesPoint {
  date: string
  label: string
  avgCfu: number
  testCount: number
  passRate: number
  tntcCount: number
  tftcCount: number
  status: 'normal' | 'TNTC' | 'TFTC'
  analysts: string[]
}

interface MonthlySummary {
  month: string
  tests: number
  avgCfu: number
  passRate: number
  analysts: string
}

// ============================================================
// Constants
// ============================================================

const MEDIA_TYPES: { value: MediaType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Media Types' },
  { value: 'Plate Count Agar', label: 'PCA' },
  { value: 'VRBA', label: 'VRBA' },
  { value: 'BGBB', label: 'BGBB' },
  { value: 'MacConkey', label: 'MacConkey' },
  { value: 'R2A', label: 'R2A' },
  { value: 'TSA', label: 'TSA' },
  { value: 'Other', label: 'Other' },
]

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom' },
]

const PAGE_SIZE = 200

// ============================================================
// Helpers
// ============================================================

function getDateRange(range: DateRange): { date_from: string; date_to: string } | null {
  if (range === 'custom') return null
  const now = new Date()
  const date_to = now.toISOString()
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const date_from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
  return { date_from, date_to }
}

function formatCFU(value: number, status?: string): string {
  if (status === 'TNTC') return 'TNTC'
  if (status === 'TFTC') return 'TFTC'
  if (value >= 10000) return value.toExponential(2)
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

function formatMonthLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatDateLabel(dateStr: string, range: DateRange): string {
  const d = new Date(dateStr)
  if (range === '7d') {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function groupAnalysesByDate(
  analyses: Analysis[],
  range: DateRange
): TimeSeriesPoint[] {
  const grouped: Record<string, Analysis[]> = {}

  analyses.forEach((a) => {
    const key = new Date(a.created_at).toISOString().slice(0, 10)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(a)
  })

  const sortedKeys = Object.keys(grouped).sort()

  return sortedKeys.map((key) => {
    const items = grouped[key]
    const validItems = items.filter((a) => a.status === 'valid')
    const validCfuItems = items.filter((a) => a.cfu_per_ml != null)
    const avgCfu = validCfuItems.length > 0
      ? validCfuItems.reduce((sum, a) => sum + (a.cfu_per_ml || 0), 0) / validCfuItems.length
      : 0
    const passRate = (validItems.length / items.length) * 100

    // Determine the dominant status for the day
    const tntcCount = items.filter((a) => a.status === 'TNTC').length
    const tftcCount = items.filter((a) => a.status === 'TFTC').length
    let status: 'normal' | 'TNTC' | 'TFTC' = 'normal'
    if (tntcCount > items.length * 0.5) status = 'TNTC'
    else if (tftcCount > items.length * 0.5) status = 'TFTC'

    const analysts = Array.from(new Set(items.map((a) => a.user?.full_name || a.user?.email || 'Unknown')))

    return {
      date: key,
      label: formatDateLabel(key, range),
      avgCfu: Math.round(avgCfu * 10) / 10,
      testCount: items.length,
      passRate: Math.round(passRate * 10) / 10,
      tntcCount,
      tftcCount,
      status,
      analysts,
    }
  })
}

function computeMonthlySummaries(analyses: Analysis[]): MonthlySummary[] {
  const grouped: Record<string, Analysis[]> = {}

  analyses.forEach((a) => {
    const key = new Date(a.created_at).toISOString().slice(0, 7)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(a)
  })

  const sortedKeys = Object.keys(grouped).sort()

  return sortedKeys.map((key) => {
    const items = grouped[key]
    const validItems = items.filter((a) => a.status === 'valid')
    const validCfuItems = items.filter((a) => a.cfu_per_ml != null)
    const avgCfu = validCfuItems.length > 0
      ? validCfuItems.reduce((sum, a) => sum + (a.cfu_per_ml || 0), 0) / validCfuItems.length
      : 0
    const passRate = (validItems.length / items.length) * 100
    const analysts = Array.from(
      new Set(items.map((a) => a.user?.full_name || a.user?.email || 'Unknown'))
    ).join(', ')

    return {
      month: formatMonthLabel(key + '-01'),
      tests: items.length,
      avgCfu: Math.round(avgCfu * 10) / 10,
      passRate: Math.round(passRate * 10) / 10,
      analysts,
    }
  })
}

// ============================================================
// Custom tooltip for the chart
// ============================================================

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null

  const point = payload[0]?.payload as TimeSeriesPoint | undefined
  if (!point) return null

  return (
    <div className="card glass-dark p-6 shadow-2xl ring-1 ring-white/10">
      <p className="font-black text-foreground mb-3 uppercase tracking-widest text-xs border-b border-border/50 pb-2">{label}</p>
      <div className="space-y-2.5">
        <div className="flex justify-between gap-8 py-0.5">
          <span className="text-muted-foreground font-bold text-[10px] uppercase">Batch Tests</span>
          <span className="font-black text-foreground text-xs">{point.testCount}</span>
        </div>
        <div className="flex justify-between gap-8 py-0.5">
          <span className="text-muted-foreground font-bold text-[10px] uppercase">Mean Concentration</span>
          <span className="font-black text-primary text-xs">{formatCFU(point.avgCfu)} <span className="text-[8px] opacity-70">CFU/ml</span></span>
        </div>
        <div className="flex justify-between gap-8 py-0.5">
          <span className="text-muted-foreground font-bold text-[10px] uppercase">System Precision</span>
          <span className="font-black text-emerald-500 text-xs">{point.passRate}%</span>
        </div>
        {point.tntcCount > 0 && (
          <div className="flex justify-between gap-8 py-0.5">
            <span className="text-rose-500 font-bold text-[10px] uppercase">Critical (TNTC)</span>
            <span className="font-black text-rose-500 text-xs">{point.tntcCount}</span>
          </div>
        )}
        <div className="pt-2 border-t border-border/30 mt-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Authorized Personnel</span>
            <p className="text-[10px] font-black text-foreground/80 mt-1">{point.analysts.join(', ')}</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Main Page Component
// ============================================================

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [mediaType, setMediaType] = useState<MediaType | 'all'>('all')
  const [analystFilter, setAnalystFilter] = useState<string>('all')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')

  const [allAnalyses, setAllAnalyses] = useState<Analysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // ----------------------------------------------------------
  // Fetch all analyses (paginate to get all data)
  // ----------------------------------------------------------
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const range = getDateRange(dateRange)
      let collected: Analysis[] = []
      let page = 1
      let totalPages = 1

      while (page <= totalPages) {
        const result: AnalysisListResponse = await analysesApi.list({
          page,
          page_size: PAGE_SIZE,
          media_type: mediaType !== 'all' ? (mediaType as MediaType) : undefined,
          date_from: range?.date_from ?? (dateRange === 'custom' && customDateFrom ? customDateFrom : undefined),
          date_to: range?.date_to ?? (dateRange === 'custom' && customDateTo ? customDateTo : undefined),
        })
        collected = collected.concat(result.analyses)
        totalPages = result.total_pages
        page++
      }

      setAllAnalyses(collected)
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to load analytics data'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange, mediaType, customDateFrom, customDateTo])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ----------------------------------------------------------
  // Filter by analyst client-side
  // ----------------------------------------------------------
  const filteredAnalyses = useMemo(() => {
    if (analystFilter === 'all') return allAnalyses
    return allAnalyses.filter(
      (a) =>
        a.user?.full_name === analystFilter || a.user?.email === analystFilter
    )
  }, [allAnalyses, analystFilter])

  // ----------------------------------------------------------
  // Derived unique analysts for dropdown
  // ----------------------------------------------------------
  const uniqueAnalysts = useMemo(() => {
    const names = new Set<string>()
    allAnalyses.forEach((a) => {
      names.add(a.user?.full_name || a.user?.email || 'Unknown')
    })
    return Array.from(names).sort()
  }, [allAnalyses])

  // ----------------------------------------------------------
  // Time series data
  // ----------------------------------------------------------
  const timeSeriesData = useMemo(
    () => groupAnalysesByDate(filteredAnalyses, dateRange),
    [filteredAnalyses, dateRange]
  )

  // ----------------------------------------------------------
  // Monthly summaries
  // ----------------------------------------------------------
  const monthlySummaries = useMemo(
    () => computeMonthlySummaries(filteredAnalyses),
    [filteredAnalyses]
  )

  // ----------------------------------------------------------
  // Summary statistics
  // ----------------------------------------------------------
  const summaryStats = useMemo(() => {
    const total = filteredAnalyses.length
    if (total === 0) {
      return { total: 0, avgCfu: 0, passRate: 0, tntc: 0, tftc: 0 }
    }
    const valid = filteredAnalyses.filter((a) => a.status === 'valid').length
    const tntc = filteredAnalyses.filter((a) => a.status === 'TNTC').length
    const tftc = filteredAnalyses.filter((a) => a.status === 'TFTC').length
    const validCfuItems = filteredAnalyses.filter((a) => a.cfu_per_ml != null)
    const avgCfu = validCfuItems.length > 0
      ? validCfuItems.reduce((s, a) => s + (a.cfu_per_ml || 0), 0) / validCfuItems.length
      : 0
    return {
      total,
      avgCfu: Math.round(avgCfu * 10) / 10,
      passRate: Math.round((valid / total) * 1000) / 10,
      tntc,
      tftc,
    }
  }, [filteredAnalyses])

  // ----------------------------------------------------------
  // Export CSV
  // ----------------------------------------------------------
  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const response = await reportsApi.generateCsv({
        report_type: 'custom',
        date_from:
          dateRange === 'custom'
            ? customDateFrom
            : getDateRange(dateRange)?.date_from,
        date_to:
          dateRange === 'custom'
            ? customDateTo
            : getDateRange(dateRange)?.date_to,
        format: 'csv',
      })
      // Open the CSV URL in a new tab for download
      window.open(response.url, '_blank')
      toast.success('CSV export generated successfully')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to export CSV')
    } finally {
      setIsExporting(false)
    }
  }

  // ----------------------------------------------------------
  // Determine status color for a point
  // ----------------------------------------------------------
  const getStatusDotColor = (status: string) => {
    if (status === 'TNTC') return '#ef4444'
    if (status === 'TFTC') return '#eab308'
    return '#22c55e'
  }

  // ============================================================
  // Render
  // ============================================================

  if (isLoading && allAnalyses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error && allAnalyses.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">{error}</p>
        <button className="btn-primary" onClick={fetchData}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ---- Filter Controls ---- */}
      <div className="card border-primary/20 bg-primary/[0.02]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-xl text-primary shadow-lg shadow-primary/10">
               <Filter className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-foreground tracking-tight uppercase">Operational Filters</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-primary py-2 px-6 text-xs flex items-center shadow-primary/20" onClick={fetchData}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Analyze
            </button>
            <button
              className="btn-secondary py-2 px-6 text-xs flex items-center shadow-sm"
              onClick={handleExportCSV}
              disabled={isExporting || filteredAnalyses.length === 0}
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Export Ledger
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <Calendar className="h-3 w-3" /> Duration Period
            </label>
            <select
              className="input bg-background/50 border-border/50 font-bold text-sm"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Media Type */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <FlaskConical className="h-3 w-3" /> Biological Protocol
            </label>
            <select
              className="input bg-background/50 border-border/50 font-bold text-sm"
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as MediaType | 'all')}
            >
              {MEDIA_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Analyst */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <Users className="h-3 w-3" /> Assigned Personnel
            </label>
            <select
              className="input bg-background/50 border-border/50 font-bold text-sm"
              value={analystFilter}
              onChange={(e) => setAnalystFilter(e.target.value)}
            >
              <option value="all">Global (All Personnel)</option>
              {uniqueAnalysts.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Custom date range inputs */}
          {dateRange === 'custom' && (
            <div className="col-span-1 lg:col-span-1 flex gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Start</label>
                <input type="date" className="input bg-background/50" value={customDateFrom} onChange={(e) => setCustomDateFrom(e.target.value)} />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">End</label>
                <input type="date" className="input bg-background/50" value={customDateTo} onChange={(e) => setCustomDateTo(e.target.value)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Summary Statistics cards ---- */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {[
          { label: 'System Throughput', val: summaryStats.total, icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Mean Intensity', val: formatCFU(summaryStats.avgCfu), icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Verification Rate', val: `${summaryStats.passRate}%`, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Critical Errors (TNTC)', val: summaryStats.tntc, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Minor Warning (TFTC)', val: summaryStats.tftc, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex flex-col">
              <div className={`w-fit p-2.5 rounded-xl ${stat.bg} ${stat.color} mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-2xl font-black tracking-tight ${stat.color}`}>{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ---- Time Series Chart ---- */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight uppercase flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Microbiological Density Flux
            </h2>
            <p className="text-xs text-muted-foreground font-semibold mt-1 uppercase tracking-widest">Temporal distribution of CFU concentrations</p>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-2 text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_currentcolor]" /> Pass
            </span>
            <span className="flex items-center gap-2 text-rose-500">
              <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_currentcolor]" /> Critical
            </span>
            <span className="flex items-center gap-2 text-amber-500">
              <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_currentcolor]" /> Alert
            </span>
          </div>
        </div>

        {timeSeriesData.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/50">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Synchronizing Data Streams...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={timeSeriesData}>
              <defs>
                 <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                 </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="6 6" stroke="hsl(var(--border))" vertical={false} opacity={0.6} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 900 }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 900 }}
                tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="avgCfu"
                stroke="hsl(var(--primary))"
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 8, stroke: 'hsl(var(--card))', strokeWidth: 4, fill: 'hsl(var(--primary))' }}
                animationDuration={2000}
              />
              <Scatter
                dataKey="avgCfu"
                data={timeSeriesData}
                shape={(props: any) => {
                  const { cx, cy, payload } = props
                  const color = getStatusDotColor(payload.status)
                  return (
                    <circle 
                      cx={cx} cy={cy} r={6} 
                      fill={color} stroke="hsl(var(--card))" strokeWidth={2}
                      className="transition-all duration-300 shadow-xl"
                    />
                  )
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ---- Monthly Summary Table ---- */}
      <div className="card p-0 overflow-hidden">
        <div className="px-8 py-6 border-b border-border/30 bg-muted/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight uppercase flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Aggregated Monthly Ledger
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase mt-1 tracking-widest">ISO 17025 Standardized Reporting</p>
          </div>
          {monthlySummaries.length > 0 && (
            <div className="flex items-center space-x-2 bg-background/50 px-3 py-1.5 rounded-xl border border-border/50 shadow-inner">
               <span className="text-[10px] font-black text-primary tracking-tighter uppercase">{monthlySummaries.length} Records Detected</span>
            </div>
          )}
        </div>

        {monthlySummaries.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground/30 font-black uppercase tracking-tighter">
            No Historical Entities Found
          </div>
        ) : (
          <div className="overflow-x-auto text-[10px] font-bold">
            <table className="min-w-full divide-y divide-border/20">
              <thead>
                <tr className="bg-muted/5">
                  {['MONTH CYCLE', 'TOTAL THROUGHPUT', 'MEAN DENSITY', 'SYSTEM COMPLIANCE', 'ASSIGNED ANALYSTS'].map(h => (
                    <th key={h} className="px-8 py-5 text-left font-black text-muted-foreground uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {monthlySummaries.map((row) => (
                  <tr key={row.month} className="group hover:bg-primary/[0.02] transition-colors cursor-pointer">
                    <td className="px-8 py-5 whitespace-nowrap">
                       <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{row.month}</span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <span className="text-xs font-black text-muted-foreground">{row.tests} analyses</span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <span className="text-xs font-black font-mono text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/20">{formatCFU(row.avgCfu)} <span className="text-[8px] opacity-70 italic">CFU/ml</span></span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <div className="flex items-center space-x-2">
                          <div className="flex-1 h-1.5 w-16 bg-muted/40 rounded-full overflow-hidden">
                             <div className={`h-full rounded-full ${row.passRate >= 80 ? 'bg-emerald-500' : row.passRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${row.passRate}%` }} />
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${
                            row.passRate >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 
                            row.passRate >= 60 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {row.passRate}%
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <p className="text-[10px] font-bold text-muted-foreground italic truncate max-w-xs">{row.analysts}</p>
                    </td>
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

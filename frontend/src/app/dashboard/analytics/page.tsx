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
    const avgCfu =
      items.reduce((sum, a) => sum + a.cfu_per_ml, 0) / items.length
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
    const avgCfu =
      items.reduce((sum, a) => sum + a.cfu_per_ml, 0) / items.length
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
    <div className="card bg-white shadow-lg border border-gray-200 p-3 text-sm">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-6">
          <span className="text-gray-500">Tests:</span>
          <span className="font-medium">{point.testCount}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-gray-500">Avg CFU/ml:</span>
          <span className="font-medium">{formatCFU(point.avgCfu)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-gray-500">Pass Rate:</span>
          <span className="font-medium">{point.passRate}%</span>
        </div>
        {point.tntcCount > 0 && (
          <div className="flex justify-between gap-6">
            <span className="text-error-600">TNTC:</span>
            <span className="font-medium text-error-600">{point.tntcCount}</span>
          </div>
        )}
        {point.tftcCount > 0 && (
          <div className="flex justify-between gap-6">
            <span className="text-warning-600">TFTC:</span>
            <span className="font-medium text-warning-600">{point.tftcCount}</span>
          </div>
        )}
        <div className="flex justify-between gap-6">
          <span className="text-gray-500">Analysts:</span>
          <span className="font-medium">{point.analysts.join(', ')}</span>
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
    const avgCfu =
      filteredAnalyses.reduce((s, a) => s + a.cfu_per_ml, 0) / total
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
    <div className="space-y-6">
      {/* ---- Filter Controls ---- */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Range */}
          <div>
            <label className="label flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Date Range
            </label>
            <select
              className="input"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom date range inputs */}
          {dateRange === 'custom' && (
            <>
              <div>
                <label className="label">From</label>
                <input
                  type="date"
                  className="input"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="label">To</label>
                <input
                  type="date"
                  className="input"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Media Type */}
          <div>
            <label className="label flex items-center gap-1">
              <FlaskConical className="h-3.5 w-3.5" /> Media Type
            </label>
            <select
              className="input"
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as MediaType | 'all')}
            >
              {MEDIA_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Analyst */}
          <div>
            <label className="label flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Analyst
            </label>
            <select
              className="input"
              value={analystFilter}
              onChange={(e) => setAnalystFilter(e.target.value)}
            >
              <option value="all">All Analysts</option>
              {uniqueAnalysts.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <button className="btn-primary flex items-center flex-1" onClick={fetchData}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Apply
            </button>
            <button
              className="btn-secondary flex items-center"
              onClick={handleExportCSV}
              disabled={isExporting || filteredAnalyses.length === 0}
              title="Export CSV"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ---- Summary Statistics Cards ---- */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="rounded-md p-2.5 bg-primary-50">
              <BarChart3 className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="rounded-md p-2.5 bg-primary-50">
              <TrendingUp className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average CFU/ml</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCFU(summaryStats.avgCfu)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="rounded-md p-2.5 bg-success-50">
              <CheckCircle2 className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pass Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {summaryStats.passRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="rounded-md p-2.5 bg-error-50">
              <XCircle className="h-5 w-5 text-error-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">TNTC Count</p>
              <p className="text-2xl font-bold text-error-600">{summaryStats.tntc}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="rounded-md p-2.5 bg-warning-50">
              <AlertTriangle className="h-5 w-5 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">TFTC Count</p>
              <p className="text-2xl font-bold text-warning-600">{summaryStats.tftc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Time Series Chart ---- */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            CFU/ml Trend Over Time
          </h2>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500" /> Normal
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500" /> TNTC
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-500" /> TFTC
            </span>
          </div>
        </div>

        {timeSeriesData.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No data available for the selected filters</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                interval="preserveStartEnd"
                tickFormatter={(v: string) => v}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(v: number) =>
                  v >= 10000 ? `${(v / 1000).toFixed(0)}k` : v.toString()
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgCfu"
                name="Avg CFU/ml"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                activeDot={{ r: 5 }}
              />
              {/* Status indicator scatter points */}
              <Scatter
                name="TNTC"
                dataKey="avgCfu"
                fill="#ef4444"
                data={timeSeriesData.filter((d) => d.status === 'TNTC')}
                shape={(props: any) => {
                  const { cx, cy } = props
                  return <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                }}
              />
              <Scatter
                name="TFTC"
                dataKey="avgCfu"
                fill="#eab308"
                data={timeSeriesData.filter((d) => d.status === 'TFTC')}
                shape={(props: any) => {
                  const { cx, cy } = props
                  return <circle cx={cx} cy={cy} r={6} fill="#eab308" stroke="#fff" strokeWidth={2} />
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ---- Monthly Summary Table ---- */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            Monthly Summary
          </h2>
          {monthlySummaries.length > 0 && (
            <span className="text-sm text-gray-500">
              {monthlySummaries.length} month{monthlySummaries.length !== 1 ? 's' : ''} of data
            </span>
          )}
        </div>

        {monthlySummaries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p>No monthly data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tests
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg CFU/ml
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pass %
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Analyst
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlySummaries.map((row) => (
                  <tr key={row.month} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {row.month}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{row.tests}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-mono font-semibold text-gray-900">
                        {formatCFU(row.avgCfu)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.passRate >= 80
                            ? 'bg-success-50 text-success-700'
                            : row.passRate >= 60
                            ? 'bg-warning-50 text-warning-700'
                            : 'bg-error-50 text-error-700'
                        }`}
                      >
                        {row.passRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{row.analysts}</span>
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

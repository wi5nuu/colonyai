'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Calendar, CheckCircle, Loader2, TrendingUp, Filter } from 'lucide-react'
import { analysesApi } from '@/lib/analyses-api'
import { reportsApi } from '@/lib/reports-api'
import { Analysis, ReportType } from '@/lib/types'
import { toast } from 'sonner'

interface GeneratedReport {
  id: string
  filename: string
  format: 'pdf' | 'csv'
  generatedAt: string
  url: string
}

export default function ReportsPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [mediaType, setMediaType] = useState('all')
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const loadAnalyses = async () => {
      try {
        const result = await analysesApi.list({ page_size: 100 })
        setAnalyses(result.analyses)
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Failed to load analyses')
      } finally {
        setIsLoadingAnalyses(false)
      }
    }
    loadAnalyses()
  }, [])

  const filteredAnalyses = analyses.filter((a) => {
    if (mediaType !== 'all' && a.media_type !== mediaType) return false
    if (dateFrom && new Date(a.created_at) < new Date(dateFrom)) return false
    if (dateTo && new Date(a.created_at) > new Date(dateTo + 'T23:59:59')) return false
    return true
  })

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === filteredAnalyses.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filteredAnalyses.map((a) => a.id)))
  }

  const handleGeneratePdf = async () => {
    if (selectedIds.size === 0) { toast.error('Please select at least one analysis'); return }
    setIsGenerating(true)
    try {
      const report = await reportsApi.generatePdf({ report_type: 'custom' as ReportType, date_from: dateFrom || undefined, date_to: dateTo || undefined, format: 'pdf' })
      await reportsApi.downloadReport(report.url.split('/').pop() || 'latest')
      setRecentReports((prev) => [{ id: report.url.split('/').pop() || `pdf-${Date.now()}`, filename: report.filename, format: 'pdf', generatedAt: new Date().toISOString(), url: report.url }, ...prev])
      toast.success('PDF report generated and downloaded')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate PDF report')
    } finally { setIsGenerating(false) }
  }

  const handleGenerateCsv = async () => {
    if (selectedIds.size === 0) { toast.error('Please select at least one analysis'); return }
    setIsGenerating(true)
    try {
      const report = await reportsApi.generateCsv({ report_type: 'custom' as ReportType, date_from: dateFrom || undefined, date_to: dateTo || undefined, format: 'csv' })
      await reportsApi.downloadReport(report.url.split('/').pop() || 'latest')
      setRecentReports((prev) => [{ id: report.url.split('/').pop() || `csv-${Date.now()}`, filename: report.filename, format: 'csv', generatedAt: new Date().toISOString(), url: report.url }, ...prev])
      toast.success('CSV report generated and downloaded')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate CSV report')
    } finally { setIsGenerating(false) }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reports</h1>
        <p className="text-slate-500 mt-1.5">Generate and export ISO 17025-compliant laboratory reports</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{analyses.length}</p>
            <p className="text-sm font-medium text-slate-500">Total Records</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors duration-150 ${selectedIds.size > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
            <CheckCircle className={`h-6 w-6 ${selectedIds.size > 0 ? 'text-emerald-600' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{selectedIds.size}</p>
            <p className="text-sm font-medium text-slate-500">Selected for Export</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{recentReports.length}</p>
            <p className="text-sm font-medium text-slate-500">Session Exports</p>
          </div>
        </div>
      </div>

      {/* Export Parameters */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
            <Filter className="h-4 w-4 text-slate-600" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Export Parameters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Date From</label>
            <input type="date" className="w-full px-4 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Date To</label>
            <input type="date" className="w-full px-4 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Media Filter</label>
            <select className="w-full px-4 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none" value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
              <option value="all">All Media</option>
              <option value="Plate Count Agar">PCA — Plate Count Agar</option>
              <option value="VRBA">VRBA — Violet Red Bile Agar</option>
              <option value="BGBB">BGBB — Brilliant Green Bile Broth</option>
              <option value="R2A">R2A — Reasoner's 2A Agar</option>
              <option value="TSA">TSA — Tryptic Soy Agar</option>
              <option value="MacConkey">MAC — MacConkey Agar</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
          <button onClick={handleGeneratePdf} disabled={isGenerating || selectedIds.size === 0} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors duration-150 shadow-sm">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Generate ISO 17025 PDF
          </button>
          <button onClick={handleGenerateCsv} disabled={isGenerating || selectedIds.size === 0} className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition-colors duration-150 shadow-sm">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export Raw CSV
          </button>
          {selectedIds.size === 0 && <p className="text-xs text-amber-600 font-medium self-center">← Select records below first</p>}
        </div>
      </div>

      {/* Analysis Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Select Analyses to Export</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{selectedIds.size} of {filteredAnalyses.length} selected</p>
          </div>
          <button onClick={selectAll} className="text-xs font-bold text-orange-600 hover:text-orange-700 px-3 py-1.5 border border-orange-200 hover:bg-orange-50 rounded-lg transition-colors duration-150">
            {selectedIds.size === filteredAnalyses.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {isLoadingAnalyses ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-orange-400" /></div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">No analyses match the current filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
            {filteredAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                onClick={() => toggleSelection(analysis.id)}
                className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors duration-150 ${selectedIds.has(analysis.id) ? 'bg-orange-50 border-l-4 border-l-orange-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors duration-150 ${selectedIds.has(analysis.id) ? 'bg-orange-600 border-orange-600' : 'border-slate-300'}`}>
                    {selectedIds.has(analysis.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{analysis.sample_id}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{analysis.media_type}</span>
                      <span className={`text-[11px] font-bold uppercase ${
                        analysis.status === 'completed' && analysis.is_valid_for_reporting ? 'text-emerald-600' : 
                        analysis.warnings?.some(w => w.includes('TNTC')) ? 'text-rose-500' : 'text-amber-500'
                      }`}>
                        {analysis.status === 'completed' 
                          ? (analysis.is_valid_for_reporting ? 'Verified' : (analysis.warnings?.some(w => w.includes('TNTC')) ? 'TNTC' : 'Review')) 
                          : analysis.status}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{analysis.cfu_per_ml !== null ? `${analysis.cfu_per_ml} CFU/mL` : '—'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-xs font-semibold text-slate-600">{new Date(analysis.created_at).toLocaleDateString()}</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{analysis.id.slice(0, 8)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Session Exports */}
      {recentReports.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-900">Session Export Queue</h2>
          </div>
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors duration-150">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${report.format === 'pdf' ? 'bg-rose-50 border border-rose-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                    <FileText className={`h-5 w-5 ${report.format === 'pdf' ? 'text-rose-600' : 'text-emerald-600'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{report.filename}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[11px] font-bold uppercase px-1.5 py-0.5 rounded border ${report.format === 'pdf' ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200'}`}>{report.format}</span>
                      <span className="text-[11px] text-slate-400">{new Date(report.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <a href={report.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg transition-colors duration-150 ml-3 flex-shrink-0">
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

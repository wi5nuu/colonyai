'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Calendar, CheckCircle, Loader2, TrendingUp, Filter, ChevronDown, Info } from 'lucide-react'
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

import { ALL_DEMO_ANALYSES } from '@/lib/demo-data'

const USE_DEMO_DATA = true // Set to false to use real data from API

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
      setIsLoadingAnalyses(true)
      try {
        if (USE_DEMO_DATA) {
          // Use demo dataset
          setAnalyses(ALL_DEMO_ANALYSES)
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 600))
        } else {
          const result = await analysesApi.list({ page_size: 100 })
          setAnalyses(result.analyses)
        }
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-9 h-9 bg-slate-900 rounded-lg shadow-xl flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
           </div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Intelligence Exports</h1>
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Generate ISO 17025 compliant diagnostic protocols</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="dashboard-card p-4 flex items-center gap-4 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{analyses.length}</p>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Stored Records</p>
          </div>
        </div>
        <div className="dashboard-card p-4 flex items-center gap-4 rounded-xl">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border transition-all duration-300 ${selectedIds.size > 0 ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
            <CheckCircle className={`h-5 w-5 ${selectedIds.size > 0 ? 'text-white' : 'text-slate-300'}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{selectedIds.size}</p>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Selected Buffer</p>
          </div>
        </div>
        <div className="dashboard-card p-4 flex items-center gap-4 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-200">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{recentReports.length}</p>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Session Exports</p>
          </div>
        </div>
      </div>

      {/* Export Parameters */}
      <div className="dashboard-card p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
            <Filter className="h-4 w-4 text-slate-500" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Export Parameters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Range Start</label>
            <input type="date" className="w-full px-4 py-2.5 text-xs font-bold text-slate-900 bg-slate-50/50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Range End</label>
            <input type="date" className="w-full px-4 py-2.5 text-xs font-bold text-slate-900 bg-slate-50/50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Protocol Matrix</label>
            <div className="relative">
              <select className="w-full px-4 py-2.5 text-xs font-bold text-slate-900 bg-slate-50/50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer" value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                <option value="all">All Protocols</option>
                <option value="Plate Count Agar">PCA Protocol</option>
                <option value="VRBA">VRBA Protocol</option>
                <option value="BGBB">BGBB Protocol</option>
                <option value="R2A">R2A Protocol</option>
                <option value="TSA">TSA Protocol</option>
                <option value="MacConkey">MAC Protocol</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-slate-50">
          <button onClick={handleGeneratePdf} disabled={isGenerating || selectedIds.size === 0} className="btn-primary py-2.5 px-6 flex items-center gap-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Generate ISO PDF
          </button>
          <button onClick={handleGenerateCsv} disabled={isGenerating || selectedIds.size === 0} className="px-6 py-2.5 bg-white border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV Matrix
          </button>
          {selectedIds.size === 0 && (
            <div className="flex items-center gap-2 text-amber-500 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 animate-pulse">
               <Info className="w-3.5 h-3.5" />
               <p className="text-[8px] font-black uppercase tracking-widest">Select specimens to enable</p>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Selection */}
      <div className="dashboard-card overflow-hidden !p-0 rounded-xl">
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Specimen Selection Pool</h2>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{selectedIds.size} of {filteredAnalyses.length} selected for export</p>
          </div>
          <button onClick={selectAll} className="px-4 py-2 bg-white border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            {selectedIds.size === filteredAnalyses.length ? 'Clear Selection' : 'Select All Pool'}
          </button>
        </div>

        {isLoadingAnalyses ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-6">
               <FileText className="h-10 w-10 text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-600">No specimens match protocol filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto custom-scrollbar">
            {filteredAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                onClick={() => toggleSelection(analysis.id)}
                className={`flex items-center justify-between px-8 py-5 cursor-pointer transition-all duration-200 group ${selectedIds.has(analysis.id) ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
              >
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all duration-300 ${selectedIds.has(analysis.id) ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'border-slate-200 group-hover:border-primary/50'}`}>
                    {selectedIds.has(analysis.id) && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{analysis.sample_id}</p>
                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md">{analysis.media_type}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        analysis.status === 'completed' && analysis.is_valid_for_reporting ? 'text-emerald-500' : 
                        analysis.warnings?.some(w => w.includes('TNTC')) ? 'text-rose-500' : 'text-amber-500'
                      }`}>
                        {analysis.status === 'completed' 
                          ? (analysis.is_valid_for_reporting ? 'Verified' : (analysis.warnings?.some(w => w.includes('TNTC')) ? 'Critical' : 'Pending Review')) 
                          : analysis.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-6">
                  <p className="text-xs font-bold text-slate-600">{new Date(analysis.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">Node: {analysis.id.slice(0, 8)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Session Exports */}
      {recentReports.length > 0 && (
        <div className="dashboard-card overflow-hidden !p-0">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-900">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Live Session Export Queue</h2>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${report.format === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{report.filename}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${report.format === 'pdf' ? 'text-rose-500 border-rose-100' : 'text-emerald-500 border-emerald-100'}`}>{report.format} Matrix</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(report.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <a href={report.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-700 bg-white border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 rounded-lg transition-all ml-4 shadow-sm">
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


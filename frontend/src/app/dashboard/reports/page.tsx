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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 bg-slate-900 rounded-xl shadow-xl flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Laboratory Reports</h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Generate ISO 17025 compliant diagnostic protocols</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 Ready for Export
              </span>
           </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {[
          { label: 'Available Records', val: analyses.length, icon: FileText, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Selected Samples', val: selectedIds.size, icon: CheckCircle, active: selectedIds.size > 0, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Total Exports', val: recentReports.length, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
        ].map((card, i) => (
          <div key={i} className="bg-white border border-slate-200/60 p-5 lg:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${card.active ? 'bg-emerald-500 text-white' : `${card.bg} ${card.color}`}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{card.val}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Export Parameters */}
      <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
            <Filter className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Report Parameters</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Define analytical range and protocol filters</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Start Date</label>
            <input type="date" className="w-full px-4 py-3 text-[12px] font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">End Date</label>
            <input type="date" className="w-full px-4 py-3 text-[12px] font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Media Protocol</label>
            <select className="w-full px-4 py-3 text-[12px] font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none" value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
              <option value="all">All Media Types</option>
              <option value="Plate Count Agar">PCA Protocol</option>
              <option value="VRBA">VRBA Protocol</option>
              <option value="BGBB">BGBB Protocol</option>
              <option value="R2A">R2A Protocol</option>
              <option value="TSA">TSA Protocol</option>
              <option value="MacConkey">MAC Protocol</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-100">
          <button 
            onClick={handleGeneratePdf} 
            disabled={isGenerating || selectedIds.size === 0} 
            className="w-full sm:flex-1 flex items-center justify-center gap-3 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-900/20"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4 text-primary" />}
            Generate PDF Report
          </button>
          <button 
            onClick={handleGenerateCsv} 
            disabled={isGenerating || selectedIds.size === 0} 
            className="w-full sm:flex-1 flex items-center justify-center gap-3 py-4 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 text-slate-400" />}
            Export CSV Dataset
          </button>
        </div>
      </div>

      {/* Analysis Selection */}
      <div className="bg-white border border-slate-200/60 overflow-hidden rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Selected for Export: {selectedIds.size} / {filteredAnalyses.length}</h2>
          <button onClick={selectAll} className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            {selectedIds.size === filteredAnalyses.length ? 'Clear Selection' : 'Select All'}
          </button>
        </div>

        {isLoadingAnalyses ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400 gap-3">
             <Info className="w-8 h-8 opacity-20" />
             <p className="text-[12px] font-medium">No analyses match your current filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto scrollbar-hide">
            {filteredAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                onClick={() => toggleSelection(analysis.id)}
                className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-all hover:bg-slate-50 ${selectedIds.has(analysis.id) ? 'bg-primary/5' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${selectedIds.has(analysis.id) ? 'bg-primary border-primary' : 'border-slate-300 bg-white'}`}>
                     {selectedIds.has(analysis.id) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-slate-900 tracking-tight">{analysis.sample_id}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{analysis.media_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                   <div>
                      <p className="text-[12px] font-black text-slate-900 font-mono">{analysis.colony_count}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">CFU Total</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Session Exports */}
      {recentReports.length > 0 && (
        <div className="bg-white border border-slate-200/60 overflow-hidden rounded-2xl shadow-lg">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-900 flex items-center justify-between">
            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Export Pipeline Queue</h2>
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-[9px] font-black rounded-full uppercase tracking-widest border border-primary/20">Session Active</span>
          </div>
          <div className="p-3 space-y-2 bg-slate-50/50">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${report.format === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[13px] font-black text-slate-900">{report.filename}</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                       {new Date(report.generatedAt).toLocaleTimeString()} // {report.format.toUpperCase()} Protocol
                    </p>
                  </div>
                </div>
                <a href={report.url} target="_blank" className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95">
                  <Download className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


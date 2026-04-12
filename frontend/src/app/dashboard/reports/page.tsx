'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Calendar, TrendingUp, Loader2, CheckCircle } from 'lucide-react'
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

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === filteredAnalyses.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredAnalyses.map((a) => a.id)))
    }
  }

  const filteredAnalyses = analyses.filter((a) => {
    if (mediaType !== 'all' && a.media_type !== mediaType) return false
    if (dateFrom && new Date(a.created_at) < new Date(dateFrom)) return false
    if (dateTo && new Date(a.created_at) > new Date(dateTo + 'T23:59:59')) return false
    return true
  })

  const handleGeneratePdf = async () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one analysis')
      return
    }
    setIsGenerating(true)
    try {
      const report = await reportsApi.generatePdf({
        report_type: 'custom' as ReportType,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        format: 'pdf',
      })
      await reportsApi.downloadReport(report.url.split('/').pop() || 'latest')
      setRecentReports((prev) => [
        {
          id: report.url.split('/').pop() || `pdf-${Date.now()}`,
          filename: report.filename,
          format: 'pdf',
          generatedAt: new Date().toISOString(),
          url: report.url,
        },
        ...prev,
      ])
      toast.success('PDF report generated and downloaded')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate PDF report')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateCsv = async () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one analysis')
      return
    }
    setIsGenerating(true)
    try {
      const report = await reportsApi.generateCsv({
        report_type: 'custom' as ReportType,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        format: 'csv',
      })
      await reportsApi.downloadReport(report.url.split('/').pop() || 'latest')
      setRecentReports((prev) => [
        {
          id: report.url.split('/').pop() || `csv-${Date.now()}`,
          filename: report.filename,
          format: 'csv',
          generatedAt: new Date().toISOString(),
          url: report.url,
        },
        ...prev,
      ])
      toast.success('CSV report generated and downloaded')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate CSV report')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Strategic Export Summary Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card group">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-2xl p-4 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-lg shadow-primary/5">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-5">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Archived Entries</p>
              <p className="text-3xl font-black text-foreground tracking-tighter">{analyses.length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-2xl p-4 transition-all duration-500 shadow-lg ${selectedIds.size > 0 ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-muted/40 text-muted-foreground'}`}>
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-5">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Staging for Export</p>
              <p className="text-3xl font-black text-foreground tracking-tighter">{selectedIds.size}</p>
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-2xl p-4 bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-lg shadow-amber-500/5">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-5">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Session Output Count</p>
              <p className="text-3xl font-black text-foreground tracking-tighter">{recentReports.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Spectral Configuration Terminal */}
      <div className="card p-0 overflow-hidden border-border/40">
        <div className="px-8 py-5 border-b border-border/20 bg-muted/10 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                 <Calendar className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Protocol Export Parameters</h2>
           </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Temporal Origin (From)</label>
              <input
                type="date"
                className="input h-12 bg-muted/20 border-border/40 hover:border-primary/30 transition-all font-mono text-sm"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Temporal Horizon (To)</label>
              <input
                type="date"
                className="input h-12 bg-muted/20 border-border/40 hover:border-primary/30 transition-all font-mono text-sm"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Media-Specific Filter</label>
              <select
                className="input h-12 bg-muted/20 border-border/40 hover:border-primary/30 transition-all text-xs font-black uppercase tracking-widest"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
              >
                <option value="all">Global Archive</option>
                <option value="Plate Count Agar">PCA - Standard</option>
                <option value="VRBA">VRBA - Coliform</option>
                <option value="BGBB">BGBB - Selective</option>
                <option value="R2A">R2A - Low Nutrient</option>
                <option value="TSA">TSA - General</option>
                <option value="MacConkey">MacConkey - Enteric</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleGeneratePdf}
              disabled={isGenerating || selectedIds.size === 0}
              className="btn-primary h-12 px-8 flex items-center shadow-lg shadow-primary/20 active:scale-95 disabled:scale-100"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Spectral Data...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate ISO-17025 PDF
                </>
              )}
            </button>
            <button
              onClick={handleGenerateCsv}
              disabled={isGenerating || selectedIds.size === 0}
              className="btn-secondary h-12 px-8 flex items-center shadow-sm border-border/40 hover:border-primary/30 active:scale-95 disabled:scale-100"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Parsing Data...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Compile Raw CSV
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Selection Matrix */}
      <div className="card p-0 overflow-hidden border-border/40">
        <div className="px-8 py-5 border-b border-border/20 bg-muted/10 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Spectral Selection Matrix</h2>
              <span className="text-[10px] font-black text-primary px-2 py-1 bg-primary/10 rounded-lg border border-primary/20">{selectedIds.size} STAGED</span>
           </div>
           <button onClick={selectAll} className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:text-primary-foreground hover:bg-primary px-4 py-2 rounded-xl transition-all border border-primary/30">
            {selectedIds.size === filteredAnalyses.length ? 'Clear Selection' : 'Select All Active'}
           </button>
        </div>

        <div className="p-0">
          {isLoadingAnalyses ? (
            <div className="flex justify-center py-20 bg-muted/5">
              <div className="text-center">
                 <Loader2 className="h-10 w-10 animate-spin text-primary/40 mx-auto" />
                 <p className="mt-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Querying Global Archive...</p>
              </div>
            </div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="text-center py-20 bg-muted/5">
               <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border/20">
                  <FileText className="h-8 w-8 text-muted-foreground/40" />
               </div>
               <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No Archival Matches Found</p>
               <p className="text-[10px] font-medium text-muted-foreground/60 mt-2">Try adjusting the spectral filters above</p>
            </div>
          ) : (
            <div className="divide-y divide-border/10 max-h-[500px] overflow-y-auto custom-scrollbar">
              {filteredAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  onClick={() => toggleSelection(analysis.id)}
                  className={`flex items-center justify-between px-8 py-5 cursor-pointer transition-all group ${
                    selectedIds.has(analysis.id)
                      ? 'bg-primary/10 border-l-4 border-l-primary'
                      : 'hover:bg-primary/[0.02] border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-6 flex-1">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${selectedIds.has(analysis.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-border group-hover:border-primary/40 text-transparent'}`}>
                       <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground uppercase tracking-widest leading-none mb-1.5">{analysis.sample_id}</p>
                      <div className="flex gap-4 items-center">
                         <span className="text-[10px] font-black text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/30">{analysis.media_type}</span>
                         <span className={`text-[10px] font-black uppercase tracking-tighter ${analysis.status === 'valid' ? 'text-emerald-500' : 'text-rose-500'}`}>{analysis.status}</span>
                         <span className="text-[10px] font-bold text-muted-foreground font-mono">{analysis.cfu_per_ml} CFU/mL</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 leading-none">{new Date(analysis.created_at).toLocaleDateString()}</p>
                    <p className="text-[9px] font-bold text-muted-foreground/40 font-mono tracking-tighter uppercase leading-none">{analysis.id.substring(0, 13)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Session Archive Gallery */}
      <div className="card p-0 overflow-hidden border-border/40">
        <div className="px-8 py-5 border-b border-border/20 bg-muted/10">
           <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Active Session Export Queue</h2>
        </div>
        <div className="p-8">
          {recentReports.length === 0 ? (
            <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border/40">
              <Download className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none">Export Queue Empty</p>
              <p className="text-[10px] font-medium text-muted-foreground/60 mt-2">Initialize export via configuration panel above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-5 bg-muted/20 border border-border/40 rounded-2xl hover:border-primary/30 hover:bg-primary/[0.02] transition-all group"
                >
                  <div className="flex items-center flex-1 pr-6 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <FileText className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4 truncate">
                      <h3 className="text-xs font-black text-foreground uppercase tracking-widest truncate">{report.filename}</h3>
                      <div className="mt-1.5 flex items-center text-[10px] font-bold text-muted-foreground uppercase tracking-tighter space-x-3">
                        <span className="font-mono">{new Date(report.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-border">|</span>
                        <span className={`px-2 py-0.5 rounded border ${report.format === 'pdf' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>{report.format}</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center text-[10px] font-black h-10 px-4 whitespace-nowrap"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    FETCH FILE
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

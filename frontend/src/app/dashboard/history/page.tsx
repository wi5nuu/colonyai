'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Download, Eye, Trash2, Loader2 } from 'lucide-react'
import { analysesApi } from '@/lib/analyses-api'
import { reportsApi } from '@/lib/reports-api'
import { AnalysisListResponse, MediaType, ReportType } from '@/lib/types'
import { toast } from 'sonner'

export default function HistoryPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [mediaFilter, setMediaFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [data, setData] = useState<AnalysisListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true)
      try {
        const result = await analysesApi.list({
          page,
          page_size: pageSize,
          search: searchTerm || undefined,
          media_type: mediaFilter !== 'all' ? mediaFilter as MediaType : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        })
        setData(result)
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Failed to load history')
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(loadHistory, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm, mediaFilter, statusFilter, page])

  const handleViewAnalysis = (id: string) => {
    router.push(`/dashboard/results/${id}`)
  }

  const handleExportCsv = async () => {
    if (!data?.analyses || data.analyses.length === 0) {
      toast.error('No analyses to export')
      return
    }
    try {
      const report = await reportsApi.generateCsv({
        report_type: 'custom' as ReportType,
        format: 'csv',
      })
      await reportsApi.downloadReport(report.url.split('/').pop() || 'latest')
      toast.success('CSV exported successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to export CSV')
    }
  }

  const handleDelete = async (id: string, sampleId: string) => {
    if (!window.confirm(`Delete analysis "${sampleId}"? This action cannot be undone.`)) return
    try {
      await analysesApi.delete(id)
      toast.success('Analysis deleted')
      // Refresh current page
      const result = await analysesApi.list({
        page,
        page_size: pageSize,
        search: searchTerm || undefined,
        media_type: mediaFilter !== 'all' ? mediaFilter as MediaType : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      })
      setData(result)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete analysis')
    }
  }

  const formatCFU = (cfu: number | null, status: string) => {
    if (status === 'TNTC') return 'TNTC'
    if (status === 'TFTC') return 'TFTC'
    if (cfu === null) return '-'
    if (cfu >= 10000) return cfu.toExponential(2)
    return cfu.toLocaleString()
  }

  const getCFUColor = (status: string) => {
    if (status === 'TNTC') return 'text-error-600'
    if (status === 'TFTC') return 'text-warning-600'
    return 'text-gray-900'
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      </div>
    )
  }

  const analyses = data?.analyses || []
  const totalPages = data?.total_pages || 1
  const total = data?.total || 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Filters Overlay */}
      <div className="card border-primary/20 bg-primary/[0.02] p-8">
        <div className="flex flex-col lg:flex-row gap-6 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Registry Search</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Query Sample ID, Batch, or Media Protocol..."
                className="input pl-12 bg-background/50 border-border/50 font-bold text-sm focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="space-y-2 min-w-[180px]">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Media Filter</label>
              <select
                className="input bg-background/50 border-border/50 font-bold text-sm"
                value={mediaFilter}
                onChange={(e) => {
                  setMediaFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="all">Universal (All Media)</option>
                <option value="Plate Count Agar">PCA Protocol</option>
                <option value="VRBA">VRBA Protocol</option>
                <option value="BGBB">BGBB Protocol</option>
                <option value="R2A">R2A Protocol</option>
                <option value="TSA">TSA Protocol</option>
                <option value="MacConkey">MacConkey Protocol</option>
              </select>
            </div>
            <div className="space-y-2 min-w-[150px]">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Classification</label>
              <select
                className="input bg-background/50 border-border/50 font-bold text-sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="all">All Classifications</option>
                <option value="valid">Standard (Valid)</option>
                <option value="TNTC">Critical (TNTC)</option>
                <option value="TFTC">Trace (TFTC)</option>
              </select>
            </div>
            <div className="flex items-end pb-0.5">
               <button className="btn-secondary h-[42px] px-6 flex items-center shadow-sm border-border/50">
                <Filter className="h-4 w-4 mr-2" />
                Advanced
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="card p-0 overflow-hidden border-border/40">
        <div className="px-8 py-6 border-b border-border/30 flex items-center justify-between bg-muted/10">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight uppercase">
              Biological Archives
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase mt-1 tracking-widest">{total} Entities synchronized</p>
          </div>
          <button
            onClick={handleExportCsv}
            className="btn-primary py-2 px-6 text-xs flex items-center shadow-primary/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Master CSV
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          </div>
        )}

        {!isLoading && analyses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No analyses found matching your filters
          </div>
        )}

        {!isLoading && analyses.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/20">
              <thead>
                <tr className="bg-muted/5">
                  {[
                    'IDENTIFIER', 'MEDIA PROTOCOL', 'DILUTION', 'RAW COUNT', 'DENSITY (CFU/ML)', 'AI CONFIDENCE', 'TIMESTAMP', 'STATUS', 'OPERATIONS'
                  ].map((header) => (
                    <th key={header} className="px-8 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {analyses.map((analysis) => (
                  <tr key={analysis.id} className="group hover:bg-primary/[0.02] transition-colors cursor-pointer">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                         <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{analysis.sample_id}</span>
                         <span className="text-[10px] font-mono text-muted-foreground tracking-tighter uppercase">{analysis.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <span className="px-2 py-1 rounded text-[10px] font-black bg-muted/40 text-muted-foreground border border-border/30 uppercase">
                          {analysis.media_type}
                       </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-xs font-black font-mono text-muted-foreground">
                        10<sup className="text-[8px]">-{Math.abs(Math.log10(analysis.dilution_factor))}</sup>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-black text-foreground">{analysis.colony_count}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className={`text-xs font-black font-mono px-2 py-1 rounded-md border inline-block ${
                        analysis.status === 'TNTC' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                        analysis.status === 'TFTC' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                        'bg-primary/5 text-primary border-primary/20'
                      }`}>
                        {formatCFU(analysis.cfu_per_ml, analysis.status)}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <div className="w-16">
                          <div className="flex justify-between items-center text-[8px] font-black mb-1">
                             <span className="text-muted-foreground uppercase">Score</span>
                             <span className="text-primary">{(analysis.confidence_score * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-1 w-full bg-muted/40 rounded-full overflow-hidden">
                             <div className="h-full bg-primary" style={{ width: `${analysis.confidence_score * 100}%` }} />
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-foreground">
                          {new Date(analysis.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                          {new Date(analysis.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <span className={`px-4 py-1.5 inline-flex text-[10px] font-black rounded-xl shadow-inner border transition-all duration-300 ${
                        analysis.status === 'valid'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : analysis.status === 'TNTC'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {analysis.status === 'valid' ? 'ISOLATED' : analysis.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleViewAnalysis(analysis.id)}
                          className="p-2 rounded-lg bg-muted/40 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all duration-300 transform active:scale-90"
                          title="View Spectral Analysis"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-muted/40 hover:bg-amber-500/20 text-muted-foreground hover:text-amber-500 transition-all duration-300 transform active:scale-90" title="Secure Download">
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(analysis.id, analysis.sample_id)}
                          className="p-2 rounded-lg bg-muted/40 hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500 transition-all duration-300 transform active:scale-90"
                          title="Purge Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Overlay */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-6 bg-muted/5 border-t border-border/20">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Displaying <span className="text-foreground">{(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)}</span> of <span className="text-foreground">{total}</span> Historical Entities
            </div>
            <div className="flex space-x-1">
              <button
                className="btn-secondary px-3 py-1.5 text-[10px] font-black uppercase"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                if (pageNum > totalPages || pageNum < 1) return null
                return (
                  <button
                    key={pageNum}
                    className={`px-3 py-1.5 h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-[10px] font-black transition-all ${
                        pageNum === page 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary border border-border/50'
                    }`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                className="btn-secondary px-3 py-1.5 text-[10px] font-black uppercase"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next Cycle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

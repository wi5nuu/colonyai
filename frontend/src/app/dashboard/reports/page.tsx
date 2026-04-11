'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Calendar, TrendingUp, Loader2 } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md p-3 bg-primary-50">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Analyses</p>
              <p className="text-2xl font-semibold text-gray-900">{analyses.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md p-3 bg-success-50">
              <Calendar className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Selected</p>
              <p className="text-2xl font-semibold text-gray-900">{selectedIds.size}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md p-3 bg-warning-50">
              <TrendingUp className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reports Generated</p>
              <p className="text-2xl font-semibold text-gray-900">{recentReports.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Configure Report
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="label">Date From</label>
            <input
              type="date"
              className="input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Date To</label>
            <input
              type="date"
              className="input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Media Type</label>
            <select
              className="input"
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
            >
              <option value="all">All Media</option>
              <option value="Plate Count Agar">PCA</option>
              <option value="VRBA">VRBA</option>
              <option value="BGBB">BGBB</option>
              <option value="R2A">R2A</option>
              <option value="TSA">TSA</option>
              <option value="MacConkey">MacConkey</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGeneratePdf}
            disabled={isGenerating || selectedIds.size === 0}
            className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate PDF Report
              </>
            )}
          </button>
          <button
            onClick={handleGenerateCsv}
            disabled={isGenerating || selectedIds.size === 0}
            className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate CSV Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Selection */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Select Analyses ({selectedIds.size} of {filteredAnalyses.length})
          </h2>
          <button onClick={selectAll} className="text-sm text-primary-600 hover:text-primary-700">
            {selectedIds.size === filteredAnalyses.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {isLoadingAnalyses ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No analyses match your filters</div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredAnalyses.map((analysis) => (
              <label
                key={analysis.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedIds.has(analysis.id)
                    ? 'bg-primary-50 border-primary-300'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(analysis.id)}
                    onChange={() => toggleSelection(analysis.id)}
                    className="h-4 w-4 text-primary-600 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{analysis.sample_id}</p>
                    <p className="text-xs text-gray-500">
                      {analysis.media_type} &bull; {analysis.status} &bull; {analysis.cfu_per_ml} CFU/ml
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(analysis.created_at).toLocaleDateString()}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Recent Reports */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Reports (Session)
        </h2>
        {recentReports.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No reports generated this session
          </p>
        ) : (
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center flex-1">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{report.filename}</h3>
                    <div className="mt-1 flex items-center text-xs text-gray-500 space-x-3">
                      <span>{new Date(report.generatedAt).toLocaleString()}</span>
                      <span>&bull;</span>
                      <span className="uppercase">{report.format}</span>
                    </div>
                  </div>
                </div>
                <a
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 btn-primary flex items-center text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

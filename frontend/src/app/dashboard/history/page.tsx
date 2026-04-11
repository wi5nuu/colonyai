'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Download, Eye, Trash2, Loader2 } from 'lucide-react'
import { analysesApi } from '@/lib/analyses-api'
import { AnalysisListResponse, MediaType } from '@/lib/types'
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

  const formatCFU = (cfu: number, status: string) => {
    if (status === 'TNTC') return 'TNTC'
    if (status === 'TFTC') return 'TFTC'
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
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Sample ID or Media Type..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="input"
              value={mediaFilter}
              onChange={(e) => {
                setMediaFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="all">All Media</option>
              <option value="Plate Count Agar">PCA</option>
              <option value="VRBA">VRBA</option>
              <option value="BGBB">BGBB</option>
              <option value="R2A">R2A</option>
              <option value="TSA">TSA</option>
              <option value="MacConkey">MacConkey</option>
            </select>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="all">All Status</option>
              <option value="valid">Valid</option>
              <option value="TNTC">TNTC</option>
              <option value="TFTC">TFTC</option>
            </select>
            <button className="btn-secondary flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Analysis History ({total} results)
          </h2>
          <button className="btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sample ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Media Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dilution
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colonies
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CFU/ml
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyses.map((analysis) => (
                  <tr key={analysis.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{analysis.sample_id}</div>
                      <div className="text-xs text-gray-500">{analysis.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{analysis.media_type}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {analysis.dilution_factor.toExponential(0)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{analysis.colony_count}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`text-sm font-mono font-semibold ${getCFUColor(analysis.status)}`}>
                        {formatCFU(analysis.cfu_per_ml, analysis.status)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(analysis.confidence_score * 100).toFixed(0)}%
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(analysis.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        analysis.status === 'valid'
                          ? 'bg-success-50 text-success-700'
                          : analysis.status === 'TNTC'
                          ? 'bg-error-50 text-error-700'
                          : 'bg-warning-50 text-warning-700'
                      }`}>
                        {analysis.status === 'valid' ? 'Valid' : analysis.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewAnalysis(analysis.id)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="text-error-600 hover:text-error-900">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * pageSize, total)}</span> of{' '}
              <span className="font-medium">{total}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                className="btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                if (pageNum > totalPages) return null
                return (
                  <button
                    key={pageNum}
                    className={pageNum === page ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                className="btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { analysesApi } from '@/lib/analyses-api'
import { reportsApi } from '@/lib/reports-api'
import { Analysis, DetectionClass, ReportType } from '@/lib/types'
import { toast } from 'sonner'

// Class color mapping for detection boxes
const DETECTION_COLORS: Record<DetectionClass, string> = {
  colony_single: 'border-green-500 bg-green-500/20',
  colony_merged: 'border-yellow-500 bg-yellow-500/20',
  bubble: 'border-red-500 bg-red-500/20',
  dust_debris: 'border-orange-500 bg-orange-500/20',
  media_crack: 'border-purple-500 bg-purple-500/20',
}

const DOT_COLORS: Record<DetectionClass, string> = {
  colony_single: 'bg-green-500',
  colony_merged: 'bg-yellow-500',
  bubble: 'bg-red-500',
  dust_debris: 'bg-orange-500',
  media_crack: 'bg-purple-500',
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const analysisId = params.analysisId as string

  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [selectedDetection, setSelectedDetection] = useState<string | null>(null)
  const [showAnnotations, setShowAnnotations] = useState(true)

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const data = await analysesApi.getById(analysisId)
        setAnalysis(data)
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Failed to load analysis')
        router.push('/dashboard/history')
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalysis()
  }, [analysisId, router])

  const handleApprove = async () => {
    if (!analysis) return

    try {
      await analysesApi.approve(analysis.id)
      toast.success('Analysis approved and saved')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to approve analysis')
    }
  }

  const handleFlagReview = async () => {
    if (!analysis) return

    try {
      await analysesApi.flagForReview(analysis.id, 'Manual review requested')
      toast.success('Analysis flagged for review')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to flag for review')
    }
  }

  const handleExportPdf = async () => {
    if (!analysis) return

    try {
      const report = await reportsApi.generatePdf({
        report_type: 'custom' as ReportType,
        format: 'pdf',
      })
      await reportsApi.downloadReport(report.url.split('/').pop() || 'latest')
      toast.success('PDF exported successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to export PDF')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-4 text-gray-600">Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return (
          <div className="flex items-center px-3 py-1 bg-success-50 text-success-700 rounded-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Valid (25-250 CFU)</span>
          </div>
        )
      case 'TNTC':
        return (
          <div className="flex items-center px-3 py-1 bg-error-50 text-error-700 rounded-full">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">TNTC - Too Numerous To Count</span>
          </div>
        )
      case 'TFTC':
        return (
          <div className="flex items-center px-3 py-1 bg-warning-50 text-warning-700 rounded-full">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">TFTC - Too Few To Count</span>
          </div>
        )
      default:
        return null
    }
  }

  const formatCFU = (cfu: number) => {
    if (cfu >= 10000) {
      return cfu.toExponential(2) + ' CFU/ml'
    }
    return cfu.toLocaleString() + ' CFU/ml'
  }

  const getDetectionColor = (className: DetectionClass) => {
    return DETECTION_COLORS[className] || 'border-gray-500 bg-gray-500/20'
  }

  const getDotColor = (className: DetectionClass) => {
    return DOT_COLORS[className] || 'bg-gray-500'
  }

  // Transform detections for display
  const detections = analysis.detections || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/history" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analysis Results</h1>
            <p className="text-sm text-gray-500">Sample: {analysis.sample_id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExportPdf}
            className="btn-secondary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
          <button
            onClick={handleApprove}
            className="btn-primary flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve & Save
          </button>
        </div>
      </div>

      {/* Warnings */}
      {analysis.warnings && analysis.warnings.length > 0 && (
        <div className="bg-warning-50 border-l-4 border-warning-400 p-4 rounded">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-warning-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning-900">Analysis Warnings</p>
              <ul className="mt-2 text-sm text-warning-800 list-disc list-inside">
                {analysis.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Status and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Status</p>
          {getStatusBadge(analysis.status)}
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Total Colonies</p>
          <p className="text-3xl font-bold text-gray-900">{analysis.colony_count}</p>
          <p className="text-xs text-gray-500 mt-1">Valid detections only</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">CFU/ml</p>
          <p className="text-3xl font-bold text-gray-900 font-mono">
            {formatCFU(analysis.cfu_per_ml)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {analysis.colony_count} / ({analysis.plated_volume_ml}ml × {analysis.dilution_factor})
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Confidence</p>
          <p className="text-3xl font-bold text-success-600">
            {(analysis.confidence_score * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Reliability: {analysis.reliability}
          </p>
        </div>
      </div>

      {/* Annotated Image */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Annotated Plate Image
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-600 w-16 text-center">
              {(zoom * 100).toFixed(0)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`p-2 rounded ${showAnnotations ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'}`}
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
          {/* Annotated image from backend */}
          {analysis.annotated_image_url ? (
            <img
              src={analysis.annotated_image_url}
              alt="Annotated plate"
              className="w-full h-96 object-contain"
            />
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg font-medium">Annotated Image</p>
                <p className="text-sm">AI-detected colonies will be shown here</p>
              </div>
            </div>
          )}

          {/* Detection boxes overlay - using real detection data */}
          {showAnnotations && detections.map((detection) => (
            <div
              key={detection.id}
              onClick={() => setSelectedDetection(
                selectedDetection === detection.id ? null : detection.id
              )}
              className={`absolute cursor-pointer transition-all hover:opacity-100 ${getDetectionColor(detection.class_name as DetectionClass)} ${
                selectedDetection === detection.id ? 'opacity-100 ring-2 ring-yellow-400' : 'opacity-70'
              }`}
              style={{
                left: detection.bbox.x,
                top: detection.bbox.y,
                width: detection.bbox.width,
                height: detection.bbox.height,
                border: '2px solid',
              }}
            >
              <div className="absolute -top-6 left-0 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {detection.class_name.replace('_', ' ')} ({(detection.confidence * 100).toFixed(0)}%)
              </div>
            </div>
          ))}
        </div>

        {/* Legend - 5 classes */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500/20 border-2 border-green-500 mr-2"></div>
            <span className="text-sm text-gray-700">Single Colony</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500/20 border-2 border-yellow-500 mr-2"></div>
            <span className="text-sm text-gray-700">Merged Colony</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500/20 border-2 border-red-500 mr-2"></div>
            <span className="text-sm text-gray-700">Bubble</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500/20 border-2 border-orange-500 mr-2"></div>
            <span className="text-sm text-gray-700">Dust/Debris</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500/20 border-2 border-purple-500 mr-2"></div>
            <span className="text-sm text-gray-700">Media Crack</span>
          </div>
        </div>
      </div>

      {/* Detection Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detection Summary - 5 class breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detection Summary
          </h3>
          <div className="space-y-3">
            {Object.entries(analysis.class_breakdown).map(([className, count]) => (
              <div key={className} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${getDotColor(className as DetectionClass)}`}></div>
                  <span className="text-sm text-gray-700">
                    {className.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Total Valid Colonies</span>
                <span className="text-lg font-bold text-gray-900">
                  {(analysis.class_breakdown.colony_single || 0) + (analysis.class_breakdown.colony_merged || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Detections */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Detections ({detections.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {detections.map((detection) => (
              <div
                key={detection.id}
                onClick={() => setSelectedDetection(detection.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedDetection === detection.id
                    ? 'bg-primary-50 border-2 border-primary-500'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${getDotColor(detection.class_name as DetectionClass)}`}></div>
                    <span className="text-sm font-medium text-gray-900">
                      {detection.class_name.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {(detection.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Position: ({detection.bbox.x}, {detection.bbox.y}) | Size: {detection.bbox.width}×{detection.bbox.height}px
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Metadata */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Analysis Metadata
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Analysis ID</p>
            <p className="text-sm font-mono font-medium text-gray-900">{analysis.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Media Type</p>
            <p className="text-sm font-medium text-gray-900">{analysis.media_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Dilution Factor</p>
            <p className="text-sm font-mono font-medium text-gray-900">{analysis.dilution_factor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Plated Volume</p>
            <p className="text-sm font-medium text-gray-900">{analysis.plated_volume_ml} ml</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Analysis Date</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(analysis.created_at).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Reporting Valid</p>
            <p className="text-sm font-medium text-gray-900">
              {analysis.is_valid_for_reporting ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleFlagReview}
          className="btn-secondary flex items-center"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Flag for Review
        </button>
        <button
          onClick={handleApprove}
          className="btn-primary flex items-center"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve & Save
        </button>
      </div>
    </div>
  )
}

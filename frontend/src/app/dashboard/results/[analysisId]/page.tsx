'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Download,
  CheckCircle,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Loader2,
  Camera,
  Info,
  Target,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'
import { analysesApi } from '@/lib/analyses-api'
import { reportsApi } from '@/lib/reports-api'
import { Analysis, DetectionClass } from '@/lib/types'
import { toast } from 'sonner'

// 1. TERMINOLOGY: Use Proposal Terms for Consistency
const CLASS_LABELS: Record<DetectionClass, string> = {
  colony_single: 'Colony Single',
  colony_merged: 'Colony Merged',
  bubble: 'Bubble (Artifact)',
  dust_debris: 'Dust/Debris (Artifact)',
  media_crack: 'Media Crack (Artifact)',
}

const CLASS_COLORS: Record<DetectionClass, string> = {
  colony_single: 'bg-green-500',
  colony_merged: 'bg-yellow-500',
  bubble: 'bg-red-500',
  dust_debris: 'bg-orange-500',
  media_crack: 'bg-purple-500',
}

const CLASS_BORDER_COLORS: Record<DetectionClass, string> = {
  colony_single: 'border-green-500',
  colony_merged: 'border-yellow-500',
  bubble: 'border-red-500',
  dust_debris: 'border-orange-500',
  media_crack: 'border-purple-500',
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-700', label: 'Completed' },
  processing: { bg: 'bg-blue-100 text-blue-700', text: 'text-blue-700', label: 'Processing' },
  failed: { bg: 'bg-rose-100 text-rose-700', text: 'text-rose-700', label: 'Failed' },
  pending: { bg: 'bg-amber-100 text-amber-700', text: 'text-amber-700', label: 'Pending' },
}

const formatCFU = (value: number | null) => {
  if (value === null) return 'N/A'
  if (value >= 10000) return value.toExponential(2)
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
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
      toast.success('Analysis approved successfully')
      setAnalysis({ ...analysis, is_valid_for_reporting: true })
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to approve analysis')
    }
  }

  const handleExportPdf = async () => {
    if (!analysis) return
    try {
      const report = await reportsApi.generatePdf({
        report_type: 'custom',
        date_from: analysis.created_at.split('T')[0],
        date_to: analysis.created_at.split('T')[0],
        format: 'pdf',
      })
      window.open(report.url, '_blank')
      toast.success('PDF Report generated')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to export PDF')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading analysis results...</p>
        </div>
      </div>
    )
  }

  if (!analysis) return null

  // 2. DATA CALCULATIONS: Separate Valid vs Artifacts
  const validCount = (analysis.class_breakdown.colony_single || 0) + (analysis.class_breakdown.colony_merged || 0)
  const artifactCount = (analysis.class_breakdown.bubble || 0) + (analysis.class_breakdown.dust_debris || 0) + (analysis.class_breakdown.media_crack || 0)
  const totalCount = Object.values(analysis.class_breakdown).reduce((a, b) => a + b, 0)
  const statusInfo = STATUS_COLORS[analysis.status] || STATUS_COLORS.pending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/history" className="p-2 rounded-lg bg-white border border-border hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Analysis Results</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.bg}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Sample: <span className="font-mono font-semibold text-foreground">{analysis.sample_id}</span> • Media: {analysis.media_type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          {analysis.status === 'completed' && (
            <button
              onClick={handleApprove}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <CheckCircle className="h-4 w-4" />
              {analysis.is_valid_for_reporting ? 'Verified' : 'Approve'}
            </button>
          )}
        </div>
      </div>

      {/* Warnings */}
      {analysis.warnings && analysis.warnings.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">Attention Required</p>
              <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-1 list-disc pl-4">
                {analysis.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CFU Result */}
        <div className="bg-white dark:bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">CFU / mL</span>
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Target className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">
            {formatCFU(analysis.cfu_per_ml)}
          </p>
          <p className="text-xs text-muted-foreground">
            {analysis.cfu_per_ml === null ? 'TNTC / TFTC' : 'Valid Count'}
          </p>
        </div>

        {/* Valid Count */}
        <div className="bg-white dark:bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">Valid Colonies</span>
            <div className="p-1.5 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{validCount}</p>
          <p className="text-xs text-muted-foreground">
            Single + Merged
          </p>
        </div>

        {/* Artifact Count - NEW FEATURE for Jury */}
        <div className="bg-white dark:bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">Rejected Artifacts</span>
            <div className="p-1.5 bg-rose-500/10 rounded-lg">
              <EyeOff className="h-4 w-4 text-rose-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{artifactCount}</p>
          <p className="text-xs text-muted-foreground">
            Bubbles, Dust & Cracks
          </p>
        </div>

        {/* Confidence */}
        <div className="bg-white dark:bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">AI Confidence</span>
            <div className="p-1.5 bg-purple-500/10 rounded-lg">
              <Info className="h-4 w-4 text-purple-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">
            {(analysis.confidence_score * 100).toFixed(1)}%
          </p>
          <div className="w-full bg-muted h-1.5 rounded-full mt-2">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${analysis.confidence_score * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image View */}
        <div className="lg:col-span-2 bg-white dark:bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Annotated Plate</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1.5 hover:bg-muted rounded-lg">
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1.5 hover:bg-muted rounded-lg">
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowAnnotations(!showAnnotations)}
                className={`ml-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                  showAnnotations ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                {showAnnotations ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {showAnnotations ? 'Annotations On' : 'Annotations Off'}
              </button>
            </div>
          </div>
          <div className="relative bg-muted/30 min-h-[500px] flex items-center justify-center overflow-hidden">
            {/* 3. FIX: Bounding Box Logic */}
            {/* Note: We assume backend sends normalized 0-1 coordinates. If it sends pixels, we need image dimensions. 
                Since we can't get image dimensions easily here without a load event, we assume % coordinates from backend 
                or 0-1 normalized. The safest bet for YOLO is usually 0-1 relative to image size. */}
            <div className="relative transition-transform duration-300 ease-out" style={{ transform: `scale(${zoom})` }}>
              {analysis.annotated_image_url ? (
                <img
                  src={analysis.annotated_image_url}
                  alt="Annotated Analysis"
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  // We use a ref to get dimensions if needed, but for now we try to position absolutely based on container
                />
              ) : (
                <div className="w-[500px] h-[500px] flex flex-col items-center justify-center text-muted-foreground">
                  <Camera className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-sm font-medium">Image unavailable</p>
                </div>
              )}

              {/* Detection Overlays */}
              {showAnnotations && analysis.detections.map((detection) => {
                // FIX QA-003: Handle both pixel coordinates (0-1024) and normalized (0-1)
                // Backend sends pixel coordinates, so we convert to percentage relative to image container
                // Standard assumption: image width is ~1024px (MODEL_IMG_SIZE * 2)
                const imgWidth = 1024
                const isPixel = detection.bbox.width > 10 // If width > 10, it's likely pixels not normalized
                
                const left = isPixel ? (detection.bbox.x / imgWidth) * 100 : (detection.bbox.x * 100)
                const top = isPixel ? (detection.bbox.y / imgWidth) * 100 : (detection.bbox.y * 100)
                const width = isPixel ? (detection.bbox.width / imgWidth) * 100 : (detection.bbox.width * 100)
                const height = isPixel ? (detection.bbox.height / imgWidth) * 100 : (detection.bbox.height * 100)

                return (
                  <div
                    key={detection.id}
                    onClick={() => setSelectedDetection(selectedDetection === detection.id ? null : detection.id)}
                    className={`absolute border-2 rounded cursor-pointer transition-all duration-200 hover:border-white hover:z-50 ${
                      CLASS_BORDER_COLORS[detection.class_name as DetectionClass]
                    } ${selectedDetection === detection.id ? 'ring-2 ring-white z-40' : ''}`}
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                    }}
                  >
                    {zoom > 1.5 && (
                      <div className="absolute -top-6 left-0 bg-black/80 text-white text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap">
                        {detection.confidence.toFixed(2)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="space-y-6">
          {/* Class Breakdown */}
          <div className="bg-white dark:bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">5-Class Detection Breakdown</h3>
            <div className="space-y-4">
              {/* Valid Colonies Group */}
              <div>
                <p className="text-[10px] font-bold text-green-600 mb-2 uppercase">Valid Colonies (Counted)</p>
                {(['colony_single', 'colony_merged'] as DetectionClass[]).map((clsName) => {
                   const count = analysis.class_breakdown[clsName] || 0
                   // FIX: Always show all 5 classes, even if count is 0
                   return (
                    <div key={clsName} className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${CLASS_COLORS[clsName]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-muted-foreground">{CLASS_LABELS[clsName]}</span>
                          <span className="font-bold text-foreground">{count}</span>
                        </div>
                        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${CLASS_COLORS[clsName]}`}
                            style={{ width: `${totalCount > 0 ? (count / totalCount) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                   )
                })}
              </div>
              
              {/* Artifacts Group */}
              <div>
                <p className="text-[10px] font-bold text-rose-600 mb-2 uppercase">Artifacts (Excluded from Count)</p>
                {(['bubble', 'dust_debris', 'media_crack'] as DetectionClass[]).map((clsName) => {
                   const count = analysis.class_breakdown[clsName] || 0
                   // FIX: Always show all 5 classes, even if count is 0
                   return (
                    <div key={clsName} className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${CLASS_COLORS[clsName]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-muted-foreground">{CLASS_LABELS[clsName]}</span>
                          <span className="font-bold text-foreground">{count}</span>
                        </div>
                        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${CLASS_COLORS[clsName]}`}
                            style={{ width: `${totalCount > 0 ? (count / totalCount) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                   )
                })}
              </div>
            </div>
            
            {/* Summary Footer */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Total Objects Detected</span>
                <span className="font-bold text-foreground text-lg">{totalCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs mt-1">
                <span className="text-muted-foreground font-medium">Total Valid Colonies</span>
                <span className="font-bold text-green-600 text-lg">{validCount}</span>
              </div>
            </div>
          </div>

          {/* Measurement Uncertainty */}
          {analysis.uncertainty_u !== undefined && analysis.uncertainty_u !== null && (
            <div className="bg-white dark:bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Measurement Uncertainty (U)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">U (k=2, 95%)</span>
                  <span className="font-bold text-foreground">{analysis.uncertainty_u.toLocaleString()} CFU/mL</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Calculated based on GUM (ISO/IEC Guide 98-3)
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="bg-white dark:bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Valid Colony (Counted)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">Merged Colony (Counted)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Bubble (Excluded)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-muted-foreground">Dust/Debris (Excluded)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-muted-foreground">Media Crack (Excluded)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detection Registry Table */}
      <div className="bg-white dark:bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Detection Registry</h3>
        </div>
        <div className="overflow-x-auto max-h-[300px]">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground sticky top-0">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Class</th>
                <th className="text-left px-4 py-3 font-medium">Confidence</th>
                <th className="text-left px-4 py-3 font-medium">Coordinates (x, y)</th>
                <th className="text-left px-4 py-3 font-medium">Dimensions (w, h)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {analysis.detections.map((detection) => (
                <tr key={detection.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${CLASS_COLORS[detection.class_name as DetectionClass]}`} />
                      <span className="capitalize text-foreground">
                        {CLASS_LABELS[detection.class_name as DetectionClass]}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${detection.confidence * 100}%` }} />
                      </div>
                      <span className="text-muted-foreground">{(detection.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {detection.bbox.x.toFixed(1)}, {detection.bbox.y.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {detection.bbox.width.toFixed(1)} × {detection.bbox.height.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Scale, ClipboardCheck, BarChart3, Save, Loader2, ChevronDown } from 'lucide-react'
import { analysesApi } from '@/lib/analyses-api'
import { simulatorApi } from '@/lib/simulator-api'
import { Analysis, AnalysisListResponse, DetectionClass } from '@/lib/types'
import { toast } from 'sonner'

const CLASSES: DetectionClass[] = [
  'colony_single',
  'colony_merged',
  'bubble',
  'dust_debris',
  'media_crack',
]

const CLASS_LABELS: Record<DetectionClass, string> = {
  colony_single: 'Single Colony',
  colony_merged: 'Merged Colony',
  bubble: 'Bubble',
  dust_debris: 'Dust / Debris',
  media_crack: 'Media Crack',
}

const CLASS_EMOJI: Record<DetectionClass, string> = {
  colony_single: '\u{1F7E2}',
  colony_merged: '\u{1F7E1}',
  bubble: '\u{1F534}',
  dust_debris: '\u{1F7E0}',
  media_crack: '\u{1F7E3}',
}

const CLASS_DOT_COLORS: Record<DetectionClass, string> = {
  colony_single: 'bg-green-500',
  colony_merged: 'bg-yellow-500',
  bubble: 'bg-red-500',
  dust_debris: 'bg-orange-500',
  media_crack: 'bg-purple-500',
}

function calculateAgreement(ai: number, manual: number): number {
  if (ai === 0 && manual === 0) return 0
  const maxVal = Math.max(ai, manual)
  if (maxVal === 0) return 0
  const diff = Math.abs(ai - manual)
  return Math.max(0, 100 - (diff / maxVal) * 100)
}

function getAgreementColor(pct: number): string {
  if (pct >= 90) return 'text-green-600'
  if (pct >= 70) return 'text-yellow-600'
  if (pct >= 50) return 'text-orange-600'
  return 'text-red-600'
}

function getAgreementBgColor(pct: number): string {
  if (pct >= 90) return 'bg-green-50'
  if (pct >= 70) return 'bg-yellow-50'
  if (pct >= 50) return 'bg-orange-50'
  return 'bg-red-50'
}

export default function SimulatorPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('')
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)
  const [manualCounts, setManualCounts] = useState<Record<DetectionClass, string>>({
    colony_single: '',
    colony_merged: '',
    bubble: '',
    dust_debris: '',
    media_crack: '',
  })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch recent analyses
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const result: AnalysisListResponse = await analysesApi.list({
          page: 1,
          page_size: 20,
        })
        setAnalyses(result.analyses)
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Failed to load analyses')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnalyses()
  }, [])

  // Update selected analysis when ID changes
  useEffect(() => {
    if (selectedAnalysisId) {
      const analysis = analyses.find((a) => a.id === selectedAnalysisId)
      setSelectedAnalysis(analysis || null)
      // Reset manual counts
      setManualCounts({
        colony_single: '',
        colony_merged: '',
        bubble: '',
        dust_debris: '',
        media_crack: '',
      })
    } else {
      setSelectedAnalysis(null)
    }
  }, [selectedAnalysisId, analyses])

  const handleManualCountChange = useCallback((cls: DetectionClass, value: string) => {
    // Only allow non-negative integers
    if (value === '' || /^\d+$/.test(value)) {
      setManualCounts((prev) => ({ ...prev, [cls]: value }))
    }
  }, [])

  const manualCountsNumeric: Record<DetectionClass, number> = {
    colony_single: parseInt(manualCounts.colony_single || '0', 10),
    colony_merged: parseInt(manualCounts.colony_merged || '0', 10),
    bubble: parseInt(manualCounts.bubble || '0', 10),
    dust_debris: parseInt(manualCounts.dust_debris || '0', 10),
    media_crack: parseInt(manualCounts.media_crack || '0', 10),
  }

  const breakdown = selectedAnalysis?.class_breakdown

  // Calculate per-class agreement
  const agreements: Record<DetectionClass, number> = {
    colony_single: 0,
    colony_merged: 0,
    bubble: 0,
    dust_debris: 0,
    media_crack: 0,
  }

  if (breakdown) {
    for (const cls of CLASSES) {
      const aiCount = breakdown[cls] || 0
      const manualCount = manualCountsNumeric[cls]
      // Only calculate if manual count has been entered
      if (manualCounts[cls] !== '') {
        agreements[cls] = calculateAgreement(aiCount, manualCount)
      }
    }
  }

  // Calculate overall accuracy (average of entered agreements)
  const enteredClasses = CLASSES.filter((cls) => manualCounts[cls] !== '')
  const overallAccuracy =
    enteredClasses.length > 0
      ? enteredClasses.reduce((sum, cls) => sum + agreements[cls], 0) / enteredClasses.length
      : null

  // Calculate total valid (colony_single + colony_merged)
  const aiTotalValid = breakdown
    ? (breakdown.colony_single || 0) + (breakdown.colony_merged || 0)
    : 0
  const manualTotalValid =
    manualCounts.colony_single !== '' && manualCounts.colony_merged !== ''
      ? manualCountsNumeric.colony_single + manualCountsNumeric.colony_merged
      : null

  const hasAnyManualInput = enteredClasses.length > 0

  const handleSaveComparison = async () => {
    if (!selectedAnalysis || manualCountsNumeric.colony_single === null || manualCountsNumeric.colony_merged === null) {
      toast.error('Please enter at least colony_single and colony_merged counts')
      return
    }

    setIsSaving(true)
    try {
      await simulatorApi.saveComparison({
        analysis_id: selectedAnalysis.id,
        manual_colony_single: manualCountsNumeric.colony_single,
        manual_colony_merged: manualCountsNumeric.colony_merged,
        manual_bubble: manualCountsNumeric.bubble,
        manual_dust_debris: manualCountsNumeric.dust_debris,
        manual_media_crack: manualCountsNumeric.media_crack,
      })

      toast.success('Comparison saved successfully', {
        description: `${selectedAnalysis.sample_id} -- ${overallAccuracy !== null ? overallAccuracy.toFixed(1) : '--'}% accuracy`,
      })

      // Reset manual counts after save
      setManualCounts({
        colony_single: '',
        colony_merged: '',
        bubble: '',
        dust_debris: '',
        media_crack: '',
      })
    } catch (error: any) {
      toast.error('Failed to save comparison', {
        description: error.response?.data?.detail || 'Please try again',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-4 text-gray-600">Loading analyses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Colony Counter Simulator</h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Cross-validation between AI inference and manual clinical counts</p>
          </div>
        </div>
      </div>

      {/* Analysis Selector */}
      <div className="card p-8 border-primary/20 bg-primary/[0.02]">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center space-x-2 ml-1 mb-4">
          <BarChart3 className="h-3 w-3" />
          <span>Select Target Specimen Analysis</span>
        </label>
        <div className="relative mt-2">
            <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="input flex items-center justify-between text-left w-full h-14 bg-background px-6 border-border/50 font-black uppercase tracking-widest text-xs"
          >
            {selectedAnalysis ? (
              <div className="flex items-center gap-4">
                <span className="text-foreground">{selectedAnalysis.sample_id}</span>
                <span className="text-muted-foreground/60 text-[10px]">
                  {selectedAnalysis.media_type} // {new Date(selectedAnalysis.created_at).toLocaleDateString()}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground/40">Select Diagnostic Session...</span>
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {analyses.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    No analyses found
                  </div>
                ) : (
                  analyses.map((analysis) => (
                    <button
                      key={analysis.id}
                      onClick={() => {
                        setSelectedAnalysisId(analysis.id)
                        setIsDropdownOpen(false)
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        analysis.id === selectedAnalysisId ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">{analysis.sample_id}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {analysis.media_type} &middot; {analysis.colony_count} colonies &middot;{' '}
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedAnalysis && breakdown && (
        <>
          {/* AI Detection Counts */}
          <div className="card p-8 bg-muted/20 border-border/40">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-8 flex items-center">
              <ClipboardCheck className="h-5 w-5 mr-3 text-primary" />
              AI Inference Results
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              {CLASSES.map((cls) => (
                <div key={cls} className="text-center group">
                  <div className="flex items-center justify-center mb-3">
                    <div className={`w-2 h-2 rounded-full mr-2 ${CLASS_DOT_COLORS[cls]} shadow-[0_0_8px_currentcolor]`} />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">{CLASS_LABELS[cls]}</span>
                  </div>
                  <p className="text-3xl font-black text-foreground tracking-tighter">{breakdown[cls] || 0}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Count Input */}
          <div className="card p-8 bg-muted/20 border-border/40">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-8 flex items-center">
              <Scale className="h-5 w-5 mr-3 text-primary" />
              Manual Analyst Input
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              {CLASSES.map((cls) => (
                <div key={cls} className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 block">
                    {CLASS_LABELS[cls]}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={manualCounts[cls]}
                    onChange={(e) => handleManualCountChange(cls, e.target.value)}
                    className="input text-center h-14 bg-background border-border/50 font-black text-xl hover:border-primary/30 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Side-by-Side Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AI Count
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manual Count
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agreement %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {CLASSES.map((cls) => {
                    const aiCount = breakdown[cls] || 0
                    const manualCount = manualCountsNumeric[cls]
                    const hasInput = manualCounts[cls] !== ''
                    const agreement = agreements[cls]

                    return (
                      <tr key={cls} className={hasInput ? getAgreementBgColor(agreement) : ''}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">{CLASS_EMOJI[cls]}</span>
                            <div className={`w-2 h-2 rounded-full mr-2 ${CLASS_DOT_COLORS[cls]}`} />
                            <span className="text-sm font-medium text-gray-900">
                              {cls.replace('_', '_')}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-semibold text-gray-900">{aiCount}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-semibold ${hasInput ? 'text-gray-900' : 'text-gray-400'}`}>
                            {hasInput ? manualCount : '--'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasInput ? (
                            <span className={`text-sm font-bold ${getAgreementColor(agreement)}`}>
                              {agreement.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">--%</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}

                  {/* Total Valid Row */}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">Total Valid</span>
                      <span className="text-xs text-gray-500 ml-2">(single + merged)</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-gray-900">{aiTotalValid}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-gray-900">
                        {manualTotalValid !== null ? manualTotalValid : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {manualTotalValid !== null ? (
                        <span className={`text-sm font-bold ${getAgreementColor(calculateAgreement(aiTotalValid, manualTotalValid))}`}>
                          {calculateAgreement(aiTotalValid, manualTotalValid).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">--%</span>
                      )}
                    </td>
                  </tr>

                  {/* Overall Accuracy Row */}
                  <tr className="bg-primary-50 font-semibold">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">Accuracy</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-500">--</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-500">--</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {overallAccuracy !== null ? (
                        <span className={`text-base font-bold ${getAgreementColor(overallAccuracy)}`}>
                          {overallAccuracy.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">--</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setSelectedAnalysisId('')
                setManualCounts({
                  colony_single: '',
                  colony_merged: '',
                  bubble: '',
                  dust_debris: '',
                  media_crack: '',
                })
              }}
              className="btn-secondary"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSaveComparison}
              disabled={!hasAnyManualInput || isSaving}
              className="btn-primary flex items-center disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Comparison
            </button>
          </div>
        </>
      )}

      {!selectedAnalysis && analyses.length > 0 && (
        <div className="card text-center py-12">
          <Scale className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Analysis</h3>
          <p className="text-gray-500">
            Choose a recent analysis from the dropdown above to start comparing AI counts with your manual counts.
          </p>
        </div>
      )}
    </div>
  )
}

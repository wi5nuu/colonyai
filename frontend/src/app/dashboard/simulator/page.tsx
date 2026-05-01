'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslationStore } from '@/lib/i18n/store'
import { DocumentationSidebar } from '@/components/DocumentationSidebar'
import { 
  FlaskConical, 
  Zap, 
  ShieldCheck, 
  Search, 
  Info, 
  Target,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  Beaker,
  CheckCircle2,
  ArrowRight,
  Download
} from 'lucide-react'
import { toast } from 'sonner'

interface Detection {
  id: string
  class: 'colony' | 'bubble' | 'dust' | 'crack' | 'condensation'
  confidence: number
  x: number
  y: number
  size: number
}

const CLASS_CONFIG = {
  colony: { color: 'bg-emerald-500', border: 'border-emerald-500', label: 'Microbial Colony', valid: true },
  bubble: { color: 'bg-amber-500', border: 'border-amber-500', label: 'Air Bubble', valid: false },
  dust: { color: 'bg-slate-400', border: 'border-slate-400', label: 'Dust / Debris', valid: false },
  crack: { color: 'bg-rose-500', border: 'border-rose-500', label: 'Media Crack', valid: false },
  condensation: { color: 'bg-blue-400', border: 'border-blue-400', label: 'Condensation', valid: false },
}

export default function SimulatorPage() {
  const { t } = useTranslationStore()
  const [showDocs, setShowDocs] = useState(true)
  const [isSimulating, setIsSimulating] = useState(false)
  const [detections, setDetections] = useState<Detection[]>([])
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [manualCount, setManualCount] = useState<number>(0)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setPreviewUrl(URL.createObjectURL(selected))
      setAnalysisResult(null)
    }
  }

  const startSimulation = async () => {
    if (!file) {
      toast.error('Please upload a specimen image first')
      return
    }
    
    setIsSimulating(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/v1/analyses/simulate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })
      
      if (!response.ok) throw new Error('Neural Engine failed to process')
      
      const data = await response.json()
      setAnalysisResult(data)
      setDetections(data.detections.map((d: any) => ({
        id: d.id,
        class: d.class_name.includes('colony') ? 'colony' : d.class_name,
        confidence: d.confidence,
        x: (d.bbox.x / 512) * 100,
        y: (d.bbox.y / 512) * 100,
        size: (d.bbox.width / 512) * 100
      })))
      toast.success('Spectral Analysis Complete')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSimulating(false)
    }
  }

  const aiCount = analysisResult?.colony_count || 0
  const agreementRate = manualCount > 0 
    ? Math.max(0, 100 - (Math.abs(aiCount - manualCount) / manualCount) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        <div className={`flex-1 transition-all duration-300 ${showDocs ? 'lg:mr-[350px]' : ''}`}>
          <div className="space-y-10 max-w-[1500px] mx-auto px-2 py-2 sm:px-8 sm:py-8">
            
            {/* Simulation Control Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl shadow-xl flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Neural Simulator</h1>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Comparison: Manual vs AI Accuracy</p>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-6 py-3.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-3">
                  <Beaker className="w-4 h-4" />
                  Upload Specimen
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
                <button 
                  onClick={startSimulation}
                  disabled={isSimulating || !file}
                  className="bg-slate-900 text-white py-3.5 px-6 flex items-center gap-3 rounded-xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-primary ${isSimulating ? 'animate-spin' : ''}`} />
                  <span className="uppercase tracking-widest text-[10px] font-black">{isSimulating ? 'Processing...' : 'Run Neural Diagnostic'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
              {/* Visualizer Arena */}
              <div className="lg:col-span-6 space-y-6">
                <div className="relative aspect-[4/3] bg-slate-900 rounded-xl border-[4px] sm:border-[6px] border-slate-800 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-[85%] h-[85%] rounded-full bg-slate-800/30 border border-white/5 shadow-[inset_0_0_60px_rgba(0,0,0,0.5)] overflow-hidden">
                      <div className={`absolute inset-0 transition-opacity duration-1000 ${(detections.length > 0 || previewUrl) && !isSimulating ? 'opacity-70' : 'opacity-15'}`}>
                        {previewUrl && <img src={previewUrl} alt="Specimen" className="w-full h-full object-cover rounded-full mix-blend-luminosity" />}
                        <div className="absolute inset-0 bg-primary/5" />
                      </div>

                      {!isSimulating && detections.length > 0 && (
                        <div className="absolute inset-0 animate-in fade-in duration-700">
                          {detections.filter(d => !selectedClass || d.class === selectedClass).map((d) => (
                            <div 
                              key={d.id}
                              className={`absolute rounded-full border-2 ${CLASS_CONFIG[d.class as keyof typeof CLASS_CONFIG].border} transition-all duration-300 hover:scale-150 cursor-pointer z-10`}
                              style={{ 
                                left: `${d.x}%`, 
                                top: `${d.y}%`, 
                                width: `${d.size * 1.5}px`, 
                                height: `${d.size * 1.5}px`,
                                backgroundColor: `${CLASS_CONFIG[d.class as keyof typeof CLASS_CONFIG].color.replace('bg-', '')}40`,
                                boxShadow: `0 0 12px ${CLASS_CONFIG[d.class as keyof typeof CLASS_CONFIG].color.replace('bg-', '')}50`
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {isSimulating && (
                        <div className="absolute inset-0 flex items-center justify-center z-50 bg-slate-950/70 backdrop-blur-sm">
                          <div className="flex flex-col items-center gap-6">
                            <div className="w-16 h-16 border-3 border-primary/10 border-t-primary rounded-full animate-spin" />
                            <p className="text-[9px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Neural Mapping...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {(Object.entries(CLASS_CONFIG) as [keyof typeof CLASS_CONFIG, any][]).map(([key, cfg]) => (
                    <button 
                      key={key}
                      onClick={() => setSelectedClass(selectedClass === key ? null : key)}
                      className={`bg-white border p-4 rounded-2xl transition-all duration-300 text-left relative overflow-hidden ${
                        selectedClass === key ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200/60'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${cfg.color} mb-3`} />
                      <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{cfg.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Analytics Panel */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-white border border-slate-200/60 p-8 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Validation Matrix</h3>
                    <div className="px-4 py-2 bg-slate-900 rounded-xl">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Agreement: {agreementRate}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Manual Count</p>
                      <input 
                        type="number" 
                        value={manualCount}
                        onChange={(e) => setManualCount(parseInt(e.target.value) || 0)}
                        className="text-4xl font-black text-slate-900 tracking-tighter bg-slate-50 border-none w-full p-2 rounded-xl"
                      />
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">AI Intelligence Count</p>
                      <p className="text-4xl font-black text-primary tracking-tighter">{aiCount}</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence Score</span>
                      <p className="text-xl font-black text-slate-900">{(analysisResult?.confidence_score * 100 || 0).toFixed(1)}%</p>
                    </div>
                    <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-slate-200">
                      <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${analysisResult?.confidence_score * 100 || 0}%` }} />
                    </div>
                  </div>

                  <button onClick={() => window.print()} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3">
                    <Download className="w-4 h-4" />
                    Download Validation Report
                  </button>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                    <Zap className="w-32 h-32" />
                  </div>
                  <h4 className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-3">Kernel v4.2</h4>
                  <p className="text-xs font-medium text-slate-300 leading-relaxed italic border-l-2 border-primary/30 pl-4">
                    "Utilizing YOLOv8 Neural Architecture for real-time biological object detection."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Sidebar */}
        <div className="hidden lg:block">
          <DocumentationSidebar
            showDocs={showDocs}
            setShowDocs={setShowDocs}
            directory="Validation Protocol"
            title={t('simulator.docsTitle')}
            description={t('simulator.docsDescription')}
          >
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Tujuan Validasi</h2>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                Sistem ini memungkinkan auditor dan analis untuk melakukan uji profisiensi secara interaktif terhadap model AI tanpa menyimpan data ke dalam riwayat audit.
              </p>
            </section>
          </DocumentationSidebar>
        </div>
      </div>
    </div>
  )
}

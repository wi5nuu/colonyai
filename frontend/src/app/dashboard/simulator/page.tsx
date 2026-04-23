'use client'

import { useState, useRef, useEffect } from 'react'
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
  CheckCircle2
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
  const [isSimulating, setIsSimulating] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [detections, setDetections] = useState<Detection[]>([])
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  
  // Mock generation for simulation
  const startSimulation = () => {
    setIsSimulating(true)
    setDetections([])
    
    toast.info('Initializing Neural Engine...', { duration: 1000 })
    
    setTimeout(() => {
      const mockDetections: Detection[] = []
      // Generate 50-70 colonies
      for (let i = 0; i < 65; i++) {
        mockDetections.push({
          id: `c-${i}`,
          class: 'colony',
          confidence: 0.85 + Math.random() * 0.14,
          x: 15 + Math.random() * 70,
          y: 15 + Math.random() * 70,
          size: 4 + Math.random() * 8
        })
      }
      // Generate artifacts
      for (let i = 0; i < 12; i++) {
        mockDetections.push({
          id: `a-${i}`,
          class: Math.random() > 0.5 ? 'bubble' : Math.random() > 0.5 ? 'dust' : Math.random() > 0.5 ? 'crack' : 'condensation',
          confidence: 0.70 + Math.random() * 0.25,
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80,
          size: 6 + Math.random() * 15
        })
      }
      setDetections(mockDetections)
      setIsSimulating(false)
      toast.success('Spectral Analysis Complete')
    }, 2500)
  }

  const filteredDetections = selectedClass 
    ? detections.filter(d => d.class === selectedClass)
    : detections

  const stats = {
    total: detections.length,
    valid: detections.filter(d => CLASS_CONFIG[d.class].valid).length,
    rejected: detections.filter(d => !CLASS_CONFIG[d.class].valid).length,
    accuracy: 94.2
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8">
      {/* Simulation Control Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-600 rounded-lg shadow-lg shadow-orange-900/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Neural Simulator</h1>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Diagnostic Precision Validator // 5-Class Spectrum Analysis</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowOriginal(!showOriginal)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            {showOriginal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showOriginal ? 'Hide Original' : 'Show Original'}
          </button>
          <button 
            onClick={startSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Processing...' : 'Run Diagnostics'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visualizer Arena */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative aspect-square bg-slate-900 rounded-[40px] border-8 border-slate-800 shadow-2xl overflow-hidden group">
            {/* The Plate Container */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-[85%] h-[85%] rounded-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 shadow-inner overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                
                {/* Simulation Render */}
                {!isSimulating && detections.length > 0 && (
                  <div className="absolute inset-0 animate-in fade-in duration-1000">
                    {filteredDetections.map((d) => (
                      <div 
                        key={d.id}
                        className={`absolute rounded-full border-2 ${CLASS_CONFIG[d.class].border} transition-all duration-300 hover:scale-150 cursor-pointer z-10`}
                        style={{ 
                          left: `${d.x}%`, 
                          top: `${d.y}%`, 
                          width: `${d.size}px`, 
                          height: `${d.size}px`,
                          backgroundColor: showOriginal ? 'transparent' : `${CLASS_CONFIG[d.class].color}40`,
                          boxShadow: !showOriginal ? `0 0 10px ${CLASS_CONFIG[d.class].color}` : 'none'
                        }}
                      >
                        {!showOriginal && d.confidence > 0.9 && (
                          <div className="absolute -top-4 -left-4 text-[8px] font-black text-white bg-slate-900/80 px-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100">
                            {Math.round(d.confidence * 100)}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Processing Overlay */}
                {isSimulating && (
                  <div className="absolute inset-0 flex items-center justify-center z-50 bg-slate-950/40 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                       <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Spectral Scanning...</p>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!isSimulating && detections.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-4">
                    <Beaker className="w-12 h-12 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest opacity-40">Awaiting Specimen Input</p>
                  </div>
                )}
              </div>
            </div>

            {/* Scanline Effect */}
            {isSimulating && (
              <div className="absolute top-0 left-0 w-full h-1 bg-orange-500/50 shadow-[0_0_20px_#ea580c] animate-scanline z-50" />
            )}
          </div>

          {/* Legend & Filters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(Object.entries(CLASS_CONFIG) as [keyof typeof CLASS_CONFIG, any][]).map(([key, cfg]) => (
              <button 
                key={key}
                onClick={() => setSelectedClass(selectedClass === key ? null : key)}
                className={`p-4 rounded-2xl border transition-all duration-300 text-left group ${
                  selectedClass === key 
                    ? 'bg-slate-900 border-slate-800 shadow-xl' 
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-3 h-3 rounded-full ${cfg.color}`} />
                  <Info className={`w-3 h-3 transition-colors ${selectedClass === key ? 'text-slate-600' : 'text-slate-300'}`} />
                </div>
                <p className={`text-[10px] font-black uppercase tracking-tight ${selectedClass === key ? 'text-white' : 'text-slate-900'}`}>{cfg.label}</p>
                <p className={`text-[9px] font-bold uppercase mt-1 ${selectedClass === key ? 'text-slate-500' : 'text-slate-400'}`}>
                  {key === 'colony' ? 'Valid Target' : 'Artifact (Ignored)'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Diagnostic Result Card */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
              <ShieldCheck className="w-32 h-32 text-slate-900" />
            </div>
            
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Analysis Certificate</h3>
            
            <div className="space-y-8 relative z-10">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Spectrums</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.total}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Valid CFU</p>
                  <p className="text-4xl font-black text-emerald-600 tracking-tighter">{stats.valid}</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Detection Accuracy</span>
                    <span className="text-xs font-black text-slate-900">94.2%</span>
                 </div>
                 <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-600 rounded-full" style={{ width: '94.2%' }} />
                 </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-[10px] font-bold text-amber-900 leading-tight">
                    <span className="font-black uppercase">{stats.rejected} Artifacts Rejected.</span> Data filtered against bubbles and condensation to prevent false positives.
                  </p>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <p className="text-[10px] font-bold text-emerald-900 leading-tight">
                    <span className="font-black uppercase">Standard Compliance.</span> Results meet ISO 17025 digital reporting requirements.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Neural Sync Active</span>
              </div>
              <button className="text-[10px] font-black text-slate-900 uppercase tracking-widest hover:text-orange-600 transition-colors">Export Ledger</button>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Simulation Engine v4.2</h4>
             <p className="text-sm font-medium text-slate-300 leading-relaxed italic mb-6">
               "This simulator demonstrates the YOLOv8-based artifact rejection pipeline. By isolating non-microbial objects, we eliminate up to 80% of human counting variability."
             </p>
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                   <Target className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase leading-none">Inference Speed</p>
                   <p className="text-xs font-bold text-slate-400 mt-1">~240ms / specimem</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
  CheckCircle2,
  ArrowRight
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
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Simulation Control Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-9 h-9 bg-slate-900 rounded-lg shadow-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Neural Simulator</h1>
          </div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Precision Validation Matrix // 5-Class Spectrum Engine</p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setShowOriginal(!showOriginal)}
            className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
          >
            {showOriginal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button 
            onClick={startSimulation}
            disabled={isSimulating}
            className="btn-primary py-3 px-5 flex items-center gap-2.5 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span className="uppercase tracking-widest text-[8px] font-black">{isSimulating ? 'Processing Sequence...' : 'Run Diagnostics'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visualizer Arena */}
        <div className="lg:col-span-6 space-y-6">
          <div className="relative aspect-[4/3] bg-slate-900 rounded-xl border-[6px] border-slate-800 shadow-2xl shadow-slate-900/50 overflow-hidden group">
            {/* The Plate Container */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-[85%] h-[85%] rounded-full bg-slate-800/30 border border-white/5 shadow-[inset_0_0_60px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Specimen Image Background (Always present but opacity varies) */}
                <div className={`absolute inset-0 transition-opacity duration-1000 ${detections.length > 0 && !isSimulating ? 'opacity-70' : 'opacity-15'}`}>
                  <img src="/test.jpg" alt="Specimen" className="w-full h-full object-cover rounded-full mix-blend-luminosity" />
                  <div className="absolute inset-0 bg-primary/5" />
                </div>

                {/* Background Grid */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '25px 25px' }} />
                
                {/* Simulation Render */}
                {!isSimulating && detections.length > 0 && (
                  <div className="absolute inset-0 animate-in fade-in duration-700">
                    {filteredDetections.map((d) => (
                      <div 
                        key={d.id}
                        className={`absolute rounded-full border-2 ${CLASS_CONFIG[d.class].border} transition-all duration-300 hover:scale-150 cursor-pointer z-10`}
                        style={{ 
                          left: `${d.x}%`, 
                          top: `${d.y}%`, 
                          width: `${d.size * 0.8}px`, 
                          height: `${d.size * 0.8}px`,
                          backgroundColor: showOriginal ? 'transparent' : `${CLASS_CONFIG[d.class].color.replace('bg-', '')}40`,
                          boxShadow: !showOriginal ? `0 0 12px ${CLASS_CONFIG[d.class].color.replace('bg-', '')}50` : 'none'
                        }}
                      >
                        {!showOriginal && d.confidence > 0.9 && (
                          <div className="absolute -top-5 -left-2 text-[7px] font-black text-white bg-slate-900/90 px-1.5 py-0.5 rounded-[3px] backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            {Math.round(d.confidence * 100)}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Processing Overlay */}
                {isSimulating && (
                  <div className="absolute inset-0 flex items-center justify-center z-50 bg-slate-950/70 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-6">
                       <div className="relative">
                          <div className="w-16 h-16 border-3 border-primary/10 border-t-primary rounded-full animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center">
                             <Zap className="w-6 h-6 text-primary animate-pulse" />
                          </div>
                       </div>
                       <div className="text-center">
                          <p className="text-[9px] font-black text-white uppercase tracking-[0.4em] animate-pulse mb-1">Neural Mapping...</p>
                          <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Spectral Deconstruction</p>
                       </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!isSimulating && detections.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 gap-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-800/40 flex items-center justify-center border border-white/5 shadow-xl group-hover:scale-105 transition-transform">
                      <Beaker className="w-4 h-4 opacity-20 text-white" />
                    </div>
                    <div className="text-center">
                       <p className="text-[6px] font-black uppercase tracking-[0.2em] text-white opacity-40 mb-0.5">Awaiting Specimen Input</p>
                       <p className="text-[5px] font-bold uppercase tracking-widest text-white opacity-20">Initialize diagnostic sequence</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scanline Effect */}
            {isSimulating && (
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/60 shadow-[0_0_30px_var(--primary)] animate-scanline z-50" />
            )}
          </div>

          {/* Legend & Filters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(Object.entries(CLASS_CONFIG) as [keyof typeof CLASS_CONFIG, any][]).map(([key, cfg]) => (
              <button 
                key={key}
                onClick={() => setSelectedClass(selectedClass === key ? null : key)}
                className={`dashboard-card p-3 transition-all duration-300 text-left group border ${
                  selectedClass === key 
                    ? 'bg-slate-900 border-primary shadow-xl shadow-primary/10' 
                    : 'bg-white border-transparent hover:border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-3 h-3 rounded-full ${cfg.color} shadow-md`} />
                  <Info className={`w-3 h-3 transition-colors ${selectedClass === key ? 'text-primary' : 'text-slate-300'}`} />
                </div>
                <p className={`text-[8px] font-black uppercase tracking-tight ${selectedClass === key ? 'text-white' : 'text-slate-900'}`}>{cfg.label}</p>
                <p className={`text-[7px] font-bold uppercase mt-1 ${selectedClass === key ? 'text-slate-500' : 'text-slate-400'}`}>
                  {key === 'colony' ? 'Target' : 'Artifact'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Panel */}
        <div className="lg:col-span-6 space-y-6">
          {/* Diagnostic Result Card */}
          <div className="dashboard-card p-6 relative overflow-hidden shadow-xl border-primary/10 rounded-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-[0.04] pointer-events-none">
              <ShieldCheck className="w-24 h-24 text-primary" />
            </div>
            
            <div className="flex items-center justify-between mb-6">
               <div className="space-y-0.5">
                  <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Analysis Certificate</h3>
                  <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Protocol: ISO-17025</p>
               </div>
               <div className="flex items-center gap-2 px-2.5 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Link Active</span>
               </div>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{stats.total}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-[8px] font-black text-primary uppercase tracking-widest">Valid CFU</p>
                  <p className="text-3xl font-black text-primary tracking-tighter">{stats.valid}</p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                 <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Accuracy</span>
                       <p className="text-base font-black text-slate-900">94.2% <span className="text-[8px] text-emerald-500 ml-1">↑ 2.4%</span></p>
                    </div>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Confidence</span>
                 </div>
                 <div className="w-full h-1.5 bg-white rounded-full overflow-hidden shadow-inner border border-slate-100">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '94.2%' }} />
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100/30 backdrop-blur-sm">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm flex-shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-[8px] font-black text-amber-900 uppercase tracking-widest">{stats.rejected} Rejected</p>
                     <p className="text-[7px] font-bold text-amber-700 uppercase leading-relaxed tracking-wider opacity-60">Filtered against spectral noise</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/30 backdrop-blur-sm">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-[8px] font-black text-emerald-900 uppercase tracking-widest">Compliant</p>
                     <p className="text-[7px] font-bold text-emerald-700 uppercase leading-relaxed tracking-wider opacity-60">Meets ISO-standard requirements</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-6 py-3.5 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-xl shadow-slate-900/20 group">
               <span className="flex items-center justify-center gap-2">
                  Export Global Ledger
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
               </span>
            </button>
          </div>

          {/* Quick Info */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
             <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
               <Zap className="w-32 h-32" />
             </div>
             <h4 className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-3">Kernel v4.2</h4>
             <p className="text-xs font-medium text-slate-300 leading-relaxed italic mb-6 border-l-2 border-primary/30 pl-4">
               "Utilizing YOLOv8 Neural Architecture for real-time biological object detection."
             </p>
             <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 backdrop-blur-md">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                   <Target className="w-4 h-4 text-slate-900" />
                </div>
                <div>
                   <p className="text-[7px] font-black uppercase tracking-widest text-slate-400">Mean Velocity</p>
                   <p className="text-sm font-bold text-white tracking-tight mt-0.5">240ms <span className="text-[9px] font-normal text-slate-500">/ seq</span></p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}


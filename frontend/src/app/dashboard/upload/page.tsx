'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload as UploadIcon,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  TrendingUp,
  Trash2,
  CheckCircle2,
  Info,
  FlaskConical,
  BookOpen,
  ChevronDown,
  X,
  Search,
  Copy,
  ExternalLink,
  ChevronRight,
  Lock
} from 'lucide-react'
import { analysesApi } from '@/lib/analyses-api'
import { MediaType } from '@/lib/types'
import { toast } from 'sonner'

export default function UploadPage() {
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDocs, setShowDocs] = useState(true)
  
  const handleCopyDocs = () => {
    const text = "ColonyAI Neural Protocol Documentation..."
    navigator.clipboard.writeText(text)
    toast.success('Documentation summary copied to clipboard')
  }
  const [formData, setFormData] = useState({
    sampleId: '',
    mediaType: 'Plate Count Agar' as MediaType,
    dilutionFactor: 0.001,
    platedVolume: 1.0,
  })

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0])
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('File size must be less than 10MB'); return }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) { toast.error('Please select a plate image'); return }
    if (!formData.sampleId.trim()) { toast.error('Please enter a Sample ID'); return }
    setIsSubmitting(true)
    try {
      toast.loading('Analyzing plate image...')
      const analysis = await analysesApi.create({
        sample_id: formData.sampleId,
        media_type: formData.mediaType,
        dilution_factor: formData.dilutionFactor,
        plated_volume_ml: formData.platedVolume,
        image: selectedFile,
      })
      toast.dismiss()
      toast.success(`Analysis complete: ${analysis.colony_count} colonies detected`)
      router.push(`/dashboard/results/${analysis.id}`)
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.response?.data?.detail || error.message || 'Analysis failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden">
      {/* Container for Main Content and Docs */}
      <div className="flex relative min-h-[calc(100vh-200px)]">
        {/* Main Workspace Area */}
        <div className={`flex-1 transition-all duration-300 ${showDocs ? 'lg:mr-[350px]' : ''}`}>
          <div className="max-w-[1500px] mx-auto px-8 py-8">
            {/* Page Header */}
            <div className="mb-10">
              <div className="flex items-center justify-between">
                 <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Intake</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">New Specimen Neural Processing // ISO-17025 Compliance</p>
                    
                    {!showDocs && (
                      <button
                        onClick={() => setShowDocs(true)}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100 hover:bg-blue-100 transition-all mt-4 animate-in fade-in"
                      >
                        <BookOpen className="w-3 h-3" />
                        Neural intake documentation
                      </button>
                    )}
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
               {/* Left: Image Upload */}
               <div className="dashboard-card flex flex-col p-6 rounded-xl min-h-[500px]">
                  {/* ... rest of image upload ... */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Plate Image</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">PNG, JPG up to 10MB</p>
            </div>
          </div>

          <div
            className={`flex-1 relative border-2 border-dashed rounded-xl transition-all duration-300 overflow-hidden min-h-[280px] flex items-center justify-center ${
              dragActive
                ? 'border-primary bg-primary/5 scale-[0.98]'
                : 'border-slate-200 hover:border-primary/50 bg-slate-50/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="relative group/preview w-full h-full">
                <img
                  src={preview}
                  alt="Plate Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setPreview(null) }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-rose-600 text-xs font-bold rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove Image
                  </button>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg border border-white/20">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="truncate">{selectedFile?.name}</span>
                    <span className="ml-auto flex-shrink-0 text-slate-400">
                      {(selectedFile ? selectedFile.size / 1024 / 1024 : 0).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-xl bg-white shadow-xl shadow-primary/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <UploadIcon className="h-6 w-6 text-primary" />
                </div>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-base font-bold text-primary hover:text-primary/80 transition-colors">
                    Click to upload
                  </span>
                  <span className="text-base text-slate-500 font-medium"> or drag and drop</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleChange} />
                </label>
                <p className="text-[8px] text-slate-400 mt-2 font-black uppercase tracking-widest">ISO-compliant images preferred</p>
              </div>
            )}
          </div>

          {/* ISO Tip */}
          <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
            <div className="p-1.5 bg-blue-500 rounded-lg">
              <Info className="h-3.5 w-3.5 text-white flex-shrink-0" />
            </div>
            <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
              ISO 17025 ADVISORY: Capture plates with uniform LED lighting at 45° angle for optimal neural detection.
            </p>
          </div>
        </div>

        {/* Middle: Protocol Form */}
        <div className="dashboard-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <FlaskConical className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Biological Protocol</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Parameters Configuration</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sample ID */}
            <div className="space-y-1.5">
              <label htmlFor="sampleId" className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Specimen Identifier <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="sampleId"
                required
                className="w-full px-4 py-2.5 text-xs font-bold text-slate-900 bg-slate-50/50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-slate-300"
                value={formData.sampleId}
                onChange={(e) => setFormData({ ...formData, sampleId: e.target.value })}
                placeholder="e.g., ISO-PCA-B2026-001"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="mediaType" className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Agar Media Matrix <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="mediaType"
                  required
                  className="w-full px-4 py-2.5 text-xs font-bold text-slate-900 bg-slate-50/50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all appearance-none cursor-pointer"
                  value={formData.mediaType}
                  onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as MediaType })}
                >
                  <option value="Plate Count Agar">PCA — Plate Count Agar</option>
                  <option value="VRBA">VRBA — Violet Red Bile Agar</option>
                  <option value="BGBB">BGBB — Brilliant Green Bile Broth</option>
                  <option value="R2A">R2A — Reasoner's 2A Agar</option>
                  <option value="TSA">TSA — Tryptic Soy Agar</option>
                  <option value="MacConkey">MAC — MacConkey Agar</option>
                  <option value="Other">Other Protocol</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="dilutionFactor" className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Dilution (10⁻ˣ) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="dilutionFactor"
                    required
                    className="w-full px-4 py-2.5 text-xs font-bold text-slate-900 bg-slate-50/50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all appearance-none cursor-pointer"
                    value={formData.dilutionFactor}
                    onChange={(e) => setFormData({ ...formData, dilutionFactor: parseFloat(e.target.value) })}
                  >
                    <option value="1">1 (Neat)</option>
                    <option value="0.1">10⁻¹ (1:10)</option>
                    <option value="0.01">10⁻² (1:100)</option>
                    <option value="0.001">10⁻³ (1:1000)</option>
                    <option value="0.0001">10⁻⁴ (1:10000)</option>
                    <option value="0.00001">10⁻⁵ (1:100000)</option>
                    <option value="0.000001">10⁻⁶ (1:1000000)</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="platedVolume" className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Volume (ml) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  id="platedVolume"
                  required
                  step="0.1"
                  min="0.1"
                  className="w-full px-4 py-2.5 text-xs font-bold text-slate-900 bg-slate-50/50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  value={formData.platedVolume}
                  onChange={(e) => setFormData({ ...formData, platedVolume: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!selectedFile || isSubmitting}
                className="w-full btn-primary py-3.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing Specimen...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    Initialize AI Audit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

            </div>
          </div>
        </div>

        {/* Right: Documentation Sidebar - FIXED TO RIGHT */}
        {showDocs && (
          <div className="w-80 lg:w-[350px] flex flex-col bg-white border-l border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300 fixed right-0 top-16 bottom-0 z-30">
             {/* Header Section */}
             <div className="px-4 py-4 border-b border-slate-100 flex items-center gap-3 bg-white sticky top-0 z-10">
                <button onClick={() => setShowDocs(false)} className="p-2 hover:bg-slate-50 rounded-lg transition-colors group flex-shrink-0">
                   <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
                </button>
                <div className="flex flex-col">
                   <h3 className="text-xl font-bold text-slate-900">Documentation</h3>
                   <a href="#" className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-1 font-black uppercase tracking-widest">
                      Go to full documentation <ExternalLink className="w-3 h-3" />
                   </a>
                </div>
             </div>

             {/* ColonyAI Style Docs Body */}
             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-white">
                {/* ... existing docs content ... */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                   <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
                         <FlaskConical className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-bold text-slate-800 tracking-tight">ColonyAI Docs</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toast('Neural Search engine initialized', { icon: '🔍' })}
                        className="p-1 hover:bg-slate-50 rounded transition-colors"
                      >
                        <Search className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-900" />
                      </button>
                      <button 
                        onClick={() => toast('Documentation index toggled', { icon: '📖' })}
                        className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                         <div className="w-3.5 h-[1.5px] bg-slate-600 relative before:absolute before:-top-1 before:left-0 before:w-3.5 before:h-[1.5px] before:bg-slate-600 after:absolute after:top-1 after:left-0 after:w-3.5 after:h-[1.5px] after:bg-slate-600" />
                      </button>
                   </div>
                </div>

                <div className="flex items-center gap-2 p-1 bg-white rounded-md border border-slate-200 w-fit shadow-sm">
                   <button className="flex items-center gap-2 px-2.5 py-1 text-[9px] font-bold text-slate-700 bg-slate-50 rounded-md border border-slate-200 hover:bg-slate-100 transition-colors">
                      On this page <ChevronRight className="w-3 h-3" />
                   </button>
                   <span className="text-[9px] font-bold text-slate-800 px-2">Overview</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                   <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                      <span>Directory</span>
                      <ChevronRight className="w-2.5 h-2.5" />
                      <span className="text-slate-600 font-bold uppercase tracking-tighter">Neural Protocol</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <button 
                        onClick={handleCopyDocs}
                        className="flex items-center gap-1.5 px-2 py-1 border border-slate-200 rounded text-[9px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                      >
                         <Copy className="w-3 h-3" /> Copy
                      </button>
                   </div>
                </div>
                
                <div className="space-y-10">
                   {/* Title Section */}
                   <div>
                      <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3">ColonyAI Neural Protocol</h1>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">Standard Operating Procedure (SOP) for laboratory specimen intake and neural audit sequence.</p>
                   </div>
                   
                   {/* 1. Overview */}
                   <section className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">01</span>
                         <h2 className="text-lg font-bold text-slate-900 tracking-tight">Overview: Intelligence Intake</h2>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                         Sistem Intelligence Intake adalah gerbang utama pemrosesan spesimen biologis menggunakan mesin saraf ColonyAI. Protokol ini dirancang untuk memenuhi standar akurasi tinggi yang dipersyaratkan oleh ISO-17025.
                      </p>
                   </section>

                   {/* 2. Tata Cara Penggunaan */}
                   <section className="space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">02</span>
                         <h2 className="text-lg font-bold text-slate-900 tracking-tight">Tata Cara Penggunaan</h2>
                      </div>
                      <div className="space-y-6 ml-1">
                         {[
                           { id: '1', title: 'Identifikasi Spesimen', desc: 'Masukkan kode unik pada kolom Specimen Identifier (contoh: ISO-PCA-B2026-001) untuk pelacakan data.' },
                           { id: '2', title: 'Pilih Media Matrix', desc: 'Tentukan jenis media agar yang digunakan pada menu drop-down. Setiap media memiliki fungsi spesifik:', list: [
                              'PCA (Plate Count Agar): Total mikroba hidup (TPC).',
                              'VRBA (Violet Red Bile Agar): Deteksi Coliform/Enterobacteriaceae.',
                              'BGBB: Konfirmasi gas pada kelompok Coliform.',
                              'R2A Agar: Bakteri heterotrofik sampel air.',
                              'TSA (Tryptic Soy Agar): Pertumbuhan mikroba umum.',
                              'MacConkey (MAC): Isolasi bakteri Gram-negatif.'
                           ]},
                           { id: '3', title: 'Konfigurasi Dilusi', desc: 'Pilih faktor pengenceran yang sesuai (contoh: 10 pangkat minus 3) untuk perhitungan otomatis.' },
                           { id: '4', title: 'Atur Volume Sampel', desc: 'Input volume sampel dalam satuan ml yang telah ditanam pada media agar.' },
                           { id: '5', title: 'Inisialisasi Audit', desc: 'Klik tombol Initialize AI Audit untuk memulai proses pemindaian saraf secara real-time.' }
                         ].map((step) => (
                           <div key={step.id} className="flex gap-4 group">
                              <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-900 text-white text-[11px] font-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                 {step.id}
                              </span>
                              <div className="space-y-1.5">
                                 <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                                 <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                                 {step.list && (
                                   <ul className="mt-2 space-y-1.5 border-l-2 border-slate-100 pl-4 py-1">
                                      {step.list.map((item, idx) => (
                                        <li key={idx} className="text-[11px] text-slate-400 font-medium list-none">• {item}</li>
                                      ))}
                                   </ul>
                                 )}
                              </div>
                           </div>
                         ))}
                      </div>
                   </section>

                   {/* 3. Image Standards */}
                   <section className="space-y-4 pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                         <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">03</span>
                         <h2 className="text-lg font-bold text-slate-900 tracking-tight">Image Standards</h2>
                      </div>
                      <div className="space-y-4">
                         {[
                           { label: 'Resolusi', val: 'Minimal 300 DPI untuk akurasi optimal.' },
                           { label: 'Pencahayaan', val: 'Sudut lampu LED 45 derajat.' },
                           { label: 'Format', val: 'PNG atau JPG (Max 10MB).' }
                         ].map((item, i) => (
                           <div key={i} className="flex flex-col gap-1 pb-3 border-b border-slate-50 last:border-0">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                              <span className="text-xs font-bold text-slate-700">{item.val}</span>
                           </div>
                         ))}
                      </div>
                   </section>

                   {/* 4. Neural Detection Classes */}
                   <section className="space-y-4 pt-4">
                      <div className="flex items-center gap-2 mb-3">
                         <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">04</span>
                         <h2 className="text-lg font-bold text-slate-900 tracking-tight">Neural Detection Classes</h2>
                      </div>
                      <div className="space-y-4">
                         {[
                           { name: 'Common Bacteria', desc: 'Koloni standar dengan batas jelas.' },
                           { name: 'Yeast (Ragi)', desc: 'Koloni cembung dan opak.' },
                           { name: 'Mold (Kapang)', desc: 'Koloni berfilamen menyebar.' },
                           { name: 'Spreader Colonies', desc: 'Pertumbuhan mikroba meluas.' },
                           { name: 'Artifacts', desc: 'Partikel non-biologis diabaikan.' }
                         ].map((cls, i) => (
                           <div key={i} className="group">
                              <div className="flex items-center gap-2 mb-1">
                                 <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                                 <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{cls.name}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium pl-3.5">{cls.desc}</p>
                           </div>
                         ))}
                      </div>
                   </section>

                   {/* Status Alerts Section */}
                   <div className="space-y-4 pt-6">
                      <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-4 shadow-sm">
                         <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                            <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center">
                               <TrendingUp className="w-3 h-3 text-white" />
                            </div>
                         </div>
                         <div className="space-y-1">
                            <p className="text-xs font-black text-emerald-900 uppercase tracking-widest">Protocol Status: GA</p>
                            <p className="text-[11px] text-emerald-700 leading-relaxed font-semibold">
                               Tingkat presisi saat ini mencapai 99.8 persen pada media PCA standar laboratorium.
                            </p>
                         </div>
                      </div>

                      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex gap-4 shadow-xl">
                         <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                            <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                               <Lock className="w-3 h-3 text-white" />
                            </div>
                         </div>
                         <div className="space-y-1">
                            <p className="text-xs font-black text-white uppercase tracking-widest">ColonyAI Vault</p>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                               Seluruh data dienkripsi dan disimpan untuk kepatuhan data jangka panjang sesuai ISO-17025.
                            </p>
                         </div>
                      </div>
                   </div>

                   {/* Footer Links Section */}
                   <div className="pt-10 pb-8 border-t border-slate-100 mt-6 space-y-6">
                      <div className="grid grid-cols-2 gap-y-4">
                         {[
                           'Support', 'System status', 'Careers', 'Terms of Use', 
                           'Report Security Issues', 'Privacy Policy'
                         ].map((link, i) => (
                           <a key={i} href="#" className="text-[11px] text-slate-400 hover:text-primary transition-colors font-bold uppercase tracking-tight">
                              {link}
                           </a>
                         ))}
                      </div>

                      <div className="flex items-center gap-3 py-2 px-3 bg-white border border-slate-200 rounded-xl w-fit cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                         <div className="flex">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white -mr-1" />
                            <div className="w-2.5 h-2.5 rounded-full bg-white border border-blue-500" />
                         </div>
                         <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Cookie Preferences</span>
                      </div>

                      <div className="pt-2">
                         <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">
                            © 2026 ColonyAI, Inc.
                         </p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}


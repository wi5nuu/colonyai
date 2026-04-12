'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload as UploadIcon, Camera, Image as ImageIcon, AlertCircle, Loader2, TrendingUp, Trash2 } from 'lucide-react'
import { analysesApi } from '@/lib/analyses-api'
import { MediaType } from '@/lib/types'
import { toast } from 'sonner'

export default function UploadPage() {
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    sampleId: '',
    mediaType: 'Plate Count Agar' as MediaType,
    dilutionFactor: 0.001,
    platedVolume: 1.0,
  })

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error('Please select a plate image')
      return
    }

    if (!formData.sampleId.trim()) {
      toast.error('Please enter a Sample ID')
      return
    }

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

      // Navigate to results page
      router.push(`/dashboard/results/${analysis.id}`)
    } catch (error: any) {
      toast.dismiss()
      const message = error.response?.data?.detail || 'Analysis failed. Please try again.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spectral Input Section (Upload) */}
        <div className="card p-8 border-primary/20 bg-primary/[0.02]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/20 rounded-xl text-primary shadow-lg shadow-primary/10">
               <UploadIcon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight uppercase">Spectral Input Stream</h2>
          </div>

          <div
            className={`relative group border-2 border-dashed rounded-3xl p-1 transition-all duration-500 overflow-hidden ${
              dragActive
                ? 'border-primary bg-primary/10 scale-[1.02]'
                : 'border-border/50 hover:border-primary/40 bg-muted/20'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="relative group/preview">
                <img
                  src={preview}
                  alt="Spectral Preview"
                  className="w-full h-80 object-cover rounded-[22px] transition-all duration-500 group-hover/preview:brightness-75"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                   <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreview(null)
                    }}
                    className="btn-secondary h-12 px-6 flex items-center bg-rose-500 border-rose-600 text-white hover:bg-rose-600 hover:scale-105 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Purge Cache
                  </button>
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-white/90 uppercase tracking-widest border border-white/10">
                   {selectedFile?.name} | {(selectedFile ? selectedFile.size / 1024 / 1024 : 0).toFixed(2)} MB
                </div>
              </div>
            ) : (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="relative mb-6">
                   <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
                   <div className="relative h-20 w-20 flex items-center justify-center bg-background rounded-2xl border border-border shadow-2xl">
                      <ImageIcon className="h-10 w-10 text-primary" />
                   </div>
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer font-black text-primary hover:text-primary/80 text-lg uppercase tracking-tight group"
                  >
                    <span>Bind Visual Entity</span>
                    <div className="h-0.5 w-full bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleChange} />
                  </label>
                  <p className="text-muted-foreground mt-2 font-bold text-sm tracking-tight">Drop Petri-Plate image into the field of view</p>
                </div>
                <div className="mt-6 flex gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                   <span>PNG</span>
                   <span>JPG</span>
                   <span>RAW</span>
                </div>
              </div>
            )}
            
            {/* Scanner line effect when drag active */}
            {dragActive && (
               <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_#0ea5e9] animate-bounce z-10" />
            )}
          </div>

          <div className="mt-8 flex items-start p-6 bg-primary/5 rounded-2xl border border-primary/10">
            <Camera className="h-5 w-5 text-primary mr-4 mt-1" />
            <div className="text-xs">
              <p className="font-black text-foreground uppercase tracking-wider mb-1">Optical Precision Requirement</p>
              <p className="text-muted-foreground font-semibold leading-relaxed">
                Ensure top-down orthogonal alignment. Uniform diffuse lighting reduces artifact interference during neural classification.
              </p>
            </div>
          </div>
        </div>

        {/* Metadata Form Section */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500 shadow-lg shadow-amber-500/10">
               <AlertCircle className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight uppercase">Biological Protocol Definition</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="sampleId" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                Specimen ID Entity <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="sampleId"
                required
                className="input bg-background/50 border-border/50 font-bold text-sm focus:ring-primary/20"
                value={formData.sampleId}
                onChange={(e) => setFormData({ ...formData, sampleId: e.target.value })}
                placeholder="e.g., ISO-PROTO-B2026"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="mediaType" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                Agar Media Protocol <span className="text-rose-500">*</span>
              </label>
              <select
                id="mediaType"
                required
                className="input bg-background/50 border-border/50 font-bold text-sm"
                value={formData.mediaType}
                onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as MediaType })}
              >
                <option value="Plate Count Agar">PCA - (Plate Count Agar)</option>
                <option value="VRBA">VRBA - (Violet Red Bile Agar)</option>
                <option value="BGBB">BGBB - (Brilliant Green Bile Broth)</option>
                <option value="R2A">R2A - (Reasoners 2A Agar)</option>
                <option value="TSA">TSA - (Tryptic Soy Agar)</option>
                <option value="MacConkey">MAC - (MacConkey Agar)</option>
                <option value="Other">OTHER PROTOCOL</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label htmlFor="dilutionFactor" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                  Dilution (1:X) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  id="dilutionFactor"
                  required
                  step="0.000001"
                  min="0.000001"
                  className="input bg-background/50 border-border/50 font-bold text-sm"
                  value={formData.dilutionFactor}
                  onChange={(e) => setFormData({ ...formData, dilutionFactor: parseFloat(e.target.value) })}
                />
                <p className="text-[8px] font-bold text-muted-foreground/60 uppercase mt-1 tracking-widest pl-1">
                   Ex: 10<sup className="text-[6px]">-3</sup> = 0.001
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="platedVolume" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                  Volume (ml) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  id="platedVolume"
                  required
                  step="0.1"
                  min="0.1"
                  className="input bg-background/50 border-border/50 font-bold text-sm"
                  value={formData.platedVolume}
                  onChange={(e) => setFormData({ ...formData, platedVolume: parseFloat(e.target.value) })}
                />
                <p className="text-[8px] font-bold text-muted-foreground/60 uppercase mt-1 tracking-widest pl-1">
                   Std. P-Volume 1.0ml
                </p>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={!selectedFile || isSubmitting}
                className="w-full btn-primary h-14 text-sm font-black uppercase tracking-[0.2em] disabled:opacity-30 flex items-center justify-center shadow-primary/30 group overflow-hidden relative"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Executing Neural Engine...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5 mr-3 group-hover:scale-125 transition-transform" />
                    Initiate Spectral Analysis
                  </>
                )}
                <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[45deg] group-hover:left-[100%] transition-all duration-1000 ease-in-out" />
              </button>
            </div>
          </form>

          <div className="mt-8 p-6 bg-amber-500/5 rounded-2xl border border-amber-500/10">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-4 mt-0.5" />
              <div className="text-xs">
                <p className="font-black text-amber-500 uppercase tracking-wider mb-1">Queue Notification</p>
                <p className="text-muted-foreground font-semibold leading-relaxed">
                  Neural inference typically fulfills in <span className="text-foreground">~45 seconds</span>. You will be automatically vectored to the detailed spectral results ledger upon task completion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

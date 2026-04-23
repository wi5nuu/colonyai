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
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">New Analysis</h1>
        <p className="text-slate-500 mt-1.5">Upload a petri plate image for AI-powered colony detection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Image Upload */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Plate Image</h2>
              <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
            </div>
          </div>

          <div
            className={`flex-1 relative border-2 border-dashed rounded-xl transition-colors duration-150 overflow-hidden ${
              dragActive
                ? 'border-orange-400 bg-orange-50'
                : 'border-slate-200 hover:border-orange-300 bg-slate-50/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="relative group/preview h-64">
                <img
                  src={preview}
                  alt="Plate Preview"
                  className="w-full h-full object-cover rounded-[10px]"
                />
                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity duration-150 rounded-[10px]">
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setPreview(null) }}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Remove Image
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-slate-900/70 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{selectedFile?.name}</span>
                    <span className="ml-auto flex-shrink-0 text-slate-300">
                      {(selectedFile ? selectedFile.size / 1024 / 1024 : 0).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center h-64">
                <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4">
                  <UploadIcon className="h-7 w-7 text-slate-400" />
                </div>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">
                    Click to upload
                  </span>
                  <span className="text-sm text-slate-500"> or drag and drop</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleChange} />
                </label>
                <p className="text-xs text-slate-400 mt-2">Petri plate images: PNG, JPG, JPEG, WEBP</p>
              </div>
            )}
          </div>

          {/* ISO Tip */}
          <div className="mt-4 flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              For best accuracy, capture plates with uniform lighting under an ISO 17025-compliant laboratory setup.
            </p>
          </div>
        </div>

        {/* Right: Protocol Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Biological Protocol</h2>
              <p className="text-xs text-slate-500">SA-001 Standard Parameters</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Sample ID */}
            <div className="space-y-1.5">
              <label htmlFor="sampleId" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Specimen ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="sampleId"
                required
                className="w-full px-4 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                value={formData.sampleId}
                onChange={(e) => setFormData({ ...formData, sampleId: e.target.value })}
                placeholder="e.g., ISO-PCA-B2026-001"
              />
            </div>

            {/* Media Type */}
            <div className="space-y-1.5">
              <label htmlFor="mediaType" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Agar Media Protocol <span className="text-rose-500">*</span>
              </label>
              <select
                id="mediaType"
                required
                className="w-full px-4 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer"
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
            </div>

            {/* Dilution & Volume */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="dilutionFactor" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Dilution (10⁻ˣ) <span className="text-rose-500">*</span>
                </label>
                <select
                  id="dilutionFactor"
                  required
                  className="w-full px-4 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer"
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
                <p className="text-[10px] text-slate-400 font-medium pl-1 italic">Scientific Notation Required</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="platedVolume" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Plated Volume (ml) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  id="platedVolume"
                  required
                  step="0.1"
                  min="0.1"
                  className="w-full px-4 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  value={formData.platedVolume}
                  onChange={(e) => setFormData({ ...formData, platedVolume: parseFloat(e.target.value) })}
                />
                <p className="text-[11px] text-slate-400 font-medium pl-1">Standard: 1.0 ml</p>
              </div>
            </div>

            {/* Alert if no file */}
            {!selectedFile && (
              <div className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-700 font-medium">Please upload a plate image before submitting.</p>
              </div>
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!selectedFile || isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors duration-150 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing with YOLOv8...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5" />
                    Run AI Analysis
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

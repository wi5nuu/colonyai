'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload as UploadIcon, Camera, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react'
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
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upload Plate Image
          </h2>

          <div
            className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
              dragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-contain rounded-lg"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {selectedFile?.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreview(null)
                    }}
                    className="text-sm text-error-600 hover:text-error-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleChange}
                    />
                  </label>
                  <p className="text-gray-600 mt-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG, WEBP up to 10MB
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center p-4 bg-blue-50 rounded-lg">
            <Camera className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium">Tip for best results</p>
              <p className="text-gray-600">
                Take photos from directly above the plate with good, even lighting.
                Avoid shadows and glare.
              </p>
            </div>
          </div>
        </div>

        {/* Metadata Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Sample Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="sampleId" className="label">
                Sample ID <span className="text-error-600">*</span>
              </label>
              <input
                type="text"
                id="sampleId"
                required
                className="input"
                value={formData.sampleId}
                onChange={(e) => setFormData({ ...formData, sampleId: e.target.value })}
                placeholder="e.g., FOOD-2026-001"
              />
            </div>

            <div>
              <label htmlFor="mediaType" className="label">
                Media Type <span className="text-error-600">*</span>
              </label>
              <select
                id="mediaType"
                required
                className="input"
                value={formData.mediaType}
                onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as MediaType })}
              >
                <option value="Plate Count Agar">Plate Count Agar (PCA)</option>
                <option value="VRBA">VRBA (Violet Red Bile Agar)</option>
                <option value="BGBB">BGBB (Brilliant Green Bile Broth)</option>
                <option value="R2A">R2A Agar</option>
                <option value="TSA">TSA (Tryptic Soy Agar)</option>
                <option value="MacConkey">MacConkey Agar</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="dilutionFactor" className="label">
                Dilution Factor <span className="text-error-600">*</span>
              </label>
              <input
                type="number"
                id="dilutionFactor"
                required
                step="0.000001"
                min="0.000001"
                className="input"
                value={formData.dilutionFactor}
                onChange={(e) => setFormData({ ...formData, dilutionFactor: parseFloat(e.target.value) })}
              />
              <p className="mt-1 text-xs text-gray-500">
                Example: 0.001 for 1:1000 dilution
              </p>
            </div>

            <div>
              <label htmlFor="platedVolume" className="label">
                Plated Volume (ml) <span className="text-error-600">*</span>
              </label>
              <input
                type="number"
                id="platedVolume"
                required
                step="0.1"
                min="0.1"
                className="input"
                value={formData.platedVolume}
                onChange={(e) => setFormData({ ...formData, platedVolume: parseFloat(e.target.value) })}
              />
              <p className="mt-1 text-xs text-gray-500">
                Typically 0.1 ml or 1.0 ml
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={!selectedFile || isSubmitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Start Analysis'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-warning-50 rounded-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-warning-600 mr-2 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium">Note</p>
                <p className="text-gray-600">
                  Analysis typically takes 1-2 minutes. You'll be redirected to results when ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

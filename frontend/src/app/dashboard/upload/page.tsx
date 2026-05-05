"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  Lock,
} from "lucide-react";
import { analysesApi } from "@/lib/analyses-api";
import { MediaType } from "@/lib/types";
import { toast } from "sonner";
import {
  DocumentationSidebar,
  DocumentationToggle,
} from "@/components/DocumentationSidebar";
import { useTranslationStore } from "@/lib/i18n/store";

export default function UploadPage() {
  const { t } = useTranslationStore();
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDocs, setShowDocs] = useState(true);

  const [formData, setFormData] = useState({
    sampleId: "",
    mediaType: "Plate Count Agar" as MediaType,
    dilutionFactor: 0.001,
    platedVolume: 1.0,
    incubationTemp: 35.0,
    incubationTime: 48,
    methodStandard: "ISO 4833-1:2013",
    mediaBatchNumber: "",
    incubatorId: "INC-001",
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("upload.errorImageFile"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("upload.errorFileSize"));
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error(t("upload.errorSelectImage"));
      return;
    }
    if (!formData.sampleId.trim()) {
      toast.error(t("upload.errorSampleId"));
      return;
    }
    setIsSubmitting(true);
    try {
      toast.loading(t("upload.analyzingImage"));
      const analysis = await analysesApi.create({
        sample_id: formData.sampleId,
        media_type: formData.mediaType,
        dilution_factor: formData.dilutionFactor,
        plated_volume_ml: formData.platedVolume,
        incubation_temp: formData.incubationTemp,
        incubation_time_hours: formData.incubationTime,
        method_standard: formData.methodStandard,
        media_batch_number: formData.mediaBatchNumber,
        incubator_id: formData.incubatorId,
        image: selectedFile,
      });
      toast.dismiss();
      toast.success(
        `${t("upload.analysisComplete")}: ${analysis.colony_count} ${t("upload.coloniesDetected")}`,
      );
      router.push(`/dashboard/results/${analysis.id}`);
    } catch (error: any) {
      toast.dismiss();
      toast.error(
        error.response?.data?.detail ||
          error.message ||
          t("upload.analysisFailed"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden">
      {/* Container for Main Content and Docs */}
      <div className="flex relative min-h-[calc(100vh-200px)]">
        {/* Main Workspace Area */}
        <div
          className={`flex-1 transition-all duration-300 ${showDocs ? "lg:mr-[350px]" : ""}`}
        >
          <div className="max-w-[1500px] mx-auto px-1 sm:px-2 py-0 sm:py-0">
            {/* Page Header */}
            <div className="flex flex-row items-center justify-between gap-1 pb-1 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-slate-50 border border-slate-200 rounded-md shadow-sm flex items-center justify-center flex-shrink-0">
                  <UploadIcon className="w-2.5 h-2.5 text-primary" />
                </div>
                <div>
                  <h1 className="text-[10px] sm:text-lg font-bold text-slate-900 tracking-tight uppercase leading-none">
                    {t("upload.title")}
                  </h1>
                  <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-0.5 hidden sm:block">
                    {t("upload.subtitle")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <DocumentationToggle
                  showDocs={showDocs}
                  setShowDocs={setShowDocs}
                />
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-md shadow-sm">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-[8px] sm:text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">
                    Awaiting Input
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-8 items-start">
              {/* Left: Image Upload */}
              <div className="bg-white border border-slate-200/60 flex flex-col p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 sm:gap-4 mb-3">
                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                    <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-[9px] sm:text-[11px] font-black text-slate-900 uppercase tracking-widest">
                      {t("upload.plateImage")}
                    </h2>
                    <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">
                      {t("upload.imageRules")}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex-1 relative border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden min-h-[140px] sm:min-h-[320px] flex items-center justify-center ${
                    dragActive
                      ? "border-primary bg-primary/5 scale-[0.99]"
                      : "border-slate-200 hover:border-primary/50 bg-slate-50/50"
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
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-all duration-300">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreview(null);
                          }}
                          className="flex items-center gap-3 px-6 py-3 bg-white text-rose-600 text-xs font-black uppercase tracking-widest rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />{" "}
                          {t("upload.removeImage")}
                        </button>
                      </div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-white/95 backdrop-blur-md text-slate-900 text-[11px] font-black px-5 py-4 rounded-2xl flex items-center gap-4 shadow-xl border border-white/20 uppercase tracking-widest">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {selectedFile?.name}
                          </span>
                          <span className="ml-auto flex-shrink-0 text-slate-400 font-mono">
                            {(selectedFile
                              ? selectedFile.size / 1024 / 1024
                              : 0
                            ).toFixed(2)}{" "}
                            MB
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-5 sm:p-12 text-center group">
                      <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-xl shadow-primary/10 flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 transition-transform duration-500 border border-slate-100">
                        <UploadIcon className="h-5 w-5 sm:h-8 sm:w-8 text-primary" />
                      </div>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-[9px] sm:text-[11px] font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">
                          {t("upload.clickToUpload")}
                        </span>
                        <span className="text-[9px] sm:text-[11px] text-slate-400 font-black uppercase tracking-widest">
                          {" "}
                          {t("upload.dragAndDrop")}
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleChange}
                        />
                      </label>
                      <p className="text-[8px] text-slate-400 mt-2 font-black uppercase tracking-[0.2em]">
                        {t("upload.isoPreferred")}
                      </p>
                    </div>
                  )}
                </div>

                {/* ISO Tip */}
                <div className="mt-2 sm:mt-8 flex items-start gap-2 sm:gap-4 p-2 sm:p-5 bg-blue-50/50 border border-blue-100 rounded-xl sm:rounded-2xl">
                  <div className="p-1 sm:p-2 bg-blue-100 rounded-lg sm:rounded-xl flex-shrink-0 border border-blue-200">
                    <Info className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                  </div>
                  <p className="text-[8px] sm:text-[9px] text-blue-700 font-bold leading-relaxed uppercase tracking-tight sm:tracking-widest">
                    {t("upload.isoAdvisory")}
                  </p>
                </div>
              </div>

              {/* Middle: Protocol Form */}
              <div className="bg-white border border-slate-200/60 p-3 sm:p-8 rounded-xl sm:rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-8">
                  <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                    <FlaskConical className="h-4 w-4 sm:h-6 sm:w-6 text-slate-400" />
                  </div>
                  <div>
                    <h2 className="text-[9px] sm:text-[11px] font-black text-slate-900 uppercase tracking-widest">
                      {t("upload.biologicalProtocol")}
                    </h2>
                    <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">
                      {t("upload.parametersConfig")}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-2 sm:space-y-4"
                >
                  {/* Sample ID */}
                  <div className="space-y-1">
                    <label
                      htmlFor="sampleId"
                      className="text-[8px] font-black text-slate-900 uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1"
                    >
                      {t("upload.specimenIdentifier")} *
                    </label>
                    <input
                      type="text"
                      id="sampleId"
                      required
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-[10px] sm:text-[11px] font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300 shadow-sm"
                      value={formData.sampleId}
                      onChange={(e) =>
                        setFormData({ ...formData, sampleId: e.target.value })
                      }
                      placeholder="e.g., ISO-PCA-B2026-001"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="mediaType"
                      className="text-[8px] font-black text-slate-900 uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1"
                    >
                      {t("upload.agarMediaMatrix")} *
                    </label>
                    <div className="relative">
                      <select
                        id="mediaType"
                        required
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer shadow-sm"
                        value={formData.mediaType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mediaType: e.target.value as MediaType,
                          })
                        }
                      >
                        <option value="Plate Count Agar">
                          PCA — Plate Count Agar
                        </option>
                        <option value="VRBA">
                          VRBA — Violet Red Bile Agar
                        </option>
                        <option value="BGBB">
                          BGBB — Brilliant Green Bile Broth
                        </option>
                        <option value="R2A">R2A — Reasoner's 2A Agar</option>
                        <option value="TSA">TSA — Tryptic Soy Agar</option>
                        <option value="MacConkey">MAC — MacConkey Agar</option>
                        <option value="Other">
                          {t("upload.otherProtocol")}
                        </option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-6">
                    <div className="space-y-1">
                      <label
                        htmlFor="dilutionFactor"
                        className="text-[8px] font-black text-slate-900 uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1"
                      >
                        {t("upload.dilutionFactor")} *
                      </label>
                      <div className="relative">
                        <select
                          id="dilutionFactor"
                          required
                          className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer shadow-sm"
                          value={formData.dilutionFactor}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dilutionFactor: parseFloat(e.target.value),
                            })
                          }
                        >
                          <option value="1">{t("upload.neat")}</option>
                          <option value="0.1">10⁻¹ (1:10)</option>
                          <option value="0.01">10⁻² (1:100)</option>
                          <option value="0.001">10⁻³ (1:1000)</option>
                          <option value="0.0001">10⁻⁴ (1:10000)</option>
                          <option value="0.00001">10⁻⁵ (1:100000)</option>
                          <option value="0.000001">10⁻⁶ (1:1000000)</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="platedVolume"
                        className="text-[8px] font-black text-slate-900 uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1"
                      >
                        {t("upload.volume")} *
                      </label>
                      <input
                        type="number"
                        id="platedVolume"
                        required
                        step="0.1"
                        min="0.1"
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        value={formData.platedVolume}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            platedVolume: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* ISO Compliance: Incubation & Method */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-6 pt-2">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-900 uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1">
                        Incubation Temp (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        value={formData.incubationTemp}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            incubationTemp: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-900 uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1">
                        Time (Hours)
                      </label>
                      <input
                        type="number"
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        value={formData.incubationTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            incubationTime: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-900 uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1">
                      Method Standard (ISO)
                    </label>
                    <input
                      type="text"
                      className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                      value={formData.methodStandard}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          methodStandard: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Traceability: Batch & Incubator */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-900 uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1">
                        Media Batch/Lot #
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., LOT-2026-X"
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        value={formData.mediaBatchNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mediaBatchNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-900 uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1">
                        Incubator ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., INC-01"
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        value={formData.incubatorId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            incubatorId: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-1 sm:pt-4 flex justify-center sm:block">
                    <button
                      type="submit"
                      disabled={!selectedFile || isSubmitting}
                      className="w-auto sm:w-full min-w-[150px] sm:min-w-0 bg-primary text-slate-900 px-3 py-1.5 sm:py-2.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] flex items-center justify-center gap-1.5 sm:gap-3 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group mx-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3 w-3 sm:h-5 sm:w-5 animate-spin" />
                          {t("upload.analyzingSpecimen")}
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-3 w-3 sm:h-5 sm:w-5 text-slate-900 transition-colors" />
                          {t("upload.initializeAiAudit")}
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
        <div className="hidden lg:block">
          <DocumentationSidebar
            showDocs={showDocs}
            setShowDocs={setShowDocs}
            directory={t("upload.docsToggle")}
            title={t("upload.docsTitle")}
            description={t("upload.docsDescription")}
            rawText={`PROTOKOL SARAF COLONYAI - SOP ISO-17025
==========================================

1. OVERVIEW: INTELLIGENCE INTAKE
Gerbang utama pemrosesan spesimen biologis menggunakan mesin saraf ColonyAI. Dirancang untuk akurasi tinggi ISO-17025.

2. TATA CARA PEMASUKAN GAMBAR
- Klik area unggah atau seret file PNG/JPG (Max 10MB).
- Pastikan cawan petri berada di tengah frame.
- Pencahayaan LED 45 derajat sangat disarankan untuk deteksi koloni yang akurat.
- Resolusi minimal 300 DPI.

3. KONFIGURASI PARAMETER (PROTOKOL BIOLOGIS)
A. PENGIDENTIFIKASI SPESIMEN: Kunci utama pelacakan (Traceability). Masukkan kode unik laboratorium (e.g., ISO-PCA-B2026-001).
B. MATRIKS MEDIA AGAR: Menentukan target mikroba.
   - PCA: Total mikroba umum.
   - VRBA/BGBB: Kelompok Coliform.
   - R2A: Bakteri air/stres.
   - TSA/MAC: Pertumbuhan umum/Gram-negatif.
C. FAKTOR PENGENCERAN: 10^-1 sampai 10^-6. Menjamin jumlah koloni 30-300 CFU untuk validitas statistik.
D. VOLUME (ML): Volume sampel yang diplating.
E. PARAMETER INKUBASI:
   - Incubation Temp: Suhu ideal pertumbuhan mikroba (misal: 35°C). Cara isi: Masukkan angka suhu operasional inkubator.
   - Time (Hours): Durasi inkubasi (misal: 48 jam). Cara isi: Hitung total waktu sejak spesimen masuk hingga pembacaan.
F. KEPATUHAN & TRACEABILITY:
   - Method Standard (ISO): Referensi metode resmi (e.g., ISO 4833-1:2013). Cara isi: Kode standar ISO yang digunakan sebagai acuan.
   - Media Batch/Lot #: Nomor produksi media agar. Cara isi: Lihat pada label kemasan media. Penting untuk validasi kualitas media.
   - Incubator ID: Identitas mesin inkubator (e.g., INC-001). Cara isi: Masukkan ID alat untuk audit distribusi suhu.

4. NEURAL DETECTION CLASSES
- Common Bacteria: Koloni standar.
- Yeast (Ragi): Cembung & opak.
- Mold (Kapang): Berfilamen.
- Spreader: Pertumbuhan meluas.
- Artifacts: Partikel non-biologis diabaikan AI.

STATUS: GA (General Availability)
PRESISI: 99.8% pada PCA Standard.`}
          >
            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  01
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">
                  Overview: Intelligence Intake
                </h2>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                Sistem Intelligence Intake adalah gerbang utama pemrosesan
                spesimen biologis menggunakan mesin saraf ColonyAI. Protokol ini
                dirancang untuk memenuhi standar akurasi tinggi yang
                dipersyaratkan oleh ISO-17025.
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  02
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">
                  Protokol Konfigurasi Detail
                </h2>
              </div>
              <div className="space-y-4 ml-0.5">
                {[
                  {
                    id: "1",
                    title: "Pengidentifikasi Spesimen (Traceability)",
                    desc: "Alasan: Merupakan kunci utama pelacakan data (Data Integrity) sesuai ISO-17025. Cara: Masukkan kode unik laboratorium. Jika tidak ada, sistem akan menolak sinkronisasi audit.",
                  },
                  {
                    id: "2",
                    title: "Matriks Media Agar (Selectivity)",
                    desc: "Alasan: Menentukan target mikroba yang dianalisis oleh AI. Jenis:",
                    list: [
                      "PCA: Untuk Total Plate Count (TPC) umum.",
                      "VRBA/BGBB: Spesifik untuk kelompok Coliform/E.coli.",
                      "R2A: Khusus bakteri stres/heterotrofik pada air.",
                      "TSA/MAC: Untuk pertumbuhan umum atau selektif Gram-negatif.",
                    ],
                  },
                  {
                    id: "3",
                    title: "Faktor Pengenceran (Dilution)",
                    desc: "Alasan: Memastikan jumlah koloni berada pada rentang hitung (30-300 CFU). Cara: Pilih tingkat dilusi sesuai SOP preparasi sampel (10⁻¹ hingga 10⁻⁶).",
                  },
                  {
                    id: "4",
                    title: "Parameter Inkubasi & Volume",
                    desc: "Alasan: Kondisi lingkungan (Suhu & Waktu) menentukan kecepatan pertumbuhan saraf koloni. Volume (ml) digunakan AI sebagai pembagi hasil akhir CFU/ml atau CFU/g.",
                    list: [
                      "Incubation Temp: Masukkan suhu operasional (e.g. 35°C).",
                      "Time (Hours): Total durasi spesimen dalam inkubator (e.g. 48 jam).",
                    ],
                  },
                  {
                    id: "5",
                    title: "Kepatuhan Audit (Batch & Method)",
                    desc: "Alasan: Menjamin ketertelusuran penuh (Full Traceability) sesuai standar audit ISO-17025.",
                    list: [
                      "Method Standard: Kode referensi ISO (e.g. ISO 4833).",
                      "Media Batch/Lot: Nomor produksi media agar untuk validasi kualitas.",
                      "Incubator ID: Kode unit alat untuk pelacakan distribusi suhu.",
                    ],
                  },
                ].map((step) => (
                  <div key={step.id} className="flex gap-2.5 group">
                    <span className="flex-shrink-0 w-4.5 h-4.5 rounded bg-slate-50 border border-slate-200 text-slate-900 text-[8px] font-bold flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      {step.id}
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-[10px] font-bold text-slate-900">
                        {step.title}
                      </h4>
                      <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
                        {step.desc}
                      </p>
                      {step.list && (
                        <ul className="mt-1 space-y-1 border-l border-slate-100 pl-2.5 py-0.5">
                          {step.list.map((item, idx) => (
                            <li
                              key={idx}
                              className="text-[8px] text-slate-400 font-medium list-none"
                            >
                              • {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  03
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">
                  Image Standards
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: "Resolusi",
                    val: "Minimal 300 DPI untuk akurasi optimal.",
                  },
                  { label: "Pencahayaan", val: "Sudut lampu LED 45 derajat." },
                  { label: "Format", val: "PNG atau JPG (Max 10MB)." },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-0.5 pb-2 border-b border-slate-50 last:border-0"
                  >
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      {item.label}
                    </span>
                    <span className="text-[9px] font-bold text-slate-700">
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-2 pt-2">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  04
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">
                  Neural Detection Classes
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  {
                    name: "Common Bacteria",
                    desc: "Koloni standar dengan batas jelas.",
                  },
                  { name: "Yeast (Ragi)", desc: "Koloni cembung dan opak." },
                  {
                    name: "Mold (Kapang)",
                    desc: "Koloni berfilamen menyebar.",
                  },
                  {
                    name: "Spreader Colonies",
                    desc: "Pertumbuhan mikroba meluas.",
                  },
                  {
                    name: "Artifacts",
                    desc: "Partikel non-biologis diabaikan.",
                  },
                ].map((cls, i) => (
                  <div key={i} className="group">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-1 h-1 rounded-full bg-slate-900" />
                      <span className="text-[9px] font-black text-slate-900 uppercase tracking-tight">
                        {cls.name}
                      </span>
                    </div>
                    <p className="text-[8px] text-slate-500 font-medium pl-2.5">
                      {cls.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-3 pt-4">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex gap-3 shadow-sm">
                <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                  <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">
                    Protocol Status: GA
                  </p>
                  <p className="text-[9px] text-emerald-700 leading-relaxed font-semibold">
                    Tingkat presisi saat ini mencapai 99.8 persen pada media PCA
                    standar laboratorium.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 shadow-sm">
                <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                  <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Lock className="w-2.5 h-2.5 text-primary" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">
                    ColonyAI Vault
                  </p>
                  <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
                    Seluruh data dienkripsi dan disimpan untuk kepatuhan data
                    jangka panjang sesuai ISO-17025.
                  </p>
                </div>
              </div>
            </div>
          </DocumentationSidebar>
        </div>
      </div>
    </div>
  );
}

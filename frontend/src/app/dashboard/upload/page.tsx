"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
import { useThemeStore } from "@/lib/theme-store";

export default function UploadPage() {
  const { t } = useTranslationStore();
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  // Smart defaults per media type
  const MEDIA_DEFAULTS: Record<string, { temp: number; time: number; method: string }> = {
    PCA:       { temp: 35.0, time: 48,  method: "ISO 4833-1:2013" },
    TSA:       { temp: 37.0, time: 24,  method: "AOAC 990.12" },
    MacConkey: { temp: 37.0, time: 24,  method: "ISO 4832:2006" },
    VRBA:      { temp: 37.0, time: 24,  method: "ISO 4832:2006" },
    BGBB:      { temp: 37.0, time: 48,  method: "ISO 9308-1:2014" },
    R2A:       { temp: 20.0, time: 168, method: "APHA 9215D" },
    SDA:       { temp: 25.0, time: 120, method: "ISO 21527-1:2008" },
    EMB:       { temp: 37.0, time: 24,  method: "ISO 16649-2:2001" },
    Blood:     { temp: 37.0, time: 48,  method: "CLSI M35-A2" },
    OTHER:     { temp: 37.0, time: 24,  method: "" },
  };

  // Auto-generate sample ID: ISO-{MEDIA}-{YYYYMMDD}-{SEQ}
  const generateSampleId = (media: string) => {
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const seq = String(Math.floor(Math.random() * 900) + 100);
    return `ISO-${media}-${ymd}-${seq}`;
  };

  const [formData, setFormData] = useState({
    sampleId: generateSampleId("PCA"),
    mediaType: "PCA" as MediaType,
    dilutionFactor: 0.1,
    platedVolume: 1.0,
    incubationTemp: 35.0,
    incubationTime: 48,
    methodStandard: "ISO 4833-1:2013",
    mediaBatchNumber: "",
    incubatorId: "",
  });

  // CFU/ml preview realtime: CFU/ml = colonies / (dilution * volume)
  // Estimated colony count from filename hints; actual count comes from AI
  const cfuPreview = useMemo(() => {
    const { dilutionFactor, platedVolume } = formData;
    if (!dilutionFactor || !platedVolume) return null;
    const divisor = dilutionFactor * platedVolume;
    // Example: 150 colonies (placeholder) → real value comes from AI result
    const exampleColonies = 150;
    const cfu = exampleColonies / divisor;
    return cfu.toExponential(2);
  }, [formData.dilutionFactor, formData.platedVolume]);

  // Auto-fill defaults when media type changes
  const handleMediaTypeChange = (media: string) => {
    const defaults = MEDIA_DEFAULTS[media] || MEDIA_DEFAULTS.OTHER;
    setFormData((prev) => ({
      ...prev,
      mediaType: media as MediaType,
      incubationTemp: defaults.temp,
      incubationTime: defaults.time,
      methodStandard: defaults.method,
      sampleId: generateSampleId(media),
    }));
  };

  const handleFile = useCallback((file: File) => {
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
  }, [t]);

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
  }, [handleFile]);

  const handleSampleClick = async (samplePath: string, fileName: string) => {
    try {
      const response = await fetch(samplePath);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: "image/jpeg" });
      handleFile(file);
      toast.success(`Loaded sample: ${fileName}`);
    } catch (error) {
      toast.error("Failed to load sample image");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
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

  if (!mounted) return null;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative">
      {/* Container for Main Content and Docs */}
      <div className="flex relative min-h-[calc(100vh-200px)]">
        {/* Main Workspace Area */}
        <div className="flex-1 transition-all duration-300">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-8 py-0 sm:py-0 space-y-4 sm:space-y-6 pb-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 sm:mb-6 pt-0">
              <div>
                <h1 className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                  {t("upload.title")}
                </h1>
                <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
                  {t("upload.subtitle")}
                </p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <DocumentationToggle
                  showDocs={showDocs}
                  setShowDocs={setShowDocs}
                />
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none shadow-sm">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-[8px] sm:text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">
                    Awaiting Input
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-8 items-stretch">
              {/* Left: Image Upload */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col p-3 sm:p-5 rounded-none sm:rounded-none shadow-sm h-full">
                <div className="flex items-center gap-2 sm:gap-4 mb-3">
                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-none bg-primary/5 dark:bg-primary/10 flex items-center justify-center border border-primary/10 dark:border-primary/20">
                    <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-[9px] sm:text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                      {t("upload.plateImage")}
                    </h2>
                    <p className="text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">
                      {t("upload.imageRules")}
                    </p>
                  </div>
                </div>

                <div
                  className={`relative border-2 border-dashed rounded-none transition-all duration-300 overflow-hidden min-h-[140px] h-[140px] sm:h-[320px] flex items-center justify-center ${
                    dragActive
                      ? "border-primary bg-primary/5 dark:bg-primary/10 scale-[0.99]"
                      : "border-slate-200 dark:border-slate-800 hover:border-primary/50 bg-slate-50/50 dark:bg-slate-900/50"
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
                          className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest rounded-none shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />{" "}
                          {t("upload.removeImage")}
                        </button>
                      </div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white text-[11px] font-black px-5 py-4 rounded-none flex items-center gap-4 shadow-xl border border-white/20 dark:border-slate-800 uppercase tracking-widest transition-colors">
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
                      <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-none bg-white dark:bg-slate-900 shadow-xl shadow-primary/10 flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 transition-transform duration-500 border border-slate-100 dark:border-slate-800">
                        <UploadIcon className="h-5 w-5 sm:h-8 sm:w-8 text-primary" />
                      </div>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-[9px] sm:text-[11px] font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">
                          {t("upload.clickToUpload")}
                        </span>
                        <span className="text-[9px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
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
                      <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-2 font-black uppercase tracking-[0.2em]">
                        {t("upload.isoPreferred")}
                      </p>
                    </div>
                  )}
                </div>

                {/* ISO Tip */}
                <div className="mt-2 sm:mt-8 flex items-start gap-2 sm:gap-4 p-2 sm:p-5 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-none sm:rounded-none transition-colors">
                  <div className="p-1 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-none sm:rounded-none flex-shrink-0 border border-blue-200 dark:border-blue-800">
                    <Info className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-[8px] sm:text-[9px] text-blue-700 dark:text-blue-300 font-bold leading-relaxed uppercase tracking-tight sm:tracking-widest">
                    {t("upload.isoAdvisory")}
                  </p>
                </div>

                {/* Sample Images Section */}
                <div className="mt-4 sm:mt-6">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-[8px] sm:text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon className="w-3 h-3 text-primary" />
                      Test Samples
                    </h3>
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">
                      Tap to load
                    </span>
                  </div>
                  <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {[
                      { file: 'colony_small.jpg', label: 'Single Colony', badge: 'Single', color: '#059669' },
                      { file: 'merged.jpg', label: 'Merged Colony', badge: 'Merged', color: '#d97706' },
                      { file: 'bubble_artifact.jpg', label: 'Bubble Artifact', badge: 'Bubble', color: '#2563eb' },
                      { file: 'crack.jpg', label: 'Media Crack', badge: 'Crack', color: '#7c3aed' },
                      { file: 'ecoli_dense.jpg', label: 'Dense E. coli', badge: 'E.coli', color: '#0891b2' },
                      { file: 'dust.jpg', label: 'Dust Debris', badge: 'Dust', color: '#64748b' },
                    ].map((sample, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSampleClick(`/samples/${sample.file}`, sample.file)}
                        className="flex-shrink-0 group relative w-24 h-24 rounded-none overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-primary transition-all shadow-sm active:scale-95"
                        title={sample.label}
                      >
                        <img
                          src={`/samples/${sample.file}`}
                          alt={sample.label}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <div className="text-center px-2">
                            <span className="text-[7px] font-black text-white uppercase tracking-tighter block">
                              Load
                            </span>
                          </div>
                        </div>
                        <div className="absolute top-0 left-0 right-0 py-0.5 text-[6px] font-black text-white uppercase text-center"
                          style={{ background: sample.color }}
                        >
                          {sample.badge}
                        </div>
                      </button>
                    ))}
                  </div>
                  <style jsx>{`
                    .no-scrollbar::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                </div>
              </div>

              {/* Middle: Protocol Form */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-3 sm:p-8 rounded-none sm:rounded-none shadow-sm transition-colors h-full flex flex-col">
                <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                  <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-none sm:rounded-none bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                    <FlaskConical className="h-4 w-4 sm:h-6 sm:w-6 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div>
                    <h2 className="text-[9px] sm:text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                      {t("upload.biologicalProtocol")}
                    </h2>
                    <p className="text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">
                      {t("upload.parametersConfig")}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-2 sm:space-y-4 flex-1 flex flex-col"
                >
                  <div className="flex-1 space-y-2 sm:space-y-4">
                  {/* Sample ID */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between ml-1">
                      <label
                        htmlFor="sampleId"
                        className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] sm:tracking-[0.2em]"
                      >
                        {t("upload.specimenIdentifier")} *
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, sampleId: generateSampleId(p.mediaType) }))}
                        className="text-[7px] font-bold text-primary hover:text-primary/70 uppercase tracking-widest flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Auto-generate
                      </button>
                    </div>

                    <input
                      type="text"
                      id="sampleId"
                      required
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm"
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
                      className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1"
                    >
                      {t("upload.agarMediaMatrix")} *
                    </label>

                    <div className="relative">
                      <select
                        id="mediaType"
                        required
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer shadow-sm"
                        value={formData.mediaType}
                         onChange={(e) => handleMediaTypeChange(e.target.value)}
                      >
                        <option value="PCA">
                          PCA — Plate Count Agar
                        </option>
                        <option value="TSA">TSA — Tryptic Soy Agar</option>
                        <option value="MacConkey">MAC — MacConkey Agar</option>
                        <option value="VRBA">
                          VRBA — Violet Red Bile Agar
                        </option>
                        <option value="BGBB">
                          BGBB — Brilliant Green Bile Broth
                        </option>
                        <option value="R2A">R2A — Reasoner's 2A Agar</option>
                        <option value="SDA">SDA — Sabouraud Dextrose Agar</option>
                        <option value="EMB">EMB — Eosin Methylene Blue</option>
                        <option value="Blood">Blood Agar</option>
                        <option value="OTHER">
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
                        className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1"
                      >
                        {t("upload.dilutionFactor")} *
                      </label>

                      <div className="relative">
                        <select
                          id="dilutionFactor"
                          required
                          className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer shadow-sm"
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
                        className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1"
                      >
                        {t("upload.volume")} *
                      </label>

                      <input
                        type="number"
                        id="platedVolume"
                        required
                        step="0.1"
                        min="0.1"
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
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

                  {/* CFU/ml Preview Realtime */}
                  {cfuPreview && (
                    <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-none">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span className="text-[8px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                          CFU/ml Estimate
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 font-mono">
                          ~{cfuPreview} CFU/ml
                        </span>
                        <span className="text-[7px] text-emerald-500 dark:text-emerald-600 uppercase tracking-widest">
                          (based on 150 col.)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ISO Compliance: Incubation & Method */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-6 pt-2">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1">
                        Incubation Temp (°C)
                      </label>

                      <input
                        type="number"
                        step="0.1"
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
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
                      <label className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1">
                        Time (Hours)
                      </label>

                      <input
                        type="number"
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
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
                    <label className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1">
                      Method Standard (ISO)
                    </label>

                    <input
                      type="text"
                      className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
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
                      <label className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1">
                        Media Batch/Lot #
                      </label>

                      <input
                        type="text"
                        placeholder="e.g., LOT-2026-X"
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
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
                      <label className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] ml-1">
                        Incubator ID
                      </label>

                      <input
                        type="text"
                        placeholder="e.g., INC-01"
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
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
                  </div>

                  {/* Submit */}
                  <div className="pt-1 sm:pt-4 flex justify-center sm:block mt-auto">
                    <button
                      type="submit"
                      disabled={!selectedFile || isSubmitting}
                      className="w-auto sm:w-full min-w-[150px] sm:min-w-0 bg-primary text-slate-900 px-3 py-1.5 sm:py-2.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] flex items-center justify-center gap-1.5 sm:gap-3 rounded-none shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group mx-auto"
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
            rawText={`COLONYAI NEURAL PROTOCOL - SOP ISO-17025
==========================================

1. OVERVIEW: INTELLIGENCE INTAKE
Primary gateway for processing biological specimens using the ColonyAI neural engine. Designed for ISO-17025 high-accuracy standards.

2. IMAGE UPLOAD PROCEDURE
- Click the upload area or drag and drop PNG/JPG files (Max 10MB).
- Ensure the petri dish is centered in the frame.
- 45-degree LED lighting is highly recommended for accurate colony detection.
- Minimum resolution of 300 DPI.

3. PARAMETER CONFIGURATION (BIOLOGICAL PROTOCOL)
A. SPECIMEN IDENTIFIER: Primary traceability key. Enter the unique laboratory code (e.g., ISO-PCA-B2026-001).
B. AGAR MEDIA MATRIX: Determines microbial target.
   - PCA: General total microbes.
   - VRBA/BGBB: Coliform group.
   - R2A: Water/stressed bacteria.
   - TSA/MAC: General growth/Gram-negative.
C. DILUTION FACTOR: 10^-1 to 10^-6. Ensures 30-300 CFU colony count for statistical validity.
D. VOLUME (ML): Volume of plated sample.
E. INCUBATION PARAMETERS:
   - Incubation Temp: Ideal microbial growth temperature (e.g., 35°C). How to fill: Enter the incubator's operational temperature.
   - Time (Hours): Incubation duration (e.g., 48 hours). How to fill: Calculate total time from specimen entry to reading.
F. COMPLIANCE & TRACEABILITY:
   - Method Standard (ISO): Official method reference (e.g., ISO 4833-1:2013). How to fill: ISO standard code used as reference.
   - Media Batch/Lot #: Agar media production number. How to fill: Check the media packaging label. Important for media quality validation.
   - Incubator ID: Incubator machine identity (e.g., INC-001). How to fill: Enter equipment ID for temperature distribution audit.

4. AI DETECTION CLASSES (5-Class YOLOv8)
- colony_single: Single separate colony (counted)
- colony_merged: Stacked colony (SA-001 area estimation)
- bubble: Air bubble (ignored)
- dust_debris: Dust/particle (ignored)
- media_crack: Agar crack (ignored)

STATUS: GA (General Availability)
PRECISION: 94.1% mAP@0.5 on 8+ media types.`}
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
              <p className="text-[10px] text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-sm border border-slate-100">
                The Intelligence Intake System is the main gateway for processing
                biological specimens using the ColonyAI neural engine. This protocol
                is designed to meet the high accuracy standards
                required by ISO-17025.
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                  02
                </span>
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">
                  Detailed Configuration Protocol
                </h2>
              </div>
              <div className="space-y-4 ml-0.5">
                {[
                  {
                    id: "1",
                    title: "Specimen Identifier (Traceability)",
                    desc: `${t("upload.purposeLabel")} ${t("upload.descSampleIdPurpose")} ${t("upload.inputLabel")} ${t("upload.descSampleIdInput")} ${t("upload.resultLabel")} ${t("upload.descSampleIdResult")}`,
                  },
                  {
                    id: "2",
                    title: "Matriks Media Agar (Selectivity)",
                    desc: `${t("upload.purposeLabel")} ${t("upload.descMediaPurpose")} ${t("upload.inputLabel")} ${t("upload.descMediaInput")} ${t("upload.resultLabel")} ${t("upload.descMediaResult")}`,
                    list: [
                      "PCA: For general Total Plate Count (TPC).",
                      "VRBA/BGBB: Specific for Coliform/E.coli group.",
                      "R2A: Specific for stressed/heterotrophic bacteria in water.",
                      "TSA/MAC: For general growth or Gram-negative selective.",
                    ],
                  },
                  {
                    id: "3",
                    title: "Faktor Pengenceran (Dilution)",
                    desc: `${t("upload.purposeLabel")} ${t("upload.descDilutionPurpose")} ${t("upload.inputLabel")} ${t("upload.descDilutionInput")} ${t("upload.resultLabel")} ${t("upload.descDilutionResult")}`,
                  },
                  {
                    id: "4",
                    title: "Volume & Parameter Inkubasi",
                    desc: `${t("upload.purposeLabel")} Normalize count and record physical conditions.`,
                    list: [
                      `Volume: ${t("upload.descVolumeInput")} -> ${t("upload.descVolumeResult")}`,
                      `Temperature: ${t("upload.descTempInput")} -> ${t("upload.descTempResult")}`,
                      `Time: ${t("upload.descTimeInput")} -> ${t("upload.descTimeResult")}`,
                    ],
                  },
                  {
                    id: "5",
                    title: "Audit Compliance (Batch & Method)",
                    desc: "Ensures full traceability according to ISO-17025 audit standards.",
                    list: [
                      `Standard: ${t("upload.descMethodInput")} -> ${t("upload.descMethodResult")}`,
                      `Batch/Lot: ${t("upload.descBatchInput")} -> ${t("upload.descBatchResult")}`,
                      `Incubator: ${t("upload.descIncubatorInput")} -> ${t("upload.descIncubatorResult")}`,
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
                    label: "Resolution",
                    val: "Minimum 300 DPI for optimal accuracy.",
                  },
                  { label: "Lighting", val: "45-degree LED lamp angle." },
                  { label: "Format", val: "PNG or JPG (Max 10MB)." },
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
                    name: "colony_single",
                    desc: "Single separate colony — counted in CFU/ml.",
                    color: "bg-emerald-500",
                  },
                  {
                    name: "colony_merged",
                    desc: "Stacked colony — SA-001 estimation.",
                    color: "bg-amber-500",
                  },
                  {
                    name: "bubble",
                    desc: "Air bubble — excluded from count.",
                    color: "bg-rose-500",
                  },
                  {
                    name: "dust_debris",
                    desc: "Dust/particle — excluded from count.",
                    color: "bg-slate-400",
                  },
                  {
                    name: "media_crack",
                    desc: "Agar media crack — excluded from count.",
                    color: "bg-violet-500",
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
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-sm flex gap-3 shadow-sm">
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
                    Current precision level reaches 99.8 percent on standard
                    laboratory PCA media.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm flex gap-3 shadow-sm">
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
                    All data is encrypted and stored for long-term data
                    compliance per ISO-17025.
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

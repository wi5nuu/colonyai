"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Loader2,
  FlaskConical,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { analysesApi } from "@/lib/analyses-api";
import { reportsApi } from "@/lib/reports-api";
import { ALL_DEMO_ANALYSES } from "@/lib/demo-data";
import { DocumentationSidebar, DocumentationToggle } from "@/components/DocumentationSidebar";
import { useTranslationStore } from "@/lib/i18n/store";
import { toast } from "sonner";
import { AnalysisListResponse, MediaType, ReportType } from "@/lib/types";

const USE_DEMO_DATA = true; // Set to false to use real data

export default function HistoryPage() {
  const { t } = useTranslationStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [mediaFilter, setMediaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [data, setData] = useState<AnalysisListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showDocs, setShowDocs] = useState(true);
  const pageSize = 10;

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        if (USE_DEMO_DATA) {
          // Simulation: Filter demo data
          let filtered = [...ALL_DEMO_ANALYSES];
          
          if (searchTerm) {
            filtered = filtered.filter(a => a.sample_id.toLowerCase().includes(searchTerm.toLowerCase()));
          }
          if (mediaFilter !== "all") {
            filtered = filtered.filter(a => a.media_type === mediaFilter);
          }
          if (statusFilter !== "all") {
            if (statusFilter === "valid") filtered = filtered.filter(a => a.status === 'completed' && a.is_valid_for_reporting);
            else if (statusFilter === "TNTC") filtered = filtered.filter(a => a.warnings?.some(w => w.includes("TNTC")));
            else if (statusFilter === "TFTC") filtered = filtered.filter(a => a.warnings?.some(w => w.includes("TFTC")));
          }

          const total = filtered.length;
          const totalPages = Math.ceil(total / pageSize);
          const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));

          setData({
            analyses: paginated,
            total,
            page,
            page_size: pageSize,
            total_pages: totalPages
          });
        } else {
          const result = await analysesApi.list({
            page,
            page_size: pageSize,
            search: searchTerm || undefined,
            media_type: mediaFilter !== "all" ? (mediaFilter as MediaType) : undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
          });
          setData(result);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.detail || t('history.errorLoadHistory'));
      } finally {
        setIsLoading(false);
      }
    };
    const debounce = setTimeout(loadHistory, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, mediaFilter, statusFilter, page]);

  const handleViewAnalysis = (id: string) => router.push(`/dashboard/results/${id}`);

  const handleExportCsv = async () => {
    if (!data?.analyses || data.analyses.length === 0) { toast.error(t('history.errorNoAnalyses')); return; }
    try {
      const report = await reportsApi.generateCsv({ report_type: "custom" as ReportType, format: "csv" });
      await reportsApi.downloadReport(report.url.split("/").pop() || "latest");
      toast.success(t('history.successExportCsv'));
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t('history.errorExportCsv'));
    }
  };

  const handleDelete = async (id: string, sampleId: string) => {
    if (!window.confirm(t('history.confirmDelete').replace('{id}', sampleId))) return;
    try {
      await analysesApi.delete(id);
      toast.success(t('history.successDelete'));
      const result = await analysesApi.list({ page, page_size: pageSize, search: searchTerm || undefined, media_type: mediaFilter !== "all" ? (mediaFilter as MediaType) : undefined, status: statusFilter !== "all" ? statusFilter : undefined });
      setData(result);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t('history.errorDelete'));
    }
  };

  const formatCFU = (cfu: number | null, warnings: string[] | null) => {
    if (warnings?.some(w => w.includes("TNTC"))) return "TNTC";
    if (warnings?.some(w => w.includes("TFTC"))) return "TFTC";
    if (cfu === null) return "—";
    if (cfu >= 10000) return cfu.toExponential(2);
    return cfu.toLocaleString();
  };

  const analyses = data?.analyses || [];
  const totalPages = data?.total_pages || 1;
  const total = data?.total || 0;

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-sm font-bold text-slate-500 uppercase tracking-widest">{t('history.scanningArchives')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        <div className={`flex-1 transition-all duration-300 ${showDocs ? 'lg:mr-[350px]' : ''}`}>
          <div className="max-w-[1500px] mx-auto px-6 py-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-9 h-9 bg-slate-900 rounded-lg shadow-xl flex items-center justify-center">
                      <History className="w-4 h-4 text-primary" />
                   </div>
                   <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('history.title')}</h1>
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t('history.subtitle')}</p>
                <DocumentationToggle showDocs={showDocs} setShowDocs={setShowDocs} text={t('history.docsToggle')} />
              </div>
        <button
          onClick={handleExportCsv}
          className="btn-primary flex items-center gap-2 py-2.5 px-5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          <Download className="h-4 w-4" />
          {t('history.exportCsv')}
        </button>
      </div>

      {/* Filters & Search */}
      <div className="dashboard-card p-4 mb-8 bg-slate-50/50 border-slate-100/50 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder={t('history.searchPlaceholder')}
              className="w-full pl-12 pr-4 py-2.5 text-xs font-bold text-slate-900 bg-white border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          {/* Media Filter */}
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              className="w-full pl-12 pr-8 py-2.5 text-xs font-bold text-slate-900 bg-white border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all appearance-none cursor-pointer"
              value={mediaFilter}
              onChange={(e) => { setMediaFilter(e.target.value); setPage(1); }}
            >
              <option value="all">{t('history.allMedia')}</option>
              <option value="Plate Count Agar">{t('history.pcaProtocol')}</option>
              <option value="VRBA">{t('history.vrbaProtocol')}</option>
              <option value="BGBB">{t('history.bgbbProtocol')}</option>
              <option value="R2A">{t('history.r2aProtocol')}</option>
              <option value="TSA">{t('history.tsaProtocol')}</option>
              <option value="MacConkey">{t('history.macProtocol')}</option>
            </select>
          </div>
          {/* Status Filter */}
          <div className="relative min-w-[160px]">
            <select
              className="w-full px-4 py-2.5 text-xs font-bold text-slate-900 bg-slate-50/50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="all">{t('history.allStatuses')}</option>
              <option value="valid">{t('history.verifiedOnly')}</option>
              <option value="TNTC">{t('history.criticalTNTC')}</option>
              <option value="TFTC">{t('history.traceTFTC')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="dashboard-card overflow-hidden !p-0 rounded-xl">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div>
            <h2 className="text-sm font-bold text-slate-900">{t('history.archives')}</h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{total} {t('history.recordsFound')}</p>
          </div>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>

        {/* Empty State */}
        {!isLoading && analyses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 rounded-[3rem] bg-slate-50 flex items-center justify-center mb-8 shadow-inner border border-slate-100">
              <History className="h-10 w-10 text-slate-300" />
            </div>
            <div className="space-y-2">
               <p className="text-xl font-bold text-slate-900 tracking-tight">{t('history.noRecords')}</p>
               <p className="text-sm text-slate-400 font-medium uppercase tracking-widest">{t('history.adjustFilters')}</p>
            </div>
            <button 
              onClick={() => { setSearchTerm(''); setMediaFilter('all'); setStatusFilter('all'); }}
              className="mt-8 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity border-b border-primary pb-1"
            >
               {t('history.resetFilters')}
            </button>
          </div>
        )}

        {/* Table */}
        {analyses.length > 0 && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50">
                  {[t('history.tableSpecimenId'), t('history.tableProtocol'), t('history.tableCount'), t('history.tableCfuMl'), t('history.tableConfidence'), t('history.tableTimestamp'), t('history.tableAuditStatus'), t('history.tableActions')].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {analyses.map((analysis: any) => (
                  <tr key={analysis.id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                    {/* Specimen ID */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300 flex-shrink-0">
                          <FlaskConical className="h-3.5 w-3.5 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-900">{analysis.sample_id}</p>
                          <p className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">{t('history.node')}: {analysis.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    {/* Media */}
                    <td className="px-8 py-5">
                      <span className="px-3 py-1.5 bg-slate-100/50 text-slate-600 rounded-lg text-xs font-bold tracking-tight">
                        {analysis.media_type}
                      </span>
                    </td>
                    {/* Colony Count */}
                    <td className="px-8 py-5 text-sm font-bold text-slate-900">{analysis.colony_count}</td>
                    {/* CFU/ml */}
                    <td className="px-8 py-5">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                        analysis.warnings?.some((w: any) => w.includes("TNTC"))
                          ? "bg-rose-50 text-rose-600 border-rose-100 shadow-sm shadow-rose-100"
                          : analysis.warnings?.some((w: any) => w.includes("TFTC"))
                          ? "bg-amber-50 text-amber-600 border-amber-100"
                          : "bg-slate-50 text-slate-700 border-slate-100"
                      }`}>
                        {formatCFU(analysis.cfu_per_ml, analysis.warnings)}
                      </span>
                    </td>
                    {/* Confidence */}
                    <td className="px-8 py-5">
                      <div className="w-24">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase">
                            {(analysis.confidence_score * 100).toFixed(0)}{t('history.reliable')}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${analysis.confidence_score >= 0.85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${analysis.confidence_score * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    {/* Date */}
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-800">
                        {new Date(analysis.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                        {new Date(analysis.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                    {/* Status Badge */}
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border ${
                        analysis.status === "completed" && analysis.is_valid_for_reporting
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100"
                          : analysis.warnings?.some((w: any) => w.includes("TNTC"))
                          ? "bg-rose-50 text-rose-600 border-rose-100"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {analysis.status === "completed" 
                          ? (analysis.is_valid_for_reporting ? t('history.verified') : (analysis.warnings?.some((w: any) => w.includes("TNTC")) ? t('history.tntcCritical') : t('history.reviewRequired'))) 
                          : analysis.status}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewAnalysis(analysis.id)}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                          title={t('history.viewIntelligence')}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-100/10 transition-all"
                          title={t('history.exportAudit')}
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(analysis.id, analysis.sample_id)}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-100/10 transition-all"
                          title={t('history.purgeRecord')}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/30 border-t border-slate-50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {t('history.showing')} <span className="text-slate-900">{(page - 1) * pageSize + 1} – {Math.min(page * pageSize, total)}</span> {t('history.of')} <span className="text-slate-900">{total}</span> {t('history.specimens')}
            </p>
            <div className="flex items-center gap-2">
              <button
                className="p-2.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  if (pageNum > totalPages || pageNum < 1) return null;
                  return (
                    <button
                      key={pageNum}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        pageNum === page
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                className="p-2.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
            </div>
          </div>
        </div>
        <DocumentationSidebar 
          showDocs={showDocs} 
          setShowDocs={setShowDocs}
          directory="Diagnostics History"
          title={t('history.docsTitle')}
          description={t('history.docsDescription')}
        >
          {/* 1. Overview */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">01</span>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Overview</h2>
             </div>
             <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                Halaman Analysis History merupakan arsip lengkap dari semua spesimen yang telah diproses oleh jaringan saraf ColonyAI. Arsip ini berfungsi sebagai bukti audit untuk keperluan pelaporan ISO-17025.
             </p>
          </section>

          {/* 2. Cara Penggunaan */}
          <section className="space-y-6">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">02</span>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Tata Cara Penggunaan</h2>
             </div>
             <div className="space-y-6 ml-1">
                {[
                  { id: '1', title: 'Pencarian Spesimen', desc: 'Gunakan kolom pencarian (Search by ID or Matrix) untuk melacak ID Spesimen secara instan.' },
                  { id: '2', title: 'Filter Media & Status', desc: 'Saring arsip berdasarkan jenis media (PCA, VRBA, dll) atau status (Completed, Failed) untuk audit spesifik.' },
                  { id: '3', title: 'Review Detail', desc: 'Klik icon mata (View) pada kolom aksi untuk meninjau kembali hasil audit saraf (CFU, gambar asli vs overlay).' },
                  { id: '4', title: 'Ekspor Data', desc: 'Klik tombol Export Intelligence untuk mengunduh laporan CSV seluruh histori sebagai lampiran audit.' }
                ].map((step) => (
                  <div key={step.id} className="flex gap-4 group">
                     <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-900 text-white text-[11px] font-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        {step.id}
                     </span>
                     <div className="space-y-1.5">
                        <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                        <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </section>
        </DocumentationSidebar>
      </div>
    </div>
  );
}

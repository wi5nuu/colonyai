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
import { DocumentationSidebar, DocumentationToggle } from "@/components/DocumentationSidebar";
import { useTranslationStore } from "@/lib/i18n/store";
import { toast } from "sonner";
import { AnalysisListResponse, MediaType, ReportType } from "@/lib/types";

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
          const result = await analysesApi.list({
            page,
            page_size: pageSize,
            search: searchTerm || undefined,
            media_type: mediaFilter !== "all" ? (mediaFilter as MediaType) : undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
          });
          setData(result);
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
          <div className="max-w-[1500px] mx-auto px-2 py-2 sm:px-6 sm:py-8">
            {/* Page Header */}
            <div className="flex flex-row items-center justify-between gap-2 pb-2 sm:pb-6 border-b border-slate-100 mb-3 sm:mb-8">
              <div className="flex items-center gap-1.5 sm:gap-3">
                <div className="w-5 h-5 sm:w-10 sm:h-10 bg-slate-900 rounded-md sm:rounded-xl shadow-xl flex items-center justify-center flex-shrink-0">
                  <History className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-primary" />
                </div>
                <div>
                  <h1 className="text-[11px] sm:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{t('history.title')}</h1>
                  <p className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-0.5">{t('history.subtitle')}</p>
                </div>
              </div>
              <button onClick={handleExportCsv} className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1 py-1 sm:py-2.5 px-2 sm:px-5 rounded-lg sm:rounded-xl text-[7px] sm:text-[10px] font-black uppercase tracking-wider transition-all shadow-sm flex-shrink-0">
                <Download className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-slate-400" />
                <span className="hidden sm:inline">{t('history.exportCsv')}</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200/60 p-2 sm:p-4 mb-3 sm:mb-8 rounded-xl sm:rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
            <input type="text" placeholder={t('history.searchPlaceholder')}
              className="w-full pl-7 sm:pl-12 pr-3 py-1.5 sm:py-3 text-[10px] sm:text-[13px] font-bold text-slate-900 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-300"
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} />
          </div>
          <div className="grid grid-cols-2 sm:flex gap-2">
            <select className="w-full sm:min-w-[200px] pl-3 sm:pl-12 pr-2 py-1.5 sm:py-3 text-[9px] sm:text-[11px] font-black text-slate-900 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl outline-none appearance-none cursor-pointer uppercase tracking-wider"
              value={mediaFilter} onChange={(e) => { setMediaFilter(e.target.value); setPage(1); }}>
              <option value="all">{t('history.allMedia')}</option>
              <option value="Plate Count Agar">{t('history.pcaProtocol')}</option>
              <option value="VRBA">{t('history.vrbaProtocol')}</option>
              <option value="BGBB">{t('history.bgbbProtocol')}</option>
              <option value="R2A">{t('history.r2aProtocol')}</option>
              <option value="TSA">{t('history.tsaProtocol')}</option>
              <option value="MacConkey">{t('history.macProtocol')}</option>
            </select>
            <select className="w-full sm:min-w-[150px] px-3 py-1.5 sm:py-3 text-[9px] sm:text-[11px] font-black text-slate-900 bg-slate-50 border border-slate-100 rounded-lg sm:rounded-xl outline-none appearance-none cursor-pointer uppercase tracking-wider"
              value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">{t('history.allStatuses')}</option>
              <option value="valid">{t('history.verifiedOnly')}</option>
              <option value="TNTC">{t('history.criticalTNTC')}</option>
              <option value="TFTC">{t('history.traceTFTC')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-slate-200/60 overflow-hidden rounded-2xl shadow-sm">
        {/* Table Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t('history.archives')}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{total} {t('history.recordsFound')}</p>
          </div>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
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
          <div>
            {/* Mobile Cards (< sm) */}
            <div className="sm:hidden divide-y divide-slate-50">
              {analyses.map((analysis: any) => {
                const statusOk = analysis.status === 'completed' && analysis.is_valid_for_reporting;
                const isTNTC = analysis.warnings?.some((w: any) => w.includes('TNTC'));
                return (
                  <div key={analysis.id} className="p-3 hover:bg-slate-50 cursor-pointer active:bg-slate-100 transition-colors" onClick={() => handleViewAnalysis(analysis.id)}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <p className="text-[11px] font-black text-slate-900 leading-tight">{analysis.sample_id}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Node: <span className="font-mono">{analysis.id.slice(0,8)}</span></p>
                      </div>
                      <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border flex-shrink-0 ${statusOk ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : isTNTC ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {statusOk ? t('history.verified') : isTNTC ? 'TNTC' : t('history.reviewRequired')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[8px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 font-bold uppercase">{analysis.media_type.split(' ')[0]}</span>
                      <span className="text-[8px] font-black text-slate-700">{analysis.colony_count} koloni</span>
                      <span className="text-[8px] font-black text-slate-500">{formatCFU(analysis.cfu_per_ml, analysis.warnings)} CFU/ml</span>
                      <span className="text-[8px] font-bold text-slate-400">{(analysis.confidence_score * 100).toFixed(0)}% conf.</span>
                      <span className="text-[8px] text-slate-400 ml-auto">{new Date(analysis.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${analysis.confidence_score >= 0.85 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{width:`${analysis.confidence_score*100}%`}} />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Desktop Table (>= sm) */}
            <div className="hidden sm:block overflow-x-auto w-full">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    {[t('history.tableSpecimenId'), 'Method & Matrix', t('history.tableCount'), t('history.tableCfuMl'), t('history.tableConfidence'), t('history.tableTimestamp'), 'Compliance Status', t('history.tableActions')].map((h) => (
                      <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {analyses.map((analysis: any) => (
                    <tr key={analysis.id} className="hover:bg-slate-50 transition-all duration-200 group cursor-pointer" onClick={() => handleViewAnalysis(analysis.id)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                            <FlaskConical className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[13px] font-black text-slate-900">{analysis.sample_id}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Node: <span className="text-slate-600 font-mono">{analysis.id.slice(0,8)}</span></p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="px-2.5 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100 w-fit">
                            {analysis.media_type}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                            {analysis.method_standard || 'ISO 4833-1:2013'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-[13px] font-black text-slate-900 tabular-nums">{analysis.colony_count}</span></td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-black px-3 py-1.5 rounded-lg border tabular-nums shadow-sm ${analysis.warnings?.some((w:any)=>w.includes('TNTC'))?'bg-rose-50 text-rose-600 border-rose-100':analysis.warnings?.some((w:any)=>w.includes('TFTC'))?'bg-amber-50 text-amber-600 border-amber-100':'bg-slate-50 text-slate-700 border-slate-100'}`}>
                          {formatCFU(analysis.cfu_per_ml, analysis.warnings)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{(analysis.confidence_score*100).toFixed(0)}% Precise</span>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 mt-1.5">
                            <div className={`h-full rounded-full ${analysis.confidence_score>=0.85?'bg-emerald-500':'bg-amber-500'}`} style={{width:`${analysis.confidence_score*100}%`}} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[12px] font-black text-slate-900">{new Date(analysis.created_at).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{new Date(analysis.created_at).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border shadow-sm ${analysis.status==='completed'&&analysis.is_valid_for_reporting?'bg-emerald-50 text-emerald-600 border-emerald-100':analysis.warnings?.some((w:any)=>w.includes('TNTC'))?'bg-rose-50 text-rose-600 border-rose-100':'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {analysis.status==='completed'?(analysis.is_valid_for_reporting?t('history.verified'):(analysis.warnings?.some((w:any)=>w.includes('TNTC'))?t('history.tntcCritical'):t('history.reviewRequired'))):analysis.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={(e)=>{e.stopPropagation();handleViewAnalysis(analysis.id);}} className="p-2 rounded-xl text-slate-300 hover:text-primary hover:bg-primary/5 transition-all"><Eye className="h-4 w-4" /></button>
                          <button onClick={(e)=>{e.stopPropagation();}} className="p-2 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all"><Download className="h-4 w-4" /></button>
                          <button onClick={(e)=>{e.stopPropagation();handleDelete(analysis.id,analysis.sample_id);}} className="p-2 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

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
import { AnalysisListResponse, MediaType, ReportType } from "@/lib/types";
import { toast } from "sonner";

export default function HistoryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [mediaFilter, setMediaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [data, setData] = useState<AnalysisListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
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
        toast.error(error.response?.data?.detail || "Failed to load history");
      } finally {
        setIsLoading(false);
      }
    };
    const debounce = setTimeout(loadHistory, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, mediaFilter, statusFilter, page]);

  const handleViewAnalysis = (id: string) => router.push(`/dashboard/results/${id}`);

  const handleExportCsv = async () => {
    if (!data?.analyses || data.analyses.length === 0) { toast.error("No analyses to export"); return; }
    try {
      const report = await reportsApi.generateCsv({ report_type: "custom" as ReportType, format: "csv" });
      await reportsApi.downloadReport(report.url.split("/").pop() || "latest");
      toast.success("CSV exported successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to export CSV");
    }
  };

  const handleDelete = async (id: string, sampleId: string) => {
    if (!window.confirm(`Delete analysis "${sampleId}"? This action cannot be undone.`)) return;
    try {
      await analysesApi.delete(id);
      toast.success("Analysis deleted");
      const result = await analysesApi.list({ page, page_size: pageSize, search: searchTerm || undefined, media_type: mediaFilter !== "all" ? (mediaFilter as MediaType) : undefined, status: statusFilter !== "all" ? statusFilter : undefined });
      setData(result);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete analysis");
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">Loading diagnostic archives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analysis History</h1>
          <p className="text-slate-500 mt-1.5">Full archive of all specimen analyses</p>
        </div>
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors duration-150 shadow-sm self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Sample ID or media type..."
              className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          {/* Media Filter */}
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              className="w-full pl-10 pr-8 py-2.5 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              value={mediaFilter}
              onChange={(e) => { setMediaFilter(e.target.value); setPage(1); }}
            >
              <option value="all">All Media Types</option>
              <option value="Plate Count Agar">PCA Protocol</option>
              <option value="VRBA">VRBA Protocol</option>
              <option value="BGBB">BGBB Protocol</option>
              <option value="R2A">R2A Protocol</option>
              <option value="TSA">TSA Protocol</option>
              <option value="MacConkey">MacConkey Protocol</option>
            </select>
          </div>
          {/* Status Filter */}
          <div className="relative min-w-[160px]">
            <select
              className="w-full px-4 py-2.5 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="all">All Statuses</option>
              <option value="valid">Valid</option>
              <option value="TNTC">TNTC (Critical)</option>
              <option value="TFTC">TFTC (Trace)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Biological Archives</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{total} records found</p>
          </div>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-orange-500" />}
        </div>

        {/* Empty State */}
        {!isLoading && analyses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
              <History className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600">No records found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Table */}
        {analyses.length > 0 && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Specimen ID", "Media", "Dilution", "Colony Count", "CFU/ml", "Confidence", "Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analyses.map((analysis) => (
                  <tr key={analysis.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                    {/* Specimen ID */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center group-hover:bg-orange-100 transition-colors duration-150 flex-shrink-0">
                          <FlaskConical className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{analysis.sample_id}</p>
                          <p className="text-[11px] text-slate-400 font-mono tracking-wider">{analysis.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    {/* Media */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-md text-[11px] font-bold tracking-wide">
                        {analysis.media_type}
                      </span>
                    </td>
                    {/* Dilution */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold text-slate-600">
                        10<sup className="text-[9px]">-{Math.abs(Math.log10(analysis.dilution_factor))}</sup>
                      </span>
                    </td>
                    {/* Colony Count */}
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{analysis.colony_count}</td>
                    {/* CFU/ml */}
                    <td className="px-6 py-4">
                      <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                        analysis.warnings?.some(w => w.includes("TNTC"))
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : analysis.warnings?.some(w => w.includes("TFTC"))
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}>
                        {formatCFU(analysis.cfu_per_ml, analysis.warnings)}
                      </span>
                    </td>
                    {/* Confidence */}
                    <td className="px-6 py-4">
                      <div className="w-20">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-bold text-slate-500">
                            {(analysis.confidence_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${analysis.confidence_score >= 0.85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${analysis.confidence_score * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    {/* Date */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {new Date(analysis.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(analysis.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-widest uppercase border ${
                        analysis.status === "completed" && analysis.is_valid_for_reporting
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : analysis.warnings?.some(w => w.includes("TNTC"))
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {analysis.status === "completed" 
                          ? (analysis.is_valid_for_reporting ? "Verified" : (analysis.warnings?.some(w => w.includes("TNTC")) ? "TNTC" : "Review")) 
                          : analysis.status}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewAnalysis(analysis.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-150"
                          title="View Analysis"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150"
                          title="Download Report"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(analysis.id, analysis.sample_id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-150"
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
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
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <p className="text-sm font-medium text-slate-500">
              Showing <span className="font-bold text-slate-800">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}</span> of <span className="font-bold text-slate-800">{total}</span> records
            </p>
            <div className="flex items-center gap-1.5">
              <button
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (pageNum > totalPages || pageNum < 1) return null;
                return (
                  <button
                    key={pageNum}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors duration-150 ${
                      pageNum === page
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

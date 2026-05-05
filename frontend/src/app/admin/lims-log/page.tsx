"use client";

import { useState, useEffect } from "react";
import { 
  Database, 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  XCircle,
  Loader2,
  ExternalLink,
  Clock,
  User,
  Beaker
} from "lucide-react";
import Link from "next/link";
import { analysesApi } from "@/lib/analyses-api";
import { toast } from "sonner";
import { useTranslationStore } from "@/lib/i18n/store";

export default function LimsLogPage() {
  const { t } = useTranslationStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await analysesApi.getLimsLogs(100);
        setLogs(data);
      } catch (error) {
        toast.error("Failed to load LIMS logs");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.sample_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.lims_record_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <Link 
              href="/dashboard"
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm group"
            >
              <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-100">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">
                  {t("admin.limsLogTitle")}
                </h1>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 font-black uppercase tracking-[0.3em]">
                {t("admin.limsLogSubtitle")}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded-lg uppercase tracking-widest border border-amber-200 shadow-sm">
                LIMS DEMO MODE
             </span>
             <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
               <Download className="h-3.5 w-3.5" />
               {t("common.export")} Logs
             </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder={t("history.searchPlaceholder")}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all flex items-center gap-2">
              <Filter className="h-3.5 w-3.5" />
              {t("common.status")}: All
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t("common.processing")}
              </p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-20 text-center">
              <Database className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-500">{t("history.noRecords")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t("admin.limsLogTableTimestamp")}</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t("admin.limsLogTableSampleId")}</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t("admin.limsLogTableRecordId")}</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t("admin.limsLogTableAnalyst")}</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t("admin.limsLogTableStatus")}</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t("admin.limsLogTableAction")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-[11px] font-bold">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Beaker className="h-3.5 w-3.5 text-indigo-500" />
                          <span className="text-xs font-black text-slate-900">
                            {log.sample_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-black text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded">
                          {log.lims_record_id || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-700">
                          <User className="h-3.5 w-3.5" />
                          <span className="text-[11px] font-bold">{log.user_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {log.status === "success" ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
                            <CheckCircle className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase">{t("common.verified")}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full w-fit">
                            <XCircle className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase">{t("common.failed")}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                         <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                           <ExternalLink className="h-4 w-4" />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Footer Info */}
        <div className="mt-8 flex items-center justify-between bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
               <Database className="h-6 w-6 text-slate-300" />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                 {t("admin.limsUplinkActive")}
               </p>
               <div className="flex items-center gap-2 mt-1">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-[10px] font-bold text-emerald-600 uppercase">
                   {t("admin.limsUplinkActive")}
                 </p>
               </div>
             </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               LIMS Version
             </p>
             <p className="text-xs font-black text-slate-900">
               SampleManager v12.4
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

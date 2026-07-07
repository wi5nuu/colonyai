"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Mail,
  CheckSquare,
  Square,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslationStore } from "@/lib/i18n/store";
import api from "@/lib/api";

interface ResetRequest {
  id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  status: "pending" | "approved" | "rejected" | "expired";
  requester_ip: string;
  requester_ua: string;
  requested_at: string;
  expires_at: string;
  reviewed_at: string | null;
  reset_token: string | null;
  token_expires_at: string | null;
}

function timeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Kedaluwarsa";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}j ${m}m`;
}

function detectDevice(ua: string): string {
  if (!ua) return "Unknown";
  if (/mobile|android|iphone/i.test(ua)) return "📱 Mobile";
  if (/tablet|ipad/i.test(ua)) return "📟 Tablet";
  return "🖥️ Desktop";
}

export function ResetRequestsPanel() {
  const { accessToken } = useAuthStore();
  const { t } = useTranslationStore();
  const [requests, setRequests] = useState<ResetRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [showTokenModal, setShowTokenModal] = useState<{
    token: string;
    email: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ reset_requests: ResetRequest[] }>(
        "/api/v1/auth/reset-requests",
      );
      setRequests(res.data.reset_requests);
      setSelectedIds(new Set());
    } catch {
      toast.error("Gagal memuat daftar permintaan reset");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredRequests = requests.filter((r) =>
    filterStatus === "all" ? true : r.status === filterStatus,
  );
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const pendingCount = pendingRequests.length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pendingIds = pendingRequests.map((r) => r.id);
    if (selectedIds.size === pendingIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingIds));
    }
  };

  const handleApprove = async (id: string, email: string) => {
    setProcessingId(id);
    try {
      const res = await api.post<{ reset_token: string }>(
        `/api/v1/auth/reset-requests/${id}/approve`,
      );
      toast.success("✅ Disetujui! Token telah dibuat.");
      setShowTokenModal({ token: res.data.reset_token, email });
      fetchRequests();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await api.post(`/api/v1/auth/reset-requests/${id}/reject`);
      toast.success("Ditolak. Pengguna telah diberitahu.");
      fetchRequests();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    let success = 0,
      failed = 0;
    const idsArray = Array.from(selectedIds);
    for (const id of idsArray) {
      try {
        await api.post(`/api/v1/auth/reset-requests/${id}/approve`);
        success++;
      } catch {
        failed++;
      }
    }
    toast.success(
      `✅ Bulk Approve: ${success} berhasil${failed > 0 ? `, ${failed} gagal` : ""}`,
    );
    setIsBulkProcessing(false);
    fetchRequests();
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    let success = 0;
    const idsArray = Array.from(selectedIds);
    for (const id of idsArray) {
      try {
        await api.post(`/api/v1/auth/reset-requests/${id}/reject`);
        success++;
      } catch {}
    }
    toast.success(`Bulk Reject: ${success} permintaan ditolak`);
    setIsBulkProcessing(false);
    fetchRequests();
  };

  const handleCopyToken = async (token: string, id: string) => {
    await navigator.clipboard.writeText(token);
    setCopiedId(id);
    toast.success("Token disalin! Sampaikan via saluran internal yang aman.");
    setTimeout(() => setCopiedId(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="w-6 h-6 text-slate-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/50 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
              Reset Requests
            </h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {pendingCount > 0 ? (
                <span className="text-amber-500">
                  {pendingCount}{" "}
                  {t("resetRequests.pendingApproval")}
                </span>
              ) : (
                <span className="text-slate-400">
                  {t("resetRequests.allClear")}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-[10px] font-black uppercase border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 outline-none focus:border-primary/50 transition-all"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">{t("resetRequests.all")}</option>
          </select>
          <button
            onClick={fetchRequests}
            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {pendingCount > 0 && (
        <div className="p-3 bg-slate-900 dark:bg-slate-950 rounded-2xl flex items-center gap-3 flex-wrap">
          <button onClick={toggleSelectAll} className="flex items-center gap-2">
            {selectedIds.size === pendingCount ? (
              <CheckSquare className="w-4 h-4 text-primary" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
              {selectedIds.size === pendingCount
                ? t("resetRequests.deselectAll")
                : t("resetRequests.selectAll", { count: pendingCount })}
            </span>
          </button>

          {selectedIds.size > 0 && (
            <>
              <div className="w-px h-4 bg-white/10" />
              <span className="text-[10px] font-black text-primary uppercase">
                {selectedIds.size} {t("resetRequests.selected")}
              </span>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={handleBulkApprove}
                  disabled={isBulkProcessing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {isBulkProcessing ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Zap className="w-3 h-3" />
                  )}
                  {t("resetRequests.approveAll")}
                </button>
                <button
                  onClick={handleBulkReject}
                  disabled={isBulkProcessing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  <XCircle className="w-3 h-3" />{" "}
                  {t("resetRequests.rejectAll")}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Info Banner */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl flex items-start gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p
          className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed font-medium"
          dangerouslySetInnerHTML={{ __html: t("resetRequests.infoBanner") }}
        />
      </div>

      {/* List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
          <CheckCircle2 className="w-8 h-8 text-slate-100 dark:text-slate-800 mx-auto mb-2" />
          <p className="text-xs font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
            {t("resetRequests.noRequests")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 transition-all ${
                req.status === "pending" && selectedIds.has(req.id)
                  ? "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/5"
                  : req.status === "pending"
                    ? "border-amber-200 dark:border-amber-900/50 shadow-sm"
                    : "border-slate-100 dark:border-slate-800"
              }`}
            >
              <div className="flex items-start gap-3">
                {req.status === "pending" && (
                  <button
                    onClick={() => toggleSelect(req.id)}
                    className="mt-1 flex-shrink-0"
                  >
                    {selectedIds.has(req.id) ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </button>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-black text-slate-500 dark:text-slate-400 text-xs flex-shrink-0">
                        {req.user_name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {req.user_name}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 truncate">
                          <Mail className="w-2.5 h-2.5 flex-shrink-0" />{" "}
                          {req.user_email}
                        </p>
                      </div>
                    </div>
                    {req.status === "pending" && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase flex-shrink-0">
                        <Clock className="w-2.5 h-2.5" />{" "}
                        {timeLeft(req.expires_at)}
                      </span>
                    )}
                    {req.status === "approved" && (
                      <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-full text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase flex-shrink-0">
                        ✅ Approved
                      </span>
                    )}
                    {req.status === "rejected" && (
                      <span className="px-2 py-1 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-full text-[9px] font-black text-rose-700 dark:text-rose-400 uppercase flex-shrink-0">
                        ❌ Rejected
                      </span>
                    )}
                    {req.status === "expired" && (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase flex-shrink-0">
                        Expired
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl mb-0">
                    <div className="flex-1 grid grid-cols-3 gap-2 text-[10px]">
                      <div>
                        <p className="text-slate-400 dark:text-slate-500 font-black uppercase mb-0.5">
                          IP
                        </p>
                        <p className="font-mono font-bold text-slate-700 dark:text-slate-300 truncate">
                          {req.requester_ip}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 dark:text-slate-500 font-black uppercase mb-0.5">
                          Device
                        </p>
                        <p className="font-bold text-slate-700 dark:text-slate-300">
                          {detectDevice(req.requester_ua)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 dark:text-slate-500 font-black uppercase mb-0.5">
                          Waktu
                        </p>
                        <p className="font-bold text-slate-700 dark:text-slate-300">
                          {new Date(req.requested_at).toLocaleTimeString(
                            "id-ID",
                          )}
                        </p>
                      </div>
                    </div>

                    {req.status === "pending" && (
                      <div className="flex gap-1.5 pl-3 border-l border-slate-200 dark:border-slate-800">
                        <button
                          onClick={() => handleApprove(req.id, req.user_email)}
                          disabled={!!processingId || isBulkProcessing}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 disabled:opacity-40"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          disabled={!!processingId || isBulkProcessing}
                          className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 disabled:opacity-40"
                        >
                          <XCircle className="w-2.5 h-2.5" />{" "}
                          {t("resetRequests.reject")}
                        </button>
                      </div>
                    )}
                  </div>

                  {req.status === "approved" && req.reset_token && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl mt-3">
                      <p className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase mb-1.5">
                        🔑 Token — Berlaku s/d{" "}
                        {new Date(req.token_expires_at!).toLocaleTimeString(
                          "id-ID",
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-950 px-2 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 break-all">
                          {req.reset_token}
                        </code>
                        <button
                          onClick={() =>
                            handleCopyToken(req.reset_token!, req.id)
                          }
                          className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all flex-shrink-0"
                        >
                          {copiedId === req.id ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Token Modal */}
      {showTokenModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-none shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
              <div className="p-6 bg-[#1a237e] text-white relative">
                <div className="w-10 h-10 bg-white/10 rounded-none flex items-center justify-center mb-4">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-black uppercase tracking-widest">
                  {t("resetRequests.modalTitle")}
                </h3>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">
                  {showTokenModal.email}
                </p>

                <button
                  onClick={() => setShowTokenModal(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-none transition-all"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                    {t("resetRequests.deliverTokenLabel")}
                  </label>
                  <div className="flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-950 border-b-2 border-slate-200 dark:border-slate-800 rounded-none">
                    <code className="flex-1 font-mono font-black text-slate-900 dark:text-white text-base tracking-widest break-all">
                      {showTokenModal.token}
                    </code>
                    <button
                      onClick={() =>
                        handleCopyToken(showTokenModal.token, "modal")
                      }
                      className="p-3 bg-slate-900 text-white rounded-none hover:bg-[#0055ff] transition-all active:scale-95"
                    >
                      {copiedId === "modal" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-none flex gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[9px] text-amber-800 dark:text-amber-400 font-bold uppercase leading-relaxed tracking-wider">
                    {t("resetRequests.tokenConfidentialWarning")}
                  </p>
                </div>

                <button
                  onClick={() => setShowTokenModal(null)}
                  className="w-full h-12 bg-[#1a237e] text-white rounded-none text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#0055ff] transition-all shadow-xl shadow-[#1a237e]/10"
                >
                  {t("resetRequests.closeFinish")}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

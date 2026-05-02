"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  ShieldAlert,
  Settings2,
  Key,
  Activity,
  Trash2,
  Database,
  Lock,
  ShieldCheck,
  Download,
  FileText,
  FileSpreadsheet,
  BarChart3,
  Search,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import api, { API_URL } from "@/lib/api";
import { DocumentationSidebar, DocumentationToggle } from "@/components/DocumentationSidebar";
import { useTranslationStore } from "@/lib/i18n/store";
import { ResetRequestsPanel } from "@/components/ResetRequestsPanel";

interface Analyst {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
  clearance: string;
}



export default function AdministrationPage() {
  const { t } = useTranslationStore();
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState({
    throughput: 4.2,
    latency: 4,
    uptime: 99.98,
  });
  const [showDocs, setShowDocs] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingXls, setDownloadingXls] = useState(false);
  
  // Password Reset Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<Analyst | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // Add User Modal State
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "analyst"
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
          const [usersRes, auditRes] = await Promise.all([
            api.get<any[]>("/api/v1/users/"),
            api.get<any[]>("/api/v1/audit/"),
          ]);

          const mappedUsers = usersRes.data.map((u) => {
            const roleStr = u.role === "system_admin" ? "admin" : u.role;
            let clearanceLevel = "Level-01";
            if (roleStr === "admin") clearanceLevel = "Level-04";
            else if (roleStr === "manager") clearanceLevel = "Level-03";
            else if (roleStr === "auditor") clearanceLevel = "Level-02";
            else if (roleStr === "analyst") clearanceLevel = "Level-01";

            return {
              id: u.id,
              name: u.full_name,
              email: u.email,
              role: roleStr,
              status: "active",
              lastActive: "Online",
              clearance: clearanceLevel,
            };
          });

          setAnalysts(mappedUsers);
          setAuditLogs(auditRes.data);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        toast.error("Gagal memuat data dari server. Pastikan backend berjalan.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPerformance((prev) => ({
        ...prev,
        throughput: parseFloat(
          (prev.throughput + (Math.random() * 0.4 - 0.2)).toFixed(2),
        ),
        latency: Math.max(
          2,
          Math.min(10, prev.latency + (Math.floor(Math.random() * 3) - 1)),
        ),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const authStorage = localStorage.getItem("auth-storage");
      const token = authStorage
        ? JSON.parse(authStorage).state?.accessToken
        : null;
      const res = await fetch(`${API_URL}/api/v1/reports/admin/pdf-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Gagal mengunduh PDF" }));
        throw new Error(errorData.detail || "Gagal mengunduh PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `colonyai-admin-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF berhasil diunduh!");
    } catch (e: any) {
      console.error("PDF Download Error:", e);
      toast.error(e.message || "Gagal mengunduh PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadingXls(true);
    try {
      const authStorage = localStorage.getItem("auth-storage");
      const token = authStorage
        ? JSON.parse(authStorage).state?.accessToken
        : null;
      const res = await fetch(`${API_URL}/api/v1/reports/admin/excel-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Gagal mengunduh Excel" }));
        throw new Error(errorData.detail || "Gagal mengunduh Excel");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `colonyai-admin-analytics-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data Excel berhasil diunduh!");
    } catch (e: any) {
      console.error("Excel Download Error:", e);
      toast.error(e.message || "Gagal mengunduh Excel");
    } finally {
      setDownloadingXls(false);
    }
  };

  const handleToggleStatus = (id: string) => {
    setAnalysts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const newStatus = a.status === "active" ? "suspended" : "active";
          toast.info(`Analyst ${a.name} status updated to ${newStatus}`);
          return { ...a, status: newStatus };
        }
        return a;
      }),
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.post("/api/v1/auth/register", newUserData);
      toast.success(`User ${newUserData.full_name} has been provisioned.`);
      setAddUserModalOpen(false);
      setNewUserData({ email: "", password: "", full_name: "", role: "analyst" });
      
      // Refresh list
      const usersRes = await api.get<any[]>("/api/v1/users/");
      const mappedUsers = usersRes.data.map((u) => {
        const roleStr = u.role === "system_admin" ? "admin" : u.role;
        let clearanceLevel = "Level-01";
        if (roleStr === "admin") clearanceLevel = "Level-04";
        else if (roleStr === "manager") clearanceLevel = "Level-03";
        else if (roleStr === "auditor") clearanceLevel = "Level-02";
        else if (roleStr === "analyst") clearanceLevel = "Level-01";

        return {
          id: u.id,
          name: u.full_name,
          email: u.email,
          role: roleStr,
          status: "active",
          lastActive: "Online",
          clearance: clearanceLevel,
        };
      });
      setAnalysts(mappedUsers);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Gagal membuat user.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!targetUser || !newPassword) return;
    
    setIsResetting(true);
    try {
      await api.post("/api/v1/users/admin-reset-password", {
        user_id: targetUser.id,
        new_password: newPassword
      });
      toast.success(`Password for ${targetUser.name} reset successfully.`);
      setResetModalOpen(false);
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Gagal mereset password.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden pb-12">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        <div
          className={`flex-1 transition-all duration-300 ${showDocs ? "lg:mr-[350px]" : ""}`}
        >
          <div className="max-w-[1500px] mx-auto px-6 py-0 pt-0">
            <div className="space-y-6">
              {/* Header Administration */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl shadow-sm flex items-center justify-center">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                        System Control
                      </h1>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Node Authorization & Governance Matrix
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                      Master Node: Operational
                    </span>
                  </div>
                  <DocumentationToggle showDocs={showDocs} setShowDocs={setShowDocs} text="SOP Kontrol" />
                  <button 
                    onClick={() => setAddUserModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-slate-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
                  >
                    <Plus className="w-4 h-4" /> Provision New Staff
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Active Clusters",
                    value: "12/12",
                    sub: "Optimal",
                    icon: Activity,
                    color: "emerald",
                  },
                  {
                    label: "Security Clearance",
                    value: "Level-04",
                    sub: "Root Access",
                    icon: ShieldCheck,
                    color: "primary",
                  },
                  {
                    label: "System Uptime",
                    value: `${performance.uptime}%`,
                    sub: "Real-time",
                    icon: Database,
                    color: "purple",
                  },
                  {
                    label: "Total Nodes",
                    value: analysts.length.toString(),
                    sub: "Authorized",
                    icon: Users,
                    color: "blue",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group border-b-4"
                    style={{
                      borderBottomColor:
                        s.color === "emerald"
                          ? "#10b981"
                          : s.color === "primary"
                            ? "#6366f1"
                            : s.color === "purple"
                              ? "#a855f7"
                              : "#3b82f6",
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center`}
                      >
                        <s.icon
                          className={`w-5 h-5 text-${s.color === "primary" ? "primary" : s.color + "-500"}`}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
                        ID-0{i + 1}
                      </span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                      {s.label}
                    </p>
                    <div className="flex items-end gap-2">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        {s.value}
                      </h3>
                      <span className="text-xs font-bold text-primary mb-1">
                        {s.sub}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Personnel Registry */}
              <div className="lg:col-span-12">
                <div className="dashboard-card overflow-hidden !p-0 rounded-2xl border-slate-200/60 shadow-sm bg-white">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                        Authorized Personnel Registry
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Verified Laboratory Analysts & Administrators
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search Node ID..."
                          className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none w-48"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                            Analyst Node
                          </th>
                          <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                            Clearance
                          </th>
                          <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                            Status
                          </th>
                          <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                            Last Pulse
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {analysts.map((a) => (
                          <tr
                            key={a.id}
                            className="hover:bg-slate-50 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 border border-slate-200">
                                  {a.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-xs font-bold text-slate-900">
                                      {a.name}
                                    </p>
                                    <span
                                      className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded ${
                                        a.role === "admin"
                                          ? "bg-primary/10 text-primary"
                                          : a.role === "manager"
                                            ? "bg-amber-100 text-amber-700"
                                            : a.role === "auditor"
                                              ? "bg-purple-100 text-purple-700"
                                              : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {a.role}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 font-medium">
                                    {a.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200 uppercase">
                                {a.clearance}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${a.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`}
                                />
                                <span
                                  className={`text-xs font-black uppercase tracking-widest ${a.status === "active" ? "text-emerald-600" : "text-rose-600"}`}
                                >
                                  {a.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                              {a.lastActive}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setTargetUser(a);
                                    setResetModalOpen(true);
                                  }}
                                  className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                  title="Reset Password"
                                >
                                  <Key className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(a.id)}
                                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                  title="Suspend Node"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Password Reset Requests */}
              <div className="lg:col-span-12">
                <div className="dashboard-card overflow-hidden !p-0 rounded-2xl border-slate-200/60 shadow-sm bg-white">
                  <div className="px-6 py-6 border-b border-slate-100 bg-slate-50/50">
                    <ResetRequestsPanel />
                  </div>
                </div>
              </div>

              {/* Export Hub */}
              <div className="lg:col-span-12">
                <div className="dashboard-card overflow-hidden !p-0 rounded-2xl border-slate-200/60 shadow-lg group bg-white">
                  <div className="px-6 py-6 border-b border-slate-100 bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <BarChart3 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">
                          Pusat Ekspor Data Administrator
                        </h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Protokol Ekstraksi Data Resmi Laboratorium
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                        <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          ISO-17025 Compliant
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/30">
                    {/* PDF Export */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-6 flex flex-col gap-4 hover:border-red-200 hover:shadow-xl transition-all group/pdf relative overflow-hidden">
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center group-hover/pdf:scale-110 transition-transform">
                          <FileText className="w-7 h-7 text-red-500" />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-900 tracking-tight">
                            Buku Besar Tata Kelola Master
                          </h4>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Dokumen PDF Komprehensif
                          </p>
                        </div>
                      </div>
                      <p className="text-[13px] text-slate-500 leading-relaxed font-medium relative z-10">
                        Laporan resmi untuk keperluan audit eksternal. Berisi
                        seluruh rekam jejak spesimen, breakdown performa analis,
                        dan tren kepatuhan laboratorium.
                      </p>

                      <div className="flex flex-wrap gap-2 mb-2 relative z-10">
                        {[
                          "Global Summary",
                          "Per-User Stats",
                          "Audit Trail",
                        ].map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-md uppercase tracking-widest"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={handleDownloadPdf}
                        disabled={downloadingPdf}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 relative z-10"
                      >
                        {downloadingPdf ? (
                          "Building Ledger..."
                        ) : (
                          <>
                            <Download className="w-4 h-4" /> Download Master PDF
                          </>
                        )}
                      </button>
                    </div>

                    {/* Excel Export */}
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-6 flex flex-col gap-4 hover:border-emerald-200 hover:shadow-xl transition-all group/excel relative overflow-hidden">
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover/excel:scale-110 transition-transform">
                          <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-900 tracking-tight">
                            Dataset Analitik Mentah
                          </h4>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Multi-Sheet Excel Export
                          </p>
                        </div>
                      </div>
                      <p className="text-[13px] text-slate-500 leading-relaxed font-medium relative z-10">
                        Dataset mentah untuk sinkronisasi sistem informasi laboratorium.
                        Mencakup distribusi data CFU, riwayat audit,
                        dan metrik performa analis.
                      </p>

                      <div className="flex flex-wrap gap-2 mb-2 relative z-10">
                        {["Raw Records", "BI Sync", "Diagnostic Matrix"].map(
                          (tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-md uppercase tracking-widest"
                            >
                              {tag}
                            </span>
                          ),
                        )}
                      </div>

                      <button
                        onClick={handleDownloadExcel}
                        disabled={downloadingXls}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 relative z-10"
                      >
                        {downloadingXls ? (
                          "Building Matrix..."
                        ) : (
                          <>
                            <Download className="w-4 h-4" /> Download Analytics
                            Excel
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Audit Trail - MOVED BELOW */}
              <div className="lg:col-span-12">
                <div className="dashboard-card overflow-hidden !p-0 rounded-2xl border-slate-200/60 shadow-xl bg-white">
                  <div className="px-6 py-5 border-b border-slate-100 bg-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
                          Recent System Audit Trail
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                          Real-time Immutable Ledger Snapshot
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.location.href = '/dashboard/audit'}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5"
                    >
                      Lihat Lengkap
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {auditLogs.slice(0, 10).map((log) => (
                      <div
                        key={log.id}
                        className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-all group"
                      >
                        <div className="flex items-center gap-8">
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-black text-slate-300 font-mono group-hover:text-primary transition-colors">
                              #{log.id.substring(0, 8)}
                            </span>
                            <div className="w-[1px] h-4 bg-slate-100 my-1" />
                          </div>
                          <div>
                            <p className="text-[14px] font-black text-slate-900 tracking-tight">
                              {log.action}
                            </p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                              <span className="text-slate-500 font-black">
                                EXECUTOR:
                              </span>{" "}
                              {log.user_name}{" "}
                              <span className="mx-2 text-slate-200">|</span>{" "}
                              <span className="text-slate-500 font-black">
                                RESOURCE:
                              </span>{" "}
                              {log.resource_type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-10">
                          <div className="text-right hidden md:block">
                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-xs font-bold text-slate-300 mt-1 font-mono tracking-tighter">
                              {new Date(log.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </p>
                          </div>
                          <div className="w-24 text-right">
                            <span className={`inline-block text-xs font-black px-3 py-1.5 rounded-xl border uppercase tracking-widest shadow-sm ${
                              log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              log.status === 'FAILED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                              {log.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>

        {/* Documentation Sidebar */}
        <DocumentationSidebar
          showDocs={showDocs}
          setShowDocs={setShowDocs}
          directory="System Control"
          title="Tata Kelola Node"
          description="SOP Manajemen Personel dan Observasi Performa Sistem Real-time."
          rawText={`TATA KELOLA NODE & SISTEM COLONYAI
==================================

1. OVERVIEW
Modul Node Governance adalah pusat komando untuk Administrator dalam mengelola otorisasi staf dan memantau kesehatan infrastruktur.

2. GOVERNANCE PROTOCOL
A. ANALYST PROVISIONING: Pendaftaran akun analis baru dengan Clearance Level spesifik (Level 01-04).
B. ACCESS REVOCATION: Pembekuan akses (Suspend) secara instan untuk mitigasi risiko keamanan.
C. SYSTEM AUDITING: Pemantauan log aktivitas sistem secara real-time melalui Immutable Ledger.

3. MASTER EXPORT CENTER
- Buku Besar Tata Kelola: Ekspor PDF komprehensif untuk audit eksternal ISO-17025.
- Dataset Analitik: Ekspor Excel mentah untuk integrasi sistem informasi lab (LIMS).

STATUS: GOVERNANCE ACTIVE
AUTORITAS: MASTER ROOT`}
        >
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">01</span>
              <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">Overview</h2>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
              Modul Node Governance dirancang secara khusus untuk Administrator sebagai pusat komando otorisasi staf dan pemantauan kesehatan operasional server.
            </p>
          </section>

          <section className="space-y-3 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">02</span>
              <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">Governance Protocol</h2>
            </div>
            <div className="space-y-3 ml-0.5">
              {[
                { id: "1", title: "Analyst Provisioning", desc: 'Gunakan "Provision New Node" untuk mendaftarkan akun analis baru dengan Clearance Level spesifik.' },
                { id: "2", title: "Access Revocation", desc: "Administrator dapat membekukan akses (Suspend) setiap analis melalui Action Toggle pada tabel Registry." },
                { id: "3", title: "Master Export Center", desc: "Gunakan fitur ekspor PDF/Excel untuk menghasilkan laporan tata kelola resmi standar ISO-17025." },
              ].map((step) => (
                <div key={step.id} className="flex gap-2.5 group">
                  <span className="flex-shrink-0 w-4.5 h-4.5 rounded bg-slate-900 text-white text-[8px] font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    {step.id}
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="text-[10px] font-bold text-slate-900">{step.title}</h4>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </DocumentationSidebar>
      </div>

      {/* Professional Password Reset Modal */}
      {resetModalOpen && targetUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isResetting && setResetModalOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Reset Authority</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol-09 Security Recovery</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Analyst</p>
                  <p className="text-sm font-bold text-slate-900">{targetUser.name}</p>
                  <p className="text-xs text-slate-500">{targetUser.email}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">New Professional Password</label>
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300"
                    autoFocus
                  />
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight italic">Minimum 8 characters with Uppercase, Number, and Special Char.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setResetModalOpen(false)}
                  disabled={isResetting}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all border border-slate-100"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleResetPassword}
                  disabled={isResetting || !newPassword}
                  className="flex-[2] py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isResetting ? "Synchronizing..." : "Update Authority"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provision New Staff Modal */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isCreating && setAddUserModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                  <UserPlus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Provision Staff</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Personnel Onboarding</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                    <input 
                      required
                      type="text"
                      value={newUserData.full_name}
                      onChange={(e) => setNewUserData({...newUserData, full_name: e.target.value})}
                      placeholder="e.g. John Doe"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Role</label>
                    <select 
                      value={newUserData.role}
                      onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300"
                    >
                      <option value="analyst">Analyst (Level-01)</option>
                      <option value="auditor">Auditor (Level-02)</option>
                      <option value="manager">Manager (Level-03)</option>
                      <option value="admin">Admin (Level-04)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Identifier</label>
                  <input 
                    required
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                    placeholder="staff@laboratory.diag"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Temporary Password</label>
                  <input 
                    required
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  disabled={isCreating}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all border border-slate-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="flex-[2] py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-slate-900/20 hover:bg-primary transition-all disabled:opacity-50"
                >
                  {isCreating ? "Initializing..." : "Provision Node"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

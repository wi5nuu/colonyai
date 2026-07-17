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
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

import api, { API_URL } from "@/lib/api";
import {
  DocumentationSidebar,
  DocumentationToggle,
} from "@/components/DocumentationSidebar";
import { useTranslationStore } from "@/lib/i18n/store";
import { useAuthStore } from "@/lib/auth-store";
import { ResetRequestsPanel } from "@/components/ResetRequestsPanel";

interface Analyst {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
  clearance: string;
  organizationName?: string;
}

export default function AdministrationPage() {
  const { t } = useTranslationStore();
  const currentUser = useAuthStore((s) => s.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState({
    throughput: 4.2,
    latency: 4,
    uptime: 99.98,
  });
  const [showDocs, setShowDocs] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingXls, setDownloadingXls] = useState(false);

  // Password Reset Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<Analyst | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Add User Modal State
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [showAddUserPassword, setShowAddUserPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "analyst",
    organization_id: "",
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
          if (roleStr === "super_admin") clearanceLevel = "Level-05";
          else if (roleStr === "admin") clearanceLevel = "Level-04";
          else if (roleStr === "manager") clearanceLevel = "Level-03";
          else if (roleStr === "auditor") clearanceLevel = "Level-02";
          else if (roleStr === "analyst") clearanceLevel = "Level-01";

          return {
            id: u.id,
            name: u.full_name,
            email: u.email,
            role: roleStr,
            status: "active",
            lastActive: u.email === currentUser?.email ? "Online" : "Offline",
            clearance: clearanceLevel,
            organizationName: u.organization_name || undefined,
          };
        });

        setAnalysts(mappedUsers);
        setAuditLogs(auditRes.data);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        toast.error(
          "Failed to load data from server. Make sure the backend is running.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.email]);

  useEffect(() => {
    if (currentUser?.role === "super_admin") {
      api.get<any[]>("/api/v1/super/organizations")
        .then((res) => {
          setOrganizations(res.data);
        })
        .catch((err) => {
          console.error("Failed to fetch organizations for dropdown:", err);
        });
    }
  }, [currentUser]);

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
        const errorData = await res
          .json()
          .catch(() => ({ detail: "Failed to download PDF" }));
        throw new Error(errorData.detail || "Failed to download PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `colonyai-admin-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!");
    } catch (e: any) {
      console.error("PDF Download Error:", e);
      toast.error(e.message || "Failed to download PDF");
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
        const errorData = await res
          .json()
          .catch(() => ({ detail: "Failed to download Excel" }));
        throw new Error(errorData.detail || "Failed to download Excel");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `colonyai-admin-analytics-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Excel data downloaded successfully!");
    } catch (e: any) {
      console.error("Excel Download Error:", e);
      toast.error(e.message || "Failed to download Excel");
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
    // Password complexity check
    if (newUserData.password !== confirmPassword) {
      toast.error("Passwords do not match!");
      setIsCreating(false);
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$/;
    if (!passwordRegex.test(newUserData.password)) {
      toast.error(
        "Password must be at least 12 characters and contain uppercase, lowercase, number, and special character.",
      );
      setIsCreating(false);
      return;
    }

    if (currentUser?.role === "super_admin" && !newUserData.organization_id) {
      toast.error("Please select a company/organization for the new staff member.");
      setIsCreating(false);
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        email: newUserData.email,
        password: newUserData.password,
        full_name: newUserData.full_name,
        role: newUserData.role,
        organization_id: currentUser?.role === "super_admin" ? newUserData.organization_id : undefined,
      };

      await api.post("/api/v1/auth/register", payload);
      toast.success(`User ${newUserData.full_name} has been provisioned.`);
      setAddUserModalOpen(false);
      setNewUserData({
        email: "",
        password: "",
        full_name: "",
        role: "analyst",
        organization_id: "",
      });
      setConfirmPassword("");
      setShowAddUserPassword(false);
      setShowConfirmPassword(false);

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
          organizationName: u.organization_name || undefined,
        };
      });
      setAnalysts(mappedUsers);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create user.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!targetUser || !newPassword) return;

    // Password complexity check
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error(
        "Password must be at least 12 characters and contain uppercase, lowercase, number, and special character.",
      );
      setIsResetting(false);
      return;
    }

    try {
      await api.post("/api/v1/users/admin-reset-password", {
        user_id: targetUser.id,
        new_password: newPassword,
      });
      toast.success(`Password for ${targetUser.name} reset successfully.`);
      setResetModalOpen(false);
      setNewPassword("");
      setShowResetPassword(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to reset password.");
    } finally {
      setIsResetting(false);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden pb-12 bg-[#f4f7f6] dark:bg-slate-950 transition-colors duration-300">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        <div
          className={`flex-1 transition-all duration-300 ${showDocs ? "lg:mr-[350px]" : ""}`}
        >
          <div className="max-w-[1500px] mx-auto px-6 py-0 pt-0">
            <div className="space-y-6">
              {/* Header Administration */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div>
                    <h1 className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                      {t("administration.systemControl")}
                    </h1>
                    <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
                      {t("administration.nodeAuthorization")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none flex items-center gap-2 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                      {t("administration.masterNodeOperational")}
                    </span>
                  </div>
                  <DocumentationToggle
                    showDocs={showDocs}
                    setShowDocs={setShowDocs}
                    text={t("administration.controlSop")}
                  />
                  <button
                    onClick={() => setAddUserModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-slate-900 dark:text-slate-950 font-bold rounded-none text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md shadow-primary/10"
                  >
                    <Plus className="w-3.5 h-3.5" />{" "}
                    {t("administration.provisionNewStaff")}
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    label: t("administration.activeClusters"),
                    value: "12/12",
                    sub: "Optimal",
                    icon: Activity,
                    color: "emerald",
                  },
                  {
                    label: t("administration.securityClearance"),
                    value: "Level-04",
                    sub: t("administration.rootAccess"),
                    icon: ShieldCheck,
                    color: "primary",
                  },
                  {
                    label: t("administration.systemUptime"),
                    value: `${performance.uptime}%`,
                    sub: "Real-time",
                    icon: Database,
                    color: "purple",
                  },
                  {
                    label: t("administration.totalNodes"),
                    value: analysts.length.toString(),
                    sub: t("administration.authorized"),
                    icon: Users,
                    color: "blue",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className={`backdrop-blur-sm border p-2 sm:p-4 rounded-none shadow-sm hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden group ${
                      s.color === "emerald"
                        ? "bg-emerald-50/40 border-emerald-100/50 dark:bg-emerald-950/20 dark:border-emerald-900/40"
                        : s.color === "primary"
                          ? "bg-indigo-50/40 border-indigo-100/50 dark:bg-indigo-950/20 dark:border-indigo-900/40"
                          : s.color === "purple"
                            ? "bg-purple-50/40 border-purple-100/50 dark:bg-purple-950/20 dark:border-purple-900/40"
                            : "bg-blue-50/40 border-blue-100/50 dark:bg-blue-950/20 dark:border-blue-900/40"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                      <div
                        className={`p-1 sm:p-1.5 rounded-sm transition-colors ${
                          s.color === "emerald"
                            ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : s.color === "primary"
                              ? "bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400"
                              : s.color === "purple"
                                ? "bg-purple-50 text-purple-500 dark:bg-purple-900/30 dark:text-purple-400"
                                : "bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        <s.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <span className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        ID-0{i + 1}
                      </span>
                    </div>
                    <div className="z-10">
                      <p className="text-slate-400 dark:text-slate-500 text-[6px] sm:text-[8px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-0.5">
                        {s.label}
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <h3 className="text-sm sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tighter tabular-nums">
                          {s.value}
                        </h3>
                        <span className="text-[8px] sm:text-[10px] font-bold text-primary opacity-80">
                          {s.sub}
                        </span>
                      </div>
                    </div>
                    <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                      <s.icon className="w-8 h-8 sm:w-12 sm:h-12" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Personnel Registry */}
              <div className="lg:col-span-12">
                <div className="dashboard-card overflow-hidden !p-0 rounded-none border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                          {t("administration.authorizedPersonnelRegistry")}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                          {t("administration.verifiedAnalysts")}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setCurrentPage(1);
                            }}
                            placeholder={t("administration.searchNameEmail")}
                            className="pl-7 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-primary/10 outline-none w-44"
                          />
                        </div>
                        {/* Role filter */}
                        <select
                          value={filterRole}
                          onChange={(e) => {
                            setFilterRole(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="py-1.5 px-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/10 outline-none"
                        >
                          <option value="">
                            {t("administration.allRoles")}
                          </option>
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="auditor">Auditor</option>
                          <option value="analyst">Analyst</option>
                        </select>
                        {/* Company filter */}
                        <select
                          value={filterCompany}
                          onChange={(e) => {
                            setFilterCompany(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="py-1.5 px-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/10 outline-none max-w-[180px]"
                        >
                          <option value="">
                            {t("administration.allCompanies")}
                          </option>
                          {Array.from(
                            new Set(
                              analysts
                                .map((a) => a.organizationName)
                                .filter(Boolean),
                            ),
                          )
                            .sort()
                            .map((org) => (
                              <option key={org} value={org!}>
                                {org}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Analyst Node
                          </th>
                          <th className="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Company
                          </th>
                          <th className="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Clearance
                          </th>
                          <th className="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Status
                          </th>
                          <th className="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Last Pulse
                          </th>
                          <th className="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {(() => {
                          const filtered = analysts.filter((a) => {
                            const q = searchQuery.toLowerCase();
                            const matchSearch =
                              !q ||
                              a.name.toLowerCase().includes(q) ||
                              a.email.toLowerCase().includes(q) ||
                              a.role.toLowerCase().includes(q);
                            const matchRole =
                              !filterRole || a.role === filterRole;
                            const matchCompany =
                              !filterCompany ||
                              a.organizationName === filterCompany;
                            return matchSearch && matchRole && matchCompany;
                          });
                          const totalPages = Math.max(
                            1,
                            Math.ceil(filtered.length / PAGE_SIZE),
                          );
                          const safePage = Math.min(currentPage, totalPages);
                          const paginated = filtered.slice(
                            (safePage - 1) * PAGE_SIZE,
                            safePage * PAGE_SIZE,
                          );

                          return (
                            <>
                              {paginated.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-600"
                                  >
                                    {t("administration.noDataMatchingFilters")}
                                  </td>
                                </tr>
                              ) : (
                                paginated.map((a) => (
                                  <tr
                                    key={a.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border-b border-slate-100 dark:border-slate-800 last:border-0"
                                  >
                                    <td className="px-4 py-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                                          {a.name.charAt(0)}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-1.5 mb-0.5">
                                            <p className="text-[11px] font-bold text-slate-900 dark:text-white">
                                              {a.name}
                                            </p>
                                            <span
                                              className={`px-1 py-0.5 text-[8px] font-black uppercase tracking-widest rounded ${
                                                a.role === "super_admin"
                                                  ? "bg-rose-100 text-rose-600"
                                                  : a.role === "admin"
                                                    ? "bg-primary/10 text-primary"
                                                    : a.role === "manager"
                                                      ? "bg-amber-100 text-amber-700"
                                                      : a.role === "auditor"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                              }`}
                                            >
                                              {a.role}
                                            </span>
                                          </div>
                                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                            {a.email}
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-2">
                                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                        {a.organizationName || (
                                          <span className="text-slate-300 dark:text-slate-700 italic">
                                            —
                                          </span>
                                        )}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2">
                                      <span className="px-2 py-0.5 rounded-none bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase">
                                        {a.clearance}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2">
                                      <div className="flex items-center gap-1.5">
                                        <div
                                          className={`w-1.5 h-1.5 rounded-full ${a.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`}
                                        />
                                        <span
                                          className={`text-[10px] font-black uppercase tracking-widest ${a.status === "active" ? "text-emerald-600" : "text-rose-600"}`}
                                        >
                                          {a.status}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-2">
                                      <span
                                        className={`text-[10px] font-bold uppercase tracking-tighter ${
                                          a.lastActive === "Online"
                                            ? "text-emerald-600"
                                            : "text-slate-400 dark:text-slate-600"
                                        }`}
                                      >
                                        {a.lastActive}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <button
                                          onClick={() => {
                                            setTargetUser(a);
                                            setResetModalOpen(true);
                                          }}
                                          className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-primary hover:bg-primary/5 rounded-none transition-all"
                                          title="Reset Password"
                                        >
                                          <Key className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleToggleStatus(a.id)
                                          }
                                          className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 rounded-none transition-all"
                                          title="Suspend Node"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                              {/* Pagination Footer */}
                              <tr>
                                <td colSpan={6}>
                                  <div className="px-5 py-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                      {filtered.length === 0
                                        ? "0"
                                        : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)}`}{" "}
                                      dari {filtered.length} personel
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        disabled={safePage <= 1}
                                        onClick={() =>
                                          setCurrentPage((p) =>
                                            Math.max(1, p - 1),
                                          )
                                        }
                                        className="px-3 py-1 text-[10px] font-black uppercase rounded-none border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                      >
                                        ← Prev
                                      </button>
                                      {(() => {
                                        const pages: (number | string)[] = [];
                                        if (totalPages <= 5) {
                                          for (let i = 1; i <= totalPages; i++)
                                            pages.push(i);
                                        } else {
                                          pages.push(1);
                                          if (safePage > 3) pages.push("...");
                                          for (
                                            let i = Math.max(2, safePage - 1);
                                            i <=
                                            Math.min(
                                              totalPages - 1,
                                              safePage + 1,
                                            );
                                            i++
                                          )
                                            pages.push(i);
                                          if (safePage < totalPages - 2)
                                            pages.push("...");
                                          pages.push(totalPages);
                                        }
                                        return pages.map((p, idx) =>
                                          p === "..." ? (
                                            <span
                                              key={`e-${idx}`}
                                              className="w-7 h-7 flex items-center justify-center text-[10px] text-slate-300"
                                            >
                                              …
                                            </span>
                                          ) : (
                                            <button
                                              key={p}
                                              onClick={() =>
                                                setCurrentPage(p as number)
                                              }
                                              className={`w-7 h-7 text-[10px] font-black rounded-none transition-all ${
                                                p === safePage
                                                  ? "bg-slate-900 dark:bg-primary text-white"
                                                  : "border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                              }`}
                                            >
                                              {p}
                                            </button>
                                          ),
                                        );
                                      })()}
                                      <button
                                        disabled={safePage >= totalPages}
                                        onClick={() =>
                                          setCurrentPage((p) =>
                                            Math.min(totalPages, p + 1),
                                          )
                                        }
                                        className="px-3 py-1 text-[10px] font-black uppercase rounded-none border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                      >
                                        Next →
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Password Reset Requests */}
              <div className="lg:col-span-12">
                <div className="dashboard-card overflow-hidden !p-0 rounded-none border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors">
                  <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <ResetRequestsPanel />
                  </div>
                </div>
              </div>

              {/* Export Hub */}
              <div className="lg:col-span-12">
                <div className="dashboard-card overflow-hidden !p-0 rounded-none border border-slate-200/60 dark:border-slate-800 shadow-lg group bg-white dark:bg-slate-900 transition-colors">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center border border-primary/20">
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
                          {t("administration.adminDataExportCenter")}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          {t("administration.dataExtractionProtocol")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-none">
                        <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          ISO-17025 Compliant
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/30 dark:bg-slate-800/30">
                    {/* PDF Export */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-none p-5 flex flex-col gap-3 hover:border-red-200 dark:hover:border-red-900/40 hover:shadow-xl transition-all group/pdf relative overflow-hidden">
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-none bg-red-50 border border-red-100 flex items-center justify-center group-hover/pdf:scale-110 transition-transform">
                          <FileText className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                            {t("administration.masterGovernanceLedger")}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {t("administration.comprehensivePdf")}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium relative z-10">
                        {t("administration.pdfDescription")}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-2 relative z-10">
                        {[
                          "Global Summary",
                          "Per-User Stats",
                          "Audit Trail",
                        ].map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 rounded-none uppercase tracking-widest"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={handleDownloadPdf}
                        disabled={downloadingPdf}
                        className="w-fit self-start px-5 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-none text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 relative z-10 mt-1"
                      >
                        {downloadingPdf ? t("administration.buildingLedger") : <><Download className="w-3.5 h-3.5" /> {t("administration.downloadMasterPdf")}</>}
                      </button>
                    </div>

                    {/* Excel Export */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-none p-5 flex flex-col gap-3 hover:border-emerald-200 dark:hover:border-emerald-900/40 hover:shadow-xl transition-all group/excel relative overflow-hidden">
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-none bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover/excel:scale-110 transition-transform">
                          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                            {t("administration.rawAnalyticsDataset")}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {t("administration.multiSheetExcel")}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium relative z-10">
                        {t("administration.excelDescription")}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-2 relative z-10">
                        {["Raw Records", "BI Sync", "Diagnostic Matrix"].map(
                          (tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 rounded-none uppercase tracking-widest"
                            >
                              {tag}
                            </span>
                          ),
                        )}
                      </div>

                      <button
                        onClick={handleDownloadExcel}
                        disabled={downloadingXls}
                        className="w-fit self-start px-5 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-none text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 relative z-10 mt-1"
                      >
                        {downloadingXls ? t("administration.buildingMatrix") : <><Download className="w-3.5 h-3.5" /> {t("administration.downloadAnalyticsExcel")}</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Audit Trail - MOVED BELOW */}
              <div className="lg:col-span-12">
                <div className="dashboard-card overflow-hidden !p-0 rounded-none border border-slate-200/60 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 transition-colors">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                      <div>
                        <h3 className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
                          Recent System Audit Trail
                        </h3>
                        <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                          Real-time Immutable Ledger Snapshot
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        (window.location.href = "/dashboard/audit")
                      }
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-none transition-all border border-white/5"
                    >
                      View Full
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {auditLogs.slice(0, 10).map((log) => (
                      <div
                        key={log.id}
                        className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                      >
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-300 font-mono group-hover:text-primary transition-colors">
                              #{log.id.substring(0, 8)}
                            </span>
                            <div className="w-[1px] h-3 bg-slate-100 my-1" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
                              {log.action}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
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
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden md:block">
                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-[10px] font-bold text-slate-300 mt-0.5 font-mono tracking-tighter">
                              {new Date(log.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </p>
                          </div>
                          <div className="w-20 text-right">
                            <span
                              className={`inline-block text-[9px] font-black px-2.5 py-1 rounded-none border uppercase tracking-widest shadow-sm ${
                                log.status === "SUCCESS"
                                  ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                  : log.status === "FAILED"
                                    ? "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                                    : "bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                              }`}
                            >
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
          title="Node Governance"
          description="Personnel Management SOP and Real-time System Performance Monitoring."
          rawText={`NODE GOVERNANCE & COLONYAI SYSTEM
==================================

1. OVERVIEW
The Node Governance module is the command center for Administrators to manage staff authorization and monitor infrastructure health.

2. GOVERNANCE PROTOCOL
A. ANALYST PROVISIONING: Register new analyst accounts with specific Clearance Levels (Level 01-04).
B. ACCESS REVOCATION: Instantly freeze (Suspend) access for security risk mitigation.
C. SYSTEM AUDITING: Real-time monitoring of system activity logs via Immutable Ledger.

3. MASTER EXPORT CENTER
- Governance Ledger: Comprehensive PDF export for ISO-17025 external audits.
- Analytical Dataset: Raw Excel export for laboratory information system (LIMS) integration.

STATUS: GOVERNANCE ACTIVE
AUTHORITY: MASTER ROOT`}
        >
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                01
              </span>
              <h2 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">
                Overview
              </h2>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-800/50 p-2.5 rounded-none border border-slate-100 dark:border-slate-800">
              The Node Governance module is purpose-built for Administrators
              as a command center for staff authorization and operational
              server health monitoring.
            </p>
          </section>

          <section className="space-y-3 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                02
              </span>
              <h2 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">
                Governance Protocol
              </h2>
            </div>
            <div className="space-y-3 ml-0.5">
              {[
                {
                  id: "1",
                  title: "Analyst Provisioning",
                  desc: 'Use "Provision New Node" to register new analyst accounts with specific Clearance Levels.',
                },
                {
                  id: "2",
                  title: "Access Revocation",
                  desc: "Administrators can freeze (Suspend) any analyst's access via the Action Toggle in the Registry table.",
                },
                {
                  id: "3",
                  title: "Master Export Center",
                  desc: "Use the PDF/Excel export feature to generate official governance reports compliant with ISO-17025 standards.",
                },
              ].map((step) => (
                <div key={step.id} className="flex gap-2.5 group">
                  <span className="flex-shrink-0 w-4.5 h-4.5 rounded bg-slate-900 dark:bg-slate-950 text-white text-[8px] font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    {step.id}
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="text-[10px] font-bold text-slate-900 dark:text-white">
                      {step.title}
                    </h4>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {step.desc}
                    </p>
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
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isResetting && setResetModalOpen(false)}
          />
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-none flex items-center justify-center shadow-lg shadow-primary/20">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Reset Authority
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Protocol-09 Security Recovery
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-none border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                    Target Analyst
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {targetUser.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {targetUser.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                    New Professional Password
                  </label>
                  <div className="relative">
                    <input
                      type={showResetPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 pr-12"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showResetPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight italic">
                    Minimum 12 characters with Uppercase, Lowercase, Number, and
                    Special Char.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setResetModalOpen(false)}
                  disabled={isResetting}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-slate-100 transition-all border border-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={isResetting || !newPassword}
                  className="flex-[2] py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-none shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
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
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isCreating && setAddUserModalOpen(false)}
          />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-none flex items-center justify-center shadow-lg shadow-slate-900/20">
                  <UserPlus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Provision Staff
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Authorized Personnel Onboarding
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Full Legal Name
                    </label>
                    <input
                      required
                      type="text"
                      value={newUserData.full_name}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          full_name: e.target.value,
                        })
                      }
                      placeholder="e.g. John Doe"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                      Assigned Role
                    </label>
                    <select
                      value={newUserData.role}
                      onChange={(e) =>
                        setNewUserData({ ...newUserData, role: e.target.value })
                      }
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    >
                      <option value="analyst">Analyst (Level-01)</option>
                      <option value="auditor">Auditor (Level-02)</option>
                      <option value="manager">Manager (Level-03)</option>
                      <option value="admin">Admin (Level-04)</option>
                    </select>
                  </div>
                </div>

                {currentUser?.role === "super_admin" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                      Assign Company / Organization
                    </label>
                    <select
                      required
                      value={newUserData.organization_id}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          organization_id: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    >
                      <option value="">Select Company...</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} ({org.location || "Global"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Email Identifier
                  </label>
                  <input
                    required
                    type="email"
                    value={newUserData.email}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, email: e.target.value })
                    }
                    placeholder="staff@laboratory.diag"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Temporary Password
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showAddUserPassword ? "text" : "password"}
                      value={newUserData.password}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          password: e.target.value,
                        })
                      }
                      placeholder="••••••••••••"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddUserPassword(!showAddUserPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showAddUserPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight italic">
                    Minimum 12 characters with Uppercase, Lowercase, Number, and
                    Special Char.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Confirm Temporary Password
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  disabled={isCreating}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-slate-100 transition-all border border-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-[2] py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-none shadow-lg shadow-slate-900/20 hover:bg-primary transition-all disabled:opacity-50"
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

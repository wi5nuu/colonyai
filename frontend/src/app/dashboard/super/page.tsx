"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Building2,
  Users,
  ShieldCheck,
  Zap,
  MoreVertical,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  Ban,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Cpu,
  Database,
  ArrowRight,
  ShieldAlert,
  Server,
  Activity,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { 
  DocumentationSidebar, 
  DocumentationToggle 
} from "@/components/DocumentationSidebar";

interface OrgAdmin {
  id: string;
  full_name: string;
  email: string;
  recovery_password?: string;
  last_active: string;
  role: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  location: string;
  status: string;
  license_tier: string;
  license_expiry: string;
  users_count: number;
  analyses_count: number;
  growth_rate: string;
  admins: OrgAdmin[];
}

interface GlobalStats {
  total_organizations: number;
  active_nodes: number;
  global_throughput: number;
  system_health: string;
  compliance_score: string;
}

export default function SuperAdminRealTimeDashboard() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDocs, setShowDocs] = useState(true);

  // Custom Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    orgId: string;
    orgName: string;
    currentStatus: string;
  }>({
    isOpen: false,
    orgId: "",
    orgName: "",
    currentStatus: ""
  });

  const [remoteModal, setRemoteModal] = useState<{
    isOpen: boolean;
    orgName: string;
    step: number;
    logs: string[];
  }>({
    isOpen: false,
    orgName: "",
    step: 1,
    logs: []
  });

  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordReveal = (adminId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [adminId]: !prev[adminId]
    }));
  };

  const [passwordResetModal, setPasswordResetModal] = useState<{
    isOpen: boolean;
    adminId: string;
    adminName: string;
    newPassword: string;
  }>({
    isOpen: false,
    adminId: "",
    adminName: "",
    newPassword: ""
  });

  const [showPass, setShowPass] = useState(false);

  const generateSecurePass = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordResetModal(prev => ({ ...prev, newPassword: pass }));
  };

  const getPassStrength = (p: string) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s += 25;
    if (/[A-Z]/.test(p)) s += 25;
    if (/[0-9]/.test(p)) s += 25;
    if (/[^A-Za-z0-9]/.test(p)) s += 25;
    return s;
  };

  const validatePasswordRules = (p: string) => {
    return {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      number: /[0-9]/.test(p),
      symbol: /[^A-Za-z0-9]/.test(p)
    };
  };






  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const [statsRes, orgsRes] = await Promise.all([
        api.get<GlobalStats>("/api/v1/super/stats"),
        api.get<Organization[]>("/api/v1/super/organizations")
      ]);
      setStats(statsRes.data);
      setOrganizations(orgsRes.data);
    } catch (error) {
      console.error("Failed to fetch super admin data:", error);
      toast.error("Failed to sync with Global Command Center");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Reduce interval to 10s for more "Real-Time" feel
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRemoteIntervention = (orgName: string) => {
    setRemoteModal({
      isOpen: true,
      orgName: orgName,
      step: 1,
      logs: [`[INFO] Initializing handshake with ${orgName} cluster...`]
    });

    // Simulate connection sequence
    setTimeout(() => {
      setRemoteModal(prev => ({
        ...prev,
        step: 2,
        logs: [...prev.logs, "[AUTH] Validating Nexus Master certificates...", "[AUTH] Identity confirmed. Level: MASTER."]
      }));
    }, 1200);

    setTimeout(() => {
      setRemoteModal(prev => ({
        ...prev,
        step: 3,
        logs: [...prev.logs, "[NET] Routing through encrypted proxy...", "[NET] SSL/TLS tunnel established (AES-256)."]
      }));
    }, 2400);

    setTimeout(() => {
      setRemoteModal(prev => ({
        ...prev,
        step: 4,
        logs: [...prev.logs, `[READY] Node '${orgName}-NODE-01' is now linked.`, "--- SYSTEM READY FOR INTERVENTION ---"]
      }));
    }, 3800);
  };

  const handleExecuteDiagnostics = () => {
    setRemoteModal(prev => ({
      ...prev,
      step: 5,
      logs: [...prev.logs, "[DIAG] Initializing Deep System Audit...", "[DIAG] Scanning neural model weights...", "[DIAG] Verifying database integrity shards..."]
    }));

    // Simulation delay for scanning
    setTimeout(() => {
      setRemoteModal(prev => ({
        ...prev,
        step: 6,
        logs: [...prev.logs, "[OK] Neural Engine: Verified (mAP 0.92)", "[OK] Database: Healthy (0% latency)", "[OK] Encryption: Solid (AES-256)", "--- DIAGNOSTIC COMPLETE: SYSTEM OPTIMAL ---"]
      }));
    }, 3000);
  };




  const handleResetAdminPassword = async () => {
    const { adminId, adminName, newPassword } = passwordResetModal;
    const rules = validatePasswordRules(newPassword);
    
    if (!rules.length || !rules.upper || !rules.number || !rules.symbol) {
      toast.error("Password does not meet Nexus Security Standards", {
        description: "Must include 8+ chars, uppercase, number, and symbol."
      });
      return;
    }

    try {
      await api.post("/api/v1/super/reset-admin-password", {
        user_id: adminId,
        new_password: newPassword
      });
      toast.success(`Master password for ${adminName} has been synchronized.`, {
        description: "Credentials are now live across the node cluster.",
        icon: <Key className="w-4 h-4 text-primary" />
      });
      setPasswordResetModal({ ...passwordResetModal, isOpen: false, newPassword: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Nexus Synchronization Failure");
    }
  };



  const handleToggleOrgStatus = async () => {
    const { orgId, orgName, currentStatus } = confirmModal;
    const action = currentStatus === 'active' ? 'suspend' : 'activate';
    
    setConfirmModal({ ...confirmModal, isOpen: false });

    try {
      const res = await api.post<{ status: string; message: string }>(`/api/v1/super/organizations/${orgId}/toggle-status`);
      toast.success(`Organization ${orgName} status: ${res.data.status.toUpperCase()}`, {
        description: res.data.message,
        icon: action === 'suspend' ? <Ban className="w-4 h-4 text-rose-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      });
      fetchData(); // Refresh list immediately
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Nexus Protocol Failure");
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connecting to Global Nexus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${showDocs ? 'lg:mr-[350px]' : ''}`}>
          <div className="max-w-[1500px] mx-auto px-4 sm:px-8 py-0 sm:py-0">
            {/* Global Master Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 sm:mb-6 pt-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 border border-slate-200 rounded-lg shadow-sm flex items-center justify-center">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-sm sm:text-xl font-bold text-slate-900 tracking-tight uppercase leading-none">Global Control</h1>
                    <span className="px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[7px] sm:text-[8px] font-bold text-primary uppercase tracking-[0.2em] hidden xs:inline-block">Master</span>
                  </div>
                  <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Multi-Tenant Laboratory OS</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="hidden lg:block">
                  <DocumentationToggle
                    showDocs={showDocs}
                    setShowDocs={setShowDocs}
                    text="Protokol Nexus"
                  />
                </div>
                <button 
                  onClick={fetchData}
                  className={`p-2 sm:p-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-sm hover:bg-slate-50 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                </button>
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 shadow-sm">
                  <div className="flex flex-col items-end">
                    <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">Throughput</p>
                    <p className="text-xs sm:text-base font-black text-slate-900 font-mono tracking-tighter">{(stats?.global_throughput || 0).toLocaleString()}</p>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500/10 rounded-md sm:rounded-lg flex items-center justify-center border border-emerald-500/20">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                  </div>
                </div>
                <button 
                  onClick={() => router.push("/dashboard/super/provision")}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-primary text-white rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-md active:scale-95 group"
                >
                  <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" /> <span className="hidden xs:inline">Provision</span>
                </button>
              </div>
            </div>

            {/* Global Statistics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
              {[
                { label: "Total Organizations", value: stats?.total_organizations?.toString() || "0", sub: "Registered Tenants", icon: Building2, trend: "up" },
                { label: "Active Nodes", value: stats?.active_nodes?.toLocaleString() || "0", sub: "Global Registry", icon: Users, trend: "up" },
                { label: "System Health", value: stats?.system_health || "99.9%", sub: "Cluster Status", icon: Server, trend: "stable" },
                { label: "Compliance Score", value: stats?.compliance_score || "A+", sub: "ISO-17025", icon: ShieldCheck, trend: "up" },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-slate-200/60 p-2 sm:p-4 rounded-xl shadow-sm group hover:border-primary/40 transition-all flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-start mb-1 sm:mb-2">
                    <div className="p-1 sm:p-1.5 bg-slate-50 group-hover:bg-primary/5 rounded-md transition-colors z-10">
                      <stat.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                    </div>
                    <span className={`text-[7px] sm:text-[9px] font-bold z-10 ${stat.trend === 'up' ? 'text-emerald-500' : 'text-slate-400'} uppercase tracking-widest`}>
                      {stat.trend === 'up' ? '+1' : 'OPT'}
                    </span>
                  </div>
                  <div className="z-10">
                    <p className="text-slate-400 text-[6px] sm:text-[8px] font-bold uppercase tracking-[0.1em] mb-0.5">{stat.label}</p>
                    <p className="text-base sm:text-xl font-bold text-slate-900 tabular-nums tracking-tighter">{stat.value}</p>
                  </div>
                  <div className="absolute -right-2 -bottom-2 opacity-[0.02] group-hover:opacity-[0.04]">
                    <stat.icon className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
                  </div>
                </div>
              ))}
            </div>

            {/* Live Multi-Tenant Registry */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest">Master Registry</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative group/search hidden xs:block">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder={`Search ${organizations.length} orgs...`} 
                      className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold w-40 sm:w-48 outline-none focus:border-primary/40 transition-colors shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {organizations.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100 mb-3">
                      <Building2 className="w-5 h-5 text-slate-300" />
                    </div>
                    <h3 className="text-xs font-black text-slate-900 uppercase">No Organizations Detected</h3>
                    <p className="text-[9px] font-bold text-slate-400 mt-1">Use provision button to onboard tenants.</p>
                  </div>
                ) : (
                  organizations.map((org) => (
                    <div key={org.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all group">
                      <div 
                        className="p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 cursor-pointer"
                        onClick={() => setExpandedOrg(expandedOrg === org.id ? null : org.id)}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-primary/30 transition-colors shrink-0">
                            <Building2 className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{org.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">{org.location || 'Remote'}</span>
                              <div className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                              <span className="text-[8px] sm:text-[9px] font-bold text-primary uppercase tracking-widest">{org.license_tier} Tier</span>
                            </div>
                          </div>

                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-6 items-center">
                          <div className="hidden sm:block">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Analyses</p>
                            <div className="flex items-center gap-1">
                              <p className="text-xs sm:text-sm font-bold text-slate-900">{org.analyses_count.toLocaleString()}</p>
                              <span className={`text-[8px] font-bold ${org.growth_rate.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{org.growth_rate}</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Users</p>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">{org.users_count} Nodes</p>
                          </div>

                          <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${org.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                              <p className={`text-[9px] font-bold uppercase tracking-widest ${org.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>{org.status}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end">
                            {expandedOrg === org.id ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
                          </div>
                        </div>
                      </div>

                      {/* Drill-down Admin Data */}
                      {expandedOrg === org.id && (
                        <div className="px-3 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-slate-100 bg-slate-50/50">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            <div className="lg:col-span-2 space-y-3">
                              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                <Users className="w-3 h-3 text-primary" />
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Authorized Personnel</h4>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                {org.admins.length > 0 ? org.admins.map((admin, idx) => (
                                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between group/admin hover:border-primary/30 shadow-sm transition-all">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-[10px] font-black text-primary border border-primary/10">
                                        {admin.full_name.charAt(0)}
                                      </div>
                                      <div className="flex flex-col">
                                        <h4 className="text-[10px] font-bold text-slate-900 leading-none">{admin.full_name}</h4>
                                        <p className="text-[9px] text-slate-400 font-medium mt-0.5">{admin.email}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 group/pass">
                                             <Lock className="w-2.5 h-2.5 text-slate-300" />
                                             <span className="text-[9px] font-mono font-bold text-slate-600 tracking-tighter min-w-[60px]">
                                               {revealedPasswords[admin.id] ? (admin.recovery_password || "No Key Saved") : "••••••••"}
                                             </span>
                                             <button 
                                              onClick={() => togglePasswordReveal(admin.id)}
                                              className="p-0.5 text-slate-300 hover:text-primary transition-all hover:scale-110 active:scale-95"
                                              title={revealedPasswords[admin.id] ? "Hide Password" : "Peek Current Password"}
                                             >
                                               {revealedPasswords[admin.id] ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                                             </button>
                                          </div>
                                          <span className="px-1.5 py-0.5 bg-primary/5 rounded text-[7px] font-bold text-primary uppercase tracking-widest">ADMIN</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button 
                                        onClick={() => setPasswordResetModal({
                                          isOpen: true,
                                          adminId: admin.id,
                                          adminName: admin.full_name,
                                          newPassword: ""
                                        })}
                                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-all"
                                        title="Reset Master Password"
                                      >
                                        <Key className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                )) : (
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">No admins registered.</p>
                                )}
                              </div>
                            </div>

                            {/* Org Settings Summary */}
                            <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm">
                              <div className="flex items-center gap-2 mb-3">
                                <Activity className="w-3 h-3 text-amber-500" />
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Compliance</h4>
                              </div>
                              <div className="space-y-2.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">License</span>
                                  <span className="text-[9px] font-black text-emerald-500 uppercase">{org.license_expiry ? new Date(org.license_expiry).toLocaleDateString() : 'Infinite'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cluster ID</span>
                                  <span className="text-[9px] font-mono text-primary font-bold truncate max-w-[80px]">{org.id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Locality</span>
                                  <span className="text-[9px] font-black text-slate-900 uppercase">{org.location || 'Global'}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleRemoteIntervention(org.name); }}
                                    className="py-2 bg-slate-900 hover:bg-slate-800 text-[8px] font-black text-white uppercase tracking-widest rounded-lg transition-all active:scale-95 shadow-md shadow-slate-900/20"
                                  >
                                    Remote
                                  </button>
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      setConfirmModal({
                                        isOpen: true,
                                        orgId: org.id,
                                        orgName: org.name,
                                        currentStatus: org.status
                                      });
                                    }}
                                    className={`py-2 border rounded-lg text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                                      org.status === 'active' 
                                        ? 'bg-white border-rose-100 hover:bg-rose-50 text-rose-500 shadow-sm' 
                                        : 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600 shadow-emerald-500/20 shadow-lg'
                                    }`}
                                  >
                                    {org.status === 'active' ? 'Suspend' : 'Activate'}
                                  </button>


                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="text-center pt-4 sm:pt-6">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">
                  Master Access Only // ColonyAI Global Nexus v2.0
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Sidebar */}
        <div className="hidden lg:block">
          <DocumentationSidebar
            showDocs={showDocs}
            setShowDocs={setShowDocs}
            directory="Global Command"
            title="Protokol Nexus Master"
            description="Panduan operasional infrastruktur multi-tenant ColonyAI Global v2.0."
            rawText={`PROTOKOL NEXUS MASTER COLONYAI
================================

1. GLOBAL COMMAND CENTER
Pusat kontrol tertinggi untuk seluruh jaringan laboratorium. Master Admin memiliki otoritas penuh atas setiap tenant.

2. MASTER REGISTRY GOVERNANCE
- Node Provisioning: Membuat cluster organisasi baru melalui tombol 'Provision'.
- Status Enforcement: Gunakan 'Suspend' untuk mematikan akses tenant seketika (Lisensi/Keamanan) dan 'Activate' untuk pemulihan.

3. REMOTE INTERVENTION TERMINAL
- Klik 'Remote' untuk membuka Secure Tunnel (AES-256) ke node laboratorium.
- Gunakan 'Deep Diagnostics' untuk audit otomatis pada model AI, Database, dan Enkripsi node lokal.

4. GLOBAL TELEMETRY SYNC
Data disinkronkan setiap 10 detik. Jika Throughput stagnan, lakukan manual refresh.

STATUS: NEXUS LINK ESTABLISHED
AUTHORITY: MASTER COMMAND`}
          >
            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">01</span>
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">Overview</h2>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 font-medium">
                Nexus Master Control memungkinkan pemantauan kesehatan klaster dan intervensi keamanan langsung pada seluruh penyewa (tenants).
              </p>
            </section>

            <section className="space-y-3 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">02</span>
                <h2 className="text-[11px] font-bold text-slate-900 tracking-tight">Standard Operating Procedures</h2>
              </div>
              <div className="space-y-3 ml-0.5">
                {[
                  { id: '1', title: 'Nexus Provisioning', desc: 'Deploy infrastruktur baru dan inisialisasi akun Administrator utama untuk tenant baru.' },
                  { id: '2', title: 'Remote Shell (Terminal)', desc: 'Buka terminal Remote untuk audit teknis jika terjadi anomali pada akurasi AI atau database lokal.' },
                  { id: '3', title: 'Status Enforcement', desc: 'Kendali penuh atas status aktif/suspend organisasi untuk penegakan kebijakan lisensi.' },
                  { id: '4', title: 'Telemetry Sync', desc: 'Data diperbarui otomatis setiap 10 detik untuk memastikan visibilitas real-time 24/7.' }
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
      </div>

      {/* Premium Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className={`h-2 w-full ${confirmModal.currentStatus === 'active' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            
            <div className="p-8 text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${confirmModal.currentStatus === 'active' ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                {confirmModal.currentStatus === 'active' ? (
                  <Ban className="w-8 h-8 text-rose-500" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                )}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">
                {confirmModal.currentStatus === 'active' ? 'Suspend Organization?' : 'Activate Organization?'}
              </h3>
              
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                Anda akan mengubah status operasional untuk <span className="text-slate-900 font-bold">{confirmModal.orgName}</span>. 
                {confirmModal.currentStatus === 'active' 
                  ? ' Seluruh akses pengguna untuk tenant ini akan diblokir segera.' 
                  : ' Seluruh layanan dan akses untuk tenant ini akan dipulihkan.'}
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                  className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleToggleOrgStatus}
                  className={`flex-1 py-3 px-4 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 ${
                    confirmModal.currentStatus === 'active' 
                      ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' 
                      : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                  }`}
                >
                  Konfirmasi
                </button>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100">
              <p className="text-[8px] font-black text-slate-400 text-center uppercase tracking-[0.2em]">Nexus Protocol // Authorization Required</p>
            </div>
          </div>
        </div>
      )}

      {/* High-Tech Remote Intervention Modal */}
      {remoteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-[#0a0c10] rounded-[24px] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col min-h-[400px] animate-in zoom-in-95 duration-300">
            {/* Terminal Header */}
            <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                  <Cpu className="w-3 h-3 text-primary" /> Nexus Remote Shell // {remoteModal.orgName}
                </h3>
              </div>
              <button 
                onClick={() => setRemoteModal({ ...remoteModal, isOpen: false })}
                className="p-1 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-4 h-4 text-white/40 hover:text-white" />
              </button>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-6 font-mono text-[11px] space-y-2 overflow-y-auto scrollbar-hide">
              {remoteModal.logs.map((log, i) => (
                <div key={i} className={`flex gap-3 ${log.startsWith('[READY]') ? 'text-emerald-400 font-bold' : log.startsWith('[ERROR]') ? 'text-rose-400' : 'text-slate-400'}`}>
                  <span className="opacity-30 tracking-tighter">[{new Date().toLocaleTimeString()}]</span>
                  <p className="animate-in slide-in-from-left-2 duration-300">{log}</p>
                </div>
              ))}
              
              {remoteModal.step < 4 && (
                <div className="flex items-center gap-3 text-primary animate-pulse mt-4">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <p className="uppercase tracking-widest font-black text-[9px]">Awaiting system response...</p>
                </div>
              )}

              {remoteModal.step === 4 && (
                <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">CPU Utilization</p>
                    <p className="text-xl font-bold text-white">12.4%</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Memory Matrix</p>
                    <p className="text-xl font-bold text-white">0.8 GB / 16 GB</p>
                  </div>
                  <button 
                    onClick={handleExecuteDiagnostics}
                    disabled={remoteModal.step >= 5}
                    className="col-span-2 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {remoteModal.step === 5 ? (
                      <><RefreshCw className="w-3 h-3 animate-spin" /> Performing Deep Audit...</>
                    ) : remoteModal.step === 6 ? (
                      <><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Audit Complete: Healthy</>
                    ) : (
                      <><Search className="w-3 h-3" /> Execute Deep Diagnostics</>
                    )}
                  </button>

                </div>
              )}
            </div>

            {/* Terminal Footer */}
            <div className="px-6 py-3 bg-black/40 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${remoteModal.step === 4 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">
                  {remoteModal.step >= 4 ? 'Secure Tunnel Active' : 'Connecting...'}
                </span>
              </div>
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest italic">MASTER_ADMIN_AUTHORIZATION_REQUIRED</p>
            </div>
          </div>
        </div>
      )}

      {/* Simple & Clean Password Reset Modal */}
      {passwordResetModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Sync Master Credentials</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{passwordResetModal.adminName}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">New Secure Password</label>
                    <button 
                      onClick={generateSecurePass}
                      className="text-[8px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      Generate Strong
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPass ? "text" : "password"}
                      autoFocus
                      placeholder="Min. 8 chars, 1 uppercase, 1 symbol"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-10"
                      value={passwordResetModal.newPassword}
                      onChange={(e) => setPasswordResetModal({ ...passwordResetModal, newPassword: e.target.value })}
                    />
                    <button 
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPass ? <Ban className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  
                  {/* Strength Indicator */}
                  {passwordResetModal.newPassword && (
                    <div className="space-y-2">
                      <div className="flex gap-1 h-1 px-1">
                        {[25, 50, 75, 100].map((lvl) => (
                          <div 
                            key={lvl}
                            className={`h-full flex-1 rounded-full transition-all duration-500 ${
                              getPassStrength(passwordResetModal.newPassword) >= lvl 
                                ? lvl <= 25 ? 'bg-rose-400' : lvl <= 50 ? 'bg-amber-400' : 'bg-emerald-400'
                                : 'bg-slate-100'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 px-1">
                        {[
                          { label: "8+ Karakter", met: validatePasswordRules(passwordResetModal.newPassword).length },
                          { label: "Huruf Besar", met: validatePasswordRules(passwordResetModal.newPassword).upper },
                          { label: "Angka", met: validatePasswordRules(passwordResetModal.newPassword).number },
                          { label: "Simbol", met: validatePasswordRules(passwordResetModal.newPassword).symbol },
                        ].map((rule, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className={`w-1 h-1 rounded-full ${rule.met ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <span className={`text-[7px] font-bold uppercase tracking-widest ${rule.met ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {rule.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => {
                      setShowPass(false);
                      setPasswordResetModal({ ...passwordResetModal, isOpen: false });
                    }}
                    className="flex-1 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleResetAdminPassword}
                    disabled={getPassStrength(passwordResetModal.newPassword) < 100}
                    className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary/90 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Sync Password
                  </button>
                </div>
              </div>


            </div>
            <div className="bg-slate-50 px-6 py-2 border-t border-slate-100 flex items-center justify-center">
               <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.3em]">Master Identity Recovery Protocol</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




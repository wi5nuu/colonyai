"use client";

import React, { useState, useEffect } from "react";
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
  Mail,
  Calendar,
  RefreshCw,
  X,
  Shield,
  Key
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface OrgAdmin {
  id: string;
  full_name: string;
  email: string;
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
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Provisioning State
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [newOrgData, setNewOrgData] = useState({
    name: "",
    location: "",
    admin_email: "",
    admin_full_name: "",
    license_tier: "Enterprise"
  });
  const [provisionResult, setProvisionResult] = useState<any>(null);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const [statsRes, orgsRes] = await Promise.all([
        api.get("/api/v1/super/stats"),
        api.get("/api/v1/super/organizations")
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
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);
    try {
      const res = await api.post("/api/v1/super/provision", newOrgData);
      setProvisionResult(res.data);
      toast.success(`Organization ${newOrgData.name} provisioned!`);
      fetchData(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Provisioning failed");
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleResetAdminPassword = async (adminId: string, adminName: string) => {
    const newPass = prompt(`Resetting Master Account for: ${adminName}\nEnter new professional password:`);
    if (!newPass) return;

    try {
      await api.post("/api/v1/super/reset-admin-password", {
        user_id: adminId,
        new_password: newPass
      });
      toast.success(`Master password for ${adminName} has been synchronized.`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Nexus Synchronization Failure");
    }
  };

  const handleToggleOrgStatus = async (orgId: string, orgName: string, currentStatus: string) => {
    const action = currentStatus === 'active' ? 'suspend' : 'activate';
    if (!confirm(`Are you sure you want to ${action} node ${orgName}?`)) return;

    try {
      await api.post(`/api/v1/super/organizations/${orgId}/toggle-status`);
      toast.success(`Node ${orgName} status updated to ${action === 'suspend' ? 'suspended' : 'active'}.`);
      fetchData(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Nexus Protocol Failure");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Connecting to Global Nexus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-primary/10 selection:text-primary pb-20 overflow-x-hidden">
      
      {/* Premium Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-10 relative z-10">
        
        {/* Global Master Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center border border-white/50">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Global Control</h1>
                  <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em]">Master Access</span>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">Multi-Tenant Laboratory OS // SaaS Tier-1</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button 
              onClick={fetchData}
              className={`p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5 text-slate-400" />
            </button>
            <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="flex flex-col items-end">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Throughput</p>
                <p className="text-xl font-black text-slate-900 font-mono tracking-tighter">{(stats?.global_throughput || 0).toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <button 
              onClick={() => {
                setProvisionResult(null);
                setShowProvisionModal(true);
              }}
              className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 active:scale-95 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Provision New Company
            </button>
          </div>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { label: "Total Organizations", value: stats?.total_organizations.toString() || "0", sub: "Registered Tenants", icon: Building2, trend: "up" },
            { label: "Active Nodes", value: stats?.active_nodes.toLocaleString() || "0", sub: "Global User Registry", icon: Users, trend: "up" },
            { label: "System Health", value: stats?.system_health || "99.9%", sub: "Cluster Status", icon: Server, trend: "stable" },
            { label: "Compliance Score", value: stats?.compliance_score || "A+", sub: "ISO-17025 Integrity", icon: ShieldCheck, trend: "up" },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-slate-200/50">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-primary/50 transition-colors">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-full border border-slate-100">
                  <div className={`w-1.5 h-1.5 rounded-full ${stat.trend === 'up' ? 'bg-emerald-500' : 'bg-primary'}`} />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.trend}</span>
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Live Multi-Tenant Registry */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Organization Master Registry</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative group/search">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/search:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder={`Search across ${organizations.length} organizations...`} 
                  className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold w-80 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 text-slate-900 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {organizations.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-[2rem] p-20 text-center space-y-4 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                  <Building2 className="w-10 h-10 text-slate-200" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 uppercase">No Organizations Detected</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Use the provision button to start onboarding companies.</p>
                </div>
                <button 
                  onClick={() => setShowProvisionModal(true)}
                  className="px-6 py-3 bg-slate-50 hover:bg-slate-100 text-[10px] font-black text-primary uppercase tracking-widest rounded-xl transition-all border border-primary/10"
                >
                  Start First Provisioning
                </button>
              </div>
            ) : (
              organizations.map((org) => (
                <div key={org.id} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden transition-all hover:shadow-lg hover:shadow-slate-200/50 group">
                  <div 
                    className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 cursor-pointer"
                    onClick={() => setExpandedOrg(expandedOrg === org.id ? null : org.id)}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-primary/40 transition-colors">
                        <Building2 className="w-7 h-7 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">{org.name}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{org.location || 'Remote'}</span>
                          <div className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{org.license_tier} Tier</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyses</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-black text-slate-900">{org.analyses_count.toLocaleString()}</p>
                          <span className={`text-[10px] font-bold ${org.growth_rate.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{org.growth_rate}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Users</p>
                        <p className="text-lg font-black text-slate-900">{org.users_count} Nodes</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${org.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                          <p className={`text-[11px] font-black uppercase tracking-widest ${org.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>{org.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        {expandedOrg === org.id ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
                      </div>
                    </div>
                  </div>

                  {/* Drill-down Admin Data (REAL DATA) */}
                  {expandedOrg === org.id && (
                    <div className="px-8 pb-8 pt-4 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300 bg-slate-50/30">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Admin Users */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="flex items-center gap-3 mb-6">
                            <Users className="w-4 h-4 text-primary" />
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Authorized Personnel</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {org.admins.length > 0 ? org.admins.map((admin, idx) => (
                              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between group/admin hover:border-primary/20 hover:shadow-sm transition-all">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-xs font-black text-primary border border-primary/10">
                                    {admin.full_name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-900">{admin.full_name}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{admin.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <span className="px-2 py-0.5 bg-primary/5 rounded text-[8px] font-black text-primary uppercase tracking-widest">ADMIN</span>
                                    <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">{new Date(admin.last_active).toLocaleDateString()}</p>
                                  </div>
                                  <button 
                                    onClick={() => handleResetAdminPassword(admin.id, admin.full_name)}
                                    className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                    title="Reset Master Password"
                                  >
                                    <Key className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )) : (
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-4 italic">No admins registered for this node.</p>
                            )}
                          </div>
                        </div>

                        {/* Org Settings Summary */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
                          <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-amber-500" />
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Live Compliance Stats</h4>
                          </div>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">License Status</span>
                              <span className="text-[10px] font-black text-emerald-500 uppercase">Valid until {org.license_expiry ? new Date(org.license_expiry).toLocaleDateString() : 'Infinite'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Org Cluster ID</span>
                              <span className="text-[10px] font-mono text-primary font-bold select-all truncate max-w-[120px]">{org.id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data Locality</span>
                              <span className="text-[10px] font-black text-slate-900 uppercase">{org.location || 'Global Cluster'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                              <button className="py-3 bg-slate-900 hover:bg-slate-800 text-[10px] font-black text-white uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-slate-200">
                                Remote Access
                              </button>
                              <button 
                                onClick={() => handleToggleOrgStatus(org.id, org.name, org.status)}
                                className={`py-3 px-4 border rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                                  org.status === 'active' 
                                    ? 'bg-white border-rose-100 hover:bg-rose-50 text-rose-500' 
                                    : 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600'
                                }`}
                              >
                                {org.status === 'active' ? 'Suspend Node' : 'Activate Node'}
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

          <div className="text-center pt-8">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
              Authorized Master Access Only // ColonyAI Global Nexus v2.0
            </p>
          </div>
        </div>
      </div>

      {/* Provisioning Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !isProvisioning && setShowProvisionModal(false)} />
          
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-slate-100">
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Provision Node</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Tenant Onboarding Matrix</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProvisionModal(false)}
                disabled={isProvisioning}
                className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              {!provisionResult ? (
                <form onSubmit={handleProvision} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Laboratory Name</label>
                      <input 
                        required
                        type="text" 
                        value={newOrgData.name}
                        onChange={(e) => setNewOrgData({...newOrgData, name: e.target.value})}
                        placeholder="e.g. BioLab International"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Data Locality / Location</label>
                      <input 
                        required
                        type="text" 
                        value={newOrgData.location}
                        onChange={(e) => setNewOrgData({...newOrgData, location: e.target.value})}
                        placeholder="e.g. Jakarta, ID"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Master Administrator Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={newOrgData.admin_full_name}
                      onChange={(e) => setNewOrgData({...newOrgData, admin_full_name: e.target.value})}
                      placeholder="Enter legal name of lab admin"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Administrator Neural ID (Email)</label>
                    <input 
                      required
                      type="email" 
                      value={newOrgData.admin_email}
                      onChange={(e) => setNewOrgData({...newOrgData, admin_email: e.target.value})}
                      placeholder="admin@lab-domain.diag"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isProvisioning}
                      className="w-full py-5 bg-primary text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isProvisioning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Initializing Node...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" /> Provision Laboratory Node
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 text-center space-y-3">
                    <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-black text-emerald-900 uppercase tracking-tight">Provisioning Complete</h4>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest italic">{provisionResult.message}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Key className="w-12 h-12" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Generated License Key</p>
                      <p className="text-lg font-mono font-black text-primary select-all">{provisionResult.license_key}</p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Lock className="w-12 h-12" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Temporary Admin Password</p>
                      <p className="text-lg font-mono font-black text-amber-600 select-all">{provisionResult.admin_temp_password}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tight italic">Send this to the laboratory administrator for first-time login.</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setShowProvisionModal(false);
                      setProvisionResult(null);
                      setNewOrgData({ name: "", location: "", admin_email: "", admin_full_name: "", license_tier: "Enterprise" });
                    }}
                    className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all"
                  >
                    Close & Return to Nexus
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

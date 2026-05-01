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
  Key,
  Lock
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
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connecting to Global Nexus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 relative z-10">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Global Master Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl sm:rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center border border-white/50">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Global Control</h1>
              <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[8px] sm:text-[9px] font-black text-primary uppercase tracking-[0.2em] hidden xs:inline-block">Master</span>
            </div>
            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-0.5 sm:mt-1">Multi-Tenant Laboratory OS</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
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
            onClick={() => {
              setProvisionResult(null);
              setShowProvisionModal(true);
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-primary text-white rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-md active:scale-95 group"
          >
            <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" /> <span className="hidden xs:inline">Provision</span>
          </button>
        </div>
      </div>

      {/* Global Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
        {[
          { label: "Total Organizations", value: stats?.total_organizations.toString() || "0", sub: "Registered Tenants", icon: Building2, trend: "up" },
          { label: "Active Nodes", value: stats?.active_nodes.toLocaleString() || "0", sub: "Global Registry", icon: Users, trend: "up" },
          { label: "System Health", value: stats?.system_health || "99.9%", sub: "Cluster Status", icon: Server, trend: "stable" },
          { label: "Compliance Score", value: stats?.compliance_score || "A+", sub: "ISO-17025", icon: ShieldCheck, trend: "up" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200/60 p-2.5 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm group hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start mb-2 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-slate-50 group-hover:bg-primary/5 rounded-lg sm:rounded-xl transition-colors z-10">
                <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              </div>
              <span className={`text-[8px] sm:text-[10px] font-black z-10 ${stat.trend === 'up' ? 'text-emerald-500' : 'text-slate-400'} uppercase tracking-widest`}>
                {stat.trend === 'up' ? '+1' : 'OPT'}
              </span>
            </div>
            <div className="z-10">
              <p className="text-slate-400 text-[7px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1">{stat.label}</p>
              <p className="text-base sm:text-3xl font-black text-slate-900 tabular-nums tracking-tighter">{stat.value}</p>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <stat.icon className="w-10 h-10 sm:w-16 sm:h-16 text-primary" />
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
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{org.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">{org.location || 'Remote'}</span>
                        <div className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                        <span className="text-[8px] sm:text-[9px] font-black text-primary uppercase tracking-widest">{org.license_tier} Tier</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-6 items-center">
                    <div className="hidden sm:block">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Analyses</p>
                      <div className="flex items-center gap-1">
                        <p className="text-xs sm:text-sm font-black text-slate-900">{org.analyses_count.toLocaleString()}</p>
                        <span className={`text-[8px] font-bold ${org.growth_rate.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{org.growth_rate}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Users</p>
                      <p className="text-xs sm:text-sm font-black text-slate-900">{org.users_count} Nodes</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${org.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                        <p className={`text-[9px] font-black uppercase tracking-widest ${org.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>{org.status}</p>
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
                                <div>
                                  <p className="text-[10px] font-bold text-slate-900">{admin.full_name}</p>
                                  <p className="text-[8px] text-slate-500 font-medium">{admin.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <span className="px-1.5 py-0.5 bg-primary/5 rounded text-[7px] font-black text-primary uppercase tracking-widest">ADMIN</span>
                                </div>
                                <button 
                                  onClick={() => handleResetAdminPassword(admin.id, admin.full_name)}
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
                            <button className="py-2 bg-slate-900 hover:bg-slate-800 text-[8px] font-black text-white uppercase tracking-widest rounded-lg transition-all">
                              Remote
                            </button>
                            <button 
                              onClick={() => handleToggleOrgStatus(org.id, org.name, org.status)}
                              className={`py-2 border rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                                org.status === 'active' 
                                  ? 'bg-white border-rose-100 hover:bg-rose-50 text-rose-500' 
                                  : 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600'
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

      {/* Provisioning Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => !isProvisioning && setShowProvisionModal(false)} />
          
          <div className="bg-white w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 fade-in duration-200 border border-slate-100">
            {/* Modal Header */}
            <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">Provision Node</h3>
                  <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">New Tenant Onboarding</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProvisionModal(false)}
                disabled={isProvisioning}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-all text-slate-400 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              {!provisionResult ? (
                <form onSubmit={handleProvision} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Laboratory Name</label>
                      <input 
                        required
                        type="text" 
                        value={newOrgData.name}
                        onChange={(e) => setNewOrgData({...newOrgData, name: e.target.value})}
                        placeholder="e.g. BioLab Inc"
                        className="w-full px-3 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                      <input 
                        required
                        type="text" 
                        value={newOrgData.location}
                        onChange={(e) => setNewOrgData({...newOrgData, location: e.target.value})}
                        placeholder="e.g. Jakarta, ID"
                        className="w-full px-3 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={newOrgData.admin_full_name}
                      onChange={(e) => setNewOrgData({...newOrgData, admin_full_name: e.target.value})}
                      placeholder="Legal name of lab admin"
                      className="w-full px-3 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
                    <input 
                      required
                      type="email" 
                      value={newOrgData.admin_email}
                      onChange={(e) => setNewOrgData({...newOrgData, admin_email: e.target.value})}
                      placeholder="admin@lab-domain.diag"
                      className="w-full px-3 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={isProvisioning}
                      className="w-full py-3 sm:py-3.5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProvisioning ? (
                        <><RefreshCw className="w-3 h-3 animate-spin" /> Initializing...</>
                      ) : (
                        <><Zap className="w-3 h-3" /> Provision Node</>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 sm:p-5 text-center space-y-2">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Provisioning Complete</h4>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest italic">{provisionResult.message}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-1.5 opacity-5">
                        <Key className="w-8 h-8" />
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Generated License Key</p>
                      <p className="text-sm sm:text-base font-mono font-black text-primary select-all break-all">{provisionResult.license_key}</p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-1.5 opacity-5">
                        <Lock className="w-8 h-8" />
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Temporary Admin Password</p>
                      <p className="text-sm sm:text-base font-mono font-black text-amber-600 select-all">{provisionResult.admin_temp_password}</p>
                      <p className="text-[8px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest italic">Send this to the admin for first login.</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setShowProvisionModal(false);
                      setProvisionResult(null);
                      setNewOrgData({ name: "", location: "", admin_email: "", admin_full_name: "", license_tier: "Enterprise" });
                    }}
                    className="w-full py-3 bg-slate-900 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-slate-800 transition-all"
                  >
                    Close & Return
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

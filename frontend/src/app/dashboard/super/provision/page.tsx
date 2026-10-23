"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  ShieldCheck,
  Zap,
  RefreshCw,
  CheckCircle2,
  Key,
  Lock,
  ArrowLeft,
  Server,
  Database,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function ProvisionNodePage() {
  const router = useRouter();
  
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionResult, setProvisionResult] = useState<any>(null);
  const [digitalSignature, setDigitalSignature] = useState(false);

  // Expanded Data State
  const [newOrgData, setNewOrgData] = useState({
    // Core Backend Fields
    name: "",
    location: "",
    admin_email: "",
    admin_full_name: "",
    license_tier: "Enterprise",
    // Expanded UI Fields (for Professional aesthetic)
    institution_type: "Clinical Laboratory",
    compliance_standard: "ISO-17025",
    server_node: "ap-southeast-1 (Jakarta)",
    storage_quota: "1 TB",
    data_retention: "5 Years",
    clearance_level: "Level 3 (High)",
    encryption_standard: "AES-256-GCM",
    audit_frequency: "Quarterly",
    bsl_level: "BSL-2",
    network_restriction: "10.0.0.0/8 (Private Network)",
    lims_webhook_url: "",
    admin_whatsapp: "",
    admin_telegram: ""
  });

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);
    try {
      // Send only the required payload to backend to avoid pydantic strict errors
      const payload = {
        name: newOrgData.name,
        location: newOrgData.location,
        admin_email: newOrgData.admin_email,
        admin_full_name: newOrgData.admin_full_name,
        license_tier: "Enterprise",
        institution_type: newOrgData.institution_type,
        compliance_standard: newOrgData.compliance_standard,
        lims_webhook_url: newOrgData.lims_webhook_url,
        infra_config: {
          node: newOrgData.server_node,
          storage: newOrgData.storage_quota,
          retention: newOrgData.data_retention,
          bsl: newOrgData.bsl_level
        }
      };
      const res = await api.post<any>("/api/v1/super/provision", payload);
      setProvisionResult(res.data);
      toast.success(`Node for ${newOrgData.name} successfully provisioned.`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Provisioning failed");
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 w-full pb-12 px-0 sm:px-2">
      {/* Header Section */}
      <div className="mb-4">
        <button 
          onClick={() => router.push("/dashboard/super")}
          className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-colors mb-3 group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 
          Back to Nexus Master
        </button>
        
        <div className="flex items-center gap-3 mb-2">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">Provision Node</h1>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">Tenant Onboarding System</p>
          </div>
        </div>
      </div>

      {!provisionResult ? (
        <form onSubmit={handleProvision} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
            
            {/* Column 1: Entity & Person */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-50 dark:border-slate-800/50 pb-3">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Entity Registration</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Legal Name</label>
                    <input 
                      required
                      type="text" 
                      value={newOrgData.name}
                      onChange={(e) => setNewOrgData({...newOrgData, name: e.target.value})}
                      placeholder="e.g. BioLab Ltd."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Region</label>
                    <input 
                      required
                      type="text" 
                      value={newOrgData.location}
                      onChange={(e) => setNewOrgData({...newOrgData, location: e.target.value})}
                      placeholder="e.g. Jakarta, ID"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Matrix</label>
                      <select 
                        value={newOrgData.institution_type}
                        onChange={(e) => setNewOrgData({...newOrgData, institution_type: e.target.value})}
                        className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-primary/20 outline-none"
                      >
                        <option value="Clinical Laboratory">Clinical</option>
                        <option value="Academic Research">Academic</option>
                        <option value="Industrial QA/QC">Industrial</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Standard</label>
                      <select 
                        value={newOrgData.compliance_standard}
                        onChange={(e) => setNewOrgData({...newOrgData, compliance_standard: e.target.value})}
                        className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-primary/20 outline-none"
                      >
                        <option value="ISO-17025">ISO-17025</option>
                        <option value="ISO-15189">ISO-15189</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-50 dark:border-slate-800/50 pb-3">
                  <Users className="w-4 h-4 text-amber-500" />
                  <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Administrator</h4>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={newOrgData.admin_full_name}
                      onChange={(e) => setNewOrgData({...newOrgData, admin_full_name: e.target.value})}
                      placeholder="Legal full name"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
                    <input 
                      required
                      type="email" 
                      value={newOrgData.admin_email}
                      onChange={(e) => setNewOrgData({...newOrgData, admin_email: e.target.value})}
                      placeholder="admin@domain.diag"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">WhatsApp Number</label>
                    <input 
                      type="tel" 
                      value={newOrgData.admin_whatsapp}
                      onChange={(e) => setNewOrgData({...newOrgData, admin_whatsapp: e.target.value})}
                      placeholder="e.g. +6281394829000"
                      pattern="[\+]?[0-9]{10,15}"
                      title="Enter a valid phone number (10-15 digits, optional + prefix)"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Telegram Username</label>
                    <input 
                      type="text" 
                      value={newOrgData.admin_telegram}
                      onChange={(e) => setNewOrgData({...newOrgData, admin_telegram: e.target.value})}
                      placeholder="e.g. colonyai_support"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Infrastructure & Security */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-50 dark:border-slate-800/50 pb-3">
                  <Server className="w-4 h-4 text-blue-500" />
                  <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Infrastructure</h4>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Node Allocation</label>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[7px] font-bold text-emerald-600 uppercase">Live: 24ms</span>
                      </div>
                    </div>
                    <select 
                      value={newOrgData.server_node}
                      onChange={(e) => setNewOrgData({...newOrgData, server_node: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500/20 outline-none"
                    >
                      <option value="ap-southeast-1 (Jakarta)">ap-southeast-1 (Jakarta)</option>
                      <option value="ap-southeast-2 (Singapore)">ap-southeast-2 (Singapore)</option>
                      <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">S3 Quota</label>
                      <select 
                        value={newOrgData.storage_quota}
                        onChange={(e) => setNewOrgData({...newOrgData, storage_quota: e.target.value})}
                        className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="1 TB">1 TB</option>
                        <option value="5 TB">5 TB</option>
                        <option value="Unlimited">Unlimited</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Retention</label>
                      <select 
                        value={newOrgData.data_retention}
                        onChange={(e) => setNewOrgData({...newOrgData, data_retention: e.target.value})}
                        className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="1 Year">1 Year</option>
                        <option value="5 Years">5 Years</option>
                        <option value="Indefinite">Indefinite</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-50 dark:border-slate-800/50 pb-3">
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Specialized Controls</h4>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">BSL Level</label>
                      <select 
                        value={newOrgData.bsl_level}
                        onChange={(e) => setNewOrgData({...newOrgData, bsl_level: e.target.value})}
                        className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="BSL-1">BSL-1</option>
                        <option value="BSL-2">BSL-2</option>
                        <option value="BSL-3">BSL-3</option>
                      </select>
                      <p className="text-[7px] text-slate-400 dark:text-slate-500 font-bold ml-1 uppercase">Bio-Safety Standard</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Audit Cycle</label>
                      <select 
                        value={newOrgData.audit_frequency}
                        onChange={(e) => setNewOrgData({...newOrgData, audit_frequency: e.target.value})}
                        className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                      </select>
                      <p className="text-[7px] text-slate-400 dark:text-slate-500 font-bold ml-1 uppercase">Compliance Frequency</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Network Whitelist</label>
                    <input 
                      type="text" 
                      value={newOrgData.network_restriction}
                      onChange={(e) => setNewOrgData({...newOrgData, network_restriction: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-primary/20 outline-none"
                    />
                    <p className="text-[7px] text-slate-400 dark:text-slate-500 font-bold ml-1 uppercase">Whitelisted IP Range (0.0.0.0/0 = Public)</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">LIMS Webhook Bridge</label>
                    <div className="relative">
                      <Database className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                      <input 
                        type="url" 
                        value={newOrgData.lims_webhook_url}
                        onChange={(e) => setNewOrgData({...newOrgData, lims_webhook_url: e.target.value})}
                        placeholder="https://lims.lab.id/api/receive"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-rose-500/20 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700"
                      />
                    </div>
                    <p className="text-[7px] text-slate-400 dark:text-slate-500 font-bold ml-1 uppercase">URL for HL7/FHIR or Custom REST Integration</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Authorization (Desktop Sidebar) */}
            <div className="xl:col-span-1 space-y-4">
              <div className="bg-slate-900 rounded-none p-5 shadow-xl text-white">
                <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
                  <Key className="w-4 h-4 text-primary" />
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Authorization Matrix</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">Clearance</label>
                      <p className="text-[10px] font-bold text-white">{newOrgData.clearance_level.split(' ')[1]}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">Encryption</label>
                      <p className="text-[10px] font-bold text-white">AES-256</p>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-none cursor-pointer group hover:bg-white/10 transition-all">
                    <div className="flex items-center h-4 mt-0.5">
                      <input 
                        type="checkbox" 
                        required
                        checked={digitalSignature}
                        onChange={(e) => setDigitalSignature(e.target.checked)}
                        className="w-3.5 h-3.5 text-primary bg-transparent border-white/20 rounded focus:ring-primary"
                      />
                    </div>
                    <p className="text-[8px] text-white/40 leading-relaxed font-bold group-hover:text-white/70 transition-colors uppercase">
                      I confirm this tenant provisioning and authorize creation of a new organization node with immutable audit trail.
                    </p>
                  </label>

                  <button 
                    type="submit"
                    disabled={isProvisioning || !digitalSignature}
                    className="w-full py-3 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-none shadow-lg hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProvisioning ? (
                      <><RefreshCw className="w-3 h-3 animate-spin" /> Provisioning Tenant Node...</>
                    ) : (
                      <><Zap className="w-3 h-3 text-amber-400" /> Provision Tenant Node</>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="hidden xl:block bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-none p-5">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Protocol Note</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                  Provisioning a new node triggers a global ledger update. Ensure the administrator's email is a verified laboratory gateway to prevent security isolation.
                </p>
              </div>
            </div>

          </div>
        </form>
      ) : (
        /* Refined Success State */
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto py-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-8 sm:p-12 text-center shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-none flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Provisioning Successful</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
              Infrastructure for <span className="text-slate-900 dark:text-white font-bold">{provisionResult.organization_name || newOrgData.name}</span> has been successfully deployed on the Jakarta node.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-none p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-primary/30 group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">License Key</span>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(provisionResult.license_key);
                    toast.success("License Key copied to clipboard");
                  }}
                  className="px-3 py-1 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 rounded-none transition-all"
                >
                  Copy
                </button>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 rounded-none p-4 border border-slate-100 dark:border-slate-800">
                <p className="text-lg font-bold text-slate-900 dark:text-white tracking-wider break-all leading-tight">
                  {provisionResult.license_key}
                </p>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-4 leading-relaxed font-medium">
                Connect this key to the tenant's primary node configuration to activate the license.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-none p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-amber-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Admin Credentials</span>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(provisionResult.admin_temp_password);
                    toast.success("Temporary Password copied to clipboard");
                  }}
                  className="px-3 py-1 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 rounded-none transition-all"
                >
                  Copy
                </button>
              </div>
              <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-none p-4 border border-amber-100 dark:border-amber-900/50">
                <p className="text-lg font-bold text-amber-700 dark:text-amber-400 tracking-wide">
                  {provisionResult.admin_temp_password}
                </p>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-4 leading-relaxed font-medium">
                This temporary credential must be changed immediately by the Administrator upon first login.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => {
                setProvisionResult(null);
                setNewOrgData({ name: "", location: "", admin_email: "", admin_full_name: "", license_tier: "Enterprise", institution_type: "Clinical Laboratory", compliance_standard: "ISO-17025", server_node: "ap-southeast-1 (Jakarta)", storage_quota: "1 TB", data_retention: "5 Years", clearance_level: "Level 3 (High)", encryption_standard: "AES-256-GCM", audit_frequency: "Quarterly", bsl_level: "BSL-2", network_restriction: "10.0.0.0/8 (Private Network)", lims_webhook_url: "", admin_whatsapp: "", admin_telegram: "" });
                setDigitalSignature(false);
              }}
              className="w-full sm:w-auto px-10 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-[11px] font-bold uppercase tracking-widest rounded-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
            >
              Provision Another Node
            </button>
            <button 
              onClick={() => router.push("/dashboard/super")}
              className="w-full sm:w-auto px-12 py-4 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-none hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
            >
              Return to Nexus
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

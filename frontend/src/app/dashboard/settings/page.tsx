"use client";

import { useState, useEffect } from "react";
import { User, Bell, Shield, Database, Palette, Loader2, LogOut, Save, Zap, AlertTriangle, FileText, Settings2, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { authApi } from "@/lib/auth-api";
import { settingsApi } from "@/lib/settings-api";
import { toast } from "sonner";
import { DocumentationSidebar, DocumentationToggle } from "@/components/DocumentationSidebar";
import { useTranslationStore } from '@/lib/i18n/store';

const TABS = [
  { id: "profile", name: "Profile", icon: User },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "security", name: "Security", icon: Shield },
  { id: "laboratory", name: "Laboratory", icon: Database },
  { id: "appearance", name: "Appearance", icon: Palette },
];

const INPUT_CLS = "w-full px-5 py-3 text-[13px] font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300 shadow-sm";
const LABEL_CLS = "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2 block";
const BTN_PRIMARY = "bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-6 flex items-center justify-center gap-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50";

export default function SettingsPage() {
  const { t } = useTranslationStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [preferences, setPreferences] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDocs, setShowDocs] = useState(true);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const prefs = await settingsApi.getPreferences();
      setPreferences(prefs);
    } catch { toast.error(t('settings.errorLoadPrefs')); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadPreferences(); }, []);

  const ActiveIcon = TABS.find(t => t.id === activeTab)?.icon || User;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        <div className={`flex-1 transition-all duration-300 ${showDocs ? 'lg:mr-[350px]' : ''}`}>
          <div className="max-w-[1500px] mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-100 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl shadow-xl flex items-center justify-center">
                    <Settings2 className="w-4 h-4 text-primary" />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{t('settings.title')}</h1>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{t('settings.subtitle')}</p>
              </div>
              <div className="flex items-center gap-3">
                 <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Shield className="w-3.5 h-3.5" />
                       Auth: AES-256-GCM
                    </span>
                 </div>
              </div>
            </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Nav - 3 cols */}
        <div className="lg:col-span-3">
          <nav className="bg-white border border-slate-200/60 p-2.5 space-y-1.5 sticky top-24 rounded-2xl shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <tab.icon className={`h-4.5 w-4.5 flex-shrink-0 ${activeTab === tab.id ? 'text-primary' : ''}`} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Panel - 9 cols */}
        <div className="lg:col-span-9">
          <div className="bg-white border border-slate-200/60 overflow-hidden rounded-2xl shadow-sm">
            {/* Panel Header */}
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <ActiveIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">
                  {TABS.find(t => t.id === activeTab)?.name} Configuration
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global node environment matrix</p>
              </div>
            </div>

            {/* Panel Body */}
            <div className="p-8 lg:p-10">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('settings.syncingPrefs')}</p>
                </div>
              ) : (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  {activeTab === "profile" && <ProfileSettings />}
                  {activeTab === "notifications" && <NotificationSettings preferences={preferences} onRefresh={loadPreferences} />}
                  {activeTab === "security" && <SecuritySettings />}
                  {activeTab === "laboratory" && <LaboratorySettings preferences={preferences} onRefresh={loadPreferences} />}
                  {activeTab === "appearance" && <AppearanceSettings preferences={preferences} onRefresh={loadPreferences} />}
                </div>
              )}
            </div>
          </div>
        </div>
            </div>
          </div>
        </div>
        <DocumentationSidebar 
          showDocs={showDocs} 
          setShowDocs={setShowDocs}
          directory="System Configuration"
          title={t('settings.docsTitle')}
          description={t('settings.docsDescription')}
        >
          <section className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">01</span>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Overview</h2>
             </div>
             <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                Panel System Configuration mengontrol seluruh infrastruktur perangkat lunak ColonyAI. Akses penuh hanya diberikan kepada pengguna dengan Role "Owner", yang dapat memodifikasi parameter sensitif seperti Token API dan enkripsi AES-256.
             </p>
          </section>

          <section className="space-y-6 pt-2">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">02</span>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Access Control Protocol</h2>
             </div>
             <div className="space-y-6 ml-1">
                {[
                  { id: '1', title: 'Profile Settings', desc: 'Identitas pengguna yang tertanam pada setiap log Audit Trail untuk memenuhi syarat ISO-17025.' },
                  { id: '2', title: 'Security Protocol', desc: 'Manajemen siklus hidup token (Token Lifecycle). Owner berwenang untuk mencabut seluruh akses (Revoke All Sessions) secara instan dalam status darurat (Force Majeure).' },
                  { id: '3', title: 'Laboratory Environment', desc: 'Kalibrasi variabel perhitungan standar seperti Media Default dan Nilai Dilusi.' }
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

function ProfileSettings() {
  const { user } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (user) setFullName(user.full_name || ""); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast.error("Full name is required"); return; }
    setIsSaving(true);
    try {
      await authApi.updateProfile({ full_name: fullName.trim() });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update profile");
    } finally { setIsSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Full Name <span className="text-primary">*</span></label>
          <input type="text" className={INPUT_CLS} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Analyst Name" />
        </div>
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Email Address</label>
          <input type="email" className={`${INPUT_CLS} !bg-slate-50 !border-slate-200 !text-slate-400 cursor-not-allowed`} value={user?.email || ""} disabled />
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2 ml-1">Immutable Identifier</p>
        </div>
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Node Role</label>
          <input type="text" className={`${INPUT_CLS} !bg-slate-50 !border-slate-200 !text-slate-400 capitalize cursor-not-allowed`} value={user?.role || ""} disabled />
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2 ml-1">Provisioned by Root Admin</p>
        </div>
      </div>
      <div className="pt-8 border-t border-slate-50">
        <button type="submit" disabled={isSaving} className={BTN_PRIMARY}>
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {isSaving ? "Syncing..." : "Apply Profile Updates"}
        </button>
      </div>
    </form>
  );
}

function NotificationSettings({ preferences, onRefresh }: { preferences: any; onRefresh: () => void }) {
  const [settings, setSettings] = useState({ analysis_complete: true, boundary_alerts: true, weekly_summary: false });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (preferences?.notifications) setSettings(preferences.notifications); }, [preferences]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.updateNotifications(settings);
      toast.success("Notification preferences saved");
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to save notifications");
    } finally { setIsSaving(false); }
  };

  const ITEMS = [
    { key: "analysis_complete", title: "Neural Sync Completion", desc: "Alert when a specimen analysis sequence finishes processing", icon: Zap },
    { key: "boundary_alerts", title: "ISO Threshold Boundary", desc: "Critical alerts when specimens exceed countable ranges (TNTC)", icon: AlertTriangle },
    { key: "weekly_summary", title: "Intelligence Summary", desc: "Receive automated diagnostic analytics via secure channel", icon: FileText },
  ];

  return (
    <div className="space-y-4">
      {ITEMS.map((item) => (
        <div key={item.key} className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-200/60 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
          <div className="flex items-center gap-5">
             <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all shadow-sm">
                <item.icon className="w-5 h-5" />
             </div>
             <div>
               <p className="text-[12px] font-black text-slate-900 uppercase tracking-widest">{item.title}</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{item.desc}</p>
             </div>
          </div>
          <div className="relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out bg-slate-200 overflow-hidden">
            <input
              type="checkbox"
              checked={settings[item.key as keyof typeof settings]}
              onChange={e => setSettings({ ...settings, [item.key]: e.target.checked })}
              className="peer absolute h-full w-full opacity-0 z-10 cursor-pointer"
            />
            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xl ring-0 transition-all duration-300 ease-in-out mt-0.5 ml-0.5 ${settings[item.key as keyof typeof settings] ? 'translate-x-6 !bg-primary' : 'translate-x-0'}`} />
          </div>
        </div>
      ))}
      <div className="pt-8 border-t border-slate-50">
        <button onClick={handleSave} disabled={isSaving} className={BTN_PRIMARY}>
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {isSaving ? "Calibrating..." : "Save Signal Preferences"}
        </button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) { toast.error("All fields are required"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setIsUpdating(true);
    try {
      await settingsApi.changePassword({ current_password: currentPassword, new_password: newPassword });
      toast.success("Password updated successfully");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update password");
    } finally { setIsUpdating(false); }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm("Revoke all active sessions? You will need to log in again.")) return;
    try {
      await settingsApi.revokeAllSessions();
      toast.success("All sessions terminated. Redirecting...");
      setTimeout(() => { window.location.href = "/login"; }, 2000);
    } catch (error: any) { toast.error(error.response?.data?.detail || "Session revocation failed"); }
  };

  return (
    <div className="space-y-10">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Current Encryption Secret</label>
          <input type="password" placeholder="••••••••••••" className={INPUT_CLS} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>New Encryption Secret</label>
          <input type="password" placeholder="••••••••••••" className={INPUT_CLS} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Confirm Secret</label>
          <input type="password" placeholder="••••••••••••" className={INPUT_CLS} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        </div>
        <div className="pt-2">
          <button type="submit" disabled={isUpdating} className={BTN_PRIMARY}>
            {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
            {isUpdating ? "Rotating Keys..." : "Update Security Layer"}
          </button>
        </div>
      </form>

      <div className="pt-10 border-t border-slate-100">
        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Session Authorization Matrix</h3>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-8 bg-rose-50/30 border border-rose-100 rounded-2xl gap-8">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-2xl shadow-rose-500/20">
                <LogOut className="w-7 h-7" />
             </div>
             <div>
               <p className="text-[14px] font-black text-rose-900 uppercase tracking-tight">Terminate All active Nodes</p>
               <p className="text-[10px] text-rose-700/60 font-black uppercase tracking-widest mt-1">Force revoke every session across the global network</p>
             </div>
          </div>
          <button onClick={handleRevokeAllSessions} className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-rose-600/20 active:scale-95 flex-shrink-0">
             Revoke Global Auth
          </button>
        </div>
      </div>
    </div>
  );
}

function LaboratorySettings({ preferences, onRefresh }: { preferences: any; onRefresh: () => void }) {
  const [config, setConfig] = useState({ lab_name: "ColonyAI Central Hub", default_media: "Plate Count Agar", default_volume: 1.0 });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (preferences?.laboratory) setConfig(preferences.laboratory); }, [preferences]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    try {
      await settingsApi.updateLaboratory(config);
      toast.success("Laboratory configuration saved"); onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to save configuration");
    } finally { setIsSaving(false); }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Hub Designation</label>
          <input type="text" className={INPUT_CLS} value={config.lab_name} onChange={e => setConfig({ ...config, lab_name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Default Specimen Matrix</label>
          <div className="relative">
            <select className={`${INPUT_CLS} appearance-none cursor-pointer`} value={config.default_media} onChange={e => setConfig({ ...config, default_media: e.target.value })}>
              <option value="Plate Count Agar">PCA — Plate Count Agar</option>
              <option value="VRBA">VRBA — Violet Red Bile Agar</option>
              <option value="TSA">TSA — Tryptic Soy Agar</option>
              <option value="R2A">R2A — Reasoner's 2A Agar</option>
              <option value="BGBB">BGBB — Brilliant Green Bile Broth</option>
              <option value="MacConkey">MAC — MacConkey Agar</option>
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Standard Matrix Volume (mL)</label>
          <input type="number" step="0.1" min="0.1" className={INPUT_CLS} value={config.default_volume} onChange={e => setConfig({ ...config, default_volume: parseFloat(e.target.value) })} />
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-3 ml-1">Calibrated to ISO 4833-1:2013 Standards</p>
        </div>
      </div>
      <div className="pt-8 border-t border-slate-50">
        <button type="submit" disabled={isSaving} className={BTN_PRIMARY}>
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {isSaving ? "Commiting Changes..." : "Sync Lab Configuration"}
        </button>
      </div>
    </form>
  );
}

function AppearanceSettings({ preferences, onRefresh }: { preferences: any; onRefresh: () => void }) {
  const [appearance, setAppearance] = useState({ theme: "system", language: "en" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (preferences?.appearance) setAppearance(preferences.appearance); }, [preferences]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.updateAppearance(appearance);
      toast.success("Appearance settings saved"); onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to save appearance");
    } finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Interface Aesthetic</label>
          <div className="relative">
            <select className={`${INPUT_CLS} appearance-none cursor-pointer`} value={appearance.theme} onChange={e => setAppearance({ ...appearance, theme: e.target.value })}>
              <option value="light">Clinical White (Recommended)</option>
              <option value="dark">Low-Light Neural</option>
              <option value="system">Auto-Sync with Node OS</option>
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Linguistic Matrix</label>
          <div className="relative">
            <select className={`${INPUT_CLS} appearance-none cursor-pointer`} value={appearance.language} onChange={e => setAppearance({ ...appearance, language: e.target.value })}>
              <option value="en">Global (English)</option>
              <option value="id">Regional (Bahasa Indonesia)</option>
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
               <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
      <div className="pt-8 border-t border-slate-50">
        <button onClick={handleSave} disabled={isSaving} className={BTN_PRIMARY}>
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Palette className="h-5 w-5" />}
          {isSaving ? "Rendering..." : "Apply Aesthetic Preferences"}
        </button>
      </div>
    </div>
  );
}


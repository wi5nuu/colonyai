"use client";

import { useState, useEffect } from "react";
import { User, Bell, Shield, Database, Palette, Loader2, LogOut, Save } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { authApi } from "@/lib/auth-api";
import { settingsApi } from "@/lib/settings-api";
import { toast } from "sonner";

const TABS = [
  { id: "profile", name: "Profile", icon: User },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "security", name: "Security", icon: Shield },
  { id: "laboratory", name: "Laboratory", icon: Database },
  { id: "appearance", name: "Appearance", icon: Palette },
];

const INPUT_CLS = "w-full px-4 py-2.5 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all";
const LABEL_CLS = "text-xs font-bold text-slate-700 uppercase tracking-wider";
const BTN_PRIMARY = "flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors duration-150 shadow-sm";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [preferences, setPreferences] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const prefs = await settingsApi.getPreferences();
      setPreferences(prefs);
    } catch { toast.error("Failed to load preferences"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadPreferences(); }, []);

  const ActiveIcon = TABS.find(t => t.id === activeTab)?.icon || User;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1.5">Manage your account preferences and laboratory configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 space-y-1 sticky top-24">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors duration-150 ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <tab.icon className="h-4 w-4 flex-shrink-0" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Panel Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                <ActiveIcon className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {TABS.find(t => t.id === activeTab)?.name} Settings
                </h2>
                <p className="text-xs text-slate-500">Manage your {TABS.find(t => t.id === activeTab)?.name.toLowerCase()} preferences</p>
              </div>
            </div>

            {/* Panel Body */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
                </div>
              ) : (
                <>
                  {activeTab === "profile" && <ProfileSettings />}
                  {activeTab === "notifications" && <NotificationSettings preferences={preferences} onRefresh={loadPreferences} />}
                  {activeTab === "security" && <SecuritySettings />}
                  {activeTab === "laboratory" && <LaboratorySettings preferences={preferences} onRefresh={loadPreferences} />}
                  {activeTab === "appearance" && <AppearanceSettings preferences={preferences} onRefresh={loadPreferences} />}
                </>
              )}
            </div>
          </div>
        </div>
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Full Name <span className="text-rose-500">*</span></label>
          <input type="text" className={INPUT_CLS} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" />
        </div>
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Email Address</label>
          <input type="email" className={`${INPUT_CLS} opacity-60 cursor-not-allowed`} value={user?.email || ""} disabled />
          <p className="text-[11px] text-slate-400 pl-1">Email cannot be changed</p>
        </div>
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Role</label>
          <input type="text" className={`${INPUT_CLS} opacity-60 cursor-not-allowed capitalize`} value={user?.role || ""} disabled />
          <p className="text-[11px] text-slate-400 pl-1">Role is assigned by administrator</p>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100">
        <button type="submit" disabled={isSaving} className={BTN_PRIMARY}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving..." : "Save Profile"}
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
    { key: "analysis_complete", title: "Analysis Complete", desc: "Get notified when a bio-analysis finishes processing" },
    { key: "boundary_alerts", title: "ISO Boundary Alerts", desc: "Critical alerts when specimens exceed range (TNTC/TFTC)" },
    { key: "weekly_summary", title: "Weekly Summary", desc: "Receive a weekly diagnostic summary report via email" },
  ];

  return (
    <div className="space-y-5">
      {ITEMS.map((item) => (
        <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors duration-150">
          <div className="pr-6">
            <p className="text-sm font-bold text-slate-900">{item.title}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{item.desc}</p>
          </div>
          <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-slate-200">
            <input
              type="checkbox"
              checked={settings[item.key as keyof typeof settings]}
              onChange={e => setSettings({ ...settings, [item.key]: e.target.checked })}
              className="peer absolute h-full w-full opacity-0 z-10 cursor-pointer"
            />
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-all duration-200 ease-in-out ${settings[item.key as keyof typeof settings] ? 'translate-x-5 bg-slate-900' : 'translate-x-0'}`} />
          </div>
        </div>
      ))}
      <div className="pt-4 border-t border-slate-100">
        <button onClick={handleSave} disabled={isSaving} className={BTN_PRIMARY}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving..." : "Save Notifications"}
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
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Current Password</label>
          <input type="password" placeholder="••••••••" className={INPUT_CLS} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>New Password</label>
          <input type="password" placeholder="••••••••" className={INPUT_CLS} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Confirm New Password</label>
          <input type="password" placeholder="••••••••" className={INPUT_CLS} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        </div>
        <div className="pt-2">
          <button type="submit" disabled={isUpdating} className={BTN_PRIMARY}>
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            {isUpdating ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>

      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Session Management</h3>
        <div className="flex items-start justify-between p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <div>
            <p className="text-sm font-bold text-rose-800">Revoke All Sessions</p>
            <p className="text-xs text-rose-600 font-medium mt-0.5">This will log out all devices. You will need to re-authenticate.</p>
          </div>
          <button onClick={handleRevokeAllSessions} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors duration-150 ml-4 flex-shrink-0">
            <LogOut className="h-3.5 w-3.5" /> Revoke All
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
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Laboratory Name</label>
          <input type="text" className={INPUT_CLS} value={config.lab_name} onChange={e => setConfig({ ...config, lab_name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Default Agar Media</label>
          <select className={`${INPUT_CLS} appearance-none`} value={config.default_media} onChange={e => setConfig({ ...config, default_media: e.target.value })}>
            <option value="Plate Count Agar">PCA — Plate Count Agar</option>
            <option value="VRBA">VRBA — Violet Red Bile Agar</option>
            <option value="TSA">TSA — Tryptic Soy Agar</option>
            <option value="R2A">R2A — Reasoner's 2A Agar</option>
            <option value="BGBB">BGBB — Brilliant Green Bile Broth</option>
            <option value="MacConkey">MAC — MacConkey Agar</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Default Plated Volume (mL)</label>
          <input type="number" step="0.1" min="0.1" className={INPUT_CLS} value={config.default_volume} onChange={e => setConfig({ ...config, default_volume: parseFloat(e.target.value) })} />
          <p className="text-[11px] text-slate-400 pl-1">Standard: 1.0 mL per ISO 4833-1</p>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100">
        <button type="submit" disabled={isSaving} className={BTN_PRIMARY}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving..." : "Save Laboratory Config"}
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Interface Theme</label>
          <select className={`${INPUT_CLS} appearance-none`} value={appearance.theme} onChange={e => setAppearance({ ...appearance, theme: e.target.value })}>
            <option value="light">Light Mode (Clinical)</option>
            <option value="dark">Dark Mode</option>
            <option value="system">System Default</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={LABEL_CLS}>Language</label>
          <select className={`${INPUT_CLS} appearance-none`} value={appearance.language} onChange={e => setAppearance({ ...appearance, language: e.target.value })}>
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100">
        <button onClick={handleSave} disabled={isSaving} className={BTN_PRIMARY}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Palette className="h-4 w-4" />}
          {isSaving ? "Saving..." : "Save Appearance"}
        </button>
      </div>
    </div>
  );
}

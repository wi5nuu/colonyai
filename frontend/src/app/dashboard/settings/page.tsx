"use client";

import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Loader2,
  LogOut,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { authApi } from "@/lib/auth-api";
import { settingsApi } from "@/lib/settings-api";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [preferences, setPreferences] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { id: "profile", name: "Analyst Profile", icon: User },
    { id: "notifications", name: "Signal Prefs", icon: Bell },
    { id: "security", name: "Encryption / Auth", icon: Shield },
    { id: "laboratory", name: "Node Config", icon: Database },
    { id: "appearance", name: "Matrix Theme", icon: Palette },
  ];

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const prefs = await settingsApi.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      toast.error("Failed to load preferences");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Matrix */}
        <div className="lg:col-span-1">
          <nav className="space-y-1.5 sticky top-24">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4 mb-4">
              Core Control Matrix
            </p>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-5 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 group ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 translate-x-1"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <tab.icon
                  className={`h-4 w-4 mr-4 transition-transform ${activeTab === tab.id ? "scale-110" : "group-hover:scale-110"}`}
                />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Configuration Terminal Content */}
        <div className="lg:col-span-3">
          <div className="card p-0 overflow-hidden border-border/40 backdrop-blur-3xl">
            <div className="px-8 py-6 border-b border-border/20 bg-muted/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/20 rounded-xl text-primary">
                  {(() => {
                    const tab = tabs.find((t) => t.id === activeTab);
                    const Icon = tab?.icon || User;
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-[0.25em]">
                    {tabs.find((t) => t.id === activeTab)?.name} Control
                  </h2>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1.5">
                    Sector Authorization Phase 04
                  </p>
                </div>
              </div>
            </div>
            <div className="p-10">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {activeTab === "profile" && <ProfileSettings />}
                  {activeTab === "notifications" && (
                    <NotificationSettings
                      preferences={preferences}
                      onRefresh={loadPreferences}
                    />
                  )}
                  {activeTab === "security" && <SecuritySettings />}
                  {activeTab === "laboratory" && (
                    <LaboratorySettings
                      preferences={preferences}
                      onRefresh={loadPreferences}
                    />
                  )}
                  {activeTab === "appearance" && (
                    <AppearanceSettings
                      preferences={preferences}
                      onRefresh={loadPreferences}
                    />
                  )}
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

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Identity identifier cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      await authApi.updateProfile({ full_name: fullName.trim() });
      toast.success("Core profile synchronized");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Handshake failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
              Full Legal Alias
            </label>
            <input
              type="text"
              className="input h-14 bg-muted/20 border-border/40 hover:border-primary/30 transition-all font-black uppercase tracking-widest text-xs"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-3 opacity-60">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
              Email Identity (Network Lock)
            </label>
            <input
              type="email"
              className="input h-14 bg-muted border-border/20 font-mono text-sm"
              value={user?.email || ""}
              disabled
            />
          </div>
          <div className="space-y-3 opacity-60">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
              Auth Role Level
            </label>
            <input
              type="text"
              className="input h-14 bg-muted border-border/20 font-black uppercase tracking-widest text-[10px]"
              value={user?.role || ""}
              disabled
            />
          </div>
        </div>
        <div className="pt-6 border-t border-border/10">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary h-14 px-10 flex items-center shadow-lg shadow-primary/20 active:scale-95 disabled:scale-100"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                Synchronizing...
              </>
            ) : (
              "Save Profile Entry"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function NotificationSettings({
  preferences,
  onRefresh,
}: {
  preferences: any;
  onRefresh: () => void;
}) {
  const [settings, setSettings] = useState({
    analysis_complete: true,
    boundary_alerts: true,
    weekly_summary: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences?.notifications) {
      setSettings(preferences.notifications);
    }
  }, [preferences]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.updateNotifications(settings);
      toast.success("Notification matrix synchronized");
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Sync failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {[
        {
          key: "analysis_complete",
          title: "Analysis Protocol Completion",
          desc: "Signal interrupt when bio-analysis reaches 100%",
        },
        {
          key: "boundary_alerts",
          title: "ISO Boundary Alerts",
          desc: "Critical alerts when specimens exceed range (TNTC/TFTC)",
        },
        {
          key: "weekly_summary",
          title: "Archival Ledger Summary",
          desc: "Transmit weekly diagnostic summary to secure channel",
        },
      ].map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between p-6 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-300 group"
        >
          <div className="pr-4">
            <p className="text-xs font-black text-foreground uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">
              {item.title}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
              {item.desc}
            </p>
          </div>
          <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-muted group-hover:bg-muted-foreground/20">
            <input
              type="checkbox"
              checked={settings[item.key as keyof typeof settings]}
              onChange={(e) =>
                setSettings({ ...settings, [item.key]: e.target.checked })
              }
              className="peer absolute h-full w-full opacity-0 z-10 cursor-pointer"
            />
            <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out peer-checked:translate-x-5 peer-checked:bg-primary" />
          </div>
        </div>
      ))}
      <div className="pt-6 border-t border-border/10">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary h-14 px-10 flex items-center shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-5 w-5 mr-3 animate-spin" /> : null}
          {isSaving ? "Synchronizing..." : "Synchronize Signal Matrix"}
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

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All protocol keys are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Master re-keys do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Protocol key must be at least 8 characters");
      return;
    }

    setIsUpdating(true);
    try {
      await settingsApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Encryption access updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Key rotation failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm("Revoke all active sessions? You will need to login again."))
      return;

    try {
      await settingsApi.revokeAllSessions();
      toast.success("All sessions terminated. Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Session revocation failed");
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
            Current Protocol Key
          </label>
          <input
            type="password"
            placeholder="••••••••••••"
            className="input h-14 bg-muted/20 border-border/40 hover:border-primary/30 transition-all font-mono"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
            Master Re-Key
          </label>
          <input
            type="password"
            placeholder="••••••••••••"
            className="input h-14 bg-muted/20 border-border/40 hover:border-primary/30 transition-all font-mono"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
            Validate Re-Key
          </label>
          <input
            type="password"
            placeholder="••••••••••••"
            className="input h-14 bg-muted/20 border-border/40 hover:border-primary/30 transition-all font-mono"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className="pt-4">
          <button
            type="submit"
            disabled={isUpdating}
            className="btn-primary h-14 px-10 shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                Rotating Keys...
              </>
            ) : (
              "Update Encryption Access"
            )}
          </button>
        </div>
      </form>

      <div className="pt-8 border-t border-border/10">
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-4">
          Session Matrix Control
        </h3>
        <div className="p-6 bg-rose-500/5 rounded-2xl border border-rose-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black text-foreground uppercase tracking-widest mb-1">
                Terminate All Active Nodes
              </p>
              <p className="text-[10px] text-muted-foreground">
                This will logout all devices and invalidate all active sessions.
                You will need to re-authenticate.
              </p>
            </div>
            <button
              onClick={handleRevokeAllSessions}
              className="px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border border-rose-500/20"
            >
              <LogOut className="h-4 w-4" />
              Terminate All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LaboratorySettings({
  preferences,
  onRefresh,
}: {
  preferences: any;
  onRefresh: () => void;
}) {
  const [config, setConfig] = useState({
    lab_name: "ColonyAI Central Hub",
    default_media: "Plate Count Agar",
    default_volume: 1.0,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences?.laboratory) {
      setConfig(preferences.laboratory);
    }
  }, [preferences]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsApi.updateLaboratory(config);
      toast.success("Node configuration synchronized");
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Sync failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
              Assigned Laboratory Node
            </label>
            <input
              type="text"
              className="input h-14 bg-muted/20 border-border/40 font-black uppercase tracking-widest text-xs"
              value={config.lab_name}
              onChange={(e) =>
                setConfig({ ...config, lab_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
              Global Default Media
            </label>
            <select
              className="input h-14 bg-muted/20 border-border/40 text-xs font-black uppercase tracking-widest"
              value={config.default_media}
              onChange={(e) =>
                setConfig({ ...config, default_media: e.target.value })
              }
            >
              <option>Plate Count Agar (PCA)</option>
              <option>VRBA Selective</option>
              <option>TSA General</option>
              <option>R2A Diagnostic</option>
              <option>BGBB Confirmation</option>
              <option>MacConkey Selective</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
              Nominal Volume (mL)
            </label>
            <input
              type="number"
              className="input h-14 bg-muted/20 border-border/40 font-mono text-sm"
              value={config.default_volume}
              onChange={(e) =>
                setConfig({
                  ...config,
                  default_volume: parseFloat(e.target.value),
                })
              }
              step="0.1"
              min="0.1"
            />
          </div>
        </div>
        <div className="pt-6 border-t border-border/10">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary h-14 px-10 shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
            ) : null}
            {isSaving ? "Synchronizing..." : "Synchronize Node Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AppearanceSettings({
  preferences,
  onRefresh,
}: {
  preferences: any;
  onRefresh: () => void;
}) {
  const [appearance, setAppearance] = useState({
    theme: "system",
    language: "en",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences?.appearance) {
      setAppearance(preferences.appearance);
    }
  }, [preferences]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.updateAppearance(appearance);
      toast.success("Matrix theme synchronized");
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Sync failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
            Neural Matrix Theme
          </label>
          <select
            className="input h-14 bg-muted/20 border-border/40 text-xs font-black uppercase tracking-widest"
            value={appearance.theme}
            onChange={(e) =>
              setAppearance({ ...appearance, theme: e.target.value })
            }
          >
            <option value="light">Clinical Light</option>
            <option value="dark">Deep Neural Dark</option>
            <option value="system">System Default Sync</option>
          </select>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
            Linguistic Matrix
          </label>
          <select
            className="input h-14 bg-muted/20 border-border/40 text-xs font-black uppercase tracking-widest"
            value={appearance.language}
            onChange={(e) =>
              setAppearance({ ...appearance, language: e.target.value })
            }
          >
            <option value="en">English (Global Standard)</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
        </div>
      </div>
      <div className="pt-6 border-t border-border/10">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary h-14 px-10 shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center"
        >
          {isSaving ? <Loader2 className="h-5 w-5 mr-3 animate-spin" /> : null}
          {isSaving ? "Synchronizing..." : "Synchronize Appearance Matrix"}
        </button>
      </div>
    </div>
  );
}

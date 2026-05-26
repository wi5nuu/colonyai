"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Loader2,
  LogOut,
  Save,
  Zap,
  AlertTriangle,
  FileText,
  Settings2,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { authApi } from "@/lib/auth-api";
import { settingsApi } from "@/lib/settings-api";
import { toast } from "sonner";
import {
  DocumentationSidebar,
  DocumentationToggle,
} from "@/components/DocumentationSidebar";
import { useTranslationStore } from "@/lib/i18n/store";

const TABS = [
  {
    id: "profile",
    nameKey: "settings.tabProfile",
    icon: User,
    roles: ["analyst", "manager", "auditor", "admin", "super_admin"],
  },
  {
    id: "notifications",
    nameKey: "settings.tabNotifications",
    icon: Bell,
    roles: ["analyst", "manager", "auditor", "admin", "super_admin"],
  },
  {
    id: "security",
    nameKey: "settings.tabSecurity",
    icon: Shield,
    roles: ["analyst", "manager", "auditor", "admin", "super_admin"],
  },
  {
    id: "laboratory",
    nameKey: "settings.tabLaboratory",
    icon: Database,
    roles: ["admin", "manager", "super_admin"],
  },
  {
    id: "system",
    nameKey: "settings.tabSystem",
    icon: Zap,
    roles: ["admin", "super_admin"],
  },
  {
    id: "appearance",
    nameKey: "settings.tabAppearance",
    icon: Palette,
    roles: ["analyst", "manager", "auditor", "admin", "super_admin"],
  },
];

const INPUT_CLS =
  "w-full px-3 py-2 text-sm text-slate-900 dark:text-white bg-transparent border border-slate-300 dark:border-slate-800 rounded-none outline-none focus:border-slate-500 transition-colors";
const LABEL_CLS =
  "text-sm font-semibold text-slate-900 dark:text-white mb-1 block";
const BTN_PRIMARY =
  "bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 py-1.5 px-4 flex items-center justify-center gap-2 rounded-none text-sm font-medium transition-colors disabled:opacity-50";

function SettingCard({
  title,
  description,
  children,
  footerText,
  footerAction,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footerText?: string;
  footerAction?: React.ReactNode;
}) {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-none bg-white dark:bg-slate-900 overflow-hidden mb-3 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div className="p-4 sm:p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5 tracking-tight uppercase">
          {title}
        </h3>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4 font-medium leading-relaxed">
          {description}
        </p>
        <div className="max-w-xl">{children}</div>
      </div>
      {(footerText || footerAction) && (
        <div className="px-4 py-2 sm:px-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {footerText}
          </p>
          <div>{footerAction}</div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useTranslationStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [preferences, setPreferences] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDocs, setShowDocs] = useState(false);

  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      const prefs = await settingsApi.getPreferences();
      setPreferences(prefs);
    } catch {
      toast.error(t("settings.errorLoadPrefs"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const { user } = useAuthStore();
  const filteredTabs = TABS.filter((tab) =>
    tab.roles.includes(user?.role || "analyst"),
  );
  const ActiveIcon = filteredTabs.find((t) => t.id === activeTab)?.icon || User;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden relative">
      <div className="flex relative min-h-[calc(100vh-200px)]">
        <div
          className={`flex-1 transition-all duration-300 ${showDocs ? "lg:mr-[350px]" : ""}`}
        >
          <div className="max-w-[1500px] mx-auto px-4 sm:px-8 py-0 sm:py-0 space-y-4 sm:space-y-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 sm:mb-6 pt-0">
              <div>
                <h1 className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                  {t("settings.title")}
                </h1>
                <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
                  {t("settings.subtitle")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden lg:block">
                  <DocumentationToggle
                    showDocs={showDocs}
                    setShowDocs={setShowDocs}
                    text={t("settings.docsToggleLabel")}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-3">
                <nav className="space-y-1 sticky top-20">
                  {filteredTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-none"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                      }`}
                    >
                      {t(tab.nameKey)}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="lg:col-span-9 space-y-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                      <Loader2 className="h-10 w-10 animate-spin text-slate-900 dark:text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                      Loading preferences...
                    </p>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-500">
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
                    {activeTab === "system" && <SystemStatusSettings />}
                    {activeTab === "appearance" && (
                      <AppearanceSettings
                        preferences={preferences}
                        onRefresh={loadPreferences}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <DocumentationSidebar
          showDocs={showDocs}
          setShowDocs={setShowDocs}
          directory={t("settings.docsDirectory")}
          title={t("settings.docsTitleSys")}
          description={t("settings.docsDescriptionSys")}
          rawText={t("settings.docsRawTextSys")}
        >
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                {t("settings.docsOverviewLabel")}
              </span>
              <h2 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">
                {t("settings.docsOverviewTitle")}
              </h2>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-800/50 p-2.5 rounded-none border border-slate-100 dark:border-slate-800">
              {t("settings.docsOverviewText")}
            </p>
          </section>

          <section className="space-y-3 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                {t("settings.docsAccessControlLabel")}
              </span>
              <h2 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">
                {t("settings.docsAccessControlTitle")}
              </h2>
            </div>
            <div className="space-y-3 ml-0.5">
              {[
                {
                  id: "1",
                  title: t("settings.docsProfileSettingsTitle"),
                  desc: t("settings.docsProfileSettingsDesc"),
                },
                {
                  id: "2",
                  title: t("settings.docsSecurityProtocolTitle"),
                  desc: t("settings.docsSecurityProtocolDesc"),
                },
                {
                  id: "3",
                  title: t("settings.docsLaboratoryEnvTitle"),
                  desc: t("settings.docsLaboratoryEnvDesc"),
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
    </div>
  );
}

function ProfileSettings() {
  const { t } = useTranslationStore();
  const { user } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) setFullName(user.full_name || "");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error(t("settings.profileErrorNameRequired"));
      return;
    }
    setIsSaving(true);
    try {
      await authApi.updateProfile({ full_name: fullName.trim() });
      useAuthStore.getState().updateUser({ full_name: fullName.trim() });
      toast.success(t("settings.profileSuccess"));
    } catch (error: any) {
      const errDetail = error.response?.data?.detail;
      const errorMsg = typeof errDetail === "string" ? errDetail : Array.isArray(errDetail) ? errDetail[0]?.msg : t("settings.profileError");
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <SettingCard
        title={t("settings.profileFullName")}
        description="This is your visible name within the ColonyAI platform."
        footerText="Please use 32 characters at maximum."
        footerAction={
          <button onClick={handleSubmit} disabled={isSaving} className={BTN_PRIMARY}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </button>
        }
      >
        <input
          type="text"
          className={INPUT_CLS}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={t("settings.profileFullNamePlaceholder")}
          maxLength={32}
        />
      </SettingCard>

      <SettingCard
        title={t("settings.profileEmail")}
        description={t("settings.profileEmailImmutable")}
      >
        <input
          type="email"
          className={`${INPUT_CLS} opacity-60 cursor-not-allowed`}
          value={user?.email || ""}
          disabled
        />
      </SettingCard>

      <SettingCard
        title={t("settings.profileNodeRole")}
        description={t("settings.profileProvisioned")}
      >
        <input
          type="text"
          className={`${INPUT_CLS} opacity-60 cursor-not-allowed capitalize`}
          value={user?.role || ""}
          disabled
        />
      </SettingCard>
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
  const { t } = useTranslationStore();
  const [settings, setSettings] = useState({
    analysis_complete: true,
    boundary_alerts: true,
    weekly_summary: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences?.notifications) setSettings(preferences.notifications);
  }, [preferences]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.updateNotifications(settings);
      toast.success(t("settings.notifSuccess"));
      onRefresh();
    } catch (error: any) {
      const errDetail = error.response?.data?.detail;
      const errorMsg = typeof errDetail === "string" ? errDetail : Array.isArray(errDetail) ? errDetail[0]?.msg : t("settings.notifError");
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const ITEMS = [
    {
      key: "analysis_complete",
      titleKey: "settings.notifNeuralSync",
      descKey: "settings.notifNeuralSyncDesc",
      icon: Zap,
      badge: "Real-Time",
    },
    {
      key: "boundary_alerts",
      titleKey: "settings.notifIsoThreshold",
      descKey: "settings.notifIsoThresholdDesc",
      icon: AlertTriangle,
      badge: "Critical",
    },
    {
      key: "weekly_summary",
      titleKey: "settings.notifIntelligenceSummary",
      descKey: "settings.notifIntelligenceSummaryDesc",
      icon: FileText,
      badge: "Digest",
    },
  ];

  return (
    <div className="space-y-4">
      <SettingCard
        title="Email Notifications"
        description="Configure which events trigger an email notification to your registered address."
        footerText="These settings apply only to your account."
        footerAction={
          <button onClick={handleSave} disabled={isSaving} className={BTN_PRIMARY}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </button>
        }
      >
        <div className="space-y-4">
          {ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {t(item.titleKey)}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {t(item.descKey)}
                </p>
              </div>
              <div className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out bg-slate-200 dark:bg-slate-700 overflow-hidden ml-4">
                <input
                  type="checkbox"
                  checked={settings[item.key as keyof typeof settings]}
                  onChange={(e) =>
                    setSettings({ ...settings, [item.key]: e.target.checked })
                  }
                  className="peer absolute h-full w-full opacity-0 z-10 cursor-pointer"
                />
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-100 shadow-sm ring-0 transition-all duration-300 ease-in-out mt-[2px] ml-[2px] ${settings[item.key as keyof typeof settings] ? "translate-x-3.5 !bg-primary" : "translate-x-0"}`}
                />
              </div>
            </div>
          ))}
        </div>
      </SettingCard>
    </div>
  );
}

function SecuritySettings() {
  const { t } = useTranslationStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t("settings.secAllFieldsRequired"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("settings.secPasswordsMismatch"));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t("settings.secPasswordLength"));
      return;
    }
    setIsUpdating(true);
    try {
      await settingsApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success(t("settings.secPasswordSuccess"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || t("settings.secPasswordError"),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm(t("settings.secRevokeConfirm"))) return;
    try {
      await settingsApi.revokeAllSessions();
      toast.success(t("settings.secRevokeSuccess"));
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error: any) {
      const errDetail = error.response?.data?.detail;
      const errorMsg = typeof errDetail === "string" ? errDetail : Array.isArray(errDetail) ? errDetail[0]?.msg : t("settings.secRevokeError");
      toast.error(errorMsg);
    } finally { };
  };

  return (
    <div className="space-y-4">
      <SettingCard
        title="Change Password"
        description="Update the password used to authenticate your ColonyAI node access."
        footerText="Use a strong password with at least 8 characters."
        footerAction={
          <button onClick={handleSubmit} disabled={isUpdating} className={BTN_PRIMARY}>
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
          </button>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className={LABEL_CLS}>{t("settings.secCurrentSecret")}</label>
            <input
              type="password"
              placeholder="••••••••••••"
              className={INPUT_CLS}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className={LABEL_CLS}>{t("settings.secNewSecret")}</label>
            <input
              type="password"
              placeholder="••••••••••••"
              className={INPUT_CLS}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className={LABEL_CLS}>{t("settings.secConfirmSecret")}</label>
            <input
              type="password"
              placeholder="••••••••••••"
              className={INPUT_CLS}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
      </SettingCard>

      <div className="border border-rose-200 dark:border-rose-900/50 rounded-none bg-rose-50/50 dark:bg-rose-950/20 overflow-hidden mb-6 shadow-sm">
        <div className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-1">
            Active Sessions
          </h3>
          <p className="text-sm text-rose-700/80 dark:text-rose-400/80 mb-4">
            Terminate all active sessions on other devices. This will log you out from all other browsers.
          </p>
        </div>
        <div className="px-5 py-3 sm:px-6 bg-rose-100/50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
          <p className="text-sm text-rose-700 dark:text-rose-400">
            This action cannot be undone.
          </p>
          <button onClick={handleRevokeAllSessions} className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-1.5 rounded-none transition-colors">
            Revoke Access
          </button>
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
  const { t } = useTranslationStore();
  const [config, setConfig] = useState({
    lab_name: "ColonyAI Central Hub",
    default_media: "Plate Count Agar",
    default_volume: 1.0,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences?.laboratory) setConfig(preferences.laboratory);
  }, [preferences]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsApi.updateLaboratory(config);
      toast.success(t("settings.labSuccess"));
      onRefresh();
    } catch (error: any) {
      const errDetail = error.response?.data?.detail;
      const errorMsg = typeof errDetail === "string" ? errDetail : Array.isArray(errDetail) ? errDetail[0]?.msg : t("settings.labError");
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <SettingCard
        title={t("settings.labHubDesignation")}
        description="The primary designation or name of this laboratory unit."
        footerText="Visible on all generated reports."
        footerAction={
          <button onClick={handleSave} disabled={isSaving} className={BTN_PRIMARY}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </button>
        }
      >
        <input
          type="text"
          className={INPUT_CLS}
          value={config.lab_name}
          onChange={(e) => setConfig({ ...config, lab_name: e.target.value })}
        />
      </SettingCard>

      <SettingCard
        title={t("settings.labDefaultMatrix")}
        description="The default culture media used for routine analysis."
        footerText="Select from approved ISO media."
        footerAction={
          <button onClick={handleSave} disabled={isSaving} className={BTN_PRIMARY}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </button>
        }
      >
        <div className="relative max-w-sm">
          <select
            className={`${INPUT_CLS} appearance-none cursor-pointer pr-10`}
            value={config.default_media}
            onChange={(e) => setConfig({ ...config, default_media: e.target.value })}
          >
            <option value="Plate Count Agar">PCA — Plate Count Agar</option>
            <option value="VRBA">VRBA — Violet Red Bile Agar</option>
            <option value="TSA">TSA — Tryptic Soy Agar</option>
            <option value="R2A">R2A — Reasoner's 2A Agar</option>
            <option value="BGBB">BGBB — Brilliant Green Bile Broth</option>
            <option value="MacConkey">MAC — MacConkey Agar</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </SettingCard>

      <SettingCard
        title={t("settings.labStandardVolume")}
        description="Default sample volume in milliliters (ml)."
        footerText={t("settings.labIsoCalibrated")}
        footerAction={
          <button onClick={handleSave} disabled={isSaving} className={BTN_PRIMARY}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </button>
        }
      >
        <div className="max-w-[150px]">
          <input
            type="number"
            step="0.1"
            min="0.1"
            className={INPUT_CLS}
            value={config.default_volume}
            onChange={(e) => setConfig({ ...config, default_volume: parseFloat(e.target.value) })}
          />
        </div>
      </SettingCard>
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
  const { t } = useTranslationStore();
  const [appearance, setAppearance] = useState({
    theme: "system",
    language: "en",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences?.appearance) setAppearance(preferences.appearance);
  }, [preferences]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.updateAppearance(appearance);
      toast.success(t("settings.appSuccess"));
      onRefresh();
    } catch (error: any) {
      const errDetail = error.response?.data?.detail;
      const errorMsg = typeof errDetail === "string" ? errDetail : Array.isArray(errDetail) ? errDetail[0]?.msg : t("settings.appError");
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <SettingCard
        title={t("settings.appInterfaceAesthetic")}
        description="Choose how ColonyAI looks on this device."
        footerText="This setting only affects your current device."
        footerAction={
          <button onClick={handleSave} disabled={isSaving} className={BTN_PRIMARY}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </button>
        }
      >
        <div className="relative max-w-[200px]">
          <select
            className={`${INPUT_CLS} appearance-none cursor-pointer pr-10`}
            value={appearance.theme}
            onChange={(e) => setAppearance({ ...appearance, theme: e.target.value })}
          >
            <option value="light">{t("settings.appClinicalWhite")}</option>
            <option value="dark">{t("settings.appLowLightNeural")}</option>
            <option value="system">{t("settings.appAutoSyncNode")}</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </SettingCard>

      <SettingCard
        title={t("settings.appLinguisticMatrix")}
        description="Select your preferred language."
        footerText="Changes will apply across all dashboard modules."
        footerAction={
          <button onClick={handleSave} disabled={isSaving} className={BTN_PRIMARY}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </button>
        }
      >
        <div className="relative max-w-[200px]">
          <select
            className={`${INPUT_CLS} appearance-none cursor-pointer pr-10`}
            value={appearance.language}
            onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
          >
            <option value="en">{t("settings.appGlobalEnglish")}</option>
            <option value="id">{t("settings.appRegionalBahasa")}</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </SettingCard>
    </div>
  );
}

function SystemStatusSettings() {
  const { t } = useTranslationStore();
  const infra = {
    node: "ap-southeast-1 (Jakarta)",
    storage_quota: "1 TB",
    storage_used: "12.4 GB",
    retention: "5 Years",
    compliance: "ISO-17025",
    status: "Healthy",
  };

  return (
    <div className="space-y-6">
      <SettingCard
        title={t("settings.sysS3Storage")}
        description={`Your current storage quota is ${infra.storage_quota}. Data retention policy is set to ${infra.retention}.`}
      >
        <div className="space-y-2 mt-2">
          <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
            <span>{t("settings.sysUsageBaseline")}</span>
            <span>1.2%</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 dark:bg-blue-600 w-[1.2%]" />
          </div>
        </div>
      </SettingCard>

      <SettingCard
        title="Node Status & Connectivity"
        description={`Connected to ${infra.node}. System is running under ${infra.compliance} compliance protocol.`}
      >
        <div className="flex items-center gap-2 mt-2 px-3 py-1.5 border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-none w-fit">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">
            {infra.status} — 24ms latency
          </span>
        </div>
      </SettingCard>

      <SettingCard
        title={t("settings.sysInfraTransparency")}
        description={t("settings.sysInfraText", { node: infra.node })}
      >
        <div />
      </SettingCard>
    </div>
  );
}

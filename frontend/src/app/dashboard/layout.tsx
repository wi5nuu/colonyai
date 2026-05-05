"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  History,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Scale,
  BarChart3,
  ShieldCheck,
  Activity,
  Lock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { AuthGuard } from "@/lib/auth-guard";
import { AskAI } from "@/components/AskAI";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslationStore } from "@/lib/i18n/store";

const navigation = [
  {
    name: "Global Control",
    href: "/dashboard/super",
    icon: Globe,
    roles: ["super_admin"],
    tKey: "nav.globalControl",
  },
  {
    name: "Systems Sentinel",
    href: "/dashboard/sentinel",
    icon: Activity,
    roles: ["super_admin"],
    tKey: "nav.sentinel",
  },
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["analyst", "manager", "auditor", "admin", "super_admin"],
    tKey: "nav.overview",
  },
  {
    name: "New Analysis",
    href: "/dashboard/upload",
    icon: Upload,
    roles: ["analyst", "admin", "super_admin"],
    tKey: "nav.newAnalysis",
  },
  {
    name: "History",
    href: "/dashboard/history",
    icon: History,
    roles: ["analyst", "manager", "auditor", "admin", "super_admin"],
    tKey: "nav.history",
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    roles: ["manager", "admin", "super_admin"],
    tKey: "nav.analytics",
  },
  {
    name: "Simulator",
    href: "/dashboard/simulator",
    icon: Scale,
    roles: ["analyst", "admin", "super_admin"],
    tKey: "nav.simulator",
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
    roles: ["manager", "auditor", "admin", "super_admin"],
    tKey: "nav.reports",
  },
  {
    name: "Audit Ledger",
    href: "/dashboard/audit",
    icon: ShieldCheck,
    roles: ["manager", "auditor", "admin", "super_admin"],
    tKey: "nav.auditLedger",
  },
  {
    name: "Administration",
    href: "/dashboard/administration",
    icon: Lock,
    roles: ["admin", "super_admin"],
    tKey: "nav.administration",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["analyst", "manager", "auditor", "admin", "super_admin"],
    tKey: "nav.settings",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [askAIOpen, setAskAIOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    {
      id: string | number;
      type: string;
      title: string;
      message: string;
      time: string;
      read: boolean;
    }[]
  >([]);

  useEffect(() => {
    // Professional implementation: Fetch notifications from /api/v1/notifications
  }, []);
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuthStore();
  const { t } = useTranslationStore();

  const handleLogout = async () => {
    await auth.logout();
    router.push("/login");
  };

  const user = auth.user;

  return (
    <AuthGuard>
      <div className="h-screen bg-[#f4f7f6] flex font-sans selection:bg-primary/20 selection:text-primary overflow-hidden">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-150"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 ${isCollapsed ? "lg:w-14" : "lg:w-48"} w-48 bg-white border-r border-slate-100 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} rounded-xl lg:rounded-none lg:mr-0 shadow-2xl lg:shadow-none`}
        >
          <div className="flex flex-col h-full text-slate-600">
            <div
              className={`flex items-center justify-between pt-3 pb-3 px-4 transition-all duration-300 ${isCollapsed ? "px-3 justify-center" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center transition-all drop-shadow-sm ${isCollapsed ? "w-10 h-10" : "w-10 h-10"}`}
                >
                  <img
                    src="/android-chrome-512x512.png"
                    alt="ColonyAI Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col animate-in fade-in duration-300">
                    <span className="text-base font-bold tracking-tight text-slate-900">
                      ColonyAI
                    </span>
                    {user?.role === "super_admin" && (
                      <span className="text-[8px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-[0.2em] w-fit">
                        Nexus Master
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide px-3 mt-3">
              {navigation
                .filter((item) => item.roles.includes(user?.role || "analyst"))
                .map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 py-1.5 rounded-xl transition-all relative group ${
                        isActive
                          ? "bg-primary/5 text-primary"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      } ${isCollapsed ? "justify-center px-0" : "px-4"}`}
                      title={isCollapsed ? t(item.tKey) : ""}
                    >
                      {isActive && !isCollapsed && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full" />
                      )}
                      <item.icon
                        className={`transition-all ${isCollapsed ? "h-5 w-5" : "h-3.5 w-3.5"}`}
                      />
                      {!isCollapsed && (
                        <span className="text-[10px] font-bold tracking-wide animate-in fade-in slide-in-from-left-2 duration-300">
                          {t(item.tKey)}
                        </span>
                      )}
                    </Link>
                  );
                })}
            </nav>

            {/* Sidebar Bottom */}
            <div
              className={`py-6 mt-auto transition-all duration-300 ${isCollapsed ? "px-0" : "px-6"}`}
            >
              {!isCollapsed && (
                <div className="bg-slate-50 rounded-xl p-4 relative overflow-hidden group border border-slate-100 animate-in fade-in zoom-in duration-300">
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
                      {t("header.nextCalibration")}
                    </p>
                    <div className="flex gap-2">
                      {[
                        { val: "05", label: t("header.days") },
                        { val: "02", label: t("header.hours") },
                        { val: "15", label: t("header.mins") },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="bg-white text-slate-900 border border-slate-200 font-bold rounded-lg w-8 h-8 flex items-center justify-center text-xs shadow-sm">
                            {item.val}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-4 opacity-5 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                    <Activity className="w-20 h-20 text-slate-900" />
                  </div>
                </div>
              )}

              <button
                onClick={handleLogout}
                className={`flex items-center gap-3 py-2 mt-3 transition-all text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl ${isCollapsed ? "justify-center mx-3" : "px-4"}`}
                title={isCollapsed ? t("nav.logout") : ""}
              >
                <LogOut
                  className={`${isCollapsed ? "h-5 w-5" : "h-3.5 w-3.5"}`}
                />
                {!isCollapsed && (
                  <span className="text-[10px] font-bold">
                    {t("nav.logout")}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`hidden lg:flex items-center justify-center mt-4 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600 ${isCollapsed ? "mx-3" : ""}`}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="px-1 py-0.5 sm:px-3 sm:py-0.5 flex items-center justify-between sticky top-0 bg-[#f4f7f6]/80 backdrop-blur-md z-30 h-10">
            <div className="flex items-center gap-2 sm:gap-4 flex-1">
              <button
                onClick={() => {
                  if (window.innerWidth >= 1024) setIsCollapsed(!isCollapsed);
                  else setSidebarOpen(true);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="scale-90 sm:scale-100 origin-right">
                <LanguageSwitcher />
              </div>
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-lg bg-white shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all outline-none"
                >
                  <Bell className="h-4 w-4 text-slate-600" />
                  {notifications.some((n) => !n.read) && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                        {t("header.notifications")}
                      </h3>
                      <button
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((n) => ({ ...n, read: true })),
                          );
                          toast.success("All notifications cleared");
                        }}
                        className="text-[10px] font-bold text-primary uppercase tracking-tighter hover:underline"
                      >
                        {t("header.clearAll")}
                      </button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.read ? "bg-primary/5" : ""}`}
                          >
                            {!n.read && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                            )}
                            <div className="flex gap-3">
                              <div
                                className={`p-1.5 rounded-md ${n.type === "alert" ? "bg-rose-100 text-rose-500" : "bg-emerald-100 text-emerald-500"}`}
                              >
                                {n.type === "alert" ? (
                                  <AlertCircle className="w-3.5 h-3.5" />
                                ) : (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-black text-slate-900 leading-tight">
                                  {n.title}
                                </p>
                                <p className="text-[11px] text-slate-400 font-medium mt-1 leading-snug">
                                  {n.message}
                                </p>
                                <p className="text-[10px] text-slate-300 font-bold mt-1 uppercase tracking-tighter">
                                  {n.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                            {t("header.noNewSignals")}
                          </p>
                        </div>
                      )}
                    </div>
                    <button className="w-full py-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors border-t border-slate-100">
                      {t("header.viewLogHistory")}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[9px]">
                    {user?.full_name?.[0] || "A"}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto scrollbar-hide relative z-10">
            <div className="min-h-full flex flex-col px-1 sm:px-2 py-0 sm:py-0 pb-14 sm:pb-4">
              <div className="flex-1">{children}</div>

              {/* Global Dashboard Footer */}
              <footer className="mt-16 pt-8 pb-12 border-t border-slate-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                    {[
                      { n: t("footer.support"), h: "#" },
                      { n: t("footer.systemStatus"), h: "/dashboard/sentinel" },
                      { n: t("footer.careers"), h: "#" },
                      { n: t("footer.termsOfUse"), h: "/terms" },
                      { n: t("footer.reportSecurity"), h: "#" },
                      { n: t("footer.privacyPolicy"), h: "/privacy" },
                    ].map((link, i) => (
                      <Link
                        key={i}
                        href={link.h}
                        className="text-xs text-slate-400 hover:text-primary transition-colors font-semibold tracking-tight uppercase"
                      >
                        {link.n}
                      </Link>
                    ))}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 py-1.5 px-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                      <div className="flex">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white -mr-1" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white border border-blue-500" />
                      </div>
                      <span className="text-[11px] text-slate-600 font-bold">
                        {t("footer.cookiePreferences")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold tracking-tight uppercase">
                      {t("footer.copyright")}
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          </main>
        </div>

        {/* Bottom Navigation for Mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-12 bg-white/95 backdrop-blur-lg border-t border-slate-100 flex items-center justify-around px-0.5 z-40 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
          {navigation
            .filter((item) => item.roles.includes(user?.role || "analyst"))
            .slice(0, 5)
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all relative ${isActive ? "text-primary" : "text-slate-400"}`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-6 rounded-full transition-all duration-300 ${isActive ? "bg-primary/10" : "bg-transparent"}`}
                  >
                    <item.icon
                      className={`h-3.5 w-3.5 ${isActive ? "scale-110" : ""}`}
                    />
                  </div>
                  <span className="bottom-nav-label text-[7px] font-bold uppercase tracking-tight transition-all duration-300">
                    {t(item.tKey).split(" ")[0]}
                  </span>
                </Link>
              );
            })}
        </div>

        {/* Single Floating AI Trigger — Original Logo (bg removed) */}
        <button
          onClick={() => setAskAIOpen(!askAIOpen)}
          className={`fixed bottom-20 right-4 z-[110] w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 hover:drop-shadow-[0_0_12px_rgba(99,102,241,0.6)] ${askAIOpen ? "rotate-12 scale-95" : ""}`}
        >
          {askAIOpen ? (
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
              <X className="w-5 h-5 text-white" />
            </div>
          ) : (
            <img
              src="/android-chrome-512x512.png"
              className="w-14 h-14 object-contain drop-shadow-xl"
              alt="Ask AI"
            />
          )}
          {!askAIOpen && (
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white animate-bounce" />
          )}
        </button>

        <AskAI isOpen={askAIOpen} onClose={() => setAskAIOpen(false)} />
      </div>
    </AuthGuard>
  );
}

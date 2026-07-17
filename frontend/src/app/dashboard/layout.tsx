"use client";

import { useState, useEffect, useMemo } from "react";
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
  Map,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { AuthGuard } from "@/lib/auth-guard";
import { AskAI } from "@/components/AskAI";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslationStore } from "@/lib/i18n/store";
import { ThemeToggle } from "@/components/ThemeToggle";
import api from "@/lib/api";

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
    name: "Network Map",
    href: "/dashboard/network",
    icon: Globe,
    roles: ["super_admin"],
    tKey: "nav.networkMap",
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

const NavItem = ({
  item,
  isActive,
  isCollapsed,
  setSidebarOpen,
  t,
}: {
  item: any;
  isActive: boolean;
  isCollapsed: boolean;
  setSidebarOpen: (b: boolean) => void;
  t: (k: string) => string;
}) => (
  <Link
    href={item.href}
    onClick={() => setSidebarOpen(false)}
    className={`flex items-center gap-3 py-1.5 rounded-sm transition-all relative group ${
      isActive
        ? "bg-primary/5 text-primary"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
    } ${isCollapsed ? "justify-center px-0" : "px-2"}`}
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuthStore();
  const { t } = useTranslationStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [askAIOpen, setAskAIOpen] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState<"all" | "system" | "security">("all");
  const [notifications, setNotifications] = useState<
    {
      id: string | number;
      type: string;
      title: string;
      message: string;
      time: string;
      read: boolean;
      link?: string;
    }[]
  >([
    {
      id: "sys-001",
      type: "system",
      title: "MODEL TRAINING COMPLETE",
      message: "FT_COLONY_V3_NIGHTLY reached mAP@50: 0.9850 — 80/80 epochs completed.",
      time: "Just Now",
      read: false,
    },
    {
      id: "sys-002",
      type: "system",
      title: "SYSTEM STATUS: OPTIMAL",
      message: "All 12 nodes active. Uptime: 99.98%. No anomalies detected.",
      time: "5 Min Ago",
      read: true,
    },
    {
      id: "sys-003",
      type: "system",
      title: "ISO-17025 CALIBRATION SCHEDULED",
      message: "Next system calibration is due in 5 days. Ensure all instruments are ready.",
      time: "1 Hour Ago",
      read: true,
    },
  ]);

  const playNotificationSound = () => {
    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    );
    audio.volume = 0.5;
    audio.play().catch((e) => console.log("Audio play blocked by browser", e));
  };

  useEffect(() => {
    // Simulation: New Request for Approval arrives after 8 seconds
    const timer = setTimeout(() => {
      const newNotify = {
        id: Date.now(),
        type: "approval",
        title: t("dashboardLayout.approvalRequired"),
        message: t("dashboardLayout.resetPasswordRequest"),
        time: t("dashboardLayout.justNow"),
        read: false,
      };
      setNotifications((prev) => [newNotify, ...prev]);
      playNotificationSound();
      toast.info(
        t("dashboardLayout.newSystemSignal"),
        {
          description: t("dashboardLayout.approvalRequiredDesc"),
          action: {
            label: t("dashboardLayout.view"),
            onClick: () => router.push("/dashboard/administration"),
          },
        },
      );
    }, 8000);

    return () => clearTimeout(timer);
  }, [router, t]);

  // Fetch real password reset requests and push to notifications
  useEffect(() => {
    const fetchResetRequests = async () => {
      const role = auth.user?.role;
      if (role !== "admin" && role !== "super_admin") return;
      try {
        const res = await api.get<{ reset_requests: { id: string; user_name: string; user_email: string; requested_at: string }[] }>("/api/v1/auth/reset-requests");
        const pending = res.data.reset_requests.filter((r: any) => r.status === "pending");
        if (pending.length === 0) return;
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const newOnes = pending
            .filter((r: any) => !existingIds.has(`reset-${r.id}`))
            .map((r: any) => ({
              id: `reset-${r.id}`,
              type: "approval",
              title: "PASSWORD RESET REQUEST",
              message: `${r.user_name} (${r.user_email}) requested password reset.`,
              time: new Date(r.requested_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
              read: false,
              link: "/dashboard/administration",
            }));
          return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
        });
      } catch {
        // silently fail — backend might not be running
      }
    };
    fetchResetRequests();
    const interval = setInterval(fetchResetRequests, 30000);
    return () => clearInterval(interval);
  }, [auth.user?.role]);

  // Calibration Countdown Logic
  const [timeLeft, setTimeLeft] = useState({
    days: "05",
    hours: "02",
    mins: "15",
    secs: "00",
  });

  useEffect(() => {
    // Target date: 5 days, 2 hours, 15 mins from May 7, 2026 03:49:10
    const targetDate = new Date("2026-05-12T06:04:10").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: "00", hours: "00", mins: "00", secs: "00" });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({
          days: days.toString().padStart(2, "0"),
          hours: hours.toString().padStart(2, "0"),
          mins: minutes.toString().padStart(2, "0"),
          secs: seconds.toString().padStart(2, "0"),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await auth.logout();
    router.push("/login");
  };

  const user = auth.user;

  return (
    <AuthGuard>
      <div className="h-screen bg-[#f4f7f6] dark:bg-slate-950 flex font-sans selection:bg-primary/20 selection:text-primary overflow-hidden transition-colors duration-300">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-150"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 ${isCollapsed ? "lg:w-14" : "lg:w-48"} w-48 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} rounded-sm lg:rounded-none lg:mr-0 shadow-2xl lg:shadow-none`}
        >
          <div className="flex flex-col h-full text-slate-600">
            <div
              className={`flex items-center justify-between pt-3 pb-3 px-2 transition-all duration-300 ${isCollapsed ? "px-2 justify-center" : ""}`}
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
                    <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
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
            <nav className="flex-1 space-y-4 overflow-y-auto scrollbar-hide px-3 mt-3">
              {(() => {
                const allowedItems = navigation.filter((item) =>
                  item.roles.includes(user?.role || "analyst"),
                );

                if (user?.role === "super_admin") {
                  const nexusItems = allowedItems.filter((i) =>
                    ["Global Control", "Systems Sentinel", "Network Map"].includes(i.name),
                  );
                  const universalItems = allowedItems.filter((i) =>
                    ["New Analysis", "Simulator", "History"].includes(i.name),
                  );
                  const coreItems = allowedItems.filter(
                    (i) =>
                      !nexusItems.includes(i) && !universalItems.includes(i),
                  );

                  return (
                    <>
                      {/* Nexus Control */}
                      <div>
                        {!isCollapsed && (
                          <p className="text-[9px] font-black tracking-[0.2em] text-primary/70 uppercase mb-2 px-2">
                            Nexus Control
                          </p>
                        )}
                        <div className="space-y-1">
                          {nexusItems.map((item) => (
                            <NavItem
                              key={item.name}
                              item={item}
                              isActive={pathname === item.href}
                              isCollapsed={isCollapsed}
                              setSidebarOpen={setSidebarOpen}
                              t={t}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Universal Access (Bypass) */}
                      <div>
                        {!isCollapsed && (
                          <div className="flex items-center gap-2 mb-2 px-2">
                            <p className="text-[9px] font-black tracking-[0.2em] text-emerald-500/80 uppercase">
                              Universal Access
                            </p>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                        )}
                        <div className="space-y-1">
                          {universalItems.map((item) => (
                            <NavItem
                              key={item.name}
                              item={item}
                              isActive={pathname === item.href}
                              isCollapsed={isCollapsed}
                              setSidebarOpen={setSidebarOpen}
                              t={t}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Core Dashboard */}
                      <div>
                        {!isCollapsed && (
                          <p className="text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase mb-2 px-2">
                            Core Features
                          </p>
                        )}
                        <div className="space-y-1">
                          {coreItems.map((item) => (
                            <NavItem
                              key={item.name}
                              item={item}
                              isActive={pathname === item.href}
                              isCollapsed={isCollapsed}
                              setSidebarOpen={setSidebarOpen}
                              t={t}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  );
                }

                // Normal user rendering
                return (
                  <div className="space-y-1">
                    {allowedItems.map((item) => (
                      <NavItem
                        key={item.name}
                        item={item}
                        isActive={pathname === item.href}
                        isCollapsed={isCollapsed}
                        setSidebarOpen={setSidebarOpen}
                        t={t}
                      />
                    ))}
                  </div>
                );
              })()}
            </nav>

            {/* Sidebar Bottom */}
            <div
              className={`py-6 mt-auto transition-all duration-300 ${isCollapsed ? "px-0" : "px-2"}`}
            >
              {!isCollapsed && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-sm p-4 relative overflow-hidden group border border-slate-100 dark:border-slate-700/50 animate-in fade-in zoom-in duration-300">
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
                      {t("header.nextCalibration")}
                    </p>
                    <div className="flex gap-2">
                      {[
                        { val: timeLeft.days, label: t("header.days") },
                        { val: timeLeft.hours, label: t("header.hours") },
                        { val: timeLeft.mins, label: t("header.mins") },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold rounded-lg w-8 h-8 flex items-center justify-center text-xs shadow-sm">
                            {item.val}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-tighter">
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
                className={`flex items-center gap-3 py-2 mt-3 transition-all text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-sm ${isCollapsed ? "justify-center mx-3" : "px-2"}`}
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


            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="px-3 py-1 sm:px-5 sm:py-1.5 flex items-center justify-between sticky top-0 bg-[#f4f7f6]/80 dark:bg-slate-950/80 backdrop-blur-md z-30 h-14 transition-colors duration-300">
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
              <div className="flex items-center gap-2 sm:gap-3 scale-90 sm:scale-100 origin-right">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer outline-none"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.some((n) => !n.read) && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                  )}
                </button>

                {notificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 lg:hidden bg-slate-900/40 backdrop-blur-sm"
                      onClick={() => setNotificationsOpen(false)}
                    />
                    <div
                      className={`
                      fixed bottom-0 left-0 w-full h-[70vh] bg-white dark:bg-slate-900 rounded-none shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.3)] z-50 overflow-hidden animate-in slide-in-from-bottom duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                      lg:absolute lg:bottom-auto lg:top-full lg:right-0 lg:-translate-x-6 lg:mt-3 lg:w-96 lg:h-auto lg:max-h-[500px] lg:rounded-none lg:shadow-2xl lg:border lg:border-slate-100 lg:dark:border-slate-800 lg:animate-in lg:fade-in lg:slide-in-from-top-2
                    `}
                    >
                      {/* Grab Handle - Mobile Only */}
                      <div className="w-full flex justify-center pt-4 pb-2 lg:hidden">
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                      </div>

                      <div className="px-6 py-4 lg:px-4 lg:py-3 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="text-[10px] lg:text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                          {t("header.notifications")}
                        </h3>
                        <button
                          onClick={() => {
                            setNotifications([]);
                            toast.success("Notification Ledger Cleared");
                          }}
                          className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                        >
                          {t("header.clearAll")}
                        </button>
                      </div>
                      <div className="overflow-y-auto h-[calc(100%-120px)] lg:max-h-[350px] scrollbar-hide">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (n.link) {
                                  router.push(n.link);
                                  setNotificationsOpen(false);
                                }
                              }}
                              className={`px-5 py-3 lg:px-4 lg:py-2.5 border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative ${!n.read ? "bg-primary/5" : ""} ${n.link ? "hover:pr-8" : ""}`}
                            >
                              {!n.read && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 lg:w-1 bg-primary" />
                              )}
                              <div className="flex gap-3.5 lg:gap-2.5">
                                <div
                                  className={`flex items-center justify-center w-8 h-8 rounded-none ${
                                    n.type === "alert"
                                      ? "text-rose-500"
                                      : n.type === "approval"
                                        ? "text-amber-500"
                                        : "text-emerald-500"
                                  }`}
                                >
                                  {n.type === "alert" ? (
                                    <AlertCircle className="w-5 h-5 lg:w-4 lg:h-4" />
                                  ) : n.type === "approval" ? (
                                    <Key className="w-5 h-5 lg:w-4 lg:h-4" />
                                  ) : (
                                    <CheckCircle className="w-5 h-5 lg:w-4 lg:h-4" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs lg:text-[11px] font-black text-slate-900 dark:text-white leading-tight uppercase tracking-wide">
                                    {n.title}
                                  </p>
                                  <p className="text-[11px] lg:text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1 leading-snug">
                                    {n.message}
                                  </p>
                                  <p className="text-[9px] text-slate-300 dark:text-slate-600 font-black mt-1 uppercase tracking-widest">
                                    {n.time}
                                  </p>
                                </div>
                                {n.link && (
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-12 text-center">
                            <Bell className="w-12 h-12 text-slate-100 dark:text-slate-800 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                              {t("header.noNewSignals")}
                            </p>
                          </div>
                        )}
                      </div>
                      <button className="absolute bottom-0 left-0 w-full py-5 lg:py-3 bg-slate-50 dark:bg-slate-800 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-600 transition-colors border-t border-slate-100 dark:border-slate-700">
                        {t("header.viewLogHistory")}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800 relative">
                <div
                  className="hidden sm:flex flex-col items-end cursor-pointer"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <p className="text-[11px] font-black text-slate-900 dark:text-white leading-none uppercase tracking-tight hover:text-primary transition-colors">
                    {user?.full_name || "User"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate max-w-[140px]">
                      {user?.email}
                    </span>
                    <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-none" />
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-none border border-primary/20">
                      {user?.role?.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <div
                  className="w-10 h-10 rounded-none overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:scale-110 cursor-pointer"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-[12px]">
                    {user?.full_name?.[0] || "U"}
                  </div>
                </div>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div
                      className={`
                      fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.3)] z-50 overflow-hidden animate-in slide-in-from-bottom duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                      lg:absolute lg:bottom-auto lg:top-full lg:right-0 lg:mt-3 lg:w-56 lg:h-auto lg:rounded-xl lg:shadow-2xl lg:border lg:border-slate-100 lg:dark:border-slate-800 lg:animate-in lg:fade-in lg:slide-in-from-top-2
                    `}
                    >
                      {/* Grab Handle - Mobile Only */}
                      <div className="w-full flex justify-center pt-4 pb-2 lg:hidden">
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                      </div>

                      <div className="p-6 lg:p-0">
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-4 lg:gap-3 px-6 py-5 lg:px-4 lg:py-3 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                        >
                          <Settings className="w-5 h-5 lg:w-4 lg:h-4" />
                          <span className="text-xs lg:text-[10px] font-bold uppercase tracking-[0.2em]">
                            {t("nav.settings")}
                          </span>
                        </Link>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            auth.logout();
                            router.push("/login");
                          }}
                          className="w-full flex items-center gap-4 lg:gap-3 px-6 py-5 lg:px-4 lg:py-3 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer text-rose-500"
                        >
                          <LogOut className="w-5 h-5 lg:w-4 lg:h-4" />
                          <span className="text-xs lg:text-[10px] font-bold uppercase tracking-[0.2em]">
                            {t("nav.logout")}
                          </span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto relative z-10 lg:scrollbar-hide w-full max-w-full overflow-x-hidden">
            <div className="min-h-full flex flex-col px-3 sm:px-6 py-0 sm:py-0 pb-32 sm:pb-6 w-full">
              <div className="flex-1">{children}</div>

              {/* Global Dashboard Footer */}
              <footer className="mt-8 pt-4 pb-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
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
                        className="text-[9px] text-slate-400 hover:text-primary transition-colors font-bold uppercase tracking-tight"
                      >
                        {link.n}
                      </Link>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 py-1 px-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm scale-90">
                      <div className="flex">
                        <div className="w-2 h-2 rounded-none bg-blue-500 border border-white -mr-1" />
                        <div className="w-2 h-2 rounded-none bg-white border border-blue-500" />
                      </div>
                      <span className="text-[9px] text-slate-600 dark:text-slate-400 font-bold uppercase">
                        {t("footer.cookiePreferences")}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                      {t("footer.copyright")}
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          </main>
        </div>

        {/* ── Premium Bottom Navigation (Reference-Inspired) ── */}
        <div className="lg:hidden fixed bottom-6 left-4 right-4 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 flex items-center justify-between px-6 z-40 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          {/* Left Side Icons */}
          <div className="flex items-center justify-around flex-1">
            {navigation
              .filter((item) => item.roles.includes(user?.role || "analyst"))
              .slice(0, 2)
              .map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-col items-center gap-1 transition-all ${isActive ? "text-primary scale-110" : "text-slate-400"}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-[7px] font-black uppercase tracking-tighter">
                      {t(item.tKey).split(" ")[0]}
                    </span>
                  </Link>
                );
              })}
          </div>

          {/* Central Action Button (The "Scanner" style from reference) */}
          <div className="relative -top-6">
            <Link
              href="/dashboard/upload"
              className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-full flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(99,102,241,0.5)] border-4 border-white dark:border-slate-950 active:scale-90 transition-all"
            >
              <Upload className="w-7 h-7 text-white" />
              <div className="absolute -bottom-1 w-1.5 h-1.5 bg-white rounded-full" />
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center justify-around flex-1">
            {navigation
              .filter((item) => item.roles.includes(user?.role || "analyst"))
              .filter(
                (item) => !["Overview", "New Analysis"].includes(item.name),
              ) // Skip what we already have or center
              .slice(0, 2)
              .map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-col items-center gap-1 transition-all ${isActive ? "text-primary scale-110" : "text-slate-400"}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-[7px] font-black uppercase tracking-tighter">
                      {t(item.tKey).split(" ")[0]}
                    </span>
                  </Link>
                );
              })}
          </div>
        </div>

        {/* Single Floating AI Trigger — Original Logo (bg removed) */}
        <button
          onClick={() => setAskAIOpen(!askAIOpen)}
          className={`fixed bottom-16 right-4 z-[110] w-14 h-14 rounded-none shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.6)] ${askAIOpen ? "rotate-12 scale-95" : ""}`}
        >
          {askAIOpen ? (
            <div className="w-14 h-14 bg-slate-900 rounded-none flex items-center justify-center shadow-xl">
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
            <>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-none border-2 border-white dark:border-slate-900 animate-pulse" />
              <AITooltip />
            </>
          )}
        </button>

        <AskAI isOpen={askAIOpen} onClose={() => setAskAIOpen(false)} />
      </div>
    </AuthGuard>
  );
}

// AI Tooltip Component with Random Messages
function AITooltip() {
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const messages = useMemo(() => [
    "Ready to analyze your colony plates with 95%+ accuracy!",
    "ISO-17025 compliant AI assistant at your service.",
    "Need help? I can guide you through the analysis process.",
    "Upload your plate image and let AI do the counting!",
    "Fast, accurate, and reliable colony detection ready.",
    "Your intelligent lab assistant is standing by.",
    "Automated CFU counting in just 3 seconds per plate.",
    "300× faster than manual counting - try me now!",
    "AI-powered precision for your microbiology workflow.",
    "Click to start your intelligent analysis session!",
  ], []);

  useEffect(() => {
    // Show tooltip after 2 seconds
    const showTimer = setTimeout(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
      setIsVisible(true);
    }, 2000);

    // Change message every 8 seconds
    const changeInterval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 8000);

    // Hide after 30 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 30000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearInterval(changeInterval);
    };
  }, [messages]);

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-full right-0 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg shadow-xl max-w-[280px] relative">
        <p className="text-[10px] font-bold leading-relaxed">{message}</p>
        <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-emerald-500 rotate-45" />
      </div>
    </div>
  );
}

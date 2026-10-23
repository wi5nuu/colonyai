"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Users,
  ChevronDown,
  ChevronRight,
  Search,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useTranslationStore } from "@/lib/i18n/store";

interface OrgPersonnel {
  id: string;
  full_name: string;
  email: string;
  role: string;
  recovery_password?: string;
}

interface OrgSummary {
  id: string;
  name: string;
  location: string;
  status: string;
  users_count: number;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  admin:     { label: "Admin",    color: "text-indigo-600 dark:text-indigo-400",  bg: "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800" },
  manager:   { label: "Manager",  color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800" },
  auditor:   { label: "Auditor",  color: "text-purple-600 dark:text-purple-400",  bg: "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800" },
  analyst:   { label: "Analyst",  color: "text-slate-600 dark:text-slate-400",   bg: "bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700" },
  super_admin:{ label: "Master",  color: "text-rose-600 dark:text-rose-400",    bg: "bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800" },
};

function OrgPersonnelRow({
  org,
}: {
  org: OrgSummary;
}) {
  const [expanded, setExpanded] = useState(false);
  const [personnel, setPersonnel] = useState<OrgPersonnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const { t } = useTranslationStore();

  const loadPersonnel = useCallback(async () => {
    if (personnel.length > 0) {
      setExpanded((e) => !e);
      return;
    }
    setLoading(true);
    setExpanded(true);
    try {
      const res = await api.get<OrgPersonnel[]>(
        `/api/v1/super/organizations/${org.id}/personnel`
      );
      setPersonnel(res.data);
    } catch {
      toast.error(t("globalPersonnel.failedLoadingPersonnel") + org.name);
      setExpanded(false);
    } finally {
      setLoading(false);
    }
  }, [org.id, org.name, personnel.length, t]);

  const toggleReveal = (id: string) =>
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  const roleOrder = ["super_admin", "admin", "manager", "auditor", "analyst"];
  const sorted = [...personnel].sort(
    (a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role)
  );

  return (
    <div className={`transition-all duration-300 border border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${expanded ? 'bg-slate-50/50 dark:bg-slate-800/30' : 'bg-white dark:bg-slate-900'}`}>
      {/* Org Header Row — compact like Registri Master */}
      <div
        className="p-2 flex items-center justify-between gap-3 cursor-pointer"
        onClick={loadPersonnel}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-none bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 transition-colors shrink-0">
            <Building2 className="w-3 h-3 text-slate-400 group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h3 className="text-[9px] font-bold text-slate-900 dark:text-white">{org.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{org.location}</span>
              <div className="w-0.5 h-0.5 bg-slate-300 rounded-none" />
              <span className="text-[7px] font-bold text-primary uppercase tracking-widest">{org.users_count} Users</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-none ${org.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
              <p className={`text-[8px] font-bold uppercase tracking-widest ${org.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>{org.status}</p>
            </div>
          </div>
          <div>{loading ? (
            <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
          ) : expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          )}</div>
        </div>
      </div>

      {/* Personnel Table — Registri Master drill-down style */}
      {expanded && !loading && personnel.length > 0 && (
        <div className="px-2 pb-3 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-primary" />
              <h4 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                {sorted.length} {t("globalPersonnel.registeredPersonnel")}
              </h4>
            </div>
            <a
              href={`/dashboard/administration`}
              className="flex items-center gap-1 px-2 py-1 bg-slate-900 dark:bg-primary/20 hover:bg-primary dark:hover:bg-primary text-white dark:text-primary dark:hover:text-white border border-transparent dark:border-primary/30 text-[8px] font-black uppercase tracking-widest rounded-none transition-all"
            >
              <Shield className="w-2.5 h-2.5" />
              {t("globalPersonnel.openAdminPanel")}
              <ArrowRight className="w-2.5 h-2.5" />
            </a>
          </div>
          <div className="space-y-2">
            {sorted.map((p) => {
              const rc = ROLE_CONFIG[p.role] ?? ROLE_CONFIG.analyst;
              return (
                <div key={p.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none p-2 flex items-center justify-between group/admin hover:border-primary/30 shadow-sm transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-none bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-[9px] font-black text-primary border border-primary/10 dark:border-primary/20">
                      {p.full_name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-[9px] font-bold text-slate-900 dark:text-white leading-none">{p.full_name}</h4>
                      <p className="text-[8px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{p.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-none border ${rc.bg} ${rc.color}`}>
                          {rc.label}
                        </span>
                        {p.recovery_password ? (
                          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded-none border border-slate-100 dark:border-slate-800 group/pass">
                            <span className="text-[7px] font-mono font-bold text-slate-600 dark:text-slate-400 tracking-tighter min-w-[60px]">
                              {revealedIds[p.id] ? p.recovery_password : "••••••••"}
                            </span>
                            <button
                              onClick={() => toggleReveal(p.id)}
                              className="p-0.5 text-slate-300 hover:text-primary transition-all hover:scale-110 active:scale-95"
                            >
                              {revealedIds[p.id] ? <EyeOff className="w-2 h-2" /> : <Eye className="w-2 h-2" />}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {expanded && !loading && personnel.length === 0 && (
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400">{t("globalPersonnel.noPersonnelRegistered")}</p>
        </div>
      )}
    </div>
  );
}

export function GlobalPersonnelPanel() {
  const [orgs, setOrgs] = useState<OrgSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { t } = useTranslationStore();

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any[]>("/api/v1/super/organizations");
      setOrgs(
        res.data.map((o) => ({
          id: String(o.id),
          name: o.name,
          location: o.location || "—",
          status: o.status,
          users_count: o.users_count,
        }))
      );
    } catch {
      toast.error(t("globalPersonnel.failedLoadingOrgList"));
    } finally {
      setLoading(false);
    }
    }, [t]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const filtered = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden shadow-sm">
      {/* Header — matches Registri Master style */}
      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-primary rounded-none animate-ping" />
          <div>
            <h2 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
              {t("globalPersonnel.globalPersonnelCommand")}
            </h2>
            <p className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {t("globalPersonnel.orgClickExpand", { count: orgs.length })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative group/search w-full sm:w-auto">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("globalPersonnel.searchOrganization")}
              className="pl-7 pr-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-[9px] font-bold w-full sm:w-40 outline-none focus:ring-2 focus:ring-primary/20 dark:text-white transition-colors shadow-sm"
            />
          </div>
          <button
            onClick={fetchOrgs}
            className="p-1 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-none transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 max-h-[600px] overflow-y-auto scrollbar-hide bg-slate-50/20 dark:bg-slate-900/20">
        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none shadow-sm">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="ml-2 text-xs text-slate-400">{t("globalPersonnel.loadingOrgData")}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-8 text-center shadow-sm">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase">{t("super.searchNotFound")}</h3>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1">{t("globalPersonnel.noResultsFor", { query: search })}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((org) => (
              <OrgPersonnelRow key={org.id} org={org} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 flex items-center justify-between">
        <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
          Nexus Global Personnel Registry · Super Admin Eyes Only
        </span>
        <span className="text-[8px] font-medium text-slate-300 dark:text-slate-500">
          {t("globalPersonnel.orgsDisplayed", { filtered: filtered.length, total: orgs.length })}
        </span>
      </div>
    </div>
  );
}

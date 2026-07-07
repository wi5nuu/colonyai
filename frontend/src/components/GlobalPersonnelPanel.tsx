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
  Key,
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
  }, [org.id, org.name, personnel.length]);

  const toggleReveal = (id: string) =>
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  const roleOrder = ["super_admin", "admin", "manager", "auditor", "analyst"];
  const sorted = [...personnel].sort(
    (a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role)
  );

  return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-none overflow-hidden mb-2 last:mb-0 bg-white dark:bg-slate-900/50">
      {/* Org Header Row */}
      <button
        onClick={loadPersonnel}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="text-left">
            <p className="text-xs font-black text-slate-900 dark:text-white">{org.name}</p>
            <p className="text-[10px] text-slate-400 font-medium">{org.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-none border ${
              org.status === "active"
                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800"
            }`}
          >
            {org.status}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
            <Users className="w-3 h-3" />
            <span>{org.users_count}</span>
          </div>
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
          ) : expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Personnel Table */}
      {expanded && !loading && personnel.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          {/* Sub-header with "Open Admin Panel" button */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {sorted.length} {t("globalPersonnel.registeredPersonnel")}
            </p>
            <a
              href={`/dashboard/administration`}
              className="flex items-center gap-1 px-3 py-1 bg-slate-900 dark:bg-primary/20 hover:bg-primary dark:hover:bg-primary text-white dark:text-primary dark:hover:text-white border border-transparent dark:border-primary/30 text-[9px] font-black uppercase tracking-widest rounded-none transition-all"
            >
              <Shield className="w-3 h-3" />
              {t("globalPersonnel.openAdminPanel")}
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {t("globalPersonnel.name")}
                </th>
                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Role
                </th>
                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Email
                </th>
                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Recovery Pass
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sorted.map((p) => {
                const rc = ROLE_CONFIG[p.role] ?? ROLE_CONFIG.analyst;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-none bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-600 dark:text-slate-300 shrink-0">
                          {p.full_name.charAt(0)}
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                          {p.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-none border ${rc.bg} ${rc.color}`}
                      >
                        {rc.label}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        {p.email}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {p.recovery_password ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300">
                            {revealedIds[p.id]
                              ? p.recovery_password
                              : "••••••••••••"}
                          </span>
                          <button
                            onClick={() => toggleReveal(p.id)}
                            className="text-slate-300 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors"
                          >
                            {revealedIds[p.id] ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] text-slate-300 dark:text-slate-600 italic">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
    }, []);

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
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
              {t("globalPersonnel.globalPersonnelCommand")}
            </h3>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            {orgs.length} {t("globalPersonnel.orgClickExpand")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("globalPersonnel.searchOrganization")}
              className="pl-7 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none w-44"
            />
          </div>
          <button
            onClick={fetchOrgs}
            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-none transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[600px] overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="ml-2 text-xs text-slate-400">{t("globalPersonnel.loadingOrgData")}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-slate-400">{t("globalPersonnel.noResultsFor") + '"' + search + '"'}</p>
          </div>
        ) : (
          <div>
            {filtered.map((org) => (
              <OrgPersonnelRow key={org.id} org={org} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 flex items-center justify-between">
        <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
          Nexus Global Personnel Registry · Super Admin Eyes Only
        </span>
        <span className="text-[9px] font-medium text-slate-300 dark:text-slate-500">
          {filtered.length} / {orgs.length} {t("globalPersonnel.orgsDisplayed")}
        </span>
      </div>
    </div>
  );
}

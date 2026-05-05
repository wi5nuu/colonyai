"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
  BarChart3,
  Clock,
  Menu,
  X,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { useTranslationStore } from "@/lib/i18n/store";

const TOP_BAR_BG = "bg-gradient-to-r from-[#0055ff] to-[#00f2ff]";
const PRIMARY_GRADIENT =
  "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";

export default function TujuanManfaatPage() {
  const { t } = useTranslationStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#00f2ff] selection:text-slate-900">
      {/* ── Futuristic Header ── */}
      <section className="py-12 lg:py-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent opacity-20" />
        <div className="max-w-7xl mx-auto px-6 text-left space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
            {t("tujuanManfaat.badge")}
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff] uppercase">
            {t("tujuanManfaat.heroTitle")}
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 font-bold leading-relaxed max-w-2xl uppercase tracking-wide">
            {t("tujuanManfaat.heroDesc")}
          </p>
        </div>
      </section>

      {/* ── Goals Grid ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: t("tujuanManfaat.strategicTitle"),
              items: [
                t("tujuanManfaat.strategic1"),
                t("tujuanManfaat.strategic2"),
                t("tujuanManfaat.strategic3"),
                t("tujuanManfaat.strategic4"),
              ],
              icon: <TargetIcon className="w-6 h-6" />,
              color: "from-[#0055ff] to-[#00f2ff]",
            },
            {
              title: t("tujuanManfaat.analystTitle"),
              items: [
                t("tujuanManfaat.analyst1"),
                t("tujuanManfaat.analyst2"),
                t("tujuanManfaat.analyst3"),
                t("tujuanManfaat.analyst4"),
              ],
              icon: <Clock className="w-6 h-6" />,
              color: "from-[#00f2ff] to-[#0055ff]",
            },
            {
              title: t("tujuanManfaat.institutionTitle"),
              items: [
                t("tujuanManfaat.institution1"),
                t("tujuanManfaat.institution2"),
                t("tujuanManfaat.institution3"),
                t("tujuanManfaat.institution4"),
              ],
              icon: <BarChart3 className="w-6 h-6" />,
              color: "from-[#ff00ff] to-[#0055ff]",
            },
          ].map((goal, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-8 border border-slate-100 shadow-xl hover:shadow-2xl transition-all group"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-r ${goal.color} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform`}
              >
                {goal.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-6">
                {goal.title}
              </h3>
              <div className="space-y-4">
                {goal.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 group/item">
                    <CheckCircle2 className="w-4 h-4 text-[#00f2ff] mt-0.5 flex-shrink-0" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide group-hover/item:text-slate-900 transition-colors">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Innovation Callout ── */}
      <section className="py-24 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
              {t("tujuanManfaat.valueTitle")}
            </h2>
            <p className="text-sm lg:text-base text-white/50 font-medium leading-relaxed uppercase tracking-widest">
              {t("tujuanManfaat.valueDesc")}
            </p>
            <div className="pt-4">
              <Link
                href="/challenge"
                className={`inline-flex items-center gap-3 ${PRIMARY_GRADIENT} text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all`}
              >
                {t("tujuanManfaat.learnMore")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="relative">
            <div
              className={`absolute -inset-10 ${PRIMARY_GRADIENT} opacity-10 blur-[100px]`}
            />
            <img
              src="https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=800&auto=format&fit=crop"
              alt="Lab Innovation"
              className="rounded-xl shadow-2xl relative z-10 border border-white/10"
            />
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}

function TargetIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

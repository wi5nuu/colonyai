"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Award,
  CheckCircle2,
  Lock,
  FileText,
  Activity,
  Zap,
  Building2,
  Menu,
  Globe,
  X,
  Sparkles,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { useTranslationStore } from "@/lib/i18n/store";

const TOP_BAR_BG = "bg-gradient-to-r from-[#0055ff] to-[#00f2ff]";
const PRIMARY_GRADIENT =
  "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";

export default function CompliancePage() {
  const { t } = useTranslationStore();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#00f2ff] selection:text-slate-900">
      {/* ── Formal Page Header ── */}
      <section className="py-24 bg-slate-50 relative overflow-hidden border-b border-slate-100">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white border-l border-slate-100 -z-0" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-[#0055ff]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                {t("compliance.badge")}
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
              {t("compliance.heroTitle")}
            </h1>
            <p className="text-base lg:text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
              {t("compliance.heroDesc")}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="relative group">
              <div
                className={`absolute -inset-6 ${PRIMARY_GRADIENT} opacity-10 blur-3xl group-hover:opacity-20 transition-all`}
              />
              <div className="bg-white border-4 border-slate-50 p-6 lg:p-10 rounded-xl shadow-2xl relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-full flex justify-center">
                  <img
                    src="https://th.bing.com/th/id/OIP.2Pn5RarX6_fIH7LxThLzqwHaD4?w=304&h=180&c=7&r=0&o=5&pid=1.7"
                    alt="ISO Certification"
                    className="h-16 lg:h-24 w-auto object-contain"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                    {t("compliance.isoTitle")}
                  </h4>
                  <p className="text-[10px] font-black text-[#0055ff] uppercase tracking-[0.2em]">
                    {t("compliance.isoSubtitle")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Compliance Pillars ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: t("compliance.pillar1Title"),
                desc: t("compliance.pillar1Desc"),
                icon: <Lock className="w-6 h-6" />,
                label: t("compliance.pillar1Label"),
              },
              {
                title: t("compliance.pillar2Title"),
                desc: t("compliance.pillar2Desc"),
                icon: <FileText className="w-6 h-6" />,
                label: t("compliance.pillar2Label"),
              },
              {
                title: t("compliance.pillar3Title"),
                desc: t("compliance.pillar3Desc"),
                icon: <Zap className="w-6 h-6" />,
                label: t("compliance.pillar3Label"),
              },
            ].map((p, i) => (
              <div
                key={i}
                className="bg-slate-50 p-10 rounded-xl border border-slate-100 shadow-xl hover:shadow-2xl transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 mb-8 group-hover:bg-[#0055ff] group-hover:text-white transition-all`}
                >
                  {p.icon}
                </div>
                <h4 className="text-[9px] font-black text-[#0055ff] uppercase tracking-[0.3em] mb-2">
                  {p.label}
                </h4>
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-4">
                  {p.title}
                </h3>
                <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wide">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Institutional Partners ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="bg-slate-900 rounded-xl p-8 lg:p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <div className="relative z-10 space-y-8 text-center">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                  {t("compliance.verifiedTitle")}
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col items-center gap-4 transition-all hover:bg-white/10">
                    <img
                      src="https://th.bing.com/th/id/OIP.bFXKGOriWS0ET5cz_hghRgHaDe?w=319&h=180&c=7&r=0&o=5&pid=1.7"
                      className="h-10 lg:h-14 w-auto object-contain"
                      alt="TUV NORD"
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">
                        TUV NORD Indonesia
                      </span>
                      <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">
                        {t("compliance.tuvLabel")}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col items-center gap-4 transition-all hover:bg-white/10">
                    <img
                      src="https://th.bing.com/th/id/OIP.QFb4rSX2W64YGmdQE5vTaQHaIB?w=170&h=185&c=7&r=0&o=5&pid=1.7"
                      className="h-14 lg:h-20 w-auto object-contain"
                      alt="President University"
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">
                        President University
                      </span>
                      <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">
                        {t("compliance.presidentLabel")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
              {t("compliance.securityTitle")}
            </h2>
            <div className="space-y-4">
              {[
                t("compliance.security1"),
                t("compliance.security2"),
                t("compliance.security3"),
                t("compliance.security4"),
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:border-[#00f2ff] transition-all bg-white shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#00f2ff]" />
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}

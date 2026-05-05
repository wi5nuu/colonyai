"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Award,
  Globe,
  Github,
  Menu,
  ShieldCheck,
  Target,
  Zap,
  Activity,
  X,
  Sparkles,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { useTranslationStore } from "@/lib/i18n/store";

const TOP_BAR_BG = "bg-gradient-to-r from-[#0055ff] to-[#00f2ff]";
const PRIMARY_GRADIENT =
  "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";
const ACCENT_BLUE = "text-[#0055ff]";

export default function ChallengePage() {
  const { t } = useTranslationStore();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#00f2ff] selection:text-slate-900">
      {/* ── Hero Section ── */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <div
            className={`absolute top-0 right-0 w-[50%] h-full ${PRIMARY_GRADIENT} opacity-10 blur-[120px]`}
          />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
              <div className={`w-1.5 h-1.5 rounded-full ${PRIMARY_GRADIENT}`} />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/70">
                {t("challenge.badge")}
              </span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
              {t("challenge.heroTitle")}
            </h1>

            <p
              className="text-base lg:text-lg text-white/50 font-medium leading-relaxed max-w-2xl border-l-2 border-[#0055ff] pl-6 italic"
              dangerouslySetInnerHTML={{ __html: t("challenge.heroDesc") }}
            ></p>
          </div>
        </div>
      </section>

      {/* ── Case Dossier Content ── */}
      <section className="py-24 px-6 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Left: Problem Statement ── */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl p-8 lg:p-12 shadow-2xl border border-slate-100 space-y-10">
                <div className="space-y-4">
                  <h2 className="text-xl lg:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
                    {t("challenge.problemTitle")}
                  </h2>
                  <p
                    className="text-sm text-slate-600 leading-relaxed font-medium"
                    dangerouslySetInnerHTML={{
                      __html: t("challenge.problemDesc"),
                    }}
                  ></p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      title: t("challenge.issue1Title"),
                      desc: t("challenge.issue1Desc"),
                    },
                    {
                      title: t("challenge.issue2Title"),
                      desc: t("challenge.issue2Desc"),
                    },
                    {
                      title: t("challenge.issue3Title"),
                      desc: t("challenge.issue3Desc"),
                    },
                    {
                      title: t("challenge.issue4Title"),
                      desc: t("challenge.issue4Desc"),
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-6 bg-slate-50 rounded-xl border border-slate-100 group hover:border-[#00f2ff] transition-all"
                    >
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <div
                          className={`w-1 h-1 rounded-full ${PRIMARY_GRADIENT}`}
                        />
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-bold">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h3 className="text-lg lg:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff] mb-6">
                    {t("challenge.innovationTitle")}
                  </h3>
                  <div className="space-y-4">
                    {[
                      t("challenge.innovation1"),
                      t("challenge.innovation2"),
                      t("challenge.innovation3"),
                      t("challenge.innovation4"),
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:shadow-lg transition-all"
                      >
                        <CheckCircle2 className="text-[#00f2ff] w-4 h-4 flex-shrink-0" />
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Case Meta Data ── */}
            <div className="space-y-8">
              <div
                className={`rounded-xl p-8 text-white ${PRIMARY_GRADIENT} shadow-2xl relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -mr-16 -mt-16" />
                <h3 className="text-lg font-black uppercase tracking-widest mb-6 border-b border-white/20 pb-2">
                  {t("challenge.summaryTitle")}
                </h3>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-white/60 uppercase">
                      {t("challenge.categoryLabel")}
                    </p>
                    <p className="text-sm font-black uppercase tracking-widest">
                      {t("challenge.categoryValue")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-white/60 uppercase">
                      {t("challenge.providerLabel")}
                    </p>
                    <p className="text-sm font-black uppercase tracking-widest">
                      {t("challenge.providerValue")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-white/60 uppercase">
                      {t("challenge.yearLabel")}
                    </p>
                    <p className="text-sm font-black uppercase tracking-widest">
                      {t("challenge.yearValue")}
                    </p>
                  </div>
                  <div className="pt-4">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-xl border border-white/20">
                      <p className="text-[10px] font-bold leading-relaxed uppercase tracking-widest">
                        {t("challenge.summaryQuote")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-xl space-y-6 text-center">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  {t("challenge.partnersTitle")}
                </h4>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col items-center gap-2 p-4 border border-slate-100 rounded-xl">
                    <img
                      src="https://w7.pngwing.com/pngs/771/817/png-transparent-logo-quality-management-tuv-nord-technischer-uberwachungsverein-iso-9001-blue-text-logo.png"
                      className="h-8 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all"
                      alt="TUV"
                    />
                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-300">
                      {t("challenge.mainProvider")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 border border-slate-100 rounded-xl">
                    <div className="text-lg font-black italic text-slate-300 tracking-tighter">
                      PRESUNIV
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-300">
                      {t("challenge.academicOrganizer")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}

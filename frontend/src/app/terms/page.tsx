"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  FileText,
  Menu,
  Globe,
  X,
  Sparkles,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { useTranslationStore } from "@/lib/i18n/store";

const TOP_BAR_BG = "bg-gradient-to-r from-[#0055ff] to-[#00f2ff]";
const PRIMARY_GRADIENT =
  "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";

export default function TermsPage() {
  const { t } = useTranslationStore();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#00f2ff] selection:text-slate-900">
      {/* ── Page Header ── */}
      <section className="py-20 bg-slate-50 border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Scale className="w-4 h-4 text-[#0055ff]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              {t("terms.badge")}
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 uppercase">
            {t("terms.title")}{" "}
            <span className="text-[#0055ff]">{t("terms.titleHighlight")}</span>
          </h1>
          <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">
            {t("terms.version")}
          </p>
        </div>
      </section>

      {/* ── Content Section ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-white border border-slate-100 rounded-3xl p-8 lg:p-16 shadow-2xl space-y-12">
          <div className="space-y-6">
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tight border-l-4 border-[#0055ff] pl-6">
              {t("terms.section1Title")}
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm font-medium">
              {t("terms.section1Desc")}
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tight border-l-4 border-[#0055ff] pl-6">
              {t("terms.section2Title")}
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm font-medium">
              {t("terms.section2Desc")}
            </p>
            <ul className="space-y-4">
              {[
                t("terms.section2Item1"),
                t("terms.section2Item2"),
                t("terms.section2Item3"),
                t("terms.section2Item4"),
              ].map((text, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4 text-xs font-bold text-slate-600 uppercase tracking-wide"
                >
                  <X className="w-4 h-4 text-red-500" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tight border-l-4 border-[#0055ff] pl-6">
              {t("terms.section3Title")}
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm font-medium">
              {t("terms.section3Desc")}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  {t("terms.validationTitle")}
                </h4>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase">
                  {t("terms.validationDesc")}
                </p>
              </div>
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  {t("terms.securityTitle")}
                </h4>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase">
                  {t("terms.securityDesc")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 lg:p-12 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="relative z-10 space-y-4">
              <h3 className="text-white text-xl lg:text-3xl font-bold uppercase tracking-tight">
                {t("terms.ctaTitle")}
              </h3>
              <p className="text-white/40 text-[10px] lg:text-[12px] font-black uppercase tracking-[0.3em] max-w-xl mx-auto">
                {t("terms.ctaDesc")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href="mailto:committee-ai-open@president.ac.id"
                className={`${PRIMARY_GRADIENT} text-white px-10 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3`}
              >
                <Phone className="w-4 h-4" /> {t("terms.ctaButton")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

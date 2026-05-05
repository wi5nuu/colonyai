"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Lock,
  FileText,
  Menu,
  Globe,
  X,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { useTranslationStore } from "@/lib/i18n/store";

const TOP_BAR_BG = "bg-gradient-to-r from-[#0055ff] to-[#00f2ff]";
const PRIMARY_GRADIENT =
  "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";

export default function PrivacyPage() {
  const { t } = useTranslationStore();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#00f2ff] selection:text-slate-900">
      {/* ── Page Header ── */}
      <section className="py-20 bg-slate-50 border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Lock className="w-4 h-4 text-[#0055ff]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              {t("privacy.badge")}
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 uppercase">
            {t("privacy.title")}{" "}
            <span className="text-[#0055ff]">
              {t("privacy.titleHighlight")}
            </span>
          </h1>
          <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">
            {t("privacy.lastUpdated")}
          </p>
        </div>
      </section>

      {/* ── Content Section ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-white border border-slate-100 rounded-3xl p-8 lg:p-16 shadow-2xl space-y-12">
          <div className="space-y-6">
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tight border-l-4 border-[#0055ff] pl-6">
              {t("privacy.section1Title")}
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm font-medium">
              {t("privacy.section1Desc")}
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tight border-l-4 border-[#0055ff] pl-6">
              {t("privacy.section2Title")}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: t("privacy.data1Title"),
                  desc: t("privacy.data1Desc"),
                },
                {
                  title: t("privacy.data2Title"),
                  desc: t("privacy.data2Desc"),
                },
                {
                  title: t("privacy.data3Title"),
                  desc: t("privacy.data3Desc"),
                },
                {
                  title: t("privacy.data4Title"),
                  desc: t("privacy.data4Desc"),
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#0055ff] shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-bold">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tight border-l-4 border-[#0055ff] pl-6">
              {t("privacy.section3Title")}
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm font-medium">
              {t("privacy.section3Desc")}
            </p>
            <ul className="space-y-4">
              {[
                t("privacy.use1"),
                t("privacy.use2"),
                t("privacy.use3"),
                t("privacy.use4"),
              ].map((text, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4 text-xs font-bold text-slate-600 uppercase tracking-wide"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0055ff]" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 lg:p-10 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <h3 className="text-white text-lg lg:text-xl font-bold uppercase tracking-tight relative z-10">
              {t("privacy.ctaTitle")}
            </h3>
            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
              {t("privacy.ctaDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href="mailto:committee-ai-open@president.ac.id"
                className={`${PRIMARY_GRADIENT} text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3`}
              >
                <Mail className="w-4 h-4" /> {t("privacy.ctaButton")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

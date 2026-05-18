"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  ChevronDown,
  CheckCircle2,
  Cpu,
  BarChart3,
  FileText,
  FlaskConical,
  Scale,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { useTranslationStore } from "@/lib/i18n/store";

export default function LayananPage() {
  const { t } = useTranslationStore();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* ── Futuristic Header ── */}
      <section className="py-12 lg:py-16 bg-white dark:bg-slate-950 relative overflow-hidden border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent opacity-20" />
        <div className="max-w-[1500px] mx-auto px-6">
          <div className="max-w-3xl space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 dark:bg-slate-800 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
              {t("layanan.breadcrumbCurrent")}
            </div>
            <h1 className="text-2xl lg:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff] uppercase">
              {t("layanan.title")}
            </h1>
            <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-xl uppercase tracking-wide">
              {t("layanan.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-[1500px] mx-auto">

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Cpu,
                title: t("layanan.service1Title"),
                desc: t("layanan.service1Desc"),
                features: [
                  t("layanan.service1Feature1"),
                  t("layanan.service1Feature2"),
                  t("layanan.service1Feature3"),
                ],
              },
              {
                icon: Scale,
                title: t("layanan.service2Title"),
                desc: t("layanan.service2Desc"),
                features: [
                  t("layanan.service2Feature1"),
                  t("layanan.service2Feature2"),
                  t("layanan.service2Feature3"),
                ],
              },
              {
                icon: FileText,
                title: t("layanan.service3Title"),
                desc: t("layanan.service3Desc"),
                features: [
                  t("layanan.service3Feature1"),
                  t("layanan.service3Feature2"),
                  t("layanan.service3Feature3"),
                ],
              },
            ].map((layanan, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-none p-10 hover:shadow-2xl hover:border-slate-200 dark:hover:border-slate-700 transition-all flex flex-col items-center text-center relative"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]" />
                <div className="w-16 h-16 bg-[#0055ff]/10 dark:bg-[#00f2ff]/10 rounded-none flex items-center justify-center mb-8 border border-[#0055ff]/20">
                  <layanan.icon className="w-8 h-8 text-[#0055ff] dark:text-[#00f2ff]" />
                </div>
                <h3 className="text-xl font-bold text-[#0055ff] dark:text-[#00f2ff] uppercase tracking-wider mb-4">
                  {layanan.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-8 uppercase tracking-wide font-medium">
                  {layanan.desc}
                </p>
                <ul className="space-y-3 w-full text-left bg-slate-50 dark:bg-slate-900 p-6 rounded-none border border-slate-100 dark:border-slate-800">
                  {layanan.features.map((f, fi) => (
                    <li
                      key={fi}
                      className="flex items-center gap-3 text-[10px] font-black text-[#0055ff] dark:text-[#00f2ff] uppercase tracking-widest"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0055ff] dark:text-[#00f2ff]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-32 p-12 bg-slate-900 dark:bg-slate-950 rounded-none border-l-4 border-[#0055ff] border dark:border-slate-800 text-white flex flex-col lg:flex-row items-center justify-between gap-12 transition-colors duration-300">
            <div className="space-y-6 flex-1">
              <h2 className="text-3xl font-bold uppercase tracking-wider">{t("layanan.ctaTitle")}</h2>
              <p className="text-slate-400 text-xs uppercase tracking-wide leading-relaxed font-medium">
                {t("layanan.ctaDesc")}
              </p>
              <button className="bg-[#0055ff] text-white px-10 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#1a237e] transition-all shadow-lg active:scale-95">
                {t("layanan.ctaButton")}
              </button>
            </div>
            <div className="flex-1 w-full lg:max-w-md">
              <div className="bg-white/5 border border-white/10 rounded-none p-8 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#0055ff]/20 rounded-none flex items-center justify-center border border-[#0055ff]/30">
                    <Mail className="w-5 h-5 text-[#0055ff]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t("layanan.emailLabel")}
                    </p>
                    <p className="text-sm font-bold tracking-wide">
                      {t("layanan.emailValue")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#0055ff]/20 rounded-none flex items-center justify-center border border-[#0055ff]/30">
                    <Phone className="w-5 h-5 text-[#0055ff]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {t("layanan.phoneLabel")}
                    </p>
                    <p className="text-sm font-bold tracking-wide">
                      {t("layanan.phoneValue")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}

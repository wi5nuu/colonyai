"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  FlaskConical,
  ShieldCheck,
  LayoutDashboard,
  Activity,
  Menu,
  X,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { useTranslationStore } from "@/lib/i18n/store";

const TOP_BAR_BG = "bg-gradient-to-r from-[#0055ff] to-[#00f2ff]";
const PRIMARY_GRADIENT =
  "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";

export default function TargetPenggunaPage() {
  const { t } = useTranslationStore();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#00f2ff] selection:text-slate-900 transition-colors duration-300">
      {/* ── Futuristic Header ── */}
      <section className="py-12 lg:py-16 bg-white dark:bg-slate-950 relative overflow-hidden border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent opacity-20" />
        <div className="max-w-[1500px] mx-auto px-6">
          <div className="max-w-3xl space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 dark:bg-slate-800 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
              {t("targetPengguna.badge")}
            </div>
            <h1 className="text-2xl lg:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff] uppercase">
              {t("targetPengguna.heroTitle")}
            </h1>
            <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-xl uppercase tracking-wide">
              {t("targetPengguna.heroDesc")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Personas Section ── */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-[1500px] mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {t("targetPengguna.whoTitle")}
            </h2>
            <div
              className={`h-1 w-16 mx-auto ${PRIMARY_GRADIENT} rounded-full`}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                role: t("targetPengguna.role1Title"),
                title: t("targetPengguna.role1Subtitle"),
                desc: t("targetPengguna.role1Desc"),
                icon: <FlaskConical className="w-6 h-6" />,
                accent: "border-[#00f2ff] dark:border-[#00f2ff]",
              },
              {
                role: t("targetPengguna.role2Title"),
                title: t("targetPengguna.role2Subtitle"),
                desc: t("targetPengguna.role2Desc"),
                icon: <LayoutDashboard className="w-6 h-6" />,
                accent: "border-[#0055ff] dark:border-[#0055ff]",
              },
              {
                role: t("targetPengguna.role3Title"),
                title: t("targetPengguna.role3Subtitle"),
                desc: t("targetPengguna.role3Desc"),
                icon: <ShieldCheck className="w-6 h-6" />,
                accent: "border-[#ff00ff] dark:border-[#ff00ff]",
              },
            ].map((persona, i) => (
              <div
                key={i}
                className={`bg-white dark:bg-slate-950 rounded-xl p-10 border-b-4 ${persona.accent} shadow-xl hover:-translate-y-2 transition-all duration-500 group h-full flex flex-col`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${PRIMARY_GRADIENT} flex items-center justify-center text-white mb-8 shadow-xl transition-transform`}
                >
                  {persona.icon}
                </div>
                <div className="space-y-4 flex-1">
                  <h4 className="text-[10px] font-black text-[#0055ff] dark:text-[#00f2ff] uppercase tracking-[0.3em]">
                    {persona.role}
                  </h4>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                    {persona.title}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-wide">
                    {persona.desc}
                  </p>
                </div>
                <div className="pt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">
                  <Activity className="w-4 h-4 text-[#00f2ff]" />
                  {t("targetPengguna.targetSegment")}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-xl p-10 lg:p-16 text-center space-y-8 relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-2xl lg:text-4xl font-bold text-white uppercase tracking-tight">
                {t("targetPengguna.ctaTitle")}
              </h2>
              <p className="text-white/40 dark:text-slate-400 text-sm lg:text-base max-w-2xl mx-auto font-medium">
                {t("targetPengguna.ctaDesc")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                <Link
                  href="/login"
                  className={`w-full sm:w-auto ${PRIMARY_GRADIENT} text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all`}
                >
                  {t("targetPengguna.startButton")}
                </Link>
                <Link
                  href="/challenge"
                  className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                >
                  {t("targetPengguna.caseButton")}
                </Link>
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

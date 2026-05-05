"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  ChevronDown,
  ArrowRight,
  Zap,
  Cpu,
  Eye,
  Database,
  Code2,
  Terminal,
  Activity,
  Menu,
  ShieldCheck,
  Globe,
  X,
  Server,
  Layers,
  Lock,
  Box,
  LineChart,
  HardDrive,
  Sparkles,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { useTranslationStore } from "@/lib/i18n/store";

const TOP_BAR_BG = "bg-gradient-to-r from-[#0055ff] to-[#00f2ff]";
const PRIMARY_GRADIENT =
  "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";

export default function TeknologiPage() {
  const { t } = useTranslationStore();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#00f2ff] selection:text-slate-900">
      {/* ── Page Header ── */}
      <section className="py-12 lg:py-16 bg-slate-50 relative overflow-hidden border-b border-slate-100">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white border-l border-slate-100 -z-0" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-left space-y-4 lg:space-y-6">
          <div className="inline-flex items-center gap-3 px-3 py-1.5 bg-white border border-slate-200 rounded-xl">
            <Terminal className="w-3.5 h-3.5 text-[#0055ff]" />
            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
              {t("teknologi.badge")}
            </span>
          </div>

          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff] uppercase">
            {t("teknologi.heroTitle")}
          </h1>

          <p className="text-xs lg:text-sm text-slate-500 font-bold leading-relaxed max-w-2xl uppercase tracking-wide">
            {t("teknologi.heroDesc")}
          </p>
        </div>
      </section>

      {/* ── Technology Pillars ── */}
      <section className="py-20 lg:py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              {
                title: t("teknologi.tech1Title"),
                label: t("teknologi.tech1Label"),
                desc: t("teknologi.tech1Desc"),
                icon: <LineChart className="w-5 h-5 text-[#00f2ff]" />,
              },
              {
                title: t("teknologi.tech2Title"),
                label: t("teknologi.tech2Label"),
                desc: t("teknologi.tech2Desc"),
                icon: <Box className="w-5 h-5 text-[#0055ff]" />,
              },
              {
                title: t("teknologi.tech3Title"),
                label: t("teknologi.tech3Label"),
                desc: t("teknologi.tech3Desc"),
                icon: <Lock className="w-5 h-5 text-[#ff00ff]" />,
              },
              {
                title: t("teknologi.tech4Title"),
                label: t("teknologi.tech4Label"),
                desc: t("teknologi.tech4Desc"),
                icon: <Zap className="w-5 h-5 text-[#00f2ff]" />,
              },
            ].map((tech, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-100 p-6 lg:p-8 rounded-xl hover:bg-white hover:shadow-xl transition-all group h-full"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center mb-6 transition-transform">
                  {tech.icon}
                </div>
                <h4 className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {tech.label}
                </h4>
                <h3 className="text-base lg:text-lg font-bold text-slate-900 uppercase tracking-tight mb-3 lg:mb-4">
                  {tech.title}
                </h3>
                <p className="text-[10px] lg:text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-wide">
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Training Workflow Section ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-[#0055ff] uppercase tracking-[0.3em]">
                {t("teknologi.lifecycleTitle")}
              </h4>
              <h2 className="text-2xl lg:text-5xl font-bold text-slate-900 uppercase tracking-tight leading-tight">
                {t("teknologi.trainingTitle")}
              </h2>
            </div>
            <p className="text-[10px] lg:text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-wide">
              {t("teknologi.trainingDesc")}
            </p>
            <div className="space-y-6">
              {[
                {
                  title: t("teknologi.stat1Label"),
                  val: t("teknologi.stat1Val"),
                },
                {
                  title: t("teknologi.stat2Label"),
                  val: t("teknologi.stat2Val"),
                },
                {
                  title: t("teknologi.stat3Label"),
                  val: t("teknologi.stat3Val"),
                },
                {
                  title: t("teknologi.stat4Label"),
                  val: t("teknologi.stat4Val"),
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b border-slate-200 pb-3"
                >
                  <span className="text-[9px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    {stat.title}
                  </span>
                  <span className="text-[10px] lg:text-xs font-black text-slate-900">
                    {stat.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 lg:p-8 rounded-xl border border-slate-200 shadow-2xl relative">
            <div className="space-y-8 relative z-10">
              {[
                {
                  step: "01",
                  title: t("teknologi.step1Title"),
                  desc: t("teknologi.step1Desc"),
                },
                {
                  step: "02",
                  title: t("teknologi.step2Title"),
                  desc: t("teknologi.step2Desc"),
                },
                {
                  step: "03",
                  title: t("teknologi.step3Title"),
                  desc: t("teknologi.step3Desc"),
                },
                {
                  step: "04",
                  title: t("teknologi.step4Title"),
                  desc: t("teknologi.step4Desc"),
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 lg:gap-6 group">
                  <div className="text-xl lg:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-[#00f2ff] to-[#0055ff]">
                    {item.step}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-widest">
                      {item.title}
                    </h4>
                    <p className="text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div
              className={`absolute -bottom-6 -right-6 w-32 h-32 ${PRIMARY_GRADIENT} opacity-10 blur-3xl`}
            />
          </div>
        </div>
      </section>

      {/* ── Infrastructure Spec ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-xl lg:text-4xl font-bold text-slate-900 uppercase tracking-tight">
              {t("teknologi.infraTitle")}
            </h2>
            <div
              className={`h-1 w-16 mx-auto ${PRIMARY_GRADIENT} rounded-full`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                cat: t("teknologi.infra1Cat"),
                techs: [
                  t("teknologi.infra1Spec1"),
                  t("teknologi.infra1Spec2"),
                  t("teknologi.infra1Spec3"),
                  t("teknologi.infra1Spec4"),
                ],
                icon: <Box className="w-5 h-5" />,
              },
              {
                cat: t("teknologi.infra2Cat"),
                techs: [
                  t("teknologi.infra2Spec1"),
                  t("teknologi.infra2Spec2"),
                  t("teknologi.infra2Spec3"),
                  t("teknologi.infra2Spec4"),
                ],
                icon: <ShieldCheck className="w-5 h-5" />,
              },
              {
                cat: t("teknologi.infra3Cat"),
                techs: [
                  t("teknologi.infra3Spec1"),
                  t("teknologi.infra3Spec2"),
                  t("teknologi.infra3Spec3"),
                  t("teknologi.infra3Spec4"),
                ],
                icon: <HardDrive className="w-5 h-5" />,
              },
            ].map((stack, i) => (
              <div
                key={i}
                className="bg-slate-50 p-6 lg:p-8 rounded-xl border border-slate-100 space-y-6 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                  <div
                    className={`w-10 h-10 rounded-lg ${PRIMARY_GRADIENT} flex items-center justify-center text-white`}
                  >
                    {stack.icon}
                  </div>
                  <h3 className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-widest">
                    {stack.cat}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {stack.techs.map((tech, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-[9px] lg:text-[11px] font-bold text-slate-500 uppercase tracking-widest"
                    >
                      <div className="w-1 h-1 rounded-full bg-[#00f2ff]" />
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Code Showcase ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center text-center lg:text-left">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
              {t("teknologi.devTitle")}
            </h2>
            <div className="space-y-4 lg:space-y-6">
              {[
                t("teknologi.dev1"),
                t("teknologi.dev2"),
                t("teknologi.dev3"),
                t("teknologi.dev4"),
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 group justify-center lg:justify-start"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] shadow-[0_0_10px_#00f2ff]" />
                  <span className="text-[10px] lg:text-xs font-black text-slate-600 uppercase tracking-widest">
                    {text}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="https://github.com/wi5nuu/colonyai"
              target="_blank"
              className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl"
            >
              <Code2 className="w-4 h-4" />
              {t("teknologi.repoButton")}
            </Link>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 lg:p-8 border border-white/10 shadow-2xl relative overflow-hidden group hidden lg:block">
            <div className="font-mono text-[11px] space-y-2 text-[#00f2ff]/80">
              <p className="text-white/20 uppercase tracking-[0.2em] mb-4">
                {t("teknologi.codeComment")}
              </p>
              <p>
                <span className="text-[#ff00ff]">def</span>{" "}
                <span className="text-[#00f2ff]">process_petri_dish</span>
                (image_data):
              </p>
              <p className="pl-4">
                results = model.predict(image_data, conf=
                <span className="text-[#00f2ff]">0.85</span>)
              </p>
              <p className="pl-4">
                <span className="text-[#ff00ff]">for</span> obj{" "}
                <span className="text-[#ff00ff]">in</span> results:
              </p>
              <p className="pl-8 text-white/40"># Identify microbial classes</p>
              <p className="pl-8">class_id = obj.cls</p>
              <p className="pl-8">
                <span className="text-[#ff00ff]">if</span> class_id =={" "}
                <span className="text-white">'colony'</span>:
              </p>
              <p className="pl-12 text-[#00f2ff]">colony_count += 1</p>
              <p className="pl-4">
                <span className="text-[#ff00ff]">return</span> colony_count,
                results.audit_log
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}

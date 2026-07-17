"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Lock,
  UserPlus,
  ShieldAlert,
  X,
  Clock,
  Fingerprint,
} from "lucide-react";
import { toast } from "sonner";
import { SecurityHeader } from "@/components/SecurityHeader";
import { SecurityFooter } from "@/components/SecurityFooter";
import { useTranslationStore } from "@/lib/i18n/store";

const SOP_CONTENT: Record<
  string,
  {
    title: string;
    sections: { label: string; items: string[] }[];
    note: string;
  }
> = {
  "Account Registration": {
    title: "SOP New Personnel Registration",
    sections: [
      {
        label: "Personnel Responsibilities",
        items: [
          "Submit a formal request to the Division Head with a valid government ID and Personnel Serial Number.",
          'Wait for a "Pending Authorization" notification via the registered secure internal channel.',
          "Once approved, initialize your biometric profile and 12-character master password.",
        ],
      },
      {
        label: "Administrator Actions",
        items: [
          "Verify the request against the Central HR Registry and ISO-17025 access matrix.",
          "Manually register the hardware MAC address and create a secure tunnel for initial setup.",
          "Authorize issuance of a unique 16-digit Registration Key (valid for 24 hours).",
        ],
      },
    ],
    note: "Registration is a high-clearance, non-automated process to ensure Zero-Trust perimeter integrity.",
  },
  "Password Recovery": {
    title: "SOP Identity Verification & Reset",
    sections: [
      {
        label: "Applicant Workflow",
        items: [
          "Enter your registered email on the ColonyAI Verification Portal.",
          "Explain the recovery reason (e.g., forgotten credentials, locked account).",
          "Monitor your secure channel for a 1-hour limited Reset Token after Admin approval.",
        ],
      },
      {
        label: "Admin Workflow",
        items: [
          "Receive 24/7 real-time alerts on the Global Control Dashboard.",
          'Perform "Double-Factor" verification (via phone or physical inspection).',
          "Generate and sign a time-limited Reset Token (valid for 60 minutes only).",
        ],
      },
    ],
    note: "24/7 Security Protocol ensures queued requests are immediately reviewed by the Security Operations Center.",
  },
  "Multi-Factor Authentication": {
    title: "SOP MFA / Authenticator Reset",
    sections: [
      {
        label: "Personnel Steps",
        items: [
          "Immediately contact SOC (+62 800-COLONY-AI) if your MFA device is lost or stolen.",
          'Provide the "Emergency Recovery Key" given during initial setup.',
          "Follow Administrator instructions for remote device de-authorization.",
        ],
      },
      {
        label: "SOC Specialist Steps",
        items: [
          "Immediately freeze account access to prevent unauthorized MFA usage.",
          "Verify the Emergency Recovery Key against encrypted vault records.",
          "Force removal of all registered TOTP/FIDO2 devices.",
        ],
      },
    ],
    note: "Manual MFA reset is a high-risk operation requiring verification by two independent Administrators.",
  },
};

export default function TroubleshootPage() {
  const { t } = useTranslationStore();
  const [activeSection, setActiveSection] = useState("create");
  const [learnMoreTopic, setLearnMoreTopic] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sections = React.useMemo(() => [
    { id: "create", title: t("troubleshoot.createTitle") },
    { id: "forgot", title: t("troubleshoot.forgotTitle") },
    { id: "authenticator", title: t("troubleshoot.mfaTitle") },
  ], [t]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCreateAccount = () => {
    toast.error(t("troubleshoot.toastAuthDenied"), {
      description: t("troubleshoot.toastAuthDeniedDesc"),
    });
  };

  const handleCallSupport = () => {
    toast.success(t("troubleshoot.toastSocOpen"), {
      description: t("troubleshoot.toastSocOpenDesc"),
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <SecurityHeader />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.02]">
          <div className="absolute top-10 left-10 w-64 h-64 border border-slate-900 rounded-full" />
          <div className="absolute bottom-10 right-10 w-96 h-96 border border-slate-900 rounded-full" />
        </div>

        <div className="max-w-[1200px] mx-auto w-full px-6 py-12 lg:py-20 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            <aside className="w-full lg:w-72 space-y-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-tight">
                    {t("troubleshoot.navTitle")}
                  </h1>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {t("troubleshoot.navSubtitle")}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                  {t("troubleshoot.registryLabel")}
                </p>
                <nav className="flex flex-col gap-2">
                  {sections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className={`text-left px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                        activeSection === s.id
                          ? "bg-white border border-slate-200 text-slate-900 shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {t("troubleshoot.socOnline")}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  {t("troubleshoot.socDesc")}
                </p>
              </div>
            </aside>

            <main className="flex-1 space-y-24">
              <section id="create" className="scroll-mt-24 space-y-8">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-300 border-b-2 border-slate-200 pb-1 uppercase tracking-widest">
                    {t("troubleshoot.protocol01")}
                  </span>
                </div>
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                    {t("troubleshoot.createTitle")}
                  </h2>
                  <p className="text-[13px] text-slate-500 leading-relaxed max-w-2xl font-medium">
                    {t("troubleshoot.createDesc")}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleCreateAccount}
                      className="h-12 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-8 rounded-2xl transition-all active:scale-95 flex items-center gap-3 shadow-lg shadow-slate-900/10"
                    >
                      <UserPlus className="w-4 h-4" />{" "}
                      {t("troubleshoot.createButton")}
                    </button>
                    <button
                      onClick={() => setLearnMoreTopic("Account Registration")}
                      className="h-12 bg-white border border-slate-200 hover:border-slate-900 text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest px-8 rounded-2xl transition-all"
                    >
                      {t("troubleshoot.reviewSOP")}
                    </button>
                  </div>
                </div>
              </section>

              <section id="forgot" className="scroll-mt-24 space-y-8">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-300 border-b-2 border-slate-200 pb-1 uppercase tracking-widest">
                    {t("troubleshoot.protocol02")}
                  </span>
                </div>
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                    {t("troubleshoot.forgotTitle")}
                  </h2>
                  <p className="text-[13px] text-slate-500 leading-relaxed max-w-2xl font-medium">
                    {t("troubleshoot.forgotDesc")}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href="/troubleshoot/verify"
                      className="h-12 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-8 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-slate-900/10"
                    >
                      <Lock className="w-4 h-4" />{" "}
                      {t("troubleshoot.forgotButton")}
                    </Link>
                    <button
                      onClick={() => setLearnMoreTopic("Password Recovery")}
                      className="h-12 bg-white border border-slate-200 hover:border-slate-900 text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest px-8 rounded-2xl transition-all"
                    >
                      {t("troubleshoot.reviewSOP")}
                    </button>
                  </div>
                </div>
              </section>

              <section id="authenticator" className="scroll-mt-24 space-y-8">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-300 border-b-2 border-slate-200 pb-1 uppercase tracking-widest">
                    {t("troubleshoot.protocol03")}
                  </span>
                </div>
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                    {t("troubleshoot.mfaTitle")}
                  </h2>
                  <p className="text-[13px] text-slate-500 leading-relaxed max-w-2xl font-medium">
                    {t("troubleshoot.mfaDesc")}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleCallSupport}
                      className="h-12 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-8 rounded-2xl transition-all active:scale-95 flex items-center gap-3 shadow-lg shadow-slate-900/10"
                    >
                      <Phone className="w-4 h-4" />{" "}
                      {t("troubleshoot.mfaButton")}
                    </button>
                    <button
                      onClick={() =>
                        setLearnMoreTopic("Multi-Factor Authentication")
                      }
                      className="h-12 bg-white border border-slate-200 hover:border-slate-900 text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest px-8 rounded-2xl transition-all"
                    >
                      {t("troubleshoot.reviewSOP")}
                    </button>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>

      <SecurityFooter />

      {learnMoreTopic && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="h-14 border-b border-slate-100 px-8 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-slate-900" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                  {t("troubleshoot.modalTitle")}
                </span>
              </div>
              <button
                onClick={() => setLearnMoreTopic(null)}
                className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="p-8 sm:p-10 space-y-10 overflow-y-auto max-h-[70vh] scrollbar-hide">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                  {SOP_CONTENT[learnMoreTopic]?.title}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  {t("troubleshoot.modalSubtitle")}
                </p>
              </div>

              <div className="space-y-10">
                {SOP_CONTENT[learnMoreTopic]?.sections.map((section, i) => (
                  <div key={i} className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 border-l-2 border-slate-900 pl-3">
                      {section.label}
                    </h4>
                    <div className="space-y-3 pl-3">
                      {section.items.map((item, j) => (
                        <div key={j} className="flex gap-4 items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                          <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-slate-900 rounded-[2rem] space-y-3 border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {t("troubleshoot.availabilityNotice")}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  {SOP_CONTENT[learnMoreTopic]?.note}
                </p>
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-end bg-slate-50/30">
              <button
                onClick={() => setLearnMoreTopic(null)}
                className="h-12 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest px-10 rounded-2xl transition-all shadow-lg shadow-slate-900/20"
              >
                {t("troubleshoot.understoodButton")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

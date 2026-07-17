"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
  Globe,
} from "lucide-react";
import { AIChatbot } from "./AIChatbot";
import { useTranslationStore } from "@/lib/i18n/store";

export function Footer() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { t } = useTranslationStore();
  const PRIMARY_GRADIENT =
    "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 pt-16 pb-8 font-sans transition-colors duration-300">
      <div className="max-w-[1500px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* ── Column 1: Brand & Desc ────────────────────────── */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Image
                src="/android-chrome-512x512.png"
                alt="ColonyAI Logo"
                width={48}
                height={48}
                className="h-12 w-auto"
              />
              <div className="flex flex-col leading-none">
                <span className="text-[14px] font-black uppercase tracking-widest text-[#0055ff] dark:text-[#00f2ff]">
                  ColonyAI Lab
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                  {t("footer.caseLabel")}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-wide">
              {t("footer.description")}
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, color: "bg-[#1877F2]", label: "Facebook" },
                {
                  Icon: Instagram,
                  color:
                    "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
                  label: "Instagram",
                },
                { Icon: Youtube, color: "bg-[#FF0000]", label: "YouTube" },
                {
                  Icon: (props: any) => (
                    <svg
                      {...props}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                    </svg>
                  ),
                  color: "bg-black",
                  label: "X (Twitter)",
                },
              ].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  className={`w-9 h-9 ${social.color} text-white rounded-lg flex items-center justify-center hover:scale-110 transition-all shadow-md`}
                  aria-label={social.label}
                >
                  <social.Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Column 2: Related Links (Internal) ───────────────── */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
              {t("footer.relatedLinks")}
            </h4>
            <nav className="grid grid-cols-1 gap-3">
              {[
                { name: t("footer.challenge"), href: "/challenge" },
                { name: t("footer.tujuanManfaat"), href: "/tujuan-manfaat" },
                { name: t("footer.targetPengguna"), href: "/target-pengguna" },
                { name: t("footer.teknologi"), href: "/teknologi" },
                { name: t("footer.compliance"), href: "/compliance" },
                { name: "Documentation", href: "/docs" },
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-[#0055ff] dark:hover:text-[#00f2ff] transition-colors uppercase tracking-widest flex items-center gap-2 group"
                >
                  <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-[#0055ff] dark:group-hover:bg-[#00f2ff] transition-colors" />
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Column 3: External Partners ────────────────────────── */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
              {t("footer.strategicEcosystem")}
            </h4>
            <nav className="grid grid-cols-1 gap-3">
              {[
                t("footer.kemenkoPerekonomian"),
                t("footer.tuvNord"),
                t("footer.presidentUniversity"),
                t("footer.aiChallengeHub"),
                t("footer.labMikrobiologi"),
              ].map((partner) => (
                <a
                  key={partner}
                  href="#"
                  className="text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-[#0055ff] dark:hover:text-[#00f2ff] transition-colors uppercase tracking-widest flex items-center gap-2 group"
                >
                  <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-[#0055ff] dark:group-hover:bg-[#00f2ff] transition-colors" />
                  {partner}
                </a>
              ))}
            </nav>
          </div>

          {/* ── Column 4: Stay Connected ────────────────────────── */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
              {t("footer.stayConnected")}
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-wide">
                <MapPin
                  className="w-4 h-4 text-[#0055ff] dark:text-[#00f2ff] flex-shrink-0"
                  aria-hidden="true"
                />
                <span>{t("footer.address")}</span>
              </li>
              <li className="flex gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                <Phone
                  className="w-4 h-4 text-[#0055ff] dark:text-[#00f2ff] flex-shrink-0"
                  aria-hidden="true"
                />
                <span>0813-948-290</span>
              </li>
              <li className="flex gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                <Mail
                  className="w-4 h-4 text-[#0055ff] dark:text-[#00f2ff] flex-shrink-0"
                  aria-hidden="true"
                />
                <span>support@colonyai.id</span>
              </li>
              <li className="flex gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                <Globe
                  className="w-4 h-4 text-[#0055ff] dark:text-[#00f2ff] flex-shrink-0"
                  aria-hidden="true"
                />
                <span>www.colonyai.id</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Row ────────────────────────────────────────── */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
            {t("footer.footerCopyright")}
          </p>
          <nav className="flex gap-8 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <Link
              href="/privacy"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t("footer.privacyPolicyFull")}
            </Link>
            <span className="text-slate-200 dark:text-slate-800" aria-hidden="true">
              |
            </span>
            <Link
              href="/terms"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t("footer.termsAndConditions")}
            </Link>
          </nav>
        </div>
      </div>

      {/* ── Floating Widgets ────────────────────── */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-4 z-[200]">
        <button
          onClick={() => setIsChatOpen(true)}
          className={`${PRIMARY_GRADIENT} w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 hover:rotate-6 transition-all group`}
          aria-label="Open AI Chatbot"
        >
          <svg
            className="w-7 h-7 group-hover:scale-110"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      </div>

      <AIChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </footer>
  );
}

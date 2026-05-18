"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  Search,
  Globe,
  ShieldCheck,
  ChevronDown,
  MessageCircle,
} from "lucide-react";

import { useAuthStore } from "@/lib/auth-store";
import { useTranslationStore } from "@/lib/i18n/store";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslationStore();
  const language = useTranslationStore((state) => state.language);
  const setLanguage = useTranslationStore((state) => state.setLanguage);

  const TOP_BAR_BG = "bg-[#1a237e]"; // Dark Siloam Blue
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { nameKey: "public.home", href: "/" },
    { nameKey: "public.layanan", href: "/layanan" },
    { nameKey: "public.teknologi", href: "/teknologi" },
    { nameKey: "public.targetPengguna", href: "/target-pengguna" },
    { nameKey: "public.tujuanManfaat", href: "/tujuan-manfaat" },
    { nameKey: "public.compliance", href: "/compliance" },
  ];

  return (
    <>
      {/* ── Top Bar ────────────────────────── */}
      <div
        className={`${TOP_BAR_BG} text-white text-[11px] py-2 px-6 hidden lg:block`}
      >
        <div className="max-w-[1500px] mx-auto flex justify-between items-center font-medium">
          <div className="flex items-center gap-6">
            <Link href="/target-pengguna" className="hover:text-white/80 transition-colors uppercase tracking-wider font-bold">Scientists & Researchers</Link>
            <Link href="/target-pengguna" className="hover:text-white/80 transition-colors uppercase tracking-wider font-bold">Corporate</Link>
            <Link href="/tujuan-manfaat" className="hover:text-white/80 transition-colors uppercase tracking-wider font-bold">Knowledge Base</Link>
          </div>

          <div className="flex items-center gap-6">
            <a href="tel:0813-948-290" className="flex items-center gap-2 hover:text-white/80 transition-colors cursor-pointer">
              <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                <Phone className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="uppercase tracking-wider font-bold">Contact Center: 0813-948-290</span>
            </a>
            <span className="text-white/30">|</span>
            <Link href={isAuthenticated ? "/dashboard" : "/login"} className="flex items-center gap-2 hover:text-white/80 transition-colors">
              <div className="w-4 h-4 bg-amber-50 rounded-full flex items-center justify-center">
                 <ArrowRight className="w-2.5 h-2.5 text-slate-900" />
              </div>
              <span className="uppercase tracking-wider font-bold">{isAuthenticated ? "Dashboard" : (language === "en" ? "Login/Register" : "Login/Daftar")}</span>
            </Link>
            <span className="text-white/30">|</span>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-white" />
              <button
                onClick={() => {
                  setLanguage("en");
                  document.documentElement.lang = "en";
                  document.cookie = "lang=en;path=/;max-age=31536000";
                }}
                className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                  language === "en" ? "text-white font-black" : "text-white/40 hover:text-white font-medium"
                }`}
              >
                EN
              </button>
              <span className="text-white/20">|</span>
              <button
                onClick={() => {
                  setLanguage("id");
                  document.documentElement.lang = "id";
                  document.cookie = "lang=id;path=/;max-age=31536000";
                }}
                className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                  language === "id" ? "text-white font-black" : "text-white/40 hover:text-white font-medium"
                }`}
              >
                ID
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Primary Navigation ─────────────────────────────────────────── */}
      <nav
        className={`sticky top-0 w-full z-[100] transition-all duration-300 ${
          scrolled ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-lg py-2" : "bg-white dark:bg-slate-950 py-4"
        } border-b border-slate-100 dark:border-slate-900`}
      >
        <div className="max-w-[1500px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center group shrink-0">
            <div className="flex items-center">
              <Image
                src="/android-chrome-512x512.png"
                alt="ColonyAI Logo"
                width={40}
                height={40}
                className="h-8 w-auto object-contain"
              />
              <div className="ml-2 flex flex-col leading-none">
                <span className="text-[14px] font-black uppercase tracking-widest text-[#0055ff] dark:text-[#00f2ff]">
                  COLONYAI LAB
                </span>
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.nameKey}
                href={item.href}
                className="text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:text-[#1a237e] dark:hover:text-[#00f2ff] transition-all flex items-center gap-1 group"
              >
                {t(item.nameKey)}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
             <div className="relative group cursor-pointer" data-trigger-search>
                <input 
                  type="text" 
                  readOnly
                  placeholder={language === "en" ? "Search ColonyAI (Press /)" : "Cari ColonyAI (Tekan /)"}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none px-4 py-2 text-xs w-64 outline-none dark:text-white transition-all pr-10 cursor-pointer"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
             </div>
             <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700" />
             <ThemeToggle />
          </div>

          <button
            className="lg:hidden p-2 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* ── Mobile Interface (Unchanged for now, focusing on desktop first) ── */}
      <div
        className={`fixed inset-0 z-[200] transition-all duration-500 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          onClick={() => setMobileMenuOpen(false)}
        />

        <div
          className={`absolute bottom-0 left-0 right-0 h-[80vh] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col rounded-t-[2rem] overflow-hidden ${
            mobileMenuOpen ? "translate-y-0" : "translate-y-[120%]"
          }`}
        >
          <div className="w-full flex justify-center pt-6 pb-2">
            <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
          </div>

          <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
             <span className="text-xl font-black tracking-tighter text-[#1a237e]">
                COLONY<span className="text-amber-500">AI</span>
              </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-50 rounded-full"
            >
              <X className="w-5 h-5 text-slate-900" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
             {navItems.map((item) => (
                <Link key={item.nameKey} href={item.href} className="block py-3 border-b border-slate-50 text-sm font-bold text-slate-700">
                  {t(item.nameKey)}
                </Link>
             ))}
          </div>
        </div>
      </div>
    </>
  );
}

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

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslationStore();

  const TOP_BAR_BG = "bg-[#1a237e]"; // Dark Siloam Blue
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Beranda", href: "/" },
    { name: "Layanan", href: "/layanan" },
    { name: "Teknologi", href: "/teknologi" },
    { name: "Target Pengguna", href: "/target-pengguna" },
    { name: "Tujuan & Manfaat", href: "/tujuan-manfaat" },
    { name: "Kepatuhan", href: "/compliance" },
  ];

  return (
    <>
      {/* ── Top Bar ────────────────────────── */}
      <div
        className={`${TOP_BAR_BG} text-white text-[11px] py-2 px-6 hidden lg:block`}
      >
        <div className="max-w-[1500px] mx-auto flex justify-between items-center font-medium">
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-primary-light transition-colors">Scientists & Researchers</Link>
            <Link href="/" className="hover:text-primary-light transition-colors">Corporate</Link>
            <Link href="/" className="hover:text-primary-light transition-colors">Knowledge Base</Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 hover:text-white/80 transition-colors cursor-pointer">
              <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                <Phone className="w-2.5 h-2.5 text-white" />
              </div>
              <span>Contact Center: 0813-948-290</span>
            </div>
            <span className="text-white/30">|</span>
            <Link href={isAuthenticated ? "/dashboard" : "/login"} className="flex items-center gap-2 hover:text-white/80 transition-colors">
              <div className="w-4 h-4 bg-amber-50 rounded-full flex items-center justify-center">
                 <ArrowRight className="w-2.5 h-2.5 text-slate-900" />
              </div>
              <span>{isAuthenticated ? "Dashboard" : "Login/Register"}</span>
            </Link>
            <div className="flex items-center gap-1 cursor-pointer group">
               <Globe className="w-3.5 h-3.5 text-white" />
               <span>EN</span>
               <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Primary Navigation ─────────────────────────────────────────── */}
      <nav
        className={`sticky top-0 w-full z-[100] transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-lg py-2" : "bg-white py-4"
        } border-b border-slate-100`}
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
                <span className="text-[14px] font-black uppercase tracking-widest text-[#0055ff]">
                  COLONYAI LAB
                </span>
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[13px] font-medium text-slate-600 hover:text-[#1a237e] transition-all flex items-center gap-1 group"
              >
                {item.name}
                {item.hasSub && <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center">
             <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Search ColonyAI"
                  className="bg-slate-50 border border-slate-200 rounded-none px-4 py-2 text-xs w-64 outline-none focus:border-emerald-500 transition-all pr-10"
                />
                <Search className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
             </div>
          </div>

          <button
            className="lg:hidden p-2 text-slate-900 hover:bg-slate-50 transition-all"
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
               <Link key={item.name} href={item.href} className="block py-3 border-b border-slate-50 text-sm font-bold text-slate-700">
                 {item.name}
               </Link>
             ))}
          </div>
        </div>
      </div>
    </>
  );
}

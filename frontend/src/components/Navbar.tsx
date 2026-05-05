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
} from "lucide-react";

import { useAuthStore } from "@/lib/auth-store";
import { useTranslationStore } from "@/lib/i18n/store";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslationStore();

  const TOP_BAR_BG = "bg-gradient-to-r from-[#0055ff] to-[#00f2ff]";
  const PRIMARY_GRADIENT =
    "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: t("public.home"), href: "/" },
    { name: t("public.challenge"), href: "/challenge" },
    { name: t("public.tujuanManfaat"), href: "/tujuan-manfaat" },
    { name: t("public.targetPengguna"), href: "/target-pengguna" },
    { name: t("public.teknologi"), href: "/teknologi" },
    { name: t("public.compliance"), href: "/compliance" },
  ];

  return (
    <>
      {/* ── Top Bar ────────────────────────── */}
      <div
        className={`${TOP_BAR_BG} text-white text-[11px] py-2.5 px-6 hidden lg:block`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center font-bold tracking-wide">
          <div className="flex items-center gap-2">
            <Sparkles
              className="w-3.5 h-3.5 text-[#00f2ff]"
              aria-hidden="true"
            />
            <span className="uppercase tracking-[0.2em]">
              Official Case Study | AI Open Innovation Challenge 2026
            </span>
          </div>

          {/* ── Center Search ────────────────── */}
          <div className="flex-1 max-w-sm mx-10">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/50 group-focus-within:text-[#00f2ff] transition-colors" />
              <input
                type="text"
                placeholder="Cari sumber daya institusi..."
                className="w-full bg-white/10 border border-white/20 rounded-full py-1.5 pl-9 pr-4 text-[9px] text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 focus:border-[#00f2ff] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone
                  className="w-3.5 h-3.5 text-[#00f2ff]"
                  aria-hidden="true"
                />
                <span>150881</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail
                  className="w-3.5 h-3.5 text-[#00f2ff]"
                  aria-hidden="true"
                />
                <span>committee-ai-open@president.ac.id</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav
        className={`sticky top-0 w-full z-[100] transition-all duration-300 ${
          scrolled ? "bg-white shadow-md py-2" : "bg-white py-5"
        } border-b border-slate-100`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center"
            aria-label="ColonyAI Home"
          >
            <Image
              src="/android-chrome-512x512.png"
              alt="ColonyAI Logo"
              width={56}
              height={56}
              className="h-10 lg:h-12 w-auto object-contain"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-700 hover:text-[#0055ff] transition-all"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className={`hidden lg:flex items-center gap-2 ${PRIMARY_GRADIENT} text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-all group`}
            >
              {isAuthenticated ? "Dashboard" : "Login"}
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-1 transition-all"
                aria-hidden="true"
              />
            </Link>
          </div>

          <button
            className="lg:hidden text-slate-900"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      <div
        className={`fixed inset-0 z-[200] transition-all duration-500 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        <div
          className={`absolute top-0 right-0 h-full w-[80%] max-w-[320px] bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2">
              <Image
                src="/android-chrome-512x512.png"
                className="h-8 w-auto"
                alt="Logo"
                width={32}
                height={32}
              />
              <span className="text-[10px] font-black text-[#0055ff] uppercase tracking-widest">
                ColonyAI
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              aria-label="Close Mobile Menu"
            >
              <X className="w-6 h-6 text-slate-900" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-4 rounded-xl text-sm font-black text-slate-700 uppercase tracking-widest hover:bg-slate-50 hover:text-[#0055ff] transition-all flex items-center justify-between group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                  <ArrowRight
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className={`w-full ${PRIMARY_GRADIENT} text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center shadow-lg`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {isAuthenticated ? "Dashboard" : "Login"}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

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
  CheckCircle2
} from "lucide-react";
import { Footer } from "@/components/Footer";

const TOP_BAR_BG = "bg-gradient-to-r from-[#0055ff] to-[#00f2ff]";
const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";

export default function PrivacyPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#00f2ff] selection:text-slate-900">
      
      {/* ── Top Bar ────────────────────────── */}
      <div className={`${TOP_BAR_BG} text-white text-[11px] py-2.5 px-6 hidden lg:block`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center font-bold tracking-wide">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00f2ff]" />
            <span className="uppercase tracking-[0.2em]">Official Case Study | AI Open Innovation Challenge 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#00f2ff]" />
              <span>150881</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#00f2ff]" />
              <span>committee-ai-open@president.ac.id</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav 
        className={`sticky top-0 w-full z-[100] transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-md shadow-md py-2" : "bg-white py-5"
        } border-b border-slate-100`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="flex items-center gap-3">
              <img src="/android-chrome-512x512.png" alt="Logo" className="h-10 lg:h-12 w-auto" />
              <div className="h-8 w-[1px] bg-slate-200" />
              <div className="flex flex-col">
                <span className={`text-[12px] font-black uppercase tracking-widest text-[#0055ff] leading-none`}>ColonyAI Lab</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Privacy Center</span>
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {[
              { name: "Home", href: "/" },
              { name: "The Challenge", href: "/profil" },
              { name: "Tujuan & Manfaat", href: "/tujuan-manfaat" },
              { name: "Target Pengguna", href: "/target-pengguna" },
              { name: "Teknologi", href: "/teknologi" },
              { name: "Compliance", href: "/compliance" }
            ].map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className="text-[10px] font-bold uppercase tracking-widest text-slate-700 hover:text-[#0055ff] transition-all"
              >
                {item.name}
              </Link>
            ))}
            <Link 
              href="/login" 
              className={`text-[10px] font-black uppercase tracking-[0.2em] ${PRIMARY_GRADIENT} text-white px-8 py-3 rounded-xl hover:scale-105 transition-all shadow-lg`}
            >
              Login
            </Link>
          </div>

          <button className="lg:hidden text-slate-900" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* ── Page Header ── */}
      <section className="py-20 bg-slate-50 border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-6">
           <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
             <Lock className="w-4 h-4 text-[#0055ff]" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Security Commitment</span>
           </div>
           <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 uppercase">
             Kebijakan <span className="text-[#0055ff]">Privasi</span>
           </h1>
           <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">
             Terakhir Diperbarui: 02 Mei 2026
           </p>
        </div>
      </section>

      {/* ── Content Section ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-white border border-slate-100 rounded-3xl p-8 lg:p-16 shadow-2xl space-y-12">
          
          <div className="space-y-6">
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tight border-l-4 border-[#0055ff] pl-6">
              1. Komitmen Keamanan Data
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm font-medium">
              ColonyAI berkomitmen penuh untuk melindungi privasi setiap pengguna dan organisasi yang menggunakan platform kami. Sebagai sistem manajemen laboratorium berbasis AI, kami memahami kritikalitas data mikrobiologi Anda. Seluruh data hasil analisis dienkripsi menggunakan standar industri **AES-256**.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tight border-l-4 border-[#0055ff] pl-6">
              2. Data yang Kami Kumpulkan
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Identitas Pengguna", desc: "Nama, peran (role), dan kredensial akses terenkripsi." },
                { title: "Data Analisis", desc: "Gambar petri dish dan hasil deteksi koloni yang diupload." },
                { title: "Log Kepatuhan", desc: "Data monitoring penggunaan APD analis laboratorium." },
                { title: "Audit Trail", desc: "Timestamp dan catatan aktivitas sistem untuk ISO-17025." }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-[#0055ff] shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 font-bold">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tight border-l-4 border-[#0055ff] pl-6">
              3. Penggunaan Informasi
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm font-medium">
              Informasi yang dikumpulkan digunakan semata-mata untuk:
            </p>
            <ul className="space-y-4">
              {[
                "Memproses analisis mikrobiologi secara otomatis.",
                "Menyediakan laporan kepatuhan APD real-time.",
                "Memfasilitasi audit trail sesuai standar TUV NORD Indonesia.",
                "Meningkatkan akurasi model AI melalui proses training internal yang aman."
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0055ff]" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 lg:p-10 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <h3 className="text-white text-lg lg:text-xl font-bold uppercase tracking-tight relative z-10">
              Ada pertanyaan mengenai privasi?
            </h3>
            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
              Tim Kepatuhan kami siap membantu Anda 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link 
                href="mailto:committee-ai-open@president.ac.id" 
                className={`${PRIMARY_GRADIENT} text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3`}
              >
                <Mail className="w-4 h-4" /> Start a Call / Email
              </Link>
            </div>
          </div>

        </div>
      </section>

      <Footer />

      {/* ── Mobile Menu Overlay ── */}
      <div 
        className={`fixed inset-0 z-[200] transition-all duration-500 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
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
              <img src="/android-chrome-512x512.png" className="h-8 w-auto" alt="Logo" />
              <span className="text-[10px] font-black text-[#0055ff] uppercase tracking-widest">ColonyAI</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-900" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "The Challenge", href: "/profil" },
                { name: "Tujuan & Manfaat", href: "/tujuan-manfaat" },
                { name: "Target Pengguna", href: "/target-pengguna" },
                { name: "Teknologi", href: "/teknologi" },
                { name: "Compliance", href: "/compliance" }
              ].map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className="px-4 py-4 rounded-xl text-sm font-black text-slate-700 uppercase tracking-widest hover:bg-slate-50 hover:text-[#0055ff] transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <Link 
              href="/login" 
              className={`w-full ${PRIMARY_GRADIENT} text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center shadow-lg`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

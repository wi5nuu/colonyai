"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Award,
  Globe,
  Github,
  Menu,
  ShieldCheck,
  Target,
  Zap,
  Activity,
  X,
  Sparkles
} from "lucide-react";
import { Footer } from "@/components/Footer";

const TOP_BAR_BG = "bg-gradient-to-r from-[#0055ff] to-[#00f2ff]";
const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";
const ACCENT_BLUE = "text-[#0055ff]";

export default function ProfilPage() {
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
          scrolled ? "bg-white shadow-md py-2" : "bg-white py-5"
        } border-b border-slate-100`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="flex items-center gap-3">
              <img src="/android-chrome-512x512.png" alt="Logo" className="h-10 lg:h-12 w-auto" />
              <div className="h-8 w-[1px] bg-slate-200" />
              <div className="flex flex-col">
                <span className={`text-[12px] font-black uppercase tracking-widest text-[#0055ff] leading-none`}>ColonyAI Lab</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">The Challenge</span>
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

      {/* ── Hero Section ── */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <div className={`absolute top-0 right-0 w-[50%] h-full ${PRIMARY_GRADIENT} opacity-10 blur-[120px]`} />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
              <div className={`w-1.5 h-1.5 rounded-full ${PRIMARY_GRADIENT}`} />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/70">Healthcare Case 1 Brief</span>
            </div>
            
            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
              Decoding the Microbiology Challenge
            </h1>
            
            <p className="text-base lg:text-lg text-white/50 font-medium leading-relaxed max-w-2xl border-l-2 border-[#0055ff] pl-6 italic">
              Membangun solusi otomasi untuk <strong>TUV NORD Indonesia</strong> guna menghilangkan subjektivitas manusia dalam penghitungan koloni bakteri melalui visi komputer.
            </p>
          </div>
        </div>
      </section>

      {/* ── Case Dossier Content ── */}
      <section className="py-24 px-6 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* ── Left: Problem Statement ── */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl p-8 lg:p-12 shadow-2xl border border-slate-100 space-y-10">
                <div className="space-y-4">
                  <h2 className="text-xl lg:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
                    Statement Permasalahan
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    Dalam pengujian mikrobiologi konvensional, penghitungan koloni sangat bergantung pada pengamatan visual analis. Hal ini menyebabkan risiko subjektivitas tinggi, kelelahan mata, dan potensi kesalahan pencatatan data yang kritikal bagi standar <strong>ISO-17025</strong>.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { title: "Human Error", desc: "Variasi hasil antar analis mencapai 15-20%." },
                    { title: "In-efficiency", desc: "Proses manual memakan waktu 5-10 menit per cawan." },
                    { title: "Compliance Gap", desc: "Kesulitan dalam pelacakan audit trail yang real-time." },
                    { title: "Risk Hazard", desc: "Paparan agen biologis selama proses pengamatan manual." }
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-slate-50 rounded-xl border border-slate-100 group hover:border-[#00f2ff] transition-all">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full ${PRIMARY_GRADIENT}`} />
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-bold">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h3 className="text-lg lg:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff] mb-6">
                    Target Inovasi ColonyAI
                  </h3>
                  <div className="space-y-4">
                    {[
                      "Implementasi Deep Learning YOLOv8 untuk deteksi 5 kelas mikrobiologi.",
                      "Sistem Zero-Trust untuk integritas data hasil uji lab.",
                      "Monitoring APD berbasis visi komputer untuk keselamatan analis.",
                      "Laporan otomatis yang tervalidasi secara digital."
                    ].map((t, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:shadow-lg transition-all">
                        <CheckCircle2 className="text-[#00f2ff] w-4 h-4 flex-shrink-0" />
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Case Meta Data ── */}
            <div className="space-y-8">
              <div className={`rounded-xl p-8 text-white ${PRIMARY_GRADIENT} shadow-2xl relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -mr-16 -mt-16" />
                <h3 className="text-lg font-black uppercase tracking-widest mb-6 border-b border-white/20 pb-2">Case Summary</h3>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-white/60 uppercase">Category</p>
                    <p className="text-sm font-black uppercase tracking-widest">Healthcare Case 1</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-white/60 uppercase">Case Provider</p>
                    <p className="text-sm font-black uppercase tracking-widest">TUV NORD Indonesia</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-white/60 uppercase">Submission Year</p>
                    <p className="text-sm font-black uppercase tracking-widest">2026</p>
                  </div>
                  <div className="pt-4">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-xl border border-white/20">
                      <p className="text-[10px] font-bold leading-relaxed uppercase tracking-widest">
                        ColonyAI menghadirkan revolusi digital untuk laboratorium masa depan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-xl space-y-6 text-center">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Strategic Partners</h4>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col items-center gap-2 p-4 border border-slate-100 rounded-xl">
                    <img src="https://w7.pngwing.com/pngs/771/817/png-transparent-logo-quality-management-tuv-nord-technischer-uberwachungsverein-iso-9001-blue-text-logo.png" className="h-8 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" alt="TUV" />
                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-300">Main Case Provider</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 border border-slate-100 rounded-xl">
                    <div className="text-lg font-black italic text-slate-300 tracking-tighter">PRESUNIV</div>
                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-300">Academic Organizer</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <Footer />

      {/* ── Mobile Menu Overlay ── */}
      <div 
        className={`fixed inset-0 z-[200] transition-all duration-500 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Sidebar Container */}
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
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-slate-900" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col space-y-2">
              {[
                { name: "The Challenge", href: "/profil" },
                { name: "Tujuan & Manfaat", href: "/tujuan-manfaat" },
                { name: "Target Pengguna", href: "/target-pengguna" },
                { name: "Teknologi", href: "/teknologi" },
                { name: "Compliance", href: "/compliance" }
              ].map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className="px-4 py-4 rounded-xl text-sm font-black text-slate-700 uppercase tracking-widest hover:bg-slate-50 hover:text-[#0055ff] transition-all flex items-center justify-between group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
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

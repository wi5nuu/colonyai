"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Award,
  CheckCircle2,
  Lock,
  FileText,
  Activity,
  Zap,
  Building2,
  Menu,
  Globe,
  X,
  Sparkles
} from "lucide-react";
import { Footer } from "@/components/Footer";

const TOP_BAR_BG = "bg-gradient-to-r from-[#0055ff] to-[#00f2ff]";
const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";

export default function CompliancePage() {
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance</span>
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

      {/* ── Formal Page Header ── */}
      <section className="py-24 bg-slate-50 relative overflow-hidden border-b border-slate-100">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white border-l border-slate-100 -z-0" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-[#0055ff]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Security & Integrity</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
              Institutional Audit Proof
            </h1>
            <p className="text-base lg:text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
              ColonyAI menjamin setiap byte data analisis terlindungi dan tervalidasi sesuai dengan regulasi laboratorium internasional dan standar industri **TUV NORD Indonesia**.
            </p>
          </div>
          <div className="flex justify-center">
             <div className="relative group">
                <div className={`absolute -inset-6 ${PRIMARY_GRADIENT} opacity-10 blur-3xl group-hover:opacity-20 transition-all`} />
                <div className="bg-white border-4 border-slate-50 p-6 lg:p-10 rounded-xl shadow-2xl relative z-10 flex flex-col items-center text-center space-y-6">
                   <div className="w-full flex justify-center">
                      <img 
                        src="https://th.bing.com/th/id/OIP.2Pn5RarX6_fIH7LxThLzqwHaD4?w=304&h=180&c=7&r=0&o=5&pid=1.7" 
                        alt="ISO Certification" 
                        className="h-16 lg:h-24 w-auto object-contain"
                      />
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">ISO-17025</h4>
                      <p className="text-[10px] font-black text-[#0055ff] uppercase tracking-[0.2em]">Quality Assurance Verified</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── Compliance Pillars ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Data Immutability",
                desc: "Hasil analisis dikunci secara digital segera setelah divalidasi, mencegah manipulasi data manual.",
                icon: <Lock className="w-6 h-6" />,
                label: "Audit Trail"
              },
              {
                title: "Validation Logs",
                desc: "Setiap langkah pemrosesan AI dicatat dalam log sistem yang mendalam untuk keperluan audit forensik.",
                icon: <FileText className="w-6 h-6" />,
                label: "Transparency"
              },
              {
                title: "Regulatory Sync",
                desc: "Algoritma kami selalu diperbarui sesuai dengan standar regulasi mikrobiologi terbaru dari BPOM & TUV.",
                icon: <Zap className="w-6 h-6" />,
                label: "Up-to-date"
              }
            ].map((p, i) => (
              <div key={i} className="bg-slate-50 p-10 rounded-xl border border-slate-100 shadow-xl hover:shadow-2xl transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 mb-8 group-hover:bg-[#0055ff] group-hover:text-white transition-all`}>
                  {p.icon}
                </div>
                <h4 className="text-[9px] font-black text-[#0055ff] uppercase tracking-[0.3em] mb-2">{p.label}</h4>
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-4">{p.title}</h3>
                <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wide">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Institutional Partners ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
             <div className="bg-slate-900 rounded-xl p-8 lg:p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="relative z-10 space-y-8 text-center">
                   <h3 className="text-xl font-bold text-white uppercase tracking-tight">Verified by Industry Leaders</h3>
                   <div className="grid grid-cols-1 gap-6">
                      <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col items-center gap-4 transition-all hover:bg-white/10">
                         <img 
                            src="https://th.bing.com/th/id/OIP.bFXKGOriWS0ET5cz_hghRgHaDe?w=319&h=180&c=7&r=0&o=5&pid=1.7" 
                            className="h-10 lg:h-14 w-auto object-contain" 
                            alt="TUV NORD" 
                         />
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">TUV NORD Indonesia</span>
                            <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Case Provider</span>
                         </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col items-center gap-4 transition-all hover:bg-white/10">
                         <img 
                            src="https://th.bing.com/th/id/OIP.QFb4rSX2W64YGmdQE5vTaQHaIB?w=170&h=185&c=7&r=0&o=5&pid=1.7" 
                            className="h-14 lg:h-20 w-auto object-contain" 
                            alt="President University" 
                         />
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">President University</span>
                            <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Organizer</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
          <div className="space-y-8">
             <h2 className="text-3xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
                Security Framework
             </h2>
             <div className="space-y-4">
                {[
                  "Enkripsi data end-to-end (AES-256).",
                  "Otentikasi multi-faktor untuk peran administratif.",
                  "Backup harian dengan redundansi geografis.",
                  "Sertifikat keamanan SSL Grade A+."
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:border-[#00f2ff] transition-all bg-white shadow-sm">
                     <CheckCircle2 className="w-5 h-5 text-[#00f2ff]" />
                     <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{item}</span>
                  </div>
                ))}
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

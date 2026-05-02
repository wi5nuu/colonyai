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
  X
} from "lucide-react";
import { Footer } from "@/components/Footer";

const TOP_BAR_BG = "bg-gradient-to-r from-[#0055ff] to-[#00f2ff]";
const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";

export default function TargetPenggunaPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#00f2ff] selection:text-slate-900">
      
      {/* ── Top Bar ────────────────────────── */}
      <div className={`${TOP_BAR_BG} text-white text-[11px] py-2.5 px-6 hidden lg:block`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center font-bold tracking-wide">
          <div className="flex items-center gap-4">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest">Ecosystem Map</span>
            <span className="opacity-80">AI Open Innovation Challenge 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              <span>150881</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Pengguna</span>
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-[#0055ff] transition-all">Home</Link>
            <Link href="/profil" className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-[#0055ff] transition-all">The Challenge</Link>
            <Link href="/tujuan-manfaat" className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-[#0055ff] transition-all">Tujuan & Manfaat</Link>
            <Link href="/target-pengguna" className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-[#0055ff] transition-all">Target Pengguna</Link>
            <Link href="/teknologi" className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-[#0055ff] transition-all">Teknologi</Link>
            <Link href="/compliance" className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-[#0055ff] transition-all">Compliance</Link>
            <Link 
              href="/login" 
              className="text-[10px] font-black uppercase tracking-[0.2em] bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-[#0055ff] transition-all shadow-lg"
            >
              Dashboard
            </Link>
          </div>

          <button className="lg:hidden text-slate-900" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* ── Futuristic Header ── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent opacity-20" />
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
              User Personas
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
              Empowering the <br />
              Lab Ecosystem
            </h1>
            <p className="text-base lg:text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
              ColonyAI dirancang untuk mendukung berbagai peran kritikal dalam operasional laboratorium mikrobiologi modern, dari analis teknis hingga pembuat kebijakan strategis.
            </p>
          </div>
          <div className="relative group">
            <div className={`absolute -inset-4 ${PRIMARY_GRADIENT} opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-all`} />
            <div className="bg-white rounded-xl p-8 shadow-2xl border border-slate-100 relative z-10 grid grid-cols-2 gap-4">
              {[
                { label: "High Precision", val: "99.2%" },
                { label: "Time Saved", val: "85%" },
                { label: "Data Uptime", val: "100%" },
                { label: "Compliance", val: "ISO" }
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Personas Section ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 uppercase tracking-tight">Siapa yang kami bantu?</h2>
            <div className={`h-1 w-16 mx-auto ${PRIMARY_GRADIENT} rounded-full`} />
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                role: "Microbiology Analyst",
                title: "Efisiensi Teknis",
                desc: "Analis di lapangan yang membutuhkan alat bantu cepat untuk menghitung koloni secara akurat tanpa kelelahan visual.",
                icon: <FlaskConical className="w-6 h-6" />,
                accent: "border-[#00f2ff]"
              },
              {
                role: "Laboratory Manager",
                title: "Kendali Operasional",
                desc: "Manajer yang memerlukan visibilitas total terhadap throughput lab dan kepatuhan APD tim secara real-time.",
                icon: <LayoutDashboard className="w-6 h-6" />,
                accent: "border-[#0055ff]"
              },
              {
                role: "Quality Auditor",
                title: "Integritas Kepatuhan",
                desc: "Auditor internal/eksternal yang membutuhkan audit trail digital yang valid sesuai standar ISO-17025.",
                icon: <ShieldCheck className="w-6 h-6" />,
                accent: "border-[#ff00ff]"
              }
            ].map((persona, i) => (
              <div key={i} className={`bg-white rounded-xl p-10 border-b-4 ${persona.accent} shadow-xl hover:-translate-y-2 transition-all duration-500 group h-full flex flex-col`}>
                <div className={`w-12 h-12 rounded-xl ${PRIMARY_GRADIENT} flex items-center justify-center text-white mb-8 shadow-xl transition-transform`}>
                  {persona.icon}
                </div>
                <div className="space-y-4 flex-1">
                  <h4 className="text-[10px] font-black text-[#0055ff] uppercase tracking-[0.3em]">{persona.role}</h4>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight uppercase tracking-tight">{persona.title}</h3>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wide">{persona.desc}</p>
                </div>
                <div className="pt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-300">
                   <Activity className="w-4 h-4 text-[#00f2ff]" />
                   Target Segment
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-xl p-10 lg:p-16 text-center space-y-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
             <div className="relative z-10 space-y-6">
                <h2 className="text-2xl lg:text-4xl font-bold text-white uppercase tracking-tight">Ready to join the Lab 4.0?</h2>
                <p className="text-white/40 text-sm lg:text-base max-w-2xl mx-auto font-medium">
                  ColonyAI bukan sekadar alat, tapi mitra strategis bagi seluruh tim laboratorium mikrobiologi Anda.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                   <Link href="/login" className={`w-full sm:w-auto ${PRIMARY_GRADIENT} text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all`}>
                      Mulai Sekarang
                   </Link>
                   <Link href="/profil" className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                      Pelajari Case Study
                   </Link>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <Footer />

      {/* ── Mobile Menu Overlay ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-900 p-6 flex flex-col space-y-10 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <img src="/android-chrome-512x512.png" className="h-10 w-auto" alt="Logo" />
            <button onClick={() => setMobileMenuOpen(false)}>
              <X className="w-8 h-8 text-white" />
            </button>
          </div>
          <div className="flex flex-col space-y-6 text-center">
            {[
              { name: "Home", href: "/" },
              { name: "The Challenge", href: "/profil" },
              { name: "Tujuan", href: "/tujuan-manfaat" },
              { name: "Teknologi", href: "/teknologi" },
              { name: "Compliance", href: "/compliance" }
            ].map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className="text-xl font-black text-white uppercase tracking-widest hover:text-[#00f2ff]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

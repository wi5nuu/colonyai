"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Clock,
  Menu,
  X
} from "lucide-react";
import { Footer } from "@/components/Footer";

const TOP_BAR_BG = "bg-gradient-to-r from-[#0055ff] to-[#00f2ff]";
const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";

export default function TujuanManfaatPage() {
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
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest">Impact Analysis</span>
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tujuan & Manfaat</span>
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
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
            Strategic Objectives
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
            Membangun Standar Baru <br /> Akurasi Laboratorium
          </h1>
          <p className="text-base lg:text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
            ColonyAI hadir untuk mentransformasi data mikrobiologi mentah menjadi wawasan strategis yang tervalidasi dan aman secara operasional.
          </p>
        </div>
      </section>

      {/* ── Goals Grid ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Tujuan Strategis",
              items: [
                "Otomatisasi 100% proses penghitungan koloni.",
                "Implementasi audit trail digital permanen.",
                "Reduksi subjektivitas analis hingga 0%.",
                "Integrasi monitoring APD real-time."
              ],
              icon: <Target className="w-6 h-6" />,
              color: "from-[#0055ff] to-[#00f2ff]"
            },
            {
              title: "Manfaat Analis",
              items: [
                "Menghilangkan kelelahan visual (eye-strain).",
                "Fokus pada analisis data strategis.",
                "Lingkungan kerja lebih aman (PPE Aware).",
                "Proses verifikasi hasil lebih cepat."
              ],
              icon: <Clock className="w-6 h-6" />,
              color: "from-[#00f2ff] to-[#0055ff]"
            },
            {
              title: "Manfaat Institusi",
              items: [
                "Kepatuhan ISO-17025 yang terjamin.",
                "Throughput lab meningkat 3x lipat.",
                "Efisiensi biaya operasional jangka panjang.",
                "Reputasi data yang tervalidasi AI."
              ],
              icon: <BarChart3 className="w-6 h-6" />,
              color: "from-[#ff00ff] to-[#0055ff]"
            }
          ].map((goal, i) => (
            <div key={i} className="bg-white rounded-xl p-8 border border-slate-100 shadow-xl hover:shadow-2xl transition-all group">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${goal.color} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                {goal.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-6">{goal.title}</h3>
              <div className="space-y-4">
                {goal.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 group/item">
                    <CheckCircle2 className="w-4 h-4 text-[#00f2ff] mt-0.5 flex-shrink-0" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide group-hover/item:text-slate-900 transition-colors">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Innovation Callout ── */}
      <section className="py-24 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
              Value Innovation
            </h2>
            <p className="text-sm lg:text-base text-white/50 font-medium leading-relaxed uppercase tracking-widest">
              Kami tidak hanya menghitung koloni, kami menciptakan ekosistem laboratorium yang aman, cerdas, dan patuh.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Processing Speed</p>
                <p className="text-2xl font-black text-[#00f2ff] tracking-tight">8.5x Faster</p>
              </div>
              <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Human Subectivity</p>
                <p className="text-2xl font-black text-[#ff00ff] tracking-tight">Near Zero</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className={`absolute -inset-10 ${PRIMARY_GRADIENT} opacity-10 blur-[100px]`} />
            <img 
              src="https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=800&auto=format&fit=crop" 
              alt="Lab Innovation" 
              className="rounded-xl shadow-2xl relative z-10 border border-white/10"
            />
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
              { name: "Target Pengguna", href: "/target-pengguna" },
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

function Target(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

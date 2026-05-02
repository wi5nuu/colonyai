"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  Globe,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
  Github,
  ShieldCheck,
  Activity,
  Award,
  Zap,
  Download,
  Sparkles
} from "lucide-react";
import { Footer } from "@/components/Footer";

const TOP_BAR_BG = "bg-gradient-to-r from-[#0055ff] to-[#00f2ff]";
const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";

function ServiceCard({ card, PRIMARY_GRADIENT }: { card: any, PRIMARY_GRADIENT: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="group h-[380px] lg:h-[450px] w-[280px] lg:w-full flex-shrink-0 [perspective:1000px]">
      <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isExpanded ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* ── FRONT SIDE ────────────────────────────────────────── */}
        <div className="absolute inset-0 [backface-visibility:hidden] flex flex-col rounded-xl overflow-hidden shadow-2xl bg-white border border-slate-100">
          <div className={`${PRIMARY_GRADIENT} p-4 space-y-1 flex-none`}>
            <h3 className="text-white text-base lg:text-lg font-black leading-tight tracking-tight">{card.title}</h3>
            <p className="text-white/80 text-[9px] lg:text-[10px] font-medium leading-relaxed uppercase tracking-wide">{card.desc}</p>
          </div>
          <div className="relative flex-1 overflow-hidden">
            <img src={card.img} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-all" />
            
            <div 
              className="absolute bottom-6 left-6 flex items-center gap-3 group/link cursor-pointer"
              onClick={() => setIsExpanded(true)}
            >
              <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-white group-hover:text-[#00f2ff] transition-all flex items-center gap-2">
                Pelajari Lebih Lanjut
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-all" />
              </span>
            </div>
          </div>
        </div>

        {/* ── BACK SIDE ─────────────────────── */}
        <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl overflow-hidden shadow-2xl ${PRIMARY_GRADIENT} p-6 lg:p-8 flex flex-col justify-between border-4 border-white/20`}>
          <div className="space-y-4 lg:space-y-6">
            <h3 className="text-white text-base lg:text-xl font-black leading-tight uppercase tracking-tight">{card.title}</h3>
            <div className="h-[1px] w-full bg-white/20" />
            <p className="text-white text-[11px] lg:text-[12px] font-bold leading-relaxed tracking-wide">
              {card.longDesc}
            </p>
          </div>
          
          <button 
            onClick={() => setIsExpanded(false)}
            className="w-full bg-white text-slate-900 py-3 lg:py-4 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-900 hover:text-white transition-all shadow-xl"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Kembali ke Ringkasan
          </button>
        </div>

      </div>
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = ["/sample_plate.png", "/sample_plate1.png"];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(slideInterval);
    };
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
                <span className="text-[12px] font-black uppercase tracking-widest text-[#0055ff] leading-none">ColonyAI Lab</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Healthcare Case 1</span>
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
 
      {/* ── Hero Section ────────────────────────────── */}
      <section className="relative h-[550px] lg:h-[650px] flex items-center overflow-visible">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {heroSlides.map((slide, index) => (
            <img 
              key={slide}
              src={slide} 
              alt={`Laboratory Slide ${index + 1}`} 
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-[2000ms] ease-in-out ${
                currentSlide === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-slate-900/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/20 to-transparent z-10" />
        </div>
 
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
            <h3 className={`text-2xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]`}>
              Selamat Datang
            </h3>
            <h1 className="text-3xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight uppercase">
              Microbiology <br />
              <span className="text-white">Automated Reader</span>
            </h1>
            <p className="text-sm lg:text-lg text-white/80 font-medium leading-relaxed max-w-2xl">
              Meningkatkan presisi laboratorium mikrobiologi dan kepatuhan APD melalui AI Vision. Solusi terintegrasi untuk tantangan industri di <strong>AI Open Innovation Challenge 2026</strong>.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                href="/profil" 
                className={`${PRIMARY_GRADIENT} text-white px-6 lg:px-8 py-3 rounded-xl text-[10px] lg:text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 transition-all shadow-2xl group`}
              >
                Mulai Analisis
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="https://github.com/wi5nuu/colonyai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 lg:px-8 py-3 rounded-xl text-[10px] lg:text-[12px] font-bold flex items-center gap-3 hover:bg-white hover:text-slate-900 transition-all group"
              >
                <Github className="w-5 h-5" />
                GitHub Repo
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4 lg:gap-6 pt-8 border-t border-white/10">
              <div className="flex flex-col gap-1 lg:gap-2">
                <span className="text-[8px] lg:text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Case Provider</span>
                <div className="bg-white/5 backdrop-blur-md px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl border border-white/10 flex items-center gap-2 lg:gap-3">
                   <img src="https://th.bing.com/th/id/OIP.bFXKGOriWS0ET5cz_hghRgHaDe?w=319&h=180&c=7&r=0&o=5&pid=1.7" alt="TUV NORD" className="h-4 lg:h-5 w-auto" />
                   <span className="text-[8px] lg:text-[9px] font-black text-white uppercase tracking-widest">TUV NORD Indonesia</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 lg:gap-2">
                <span className="text-[8px] lg:text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Organizer</span>
                <div className="bg-white/5 backdrop-blur-md px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl border border-white/10 flex items-center gap-2 lg:gap-3">
                   <img src="https://th.bing.com/th/id/OIP.QFb4rSX2W64YGmdQE5vTaQHaIB?w=170&h=185&c=7&r=0&o=5&pid=1.7" alt="PresUniv" className="h-5 lg:h-6 w-auto" />
                   <span className="text-[8px] lg:text-[9px] font-black text-white uppercase tracking-widest whitespace-nowrap">President University</span>
                </div>
              </div>
            </div>
          </div>
        </div>
 
        {/* ── Search Bar ────────────────────────────── */}
        <div className="absolute bottom-0 left-0 w-full translate-y-1/2 px-4 lg:px-6 z-20">
          <div className="max-w-4xl mx-auto p-[1px] lg:p-[2px] rounded-2xl lg:rounded-full bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff] shadow-2xl">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-xl lg:rounded-full p-1.5 lg:p-2.5">
              <div className="flex flex-row items-center gap-1.5 lg:gap-3 overflow-x-auto no-scrollbar">
                <div className="px-3 lg:px-6 py-1 lg:py-2 flex items-center justify-start border-r border-white/10 flex-shrink-0">
                  <span className="text-white text-[8px] lg:text-sm font-bold whitespace-nowrap uppercase tracking-widest opacity-80">Analisis</span>
                </div>
                <div className="flex-1 flex flex-row items-center gap-1.5 lg:gap-3 min-w-[300px] lg:min-w-0">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-lg lg:rounded-full px-3 lg:px-5 py-1.5 lg:py-2.5 overflow-hidden focus-within:border-[#00f2ff] transition-all">
                    <input 
                      type="text" 
                      placeholder="ID Project"
                      className="w-full bg-transparent text-[9px] lg:text-[11px] font-bold text-white placeholder:text-white/30 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-lg lg:rounded-full px-3 lg:px-5 py-1.5 lg:py-2.5 relative group overflow-hidden focus-within:border-[#00f2ff] transition-all">
                    <select className="w-full bg-transparent text-[9px] lg:text-[11px] font-bold text-white/80 appearance-none focus:outline-none cursor-pointer">
                      <option value="" className="bg-slate-900">Media Agar</option>
                      <option value="pca" className="bg-slate-900">PCA</option>
                      <option value="vrba" className="bg-slate-900">VRBA</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
                  </div>
                </div>
                <div className="lg:pr-3 flex-shrink-0">
                  <button className={`h-full ${PRIMARY_GRADIENT} text-white px-4 lg:px-10 py-1.5 lg:py-3 rounded-lg lg:rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-[0.1em] lg:tracking-[0.2em] hover:scale-105 transition-all shadow-xl`}>
                    Cek
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Case Summary Dossier ────────────────── */}
      <section className="pt-24 pb-8 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900 rounded-3xl p-8 lg:p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#0055ff] opacity-10 blur-[100px] rounded-full" />
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                  <Activity className="w-4 h-4 text-[#00f2ff]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Submission Dossier</span>
                </div>
                
                <h2 className="text-2xl lg:text-4xl font-bold text-white leading-tight tracking-tight uppercase">
                  Case <span className="text-[#0055ff]">Summary</span>
                </h2>
                
                <div className="space-y-6">
                   <p className="text-sm lg:text-lg text-white/60 font-medium leading-relaxed italic border-l-2 border-[#0055ff] pl-6">
                      "ColonyAI menghadirkan revolusi digital untuk laboratorium masa depan."
                   </p>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Category</span>
                        <p className="text-xs font-bold text-white uppercase">Healthcare Case 1</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Case Provider</span>
                        <p className="text-xs font-bold text-white uppercase">TUV NORD Indonesia</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Submission Year</span>
                        <p className="text-xs font-bold text-white uppercase tracking-widest">2026</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="hidden lg:block">
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { l: "Platform", v: "Next.js 14" },
                      { l: "Intelligence", v: "YOLOv8 Engine" },
                      { l: "Compliance", v: "ISO-17025" },
                      { l: "Security", v: "AES-256" }
                    ].map((item, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all">
                        <span className="text-[8px] font-black text-[#00f2ff] uppercase tracking-widest block mb-1">{item.l}</span>
                        <span className="text-xs font-bold text-white uppercase tracking-tight">{item.v}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Section ────────────────── */}
      <section className="py-24 lg:py-32 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto space-y-12 lg:space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-2xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
              Pusat Layanan Unggulan Analisis
            </h2>
            <p className="text-[10px] lg:text-base text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed uppercase tracking-wide">
              Solusi berbasis AI terintegrasi untuk meningkatkan standar operasional dan kepatuhan laboratorium mikrobiologi Anda.
            </p>
          </div>
 
          {/* ── Scrollable Cards on Mobile ── */}
          <div className="flex lg:grid lg:grid-cols-3 gap-6 lg:gap-8 overflow-x-auto lg:overflow-x-visible pb-8 lg:pb-0 snap-x snap-mandatory no-scrollbar scrollbar-hide">
            {[
              {
                title: "Neural Vision Plate Reader",
                desc: "Otomatisasi penghitungan koloni.",
                longDesc: "Sistem YOLOv8 yang dilatih khusus untuk mengenali 5 kelas objek mikrobiologi dengan akurasi >0.85 mAP.",
                img: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=800&auto=format&fit=crop"
              },
              {
                title: "PPE Compliance Monitoring",
                desc: "Sistem pengawasan APD berbasis AI.",
                longDesc: "Memantau penggunaan jas lab, sarung tangan, dan masker secara real-time untuk menjamin keselamatan analis.",
                img: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop"
              },
              {
                title: "AI Quality Analytics Hub",
                desc: "Dashboard analitik standar ISO-17025.",
                longDesc: "Mengintegrasikan data analisis ke dalam laporan digital instan dengan rekomendasi tindakan korektif otomatis.",
                img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop"
              }
            ].map((card, i) => (
              <div key={i} className="snap-center">
                <ServiceCard card={card} PRIMARY_GRADIENT={PRIMARY_GRADIENT} />
              </div>
            ))}
          </div>
        </div>
      </section>
 
      {/* ── About Section ───────────────────────── */}
      <section className="py-16 lg:py-24 bg-white px-6 border-y border-slate-100">
        <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12">
          <div className="flex flex-col items-center text-center space-y-3 lg:space-y-4">
            <h2 className="text-xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
              Mengenal ColonyAI Lab
            </h2>
            <div className={`h-1 w-16 lg:w-24 ${PRIMARY_GRADIENT} rounded-full`} />
            <p className="text-[9px] lg:text-sm text-slate-500 max-w-2xl font-medium leading-relaxed uppercase tracking-widest">
              Solusi otomasi laboratorium berbasis AI tercanggih yang dirancang khusus untuk tantangan Healthcare Case 1 di AI Open Innovation Challenge 2026.
            </p>
          </div>
 
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            {[
              { label: "Deteksi Koloni", val: "YOLOv8 Based" },
              { label: "Validasi Hasil", val: "ISO-17025" },
              { label: "Monitoring APD", val: "Real-time AI" },
              { label: "Audit Trail", val: "Digital Logs" }
            ].map((stat, i) => (
              <div key={i} className="bg-slate-50 p-3 lg:p-6 rounded-xl border border-slate-100 text-center space-y-1 hover:border-[#0055ff] transition-all group">
                <span className="text-[7px] lg:text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-[#0055ff] transition-colors">{stat.label}</span>
                <p className="text-[10px] lg:text-xl font-black text-slate-900">{stat.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Promo ────────────────────────── */}
      <section className="py-12 lg:py-12 bg-slate-900 px-6 overflow-hidden relative border-t border-white/5">
        <div className={`absolute top-0 right-0 w-[50%] h-full ${PRIMARY_GRADIENT} opacity-10 blur-[120px]`} />
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-16 items-center relative z-10">
          <div className="space-y-4 lg:space-y-6">
            <div className="inline-flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-1.5 lg:py-2 bg-white/5 border border-white/10 rounded-lg">
              <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-[#00f2ff] animate-pulse" />
              <span className="text-[7px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-[#00f2ff]">Official PWA Infrastructure</span>
            </div>
            <h2 className="text-xl lg:text-5xl font-bold text-white leading-tight tracking-tight uppercase">
              ColonyAI <span className="text-[#0055ff]">Mobile</span> <br />
              <span className="text-2xl lg:text-3xl font-medium text-white/60 lowercase italic tracking-normal">Institutional Access</span>
            </h2>
            <div className="hidden md:block space-y-4">
              <p className="text-white/50 text-sm font-medium leading-relaxed max-w-xl uppercase tracking-wider">
                Akses dashboard analitik dan monitoring laboratorium real-time langsung dari perangkat seluler Anda. 
                Teknologi Progressive Web App menjamin sinkronisasi data yang aman, cepat, dan terintegrasi penuh dengan standar ISO-17025.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-1 h-1 bg-[#00f2ff] rounded-full" />
                   <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Encrypted Sync</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1 h-1 bg-[#00f2ff] rounded-full" />
                   <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">ISO Compliant</span>
                </div>
              </div>
            </div>
            <button className={`${PRIMARY_GRADIENT} text-white px-5 lg:px-12 py-3 lg:py-4 rounded-lg text-[8px] lg:text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:brightness-110 transition-all flex items-center justify-center gap-3 lg:gap-5`}>
              Install Platform <Download className="w-3 h-3 lg:w-5 lg:h-5" />
            </button>
          </div>
          <div className="flex justify-center lg:justify-end">
             <div className="bg-white/5 p-4 lg:p-6 rounded-2xl border border-white/10 relative group">
                <img src="/android-chrome-512x512.png" alt="App Mockup" className="h-28 lg:h-56 w-auto drop-shadow-[0_20px_30px_rgba(0,85,255,0.3)] group-hover:scale-105 transition-transform duration-700" />
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

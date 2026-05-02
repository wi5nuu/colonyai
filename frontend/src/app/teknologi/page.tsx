"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  ChevronDown,
  ArrowRight,
  Zap,
  Cpu,
  Eye,
  Database,
  Code2,
  Terminal,
  Activity,
  Menu,
  ShieldCheck,
  Globe,
  X,
  Server,
  Layers,
  Lock,
  Box,
  LineChart,
  HardDrive,
  Sparkles
} from "lucide-react";
import { Footer } from "@/components/Footer";

const TOP_BAR_BG = "bg-gradient-to-r from-[#0055ff] to-[#00f2ff]";
const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";

export default function TeknologiPage() {
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teknologi</span>
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
      <section className="py-20 lg:py-24 bg-slate-50 relative overflow-hidden border-b border-slate-100">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white border-l border-slate-100 -z-0" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-8 lg:space-y-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl">
            <Terminal className="w-4 h-4 text-[#0055ff]" />
            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">System Architecture</span>
          </div>
          
          <h1 className="text-3xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
            Robust Neural Engine
          </h1>
          
          <p className="text-sm lg:text-xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto uppercase tracking-wide">
            Infrastruktur yang dirancang dengan keamanan containerized, akurasi tervalidasi, dan proses training data yang intensif.
          </p>
        </div>
      </section>

      {/* ── Technology Pillars ── */}
      <section className="py-20 lg:py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              {
                title: "AI & ML Engine",
                label: "YOLOv8 Training",
                desc: "Proses training model yang menggunakan ribuan sampel data petri dish untuk mencapai tingkat akurasi tinggi.",
                icon: <LineChart className="w-5 h-5 text-[#00f2ff]" />
              },
              {
                title: "Containerization",
                label: "Docker Infrastructure",
                desc: "Deployment berbasis Docker untuk memastikan isolasi sistem, skalabilitas, dan konsistensi di setiap lingkungan.",
                icon: <Box className="w-5 h-5 text-[#0055ff]" />
              },
              {
                title: "Data Security",
                label: "AES-256 Encryption",
                desc: "Enkripsi data hasil uji lab dan dokumen kepatuhan untuk menjamin kerahasiaan sesuai standar industri.",
                icon: <Lock className="w-5 h-5 text-[#ff00ff]" />
              },
              {
                title: "High Precision",
                label: "mAP @.5:.95 Metric",
                desc: "Validasi model dengan metrik Mean Average Precision yang ketat untuk memastikan hasil deteksi yang dapat dipercaya.",
                icon: <Zap className="w-5 h-5 text-[#00f2ff]" />
              }
            ].map((tech, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 p-6 lg:p-8 rounded-xl hover:bg-white hover:shadow-xl transition-all group h-full">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center mb-6 transition-transform">
                  {tech.icon}
                </div>
                <h4 className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{tech.label}</h4>
                <h3 className="text-base lg:text-lg font-bold text-slate-900 uppercase tracking-tight mb-3 lg:mb-4">{tech.title}</h3>
                <p className="text-[10px] lg:text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-wide">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Training Workflow Section ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-[#0055ff] uppercase tracking-[0.3em]">Lifecycle AI</h4>
              <h2 className="text-2xl lg:text-5xl font-bold text-slate-900 uppercase tracking-tight leading-tight">Proses Training & <br /> Akurasi Model</h2>
            </div>
            <p className="text-[10px] lg:text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-wide">
              Kami menggunakan pipeline data yang terstruktur untuk memastikan setiap model ColonyAI memenuhi standar akurasi laboratorium mikrobiologi.
            </p>
            <div className="space-y-6">
              {[
                { title: "Data Collection", val: "5000+ Annotated Images" },
                { title: "Preprocessing", val: "Auto-Augmentation" },
                { title: "Training Epochs", val: "100+ Iterations" },
                { title: "Model Accuracy", val: "99.2% Detection Rate" }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="text-[9px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</span>
                  <span className="text-[10px] lg:text-xs font-black text-slate-900">{stat.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 lg:p-8 rounded-xl border border-slate-200 shadow-2xl relative">
             <div className="space-y-8 relative z-10">
                {[
                  { step: "01", title: "Image Injection", desc: "Unggah gambar petri dish resolusi tinggi ke server analitik." },
                  { step: "02", title: "Neural Processing", desc: "Model YOLOv8 melakukan inferensi untuk mendeteksi 5 kelas objek." },
                  { step: "03", title: "Human Validation", desc: "Analis memvalidasi hasil deteksi untuk integritas 100%." },
                  { step: "04", title: "Audit Logging", desc: "Hasil dikunci dalam database immutable untuk audit trail." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 lg:gap-6 group">
                    <div className="text-xl lg:text-2xl font-black text-slate-100 group-hover:text-[#00f2ff] transition-colors">{item.step}</div>
                    <div className="space-y-1">
                      <h4 className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-widest">{item.title}</h4>
                      <p className="text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-wide">{item.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
             <div className={`absolute -bottom-6 -right-6 w-32 h-32 ${PRIMARY_GRADIENT} opacity-10 blur-3xl`} />
          </div>
        </div>
      </section>

      {/* ── Infrastructure Spec ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-xl lg:text-4xl font-bold text-slate-900 uppercase tracking-tight">Infrastructure Security Specification</h2>
            <div className={`h-1 w-16 mx-auto ${PRIMARY_GRADIENT} rounded-full`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                cat: "Environment Control",
                techs: ["Docker Containerization", "Resource Monitoring", "Auto-scaling Ops", "Isolasi Sandbox"],
                icon: <Box className="w-5 h-5" />
              },
              {
                cat: "Data Protection",
                techs: ["AES-256 Encryption", "JWT Token Auth", "SSL/TLS Grade A+", "Immutable Logs"],
                icon: <ShieldCheck className="w-5 h-5" />
              },
              {
                cat: "Deployment Hub",
                techs: ["FastAPI Microservice", "PostgreSQL Storage", "PWA Accessibility", "Real-time Telemetry"],
                icon: <HardDrive className="w-5 h-5" />
              }
            ].map((stack, i) => (
              <div key={i} className="bg-slate-50 p-6 lg:p-8 rounded-xl border border-slate-100 space-y-6 shadow-sm hover:shadow-xl transition-all">
                <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                  <div className={`w-10 h-10 rounded-lg ${PRIMARY_GRADIENT} flex items-center justify-center text-white`}>
                    {stack.icon}
                  </div>
                  <h3 className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-widest">{stack.cat}</h3>
                </div>
                <ul className="space-y-3">
                  {stack.techs.map((t, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-[9px] lg:text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      <div className="w-1 h-1 rounded-full bg-[#00f2ff]" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Code Showcase ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center text-center lg:text-left">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
              Developer Precision
            </h2>
            <div className="space-y-4 lg:space-y-6">
              {[
                "Neural network tervalidasi dengan ribuan data petri dish.",
                "Infrastruktur API terdokumentasi lengkap dengan Swagger UI.",
                "Sistem audit trail otomatis untuk setiap hasil analisis.",
                "Optimasi gambar di sisi klien untuk efisiensi bandwidth lab."
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 group justify-center lg:justify-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] shadow-[0_0_10px_#00f2ff]" />
                  <span className="text-[10px] lg:text-xs font-black text-slate-600 uppercase tracking-widest">{text}</span>
                </div>
              ))}
            </div>
            <Link 
              href="https://github.com/wi5nuu/colonyai"
              target="_blank"
              className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl"
            >
              <Code2 className="w-4 h-4" />
              View Open Source Repo
            </Link>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 lg:p-8 border border-white/10 shadow-2xl relative overflow-hidden group hidden lg:block">
            <div className="font-mono text-[11px] space-y-2 text-[#00f2ff]/80">
              <p className="text-white/20 uppercase tracking-[0.2em] mb-4"># ColonyAI Analysis Kernel</p>
              <p><span className="text-[#ff00ff]">def</span> <span className="text-[#00f2ff]">process_petri_dish</span>(image_data):</p>
              <p className="pl-4">results = model.predict(image_data, conf=<span className="text-[#00f2ff]">0.85</span>)</p>
              <p className="pl-4"><span className="text-[#ff00ff]">for</span> obj <span className="text-[#ff00ff]">in</span> results:</p>
              <p className="pl-8 text-white/40"># Identify microbial classes</p>
              <p className="pl-8">class_id = obj.cls</p>
              <p className="pl-8"><span className="text-[#ff00ff]">if</span> class_id == <span className="text-white">'colony'</span>:</p>
              <p className="pl-12 text-[#00f2ff]">colony_count += 1</p>
              <p className="pl-4"><span className="text-[#ff00ff]">return</span> colony_count, results.audit_log</p>
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

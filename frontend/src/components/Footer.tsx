"use client";

import Link from "next/link";
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Mail, 
  MapPin, 
  Phone, 
  Globe,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { AIChatbot } from "./AIChatbot";

export function Footer() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";

  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* ── Column 1: Brand & Desc ────────────────────────── */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img src="/android-chrome-512x512.png" alt="ColonyAI Logo" className="h-12 w-auto" />
              <div className="flex flex-col leading-none">
                <span className="text-[14px] font-black uppercase tracking-widest text-[#0055ff]">ColonyAI Lab</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Healthcare Case 1</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase tracking-wide">
              Salah satu solusi inovatif di bawah AI Open Innovation Challenge 2026. ColonyAI berperan sebagai Pusat Analisis Mikrobiologi Otomatis berbasis Visi Komputer untuk TUV NORD Indonesia.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, color: "bg-[#1877F2]" },
                { Icon: Instagram, color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" },
                { Icon: Youtube, color: "bg-[#FF0000]" },
                { Icon: (props: any) => (
                  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                  </svg>
                ), color: "bg-black" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className={`w-9 h-9 ${social.color} text-white rounded-lg flex items-center justify-center hover:scale-110 transition-all shadow-md`}
                >
                  <social.Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Column 2: Tautan Terkait (Internal) ───────────────── */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Tautan Terkait</h4>
            <div className="grid grid-cols-1 gap-3">
              {[
                { name: "The Challenge", href: "/profil" },
                { name: "Tujuan & Manfaat", href: "/tujuan-manfaat" },
                { name: "Target Pengguna", href: "/target-pengguna" },
                { name: "Teknologi AI", href: "/teknologi" },
                { name: "Compliance ISO", href: "/compliance" }
              ].map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className="text-[10px] font-bold text-slate-500 hover:text-[#0055ff] transition-colors uppercase tracking-widest flex items-center gap-2 group"
                >
                  <div className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-[#0055ff] transition-colors" />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Column 3: Partner Eksternal ────────────────────────── */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Ekosistem Strategis</h4>
            <div className="grid grid-cols-1 gap-3">
              {[
                "Kemenko Perekonomian",
                "TUV NORD Indonesia",
                "President University",
                "AI Challenge Hub Hub",
                "Lab Mikrobiologi Nasional"
              ].map((partner) => (
                <a 
                  key={partner} 
                  href="#" 
                  className="text-[10px] font-bold text-slate-500 hover:text-[#0055ff] transition-colors uppercase tracking-widest flex items-center gap-2 group"
                >
                  <div className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-[#0055ff] transition-colors" />
                  {partner}
                </a>
              ))}
            </div>
          </div>

          {/* ── Column 4: Tetap Terhubung ────────────────────────── */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Tetap Terhubung</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wide">
                <MapPin className="w-4 h-4 text-[#0055ff] flex-shrink-0" />
                <span>President University Campus, Jababeka, Cikarang, Jawa Barat</span>
              </li>
              <li className="flex gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <Phone className="w-4 h-4 text-[#0055ff] flex-shrink-0" />
                <span>150881</span>
              </li>
              <li className="flex gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <Mail className="w-4 h-4 text-[#0055ff] flex-shrink-0" />
                <span>committee-ai-open@president.ac.id</span>
              </li>
              <li className="flex gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <Globe className="w-4 h-4 text-[#0055ff] flex-shrink-0" />
                <span>www.colonyai.id</span>
              </li>
            </ul>
            
            <div className="pt-4 space-y-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Daftar untuk update regulasi AI Lab:</p>
              <div className="flex flex-row gap-1">
                <input 
                  type="email" 
                  placeholder="Email Anda" 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-l-lg px-3 py-2.5 text-[10px] font-bold focus:outline-none focus:border-[#0055ff] transition-all min-w-0"
                />
                <button className="bg-[#FFCC00] text-slate-900 px-4 py-2.5 rounded-r-lg text-[10px] font-black uppercase tracking-[0.05em] hover:bg-slate-900 hover:text-white transition-all shadow-sm whitespace-nowrap">
                  Berlangganan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Row ────────────────────────────────────────── */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            © 2026 ColonyAI Platform. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Kebijakan Privasi</Link>
            <span className="text-slate-200">|</span>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Syarat dan Ketentuan Layanan</Link>
          </div>
        </div>
      </div>

      {/* ── Floating Widgets (Dharmais Style) ────────────────────── */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-4 z-[200]">
        <div className="flex items-center gap-3 bg-white rounded-full pl-3 pr-5 py-2 shadow-2xl border border-slate-100 animate-in slide-in-from-right-8 duration-700">
           <div className={`w-8 h-8 rounded-full ${PRIMARY_GRADIENT} flex items-center justify-center text-white`}>
             <Phone className="w-4 h-4" />
           </div>
           <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Start a call</span>
        </div>
        <button 
          onClick={() => setIsChatOpen(true)}
          className={`${PRIMARY_GRADIENT} w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 hover:rotate-6 transition-all group`}
        >
          <svg className="w-7 h-7 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>

      <AIChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </footer>
  );
}

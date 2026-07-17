'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Phone, 
  Mail, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react'

const translations = {
  ID: {
    col1_title: "Pusat Pengembangan Platform",
    col2_title: "Saluran Komunikasi",
    col2_subtitle1: "Pusat Layanan Teknis",
    col2_subtitle2: "Correspondence Email",
    col3_title: "Bantuan & Legalitas",
    links: [
      { name: "Pusat Bantuan Akun", href: "/troubleshoot" },
      { name: "Kebijakan Privasi", href: "/privacy" },
      { name: "Syarat dan Ketentuan", href: "/terms" },
      { name: "Kepatuhan ISO-17025", href: "/compliance" }
    ],
    disclaimer: "ColonyAI Laboratory System is an automated microbiology analysis platform based on Computer Vision, developed as an innovative solution for the AI Open Innovation Challenge 2026 by President University and the Coordinating Ministry for Economic Affairs. This system is designed to meet ISO-17025 technical standards and implements military-grade data encryption to guarantee access security for every personnel registered in this digital laboratory infrastructure.",
    copyright: "© 2026 ColonyAI Technology Platform | All Rights Reserved.",
    iso_tag: "ISO-17025 Standard Compliant"
  },
  EN: {
    col1_title: "Platform Development Center",
    col2_title: "Communication Channels",
    col2_subtitle1: "Technical Service Center",
    col2_subtitle2: "Correspondence Email",
    col3_title: "Support & Legality",
    links: [
      { name: "Account Help Center", href: "/troubleshoot" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms and Conditions", href: "/terms" },
      { name: "ISO-17025 Compliance", href: "/compliance" }
    ],
    disclaimer: "ColonyAI Laboratory System is an automated microbiology analysis platform based on Computer Vision developed as an innovative solution for the AI Open Innovation Challenge 2026 by President University and the Coordinating Ministry for Economic Affairs. This system is designed to meet ISO-17025 technical standards and implements military-grade data encryption to ensure secure access for every registered personnel within this digital laboratory infrastructure.",
    copyright: "© 2026 ColonyAI Technology Platform | All Rights Reserved.",
    iso_tag: "ISO-17025 Standard Compliant"
  }
}

export function SecurityFooter() {
  const [lang, setLang] = useState<'ID' | 'EN'>('ID')

  useEffect(() => {
    const saved = localStorage.getItem('colony_lang') as 'ID' | 'EN'
    if (saved) setLang(saved)

    const handleLangChange = () => {
      const updated = localStorage.getItem('colony_lang') as 'ID' | 'EN'
      if (updated) setLang(updated)
    }

    window.addEventListener('langChange', handleLangChange)
    return () => window.removeEventListener('langChange', handleLangChange)
  }, [])

  const t = translations[lang]

  return (
    <footer className="w-full bg-white border-t border-slate-100 py-16 px-6 mt-auto font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 mb-16 border-b border-slate-100 pb-16">
          
          {/* ── Column 1: PUSAT PENGEMBANGAN ────────────────────────── */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{t.col1_title}</h4>
            <div className="space-y-4">
               <div className="flex items-start gap-4">
                  <Image src="/android-chrome-512x512.png" alt="ColonyAI" width={40} height={40} className="h-10 w-auto flex-shrink-0" />
                  <div className="space-y-1">
                     <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight">ColonyAI Laboratory System</p>
                     <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider">
                        President University Campus, Jababeka, Cikarang, <br />
                        Kabupaten Bekasi, Jawa Barat 17530, Indonesia.
                     </p>
                  </div>
               </div>
            </div>
          </div>

          {/* ── Column 2: SALURAN KOMUNIKASI ────────────────────────── */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{t.col2_title}</h4>
            <div className="space-y-5">
               <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-[#0055ff] group-hover:border-[#0055ff] transition-all">
                     <Phone className="w-4 h-4 text-[#0055ff] group-hover:text-white" />
                  </div>
                  <div>
                     <p className="text-[14px] font-black text-slate-900 tracking-tight">150881</p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.col2_subtitle1}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-[#0055ff] group-hover:border-[#0055ff] transition-all">
                     <Mail className="w-4 h-4 text-[#0055ff] group-hover:text-white" />
                  </div>
                  <div>
                     <p className="text-[12px] font-black text-slate-900 tracking-tight">lab@colonyai.diag</p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.col2_subtitle2}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* ── Column 3: BANTUAN ────────────────────────── */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{t.col3_title}</h4>
            <nav className="flex flex-col gap-3">
               {t.links.map((item) => (
                 <Link 
                   key={item.name} 
                   href={item.href}
                   className="text-[11px] font-bold text-slate-600 hover:text-[#0055ff] flex items-center justify-between group transition-all uppercase tracking-wider"
                 >
                   {item.name}
                   <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </Link>
               ))}
            </nav>
          </div>
        </div>

        {/* ── Project Disclaimer ────────────────── */}
        <div className="space-y-6 mb-12 text-justify">
           <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider border-l-4 border-[#0055ff] pl-6 bg-slate-50 p-6 rounded-r-2xl">
              {t.disclaimer}
           </p>
        </div>

        {/* ── Copyright Row ────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-100">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
             {t.copyright}
           </p>
           <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-[#0055ff]" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.iso_tag}</span>
           </div>
        </div>
      </div>
    </footer>
  )
}

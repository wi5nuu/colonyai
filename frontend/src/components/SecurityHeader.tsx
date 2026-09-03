'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Globe } from 'lucide-react'
import { useTranslationStore } from '@/lib/i18n/store'

interface SecurityHeaderProps {
  region?: string
  ip?: string
}

export function SecurityHeader({ region = 'ID-WEST-01', ip = '10.142.0.8' }: SecurityHeaderProps) {
  const language = useTranslationStore((s) => s.language)
  const setLanguage = useTranslationStore((s) => s.setLanguage)

  // Sanitize display values to prevent any injection
  const safeRegion = region.replace(/[^a-zA-Z0-9\-_. ]/g, '').slice(0, 50)
  const safeIp = ip.replace(/[^a-zA-Z0-9\-:.]/g, '').slice(0, 45)

  const toggleLanguage = (lang: string) => {
    setLanguage(lang.toLowerCase() as "en" | "id")
    const body = document.body
    body.style.opacity = '0.4'
    body.style.filter = 'blur(4px)'
    setTimeout(() => {
      body.style.opacity = '1'
      body.style.filter = 'none'
    }, 400)
  }

  return (
    <header className="w-full bg-white py-4 px-6 lg:px-12 flex items-center justify-between border-b border-slate-100 relative z-[100]">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center">
           <Image src="/android-chrome-512x512.png" alt="ColonyAI Logo" width={48} height={48} className="h-10 lg:h-12 w-auto object-contain" />
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-4 border-r border-slate-100 pr-6 mr-2">
           <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{safeRegion}</span>
               <span className="text-[8px] font-bold text-slate-300">Node: {safeIp}</span>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <button 
              onClick={() => toggleLanguage('id')}
              className={`${language === 'id' ? 'text-[#0055ff]' : 'text-slate-400'} hover:text-slate-900 transition-colors`}
            >
              ID
            </button>
            <span className="text-slate-300">|</span>
            <button 
              onClick={() => toggleLanguage('en')}
              className={`${language === 'en' ? 'text-[#0055ff]' : 'text-slate-400'} hover:text-slate-900 transition-colors`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Gavel, ShieldAlert, Cpu } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <Link href="/login" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Authorization
        </Link>

        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
            <Gavel className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Terms of Use</h1>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">ColonyAI System Governance // Standard Operating Procedure</p>
        </div>

        <div className="grid gap-8 bg-[#12141c] border border-white/5 p-8 md:p-12 rounded-[2.5rem]">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <Cpu className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold uppercase tracking-tight">1. Authorized Access</h2>
            </div>
            <p className="leading-relaxed">
              Users must only access the platform using their unique Authorization ID and Secret Key. Sharing credentials between laboratory personnel is strictly prohibited for audit integrity.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <ShieldAlert className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold uppercase tracking-tight">2. Use of AI Results</h2>
            </div>
            <p className="leading-relaxed">
              While ColonyAI provides high-precision colony detection, final results must be reviewed and approved by a qualified Laboratory Manager (Level-03) before official reporting.
            </p>
          </section>

          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">
              © 2026 ColonyAI, Inc. // Engineering Excellence
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

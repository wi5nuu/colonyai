'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, Scale, FileText } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <Link href="/login" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Authorization
        </Link>

        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Last Updated: May 2026 // ColonyAI Security Protocol</p>
        </div>

        <div className="grid gap-8 bg-[#12141c] border border-white/5 p-8 md:p-12 rounded-[2.5rem]">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <Scale className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold uppercase tracking-tight">1. Data Sovereignty</h2>
            </div>
            <p className="leading-relaxed">
              ColonyAI operates on a strict multi-tenant isolation principle. Your laboratory data, analysis results, and personnel information are cryptographically siloed and are never shared across organization boundaries.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold uppercase tracking-tight">2. Information Collection</h2>
            </div>
            <p className="leading-relaxed">
              We collect minimal personal data required for laboratory accountability: full name, professional email, and IP addresses for secure audit trails as required by ISO-17025 standards.
            </p>
          </section>

          <div className="pt-8 border-t border-white/5">
            <p className="text-xs text-slate-500 italic">
              ColonyAI Inc. is committed to protecting your intellectual property and ensuring that all AI-driven analysis remains confidential within your assigned node.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

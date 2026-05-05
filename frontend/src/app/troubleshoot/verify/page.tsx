'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

type State = 'form' | 'pending'

export default function VerifyIdentityPage() {
  const [state, setState] = useState<State>('form')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.post('/api/v1/auth/forgot-password', { email })
      setState('pending')
      toast.success('Request submitted', {
        description: 'Your request has been queued for administrator review.',
      })
    } catch (error: any) {
      console.error('[ColonyAI Error] Submit failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit request. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCallSupport = () => {
    toast.info('Customer Support', {
      description: 'Support line: +62 800-COLONY-AI  |  Mon–Fri 08:00–17:00 WIB',
    })
  }

  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Nav bar ── */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="w-full px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/troubleshoot" className="p-1 hover:bg-slate-100 rounded transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            </Link>
            <div className="flex items-center gap-2">
              <img src="/android-chrome-512x512.png" alt="Logo" className="w-8 h-8 object-contain" />
              <span className="text-[13px] font-black tracking-tighter uppercase text-slate-900">ColonyAI</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Support</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700">Verify</span>
          </div>
        </div>
      </nav>

      <div className="max-w-[480px] mx-auto px-4 py-10 sm:py-16 flex flex-col items-center gap-8">

        {state === 'form' ? (
          /* ── Form state ── */
          <div className="w-full space-y-8">
            <div className="border-b border-slate-200 pb-5 space-y-1">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Verify Identity</h1>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Enter your email address linked to your ColonyAI Account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input
                    type="email"
                    required
                    autoFocus
                    className="w-full h-9 bg-slate-50 border border-slate-200 rounded pl-9 pr-3 text-[12px] font-medium text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-700 focus:outline-none transition-all"
                    placeholder="name@laboratory.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded">
                <Clock className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Your request will be reviewed by your Organization Administrator. If approved, you'll receive a <strong className="text-slate-700">one-time reset token</strong> (valid for 1 hour) via your admin's communication channel.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-9 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[10px] font-black uppercase tracking-widest rounded transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...</>
                  ) : (
                    'Next'
                  )}
                </button>

                <div className="flex items-center gap-2 py-1">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <button
                  type="button"
                  onClick={handleCallSupport}
                  className="w-full h-9 border border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-3 h-3" /> Contact Customer Support
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ── Pending state ── */
          <div className="w-full space-y-6">
            <div className="border-b border-slate-200 pb-5 space-y-1">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Request Submitted</h1>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Your identity verification request is pending administrator review.
              </p>
            </div>

            {/* Progress timeline */}
            <div className="border border-slate-200 rounded overflow-hidden divide-y divide-slate-100">
              {[
                {
                  step: '01',
                  status: 'done',
                  label: 'Request Received',
                  desc: `Your request for ${email} has entered the admin review queue.`,
                },
                {
                  step: '02',
                  status: 'active',
                  label: 'Awaiting Admin Approval',
                  desc: 'Your Organization Administrator will verify your identity. (24/7 Security Protocol active).',
                },
                {
                  step: '03',
                  status: 'pending',
                  label: 'Token Delivered',
                  desc: 'If approved, the admin will send you a one-time reset token (valid 1 hour).',
                },
                {
                  step: '04',
                  status: 'pending',
                  label: 'Reset Password',
                  desc: 'Use the token at /reset-password to set your new password.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 px-4 py-3 ${item.status === 'active' ? 'bg-blue-50/60' : 'bg-white'}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5 ${
                      item.status === 'done'
                        ? 'bg-emerald-500 text-white'
                        : item.status === 'active'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {item.status === 'done' ? '✓' : item.step}
                  </div>
                  <div>
                    <p
                      className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${
                        item.status === 'done'
                          ? 'text-emerald-600'
                          : item.status === 'active'
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 px-3 py-2.5 rounded">
              <ShieldAlert className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 leading-relaxed">
                If you did <strong>not</strong> make this request, contact your Administrator immediately — someone may be attempting to access your account.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/reset-password"
                className="w-full h-9 bg-slate-900 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> I Have My Token — Reset Password
              </Link>
              <Link
                href="/login"
                className="w-full h-9 border border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Login
              </Link>
            </div>
          </div>
        )}

        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.25em] text-center">
          © 2026 ColonyAI, Inc. — Security Protocol v2.0
        </p>
      </div>
    </div>
  )
}

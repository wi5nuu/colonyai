'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'
import { toast } from 'sonner'
import { 
  Shield, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Loader2, 
  ChevronRight, 
  Check,
  ArrowRight
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [agreed, setAgreed] = useState(false)
  const { login, isLoading, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      toast.error('You must agree to the Terms of Use')
      return
    }
    try {
      await login(formData.email, formData.password)
      toast.success('Access authorization granted')
      router.push('/dashboard')
    } catch {
      // Error handled in store
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── Top Navigation ── */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/android-chrome-512x512.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-[13px] font-black tracking-tighter uppercase text-slate-900">ColonyAI</span>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <div className="w-px h-3 bg-slate-200" />
            <span className="text-slate-700">Login</span>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="max-w-[420px] mx-auto px-4 py-12 sm:py-20 w-full flex-1 flex flex-col items-center gap-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
        
        {/* Login Form */}
        <div className="w-full space-y-8">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-base font-black text-slate-900 tracking-tight uppercase">System Access</h2>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Provide your credentials to access the laboratory network.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 px-0.5">
                  Authorization ID
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-slate-600 transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full h-9 bg-slate-50 border border-slate-200 rounded pl-9 pr-3 text-[11px] font-medium text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-700 focus:outline-none transition-all"
                    placeholder="analyst@colonyai.diag"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-0.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Secret Key
                  </label>
                  <Link 
                    href="/troubleshoot"
                    className="text-[9px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors relative z-20 cursor-pointer p-0.5"
                  >
                    Trouble Signing In?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-slate-600 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full h-9 bg-slate-50 border border-slate-200 rounded pl-9 pr-10 text-[11px] font-medium text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-700 focus:outline-none transition-all"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center px-0.5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                />
                <div className="w-3.5 h-3.5 rounded border border-slate-200 bg-slate-50 peer-checked:bg-slate-900 peer-checked:border-slate-900 transition-all flex items-center justify-center">
                  {formData.rememberMe && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Keep me signed in</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-slate-900 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 shadow-sm"
            >
              {isLoading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Authorizing...</>
              ) : (
                <><Shield className="w-3.5 h-3.5" /> Access System</>
              )}
            </button>

            {/* Agreement Section */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <div className="mt-0.5 w-4 h-4 rounded border border-slate-200 bg-slate-50 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex flex-shrink-0 items-center justify-center shadow-sm">
                  {agreed && <Check className="w-3 h-3 text-white" />}
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  I confirm that I have <strong className="text-slate-900">Official Authorization</strong> to access this infrastructure. All activities are audited under <strong className="text-slate-900">ISO-17025 Protocols</strong>.
                </p>
              </label>
              <div className="p-3 bg-rose-50 border border-rose-100 rounded">
                <p className="text-[9px] text-rose-600 leading-relaxed font-bold uppercase tracking-widest">
                  Unauthorized access, data extraction, or privacy breaches will be prosecuted under applicable cyber-security laws.
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="w-full pt-4 border-t border-slate-100 text-center">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
            © 2026 ColonyAI, Inc. // Standard Operating Procedure Enforced
          </p>
        </div>

      </div>
    </div>
  )
}

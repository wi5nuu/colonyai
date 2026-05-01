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
  Globe, 
  Cpu, 
  Terminal,
  Activity,
  Box,
  Check
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
  const { login, isLoading, error, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      toast.error('Anda harus menyetujui Ketentuan Penggunaan')
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c10] font-sans selection:bg-primary/30 selection:text-white p-4 sm:p-6 overflow-x-hidden">
      {/* Visual Background Elements (Simplified) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-[450px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
        
        {/* Header/Logo - More Prominent */}
        <div className="text-center space-y-6">
          <div className="inline-flex flex-col items-center gap-3 sm:gap-4 group">
            <img 
              src="/android-chrome-512x512.png" 
              alt="ColonyAI Logo" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain transition-transform duration-500 group-hover:scale-105" 
            />
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase leading-none">ColonyAI</h2>
              <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] translate-x-0.5">Laboratory OS v2.0</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-[#12141c]/80 backdrop-blur-xl border border-white/5 p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                  Authorization ID
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within/input:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full h-14 bg-[#0a0c10] border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    placeholder="analyst@colonyai.diag"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Secret Key
                  </label>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within/input:text-primary transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full h-14 bg-[#0a0c10] border border-white/5 rounded-2xl pl-12 pr-14 text-sm font-medium text-white placeholder:text-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-600 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember & Forgot Row */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                />
                <div className="w-4.5 h-4.5 rounded-md border border-white/10 bg-[#0a0c10] peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                  {formData.rememberMe && <ChevronRight className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Remember</span>
              </label>
              <Link 
                href="/forgot-password"
                className="relative z-20 p-1 text-xs font-black text-primary uppercase tracking-widest hover:underline hover:text-primary/80 transition-colors cursor-pointer"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-12 h-12 bg-primary hover:bg-primary/90 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-xl inline-flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                ) : (
                  <><Shield className="w-4 h-4" /> Login</>
                )}
              </button>
            </div>
          </form>

          {/* Agreement Section */}
          <div className="mt-8 pt-8 border-t border-white/5 space-y-5">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <div className="mt-0.5 w-5 h-5 rounded-md border border-white/10 bg-[#0a0c10] peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex flex-shrink-0 items-center justify-center shadow-inner">
                {agreed && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                Saya mengonfirmasi bahwa saya memiliki <strong className="text-white">Otorisasi Resmi</strong> untuk mengakses infrastruktur ini. Saya memahami bahwa semua aktivitas diaudit dan tunduk pada <strong className="text-white">Protokol Keamanan Tingkat Tinggi (ISO-17025)</strong> dan Perjanjian Kerahasiaan Data.
              </p>
            </label>
            <div className="px-8 border-l-2 border-rose-500/20 ml-2">
              <p className="text-[9px] text-rose-500/80 leading-relaxed font-black uppercase tracking-widest">
                Segala bentuk akses tidak sah, ekstraksi data, atau pelanggaran privasi akan ditindaklanjuti secara hukum yang berlaku.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center pb-8">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">
            © 2026 ColonyAI, Inc. // Standard Operating Procedure Enforced
          </p>
        </div>

      </div>
    </div>
  )
}

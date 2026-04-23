'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'
import { toast } from 'sonner'

const Icons = {
  Flask: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M9 3h6M10 3v7.4a2 2 0 0 1-.5 1.3L4 19.4A2 2 0 0 0 5.5 22h13a2 2 0 0 0 1.5-2.6L14.5 11.7a2 2 0 0 1-.5-1.3V3" />
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 7L2 7" />
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  Loader: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-full h-full animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  Brain: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6l-.7.5V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4.5l-.7-.5A7 7 0 0 1 12 2z" />
      <path d="M9 9h6M9 12h6" />
    </svg>
  ),
  Target: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  Microscope: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M6 18h8M3 22h18M8 22v-4M16 22v-4M12 2v4M12 10a4 4 0 0 0-4-4H6l2 4h8l2-4h-2a4 4 0 0 0-4 4z" />
      <circle cx="12" cy="14" r="3" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
}

const renderIcon = (name: string, className = 'w-5 h-5') => {
  const IconComponent = Icons[name as keyof typeof Icons]
  if (!IconComponent) return null
  return (
    <div className={className}>
      <IconComponent />
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const { login, isLoading, error, isAuthenticated } = useAuthStore()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(formData.email, formData.password)
      toast.success('Access authorization granted')
      router.push('/dashboard')
    } catch {
      // Error handled in store
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-blue-500 selection:text-white">
      {/* Sector Alpha - Authorization Matrix */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-16 relative overflow-hidden bg-white shadow-[20px_0_40px_rgba(0,0,0,0.02)] z-20">
        <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Laboratory ID */}
          <Link href="/" className="flex items-center gap-4 mb-16 group">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center group-hover:bg-slate-900 transition-all duration-500 shadow-lg shadow-blue-500/20">
              <div className="w-6 h-6 text-white">
                <Icons.Flask />
              </div>
            </div>
            <div className="flex flex-col">
               <span className="text-lg font-black tracking-[0.2em] text-slate-900 uppercase leading-none">ColonyAI</span>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Laboratory OS</span>
            </div>
          </Link>

          {/* Verification Protocol Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase">System Login</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Bio-Diagnostic Platform // Authorization Required</p>
          </div>

          {/* Authorization Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {/* Identity Identifier */}
              <div className="space-y-3">
                <label htmlFor="email" className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em] px-1">
                  Primary Analyst Identifier (Email)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                    {renderIcon('Mail', 'w-3.5 h-3.5')}
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-[13px] text-slate-900 placeholder:text-slate-300"
                    placeholder="analyst@colonyai.diag"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Security Key */}
              <div className="space-y-3">
                <label htmlFor="password" className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em] px-1">
                  Encryption Secret (Password)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                    {renderIcon('Lock', 'w-3.5 h-3.5')}
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-12 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-[13px] text-slate-900 placeholder:text-slate-300"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-blue-500 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? renderIcon('EyeOff', 'w-3.5 h-3.5') : renderIcon('Eye', 'w-3.5 h-3.5')}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                />
                <div className="w-4 h-4 rounded border border-slate-200 bg-slate-50 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all flex items-center justify-center">
                  {formData.rememberMe && <div className="w-2.5 h-2.5 text-white"><Icons.Check /></div>}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-slate-600 transition-colors">Maintain Session</span>
              </label>
              <Link href="/forgot-password" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wide transition-colors">
                Key Recovery
              </Link>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl animate-in shake duration-500">
                <p className="text-[10px] font-bold text-destructive uppercase tracking-widest text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-slate-200 hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 animate-spin"><Icons.Loader /></div>
                  Validating...
                </>
              ) : (
                <>
                  <div className="w-3.5 h-3.5"><Icons.Shield /></div>
                  Grant Access
                </>
              )}
            </button>

            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Unprovisioned Hardware?{' '}
              <Link href="/register" className="text-blue-600 font-black hover:text-blue-700 transition-colors">
                Initialize Request
              </Link>
            </p>
          </form>

          {/* Documentation Footnote */}
          <div className="mt-20 pt-8 border-t border-slate-100">
            <div className="flex justify-center gap-8 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-blue-500 transition-colors">Documentation</a>
              <a href="#" className="hover:text-blue-500 transition-colors">ISO Standards</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Security</a>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Beta - Spectral Insight Visualizer */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-slate-950 border-l border-slate-900">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 flex flex-col justify-center px-24 max-w-3xl">
          <div className="mb-20">
            <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Core Intelligence</div>
            <h2 className="text-4xl font-black text-white mb-8 tracking-tighter leading-none uppercase">Precision Matrix<br />Bio-Diagnostics</h2>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Autonomous TPC analysis system utilizing high-frequency spectral imaging for clinical-grade microbiological counts. 
              Enabling standardized laboratory diagnostics at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 mb-20">
              {[
                { icon: 'Brain', title: '5-Class Neural Object detection', desc: 'Simultaneous spectral classification: Colonies, Artifacts, Media Integrity' },
                { icon: 'Clock', title: '85% Latency Reduction', desc: 'Accelerating diagnostic pipelines from minutes to nominal seconds' },
                { icon: 'Shield', title: 'ISO 17025 Compliance Node', desc: 'Immutable archival ledger with verified analyst sign-off protocols' },
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-lg shadow-blue-500/5 flex-shrink-0">
                    {renderIcon(feature.icon, 'w-6 h-6')}
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1.5 group-hover:text-blue-500 transition-colors">{feature.title}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
          </div>

          <div className="grid grid-cols-3 gap-8">
            {[
              { value: '≥92%', label: 'ACCURACY' },
              { value: '500+', label: 'NODES' },
              { value: '5-CLASS', label: 'SPECTRUM' },
            ].map((stat, index) => (
              <div key={index} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-3xl hover:border-blue-500/50 transition-all duration-500 group">
                <p className="text-2xl font-black text-white tracking-tighter group-hover:text-blue-500 transition-colors">{stat.value}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


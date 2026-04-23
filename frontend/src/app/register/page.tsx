'use client'

import { useState } from 'react'
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
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  Award: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M20 6L9 17l-5-5" />
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

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'analyst',
    terms: false,
  })
  const [validationError, setValidationError] = useState('')

  const { register, isLoading, error } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Encryption keys do not match')
      return
    }

    if (formData.password.length < 8) {
      setValidationError('Security key must exceed 8 characters')
      return
    }

    try {
      await register(formData.email, formData.password, formData.fullName)
      toast.success('Laboratory node provisioned')
      router.push('/dashboard')
    } catch {
      // Error handled in store
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-blue-500 selection:text-white">
      {/* Sector Alpha - Provisioning Matrix */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-16 relative overflow-hidden bg-white shadow-[20px_0_40px_rgba(0,0,0,0.02)] z-20">
        <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Laboratory ID */}
          <Link href="/" className="flex items-center gap-4 mb-12 group">
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

          {/* Provisioning Protocol Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase leading-none">Initialize Node</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Requesting New Analyst Provisioning Phase</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {(validationError || error) && (
              <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl animate-in shake duration-500">
                <p className="text-[10px] font-bold text-destructive uppercase tracking-widest text-center">{validationError || error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em] px-1">Full Analyst Identity</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                    {renderIcon('User', 'w-3.5 h-3.5')}
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    required
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-black uppercase tracking-widest text-[10px] text-slate-900"
                    placeholder="ENTER FULL NAME"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em] px-1">Network Email Pointer</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                    {renderIcon('Mail', 'w-3.5 h-3.5')}
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-[13px] text-slate-900"
                    placeholder="analyst@colonyai.diag"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em] px-1">Security Key</label>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-[13px] text-slate-900"
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em] px-1">Confirm Key</label>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-[13px] text-slate-900"
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em] px-1">Access Authorization Level</label>
                <select
                  id="role"
                  className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 font-black uppercase tracking-[0.1em] text-[10px] text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="analyst" className="bg-white">Class-01: Laboratory Analyst</option>
                  <option value="viewer" className="bg-white">Class-02: Spectral Observer</option>
                </select>
              </div>

              <div className="flex items-start gap-3 py-2">
                <label className="relative mt-0.5 cursor-pointer flex items-center">
                  <input
                    type="checkbox"
                    required
                    checked={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 rounded border border-slate-200 bg-slate-50 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all flex items-center justify-center">
                    {formData.terms && <div className="w-2.5 h-2.5 text-white"><Icons.Check /></div>}
                  </div>
                </label>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-tight">
                  I acknowledge the <span className="text-blue-600 font-black cursor-pointer hover:underline">Bio-Safety Protocol</span> & <span className="text-blue-600 font-black cursor-pointer hover:underline">Privacy Cipher</span>
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-slate-200 hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <><div className="w-4 h-4 animate-spin"><Icons.Loader /></div> Provisioning...</>
              ) : (
                <><div className="w-3.5 h-3.5"><Icons.Zap /></div> Provision Node</>
              )}
            </button>

            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-6">
              Identity Already Registered?{' '}
              <Link href="/login" className="text-blue-600 font-black hover:text-blue-700 transition-colors">
                Authorize Login
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Sector Beta */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-slate-950 border-l border-slate-900">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/3 left-1/2 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-[180px] animate-pulse" />

        <div className="relative z-10 flex flex-col justify-center px-24 max-w-3xl">
          <div className="mb-20">
            <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Onboarding Manifest</div>
            <h2 className="text-4xl font-black text-white mb-8 tracking-tighter leading-none uppercase">Why Provision a<br />ColonyAI Node?</h2>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Transform your microbiology laboratory into a standardized high-throughput diagnostic center. 
              Integrated neural vision for precision TPC analysis.
            </p>
          </div>

          <div className="space-y-10 mb-20">
              {[
                { icon: 'Award', title: '14-Day Full Access Clause', desc: 'provisioning includes full feature-set authorization for validation testing' },
                { icon: 'Zap', title: 'Zero Latency Diagnostics', desc: 'analyze spectral inputs and generate CFU reports in nominal timeframes' },
                { icon: 'Shield', title: 'Encrypted Forensic Archival', desc: 'ISO-ready digital audit trails with end-to-end encryption protocols' },
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

          <div className="grid grid-cols-2 gap-6">
            {[
              { value: 'â‰¥92%', label: 'ACCURACY' },
              { value: '8+', label: 'MEDIA TYPES' },
              { value: '5', label: 'CLASSES' },
              { value: '<2m', label: 'LATENCY' },
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

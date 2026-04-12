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
  Target: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
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
    <div className="min-h-screen flex bg-background font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Sector Alpha - Provisioning Matrix */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/4 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
        
        <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Laboratory ID */}
          <Link href="/" className="flex items-center gap-4 mb-16 group">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-lg shadow-primary/5">
              <div className="w-7 h-7">
                <Icons.Flask />
              </div>
            </div>
            <div className="flex flex-col">
               <span className="text-xl font-black tracking-[0.2em] text-foreground uppercase leading-none">ColonyAI</span>
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">Laboratory OS</span>
            </div>
          </Link>

          {/* Provisioning Protocol Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-black text-foreground mb-3 tracking-tight leading-none">Initialize Node</h1>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Requesting New Analyst Provisioning Phase</p>
          </div>

          {/* Registration Card Matrix */}
          <div className="p-0">
            {(validationError || error) && (
              <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl animate-in shake duration-500">
                <p className="text-[10px] font-bold text-destructive uppercase tracking-widest text-center">{validationError || error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Identity */}
              <div className="space-y-3">
                <label htmlFor="fullName" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                  Full Analyst Identity
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    {renderIcon('User', 'w-4 h-4')}
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className="input h-14 bg-muted/20 border-border/40 pl-14 hover:border-primary/30 transition-all font-black uppercase tracking-widest text-[11px]"
                    placeholder="ENTER FULL NAME"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>

              {/* Email Identifier */}
              <div className="space-y-3">
                <label htmlFor="email" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                  Network Email Pointer
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    {renderIcon('Mail', 'w-4 h-4')}
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="input h-14 bg-muted/20 border-border/40 pl-14 hover:border-primary/30 transition-all font-mono text-sm"
                    placeholder="analyst@colonyai.diag"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Password Sequence Overlay */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label htmlFor="password" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Security Key
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="input h-14 bg-muted/20 border-border/40 px-5 hover:border-primary/30 transition-all font-mono text-sm"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? renderIcon('EyeOff', 'w-4 h-4') : renderIcon('Eye', 'w-4 h-4')}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="confirmPassword" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Confirm Key
                  </label>
                  <div className="relative group">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="input h-14 bg-muted/20 border-border/40 px-5 hover:border-primary/30 transition-all font-mono text-sm"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? renderIcon('EyeOff', 'w-4 h-4') : renderIcon('Eye', 'w-4 h-4')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Access Role Privilege */}
              <div className="space-y-3">
                <label htmlFor="role" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                  Access Authorization Level
                </label>
                <select
                  id="role"
                  className="input h-14 bg-muted/20 border-border/40 px-5 font-black uppercase tracking-[0.2em] text-[10px] appearance-none"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="analyst" className="bg-background">Class-01: Laboratory Analyst</option>
                  <option value="viewer" className="bg-background">Class-02: Spectral Observer</option>
                </select>
                <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-relaxed">Analyst: Read/Write Access // Viewer: Read-Only Spectral Archive</p>
              </div>

              {/* Regulatory Agreement */}
              <div className="flex items-start gap-4">
                <label className="relative mt-1 cursor-pointer flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    checked={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded-lg border-2 border-border/40 bg-muted/20 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                    {formData.terms && <div className="w-3 h-3 text-primary-foreground"><Icons.Check /></div>}
                  </div>
                </label>
                <label htmlFor="terms" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">
                  I acknowledge the{' '}
                  <a href="#" className="text-primary hover:text-foreground transition-colors underline underline-offset-4">Bio-Safety Protocol</a>{' '}
                  &{' '}
                  <a href="#" className="text-primary hover:text-foreground transition-colors underline underline-offset-4">Privacy Cipher</a>
                </label>
              </div>

              {/* Execute Provisioning */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full h-16 text-sm font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5"><Icons.Loader /></div>
                    Provisioning Node...
                  </>
                ) : (
                  'Provision Node'
                )}
              </button>
            </form>
          </div>

          {/* Authorization Redirect */}
          <p className="mt-10 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Identity Already Registered?{' '}
            <Link href="/login" className="text-primary hover:text-foreground transition-colors">
              Authorize Login
            </Link>
          </p>
        </div>
      </div>

      {/* Sector Beta - Intelligence Onboarding Summary */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-muted/10 border-l border-border/10">
        {/* Background Procedural Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        {/* Animated Bioluminescence */}
        <div className="absolute top-1/3 left-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[180px] animate-pulse" />

        <div className="relative z-10 flex flex-col justify-center px-24 max-w-3xl">
          {/* Welcome Packet */}
          <div className="mb-20">
            <div className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-4">Onboarding Manifest</div>
            <h2 className="text-4xl font-black text-foreground mb-8 tracking-tighter leading-none uppercase">Why Provision a<br />ColonyAI Node?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Transform your microbiology laboratory into a standardized high-throughput diagnostic center. 
              Integrated neural vision for precision TPC analysis.
            </p>
          </div>

          {/* Provisioning Benefits Ledger */}
          <div className="space-y-10 mb-20">
              {[
                { icon: 'Award', title: '14-Day Full Access Clause', desc: 'provisioning includes full feature-set authorization for validation testing' },
                { icon: 'Zap', title: 'Zero Latency Diagnostics', desc: 'analyze spectral inputs and generate CFU reports in nominal timeframes' },
                { icon: 'Shield', title: 'Encrypted Forensic Archival', desc: 'ISO-ready digital audit trails with end-to-end encryption protocols' },
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-lg shadow-primary/5 flex-shrink-0">
                    {renderIcon(feature.icon, 'w-6 h-6')}
                  </div>
                  <div>
                    <p className="text-xs font-black text-foreground uppercase tracking-widest mb-1.5 group-hover:text-primary transition-colors">{feature.title}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
          </div>

          {/* Analytical Telemetry Target */}
          <div className="grid grid-cols-2 gap-6">
            {[
              { value: '≥92%', label: 'ACCURACY' },
              { value: '8+', label: 'MEDIA TYPES' },
              { value: '5', label: 'CLASSES' },
              { value: '<2m', label: 'LATENCY' },
            ].map((stat, index) => (
              <div key={index} className="p-6 rounded-2xl bg-muted/20 border border-border/20 backdrop-blur-3xl hover:border-primary/30 transition-all duration-500 group">
                <p className="text-2xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors">{stat.value}</p>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

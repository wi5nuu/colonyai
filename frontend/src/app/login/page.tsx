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

  const { login, isLoading, error } = useAuthStore()

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
    <div className="min-h-screen flex bg-background font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Sector Alpha - Authorization Matrix */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
        
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

          {/* Verification Protocol Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-black text-foreground mb-3 tracking-tight">System Login</h1>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Bio-Diagnostic Platform // Authorization Required</p>
          </div>

          {/* Authorization Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {/* Identity Identifier */}
              <div className="space-y-3">
                <label htmlFor="email" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                  Primary Analyst Identifier (Email)
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

              {/* Security Key */}
              <div className="space-y-3">
                <label htmlFor="password" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                  Encryption Secret (Password)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                    {renderIcon('Lock', 'w-4 h-4')}
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input h-14 bg-muted/20 border-border/40 pl-14 pr-14 hover:border-primary/30 transition-all font-mono text-sm"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? renderIcon('EyeOff', 'w-4 h-4') : renderIcon('Eye', 'w-4 h-4')}
                  </button>
                </div>
              </div>
            </div>

            {/* Persistence & Recovery Protocol */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                />
                <div className="w-5 h-5 rounded-lg border-2 border-border/40 bg-muted/20 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                  {formData.rememberMe && <div className="w-3 h-3 text-primary-foreground"><Icons.Check /></div>}
                </div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">Maintain Session</span>
              </label>
              <Link href="/forgot-password" className="text-[10px] font-black text-primary hover:text-foreground uppercase tracking-widest transition-colors">
                Key Recovery
              </Link>
            </div>

            {/* Error Handshake */}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl animate-in shake duration-500">
                <p className="text-[10px] font-bold text-destructive uppercase tracking-widest text-center">{error}</p>
              </div>
            )}

            {/* Execute Authorization */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full h-16 text-sm font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5"><Icons.Loader /></div>
                  Validating Access...
                </>
              ) : (
                'Grant Access'
              )}
            </button>

            {/* Provisioning Redirect */}
            <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Unprovisioned Hardware?{' '}
              <Link href="/register" className="text-primary hover:text-foreground transition-colors">
                Initialize Request
              </Link>
            </p>
          </form>

          {/* Documentation Footnote */}
          <div className="mt-20 pt-10 border-t border-border/10">
            <div className="flex justify-center gap-10 text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
              <a href="#" className="hover:text-primary transition-colors">Documentation</a>
              <a href="#" className="hover:text-primary transition-colors">ISO Standards</a>
              <a href="#" className="hover:text-primary transition-colors">Security</a>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Beta - Spectral Insight Visualizer */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-muted/10 border-l border-border/10">
        {/* Background Procedural Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        {/* Animated Bioluminescence */}
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 flex flex-col justify-center px-24 max-w-3xl">
          {/* Diagnostic Capability Overview */}
          <div className="mb-20">
            <div className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-4">Core Intelligence</div>
            <h2 className="text-4xl font-black text-foreground mb-8 tracking-tighter leading-none uppercase">Precision Matrix<br />Bio-Diagnostics</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Autonomous TPC analysis system utilizing high-frequency spectral imaging for clinical-grade microbiological counts. 
              Enabling standardized laboratory diagnostics at scale.
            </p>
          </div>

          {/* Module Capabilities Registry */}
          <div className="grid grid-cols-1 gap-10 mb-20">
              {[
                { icon: 'Brain', title: '5-Class Neural Object detection', desc: 'Simultaneous spectral classification: Colonies, Artifacts, Media Integrity' },
                { icon: 'Clock', title: '85% Latency Reduction', desc: 'Accelerating diagnostic pipelines from minutes to nominal seconds' },
                { icon: 'Shield', title: 'ISO 17025 Compliance Node', desc: 'Immutable archival ledger with verified analyst sign-off protocols' },
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

          {/* Telemetry Snapshot */}
          <div className="grid grid-cols-3 gap-8">
            {[
              { value: '≥92%', label: 'ACCURACY' },
              { value: '500+', label: 'NODES' },
              { value: '5-CLASS', label: 'SPECTRUM' },
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

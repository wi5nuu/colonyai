'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Lock, Loader2, CheckCircle2, 
  Shield, Eye, EyeOff, Key, AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'input-token' | 'set-password' | 'success'>('input-token')
  const [token, setToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [isLoading, setIsLoading] = useState(false)

  // Step 1: Verify token exists (just move to step 2)
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) {
      toast.error('Token tidak boleh kosong')
      return
    }
    setStep('set-password')
  }

  // Step 2: Submit new password with token
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok')
      return
    }
    if (formData.password.length < 8) {
      toast.error('Password minimal 8 karakter')
      return
    }

    setIsLoading(true)
    try {
      await api.post('/api/v1/auth/reset-password', {
        token: token.trim(),
        new_password: formData.password
      })
      setStep('success')
      toast.success('Password berhasil diperbarui!')
      setTimeout(() => router.push('/login'), 3000)
    } catch (error: any) {
      const detail = error.response?.data?.detail || 'Token tidak valid atau sudah kedaluwarsa.'
      toast.error(detail)
      if (detail.includes('expired') || detail.includes('Invalid')) {
        setStep('input-token') // Back to step 1
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c10] p-4">
        <div className="w-full max-w-[420px] space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="bg-[#12141c]/80 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] shadow-2xl text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Password Diperbarui</h2>
              <p className="text-sm text-slate-400 font-medium">
                Akses Anda telah dipulihkan. Mengarahkan ke halaman login...
              </p>
            </div>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:bg-primary/90"
            >
              Login Sekarang
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c10] font-sans p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[450px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex flex-col items-center gap-3 sm:gap-4 group">
            <img 
              src="/android-chrome-512x512.png" 
              alt="ColonyAI Logo" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain transition-transform duration-500 group-hover:scale-105" 
            />
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase leading-none">ColonyAI</h2>
              <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Reset Password</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 px-4">
          {['Token', 'Password Baru', 'Selesai'].map((label, i) => {
            const stepIndex = step === 'input-token' ? 0 : step === 'set-password' ? 1 : 2
            const isDone = i < stepIndex
            const isActive = i === stepIndex
            return (
              <div key={i} className="flex items-center flex-1 gap-2">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                    isDone ? 'bg-emerald-500 text-white' :
                    isActive ? 'bg-primary text-white' :
                    'bg-white/5 text-slate-600'
                  }`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${
                    isActive ? 'text-white' : 'text-slate-600'
                  }`}>{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px ${isDone ? 'bg-emerald-500/30' : 'bg-white/5'}`} />}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div className="bg-[#12141c]/80 backdrop-blur-xl border border-white/5 p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {/* Step 1: Enter Token */}
          {step === 'input-token' && (
            <form onSubmit={handleTokenSubmit} className="space-y-7">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-white">Masukkan Token Reset</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Masukkan token yang telah disampaikan oleh <span className="text-primary font-bold">Administrator</span> Anda melalui WhatsApp/Teams/telepon internal.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                  Token Reset (dari Admin)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full h-14 bg-[#0a0c10] border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-mono font-bold text-white placeholder:text-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    placeholder="Paste token di sini..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-200/60 leading-relaxed">
                  Token hanya berlaku <strong>1 jam</strong> sejak disetujui Admin. Jika kedaluwarsa, hubungi Admin Anda kembali.
                </p>
              </div>

              <button
                type="submit"
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all"
              >
                <Shield className="w-4 h-4" /> Verifikasi Token
              </button>
            </form>
          )}

          {/* Step 2: Set New Password */}
          {step === 'set-password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-7">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-white">Buat Password Baru</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Buat password baru yang kuat. Minimal 8 karakter, huruf besar, angka, dan karakter khusus.
                </p>
              </div>

              <div className="space-y-4">
                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Password Baru</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full h-14 bg-[#0a0c10] border border-white/5 rounded-2xl pl-12 pr-14 text-sm font-medium text-white placeholder:text-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      placeholder="Min. 8 karakter"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Konfirmasi Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                      <Shield className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      className="w-full h-14 bg-[#0a0c10] border border-white/5 rounded-2xl pl-12 pr-14 text-sm font-medium text-white placeholder:text-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      placeholder="Ulangi password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 hover:text-white transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password strength indicators */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Min. 8 karakter', ok: formData.password.length >= 8 },
                  { label: 'Huruf besar', ok: /[A-Z]/.test(formData.password) },
                  { label: 'Angka', ok: /[0-9]/.test(formData.password) },
                  { label: 'Karakter khusus', ok: /[!@#$%^&*]/.test(formData.password) },
                ].map((req, i) => (
                  <div key={i} className={`flex items-center gap-2 text-[10px] font-bold transition-colors ${req.ok ? 'text-emerald-500' : 'text-slate-600'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${req.ok ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                    {req.label}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('input-token')}
                  className="px-4 py-3 border border-white/5 rounded-xl text-slate-500 hover:text-white hover:border-white/10 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                >
                  {isLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                    : <><Lock className="w-4 h-4" /> Simpan Password Baru</>
                  }
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">
          © 2026 ColonyAI, Inc. // Secure Recovery Protocol v2.0
        </p>
      </div>
    </div>
  )
}

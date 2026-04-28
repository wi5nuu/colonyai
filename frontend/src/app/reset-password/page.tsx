'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FlaskConical, ArrowLeft, Lock, Loader2, CheckCircle, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '@/lib/auth-api'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error('Invalid Protocol', {
        description: 'No authorization token found in the request.',
      })
      router.push('/login')
    }
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Parity Mismatch', {
        description: 'New passwords do not match.',
      })
      return
    }

    if (formData.password.length < 8) {
      toast.error('Complexity Failure', {
        description: 'Password must be at least 8 characters.',
      })
      return
    }

    setIsLoading(true)

    try {
      await authApi.resetPassword({
        token,
        new_password: formData.password
      })
      setIsSuccess(true)
      toast.success('Matrix Realigned', {
        description: 'Your security key has been successfully updated.',
      })
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      toast.error('Protocol Error', {
        description: error.response?.data?.detail || 'Failed to reset security key.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
          <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center shadow-2xl shadow-slate-200/50">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Access Restored</h1>
            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
              Your credentials have been successfully updated. Redirecting to authorization matrix...
            </p>
            <Link
              href="/login"
              className="w-full h-12 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg"
            >
              Manual Override to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-4 group">
            <div className="p-2.5 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20 group-hover:bg-slate-900 transition-all duration-500">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
               <span className="block text-xl font-black tracking-widest text-slate-900 uppercase leading-none">ColonyAI</span>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Laboratory OS</span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-10 shadow-2xl shadow-slate-200/50 animate-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">Reset Security Key</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
              Bio-Diagnostic Identity Protocol // Phase 2
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em] px-1">
                  New Encryption Secret
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    required
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em] px-1">
                  Confirm Encryption Secret
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors">
                    <Shield className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••••••"
                    required
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.password || !formData.confirmPassword}
              className="w-full h-12 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating Matrix...
                </>
              ) : (
                'Finalize Security Key'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Abort Protocol
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Activity,
  ClipboardCheck,
  ShieldAlert,
  FlaskConical,
  Phone,
  Globe,
  Clock,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslationStore } from "@/lib/i18n/store";

import { Footer } from "@/components/Footer";

export default function LoginPage() {
  const { t, language } = useTranslationStore();
  const isId = language === "id";
  const auth = useAuthStore();
  const loginStep = auth.loginStep;
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "company@gmail.com",
    password: "",
    mfaToken: "",
  });
  const [trustDevice, setTrustDevice] = useState(false);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate server connection handshake attempt
    setTimeout(() => {
      setIsLoading(false);
      if (isId) {
        toast.error("Koneksi Gagal: Server Backend ColonyAI sedang dalam tahap maintenance untuk kompetisi AI Open.", {
          duration: 7000,
          description: "Silakan hubungi Administrator Teknis di 0813-948-290 jika Anda memerlukan akses demo khusus.",
        });
      } else {
        toast.error("Connection Failed: The ColonyAI Backend Server is under maintenance for the AI Open competition.", {
          duration: 7000,
          description: "Please contact Technical Support at +62 813-948-290 if you require dedicated demo access.",
        });
      }
    }, 1200);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await auth.verifyMfa(formData.mfaToken, trustDevice);
      window.location.href = "/dashboard";
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans selection:bg-[#0055ff] selection:text-white overflow-x-hidden transition-colors duration-300">
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-12 lg:px-24 bg-[#f8faff] dark:bg-slate-900 pt-32 pb-24 transition-colors duration-300">
        <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="bg-white dark:bg-slate-950 p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-slate-800 rounded-none relative transition-colors duration-300">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]" />

            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-black text-[#1a237e] dark:text-[#00f2ff] uppercase tracking-widest">
                  {loginStep === "credentials"
                    ? "User Authentication"
                    : "Two-Factor Verification"}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                  Authorized Laboratory Portal Access
                </p>
              </div>

              {/* Premium Maintenance & AI Open Info Alert */}
              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex gap-3 animate-pulse rounded-none">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider leading-none">
                    {isId ? "Pemeliharaan Node Server" : "Server Maintenance Node"}
                  </p>
                  <p className="text-[10px] font-medium text-amber-700/90 dark:text-amber-500/80 leading-relaxed uppercase">
                    {isId 
                      ? "Aplikasi ini disiapkan untuk kompetisi AI Open Innovation 2026. Saat ini server backend sedang dalam tahap pemeliharaan (maintenance)."
                      : "This app is prepared for the AI Open Innovation 2026 competition. Currently, the backend server is undergoing maintenance."}
                  </p>
                </div>
              </div>

              {loginStep === "credentials" ? (
                <form onSubmit={handleInitialSubmit} className="space-y-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0055ff] dark:focus:border-[#00f2ff] transition-all"
                          placeholder="company@gmail.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          Security Password
                        </label>
                        <Link
                          href="/forgot-password"
                          title="Reset your security password"
                          className="text-[9px] font-black text-[#0055ff] dark:text-[#00f2ff] uppercase tracking-widest hover:underline"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0055ff] dark:focus:border-[#00f2ff] transition-all"
                          placeholder="••••••••••••••••••••••••••"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#0055ff] dark:hover:text-[#00f2ff]"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-gradient-to-r from-[#0055ff] to-[#00f2ff] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Login Portal <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleFinalSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] block text-center">
                      Enter 6-Digit MFA Token
                    </label>
                    <input
                      type="tel"
                      maxLength={6}
                      className="w-full h-16 bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 text-center text-3xl font-black text-[#0055ff] dark:text-[#00f2ff] tracking-[0.5em] focus:outline-none focus:border-[#0055ff] dark:focus:border-[#00f2ff] transition-all"
                      placeholder="000000"
                      value={formData.mfaToken}
                      onChange={(e) =>
                        setFormData({ ...formData, mfaToken: e.target.value })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-[#0055ff] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#0055ff]/80 transition-all flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Verify Identity"
                    )}
                  </button>
                </form>
              )}

              {/* ── Security Info (Inside Box) ── */}
              <div className="pt-8 border-t border-slate-100 dark:border-slate-900 space-y-4">
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed text-center lg:text-center">
                  This portal is protected by encryption and ISO-17025 security
                  protocols. Unauthorized access attempts will be logged and
                  reported to the system sentinel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

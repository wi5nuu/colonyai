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
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslationStore } from "@/lib/i18n/store";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function LoginPage() {
  const { t } = useTranslationStore();
  const auth = useAuthStore();
  const loginStep = auth.loginStep;
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "manager@mitrakeluarga.com",
    password: "",
    mfaToken: "",
  });
  const [trustDevice, setTrustDevice] = useState(false);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await auth.login(formData.email, formData.password);
      if (result?.mfa_required) {
        toast.info("MFA Required");
        setFormData(prev => ({ ...prev, password: "" }));
        setIsLoading(false);
      } else {
        toast.success("Login Successful");
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      setIsLoading(false);
    }
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
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-[#0055ff] selection:text-white overflow-x-hidden">
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-12 lg:px-24 bg-[#f8faff] pt-32 pb-24">
        <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="bg-white p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 rounded-none relative">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-[#1a237e]" />
               
               <div className="space-y-8">
                  <div className="text-center">
                     <h2 className="text-2xl font-black text-[#1a237e] uppercase tracking-widest">
                        {loginStep === "credentials" ? "User Authentication" : "Two-Factor Verification"}
                     </h2>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized Laboratory Portal Access</p>
                  </div>

                  {loginStep === "credentials" ? (
                    <form onSubmit={handleInitialSubmit} className="space-y-6">
                       <div className="space-y-5">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                             <div className="relative">
                                <input 
                                   type="email" 
                                   required 
                                   className="w-full h-14 bg-slate-50 border-b-2 border-slate-200 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#1a237e] transition-all"
                                   placeholder="manager@mitrakeluarga.com"
                                   value={formData.email}
                                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Password</label>
                                <Link href="/forgot-password" title="Reset your security password" className="text-[9px] font-black text-[#0055ff] uppercase tracking-widest hover:underline">Forgot?</Link>
                             </div>
                             <div className="relative">
                                <input 
                                   type={showPassword ? "text" : "password"} 
                                   required 
                                   className="w-full h-14 bg-slate-50 border-b-2 border-slate-200 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#1a237e] transition-all"
                                   placeholder="••••••••••••••••••••••••••"
                                   value={formData.password}
                                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button 
                                   type="button" 
                                   onClick={() => setShowPassword(!showPassword)}
                                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#1a237e]"
                                >
                                   {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                             </div>
                          </div>
                       </div>
                       <button 
                          type="submit" 
                          disabled={isLoading}
                          className="w-full h-14 bg-[#1a237e] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#0055ff] transition-all active:scale-[0.98] shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3"
                       >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Login Portal <ArrowRight className="w-4 h-4" /></>}
                       </button>
                    </form>
                  ) : (
                    <form onSubmit={handleFinalSubmit} className="space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block text-center">Enter 6-Digit MFA Token</label>
                          <input 
                             type="tel" 
                             maxLength={6} 
                             className="w-full h-16 bg-slate-50 border-b-2 border-slate-200 text-center text-3xl font-black text-[#1a237e] tracking-[0.5em] focus:outline-none focus:border-emerald-500 transition-all"
                             placeholder="000000"
                             value={formData.mfaToken}
                             onChange={(e) => setFormData({ ...formData, mfaToken: e.target.value })}
                          />
                       </div>
                       <button 
                          type="submit" 
                          disabled={isLoading}
                          className="w-full h-14 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                       >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Identity"}
                       </button>
                    </form>
                  )}

                  {/* ── Security Info (Inside Box) ── */}
                  <div className="pt-8 border-t border-slate-100 space-y-4">
                     <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 w-fit mx-auto lg:mx-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">End-to-End Encrypted Portal</span>
                     </div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed text-center lg:text-left">
                        This portal is protected by military-grade encryption and ISO-17025 security protocols. 
                        Unauthorized access attempts will be logged and reported to the system sentinel.
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

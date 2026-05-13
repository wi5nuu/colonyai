"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Lock,
  Loader2,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
  Key,
  Clock,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useTranslationStore } from "@/lib/i18n/store";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function ResetPasswordPage() {
  const { t } = useTranslationStore();
  const router = useRouter();
  const [step, setStep] = useState<"input-token" | "set-password" | "success">(
    "input-token",
  );
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Verify token (frontend check)
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error("Please enter the recovery token");
      return;
    }
    setStep("set-password");
  };

  // Step 2: Submit new password with token
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 12) {
      toast.error("Password must be at least 12 characters");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/api/v1/auth/reset-password", {
        token: token.trim(),
        new_password: formData.password,
      });
      setStep("success");
      toast.success("Security credentials updated");
      setTimeout(() => router.push("/login"), 3000);
    } catch (error: any) {
      const detail = error.response?.data?.detail || "Invalid or expired token";
      toast.error(detail);
      if (detail.includes("expired") || detail.includes("Invalid")) {
        setStep("input-token");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-[#0055ff] selection:text-white overflow-x-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-12 lg:px-24 bg-[#f8faff] pt-32 pb-24">
        <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="bg-white p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 rounded-none relative">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-[#1a237e]" />
               
               <div className="space-y-8">
                  {step === "success" ? (
                    <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                       <div className="flex justify-center">
                          <div className="w-20 h-20 bg-emerald-50 rounded-none flex items-center justify-center border border-emerald-100">
                             <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <h3 className="text-xl font-black text-[#1a237e] uppercase tracking-widest">
                             System Updated
                          </h3>
                          <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed tracking-wider">
                             Security credentials have been successfully reset. <br />
                             Redirecting to portal...
                          </p>
                       </div>
                       <Link 
                          href="/login" 
                          className="w-full h-14 bg-[#1a237e] text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl"
                       >
                          Login Now <ArrowRight className="w-4 h-4" />
                       </Link>
                    </div>
                  ) : (
                    <>
                      <div className="text-center">
                         <h2 className="text-2xl font-black text-[#1a237e] uppercase tracking-widest">
                            {step === "input-token" ? "Verify Token" : "Set New Password"}
                         </h2>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {step === "input-token" ? "Industrial recovery protocol" : "Authorized credential update"}
                         </p>
                      </div>

                      {step === "input-token" ? (
                        <form onSubmit={handleTokenSubmit} className="space-y-6">
                           <div className="space-y-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recovery Token</label>
                                 <div className="relative">
                                    <input 
                                       type="text" 
                                       required 
                                       autoFocus
                                       className="w-full h-14 bg-slate-50 border-b-2 border-slate-200 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#1a237e] transition-all font-mono tracking-widest"
                                       placeholder="Enter 32-character token"
                                       value={token}
                                       onChange={(e) => setToken(e.target.value)}
                                    />
                                    <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                 </div>
                              </div>
                              <div className="bg-amber-50 border border-amber-100 p-4 flex items-start gap-3">
                                 <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                 <p className="text-[10px] text-amber-700 leading-relaxed font-bold uppercase tracking-wider">
                                    Tokens are single-use and expire within 24 hours of admin verification.
                                 </p>
                              </div>
                           </div>
                           <button 
                              type="submit" 
                              className="w-full h-14 bg-[#1a237e] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#0055ff] transition-all flex items-center justify-center gap-3 shadow-xl"
                           >
                              Verify Identity <Shield className="w-4 h-4" />
                           </button>
                        </form>
                      ) : (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                           <div className="space-y-5">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Security Password</label>
                                 <div className="relative">
                                    <input 
                                       type={showPassword ? "text" : "password"} 
                                       required 
                                       className="w-full h-14 bg-slate-50 border-b-2 border-slate-200 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#1a237e] transition-all"
                                       placeholder="••••••••••••••••••••••••"
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
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                 <div className="relative">
                                    <input 
                                       type={showConfirm ? "text" : "password"} 
                                       required 
                                       className="w-full h-14 bg-slate-50 border-b-2 border-slate-200 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#1a237e] transition-all"
                                       placeholder="••••••••••••••••••••••••"
                                       value={formData.confirmPassword}
                                       onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                    <button 
                                       type="button" 
                                       onClick={() => setShowConfirm(!showConfirm)}
                                       className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#1a237e]"
                                    >
                                       {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                              {[
                                 { label: "12+ Characters", ok: formData.password.length >= 12 },
                                 { label: "Uppercase", ok: /[A-Z]/.test(formData.password) },
                                 { label: "Number", ok: /[0-9]/.test(formData.password) },
                                 { label: "Symbol", ok: /[!@#$%^&*]/.test(formData.password) },
                              ].map((req, i) => (
                                 <div key={i} className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${req.ok ? "text-emerald-500" : "text-slate-300"}`}>
                                    <div className={`w-1.5 h-1.5 ${req.ok ? "bg-emerald-500" : "bg-slate-200"}`} />
                                    {req.label}
                                 </div>
                              ))}
                           </div>

                           <div className="flex gap-3">
                              <button 
                                 type="button" 
                                 onClick={() => setStep("input-token")}
                                 className="w-14 h-14 bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#1a237e] transition-colors"
                              >
                                 <ArrowLeft className="w-5 h-5" />
                              </button>
                              <button 
                                 type="submit" 
                                 disabled={isLoading}
                                 className="flex-1 h-14 bg-[#1a237e] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#0055ff] transition-all flex items-center justify-center gap-3 shadow-xl"
                              >
                                 {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Update Password <ShieldCheck className="w-4 h-4" /></>}
                              </button>
                           </div>
                        </form>
                      )}
                    </>
                  )}

                  {/* ── Security Info ── */}
                  <div className="pt-8 border-t border-slate-100 space-y-4">
                     <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 w-fit mx-auto">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Encrypted Credential Sync</span>
                     </div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed text-center">
                        All password updates are logged and encrypted. ISO-17025 standards require robust authentication for laboratory personnel.
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

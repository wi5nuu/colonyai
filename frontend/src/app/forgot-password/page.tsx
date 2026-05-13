"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Lock,
  ShieldCheck,
  ArrowRight,
  Key
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useTranslationStore } from "@/lib/i18n/store";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function ForgotPasswordPage() {
  const { t } = useTranslationStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/api/v1/auth/forgot-password", { email });
      setIsSent(true);
      toast.success(t("auth.resetLinkSent") || "Reset link sent");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Error sending link");
    } finally {
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
                  {!isSent ? (
                    <>
                      <div className="text-center">
                         <h2 className="text-2xl font-black text-[#1a237e] uppercase tracking-widest">
                            {t("auth.forgotTitle") || "Reset Security"}
                         </h2>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Industrial Access Recovery</p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                         <div className="space-y-4">
                            <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider text-center">
                               {t("auth.forgotSubtitle") || "Enter your registered email to receive a secure recovery link."}
                            </p>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Email</label>
                               <div className="relative">
                                  <input 
                                     type="email" 
                                     required 
                                     className="w-full h-14 bg-slate-50 border-b-2 border-slate-200 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#1a237e] transition-all"
                                     placeholder={t("auth.emailPlaceholder") || "your-email@lab.diag"}
                                     value={email}
                                     onChange={(e) => setEmail(e.target.value)}
                                  />
                                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                               </div>
                            </div>
                         </div>
                         
                         <div className="space-y-4">
                            <button 
                               type="submit" 
                               disabled={isLoading}
                               className="w-full h-14 bg-[#1a237e] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#0055ff] transition-all active:scale-[0.98] shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3"
                            >
                               {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Recovery Link <Lock className="w-4 h-4" /></>}
                            </button>
                            <Link 
                               href="/login" 
                               className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#1a237e] transition-colors"
                            >
                               <ArrowLeft className="w-3.5 h-3.5" /> Back to Authentication
                            </Link>
                         </div>
                      </form>
                    </>
                  ) : (
                    <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                       <div className="flex justify-center">
                          <div className="w-20 h-20 bg-emerald-50 rounded-none flex items-center justify-center border border-emerald-100">
                             <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <h3 className="text-xl font-black text-[#1a237e] uppercase tracking-widest">
                             {t("auth.requestSent") || "Protocol Initiated"}
                          </h3>
                          <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed tracking-wider">
                             Secure recovery link dispatched to: <br />
                             <span className="text-[#0055ff]">{email}</span>
                          </p>
                       </div>
                       <div className="p-5 bg-slate-50 border border-slate-100 space-y-4">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                             Please check your inbox and spam folder. The recovery token expires in 24 hours.
                          </p>
                          <Link 
                             href="/reset-password" 
                             className="w-full h-12 bg-[#1a237e] text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0055ff] transition-colors shadow-lg"
                          >
                             Enter Verification Token <Key className="w-4 h-4" />
                          </Link>
                          <Link 
                             href="/login" 
                             className="w-full h-12 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                          >
                             Back to Login <ArrowRight className="w-4 h-4" />
                          </Link>
                       </div>
                    </div>
                  )}

                  {/* ── Security Info ── */}
                  <div className="pt-8 border-t border-slate-100 space-y-4">
                     <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 w-fit mx-auto">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Authorized Identity Recovery</span>
                     </div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed text-center">
                        Identity verification is handled via ISO-17025 compliant secure channels. 
                        Multi-factor authentication may be required for password reset.
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

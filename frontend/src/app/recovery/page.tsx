"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Mail,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useTranslationStore } from "@/lib/i18n/store";

export default function RecoveryPage() {
  const { t } = useTranslationStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Menghubungi API forgot-password yang sudah kita siapkan di backend
      await api.post("/api/v1/auth/forgot-password", { email });
      setIsSent(true);
      toast.success(t("auth.resetLinkSent"));
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t("auth.forgotError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c10] font-sans p-4 sm:p-6 overflow-x-hidden">
      {/* Visual Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[450px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
        <div className="text-center space-y-6">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 shadow-[0_0_50px_-12px_rgba(var(--primary-rgb),0.3)]">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                {t("auth.recoveryTitle")}
              </h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                {t("auth.recoverySubtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#12141c]/80 backdrop-blur-xl border border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed font-medium text-center px-4">
                  {t("auth.forgotSubtitle")}
                </p>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                    {t("auth.registeredEmailLabel")}
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within/input:text-primary transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      className="w-full h-14 bg-[#0a0c10] border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      placeholder={t("auth.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />{" "}
                      {t("common.processing")}
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" /> {t("auth.recoveryButton")}
                    </>
                  )}
                </button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> {t("auth.backToLogin")}
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-8 py-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white">
                  {t("auth.requestSent")}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {t("auth.recoveryEmailSent")} <strong>{email}</strong>{" "}
                  {t("auth.recoveryEmailSentCont")}
                </p>
              </div>
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3 text-left">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-200/60 leading-relaxed font-bold">
                  {t("auth.checkSpam")}
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
              >
                {t("auth.backToLogin")}
              </Link>
            </div>
          )}
        </div>

        <div className="text-center space-y-4 pb-8">
          <div className="p-6 bg-slate-900/50 border border-white/5 rounded-3xl space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {t("auth.masterAdmin")}
            </p>
            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
              {t("auth.adminContactDesc")}{" "}
              <span className="text-primary font-bold">
                {t("auth.globalNexusSupport")}
              </span>{" "}
              {t("auth.at")}{" "}
              <span className="text-white font-black underline decoration-primary">
                support@colonyai.diag
              </span>{" "}
              {t("auth.forManualVerification")}.
            </p>
          </div>
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">
            {t("auth.secureCore")}
          </p>
        </div>
      </div>
    </div>
  );
}

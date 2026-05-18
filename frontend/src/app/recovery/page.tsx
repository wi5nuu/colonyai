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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 font-sans p-4 sm:p-6 overflow-x-hidden transition-colors duration-300">
      {/* Visual Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0055ff]/5 dark:bg-[#00f2ff]/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[450px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
        <div className="text-center space-y-6">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-md">
              <Shield className="w-10 h-10 text-[#0055ff] dark:text-[#00f2ff]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-[#1a237e] dark:text-white tracking-tighter uppercase leading-none">
                {t("auth.recoveryTitle")}
              </h2>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">
                {t("auth.recoverySubtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950/80 backdrop-blur-xl border border-slate-100 dark:border-slate-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group transition-colors duration-300">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]" />

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-center px-4">
                  {t("auth.forgotSubtitle")}
                </p>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 ml-1">
                    {t("auth.registeredEmailLabel")}
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-[#0055ff] dark:group-focus-within/input:text-[#00f2ff] transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      className="w-full h-14 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#0055ff] dark:focus:border-[#00f2ff] outline-none transition-all"
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
                  className="w-full h-14 bg-gradient-to-r from-[#0055ff] to-[#00f2ff] text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
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
                  className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-405 dark:text-slate-500 uppercase tracking-widest hover:text-[#0055ff] dark:hover:text-[#00f2ff] transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> {t("auth.backToLogin")}
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-8 py-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-900/35">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-[#1a237e] dark:text-white uppercase tracking-widest">
                  {t("auth.requestSent")}
                </h3>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-medium">
                  {t("auth.recoveryEmailSent")} <strong>{email}</strong>{" "}
                  {t("auth.recoveryEmailSentCont")}
                </p>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/35 rounded-2xl flex items-start gap-3 text-left">
                <Mail className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed font-bold">
                  {t("auth.checkSpam")}
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[10px] font-black text-[#0055ff] dark:text-[#00f2ff] uppercase tracking-widest hover:underline"
              >
                {t("auth.backToLogin")}
              </Link>
            </div>
          )}
        </div>

        <div className="text-center space-y-4 pb-8">
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {t("auth.masterAdmin")}
            </p>
            <p className="text-[11px] text-slate-550 dark:text-slate-400 font-medium leading-relaxed">
              {t("auth.adminContactDesc")}{" "}
              <span className="text-[#0055ff] dark:text-[#00f2ff] font-bold">
                {t("auth.globalNexusSupport")}
              </span>{" "}
              {t("auth.at")}{" "}
              <span className="text-slate-900 dark:text-white font-black underline decoration-[#0055ff]">
                support@colonyai.diag
              </span>{" "}
              {t("auth.forManualVerification")}.
            </p>
          </div>
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            {t("auth.secureCore")}
          </p>
        </div>
      </div>
    </div>
  );
}

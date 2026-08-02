"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslationStore } from "@/lib/i18n/store";

import { Footer } from "@/components/Footer";

export default function LoginPage() {
  const { t } = useTranslationStore();
  const auth = useAuthStore();
  const loginStep = auth.loginStep;
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mfaToken: "",
  });
  const [trustDevice, setTrustDevice] = useState(false);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await auth.login(formData.email, formData.password);
      setIsLoading(false);
      if (result && !result.mfa_required) {
        toast.success(t("auth.loginSuccess"));
        window.location.href = "/dashboard";
      }
    } catch (error) {
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
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
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans selection:bg-[#0055ff] selection:text-white overflow-x-hidden transition-colors duration-300">
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-12 lg:px-24 bg-[#f8faff] dark:bg-slate-900 pt-32 pb-24 transition-colors duration-300">
        <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="bg-white dark:bg-slate-950 p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-slate-800 rounded-none relative transition-colors duration-300">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]" />

            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-black text-[#1a237e] dark:text-[#00f2ff] uppercase tracking-widest">
                  {loginStep === "credentials"
                    ? t("auth.loginTitle")
                    : t("auth.mfaTitle")}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                  {loginStep === "credentials"
                    ? t("auth.loginSubtitle")
                    : t("auth.mfaBadge")}
                </p>
              </div>

              {loginStep === "credentials" ? (
                <form onSubmit={handleInitialSubmit} className="space-y-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                        {t("auth.email")}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0055ff] dark:focus:border-[#00f2ff] transition-all"
                          placeholder={t("auth.emailPlaceholder")}
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
                          {t("auth.password")}
                        </label>
                        <Link
                          href="/forgot-password"
                          title={t("auth.forgotPassword")}
                          className="text-[9px] font-black text-[#0055ff] dark:text-[#00f2ff] uppercase tracking-widest hover:underline"
                        >
                          {t("auth.forgotPassword")}
                        </Link>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0055ff] dark:focus:border-[#00f2ff] transition-all"
                          placeholder={t("auth.passwordPlaceholder")}
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
                        {t("auth.loginButton")} <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleFinalSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] block text-center">
                      {t("auth.mfaLabel")}
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
                      t("auth.mfaSubmit")
                    )}
                  </button>
                </form>
              )}

              <div className="pt-8 border-t border-slate-100 dark:border-slate-900 space-y-4">
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed text-center lg:text-center">
                  {t("auth.portalBadge")}
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

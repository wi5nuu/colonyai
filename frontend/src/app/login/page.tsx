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
  Info,
} from "lucide-react";
import { SecurityHeader } from "@/components/SecurityHeader";
import { SecurityFooter } from "@/components/SecurityFooter";

import { useAuthStore } from "@/lib/auth-store";
import { useTranslationStore } from "@/lib/i18n/store";

export default function LoginPage() {
  const { t } = useTranslationStore();
  const [lang, setLang] = useState<"ID" | "EN">("ID");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<"credentials" | "mfa">(
    "credentials",
  );
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mfaToken: "",
  });

  useEffect(() => {
    // Initial check
    const saved = localStorage.getItem("colony_lang") as "ID" | "EN";
    if (saved) setLang(saved);

    // Listen for changes from SecurityHeader
    const handleLangChange = () => {
      const updated = localStorage.getItem("colony_lang") as "ID" | "EN";
      if (updated) setLang(updated);
    };

    window.addEventListener("langChange", handleLangChange);
    return () => window.removeEventListener("langChange", handleLangChange);
  }, []);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setLoginStep("mfa");
      setIsLoading(false);
    }, 1500);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Connect to the real backend using the provided credentials
      // The MFA token is currently a UI simulation, but the core auth needs a real JWT
      await useAuthStore.getState().login(formData.email, formData.password);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
      // Error toast is already handled by authStore
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans selection:bg-[#00f2ff] selection:text-slate-900 overflow-x-hidden">
      <SecurityHeader />

      <main className="flex-1 relative flex flex-col lg:flex-row">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0055ff] to-[#00f2ff] fixed">
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          </div>
          <div className="absolute top-[-10%] left-[-10%] w-[100%] lg:w-[50%] h-[50%] lg:h-[70%] bg-white/10 rounded-full blur-[80px] lg:blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[100%] lg:w-[50%] h-[50%] lg:h-[70%] bg-white/10 rounded-full blur-[80px] lg:blur-[120px]" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center p-6 sm:p-10 lg:p-24 space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="space-y-4 lg:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full mb-2 lg:mb-4">
              <ShieldCheck className="w-3 h-3 text-[#00f2ff]" />
              <span className="text-[8px] lg:text-[9px] font-black text-white uppercase tracking-[0.2em]">
                {t("auth.portalBadge")}
              </span>
            </div>

            <div className="space-y-1 lg:space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-medium text-white tracking-tight leading-tight lg:leading-[1.1]">
                {t("auth.heroTitle1")} <br className="hidden sm:block" />
                <span className="text-white/60">{t("auth.heroTitle2")}</span>
              </h1>
              <p className="text-[10px] sm:text-sm lg:text-base font-bold text-[#00f2ff] tracking-[0.2em] lg:tracking-[0.3em] uppercase pt-1 lg:pt-2">
                {t("auth.heroSubtitle")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8 w-full max-w-3xl">
            {[
              {
                title: t("auth.feat1Title"),
                desc: t("auth.feat1Desc"),
                icon: (
                  <Info className="w-3.5 h-3.5 lg:w-4 h-4 text-[#00f2ff]" />
                ),
              },
              {
                title: t("auth.feat2Title"),
                desc: t("auth.feat2Desc"),
                icon: (
                  <ShieldCheck className="w-3.5 h-3.5 lg:w-4 h-4 text-[#00f2ff]" />
                ),
              },
              {
                title: t("auth.feat3Title"),
                desc: t("auth.feat3Desc"),
                icon: (
                  <Lock className="w-3.5 h-3.5 lg:w-4 h-4 text-[#00f2ff]" />
                ),
              },
              {
                title: t("auth.feat4Title"),
                desc: t("auth.feat4Desc"),
                icon: (
                  <Mail className="w-3.5 h-3.5 lg:w-4 h-4 text-[#00f2ff]" />
                ),
              },
            ].map((item, i) => (
              <div
                key={i}
                className="space-y-1 lg:space-y-2 bg-white/5 lg:bg-transparent p-4 lg:p-0 rounded-2xl lg:rounded-none border border-white/5 lg:border-none"
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <h3 className="text-[10px] lg:text-xs font-black text-white uppercase tracking-widest">
                    {item.title}
                  </h3>
                </div>
                <p className="text-[9px] lg:text-[11px] font-medium text-white/50 leading-relaxed uppercase tracking-wider">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 w-full lg:w-[540px] flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-10 lg:py-0 animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="relative w-full max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[30px] lg:rounded-[40px] overflow-hidden shadow-2xl relative">
              <div className="h-1.5 lg:h-2 w-full bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 opacity-90 shadow-[0_4px_20px_rgba(234,88,12,0.4)]" />

              <div className="p-8 sm:p-10 lg:p-12">
                <div className="text-center mb-8 lg:mb-10">
                  <h2 className="text-xl lg:text-2xl font-black text-white uppercase tracking-[0.2em]">
                    {t("auth.loginTitle")}
                  </h2>
                </div>

                {loginStep === "credentials" ? (
                  <form
                    onSubmit={handleInitialSubmit}
                    className="space-y-6 lg:space-y-8"
                  >
                    <div className="space-y-5 lg:space-y-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] lg:text-[11px] font-black text-white uppercase tracking-widest ml-1">
                          {t("auth.email")}
                        </label>
                        <input
                          type="email"
                          required
                          placeholder={t("auth.emailPlaceholder")}
                          className="w-full h-12 lg:h-14 bg-white rounded-xl lg:rounded-2xl px-5 lg:px-6 text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all appearance-none"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] lg:text-[11px] font-black text-white uppercase tracking-widest ml-1">
                          {t("auth.password")}
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder={t("auth.passwordPlaceholder")}
                            className="w-full h-12 lg:h-14 bg-white rounded-xl lg:rounded-2xl px-5 lg:px-6 text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all appearance-none"
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
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="flex justify-end pt-1">
                          <Link
                            href="/troubleshoot"
                            className="text-[9px] lg:text-[10px] font-black text-white/80 hover:text-white uppercase tracking-widest"
                          >
                            {t("auth.forgotPassword")}
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 lg:pt-6">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 sm:h-14 bg-white hover:bg-slate-50 text-slate-600 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl transition-all active:scale-[0.97] flex items-center justify-center gap-3"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          t("auth.loginButton")
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form
                    onSubmit={handleFinalSubmit}
                    className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <div className="space-y-6 lg:space-y-8">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 lg:p-5 rounded-[20px] lg:rounded-3xl flex items-center gap-4">
                        <ShieldCheck className="w-5 h-5 lg:w-6 h-6 text-emerald-400" />
                        <p className="text-[9px] lg:text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-tight">
                          {t("auth.mfaBadge")}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-white uppercase tracking-[0.3em] block text-center">
                          {t("auth.mfaLabel")}
                        </label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          required
                          autoFocus
                          maxLength={6}
                          className="w-full h-14 lg:h-16 bg-white rounded-xl lg:rounded-2xl text-center text-2xl lg:text-3xl font-mono font-black text-slate-900 tracking-[0.5em] focus:ring-4 focus:ring-white/20 outline-none transition-all appearance-none"
                          placeholder="000000"
                          value={formData.mfaToken}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              mfaToken: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 lg:gap-4">
                      <button
                        type="button"
                        onClick={() => setLoginStep("credentials")}
                        className="w-14 lg:w-16 h-12 lg:h-14 bg-white/10 border border-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center text-white hover:bg-white/20"
                      >
                        <ArrowRight className="w-5 h-5 rotate-180" />
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-12 lg:h-14 bg-white hover:bg-slate-50 text-slate-600 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl transition-all active:scale-[0.97] flex items-center justify-center gap-3"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          t("auth.mfaSubmit")
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <SecurityFooter />
    </div>
  );
}

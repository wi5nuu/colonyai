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
  FlaskConical,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useTranslationStore } from "@/lib/i18n/store";

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
          <div className="inline-flex flex-col items-center gap-3 sm:gap-4 group">
            <img
              src="/android-chrome-512x512.png"
              alt="ColonyAI Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase leading-none">
                ColonyAI
              </h2>
              <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                {t("auth.forgotTitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#12141c]/80 backdrop-blur-xl border border-white/5 p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
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

              <div className="space-y-4 text-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-10 h-12 bg-primary hover:bg-primary/90 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-xl inline-flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />{" "}
                      {t("common.processing")}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> {t("auth.sendResetLink")}
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    {t("auth.or")}
                  </span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                {/* Link ke reset-password jika sudah punya token */}
                <div className="flex flex-col items-center gap-4 pt-2">
                  <Link
                    href="/reset-password"
                    className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline transition-colors"
                  >
                    {t("auth.alreadyHaveToken")}
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" /> {t("auth.backToLogin")}
                  </Link>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-6 py-2">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-[#12141c]">
                    <Lock className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>

              {/* Main Message */}
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white tracking-tight">
                  {t("auth.requestSent")}
                </h3>
                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                  {t("auth.requestSentDesc")}{" "}
                  <span className="text-primary font-black">{email}</span>
                </p>
              </div>

              {/* 24h Process Timeline */}
              <div className="text-left space-y-0 border border-white/5 rounded-2xl overflow-hidden">
                {[
                  {
                    step: "01",
                    status: "done",
                    label: t("auth.timelineStep1Label"),
                    desc: t("auth.timelineStep1Desc"),
                  },
                  {
                    step: "02",
                    status: "active",
                    label: t("auth.timelineStep2Label"),
                    desc: t("auth.timelineStep2Desc"),
                  },
                  {
                    step: "03",
                    status: "pending",
                    label: t("auth.timelineStep3Label"),
                    desc: t("auth.timelineStep3Desc"),
                  },
                  {
                    step: "04",
                    status: "pending",
                    label: t("auth.timelineStep4Label"),
                    desc: t("auth.timelineStep4Desc"),
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-4 px-5 py-4 ${i < 3 ? "border-b border-white/5" : ""} ${item.status === "active" ? "bg-primary/5" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 ${
                        item.status === "done"
                          ? "bg-emerald-500 text-white"
                          : item.status === "active"
                            ? "bg-primary text-white animate-pulse"
                            : "bg-white/5 text-slate-500"
                      }`}
                    >
                      {item.status === "done" ? "✓" : item.step}
                    </div>
                    <div>
                      <p
                        className={`text-xs font-black uppercase tracking-widest mb-0.5 ${
                          item.status === "done"
                            ? "text-emerald-500"
                            : item.status === "active"
                              ? "text-primary"
                              : "text-slate-600"
                        }`}
                      >
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning Note */}
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3 text-left">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-amber-200/80 uppercase tracking-widest">
                    {t("auth.important")}
                  </p>
                  <p className="text-[11px] text-amber-200/60 leading-relaxed">
                    {t("auth.warningText")}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 text-center pt-2">
                <Link
                  href="/reset-password"
                  className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline transition-colors block"
                >
                  {t("auth.alreadyHaveToken")}
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-10 h-12 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[11px] font-black text-slate-400 uppercase tracking-widest transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> {t("auth.backToLogin")}
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="text-center space-y-4 pb-8">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {t("auth.masterAdmin")}
          </p>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
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
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] mt-8">
            {t("auth.secureCore")}
          </p>
        </div>
      </div>
    </div>
  );
}

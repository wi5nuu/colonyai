"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  Loader2,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
  Key,
  AlertTriangle,
  ChevronRight,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useTranslationStore } from "@/lib/i18n/store";

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

  // Step 1: Verify token
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error(t("auth.tokenEmpty"));
      return;
    }
    setStep("set-password");
  };

  // Step 2: Submit new password with token
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }
    if (formData.password.length < 12) {
      toast.error(t("auth.passwordMinLength"));
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/api/v1/auth/reset-password", {
        token: token.trim(),
        new_password: formData.password,
      });
      setStep("success");
      toast.success(t("auth.passwordResetSuccess"));
      setTimeout(() => router.push("/login"), 3000);
    } catch (error: any) {
      const detail = error.response?.data?.detail || t("auth.invalidToken");
      toast.error(detail);
      if (detail.includes("expired") || detail.includes("Invalid")) {
        setStep("input-token");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-white text-slate-900 flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Main Content ── */}
      <div className="max-w-[420px] mx-auto px-4 py-10 sm:py-16 w-full flex-1 flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {step === "success" ? (
          <div className="w-full space-y-6 text-center py-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-black text-slate-900">
                {t("auth.passwordUpdated")}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                {t("auth.redirectingToLogin")}
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full h-9 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-700"
            >
              {t("auth.loginNow")}
            </Link>
          </div>
        ) : (
          <div className="w-full space-y-8">
            {/* Page Title */}
            <div className="border-b border-slate-200 pb-5 space-y-1">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {step === "input-token"
                  ? t("auth.verifyResetToken")
                  : t("auth.setNewPassword")}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                {step === "input-token"
                  ? t("auth.enterAdminToken")
                  : t("auth.createStrongPassword")}
              </p>
            </div>

            {/* Form */}
            {step === "input-token" ? (
              <form onSubmit={handleTokenSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 px-0.5">
                    {t("auth.resetToken")}
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                    <input
                      type="text"
                      required
                      autoFocus
                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded pl-9 pr-3 text-[11px] font-mono font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-700 focus:outline-none transition-all"
                      placeholder={t("auth.enterTokenPlaceholder")}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded flex items-start gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                    {t("auth.tokenExpiryWarning")}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full h-9 bg-slate-900 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5" /> {t("auth.verifyToken")}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 px-0.5">
                      {t("auth.newPassword")}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full h-9 bg-slate-50 border border-slate-200 rounded pl-9 pr-10 text-[11px] font-medium text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-700 focus:outline-none transition-all"
                        placeholder={t("auth.minChars")}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 px-0.5">
                      {t("auth.confirmPassword")}
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                      <input
                        type={showConfirm ? "text" : "password"}
                        required
                        className="w-full h-9 bg-slate-50 border border-slate-200 rounded pl-9 pr-10 text-[11px] font-medium text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-700 focus:outline-none transition-all"
                        placeholder={t("auth.repeatPassword")}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirm ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password strength indicators */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-1">
                  {[
                    {
                      label: t("auth.reqMinChars"),
                      ok: formData.password.length >= 12,
                    },
                    {
                      label: t("auth.reqUppercase"),
                      ok: /[A-Z]/.test(formData.password),
                    },
                    {
                      label: t("auth.reqLowercase"),
                      ok: /[a-z]/.test(formData.password),
                    },
                    {
                      label: t("auth.reqNumber"),
                      ok: /[0-9]/.test(formData.password),
                    },
                    {
                      label: t("auth.reqSymbol"),
                      ok: /[!@#$%^&*]/.test(formData.password),
                    },
                  ].map((req, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 text-[9px] font-bold transition-colors ${req.ok ? "text-emerald-500" : "text-slate-400"}`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full ${req.ok ? "bg-emerald-500" : "bg-slate-300"}`}
                      />
                      {req.label}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep("input-token")}
                    className="w-9 h-9 border border-slate-200 rounded flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-9 bg-slate-900 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-all disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                        {t("common.processing")}
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />{" "}
                        {t("auth.updatePassword")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="w-full pt-4 border-t border-slate-100 flex flex-col items-center gap-4">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
            {t("auth.footerCopyright")}
          </p>
        </div>
      </div>
    </div>
  );
}

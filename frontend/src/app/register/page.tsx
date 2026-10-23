"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  User,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslationStore } from "@/lib/i18n/store";
import { Footer } from "@/components/Footer";

export default function RegisterPage() {
  const { t } = useTranslationStore();
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const validatePassword = (password: string) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>\[\]\\/_\-+=~`]/.test(password),
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    validatePassword(newPassword);
  };

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every((valid) => valid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!isPasswordValid()) {
      toast.error("Password does not meet security requirements");
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.email, formData.password, formData.fullName);
      toast.success("Registration successful! Please login.");
      router.push("/login");
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Registration failed";
      toast.error(errorMsg);
    } finally {
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
                  Create Account
                </h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                  Join ColonyAI Platform
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0055ff] dark:focus:border-[#00f2ff] transition-all"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                      />
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0055ff] dark:focus:border-[#00f2ff] transition-all"
                        placeholder="analyst@laboratory.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0055ff] dark:focus:border-[#00f2ff] transition-all"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handlePasswordChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#0055ff] dark:hover:text-[#00f2ff] transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0055ff] dark:focus:border-[#00f2ff] transition-all"
                        placeholder="Re-enter your password"
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
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#0055ff] dark:hover:text-[#00f2ff] transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  {formData.password && (
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 space-y-2 border-l-2 border-[#0055ff] dark:border-[#00f2ff]">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                        <Shield className="w-3 h-3 text-[#0055ff] dark:text-[#00f2ff]" />
                        <span className="text-slate-600 dark:text-slate-400">
                          Password Requirements
                        </span>
                      </div>
                      <ul className="space-y-1 text-[9px] font-medium">
                        <li
                          className={`${
                            passwordValidation.minLength
                              ? "text-green-600 dark:text-green-400"
                              : "text-slate-400"
                          }`}
                        >
                          {passwordValidation.minLength ? "✓" : "○"} At least 8
                          characters
                        </li>
                        <li
                          className={`${
                            passwordValidation.hasUpperCase
                              ? "text-green-600 dark:text-green-400"
                              : "text-slate-400"
                          }`}
                        >
                          {passwordValidation.hasUpperCase ? "✓" : "○"} One
                          uppercase letter
                        </li>
                        <li
                          className={`${
                            passwordValidation.hasLowerCase
                              ? "text-green-600 dark:text-green-400"
                              : "text-slate-400"
                          }`}
                        >
                          {passwordValidation.hasLowerCase ? "✓" : "○"} One
                          lowercase letter
                        </li>
                        <li
                          className={`${
                            passwordValidation.hasNumber
                              ? "text-green-600 dark:text-green-400"
                              : "text-slate-400"
                          }`}
                        >
                          {passwordValidation.hasNumber ? "✓" : "○"} One number
                        </li>
                        <li
                          className={`${
                            passwordValidation.hasSpecialChar
                              ? "text-green-600 dark:text-green-400"
                              : "text-slate-400"
                          }`}
                        >
                          {passwordValidation.hasSpecialChar ? "✓" : "○"} One
                          special character
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isPasswordValid()}
                  className="w-full h-14 bg-gradient-to-r from-[#0055ff] to-[#00f2ff] text-white text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Create Account <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-900 space-y-4">
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed text-center">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-[#0055ff] dark:text-[#00f2ff] hover:underline"
                  >
                    Login here
                  </Link>
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

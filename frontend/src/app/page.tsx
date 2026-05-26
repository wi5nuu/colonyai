"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Users,
  Building2,
  ClipboardCheck,
  Home,
  FlaskConical,
  Image as ImageIcon,
  MessageCircle,
  Phone,
  Clock,
  Activity,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { useTranslationStore } from "@/lib/i18n/store";

export default function LandingPage() {
  const { t } = useTranslationStore();
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* ── Hero Section ────────────────────────────── */}
      <section className="relative h-[580px] lg:h-[620px] overflow-hidden">
        {/* ── Split Background ── */}
        <div className="absolute inset-0 flex">
          {/* Left panel — dark lab photo */}
          <div className="w-[62%] h-full relative">
            <Image
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop"
              alt="Lab Background"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
          </div>
          {/* Right panel — specialist photo */}
          <div className="w-[38%] h-full relative">
            <Image
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000&auto=format&fit=crop"
              alt="Neural Specialist"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#1a237e]/10" />

            {/* ── Siloam-style top labels on right panel ── */}
            <div className="absolute inset-0 flex">
              {/* Left half of right panel */}
              <div className="w-1/2 h-full flex flex-col justify-start pt-8 px-4 items-end">
                <p className="text-white text-right font-black uppercase leading-tight text-sm md:text-lg drop-shadow-lg">
                  MANUAL
                  <br />
                  COLONY
                  <br />
                  COUNTING
                </p>
              </div>
              {/* Diagonal divider */}
              <div className="relative flex items-start pt-6">
                <div className="h-24 w-[3px] bg-white/60 rotate-[15deg] origin-top" />
              </div>
              {/* Right half of right panel */}
              <div className="w-1/2 h-full flex flex-col justify-start pt-8 px-4 items-start">
                <p className="text-white font-black uppercase leading-tight text-sm md:text-lg drop-shadow-lg">
                  AI-POWERED
                  <br />
                  AUTO
                  <br />
                  DETECTION
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content Overlay ── */}
        <div className="max-w-[1500px] mx-auto px-6 relative h-full flex flex-col justify-center pb-[88px] lg:pb-[96px]">
          <div className="max-w-lg space-y-3 mt-24 lg:mt-0">
            <p className="text-white text-sm lg:text-base font-bold drop-shadow-md">
              {t("landing.welcome")} — AI Open Innovation Challenge 2026
            </p>
            <h1 className="text-3xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight drop-shadow-lg uppercase">
              {t("landing.heroTitle")}
              <br />
              {t("landing.heroSubtitle")}
            </h1>
          </div>

          {/* ── Floating Search Widget ── */}
          <div
            className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 shadow-2xl max-w-md w-full mt-32 lg:mt-6 transition-colors duration-300"
            style={{ borderRadius: 0 }}
          >
            <div className="flex items-center gap-4 px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 text-xs font-black uppercase tracking-widest">
                {useTranslationStore.getState().language === "en" ? "Find" : "Cari"}
              </span>
              <div className="flex items-center gap-2">
                {["all", "specimen", "laboratory"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 text-xs font-bold capitalize transition-all border ${
                      activeTab === tab
                        ? "bg-emerald-500 border-emerald-500 text-white shadow"
                        : "border-emerald-500 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-850"
                    }`}
                    style={{ borderRadius: "999px" }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative px-5 py-4 cursor-pointer" data-trigger-search>
              <input
                type="text"
                readOnly
                placeholder={useTranslationStore.getState().language === "en" ? "Type any keyword or press / to search..." : "Ketik kata kunci atau tekan / untuk mencari..."}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm dark:text-white outline-none transition-all pr-10 cursor-pointer"
              />
              <Search className="w-4 h-4 text-slate-450 dark:text-slate-500 absolute right-8 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* ── Bottom Banner (Yellow + Blue, side by side, skewed junction) ── */}
        <div className="absolute bottom-0 left-0 right-0 flex h-20 md:h-24">
          {/* Yellow section */}
          <div
            className="relative bg-[#fbc02d] flex items-center justify-center px-6 md:px-12"
            style={{ width: "42%" }}
          >
            <div className="relative z-20 text-center">
              <h2 className="text-[#1a237e] text-xs md:text-lg font-black leading-tight uppercase">
                {useTranslationStore.getState().language === "en" ? "Validate Colony Count" : "Validasi Jumlah Koloni"} <br className="hidden md:block" />
                {useTranslationStore.getState().language === "en" ? "Before You Submit Results" : "Sebelum Anda Mengirim Hasil"}
              </h2>
              <p className="text-[#1a237e] text-[9px] md:text-sm font-bold mt-0.5">
                {useTranslationStore.getState().language === "en" ? "ISO-17025 Compliant AI Accuracy Verification" : "Verifikasi Akurasi AI Sesuai Standar ISO-17025"}
              </p>
            </div>
            {/* Skew right edge */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-[#fbc02d] translate-x-4 skew-x-[-10deg] z-10" />
          </div>
          {/* Blue section */}
          <div className="flex-1 bg-[#1a237e] flex items-center justify-center px-4">
            <div className="flex items-center gap-2 md:gap-4">
              <div>
                <p className="text-white/60 text-[8px] md:text-xs font-bold uppercase tracking-widest">
                  {useTranslationStore.getState().language === "en" ? "Technical Support & Consultation" : "Dukungan Teknis & Konsultasi"}
                </p>
                <div className="flex items-center gap-1.5 md:gap-3 mt-0.5">
                  <MessageCircle className="w-5 h-5 md:w-8 md:h-8 text-green-400 fill-green-400 flex-shrink-0" />
                  <span className="text-sm md:text-3xl font-black text-white tabular-nums">
                    0813-948-290
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── Stats Bar ── */}
      <section className="py-10 bg-white dark:bg-slate-950 border-b border-slate-50 dark:border-slate-900 overflow-hidden transition-colors duration-300">
        <div className="relative flex overflow-x-hidden">
          <div className="flex animate-marquee whitespace-nowrap items-center gap-12 lg:gap-24">
            {[
              { val: "97K+", label: useTranslationStore.getState().language === "en" ? "Training Instances Dataset" : "Dataset Sampel Pelatihan" },
              {
                val: "5",
                label:
                  useTranslationStore.getState().language === "en" ? "Detection Classes (Colony, Bubble, Dust, Crack, Artifact)" : "Kelas Deteksi (Koloni, Gelembung, Debu, Retakan, Artefak)",
              },
              { val: "ISO", label: useTranslationStore.getState().language === "en" ? "17025 Compliant Audit Standards" : "Standar Audit Kepatuhan 17025" },
              { val: "YOLOv8", label: useTranslationStore.getState().language === "en" ? "Computer Vision Architecture" : "Arsitektur Visi Komputer" },
              { val: "97K+", label: useTranslationStore.getState().language === "en" ? "Training Instances Dataset" : "Dataset Sampel Pelatihan" },
              {
                val: "5",
                label:
                  useTranslationStore.getState().language === "en" ? "Detection Classes (Colony, Bubble, Dust, Crack, Artifact)" : "Kelas Deteksi (Koloni, Gelembung, Debu, Retakan, Artefak)",
              },
              { val: "ISO", label: useTranslationStore.getState().language === "en" ? "17025 Compliant Audit Standards" : "Standar Audit Kepatuhan 17025" },
              { val: "YOLOv8", label: useTranslationStore.getState().language === "en" ? "Computer Vision Architecture" : "Arsitektur Visi Komputer" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-4 flex-shrink-0 ml-12 lg:ml-24"
              >
                <span className="text-3xl lg:text-5xl font-black text-[#1a237e] dark:text-[#00f2ff] tracking-tighter">
                  {stat.val}
                </span>
                <p className="text-[9px] md:text-xs font-bold text-slate-400 dark:text-slate-500 leading-tight uppercase tracking-widest whitespace-normal w-32 md:w-48">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── Center of Neural Excellence ── */}
      <section className="relative py-16 lg:py-24 bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-300">
        {/* Subtle Decorative Background Variations (Petri-dish/Microbial Bubble Aesthetic) */}
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 overflow-hidden">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]" />

          {/* Organic microbial/colony-like bubbles */}
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-emerald-100/30 dark:bg-emerald-950/10 blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#1a237e]/5 dark:bg-[#00f2ff]/5 blur-3xl animate-pulse" style={{ animationDuration: "12s" }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-[#fbc02d]/10 dark:bg-[#fbc02d]/5 blur-3xl animate-pulse" style={{ animationDuration: "10s" }} />

          {/* Floating petri-dish outline rings & colony micro-structures */}
          <svg className="absolute -top-12 -left-12 w-48 h-48 text-[#1a237e]/5 dark:text-[#00f2ff]/5 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="35" className="animate-spin" style={{ transformOrigin: "center", animationDuration: "60s" }} />
            <circle cx="35" cy="40" r="4" fill="currentColor" opacity="0.3" />
            <circle cx="65" cy="55" r="3" fill="currentColor" opacity="0.2" />
            <circle cx="45" cy="65" r="5" fill="currentColor" opacity="0.4" />
          </svg>

          <svg className="absolute bottom-1/4 -right-16 w-64 h-64 text-emerald-500/5 dark:text-emerald-400/5 stroke-current" fill="none" strokeWidth="1" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" />
            <circle cx="50" cy="50" r="42" strokeDasharray="1 5" />
            <circle cx="50" cy="50" r="28" className="animate-spin" style={{ transformOrigin: "center", animationDuration: "40s" }} />
            <circle cx="45" cy="40" r="2" fill="currentColor" />
            <circle cx="55" cy="48" r="4" fill="currentColor" opacity="0.5" />
            <circle cx="38" cy="58" r="3" fill="currentColor" opacity="0.3" />
          </svg>

          {/* Tiny floating colony bubble structures */}
          <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-emerald-400/20 dark:bg-emerald-400/10 animate-bounce" style={{ animationDuration: "3s" }} />
          <div className="absolute top-1/4 left-1/2 w-4 h-4 rounded-full bg-[#1a237e]/10 dark:bg-[#00f2ff]/10 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }} />
          <div className="absolute bottom-1/3 left-10 w-2 h-2 rounded-full bg-[#fbc02d]/25 dark:bg-[#fbc02d]/10 animate-ping" style={{ animationDuration: "5s" }} />
        </div>

        <div className="max-w-[1500px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10">
          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
              <span>{t("layanan.breadcrumbHome")}</span> <ArrowRight className="w-3 h-3" />{" "}
              <span>{useTranslationStore.getState().language === "en" ? "Platform Overview" : "Ikhtisar Platform"}</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1a237e] dark:text-[#00f2ff] leading-tight uppercase">
              {t("landing.aboutTitle")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-md mx-auto lg:mx-0 font-medium tracking-wider">
              {t("landing.aboutDesc")}
            </p>
          </div>
          <div className="w-full lg:w-1/2 relative flex justify-center mt-8 lg:mt-0">
            <div className="w-full max-w-xs md:max-w-md aspect-[4/5] relative z-10">
              <Image
                src="/product_manager.jpeg"
                alt="Neural Specialist"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain lg:object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-4 -right-4 lg:-bottom-8 lg:-right-8 w-40 h-40 lg:w-64 lg:h-64 bg-slate-50 dark:bg-slate-900 -z-0 transition-colors duration-300" />
          </div>
        </div>
      </section>

      {/* ── Holistic Approach ── */}
      <section className="relative py-32 bg-slate-900 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2000&auto=format&fit=crop"
          alt="Lab Detail"
          fill
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />

        <div className="max-w-[1500px] mx-auto px-6 relative z-10 flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <div className="space-y-4">
              <span className="text-primary text-xs font-black uppercase tracking-[0.4em]">
                {useTranslationStore.getState().language === "en" ? "How ColonyAI Works" : "Bagaimana ColonyAI Bekerja"}
              </span>
              <h2 className="text-5xl font-black text-white leading-tight">
                {useTranslationStore.getState().language === "en" ? "From Petri Dish" : "Dari Cawan Petri"}
                <br />
                {useTranslationStore.getState().language === "en" ? "to Digital Report" : "ke Laporan Digital"}
              </h2>
            </div>
            <div className="space-y-6 text-white/70 text-sm leading-relaxed max-w-xl font-medium tracking-wide">
              <p>
                {useTranslationStore.getState().language === "en"
                  ? "ColonyAI captures petri dish images via laboratory nodes and runs them through a YOLOv8 multi-class detection model that identifies and counts bacterial colonies alongside artifacts such as bubbles, dust, and cracks."
                  : "ColonyAI mengambil gambar cawan petri melalui node laboratorium dan menjalankannya melalui model deteksi multi-kelas YOLOv8 yang mengidentifikasi dan menghitung koloni bakteri bersama dengan artefak seperti gelembung, debu, dan retakan."}
              </p>
              <p>
                {useTranslationStore.getState().language === "en"
                  ? "Results are automatically compiled into ISO-17025 compliant audit reports with zero-trust security protocols, enabling real-time laboratory monitoring and traceability."
                  : "Hasil analisis secara otomatis disusun menjadi laporan audit yang mematuhi standar ISO-17025 dengan protokol keamanan zero-trust, memungkinkan pemantauan laboratorium real-time dan ketertelusuran."}
              </p>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="bg-white/5 backdrop-blur-md p-2 border border-white/10">
              <Image
                src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000&auto=format&fit=crop"
                alt="Holistic Care"
                width={800}
                height={500}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── The Challenge (Case 1) ── */}
      <section className="relative py-16 bg-white dark:bg-slate-950 border-t border-slate-50 dark:border-slate-900 transition-colors duration-300 overflow-hidden">
        {/* Subtle Decorative Background Variations (Petri-dish/Microbial Bubble Aesthetic) */}
        <div className="absolute inset-0 pointer-events-none opacity-45 dark:opacity-20 overflow-hidden">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_100%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]" />

          {/* Organic microbial/colony-like bubbles */}
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-emerald-100/30 dark:bg-emerald-950/10 blur-3xl animate-pulse" style={{ animationDuration: "14s" }} />
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-[#1a237e]/5 dark:bg-[#00f2ff]/5 blur-3xl animate-pulse" style={{ animationDuration: "9s" }} />

          {/* Tiny floating colony bubble structures */}
          <div className="absolute top-1/4 right-1/3 w-3 h-3 rounded-full bg-emerald-400/25 dark:bg-emerald-400/10 animate-bounce" style={{ animationDuration: "3.5s" }} />
          <div className="absolute bottom-1/4 left-1/4 w-4 h-4 rounded-full bg-[#fbc02d]/15 dark:bg-[#fbc02d]/10 animate-ping" style={{ animationDuration: "6s" }} />
        </div>

        <div className="max-w-[1500px] mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
                <span>{t("layanan.breadcrumbHome")}</span> <ArrowRight className="w-3 h-3" />{" "}
                <span>{t("public.challenge")}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#1a237e] dark:text-[#00f2ff] leading-tight uppercase tracking-tight">
                {useTranslationStore.getState().language === "en" ? "Case 1 — Microbiology Laboratory:" : "Kasus 1 — Laboratorium Mikrobiologi:"}
                <br className="hidden md:block" /> {useTranslationStore.getState().language === "en" ? "Automated Plate Count Reader" : "Pembaca Hitung Cawan Otomatis"}
              </h2>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                AI Open Innovation Challenge 2026 · TUV NORD Indonesia
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="px-4 py-2 bg-[#1a237e] text-white text-[9px] font-black uppercase tracking-widest">
                {useTranslationStore.getState().language === "en" ? "OFFICIAL CASE BRIEF" : "RINGKASAN RESMI KASUS"}
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-slate-100 dark:border-slate-800">
            {/* Brief Explanation */}
            <div className="p-8 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 space-y-4 bg-white dark:bg-slate-900 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <h3 className="text-sm md:text-base font-black text-[#1a237e] dark:text-[#00f2ff] uppercase tracking-wider">
                  {useTranslationStore.getState().language === "en" ? "Brief Explanation" : "Penjelasan Singkat"}
                </h3>
              </div>
              <p className="text-sm md:text-[15px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {useTranslationStore.getState().language === "en"
                  ? "Microbiology labs perform Total Plate Count (TPC) tests to determine microorganisms in food and environmental samples. Analysts count colonies manually — making results time-consuming, inconsistent, and prone to error."
                  : "Laboratorium mikrobiologi melakukan uji Total Plate Count (TPC) untuk menentukan mikroorganisme dalam sampel makanan dan lingkungan. Analis menghitung koloni secara manual — membuat hasil memakan waktu, tidak konsisten, dan rentan terhadap kesalahan."}
              </p>
            </div>

            {/* Challenge */}
            <div className="p-8 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 space-y-4 bg-white dark:bg-slate-900 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <h3 className="text-sm md:text-base font-black text-[#1a237e] dark:text-[#00f2ff] uppercase tracking-wider">
                  {useTranslationStore.getState().language === "en" ? "The Challenge" : "Tantangan Utama"}
                </h3>
              </div>
              <ul className="space-y-2">
                {[
                  useTranslationStore.getState().language === "en" ? "Identify agar plate area from image" : "Identifikasi area cawan agar dari gambar",
                  useTranslationStore.getState().language === "en" ? "Auto-detect & count bacterial colonies" : "Deteksi otomatis & hitung koloni bakteri",
                  useTranslationStore.getState().language === "en" ? "Differentiate colonies vs. artifacts (bubbles, dust, cracks)" : "Bedakan koloni vs. artefak (gelembung, debu, retakan)",
                  useTranslationStore.getState().language === "en" ? "Produce consistent CFU/ml values" : "Hasilkan nilai CFU/ml yang konsisten",
                  useTranslationStore.getState().language === "en" ? "Save results to laboratory reporting system" : "Simpan hasil ke sistem pelaporan laboratorium",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[13px] md:text-[14px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
                  >
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-none flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Scope & Limitations */}
            <div className="p-8 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 space-y-4 bg-white dark:bg-slate-900 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <h3 className="text-sm md:text-base font-black text-[#1a237e] dark:text-[#00f2ff] uppercase tracking-wider">
                  {useTranslationStore.getState().language === "en" ? "Scope & Limitations" : "Batasan & Ruang Lingkup"}
                </h3>
              </div>
              <ul className="space-y-2">
                {[
                  useTranslationStore.getState().language === "en" ? "Variations in lighting & camera quality" : "Variasi dalam pencahayaan & kualitas kamera",
                  useTranslationStore.getState().language === "en" ? "Overlapping and low-contrast colonies" : "Koloni yang tumpang tindih dan kontras rendah",
                  useTranslationStore.getState().language === "en" ? "Different media types and colors" : "Jenis dan warna media agar yang berbeda",
                  useTranslationStore.getState().language === "en" ? "Limited labeled dataset" : "Ketersediaan dataset berlabel yang terbatas",
                  useTranslationStore.getState().language === "en" ? "Results still require analyst verification" : "Hasil analisis tetap memerlukan verifikasi analis",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[13px] md:text-[14px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
                  >
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-none flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Expected Output */}
            <div className="p-8 space-y-4 bg-white dark:bg-slate-900 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <h3 className="text-sm md:text-base font-black text-[#1a237e] dark:text-[#00f2ff] uppercase tracking-wider">
                  {useTranslationStore.getState().language === "en" ? "Expected Output" : "Output yang Diharapkan"}
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: useTranslationStore.getState().language === "en" ? "Model" : "Model AI",
                    desc: useTranslationStore.getState().language === "en" ? "Computer vision colony detection & counting" : "Deteksi & penghitungan koloni visi komputer",
                  },
                  {
                    label: useTranslationStore.getState().language === "en" ? "Dashboard" : "Dashboard Lab",
                    desc: useTranslationStore.getState().language === "en" ? "Colony count results and test history" : "Hasil perhitungan koloni dan riwayat pengujian",
                  },
                  {
                    label: useTranslationStore.getState().language === "en" ? "Simulator" : "Simulator Akurasi",
                    desc: useTranslationStore.getState().language === "en" ? "Comparison of manual vs AI accuracy" : "Perbandingan akurasi manual vs kecerdasan buatan",
                  },
                  {
                    label: useTranslationStore.getState().language === "en" ? "Exec. Summary" : "Ringkasan Eksekutif",
                    desc: useTranslationStore.getState().language === "en" ? "Efficiency of analysis time & consistency" : "Efisiensi waktu analisis & konsistensi data",
                  },
                ].map((item, i) => (
                  <div key={i} className="border-b border-slate-50 dark:border-slate-800 pb-2">
                    <p className="text-[12px] md:text-[13px] font-black text-[#1a237e] dark:text-[#00f2ff] uppercase tracking-widest">
                      {item.label}
                    </p>
                    <p className="text-[13px] md:text-[14px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ColonyAI Solution Badge */}
          <div className="mt-6 p-5 bg-[#1a237e] flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-400 flex items-center justify-center flex-shrink-0">
                <ClipboardCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">
                  {useTranslationStore.getState().language === "en" ? "ColonyAI's Solution" : "Solusi ColonyAI"}
                </p>
                <p className="text-xs font-black text-white uppercase tracking-wide">
                  {useTranslationStore.getState().language === "en"
                    ? "All 5 Challenge Criteria Addressed — YOLOv8 · ISO-17025 · Zero-Trust Security"
                    : "Seluruh 5 Kriteria Tantangan Terpenuhi — YOLOv8 · ISO-17025 · Keamanan Zero-Trust"}
                </p>
              </div>
            </div>
            <Link
              href="/challenge"
              className="text-[10px] font-black text-white uppercase tracking-widest border border-white/30 px-5 py-2.5 hover:bg-white hover:text-[#1a237e] transition-all flex-shrink-0"
            >
              {useTranslationStore.getState().language === "en" ? "View Full Solution →" : "Lihat Solusi Lengkap →"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Contact & Support ── */}
      <section className="py-10 bg-[#f8faff] dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-[1500px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
                <span>{t("layanan.breadcrumbHome")}</span> <ArrowRight className="w-3 h-3" />{" "}
                <span>{useTranslationStore.getState().language === "en" ? "Information Center" : "Pusat Informasi"}</span>{" "}
                <ArrowRight className="w-3 h-3" /> <span>{t("public.profil")}</span>
              </div>
              <h2 className="text-4xl font-black text-[#1a237e] dark:text-[#00f2ff]">
                {useTranslationStore.getState().language === "en" ? "Contact Us for Queries and" : "Hubungi Kami untuk Pertanyaan &"} <br />
                {useTranslationStore.getState().language === "en" ? "Assistance" : "Bantuan"}
              </h2>
            </div>
            <div className="flex flex-wrap gap-6">
              <a
                href="tel:+6281394829"
                className="bg-white dark:bg-slate-950 p-6 shadow-xl border border-slate-100 dark:border-slate-800 min-w-[280px] flex flex-col gap-4 hover:border-emerald-300 dark:hover:border-[#00f2ff] hover:shadow-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-none bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <Phone className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                      {useTranslationStore.getState().language === "en" ? "Call Contact Center" : "Hubungi Pusat Kontak"}
                    </p>
                    <p className="text-sm font-black text-[#1a237e] dark:text-[#00f2ff]">
                      0813-948-290
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-500 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase border-t border-slate-50 dark:border-slate-800 pt-2 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> {useTranslationStore.getState().language === "en" ? "24 Hours Service Available" : "Layanan Tersedia 24 Jam"}
                </p>
              </a>
              <a
                href="https://wa.me/6281394829?text=Halo%20ColonyAI%2C%20saya%20ingin%20bertanya%20mengenai%20platform%20analisis%20mikrobiologi%20Anda."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-slate-950 p-6 shadow-xl border border-slate-100 dark:border-slate-800 min-w-[280px] flex flex-col gap-4 hover:border-green-300 dark:hover:border-[#00f2ff] hover:shadow-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-none bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <MessageCircle className="w-5 h-5 text-green-500 fill-green-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                      {useTranslationStore.getState().language === "en" ? "Chat via WhatsApp" : "Obrolan via WhatsApp"}
                    </p>
                    <p className="text-sm font-black text-[#1a237e] dark:text-[#00f2ff]">
                      0813-948-290
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-500 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase border-t border-slate-50 dark:border-slate-800 pt-2 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> {useTranslationStore.getState().language === "en" ? "24 Hours Service Available" : "Layanan Tersedia 24 Jam"}
                </p>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Career & Partnership ── */}
      <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-[1500px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Link href="/career" className="relative h-[300px] group overflow-hidden block">
              <Image
                src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000&auto=format&fit=crop"
                alt="Career"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a237e] via-[#1a237e]/40 to-transparent" />
              <div className="absolute inset-0 p-12 flex flex-col justify-center items-start space-y-4">
                <h3 className="text-2xl font-black text-white uppercase">
                  {useTranslationStore.getState().language === "en" ? "Career Opportunities" : "Peluang Karir"}
                </h3>
                <p className="text-white/80 text-xs font-bold max-w-xs uppercase tracking-wider leading-relaxed">
                  {useTranslationStore.getState().language === "en"
                    ? "Discover exciting career paths and growth opportunities at ColonyAI Research Nodes. Join us and make a difference!"
                    : "Temukan jalur karir yang menarik dan peluang pertumbuhan di ColonyAI Research Nodes. Bergabunglah dengan kami!"}
                </p>
                <span
                  className="text-white text-xs font-black uppercase tracking-widest border-b border-white pb-1 group-hover:text-emerald-400 group-hover:border-emerald-400 transition-colors"
                >
                  {useTranslationStore.getState().language === "en" ? "Explore ColonyAI Career" : "Jelajahi Karir ColonyAI"}
                </span>
              </div>
            </Link>
            <Link href="/partnership" className="relative h-[300px] group overflow-hidden block">
              <Image
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000&auto=format&fit=crop"
                alt="Partnership"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#f8faff] dark:from-slate-900 via-[#f8faff]/80 dark:via-slate-900/80 to-transparent" />
              <div className="absolute inset-0 p-12 flex flex-col justify-center items-start space-y-4">
                <h3 className="text-2xl font-black text-[#1a237e] dark:text-[#00f2ff] uppercase">
                  {useTranslationStore.getState().language === "en" ? "Partnership" : "Kemitraan"}
                </h3>
                <p className="text-[#1a237e]/60 dark:text-slate-300 text-xs font-bold max-w-xs uppercase tracking-wider leading-relaxed">
                  {useTranslationStore.getState().language === "en"
                    ? "Explore the potential for partnerships with ColonyAI, where we join forces to create impactful neural solutions."
                    : "Jelajahi potensi kemitraan dengan ColonyAI, di mana kita menyatukan kekuatan untuk menciptakan solusi saraf yang berdampak."}
                </p>
                <span
                  className="text-[#1a237e] dark:text-[#00f2ff] text-xs font-black uppercase tracking-widest border-b border-[#1a237e] dark:border-[#00f2ff] pb-1 group-hover:text-emerald-500 group-hover:border-emerald-500 transition-colors"
                >
                  {t("public.profil")}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Partners & Ecosystem ── */}
      <section className="py-10 bg-white dark:bg-slate-950 border-t border-slate-50 dark:border-slate-900 overflow-hidden transition-colors duration-300">
        <div className="max-w-[1500px] mx-auto px-6">
          {/* All three: side by side */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* An Initiative By */}
            <div className="flex flex-col items-center lg:items-start gap-3 flex-shrink-0">
              <h3 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">
                {useTranslationStore.getState().language === "en" ? "An Initiative By" : "Inisiasi Oleh"}
              </h3>
              <Image
                src="https://ai-open.president.ac.id/assets/images/FOOTER KEMENKO.png"
                alt="Kemenko"
                width={160}
                height={50}
                className="h-10 w-auto object-contain"
              />
            </div>

            <div className="hidden lg:block h-12 w-px bg-slate-100 dark:bg-slate-800 flex-shrink-0" />

            {/* Organized By */}
            <div className="flex flex-col items-center lg:items-start gap-3 flex-shrink-0">
              <h3 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">
                {useTranslationStore.getState().language === "en" ? "Organized By" : "Penyelenggara"}
              </h3>
              <Image
                src="https://ai-open.president.ac.id/assets/images/FOOTER%20LOGO%20PU.png"
                alt="President University"
                width={180}
                height={50}
                className="h-10 w-auto object-contain"
              />
            </div>

            <div className="hidden lg:block h-12 w-px bg-slate-100 dark:bg-slate-800 flex-shrink-0" />

            {/* Our Strategic Partners — Marquee */}
            <div className="flex-1 min-w-0 space-y-3">
              <h3 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] text-center lg:text-left">
                {useTranslationStore.getState().language === "en" ? "Our Strategic Partners" : "Mitra Strategis Kami"}
              </h3>
              <div className="relative flex overflow-x-hidden">
                <div className="py-2 animate-marquee whitespace-nowrap flex items-center gap-12">
                  <Image
                    src="https://ai-open.president.ac.id/assets/images/nvidia-logo-vert.png"
                    alt="NVIDIA"
                    width={60}
                    height={60}
                    className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                  />
                  <div className="text-xl font-black text-slate-300 dark:text-slate-700 tracking-tighter">
                    TELKOMSEL
                  </div>
                  <div className="text-xl font-black text-slate-300 dark:text-slate-700 tracking-tighter">
                    LINTASARTA
                  </div>
                  <Image
                    src="/logo-tuv-nord.svg"
                    alt="TUV NORD"
                    width={100}
                    height={40}
                    className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                  />
                  <div className="text-xl font-black text-slate-300 dark:text-slate-700 tracking-tighter">
                    BLIBLI
                  </div>
                  <div className="text-xl font-black text-slate-300 dark:text-slate-700 tracking-tighter">
                    KERRY
                  </div>
                  <div className="text-xl font-black text-slate-300 dark:text-slate-700 tracking-tighter">
                    RECKITT
                  </div>
                  {/* Duplicate for seamless loop */}
                  <Image
                    src="https://ai-open.president.ac.id/assets/images/nvidia-logo-vert.png"
                    alt="NVIDIA"
                    width={60}
                    height={60}
                    className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                  />
                  <div className="text-xl font-black text-slate-300 dark:text-slate-700 tracking-tighter">
                    TELKOMSEL
                  </div>
                  <div className="text-xl font-black text-slate-300 dark:text-slate-700 tracking-tighter">
                    LINTASARTA
                  </div>
                  <Image
                    src="/logo-tuv-nord.svg"
                    alt="TUV NORD"
                    width={100}
                    height={40}
                    className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                  />
                  <div className="text-xl font-black text-slate-300 dark:text-slate-700 tracking-tighter">
                    BLIBLI
                  </div>
                  <div className="text-xl font-black text-slate-300 dark:text-slate-700 tracking-tighter">
                    KERRY
                  </div>
                  <div className="text-xl font-black text-slate-300 dark:text-slate-700 tracking-tighter">
                    RECKITT
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ (FnQ) Section ── */}
      <section className="py-24 bg-[#f8faff] dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-[1500px] mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <span className="text-primary text-xs font-black uppercase tracking-[0.4em]">
              FnQ
            </span>
            <h2 className="text-4xl font-black text-[#1a237e] dark:text-[#00f2ff]">
              {useTranslationStore.getState().language === "en" ? "Frequently Asked Questions" : "Pertanyaan yang Sering Diajukan"}
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: useTranslationStore.getState().language === "en" ? "What is ColonyAI?" : "Apa itu ColonyAI?",
                a: useTranslationStore.getState().language === "en" 
                  ? "ColonyAI is an automated computer vision-based microbiology analysis platform developed to assist researchers and lab analysts in identifying and counting bacterial colonies with high precision."
                  : "ColonyAI adalah platform analisis mikrobiologi otomatis berbasis visi komputer yang dikembangkan untuk membantu peneliti dan analis laboratorium dalam mengidentifikasi serta menghitung koloni bakteri dengan tingkat presisi tinggi.",
              },
              {
                q: useTranslationStore.getState().language === "en" ? "How do I access the Neural Center?" : "Bagaimana cara mengakses Neural Center?",
                a: useTranslationStore.getState().language === "en"
                  ? "You can access the Neural Center via the main dashboard after authorizing your laboratory node. Use the 'Neural Center' menu in the navigation to begin analysis."
                  : "Anda dapat mengakses Neural Center melalui dashboard utama setelah melakukan otorisasi node laboratorium Anda. Gunakan menu 'Neural Center' di navigasi untuk memulai analisis.",
              },
              {
                q: useTranslationStore.getState().language === "en" ? "Does this platform support ISO standards?" : "Apakah platform ini mendukung standar ISO?",
                a: useTranslationStore.getState().language === "en"
                  ? "Yes, ColonyAI is designed to comply with ISO-17025 standards for laboratory data management and audit trails."
                  : "Ya, ColonyAI dirancang untuk mematuhi standar ISO-17025 dalam pengelolaan data laboratorium dan audit trail.",
              },
              {
                q: useTranslationStore.getState().language === "en" ? "What if I need technical assistance?" : "Bagaimana jika saya memerlukan bantuan teknis?",
                a: useTranslationStore.getState().language === "en"
                  ? "Our support team is available 24/7 via hotline 0813-948-290 or via the chat widget in the lower right corner of the page."
                  : "Tim dukungan kami tersedia 24/7 melalui hotline 0813-948-290 atau melalui widget chat di pojok kanan bawah halaman.",
              },
            ].map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-4 group cursor-pointer transition-all ${isOpen ? "border-primary dark:border-[#00f2ff] shadow-lg" : "hover:border-primary dark:hover:border-[#00f2ff]"}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center justify-between">
        <h3
          className={`text-sm font-black uppercase tracking-wide transition-colors ${isOpen ? "text-primary dark:text-[#00f2ff]" : "text-[#1a237e] dark:text-[#00f2ff]/85"}`}
        >
          {question}
        </h3>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : "text-slate-400 group-hover:text-primary"}`}
        />
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase leading-relaxed pt-2">
          {answer}
        </p>
      </div>
    </div>
  );
}

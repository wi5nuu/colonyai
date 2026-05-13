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
    <div className="min-h-screen bg-white text-slate-900 font-sans">
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
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#1a237e]/10" />

            {/* ── Siloam-style top labels on right panel ── */}
            <div className="absolute inset-0 flex">
              {/* Left half of right panel */}
              <div className="w-1/2 h-full flex flex-col justify-start pt-8 px-4 items-end">
                <p className="text-white text-right font-black uppercase leading-tight text-sm md:text-lg drop-shadow-lg">
                  MANUAL<br />COLONY<br />COUNTING
                </p>
              </div>
              {/* Diagonal divider */}
              <div className="relative flex items-start pt-6">
                <div className="h-24 w-[3px] bg-white/60 rotate-[15deg] origin-top" />
              </div>
              {/* Right half of right panel */}
              <div className="w-1/2 h-full flex flex-col justify-start pt-8 px-4 items-start">
                <p className="text-white font-black uppercase leading-tight text-sm md:text-lg drop-shadow-lg">
                  AI-POWERED<br />AUTO<br />DETECTION
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content Overlay ── */}
        <div className="max-w-[1500px] mx-auto px-6 relative h-full flex flex-col justify-center pb-[88px] lg:pb-[96px]">
          <div className="max-w-lg space-y-3">
            <p className="text-white text-sm lg:text-base font-bold drop-shadow-md">
              Automated Microbiology Analysis — AI Open Innovation Challenge 2026
            </p>
            <h1 className="text-3xl lg:text-5xl xl:text-6xl font-black text-white leading-tight drop-shadow-lg">
              Automated Colony<br />
              Detection with YOLOv8 AI
            </h1>
          </div>

          {/* ── Floating Search Widget ── */}
          <div className="bg-white shadow-2xl max-w-md w-full mt-6" style={{borderRadius: 0}}>
            <div className="flex items-center gap-4 px-5 pt-5 pb-3 border-b border-slate-100">
              <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Find</span>
              <div className="flex items-center gap-2">
                {["all", "specimen", "laboratory"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 text-xs font-bold capitalize transition-all border ${
                      activeTab === tab
                        ? "bg-emerald-500 border-emerald-500 text-white shadow"
                        : "border-emerald-500 text-emerald-500 hover:bg-emerald-50"
                    }`}
                    style={{borderRadius: '999px'}}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative px-5 py-4">
              <input
                type="text"
                placeholder="Type any keyword (Specimen ID, Lab Node...)"
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all pr-10"
              />
              <Search className="w-4 h-4 text-emerald-500 absolute right-8 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* ── Bottom Banner (Yellow + Blue, side by side, skewed junction) ── */}
        <div className="absolute bottom-0 left-0 right-0 flex h-20 md:h-24">
          {/* Yellow section */}
          <div className="relative bg-[#fbc02d] flex items-center justify-center px-6 md:px-12" style={{width: '42%'}}>
            <div className="relative z-20 text-center">
              <h3 className="text-[#1a237e] text-xs md:text-lg font-black leading-tight uppercase">
                Validate Colony Count <br className="hidden md:block"/>
                Before You Submit Results
              </h3>
              <p className="text-[#1a237e] text-[9px] md:text-sm font-bold mt-0.5">ISO-17025 Compliant AI Accuracy Verification</p>
            </div>
            {/* Skew right edge */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-[#fbc02d] translate-x-4 skew-x-[-10deg] z-10" />
          </div>
          {/* Blue section */}
          <div className="flex-1 bg-[#1a237e] flex items-center justify-center px-4">
            <div className="flex items-center gap-2 md:gap-4">
              <div>
                <p className="text-white/60 text-[8px] md:text-xs font-bold uppercase tracking-widest">Technical Support & Consultation</p>
                <div className="flex items-center gap-1.5 md:gap-3 mt-0.5">
                  <MessageCircle className="w-5 h-5 md:w-8 md:h-8 text-green-400 fill-green-400 flex-shrink-0" />
                  <span className="text-sm md:text-3xl font-black text-white tabular-nums">0813-948-290</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Action Cards ── */}
      <section className="py-0 bg-white border-b border-slate-100">
        <div className="max-w-[1500px] mx-auto">
          <div className="grid grid-cols-3 md:grid-cols-6">
            {[
              { name: "Beranda", icon: Home, href: "/" },
              { name: "Layanan", icon: Building2, href: "/layanan" },
              { name: "Teknologi", icon: ClipboardCheck, href: "/teknologi" },
              { name: "Target Pengguna", icon: Users, href: "/target-pengguna" },
              { name: "Tujuan & Manfaat", icon: FlaskConical, href: "/tujuan-manfaat" },
              { name: "Kepatuhan", icon: ImageIcon, href: "/compliance" },
            ].map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex items-center gap-3 px-4 py-5 border-r border-b md:border-b-0 border-slate-100 hover:bg-slate-50 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-50 transition-colors flex-shrink-0">
                  <action.icon className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight leading-none block">{action.name}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="py-10 bg-white border-b border-slate-50">
        <div className="max-w-[1500px] mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
            {[
              { val: "97K+", label: "Training Instances Dataset" },
              { val: "5", label: "Detection Classes (Colony, Bubble, Dust, Crack, Artifact)" },
              { val: "ISO", label: "17025 Compliant Audit Standards" },
              { val: "YOLOv8", label: "Computer Vision Architecture" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-3xl lg:text-5xl font-black text-[#1a237e] tracking-tighter">{stat.val}</span>
                <p className="text-[9px] md:text-xs font-bold text-slate-400 leading-tight uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── Center of Neural Excellence ── */}
      <section className="py-16 lg:py-24 bg-white overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              <span>Home</span> <ArrowRight className="w-3 h-3" />{" "}
              <span>Platform Overview</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1a237e] leading-tight">
              ColonyAI — Automated<br className="hidden md:block" />
              Microbiology Analysis
            </h2>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-md mx-auto lg:mx-0 font-medium uppercase tracking-wider">
              An AI-powered laboratory platform built on YOLOv8 computer vision
              to automate bacterial colony counting and classification,
              fully aligned with ISO-17025 audit standards.
            </p>
          </div>
          <div className="w-full lg:w-1/2 relative flex justify-center mt-8 lg:mt-0">
            <div className="w-full max-w-xs md:max-w-md aspect-[4/5] relative z-10">
              <Image
                src="/product_manager.jpeg"
                alt="Neural Specialist"
                fill
                className="object-contain lg:object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-4 -right-4 lg:-bottom-8 lg:-right-8 w-40 h-40 lg:w-64 lg:h-64 bg-slate-50 -z-0" />
          </div>
        </div>
      </section>

      {/* ── Holistic Approach ── */}
      <section className="relative py-32 bg-slate-900 overflow-hidden">
         <Image 
           src="https://images.unsplash.com/photo-1579152276503-68fe289075e8?q=80&w=2000&auto=format&fit=crop"
           alt="Lab Detail"
           fill
           className="object-cover opacity-20"
         />
         <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
         
         <div className="max-w-[1500px] mx-auto px-6 relative z-10 flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
               <div className="space-y-4">
                  <span className="text-primary text-xs font-black uppercase tracking-[0.4em]">How ColonyAI Works</span>
                  <h2 className="text-5xl font-black text-white leading-tight">
                     From Petri Dish<br />
                     to Digital Report
                  </h2>
               </div>
               <div className="space-y-6 text-white/70 text-sm leading-relaxed max-w-xl font-medium uppercase tracking-wide">
                  <p>
                    ColonyAI captures petri dish images via laboratory nodes and runs them through a YOLOv8 multi-class detection model that identifies and counts bacterial colonies alongside artifacts such as bubbles, dust, and cracks.
                  </p>
                  <p>
                    Results are automatically compiled into ISO-17025 compliant audit reports with zero-trust security protocols, enabling real-time laboratory monitoring and traceability.
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
      <section className="py-16 bg-white border-t border-slate-50">
        <div className="max-w-[1500px] mx-auto px-6">

          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                <span>Home</span> <ArrowRight className="w-3 h-3" /> <span>The Challenge</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#1a237e] leading-tight uppercase tracking-tight">
                Case 1 — Microbiology Laboratory:<br className="hidden md:block" /> Automated Plate Count Reader
              </h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                AI Open Innovation Challenge 2026 · TUV NORD Indonesia
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="px-4 py-2 bg-[#1a237e] text-white text-[9px] font-black uppercase tracking-widest">
                OFFICIAL CASE BRIEF
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-slate-100">

            {/* Brief Explanation */}
            <div className="p-8 border-b md:border-b-0 md:border-r border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1a237e] flex items-center justify-center flex-shrink-0">
                  <FlaskConical className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-[11px] font-black text-[#1a237e] uppercase tracking-widest">Brief Explanation</h3>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Microbiology labs perform Total Plate Count (TPC) tests to determine microorganisms in food and environmental samples. Analysts count colonies manually — making results time-consuming, inconsistent, and prone to error.
              </p>
            </div>

            {/* Challenge */}
            <div className="p-8 border-b md:border-b-0 md:border-r border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-[11px] font-black text-[#1a237e] uppercase tracking-widest">The Challenge</h3>
              </div>
              <ul className="space-y-2">
                {[
                  "Identify agar plate area from image",
                  "Auto-detect & count bacterial colonies",
                  "Differentiate colonies vs. artifacts (bubbles, dust, cracks)",
                  "Produce consistent CFU/ml values",
                  "Save results to laboratory reporting system",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-slate-500 font-medium">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-none flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Scope & Limitations */}
            <div className="p-8 border-b lg:border-b-0 lg:border-r border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-rose-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-[11px] font-black text-[#1a237e] uppercase tracking-widest">Scope & Limitations</h3>
              </div>
              <ul className="space-y-2">
                {[
                  "Variations in lighting & camera quality",
                  "Overlapping and low-contrast colonies",
                  "Different media types and colors",
                  "Limited labeled dataset",
                  "Results still require analyst verification",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-slate-500 font-medium">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-none flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Expected Output */}
            <div className="p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <ClipboardCheck className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-[11px] font-black text-[#1a237e] uppercase tracking-widest">Expected Output</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Model", desc: "Computer vision colony detection & counting" },
                  { label: "Dashboard", desc: "Colony count results and test history" },
                  { label: "Simulator", desc: "Comparison of manual vs AI accuracy" },
                  { label: "Exec. Summary", desc: "Efficiency of analysis time & consistency" },
                ].map((item, i) => (
                  <div key={i} className="border-b border-slate-50 pb-2">
                    <p className="text-[9px] font-black text-[#1a237e] uppercase tracking-widest">{item.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.desc}</p>
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
                <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">ColonyAI's Solution</p>
                <p className="text-sm font-black text-white uppercase tracking-wide">All 5 Challenge Criteria Addressed — YOLOv8 · ISO-17025 · Zero-Trust Security</p>
              </div>
            </div>
            <Link href="/challenge" className="text-[10px] font-black text-white uppercase tracking-widest border border-white/30 px-5 py-2.5 hover:bg-white hover:text-[#1a237e] transition-all flex-shrink-0">
              View Full Solution →
            </Link>
          </div>

        </div>
      </section>

      {/* ── Contact & Support ── */}
      <section className="py-10 bg-[#f8faff]">
         <div className="max-w-[1500px] mx-auto px-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                     <span>Home</span> <ArrowRight className="w-3 h-3" /> <span>Information Center</span> <ArrowRight className="w-3 h-3" /> <span>Contact Us</span>
                  </div>
                  <h2 className="text-4xl font-black text-[#1a237e]">Contact Us for Queries and <br />Assistance</h2>
               </div>
               <div className="flex flex-wrap gap-6">
                  <a href="tel:+6281394829" className="bg-white p-6 shadow-xl border border-slate-100 min-w-[280px] flex flex-col gap-4 hover:border-emerald-300 hover:shadow-2xl transition-all cursor-pointer group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-none bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                           <Phone className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase">Call Contact Center</p>
                           <p className="text-sm font-black text-[#1a237e]">0813-948-290</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-emerald-500 ml-auto group-hover:translate-x-1 transition-transform" />
                     </div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase border-t border-slate-50 pt-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> 24 Hours Service Available
                     </p>
                  </a>
                  <a
                    href="https://wa.me/6281394829?text=Halo%20ColonyAI%2C%20saya%20ingin%20bertanya%20mengenai%20platform%20analisis%20mikrobiologi%20Anda."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white p-6 shadow-xl border border-slate-100 min-w-[280px] flex flex-col gap-4 hover:border-green-300 hover:shadow-2xl transition-all cursor-pointer group"
                  >
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-none bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                           <MessageCircle className="w-5 h-5 text-green-500 fill-green-500" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase">Chat via WhatsApp</p>
                           <p className="text-sm font-black text-[#1a237e]">0813-948-290</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-emerald-500 ml-auto group-hover:translate-x-1 transition-transform" />
                     </div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase border-t border-slate-50 pt-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> 24 Hours Service Available
                     </p>
                  </a>
               </div>
            </div>
         </div>
      </section>

      {/* ── Career & Partnership ── */}
      <section className="py-24 bg-white">
         <div className="max-w-[1500px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="relative h-[300px] group overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000&auto=format&fit=crop"
                    alt="Career"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1a237e] via-[#1a237e]/40 to-transparent" />
                  <div className="absolute inset-0 p-12 flex flex-col justify-center items-start space-y-4">
                     <h3 className="text-2xl font-black text-white uppercase">Career Opportunities</h3>
                     <p className="text-white/80 text-xs font-bold max-w-xs uppercase tracking-wider leading-relaxed">
                        Discover exciting career paths and growth opportunities at ColonyAI Research Nodes. Join us and make a difference!
                     </p>
                     <Link href="#" className="text-white text-xs font-black uppercase tracking-widest border-b border-white pb-1 hover:text-emerald-400 hover:border-emerald-400 transition-colors">
                        Explore ColonyAI Career
                     </Link>
                  </div>
               </div>
               <div className="relative h-[300px] group overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000&auto=format&fit=crop"
                    alt="Partnership"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#f8faff] via-[#f8faff]/80 to-transparent" />
                  <div className="absolute inset-0 p-12 flex flex-col justify-center items-start space-y-4">
                     <h3 className="text-2xl font-black text-[#1a237e] uppercase">Partnership</h3>
                     <p className="text-[#1a237e]/60 text-xs font-bold max-w-xs uppercase tracking-wider leading-relaxed">
                        Explore the potential for partnerships with ColonyAI, where we join forces to create impactful neural solutions.
                     </p>
                     <Link href="#" className="text-[#1a237e] text-xs font-black uppercase tracking-widest border-b border-[#1a237e] pb-1 hover:text-emerald-500 hover:border-emerald-500 transition-colors">
                        Contact Us
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ── Partners & Ecosystem ── */}
      <section className="py-10 bg-white border-t border-slate-50 overflow-hidden">
         <div className="max-w-[1500px] mx-auto px-6">

            {/* All three: side by side */}
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

               {/* An Initiative By */}
               <div className="flex flex-col items-center lg:items-start gap-3 flex-shrink-0">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">An Initiative By</h4>
                  <Image src="https://ai-open.president.ac.id/assets/images/FOOTER KEMENKO.png" alt="Kemenko" width={160} height={50} className="h-10 w-auto object-contain" />
               </div>

               <div className="hidden lg:block h-12 w-px bg-slate-100 flex-shrink-0" />

               {/* Organized By */}
               <div className="flex flex-col items-center lg:items-start gap-3 flex-shrink-0">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Organized By</h4>
                  <Image src="https://ai-open.president.ac.id/assets/images/FOOTER%20LOGO%20PU.png" alt="President University" width={180} height={50} className="h-10 w-auto object-contain" />
               </div>

               <div className="hidden lg:block h-12 w-px bg-slate-100 flex-shrink-0" />

               {/* Our Strategic Partners — Marquee */}
               <div className="flex-1 min-w-0 space-y-3">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] text-center lg:text-left">Our Strategic Partners</h4>
                  <div className="relative flex overflow-x-hidden">
                     <div className="py-2 animate-marquee whitespace-nowrap flex items-center gap-12">
                        <Image src="https://ai-open.president.ac.id/assets/images/nvidia-logo-vert.png" alt="NVIDIA" width={60} height={60} className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all" />
                        <div className="text-xl font-black text-slate-300 tracking-tighter">TELKOMSEL</div>
                        <div className="text-xl font-black text-slate-300 tracking-tighter">LINTASARTA</div>
                        <Image src="/logo-tuv-nord.svg" alt="TUV NORD" width={100} height={40} className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all" />
                        <div className="text-xl font-black text-slate-300 tracking-tighter">BLIBLI</div>
                        <div className="text-xl font-black text-slate-300 tracking-tighter">KERRY</div>
                        <div className="text-xl font-black text-slate-300 tracking-tighter">RECKITT</div>
                        {/* Duplicate for seamless loop */}
                        <Image src="https://ai-open.president.ac.id/assets/images/nvidia-logo-vert.png" alt="NVIDIA" width={60} height={60} className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all" />
                        <div className="text-xl font-black text-slate-300 tracking-tighter">TELKOMSEL</div>
                        <div className="text-xl font-black text-slate-300 tracking-tighter">LINTASARTA</div>
                        <Image src="/logo-tuv-nord.svg" alt="TUV NORD" width={100} height={40} className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all" />
                        <div className="text-xl font-black text-slate-300 tracking-tighter">BLIBLI</div>
                        <div className="text-xl font-black text-slate-300 tracking-tighter">KERRY</div>
                        <div className="text-xl font-black text-slate-300 tracking-tighter">RECKITT</div>
                     </div>
                  </div>
               </div>

            </div>
         </div>
      </section>

      {/* ── FAQ (FnQ) Section ── */}
      <section className="py-24 bg-[#f8faff]">
         <div className="max-w-[1500px] mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
               <span className="text-primary text-xs font-black uppercase tracking-[0.4em]">FnQ</span>
               <h2 className="text-4xl font-black text-[#1a237e]">Frequently Asked Questions</h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
               {[
                  { q: "Apa itu ColonyAI?", a: "ColonyAI adalah platform analisis mikrobiologi otomatis berbasis visi komputer yang dikembangkan untuk membantu peneliti dan analis laboratorium dalam mengidentifikasi serta menghitung koloni bakteri dengan tingkat presisi tinggi." },
                  { q: "Bagaimana cara mengakses Neural Center?", a: "Anda dapat mengakses Neural Center melalui dashboard utama setelah melakukan otorisasi node laboratorium Anda. Gunakan menu 'Neural Center' di navigasi untuk memulai analisis." },
                  { q: "Apakah platform ini mendukung standar ISO?", a: "Ya, ColonyAI dirancang untuk mematuhi standar ISO-17025 dalam pengelolaan data laboratorium dan audit trail." },
                  { q: "Bagaimana jika saya memerlukan bantuan teknis?", a: "Tim dukungan kami tersedia 24/7 melalui hotline 0813-948-290 atau melalui widget chat di pojok kanan bawah halaman." }
               ].map((item, i) => (
                  <FaqItem key={i} question={item.q} answer={item.a} />
               ))}
            </div>
         </div>
      </section>



      <Footer />

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
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
      className={`bg-white border border-slate-100 p-6 flex flex-col gap-4 group cursor-pointer transition-all ${isOpen ? "border-primary shadow-lg" : "hover:border-primary"}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center justify-between">
        <h4 className={`text-sm font-black uppercase tracking-wide transition-colors ${isOpen ? "text-primary" : "text-[#1a237e]"}`}>
          {question}
        </h4>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : "text-slate-400 group-hover:text-primary"}`} />
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="text-[11px] font-medium text-slate-500 uppercase leading-relaxed pt-2">
          {answer}
        </p>
      </div>
    </div>
  );
}

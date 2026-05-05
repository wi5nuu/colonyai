"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  ArrowRight,
  Github,
  Activity,
  Download,
  Sparkles,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { useTranslationStore } from "@/lib/i18n/store";

const TOP_BAR_BG = "bg-gradient-to-r from-[#0055ff] to-[#00f2ff]";
const PRIMARY_GRADIENT =
  "bg-gradient-to-r from-[#00f2ff] via-[#0055ff] to-[#ff00ff]";

function ServiceCard({
  card,
  PRIMARY_GRADIENT,
}: {
  card: any;
  PRIMARY_GRADIENT: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="group h-[380px] lg:h-[450px] w-[280px] lg:w-full flex-shrink-0 [perspective:1000px]">
      <div
        className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isExpanded ? "[transform:rotateY(180deg)]" : ""}`}
      >
        {/* ── FRONT SIDE ────────────────────────────────────────── */}
        <div className="absolute inset-0 [backface-visibility:hidden] flex flex-col rounded-xl overflow-hidden shadow-2xl bg-white border border-slate-100">
          <div className={`${PRIMARY_GRADIENT} p-4 space-y-1 flex-none`}>
            <h3 className="text-white text-base lg:text-lg font-black leading-tight tracking-tight">
              {card.title}
            </h3>
            <p className="text-white/90 text-[9px] lg:text-[10px] font-medium leading-relaxed uppercase tracking-wide">
              {card.desc}
            </p>
          </div>
          <div className="relative flex-1 overflow-hidden">
            <Image
              src={card.img}
              alt={card.title}
              width={400}
              height={300}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-all" />

            <div
              className="absolute bottom-6 left-6 flex items-center gap-3 group/link cursor-pointer"
              onClick={() => setIsExpanded(true)}
            >
              <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-white group-hover:text-[#00f2ff] transition-all flex items-center gap-2">
                {card.learnMore}
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-all" />
              </span>
            </div>
          </div>
        </div>

        {/* ── BACK SIDE ─────────────────────── */}
        <div
          className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl overflow-hidden shadow-2xl ${PRIMARY_GRADIENT} p-6 lg:p-8 flex flex-col justify-between border-4 border-white/20`}
        >
          <div className="space-y-4 lg:space-y-6">
            <h3 className="text-white text-base lg:text-xl font-black leading-tight uppercase tracking-tight">
              {card.title}
            </h3>
            <div className="h-[1px] w-full bg-white/20" />
            <p className="text-white text-[11px] lg:text-[12px] font-bold leading-relaxed tracking-wide">
              {card.longDesc}
            </p>
          </div>

          <button
            onClick={() => setIsExpanded(false)}
            className="w-full bg-white text-slate-900 py-3 lg:py-4 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-900 hover:text-white transition-all shadow-xl"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            {card.backToSummary}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { t } = useTranslationStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = ["/sample_plate.png", "/sample_plate1.png"];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => {
      clearInterval(slideInterval);
    };
  }, []);

  const serviceCards = [
    {
      title: t("landing.service1Title"),
      desc: t("landing.service1Desc"),
      longDesc: t("landing.service1LongDesc"),
      img: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=800&auto=format&fit=crop",
      learnMore: t("landing.learnMore"),
      backToSummary: t("landing.backToSummary"),
    },
    {
      title: t("landing.service2Title"),
      desc: t("landing.service2Desc"),
      longDesc: t("landing.service2LongDesc"),
      img: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop",
      learnMore: t("landing.learnMore"),
      backToSummary: t("landing.backToSummary"),
    },
    {
      title: t("landing.service3Title"),
      desc: t("landing.service3Desc"),
      longDesc: t("landing.service3LongDesc"),
      img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop",
      learnMore: t("landing.learnMore"),
      backToSummary: t("landing.backToSummary"),
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#00f2ff] selection:text-slate-900">
      {/* ── Hero Section ────────────────────────────── */}
      <section className="relative h-[550px] lg:h-[650px] flex items-center overflow-visible">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {heroSlides.map((slide, index) => (
            <Image
              key={slide}
              src={slide}
              alt={`Laboratory Slide ${index + 1}`}
              fill
              priority={index === 0}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-[2000ms] ease-in-out ${
                currentSlide === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-slate-900/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/20 to-transparent z-10" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
            <h1 className="text-3xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight uppercase">
              {t("landing.heroTitle")} <br />
              <span className="text-white">{t("landing.heroSubtitle")}</span>
            </h1>
            <p className="text-2xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
              {t("landing.welcome")}
            </p>
            <p
              className="text-sm lg:text-lg text-white/90 font-medium leading-relaxed max-w-2xl"
              dangerouslySetInnerHTML={{ __html: t("landing.heroDesc") }}
            ></p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/challenge"
                className={`${PRIMARY_GRADIENT} text-white px-6 lg:px-8 py-3 rounded-xl text-[10px] lg:text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 transition-all shadow-2xl group`}
              >
                {t("landing.startAnalysis")}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://github.com/wi5nuu/colonyai"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 lg:px-8 py-3 rounded-xl text-[10px] lg:text-[12px] font-bold flex items-center gap-3 hover:bg-white hover:text-slate-900 transition-all group"
              >
                <Github className="w-5 h-5" />
                {t("landing.githubRepo")}
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4 lg:gap-6 pt-8 border-t border-white/10">
              <div className="flex flex-col gap-1 lg:gap-2">
                <span className="text-[8px] lg:text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">
                  {t("landing.caseProvider")}
                </span>
                <div className="bg-white/5 backdrop-blur-md px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl border border-white/10 flex items-center gap-2 lg:gap-3">
                  <Image
                    src="https://th.bing.com/th/id/OIP.bFXKGOriWS0ET5cz_hghRgHaDe?w=319&h=180&c=7&r=0&o=5&pid=1.7"
                    alt="TUV NORD"
                    width={80}
                    height={20}
                    className="h-4 lg:h-5 w-auto"
                  />
                  <span className="text-[8px] lg:text-[9px] font-black text-white uppercase tracking-widest">
                    {t("landing.caseProviderValue")}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 lg:gap-2">
                <span className="text-[8px] lg:text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">
                  {t("landing.organizer")}
                </span>
                <div className="bg-white/5 backdrop-blur-md px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl border border-white/10 flex items-center gap-2 lg:gap-3">
                  <Image
                    src="https://th.bing.com/th/id/OIP.QFb4rSX2W64YGmdQE5vTaQHaIB?w=170&h=185&c=7&r=0&o=5&pid=1.7"
                    alt="President University"
                    width={30}
                    height={30}
                    className="h-5 lg:h-6 w-auto"
                  />
                  <span className="text-[8px] lg:text-[9px] font-black text-white uppercase tracking-widest whitespace-nowrap">
                    {t("landing.organizerValue")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Section ────────────────── */}
      <section className="py-24 lg:py-32 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto space-y-12 lg:space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-2xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
              {t("landing.servicesTitle")}
            </h2>
            <p className="text-[10px] lg:text-base text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed uppercase tracking-wide">
              {t("landing.servicesDesc")}
            </p>
          </div>

          {/* ── Scrollable Cards on Mobile ── */}
          <div className="flex lg:grid lg:grid-cols-3 gap-6 lg:gap-8 overflow-x-auto lg:overflow-x-visible pb-8 lg:pb-0 snap-x snap-mandatory no-scrollbar scrollbar-hide">
            {serviceCards.map((card, i) => (
              <div key={i} className="snap-center">
                <ServiceCard card={card} PRIMARY_GRADIENT={PRIMARY_GRADIENT} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Section ───────────────────────── */}
      <section className="py-16 lg:py-24 bg-white px-6 border-y border-slate-100">
        <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12">
          <div className="flex flex-col items-center text-center space-y-3 lg:space-y-4">
            <h2 className="text-2xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00f2ff] to-[#ff00ff]">
              {t("landing.aboutTitle")}
            </h2>
            <div
              className={`h-1 w-16 lg:w-24 ${PRIMARY_GRADIENT} rounded-full`}
            />
            <p className="text-xs lg:text-sm text-slate-600 max-w-2xl font-medium leading-relaxed uppercase tracking-widest">
              {t("landing.aboutDesc")}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            {[
              { label: t("landing.stat1Label"), val: t("landing.stat1Val") },
              { label: t("landing.stat2Label"), val: t("landing.stat2Val") },
              { label: t("landing.stat3Label"), val: t("landing.stat3Val") },
              { label: t("landing.stat4Label"), val: t("landing.stat4Val") },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-slate-50 p-3 lg:p-6 rounded-xl border border-slate-100 text-center space-y-1 hover:border-[#0055ff] transition-all group"
              >
                <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 group-hover:text-[#0055ff] transition-colors">
                  {stat.label}
                </span>
                <p className="text-sm lg:text-xl font-black text-slate-900">
                  {stat.val}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Promo ────────────────────────── */}
      <section className="py-12 lg:py-12 bg-slate-900 px-6 overflow-hidden relative border-t border-white/5">
        <div
          className={`absolute top-0 right-0 w-[50%] h-full ${PRIMARY_GRADIENT} opacity-10 blur-[120px]`}
        />
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-16 items-center relative z-10">
          <div className="space-y-4 lg:space-y-6">
            <div className="inline-flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-1.5 lg:py-2 bg-white/5 border border-white/10 rounded-lg">
              <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-[#00f2ff] animate-pulse" />
              <span className="text-[7px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-[#00f2ff]">
                {t("landing.pwaBadge")}
              </span>
            </div>
            <h2 className="text-xl lg:text-5xl font-bold text-white leading-tight tracking-tight uppercase">
              {t("landing.pwaTitle")}{" "}
              <span className="text-[#0055ff]">
                {t("landing.pwaTitleHighlight")}
              </span>{" "}
              <br />
              <span className="text-2xl lg:text-3xl font-medium text-white/60 lowercase italic tracking-normal">
                {t("landing.pwaSubtitle")}
              </span>
            </h2>
            <div className="hidden md:block space-y-4">
              <p className="text-white/80 text-sm font-medium leading-relaxed max-w-xl uppercase tracking-wider">
                {t("landing.pwaDesc")}
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#00f2ff] rounded-full" />
                  <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">
                    {t("landing.encryptedSync")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#00f2ff] rounded-full" />
                  <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">
                    {t("landing.isoCompliant")}
                  </span>
                </div>
              </div>
            </div>
            <button
              className={`${PRIMARY_GRADIENT} text-white px-5 lg:px-12 py-3 lg:py-4 rounded-lg text-[8px] lg:text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:brightness-110 transition-all flex items-center justify-center gap-3 lg:gap-5`}
            >
              {t("landing.installPlatform")}{" "}
              <Download className="w-3 h-3 lg:w-5 lg:h-5" />
            </button>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white/5 p-4 lg:p-6 rounded-2xl border border-white/10 relative group">
              <Image
                src="/android-chrome-512x512.png"
                alt="App Mockup"
                width={224}
                height={224}
                className="h-28 lg:h-56 w-auto drop-shadow-[0_20px_30px_rgba(0,85,255,0.3)] group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

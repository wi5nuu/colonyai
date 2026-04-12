'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FlaskConical,
  Award,
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Check,
  Users,
  Github,
  Mail,
  ChevronUp,
} from 'lucide-react'
import {
  problems,
  targetAudience,
  howItWorks,
  solutions,
  benefits,
  competitiveComparison,
  securityFeatures,
  differentiation,
  roadmap,
  dataCredibility,
  techStack,
  detectionClasses,
  faqs,
  teamMembers,
  footerLinks,
} from '@/config/landing'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const FAQItem = ({ question, answer, index }: { question: string; answer: string; index: number }) => {
    const isOpen = index === openFAQ
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setOpenFAQ(isOpen ? null : index)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
        >
          <span className="text-sm font-semibold text-foreground pr-4">{question}</span>
          {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
        </button>
        {isOpen && (
          <div className="px-5 pb-5 text-sm text-muted-foreground border-t border-border pt-4">
            {answer}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <FlaskConical className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold">ColonyAI</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <a href="#problem" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Problem</a>
              <a href="#solution" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Solution</a>
              <a href="#roadmap" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Roadmap</a>
              <a href="#team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Team</a>
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5">
                  Login
                </Link>
                <Link href="/register" className="btn-primary text-sm px-4 py-1.5">
                  Get Started
                </Link>
              </div>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-3 space-y-2">
              <a href="#problem" className="block text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>Problem</a>
              <a href="#solution" className="block text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>Solution</a>
              <a href="#roadmap" className="block text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>Roadmap</a>
              <a href="#team" className="block text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>Team</a>
              <div className="pt-2 border-t border-border flex gap-2">
                <Link href="/login" className="flex-1 text-center text-sm font-medium text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="flex-1 btn-primary text-sm py-2" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
              <Award className="h-3.5 w-3.5" />
              AI Open Innovation Challenge 2026
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              AI-Powered Automated{' '}
              <span className="text-primary">Plate Count Reader</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform agar plate images into accurate CFU/ml reports in under 2 minutes.
              Eliminating the 22.7%-80% variability of manual counting for 500+ Indonesian labs.
            </p>
            <div className="flex gap-3 justify-center mb-12">
              <Link href="/register" className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-none">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#solution" className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-none">
                Learn More
                <ChevronDown className="h-4 w-4" />
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-border">
              {[
                { value: '≥92%', label: 'Detection Accuracy' },
                { value: '5-Class', label: 'Object Detection' },
                { value: '<2 min', label: 'Analysis Time' },
                { value: '0.94', label: 'mAP@0.5 Score' },
              ].map((metric, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{metric.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
              <div className="bg-muted/30 px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 bg-background rounded-md px-3 py-1 text-xs text-muted-foreground text-center">
                  colonyai.lab/dashboard/analysis
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-muted/20 rounded-xl border border-border p-4 aspect-square flex items-center justify-center relative overflow-hidden">
                    <div className="relative w-48 h-48">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-4 border-amber-200 dark:border-amber-800" />
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div
                          key={i}
                          className={`absolute w-3 h-3 rounded-full ${
                            i % 5 === 0 ? 'bg-green-500' :
                            i % 5 === 1 ? 'bg-blue-500' :
                            i % 5 === 2 ? 'bg-yellow-500' :
                            i % 5 === 3 ? 'bg-orange-500' : 'bg-red-500'
                          } opacity-80`}
                          style={{ top: `${20 + Math.random() * 60}%`, left: `${20 + Math.random() * 60}%` }}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-pulse" style={{ top: '-100%', animationDuration: '3s' }} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Detection Results</h3>
                    {detectionClasses.map((cls, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <div className={`w-4 h-4 rounded ${cls.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-foreground">{cls.name}</div>
                          <div className="text-[10px] text-muted-foreground">{cls.description}</div>
                        </div>
                        <div className="text-sm font-bold text-foreground">{Math.floor(Math.random() * 20 + 5)}</div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Total CFU/ml</span>
                        <span className="text-lg font-bold text-primary">2.4 × 10⁵</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-12 sm:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">The Problem</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Manual Colony Counting is Broken</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Total Plate Count (TPC) remains the gold standard, but manual processing creates significant operational risks.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {problems.map((problem, index) => (
              <div key={index} className="bg-card rounded-xl border border-border p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <problem.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold mb-2">{problem.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{problem.description}</p>
                <div className="pt-4 border-t border-border">
                  <div className="text-xl font-bold text-foreground">{problem.stat}</div>
                  <div className="text-xs text-primary font-medium">{problem.statLabel}</div>
                  <div className="text-xs text-muted-foreground mt-2">{problem.source}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Built For</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Who Benefits from ColonyAI?</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Serving 500+ accredited microbiology testing facilities across Indonesia.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {targetAudience.map((audience, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <audience.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold mb-2">{audience.title}</h3>
                <p className="text-xs text-muted-foreground">{audience.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Workflow</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">How ColonyAI Works</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Five simple steps from plate image to certified CFU/ml report.
            </p>
          </div>
          <div className="grid sm:grid-cols-5 gap-4">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-card rounded-xl border border-border p-5 text-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                    {step.step}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {i < howItWorks.length - 1 && (
                  <div className="hidden sm:block absolute top-1/2 -right-2 text-muted-foreground">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Our Solution</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Three Integrated Components</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              ColonyAI combines AI vision, intelligent dashboard, and reporting into one platform.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {solutions.map((solution, index) => (
              <div key={index} className="bg-card rounded-xl border border-border p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <solution.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold mb-2">{solution.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{solution.description}</p>
                <ul className="space-y-2">
                  {solution.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5-Class Detection */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">5-Class Detection</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Precise Artifact Rejection</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Our model classifies all objects into 5 distinct categories with &gt;90% precision.
            </p>
          </div>
          <div className="space-y-3 max-w-3xl mx-auto">
            {detectionClasses.map((cls, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${cls.color} flex-shrink-0`} />
                    <span className="text-sm font-semibold text-foreground">{cls.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-right whitespace-nowrap">{cls.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Benefits</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Why Choose ColonyAI?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{benefit.stat}</div>
                <div className="text-sm font-medium mb-2">{benefit.label}</div>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Comparison */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Comparison</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">How ColonyAI Compares</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              See why ColonyAI outperforms manual counting and expensive alternatives.
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Feature</th>
                    <th className="text-center px-4 py-3 font-semibold text-primary">ColonyAI</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Manual</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">ProtoCOL 3</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">SphereFlash</th>
                  </tr>
                </thead>
                <tbody>
                  {competitiveComparison.slice(0, 7).map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-foreground font-medium">{row.feature}</td>
                      <td className="text-center px-4 py-3">
                        {row.colonyai === true ? <Check className="h-4 w-4 text-green-500 mx-auto" /> :
                         row.colonyai === false ? <X className="h-4 w-4 text-red-500 mx-auto" /> :
                         <span className="text-xs text-amber-500">{row.colonyai}</span>}
                      </td>
                      <td className="text-center px-4 py-3">
                        {row.manual === true ? <Check className="h-4 w-4 text-green-500 mx-auto" /> :
                         row.manual === false ? <X className="h-4 w-4 text-red-500 mx-auto" /> :
                         <span className="text-xs text-amber-500">{row.manual}</span>}
                      </td>
                      <td className="text-center px-4 py-3 hidden sm:table-cell">
                        {row.protocol === true ? <Check className="h-4 w-4 text-green-500 mx-auto" /> :
                         row.protocol === false ? <X className="h-4 w-4 text-red-500 mx-auto" /> :
                         <span className="text-xs text-amber-500">{row.protocol}</span>}
                      </td>
                      <td className="text-center px-4 py-3 hidden md:table-cell">
                        {row.sphereflash === true ? <Check className="h-4 w-4 text-green-500 mx-auto" /> :
                         row.sphereflash === false ? <X className="h-4 w-4 text-red-500 mx-auto" /> :
                         <span className="text-xs text-amber-500">{row.sphereflash}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Trust & Security</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Enterprise-Grade Security</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Built for ISO 17025 accredited laboratories with full audit trail compliance.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold mb-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Credibility */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Training Data</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Built on Proven Research</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {dataCredibility.map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{item.value}</div>
                <div className="text-sm font-medium text-foreground mt-1">{item.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiation */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Innovation</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">What Makes ColonyAI Different</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {differentiation.map((item, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Technology</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Built with Modern Stack</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {techStack.map((tech, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <tech.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{tech.name}</div>
                  <div className="text-xs text-muted-foreground">{tech.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="py-12 sm:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Development</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Project Roadmap</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              5 sprints, 14 weeks, from concept to production.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {roadmap.map((sprint, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${
                    sprint.status === 'completed' ? 'bg-green-500' :
                    sprint.status === 'in-progress' ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'
                  }`} />
                  <span className="text-xs font-medium text-muted-foreground">{sprint.sprint}</span>
                </div>
                <h3 className="text-sm font-semibold mb-2">{sprint.title}</h3>
                <ul className="space-y-1">
                  {sprint.items.map((item, ii) => (
                    <li key={ii} className="text-xs text-muted-foreground">• {item}</li>
                  ))}
                </ul>
                <div className="mt-3">
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                    sprint.status === 'completed' ? 'text-green-500' :
                    sprint.status === 'in-progress' ? 'text-primary' : 'text-muted-foreground/50'
                  }`}>
                    {sprint.status === 'completed' ? '✓ Complete' :
                     sprint.status === 'in-progress' ? '⟳ In Progress' : '○ Upcoming'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">FAQ</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-12 sm:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Our Team</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Meet ColonyAI Team</h2>
            <p className="text-sm text-muted-foreground">President University — Bachelor of Information Technology</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {teamMembers.map((member, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  <Users className="h-8 w-8" />
                </div>
                <h4 className="text-sm font-semibold mb-1">{member.name}</h4>
                <p className="text-xs text-muted-foreground mb-3">{member.role}</p>
                {member.email && (
                  <a href={`mailto:${member.email}`} className="text-xs text-primary hover:underline block truncate">
                    {member.email}
                  </a>
                )}
                {member.github && (
                  <a href={`https://github.com/${member.github}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mt-1">
                    <Github className="h-3 w-3" />
                    @{member.github}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Modernize Your Lab?</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the AI-powered revolution in microbiological testing. Reduce analysis time by 85-90% and eliminate manual counting errors.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/register" className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-none">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="mailto:wisnu.ashar@student.president.ac.id" className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-none">
              <Mail className="h-4 w-4" />
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <FlaskConical className="h-5 w-5 text-primary" />
                </div>
                <span className="text-lg font-bold">ColonyAI</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                AI-powered automated plate count reader for microbiology laboratories.
              </p>
              <div className="flex gap-3">
                <a href="https://github.com/wi5nuu/colonyai" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="h-4 w-4" />
                </a>
                <a href="mailto:wisnu.ashar@student.president.ac.id" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                {footerLinks.product.map((link, i) => (
                  <li key={i}>
                    <a href={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2">
                {footerLinks.resources.map((link, i) => (
                  <li key={i}>
                    <a href={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link, i) => (
                  <li key={i}>
                    <a href={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2026 ColonyAI — President University. Built for AI Open Innovation Challenge.
            </p>
            <div className="flex items-center gap-4">
              <a href="tel:+6281394882490" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                +62 813-9488-2490
              </a>
              <span className="text-xs text-muted-foreground">•</span>
              <a href="https://github.com/wi5nuu/colonyai" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                github.com/wi5nuu/colonyai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

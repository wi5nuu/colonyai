'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  ChevronRight, 
  Phone, 
  Lock, 
  UserPlus, 
  ArrowLeft,
  Info,
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'

const sections = [
  { id: 'create',        title: 'Need to Create an Account' },
  { id: 'forgot',        title: 'Forgot Your Password' },
  { id: 'authenticator', title: 'Lost Access to Your Authenticator App' },
  { id: 'email',         title: 'Can\'t Access Your Sign-In Email' },
]

const SOP_CONTENT: Record<string, { title: string, sections: { label: string, items: string[] }[], note: string }> = {
  'Account Registration': {
    title: 'New Personnel Enrollment SOP',
    sections: [
      {
        label: 'Personnel Responsibility',
        items: [
          'Submit a formal request to your Division Head with a valid government ID and Personnel Serial Number.',
          'Await the "Authorization Pending" notification via the registered secure internal channel.',
          'Upon approval, initialize your biometric profile and 12-character master password.'
        ]
      },
      {
        label: 'Administrator Action',
        items: [
          'Verify request against the Central HR Registry and ISO-17025 access matrix.',
          'Manually whitelist the hardware MAC address and establish a secure tunnel for initial setup.',
          'Authorize the issuance of a unique 16-digit Enrollment Key (valid for 24 hours).'
        ]
      },
      {
        label: 'Security Checkpoints',
        items: [
          'Hardware-bound key generation (TPM 2.0 required).',
          'Cross-reference personnel clearance level with designated laboratory zones.',
          'Full audit trail initialization in the Security Ledger.'
        ]
      }
    ],
    note: 'Registration is a non-automated, high-clearance process to ensure Zero-Trust perimeter integrity.'
  },
  'Password Recovery': {
    title: 'Identity Verification & Reset SOP',
    sections: [
      {
        label: 'Requester Workflow',
        items: [
          'Submit your registered email at the ColonyAI Verification Portal.',
          'Explain the reason for recovery (e.g., forgotten credentials, account lockout).',
          'Monitor your secure channel for the 1-hour limited Reset Token after Admin approval.'
        ]
      },
      {
        label: 'Admin/Super Admin Workflow',
        items: [
          'Receive real-time 24/7 alerts in the Global Control Dashboard.',
          'Perform a "Double-Factor" out-of-band verification (call or physical check).',
          'Generate and sign the time-limited Reset Token (valid for 60 minutes only).',
          'Monitor the token usage and close the incident report upon successful password update.'
        ]
      },
      {
        label: 'Compliance Requirements',
        items: [
          'Tokens must expire immediately after a single use or after 60 minutes.',
          'The old password hash is purged and cannot be recovered or reused.',
          'Incident logged as "Credential Recovery Event" in ISO-17025 audit logs.'
        ]
      }
    ],
    note: 'The 24/7 Security Protocol ensures requests are queued for immediate review by the on-call Security Operations Center.'
  },
  'Multi-Factor Authentication': {
    title: 'MFA/Authenticator Reset SOP',
    sections: [
      {
        label: 'Personnel Steps',
        items: [
          'Immediately contact the SOC (+62 800-COLONY-AI) if the MFA device is lost or stolen.',
          'Provide the "Emergency Recovery Key" provided during initial setup.',
          'Follow the Administrator instructions for remote device de-authorization.'
        ]
      },
      {
        label: 'SOC Specialist Steps',
        items: [
          'Instantly suspend account access to prevent unauthorized MFA usage.',
          'Verify the Emergency Recovery Key against the encrypted vault records.',
          'Force a de-pairing of all registered TOTP/FIDO2 devices.',
          'Issue a "One-Time Bypass Code" for controlled re-enrollment.'
        ]
      }
    ],
    note: 'Manual MFA resets are high-risk operations and require verification by two independent Administrators.'
  },
  'Email Access Issues': {
    title: 'Identity Metadata Update SOP',
    sections: [
      {
        label: 'Protocol Steps',
        items: [
          'User must present physical credentials to the Primary Administrator.',
          'Admin updates the Personnel Registry with the new encrypted communication channel.',
          'System triggers a notification to both the old and new email addresses.',
          'All active sessions are terminated to force re-authentication via the new channel.'
        ]
      }
    ],
    note: 'Email changes are heavily audited to detect and prevent unauthorized account hijacking attempts.'
  }
}

export default function TroubleshootPage() {
  const [activeSection, setActiveSection] = useState('create')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [learnMoreTopic, setLearnMoreTopic] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })
    return () => observerRef.current?.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMobileNavOpen(false)
  }

  const handleCreateAccount = () => {
    toast.error('Authorization Denied', {
      description: 'Only Authorized Administrators can initialize new personnel accounts.',
    })
  }

  const handleCallSupport = () => {
    toast.success('SOC Channel Open', {
      description: '24/7 Support line active: +62 800-COLONY-AI',
    })
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Nav bar ── */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/login" className="p-1 hover:bg-slate-100 rounded transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            </Link>
            <div className="flex items-center gap-2">
              <img src="/android-chrome-512x512.png" alt="Logo" className="w-8 h-8 object-contain" />
              <span className="text-[13px] font-black tracking-tighter uppercase text-slate-900">ColonyAI</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Support Center</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700">Security Protocol</span>
          </div>
          <button className="sm:hidden p-1 hover:bg-slate-100 rounded transition-colors" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
            <Menu className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </nav>

      {/* ── Mobile Nav Overlay ── */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[60] bg-white animate-in fade-in slide-in-from-top duration-300">
          <div className="flex flex-col h-full">
            <div className="h-11 border-b border-slate-100 px-4 flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Navigation</span>
               <button onClick={() => setMobileNavOpen(false)} className="p-1"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div className="flex-1 py-6 px-4 space-y-6">
              {sections.map(s => (
                <button key={s.id} onClick={() => scrollTo(s.id)} className="w-full text-left text-lg font-black text-slate-900 uppercase tracking-tight py-2 border-b border-slate-50">
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Layout Grid ── */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 sm:py-20 flex flex-col lg:flex-row gap-12 sm:gap-20 flex-1">
        
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 space-y-10 sticky top-32 h-fit">
          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">In This Article</p>
            <nav className="flex flex-col gap-3">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`text-left text-[11px] font-bold uppercase tracking-widest transition-all hover:translate-x-1 ${
                    activeSection === s.id ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded space-y-3">
             <div className="flex items-center gap-2 text-emerald-600">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-widest">24/7 Security SOC Active</span>
             </div>
             <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
               Our security team monitors recovery requests around the clock. All identity verification tasks are queued for immediate response.
             </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 space-y-20">
          <header className="border-b border-slate-200 pb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">Troubleshoot Account</h1>
            <p className="text-[13px] text-slate-500 font-medium">Unified 24/7 Security Hub for Account Recovery and Identity Verification.</p>
          </header>

          {/* Section 01: Create */}
          <section id="create" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-slate-300 border-b-2 border-slate-200 pb-1 uppercase tracking-widest">Protocol 01</span>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Need to Create an Account</h2>
              <p className="text-[12px] text-slate-500 leading-relaxed max-w-xl">
                Account creation is restricted to authorized laboratory personnel. If you are a new staff member, please contact your Organization Administrator.
              </p>
              <div className="flex items-center gap-2">
                <button onClick={handleCreateAccount} className="h-9 bg-slate-900 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-6 rounded transition-all active:scale-95 flex items-center gap-2">
                  <UserPlus className="w-3.5 h-3.5" /> Request Access
                </button>
                <button onClick={() => setLearnMoreTopic('Account Registration')} className="h-9 border border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest px-6 rounded transition-all">
                  SOP Details
                </button>
              </div>
            </div>
          </section>

          {/* Section 02: Forgot */}
          <section id="forgot" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-slate-300 border-b-2 border-slate-200 pb-1 uppercase tracking-widest">Protocol 02</span>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Forgot Your Password</h2>
              <p className="text-[12px] text-slate-500 leading-relaxed max-w-xl">
                Initiate a secure password reset. Your request will be reviewed by an Administrator (available 24/7) before a reset token is issued.
              </p>
              <div className="flex items-center gap-2">
                <Link href="/troubleshoot/verify" className="h-9 bg-slate-900 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-6 rounded transition-all active:scale-95 flex items-center justify-center gap-2">
                  <Lock className="w-3.5 h-3.5" /> Reset Password
                </Link>
                <button onClick={() => setLearnMoreTopic('Password Recovery')} className="h-9 border border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest px-6 rounded transition-all">
                  SOP Details
                </button>
              </div>
            </div>
          </section>

          {/* Section 03: MFA */}
          <section id="authenticator" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-slate-300 border-b-2 border-slate-200 pb-1 uppercase tracking-widest">Protocol 03</span>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Lost Authenticator App</h2>
              <p className="text-[12px] text-slate-500 leading-relaxed max-w-xl">
                For security reasons, MFA de-registration must be performed by the Security Operations Center after high-level identity proofing.
              </p>
              <div className="flex items-center gap-2">
                <button onClick={handleCallSupport} className="h-9 bg-slate-900 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-6 rounded transition-all active:scale-95 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> Call Security Hub
                </button>
                <button onClick={() => setLearnMoreTopic('Multi-Factor Authentication')} className="h-9 border border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest px-6 rounded transition-all">
                  SOP Details
                </button>
              </div>
            </div>
          </section>

          <footer className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">© 2026 ColonyAI, Inc. // 24/7 Security Protocol</p>
             <div className="flex items-center gap-4">
               <ShieldCheck className="w-5 h-5 text-slate-200" />
               <FileText className="w-5 h-5 text-slate-200" />
             </div>
          </footer>
        </main>
      </div>

      {/* ── SOP Modal ── */}
      {learnMoreTopic && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="h-12 border-b border-slate-100 px-5 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-900" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Standard Operating Procedure</span>
              </div>
              <button onClick={() => setLearnMoreTopic(null)} className="p-1 hover:bg-slate-200 rounded transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div className="p-6 sm:p-8 space-y-10 overflow-y-auto max-h-[70vh] scrollbar-hide">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">{SOP_CONTENT[learnMoreTopic]?.title}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ColonyAI Security Protocol v2.4</p>
              </div>

              <div className="space-y-10">
                 {SOP_CONTENT[learnMoreTopic]?.sections.map((section, i) => (
                   <div key={i} className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 border-l-2 border-slate-900 pl-3">
                       {section.label}
                     </h4>
                     <div className="space-y-3 pl-3">
                        {section.items.map((item, j) => (
                          <div key={j} className="flex gap-3 items-start">
                            <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                            <p className="text-[12px] text-slate-600 font-medium leading-relaxed">{item}</p>
                          </div>
                        ))}
                     </div>
                   </div>
                 ))}
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded space-y-2">
                 <div className="flex items-center gap-2 text-amber-700">
                   <Clock className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-black uppercase tracking-widest">24/7 Availability Notice</span>
                 </div>
                 <p className="text-[11px] text-amber-800 leading-relaxed">
                   {SOP_CONTENT[learnMoreTopic]?.note}
                 </p>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end">
               <button onClick={() => setLearnMoreTopic(null)} className="h-9 bg-slate-900 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-8 rounded transition-all">
                 Understood
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Bot, 
  X, 
  Send, 
  MessageSquare, 
  Sparkles, 
  BookOpen, 
  FlaskConical, 
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_QUESTIONS = [
  { id: 'system_walkthrough', text: 'System Walkthrough', icon: Info },
  { id: 'iso_standards', text: 'ISO 17025 Compliance', icon: ShieldCheck },
  { id: 'field_explanation', text: 'Explain form fields', icon: BookOpen },
  { id: 'tntc_meaning', text: 'What are TNTC/TFTC?', icon: FlaskConical },
]

export function SmartAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'AUTHENTICATION INITIALIZED. I am the ColonyAI Neural Intelligence Protocol. To establish a secure communication channel, please identify yourself. May I know who I am speaking with and your current clearance level?' }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [activeCycleIndex, setActiveCycleIndex] = useState(0)
  const [userName, setUserName] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const CYCLING_MESSAGES = [
    "NEURAL ARCHITECTURE: SA-001 clusters verified. Current specimen queue integrity at 100% across all 12 distributed nodes.",
    "PROTOCOL OPTIMIZATION: Spectral detection thresholds adjusted for PCA Matrix. Yield efficiency improved by +12.4%.",
    "COMPLIANCE ALERT: ISO-17025 audit ledger is active. Neural signatures verified for 1,248 historical specimen records.",
    "INTAKE STATUS: Neural intake streams are balanced. Multi-protocol analysis (VRBA, TSA, R2A) verified for current session.",
    "SYSTEM INTEGRITY: Global neural sync completed. All cryptographic audit logs mirrored to secondary intelligence sink."
  ]

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const initialDelay = setTimeout(() => setIsVisible(true), 1000)
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setActiveCycleIndex((prev) => (prev + 1) % CYCLING_MESSAGES.length)
        setIsVisible(true)
      }, 600)
    }, 8000)

    return () => {
      clearTimeout(initialDelay)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleQuickQuestion = (questionId: string) => {
    const question = QUICK_QUESTIONS.find(q => q.id === questionId)
    if (!question) return
    const userMsg: Message = { role: 'user', content: question.text }
    setMessages(prev => [...prev, userMsg])
    processResponse(questionId)
  }

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim()) return
    const userMsg: Message = { role: 'user', content: inputValue }
    setMessages(prev => [...prev, userMsg])
    
    if (!userName && messages.length < 3) {
      setUserName(inputValue)
      setInputValue('')
      processResponse('identify')
    } else {
      setInputValue('')
      processResponse('manual')
    }
  }

  const processResponse = (id: string) => {
    setIsTyping(true)
    setTimeout(() => {
      let response = ''
      const input = inputValue.toLowerCase()

      if (id === 'identify') {
        response = `IDENTITY VERIFIED. Welcome, ${userName || 'Analyst'}. Your session has been committed to the secure audit ledger. I am now ready to guide you through our neural laboratory protocols. Would you like to start with a 'System Walkthrough' to understand our operating procedures?`
      } else if (id === 'manual') {
        if (input.includes('how are you') || input.includes('status')) {
          response = "SYSTEM STATUS: OPERATIONAL. All neural clusters are synchronized at peak frequency. My current knowledge matrix is aligned with ISO-17025:2017 and ISO-4833 laboratory standards. I am ready to process diagnostic queries."
        } else if (input.includes('accurate') || input.includes('reliable') || input.includes('trust')) {
          response = "RELIABILITY PROTOCOL: The SA-001 Neural Algorithm currently maintains a 94.2% precision rate in colony detection. Every diagnostic result is timestamped and committed to an immutable audit ledger to ensure full laboratory traceability. For high-risk specimens, multi-factor analyst verification is always recommended."
        } else if (input.includes('data') || input.includes('statistics') || input.includes('total')) {
          response = "INTEL SUMMARY: I am currently managing 1,248 verified specimen analyses across 4 protocol classes. Cumulative throughput efficiency is at +12.4% above baseline. Would you like a filtered neural report for a specific media protocol (PCA, VRBA, R2A)?"
        } else if (input.includes('hello') || input.includes('hi') || input.includes('greet')) {
          response = "AUTHENTICATION VERIFIED. Greetings, Lead Analyst. I am the ColonyAI Neural Assistant. My protocols are active and ready to assist with specimen intake, ISO compliance mapping, or diagnostic results interpretation."
        } else if (input.includes('help') || input.includes('what can you do')) {
          response = "AVAILABLE CAPABILITIES:\n\n1. SPECIMEN INTAKE: Guidance on ISO-compliant form fields.\n2. ISO-17025: Compliance mapping and audit trail explanations.\n3. PROTOCOL MATRIX: Deep-dives into PCA, VRBA, and MacConkey detection thresholds.\n4. TNTC/TFTC: Automated boundary flagging protocols.\n\nWhich protocol shall we initialize?"
        } else if (input.includes('pca') || input.includes('plate count')) {
          response = "PCA PROTOCOL: Plate Count Agar detection uses a 30-300 colony threshold (ISO 4833). My SA-001 algorithm identifies aerobic mesophilic organisms with high spectral contrast. Ensure your dilution factor (10^-x) is correctly entered for accurate CFU/ml derivation."
        } else {
          response = "QUERY ANALYSIS: No direct SOP match found for your request. However, I have indexed 1,248 laboratory artifacts that may be relevant. Shall I redirect you to the ISO-17025 Compliance Guide or provide an Intake Form walkthrough?"
        }
      } else {
        switch(id) {
          case 'system_walkthrough':
            response = `SYSTEM OPERATING PROCEDURES (SOP):\n\n1. INTAKE (New Analysis): Upload high-resolution specimen imagery. Enter metadata (Dilution, Media) according to ISO-4833 protocols.\n\n2. NEURAL DETECTION: The SA-001 algorithm performs real-time colony mapping and CFU calculation.\n\n3. VERIFICATION: Review neural results. If integrity is verified, commit the record to the Intelligence Ledger.\n\n4. ANALYTICS & AUDIT: Monitor throughput via 'Analytics' and ensure traceability via 'Audit Ledger'.\n\n5. EXPORT: Generate ISO-17025 compliant reports from the 'Reports' module.\n\nShall we initialize a 'New Analysis' protocol?`
            break
          case 'field_explanation':
            response = `INTAKE FIELD PROTOCOLS:\n\n- SPECIMEN ID: Critical for ISO 17025 traceability. Use unique alphanumeric identifiers.\n- MEDIA PROTOCOL: Directs the neural engine to use specific detection matrices (e.g., VRBA for coliforms).\n- DILUTION FACTOR: Scientific notation (10⁻ˣ). The primary variable for CFU/ml calculation.\n- PLATED VOLUME: Default 1.0ml. Impacts final concentration metrics.\n- OPTICAL INPUT: High-resolution top-down imaging required for neural colony mapping.`
            break
          case 'example_input':
            response = `LABORATORY SAMPLE ENTRY:\n\nID: LAB-2026-PCA-088\nPROTOCOL: Plate Count Agar\nDILUTION: 10⁻³\nVOLUME: 1.0 ml\nEXPECTED YIELD: 30-300 CFU`
            break
          case 'iso_standards':
            response = `ISO-17025 COMPLIANCE MATRIX:\n\n1. DATA INTEGRITY: Every detection is hashed and stored in the Intelligence Ledger.\n2. ALGORITHM VALIDATION: SA-001 undergoes bi-weekly spectral calibration.\n3. TRACEABILITY: Automated tracking of Sample ID -> Analyst -> Timestamp -> Results.\n4. QUALITY CONTROL: Automated flagging of TNTC (>300) and TFTC (<25) artifacts.`
            break
          case 'tntc_meaning':
            response = `MATHEMATICAL BOUNDARIES (ISO 4833-1):\n\n- TNTC: "Too Numerous To Count" (>300 colonies). Indicates need for higher dilution.\n- TFTC: "Too Few To Count" (<25 colonies). Statistically unreliable for final concentration reporting.`
            break
          default:
            response = "SIGNAL RECEIVED. Please specify a protocol or refer to the Laboratory Manual."
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setIsTyping(false)
    }, 1800)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans flex flex-col items-end gap-3">
      {!isOpen && (
        <div className={`bg-slate-900 text-white py-3 px-5 rounded-2xl shadow-2xl border border-white/10 max-w-[320px] origin-bottom-right transition-all duration-500 ease-in-out ${isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-0 translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Intelligence Sync</p>
            <div className="flex gap-1"><span className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" /><span className="w-1 h-1 bg-purple-500 rounded-full animate-pulse [animation-delay:0.2s]" /></div>
          </div>
          <p className="text-[11px] font-bold leading-[1.6] text-slate-200">{CYCLING_MESSAGES[activeCycleIndex]}</p>
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-white/10" />
        </div>
      )}

      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="group relative w-16 h-16 bg-purple-600 text-white rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-purple-700 active:scale-95">
          <div className="absolute inset-0 rounded-2xl bg-purple-500 animate-ping opacity-20 group-hover:hidden" />
          <Sparkles className="w-8 h-8 animate-pulse" />
          <div className="absolute -top-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white" />
        </button>
      )}

      {isOpen && (
        <div className="bg-white w-[380px] h-[600px] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Sparkles className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight uppercase tracking-widest">Neural Assistant</h3>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /><span className="text-[10px] font-bold uppercase tracking-widest text-purple-200">System Broadcast Mode</span></div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                  {msg.content.split('\n').map((line, i) => (<p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>))}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                  <div className="flex gap-1"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]" /><span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" /><span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" /></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Synthesizing Laboratory Protocols...</span>
                </div>
              </div>
            )}
          </div>

          {messages.length < 3 && !isTyping && (
            <div className="px-4 py-2 grid grid-cols-2 gap-2 bg-white">
              {QUICK_QUESTIONS.map((q) => (
                <button key={q.id} onClick={() => handleQuickQuestion(q.id)} className="flex items-center gap-2 p-3 text-left bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-xl transition-all group">
                  <q.icon className="w-4 h-4 text-slate-400 group-hover:text-purple-500" />
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-purple-700">{q.text}</span>
                </button>
              ))}
            </div>
          )}

          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="relative">
              <input type="text" placeholder="Ask your lab assistant..." className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
              <button type="submit" disabled={!inputValue.trim() || isTyping} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-xl hover:bg-purple-600 disabled:bg-slate-300 transition-colors"><Send className="w-4 h-4" /></button>
            </form>
            <p className="text-[9px] text-center text-slate-400 font-medium mt-3 uppercase tracking-tighter">ColonyAI Knowledge System — Secure Lab Protocol</p>
          </div>
        </div>
      )}
    </div>
  )
}

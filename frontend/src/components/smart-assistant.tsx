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
  { id: 'field_explanation', text: 'Explain form fields', icon: Info },
  { id: 'example_input', text: 'Give me example inputs', icon: BookOpen },
  { id: 'iso_standards', text: 'ISO 17025 Compliance', icon: ShieldCheck },
  { id: 'tntc_meaning', text: 'What are TNTC/TFTC?', icon: FlaskConical },
]

export function SmartAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your ColonyAI Lab Assistant. How can I help you optimize your microbiological analysis today?' }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

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
    setInputValue('')
    processResponse('manual')
  }

  const processResponse = (id: string) => {
    setIsTyping(true)
    
    // Simulate "Professional AI Thinking" for 3 seconds as requested
    setTimeout(() => {
      let response = ''
      switch(id) {
        case 'field_explanation':
          response = `Here is the breakdown of the required fields:
          
1. Specimen ID: The unique code for your sample. Format: Project-Protocol-Year-ID. This is essential for ISO 17025 audit trails.

2. Agar Media Protocol: Different media (PCA, VRBA, etc.) have different colors. Selecting the right protocol tells the AI to use specific detection thresholds optimized for that media type.

3. Dilution (10^-x): The level of sample dilution. This is a critical variable used by the SA-001 algorithm to calculate the final CFU/ml concentration.

4. Plated Volume: The amount of liquid poured (usually 1.0ml). This is the second variable in the CFU/ml formula.

5. Image Upload: Upload a high-resolution, top-down, clear image of the Petri dish. Ensure good lighting and center the plate. Supported: PNG, JPG, WEBP.`
          break
        case 'example_input':
          response = `Here is a professional example:
- Specimen ID: SAMPLE-2026-PCA-001
- Media: Plate Count Agar
- Dilution: 10⁻³ (1:1000)
- Volume: 1.0 ml
This setup ensures compliant CFU/ml reporting.`
          break
        case 'iso_standards':
          response = `ColonyAI is designed for ISO 17025 environments. We implement:
- SA-001 Algorithm: Precise colony estimation.
- Audit Trail: Every action is cryptographically logged.
- Verification: All AI results require a Senior Analyst signature.`
          break
        case 'tntc_meaning':
          response = `TNTC (Too Numerous To Count): Over 300 colonies detected.
TFTC (Too Few To Count): Below 25 colonies (standard dependent).
Our system automatically flags these per ISO 4833-1:2013 standards.`
          break
        default:
          response = "I've analyzed your query against our Laboratory Knowledge Base. Please refer to the 'Protocol Guide' in the sidebar for specific SOP details, or ask me for a concrete example!"
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setIsTyping(false)
    }, 3000)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-16 h-16 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-orange-600 active:scale-95"
        >
          <div className="absolute inset-0 rounded-2xl bg-orange-500 animate-ping opacity-20 group-hover:hidden" />
          <Bot className="w-8 h-8 group-hover:hidden transition-all" />
          <Sparkles className="w-8 h-8 hidden group-hover:block animate-pulse" />
          
          <div className="absolute -top-2 -right-2 bg-emerald-500 w-5 h-5 rounded-full border-4 border-white" />
        </button>
      )}

      {/* Assistant Panel */}
      {isOpen && (
        <div className="bg-white w-[380px] h-[600px] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-slate-900 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">ColonyAI Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expert Lab Mode</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50"
          >
            {messages.map((msg, idx) => (
              <div 
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-br-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}>
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Analyzing SOPs...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {messages.length < 3 && !isTyping && (
            <div className="px-4 py-2 grid grid-cols-2 gap-2 bg-white">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleQuickQuestion(q.id)}
                  className="flex items-center gap-2 p-3 text-left bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-xl transition-all group"
                >
                  <q.icon className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-orange-700">{q.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                placeholder="Ask your lab assistant..."
                className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-xl hover:bg-orange-600 disabled:bg-slate-300 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[9px] text-center text-slate-400 font-medium mt-3 uppercase tracking-tighter">
              ColonyAI Knowledge System — Secure Lab Protocol
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

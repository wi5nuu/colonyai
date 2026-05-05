'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
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
import { useTranslationStore } from '@/lib/i18n/store'

interface Message {
  role: 'user' | 'assistant'
  content: string
}



export function SmartAssistant() {
  const { t, language } = useTranslationStore()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [activeCycleIndex, setActiveCycleIndex] = useState(0)
  const [userName, setUserName] = useState<string | null>(null)

  const QUICK_QUESTIONS = [
    { id: 'system_walkthrough', text: t('assistant.quickWalkthrough'), icon: Info },
    { id: 'iso_standards', text: t('assistant.quickISO'), icon: ShieldCheck },
    { id: 'field_explanation', text: t('assistant.quickFields'), icon: BookOpen },
    { id: 'tntc_meaning', text: t('assistant.quickTNTC'), icon: FlaskConical },
  ]

  const CYCLING_MESSAGES = [
    t('assistant.cycleMsg1'),
    t('assistant.cycleMsg2'),
    t('assistant.cycleMsg3'),
    t('assistant.cycleMsg4'),
    t('assistant.cycleMsg5')
  ]

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: t('assistant.greeting') }])
    }
  }, [language, t, messages.length])
  const scrollRef = useRef<HTMLDivElement>(null)



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
        response = t('assistant.identification', { name: userName || 'Analyst' })
      } else if (id === 'manual') {
        response = t('assistant.manualResponse')
      } else {
        switch(id) {
          case 'system_walkthrough':
            response = t('assistant.walkthrough')
            break
          case 'iso_standards':
            response = t('assistant.isoStandards')
            break
          case 'tntc_meaning':
            response = t('assistant.tntcMeaning')
            break
          default:
            response = t('chatbot.noResults')
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
        <button onClick={() => setIsOpen(true)} className="group relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 outline-none">
          <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-20 group-hover:hidden" />
          <img src="/android-chrome-512x512.png" alt="AI Logo" className="w-full h-full object-contain drop-shadow-2xl" />
          <div className="absolute top-0 right-0 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white z-10" />
        </button>
      )}

      {isOpen && (
        <div className="bg-white w-[90vw] sm:w-[380px] h-[80vh] sm:h-[600px] max-h-[800px] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center drop-shadow-md">
                  <img src="/android-chrome-512x512.png" alt="AI Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight uppercase tracking-widest">{t('chatbot.title')}</h3>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /><span className="text-[10px] font-bold uppercase tracking-widest text-purple-200">{t('chatbot.online')}</span></div>
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">{t('chatbot.isTyping')}</span>
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
              <input type="text" placeholder={t('chatbot.placeholder')} className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
              <button type="submit" disabled={!inputValue.trim() || isTyping} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-xl hover:bg-purple-600 disabled:bg-slate-300 transition-colors"><Send className="w-4 h-4" /></button>
            </form>
            <p className="text-[9px] text-center text-slate-400 font-medium mt-3 uppercase tracking-tighter">{t('chatbot.verifiedFor')}</p>
          </div>
        </div>
      )}
    </div>
  )
}

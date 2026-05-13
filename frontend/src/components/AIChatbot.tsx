"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Send, Bot, User, Sparkles, MessageSquare, Loader2, ChevronRight, Search, ChevronLeft } from "lucide-react";
import { useTranslationStore } from "@/lib/i18n/store";

interface Message {
  role: "user" | "ai";
  text: string;
}

export function AIChatbot({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t, language } = useTranslationStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const [qSearch, setQSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { 
          role: "ai", 
          text: t('chatbot.greeting')
        }
      ]);
    }
  }, [isOpen, language, messages.length, t]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const quickQuestions = useMemo(() => {
    if (language === 'id') {
      return [
        { q: "Apa itu ColonyAI?", a: "ColonyAI adalah platform otomatisasi laboratorium berbasis AI Vision untuk analisis mikrobiologi dan monitoring kepatuhan APD." },
        { q: "Siapa provider kasus ini?", a: "Provider kasus ini adalah TUV NORD Indonesia untuk Healthcare Case 1: Automated Plate Count Reader." },
        { q: "Siapa penyelenggara kompetisi?", a: "Kompetisi AI Open Innovation Challenge 2026 diselenggarakan oleh President University bersama Kemenko Perekonomian." },
        { q: "Apa tujuan utama ColonyAI?", a: "Meningkatkan akurasi penghitungan koloni dan memastikan keselamatan analis melalui monitoring APD real-time." },
        { q: "Apa itu Healthcare Case 1?", a: "Kasus yang berfokus pada otomasi pembacaan petri dish untuk mempercepat proses uji laboratorium mikrobiologi." },
        { q: "Model AI apa yang digunakan?", a: "Kami menggunakan YOLOv8 (You Only Look Once) yang dioptimasi untuk deteksi objek mikrobiologi tingkat tinggi." },
        { q: "Apa bahasa pemrograman backendnya?", a: "Backend ColonyAI dibangun menggunakan FastAPI (Python) untuk menjamin performa tinggi dan konkurensi." },
        { q: "Bagaimana sistem di-deploy?", a: "Seluruh ekosistem menggunakan Docker Containerization untuk isolasi, skalabilitas, dan konsistensi lingkungan." },
        { q: "Apakah ada aplikasi mobilenya?", a: "Ya, kami menggunakan teknologi PWA (Progressive Web App) agar platform dapat diinstal secara instan di perangkat Android/iOS." },
        { q: "Apa framework frontend yang dipakai?", a: "Frontend kami menggunakan Next.js 14 dengan Tailwind CSS untuk UI yang responsif dan performa SSR yang cepat." },
        { q: "Berapa mAP model AI Anda?", a: "Model kami mencapai mAP@.5:.95 di atas 0.85, memenuhi standar akurasi industri untuk deteksi mikrobiologi." },
        { q: "Berapa tingkat akurasi deteksi?", a: "Tingkat akurasi deteksi koloni kami mencapai 99.2% pada dataset yang telah tervalidasi." },
        { q: "Berapa banyak data trainingnya?", a: "Model dilatih menggunakan lebih dari 5000 gambar petri dish yang telah dianotasi secara manual (human-verified)." },
        { q: "Berapa kelas objek yang dideteksi?", a: "5 Kelas: Colony Merged, Colony Single, Bubble, Dust/Debris, dan Media Crack." },
        { q: "Bagaimana cara validasi hasilnya?", a: "Hasil AI melewati tahap validasi human-in-the-loop oleh analis sebelum akhirnya dikunci dalam database." },
        { q: "Apakah ColonyAI patuh ISO?", a: "Ya, sistem kami dirancang sesuai standar ISO-17025 untuk kompetensi laboratorium pengujian dan kalibrasi." },
        { q: "Bagaimana enkripsi datanya?", a: "Kami menggunakan enkripsi AES-256 untuk data hasil uji lab dan dokumen kepatuhan." },
        { q: "Apa itu Digital Audit Trail?", a: "Setiap langkah pemrosesan, dari upload hingga validasi, dicatat dalam log sistem yang tidak dapat diubah (immutable)." },
        { q: "Apakah data saya aman?", a: "Sangat aman. Kami menerapkan arsitektur Zero-Trust dan protokol SSL/TLS Grade A+ untuk semua komunikasi data." },
        { q: "Bagaimana manajemen hak aksesnya?", a: "Kami menggunakan sistem 4-role (Admin, Manager, Auditor, Analyst) dengan otentikasi berbasis JWT." },
        { q: "Apa itu Neural Vision Plate Reader?", a: "Layanan utama kami untuk menghitung koloni pada petri dish secara otomatis menggunakan visi komputer." },
        { q: "Apa itu PPE Compliance Monitoring?", a: "Sistem monitoring real-time untuk memastikan analis menggunakan Jas Lab, Masker, dan Sarung Tangan." },
        { q: "Apa itu AI Quality Analytics Hub?", a: "Dashboard analitik yang menyajikan visualisasi data kepatuhan dan tren hasil uji laboratorium." },
        { q: "Bisakah sistem mendeteksi gelembung?", a: "Ya, kelas 'Bubble' dipisahkan dari 'Colony' untuk mencegah positif palsu (false positive)." },
        { q: "Apakah sistem mendeteksi keretakan media?", a: "Ya, kelas 'Media Crack' dideteksi untuk memastikan integritas sampel sebelum dihitung." },
        { q: "Database apa yang digunakan?", a: "Kami menggunakan PostgreSQL untuk penyimpanan data relasional dan integritas transaksi yang kuat." },
        { q: "Di mana server ColonyAI berada?", a: "Infrastructure kami dapat di-deploy secara on-premise maupun cloud sesuai regulasi privasi data laboratorium." },
        { q: "Apakah sistem mendukung multi-tenant?", a: "Ya, platform kami mendukung multi-organization melalui Master Dashboard ColonyAI." },
        { q: "Bagaimana cara integrasi API?", a: "Kami menyediakan dokumentasi Swagger UI lengkap untuk integrasi API yang mudah ke sistem LIMS yang sudah ada." },
        { q: "Berapa lama waktu pemrosesan AI?", a: "Rata-rata inferensi untuk satu gambar petri dish adalah kurang dari 500ms." },
        { q: "Siapa pencipta ColonyAI?", a: "Tim pengembang di bawah koordinasi wi5nuu sebagai bagian dari AI Open Innovation Challenge 2026." },
        { q: "Kenapa memilih YOLOv8?", a: "Karena kecepatannya yang real-time dan kemampuannya menangkap fitur kecil (small objects) seperti koloni mikroba." },
        { q: "Apa rencana ke depan?", a: "Ekspansi ke deteksi jenis bakteri spesifik melalui analisis spektral gambar." },
        { q: "Bagaimana cara menghubungi panitia?", a: "Silakan email ke committee-ai-open@president.ac.id atau hubungi hotline 150881." },
        { q: "Apakah ada log perubahan data?", a: "Ya, setiap perubahan data dicatat lengkap dengan timestamp dan identitas user yang melakukan perubahan." },
        { q: "Apa itu mAP@.5:.95?", a: "Metrik yang mengukur rata-rata presisi model pada berbagai ambang batas IoU (Intersection over Union)." },
        { q: "Apa itu augmentasi data?", a: "Teknik manipulasi gambar (rotasi, blur, brightness) untuk memperkaya dataset dan mencegah overfitting." },
        { q: "Bagaimana sistem menangani noise?", a: "Kelas 'Dust/Debris' digunakan untuk mengklasifikasikan kotoran agar tidak terhitung sebagai koloni." },
        { q: "Apakah ada sistem backup data?", a: "Tentu, sistem kami memiliki prosedur automated daily backup untuk mencegah kehilangan data." },
        { q: "Apa itu JWT?", a: "JSON Web Token, standar industri untuk transmisi informasi identitas user secara aman antara client dan server." },
        { q: "Kenapa TUV NORD terlibat?", a: "TUV NORD sebagai case provider memberikan tantangan industri nyata yang harus diselesaikan oleh inovator AI." },
        { q: "Apa keuntungan bagi lab?", a: "Mengurangi human error hingga 95% dan mempercepat pelaporan hasil laboratorium secara signifikan." },
        { q: "Apakah sistem ini open source?", a: "Bagian dari repositori sistem ini dapat diakses di GitHub wi5nuu/colonyai untuk keperluan transparansi audit." },
        { q: "Bagaimana cara instalasi PWA?", a: "Cukup buka website colonyai.id di browser mobile dan pilih 'Add to Home Screen'." },
        { q: "Apakah butuh koneksi internet?", a: "Dibutuhkan koneksi untuk sinkronisasi data ke cloud, namun inferensi dapat dioptimasi untuk edge computing." },
        { q: "Apa visi 2026 ColonyAI?", a: "Menjadi standar emas OS Laboratorium Mikrobiologi di seluruh jaringan TUV NORD Global." },
        { q: "Bagaimana cara kerja PPE Monitoring?", a: "Kamera akan memindai analis, dan jika APD tidak lengkap, sistem akan memberikan notifikasi instan." },
        { q: "Apakah ColonyAI ramah pengguna?", a: "Ya, UI dirancang sangat intuitif (Low-Code/No-Code) agar dapat digunakan oleh analis lab tanpa latar belakang IT." },
        { q: "Apa itu Master Command Center?", a: "Dashboard pusat untuk memantau ratusan lab secara real-time dari satu layar admin." },
        { q: "Siapkah ColonyAI untuk produksi?", a: "Sistem telah melewati tahap QA ketat dan siap di-deploy untuk penggunaan komersial dan industri." }
      ];
    } else {
      return [
        { q: "What is ColonyAI?", a: "ColonyAI is an AI Vision-based laboratory automation platform for microbiology analysis and PPE compliance monitoring." },
        { q: "Who is the provider for this case?", a: "The provider for this case is TUV NORD Indonesia for Healthcare Case 1: Automated Plate Count Reader." },
        { q: "Who is the competition organizer?", a: "The AI Open Innovation Challenge 2026 is organized by President University in collaboration with the Coordinating Ministry for Economic Affairs." },
        { q: "What is the main goal of ColonyAI?", a: "To increase colony counting accuracy and ensure analyst safety through real-time PPE monitoring." },
        { q: "What is Healthcare Case 1?", a: "A case focusing on automating petri dish reading to accelerate the microbiology laboratory testing process." },
        { q: "What AI model is being used?", a: "We use YOLOv8 (You Only Look Once) optimized for high-level microbiology object detection." },
        { q: "What is the backend programming language?", a: "The ColonyAI backend is built using FastAPI (Python) to ensure high performance and concurrency." },
        { q: "How is the system deployed?", a: "The entire ecosystem uses Docker Containerization for isolation, scalability, and environment consistency." },
        { q: "Is there a mobile application?", a: "Yes, we use PWA (Progressive Web App) technology so the platform can be installed instantly on Android/iOS devices." },
        { q: "What frontend framework is used?", a: "Our frontend uses Next.js 14 with Tailwind CSS for responsive UI and fast SSR performance." },
        { q: "What is the mAP of your AI model?", a: "Our model achieves mAP@.5:.95 above 0.85, meeting industry accuracy standards for microbiology detection." },
        { q: "What is the detection accuracy level?", a: "Our colony detection accuracy rate reaches 99.2% on validated datasets." },
        { q: "How much training data is there?", a: "The model is trained using over 5000 petri dish images that have been manually annotated (human-verified)." },
        { q: "How many object classes are detected?", a: "5 Classes: Colony Merged, Colony Single, Bubble, Dust/Debris, and Media Crack." },
        { q: "How are the results validated?", a: "AI results undergo a human-in-the-loop validation stage by analysts before being locked into the database." },
        { q: "Is ColonyAI ISO compliant?", a: "Yes, our system is designed according to ISO-17025 standards for testing and calibration laboratory competence." },
        { q: "How is the data encrypted?", a: "We use AES-256 encryption for lab test results and compliance documents." },
        { q: "What is a Digital Audit Trail?", a: "Every processing step, from upload to validation, is recorded in immutable system logs." },
        { q: "Is my data safe?", a: "Very safe. We implement Zero-Trust architecture and Grade A+ SSL/TLS protocols for all data communication." },
        { q: "How is access rights managed?", a: "We use a 4-role system (Admin, Manager, Auditor, Analyst) with JWT-based authentication." },
        { q: "What is the Neural Vision Plate Reader?", a: "Our primary service for automatically counting colonies on petri dishes using computer vision." },
        { q: "What is PPE Compliance Monitoring?", a: "A real-time monitoring system to ensure analysts are wearing Lab Coats, Masks, and Gloves." },
        { q: "What is the AI Quality Analytics Hub?", a: "An analytics dashboard presenting compliance data visualization and lab test result trends." },
        { q: "Can the system detect bubbles?", a: "Yes, the 'Bubble' class is separated from 'Colony' to prevent false positives." },
        { q: "Does the system detect media cracks?", a: "Yes, the 'Media Crack' class is detected to ensure sample integrity before counting." },
        { q: "What database is used?", a: "We use PostgreSQL for relational data storage and strong transactional integrity." },
        { q: "Where are the ColonyAI servers located?", a: "Our infrastructure can be deployed on-premise or in the cloud according to lab data privacy regulations." },
        { q: "Does the system support multi-tenant?", a: "Yes, our platform supports multi-organization through the ColonyAI Master Dashboard." },
        { q: "How to integrate the API?", a: "We provide complete Swagger UI documentation for easy API integration into existing LIMS systems." },
        { q: "How long is the AI processing time?", a: "The average inference time for one petri dish image is less than 500ms." },
        { q: "Who created ColonyAI?", a: "The development team under the coordination of wi5nuu as part of the AI Open Innovation Challenge 2026." },
        { q: "Why choose YOLOv8?", a: "Because of its real-time speed and ability to capture small features (small objects) like microbial colonies." },
        { q: "What are the future plans?", a: "Expansion to specific bacterial species detection through spectral image analysis." },
        { q: "How to contact the committee?", a: "Please email committee-ai-open@president.ac.id or call hotline 150881." },
        { q: "Is there a data change log?", a: "Yes, every data change is recorded with a timestamp and the identity of the user who made the change." },
        { q: "What is mAP@.5:.95?", a: "A metric that measures the model's average precision across various IoU (Intersection over Union) thresholds." },
        { q: "What is data augmentation?", a: "Image manipulation techniques (rotation, blur, brightness) to enrich the dataset and prevent overfitting." },
        { q: "How does the system handle noise?", a: "The 'Dust/Debris' class is used to classify dirt so it is not counted as a colony." },
        { q: "Is there a data backup system?", a: "Certainly, our system has automated daily backup procedures to prevent data loss." },
        { q: "What is JWT?", a: "JSON Web Token, an industry standard for securely transmitting user identity information between client and server." },
        { q: "Why is TUV NORD involved?", a: "TUV NORD as a case provider provides real industry challenges to be solved by AI innovators." },
        { q: "What are the benefits for the lab?", a: "Reduces human error by up to 95% and significantly accelerates laboratory result reporting." },
        { q: "Is this system open source?", a: "Parts of this system's repository can be accessed on GitHub wi5nuu/colonyai for audit transparency purposes." },
        { q: "How to install the PWA?", a: "Just open the colonyai.id website in a mobile browser and select 'Add to Home Screen'." },
        { q: "Is an internet connection required?", a: "A connection is required for data synchronization to the cloud, but inference can be optimized for edge computing." },
        { q: "What is the ColonyAI 2026 vision?", a: "To become the gold standard for Microbiology Laboratory OS across the Global TUV NORD network." },
        { q: "How does PPE Monitoring work?", a: "The camera will scan the analyst, and if the PPE is incomplete, the system will provide an instant notification." },
        { q: "Is ColonyAI user-friendly?", a: "Yes, the UI is designed to be very intuitive (Low-Code/No-Code) so it can be used by lab analysts without an IT background." },
        { q: "What is the Master Command Center?", a: "A central dashboard to monitor hundreds of labs in real-time from a single admin screen." },
        { q: "Is ColonyAI production-ready?", a: "The system has passed rigorous QA and is ready to be deployed for commercial and industrial use." }
      ];
    }
  }, [language]);

  const filteredQuestions = useMemo(() => {
    if (!qSearch.trim()) return quickQuestions;
    return quickQuestions.filter(item => 
      item.q.toLowerCase().includes(qSearch.toLowerCase())
    );
  }, [qSearch, quickQuestions]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const lowerInput = text.toLowerCase();
      let foundResponse = language === 'id' 
        ? t('chatbot.noResults') || "Maaf, saya belum memiliki informasi spesifik mengenai hal tersebut."
        : t('chatbot.noResults') || "Sorry, I don't have specific information regarding that yet.";

      const quickMatch = quickQuestions.find(item => item.q.toLowerCase() === lowerInput);
      if (quickMatch) {
        foundResponse = quickMatch.a;
      } else {
        const keywords = language === 'id' ? [
          { k: ["yolo", "v8"], r: "Kami menggunakan YOLOv8 dengan mAP > 0.85 untuk akurasi maksimal." },
          { k: ["tuv", "nord"], r: "TUV NORD Indonesia adalah Case Provider resmi untuk Healthcare Case 1." },
          { k: ["iso", "17025"], r: "Sistem kami patuh ISO-17025 dengan Digital Audit Trail yang lengkap." }
        ] : [
          { k: ["yolo", "v8"], r: "We use YOLOv8 with mAP > 0.85 for maximum accuracy." },
          { k: ["tuv", "nord"], r: "TUV NORD Indonesia is the official Case Provider for Healthcare Case 1." },
          { k: ["iso", "17025"], r: "Our system is ISO-17025 compliant with a complete Digital Audit Trail." }
        ];
        for (const item of keywords) {
          if (item.k.some(key => lowerInput.includes(key))) {
            foundResponse = item.r;
            break;
          }
        }
      }

      setMessages(prev => [...prev, { role: "ai", text: foundResponse }]);
      setIsTyping(false);
    }, 1500); 
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed z-[300] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
      isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
    } 
    /* Mobile Style */
    bottom-0 left-0 w-full h-[92vh] rounded-t-[2.5rem] bg-white shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden
    /* Desktop Style */
    lg:bottom-24 lg:right-6 lg:left-auto lg:w-[400px] lg:h-[600px] lg:rounded-2xl lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto
    ${isOpen ? "" : "lg:hidden"}`}>
      
      {/* ── Grab Handle (Native Feel - Mobile Only) ── */}
      <div className="w-full flex justify-center pt-4 pb-2 lg:hidden">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
      </div>

      {/* Header */}
      <div className="bg-slate-900 p-5 lg:p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-xl lg:rounded-lg bg-gradient-to-r from-[#00f2ff] to-[#0055ff] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Bot className="w-6 h-6 lg:w-5 lg:h-5" />
          </div>
          <div>
            <h4 className="text-white text-[10px] lg:text-xs font-black uppercase tracking-[0.2em]">{t('chatbot.title')}</h4>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-pulse" />
              <span className="text-[8px] lg:text-[9px] font-bold text-white/50 uppercase tracking-widest">{t('chatbot.online')}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-3 lg:p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-90 text-white"
          aria-label={language === 'id' ? 'Tutup Chatbot' : 'Close Chatbot'}
        >
          <X className="w-6 h-6 lg:w-5 lg:h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar scrollbar-hide" role="log" aria-live="polite">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-[10px] lg:text-[11px] font-bold leading-relaxed shadow-sm ${
                msg.role === "user" 
                  ? "bg-[#0055ff] text-white rounded-tr-none" 
                  : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-1.5">
                <div className="flex gap-1" aria-label={t('chatbot.isTyping')}>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compact Quick Questions Slider */}
        {!isTyping && (
          <div className="px-4 py-2 bg-white border-t border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('chatbot.quickQuestions')}</span>
               <div className="relative flex items-center group">
                  <label htmlFor="quick-q-search" className="sr-only">{t('common.search')}</label>
                  <input 
                     id="quick-q-search"
                     type="text" 
                     value={qSearch}
                     onChange={(e) => setQSearch(e.target.value)}
                     placeholder={t('common.search')} 
                     className="w-16 bg-transparent border-b border-slate-300 text-[8px] font-bold text-slate-600 focus:outline-none focus:border-[#0055ff] transition-all px-1"
                  />
                  <Search className="w-2.5 h-2.5 text-slate-400 absolute right-0 pointer-events-none" aria-hidden="true" />
               </div>
            </div>
            
            <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scrollbar-hide gap-2">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(item.q)}
                    className="flex-none w-full snap-center bg-white border border-slate-200 p-2 lg:p-2.5 rounded-lg text-[9px] font-bold text-slate-700 hover:border-[#0055ff] hover:text-[#0055ff] transition-all flex items-center justify-between group shadow-sm"
                  >
                    <span className="truncate pr-3">{item.q}</span>
                    <ChevronRight className="w-3 h-3 text-[#0055ff] flex-shrink-0" aria-hidden="true" />
                  </button>
                ))
              ) : (
                <p className="w-full text-[8px] text-center text-slate-400 py-1 font-bold uppercase tracking-widest">{t('chatbot.noResults')}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100 bg-white shrink-0">
        <div className="flex gap-2">
          <label htmlFor="chat-input" className="sr-only">{language === 'id' ? 'Ketik pertanyaan' : 'Type a question'}</label>
          <input 
            id="chat-input"
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend(input)}
            placeholder={t('chatbot.placeholder')}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-[#0055ff] transition-all"
            disabled={isTyping}
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={isTyping}
            className={`w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center transition-all ${isTyping ? "opacity-50 cursor-not-allowed" : "hover:bg-[#0055ff]"}`}
            aria-label={language === 'id' ? 'Kirim Pesan' : 'Send Message'}
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <p className="text-[8px] text-center text-slate-400 mt-3 uppercase tracking-widest font-bold">
          Verified for TUV NORD Healthcare Case 1
        </p>
      </div>
    </div>
  );
}

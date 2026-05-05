"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Send, Bot, User, Sparkles, MessageSquare, Loader2, ChevronRight, Search, ChevronLeft } from "lucide-react";

interface Message {
  role: "user" | "ai";
  text: string;
}

export function AIChatbot({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Halo! Saya adalah ColonyAI Assistant. Silakan pilih pertanyaan cepat di bawah atau ketik pertanyaan Anda sendiri." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const [qSearch, setQSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const quickQuestions = useMemo(() => [
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
  ], []);

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
      let foundResponse = "Maaf, saya belum memiliki informasi spesifik mengenai hal tersebut. Silakan tanyakan seputar teknologi YOLOv8, TUV NORD, atau kepatuhan ISO-17025 kami.";

      const quickMatch = quickQuestions.find(item => item.q.toLowerCase() === lowerInput);
      if (quickMatch) {
        foundResponse = quickMatch.a;
      } else {
        const keywords = [
          { k: ["yolo", "v8"], r: "Kami menggunakan YOLOv8 dengan mAP > 0.85 untuk akurasi maksimal." },
          { k: ["tuv", "nord"], r: "TUV NORD Indonesia adalah Case Provider resmi untuk Healthcare Case 1." },
          { k: ["iso", "17025"], r: "Sistem kami patuh ISO-17025 dengan Digital Audit Trail yang lengkap." }
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
    }, 5000); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-[320px] lg:w-[400px] h-[550px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col z-[300] overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#00f2ff] to-[#0055ff] flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest">ColonyAI Assistant</h4>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-pulse" />
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Online Knowledge</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          aria-label="Close Chatbot"
        >
          <X className="w-5 h-5" aria-hidden="true" />
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
                <div className="flex gap-1" aria-label="Bot is typing">
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
          <div className="p-3 border-t border-slate-200 bg-slate-100/50 space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Pertanyaan Cepat</p>
              <div className="relative flex items-center group">
                 <label htmlFor="quick-q-search" className="sr-only">Cari Pertanyaan</label>
                 <input 
                    id="quick-q-search"
                    type="text" 
                    value={qSearch}
                    onChange={(e) => setQSearch(e.target.value)}
                    placeholder="Cari..." 
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
                <p className="w-full text-[8px] text-center text-slate-400 py-1 font-bold uppercase tracking-widest">Tidak ada hasil</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100 bg-white shrink-0">
        <div className="flex gap-2">
          <label htmlFor="chat-input" className="sr-only">Ketik pertanyaan</label>
          <input 
            id="chat-input"
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="Ketik pertanyaan..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-[#0055ff] transition-all"
            disabled={isTyping}
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={isTyping}
            className={`w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center transition-all ${isTyping ? "opacity-50 cursor-not-allowed" : "hover:bg-[#0055ff]"}`}
            aria-label="Kirim Pesan"
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

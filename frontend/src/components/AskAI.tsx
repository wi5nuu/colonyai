"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X, Send, Bot, Sparkles, Trash2, Download,
  Loader2, ThumbsUp, ThumbsDown, Zap, ShieldCheck, CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  quickActions?: string[];
  isNew?: boolean;
}

function TypewriterContent({ content, onComplete }: { content: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + content[index]);
        setIndex((prev) => prev + 1);
      }, 12);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, content, onComplete]);

  return <FormattedMessage content={displayedText} />;
}

function FormattedMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (line.trim().startsWith("- ")) {
          const text = line.trim().substring(2);
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="flex-1 text-[11px] sm:text-[12px]">{parseBold(text)}</span>
            </div>
          );
        }
        if (!line.trim()) return <div key={i} className="h-1.5" />;
        return <p key={i} className="text-[11px] sm:text-[12px]">{parseBold(line)}</p>;
      })}
    </div>
  );
}

function parseBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-black text-slate-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ============================================================
// KNOWLEDGE BASE
// ============================================================
const KB = {
  team: `**Tim Pengembang ColonyAI (4 Orang):**\n\n- **Wisnu Alfian Nur Ashar** — Product Owner & Frontend Lead. Bertanggung jawab atas Dashboard OS, UI/UX Vision, dan scientific nomenclature.\n- **Muhammad Faras** — Scrum Master & AI/ML Lead. Bertanggung jawab atas training model, kurasi dataset, dan optimasi inferensi.\n- **Suci** — UI/UX Developer. Bertanggung jawab atas styling komponen, sistem anotasi, dan aset marketing.\n- **Steven** — Backend Lead. Bertanggung jawab atas keamanan API, arsitektur database, ISO 17025 compliance, dan laporan.\n\nUntuk bantuan teknis: **service.colonyai.com**`,

  trainingHistory: `**Riwayat Training ColonyAI (8 Iterasi, v1–v8):**\n\n- **v1–v4:** Eksperimen awal, membangun pipeline deteksi dasar.\n- **v5–v6:** Peningkatan augmentasi dan kurasi dataset.\n- **v7 (PRODUKSI AKTIF):** colony_detection_full_v7 — Precision **87.6%**, mAP@50 **55.2%**, durasi training **~79.6 menit**. Ini adalah model yang saat ini digunakan.\n- **v8 (DEVELOPMENT):** colony_detection_full_v8 — Tahap finalisasi & optimalisasi, fokus pada peningkatan Recall dan deteksi koloni mikro.\n\nSemua data tersimpan di: \`ml-training/runs/detect/runs/detect/\``,

  v7detail: `**Detail Audit Model v7 (colony_detection_full_v7):**\n\n- **Status:** Produksi Aktif ✅\n- **Presisi:** 87.6%\n- **mAP@50:** 55.2%\n- **Durasi Training:** 79.6 menit\n- **Epoch:** 100\n- **Dataset:** colony_dataset (1,477 gambar)\n- **5 Kelas Deteksi:** colony_single, colony_merged, bubble, dust_debris, media_crack\n- **GPU:** RTX 5050\n\nv7 adalah standar produksi kami saat ini sebelum v8 siap dirilis.`,

  v8detail: `**Detail Model v8 (colony_detection_full_v8):**\n\n- **Status:** Development / Finalisasi 🔧\n- **Fokus:** Peningkatan Recall & deteksi koloni mikro yang lebih akurat.\n- **Target:** Melampaui presisi v7 (>87.6%).\n- **Perubahan:** Optimasi augmentasi data untuk kelas minoritas (bubble, dust_debris).\n\nv8 diperkirakan siap untuk uji produksi setelah validasi penuh selesai.`,

  datasets: `**Isi 3 Folder Dataset ColonyAI (\`ml-training/datasets/\`):**\n\n- **1. colony_dataset** — Dataset utama produksi. Berisi **1,477 gambar** cawan petri berlabel untuk training v7. Ini adalah aset inti sistem kita.\n- **2. Conteo-de-colonias-PF-1** — Dataset eksternal dari sumber publik. Digunakan untuk memperkaya variasi morfologi koloni dan meningkatkan generalisasi model.\n- **3. colony_mini** — Sandbox dataset berisi sampel kecil dari dataset utama. Digunakan tim developer untuk eksperimen cepat tanpa harus menunggu training penuh (~80 menit).`,

  colonyMini: `**Detail Folder colony_mini:**\n\n- **Fungsi:** Sandbox Dataset untuk pengujian cepat algoritma.\n- **Isi:** Subset sampel dari \`colony_dataset\` utama.\n- **Kegunaan:** Memvalidasi perubahan kode/model tanpa menunggu training penuh (menghemat ~79 menit per iterasi).\n- **Status:** Digunakan eksklusif oleh tim Developer (Faras) untuk eksperimen awal.\n- **Penting:** Data ini TIDAK digunakan untuk training produksi.`,

  roadmap: `**Roadmap Kecerdasan ColonyAI (v7 → v10):**\n\n- **v7 (Saat Ini):** Presisi 87.6%. Model produksi stabil.\n- **v8 (Berikutnya):** Target Recall lebih tinggi, deteksi koloni mikro lebih baik.\n- **v9 (Masa Depan):** Ketahanan terhadap artefak cawan (gelembung, debu, retakan media). Integrasi multi-protokol (VRBA, TSA, R2A).\n- **v10 (Ultimate Target):** Akurasi sempurna untuk standarisasi industri global. Target presisi >99% untuk sertifikasi ISO penuh.\n\nSetiap versi divalidasi dengan standar ISO-17025 sebelum naik ke produksi.`,

  trainingDuration: `**Kenapa Training Butuh ~80 Menit?**\n\n- **Epoch:** 100 iterasi penuh pada seluruh dataset.\n- **Dataset:** 1,477 gambar dengan augmentasi (flip, rotasi, brightness shift).\n- **Arsitektur:** YOLOv8 dengan backbone besar untuk akurasi tinggi.\n- **GPU:** RTX 5050 — sudah optimal untuk local training.\n- **Output:** Setiap epoch menghasilkan checkpoint model yang disimpan ke disk.\n\n80 menit adalah tradeoff antara akurasi dan kecepatan. Menggunakan colony_mini dapat mempercepat eksperimen awal menjadi ~5-10 menit.`,

  iso: `**Kepatuhan ISO-17025 di ColonyAI:**\n\n- **Audit Trail:** Setiap analisis dicatat dengan timestamp, hash kriptografis, dan identitas pengguna.\n- **TNTC/TFTC:** Sistem otomatis menerapkan standar ISO 4833-1 (TNTC >300 koloni, TFTC <25 koloni).\n- **Uncertainty Quantification:** Setiap hasil dilengkapi dengan nilai ketidakpastian pengukuran.\n- **4-Role RBAC:** Analyst, Manager, Auditor, Admin — sesuai prinsip separation of duties.\n- **Laporan Terakreditasi:** Format laporan sesuai standar dokumentasi ISO 17025.\n- **Kalibrasi:** Sistem pengingat siklus kalibrasi otomatis.`,

  rbac: `**Sistem Akses 4-Role ColonyAI (RBAC):**\n\n- **Laboratory Analyst:** Unggah specimen, jalankan AI diagnostik, entri data awal.\n- **Laboratory Manager:** Verifikasi hasil, tanda tangan akhir, generate laporan terakreditasi.\n- **Quality Auditor:** Lihat audit trail (read-only), verifikasi integritas kriptografis, monitor kepatuhan.\n- **System Administrator:** Kelola node, provisi pengguna, monitor kesehatan sistem real-time.\n\nModel ini memastikan separation of duties sesuai ISO-17025.`,

  contact: `**Hubungi Tim ColonyAI:**\n\n- **Support Teknis:** service.colonyai.com\n- **Respons:** Dalam 1x24 jam jam kerja.\n\n**Tim yang bisa dihubungi:**\n- Frontend/UI: **Wisnu** (Product Owner)\n- AI/ML Model: **Faras** (AI Lead)\n- Backend/API: **Steven** (Backend Lead)\n- UI/UX Design: **Suci** (UI Developer)`,

  classes: `**5 Kelas Deteksi Model v7/v8:**\n\n- **colony_single** — Koloni tunggal yang terpisah jelas. Target deteksi utama untuk CFU count.\n- **colony_merged** — Koloni yang berdempetan/overlapping. Ditangani dengan algoritma separasi khusus.\n- **bubble** — Gelembung udara pada media agar. Diklasifikasikan sebagai artefak (bukan koloni).\n- **dust_debris** — Partikel debu atau kotoran. Diklasifikasikan sebagai artefak.\n- **media_crack** — Retakan pada media agar. Diklasifikasikan sebagai artefak.\n\nPemisahan 5 kelas ini memastikan akurasi CFU count yang tinggi sesuai ISO 4833-1.`,
};

function getResponse(q: string, userName: string): { content: string; quickActions: string[] } {
  const query = q.toLowerCase();

  // Team / who questions
  if (query.match(/tim|team|siapa|who|anggota|developer|pengembang|wisnu|faras|suci|steven/)) {
    return { content: KB.team, quickActions: ["Detail peran Faras?", "Detail peran Steven?", "Hubungi tim?", "Roadmap v10?"] };
  }

  // Contact
  if (query.match(/hubungi|kontak|contact|bantuan|support|masalah|service/)) {
    return { content: KB.contact, quickActions: ["Siapa tim pengembang?", "Detail v7?", "Status v8?"] };
  }

  // v7 specific
  if (query.match(/v7|akurasi v7|presisi v7|hasil v7|detail v7|audit v7/)) {
    return { content: KB.v7detail, quickActions: ["Detail v8?", "Kenapa 80 menit?", "5 Kelas deteksi?", "Roadmap v10?"] };
  }

  // v8 specific
  if (query.match(/v8|status v8|detail v8|kapan v8/)) {
    return { content: KB.v8detail, quickActions: ["Detail v7?", "Roadmap v10?", "Siapa yang training?", "Isi dataset?"] };
  }

  // Training history general
  if (query.match(/riwayat|iterasi|history|training|hasil training|v1|v2|v3|v4|v5|v6/)) {
    return { content: KB.trainingHistory, quickActions: ["Detail v7?", "Detail v8?", "Kenapa 80 menit?", "Roadmap v10?"] };
  }

  // Training duration
  if (query.match(/kenapa.*menit|80 menit|lama|duration|berapa lama/)) {
    return { content: KB.trainingDuration, quickActions: ["Detail v7?", "Isi dataset?", "colony_mini itu apa?", "Siapa yang training?"] };
  }

  // colony_mini specific
  if (query.match(/colony_mini|mini|sandbox/)) {
    return { content: KB.colonyMini, quickActions: ["Isi 3 folder dataset?", "Detail v7?", "Roadmap v8?"] };
  }

  // Datasets
  if (query.match(/dataset|folder|isi dataset|berapa gambar|1477|data training|conteo/)) {
    return { content: KB.datasets, quickActions: ["colony_mini itu apa?", "Detail hasil v7?", "Siapa AI Lead?"] };
  }

  // Roadmap
  if (query.match(/roadmap|v9|v10|masa depan|rencana|plan|target/)) {
    return { content: KB.roadmap, quickActions: ["Detail v7?", "Status v8?", "Siapa tim pengembang?", "Hubungi tim?"] };
  }

  // ISO / compliance
  if (query.match(/iso|17025|tntc|tftc|audit|compliance|standar|kepatuhan/)) {
    return { content: KB.iso, quickActions: ["Sistem RBAC?", "Detail v7?", "Siapa Backend Lead?", "Roadmap v10?"] };
  }

  // RBAC / roles
  if (query.match(/rbac|role|akses|analyst|manager|auditor|admin|hak akses/)) {
    return { content: KB.rbac, quickActions: ["ISO-17025 di ColonyAI?", "Siapa tim pengembang?", "Hubungi tim?"] };
  }

  // 5 classes
  if (query.match(/kelas|class|koloni_single|colony_single|merged|bubble|dust|crack|5 kelas/)) {
    return { content: KB.classes, quickActions: ["Detail v7?", "Isi dataset?", "Roadmap v8?"] };
  }

  // Who am I
  if (query.match(/siapa saya|who am i/)) {
    return {
      content: `Anda adalah **${userName}** yang menggunakan **ColonyAI Laboratory OS v2.0**.\n\nSistem ini dikembangkan oleh tim **4 orang** untuk mendeteksi koloni bakteri secara otomatis menggunakan AI (YOLOv8) dengan standar **ISO-17025**.\n\nModel aktif saat ini: **v7** (Precision 87.6%)`,
      quickActions: ["Siapa tim pengembang?", "Detail v7?", "Sistem RBAC?"]
    };
  }

  // Default fallback
  return {
    content: `Saya memahami pertanyaan Anda: **"${q}"**\n\nBerikut topik yang bisa saya jelaskan secara detail:\n\n- **Tim Pengembang** (Wisnu, Faras, Suci, Steven)\n- **Hasil Training v7 & v8** (8 iterasi, presisi 87.6%)\n- **3 Folder Dataset** (1,477+ gambar)\n- **5 Kelas Deteksi** (colony_single, merged, bubble, dll)\n- **Roadmap v9 & v10**\n- **Kepatuhan ISO-17025 & RBAC**\n\nSilakan tanyakan salah satu di atas!`,
    quickActions: ["Siapa tim pengembang?", "Detail v7 & v8?", "Isi 3 folder dataset?", "Roadmap v10?"]
  };
}

export function AskAI({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuthStore();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userName = user?.name || user?.full_name || "Analyst";

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: "ai",
        content: `Halo **${userName}**! Saya asisten internal **ColonyAI**.\n\nSaya dapat menjawab pertanyaan tentang tim, model AI v7–v8, dataset, roadmap, ISO-17025, dan semua hal teknis sistem ini.`,
        timestamp: new Date(),
        quickActions: ["Siapa tim pengembang?", "Detail v7 & v8?", "Isi 3 folder dataset?", "Roadmap v10?"],
      }]);
    }
  }, [isOpen, userName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, loadingStep]);

  const clearChat = () => { setMessages([]); toast.success("Chat dihapus"); };

  const downloadChat = () => {
    const text = messages.map(m => `${m.role.toUpperCase()} [${m.timestamp.toLocaleString()}]: ${m.content}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "ColonyAI_Chat.txt"; a.click();
  };

  const handleSendMessage = async (inputQuery?: string) => {
    const finalQuery = inputQuery || query;
    if (!finalQuery.trim() || isTyping) return;

    const userMsg: Message = { role: "user", content: finalQuery, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setIsTyping(true);
    setLoadingStep(1);

    // Sequential loading: 2s → 2s → 3s then answer
    setTimeout(() => {
      setLoadingStep(2);
      setTimeout(() => {
        setLoadingStep(3);
        setTimeout(() => {
          const { content, quickActions } = getResponse(finalQuery, userName);
          const aiMsg: Message = {
            role: "ai", content, timestamp: new Date(),
            isNew: true, quickActions,
          };
          setMessages(prev => [...prev, aiMsg]);
          setIsTyping(false);
          setLoadingStep(0);
        }, 3000);
      }, 2000);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-[120] w-[92vw] sm:w-[400px] h-[560px] animate-in slide-in-from-bottom-10 fade-in duration-500 ease-out">
      <div className="w-full h-full bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden border border-slate-100">

        {/* Header */}
        <div className="px-4 py-3 bg-slate-900 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <img src="/android-chrome-512x512.png" className="w-9 h-9 object-contain drop-shadow-lg flex-shrink-0" alt="ColonyAI" />
            <div>
              <h2 className="text-[11px] font-black text-white uppercase tracking-tight">ColonyAI Assistant</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">v7 Active · ISO-17025</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={downloadChat} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white"><Download className="w-3.5 h-3.5" /></button>
            <button onClick={clearChat} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[90%] p-3 rounded-2xl shadow-sm ${
                msg.role === "user"
                  ? "bg-slate-900 text-white rounded-tr-none"
                  : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
              }`}>
                {msg.role === "ai" && msg.isNew ? (
                  <TypewriterContent content={msg.content} onComplete={() => {
                    const updated = [...messages];
                    if (updated[i]) { updated[i].isNew = false; setMessages(updated); }
                  }} />
                ) : (
                  <FormattedMessage content={msg.content} />
                )}
                {msg.role === "ai" && !msg.isNew && (
                  <div className="mt-3 pt-2 border-t border-slate-50 flex items-center gap-3">
                    <button className="text-slate-300 hover:text-primary transition-colors"><ThumbsUp className="w-3.5 h-3.5" /></button>
                    <button className="text-slate-300 hover:text-rose-500 transition-colors"><ThumbsDown className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>

              {msg.role === "ai" && !msg.isNew && msg.quickActions && (
                <div className="mt-2.5 w-full">
                  <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5 text-amber-500" /> Tanya lanjut</p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.quickActions.map((action, j) => (
                      <button key={j} onClick={() => handleSendMessage(action)}
                        className="px-2 py-1 bg-white hover:bg-slate-900 hover:text-white text-slate-600 text-[9px] sm:text-[10px] font-bold rounded-lg transition-all border border-slate-200 shadow-sm">
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex flex-col items-start space-y-1.5">
              {[
                { step: 1, label: "Menganalisa permintaan Anda..." },
                { step: 2, label: "Mengidentifikasi detail penting..." },
                { step: 3, label: "Menyusun jawaban..." },
              ].map(({ step, label }) => (
                <div key={step} className={`flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-full shadow-sm transition-all duration-500 ${loadingStep >= step ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                  {loadingStep > step
                    ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    : <Loader2 className="w-2.5 h-2.5 text-primary animate-spin" />
                  }
                  <span className={`text-[9px] font-bold ${loadingStep > step ? "text-emerald-600" : "text-slate-400"}`}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Tanya tentang tim, v7, dataset..."
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-12 text-[11px] sm:text-[12px] font-bold text-slate-900 outline-none focus:border-primary/40 focus:bg-white transition-all placeholder:text-slate-300"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendMessage()}
              disabled={isTyping}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isTyping || !query.trim()}
              className="absolute right-1.5 top-1 w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-primary transition-all disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-4 mt-2 px-1">
            <div className="flex items-center gap-1.5 text-[7px] font-black text-slate-300 uppercase tracking-widest">
              <Zap className="w-2.5 h-2.5 text-amber-500" /> Neural Sync
            </div>
            <div className="flex items-center gap-1.5 text-[7px] font-black text-slate-300 uppercase tracking-widest">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" /> ISO-17025
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

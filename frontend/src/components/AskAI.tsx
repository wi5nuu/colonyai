"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X, Send, Bot, Sparkles, Trash2, Download,
  Loader2, ThumbsUp, ThumbsDown, Zap, ShieldCheck, CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslationStore } from "@/lib/i18n/store";
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
      return <strong key={i} className="font-black text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ============================================================
// KNOWLEDGE BASE
// ============================================================
const KB_ID = {
  team: `**Tim Pengembang ColonyAI (4 Orang):**\n\n- **Wisnu Alfian Nur Ashar** — Product Owner & Frontend Lead. Bertanggung jawab atas Dashboard OS, UI/UX Vision, dan scientific nomenclature.\n- **Muhammad Faras** — Scrum Master & AI/ML Lead. Bertanggung jawab atas training model, kurasi dataset, dan optimasi inferensi.\n- **Suci** — UI/UX Developer. Bertanggung jawab atas styling komponen, sistem anotasi, dan aset marketing.\n- **Steven** — Backend Lead. Bertanggung jawab atas keamanan API, arsitektur database, ISO 17025 compliance, dan laporan.\n\nUntuk bantuan teknis: **service.colonyai.com**`,

  trainingHistory: `**Riwayat Training ColonyAI (8 Iterasi, v1–v8):**\n\n- **v1–v4:** Eksperimen awal, membangun pipeline deteksi dasar.\n- **v5–v6:** Peningkatan augmentasi dan kurasi dataset.\n- **v7 (PRODUKSI AKTIF):** colony_detection_full_v7 — Precision **87.6%**, mAP@50 **55.2%**, durasi training **~79.6 menit**. Ini adalah model yang saat ini digunakan.\n- **v8 (DEVELOPMENT):** colony_detection_full_v8 — Tahap finalisasi & optimalisasi, fokus pada peningkatan Recall dan deteksi koloni mikro.\n\nSemua data tersimpan di: \`ml-training/runs/detect/runs/detect/\``,

  v7detail: `**Detail Audit Model v7 (colony_detection_full_v7):**\n\n- **Status:** Produksi Aktif ✅\n- **Presisi:** 87.6%\n- **mAP@50:** 55.2%\n- **Durasi Training:** 79.6 menit\n- **Epoch:** 100\n- **Dataset:** colony_dataset (1,477 gambar)\n- **5 Kelas Deteksi:** colony_single, colony_merged, bubble, dust_debris, media_crack\n- **GPU:** RTX 5050\n\nv7 adalah standar produksi kami saat ini sebelum v8 siap dirilis.`,

  v8detail: `**Detail Model v8 (colony_detection_full_v8):**\n\n- **Status:** Development / Finalisasi 🔧\n- **Fokus:** Peningkatan Recall & deteksi koloni mikro yang lebih akurat.\n- **Target:** Melampaui presisi v7 (>87.6%).\n- **Perubahan:** Optimasi augmentasi data untuk kelas minoritas (bubble, dust_debris).\n\nv8 diperkirakan siap untuk uji produksi setelah validasi penuh selesai.`,

  datasets: `**Isi 3 Folder Dataset ColonyAI (\`ml-training/datasets/\`):**\n\n- **1. colony_dataset** — Dataset utama produksi. Berisi **1,477 gambar** cawan petri berlabel untuk training v7. Ini adalah aset inti sistem kita.\n- **2. Conteo-de-colonias-PF-1** — Dataset eksternal dari sumber publik. Digunakan untuk memperkaya variasi morfologi koloni dan meningkatkan generalisasi model.\n- **3. colony_mini** — Sandbox dataset berisi sampel kecil dari dataset utama. Digunakan tim developer untuk eksperimen cepat tanpa harus menunggu training penuh (~80 menit).`,

  colonyMini: `**Detail Folder colony_mini:**\n\n- **Fungsi:** Sandbox Dataset untuk pengujian cepat algoritma.\n- **Isi:** Subset sampel dari \`colony_dataset\` utama.\n- **Kegunaan:** Memvalidasi perubahan kode/model tanpa menunggu training penuh (menghemat ~79 menit per iterasi).\n- **Status:** Digunakan eksekutif oleh tim Developer (Faras) untuk eksperimen awal.\n- **Penting:** Data ini TIDAK digunakan untuk training produksi.`,

  roadmap: `**Roadmap Kecerdasan ColonyAI (v7 → v10):**\n\n- **v7 (Saat Ini):** Presisi 87.6%. Model produksi stabil.\n- **v8 (Berikutnya):** Target Recall lebih tinggi, deteksi koloni mikro lebih baik.\n- **v9 (Masa Depan):** Ketahanan terhadap artefak cawan (gelembung, debu, retakan media). Integrasi multi-protokol (VRBA, TSA, R2A).\n- **v10 (Ultimate Target):** Akurasi sempurna untuk standarisasi industri global. Target presisi >99% untuk sertifikasi ISO penuh.\n\nSetiap versi divalidasi dengan standar ISO-17025 sebelum naik ke produksi.`,

  trainingDuration: `**Kenapa Training Butuh ~80 Menit?**\n\n- **Epoch:** 100 iterasi penuh pada seluruh dataset.\n- **Dataset:** 1,477 gambar dengan augmentasi (flip, rotasi, brightness shift).\n- **Arsitektur:** YOLOv8 dengan backbone besar untuk akurasi tinggi.\n- **GPU:** RTX 5050 — sudah optimal untuk local training.\n- **Output:** Setiap epoch menghasilkan checkpoint model yang disimpan ke disk.\n\n80 menit adalah tradeoff antara akurasi dan kecepatan. Menggunakan colony_mini dapat mempercepat eksperimen awal menjadi ~5-10 menit.`,

  iso: `**Kepatuhan ISO-17025 di ColonyAI:**\n\n- **Audit Trail:** Setiap analisis dicatat dengan timestamp, hash kriptografis, dan identitas pengguna.\n- **TNTC/TFTC:** Sistem otomatis menerapkan standar ISO 4833-1 (TNTC >300 koloni, TFTC <25 koloni).\n- **Uncertainty Quantification:** Setiap hasil dilengkapi dengan nilai ketidakpastian pengukuran.\n- **4-Role RBAC:** Analyst, Manager, Auditor, Admin — sesuai prinsip separation of duties.\n- **Laporan Terakreditasi:** Format laporan sesuai standar dokumentasi ISO 17025.\n- **Kalibrasi:** Sistem pengingat siklus kalibrasi otomatis.`,

  rbac: `**Sistem Akses 4-Role ColonyAI (RBAC):**\n\n- **Laboratory Analyst:** Unggah specimen, jalankan AI diagnostik, entri data awal.\n- **Laboratory Manager:** Verifikasi hasil, tanda tangan akhir, generate laporan terakreditasi.\n- **Quality Auditor:** Lihat audit trail (read-only), verifikasi integritas kriptografis, monitor kepatuhan.\n- **System Administrator:** Kelola node, provisi pengguna, monitor kesehatan sistem real-time.\n\nModel ini memastikan separation of duties sesuai ISO-17025.`,

  contact: `**Hubungi Tim ColonyAI:**\n\n- **Support Teknis:** service.colonyai.com\n- **Respons:** Dalam 1x24 jam jam kerja.\n\n**Tim yang bisa dihubungi:**\n- Frontend/UI: **Wisnu** (Product Owner)\n- AI/ML Model: **Faras** (AI Lead)\n- Backend/API: **Steven** (Backend Lead)\n- UI/UX Design: **Suci** (UI Developer)`,

  classes: `**5 Kelas Deteksi Model v7/v8:**\n\n- **colony_single** — Koloni tunggal yang terpisah jelas. Target deteksi utama untuk CFU count.\n- **colony_merged** — Koloni yang berdempetan/overlapping. Ditangani dengan algoritma separasi khusus.\n- **bubble** — Gelembung udara pada media agar. Diklasifikasikan sebagai artefak (bukan koloni).\n- **dust_debris** — Partikel debu atau kotoran. Diklasifikasikan sebagai artefak.\n- **media_crack** — Retakan pada media agar. Diklasifikasikan sebagai artefak.\n\nPemisahan 5 kelas ini memastikan akurasi CFU count yang tinggi sesuai ISO 4833-1.`,
};

const KB_EN = {
  team: `**ColonyAI Development Team (4 Members):**\n\n- **Wisnu Alfian Nur Ashar** — Product Owner & Frontend Lead. Responsible for Dashboard OS, UI/UX Vision, and scientific nomenclature.\n- **Muhammad Faras** — Scrum Master & AI/ML Lead. Responsible for model training, dataset curation, and inference optimization.\n- **Suci** — UI/UX Developer. Responsible for component styling, annotation system, and marketing assets.\n- **Steven** — Backend Lead. Responsible for API security, database architecture, ISO 17025 compliance, and reports.\n\nFor technical assistance: **service.colonyai.com**`,

  trainingHistory: `**ColonyAI Training History (8 Iterations, v1–v8):**\n\n- **v1–v4:** Early experiments, building basic detection pipeline.\n- **v5–v6:** Increased augmentation and dataset curation.\n- **v7 (ACTIVE PRODUCTION):** colony_detection_full_v7 — Precision **87.6%**, mAP@50 **55.2%**, training duration **~79.6 minutes**. This is the model currently in use.\n- **v8 (DEVELOPMENT):** colony_detection_full_v8 — Finalization & optimization stage, focusing on Recall improvement and micro colony detection.\n\nAll data is stored at: \`ml-training/runs/detect/runs/detect/\``,

  v7detail: `**Audit Detail Model v7 (colony_detection_full_v7):**\n\n- **Status:** Active Production ✅\n- **Precision:** 87.6%\n- **mAP@50:** 55.2%\n- **Training Duration:** 79.6 minutes\n- **Epoch:** 100\n- **Dataset:** colony_dataset (1,477 images)\n- **5 Detection Classes:** colony_single, colony_merged, bubble, dust_debris, media_crack\n- **GPU:** RTX 5050\n\nv7 is our current production standard before v8 is ready for release.`,

  v8detail: `**Model v8 Detail (colony_detection_full_v8):**\n\n- **Status:** Development / Finalization 🔧\n- **Focus:** Improved Recall & more accurate micro colony detection.\n- **Target:** Surpass v7 precision (>87.6%).\n- **Changes:** Data augmentation optimization for minority classes (bubble, dust_debris).\n\nv8 is expected to be ready for production testing after full validation is complete.`,

  datasets: `**Contents of 3 ColonyAI Dataset Folders (\`ml-training/datasets/\`):**\n\n- **1. colony_dataset** — Main production dataset. Contains **1,477 labeled petri dish images** for v7 training. This is our system's core asset.\n- **2. Conteo-de-colonias-PF-1** — External dataset from public sources. Used to enrich colony morphology variation and improve model generalization.\n- **3. colony_mini** — Sandbox dataset containing small samples from the main dataset. Used by the dev team for quick experiments without waiting for full training (~80 minutes).`,

  colonyMini: `**Detail Folder colony_mini:**\n\n- **Function:** Sandbox Dataset for quick algorithm testing.\n- **Contents:** Sample subset from the main \`colony_dataset\`.\n- **Utility:** Validates code/model changes without waiting for full training (saves ~79 minutes per iteration).\n- **Status:** Used exclusively by the Dev team (Faras) for initial experiments.\n- **Important:** This data is NOT used for production training.`,

  roadmap: `**ColonyAI Intelligence Roadmap (v7 → v10):**\n\n- **v7 (Current):** 87.6% Precision. Stable production model.\n- **v8 (Next):** Higher Target Recall, better micro colony detection.\n- **v9 (Future):** Robustness against plate artifacts (bubbles, dust, media cracks). Multi-protocol integration (VRBA, TSA, R2A).\n- **v10 (Ultimate Target):** Perfect accuracy for global industry standardization. Target precision >99% for full ISO certification.\n\nEvery version is validated with ISO-17025 standards before going to production.`,

  trainingDuration: `**Why Does Training Take ~80 Minutes?**\n\n- **Epoch:** 100 full iterations on the entire dataset.\n- **Dataset:** 1,477 images with augmentation (flip, rotation, brightness shift).\n- **Architecture:** YOLOv8 with large backbone for high accuracy.\n- **GPU:** RTX 5050 — already optimal for local training.\n- **Output:** Every epoch generates model checkpoints saved to disk.\n\n80 minutes is a tradeoff between accuracy and speed. Using colony_mini can speed up initial experiments to ~5-10 minutes.`,

  iso: `**ISO-17025 Compliance in ColonyAI:**\n\n- **Audit Trail:** Every analysis is recorded with timestamp, cryptographic hash, and user identity.\n- **TNTC/TFTC:** System automatically applies ISO 4833-1 standards (TNTC >300 colonies, TFTC <25 colonies).\n- **Uncertainty Quantification:** Every result includes measurement uncertainty value.\n- **4-Role RBAC:** Analyst, Manager, Auditor, Admin — according to separation of duties principle.\n- **Accredited Reports:** Report format according to ISO 17025 documentation standards.\n- **Calibration:** Automatic calibration cycle reminder system.`,

  rbac: `**ColonyAI 4-Role Access System (RBAC):**\n\n- **Laboratory Analyst:** Upload specimen, run AI diagnostics, initial data entry.\n- **Laboratory Manager:** Verify results, final signature, generate accredited reports.\n- **Quality Auditor:** View audit trail (read-only), verify cryptographic integrity, monitor compliance.\n- **System Administrator:** Manage nodes, provision users, real-time system health monitoring.\n\nThis model ensures separation of duties according to ISO-17025.`,

  contact: `**Contact ColonyAI Team:**\n\n- **Technical Support:** service.colonyai.com\n- **Response:** Within 1x24 working hours.\n\n**Team to contact:**\n- Frontend/UI: **Wisnu** (Product Owner)\n- AI/ML Model: **Faras** (AI Lead)\n- Backend/API: **Steven** (Backend Lead)\n- UI/UX Design: **Suci** (UI Developer)`,

  classes: `**5 Detection Classes of Model v7/v8:**\n\n- **colony_single** — Clearly separated single colonies. Primary detection target for CFU count.\n- **colony_merged** — Adjacent/overlapping colonies. Handled with special separation algorithms.\n- **bubble** — Air bubbles on agar media. Classified as artifact (not colony).\n- **dust_debris** — Dust particles or dirt. Classified as artifact.\n- **media_crack** — Cracks on agar media. Classified as artifact.\n\nSeparating these 5 classes ensures high CFU count accuracy according to ISO 4833-1.`,
};

function getResponse(q: string, userName: string, language: string): { content: string; quickActions: string[] } {
  const query = q.toLowerCase();
  const KB = language === 'id' ? KB_ID : KB_EN;

  // Team / who questions
  if (query.match(/tim|team|siapa|who|anggota|developer|pengembang|wisnu|faras|suci|steven/)) {
    return { 
      content: KB.team, 
      quickActions: language === 'id' 
        ? ["Detail peran Faras?", "Detail peran Steven?", "Hubungi tim?", "Roadmap v10?"]
        : ["Faras's role?", "Steven's role?", "Contact team?", "Roadmap v10?"]
    };
  }

  // Contact
  if (query.match(/hubungi|kontak|contact|bantuan|support|masalah|service/)) {
    return { 
      content: KB.contact, 
      quickActions: language === 'id'
        ? ["Siapa tim pengembang?", "Detail v7?", "Status v8?"]
        : ["Who is the dev team?", "Detail v7?", "Status v8?"]
    };
  }

  // v7 specific
  if (query.match(/v7|akurasi v7|presisi v7|hasil v7|detail v7|audit v7/)) {
    return { 
      content: KB.v7detail, 
      quickActions: language === 'id'
        ? ["Detail v8?", "Kenapa 80 menit?", "5 Kelas deteksi?", "Roadmap v10?"]
        : ["Detail v8?", "Why 80 minutes?", "5 Detection classes?", "Roadmap v10?"]
    };
  }

  // v8 specific
  if (query.match(/v8|status v8|detail v8|kapan v8/)) {
    return { 
      content: KB.v8detail, 
      quickActions: language === 'id'
        ? ["Detail v7?", "Roadmap v10?", "Siapa yang training?", "Isi dataset?"]
        : ["Detail v7?", "Roadmap v10?", "Who trained it?", "Dataset contents?"]
    };
  }

  // Training history general
  if (query.match(/riwayat|iterasi|history|training|hasil training|v1|v2|v3|v4|v5|v6/)) {
    return { 
      content: KB.trainingHistory, 
      quickActions: language === 'id'
        ? ["Detail v7?", "Detail v8?", "Kenapa 80 menit?", "Roadmap v10?"]
        : ["Detail v7?", "Detail v8?", "Why 80 minutes?", "Roadmap v10?"]
    };
  }

  // Training duration
  if (query.match(/kenapa.*menit|80 menit|lama|duration|berapa lama/)) {
    return { 
      content: KB.trainingDuration, 
      quickActions: language === 'id'
        ? ["Detail v7?", "Isi dataset?", "colony_mini itu apa?", "Siapa yang training?"]
        : ["Detail v7?", "Dataset contents?", "What is colony_mini?", "Who trained it?"]
    };
  }

  // colony_mini specific
  if (query.match(/colony_mini|mini|sandbox/)) {
    return { 
      content: KB.colonyMini, 
      quickActions: language === 'id'
        ? ["Isi 3 folder dataset?", "Detail v7?", "Roadmap v8?"]
        : ["3 Dataset folders?", "Detail v7?", "Roadmap v8?"]
    };
  }

  // Datasets
  if (query.match(/dataset|folder|isi dataset|berapa gambar|1477|data training|conteo/)) {
    return { 
      content: KB.datasets, 
      quickActions: language === 'id'
        ? ["colony_mini itu apa?", "Detail hasil v7?", "Siapa AI Lead?"]
        : ["What is colony_mini?", "v7 result detail?", "Who is AI Lead?"]
    };
  }

  // Roadmap
  if (query.match(/roadmap|v9|v10|masa depan|rencana|plan|target/)) {
    return { 
      content: KB.roadmap, 
      quickActions: language === 'id'
        ? ["Detail v7?", "Status v8?", "Siapa tim pengembang?", "Hubungi tim?"]
        : ["Detail v7?", "Status v8?", "Who is dev team?", "Contact team?"]
    };
  }

  // ISO / compliance
  if (query.match(/iso|17025|tntc|tftc|audit|compliance|standar|kepatuhan/)) {
    return { 
      content: KB.iso, 
      quickActions: language === 'id'
        ? ["Sistem RBAC?", "Detail v7?", "Siapa Backend Lead?", "Roadmap v10?"]
        : ["RBAC System?", "Detail v7?", "Who is Backend Lead?", "Roadmap v10?"]
    };
  }

  // RBAC / roles
  if (query.match(/rbac|role|akses|analyst|manager|auditor|admin|hak akses/)) {
    return { 
      content: KB.rbac, 
      quickActions: language === 'id'
        ? ["ISO-17025 di ColonyAI?", "Siapa tim pengembang?", "Hubungi tim?"]
        : ["ISO-17025 in ColonyAI?", "Who is dev team?", "Contact team?"]
    };
  }

  // 5 classes
  if (query.match(/kelas|class|koloni_single|colony_single|merged|bubble|dust|crack|5 kelas/)) {
    return { 
      content: KB.classes, 
      quickActions: language === 'id'
        ? ["Detail v7?", "Isi dataset?", "Roadmap v8?"]
        : ["Detail v7?", "Dataset contents?", "Roadmap v8?"]
    };
  }

  // Who am I
  if (query.match(/siapa saya|who am i/)) {
    return {
      content: language === 'id' 
        ? `Anda adalah **${userName}** yang menggunakan **ColonyAI Laboratory OS v2.0**.\n\nSistem ini dikembangkan oleh tim **4 orang** untuk mendeteksi koloni bakteri secara otomatis menggunakan AI (YOLOv8) dengan standar **ISO-17025**.\n\nModel aktif saat ini: **v7** (Precision 87.6%)`
        : `You are **${userName}** using **ColonyAI Laboratory OS v2.0**.\n\nThis system was developed by a **4-person team** to automatically detect bacterial colonies using AI (YOLOv8) with **ISO-17025** standards.\n\nActive model currently: **v7** (Precision 87.6%)`,
      quickActions: language === 'id'
        ? ["Siapa tim pengembang?", "Detail v7?", "Sistem RBAC?"]
        : ["Who is the dev team?", "Detail v7?", "RBAC system?"]
    };
  }

  return { 
    content: language === 'id'
      ? "Maaf, saya tidak menemukan informasi spesifik mengenai hal tersebut dalam basis pengetahuan internal ColonyAI. Silakan coba tanyakan hal lain seputar training model v7/v8 atau ISO-17025."
      : "Sorry, I couldn't find specific information regarding that in the ColonyAI internal knowledge base. Please try asking something else about model v7/v8 training or ISO-17025.",
    quickActions: language === 'id'
      ? ["Siapa tim pengembang?", "Detail v7 & v8?", "Isi 3 folder dataset?", "Roadmap v10?"]
      : ["Who is the dev team?", "Detail v7 & v8?", "3 Dataset folders?", "Roadmap v10?"]
  };
}

export function AskAI({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuthStore();
  const { t, language } = useTranslationStore();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userName = user?.full_name || "Analyst";

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: "ai",
        content: language === 'id' 
          ? `Halo **${userName}**! Saya asisten internal **ColonyAI**.\n\nSaya dapat menjawab pertanyaan tentang tim, model AI v7–v8, dataset, roadmap, ISO-17025, dan semua hal teknis sistem ini.`
          : `Hello **${userName}**! I am the **ColonyAI** internal assistant.\n\nI can answer questions about the team, AI models v7–v8, datasets, roadmap, ISO-17025, and all technical aspects of this system.`,
        timestamp: new Date(),
        quickActions: language === 'id' 
          ? ["Siapa tim pengembang?", "Detail v7 & v8?", "Isi 3 folder dataset?", "Roadmap v10?"]
          : ["Who is the dev team?", "Detail v7 & v8?", "3 Dataset folders?", "Roadmap v10?"],
      }]);
    }
  }, [isOpen, userName, language, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, loadingStep]);

  const clearChat = () => { setMessages([]); toast.success(t('chatbot.clearChat')); };

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
          const { content, quickActions } = getResponse(finalQuery, userName, language);
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
      <div className="w-full h-full bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800">

        {/* Header */}
        <div className="px-4 py-3 bg-slate-900 dark:bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <img src="/android-chrome-512x512.png" className="w-9 h-9 object-contain drop-shadow-lg flex-shrink-0" alt="ColonyAI" />
            <div>
              <h2 className="text-[11px] font-black text-white uppercase tracking-tight">{t('chatbot.title')}</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">{t('chatbot.v7active')}</span>
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
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/30">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[90%] p-3 rounded-2xl shadow-sm ${
                msg.role === "user"
                  ? "bg-slate-900 dark:bg-primary text-white rounded-tr-none"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none"
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
                  <div className="mt-3 pt-2 border-t border-slate-50 dark:border-slate-700 flex items-center gap-3">
                    <button className="text-slate-300 dark:text-slate-500 hover:text-primary transition-colors"><ThumbsUp className="w-3.5 h-3.5" /></button>
                    <button className="text-slate-300 dark:text-slate-500 hover:text-rose-500 transition-colors"><ThumbsDown className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>

              {msg.role === "ai" && !msg.isNew && msg.quickActions && (
                <div className="mt-2.5 w-full">
                  <p className="text-[7px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5 text-amber-500" /> {t('chatbot.followUp')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.quickActions.map((action, j) => (
                      <button key={j} onClick={() => handleSendMessage(action)}
                        className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-primary hover:text-white text-slate-600 dark:text-slate-300 text-[9px] sm:text-[10px] font-bold rounded-lg transition-all border border-slate-200 dark:border-slate-700 shadow-sm">
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
                { step: 1, label: t('chatbot.loadingStep1') },
                { step: 2, label: t('chatbot.loadingStep2') },
                { step: 3, label: t('chatbot.loadingStep3') },
              ].map(({ step, label }) => (
                <div key={step} className={`flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full shadow-sm transition-all duration-500 ${loadingStep >= step ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                  {loadingStep > step
                    ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    : <Loader2 className="w-2.5 h-2.5 text-primary animate-spin" />
                  }
                  <span className={`text-[9px] font-bold ${loadingStep > step ? "text-emerald-600" : "text-slate-400 dark:text-slate-500"}`}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder={t('chatbot.askAIPrompt')}
              className="w-full h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-12 text-[11px] sm:text-[12px] font-bold text-slate-900 dark:text-white outline-none focus:border-primary/40 dark:focus:border-primary/60 focus:bg-white dark:focus:bg-slate-800 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendMessage()}
              disabled={isTyping}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isTyping || !query.trim()}
              className="absolute right-1.5 top-1 w-8 h-8 bg-slate-900 dark:bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary dark:hover:bg-primary/80 transition-all disabled:opacity-40"
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

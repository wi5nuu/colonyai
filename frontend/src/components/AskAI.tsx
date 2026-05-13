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

  v8detail: `**Detail Model v8 (v8-Enterprise Ready):**\n\n- **Status:** Latihan Strategis Aktif 🔄\n- **Fokus:** Akurasi ekstrem pada koloni mikro & pemisahan artefak (debu/gelembung).\n- **Dataset:** Balanced Merged Dataset (**1,3 Juta objek** teranotasi).\n- **Volume:** 116.654 gambar cawan petri yang telah diseimbangkan.\n- **Kecerdasan:** Menggunakan arsitektur YOLOv8s dengan resolusi 640px untuk detail maksimal.\n\nModel ini dirancang khusus untuk melewati standar audit ISO-17025 tanpa celah.`,

  datasets: `**Dataset Utama ColonyAI (\`colonyai_merged\`):**\n\n- **Total Data:** **1.303.078 bounding boxes**.\n- **Keseimbangan Kelas:** Telah melalui teknik *Strategic Oversampling*.\n- **Isi:**\n  - **Colony Single:** 715rb+\n  - **Colony Merged:** 269rb+\n  - **Bubble:** 184rb+\n  - **Dust/Debris:** 40rb+ (Kunci utama akurasi tinggi!)\n  - **Media Crack:** 94rb+\n\nDataset ini memastikan AI tidak lagi tertipu oleh kotoran atau retakan pada media agar.`,

  colonyMini: `**Detail Folder colony_mini:**\n\n- **Fungsi:** Sandbox Dataset untuk pengujian cepat algoritma.\n- **Isi:** Subset sampel dari \`colony_dataset\` utama.\n- **Kegunaan:** Memvalidasi perubahan kode/model tanpa menunggu training penuh (menghemat ~79 menit per iterasi).\n- **Status:** Digunakan eksekutif oleh tim Developer (Faras) untuk eksperimen awal.\n- **Penting:** Data ini TIDAK digunakan untuk training produksi.`,

  roadmap: `**Roadmap Kecerdasan ColonyAI (v7 → v10):**\n\n- **v7 (Saat Ini):** Presisi 87.6%. Model produksi stabil.\n- **v8 (Berikutnya):** Target Recall lebih tinggi, deteksi koloni mikro lebih baik.\n- **v9 (Masa Depan):** Ketahanan terhadap artefak cawan (gelembung, debu, retakan media). Integrasi multi-protokol (VRBA, TSA, R2A).\n- **v10 (Ultimate Target):** Akurasi sempurna untuk standarisasi industri global. Target presisi >99% untuk sertifikasi ISO penuh.\n\nSetiap versi divalidasi dengan standar ISO-17025 sebelum naik ke produksi.`,

  trainingDuration: `**Kenapa Training v8 Butuh ~3 Jam Per Epoch?**\n\n- **Volume Data:** Teknik Oversampling membuat AI harus memproses **97.638 objek (instances)** per putaran untuk mempelajari perbedaan tipis antara koloni vs debu/gelembung.\n- **Arsitektur:** YOLOv8 dengan kalkulasi presisi tingkat tinggi.\n- **Keamanan Hardware:** Mode Multi-threading dinonaktifkan (workers=0) untuk mencegah *memory crash* pada RTX 5050 selama proses augmentasi data raksasa ini.\n\nWaktu 3 jam adalah investasi untuk mendapatkan model yang 100% kebal terhadap jebakan kotoran cawan petri.`,

  iso: `**Kepatuhan ISO-17025 di ColonyAI:**\n\n- **Audit Trail:** Setiap analisis dicatat dengan timestamp, hash kriptografis, dan identitas pengguna.\n- **TNTC/TFTC:** Sistem otomatis menerapkan standar ISO 4833-1 (TNTC >300 koloni, TFTC <25 koloni).\n- **Uncertainty Quantification:** Setiap hasil dilengkapi dengan nilai ketidakpastian pengukuran.\n- **4-Role RBAC:** Analyst, Manager, Auditor, Admin — sesuai prinsip separation of duties.\n- **Laporan Terakreditasi:** Format laporan sesuai standar dokumentasi ISO 17025.\n- **Kalibrasi:** Sistem pengingat siklus kalibrasi otomatis.`,

  rbac: `**Sistem Akses 4-Role ColonyAI (RBAC):**\n\n- **Laboratory Analyst:** Unggah specimen, jalankan AI diagnostik, entri data awal.\n- **Laboratory Manager:** Verifikasi hasil, tanda tangan akhir, generate laporan terakreditasi.\n- **Quality Auditor:** Lihat audit trail (read-only), verifikasi integritas kriptografis, monitor kepatuhan.\n- **System Administrator:** Kelola node, provisi pengguna, monitor kesehatan sistem real-time.\n\nModel ini memastikan separation of duties sesuai ISO-17025.`,

  contact: `**Hubungi Tim ColonyAI:**\n\n- **Support Teknis:** service.colonyai.com\n- **Respons:** Dalam 1x24 jam jam kerja.\n\n**Tim yang bisa dihubungi:**\n- Frontend/UI: **Wisnu** (Product Owner)\n- AI/ML Model: **Faras** (AI Lead)\n- Backend/API: **Steven** (Backend Lead)\n- UI/UX Design: **Suci** (UI Developer)`,

  classes: `**5 Kelas Deteksi Model v7/v8:**\n\n- **colony_single** — Koloni tunggal yang terpisah jelas. Target deteksi utama untuk CFU count.\n- **colony_merged** — Koloni yang berdempetan/overlapping. Ditangani dengan algoritma separasi khusus.\n- **bubble** — Gelembung udara pada media agar. Diklasifikasikan sebagai artefak (bukan koloni).\n- **dust_debris** — Partikel debu atau kotoran. Diklasifikasikan sebagai artefak.\n- **media_crack** — Retakan pada media agar. Diklasifikasikan sebagai artefak.\n\nPemisahan 5 kelas ini memastikan akurasi CFU count yang tinggi sesuai ISO 4833-1.`,

  accuracy: `**Metrik Akurasi ColonyAI (v7 vs v8):**\n\n- **Model v7 (Produksi):** Presisi saat ini berada di **87.6%** dengan mAP50 di angka 55.2%.\n- **Model v8 (Sedang Training):** Menargetkan presisi **>95%** dan pengurangan *False Positive* pada debu/gelembung hingga mendekati 0% berkat teknik SMOTE Oversampling.\n- **Konsistensi Manusia vs AI:** Manusia memiliki variansi 25-40% antar analis, sedangkan ColonyAI memiliki konsistensi **100%** (0 variansi).`,

  dataStats: `**Statistik Data Training ColonyAI:**\n\n- **Gambar Dasar:** 1.477 gambar cawan petri berlabel medis.\n- **Objek Teranotasi (Ground Truth):** Puluhan ribu titik koloni.\n- **Dataset Augmented (v8):** Diperbesar menggunakan algoritma SMOTE menjadi **97.638 instances** per epoch untuk menyeimbangkan kelas minoritas (debu & retakan).\n\nData ini menjadikan ColonyAI salah satu AI mikrobiologi dengan dataset paling robust di kelasnya.`,

  clients: `**Jaringan Klien ColonyAI (Global Network):**\n\nSaat ini infrastruktur ColonyAI LIMS digunakan di:\n- **24 Enterprise Nodes** aktif di seluruh dunia.\n- **12 Rumah Sakit Terakreditasi** untuk uji klinis mikrobiologi.\n- **12 Pabrik Food/Pharma** untuk quality control (QC).\n- Tersebar di **5 Negara**.\n\nSistem dimonitor terpusat melalui *Global Network Map* oleh Nexus Master.`,
};

const KB_EN = {
  team: `**ColonyAI Development Team (4 Members):**\n\n- **Wisnu Alfian Nur Ashar** — Product Owner & Frontend Lead. Responsible for Dashboard OS, UI/UX Vision, and scientific nomenclature.\n- **Muhammad Faras** — Scrum Master & AI/ML Lead. Responsible for model training, dataset curation, and inference optimization.\n- **Suci** — UI/UX Developer. Responsible for component styling, annotation system, and marketing assets.\n- **Steven** — Backend Lead. Responsible for API security, database architecture, ISO 17025 compliance, and reports.\n\nFor technical assistance: **service.colonyai.com**`,

  trainingHistory: `**ColonyAI Training History (8 Iterations, v1–v8):**\n\n- **v1–v4:** Early experiments, building basic detection pipeline.\n- **v5–v6:** Increased augmentation and dataset curation.\n- **v7 (ACTIVE PRODUCTION):** colony_detection_full_v7 — Precision **87.6%**, mAP@50 **55.2%**, training duration **~79.6 minutes**. This is the model currently in use.\n- **v8 (DEVELOPMENT):** colony_detection_full_v8 — Finalization & optimization stage, focusing on Recall improvement and micro colony detection.\n\nAll data is stored at: \`ml-training/runs/detect/runs/detect/\``,

  v7detail: `**Audit Detail Model v7 (colony_detection_full_v7):**\n\n- **Status:** Active Production ✅\n- **Precision:** 87.6%\n- **mAP@50:** 55.2%\n- **Training Duration:** 79.6 minutes\n- **Epoch:** 100\n- **Dataset:** colony_dataset (1,477 images)\n- **5 Detection Classes:** colony_single, colony_merged, bubble, dust_debris, media_crack\n- **GPU:** RTX 5050\n\nv7 is our current production standard before v8 is ready for release.`,

  v8detail: `**Model v8 Detail (v8-Enterprise Ready):**\n\n- **Status:** Strategic Training Active 🔄\n- **Focus:** Extreme accuracy on micro colonies & artifact separation.\n- **Dataset:** Balanced Merged Dataset (**1.3 Million annotations**).\n- **Volume:** 116,654 balanced petri dish images.\n- **Intelligence:** Uses YOLOv8s architecture at 640px for maximum detail.\n\nThis model is specifically designed to pass ISO-17025 audit standards flawlessly.`,

  datasets: `**Primary ColonyAI Dataset (\`colonyai_merged\`):**\n\n- **Total Data:** **1,303,078 bounding boxes**.\n- **Class Balance:** Processed via *Strategic Oversampling*.\n- **Contents:**\n  - **Colony Single:** 715k+\n  - **Colony Merged:** 269k+\n  - **Bubble:** 184k+\n  - **Dust/Debris:** 40k+ (Key to high accuracy!)\n  - **Media Crack:** 94k+\n\nThis dataset ensures the AI is no longer fooled by dirt or cracks on the agar media.`,

  colonyMini: `**Detail Folder colony_mini:**\n\n- **Function:** Sandbox Dataset for quick algorithm testing.\n- **Contents:** Sample subset from the main \`colony_dataset\`.\n- **Utility:** Validates code/model changes without waiting for full training (saves ~79 minutes per iteration).\n- **Status:** Used exclusively by the Dev team (Faras) for initial experiments.\n- **Important:** This data is NOT used for production training.`,

  roadmap: `**ColonyAI Intelligence Roadmap (v7 → v10):**\n\n- **v7 (Current):** 87.6% Precision. Stable production model.\n- **v8 (Next):** Higher Target Recall, better micro colony detection.\n- **v9 (Future):** Robustness against plate artifacts (bubbles, dust, media cracks). Multi-protocol integration (VRBA, TSA, R2A).\n- **v10 (Ultimate Target):** Perfect accuracy for global industry standardization. Target precision >99% for full ISO certification.\n\nEvery version is validated with ISO-17025 standards before going to production.`,

  trainingDuration: `**Why Does v8 Training Take ~3 Hours Per Epoch?**\n\n- **Data Volume:** Oversampling technique forces AI to process **97,638 object instances** per iteration to distinguish colonies vs artifacts.\n- **Architecture:** YOLOv8 with high-precision calculation.\n- **Hardware Stability:** Multi-threading disabled (workers=0) to prevent *memory crashes* on RTX 5050 during massive data augmentation.\n\nThe 3-hour duration is an investment to achieve a model completely immune to petri dish artifacts.`,

  iso: `**ISO-17025 Compliance in ColonyAI:**\n\n- **Audit Trail:** Every analysis is recorded with timestamp, cryptographic hash, and user identity.\n- **TNTC/TFTC:** System automatically applies ISO 4833-1 standards (TNTC >300 colonies, TFTC <25 colonies).\n- **Uncertainty Quantification:** Every result includes measurement uncertainty value.\n- **4-Role RBAC:** Analyst, Manager, Auditor, Admin — according to separation of duties principle.\n- **Accredited Reports:** Report format according to ISO 17025 documentation standards.\n- **Calibration:** Automatic calibration cycle reminder system.`,

  rbac: `**ColonyAI 4-Role Access System (RBAC):**\n\n- **Laboratory Analyst:** Upload specimen, run AI diagnostics, initial data entry.\n- **Laboratory Manager:** Verify results, final signature, generate accredited reports.\n- **Quality Auditor:** View audit trail (read-only), verify cryptographic integrity, monitor compliance.\n- **System Administrator:** Manage nodes, provision users, real-time system health monitoring.\n\nThis model ensures separation of duties according to ISO-17025.`,

  contact: `**Contact ColonyAI Team:**\n\n- **Technical Support:** service.colonyai.com\n- **Response:** Within 1x24 working hours.\n\n**Team to contact:**\n- Frontend/UI: **Wisnu** (Product Owner)\n- AI/ML Model: **Faras** (AI Lead)\n- Backend/API: **Steven** (Backend Lead)\n- UI/UX Design: **Suci** (UI Developer)`,

  classes: `**5 Detection Classes of Model v7/v8:**\n\n- **colony_single** — Clearly separated single colonies. Primary detection target for CFU count.\n- **colony_merged** — Adjacent/overlapping colonies. Handled with special separation algorithms.\n- **bubble** — Air bubbles on agar media. Classified as artifact (not colony).\n- **dust_debris** — Dust particles or dirt. Classified as artifact.\n- **media_crack** — Cracks on agar media. Classified as artifact.\n\nSeparating these 5 classes ensures high CFU count accuracy according to ISO 4833-1.`,

  accuracy: `**ColonyAI Accuracy Metrics (v7 vs v8):**\n\n- **Model v7 (Production):** Current precision is at **87.6%** with mAP50 at 55.2%.\n- **Model v8 (In Training):** Targeting **>95%** precision and reducing *False Positives* on dust/bubbles to near 0% thanks to SMOTE Oversampling techniques.\n- **Human vs AI Consistency:** Human analysts have 25-40% variance, while ColonyAI maintains **100%** consistency (0 variance).`,

  dataStats: `**ColonyAI Training Data Statistics:**\n\n- **Base Images:** 1,477 medically labeled petri dish images.\n- **Annotated Objects (Ground Truth):** Tens of thousands of colony points.\n- **Augmented Dataset (v8):** Expanded using SMOTE algorithms to **97,638 instances** per epoch to balance minority classes (dust & cracks).\n\nThis makes ColonyAI one of the most robust microbiology AI datasets in its class.`,

  clients: `**ColonyAI Client Network (Global Network):**\n\nCurrently, the ColonyAI LIMS infrastructure is deployed across:\n- **24 Active Enterprise Nodes** worldwide.\n- **12 Accredited Hospitals** for clinical microbiology testing.\n- **12 Food/Pharma Factories** for quality control (QC).\n- Spanning across **5 Countries**.\n\nThe system is centrally monitored via the *Global Network Map* by the Nexus Master.`,
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

  // Accuracy
  if (query.match(/akurat|akurasi|accurate|accuracy|presisi|precision/)) {
    return { 
      content: KB.accuracy, 
      quickActions: language === 'id'
        ? ["Statistik Data?", "Status v8?", "Jumlah klien?"]
        : ["Data stats?", "Status v8?", "Client count?"]
    };
  }

  // Data Stats (How much data)
  if (query.match(/berapa data|jumlah data|banyak data|how much data|data count/)) {
    return { 
      content: KB.dataStats, 
      quickActions: language === 'id'
        ? ["Seberapa akurat?", "Kenapa 3 jam?", "Isi 3 folder dataset?"]
        : ["How accurate?", "Why 3 hours?", "3 Dataset folders?"]
    };
  }

  // Clients / Companies
  if (query.match(/company|perusahaan|klien|client|rumah sakit|hospital|pabrik|factory|pengguna|user/)) {
    return { 
      content: KB.clients, 
      quickActions: language === 'id'
        ? ["Seberapa akurat?", "Sistem RBAC?", "ISO-17025 di ColonyAI?"]
        : ["How accurate?", "RBAC System?", "ISO-17025 in ColonyAI?"]
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
    <div className={`fixed z-[120] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
      isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
    } 
    bottom-0 left-0 w-full h-[92vh] bg-white dark:bg-slate-900 shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.3)] flex flex-col rounded-t-[2.5rem] overflow-hidden
    sm:bottom-24 sm:right-6 sm:left-auto sm:w-[400px] sm:h-[600px] sm:rounded-3xl sm:translate-y-0 sm:opacity-100 sm:pointer-events-auto
    ${isOpen ? "" : "sm:hidden"}`}>

        {/* ── Grab Handle (Native Feel - Mobile Only) ── */}
        <div className="w-full flex justify-center pt-4 pb-2 sm:hidden">
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 sm:px-4 sm:py-3 bg-slate-900 dark:bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
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
    );
  }

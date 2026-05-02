"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  ChevronDown,
  CheckCircle2,
  Cpu,
  BarChart3,
  FileText,
  FlaskConical,
  Scale
} from "lucide-react";

const TOP_BAR_BG = "bg-[#009696]";

export default function LayananPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      {/* ── Top Bar ── */}
      <div className={`${TOP_BAR_BG} text-white text-[11px] py-1.5 px-6 hidden lg:block`}>
        <div className="max-w-7xl mx-auto flex justify-end items-center gap-6 font-semibold">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" />
            <span>150881</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" />
            <span>support@colonyai.id</span>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className={`sticky top-0 w-full z-[100] bg-white border-b border-slate-100 py-4 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <img src="/android-chrome-512x512.png" alt="Logo" className="h-10 lg:h-11 w-auto" />
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#009696]">Layanan ColonyAI</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Home</Link>
            <Link href="/profil" className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Profil</Link>
            <Link href="/teknologi" className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Teknologi</Link>
          </div>
        </div>
      </nav>

      {/* ── Breadcrumb ── */}
      <div className="bg-slate-50 py-4 px-6 border-b border-slate-100">
        <div className="max-w-7xl mx-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest flex gap-2">
          <Link href="/" className="hover:text-[#009696]">Home</Link>
          <span>/</span>
          <span className="text-slate-600">Layanan Analisis</span>
        </div>
      </div>

      {/* ── Content ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h1 className="text-4xl font-bold text-[#009696]">Layanan Unggulan</h1>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">ColonyAI menyediakan solusi hulu ke hilir untuk digitalisasi analisis mikrobiologi dengan standar akurasi tinggi.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Cpu,
                title: "AI Plate Counting",
                desc: "Penghitungan koloni otomatis menggunakan model YOLOv8 yang telah dilatih pada puluhan ribu sampel piringan agar.",
                features: ["Akurasi ≥92%", "Klasifikasi 5 Kelas", "Waktu Analisis < 2 Menit"]
              },
              {
                icon: Scale,
                title: "Simulator Akurasi",
                desc: "Modul untuk membandingkan hasil penghitungan AI dengan standar manual (benchmarking) untuk keperluan validasi metode.",
                features: ["Side-by-side View", "Statistik Perbandingan", "Audit Ledger"]
              },
              {
                icon: FileText,
                title: "Pelaporan Digital",
                desc: "Pembuatan laporan otomatis dalam format PDF/CSV yang siap disinkronisasi dengan sistem LIMS laboratorium.",
                features: ["Format ISO-17025", "Analyst Sign-off", "Histori Terenkripsi"]
              }
            ].map((layanan, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-10 hover:shadow-2xl hover:border-slate-200 transition-all flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#00A4A6]/10 rounded-full flex items-center justify-center mb-8">
                  <layanan.icon className="w-8 h-8 text-[#00A4A6]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{layanan.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-8">{layanan.desc}</p>
                <ul className="space-y-3 w-full text-left bg-slate-50 p-6 rounded-xl">
                  {layanan.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-3 text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00A4A6]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-32 p-12 bg-slate-900 rounded-3xl text-white flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6 flex-1">
              <h2 className="text-3xl font-bold">Butuh Konsultasi Kustom?</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Tim teknis kami siap membantu integrasi ColonyAI ke dalam workflow khusus laboratorium Anda, termasuk pelatihan model untuk jenis media agar yang belum tersedia.
              </p>
              <button className="bg-[#00A4A6] text-white px-10 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-lg">
                Hubungi Kami
              </button>
            </div>
            <div className="flex-1 w-full lg:max-w-md">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Support</p>
                    <p className="text-sm font-bold">support@colonyai.id</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone Line</p>
                    <p className="text-sm font-bold">150881 (24/7)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-slate-100 py-10 px-6 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 ColonyAI Infrastructure. Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  );
}

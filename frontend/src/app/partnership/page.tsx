import { Footer } from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft, Handshake } from "lucide-react";

export default function PartnershipPage() {
  return (
    <div className="min-h-screen bg-[#f8faff] flex flex-col font-sans">
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <Handshake className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold text-[#1a237e] uppercase tracking-widest mb-6">Strategic Partnership</h1>
        <p className="text-slate-500 font-medium max-w-2xl text-sm lg:text-base leading-relaxed mb-12">
          Join forces with ColonyAI to innovate and expand the future of automated laboratory solutions. 
          Contact our team to discuss potential synergies and strategic integrations.
        </p>
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs font-black text-[#1a237e] uppercase tracking-widest hover:text-[#0055ff] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </main>
      <Footer />
    </div>
  );
}

import { Footer } from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CareerPage() {
  return (
    <div className="min-h-screen bg-[#f8faff] flex flex-col font-sans">
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-4xl lg:text-6xl font-bold text-[#1a237e] uppercase tracking-widest mb-6">Career Opportunities</h1>
        <p className="text-slate-500 font-medium max-w-2xl text-sm lg:text-base leading-relaxed mb-12">
          We are currently building our neural network of talented individuals. Check back later for open positions at ColonyAI Research Nodes.
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

'use client'

import React from 'react';
import { 
  ChevronRight, 
  ExternalLink, 
  FlaskConical, 
  Search, 
  Copy,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface DocumentationSidebarProps {
  showDocs: boolean;
  setShowDocs: (show: boolean) => void;
  directory: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function DocumentationSidebar({
  showDocs,
  setShowDocs,
  directory,
  title,
  description,
  children
}: DocumentationSidebarProps) {
  if (!showDocs) return null;

  const handleCopyDocs = () => {
    const text = `${title} Documentation...`;
    navigator.clipboard.writeText(text);
    toast.success('Documentation summary copied to clipboard');
  };

  return (
    <div className="w-full sm:w-80 lg:w-[350px] flex flex-col bg-white border-l border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300 fixed right-0 top-14 sm:top-16 bottom-0 z-[60] sm:z-30">
      {/* Header Section */}
      <div className="px-3 py-3 sm:px-4 sm:py-4 border-b border-slate-100 flex items-center gap-2 sm:gap-3 bg-white sticky top-0 z-10">
        <button onClick={() => setShowDocs(false)} className="p-1.5 sm:p-2 hover:bg-slate-50 rounded-lg transition-colors group flex-shrink-0">
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-slate-900" />
        </button>
        <div className="flex flex-col">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-none">Documentation</h3>
          <a href="#" className="text-[10px] sm:text-xs text-primary hover:underline flex items-center gap-1 mt-1 font-black uppercase tracking-widest">
            Full view <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Docs Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6 sm:space-y-8 bg-white">
        <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary rounded flex items-center justify-center">
              <FlaskConical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">ColonyAI Docs</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => toast('Neural Search engine initialized', { icon: '🔍' })}
              className="p-1 hover:bg-slate-50 rounded transition-colors"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 cursor-pointer hover:text-slate-900" />
            </button>
            <button 
              onClick={() => toast('Documentation index toggled', { icon: '📖' })}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="w-3 h-[1.2px] sm:w-3.5 sm:h-[1.5px] bg-slate-600 relative before:absolute before:-top-1 before:left-0 before:w-3 before:h-[1.2px] before:bg-slate-600 after:absolute after:top-1 after:left-0 after:w-3 after:h-[1.2px] after:bg-slate-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white rounded-md border border-slate-200 w-fit shadow-sm">
          <button className="flex items-center gap-1.5 px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-slate-700 bg-slate-50 rounded-md border border-slate-200 hover:bg-slate-100 transition-colors">
            Page <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
          <span className="text-[10px] sm:text-xs font-bold text-slate-800 px-1 sm:px-2">Overview</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-slate-400">
            <span>Dir</span>
            <ChevronRight className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
            <span className="text-slate-600 font-bold uppercase tracking-tighter truncate max-w-[120px]">{directory}</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleCopyDocs}
              className="flex items-center gap-1.5 px-1.5 py-0.5 sm:px-2 sm:py-1 border border-slate-200 rounded text-[10px] sm:text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Copy
            </button>
          </div>
        </div>
        
        <div className="space-y-6 sm:space-y-10">
          {/* Title Section */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2 sm:mb-3">{title}</h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">{description}</p>
          </div>
          
          {/* Main Content Rendered Here */}
          <div className="prose-tighter">
            {children}
          </div>

          {/* Footer Links Section */}
          <div className="pt-6 sm:pt-10 pb-6 sm:pb-8 border-t border-slate-100 mt-4 sm:mt-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 gap-y-3 sm:gap-y-4">
              {[
                'Support', 'System status', 'Careers', 'Terms of Use', 
                'Report Security Issues', 'Privacy Policy'
              ].map((link, i) => (
                <a key={i} href="#" className="text-[10px] sm:text-xs text-slate-400 hover:text-primary transition-colors font-bold uppercase tracking-tight">
                  {link}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 py-1.5 px-2.5 sm:py-2 sm:px-3 bg-white border border-slate-200 rounded-xl w-fit cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
              <div className="flex">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500 border border-white -mr-1" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white border border-blue-500" />
              </div>
              <span className="text-[10px] sm:text-xs text-slate-600 font-bold uppercase tracking-tighter">Cookies</span>
            </div>

            <div className="pt-1">
              <p className="text-[9px] sm:text-xs text-slate-300 font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                © 2026 ColonyAI, Inc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DocumentationToggle({ 
  showDocs, 
  setShowDocs, 
  text = "Documentation" 
}: { 
  showDocs: boolean; 
  setShowDocs: (s: boolean) => void;
  text?: string;
}) {
  if (showDocs) return null;
  return (
    <button
      onClick={() => setShowDocs(true)}
      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-all mt-4 animate-in fade-in"
    >
      <BookOpen className="w-3 h-3" />
      {text}
    </button>
  );
}

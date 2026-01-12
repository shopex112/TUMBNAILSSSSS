
import React, { useEffect, useState } from 'react';
import { AnalysisResult } from '../types';

interface Props {
  data: AnalysisResult;
  onBack: () => void;
  onDownload: () => void;
  onGenerateOptimized?: (prompt: string) => void;
}

export const AnalysisResultView: React.FC<Props> = ({ data, onBack, onDownload, onGenerateOptimized }) => {
  const [gaugeRotation, setGaugeRotation] = useState(-90);
  const [copiedOptimized, setCopiedOptimized] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const targetRotation = -90 + (data.score / 100) * 180;
    setTimeout(() => setGaugeRotation(targetRotation), 300);

    let start = 0;
    const end = data.score;
    const duration = 1500;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedScore(end);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [data.score]);

  const copyOptimized = () => {
    if (data.optimizedViralPrompt) {
      navigator.clipboard.writeText(data.optimizedViralPrompt);
      setCopiedOptimized(true);
      setTimeout(() => setCopiedOptimized(false), 2000);
    }
  };

  return (
    <div className="w-full h-full p-6 lg:p-10 flex flex-col items-center justify-start animate-zoom-in overflow-y-auto custom-scrollbar">
      
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

      <div className="text-center mb-8 relative w-full">
        <h2 className="text-3xl font-black text-white flex items-center justify-center gap-3 tracking-tighter uppercase">
          דו"ח ויראליות <span className="text-indigo-400">Pro Vision</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-7xl items-stretch mb-8">
        
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass rounded-[2rem] p-6 flex flex-col items-center justify-center border-white/5 shadow-xl relative overflow-hidden h-48">
             <div className="relative w-full max-w-[180px] aspect-[2/1] mb-2 scale-110">
                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#gaugeGrad)" strokeWidth="7" strokeLinecap="round" strokeDasharray="125" strokeDashoffset={125 - (data.score / 100) * 125} className="transition-all duration-[2s] ease-out" />
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <g style={{ transform: `rotate(${gaugeRotation}deg)`, transformOrigin: '50px 50px', transition: 'transform 2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                     <line x1="50" y1="50" x2="50" y2="15" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                  </g>
                </svg>
                <div className="absolute inset-x-0 bottom-0 text-center translate-y-2">
                   <div className="text-4xl font-black text-white tracking-tighter">{animatedScore}%</div>
                   <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{data.rating}</div>
                </div>
             </div>
          </div>

          <div className="glass rounded-[2rem] p-6 flex flex-col gap-4 border-white/5">
             <div className="flex items-center justify-end gap-2">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">חוות דעת ה-AI</span>
                <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
             </div>
             <p className="text-[13px] text-slate-300 leading-relaxed text-right">{data.reasoning}</p>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass rounded-[2rem] border-2 border-indigo-500/30 bg-indigo-500/5 overflow-hidden shadow-2xl flex flex-col h-full">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/20">
               <div className="text-right">
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em] block mb-0.5">OPTIMIZED PROMPT - GOAL: 98%</span>
                  <h4 className="text-lg font-black text-white uppercase">הנחיה ויראלית משודרגת</h4>
               </div>
               <div className="flex gap-2">
                 <button onClick={copyOptimized} className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white text-slate-950 transition-all hover:bg-slate-200">
                    {copiedOptimized ? "הועתק!" : "העתק 📥"}
                 </button>
               </div>
            </div>
            <div className="p-6 flex-1 bg-black/40 text-[13px] text-slate-300 font-mono text-right italic leading-relaxed">
              "{data.optimizedViralPrompt}"
            </div>
            <div className="p-5 bg-indigo-600/10 border-t border-white/5 flex flex-col items-center gap-3">
              <p className="text-[10px] text-slate-400 text-center font-bold italic">הפרומפט הזה כולל 'Pattern Disruption' ו-'Big Idea' כדי למקסם CTR</p>
              
              {onGenerateOptimized && (
                <button 
                  onClick={() => onGenerateOptimized(data.optimizedViralPrompt)} 
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.1em] shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all animate-pulse"
                >
                  🚀 שדרג ל-98% ויראליות
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2">
           <span className="text-[8px] text-slate-500 font-black uppercase">פלטת צבעים</span>
           <div className="flex -space-x-1.5">
              {data.colorPalette?.map((c, i) => <div key={i} className="w-6 h-6 rounded-full border border-black shadow-sm" style={{ backgroundColor: c }} />)}
           </div>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-1 text-center">
           <span className="text-[8px] text-slate-500 font-black uppercase">סגנון מזוהה</span>
           <span className="text-[11px] text-indigo-400 font-black">{data.styleDetected}</span>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 lg:col-span-2 overflow-hidden relative">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] text-slate-500 font-black uppercase">אלמנטים ויראליים</span>
           </div>
           <div className="flex flex-wrap gap-1.5 justify-end">
             {data.elements?.map((el, i) => <span key={i} className="text-[9px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20">{el}</span>)}
           </div>
        </div>
      </div>

      <div className="w-full max-w-7xl flex flex-col sm:flex-row gap-4">
        <button onClick={onBack} className="flex-1 py-5 bg-white text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.01] transition-all">חזור לעריכה</button>
        <button onClick={onDownload} className="flex-1 py-5 bg-slate-900 border border-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest">הורד מקור</button>
      </div>
    </div>
  );
};

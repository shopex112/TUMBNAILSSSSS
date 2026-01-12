
import React, { useState } from 'react';
import { creditService } from '../services/creditService';

interface Props {
  onClose: () => void;
  onAnalyze: (url: string) => void;
}

export const AnalyzeCompetitorModal: React.FC<Props> = ({ onClose, onAnalyze }) => {
  const [url, setUrl] = useState('');

  const handleAnalyzeClick = () => {
      if (!url || !(url.includes('youtube.com') || url.includes('youtu.be'))) {
          alert('אנא הזן קישור תקין ליוטיוב.');
          return;
      }
      onAnalyze(url); 
  };

  return (
    <div className="fixed inset-0 z-[110] glass flex items-center justify-center p-6 backdrop-blur-3xl animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-950 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors">✕</button>
        
        <div className="space-y-2 text-right">
          <h2 className="text-3xl font-black text-white">ניתוח מתחרים <span className="text-indigo-400 italic">Pro</span></h2>
          <p className="text-slate-500 text-sm font-bold">הדבק קישור לסרטון יוטיוב כדי לנתח את התמונה הממוזערת שלו (עלות: {creditService.getCost('analyze')} קרדיטים)</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleAnalyzeClick} 
            disabled={!url}
            className="px-8 py-4 bg-indigo-600 rounded-2xl text-[11px] font-black uppercase text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30"
          >
            נתח תמונה ✨
          </button>
          <input 
            type="text" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            placeholder="https://www.youtube.com/watch?v=..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-left outline-none focus:border-indigo-500 transition-colors"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { GenerationService } from '../services/geminiService';
import { creditService } from '../services/creditService';

interface Props {
  onClose: () => void;
  onBuyCredits: () => void;
}

export const TitleGeneratorModal: React.FC<Props> = ({ onClose, onBuyCredits }) => {
  const [topic, setTopic] = useState('');
  const [titles, setTitles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!topic || isLoading) return;
    setError('');
    
    try {
      creditService.deductCredits(creditService.getCost('title'));
      setIsLoading(true);
      const results = await GenerationService.generateViralTitles(topic);
      setTitles(results);
    } catch (err: any) {
       if (err.message.includes('קרדיטים')) {
        setError(err.message);
      } else {
        alert("שגיאה ביצירת כותרות.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBuyCredits = () => {
    onClose();
    onBuyCredits();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('הועתק!');
  };

  return (
    <div className="fixed inset-0 z-[110] glass flex items-center justify-center p-6 backdrop-blur-3xl animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-950 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors">✕</button>
        
        <div className="space-y-2 text-right">
          <h2 className="text-3xl font-black text-white">מחולל כותרות <span className="text-indigo-400 italic">Viral Pro</span></h2>
          <p className="text-slate-500 text-sm font-bold">הזן נושא וקבל כותרות מבוססות הנדסת קליקים (עלות: {creditService.getCost('title')} קרדיט)</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={generate} 
            disabled={!topic || isLoading}
            className="px-8 py-4 bg-indigo-600 rounded-2xl text-[11px] font-black uppercase text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30"
          >
            {isLoading ? "מעבד..." : "מציא כותרות ✨"}
          </button>
          <input 
            type="text" 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)} 
            placeholder="מה נושא הסרטון שלך?..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-right outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {error && (
            <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm font-bold">{error}</p>
                 <button onClick={handleBuyCredits} className="mt-2 text-xs font-bold text-indigo-400 underline">רכוש קרדיטים</button>
            </div>
        )}

        {titles.length > 0 && (
          <div className="space-y-3 animate-slide-in-bottom">
            {titles.map((title, i) => (
              <div 
                key={i} 
                onClick={() => copyToClipboard(title)}
                className="group flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-600/10 cursor-pointer transition-all"
              >
                <span className="text-indigo-400 opacity-0 group-hover:opacity-100 text-[10px] font-black uppercase tracking-widest transition-opacity">Copy 📋</span>
                <p className="text-[15px] font-bold text-slate-200 text-right">{title}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
          <p className="text-[10px] text-slate-600 text-center italic">המערכת משתמשת בטכניקות של ניגודיות, העצמה ונוסחת ה-3-Part ליצירת ויראליות מקסימלית</p>
        </div>
      </div>
    </div>
  );
};

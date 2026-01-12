
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { creditService } from '../services/creditService';

interface HeaderProps {
  user: User | null;
  onGoHome: () => void;
  onLogout: () => void;
  onSave: () => void;
  onOpenGallery: () => void;
  onOpenCreditStore: () => void;
  isSavingProject: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, onGoHome, onLogout, onSave, onOpenGallery, onOpenCreditStore, isSavingProject }) => {
  const [credits, setCredits] = useState(creditService.getCreditBalance());

  useEffect(() => {
    const updateCredits = () => setCredits(creditService.getCreditBalance());
    window.addEventListener('credit-update', updateCredits);
    updateCredits(); // Initial fetch
    return () => window.removeEventListener('credit-update', updateCredits);
  }, []);

  return (
    <header className="pt-8 pb-4">
      <div className="container mx-auto px-8 flex justify-between items-center max-w-[1600px]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border-white/10 shadow-2xl">
             <div className="w-6 h-6 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          </div>
          <div className="flex flex-col">
             <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">PRO STUDIO</span>
             <h1 className="text-xl font-black text-white tracking-tighter -mt-1">YouTube Pro Studio</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <nav className="hidden lg:flex items-center gap-6">
              <button onClick={onGoHome} className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">בית</button>
              <button onClick={onOpenGallery} className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">הפרויקטים שלי</button>
              <button onClick={onSave} disabled={isSavingProject} className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-colors disabled:opacity-50">
                {isSavingProject ? 'שומר...' : '💾 שמור'}
              </button>
           </nav>
            <div className="flex items-center gap-4">
                <button onClick={onOpenCreditStore} className="glass rounded-full px-4 py-2 flex items-center gap-2 border-indigo-500/30 hover:border-indigo-500/80 transition-colors">
                    <span className="text-amber-400 text-lg">💎</span>
                    <span className="text-sm font-bold text-white">{credits}</span>
                    <span className="text-[9px] font-bold text-slate-500 group-hover:text-white transition-colors">+</span>
                </button>
                <div className="text-right">
                <span className="text-xs font-bold text-white truncate max-w-[120px]">{user?.email}</span>
                <button onClick={onLogout} className="text-[9px] text-slate-500 hover:text-red-400 font-bold transition-colors block text-right">התנתק</button>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/10 bg-slate-900 overflow-hidden cursor-pointer">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} className="w-full h-full" alt="User" />
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};


import React from 'react';
import { creditService } from '../services/creditService';

interface Props {
  onClose: () => void;
}

const creditPacks = [
  { credits: 100, price: '₪19.99', icon: '💎' },
  { credits: 500, price: '₪79.99', icon: '💰', bestValue: true },
  { credits: 2000, price: '₪299.99', icon: '🚀' },
];

export const CreditStoreModal: React.FC<Props> = ({ onClose }) => {

  const handlePurchase = (amount: number) => {
    creditService.addCredits(amount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] glass flex items-center justify-center p-6 backdrop-blur-3xl animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-950 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors">✕</button>
        <div className="space-y-2 text-right">
          <h2 className="text-3xl font-black text-white">רכישת קרדיטים</h2>
          <p className="text-slate-500 text-sm font-bold">כל פעולת AI צורכת קרדיטים. רכוש חבילה כדי להמשיך ליצור.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPacks.map((pack) => (
            <div key={pack.credits} className={`relative glass rounded-3xl p-6 text-center border transition-all duration-300 ${pack.bestValue ? 'border-indigo-500' : 'border-white/10'}`}>
              {pack.bestValue && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">הכי משתלם</div>}
              <div className="text-5xl mb-3">{pack.icon}</div>
              <h3 className="text-3xl font-black text-white">{pack.credits}</h3>
              <p className="text-sm text-slate-400 mb-4">קרדיטים</p>
              <button onClick={() => handlePurchase(pack.credits)} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">
                רכוש ב-{pack.price}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

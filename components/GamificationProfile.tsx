
import React from 'react';
import { GamificationState } from '../types';

interface Props {
  state: GamificationState;
  onOpenModal: () => void;
}

export const GamificationProfile: React.FC<Props> = ({ state, onOpenModal }) => {
  const currentLevelPoints = state.level > 1 ? LEVELS[state.level - 1].points : 0;
  const pointsInLevel = state.points - currentLevelPoints;
  const pointsForLevel = state.pointsForNextLevel - currentLevelPoints;
  const progress = pointsForLevel > 0 ? (pointsInLevel / pointsForLevel) * 100 : 100;

  return (
    <button 
      onClick={onOpenModal}
      className="w-full glass rounded-3xl p-5 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/50 bg-slate-900 flex items-center justify-center text-xl shadow-lg avatar-glow">
          🏆
        </div>
        <div className="flex-1 text-right">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{state.levelName}</span>
            <span className="text-[10px] font-bold text-slate-500">רמה {state.level}</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full mt-1 overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
             <div className="flex items-center gap-1.5">
                <span className="text-amber-400 text-xs">🔥</span>
                <span className="text-xs font-bold text-slate-300">{state.dailyStreak.count}</span>
             </div>
             <span className="text-xs font-bold text-slate-400">{state.points.toLocaleString()} XP</span>
          </div>
        </div>
      </div>
    </button>
  );
};

// Simplified LEVELS definition for this component
const LEVELS = [
  { name: "Newcomer", points: 0 }, { name: "Creator", points: 100 },
  { name: "Designer", points: 250 }, { name: "Pro Designer", points: 500 },
  { name: "Thumbnail Artist", points: 1000 }, { name: "Viral Virtuoso", points: 2000 },
  { name: "Clickbait King", points: 5000 }, { name: "Thumbnail God", points: 10000 },
];

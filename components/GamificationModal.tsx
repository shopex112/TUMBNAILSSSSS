
import React, { useState } from 'react';
import { GamificationState, Achievement, DailyChallenge } from '../types';

interface Props {
  state: GamificationState;
  onClose: () => void;
}

const TabButton: React.FC<{ title: string; isActive: boolean; onClick: () => void }> = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 pb-3 text-sm font-bold uppercase tracking-widest transition-colors relative ${isActive ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-300'}`}
    >
        {title}
        {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-full" />}
    </button>
);

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
    <div className={`p-5 rounded-2xl flex items-center gap-5 transition-all ${achievement.unlocked ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 border border-transparent opacity-60'}`}>
        <div className={`w-12 h-12 text-2xl flex items-center justify-center rounded-xl ${achievement.unlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-black/20'}`}>
            {achievement.unlocked ? achievement.icon : '🔒'}
        </div>
        <div className="flex-1 text-right">
            <h4 className="font-bold text-white">{achievement.name}</h4>
            <p className="text-xs text-slate-400">{achievement.description}</p>
        </div>
        <div className="text-center">
            <span className="font-black text-lg text-amber-400">+{achievement.points}</span>
            <span className="block text-[8px] text-slate-500 font-bold uppercase">XP</span>
        </div>
    </div>
);

const ChallengeCard: React.FC<{ challenge: DailyChallenge }> = ({ challenge }) => {
    const progress = (challenge.current / challenge.goal) * 100;
    return (
        <div className={`p-5 rounded-2xl flex items-center gap-5 transition-all ${challenge.isComplete ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-white/5 border border-transparent'}`}>
            <div className={`w-12 h-12 text-2xl flex items-center justify-center rounded-xl ${challenge.isComplete ? 'bg-indigo-500/20 text-indigo-400' : 'bg-black/20 text-slate-500'}`}>
                {challenge.isComplete ? '✅' : '🎯'}
            </div>
            <div className="flex-1 text-right">
                <h4 className="font-bold text-white">{challenge.name}</h4>
                <p className="text-xs text-slate-400">{challenge.description}</p>
                <div className="w-full h-2 bg-black/30 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
            </div>
            <div className="text-center">
                 <span className="font-black text-lg text-amber-400">+{challenge.points}</span>
                <span className="block text-[8px] text-slate-500 font-bold uppercase">XP</span>
            </div>
        </div>
    );
};

export const GamificationModal: React.FC<Props> = ({ state, onClose }) => {
  const [activeTab, setActiveTab] = useState<'achievements' | 'challenges'>('achievements');
  
  // The fullAchievements list is now passed directly in the state
  const achievements: Achievement[] = (state as any).fullAchievements || [];

  return (
    <div className="fixed inset-0 z-[110] glass flex items-center justify-center p-6 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl h-[80vh] bg-slate-950 border border-white/10 rounded-[3rem] p-8 lg:p-12 shadow-2xl relative flex flex-col">
        <button onClick={onClose} className="absolute top-8 left-8 text-2xl text-slate-500 hover:text-white transition-colors">✕</button>
        
        <div className="text-right mb-8">
            <h2 className="text-3xl font-black text-white">מרכז Gamification</h2>
            <p className="text-slate-500 font-bold">עקוב אחר ההתקדמות, ההישגים והאתגרים שלך</p>
        </div>

        <div className="flex border-b border-white/10 mb-6">
            <TabButton title="הישגים" isActive={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} />
            <TabButton title="אתגרים יומיים" isActive={activeTab === 'challenges'} onClick={() => setActiveTab('challenges')} />
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
            {activeTab === 'achievements' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    {achievements.map(ach => <AchievementCard key={ach.id} achievement={ach} />)}
                </div>
            )}
            {activeTab === 'challenges' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                   {state.challenges.list.map(ch => <ChallengeCard key={ch.id} challenge={ch} />)}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

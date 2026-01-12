
import React from 'react';
import { AspectRatio } from '../types';

interface Props {
  onSelect: (aspectRatio: AspectRatio) => void;
}

const platforms = [
  { name: 'YouTube Thumbnail', aspectRatio: '16:9' as AspectRatio, icon: '📺', description: 'Standard video thumbnail' },
  { name: 'TikTok / Reels Cover', aspectRatio: '9:16' as AspectRatio, icon: '📱', description: 'Vertical video format' },
  { name: 'Instagram Post', aspectRatio: '1:1' as AspectRatio, icon: '🖼️', description: 'Square post for feed' },
  { name: 'Presentation Slide', aspectRatio: '4:3' as AspectRatio, icon: '🖥️', description: 'Classic presentation format' },
];

export const PlatformSelector: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-24 h-24 glass rounded-3xl flex items-center justify-center mx-auto border border-white/20 shadow-2xl text-5xl mb-8">
        🚀
      </div>
      <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Welcome to Pro Studio</h1>
      <p className="text-slate-400 text-lg mb-12">Choose your canvas to get started.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl">
        {platforms.map((platform) => (
          <button 
            key={platform.name}
            onClick={() => onSelect(platform.aspectRatio)}
            className="glass rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <div className="text-6xl mb-2 transition-transform duration-300 group-hover:scale-110">{platform.icon}</div>
            <h2 className="text-xl font-bold text-white">{platform.name}</h2>
            <p className="text-sm text-slate-400">{platform.description}</p>
            <span className="mt-2 text-xs font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">{platform.aspectRatio}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

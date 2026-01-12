import React, { useRef, useState, memo } from 'react';
import { ThumbnailSettings, YouTuberStyle, ThumbnailStyle } from '../types';
import { GenerationService } from '../services/geminiService';

interface Props {
  settings: ThumbnailSettings;
  setSettings: React.Dispatch<React.SetStateAction<ThumbnailSettings>>;
  onGenerate: () => void;
  isLoading: boolean;
}

const YOUTUBER_STYLES: { id: YouTuberStyle; name: string; img: string }[] = [
  { id: 'mrbeast', name: 'MrBeast', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MrBeast' },
  { id: 'mkbhd', name: 'MKBHD', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MKBHD' },
  { id: 'aliabdaal', name: 'Ali Abdaal', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali' },
  { id: 'custom', name: 'Style', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Style' }
];

const VISUAL_STYLES: { id: ThumbnailStyle; label: string }[] = [
  { id: 'cinematic', label: 'קולנועי' },
  { id: 'realistic', label: 'ריאליסטי' },
  { id: 'vibrant', label: 'צבעוני' },
  { id: '3d-render', label: 'תלת-מימד' },
];

export const ControlPanel: React.FC<Props> = memo(({ settings, setSettings, onGenerate, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExpanding, setIsExpanding] = useState(false);

  const handleExpandPrompt = async () => {
    if (!settings.prompt || isExpanding) return;
    setIsExpanding(true);
    try {
      const expanded = await GenerationService.expandPrompt(settings.prompt);
      setSettings(prev => ({ ...prev, prompt: expanded }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsExpanding(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // FIX: Use a for...of loop to iterate over the files. This is more robust and can avoid potential TypeScript inference issues with forEach on a FileList.
      for (const file of e.target.files) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result;
          if (typeof result === 'string') {
            setSettings(prev => ({
              ...prev,
              userPhotos: [...(prev.userPhotos || []), result].slice(0, 4) // Limit to 4 photos
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removePhoto = (index: number) => {
    setSettings(prev => ({
      ...prev,
      userPhotos: prev.userPhotos?.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Identity Upload Section */}
      <div className="space-y-3 text-right">
        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">תמונות אישיות (4)</label>
        <div className="grid grid-cols-4 gap-2">
          {settings.userPhotos?.map((photo, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-slate-900">
              <img src={photo} className="w-full h-full object-cover" alt="User upload" />
              <button 
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-600/80 rounded-full text-white text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
          {[...Array(4 - (settings.userPhotos?.length || 0))].map((_, i) => (
             <button 
              key={i}
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center gap-1 text-slate-500"
            >
              <span className="text-xl">+</span>
            </button>
          ))}
        </div>
        <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={handlePhotoUpload} />
      </div>

      <div className="space-y-3 text-right">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">בחר יוצר</label>
        <div className="grid grid-cols-4 gap-3">
          {YOUTUBER_STYLES.map((style, idx) => (
            <button key={idx} onClick={() => setSettings(s => ({ ...s, youTuberStyle: style.id }))} className="flex flex-col items-center gap-2 group">
              <div className={`w-12 h-12 rounded-full border-2 p-0.5 transition-all ${settings.youTuberStyle === style.id ? 'border-indigo-500 scale-110 avatar-glow' : 'border-white/10 opacity-60'}`}>
                <img src={style.img} className="w-full h-full rounded-full bg-slate-800" alt={style.name} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 text-right">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">סגנון ויזואלי</label>
        <div className="grid grid-cols-2 gap-2">
          {VISUAL_STYLES.map((style) => (
            <button key={style.id} onClick={() => setSettings(s => ({ ...s, style: style.id }))} className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${settings.style === style.id ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}>
              {style.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 text-right">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">תיאור תמונה (PROMPT)</label>
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 transition-colors focus-within:border-indigo-500/50">
          <textarea className="w-full h-20 bg-transparent text-xs text-white placeholder-slate-600 outline-none resize-none text-right custom-scrollbar" placeholder="מה תרצה שנצייר?..." value={settings.prompt} onChange={(e) => setSettings(s => ({ ...s, prompt: e.target.value }))} />
        </div>
        <button onClick={handleExpandPrompt} disabled={!settings.prompt || isExpanding} className="w-full py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-600/30 transition-all flex items-center justify-center gap-2">
          {isExpanding ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "✨ שדרג הנחיה לריאליסטית"}
        </button>
      </div>

       <div className="space-y-3 text-right">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">אלמנטים להסרה (NEGATIVE)</label>
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-3 transition-colors focus-within:border-fuchsia-500/50">
          <textarea 
            className="w-full h-12 bg-transparent text-xs text-white placeholder-slate-600 outline-none resize-none text-right custom-scrollbar" 
            placeholder="לדוגמה: טקסט, לוגואים..." 
            value={settings.negativePrompt || ''} 
            onChange={(e) => setSettings(s => ({ ...s, negativePrompt: e.target.value }))} 
          />
        </div>
      </div>


      <button id="generate-button-tour" onClick={onGenerate} disabled={isLoading || !settings.prompt} className={`w-full py-5 neon-button-purple rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex flex-col items-center justify-center gap-1 shadow-2xl ${isLoading || !settings.prompt ? 'opacity-40 cursor-not-allowed' : 'text-white'}`}>
        {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
            <span>צור תמונה מהנחיה</span>
        )}
      </button>
    </div>
  );
});
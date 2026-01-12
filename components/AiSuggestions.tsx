import React from 'react';
import { TextTemplate } from '../services/geminiService';

declare const fabric: any;

interface Props {
  templates: TextTemplate[];
  onApply: (templateStyle: any) => void;
}

export const AiSuggestions: React.FC<Props> = ({ templates, onApply }) => {
  if (!templates || templates.length === 0) {
    return null;
  }

  const getCssFromFabricStyle = (style: any) => {
      const fabricShadow = style.shadow ? new fabric.Shadow(style.shadow) : null;
      return {
        color: style.fill,
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight || '900',
        WebkitTextStroke: `${style.strokeWidth || 0}px ${style.stroke || 'transparent'}`,
        textShadow: fabricShadow ? fabricShadow.toString().replace(') 0 0 0', ')') : 'none',
      };
  };


  return (
    <div className="animate-slide-in-bottom">
      <div className="flex items-center gap-2 mb-3 justify-end">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">המלצות מומחים (AI SUGGEST)</span>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template, index) => (
            <button
              key={index}
              onClick={() => onApply(template.style)}
              className="glass rounded-xl p-3 h-20 flex flex-col items-center justify-center text-center hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all"
            >
              <span className="text-xl font-black truncate" style={getCssFromFabricStyle(template.style)}>TEXT PREVIEW</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">{template.name}</span>
            </button>
        ))}
      </div>
    </div>
  );
};

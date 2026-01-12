import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { CanvasEditorHandle } from './CanvasEditor';
import { TextEditorPanel } from './TextEditorPanel';

interface Props {
  editorRef: React.RefObject<CanvasEditorHandle>;
  selectedObject: any | null;
  onAddText: () => void;
  onAddImage: () => void;
  onAnalyze: () => void;
  isLoadingAnalysis: boolean;
  onOpenTitleGenerator: () => void;
  onOpenCompetitorAnalyzer: () => void;
  onAddIcon: () => void;
  onExport: () => void;
  onAutoDesign: () => void;
  isAutoDesigning: boolean;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-3">
        <h3 className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</h3>
        {children}
    </div>
);

const ToolButton: React.FC<{ label: string; onClick: () => void; icon?: string; fullWidth?: boolean; variant?: 'primary' | 'secondary', disabled?: boolean }> = 
({ label, onClick, icon, fullWidth = false, variant = 'secondary', disabled = false }) => {
    const baseClasses = "w-full text-center py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2";
    const colorClasses = variant === 'primary' 
        ? "bg-indigo-600 hover:bg-indigo-500 text-white"
        : "bg-black/30 hover:bg-indigo-500/20 text-slate-300";
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

    return (
        <button onClick={onClick} className={`${baseClasses} ${colorClasses} ${disabledClasses}`} disabled={disabled}>
            {icon && <span>{icon}</span>}
            <span>{label}</span>
        </button>
    );
};


export const EditingPanel: React.FC<Props> = ({ 
    editorRef, selectedObject, onAddText, onAddImage, onAnalyze, 
    isLoadingAnalysis, onOpenTitleGenerator, onOpenCompetitorAnalyzer, onAddIcon, onExport,
    onAutoDesign, isAutoDesigning
}) => {
    const [layers, setLayers] = useState<any[]>([]);

    const isTextSelected = selectedObject && selectedObject.type?.includes('text');

    const refreshLayers = useCallback(() => {
        const canvas = editorRef.current?.getCanvas();
        if (canvas) {
            const filteredLayers = [...canvas.getObjects()].filter(obj => !obj.data?.isBackground).reverse();
            setLayers(filteredLayers);
        }
    }, [editorRef]);

    useEffect(() => {
        const canvas = editorRef.current?.getCanvas();
        if (!canvas) return;
        const events = ['object:added', 'object:removed', 'stack:changed'];
        
        events.forEach(event => canvas.on(event, refreshLayers));
        refreshLayers(); // Initial load
        
        return () => { 
            if (canvas) { 
                events.forEach(event => canvas.off(event, refreshLayers)); 
            }
        };
    }, [editorRef, refreshLayers]);

    return (
        <div id="studio-panel-tour" className="glass rounded-[2rem] p-5 flex flex-col flex-1 h-full">
            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-6">
                
                {isTextSelected && (
                    <TextEditorPanel editorRef={editorRef} selectedObject={selectedObject} />
                )}

                <div className="border border-indigo-500/20 bg-indigo-500/10 rounded-2xl p-4 text-right">
                    <p className="text-xs text-indigo-300 font-bold">✨ חברות פעילה</p>
                    <p className="text-white font-black text-lg">נשארו לך 7 ימים</p>
                    <div className="w-full bg-black/20 h-1.5 rounded-full mt-2"><div className="w-3/4 bg-indigo-400 h-full rounded-full"></div></div>
                </div>

                <Section title="VIRAL TOOLS">
                    <ToolButton label="מחולל כותרות ויראליות" onClick={onOpenTitleGenerator} icon="🧠" />
                    <ToolButton label="נתח מתחרה (YOUTUBE)" onClick={onOpenCompetitorAnalyzer} icon="🔬" />
                </Section>
                
                <Section title="עריכה בסיסית">
                    <ToolButton 
                      label={isAutoDesigning ? 'מעצב...' : 'עיצוב אוטומטי (AI)'} 
                      onClick={onAutoDesign} 
                      icon="🎨" 
                      variant="primary" 
                      disabled={isAutoDesigning}
                    />
                    <div className="grid grid-cols-3 gap-2">
                         <ToolButton label="טקסט" onClick={onAddText} icon="✏️" />
                         <ToolButton label="תמונה" onClick={onAddImage} icon="🖼️" />
                         <ToolButton label="העלה סמל" onClick={onAddIcon} icon="🎭" />
                    </div>
                </Section>
                
                <Section title="ייצוא פוטנציאל ויראלי">
                    <ToolButton 
                        label={isLoadingAnalysis ? "מנתח..." : "נתח פוטנציאל ויראלי"}
                        onClick={onAnalyze} 
                        icon="🚀" 
                        variant="primary" 
                        disabled={isLoadingAnalysis}
                    />
                     <button onClick={onExport} className="w-full text-center py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300">
                        <span>הורדה 4K</span>
                    </button>
                </Section>
                
                <div className="flex-1 flex flex-col min-h-[150px]">
                    <h3 className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">שכבות</h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {layers.map((layer, index) => (
                            <div key={layer.canvas_id || index}
                                onClick={() => editorRef.current?.getCanvas().setActiveObject(layer).renderAll()}
                                className={`p-2 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors ${selectedObject === layer ? 'bg-indigo-500/30' : 'bg-white/5 hover:bg-white/10'}`}>
                                <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); editorRef.current?.toggleLock(layer); }} className="text-sm">{!layer.selectable ? '🔒' : '🔓'}</button>
                                    <button onClick={(e) => { e.stopPropagation(); editorRef.current?.toggleVisibility(layer); }} className="text-sm">{layer.visible ? '👁️' : '🙈'}</button>
                                    <button onClick={(e) => { e.stopPropagation(); editorRef.current?.deleteObject(layer); }} className="w-6 h-6 flex items-center justify-center rounded-full text-red-400 hover:bg-red-500/50 hover:text-white transition-colors">🗑️</button>
                                </div>
                                <span className="font-bold text-white truncate text-right flex-1 mx-2">{layer.data?.name || layer.type || 'שכבה'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
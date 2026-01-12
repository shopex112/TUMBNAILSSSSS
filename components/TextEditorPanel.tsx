import React, { useState, useEffect, useCallback } from 'react';
import { CanvasEditorHandle } from './CanvasEditor';

interface Props {
  editorRef: React.RefObject<CanvasEditorHandle>;
  selectedObject: any;
}

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-black/20 rounded-xl border border-white/5">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-3 text-right flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{title}</span>
                <span className={`transition-transform text-slate-500 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && <div className="p-4 border-t border-white/10 space-y-4">{children}</div>}
        </div>
    );
};

const ColorInput: React.FC<{ label: string; value: string; onChange: (color: string) => void }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="text-xs text-slate-400">{label}</label>
        <div className="relative w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: value }}>
            <input 
              type="color" 
              value={value || '#ffffff'}
              onChange={e => onChange(e.target.value)} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
        </div>
    </div>
);

const RangeSlider: React.FC<{ label: string; value: number; onChange: (value: number) => void; min: number; max: number; step: number }> = 
({ label, value, onChange, min, max, step }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-slate-400">{label}</label>
            <span className="text-xs font-mono text-white bg-slate-900/50 px-1.5 py-0.5 rounded">{value}</span>
        </div>
        <input 
          type="range" 
          value={value} 
          onChange={e => onChange(parseFloat(e.target.value))} 
          min={min} max={max} step={step} 
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer" 
        />
    </div>
);

export const TextEditorPanel: React.FC<Props> = ({ editorRef, selectedObject }) => {
    const [fillType, setFillType] = useState<'solid' | 'gradient'>('solid');
    const [solidColor, setSolidColor] = useState('#ffffff');
    const [gradient, setGradient] = useState({ color1: '#ffffff', color2: '#000000', angle: 0 });
    const [stroke, setStroke] = useState({ color: '#000000', width: 0, onTop: false });
    const [shadow, setShadow] = useState({ color: 'rgba(0,0,0,0.5)', blur: 0, offsetX: 0, offsetY: 0 });

    const updateStateFromObject = useCallback(() => {
        if (!selectedObject) return;
        
        // Fill
        const data = selectedObject.data || {};
        if (data.isGradient) {
            setFillType('gradient');
            setGradient({
                color1: data.gradientColor1 || '#ffffff',
                color2: data.gradientColor2 || '#000000',
                angle: data.gradientAngle || 0
            });
        } else {
            setFillType('solid');
            setSolidColor(selectedObject.fill || '#ffffff');
        }

        // Stroke
        setStroke({
            color: selectedObject.stroke || '#000000',
            width: selectedObject.strokeWidth || 0,
            onTop: selectedObject.paintFirst === 'stroke'
        });

        // Shadow
        const s = selectedObject.shadow;
        if (s) {
            setShadow({ color: s.color || 'rgba(0,0,0,0.5)', blur: s.blur || 0, offsetX: s.offsetX || 0, offsetY: s.offsetY || 0 });
        } else {
            setShadow({ color: 'rgba(0,0,0,0.5)', blur: 0, offsetX: 0, offsetY: 0 });
        }
    }, [selectedObject]);

    useEffect(() => {
        updateStateFromObject();
    }, [selectedObject, updateStateFromObject]);

    const handleSolidColorChange = (color: string) => {
        setSolidColor(color);
        editorRef.current?.updateProperty('fill', color);
        const data = editorRef.current?.getCanvas().getActiveObject().data || {};
        editorRef.current?.updateProperty('data', { ...data, isGradient: false });
    };

    const handleGradientChange = (prop: string, value: any) => {
        const newGradient = { ...gradient, [prop]: value };
        setGradient(newGradient);
        editorRef.current?.applyTextGradient(newGradient.color1, newGradient.color2, newGradient.angle);
    };

    const handleStrokeChange = (prop: string, value: any) => {
        const newStroke = { ...stroke, [prop]: value };
        setStroke(newStroke);
        if (prop === 'onTop') {
            editorRef.current?.updateProperty('paintFirst', value ? 'stroke' : 'fill');
        } else if (prop === 'width') {
             editorRef.current?.updateProperty('strokeWidth', value);
        } else {
             editorRef.current?.updateProperty('stroke', value);
        }
    };
    
    const handleShadowChange = (prop: string, value: any) => {
        const newShadow = { ...shadow, [prop]: value };
        setShadow(newShadow);
        editorRef.current?.updateShadow({ [prop]: value });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">עריכת טקסט מתקדמת</h3>
            
            <Accordion title="מילוי וגרדיאנט">
                <div className="flex bg-black/30 p-1 rounded-lg mb-4">
                    <button onClick={() => setFillType('solid')} className={`flex-1 text-xs py-1 rounded ${fillType === 'solid' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>צבע אחיד</button>
                    <button onClick={() => setFillType('gradient')} className={`flex-1 text-xs py-1 rounded ${fillType === 'gradient' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>גרדיאנט</button>
                </div>
                {fillType === 'solid' ? (
                    <ColorInput label="צבע מילוי" value={solidColor} onChange={handleSolidColorChange} />
                ) : (
                    <div className="space-y-4">
                        <ColorInput label="צבע 1" value={gradient.color1} onChange={c => handleGradientChange('color1', c)} />
                        <ColorInput label="צבע 2" value={gradient.color2} onChange={c => handleGradientChange('color2', c)} />
                        <RangeSlider label="זווית" value={gradient.angle} onChange={v => handleGradientChange('angle', v)} min={0} max={360} step={1} />
                    </div>
                )}
            </Accordion>
            
            <Accordion title="קו מתאר (Stroke)">
                 <ColorInput label="צבע קו" value={stroke.color} onChange={c => handleStrokeChange('color', c)} />
                 <RangeSlider label="עובי" value={stroke.width} onChange={v => handleStrokeChange('width', v)} min={0} max={20} step={0.5} />
                 <div className="flex items-center justify-between mt-2">
                    <label className="text-xs text-slate-400">הצג קו מעל הטקסט</label>
                    <button 
                      onClick={() => handleStrokeChange('onTop', !stroke.onTop)}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors ${stroke.onTop ? 'bg-indigo-600' : 'bg-slate-700'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${stroke.onTop ? 'translate-x-5' : ''}`} />
                    </button>
                 </div>
            </Accordion>

            <Accordion title="צל">
                <ColorInput label="צבע צל" value={shadow.color} onChange={c => handleShadowChange('color', c)} />
                <RangeSlider label="טשטוש" value={shadow.blur} onChange={v => handleShadowChange('blur', v)} min={0} max={50} step={1} />
                <RangeSlider label="היסט X" value={shadow.offsetX} onChange={v => handleShadowChange('offsetX', v)} min={-50} max={50} step={1} />
                <RangeSlider label="היסט Y" value={shadow.offsetY} onChange={v => handleShadowChange('offsetY', v)} min={-50} max={50} step={1} />
            </Accordion>
        </div>
    );
};

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { GeneratedImage, ImageAdjustments, ThumbnailSettings } from '../types';
import { TextTemplate } from '../services/geminiService';

interface Props {
  image?: GeneratedImage;
  settings: ThumbnailSettings;
  adjustments: ImageAdjustments;
  suggestedTemplates?: TextTemplate[];
  isScanning?: boolean;
  onExport: (data: { canvas: any; multiplier: number; name: string }) => void;
  onSelectionChange: (object: any | null) => void;
  initialLayout?: any | null;
}

export interface CanvasEditorHandle {
  addText: (templateStyle?: any) => void;
  addImage: (dataUrl: string) => void;
  deleteSelected: () => void;
  getCanvas: () => any;
  toggleLock: (object: any) => void;
  toggleVisibility: (object: any) => void;
  deleteObject: (object: any) => void;
  moveObjectForward: (object: any) => void;
  moveObjectBackward: (object: any) => void;
  loadFromJSON: (json: any, callback: () => void) => void;
  addSvg: (svgString: string) => void;
  cloneSelected: () => void;
  updateProperty: (prop: string, value: any) => void;
  updateShadow: (props: any) => void;
  transformText: (transform: 'uppercase' | 'lowercase' | 'capitalize') => void;
  applyGradient: (color1: string, color2: string) => void;
  applyTextGradient: (color1: string, color2: string, angle: number) => void;
  alignSelected: (alignment: string) => void;
  applyPresetStyle: (style: any) => void;
  exportToPNG: () => void;
  applyAutoDesign: (elements: any[]) => void;
}

declare const fabric: any;

// --- Custom Delete Control for Fabric.js Objects ---
const deleteIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='11' fill='rgba(40,40,60,0.85)' stroke='%23ffffff' stroke-width='1.5'/%3E%3Cpath d='M16 8L8 16M8 8L16 16' stroke='white' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E";
const deleteImg = document.createElement('img');
deleteImg.src = deleteIcon;

function renderDeleteIcon(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any) {
  const size = this.cornerSize;
  ctx.save();
  ctx.translate(left, top);
  // Do not rotate the delete icon with the object
  // ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
  ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size);
  ctx.restore();
}

function deleteObjectHandler(eventData: MouseEvent, transform: any): boolean {
  const target = transform.target;
  const canvas = target.canvas;
  if (canvas) {
    canvas.remove(target);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }
  return true;
}

fabric.Object.prototype.controls.deleteControl = new fabric.Control({
  x: 0.5,
  y: -0.5,
  offsetY: -14,
  offsetX: 14,
  cursorStyle: 'pointer',
  mouseUpHandler: deleteObjectHandler,
  render: renderDeleteIcon,
  cornerSize: 28,
});
// --- End of Custom Control ---


export const CanvasEditor = forwardRef<CanvasEditorHandle, Props>(({ image, settings, onSelectionChange, initialLayout }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<any>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const initCanvas = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const width = Math.min(containerRef.current.clientWidth, window.innerWidth - 32);
    
    const [aspectW, aspectH] = settings.aspectRatio.split(':').map(Number);
    const height = width * (aspectH / aspectW);

    fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#0a0a0a',
      preserveObjectStacking: true
    });
    
    fabricCanvas.current.on('object:added', (e: any) => {
        if (e.target && !e.target.canvas_id) {
            e.target.canvas_id = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        }
    });

    if (initialLayout) {
        fabricCanvas.current.loadFromJSON(initialLayout, () => {
             fabricCanvas.current.renderAll.bind(fabricCanvas.current)
        });
    } else if (image?.svgContent) {
        fabric.loadSVGFromString(image.svgContent, (objects: any[], options: any) => {
          const obj = fabric.util.groupSVGElements(objects, options);
          const scale = Math.max(width / (obj.width || 1280), height / (obj.height || 720));
          obj.set({
            selectable: false, evented: false, originX: 'center', originY: 'center',
            left: width / 2, top: height / 2, scaleX: scale, scaleY: scale,
            data: { isBackground: true, name: 'Background' }
          });
          fabricCanvas.current.add(obj).sendToBack(obj);
          fabricCanvas.current.renderAll();
        });
    } else if (image?.url) {
        fabric.Image.fromURL(image.url, (img: any) => {
          if (!img) return; // Prevent errors if image fails to load
          const scale = Math.max(width / img.width, height / img.height);
          img.set({
            selectable: false, evented: false, originX: 'center', originY: 'center',
            left: width / 2, top: height / 2, scaleX: scale, scaleY: scale,
            data: { isBackground: true, name: 'Background' }
          });
          fabricCanvas.current.add(img).sendToBack(img);
          fabricCanvas.current.renderAll();
        }, { crossOrigin: 'anonymous' });
    } else {
        const text = new fabric.IText('התחל ליצור כאן...', {
            left: width / 2, top: height / 2, fontFamily: 'Heebo', fontSize: 50,
            fill: '#ffffff', originX: 'center', originY: 'center',
        });
        fabricCanvas.current.add(text);
        fabricCanvas.current.renderAll();
    }

    const handleSelection = (e: any) => {
      const selection = e.selected ? e.selected[0] : e.target;
      setSelectedObject(selection);
      onSelectionChange(selection);
    };

    fabricCanvas.current.on('selection:created', handleSelection);
    fabricCanvas.current.on('selection:updated', handleSelection);
    fabricCanvas.current.on('selection:cleared', () => {
      setSelectedObject(null);
      onSelectionChange(null);
    });
    
    fabricCanvas.current.on('object:modified', (e: any) => {
        if (e.target) {
            onSelectionChange(e.target);
        }
    });

  }, [image, onSelectionChange, settings.aspectRatio, initialLayout]);

  useEffect(() => { 
    if (fabricCanvas.current) {
      fabricCanvas.current.dispose();
    }
    initCanvas();
    return () => {
        if (fabricCanvas.current) {
            fabricCanvas.current.dispose();
        }
    }
  }, [initCanvas]);

  const addText = (templateStyle?: any) => {
    const defaultStyle = {
      left: 100, top: 100, fontFamily: 'Heebo', fontSize: 80, fill: '#ffffff', fontWeight: '900',
      textAlign: 'right', direction: 'rtl',
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.8)', blur: 20, offsetX: 5, offsetY: 5 })
    };
    const finalStyle = { ...defaultStyle, ...templateStyle };
    if (finalStyle.shadow && !(finalStyle.shadow instanceof fabric.Shadow)) {
      finalStyle.shadow = new fabric.Shadow(finalStyle.shadow);
    }
    const text = new fabric.IText('טקסט חדש', finalStyle);
    fabricCanvas.current.add(text).setActiveObject(text).renderAll();
  };

  const addImage = (dataUrl: string) => {
    fabric.Image.fromURL(dataUrl, (img: any) => {
      const scale = 300 / Math.max(img.width, img.height);
      img.set({
        left: 100, top: 100, scaleX: scale, scaleY: scale,
        data: { name: 'תמונה שהועלתה' }
      });
      fabricCanvas.current.add(img).setActiveObject(img).renderAll();
    });
  };
  
  const addSvg = (svgString: string) => {
    fabric.loadSVGFromString(svgString, (objects: any[], options: any) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      const scale = 200 / Math.max(obj.width, obj.height);
      
      obj.getObjects().forEach((o: any) => {
        if (o.fill !== 'none') o.set('fill', '#ffffff');
      });

      obj.set({
        left: 150, top: 150, scaleX: scale, scaleY: scale,
        data: { name: 'אייקון' }
      });
      fabricCanvas.current.add(obj).setActiveObject(obj).renderAll();
    });
  };

  const applyAutoDesign = (elements: any[]) => {
    const canvas = fabricCanvas.current;
    if (!canvas || !elements) return;

    elements.forEach(element => {
        if (element.type === 'text') {
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const fontSize = (element.style.fontSize_percent_of_height / 100) * canvasHeight;

            const text = new fabric.IText(element.content, {
                left: (element.position.x_percent / 100) * canvasWidth,
                top: (element.position.y_percent / 100) * canvasHeight,
                fontSize: fontSize,
                fill: element.style.fill || '#FFFFFF',
                fontFamily: 'Heebo',
                fontWeight: '900',
                stroke: '#000000',
                strokeWidth: fontSize / 20,
                shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.8)', blur: 15, offsetX: 5, offsetY: 5 }),
                originX: 'center',
                originY: 'center',
            });
            canvas.add(text);
        }
    });
    canvas.renderAll();
  };

  const deleteSelected = () => {
    const activeObjects = fabricCanvas.current.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach((obj: any) => fabricCanvas.current.remove(obj));
      fabricCanvas.current.discardActiveObject().renderAll();
    }
  };

  const deleteObject = (obj: any) => {
    if (!obj) return;
    fabricCanvas.current.remove(obj);
    fabricCanvas.current.discardActiveObject().renderAll();
  };
  
  const toggleVisibility = (obj: any) => {
    if (!obj) return;
    obj.set('visible', !obj.visible);
    fabricCanvas.current.renderAll();
  };
  
  const toggleLock = (obj: any) => {
    if (!obj) return;
    const isLocked = !obj.selectable;
    obj.set({ selectable: isLocked, evented: isLocked });
    fabricCanvas.current.renderAll();
  };
  
  const moveObjectForward = (obj: any) => {
    if (!obj) return;
    fabricCanvas.current.bringForward(obj);
    fabricCanvas.current.fire('stack:changed');
  };
  
  const moveObjectBackward = (obj: any) => {
    if (!obj) return;
    const objects = fabricCanvas.current.getObjects();
    const index = objects.indexOf(obj);
    const hasNonBgBehind = objects.slice(0, index).some((o: any) => !o.data?.isBackground);
    if (hasNonBgBehind) {
      fabricCanvas.current.sendBackwards(obj);
      fabricCanvas.current.fire('stack:changed');
    }
  };

  const cloneSelected = () => {
    const activeObject = fabricCanvas.current.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned: any) => {
        fabricCanvas.current.discardActiveObject();
        cloned.set({ left: cloned.left + 20, top: cloned.top + 20, evented: true });
        if (cloned.type === 'activeSelection') {
          cloned.canvas = fabricCanvas.current;
          cloned.forEachObject((obj: any) => fabricCanvas.current.add(obj));
          cloned.setCoords();
        } else {
          fabricCanvas.current.add(cloned);
        }
        fabricCanvas.current.setActiveObject(cloned);
        fabricCanvas.current.requestRenderAll();
      });
    }
  };

  const updateProperty = (prop: string, value: any) => {
    const activeObject = fabricCanvas.current.getActiveObject();
    if (activeObject) {
      activeObject.set(prop, value);
      fabricCanvas.current.renderAll();
    }
  };
  
  const applyPresetStyle = (style: any) => {
    const activeObject = fabricCanvas.current.getActiveObject();
    if (activeObject && activeObject.type.includes('text')) {
        const newStyle = { ...style };
        if (newStyle.shadow && !(newStyle.shadow instanceof fabric.Shadow)) {
            newStyle.shadow = new fabric.Shadow(newStyle.shadow);
        }
        if (newStyle.fill?.type === 'linear') {
             newStyle.fill = new fabric.Gradient({
                ...newStyle.fill,
                coords: { x1: 0, y1: 0, x2: activeObject.width, y2: 0 },
            });
        }
        activeObject.set(newStyle);
        fabricCanvas.current.renderAll();
    }
  };

  const updateShadow = (props: any) => {
    const activeObject = fabricCanvas.current.getActiveObject();
    if (!activeObject) return;
    const currentShadow = activeObject.shadow || { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 };
    const newShadow = new fabric.Shadow({ ...currentShadow, ...props });
    updateProperty('shadow', newShadow);
  };
  
  const transformText = (transform: 'uppercase' | 'lowercase' | 'capitalize') => {
    const activeObject = fabricCanvas.current.getActiveObject();
    if (activeObject && activeObject.type.includes('text')) {
        let newText = activeObject.text;
        switch(transform) {
            case 'uppercase': newText = newText.toUpperCase(); break;
            case 'lowercase': newText = newText.toLowerCase(); break;
        }
        updateProperty('text', newText);
    }
  };
  
  const applyGradient = (color1: string, color2: string) => {
    const activeObject = fabricCanvas.current.getActiveObject();
    if (activeObject && activeObject.type.includes('text')) {
        const gradient = new fabric.Gradient({
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: activeObject.width, y2: 0 },
            colorStops: [{ offset: 0, color: color1 }, { offset: 1, color: color2 }]
        });
        updateProperty('fill', gradient);
    }
  };

  const applyTextGradient = (color1: string, color2: string, angle: number) => {
    const activeObject = fabricCanvas.current.getActiveObject();
    if (!activeObject || !activeObject.type.includes('text')) return;

    const width = activeObject.width;
    const height = activeObject.height;

    const angleRad = ((angle - 90) % 360) * (Math.PI / 180);

    const x = Math.cos(angleRad);
    const y = Math.sin(angleRad);

    const gradient = new fabric.Gradient({
        type: 'linear',
        coords: {
            x1: -width / 2 * x,
            y1: -height / 2 * y,
            x2: width / 2 * x,
            y2: height / 2 * y,
        },
        colorStops: [
            { offset: 0, color: color1 },
            { offset: 1, color: color2 }
        ]
    });
    
    activeObject.set('data', { 
        ...activeObject.data, 
        isGradient: true,
        gradientAngle: angle,
        gradientColor1: color1,
        gradientColor2: color2,
    });
    updateProperty('fill', gradient);
  };

  const alignSelected = (alignment: string) => {
      const activeObject = fabricCanvas.current.getActiveObject();
      const canvasWidth = fabricCanvas.current.width;
      const canvasHeight = fabricCanvas.current.height;
      if (!activeObject) return;
      switch(alignment) {
          case 'left': activeObject.set({ left: 0 }); break;
          case 'center': activeObject.centerH(); break;
          case 'right': activeObject.set({ left: canvasWidth - activeObject.getScaledWidth() }); break;
          case 'top': activeObject.set({ top: 0 }); break;
          case 'middle': activeObject.centerV(); break;
          case 'bottom': activeObject.set({ top: canvasHeight - activeObject.getScaledHeight() }); break;
      }
      activeObject.setCoords();
      fabricCanvas.current.renderAll();
  };

  const exportToPNG = () => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;
  
    const targetWidth = 3840; // 4K width
    const multiplier = targetWidth / canvas.getWidth();
  
    const dataURL = canvas.toDataURL({
      format: 'png',
      multiplier: multiplier,
      quality: 1.0,
    });
  
    const link = document.createElement('a');
    link.download = 'youtube-pro-studio-4k.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // FIX: Defined the `loadFromJSON` function, which was missing from the component's scope but included in the `useImperativeHandle` export. This function wraps the Fabric.js canvas's `loadFromJSON` method.
  const loadFromJSON = (json: any, callback: () => void) => {
    if (fabricCanvas.current) {
        fabricCanvas.current.loadFromJSON(json, callback);
    }
  };

  useImperativeHandle(ref, () => ({
    addText, addImage, deleteSelected, getCanvas: () => fabricCanvas.current,
    loadFromJSON, addSvg, deleteObject, toggleVisibility, toggleLock,
    moveObjectForward, moveObjectBackward, cloneSelected, updateProperty,
    updateShadow, transformText, applyGradient, alignSelected, applyPresetStyle,
    exportToPNG, applyTextGradient, applyAutoDesign
  }));
  
  return (
    <div className="flex flex-col gap-4 w-full h-full relative group/editor">
       <div ref={containerRef} className="flex-1 relative flex items-center justify-center min-h-[400px]">
          <canvas ref={canvasRef} />
       </div>
    </div>
  );
});
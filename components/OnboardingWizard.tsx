import React, { useState, useEffect, useCallback } from 'react';

interface Props {
  onComplete: () => void;
}

interface Step {
  targetId?: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const steps: Step[] = [
  {
    title: 'ברוכים הבאים ל-YouTube Pro Studio!',
    content: 'בוא ניקח 30 שניות כדי להכיר את סביבת העבודה החדשה והמשודרגת שלך.',
    placement: 'bottom',
  },
  {
    targetId: 'control-panel-tour',
    title: 'שלב 1: הגדרות יצירה',
    content: 'בצד שמאל נמצא פאנל היצירה. כאן תגדיר את כל מה שקשור לתמונה הראשונית: פרומפט, סגנון, תמונות אישיות ועוד.',
    placement: 'right',
  },
  {
    targetId: 'generate-button-tour',
    title: 'שלב 2: כפתור היצירה',
    content: 'לאחר שהגדרת הכל, לחץ כאן. ה-AI ייצר עבורך תמונה ויראלית שתופיע במרכז המסך.',
    placement: 'right',
  },
  {
    targetId: 'canvas-editor-tour',
    title: 'שלב 3: אזור העריכה (קנבס)',
    content: 'זהו אזור העבודה המרכזי שלך. כאן תוכל לערוך את התמונה, להוסיף טקסטים, ולהזיז אלמנטים.',
    placement: 'bottom',
  },
  {
    targetId: 'studio-panel-tour',
    title: 'שלב 4: פאנל סטודיו',
    content: 'בצד ימין נמצא פאנל הסטודיו החדש. הוא מרכז את כל כלי העל: כלי AI, עריכה בסיסית, ייצוא, וניהול השכבות.',
    placement: 'left',
  },
  {
    title: 'אתה מוכן!',
    content: 'עכשיו תורך ליצור משהו מדהים. בהצלחה!',
    placement: 'bottom',
  }
];

export const OnboardingWizard: React.FC<Props> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const step = steps[currentStep];

  const updateTargetRect = useCallback(() => {
    if (step.targetId) {
        const element = document.getElementById(step.targetId);
        if (element) {
            setTargetRect(element.getBoundingClientRect());
        }
    } else {
        setTargetRect(null);
    }
  }, [step.targetId]);

  useEffect(() => {
    const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(updateTargetRect, 100);
    return () => clearTimeout(timeoutId);
  }, [currentStep, windowSize, updateTargetRect]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const Tooltip = () => {
    const isMobile = windowSize.width < 768;
    let placement = step.placement;

    if (isMobile && targetRect) {
        if (targetRect.top < windowSize.height / 2) {
            placement = 'bottom';
        } else {
            placement = 'top';
        }
    }

    let style: React.CSSProperties = {
        position: 'fixed',
        transition: 'all 0.3s ease-out',
        zIndex: 1001,
        willChange: 'transform, top, left',
    };

    if (targetRect) {
        switch (placement) {
            case 'top':
                style.top = `${targetRect.top - 16}px`;
                style.left = `${targetRect.left + targetRect.width / 2}px`;
                style.transform = 'translate(-50%, -100%)';
                break;
            case 'bottom':
                style.top = `${targetRect.bottom + 16}px`;
                style.left = `${targetRect.left + targetRect.width / 2}px`;
                style.transform = 'translateX(-50%)';
                break;
            case 'left':
                style.top = `${targetRect.top + targetRect.height / 2}px`;
                style.left = `${targetRect.left - 16}px`;
                style.transform = 'translate(-100%, -50%)';
                break;
            case 'right':
                style.top = `${targetRect.top + targetRect.height / 2}px`;
                style.left = `${targetRect.right + 16}px`;
                style.transform = 'translateY(-50%)';
                break;
        }
    } else {
        style.top = '50%';
        style.left = '50%';
        style.transform = 'translate(-50%, -50%)';
    }

    if (isMobile && !targetRect) {
      style.top = '30%';
    }
    
    return (
      <div style={style} className="w-[90vw] max-w-sm sm:w-80 glass rounded-3xl p-6 sm:p-8 border-2 border-indigo-500/50 shadow-2xl text-right animate-zoom-in">
        <div className="space-y-4">
            <div className="flex justify-between items-baseline">
                <h3 className="text-lg sm:text-xl font-black text-white">{step.title}</h3>
                <span className="text-xs font-bold text-slate-500">{currentStep + 1} / {steps.length}</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{step.content}</p>
            <div className="flex justify-between items-center pt-4">
                <button onClick={onComplete} className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors">דלג</button>
                <div className="flex gap-3">
                    {currentStep > 0 && <button onClick={handlePrev} className="px-5 py-2 bg-white/10 rounded-xl text-[10px] font-bold uppercase">הקודם</button>}
                    <button onClick={handleNext} className="px-6 py-2 bg-indigo-600 rounded-xl text-[10px] font-bold uppercase text-white shadow-lg">
                        {currentStep === steps.length - 1 ? "בוא נתחיל!" : "הבא"}
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  };

  const spotlightStyle: React.CSSProperties = targetRect ? {
      position: 'fixed',
      left: `${targetRect.left - 12}px`,
      top: `${targetRect.top - 12}px`,
      width: `${targetRect.width + 24}px`,
      height: `${targetRect.height + 24}px`,
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
      borderRadius: '2rem',
      zIndex: 1000,
      pointerEvents: 'none',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  } : {};
  
  return (
    <div className="fixed inset-0 z-[999]">
      <div style={spotlightStyle} />
      {!targetRect && <div className="fixed inset-0 bg-black/70 z-[998]" />}
      <Tooltip />
    </div>
  );
};
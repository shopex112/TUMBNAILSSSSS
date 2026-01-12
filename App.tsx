// FIX: Removed `aistudio` from the React import statement. It was causing a syntax error and is not exported from 'react'.
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { CanvasEditor, CanvasEditorHandle } from './components/CanvasEditor';
import { AnalysisResultView } from './components/AnalysisResultView';
import { TitleGeneratorModal } from './components/TitleGeneratorModal';
import { EditingPanel } from './components/EditingPanel';
import { PlatformSelector } from './components/PlatformSelector';
import { GenerationService, TextTemplate } from './services/geminiService';
import { gamificationService } from './services/gamificationService';
import { LoginPortal } from './components/LoginPortal';
import { authService } from './services/authService';
import { projectService } from './services/projectService';
import { ThumbnailSettings, GeneratedImage, AnalysisResult, AspectRatio, GamificationState, Project, User } from './types';
import { GamificationProfile } from './components/GamificationProfile';
import { GamificationModal } from './components/GamificationModal';
import { ToastNotification, ToastInfo } from './components/ToastNotification';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ProjectGalleryModal } from './components/ProjectGalleryModal';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { ConfigErrorScreen } from './components/ConfigErrorScreen';
import { AnalyzeCompetitorModal } from './components/AnalyzeCompetitorModal';
import { AiSuggestions } from './components/AiSuggestions';
import { creditService } from './services/creditService';
import { CreditStoreModal } from './components/CreditStoreModal';

const DEFAULT_THUMBNAIL: GeneratedImage = {
  id: 'default-thumbnail',
  url: '',
  svgContent: `<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="grad-bg" cx="50%" cy="50%" r="70%" fx="50%" fy="50%"><stop offset="0%" stop-color="#4f46e5" stop-opacity="0.6"/><stop offset="100%" stop-color="#05050f"/></radialGradient><linearGradient id="grad-text" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#f43f5e"/></linearGradient><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><filter id="glow"><feGaussianBlur stdDeviation="15" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><clipPath id="avatarClip"><circle cx="250" cy="360" r="150"/></clipPath></defs><rect width="100%" height="100%" fill="url(#grad-bg)"/><rect width="100%" height="100%" filter="url(#noise)" opacity="0.04"/><g clip-path="url(#avatarClip)"><rect x="100" y="210" width="300" height="300" fill="#0c0c1e"/><circle cx="250" cy="360" r="120" fill="#d946ef" filter="url(#glow)" opacity="0.3"/><path d="M150 450 Q 240 300, 350 450" stroke="#f59e0b" stroke-width="15" fill="none" stroke-linecap="round"/><circle cx="210" cy="330" r="15" fill="white"/><circle cx="290" cy="330" r="15" fill="white"/></g><circle cx="250" cy="360" r="150" stroke="#a855f7" stroke-width="8" fill="none" opacity="0.8"/><text x="750" y="300" font-family="Heebo, sans-serif" font-size="100" font-weight="900" fill="url(#grad-text)" text-anchor="middle" stroke="#000" stroke-width="4" stroke-linejoin="round">כותרת ויראלית</text><text x="750" y="420" font-family="Heebo, sans-serif" font-size="70" font-weight="700" fill="#ffffff" text-anchor="middle" style="text-shadow: 0px 0px 15px rgba(217, 70, 239, 0.8);">עם אפקטים מיוחדים</text><path d="M900 100 L 1100 250 L 950 500" stroke="#6366f1" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.5" filter="url(#glow)"/><circle cx="1150" cy="600" r="50" fill="none" stroke="#f59e0b" stroke-width="5" opacity="0.7"/></svg>`,
  timestamp: Date.now()
};


const App: React.FC = () => {
  const [settings, setSettings] = useState<ThumbnailSettings>({
    prompt: '',
    negativePrompt: '',
    aspectRatio: '16:9',
    style: 'cinematic',
    expression: 'natural',
    youTuberStyle: 'custom',
    userPhotos: []
  });

  const [platformSelected, setPlatformSelected] = useState(false);
  const [generationStep, setGenerationStep] = useState<'idle' | 'generating'>('idle');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanningStyles, setIsScanningStyles] = useState(false);
  const [slides, setSlides] = useState<GeneratedImage[]>([DEFAULT_THUMBNAIL]);
  const [view, setView] = useState<'edit' | 'analysis-result'>('edit');
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [suggestedTemplates, setSuggestedTemplates] = useState<TextTemplate[]>([]);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [isCompetitorModalOpen, setIsCompetitorModalOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [selectedObject, setSelectedObject] = useState<any | null>(null);
  const [gamificationState, setGamificationState] = useState<GamificationState>(gamificationService.getState());
  const [isGamificationModalOpen, setIsGamificationModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [socialToasts, setSocialToasts] = useState<ToastInfo[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isAutoDesigning, setIsAutoDesigning] = useState(false);
  
  const editorRef = useRef<CanvasEditorHandle>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const iconUploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!supabase) return; // Guard clause
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && platformSelected && !localStorage.getItem('wizardCompleted')) {
        setShowWizard(true);
    }
  }, [platformSelected, session]);

  const handleWizardComplete = () => {
    localStorage.setItem('wizardCompleted', 'true');
    setShowWizard(false);
  };

  const showToast = useCallback((toast: Omit<ToastInfo, 'id'>) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const handleApiError = useCallback((err: any) => {
    console.error("API Error:", err);
    showToast({ message: "אירעה שגיאת שרת. ייתכן שמכסת ה-API נוצלה.", type: 'info', icon: '🌐' });
  }, [showToast]);

  const showSocialToast = useCallback(() => {
    const names = ['אבי', 'מאיה', 'יוסי', 'דנה', 'איתי', 'שירה', 'דוד', 'נועה'];
    const actions = [
      'יצר/ה תמונה ויראלית!', 'רכש/ה 100 קרדיטים!', 'ניצח/ה באתגר היומי!',
      'ניצל/ה את מחולל הכותרות!', 'שדרג/ה את הפרומפט עם AI!'
    ];
    
    const name = names[Math.floor(Math.random() * names.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const message = `${name} ${action}`;
    const id = Date.now();
    const icon = action.includes('קרדיטים') ? '💎' : action.includes('אתגר') ? '🏆' : '🔥';
  
    setSocialToasts(prev => [{ id, message, type: 'info', icon }, ...prev].slice(0, 5));
    setTimeout(() => {
      setSocialToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      showSocialToast();
    }, Math.random() * 10000 + 7000); // Random interval between 7-17 seconds
    return () => clearInterval(interval);
  }, [showSocialToast]);


  useEffect(() => {
    const handleUpdate = () => setGamificationState(gamificationService.getState());
    const handleShowToast = ((event: CustomEvent) => showToast(event.detail)) as EventListener;
    window.addEventListener('gamification-update', handleUpdate);
    window.addEventListener('show-toast', handleShowToast);
    return () => {
      window.removeEventListener('gamification-update', handleUpdate);
      window.removeEventListener('show-toast', handleShowToast);
    };
  }, [showToast]);
  
  const handleLogout = () => {
    authService.logout();
    setPlatformSelected(false);
    setCurrentProject(null);
  };

  const handlePlatformSelect = (aspectRatio: AspectRatio) => {
    setSettings(prev => ({ ...prev, aspectRatio }));
    setPlatformSelected(true);
  };

  const handleGoHome = () => {
    setPlatformSelected(false);
    setSlides([DEFAULT_THUMBNAIL]);
    setView('edit');
    setAnalysisData(null);
    setCurrentProject(null);
  };
  
  const executeGeneration = useCallback(async (currentSettings: ThumbnailSettings) => {
    setGenerationStep('generating');
    try {
      const image = await GenerationService.generateThumbnail(currentSettings);
      setSlides([image]);
      setView('edit');
      gamificationService.triggerAction('THUMBNAIL_CREATED', { style: currentSettings.style });
      setIsScanningStyles(true);
      const templates = await GenerationService.suggestTextStyles(image.url);
      setSuggestedTemplates(templates);
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setGenerationStep('idle');
      setIsScanningStyles(false);
    }
  }, [handleApiError]);

  const handleGenerate = useCallback(async () => {
    if (!settings.prompt || generationStep !== 'idle') return;
     try {
      creditService.deductCredits(creditService.getCost('generate'));
      await executeGeneration(settings);
    } catch (error: any) {
      showToast({ message: error.message, type: 'info', icon: '💰' });
      setIsCreditModalOpen(true);
    }
  }, [settings, generationStep, executeGeneration, showToast]);
  
  const handleGenerateFromOptimizedPrompt = useCallback(async (optimizedPrompt: string) => {
    const newSettings = { ...settings, prompt: optimizedPrompt };
    setSettings(newSettings);
    try {
      creditService.deductCredits(creditService.getCost('generate'));
      await executeGeneration(newSettings);
    } catch (error: any) {
      showToast({ message: error.message, type: 'info', icon: '💰' });
      setIsCreditModalOpen(true);
    }
  }, [settings, executeGeneration, showToast]);

  const handleAnalyze = useCallback(async () => {
    const canvas = editorRef.current?.getCanvas();
    if (!canvas || isAnalyzing) return;

    try {
      creditService.deductCredits(creditService.getCost('analyze'));
      setIsAnalyzing(true);
      const imageDataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.8 });
      const result = await GenerationService.analyzeThumbnail(imageDataUrl, 'canvas');
      setAnalysisData(result);
      setView('analysis-result');
      if (result.score >= 90) {
        gamificationService.triggerAction('ANALYSIS_HIGH_SCORE');
      }
    } catch (err: any) {
       if (err instanceof Error && err.message.includes('קרדיטים')) {
        showToast({ message: err.message, type: 'info', icon: '💰' });
        setIsCreditModalOpen(true);
      } else {
        handleApiError(err);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, handleApiError, showToast]);

  const handleAnalyzeCompetitor = async (url: string) => {
    setIsCompetitorModalOpen(false);
    try {
      creditService.deductCredits(creditService.getCost('analyze'));
      setIsAnalyzing(true);
      const result = await GenerationService.analyzeYouTubeThumbnail(url);
      setAnalysisData(result);
      setView('analysis-result');
    } catch (err: any) {
      if (err instanceof Error && err.message.includes('קרדיטים')) {
        showToast({ message: err.message, type: 'info', icon: '💰' });
        setIsCreditModalOpen(true);
      } else {
        handleApiError(err);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveProject = async () => {
    const canvas = editorRef.current?.getCanvas();
    if (!canvas || !session?.user || isSavingProject) return;
  
    setIsSavingProject(true);
    try {
      const layout = canvas.toJSON(['data', 'canvas_id']);
      let projectName = currentProject?.name;
  
      // Only prompt for a name if it's a new project
      if (!currentProject) {
        const nameInput = prompt("הזן שם לפרויקט:");
        // If user cancels the prompt, stop the save process
        if (nameInput === null) {
          setIsSavingProject(false);
          return;
        }
        projectName = nameInput || `פרויקט ${new Date().toLocaleDateString()}`;
      }
  
      // Ensure projectName is a non-empty string
      const finalProjectName = projectName || `פרויקט ${new Date().toLocaleDateString()}`;
  
      if (currentProject?.id) {
        const updatedProject = await projectService.updateProject(currentProject.id, finalProjectName, layout);
        setCurrentProject(updatedProject);
        showToast({ message: "הפרויקט עודכן בהצלחה!", type: 'success', icon: '💾' });
      } else {
        const newProject = await projectService.saveProject(session.user.id, finalProjectName, layout);
        setCurrentProject(newProject);
        showToast({ message: "הפרויקט נשמר בהצלחה!", type: 'success', icon: '💾' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "אירעה שגיאה לא צפויה.";
      console.error("Failed to save project:", errorMessage);
      showToast({ message: `שגיאה בשמירת הפרויקט: ${errorMessage}`, type: 'info', icon: '❌' });
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleAutoDesign = async () => {
    const canvas = editorRef.current?.getCanvas();
    if (!canvas || isAutoDesigning || !settings.prompt) {
      if (!settings.prompt) showToast({ message: "יש להזין נושא (פרומפט) לפני עיצוב אוטומטי.", type: 'info', icon: '✏️' });
      return;
    }
  
    setIsAutoDesigning(true);
    try {
      creditService.deductCredits(creditService.getCost('autoDesign'));
      const imageDataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.8 });
      const result = await GenerationService.autoDesignThumbnail(imageDataUrl, settings.prompt);
      if (result && result.elements) {
        editorRef.current?.applyAutoDesign(result.elements);
        showToast({ message: "העיצוב האוטומטי הוחל!", type: 'success', icon: '🎨' });
      } else {
        throw new Error("ה-AI לא החזיר תוצאה תקינה.");
      }
    } catch (err: any) {
      if (err instanceof Error && err.message.includes('קרדיטים')) {
        showToast({ message: err.message, type: 'info', icon: '💰' });
        setIsCreditModalOpen(true);
      } else {
        handleApiError(err);
      }
    } finally {
      setIsAutoDesigning(false);
    }
  };

  const handleLoadProject = (project: Project) => {
    setCurrentProject(project);
    handlePlatformSelect('16:9'); // Or use project's aspect ratio
    setTimeout(() => {
        editorRef.current?.loadFromJSON(project.layout_data, () => {
            editorRef.current?.getCanvas().renderAll();
        });
        showToast({ message: `טוען פרויקט: ${project.name}`, type: 'info', icon: '📂' });
        setView('edit');
        setIsGalleryOpen(false);
    }, 100);
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (ev) => editorRef.current?.addSvg(ev.target?.result as string);
        reader.readAsText(file);
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => editorRef.current?.addImage(ev.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  if (!isSupabaseConfigured) {
    return <ConfigErrorScreen />;
  }

  if (!session) {
    return <LoginPortal />;
  }
  
  if (!platformSelected) {
    return <PlatformSelector onSelect={handlePlatformSelect} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {showWizard && <OnboardingWizard onComplete={handleWizardComplete} />}

      <Header 
        user={session.user}
        onGoHome={handleGoHome} 
        onLogout={handleLogout}
        onSave={handleSaveProject}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenCreditStore={() => setIsCreditModalOpen(true)}
        isSavingProject={isSavingProject}
      />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px]">
        
        <aside id="control-panel-tour" className="lg:col-span-4 flex flex-col">
            <div className="glass rounded-[2.5rem] p-6 h-full flex flex-col shadow-2xl border-white/5 gap-6 overflow-y-auto custom-scrollbar">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-white/5 pb-4 text-right">הגדרות יצירה</h2>
                <ControlPanel settings={settings} setSettings={setSettings} onGenerate={handleGenerate} isLoading={generationStep !== 'idle'} />
            </div>
        </aside>
        
        <div id="canvas-editor-tour" className="lg:col-span-5 flex flex-col gap-6">
          <section className="flex-1 flex flex-col">
              <div className="glass rounded-[3rem] min-h-[600px] flex flex-col items-center justify-center relative shadow-2xl border-white/5 overflow-hidden">
              {generationStep !== 'idle' || isAnalyzing ? (
                  <div className="text-center space-y-8 animate-fade-in">
                      <div className="w-20 h-20 border-b-4 border-indigo-500 rounded-full animate-spin mx-auto"></div>
                      <p className="text-xl font-black text-white">
                      {generationStep === 'generating' && 'יוצר תמונה ויראלית...'}
                      {isAnalyzing && 'מנתח פוטנציאל ויראלי...'}
                      </p>
                  </div>
                  ) : view === 'analysis-result' && analysisData ? (
                  <AnalysisResultView 
                      data={analysisData} 
                      onBack={() => setView('edit')} 
                      onDownload={() => {}}
                      onGenerateOptimized={handleGenerateFromOptimizedPrompt}
                  />
                  ) : (
                  <CanvasEditor 
                      ref={editorRef} 
                      image={slides[0]} 
                      settings={settings} 
                      adjustments={{brightness:0,contrast:0,saturation:0,blur:0,vibrance:0,exposure:0}} 
                      onExport={() => {}} 
                      suggestedTemplates={suggestedTemplates} 
                      isScanning={isScanningStyles}
                      onSelectionChange={setSelectedObject}
                      initialLayout={currentProject?.layout_data}
                  />
                  )}
              </div>
          </section>
          
          <div className="space-y-4">
              <AiSuggestions templates={suggestedTemplates} onApply={(style) => editorRef.current?.addText(style)} />
          </div>
        </div>

        <aside id="studio-panel-tour" className="lg:col-span-3 flex flex-col">
           <EditingPanel 
              editorRef={editorRef} 
              selectedObject={selectedObject}
              onAddText={() => editorRef.current?.addText()}
              onAddImage={() => uploadInputRef.current?.click()}
              onAnalyze={handleAnalyze}
              isLoadingAnalysis={isAnalyzing}
              onOpenTitleGenerator={() => setIsTitleModalOpen(true)}
              onOpenCompetitorAnalyzer={() => setIsCompetitorModalOpen(true)}
              onAddIcon={() => iconUploadInputRef.current?.click()}
              onExport={() => editorRef.current?.exportToPNG()}
              onAutoDesign={handleAutoDesign}
              isAutoDesigning={isAutoDesigning}
           />
        </aside>
      </main>

      <input type="file" ref={uploadInputRef} hidden accept="image/*" onChange={(e) => {
          if (e.target.files?.[0]) {
              const r = new FileReader();
              r.onload = (ev) => editorRef.current?.addImage(ev.target?.result as string);
              r.readAsDataURL(e.target.files[0]);
          }
      }} />
      <input type="file" ref={iconUploadInputRef} hidden accept="image/*,.svg" onChange={handleIconUpload} />
      {isTitleModalOpen && <TitleGeneratorModal onClose={() => setIsTitleModalOpen(false)} onBuyCredits={() => setIsCreditModalOpen(true)} />}
      {isCompetitorModalOpen && <AnalyzeCompetitorModal onClose={() => setIsCompetitorModalOpen(false)} onAnalyze={handleAnalyzeCompetitor} />}
      {isGamificationModalOpen && <GamificationModal state={gamificationService.getState()} onClose={() => setIsGamificationModalOpen(false)} />}
      {isGalleryOpen && <ProjectGalleryModal onClose={() => setIsGalleryOpen(false)} onLoadProject={handleLoadProject} />}
      {isCreditModalOpen && <CreditStoreModal onClose={() => setIsCreditModalOpen(false)} />}
      <ToastNotification toasts={toasts} position="bottom-right" />
      <ToastNotification toasts={socialToasts} position="bottom-left" />
    </div>
  );
};

export default App;
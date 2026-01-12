
import React, { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { Project } from '../types';
import { supabase } from '../services/supabaseClient';

interface Props {
  onClose: () => void;
  onLoadProject: (project: Project) => void;
}

export const ProjectGalleryModal: React.FC<Props> = ({ onClose, onLoadProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");
        
        const userProjects = await projectService.getProjectsForUser(user.id);
        setProjects(userProjects);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch projects.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleDelete = async (projectId: number) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את הפרויקט?")) {
        try {
            await projectService.deleteProject(projectId);
            setProjects(projects.filter(p => p.id !== projectId));
        } catch (err) {
            alert("שגיאה במחיקת הפרויקט.");
        }
    }
  };
  
  return (
    <div className="fixed inset-0 z-[110] glass flex items-center justify-center p-6 backdrop-blur-3xl animate-fade-in">
      <div className="w-full max-w-4xl h-[80vh] bg-slate-950 border border-white/10 rounded-[3rem] p-10 flex flex-col shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors text-2xl">✕</button>
        
        <div className="space-y-2 text-right mb-8">
          <h2 className="text-3xl font-black text-white">הפרויקטים שלי</h2>
          <p className="text-slate-500 text-sm font-bold">טען, ערוך או מחק את העבודות השמורות שלך</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
          {isLoading && <div className="text-center text-slate-400">טוען פרויקטים...</div>}
          {error && <div className="text-center text-red-400">{error}</div>}
          {!isLoading && projects.length === 0 && (
            <div className="text-center text-slate-500 h-full flex flex-col justify-center items-center">
                <span className="text-5xl mb-4">📂</span>
                <p className="font-bold">עדיין אין לך פרויקטים שמורים.</p>
                <p className="text-sm">לחץ על כפתור "שמור" כדי להתחיל.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div key={project.id} className="group relative bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/50 transition-all">
                <div>
                    <h3 className="font-bold text-white truncate">{project.name}</h3>
                    <p className="text-xs text-slate-400">עודכן לאחרונה: {new Date(project.updated_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 mt-4">
                    <button onClick={() => onLoadProject(project)} className="flex-1 py-2 bg-indigo-600 rounded-lg text-xs font-bold text-white">טען</button>
                    <button onClick={() => handleDelete(project.id)} className="py-2 px-3 bg-red-600/20 text-red-400 rounded-lg text-xs font-bold">מחק</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

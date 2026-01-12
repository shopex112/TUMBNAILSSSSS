
import React from 'react';

export const ConfigErrorScreen: React.FC = () => {
  return (
    <div className="min-h-screen glass flex items-center justify-center p-6 animate-fade-in text-right">
      <div className="w-full max-w-2xl bg-slate-950 border border-amber-500/20 rounded-[3rem] p-12 space-y-8 shadow-2xl relative">
        <div className="text-center space-y-3">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-3xl font-black text-amber-400 tracking-tighter uppercase">
            נדרשת הגדרת Supabase
          </h2>
          <p className="text-slate-400 font-bold text-lg">
            נראה שמפתחות ה-API של Supabase עדיין לא הוגדרו.
          </p>
        </div>

        <div className="space-y-4 text-slate-300 bg-black/30 p-6 rounded-2xl border border-white/10">
            <p>כדי להפעיל את האפליקציה, עליך לחבר אותה לפרויקט Supabase שלך:</p>
            <ol className="list-decimal list-inside space-y-2 font-mono text-sm">
                <li>פתח את הקובץ: <code className="bg-slate-800 text-amber-300 px-2 py-1 rounded">services/supabaseClient.ts</code></li>
                <li>הדבק את ה-URL וה-Public Anon Key של פרויקט ה-Supabase שלך במשתנים המתאימים.</li>
                <li>שמור את הקובץ ורענן את הדף.</li>
            </ol>
            <p className="pt-2 text-xs text-slate-500">
                תוכל למצוא את המפתחות שלך בלוח הבקרה של Supabase תחת <br />
                <code className="text-xs">Project Settings &gt; API</code>.
            </p>
        </div>

        <div className="text-center text-xs text-slate-600 font-bold">
            אם עדיין לא יצרת פרויקט, תוכל לעשות זאת בחינם באתר <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">supabase.com</a>.
        </div>
      </div>
    </div>
  );
};

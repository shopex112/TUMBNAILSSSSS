
import React, { useState } from 'react';
import { authService } from '../services/authService';

export const LoginPortal: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [canResend, setCanResend] = useState(false);

  const resetFormState = () => {
    setError(null);
    setCanResend(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();
    setIsLoading(true);
    setShowConfirmationMessage(false);
    
    try {
      if (isLoginMode) {
        await authService.login(email, password);
      } else {
        await authService.register(email, password);
        setShowConfirmationMessage(true);
      }
    } catch (err: any) {
      if (err.message === 'Invalid login credentials') {
        setError('פרטי ההתחברות שגויים. ייתכן שהסיסמה שגויה, או שעדיין לא אישרת את חשבונך במייל.');
        setCanResend(true);
      } else if (err.message?.includes('User already registered')) {
        setError('כתובת המייל הזו כבר רשומה. נסה להתחבר או לאפס סיסמה.');
        setIsLoginMode(true);
      } else {
        setError(err.message || 'אירעה שגיאה לא צפויה.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
        setError("אנא הזן את כתובת המייל שלך כדי לשלוח שוב.");
        return;
    }
    resetFormState();
    setIsLoading(true);
    try {
        await authService.resendConfirmation(email);
        setShowConfirmationMessage(true);
    } catch (err: any) {
        setError(err.message || "שגיאה בשליחת מייל אישור מחדש.");
    } finally {
        setIsLoading(false);
    }
  };
  
  if (showConfirmationMessage) {
    return (
      <div className="min-h-screen glass flex items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-lg bg-slate-950 border border-emerald-500/20 rounded-[3rem] p-12 space-y-6 shadow-2xl text-center">
          <div className="text-5xl">📧</div>
          <h2 className="text-3xl font-black text-white tracking-tighter">כמעט סיימנו...</h2>
          <p className="text-slate-300 font-bold text-lg">
            שלחנו לך מייל אישור לכתובת <span className="font-mono text-indigo-400">{email}</span>.
          </p>
          <p className="text-slate-400">
            יש ללחוץ על הקישור במייל כדי להפעיל את חשבונך. לאחר מכן, תוכל לחזור לכאן ולהתחבר.
          </p>
          <button 
            onClick={() => {
              setShowConfirmationMessage(false);
              setIsLoginMode(true);
            }}
            className="w-full py-4 bg-indigo-600 rounded-2xl text-xs font-black uppercase text-white shadow-xl hover:scale-[1.02] transition-all"
          >
            חזרה למסך ההתחברות
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass flex items-center justify-center p-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-slate-950 border border-white/10 rounded-[3rem] p-12 space-y-8 shadow-2xl relative text-right">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
            {isLoginMode ? 'ברוכים השבים' : 'יצירת חשבון'}
          </h2>
          <p className="text-slate-500 font-bold text-sm">
            {isLoginMode ? 'התחבר כדי להמשיך ל-Pro Studio' : 'הצטרף וקבל גישה לכלי ה-AI המתקדמים ביותר'}
          </p>
        </div>
        
        <div className="space-y-4">
          <input 
            type="email" 
            value={email}
            onChange={(e) => { setEmail(e.target.value); resetFormState(); }}
            disabled={isLoading}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-lg outline-none focus:border-indigo-500 transition-colors disabled:opacity-50 text-right" 
            placeholder="כתובת מייל" 
            required
          />
          <input 
            type="password" 
            value={password}
            onChange={(e) => { setPassword(e.target.value); resetFormState(); }}
            disabled={isLoading}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-lg outline-none focus:border-indigo-500 transition-colors disabled:opacity-50 text-right" 
            placeholder="סיסמה" 
            required
          />
          {error && (
            <div className="text-center pt-1">
                <p className="text-red-400 text-xs font-bold">{error}</p>
                {canResend && (
                    <button
                        type="button"
                        onClick={handleResendConfirmation}
                        disabled={isLoading}
                        className="mt-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors disabled:opacity-50"
                    >
                        שלח שוב מייל אישור
                    </button>
                )}
            </div>
          )}
        </div>

        <button 
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full py-5 bg-indigo-600 rounded-2xl text-[11px] font-black uppercase text-white shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
              <span>מעבד...</span>
            </>
          ) : (
            isLoginMode ? 'התחבר 🚀' : 'הירשם והתחבר'
          )}
        </button>
        
        <button 
          type="button"
          onClick={() => { setIsLoginMode(!isLoginMode); resetFormState(); }}
          className="w-full text-center text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors"
        >
          {isLoginMode ? 'אין לך חשבון? הירשם כאן' : 'יש לך כבר חשבון? התחבר'}
        </button>
      </form>
    </div>
  );
};
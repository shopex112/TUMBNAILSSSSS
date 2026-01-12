
import React from 'react';

export interface ToastInfo {
  id: number;
  message: string;
  type: 'success' | 'info';
  icon: string;
}

interface Props {
  toasts: ToastInfo[];
  position?: 'bottom-right' | 'bottom-left';
}

export const ToastNotification: React.FC<Props> = ({ toasts, position = 'bottom-right' }) => {
  const positionClasses = {
    'bottom-right': 'bottom-5 right-5 items-end',
    'bottom-left': 'bottom-5 left-5 items-start',
  };

  const animationClass = position === 'bottom-left' ? 'animate-slide-in-bottom' : 'animate-slide-in-right';

  return (
    <div className={`fixed z-[200] flex flex-col gap-3 ${positionClasses[position]}`}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`glass rounded-2xl p-4 flex items-center gap-4 border border-white/10 shadow-lg ${animationClass}`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${toast.type === 'success' ? 'bg-emerald-500/20' : 'bg-indigo-500/20'}`}>
            {toast.icon}
          </div>
          <p className="text-sm font-bold text-white pr-2">{toast.message}</p>
        </div>
      ))}
    </div>
  );
};

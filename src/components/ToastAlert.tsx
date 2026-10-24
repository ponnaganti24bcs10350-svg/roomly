import React, { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, X, CheckCircle, Calendar, MessageSquare } from 'lucide-react';

export const ToastAlert: React.FC = () => {
  const { toast, dismissToast } = useSocket();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dismissToast();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toast, dismissToast]);

  if (!toast) return null;

  const getIcon = () => {
    if (toast.type === 'NEW_MESSAGE') return <MessageSquare className="w-5 h-5 text-sky-500" />;
    if (toast.type === 'VISIT' || toast.type.includes('VISIT')) return <Calendar className="w-5 h-5 text-emerald-500" />;
    return <Bell className="w-5 h-5 text-brand-500" />;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="text-xs font-bold text-slate-100">{toast.title}</h5>
          <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{toast.message}</p>
        </div>
        <button
          onClick={dismissToast}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

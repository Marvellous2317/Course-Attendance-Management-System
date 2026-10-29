import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../store/toastStore';

function ToastItem({ toast, onDismiss }) {
  const { id, message, type, duration } = toast;

  useEffect(() => {
    if (!duration || duration <= 0) return undefined;
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.05 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="pointer-events-auto flex items-start justify-between p-3.5 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-xl border border-slate-800 text-sm gap-3"
      role="status"
    >
      <div className="flex items-start gap-2.5 min-w-0">
        {type === 'success' && (
          <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
        )}
        {type === 'error' && (
          <AlertCircle className="w-4 h-4 mt-0.5 text-rose-400 shrink-0" />
        )}
        {type === 'info' && (
          <Info className="w-4 h-4 mt-0.5 text-blue-400 shrink-0" />
        )}
        {type === 'warning' && (
          <AlertCircle className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
        )}
        <span className="font-medium text-slate-100 break-words min-w-0">
          {message}
        </span>
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="text-slate-400 hover:text-white p-1 -m-1 rounded-md transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();
  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-5 sm:bottom-5 z-[60] flex flex-col gap-2 pointer-events-none sm:max-w-sm sm:w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

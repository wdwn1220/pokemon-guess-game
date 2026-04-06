import { useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: ToastMessage['type'] = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

export default function ToastContainer({ toasts, removeToast }: { toasts: ToastMessage[], removeToast: (id: string) => void }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type || 'info'}`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
}

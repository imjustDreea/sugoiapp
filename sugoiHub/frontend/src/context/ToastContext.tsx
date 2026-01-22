import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type ToastTone = 'success' | 'error' | 'info';

type ToastState = {
  id: number;
  message: string;
  tone: ToastTone;
} | null;

type ToastContextType = {
  showToast: (message: string, tone?: ToastTone) => void;
  clearToast: () => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const timerRef = useRef<number | null>(null);
  const nextId = useRef(1);

  const clearToast = useCallback(() => {
    setToast(null);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = nextId.current++;
    setToast({ id, message, tone });

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setToast((curr) => (curr && curr.id === id ? null : curr));
      timerRef.current = null;
    }, 2200);
  }, []);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const dotClass =
    toast?.tone === 'success'
      ? 'bg-accentLime'
      : toast?.tone === 'error'
        ? 'bg-accentViolet'
        : 'bg-accentViolet';

  return (
    <ToastContext.Provider value={{ showToast, clearToast }}>
      {children}

      {/* Toast minimal (evita window.alert de Chrome) */}
      {toast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-100 max-w-[92vw] sm:max-w-md"
          role="status"
          aria-live="polite"
          onClick={clearToast}
        >
          <div className="bg-panel border border-grid shadow-card rounded-xl px-4 py-3 text-sm text-white flex items-start gap-3 cursor-pointer">
            <span className={`mt-2 w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
            <div className="min-w-0">
              <div className="font-semibold">{toast.message}</div>
              <div className="text-xs text-muted-dim">Toca para cerrar</div>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}

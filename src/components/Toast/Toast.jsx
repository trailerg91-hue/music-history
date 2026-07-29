import { createContext, useCallback, useContext, useState, useRef } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 10000,
        display: 'flex', flexDirection: 'column-reverse', gap: 10,
        pointerEvents: 'none',
      }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            onClick={() => dismiss(t.id)}
            style={{
              pointerEvents: 'auto',
              cursor: 'pointer',
              padding: '12px 20px',
              borderRadius: 14,
              background: t.type === 'error' ? 'rgba(185,28,28,0.92)' : 'rgba(21,128,61,0.92)',
              border: `1px solid ${t.type === 'error' ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.5)'}`,
              color: '#fff',
              fontSize: '0.92rem',
              fontWeight: 500,
              fontFamily: "'Fira GO', sans-serif",
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
              animation: 'toastSlideIn 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              maxWidth: 360,
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{t.type === 'error' ? '✗' : '✓'}</span>
            {t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes toastSlideIn { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </ToastContext.Provider>
  );
}

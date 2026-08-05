import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      style={{
        position: 'fixed',
        bottom: isMobile ? 'calc(104px + env(safe-area-inset-bottom, 0px))' : 90,
        right: isMobile ? 16 : 24,
        zIndex: 900,
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '1px solid rgba(245,158,11,0.35)',
        background: 'rgba(14,14,14,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: '#f59e0b',
        fontSize: '1.3rem',
        cursor: 'pointer',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 0 12px rgba(245,158,11,0.1)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        animation: 'backToTopFadeIn 0.3s ease',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
      <style>{`@keyframes backToTopFadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </button>
  );
}

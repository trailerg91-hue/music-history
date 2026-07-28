import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const Ctx = createContext(null);

export function AudioSessionProvider({ children }) {
  const [session, setSession] = useState(null);

  const report = useCallback((next) => {
    if (!next) return setSession(null);
    setSession((prev) => {
      if (next.playing === false) return prev?.id === next.id ? { ...prev, playing: false } : prev;
      return { ...prev, ...next };
    });
  }, []);

  const value = useMemo(() => ({ session, report }), [session, report]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAudioSession = () => useContext(Ctx);

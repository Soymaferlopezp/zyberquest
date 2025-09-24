'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AudioCtx = {
  muted: boolean;
  toggle: () => void;
  setMuted: (v: boolean) => void;
};

const Ctx = createContext<AudioCtx | null>(null);
const STORAGE_KEY = 'zq-muted';

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState<boolean>(true);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) setMuted(raw === '1');
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    } catch {}
  }, [muted]);

  const value = useMemo<AudioCtx>(
    () => ({
      muted,
      toggle: () => setMuted((m) => !m),
      setMuted,
    }),
    [muted]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAudio must be used within <AudioProvider>');
  return ctx;
}

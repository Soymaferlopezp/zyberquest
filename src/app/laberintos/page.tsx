'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const zx = {
  green: '#00FF9C',
  cyan: '#00E5FF',
  yellow: '#F4B728',
  ink: '#0A0D0A',
};

export default function LaberintosIntroPage() {
  const router = useRouter();
  const started = useRef(false);

  const startNow = () => {
    if (started.current) return;
    started.current = true;
    router.replace('/laberintos/play');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startNow(); }
      else if (e.key === 'Escape') router.replace('/menu');
    };
    window.addEventListener('keydown', onKey, { passive: false });
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation(); startNow();
  };

  return (
    <main className="container-zx relative py-16 md:py-20" aria-labelledby="laberintos-title">
      {/* scanline leve */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-screen"
        style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize:'100% 3px' }} />

      <header className="mb-10 flex items-start justify-between gap-4">
        <h1 id="laberintos-title" className="font-mono text-3xl md:text-5xl font-semibold"
          style={{ color: zx.green, textShadow: `0 0 12px ${zx.green}55` }}>
          Mission: Explore the Privacy Labyrinth
        </h1>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-[minmax(320px,1fr)_minmax(540px,640px)_minmax(320px,1fr)] items-start gap-6 md:gap-10">
        {/* Personaje izquierda */}
        <div className="hidden md:flex justify-start">
          <motion.img
            src="/laberintos/char-m.png"
            alt=""
            width={380}
            height={560}
            className="select-none"
            style={{ filter: `drop-shadow(0 0 8px ${zx.yellow}40) saturate(1.1)` }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          />
        </div>

        {/* Panel central */}
        <motion.div
          className="rounded-2xl p-6 md:p-8 border"
          style={{
            borderColor: '#123a2a',
            background:'linear-gradient(180deg, rgba(0,229,255,0.06), rgba(10,13,10,0.6))',
            boxShadow: `0 0 0 1px #0c2, inset 0 0 80px #00ff9c0f`,
          }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
          role="region" aria-label="Instrucciones del modo Laberintos">
          <ul className="space-y-2 text-base md:text-lg leading-relaxed">
            <li>• <b>Learn</b> by activating <b>cyan nodes</b> with <kbd>E</kbd>: you will read <b>short</b> summaries about privacy and Zcash.</li>
            <li>• <b>Progress</b> by collecting <b>3 keys</b> to open the upper door and reach the <b>cyan ring</b> (exit).</li>
            <li>• <b>Explore</b> the <b>portal</b> (large cyan circle): solve a Caesar cipher to earn bonuses.</li>
            <li>• Avoid lasers and drones. Time is running out...</li>
          </ul>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Hint label="Move" value="W A S D / Arrows" />
            <Hint label="Interact" value="E (open/close node)" />
            <Hint label="Dash" value="Space" />
            <Hint label="Pause" value="P" />
            <Hint label="Audio" value="M (mute/unmute)" />
            <Hint label="Exit" value="Esc" />
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button
              type="button"
              onPointerDown={handlePointerDown}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); startNow(); }}
              className="rounded-2xl px-6 py-3 text-base md:text-lg font-semibold focus-visible:outline-none"
              style={{ color: '#111', backgroundColor: zx.yellow, boxShadow: `0 0 16px ${zx.yellow}66` }}
              aria-label="Comenzar Laberinto">
              PLAY
            </button>
            <p className="text-sm opacity-80">
              Shortcuts: <kbd className="px-1">Enter</kbd> o <kbd className="px-1">Space</kbd>
            </p>
          </div>
        </motion.div>

        {/* Personaje derecha */}
        <div className="hidden md:flex justify-end">
          <motion.img
            src="/laberintos/char-f.png"
            alt=""
            width={380}
            height={560}
            className="select-none"
            style={{ filter: `drop-shadow(0 0 8px ${zx.yellow}40) saturate(1.1)` }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          />
        </div>
      </section>
    </main>
  );
}

function Hint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border px-4 py-3 text-sm"
      style={{ borderColor: '#0b3f36', backgroundColor: 'rgba(0,229,255,0.05)' }}>
      <div className="opacity-70">{label.toUpperCase()}</div>
      <div className="font-semibold" style={{ color: '#E6FFE6' }}>{value}</div>
    </div>
  );
}

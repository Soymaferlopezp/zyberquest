'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const ZX = {
  green: '#00FF9C',
  cyan: '#00E5FF',
  yellow: '#F4B728',
};

export default function LaberintosIntroPage() {
  const router = useRouter();

  // Atajos de teclado: T (tutorial), M (misión), Esc (menú)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 't') router.replace('/laberintos/play?mode=tutorial');
      if (k === 'm') router.replace('/laberintos/play?mode=mission');
      if (e.key === 'Escape') router.replace('/menu');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  return (
    <main className="container-zx relative py-14 md:py-18" aria-labelledby="laberintos-title">
      {/* scanline leve */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-screen"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '100% 3px',
        }}
      />

      <header className="mb-8 md:mb-10 flex items-start justify-between gap-4">
        <h1
          id="laberintos-title"
          className="font-mono text-3xl md:text-5xl font-semibold"
          style={{ color: ZX.green, textShadow: `0 0 12px ${ZX.green}55` }}
        >
          Mission: Explore the Privacy Maze
        </h1>
      </header>

      {/* Selección de modo */}
      <section className="grid grid-cols-1 md:grid-cols-[minmax(320px,1fr)_minmax(540px,640px)_minmax(320px,1fr)] items-start gap-8">
        {/* Personaje izquierda */}
        <div className="hidden md:flex justify-start md:-ml-6">
          <motion.img
            src="/laberintos/char-m.png"
            alt=""
            className="select-none w-[300px] md:w-[360px] lg:w-[420px] xl:w-[460px]"
            style={{ filter: `drop-shadow(0 0 8px ${ZX.yellow}66) saturate(1.1)` }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          />
        </div>

        {/* Panel central */}
        <motion.div
          className="rounded-2xl p-6 md:p-8 border mx-auto w-full max-w-[640px]"
          style={{
            borderColor: '#123a2a',
            background: 'linear-gradient(180deg, rgba(0,229,255,0.06), rgba(10,13,10,0.6))',
            boxShadow: `0 0 0 1px #0c2, inset 0 0 80px #00ff9c0f`,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          role="region"
          aria-label="Mode selection"
        >
          <p className="text-base md:text-lg leading-relaxed text-zinc-100">
            Select how you want to start:
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModeCard
              title="Tutorial"
              desc="Learn the basics: take a key, open a door, and test the encrypted portal."
              onClick={() => router.replace('/laberintos/play?mode=tutorial')}
              hotkey="T"
            />
            <ModeCard
              title="Mission"
              desc="Play the entire maze with keys, nodes, portals, traps, and an exit."
              onClick={() => router.replace('/laberintos/play?mode=mission')}
              hotkey="M"
            />
          </div>

          <p className="mt-6 text-sm opacity-80">
            Shortcuts: <kbd className="px-1">T</kbd> Tutorial • <kbd className="px-1">M</kbd> Mission •{' '}
            <kbd className="px-1">Esc</kbd> Menu
          </p>
        </motion.div>

        {/* Personaje derecha */}
        <div className="hidden md:flex justify-end md:-mr-6">
          <motion.img
            src="/laberintos/char-f.png"
            alt=""
            className="select-none w-[300px] md:w-[360px] lg:w-[420px] xl:w-[460px]"
            style={{ filter: `drop-shadow(0 0 8px ${ZX.yellow}66) saturate(1.1)` }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          />
        </div>
      </section>

      {/* Cápsula educativa: Cifrado César */}
      <CaesarCapsule />
    </main>
  );
}

/* ---------- Subcomponentes ---------- */

function ModeCard({
  title,
  desc,
  onClick,
  hotkey,
}: {
  title: string;
  desc: string;
  onClick: () => void;
  hotkey: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-2xl border px-5 py-5 focus-visible:outline-none transition-shadow hover:shadow-[0_0_0_2px_#F4B72855]"
      style={{ borderColor: '#0b3f36', backgroundColor: 'rgba(0,229,255,0.05)' }}
      aria-label={title}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-zinc-50">{title}</h3>
        <span className="rounded-md border px-2 py-0.5 text-xs opacity-80" style={{ borderColor: '#164f46' }}>
          Shortcuts: {hotkey}
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-200/90">{desc}</p>
    </button>
  );
}

function CaesarCapsule() {
  const [text, setText] = useState('ENCRYPTION');
  const [shift, setShift] = useState(3);

  const encoded = useMemo(() => caesar(text, shift), [text, shift]);

  return (
    <section
      aria-labelledby="capsula-cesar-title"
      className="mt-12 md:mt-16 rounded-2xl border p-5 md:p-6"
      style={{
        borderColor: '#0b3f36',
        background: 'linear-gradient(180deg, rgba(0,229,255,0.05), rgba(10,13,10,0.6))',
        boxShadow: 'inset 0 0 64px rgba(0,229,255,0.06)',
      }}
    >
      <motion.h2
        id="capsula-cesar-title"
        className="font-mono text-xl md:text-2xl font-semibold"
        style={{ color: ZX.green, textShadow: '0 0 8px #00FF9C55' }}
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.25 }}
      >
        Zcash Educational Capsule — Caesar Cipher
      </motion.h2>

      <p className="mt-2 text-sm md:text-base text-zinc-200/90">
        It is a <em>substitution cipher</em>: it shifts each letter of the alphabet a fixed number of
        positions. E.g.: with a shift of 3, <kbd>A→D</kbd>, <kbd>B→E</kbd>... It is simple and not secure today, but it helps
        to understand the idea of “transforming” a message. In ZyberQuest, the portals use a Caesar-type variant to
        practice the mechanics of decryption. Note: Zcash does not use Caesar; it uses modern cryptography
        (zk-SNARKs) for real privacy.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
        <div>
          <label htmlFor="cesar-text" className="block text-sm text-zinc-300">
            Original text
          </label>
          <input
            id="cesar-text"
            type="text"
            className="mt-1 w-full rounded-md border bg-black/40 px-3 py-2 outline-none"
            style={{ borderColor: '#123a2a' }}
            value={text}
            onChange={(e) => setText(e.target.value.toUpperCase())}
            placeholder="WRITE HERE"
            aria-describedby="cesar-help"
          />
          <p id="cesar-help" className="mt-1 text-xs text-zinc-400">
            Only letters A–Z; other characters remain unchanged.
          </p>
        </div>

        <div className="md:text-center">
          <label htmlFor="cesar-shift" className="block text-sm text-zinc-300">
            Displacement
          </label>
          <input
            id="cesar-shift"
            type="range"
            min={-13}
            max={13}
            step={1}
            value={shift}
            onChange={(e) => setShift(parseInt(e.target.value, 10))}
            className="mt-3 w-full md:w-40"
            aria-valuemin={-13}
            aria-valuemax={13}
            aria-valuenow={shift}
          />
          <div className="mt-1 text-xs">
            <span className="rounded border px-2 py-0.5" style={{ borderColor: '#164f46' }}>
              Shift: {shift >= 0 ? `+${shift}` : shift}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="cesar-encoded" className="block text-sm text-zinc-300">
            Encrypted text
          </label>
          <output
            id="cesar-encoded"
            className="mt-1 block w-full rounded-md border bg-black/40 px-3 py-2"
            style={{ borderColor: '#123a2a', color: ZX.yellow }}
          >
            {encoded}
          </output>
        </div>
      </div>

      <div className="mt-4 text-xs text-zinc-400">
        Tip: to decrypt, use reverse displacement (if you encrypted with +3, decrypt with −3).
      </div>
    </section>
  );
}

    /* Utilidad: Cifrado César (A–Z, mantiene otros caracteres) */
    function caesar(input: string, shift: number) {
      const A = 'A'.charCodeAt(0);
      const Z = 'Z'.charCodeAt(0);
      const wrap = (code: number) => {
        const n = ((code - A + shift) % 26 + 26) % 26;
        return String.fromCharCode(A + n);
      };
      let out = '';
      for (const ch of input) {
        const c = ch.charCodeAt(0);
        if (c >= A && c <= Z) out += wrap(c);
        else out += ch;
      }
      return out;
    }

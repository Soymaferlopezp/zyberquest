'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import Logo from '@/components/Intro/Logo';
import CodeRain from '@/components/Intro/CodeRain';
import Typewriter from '@/components/Intro/Typewriter';
import PlayButton from '@/components/Intro/PlayButton';
import ControlsHint from '@/components/Intro/ControlsHint';
import { AudioProvider, useAudio } from '@/components/Intro/audio';
import useIntroShortcuts from '@/components/Intro/useIntroShortcuts';

const introLines = [
  'Establishing connection with Zcash…',
  'Authenticating Runner…',
  'Access granted!',
  'Your mission: Connect nodes. Learn. Break codes. Master the maze..',
];

export default function IntroPage() {
  return (
    <AudioProvider>
      <IntroBody />
    </AudioProvider>
  );
}

function IntroBody() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { startAudio } = useAudio();

  const [canPlay, setCanPlay] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Watchdog
  useEffect(() => {
    const t = window.setTimeout(() => setCanPlay(true), 12000);
    return () => window.clearTimeout(t);
  }, []);

  const handleDoneTyping = () => setCanPlay(true);

  const goMenu = () => {
    if (exiting) return;
    setExiting(true);
    const delay = reduce ? 50 : 550;
    window.setTimeout(() => router.push('/menu'), delay);
  };

  const onPlay = async () => {
    await startAudio();
    if (!canPlay) setCanPlay(true);
    goMenu();
  };

  const onSkip = async () => {
    await startAudio();
    setCanPlay(true);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid="zq-play"]');
    btn?.focus();
  };

  useIntroShortcuts({ onPlay, onSkip });

  return (
    <main className="relative min-h-dvh bg-black overflow-hidden">
      <CodeRain className="z-0" density={0.6} speed={exiting ? 1.8 : 1.0} />

      {/* Main content */}
      <AnimatePresence mode="wait">
        {!exiting && (
          <motion.section
            key="intro-content"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? {} : { opacity: 0, y: -12, scale: 1.02 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="relative z-10 flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center"
          >
            <Logo glow />

            <Typewriter
              lines={introLines}
              charSpeedMs={18}
              lineDelayMs={350}
              onDone={handleDoneTyping}
            />

            <AnimatePresence>
              {canPlay && (
                <motion.div
                  key="play-wrap"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                >
                  <PlayButton className="mt-2" onClick={onPlay} />
                </motion.div>
              )}
            </AnimatePresence>

            <ControlsHint className="mt-8" />
            <small className="mt-3 text-[12px] text-neutral-300 font-['Inter',sans-serif]">
              Educational demo to learn about the Zcash ecosystem
            </small>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Saltar intro (chip) en esquina inferior derecha */}
      <button
        type="button"
        onClick={onSkip}
        className="fixed bottom-4 right-4 z-20 rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-xs text-neutral-100 hover:bg-black/65 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]"
        aria-label="Saltar intro"
      >
        Skip intro (Esc)
      </button>

      {/* Mute chip (visual, recuerda que M alterna) */}
      <div
        className="fixed bottom-4 left-4 z-20 rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-xs text-neutral-100"
        aria-hidden
      >
        Sound: <span className="opacity-70">M to alternate</span>
      </div>
    </main>
  );
}

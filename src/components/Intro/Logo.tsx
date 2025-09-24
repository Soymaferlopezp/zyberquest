'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { LogoProps } from './types';

export default function Logo({
  text = 'ZyberQuest',
  glow = true,
  accent = 'green',
  className = '',
}: LogoProps) {
  const reduce = useReducedMotion();

  const accentHex =
    accent === 'green' ? '#00FF9C' :
    accent === 'cyan' ? '#00E5FF' :
    accent === 'magenta' ? '#FF3DBE' : '#FFFFFF';

  const glowShadow = glow && !reduce
    ? `drop-shadow(0 0 18px ${accentHex}88) drop-shadow(0 0 42px ${accentHex}44)`
    : 'none';

  return (
    <motion.h1
      data-testid="zq-logo"
      className={`font-['IBM_Plex_Mono',monospace] tracking-[0.08em] text-4xl md:text-6xl ${className}`}
      style={{
        color: accentHex,
        filter: glowShadow as any,
        textShadow: glow && !reduce ? `0 0 6px ${accentHex}55` : undefined,
      }}
      aria-label={text}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <motion.span
        initial={false}
        animate={reduce ? {} : { textShadow: [`0 0 6px ${accentHex}55`, `0 0 16px ${accentHex}AA`, `0 0 6px ${accentHex}55`] }}
        transition={reduce ? undefined : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {text}
      </motion.span>
      {/* Scanline overlay sutil (solo visual) */}
      {!reduce && (
        <span
          aria-hidden="true"
          className="relative block"
          style={{
            maskImage: 'linear-gradient(transparent 0%, black 15%, black 85%, transparent 100%)',
          }}
        />
      )}
    </motion.h1>
  );
}

'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

type ModeAccentName = 'green' | 'cyan' | 'magenta';
type ModeAccent = ModeAccentName | `#${string}`;

export type ModeCardProps = {
  title: string;
  href: string;
  desc: string;
  accent: ModeAccent;      // 'green' | 'cyan' | 'magenta' o un hex (#00E5FF)
  disabled?: boolean;
  className?: string;
  ctaLabel?: string;       // por defecto: "Entrar"
  hint?: string;           // tooltip nativo: "Tab/Shift+Tab • Enter • 1/2/3"
  onActivate?: () => void; // permite animar salida antes de navegar
};

// Tokens → hex
const ACCENTS: Record<ModeAccentName, `#${string}`> = {
  green: '#00FF9C',
  cyan:  '#00E5FF',
  magenta: '#FF3DBE',
};

function resolveAccent(accent: ModeAccent): `#${string}` {
  if (accent in ACCENTS) return ACCENTS[accent as ModeAccentName];
  return accent as `#${string}`;
}

export default function ModeCard({
  title,
  href,
  desc,
  accent,
  disabled = false,
  className = '',
  ctaLabel = 'Entrar',
  hint = 'Tab/Shift+Tab • Enter • 1/2/3',
  onActivate,
}: ModeCardProps) {
  const accentColor = resolveAccent(accent);
  const reduceMotion = useReducedMotion();

  const baseId = title.replace(/\s+/g, '-').toLowerCase();
  const titleId = `${baseId}-title`;
  const descId  = `${baseId}-desc`;

  const content = (
    <motion.div
      initial={false}
      whileHover={
        disabled || reduceMotion
          ? undefined
          : { scale: 1.02, boxShadow: '0 0 0 1px rgba(255,255,255,0.03)' }
      }
      whileTap={disabled || reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={[
        'rounded-2xl border bg-white/[0.02] p-5',
        'border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]',
        'focus-visible:outline-none focus-visible:ring-2',
        'will-change-transform',
        disabled ? 'opacity-60' : 'hover:brightness-110',
        className,
      ].join(' ')}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? undefined : `0 0 0 1px ${accentColor}1A`,
      }}
      aria-labelledby={titleId}
      aria-describedby={descId}
      aria-disabled={disabled || undefined}
      data-accent={accent}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.setProperty('--tw-ring-color', accentColor);
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).style.removeProperty('--tw-ring-color');
      }}
    >
      <h2
        id={titleId}
        className="mb-2 font-['IBM_Plex_Mono',monospace] text-xl"
        style={{ color: accentColor }}
      >
        {title}
      </h2>

      <p id={descId} className="min-h-[3.5rem] text-sm text-neutral-300">
        {desc}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs text-neutral-200">{ctaLabel}</span>
      </div>
    </motion.div>
  );

  if (disabled) {
    return (
      <div role="group" aria-label={title} aria-disabled="true" tabIndex={-1} title={hint}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      aria-label={`${ctaLabel} ${title}`}
      aria-keyshortcuts="Enter Space"
      title={hint}
      className="block"
      role="button"
      onClick={(e) => {
        if (onActivate) {
          e.preventDefault();   
          onActivate();         
        }
      }}
      onKeyDown={(e) => {
        if (e.code === 'Space' || e.key === ' ') {
          e.preventDefault();
          if (onActivate) {
            onActivate();
          } else {
            (e.currentTarget as HTMLAnchorElement).click();
          }
        }
      }}
    >
      {content}
    </Link>
  );
}

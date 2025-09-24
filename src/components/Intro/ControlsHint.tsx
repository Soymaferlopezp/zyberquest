'use client';

import { ControlsHintProps } from './types';

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] font-mono text-neutral-200 border border-white/10">
      {children}
    </kbd>
  );
}

export default function ControlsHint({
  showEnter = true,
  showMute = true,
  showEsc = true,
  className = '',
}: ControlsHintProps) {
  const items = [
    showEnter ? { k: 'Enter', desc: 'Play' } : null,
    showMute ? { k: 'M', desc: 'Mute/Unmute' } : null,
    showEsc ? { k: 'Esc', desc: 'Saltar intro' } : null,
  ].filter(Boolean) as { k: string; desc: string }[];

  return (
    <div
      data-testid="zq-controls"
      className={`flex flex-wrap items-center justify-center gap-3 text-neutral-400 ${className}`}
      aria-label="Atajos de teclado"
    >
      {items.map((it) => (
        <span key={it.k} className="inline-flex items-center gap-1.5" title={`${it.k} = ${it.desc}`}>
          <Kbd>{it.k}</Kbd>
          <span className="text-xs">{it.desc}</span>
        </span>
      ))}
    </div>
  );
}

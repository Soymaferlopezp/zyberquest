'use client';

import ModeCard, { ModeCardProps } from './ModeCard';
import { motion } from 'framer-motion';

type ModeKey = 'trivias' | 'laberintos' | 'simuladores';

type ModeItem = {
  key: ModeKey;
  title: string;
  desc: string;
  href: string;
  accent: string; // hex
  hint?: string;
  className?: string;
};

type ModeGridProps = {
  onActivate?: (href: string) => void;
  cardProps?: Partial<Pick<ModeCardProps, 'className' | 'ctaLabel' | 'hint'>>;
};

const MODES: ModeItem[] = [
  {
    key: 'trivias',
    title: 'Trivias',
    desc: 'Preguntas rápidas para aprender privacidad, ZK y Zcash.',
    href: '/trivias',
    accent: '#00FF9C', // zx-green
    hint: 'Warm-up de conocimiento',
  },
  {
    key: 'laberintos',
    title: 'Laberintos',
    desc: 'Explora mapas y desbloquea rutas con pistas cifradas.',
    href: '/labyrinth',
    accent: '#FFD60A', // zx-yellow
    hint: 'Exploration + puzzles',
  },
  {
    key: 'simuladores',
    title: 'Simuladores',
    desc: 'Rompe sustitución simple y prueba el puzzle XOR visual.',
    href: '/simulators',
    accent: '#FF3DBE', // zx-magenta
    hint: 'Hands-on crypto',
  },
];

export default function ModeGrid({ onActivate, cardProps }: ModeGridProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.06 } },
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {MODES.map((m) => (
        <motion.div
          key={m.key}
          variants={{ hidden: { y: 8, opacity: 0 }, show: { y: 0, opacity: 1 } }}
        >
          <ModeCard
            title={m.title}
            desc={m.desc}
            href={m.href}
            accent={m.accent}
            hint={cardProps?.hint ?? m.hint}
            className={cardProps?.className ?? m.className}
            ctaLabel={cardProps?.ctaLabel ?? 'Enter'}
            onActivate={onActivate}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

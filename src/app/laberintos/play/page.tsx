'use client';

import { useEffect, useRef } from 'react';
import type Phaser from 'phaser';

// Config válida y estática para este segmento
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type LabyrinthMod = {
  createPhaserGameWithMode: () =>
    | Phaser.Game
    | undefined
    | Promise<Phaser.Game | undefined>;
  destroyPhaserGame?: (game?: Phaser.Game) => void;
};

export default function LaberintosPlayPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (typeof window !== 'undefined') {
      (async () => {
        const mod = (await import('@/game/labyrinth')) as LabyrinthMod;
        const maybeGame = await mod.createPhaserGameWithMode();
        gameRef.current = maybeGame ?? null;

        cleanup = () => {
          if (mod.destroyPhaserGame && gameRef.current) {
            mod.destroyPhaserGame(gameRef.current);
          } else if (gameRef.current) {
            try { gameRef.current.destroy(true); } catch {}
          }
          gameRef.current = null;
        };
      })();
    }

    return () => cleanup?.();
  }, []);

  return (
    <main className="min-h-screen zx-scanline flex items-center justify-center">
      <div
        ref={mountRef}
        id="phaser-mount"
        className="w-[960px] h-[540px] border border-zinc-800 rounded-lg"
        aria-label="Zona de juego Phaser"
      />
    </main>
  );
}

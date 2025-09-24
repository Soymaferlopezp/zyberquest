"use client";

import { useRouter } from "next/navigation";
import { useTriviaStore } from "@/store";

type SummaryModalProps = {
  open: boolean;
};

export default function SummaryModal({ open }: SummaryModalProps) {
  const router = useRouter();
  const { startGame, getSummary, record } = useTriviaStore();

  if (!open) return null;

  // Defensa por si el store aún no está listo (no debería pasar, pero evitamos crash)
  let stats = undefined as
    | {
        score: number;
        correct: number;
        total: number;
        bestStreak: number;
        avgTimeSec: number;
        dateISO: string;
      }
    | undefined;

  try {
    stats = getSummary();
  } catch {
    // fallback seguro
    stats = {
      score: 0,
      correct: 0,
      total: 0,
      bestStreak: 0,
      avgTimeSec: 0,
      dateISO: new Date().toISOString(),
    };
  }

  const handleRestart = () => {
    startGame();
  };

  const handleExit = () => {
    router.push("/menu"); // ajusta si tu menú es otra ruta
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Resumen</h3>

        <div className="mb-3 text-xs opacity-80">
          Récord: <span className="font-mono">{record}</span>
        </div>

        <ul className="text-sm space-y-1 mb-4">
          <li>
            Puntaje: <span className="font-mono">{stats.score}</span>
          </li>
          <li>
            Aciertos: <span className="font-mono">{stats.correct}</span> / {stats.total}
          </li>
          <li>
            Mejor racha: <span className="font-mono">{stats.bestStreak}</span>
          </li>
          <li>
            Tiempo promedio:{" "}
            <span className="font-mono">{Number(stats.avgTimeSec).toFixed(1)}s</span>
          </li>
        </ul>

        <div className="flex gap-3">
          <button
            className="rounded-lg px-4 py-2 border border-white/15 hover:bg-white/10"
            onClick={handleRestart}
          >
            Jugar de nuevo
          </button>
          <button
            className="rounded-lg px-4 py-2 border border-white/15 hover:bg-white/10"
            onClick={handleExit}
          >
            Volver al menú
          </button>
        </div>
      </div>
    </div>
  );
}

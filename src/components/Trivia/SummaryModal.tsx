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
        <h3 className="text-lg font-semibold mb-2">Summary</h3>

        <div className="mb-3 text-xs opacity-80">
          Record: <span className="font-mono">{record}</span>
        </div>

        <ul className="text-sm space-y-1 mb-4">
          <li>
            Score: <span className="font-mono">{stats.score}</span>
          </li>
          <li>
            Successes: <span className="font-mono">{stats.correct}</span> / {stats.total}
          </li>
          <li>
            Best streak: <span className="font-mono">{stats.bestStreak}</span>
          </li>
          <li>
            Average time:{" "}
            <span className="font-mono">{Number(stats.avgTimeSec).toFixed(1)}s</span>
          </li>
        </ul>

        <div className="flex gap-3">
          <button
            className="rounded-lg px-4 py-2 border border-white/15 hover:bg-white/10"
            onClick={handleRestart}
          >
            Play again
          </button>
          <button
            className="rounded-lg px-4 py-2 border border-white/15 hover:bg-white/10"
            onClick={handleExit}
          >
            Back to menu
          </button>
        </div>
      </div>
    </div>
  );
}

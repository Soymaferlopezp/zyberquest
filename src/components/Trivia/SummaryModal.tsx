"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTriviaStore } from "@/store";
import { getTournamentCode, saveTournamentResult } from "@/lib/tournament";

type SummaryModalProps = { open: boolean };

const LABEL_BY_DIFF = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
} as const;

const NEXT_BY_DIFF = {
  beginner: "intermediate",
  intermediate: "advanced",
  advanced: null,
} as const;

type Diff = keyof typeof LABEL_BY_DIFF;

function normalize(d: unknown): Diff {
  return (d === "beginner" || d === "intermediate" || d === "advanced") ? d : "beginner";
}

export default function SummaryModal({ open }: SummaryModalProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const isTournament = sp.get("mode") === "tournament";

  const {
    startGame,
    getSummary,
    record,
    resetToIntro,
    difficulty,
    setDifficulty,
  } = useTriviaStore();

  if (!open) return null;

  const stats = getSummary();
  const diff = normalize(difficulty);
  const label = LABEL_BY_DIFF[diff];
  const nextDiff = NEXT_BY_DIFF[diff];
  const isEndOfRun = nextDiff === null; // Terminaste Advanced → 3 niveles

  async function submitIfEndRun() {
    if (!isEndOfRun || !isTournament) return;

    const code = getTournamentCode();
    if (!code) return;

    const levelsPassed = 3; // final de Advanced
    const score = Number(stats?.score ?? 0);

    await saveTournamentResult({
      code,
      score,
      levelsPassed,
      playedAt: new Date().toISOString(),
    });
  }

  const handleContinueNext = async () => {
    // Aún no termina la run → no enviamos resultado
    if (!nextDiff) return;
    setDifficulty(nextDiff as any);
    queueMicrotask(() => startGame());
  };

  const handlePlayAgain = async () => {
    // Si era fin de run y torneo, registra antes de reiniciar
    await submitIfEndRun();
    startGame();
  };

  const handleBackToMenu = async () => {
    await submitIfEndRun();
    resetToIntro();
    router.push("/trivias"); // menú de trivias existente
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div
        className="w-full max-w-md rounded-2xl border bg-black p-6 text-white"
        style={{ borderColor: "#F9C400", boxShadow: "0 0 24px rgba(249,196,0,0.25)" }}
      >
        <h3 className="text-lg font-semibold mb-2">Summary</h3>

        <div className="mb-1 text-xs opacity-80">
          Difficulty: <span className="font-mono">{label}</span>
        </div>
        <div className="mb-3 text-xs opacity-80">
          Record: <span className="font-mono">{record}</span>
        </div>

        <ul className="text-sm space-y-1 mb-4">
          <li>Score: <span className="font-mono">{stats.score}</span></li>
          <li>Correct: <span className="font-mono">{stats.correct}</span> / {stats.total}</li>
          <li>Best streak: <span className="font-mono">{stats.bestStreak}</span></li>
          <li>Avg time: <span className="font-mono">{stats.avgTimeSec.toFixed(1)}s</span></li>
        </ul>

        <div className="flex flex-wrap gap-3">
          {nextDiff ? (
            <button
              className="rounded-lg px-4 py-2 border text-black"
              style={{ background: "#F9C400", borderColor: "#F9C400" }}
              onClick={handleContinueNext}
            >
              Continue to {LABEL_BY_DIFF[nextDiff as Diff]}
            </button>
          ) : (
            <button
              className="rounded-lg px-4 py-2 border hover:bg-white/10"
              style={{ borderColor: "#F9C400" }}
              onClick={handlePlayAgain}
            >
              Play again
            </button>
          )}

          <button
            className="rounded-lg px-4 py-2 border hover:bg-white/10"
            style={{ borderColor: "#F9C400" }}
            onClick={handleBackToMenu}
          >
            Back to menu
          </button>
        </div>
      </div>
    </div>
  );
}

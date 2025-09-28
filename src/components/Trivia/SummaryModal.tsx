"use client";

import { useRouter } from "next/navigation";
import { useTriviaStore } from "@/store";

type SummaryModalProps = { open: boolean };

// Etiquetas públicas
const LABEL_BY_DIFF = {
  easy: "Beginner",
  medium: "Intermediate",
  hard: "Advanced",
} as const;

// Etiqueta del siguiente nivel (o null si ya es el último)
const NEXT_LABEL_BY_DIFF = {
  easy: "Intermediate",
  medium: "Advanced",
  hard: null,
} as const;

const NEXT_BY_DIFF = {
  easy: "medium",
  medium: "hard",
  hard: null,
} as const;

function normalize(d: unknown): keyof typeof LABEL_BY_DIFF {
  return d === "easy" || d === "medium" || d === "hard" ? d : "easy";
}

export default function SummaryModal({ open }: SummaryModalProps) {
  const router = useRouter();
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
  const nextLabel = NEXT_LABEL_BY_DIFF[diff];
  const nextDiff = NEXT_BY_DIFF[diff]; // "medium" | "hard" | null

  const handleContinueNext = () => {
    if (!nextDiff) return;
    // 1) nueva dificultad…
    setDifficulty(nextDiff);
    // 2) …micro-tick siguiente 
    queueMicrotask(() => {
      startGame();
      // Al pasar a status "playing", TriviaScreen desmonta este modal automáticamente (open=false).
    });
  };

  const handleRestart = () => {
    // Reinicia con la dificultad actual
    startGame();
  };

  const handleExit = () => {
    resetToIntro();
    router.push("/trivias");
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black p-6 text-white">
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
          {nextLabel ? (
            <button
              className="rounded-lg px-4 py-2 border border-[rgba(249,196,0,0.9)] text-black"
              style={{ background: "#F9C400" }}
              onClick={handleContinueNext}
            >
              Continue to {nextLabel}
            </button>
          ) : (
            <button
              className="rounded-lg px-4 py-2 border border-white/15 hover:bg-white/10"
              onClick={handleRestart}
            >
              Play again
            </button>
          )}

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

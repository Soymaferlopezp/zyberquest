"use client";

import { useRouter } from "next/navigation";
import { useTriviaStore } from "@/store";

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

  const handleContinueNext = () => {
    if (!nextDiff) return;
    setDifficulty(nextDiff as any);
    queueMicrotask(() => startGame());
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
              onClick={() => startGame()}
            >
              Play again
            </button>
          )}

          <button
            className="rounded-lg px-4 py-2 border hover:bg-white/10"
            style={{ borderColor: "#F9C400" }}
            onClick={() => { resetToIntro(); router.push("/trivias"); }}
          >
            Back to menu
          </button>
        </div>
      </div>
    </div>
  );
}

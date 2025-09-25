"use client";

import { useRouter } from "next/navigation";
import { useTriviaStore } from "@/store";

type SummaryModalProps = { open: boolean };

export default function SummaryModal({ open }: SummaryModalProps) {
  const router = useRouter();
  const { startGame, getSummary, record, resetToIntro } = useTriviaStore();
  if (!open) return null;

  const stats = getSummary();

  const handleRestart = () => startGame();
  const handleExit = () => {
    resetToIntro();         
    router.push("/trivias"); 
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <div className="mb-3 text-xs opacity-80">Record: <span className="font-mono">{record}</span></div>
        <ul className="text-sm space-y-1 mb-4">
          <li>Score: <span className="font-mono">{stats.score}</span></li>
          <li>Correct: <span className="font-mono">{stats.correct}</span> / {stats.total}</li>
          <li>Best streak: <span className="font-mono">{stats.bestStreak}</span></li>
          <li>Avg time: <span className="font-mono">{stats.avgTimeSec.toFixed(1)}s</span></li>
        </ul>
        <div className="flex gap-3">
          <button className="rounded-lg px-4 py-2 border border-white/15 hover:bg-white/10" onClick={handleRestart}>
            Play again
          </button>
          <button className="rounded-lg px-4 py-2 border border-white/15 hover:bg-white/10" onClick={handleExit}>
            Back to menu
          </button>
        </div>
      </div>
    </div>
  );
}

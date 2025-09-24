"use client";

import { motion } from "framer-motion";

type ScoreHUDProps = {
  score: number;
  streak: number;
  questionNumber: number;
  total: number;
  timeLeft: number;   // segundos restantes
  maxTime: number;    // segundos máximos (perQuestionTime)
};

export default function ScoreHUD({
  score,
  streak,
  questionNumber,
  total,
  timeLeft,
  maxTime,
}: ScoreHUDProps) {
  const pct = Math.max(0, Math.min(1, timeLeft / Math.max(1, maxTime)));
  const R = 16;
  const C = 2 * Math.PI * R;
  const dash = C * pct;

  return (
    <header className="flex items-center justify-between rounded-2xl border border-white/10 p-3 bg-white/5">
      <div className="flex items-center gap-4">
        <div className="text-sm">
          Puntaje: <span className="font-mono">{score}</span>
        </div>
        <div className="text-sm">
          Racha:{" "}
          <motion.span
            key={streak}
            initial={{ scale: 1 }}
            animate={{ scale: streak > 0 ? 1.08 : 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 14, duration: 0.25 }}
            className="font-mono"
            aria-live="polite"
          >
            {streak}
          </motion.span>
        </div>
      </div>

      <div className="text-sm">
        Pregunta <span className="font-mono">{questionNumber}</span>/<span className="font-mono">{total}</span>
      </div>

      <div className="flex items-center gap-2">
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r={R} stroke="rgba(255,255,255,0.15)" strokeWidth="4" fill="none" />
          <circle
            cx="20"
            cy="20"
            r={R}
            stroke="rgba(0,229,255,0.9)"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${dash} ${C - dash}`}
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
          />
        </svg>
        <div className="text-sm">
          ⏱ <span className="font-mono">{Math.ceil(timeLeft)}s</span>
        </div>
      </div>
    </header>
  );
}

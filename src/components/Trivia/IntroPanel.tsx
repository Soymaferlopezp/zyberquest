"use client";

import { useEffect } from "react";
import { useTriviaStore } from "@/store";

export default function IntroPanel() {
  const { difficulty, setDifficulty, startGame } = useTriviaStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "1") setDifficulty("Beginner");
      if (e.key === "2") setDifficulty("Intermediate");
      if (e.key === "3") setDifficulty("Advanced");
      if (e.key === "Enter") startGame();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDifficulty, startGame]);

  const diffBtn = (d: "Beginner" | "Intermediate" | "Advanced") =>
    `px-4 py-2 rounded-lg border transition ${
      difficulty === d
        ? "border-[rgba(249,196,0,0.9)] shadow-[0_0_14px_rgba(249,196,0,0.45)]"
        : "border-white/15 hover:border-[rgba(249,196,0,0.6)]"
    }`;

  return (
    <section
      className="rounded-2xl p-4 md:p-5 bg-black/50 backdrop-blur shadow-[0_0_0_1px_rgba(249,196,0,0.9),0_0_24px_rgba(249,196,0,0.18)]"
      style={{ borderColor: "#F9C400" }}
      aria-labelledby="trivia-intro-heading"
    >
      <div className="grid md:grid-cols-2 gap-4 md:gap-5 items-stretch">
        {/* Tarjeta izquierda */}
        <div className="h-full rounded-xl border border-white/10 bg-white/5 p-4 md:p-5">
          <h2 className="text-base md:text-lg font-semibold mb-2">About the mode</h2>
          <p className="text-sm opacity-85 mb-3">
            Answer 10 questions about the Zcash ecosystem: privacy, shielded, memos, zk-SNARKs, history, and tooling.
            After each answer, a short educational explanation pops up. Use keyboard or mouse.
          </p>
          <ul className="text-sm space-y-1">
            <li>• 10 random questions (choices shuffled).</li>
            <li>• Time per question by difficulty.</li>
            <li>• Streak increases your score multiplier.</li>
            <li>• Tooltips <span className="italic">“Why?”</span> after confirming.</li>
          </ul>
        </div>

        {/* Tarjeta derecha */}
        <div className="h-full rounded-xl border border-white/10 bg-white/5 p-4 md:p-5 flex flex-col">
          <h2 className="text-base md:text-lg font-semibold mb-2">Choose difficulty</h2>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <button className={diffBtn("Beginner")} onClick={() => setDifficulty("Beginner")}>
                1 • Beginner (35s)
              </button>
              <button className={diffBtn("Intermediate")} onClick={() => setDifficulty("Intermediate")}>
                2 • Intermediate (30s)
              </button>
              <button className={diffBtn("Advanced")} onClick={() => setDifficulty("Advanced")}>
                3 • Advanced (25s)
              </button>
            </div>
            <p className="text-xs opacity-70">Hotkeys: 1/2/3 to select difficulty</p>
          </div>

          <div className="mt-auto">
            <button
              onClick={startGame}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-[rgba(249,196,0,0.9)] text-black"
              style={{ background: "#F9C400" }}
              aria-label="Start the trivia"
            >
              Start • Enter
            </button>
            <p className="text-xs opacity-70 mt-2">Press Enter to start</p>
          </div>
        </div>
      </div>
    </section>
  );
}

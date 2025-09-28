"use client";

import { useRouter } from "next/navigation";
import { useTriviaStore } from "@/store";
import { useEffect, useRef, useState } from "react";

/**
 * Intro: elegir dificultad y luego presionar "Start".
 * - Hotkeys: 1/2/3 para seleccionar Beginner/Intermediate/Advanced
 * - Enter para iniciar
 * - Esc para volver al menú de juegos (/menu)
 */
export default function IntroPanel() {
  const router = useRouter();
  const { setDifficulty, startGame, resetToIntro } = useTriviaStore();

  // dificultad pendiente (local) antes de iniciar
  type Diff = "easy" | "medium" | "hard";
  const [pendingDiff, setPendingDiff] = useState<Diff>("easy");

  const panelRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  // Hotkeys globales de la intro
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "escape" || e.key === "Esc") {
        e.preventDefault();
        resetToIntro();
        router.push("/menu");
        return;
      }
      if (key === "1") { e.preventDefault(); setPendingDiff("easy"); return; }
      if (key === "2") { e.preventDefault(); setPendingDiff("medium"); return; }
      if (key === "3") { e.preventDefault(); setPendingDiff("hard"); return; }
      if (key === "enter") {
        e.preventDefault();
        setDifficulty(pendingDiff as any);
        startGame();
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingDiff, setDifficulty, startGame, resetToIntro, router]);

  const handleStart = () => {
    setDifficulty(pendingDiff as any);
    startGame();
  };

  // estilo helper
  const isSelected = (d: Diff) => pendingDiff === d;
  const baseBtn =
    "rounded-xl border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#F9C400]/60";
  const selectedStyles = {
    borderColor: "#F9C400",
    boxShadow: "0 0 0 1px #F9C400, 0 0 24px rgba(249,196,0,0.18)",
    background: "linear-gradient(180deg, rgba(249,196,0,0.08), rgba(0,0,0,0))",
  } as const;

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      className="rounded-2xl border bg-black/60 backdrop-blur p-5 md:p-6 relative outline-none"
      style={{ borderColor: "#F9C400" }}
    >
      {/* Hint Esc */}
      <div className="mb-4 flex items-center justify-end">
        <span className="text-xs opacity-70" aria-label="Press Esc to go back to the games menu">
          Press <kbd className="border border-white/20 px-1 py-0.5 rounded">Esc</kbd> to go back
        </span>
      </div>

      <header className="mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "#F9C400" }}>
          Choose your difficulty
        </h2>
        <p className="text-sm opacity-80">
          Answer 10 questions about the Zcash ecosystem: privacy, shielded, memos, zk-SNARKs, history, and tooling.
          After each answer, a short educational explanation pops up. Use keyboard or mouse.
        </p>
        <ul className="text-sm space-y-1 mt-3 list-disc pl-5 marker:text-[#F9C400]">
          <li>10 random questions (choices shuffled).</li>
          <li>Time per question by difficulty.</li>
          <li>Streak increases your score multiplier.</li>
          <li>Tooltips <span className="italic">“Why?”</span> after confirming.</li>
        </ul>
      </header>

      {/* Selector de dificultad */}
      <div className="grid sm:grid-cols-3 gap-3">
        <button
          type="button"
          aria-pressed={isSelected("easy")}
          onClick={() => setPendingDiff("easy")}
          className={`${baseBtn} border-white/15 hover:bg-white/10`}
          style={isSelected("easy") ? selectedStyles : undefined}
        >
          <div className="text-base font-medium">Beginner</div>
          <div className="text-xs opacity-70">Basic concepts</div>
          <div className="mt-2 text-[10px] opacity-60">Hotkey: 1</div>
        </button>

        <button
          type="button"
          aria-pressed={isSelected("medium")}
          onClick={() => setPendingDiff("medium")}
          className={`${baseBtn} border-white/15 hover:bg-white/10`}
          style={isSelected("medium") ? selectedStyles : undefined}
        >
          <div className="text-base font-medium">Intermediate</div>
          <div className="text-xs opacity-70">Privacy and memos</div>
          <div className="mt-2 text-[10px] opacity-60">Hotkey: 2</div>
        </button>

        <button
          type="button"
          aria-pressed={isSelected("hard")}
          onClick={() => setPendingDiff("hard")}
          className={`${baseBtn} border-white/15 hover:bg-white/10`}
          style={isSelected("hard") ? selectedStyles : undefined}
        >
          <div className="text-base font-medium">Advanced</div>
          <div className="text-xs opacity-70">Technical challenges and culture</div>
          <div className="mt-2 text-[10px] opacity-60">Hotkey: 3</div>
        </button>
      </div>

      {/* Botón de inicio */}
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleStart}
          className="rounded-xl px-5 py-2 border text-black"
          style={{ background: "#F9C400", borderColor: "#F9C400" }}
          aria-label={`Start ${pendingDiff === "easy" ? "Beginner" : pendingDiff === "medium" ? "Intermediate" : "Advanced"}`}
        >
          Start
        </button>
        <span className="text-xs opacity-70">Press <kbd className="border border-white/20 px-1 py-0.5 rounded">Enter</kbd> to start</span>
      </div>
    </section>
  );
}

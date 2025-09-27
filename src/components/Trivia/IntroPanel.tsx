"use client";

import { useRouter } from "next/navigation";
import { useTriviaStore } from "@/store";
import { useEffect } from "react";

export default function IntroPanel() {
  const router = useRouter();
  const { setDifficulty, startGame, resetToIntro } = useTriviaStore();

  // Hotkey: en la intro, Esc → menú general
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        resetToIntro();
        router.push("/menu"); // ← menú de los 3 juegos
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetToIntro, router]);

  return (
    <section className="rounded-2xl border border-[#F9C400] bg-black/60 backdrop-blur p-5 md:p-6 relative">
      {/* Back to Games */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={() => { resetToIntro(); router.push("/menu"); }}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
          aria-label="Back to games menu"
        >
          ← Press here or <kbd>ESC</kbd>
        </button>
      </div>

      <header className="mb-3">
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
          <li>
            Tooltips <span className="italic">“Why?”</span> after confirming.
          </li>
        </ul>
      </header>

      <div className="grid sm:grid-cols-3 gap-3">
        <button 
          onClick={() => { setDifficulty("easy" as any); startGame(); }}
          className="rounded-xl border border-[#F9C400]/50 hover:bg-white/10 p-4 text-left"
        >
          <div className="text-base font-medium">Beginner</div>
          <div className="text-xs opacity-70">Basic concepts</div>
        </button>

        <button
          onClick={() => { setDifficulty("medium" as any); startGame(); }}
          className="rounded-xl border border-[#F9C400]/50 hover:bg-white/10 p-4 text-left"
        >
          <div className="text-base font-medium">Intermediate</div>
          <div className="text-xs opacity-70">Privacy and memos</div>
        </button>

        <button
          onClick={() => { setDifficulty("hard" as any); startGame(); }}
          className="rounded-xl border border-[#F9C400]/50 hover:bg-white/10 p-4 text-left"
        >
          <div className="text-base font-medium">Advanced</div>
          <div className="text-xs opacity-70">Technical challenges and culture</div>
        </button>
      </div>
    </section>
  );
}

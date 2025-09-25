"use client";

import { useEffect, useRef } from "react";
import { ScoreHUD } from "./client";
import { ControlsBar } from "./client";
import QuestionCard from "./QuestionCard";
import SummaryModal from "./SummaryModal";
import { useTriviaStore } from "@/store";
import { useRouter } from "next/navigation";

export default function TriviaScreen() {
  const router = useRouter();
  const {
    status,
    index,
    total,
    score,
    streak,
    timeLeft,
    questions,
    selectedIndex,
    answerState,
    perQuestionTime,
    startGame,
    selectChoice,
    confirm,
    next,
    pause,
    resume,
    tick,
  } = useTriviaStore();

  useEffect(() => {
    if (status === "idle") startGame();
  }, [status, startGame]);

  // Timer con rAF
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    function loop(ts: number) {
      if (lastRef.current == null) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      tick(dt);
      rafRef.current = requestAnimationFrame(loop);
    }

    const canRun = status === "playing" && answerState === "idle";
    if (canRun) {
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
    };
  }, [status, answerState, tick]);

  // Hotkeys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;

      if (status === "playing") {
        if (e.key >= "1" && e.key <= "4") {
          e.preventDefault();
          const i = Number(e.key) - 1;
          selectChoice(i);
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          if (answerState === "idle") confirm();
          else next();
          return;
        }
        if (e.key.toLowerCase() === "p") {
          e.preventDefault();
          pause();
          return;
        }
      }
      if (status === "paused") {
        if (e.key.toLowerCase() === "p" || e.key === "Enter") {
          e.preventDefault();
          resume();
          return;
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        router.push("/menu");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, answerState, selectChoice, confirm, next, pause, resume, router]);

  const q = questions[index];

  return (
    <main className="min-h-[calc(100dvh-4rem)] p-4 md:p-8 text-white bg-black">
      <div className="mx-auto max-w-3xl space-y-4">
        <ScoreHUD
          score={score}
          streak={streak}
          questionNumber={Math.min(index + 1, total)}
          total={total}
          timeLeft={timeLeft}
          maxTime={perQuestionTime}
        />

        {q ? (
          <QuestionCard
            question={q.question}
            choices={q.choices}
            selectedIndex={selectedIndex}
            state={
              answerState === "idle"
                ? "idle"
                : (answerState as "correct" | "incorrect" | "idle")
            }
          />
        ) : (
          <section className="rounded-2xl border border-white/10 p-6 bg-white/5 backdrop-blur">
            <p className="opacity-70">Loading questions…</p>
          </section>
        )}

        <ControlsBar />
      </div>

      <SummaryModal open={status === "ended"} />

      {status === "paused" && (
        <div
          role="dialog"
          aria-label="Juego en pausa"
          className="fixed inset-0 z-40 grid place-items-center bg-black/70"
        >
          <div className="rounded-2xl border border-white/10 bg-black px-6 py-4 text-white shadow">
            <p className="mb-2">⏸️ Pause</p>
            <p className="text-xs opacity-70">
              Press <kbd className="px-1 py-0.5 rounded border border-white/20">P</kbd> or{" "}
              <kbd className="px-1 py-0.5 rounded border border-white/20">Enter</kbd> to continue
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

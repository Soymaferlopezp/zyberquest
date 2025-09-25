"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ScoreHUD } from "./client";
import { ControlsBar } from "./client";
import QuestionCard from "./QuestionCard";
import SummaryModal from "./SummaryModal";
import IntroPanel from "./IntroPanel";
import { useTriviaStore } from "@/store";
import { useRouter } from "next/navigation";

export default function TriviaScreen() {
  const router = useRouter();
  const {
    status, index, total, score, streak, timeLeft, perQuestionTime,
    questions, selectedIndex, answerState, selectChoice, confirm, next, pause, resume, tick,
  } = useTriviaStore();

  const reduce = useReducedMotion();

  // Timer rAF
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
    if (canRun) rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
    };
  }, [status, answerState, tick]);

  // Hotkeys (Intro maneja 1/2/3/Enter)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (status === "playing") {
        if (e.key >= "1" && e.key <= "4") { e.preventDefault(); selectChoice(Number(e.key) - 1); return; }
        if (e.key === "Enter") { e.preventDefault(); (answerState === "idle" ? confirm() : next()); return; }
        if (e.key.toLowerCase() === "p") { e.preventDefault(); pause(); return; }
      }
      if (status === "paused" && (e.key.toLowerCase() === "p" || e.key === "Enter")) { e.preventDefault(); resume(); return; }
      if (e.key === "Escape") { e.preventDefault(); router.push("/menu"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, answerState, selectChoice, confirm, next, pause, resume, router]);

  const q = questions[index];

  // ====== Animación Intro (parent + stagger) ======
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, when: "beforeChildren" as const }
    },
  };
  const titleVariants = {
    hidden: reduce ? {} : { y: 10, opacity: 0 },
    show:   reduce ? {} : { y: 0,  opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
  };
  const agentVariants = {
    hidden: reduce ? {} : { x: -12, opacity: 0 },
    show:   reduce ? {} : { x: 0,   opacity: 1, transition: { duration: 0.28, ease: "easeOut" } },
  };
  const panelVariants = {
    hidden: reduce ? {} : { y: 12, opacity: 0 },
    show:   reduce ? {} : { y: 0,  opacity: 1, transition: { duration: 0.28, ease: "easeOut" } },
  };

  return (
    <main className="min-h-[calc(100dvh-4rem)] p-4 md:p-8 text-white bg-black">
      <div className="relative mx-auto max-w-6xl">
        {/* Fondo con degradados */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem]"
          style={{
            background:
              "radial-gradient(60rem 24rem at 60% -10%, rgba(249,196,0,0.12), transparent 60%)," +
              "radial-gradient(40rem 20rem at 20% 120%, rgba(0,229,255,0.10), transparent 60%)",
            boxShadow: "inset 0 0 120px rgba(0,0,0,0.5)"
          }}
        />

        {status === "idle" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Agente a la izquierda */}
            <motion.div
              variants={agentVariants}
              className="hidden md:block absolute -left-8 top-8 w-[300px] xl:w-[360px] h-auto pointer-events-none select-none"
            >
              <img
                src="/trivia/cyberpunk-agent.png"
                alt="Cyberpunk agent"
                className="w-full h-full object-contain drop-shadow-[0_0_28px_rgba(0,255,156,0.5)]"
              />
            </motion.div>

            {/* Contenido con padding para no solapar la imagen */}
            <div className="md:pl-[320px] xl:pl-[380px]">
              {/* Título animado */}
              <motion.header variants={titleVariants} className="mb-5 md:mb-6">
                <h1 className="font-mono text-3xl md:text-5xl font-semibold tracking-tight" style={{ color: "#F9C400" }}>
                  Zcash Trivia — Privacy Arcade
                </h1>
              </motion.header>

              {/* Panel (IntroPanel envuelto para coordinar animación) */}
              <motion.div variants={panelVariants}>
                <IntroPanel />
              </motion.div>

              <div className="mt-4">
                <ControlsBar />
              </div>
            </div>
          </motion.div>
        )}

        {status === "playing" && (
          <div className="space-y-4">
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
                state={answerState === "idle" ? "idle" : (answerState as "correct" | "incorrect" | "idle")}
              />
            ) : (
              <section className="rounded-2xl border border-white/10 p-6 bg-white/5 backdrop-blur">
                <p className="opacity-70">Loading…</p>
              </section>
            )}

            <div className="mt-2">
              <ControlsBar />
            </div>
          </div>
        )}
      </div>

      <SummaryModal open={status === "ended"} />
    </main>
  );
}

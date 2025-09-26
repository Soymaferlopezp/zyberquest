"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useTriviaStore } from "@/store";
import ExplanationTooltip from "./ExplanationTooltip";

type QuestionCardProps = {
  question: string;
  choices: string[];
  selectedIndex: number | null;
  state: "idle" | "confirmed" | "correct" | "incorrect";
};

export default function QuestionCard({
  question, choices, selectedIndex, state,
}: QuestionCardProps) {
  const shouldReduce = useReducedMotion();
  const { questions, index, selectChoice, confirm, next } = useTriviaStore();
  const q = questions[index];
  const correctIndex = q?.answerIndex ?? -1;

  const cardVariants: Variants | undefined = shouldReduce
    ? undefined
    : { initial: { y: 8, opacity: 0 }, animate: { y: 0, opacity: 1, transition: { duration: 0.22, ease: "easeOut" } } };

  const containerAnimProps =
    shouldReduce ? {} :
    state === "correct" ? { animate: { boxShadow: "0 0 22px rgba(0,255,156,0.35)" } } :
    state === "incorrect" ? { animate: { x: [0,-4,4,-2,2,0], transition: { duration: 0.28 } } } :
    {};

  const showWhy = state === "correct" || state === "incorrect";
  const onPrimary = () => (state === "idle" ? confirm() : next());

  return (
    <motion.section
      key={q?.id ?? question}
      variants={cardVariants}
      initial={shouldReduce ? undefined : "initial"}
      animate={shouldReduce ? undefined : "animate"}
      className="rounded-2xl border bg-gradient-to-b from-black/30 to-black/60 backdrop-blur
                 shadow-[0_0_0_1px_rgba(0,229,255,0.12),0_10px_40px_rgba(0,0,0,0.6)]
                 border-[rgba(0,229,255,0.22)] p-4 md:p-6"
      aria-live="polite"
    >
      <h2 className="text-lg md:text-xl font-Intermediate mb-4">{question}</h2>

      <motion.div {...containerAnimProps} className="grid gap-3 will-change-transform">
        {choices.map((c, i) => {
          const isSelected = selectedIndex === i;
          const isCorrect = i === correctIndex;
          const showCorrect = state !== "idle" && isCorrect;
          const showIncorrect = state === "incorrect" && isSelected && !isCorrect;

          const border =
            showCorrect
              ? "border-[rgba(249, 196, 0, 1)] shadow-[0_0_14px_rgba(0,255,156,0.35)]"
              : showIncorrect
              ? "border-[rgba(255,61,190,0.85)] shadow-[0_0_14px_rgba(255,61,190,0.35)]"
              : isSelected
              ? "border-[rgba(0,229,255,0.8)]"
              : "border-white/12";

          return (
            <button
              key={i}
              type="button"
              className={`text-left rounded-xl border px-4 py-3 focus:outline-none focus:ring transition ${border}`}
              onClick={() => selectChoice(i)}
              aria-pressed={isSelected}
              disabled={state !== "idle"}
            >
              <span className="opacity-70 mr-2">{i + 1}.</span>
              {c}
            </button>
          );
        })}
      </motion.div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onPrimary}
          className="rounded-lg px-4 py-2 border border-white/15 hover:bg-white/10 disabled:opacity-50"
          disabled={state === "idle" && selectedIndex === null}
        >
          {state === "idle" ? "Confirm (Enter)" : "Next (Enter)"}
        </button>

        {showWhy && q?.explain && <ExplanationTooltip text={q.explain} />}

        <span className="text-xs opacity-80 ml-auto" aria-live="polite">
          {state === "correct" && "Correct! 🔐"}
          {state === "incorrect" && "Incorrect. See the explanation and continue."}
          {state === "idle" && "Use 1–4 to choose and Enter to confirm."}
        </span>
      </div>
    </motion.section>
  );
}

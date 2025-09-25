import bankRaw from "@/data/trivia-zcash.json";
import { triviaBankSchema, TriviaQuestion } from "./triviaSchema";

/** Fisher–Yates */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type Difficulty = "easy" | "medium" | "hard";

/**
 * Valida el banco, filtra por dificultad (si se pasa),
 * baraja preguntas, **baraja choices** y recalcula answerIndex,
 * y retorna un slice de `count`.
 */
export function prepareTrivia(params?: { count?: number; difficulty?: Difficulty }): TriviaQuestion[] {
  const count = params?.count ?? 10;
  const difficulty = params?.difficulty;

  const parsed = triviaBankSchema.parse(bankRaw);

  // Filtra por dificultad si aplica; si hay pocas, cae back a todo el banco
  const pool = difficulty
    ? parsed.filter(q => q.difficulty === difficulty)
    : parsed;

  const base = (pool.length >= Math.min(count, 4)) ? pool : parsed;

  // Barajar preguntas
  const shuffledQs = shuffle(base);

  // Para cada pregunta, baraja choices y recalcula answerIndex
  const normalized = shuffledQs.map((q) => {
    const correctText = q.choices[q.answerIndex];
    const choicesShuffled = shuffle(q.choices);
    const newAnswerIndex = Math.max(0, choicesShuffled.findIndex(c => c === correctText));
    return { ...q, choices: choicesShuffled, answerIndex: newAnswerIndex } as TriviaQuestion;
  });

  return normalized.slice(0, Math.min(count, normalized.length));
}

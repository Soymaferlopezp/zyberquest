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

export function prepareTrivia(count = 10): TriviaQuestion[] {
  const parsed = triviaBankSchema.parse(bankRaw);

  // Barajar preguntas
  const shuffledQs = shuffle(parsed);

  // Para cada pregunta, baraja choices y recalcula answerIndex
  const normalized = shuffledQs.map((q) => {
    const originalChoices = q.choices;
    const correctText = originalChoices[q.answerIndex];

    const shuffledChoices = shuffle(originalChoices);
    const newAnswerIndex = Math.max(
      0,
      shuffledChoices.findIndex((c) => c === correctText)
    );

    return {
      ...q,
      choices: shuffledChoices,
      answerIndex: newAnswerIndex,
    } as TriviaQuestion;
  });

  // Slice a N
  return normalized.slice(0, Math.min(count, normalized.length));
}

import triviaData from "@/data/trivia-zcash.json";
import { triviaArraySchema, type TriviaQuestion } from "./triviaSchema";

// Fisher–Yates
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Baraja options y recalcula answerIndex */
function shuffleChoices(q: TriviaQuestion): Pick<TriviaQuestion, "choices" | "answerIndex"> {
  const pairs = q.choices.map((text, idx) => ({ text, idx }));
  const shuffled = shuffle(pairs);
  const choices = shuffled.map(p => p.text);
  const answerIndex = shuffled.findIndex(p => p.idx === q.answerIndex);
  return { choices, answerIndex };
}

/** Acepta ambas notaciones y normaliza a las etiquetas del JSON */
type DifficultyArg =
  
  | "Beginner" | "Intermediate" | "Advanced";

function normalizeToLabel(d: DifficultyArg | string): "Beginner" | "Intermediate" | "Advanced" | null {
  const s = String(d).toLowerCase();
  if (s === "easy" || s === "beginner") return "Beginner";
  if (s === "medium" || s === "intermediate") return "Intermediate";
  if (s === "hard" || s === "advanced") return "Advanced";
  return null;
}

type PrepareOpts = {
  count: number;                 // normalmente 10
  difficulty: DifficultyArg;     // venga como venga, lo normalizamos
};

/**
 * Devuelve preguntas EXCLUSIVAMENTE de la modalidad pedida (por etiqueta del JSON),
 * sin duplicar. Si hay exactamente 10, devuelve esas 10 barajadas; si hay >10, toma 10 únicas.
 * Siempre baraja las choices y recalcula answerIndex por pregunta.
 */
export function prepareTrivia({ count, difficulty }: PrepareOpts): TriviaQuestion[] {
  // 1) Parse y tipado del JSON
  const parsed = triviaArraySchema.safeParse(triviaData);
  if (!parsed.success) {
    console.error("[triviaLoader] Invalid trivia JSON:", parsed.error.flatten());
    return [];
  }
  const all = parsed.data as TriviaQuestion[];

  // 2) Normalizar la dificultad a la etiqueta del JSON
  const label = normalizeToLabel(difficulty);
  if (!label) {
    console.error(`[triviaLoader] Dificultad desconocida: "${difficulty}"`);
    return [];
  }

  // 3) Filtrar SOLO por esa modalidad
  const pool = all.filter(q => q.difficulty === label);
  if (pool.length === 0) {
    console.warn(`[triviaLoader] No hay preguntas para la dificultad "${label}".`);
    return [];
  }

  // 4) Selección sin duplicados
  const poolShuffled = shuffle(pool);
  const take = Math.min(count, poolShuffled.length);
  const selected = poolShuffled.slice(0, take);

  // 5) Barajar choices y recalcular índice
  const withShuffledChoices = selected.map((q) => {
    const { choices, answerIndex } = shuffleChoices(q);
    return { ...q, choices, answerIndex } as TriviaQuestion;
  });

  // 6) Barajar orden final de preguntas
  return shuffle(withShuffledChoices);
}

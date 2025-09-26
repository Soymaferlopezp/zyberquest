import { create } from "zustand";
import type { TriviaQuestion } from "@/lib/triviaSchema";
import { prepareTrivia, type Difficulty } from "@/lib/triviaLoader";

export type Status = "idle" | "playing" | "paused" | "ended";
export type AnswerState = "idle" | "correct" | "incorrect";

type SessionSummary = {
  score: number;
  correct: number;
  total: number;
  bestStreak: number;
  avgTimeSec: number;
  dateISO: string;
};

type TriviaState = {
  // config actual
  difficulty: Difficulty;
  perQuestionTime: number;

  // game state
  status: Status;
  questions: TriviaQuestion[];
  index: number;
  total: number;

  // scoring
  score: number;
  streak: number;
  bestStreak: number;
  correctCount: number;

  // timer
  timeLeft: number;

  // UI
  selectedIndex: number | null;
  answerState: AnswerState;
  lastCorrect: boolean | null;

  // métricas
  _elapsedTotal: number;
  _questionTimes: number[];

  // persistencia
  record: number;
  history: SessionSummary[];

  // actions
  setDifficulty: (d: Difficulty) => void;
  startGame: () => void;
  selectChoice: (i: number) => void;
  confirm: () => void;
  next: () => void;
  tick: (dt: number) => void;
  pause: () => void;
  resume: () => void;
  endGame: () => void;
  resetToIntro: () => void; // 👈 nuevo

  getSummary: () => SessionSummary;
};

const HISTORY_KEY = "zyberquest_trivia_history";
const RECORD_KEY = "zyberquest_trivia_record";

function loadHistory(): SessionSummary[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveHistory(h: SessionSummary[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 10))); } catch {}
}
function loadRecord(): number {
  if (typeof window === "undefined") return 0;
  try { return Number(localStorage.getItem(RECORD_KEY) || "0") || 0; } catch { return 0; }
}
function saveRecord(v: number) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(RECORD_KEY, String(v)); } catch {}
}

const TIME_BY_DIFF: Record<Difficulty, number> = { Beginner: 35, Intermediate: 30, Advanced: 25 };

export const useTriviaStore = create<TriviaState>((set, get) => ({
  difficulty: "Beginner",
  perQuestionTime: TIME_BY_DIFF["Beginner"],

  status: "idle",
  questions: [],
  index: 0,
  total: 10,

  score: 0,
  streak: 0,
  bestStreak: 0,
  correctCount: 0,

  timeLeft: TIME_BY_DIFF["Beginner"],

  selectedIndex: null,
  answerState: "idle",
  lastCorrect: null,

  _elapsedTotal: 0,
  _questionTimes: [],

  record: loadRecord(),
  history: loadHistory(),

  setDifficulty: (d) => {
    const t = TIME_BY_DIFF[d];
    set({ difficulty: d, perQuestionTime: t, timeLeft: t });
  },

  startGame: () => {
    const { difficulty, perQuestionTime } = get();
    const qs = prepareTrivia({ count: 10, difficulty });
    set({
      status: "playing",
      questions: qs,
      index: 0,
      total: qs.length,

      score: 0,
      streak: 0,
      bestStreak: 0,
      correctCount: 0,

      timeLeft: perQuestionTime,
      selectedIndex: null,
      answerState: "idle",
      lastCorrect: null,

      _elapsedTotal: 0,
      _questionTimes: [],
    });
  },

  selectChoice: (i) => {
    const { status, answerState } = get();
    if (status !== "playing" || answerState !== "idle") return;
    set({ selectedIndex: i });
  },

  confirm: () => {
    const {
      status, answerState, selectedIndex, questions, index,
      streak, score, bestStreak, perQuestionTime, timeLeft, correctCount, _elapsedTotal, _questionTimes, difficulty
    } = get();
    if (status !== "playing" || answerState !== "idle" || selectedIndex == null) return;

    const correctIndex = questions[index].answerIndex;
    const isCorrect = selectedIndex === correctIndex;

    const mult = { Beginner: 1, Intermediate: 1.1, Advanced: 1.25 }[difficulty];
    const base = isCorrect ? 100 : 0;
    const bonus = isCorrect ? (streak + 1) * 10 : 0;

    const elapsed = Math.max(0, perQuestionTime - timeLeft);

    set({
      score: Math.round(score + (base + bonus) * mult),
      streak: isCorrect ? streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(bestStreak, streak + 1) : bestStreak,
      answerState: isCorrect ? "correct" : "incorrect",
      lastCorrect: isCorrect,
      correctCount: isCorrect ? correctCount + 1 : correctCount,
      _elapsedTotal: _elapsedTotal + elapsed,
      _questionTimes: [..._questionTimes, elapsed],
    });
  },

  next: () => {
    const { index, questions, perQuestionTime } = get();
    if (index + 1 >= questions.length) { get().endGame(); return; }
    set({
      index: index + 1,
      timeLeft: perQuestionTime,
      selectedIndex: null,
      answerState: "idle",
      lastCorrect: null,
    });
  },

  tick: (dt) => {
    const { status, answerState, timeLeft, perQuestionTime, _elapsedTotal, _questionTimes } = get();
    if (status !== "playing" || answerState !== "idle") return;
    const t = Math.max(0, timeLeft - dt);
    if (t === 0) {
      set({
        timeLeft: 0,
        answerState: "incorrect",
        lastCorrect: false,
        streak: 0,
        _elapsedTotal: _elapsedTotal + perQuestionTime,
        _questionTimes: [..._questionTimes, perQuestionTime],
      });
      return;
    }
    set({ timeLeft: t });
  },

  pause: () => { if (get().status === "playing") set({ status: "paused" }); },
  resume: () => { if (get().status === "paused") set({ status: "playing" }); },

  endGame: () => {
    const { score, correctCount, total, bestStreak, _elapsedTotal, history, record } = get();
    const answered = Math.max(1, total);
    const summary: SessionSummary = {
      score,
      correct: correctCount,
      total,
      bestStreak,
      avgTimeSec: _elapsedTotal / answered,
      dateISO: new Date().toISOString(),
    };
    const newHistory = [summary, ...history].slice(0, 10);
    saveHistory(newHistory);
    const newRecord = Math.max(record || 0, score);
    saveRecord(newRecord);
    set({ status: "ended", history: newHistory, record: newRecord });
  },

  // 👇 resetea para mostrar la INTRO nuevamente
  resetToIntro: () => {
    const { perQuestionTime } = get();
    set({
      status: "idle",
      questions: [],
      index: 0,
      total: 10,
      score: 0,
      streak: 0,
      bestStreak: 0,
      correctCount: 0,
      timeLeft: perQuestionTime,
      selectedIndex: null,
      answerState: "idle",
      lastCorrect: null,
      _elapsedTotal: 0,
      _questionTimes: [],
    });
  },

  getSummary: () => {
    const { score, correctCount, total, bestStreak, _elapsedTotal } = get();
    const answered = Math.max(1, total);
    return {
      score,
      correct: correctCount,
      total,
      bestStreak,
      avgTimeSec: _elapsedTotal / answered,
      dateISO: new Date().toISOString(),
    };
  },
}));

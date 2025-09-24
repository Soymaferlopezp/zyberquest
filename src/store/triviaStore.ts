import { create } from "zustand";
import type { TriviaQuestion } from "@/lib/triviaSchema";
import { prepareTrivia } from "@/lib/triviaLoader";

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
  // game state
  status: Status;
  questions: TriviaQuestion[];
  index: number;            // 0..N-1
  total: number;            // N de la partida

  // scoring
  score: number;
  streak: number;
  bestStreak: number;
  correctCount: number;

  // timer
  perQuestionTime: number;  // configurable
  timeLeft: number;

  // UI state
  selectedIndex: number | null;
  answerState: AnswerState; // cambia tras confirmar o timeout
  lastCorrect: boolean | null;

  // métricas de tiempo
  _elapsedTotal: number;    // suma de (perQuestionTime - timeLeft)
  _questionTimes: number[]; // tiempos por pregunta

  // persistencia
  record: number;           // récord máximo
  history: SessionSummary[]; // últimas 10 partidas (más reciente primero)

  // actions
  startGame: () => void;
  selectChoice: (i: number) => void;
  confirm: () => void;      // confirma actual (si hay selección)
  next: () => void;         // avanza a siguiente o termina
  tick: (dt: number) => void; // decrementa timer; timeout => incorrecta
  pause: () => void;
  resume: () => void;
  endGame: () => void;

  // helpers
  getSummary: () => SessionSummary;
};

// LocalStorage helpers (safe on client)
const HISTORY_KEY = "zyberquest_trivia_history";
const RECORD_KEY = "zyberquest_trivia_record";

function loadHistory(): SessionSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as SessionSummary[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(h: SessionSummary[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 10)));
  } catch {}
}

function loadRecord(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(RECORD_KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

function saveRecord(v: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECORD_KEY, String(v));
  } catch {}
}

export const useTriviaStore = create<TriviaState>((set, get) => ({
  status: "idle",
  questions: [],
  index: 0,
  total: 10,

  score: 0,
  streak: 0,
  bestStreak: 0,
  correctCount: 0,

  perQuestionTime: 30, // puedes ajustar a 25–35s
  timeLeft: 30,

  selectedIndex: null,
  answerState: "idle",
  lastCorrect: null,

  _elapsedTotal: 0,
  _questionTimes: [],

  record: loadRecord(),
  history: loadHistory(),

  startGame: () => {
    const qs = prepareTrivia(10);
    set({
      status: "playing",
      questions: qs,
      index: 0,
      total: qs.length,

      score: 0,
      streak: 0,
      bestStreak: 0,
      correctCount: 0,

      timeLeft: get().perQuestionTime,
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
      streak, score, bestStreak, perQuestionTime, timeLeft, correctCount, _elapsedTotal, _questionTimes
    } = get();

    if (status !== "playing" || answerState !== "idle") return;
    if (selectedIndex == null) return;

    const correctIndex = questions[index].answerIndex;
    const isCorrect = selectedIndex === correctIndex;

    // Puntaje base + bonus racha
    const base = isCorrect ? 100 : 0;
    const bonus = isCorrect ? (streak + 1) * 10 : 0;

    // Tiempo consumido en esta pregunta
    const elapsed = Math.max(0, perQuestionTime - timeLeft);

    set({
      score: score + base + bonus,
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
    if (index + 1 >= questions.length) {
      get().endGame();
      return;
    }
    set({
      index: index + 1,
      timeLeft: perQuestionTime,
      selectedIndex: null,
      answerState: "idle",
      lastCorrect: null,
    });
  },

  tick: (dt) => {
    const { status, answerState, timeLeft, perQuestionTime, streak, score, bestStreak, correctCount, _elapsedTotal, _questionTimes, questions, index, selectedIndex } = get();
    if (status !== "playing" || answerState !== "idle") return;

    const t = Math.max(0, timeLeft - dt);
    if (t === 0) {
      // Timeout: cuenta como incorrecta, finaliza y registra tiempo = perQuestionTime
      // No requiere selección.
      const isCorrect = false;
      const base = 0;
      const bonus = 0;
      set({
        timeLeft: 0,
        answerState: "incorrect",
        lastCorrect: isCorrect,
        streak: 0,
        score: score + base + bonus,
        bestStreak, // sin cambios
        correctCount, // sin cambios
        _elapsedTotal: _elapsedTotal + perQuestionTime,
        _questionTimes: [..._questionTimes, perQuestionTime],
        selectedIndex, // puede seguir como estaba (null o lo que sea)
      });
      return;
    }
    set({ timeLeft: t });
  },

  pause: () => {
    if (get().status === "playing") set({ status: "paused" });
  },

  resume: () => {
    if (get().status === "paused") set({ status: "playing" });
  },

  endGame: () => {
    // Construye summary y persiste
    const { score, correctCount, total, bestStreak, _elapsedTotal, history, record } = get();
    const answered = Math.max(1, total); // evita div/0
    const avgTimeSec = _elapsedTotal / answered;

    const summary: SessionSummary = {
      score,
      correct: correctCount,
      total,
      bestStreak,
      avgTimeSec,
      dateISO: new Date().toISOString(),
    };

    const newHistory = [summary, ...history].slice(0, 10);
    saveHistory(newHistory);

    const newRecord = Math.max(record || 0, score);
    saveRecord(newRecord);

    set({
      status: "ended",
      history: newHistory,
      record: newRecord,
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

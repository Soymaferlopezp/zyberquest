import { z } from "zod";

export const triviaQuestionSchema = z.object({
  id: z.string(),
  category: z.string(),
  type: z.literal("mcq"),
  question: z.string(),
  choices: z.array(z.string()).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explain: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.array(z.string()).default([]),
});

export type TriviaQuestion = z.infer<typeof triviaQuestionSchema>;

export const triviaBankSchema = z.array(triviaQuestionSchema);

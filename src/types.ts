/**
 * Types for Quotient — a fun reasoning game.
 * Questions are original puzzles (no copyrighted IQ-test items).
 */

export type Difficulty = 'easy' | 'medium' | 'hard'

export type Category =
  | 'sequence'      // number/letter patterns
  | 'analogy'       // A is to B as C is to ?
  | 'logic'         // verbal deduction
  | 'numerical'     // arithmetic reasoning
  | 'odd-one-out'   // which doesn't belong

export type QuestionType = 'multiple-choice' | 'short-answer'

export interface Question {
  id: string
  category: Category
  difficulty: Difficulty
  type: QuestionType
  prompt: string
  options?: string[]        // for multiple-choice
  answer: string            // the correct answer, as text (compared case-insensitively)
  explanation: string       // shown in the review
}

export interface Answer {
  questionId: string
  given: string
  correct: boolean
  difficulty: Difficulty
}

/** Final result of a completed test. */
export interface Result {
  quotient: number          // playful 70–145 estimate
  percentile: number        // 1–99, "ahead of X% of players"
  label: string             // friendly band name
  correct: number
  total: number
}

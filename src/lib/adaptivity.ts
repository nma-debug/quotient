import type { Question, Difficulty } from '../types'

/**
 * Adaptive difficulty.
 *
 * We track a "level" from 1–10 (starts at 5 = medium). A correct answer nudges
 * it up, a wrong answer nudges it down, and the next question is picked to match.
 * This keeps the test challenging without becoming impossible.
 */

export interface Adaptive {
  level: number
}

export const startAdaptive: Adaptive = { level: 5 }

export function difficultyForLevel(level: number): Difficulty {
  if (level <= 3) return 'easy'
  if (level <= 7) return 'medium'
  return 'hard'
}

export function nextLevel(level: number, correct: boolean): number {
  const delta = correct ? 1 : -1
  return Math.min(10, Math.max(1, level + delta))
}

/**
 * Pick the next question: prefer one at the target difficulty that hasn't been
 * asked yet; fall back to any unused question if none remain at that level.
 */
export function pickQuestion(
  bank: Question[],
  level: number,
  usedIds: string[],
): Question | null {
  const target = difficultyForLevel(level)
  const unused = bank.filter((q) => !usedIds.includes(q.id))
  if (unused.length === 0) return null

  const atTarget = unused.filter((q) => q.difficulty === target)
  const pool = atTarget.length > 0 ? atTarget : unused
  return pool[Math.floor(Math.random() * pool.length)]
}

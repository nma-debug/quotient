import { create } from 'zustand'
import type { Answer, Question } from '../types'
import {
  ABILITY_START,
  isConfident,
  nextDifficulty,
  updateAbility,
  type AbilityState,
} from '../lib/ability'
import { generateQuestionAtDifficulty, CATEGORIES } from '../lib/generators'
import { loadRecent, pushRecent } from '../lib/history'

/** How many extra questions one "answer more to improve" round adds. */
export const EXTEND_BY = 5

type Mode = 'adaptive' | 'extend'

/** Categories ordered least-used-first (random tie-break) to keep tests balanced. */
function leastUsedOrder(counts: Record<string, number>): string[] {
  return [...CATEGORIES]
    .map((c) => ({ c, n: counts[c] ?? 0, r: Math.random() }))
    .sort((a, b) => a.n - b.n || a.r - b.r)
    .map((x) => x.c)
}

interface TestState {
  current: Question | null
  answers: Answer[]
  // Map of questionId → Question so Results can look them up without a static bank.
  questionMap: Record<string, Question>
  ability: AbilityState
  // Questions served this sitting.
  usedIds: string[]
  // Questions seen in *recent* sittings (from localStorage) — excluded so replays vary.
  excludeIds: string[]
  // How many questions of each category have been served (for balancing).
  categoryCounts: Record<string, number>
  finished: boolean

  // Which stopping rule is active, and (for an extend round) where it began/ends.
  mode: Mode
  legStart: number
  legTarget: number

  /** Begin a fresh adaptive test. */
  start: () => void
  /** Answer the current question. */
  submit: (given: string) => void
  /** Continue from a finished test, adding `n` more questions to sharpen the score. */
  extend: (n: number) => void
}

export const useTest = create<TestState>((set, get) => ({
  current: null,
  answers: [],
  questionMap: {},
  ability: ABILITY_START,
  usedIds: [],
  excludeIds: [],
  categoryCounts: {},
  finished: false,
  mode: 'adaptive',
  legStart: 0,
  legTarget: 0,

  start: () => {
    const excludeIds = loadRecent()
    const first = generateQuestionAtDifficulty(
      nextDifficulty(ABILITY_START),
      excludeIds,
      leastUsedOrder({}),
    )
    set({
      current: first,
      answers: [],
      questionMap: first ? { [first.id]: first } : {},
      ability: ABILITY_START,
      usedIds: first ? [first.id] : [],
      excludeIds,
      categoryCounts: first ? { [first.category]: 1 } : {},
      finished: false,
      mode: 'adaptive',
      legStart: 0,
      legTarget: 0,
    })
  },

  submit: (given: string) => {
    const { current, answers, ability, usedIds, excludeIds, questionMap, categoryCounts, mode, legTarget } = get()
    if (!current) return

    const correct = given.trim().toLowerCase() === current.answer.trim().toLowerCase()
    const answer: Answer = {
      questionId: current.id,
      given,
      correct,
      difficulty: current.difficulty,
    }
    const nextAnswers = [...answers, answer]

    // Fold this answer into the ability belief using the item's true difficulty.
    const itemDiff = current.difficultyRating ?? 500
    const nextAbility = updateAbility(ability, itemDiff, correct)

    // Stop on confidence in adaptive mode, or on a fixed count in an extend round.
    const stop =
      mode === 'extend' ? nextAnswers.length >= legTarget : isConfident(nextAbility)

    if (stop) {
      pushRecent(usedIds) // remember this sitting's questions for future variety
      set({ answers: nextAnswers, ability: nextAbility, current: null, finished: true })
      return
    }

    const next = generateQuestionAtDifficulty(
      nextDifficulty(nextAbility),
      [...excludeIds, ...usedIds],
      leastUsedOrder(categoryCounts),
    )
    if (!next) {
      pushRecent(usedIds)
      set({ answers: nextAnswers, ability: nextAbility, current: null, finished: true })
      return
    }

    set({
      answers: nextAnswers,
      ability: nextAbility,
      questionMap: { ...questionMap, [next.id]: next },
      current: next,
      usedIds: [...usedIds, next.id],
      categoryCounts: { ...categoryCounts, [next.category]: (categoryCounts[next.category] ?? 0) + 1 },
    })
  },

  extend: (n: number) => {
    const { ability, usedIds, excludeIds, answers, questionMap, categoryCounts } = get()
    const next = generateQuestionAtDifficulty(
      nextDifficulty(ability),
      [...excludeIds, ...usedIds],
      leastUsedOrder(categoryCounts),
    )
    if (!next) return // nothing fresh to add; stay on the results screen
    set({
      mode: 'extend',
      legStart: answers.length,
      legTarget: answers.length + n,
      finished: false,
      current: next,
      questionMap: { ...questionMap, [next.id]: next },
      usedIds: [...usedIds, next.id],
      categoryCounts: { ...categoryCounts, [next.category]: (categoryCounts[next.category] ?? 0) + 1 },
    })
  },
}))

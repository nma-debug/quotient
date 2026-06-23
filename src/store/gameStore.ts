import { create } from 'zustand'
import type { Answer, Question } from '../types'
import {
  ABILITY_START,
  isConfident,
  nextDifficulty,
  updateAbility,
  type AbilityState,
} from '../lib/ability'
import { generateQuestionAtDifficulty } from '../lib/generators'
import { loadRecent, pushRecent } from '../lib/history'

/** How many extra questions one "answer more to improve" round adds. */
export const EXTEND_BY = 5

type Mode = 'adaptive' | 'extend'

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
  finished: false,
  mode: 'adaptive',
  legStart: 0,
  legTarget: 0,

  start: () => {
    const excludeIds = loadRecent()
    const first = generateQuestionAtDifficulty(nextDifficulty(ABILITY_START), excludeIds)
    set({
      current: first,
      answers: [],
      questionMap: first ? { [first.id]: first } : {},
      ability: ABILITY_START,
      usedIds: first ? [first.id] : [],
      excludeIds,
      finished: false,
      mode: 'adaptive',
      legStart: 0,
      legTarget: 0,
    })
  },

  submit: (given: string) => {
    const { current, answers, ability, usedIds, excludeIds, questionMap, mode, legTarget } = get()
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

    const next = generateQuestionAtDifficulty(nextDifficulty(nextAbility), [...excludeIds, ...usedIds])
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
    })
  },

  extend: (n: number) => {
    const { ability, usedIds, excludeIds, answers, questionMap } = get()
    const next = generateQuestionAtDifficulty(nextDifficulty(ability), [...excludeIds, ...usedIds])
    if (!next) return // nothing fresh to add; stay on the results screen
    set({
      mode: 'extend',
      legStart: answers.length,
      legTarget: answers.length + n,
      finished: false,
      current: next,
      questionMap: { ...questionMap, [next.id]: next },
      usedIds: [...usedIds, next.id],
    })
  },
}))

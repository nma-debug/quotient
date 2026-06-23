import { create } from 'zustand'
import type { Answer, Question } from '../types'
import { questions as bank } from '../data/questions'
import { startAdaptive, nextLevel, pickQuestion } from '../lib/adaptivity'

/** How many questions make up one test. */
export const TEST_LENGTH = 12

interface TestState {
  current: Question | null
  answers: Answer[]
  level: number
  usedIds: string[]
  finished: boolean

  start: () => void
  submit: (given: string) => void
}

export const useTest = create<TestState>((set, get) => ({
  current: null,
  answers: [],
  level: startAdaptive.level,
  usedIds: [],
  finished: false,

  start: () => {
    const first = pickQuestion(bank, startAdaptive.level, [])
    set({
      current: first,
      answers: [],
      level: startAdaptive.level,
      usedIds: first ? [first.id] : [],
      finished: false,
    })
  },

  submit: (given: string) => {
    const { current, answers, level, usedIds } = get()
    if (!current) return

    const correct =
      given.trim().toLowerCase() === current.answer.trim().toLowerCase()

    const answer: Answer = {
      questionId: current.id,
      given,
      correct,
      difficulty: current.difficulty,
    }
    const nextAnswers = [...answers, answer]

    // Reached the test length? We're done.
    if (nextAnswers.length >= TEST_LENGTH) {
      set({ answers: nextAnswers, current: null, finished: true })
      return
    }

    const newLevel = nextLevel(level, correct)
    const next = pickQuestion(bank, newLevel, usedIds)

    // Ran out of questions early — finish gracefully.
    if (!next) {
      set({ answers: nextAnswers, current: null, finished: true })
      return
    }

    set({
      answers: nextAnswers,
      level: newLevel,
      current: next,
      usedIds: [...usedIds, next.id],
    })
  },
}))

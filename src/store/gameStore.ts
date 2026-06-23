import { create } from 'zustand'
import type { Answer, Question } from '../types'
import { startAdaptive, nextLevel } from '../lib/adaptivity'
import { generateQuestion } from '../lib/generators'

export const TEST_LENGTH = 12

interface TestState {
  current: Question | null
  answers: Answer[]
  // Map of questionId → Question so Results can look them up without a static bank.
  questionMap: Record<string, Question>
  level: number
  usedIds: string[]
  finished: boolean

  start: () => void
  submit: (given: string) => void
}

export const useTest = create<TestState>((set, get) => ({
  current: null,
  answers: [],
  questionMap: {},
  level: startAdaptive.level,
  usedIds: [],
  finished: false,

  start: () => {
    const first = generateQuestion(startAdaptive.level, [])
    set({
      current: first,
      answers: [],
      questionMap: first ? { [first.id]: first } : {},
      level: startAdaptive.level,
      usedIds: first ? [first.id] : [],
      finished: false,
    })
  },

  submit: (given: string) => {
    const { current, answers, level, usedIds, questionMap } = get()
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

    if (nextAnswers.length >= TEST_LENGTH) {
      set({ answers: nextAnswers, current: null, finished: true })
      return
    }

    const newLevel = nextLevel(level, correct)
    const next = generateQuestion(newLevel, usedIds)

    if (!next) {
      set({ answers: nextAnswers, current: null, finished: true })
      return
    }

    set({
      answers: nextAnswers,
      questionMap: { ...questionMap, [next.id]: next },
      level: newLevel,
      current: next,
      usedIds: [...usedIds, next.id],
    })
  },
}))

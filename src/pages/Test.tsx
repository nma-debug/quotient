import { useEffect } from 'react'
import { useTest } from '../store/gameStore'
import { MIN_QUESTIONS, progressToResult } from '../lib/ability'
import { QuestionCard } from '../components/QuestionCard'

interface Props {
  onComplete: () => void
}

export function Test({ onComplete }: Props) {
  const current = useTest((s) => s.current)
  const answers = useTest((s) => s.answers)
  const finished = useTest((s) => s.finished)
  const ability = useTest((s) => s.ability)
  const submit = useTest((s) => s.submit)
  const mode = useTest((s) => s.mode)
  const legStart = useTest((s) => s.legStart)
  const legTarget = useTest((s) => s.legTarget)

  // When the store flips to finished, move to results.
  useEffect(() => {
    if (finished) onComplete()
  }, [finished, onComplete])

  if (!current) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-mist/30 border-t-coral" />
      </div>
    )
  }

  const extending = mode === 'extend'
  const progress = extending
    ? (answers.length - legStart) / Math.max(1, legTarget - legStart)
    : progressToResult(ability)

  const status = extending
    ? 'Sharpening your score'
    : answers.length < MIN_QUESTIONS
      ? 'Calibrating'
      : 'Homing in on your score'

  // In an extend round we know the last question; in adaptive mode we never do.
  const lastInRound = extending && answers.length + 1 >= legTarget

  return (
    <div className="flex min-h-screen items-center px-5 py-10">
      <QuestionCard
        key={current.id}
        question={current}
        count={answers.length + 1}
        progress={progress}
        status={status}
        lastInRound={lastInRound}
        onAnswer={submit}
      />
    </div>
  )
}

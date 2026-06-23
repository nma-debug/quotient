import { useEffect } from 'react'
import { useTest, TEST_LENGTH } from '../store/gameStore'
import { QuestionCard } from '../components/QuestionCard'

interface Props {
  onComplete: () => void
}

export function Test({ onComplete }: Props) {
  const { current, answers, finished, start, submit } = useTest()

  // Begin a fresh test when this screen mounts.
  useEffect(() => {
    start()
  }, [start])

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

  return (
    <div className="flex min-h-screen items-center px-5 py-10">
      <QuestionCard
        key={current.id}
        question={current}
        index={answers.length}
        total={TEST_LENGTH}
        onAnswer={submit}
      />
    </div>
  )
}

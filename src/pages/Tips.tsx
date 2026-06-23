import { ArrowRight } from 'lucide-react'
import { PageLayout, Section } from '../components/PageLayout'

interface Props {
  onBack: () => void
  onNav: (route: string) => void
  onStart: () => void
}

export function Tips({ onBack, onNav, onStart }: Props) {
  return (
    <PageLayout eyebrow="Tips" title="Tips to sharpen your score" onBack={onBack} onNav={onNav}>
      <p className="font-body leading-relaxed text-mist">
        The test adapts to you, so it naturally finds your level — but a few habits help you think
        clearly under each puzzle type.
      </p>

      <Section title="Don't panic at hard ones">
        <p>
          Because difficulty rises when you're right, hitting a tough puzzle usually means you're
          doing well. Getting roughly half of the hardest ones is expected.
        </p>
      </Section>

      <Section title="Sequences: test more than one rule">
        <p>
          Before answering, check the gaps between terms. Is it a constant difference, a ratio, a
          growing gap, or two sequences interleaved? Glance at the first two gaps to decide.
        </p>
      </Section>

      <Section title="Analogies: name the relationship first">
        <p>
          Put the link into words — "is the opposite of", "is a part of", "is used to". Then apply
          that exact relationship to the second pair before reading the options.
        </p>
      </Section>

      <Section title="Odd one out: find the shared rule">
        <p>
          Look for the property three of the four share — a category, a number property, a function —
          then the outlier is whatever breaks it.
        </p>
      </Section>

      <Section title="Logic: order the facts">
        <p>
          For ranking puzzles, quickly line everyone up from highest to lowest on scratch paper or in
          your head, then read off the answer.
        </p>
      </Section>

      <Section title="Use the shortcuts">
        <p>
          Press <span className="font-mono text-paper">1</span>–<span className="font-mono text-paper">4</span>{' '}
          to choose an option and <span className="font-mono text-paper">Enter</span> to submit. And
          remember: from your results you can answer more puzzles to tighten the estimate.
        </p>
      </Section>

      <button onClick={onStart} className="btn-primary">
        Start the test <ArrowRight size={20} />
      </button>
    </PageLayout>
  )
}

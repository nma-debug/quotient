import { PageLayout, Section } from '../components/PageLayout'

interface Props {
  onBack: () => void
  onNav: (route: string) => void
}

export function Terms({ onBack, onNav }: Props) {
  return (
    <PageLayout eyebrow="Terms" title="Terms of use" onBack={onBack} onNav={onNav}>
      <p className="font-body leading-relaxed text-mist">
        By using Quotient you agree to these terms. They're intentionally short and written in plain
        language.
      </p>

      <Section title="It's for fun">
        <p>
          Quotient is an entertainment product. It is <strong>not</strong> an IQ test, and not a
          psychological, medical, educational or diagnostic assessment. Scores are playful estimates
          based on a handful of puzzles and should not be used to make any decision about yourself or
          anyone else.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          The game is provided "as is", without warranties of any kind. We don't guarantee that it
          will be accurate, uninterrupted, or error-free, and we may change or discontinue features
          at any time.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>
          Please don't attempt to disrupt the service, scrape it at scale, or copy its puzzle content
          for redistribution. The puzzles, design and code are the property of their creators.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, we are not liable for any damages arising from your
          use of the game.
        </p>
      </Section>

      <Section title="Changes">
        <p>These terms may be updated over time; continued use means you accept the current version.</p>
      </Section>
    </PageLayout>
  )
}

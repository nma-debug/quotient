import { PageLayout, Section } from '../components/PageLayout'

interface Props {
  onBack: () => void
  onNav: (route: string) => void
}

export function Privacy({ onBack, onNav }: Props) {
  return (
    <PageLayout eyebrow="Privacy" title="Privacy policy" onBack={onBack} onNav={onNav}>
      <p className="font-body leading-relaxed text-mist">
        Quotient is designed to be private by default. We don't ask you to sign up, and we don't
        collect personal information. This page explains what is and isn't stored.
      </p>

      <Section title="What we store">
        <p>
          Two small pieces of data are saved in your browser's <em>local storage</em> — on your
          device only:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your best Quotient score, so we can show your personal best.</li>
          <li>
            A short list of recently-seen puzzle ids, so replays don't repeat the same questions.
          </li>
        </ul>
        <p>
          This data never leaves your device and is not sent to any server. You can erase it any time
          from the{' '}
          <button onClick={() => onNav('about')} className="text-iris underline underline-offset-4">
            About page
          </button>{' '}
          or by clearing your browser data.
        </p>
      </Section>

      <Section title="What we don't collect">
        <p>
          No accounts, no names, no email addresses, no location, and no analytics or behavioural
          tracking are built into the game itself.
        </p>
      </Section>

      <Section title="Advertising">
        <p>
          If advertising is shown on the site, ad providers may use cookies or similar technologies
          to serve and measure ads, in line with their own privacy policies. Any such use is governed
          by those third parties, not by Quotient.
        </p>
      </Section>

      <Section title="Children">
        <p>
          Quotient is a general-audience puzzle game and does not knowingly collect data from
          anyone, including children.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may update this policy as the site evolves. Material changes will be reflected on this
          page.
        </p>
      </Section>
    </PageLayout>
  )
}

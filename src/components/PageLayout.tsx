import type { ReactNode } from 'react'
import { Brain, ArrowLeft } from 'lucide-react'
import { SiteFooter } from './SiteFooter'

interface Props {
  eyebrow: string
  title: ReactNode
  children: ReactNode
  onBack: () => void
  onNav: (route: string) => void
}

/** Shared chrome for the static info pages (About, Privacy, Terms, Tips). */
export function PageLayout({ eyebrow, title, children, onBack, onNav }: Props) {
  return (
    <div className="mx-auto min-h-screen max-w-2xl px-5 py-10">
      <header className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-body text-sm text-mist hover:text-paper"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={() => onNav('')} className="flex items-center gap-2">
          <Brain className="text-coral" size={20} />
          <span className="font-display text-base font-bold tracking-tight">Quotient</span>
        </button>
      </header>

      <main className="py-10">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mt-3 text-4xl leading-[1.1] sm:text-5xl">{title}</h1>
        <div className="mt-8 space-y-8">{children}</div>
      </main>

      <SiteFooter onNav={onNav} />
    </div>
  )
}

/** A titled prose section used across the info pages. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-paper">{title}</h2>
      <div className="mt-3 space-y-3 font-body leading-relaxed text-mist">{children}</div>
    </section>
  )
}

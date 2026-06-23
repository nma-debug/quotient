import { Disclaimer } from './Disclaimer'

const LINKS: [label: string, route: string][] = [
  ['Home', ''],
  ['About', 'about'],
  ['Tips', 'tips'],
  ['Privacy', 'privacy'],
  ['Terms', 'terms'],
]

export function SiteFooter({ onNav }: { onNav: (route: string) => void }) {
  return (
    <footer className="mt-12 border-t border-mist/15 pt-6">
      <nav className="mb-4 flex flex-wrap gap-x-5 gap-y-2">
        {LINKS.map(([label, route]) => (
          <button
            key={label}
            onClick={() => onNav(route)}
            className="font-body text-sm text-mist underline-offset-4 hover:text-paper hover:underline"
          >
            {label}
          </button>
        ))}
      </nav>
      <Disclaimer />
    </footer>
  )
}

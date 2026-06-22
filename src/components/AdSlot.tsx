/**
 * AdSlot — placeholder for where an ad would go.
 *
 * This renders a clearly-labelled empty slot so you can see the layout. It does
 * NOT load any real ad network yet. When you're ready to monetise:
 *   1. Create a Google AdSense account and get approved.
 *   2. Add the AdSense script tag to index.html.
 *   3. Replace the placeholder markup below with your <ins class="adsbygoogle"> unit.
 *
 * Keep ads off any surface aimed at children. Quotient is a general-audience app,
 * so a single, non-intrusive slot on the results screen is a sensible start.
 */
export function AdSlot({ label = 'Advertisement' }: { label?: string }) {
  return (
    <div
      className="flex h-24 w-full items-center justify-center rounded-2xl border border-dashed border-mist/25 bg-ink-700/40"
      aria-label="advertisement placeholder"
    >
      <span className="eyebrow">{label}</span>
    </div>
  )
}

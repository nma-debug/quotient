/**
 * The disclaimer that keeps Quotient honestly framed as a fun estimate,
 * not a clinical or validated IQ test. Shown on the home and results screens.
 */
export function Disclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`font-body text-sm leading-relaxed text-mist ${className}`}>
      Quotient is a brain game made for fun. It is{' '}
      <span className="text-paper">not a clinical or validated IQ test</span>, and your
      score is only a light-hearted estimate for entertainment — not a measure of
      intelligence, ability, or worth.
    </p>
  )
}

/**
 * Remembers which questions were served in recent sittings (across page reloads)
 * so replays don't repeat the same puzzles. Stored in localStorage as a rolling
 * list of question ids, newest last, capped at RECENT_CAP.
 */

const KEY = 'quotient_recent_qs'
const RECENT_CAP = 90

export function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/** Append freshly-served ids, drop duplicates (keeping most recent), cap the list. */
export function pushRecent(ids: string[]): void {
  if (!ids.length) return
  try {
    const merged = [...loadRecent(), ...ids]
    // De-dup keeping the LAST occurrence (most recent), then cap to the newest RECENT_CAP.
    const seen = new Set<string>()
    const deduped: string[] = []
    for (let i = merged.length - 1; i >= 0; i--) {
      if (!seen.has(merged[i])) {
        seen.add(merged[i])
        deduped.push(merged[i])
      }
    }
    deduped.reverse()
    localStorage.setItem(KEY, JSON.stringify(deduped.slice(-RECENT_CAP)))
  } catch { /* ignore */ }
}

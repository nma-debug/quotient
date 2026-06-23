import { useSyncExternalStore } from 'react'

/**
 * Minimal hash-based router. Hash routing works on static hosting (Cloudflare
 * Pages) with no server-side redirect config, and gives shareable URLs for the
 * info pages (#/about, #/privacy, …). The game flow itself is driven by store
 * state rather than the URL.
 */

function getRoute(): string {
  return window.location.hash.replace(/^#\/?/, '')
}

function subscribe(cb: () => void): () => void {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export function useHashRoute(): string {
  return useSyncExternalStore(subscribe, getRoute, () => '')
}

export function navigate(route: string): void {
  window.location.hash = route ? `#/${route}` : '#/'
  // Jump to top when changing pages.
  window.scrollTo({ top: 0 })
}

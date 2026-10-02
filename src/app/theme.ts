import { useEffect } from 'react'
import { useProgress } from '@/progress/store'

/** Mirror theme and motion settings onto <html> so CSS tokens follow them. */
export function useApplySettings() {
  const theme = useProgress((s) => s.settings.theme)
  const reducedMotion = useProgress((s) => s.settings.reducedMotion)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reducedMotion)
  }, [reducedMotion])
}

/** True when animations should be skipped (OS setting or in-app toggle). */
export function prefersReducedMotion(): boolean {
  if (document.documentElement.dataset.reducedMotion === 'true') return true
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    document.title = title ? `${title} · Applied Maths Lab` : 'Applied Maths Lab'
  }, [title])
}

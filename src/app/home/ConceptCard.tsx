import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { areaOf, conceptById } from '@/curriculum'
import type { ConceptId } from '@/curriculum/types'
import { hasDeepLab } from '@/labs/registry'
import { StatusIcon } from '@/map/StatusIcon'
import { useNodeState } from '@/progress/selectors'
import { AreaDot } from '@/ui/Card'

/** A concept as a clickable card: status, title, one-line summary, area and time. */
export function ConceptCard({ id, emphasis }: { id: ConceptId; emphasis?: string }) {
  const c = conceptById.get(id)!
  const state = useNodeState(id)
  const area = areaOf(c.domain)
  return (
    <Link
      to={`/learn/${id}`}
      className="group flex h-full items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <StatusIcon state={state} className="mt-0.5" />
      <span className="min-w-0 flex-1">
        {emphasis && (
          <span className="mb-0.5 block text-xs font-semibold tracking-[0.06em] text-accent uppercase">
            {emphasis}
          </span>
        )}
        <span className="font-semibold">{c.title}</span>
        <span className="mt-0.5 block text-sm text-ink-2">{c.summary}</span>
        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
          <span className="inline-flex items-center gap-1.5">
            <AreaDot color={area.color} />
            {area.title}
          </span>
          <span>~{c.estMinutes} min</span>
          {hasDeepLab(id) && (
            <span className="inline-flex items-center gap-1 text-accent">
              <Sparkles className="size-3.5" aria-hidden />
              Deep lab
            </span>
          )}
        </span>
      </span>
      <ArrowRight
        className="mt-0.5 size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  )
}

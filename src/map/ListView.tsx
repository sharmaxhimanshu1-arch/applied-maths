import { Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { AREAS, CONCEPTS, DOMAINS, graph } from '@/curriculum'
import { LEVEL_LABEL } from '@/curriculum/levels'
import { hasDeepLab } from '@/labs/registry'
import { countDone, NODE_STATE_LABEL, nodeState } from '@/progress/selectors'
import { useProgress } from '@/progress/store'
import { AreaDot } from '@/ui/Card'
import { cn } from '@/ui/cn'
import { StatusIcon } from './StatusIcon'

/** The whole map as an outline: areas → domains → concepts in study order. */
export function ListView({
  trackSet,
  compactTop = false,
}: {
  trackSet: ReadonlySet<string>
  /** Less top padding when something (the path panel) already sits under the toolbar. */
  compactTop?: boolean
}) {
  const concepts = useProgress((s) => s.concepts)
  return (
    <div
      className={cn('mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6', compactTop ? 'pt-6' : 'pt-20')}
    >
      {AREAS.map((area) => (
        <section key={area.id} className="mt-8 first:mt-0">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <AreaDot color={area.color} className="size-3" />
            {area.title}
          </h2>
          <p className="mt-1 text-sm text-ink-2">{area.blurb}</p>
          {DOMAINS.filter((d) => d.area === area.id).map((domain) => {
            const items = CONCEPTS.filter((c) => c.domain === domain.id).sort(
              (a, b) => graph.topoIndex.get(a.id)! - graph.topoIndex.get(b.id)!,
            )
            const { done, total } = countDone(
              concepts,
              items.map((c) => c.id),
            )
            return (
              <div
                key={domain.id}
                className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface"
              >
                <h3 className="flex items-center justify-between border-b border-line px-4 py-2.5 text-sm font-semibold">
                  {domain.title}
                  <span className="tabular text-xs font-medium text-ink-3">
                    {done}/{total}
                  </span>
                </h3>
                <ul>
                  {items.map((c) => {
                    const state = nodeState(concepts, c.id)
                    const inTrack = trackSet.has(c.id)
                    return (
                      <li key={c.id} className="border-b border-line last:border-b-0">
                        <Link
                          to={`/learn/${c.id}`}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 hover:bg-surface-2',
                            !inTrack && 'opacity-45',
                          )}
                        >
                          <StatusIcon state={state} />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5 font-medium">
                              {c.title}
                              {hasDeepLab(c.id) && (
                                <Sparkles
                                  className="size-3.5 text-accent"
                                  aria-label="Guided lab"
                                />
                              )}
                            </span>
                            <span className="block truncate text-sm text-ink-2">{c.summary}</span>
                          </span>
                          <span className="hidden text-right text-xs text-ink-3 sm:block">
                            {LEVEL_LABEL[c.level]}
                            <br />
                            <span className="sr-only">{NODE_STATE_LABEL[state]}, </span>
                            {c.estMinutes} min
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}

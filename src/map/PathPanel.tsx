import { PartyPopper, Route, X } from 'lucide-react'
import { conceptById, graph } from '@/curriculum'
import type { ConceptId } from '@/curriculum/types'
import { isDone, nodeState } from '@/progress/selectors'
import { useProgress } from '@/progress/store'
import { IconButton } from '@/ui/Button'
import { cn } from '@/ui/cn'
import { StatusIcon } from './StatusIcon'

type Props = {
  goal: ConceptId
  onSelect: (id: ConceptId) => void
  onClose: () => void
  className?: string
}

/** The learner's personal route to their goal, in study order. */
export function PathPanel({ goal, onSelect, onClose, className }: Props) {
  const concepts = useProgress((s) => s.concepts)
  const setGoal = useProgress((s) => s.setGoal)
  const done = (id: ConceptId) => isDone(concepts, id)
  const total = graph.closure([goal]).size
  const path = graph.learningPath(goal, done)
  const completed = total - path.length
  const goalConcept = conceptById.get(goal)!

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-lg',
        className,
      )}
    >
      <div className="flex items-start gap-2 border-b border-line p-4">
        <Route className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold tracking-wide text-ink-3 uppercase">
            Your path to
          </div>
          <div className="truncate font-semibold">{goalConcept.title}</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-ink-2">
            {completed} of {total} done · {path.length} to go
          </div>
        </div>
        <IconButton label="Hide path" size="sm" onClick={onClose}>
          <X className="size-4" />
        </IconButton>
      </div>
      {path.length === 0 ? (
        <div className="flex items-center gap-2 p-4 text-sm">
          <PartyPopper className="size-5 text-accent" aria-hidden />
          You've reached your goal!
          <button
            type="button"
            className="ml-auto text-accent hover:underline"
            onClick={() => setGoal(null)}
          >
            Clear goal
          </button>
        </div>
      ) : (
        <ol className="min-h-0 flex-1 overflow-y-auto p-2">
          {path.map((id, i) => {
            const c = conceptById.get(id)!
            const state = nodeState(concepts, id)
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onSelect(id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface-2"
                >
                  <span className="tabular w-5 text-right text-xs text-ink-3">{i + 1}</span>
                  <StatusIcon state={state} className="size-3.5" />
                  <span className={cn('flex-1 truncate', state === 'locked' && 'text-ink-2')}>
                    {c.title}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

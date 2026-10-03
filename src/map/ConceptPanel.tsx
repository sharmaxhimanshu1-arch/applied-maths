import { ArrowRight, BookOpenCheck, Clock, Flag, RotateCcw, Sparkles, X } from 'lucide-react'
import { areaOf, conceptById, domainById, graph } from '@/curriculum'
import { LEVEL_LABEL } from '@/curriculum/levels'
import type { ConceptId } from '@/curriculum/types'
import { hasDeepLab } from '@/labs/registry'
import { isDone, NODE_STATE_LABEL, nodeState } from '@/progress/selectors'
import { useProgress } from '@/progress/store'
import { Button, ButtonLink, IconButton } from '@/ui/Button'
import { AreaDot } from '@/ui/Card'
import { cn } from '@/ui/cn'
import { StatusIcon } from './StatusIcon'

type Props = {
  id: ConceptId
  onSelect: (id: ConceptId) => void
  onClose?: () => void
  onShowPath?: () => void
  className?: string
}

export function ConceptPanel({ id, onSelect, onClose, onShowPath, className }: Props) {
  const concept = conceptById.get(id)!
  const concepts = useProgress((s) => s.concepts)
  const goal = useProgress((s) => s.goal)
  const setGoal = useProgress((s) => s.setGoal)
  const markKnown = useProgress((s) => s.markKnown)
  const resetConcept = useProgress((s) => s.resetConcept)

  const state = nodeState(concepts, id)
  const done = (x: ConceptId) => isDone(concepts, x)
  const area = areaOf(concept.domain)
  const remaining = graph.learningPath(id, done).filter((x) => x !== id)
  const prereqs = graph.prereqs.get(id)!
  const unlocks = graph.dependents.get(id)!
  const isGoal = goal === id

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-ink-2">
            <span className="flex items-center gap-1.5">
              <AreaDot color={area.color} />
              {domainById.get(concept.domain)!.title}
            </span>
            <span>{LEVEL_LABEL[concept.level]}</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {concept.estMinutes} min
            </span>
          </div>
          <h2 className="mt-1.5 text-xl leading-tight font-semibold">{concept.title}</h2>
        </div>
        {onClose && (
          <IconButton label="Close panel" size="sm" onClick={onClose} className="-mt-1 -mr-1">
            <X className="size-4.5" />
          </IconButton>
        )}
      </div>

      <p className="text-ink-2">{concept.summary}</p>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 font-medium">
          <StatusIcon state={state} className="size-3.5" />
          {NODE_STATE_LABEL[state]}
        </span>
        {hasDeepLab(id) && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 font-medium text-accent">
            <Sparkles className="size-3.5" aria-hidden />
            Guided lab
          </span>
        )}
      </div>

      {remaining.length > 0 && (
        <div className="rounded-xl border border-line bg-surface-2 p-3 text-sm text-ink-2">
          <p>
            <strong className="text-ink">{remaining.length}</strong>{' '}
            {remaining.length === 1 ? 'concept comes' : 'concepts come'} before this one on your
            map. You can open it anyway, or follow the path.
          </p>
          <button
            type="button"
            className="mt-2 font-medium text-accent hover:underline"
            onClick={() => {
              setGoal(id)
              onShowPath?.()
            }}
          >
            Show my path here →
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <ButtonLink
          to={`/learn/${id}`}
          variant="primary"
          icon={<ArrowRight className="size-4" aria-hidden />}
          className="flex-row-reverse"
        >
          Open lab
        </ButtonLink>
        <Button
          variant={isGoal ? 'soft' : 'secondary'}
          icon={<Flag className="size-4" aria-hidden />}
          onClick={() => {
            setGoal(isGoal ? null : id)
            if (!isGoal) onShowPath?.()
          }}
        >
          {isGoal ? 'Goal set' : 'Set as goal'}
        </Button>
      </div>

      <ConceptList
        title="Before this"
        empty="Nothing: a great place to start."
        ids={prereqs}
        onSelect={onSelect}
      />
      <ConceptList
        title="Unlocks"
        empty="This is a summit: nothing builds on it (yet)."
        ids={unlocks}
        onSelect={onSelect}
      />

      <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-4">
        {state === 'mastered' || state === 'known' ? (
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="size-4" aria-hidden />}
            onClick={() => resetConcept(id)}
          >
            Mark as not done
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              variant="ghost"
              icon={<BookOpenCheck className="size-4" aria-hidden />}
              onClick={() => markKnown([id])}
            >
              I already know this
            </Button>
            {remaining.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => markKnown(graph.closure([id]))}>
                …and everything before it
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ConceptList({
  title,
  ids,
  empty,
  onSelect,
}: {
  title: string
  ids: ConceptId[]
  empty: string
  onSelect: (id: ConceptId) => void
}) {
  const concepts = useProgress((s) => s.concepts)
  return (
    <section>
      <h3 className="text-xs font-semibold tracking-wide text-ink-3 uppercase">{title}</h3>
      {ids.length === 0 ? (
        <p className="mt-2 text-sm text-ink-2">{empty}</p>
      ) : (
        <ul className="mt-2 grid gap-1">
          {ids.map((pid) => {
            const c = conceptById.get(pid)!
            return (
              <li key={pid}>
                <button
                  type="button"
                  onClick={() => onSelect(pid)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface-2"
                >
                  <AreaDot color={areaOf(c.domain).color} />
                  <span className="flex-1 truncate">{c.title}</span>
                  <StatusIcon state={nodeState(concepts, pid)} className="size-3.5" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

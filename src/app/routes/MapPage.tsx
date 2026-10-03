import { Flag, X } from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { conceptById, trackById } from '@/curriculum'
import type { ConceptId } from '@/curriculum/types'
import { ConceptPanel } from '@/map/ConceptPanel'
import type { CenterRequest } from '@/map/KnowledgeMap'
import { Legend } from '@/map/Legend'
import { ListView } from '@/map/ListView'
import { MapFind } from '@/map/MapFind'
import { PathPanel } from '@/map/PathPanel'
import { isDone, recommendations, trackConcepts } from '@/progress/selectors'
import { useProgress } from '@/progress/store'
import { IconButton } from '@/ui/Button'
import { Dialog } from '@/ui/Dialog'
import { Segmented } from '@/ui/Segmented'
import { useMediaQuery } from '@/ui/useMediaQuery'
import { useDocumentTitle } from '../theme'

const KnowledgeMap = lazy(() =>
  import('@/map/KnowledgeMap').then((m) => ({ default: m.KnowledgeMap })),
)

type View = 'map' | 'list'

function validId(id: string | null): ConceptId | null {
  return id && conceptById.has(id) ? id : null
}

export function MapPage() {
  useDocumentTitle('Knowledge map')
  const [params, setParams] = useSearchParams()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const goal = useProgress((s) => s.goal)
  const setGoal = useProgress((s) => s.setGoal)
  const track = useProgress((s) => s.track)
  const setTrack = useProgress((s) => s.setTrack)
  const concepts = useProgress((s) => s.concepts)

  const goalParam = validId(params.get('goal'))
  const [selected, setSelected] = useState<ConceptId | null>(() => validId(params.get('focus')))
  const [hovered, setHovered] = useState<ConceptId | null>(null)
  const [view, setView] = useState<View>(() =>
    params.get('view') === 'list' || (params.get('view') !== 'map' && window.innerWidth < 768)
      ? 'list'
      : 'map',
  )
  const [pathMode, setPathMode] = useState(() => !!goalParam || !!goal)
  const [centerRequest, setCenterRequest] = useState<CenterRequest>(null)
  const trackSet = useMemo(() => trackConcepts(track), [track])

  // A ?goal= link (e.g. from the home page) sets the learner's goal.
  useEffect(() => {
    if (goalParam) setGoal(goalParam)
  }, [goalParam, setGoal])

  // A ?track= link switches the highlighted track.
  const trackParam = params.get('track')
  useEffect(() => {
    if (trackParam && trackById.has(trackParam)) setTrack(trackParam)
  }, [trackParam, setTrack])

  // Where the camera starts: the focused concept, else the next step towards the goal.
  const [initialFocus] = useState<ConceptId>(
    () =>
      validId(params.get('focus')) ??
      recommendations({ concepts, goal: goalParam ?? goal, track }, 1)[0] ??
      'number-line',
  )

  const select = useCallback(
    (id: ConceptId | null, center = false) => {
      setSelected(id)
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (id) next.set('focus', id)
          else next.delete('focus')
          next.delete('goal')
          return next
        },
        { replace: true },
      )
      if (id && center) setCenterRequest({ id, nonce: Date.now() })
    },
    [setParams],
  )

  const goalConcept = goal ? conceptById.get(goal) : undefined
  const goalReached = goal ? isDone(concepts, goal) : false

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <h1 className="sr-only">Knowledge map</h1>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start gap-2 p-3">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface/90 p-1.5 shadow-md backdrop-blur">
          <Segmented
            label="View"
            size="sm"
            value={view}
            onChange={setView}
            options={[
              { value: 'map', label: 'Map' },
              { value: 'list', label: 'List' },
            ]}
          />
          <Segmented
            label="Track"
            size="sm"
            value={track === 'ml' ? 'ml' : 'full'}
            onChange={setTrack}
            options={[
              { value: 'full', label: 'Everything', title: 'Full Journey: all concepts' },
              { value: 'ml', label: 'ML track', title: 'Math for ML & Data Science' },
            ]}
          />
          {goalConcept && (
            <span className="flex items-center rounded-xl bg-accent-soft pl-2.5 text-xs font-medium text-accent">
              <button
                type="button"
                onClick={() => setPathMode((m) => !m)}
                aria-pressed={pathMode}
                className="flex items-center gap-1.5 py-1.5"
                title={pathMode ? 'Hide path' : 'Show path'}
              >
                <Flag className="size-3.5" aria-hidden />
                <span className="max-w-40 truncate">
                  {goalReached ? 'Reached: ' : 'Goal: '}
                  {goalConcept.short ?? goalConcept.title}
                </span>
              </button>
              <IconButton
                label="Clear goal"
                size="sm"
                className="size-7 text-accent"
                onClick={() => setGoal(null)}
              >
                <X className="size-3.5" />
              </IconButton>
            </span>
          )}
        </div>
        <div className="pointer-events-auto ml-auto flex items-center gap-2">
          {view === 'map' && <MapFind onPick={(id) => select(id, true)} />}
          <Legend />
        </div>
      </div>

      {view === 'map' ? (
        <div className="relative h-[calc(100dvh-3.5rem)] min-h-[420px] w-full">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-ink-2">
                Drawing the map…
              </div>
            }
          >
            <KnowledgeMap
              selected={selected}
              hovered={isDesktop ? hovered : null}
              onSelect={(id) => select(id)}
              onHover={setHovered}
              goal={goal}
              pathMode={pathMode}
              trackSet={trackSet}
              initialFocus={initialFocus}
              centerRequest={centerRequest}
              panelOpen={isDesktop && !!selected}
            />
          </Suspense>

          {goal && pathMode && (
            <PathPanel
              goal={goal}
              onSelect={(id) => select(id, true)}
              onClose={() => setPathMode(false)}
              className="absolute bottom-3 left-3 z-10 max-h-[45%] w-[min(20rem,calc(100%-1.5rem))] md:top-20 md:bottom-auto md:max-h-[calc(100%-6.5rem)]"
            />
          )}

          {selected && isDesktop && (
            <aside
              aria-label="Concept details"
              className="absolute top-3 right-3 bottom-3 z-30 flex w-[22rem] flex-col overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-lg"
            >
              <ConceptPanel
                key={selected}
                id={selected}
                onSelect={(id) => select(id, true)}
                onClose={() => select(null)}
                onShowPath={() => setPathMode(true)}
                className="min-h-full"
              />
            </aside>
          )}
        </div>
      ) : (
        <>
          {goal && pathMode && (
            <div className="mx-auto w-full max-w-4xl px-4 pt-20 sm:px-6">
              <PathPanel
                goal={goal}
                onSelect={(id) => select(id)}
                onClose={() => setPathMode(false)}
                className="max-h-80"
              />
            </div>
          )}
          <ListView trackSet={trackSet} compactTop={!!(goal && pathMode)} />
        </>
      )}

      {selected && !isDesktop && (
        <Dialog
          open
          onClose={() => select(null)}
          title={conceptById.get(selected)!.title}
          hideTitle
          variant="side"
        >
          <ConceptPanel
            key={selected}
            id={selected}
            onSelect={(id) => select(id, true)}
            onShowPath={() => setPathMode(true)}
          />
        </Dialog>
      )}
    </div>
  )
}

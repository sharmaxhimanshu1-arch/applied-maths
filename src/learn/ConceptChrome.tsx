import {
  ArrowRight,
  BookOpenCheck,
  ChevronRight,
  CircleCheck,
  Clock,
  Flag,
  Map as MapIcon,
  PartyPopper,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { areaOf, conceptById, domainById, graph } from '@/curriculum'
import { LEVEL_LABEL } from '@/curriculum/levels'
import type { Concept, ConceptId } from '@/curriculum/types'
import { hasDeepLab } from '@/labs/registry'
import { StatusIcon } from '@/map/StatusIcon'
import { isDone, NODE_STATE_LABEL, nodeState } from '@/progress/selectors'
import { useProgress } from '@/progress/store'
import { Button, ButtonLink, IconButton } from '@/ui/Button'
import { AreaDot } from '@/ui/Card'
import { ProgressRing } from '@/ui/ProgressRing'
import { cn } from '@/ui/cn'
import { useLab, useMasteryProgress } from './lab-context'

export function ConceptHeader({ concept }: { concept: Concept }) {
  const concepts = useProgress((s) => s.concepts)
  const goal = useProgress((s) => s.goal)
  const setGoal = useProgress((s) => s.setGoal)
  const markKnown = useProgress((s) => s.markKnown)
  const resetConcept = useProgress((s) => s.resetConcept)
  const state = nodeState(concepts, concept.id)
  const area = areaOf(concept.domain)
  const done = state === 'mastered' || state === 'known'

  return (
    <header className="pt-8 sm:pt-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-2">
        <Link to="/map" className="hover:text-ink">
          Map
        </Link>
        <ChevronRight className="size-3.5 text-ink-3" aria-hidden />
        <Link
          to={`/map?view=list`}
          className="flex items-center gap-1.5 hover:text-ink"
          title={area.title}
        >
          <AreaDot color={area.color} />
          {domainById.get(concept.domain)!.title}
        </Link>
      </nav>
      <h1 className="mt-3 max-w-3xl text-[2rem] leading-tight font-semibold sm:text-[2.6rem]">
        {concept.title}
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-2 sm:text-xl">{concept.summary}</p>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 font-medium">
          <StatusIcon state={state} className="size-3.5" />
          {NODE_STATE_LABEL[state]}
        </span>
        {hasDeepLab(concept.id) && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 font-medium text-accent">
            <Sparkles className="size-3.5" aria-hidden />
            Guided lab
          </span>
        )}
        <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-ink-2">
          {LEVEL_LABEL[concept.level]}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-ink-2">
          <Clock className="size-3.5" aria-hidden />
          {concept.estMinutes} min
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <ButtonLink
          to={`/map?view=map&focus=${concept.id}`}
          size="sm"
          icon={<MapIcon className="size-4" aria-hidden />}
        >
          See on map
        </ButtonLink>
        <Button
          size="sm"
          variant={goal === concept.id ? 'soft' : 'secondary'}
          icon={<Flag className="size-4" aria-hidden />}
          onClick={() => setGoal(goal === concept.id ? null : concept.id)}
        >
          {goal === concept.id ? 'Your goal' : 'Set as goal'}
        </Button>
        {done ? (
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="size-4" aria-hidden />}
            onClick={() => resetConcept(concept.id)}
          >
            Mark as not done
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            icon={<BookOpenCheck className="size-4" aria-hidden />}
            onClick={() => markKnown([concept.id])}
          >
            I already know this
          </Button>
        )}
      </div>
    </header>
  )
}

/** The concept's place in the tree: what it builds on (with status). */
export function BuildsOn({ concept }: { concept: Concept }) {
  const concepts = useProgress((s) => s.concepts)
  const prereqs = graph.prereqs.get(concept.id)!
  if (!prereqs.length) return null
  const missing = prereqs.filter((p) => !isDone(concepts, p))
  return (
    <div
      className={cn(
        'mt-6 rounded-2xl border p-4',
        missing.length ? 'border-line bg-surface-2/70' : 'border-line bg-surface',
      )}
    >
      <div className="text-sm font-medium">
        Builds on{' '}
        <span className="font-normal text-ink-2">
          {missing.length
            ? '· dive in anyway, or review these first if something feels unfamiliar'
            : '· you have these covered'}
        </span>
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-2">
        {prereqs.map((id) => {
          const c = conceptById.get(id)!
          return (
            <li key={id}>
              <Link
                to={`/learn/${id}`}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm shadow-sm hover:bg-surface-2"
              >
                <StatusIcon state={nodeState(concepts, id)} className="size-3.5" />
                {c.title}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Table of contents with the section currently on screen highlighted. */
export function LabToc() {
  const { sections } = useLab()
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(`section-${s.id}`))
      .filter((e): e is HTMLElement => !!e)
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) setActive(visible[0].target.id.replace('section-', ''))
      },
      { rootMargin: '-80px 0px -60% 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [sections])

  if (!sections.length) return null
  return (
    <nav aria-label="On this page">
      <div className="text-xs font-semibold tracking-wide text-ink-3 uppercase">On this page</div>
      <ul className="mt-2 grid gap-0.5 border-l border-line">
        {sections.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById(`section-${s.id}`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className={cn(
                '-ml-px border-l-2 py-1 pl-3 text-left text-sm transition-colors',
                active === s.id
                  ? 'border-accent font-medium text-ink'
                  : 'border-transparent text-ink-2 hover:text-ink',
              )}
            >
              {s.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function MasteryMeter({ conceptId }: { conceptId: ConceptId }) {
  const { solved, total } = useMasteryProgress()
  const status = useProgress((s) => s.concepts[conceptId]?.status)
  if (status === 'mastered')
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-3 text-sm font-medium">
        <CircleCheck className="size-5" style={{ color: 'var(--good)' }} aria-hidden />
        Mastered
      </div>
    )
  if (!total) return null
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
      <ProgressRing
        value={solved / total}
        size={40}
        label={`${solved} of ${total} challenges solved`}
      />
      <div className="text-sm">
        <div className="font-medium">
          {solved} of {total} solved
        </div>
        <div className="text-ink-2">Solve them all to master it</div>
      </div>
    </div>
  )
}

/** Where to go next: what this unlocks, and the next step toward the goal. */
export function WhatsNext({ concept }: { concept: Concept }) {
  const concepts = useProgress((s) => s.concepts)
  const goal = useProgress((s) => s.goal)
  const unlocks = graph.dependents.get(concept.id)!
  const done = (id: ConceptId) => isDone(concepts, id)
  const nextOnPath =
    goal && goal !== concept.id
      ? graph
          .learningPath(goal, done)
          .find((id) => id !== concept.id && graph.prereqs.get(id)!.every(done))
      : undefined

  return (
    <section aria-labelledby="whats-next" className="border-t border-line pt-10">
      <h2 id="whats-next" className="text-xl font-semibold">
        What this unlocks
      </h2>
      {unlocks.length === 0 ? (
        <p className="mt-2 text-ink-2">
          This is a summit of the map: nothing builds on it yet. Pick a new goal on the map.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {unlocks.map((id) => {
            const c = conceptById.get(id)!
            const state = nodeState(concepts, id)
            return (
              <li key={id}>
                <Link
                  to={`/learn/${id}`}
                  className="group flex h-full items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <StatusIcon state={state} className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold">{c.title}</span>
                    <span className="mt-0.5 block text-sm text-ink-2">{c.summary}</span>
                  </span>
                  <ArrowRight
                    className="mt-0.5 size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      {nextOnPath && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-accent-soft p-4">
          <Flag className="size-5 text-accent" aria-hidden />
          <span className="text-sm">
            Next on your path to <strong>{conceptById.get(goal!)!.title}</strong>:
          </span>
          <ButtonLink to={`/learn/${nextOnPath}`} size="sm" variant="primary">
            {conceptById.get(nextOnPath)!.title}
          </ButtonLink>
        </div>
      )}
    </section>
  )
}

/** Celebration when the learner masters the concept on this page. */
export function MasteryToast({ concept }: { concept: Concept }) {
  const { justMastered, dismissMastery } = useLab()
  const concepts = useProgress((s) => s.concepts)
  useEffect(() => {
    if (!justMastered) return
    const t = setTimeout(dismissMastery, 12000)
    return () => clearTimeout(t)
  }, [justMastered, dismissMastery])
  if (!justMastered) return null
  const ready = graph.dependents
    .get(concept.id)!
    .filter((id) => graph.prereqs.get(id)!.every((p) => isDone(concepts, p)))
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md animate-[rise_300ms_ease] items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-lg"
    >
      <PartyPopper className="mt-0.5 size-6 shrink-0 text-accent" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="font-semibold">Mastered: {concept.title}!</div>
        {ready.length > 0 ? (
          <div className="mt-1 text-sm text-ink-2">
            Now ready:{' '}
            {ready.map((id, i) => (
              <span key={id}>
                {i > 0 && ', '}
                <Link className="font-medium text-accent hover:underline" to={`/learn/${id}`}>
                  {conceptById.get(id)!.title}
                </Link>
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-1 text-sm text-ink-2">It's lit up on your map.</div>
        )}
      </div>
      <IconButton label="Dismiss" size="sm" onClick={dismissMastery}>
        <X className="size-4" />
      </IconButton>
    </div>
  )
}

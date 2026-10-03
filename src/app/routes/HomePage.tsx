import {
  ArrowRight,
  BrainCircuit,
  Compass,
  Flame,
  Map as MapIcon,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { AREAS, CONCEPTS, DOMAINS, TRACKS, conceptById } from '@/curriculum'
import { DEEP_LAB_IDS } from '@/labs/registry'
import {
  countDone,
  domainCounts,
  recommendations,
  streak,
  trackConcepts,
  useReviewSummary,
} from '@/progress/selectors'
import { useProgress } from '@/progress/store'
import { Button, ButtonLink } from '@/ui/Button'
import { ProgressRing } from '@/ui/ProgressRing'
import { cn } from '@/ui/cn'
import { DOMAIN_ICONS } from '../icons'
import { ConceptCard } from '../home/ConceptCard'
import { HeroWave } from '../home/HeroWave'
import { Onboarding } from '../home/Onboarding'
import { useDocumentTitle } from '../theme'

export function HomePage() {
  useDocumentTitle(undefined)
  const concepts = useProgress((s) => s.concepts)
  const goal = useProgress((s) => s.goal)
  const track = useProgress((s) => s.track)
  const onboarded = useProgress((s) => s.onboarded)
  const lastVisited = useProgress((s) => s.lastVisited)
  const activity = useProgress((s) => s.activity)
  const setTrack = useProgress((s) => s.setTrack)
  const [onboarding, setOnboarding] = useState(false)
  const { due } = useReviewSummary()
  const next = recommendations({ concepts, goal, track }, 4).filter((id) => id !== lastVisited)
  const overall = countDone(
    concepts,
    CONCEPTS.map((c) => c.id),
  )
  const days = streak(activity)
  const resume = lastVisited && concepts[lastVisited]?.status !== 'mastered' ? lastVisited : null

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14">
      <section className="grid items-center gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Learn math by touching it.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-2">
            {CONCEPTS.length} concepts, each with an interactive lab you can drag, tweak and break,
            from the number line to neural networks. A map shows what comes before what, so you
            always know where you are.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {onboarded ? (
              <ButtonLink
                to={next[0] ? `/learn/${next[0]}` : '/map'}
                variant="primary"
                size="lg"
                icon={<ArrowRight className="size-5" />}
              >
                {next[0] ? 'Continue learning' : 'Open the map'}
              </ButtonLink>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setOnboarding(true)}
                icon={<Compass className="size-5" />}
              >
                Find my starting point
              </Button>
            )}
            <ButtonLink to="/map" size="lg" icon={<MapIcon className="size-5" />}>
              Explore the map
            </ButtonLink>
          </div>
          <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-3">
            <span>{DEEP_LAB_IDS.size} guided deep labs</span>
            <span>6 tools</span>
            <span>Works offline · no account</span>
          </p>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm">
          <HeroWave />
          <p className="px-2 pt-1 text-sm text-ink-2">
            A point going round a circle draws a sine wave.{' '}
            <Link to="/learn/trig-graphs" className="font-medium text-accent hover:underline">
              See why
            </Link>
          </p>
        </div>
      </section>

      {due.length > 0 && (
        <section
          aria-labelledby="review-heading"
          className="mt-14 flex flex-wrap items-center gap-4 rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft">
            <BrainCircuit className="size-6 text-accent" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="review-heading" className="text-lg font-semibold">
              Review today
            </h2>
            <p className="text-ink-2">
              {due.length} {due.length === 1 ? 'concept is' : 'concepts are'} due: one quick
              question each, about {Math.max(1, Math.round(due.length * 0.5))} min.
            </p>
          </div>
          <ButtonLink to="/review" variant="primary" icon={<ArrowRight className="size-4" />}>
            Start review
          </ButtonLink>
        </section>
      )}

      {(onboarded || overall.done > 0) && (
        <section aria-labelledby="next-heading" className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="next-heading" className="text-2xl font-semibold">
                {resume ? 'Pick up where you left off' : 'Next up for you'}
              </h2>
              <p className="mt-1 text-ink-2">
                {goal
                  ? `On your path to ${conceptById.get(goal)!.title}.`
                  : 'Concepts whose prerequisites you already have.'}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-ink-2">
              <span className="inline-flex items-center gap-2">
                <ProgressRing
                  value={overall.done / overall.total}
                  size={36}
                  stroke={4}
                  label={`${overall.done} of ${overall.total} concepts done`}
                />
                {overall.done} / {overall.total} done
              </span>
              {days > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Flame className="size-4 text-[var(--c-orange)]" aria-hidden />
                  {days}-day streak
                </span>
              )}
            </div>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {resume && (
              <li>
                <ConceptCard id={resume} emphasis="Continue" />
              </li>
            )}
            {next.slice(0, resume ? 3 : 4).map((id) => (
              <li key={id}>
                <ConceptCard id={id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!onboarded && overall.done === 0 && (
        <section className="mt-16 grid gap-4 rounded-3xl bg-accent-soft p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-8">
          <div>
            <h2 className="text-xl font-semibold">New here? Two questions and you’re in.</h2>
            <p className="mt-1 text-ink-2">
              Tell us what you’d like to learn and what you already know. We’ll mark the basics as
              done and point you at the right first lab.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => setOnboarding(true)}>
              Get started
            </Button>
            <ButtonLink to="/learn/number-line">Start at the very beginning</ButtonLink>
          </div>
        </section>
      )}

      <section aria-labelledby="tracks-heading" className="mt-16">
        <h2 id="tracks-heading" className="text-2xl font-semibold">
          Tracks
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {TRACKS.map((t) => {
            const ids = trackConcepts(t.id)
            const { done, total } = countDone(concepts, ids)
            const active = track === t.id
            return (
              <div
                key={t.id}
                className={cn(
                  'flex items-start gap-4 rounded-2xl border bg-surface p-5 shadow-sm',
                  active ? 'border-accent' : 'border-line',
                )}
              >
                <ProgressRing
                  value={done / total}
                  size={52}
                  stroke={5}
                  label={`${done} of ${total} done`}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">
                    {t.title}
                    {active && (
                      <span className="ml-2 text-xs font-medium text-accent">Your track</span>
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-ink-2">{t.blurb}</p>
                  <p className="mt-2 text-sm text-ink-3">
                    {done} of {total} concepts done
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!active && (
                      <Button size="sm" variant="secondary" onClick={() => setTrack(t.id)}>
                        Follow this track
                      </Button>
                    )}
                    <ButtonLink size="sm" variant="ghost" to={`/map?track=${t.id}`}>
                      See it on the map
                    </ButtonLink>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="domains-heading" className="mt-16">
        <h2 id="domains-heading" className="text-2xl font-semibold">
          Everything on the map
        </h2>
        <p className="mt-1 text-ink-2">
          {AREAS.length} areas, {DOMAINS.length} domains. Every concept has a hands-on lab.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAINS.map((d) => {
            const area = AREAS.find((a) => a.id === d.area)!
            const Icon = DOMAIN_ICONS[d.id]
            const { done, total } = domainCounts(concepts, d.id)
            const first = CONCEPTS.find((c) => c.domain === d.id)!
            return (
              <li key={d.id}>
                <Link
                  to={`/map?focus=${first.id}`}
                  className="group flex h-full items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-xl"
                    style={{
                      background: `color-mix(in oklab, ${area.color} 16%, var(--surface))`,
                      color: area.color,
                    }}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{d.title}</span>
                    <span className="block text-sm text-ink-2">{d.blurb}</span>
                    <span className="mt-2 flex items-center gap-2 text-xs text-ink-3">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${(done / total) * 100}%`, background: area.color }}
                        />
                      </span>
                      {done}/{total}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-2">
        <Link
          to="/tools"
          className="group flex items-start gap-3 rounded-2xl border border-line bg-surface p-5 shadow-sm hover:shadow-md"
        >
          <Wrench className="mt-0.5 size-5 text-accent" aria-hidden />
          <span>
            <span className="block font-semibold">Free play with the tools</span>
            <span className="block text-sm text-ink-2">
              A grapher, a matrix lab, probability experiments, a data lab and more.
            </span>
          </span>
        </Link>
        <Link
          to="/about"
          className="group flex items-start gap-3 rounded-2xl border border-line bg-surface p-5 shadow-sm hover:shadow-md"
        >
          <Sparkles className="mt-0.5 size-5 text-accent" aria-hidden />
          <span>
            <span className="block font-semibold">How the labs work</span>
            <span className="block text-sm text-ink-2">
              Explore, predict, then check yourself. Progress stays on this device.
            </span>
          </span>
        </Link>
      </section>

      <Onboarding open={onboarding} onClose={() => setOnboarding(false)} />
    </div>
  )
}

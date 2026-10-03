import { ArrowRight, CalendarCheck, Map as MapIcon, PartyPopper, Play } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { conceptById } from '@/curriculum'
import type { ConceptId } from '@/curriculum/types'
import { INTERVALS, relativeDay } from '@/progress/review'
import { recommendations, useReviewSummary } from '@/progress/selectors'
import { useProgress } from '@/progress/store'
import { Button, ButtonLink } from '@/ui/Button'
import { ReviewCard } from '../review/ReviewCard'
import { ReviewForecast } from '../review/ReviewForecast'
import { useDocumentTitle } from '../theme'

/** Reviews per sitting; more can follow with "Keep going". */
const SESSION = 10

function Panel({ children }: { children: ReactNode }) {
  return <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm">{children}</div>
}

export function ReviewPage() {
  useDocumentTitle('Review')
  const { today, reviews, due, next, total } = useReviewSummary()
  const concepts = useProgress((s) => s.concepts)
  const goal = useProgress((s) => s.goal)
  const track = useProgress((s) => s.track)
  const [queue, setQueue] = useState<ConceptId[]>(() => due.slice(0, SESSION))
  const [pos, setPos] = useState(0)
  const [results, setResults] = useState<boolean[]>([])

  const start = () => {
    setQueue(due.slice(0, SESSION))
    setPos(0)
    setResults([])
  }
  const sessionDone = queue.length > 0 && pos >= queue.length
  const remembered = results.filter(Boolean).length
  const learnNext = recommendations({ concepts, goal, track }, 1)[0]

  let body: ReactNode
  if (total === 0) {
    body = (
      <Panel>
        <h2 className="text-xl font-semibold">Nothing to review yet</h2>
        <p className="mt-2 text-ink-2">
          Master a concept by solving all of its challenges. A day later it shows up here for a
          one-question check, then again after 3 days, a week, two weeks and so on. Each review you
          get right pushes the next one further out.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {learnNext && (
            <ButtonLink
              to={`/learn/${learnNext}`}
              variant="primary"
              icon={<ArrowRight className="size-4" />}
            >
              Learn {conceptById.get(learnNext)!.title}
            </ButtonLink>
          )}
          <ButtonLink to="/map" icon={<MapIcon className="size-4" />}>
            Open the map
          </ButtonLink>
        </div>
      </Panel>
    )
  } else if (sessionDone) {
    body = (
      <Panel>
        <PartyPopper className="size-8 text-accent" aria-hidden />
        <h2 className="mt-3 text-xl font-semibold">Session done</h2>
        <p className="mt-2 text-ink-2" role="status">
          You remembered {remembered} of {results.length} first time.
          {due.length > 0
            ? ` ${due.length} more ${due.length === 1 ? 'is' : 'are'} due today.`
            : next
              ? ` Next review ${relativeDay(next, today)}.`
              : ''}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {due.length > 0 && (
            <Button variant="primary" icon={<Play className="size-4" />} onClick={start}>
              Keep going
            </Button>
          )}
          <ButtonLink
            to={learnNext ? `/learn/${learnNext}` : '/map'}
            variant={due.length > 0 ? 'secondary' : 'primary'}
            icon={<ArrowRight className="size-4" />}
          >
            {learnNext ? 'Learn something new' : 'Open the map'}
          </ButtonLink>
        </div>
      </Panel>
    )
  } else if (queue.length > 0) {
    body = (
      <>
        <div
          className="mb-4 h-1.5 overflow-hidden rounded-full bg-surface-3"
          role="progressbar"
          aria-label="Session progress"
          aria-valuemin={0}
          aria-valuemax={queue.length}
          aria-valuenow={pos}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${(pos / queue.length) * 100}%` }}
          />
        </div>
        <ReviewCard
          key={`${queue[pos]}-${pos}`}
          id={queue[pos]}
          position={pos + 1}
          total={queue.length}
          today={today}
          isLast={pos === queue.length - 1}
          onNext={(ok) => {
            setResults((r) => [...r, ok])
            setPos((p) => p + 1)
          }}
        />
      </>
    )
  } else if (due.length > 0) {
    body = (
      <Panel>
        <h2 className="text-xl font-semibold">
          {due.length} {due.length === 1 ? 'concept is' : 'concepts are'} due
        </h2>
        <p className="mt-2 text-ink-2">One quick question each.</p>
        <Button
          className="mt-5"
          variant="primary"
          icon={<Play className="size-4" />}
          onClick={start}
        >
          Start review
        </Button>
      </Panel>
    )
  } else {
    body = (
      <Panel>
        <CalendarCheck className="size-8 text-accent" aria-hidden />
        <h2 className="mt-3 text-xl font-semibold">All caught up</h2>
        <p className="mt-2 text-ink-2">
          {next ? `Your next review is ${relativeDay(next, today)}.` : 'Nothing is scheduled.'}{' '}
          Reviews come back just as you’re about to forget, so a few minutes a day goes a long way.
        </p>
        <ButtonLink
          className="mt-5"
          to={learnNext ? `/learn/${learnNext}` : '/map'}
          variant="primary"
          icon={<ArrowRight className="size-4" />}
        >
          {learnNext ? 'Learn something new' : 'Open the map'}
        </ButtonLink>
      </Panel>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-semibold">Review</h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        Quick questions on concepts you’ve mastered, spaced out so they stick. Get one right and it
        comes back later; miss it and it comes back tomorrow.
      </p>
      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0">{body}</div>
        <aside className="grid content-start gap-4" aria-label="Review schedule">
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <div className="text-sm font-semibold">Coming up</div>
            <div className="mt-3">
              <ReviewForecast reviews={reviews} today={today} />
            </div>
            <p className="mt-3 text-sm text-ink-2">
              {total} {total === 1 ? 'concept' : 'concepts'} in review
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4 text-sm text-ink-2 shadow-sm">
            <div className="font-semibold text-ink">How spacing works</div>
            <p className="mt-2">
              Each right answer moves a concept up a step, and each step waits longer:{' '}
              {INTERVALS.slice(0, -1).join(', ')}, then {INTERVALS.at(-1)} days. A miss sends it
              back to the start.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

import { Download, Flag, Flame, RotateCcw, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { AREAS, CONCEPTS, DOMAINS, conceptById, graph, trackById } from '@/curriculum'
import type { ConceptId } from '@/curriculum/types'
import { relativeDay } from '@/progress/review'
import { countDone, domainCounts, isDone, streak, useReviewSummary } from '@/progress/selectors'
import { useProgress, type ThemeSetting } from '@/progress/store'
import { exportProgress, parseProgress } from '@/progress/transfer'
import { Button, ButtonLink } from '@/ui/Button'
import { Dialog } from '@/ui/Dialog'
import { ProgressRing } from '@/ui/ProgressRing'
import { Segmented } from '@/ui/Segmented'
import { Switch } from '@/ui/Switch'
import { ConceptCard } from '../home/ConceptCard'
import { Onboarding } from '../home/Onboarding'
import { ReviewForecast } from '../review/ReviewForecast'
import { useDocumentTitle } from '../theme'

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-sm text-ink-2">{label}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function ProgressPage() {
  useDocumentTitle('Your progress')
  const state = useProgress()
  const { concepts, goal, track, activity, settings } = state
  const [onboarding, setOnboarding] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const review = useReviewSummary()

  const all = countDone(
    concepts,
    CONCEPTS.map((c) => c.id),
  )
  const statuses = Object.values(concepts).map((p) => p.status)
  const mastered = statuses.filter((s) => s === 'mastered').length
  const known = statuses.filter((s) => s === 'known').length
  const inProgress = statuses.filter((s) => s === 'started' || s === 'explored').length
  const days = streak(activity)
  const recent = (Object.entries(concepts) as [ConceptId, (typeof concepts)[string]][])
    .filter(([, p]) => p.status !== 'known')
    .sort((a, b) => b[1].lastSeen - a[1].lastSeen)
    .slice(0, 6)
    .map(([id]) => id)
  const goalPath = goal ? graph.learningPath(goal, (id) => isDone(concepts, id)) : []

  const download = () => {
    const blob = new Blob([exportProgress(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `applied-maths-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage({ ok: true, text: 'Progress file downloaded.' })
  }

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const result = parseProgress(await file.text())
    if (!result.ok) {
      setMessage({ ok: false, text: result.error })
      return
    }
    state.importData(result.data)
    setMessage({
      ok: true,
      text: `Imported progress for ${Object.keys(result.data.concepts).length} concepts.`,
    })
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-semibold">Your progress</h1>
      <p className="mt-2 text-ink-2">
        Saved in this browser only. Export a file to move it to another device.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-[auto_repeat(4,minmax(0,1fr))]">
        <div className="col-span-2 flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-sm sm:col-span-1">
          <ProgressRing
            value={all.done / all.total}
            size={64}
            stroke={6}
            label={`${all.done} of ${all.total} concepts done`}
          />
          <div>
            <div className="text-2xl font-semibold tabular-nums">
              {all.done} / {all.total}
            </div>
            <div className="text-sm text-ink-2">concepts done</div>
          </div>
        </div>
        <Stat value={String(mastered)} label="mastered" />
        <Stat value={String(known)} label="already known" />
        <Stat value={String(inProgress)} label="in progress" />
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-2xl font-semibold tabular-nums">
            <Flame className="size-5 text-[var(--c-orange)]" aria-hidden />
            {days}
          </div>
          <div className="text-sm text-ink-2">
            day streak · {activity.length} active {activity.length === 1 ? 'day' : 'days'}
          </div>
        </div>
      </div>

      <Section title="Goal and track">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <div className="flex items-center gap-2 font-semibold">
              <Flag className="size-4 text-accent" aria-hidden />
              {goal ? conceptById.get(goal)!.title : 'No goal set'}
            </div>
            <p className="mt-1 text-sm text-ink-2">
              {goal
                ? goalPath.length
                  ? `${goalPath.length} concept${goalPath.length === 1 ? '' : 's'} left on your path.`
                  : 'Reached! Pick a new goal on the map.'
                : 'Choose any concept on the map as a goal and get a step-by-step path to it.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ButtonLink size="sm" variant="secondary" to={goal ? `/map?goal=${goal}` : '/map'}>
                {goal ? 'See the path' : 'Open the map'}
              </ButtonLink>
              {goal && (
                <Button size="sm" variant="ghost" onClick={() => state.setGoal(null)}>
                  Clear goal
                </Button>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <div className="font-semibold">{trackById.get(track)?.title ?? 'Full Journey'}</div>
            <p className="mt-1 text-sm text-ink-2">{trackById.get(track)?.blurb}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => setOnboarding(true)}>
                Redo the starting questions
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Spaced review">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <div className="text-2xl font-semibold tabular-nums">{review.due.length}</div>
            <div className="text-sm text-ink-2">
              due today · {review.total} {review.total === 1 ? 'concept' : 'concepts'} in review
            </div>
            <p className="mt-3 text-sm text-ink-2">
              {review.total === 0
                ? 'Mastered concepts join review a day later, so they stay fresh.'
                : review.due.length
                  ? 'A few quick questions keep what you’ve learned from fading.'
                  : review.next
                    ? `All caught up. Next review ${relativeDay(review.next, review.today)}.`
                    : 'All caught up.'}
            </p>
            <ButtonLink
              to="/review"
              size="sm"
              variant={review.due.length ? 'primary' : 'secondary'}
              className="mt-4"
            >
              {review.due.length ? 'Start review' : 'Open review'}
            </ButtonLink>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <div className="text-sm font-semibold">Next 7 days</div>
            <div className="mt-3">
              <ReviewForecast reviews={review.reviews} today={review.today} />
            </div>
          </div>
        </div>
      </Section>

      <Section title="By domain">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {DOMAINS.map((d) => {
            const { done, total } = domainCounts(concepts, d.id)
            const color = AREAS.find((a) => a.id === d.area)!.color
            return (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm"
              >
                <ProgressRing
                  value={done / total}
                  size={40}
                  stroke={4}
                  color={color}
                  label={`${d.title}: ${done} of ${total}`}
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{d.title}</div>
                  <div className="text-xs text-ink-2">
                    {done} / {total}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </Section>

      {recent.length > 0 && (
        <Section title="Recently opened">
          <ul className="grid gap-3 sm:grid-cols-2">
            {recent.map((id) => (
              <li key={id}>
                <ConceptCard id={id} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Settings">
        <div className="grid gap-5 rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div className="grid gap-2">
            <span className="text-sm font-medium">Theme</span>
            <Segmented<ThemeSetting>
              className="justify-self-start"
              label="Theme"
              value={settings.theme}
              onChange={state.setTheme}
              options={[
                { value: 'system', label: 'Match device' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          </div>
          <Switch
            label="Reduce motion (no automatic animations)"
            checked={settings.reducedMotion}
            onChange={state.setReducedMotion}
          />
        </div>
      </Section>

      <Section title="Your data">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={download} icon={<Download className="size-4" />}>
            Export progress
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            icon={<Upload className="size-4" />}
          >
            Import a file
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={upload}
            aria-label="Progress file to import"
            tabIndex={-1}
          />
          <Button
            variant="ghost"
            onClick={() => setConfirmReset(true)}
            icon={<RotateCcw className="size-4" />}
          >
            Reset everything
          </Button>
        </div>
        {message && (
          <p
            role="status"
            className={message.ok ? 'mt-3 text-sm text-good-ink' : 'mt-3 text-sm text-bad-ink'}
          >
            {message.text}
          </p>
        )}
        <p className="mt-3 text-sm text-ink-3">
          Nothing is sent anywhere.{' '}
          <Link to="/about" className="underline">
            About this app
          </Link>
        </p>
      </Section>

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Erase all progress?"
        description="This clears every mastered concept, your goal, streak and settings on this device. Export a file first if you might want it back."
        className="max-w-md"
      >
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmReset(false)} data-autofocus>
            Keep my progress
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              state.resetAll()
              setConfirmReset(false)
              setMessage({ ok: true, text: 'All progress erased.' })
            }}
          >
            Erase everything
          </Button>
        </div>
      </Dialog>
      <Onboarding open={onboarding} onClose={() => setOnboarding(false)} />
    </div>
  )
}

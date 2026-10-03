import { Check } from 'lucide-react'
import { useState } from 'react'
import { MILESTONES, TRACKS, graph } from '@/curriculum'
import { useProgress } from '@/progress/store'
import { Button } from '@/ui/Button'
import { Dialog } from '@/ui/Dialog'
import { cn } from '@/ui/cn'

/** Every concept a set of milestones implies you know: the milestones' goals and all their prerequisites. */
function knownFrom(ids: string[]) {
  return graph.closure(MILESTONES.filter((m) => ids.includes(m.id)).flatMap((m) => m.goals))
}

/** Two quick questions: which track, and what you already know. */
export function Onboarding({ open, onClose }: { open: boolean; onClose: () => void }) {
  const currentTrack = useProgress((s) => s.track)
  const setTrack = useProgress((s) => s.setTrack)
  const markKnown = useProgress((s) => s.markKnown)
  const setOnboarded = useProgress((s) => s.setOnboarded)
  const [step, setStep] = useState<1 | 2>(1)
  const [track, setChosenTrack] = useState(currentTrack)
  const [known, setKnown] = useState<string[]>([])
  const count = knownFrom(known).size

  const finish = () => {
    setTrack(track)
    if (known.length) markKnown(knownFrom(known))
    setOnboarded(true)
    setStep(1)
    onClose()
  }
  const skip = () => {
    setOnboarded(true)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        step === 1 ? 'What would you like to learn?' : 'What are you already comfortable with?'
      }
      description={
        step === 1
          ? 'You can switch at any time; the whole map stays open either way.'
          : 'Tick anything you could do today. Those concepts (and what they build on) will be marked as known, so the app starts you in the right place.'
      }
      className="max-w-xl"
    >
      {step === 1 ? (
        <fieldset className="grid gap-3">
          <legend className="sr-only">Track</legend>
          {TRACKS.map((t) => (
            <label
              key={t.id}
              aria-label={t.title}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors',
                track === t.id ? 'border-accent bg-accent-soft' : 'border-line hover:bg-surface-2',
              )}
            >
              <input
                type="radio"
                name="track"
                value={t.id}
                checked={track === t.id}
                onChange={() => setChosenTrack(t.id)}
                className="mt-1 accent-[var(--accent)]"
              />
              <span>
                <span className="block font-semibold">{t.title}</span>
                <span className="mt-0.5 block text-sm text-ink-2">{t.blurb}</span>
              </span>
            </label>
          ))}
        </fieldset>
      ) : (
        <fieldset className="grid gap-2">
          <legend className="sr-only">Topics you know</legend>
          {MILESTONES.map((m) => {
            const on = known.includes(m.id)
            return (
              <label
                key={m.id}
                aria-label={m.title}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
                  on ? 'border-accent bg-accent-soft' : 'border-line hover:bg-surface-2',
                )}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() =>
                    setKnown((k) => (on ? k.filter((x) => x !== m.id) : [...k, m.id]))
                  }
                  className="mt-1 accent-[var(--accent)]"
                />
                <span>
                  <span className="block font-medium">{m.title}</span>
                  <span className="block text-sm text-ink-2">e.g. {m.example}</span>
                </span>
              </label>
            )
          })}
        </fieldset>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={skip}>
          Skip for now
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          {step === 2 && (
            <>
              <span className="text-sm text-ink-2" aria-live="polite">
                {count
                  ? `${count} concepts will be marked as known`
                  : 'Nothing yet: start from the beginning'}
              </span>
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
            </>
          )}
          {step === 1 ? (
            <Button variant="primary" onClick={() => setStep(2)} data-autofocus>
              Next
            </Button>
          ) : (
            <Button variant="primary" onClick={finish} icon={<Check className="size-4" />}>
              Show me where to start
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  )
}

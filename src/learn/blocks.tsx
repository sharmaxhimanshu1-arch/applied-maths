import {
  CircleCheck,
  Circle,
  Info,
  Lightbulb,
  MousePointerClick,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useId, useState, type ReactNode } from 'react'
import { Button } from '@/ui/Button'
import { Inline, RichText } from '@/ui/RichText'
import { Tex } from '@/ui/Tex'
import { texToPlain } from '@/ui/tex'
import { cn } from '@/ui/cn'
import { useOptionalLab } from './lab-context'

/** A titled part of a lab; appears in the table of contents. */
export function LabSection({
  id,
  title,
  eyebrow,
  children,
  className,
}: {
  id: string
  title: string
  eyebrow?: string
  children: ReactNode
  className?: string
}) {
  const lab = useOptionalLab()
  const register = lab?.registerSection
  useEffect(() => register?.({ id, title }), [register, id, title])
  return (
    <section
      id={`section-${id}`}
      aria-labelledby={`heading-${id}`}
      className={cn('scroll-mt-24', className)}
    >
      {eyebrow && (
        <div className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
          {eyebrow}
        </div>
      )}
      <h2 id={`heading-${id}`} className="mt-1 text-2xl font-semibold sm:text-[1.65rem]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** Paragraphs of lesson text. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('prose-lab max-w-[68ch]', className)}>{children}</div>
}

/** A container for self-ticking prompts. */
export function TryThisList({
  children,
  title = 'Try this',
}: {
  children: ReactNode
  title?: string
}) {
  return (
    <div className="mt-4 rounded-2xl border border-line bg-surface-2/60 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <MousePointerClick className="size-4 text-accent" aria-hidden />
        {title}
      </div>
      <ul className="mt-2 grid gap-1.5">{children}</ul>
    </div>
  )
}

/**
 * A discovery prompt that ticks itself once `when` becomes true (and stays ticked).
 * `when` is computed by the lab from the visual's state, e.g. `when={slope < 0}`.
 */
export function TryThis({
  id,
  when,
  children,
}: {
  id: string
  when: boolean
  children: ReactNode
}) {
  const lab = useOptionalLab()
  const [localDone, setLocalDone] = useState(false)
  // Outside a lab, latch locally (setState during render is React's pattern for derived state).
  if (!lab && when && !localDone) setLocalDone(true)
  const done = lab ? lab.isTryThisDone(id) : localDone
  const complete = lab?.completeTryThis

  useEffect(() => {
    if (when && !done && complete) complete(id)
  }, [when, done, complete, id])

  return (
    <li className="flex items-start gap-2.5 text-[0.9375rem]" data-done={done}>
      {done ? (
        <CircleCheck
          className="mt-0.5 size-4.5 shrink-0 animate-[pop_300ms_ease]"
          style={{ color: 'var(--good)' }}
          aria-hidden
        />
      ) : (
        <Circle className="mt-0.5 size-4.5 shrink-0 text-ink-3" aria-hidden />
      )}
      <span className={cn(done && 'text-ink-2')}>
        <span className="sr-only">{done ? 'Done: ' : 'To do: '}</span>
        {children}
      </span>
    </li>
  )
}

type CalloutKind = 'insight' | 'misconception' | 'note'

const CALLOUT = {
  insight: { icon: Lightbulb, label: 'Key insight', color: 'var(--c-yellow)' },
  misconception: { icon: TriangleAlert, label: 'Watch out', color: 'var(--c-orange)' },
  note: { icon: Info, label: 'Note', color: 'var(--c-blue)' },
} as const

export function Callout({
  kind = 'insight',
  title,
  children,
}: {
  kind?: CalloutKind
  title?: string
  children: ReactNode
}) {
  const c = CALLOUT[kind]
  const Icon = c.icon
  return (
    <aside
      className="my-5 flex gap-3 rounded-2xl border p-4"
      style={{
        background: `color-mix(in oklab, ${c.color} 9%, var(--surface))`,
        borderColor: `color-mix(in oklab, ${c.color} 30%, transparent)`,
      }}
    >
      <Icon className="mt-0.5 size-5 shrink-0" style={{ color: c.color }} aria-hidden />
      <div className="min-w-0">
        <div className="text-sm font-semibold">{title ?? c.label}</div>
        <div className="prose-lab mt-1 text-[0.9875rem]">{children}</div>
      </div>
    </aside>
  )
}

/** String captions may use the inline `$tex$` / `**bold**` markup. */
const captionNode = (caption: ReactNode) =>
  typeof caption === 'string' ? <Inline text={caption} /> : caption

/** A displayed formula with an optional plain-language caption. */
export function Formula({ tex, caption }: { tex: string; caption?: ReactNode }) {
  return (
    <figure className="my-5 rounded-2xl border border-line bg-surface px-4 py-3 text-center shadow-sm">
      <Tex display>{tex}</Tex>
      {caption && (
        <figcaption className="pb-1 text-sm text-ink-2">{captionNode(caption)}</figcaption>
      )}
    </figure>
  )
}

/** Live numbers next to a visual, e.g. slope = 1.5. */
export function Readouts({
  items,
}: {
  items: { label: ReactNode; value: ReactNode; color?: string }[]
}) {
  return (
    <dl className="mt-3 flex flex-wrap gap-2">
      {items.map((it, i) => (
        <div
          key={i}
          className="flex items-baseline gap-2 rounded-xl border border-line bg-surface px-3 py-1.5 text-sm shadow-sm"
        >
          <dt className="flex items-center gap-1.5 text-ink-2">
            {it.color && (
              <span
                aria-hidden
                className="inline-block size-2 rounded-full"
                style={{ background: it.color }}
              />
            )}
            {it.label}
          </dt>
          <dd
            className={cn(
              'font-medium',
              typeof it.value === 'string' && /[a-z]{3}/i.test(it.value) ? '' : 'tabular font-mono',
            )}
          >
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** "What do you think will happen?" Commit to a guess before seeing the answer. */
export function PredictReveal({
  question,
  options,
  answer,
  explanation,
}: {
  question: string
  options: string[]
  answer: number
  explanation: ReactNode
}) {
  const [picked, setPicked] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const name = useId()
  return (
    <div className="my-5 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
        Predict first
      </div>
      <fieldset className="mt-1">
        <legend className="font-medium">
          <Inline text={question} />
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {options.map((o, i) => {
            const state = revealed
              ? i === answer
                ? 'right'
                : i === picked
                  ? 'wrong'
                  : 'idle'
              : 'idle'
            return (
              <label
                key={i}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--focus-ring)]',
                  picked === i && !revealed && 'border-accent bg-accent-soft',
                  state === 'right' &&
                    'border-[var(--good)] bg-[color-mix(in_oklab,var(--good)_10%,var(--surface))]',
                  state === 'wrong' &&
                    'border-[var(--bad)] bg-[color-mix(in_oklab,var(--bad)_8%,var(--surface))]',
                  picked !== i && state === 'idle' && 'border-line hover:bg-surface-2',
                )}
              >
                <input
                  type="radio"
                  name={name}
                  aria-label={o.includes('$') ? texToPlain(o) : undefined}
                  className="sr-only"
                  disabled={revealed}
                  checked={picked === i}
                  onChange={() => setPicked(i)}
                />
                <Inline text={o} />
              </label>
            )
          })}
        </div>
      </fieldset>
      {!revealed ? (
        <Button
          className="mt-3"
          size="sm"
          variant="primary"
          disabled={picked === null}
          onClick={() => setRevealed(true)}
        >
          Lock in my guess
        </Button>
      ) : (
        <div className="prose-lab mt-3 text-[0.9875rem]" role="status">
          <strong>{picked === answer ? 'Nice call. ' : 'Interesting guess. '}</strong>
          {explanation}
        </div>
      )}
    </div>
  )
}

export function RealWorld({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((it) => (
        <li key={it.title} className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="font-semibold">{it.title}</div>
          <RichText text={it.body} className="mt-1 text-[0.9375rem] text-ink-2 [&_p+p]:mt-2" />
        </li>
      ))}
    </ul>
  )
}

export function Takeaways({ items }: { items: ReactNode[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5">
          <CircleCheck className="mt-1 size-4 shrink-0 text-accent" aria-hidden />
          <span className="prose-lab">{typeof it === 'string' ? <Inline text={it} /> : it}</span>
        </li>
      ))}
    </ul>
  )
}

/** Wrapper that gives a visual a caption and consistent spacing. */
export function Figure({ children, caption }: { children: ReactNode; caption?: ReactNode }) {
  return (
    <figure className="my-4">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        {children}
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-ink-2">{captionNode(caption)}</figcaption>
      )}
    </figure>
  )
}

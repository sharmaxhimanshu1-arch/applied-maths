import { CircleCheck, Lightbulb, RotateCcw, Target } from 'lucide-react'
import { useCallback, useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import { expressionsMatch, numbersMatch, parseNumber } from '@/math/miniExpr'
import { Button } from '@/ui/Button'
import { Inline, RichText } from '@/ui/RichText'
import { texToPlain } from '@/ui/tex'
import { cn } from '@/ui/cn'
import { useOptionalLab } from './lab-context'

/** Shared solved-state: through the lab (persisted) or local when used outside a lab. */
function useCheck(id: string) {
  const lab = useOptionalLab()
  const [local, setLocal] = useState(false)
  const register = lab?.registerCheck
  const solveCheck = lab?.solveCheck
  useEffect(() => register?.(id), [register, id])
  const solved = lab ? lab.isSolved(id) : local
  const record = useCallback(
    (correct: boolean) => {
      if (solveCheck) solveCheck(id, correct)
      else if (correct) setLocal(true)
    },
    [solveCheck, id],
  )
  return { solved, record }
}

type ShellProps = {
  index?: number
  title?: string
  prompt: ReactNode
  solved: boolean
  hint?: ReactNode
  explanation?: ReactNode
  children: ReactNode
  feedback?: ReactNode
}

function ChallengeShell({
  index,
  title,
  prompt,
  solved,
  hint,
  explanation,
  children,
  feedback,
}: ShellProps) {
  const [showHint, setShowHint] = useState(false)
  return (
    <div
      className={cn(
        'rounded-2xl border bg-surface p-4 shadow-sm transition-colors sm:p-5',
        solved ? 'border-[color-mix(in_oklab,var(--good)_45%,transparent)]' : 'border-line',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
            solved
              ? 'bg-[color-mix(in_oklab,var(--good)_16%,var(--surface))]'
              : 'bg-surface-2 text-ink-2',
          )}
        >
          {solved ? (
            <CircleCheck
              className="size-4.5"
              style={{ color: 'var(--good)' }}
              aria-label="Solved"
            />
          ) : (
            (index ?? <Target className="size-4" aria-hidden />)
          )}
        </span>
        <div className="min-w-0 flex-1">
          {title && <div className="text-sm font-semibold text-ink-2">{title}</div>}
          <div className="prose-lab">{prompt}</div>
        </div>
      </div>
      <div className="mt-3 sm:pl-10">{children}</div>
      {feedback && <div className="mt-3 sm:pl-10">{feedback}</div>}
      {solved && explanation && (
        <div
          className="prose-lab mt-3 rounded-xl bg-surface-2 p-3 text-[0.9375rem] sm:ml-10"
          role="status"
        >
          {explanation}
        </div>
      )}
      {!solved && hint && (
        <div className="mt-3 sm:pl-10">
          {showHint ? (
            <div className="prose-lab flex gap-2 rounded-xl bg-surface-2 p-3 text-[0.9375rem]">
              <Lightbulb
                className="mt-1 size-4 shrink-0"
                style={{ color: 'var(--c-yellow)' }}
                aria-hidden
              />
              <div>{hint}</div>
            </div>
          ) : (
            <button
              type="button"
              className="text-sm font-medium text-accent hover:underline"
              onClick={() => setShowHint(true)}
            >
              Show a hint
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function Feedback({ tone, children }: { tone: 'good' | 'bad'; children: ReactNode }) {
  return (
    <p role="status" className="flex items-start gap-2 text-[0.9375rem]">
      <span
        aria-hidden
        className="mt-1.5 inline-block size-2 shrink-0 rounded-full"
        style={{ background: tone === 'good' ? 'var(--good)' : 'var(--bad)' }}
      />
      <span>{children}</span>
    </p>
  )
}

export type McqOption = { text: string; correct?: boolean; why?: string }

export function McqChallenge({
  id,
  index,
  title,
  prompt,
  options,
  explanation,
  hint,
}: {
  id: string
  index?: number
  title?: string
  prompt: string
  options: McqOption[]
  explanation?: string
  hint?: string
}) {
  const { solved, record } = useCheck(id)
  const [picked, setPicked] = useState<number | null>(null)
  const name = useId()
  const pickedOption = picked === null ? null : options[picked]

  return (
    <ChallengeShell
      index={index}
      title={title}
      prompt={<Inline text={prompt} />}
      solved={solved}
      hint={hint && <Inline text={hint} />}
      explanation={explanation && <RichText text={explanation} />}
      feedback={
        pickedOption && !pickedOption.correct && !solved ? (
          <Feedback tone="bad">
            Not quite.{' '}
            {pickedOption.why ? (
              <Inline text={pickedOption.why} />
            ) : (
              'Have another look and try again.'
            )}
          </Feedback>
        ) : null
      }
    >
      <fieldset>
        <legend className="sr-only">{prompt}</legend>
        <div className="grid gap-2">
          {options.map((o, i) => {
            const isPicked = picked === i
            const showRight = solved && o.correct
            const showWrong = isPicked && !o.correct
            return (
              <label
                key={i}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--focus-ring)]',
                  showRight &&
                    'border-[var(--good)] bg-[color-mix(in_oklab,var(--good)_10%,var(--surface))]',
                  showWrong &&
                    'animate-[shake_300ms_ease] border-[var(--bad)] bg-[color-mix(in_oklab,var(--bad)_7%,var(--surface))]',
                  !showRight && !showWrong && 'border-line hover:bg-surface-2',
                  solved && !o.correct && 'opacity-60',
                )}
              >
                <input
                  type="radio"
                  name={name}
                  aria-label={o.text.includes('$') ? texToPlain(o.text) : undefined}
                  className="size-4 accent-[var(--accent)]"
                  checked={isPicked || (solved && !!o.correct && picked === null)}
                  disabled={solved}
                  onChange={() => {
                    setPicked(i)
                    record(!!o.correct)
                  }}
                />
                <span className="prose-lab text-[0.9875rem]">
                  <Inline text={o.text} />
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
    </ChallengeShell>
  )
}

function AnswerForm({
  label,
  placeholder,
  solved,
  onSubmit,
  unit,
}: {
  label: string
  placeholder: string
  solved: boolean
  onSubmit: (value: string) => void
  unit?: string
}) {
  const [value, setValue] = useState('')
  const inputId = useId()
  function submit(e: FormEvent) {
    e.preventDefault()
    if (value.trim()) onSubmit(value)
  }
  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        id={inputId}
        value={value}
        disabled={solved}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        className="h-10 w-48 rounded-xl border border-line-strong bg-surface px-3 font-mono text-[0.9375rem] outline-none focus:border-accent disabled:opacity-70"
      />
      {unit && <span className="text-ink-2">{unit}</span>}
      <Button type="submit" variant="primary" size="md" disabled={solved || !value.trim()}>
        Check
      </Button>
    </form>
  )
}

export function NumericChallenge({
  id,
  index,
  title,
  prompt,
  answer,
  tolerance = 1e-6,
  unit,
  hint,
  explanation,
}: {
  id: string
  index?: number
  title?: string
  prompt: string
  answer: number
  tolerance?: number
  unit?: string
  hint?: string
  explanation?: string
}) {
  const { solved, record } = useCheck(id)
  const [message, setMessage] = useState<{ tone: 'good' | 'bad'; text: string } | null>(null)
  return (
    <ChallengeShell
      index={index}
      title={title}
      prompt={<Inline text={prompt} />}
      solved={solved}
      hint={hint && <Inline text={hint} />}
      explanation={explanation && <RichText text={explanation} />}
      feedback={message && !solved ? <Feedback tone={message.tone}>{message.text}</Feedback> : null}
    >
      <AnswerForm
        label="Your answer"
        placeholder="e.g. 3/4 or 2.5"
        unit={unit}
        solved={solved}
        onSubmit={(raw) => {
          const v = parseNumber(raw)
          if (Number.isNaN(v)) {
            setMessage({
              tone: 'bad',
              text: "I couldn't read that as a number. Try something like 0.75 or 3/4.",
            })
            return
          }
          const ok = numbersMatch(v, answer, tolerance)
          record(ok)
          setMessage(
            ok ? null : { tone: 'bad', text: 'Not quite. Check your working and try again.' },
          )
        }}
      />
    </ChallengeShell>
  )
}

export function ExpressionChallenge({
  id,
  index,
  title,
  prompt,
  answer,
  vars = ['x'],
  range,
  hint,
  explanation,
}: {
  id: string
  index?: number
  title?: string
  prompt: string
  /** A correct expression; any equivalent form is accepted. */
  answer: string
  vars?: string[]
  range?: [number, number]
  hint?: string
  explanation?: string
}) {
  const { solved, record } = useCheck(id)
  const [wrong, setWrong] = useState(false)
  return (
    <ChallengeShell
      index={index}
      title={title}
      prompt={<Inline text={prompt} />}
      solved={solved}
      hint={hint && <Inline text={hint} />}
      explanation={explanation && <RichText text={explanation} />}
      feedback={
        wrong && !solved ? (
          <Feedback tone="bad">
            Not equivalent yet. Any correct form works, e.g. 2x+2 or 2(x+1).
          </Feedback>
        ) : null
      }
    >
      <AnswerForm
        label="Your expression"
        placeholder={`in terms of ${vars.join(', ')}`}
        solved={solved}
        onSubmit={(raw) => {
          const ok = expressionsMatch(raw, answer, vars, range)
          record(ok)
          setWrong(!ok)
        }}
      />
    </ChallengeShell>
  )
}

/**
 * A goal the learner reaches by manipulating a visual. The lab computes `solved` from the
 * visual's state; once true it is recorded (and stays solved).
 */
export function InteractiveChallenge({
  id,
  index,
  title,
  prompt,
  solved: reached,
  hint,
  explanation,
  children,
  onReset,
}: {
  id: string
  index?: number
  title?: string
  prompt: string
  solved: boolean
  hint?: string
  explanation?: string
  children: ReactNode
  onReset?: () => void
}) {
  const { solved, record } = useCheck(id)
  useEffect(() => {
    if (reached && !solved) record(true)
  }, [reached, solved, record])
  return (
    <ChallengeShell
      index={index}
      title={title}
      prompt={<Inline text={prompt} />}
      solved={solved}
      hint={hint && <Inline text={hint} />}
      explanation={explanation && <RichText text={explanation} />}
    >
      {children}
      {onReset && (
        <Button
          size="sm"
          variant="ghost"
          className="mt-2"
          icon={<RotateCcw className="size-4" />}
          onClick={onReset}
        >
          Reset
        </Button>
      )}
    </ChallengeShell>
  )
}

/** Stack of challenges with a solved counter. */
export function ChallengeSet({ children }: { children: ReactNode }) {
  return <div className="grid gap-4">{children}</div>
}

import { CornerDownLeft, Loader, Trash } from 'lucide-react'
import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import type { MathJs } from '@/math/expr'
import { useMathJs } from '@/math/useMathJs'
import { Button, IconButton } from '@/ui/Button'
import { Tex } from '@/ui/Tex'

interface Entry {
  id: number
  input: string
  tex?: string
  output?: string
  outputTex?: string
  error?: string
}

const EXAMPLES = [
  'sqrt(2) * pi',
  '5 km to mile',
  '(2 + 3i) * (1 - i)',
  'det([1, 2; 3, 4])',
  'f(x) = x^2 + 1',
  'f(3)',
  'derivative("x^3 + 2x", "x")',
  'combinations(10, 3)',
  'sin(30 deg)',
  '0.1 + 0.2',
]

let nextId = 1

function describe(math: MathJs, result: unknown): { output?: string; outputTex?: string } {
  if (typeof result === 'function') return { output: 'function defined' }
  if (math.isMatrix(result)) {
    const rows = (result.toArray() as unknown[]).map((r) =>
      Array.isArray(r)
        ? r.map((v) => math.format(v, { precision: 6 })).join(' & ')
        : math.format(r, { precision: 6 }),
    )
    return { outputTex: `\\begin{bmatrix}${rows.join('\\\\')}\\end{bmatrix}` }
  }
  if (math.isNode(result)) return { outputTex: result.toTex() }
  return { output: math.format(result, { precision: 12 }) }
}

export default function CalculatorPage() {
  const math = useMathJs()
  const parser = useMemo(() => math?.parser(), [math])
  const [entries, setEntries] = useState<Entry[]>([])
  const [input, setInput] = useState('')
  const [cursor, setCursor] = useState<number | null>(null)
  const listRef = useRef<HTMLOListElement>(null)

  function evaluate(src: string) {
    if (!math || !parser || !src.trim()) return
    const entry: Entry = { id: nextId++, input: src }
    try {
      entry.tex = math.parse(src).toTex({ parenthesis: 'auto' })
    } catch {
      /* show the raw input */
    }
    try {
      Object.assign(entry, describe(math, parser.evaluate(src)))
    } catch (e) {
      entry.error = e instanceof Error ? e.message : String(e)
    }
    setEntries((es) => [...es, entry])
    setInput('')
    setCursor(null)
    requestAnimationFrame(() =>
      listRef.current?.lastElementChild?.scrollIntoView({ block: 'nearest' }),
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    evaluate(input)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!entries.length) return
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const i = cursor === null ? entries.length - 1 : Math.max(0, cursor - 1)
      setCursor(i)
      setInput(entries[i].input)
    } else if (e.key === 'ArrowDown' && cursor !== null) {
      e.preventDefault()
      const i = cursor + 1
      if (i >= entries.length) {
        setCursor(null)
        setInput('')
      } else {
        setCursor(i)
        setInput(entries[i].input)
      }
    }
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <ol
          ref={listRef}
          className="max-h-[28rem] min-h-40 overflow-y-auto"
          aria-live="polite"
          aria-label="Calculation history"
        >
          {entries.length === 0 && (
            <li className="p-6 text-center text-ink-2">
              {math ? (
                'Type a calculation below, or try an example.'
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Loader className="size-4 animate-spin" aria-hidden /> Loading the math engine…
                </span>
              )}
            </li>
          )}
          {entries.map((e) => (
            <li key={e.id} className="grid gap-1 border-b border-line px-4 py-3 last:border-b-0">
              <div className="flex items-baseline justify-between gap-4">
                <span className="truncate font-mono text-sm text-ink-2">{e.input}</span>
                {e.tex && (
                  <Tex className="hidden truncate text-sm text-ink-3 sm:inline">{e.tex}</Tex>
                )}
              </div>
              {e.error ? (
                <div className="text-sm text-bad-ink">{e.error}</div>
              ) : e.outputTex ? (
                <div className="text-right text-lg">
                  <Tex>{e.outputTex}</Tex>
                </div>
              ) : (
                <div className="tabular text-right font-mono text-xl font-medium break-all">
                  = {e.output}
                </div>
              )}
            </li>
          ))}
        </ol>
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 border-t border-line bg-surface-2/60 p-3"
        >
          <label htmlFor="calc-input" className="sr-only">
            Calculation
          </label>
          <input
            id="calc-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="e.g. 2^10, sqrt(-4), 3 inch to cm"
            autoComplete="off"
            spellCheck={false}
            className="h-11 flex-1 rounded-xl border border-line-strong bg-surface px-3 font-mono text-base outline-none focus:border-accent"
          />
          <Button
            type="submit"
            aria-label="Evaluate"
            variant="primary"
            disabled={!math}
            icon={<CornerDownLeft className="size-4" aria-hidden />}
          >
            =
          </Button>
          <IconButton label="Clear history" onClick={() => setEntries([])}>
            <Trash className="size-4.5" />
          </IconButton>
        </form>
      </div>
      <div>
        <div className="text-sm font-medium text-ink-2">Try</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              disabled={!math}
              onClick={() => evaluate(ex)}
              className="rounded-lg border border-line bg-surface px-2.5 py-1 font-mono text-sm hover:bg-surface-2 disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink-2">
          Variables and functions you define (like <code className="font-mono">a = 3</code> or{' '}
          <code className="font-mono">f(x) = x^2</code>) stay available. Press ↑ to reuse earlier
          lines.
        </p>
      </div>
    </div>
  )
}

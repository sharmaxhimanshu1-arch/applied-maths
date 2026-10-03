import { RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Readouts } from '@/learn/blocks'
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

export type NumberTheoryPreset =
  | { mode: 'sieve' }
  | { mode: 'factor'; n?: number }
  | { mode: 'clock'; m?: number; a?: number; b?: number; op?: 'add' | 'multiply' }
  | { mode: 'bases'; value?: number }
  | { mode: 'rsa'; p?: number; q?: number }

export type NumberTheoryState =
  | { mode: 'sieve'; primes: number[]; remaining: number; done: boolean }
  | { mode: 'factor'; n: number; factors: number[]; isPrime: boolean }
  | { mode: 'clock'; m: number; a: number; b: number; op: 'add' | 'multiply'; result: number }
  | { mode: 'bases'; value: number; ones: number }
  | {
      mode: 'rsa'
      p: number
      q: number
      n: number
      e: number
      d: number
      m: number
      c: number
      decrypted: number
    }

const ACCENT = 'var(--c-blue)'

function primeFactors(n: number): number[] {
  const out: number[] = []
  let rest = n
  for (let p = 2; p * p <= rest; p++) {
    while (rest % p === 0) {
      out.push(p)
      rest /= p
    }
  }
  if (rest > 1) out.push(rest)
  return out
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

function modPow(base: number, exp: number, mod: number): number {
  let result = 1
  let b = base % mod
  let e = exp
  while (e > 0) {
    if (e & 1) result = (result * b) % mod
    b = (b * b) % mod
    e >>= 1
  }
  return result
}

function modInverse(a: number, m: number): number {
  for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x
  return 0
}

// ── Sieve of Eratosthenes ───────────────────────────────────────────────────

function Sieve({ onState }: { onState: (s: NumberTheoryState) => void }) {
  const [primes, setPrimes] = useState<number[]>([])
  const crossed = new Set<number>()
  for (const p of primes) for (let k = 2 * p; k <= 100; k += p) crossed.add(k)
  const open = Array.from({ length: 99 }, (_, i) => i + 2).filter(
    (k) => !crossed.has(k) && !primes.includes(k),
  )
  const next = open[0]
  // Once the next open number squared passes 100, every composite is already crossed out.
  const done = next === undefined || next * next > 100
  useReport<NumberTheoryState>({ mode: 'sieve', primes, remaining: open.length, done }, onState)
  return (
    <>
      <div
        className="mx-auto grid w-full max-w-xl grid-cols-10 gap-1 p-3 sm:p-4"
        role="group"
        aria-label="Numbers 1 to 100"
      >
        {Array.from({ length: 100 }, (_, i) => i + 1).map((k) => {
          const isPrime = primes.includes(k) || (done && k > 1 && !crossed.has(k))
          const isCrossed = crossed.has(k)
          return (
            <button
              key={k}
              type="button"
              disabled={k !== next || done}
              onClick={() => setPrimes((ps) => [...ps, k])}
              aria-label={`${k}${isPrime ? ', prime' : isCrossed ? ', crossed out' : ''}`}
              className={cn(
                'aspect-square rounded-md border text-xs font-medium tabular sm:text-sm',
                isPrime
                  ? 'border-transparent bg-accent text-accent-ink'
                  : isCrossed
                    ? 'border-line bg-surface-2 text-ink-3 line-through'
                    : 'border-line bg-surface hover:bg-surface-2',
              )}
            >
              {k}
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-line p-3 sm:px-4">
        <Button
          size="sm"
          variant="primary"
          disabled={!next || done}
          onClick={() => next && setPrimes((ps) => [...ps, next])}
        >
          {next && !done ? `Keep ${next}, cross out its multiples` : 'Sieve finished'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={<RotateCcw className="size-4" />}
          disabled={!primes.length}
          onClick={() => setPrimes([])}
        >
          Reset
        </Button>
        <span className="text-sm text-ink-2" aria-live="polite">
          {done
            ? 'Everything left uncrossed is prime: 25 primes below 100.'
            : `Click the smallest number that is still open.`}
        </span>
      </div>
    </>
  )
}

// ── Factor tree ─────────────────────────────────────────────────────────────

/** Each split peels off the smallest prime: 60 → 2 × 30 → 2 × 15 → 3 × 5. */
function splits(n: number, factors: number[]) {
  const rows: { left: number; right: number }[] = []
  let rest = n
  for (const p of factors.slice(0, -1)) {
    rows.push({ left: p, right: rest / p })
    rest /= p
  }
  return rows
}

function Factor({ n: n0 = 60, onState }: { n?: number; onState: (s: NumberTheoryState) => void }) {
  const [n, setN] = useState(n0)
  const factors = primeFactors(n)
  useReport<NumberTheoryState>(
    { mode: 'factor', n, factors, isPrime: factors.length === 1 },
    onState,
  )
  const rows = splits(n, factors)
  return (
    <>
      <div className="grid gap-2 p-3 sm:p-4" aria-label={`Factor tree of ${n}`}>
        <div className="flex items-center gap-2 font-mono text-lg font-semibold">{n}</div>
        {rows.map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-2"
            style={{ paddingLeft: `${i * 1.75}rem` }}
          >
            <span className="text-ink-3" aria-hidden>
              ↳
            </span>
            <span className="rounded-full bg-accent px-2.5 py-0.5 font-mono text-sm font-semibold text-accent-ink">
              {r.left}
            </span>
            <span className="text-ink-3">×</span>
            <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-sm">
              {r.right}
            </span>
          </div>
        ))}
        {factors.length === 1 && n > 1 && (
          <p className="text-sm font-medium text-good-ink">
            {n} is prime: it has no smaller factors.
          </p>
        )}
      </div>
      <div className="grid gap-3 border-t border-line p-3 sm:p-4">
        <Slider
          label="Number to factor"
          value={n}
          min={2}
          max={360}
          step={1}
          onChange={setN}
          color={ACCENT}
        />
        <p className="text-[1.05rem]">
          <Tex>{`${n} = ${factors.join(' \\times ')}`}</Tex>
        </p>
      </div>
    </>
  )
}

// ── Clock arithmetic ────────────────────────────────────────────────────────

function Clock({
  m: m0 = 12,
  a: a0 = 9,
  b: b0 = 5,
  op: op0 = 'add',
  onState,
}: {
  m?: number
  a?: number
  b?: number
  op?: 'add' | 'multiply'
  onState: (s: NumberTheoryState) => void
}) {
  const [m, setM] = useState(m0)
  const [a, setA] = useState(a0)
  const [b, setB] = useState(b0)
  const [op, setOp] = useState(op0)
  const raw = op === 'add' ? a + b : a * b
  const result = raw % m
  useReport<NumberTheoryState>({ mode: 'clock', m, a, b, op, result }, onState)
  const R = 90
  const pos = (k: number) => {
    const t = (k / m) * 2 * Math.PI - Math.PI / 2
    return [120 + R * Math.cos(t), 120 + R * Math.sin(t)] as const
  }
  return (
    <>
      <div className="grid gap-4 p-3 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:items-center sm:p-4">
        <svg
          viewBox="0 0 240 240"
          className="mx-auto block h-auto w-full max-w-[15rem]"
          role="img"
          aria-label={`Clock with ${m} positions; the answer lands on ${result}`}
        >
          <circle cx={120} cy={120} r={R} fill="none" stroke="var(--line-strong)" strokeWidth={2} />
          {Array.from({ length: m }, (_, k) => {
            const [x, y] = pos(k)
            const hit = k === result
            const start = k === a % m
            return (
              <g key={k}>
                <circle
                  cx={x}
                  cy={y}
                  r={14}
                  fill={hit ? ACCENT : start ? 'var(--surface-3)' : 'var(--surface)'}
                  stroke={hit ? ACCENT : 'var(--line-strong)'}
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={600}
                  fill={hit ? '#fff' : 'var(--ink)'}
                >
                  {k}
                </text>
              </g>
            )
          })}
          <line
            x1={120}
            y1={120}
            x2={pos(result)[0]}
            y2={pos(result)[1]}
            stroke={ACCENT}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </svg>
        <div className="grid gap-3">
          <Segmented
            label="Operation"
            value={op}
            onChange={setOp}
            options={[
              { value: 'add', label: 'Add' },
              { value: 'multiply', label: 'Multiply' },
            ]}
          />
          <Slider
            label="Clock size (modulus)"
            value={m}
            min={2}
            max={12}
            step={1}
            onChange={setM}
            color={ACCENT}
          />
          <Slider label="a" value={a} min={0} max={30} step={1} onChange={setA} />
          <Slider label="b" value={b} min={0} max={30} step={1} onChange={setB} />
        </div>
      </div>
      <p className="border-t border-line px-3 py-2 text-[1.05rem] sm:px-4">
        <Tex>{`${a} ${op === 'add' ? '+' : '\\times'} ${b} = ${raw} \\equiv ${result} \\pmod{${m}}`}</Tex>
      </p>
    </>
  )
}

// ── Binary ──────────────────────────────────────────────────────────────────

function Bases({
  value: v0 = 5,
  onState,
}: {
  value?: number
  onState: (s: NumberTheoryState) => void
}) {
  const [value, setValue] = useState(v0)
  const bits = Array.from({ length: 8 }, (_, i) => (value >> (7 - i)) & 1)
  useReport<NumberTheoryState>({ mode: 'bases', value, ones: bits.filter(Boolean).length }, onState)
  return (
    <>
      <div className="grid gap-3 p-3 sm:p-4">
        <div className="grid grid-cols-8 gap-1.5" role="group" aria-label="Eight binary digits">
          {bits.map((bit, i) => {
            const place = 2 ** (7 - i)
            return (
              <button
                key={i}
                type="button"
                aria-pressed={bit === 1}
                aria-label={`The ${place}s bit`}
                onClick={() => setValue((v) => v ^ place)}
                className={cn(
                  'flex flex-col items-center rounded-xl border py-2 transition-colors',
                  bit
                    ? 'border-transparent bg-accent text-accent-ink'
                    : 'border-line bg-surface hover:bg-surface-2',
                )}
              >
                <span className="font-mono text-xl font-bold">{bit}</span>
                <span className={cn('text-[0.6875rem]', bit ? 'opacity-80' : 'text-ink-3')}>
                  {place}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-sm text-ink-2">
          Click a digit to switch it on or off. Each place is worth twice the one to its right.
        </p>
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'binary', value: value.toString(2).padStart(8, '0') },
            { label: 'decimal', value: String(value), color: ACCENT },
            { label: 'hexadecimal', value: value.toString(16).toUpperCase() },
            {
              label: 'sum',
              value: bits.some(Boolean)
                ? bits
                    .map((b, i) => (b ? 2 ** (7 - i) : 0))
                    .filter(Boolean)
                    .join(' + ')
                : '0',
            },
          ]}
        />
      </div>
    </>
  )
}

// ── RSA ─────────────────────────────────────────────────────────────────────

const SMALL_PRIMES = [5, 7, 11, 13, 17, 19, 23]

function Rsa({
  p: p0 = 11,
  q: q0 = 13,
  onState,
}: {
  p?: number
  q?: number
  onState: (s: NumberTheoryState) => void
}) {
  const [p, setP] = useState(p0)
  const [q, setQ] = useState(q0)
  const [m, setM] = useState(42)
  const n = p * q
  const phi = (p - 1) * (q - 1)
  const e = [3, 5, 7, 11, 13, 17].find((k) => gcd(k, phi) === 1) ?? 3
  const d = modInverse(e, phi)
  const msg = Math.min(m, n - 1)
  const c = modPow(msg, e, n)
  const decrypted = modPow(c, d, n)
  useReport<NumberTheoryState>({ mode: 'rsa', p, q, n, e, d, m: msg, c, decrypted }, onState)
  const pick = (label: string, value: number, set: (v: number) => void, other: number) => (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-ink-2">{label}</span>
      <select
        value={value}
        onChange={(ev) => set(Number(ev.target.value))}
        className="h-10 rounded-xl border border-line-strong bg-surface px-3"
      >
        {SMALL_PRIMES.filter((x) => x !== other).map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
    </label>
  )
  return (
    <>
      <div className="grid gap-4 p-3 sm:grid-cols-3 sm:p-4">
        {pick('Secret prime p', p, setP, q)}
        {pick('Secret prime q', q, setQ, p)}
        <Slider
          label="Message (a number)"
          value={msg}
          min={2}
          max={n - 1}
          step={1}
          onChange={setM}
          color={ACCENT}
        />
      </div>
      <div className="grid gap-2 border-t border-line p-3 text-[0.95rem] sm:p-4">
        <p>
          <span className="font-semibold">Public key</span> (anyone can see):{' '}
          <Tex>{`n = ${p} \\times ${q} = ${n}`}</Tex>, <Tex>{`e = ${e}`}</Tex>
        </p>
        <p>
          <span className="font-semibold">Private key</span> (needs <Tex>p</Tex> and <Tex>q</Tex>):{' '}
          <Tex>{`\\varphi = ${p - 1} \\times ${q - 1} = ${phi}`}</Tex>, <Tex>{`d = ${d}`}</Tex>{' '}
          because <Tex>{`${e} \\times ${d} \\equiv 1 \\pmod{${phi}}`}</Tex>
        </p>
        <p>
          <span className="font-semibold">Encrypt:</span>{' '}
          <Tex>{`${msg}^{${e}} \\bmod ${n} = ${c}`}</Tex>
        </p>
        <p>
          <span className="font-semibold">Decrypt:</span>{' '}
          <Tex>{`${c}^{${d}} \\bmod ${n} = ${decrypted}`}</Tex>{' '}
          {decrypted === msg && <span className="text-good-ink">✓ the original message</span>}
        </p>
      </div>
    </>
  )
}

export default function NumberTheoryWidget({
  preset,
  onStateChange,
}: WidgetComponentProps<'numberTheory'>) {
  switch (preset.mode) {
    case 'sieve':
      return <Sieve onState={onStateChange} />
    case 'factor':
      return <Factor n={preset.n} onState={onStateChange} />
    case 'clock':
      return <Clock m={preset.m} a={preset.a} b={preset.b} op={preset.op} onState={onStateChange} />
    case 'bases':
      return <Bases value={preset.value} onState={onStateChange} />
    case 'rsa':
      return <Rsa p={preset.p} q={preset.q} onState={onStateChange} />
  }
}

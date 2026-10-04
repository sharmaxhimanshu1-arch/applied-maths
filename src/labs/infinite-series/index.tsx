import { useState } from 'react'
import { formatNumber } from '@/math/core'
import type { Vec2 } from '@/math/linalg'
import {
  Callout,
  Figure,
  Formula,
  LabSection,
  PredictReveal,
  Prose,
  Readouts,
  RealWorld,
  Takeaways,
  TryThis,
  TryThisList,
} from '@/learn/blocks'
import {
  ChallengeSet,
  InteractiveChallenge,
  McqChallenge,
  NumericChallenge,
} from '@/learn/challenges'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { Label, Plot, Polygon, Polyline, Segment } from '@/viz'
import { num } from '../_shared/tex'

const TERM = 'var(--c-orange)'
const SUM = 'var(--c-blue)'
const LIMIT = 'var(--c-green)'

type SeriesKey = 'geometric' | 'harmonic' | 'squares' | 'alternating'

type Series = {
  /** n-th term, n = 1, 2, 3, … (geometric uses r). */
  term: (n: number, r: number) => number
  limit: (r: number) => number | null
  tex: (r: number) => string
  label: string
}

const SERIES: Record<SeriesKey, Series> = {
  geometric: {
    term: (n, r) => r ** (n - 1),
    limit: (r) => (Math.abs(r) < 1 ? 1 / (1 - r) : null),
    tex: (r) => `\\sum_{n=0}^{\\infty} (${num(r)})^n`,
    label: 'Geometric',
  },
  harmonic: {
    term: (n) => 1 / n,
    limit: () => null,
    tex: () => '\\sum_{n=1}^{\\infty} \\frac1n',
    label: 'Harmonic',
  },
  squares: {
    term: (n) => 1 / (n * n),
    limit: () => (Math.PI * Math.PI) / 6,
    tex: () => '\\sum_{n=1}^{\\infty} \\frac1{n^2}',
    label: '1/n²',
  },
  alternating: {
    term: (n) => (n % 2 === 1 ? 1 : -1) / n,
    limit: () => Math.LN2,
    tex: () => '\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{n}',
    label: 'Alternating',
  },
}

/** Partial sums S₁ … S_N. */
function partialSums(s: Series, r: number, N: number) {
  const out: number[] = []
  let total = 0
  for (let n = 1; n <= N; n++) {
    total += s.term(n, r)
    out.push(total)
  }
  return out
}

/** A y-window that fits the partial sums (and the limit) with a little room. */
function sumWindow(sums: readonly number[], limit: number | null) {
  const values = limit === null ? sums : [...sums, limit]
  const lo = Math.min(0, ...values)
  const hi = Math.max(1, ...values)
  const pad = (hi - lo) * 0.12
  return { yMin: lo - pad, yMax: hi + pad }
}

const MAX_BARS = 40

export default function InfiniteSeriesLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Adding forever, finishing anyway">
        <Prose>
          <p>
            Walk halfway to a wall. Then half the remaining distance, then half again, forever.
            That's infinitely many steps, yet you never pass the wall:{' '}
            <Tex>{'\\tfrac12 + \\tfrac14 + \\tfrac18 + \\cdots = 1'}</Tex>.
          </p>
          <p>
            An <strong>infinite series</strong> adds up infinitely many terms. Some settle on a
            finite total (they <em>converge</em>); others grow without limit (they <em>diverge</em>
            ), sometimes so slowly you'd never notice. Telling them apart is the art of series, and
            it's what makes Taylor series and Fourier series work.
          </p>
        </Prose>
      </LabSection>
      <SumsExplorer />
      <HalvesExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Partial sums and their limit">
        <Formula
          tex={
            '\\sum_{n=1}^{\\infty} a_n = \\lim_{N \\to \\infty} S_N, \\qquad S_N = a_1 + a_2 + \\cdots + a_N'
          }
          caption="A series converges when its partial sums settle on a limit."
        />
        <Formula
          tex={'\\sum_{n=0}^{\\infty} a r^n = \\frac{a}{1 - r} \\quad \\text{when } |r| < 1'}
          caption="The geometric series: each term is $r$ times the last. For $|r| \ge 1$ it diverges."
        />
        <Prose>
          <p>Useful facts:</p>
          <ul>
            <li>
              If the terms don't shrink to 0, the series diverges: you keep adding something
              noticeable.
            </li>
            <li>
              <Tex>{'\\sum 1/n^p'}</Tex> converges exactly when <Tex>{'p > 1'}</Tex>. So{' '}
              <Tex>{'\\sum 1/n^2 = \\pi^2/6'}</Tex>, but the harmonic series{' '}
              <Tex>{'\\sum 1/n'}</Tex> diverges.
            </li>
            <li>
              Alternating signs help: <Tex>{'1 - \\tfrac12 + \\tfrac13 - \\cdots = \\ln 2'}</Tex>{' '}
              converges even though <Tex>{'\\sum 1/n'}</Tex> does not.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="Shrinking terms aren't enough">
          <p>
            The harmonic terms <Tex>{'\\tfrac1n'}</Tex> shrink to 0, yet the sum grows past any
            number you name. It just takes a long time: about 12,000 terms to pass 10. Terms going
            to 0 is necessary for convergence, not sufficient.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Series in the wild">
        <RealWorld
          items={[
            {
              title: 'Repeating decimals',
              body: '$0.999\\ldots = \\tfrac{9}{10} + \\tfrac{9}{100} + \\cdots$, a geometric series that sums to exactly 1.',
            },
            {
              title: 'Loans and annuities',
              body: 'The value of a payment stream that goes on for ever is a geometric series of discounted payments.',
            },
            {
              title: 'Calculating π',
              body: 'Computers find billions of digits of $\\pi$ by adding up fast-converging series.',
            },
            {
              title: 'Bouncing balls',
              body: 'A ball that bounces back to 60% of its height travels a finite total distance, despite infinitely many bounces.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A series converges when its partial sums settle on a limit.',
            'Geometric series: $\\sum ar^n = \\dfrac{a}{1 - r}$ for $|r| < 1$, divergent otherwise.',
            'Terms must shrink to 0, but that alone isn’t enough: the harmonic series diverges.',
            '$\\sum 1/n^p$ converges for $p > 1$; alternating signs can rescue a series.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function SumsExplorer() {
  const [key, setKey] = useState<SeriesKey>('geometric')
  const [r, setR] = useState(0.5)
  const [N, setN] = useState(5)
  const s = SERIES[key]
  const sums = partialSums(s, r, N)
  const SN = sums[sums.length - 1]
  const limit = s.limit(r)
  const gap = limit === null ? null : Math.abs(limit - SN)
  const { yMin, yMax } = sumWindow(sums, limit)
  const xMax = Math.max(10, N) + 0.5
  const bars = Math.min(N, MAX_BARS)
  const terms = Array.from({ length: bars }, (_, i) => s.term(i + 1, r))
  const tMax = Math.max(0.2, ...terms.map(Math.abs))
  const points: Vec2[] = sums.map((v, i) => [i + 1, v])
  return (
    <LabSection id="explore" eyebrow="Explore" title="Watch the partial sums">
      <Prose>
        <p>
          The top plot shows the terms you're adding; the bottom plot shows the running total after
          each one. If the total levels off at a dashed line, the series converges to that number.
          Try each series and push the number of terms up.
        </p>
      </Prose>
      <PredictReveal
        question="The terms of $\sum \frac1n$ shrink to zero. Does the sum settle on a finite number?"
        options={['Yes, around 2', 'Yes, around 10', 'No, it grows forever (very slowly)']}
        answer={2}
        explanation="It grows forever. Group the terms: $\tfrac13 + \tfrac14 > \tfrac12$, $\tfrac15 + \cdots + \tfrac18 > \tfrac12$, and so on: infinitely many halves."
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Series"
            value={key}
            onChange={setKey}
            options={(Object.keys(SERIES) as SeriesKey[]).map((k) => ({
              value: k,
              label: SERIES[k].label,
            }))}
          />
          <Tex>{s.tex(r)}</Tex>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)]">
          <Plot
            view={{
              xMin: 0.4,
              xMax: Math.max(10, bars) + 0.6,
              yMin: Math.min(-0.08 * tMax, 1.15 * Math.min(...terms)),
              yMax: tMax * 1.15,
            }}
            height={150}
            xIntegers
            ariaLabel={`The first ${bars} terms`}
          >
            {terms.map((t, i) => (
              <Segment
                key={i}
                from={[i + 1, 0]}
                to={[i + 1, t]}
                color={TERM}
                width={bars > 25 ? 3 : 6}
              />
            ))}
          </Plot>
          <div className="border-t border-line px-3 py-1.5 text-xs text-ink-2 sm:px-4">
            Terms {bars < N ? `(first ${MAX_BARS} shown)` : ''} above · running total below
          </div>
          <div className="border-t border-line">
            <Plot
              view={{ xMin: 0.4, xMax, yMin, yMax }}
              height={240}
              xIntegers
              ariaLabel={`Partial sum after ${N} terms is ${formatNumber(SN, 4)}`}
            >
              {limit !== null && (
                <>
                  <Segment
                    from={[0.4, limit]}
                    to={[xMax, limit]}
                    color={LIMIT}
                    width={1.75}
                    dashed
                  />
                  <Label
                    at={[xMax, limit]}
                    anchor="bottom-right"
                    offset={[-6, -4]}
                    color={LIMIT}
                    className="text-xs"
                  >
                    limit {formatNumber(limit, 4)}
                  </Label>
                </>
              )}
              <Polyline points={points} color={SUM} width={2} />
              {N <= 60 &&
                points.map(([x, y]) => (
                  <Segment key={x} from={[x, y]} to={[x, y]} color={SUM} width={6} />
                ))}
            </Plot>
          </div>
        </div>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <div className="grid gap-4">
            <Slider
              label="Number of terms N"
              value={N}
              min={1}
              max={500}
              step={1}
              onChange={setN}
              color={SUM}
            />
            {key === 'geometric' && (
              <Slider
                label={<Tex>r</Tex>}
                name="Ratio r"
                value={r}
                min={-1.2}
                max={1.2}
                step={0.05}
                onChange={setR}
                color={TERM}
              />
            )}
          </div>
          <Readouts
            items={[
              {
                label: 'sum of N terms',
                value: formatNumber(SN, 5),
                color: SUM,
              },
              {
                label: 'limit',
                value: limit === null ? 'none (diverges)' : formatNumber(limit, 5),
                color: LIMIT,
              },
              { label: 'gap', value: gap === null ? '–' : formatNumber(gap, 5) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-diverge-lab" when={key === 'geometric' && Math.abs(r) >= 1 && N >= 20}>
          Set <Tex>{'|r| \\ge 1'}</Tex> and add 20 or more terms. What happens to the total?
        </TryThis>
        <TryThis id="t-five" when={key === 'harmonic' && SN > 5}>
          Push the harmonic series past 5. How many terms did it take?
        </TryThis>
        <TryThis id="t-close" when={key === 'squares' && gap !== null && gap < 0.01}>
          Get <Tex>{'\\sum 1/n^2'}</Tex> within 0.01 of <Tex>{'\\pi^2/6'}</Tex>.
        </TryThis>
        <TryThis id="t-zigzag" when={key === 'alternating' && N >= 10}>
          Watch the alternating series for 10+ terms. How does it approach <Tex>{'\\ln 2'}</Tex>?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

/** Rectangles of area ½, ¼, ⅛, … tiling the unit square, alternating vertical and horizontal cuts. */
function halves(k: number): Vec2[][] {
  const out: Vec2[][] = []
  let [x, y, w, h] = [0, 0, 1, 1]
  for (let i = 0; i < k; i++) {
    if (i % 2 === 0) {
      out.push([
        [x, y],
        [x + w / 2, y],
        [x + w / 2, y + h],
        [x, y + h],
      ])
      x += w / 2
      w /= 2
    } else {
      out.push([
        [x, y],
        [x + w, y],
        [x + w, y + h / 2],
        [x, y + h / 2],
      ])
      y += h / 2
      h /= 2
    }
  }
  return out
}

function HalvesExplorer() {
  const [k, setK] = useState(3)
  const pieces = halves(k)
  const total = 1 - 0.5 ** k
  return (
    <LabSection id="halves" eyebrow="Explore" title="Halves that fill a square">
      <Prose>
        <p>
          Shade half the square, then half of what's left, then half again. Each new piece is a term
          of <Tex>{'\\tfrac12 + \\tfrac14 + \\tfrac18 + \\cdots'}</Tex>. The square never overflows,
          and the unshaded gap shrinks towards nothing.
        </p>
      </Prose>
      <Figure>
        <div className="mx-auto w-full max-w-sm p-3">
          <Plot
            view={{ xMin: -0.05, xMax: 1.05, yMin: -0.05, yMax: 1.05 }}
            aspect="equal"
            grid={false}
            axes={false}
            ariaLabel={`${k} pieces shaded, total ${formatNumber(total, 5)}`}
          >
            <Polygon
              points={[
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
              ]}
              fill="none"
              fillOpacity={0}
              stroke="var(--ink-3)"
              strokeWidth={1.5}
            />
            {pieces.map((pts, i) => (
              <Polygon
                key={i}
                points={pts}
                fill={i % 2 === 0 ? SUM : TERM}
                fillOpacity={0.55 - 0.03 * Math.min(i, 10)}
                stroke="var(--surface)"
                strokeWidth={1.5}
              />
            ))}
          </Plot>
        </div>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider label="Pieces" value={k} min={1} max={14} step={1} onChange={setK} color={SUM} />
          <Readouts
            items={[
              { label: 'shaded', value: formatNumber(total, 6), color: SUM },
              { label: 'gap left', value: formatNumber(1 - total, 6) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-thousandth" when={k >= 10}>
          Add pieces until less than a thousandth of the square is left. How many did it take?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [r, setR] = useState(0.5)
  const total = Math.abs(r) < 1 ? 1 / (1 - r) : Infinity
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-third"
          index={1}
          prompt="Find $1 + \tfrac13 + \tfrac19 + \tfrac1{27} + \cdots$."
          answer={1.5}
          explanation="Geometric with $a = 1$, $r = \tfrac13$: $\dfrac{1}{1 - 1/3} = \tfrac32$."
        />
        <McqChallenge
          id="c-harmonic"
          index={2}
          prompt="Does $\displaystyle\sum_{n=1}^\infty \frac1n$ converge?"
          options={[
            { text: 'No, it grows without bound', correct: true },
            {
              text: 'Yes, because the terms go to 0',
              why: 'Shrinking terms are needed but not enough.',
            },
            { text: 'Yes, to about 2', why: 'It passes 2 after just 4 terms, and keeps going.' },
            { text: 'Yes, to $\\ln 2$', why: 'That is the alternating version.' },
          ]}
          explanation="The harmonic series diverges, though very slowly: it needs about 12,000 terms to reach 10."
        />
        <NumericChallenge
          id="c-nines"
          index={3}
          prompt="Write $0.999\ldots$ as $\tfrac{9}{10} + \tfrac{9}{100} + \cdots$. What is its sum?"
          answer={1}
          explanation="Geometric with $a = \tfrac9{10}$, $r = \tfrac1{10}$: $\dfrac{0.9}{0.9} = 1$."
        />
        <McqChallenge
          id="c-not-zero"
          index={4}
          prompt="The terms $a_n$ of a series approach 1. What can you say?"
          options={[
            { text: 'The series diverges', correct: true },
            { text: 'It converges to 1', why: 'Adding about 1 each time grows without bound.' },
            {
              text: 'It may or may not converge',
              why: 'Terms that don’t go to 0 always mean divergence.',
            },
            {
              text: 'It converges to $\\infty$',
              why: 'Growing without bound is what diverging means.',
            },
          ]}
          explanation="If the terms don't shrink to 0, every new term adds about the same amount, so the partial sums can't settle."
        />
        <InteractiveChallenge
          id="c-four"
          index={5}
          prompt="Choose $r$ so that $1 + r + r^2 + r^3 + \cdots = 4$."
          solved={Math.abs(total - 4) < 1e-9}
          hint="Solve $\dfrac{1}{1 - r} = 4$."
          explanation="$1 - r = \tfrac14$, so $r = 0.75$."
          onReset={() => setR(0.5)}
        >
          <div className="grid gap-3 rounded-xl border border-line p-3">
            <Slider
              label={<Tex>r</Tex>}
              name="Ratio r"
              value={r}
              min={-0.95}
              max={0.95}
              step={0.05}
              onChange={setR}
              color={TERM}
            />
            <p className="text-sm">
              Sum:{' '}
              <span className="font-mono">
                {Number.isFinite(total) ? formatNumber(total, 4) : 'diverges'}
              </span>
            </p>
          </div>
        </InteractiveChallenge>
        <NumericChallenge
          id="c-s3"
          index={6}
          prompt="Find the partial sum $S_3$ of $\displaystyle\sum \frac1{n^2}$. (Decimals are fine.)"
          answer={1 + 1 / 4 + 1 / 9}
          tolerance={0.001}
          explanation="$1 + \tfrac14 + \tfrac19 \approx 1.3611$, already within 0.29 of $\pi^2/6 \approx 1.6449$."
        />
      </ChallengeSet>
    </LabSection>
  )
}

import { useState } from 'react'
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
import { Label, Plot, Point, Polyline } from '@/viz'
import { num } from '../_shared/tex'

const BASE_MAX: Record<string, number> = { '2': 10, '3': 6, '10': 3 }
const CHIP = 'color-mix(in oklab, var(--c-blue) 75%, black)'

function prettyNumber(x: number): string {
  if (x >= 1000) return Math.round(x).toLocaleString('en-US')
  if (x >= 100) return num(x, 0)
  return num(x, x >= 10 ? 1 : 2)
}

export default function LogarithmsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="How many times must I multiply?">
        <Prose>
          <p>
            <Tex>{'2 \\times 2 \\times 2 \\times 2 \\times 2 = 32'}</Tex>. Turn that around and ask:
            how many 2s must I multiply to reach 32? The answer, 5, is the{' '}
            <strong>logarithm</strong>: <Tex>{'\\log_2 32 = 5'}</Tex>.
          </p>
          <p>
            A logarithm undoes an exponential, the way division undoes multiplication. And it has a
            superpower that made it one of the most important inventions in science: it turns
            multiplication into addition.
          </p>
        </Prose>
      </LabSection>
      <CountExplorer />
      <SlideRuleExplorer />
      <ScaleExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Logarithm rules">
        <Formula
          tex={'\\log_b x = y \\quad\\Longleftrightarrow\\quad b^{\\,y} = x'}
          caption="The log is the exponent you need. It's only defined for $x > 0$."
        />
        <Formula
          tex={
            '\\log(xy) = \\log x + \\log y \\qquad \\log\\frac{x}{y} = \\log x - \\log y \\qquad \\log x^n = n \\log x'
          }
          caption="Multiplying adds the counts of factors; powers multiply them."
        />
        <Prose>
          <p>
            Your calculator usually has <Tex>{'\\log'}</Tex> (base 10) and <Tex>{'\\ln'}</Tex> (base{' '}
            <Tex>e</Tex>). Any other base follows from either:{' '}
            <Tex>{'\\log_b x = \\frac{\\ln x}{\\ln b}'}</Tex>.
          </p>
        </Prose>
        <Callout kind="misconception" title="Logs don't split sums">
          <p>
            <Tex>{'\\log(a + b)'}</Tex> is <em>not</em> <Tex>{'\\log a + \\log b'}</Tex>. Logs turn
            products into sums, not sums into anything simpler: <Tex>{'\\log(2 + 8) = 1'}</Tex> but{' '}
            <Tex>{'\\log 2 + \\log 8 \\approx 1.2'}</Tex>.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet logarithms">
        <RealWorld
          items={[
            {
              title: 'Earthquakes and sound',
              body: 'The Richter and decibel scales are logarithmic: each step of 1 on the Richter scale is 10 times more ground motion.',
            },
            {
              title: 'Acidity',
              body: 'pH is $-\\log_{10}$ of the hydrogen-ion concentration, so pH 3 is ten times more acidic than pH 4.',
            },
            {
              title: 'Computer science',
              body: 'Binary search finds an item among a million in about $\\log_2 10^6 \\approx 20$ steps.',
            },
            {
              title: 'Astronomy and navigation',
              body: 'Before calculators, logarithm tables and slide rules turned long multiplications into quick additions.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            '$\\log_b x$ is the power you raise $b$ to in order to get $x$.',
            'Logs undo exponentials: $\\log_b(b^y) = y$.',
            '$\\log(xy) = \\log x + \\log y$: multiplication becomes addition.',
            'On a log scale, each step multiplies; exponential growth becomes a straight line.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function CountExplorer() {
  const [base, setBase] = useState<'2' | '3' | '10'>('2')
  const [y, setY] = useState(3)
  const b = Number(base)
  const x = b ** y
  const whole = Math.floor(y + 1e-9)
  const part = y - whole
  const near = (target: number, wantBase: number) =>
    b === wantBase && Math.abs(x - target) < target * 0.01
  return (
    <LabSection id="explore" eyebrow="Explore" title="Count the multiplications">
      <Prose>
        <p>
          Choose a base, then set how many times to multiply by it. Whole counts are easy; the
          surprise is that in-between counts make sense too: multiplying by 2 “half a time” is
          multiplying by <Tex>{'\\sqrt 2 \\approx 1.41'}</Tex>.
        </p>
      </Prose>
      <PredictReveal
        question="$\log_2 10$ is the number of 2s that multiply to 10. Roughly how big is it?"
        options={['Between 2 and 3', 'Between 3 and 4', 'Exactly 5', 'Exactly 10']}
        answer={1}
        explanation="$2^3 = 8$ is too small and $2^4 = 16$ too big, so it's between 3 and 4: about 3.32."
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Base"
            value={base}
            onChange={(v) => {
              setBase(v)
              setY((old) => Math.min(old, BASE_MAX[v]))
            }}
            options={[
              { value: '2', label: 'Base 2' },
              { value: '3', label: 'Base 3' },
              { value: '10', label: 'Base 10' },
            ]}
          />
        </div>
        <div className="grid gap-4 p-3 sm:p-4">
          <div className="flex min-h-12 flex-wrap items-center gap-1.5" aria-hidden>
            <span className="rounded-lg border border-line px-2.5 py-1.5 font-mono text-sm">1</span>
            {Array.from({ length: whole }, (_, i) => (
              <span
                key={i}
                className="rounded-lg px-2.5 py-1.5 font-mono text-sm font-semibold text-white"
                style={{ background: CHIP }}
              >
                ×{b}
              </span>
            ))}
            {part > 1e-9 && (
              <span
                className="relative overflow-hidden rounded-lg border px-2.5 py-1.5 font-mono text-sm font-semibold"
                style={{ borderColor: CHIP }}
              >
                <span
                  className="absolute inset-y-0 left-0 opacity-30"
                  style={{ width: `${part * 100}%`, background: CHIP }}
                />
                <span className="relative">×{num(b ** part, 2)}</span>
              </span>
            )}
            <span className="px-1 font-mono text-sm">= {prettyNumber(x)}</span>
          </div>
          <Slider
            label={`How many times to multiply by ${b}`}
            value={y}
            min={0}
            max={BASE_MAX[base]}
            step={0.05}
            onChange={setY}
            color={CHIP}
          />
          <div className="overflow-x-auto text-[1.05rem]">
            <Tex
              display
            >{`${b}^{${num(y)}} = ${prettyNumber(x)} \\qquad\\Longleftrightarrow\\qquad \\log_{${b}} ${prettyNumber(x)} = ${num(y)}`}</Tex>
          </div>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-64" when={near(64, 2)}>
          How many 2s multiply to 64? Find <Tex>{'\\log_2 64'}</Tex>.
        </TryThis>
        <TryThis id="t-1000" when={near(1000, 10)}>
          Find <Tex>{'\\log_{10} 1000'}</Tex>. Count the zeros in 1000: coincidence?
        </TryThis>
        <TryThis id="t-10" when={near(10, 2)}>
          Find <Tex>{'\\log_2 10'}</Tex> as closely as you can. It isn't a whole number.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const L = 540
const X0 = 50
const TICKS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10]
const MINOR = Array.from({ length: 81 }, (_, i) => 1 + i * 0.1).filter(
  (v) => !TICKS.some((t) => Math.abs(t - v) < 1e-9),
)

function Rule({
  y,
  flip,
  offset,
  color,
}: {
  y: number
  flip?: boolean
  offset: number
  color: string
}) {
  const dir = flip ? -1 : 1
  return (
    <g style={{ transform: `translateX(${offset}px)`, transition: 'transform 250ms ease' }}>
      <rect
        x={X0 - 14}
        y={flip ? y - 34 : y}
        width={L + 28}
        height={34}
        rx={6}
        fill="var(--surface-2)"
        stroke={color}
        strokeWidth={1.5}
      />
      {MINOR.map((v) => (
        <line
          key={v}
          x1={X0 + Math.log10(v) * L}
          x2={X0 + Math.log10(v) * L}
          y1={y}
          y2={y + dir * 7}
          stroke="var(--ink-3)"
          strokeWidth={1}
        />
      ))}
      {TICKS.map((v) => (
        <g key={v}>
          <line
            x1={X0 + Math.log10(v) * L}
            x2={X0 + Math.log10(v) * L}
            y1={y}
            y2={y + dir * 13}
            stroke="var(--ink)"
            strokeWidth={1.5}
          />
          <text
            x={X0 + Math.log10(v) * L}
            y={y + dir * 25}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fill="var(--ink-2)"
          >
            {v}
          </text>
        </g>
      ))}
    </g>
  )
}

function SlideRule({ a, b }: { a: number; b: number }) {
  const shift = Math.log10(a) * L
  const hair = X0 + shift + Math.log10(b) * L
  const product = a * b
  const fits = product <= 10 + 1e-9
  return (
    <svg
      viewBox={`0 0 ${L + 2 * X0 + 40} 150`}
      className="block h-auto w-full"
      role="img"
      aria-label={`Slide rule set to ${num(a)} times ${num(b)}${fits ? ` = ${num(product)}` : ''}`}
    >
      <Rule y={74} flip offset={shift} color="var(--c-blue)" />
      <Rule y={76} offset={0} color="var(--c-orange)" />
      {fits && (
        <>
          <line x1={hair} x2={hair} y1={24} y2={128} stroke="var(--c-red)" strokeWidth={2} />
          <rect x={hair - 22} y={130} width={44} height={18} rx={4} fill="var(--c-red)" />
          <text
            x={hair}
            y={140}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fontWeight={700}
            fill="#fff"
          >
            {num(product, 2)}
          </text>
        </>
      )}
      <text x={6} y={58} fontSize={11} fontWeight={600} fill="var(--c-blue)">
        C
      </text>
      <text x={6} y={96} fontSize={11} fontWeight={600} fill="var(--c-orange)">
        D
      </text>
    </svg>
  )
}

function SlideRuleExplorer() {
  const [a, setA] = useState(2)
  const [b, setB] = useState(1.5)
  const product = a * b
  const fits = product <= 10 + 1e-9
  const near = (p: number, q: number) => Math.abs(a - p) < 1e-9 && Math.abs(b - q) < 1e-9
  return (
    <LabSection
      id="slide-rule"
      eyebrow="Explore"
      title="The slide rule: multiply by adding lengths"
    >
      <Prose>
        <p>
          On both rulers, the distance from 1 to each number is its logarithm. Slide the top ruler
          so its 1 sits above <Tex>a</Tex>; then above <Tex>b</Tex> on the top ruler, the red line
          lands on <Tex>a \times b</Tex> below. Two lengths added, one product read off: this is how
          engineers multiplied for 300 years.
        </p>
      </Prose>
      <Figure>
        <div className="overflow-x-auto p-3 sm:p-4">
          <div className="min-w-[30rem]">
            <SlideRule a={a} b={b} />
          </div>
        </div>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label="Slide the top ruler to a"
            value={a}
            min={1}
            max={10}
            step={0.1}
            onChange={setA}
            color="var(--c-orange)"
          />
          <Slider
            label="Read under b on the top ruler"
            value={b}
            min={1}
            max={10}
            step={0.1}
            onChange={setB}
            color="var(--c-blue)"
          />
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'a × b',
                value: fits ? num(product, 2) : 'off the end (over 10)',
                color: 'var(--c-red)',
              },
              {
                label: 'lengths',
                value: (
                  <Tex>{`\\log ${num(a)} + \\log ${num(b)} = ${num(Math.log10(a), 3)} + ${num(Math.log10(b), 3)} = ${num(Math.log10(product), 3)}`}</Tex>
                ),
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-six" when={near(2, 3)}>
          Multiply 2 × 3 on the slide rule.
        </TryThis>
        <TryThis id="t-ten" when={near(2.5, 4)}>
          Find 2.5 × 4. Where does the red line end up?
        </TryThis>
        <TryThis id="t-off" when={!fits}>
          Try a product bigger than 10. What goes wrong, and how might a real slide rule cope?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function ScaleExplorer() {
  const [scale, setScale] = useState<'linear' | 'log'>('linear')
  const data: Vec2[] = Array.from({ length: 11 }, (_, x) => [x, 2 ** x])
  const shown = scale === 'linear' ? data : data.map(([x, y]): Vec2 => [x, Math.log10(y)])
  return (
    <LabSection id="log-scale" eyebrow="Explore" title="Log scales tame huge ranges">
      <Prose>
        <p>
          These points double at each step: 1, 2, 4, … 1024. On an ordinary axis the early points
          are squashed flat. Switch to a log axis, where each gridline is 10 times the last, and the
          same doubling becomes a straight line.
        </p>
      </Prose>
      <Figure>
        <div className="border-b border-line p-3 sm:px-4">
          <Segmented
            label="Vertical axis"
            value={scale}
            onChange={setScale}
            options={[
              { value: 'linear', label: 'Ordinary axis' },
              { value: 'log', label: 'Log axis' },
            ]}
          />
        </div>
        <Plot
          view={
            scale === 'linear'
              ? { xMin: -0.5, xMax: 10.5, yMin: -80, yMax: 1120 }
              : { xMin: -0.5, xMax: 10.5, yMin: -0.25, yMax: 3.25 }
          }
          height={260}
          tickLabels={scale === 'linear'}
          xIntegers
          ariaLabel={`Powers of two on a ${scale} axis`}
        >
          <Polyline points={shown} color="var(--c-blue)" width={2} />
          {shown.map((p, i) => (
            <Point key={i} at={p} r={4.5} color="var(--c-blue)" />
          ))}
          {scale === 'log' &&
            [0, 1, 2, 3].map((k) => (
              <Label
                key={k}
                at={[-0.5, k]}
                anchor="left"
                offset={[4, 0]}
                className="text-[11px] text-ink-2"
              >
                {10 ** k}
              </Label>
            ))}
        </Plot>
      </Figure>
      <TryThisList>
        <TryThis id="t-log-axis" when={scale === 'log'}>
          Switch to the log axis. Why do equal multiplications give equal steps?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [a, setA] = useState(1.5)
  const [b, setB] = useState(2)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-log2"
          index={1}
          prompt="$\log_2 64 = \;?$"
          answer={6}
          explanation="$2^6 = 64$, so six 2s: $\log_2 64 = 6$."
        />
        <NumericChallenge
          id="c-log10"
          index={2}
          prompt="$\log_{10} 1000 = \;?$"
          answer={3}
          explanation="$10^3 = 1000$. For powers of 10, the log counts the zeros."
        />
        <NumericChallenge
          id="c-negative"
          index={3}
          prompt="$\log_3 \tfrac19 = \;?$"
          answer={-2}
          hint="$\tfrac19 = 3^{?}$. Negative powers mean dividing."
          explanation="$3^{-2} = \tfrac{1}{3^2} = \tfrac19$, so the log is $-2$."
        />
        <McqChallenge
          id="c-rule"
          index={4}
          prompt="$\log(ab)$ equals…"
          options={[
            { text: '$\\log a + \\log b$', correct: true },
            {
              text: '$\\log a \\times \\log b$',
              why: 'Logs turn products into sums, not products into products.',
            },
            { text: '$\\log(a + b)$', why: 'That would need $ab = a + b$.' },
            { text: '$b \\log a$', why: 'That is $\\log(a^b)$.' },
          ]}
          explanation="Multiplying $a$ and $b$ adds their counts of factors: $\log(ab) = \log a + \log b$."
        />
        <InteractiveChallenge
          id="c-rule-3x3"
          index={5}
          prompt="Use the slide rule to multiply $3 \times 3$."
          solved={Math.abs(a - 3) < 1e-9 && Math.abs(b - 3) < 1e-9}
          hint="Slide the top ruler's 1 above 3, then look under 3 on the top ruler."
          explanation="$\log 3 + \log 3 = \log 9$: two lengths of 0.477 add to 0.954, the position of 9."
          onReset={() => {
            setA(1.5)
            setB(2)
          }}
        >
          <div className="grid gap-3 rounded-xl border border-line p-3">
            <div className="overflow-x-auto">
              <div className="min-w-[30rem]">
                <SlideRule a={a} b={b} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Slider
                label="Slide the top ruler to a"
                value={a}
                min={1}
                max={10}
                step={0.1}
                onChange={setA}
                color="var(--c-orange)"
              />
              <Slider
                label="Read under b"
                value={b}
                min={1}
                max={10}
                step={0.1}
                onChange={setB}
                color="var(--c-blue)"
              />
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

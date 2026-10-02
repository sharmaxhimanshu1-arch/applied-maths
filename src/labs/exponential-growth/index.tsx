import { Hourglass, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import type { Vec2 } from '@/math/linalg'
import { createRng } from '@/math/random'
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
import { Button } from '@/ui/Button'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { FunctionGraph, Label, Plot, Point, Polyline, Segment } from '@/viz'
import { DotGrid } from '../_shared/DotGrid'
import { percent } from '../_shared/fraction'
import { num } from '../_shared/tex'

const LINEAR = 'var(--c-orange)'
const EXPO = 'var(--c-blue)'
const money = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`

/** First whole year when the compound account is ahead of the steady one (null if never by 60). */
function overtakeYear(rate: number, deposit: number): number | null {
  for (let t = 1; t <= 60; t++) if (1000 * (1 + rate) ** t > 1000 + deposit * t) return t
  return null
}

export default function ExponentialGrowthLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Growth that feeds on itself">
        <Prose>
          <p>
            Linear growth adds the same amount each step: +100, +100, +100.{' '}
            <strong>Exponential</strong> growth multiplies by the same factor each step: ×1.1, ×1.1,
            ×1.1. Because each step grows from a bigger base, the increases get bigger and bigger.
          </p>
          <p>
            It starts slowly, which is what makes it sneaky. Compound interest, viral videos,
            epidemics and populations all grow this way, and radioactive atoms decay this way in
            reverse, shrinking by the same <em>fraction</em> each step.
          </p>
        </Prose>
      </LabSection>
      <RaceExplorer />
      <CompoundExplorer />
      <DecayExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The exponential formula">
        <Formula
          tex={'y = a \\cdot b^{\\,t}'}
          caption="$a$ is the starting amount, $b$ the factor per step: $b > 1$ grows, $0 < b < 1$ decays."
        />
        <Formula
          tex={'b = 1 + r \\qquad \\text{doubling time} \\approx \\frac{70}{r \\text{ in } \\%}'}
          caption="A growth rate of $r$ per step means multiplying by $1 + r$. At 7% a year, money doubles in about 10 years."
        />
        <Prose>
          <p>
            Compounding more and more often with the same yearly rate approaches a limit: growth by
            the factor <Tex>{'e^{r}'}</Tex> per year, where <Tex>{'e \\approx 2.71828'}</Tex>.
            That's why <Tex>{'e^{rt}'}</Tex> appears whenever something grows continuously.
          </p>
        </Prose>
        <Callout kind="misconception" title="Slow exponential still wins">
          <p>
            “Exponential” doesn't just mean “fast”. Even growth of 1% a year eventually overtakes
            any fixed yearly addition, however large. It just takes longer.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet exponentials">
        <RealWorld
          items={[
            {
              title: 'Savings and debt',
              body: 'Compound interest makes savings snowball, and makes credit-card debt grow frightening fast at 20% a year.',
            },
            {
              title: 'Epidemics',
              body: 'If each case causes 2 more every few days, cases double on a schedule. Slowing spread a little changes the outcome a lot.',
            },
            {
              title: 'Carbon dating',
              body: 'Carbon-14 has a half-life of about 5,730 years, so the fraction left in a bone dates it.',
            },
            {
              title: 'Computers',
              body: 'For decades, the number of transistors on a chip doubled about every two years (Moore’s law).',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Linear growth adds a fixed amount; exponential growth multiplies by a fixed factor.',
            '$y = a b^t$; growth rate $r$ means $b = 1 + r$.',
            'Doubling time ≈ 70 ÷ (percentage rate); half-life plays the same role for decay.',
            'Any exponential growth eventually beats any linear growth.',
            'Compounding continuously gives $e^{rt}$, with $e \\approx 2.718$.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function RaceExplorer() {
  const [rate, setRate] = useState(0.07)
  const [deposit, setDeposit] = useState(150)
  const [year, setYear] = useState(10)
  const lin = (t: number) => 1000 + deposit * t
  const exp = (t: number) => 1000 * (1 + rate) ** t
  const top = Math.max(lin(40), exp(40)) * 1.08
  const cross = overtakeYear(rate, deposit)
  const doubled = exp(year) >= 2000
  return (
    <LabSection id="explore" eyebrow="Explore" title="The race: adding versus multiplying">
      <Prose>
        <p>
          Two accounts start with $1,000. The steady saver adds the same deposit every year. The
          other adds nothing, but earns interest on everything in it. Drag the year and watch who is
          ahead.
        </p>
      </Prose>
      <PredictReveal
        question="Steady: +$150 a year. Interest: 7% a year, nothing added. Who has more after 40 years?"
        options={['Steady saver, easily', 'About the same', 'Interest account, by far']}
        answer={2}
        explanation="The interest account: about $15,000 against $7,000. It trails for over 20 years, then the compounding takes off."
      />
      <Figure>
        <Plot
          view={{ xMin: -1, xMax: 41, yMin: -top * 0.06, yMax: top }}
          height={300}
          ariaLabel={`After ${year} years: steady ${money(lin(year))}, interest ${money(exp(year))}`}
          xLabel="years"
        >
          <FunctionGraph fn={lin} domain={[0, 40]} color={LINEAR} width={2.75} />
          <FunctionGraph fn={exp} domain={[0, 40]} color={EXPO} width={2.75} />
          <Segment from={[year, 0]} to={[year, top]} color="var(--ink-3)" dashed width={1.25} />
          <Point at={[year, lin(year)]} r={5} color={LINEAR} />
          <Point at={[year, exp(year)]} r={5} color={EXPO} />
          {cross !== null && cross <= 40 && (
            <Label
              at={[cross, exp(cross)]}
              anchor="bottom-right"
              offset={[-6, -6]}
              className="text-xs"
            >
              overtakes in year {cross}
            </Label>
          )}
        </Plot>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-3 sm:p-4">
          <Slider label="Year" value={year} min={0} max={40} step={1} onChange={setYear} />
          <Slider
            label="Steady deposit per year"
            value={deposit}
            min={50}
            max={300}
            step={50}
            format={(v) => `$${v}`}
            onChange={setDeposit}
            color={LINEAR}
          />
          <Slider
            label="Interest rate"
            value={rate}
            min={0.01}
            max={0.12}
            step={0.005}
            format={(v) => percent(v, 1)}
            onChange={setRate}
            color={EXPO}
          />
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'steady saver', value: money(lin(year)), color: LINEAR },
              { label: 'interest account', value: money(exp(year)), color: EXPO },
              { label: 'this year’s interest', value: money(exp(year) * rate) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-overtake" when={cross !== null && year >= cross}>
          Move the year past the point where the interest account takes the lead.
        </TryThis>
        <TryThis id="t-double" when={doubled}>
          Find a year when the interest account has doubled to $2,000. Compare the year with 70 ÷
          the rate.
        </TryThis>
        <TryThis id="t-interest" when={exp(year) * rate > deposit}>
          Find a year when the interest earned in one year is bigger than the steady deposit.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const SCHEDULES = [
  { n: 1, name: 'once a year' },
  { n: 2, name: 'twice a year' },
  { n: 4, name: 'quarterly' },
  { n: 12, name: 'monthly' },
  { n: 52, name: 'weekly' },
  { n: 365, name: 'daily' },
  { n: 8760, name: 'hourly' },
  { n: 525600, name: 'every minute' },
]

function CompoundExplorer() {
  const [i, setI] = useState(0)
  const { n, name } = SCHEDULES[i]
  const value = (1 + 1 / n) ** n
  const pts: Vec2[] = Array.from({ length: 50 }, (_, k) => [k + 1, (1 + 1 / (k + 1)) ** (k + 1)])
  return (
    <LabSection id="compound" eyebrow="Explore" title="Compound more often, and meet e">
      <Prose>
        <p>
          An imaginary bank pays 100% interest a year on $1. Paid once, you end with $2. Paid twice
          (50% each half-year), you get <Tex>{'1.5^2 = 2.25'}</Tex>. Monthly? Daily? Every minute?
          Does the money grow without limit?
        </p>
      </Prose>
      <Figure>
        <Plot
          view={{ xMin: 0, xMax: 51, yMin: 1.8, yMax: 2.85 }}
          height={240}
          ariaLabel={`Compounding ${name}: $1 grows to $${num(value, 5)}`}
          xLabel="times per year"
          xIntegers
        >
          <Segment
            from={[0, Math.E]}
            to={[51, Math.E]}
            color="var(--c-violet)"
            dashed
            width={1.5}
          />
          <Label
            at={[51, Math.E]}
            anchor="top-right"
            offset={[-4, 4]}
            color="var(--c-violet)"
            className="text-xs font-semibold"
          >
            e ≈ 2.71828
          </Label>
          <Polyline points={pts} color={EXPO} width={2} />
          {n <= 50 && <Point at={[n, value]} r={6} color={EXPO} />}
        </Plot>
        <div className="grid gap-3 border-t border-line p-3 sm:p-4">
          <Slider
            label="Interest paid"
            value={i}
            min={0}
            max={SCHEDULES.length - 1}
            step={1}
            format={(k) => SCHEDULES[k].name}
            onChange={setI}
            color={EXPO}
          />
          <div className="overflow-x-auto text-[0.95rem]">
            <Tex
              display
            >{`\\left(1 + \\tfrac{1}{${n.toLocaleString('en-US').replace(/,/g, '{,}')}}\\right)^{${n.toLocaleString('en-US').replace(/,/g, '{,}')}} = ${num(value, 5)}`}</Tex>
          </div>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-monthly" when={n === 12}>
          Pay interest monthly. How much more than paying once a year?
        </TryThis>
        <TryThis id="t-minute" when={n === 525600}>
          Pay every minute. Does it ever reach $3?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const ATOMS = 400

function DecayExplorer() {
  const [rng] = useState(() => createRng(5730))
  const [alive, setAlive] = useState<boolean[]>(() => Array.from({ length: ATOMS }, () => true))
  const [history, setHistory] = useState<number[]>([ATOMS])
  const steps = history.length - 1
  const wait = () => {
    const next = alive.map((a) => a && rng.bernoulli(0.5))
    setAlive(next)
    setHistory((h) => [...h, next.filter(Boolean).length])
  }
  const reset = () => {
    setAlive(Array.from({ length: ATOMS }, () => true))
    setHistory([ATOMS])
  }
  return (
    <LabSection id="decay" eyebrow="Explore" title="Half-life: decay is exponential too">
      <Prose>
        <p>
          Each of these 400 radioactive atoms has a 50% chance of decaying during one half-life. No
          atom knows what the others are doing, yet together they halve, and halve again.
        </p>
      </Prose>
      <Figure>
        <div className="grid gap-4 p-3 sm:grid-cols-2 sm:p-4">
          <DotGrid
            cells={alive.map((a) => ({ color: a ? 'var(--c-green)' : 'var(--ink-3)', dim: !a }))}
            columns={20}
            size={11}
            gap={3}
            ariaLabel={`${history[history.length - 1]} of 400 atoms remain after ${steps} half-lives`}
          />
          <Plot
            view={{ xMin: -0.3, xMax: 8.3, yMin: -30, yMax: 430 }}
            height={230}
            ariaLabel="Atoms remaining after each half-life"
            xLabel="half-lives"
            xIntegers
          >
            <FunctionGraph
              fn={(t) => ATOMS * 0.5 ** t}
              domain={[0, 8]}
              color="var(--ink-3)"
              dashed
              width={1.5}
            />
            <Polyline
              points={history.map((c, k): Vec2 => [k, c])}
              color="var(--c-green)"
              width={2.5}
            />
            {history.map((c, k) => (
              <Point key={k} at={[k, c]} r={4} color="var(--c-green)" />
            ))}
          </Plot>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-line p-3 sm:px-4">
          <Button
            size="sm"
            variant="primary"
            icon={<Hourglass className="size-4" />}
            disabled={steps >= 8}
            onClick={wait}
          >
            Wait one half-life
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="size-4" />}
            disabled={steps === 0}
            onClick={reset}
          >
            Reset
          </Button>
          <span className="text-sm text-ink-2" aria-live="polite">
            {history[history.length - 1]} atoms left after {steps} half-li
            {steps === 1 ? 'fe' : 'ves'} (theory: {num(ATOMS * 0.5 ** steps, 1)})
          </span>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-three" when={steps >= 3}>
          Wait three half-lives. About what fraction is left? Is it exactly 50 atoms?
        </TryThis>
        <TryThis id="t-all" when={history[history.length - 1] <= 3}>
          Keep waiting until almost none are left. How many half-lives did it take?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [rate, setRate] = useState(0.03)
  const after10 = 1000 * (1 + rate) ** 10
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-interest"
          index={1}
          prompt="You invest $1,000 at 10% a year, compounded yearly. How much do you have after 2 years?"
          answer={1210}
          unit="$"
          explanation="$1000 \times 1.1 \times 1.1 = 1210$. The second year's interest ($110) is bigger than the first ($100)."
        />
        <NumericChallenge
          id="c-bacteria"
          index={2}
          prompt="One bacterium doubles every hour. How many are there after 10 hours?"
          answer={1024}
          explanation="$1 \times 2^{10} = 1024$."
        />
        <McqChallenge
          id="c-wins"
          index={3}
          prompt="Which is bigger after a very long time: $1000t$ (linear) or $1.01^t$ (1% growth)?"
          options={[
            { text: '$1.01^t$', correct: true },
            {
              text: '$1000t$',
              why: 'It starts far ahead, but any exponential growth eventually overtakes linear growth.',
            },
            { text: 'They end up equal', why: 'The ratio $1.01^t / 1000t$ grows without limit.' },
          ]}
          explanation="$1.01^t$ passes $1000t$ somewhere past $t \approx 1{,}000$ and then leaves it far behind."
        />
        <NumericChallenge
          id="c-halflife"
          index={4}
          prompt="A substance has a half-life of 5 years. You start with 80 g. How much is left after 15 years?"
          answer={10}
          unit="g"
          hint="15 years is how many half-lives?"
          explanation="3 half-lives: $80 \to 40 \to 20 \to 10$ g."
        />
        <InteractiveChallenge
          id="c-double"
          index={5}
          prompt="Choose an interest rate so that $1,000 **at least doubles** within 10 years."
          solved={after10 >= 2000}
          hint="Rule of 70: to double in 10 years you need about 70 ÷ 10 = 7% a year. Check whether 7% is quite enough."
          explanation="At 7% you'd have $1,967, just short. 7.5% gives $2,061. The rule of 70 is a good estimate, not exact."
          onReset={() => setRate(0.03)}
        >
          <div className="grid gap-3 rounded-xl border border-line p-3">
            <Slider
              label="Interest rate"
              value={rate}
              min={0.01}
              max={0.12}
              step={0.005}
              format={(v) => percent(v, 1)}
              onChange={setRate}
              color={EXPO}
            />
            <p className="text-sm">
              After 10 years: <strong className="tabular font-mono">{money(after10)}</strong>{' '}
              <span className="text-ink-2">
                ({after10 >= 2000 ? 'doubled!' : 'not doubled yet'})
              </span>
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

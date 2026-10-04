import { useId, useState } from 'react'
import { RotateCcw, StepForward } from 'lucide-react'
import { formatNumber } from '@/math/core'
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
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import {
  after,
  nextState,
  spread,
  startAt,
  stationary2,
  twoState,
  type Matrix,
} from '../_shared/markov'

const SUN = 'var(--c-orange)'
const CLOUD = 'var(--c-violet)'
const RAIN = 'var(--c-blue)'
const ARROW = 'var(--ink-2)'

const pct = (x: number) => `${formatNumber(x * 100, 1)}%`
const rng = createRng(17)

/** Two circles, the switching arrows between them and the stay-put loops. */
function TwoStateDiagram({ a, b, current }: { a: number; b: number; current: number }) {
  const arrow = `markov-arrow-${useId().replace(/:/g, '')}`
  const states = [
    { name: 'Sunny', x: 90, color: SUN },
    { name: 'Rainy', x: 310, color: RAIN },
  ]
  return (
    <svg
      viewBox="0 0 400 200"
      className="mx-auto block h-auto w-full max-w-md"
      role="img"
      aria-label={`Sunny stays sunny with chance ${pct(1 - a)} and turns rainy with chance ${pct(a)}; rainy turns sunny with chance ${pct(b)} and stays rainy with chance ${pct(1 - b)}.`}
    >
      <defs>
        <marker
          id={arrow}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" style={{ fill: ARROW }} />
        </marker>
      </defs>
      <path
        d="M 120 82 Q 200 30 280 82"
        style={{ fill: 'none', stroke: ARROW, strokeWidth: 2 }}
        markerEnd={`url(#${arrow})`}
      />
      <path
        d="M 280 118 Q 200 170 120 118"
        style={{ fill: 'none', stroke: ARROW, strokeWidth: 2 }}
        markerEnd={`url(#${arrow})`}
      />
      <text x="200" y="40" textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 15 }}>
        {pct(a)}
      </text>
      <text x="200" y="172" textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 15 }}>
        {pct(b)}
      </text>
      {states.map((s, i) => (
        <g key={s.name}>
          <path
            d={`M ${s.x - 14} 72 C ${s.x - 40} 20, ${s.x + 40} 20, ${s.x + 14} 72`}
            style={{ fill: 'none', stroke: ARROW, strokeWidth: 1.5 }}
            markerEnd={`url(#${arrow})`}
          />
          <text x={s.x} y="22" textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 13 }}>
            stay {pct(i === 0 ? 1 - a : 1 - b)}
          </text>
          <circle
            cx={s.x}
            cy="100"
            r="30"
            style={{
              fill: s.color,
              fillOpacity: current === i ? 0.35 : 0.12,
              stroke: s.color,
              strokeWidth: current === i ? 4 : 2,
            }}
          />
          <text
            x={s.x}
            y="105"
            textAnchor="middle"
            style={{ fill: 'var(--ink)', fontSize: 14, fontWeight: 600 }}
          >
            {s.name}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function MarkovChainsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Tomorrow depends only on today">
        <Prose>
          <p>
            A <strong>Markov chain</strong> is something that hops between a few states (sunny or
            rainy, page A or page B, healthy or ill) with fixed chances. The key rule: where it goes
            next depends <em>only</em> on where it is now, not on how it got there.
          </p>
          <p>
            Such a simple rule has a surprising consequence. However the chain starts, it usually
            forgets its starting point and settles into a fixed long-run pattern: the{' '}
            <strong>stationary distribution</strong>, the share of time it spends in each state.
          </p>
        </Prose>
      </LabSection>
      <WeatherExplorer />
      <ForgetExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Transition matrices">
        <Formula
          tex={'\\pi_{n+1} = \\pi_n P \\qquad \\pi = \\pi P'}
          caption="Each day's distribution is the previous one times the transition matrix; the stationary distribution doesn't change."
        />
        <Prose>
          <ul>
            <li>
              <strong>The transition matrix</strong> <Tex>{'P'}</Tex> has one row per current state:{' '}
              <Tex>{'P_{ij}'}</Tex> is the chance of going from <Tex>{'i'}</Tex> to <Tex>{'j'}</Tex>
              . Every row adds to 1.
            </li>
            <li>
              <strong>After n steps</strong> the distribution is <Tex>{'\\pi_0 P^n'}</Tex>: matrix
              multiplication does all the bookkeeping of “sunny then rainy, or rainy then sunny…”.
            </li>
            <li>
              <strong>Two states</strong> with switching chances <Tex>{'a'}</Tex> (sunny to rainy)
              and <Tex>{'b'}</Tex> (rainy to sunny) spend a share <Tex>{'\\tfrac{b}{a + b}'}</Tex>{' '}
              of the time sunny. In the long run, the flow out of sunny, <Tex>{'\\pi_S\\, a'}</Tex>,
              balances the flow in, <Tex>{'\\pi_R\\, b'}</Tex>.
            </li>
            <li>
              <strong>It settles</strong> when every state can reach every other and the chain isn't
              stuck in a fixed cycle. Then the stationary distribution is the left eigenvector of{' '}
              <Tex>{'P'}</Tex> with eigenvalue 1.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="“Memoryless” doesn't mean random each day">
          <p>
            A Markov chain does remember, but only one step back. Rain today really does make rain
            tomorrow likelier. What it ignores is everything before today: a week of sunshine
            doesn't make tomorrow's rain any less likely than one sunny day would.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where chains run">
        <RealWorld
          items={[
            {
              title: 'Web search',
              body: 'PageRank imagines a surfer clicking random links: a page’s rank is its share of time in the chain’s stationary distribution.',
            },
            {
              title: 'Predictive text',
              body: 'The simplest keyboards guess the next word from the current one, a Markov chain over words.',
            },
            {
              title: 'Genetics and finance',
              body: 'DNA sequence models, credit ratings moving between grades, and queues at a bank are all modelled as chains.',
            },
            {
              title: 'Simulation',
              body: 'Markov chain Monte Carlo builds a chain whose stationary distribution is the one you want to sample, which is how much of modern statistics computes.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Next state depends only on the current state, with fixed transition chances.',
            'Each row of the transition matrix adds to 1; $\\pi_{n+1} = \\pi_n P$.',
            'Most chains forget their start and settle to a stationary distribution, $\\pi = \\pi P$.',
            'For two states, the long-run share is $b/(a + b)$.',
          ]}
        />
      </LabSection>
    </div>
  )
}

type Sim = { current: number; days: number; sunny: number; recent: number[] }
const NEW_SIM: Sim = { current: 0, days: 0, sunny: 0, recent: [] }

function simulate(sim: Sim, P: Matrix, days: number): Sim {
  let { current, sunny } = sim
  const recent = [...sim.recent]
  for (let d = 0; d < days; d++) {
    current = nextState(P[current], rng.next())
    if (current === 0) sunny++
    recent.push(current)
  }
  return { current, days: sim.days + days, sunny, recent: recent.slice(-60) }
}

function WeatherExplorer() {
  const [a, setA] = useState(0.2)
  const [b, setB] = useState(0.5)
  const [sim, setSim] = useState<Sim>(NEW_SIM)
  const P = twoState(a, b)
  const pi = stationary2(a, b)
  const share = sim.days ? sim.sunny / sim.days : 0
  const run = (days: number) => setSim(simulate(sim, P, days))
  return (
    <LabSection id="explore" eyebrow="Explore" title="Sunny or rainy?">
      <Prose>
        <p>
          A town's weather follows two rules: a sunny day turns rainy with chance <Tex>{'a'}</Tex>,
          and a rainy day turns sunny with chance <Tex>{'b'}</Tex>. Run the chain day by day and
          compare the share of sunny days with the long-run prediction.
        </p>
      </Prose>
      <PredictReveal
        question="With $a = 20\%$ and $b = 50\%$, what share of days will be sunny in the long run?"
        options={['50%', 'About 71%', '80%', '20%']}
        answer={1}
        explanation="Sunny days are left at rate $0.2$, rainy days at rate $0.5$, so rainy spells are shorter. The long-run share is $\tfrac{b}{a + b} = \tfrac{0.5}{0.7} \approx 71\%$."
      />
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <TwoStateDiagram a={a} b={b} current={sim.current} />
          <div
            className="mt-2 flex h-4 gap-px overflow-hidden rounded"
            role="img"
            aria-label={`The last ${sim.recent.length} days`}
          >
            {sim.recent.map((s, i) => (
              <div
                key={i}
                className="min-w-0 flex-1"
                style={{ background: s === 0 ? SUN : RAIN, opacity: 0.8 }}
              />
            ))}
          </div>
        </div>
        <div className="grid gap-x-6 gap-y-3 px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label="a: sunny → rainy"
            value={a}
            min={0}
            max={1}
            step={0.05}
            format={pct}
            onChange={(v) => {
              setA(v)
              setSim(NEW_SIM)
            }}
            color={SUN}
          />
          <Slider
            label="b: rainy → sunny"
            value={b}
            min={0}
            max={1}
            step={0.05}
            format={pct}
            onChange={(v) => {
              setB(v)
              setSim(NEW_SIM)
            }}
            color={RAIN}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 px-3 pt-3 sm:px-4">
          <Button
            size="sm"
            variant="primary"
            icon={<StepForward className="size-4" />}
            onClick={() => run(1)}
          >
            1 day
          </Button>
          <Button size="sm" variant="ghost" onClick={() => run(100)}>
            100 days
          </Button>
          <Button size="sm" variant="ghost" onClick={() => run(1000)}>
            1000 days
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="size-4" />}
            onClick={() => setSim(NEW_SIM)}
            disabled={sim.days === 0}
          >
            Reset
          </Button>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'days run', value: sim.days },
              { label: 'sunny so far', value: sim.days ? pct(share) : '—', color: SUN },
              {
                label: 'long run b/(a + b)',
                value: pi == null ? 'never switches' : pct(pi),
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-settle" when={pi != null && sim.days >= 500 && Math.abs(share - pi) < 0.03}>
          Run at least 500 days. Does the sunny share match the long-run prediction?
        </TryThis>
        <TryThis id="t-even" when={a === b && a > 0}>
          Make the long run exactly 50/50. Is there more than one way?
        </TryThis>
        <TryThis id="t-absorb" when={a === 0 && b > 0}>
          Set <Tex>{'a = 0'}</Tex>. What happens once the first sunny day arrives?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const WEATHER3: Matrix = [
  [0.6, 0.3, 0.1],
  [0.3, 0.4, 0.3],
  [0.2, 0.3, 0.5],
]
const CYCLE: Matrix = [
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 0],
]
const NAMES = ['Sunny', 'Cloudy', 'Rainy']
const COLS = [SUN, CLOUD, RAIN]

const matTex = (P: Matrix) =>
  `P = \\begin{bmatrix} ${P.map((r) => r.map((x) => formatNumber(x, 2)).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`

function DistBars({ dist, start }: { dist: number[]; start: number }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <p className="text-sm font-semibold" style={{ color: COLS[start] }}>
        Start {NAMES[start].toLowerCase()}
      </p>
      {dist.map((p, j) => (
        <div key={j} className="flex items-center gap-2 text-xs">
          <span className="w-12 shrink-0 text-ink-2">{NAMES[j]}</span>
          <div className="h-3 min-w-0 flex-1 overflow-hidden rounded bg-surface-2">
            <div
              className="h-full rounded"
              style={{ width: `${p * 100}%`, background: COLS[j], opacity: 0.8 }}
            />
          </div>
          <span className="w-10 shrink-0 text-right tabular-nums">{Math.round(p * 100)}%</span>
        </div>
      ))}
    </div>
  )
}

function ForgetExplorer() {
  const [kind, setKind] = useState<'weather' | 'cycle'>('weather')
  const [n, setN] = useState(0)
  const P = kind === 'weather' ? WEATHER3 : CYCLE
  const dists = [0, 1, 2].map((i) => after(startAt(i, 3), P, n))
  const gap = spread(dists)
  return (
    <LabSection id="forget" eyebrow="Explore" title="Forget where you started">
      <Prose>
        <p>
          A three-state weather chain. Each column starts from a different, certain day: definitely
          sunny, definitely cloudy, definitely rainy. Slide the number of days forward and watch the
          forecasts. After enough days, does it matter where you started?
        </p>
      </Prose>
      <Figure>
        <div className="space-y-3 px-3 pt-3 sm:px-4">
          <Segmented
            label="Chain"
            value={kind}
            onChange={(k) => {
              setKind(k)
              setN(0)
            }}
            options={[
              { value: 'weather', label: 'Weather' },
              { value: 'cycle', label: 'Strict cycle' },
            ]}
          />
          <div className="overflow-x-auto text-center">
            <Tex display>{matTex(P)}</Tex>
          </div>
          <p className="text-center text-xs text-ink-2">Rows and columns: sunny, cloudy, rainy.</p>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 px-3 pt-3 sm:grid-cols-3 sm:px-4">
          {dists.map((d, i) => (
            <DistBars key={i} dist={d} start={i} />
          ))}
        </div>
        <div className="px-3 pt-3 sm:px-4">
          <Slider label="Days ahead n" value={n} min={0} max={20} step={1} onChange={setN} />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'days ahead', value: n },
              { label: 'biggest disagreement', value: pct(gap) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-forget" when={kind === 'weather' && gap < 0.01}>
          Find how many days it takes for all three forecasts to agree within 1%.
        </TryThis>
        <TryThis id="t-cycle" when={kind === 'cycle' && n >= 4}>
          Switch to the strict cycle and go forward 4 or more days. Does it ever settle?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [a, setA] = useState(0.5)
  const [b, setB] = useState(0.5)
  const pi = stationary2(a, b)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-one-step"
          index={1}
          prompt="Today is sunny. A sunny day turns rainy with chance 0.3. What is the chance that tomorrow is rainy?"
          answer={0.3}
          tolerance={0.001}
          explanation="One step: just read the sunny row of the matrix. The chance is 0.3."
        />
        <NumericChallenge
          id="c-two-step"
          index={2}
          prompt="With $P = \begin{bmatrix} 0.7 & 0.3 \\ 0.4 & 0.6 \end{bmatrix}$ (sunny, rainy) and a sunny day today, what is the chance of sun in two days?"
          answer={0.61}
          tolerance={0.001}
          hint="Sunny then sunny, or rainy then sunny."
          explanation="$0.7 \times 0.7 + 0.3 \times 0.4 = 0.49 + 0.12 = 0.61$."
        />
        <NumericChallenge
          id="c-stationary"
          index={3}
          prompt="A two-state chain switches from A to B with chance 0.1 and from B to A with chance 0.3. What share of the time is it in A in the long run?"
          answer={0.75}
          tolerance={0.001}
          explanation="$\tfrac{b}{a + b} = \tfrac{0.3}{0.4} = 0.75$."
        />
        <McqChallenge
          id="c-property"
          index={4}
          prompt="What is the Markov property?"
          options={[
            { text: 'The next state depends only on the current state', correct: true },
            { text: 'Every state is equally likely', why: 'The chances can be anything.' },
            { text: 'The chain eventually stops', why: 'Chains keep moving forever.' },
            {
              text: 'The next state depends on the whole history',
              why: 'That is exactly what it rules out.',
            },
          ]}
          explanation="Given the present, the past adds nothing: tomorrow depends only on today."
        />
        <McqChallenge
          id="c-rows"
          index={5}
          prompt="In a transition matrix with rows for “from” and columns for “to”, what must be true?"
          options={[
            { text: 'Each row adds to 1', correct: true },
            {
              text: 'Each column adds to 1',
              why: 'Columns are where you arrive; many states can feed one.',
            },
            { text: 'The diagonal is all zeros', why: 'Staying put is allowed.' },
            { text: 'It is symmetric', why: 'Going A → B can be likelier than B → A.' },
          ]}
          explanation="From any state you must go somewhere (possibly staying put), so each row's chances add to 1."
        />
        <InteractiveChallenge
          id="c-eighty"
          index={6}
          prompt="Set the two switching chances so that, in the long run, 80% of days are sunny."
          solved={pi != null && a > 0 && Math.abs(pi - 0.8) < 1e-6}
          hint="You need $\tfrac{b}{a + b} = 0.8$, so $b = 4a$."
          explanation="Any pair with $b = 4a$ works, such as $a = 0.1$, $b = 0.4$ or $a = 0.2$, $b = 0.8$."
          onReset={() => {
            setA(0.5)
            setB(0.5)
          }}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <TwoStateDiagram a={a} b={b} current={-1} />
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Slider
                label="a: sunny → rainy"
                value={a}
                min={0}
                max={1}
                step={0.05}
                format={pct}
                onChange={setA}
                color={SUN}
              />
              <Slider
                label="b: rainy → sunny"
                value={b}
                min={0}
                max={1}
                step={0.05}
                format={pct}
                onChange={setB}
                color={RAIN}
              />
            </div>
            <p className="text-sm">Long-run sunny share: {pi == null ? '—' : pct(pi)}</p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

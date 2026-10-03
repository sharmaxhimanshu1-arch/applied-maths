import { useState } from 'react'
import { clamp, snap } from '@/math/core'
import { binomialPmf, normalCdf, normalPdf } from '@/math/stats'
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
import { AreaUnder, FunctionGraph, Label, MovablePoint, Plot, Segment, usePlot } from '@/viz'
import { percent } from '../_shared/fraction'
import { num } from '../_shared/tex'

const CURVE = 'var(--c-blue)'
const SHADE = 'var(--c-blue)'
const X_RANGE = [-6, 6] as const

/** The bell curve with a shaded interval [a, b] whose ends you can drag along the axis. */
function BellPlot({
  mu,
  sigma,
  a,
  b,
  onA,
  onB,
}: {
  mu: number
  sigma: number
  a: number
  b: number
  onA: (x: number) => void
  onB: (x: number) => void
}) {
  const pdf = (x: number) => normalPdf(x, mu, sigma)
  const top = Math.max(0.45, normalPdf(mu, mu, sigma) * 1.12)
  const along = ([x]: readonly [number, number]): [number, number] => [
    snap(clamp(x, X_RANGE[0], X_RANGE[1]), 0.1),
    0,
  ]
  const p = Math.abs(normalCdf(b, mu, sigma) - normalCdf(a, mu, sigma))
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  return (
    <Plot
      view={{ xMin: X_RANGE[0], xMax: X_RANGE[1], yMin: -top * 0.1, yMax: top }}
      height={300}
      tickLabels={false}
      ariaLabel={`Normal curve with mean ${num(mu)} and standard deviation ${num(sigma)}; ${percent(p)} of the area lies between ${num(lo)} and ${num(hi)}`}
    >
      <AreaUnder fn={pdf} a={lo} b={hi} color={SHADE} opacity={0.28} />
      <SigmaTicks mu={mu} sigma={sigma} />
      <FunctionGraph fn={pdf} color={CURVE} width={2.75} />
      <Label
        at={[(lo + hi) / 2, pdf((lo + hi) / 2) * 0.45]}
        anchor="center"
        className="font-semibold"
      >
        {percent(p)}
      </Label>
      <MovablePoint
        x={a}
        y={0}
        onMove={(x) => onA(x)}
        constrain={along}
        step={0.1}
        color={SHADE}
        size={6}
        label="Left end of the shaded region"
      />
      <MovablePoint
        x={b}
        y={0}
        onMove={(x) => onB(x)}
        constrain={along}
        step={0.1}
        color={SHADE}
        size={6}
        label="Right end of the shaded region"
      />
    </Plot>
  )
}

/** Dashed markers at μ and μ ± kσ, labelled in standard deviations. */
function SigmaTicks({ mu, sigma }: { mu: number; sigma: number }) {
  const t = usePlot()
  const peak = normalPdf(mu, mu, sigma)
  return (
    <g aria-hidden>
      {[-3, -2, -1, 0, 1, 2, 3].map((k) => {
        const x = mu + k * sigma
        if (x < t.view.xMin || x > t.view.xMax) return null
        return (
          <g key={k}>
            <Segment
              from={[x, 0]}
              to={[x, k === 0 ? peak : normalPdf(x, mu, sigma)]}
              color="var(--ink-3)"
              dashed
              width={1}
            />
            <Label at={[x, 0]} anchor="top" offset={[0, 14]} className="text-[11px] text-ink-2">
              {k === 0 ? 'μ' : `${k > 0 ? '+' : '−'}${Math.abs(k)}σ`}
            </Label>
          </g>
        )
      })}
    </g>
  )
}

export default function NormalDistributionLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="The bell curve">
        <Prose>
          <p>
            Heights, test scores, measurement errors, the weight of a bag of crisps: plot lots of
            them and you keep getting the same shape, a hump in the middle tailing off on both
            sides. That's the <strong>normal distribution</strong>.
          </p>
          <p>
            Two numbers describe it completely: the <strong>mean</strong> <Tex>\mu</Tex> (where the
            centre is) and the <strong>standard deviation</strong> <Tex>\sigma</Tex> (how wide it
            is). And the area under the curve is probability.
          </p>
        </Prose>
      </LabSection>
      <ShapeExplorer />
      <SumsExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The formula and the 68–95–99.7 rule">
        <Formula
          tex={'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}}\\; e^{-\\frac{(x - \\mu)^2}{2\\sigma^2}}'}
          caption="Height of the curve at $x$. The total area under it is always 1."
        />
        <Formula
          tex={'z = \\frac{x - \\mu}{\\sigma}'}
          caption="A z-score: how many standard deviations $x$ is from the mean."
        />
        <Prose>
          <p>
            Every normal curve is the same shape, just shifted and stretched, so the areas depend
            only on <Tex>z</Tex>: about <strong>68%</strong> of values lie within 1σ of the mean,{' '}
            <strong>95%</strong> within 2σ, and <strong>99.7%</strong> within 3σ.
          </p>
        </Prose>
        <Callout kind="insight" title="Probability is area">
          <p>
            For a smooth (continuous) quantity, the chance of hitting one exact value, like a height
            of exactly 170.000… cm, is 0. Only ranges have probability: the area under the curve
            between their ends.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet the bell curve">
        <RealWorld
          items={[
            {
              title: 'Manufacturing',
              body: '“Six sigma” quality means defects only happen beyond 6 standard deviations from target: a few in a million.',
            },
            {
              title: 'Exam grading',
              body: 'Standardised scores like IQ (μ = 100, σ = 15) are z-scores in disguise: 130 means 2σ above average, the top 2.3%.',
            },
            {
              title: 'Measurement error',
              body: 'Repeated measurements scatter around the true value in a bell shape, which is why scientists report results as “± σ”.',
            },
            {
              title: 'Finance',
              body: 'Risk models often assume normal returns. Real markets have fatter tails, which is why “once in a century” crashes happen more often.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'The normal distribution is set by its mean $\\mu$ (centre) and standard deviation $\\sigma$ (spread).',
            'Probability is area under the curve; the total area is 1.',
            'About 68% lies within 1σ of the mean, 95% within 2σ, 99.7% within 3σ.',
            '$z = (x - \\mu)/\\sigma$ measures distance from the mean in standard deviations.',
            'Adding up many small random effects produces a bell curve.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function ShapeExplorer() {
  const [mu, setMu] = useState(0)
  const [sigma, setSigma] = useState(1.5)
  const [a, setA] = useState(-1)
  const [b, setB] = useState(2)
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  const p = normalCdf(hi, mu, sigma) - normalCdf(lo, mu, sigma)
  const near = (x: number, y: number) => Math.abs(x - y) < 0.051
  const within = (k: number) => near(lo, mu - k * sigma) && near(hi, mu + k * sigma)
  const setWithin = (k: number) => {
    setA(snap(mu - k * sigma, 0.1))
    setB(snap(mu + k * sigma, 0.1))
  }
  return (
    <LabSection id="explore" eyebrow="Explore" title="Shape the bell, shade the area">
      <Prose>
        <p>
          Slide <Tex>\mu</Tex> and <Tex>\sigma</Tex> to move and stretch the curve. Drag the two
          handles on the axis to shade a region: the shaded area is the probability of landing
          there.
        </p>
      </Prose>
      <PredictReveal
        question="If you make σ twice as big, what happens to the peak of the curve?"
        options={[
          'It gets twice as tall',
          'It stays the same height',
          'It gets half as tall',
          'It moves to the right',
        ]}
        answer={2}
        explanation="The curve spreads out to twice the width, and since the total area must stay 1, the peak drops to half the height."
      />
      <Figure>
        <BellPlot mu={mu} sigma={sigma} a={a} b={b} onA={setA} onB={setB} />
        <div className="grid gap-4 border-t border-line p-3 sm:p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Slider
              label={<Tex>\mu</Tex>}
              name="Mean mu"
              value={mu}
              min={-3}
              max={3}
              step={0.1}
              onChange={setMu}
              color={CURVE}
            />
            <Slider
              label={<Tex>\sigma</Tex>}
              name="Standard deviation sigma"
              value={sigma}
              min={0.4}
              max={2.5}
              step={0.1}
              onChange={setSigma}
              color={CURVE}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((k) => (
              <Button
                key={k}
                size="sm"
                variant={within(k) ? 'soft' : 'ghost'}
                onClick={() => setWithin(k)}
              >
                Within {k}σ
              </Button>
            ))}
          </div>
          <Readouts
            items={[
              { label: 'shaded from', value: `${num(lo, 1)} to ${num(hi, 1)}` },
              {
                label: 'in standard deviations',
                value: `z = ${num((lo - mu) / sigma)} to ${num((hi - mu) / sigma)}`,
              },
              { label: 'probability', value: percent(p), color: SHADE },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-1sd" when={within(1)}>
          Shade from one standard deviation below the mean to one above. What fraction is that?
        </TryThis>
        <TryThis id="t-2sd" when={within(2)}>
          Now shade within two standard deviations. Then change <Tex>\sigma</Tex> and press the
          button again: does the percentage change?
        </TryThis>
        <TryThis id="t-narrow" when={sigma <= 0.6}>
          Make <Tex>\sigma</Tex> small. Why does the peak shoot up?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

/** Binomial bars for k = 0..n, as rectangles one unit wide. */
function Bars({ n }: { n: number }) {
  const t = usePlot()
  return (
    <g aria-hidden>
      {Array.from({ length: n + 1 }, (_, k) => {
        const h = binomialPmf(k, n, 0.5)
        const x0 = t.sx(k - 0.5)
        const x1 = t.sx(k + 0.5)
        const y = t.sy(h)
        return (
          <rect
            key={k}
            x={x0 + Math.min(1, (x1 - x0) * 0.08)}
            y={y}
            width={Math.max(0.5, x1 - x0 - Math.min(2, (x1 - x0) * 0.16))}
            height={t.sy(0) - y}
            rx={Math.min(3, (x1 - x0) / 4)}
            fill="var(--c-yellow)"
            fillOpacity={0.85}
          />
        )
      })}
    </g>
  )
}

function SumsExplorer() {
  const [n, setN] = useState(4)
  const mu = n / 2
  const sigma = Math.sqrt(n) / 2
  const top = binomialPmf(Math.floor(n / 2), n, 0.5) * 1.15
  const curve = (x: number) => normalPdf(x, mu, sigma)
  return (
    <LabSection id="sums" eyebrow="Explore" title="Where bells come from">
      <Prose>
        <p>
          Flip <Tex>n</Tex> coins and count the heads. The bars show the exact chances (the binomial
          distribution); the blue curve is the normal curve with the same mean and spread. Add more
          coins and watch the two merge.
        </p>
      </Prose>
      <Figure>
        <Plot
          view={{ xMin: -0.5, xMax: n + 0.5, yMin: -top * 0.1, yMax: top }}
          height={260}
          ariaLabel={`Number of heads in ${n} coin flips, with the matching normal curve`}
          xIntegers
        >
          <Bars n={n} />
          <FunctionGraph fn={curve} color={CURVE} width={2.5} />
        </Plot>
        <div className="grid gap-3 border-t border-line p-3 sm:p-4">
          <Slider label="Coins flipped n" value={n} min={1} max={60} step={1} onChange={setN} />
          <Readouts
            items={[
              { label: 'mean', value: `${num(mu)} heads` },
              { label: 'standard deviation', value: num(sigma) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-one" when={n <= 2}>
          Start with 1 or 2 coins. Is that a bell?
        </TryThis>
        <TryThis id="t-many" when={n >= 30}>
          Flip 30 or more coins. How close are the bars to the curve now?
        </TryThis>
      </TryThisList>
      <Prose className="mt-4">
        <p>
          This is no accident. Whenever a quantity is the sum of many small, independent random
          pieces, like a height built from many genes and meals, its distribution is close to
          normal. The Central Limit Theorem lab shows why.
        </p>
      </Prose>
    </LabSection>
  )
}

function Practice() {
  const [a, setA] = useState(-0.5)
  const [b, setB] = useState(1.5)
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  const p = normalCdf(hi) - normalCdf(lo)
  const solved = Math.abs(lo + hi) < 0.051 && Math.abs(p - 0.6827) < 0.01
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-height"
          index={1}
          prompt="Adult heights have mean 170 cm and standard deviation 10 cm. What height is exactly 2 standard deviations above the mean?"
          answer={190}
          unit="cm"
          explanation="$170 + 2 \times 10 = 190$ cm. Only about 2.3% of people are taller."
        />
        <NumericChallenge
          id="c-z"
          index={2}
          prompt="A test has mean 70 and standard deviation 5. What is the z-score of a mark of 85?"
          answer={3}
          explanation="$z = \frac{85 - 70}{5} = 3$: three standard deviations above average, rarer than 1 in 700."
        />
        <McqChallenge
          id="c-rule"
          index={3}
          prompt="Roughly what percentage of a normal distribution lies within 2 standard deviations of the mean?"
          options={[
            { text: '95%', correct: true },
            { text: '68%', why: 'That is within 1 standard deviation.' },
            { text: '99.7%', why: 'That is within 3 standard deviations.' },
            { text: '50%', why: 'Half lies above the mean; within ±2σ is much more.' },
          ]}
          explanation="The 68–95–99.7 rule: 95% within 2σ."
        />
        <InteractiveChallenge
          id="c-middle"
          index={4}
          prompt="This curve has $\mu = 0$ and $\sigma = 1$. Shade the **middle 68%**: a region centred on the mean."
          solved={solved}
          hint="68% is the share within one standard deviation of the mean."
          explanation="From $-1$ to $1$: within one standard deviation, about 68.3% of the area."
          onReset={() => {
            setA(-0.5)
            setB(1.5)
          }}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <BellPlot mu={0} sigma={1} a={a} b={b} onA={setA} onB={setB} />
          </div>
        </InteractiveChallenge>
        <McqChallenge
          id="c-sigma"
          index={5}
          prompt="What happens to the curve when $\sigma$ doubles (and $\mu$ stays the same)?"
          options={[
            { text: 'It gets twice as wide and half as tall', correct: true },
            { text: 'It moves to the right', why: 'Moving is what changing $\\mu$ does.' },
            {
              text: 'It gets twice as tall',
              why: 'Wider means lower: the area under it must stay 1.',
            },
            { text: 'Nothing: σ only changes the labels', why: 'σ sets the width of the bell.' },
          ]}
          explanation="The area must stay 1, so a curve twice as wide must be half as tall."
        />
      </ChallengeSet>
    </LabSection>
  )
}

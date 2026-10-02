import { Eye, RefreshCw, RotateCcw } from 'lucide-react'
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
import { RunButtons } from '@/tools/probability/charts'
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'
import { Label, Plot, Polyline, Segment } from '@/viz'
import { DotGrid, type GridCell } from '../_shared/DotGrid'
import { percent } from '../_shared/fraction'

const SICK = 'var(--c-red)'
const HEALTHY = 'var(--c-blue)'

type TestSetup = { prevalence: number; sensitivity: number; falseAlarm: number }

function outcomes({ prevalence, sensitivity, falseAlarm }: TestSetup) {
  const sick = Math.round(1000 * prevalence)
  const truePos = Math.round(sick * sensitivity)
  const healthy = 1000 - sick
  const falsePos = Math.round(healthy * falseAlarm)
  return {
    sick,
    truePos,
    falseNeg: sick - truePos,
    healthy,
    falsePos,
    trueNeg: healthy - falsePos,
    positives: truePos + falsePos,
  }
}

const pct1 = (v: number) => percent(v, 1)

/** Belief as a whole percentage that never pretends to be certain. */
const beliefText = (v: number) => (v > 0.995 ? 'over 99%' : v < 0.005 ? 'under 1%' : percent(v, 0))

/** 1,000 people: colour = sick or healthy, filled = tested positive. */
function TestPicture({
  setup,
  onSetup,
  positivesOnly,
  onlyFalseAlarm = false,
}: {
  setup: TestSetup
  onSetup: (s: TestSetup) => void
  positivesOnly: boolean
  onlyFalseAlarm?: boolean
}) {
  const o = outcomes(setup)
  const group = (n: number, color: string, positive: boolean): GridCell[] =>
    Array.from({ length: n }, () => ({
      color,
      hollow: !positive,
      dim: positivesOnly && !positive,
    }))
  const cells = [
    ...group(o.truePos, SICK, true),
    ...group(o.falseNeg, SICK, false),
    ...group(o.falsePos, HEALTHY, true),
    ...group(o.trueNeg, HEALTHY, false),
  ]
  return (
    <div className="grid gap-4 p-3 sm:p-4">
      <DotGrid
        cells={cells}
        columns={50}
        size={10}
        gap={2.5}
        ariaLabel={`1,000 people: ${o.sick} sick (${o.truePos} test positive), ${o.healthy} healthy (${o.falsePos} test positive)`}
      />
      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-2">
        <LegendDot color={SICK} filled label={`sick, tested positive (${o.truePos})`} />
        <LegendDot color={SICK} label={`sick, tested negative (${o.falseNeg})`} />
        <LegendDot color={HEALTHY} filled label={`healthy, tested positive (${o.falsePos})`} />
        <LegendDot color={HEALTHY} label={`healthy, tested negative (${o.trueNeg})`} />
      </ul>
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider
          label="How common the disease is"
          value={setup.prevalence}
          min={0.001}
          max={0.2}
          step={0.001}
          format={pct1}
          color={SICK}
          disabled={onlyFalseAlarm}
          onChange={(v) => onSetup({ ...setup, prevalence: v })}
        />
        <Slider
          label="Sick people the test catches"
          value={setup.sensitivity}
          min={0.5}
          max={1}
          step={0.01}
          format={(v) => percent(v, 0)}
          disabled={onlyFalseAlarm}
          onChange={(v) => onSetup({ ...setup, sensitivity: v })}
        />
        <Slider
          label="False alarms among the healthy"
          value={setup.falseAlarm}
          min={0}
          max={0.2}
          step={0.005}
          format={pct1}
          color={HEALTHY}
          onChange={(v) => onSetup({ ...setup, falseAlarm: v })}
        />
      </div>
    </div>
  )
}

function LegendDot({ color, filled, label }: { color: string; filled?: boolean; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span
        aria-hidden
        className="size-3 rounded-full border-2"
        style={{ borderColor: color, background: filled ? color : 'transparent' }}
      />
      {label}
    </li>
  )
}

function posterior(s: TestSetup) {
  const o = outcomes(s)
  return o.positives ? o.truePos / o.positives : 0
}

export default function BayesTheoremLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Update your beliefs with evidence">
        <Prose>
          <p>
            You start with a belief (“this disease is rare”), then evidence arrives (“the test is
            positive”). How much should the evidence change your mind?{' '}
            <strong>Bayes' theorem</strong> is the exact recipe.
          </p>
          <p>
            Its most important lesson is surprising: evidence has to be weighed against how likely
            things were <em>before</em> you saw it, the <strong>base rate</strong>. Ignore that, and
            even a good test will fool you.
          </p>
        </Prose>
      </LabSection>
      <TestExplorer />
      <CoinExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Bayes' theorem">
        <Formula
          tex={'P(H \\mid E) = \\frac{P(E \\mid H)\\,P(H)}{P(E)}'}
          caption="Posterior = likelihood × prior ÷ how likely the evidence was overall."
        />
        <Formula
          tex={'P(E) = P(E \\mid H)\\,P(H) + P(E \\mid \\text{not } H)\\,P(\\text{not } H)'}
          caption="The evidence can arise in two ways: with $H$ true, or with it false."
        />
        <Prose>
          <p>
            For the test: <Tex>H</Tex> = “sick”, <Tex>E</Tex> = “positive”. With 1% sick, a 90%
            catch rate and 9% false alarms,
          </p>
        </Prose>
        <div className="overflow-x-auto text-[0.95rem]">
          <Tex display>
            {
              'P(\\text{sick} \\mid +) = \\frac{0.9 \\times 0.01}{0.9 \\times 0.01 + 0.09 \\times 0.99} \\approx 0.09'
            }
          </Tex>
        </div>
        <Prose>
          <p>
            That's the same 9 true positives out of 98 positives you counted in the picture.
            Counting people (“natural frequencies”) is often the easiest way to do Bayes in your
            head.
          </p>
        </Prose>
        <Callout kind="misconception" title="The prosecutor's fallacy">
          <p>
            “Only 1 in a million innocent people would match this evidence” is{' '}
            <Tex>{'P(\\text{match} \\mid \\text{innocent})'}</Tex>. It is not the chance the suspect
            is innocent. In a country of 50 million, about 50 innocent people would match too.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet Bayes">
        <RealWorld
          items={[
            {
              title: 'Medical screening',
              body: 'Doctors confirm positive screening results with a second, different test, because one positive for a rare condition is often a false alarm.',
            },
            {
              title: 'Spam filters',
              body: 'Naive Bayes filters combine the evidence of each word in an email to update the probability that it is spam.',
            },
            {
              title: 'Search and rescue',
              body: 'Searchers keep a probability map of where a missing boat might be and update it after every area they search.',
            },
            {
              title: 'Machine learning',
              body: 'Bayesian methods let models say how certain they are, and update as new data arrives.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            '$P(H \\mid E) = \\dfrac{P(E \\mid H)\\,P(H)}{P(E)}$: posterior = likelihood × prior ÷ evidence.',
            'Always weigh evidence against the base rate (the prior).',
            'For rare conditions, most positive results can be false alarms, even from an accurate test.',
            'Counting people (natural frequencies) makes Bayes easy to see.',
            'Each new piece of evidence turns the last posterior into the next prior.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function TestExplorer() {
  const [setup, setSetup] = useState<TestSetup>({
    prevalence: 0.01,
    sensitivity: 0.9,
    falseAlarm: 0.09,
  })
  const [positivesOnly, setPositivesOnly] = useState(false)
  const [retests, setRetests] = useState(0)
  const o = outcomes(setup)
  const post = posterior(setup)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Test 1,000 people">
      <PredictReveal
        question="A disease affects 1% of people. A test catches 90% of sick people, and wrongly flags 9% of healthy people. You test positive. How likely is it that you're sick?"
        options={['About 90%', 'About 50%', 'About 9%', 'About 1%']}
        answer={2}
        explanation="Only about 9%. Out of 1,000 people, 10 are sick and 9 of them test positive, but 89 of the 990 healthy people test positive too. So only 9 of the 98 positives are actually sick. Count them below."
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Who to show"
            value={positivesOnly ? 'pos' : 'all'}
            onChange={(v) => setPositivesOnly(v === 'pos')}
            options={[
              { value: 'all', label: 'Everyone' },
              { value: 'pos', label: 'Only positive tests' },
            ]}
          />
          <Button
            size="sm"
            variant="soft"
            icon={<RefreshCw className="size-4" />}
            disabled={o.positives === 0}
            onClick={() => {
              setSetup((s) => ({ ...s, prevalence: Math.min(0.999, Math.max(0.001, post)) }))
              setRetests((n) => n + 1)
            }}
          >
            Retest the positives
          </Button>
        </div>
        <TestPicture setup={setup} onSetup={setSetup} positivesOnly={positivesOnly} />
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'positive tests', value: String(o.positives) },
              { label: 'actually sick among them', value: String(o.truePos), color: SICK },
              {
                label: <Tex>{'P(\\text{sick} \\mid +)'}</Tex>,
                value: o.positives ? pct1(post) : '–',
                color: SICK,
              },
            ]}
          />
          <p className="mt-3 text-[0.9375rem] text-ink-2">
            Of 1,000 people, <strong className="text-ink">{o.sick}</strong> are sick and{' '}
            <strong className="text-ink">{o.truePos}</strong> of them test positive. Of the{' '}
            {o.healthy} healthy people, <strong className="text-ink">{o.falsePos}</strong> test
            positive too. So of {o.positives} positives, {o.truePos} are sick
            {o.positives ? `: ${pct1(post)}.` : '.'}
          </p>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-positives" when={positivesOnly}>
          Show only the positive tests. What fraction of them are red (actually sick)?
        </TryThis>
        <TryThis id="t-majority" when={o.positives > 0 && post > 0.5}>
          Change the sliders until a positive test means you're more likely sick than healthy. Which
          slider matters most?
        </TryThis>
        <TryThis id="t-retest" when={retests >= 1}>
          Press <strong>Retest the positives</strong>: everyone who tested positive takes the test
          again. Why does the second positive mean so much more?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const TRICK_HEADS = 0.8

// Which coin is in your hand, and its flips (a fresh seed each visit).
const coinRng = createRng(Date.now())

function CoinExplorer() {
  const [trick, setTrick] = useState(() => coinRng.bernoulli(0.5))
  const [flips, setFlips] = useState<boolean[]>([])
  const [revealed, setRevealed] = useState(false)
  const [everSure, setEverSure] = useState(false)
  const beliefs = flips.reduce<number[]>(
    (acc, heads) => {
      const prior = acc[acc.length - 1]
      const lt = heads ? TRICK_HEADS : 1 - TRICK_HEADS
      const lf = 0.5
      return [...acc, (lt * prior) / (lt * prior + lf * (1 - prior))]
    },
    [0.5],
  )
  const belief = beliefs[beliefs.length - 1]
  const heads = flips.filter(Boolean).length

  const flip = (n: number) => {
    const next = [...flips]
    for (let k = 0; k < n; k++) next.push(coinRng.bernoulli(trick ? TRICK_HEADS : 0.5))
    setFlips(next)
    const last = next.reduce((p, h) => {
      const lt = h ? TRICK_HEADS : 1 - TRICK_HEADS
      return (lt * p) / (lt * p + 0.5 * (1 - p))
    }, 0.5)
    if (last > 0.95 || last < 0.05) setEverSure(true)
  }
  const newCoin = () => {
    setTrick(coinRng.bernoulli(0.5))
    setFlips([])
    setRevealed(false)
  }
  const path: Vec2[] = beliefs.map((b, i) => [i, b])
  const xMax = Math.max(10, flips.length)

  return (
    <LabSection id="update" eyebrow="Explore" title="Which coin is it?">
      <Prose>
        <p>
          A bag holds two coins: a fair one, and a trick coin that lands heads 80% of the time. You
          pull one out without looking, so you start 50/50. Each flip is evidence. Watch your belief
          that it's the trick coin rise and fall.
        </p>
      </Prose>
      <Figure>
        <div className="grid gap-4 p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <RunButtons counts={[1, 10]} onRun={flip} label="Flip" />
            <Button
              size="sm"
              variant="ghost"
              icon={<Eye className="size-4" />}
              disabled={revealed}
              onClick={() => setRevealed(true)}
            >
              Reveal the coin
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw className="size-4" />}
              onClick={newCoin}
            >
              New coin
            </Button>
          </div>
          <div className="flex min-h-8 flex-wrap gap-1" aria-label="Flips so far">
            {flips.length === 0 && <span className="text-sm text-ink-3">No flips yet.</span>}
            {flips.slice(-40).map((h, i) => (
              <span
                key={`${flips.length}-${i}`}
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-[0.6875rem] font-bold',
                  h
                    ? 'bg-[var(--c-yellow)] text-[#1a1300]'
                    : 'border border-line-strong bg-surface-3 text-ink-2',
                )}
              >
                {h ? 'H' : 'T'}
              </span>
            ))}
          </div>
          <div className="grid gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium" style={{ color: 'var(--c-magenta)' }}>
                Trick coin {beliefText(belief)}
              </span>
              <span className="font-medium text-ink-2">Fair coin {beliefText(1 - belief)}</span>
            </div>
            <div
              className="flex h-4 overflow-hidden rounded-full bg-surface-3"
              role="img"
              aria-label={`Belief: ${beliefText(belief)} trick coin, ${beliefText(1 - belief)} fair coin`}
            >
              <div
                className="h-full transition-[width] duration-300"
                style={{ width: `${belief * 100}%`, background: 'var(--c-magenta)' }}
              />
            </div>
          </div>
          <Plot
            view={{ xMin: 0, xMax, yMin: 0, yMax: 1 }}
            height={170}
            ariaLabel={`Belief in the trick coin after each of ${flips.length} flips`}
            xLabel="flips"
          >
            <Segment from={[0, 0.5]} to={[xMax, 0.5]} color="var(--ink-3)" dashed width={1} />
            <Segment from={[0, 0.95]} to={[xMax, 0.95]} color="var(--good)" dashed width={1} />
            <Segment from={[0, 0.05]} to={[xMax, 0.05]} color="var(--good)" dashed width={1} />
            <Label
              at={[xMax, 0.95]}
              anchor="top-right"
              offset={[-4, 3]}
              className="text-[11px] text-ink-2"
            >
              95% sure
            </Label>
            {path.length > 1 && <Polyline points={path} color="var(--c-magenta)" width={2.5} />}
          </Plot>
          <Readouts
            items={[
              { label: 'flips', value: String(flips.length) },
              { label: 'heads', value: String(heads) },
              {
                label: 'the coin is',
                value: revealed ? (trick ? 'the trick coin' : 'the fair coin') : 'hidden',
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-sure" when={everSure}>
          Keep flipping until you are at least 95% sure which coin you have.
        </TryThis>
        <TryThis id="t-reveal" when={everSure && revealed}>
          Then reveal the coin. Were you right? (At 95% you'll be wrong about 1 time in 20.)
        </TryThis>
      </TryThisList>
      <Prose className="mt-4">
        <p>
          Each heads multiplies the odds in favour of the trick coin by{' '}
          <Tex>{'0.8 / 0.5 = 1.6'}</Tex>; each tails multiplies them by{' '}
          <Tex>{'0.2 / 0.5 = 0.4'}</Tex>. That's Bayes in action: yesterday's posterior is today's
          prior.
        </p>
      </Prose>
    </LabSection>
  )
}

function Practice() {
  const [setup, setSetup] = useState<TestSetup>({
    prevalence: 0.01,
    sensitivity: 0.9,
    falseAlarm: 0.09,
  })
  const solved = posterior(setup) >= 0.5 && Math.abs(setup.prevalence - 0.01) < 1e-9
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-screen"
          index={1}
          prompt="Of 1,000 people, 2% are sick. The test catches every sick person, but also flags 5% of healthy people. What is $P(\text{sick} \mid \text{positive})$?"
          answer={20 / 69}
          tolerance={0.01}
          hint="Count: how many sick people test positive? How many healthy people test positive?"
          explanation="20 sick people all test positive; 5% of the 980 healthy people is 49 more. So $\tfrac{20}{20 + 49} \approx 0.29$."
        />
        <McqChallenge
          id="c-common"
          index={2}
          prompt="Keep the same test, but suppose the disease becomes much more common. What happens to $P(\text{sick} \mid \text{positive})$?"
          options={[
            { text: 'It goes up', correct: true },
            {
              text: 'It stays the same: the test hasn’t changed',
              why: 'The test is the same, but the base rate changed, and the posterior depends on both.',
            },
            {
              text: 'It goes down',
              why: 'More sick people means more true positives among the positives.',
            },
            {
              text: 'It becomes exactly the catch rate',
              why: 'Only if there were no false alarms at all.',
            },
          ]}
          explanation="With more sick people, true positives make up a bigger share of all positives."
        />
        <NumericChallenge
          id="c-formula"
          index={3}
          prompt="$P(H) = 0.5$, $P(E \mid H) = 0.8$ and $P(E \mid \text{not } H) = 0.2$. What is $P(H \mid E)$?"
          answer={0.8}
          tolerance={0.005}
          hint="$P(E) = 0.8 \times 0.5 + 0.2 \times 0.5$."
          explanation="$\frac{0.8 \times 0.5}{0.8 \times 0.5 + 0.2 \times 0.5} = \frac{0.4}{0.5} = 0.8$."
        />
        <McqChallenge
          id="c-prosecutor"
          index={4}
          prompt="Only 1 in 10,000 innocent people would match the evidence. Does that mean there's only a 1 in 10,000 chance the suspect is innocent?"
          options={[
            {
              text: 'No: it depends on how many innocent people could have matched',
              correct: true,
            },
            {
              text: 'Yes, exactly',
              why: 'That confuses $P(\\text{match} \\mid \\text{innocent})$ with $P(\\text{innocent} \\mid \\text{match})$.',
            },
            {
              text: 'Yes, if the test is accurate',
              why: 'Accuracy alone never tells you the posterior; you also need the base rate.',
            },
            {
              text: 'No: the chance is exactly 50%',
              why: 'Nothing here gives 50%; it depends on the population.',
            },
          ]}
          explanation="In a city of a million, about 100 innocent people would match. The evidence alone can't single out the suspect: the prosecutor's fallacy."
        />
        <InteractiveChallenge
          id="c-better-test"
          index={5}
          prompt="The disease affects 1% of people and the test catches 90% of them. Lower the **false alarm** rate until a positive test means at least a 50% chance of being sick."
          solved={solved}
          hint="Positive tests should be at least half red: there are 9 sick positives, so allow at most 9 healthy ones."
          explanation="With 9 true positives, you need at most 9 false alarms among 990 healthy people: a rate below about 0.9%. Rare conditions need very specific tests."
          onReset={() => setSetup({ prevalence: 0.01, sensitivity: 0.9, falseAlarm: 0.09 })}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <TestPicture setup={setup} onSetup={setSetup} positivesOnly={false} onlyFalseAlarm />
            <p className="border-t border-line px-3 py-2 text-sm text-ink-2">
              <Tex>{'P(\\text{sick} \\mid +)'}</Tex> ={' '}
              <strong className="text-ink">{pct1(posterior(setup))}</strong>
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

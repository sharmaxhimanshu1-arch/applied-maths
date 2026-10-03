import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw } from 'lucide-react'
import { Fragment, useRef, useState, type KeyboardEvent } from 'react'
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
import { CoinExperiment, type CoinState } from '@/tools/probability/CoinExperiment'
import { RunButtons } from '@/tools/probability/charts'
import { Button } from '@/ui/Button'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'
import { fracTex, percent } from '../_shared/fraction'

const FACES = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]

type Pair = readonly [number, number]
const PAIRS: Pair[] = Array.from({ length: 36 }, (_, i) => [Math.floor(i / 6) + 1, (i % 6) + 1])

const EVENTS: { id: string; name: string; test: (p: Pair) => boolean }[] = [
  { id: 'seven', name: 'Sum is 7', test: ([a, b]) => a + b === 7 },
  { id: 'doubles', name: 'Doubles', test: ([a, b]) => a === b },
  { id: 'six', name: 'At least one 6', test: ([a, b]) => a === 6 || b === 6 },
  { id: 'big', name: 'Sum of 10 or more', test: ([a, b]) => a + b >= 10 },
  { id: 'even', name: 'First die even', test: ([a]) => a % 2 === 0 },
]

const selectionOf = (test: (p: Pair) => boolean) => PAIRS.map(test)
const sameSelection = (a: boolean[], b: boolean[]) => a.every((x, i) => x === b[i])
const SEVEN = selectionOf(EVENTS[0].test)
const NONE = PAIRS.map(() => false)

/** The 36 equally likely outcomes of two dice as toggle buttons (arrow keys move between them). */
function SampleSpace({
  selected,
  onToggle,
  counts,
  last,
}: {
  selected: boolean[]
  onToggle: (i: number) => void
  counts?: number[]
  last?: number | null
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const [focus, setFocus] = useState(0)
  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const delta = ({ ArrowRight: 1, ArrowLeft: -1, ArrowDown: 6, ArrowUp: -6 } as const)[
      e.key as 'ArrowRight'
    ]
    if (delta === undefined) return
    e.preventDefault()
    const next = Math.min(35, Math.max(0, i + delta))
    setFocus(next)
    refs.current[next]?.focus()
  }
  return (
    <div
      role="group"
      aria-label="The 36 outcomes of rolling two dice. Rows: first die. Columns: second die."
      className="mx-auto grid w-full max-w-xl grid-cols-[1.75rem_repeat(6,minmax(0,1fr))] gap-1 sm:gap-1.5"
    >
      <span aria-hidden />
      {FACES.map((Face, k) => (
        <Face key={k} aria-hidden className="mx-auto mb-0.5 size-5 text-ink-2" />
      ))}
      {FACES.map((Face, row) => (
        <Fragment key={row}>
          <Face aria-hidden className="my-auto size-5 text-ink-2" />
          {PAIRS.slice(row * 6, row * 6 + 6).map(([a, b], col) => {
            const i = row * 6 + col
            return (
              <button
                key={i}
                ref={(el) => {
                  refs.current[i] = el
                }}
                type="button"
                tabIndex={i === focus ? 0 : -1}
                aria-pressed={selected[i]}
                aria-label={`First die ${a}, second die ${b}, sum ${a + b}`}
                onClick={() => {
                  setFocus(i)
                  onToggle(i)
                }}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={cn(
                  'relative flex aspect-[1.25] flex-col items-center justify-center rounded-lg border text-center transition-colors',
                  selected[i]
                    ? 'border-transparent bg-accent text-accent-ink'
                    : 'border-line bg-surface hover:bg-surface-2',
                  last === i && 'ring-2 ring-[var(--c-orange)] ring-offset-1 ring-offset-surface',
                )}
              >
                <span className="text-[0.95rem] leading-none font-semibold sm:text-lg">
                  {a + b}
                </span>
                <span
                  className={cn(
                    'mt-0.5 hidden text-[0.6875rem] leading-none sm:block',
                    selected[i] ? 'opacity-80' : 'text-ink-3',
                  )}
                >
                  {a}+{b}
                </span>
                {counts && counts[i] > 0 && (
                  <span
                    className={cn(
                      'absolute top-0.5 right-1 hidden font-mono text-[0.625rem] sm:block',
                      selected[i] ? 'opacity-80' : 'text-ink-3',
                    )}
                  >
                    {counts[i]}
                  </span>
                )}
              </button>
            )
          })}
        </Fragment>
      ))}
    </div>
  )
}

export default function ProbabilityBasicsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Chance, measured">
        <Prose>
          <p>
            A single coin flip is unpredictable. But flip a thousand coins and something reliable
            appears: very close to half of them land heads. <strong>Probability</strong> is the
            number that describes that long-run pattern, from 0 (never happens) to 1 (always
            happens).
          </p>
          <p>
            You can find it two ways: by experiment (do it many times and count), or by reasoning
            (count the equally likely ways it can happen). This lab does both, and shows they agree.
          </p>
        </Prose>
      </LabSection>
      <CoinExplorer />
      <DiceExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The rules of the game">
        <Formula
          tex={
            'P(E) = \\frac{\\text{outcomes in } E}{\\text{all equally likely outcomes}} \\qquad 0 \\le P(E) \\le 1'
          }
          caption="Counting works when every outcome is equally likely, like the 36 pairs of dice."
        />
        <Formula
          tex={'P(\\text{not } E) = 1 - P(E)'}
          caption="Either $E$ happens or it doesn't, and the two chances add up to 1."
        />
        <Prose>
          <p>
            The <strong>frequency</strong> view says the same thing from the other side: if you
            repeat an experiment many times, the fraction of times <Tex>E</Tex> happens settles near{' '}
            <Tex>P(E)</Tex>. That is how a weather forecaster can say “70% chance of rain” about a
            day that only happens once: on many days like this one, it rained on about 70%.
          </p>
        </Prose>
        <Callout kind="misconception" title="The gambler's fallacy">
          <p>
            After five heads in a row, tails is not “due”. A coin has no memory: the next flip is
            still 50/50. Long runs even out because later flips swamp them, not because the coin
            corrects itself.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet probability">
        <RealWorld
          items={[
            {
              title: 'Weather forecasts',
              body: 'A 70% chance of rain means that, on many days with conditions like this, it rained on about 70% of them.',
            },
            {
              title: 'Insurance',
              body: 'Insurers price policies from long-run frequencies: how often, out of thousands of drivers, a crash actually happens.',
            },
            {
              title: 'Medicine',
              body: 'A side effect “in 1 of 1,000 patients” is a probability measured by counting in large trials.',
            },
            {
              title: 'Games',
              body: 'Board games, card games and lotteries are designed by counting outcomes, so the house or the designer knows the odds.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A probability is a number from 0 (impossible) to 1 (certain).',
            'With equally likely outcomes, $P(E) = \\dfrac{\\text{favourable}}{\\text{total}}$.',
            'Repeat an experiment many times and the fraction of times $E$ happens settles near $P(E)$.',
            '$P(\\text{not } E) = 1 - P(E)$.',
            "Coins and dice have no memory: past results don't change the next one.",
          ]}
        />
      </LabSection>
    </div>
  )
}

function CoinExplorer() {
  const [coin, setCoin] = useState<CoinState | null>(null)
  const flips = coin?.flips ?? 0
  return (
    <LabSection id="explore" eyebrow="Explore" title="Flip until it settles">
      <Prose>
        <p>
          Flip a fair coin a few times, then a lot of times. The right-hand chart tracks the
          fraction of heads so far; its horizontal axis stretches as you flip more, so 1, 10, 100
          and 1,000 flips get equal room.
        </p>
      </Prose>
      <PredictReveal
        question="You flip a fair coin 10 times. How likely is it to get exactly 5 heads?"
        options={['Certain', 'About 25%', 'About 50%', 'About 90%']}
        answer={1}
        explanation="Only about 25% (exactly $\tfrac{252}{1024}$). Exactly half is the single most likely result, but there are many other results close to it. Probability describes the long run, not each small batch."
      />
      <Figure>
        <CoinExperiment preset={{ p: 0.5, adjustableP: false }} onStateChange={setCoin} />
      </Figure>
      <TryThisList>
        <TryThis id="t-ten" when={flips >= 10}>
          Flip 10 times. Did you get exactly 5 heads?
        </TryThis>
        <TryThis id="t-thousand" when={flips >= 1000}>
          Now flip more than 1,000 times. Where does the proportion of heads settle?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function DiceExplorer() {
  const [selected, setSelected] = useState<boolean[]>(() => selectionOf(EVENTS[1].test))
  const [counts, setCounts] = useState<number[]>(() => PAIRS.map(() => 0))
  const [last, setLast] = useState<number | null>(null)
  const [rng] = useState(() => createRng(2024))
  const k = selected.filter(Boolean).length
  const rolls = counts.reduce((a, b) => a + b, 0)
  const hits = counts.reduce((a, c, i) => a + (selected[i] ? c : 0), 0)
  const activeEvent = EVENTS.find((e) => sameSelection(selected, selectionOf(e.test)))

  const roll = (n: number) => {
    const next = [...counts]
    let lastIndex = 0
    for (let r = 0; r < n; r++) {
      lastIndex = (rng.int(1, 6) - 1) * 6 + rng.int(1, 6) - 1
      next[lastIndex]++
    }
    setCounts(next)
    setLast(lastIndex)
  }

  return (
    <LabSection id="count" eyebrow="Explore" title="Count the ways">
      <Prose>
        <p>
          Two dice can land in 36 equally likely ways. Pick an event (or click squares to build your
          own) and its probability is just the shaded squares out of 36. Then roll the dice and
          check that reality agrees.
        </p>
      </Prose>
      <PredictReveal
        question="Rolling two dice and adding them up, which total is most likely?"
        options={['2', '7', '12', 'They are all equally likely']}
        answer={1}
        explanation="There are 6 ways to make 7 (1+6, 2+5, 3+4, 4+3, 5+2, 6+1) but only one way to make 2 or 12. That's why 7 matters so much in dice games."
      />
      <Figure>
        <div className="grid gap-3 border-b border-line p-3 sm:p-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Example events">
            {EVENTS.map((e) => (
              <Button
                key={e.id}
                size="sm"
                variant={activeEvent?.id === e.id ? 'soft' : 'ghost'}
                aria-pressed={activeEvent?.id === e.id}
                onClick={() => setSelected(selectionOf(e.test))}
              >
                {e.name}
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => setSelected(NONE)}>
              Clear
            </Button>
          </div>
          <SampleSpace
            selected={selected}
            onToggle={(i) => setSelected((s) => s.map((x, j) => (j === i ? !x : x)))}
            counts={counts}
            last={last}
          />
        </div>
        <div className="grid gap-3 p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <RunButtons counts={[1, 100, 1000]} onRun={roll} label="Roll" />
            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw className="size-4" />}
              disabled={rolls === 0}
              onClick={() => {
                setCounts(PAIRS.map(() => 0))
                setLast(null)
              }}
            >
              Reset
            </Button>
          </div>
          <Readouts
            items={[
              { label: 'squares shaded', value: `${k} of 36` },
              {
                label: 'probability',
                value: (
                  <>
                    <Tex>{fracTex(k, 36)}</Tex> ≈ {percent(k / 36)}
                  </>
                ),
                color: 'var(--accent)',
              },
              {
                label: 'observed so far',
                value: rolls
                  ? `${hits} of ${rolls} = ${percent(hits / rolls)}`
                  : 'roll to find out',
                color: 'var(--c-orange)',
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-seven" when={sameSelection(selected, SEVEN)}>
          Show the event “the sum is 7”. Why is it the most likely total?
        </TryThis>
        <TryThis id="t-half" when={k === 18}>
          Build your own event with a probability of exactly <Tex>{'\\tfrac12'}</Tex>.
        </TryThis>
        <TryThis id="t-roll" when={rolls >= 500 && k > 0}>
          Roll at least 500 times. How close does the observed percentage get to the counted one?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [selected, setSelected] = useState<boolean[]>(NONE)
  const k = selected.filter(Boolean).length
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-die"
          index={1}
          prompt="What is the probability of rolling a 3 on one fair die? (A fraction like 1/2 is fine.)"
          answer={1 / 6}
          tolerance={0.005}
          explanation="One favourable face out of six equally likely faces: $\tfrac16 \approx 0.167$."
        />
        <NumericChallenge
          id="c-eight"
          index={2}
          prompt="Roll two dice. What is the probability that they add up to 8?"
          answer={5 / 36}
          tolerance={0.005}
          hint="List the pairs: 2+6, 3+5, … Use the grid above to count."
          explanation="2+6, 3+5, 4+4, 5+3, 6+2: five of the 36 outcomes, so $\tfrac{5}{36} \approx 0.139$."
        />
        <McqChallenge
          id="c-fallacy"
          index={3}
          prompt="A fair coin has just landed heads 5 times in a row. What is the chance of heads on the next flip?"
          options={[
            { text: 'Exactly $\\tfrac12$', correct: true },
            {
              text: 'Less than $\\tfrac12$: tails is due',
              why: "That's the gambler's fallacy: the coin doesn't remember its past.",
            },
            {
              text: 'More than $\\tfrac12$: heads is on a streak',
              why: 'A fair coin has no hot streaks; each flip is independent.',
            },
            {
              text: '$\\tfrac{1}{64}$',
              why: 'That is the chance of six heads in a row, from the start.',
            },
          ]}
          explanation="Each flip is independent, so the next one is still 50/50."
        />
        <InteractiveChallenge
          id="c-quarter"
          index={4}
          prompt="Click squares to build an event with probability exactly $\tfrac14$."
          solved={k === 9}
          hint="$\tfrac14$ of 36 is 9 squares."
          explanation="Any 9 of the 36 equally likely squares give $\tfrac{9}{36} = \tfrac14$, for example “both dice are odd”."
          onReset={() => setSelected(NONE)}
        >
          <div className="grid gap-2">
            <SampleSpace
              selected={selected}
              onToggle={(i) => setSelected((s) => s.map((x, j) => (j === i ? !x : x)))}
            />
            <p className="text-sm text-ink-2">
              Shaded: {k} of 36 = <Tex>{fracTex(k, 36)}</Tex>
            </p>
          </div>
        </InteractiveChallenge>
        <NumericChallenge
          id="c-not-six"
          index={5}
          prompt="What is the probability of **not** rolling a 6 on one fair die?"
          answer={5 / 6}
          tolerance={0.005}
          explanation="$P(\text{not } 6) = 1 - \tfrac16 = \tfrac56 \approx 0.833$."
        />
      </ChallengeSet>
    </LabSection>
  )
}

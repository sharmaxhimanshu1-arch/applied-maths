import { useState } from 'react'
import { choose, factorial } from '@/math/stats'
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
import { cn } from '@/ui/cn'

const SLOT = 'var(--c-blue)'
const PICK = 'var(--c-orange)'
const PARENT = 'var(--c-green)'
const NAMES = 'ABCDEFGH'

const perm = (n: number, k: number) => factorial(n) / factorial(n - k)

/** Every ordered selection of k of the first n letters. */
function arrangements(n: number, k: number): string[] {
  if (k === 0) return ['']
  const out: string[] = []
  for (const rest of arrangements(n, k - 1))
    for (const ch of NAMES.slice(0, n)) if (!rest.includes(ch)) out.push(rest + ch)
  return out
}

/** Arrangements grouped by the set of people in them: one group per team. */
function teams(n: number, k: number): { team: string; orders: string[] }[] {
  const groups = new Map<string, string[]>()
  for (const a of arrangements(n, k)) {
    const key = [...a].sort().join('')
    groups.set(key, [...(groups.get(key) ?? []), a])
  }
  return [...groups.entries()].map(([team, orders]) => ({ team, orders }))
}

type Mode = 'ordered' | 'unordered'

export default function PermutationsCombinationsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Does the order matter?">
        <Prose>
          <p>
            Eight runners race; how many ways can gold, silver and bronze be awarded? Eight people
            could win gold, then seven are left for silver, then six for bronze:{' '}
            <Tex>{'8 \\times 7 \\times 6 = 336'}</Tex>. Order matters, because Ana-gold-Ben-silver
            is a different result from Ben-gold-Ana-silver. These are <strong>permutations</strong>.
          </p>
          <p>
            Now pick a team of three from the same eight. Ana, Ben and Cal is the same team in any
            order, so each team was counted <Tex>{'3! = 6'}</Tex> times among the podiums: there are{' '}
            <Tex>{'336 \\div 6 = 56'}</Tex> teams. Choices where order doesn't matter are{' '}
            <strong>combinations</strong>.
          </p>
        </Prose>
      </LabSection>
      <PodiumExplorer />
      <PascalExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Counting arrangements and selections">
        <Formula
          tex={
            '{}^nP_k = \\frac{n!}{(n - k)!} \\qquad \\binom{n}{k} = {}^nC_k = \\frac{n!}{k!\\,(n - k)!}'
          }
          caption="Permutations count ordered choices; combinations divide out the k! orders of each choice."
        />
        <Prose>
          <ul>
            <li>
              <strong>Factorial:</strong>{' '}
              <Tex>{'n! = n \\times (n-1) \\times \\cdots \\times 1'}</Tex> is the number of ways to
              arrange <Tex>{'n'}</Tex> things in a row. <Tex>{'0! = 1'}</Tex> (one way to arrange
              nothing).
            </li>
            <li>
              <strong>Symmetry:</strong> <Tex>{'\\binom{n}{k} = \\binom{n}{n-k}'}</Tex>: choosing
              who's in is the same as choosing who's out.
            </li>
            <li>
              <strong>Pascal's rule:</strong>{' '}
              <Tex>{'\\binom{n}{k} = \\binom{n-1}{k-1} + \\binom{n-1}{k}'}</Tex>: either a
              particular person is in the team or they aren't.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="A “combination lock” is really a permutation lock">
          <p>
            The order of the numbers on a lock matters (1-2-3 isn't 3-2-1), so mathematically it's a
            permutation. Ask “would swapping two choices give a different outcome?” If yes, use
            permutations; if no, combinations.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll use them">
        <RealWorld
          items={[
            {
              title: 'Lotteries',
              body: 'Choosing 6 numbers from 59 gives $\\binom{59}{6} \\approx 45$ million tickets, which is why the jackpot is so unlikely.',
            },
            {
              title: 'Passwords and seating',
              body: 'Arranging 10 guests around a long table: $10! = 3\\,628\\,800$ seating plans.',
            },
            {
              title: 'Card games',
              body: 'There are $\\binom{52}{5} = 2\\,598\\,960$ poker hands; probabilities of each hand are counts divided by that.',
            },
            {
              title: 'Probability',
              body: 'The binomial distribution uses $\\binom{n}{k}$ to count the ways to get $k$ successes in $n$ trials.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Order matters → permutations: $n(n-1)\\cdots(n-k+1) = n!/(n-k)!$.',
            'Order doesn’t matter → combinations: divide by $k!$.',
            '$\\binom{n}{k} = \\binom{n}{n-k}$, and each entry of Pascal’s triangle is the sum of the two above.',
            'Test: would swapping two choices change the outcome?',
          ]}
        />
      </LabSection>
    </div>
  )
}

function PodiumExplorer() {
  const [n, setN] = useState(4)
  const [k, setK] = useState(2)
  const [mode, setMode] = useState<Mode>('ordered')
  const kk = Math.min(k, n)
  const P = perm(n, kk)
  const C = choose(n, kk)
  const small = P <= 60
  return (
    <LabSection id="explore" eyebrow="Explore" title="A podium or a team?">
      <Prose>
        <p>
          Choose <Tex>{'k'}</Tex> of <Tex>{'n'}</Tex> people. For a podium, each place has one fewer
          choice than the last. For a team, the same people in a different order count once: every
          team turns up <Tex>{'k!'}</Tex> times among the podiums.
        </p>
      </Prose>
      <PredictReveal
        question="How many different teams of 2 can be picked from 4 people?"
        options={['4', '6', '8', '12']}
        answer={1}
        explanation="There are $4 \times 3 = 12$ ordered pairs, but each team appears twice (AB and BA), so $12 \div 2 = 6$ teams."
      />
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Does order matter?"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'ordered', label: 'Podium (order matters)' },
              { value: 'unordered', label: 'Team (order doesn’t)' },
            ]}
          />
        </div>
        <div className="flex flex-wrap items-end gap-2 px-3 pt-4 sm:px-4" aria-hidden>
          {Array.from({ length: kk }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="flex size-12 items-center justify-center rounded-lg border-2 text-sm font-semibold"
                style={{ borderColor: SLOT }}
              >
                {n - i}
              </div>
              <span className="text-xs text-ink-2">
                {mode === 'ordered' ? `place ${i + 1}` : 'choices'}
              </span>
            </div>
          ))}
          {mode === 'unordered' && <span className="pb-6 text-sm text-ink-2">÷ {kk}! orders</span>}
        </div>
        <div className="max-h-48 overflow-y-auto px-3 pt-3 sm:px-4">
          {!small ? (
            <p className="text-sm text-ink-2">
              Too many to list ({P.toLocaleString('en')} orders).
            </p>
          ) : mode === 'ordered' ? (
            <div className="flex flex-wrap gap-1.5 font-mono text-sm">
              {arrangements(n, kk).map((a) => (
                <span key={a} className="rounded border border-line px-1.5">
                  {a}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 font-mono text-sm">
              {teams(n, kk).map(({ team, orders }) => (
                <span
                  key={team}
                  className="rounded-lg border-2 px-2 py-0.5"
                  style={{ borderColor: PICK }}
                  title={orders.join(', ')}
                >
                  {team} <span className="text-xs text-ink-2">×{orders.length}</span>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line mt-3 px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider label="People n" value={n} min={2} max={8} step={1} onChange={setN} />
          <Slider
            label="Chosen k"
            value={kk}
            min={1}
            max={Math.min(4, n)}
            step={1}
            onChange={setK}
            color={SLOT}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'podiums', value: <Tex>{`{}^{${n}}P_{${kk}} = ${P}`}</Tex>, color: SLOT },
              {
                label: 'teams',
                value: <Tex>{`\\binom{${n}}{${kk}} = ${P} \\div ${kk}! = ${C}`}</Tex>,
                color: PICK,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-five-podium" when={mode === 'ordered' && n === 5 && kk === 3}>
          Count the podiums (gold, silver, bronze) for 5 runners.
        </TryThis>
        <TryThis id="t-ten-teams" when={mode === 'unordered' && C === 10}>
          Find a team size and group size that give exactly 10 teams. Is there more than one way?
        </TryThis>
        <TryThis id="t-whole-group" when={mode === 'unordered' && kk === n && n >= 3}>
          Make the team include everybody. How many teams are possible?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const ROWS = 9

function PascalTriangle({
  picked,
  onPick,
}: {
  picked: [number, number] | null
  onPick: (cell: [number, number]) => void
}) {
  const parents = picked && picked[1] > 0 && picked[1] < picked[0] ? [picked[1] - 1, picked[1]] : []
  return (
    <div className="space-y-1">
      {Array.from({ length: ROWS + 1 }, (_, n) => (
        <div key={n} className="flex justify-center gap-0.5 sm:gap-1">
          {Array.from({ length: n + 1 }, (_, k) => {
            const isPicked = picked?.[0] === n && picked?.[1] === k
            const isParent = picked != null && n === picked[0] - 1 && parents.includes(k)
            return (
              <button
                key={k}
                type="button"
                onClick={() => onPick([n, k])}
                className={cn(
                  'min-w-7 rounded-md border-2 px-0.5 py-0.5 text-xs tabular-nums sm:min-w-10 sm:px-1 sm:text-sm',
                  isPicked && 'font-bold',
                )}
                style={{ borderColor: isPicked ? PICK : isParent ? PARENT : 'var(--line)' }}
                aria-label={`Row ${n}, position ${k}: ${choose(n, k)}`}
                aria-pressed={isPicked}
              >
                {choose(n, k)}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function PascalExplorer() {
  const [picked, setPicked] = useState<[number, number] | null>(null)
  const [n, k] = picked ?? [0, 0]
  const inner = picked != null && k > 0 && k < n
  return (
    <LabSection id="pascal" eyebrow="Explore" title="Pascal's triangle">
      <Prose>
        <p>
          Row <Tex>{'n'}</Tex>, position <Tex>{'k'}</Tex> (both counted from 0) holds{' '}
          <Tex>{'\\binom{n}{k}'}</Tex>: the number of ways to choose <Tex>{'k'}</Tex> of{' '}
          <Tex>{'n'}</Tex>. Tap a number to see the two above it (green) that add up to it.
        </p>
      </Prose>
      <Figure>
        <div className="overflow-x-auto px-3 pt-4 sm:px-4">
          <PascalTriangle picked={picked} onPick={setPicked} />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: picked ? `row ${n}, position ${k}` : 'tap a number',
                value: picked ? <Tex>{`\\binom{${n}}{${k}} = ${choose(n, k)}`}</Tex> : '—',
                color: PICK,
              },
              {
                label: 'from the row above',
                value: !picked ? (
                  '—'
                ) : inner ? (
                  <Tex>{`${choose(n - 1, k - 1)} + ${choose(n - 1, k)} = ${choose(n, k)}`}</Tex>
                ) : (
                  'an edge: always 1'
                ),
                color: PARENT,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-add-above" when={inner && n >= 4}>
          Tap a number in row 4 or below (not on an edge). Check that it is the sum of the two
          above.
        </TryThis>
        <TryThis id="t-three-of-six" when={n === 6 && k === 3}>
          Find the number of ways to choose 3 of 6.
        </TryThis>
        <TryThis id="t-edge-one" when={picked != null && (k === 0 || k === n) && n >= 3}>
          Tap a 1 on an edge. Why is there exactly one way to choose nobody, or everybody?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [picked, setPicked] = useState<[number, number] | null>(null)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-five-factorial"
          index={1}
          prompt="What is $5!$?"
          answer={120}
          explanation="$5 \times 4 \times 3 \times 2 \times 1 = 120$."
        />
        <NumericChallenge
          id="c-eight-podium"
          index={2}
          prompt="8 runners race. How many ways can gold, silver and bronze be awarded?"
          answer={336}
          explanation="$8 \times 7 \times 6 = 336$."
        />
        <NumericChallenge
          id="c-ten-choose-three"
          index={3}
          prompt="How many teams of 3 can be chosen from 10 people?"
          answer={120}
          explanation="$\binom{10}{3} = \tfrac{10 \times 9 \times 8}{3!} = \tfrac{720}{6} = 120$."
        />
        <NumericChallenge
          id="c-six-choose-two"
          index={4}
          prompt="What is $\binom{6}{2}$?"
          answer={15}
          explanation="$\tfrac{6 \times 5}{2} = 15$."
        />
        <McqChallenge
          id="c-order-matters"
          index={5}
          prompt="In which situation does the order matter?"
          options={[
            { text: 'Setting a 4-digit door code', correct: true },
            {
              text: 'Choosing 3 toppings for a pizza',
              why: 'Ham-mushroom-olive is the same pizza in any order.',
            },
            { text: 'Picking 5 players for a squad', why: 'The squad is the same set of people.' },
            { text: 'Dealing a hand of 7 cards', why: 'A hand is the same however it was dealt.' },
          ]}
          explanation="1-2-3-4 opens a different lock from 4-3-2-1, so order matters for codes."
        />
        <InteractiveChallenge
          id="c-pick-cell"
          index={6}
          prompt="In Pascal's triangle, tap the number of ways to choose 2 people from 5."
          solved={picked?.[0] === 5 && picked?.[1] === 2}
          hint="Row 5 (counting the top as row 0), position 2."
          explanation="$\binom{5}{2} = 10$: row 5, position 2."
          onReset={() => setPicked(null)}
        >
          <div className="overflow-x-auto rounded-xl border border-line p-3">
            <PascalTriangle picked={picked} onPick={setPicked} />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

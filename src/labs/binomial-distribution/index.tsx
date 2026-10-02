import { useState } from 'react'
import { formatNumber } from '@/math/core'
import { binomialPmf, choose } from '@/math/stats'
import {
  Callout,
  Figure,
  Formula,
  LabSection,
  PredictReveal,
  Prose,
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
import { GaltonBoard, type GaltonState } from '@/tools/probability/GaltonBoard'
import { BarChart } from '@/tools/probability/charts'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'
import { num } from '../_shared/tex'

/** Every heads/tails sequence of length n (true = heads), grouped by number of heads. */
function pathsByHeads(n: number): boolean[][][] {
  const groups: boolean[][][] = Array.from({ length: n + 1 }, () => [])
  for (let m = 0; m < 2 ** n; m++) {
    const seq = Array.from({ length: n }, (_, i) => ((m >> (n - 1 - i)) & 1) === 1)
    groups[seq.filter(Boolean).length].push(seq)
  }
  return groups
}

/** Most likely number of successes. */
function mode(n: number, p: number): number {
  let best = 0
  for (let k = 1; k <= n; k++) if (binomialPmf(k, n, p) > binomialPmf(best, n, p) + 1e-12) best = k
  return best
}

export default function BinomialDistributionLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Counting successes">
        <Prose>
          <p>
            Flip a coin 10 times and count the heads. Shoot 20 free throws and count the baskets.
            Ask 100 people and count the yeses. Each time, the same simple thing repeats (a “trial”
            that succeeds with probability <Tex>p</Tex>), and you count the successes.
          </p>
          <p>
            The <strong>binomial distribution</strong> tells you how likely each count is. Its
            secret is a counting argument: list every possible sequence, group them by how many
            successes they contain, and weigh each group.
          </p>
        </Prose>
      </LabSection>
      <PathExplorer />
      <GaltonExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The binomial formula">
        <Formula
          tex={'P(X = k) = \\binom{n}{k}\\, p^k\\, (1 - p)^{n - k}'}
          caption="(number of sequences with $k$ successes) × (probability of any one of them)."
        />
        <Formula
          tex={
            '\\binom{n}{k} = \\frac{n!}{k!\\,(n - k)!} \\qquad \\text{mean} = np \\qquad \\text{SD} = \\sqrt{np(1 - p)}'
          }
        />
        <Prose>
          <p>
            <Tex>{'\\binom{n}{k}'}</Tex> (“<Tex>n</Tex> choose <Tex>k</Tex>”) counts the ways to
            pick which <Tex>k</Tex> of the <Tex>n</Tex> trials succeed. These are the numbers in
            Pascal's triangle, which is why the Galton board's pegs make a triangle too.
          </p>
        </Prose>
        <Callout kind="note" title="When is it binomial?">
          <p>
            A fixed number of trials <Tex>n</Tex>; each trial succeeds or fails; the same chance{' '}
            <Tex>p</Tex> every time; and trials don't affect each other. Drawing cards without
            putting them back breaks the last two rules.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet the binomial">
        <RealWorld
          items={[
            {
              title: 'Quality control',
              body: 'A factory tests 50 items from a batch. If defects are 2% likely, the binomial says how surprising 4 defects would be.',
            },
            {
              title: 'Polls',
              body: 'If 40% of voters support a party, the number of supporters in a random sample of 1,000 is binomial: about 400, give or take 15.',
            },
            {
              title: 'Medicine',
              body: 'If a drug helps 30% of patients, the binomial predicts how many of 20 trial patients should improve by chance.',
            },
            {
              title: 'Sport',
              body: 'An 80% free-throw shooter taking 10 shots makes exactly 8 only about 30% of the time.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'The binomial counts successes in $n$ independent trials, each with chance $p$.',
            '$P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}$: number of paths × chance of each path.',
            '$\\binom{n}{k}$ comes from Pascal’s triangle; the middle counts have the most paths.',
            'The average count is $np$; the spread is $\\sqrt{np(1-p)}$.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function PathExplorer() {
  const [n, setN] = useState(4)
  const [p, setP] = useState(0.5)
  const [picked, setPicked] = useState<number | null>(2)
  const groups = pathsByHeads(n)
  const k = picked !== null && picked <= n ? picked : null
  return (
    <LabSection id="explore" eyebrow="Explore" title="List every path">
      <Prose>
        <p>
          Here is every possible sequence of <Tex>n</Tex> flips, sorted into columns by how many
          heads it has. Click a column to see how its probability is built: how many sequences it
          holds, times the chance of each one.
        </p>
      </Prose>
      <PredictReveal
        question="Flip a fair coin 4 times. Which is more likely: exactly 2 heads, or exactly 4 heads?"
        options={['Exactly 2 heads', 'Exactly 4 heads', 'They are equally likely']}
        answer={0}
        explanation="Every single sequence (like HHTH) has the same chance, $\tfrac{1}{16}$. But 6 sequences have 2 heads, and only one (HHHH) has 4. So 2 heads is 6 times as likely."
      />
      <Figure>
        <div className="grid gap-4 border-b border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider label="Number of flips n" value={n} min={1} max={6} step={1} onChange={setN} />
          <Slider
            label="Chance of heads p"
            value={p}
            min={0.05}
            max={0.95}
            step={0.05}
            color="var(--c-yellow)"
            onChange={setP}
          />
        </div>
        <div className="overflow-x-auto p-3 sm:p-4">
          <div
            className="flex min-w-max gap-2"
            role="group"
            aria-label="Sequences grouped by number of heads"
          >
            {groups.map((seqs, heads) => (
              <button
                key={heads}
                type="button"
                aria-pressed={k === heads}
                onClick={() => setPicked(heads)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border p-2 text-left transition-colors',
                  k === heads
                    ? 'border-accent bg-[color-mix(in_oklab,var(--accent)_8%,var(--surface))]'
                    : 'border-line bg-surface hover:bg-surface-2',
                )}
              >
                <span className="text-sm font-semibold">{heads} heads</span>
                <span className="mb-1 text-xs text-ink-2">
                  {seqs.length} {seqs.length === 1 ? 'path' : 'paths'}
                </span>
                {seqs.map((seq, i) => (
                  <span key={i} className="flex gap-0.5" aria-hidden>
                    {seq.map((h, j) => (
                      <span
                        key={j}
                        className={cn(
                          'flex size-3.5 items-center justify-center rounded-[4px] text-[0.5625rem] font-bold',
                          h ? 'bg-[var(--c-yellow)] text-[#1a1300]' : 'bg-surface-3 text-ink-3',
                        )}
                      >
                        {h ? 'H' : 'T'}
                      </span>
                    ))}
                  </span>
                ))}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-line p-3 sm:p-4">
          <div className="mb-1 text-sm font-medium">Probability of each number of heads</div>
          <BarChart
            ariaLabel={`Binomial distribution with n = ${n} and p = ${formatNumber(p, 2)}`}
            color="var(--c-yellow)"
            height={180}
            yMax={Math.max(0.3, ...groups.map((_, h) => binomialPmf(h, n, p))) * 1.12}
            data={groups.map((_, h) => ({ label: String(h), value: binomialPmf(h, n, p) }))}
            valueLabel="Probability"
          />
          {k !== null && (
            <div className="mt-3 overflow-x-auto text-[0.95rem]">
              <Tex
                display
              >{`P(X = ${k}) = \\underbrace{\\binom{${n}}{${k}}}_{${choose(n, k)}\\text{ paths}} \\times \\underbrace{${num(p)}^{${k}} \\times ${num(1 - p)}^{${n - k}}}_{\\text{each path}} = ${num(binomialPmf(k, n, p), 4)}`}</Tex>
            </div>
          )}
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-pascal" when={n === 4}>
          With 4 flips the columns hold 1, 4, 6, 4, 1 paths. Try 5 and 6 flips: do you recognise the
          pattern? (It's Pascal's triangle.)
        </TryThis>
        <TryThis id="t-pick" when={k !== null && n >= 5}>
          With at least 5 flips, click a column and read how its probability is built.
        </TryThis>
        <TryThis id="t-skew" when={p >= 0.8 && n >= 4}>
          Make heads much more likely (<Tex>p = 0.8</Tex>). The middle column still has the most
          paths. Why doesn't it win any more?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function GaltonExplorer() {
  const [state, setState] = useState<GaltonState | null>(null)
  return (
    <LabSection id="galton" eyebrow="Explore" title="The Galton board">
      <Prose>
        <p>
          Each ball bounces off a row of pegs, going right with probability <Tex>p</Tex> each time.
          The bin it lands in counts its “rights”: a binomial count. Drop lots of balls and the pile
          takes the shape of the distribution.
        </p>
      </Prose>
      <Figure>
        <GaltonBoard preset={{ rows: 10, p: 0.5 }} onStateChange={setState} />
      </Figure>
      <TryThisList>
        <TryThis id="t-drop" when={(state?.balls ?? 0) >= 200}>
          Drop at least 200 balls. How well does the pile match the black theory marks?
        </TryThis>
        <TryThis
          id="t-tilt"
          when={state !== null && Math.abs(state.p - 0.5) > 0.01 && state.balls >= 50}
        >
          Tilt the board by changing <Tex>p</Tex>, then drop 50 or more balls. Where is the peak
          now? Compare it with <Tex>np</Tex>.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [board, setBoard] = useState<GaltonState | null>(null)
  const solved = board !== null && board.rows === 10 && mode(board.rows, board.p) === 7
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-three"
          index={1}
          prompt="What is the probability of exactly 2 heads in 3 fair coin flips?"
          answer={3 / 8}
          tolerance={0.005}
          hint="List them: HHT, HTH, THH. How many sequences are there in total?"
          explanation="3 of the 8 equally likely sequences have exactly 2 heads: $\tfrac38 = 0.375$."
        />
        <NumericChallenge
          id="c-choose"
          index={2}
          prompt="How many ways are there to choose which 2 of 5 trials succeed? That is, $\binom{5}{2} = \;?$"
          answer={10}
          hint="$\binom{5}{2} = \frac{5 \times 4}{2 \times 1}$."
          explanation="$\frac{5!}{2!\,3!} = 10$. It's in row 5 of Pascal's triangle: 1, 5, 10, 10, 5, 1."
        />
        <NumericChallenge
          id="c-mean"
          index={3}
          prompt="You roll a die 60 times. On average, how many sixes do you expect?"
          answer={10}
          explanation="The mean of a binomial is $np = 60 \times \tfrac16 = 10$."
        />
        <McqChallenge
          id="c-not-binomial"
          index={4}
          prompt="Which of these is **not** a binomial count?"
          options={[
            {
              text: 'Hearts among 5 cards drawn without putting them back',
              correct: true,
            },
            {
              text: 'Heads in 20 coin flips',
              why: 'Fixed n, independent flips, the same p each time: binomial.',
            },
            {
              text: 'Sixes in 12 dice rolls',
              why: 'Each roll is independent with $p = \\tfrac16$: binomial.',
            },
            {
              text: 'Defective bulbs in a sample of 50 from a huge batch',
              why: 'With a huge batch, each bulb is (very nearly) independent with the same chance.',
            },
          ]}
          explanation="Without replacement, each draw changes the deck, so the chance of a heart changes from draw to draw."
        />
        <InteractiveChallenge
          id="c-peak"
          index={5}
          prompt="Set the board to **10 rows** and choose $p$ so that the most likely bin is **7**."
          solved={solved}
          hint="The peak sits near $np$. With $n = 10$, which $p$ puts $np$ near 7?"
          explanation="With $p = 0.7$, $np = 7$, and bin 7 is the most likely. (Any $p$ from about 0.64 to 0.72 works.)"
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <GaltonBoard preset={{ rows: 8, p: 0.5 }} onStateChange={setBoard} />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

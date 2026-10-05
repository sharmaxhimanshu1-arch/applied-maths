import { type ReactNode, useState } from 'react'
import { formatNumber } from '@/math/core'
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
import { Label, Plot, Point, Segment } from '@/viz'
import { decimalExpansion, nearestFraction, primeFactors } from '../_shared/numbers'

const TARGET = 'var(--c-violet)'
const GUESS = 'var(--c-orange)'
const RING = 'var(--c-blue)'

/** p/q written with the repeating block overlined, e.g. 0.1\overline{6}. */
function decimalTex(p: number, q: number): string {
  const { whole, digits, repeatStart, period } = decimalExpansion(p, q)
  if (!digits.length) return String(whole)
  const fixed = digits.slice(0, repeatStart).join('')
  const rep = digits.slice(repeatStart, repeatStart + period).join('')
  return `${whole}.${fixed}${period ? `\\overline{${rep}}` : ''}`
}

function RootTwoPlot({ q }: { q: number }) {
  const { p, error } = nearestFraction(Math.SQRT2, q)
  const lo = 1.36
  const hi = 1.47
  const x = Math.min(hi, Math.max(lo, p / q))
  return (
    <Plot
      view={{ xMin: lo, xMax: hi, yMin: -0.9, yMax: 1.5 }}
      height={150}
      grid={false}
      axes="x"
      ariaLabel={`${p}/${q} is ${formatNumber(error, 5)} away from root 2`}
    >
      <Segment from={[Math.SQRT2, -0.3]} to={[Math.SQRT2, 1.1]} color={TARGET} width={2.5} />
      <Label at={[Math.SQRT2, 1.1]} anchor="bottom" offset={[0, -2]} className="text-xs">
        √2
      </Label>
      <Point at={[x, 0]} r={7} color={GUESS} />
      <Label at={[x, 0]} anchor="bottom" offset={[0, -12]} className="text-xs">
        {p}/{q}
      </Label>
    </Plot>
  )
}

export default function RealNumbersLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Numbers that aren't fractions">
        <Prose>
          <p>
            Fractions are everywhere on the number line: between any two of them there is another,
            and another. It seems they should fill the whole line. They don't. The diagonal of a
            square with side 1 has length <Tex>{'\\sqrt2'}</Tex>, and no fraction is exactly{' '}
            <Tex>{'\\sqrt2'}</Tex>. Numbers like it are <strong>irrational</strong>.
          </p>
          <p>
            Fractions (the <strong>rational</strong> numbers) give decimals that end or repeat
            forever. Irrational numbers give decimals that never settle into a pattern. Together
            they make the <strong>real numbers</strong>: every point on the line.
          </p>
        </Prose>
      </LabSection>
      <HuntExplorer />
      <RepeatExplorer />
      <SetsExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Rational and irrational">
        <Formula
          tex={
            '\\mathbb N \\subset \\mathbb Z \\subset \\mathbb Q \\subset \\mathbb R \\qquad \\mathbb Q = \\left\\{\\tfrac{p}{q} : p, q \\in \\mathbb Z,\\ q \\ne 0\\right\\}'
          }
          caption="Natural numbers inside integers inside rationals inside the reals."
        />
        <Prose>
          <ul>
            <li>
              <strong>Why √2 isn't a fraction:</strong> suppose{' '}
              <Tex>{'\\sqrt2 = \\tfrac{p}{q}'}</Tex> in lowest terms. Then <Tex>{'p^2 = 2q^2'}</Tex>
              , so <Tex>{'p'}</Tex> is even, say <Tex>{'p = 2r'}</Tex>. Then{' '}
              <Tex>{'q^2 = 2r^2'}</Tex>, so <Tex>{'q'}</Tex> is even too, contradicting “lowest
              terms”.
            </li>
            <li>
              <strong>Decimals:</strong> a fraction in lowest terms ends exactly when its
              denominator has no prime factors except 2 and 5; otherwise it repeats, with a cycle
              shorter than the denominator.
            </li>
            <li>
              <strong>Repeating to fraction:</strong> if <Tex>{'x = 0.\\overline{3}'}</Tex>, then{' '}
              <Tex>{'10x - x = 3'}</Tex>, so <Tex>{'x = \\tfrac13'}</Tex>. Likewise{' '}
              <Tex>{'0.\\overline{9} = 1'}</Tex>.
            </li>
            <li>
              <strong>Other irrationals:</strong> <Tex>{'\\pi'}</Tex>, <Tex>{'e'}</Tex>, and the
              square root of any whole number that isn't a perfect square.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="22/7 is not π">
          <p>
            <Tex>{'\\tfrac{22}{7} = 3.\\overline{142857}'}</Tex> repeats, so it is rational; π is
            not. They agree only to two decimal places (3.14), which is why 22/7 is a handy estimate
            but never the real thing.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where irrational numbers live">
        <RealWorld
          items={[
            {
              title: 'Paper',
              body: 'A-series paper has sides in the ratio 1 : √2, an irrational number you hold every day.',
            },
            {
              title: 'Circles',
              body: 'Every wheel, pipe and planet orbit involves π; engineers use as many digits as the job needs.',
            },
            {
              title: 'Computers',
              body: 'Computers store reals as finite binary fractions, which is why 0.1 + 0.2 comes out as 0.30000000000000004.',
            },
            {
              title: 'Music',
              body: 'Equal-tempered tuning splits an octave with the twelfth root of 2, an irrational ratio between neighbouring notes.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Rational numbers are fractions $p/q$; their decimals end or repeat.',
            'Irrational numbers, like $\\sqrt2$ and $\\pi$, have decimals that never repeat.',
            '$\\mathbb N \\subset \\mathbb Z \\subset \\mathbb Q \\subset \\mathbb R$.',
            'Fractions can get as close as you like to $\\sqrt2$, but never land on it.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function HuntExplorer() {
  const [q, setQ] = useState(5)
  const { p, error } = nearestFraction(Math.SQRT2, q)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Hunting √2 with fractions">
      <Prose>
        <p>
          Pick a denominator <Tex>{'q'}</Tex>; the lab finds the closest fraction <Tex>{'p/q'}</Tex>{' '}
          to <Tex>{'\\sqrt2'}</Tex>. The view is zoomed right in. Bigger denominators get closer and
          closer, but check the square: it is never exactly 2.
        </p>
      </Prose>
      <PredictReveal
        question="Is there a fraction whose square is exactly 2?"
        options={['Yes, with a big enough denominator', 'No, never', 'Only 7/5']}
        answer={1}
        explanation="No fraction works. If $(p/q)^2 = 2$ in lowest terms, both $p$ and $q$ turn out to be even, which is impossible. So $\sqrt2$ is irrational."
      />
      <Figure>
        <RootTwoPlot q={q} />
        <div className="border-t border-line px-3 pt-3 sm:px-4">
          <Slider
            label={<Tex>{'\\text{denominator } q'}</Tex>}
            name="Denominator q"
            value={q}
            min={1}
            max={50}
            step={1}
            onChange={setQ}
            color={GUESS}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'closest fraction',
                value: <Tex>{`\\tfrac{${p}}{${q}} = ${formatNumber(p / q, 6)}`}</Tex>,
                color: GUESS,
              },
              { label: 'its square', value: formatNumber((p / q) ** 2, 6) },
              { label: 'gap to √2', value: formatNumber(error, 6) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-twelfths" when={q === 12}>
          Try twelfths. How close is <Tex>{'\\tfrac{17}{12}'}</Tex>?
        </TryThis>
        <TryThis id="t-within-thousandth" when={error < 0.001}>
          Find a fraction within 0.001 of <Tex>{'\\sqrt2'}</Tex>.
        </TryThis>
        <TryThis id="t-square-never-two" when={q >= 40}>
          Use a denominator of 40 or more. Is the square exactly 2 yet?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function RepeatExplorer() {
  const [p, setP] = useState(1)
  const [q, setQ] = useState(6)
  const top = Math.min(p, q - 1)
  const { period } = decimalExpansion(top, q)
  const others = primeFactors(q).filter((f) => f !== 2 && f !== 5)
  return (
    <LabSection id="repeat" eyebrow="Explore" title="Decimals that end, and decimals that repeat">
      <Prose>
        <p>
          Long division of <Tex>{'p \\div q'}</Tex> can only leave remainders 0 to{' '}
          <Tex>{'q - 1'}</Tex>, so either a remainder hits 0 (the decimal ends) or one comes back
          (the digits repeat). The bar marks the repeating block.
        </p>
      </Prose>
      <Figure>
        <div className="overflow-x-auto px-3 pt-4 text-center text-xl sm:px-4">
          <Tex display>{`\\frac{${top}}{${q}} = ${decimalTex(top, q)}`}</Tex>
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line mt-3 px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label={<Tex>{'p'}</Tex>}
            name="Numerator p"
            value={top}
            min={1}
            max={q - 1}
            step={1}
            onChange={setP}
          />
          <Slider
            label={<Tex>{'q'}</Tex>}
            name="Denominator q"
            value={q}
            min={2}
            max={20}
            step={1}
            onChange={(v) => {
              setQ(v)
              setP(Math.min(p, v - 1))
            }}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'decimal',
                value: period ? `repeats every ${period} digit${period > 1 ? 's' : ''}` : 'ends',
              },
              { label: 'prime factors of q', value: primeFactors(q).join(' × ') },
              {
                label: 'factors other than 2 and 5',
                value: others.length ? others.join(', ') : 'none',
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-ends" when={period === 0 && q >= 8}>
          Find a fraction with a denominator of 8 or more whose decimal ends.
        </TryThis>
        <TryThis id="t-sevenths" when={q === 7 && period === 6}>
          Look at sevenths. How long is the cycle, and does it change with <Tex>{'p'}</Tex>?
        </TryThis>
        <TryThis id="t-long-cycle" when={period >= 16}>
          Find a cycle of 16 digits or more.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type Pick = 'neg3' | 'zero' | 'five' | 'threeQuarters' | 'third' | 'root9' | 'root2' | 'pi'
const PICKS: Record<Pick, { label: string; tex: string; set: 0 | 1 | 2 | 3 }> = {
  five: { label: '5', tex: '5', set: 0 },
  root9: { label: '√9', tex: '\\sqrt9', set: 0 },
  zero: { label: '0', tex: '0', set: 1 },
  neg3: { label: '−3', tex: '-3', set: 1 },
  threeQuarters: { label: '¾', tex: '\\tfrac34', set: 2 },
  third: { label: '0.333…', tex: '0.\\overline{3}', set: 2 },
  root2: { label: '√2', tex: '\\sqrt2', set: 3 },
  pi: { label: 'π', tex: '\\pi', set: 3 },
}
const SETS = [
  { name: 'Natural numbers ℕ', note: '1, 2, 3, …' },
  { name: 'Integers ℤ', note: '…, −2, −1, 0, 1, 2, …' },
  { name: 'Rational numbers ℚ', note: 'fractions p/q' },
  { name: 'Real numbers ℝ', note: 'every point on the line' },
]

function NestedSets({ level }: { level: number }) {
  const box = (i: number): ReactNode => (
    <div
      className="rounded-xl border-2 p-2 sm:p-3"
      style={{ borderColor: i === level ? RING : 'var(--line)' }}
    >
      <p className="text-xs font-semibold">
        {SETS[i].name} <span className="font-normal text-ink-2">{SETS[i].note}</span>
        {i === level && (
          <span className="ml-1 rounded px-1" style={{ boxShadow: `inset 0 -2px 0 ${RING}` }}>
            ← here
          </span>
        )}
      </p>
      {i > 0 && <div className="mt-2">{box(i - 1)}</div>}
    </div>
  )
  return box(3)
}

function SetsExplorer() {
  const [pick, setPick] = useState<Pick>('threeQuarters')
  const [seen, setSeen] = useState<Pick[]>(['threeQuarters'])
  const item = PICKS[pick]
  const memberOf = SETS.slice(item.set).map((s) => s.name.split(' ').pop())
  return (
    <LabSection id="sets" eyebrow="Explore" title="Which kind of number is it?">
      <Prose>
        <p>
          Each kind of number sits inside the next. Choose a number and see the smallest box it fits
          in; it then belongs to every box around that one too. Irrational numbers are real but
          outside the rational box.
        </p>
      </Prose>
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Number"
            size="sm"
            className="flex-wrap"
            value={pick}
            onChange={(v) => {
              setPick(v)
              if (!seen.includes(v)) setSeen([...seen, v])
            }}
            options={(Object.keys(PICKS) as Pick[]).map((k) => ({
              value: k,
              label: PICKS[k].label,
            }))}
          />
        </div>
        <div className="px-3 pt-3 sm:px-4">
          <NestedSets level={item.set} />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'number', value: <Tex>{item.tex}</Tex> },
              { label: 'belongs to', value: memberOf.join(', ') },
              { label: 'rational?', value: item.set === 3 ? 'no: irrational' : 'yes' },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-root-nine" when={pick === 'root9'}>
          Choose <Tex>{'\\sqrt9'}</Tex>. Is a square root always irrational?
        </TryThis>
        <TryThis id="t-repeating-third" when={pick === 'third'}>
          Choose <Tex>{'0.\\overline{3}'}</Tex>. Why does a never-ending decimal count as rational?
        </TryThis>
        <TryThis id="t-every-box" when={seen.length === Object.keys(PICKS).length}>
          Try every number in the list.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [q, setQ] = useState(1)
  const { p, error } = nearestFraction(Math.SQRT2, q)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <McqChallenge
          id="c-which-irrational"
          index={1}
          prompt="Which of these is irrational?"
          options={[
            { text: '$\\sqrt8$', correct: true },
            { text: '$\\sqrt{16}$', why: '$\\sqrt{16} = 4$.' },
            { text: '$0.25$', why: '$0.25 = \\tfrac14$.' },
            {
              text: '$\\tfrac{22}{7}$',
              why: 'It is a fraction, so it is rational (even though it is close to π).',
            },
          ]}
          explanation="8 is not a perfect square, so $\sqrt8 = 2\sqrt2$ is irrational."
        />
        <NumericChallenge
          id="c-one-sixth"
          index={2}
          prompt="$0.1\overline{6} = 0.1666\ldots = \tfrac{1}{?}$"
          answer={6}
          explanation="$1 \div 6 = 0.1666\ldots$"
        />
        <NumericChallenge
          id="c-period-seven"
          index={3}
          prompt="How many digits are in the repeating block of $\tfrac17 = 0.\overline{142857}$?"
          answer={6}
          explanation="The block 142857 has 6 digits."
        />
        <McqChallenge
          id="c-root-nine-set"
          index={4}
          prompt="What is the smallest set that contains $\sqrt9$?"
          options={[
            { text: 'The natural numbers', correct: true },
            { text: 'The irrational numbers', why: '$\\sqrt9 = 3$ exactly.' },
            { text: 'The rational numbers but not the integers', why: '3 is a whole number.' },
          ]}
          explanation="$\sqrt9 = 3$, a natural number (and so also an integer, rational and real)."
        />
        <McqChallenge
          id="c-between"
          index={5}
          prompt="How many fractions are there between $\tfrac12$ and $\tfrac{1}{3}$?"
          options={[
            { text: 'Infinitely many', correct: true },
            { text: 'None', why: '$\\tfrac{5}{12}$ is between them, for a start.' },
            { text: 'Exactly one', why: 'Between any two you can always find another.' },
          ]}
          explanation="The average of any two fractions lies between them, and you can repeat this forever."
        />
        <InteractiveChallenge
          id="c-close-to-root-two"
          index={6}
          prompt="Choose a denominator that gives a fraction within 0.001 of $\sqrt2$."
          solved={error < 0.001}
          hint="Try denominators in the high twenties."
          explanation="The smallest is $\tfrac{41}{29} \approx 1.41379$, about 0.0004 away from $\sqrt2 \approx 1.41421$."
          onReset={() => setQ(1)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <RootTwoPlot q={q} />
            <div className="border-t border-line p-3">
              <Slider
                label="Denominator q"
                value={q}
                min={1}
                max={50}
                step={1}
                onChange={setQ}
                color={GUESS}
              />
              <p className="mt-2 text-sm">
                {p}/{q}: gap {formatNumber(error, 5)}
              </p>
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

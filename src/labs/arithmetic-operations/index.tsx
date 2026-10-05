import { type ReactNode, useState } from 'react'
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
import { Label, Plot, Point, Vector } from '@/viz'

const START = 'var(--c-blue)'
const JUMP = 'var(--c-orange)'
const RESULT = 'var(--c-violet)'

const paren = (n: number) => (n < 0 ? `(${n})` : String(n))

/** One jump drawn as an arrow just above the number line. */
function Jump({
  from,
  to,
  level = 0.5,
  color = JUMP,
}: {
  from: number
  to: number
  level?: number
  color?: string
}) {
  if (from === to) return null
  return <Vector from={[from, level]} to={[to, level]} color={color} />
}

function NumberLine({
  lo,
  hi,
  ariaLabel,
  children,
}: {
  lo: number
  hi: number
  ariaLabel: string
  children: ReactNode
}) {
  return (
    <Plot
      view={{ xMin: lo - 0.6, xMax: hi + 0.6, yMin: -1, yMax: 2.4 }}
      height={180}
      grid={false}
      axes="x"
      xIntegers
      ariaLabel={ariaLabel}
    >
      {children}
    </Plot>
  )
}

export default function ArithmeticOperationsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Operations are movements">
        <Prose>
          <p>
            On the number line, every operation is a way of moving. <strong>Adding</strong> a
            positive number jumps right; <strong>subtracting</strong> jumps left.{' '}
            <strong>Multiplying</strong> stretches the distance from 0, and multiplying by a
            negative number also flips you to the other side.
          </p>
          <p>
            Once you see the moves, the “rules for signs” stop being rules to memorise. Subtracting
            a negative is turning round twice. A negative times a negative is two flips, which bring
            you back to the positive side.
          </p>
        </Prose>
      </LabSection>
      <AddExplorer />
      <MultiplyExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The sign rules">
        <Formula
          tex={'a - b = a + (-b) \\qquad (-a)(-b) = ab \\qquad (-a)\\,b = -ab'}
          caption="Subtracting is adding the opposite; two flips cancel."
        />
        <Prose>
          <ul>
            <li>
              <strong>Adding a negative</strong> moves left: <Tex>{'5 + (-3) = 2'}</Tex>.
            </li>
            <li>
              <strong>Subtracting a negative</strong> moves right:{' '}
              <Tex>{'5 - (-3) = 5 + 3 = 8'}</Tex>.
            </li>
            <li>
              <strong>Multiplying</strong> by a negative flips across 0; an even number of negative
              factors gives a positive answer, an odd number a negative one.
            </li>
            <li>
              <strong>Dividing</strong> follows the same sign rules, because it undoes multiplying:{' '}
              <Tex>{'-12 \\div 4 = -3'}</Tex> since <Tex>{'4 \\times (-3) = -12'}</Tex>.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="“Two negatives make a positive” isn't for adding">
          <p>
            The flip rule is for multiplying and dividing. When adding, two negatives make a{' '}
            <em>more</em> negative number: <Tex>{'-3 + (-4) = -7'}</Tex>. Two steps left take you
            further left.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you meet signed arithmetic">
        <RealWorld
          items={[
            {
              title: 'Bank balances',
              body: 'Removing a £20 fee from a balance of −£15 leaves −£35; cancelling a charge (subtracting a negative) adds money back.',
            },
            {
              title: 'Temperature change',
              body: 'Going from −4 °C to 9 °C is a rise of 9 − (−4) = 13 degrees.',
            },
            {
              title: 'Golf and sport',
              body: 'Scores relative to par: three rounds of −2 add up to −6.',
            },
            {
              title: 'Physics',
              body: 'Velocity and force carry signs for direction; reversing direction is multiplying by −1.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Adding moves right for positives and left for negatives.',
            'Subtracting means adding the opposite: $a - b = a + (-b)$.',
            'Multiplying by a negative flips across 0; two flips cancel.',
            'Division uses the same sign rules as multiplication.',
          ]}
        />
      </LabSection>
    </div>
  )
}

type Op = 'add' | 'sub'

function AddExplorer() {
  const [a, setA] = useState(3)
  const [b, setB] = useState(4)
  const [op, setOp] = useState<Op>('add')
  const move = op === 'add' ? b : -b
  const result = a + move
  return (
    <LabSection id="explore" eyebrow="Explore" title="Adding and subtracting as jumps">
      <Prose>
        <p>
          Start at <Tex>{'a'}</Tex> (blue). Adding <Tex>{'b'}</Tex> jumps <Tex>{'b'}</Tex> steps:
          right if <Tex>{'b'}</Tex> is positive, left if negative. Subtracting does the opposite
          jump. Try subtracting a negative number and watch which way the arrow points.
        </p>
      </Prose>
      <PredictReveal
        question="Where does $2 - (-5)$ land?"
        options={['$-3$', '$-7$', '$7$', '$3$']}
        answer={2}
        explanation="Subtracting turns the jump round. The jump for −5 points left, so subtracting it points right: $2 + 5 = 7$."
      />
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Operation"
            value={op}
            onChange={setOp}
            options={[
              { value: 'add', label: 'a + b' },
              { value: 'sub', label: 'a − b' },
            ]}
          />
        </div>
        <NumberLine
          lo={-12}
          hi={12}
          ariaLabel={`${a} ${op === 'add' ? 'plus' : 'minus'} ${b} equals ${result}`}
        >
          <Jump from={a} to={result} />
          <Point at={[a, 0]} r={6} color={START} />
          <Point at={[result, 0]} r={6} color={RESULT} />
          <Label at={[(a + result) / 2, 0.5]} anchor="bottom" offset={[0, -10]} className="text-xs">
            {op === 'add' ? '+' : '−'} {paren(b)}
          </Label>
        </NumberLine>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label={<Tex>{'a'}</Tex>}
            name="Start a"
            value={a}
            min={-6}
            max={6}
            step={1}
            onChange={setA}
            color={START}
          />
          <Slider
            label={<Tex>{'b'}</Tex>}
            name="Jump b"
            value={b}
            min={-6}
            max={6}
            step={1}
            onChange={setB}
            color={JUMP}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'sum',
                value: <Tex>{`${a} ${op === 'add' ? '+' : '-'} ${paren(b)} = ${result}`}</Tex>,
                color: RESULT,
              },
              {
                label: 'jump',
                value: move === 0 ? 'none' : `${Math.abs(move)} ${move > 0 ? 'right' : 'left'}`,
                color: JUMP,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-add-negative" when={op === 'add' && b < 0}>
          Add a negative number. Which way does the jump go?
        </TryThis>
        <TryThis id="t-sub-negative" when={op === 'sub' && b < 0}>
          Subtract a negative number. Is the answer bigger or smaller than <Tex>{'a'}</Tex>?
        </TryThis>
        <TryThis id="t-land-zero" when={result === 0 && b !== 0}>
          Make the jump land exactly on 0.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

/** Each jump of a repeated-addition picture for a × k (k copies of a, flipped when k < 0). */
function jumps(a: number, k: number): [number, number][] {
  const step = k < 0 ? -a : a
  return Array.from({ length: Math.abs(k) }, (_, i) => [i * step, (i + 1) * step])
}

function MultiplyExplorer() {
  const [a, setA] = useState(3)
  const [k, setK] = useState(2)
  const product = a * k
  return (
    <LabSection id="multiply" eyebrow="Explore" title="Multiplying stretches and flips">
      <Prose>
        <p>
          <Tex>{'a \\times k'}</Tex> is <Tex>{'|k|'}</Tex> jumps of size <Tex>{'a'}</Tex>, starting
          at 0. When <Tex>{'k'}</Tex> is negative, each jump is first flipped to point the other
          way. Make both numbers negative and count the flips.
        </p>
      </Prose>
      <Figure>
        <NumberLine lo={-16} hi={16} ariaLabel={`${a} times ${k} equals ${product}`}>
          {jumps(a, k).map(([from, to], i) => (
            <Jump key={i} from={from} to={to} level={0.4 + (i % 2) * 0.5} />
          ))}
          <Point at={[a, 0]} r={5} color={START} hollow />
          <Point at={[product, 0]} r={6} color={RESULT} />
        </NumberLine>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label={<Tex>{'a'}</Tex>}
            name="Size a"
            value={a}
            min={-4}
            max={4}
            step={1}
            onChange={setA}
            color={START}
          />
          <Slider
            label={<Tex>{'k'}</Tex>}
            name="Times k"
            value={k}
            min={-4}
            max={4}
            step={1}
            onChange={setK}
            color={JUMP}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'product',
                value: <Tex>{`${paren(a)} \\times ${paren(k)} = ${product}`}</Tex>,
                color: RESULT,
              },
              {
                label: 'negative factors',
                value: `${(a < 0 ? 1 : 0) + (k < 0 ? 1 : 0)} → ${product > 0 ? 'positive' : product < 0 ? 'negative' : 'zero'}`,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-times-minus-one" when={k === -1 && a !== 0}>
          Multiply by −1. What does that do to the point?
        </TryThis>
        <TryThis id="t-two-negatives" when={a < 0 && k < 0}>
          Make both numbers negative. Which side does the answer land on?
        </TryThis>
        <TryThis id="t-times-nothing" when={k === 0 && a !== 0}>
          Multiply by 0. Where do you end up, whatever <Tex>{'a'}</Tex> is?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [b, setB] = useState(0)
  const start = 2
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-plus"
          index={1}
          prompt="What is $-3 + 8$?"
          answer={5}
          explanation="Start at −3 and jump 8 right: 3 steps to 0, then 5 more."
        />
        <NumericChallenge
          id="c-minus-negative"
          index={2}
          prompt="What is $4 - (-6)$?"
          answer={10}
          explanation="Subtracting −6 is adding 6: $4 + 6 = 10$."
        />
        <NumericChallenge
          id="c-neg-times-neg"
          index={3}
          prompt="What is $(-3) \times (-5)$?"
          answer={15}
          explanation="Two negative factors: two flips cancel, so the answer is positive: 15."
        />
        <McqChallenge
          id="c-sign-of-product"
          index={4}
          prompt="What is the sign of $(-2) \times 3 \times (-4) \times (-1)$?"
          options={[
            { text: 'Negative', correct: true },
            { text: 'Positive', why: 'Count the negative factors: there are three.' },
            { text: 'Zero', why: 'None of the factors is 0.' },
          ]}
          explanation="Three negative factors means three flips, an odd number, so the product is negative (it is −24)."
        />
        <NumericChallenge
          id="c-divide"
          index={5}
          prompt="What is $-12 \div 4$?"
          answer={-3}
          explanation="$4 \times (-3) = -12$, so $-12 \div 4 = -3$."
        />
        <InteractiveChallenge
          id="c-reach"
          index={6}
          prompt="Start at 2. Choose $b$ so that $2 + b$ lands on $-6$."
          solved={start + b === -6}
          hint="How many steps left is it from 2 to −6?"
          explanation="From 2 to −6 is 8 steps left, so $b = -8$: $2 + (-8) = -6$."
          onReset={() => setB(0)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <NumberLine lo={-10} hi={10} ariaLabel={`2 plus ${b} equals ${start + b}`}>
              <Jump from={start} to={start + b} />
              <Point at={[start, 0]} r={6} color={START} />
              <Point at={[start + b, 0]} r={6} color={RESULT} />
            </NumberLine>
            <div className="border-t border-line p-3">
              <Slider
                label={<Tex>{'b'}</Tex>}
                name="Jump b"
                value={b}
                min={-10}
                max={8}
                step={1}
                onChange={setB}
                color={JUMP}
              />
              <p className="mt-2 text-sm">
                <Tex>{`2 + ${paren(b)} = ${start + b}`}</Tex>
              </p>
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

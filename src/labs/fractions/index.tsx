import { useState } from 'react'
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
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { Label, Plot, Point } from '@/viz'
import { fracTex, gcd } from '../_shared/fraction'

const A_COL = 'var(--c-blue)'
const B_COL = 'var(--c-orange)'
const SUM_COL = 'var(--c-violet)'

const lcm = (a: number, b: number) => (a / gcd(a, b)) * b

/** Whole bars cut into `parts` equal pieces with `shaded` of them filled (more than one bar when shaded > parts). */
function FractionBars({
  parts,
  shaded,
  color,
  label,
}: {
  parts: number
  shaded: number
  color: string
  label: string
}) {
  const bars = Math.max(1, Math.ceil(shaded / parts))
  return (
    <div className="space-y-1.5" role="img" aria-label={label}>
      {Array.from({ length: bars }, (_, b) => (
        <div
          key={b}
          className="grid h-10 overflow-hidden rounded-lg border-2 border-line"
          style={{ gridTemplateColumns: `repeat(${parts}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: parts }, (_, i) => {
            const filled = b * parts + i < shaded
            return (
              <div
                key={i}
                className="border-r border-line last:border-r-0"
                style={filled ? { background: color, opacity: 0.75 } : undefined}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function FractionsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Equal parts of a whole">
        <Prose>
          <p>
            Cut a chocolate bar into 4 equal pieces and eat 3: you have eaten{' '}
            <Tex>{'\\tfrac34'}</Tex> of it. The bottom number, the <strong>denominator</strong>,
            says how many equal pieces the whole is cut into. The top number, the{' '}
            <strong>numerator</strong>, says how many of those pieces you have.
          </p>
          <p>
            The same amount can be cut in different ways: <Tex>{'\\tfrac12'}</Tex> of a bar is the
            same as <Tex>{'\\tfrac24'}</Tex> or <Tex>{'\\tfrac36'}</Tex>. Seeing that is the key to
            comparing and adding fractions: you re-cut them until the pieces match.
          </p>
        </Prose>
      </LabSection>
      <CutExplorer />
      <AddExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Working with fractions">
        <Formula
          tex={
            '\\frac{a}{b} = \\frac{a \\times k}{b \\times k} \\qquad \\frac{a}{b} + \\frac{c}{d} = \\frac{ad + cb}{bd}'
          }
          caption="Equivalent fractions, and adding by giving both the same denominator."
        />
        <Prose>
          <ul>
            <li>
              <strong>Equivalent fractions:</strong> multiplying top and bottom by the same number
              cuts each piece into smaller pieces without changing the amount. Dividing both by
              their greatest common factor <strong>simplifies</strong>:{' '}
              <Tex>{'\\tfrac{18}{24} = \\tfrac34'}</Tex>.
            </li>
            <li>
              <strong>Adding</strong> needs equal-sized pieces. Re-cut both fractions to a common
              denominator (the smallest is the least common multiple):{' '}
              <Tex>{'\\tfrac12 + \\tfrac13 = \\tfrac36 + \\tfrac26 = \\tfrac56'}</Tex>.
            </li>
            <li>
              <strong>A fraction is a number</strong> with its own place on the number line, and it
              is also a division: <Tex>{'\\tfrac34 = 3 \\div 4 = 0.75'}</Tex>. When the top is
              bigger than the bottom, it is more than one whole.
            </li>
            <li>
              <strong>“Of” means times:</strong> <Tex>{'\\tfrac23'}</Tex> of 12 is{' '}
              <Tex>{'\\tfrac23 \\times 12 = 8'}</Tex>.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="Don't add the bottoms">
          <p>
            <Tex>{'\\tfrac12 + \\tfrac13'}</Tex> is not <Tex>{'\\tfrac25'}</Tex>. Two fifths is less
            than a half, yet you added something to a half! Halves and thirds are different sized
            pieces; re-cut them into sixths first.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where fractions are used">
        <RealWorld
          items={[
            {
              title: 'Cooking',
              body: 'Halving a recipe that needs ¾ cup of flour means ⅜ cup; doubling it means 1½ cups.',
            },
            {
              title: 'Music',
              body: 'Note lengths are fractions of a bar: two quarter notes fill the same time as one half note.',
            },
            {
              title: 'Measuring',
              body: 'Rulers and spanners in inches use halves, quarters, eighths and sixteenths.',
            },
            {
              title: 'Sharing',
              body: 'Splitting a bill or pizza fairly is dividing a whole into equal parts.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'The denominator counts the equal pieces in a whole; the numerator counts the pieces you have.',
            'Multiplying top and bottom by the same number gives an equivalent fraction.',
            'To add or compare, give fractions a common denominator first.',
            'A fraction is a number: $\\tfrac{a}{b} = a \\div b$.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function CutExplorer() {
  const [n, setN] = useState(4)
  const [k, setK] = useState(1)
  const shaded = Math.min(k, 2 * n)
  const value = shaded / n
  return (
    <LabSection id="explore" eyebrow="Explore" title="Cut a bar, shade the pieces">
      <Prose>
        <p>
          Choose how many equal pieces to cut each bar into, then how many pieces to shade. The
          readouts show the same amount in lowest terms and as a decimal, and the point shows where
          it sits on the number line.
        </p>
      </Prose>
      <PredictReveal
        question="Which is bigger: $\tfrac{3}{4}$ or $\tfrac{5}{8}$?"
        options={['$\\tfrac34$', '$\\tfrac58$', 'They are equal']}
        answer={0}
        explanation="Cut the quarters into eighths: $\tfrac34 = \tfrac68$, which is one eighth more than $\tfrac58$."
      />
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <FractionBars
            parts={n}
            shaded={shaded}
            color={A_COL}
            label={`${shaded} of ${n} equal parts shaded`}
          />
        </div>
        <Plot
          view={{ xMin: -0.1, xMax: 2.1, yMin: -0.8, yMax: 1 }}
          height={110}
          grid={false}
          axes="x"
          ariaLabel={`${shaded}/${n} on the number line at ${formatNumber(value, 3)}`}
        >
          <Point at={[value, 0]} r={7} color={A_COL} />
          <Label at={[value, 0]} anchor="bottom" offset={[0, -12]} className="text-xs">
            {shaded}/{n}
          </Label>
        </Plot>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label="Pieces per bar (denominator)"
            value={n}
            min={1}
            max={12}
            step={1}
            onChange={(v) => {
              setN(v)
              setK(Math.min(k, 2 * v))
            }}
          />
          <Slider
            label="Pieces shaded (numerator)"
            value={shaded}
            min={0}
            max={2 * n}
            step={1}
            onChange={setK}
            color={A_COL}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'fraction', value: <Tex>{`\\tfrac{${shaded}}{${n}}`}</Tex>, color: A_COL },
              { label: 'lowest terms', value: <Tex>{fracTex(shaded, n)}</Tex> },
              { label: 'decimal', value: formatNumber(value, 3) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-half-in-sixths" when={n === 6 && shaded === 3}>
          Show one half using sixths.
        </TryThis>
        <TryThis id="t-past-one" when={shaded > n}>
          Shade more pieces than one bar has. Where does the point go on the number line?
        </TryThis>
        <TryThis id="t-three-quarters-eighths" when={n === 8 && shaded === 6}>
          Show <Tex>{'\\tfrac34'}</Tex> with eighths. How many pieces is that?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function AddExplorer() {
  const [a, setA] = useState(1)
  const [b, setB] = useState(2)
  const [c, setC] = useState(1)
  const [d, setD] = useState(3)
  const top1 = Math.min(a, b)
  const top2 = Math.min(c, d)
  const L = lcm(b, d)
  const ra = (top1 * L) / b
  const rc = (top2 * L) / d
  const sum = ra + rc
  return (
    <LabSection id="add" eyebrow="Explore" title="Add by re-cutting">
      <Prose>
        <p>
          Two fractions with different pieces can't be added straight away. Re-cut both bars into
          the same number of pieces, a common denominator, and then just count.
        </p>
      </Prose>
      <Figure>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <div className="space-y-2">
            <p className="text-sm text-ink-2">
              First: <Tex>{`\\tfrac{${top1}}{${b}} = \\tfrac{${ra}}{${L}}`}</Tex>
            </p>
            <FractionBars
              parts={L}
              shaded={ra}
              color={A_COL}
              label={`${top1}/${b} cut into ${L} pieces`}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-ink-2">
              Second: <Tex>{`\\tfrac{${top2}}{${d}} = \\tfrac{${rc}}{${L}}`}</Tex>
            </p>
            <FractionBars
              parts={L}
              shaded={rc}
              color={B_COL}
              label={`${top2}/${d} cut into ${L} pieces`}
            />
          </div>
        </div>
        <div className="space-y-2 px-3 pt-4 sm:px-4">
          <p className="text-sm text-ink-2">
            Sum:{' '}
            <Tex>{`\\tfrac{${ra}}{${L}} + \\tfrac{${rc}}{${L}} = \\tfrac{${sum}}{${L}}${fracTex(sum, L) === `\\tfrac{${sum}}{${L}}` ? '' : ` = ${fracTex(sum, L)}`}`}</Tex>
          </p>
          <FractionBars
            parts={L}
            shaded={sum}
            color={SUM_COL}
            label={`The sum is ${sum} of ${L} pieces`}
          />
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 mt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label="First: numerator"
            value={top1}
            min={1}
            max={b}
            step={1}
            onChange={setA}
            color={A_COL}
          />
          <Slider
            label="First: denominator"
            value={b}
            min={2}
            max={6}
            step={1}
            onChange={(v) => {
              setB(v)
              setA(Math.min(a, v))
            }}
          />
          <Slider
            label="Second: numerator"
            value={top2}
            min={1}
            max={d}
            step={1}
            onChange={setC}
            color={B_COL}
          />
          <Slider
            label="Second: denominator"
            value={d}
            min={2}
            max={6}
            step={1}
            onChange={(v) => {
              setD(v)
              setC(Math.min(c, v))
            }}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'common denominator', value: L },
              { label: 'sum', value: <Tex>{fracTex(sum, L)}</Tex>, color: SUM_COL },
              { label: 'as a decimal', value: formatNumber(sum / L, 3) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-make-one" when={sum === L}>
          Choose two fractions that add up to exactly one whole.
        </TryThis>
        <TryThis id="t-same-pieces" when={b === d}>
          Give both fractions the same denominator. Do you still need to re-cut?
        </TryThis>
        <TryThis id="t-over-one" when={sum > L}>
          Make the sum more than one. How is that shown?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [n, setN] = useState(2)
  const [k, setK] = useState(0)
  const shaded = Math.min(k, n)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <McqChallenge
          id="c-which-bigger"
          index={1}
          prompt="Which is bigger: $\tfrac35$ or $\tfrac23$?"
          options={[
            { text: '$\\tfrac23$', correct: true },
            {
              text: '$\\tfrac35$',
              why: 'In fifteenths, $\\tfrac35 = \\tfrac{9}{15}$ and $\\tfrac23 = \\tfrac{10}{15}$.',
            },
            { text: 'They are equal', why: 'Re-cut both into fifteenths and compare.' },
          ]}
          explanation="$\tfrac35 = \tfrac{9}{15}$ and $\tfrac23 = \tfrac{10}{15}$, so $\tfrac23$ is bigger by $\tfrac{1}{15}$."
        />
        <NumericChallenge
          id="c-missing-top"
          index={2}
          prompt="Fill in the gap: $\tfrac34 = \tfrac{?}{20}$."
          answer={15}
          explanation="20 is 4 × 5, so multiply the top by 5 too: $3 \times 5 = 15$."
        />
        <NumericChallenge
          id="c-simplify"
          index={3}
          prompt="Simplify $\tfrac{18}{24}$. What is the denominator in lowest terms?"
          answer={4}
          explanation="Both are divisible by 6: $\tfrac{18}{24} = \tfrac{3}{4}$."
        />
        <NumericChallenge
          id="c-sixths"
          index={4}
          prompt="$\tfrac12 + \tfrac13 = \tfrac{?}{6}$. What is the numerator?"
          answer={5}
          explanation="$\tfrac12 = \tfrac36$ and $\tfrac13 = \tfrac26$, so the sum is $\tfrac56$."
        />
        <NumericChallenge
          id="c-of"
          index={5}
          prompt="What is $\tfrac23$ of 12?"
          answer={8}
          explanation="A third of 12 is 4, so two thirds is 8."
        />
        <InteractiveChallenge
          id="c-shade-eighths"
          index={6}
          prompt="Show $\tfrac34$ using a bar cut into eighths."
          solved={n === 8 && shaded === 6}
          hint="How many eighths make one quarter?"
          explanation="Each quarter is two eighths, so $\tfrac34 = \tfrac68$: cut into 8 and shade 6."
          onReset={() => {
            setN(2)
            setK(0)
          }}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <FractionBars
              parts={n}
              shaded={shaded}
              color={A_COL}
              label={`${shaded} of ${n} pieces shaded`}
            />
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Slider label="Pieces" value={n} min={1} max={12} step={1} onChange={setN} />
              <Slider
                label="Shaded"
                value={shaded}
                min={0}
                max={n}
                step={1}
                onChange={setK}
                color={A_COL}
              />
            </div>
            <p className="text-sm">
              <Tex>{`\\tfrac{${shaded}}{${n}}`}</Tex>
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

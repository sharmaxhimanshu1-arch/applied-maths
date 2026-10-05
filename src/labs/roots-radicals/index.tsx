import { useState } from 'react'
import { clamp, formatNumber } from '@/math/core'
import type { Vec2 } from '@/math/linalg'
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
import { MovablePoint, Plot, Polygon } from '@/viz'
import { DotGrid } from '../_shared/DotGrid'
import { squareSplit } from '../_shared/numbers'

const SQUARE = 'var(--c-blue)'
const BLOCK = [
  'var(--c-blue)',
  'var(--c-orange)',
  'var(--c-green)',
  'var(--c-violet)',
  'var(--c-aqua)',
]

/** Drag the corner along the diagonal: the side length snaps to hundredths of a step. */
const onDiagonal =
  (step: number, max: number) =>
  ([x, y]: Vec2): Vec2 => {
    const s = clamp(Math.round((x + y) / 2 / step) * step, 0.5, max)
    return [s, s]
  }

function SquarePlot({
  s,
  onSide,
  max = 6,
}: {
  s: number
  onSide: (s: number) => void
  max?: number
}) {
  return (
    <Plot
      view={{ xMin: -0.3, xMax: max + 0.4, yMin: -0.3, yMax: max + 0.4 }}
      aspect="equal"
      ariaLabel={`A square of side ${formatNumber(s, 2)} and area ${formatNumber(s * s, 2)}`}
    >
      <Polygon
        points={[
          [0, 0],
          [s, 0],
          [s, s],
          [0, s],
        ]}
        fill={SQUARE}
        fillOpacity={0.25}
        stroke={SQUARE}
        strokeWidth={2.5}
      />
      <MovablePoint
        x={s}
        y={s}
        onMove={(x) => onSide(Math.round(x * 100) / 100)}
        constrain={onDiagonal(0.05, max)}
        color={SQUARE}
        label="Corner of the square"
      />
    </Plot>
  )
}

export default function RootsRadicalsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Undo a square">
        <Prose>
          <p>
            A square garden has an area of 49 m². How long is each side? You need the number that
            multiplied by itself gives 49: 7. That is the <strong>square root</strong>,{' '}
            <Tex>{'\\sqrt{49} = 7'}</Tex>. Square roots undo squaring, just as subtraction undoes
            addition.
          </p>
          <p>
            Most square roots aren't whole numbers: the side of a square with area 2 is{' '}
            <Tex>{'\\sqrt2 \\approx 1.414'}</Tex>, a decimal that never ends. But you can always pin
            a root between two whole numbers, and you can tidy roots up by pulling square factors
            out of them.
          </p>
        </Prose>
      </LabSection>
      <SideExplorer />
      <SimplifyExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Working with roots">
        <Formula
          tex={
            '\\sqrt{a}\\cdot\\sqrt{b} = \\sqrt{ab} \\qquad \\sqrt{k^2 m} = k\\sqrt{m} \\qquad \\sqrt[3]{a^3} = a'
          }
          caption="Roots multiply; square factors come out; a cube root undoes cubing."
        />
        <Prose>
          <ul>
            <li>
              <strong>Estimate</strong> by squeezing between squares: <Tex>{'49 < 50 < 64'}</Tex>,
              so <Tex>{'7 < \\sqrt{50} < 8'}</Tex>, and close to 7.
            </li>
            <li>
              <strong>Simplify</strong> by splitting off the biggest square factor:{' '}
              <Tex>{'\\sqrt{72} = \\sqrt{36 \\times 2} = 6\\sqrt2'}</Tex>.
            </li>
            <li>
              <strong>The symbol means the positive root.</strong> Both 7 and −7 square to 49, but{' '}
              <Tex>{'\\sqrt{49} = 7'}</Tex>. Solving <Tex>{'x^2 = 49'}</Tex> gives{' '}
              <Tex>{'x = \\pm 7'}</Tex>.
            </li>
            <li>
              <strong>Roots are exponents:</strong> <Tex>{'\\sqrt{a} = a^{1/2}'}</Tex> and{' '}
              <Tex>{'\\sqrt[3]{a} = a^{1/3}'}</Tex>, which is why the exponent laws work for them
              too.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="Roots don't split over a sum">
          <p>
            <Tex>{'\\sqrt{9 + 16}'}</Tex> is <Tex>{'\\sqrt{25} = 5'}</Tex>, not{' '}
            <Tex>{'\\sqrt9 + \\sqrt{16} = 7'}</Tex>. Roots split over multiplication,{' '}
            <Tex>{'\\sqrt{ab} = \\sqrt a\\sqrt b'}</Tex>, but never over addition.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where roots appear">
        <RealWorld
          items={[
            {
              title: 'Building and DIY',
              body: 'A square room of 20 m² is about √20 ≈ 4.47 m on each side; diagonals of rectangles need Pythagoras and a square root.',
            },
            {
              title: 'Paper sizes',
              body: 'A4 paper is √2 times as long as it is wide, so halving it keeps the same shape.',
            },
            {
              title: 'Physics',
              body: 'A dropped object takes √(2h/g) seconds to fall a height h; pendulum periods grow with √(length).',
            },
            {
              title: 'Statistics',
              body: 'The standard deviation is the square root of the variance, and averages of n readings are √n times steadier.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            '$\\sqrt{a}$ is the side of a square with area $a$: the positive number that squares to $a$.',
            'Pin a root between the squares on either side: $7 < \\sqrt{50} < 8$.',
            'Simplify by pulling out square factors: $\\sqrt{72} = 6\\sqrt2$.',
            'Roots split over products, never over sums.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function SideExplorer() {
  const [s, setS] = useState(3)
  const area = s * s
  return (
    <LabSection id="explore" eyebrow="Explore" title="Find the side from the area">
      <Prose>
        <p>
          Drag the corner to change the square. Each grid square is 1 unit of area. Try to hit an
          area exactly, and watch which areas give whole-number sides.
        </p>
      </Prose>
      <PredictReveal
        question="$\sqrt{50}$ lies between which two whole numbers?"
        options={['5 and 6', '6 and 7', '7 and 8', '24 and 26']}
        answer={2}
        explanation="$7^2 = 49$ and $8^2 = 64$. Since 50 is between them, $\sqrt{50}$ is between 7 and 8, just above 7."
      />
      <Figure>
        <div className="mx-auto w-full max-w-sm">
          <SquarePlot s={s} onSide={setS} />
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'side', value: formatNumber(s, 2), color: SQUARE },
              { label: 'area = side²', value: formatNumber(area, 4) },
              {
                label: 'whole squares between',
                value: `${Math.floor(s) ** 2} and ${Math.ceil(s + 1e-9) ** 2}`,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-area-two" when={Math.abs(area - 2) < 0.05}>
          Make the area as close to 2 as you can. What side length does that take?
        </TryThis>
        <TryThis id="t-area-twenty-five" when={Math.abs(s - 5) < 1e-9}>
          Make a square with area 25.
        </TryThis>
        <TryThis id="t-area-ten" when={Math.abs(area - 10) < 0.2}>
          Get the area close to 10. Between which two whole numbers is the side?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function SimplifyExplorer() {
  const [n, setN] = useState(72)
  const { k, m } = squareSplit(n)
  const result = k === 1 ? `\\sqrt{${n}}` : m === 1 ? String(k) : `${k}\\sqrt{${m}}`
  const cells = Array.from({ length: n }, () => ({ color: BLOCK[0] }))
  return (
    <LabSection id="simplify" eyebrow="Explore" title="Pull out the squares">
      <Prose>
        <p>
          Every whole number <Tex>{'n'}</Tex> splits into a square part times a leftover:{' '}
          <Tex>{'n = k^2 \\times m'}</Tex>. The dots below are grouped into <Tex>{'m'}</Tex>{' '}
          coloured blocks of <Tex>{'k \\times k'}</Tex>. The square part comes out of the root as{' '}
          <Tex>{'k'}</Tex>.
        </p>
      </Prose>
      <Figure>
        <div className="flex flex-wrap justify-center gap-3 px-3 pt-4 sm:px-4">
          {k === 1 ? (
            <div className="w-full max-w-xs">
              <DotGrid cells={cells} columns={10} ariaLabel={`${n} dots`} size={10} />
            </div>
          ) : (
            Array.from({ length: m }, (_, i) => (
              <div key={i} style={{ width: `${Math.max(2.5, k * 0.9)}rem` }}>
                <DotGrid
                  cells={Array.from({ length: k * k }, () => ({ color: BLOCK[i % BLOCK.length] }))}
                  columns={k}
                  ariaLabel={`Block ${i + 1}: ${k} by ${k}`}
                  size={10}
                />
              </div>
            ))
          )}
        </div>
        <div className="overflow-x-auto px-3 pt-3 text-center sm:px-4">
          <Tex
            display
          >{`\\sqrt{${n}} = \\sqrt{${k * k} \\times ${m}} = ${result} \\approx ${formatNumber(Math.sqrt(n), 3)}`}</Tex>
        </div>
        <div className="border-t border-line px-3 pt-3 sm:px-4">
          <Slider
            label={<Tex>{'n'}</Tex>}
            name="Number n"
            value={n}
            min={2}
            max={100}
            step={1}
            onChange={setN}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'biggest square factor', value: k * k },
              { label: 'leftover', value: m },
              { label: 'simplified', value: <Tex>{result}</Tex> },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-perfect" when={m === 1}>
          Find a number whose square root is a whole number. What do the blocks look like?
        </TryThis>
        <TryThis id="t-five-root-two" when={k === 5 && m === 2}>
          Find the number whose root simplifies to <Tex>{'5\\sqrt2'}</Tex>.
        </TryThis>
        <TryThis id="t-no-square" when={k === 1 && n >= 10}>
          Find a number of 10 or more that has no square factor at all. Can its root be simplified?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [s, setS] = useState(1)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-root-81"
          index={1}
          prompt="What is $\sqrt{81}$?"
          answer={9}
          explanation="$9 \times 9 = 81$."
        />
        <McqChallenge
          id="c-squeeze"
          index={2}
          prompt="Between which two whole numbers is $\sqrt{30}$?"
          options={[
            { text: '5 and 6', correct: true },
            { text: '4 and 5', why: '$5^2 = 25$ is still below 30.' },
            { text: '6 and 7', why: '$6^2 = 36$ is already above 30.' },
            { text: '15 and 16', why: 'That is half of 30, not its square root.' },
          ]}
          explanation="$25 < 30 < 36$, so $5 < \sqrt{30} < 6$."
        />
        <NumericChallenge
          id="c-simplify-48"
          index={3}
          prompt="Simplify $\sqrt{48}$ to the form $k\sqrt{m}$. What is $k$?"
          answer={4}
          explanation="$48 = 16 \times 3$, so $\sqrt{48} = 4\sqrt3$."
        />
        <NumericChallenge
          id="c-cube-27"
          index={4}
          prompt="What is $\sqrt[3]{27}$?"
          answer={3}
          explanation="$3 \times 3 \times 3 = 27$."
        />
        <NumericChallenge
          id="c-root-product"
          index={5}
          prompt="What is $\sqrt2 \times \sqrt8$?"
          answer={4}
          explanation="$\sqrt2 \times \sqrt8 = \sqrt{16} = 4$."
        />
        <InteractiveChallenge
          id="c-area-twenty"
          index={6}
          prompt="Drag the corner to make a square with area 20.25."
          solved={Math.abs(s * s - 20.25) < 1e-6}
          hint="$\sqrt{20.25}$ is between 4 and 5. Try halfway."
          explanation="$4.5^2 = 20.25$, so the side is $\sqrt{20.25} = 4.5$."
          onReset={() => setS(1)}
        >
          <div className="mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-line">
            <SquarePlot s={s} onSide={setS} />
            <p className="border-t border-line px-3 py-2 text-sm">
              side {formatNumber(s, 2)}, area {formatNumber(s * s, 4)}
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

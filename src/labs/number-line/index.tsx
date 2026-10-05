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
import { Tex } from '@/ui/Tex'
import { Label, MovablePoint, Plot, Point, Segment, Vector, constraints } from '@/viz'

const POINT = 'var(--c-blue)'
const MIRROR = 'var(--c-orange)'
const GAP = 'var(--c-violet)'

const onLine = (lo: number, hi: number) =>
  constraints.compose(
    constraints.horizontal(0),
    constraints.snapToGrid(1),
    constraints.within(lo, hi, 0, 0),
  )

/** A horizontal number line from lo to hi with integer ticks. */
function Line({
  lo,
  hi,
  children,
  ariaLabel,
}: {
  lo: number
  hi: number
  children: ReactNode
  ariaLabel: string
}) {
  return (
    <Plot
      view={{ xMin: lo - 0.6, xMax: hi + 0.6, yMin: -1.2, yMax: 1.6 }}
      height={150}
      grid={false}
      axes="x"
      xIntegers
      ariaLabel={ariaLabel}
    >
      {children}
    </Plot>
  )
}

export default function NumberLineLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Every number has a place">
        <Prose>
          <p>
            Picture a straight road with a marker called 0. Walk right and you pass 1, 2, 3…; walk
            left and you pass −1, −2, −3…. Every number, positive or negative, is a{' '}
            <strong>position</strong> on that road, and the further right a number sits, the bigger
            it is.
          </p>
          <p>
            Negative numbers aren't strange: they are temperatures below freezing, floors below
            ground, money you owe. The number line makes their rules visible: <em>opposites</em> are
            mirror images across 0, and <em>absolute value</em> is just distance from 0.
          </p>
        </Prose>
      </LabSection>
      <PlaceExplorer />
      <GapExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Order, opposites and distance">
        <Formula
          tex={
            '|x| = \\begin{cases} x & x \\ge 0 \\\\ -x & x < 0 \\end{cases} \\qquad \\text{distance}(a, b) = |a - b|'
          }
          caption="Absolute value is distance from 0; the distance between two numbers is the absolute value of their difference."
        />
        <Prose>
          <ul>
            <li>
              <strong>Order:</strong> <Tex>{'a < b'}</Tex> means <Tex>{'a'}</Tex> is to the left of{' '}
              <Tex>{'b'}</Tex>. So <Tex>{'-8 < -3'}</Tex>, even though 8 is bigger than 3.
            </li>
            <li>
              <strong>Opposite:</strong> <Tex>{'-x'}</Tex> is the mirror image of <Tex>{'x'}</Tex>{' '}
              across 0. The opposite of a negative number is positive: <Tex>{'-(-5) = 5'}</Tex>.
            </li>
            <li>
              <strong>Integers</strong> are the whole numbers and their opposites:{' '}
              <Tex>{'\\ldots, -2, -1, 0, 1, 2, \\ldots'}</Tex>. Zero is neither positive nor
              negative.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="A bigger digit isn't always a bigger number">
          <p>
            With negatives, the number that “looks” bigger is smaller: −9 is further left than −2,
            so <Tex>{'-9 < -2'}</Tex>. Think temperature: −9 °C is colder than −2 °C.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where negatives live">
        <RealWorld
          items={[
            {
              title: 'Weather',
              body: 'Temperatures below 0 °C are negative; a drop from 3 °C to −5 °C is 8 degrees.',
            },
            {
              title: 'Money',
              body: 'A bank balance of −£40 means you owe £40; paying in £50 moves you to +£10.',
            },
            {
              title: 'Buildings and maps',
              body: 'Lift buttons for basements (−1, −2) and heights below sea level, like the Dead Sea at about −430 m.',
            },
            {
              title: 'Time',
              body: 'Timelines count years before and after a reference point, like a countdown that passes zero.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Every number is a position; further right means bigger.',
            'The opposite of $x$ is its mirror image across 0.',
            '$|x|$ is the distance from 0, so it is never negative.',
            'The distance between $a$ and $b$ is $|a - b|$.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function PlaceExplorer() {
  const [x, setX] = useState(3)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Opposites and absolute value">
      <Prose>
        <p>
          Drag the blue point along the line. The orange point is its <strong>opposite</strong>, the
          mirror image across 0. The violet bar measures its distance from 0, the{' '}
          <strong>absolute value</strong>.
        </p>
      </Prose>
      <PredictReveal
        question="Which is bigger, −8 or −3?"
        options={['−8', '−3', 'They are equal']}
        answer={1}
        explanation="−3 is to the right of −8 on the number line, so −3 is bigger. Being further from 0 on the negative side makes a number smaller."
      />
      <Figure>
        <Line
          lo={-10}
          hi={10}
          ariaLabel={`Point at ${x}, opposite ${-x}, absolute value ${Math.abs(x)}`}
        >
          {x !== 0 && (
            <Segment from={[0, 0.45]} to={[x, 0.45]} color={GAP} width={6} opacity={0.7} />
          )}
          {x !== 0 && <Point at={[-x, 0]} r={7} color={MIRROR} hollow />}
          {x !== 0 && (
            <Label at={[-x, 0]} anchor="bottom" offset={[0, -12]} className="text-xs">
              {-x}
            </Label>
          )}
          <Label at={[x / 2, 0.45]} anchor="bottom" offset={[0, -6]} className="text-xs">
            |{x}| = {Math.abs(x)}
          </Label>
          <MovablePoint
            x={x}
            y={0}
            onMove={(nx) => setX(nx)}
            constrain={onLine(-10, 10)}
            color={POINT}
            label="Point on the number line"
          />
        </Line>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'x', value: x, color: POINT },
              { label: 'opposite −x', value: -x, color: MIRROR },
              { label: '|x|', value: Math.abs(x), color: GAP },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-minus-seven" when={x === -7}>
          Put the point at −7. What is its opposite?
        </TryThis>
        <TryThis id="t-own-opposite" when={x === 0}>
          Find the only number that is its own opposite.
        </TryThis>
        <TryThis id="t-abs-six" when={x === -6}>
          Find a negative number whose absolute value is 6.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function GapExplorer() {
  const [a, setA] = useState(-4)
  const [b, setB] = useState(2)
  const d = Math.abs(a - b)
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  return (
    <LabSection id="gap" eyebrow="Explore" title="The distance between two numbers">
      <Prose>
        <p>
          Drag both points. The arrow walks from <Tex>{'a'}</Tex> to <Tex>{'b'}</Tex>; its length is
          the distance. Notice that <Tex>{'b - a'}</Tex> and <Tex>{'a - b'}</Tex> differ only in
          sign, and the absolute value throws the sign away.
        </p>
      </Prose>
      <Figure>
        <Line lo={-10} hi={10} ariaLabel={`a is ${a}, b is ${b}, distance ${d}`}>
          {a !== b && <Vector from={[a, 0.5]} to={[b, 0.5]} color={GAP} />}
          {a !== b && (
            <Label at={[(lo + hi) / 2, 0.5]} anchor="bottom" offset={[0, -8]} className="text-xs">
              {d} apart
            </Label>
          )}
          <MovablePoint
            x={a}
            y={0}
            onMove={(nx) => setA(nx)}
            constrain={onLine(-10, 10)}
            color={POINT}
            label="Point a"
          />
          <MovablePoint
            x={b}
            y={0}
            onMove={(nx) => setB(nx)}
            constrain={onLine(-10, 10)}
            color={MIRROR}
            label="Point b"
          />
        </Line>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'a', value: a, color: POINT },
              { label: 'b', value: b, color: MIRROR },
              { label: 'b − a', value: b - a },
              { label: 'distance |a − b|', value: d, color: GAP },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-across-zero" when={d === 7 && a * b < 0}>
          Place the points 7 apart on opposite sides of 0.
        </TryThis>
        <TryThis id="t-both-negative" when={a < 0 && b < 0 && d >= 5}>
          Put both points on the negative side, at least 5 apart. Is the distance still positive?
        </TryThis>
        <TryThis id="t-swap" when={a > b}>
          Move <Tex>{'a'}</Tex> to the right of <Tex>{'b'}</Tex>. What happens to{' '}
          <Tex>{'b - a'}</Tex>, and to the distance?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [x, setX] = useState(2)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-abs-nine"
          index={1}
          prompt="What is $|-9|$?"
          answer={9}
          explanation="−9 is 9 steps from 0, so $|-9| = 9$."
        />
        <NumericChallenge
          id="c-gap-ten"
          index={2}
          prompt="How far apart are −6 and 4 on the number line?"
          answer={10}
          explanation="$|4 - (-6)| = |10| = 10$: 6 steps up to 0, then 4 more."
        />
        <McqChallenge
          id="c-least"
          index={3}
          prompt="Which number is the smallest?"
          options={[
            { text: '$-7$', correct: true },
            { text: '$-2$', why: '−2 is to the right of −7.' },
            { text: '$0$', why: '0 is bigger than every negative number.' },
            { text: '$3$', why: 'Positive numbers are bigger than negatives.' },
          ]}
          explanation="−7 is furthest to the left, so it is the smallest."
        />
        <NumericChallenge
          id="c-opposite-twelve"
          index={4}
          prompt="What is the opposite of −12?"
          answer={12}
          explanation="The opposite is the mirror image across 0: $-(-12) = 12$."
        />
        <McqChallenge
          id="c-true-order"
          index={5}
          prompt="Which statement is true?"
          options={[
            { text: '$-2 > -5$', correct: true },
            { text: '$-5 > -2$', why: '−5 is further left, so it is smaller.' },
            { text: '$|-5| < |-2|$', why: '5 is further from 0 than 2.' },
            { text: '$-0 < 0$', why: '$-0$ and $0$ are the same number.' },
          ]}
          explanation="−2 is to the right of −5 on the line, so $-2 > -5$."
        />
        <InteractiveChallenge
          id="c-freezer"
          index={6}
          prompt="It is 2 °C and the temperature falls by 6 degrees. Drag the point to the new temperature."
          solved={x === -4}
          hint="Falling 6 degrees means moving 6 steps to the left."
          explanation="$2 - 6 = -4$: 2 steps down to 0, then 4 more below zero."
          onReset={() => setX(2)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <Line lo={-8} hi={8} ariaLabel={`Temperature ${x} degrees`}>
              <MovablePoint
                x={x}
                y={0}
                onMove={(nx) => setX(nx)}
                constrain={onLine(-8, 8)}
                color={POINT}
                label="Temperature"
              />
            </Line>
            <p className="border-t border-line px-3 py-2 text-sm">Temperature: {x} °C</p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

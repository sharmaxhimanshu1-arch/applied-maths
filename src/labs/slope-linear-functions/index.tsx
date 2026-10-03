import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
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
import { Button } from '@/ui/Button'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { InfiniteLine, Label, MovablePoint, Plot, Point, Segment, constraints } from '@/viz'
import { fracTex } from '../_shared/fraction'
import { num, signed } from '../_shared/tex'

const VIEW = { xMin: -8, xMax: 8, yMin: -5, yMax: 5 }
const LINE = 'var(--c-blue)'
const RUN = 'var(--c-green)'
const RISE = 'var(--c-orange)'
const snapHalf = constraints.compose(
  constraints.snapToGrid(0.5),
  constraints.within(-7.5, 7.5, -4.5, 4.5),
)

type Line = { m: number; b: number } | { vertical: number }

function lineThrough(p: Vec2, q: Vec2): Line | null {
  if (p[0] === q[0] && p[1] === q[1]) return null
  if (p[0] === q[0]) return { vertical: p[0] }
  const m = (q[1] - p[1]) / (q[0] - p[0])
  return { m, b: p[1] - m * p[0] }
}

/** Slope as an exact fraction when the rise and run are on the half-grid. */
function slopeTex(rise: number, run: number): string {
  const [r, s] = [Math.round(rise * 2), Math.round(run * 2)]
  if (Math.abs(rise * 2 - r) > 1e-9 || Math.abs(run * 2 - s) > 1e-9) return num(rise / run)
  const sign = r * s < 0 ? '-' : ''
  return sign + fracTex(Math.abs(r), Math.abs(s))
}

function equationTex(line: Line): string {
  if ('vertical' in line) return `x = ${num(line.vertical)}`
  const { m, b } = line
  const mx = m === 0 ? '' : m === 1 ? 'x' : m === -1 ? '-x' : `${num(m)}x`
  if (!mx) return `y = ${num(b)}`
  return b === 0 ? `y = ${mx}` : `y = ${mx} ${signed(b)}`
}

/** Two draggable points, the line through them, and the rise/run triangle between them. */
function SlopePlot({
  a,
  b,
  onA,
  onB,
}: {
  a: Vec2
  b: Vec2
  onA: (p: Vec2) => void
  onB: (p: Vec2) => void
}) {
  const line = lineThrough(a, b)
  const run = b[0] - a[0]
  const rise = b[1] - a[1]
  const corner: Vec2 = [b[0], a[1]]
  return (
    <Plot
      view={VIEW}
      aspect="equal"
      ariaLabel={
        line
          ? `The line ${equationTex(line)} through two points`
          : 'Two points on top of each other'
      }
    >
      {line && (
        <InfiniteLine through={a} direction={[b[0] - a[0], b[1] - a[1]]} color={LINE} width={2.5} />
      )}
      {run !== 0 && <Segment from={a} to={corner} color={RUN} width={3} />}
      {rise !== 0 && <Segment from={corner} to={b} color={RISE} width={3} />}
      {run !== 0 && (
        <Label
          at={[a[0] + run / 2, a[1]]}
          anchor={rise >= 0 ? 'top' : 'bottom'}
          offset={[0, rise >= 0 ? 6 : -6]}
          color={RUN}
        >
          run {num(run)}
        </Label>
      )}
      {rise !== 0 && (
        <Label
          at={[b[0], a[1] + rise / 2]}
          anchor={run >= 0 ? 'left' : 'right'}
          offset={[run >= 0 ? 8 : -8, 0]}
          color={RISE}
        >
          rise {num(rise)}
        </Label>
      )}
      {line && !('vertical' in line) && Math.abs(line.b) <= 5 && (
        <>
          <Point at={[0, line.b]} r={5} color="var(--ink)" hollow />
          <Label at={[0, line.b]} anchor="right" offset={[-8, 0]} className="text-xs">
            <Tex>{`b = ${num(line.b)}`}</Tex>
          </Label>
        </>
      )}
      <MovablePoint
        x={a[0]}
        y={a[1]}
        onMove={(x, y) => onA([x, y])}
        constrain={snapHalf}
        step={0.5}
        color={LINE}
        label="First point"
      />
      <MovablePoint
        x={b[0]}
        y={b[1]}
        onMove={(x, y) => onB([x, y])}
        constrain={snapHalf}
        step={0.5}
        color={LINE}
        label="Second point"
      />
    </Plot>
  )
}

export default function SlopeLinearFunctionsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Steepness as a number">
        <Prose>
          <p>
            A road sign warns of a “10% grade”: the road climbs 10 metres for every 100 metres
            along. That's <strong>slope</strong>: how much you go up (the <em>rise</em>) for each
            step across (the <em>run</em>).
          </p>
          <p>
            A straight line has the same slope everywhere, so two numbers pin it down: its slope{' '}
            <Tex>m</Tex> and where it crosses the vertical axis, <Tex>b</Tex>. Together they make
            the most useful equation in algebra: <Tex>y = mx + b</Tex>.
          </p>
        </Prose>
      </LabSection>
      <RiseRunExplorer />
      <MatchExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Slope and the equation of a line">
        <Formula
          tex={'m = \\frac{\\text{rise}}{\\text{run}} = \\frac{y_2 - y_1}{x_2 - x_1}'}
          caption="The same for any two points on the line."
        />
        <Formula
          tex={'y = m x + b'}
          caption="$m$ is the slope, $b$ is the $y$-intercept: the height where the line crosses $x = 0$."
        />
        <Prose>
          <p>
            Positive slope climbs to the right, negative slope falls, zero slope is flat. A vertical
            line has no run at all, so its slope is undefined and its equation is just{' '}
            <Tex>x = c</Tex>. Parallel lines share a slope.
          </p>
        </Prose>
        <Callout kind="misconception" title="Rise over run, not run over rise">
          <p>
            Slope is vertical change divided by horizontal change. Flip it and a steep line would
            look shallow: <Tex>y = 4x</Tex> has slope 4, not <Tex>{'\\tfrac14'}</Tex>.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet slope">
        <RealWorld
          items={[
            {
              title: 'Speed',
              body: 'On a distance–time graph, the slope is the speed: metres climbed per second.',
            },
            {
              title: 'Pricing',
              body: 'A taxi charges a $3 flag fall plus $2 per km: cost $= 2x + 3$. The slope is the price per km.',
            },
            {
              title: 'Ramps and roads',
              body: 'Wheelchair ramps are limited to a slope of about 1 in 12; mountain roads post their gradient as a percentage.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Slope = rise ÷ run, the same between any two points on a line.',
            '$y = mx + b$: $m$ is the slope, $b$ the $y$-intercept.',
            'Positive slopes climb, negative slopes fall, zero is flat, vertical is undefined.',
            'Parallel lines have equal slopes.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function RiseRunExplorer() {
  const [a, setA] = useState<Vec2>([-2, -1])
  const [b, setB] = useState<Vec2>([2, 1])
  const line = lineThrough(a, b)
  const run = b[0] - a[0]
  const rise = b[1] - a[1]
  const m = line && !('vertical' in line) ? line.m : null
  return (
    <LabSection id="explore" eyebrow="Explore" title="Rise over run">
      <Prose>
        <p>
          Drag the two points. The green run and the orange rise form a right triangle; the slope is
          rise divided by run. Notice where the line crosses the vertical axis: that height is{' '}
          <Tex>b</Tex>.
        </p>
      </Prose>
      <PredictReveal
        question="You move one point further along the same line, doubling both the rise and the run. What happens to the slope?"
        options={['It doubles', 'It stays the same', 'It halves', 'It becomes 0']}
        answer={1}
        explanation="It stays the same: $\frac{2 \times \text{rise}}{2 \times \text{run}} = \frac{\text{rise}}{\text{run}}$. A straight line is equally steep everywhere."
      />
      <Figure>
        <SlopePlot a={a} b={b} onA={setA} onB={setB} />
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'slope m',
                value:
                  run === 0 ? (
                    'undefined (vertical)'
                  ) : (
                    <Tex>{`\\frac{${num(rise)}}{${num(run)}} = ${slopeTex(rise, run)}`}</Tex>
                  ),
                color: LINE,
              },
              {
                label: 'equation',
                value: line ? <Tex>{equationTex(line)}</Tex> : 'the points coincide',
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-two" when={m !== null && Math.abs(m - 2) < 1e-9}>
          Make a line with slope exactly 2: up 2 for every 1 across.
        </TryThis>
        <TryThis id="t-negative" when={m !== null && m < 0}>
          Make the line fall from left to right. What is the sign of the slope?
        </TryThis>
        <TryThis id="t-flat" when={m === 0}>
          Make the line perfectly flat. What is its slope, and what does the equation look like?
        </TryThis>
        <TryThis id="t-vertical" when={line !== null && 'vertical' in line}>
          Make the line vertical. Why does the slope break?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const TARGETS = [
  { m: 1, b: 2 },
  { m: -2, b: 1 },
  { m: 0.5, b: -3 },
]

function MatchExplorer() {
  const [m, setM] = useState(0)
  const [b, setB] = useState(0)
  const [round, setRound] = useState(0)
  const [matched, setMatched] = useState(0)
  const target = TARGETS[round % TARGETS.length]
  const hit = m === target.m && b === target.b
  return (
    <LabSection id="m-and-b" eyebrow="Explore" title="Match the line">
      <Prose>
        <p>
          Now drive the line with its two numbers. <Tex>m</Tex> tilts it about the point where it
          crosses the axis; <Tex>b</Tex> slides it up and down. Match the dashed target line.
        </p>
      </Prose>
      <Figure>
        <Plot
          view={VIEW}
          aspect="equal"
          ariaLabel={`Your line y = ${num(m)}x + ${num(b)}; target line dashed`}
        >
          <InfiniteLine
            through={[0, target.b]}
            direction={[1, target.m]}
            color="var(--ink-3)"
            width={2.5}
            dashed
          />
          <InfiniteLine
            through={[0, b]}
            direction={[1, m]}
            color={hit ? 'var(--good)' : LINE}
            width={2.75}
          />
          <Point at={[0, b]} r={5} color={hit ? 'var(--good)' : LINE} />
        </Plot>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label={<Tex>m</Tex>}
            name="Slope m"
            value={m}
            min={-4}
            max={4}
            step={0.25}
            onChange={setM}
            color={LINE}
          />
          <Slider
            label={<Tex>b</Tex>}
            name="Intercept b"
            value={b}
            min={-5}
            max={5}
            step={0.5}
            onChange={setB}
            color={LINE}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-line p-3 sm:px-4">
          <Tex>{equationTex({ m, b })}</Tex>
          <span className="text-sm text-ink-2" aria-live="polite">
            {hit ? 'Matched!' : `Target ${(round % TARGETS.length) + 1} of ${TARGETS.length}`}
          </span>
          <Button
            size="sm"
            variant="primary"
            className="ml-auto"
            icon={<ArrowRight className="size-4" />}
            disabled={!hit}
            onClick={() => {
              setMatched((n) => Math.max(n, round + 1))
              setRound((r) => r + 1)
            }}
          >
            Next target
          </Button>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-match-one" when={matched >= 1 || hit}>
          Match the first target line.
        </TryThis>
        <TryThis id="t-match-all" when={matched >= TARGETS.length}>
          Match all three targets. Which number did you set first, and why?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [a, setA] = useState<Vec2>([-4, -2])
  const [b, setB] = useState<Vec2>([2, 1])
  const line = lineThrough(a, b)
  const solved =
    line !== null &&
    !('vertical' in line) &&
    Math.abs(line.m + 0.5) < 1e-9 &&
    Math.abs(line.b - 3) < 1e-9
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-slope"
          index={1}
          prompt="What is the slope of the line through $(1, 2)$ and $(3, 8)$?"
          answer={3}
          explanation="$m = \frac{8 - 2}{3 - 1} = \frac{6}{2} = 3$."
        />
        <NumericChallenge
          id="c-intercept"
          index={2}
          prompt="Where does $y = -2x + 5$ cross the $y$-axis? Give the $y$-value."
          answer={5}
          explanation="At $x = 0$: $y = -2 \cdot 0 + 5 = 5$. That's $b$."
        />
        <McqChallenge
          id="c-steepest"
          index={3}
          prompt="Which line is the steepest?"
          options={[
            { text: '$y = -4x + 1$', correct: true },
            { text: '$y = 3x - 2$', why: 'Slope 3; compare sizes, ignoring the sign.' },
            {
              text: '$y = 0.5x + 9$',
              why: 'Slope 0.5 is gentle; the $+9$ only moves the line up.',
            },
            { text: '$y = 2x$', why: 'Slope 2 is steeper than 0.5 but not than 4.' },
          ]}
          explanation="Steepness is the size of the slope: $|-4| = 4$ is the largest. The minus sign just means it falls."
        />
        <InteractiveChallenge
          id="c-place"
          index={4}
          prompt="Drag the points so the line is $y = -\tfrac12 x + 3$."
          solved={solved}
          hint="Put one point at the intercept $(0, 3)$. From there, go 2 right and 1 down."
          explanation="Through $(0, 3)$ with slope $-\tfrac12$: for example $(0, 3)$ and $(2, 2)$."
          onReset={() => {
            setA([-4, -2])
            setB([2, 1])
          }}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <SlopePlot a={a} b={b} onA={setA} onB={setB} />
            <p className="border-t border-line px-3 py-2 text-sm">
              Your line: {line ? <Tex>{equationTex(line)}</Tex> : 'drag the points apart'}
            </p>
          </div>
        </InteractiveChallenge>
        <McqChallenge
          id="c-flat"
          index={5}
          prompt="What is the slope of a horizontal line?"
          options={[
            { text: '0', correct: true },
            { text: '1', why: 'Slope 1 climbs at 45°.' },
            { text: 'Undefined', why: 'That is a vertical line, where the run is 0.' },
            {
              text: 'It depends on its height',
              why: 'Height is $b$; a flat line has no rise at all.',
            },
          ]}
          explanation="A horizontal line has rise 0 for any run, so $m = \frac{0}{\text{run}} = 0$."
        />
      </ChallengeSet>
    </LabSection>
  )
}

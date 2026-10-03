import { Play, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { formatNumber } from '@/math/core'
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
import { Circle, Label, Plot, Point, Polygon, Segment, usePlayback } from '@/viz'

const RIM = 'var(--c-blue)'
const ROLLED = 'var(--c-orange)'
const DIAM = 'var(--c-green)'
const UP = 'var(--c-blue)'
const DOWN = 'var(--c-orange)'

export default function CirclesPiLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="The same number for every circle">
        <Prose>
          <p>
            Wrap a string round a can, a plate and a wheel. Each time, the string is a little over
            three times as long as the circle is wide. Not roughly three for some and four for
            others: always the same <strong>3.14159…</strong>, a number called <strong>π</strong>.
          </p>
          <p>
            Why the same? Every circle is a scaled copy of every other, so the ratio of distance
            around to distance across can't change. That one number then unlocks both the length
            round a circle and the area inside it.
          </p>
        </Prose>
      </LabSection>
      <RollExplorer />
      <SlicesExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Circumference and area">
        <Formula
          tex={'\\pi = \\frac{C}{d} \\approx 3.14159 \\qquad C = \\pi d = 2\\pi r'}
          caption="Circumference: π diameters, or 2π radii."
        />
        <Formula
          tex={'A = \\pi r^2'}
          caption="Cut the disc into thin slices and lay them top-to-tail: a near-rectangle $\pi r$ long and $r$ tall."
        />
        <Prose>
          <p>
            π is <em>irrational</em>: its decimals never end or repeat, so <Tex>{'3.14'}</Tex> and{' '}
            <Tex>{'\\tfrac{22}{7}'}</Tex> are only approximations. An <em>arc</em> is a piece of the
            circumference and a <em>sector</em> a slice of the area: an angle of{' '}
            <Tex>{'\\theta'}</Tex> degrees takes <Tex>{'\\tfrac{\\theta}{360}'}</Tex> of each.
          </p>
        </Prose>
        <Callout
          kind="misconception"
          title="Area doubles when the radius doubles? No: it quadruples"
        >
          <p>
            The circumference grows in step with the radius, but area grows with its <em>square</em>
            . A pizza twice as wide has four times as much pizza.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Circles in the wild">
        <RealWorld
          items={[
            {
              title: 'Wheels and odometers',
              body: 'Each turn of a wheel moves you one circumference forward. Bike computers count turns × πd.',
            },
            {
              title: 'Pizza value',
              body: 'An 18-inch pizza has more than twice the area of a 12-inch one: $(18/12)^2 = 2.25$.',
            },
            {
              title: 'Pipes and cables',
              body: 'How much water a pipe carries depends on its cross-section area, $\\pi r^2$: double the radius, four times the flow area.',
            },
            {
              title: 'Running tracks',
              body: 'Outer lanes start further ahead because their curved ends have a bigger radius, so a longer arc.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'For every circle, circumference ÷ diameter = π ≈ 3.14159.',
            '$C = 2\\pi r$ and $A = \\pi r^2$.',
            'Doubling the radius doubles the circumference but quadruples the area.',
            'π is irrational: its decimals never end or repeat.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function RollExplorer() {
  const [r, setR] = useState(1)
  const [rolled, setRolled] = useState<number[]>([])
  const playback = usePlayback(3.2)
  const t = playback.t
  const theta = 2 * Math.PI * t
  const center: Vec2 = [r * theta, r]
  const marker: Vec2 = [center[0] - r * Math.sin(theta), center[1] - r * Math.cos(theta)]
  const C = 2 * Math.PI * r
  if (t >= 1 && !rolled.includes(r)) setRolled([...rolled, r])
  return (
    <LabSection id="explore" eyebrow="Explore" title="Roll the circle out">
      <Prose>
        <p>
          Press <strong>Roll</strong>. The wheel turns exactly once, and the orange line is the
          ground it covers: its circumference, unrolled. The green marks are diameters laid end to
          end. Change the size and roll again.
        </p>
      </Prose>
      <PredictReveal
        question="How many diameters long is the unrolled circumference?"
        options={['Exactly 3', 'A little over 3', 'Exactly 4', 'It depends on the size']}
        answer={1}
        explanation="A little over 3: $\pi \approx 3.14$ diameters, for every size of circle."
      />
      <Figure>
        <Plot
          view={{ xMin: -0.6, xMax: 10.4, yMin: -0.6, yMax: 3.4 }}
          aspect="equal"
          ariaLabel={`A circle of radius ${r} rolled ${formatNumber(t * 100, 0)} percent of a turn`}
        >
          {[1, 2, 3].map((k) => (
            <g key={k}>
              <Segment
                from={[(k - 1) * 2 * r + 0.05, -0.25]}
                to={[k * 2 * r - 0.05, -0.25]}
                color={DIAM}
                width={4}
              />
              <Label
                at={[(k - 0.5) * 2 * r, -0.25]}
                anchor="top"
                offset={[0, 4]}
                color={DIAM}
                className="text-xs"
              >
                d
              </Label>
            </g>
          ))}
          <Segment from={[0, 0]} to={[r * theta, 0]} color={ROLLED} width={4} />
          <Circle
            center={center}
            r={r}
            fill={RIM}
            fillOpacity={0.12}
            stroke={RIM}
            strokeWidth={2.5}
          />
          <Segment from={center} to={marker} color={RIM} width={1.5} />
          <Point at={marker} r={5} color={ROLLED} />
          <Point at={[0, 0]} r={3.5} color="var(--ink-2)" />
        </Plot>
        <div className="flex flex-wrap items-center gap-3 border-t border-line p-3 sm:px-4">
          <Button
            size="sm"
            variant="primary"
            icon={<Play className="size-4" />}
            onClick={playback.play}
            disabled={playback.playing}
          >
            Roll
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="size-4" />}
            onClick={playback.reset}
            disabled={t === 0}
          >
            Reset
          </Button>
          <Slider
            className="min-w-48 flex-1"
            label="Radius r"
            value={r}
            min={0.5}
            max={1.5}
            step={0.25}
            onChange={(v) => {
              setR(v)
              playback.reset()
            }}
            color={RIM}
          />
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'circumference C', value: formatNumber(C, 3), color: ROLLED },
              { label: 'diameter d', value: formatNumber(2 * r, 2), color: DIAM },
              { label: 'C ÷ d', value: formatNumber(C / (2 * r), 5) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-roll" when={rolled.length >= 1}>
          Roll the wheel all the way round. How far past three diameters does it go?
        </TryThis>
        <TryThis id="t-sizes" when={rolled.length >= 2}>
          Change the radius and roll again. Does C ÷ d change?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

/** Sectors of a disc of radius r, laid alternately point-down and point-up in a row. */
function slices(n: number, r: number) {
  const alpha = (2 * Math.PI) / n
  const s = 2 * r * Math.sin(alpha / 2)
  const h = r * Math.cos(alpha / 2)
  const arc = (apex: Vec2, mid: number): Vec2[] =>
    Array.from({ length: 9 }, (_, i) => {
      const phi = mid - alpha / 2 + (alpha * i) / 8
      return [apex[0] + r * Math.cos(phi), apex[1] + r * Math.sin(phi)]
    })
  const out: { pts: Vec2[]; up: boolean }[] = []
  for (let k = 0; k < n / 2; k++) {
    const upApex: Vec2 = [k * s + s / 2, 0]
    out.push({ pts: [upApex, ...arc(upApex, Math.PI / 2)], up: true })
    const downApex: Vec2 = [k * s + s, h]
    out.push({ pts: [downApex, ...arc(downApex, -Math.PI / 2)], up: false })
  }
  return { pieces: out, width: (n / 2) * s, height: h }
}

const SR = 2

function SlicesExplorer() {
  const [n, setN] = useState(8)
  const { pieces, width, height } = slices(n, SR)
  return (
    <LabSection id="slices" eyebrow="Explore" title="Slice the pizza, rearrange the area">
      <Prose>
        <p>
          Cut a disc of radius 2 into <Tex>n</Tex> equal slices and lay them alternately point up
          and point down. With more slices the bumpy edges flatten and the shape becomes a
          rectangle: half the circumference long (<Tex>{'\\pi r'}</Tex>) and one radius tall.
        </p>
      </Prose>
      <Figure>
        <Plot
          view={{ xMin: -0.4, xMax: 7.6, yMin: -0.6, yMax: 2.6 }}
          aspect="equal"
          grid={false}
          ariaLabel={`${n} slices arranged into a shape ${formatNumber(width, 2)} wide and ${formatNumber(height, 2)} tall`}
        >
          {pieces.map((p, i) => (
            <Polygon
              key={i}
              points={p.pts}
              fill={p.up ? UP : DOWN}
              fillOpacity={0.35}
              stroke={p.up ? UP : DOWN}
              strokeWidth={1}
            />
          ))}
          <Label at={[width / 2, 0]} anchor="top" offset={[0, 4]} className="text-xs">
            ≈ πr = {formatNumber(Math.PI * SR, 3)}
          </Label>
        </Plot>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label="Number of slices n"
            value={n}
            min={4}
            max={48}
            step={2}
            onChange={setN}
            color={UP}
          />
          <Readouts
            items={[
              { label: 'width', value: formatNumber(width, 3) },
              { label: 'height', value: formatNumber(height, 3) },
              { label: 'width × height', value: formatNumber(width * height, 3) },
              { label: 'πr²', value: formatNumber(Math.PI * SR * SR, 3), color: UP },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-many" when={n >= 30}>
          Use 30 or more slices. How close is width × height to <Tex>{'\\pi r^2'}</Tex>?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [r, setR] = useState(2)
  const area = Math.PI * r * r
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-circ"
          index={1}
          prompt="Find the circumference of a circle with radius 5. (Decimals are fine.)"
          answer={10 * Math.PI}
          tolerance={0.05}
          explanation="$C = 2\pi r = 10\pi \approx 31.42$."
        />
        <NumericChallenge
          id="c-area"
          index={2}
          prompt="Find the area of a circle with radius 3."
          answer={9 * Math.PI}
          tolerance={0.05}
          explanation="$A = \pi r^2 = 9\pi \approx 28.27$."
        />
        <McqChallenge
          id="c-double"
          index={3}
          prompt="You double a circle's radius. What happens to its area?"
          options={[
            { text: 'It becomes 4 times as big', correct: true },
            { text: 'It doubles', why: 'That is the circumference.' },
            { text: 'It becomes $\\pi$ times as big', why: '$\\pi$ is fixed; only $r$ changed.' },
            { text: 'It becomes 8 times as big', why: 'That would be a sphere’s volume.' },
          ]}
          explanation="$\pi (2r)^2 = 4\pi r^2$."
        />
        <NumericChallenge
          id="c-diameter"
          index={4}
          prompt="A wheel's circumference is 31.4 cm. Roughly what is its diameter, in cm?"
          answer={31.4 / Math.PI}
          tolerance={0.1}
          explanation="$d = C / \pi = 31.4 / 3.14 \approx 10$ cm."
        />
        <InteractiveChallenge
          id="c-fifty"
          index={5}
          prompt="Choose a radius so the circle's area is about 50 (within 0.5)."
          solved={Math.abs(area - 50) < 0.5}
          hint="$r^2 \approx 50 / 3.14 \approx 16$."
          explanation="$r = 4$ gives $16\pi \approx 50.3$."
          onReset={() => setR(2)}
        >
          <div className="grid gap-3 rounded-xl border border-line p-3">
            <div className="mx-auto w-full max-w-[220px]">
              <Plot
                view={{ xMin: -5, xMax: 5, yMin: -5, yMax: 5 }}
                aspect="equal"
                grid={false}
                axes={false}
                ariaLabel={`Circle of radius ${r}`}
              >
                <Circle center={[0, 0]} r={r} fill={RIM} fillOpacity={0.2} stroke={RIM} />
              </Plot>
            </div>
            <Slider
              label="Radius"
              value={r}
              min={0.5}
              max={5}
              step={0.05}
              onChange={setR}
              color={RIM}
            />
            <p className="text-sm">
              Area: <span className="font-mono">{formatNumber(area, 2)}</span>
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

import { useState } from 'react'
import { add, cross, norm, scale, type Vec2 } from '@/math/linalg'
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
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import { InfiniteLine, Label, MovablePoint, Plot, Point, Vector, constraints } from '@/viz'
import { COLORS, num, vec } from '../_shared/tex'

const VIEW = { xMin: -8, xMax: 8, yMin: -5, yMax: 5 }
const snap = constraints.snapToGrid(0.5)
const TARGET: Vec2 = [4, 1]

type SpanKind = 'plane' | 'line' | 'point'

function spanOf(v: Vec2, w: Vec2): SpanKind {
  if (norm(v) < 1e-9 && norm(w) < 1e-9) return 'point'
  if (Math.abs(cross(v, w)) < 1e-9) return 'line'
  return 'plane'
}

const SPAN_TEXT: Record<SpanKind, string> = {
  plane: 'the whole plane',
  line: 'just a line',
  point: 'only the origin',
}

export default function SpanLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Two arrows, how many places?">
        <Prose>
          <p>
            Give someone two moves, say “one step along <Tex>{'\\vec v'}</Tex>” and “one step along{' '}
            <Tex>{'\\vec w'}</Tex>”, and let them take any amount of each, forwards or backwards.
            Which points can they reach?
          </p>
          <p>
            Mixing scaled vectors like this is called a <strong>linear combination</strong>, and the
            set of everything reachable is the <strong>span</strong>. It's the question behind
            mixing colours from red, green and blue, and behind describing data with a handful of
            features.
          </p>
        </Prose>
      </LabSection>
      <SpanExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Combinations, span and independence">
        <Formula
          tex={'a\\,\\vec v + b\\,\\vec w \\qquad (a, b \\text{ any real numbers})'}
          caption="A linear combination of $\vec v$ and $\vec w$."
        />
        <Prose>
          <p>
            The <strong>span</strong> of <Tex>{'\\vec v'}</Tex> and <Tex>{'\\vec w'}</Tex> is every
            point you can make this way. Two vectors that don't lie on the same line are{' '}
            <strong>linearly independent</strong>: neither is a multiple of the other, and together
            they span the whole plane. A pair like that is a <strong>basis</strong>: every point has
            exactly one recipe <Tex>(a, b)</Tex>.
          </p>
          <p>
            If <Tex>{'\\vec w = k\\,\\vec v'}</Tex>, the second vector adds nothing new. Every
            combination stays on one line through the origin.
          </p>
        </Prose>
        <Callout kind="misconception">
          <p>
            “Two vectors always span the plane” is only true when they point in genuinely different
            directions. Two arrows on the same line, even long ones, only ever reach that line.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet span">
        <RealWorld
          items={[
            {
              title: 'Screens and colour',
              body: 'Every colour on your screen is a combination $r\\,\\vec R + g\\,\\vec G + b\\,\\vec B$ of red, green and blue light. Three independent colours span a whole space of colours.',
            },
            {
              title: 'Nutrition and recipes',
              body: 'Which mixes of two foods hit a protein and carbohydrate target? That is asking whether the target lies in the span of the two foods’ nutrient vectors.',
            },
            {
              title: 'Data science',
              body: 'Reducing data to a few features means describing each data point as a combination of a small set of basis vectors.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A linear combination scales vectors and adds them: $a\\vec v + b\\vec w$.',
            'The span is every point you can reach that way.',
            'Two independent vectors span the plane, and form a basis.',
            'If one vector is a multiple of the other, the span collapses to a line.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function SpanExplorer() {
  const [v, setV] = useState<Vec2>([2, 1])
  const [w, setW] = useState<Vec2>([-1, 1.5])
  const [a, setA] = useState(1)
  const [b, setB] = useState(1)
  const [paint, setPaint] = useState(false)
  const av = scale(v, a)
  const p = add(av, scale(w, b))
  const kind = spanOf(v, w)
  const hit = Math.hypot(p[0] - TARGET[0], p[1] - TARGET[1]) < 0.06

  const lattice: Vec2[] = []
  if (paint)
    for (let i = -6; i <= 6; i++)
      for (let j = -6; j <= 6; j++) lattice.push(add(scale(v, i / 2), scale(w, j / 2)))

  return (
    <LabSection id="explore" eyebrow="Explore" title="Mix two arrows">
      <Prose>
        <p>
          Use the sliders to take <Tex>a</Tex> copies of <Tex>{'\\vec v'}</Tex> and <Tex>b</Tex>{' '}
          copies of <Tex>{'\\vec w'}</Tex>. Drag the tips to change the arrows themselves. Can you
          reach the violet target?
        </p>
      </Prose>
      <PredictReveal
        question="If $\vec v$ and $\vec w$ point in different directions, which points can a combination reach?"
        options={[
          'Every point in the plane',
          'Only points between the two arrows',
          'Only the top-right quarter',
          'Only points on the arrows',
        ]}
        answer={0}
        explanation="Negative amounts reverse an arrow and big amounts stretch it, so two independent directions reach everywhere. Turn on 'Paint the span' to see the grid of reachable points."
      />
      <Figure>
        <Plot
          view={VIEW}
          aspect="equal"
          ariaLabel={`a v plus b w equals (${num(p[0])}, ${num(p[1])}). The span is ${SPAN_TEXT[kind]}.`}
        >
          {kind === 'line' && (
            <InfiniteLine
              through={[0, 0]}
              direction={norm(v) > 0 ? v : w}
              color={COLORS.result}
              width={6}
              opacity={0.18}
            />
          )}
          {lattice.map((q, i) => (
            <Point key={i} at={q} r={2.5} color="var(--ink-3)" />
          ))}
          <Point at={TARGET} r={8} color={COLORS.target} />
          <Label at={TARGET} anchor="left" offset={[12, 0]} color={COLORS.target}>
            target
          </Label>
          <Vector to={av} color={COLORS.u} width={2.25} opacity={0.75} dashed />
          <Vector from={av} to={p} color={COLORS.v} width={2.25} opacity={0.75} dashed />
          <Vector to={p} color={COLORS.result} width={3.25} />
          <Vector to={v} color={COLORS.u} />
          <Vector to={w} color={COLORS.v} />
          <Label at={v} anchor="bottom-left" offset={[8, -4]} color={COLORS.u}>
            <Tex>{'\\vec v'}</Tex>
          </Label>
          <Label at={w} anchor="bottom-right" offset={[-8, -4]} color={COLORS.v}>
            <Tex>{'\\vec w'}</Tex>
          </Label>
          <MovablePoint
            x={v[0]}
            y={v[1]}
            onMove={(x, y) => setV([x, y])}
            constrain={snap}
            step={0.5}
            color={COLORS.u}
            size={6}
            label="Tip of vector v"
          />
          <MovablePoint
            x={w[0]}
            y={w[1]}
            onMove={(x, y) => setW([x, y])}
            constrain={snap}
            step={0.5}
            color={COLORS.v}
            size={6}
            label="Tip of vector w"
          />
        </Plot>
        <div className="grid gap-3 border-t border-line p-3 sm:grid-cols-2">
          <Slider
            label={<Tex>a</Tex>}
            name="Amount a of v"
            value={a}
            min={-3}
            max={3}
            step={0.1}
            onChange={setA}
            color={COLORS.u}
          />
          <Slider
            label={<Tex>b</Tex>}
            name="Amount b of w"
            value={b}
            min={-3}
            max={3}
            step={0.1}
            onChange={setB}
            color={COLORS.v}
          />
          <Readouts
            items={[
              {
                label: <Tex>{'a\\vec v + b\\vec w'}</Tex>,
                value: <Tex>{vec(p, 1)}</Tex>,
                color: COLORS.result,
              },
              { label: 'span', value: SPAN_TEXT[kind] },
            ]}
          />
          <Switch label="Paint the span (half-steps of each)" checked={paint} onChange={setPaint} />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-target" when={hit}>
          Reach the violet target with the sliders.
        </TryThis>
        <TryThis id="t-line" when={kind === 'line' && norm(v) > 0 && norm(w) > 0}>
          Drag the arrows until the span collapses to a single line.
        </TryThis>
        <TryThis id="t-paint" when={paint && kind === 'plane'}>
          Paint the span while the arrows point different ways. What does the grid look like?
        </TryThis>
      </TryThisList>
      <Prose className="mt-4">
        <p>
          When the arrows line up, you can still slide along that line, but no amount of{' '}
          <Tex>a</Tex> and <Tex>b</Tex> gets you off it. The second arrow is{' '}
          <strong>dependent</strong>: it's already a multiple of the first.
        </p>
      </Prose>
    </LabSection>
  )
}

function Practice() {
  const v: Vec2 = [1, 1]
  const w: Vec2 = [1, -1]
  const goal: Vec2 = [3, 1]
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)
  const p = add(scale(v, a), scale(w, b))
  const solved = Math.hypot(p[0] - goal[0], p[1] - goal[1]) < 0.06

  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <InteractiveChallenge
          id="c-recipe"
          index={1}
          prompt="With $\vec v = (1, 1)$ and $\vec w = (1, -1)$, find the amounts $a$ and $b$ that reach $(3, 1)$."
          solved={solved}
          hint="The first components give $a + b = 3$; the second give $a - b = 1$."
          explanation="$a = 2,\ b = 1$: $2(1,1) + 1(1,-1) = (3, 1)$. Finding the recipe means solving a small system of equations."
          onReset={() => {
            setA(0)
            setB(0)
          }}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <Plot
              view={{ xMin: -1, xMax: 5, yMin: -2, yMax: 3 }}
              aspect="equal"
              ariaLabel="Combination of (1,1) and (1,-1)"
            >
              <Point at={goal} r={7} color={COLORS.target} />
              <Vector to={scale(v, a)} color={COLORS.u} dashed width={2} />
              <Vector from={scale(v, a)} to={p} color={COLORS.v} dashed width={2} />
              <Vector to={p} color={COLORS.result} />
            </Plot>
            <div className="grid gap-3 border-t border-line p-3 sm:grid-cols-2">
              <Slider
                label={<Tex>a</Tex>}
                name="Amount a"
                value={a}
                min={-3}
                max={3}
                step={0.5}
                onChange={setA}
                color={COLORS.u}
              />
              <Slider
                label={<Tex>b</Tex>}
                name="Amount b"
                value={b}
                min={-3}
                max={3}
                step={0.5}
                onChange={setB}
                color={COLORS.v}
              />
            </div>
          </div>
        </InteractiveChallenge>
        <NumericChallenge
          id="c-multiple"
          index={2}
          prompt="$(6, 3)$ is what multiple of $(2, 1)$?"
          answer={3}
          explanation="$3 \cdot (2, 1) = (6, 3)$, so the two vectors lie on the same line."
        />
        <McqChallenge
          id="c-span-line"
          index={3}
          prompt="What is the span of $(1, 2)$ and $(2, 4)$?"
          options={[
            { text: 'A line through the origin', correct: true },
            {
              text: 'The whole plane',
              why: '$(2, 4)$ is just $2 \\cdot (1, 2)$: no new direction.',
            },
            { text: 'Just the two points', why: 'You can take any amounts, not only 1 of each.' },
            {
              text: 'A square',
              why: 'Spans are always flat things through the origin: a point, a line or a plane.',
            },
          ]}
          explanation="Both vectors point the same way, so every combination stays on the line through $(1, 2)$."
        />
        <McqChallenge
          id="c-basis"
          index={4}
          prompt="Which pair spans the whole plane?"
          options={[
            { text: '$(1, 0)$ and $(1, 1)$', correct: true },
            { text: '$(1, 2)$ and $(-2, -4)$', why: 'The second is $-2$ times the first.' },
            { text: '$(0, 0)$ and $(3, 1)$', why: 'The zero vector adds no direction.' },
            { text: '$(2, 2)$ and $(5, 5)$', why: 'Both lie on the line $y = x$.' },
          ]}
          explanation="$(1, 0)$ and $(1, 1)$ point in different directions, so they are independent and form a basis."
        />
        <NumericChallenge
          id="c-solve"
          index={5}
          prompt="If $\vec v = (2, -1)$ and $2\vec v + 3\vec w = (7, 4)$, what is the **first** component of $\vec w$?"
          answer={1}
          hint="Compare first components: $2 \cdot 2 + 3w_1 = 7$."
          explanation="$4 + 3w_1 = 7$, so $w_1 = 1$."
        />
      </ChallengeSet>
    </LabSection>
  )
}

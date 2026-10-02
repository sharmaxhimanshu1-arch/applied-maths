import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
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
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { FunctionGraph, Plot, Point, Vector } from '@/viz'
import { num } from '../_shared/tex'

type BaseId = 'square' | 'abs' | 'sqrt' | 'cube' | 'sin'

const BASES: Record<
  BaseId,
  { label: string; tex: string; f: (x: number) => number; wrap: (inner: string) => string }
> = {
  square: {
    label: 'x²',
    tex: 'x^2',
    f: (x) => x * x,
    wrap: (i) => (i === 'x' ? 'x^2' : `\\left(${i}\\right)^2`),
  },
  abs: { label: '|x|', tex: '|x|', f: Math.abs, wrap: (i) => `\\left|${i}\\right|` },
  sqrt: {
    label: '√x',
    tex: '\\sqrt{x}',
    f: (x) => (x >= 0 ? Math.sqrt(x) : NaN),
    wrap: (i) => `\\sqrt{${i}}`,
  },
  cube: {
    label: 'x³',
    tex: 'x^3',
    f: (x) => x ** 3,
    wrap: (i) => (i === 'x' ? 'x^3' : `\\left(${i}\\right)^3`),
  },
  sin: { label: 'sin x', tex: '\\sin x', f: Math.sin, wrap: (i) => `\\sin\\left(${i}\\right)` },
}

type Knobs = { a: number; b: number; h: number; k: number }
const IDENTITY: Knobs = { a: 1, b: 1, h: 0, k: 0 }
const VIEW = { xMin: -8, xMax: 8, yMin: -5, yMax: 5 }
const BASE = 'var(--ink-3)'
const MOVED = 'var(--c-blue)'

function transformed(base: BaseId, { a, b, h, k }: Knobs) {
  const f = BASES[base].f
  return (x: number) => a * f(b * (x - h)) + k
}

function equationTex(base: BaseId, { a, b, h, k }: Knobs): string {
  const shifted = h === 0 ? 'x' : `x ${h > 0 ? '-' : '+'} ${num(Math.abs(h))}`
  const inner =
    b === 1
      ? shifted
      : h === 0
        ? `${b === -1 ? '-' : num(b)}x`
        : `${b === -1 ? '-' : num(b)}(${shifted})`
  const outer = a === 1 ? '' : a === -1 ? '-' : num(a)
  const tail = k === 0 ? '' : ` ${k > 0 ? '+' : '-'} ${num(Math.abs(k))}`
  return `y = ${outer}${BASES[base].wrap(inner)}${tail}`
}

function effects({ a, b, h, k }: Knobs): string[] {
  const out: string[] = []
  if (a < 0) out.push('flipped upside down')
  if (Math.abs(a) > 1) out.push(`stretched vertically ×${num(Math.abs(a))}`)
  if (Math.abs(a) < 1) out.push(`squashed vertically ×${num(Math.abs(a))}`)
  if (b < 0) out.push('mirrored left–right')
  if (Math.abs(b) > 1) out.push(`squeezed horizontally ÷${num(Math.abs(b))}`)
  if (Math.abs(b) < 1) out.push(`stretched horizontally ×${num(1 / Math.abs(b))}`)
  if (h !== 0) out.push(`moved ${h > 0 ? 'right' : 'left'} ${num(Math.abs(h))}`)
  if (k !== 0) out.push(`moved ${k > 0 ? 'up' : 'down'} ${num(Math.abs(k))}`)
  return out.length ? out : ['unchanged']
}

/** Never let a slider sit on 0 for a or b (that flattens the graph completely). */
const nonZero = (v: number, prev: number) => (v === 0 ? (prev > 0 ? -0.25 : 0.25) : v)

function KnobSliders({ knobs, onKnobs }: { knobs: Knobs; onKnobs: (k: Knobs) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Slider
        label={<Tex>a</Tex>}
        name="a: vertical stretch"
        value={knobs.a}
        min={-3}
        max={3}
        step={0.25}
        onChange={(v) => onKnobs({ ...knobs, a: nonZero(v, knobs.a) })}
        color={MOVED}
      />
      <Slider
        label={<Tex>b</Tex>}
        name="b: horizontal squeeze"
        value={knobs.b}
        min={-3}
        max={3}
        step={0.25}
        onChange={(v) => onKnobs({ ...knobs, b: nonZero(v, knobs.b) })}
        color={MOVED}
      />
      <Slider
        label={<Tex>h</Tex>}
        name="h: horizontal shift"
        value={knobs.h}
        min={-5}
        max={5}
        step={0.5}
        onChange={(v) => onKnobs({ ...knobs, h: v })}
        color={MOVED}
      />
      <Slider
        label={<Tex>k</Tex>}
        name="k: vertical shift"
        value={knobs.k}
        min={-4}
        max={4}
        step={0.5}
        onChange={(v) => onKnobs({ ...knobs, k: v })}
        color={MOVED}
      />
    </div>
  )
}

export default function FunctionTransformationsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Four knobs for any graph">
        <Prose>
          <p>
            Once you know the shape of a basic graph, like <Tex>y = x^2</Tex>, you know the shape of
            a whole family. Every member is the same curve, moved or reshaped by four numbers:
          </p>
        </Prose>
        <Formula
          tex={'y = a\\, f\\big(b\\,(x - h)\\big) + k'}
          caption="$a$ and $k$ act vertically (outside $f$); $b$ and $h$ act horizontally (inside $f$)."
        />
      </LabSection>
      <KnobsExplorer />
      <MatchExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Outside versus inside">
        <Prose>
          <p>
            Changes <strong>outside</strong> the function act on the output, so they move the graph
            up and down the way you'd expect: <Tex>+k</Tex> lifts it by <Tex>k</Tex>; <Tex>a</Tex>{' '}
            stretches it vertically, flipping it if negative.
          </p>
          <p>
            Changes <strong>inside</strong> act on the input before <Tex>f</Tex> sees it, so they
            feel backwards. To get the old output at a new spot you need the old input there:{' '}
            <Tex>f(x - 3)</Tex> at <Tex>x = 3</Tex> equals <Tex>f(0)</Tex>, so the graph moves{' '}
            <em>right</em> by 3. Likewise <Tex>f(2x)</Tex> reaches each value twice as soon,
            squeezing the graph towards the axis.
          </p>
        </Prose>
        <Callout kind="misconception" title="The minus sign moves it right">
          <p>
            <Tex>{'y = (x - 2)^2'}</Tex> is <Tex>y = x^2</Tex> moved <strong>right</strong> by 2,
            and <Tex>{'y = (x + 2)^2'}</Tex> is moved left. Read <Tex>x - h</Tex> as “the new centre
            is at <Tex>h</Tex>”.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet transformations">
        <RealWorld
          items={[
            {
              title: 'Sound',
              body: 'Turning up the volume multiplies a sound wave by $a$; raising the pitch squeezes it horizontally with $b$.',
            },
            {
              title: 'Units',
              body: 'Converting °C to °F, $F = 1.8C + 32$, stretches and shifts the whole temperature graph.',
            },
            {
              title: 'Animation',
              body: 'Easing curves in apps and games are one basic curve, stretched to the right duration and shifted to the right start time.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            '$y = a\\,f(b(x - h)) + k$ moves and reshapes the graph of $f$.',
            '$k$ shifts up or down; $a$ stretches vertically (negative $a$ flips it).',
            '$h$ shifts right (for $x - h$) or left; $b$ squeezes horizontally (negative $b$ mirrors it).',
            'Inside changes act on $x$ and feel backwards; outside changes act on $y$ as expected.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function KnobsExplorer() {
  const [base, setBase] = useState<BaseId>('square')
  const [knobs, setKnobs] = useState<Knobs>(IDENTITY)
  const g = transformed(base, knobs)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Turn the knobs">
      <Prose>
        <p>
          The dashed curve is the original <Tex>f</Tex>; the blue one is the transformed graph. The
          arrow follows one key point. Try each knob on its own first.
        </p>
      </Prose>
      <PredictReveal
        question="Which way does $y = (x - 3)^2$ move compared with $y = x^2$?"
        options={['3 to the right', '3 to the left', '3 up', '3 down']}
        answer={0}
        explanation="Right: the bracket is zero, and the curve at its lowest point, when $x = 3$. Set $h = 3$ below to see it."
      />
      <Figure>
        <div className="border-b border-line p-3 sm:px-4">
          <Segmented
            label="Base function"
            value={base}
            onChange={setBase}
            options={(Object.keys(BASES) as BaseId[]).map((id) => ({
              value: id,
              label: BASES[id].label,
            }))}
          />
        </div>
        <Plot
          view={VIEW}
          aspect="equal"
          ariaLabel={`Graph of ${effects(knobs).join(', ')} version of ${BASES[base].label}`}
        >
          <FunctionGraph fn={BASES[base].f} color={BASE} width={2} dashed />
          <FunctionGraph fn={g} color={MOVED} width={3} />
          {(knobs.h !== 0 || knobs.k !== 0) && (
            <Vector
              from={[0, 0]}
              to={[knobs.h, knobs.k]}
              color="var(--c-violet)"
              width={2}
              dashed
            />
          )}
          <Point at={[knobs.h, knobs.k]} r={5} color="var(--c-violet)" />
        </Plot>
        <div className="grid gap-4 border-t border-line p-3 sm:p-4">
          <KnobSliders knobs={knobs} onKnobs={setKnobs} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="overflow-x-auto text-[1.05rem]">
              <Tex>{equationTex(base, knobs)}</Tex>
            </span>
            <span className="text-sm text-ink-2">{effects(knobs).join(' · ')}</span>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto"
              onClick={() => setKnobs(IDENTITY)}
            >
              Reset knobs
            </Button>
          </div>
        </div>
      </Figure>
      <TryThisList>
        <TryThis
          id="t-right"
          when={knobs.h === 3 && knobs.k === 0 && knobs.a === 1 && knobs.b === 1}
        >
          Move the graph exactly 3 to the right (and nothing else). What does the equation say?
        </TryThis>
        <TryThis id="t-flip" when={knobs.a < 0}>
          Flip the graph upside down.
        </TryThis>
        <TryThis id="t-squeeze" when={Math.abs(knobs.b) >= 2}>
          Make <Tex>b</Tex> 2 or more. Does the graph get wider or narrower?
        </TryThis>
        <TryThis id="t-sqrt" when={base === 'sqrt' && knobs.b < 0}>
          With <Tex>{'\\sqrt x'}</Tex>, make <Tex>b</Tex> negative. Where did the graph go?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const TARGETS: { base: BaseId; knobs: Knobs }[] = [
  { base: 'square', knobs: { a: 2, b: 1, h: 1, k: -3 } },
  { base: 'abs', knobs: { a: -1, b: 1, h: -2, k: 3 } },
  { base: 'sin', knobs: { a: 2, b: 2, h: 0, k: 1 } },
]

const sameKnobs = (p: Knobs, q: Knobs) => p.a === q.a && p.b === q.b && p.h === q.h && p.k === q.k

function MatchExplorer() {
  const [round, setRound] = useState(0)
  const [knobs, setKnobs] = useState<Knobs>(IDENTITY)
  const [matched, setMatched] = useState(0)
  const target = TARGETS[round % TARGETS.length]
  const hit = sameKnobs(knobs, target.knobs)
  return (
    <LabSection id="match" eyebrow="Explore" title="Match the target">
      <Prose>
        <p>
          The orange curve was made from <Tex>{`y = ${BASES[target.base].tex}`}</Tex> with some
          setting of the knobs. Find it. Tip: look at a key point first (the vertex, corner or the
          start of a wave), then the shape.
        </p>
      </Prose>
      <Figure>
        <Plot view={VIEW} aspect="equal" ariaLabel="Your curve and the target curve">
          <FunctionGraph
            fn={transformed(target.base, target.knobs)}
            color="var(--c-orange)"
            width={6}
            opacity={0.45}
          />
          <FunctionGraph
            fn={transformed(target.base, knobs)}
            color={hit ? 'var(--good)' : MOVED}
            width={2.5}
          />
        </Plot>
        <div className="grid gap-4 border-t border-line p-3 sm:p-4">
          <KnobSliders knobs={knobs} onKnobs={setKnobs} />
          <div className="flex flex-wrap items-center gap-3">
            <Tex>{equationTex(target.base, knobs)}</Tex>
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
                setKnobs(IDENTITY)
              }}
            >
              Next target
            </Button>
          </div>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-match-one" when={matched >= 1 || (round === 0 && hit)}>
          Match the first target.
        </TryThis>
        <TryThis id="t-match-all" when={matched >= TARGETS.length}>
          Match all three targets, including the wave.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [knobs, setKnobs] = useState<Knobs>(IDENTITY)
  const target: Knobs = { a: 0.5, b: 1, h: -2, k: 1 }
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <McqChallenge
          id="c-shift"
          index={1}
          prompt="Compared with $y = x^2$, the graph of $y = (x - 3)^2$ is…"
          options={[
            { text: 'moved 3 to the right', correct: true },
            { text: 'moved 3 to the left', why: 'Check where the bracket is zero: at $x = 3$.' },
            { text: 'moved 3 up', why: 'Moving up would be $x^2 + 3$, outside the function.' },
            { text: 'stretched by 3', why: 'Stretching multiplies; here 3 is subtracted inside.' },
          ]}
          explanation="The lowest point is where $x - 3 = 0$, at $x = 3$: the whole graph moved right."
        />
        <McqChallenge
          id="c-flip"
          index={2}
          prompt="How does $y = -|x|$ compare with $y = |x|$?"
          options={[
            { text: 'It is flipped upside down', correct: true },
            {
              text: 'It is mirrored left to right',
              why: '$|x|$ is symmetric, so a left–right mirror would change nothing; the minus is outside.',
            },
            { text: 'It is moved down by 1', why: 'That would be $|x| - 1$.' },
            {
              text: 'It is the same graph',
              why: 'Every output changes sign, so the V points down.',
            },
          ]}
          explanation="The minus sign is outside, multiplying every output by $-1$: the V turns upside down."
        />
        <NumericChallenge
          id="c-vertex"
          index={3}
          prompt="What is the $x$-coordinate of the lowest point of $y = (x + 1)^2 - 4$?"
          answer={-1}
          explanation="The bracket is zero at $x = -1$, so the vertex is $(-1, -4)$: moved 1 left and 4 down."
        />
        <McqChallenge
          id="c-squeeze"
          index={4}
          prompt="How does the graph of $y = f(2x)$ compare with $y = f(x)$?"
          options={[
            { text: 'Squeezed horizontally by a factor of 2', correct: true },
            {
              text: 'Stretched horizontally by a factor of 2',
              why: 'Inside changes feel backwards: $f(2x)$ reaches each value at half the $x$.',
            },
            {
              text: 'Stretched vertically by 2',
              why: 'That would be $2f(x)$, outside the function.',
            },
            { text: 'Moved right by 2', why: 'That would be $f(x - 2)$.' },
          ]}
          explanation="$f(2x)$ at $x = 1$ equals $f(2)$: everything happens twice as early, so the graph squeezes towards the $y$-axis."
        />
        <InteractiveChallenge
          id="c-match"
          index={5}
          prompt="Set the knobs to turn $y = x^2$ into $y = \tfrac12 (x + 2)^2 + 1$."
          solved={sameKnobs(knobs, target)}
          hint="Read it off the equation: $a = \tfrac12$, the bracket $x + 2$ means $h = -2$, and $k = 1$."
          explanation="$a = 0.5$ widens it, $h = -2$ moves it left 2, $k = 1$ lifts it 1: vertex $(-2, 1)$."
          onReset={() => setKnobs(IDENTITY)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <Plot view={VIEW} aspect="equal" ariaLabel="Your transformed parabola and the target">
              <FunctionGraph
                fn={transformed('square', target)}
                color="var(--c-orange)"
                width={6}
                opacity={0.45}
              />
              <FunctionGraph fn={transformed('square', knobs)} color={MOVED} width={2.5} />
            </Plot>
            <div className="grid gap-3 border-t border-line p-3">
              <KnobSliders knobs={knobs} onKnobs={setKnobs} />
              <Tex>{equationTex('square', knobs)}</Tex>
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

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
import { cn } from '@/ui/cn'
import { FunctionGraph, Label, MovablePoint, Plot, Point, constraints } from '@/viz'
import { num, signed } from '../_shared/tex'

const CURVE = 'var(--c-blue)'
const ROOT = 'var(--c-orange)'
const VERTEX = 'var(--c-violet)'
const VIEW = { xMin: -6, xMax: 6, yMin: -6, yMax: 8 }

type Quad = { a: number; h: number; k: number }

function analyse({ a, h, k }: Quad) {
  const b = -2 * a * h
  const c = a * h * h + k
  const disc = b * b - 4 * a * c
  const roots: number[] =
    Math.abs(disc) < 1e-9 ? [h] : disc > 0 ? [h - Math.sqrt(-k / a), h + Math.sqrt(-k / a)] : []
  return { b, c, disc, roots }
}

/** "a x² + b x + c" with tidy signs and coefficients. */
function standardTex(a: number, b: number, c: number): string {
  const lead = a === 1 ? 'x^2' : a === -1 ? '-x^2' : `${num(a)}x^2`
  const mid = b === 0 ? '' : ` ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : num(Math.abs(b))}x`
  const end = c === 0 ? '' : ` ${signed(c)}`
  return `y = ${lead}${mid}${end}`
}

const shift = (v: number, name: string) =>
  v === 0 ? name : `(${name} ${v < 0 ? '+' : '-'} ${num(Math.abs(v))})`

function vertexTex({ a, h, k }: Quad): string {
  const lead = a === 1 ? '' : a === -1 ? '-' : num(a)
  const sq = h === 0 ? 'x^2' : `${shift(h, 'x')}^2`
  return `y = ${lead}${sq}${k === 0 ? '' : ` ${signed(k)}`}`
}

function factoredTex(a: number, roots: number[]): string {
  const lead = a === 1 ? '' : a === -1 ? '-' : num(a)
  if (roots.length === 0) return '\\text{no real roots: it doesn’t factor over the reals}'
  if (roots.length === 1) return `y = ${lead}${shift(roots[0], 'x')}^2`
  return `y = ${lead}${shift(roots[0], 'x')}${shift(roots[1], 'x')}`
}

function QuadPlot({ q, onVertex }: { q: Quad; onVertex: (h: number, k: number) => void }) {
  const { roots, c } = analyse(q)
  const f = (x: number) => q.a * (x - q.h) ** 2 + q.k
  return (
    <Plot
      view={VIEW}
      height={360}
      ariaLabel={`Parabola ${vertexTex(q)} with ${roots.length} real roots`}
    >
      <FunctionGraph fn={f} color={CURVE} width={2.75} />
      {roots.map((r) => (
        <g key={r}>
          <Point at={[r, 0]} r={6} color={ROOT} hollow />
          <Label
            at={[r, 0]}
            anchor="top"
            offset={[0, 8]}
            color={ROOT}
            className="text-xs font-semibold"
          >
            {num(r)}
          </Label>
        </g>
      ))}
      {Math.abs(c) <= 8 && <Point at={[0, c]} r={4} color="var(--ink-2)" />}
      <Label
        at={[q.h, q.k]}
        anchor={q.a > 0 ? 'top' : 'bottom'}
        offset={[0, q.a > 0 ? 12 : -12]}
        color={VERTEX}
        className="text-xs font-semibold"
      >
        vertex ({num(q.h)}, {num(q.k)})
      </Label>
      <MovablePoint
        x={q.h}
        y={q.k}
        onMove={(h, k) => onVertex(h, k)}
        constrain={constraints.compose(
          constraints.snapToGrid(0.5),
          constraints.within(-5, 5, -5.5, 7.5),
        )}
        step={0.5}
        color={VERTEX}
        label="Vertex of the parabola"
      />
    </Plot>
  )
}

function Forms({ q }: { q: Quad }) {
  const { b, c, disc, roots } = analyse(q)
  const tone = Math.abs(disc) < 1e-9 ? 'one' : disc > 0 ? 'two' : 'none'
  return (
    <div className="grid gap-3">
      <dl className="grid gap-2 text-[0.95rem] sm:grid-cols-3">
        {[
          ['Vertex form', vertexTex(q)],
          ['Standard form', standardTex(q.a, b, c)],
          ['Factored form', factoredTex(q.a, roots)],
        ].map(([label, tex]) => (
          <div key={label} className="min-w-0 rounded-xl border border-line bg-surface px-3 py-2">
            <dt className="text-xs font-medium text-ink-2">{label}</dt>
            <dd className="overflow-x-auto">
              <Tex>{tex}</Tex>
            </dd>
          </div>
        ))}
      </dl>
      <div
        className={cn(
          'flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border px-3 py-2 text-sm',
          tone === 'two' && 'border-[color-mix(in_oklab,var(--c-blue)_45%,transparent)]',
          tone === 'one' && 'border-[color-mix(in_oklab,var(--good)_55%,transparent)]',
          tone === 'none' && 'border-[color-mix(in_oklab,var(--c-orange)_55%,transparent)]',
        )}
      >
        <span className="font-medium">Discriminant</span>
        <Tex>{`b^2 - 4ac = ${num(disc)}`}</Tex>
        <span className="text-ink-2">
          {tone === 'two'
            ? 'positive: crosses the x-axis twice (two roots)'
            : tone === 'one'
              ? 'zero: just touches the x-axis (one root)'
              : 'negative: never reaches the x-axis (no real roots)'}
        </span>
      </div>
    </div>
  )
}

export default function QuadraticsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="The shape of a thrown ball">
        <Prose>
          <p>
            Throw a ball and its path is a <strong>parabola</strong>. So is the arc of a fountain
            and the cross-section of a satellite dish. They're all graphs of{' '}
            <strong>quadratics</strong>: expressions with an <Tex>x^2</Tex> in them.
          </p>
          <p>
            One parabola can be written three ways. Each form makes one feature obvious: the{' '}
            <em>vertex form</em> shows the turning point, the <em>standard form</em> shows where it
            crosses the <Tex>y</Tex>-axis, and the <em>factored form</em> shows where it hits zero
            (the roots).
          </p>
        </Prose>
      </LabSection>
      <FormsExplorer />
      <SquareExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Roots and the quadratic formula">
        <Formula
          tex={
            'ax^2 + bx + c = 0 \\quad\\Longrightarrow\\quad x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'
          }
          caption="Completing the square on $ax^2 + bx + c$, done once and for all."
        />
        <Prose>
          <p>
            The part under the square root, <Tex>b^2 - 4ac</Tex>, is the{' '}
            <strong>discriminant</strong>: positive gives two roots, zero gives one (the vertex sits
            on the axis), negative gives none, because you can't take the square root of a negative
            number (not with real numbers, anyway).
          </p>
          <p>
            The vertex sits halfway between the roots, at <Tex>{'x = -\\tfrac{b}{2a}'}</Tex>. The
            sign of <Tex>a</Tex> decides the direction: <Tex>a &gt; 0</Tex> opens up (a minimum),{' '}
            <Tex>a &lt; 0</Tex> opens down (a maximum).
          </p>
        </Prose>
        <Callout kind="misconception" title="Watch the signs in vertex form">
          <p>
            In <Tex>{'y = (x - 3)^2 + 1'}</Tex> the vertex is at <Tex>x = 3</Tex>, not <Tex>-3</Tex>
            : the bracket is zero when <Tex>x = 3</Tex>.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet quadratics">
        <RealWorld
          items={[
            {
              title: 'Projectiles',
              body: 'A ball’s height is $h = -4.9t^2 + vt + h_0$. The roots say when it lands; the vertex says how high it goes.',
            },
            {
              title: 'Profit',
              body: 'Raise a price and you sell fewer items: revenue = price × sales is often a downward parabola with a best price at the vertex.',
            },
            {
              title: 'Dishes and headlights',
              body: 'A parabolic mirror sends every incoming ray to a single focus, which is why satellite dishes and car headlights use that shape.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Vertex form $a(x - h)^2 + k$ shows the turning point $(h, k)$.',
            'Standard form $ax^2 + bx + c$ shows the $y$-intercept $c$.',
            'Factored form $a(x - r_1)(x - r_2)$ shows the roots.',
            'The discriminant $b^2 - 4ac$ counts the real roots: 2, 1 or 0.',
            '$x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ solves any quadratic equation.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function FormsExplorer() {
  const [q, setQ] = useState<Quad>({ a: 1, h: 1, k: -4 })
  const { disc } = analyse(q)
  return (
    <LabSection id="explore" eyebrow="Explore" title="One parabola, three forms">
      <Prose>
        <p>
          Drag the purple vertex and change <Tex>a</Tex>. All three forms update together; the
          orange rings are the roots, where the parabola crosses the <Tex>x</Tex>-axis.
        </p>
      </Prose>
      <PredictReveal
        question="A parabola opens upwards and its vertex is above the x-axis. How many times does it cross the x-axis?"
        options={['Never', 'Once', 'Twice', 'It depends on how wide it is']}
        answer={0}
        explanation="Never: the vertex is its lowest point, and that's already above the axis. Its discriminant is negative."
      />
      <Figure>
        <QuadPlot q={q} onVertex={(h, k) => setQ((p) => ({ ...p, h, k }))} />
        <div className="grid gap-4 border-t border-line p-3 sm:p-4">
          <Slider
            label={<Tex>a</Tex>}
            name="Coefficient a"
            value={q.a}
            min={-3}
            max={3}
            step={0.25}
            onChange={(a) => setQ((p) => ({ ...p, a: a === 0 ? (p.a > 0 ? -0.25 : 0.25) : a }))}
            color={CURVE}
          />
          <Forms q={q} />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-touch" when={Math.abs(disc) < 1e-9}>
          Make the parabola just touch the <Tex>x</Tex>-axis. What's special about its factored
          form?
        </TryThis>
        <TryThis id="t-none" when={disc < -1e-9}>
          Lift it clear of the axis so there are no real roots. What sign does the discriminant
          have?
        </TryThis>
        <TryThis id="t-down" when={q.a < 0}>
          Make it open downwards. Is the vertex now a lowest or a highest point?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

/** x² + bx drawn as areas; half the strip swings below to leave a missing corner. */
function SquareModel({ b, split, filled }: { b: number; split: boolean; filled: boolean }) {
  const X = 150
  const u = 15
  const w = (b / 2) * u
  const o = 30
  const ease = 'transform 700ms cubic-bezier(0.3, 0.9, 0.3, 1)'
  const text = (x: number, y: number, s: string, size = 15) => (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={size}
      fontStyle="italic"
      fill="var(--ink)"
    >
      {s}
    </text>
  )
  return (
    <svg
      viewBox={`0 0 ${o + X + 2 * w + 40 + 60} ${o + X + w + 40}`}
      className="mx-auto block h-auto w-full max-w-md"
      role="img"
      aria-label={`x squared plus ${b} x as areas${split ? `, rearranged with a missing corner of ${(b / 2) ** 2}` : ''}`}
    >
      <rect
        x={o}
        y={o}
        width={X}
        height={X}
        fill="var(--c-blue)"
        fillOpacity={0.25}
        stroke="var(--c-blue)"
        strokeWidth={2}
      />
      {text(o + X / 2, o + X / 2, 'x²', 20)}
      <rect
        x={o + X}
        y={o}
        width={w}
        height={X}
        fill="var(--c-orange)"
        fillOpacity={0.3}
        stroke="var(--c-orange)"
        strokeWidth={2}
      />
      <g
        style={{
          transform: split ? `translate(${-w}px, ${X}px) rotate(90deg)` : 'none',
          transformOrigin: `${o + X + w}px ${o}px`,
          transition: ease,
        }}
      >
        <rect
          x={o + X + w}
          y={o}
          width={w}
          height={X}
          fill="var(--c-orange)"
          fillOpacity={0.3}
          stroke="var(--c-orange)"
          strokeWidth={2}
        />
      </g>
      {split && (
        <rect
          x={o + X}
          y={o + X}
          width={w}
          height={w}
          fill={filled ? 'var(--c-green)' : 'none'}
          fillOpacity={0.35}
          stroke="var(--c-green)"
          strokeWidth={2}
          strokeDasharray={filled ? undefined : '6 5'}
          style={{ transition: 'fill 300ms ease' }}
        />
      )}
      {text(o + X / 2, o - 14, 'x', 14)}
      {text(o - 14, o + X / 2, 'x', 14)}
      {!split && text(o + X + w, o - 14, `${b}`, 14)}
      {split && text(o + X + w / 2, o - 14, `${b / 2}`, 14)}
      {split && text(o - 14, o + X + w / 2, `${b / 2}`, 14)}
      {split && filled && text(o + X + w / 2, o + X + w / 2, `${(b / 2) ** 2}`, 13)}
    </svg>
  )
}

function SquareExplorer() {
  const [b, setB] = useState(6)
  const [split, setSplit] = useState(false)
  const [filled, setFilled] = useState(false)
  const half = b / 2
  return (
    <LabSection id="complete" eyebrow="Explore" title="Completing the square, with real squares">
      <Prose>
        <p>
          Here is <Tex>{`x^2 + ${b}x`}</Tex> as an area: an <Tex>x</Tex> by <Tex>x</Tex> square and
          a <Tex>{`${b}`}</Tex> by <Tex>x</Tex> strip. Split the strip in half and swing one half
          underneath. You almost have a bigger square; one small corner is missing.
        </p>
      </Prose>
      <Figure>
        <div className="p-3 sm:p-4">
          <SquareModel b={b} split={split} filled={filled} />
        </div>
        <div className="grid gap-4 border-t border-line p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              label="Arrangement"
              value={split ? 'split' : 'strip'}
              onChange={(v) => {
                setSplit(v === 'split')
                if (v === 'strip') setFilled(false)
              }}
              options={[
                { value: 'strip', label: 'One strip' },
                { value: 'split', label: 'Split the strip' },
              ]}
            />
            <Button
              size="sm"
              variant="soft"
              disabled={!split || filled}
              onClick={() => setFilled(true)}
            >
              Fill the missing corner
            </Button>
          </div>
          <Slider
            label={<Tex>b</Tex>}
            name="Coefficient b"
            value={b}
            min={2}
            max={10}
            step={2}
            onChange={(v) => {
              setB(v)
              setFilled(false)
            }}
          />
          <div className="overflow-x-auto text-[0.95rem]">
            <Tex
              display
            >{`x^2 + ${b}x + \\underbrace{${half}^2}_{\\text{corner}} = (x + ${half})^2`}</Tex>
          </div>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-split" when={split}>
          Split the strip and swing half of it below the square.
        </TryThis>
        <TryThis id="t-fill" when={filled}>
          Fill the missing corner. How big is it compared with <Tex>b</Tex>?
        </TryThis>
        <TryThis id="t-ten" when={filled && b === 10}>
          Complete the square for <Tex>x^2 + 10x</Tex>. Which number completes it?
        </TryThis>
      </TryThisList>
      <Prose className="mt-4">
        <p>
          So <Tex>{'x^2 + bx = (x + \\tfrac b2)^2 - (\\tfrac b2)^2'}</Tex>. That turns any quadratic
          into vertex form, and doing it to <Tex>ax^2 + bx + c = 0</Tex> in general gives the
          quadratic formula.
        </p>
      </Prose>
    </LabSection>
  )
}

function Practice() {
  const [q, setQ] = useState<Quad>({ a: 1, h: -1, k: 2 })
  const { roots } = analyse(q)
  const solved =
    q.a === 1 &&
    roots.length === 2 &&
    Math.abs(roots[0] - 1) < 1e-9 &&
    Math.abs(roots[1] - 5) < 1e-9
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-roots"
          index={1}
          prompt="Solve $x^2 - 5x + 6 = 0$. Give the **larger** root."
          answer={3}
          hint="Find two numbers that multiply to 6 and add to 5."
          explanation="$x^2 - 5x + 6 = (x - 2)(x - 3)$, so the roots are 2 and 3."
        />
        <NumericChallenge
          id="c-vertex"
          index={2}
          prompt="What is the $x$-coordinate of the vertex of $y = x^2 - 6x + 1$?"
          answer={3}
          hint="The vertex is at $x = -\frac{b}{2a}$."
          explanation="$x = -\frac{-6}{2 \cdot 1} = 3$. (Completing the square: $y = (x - 3)^2 - 8$.)"
        />
        <NumericChallenge
          id="c-disc"
          index={3}
          prompt="What is the discriminant of $x^2 + 4x + 5$?"
          answer={-4}
          explanation="$b^2 - 4ac = 16 - 20 = -4$: negative, so no real roots."
        />
        <McqChallenge
          id="c-negative"
          index={4}
          prompt="A quadratic has a negative discriminant. What does its graph do?"
          options={[
            { text: 'It never crosses the x-axis', correct: true },
            { text: 'It crosses the x-axis twice', why: 'That needs a positive discriminant.' },
            { text: 'It touches the x-axis once', why: 'That needs a discriminant of exactly 0.' },
            {
              text: 'It opens downwards',
              why: 'Direction depends on the sign of $a$, not the discriminant.',
            },
          ]}
          explanation="The square root of a negative number isn't real, so there are no real roots: the parabola misses the axis."
        />
        <InteractiveChallenge
          id="c-build"
          index={5}
          prompt="Keep $a = 1$ and drag the vertex so the parabola's roots are exactly $x = 1$ and $x = 5$."
          solved={solved}
          hint="The vertex is halfway between the roots. How far down must it go so $(x - 3)^2$ cancels it at $x = 1$?"
          explanation="Vertex $(3, -4)$: $y = (x - 3)^2 - 4 = (x - 1)(x - 5)$."
          onReset={() => setQ({ a: 1, h: -1, k: 2 })}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <QuadPlot q={q} onVertex={(h, k) => setQ((p) => ({ ...p, h, k }))} />
            <div className="border-t border-line p-3">
              <Forms q={q} />
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

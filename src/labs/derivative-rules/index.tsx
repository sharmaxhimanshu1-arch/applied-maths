import { Eye } from 'lucide-react'
import { useState } from 'react'
import { derivative } from '@/math/calculus'
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
  ExpressionChallenge,
  InteractiveChallenge,
  McqChallenge,
  NumericChallenge,
} from '@/learn/challenges'
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { FunctionGraph, InfiniteLine, Label, MovablePoint, Plot, Polygon, constraints } from '@/viz'
import { num } from '../_shared/tex'

const CURVE = 'var(--c-blue)'
const TANGENT = 'var(--c-magenta)'
const U_COL = 'var(--c-orange)'
const V_COL = 'var(--c-green)'
const CORNER = 'var(--c-violet)'

type Power = '1' | '2' | '3' | '4' | '5'
const POWERS: Power[] = ['1', '2', '3', '4', '5']
const SAMPLE_X = [1, 2, 3]

/** Y-window that fits x^n on the plotted x-range. */
const powerView = (n: number) => {
  const top = n === 1 ? 2.5 : Math.min(2.2 ** n, 30)
  return { xMin: -2.2, xMax: 2.2, yMin: n % 2 === 0 ? -0.15 * top : -top, yMax: top }
}

export default function DerivativeRulesLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Shortcuts instead of limits">
        <Prose>
          <p>
            Every derivative can be worked out from the limit of a slope, but doing that each time
            is slow. Luckily a handful of patterns cover almost everything. Spot them once and you
            can differentiate most formulas in your head.
          </p>
          <p>
            The star is the <strong>power rule</strong>: bring the power down in front, then knock
            it down by one. You're about to discover it from measurements, and then see why the{' '}
            <strong>product rule</strong> has the shape it does.
          </p>
        </Prose>
      </LabSection>
      <PowerExplorer />
      <ProductExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The rules">
        <Formula
          tex={
            "\\frac{d}{dx} x^n = n x^{n-1} \\qquad \\frac{d}{dx}\\big(c f\\big) = c f' \\qquad \\frac{d}{dx}\\big(f + g\\big) = f' + g'"
          }
          caption="Power rule (for any real $n$), constant multiples, and sums: differentiate term by term."
        />
        <Formula
          tex={
            "\\big(uv\\big)' = u'v + uv' \\qquad \\Big(\\frac{u}{v}\\Big)' = \\frac{u'v - uv'}{v^2}"
          }
          caption="Product and quotient rules."
        />
        <Formula
          tex={
            '\\frac{d}{dx} e^x = e^x \\qquad \\frac{d}{dx} \\ln x = \\frac1x \\qquad \\frac{d}{dx} \\sin x = \\cos x \\qquad \\frac{d}{dx} \\cos x = -\\sin x'
          }
          caption="Four derivatives worth knowing by heart. For compositions like $\sin(x^2)$, add the chain rule."
        />
        <Prose>
          <p>
            With these, a polynomial is easy:{' '}
            <Tex>{'\\frac{d}{dx}(4x^3 - 5x + 2) = 12x^2 - 5'}</Tex>. The constant 2 disappears
            because a flat line has slope 0.
          </p>
        </Prose>
        <Callout
          kind="misconception"
          title="The derivative of a product is not the product of derivatives"
        >
          <p>
            <Tex>{"(uv)' \\ne u'v'"}</Tex>. Try <Tex>{'u = v = x'}</Tex>: then{' '}
            <Tex>{'uv = x^2'}</Tex> has derivative <Tex>2x</Tex>, but <Tex>{"u'v' = 1"}</Tex>. The
            rectangle above shows where both strips come from.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Rules at work">
        <RealWorld
          items={[
            {
              title: 'Physics formulas',
              body: 'Position $s = \\tfrac12 g t^2$ gives speed $gt$ and acceleration $g$ by the power rule, twice.',
            },
            {
              title: 'Revenue',
              body: 'Revenue is price × quantity. When both change, the product rule says how revenue changes.',
            },
            {
              title: 'Computer algebra',
              body: 'Symbolic differentiation in software is just these rules applied recursively to the pieces of a formula.',
            },
            {
              title: 'Area growth',
              body: 'A square of side $x$ has area $x^2$; its growth rate $2x$ is the two edges that get pushed outwards.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Power rule: $\\frac{d}{dx}x^n = nx^{n-1}$. Bring the power down, then lower it by one.',
            'Constants factor out, sums split up, constants on their own vanish.',
            "Product rule: $(uv)' = u'v + uv'$, two strips added to a growing rectangle.",
            'Know $e^x$, $\\ln x$, $\\sin x$ and $\\cos x$; combine with the chain rule for compositions.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function PowerExplorer() {
  const [power, setPower] = useState<Power>('2')
  const [x, setX] = useState(1)
  const [revealed, setRevealed] = useState(false)
  const [visited, setVisited] = useState<string[]>([])
  const n = Number(power)
  const f = (t: number) => t ** n
  const slope = derivative(f, x)
  const rows = SAMPLE_X.map((sx) => {
    const s = derivative(f, sx)
    const base = sx ** (n - 1)
    return { sx, s, base, ratio: s / base }
  })
  const move = (px: number) => {
    setX(px)
    const key = `${n}@${px.toFixed(2)}`
    setVisited((v) => (v.includes(key) ? v : [...v, key]))
  }
  return (
    <LabSection id="explore" eyebrow="Explore" title="Find the power rule">
      <Prose>
        <p>
          Pick a power <Tex>n</Tex> and slide the point along <Tex>{'y = x^n'}</Tex>. The table
          measures the slope at <Tex>x = 1, 2, 3</Tex> and divides it by <Tex>{'x^{n-1}'}</Tex>.
          Look at the last column as you change <Tex>n</Tex>.
        </p>
      </Prose>
      <PredictReveal
        question="The slope of $x^2$ at any point is $2x$. What would you guess for the slope of $x^3$?"
        options={['$3x$', '$3x^2$', '$x^2$', '$2x^3$']}
        answer={1}
        explanation="$3x^2$. The pattern is: bring the power down in front ($3$), then lower the power by one ($x^2$)."
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Power n"
            value={power}
            onChange={(p) => {
              setPower(p)
              setRevealed(false)
            }}
            options={POWERS.map((p) => ({
              value: p,
              label: <Tex>{p === '1' ? 'x' : `x^${p}`}</Tex>,
              ariaLabel: `x to the power ${p}`,
            }))}
          />
          <Button
            size="sm"
            variant="secondary"
            className="ml-auto"
            icon={<Eye className="size-4" />}
            onClick={() => setRevealed(true)}
            disabled={revealed}
          >
            Reveal the rule
          </Button>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Plot
            view={powerView(n)}
            height={280}
            ariaLabel={`y = x to the ${n} with a tangent of slope ${num(slope)} at x = ${num(x)}`}
          >
            <FunctionGraph fn={f} color={CURVE} />
            <InfiniteLine through={[x, f(x)]} direction={[1, slope]} color={TANGENT} width={2} />
            <MovablePoint
              x={x}
              y={f(x)}
              onMove={move}
              constrain={constraints.compose(
                constraints.snapToGrid(0.05),
                constraints.onGraph(f, -2, 2),
              )}
              color={CURVE}
              label="Point on the curve"
            />
          </Plot>
          <div className="border-t border-line p-3 md:border-t-0 md:border-l sm:p-4">
            <table className="w-full text-sm tabular-nums">
              <caption className="mb-2 text-left text-ink-2">
                Measured slopes of <Tex>{n === 1 ? 'x' : `x^${n}`}</Tex>
              </caption>
              <thead>
                <tr className="text-left text-ink-2">
                  <th className="py-1 pr-2 font-medium">x</th>
                  <th className="py-1 pr-2 font-medium">slope</th>
                  <th className="py-1 font-medium">
                    slope ÷ <Tex>{'x^{n-1}'}</Tex>
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {rows.map((r) => (
                  <tr key={r.sx} className="border-t border-line">
                    <td className="py-1 pr-2">{r.sx}</td>
                    <td className="py-1 pr-2">{formatNumber(r.s, 3)}</td>
                    <td className="py-1">{formatNumber(r.ratio, 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-sm" role="status">
              {revealed ? (
                <>
                  Rule:{' '}
                  <Tex>{`\\tfrac{d}{dx}x^{${n}} = ${n === 1 ? '1' : n === 2 ? '2x' : `${n}x^{${n - 1}}`}`}</Tex>
                </>
              ) : (
                <span className="text-ink-2">What number is the last column?</span>
              )}
            </p>
          </div>
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'x', value: formatNumber(x, 2) },
              { label: 'slope here', value: formatNumber(slope, 3), color: TANGENT },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-twelve" when={visited.includes('3@2.00')}>
          On <Tex>{'x^3'}</Tex>, put the point at <Tex>x = 2</Tex>. Does the slope match{' '}
          <Tex>{'3 \\cdot 2^2 = 12'}</Tex>?
        </TryThis>
        <TryThis id="t-line" when={n === 1 && visited.some((v) => v.startsWith('1@'))}>
          Choose <Tex>n = 1</Tex> and move the point. Why does the slope never change?
        </TryThis>
        <TryThis id="t-reveal" when={revealed && n >= 4}>
          With <Tex>n = 4</Tex> or 5, predict the rule from the table, then reveal it.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

/** u(x) = x and v(x) = x²/2: the sides of a rectangle that grows as x grows. */
const u = (x: number) => x
const v = (x: number) => (x * x) / 2

const rect = (x0: number, y0: number, w: number, h: number): Vec2[] => [
  [x0, y0],
  [x0 + w, y0],
  [x0 + w, y0 + h],
  [x0, y0 + h],
]

function ProductExplorer() {
  const [x, setX] = useState(2)
  const [dx, setDx] = useState(0.6)
  const U = u(x)
  const V = v(x)
  const dU = u(x + dx) - U
  const dV = v(x + dx) - V
  const total = u(x + dx) * v(x + dx) - U * V
  const corner = dU * dV
  const cornerShare = total ? corner / total : 0
  return (
    <LabSection id="product" eyebrow="Explore" title="The product rule as a growing rectangle">
      <Prose>
        <p>
          A rectangle has width <Tex>u = x</Tex> and height <Tex>{'v = \\tfrac12 x^2'}</Tex>, so its
          area is the product <Tex>uv</Tex>. Nudge <Tex>x</Tex> by <Tex>{'\\Delta x'}</Tex>. The
          area grows by an orange strip on the side, a green strip on top and a small purple corner.
          Shrink the nudge and watch the corner vanish.
        </p>
      </Prose>
      <Figure>
        <div className="mx-auto w-full max-w-xl">
          <Plot
            view={{ xMin: -0.4, xMax: 4.2, yMin: -0.4, yMax: 6.6 }}
            aspect="equal"
            ariaLabel={`Rectangle ${num(U)} by ${num(V)} growing by ${num(total, 3)}`}
          >
            <Polygon
              points={rect(0, 0, U, V)}
              fill={CURVE}
              fillOpacity={0.18}
              stroke={CURVE}
              strokeWidth={2}
            />
            <Polygon
              points={rect(U, 0, dU, V)}
              fill={U_COL}
              fillOpacity={0.35}
              stroke={U_COL}
              strokeWidth={1.5}
            />
            <Polygon
              points={rect(0, V, U, dV)}
              fill={V_COL}
              fillOpacity={0.35}
              stroke={V_COL}
              strokeWidth={1.5}
            />
            <Polygon
              points={rect(U, V, dU, dV)}
              fill={CORNER}
              fillOpacity={0.45}
              stroke={CORNER}
              strokeWidth={1.5}
            />
            <Label at={[U / 2, V / 2]} anchor="center" className="text-xs">
              <Tex>uv</Tex>
            </Label>
            <Label
              at={[U + dU, V / 2]}
              anchor="left"
              offset={[6, 0]}
              color={U_COL}
              className="text-xs"
            >
              <Tex>{'v\\,\\Delta u'}</Tex>
            </Label>
            <Label
              at={[U / 2, V + dV]}
              anchor="bottom"
              offset={[0, -4]}
              color={V_COL}
              className="text-xs"
            >
              <Tex>{'u\\,\\Delta v'}</Tex>
            </Label>
          </Plot>
        </div>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider label="x" value={x} min={0.5} max={3} step={0.1} onChange={setX} color={CURVE} />
          <Slider
            label={<Tex>{'\\Delta x'}</Tex>}
            name="Nudge delta x"
            value={dx}
            min={0.02}
            max={1}
            step={0.02}
            onChange={setDx}
            color={CORNER}
          />
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'side strip v·Δu', value: formatNumber(V * dU, 3), color: U_COL },
              { label: 'top strip u·Δv', value: formatNumber(U * dV, 3), color: V_COL },
              { label: 'corner Δu·Δv', value: formatNumber(corner, 4), color: CORNER },
              { label: 'corner share', value: `${formatNumber(cornerShare * 100, 1)}%` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-tiny" when={dx <= 0.05}>
          Shrink <Tex>{'\\Delta x'}</Tex> to 0.04 or less. What share of the growth is the purple
          corner now?
        </TryThis>
        <TryThis id="t-ratio" when={dx <= 0.1 && x >= 2.5}>
          Take a big <Tex>x</Tex> and a small nudge, then compare the strips: the top one is about
          twice the side one. Can you see why from <Tex>{"u' = 1"}</Tex> and <Tex>{"v' = x"}</Tex>?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [power, setPower] = useState<Power>('1')
  const n = Number(power)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <ExpressionChallenge
          id="c-power"
          index={1}
          prompt="Differentiate $x^7$."
          answer="7x^6"
          explanation="Power down, then lower it by one: $7x^6$."
        />
        <ExpressionChallenge
          id="c-poly"
          index={2}
          prompt="Differentiate $4x^3 - 5x + 2$."
          answer="12x^2 - 5"
          hint="Term by term. The constant has slope 0."
          explanation="$12x^2 - 5$. The $2$ disappears."
        />
        <McqChallenge
          id="c-product"
          index={3}
          prompt="What is $(uv)'$?"
          options={[
            { text: "$u'v + uv'$", correct: true },
            { text: "$u'v'$", why: "Try $u = v = x$: that gives 1, but $(x^2)' = 2x$." },
            { text: "$u' + v'$", why: 'That is the sum rule, for $u + v$.' },
            { text: "$u'v - uv'$", why: 'The minus sign belongs to the quotient rule.' },
          ]}
          explanation="The two strips of the growing rectangle: $v\,\Delta u + u\,\Delta v$, with the corner vanishing."
        />
        <NumericChallenge
          id="c-product-eval"
          index={4}
          prompt="$f(x) = x^2(x + 1)$. Find $f'(1)$."
          answer={5}
          hint="Product rule with $u = x^2$, $v = x + 1$; or expand first."
          explanation="$f' = 2x(x + 1) + x^2$. At 1: $2 \cdot 2 + 1 = 5$."
        />
        <InteractiveChallenge
          id="c-which-power"
          index={5}
          prompt="Pick the power $n$ for which the slope of $x^n$ at $x = 2$ is exactly 32."
          solved={n === 4}
          hint="The slope at 2 is $n \cdot 2^{n-1}$."
          explanation="$n = 4$: $4 \cdot 2^3 = 32$."
          onReset={() => setPower('1')}
        >
          <div className="grid gap-3 rounded-xl border border-line p-3">
            <Segmented
              label="Power n"
              value={power}
              onChange={setPower}
              options={POWERS.map((p) => ({ value: p, label: `n = ${p}` }))}
            />
            <p className="text-sm">
              Slope of <Tex>{`x^${n}`}</Tex> at 2:{' '}
              <span className="font-mono">{formatNumber(n * 2 ** (n - 1), 2)}</span>
            </p>
          </div>
        </InteractiveChallenge>
        <ExpressionChallenge
          id="c-exp-product"
          index={6}
          prompt="Differentiate $x^2 e^x$. (Type $e^x$ as exp(x).)"
          answer="2x exp(x) + x^2 exp(x)"
          hint="Product rule with $u = x^2$ and $v = e^x$."
          explanation="$2x e^x + x^2 e^x = x(x + 2)e^x$."
        />
      </ChallengeSet>
    </LabSection>
  )
}

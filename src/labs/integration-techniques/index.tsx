import { useState } from 'react'
import { integrate } from '@/math/calculus'
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
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { AreaUnder, FunctionGraph, Label, Plot, Polygon, Segment } from '@/viz'
import { num } from '../_shared/tex'

const ABOVE = 'var(--c-blue)'
const BELOW = 'var(--c-red)'
const CURVE = 'var(--ink-2)'
const LEFT = 'var(--c-orange)'
const RECT = 'var(--c-magenta)'

const xSide = (x: number) => 2 * x * Math.cos(x * x)
const uSide = Math.cos

/** Signed area shading: blue above the axis, red below. */
function SignedArea({ fn, a, b }: { fn: (x: number) => number; a: number; b: number }) {
  return (
    <>
      <AreaUnder fn={(x) => Math.max(0, fn(x))} a={a} b={b} color={ABOVE} opacity={0.3} />
      <AreaUnder fn={(x) => Math.min(0, fn(x))} a={a} b={b} color={BELOW} opacity={0.3} />
    </>
  )
}

export default function IntegrationTechniquesLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Derivative rules, run backwards">
        <Prose>
          <p>
            Differentiating is mechanical: follow the rules and you're done. Integrating is more
            like detective work. You look at a formula and ask, “whose derivative is this?”
          </p>
          <p>
            The two most useful clues are the derivative rules you already know, read backwards. The
            chain rule backwards is <strong>substitution</strong>: spot a function sitting next to
            its own derivative. The product rule backwards is <strong>integration by parts</strong>:
            trade one integral for an easier one.
          </p>
        </Prose>
      </LabSection>
      <SubstitutionExplorer />
      <PartsExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The two techniques">
        <Formula
          tex={
            "\\int f\\big(g(x)\\big)\\,g'(x)\\,dx = \\int f(u)\\,du \\quad \\text{with } u = g(x)"
          }
          caption="Substitution: rename the inside as $u$. The factor $g'(x)\,dx$ becomes $du$, and the limits move from $x$ to $u$."
        />
        <Prose>
          <p>
            Example: <Tex>{'\\int_0^b 2x\\cos(x^2)\\,dx'}</Tex>. Put <Tex>{'u = x^2'}</Tex>, so{' '}
            <Tex>{'du = 2x\\,dx'}</Tex>, and the integral becomes{' '}
            <Tex>{'\\int_0^{b^2} \\cos u\\,du = \\sin(b^2)'}</Tex>, the two equal areas you saw.
          </p>
        </Prose>
        <Formula
          tex={'\\int u\\,dv = uv - \\int v\\,du'}
          caption="Integration by parts: the product rule $(uv)' = u'v + uv'$, integrated and rearranged."
        />
        <Prose>
          <p>
            Example: <Tex>{'\\int x e^x\\,dx'}</Tex>. Take <Tex>u = x</Tex> (it gets simpler when
            differentiated) and <Tex>{'dv = e^x\\,dx'}</Tex>. Then{' '}
            <Tex>{'\\int x e^x\\,dx = x e^x - \\int e^x\\,dx = (x - 1)e^x + C'}</Tex>.
          </p>
        </Prose>
        <Callout kind="misconception" title="Don't forget to change the limits (or the dx)">
          <p>
            After substituting, everything must be in terms of <Tex>u</Tex>: the <Tex>dx</Tex>{' '}
            becomes <Tex>{"du / g'(x)"}</Tex>, and definite limits become <Tex>g(a)</Tex> and{' '}
            <Tex>g(b)</Tex>. Mixing <Tex>x</Tex> limits with a <Tex>u</Tex> integrand gives the
            wrong area.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where these tricks pay off">
        <RealWorld
          items={[
            {
              title: 'Physics',
              body: 'Work, energy and centre of mass integrals often hide a function next to its derivative, ready for substitution.',
            },
            {
              title: 'Probability',
              body: 'The average of an exponential waiting time, $\\int_0^\\infty x\\,\\lambda e^{-\\lambda x}\\,dx = \\tfrac1\\lambda$, is a classic integration by parts.',
            },
            {
              title: 'Signal processing',
              body: 'Fourier coefficients like $\\int x\\sin(nx)\\,dx$ are computed with integration by parts.',
            },
            {
              title: 'Computer algebra',
              body: 'Symbolic integrators try substitution and parts (and many cleverer tricks) automatically.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Substitution is the chain rule backwards: look for a function and its derivative side by side.',
            'Changing variables changes the limits too: the area is the same, just measured on a new axis.',
            'Integration by parts: $\\int u\\,dv = uv - \\int v\\,du$, the product rule backwards.',
            'Pick $u$ to be the part that gets simpler when you differentiate it.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function SubstitutionExplorer() {
  const [b, setB] = useState(0.8)
  const leftArea = integrate(xSide, 0, b)
  const rightArea = Math.sin(b * b)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Substitution: the same area on a new axis">
      <Prose>
        <p>
          On the left is <Tex>{'2x\\cos(x^2)'}</Tex> from 0 to <Tex>b</Tex>. On the right is plain{' '}
          <Tex>{'\\cos u'}</Tex> from 0 to <Tex>{'b^2'}</Tex>. They look nothing alike, but slide{' '}
          <Tex>b</Tex> and compare the two areas.
        </p>
      </Prose>
      <PredictReveal
        question="As $b$ changes, how will the two shaded (signed) areas compare?"
        options={[
          'The left one is always bigger',
          'They are always equal',
          'They are only equal at $b = 1$',
          'They have nothing to do with each other',
        ]}
        answer={1}
        explanation="Always equal. Setting $u = x^2$ stretches the $x$-axis into the $u$-axis; the factor $2x$ is exactly the stretch, so no area is gained or lost."
      />
      <Figure>
        <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <Plot
              view={{ xMin: -0.2, xMax: 2.4, yMin: -4.6, yMax: 3 }}
              height={260}
              ariaLabel={`Area under 2x cos x squared from 0 to ${num(b)} is ${num(leftArea, 3)}`}
            >
              <SignedArea fn={xSide} a={0} b={b} />
              <FunctionGraph fn={xSide} domain={[0, 2.4]} color={CURVE} />
              <Segment from={[b, -4.6]} to={[b, 3]} color="var(--c-violet)" width={1.5} dashed />
              <Label
                at={[b, 2.8]}
                anchor="top-left"
                offset={[4, 0]}
                color="var(--c-violet)"
                className="text-xs"
              >
                <Tex>b</Tex>
              </Label>
            </Plot>
            <div className="border-t border-line px-3 py-2 text-sm text-ink-2 sm:px-4">
              <Tex>{`\\int_0^{${num(b)}} 2x\\cos(x^2)\\,dx`}</Tex>
            </div>
          </div>
          <div className="border-t border-line md:border-t-0 md:border-l">
            <Plot
              view={{ xMin: -0.3, xMax: 5.9, yMin: -1.6, yMax: 1.6 }}
              height={260}
              ariaLabel={`Area under cos u from 0 to ${num(b * b)} is ${num(rightArea, 3)}`}
            >
              <SignedArea fn={uSide} a={0} b={b * b} />
              <FunctionGraph fn={uSide} domain={[0, 5.9]} color={CURVE} />
              <Segment
                from={[b * b, -1.6]}
                to={[b * b, 1.6]}
                color="var(--c-violet)"
                width={1.5}
                dashed
              />
              <Label
                at={[b * b, 1.5]}
                anchor="top-left"
                offset={[4, 0]}
                color="var(--c-violet)"
                className="text-xs"
              >
                <Tex>{'b^2'}</Tex>
              </Label>
            </Plot>
            <div className="border-t border-line px-3 py-2 text-sm text-ink-2 sm:px-4">
              <Tex>{`\\int_0^{${num(b * b)}} \\cos u\\,du`}</Tex>
            </div>
          </div>
        </div>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label={<Tex>b</Tex>}
            name="Upper limit b"
            value={b}
            min={0}
            max={2.4}
            step={0.01}
            onChange={setB}
            color="var(--c-violet)"
          />
          <Readouts
            items={[
              { label: 'left area', value: formatNumber(leftArea, 4), color: ABOVE },
              { label: 'right area', value: formatNumber(rightArea, 4), color: ABOVE },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-max" when={Math.abs(b - Math.sqrt(Math.PI / 2)) < 0.02}>
          Find the <Tex>b</Tex> that makes the area as big as possible. What is <Tex>{'b^2'}</Tex>{' '}
          there?
        </TryThis>
        <TryThis id="t-zero-lab" when={b > 1.5 && Math.abs(rightArea) < 0.02}>
          Find a <Tex>b</Tex> past 1.5 where the net area is zero. Which <Tex>u</Tex> does it
          correspond to?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type PartsKey = 'square' | 'exp'

const PARTS: Record<
  PartsKey,
  {
    v: (t: number) => number
    below: (T: number) => number
    left: (T: number) => number
    vTex: string
    label: string
    vMax: number
  }
> = {
  square: {
    v: (t) => t * t,
    below: (T) => T ** 3 / 3,
    left: (T) => (2 * T ** 3) / 3,
    vTex: 'v = u^2',
    label: 'v = u^2',
    vMax: 4.4,
  },
  exp: {
    v: (t) => Math.exp(t) - 1,
    below: (T) => Math.exp(T) - 1 - T,
    left: (T) => (T - 1) * Math.exp(T) + 1,
    vTex: 'v = e^u - 1',
    label: 'v = e^u - 1',
    vMax: 6.8,
  },
}

/** The region between the curve and the v-axis, from v = 0 up to v(T). */
function leftRegion(v: (t: number) => number, T: number): Vec2[] {
  const pts: Vec2[] = []
  const n = 60
  for (let i = 0; i <= n; i++) {
    const t = (T * i) / n
    pts.push([t, v(t)])
  }
  pts.push([0, v(T)])
  return pts
}

function PartsExplorer() {
  const [key, setKey] = useState<PartsKey>('square')
  const [T, setT] = useState(1)
  const p = PARTS[key]
  const vT = p.v(T)
  const below = p.below(T)
  const left = p.left(T)
  return (
    <LabSection
      id="parts"
      eyebrow="Explore"
      title="Integration by parts: two areas make a rectangle"
    >
      <Prose>
        <p>
          Plot <Tex>v</Tex> against <Tex>u</Tex>. The blue area under the curve is{' '}
          <Tex>{'\\int v\\,du'}</Tex>; the orange area beside it, against the <Tex>v</Tex>-axis, is{' '}
          <Tex>{'\\int u\\,dv'}</Tex>. Together they fill the rectangle <Tex>{'u \\times v'}</Tex>.
          So if one integral is hard, get it from the other:{' '}
          <Tex>{'\\int u\\,dv = uv - \\int v\\,du'}</Tex>.
        </p>
      </Prose>
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Curve"
            value={key}
            onChange={setKey}
            options={(Object.keys(PARTS) as PartsKey[]).map((k) => ({
              value: k,
              label: <Tex>{PARTS[k].vTex}</Tex>,
              ariaLabel: PARTS[k].label,
            }))}
          />
        </div>
        <div className="mx-auto w-full max-w-xl">
          <Plot
            view={{ xMin: -0.3, xMax: 2.3, yMin: -0.3, yMax: p.vMax }}
            height={300}
            xLabel="u"
            yLabel="v"
            ariaLabel={`Areas ${num(below, 3)} and ${num(left, 3)} fill a ${num(T)} by ${num(vT, 3)} rectangle`}
          >
            <AreaUnder fn={p.v} a={0} b={T} color={ABOVE} opacity={0.3} />
            <Polygon points={leftRegion(p.v, T)} fill={LEFT} fillOpacity={0.3} stroke="none" />
            <Polygon
              points={[
                [0, 0],
                [T, 0],
                [T, vT],
                [0, vT],
              ]}
              fill="none"
              fillOpacity={0}
              stroke={RECT}
              strokeWidth={2}
              dashed
            />
            <FunctionGraph fn={p.v} domain={[0, 2.2]} color={CURVE} />
          </Plot>
        </div>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label="u at the end"
            value={T}
            min={0.2}
            max={2}
            step={0.05}
            onChange={setT}
            color={RECT}
          />
          <Readouts
            items={[
              { label: '∫ v du (blue)', value: formatNumber(below, 3), color: ABOVE },
              { label: '∫ u dv (orange)', value: formatNumber(left, 3), color: LEFT },
              { label: 'sum', value: formatNumber(below + left, 3) },
              { label: 'u × v', value: formatNumber(T * vT, 3), color: RECT },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-twice" when={key === 'square' && T >= 1.5}>
          On <Tex>{'v = u^2'}</Tex>, push the end to 1.5 or beyond. The orange area is always twice
          the blue. Can you see why from the shape?
        </TryThis>
        <TryThis id="t-exp" when={key === 'exp' && T >= 1.5}>
          Switch to <Tex>{'v = e^u - 1'}</Tex> and stretch it out. Do the two areas still add to the
          rectangle?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [b, setB] = useState(1)
  const area = Math.sin(b * b)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <ExpressionChallenge
          id="c-sub-lab"
          index={1}
          prompt="Find an antiderivative of $2x\cos(x^2)$ (leave out the $+ C$)."
          answer="sin(x^2)"
          hint="Let $u = x^2$; then $du = 2x\,dx$."
          explanation="$\int \cos u\,du = \sin u = \sin(x^2)$."
        />
        <NumericChallenge
          id="c-sub-def"
          index={2}
          prompt="Find $\displaystyle\int_0^1 2x e^{x^2}\,dx$. (Decimals are fine.)"
          answer={Math.E - 1}
          tolerance={0.002}
          hint="With $u = x^2$ the limits become 0 and 1."
          explanation="$\int_0^1 e^u\,du = e - 1 \approx 1.718$."
        />
        <McqChallenge
          id="c-which"
          index={3}
          prompt="Which technique fits $\displaystyle\int x e^x\,dx$ best?"
          options={[
            { text: 'Integration by parts with $u = x$', correct: true },
            {
              text: 'Substitution with $u = e^x$',
              why: 'There is no $e^x$ derivative factor to absorb the $x$.',
            },
            { text: 'The power rule', why: 'It is a product, not a power of $x$.' },
            {
              text: 'Integration by parts with $u = e^x$',
              why: 'Then $\\int v\\,du$ has $x^2$ in it: harder, not easier.',
            },
          ]}
          explanation="Differentiating $x$ makes it 1, so $\int x e^x\,dx = xe^x - \int e^x\,dx$."
        />
        <NumericChallenge
          id="c-parts-lab"
          index={4}
          prompt="Find $\displaystyle\int_0^1 x e^x\,dx$."
          answer={1}
          tolerance={0.001}
          explanation="$\big[(x - 1)e^x\big]_0^1 = 0 - (-1) = 1$."
        />
        <InteractiveChallenge
          id="c-zero"
          index={5}
          prompt="Choose $b > 1$ so that $\displaystyle\int_0^b 2x\cos(x^2)\,dx = 0$."
          solved={b > 1 && Math.abs(area) < 0.02}
          hint="The integral equals $\sin(b^2)$. When is that zero again?"
          explanation="$\sin(b^2) = 0$ at $b^2 = \pi$, so $b = \sqrt\pi \approx 1.77$."
          onReset={() => setB(1)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <Plot
              view={{ xMin: -0.2, xMax: 2.4, yMin: -4.6, yMax: 3 }}
              height={220}
              ariaLabel={`Signed area up to ${num(b)} is ${num(area, 3)}`}
            >
              <SignedArea fn={xSide} a={0} b={b} />
              <FunctionGraph fn={xSide} domain={[0, 2.4]} color={CURVE} />
            </Plot>
            <div className="grid gap-2 border-t border-line p-3">
              <Slider
                label={<Tex>b</Tex>}
                name="Upper limit b"
                value={b}
                min={0}
                max={2.4}
                step={0.01}
                onChange={setB}
              />
              <p className="text-sm">
                Net area: <span className="font-mono">{formatNumber(area, 3)}</span>
              </p>
            </div>
          </div>
        </InteractiveChallenge>
        <McqChallenge
          id="c-cos3x"
          index={6}
          prompt="What is $\displaystyle\int \cos(3x)\,dx$?"
          options={[
            { text: '$\\tfrac13\\sin(3x) + C$', correct: true },
            {
              text: '$\\sin(3x) + C$',
              why: 'Differentiate it: you get $3\\cos(3x)$, three times too big.',
            },
            { text: '$3\\sin(3x) + C$', why: 'That differentiates to $9\\cos(3x)$.' },
            { text: '$-\\tfrac13\\sin(3x) + C$', why: 'The antiderivative of cos is $+\\sin$.' },
          ]}
          explanation="With $u = 3x$, $dx = \tfrac13\,du$, so the answer is $\tfrac13\sin(3x) + C$."
        />
      </ChallengeSet>
    </LabSection>
  )
}

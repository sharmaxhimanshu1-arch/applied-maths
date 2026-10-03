import { useState } from 'react'
import { clamp, formatNumber, snap } from '@/math/core'
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
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import {
  FunctionGraph,
  Label,
  MovablePoint,
  Plot,
  Point,
  Polygon,
  Segment,
  constraints,
} from '@/viz'
import { num } from '../_shared/tex'

const CURVE = 'var(--c-blue)'
const POLY = 'var(--c-orange)'
const FIT = 'var(--c-green)'
const CENTRE = 'var(--c-violet)'
const PROBE = 'var(--c-magenta)'

type SeriesKey = 'sin' | 'cos' | 'exp' | 'ln' | 'geo'

type Series = {
  f: (x: number) => number
  /** k-th derivative at a. */
  deriv: (k: number, a: number) => number
  /** Radius of convergence around a (Infinity for entire functions). */
  radius: (a: number) => number
  /** Allowed range for the centre. */
  aRange: [number, number]
  view: { xMin: number; xMax: number; yMin: number; yMax: number }
  tex: string
  aria: string
}

function factorial(k: number) {
  let out = 1
  for (let i = 2; i <= k; i++) out *= i
  return out
}

const SERIES: Record<SeriesKey, Series> = {
  sin: {
    f: Math.sin,
    deriv: (k, a) => Math.sin(a + (k * Math.PI) / 2),
    radius: () => Infinity,
    aRange: [-4, 4],
    view: { xMin: -8, xMax: 8, yMin: -2.5, yMax: 2.5 },
    tex: '\\sin x',
    aria: 'sine',
  },
  cos: {
    f: Math.cos,
    deriv: (k, a) => Math.cos(a + (k * Math.PI) / 2),
    radius: () => Infinity,
    aRange: [-4, 4],
    view: { xMin: -8, xMax: 8, yMin: -2.5, yMax: 2.5 },
    tex: '\\cos x',
    aria: 'cosine',
  },
  exp: {
    f: Math.exp,
    deriv: (_k, a) => Math.exp(a),
    radius: () => Infinity,
    aRange: [-2, 2],
    view: { xMin: -5, xMax: 3.5, yMin: -2, yMax: 10 },
    tex: 'e^x',
    aria: 'e to the x',
  },
  ln: {
    f: (x) => (x > -1 ? Math.log(1 + x) : NaN),
    deriv: (k, a) =>
      k === 0 ? Math.log(1 + a) : ((k % 2 === 1 ? 1 : -1) * factorial(k - 1)) / (1 + a) ** k,
    radius: (a) => 1 + a,
    aRange: [-0.5, 2],
    view: { xMin: -1.6, xMax: 4.5, yMin: -3, yMax: 2.5 },
    tex: '\\ln(1 + x)',
    aria: 'natural log of 1 plus x',
  },
  geo: {
    f: (x) => 1 / (1 - x),
    deriv: (k, a) => factorial(k) / (1 - a) ** (k + 1),
    radius: (a) => 1 - a,
    aRange: [-1.5, 0.5],
    view: { xMin: -3.5, xMax: 2.5, yMin: -3, yMax: 6 },
    tex: '\\tfrac{1}{1 - x}',
    aria: '1 over 1 minus x',
  },
}

/** Taylor coefficients c_k = f^(k)(a) / k! for k = 0..n. */
function coefficients(s: Series, a: number, n: number) {
  return Array.from({ length: n + 1 }, (_, k) => s.deriv(k, a) / factorial(k))
}

function evalPoly(cs: readonly number[], a: number, x: number) {
  let sum = 0
  let p = 1
  for (const c of cs) {
    sum += c * p
    p *= x - a
  }
  return sum
}

const TOL = 0.1

/** The interval around a where |f − P| stays under TOL (scanning outwards in small steps). */
function goodFit(s: Series, cs: readonly number[], a: number): [number, number] {
  const step = 0.02
  const ok = (x: number) => {
    const fx = s.f(x)
    return Number.isFinite(fx) && Math.abs(fx - evalPoly(cs, a, x)) < TOL
  }
  let lo = a
  while (lo - step > s.view.xMin - 2 && ok(lo - step)) lo -= step
  let hi = a
  while (hi + step < s.view.xMax + 2 && ok(hi + step)) hi += step
  return [lo, hi]
}

/** P(x) as TeX, with coefficients rounded for display. */
function polyTex(cs: readonly number[], a: number) {
  const base = a === 0 ? 'x' : `(x ${a > 0 ? '-' : '+'} ${num(Math.abs(a))})`
  const terms: string[] = []
  cs.forEach((c, k) => {
    if (Math.abs(c) < 1e-12) return
    const mag = Math.abs(c)
    const coef = k > 0 && Math.abs(mag - 1) < 1e-12 ? '' : formatNumber(mag, mag < 0.01 ? 5 : 3)
    const power = k === 0 ? '' : k === 1 ? base : `${base}^{${k}}`
    const body = k === 0 ? formatNumber(mag, 3) : `${coef}${power}`
    terms.push(`${c < 0 ? '-' : '+'} ${body}`)
  })
  if (!terms.length) return 'P(x) = 0'
  const first = terms[0].startsWith('+ ') ? terms[0].slice(2) : terms[0]
  return `P(x) = ${[first, ...terms.slice(1)].join(' ')}`
}

export default function TaylorSeriesLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Polynomials that impersonate functions">
        <Prose>
          <p>
            How does a calculator find <Tex>{'\\sin(0.3)'}</Tex>? It can only add and multiply. The
            trick: near a point, almost any smooth function can be faked by a polynomial, and
            polynomials are just adding and multiplying.
          </p>
          <p>
            Start with a flat line at the right height. Tilt it to match the slope. Bend it to match
            the curvature. Each extra term matches one more derivative, and the polynomial hugs the
            curve over a wider and wider stretch. That's a <strong>Taylor series</strong>.
          </p>
        </Prose>
      </LabSection>
      <TaylorExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The Taylor series">
        <Formula
          tex={
            "f(x) = \\sum_{k=0}^{\\infty} \\frac{f^{(k)}(a)}{k!}(x - a)^k = f(a) + f'(a)(x - a) + \\frac{f''(a)}{2!}(x - a)^2 + \\cdots"
          }
          caption="Each term matches one more derivative of $f$ at the centre $a$. With $a = 0$ it's called a Maclaurin series."
        />
        <Prose>
          <p>
            The <Tex>k!</Tex> is there because differentiating <Tex>{'(x - a)^k'}</Tex> a total of{' '}
            <Tex>k</Tex> times gives <Tex>k!</Tex>. Dividing by it makes the polynomial's{' '}
            <Tex>k</Tex>th derivative at <Tex>a</Tex> come out equal to <Tex>{'f^{(k)}(a)'}</Tex>.
            Some series worth knowing by heart:
          </p>
        </Prose>
        <Formula
          tex={
            'e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots \\qquad \\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\cdots'
          }
        />
        <Formula
          tex={
            '\\cos x = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\cdots \\qquad \\frac{1}{1 - x} = 1 + x + x^2 + x^3 + \\cdots \\;(|x| < 1)'
          }
        />
        <Callout
          kind="misconception"
          title="More terms doesn't always mean a better fit everywhere"
        >
          <p>
            For <Tex>{'\\sin'}</Tex>, <Tex>{'\\cos'}</Tex> and <Tex>{'e^x'}</Tex> the series works
            for every <Tex>x</Tex>. But <Tex>{'\\ln(1 + x)'}</Tex> and{' '}
            <Tex>{'\\frac{1}{1 - x}'}</Tex> have a <em>radius of convergence</em>: beyond the dashed
            walls, adding terms makes the polynomial go wilder, not closer. A series can only reach
            as far as the nearest place the function breaks.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where series earn their keep">
        <RealWorld
          items={[
            {
              title: 'Calculators and computers',
              body: 'Math libraries compute $\\sin$, $e^x$ and $\\ln$ with short polynomial approximations, tuned so every digit is correct.',
            },
            {
              title: 'Physics approximations',
              body: 'A pendulum swings as $\\sin\\theta \\approx \\theta$ for small angles: the first term of the Taylor series, and why its period hardly depends on the swing.',
            },
            {
              title: 'Relativity',
              body: 'Expand Einstein’s energy formula in a series and the second term is the familiar $\\tfrac12 mv^2$.',
            },
            {
              title: 'Optimisation',
              body: 'Newton’s method and many machine-learning optimisers fit a degree-2 Taylor polynomial to the loss and jump to its minimum.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A Taylor polynomial matches a function’s value, slope, curvature… at one centre point.',
            'Coefficients: $c_k = \\dfrac{f^{(k)}(a)}{k!}$.',
            'More terms widen the region where the polynomial hugs the curve.',
            'Some series only converge within a radius, set by the nearest point where the function breaks.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function TaylorExplorer() {
  const [key, setKey] = useState<SeriesKey>('sin')
  const [n, setN] = useState(1)
  const [a, setA] = useState(0)
  const [probe, setProbe] = useState(2)
  const s = SERIES[key]
  const cs = coefficients(s, a, n)
  const P = (x: number) => evalPoly(cs, a, x)
  const [lo, hi] = goodFit(s, cs, a)
  const R = s.radius(a)
  const fP = s.f(probe)
  const pP = P(probe)
  const { yMin, yMax } = s.view
  const band: Vec2[] = [
    [lo, yMin - 10],
    [hi, yMin - 10],
    [hi, yMax + 10],
    [lo, yMax + 10],
  ]
  const pick = (k: SeriesKey) => {
    setKey(k)
    setA(0)
    setN(k === 'exp' || k === 'geo' || k === 'ln' ? 2 : 1)
    setProbe(k === 'exp' ? 1 : k === 'ln' || k === 'geo' ? 0.5 : 2)
  }
  const partials = Array.from({ length: n + 1 }, (_, k) => evalPoly(cs.slice(0, k + 1), a, probe))
  return (
    <LabSection id="explore" eyebrow="Explore" title="One more term at a time">
      <Prose>
        <p>
          Pick a function and raise the degree one step at a time. The green band marks where the
          orange polynomial is within 0.1 of the blue curve. Drag the violet centre to rebuild the
          series around a different point, and drag the pink probe to compare values.
        </p>
      </Prose>
      <PredictReveal
        question="The degree-1 approximation of $\sin x$ at 0 is the line $y = x$. Adding the next nonzero term, $-\frac{x^3}{6}$, will make the good-fit region…"
        options={['Wider', 'Narrower', 'The same', 'Disappear']}
        answer={0}
        explanation="Wider. The cubic bends away from the straight line just as the sine wave does, so it stays close for longer. Every extra term buys more width."
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Function"
            value={key}
            onChange={pick}
            options={(Object.keys(SERIES) as SeriesKey[]).map((k) => ({
              value: k,
              label: <Tex>{SERIES[k].tex}</Tex>,
              ariaLabel: SERIES[k].aria,
            }))}
          />
        </div>
        <Plot
          view={s.view}
          height={340}
          ariaLabel={`Degree ${n} Taylor polynomial of ${s.aria} centred at ${num(a)}; good fit from ${num(lo)} to ${num(hi)}`}
        >
          <Polygon points={band} fill={FIT} fillOpacity={0.12} stroke="none" />
          {Number.isFinite(R) && (
            <>
              <Segment
                from={[a - R, yMin - 10]}
                to={[a - R, yMax + 10]}
                color="var(--ink-3)"
                width={1.5}
                dashed
              />
              <Segment
                from={[a + R, yMin - 10]}
                to={[a + R, yMax + 10]}
                color="var(--ink-3)"
                width={1.5}
                dashed
              />
            </>
          )}
          <FunctionGraph fn={s.f} color={CURVE} width={3} />
          <FunctionGraph fn={P} color={POLY} width={2.5} />
          <Segment from={[probe, fP]} to={[probe, pP]} color={PROBE} width={2} dashed />
          <Point at={[probe, pP]} r={4.5} color={POLY} />
          <MovablePoint
            x={probe}
            y={0}
            onMove={(x) => setProbe(x)}
            constrain={constraints.compose(
              constraints.snapToGrid(0.05),
              constraints.within(s.view.xMin + 0.2, s.view.xMax - 0.2, 0, 0),
            )}
            color={PROBE}
            label="Probe x"
            size={6}
          />
          <MovablePoint
            x={a}
            y={s.f(a)}
            onMove={(x) => setA(clamp(snap(x, 0.25), s.aRange[0], s.aRange[1]))}
            constrain={([x]) => {
              const c = clamp(snap(x, 0.25), s.aRange[0], s.aRange[1])
              return [c, s.f(c)]
            }}
            step={0.25}
            color={CENTRE}
            label="Centre a of the series"
          />
          <Label
            at={[a, s.f(a)]}
            anchor="bottom"
            offset={[0, -14]}
            color={CENTRE}
            className="text-xs"
          >
            <Tex>a</Tex>
          </Label>
        </Plot>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label="Degree n"
            value={n}
            min={0}
            max={14}
            step={1}
            onChange={setN}
            color={POLY}
          />
          <Readouts
            items={[
              {
                label: 'good fit',
                value: `${formatNumber(lo, 2)} to ${formatNumber(hi, 2)}`,
                color: FIT,
              },
              {
                label: 'radius',
                value: Number.isFinite(R) ? formatNumber(R, 2) : 'infinite',
              },
            ]}
          />
        </div>
        <div className="overflow-x-auto overflow-y-hidden border-t border-line px-3 py-3 text-sm sm:px-4">
          <Tex>{polyTex(cs, a)}</Tex>
        </div>
        <div className="overflow-x-auto overflow-y-hidden border-t border-line p-3 sm:px-4">
          <table className="w-full min-w-[20rem] text-sm tabular-nums">
            <caption className="mb-1 text-left text-ink-2">
              Partial sums at the probe, <Tex>{`x = ${num(probe)}`}</Tex>, where{' '}
              <Tex>{`f(x) = ${num(fP, 5)}`}</Tex>
            </caption>
            <thead>
              <tr className="text-left text-ink-2">
                <th className="py-1 pr-3 font-medium">terms up to degree</th>
                <th className="py-1 pr-3 font-medium">P(x)</th>
                <th className="py-1 font-medium">error</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {partials.map((v, k) => (
                <tr key={k} className="border-t border-line">
                  <td className="py-1 pr-3">{k}</td>
                  <td className="py-1 pr-3">{formatNumber(v, 5)}</td>
                  <td className="py-1">
                    {Number.isFinite(fP) ? formatNumber(Math.abs(fP - v), 5) : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-hug" when={key === 'sin' && hi - lo > 6}>
          Add terms to the sine series until the good fit is more than 6 units wide. What degree did
          it take?
        </TryThis>
        <TryThis
          id="t-e"
          when={
            key === 'exp' &&
            a === 0 &&
            Math.abs(probe - 1) < 1e-9 &&
            Math.abs(P(1) - Math.E) < 0.005
          }
        >
          On <Tex>e^x</Tex> with the probe at 1, add terms until <Tex>P(1)</Tex> matches{' '}
          <Tex>e \approx 2.718</Tex> to two decimal places.
        </TryThis>
        <TryThis id="t-wall" when={key === 'ln' && n >= 10}>
          On <Tex>{'\\ln(1 + x)'}</Tex>, go to degree 10 or more. Does the fit ever cross the dashed
          wall?
        </TryThis>
        <TryThis id="t-centre" when={Math.abs(a) >= 1}>
          Drag the centre <Tex>a</Tex> somewhere else. Where is the polynomial most accurate now?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const COS = SERIES.cos

function Practice() {
  const [n, setN] = useState(2)
  const err = Math.abs(Math.cos(1) - evalPoly(coefficients(COS, 0, n), 0, 1))
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-e01"
          index={1}
          prompt="Use $e^x \approx 1 + x + \dfrac{x^2}{2}$ to estimate $e^{0.1}$."
          answer={1.105}
          tolerance={0.0005}
          explanation="$1 + 0.1 + 0.005 = 1.105$. The true value is $1.10517\ldots$"
        />
        <NumericChallenge
          id="c-cube"
          index={2}
          prompt="What is the coefficient of $x^3$ in the Maclaurin series of $\sin x$? (Decimals are fine.)"
          answer={-1 / 6}
          tolerance={0.002}
          hint="$c_3 = \dfrac{f'''(0)}{3!}$, and the third derivative of $\sin$ is $-\cos$."
          explanation="$f'''(0) = -\cos 0 = -1$, so $c_3 = -\tfrac{1}{6} \approx -0.1667$."
        />
        <McqChallenge
          id="c-exp"
          index={3}
          prompt="Which is the Maclaurin series of $e^x$?"
          options={[
            { text: '$1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots$', correct: true },
            {
              text: '$1 + x + x^2 + x^3 + \\cdots$',
              why: 'That is $\\frac{1}{1 - x}$; it is missing the factorials.',
            },
            {
              text: '$x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\cdots$',
              why: 'That is $\\sin x$.',
            },
            {
              text: '$1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\cdots$',
              why: 'That is $\\cos x$.',
            },
          ]}
          explanation="Every derivative of $e^x$ is $e^x$, which is 1 at 0, so $c_k = \frac{1}{k!}$."
        />
        <InteractiveChallenge
          id="c-degree"
          index={4}
          prompt="Choose the smallest degree whose Maclaurin polynomial for $\cos x$ gets $\cos 1$ right to within 0.001."
          solved={err < 0.001 && n <= 6}
          hint="Cosine only has even powers, so the error drops at degrees 2, 4, 6, …"
          explanation="Degree 4 gives $0.54167$ (off by $0.0014$); degree 6 gives $0.540278$, within $0.00003$ of $\cos 1 = 0.540302$."
          onReset={() => setN(2)}
        >
          <div className="grid gap-3 rounded-xl border border-line p-3">
            <Slider
              label="Degree"
              value={n}
              min={0}
              max={10}
              step={1}
              onChange={setN}
              color={POLY}
            />
            <p className="text-sm">
              Error at <Tex>x = 1</Tex>: <span className="font-mono">{formatNumber(err, 6)}</span>
            </p>
          </div>
        </InteractiveChallenge>
        <McqChallenge
          id="c-radius"
          index={5}
          prompt="The series $1 + x + x^2 + x^3 + \cdots$ equals $\dfrac{1}{1 - x}$ for which $x$?"
          options={[
            { text: '$-1 < x < 1$', correct: true },
            { text: 'Every $x$', why: 'Try $x = 2$: the terms 1, 2, 4, 8, … blow up.' },
            { text: '$x > 0$ only', why: 'Negative $x$ between $-1$ and 0 works too.' },
            { text: 'Only $x = 0$', why: 'It works on a whole interval around 0.' },
          ]}
          explanation="The function breaks at $x = 1$, one unit from the centre, so the radius of convergence is 1."
        />
      </ChallengeSet>
    </LabSection>
  )
}

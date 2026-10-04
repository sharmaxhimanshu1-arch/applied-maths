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
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { FunctionGraph, Label, MovablePoint, Plot, Point, Polygon } from '@/viz'

const CURVE = 'var(--c-blue)'
const EPS = 'var(--c-orange)'
const DELTA = 'var(--c-violet)'

type ZoomKey = 'sinc' | 'moved' | 'jump' | 'wiggle'

type ZoomFn = {
  /** The function away from the point a (the value at a is handled separately). */
  f: (x: number) => number
  /** The formula just left of a, when f jumps there (so the left piece ends at the right height). */
  left?: (x: number) => number
  a: number
  /** The limit, or null when there isn't one. */
  limit: number | null
  /** f(a) if it is defined. */
  valueAt: number | null
  /** Vertical centre of the window. */
  cy: number
  /** Whether zooming also shrinks the vertical range (pointless when the sides disagree). */
  zoomY: boolean
  tex: string
  label: string
}

const ZOOM_FNS: Record<ZoomKey, ZoomFn> = {
  sinc: {
    f: (x) => Math.sin(x) / x,
    a: 0,
    limit: 1,
    valueAt: null,
    cy: 1,
    zoomY: true,
    tex: 'f(x) = \\dfrac{\\sin x}{x}',
    label: 'A hole',
  },
  moved: {
    f: (x) => (x * x - 4) / (x - 2),
    a: 2,
    limit: 4,
    valueAt: 1,
    cy: 3,
    zoomY: true,
    tex: 'f(x) = \\dfrac{x^2 - 4}{x - 2},\\; f(2) = 1',
    label: 'A moved point',
  },
  jump: {
    f: (x) => (x < 0 ? -1 + x / 2 : 1 + x / 2),
    left: (x) => -1 + x / 2,
    a: 0,
    limit: null,
    valueAt: 1,
    cy: 0,
    zoomY: false,
    tex: 'f(x) = \\tfrac{x}{2} \\pm 1',
    label: 'A jump',
  },
  wiggle: {
    f: (x) => Math.sin(1 / x),
    a: 0,
    limit: null,
    valueAt: null,
    cy: 0,
    zoomY: false,
    tex: 'f(x) = \\sin \\tfrac{1}{x}',
    label: 'A wiggle',
  },
}

const HX = 3
const HY = 2.2
const APPROACH = [0.1, 0.01, 0.001]

/** Small positive numbers with enough digits to see them shrink. */
function small(x: number) {
  if (x >= 0.1) return formatNumber(x, 2)
  if (x >= 0.01) return formatNumber(x, 3)
  if (x >= 0.001) return formatNumber(x, 4)
  return formatNumber(x, 5)
}

/** Keep the probe inside the window and never exactly on a (where f may be undefined). */
function placeProbe(a: number, d: number, hx: number) {
  const inside = clamp(d, -0.92 * hx, 0.92 * hx)
  const minGap = hx / 400
  if (Math.abs(inside) >= minGap) return a + inside
  return a + (inside < 0 ? -minGap : minGap)
}

export default function LimitsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Where is it heading?">
        <Prose>
          <p>
            Try to work out <Tex>{'\\dfrac{\\sin x}{x}'}</Tex> at <Tex>x = 0</Tex>. You get{' '}
            <Tex>{'\\tfrac00'}</Tex>, which isn't a number at all. The formula breaks at exactly the
            point you care about.
          </p>
          <p>
            A <strong>limit</strong> asks a gentler question: never mind the value <em>at</em> 0,
            what value does the function <em>head towards</em> as <Tex>x</Tex> gets closer and
            closer to 0? Speed at an instant, the area of a curved region and the sum of infinitely
            many terms are all answered with this one idea. It is the foundation the rest of
            calculus is built on.
          </p>
        </Prose>
      </LabSection>
      <ZoomExplorer />
      <EpsilonDeltaExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="What a limit means">
        <Formula
          tex={'\\lim_{x \\to a} f(x) = L'}
          caption="“As $x$ approaches $a$, $f(x)$ approaches $L$.” The value at $a$ itself is never used."
        />
        <Prose>
          <p>
            Precisely: for every tolerance <Tex>{'\\varepsilon > 0'}</Tex> there is a distance{' '}
            <Tex>{'\\delta > 0'}</Tex> such that whenever <Tex>x</Tex> is within <Tex>\delta</Tex>{' '}
            of <Tex>a</Tex> (but not equal to it), <Tex>f(x)</Tex> is within <Tex>\varepsilon</Tex>{' '}
            of <Tex>L</Tex>. That is the game you just played: whatever band the challenger draws,
            you can always answer.
          </p>
        </Prose>
        <Formula
          tex={
            '\\lim_{x \\to a} f(x) = L \\iff \\lim_{x \\to a^-} f(x) = L = \\lim_{x \\to a^+} f(x)'
          }
          caption="A limit exists only when the approach from the left and the approach from the right agree."
        />
        <Prose>
          <p>
            Limits follow the rules you'd hope for: the limit of a sum is the sum of the limits, and
            the same goes for products and quotients (as long as you don't divide by 0). For a
            smooth formula with no trouble at <Tex>a</Tex>, the limit is just <Tex>f(a)</Tex>. The
            interesting cases are the ones that break, like <Tex>{'\\tfrac00'}</Tex>.
          </p>
        </Prose>
        <Callout kind="misconception" title="The limit is not the value">
          <p>
            <Tex>{'\\lim_{x \\to a} f(x)'}</Tex> doesn't care what happens <em>at</em> <Tex>a</Tex>.
            The value can be missing (a hole), or sit somewhere else entirely (the moved point), and
            the limit is unchanged. And <Tex>{'\\tfrac00'}</Tex> isn't 0, 1 or infinity: it's
            undecided, and a limit decides it.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where limits show up">
        <RealWorld
          items={[
            {
              title: 'Speed at an instant',
              body: 'A speedometer shows distance ÷ time over a time gap shrinking towards zero. That limit is the derivative, the next lab.',
            },
            {
              title: 'Compound interest',
              body: 'Compound more and more often and $(1 + \\tfrac1n)^n$ settles towards $e \\approx 2.718$.',
            },
            {
              title: 'Engineering tolerances',
              body: 'The ε–δ game is a spec sheet: “the output must stay within ε, so how tightly must I hold the input?”',
            },
            {
              title: 'Computer graphics',
              body: 'Curves on screen are drawn as many short straight pieces. As the pieces shrink, the drawing approaches the true curve.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A limit is the value a function heads towards, not the value it has.',
            'Zoom in: if both sides close in on one height $L$, the limit is $L$.',
            'If the left and right approaches disagree (a jump), or never settle (a wiggle), there is no limit.',
            'Formally: for every $\\varepsilon$ there is a $\\delta$ that keeps $f(x)$ within $\\varepsilon$ of $L$.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function ZoomExplorer() {
  const [key, setKey] = useState<ZoomKey>('sinc')
  const [logZoom, setLogZoom] = useState(0)
  const [x, setX] = useState(2)
  const fn = ZOOM_FNS[key]
  const zoom = 10 ** logZoom
  const hx = HX / zoom
  const hy = fn.zoomY ? HY / zoom : HY
  const view = { xMin: fn.a - hx, xMax: fn.a + hx, yMin: fn.cy - hy, yMax: fn.cy + hy }
  const y = fn.f(x)
  const gap = Math.abs(x - fn.a)
  const pick = (k: ZoomKey) => {
    setKey(k)
    setLogZoom(0)
    setX(ZOOM_FNS[k].a + 2)
  }
  const onZoom = (v: number) => {
    setLogZoom(v)
    setX((old) => placeProbe(fn.a, old - fn.a, HX / 10 ** v))
  }
  return (
    <LabSection id="explore" eyebrow="Explore" title="Zoom in on the point">
      <Prose>
        <p>
          Pick a function and zoom in on the troublesome point. Then drag the probe towards it from
          either side. The table underneath does the same thing with numbers: it creeps in to{' '}
          <Tex>0.1</Tex>, <Tex>0.01</Tex> and <Tex>0.001</Tex> away.
        </p>
      </Prose>
      <PredictReveal
        question="As $x$ creeps towards 0, what do you think $\dfrac{\sin x}{x}$ heads towards?"
        options={['0', '1', 'It blows up to infinity', 'It has no limit']}
        answer={1}
        explanation="It heads to 1. Near 0, $\sin x$ is almost exactly $x$ (zoom in on a sine wave and it looks like the line $y = x$), so the ratio is almost exactly 1."
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Function"
            value={key}
            onChange={pick}
            options={(Object.keys(ZOOM_FNS) as ZoomKey[]).map((k) => ({
              value: k,
              label: ZOOM_FNS[k].label,
            }))}
          />
          <Tex>{fn.tex}</Tex>
        </div>
        <Plot
          view={view}
          height={320}
          ariaLabel={`${fn.label} at x = ${fn.a}, zoomed ${formatNumber(zoom, 0)} times`}
        >
          {fn.left ? (
            <>
              <FunctionGraph fn={fn.left} domain={[-Infinity, fn.a]} color={CURVE} />
              <FunctionGraph fn={fn.f} domain={[fn.a, Infinity]} color={CURVE} />
              <Point at={[fn.a, fn.left(fn.a)]} r={5} color={CURVE} hollow />
            </>
          ) : (
            <FunctionGraph fn={fn.f} color={CURVE} />
          )}
          {fn.limit !== null && <Point at={[fn.a, fn.limit]} r={5} color={CURVE} hollow />}
          {fn.valueAt !== null && <Point at={[fn.a, fn.valueAt]} r={5} color={CURVE} />}
          <MovablePoint
            x={x}
            y={y}
            onMove={(px) => setX(placeProbe(fn.a, px - fn.a, hx))}
            constrain={([px]) => [px, fn.f(px)]}
            step={hx / 20}
            color="var(--c-orange)"
            label="Probe on the curve"
          />
          <Label at={[x, y]} anchor="bottom" offset={[0, -14]} className="text-xs">
            <Tex>{`f(x) \\approx ${formatNumber(y, 4).replace('−', '-')}`}</Tex>
          </Label>
        </Plot>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label="Zoom"
            value={logZoom}
            min={0}
            max={3}
            step={0.1}
            onChange={onZoom}
            format={(v) => `${formatNumber(10 ** v, 0)}×`}
          />
          <Readouts
            items={[
              { label: 'x', value: formatNumber(x, 5) },
              { label: 'distance to a', value: small(gap) },
              { label: 'f(x)', value: formatNumber(y, 5), color: CURVE },
            ]}
          />
        </div>
        <div className="overflow-x-auto overflow-y-hidden border-t border-line p-3 sm:px-4">
          <table className="w-full min-w-[22rem] text-sm tabular-nums">
            <caption className="sr-only">
              Values of f approaching x = {fn.a} from both sides
            </caption>
            <thead>
              <tr className="text-left text-ink-2">
                <th className="py-1 pr-3 font-medium">distance from a</th>
                <th className="py-1 pr-3 font-medium">from the left</th>
                <th className="py-1 font-medium">from the right</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {APPROACH.map((h) => (
                <tr key={h} className="border-t border-line">
                  <td className="py-1 pr-3">{small(h)}</td>
                  <td className="py-1 pr-3">{formatNumber(fn.f(fn.a - h), 5)}</td>
                  <td className="py-1">{formatNumber(fn.f(fn.a + h), 5)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-zoom" when={key === 'sinc' && zoom >= 99}>
          Zoom in 100× on <Tex>{'\\tfrac{\\sin x}{x}'}</Tex>. Does the hole ever fill in?
        </TryThis>
        <TryThis id="t-close" when={fn.limit !== null && gap < 0.01}>
          Bring the probe within 0.01 of the point. What height is <Tex>f(x)</Tex> closing in on?
        </TryThis>
        <TryThis id="t-moved" when={key === 'moved'}>
          Try the moved point: <Tex>f(2) = 1</Tex>, yet the curve heads somewhere else. Which number
          is the limit?
        </TryThis>
        <TryThis id="t-jump" when={key === 'jump' && zoom >= 99}>
          Zoom 100× into the jump. Do the two sides ever agree?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type GameFn = {
  f: (x: number) => number
  /** The formula just left of a, when f jumps there. */
  left?: (x: number) => number
  a: number
  L: number
  /** Smallest half-height of the window, so far-away branches stay in sight. */
  minHy: number
}

const GAME_FNS: Record<'square' | 'jump', GameFn> = {
  square: { f: (x) => x * x, a: 1, L: 1, minHy: 0 },
  jump: { f: (x) => (x < 0 ? 0 : 1), left: () => 0, a: 0, L: 0.5, minHy: 0.75 },
}

/** Largest miss |f(x) − L| over 0 < |x − a| < δ (sampled finely). */
function worstMiss(g: GameFn, delta: number) {
  let worst = 0
  for (let i = 1; i <= 200; i++) {
    const d = (delta * i) / 201
    worst = Math.max(worst, Math.abs(g.f(g.a - d) - g.L), Math.abs(g.f(g.a + d) - g.L))
  }
  return worst
}

/** The ε band (horizontal), the δ band (vertical), and the curve inside the δ band. */
function EpsDeltaPlot({
  g,
  eps,
  delta,
  label,
}: {
  g: GameFn
  eps: number
  delta: number
  label: string
}) {
  const hx = 1.6 * Math.max(delta, eps / 2)
  const hy = Math.max(2.2 * eps, g.minHy)
  const view = { xMin: g.a - hx, xMax: g.a + hx, yMin: g.L - hy, yMax: g.L + hy }
  const win = worstMiss(g, delta) < eps
  const inside = win ? 'var(--good)' : 'var(--bad)'
  const wide = 10 * hx
  const tall = 10 * hy
  const epsBand: Vec2[] = [
    [g.a - wide, g.L - eps],
    [g.a + wide, g.L - eps],
    [g.a + wide, g.L + eps],
    [g.a - wide, g.L + eps],
  ]
  const deltaBand: Vec2[] = [
    [g.a - delta, g.L - tall],
    [g.a + delta, g.L - tall],
    [g.a + delta, g.L + tall],
    [g.a - delta, g.L + tall],
  ]
  return (
    <Plot view={view} height={300} tickLabels={false} ariaLabel={label}>
      <Polygon points={epsBand} fill={EPS} fillOpacity={0.14} stroke={EPS} strokeWidth={1} dashed />
      <Polygon
        points={deltaBand}
        fill={DELTA}
        fillOpacity={0.1}
        stroke={DELTA}
        strokeWidth={1}
        dashed
      />
      {g.left ? (
        <>
          <FunctionGraph fn={g.left} domain={[-Infinity, g.a]} color="var(--ink-3)" width={2} />
          <FunctionGraph fn={g.f} domain={[g.a, Infinity]} color="var(--ink-3)" width={2} />
          <FunctionGraph fn={g.left} domain={[g.a - delta, g.a]} color={inside} width={4} />
          <FunctionGraph fn={g.f} domain={[g.a, g.a + delta]} color={inside} width={4} />
        </>
      ) : (
        <>
          <FunctionGraph fn={g.f} color="var(--ink-3)" width={2} />
          <FunctionGraph fn={g.f} domain={[g.a - delta, g.a + delta]} color={inside} width={4} />
        </>
      )}
      <Point at={[g.a, g.L]} r={4.5} color="var(--ink)" hollow />
      <Label at={[g.a + hx, g.L + eps]} anchor="bottom-right" offset={[-6, -4]} color={EPS}>
        <Tex>{'L + \\varepsilon'}</Tex>
      </Label>
      <Label at={[g.a + hx, g.L - eps]} anchor="top-right" offset={[-6, 4]} color={EPS}>
        <Tex>{'L - \\varepsilon'}</Tex>
      </Label>
      <Label at={[g.a + delta, g.L - hy]} anchor="bottom-left" offset={[4, -6]} color={DELTA}>
        <Tex>{'a + \\delta'}</Tex>
      </Label>
    </Plot>
  )
}

const EPS_OPTIONS = { '0.5': 0.5, '0.1': 0.1, '0.01': 0.01 } as const
type EpsKey = keyof typeof EPS_OPTIONS

function DeltaSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Slider
      label={<Tex>\delta</Tex>}
      name="Delta, the distance allowed from a"
      value={value}
      min={-3}
      max={-0.3}
      step={0.05}
      onChange={onChange}
      format={(v) => small(10 ** v)}
      color={DELTA}
    />
  )
}

function EpsilonDeltaExplorer() {
  const [which, setWhich] = useState<'square' | 'jump'>('square')
  const [epsKey, setEpsKey] = useState<EpsKey>('0.5')
  const [logDelta, setLogDelta] = useState(-0.3)
  const g = GAME_FNS[which]
  const eps = EPS_OPTIONS[epsKey]
  const delta = 10 ** logDelta
  const miss = worstMiss(g, delta)
  const win = miss < eps
  return (
    <LabSection id="epsilon-delta" eyebrow="Explore" title="The ε–δ game">
      <Prose>
        <p>
          “Close” needs a number. Your challenger picks a tolerance <Tex>\varepsilon</Tex>: the
          orange band, <Tex>L \pm \varepsilon</Tex>. You answer with a distance <Tex>\delta</Tex>:
          the violet band around <Tex>a</Tex>. You win if the whole curve inside your band (apart
          from the point <Tex>a</Tex> itself) stays inside theirs.
        </p>
        <p>
          The claim <Tex>{'\\lim_{x \\to a} f(x) = L'}</Tex> means you can win against{' '}
          <em>every</em> <Tex>\varepsilon</Tex>, however small.
        </p>
      </Prose>
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Segmented
            label="Function"
            value={which}
            onChange={setWhich}
            options={[
              {
                value: 'square',
                label: <Tex>{'x^2,\\ a = 1'}</Tex>,
                ariaLabel: 'x squared near 1',
              },
              { value: 'jump', label: 'Jump, a = 0', ariaLabel: 'Jump at 0' },
            ]}
          />
          <Segmented
            label="Challenger's epsilon"
            value={epsKey}
            onChange={setEpsKey}
            options={(Object.keys(EPS_OPTIONS) as EpsKey[]).map((k) => ({
              value: k,
              label: <Tex>{`\\varepsilon = ${k}`}</Tex>,
              ariaLabel: `epsilon ${k}`,
            }))}
          />
        </div>
        <EpsDeltaPlot
          g={g}
          eps={eps}
          delta={delta}
          label={`Epsilon band ${eps} and delta band ${small(delta)}: ${win ? 'you win' : 'the curve escapes'}`}
        />
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <DeltaSlider value={logDelta} onChange={setLogDelta} />
          <Readouts
            items={[
              { label: 'claimed L', value: formatNumber(g.L, 2) },
              {
                label: 'worst miss',
                value: small(miss),
                color: win ? 'var(--good)' : 'var(--bad)',
              },
              { label: 'result', value: win ? 'you win' : 'curve escapes' },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-win" when={which === 'square' && epsKey === '0.5' && win}>
          Win against <Tex>\varepsilon = 0.5</Tex>: shrink <Tex>\delta</Tex> until the curve stays
          green.
        </TryThis>
        <TryThis id="t-win-small" when={which === 'square' && epsKey === '0.01' && win}>
          Now win against <Tex>\varepsilon = 0.01</Tex>. Roughly how does your <Tex>\delta</Tex>{' '}
          compare with <Tex>\varepsilon</Tex>?
        </TryThis>
        <TryThis id="t-jump-lose" when={which === 'jump' && delta <= 0.0021}>
          Switch to the jump and shrink <Tex>\delta</Tex> as far as it goes. Can any{' '}
          <Tex>\delta</Tex> beat <Tex>\varepsilon = 0.5</Tex>, or anything smaller?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const LINE_GAME: GameFn = { f: (x) => 3 * x, a: 1, L: 3, minHy: 0 }

function Practice() {
  const [logDelta, setLogDelta] = useState(-0.3)
  const delta = 10 ** logDelta
  const solved = worstMiss(LINE_GAME, delta) < 0.3
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-cancel-lab"
          index={1}
          prompt="Find $\displaystyle\lim_{x \to 3} \frac{x^2 - 9}{x - 3}$."
          answer={6}
          hint="Factor the top: $x^2 - 9 = (x - 3)(x + 3)$."
          explanation="For $x \ne 3$ the fraction is $x + 3$, which heads to $6$. The $\tfrac00$ at $x = 3$ doesn't matter."
        />
        <McqChallenge
          id="c-sides-lab"
          index={2}
          prompt="$f(x) = \dfrac{x}{|x|}$ is $-1$ for negative $x$ and $1$ for positive $x$. What is $\displaystyle\lim_{x \to 0} f(x)$?"
          options={[
            { text: 'It does not exist', correct: true },
            { text: '0', why: '0 is halfway between, but $f$ never gets near 0.' },
            { text: '1', why: 'That is only the limit from the right.' },
            { text: '−1', why: 'That is only the limit from the left.' },
          ]}
          explanation="The left and right approaches disagree ($-1$ and $1$), so there is no single limit."
        />
        <NumericChallenge
          id="c-value"
          index={3}
          prompt="$f(x) = x^2$ for every $x \ne 2$, but someone defined $f(2) = 10$. What is $\displaystyle\lim_{x \to 2} f(x)$?"
          answer={4}
          explanation="The limit only looks near 2, never at 2. Near 2, $x^2$ is near 4."
        />
        <InteractiveChallenge
          id="c-delta"
          index={4}
          prompt="For $f(x) = 3x$ near $a = 1$ (so $L = 3$), the challenger picks $\varepsilon = 0.3$. Choose a $\delta$ that wins."
          solved={solved}
          hint="The line is 3 times as steep as the diagonal, so $f$ moves 3 times as far as $x$ does."
          explanation="Any $\delta \le 0.1$ works: if $|x - 1| < 0.1$ then $|3x - 3| = 3|x - 1| < 0.3$. In general $\delta = \varepsilon / 3$."
          onReset={() => setLogDelta(-0.3)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <EpsDeltaPlot
              g={LINE_GAME}
              eps={0.3}
              delta={delta}
              label={`f(x) = 3x with epsilon 0.3 and delta ${small(delta)}`}
            />
            <div className="border-t border-line p-3">
              <DeltaSlider value={logDelta} onChange={setLogDelta} />
            </div>
          </div>
        </InteractiveChallenge>
        <NumericChallenge
          id="c-sin3"
          index={5}
          prompt="Use $\displaystyle\lim_{u \to 0} \frac{\sin u}{u} = 1$ to find $\displaystyle\lim_{x \to 0} \frac{\sin 3x}{x}$."
          answer={3}
          hint="Write it as $3 \cdot \dfrac{\sin 3x}{3x}$."
          explanation="$\dfrac{\sin 3x}{x} = 3 \cdot \dfrac{\sin 3x}{3x}$, and as $x \to 0$ so does $u = 3x$. The limit is $3 \cdot 1 = 3$."
        />
      </ChallengeSet>
    </LabSection>
  )
}

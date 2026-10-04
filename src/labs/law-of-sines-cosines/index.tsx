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
import { Tex } from '@/ui/Tex'
import {
  AngleArc,
  Circle,
  Label,
  MovablePoint,
  Plot,
  Point,
  Polygon,
  Segment,
  constraints,
} from '@/viz'
import { angleAt, circumcenter, DEG, dist, interiorArc } from '../_shared/geometry'
import { num, signed } from '../_shared/tex'

const A_COL = 'var(--c-blue)'
const B_COL = 'var(--c-orange)'
const C_COL = 'var(--c-violet)'
const ANG = 'var(--c-magenta)'
const RING = 'var(--c-green)'

/** Pixel offset that pushes a vertex label away from the triangle's centre. */
function outward(p: Vec2, centre: Vec2, px = 16): [number, number] {
  const dx = p[0] - centre[0]
  const dy = p[1] - centre[1]
  const l = Math.hypot(dx, dy) || 1
  return [(dx / l) * px, (-dy / l) * px]
}

const centroid = (pts: readonly Vec2[]): Vec2 => [
  (pts[0][0] + pts[1][0] + pts[2][0]) / 3,
  (pts[0][1] + pts[1][1] + pts[2][1]) / 3,
]

/** Snap B to whole degrees of angle C and half-unit lengths of side a. */
const snapB =
  (fixedA: number | null) =>
  ([x, y]: Vec2): Vec2 => {
    const deg = clamp(Math.round(Math.atan2(y, x) / DEG), 10, 170)
    const a = fixedA ?? clamp(Math.round(Math.hypot(x, y) * 2) / 2, 1, 5)
    return [a * Math.cos(deg * DEG), a * Math.sin(deg * DEG)]
  }

const polarOf = ([x, y]: Vec2) => ({
  deg: Math.round(Math.atan2(y, x) / DEG),
  a: Math.round(Math.hypot(x, y) * 2) / 2,
})

/** Triangle with C at the origin, A on the x-axis and B at angle C. */
function SasTriangle({
  a,
  b,
  deg,
  onB,
  onA,
  fixedA,
}: {
  a: number
  b: number
  deg: number
  onB: (p: Vec2) => void
  onA?: (p: Vec2) => void
  fixedA?: number
}) {
  const A: Vec2 = [b, 0]
  const B: Vec2 = [a * Math.cos(deg * DEG), a * Math.sin(deg * DEG)]
  const C: Vec2 = [0, 0]
  const g = centroid([A, B, C])
  const mid = (p: Vec2, q: Vec2): Vec2 => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
  return (
    <>
      <Polygon points={[A, B, C]} fill={C_COL} fillOpacity={0.07} />
      <Segment from={C} to={B} color={A_COL} width={3} />
      <Segment from={C} to={A} color={B_COL} width={3} />
      <Segment from={A} to={B} color={C_COL} width={3} />
      <AngleArc center={C} from={0} to={deg * DEG} radius={26} color={ANG} />
      <Label at={C} anchor="center" offset={outward(C, g, 14)}>
        C
      </Label>
      <Label at={A} anchor="center" offset={outward(A, g, 14)}>
        A
      </Label>
      <Label at={B} anchor="center" offset={outward(B, g, 18)}>
        B
      </Label>
      <Label at={mid(C, B)} anchor="center" offset={outward(mid(C, B), g, 14)} color={A_COL}>
        a
      </Label>
      <Label at={mid(C, A)} anchor="center" offset={[0, 14]} color={B_COL}>
        b
      </Label>
      <Label at={mid(A, B)} anchor="center" offset={outward(mid(A, B), g, 14)} color={C_COL}>
        c
      </Label>
      {onA && (
        <MovablePoint
          x={A[0]}
          y={A[1]}
          onMove={(x, y) => onA([x, y])}
          constrain={constraints.compose(
            constraints.horizontal(0),
            constraints.snapToGrid(0.5),
            constraints.within(1, 6, 0, 0),
          )}
          color={B_COL}
          label="Corner A (sets side b)"
        />
      )}
      <MovablePoint
        x={B[0]}
        y={B[1]}
        onMove={(x, y) => onB([x, y])}
        constrain={snapB(fixedA ?? null)}
        color={A_COL}
        label="Corner B (sets side a and angle C)"
      />
    </>
  )
}

export default function LawOfSinesCosinesLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Trigonometry for every triangle">
        <Prose>
          <p>
            SOH CAH TOA needs a right angle. Real triangles (a field, a roof truss, the triangle
            between you and two lighthouses) rarely have one. Yet any triangle is fixed once you
            know enough of it: two sides and the angle between them, or all three sides, or two
            angles and a side.
          </p>
          <p>
            Two laws turn that into numbers. The <strong>law of cosines</strong> is Pythagoras with
            a correction for angles that aren't 90°. The <strong>law of sines</strong> says each
            side is in proportion to the sine of the angle across from it.
          </p>
        </Prose>
      </LabSection>
      <CosinesExplorer />
      <SinesExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The two laws">
        <Formula
          tex={'c^2 = a^2 + b^2 - 2ab\\cos C'}
          caption="The law of cosines. Side c faces angle C; a and b are the sides that make it."
        />
        <Formula
          tex={'\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R'}
          caption="The law of sines. R is the radius of the circle through all three corners."
        />
        <Prose>
          <p>
            Name each side with the small letter of the angle it faces. Then pick the law that fits
            what you know:
          </p>
          <ul>
            <li>
              <strong>Two sides and the angle between them</strong> (SAS): law of cosines gives the
              third side.
            </li>
            <li>
              <strong>All three sides</strong> (SSS): rearrange the law of cosines,{' '}
              <Tex>{'\\cos C = \\tfrac{a^2 + b^2 - c^2}{2ab}'}</Tex>, to get any angle.
            </li>
            <li>
              <strong>Two angles and a side</strong> (ASA or AAS): the third angle is{' '}
              <Tex>{'180^\\circ'}</Tex> minus the others, then the law of sines gives the other
              sides.
            </li>
          </ul>
          <p>
            When <Tex>{'C = 90^\\circ'}</Tex>, <Tex>{'\\cos C = 0'}</Tex> and the law of cosines is
            exactly Pythagoras. An acute <Tex>{'C'}</Tex> makes <Tex>{'c'}</Tex> shorter than
            Pythagoras says; an obtuse one makes it longer.
          </p>
        </Prose>
        <Callout kind="misconception" title="The law of sines can have two answers">
          <p>
            If you know two sides and an angle that is <em>not</em> between them (SSA), the law of
            sines gives <Tex>{'\\sin B'}</Tex>, and two angles share that sine: <Tex>{'B'}</Tex> and{' '}
            <Tex>{'180^\\circ - B'}</Tex>. Sometimes both fit, giving two different triangles. Check
            whether the obtuse option leaves room for the third angle.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where the laws are used">
        <RealWorld
          items={[
            {
              title: 'Triangulation',
              body: 'Measure the angles to a ship from two points on the shore a known distance apart: the law of sines gives its distance.',
            },
            {
              title: 'Navigation',
              body: 'Sail 10 km, turn, sail 6 km: the law of cosines tells you how far you are from where you started.',
            },
            {
              title: 'Surveying land',
              body: 'Surveyors split a field into triangles and measure their sides; the law of cosines gives the angles and Heron’s formula the area.',
            },
            {
              title: 'Robot arms',
              body: 'An arm with two segments reaches a point when its elbow angle satisfies the law of cosines for the triangle shoulder–elbow–hand.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Law of cosines: $c^2 = a^2 + b^2 - 2ab\\cos C$, Pythagoras plus a correction.',
            'Law of sines: $a / \\sin A$ is the same for every side, and equals the circle’s diameter.',
            'Two sides and the angle between them, or three sides: cosines. A side and its opposite angle: sines.',
            'SSA can fit two triangles: watch for the ambiguous case.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function CosinesExplorer() {
  const [b, setB] = useState(5)
  const [B, setBState] = useState({ deg: 70, a: 4 })
  const { deg, a } = B
  const cosC = Math.abs(deg - 90) < 1e-9 ? 0 : Math.cos(deg * DEG)
  const correction = -2 * a * b * cosC
  const c2 = a * a + b * b + correction
  const full = (a + b) ** 2
  const pct = (v: number) => `${(v / full) * 100}%`
  return (
    <LabSection id="explore" eyebrow="Explore" title="Pythagoras with a correction">
      <Prose>
        <p>
          Sides <Tex>{'a'}</Tex> and <Tex>{'b'}</Tex> meet at angle <Tex>{'C'}</Tex>. Drag corner B
          to change <Tex>{'a'}</Tex> and the angle; drag corner A to change <Tex>{'b'}</Tex>. The
          bars compare <Tex>{'a^2 + b^2'}</Tex> with the real <Tex>{'c^2'}</Tex>.
        </p>
      </Prose>
      <PredictReveal
        question="Keep $a$ and $b$ the same and open angle $C$ wider than $90^\circ$. Compared with $a^2 + b^2$, is $c^2$…"
        options={['Bigger', 'Smaller', 'Equal']}
        answer={0}
        explanation="Opening the angle pushes A and B apart, so $c$ grows past what Pythagoras gives. For an obtuse angle $\cos C < 0$, and $-2ab\cos C$ adds on."
      />
      <Figure>
        <div className="mx-auto w-full max-w-xl">
          <Plot
            view={{ xMin: -5.4, xMax: 6.6, yMin: -0.9, yMax: 5.4 }}
            aspect="equal"
            ariaLabel={`Triangle with sides ${a} and ${b} meeting at ${deg} degrees`}
          >
            <SasTriangle
              a={a}
              b={b}
              deg={deg}
              onB={(p) => setBState(polarOf(p))}
              onA={([x]) => setB(x)}
            />
            <Label at={[0, 0]} anchor="left" offset={[30, -14]} color={ANG} className="text-xs">
              {deg}°
            </Label>
          </Plot>
        </div>
        <div className="space-y-2 border-t border-line px-3 py-3 sm:px-4">
          <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2 text-sm">
            <span className="text-ink-2">
              <Tex>{'a^2 + b^2'}</Tex>
            </span>
            <div
              className="flex h-5 overflow-hidden rounded-md bg-surface-2"
              role="img"
              aria-label={`a squared plus b squared is ${formatNumber(a * a + b * b)}`}
            >
              <div style={{ width: pct(a * a), background: A_COL, opacity: 0.75 }} />
              <div style={{ width: pct(b * b), background: B_COL, opacity: 0.75 }} />
            </div>
            <span className="text-ink-2">
              <Tex>{'c^2'}</Tex>
            </span>
            <div
              className="flex h-5 overflow-hidden rounded-md bg-surface-2"
              role="img"
              aria-label={`c squared is ${formatNumber(c2)}`}
            >
              <div style={{ width: pct(c2), background: C_COL, opacity: 0.75 }} />
            </div>
          </div>
          <div className="overflow-x-auto py-1 text-center">
            <Tex>{`c^2 = ${num(a * a)} + ${num(b * b)} ${signed(correction)} = ${num(c2)}`}</Tex>
          </div>
          <Readouts
            items={[
              { label: 'C', value: `${deg}°`, color: ANG },
              { label: 'cos C', value: formatNumber(cosC, 3) },
              { label: '−2ab cos C', value: formatNumber(correction, 2) },
              { label: 'c', value: formatNumber(Math.sqrt(c2), 3), color: C_COL },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-right-lab" when={deg === 90}>
          Make angle C a right angle. What happens to the correction?
        </TryThis>
        <TryThis id="t-obtuse-lab" when={deg > 90}>
          Make C obtuse. Which bar is longer now?
        </TryThis>
        <TryThis id="t-equilateral" when={deg === 60 && a === b}>
          Make <Tex>{'a = b'}</Tex> with <Tex>{'C = 60^\\circ'}</Tex>. How long is <Tex>{'c'}</Tex>?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const inBox = constraints.compose(constraints.snapToGrid(0.5), constraints.within(-4.5, 4.5, -3, 3))

function SinesExplorer() {
  const [pts, setPts] = useState<[Vec2, Vec2, Vec2]>([
    [-3, -2],
    [3.5, -2],
    [0.5, 2.5],
  ])
  const [A, B, C] = pts
  const sides = [dist(B, C), dist(C, A), dist(A, B)]
  const angles = [angleAt(B, A, C), angleAt(A, B, C), angleAt(A, C, B)]
  const centre = circumcenter(A, B, C)
  const R = centre ? dist(centre, A) : null
  const g = centroid(pts)
  const names = ['A', 'B', 'C']
  const cols = [A_COL, B_COL, C_COL]
  const ratio = (i: number) =>
    R == null ? '—' : formatNumber(sides[i] / Math.sin(angles[i] * DEG), 3)
  const set = (i: number) => (x: number, y: number) =>
    setPts((old) => old.map((p, j) => (j === i ? [x, y] : p)) as [Vec2, Vec2, Vec2])
  return (
    <LabSection id="sines" eyebrow="Explore" title="One ratio, three times over">
      <Prose>
        <p>
          Drag any corner. For each corner the readouts divide the side across from it by the sine
          of its angle. Watch the three numbers, and the green circle through all three corners.
        </p>
      </Prose>
      <Figure>
        <div className="mx-auto w-full max-w-xl">
          <Plot
            view={{ xMin: -5.2, xMax: 5.2, yMin: -3.7, yMax: 3.7 }}
            aspect="equal"
            ariaLabel={`Triangle with angles ${angles.map((t) => Math.round(t)).join(', ')} degrees`}
          >
            {centre && R != null && (
              <>
                <Circle center={centre} r={R} stroke={RING} strokeWidth={2} dashed />
                <Point at={centre} r={3.5} color={RING} />
              </>
            )}
            <Polygon points={pts} fill={C_COL} fillOpacity={0.07} />
            <Segment from={B} to={C} color={A_COL} width={3} />
            <Segment from={C} to={A} color={B_COL} width={3} />
            <Segment from={A} to={B} color={C_COL} width={3} />
            {pts.map((p, i) => {
              const arc = interiorArc(pts[(i + 1) % 3], p, pts[(i + 2) % 3])
              return (
                <AngleArc
                  key={`arc-${i}`}
                  center={p}
                  from={arc.from}
                  to={arc.to}
                  radius={20}
                  color={cols[i]}
                />
              )
            })}
            {pts.map((p, i) => (
              <Label
                key={`name-${i}`}
                at={p}
                anchor="center"
                offset={outward(p, g, 20)}
                color={cols[i]}
                className="text-xs"
              >
                {names[i]} {Math.round(angles[i])}°
              </Label>
            ))}
            {pts.map((p, i) => (
              <MovablePoint
                key={`pt-${i}`}
                x={p[0]}
                y={p[1]}
                onMove={set(i)}
                constrain={inBox}
                color={cols[i]}
                label={`Corner ${names[i]}`}
              />
            ))}
          </Plot>
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'a / sin A', value: ratio(0), color: A_COL },
              { label: 'b / sin B', value: ratio(1), color: B_COL },
              { label: 'c / sin C', value: ratio(2), color: C_COL },
              {
                label: 'circle diameter 2R',
                value: R == null ? '—' : formatNumber(2 * R, 3),
                color: RING,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-sines-obtuse" when={Math.max(...angles) > 90.5}>
          Make one angle obtuse. Do the three ratios still agree?
        </TryThis>
        <TryThis id="t-sines-right" when={angles.some((t) => Math.abs(t - 90) < 1e-6)}>
          Make a right angle. Where does the longest side sit in the circle?
        </TryThis>
        <TryThis id="t-big" when={R != null && 2 * R >= 12}>
          Squash the triangle flat until the circle's diameter is 12 or more.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [deg, setDeg] = useState(100)
  const a = 5
  const b = 8
  const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(deg * DEG))
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-sas"
          index={1}
          prompt="Two sides of 3 and 4 meet at $120^\circ$. How long is the third side? (3 decimal places)"
          answer={Math.sqrt(37)}
          tolerance={0.01}
          hint="$\cos 120^\circ = -\tfrac12$."
          explanation="$c^2 = 9 + 16 - 2 \cdot 3 \cdot 4 \cdot (-\tfrac12) = 37$, so $c = \sqrt{37} \approx 6.083$."
        />
        <NumericChallenge
          id="c-aas"
          index={2}
          prompt="In a triangle, $A = 30^\circ$, $a = 4$ and $B = 90^\circ$. How long is side $b$?"
          answer={8}
          explanation="$b = a \cdot \tfrac{\sin B}{\sin A} = 4 \cdot \tfrac{1}{1/2} = 8$."
        />
        <McqChallenge
          id="c-which-lab"
          index={3}
          prompt="You know all three sides of a triangle and want an angle. Which law do you use?"
          options={[
            { text: 'The law of cosines', correct: true },
            {
              text: 'The law of sines',
              why: 'Every ratio $a/\\sin A$ needs an angle you don’t have yet.',
            },
            { text: 'Neither: you need an angle', why: 'Three sides fix the triangle completely.' },
          ]}
          explanation="Rearrange: $\cos C = \tfrac{a^2 + b^2 - c^2}{2ab}$, then take $\cos^{-1}$."
        />
        <NumericChallenge
          id="c-sss"
          index={4}
          prompt="A triangle has sides 3, 5 and 7. How big is its largest angle, in degrees?"
          answer={120}
          unit="°"
          hint="The largest angle faces the longest side."
          explanation="$\cos C = \tfrac{9 + 25 - 49}{2 \cdot 3 \cdot 5} = -\tfrac12$, so $C = 120^\circ$."
        />
        <NumericChallenge
          id="c-ship"
          index={5}
          prompt="Lookouts P and Q are 100 m apart on a straight shore. The angle at P between the shore and a ship is $50^\circ$; at Q it is $60^\circ$. How far is the ship from P, in m?"
          answer={(100 * Math.sin(60 * DEG)) / Math.sin(70 * DEG)}
          tolerance={0.2}
          unit="m"
          hint="Find the angle at the ship first. The side from P to the ship faces the angle at Q."
          explanation="The angle at the ship is $180^\circ - 50^\circ - 60^\circ = 70^\circ$. Then $PS = \tfrac{100 \sin 60^\circ}{\sin 70^\circ} \approx 92.2$ m."
        />
        <InteractiveChallenge
          id="c-seven"
          index={6}
          prompt="Sides $a = 5$ and $b = 8$ are fixed. Drag corner B to set angle $C$ so that the third side is exactly 7."
          solved={deg === 60}
          hint="$49 = 25 + 64 - 80\cos C$. What must $\cos C$ be?"
          explanation="$\cos C = \tfrac{25 + 64 - 49}{80} = \tfrac12$, so $C = 60^\circ$."
          onReset={() => setDeg(100)}
        >
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-line">
            <Plot
              view={{ xMin: -5.4, xMax: 8.8, yMin: -0.9, yMax: 5.6 }}
              aspect="equal"
              grid={false}
              axes={false}
              ariaLabel={`Triangle with sides 5 and 8 at ${deg} degrees`}
            >
              <SasTriangle a={a} b={b} deg={deg} fixedA={a} onB={(p) => setDeg(polarOf(p).deg)} />
            </Plot>
            <p className="border-t border-line px-3 py-2 text-sm">
              C = {deg}°, c = {formatNumber(c, 3)}
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

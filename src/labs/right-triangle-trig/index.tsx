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
import { Slider } from '@/ui/Slider'
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import { AngleArc, Circle, Label, MovablePoint, Plot, Point, Polygon, Segment } from '@/viz'
import { constraints } from '@/viz'
import { DEG } from '../_shared/geometry'

const OPP = 'var(--c-orange)'
const ADJ = 'var(--c-blue)'
const HYP = 'var(--c-violet)'
const ANG = 'var(--c-magenta)'
const TREE = 'var(--c-green)'

const fix = (x: number, d = 3) => x.toFixed(d)

/** Longest hypotenuse that still fits the figure at this angle, in quarter steps. */
const hMax = (deg: number) =>
  Math.floor(Math.min(5.5, 4.4 / Math.sin(deg * DEG), 5.4 / Math.cos(deg * DEG)) * 4) / 4

/** Polar snap for the top vertex: whole degrees, hypotenuse in quarters. */
const snapTop =
  (lockedDeg: number | null) =>
  ([x, y]: Vec2): Vec2 => {
    const deg = lockedDeg ?? clamp(Math.round(Math.atan2(y, x) / DEG), 5, 80)
    const c = Math.cos(deg * DEG)
    const s = Math.sin(deg * DEG)
    const raw = lockedDeg == null ? Math.hypot(x, y) : x * c + y * s
    const h = clamp(Math.round(raw * 4) / 4, 1, hMax(deg))
    return [h * c, h * s]
  }

const toPolar = ([x, y]: Vec2) => ({
  deg: Math.round(Math.atan2(y, x) / DEG),
  h: Math.round(Math.hypot(x, y) * 4) / 4,
})

/** A right triangle with the angle θ at the origin and the right angle on the x-axis. */
function RightTriangle({
  opp,
  adj,
  deg,
  labels,
}: {
  opp: number
  adj: number
  deg: number
  labels: boolean
}) {
  const B: Vec2 = [adj, opp]
  const C: Vec2 = [adj, 0]
  const box = Math.min(0.3, opp / 3, adj / 3)
  return (
    <>
      <Polygon points={[[0, 0], C, B]} fill={HYP} fillOpacity={0.08} />
      <Segment from={[0, 0]} to={C} color={ADJ} width={3} />
      <Segment from={C} to={B} color={OPP} width={3} />
      <Segment from={[0, 0]} to={B} color={HYP} width={3} />
      <Segment from={[adj - box, 0]} to={[adj - box, box]} color="var(--ink-3)" width={1.5} />
      <Segment from={[adj - box, box]} to={[adj, box]} color="var(--ink-3)" width={1.5} />
      <AngleArc center={[0, 0]} from={0} to={deg * DEG} radius={34} color={ANG} />
      <Label
        at={[0, 0]}
        anchor="left"
        offset={[42 * Math.cos((deg / 2) * DEG) + 2, -42 * Math.sin((deg / 2) * DEG)]}
        color={ANG}
      >
        θ
      </Label>
      {labels && (
        <>
          <Label at={[adj / 2, 0]} anchor="top" offset={[0, 20]} color={ADJ} className="text-xs">
            adj {formatNumber(adj)}
          </Label>
          <Label at={[adj, opp / 2]} anchor="left" offset={[6, 0]} color={OPP} className="text-xs">
            opp {formatNumber(opp)}
          </Label>
          <Label
            at={[adj / 2, opp / 2]}
            anchor="right"
            offset={[-8, -8]}
            color={HYP}
            className="text-xs"
          >
            hyp {formatNumber(Math.hypot(adj, opp))}
          </Label>
        </>
      )}
    </>
  )
}

export default function RightTriangleTrigLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="The angle fixes the shape">
        <Prose>
          <p>
            You can't climb a tree to measure it, but you can stand back, measure how far away you
            are, and measure the angle up to its top. That's enough, because in a right triangle{' '}
            <strong>the angle alone fixes the shape</strong>. Every right triangle with a 35° angle
            is the same triangle, just bigger or smaller.
          </p>
          <p>
            Same shape means the sides always come in the same <em>ratios</em>. Those ratios get
            names: <strong>sine</strong>, <strong>cosine</strong> and <strong>tangent</strong>. Look
            them up once (or let a calculator do it) and you can turn any angle into lengths.
          </p>
        </Prose>
      </LabSection>
      <RatioExplorer />
      <TreeExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="SOH CAH TOA">
        <Formula
          tex={
            '\\sin\\theta = \\frac{\\text{opp}}{\\text{hyp}} \\qquad \\cos\\theta = \\frac{\\text{adj}}{\\text{hyp}} \\qquad \\tan\\theta = \\frac{\\text{opp}}{\\text{adj}}'
          }
          caption="Sine is Opposite over Hypotenuse, Cosine is Adjacent over Hypotenuse, Tangent is Opposite over Adjacent."
        />
        <Prose>
          <p>
            Name the sides from the angle <Tex>{'\\theta'}</Tex>'s point of view: the{' '}
            <strong>hypotenuse</strong> is the longest side, across from the right angle; the{' '}
            <strong>opposite</strong> side is across from <Tex>{'\\theta'}</Tex>; the{' '}
            <strong>adjacent</strong> side is the other one touching <Tex>{'\\theta'}</Tex>.
          </p>
          <ul>
            <li>
              <strong>Find a side:</strong> multiply. A 10 m ramp at 30° rises{' '}
              <Tex>{'10 \\sin 30^\\circ = 10 \\times 0.5 = 5'}</Tex> m.
            </li>
            <li>
              <strong>Find an angle:</strong> undo the ratio with the inverse functions. If opp = 3
              and adj = 4, then <Tex>{'\\theta = \\tan^{-1}(3/4) \\approx 36.9^\\circ'}</Tex>.
            </li>
            <li>
              <strong>Worth knowing by heart:</strong> <Tex>{'\\sin 30^\\circ = \\tfrac12'}</Tex>{' '}
              (half an equilateral triangle) and <Tex>{'\\tan 45^\\circ = 1'}</Tex> (the two legs
              are equal).
            </li>
          </ul>
          <p>
            Because <Tex>{'\\text{opp}^2 + \\text{adj}^2 = \\text{hyp}^2'}</Tex>, dividing by{' '}
            <Tex>{'\\text{hyp}^2'}</Tex> gives <Tex>{'\\sin^2\\theta + \\cos^2\\theta = 1'}</Tex>,
            and dividing sine by cosine gives <Tex>{'\\tan\\theta'}</Tex>.
          </p>
        </Prose>
        <Callout kind="misconception" title="“Opposite” depends on where you stand">
          <p>
            Opposite and adjacent are not fixed sides of the triangle. Look from the other acute
            angle and they swap: the side that was opposite becomes adjacent. Always label the sides
            from the angle you are working with. (The hypotenuse never changes.)
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet sin, cos and tan">
        <RealWorld
          items={[
            {
              title: 'Surveying',
              body: 'The height of Everest was first worked out in the 1850s by sighting angles from known baselines, more than 100 km away.',
            },
            {
              title: 'Roads and roofs',
              body: 'A road’s gradient is $\\tan\\theta$: a 10% grade rises 1 m for every 10 m along. Roof pitch works the same way.',
            },
            {
              title: 'Games and graphics',
              body: 'To move a character 5 units in the direction it faces, a game adds $5\\cos\\theta$ to x and $5\\sin\\theta$ to y.',
            },
            {
              title: 'Forces',
              body: 'Pulling a sledge with a rope at an angle, only the $F\\cos\\theta$ part of the pull moves it forward.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'In a right triangle the angle fixes the shape, so it fixes the ratios of the sides.',
            'SOH CAH TOA: $\\sin = $ opp/hyp, $\\cos = $ adj/hyp, $\\tan = $ opp/adj.',
            'To find a side, multiply by the ratio; to find an angle, use $\\sin^{-1}$, $\\cos^{-1}$ or $\\tan^{-1}$.',
            'Label opposite and adjacent from the angle you are using.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function RatioExplorer() {
  const [tri, setTri] = useState({ deg: 35, h: 4.5 })
  const [lock, setLock] = useState<{ deg: number; h: number } | null>(null)
  const [resized, setResized] = useState(false)
  const t = tri.deg * DEG
  const opp = tri.h * Math.sin(t)
  const adj = tri.h * Math.cos(t)
  const move = (x: number, y: number) => {
    const next = toPolar([x, y])
    setTri(next)
    if (lock && Math.abs(next.h - lock.h) >= 1) setResized(true)
  }
  return (
    <LabSection id="explore" eyebrow="Explore" title="Same angle, same ratios">
      <Prose>
        <p>
          Drag the top corner to change the triangle. The readouts divide one side by another. Then
          lock the angle and drag again: now you can only make the triangle bigger or smaller.
        </p>
      </Prose>
      <PredictReveal
        question="Lock the angle and double every side of the triangle. What happens to $\sin\theta$ (opposite ÷ hypotenuse)?"
        options={['It doubles', 'It halves', 'It stays the same', 'It is squared']}
        answer={2}
        explanation="Both the opposite side and the hypotenuse double, so their ratio doesn't change. Sine depends only on the angle."
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 px-3 pt-3 sm:px-4">
          <Switch
            checked={lock != null}
            onChange={(on) => setLock(on ? tri : null)}
            label="Lock the angle"
          />
        </div>
        <div className="mx-auto w-full max-w-xl">
          <Plot
            view={{ xMin: -0.5, xMax: 6.1, yMin: -0.8, yMax: 4.8 }}
            aspect="equal"
            ariaLabel={`Right triangle with angle ${tri.deg} degrees and hypotenuse ${tri.h}`}
          >
            <RightTriangle opp={opp} adj={adj} deg={tri.deg} labels />
            <MovablePoint
              x={adj}
              y={opp}
              onMove={move}
              constrain={snapTop(lock?.deg ?? null)}
              color={HYP}
              label="Top corner of the triangle"
            />
          </Plot>
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'θ', value: `${tri.deg}°`, color: ANG },
              { label: 'sin θ = opp/hyp', value: fix(Math.sin(t)), color: OPP },
              { label: 'cos θ = adj/hyp', value: fix(Math.cos(t)), color: ADJ },
              { label: 'tan θ = opp/adj', value: fix(Math.tan(t)), color: HYP },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-same" when={resized}>
          Lock the angle, then make the triangle much bigger or smaller. Do the ratios move?
        </TryThis>
        <TryThis id="t-thirty-lab" when={tri.deg === 30}>
          Find the angle where the opposite side is exactly half the hypotenuse.
        </TryThis>
        <TryThis id="t-equal-lab" when={tri.deg === 45}>
          Make the two legs equal. What is <Tex>{'\\tan\\theta'}</Tex> there?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const TREE_H = 9
const EYE = 1.5
const AIM_R = 3

const snapAim = ([x, y]: Vec2): Vec2 => {
  const deg = clamp(Math.round((Math.atan2(y - EYE, x) / DEG) * 2) / 2, 1, 75)
  return [AIM_R * Math.cos(deg * DEG), EYE + AIM_R * Math.sin(deg * DEG)]
}

function TreeExplorer() {
  const [deg, setDeg] = useState(20)
  const [d, setD] = useState(12)
  const [hits, setHits] = useState<number[]>([])
  const t = deg * DEG
  const rise = d * Math.tan(t)
  const estimate = EYE + rise
  const onTop = Math.abs(estimate - TREE_H) < 0.2
  const record = (nextDeg: number, nextD: number) => {
    const ok = Math.abs(EYE + nextD * Math.tan(nextDeg * DEG) - TREE_H) < 0.2
    if (ok && !hits.includes(nextD)) setHits([...hits, nextD])
  }
  const far = 17
  return (
    <LabSection id="tree" eyebrow="Explore" title="Measure a tree without climbing it">
      <Prose>
        <p>
          You stand <Tex>{`d`}</Tex> metres from a tree, with your eyes 1.5 m above the ground. Drag
          the handle to aim your line of sight at the very top of the tree. The dashed right
          triangle has the angle at your eye, the distance as its adjacent side, and the part of the
          tree above eye level as its opposite side.
        </p>
      </Prose>
      <Figure>
        <div className="mx-auto w-full max-w-xl">
          <Plot
            view={{ xMin: -1, xMax: 17, yMin: -0.6, yMax: 10.6 }}
            aspect="equal"
            grid={false}
            axes={false}
            ariaLabel={`Sighting a tree ${d} metres away at an angle of ${deg} degrees`}
          >
            <Segment from={[-1, 0]} to={[17, 0]} color="var(--ink-3)" width={2} />
            <Segment from={[d, 0]} to={[d, 7.2]} color="var(--ink-3)" width={5} />
            <Circle
              center={[d, 7.9]}
              r={1.1}
              fill={TREE}
              fillOpacity={0.3}
              stroke={TREE}
              strokeWidth={2}
            />
            <Point at={[d, TREE_H]} r={4} color={TREE} />
            <Segment from={[0, 0]} to={[0, EYE]} color="var(--ink-2)" width={3} />
            <Segment from={[0, EYE]} to={[d, EYE]} color={ADJ} width={2} dashed />
            <Segment from={[d, EYE]} to={[d, EYE + rise]} color={OPP} width={2.5} dashed />
            <Segment
              from={[0, EYE]}
              to={[far, EYE + far * Math.tan(t)]}
              color={onTop ? 'var(--c-green)' : HYP}
              width={2}
            />
            <AngleArc center={[0, EYE]} from={0} to={t} radius={44} color={ANG} />
            <Label at={[d / 2, EYE]} anchor="top" offset={[0, 4]} color={ADJ} className="text-xs">
              d = {d} m
            </Label>
            <Label at={[0, EYE]} anchor="left" offset={[50, -10]} color={ANG} className="text-xs">
              {formatNumber(deg, 1)}°
            </Label>
            <MovablePoint
              x={AIM_R * Math.cos(t)}
              y={EYE + AIM_R * Math.sin(t)}
              onMove={(x, y) => {
                const next = Math.round((Math.atan2(y - EYE, x) / DEG) * 2) / 2
                setDeg(next)
                record(next, d)
              }}
              constrain={snapAim}
              color={HYP}
              label="Aim of the line of sight"
            />
          </Plot>
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:px-4">
          <Slider
            label="Distance to the tree d (m)"
            value={d}
            min={4}
            max={15}
            step={1}
            onChange={(v) => {
              setD(v)
              record(deg, v)
            }}
            color={ADJ}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'angle', value: `${formatNumber(deg, 1)}°`, color: ANG },
              { label: 'd × tan θ', value: `${formatNumber(rise, 2)} m`, color: OPP },
              {
                label: 'tree height = 1.5 + d tan θ',
                value: `${formatNumber(estimate, 2)} m${onTop ? '  ✓ on target' : ''}`,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-hit" when={hits.length > 0}>
          Aim exactly at the treetop. How tall is the tree?
        </TryThis>
        <TryThis id="t-two" when={hits.length >= 2}>
          Move to a different distance and aim again. Do you get the same height?
        </TryThis>
        <TryThis id="t-close" when={hits.some((h) => h <= 5)}>
          Stand 5 m or closer and hit the top. Is the angle bigger or smaller than from far away?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [top, setTop] = useState<Vec2>([3, 1])
  const [x, y] = top
  const hyp = Math.hypot(x, y)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-ramp"
          index={1}
          prompt="A ramp 10 m long makes an angle of $30^\circ$ with the ground. How high does it rise, in m?"
          answer={5}
          unit="m"
          explanation="Rise is opposite the angle and the ramp is the hypotenuse: $10 \sin 30^\circ = 10 \times 0.5 = 5$ m."
        />
        <NumericChallenge
          id="c-cos"
          index={2}
          prompt="A right triangle has legs 6 (next to $\theta$) and 8 (opposite $\theta$). What is $\cos\theta$?"
          answer={0.6}
          tolerance={0.001}
          hint="Find the hypotenuse with Pythagoras first."
          explanation="The hypotenuse is $\sqrt{6^2 + 8^2} = 10$, so $\cos\theta = \tfrac{\text{adj}}{\text{hyp}} = \tfrac{6}{10} = 0.6$."
        />
        <McqChallenge
          id="c-cos60-lab"
          index={3}
          prompt="What is $\cos 60^\circ$?"
          options={[
            { text: '$\\tfrac12$', correct: true },
            {
              text: '$\\tfrac{\\sqrt3}{2}$',
              why: 'That is $\\cos 30^\\circ$ (or $\\sin 60^\\circ$).',
            },
            { text: '$1$', why: 'That is $\\cos 0^\\circ$.' },
            { text: '$\\sqrt3$', why: 'That is $\\tan 60^\\circ$.' },
          ]}
          explanation="Cut an equilateral triangle in half: next to the $60^\circ$ angle is half a side, and the hypotenuse is a whole side."
        />
        <NumericChallenge
          id="c-ladder"
          index={4}
          prompt="A 5 m ladder leans against a wall, making $70^\circ$ with the ground. How high up the wall does it reach, in m?"
          answer={5 * Math.sin(70 * DEG)}
          tolerance={0.01}
          unit="m"
          explanation="Height is opposite the $70^\circ$ angle: $5 \sin 70^\circ \approx 5 \times 0.940 = 4.70$ m."
        />
        <NumericChallenge
          id="c-grade"
          index={5}
          prompt="A road climbs 1 m for every 10 m measured horizontally. What angle does it make with the horizontal, in degrees?"
          answer={Math.atan(0.1) / DEG}
          tolerance={0.05}
          unit="°"
          hint="You know opposite and adjacent, so use $\tan^{-1}$."
          explanation="$\theta = \tan^{-1}(1/10) \approx 5.71^\circ$. A 10% road is gentler than it sounds."
        />
        <InteractiveChallenge
          id="c-make"
          index={6}
          prompt="Drag the top corner to make a right triangle with hypotenuse 5 and $\tan\theta = \tfrac34$."
          solved={x === 4 && y === 3}
          hint="$\tan\theta = \tfrac34$ means opposite : adjacent = 3 : 4. Which multiple has hypotenuse 5?"
          explanation="Adjacent 4, opposite 3: the 3-4-5 triangle. $\tan\theta = 3/4$ and the hypotenuse is $\sqrt{16 + 9} = 5$."
          onReset={() => setTop([3, 1])}
        >
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-line">
            <Plot
              view={{ xMin: -0.5, xMax: 6.5, yMin: -0.5, yMax: 5.5 }}
              aspect="equal"
              ariaLabel={`Right triangle with legs ${x} and ${y}`}
            >
              <RightTriangle opp={y} adj={x} deg={Math.atan2(y, x) / DEG} labels={false} />
              <MovablePoint
                x={x}
                y={y}
                onMove={(nx, ny) => setTop([nx, ny])}
                constrain={constraints.compose(
                  constraints.snapToGrid(1),
                  constraints.within(1, 6, 1, 5),
                )}
                color={HYP}
                label="Top corner"
              />
            </Plot>
            <p className="border-t border-line px-3 py-2 text-sm">
              adj {x}, opp {y}, hyp {formatNumber(hyp, 2)}, tan θ = {formatNumber(y / x, 3)}
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

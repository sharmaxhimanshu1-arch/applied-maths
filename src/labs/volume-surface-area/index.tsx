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
import { Slider } from '@/ui/Slider'
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import { Circle, Label, Plot, Polygon, Segment } from '@/viz'

const FRONT = 'var(--c-blue)'
const TOP = 'var(--c-green)'
const SIDE = 'var(--c-orange)'
const CYL = 'var(--c-blue)'
const SPHERE = 'var(--c-orange)'
const CONE = 'var(--c-green)'

/** Oblique projection: depth goes up and to the right at half scale. */
const DX = 0.45
const DY = 0.32
const proj = (x: number, y: number, z: number): Vec2 => [x + z * DX, y + z * DY]

type Line = { from: Vec2; to: Vec2 }

/** Unit-cube grid lines on the three visible faces of an l × w × h box. */
function boxGrid(l: number, w: number, h: number): Line[] {
  const out: Line[] = []
  for (let i = 1; i < l; i++) {
    out.push({ from: proj(i, 0, 0), to: proj(i, h, 0) })
    out.push({ from: proj(i, h, 0), to: proj(i, h, w) })
  }
  for (let j = 1; j < h; j++) {
    out.push({ from: proj(0, j, 0), to: proj(l, j, 0) })
    out.push({ from: proj(l, j, 0), to: proj(l, j, w) })
  }
  for (let k = 1; k < w; k++) {
    out.push({ from: proj(0, h, k), to: proj(l, h, k) })
    out.push({ from: proj(l, 0, k), to: proj(l, h, k) })
  }
  return out
}

const rect = (x: number, y: number, w: number, h: number): Vec2[] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
]

function BoxPlot({ l, w, h, net }: { l: number; w: number; h: number; net: boolean }) {
  if (net) {
    // A cross-shaped net: the base l × w in the middle, sides around it, the lid above.
    const x0 = h
    const y0 = h
    return (
      <Plot
        view={{ xMin: -0.5, xMax: l + 2 * h + 0.5, yMin: -0.5, yMax: 2 * (w + h) + 0.5 }}
        aspect="equal"
        ariaLabel={`Net of a ${l} by ${w} by ${h} box`}
      >
        <Polygon
          points={rect(x0, y0, l, w)}
          fill={TOP}
          fillOpacity={0.35}
          stroke={TOP}
          strokeWidth={1.5}
        />
        <Polygon
          points={rect(x0, y0 + w, l, h)}
          fill={FRONT}
          fillOpacity={0.3}
          stroke={FRONT}
          strokeWidth={1.5}
        />
        <Polygon
          points={rect(x0, y0 + w + h, l, w)}
          fill={TOP}
          fillOpacity={0.35}
          stroke={TOP}
          strokeWidth={1.5}
        />
        <Polygon
          points={rect(x0, y0 - h, l, h)}
          fill={FRONT}
          fillOpacity={0.3}
          stroke={FRONT}
          strokeWidth={1.5}
        />
        <Polygon
          points={rect(x0 - h, y0, h, w)}
          fill={SIDE}
          fillOpacity={0.3}
          stroke={SIDE}
          strokeWidth={1.5}
        />
        <Polygon
          points={rect(x0 + l, y0, h, w)}
          fill={SIDE}
          fillOpacity={0.3}
          stroke={SIDE}
          strokeWidth={1.5}
        />
      </Plot>
    )
  }
  const front: Vec2[] = [proj(0, 0, 0), proj(l, 0, 0), proj(l, h, 0), proj(0, h, 0)]
  const top: Vec2[] = [proj(0, h, 0), proj(l, h, 0), proj(l, h, w), proj(0, h, w)]
  const side: Vec2[] = [proj(l, 0, 0), proj(l, 0, w), proj(l, h, w), proj(l, h, 0)]
  return (
    <Plot
      view={{ xMin: -0.6, xMax: 9.6, yMin: -0.6, yMax: 8.4 }}
      aspect="equal"
      grid={false}
      axes={false}
      ariaLabel={`A ${l} by ${w} by ${h} box`}
    >
      <Polygon points={front} fill={FRONT} fillOpacity={0.3} stroke={FRONT} strokeWidth={2} />
      <Polygon points={top} fill={TOP} fillOpacity={0.3} stroke={TOP} strokeWidth={2} />
      <Polygon points={side} fill={SIDE} fillOpacity={0.3} stroke={SIDE} strokeWidth={2} />
      {boxGrid(l, w, h).map((g, i) => (
        <Segment key={i} from={g.from} to={g.to} color="var(--ink-3)" width={1} opacity={0.6} />
      ))}
      <Label at={proj(l / 2, 0, 0)} anchor="top" offset={[0, 4]} className="text-xs">
        {l}
      </Label>
      <Label at={proj(0, h / 2, 0)} anchor="right" offset={[-4, 0]} className="text-xs">
        {h}
      </Label>
      <Label at={proj(l, 0, w / 2)} anchor="left" offset={[6, 4]} className="text-xs">
        {w}
      </Label>
    </Plot>
  )
}

export default function VolumeSurfaceAreaLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="How much inside, how much outside">
        <Prose>
          <p>
            Fill a box with sugar cubes and count them: that's its <strong>volume</strong>, the
            space inside. Wrap it in paper and measure the paper: that's its{' '}
            <strong>surface area</strong>, the total area of its faces.
          </p>
          <p>
            Like area and perimeter, they don't move together. Boxes with the same volume can need
            very different amounts of wrapping, and nature and industry are full of shapes chosen to
            get the balance right.
          </p>
        </Prose>
      </LabSection>
      <BoxExplorer />
      <ArchimedesExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Formulas">
        <Formula
          tex={'V_{\\text{box}} = lwh \\qquad S_{\\text{box}} = 2(lw + lh + wh)'}
          caption="Volume counts cubes in layers; surface area adds the six faces, which come in three matching pairs."
        />
        <Formula
          tex={
            'V_{\\text{cylinder}} = \\pi r^2 h \\qquad V_{\\text{cone}} = \\tfrac13 \\pi r^2 h \\qquad V_{\\text{sphere}} = \\tfrac43 \\pi r^3'
          }
          caption="A prism or cylinder is base area × height; a cone or pyramid is a third of that."
        />
        <Formula
          tex={
            'S_{\\text{cylinder}} = 2\\pi r^2 + 2\\pi r h \\qquad S_{\\text{sphere}} = 4\\pi r^2'
          }
          caption="A cylinder's curved side unrolls into a rectangle $2\pi r$ wide and $h$ tall."
        />
        <Callout kind="misconception" title="Volume grows much faster than surface area">
          <p>
            Double every length of a shape and its surface area becomes 4 times bigger, but its
            volume 8 times. That's why big animals overheat more easily and small ones lose heat
            fast: volume makes heat, surface area loses it.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Volume and surface in the world">
        <RealWorld
          items={[
            {
              title: 'Packaging',
              body: 'For a fixed volume, a box near a cube uses the least cardboard; a can whose height equals its diameter uses the least metal.',
            },
            {
              title: 'Cooking',
              body: 'Chopped potatoes cook faster than whole ones: same volume, much more surface for the heat to get in.',
            },
            {
              title: 'Biology',
              body: 'Cells stay small because nutrients enter through the surface but are used by the whole volume.',
            },
            {
              title: 'Archimedes',
              body: 'He was proudest of discovering that a sphere has exactly 2/3 the volume of the cylinder that wraps it, and asked for it on his tombstone.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Volume measures space inside (cubic units); surface area measures the outside (square units).',
            'Box: $V = lwh$, $S = 2(lw + lh + wh)$. Cylinder: $V = \\pi r^2 h$.',
            'Cone = $\\tfrac13$ cylinder; sphere = $\\tfrac23$ of the cylinder that wraps it.',
            'Scale by $k$: surface area $\\times k^2$, volume $\\times k^3$.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function BoxExplorer() {
  const [l, setL] = useState(3)
  const [w, setW] = useState(2)
  const [h, setH] = useState(2)
  const [net, setNet] = useState(false)
  const V = l * w * h
  const S = 2 * (l * w + l * h + w * h)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Stack the cubes, unfold the box">
      <Prose>
        <p>
          Set the length, width and height. The grid lines show the unit cubes; switch to the net to
          see the six faces laid flat. Compare boxes with the same volume but different shapes.
        </p>
      </Prose>
      <PredictReveal
        question="A $2 \times 3 \times 4$ box and a $1 \times 4 \times 6$ box both hold 24 cubes. Which needs more wrapping paper?"
        options={[
          'The $2 \\times 3 \\times 4$ box',
          'The $1 \\times 4 \\times 6$ box',
          'They need the same',
        ]}
        answer={1}
        explanation="$1 \times 4 \times 6$: $2(4 + 6 + 24) = 68$ against $2(6 + 8 + 12) = 52$. The flatter box has more surface."
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3 sm:px-4">
          <Switch checked={net} onChange={setNet} label="Unfold into a net" />
        </div>
        <div className="mx-auto w-full max-w-lg">
          <BoxPlot l={l} w={w} h={h} net={net} />
        </div>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-3 sm:p-4">
          <Slider
            label="Length l"
            value={l}
            min={1}
            max={6}
            step={1}
            onChange={setL}
            color={FRONT}
          />
          <Slider label="Width w" value={w} min={1} max={6} step={1} onChange={setW} color={SIDE} />
          <Slider label="Height h" value={h} min={1} max={6} step={1} onChange={setH} color={TOP} />
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'volume', value: `${V} cubes` },
              { label: 'surface area', value: `${S} squares` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-cube" when={V === 27 && l === w && w === h}>
          Build a cube with volume 27. What is its surface area?
        </TryThis>
        <TryThis id="t-least" when={V === 24 && S === 52}>
          Make a box of volume 24 with the least possible surface area.
        </TryThis>
        <TryThis id="t-net" when={net}>
          Unfold the box into a net. Which faces come in matching pairs?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function ArchimedesExplorer() {
  const [r, setR] = useState(1.5)
  const [seen, setSeen] = useState<number[]>([1.5])
  const h = 2 * r
  const vCyl = Math.PI * r * r * h
  const vCone = vCyl / 3
  const vSphere = (4 / 3) * Math.PI * r ** 3
  return (
    <LabSection id="archimedes" eyebrow="Explore" title="Cone, sphere, cylinder: 1 : 2 : 3">
      <Prose>
        <p>
          A sphere fits snugly inside a cylinder (height = diameter), and so does a cone with the
          same base and height. Their volumes come in a perfect ratio, whatever the size. Change the
          radius and check.
        </p>
      </Prose>
      <Figure>
        <div className="mx-auto w-full max-w-md">
          <Plot
            view={{ xMin: -3.3, xMax: 3.3, yMin: -0.4, yMax: 6.4 }}
            aspect="equal"
            grid={false}
            axes={false}
            ariaLabel={`Side view: cylinder, sphere and cone of radius ${r}`}
          >
            <Polygon
              points={rect(-r, 0, 2 * r, h)}
              fill={CYL}
              fillOpacity={0.12}
              stroke={CYL}
              strokeWidth={2}
            />
            <Polygon
              points={[
                [-r, 0],
                [r, 0],
                [0, h],
              ]}
              fill={CONE}
              fillOpacity={0.25}
              stroke={CONE}
              strokeWidth={2}
            />
            <Circle
              center={[0, r]}
              r={r}
              fill={SPHERE}
              fillOpacity={0.18}
              stroke={SPHERE}
              strokeWidth={2}
            />
          </Plot>
        </div>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label="Radius r"
            value={r}
            min={0.5}
            max={3}
            step={0.25}
            onChange={(v) => {
              setR(v)
              setSeen((s) => (s.includes(v) ? s : [...s, v]))
            }}
            color={SPHERE}
          />
          <Readouts
            items={[
              { label: 'cone', value: formatNumber(vCone, 3), color: CONE },
              { label: 'sphere', value: formatNumber(vSphere, 3), color: SPHERE },
              { label: 'cylinder', value: formatNumber(vCyl, 3), color: CYL },
              {
                label: 'ratio',
                value: `1 : ${formatNumber(vSphere / vCone, 3)} : ${formatNumber(vCyl / vCone, 3)}`,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-ratio" when={seen.length >= 3}>
          Try three different radii. Does the 1 : 2 : 3 ratio ever change?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [l, setL] = useState(2)
  const [w, setW] = useState(2)
  const [h, setH] = useState(2)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-cube-v"
          index={1}
          prompt="What is the volume of a cube with side 3?"
          answer={27}
          explanation="$3 \times 3 \times 3 = 27$."
        />
        <NumericChallenge
          id="c-cube-s"
          index={2}
          prompt="What is the surface area of a cube with side 3?"
          answer={54}
          explanation="Six faces of $3 \times 3 = 9$: $6 \times 9 = 54$."
        />
        <NumericChallenge
          id="c-cylinder"
          index={3}
          prompt="Find the volume of a cylinder with radius 2 and height 5. (Decimals are fine.)"
          answer={20 * Math.PI}
          tolerance={0.1}
          explanation="$\pi \cdot 2^2 \cdot 5 = 20\pi \approx 62.83$."
        />
        <McqChallenge
          id="c-scale"
          index={4}
          prompt="Every length of a box is doubled. Its volume is multiplied by…"
          options={[
            { text: '8', correct: true },
            { text: '2', why: 'That is the length.' },
            { text: '4', why: 'That is the surface area.' },
            { text: '6', why: 'Volume scales by $2^3$.' },
          ]}
          explanation="$(2l)(2w)(2h) = 8\,lwh$."
        />
        <InteractiveChallenge
          id="c-36"
          index={5}
          prompt="Set whole-number sides so the box holds exactly 36 cubes."
          solved={l * w * h === 36}
          hint="Factor 36 into three whole numbers, each at most 6."
          explanation="For example $3 \times 3 \times 4$ or $2 \times 3 \times 6$: both make 36."
          onReset={() => {
            setL(2)
            setW(2)
            setH(2)
          }}
        >
          <div className="grid gap-3 rounded-xl border border-line p-3">
            <div className="mx-auto w-full max-w-sm">
              <BoxPlot l={l} w={w} h={h} net={false} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Slider
                label="Length"
                value={l}
                min={1}
                max={6}
                step={1}
                onChange={setL}
                color={FRONT}
              />
              <Slider
                label="Width"
                value={w}
                min={1}
                max={6}
                step={1}
                onChange={setW}
                color={SIDE}
              />
              <Slider
                label="Height"
                value={h}
                min={1}
                max={6}
                step={1}
                onChange={setH}
                color={TOP}
              />
            </div>
            <p className="text-sm">
              Volume: <Tex>{`${l} \\times ${w} \\times ${h} = ${l * w * h}`}</Tex>
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

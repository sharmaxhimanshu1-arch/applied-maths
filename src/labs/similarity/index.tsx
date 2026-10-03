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
import { Tex } from '@/ui/Tex'
import { AngleArc, Label, MovablePoint, Plot, Point, Polygon, Segment, constraints } from '@/viz'
import { DEG, dist, signedArea } from '../_shared/geometry'

const ORIGINAL = 'var(--c-blue)'
const IMAGE = 'var(--c-orange)'
const CENTRE = 'var(--c-violet)'
const SUN = 'var(--c-yellow)'
const SHADOW = 'var(--ink-3)'

const SHAPE: Vec2[] = [
  [1, 0.5],
  [2.5, 0.5],
  [1.5, 2],
]

const scaleFrom = (o: Vec2, k: number, p: Vec2): Vec2 => [
  o[0] + k * (p[0] - o[0]),
  o[1] + k * (p[1] - o[1]),
]
const perimeter = (pts: readonly Vec2[]) =>
  pts.reduce((s, p, i) => s + dist(p, pts[(i + 1) % pts.length]), 0)

function DilationPlot({
  k,
  o,
  onO,
  label,
}: {
  k: number
  o: Vec2
  onO?: (p: Vec2) => void
  label: string
}) {
  const image = SHAPE.map((p) => scaleFrom(o, k, p))
  return (
    <Plot view={{ xMin: -3, xMax: 8, yMin: -2.5, yMax: 6.5 }} aspect="equal" ariaLabel={label}>
      {image.map((p, i) => (
        <Segment key={i} from={o} to={k >= 1 ? p : SHAPE[i]} color={CENTRE} width={1} dashed />
      ))}
      <Polygon
        points={SHAPE}
        fill={ORIGINAL}
        fillOpacity={0.25}
        stroke={ORIGINAL}
        strokeWidth={2.5}
      />
      <Polygon points={image} fill={IMAGE} fillOpacity={0.2} stroke={IMAGE} strokeWidth={2.5} />
      {onO ? (
        <MovablePoint
          x={o[0]}
          y={o[1]}
          onMove={(x, y) => onO([x, y])}
          constrain={constraints.compose(
            constraints.snapToGrid(0.5),
            constraints.within(-2.5, 3, -2, 3),
          )}
          step={0.5}
          color={CENTRE}
          label="Centre of the enlargement"
        />
      ) : (
        <Point at={o} r={5} color={CENTRE} />
      )}
    </Plot>
  )
}

export default function SimilarityLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Same shape, different size">
        <Prose>
          <p>
            A photo and its enlargement, a map and the land, a model car and the real one: each pair
            has the same <em>shape</em> at a different <em>size</em>. Shapes like that are{' '}
            <strong>similar</strong>. Every length is multiplied by the same{' '}
            <strong>scale factor</strong>, while every angle stays exactly as it was.
          </p>
          <p>
            That simple fact lets you measure things you can't reach: the height of a tree from its
            shadow, the width of a river, the distance to the Moon.
          </p>
        </Prose>
      </LabSection>
      <DilationExplorer />
      <ShadowExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Scale factors">
        <Formula
          tex={"\\frac{a'}{a} = \\frac{b'}{b} = \\frac{c'}{c} = k \\qquad \\text{angles unchanged}"}
          caption="Similar shapes: every length scaled by the same $k$."
        />
        <Formula
          tex={
            '\\text{perimeter} \\times k \\qquad \\text{area} \\times k^2 \\qquad \\text{volume} \\times k^3'
          }
          caption="Lengths scale by $k$, areas by $k^2$ (scaled in two directions), volumes by $k^3$."
        />
        <Prose>
          <p>
            Two triangles are similar as soon as two of their angles match (the third must match
            too, since they all add to <Tex>{'180^\\circ'}</Tex>). That's why sunlight, which hits
            the stick and the tree at the same angle, makes similar triangles.
          </p>
        </Prose>
        <Callout kind="misconception" title="Double the size, double the area? No">
          <p>
            Scale a shape by 2 and its area grows by 4; by 3 and it grows by 9. A photo enlarged to
            twice the width needs four times the paper.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Scaling at work">
        <RealWorld
          items={[
            {
              title: 'Maps and plans',
              body: 'On a 1 : 50 000 map, 1 cm stands for 500 m, in every direction. Areas shrink by $50\\,000^2$.',
            },
            {
              title: 'Measuring the unreachable',
              body: 'Thales is said to have measured a pyramid’s height by comparing its shadow with the shadow of a stick.',
            },
            {
              title: 'Why giants can’t exist',
              body: 'Scale an animal by 10 and its weight grows 1000× but its bones’ cross-section only 100×: big animals need thicker legs.',
            },
            {
              title: 'Cameras',
              body: 'A lens makes a small image similar to the scene: the same angles, scaled down onto the sensor.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Similar shapes have equal angles and all lengths scaled by the same factor $k$.',
            'Perimeters scale by $k$, areas by $k^2$, volumes by $k^3$.',
            'Two equal angles are enough to make two triangles similar.',
            'Matching ratios let you find lengths you can’t measure directly.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function DilationExplorer() {
  const [k, setK] = useState(1.5)
  const [o, setO] = useState<Vec2>([-1.5, -1])
  const image = SHAPE.map((p) => scaleFrom(o, k, p))
  const pRatio = perimeter(image) / perimeter(SHAPE)
  const aRatio = signedArea(image) / signedArea(SHAPE)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Enlarge from a centre">
      <Prose>
        <p>
          The orange triangle is the blue one enlarged from the violet centre: every corner is
          pushed <Tex>k</Tex> times as far along its ray. Change the scale factor and move the
          centre. What happens to the lengths, the angles and the area?
        </p>
      </Prose>
      <PredictReveal
        question="Scale the triangle by $k = 3$. How many times bigger is its area?"
        options={['3', '6', '9', '27']}
        answer={2}
        explanation="$3^2 = 9$. The triangle is 3 times wider and 3 times taller."
      />
      <Figure>
        <DilationPlot
          k={k}
          o={o}
          onO={setO}
          label={`Triangle enlarged by ${k}: area ${formatNumber(aRatio, 2)} times`}
        />
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label={<Tex>k</Tex>}
            name="Scale factor k"
            value={k}
            min={0.25}
            max={3}
            step={0.25}
            onChange={setK}
            color={IMAGE}
          />
          <Readouts
            items={[
              { label: 'side ratio', value: formatNumber(k, 2), color: IMAGE },
              { label: 'perimeter ratio', value: formatNumber(pRatio, 2) },
              { label: 'area ratio', value: formatNumber(aRatio, 4) },
              { label: 'angles', value: 'unchanged' },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-two" when={k === 2}>
          Set <Tex>k = 2</Tex>. How many copies of the blue triangle would fit in the orange one?
        </TryThis>
        <TryThis id="t-shrink" when={k < 1}>
          Make <Tex>k</Tex> less than 1. What kind of “enlargement” is that?
        </TryThis>
        <TryThis id="t-centre" when={dist(o, [-1.5, -1]) > 2}>
          Move the centre a long way. Does the shape or size of the image change, or only its
          position?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const TREE = 6
const STICK = 1

function ShadowExplorer() {
  const [elev, setElev] = useState(35)
  const t = Math.tan(elev * DEG)
  const stickShadow = STICK / t
  const treeShadow = TREE / t
  const view = { xMin: -1, xMax: 18, yMin: -1.2, yMax: 8 }
  return (
    <LabSection id="shadows" eyebrow="Explore" title="Measure a tree with a stick">
      <Prose>
        <p>
          Sunlight hits a 1 m stick and a tree at the same angle, so their shadows make two similar
          triangles. Change the sun's height: both shadows change, but <em>height ÷ shadow</em> is
          always the same for both.
        </p>
      </Prose>
      <Figure>
        <Plot
          view={view}
          height={260}
          grid={false}
          ariaLabel={`Sun at ${elev} degrees: stick shadow ${formatNumber(stickShadow, 2)}, tree shadow ${formatNumber(treeShadow, 2)}`}
        >
          <Segment from={[-1, 0]} to={[18, 0]} color="var(--ink-3)" width={1.5} />
          {treeShadow < 18 && (
            <Segment from={[0, TREE]} to={[treeShadow, 0]} color={SUN} width={1.5} dashed />
          )}
          <Segment from={[0, 0]} to={[Math.min(treeShadow, 18), 0]} color={SHADOW} width={6} />
          <Segment from={[0, 0]} to={[0, TREE]} color="var(--c-green)" width={6} />
          <Segment from={[2, 0]} to={[2, STICK]} color={IMAGE} width={4} />
          <Segment from={[2, STICK]} to={[2 + stickShadow, 0]} color={SUN} width={1.5} dashed />
          <Segment from={[2, 0]} to={[2 + stickShadow, 0]} color={IMAGE} width={3} opacity={0.5} />
          {treeShadow < 18 && (
            <AngleArc
              center={[treeShadow, 0]}
              from={Math.PI - elev * DEG}
              to={Math.PI}
              radius={30}
              color={SUN}
            />
          )}
          <Label at={[0, TREE]} anchor="bottom" offset={[0, -4]} className="text-xs">
            tree {TREE} m
          </Label>
          <Label at={[2, STICK]} anchor="bottom" offset={[0, -4]} className="text-xs">
            stick 1 m
          </Label>
        </Plot>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label="Sun's height above the horizon"
            value={elev}
            min={20}
            max={70}
            step={1}
            onChange={setElev}
            format={(v) => `${v}°`}
            color={SUN}
          />
          <Readouts
            items={[
              { label: 'stick shadow', value: `${formatNumber(stickShadow, 2)} m`, color: IMAGE },
              { label: 'tree shadow', value: `${formatNumber(treeShadow, 2)} m`, color: SHADOW },
              {
                label: 'tree shadow ÷ stick shadow',
                value: formatNumber(treeShadow / stickShadow, 3),
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-45" when={elev === 45}>
          Set the sun to 45°. What do you notice about each shadow and its height?
        </TryThis>
        <TryThis id="t-ratio" when={elev <= 25}>
          Lower the sun to 25° or less. The shadows grow, but does their ratio change?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [k, setK] = useState(1)
  const area = k * k
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-side"
          index={1}
          prompt="A triangle with sides 3, 4, 5 is enlarged so the shortest side becomes 6. How long does the side of length 4 become?"
          answer={8}
          explanation="The scale factor is $6 / 3 = 2$, so $4 \times 2 = 8$."
        />
        <McqChallenge
          id="c-area"
          index={2}
          prompt="A shape is enlarged by scale factor 3. Its area is multiplied by…"
          options={[
            { text: '9', correct: true },
            { text: '3', why: 'That is what happens to lengths and perimeter.' },
            { text: '6', why: 'Areas scale by $k^2$, not $2k$.' },
            { text: '27', why: 'That is volume, $k^3$.' },
          ]}
          explanation="Area scales by $k^2 = 9$."
        />
        <NumericChallenge
          id="c-shadow"
          index={3}
          prompt="A 2 m pole casts a 3 m shadow. At the same moment a building casts a 30 m shadow. How tall is the building, in m?"
          answer={20}
          explanation="Same sun angle, similar triangles: $\dfrac{h}{30} = \dfrac{2}{3}$, so $h = 20$ m."
        />
        <McqChallenge
          id="c-aa"
          index={4}
          prompt="Two triangles both have angles of $40^\circ$ and $75^\circ$. What can you say?"
          options={[
            { text: 'They are similar', correct: true },
            {
              text: 'They are identical (congruent)',
              why: 'Same shape, but they could be different sizes.',
            },
            {
              text: 'Nothing without the sides',
              why: 'Two matching angles are enough for similarity.',
            },
            { text: 'They have the same area', why: 'One may be a scaled-up copy of the other.' },
          ]}
          explanation="The third angles are both $65^\circ$, so all angles match: the triangles are similar."
        />
        <InteractiveChallenge
          id="c-four"
          index={5}
          prompt="Choose the scale factor that makes the orange triangle's area exactly 4 times the blue one's."
          solved={Math.abs(area - 4) < 1e-9}
          hint="Area grows by $k^2$."
          explanation="$k = 2$: $2^2 = 4$."
          onReset={() => setK(1)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <DilationPlot k={k} o={[-1.5, -1]} label={`Triangle enlarged by ${k}`} />
            <div className="grid gap-2 border-t border-line p-3">
              <Slider
                label={<Tex>k</Tex>}
                name="Scale factor k"
                value={k}
                min={0.25}
                max={3}
                step={0.25}
                onChange={setK}
                color={IMAGE}
              />
              <p className="text-sm">
                Area ratio: <span className="font-mono">{formatNumber(area, 4)}</span>
              </p>
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

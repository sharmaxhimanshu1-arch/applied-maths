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
import { Tex } from '@/ui/Tex'
import { Label, MovablePoint, Plot, Polygon, Segment, constraints } from '@/viz'
import { dist } from '../_shared/geometry'

const FILL = 'var(--c-blue)'
const EDGE = 'var(--c-orange)'
const CUT = 'var(--c-green)'
const HEIGHT = 'var(--c-magenta)'

/** Unit-square grid lines inside a w × h rectangle, so the area can be counted. */
function UnitGrid({ w, h }: { w: number; h: number }) {
  const lines = [
    ...Array.from({ length: Math.max(0, w - 1) }, (_, i) => ({
      from: [i + 1, 0] as Vec2,
      to: [i + 1, h] as Vec2,
    })),
    ...Array.from({ length: Math.max(0, h - 1) }, (_, i) => ({
      from: [0, i + 1] as Vec2,
      to: [w, i + 1] as Vec2,
    })),
  ]
  return (
    <>
      {lines.map((l, i) => (
        <Segment key={i} from={l.from} to={l.to} color={FILL} width={1} opacity={0.5} />
      ))}
    </>
  )
}

const rect = (w: number, h: number): Vec2[] => [
  [0, 0],
  [w, 0],
  [w, h],
  [0, h],
]

export default function AreaPerimeterLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Fence or field?">
        <Prose>
          <p>
            A farmer can ask two different questions about a field. How much fence goes round it?
            That's the <strong>perimeter</strong>: a length, the distance around the edge. How much
            grass is inside? That's the <strong>area</strong>: how many unit squares it takes to
            cover it.
          </p>
          <p>
            They sound similar, but they behave very differently. Two fields with the same fence can
            hold very different amounts of grass, and squashing a shape can change one without the
            other.
          </p>
        </Prose>
      </LabSection>
      <RectangleExplorer />
      <ShearExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Formulas from counting">
        <Formula
          tex={'A_{\\text{rectangle}} = w \\times h \\qquad P_{\\text{rectangle}} = 2(w + h)'}
          caption="Area counts unit squares: $w$ in each row, $h$ rows. Perimeter adds the four sides."
        />
        <Formula
          tex={
            'A_{\\text{parallelogram}} = b \\times h \\qquad A_{\\text{triangle}} = \\tfrac12\\, b \\times h'
          }
          caption="Slice a triangle off one end of a parallelogram and slide it to the other: it becomes a rectangle. A triangle is half a parallelogram."
        />
        <Prose>
          <p>
            Here <Tex>h</Tex> is always the <em>perpendicular</em> height, measured at right angles
            to the base, not the slanted side. Area is measured in square units (cm², m²); perimeter
            in plain units (cm, m).
          </p>
        </Prose>
        <Callout kind="misconception" title="Same perimeter doesn't mean same area">
          <p>
            A 1 × 9 rectangle and a 5 × 5 square both have perimeter 20, but areas 9 and 25. For a
            fixed perimeter, the closer a rectangle is to a square, the more it encloses.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you meet it">
        <RealWorld
          items={[
            {
              title: 'Home improvement',
              body: 'Paint and carpet are sold by area; skirting board and fencing by length (perimeter).',
            },
            {
              title: 'Land and property',
              body: 'House sizes are quoted in square metres or square feet: area, not perimeter.',
            },
            {
              title: 'Biology',
              body: 'Cells, lungs and intestines pack in huge surface area with folds, while the outline stays small.',
            },
            {
              title: 'Packaging',
              body: 'A square-ish shape needs the least edge material for a given area, which is why many boxes and plots are close to square.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Perimeter is a length around the edge; area counts unit squares inside.',
            'Rectangle: $A = wh$, $P = 2(w + h)$. Parallelogram: $A = bh$. Triangle: $A = \\tfrac12 bh$.',
            'Use the perpendicular height, not the slanted side.',
            'Equal perimeters can enclose very different areas; squares enclose the most.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function RectangleExplorer() {
  const [corner, setCorner] = useState<Vec2>([3, 2])
  const [w, h] = corner
  const area = w * h
  const perim = 2 * (w + h)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Count the squares, walk the edge">
      <Prose>
        <p>
          Drag the corner to resize the rectangle. Each little square is one square unit. Watch how
          the area (squares inside) and the perimeter (steps around the edge) change, and notice
          when one changes but the other doesn't.
        </p>
      </Prose>
      <PredictReveal
        question="A $1 \times 12$ strip and a $3 \times 4$ rectangle both have area 12. Which has the longer perimeter?"
        options={['The $1 \\times 12$ strip', 'The $3 \\times 4$ rectangle', 'They are equal']}
        answer={0}
        explanation="The strip: $2(1 + 12) = 26$ against $2(3 + 4) = 14$. Long thin shapes have a lot of edge for little inside."
      />
      <Figure>
        <Plot
          view={{ xMin: -0.6, xMax: 12.6, yMin: -0.6, yMax: 8.6 }}
          aspect="equal"
          ariaLabel={`A ${w} by ${h} rectangle: area ${area}, perimeter ${perim}`}
        >
          <Polygon
            points={rect(w, h)}
            fill={FILL}
            fillOpacity={0.18}
            stroke={EDGE}
            strokeWidth={3}
          />
          <UnitGrid w={w} h={h} />
          <Label at={[w / 2, 0]} anchor="top" offset={[0, 6]} color={EDGE} className="text-xs">
            {w}
          </Label>
          <Label at={[0, h / 2]} anchor="right" offset={[-6, 0]} color={EDGE} className="text-xs">
            {h}
          </Label>
          <MovablePoint
            x={w}
            y={h}
            onMove={(x, y) => setCorner([x, y])}
            constrain={constraints.compose(
              constraints.snapToGrid(1),
              constraints.within(1, 12, 1, 8),
            )}
            step={1}
            color={EDGE}
            label="Corner of the rectangle"
          />
        </Plot>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'area', value: `${area} squares`, color: FILL },
              { label: 'perimeter', value: `${perim} units`, color: EDGE },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-twelve" when={area === 12 && perim === 14}>
          Make a rectangle with area 12 and perimeter 14.
        </TryThis>
        <TryThis id="t-long" when={area === 12 && perim === 26}>
          Keep the area at 12 but make the perimeter as long as you can.
        </TryThis>
        <TryThis id="t-square" when={perim === 16 && area === 16}>
          With perimeter 16, find the rectangle with the biggest area. What shape is it?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const BASE = 6
const H = 3

function ShearExplorer() {
  const [shift, setShift] = useState(0)
  const pts: Vec2[] = [
    [0, 0],
    [BASE, 0],
    [BASE + shift, H],
    [shift, H],
  ]
  const side = dist([0, 0], [shift, H])
  const perim = 2 * (BASE + side)
  return (
    <LabSection id="shear" eyebrow="Explore" title="Slide the top: area stays, perimeter grows">
      <Prose>
        <p>
          Drag the top edge sideways. The rectangle leans into a parallelogram. The green triangle
          shows the slice that moves from one end to the other, so the area is still{' '}
          <Tex>{'b \\times h'}</Tex>. But the slanted sides get longer.
        </p>
      </Prose>
      <Figure>
        <Plot
          view={{ xMin: -4.5, xMax: 10.5, yMin: -0.8, yMax: 4.4 }}
          aspect="equal"
          ariaLabel={`Parallelogram with base ${BASE}, height ${H}, area ${BASE * H}, perimeter ${formatNumber(perim, 2)}`}
        >
          <Polygon points={pts} fill={FILL} fillOpacity={0.2} stroke={EDGE} strokeWidth={2.5} />
          {shift !== 0 && (
            <>
              <Polygon
                points={[
                  [0, 0],
                  [shift, H],
                  [0, H],
                ]}
                fill={CUT}
                fillOpacity={0.35}
                stroke={CUT}
                strokeWidth={1.5}
                dashed
              />
              <Polygon
                points={[
                  [BASE, 0],
                  [BASE + shift, H],
                  [BASE, H],
                ]}
                fill={CUT}
                fillOpacity={0.35}
                stroke={CUT}
                strokeWidth={1.5}
                dashed
              />
            </>
          )}
          <Segment
            from={[shift > 0 ? BASE : 0, 0]}
            to={[shift > 0 ? BASE : 0, H]}
            color={HEIGHT}
            width={2}
            dashed
          />
          <Label
            at={[shift > 0 ? BASE : 0, H / 2]}
            anchor={shift > 0 ? 'left' : 'right'}
            offset={[shift > 0 ? 6 : -6, 0]}
            color={HEIGHT}
            className="text-xs"
          >
            h = {H}
          </Label>
          <Label at={[BASE / 2, 0]} anchor="top" offset={[0, 6]} className="text-xs">
            b = {BASE}
          </Label>
          <MovablePoint
            x={shift + BASE / 2}
            y={H}
            onMove={(x) => setShift(x - BASE / 2)}
            constrain={constraints.compose(
              constraints.horizontal(H),
              constraints.snapToGrid(0.5),
              constraints.within(BASE / 2 - 4, BASE / 2 + 4, H, H),
            )}
            step={0.5}
            color={EDGE}
            label="Top edge of the parallelogram"
          />
        </Plot>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'area b × h', value: String(BASE * H), color: FILL },
              { label: 'slanted side', value: formatNumber(side, 2), color: EDGE },
              { label: 'perimeter', value: formatNumber(perim, 2), color: EDGE },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-lean" when={Math.abs(shift) >= 3}>
          Lean the top 3 or more units sideways. Did the area change? Did the perimeter?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [corner, setCorner] = useState<Vec2>([8, 2])
  const [w, h] = corner
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-area-lab"
          index={1}
          prompt="What is the area of a $7 \times 5$ rectangle?"
          answer={35}
          explanation="7 squares in each of 5 rows: $7 \times 5 = 35$ square units."
        />
        <NumericChallenge
          id="c-perimeter-lab"
          index={2}
          prompt="What is the perimeter of a $7 \times 5$ rectangle?"
          answer={24}
          explanation="$2(7 + 5) = 24$ units."
        />
        <NumericChallenge
          id="c-triangle"
          index={3}
          prompt="A triangle has base 10 and perpendicular height 6. What is its area?"
          answer={30}
          explanation="Half the parallelogram: $\tfrac12 \times 10 \times 6 = 30$."
        />
        <McqChallenge
          id="c-double-lab"
          index={4}
          prompt="You double the side of a square. What happens to its area?"
          options={[
            { text: 'It is multiplied by 4', correct: true },
            { text: 'It doubles', why: 'That is what happens to the perimeter.' },
            { text: 'It is multiplied by 8', why: 'That is volume, for a cube.' },
            { text: 'It stays the same', why: 'A bigger square covers more squares.' },
          ]}
          explanation="$(2s)^2 = 4s^2$: twice as many squares in each row, and twice as many rows."
        />
        <InteractiveChallenge
          id="c-best"
          index={5}
          prompt="Drag the corner to make the rectangle with perimeter 20 and the largest possible area."
          solved={w === 5 && h === 5}
          hint="For a fixed perimeter, the closer to a square, the more area."
          explanation="A $5 \times 5$ square: perimeter 20, area 25. Any other $w + h = 10$ rectangle has less."
          onReset={() => setCorner([8, 2])}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <Plot
              view={{ xMin: -0.6, xMax: 10.6, yMin: -0.6, yMax: 7.6 }}
              aspect="equal"
              ariaLabel={`A ${w} by ${h} rectangle`}
            >
              <Polygon
                points={rect(w, h)}
                fill={FILL}
                fillOpacity={0.18}
                stroke={EDGE}
                strokeWidth={2.5}
              />
              <UnitGrid w={w} h={h} />
              <MovablePoint
                x={w}
                y={h}
                onMove={(x, y) => setCorner([x, y])}
                constrain={constraints.compose(
                  constraints.snapToGrid(1),
                  constraints.within(1, 10, 1, 7),
                )}
                step={1}
                color={EDGE}
                label="Corner of the rectangle"
              />
            </Plot>
            <p className="border-t border-line px-3 py-2 text-sm">
              {w} × {h}: perimeter {2 * (w + h)}, area {w * h}
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

import { useState } from 'react'
import type { Vec2 } from '@/math/linalg'
import { Readouts } from '@/learn/blocks'
import { Tex } from '@/ui/Tex'
import { Label, MovablePoint, Plot, Polygon, Polyline } from '@/viz'
import { useReport } from '../useReport'
import { COLORS, fmt } from './shared'
import type { GeometryBoardState } from './types'

const MAX = 8

export function PythagorasMode({
  a: a0 = 3,
  b: b0 = 2,
  onState,
}: {
  a?: number
  b?: number
  onState: (s: GeometryBoardState) => void
}) {
  const [a, setA] = useState(a0)
  const [b, setB] = useState(b0)
  const c = Math.hypot(a, b)
  useReport<GeometryBoardState>({ mode: 'pythagoras', a, b, c }, onState)
  const B: Vec2 = [a, 0]
  const C: Vec2 = [0, b]
  // The square on the hypotenuse sits on the far side, away from the right angle.
  const out: Vec2 = [b, a]
  const sqA: Vec2[] = [[0, 0], B, [a, -a], [0, -a]]
  const sqB: Vec2[] = [[0, 0], C, [-b, b], [-b, 0]]
  const sqC: Vec2[] = [B, C, [C[0] + out[0], C[1] + out[1]], [B[0] + out[0], B[1] + out[1]]]
  const centre = (pts: Vec2[]): Vec2 => [
    pts.reduce((s, p) => s + p[0], 0) / 4,
    pts.reduce((s, p) => s + p[1], 0) / 4,
  ]
  // Zoom out only once a leg is long enough to need it.
  const zoom = Math.max(a, b) <= 4 ? 4.5 : MAX
  const whole = Number.isInteger(Math.round(c * 1e9) / 1e9)
  return (
    <>
      <div className="mx-auto w-full max-w-xl">
        <Plot
          view={{
            xMin: -zoom - 0.5,
            xMax: 2 * zoom + 0.5,
            yMin: -zoom - 0.5,
            yMax: 2 * zoom + 0.5,
          }}
          aspect="equal"
          axes={false}
          ariaLabel={`Right triangle with legs ${a} and ${b}; squares of area ${a * a}, ${b * b} and ${fmt(c * c)}`}
        >
          <Polygon
            points={sqA}
            fill={COLORS.a}
            fillOpacity={0.25}
            stroke={COLORS.a}
            strokeWidth={2}
          />
          <Polygon
            points={sqB}
            fill={COLORS.b}
            fillOpacity={0.25}
            stroke={COLORS.b}
            strokeWidth={2}
          />
          <Polygon
            points={sqC}
            fill={COLORS.c}
            fillOpacity={0.25}
            stroke={COLORS.c}
            strokeWidth={2}
          />
          <Polygon
            points={[[0, 0], B, C]}
            fill="var(--surface)"
            stroke="var(--ink)"
            strokeWidth={2.5}
          />
          <Polyline
            points={[
              [0.4, 0],
              [0.4, 0.4],
              [0, 0.4],
            ]}
            color="var(--ink-2)"
            width={1.5}
          />
          <Label at={centre(sqA)} className="text-sm font-semibold" color={COLORS.a}>
            {a * a}
          </Label>
          <Label at={centre(sqB)} className="text-sm font-semibold" color={COLORS.b}>
            {b * b}
          </Label>
          <Label at={centre(sqC)} className="text-sm font-semibold" color={COLORS.c}>
            {fmt(c * c)}
          </Label>
          <MovablePoint
            x={a}
            y={0}
            onMove={(x) => setA(x)}
            constrain={([x]) => [Math.min(MAX, Math.max(1, Math.round(x))), 0]}
            step={1}
            color={COLORS.a}
            label="Length of leg a"
          />
          <MovablePoint
            x={0}
            y={b}
            onMove={(_, y) => setB(y)}
            constrain={([, y]) => [0, Math.min(MAX, Math.max(1, Math.round(y)))]}
            step={1}
            color={COLORS.b}
            label="Length of leg b"
          />
        </Plot>
      </div>
      <div className="grid gap-2 border-t border-line p-3 sm:p-4">
        <p className="text-[1.05rem]" aria-live="polite">
          <Tex>{`a^2 + b^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${a * a + b * b} = c^2`}</Tex>
        </p>
        <Readouts
          items={[
            { label: 'a', value: String(a), color: COLORS.a },
            { label: 'b', value: String(b), color: COLORS.b },
            {
              label: 'hypotenuse c',
              value: (
                <Tex>
                  {whole ? String(Math.round(c)) : `\\sqrt{${a * a + b * b}} \\approx ${fmt(c, 3)}`}
                </Tex>
              ),
              color: COLORS.c,
            },
          ]}
        />
      </div>
    </>
  )
}

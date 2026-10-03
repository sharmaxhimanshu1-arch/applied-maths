import { useState } from 'react'
import type { Vec2 } from '@/math/linalg'
import { Readouts } from '@/learn/blocks'
import { Tex } from '@/ui/Tex'
import { Label, MovablePoint, Plot, Point, Segment, constraints } from '@/viz'
import { useReport } from '../useReport'
import { COLORS, fmt } from './shared'
import type { GeometryBoardState } from './types'

const grid = constraints.compose(constraints.snapToGrid(1), constraints.within(-6, 6, -5, 5))

export function DistanceMode({
  a: a0 = [-3, -2],
  b: b0 = [3, 2],
  onState,
}: {
  a?: Vec2
  b?: Vec2
  onState: (s: GeometryBoardState) => void
}) {
  const [a, setA] = useState<Vec2>(a0)
  const [b, setB] = useState<Vec2>(b0)
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const distance = Math.hypot(dx, dy)
  const midpoint: Vec2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  useReport<GeometryBoardState>({ mode: 'distance', a, b, dx, dy, distance, midpoint }, onState)
  const corner: Vec2 = [b[0], a[1]]
  const whole = Math.abs(distance - Math.round(distance)) < 1e-9
  return (
    <>
      <Plot
        view={{ xMin: -6.5, xMax: 6.5, yMin: -5.5, yMax: 5.5 }}
        aspect="equal"
        ariaLabel={`A at (${a.join(', ')}), B at (${b.join(', ')}), ${fmt(distance)} apart`}
      >
        {dx !== 0 && <Segment from={a} to={corner} color={COLORS.a} dashed width={2} />}
        {dy !== 0 && <Segment from={corner} to={b} color={COLORS.b} dashed width={2} />}
        {dx !== 0 && (
          <Label
            at={[(a[0] + b[0]) / 2, a[1]]}
            anchor={dy >= 0 ? 'top' : 'bottom'}
            offset={[0, dy >= 0 ? 6 : -6]}
            color={COLORS.a}
            className="text-xs font-semibold"
          >
            Δx = {Math.abs(dx)}
          </Label>
        )}
        {dy !== 0 && (
          <Label
            at={[b[0], (a[1] + b[1]) / 2]}
            anchor={dx >= 0 ? 'left' : 'right'}
            offset={[dx >= 0 ? 8 : -8, 0]}
            color={COLORS.b}
            className="text-xs font-semibold"
          >
            Δy = {Math.abs(dy)}
          </Label>
        )}
        <Segment from={a} to={b} color={COLORS.c} width={3} />
        <Point at={midpoint} r={6} color={COLORS.d} />
        <Label
          at={midpoint}
          anchor="bottom-right"
          offset={[-8, -6]}
          color={COLORS.d}
          className="text-xs font-semibold"
        >
          M ({fmt(midpoint[0], 1)}, {fmt(midpoint[1], 1)})
        </Label>
        <MovablePoint
          x={a[0]}
          y={a[1]}
          onMove={(x, y) => setA([x, y])}
          constrain={grid}
          step={1}
          color="var(--ink)"
          label="Point A"
        />
        <MovablePoint
          x={b[0]}
          y={b[1]}
          onMove={(x, y) => setB([x, y])}
          constrain={grid}
          step={1}
          color="var(--ink)"
          label="Point B"
        />
        <Label at={a} anchor="top-right" offset={[-6, 6]} className="text-sm font-bold">
          A
        </Label>
        <Label at={b} anchor="bottom-left" offset={[6, -6]} className="text-sm font-bold">
          B
        </Label>
      </Plot>
      <div className="grid gap-2 border-t border-line p-3 sm:p-4">
        <p className="overflow-x-auto overflow-y-hidden text-[1.05rem]" aria-live="polite">
          <Tex>{`d = \\sqrt{${dx}^2 + ${dy}^2} = \\sqrt{${dx * dx + dy * dy}} ${whole ? '=' : '\\approx'} ${fmt(distance, 3)}`}</Tex>
        </p>
        <Readouts
          items={[
            { label: 'across', value: String(Math.abs(dx)), color: COLORS.a },
            { label: 'up/down', value: String(Math.abs(dy)), color: COLORS.b },
            { label: 'distance', value: fmt(distance, 3), color: COLORS.c },
            {
              label: 'midpoint',
              value: `(${fmt(midpoint[0], 1)}, ${fmt(midpoint[1], 1)})`,
              color: COLORS.d,
            },
          ]}
        />
      </div>
    </>
  )
}

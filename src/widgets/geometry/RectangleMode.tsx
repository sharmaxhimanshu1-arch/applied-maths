import { useState } from 'react'
import { Readouts } from '@/learn/blocks'
import { Tex } from '@/ui/Tex'
import { Label, MovablePoint, Plot, Polygon } from '@/viz'
import { useReport } from '../useReport'
import { COLORS } from './shared'
import type { GeometryBoardState } from './types'

const MAX_W = 10
const MAX_H = 7

export function RectangleMode({
  w: w0 = 4,
  h: h0 = 3,
  onState,
}: {
  w?: number
  h?: number
  onState: (s: GeometryBoardState) => void
}) {
  const [[w, h], setSize] = useState<[number, number]>([w0, h0])
  const area = w * h
  const perimeter = 2 * (w + h)
  useReport<GeometryBoardState>({ mode: 'rectangle', w, h, area, perimeter }, onState)
  const cells = Array.from({ length: w * h }, (_, i) => [i % w, Math.floor(i / w)] as const)
  return (
    <>
      <Plot
        view={{ xMin: -0.8, xMax: MAX_W + 0.8, yMin: -0.9, yMax: MAX_H + 0.6 }}
        aspect="equal"
        axes={false}
        ariaLabel={`A ${w} by ${h} rectangle: area ${area}, perimeter ${perimeter}`}
      >
        {cells.map(([x, y]) => (
          <Polygon
            key={`${x},${y}`}
            points={[
              [x + 0.06, y + 0.06],
              [x + 0.94, y + 0.06],
              [x + 0.94, y + 0.94],
              [x + 0.06, y + 0.94],
            ]}
            fill={COLORS.a}
            fillOpacity={0.22}
          />
        ))}
        <Polygon
          points={[
            [0, 0],
            [w, 0],
            [w, h],
            [0, h],
          ]}
          stroke={COLORS.b}
          strokeWidth={3}
        />
        <Label at={[w / 2, 0]} anchor="top" offset={[0, 6]} className="text-sm font-semibold">
          {w}
        </Label>
        <Label at={[0, h / 2]} anchor="right" offset={[-8, 0]} className="text-sm font-semibold">
          {h}
        </Label>
        <MovablePoint
          x={w}
          y={h}
          onMove={(x, y) => setSize([x, y])}
          constrain={([x, y]) => [
            Math.min(MAX_W, Math.max(1, Math.round(x))),
            Math.min(MAX_H, Math.max(1, Math.round(y))),
          ]}
          step={1}
          color={COLORS.b}
          label="Corner of the rectangle"
        />
      </Plot>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            {
              label: 'area (squares inside)',
              value: <Tex>{`${w} \\times ${h} = ${area}`}</Tex>,
              color: COLORS.a,
            },
            {
              label: 'perimeter (fence around)',
              value: <Tex>{`2(${w} + ${h}) = ${perimeter}`}</Tex>,
              color: COLORS.b,
            },
          ]}
        />
      </div>
    </>
  )
}

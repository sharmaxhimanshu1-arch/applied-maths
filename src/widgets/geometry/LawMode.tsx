import { useState } from 'react'
import type { Vec2 } from '@/math/linalg'
import { Readouts } from '@/learn/blocks'
import { Tex } from '@/ui/Tex'
import { Label } from '@/viz'
import { useReport } from '../useReport'
import { TriangleBoard } from './TriangleMode'
import { COLORS, fmt, measureTriangle, rad, signedArea } from './shared'
import type { GeometryBoardState } from './types'

const SIDE_COLORS = [COLORS.a, COLORS.b, COLORS.c]

export function LawMode({
  points: p0 = [
    [1, 1],
    [7, 1],
    [2.5, 5],
  ],
  onState,
}: {
  points?: [Vec2, Vec2, Vec2]
  onState: (s: GeometryBoardState) => void
}) {
  const [points, setPoints] = useState<[Vec2, Vec2, Vec2]>(p0)
  const { sides, angles, raw } = measureTriangle(points)
  useReport<GeometryBoardState>({ mode: 'law', angles, sides }, onState)
  const move = (i: number, p: Vec2) =>
    setPoints((ps) => {
      const next = ps.map((q, j) => (j === i ? p : q)) as [Vec2, Vec2, Vec2]
      return Math.abs(signedArea(next)) < 0.25 ? ps : next
    })
  const [a, b, c] = sides
  const cosC = Math.cos(rad(raw[2]))
  const term = 2 * a * b * cosC
  return (
    <>
      <TriangleBoard points={points} onMove={move} angles={angles}>
        {points.map((_, i) => {
          // Side i is opposite vertex i.
          const q = points[(i + 1) % 3]
          const r = points[(i + 2) % 3]
          return (
            <Label
              key={i}
              at={[(q[0] + r[0]) / 2, (q[1] + r[1]) / 2]}
              className="text-xs font-semibold"
              color={SIDE_COLORS[i]}
            >
              {'abc'[i]} = {fmt(sides[i], 2)}
            </Label>
          )
        })}
      </TriangleBoard>
      <div className="grid gap-3 border-t border-line p-3 sm:p-4">
        <div className="overflow-x-auto text-[1.02rem]">
          <Tex
            display
          >{`c^2 = a^2 + b^2 - 2ab\\cos C \\quad\\Rightarrow\\quad ${fmt(c * c, 2)} = ${fmt(a * a, 2)} + ${fmt(b * b, 2)} ${term >= 0 ? '-' : '+'} ${fmt(Math.abs(term), 2)}`}</Tex>
        </div>
        <div className="overflow-x-auto text-[1.02rem]">
          <Tex
            display
          >{`\\frac{a}{\\sin A} = ${fmt(a / Math.sin(rad(raw[0])), 2)}, \\quad \\frac{b}{\\sin B} = ${fmt(b / Math.sin(rad(raw[1])), 2)}, \\quad \\frac{c}{\\sin C} = ${fmt(c / Math.sin(rad(raw[2])), 2)}`}</Tex>
        </div>
        <Readouts
          items={[
            { label: 'A', value: `${angles[0]}°`, color: COLORS.a },
            { label: 'B', value: `${angles[1]}°`, color: COLORS.b },
            { label: 'C', value: `${angles[2]}°`, color: COLORS.c },
            { label: <Tex>{'2ab\\cos C'}</Tex>, value: fmt(term, 2) },
          ]}
        />
      </div>
    </>
  )
}

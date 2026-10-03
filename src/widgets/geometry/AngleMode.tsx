import { useState } from 'react'
import type { Vec2 } from '@/math/linalg'
import { Readouts } from '@/learn/blocks'
import { AngleArc, Circle, Label, MovablePoint, Plot, Polyline, Segment, constraints } from '@/viz'
import { useReport } from '../useReport'
import { COLORS, rad } from './shared'
import type { GeometryBoardState } from './types'

type Kind = Extract<GeometryBoardState, { mode: 'angle' }>['kind']

const R = 1.3

function kindOf(d: number): Kind {
  if (d === 0) return 'zero'
  if (d < 90) return 'acute'
  if (d === 90) return 'right'
  if (d < 180) return 'obtuse'
  if (d === 180) return 'straight'
  return d < 360 ? 'reflex' : 'full'
}

const KIND_TEXT: Record<Kind, string> = {
  zero: 'no turn at all',
  acute: 'acute: less than a right angle',
  right: 'right angle: a quarter turn',
  obtuse: 'obtuse: between a right angle and a straight line',
  straight: 'straight: a half turn',
  reflex: 'reflex: more than a half turn',
  full: 'a full turn',
}

export function AngleMode({
  start = 50,
  onState,
}: {
  start?: number
  onState: (s: GeometryBoardState) => void
}) {
  const [degrees, setDegrees] = useState(start)
  const kind = kindOf(degrees)
  useReport<GeometryBoardState>({ mode: 'angle', degrees, kind }, onState)
  const tip: Vec2 = [R * Math.cos(rad(degrees)), R * Math.sin(rad(degrees))]
  return (
    <>
      <Plot
        view={{ xMin: -1.7, xMax: 1.7, yMin: -1.7, yMax: 1.7 }}
        aspect="equal"
        grid={false}
        axes={false}
        maxHeight={380}
        ariaLabel={`An angle of ${degrees} degrees, ${kind}`}
      >
        <Circle center={[0, 0]} r={R} stroke="var(--line-strong)" strokeWidth={1} dashed />
        {Array.from({ length: 12 }, (_, i) => {
          const a = rad(i * 30)
          return (
            <Segment
              key={i}
              from={[R * 0.93 * Math.cos(a), R * 0.93 * Math.sin(a)]}
              to={[R * 1.07 * Math.cos(a), R * 1.07 * Math.sin(a)]}
              color="var(--ink-3)"
              width={1.5}
            />
          )
        })}
        {degrees === 90 ? (
          <Polyline
            points={[
              [0.2, 0],
              [0.2, 0.2],
              [0, 0.2],
            ]}
            color={COLORS.b}
          />
        ) : (
          degrees > 0 &&
          degrees < 360 && (
            <AngleArc center={[0, 0]} from={0} to={rad(degrees)} radius={46} color={COLORS.b} />
          )
        )}
        <Segment from={[0, 0]} to={[R, 0]} color={COLORS.a} width={3} />
        <Segment from={[0, 0]} to={tip} color={COLORS.b} width={3} />
        <Label at={[0, 0]} anchor="top" offset={[0, 10]} className="text-xs text-ink-2">
          vertex
        </Label>
        <Label
          at={[0.62 * Math.cos(rad(degrees / 2)), 0.62 * Math.sin(rad(degrees / 2))]}
          className="text-base font-semibold"
          color={COLORS.b}
        >
          {degrees}°
        </Label>
        <MovablePoint
          x={tip[0]}
          y={tip[1]}
          onMove={(x, y) => {
            const d = Math.round((((Math.atan2(y, x) * 180) / Math.PI + 360) % 360) / 5) * 5
            // Keep a full turn reachable: dragging past 355° towards 0 snaps to 360.
            setDegrees((prev) => (d === 0 && prev > 300 ? 360 : d === 360 ? 0 : d))
          }}
          constrain={constraints.onCircle([0, 0], R)}
          color={COLORS.b}
          label="Turning arm"
          step={5}
        />
      </Plot>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'angle', value: `${degrees}°`, color: COLORS.b },
            { label: 'fraction of a turn', value: `${degrees}/360` },
            { label: 'kind', value: KIND_TEXT[kind] },
          ]}
        />
      </div>
    </>
  )
}

import { useState } from 'react'
import type { Vec2 } from '@/math/linalg'
import { Readouts } from '@/learn/blocks'
import { Tex } from '@/ui/Tex'
import { Label, MovablePoint, Plot, Point, Segment, constraints } from '@/viz'
import type { WidgetComponentProps } from './types'
import { useReport } from './useReport'

export type GeometryBoardPreset = {
  mode: 'coordinates'
  start?: Vec2
  /** Spots to visit; each turns solid once the point has landed on it. */
  targets?: Vec2[]
}

export type GeometryBoardState = {
  mode: 'coordinates'
  x: number
  y: number
  /** 1–4, or 0 on an axis. */
  quadrant: number
  /** How many targets have been visited. */
  hits: number
}

const P = 'var(--c-blue)'
const QUADRANT_NAMES = ['on an axis', 'quadrant I', 'quadrant II', 'quadrant III', 'quadrant IV']

function quadrantOf(x: number, y: number) {
  if (x === 0 || y === 0) return 0
  if (x > 0) return y > 0 ? 1 : 4
  return y > 0 ? 2 : 3
}

function CoordinatesMode({
  start = [3, 2],
  targets = [],
  onState,
}: {
  start?: Vec2
  targets?: Vec2[]
  onState: (s: GeometryBoardState) => void
}) {
  const [[x, y], setP] = useState<Vec2>(start)
  const [visited, setVisited] = useState<string[]>([])
  const quadrant = quadrantOf(x, y)
  useReport<GeometryBoardState>(
    { mode: 'coordinates', x, y, quadrant, hits: visited.length },
    onState,
  )
  const move = (nx: number, ny: number) => {
    setP([nx, ny])
    const hit = targets.find(([tx, ty]) => tx === nx && ty === ny)
    if (hit) setVisited((v) => (v.includes(`${nx},${ny}`) ? v : [...v, `${nx},${ny}`]))
  }
  return (
    <>
      <Plot
        view={{ xMin: -6.5, xMax: 6.5, yMin: -6.5, yMax: 6.5 }}
        narrowView={{ xMin: -5.5, xMax: 5.5, yMin: -6.5, yMax: 6.5 }}
        aspect="equal"
        ariaLabel={`Point at (${x}, ${y}), ${QUADRANT_NAMES[quadrant]}`}
      >
        {['I', 'II', 'III', 'IV'].map((q, i) => (
          <Label
            key={q}
            at={[i === 0 || i === 3 ? 4.5 : -4.5, i < 2 ? 5.3 : -5.3]}
            className="text-sm font-semibold text-ink-3"
          >
            {q}
          </Label>
        ))}
        {targets.map(([tx, ty]) => (
          <Point
            key={`${tx},${ty}`}
            at={[tx, ty]}
            r={8}
            color="var(--c-orange)"
            hollow={!visited.includes(`${tx},${ty}`)}
          />
        ))}
        {x !== 0 && <Segment from={[x, y]} to={[0, y]} color={P} dashed width={1.5} />}
        {y !== 0 && <Segment from={[x, y]} to={[x, 0]} color={P} dashed width={1.5} />}
        <MovablePoint
          x={x}
          y={y}
          onMove={move}
          constrain={constraints.compose(
            constraints.snapToGrid(1),
            constraints.within(-6, 6, -6, 6),
          )}
          step={1}
          color={P}
          label="Point P"
        />
        <Label
          at={[x, y]}
          anchor="bottom-left"
          offset={[10, -8]}
          color={P}
          className="text-sm font-semibold"
        >
          ({x}, {y})
        </Label>
      </Plot>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'across (x)', value: String(x), color: P },
            { label: 'up (y)', value: String(y), color: P },
            { label: 'where', value: QUADRANT_NAMES[quadrant] },
            ...(targets.length
              ? [
                  {
                    label: 'targets',
                    value: `${visited.length} of ${targets.length}`,
                    color: 'var(--c-orange)',
                  },
                ]
              : []),
          ]}
        />
        <p className="mt-2 text-sm text-ink-2">
          <Tex>(x, y)</Tex>: first walk across, then up. Negative means left or down.
        </p>
      </div>
    </>
  )
}

export default function GeometryBoardWidget({
  preset,
  onStateChange,
}: WidgetComponentProps<'geometryBoard'>) {
  return <CoordinatesMode start={preset.start} targets={preset.targets} onState={onStateChange} />
}

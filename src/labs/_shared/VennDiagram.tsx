import { useId } from 'react'
import { REGIONS, SLOTS, VENN, type Region } from './venn'

const A_COL = 'var(--c-blue)'
const B_COL = 'var(--c-orange)'
const SHADE = 'var(--c-violet)'

/**
 * Two overlapping sets in a universe. `counts` places that many dots in each region;
 * `shaded` regions are filled to show the result of an operation.
 */
export function VennDiagram({
  counts,
  shaded,
  names = ['A', 'B'],
  ariaLabel,
}: {
  counts: Record<Region, number>
  shaded: readonly Region[]
  names?: [string, string]
  ariaLabel: string
}) {
  const id = useId().replace(/:/g, '')
  const { a, b, universe: u } = VENN
  const fill = (r: Region) => (
    <g
      key={r}
      clipPath={r[0] === '1' ? `url(#${id}-inA)` : undefined}
      mask={r[0] === '0' ? `url(#${id}-outA)` : undefined}
    >
      <g
        clipPath={r[1] === '1' ? `url(#${id}-inB)` : undefined}
        mask={r[1] === '0' ? `url(#${id}-outB)` : undefined}
      >
        <rect x={u.x} y={u.y} width={u.w} height={u.h} style={{ fill: SHADE, fillOpacity: 0.28 }} />
      </g>
    </g>
  )
  return (
    <svg
      viewBox={`0 0 ${VENN.w} ${VENN.h}`}
      className="mx-auto block h-auto w-full max-w-md"
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <clipPath id={`${id}-inA`}>
          <circle cx={a.cx} cy={a.cy} r={a.r} />
        </clipPath>
        <clipPath id={`${id}-inB`}>
          <circle cx={b.cx} cy={b.cy} r={b.r} />
        </clipPath>
        <mask id={`${id}-outA`}>
          <rect x={u.x} y={u.y} width={u.w} height={u.h} fill="white" />
          <circle cx={a.cx} cy={a.cy} r={a.r} fill="black" />
        </mask>
        <mask id={`${id}-outB`}>
          <rect x={u.x} y={u.y} width={u.w} height={u.h} fill="white" />
          <circle cx={b.cx} cy={b.cy} r={b.r} fill="black" />
        </mask>
      </defs>
      <rect
        x={u.x}
        y={u.y}
        width={u.w}
        height={u.h}
        rx={10}
        style={{ fill: 'none', stroke: 'var(--line)', strokeWidth: 2 }}
      />
      {REGIONS.filter((r) => shaded.includes(r)).map(fill)}
      <circle cx={a.cx} cy={a.cy} r={a.r} style={{ fill: 'none', stroke: A_COL, strokeWidth: 3 }} />
      <circle cx={b.cx} cy={b.cy} r={b.r} style={{ fill: 'none', stroke: B_COL, strokeWidth: 3 }} />
      <text
        x={a.cx - 62}
        y={a.cy - 72}
        style={{ fill: 'var(--ink)', fontSize: 16, fontWeight: 700 }}
      >
        {names[0]}
      </text>
      <text
        x={b.cx + 50}
        y={b.cy - 72}
        style={{ fill: 'var(--ink)', fontSize: 16, fontWeight: 700 }}
      >
        {names[1]}
      </text>
      {REGIONS.flatMap((r) =>
        SLOTS[r]
          .slice(0, counts[r])
          .map(([x, y], i) => (
            <circle key={`${r}-${i}`} cx={x} cy={y} r={5} style={{ fill: 'var(--ink-2)' }} />
          )),
      )}
    </svg>
  )
}

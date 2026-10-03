export interface GridCell {
  color: string
  /** Hollow ring instead of a filled dot. */
  hollow?: boolean
  /** Faded out (filtered away by a condition). */
  dim?: boolean
}

/**
 * Many small dots in a grid: "100 people", "1,000 patients". One SVG keeps 1,000 cells cheap,
 * and it scales to the container width.
 */
export function DotGrid({
  cells,
  columns,
  ariaLabel,
  size = 12,
  gap = 3,
}: {
  cells: GridCell[]
  columns: number
  ariaLabel: string
  size?: number
  gap?: number
}) {
  const rows = Math.ceil(cells.length / columns)
  const pitch = size + gap
  const r = size / 2
  return (
    <svg
      viewBox={`${-1} ${-1} ${columns * pitch - gap + 2} ${rows * pitch - gap + 2}`}
      className="block h-auto w-full"
      role="img"
      aria-label={ariaLabel}
    >
      {cells.map((c, i) => (
        <circle
          key={i}
          cx={(i % columns) * pitch + r}
          cy={Math.floor(i / columns) * pitch + r}
          r={c.hollow ? r - 1 : r}
          fill={c.hollow ? 'none' : c.color}
          stroke={c.color}
          strokeWidth={c.hollow ? 1.6 : 0}
          opacity={c.dim ? 0.16 : 1}
          style={{ transition: 'opacity 200ms ease' }}
        />
      ))}
    </svg>
  )
}

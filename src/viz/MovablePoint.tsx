import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { formatNumber, roundTo } from '@/math/core'
import type { Vec2 } from '@/math/linalg'
import { usePlot } from './context'

type MovablePointProps = {
  x: number
  y: number
  onMove: (x: number, y: number) => void
  /** Map a proposed position to an allowed one (snap, stay on a curve, clamp…). */
  constrain?: (p: Vec2) => Vec2
  color?: string
  /** Accessible name, e.g. "Tip of vector u". */
  label: string
  /** Visible dot radius in pixels. */
  size?: number
  /** Arrow-key step in math units (Shift moves 5×). */
  step?: number
  onDragStart?: () => void
  onDragEnd?: () => void
  /** Show a coordinate bubble while dragging. */
  showCoords?: boolean
  decimals?: number
  /** Delete/Backspace (or double-click) removes the point. */
  onRemove?: () => void
}

/**
 * A point you can grab. Pointer capture keeps the drag smooth outside the plot; arrow keys move
 * it for keyboard users; screen readers hear its coordinates. Only the handle blocks page
 * scrolling on touch (the rest of the plot still scrolls).
 */
export function MovablePoint({
  x,
  y,
  onMove,
  constrain = (p) => p,
  color = 'var(--accent)',
  label,
  size = 7,
  step = 0.1,
  onDragStart,
  onDragEnd,
  showCoords = false,
  decimals = 2,
  onRemove,
}: MovablePointProps) {
  const t = usePlot()
  const grab = useRef<Vec2 | null>(null)
  const [dragging, setDragging] = useState(false)
  const cx = t.sx(x)
  const cy = t.sy(y)

  function onPointerDown(e: PointerEvent<SVGGElement>) {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    const [mx, my] = t.toMath(e.clientX, e.clientY)
    grab.current = [x - mx, y - my] // keep the offset so the point doesn't jump under the finger
    setDragging(true)
    onDragStart?.()
  }

  function onPointerMove(e: PointerEvent<SVGGElement>) {
    if (!grab.current) return
    const [mx, my] = t.toMath(e.clientX, e.clientY)
    const [nx, ny] = constrain([mx + grab.current[0], my + grab.current[1]])
    if (nx !== x || ny !== y) onMove(nx, ny)
  }

  function onPointerUp() {
    if (!grab.current) return
    grab.current = null
    setDragging(false)
    onDragEnd?.()
  }

  function onKeyDown(e: KeyboardEvent<SVGGElement>) {
    if (onRemove && (e.key === 'Delete' || e.key === 'Backspace')) {
      e.preventDefault()
      onRemove()
      return
    }
    const k = e.shiftKey ? step * 5 : step
    const delta: Record<string, Vec2> = {
      ArrowLeft: [-k, 0],
      ArrowRight: [k, 0],
      ArrowUp: [0, k],
      ArrowDown: [0, -k],
    }
    const d = delta[e.key]
    if (!d) return
    e.preventDefault()
    const [nx, ny] = constrain([x + d[0], y + d[1]])
    onMove(nx, ny)
  }

  // Round first so floating-point dust (cos 90° = 6e-17) reads as 0, not in exponent form.
  const coords = `(${formatNumber(roundTo(x, decimals), decimals)}, ${formatNumber(roundTo(y, decimals), decimals)})`

  return (
    <g
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuenow={roundTo(x, 6)}
      aria-valuetext={coords}
      className="viz-handle"
      style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none', outline: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      onDoubleClick={onRemove}
    >
      <circle cx={cx} cy={cy} r={Math.max(18, size + 10)} fill="transparent" />
      <circle
        className="viz-handle-ring"
        cx={cx}
        cy={cy}
        r={size + 6}
        fill={color}
        fillOpacity={dragging ? 0.22 : 0.12}
        stroke={color}
        strokeOpacity={0.5}
      />
      <circle cx={cx} cy={cy} r={size} fill={color} stroke="var(--surface)" strokeWidth={2} />
      {showCoords && dragging && (
        <g aria-hidden>
          <rect
            x={cx + 12}
            y={cy - 34}
            width={coords.length * 7 + 12}
            height={22}
            rx={6}
            fill="var(--ink)"
            opacity={0.85}
          />
          <text x={cx + 18} y={cy - 19} fontSize={12} fill="var(--surface)" className="tabular">
            {coords}
          </text>
        </g>
      )}
    </g>
  )
}

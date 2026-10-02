import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { formatNumber } from '@/math/core'
import type { Vec2 } from '@/math/linalg'
import { cn } from '@/ui/cn'
import { PlotContext, usePlot, type PlotContextValue } from './context'
import {
  equalAspect,
  makeTransform,
  niceStep,
  panView,
  piLabel,
  ticks,
  zoomView,
  type Transform,
  type View,
} from './scale'

type PlotProps = {
  /** The math window to show. With aspect="equal" the shorter side is expanded. */
  view: View
  /** Make the plot pannable/zoomable; called with the new window. */
  onViewChange?: (view: View) => void
  aspect?: 'equal' | 'free'
  /** Fixed pixel height; otherwise width / ratio, capped at maxHeight. */
  height?: number
  ratio?: number
  maxHeight?: number
  grid?: boolean
  axes?: boolean
  tickLabels?: boolean
  /** Label the x-axis in multiples of π (trigonometry). */
  piTicks?: boolean
  xLabel?: string
  yLabel?: string
  /** Wheel zoom: always (tool pages), only with Ctrl/⌘ (embedded), or never. */
  wheelZoom?: 'always' | 'modifier' | false
  /** Pointer down on empty plot area (math coordinates). */
  onBackgroundPointerDown?: (p: Vec2, e: ReactPointerEvent) => void
  ariaLabel: string
  className?: string
  children?: ReactNode
}

/**
 * A responsive math coordinate system. Children are SVG primitives (FunctionGraph, Vector,
 * MovablePoint…) that read the transform from context; <Label>s portal into an HTML layer.
 */
export function Plot({
  view: requested,
  onViewChange,
  aspect = 'free',
  height: fixedHeight,
  ratio = 1.6,
  maxHeight = 520,
  grid = true,
  axes = true,
  tickLabels = true,
  piTicks = false,
  xLabel,
  yLabel,
  wheelZoom = 'modifier',
  onBackgroundPointerDown,
  ariaLabel,
  className,
  children,
}: PlotProps) {
  const uid = useId().replace(/:/g, '')
  const wrapRef = useRef<HTMLDivElement>(null)
  const [svgEl, setSvgEl] = useState<SVGSVGElement | null>(null)
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const height = fixedHeight ?? Math.min(maxHeight, Math.max(200, Math.round(width / ratio)))

  const t: Transform | null = useMemo(() => {
    if (!width) return null
    const view = aspect === 'equal' ? equalAspect(requested, width, height) : requested
    return makeTransform(view, width, height)
  }, [requested, aspect, width, height])

  const toMath = useCallback(
    (clientX: number, clientY: number): Vec2 => {
      const rect = svgEl?.getBoundingClientRect()
      if (!rect || !t) return [0, 0]
      return [t.ix(clientX - rect.left), t.iy(clientY - rect.top)]
    },
    [t, svgEl],
  )

  const ctx: PlotContextValue | null = useMemo(
    () => (t ? { ...t, uid, overlay, toMath } : null),
    [t, uid, overlay, toMath],
  )

  usePanZoom(svgEl, ctx, onViewChange, wheelZoom)

  return (
    <div
      ref={wrapRef}
      role="group"
      aria-label={ariaLabel}
      className={cn('relative w-full overflow-hidden rounded-xl bg-surface select-none', className)}
      style={{ height }}
    >
      {ctx && (
        <PlotContext.Provider value={ctx}>
          <svg
            ref={setSvgEl}
            width={ctx.width}
            height={ctx.height}
            viewBox={`0 0 ${ctx.width} ${ctx.height}`}
            className="absolute inset-0 block"
            style={{ touchAction: onViewChange ? 'none' : 'pan-y' }}
          >
            <defs>
              <clipPath id={`${uid}-clip`}>
                <rect width={ctx.width} height={ctx.height} />
              </clipPath>
            </defs>
            <rect
              width={ctx.width}
              height={ctx.height}
              fill="transparent"
              data-plot-bg
              onPointerDown={
                onBackgroundPointerDown
                  ? (e) => onBackgroundPointerDown(toMath(e.clientX, e.clientY), e)
                  : undefined
              }
            />
            {grid && <Grid piTicks={piTicks} />}
            {axes && <Axes piTicks={piTicks} labels={tickLabels} />}
            <g clipPath={`url(#${uid}-clip)`}>{children}</g>
          </svg>
          {(xLabel || yLabel) && <AxisNames x={xLabel} y={yLabel} />}
          <div ref={setOverlay} className="pointer-events-none absolute inset-0" />
        </PlotContext.Provider>
      )}
    </div>
  )
}

function xStep(t: Transform, piTicks: boolean) {
  const span = t.view.xMax - t.view.xMin
  if (piTicks) {
    const unitsPerTick = span / Math.max(2, t.width / 90)
    const candidates = [Math.PI / 4, Math.PI / 2, Math.PI, 2 * Math.PI, 4 * Math.PI]
    return candidates.find((c) => c >= unitsPerTick) ?? 8 * Math.PI
  }
  return niceStep(span, t.width / 90)
}

function yStep(t: Transform) {
  return niceStep(t.view.yMax - t.view.yMin, t.height / 70)
}

function Grid({ piTicks }: { piTicks: boolean }) {
  const t = usePlot()
  const xs = xStep(t, piTicks)
  const ys = yStep(t)
  const minorX = piTicks ? xs / 2 : xs / 5
  const minorY = ys / 5
  return (
    <g aria-hidden shapeRendering="crispEdges">
      {t.kx * minorX > 12 &&
        ticks(t.view.xMin, t.view.xMax, minorX).map((x) => (
          <line
            key={`mx${x}`}
            x1={t.sx(x)}
            x2={t.sx(x)}
            y1={0}
            y2={t.height}
            stroke="var(--grid)"
            strokeOpacity={0.55}
          />
        ))}
      {t.ky * minorY > 12 &&
        ticks(t.view.yMin, t.view.yMax, minorY).map((y) => (
          <line
            key={`my${y}`}
            y1={t.sy(y)}
            y2={t.sy(y)}
            x1={0}
            x2={t.width}
            stroke="var(--grid)"
            strokeOpacity={0.55}
          />
        ))}
      {ticks(t.view.xMin, t.view.xMax, xs).map((x) => (
        <line
          key={`x${x}`}
          x1={t.sx(x)}
          x2={t.sx(x)}
          y1={0}
          y2={t.height}
          stroke="var(--grid-strong)"
        />
      ))}
      {ticks(t.view.yMin, t.view.yMax, ys).map((y) => (
        <line
          key={`y${y}`}
          y1={t.sy(y)}
          y2={t.sy(y)}
          x1={0}
          x2={t.width}
          stroke="var(--grid-strong)"
        />
      ))}
    </g>
  )
}

function Axes({ piTicks, labels }: { piTicks: boolean; labels: boolean }) {
  const t = usePlot()
  const xs = xStep(t, piTicks)
  const ys = yStep(t)
  // Axis lines sit at 0 when visible; tick labels hug the nearest edge otherwise.
  const ax = Math.min(t.height - 18, Math.max(4, t.sy(0)))
  const ay = Math.min(t.width - 8, Math.max(26, t.sx(0)))
  const decimalsX = Math.max(0, -Math.floor(Math.log10(xs) + 1e-9))
  const decimalsY = Math.max(0, -Math.floor(Math.log10(ys) + 1e-9))
  return (
    <g aria-hidden className="font-sans" fontSize={11} fill="var(--ink-3)">
      {t.view.yMin <= 0 && t.view.yMax >= 0 && (
        <line
          x1={0}
          x2={t.width}
          y1={t.sy(0)}
          y2={t.sy(0)}
          stroke="var(--axis)"
          strokeWidth={1.25}
        />
      )}
      {t.view.xMin <= 0 && t.view.xMax >= 0 && (
        <line
          y1={0}
          y2={t.height}
          x1={t.sx(0)}
          x2={t.sx(0)}
          stroke="var(--axis)"
          strokeWidth={1.25}
        />
      )}
      {labels &&
        ticks(t.view.xMin, t.view.xMax, xs).map((x) =>
          x === 0 || t.sx(x) < 12 || t.sx(x) > t.width - 12 ? null : (
            <text key={`tx${x}`} x={t.sx(x)} y={ax + 14} textAnchor="middle" className="tabular">
              {piTicks ? piLabel(x, xs >= Math.PI ? Math.PI : xs) : formatNumber(x, decimalsX)}
            </text>
          ),
        )}
      {labels &&
        ticks(t.view.yMin, t.view.yMax, ys).map((y) =>
          y === 0 || t.sy(y) < 10 || t.sy(y) > t.height - 8 ? null : (
            <text key={`ty${y}`} x={ay - 6} y={t.sy(y) + 4} textAnchor="end" className="tabular">
              {formatNumber(y, decimalsY)}
            </text>
          ),
        )}
    </g>
  )
}

function AxisNames({ x, y }: { x?: string; y?: string }) {
  const t = usePlot()
  const ax = Math.min(t.height - 20, Math.max(2, t.sy(0) - 20))
  const ay = Math.min(t.width - 20, Math.max(32, t.sx(0) + 8))
  return (
    <>
      {x && (
        <span
          className="pointer-events-none absolute right-2 text-sm text-ink-2 italic"
          style={{ top: ax }}
        >
          {x}
        </span>
      )}
      {y && (
        <span
          className="pointer-events-none absolute top-1.5 text-sm text-ink-2 italic"
          style={{ left: ay }}
        >
          {y}
        </span>
      )}
    </>
  )
}

/** Drag to pan, wheel/pinch to zoom, when the plot has onViewChange. */
function usePanZoom(
  svg: SVGSVGElement | null,
  ctx: PlotContextValue | null,
  onViewChange: ((v: View) => void) | undefined,
  wheelZoom: 'always' | 'modifier' | false,
) {
  const ctxRef = useRef(ctx)
  const changeRef = useRef(onViewChange)
  useEffect(() => {
    ctxRef.current = ctx
    changeRef.current = onViewChange
  })

  const enabled = !!onViewChange
  useEffect(() => {
    if (!svg || !enabled) return
    const el = svg
    const pointers = new Map<number, { x: number; y: number }>()
    let lastPinch = 0

    const isBackground = (e: Event) => (e.target as Element).closest('[data-plot-bg]') !== null

    function onDown(e: PointerEvent) {
      if (!isBackground(e)) return
      el.setPointerCapture(e.pointerId)
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      lastPinch = 0
    }
    function onMove(e: PointerEvent) {
      const prev = pointers.get(e.pointerId)
      const c = ctxRef.current
      if (!prev || !c) return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 1) {
        const dx = (e.clientX - prev.x) / c.kx
        const dy = (e.clientY - prev.y) / c.ky
        changeRef.current?.(panView(c.view, -dx, dy))
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        if (lastPinch) {
          const [mx, my] = c.toMath((a.x + b.x) / 2, (a.y + b.y) / 2)
          changeRef.current?.(zoomView(c.view, lastPinch / dist, mx, my))
        }
        lastPinch = dist
      }
    }
    function onUp(e: PointerEvent) {
      pointers.delete(e.pointerId)
      lastPinch = 0
    }
    function onWheel(e: WheelEvent) {
      const c = ctxRef.current
      if (!c || !wheelZoom) return
      if (wheelZoom === 'modifier' && !e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const [mx, my] = c.toMath(e.clientX, e.clientY)
      changeRef.current?.(zoomView(c.view, Math.exp(e.deltaY * 0.0015), mx, my))
    }
    svg.addEventListener('pointerdown', onDown)
    svg.addEventListener('pointermove', onMove)
    svg.addEventListener('pointerup', onUp)
    svg.addEventListener('pointercancel', onUp)
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      svg.removeEventListener('pointerdown', onDown)
      svg.removeEventListener('pointermove', onMove)
      svg.removeEventListener('pointerup', onUp)
      svg.removeEventListener('pointercancel', onUp)
      svg.removeEventListener('wheel', onWheel)
    }
  }, [svg, enabled, wheelZoom])
}

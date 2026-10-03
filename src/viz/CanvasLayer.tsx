import { useEffect, useRef } from 'react'
import { usePlot, type PlotContextValue } from './context'

type CanvasLayerProps = {
  /** Draw with a 2-D context already scaled for the device pixel ratio. */
  draw: (ctx: CanvasRenderingContext2D, plot: PlotContextValue) => void
  /** Redraw when any of these change (the transform is always included). */
  deps?: readonly unknown[]
  opacity?: number
}

/**
 * A canvas behind the SVG primitives for things too heavy for DOM nodes: slope fields,
 * heatmaps, thousands of particles. Lives inside <Plot> via foreignObject.
 */
export function CanvasLayer({ draw, deps = [], opacity = 1 }: CanvasLayerProps) {
  const plot = usePlot()
  const ref = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef(draw)
  useEffect(() => {
    drawRef.current = draw
  })

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(plot.width * dpr)
    canvas.height = Math.round(plot.height * dpr)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, plot.width, plot.height)
    drawRef.current(ctx, plot)
    // eslint-style exhaustive deps are intentional here: callers pass their own deps list.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [plot, ...deps])

  return (
    <foreignObject x={0} y={0} width={plot.width} height={plot.height} aria-hidden>
      <canvas
        ref={ref}
        style={{ width: plot.width, height: plot.height, opacity, display: 'block' }}
      />
    </foreignObject>
  )
}

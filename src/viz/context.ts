import { createContext, useContext } from 'react'
import type { Vec2 } from '@/math/linalg'
import type { Transform } from './scale'

export interface PlotContextValue extends Transform {
  /** Unique id prefix for clip paths and gradients. */
  uid: string
  /** HTML layer above the SVG where labels (with KaTeX) are portalled. */
  overlay: HTMLDivElement | null
  /** Client (page) coordinates → math coordinates. */
  toMath(clientX: number, clientY: number): Vec2
}

export const PlotContext = createContext<PlotContextValue | null>(null)

export function usePlot(): PlotContextValue {
  const ctx = useContext(PlotContext)
  if (!ctx) throw new Error('Plot primitives must be rendered inside <Plot>')
  return ctx
}

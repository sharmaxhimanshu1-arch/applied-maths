import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { WidgetComponentProps, WidgetType } from './types'

type Registry = {
  [K in WidgetType]: LazyExoticComponent<ComponentType<WidgetComponentProps<K>>>
}

/** Each widget is its own chunk, loaded only on pages that use it. */
export const WIDGETS: Registry = {
  grapher: lazy(() => import('./GrapherWidget')),
  matrix: lazy(() => import('./MatrixWidget')),
  unitCircle: lazy(() => import('./UnitCircleWidget')),
  probability: lazy(() => import('./ProbabilityWidget')),
  data: lazy(() => import('./DataWidget')),
  numberLine: lazy(() => import('./NumberLineWidget')),
  fractionBars: lazy(() => import('./FractionBarsWidget')),
  numberTheory: lazy(() => import('./NumberTheoryWidget')),
  venn: lazy(() => import('./VennWidget')),
  truthTable: lazy(() => import('./TruthTableWidget')),
  countingTree: lazy(() => import('./CountingTreeWidget')),
  networkGraph: lazy(() => import('./NetworkGraphWidget')),
  iterationPlot: lazy(() => import('./IterationPlotWidget')),
  functionMachine: lazy(() => import('./FunctionMachineWidget')),
  complexPlane: lazy(() => import('./ComplexPlaneWidget')),
  geometryBoard: lazy(() => import('./GeometryBoardWidget')),
  contourPlot: lazy(() => import('./ContourPlotWidget')),
  slopeField: lazy(() => import('./SlopeFieldWidget')),
  simulation: lazy(() => import('./SimulationWidget')),
}

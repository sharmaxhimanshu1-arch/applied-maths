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
}

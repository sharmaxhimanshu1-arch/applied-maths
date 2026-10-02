import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/** Full-page tool components, each its own chunk. */
export const TOOL_PAGES: Record<string, LazyExoticComponent<ComponentType>> = {
  grapher: lazy(() => import('./grapher/GrapherPage')),
  'matrix-lab': lazy(() => import('./matrix/MatrixLabPage')),
  'unit-circle': lazy(() => import('./unit-circle/UnitCirclePage')),
  'probability-lab': lazy(() => import('./probability/ProbabilityLab')),
  'data-lab': lazy(() => import('./data/DataLabPage')),
  calculator: lazy(() => import('./calculator/CalculatorPage')),
}

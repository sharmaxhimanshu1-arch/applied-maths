import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/** Full-page tool components, each its own chunk. */
export const TOOL_PAGES: Record<string, LazyExoticComponent<ComponentType>> = {
  grapher: lazy(() => import('./grapher/GrapherPage')),
}

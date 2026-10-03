import { createHashRouter } from 'react-router'
import { AppShell, type RouteHandle } from './AppShell'
import { BootScreen, RouteError } from './RouteError'

/**
 * Hash routing (#/learn/derivatives) works on any static host with no server rewrites.
 * Note: in-page "#anchor" links would change the route, so scroll with element.scrollIntoView().
 */
export const router = createHashRouter([
  {
    path: '/',
    Component: AppShell,
    HydrateFallback: BootScreen,
    ErrorBoundary: RouteError,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('./routes/HomePage')).HomePage }),
      },
      {
        path: 'map',
        handle: { fullBleed: true } satisfies RouteHandle,
        lazy: async () => ({ Component: (await import('./routes/MapPage')).MapPage }),
      },
      {
        path: 'learn/:conceptId',
        lazy: async () => ({ Component: (await import('./routes/ConceptPage')).ConceptPage }),
      },
      {
        path: 'tools',
        lazy: async () => ({ Component: (await import('./routes/ToolsPage')).ToolsPage }),
      },
      {
        path: 'tools/:toolId',
        lazy: async () => ({ Component: (await import('./routes/ToolPage')).ToolPage }),
      },
      {
        path: 'review',
        lazy: async () => ({ Component: (await import('./routes/ReviewPage')).ReviewPage }),
      },
      {
        path: 'progress',
        lazy: async () => ({ Component: (await import('./routes/ProgressPage')).ProgressPage }),
      },
      {
        path: 'about',
        lazy: async () => ({ Component: (await import('./routes/AboutPage')).AboutPage }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('./routes/NotFoundPage')).NotFoundPage }),
      },
    ],
  },
])

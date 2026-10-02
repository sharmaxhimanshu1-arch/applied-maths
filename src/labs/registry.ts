import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/**
 * Deep labs live in src/labs/<concept-id>/index.tsx and are discovered automatically.
 * Each module is a separate chunk, loaded only when its concept page opens.
 */
const modules = import.meta.glob<{ default: ComponentType }>('./*/index.tsx')

const loaders = new Map(
  Object.entries(modules).map(([path, load]) => [path.split('/')[1], load] as const),
)

export const DEEP_LAB_IDS: ReadonlySet<string> = new Set(loaders.keys())

export function hasDeepLab(conceptId: string): boolean {
  return loaders.has(conceptId)
}

/** Lazy component per deep lab, created once at module load (nothing downloads until rendered). */
export const DEEP_LABS: Readonly<Record<string, LazyExoticComponent<ComponentType>>> =
  Object.fromEntries([...loaders].map(([id, load]) => [id, lazy(load)]))

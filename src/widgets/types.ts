import type { GrapherPreset, GrapherState } from '@/tools/grapher/model'

/**
 * Every interactive a lite lab can embed: its preset props and the state it reports.
 * Adding a widget = add an entry here + a lazy component in registry.ts.
 */
export interface WidgetDefs {
  grapher: { props: GrapherPreset; state: GrapherState }
}

export type WidgetType = keyof WidgetDefs

/** A prompt that ticks itself when `when(state)` becomes true. */
export interface TryThisSpec<S> {
  id: string
  text: string
  when: (state: S) => boolean
}

export type WidgetSpec = {
  [K in WidgetType]: {
    type: K
    props: WidgetDefs[K]['props']
    tryThis: TryThisSpec<WidgetDefs[K]['state']>[]
    caption?: string
  }
}[WidgetType]

export type WidgetComponentProps<K extends WidgetType> = {
  preset: WidgetDefs[K]['props']
  onStateChange: (state: WidgetDefs[K]['state']) => void
}

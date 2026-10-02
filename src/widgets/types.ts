import type { DataLabPreset, DataLabState } from '@/tools/data/DataLab'
import type { GrapherPreset, GrapherState } from '@/tools/grapher/model'
import type { MatrixLabPreset, MatrixLabState } from '@/tools/matrix/MatrixLab'
import type { ProbabilityPreset, ProbabilityState } from '@/tools/probability/ProbabilityLab'
import type { UnitCirclePreset, UnitCircleState } from '@/tools/unit-circle/UnitCircle'

/**
 * Every interactive a lite lab can embed: its preset props and the state it reports.
 * Adding a widget = add an entry here + a lazy component in registry.ts.
 */
export interface WidgetDefs {
  grapher: { props: GrapherPreset; state: GrapherState }
  matrix: { props: MatrixLabPreset; state: MatrixLabState }
  unitCircle: { props: UnitCirclePreset; state: UnitCircleState }
  probability: { props: ProbabilityPreset; state: ProbabilityState }
  data: { props: DataLabPreset; state: DataLabState }
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

import type { DataLabPreset, DataLabState } from '@/tools/data/DataLab'
import type { GrapherPreset, GrapherState } from '@/tools/grapher/model'
import type { MatrixLabPreset, MatrixLabState } from '@/tools/matrix/MatrixLab'
import type { ProbabilityPreset, ProbabilityState } from '@/tools/probability/ProbabilityLab'
import type { UnitCirclePreset, UnitCircleState } from '@/tools/unit-circle/UnitCircle'
import type { FractionBarsPreset, FractionBarsState } from './FractionBarsWidget'
import type { NumberLinePreset, NumberLineState } from './NumberLineWidget'
import type { NumberTheoryPreset, NumberTheoryState } from './NumberTheoryWidget'
import type { VennPreset, VennState } from './VennWidget'
import type { TruthTablePreset, TruthTableState } from './TruthTableWidget'
import type { CountingTreePreset, CountingTreeState } from './CountingTreeWidget'
import type { NetworkGraphPreset, NetworkGraphState } from './NetworkGraphWidget'
import type { IterationPlotPreset, IterationPlotState } from './IterationPlotWidget'
import type { FunctionMachinePreset, FunctionMachineState } from './FunctionMachineWidget'
import type { ComplexPlanePreset, ComplexPlaneState } from './ComplexPlaneWidget'
import type { GeometryBoardPreset, GeometryBoardState } from './GeometryBoardWidget'
import type { ContourPlotPreset, ContourPlotState } from './ContourPlotWidget'
import type { SlopeFieldPreset, SlopeFieldState } from './SlopeFieldWidget'

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
  numberLine: { props: NumberLinePreset; state: NumberLineState }
  fractionBars: { props: FractionBarsPreset; state: FractionBarsState }
  numberTheory: { props: NumberTheoryPreset; state: NumberTheoryState }
  venn: { props: VennPreset; state: VennState }
  truthTable: { props: TruthTablePreset; state: TruthTableState }
  countingTree: { props: CountingTreePreset; state: CountingTreeState }
  networkGraph: { props: NetworkGraphPreset; state: NetworkGraphState }
  iterationPlot: { props: IterationPlotPreset; state: IterationPlotState }
  functionMachine: { props: FunctionMachinePreset; state: FunctionMachineState }
  complexPlane: { props: ComplexPlanePreset; state: ComplexPlaneState }
  geometryBoard: { props: GeometryBoardPreset; state: GeometryBoardState }
  contourPlot: { props: ContourPlotPreset; state: ContourPlotState }
  slopeField: { props: SlopeFieldPreset; state: SlopeFieldState }
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

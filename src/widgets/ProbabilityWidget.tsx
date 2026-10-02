import { ProbabilityExperiment } from '@/tools/probability/ProbabilityLab'
import type { WidgetComponentProps } from './types'

export default function ProbabilityWidget({
  preset,
  onStateChange,
}: WidgetComponentProps<'probability'>) {
  return <ProbabilityExperiment preset={preset} onStateChange={onStateChange} />
}

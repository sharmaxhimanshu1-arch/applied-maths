import { UnitCircle } from '@/tools/unit-circle/UnitCircle'
import type { WidgetComponentProps } from './types'

export default function UnitCircleWidget({
  preset,
  onStateChange,
}: WidgetComponentProps<'unitCircle'>) {
  return <UnitCircle preset={preset} onStateChange={onStateChange} />
}

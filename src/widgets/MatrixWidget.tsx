import { MatrixLab } from '@/tools/matrix/MatrixLab'
import type { WidgetComponentProps } from './types'

export default function MatrixWidget({ preset, onStateChange }: WidgetComponentProps<'matrix'>) {
  return <MatrixLab preset={preset} onStateChange={onStateChange} />
}

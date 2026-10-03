import { DataLab } from '@/tools/data/DataLab'
import type { WidgetComponentProps } from './types'

export default function DataWidget({ preset, onStateChange }: WidgetComponentProps<'data'>) {
  return <DataLab preset={preset} onStateChange={onStateChange} />
}

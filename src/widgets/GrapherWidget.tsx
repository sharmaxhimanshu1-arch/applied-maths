import { Grapher } from '@/tools/grapher/Grapher'
import type { WidgetComponentProps } from './types'

export default function GrapherWidget({ preset, onStateChange }: WidgetComponentProps<'grapher'>) {
  return <Grapher preset={preset} mode="embed" onStateChange={onStateChange} />
}

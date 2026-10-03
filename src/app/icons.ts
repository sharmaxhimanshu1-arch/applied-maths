import {
  Activity,
  Binary,
  BrainCircuit,
  ChartScatter,
  Dices,
  Grid3x3,
  Hash,
  Mountain,
  Sigma,
  SquareFunction,
  Triangle,
  Variable,
  WavesHorizontal,
  type LucideIcon,
} from 'lucide-react'
import type { DomainId } from '@/curriculum/types'

export const DOMAIN_ICONS: Record<DomainId, LucideIcon> = {
  numbers: Hash,
  discrete: Binary,
  algebra: Variable,
  functions: SquareFunction,
  geometry: Triangle,
  trigonometry: WavesHorizontal,
  calculus: Sigma,
  multivariable: Mountain,
  'differential-equations': Activity,
  'linear-algebra': Grid3x3,
  probability: Dices,
  statistics: ChartScatter,
  applied: BrainCircuit,
}

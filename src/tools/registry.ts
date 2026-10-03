import {
  Calculator,
  ChartScatter,
  Dices,
  Grid3x3,
  Orbit,
  Spline,
  type LucideIcon,
} from 'lucide-react'

export interface ToolInfo {
  id: string
  title: string
  blurb: string
  icon: LucideIcon
  /** CSS colour accent for the tool card. */
  color: string
  keywords: string[]
}

export const TOOLS: ToolInfo[] = [
  {
    id: 'grapher',
    title: 'Grapher',
    blurb: 'Plot functions, add sliders, and see tangents, areas and roots.',
    icon: Spline,
    color: 'var(--c-blue)',
    keywords: ['graph', 'plot', 'function', 'desmos', 'derivative', 'integral', 'polar'],
  },
  {
    id: 'matrix-lab',
    title: 'Matrix Lab',
    blurb: 'Drag the basis vectors and watch the whole plane transform.',
    icon: Grid3x3,
    color: 'var(--c-magenta)',
    keywords: ['matrix', 'transformation', 'determinant', 'eigenvector', 'linear algebra'],
  },
  {
    id: 'probability-lab',
    title: 'Probability Lab',
    blurb: 'Flip coins, roll dice and run thousands of trials in a blink.',
    icon: Dices,
    color: 'var(--c-green)',
    keywords: ['simulation', 'coin', 'dice', 'random', 'histogram', 'distribution'],
  },
  {
    id: 'unit-circle',
    title: 'Unit Circle & Waves',
    blurb: 'Turn an angle and watch sine and cosine trace out waves.',
    icon: Orbit,
    color: 'var(--c-aqua)',
    keywords: ['trigonometry', 'sine', 'cosine', 'angle', 'radians', 'wave'],
  },
  {
    id: 'data-lab',
    title: 'Data Lab',
    blurb: 'Draw or paste data, get statistics and a line of best fit.',
    icon: ChartScatter,
    color: 'var(--c-orange)',
    keywords: ['statistics', 'regression', 'mean', 'scatter', 'correlation', 'data'],
  },
  {
    id: 'calculator',
    title: 'Calculator',
    blurb: 'Evaluate expressions with variables, units and complex numbers.',
    icon: Calculator,
    color: 'var(--c-violet)',
    keywords: ['calculator', 'evaluate', 'units', 'complex', 'expression'],
  },
]

export const toolById = new Map(TOOLS.map((t) => [t.id, t]))

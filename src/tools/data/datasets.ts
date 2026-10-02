import type { Vec2 } from '@/math/linalg'
import { createRng } from '@/math/random'
import type { View } from '@/viz/scale'

export interface ScatterDataset {
  id: string
  name: string
  xLabel: string
  yLabel: string
  points: Vec2[]
  view: View
}

export interface ValuesDataset {
  id: string
  name: string
  unit: string
  values: number[]
  range: [number, number]
}

function noisyLine(
  seed: number,
  n: number,
  slope: number,
  intercept: number,
  noise: number,
  xMin: number,
  xMax: number,
): Vec2[] {
  const rng = createRng(seed)
  return Array.from({ length: n }, () => {
    const x = Math.round(rng.uniform(xMin, xMax) * 10) / 10
    const y = Math.round((slope * x + intercept + rng.normal(0, noise)) * 10) / 10
    return [x, y] as Vec2
  })
}

export const SCATTER_DATASETS: ScatterDataset[] = [
  {
    id: 'study',
    name: 'Study time vs score',
    xLabel: 'hours studied',
    yLabel: 'test score',
    points: noisyLine(11, 14, 6, 40, 6, 0.5, 9),
    view: { xMin: -0.5, xMax: 10.5, yMin: 20, yMax: 110 },
  },
  {
    id: 'icecream',
    name: 'Temperature vs ice-cream sales',
    xLabel: '°C',
    yLabel: 'sales',
    points: noisyLine(5, 16, 9, -40, 18, 12, 34),
    view: { xMin: 8, xMax: 38, yMin: 0, yMax: 330 },
  },
  {
    id: 'cars',
    name: 'Car age vs price',
    xLabel: 'age (years)',
    yLabel: 'price ($k)',
    points: noisyLine(23, 14, -2.4, 30, 2.5, 0, 10),
    view: { xMin: -0.5, xMax: 10.5, yMin: 0, yMax: 40 },
  },
  {
    id: 'random',
    name: 'No relationship',
    xLabel: 'x',
    yLabel: 'y',
    points: noisyLine(42, 16, 0, 5, 2.2, 0, 10),
    view: { xMin: -0.5, xMax: 10.5, yMin: -1, yMax: 11 },
  },
]

export const VALUES_DATASETS: ValuesDataset[] = [
  {
    id: 'quiz',
    name: 'Quiz scores',
    unit: 'points',
    values: [6, 7, 7, 8, 9, 5, 7, 10],
    range: [0, 10],
  },
  {
    id: 'salaries',
    name: 'Salaries with a CEO',
    unit: '$k',
    values: [30, 32, 35, 36, 38, 40, 42, 150],
    range: [0, 160],
  },
  {
    id: 'commute',
    name: 'Commute times',
    unit: 'minutes',
    values: [12, 15, 18, 20, 22, 25, 25, 30, 35, 45],
    range: [0, 50],
  },
]

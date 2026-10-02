import type { Milestone, Track } from './types'

export const TRACKS: Track[] = [
  {
    id: 'full',
    title: 'Full Journey',
    blurb: 'Everything on the map, from number sense to machine learning.',
    goals: null,
  },
  {
    id: 'ml',
    title: 'Math for ML & Data Science',
    blurb:
      'Exactly the math behind modern machine learning: gradients, matrices, probability and the models built from them.',
    goals: [
      'gradient-descent',
      'linear-regression',
      'logistic-regression',
      'neural-networks',
      'pca',
      'bayes-theorem',
      'maximum-likelihood',
      'entropy-information',
    ],
  },
]

export const trackById = new Map(TRACKS.map((t) => [t.id, t]))

export const MILESTONES: Milestone[] = [
  {
    id: 'arithmetic',
    title: 'Arithmetic, fractions & percentages',
    example: 'Working out 3/4 of 60, or a 15% tip',
    goals: ['decimals-percentages', 'ratios-proportions', 'exponents', 'primes-factorization'],
  },
  {
    id: 'equations',
    title: 'Solving equations & graphing lines',
    example: 'Solving 3x + 5 = 20, drawing y = 2x + 1',
    goals: ['inequalities', 'systems-of-equations'],
  },
  {
    id: 'functions',
    title: 'Functions, quadratics, exponentials & logs',
    example: 'Finding the roots of x² − 5x + 6, knowing what log₂ 8 means',
    goals: ['quadratics', 'logarithms', 'function-transformations', 'sequences'],
  },
  {
    id: 'geometry',
    title: 'Geometry & basic trigonometry',
    example: 'Using Pythagoras, or sin and cos in a right triangle',
    goals: [
      'right-triangle-trig',
      'volume-surface-area',
      'distance-midpoint',
      'geometric-transformations',
    ],
  },
  {
    id: 'probability',
    title: 'Basic probability & statistics',
    example: 'The chance of two heads, the mean and spread of some data',
    goals: ['conditional-probability', 'variance-std'],
  },
  {
    id: 'calculus',
    title: 'Derivatives & integrals',
    example: 'Differentiating x³, finding the area under a curve',
    goals: ['derivative-rules', 'fundamental-theorem'],
  },
  {
    id: 'vectors',
    title: 'Vectors & matrices',
    example: 'Multiplying two matrices, computing a determinant',
    goals: ['matrix-multiplication', 'determinant', 'dot-product'],
  },
]

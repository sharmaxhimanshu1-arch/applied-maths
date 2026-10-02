import type { Area, AreaId, Domain, DomainId } from './types'

/** Areas group domains and own the colour. Order = lane order on the map = palette order. */
export const AREAS: Area[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    color: 'var(--area-foundations)',
    blurb: 'Number sense, logic, sets and counting: the ground everything stands on.',
  },
  {
    id: 'algebra',
    title: 'Algebra & Functions',
    color: 'var(--area-algebra)',
    blurb: 'Unknowns, equations and the functions that connect inputs to outputs.',
  },
  {
    id: 'geometry',
    title: 'Geometry & Trigonometry',
    color: 'var(--area-geometry)',
    blurb: 'Shapes, space, angles, and the circle that turns into every wave.',
  },
  {
    id: 'calculus',
    title: 'Calculus & Change',
    color: 'var(--area-calculus)',
    blurb: 'Rates of change, accumulation, and equations that predict motion.',
  },
  {
    id: 'linear-algebra',
    title: 'Linear Algebra',
    color: 'var(--area-linear-algebra)',
    blurb: 'Vectors and matrices: the language of space, data and transformations.',
  },
  {
    id: 'probability',
    title: 'Probability & Statistics',
    color: 'var(--area-probability)',
    blurb: 'Reasoning about chance and learning from data.',
  },
  {
    id: 'applied',
    title: 'Applied & ML',
    color: 'var(--area-applied)',
    blurb: 'Where it all pays off: machine learning, signals, networks and cryptography.',
  },
]

/** Domains in map-lane order (top to bottom). */
export const DOMAINS: Domain[] = [
  {
    id: 'numbers',
    title: 'Numbers',
    area: 'foundations',
    blurb: 'What numbers are and how they behave.',
  },
  {
    id: 'discrete',
    title: 'Discrete Math',
    area: 'foundations',
    blurb: 'Logic, sets, counting and networks.',
  },
  {
    id: 'algebra',
    title: 'Algebra',
    area: 'algebra',
    blurb: 'Working with unknowns and equations.',
  },
  {
    id: 'functions',
    title: 'Functions',
    area: 'algebra',
    blurb: 'Machines that turn inputs into outputs.',
  },
  { id: 'geometry', title: 'Geometry', area: 'geometry', blurb: 'Shape, size and position.' },
  {
    id: 'trigonometry',
    title: 'Trigonometry',
    area: 'geometry',
    blurb: 'Angles, circles and waves.',
  },
  { id: 'calculus', title: 'Calculus', area: 'calculus', blurb: 'Change and accumulation.' },
  {
    id: 'multivariable',
    title: 'Multivariable Calculus',
    area: 'calculus',
    blurb: 'Calculus on surfaces and in space.',
  },
  {
    id: 'differential-equations',
    title: 'Differential Equations',
    area: 'calculus',
    blurb: 'Rules of change that predict the future.',
  },
  {
    id: 'linear-algebra',
    title: 'Linear Algebra',
    area: 'linear-algebra',
    blurb: 'Vectors, matrices and transformations.',
  },
  {
    id: 'probability',
    title: 'Probability',
    area: 'probability',
    blurb: 'The mathematics of chance.',
  },
  { id: 'statistics', title: 'Statistics', area: 'probability', blurb: 'Learning from data.' },
  {
    id: 'applied',
    title: 'Applied & ML',
    area: 'applied',
    blurb: 'Machine learning, signals and security.',
  },
]

export const areaById = new Map<AreaId, Area>(AREAS.map((a) => [a.id, a]))
export const domainById = new Map<DomainId, Domain>(DOMAINS.map((d) => [d.id, d]))

export function areaOf(domain: DomainId): Area {
  return areaById.get(domainById.get(domain)!.area)!
}

export function domainColor(domain: DomainId): string {
  return areaOf(domain).color
}

export type AreaId =
  'foundations' | 'algebra' | 'geometry' | 'calculus' | 'linear-algebra' | 'probability' | 'applied'

export type DomainId =
  | 'numbers'
  | 'discrete'
  | 'algebra'
  | 'functions'
  | 'geometry'
  | 'trigonometry'
  | 'calculus'
  | 'multivariable'
  | 'differential-equations'
  | 'linear-algebra'
  | 'probability'
  | 'statistics'
  | 'applied'

/** 1 = early school · 2 = school basics · 3 = upper school · 4 = first-year university · 5 = advanced */
export type Level = 1 | 2 | 3 | 4 | 5

export type ConceptId = string

export interface Concept {
  /** Stable kebab-case id, used in URLs and saved progress. Never rename. */
  id: ConceptId
  title: string
  /** Optional shorter title for tight spaces (map nodes). */
  short?: string
  domain: DomainId
  level: Level
  /** Hard prerequisites: the edges of the knowledge map. Keep them non-redundant. */
  prerequisites: ConceptId[]
  /** One-line hook shown on the map and in search. */
  summary: string
  estMinutes: number
  /** Extra search keywords. */
  tags?: string[]
}

export interface Area {
  id: AreaId
  title: string
  /** CSS colour (a token reference). */
  color: string
  blurb: string
}

export interface Domain {
  id: DomainId
  title: string
  area: AreaId
  blurb: string
}

export interface Track {
  id: string
  title: string
  blurb: string
  /** Goal concepts; the track is every goal plus all of its prerequisites. `null` = everything. */
  goals: ConceptId[] | null
}

/** "What are you already comfortable with?" options used by onboarding. */
export interface Milestone {
  id: string
  title: string
  example: string
  /** Marking a milestone known marks these concepts and all their prerequisites known. */
  goals: ConceptId[]
}

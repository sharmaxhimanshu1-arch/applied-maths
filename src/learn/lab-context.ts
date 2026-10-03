import { createContext, useContext } from 'react'
import type { ConceptId } from '@/curriculum/types'

export interface SectionInfo {
  id: string
  title: string
}

export interface LabContextValue {
  conceptId: ConceptId
  /** Challenges register themselves; mastery = every registered challenge solved. */
  registerCheck(id: string): () => void
  solveCheck(id: string, correct: boolean): void
  isSolved(id: string): boolean
  completeTryThis(id: string): void
  isTryThisDone(id: string): boolean
  registerSection(section: SectionInfo): () => void
  sections: SectionInfo[]
  required: string[]
  justMastered: boolean
  dismissMastery(): void
}

export const LabContext = createContext<LabContextValue | null>(null)

export function useLab(): LabContextValue {
  const ctx = useContext(LabContext)
  if (!ctx) throw new Error('useLab must be used inside <LabProvider>')
  return ctx
}

/** Optional variant for components that also work outside a lab (e.g. tool pages). */
export function useOptionalLab(): LabContextValue | null {
  return useContext(LabContext)
}

/** Mastery progress for the current lab (used in the side rail). */
export function useMasteryProgress() {
  const lab = useLab()
  const solved = lab.required.filter((id) => lab.isSolved(id)).length
  return { solved, total: lab.required.length }
}

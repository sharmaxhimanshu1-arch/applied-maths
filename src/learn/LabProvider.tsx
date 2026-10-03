import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { ConceptId } from '@/curriculum/types'
import { useProgress } from '@/progress/store'
import { LabContext, type LabContextValue, type SectionInfo } from './lab-context'

type Props = {
  conceptId: ConceptId
  /** Lite labs also require at least one completed "Try this" before mastery. */
  requireExploration?: boolean
  children: ReactNode
}

export function LabProvider({ conceptId, requireExploration = false, children }: Props) {
  const progress = useProgress((s) => s.concepts[conceptId])
  const recordCheck = useProgress((s) => s.recordCheck)
  const completeTryThisStore = useProgress((s) => s.completeTryThis)
  const markMastered = useProgress((s) => s.markMastered)

  const [required, setRequired] = useState<string[]>([])
  const [sections, setSections] = useState<SectionInfo[]>([])
  const [justMastered, setJustMastered] = useState(false)

  const registerCheck = useCallback((id: string) => {
    setRequired((prev) => (prev.includes(id) ? prev : [...prev, id]))
    return () => setRequired((prev) => prev.filter((x) => x !== id))
  }, [])

  const registerSection = useCallback((section: SectionInfo) => {
    setSections((prev) => (prev.some((s) => s.id === section.id) ? prev : [...prev, section]))
    return () => setSections((prev) => prev.filter((s) => s.id !== section.id))
  }, [])

  const solveCheck = useCallback(
    (id: string, correct: boolean) => recordCheck(conceptId, id, correct),
    [conceptId, recordCheck],
  )
  const completeTryThis = useCallback(
    (id: string) => completeTryThisStore(conceptId, id),
    [conceptId, completeTryThisStore],
  )

  const checks = progress?.checks
  const tryThis = progress?.tryThis
  const status = progress?.status

  // Mastery: every registered challenge solved (and some exploration for lite labs).
  const wasMastered = useRef(status === 'mastered')
  useEffect(() => {
    if (status === 'mastered' || !required.length) return
    const allSolved = required.every((id) => checks?.[id])
    const explored = !requireExploration || (tryThis?.length ?? 0) > 0
    if (allSolved && explored) markMastered(conceptId)
  }, [required, checks, tryThis, status, requireExploration, markMastered, conceptId])

  // Celebrate only the transition that happens while the learner is on the page.
  useEffect(() => {
    if (status === 'mastered' && !wasMastered.current) {
      wasMastered.current = true
      setJustMastered(true)
    }
  }, [status])

  const value = useMemo<LabContextValue>(
    () => ({
      conceptId,
      registerCheck,
      solveCheck,
      isSolved: (id) => !!checks?.[id],
      completeTryThis,
      isTryThisDone: (id) => !!tryThis?.includes(id),
      registerSection,
      sections,
      required,
      justMastered,
      dismissMastery: () => setJustMastered(false),
    }),
    [
      conceptId,
      registerCheck,
      solveCheck,
      checks,
      completeTryThis,
      tryThis,
      registerSection,
      sections,
      required,
      justMastered,
    ],
  )

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>
}

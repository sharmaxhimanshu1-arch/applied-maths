import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import type { ConceptId } from '@/curriculum/types'

export type ConceptStatus = 'started' | 'explored' | 'mastered' | 'known'
export type ThemeSetting = 'system' | 'light' | 'dark'

export interface ConceptProgress {
  status: ConceptStatus
  firstSeen: number
  lastSeen: number
  /** Ids of "Try this" prompts completed. */
  tryThis: string[]
  /** Challenge / quick-check id → solved. */
  checks: Record<string, boolean>
}

export interface Settings {
  theme: ThemeSetting
  reducedMotion: boolean
}

export interface ProgressData {
  concepts: Record<ConceptId, ConceptProgress>
  goal: ConceptId | null
  track: string
  onboarded: boolean
  lastVisited: ConceptId | null
  /** Local dates (YYYY-MM-DD) with any learning activity, oldest first. */
  activity: string[]
  settings: Settings
}

interface ProgressActions {
  visit(id: ConceptId): void
  completeTryThis(id: ConceptId, promptId: string): void
  recordCheck(id: ConceptId, checkId: string, correct: boolean): void
  markMastered(id: ConceptId): void
  /** Mark concepts as already known (skips ones already mastered). */
  markKnown(ids: Iterable<ConceptId>): void
  resetConcept(id: ConceptId): void
  setGoal(id: ConceptId | null): void
  setTrack(id: string): void
  setOnboarded(value: boolean): void
  setTheme(theme: ThemeSetting): void
  setReducedMotion(value: boolean): void
  importData(data: ProgressData): void
  resetAll(): void
}

export type ProgressState = ProgressData & ProgressActions

export const STORAGE_KEY = 'aml-progress'
export const STORAGE_VERSION = 1
const MAX_ACTIVITY_DAYS = 400

export const initialProgress: ProgressData = {
  concepts: {},
  goal: null,
  track: 'full',
  onboarded: false,
  lastVisited: null,
  activity: [],
  settings: { theme: 'system', reducedMotion: false },
}

/** localStorage that never throws (private windows, sandboxed frames, quota errors). */
const safeStorage: StateStorage = {
  getItem: (key) => {
    try {
      return globalThis.localStorage?.getItem(key) ?? null
    } catch {
      return null
    }
  },
  setItem: (key, value) => {
    try {
      globalThis.localStorage?.setItem(key, value)
    } catch {
      /* storage unavailable: progress lives in memory for this session */
    }
  },
  removeItem: (key) => {
    try {
      globalThis.localStorage?.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}

export function localDay(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function withActivity(activity: string[], now = new Date()): string[] {
  const day = localDay(now)
  if (activity[activity.length - 1] === day) return activity
  return [...activity, day].slice(-MAX_ACTIVITY_DAYS)
}

const rank: Record<ConceptStatus, number> = { started: 0, explored: 1, known: 2, mastered: 3 }

/** Never downgrade: mastered stays mastered when you revisit. */
function promote(current: ConceptStatus | undefined, next: ConceptStatus): ConceptStatus {
  if (!current) return next
  return rank[next] > rank[current] ? next : current
}

function touch(
  concepts: Record<ConceptId, ConceptProgress>,
  id: ConceptId,
  update: (p: ConceptProgress) => ConceptProgress,
): Record<ConceptId, ConceptProgress> {
  const now = Date.now()
  const existing = concepts[id] ?? {
    status: 'started' as const,
    firstSeen: now,
    lastSeen: now,
    tryThis: [],
    checks: {},
  }
  return { ...concepts, [id]: update({ ...existing, lastSeen: now }) }
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...initialProgress,

      visit: (id) =>
        set((s) => ({
          concepts: touch(s.concepts, id, (p) => p),
          lastVisited: id,
          activity: withActivity(s.activity),
        })),

      completeTryThis: (id, promptId) =>
        set((s) => ({
          concepts: touch(s.concepts, id, (p) => ({
            ...p,
            status: promote(p.status, 'explored'),
            tryThis: p.tryThis.includes(promptId) ? p.tryThis : [...p.tryThis, promptId],
          })),
          activity: withActivity(s.activity),
        })),

      recordCheck: (id, checkId, correct) =>
        set((s) => ({
          concepts: touch(s.concepts, id, (p) => ({
            ...p,
            status: promote(p.status, 'explored'),
            // Once solved, a check stays solved.
            checks: { ...p.checks, [checkId]: p.checks[checkId] || correct },
          })),
          activity: withActivity(s.activity),
        })),

      markMastered: (id) =>
        set((s) => ({
          concepts: touch(s.concepts, id, (p) => ({ ...p, status: 'mastered' })),
          activity: withActivity(s.activity),
        })),

      markKnown: (ids) =>
        set((s) => {
          let concepts = s.concepts
          for (const id of ids) {
            if (concepts[id]?.status === 'mastered') continue
            concepts = touch(concepts, id, (p) => ({ ...p, status: 'known' }))
          }
          return { concepts }
        }),

      resetConcept: (id) =>
        set((s) => {
          const { [id]: _removed, ...rest } = s.concepts
          return { concepts: rest }
        }),

      setGoal: (goal) => set({ goal }),
      setTrack: (track) => set({ track }),
      setOnboarded: (onboarded) => set({ onboarded }),
      setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),
      setReducedMotion: (reducedMotion) =>
        set((s) => ({ settings: { ...s.settings, reducedMotion } })),
      importData: (data) => set({ ...initialProgress, ...data }),
      resetAll: () => set((s) => ({ ...initialProgress, settings: s.settings })),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s): ProgressData => ({
        concepts: s.concepts,
        goal: s.goal,
        track: s.track,
        onboarded: s.onboarded,
        lastVisited: s.lastVisited,
        activity: s.activity,
        settings: s.settings,
      }),
      // Future schema changes go here, keyed by the stored version.
      migrate: (persisted) => ({ ...initialProgress, ...(persisted as Partial<ProgressData>) }),
    },
  ),
)

export function isDoneStatus(status: ConceptStatus | undefined): boolean {
  return status === 'mastered' || status === 'known'
}

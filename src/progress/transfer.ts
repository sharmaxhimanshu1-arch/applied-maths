import { conceptById } from '@/curriculum'
import { initialProgress, STORAGE_VERSION, type ConceptProgress, type ProgressData } from './store'

const APP = 'applied-maths-lab'

export interface ProgressFile {
  app: typeof APP
  version: number
  exportedAt: string
  data: ProgressData
}

export function exportProgress(data: ProgressData, now = new Date()): string {
  const file: ProgressFile = {
    app: APP,
    version: STORAGE_VERSION,
    exportedAt: now.toISOString(),
    data,
  }
  return JSON.stringify(file, null, 2)
}

const STATUSES = new Set(['started', 'explored', 'mastered', 'known'])

/** Parse an exported file; unknown concepts and malformed entries are dropped, not trusted. */
export function parseProgress(
  json: string,
): { ok: true; data: ProgressData } | { ok: false; error: string } {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' }
  }
  const file = raw as Partial<ProgressFile>
  if (!file || file.app !== APP || typeof file.data !== 'object' || file.data === null) {
    return { ok: false, error: 'That file was not exported from Applied Maths Lab.' }
  }
  const d = file.data as Partial<ProgressData>
  const concepts: Record<string, ConceptProgress> = {}
  for (const [id, p] of Object.entries(d.concepts ?? {})) {
    if (!conceptById.has(id) || !p || !STATUSES.has(p.status)) continue
    concepts[id] = {
      status: p.status,
      firstSeen: Number(p.firstSeen) || Date.now(),
      lastSeen: Number(p.lastSeen) || Date.now(),
      tryThis: Array.isArray(p.tryThis) ? p.tryThis.filter((x) => typeof x === 'string') : [],
      checks:
        p.checks && typeof p.checks === 'object'
          ? Object.fromEntries(Object.entries(p.checks).filter(([, v]) => typeof v === 'boolean'))
          : {},
    }
  }
  const theme = d.settings?.theme
  return {
    ok: true,
    data: {
      concepts,
      goal: d.goal && conceptById.has(d.goal) ? d.goal : null,
      track: d.track === 'ml' ? 'ml' : 'full',
      onboarded: d.onboarded === true,
      lastVisited: d.lastVisited && conceptById.has(d.lastVisited) ? d.lastVisited : null,
      activity: Array.isArray(d.activity)
        ? d.activity.filter((x) => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x))
        : [],
      settings: {
        theme: theme === 'light' || theme === 'dark' ? theme : 'system',
        reducedMotion: d.settings?.reducedMotion === true,
      },
    },
  }
}

export { initialProgress }

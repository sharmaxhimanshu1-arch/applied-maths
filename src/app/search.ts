import { CONCEPTS, domainById } from '@/curriculum'
import type { Concept } from '@/curriculum/types'
import { TOOLS, type ToolInfo } from '@/tools/registry'

export type SearchResult =
  | { kind: 'concept'; concept: Concept; score: number }
  | { kind: 'tool'; tool: ToolInfo; score: number }

function scoreWord(word: string, fields: { text: string; weight: number }[]): number {
  let best = 0
  for (const { text, weight } of fields) {
    const t = text.toLowerCase()
    if (t.startsWith(word)) best = Math.max(best, weight * 1.5)
    else if (new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(t))
      best = Math.max(best, weight * 1.2)
    else if (t.includes(word)) best = Math.max(best, weight)
  }
  return best
}

/** Every query word must match somewhere; titles count most, then tags, then summaries. */
export function search(query: string, limit = 12): SearchResult[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const results: SearchResult[] = []

  for (const concept of CONCEPTS) {
    const fields = [
      { text: concept.title, weight: 10 },
      { text: concept.short ?? '', weight: 8 },
      { text: (concept.tags ?? []).join(' '), weight: 6 },
      { text: domainById.get(concept.domain)!.title, weight: 3 },
      { text: concept.summary, weight: 2 },
    ]
    let score = 0
    for (const w of words) {
      const s = scoreWord(w, fields)
      if (!s) {
        score = 0
        break
      }
      score += s
    }
    if (score) results.push({ kind: 'concept', concept, score })
  }

  for (const tool of TOOLS) {
    const fields = [
      { text: tool.title, weight: 10 },
      { text: tool.keywords.join(' '), weight: 6 },
      { text: tool.blurb, weight: 2 },
    ]
    let score = 0
    for (const w of words) {
      const s = scoreWord(w, fields)
      if (!s) {
        score = 0
        break
      }
      score += s
    }
    if (score) results.push({ kind: 'tool', tool, score: score + 1 })
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}

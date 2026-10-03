import { loadLiteContent } from '@/content'
import type { QuickCheck } from '@/content/types'
import type { ConceptId } from '@/curriculum/types'
import { hasDeepLab } from '@/labs/registry'

/** The questions a concept is reviewed with: its quick checks, or the deep-lab review set. */
export async function loadReviewQuestions(id: ConceptId): Promise<QuickCheck[]> {
  if (hasDeepLab(id)) return (await import('./deep')).default[id] ?? []
  return (await loadLiteContent(id))?.checks ?? []
}

/** Rotate through the pool so consecutive reviews ask different questions. */
export function pickQuestion(questions: readonly QuickCheck[], reps: number): QuickCheck | null {
  if (!questions.length) return null
  return questions[reps % questions.length]
}

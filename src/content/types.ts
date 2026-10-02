import type { ConceptId } from '@/curriculum/types'
import type { WidgetSpec } from '@/widgets/types'

/** Strings support $inline math$, $$display math$$, **bold** and *italic* (see RichText). */
export type QuickCheck =
  | {
      kind: 'mcq'
      id: string
      prompt: string
      options: { text: string; correct?: boolean; why?: string }[]
      explain: string
      hint?: string
    }
  | {
      kind: 'numeric'
      id: string
      prompt: string
      answer: number
      tolerance?: number
      unit?: string
      explain: string
      hint?: string
    }
  | {
      kind: 'expression'
      id: string
      prompt: string
      answer: string
      vars?: string[]
      explain: string
      hint?: string
    }

/** Everything a concept page needs when it has no hand-built deep lab yet. */
export interface LiteContent {
  /** Why it matters / the intuition, 1–3 short paragraphs. */
  hook: string
  /** The ready-made interactive and its self-ticking prompts. */
  explore: WidgetSpec
  /** Formalization after exploring. */
  explain: string
  formula?: { tex: string; caption?: string }
  misconception?: string
  checks: QuickCheck[]
  realWorld: { title: string; body: string }[]
  takeaways?: string[]
}

export type ContentModule = Partial<Record<ConceptId, LiteContent>>

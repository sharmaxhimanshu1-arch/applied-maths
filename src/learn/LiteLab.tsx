import { Wrench } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { loadLiteContent } from '@/content'
import type { LiteContent, QuickCheck } from '@/content/types'
import type { Concept } from '@/curriculum/types'
import { ButtonLink } from '@/ui/Button'
import { Inline, RichText } from '@/ui/RichText'
import { WidgetRenderer } from '@/widgets/WidgetRenderer'
import {
  Callout,
  Figure,
  Formula,
  LabSection,
  RealWorld,
  Takeaways,
  TryThis,
  TryThisList,
} from './blocks'
import { ChallengeSet, ExpressionChallenge, McqChallenge, NumericChallenge } from './challenges'

/** Generic lab for concepts without a hand-built deep lab: driven entirely by content data. */
export function LiteLab({ concept }: { concept: Concept }) {
  const [content, setContent] = useState<LiteContent | null | undefined>(undefined)
  useEffect(() => {
    let alive = true
    void loadLiteContent(concept.id).then((c) => alive && setContent(c ?? null))
    return () => {
      alive = false
    }
  }, [concept.id])

  if (content === undefined)
    return <div className="h-96 animate-pulse rounded-2xl bg-surface-2" aria-busy="true" />
  if (content === null) return <ComingSoon concept={concept} />
  return <LiteLabBody content={content} />
}

function LiteLabBody({ content }: { content: LiteContent }) {
  const [state, setState] = useState<unknown>(null)
  const onState = useCallback((s: unknown) => setState(s), [])
  const spec = content.explore

  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Why it matters">
        <RichText text={content.hook} className="prose-lab max-w-[68ch]" />
      </LabSection>

      <LabSection id="explore" eyebrow="Explore" title="Play with it">
        <Figure caption={spec.caption && <Inline text={spec.caption} />}>
          <WidgetRenderer spec={spec} onStateChange={onState} />
        </Figure>
        {spec.tryThis.length > 0 && (
          <TryThisList>
            {spec.tryThis.map((t) => (
              <TryThis
                key={t.id}
                id={t.id}
                when={evaluateWhen(t.when as (s: unknown) => boolean, state)}
              >
                <Inline text={t.text} />
              </TryThis>
            ))}
          </TryThisList>
        )}
      </LabSection>

      <LabSection id="formalize" eyebrow="Formalize" title="Putting it into symbols">
        <RichText text={content.explain} className="prose-lab max-w-[68ch]" />
        {content.formula && (
          <Formula
            tex={content.formula.tex}
            caption={content.formula.caption && <Inline text={content.formula.caption} />}
          />
        )}
        {content.misconception && (
          <Callout kind="misconception">
            <RichText text={content.misconception} />
          </Callout>
        )}
      </LabSection>

      <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
        <ChallengeSet>
          {content.checks.map((c, i) => (
            <CheckView key={c.id} check={c} index={i + 1} />
          ))}
        </ChallengeSet>
      </LabSection>

      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet it">
        <RealWorld items={content.realWorld} />
      </LabSection>

      {content.takeaways && (
        <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
          <Takeaways items={content.takeaways} />
        </LabSection>
      )}
    </div>
  )
}

function evaluateWhen(when: (s: unknown) => boolean, state: unknown): boolean {
  if (state === null) return false
  try {
    return !!when(state)
  } catch {
    return false
  }
}

export function CheckView({ check, index }: { check: QuickCheck; index: number }) {
  switch (check.kind) {
    case 'mcq':
      return (
        <McqChallenge
          id={check.id}
          index={index}
          prompt={check.prompt}
          options={check.options}
          explanation={check.explain}
          hint={check.hint}
        />
      )
    case 'numeric':
      return (
        <NumericChallenge
          id={check.id}
          index={index}
          prompt={check.prompt}
          answer={check.answer}
          tolerance={check.tolerance}
          unit={check.unit}
          explanation={check.explain}
          hint={check.hint}
        />
      )
    case 'expression':
      return (
        <ExpressionChallenge
          id={check.id}
          index={index}
          prompt={check.prompt}
          answer={check.answer}
          vars={check.vars}
          explanation={check.explain}
          hint={check.hint}
        />
      )
  }
}

function ComingSoon({ concept }: { concept: Concept }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong p-8 text-center">
      <Wrench className="mx-auto size-8 text-ink-3" aria-hidden />
      <h2 className="mt-3 text-xl font-semibold">This lab is being built</h2>
      <p className="mx-auto mt-2 max-w-md text-ink-2">
        {concept.summary} In the meantime, the tools let you explore the idea directly.
      </p>
      <ButtonLink to="/tools" variant="primary" className="mt-5">
        Open the tools
      </ButtonLink>
    </div>
  )
}

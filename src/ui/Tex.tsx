import { memo, useMemo } from 'react'
import { renderTex } from './tex'

type TexProps = {
  children: string
  display?: boolean
  className?: string
}

/** Render a LaTeX string with KaTeX. */
export const Tex = memo(function Tex({ children, display = false, className }: TexProps) {
  const html = useMemo(() => renderTex(children, display), [children, display])
  if (display) return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
})

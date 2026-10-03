import katex from 'katex'

const cache = new Map<string, string>()

/** KaTeX → HTML string (memoised). Includes MathML so screen readers can read the math. */
export function renderTex(tex: string, display = false): string {
  const key = (display ? 'D:' : 'I:') + tex
  let html = cache.get(key)
  if (html === undefined) {
    html = katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      strict: 'ignore',
      trust: false,
    })
    if (cache.size > 2000) cache.clear()
    cache.set(key, html)
  }
  return html
}

/**
 * A rough plain-text reading of RichText ("$\\frac{1}{2}$ of **x**" → "(1)/(2) of x"), used as
 * an accessible name where the visible label is only typeset math.
 */
export function texToPlain(text: string): string {
  return text
    .replace(/\$\$?([^$]+)\$\$?/g, (_, tex: string) =>
      tex
        .replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
        .replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)')
        .replace(/\\(?:cdot|times)/g, '×')
        .replace(/\\le(?:q)?\b/g, '≤')
        .replace(/\\ge(?:q)?\b/g, '≥')
        .replace(/\\pm/g, '±')
        .replace(/\\pi/g, 'π')
        .replace(/\\theta/g, 'θ')
        .replace(/\\[a-zA-Z]+/g, (m) => m.slice(1))
        .replace(/[{}]/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .replace(/\*\*?/g, '')
}

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

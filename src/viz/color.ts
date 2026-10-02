/** Resolve a CSS colour (including var(--token)) to a concrete value canvas can use. */
export function cssColor(value: string, el: Element = document.documentElement): string {
  const m = /^var\((--[\w-]+)\)$/.exec(value.trim())
  if (!m) return value
  return getComputedStyle(el).getPropertyValue(m[1]).trim() || '#888'
}

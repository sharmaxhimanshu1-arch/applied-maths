import { describe, expect, it } from 'vitest'
import { texToPlain } from './tex'

describe('texToPlain', () => {
  it('reads inline math as plain text', () => {
    expect(texToPlain('$-2$')).toBe('-2')
    expect(texToPlain('$\\tfrac{1}{2}$ of it')).toBe('(1)/(2) of it')
    expect(texToPlain('$x \\le -4$')).toBe('x ≤ -4')
    expect(texToPlain('$\\sqrt{13}$')).toBe('sqrt(13)')
    expect(texToPlain('**Bold** $\\pi r^2$')).toBe('Bold π r^2')
  })
})

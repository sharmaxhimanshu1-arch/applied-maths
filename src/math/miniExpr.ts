/**
 * A small, safe expression evaluator for typed answers (no eval, no math.js needed).
 * Understands: numbers, + − × ÷ * / ^, parentheses, implicit multiplication (2x, 3(x+1)),
 * π / pi, e, √, ², ³, and functions sqrt sin cos tan asin acos atan ln log exp abs.
 */

type Node =
  | { k: 'num'; v: number }
  | { k: 'var'; name: string }
  | { k: 'neg'; a: Node }
  | { k: 'bin'; op: '+' | '-' | '*' | '/' | '^'; a: Node; b: Node }
  | { k: 'call'; fn: string; a: Node }

const FUNCS: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp,
  abs: Math.abs,
}
const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E }

type Token = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string }

function normalise(src: string): string {
  return src
    .replace(/[−–]/g, '-')
    .replace(/[×·⋅]/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, ' pi ')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/√/g, ' sqrt ')
}

function tokenize(src: string): Token[] {
  const s = normalise(src)
  const out: Token[] = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (/\s/.test(c)) {
      i++
      continue
    }
    const num = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i))
    if (num) {
      out.push({ t: 'num', v: Number(num[0]) })
      i += num[0].length
      continue
    }
    const id = /^[a-z]+/i.exec(s.slice(i))
    if (id) {
      // Split runs like "2xy" or "pix" into known names and single-letter variables.
      let word = id[0].toLowerCase()
      while (word.length) {
        const known = [...Object.keys(FUNCS), ...Object.keys(CONSTS)]
          .filter((k) => word.startsWith(k))
          .sort((a, b) => b.length - a.length)[0]
        const piece = known ?? word[0]
        out.push({ t: 'id', v: piece })
        word = word.slice(piece.length)
      }
      i += id[0].length
      continue
    }
    if ('+-*/^(),'.includes(c)) {
      out.push({ t: 'op', v: c })
      i++
      continue
    }
    throw new Error(`Unexpected "${c}"`)
  }
  // Insert implicit multiplication: 2x, 2(…), )(, x(…) for variables, )x, 2pi
  const withMul: Token[] = []
  for (let j = 0; j < out.length; j++) {
    const a = out[j - 1]
    const b = out[j]
    const aEnds =
      a && (a.t === 'num' || (a.t === 'id' && !(a.v in FUNCS)) || (a.t === 'op' && a.v === ')'))
    const bStarts = b.t === 'num' || b.t === 'id' || (b.t === 'op' && b.v === '(')
    if (aEnds && bStarts && !(a.t === 'num' && b.t === 'num')) withMul.push({ t: 'op', v: '*' })
    withMul.push(b)
  }
  return withMul
}

function parse(tokens: Token[]): Node {
  let pos = 0
  const peek = () => tokens[pos]
  const isOp = (v: string) => peek()?.t === 'op' && peek()!.v === v

  function expr(): Node {
    let node = term()
    while (isOp('+') || isOp('-')) {
      const op = (tokens[pos++] as { v: '+' | '-' }).v
      node = { k: 'bin', op, a: node, b: term() }
    }
    return node
  }
  function term(): Node {
    let node = unary()
    while (isOp('*') || isOp('/')) {
      const op = (tokens[pos++] as { v: '*' | '/' }).v
      node = { k: 'bin', op, a: node, b: unary() }
    }
    return node
  }
  function unary(): Node {
    if (isOp('-')) {
      pos++
      return { k: 'neg', a: unary() }
    }
    if (isOp('+')) {
      pos++
      return unary()
    }
    return power()
  }
  function power(): Node {
    const base = atom()
    if (isOp('^')) {
      pos++
      return { k: 'bin', op: '^', a: base, b: unary() } // right-associative, allows 2^-1
    }
    return base
  }
  function atom(): Node {
    const tok = tokens[pos++]
    if (!tok) throw new Error('Unexpected end')
    if (tok.t === 'num') return { k: 'num', v: tok.v }
    if (tok.t === 'id') {
      if (tok.v in FUNCS) {
        // Allow "sqrt 2" and "sin x" without parentheses for a single atom.
        const arg = isOp('(') ? atom() : power()
        return { k: 'call', fn: tok.v, a: arg }
      }
      if (tok.v in CONSTS) return { k: 'num', v: CONSTS[tok.v] }
      return { k: 'var', name: tok.v }
    }
    if (tok.v === '(') {
      const inner = expr()
      if (!isOp(')')) throw new Error('Missing )')
      pos++
      return inner
    }
    throw new Error(`Unexpected "${tok.v}"`)
  }

  const tree = expr()
  if (pos < tokens.length) throw new Error(`Unexpected "${(tokens[pos] as { v: string }).v}"`)
  return tree
}

function evaluate(n: Node, scope: Record<string, number>): number {
  switch (n.k) {
    case 'num':
      return n.v
    case 'var':
      if (!(n.name in scope)) throw new Error(`Unknown variable ${n.name}`)
      return scope[n.name]
    case 'neg':
      return -evaluate(n.a, scope)
    case 'call':
      return FUNCS[n.fn](evaluate(n.a, scope))
    case 'bin': {
      const a = evaluate(n.a, scope)
      const b = evaluate(n.b, scope)
      switch (n.op) {
        case '+':
          return a + b
        case '-':
          return a - b
        case '*':
          return a * b
        case '/':
          return a / b
        case '^':
          return a ** b
      }
    }
  }
}

function collectVars(n: Node, out: Set<string>): Set<string> {
  if (n.k === 'var') out.add(n.name)
  else if (n.k === 'neg' || n.k === 'call') collectVars(n.a, out)
  else if (n.k === 'bin') {
    collectVars(n.a, out)
    collectVars(n.b, out)
  }
  return out
}

export type Compiled =
  | { ok: true; vars: Set<string>; evaluate: (scope?: Record<string, number>) => number }
  | { ok: false; error: string }

export function compile(src: string): Compiled {
  if (!src.trim()) return { ok: false, error: 'Empty' }
  try {
    const tree = parse(tokenize(src))
    return {
      ok: true,
      vars: collectVars(tree, new Set()),
      evaluate: (scope = {}) => {
        try {
          return evaluate(tree, scope)
        } catch {
          return NaN
        }
      },
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not read that' }
  }
}

/** Parse a typed number such as "3/4", "-2.5", "2√3" or "π/2". NaN if it is not a pure number. */
export function parseNumber(src: string): number {
  const c = compile(src.replace(/,/g, ''))
  if (!c.ok || c.vars.size) return NaN
  return c.evaluate()
}

/** Within an absolute tolerance, or relative tolerance for big numbers. */
export function numbersMatch(value: number, target: number, tolerance = 1e-6): boolean {
  if (!Number.isFinite(value)) return false
  return Math.abs(value - target) <= Math.max(tolerance, Math.abs(target) * 1e-9)
}

/**
 * Two expressions are treated as equal if they agree at many sample points.
 * Points where either side is undefined are skipped.
 */
export function expressionsMatch(
  a: string,
  b: string,
  vars: readonly string[] = ['x'],
  range: readonly [number, number] = [-3, 3],
): boolean {
  const ca = compile(a)
  const cb = compile(b)
  if (!ca.ok || !cb.ok) return false
  for (const v of ca.vars) if (!vars.includes(v)) return false
  let checked = 0
  let seed = 12345
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  for (let i = 0; i < 40 && checked < 12; i++) {
    const scope = Object.fromEntries(
      vars.map((v) => [v, range[0] + (range[1] - range[0]) * rand()]),
    )
    const va = ca.evaluate(scope)
    const vb = cb.evaluate(scope)
    if (!Number.isFinite(va) || !Number.isFinite(vb)) continue
    if (Math.abs(va - vb) > 1e-6 * Math.max(1, Math.abs(va), Math.abs(vb))) return false
    checked++
  }
  return checked >= 6
}

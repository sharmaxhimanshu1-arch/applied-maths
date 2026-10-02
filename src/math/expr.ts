/**
 * User-typed expressions for the Grapher and Calculator, powered by math.js (loaded on demand,
 * so pages that don't need it never download it).
 */
import type { MathNode } from 'mathjs'

export type MathJs = typeof import('mathjs')

let loading: Promise<MathJs> | null = null
let loaded: MathJs | null = null

export function loadMath(): Promise<MathJs> {
  loading ??= import('mathjs').then((m) => (loaded = m))
  return loading
}

export function mathIfLoaded(): MathJs | null {
  return loaded
}

const FUNCTIONS = [
  'sin',
  'cos',
  'tan',
  'sec',
  'csc',
  'cot',
  'asin',
  'acos',
  'atan',
  'sinh',
  'cosh',
  'tanh',
  'exp',
  'log',
  'log10',
  'log2',
  'sqrt',
  'cbrt',
  'abs',
  'floor',
  'ceil',
  'round',
  'sign',
  'min',
  'max',
  'mod',
  'nthRoot',
]
const CONSTANTS = ['pi', 'theta', 'e']
const ALIASES: Record<string, string> = {
  ln: 'log', // natural log, as on calculators
  log: 'log10',
  arcsin: 'asin',
  arccos: 'acos',
  arctan: 'atan',
}
const KNOWN = [...FUNCTIONS, ...CONSTANTS, ...Object.keys(ALIASES)].sort(
  (a, b) => b.length - a.length,
)

/**
 * Desmos-style input → math.js syntax: unicode symbols, ln/log conventions, and multi-letter
 * runs split into implicit products (ax² → a x², pix → pi x).
 */
export function preprocess(src: string): string {
  const s = src
    .replace(/π/g, ' pi ')
    .replace(/θ/g, ' theta ')
    .replace(/√/g, ' sqrt')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/[·×⋅]/g, '*')
    .replace(/[−–]/g, '-')
    .replace(/÷/g, '/')
  return s.replace(/[A-Za-z]+/g, (word) => {
    const out: string[] = []
    let rest = word
    while (rest.length) {
      const known = KNOWN.find((k) => rest.startsWith(k))
      const piece = known ?? rest[0]
      out.push(ALIASES[piece] ?? piece)
      rest = rest.slice(piece.length)
    }
    return out.join(' ')
  })
}

export type ExprKind = 'function' | 'vertical' | 'polar' | 'point'

export interface CompiledExpr {
  kind: ExprKind
  /** Free parameters (become sliders), sorted. */
  params: string[]
  tex: string
  /** y = f(x) (function), x = c (vertical), r = f(θ) (polar). */
  evaluate(input: number, scope: Record<string, number>): number
  /** For points: [x, y]. */
  point?(scope: Record<string, number>): [number, number]
  derivative?: { evaluate(x: number, scope: Record<string, number>): number; tex: string }
  node: MathNode
}

export type CompileResult = { ok: true; expr: CompiledExpr } | { ok: false; error: string }

function freeSymbols(node: MathNode, exclude: Set<string>): string[] {
  const names = new Set<string>()
  node.traverse((n, path, parent) => {
    if (n.type !== 'SymbolNode') return
    if (parent?.type === 'FunctionNode' && path === 'fn') return
    const name = (n as unknown as { name: string }).name
    if (!exclude.has(name) && !FUNCTIONS.includes(name)) names.add(name)
  })
  return [...names].sort()
}

const BUILTIN = new Set(['x', 'y', 'theta', 'pi', 'e', 'i', 'PI', 'E'])

export function compileExpression(math: MathJs, raw: string): CompileResult {
  const src = raw.trim()
  if (!src) return { ok: false, error: 'Empty' }
  try {
    const point = /^\((.+),(.+)\)$/.exec(src)
    if (point) {
      const nx = math.parse(preprocess(point[1]))
      const ny = math.parse(preprocess(point[2]))
      const cx = nx.compile()
      const cy = ny.compile()
      const params = [...new Set([...freeSymbols(nx, BUILTIN), ...freeSymbols(ny, BUILTIN)])].sort()
      return {
        ok: true,
        expr: {
          kind: 'point',
          params,
          tex: `\\left(${nx.toTex()},\\ ${ny.toTex()}\\right)`,
          evaluate: () => NaN,
          point: (scope) => [Number(cx.evaluate(scope)), Number(cy.evaluate(scope))],
          node: nx,
        },
      }
    }

    let kind: ExprKind = 'function'
    let body = src
    let lhs = 'y'
    const eq = /^\s*(y|x|r|f\s*\(\s*x\s*\))\s*=(.*)$/i.exec(src)
    if (eq) {
      lhs = eq[1].toLowerCase().replace(/\s/g, '')
      body = eq[2]
      if (lhs === 'x') kind = 'vertical'
      else if (lhs === 'r') kind = 'polar'
    } else if (/=/.test(src)) {
      return { ok: false, error: 'Use y = …, x = …, r = … or just an expression in x' }
    }

    const node = math.parse(preprocess(body))
    const code = node.compile()
    const variable = kind === 'polar' ? 'theta' : 'x'
    const params = freeSymbols(node, BUILTIN)
    if (kind === 'vertical' && freeSymbols(node, new Set(['pi', 'e'])).includes('y'))
      return { ok: false, error: 'x = … must not depend on y' }

    const evaluate = (input: number, scope: Record<string, number>) => {
      const v = code.evaluate({ ...scope, [variable]: input })
      return typeof v === 'number' ? v : Number(v)
    }

    let derivative: CompiledExpr['derivative']
    if (kind === 'function') {
      try {
        const d = math.derivative(node, 'x')
        const dc = d.compile()
        derivative = {
          evaluate: (x, scope) => Number(dc.evaluate({ ...scope, x })),
          tex: math.simplify(d).toTex(),
        }
      } catch {
        derivative = undefined
      }
    }

    const prefix =
      kind === 'polar' ? 'r=' : kind === 'vertical' ? 'x=' : lhs === 'f(x)' ? 'f(x)=' : 'y='
    return {
      ok: true,
      expr: { kind, params, tex: prefix + node.toTex(), evaluate, derivative, node },
    }
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error ? e.message.replace(/\(char \d+\)/, '').trim() : 'Could not read that',
    }
  }
}

/** Taylor polynomial coefficients of f about a (via repeated symbolic differentiation). */
export function taylorCoefficients(
  math: MathJs,
  node: MathNode,
  a: number,
  degree: number,
  scope: Record<string, number>,
): number[] {
  const coeffs: number[] = []
  let current: MathNode = node
  let factorial = 1
  for (let k = 0; k <= degree; k++) {
    if (k > 0) {
      current = math.derivative(current, 'x')
      factorial *= k
    }
    coeffs.push(Number(current.compile().evaluate({ ...scope, x: a })) / factorial)
  }
  return coeffs
}

import { useState } from 'react'
import {
  Callout,
  Figure,
  Formula,
  LabSection,
  PredictReveal,
  Prose,
  Readouts,
  RealWorld,
  Takeaways,
  TryThis,
  TryThisList,
} from '@/learn/blocks'
import {
  ChallengeSet,
  InteractiveChallenge,
  McqChallenge,
  NumericChallenge,
} from '@/learn/challenges'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'
import { linearTex, paren, zeroPairs } from '../_shared/algebra'

const IN = 'var(--c-blue)'
const OUT = 'var(--c-orange)'

type RecipeId = 'linear' | 'square' | 'bracket'

const RECIPES: Record<
  RecipeId,
  { tex: string; f: (x: number) => number; steps: (x: number) => string }
> = {
  linear: {
    tex: '3x + 2',
    f: (x) => 3 * x + 2,
    steps: (x) => `3 \\cdot ${paren(x)} + 2 = ${3 * x} + 2 = ${3 * x + 2}`,
  },
  square: {
    tex: 'x^2 - 1',
    f: (x) => x * x - 1,
    steps: (x) => `${paren(x)}^2 - 1 = ${x * x} - 1 = ${x * x - 1}`,
  },
  bracket: {
    tex: '2(x + 4)',
    f: (x) => 2 * (x + 4),
    steps: (x) => `2 \\cdot (${x} + 4) = 2 \\cdot ${paren(x + 4)} = ${2 * (x + 4)}`,
  },
}

function Tile({ kind, negative, faded }: { kind: 'x' | '1'; negative: boolean; faded?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border-2 text-xs font-semibold',
        kind === 'x' ? 'h-10 w-5' : 'size-5',
        negative && 'border-dashed',
        faded && 'opacity-35',
      )}
      style={{
        borderColor: kind === 'x' ? IN : OUT,
        background: negative
          ? 'transparent'
          : `color-mix(in oklab, ${kind === 'x' ? IN : OUT} 22%, var(--surface))`,
      }}
    >
      {negative ? '−' : kind === 'x' ? 'x' : '1'}
    </span>
  )
}

function TileRow({ a, b, label }: { a: number; b: number; label: string }) {
  return (
    <div className="flex min-h-12 flex-wrap items-center gap-1" role="img" aria-label={label}>
      {Array.from({ length: Math.abs(a) }, (_, i) => (
        <Tile key={`x${i}`} kind="x" negative={a < 0} />
      ))}
      {a !== 0 && b !== 0 && <span className="w-2" />}
      {Array.from({ length: Math.abs(b) }, (_, i) => (
        <Tile key={`u${i}`} kind="1" negative={b < 0} />
      ))}
      {a === 0 && b === 0 && <span className="text-sm text-ink-2">nothing (0)</span>}
    </div>
  )
}

export default function VariablesExpressionsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="A box with a name on it">
        <Prose>
          <p>
            A <strong>variable</strong> is a box with a name on it, usually a letter like{' '}
            <Tex>{'x'}</Tex>. We don't need to know what is inside yet. An{' '}
            <strong>expression</strong> like <Tex>{'3x + 2'}</Tex> is a recipe: put a number in the
            box, follow the steps, and a number comes out.
          </p>
          <p>
            One recipe works for every number at once. That is the trick of algebra: instead of
            doing the same sum over and over, you write it once with a letter and reuse it.
          </p>
        </Prose>
      </LabSection>
      <MachineExplorer />
      <TileExplorer />
      <LabSection
        id="formalize"
        eyebrow="Formalize"
        title="Terms, coefficients and the distributive law"
      >
        <Formula
          tex={'a(b + c) = ab + ac'}
          caption="The distributive law: multiplying a bracket multiplies every term inside it."
        />
        <Prose>
          <ul>
            <li>
              In <Tex>{'5x^2 - 3x + 7'}</Tex> the <strong>terms</strong> are <Tex>{'5x^2'}</Tex>,{' '}
              <Tex>{'-3x'}</Tex> and <Tex>{'7'}</Tex>. The number in front of a letter is its{' '}
              <strong>coefficient</strong> (5 and −3); a term with no letter is a{' '}
              <strong>constant</strong>.
            </li>
            <li>
              <strong>Evaluate</strong> by substituting: for <Tex>{'x = 4'}</Tex>,{' '}
              <Tex>{'3x + 2 = 3 \\cdot 4 + 2 = 14'}</Tex>. Put negative inputs in brackets:{' '}
              <Tex>{'(-3)^2 = 9'}</Tex>.
            </li>
            <li>
              <strong>Like terms</strong> have the same letters and powers, and only they combine:{' '}
              <Tex>{'4x + 3 - x + 2 = 3x + 5'}</Tex>.
            </li>
            <li>
              <strong>Equivalent</strong> expressions agree for every input: <Tex>{'2(x + 4)'}</Tex>{' '}
              and <Tex>{'2x + 8'}</Tex> are the same recipe written two ways.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="3x + 2 is not 5x">
          <p>
            An <Tex>{'x'}</Tex>-tile and a 1-tile are different sizes, so they can't merge.{' '}
            <Tex>{'3x + 2'}</Tex> stays as it is. Check with a number: at <Tex>{'x = 10'}</Tex>,{' '}
            <Tex>{'3x + 2 = 32'}</Tex> but <Tex>{'5x = 50'}</Tex>.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where expressions are used">
        <RealWorld
          items={[
            {
              title: 'Spreadsheets',
              body: 'A formula like =B2*1.2+5 is an expression; the cell reference is the variable, and the same recipe fills a whole column.',
            },
            {
              title: 'Prices and bills',
              body: 'A taxi fare of 3 + 2d (pounds, for d kilometres) or a phone plan of 10 + 0.05m works for any trip or month.',
            },
            {
              title: 'Programming',
              body: 'Every program is full of variables: score = score + 10 runs the same recipe each time a coin is collected.',
            },
            {
              title: 'Science formulas',
              body: 'Speed × time, mass × acceleration: each is an expression waiting for numbers.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A variable stands for a number; an expression is a recipe that uses it.',
            'Evaluate by substituting, and bracket negative inputs.',
            'Only like terms combine: $x$ with $x$, numbers with numbers.',
            '$a(b + c) = ab + ac$: a bracket multiplies every term inside.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function MachineExplorer() {
  const [recipe, setRecipe] = useState<RecipeId>('linear')
  const [x, setX] = useState(1)
  const [tried, setTried] = useState<number[]>([1])
  const r = RECIPES[recipe]
  const out = r.f(x)
  const rows = [...tried].sort((p, q) => p - q)
  return (
    <LabSection id="explore" eyebrow="Explore" title="The expression machine">
      <Prose>
        <p>
          Choose a recipe, then slide the input. The machine shows every step of the substitution,
          and the table remembers the inputs you've tried.
        </p>
      </Prose>
      <PredictReveal
        question="What does $x^2 - 1$ give when $x = -3$?"
        options={['$-10$', '$-7$', '$8$', '$10$']}
        answer={2}
        explanation="Bracket the input: $(-3)^2 - 1 = 9 - 1 = 8$. Squaring a negative number gives a positive one."
      />
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Recipe"
            value={recipe}
            onChange={(v) => {
              setRecipe(v)
              setTried([x])
            }}
            options={(Object.keys(RECIPES) as RecipeId[]).map((id) => ({
              value: id,
              label: <Tex>{RECIPES[id].tex}</Tex>,
              ariaLabel: RECIPES[id].tex,
            }))}
          />
        </div>
        <div className="grid gap-4 px-3 pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-4">
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line p-4">
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <span
                className="rounded-lg border-2 px-3 py-1 font-semibold"
                style={{ borderColor: IN }}
              >
                x = {x}
              </span>
              <span aria-hidden>→</span>
              <span className="rounded-lg bg-surface-2 px-3 py-1">
                <Tex>{r.tex}</Tex>
              </span>
              <span aria-hidden>→</span>
              <span
                className="rounded-lg border-2 px-3 py-1 font-semibold"
                style={{ borderColor: OUT }}
              >
                {out}
              </span>
            </div>
            <div className="max-w-full overflow-x-auto">
              <Tex>{r.steps(x)}</Tex>
            </div>
          </div>
          <table className="mx-auto text-center text-sm tabular-nums">
            <caption className="sr-only">Inputs tried and their outputs</caption>
            <thead>
              <tr className="text-xs text-ink-2">
                <th scope="col" className="px-3 font-medium">
                  x
                </th>
                <th scope="col" className="px-3 font-medium">
                  output
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t} className={cn(t === x && 'font-semibold')}>
                  <td className="px-3">{t}</td>
                  <td className="px-3">{r.f(t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 border-t border-line px-3 pt-3 sm:px-4">
          <Slider
            label="Input x"
            value={x}
            min={-6}
            max={6}
            step={1}
            onChange={(v) => {
              setX(v)
              setTried((t) => (t.includes(v) ? t : [...t, v]))
            }}
            color={IN}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'input', value: `${x}`, color: IN },
              { label: 'output', value: `${out}`, color: OUT },
              { label: 'inputs tried', value: `${tried.length}` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-output-twenty" when={recipe === 'linear' && out === 20}>
          Make <Tex>{'3x + 2'}</Tex> give 20. Which input works?
        </TryThis>
        <TryThis id="t-negative-square" when={recipe === 'square' && x <= -2}>
          Put a negative number into <Tex>{'x^2 - 1'}</Tex>. Why isn't the output negative?
        </TryThis>
        <TryThis id="t-zero-output" when={out === 0}>
          Find an input that makes the machine output 0.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function TileExplorer() {
  const [a1, setA1] = useState(2)
  const [b1, setB1] = useState(3)
  const [a2, setA2] = useState(1)
  const [b2, setB2] = useState(1)
  const a = a1 + a2
  const b = b1 + b2
  const pairs = zeroPairs(a1, a2) + zeroPairs(b1, b2)
  return (
    <LabSection id="tiles" eyebrow="Explore" title="Collecting like terms with tiles">
      <Prose>
        <p>
          A long blue tile is <Tex>{'x'}</Tex>; a small orange square is 1. Dashed tiles are
          negative. Adding two expressions just pools the tiles: <Tex>{'x'}</Tex>-tiles stack with{' '}
          <Tex>{'x'}</Tex>-tiles, ones with ones, and a tile next to its negative makes a{' '}
          <strong>zero pair</strong> that cancels.
        </p>
      </Prose>
      <Figure>
        <div className="grid gap-3 px-3 pt-4 sm:px-4">
          <div className="grid gap-1">
            <span className="text-sm text-ink-2">
              First: <Tex>{linearTex(a1, b1)}</Tex>
            </span>
            <TileRow a={a1} b={b1} label={`First expression ${linearTex(a1, b1)}`} />
          </div>
          <div className="grid gap-1">
            <span className="text-sm text-ink-2">
              Second: <Tex>{linearTex(a2, b2)}</Tex>
            </span>
            <TileRow a={a2} b={b2} label={`Second expression ${linearTex(a2, b2)}`} />
          </div>
          <div className="grid gap-1 border-t border-line pt-3">
            <span className="text-sm font-medium">
              Sum:{' '}
              <Tex>{`(${linearTex(a1, b1)}) + (${linearTex(a2, b2)}) = ${linearTex(a, b)}`}</Tex>
            </span>
            <TileRow a={a} b={b} label={`Sum ${linearTex(a, b)}`} />
          </div>
        </div>
        <div className="mt-3 grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label="First: x-tiles"
            value={a1}
            min={-4}
            max={4}
            step={1}
            onChange={setA1}
            color={IN}
          />
          <Slider
            label="First: ones"
            value={b1}
            min={-5}
            max={5}
            step={1}
            onChange={setB1}
            color={OUT}
          />
          <Slider
            label="Second: x-tiles"
            value={a2}
            min={-4}
            max={4}
            step={1}
            onChange={setA2}
            color={IN}
          />
          <Slider
            label="Second: ones"
            value={b2}
            min={-5}
            max={5}
            step={1}
            onChange={setB2}
            color={OUT}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'x-terms', value: `${a1} + ${paren(a2)} = ${a}`, color: IN },
              { label: 'constants', value: `${b1} + ${paren(b2)} = ${b}`, color: OUT },
              { label: 'zero pairs cancelled', value: `${pairs}` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-make-zero-pair" when={pairs > 0}>
          Give the second expression some negative tiles so zero pairs cancel.
        </TryThis>
        <TryThis id="t-everything-cancels" when={a === 0 && b === 0 && (a1 !== 0 || b1 !== 0)}>
          Choose the second expression so the sum is exactly 0.
        </TryThis>
        <TryThis id="t-just-x" when={a === 1 && b === 0 && pairs > 0}>
          Make the sum exactly <Tex>{'x'}</Tex>, using some zero pairs on the way.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [x, setX] = useState(0)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-four-x-minus-five"
          index={1}
          prompt="Evaluate $4x - 5$ when $x = 3$."
          answer={7}
          explanation="$4 \cdot 3 - 5 = 12 - 5 = 7$."
        />
        <McqChallenge
          id="c-collect-terms"
          index={2}
          prompt="Simplify $3x + 2y + x$."
          options={[
            { text: '$4x + 2y$', correct: true },
            { text: '$6xy$', why: 'Unlike terms ($x$ and $y$) don’t combine.' },
            { text: '$3x + 3y$', why: 'The lone $x$ joins the $x$-terms, not the $y$-terms.' },
            { text: '$5x + y$', why: 'Only the coefficients of like terms add: $3x + x = 4x$.' },
          ]}
          explanation="Collect the $x$-terms: $3x + x = 4x$. The $2y$ stays as it is."
        />
        <NumericChallenge
          id="c-bracket-constant"
          index={3}
          prompt="Expand $3(x + 4)$. What is the constant term?"
          answer={12}
          explanation="$3(x + 4) = 3x + 12$: the 3 multiplies both terms in the bracket."
        />
        <NumericChallenge
          id="c-square-negative"
          index={4}
          prompt="Evaluate $x^2$ when $x = -4$."
          answer={16}
          explanation="$(-4)^2 = (-4)(-4) = 16$."
        />
        <McqChallenge
          id="c-rectangle-perimeter"
          index={5}
          prompt="A rectangle is $x$ cm wide and $x + 2$ cm long. Which expression is its perimeter?"
          options={[
            { text: '$4x + 4$', correct: true },
            { text: '$2x + 2$', why: 'That adds each side once; a rectangle has two of each.' },
            { text: '$x(x + 2)$', why: 'That is the area, not the perimeter.' },
            { text: '$4x + 2$', why: 'Both long sides have the extra 2: $2(x + 2) = 2x + 4$.' },
          ]}
          explanation="$x + x + (x + 2) + (x + 2) = 4x + 4$."
        />
        <InteractiveChallenge
          id="c-machine-target"
          index={6}
          prompt="Set the input so that $2x + 7$ outputs 1."
          solved={2 * x + 7 === 1}
          hint="The output is too big at $x = 0$. Try negative inputs."
          explanation="$2 \cdot (-3) + 7 = -6 + 7 = 1$, so $x = -3$."
          onReset={() => setX(0)}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <p className="text-center">
              <Tex>{`2 \\cdot ${paren(x)} + 7 = ${2 * x + 7}`}</Tex>
            </p>
            <Slider
              label="Input x"
              value={x}
              min={-6}
              max={6}
              step={1}
              onChange={setX}
              color={IN}
            />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

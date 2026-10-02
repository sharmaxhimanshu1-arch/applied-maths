import { RotateCcw, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { clamp } from '@/math/core'
import {
  Callout,
  Figure,
  Formula,
  LabSection,
  PredictReveal,
  Prose,
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
import { Button } from '@/ui/Button'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'

type Side = { x: number; c: number }
type Scale = { left: Side; right: Side }
type Step = { scale: Scale; note: string; balanced: boolean }

interface Puzzle {
  id: string
  name: string
  start: Scale
  /** The hidden value of x (sets how heavy each x-box is). */
  value: number
}

const PUZZLES: Puzzle[] = [
  {
    id: 'p1',
    name: '3x + 2 = 11',
    start: { left: { x: 3, c: 2 }, right: { x: 0, c: 11 } },
    value: 3,
  },
  {
    id: 'p2',
    name: '2x + 5 = 13',
    start: { left: { x: 2, c: 5 }, right: { x: 0, c: 13 } },
    value: 4,
  },
  {
    id: 'p3',
    name: '5x + 1 = 2x + 10',
    start: { left: { x: 5, c: 1 }, right: { x: 2, c: 10 } },
    value: 3,
  },
]

const X_COLOR = 'var(--c-blue)'
const UNIT_COLOR = 'var(--c-orange)'

function sideTex({ x, c }: Side): string {
  const xs = x === 0 ? '' : x === 1 ? 'x' : `${x}x`
  if (!xs) return String(c)
  return c === 0 ? xs : `${xs} + ${c}`
}

const weight = (s: Side, value: number) => s.x * value + s.c
const isSolved = ({ left, right }: Scale) =>
  (left.x === 1 && left.c === 0 && right.x === 0) ||
  (right.x === 1 && right.c === 0 && left.x === 0)

type Placed = { kind: 'x' | '1'; x: number; y: number; size: number }

/** Lay the items out in rows of six, centred on cx, stacking upwards from baseY. */
function layoutPan(side: Side, cx: number, baseY: number): Placed[] {
  const items: ('x' | '1')[] = [
    ...Array.from({ length: side.x }, () => 'x' as const),
    ...Array.from({ length: side.c }, () => '1' as const),
  ]
  const out: Placed[] = []
  let bottom = baseY
  for (let start = 0; start < items.length; start += 6) {
    const row = items.slice(start, start + 6)
    const sizes = row.map((it) => (it === 'x' ? 36 : 24))
    const rowHeight = Math.max(...sizes)
    let x = cx - (sizes.reduce((a, b) => a + b, 0) + (row.length - 1) * 3) / 2
    row.forEach((kind, i) => {
      out.push({ kind, x, y: bottom - sizes[i], size: sizes[i] })
      x += sizes[i] + 3
    })
    bottom -= rowHeight + 3
  }
  return out
}

function PanItems({ side, cx, baseY }: { side: Side; cx: number; baseY: number }) {
  return (
    <g>
      {layoutPan(side, cx, baseY).map((p, i) => (
        <g key={i}>
          <rect
            x={p.x}
            y={p.y}
            width={p.size}
            height={p.size}
            rx={p.kind === 'x' ? 6 : 4}
            fill={p.kind === 'x' ? X_COLOR : UNIT_COLOR}
          />
          <text
            x={p.x + p.size / 2}
            y={p.y + p.size / 2 + (p.kind === 'x' ? 6 : 4)}
            textAnchor="middle"
            fontSize={p.kind === 'x' ? 17 : 12}
            fontStyle={p.kind === 'x' ? 'italic' : undefined}
            fontWeight={600}
            fill="#fff"
          >
            {p.kind}
          </text>
        </g>
      ))}
    </g>
  )
}

/** A two-pan balance that tilts towards the heavier side. */
function BalanceScale({ scale, value }: { scale: Scale; value: number }) {
  const diff = weight(scale.left, value) - weight(scale.right, value)
  const angle = clamp(-diff * 2.2, -11, 11)
  const rad = (angle * Math.PI) / 180
  const arm = 200
  const pivot = { x: 320, y: 96 }
  const end = (dir: -1 | 1) => ({
    x: pivot.x + dir * arm * Math.cos(rad),
    y: pivot.y + dir * arm * Math.sin(rad),
  })
  const l = end(-1)
  const r = end(1)
  const hang = 96
  const pan = (p: { x: number; y: number }, side: Side) => (
    <g
      style={{
        transform: `translate(${p.x}px, ${p.y}px)`,
        transition: 'transform 500ms cubic-bezier(0.3, 0.9, 0.3, 1)',
      }}
    >
      <line x1={0} y1={0} x2={-100} y2={hang} stroke="var(--ink-3)" strokeWidth={1.5} />
      <line x1={0} y1={0} x2={100} y2={hang} stroke="var(--ink-3)" strokeWidth={1.5} />
      <path
        d={`M-118,${hang} L118,${hang} L102,${hang + 10} L-102,${hang + 10} Z`}
        fill="var(--ink-2)"
      />
      <PanItems side={side} cx={0} baseY={hang - 1} />
    </g>
  )
  return (
    <svg
      viewBox="0 0 640 300"
      className="block h-auto w-full"
      role="img"
      aria-label={`Balance scale: ${sideTex(scale.left)} on the left, ${sideTex(scale.right)} on the right. ${diff === 0 ? 'It is level.' : diff > 0 ? 'The left side is heavier.' : 'The right side is heavier.'}`}
    >
      <path d="M320,104 L282,280 L358,280 Z" fill="var(--surface-3)" stroke="var(--line-strong)" />
      <rect x={250} y={280} width={140} height={10} rx={4} fill="var(--line-strong)" />
      <g
        style={{
          transform: `rotate(${angle}deg)`,
          transformOrigin: `${pivot.x}px ${pivot.y}px`,
          transition: 'transform 500ms cubic-bezier(0.3, 0.9, 0.3, 1)',
        }}
      >
        <rect
          x={pivot.x - arm - 6}
          y={pivot.y - 5}
          width={2 * arm + 12}
          height={10}
          rx={5}
          fill="var(--ink-2)"
        />
      </g>
      <circle cx={pivot.x} cy={pivot.y} r={9} fill={diff === 0 ? 'var(--good)' : 'var(--c-red)'} />
      {pan(l, scale.left)}
      {pan(r, scale.right)}
    </svg>
  )
}

type Action = { label: string; note: string; apply: (s: Scale) => Scale | null; oneSided?: boolean }

const ACTIONS: Action[] = [
  {
    label: '− 1 from both sides',
    note: 'take 1 from both sides',
    apply: ({ left, right }) =>
      left.c >= 1 && right.c >= 1
        ? { left: { ...left, c: left.c - 1 }, right: { ...right, c: right.c - 1 } }
        : null,
  },
  {
    label: '− x from both sides',
    note: 'take an x from both sides',
    apply: ({ left, right }) =>
      left.x >= 1 && right.x >= 1
        ? { left: { ...left, x: left.x - 1 }, right: { ...right, x: right.x - 1 } }
        : null,
  },
  ...[2, 3, 4, 5].map((k): Action => ({
    label: `÷ ${k} on both sides`,
    note: `split both sides into ${k} equal groups`,
    apply: ({ left, right }) =>
      [left.x, left.c, right.x, right.c].every((n) => n % k === 0) &&
      left.x + left.c + right.x + right.c > 0
        ? {
            left: { x: left.x / k, c: left.c / k },
            right: { x: right.x / k, c: right.c / k },
          }
        : null,
  })),
  {
    label: '− 1 from the left only',
    note: 'take 1 from the left side only',
    oneSided: true,
    apply: ({ left, right }) => (left.c >= 1 ? { left: { ...left, c: left.c - 1 }, right } : null),
  },
]

/** The balance plus its controls and the written steps; reports progress to the parent. */
function BalanceGame({
  puzzle,
  onProgress,
}: {
  puzzle: Puzzle
  onProgress?: (p: { solved: boolean; unbalanced: boolean }) => void
}) {
  const first: Step = { scale: puzzle.start, note: 'start', balanced: true }
  const [steps, setSteps] = useState<Step[]>([first])
  const current = steps[steps.length - 1]
  const solved = current.balanced && isSolved(current.scale)
  const report = (next: Step[]) => {
    const last = next[next.length - 1]
    onProgress?.({
      solved: last.balanced && isSolved(last.scale),
      unbalanced: next.some((s) => !s.balanced),
    })
  }
  const act = (a: Action) => {
    const next = a.apply(current.scale)
    if (!next) return
    const balanced =
      weight(next.left, puzzle.value) === weight(next.right, puzzle.value) && current.balanced
    const all = [...steps, { scale: next, note: a.note, balanced }]
    setSteps(all)
    report(all)
  }
  const undo = () => {
    const all = steps.slice(0, -1)
    setSteps(all)
    report(all)
  }
  return (
    <div className="grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="p-3 sm:p-4">
        <BalanceScale scale={current.scale} value={puzzle.value} />
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Moves">
          {ACTIONS.map((a) => (
            <Button
              key={a.label}
              size="sm"
              variant={a.oneSided ? 'ghost' : 'secondary'}
              disabled={!a.apply(current.scale) || solved || !current.balanced}
              onClick={() => act(a)}
            >
              {a.label}
            </Button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="ghost"
            icon={<Undo2 className="size-4" />}
            disabled={steps.length === 1}
            onClick={undo}
          >
            Undo
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="size-4" />}
            disabled={steps.length === 1}
            onClick={() => {
              setSteps([first])
              report([first])
            }}
          >
            Start again
          </Button>
        </div>
      </div>
      <div className="border-t border-line p-3 sm:p-4 md:border-t-0 md:border-l">
        <div className="mb-2 text-sm font-semibold">Your working</div>
        <ol className="grid gap-1.5" aria-live="polite">
          {steps.map((s, i) => (
            <li
              key={i}
              className={cn(
                'flex flex-wrap items-baseline justify-between gap-x-3 rounded-lg px-2 py-1',
                i === steps.length - 1 && 'bg-surface-2',
              )}
            >
              <Tex>{`${sideTex(s.scale.left)} ${s.balanced ? '=' : '\\ne'} ${sideTex(s.scale.right)}`}</Tex>
              <span
                className={cn('text-xs', s.balanced ? 'text-ink-3' : 'font-semibold text-bad-ink')}
              >
                {i === 0 ? 'start' : s.balanced ? s.note : `${s.note}: unbalanced!`}
              </span>
            </li>
          ))}
        </ol>
        {solved && (
          <p className="mt-3 rounded-xl bg-[color-mix(in_oklab,var(--good)_12%,var(--surface))] px-3 py-2 text-sm">
            Solved: <Tex>{`x = ${puzzle.value}`}</Tex>. Check it in the original equation!
          </p>
        )}
        {!current.balanced && (
          <p className="mt-3 text-sm text-ink-2">
            The scale tipped, so the two sides are no longer equal. Press <strong>Undo</strong>.
          </p>
        )}
      </div>
    </div>
  )
}

export default function LinearEquationsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="An equation is a balance">
        <Prose>
          <p>
            The equals sign means the two sides weigh exactly the same. Picture them on the pans of
            a balance: <Tex>3x + 2 = 11</Tex> is three mystery boxes and 2 weights on one side,
            balancing 11 weights on the other.
          </p>
          <p>
            Solving means finding what one box weighs. The only rule: whatever you do to one side,
            do to the other, so the scale stays level. Keep simplifying until a single <Tex>x</Tex>{' '}
            sits alone.
          </p>
        </Prose>
      </LabSection>
      <BalanceExplorer />
      <MachineExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Doing the same to both sides">
        <Formula
          tex={'3x + 2 = 11 \\;\\Rightarrow\\; 3x = 9 \\;\\Rightarrow\\; x = 3'}
          caption="Subtract 2 from both sides, then divide both sides by 3."
        />
        <Prose>
          <p>
            Each step uses an <strong>inverse operation</strong> to peel away what was done to{' '}
            <Tex>x</Tex>: subtraction undoes addition, division undoes multiplication. Undo the
            outermost operation first, the way you'd take off shoes before socks.
          </p>
          <p>
            Always finish with a check: put your answer back into the original equation.{' '}
            <Tex>3 \cdot 3 + 2 = 11</Tex> ✓.
          </p>
        </Prose>
        <Callout kind="misconception" title="Not just one side">
          <p>
            “Move the 2 to the other side and change its sign” is a shortcut for subtracting 2 from{' '}
            <em>both</em> sides. If you only change one side, the balance tips and the equation is
            no longer true.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet equations">
        <RealWorld
          items={[
            {
              title: 'Budgets',
              body: 'A phone plan costs $15 a month plus $2 per GB. With $35 to spend, $15 + 2x = 35$ says how many GB you can use.',
            },
            {
              title: 'Cooking',
              body: 'Scaling a recipe for a different number of guests is solving a simple equation for the multiplier.',
            },
            {
              title: 'Physics',
              body: 'Speed × time = distance. Knowing any two, an equation gives you the third.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'An equation says two sides are equal: like a level balance.',
            'Whatever you do to one side, do to the other.',
            'Undo operations in reverse order using inverse operations.',
            'Finish by checking your answer in the original equation.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function BalanceExplorer() {
  const [puzzleId, setPuzzleId] = useState('p1')
  const [solvedIds, setSolvedIds] = useState<string[]>([])
  const [tipped, setTipped] = useState(false)
  const puzzle = PUZZLES.find((p) => p.id === puzzleId)!
  return (
    <LabSection id="explore" eyebrow="Explore" title="Keep the scale level">
      <Prose>
        <p>
          Blue boxes are <Tex>x</Tex>; orange squares weigh 1. Use the moves to get one <Tex>x</Tex>{' '}
          on its own. The scale knows the true weight of a box, so it will tip if your move isn't
          fair to both sides.
        </p>
      </Prose>
      <PredictReveal
        question="On a level scale, 3 boxes and 2 weights balance 11 weights. What's the best first move?"
        options={[
          'Take 2 weights off both sides',
          'Take 2 weights off the left side',
          'Take one box off each side',
          'Add 3 weights to the right side',
        ]}
        answer={0}
        explanation="Taking 2 from both sides keeps it level and leaves 3 boxes = 9 weights. Then split both sides into 3 groups: one box weighs 3."
      />
      <Figure>
        <div
          className="flex flex-wrap gap-2 border-b border-line p-3 sm:px-4"
          role="group"
          aria-label="Puzzles"
        >
          {PUZZLES.map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant={puzzleId === p.id ? 'soft' : 'ghost'}
              aria-pressed={puzzleId === p.id}
              onClick={() => setPuzzleId(p.id)}
            >
              <Tex>{p.name}</Tex>
              {solvedIds.includes(p.id) && <span aria-label="solved">✓</span>}
            </Button>
          ))}
        </div>
        <BalanceGame
          key={puzzleId}
          puzzle={puzzle}
          onProgress={({ solved, unbalanced }) => {
            if (solved && !solvedIds.includes(puzzleId)) setSolvedIds((s) => [...s, puzzleId])
            if (unbalanced) setTipped(true)
          }}
        />
      </Figure>
      <TryThisList>
        <TryThis id="t-solve" when={solvedIds.length >= 1}>
          Solve a puzzle: get a single <Tex>x</Tex> alone on one side.
        </TryThis>
        <TryThis id="t-tip" when={tipped}>
          Try the unfair move, “− 1 from the left only”. What does the scale do?
        </TryThis>
        <TryThis id="t-both" when={solvedIds.includes('p3')}>
          Solve <Tex>5x + 1 = 2x + 10</Tex>, which has boxes on both sides.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const MACHINES = [
  { id: 'm1', mul: 3, add: 2, out: 11 },
  { id: 'm2', mul: 4, add: 5, out: 33 },
  { id: 'm3', mul: 2, add: 7, out: 19 },
]

function MachineExplorer() {
  const [id, setId] = useState('m1')
  const [guess, setGuess] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [found, setFound] = useState(false)
  const m = MACHINES.find((x) => x.id === id)!
  const out = guess * m.mul + m.add
  const answer = (m.out - m.add) / m.mul
  const box = 'rounded-xl border px-3 py-2 text-center font-mono text-sm'
  return (
    <LabSection id="machine" eyebrow="Explore" title="Run the machine backwards">
      <Prose>
        <p>
          Another way to see an equation: <Tex>x</Tex> goes into a machine that multiplies, then
          adds. You know what came out. You could guess and check, or you could run the machine
          backwards, undoing the last step first.
        </p>
      </Prose>
      <Figure>
        <div className="flex flex-wrap gap-2 border-b border-line p-3 sm:px-4">
          {MACHINES.map((x) => (
            <Button
              key={x.id}
              size="sm"
              variant={id === x.id ? 'soft' : 'ghost'}
              aria-pressed={id === x.id}
              onClick={() => {
                setId(x.id)
                setGuess(0)
                setRevealed(false)
              }}
            >
              <Tex>{`${x.mul}x + ${x.add} = ${x.out}`}</Tex>
            </Button>
          ))}
        </div>
        <div className="grid gap-4 p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2" aria-label="Forwards">
            <span className={cn(box, 'border-[var(--c-blue)]')}>x = {guess}</span>
            <span aria-hidden>→</span>
            <span className={cn(box, 'border-line bg-surface-2')}>× {m.mul}</span>
            <span aria-hidden>→</span>
            <span className={cn(box, 'border-line')}>{guess * m.mul}</span>
            <span aria-hidden>→</span>
            <span className={cn(box, 'border-line bg-surface-2')}>+ {m.add}</span>
            <span aria-hidden>→</span>
            <span
              className={cn(box, out === m.out ? 'border-[var(--good)] font-bold' : 'border-line')}
            >
              {out}
            </span>
            <span className="text-sm text-ink-2">
              {out === m.out ? '✓ matches!' : `want ${m.out}`}
            </span>
          </div>
          <Slider
            label="Guess x"
            value={guess}
            min={0}
            max={10}
            step={1}
            onChange={(v) => {
              setGuess(v)
              if (v * m.mul + m.add === m.out) setFound(true)
            }}
            color="var(--c-blue)"
          />
          <div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setRevealed(true)}
              disabled={revealed}
            >
              Run it backwards
            </Button>
          </div>
          {revealed && (
            <div className="flex flex-wrap items-center gap-2" aria-label="Backwards">
              <span className={cn(box, 'border-line')}>{m.out}</span>
              <span aria-hidden>→</span>
              <span className={cn(box, 'border-line bg-surface-2')}>− {m.add}</span>
              <span aria-hidden>→</span>
              <span className={cn(box, 'border-line')}>{m.out - m.add}</span>
              <span aria-hidden>→</span>
              <span className={cn(box, 'border-line bg-surface-2')}>÷ {m.mul}</span>
              <span aria-hidden>→</span>
              <span className={cn(box, 'border-[var(--good)] font-bold')}>x = {answer}</span>
            </div>
          )}
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-guess" when={found}>
          Find the input by guessing: slide <Tex>x</Tex> until the output matches.
        </TryThis>
        <TryThis id="t-backwards" when={revealed}>
          Run the machine backwards. Which operation do you undo first, and why?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [solved, setSolved] = useState(false)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-solve1"
          index={1}
          prompt="Solve $2x + 5 = 13$."
          answer={4}
          explanation="Subtract 5 from both sides: $2x = 8$. Divide both sides by 2: $x = 4$."
        />
        <NumericChallenge
          id="c-solve2"
          index={2}
          prompt="Solve $5x - 3 = 22$."
          answer={5}
          hint="Undo the “− 3” first by adding 3 to both sides."
          explanation="Add 3: $5x = 25$. Divide by 5: $x = 5$. Check: $5 \cdot 5 - 3 = 22$ ✓."
        />
        <NumericChallenge
          id="c-solve3"
          index={3}
          prompt="Solve $\frac{x}{3} + 4 = 10$."
          answer={18}
          hint="Subtract 4, then undo the division by multiplying both sides by 3."
          explanation="$\frac{x}{3} = 6$, so $x = 18$."
        />
        <McqChallenge
          id="c-first"
          index={4}
          prompt="What is a good first step to solve $4x + 7 = 31$?"
          options={[
            { text: 'Subtract 7 from both sides', correct: true },
            {
              text: 'Subtract 7 from the left side',
              why: 'Changing only one side breaks the balance.',
            },
            {
              text: 'Add 7 to both sides',
              why: 'That is fair, but it moves away from $x$: $4x + 14 = 38$.',
            },
            {
              text: 'Divide the left side by 4',
              why: 'Divide both sides, and remember the 7 must be divided too.',
            },
          ]}
          explanation="$4x + 7 - 7 = 31 - 7$ gives $4x = 24$, then $x = 6$."
        />
        <InteractiveChallenge
          id="c-balance"
          index={5}
          prompt="Use the balance to solve $4x + 3 = 2x + 9$."
          solved={solved}
          hint="Take x-boxes off both sides until they are only on one side, then remove weights, then divide."
          explanation="Take 2 x’s from both sides: $2x + 3 = 9$. Take 3 weights: $2x = 6$. Halve both sides: $x = 3$."
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <BalanceGame
              puzzle={{
                id: 'practice',
                name: '4x + 3 = 2x + 9',
                start: { left: { x: 4, c: 3 }, right: { x: 2, c: 9 } },
                value: 3,
              }}
              onProgress={(p) => p.solved && setSolved(true)}
            />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

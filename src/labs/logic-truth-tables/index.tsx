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
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'

const LIT = 'var(--c-yellow)'
const ROW = 'var(--c-blue)'
const MATCH = 'var(--c-green)'
const MISMATCH = 'var(--c-red)'

type Gate = 'and' | 'or' | 'xor' | 'implies' | 'nand'
const GATES: Record<Gate, { label: string; tex: string; f: (p: boolean, q: boolean) => boolean }> =
  {
    and: { label: 'AND', tex: 'P \\land Q', f: (p, q) => p && q },
    or: { label: 'OR', tex: 'P \\lor Q', f: (p, q) => p || q },
    xor: { label: 'XOR', tex: 'P \\oplus Q', f: (p, q) => p !== q },
    implies: { label: 'IF P THEN Q', tex: 'P \\to Q', f: (p, q) => !p || q },
    nand: { label: 'NAND', tex: '\\lnot(P \\land Q)', f: (p, q) => !(p && q) },
  }
const ROWS: [boolean, boolean][] = [
  [true, true],
  [true, false],
  [false, true],
  [false, false],
]
const tf = (b: boolean) => (b ? 'T' : 'F')

function Lamp({ on }: { on: boolean }) {
  return (
    <svg
      viewBox="0 0 80 100"
      className="h-24 w-20"
      role="img"
      aria-label={on ? 'The lamp is on' : 'The lamp is off'}
    >
      {on && <circle cx="40" cy="38" r="36" style={{ fill: LIT, opacity: 0.25 }} />}
      <circle
        cx="40"
        cy="38"
        r="24"
        style={{ fill: on ? LIT : 'var(--surface-2)', stroke: 'var(--ink-3)', strokeWidth: 2 }}
      />
      <rect x="30" y="62" width="20" height="16" rx="3" style={{ fill: 'var(--ink-3)' }} />
      <rect x="33" y="80" width="14" height="6" rx="2" style={{ fill: 'var(--ink-3)' }} />
    </svg>
  )
}

function TruthTable({
  columns,
  current,
}: {
  columns: { tex: string; values: boolean[]; marks?: (boolean | null)[] }[]
  current?: number
}) {
  return (
    <table className="mx-auto text-center text-sm tabular-nums">
      <thead>
        <tr className="border-b border-line">
          <th className="px-3 py-1.5 font-semibold">
            <Tex>{'P'}</Tex>
          </th>
          <th className="px-3 py-1.5 font-semibold">
            <Tex>{'Q'}</Tex>
          </th>
          {columns.map((c, i) => (
            <th key={i} className="px-3 py-1.5 font-semibold">
              <Tex>{c.tex}</Tex>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.map(([p, q], r) => (
          <tr
            key={r}
            className={cn('border-b border-line last:border-b-0', r === current && 'font-semibold')}
            style={r === current ? { boxShadow: `inset 4px 0 0 ${ROW}` } : undefined}
          >
            <td className="px-3 py-1">{tf(p)}</td>
            <td className="px-3 py-1">{tf(q)}</td>
            {columns.map((c, i) => (
              <td key={i} className="px-3 py-1">
                {tf(c.values[r])}
                {c.marks?.[r] != null && (
                  <span
                    className="ml-1"
                    style={{ color: c.marks[r] ? MATCH : MISMATCH }}
                    aria-hidden
                  >
                    ●
                  </span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function LogicTruthTablesLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="True or false, wired together">
        <Prose>
          <p>
            Logic is maths for statements that are either <strong>true</strong> or{' '}
            <strong>false</strong>. Join two statements with <em>and</em>, <em>or</em>, <em>not</em>{' '}
            or <em>if… then</em>, and whether the result is true depends only on whether the parts
            are. A <strong>truth table</strong> lists every possibility, so nothing is left to
            argument.
          </p>
          <p>
            The same rules run every computer: each chip is billions of tiny switches wired into
            AND, OR and NOT gates. Flip the switches below and watch the lamp.
          </p>
        </Prose>
      </LabSection>
      <SwitchExplorer />
      <EquivalenceExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Connectives and laws">
        <Formula
          tex={
            '\\lnot(P \\land Q) \\equiv \\lnot P \\lor \\lnot Q \\qquad \\lnot(P \\lor Q) \\equiv \\lnot P \\land \\lnot Q'
          }
          caption="De Morgan's laws: “not both” means “at least one is false”."
        />
        <Formula
          tex={'P \\to Q \\equiv \\lnot Q \\to \\lnot P \\equiv \\lnot P \\lor Q'}
          caption="An implication equals its contrapositive, but not its converse Q → P."
        />
        <Prose>
          <ul>
            <li>
              <strong>AND</strong> (<Tex>{'\\land'}</Tex>) is true only when both parts are;{' '}
              <strong>OR</strong> (<Tex>{'\\lor'}</Tex>) when at least one is; <strong>NOT</strong>{' '}
              (<Tex>{'\\lnot'}</Tex>) flips; <strong>XOR</strong> when exactly one is.
            </li>
            <li>
              <strong>IF P THEN Q</strong> is broken only when P is true and Q is false. When P is
              false, the promise wasn't tested, so it counts as true.
            </li>
            <li>
              With <Tex>{'n'}</Tex> statements there are <Tex>{'2^n'}</Tex> rows: 4 for two, 8 for
              three. Two formulas are <strong>equivalent</strong> when their columns match on every
              row.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="“If P then Q” doesn't mean “if Q then P”">
          <p>
            “If it rains, the ground is wet” doesn't promise that a wet ground means rain (a
            sprinkler would do it). The converse <Tex>{'Q \\to P'}</Tex> is a different statement.
            The contrapositive, “if the ground is dry, it didn't rain”, is the one that means the
            same.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where logic runs">
        <RealWorld
          items={[
            {
              title: 'Computer chips',
              body: 'Adders, memory and every instruction are built from AND, OR and NOT gates.',
            },
            {
              title: 'Programming',
              body: 'if (loggedIn && !banned) … is logic; De Morgan helps rewrite conditions so they are easier to read.',
            },
            {
              title: 'Search filters',
              body: '“Size M AND colour blue AND NOT on sale” is a logical formula over every product.',
            },
            {
              title: 'Arguments',
              body: 'Spotting a converse passed off as a contrapositive is how you catch a faulty argument.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A truth table lists all $2^n$ combinations of $n$ statements.',
            'AND needs both; OR needs at least one; XOR needs exactly one.',
            '“If P then Q” is false only when P is true and Q is false.',
            'De Morgan: “not (P and Q)” = “not P or not Q”.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function SwitchExplorer() {
  const [p, setP] = useState(false)
  const [q, setQ] = useState(true)
  const [gate, setGate] = useState<Gate>('and')
  const [visited, setVisited] = useState<string[]>([])
  const g = GATES[gate]
  const out = g.f(p, q)
  const row = ROWS.findIndex(([a, b]) => a === p && b === q)
  const note = (np: boolean, nq: boolean, ng: Gate) => {
    const key = `${ng}-${ROWS.findIndex(([a, b]) => a === np && b === nq)}`
    if (!visited.includes(key)) setVisited([...visited, key])
  }
  const allRows = [0, 1, 2, 3].every((r) => visited.includes(`${gate}-${r}`))
  return (
    <LabSection id="explore" eyebrow="Explore" title="Switches and a lamp">
      <Prose>
        <p>
          Two switches, P and Q, feed a gate that decides whether the lamp lights. Pick a gate and
          try every combination of switches; the truth table highlights the row you're on.
        </p>
      </Prose>
      <PredictReveal
        question="“If it rains, the ground is wet.” Today it didn't rain, but the ground is wet. Was the statement broken?"
        options={[
          'Yes: the ground is wet without rain',
          'No: the statement says nothing about days without rain',
        ]}
        answer={1}
        explanation="An “if… then” is only broken when the “if” part happens and the “then” part doesn't. With no rain, it wasn't tested, so it still counts as true."
      />
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Gate"
            size="sm"
            className="flex-wrap"
            value={gate}
            onChange={(v) => {
              setGate(v)
              note(p, q, v)
            }}
            options={(Object.keys(GATES) as Gate[]).map((k) => ({
              value: k,
              label: GATES[k].label,
            }))}
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 px-3 pt-4 sm:px-4">
          <div className="flex flex-col gap-3">
            <Switch
              checked={p}
              onChange={(v) => {
                setP(v)
                note(v, q, gate)
              }}
              label={`P is ${p ? 'true' : 'false'}`}
            />
            <Switch
              checked={q}
              onChange={(v) => {
                setQ(v)
                note(p, v, gate)
              }}
              label={`Q is ${q ? 'true' : 'false'}`}
            />
          </div>
          <div className="rounded-lg border border-line px-3 py-2 text-sm font-semibold">
            {g.label}
          </div>
          <Lamp on={out} />
          <TruthTable
            columns={[{ tex: g.tex, values: ROWS.map(([a, b]) => g.f(a, b)) }]}
            current={row}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'output',
                value: <Tex>{`${g.tex} = \\text{${out ? 'true' : 'false'}}`}</Tex>,
              },
              {
                label: 'rows tried for this gate',
                value: [0, 1, 2, 3].filter((r) => visited.includes(`${gate}-${r}`)).length,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-and-lit" when={gate === 'and' && out}>
          Light the lamp through the AND gate.
        </TryThis>
        <TryThis id="t-every-row" when={allRows}>
          Try all four rows for one gate.
        </TryThis>
        <TryThis id="t-if-broken" when={gate === 'implies' && !out}>
          Find the only way to break “if P then Q”.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type Expr = 'notAnd' | 'orNots' | 'notOr' | 'andNots' | 'imp' | 'contra' | 'converse' | 'notPorQ'
const FORMULAS: Record<
  Expr,
  { label: string; tex: string; f: (p: boolean, q: boolean) => boolean }
> = {
  notAnd: { label: '¬(P∧Q)', tex: '\\lnot(P \\land Q)', f: (p, q) => !(p && q) },
  orNots: { label: '¬P∨¬Q', tex: '\\lnot P \\lor \\lnot Q', f: (p, q) => !p || !q },
  notOr: { label: '¬(P∨Q)', tex: '\\lnot(P \\lor Q)', f: (p, q) => !(p || q) },
  andNots: { label: '¬P∧¬Q', tex: '\\lnot P \\land \\lnot Q', f: (p, q) => !p && !q },
  imp: { label: 'P→Q', tex: 'P \\to Q', f: (p, q) => !p || q },
  contra: { label: '¬Q→¬P', tex: '\\lnot Q \\to \\lnot P', f: (p, q) => q || !p },
  converse: { label: 'Q→P', tex: 'Q \\to P', f: (p, q) => !q || p },
  notPorQ: { label: '¬P∨Q', tex: '\\lnot P \\lor Q', f: (p, q) => !p || q },
}
const FORMULA_OPTIONS = (Object.keys(FORMULAS) as Expr[]).map((k) => ({
  value: k,
  label: FORMULAS[k].label,
  ariaLabel: FORMULAS[k].label,
}))
const isPair = (x: Expr, y: Expr, a: Expr, b: Expr) => (x === a && y === b) || (x === b && y === a)

function EquivalenceExplorer() {
  const [left, setLeft] = useState<Expr>('notAnd')
  const [right, setRight] = useState<Expr>('andNots')
  const L = ROWS.map(([p, q]) => FORMULAS[left].f(p, q))
  const R = ROWS.map(([p, q]) => FORMULAS[right].f(p, q))
  const marks = L.map((v, i) => v === R[i])
  const differ = marks.filter((m) => !m).length
  return (
    <LabSection id="equivalence" eyebrow="Explore" title="Same statement in disguise?">
      <Prose>
        <p>
          Two formulas mean the same thing when they agree on every row of the truth table. Pick two
          and compare their columns: a green dot means they agree on that row, a red one that they
          don't.
        </p>
      </Prose>
      <Figure>
        <div className="space-y-2 px-3 pt-3 sm:px-4">
          <Segmented
            label="First formula"
            size="sm"
            className="flex-wrap"
            value={left}
            onChange={setLeft}
            options={FORMULA_OPTIONS}
          />
          <Segmented
            label="Second formula"
            size="sm"
            className="flex-wrap"
            value={right}
            onChange={setRight}
            options={FORMULA_OPTIONS}
          />
        </div>
        <div className="overflow-x-auto px-3 pt-4 sm:px-4">
          <TruthTable
            columns={[
              { tex: FORMULAS[left].tex, values: L },
              { tex: FORMULAS[right].tex, values: R, marks },
            ]}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'verdict',
                value:
                  differ === 0
                    ? 'equivalent: same on every row'
                    : `different on ${differ} row${differ > 1 ? 's' : ''}`,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis
          id="t-de-morgan"
          when={isPair(left, right, 'notAnd', 'orNots') || isPair(left, right, 'notOr', 'andNots')}
        >
          Find one of De Morgan's laws: a “not” outside the brackets that matches two “not”s inside.
        </TryThis>
        <TryThis id="t-contrapositive" when={isPair(left, right, 'imp', 'contra')}>
          Compare “if P then Q” with its contrapositive.
        </TryThis>
        <TryThis id="t-converse" when={isPair(left, right, 'imp', 'converse')}>
          Compare “if P then Q” with its converse. On which rows do they disagree?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [gate, setGate] = useState<Gate>('and')
  const target = [false, true, true, false]
  const values = ROWS.map(([p, q]) => GATES[gate].f(p, q))
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-three-rows"
          index={1}
          prompt="How many rows does a truth table for three statements P, Q, R have?"
          answer={8}
          explanation="Each statement is true or false: $2 \times 2 \times 2 = 2^3 = 8$ rows."
        />
        <McqChallenge
          id="c-or-false"
          index={2}
          prompt="When is $P \lor Q$ false?"
          options={[
            { text: 'Only when both P and Q are false', correct: true },
            { text: 'When exactly one is false', why: 'One true part is enough for OR.' },
            { text: 'When both are true', why: 'Both true makes OR true.' },
          ]}
          explanation="OR needs at least one true part, so it fails only when both are false."
        />
        <McqChallenge
          id="c-if-false"
          index={3}
          prompt="“If you finish your homework, you can play.” When was this promise broken?"
          options={[
            { text: 'You finished, but weren’t allowed to play', correct: true },
            {
              text: 'You didn’t finish, and didn’t play',
              why: 'The promise only covers finishing.',
            },
            {
              text: 'You didn’t finish, but played anyway',
              why: 'The promise says nothing about not finishing.',
            },
            { text: 'You finished and played', why: 'That keeps the promise.' },
          ]}
          explanation="$P \to Q$ is false only when P is true and Q is false."
        />
        <NumericChallenge
          id="c-xor-rows"
          index={4}
          prompt="On how many of the four rows is $P \oplus Q$ (exclusive or) true?"
          answer={2}
          explanation="Exactly one true: the rows T F and F T."
        />
        <McqChallenge
          id="c-negate-all"
          index={5}
          prompt="What is the negation of “every swan is white”?"
          options={[
            { text: 'At least one swan is not white', correct: true },
            {
              text: 'No swan is white',
              why: 'Too strong: one non-white swan is enough to break the claim.',
            },
            { text: 'Every swan is black', why: 'Much too strong.' },
          ]}
          explanation="“Not every” means “at least one isn't”."
        />
        <InteractiveChallenge
          id="c-pick-gate"
          index={6}
          prompt="Choose the gate whose output column is F, T, T, F (for the rows TT, TF, FT, FF)."
          solved={values.every((v, i) => v === target[i])}
          hint="It is true when the switches differ."
          explanation="XOR (exclusive or) is true exactly when one switch is on and the other off."
          onReset={() => setGate('and')}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <Segmented
              label="Gate"
              size="sm"
              className="flex-wrap"
              value={gate}
              onChange={setGate}
              options={(Object.keys(GATES) as Gate[]).map((k) => ({
                value: k,
                label: GATES[k].label,
              }))}
            />
            <TruthTable
              columns={[
                { tex: GATES[gate].tex, values, marks: values.map((v, i) => v === target[i]) },
              ]}
            />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

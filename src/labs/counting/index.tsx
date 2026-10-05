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

const LEVELS = ['var(--c-blue)', 'var(--c-orange)', 'var(--c-green)']
const SOCKS = [
  'var(--c-blue)',
  'var(--c-orange)',
  'var(--c-green)',
  'var(--c-violet)',
  'var(--c-red)',
  'var(--c-aqua)',
]

type Node = { x: number; y: number; level: number; parent: number | null }

/**
 * A left-to-right tree with `sizes[i]` branches at level i. Leaves are spaced evenly; each
 * inner node sits at the average height of its children.
 */
function treeLayout(sizes: number[], height: number): Node[] {
  const leaves = sizes.reduce((p, s) => p * s, 1)
  const xs = [24, 130, 240, 350]
  const gap = leaves > 1 ? (height - 24) / (leaves - 1) : 0
  const nodes: Node[] = []
  // Build level by level; nodes of level L are numbered in order, each with `per` leaves below.
  const levelStart: number[] = []
  for (let level = 0; level <= sizes.length; level++) {
    levelStart.push(nodes.length)
    const count = sizes.slice(0, level).reduce((p, s) => p * s, 1)
    const per = leaves / count
    for (let i = 0; i < count; i++) {
      const y = 12 + gap * (i * per + (per - 1) / 2)
      const parent = level === 0 ? null : levelStart[level - 1] + Math.floor(i / sizes[level - 1])
      nodes.push({ x: xs[level], y, level, parent })
    }
  }
  return nodes
}

function OutfitTree({ s, t, h }: { s: number; t: number; h: number }) {
  const leaves = s * t * h
  const height = Math.max(120, leaves * 11 + 24)
  const nodes = treeLayout([s, t, h], height)
  return (
    <svg
      viewBox={`0 0 380 ${height}`}
      className="mx-auto block h-auto w-full max-w-md"
      role="img"
      aria-label={`A tree with ${s} shirts, then ${t} trousers, then ${h} pairs of shoes: ${leaves} outfits`}
    >
      {nodes.map((n, i) =>
        n.parent == null ? null : (
          <line
            key={`l${i}`}
            x1={nodes[n.parent].x}
            y1={nodes[n.parent].y}
            x2={n.x}
            y2={n.y}
            style={{ stroke: 'var(--line)', strokeWidth: 1.5 }}
          />
        ),
      )}
      {nodes.map((n, i) => (
        <circle
          key={`c${i}`}
          cx={n.x}
          cy={n.y}
          r={n.level === 0 ? 6 : 4.5}
          style={{ fill: n.level === 0 ? 'var(--ink-2)' : LEVELS[n.level - 1] }}
        />
      ))}
    </svg>
  )
}

export default function CountingLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Count without listing">
        <Prose>
          <p>
            How many outfits can you make from 3 shirts and 2 pairs of trousers? You could list
            them, but there's a shortcut: for <em>each</em> shirt there are 2 trousers, so{' '}
            <Tex>{'3 \\times 2 = 6'}</Tex>. When choices happen one after another, the counts{' '}
            <strong>multiply</strong>.
          </p>
          <p>
            That one rule counts PIN codes, number plates, passwords and lottery tickets, numbers
            far too big to list. Two companions complete the toolkit: when you choose one option{' '}
            <em>or</em> another, counts <strong>add</strong>; and the pigeonhole principle tells you
            when a repeat is guaranteed.
          </p>
        </Prose>
      </LabSection>
      <TreeExplorer />
      <CodeExplorer />
      <SockExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Three counting principles">
        <Formula
          tex={
            '\\text{and then: } n_1 \\times n_2 \\times \\cdots \\qquad \\text{or: } n_1 + n_2 \\qquad k \\text{ symbols}, L \\text{ places: } k^L'
          }
          caption="Multiply for steps in a row, add for separate alternatives."
        />
        <Prose>
          <ul>
            <li>
              <strong>Multiplication principle:</strong> a first step with <Tex>{'a'}</Tex> ways
              followed by a second with <Tex>{'b'}</Tex> ways gives <Tex>{'ab'}</Tex> outcomes. A
              tree diagram shows why: every branch splits again.
            </li>
            <li>
              <strong>Addition principle:</strong> choose a sandwich (5 kinds) <em>or</em> a salad
              (3 kinds), but not both: <Tex>{'5 + 3 = 8'}</Tex> choices. The options must not
              overlap.
            </li>
            <li>
              <strong>Pigeonhole principle:</strong> put more than <Tex>{'n'}</Tex> items into{' '}
              <Tex>{'n'}</Tex> boxes and some box gets two. With 13 people, two share a birth month.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="Multiply or add?">
          <p>
            Ask “do I make all these choices, or just one of them?” A 4-digit PIN makes four choices
            in a row: <Tex>{'10^4 = 10\\,000'}</Tex>, not <Tex>{'10 + 10 + 10 + 10'}</Tex>. Picking
            one dessert from 4 cakes or 3 ice creams is a single choice: <Tex>{'4 + 3'}</Tex>, not{' '}
            <Tex>{'4 \\times 3'}</Tex>.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where counting matters">
        <RealWorld
          items={[
            {
              title: 'Passwords',
              body: 'Each extra character multiplies the possibilities: 8 random letters and digits give 36⁸ ≈ 2.8 trillion.',
            },
            {
              title: 'Number plates and phone numbers',
              body: 'Formats are designed with enough combinations: three letters then four digits give 26³ × 10⁴ ≈ 176 million.',
            },
            {
              title: 'Menus and products',
              body: 'A café with 4 sizes, 6 drinks and 3 milks offers 72 different orders.',
            },
            {
              title: 'Hashing',
              body: 'The pigeonhole principle says that any short fingerprint of long files must sometimes collide.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Choices made one after another multiply.',
            'Separate alternatives (one or the other) add.',
            '$L$ places, each with $k$ symbols: $k^L$ codes.',
            'More items than boxes means some box holds two (pigeonhole).',
          ]}
        />
      </LabSection>
    </div>
  )
}

function TreeExplorer() {
  const [s, setS] = useState(3)
  const [t, setT] = useState(2)
  const [h, setH] = useState(2)
  const total = s * t * h
  return (
    <LabSection id="explore" eyebrow="Explore" title="The outfit tree">
      <Prose>
        <p>
          Each branch is a choice: first a shirt (blue), then trousers (orange), then shoes (green).
          Every path from left to right is one outfit, so the number of outfits is the number of
          leaves on the right.
        </p>
      </Prose>
      <PredictReveal
        question="With 3 shirts, 2 pairs of trousers and 2 pairs of shoes, how many outfits are there?"
        options={['7', '9', '12', '18']}
        answer={2}
        explanation="Every shirt pairs with every pair of trousers (6 combinations), and each of those with either pair of shoes: $3 \times 2 \times 2 = 12$."
      />
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <OutfitTree s={s} t={t} h={h} />
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line mt-3 px-3 pt-3 sm:grid-cols-3 sm:px-4">
          <Slider
            label="Shirts"
            value={s}
            min={1}
            max={4}
            step={1}
            onChange={setS}
            color={LEVELS[0]}
          />
          <Slider
            label="Trousers"
            value={t}
            min={1}
            max={3}
            step={1}
            onChange={setT}
            color={LEVELS[1]}
          />
          <Slider
            label="Shoes"
            value={h}
            min={1}
            max={3}
            step={1}
            onChange={setH}
            color={LEVELS[2]}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'outfits', value: <Tex>{`${s} \\times ${t} \\times ${h} = ${total}`}</Tex> },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-make-twenty-four" when={total === 24}>
          Make exactly 24 outfits.
        </TryThis>
        <TryThis id="t-only-one-pair" when={h === 1 && total > 1}>
          With only one pair of shoes, does the number of outfits change from shirts × trousers?
        </TryThis>
        <TryThis id="t-full-wardrobe" when={total === 36}>
          Max out the wardrobe. How many outfits is that?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const ALPHABETS = [
  { value: '2', label: 'Binary (2)' },
  { value: '10', label: 'Digits (10)' },
  { value: '26', label: 'Letters (26)' },
  { value: '36', label: 'Letters + digits (36)' },
]

function duration(seconds: number) {
  if (seconds < 60) return `${seconds.toFixed(seconds < 1 ? 3 : 0)} seconds`
  if (seconds < 3600) return `${(seconds / 60).toFixed(0)} minutes`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`
  if (seconds < 3.15e7) return `${(seconds / 86400).toFixed(0)} days`
  return `${(seconds / 3.15e7).toLocaleString('en', { maximumFractionDigits: 0 })} years`
}

function CodeExplorer() {
  const [k, setK] = useState('10')
  const [L, setL] = useState(3)
  const count = Number(k) ** L
  return (
    <LabSection id="codes" eyebrow="Explore" title="Codes and passwords">
      <Prose>
        <p>
          A code has <Tex>{'L'}</Tex> places, and each place can be any of <Tex>{'k'}</Tex> symbols.
          The choices multiply, place after place. How long would a machine guessing a thousand
          codes a second take to try them all?
        </p>
      </Prose>
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Symbols per place"
            size="sm"
            className="flex-wrap"
            value={k}
            onChange={setK}
            options={ALPHABETS}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-1.5 px-3 pt-4 sm:px-4" aria-hidden>
          {Array.from({ length: L }, (_, i) => (
            <span
              key={i}
              className="inline-flex size-10 items-center justify-center rounded-lg border-2 border-line text-sm text-ink-2"
            >
              {k}
            </span>
          ))}
        </div>
        <div className="overflow-x-auto px-3 pt-3 text-center sm:px-4">
          <Tex>{`${k}^{${L}} = ${count.toLocaleString('en')}`}</Tex>
        </div>
        <div className="border-t border-line mt-3 px-3 pt-3 sm:px-4">
          <Slider label="Length L" value={L} min={1} max={8} step={1} onChange={setL} />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'possible codes', value: count.toLocaleString('en') },
              { label: 'to try them all at 1000 a second', value: duration(count / 1000) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-pin" when={k === '10' && L === 4}>
          Count 4-digit PINs.
        </TryThis>
        <TryThis id="t-byte" when={k === '2' && L === 8}>
          Count the 8-bit binary codes (one byte). Where have you seen that number?
        </TryThis>
        <TryThis id="t-billion" when={count >= 1e9}>
          Get past a billion codes. How few places can you use?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

/** The worst case: socks come out colour after colour, so a pair appears as late as possible. */
const worstCase = (colours: number, draws: number) =>
  Array.from({ length: draws }, (_, i) => i % colours)

function SockExplorer() {
  const [c, setC] = useState(3)
  const [d, setD] = useState(2)
  const socks = worstCase(c, d)
  const pair = d > c
  return (
    <LabSection id="pigeonhole" eyebrow="Explore" title="Socks in the dark">
      <Prose>
        <p>
          A drawer holds socks in <Tex>{'c'}</Tex> colours, and you pull some out in the dark. Shown
          here is the unluckiest order: every new sock is a different colour for as long as
          possible. How many draws guarantee a matching pair?
        </p>
      </Prose>
      <Figure>
        <div
          className="flex flex-wrap justify-center gap-2 px-3 pt-4 sm:px-4"
          role="img"
          aria-label={`${d} socks drawn from ${c} colours`}
        >
          {socks.map((col, i) => (
            <div
              key={i}
              className="h-12 w-6 rounded-b-xl rounded-t-sm"
              style={{ background: SOCKS[col], opacity: 0.85 }}
            />
          ))}
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line mt-4 px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider label="Colours c" value={c} min={2} max={6} step={1} onChange={setC} />
          <Slider label="Socks drawn" value={d} min={1} max={10} step={1} onChange={setD} />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'matching pair guaranteed?',
                value: pair ? `yes: ${d} socks, only ${c} colours` : 'not yet',
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-first-sure" when={d === c + 1}>
          Find the fewest draws that guarantee a pair, whatever the number of colours.
        </TryThis>
        <TryThis id="t-one-short" when={d === c && c >= 4}>
          With 4 or more colours, draw exactly as many socks as colours. Is a pair certain?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [s, setS] = useState(1)
  const [t, setT] = useState(1)
  const [h, setH] = useState(1)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-shirts-trousers"
          index={1}
          prompt="How many outfits from 3 shirts and 4 pairs of trousers?"
          answer={12}
          explanation="$3 \times 4 = 12$."
        />
        <NumericChallenge
          id="c-four-digits"
          index={2}
          prompt="How many 4-digit PINs are there (0000 to 9999)?"
          answer={10000}
          explanation="$10 \times 10 \times 10 \times 10 = 10^4 = 10\,000$."
        />
        <NumericChallenge
          id="c-lunch-or"
          index={3}
          prompt="Lunch is one sandwich (5 kinds) or one salad (3 kinds). How many choices?"
          answer={8}
          explanation="One or the other, not both: add, $5 + 3 = 8$."
        />
        <NumericChallenge
          id="c-three-coins"
          index={4}
          prompt="Three coins are flipped one after another. How many different sequences of heads and tails?"
          answer={8}
          explanation="$2 \times 2 \times 2 = 8$: HHH, HHT, …, TTT."
        />
        <McqChallenge
          id="c-months"
          index={5}
          prompt="In any group of 13 people, must two share a birth month?"
          options={[
            { text: 'Yes, always', correct: true },
            { text: 'Only usually', why: 'It is guaranteed, not just likely.' },
            { text: 'No', why: 'There are only 12 months.' },
          ]}
          explanation="13 people into 12 months: by the pigeonhole principle some month gets two."
        />
        <InteractiveChallenge
          id="c-eighteen"
          index={6}
          prompt="Choose numbers of shirts, trousers and shoes that give exactly 18 outfits."
          solved={s * t * h === 18}
          hint="Factor 18 into three whole numbers that fit the sliders."
          explanation="For example 3 shirts × 2 trousers × 3 shoes = 18 (or 2 × 3 × 3)."
          onReset={() => {
            setS(1)
            setT(1)
            setH(1)
          }}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <OutfitTree s={s} t={t} h={h} />
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
              <Slider
                label="Shirts"
                value={s}
                min={1}
                max={4}
                step={1}
                onChange={setS}
                color={LEVELS[0]}
              />
              <Slider
                label="Trousers"
                value={t}
                min={1}
                max={3}
                step={1}
                onChange={setT}
                color={LEVELS[1]}
              />
              <Slider
                label="Shoes"
                value={h}
                min={1}
                max={3}
                step={1}
                onChange={setH}
                color={LEVELS[2]}
              />
            </div>
            <p className="text-sm">
              <Tex>{`${s} \\times ${t} \\times ${h} = ${s * t * h}`}</Tex>
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

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
import { VennDiagram } from '../_shared/VennDiagram'
import { OP_REGIONS, type Region, type SetOp } from '../_shared/venn'

const A_COL = 'var(--c-blue)'
const B_COL = 'var(--c-orange)'

const OPS: { value: SetOp; label: string; tex: string }[] = [
  { value: 'A', label: 'A', tex: 'A' },
  { value: 'B', label: 'B', tex: 'B' },
  { value: 'and', label: 'A ∩ B', tex: 'A \\cap B' },
  { value: 'or', label: 'A ∪ B', tex: 'A \\cup B' },
  { value: 'notA', label: 'A′', tex: "A'" },
  { value: 'aMinusB', label: 'A ∖ B', tex: 'A \\setminus B' },
]
const OP_WORDS: Record<SetOp, string> = {
  A: 'everything in A',
  B: 'everything in B',
  and: 'in A and in B (intersection)',
  or: 'in A or B or both (union)',
  notA: 'not in A (complement)',
  aMinusB: 'in A but not in B (difference)',
}

const sum = (counts: Record<Region, number>, rs: readonly Region[]) =>
  rs.reduce((s, r) => s + counts[r], 0)

export default function SetsVennLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Collections, and where they overlap">
        <Prose>
          <p>
            A <strong>set</strong> is just a collection: the students who play football, the even
            numbers, the cities you have visited. Draw each set as a circle inside a box holding
            everything you're talking about (the <strong>universe</strong>), and a{' '}
            <strong>Venn diagram</strong> shows at a glance who is in one, both or neither.
          </p>
          <p>
            Most questions about sets are questions about regions: in both (
            <strong>intersection</strong>), in at least one (<strong>union</strong>), not in it (
            <strong>complement</strong>). And counting the union has one classic trap: don't count
            the overlap twice.
          </p>
        </Prose>
      </LabSection>
      <CountExplorer />
      <NumberExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Set operations">
        <Formula
          tex={'|A \\cup B| = |A| + |B| - |A \\cap B|'}
          caption="Inclusion–exclusion: add the two sets, then subtract the overlap you counted twice."
        />
        <Prose>
          <ul>
            <li>
              <Tex>{'A \\cap B'}</Tex> (“A and B”): in both. <Tex>{'A \\cup B'}</Tex> (“A or B”): in
              at least one. <Tex>{"A'"}</Tex>: in the universe but not in A.{' '}
              <Tex>{'A \\setminus B'}</Tex>: in A but not in B.
            </li>
            <li>
              <Tex>{'|A|'}</Tex> means the number of elements. <Tex>{'x \\in A'}</Tex> means{' '}
              <Tex>{'x'}</Tex> belongs to A; <Tex>{'A \\subseteq B'}</Tex> means every element of A
              is also in B. The empty set is <Tex>{'\\varnothing'}</Tex>.
            </li>
            <li>
              <strong>De Morgan's laws:</strong> <Tex>{"(A \\cup B)' = A' \\cap B'"}</Tex> and{' '}
              <Tex>{"(A \\cap B)' = A' \\cup B'"}</Tex>. Shade both sides and they match.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="“Or” includes both">
          <p>
            In maths, “A or B” means A, B, <em>or both</em>. If 12 students play football, 10 play
            piano and 2 do both, then 20, not 22, play football or piano. Adding 12 + 10 counts the
            2 twice.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where sets are used">
        <RealWorld
          items={[
            {
              title: 'Search',
              body: 'Searching for “cats AND dogs” returns the intersection of two sets of pages; “cats OR dogs” the union.',
            },
            {
              title: 'Databases',
              body: 'SQL joins and filters are set operations: customers who bought X but not Y is a set difference.',
            },
            {
              title: 'Surveys',
              body: 'Inclusion–exclusion turns “how many use either app?” into two counts and an overlap.',
            },
            {
              title: 'Probability',
              body: 'Events are sets of outcomes, and P(A or B) = P(A) + P(B) − P(A and B) is the same formula.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A set is a collection; a Venn diagram shows its regions inside a universe.',
            '∩ is “and” (in both), ∪ is “or” (in at least one), A′ is “not A”.',
            '$|A \\cup B| = |A| + |B| - |A \\cap B|$: don’t count the overlap twice.',
            '“Or” in maths includes both.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function CountExplorer() {
  const [counts, setCounts] = useState<Record<Region, number>>({
    '10': 4,
    '11': 3,
    '01': 2,
    '00': 2,
  })
  const [op, setOp] = useState<SetOp>('or')
  const nA = sum(counts, ['10', '11'])
  const nB = sum(counts, ['11', '01'])
  const nAnd = counts['11']
  const nOr = sum(counts, ['10', '11', '01'])
  const set = (r: Region) => (v: number) => setCounts({ ...counts, [r]: v })
  const opTex = OPS.find((o) => o.value === op)?.tex ?? ''
  return (
    <LabSection id="explore" eyebrow="Explore" title="Count the regions">
      <Prose>
        <p>
          Each dot is one person. Set how many are in each region, then pick an operation to shade.
          Check the union formula: the readout adds the two circles and takes off the overlap.
        </p>
      </Prose>
      <PredictReveal
        question="In a class of 20, 12 play football and 10 play the piano. Everyone does at least one. How many do both?"
        options={['0', '2', '10', '22']}
        answer={1}
        explanation="12 + 10 = 22 counts the people who do both twice. There are only 20 people, so 22 − 20 = 2 do both."
      />
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Operation"
            size="sm"
            className="flex-wrap"
            value={op}
            onChange={setOp}
            options={OPS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <p className="mt-2 text-sm text-ink-2">Shaded: {OP_WORDS[op]}</p>
        </div>
        <div className="px-3 pt-2 sm:px-4">
          <VennDiagram
            counts={counts}
            shaded={OP_REGIONS[op]}
            ariaLabel={`Venn diagram with ${nA} in A, ${nB} in B, ${nAnd} in both`}
          />
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label="Only in A"
            value={counts['10']}
            min={0}
            max={8}
            step={1}
            onChange={set('10')}
            color={A_COL}
          />
          <Slider
            label="In both"
            value={counts['11']}
            min={0}
            max={8}
            step={1}
            onChange={set('11')}
          />
          <Slider
            label="Only in B"
            value={counts['01']}
            min={0}
            max={8}
            step={1}
            onChange={set('01')}
            color={B_COL}
          />
          <Slider
            label="In neither"
            value={counts['00']}
            min={0}
            max={8}
            step={1}
            onChange={set('00')}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: <Tex>{`|${opTex}|`}</Tex>, value: sum(counts, OP_REGIONS[op]) },
              {
                label: <Tex>{'|A| + |B| - |A \\cap B|'}</Tex>,
                value: `${nA} + ${nB} − ${nAnd} = ${nA + nB - nAnd}`,
              },
              { label: <Tex>{'|A \\cup B|'}</Tex>, value: nOr },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis
          id="t-no-overlap"
          when={counts['11'] === 0 && counts['10'] > 0 && counts['01'] > 0}
        >
          Make A and B share nobody. What happens to the formula?
        </TryThis>
        <TryThis id="t-inside" when={counts['10'] === 0 && counts['11'] > 0 && counts['01'] > 0}>
          Make A sit entirely inside B. Which operation then shades exactly A?
        </TryThis>
        <TryThis id="t-shade-not-a" when={op === 'notA'}>
          Shade the complement of A. Does it include the people in neither set?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type Rule = 'three' | 'prime' | 'big' | 'odd'
const RULES: Record<Rule, { label: string; test: (n: number) => boolean; words: string }> = {
  three: { label: 'Multiples of 3', test: (n) => n % 3 === 0, words: 'multiples of 3' },
  prime: { label: 'Primes', test: (n) => [2, 3, 5, 7, 11].includes(n), words: 'primes' },
  big: { label: 'Above 6', test: (n) => n > 6, words: 'numbers above 6' },
  odd: { label: 'Odd', test: (n) => n % 2 === 1, words: 'odd numbers' },
}
const UNIVERSE = Array.from({ length: 12 }, (_, i) => i + 1)
const isEven = (n: number) => n % 2 === 0
const regionOf = (n: number, inB: (n: number) => boolean): Region =>
  `${isEven(n) ? 1 : 0}${inB(n) ? 1 : 0}` as Region

/** How many of 1–12 fall in each region for this choice of B. */
function countRegions(inB: (n: number) => boolean): Record<Region, number> {
  const counts: Record<Region, number> = { '10': 0, '11': 0, '01': 0, '00': 0 }
  for (const n of UNIVERSE) counts[regionOf(n, inB)]++
  return counts
}

function NumberExplorer() {
  const [rule, setRule] = useState<Rule>('three')
  const [op, setOp] = useState<SetOp>('and')
  const inB = RULES[rule].test
  const result = UNIVERSE.filter((n) => OP_REGIONS[op].includes(regionOf(n, inB)))
  const counts = countRegions(inB)
  const opTex = OPS.find((o) => o.value === op)?.tex ?? ''
  return (
    <LabSection id="numbers" eyebrow="Explore" title="Sets of numbers">
      <Prose>
        <p>
          The universe is the numbers 1 to 12. A is the even numbers; choose what B is. The lists
          show which numbers land in each region, and the result of the operation.
        </p>
      </Prose>
      <Figure>
        <div className="flex flex-wrap gap-3 px-3 pt-3 sm:px-4">
          <Segmented
            label="Set B"
            size="sm"
            className="flex-wrap"
            value={rule}
            onChange={setRule}
            options={(Object.keys(RULES) as Rule[]).map((k) => ({
              value: k,
              label: RULES[k].label,
            }))}
          />
          <Segmented
            label="Operation"
            size="sm"
            className="flex-wrap"
            value={op}
            onChange={setOp}
            options={OPS.map((o) => ({ value: o.value, label: o.label }))}
          />
        </div>
        <div className="px-3 pt-2 sm:px-4">
          <VennDiagram
            counts={counts}
            shaded={OP_REGIONS[op]}
            names={['Even', 'B']}
            ariaLabel={`Even numbers and ${RULES[rule].words} from 1 to 12`}
          />
        </div>
        <div className="overflow-x-auto px-3 pt-2 text-center sm:px-4">
          <Tex
            display
          >{`${opTex} = ${result.length ? `\\{${result.join(', ')}\\}` : '\\varnothing'}`}</Tex>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'A (even)', value: `{${UNIVERSE.filter(isEven).join(', ')}}`, color: A_COL },
              {
                label: `B (${RULES[rule].words})`,
                value: `{${UNIVERSE.filter(inB).join(', ')}}`,
                color: B_COL,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-even-prime" when={rule === 'prime' && op === 'and'}>
          Find the even primes. How many are there?
        </TryThis>
        <TryThis id="t-empty-overlap" when={op === 'and' && result.length === 0}>
          Choose a B that shares nothing with the even numbers.
        </TryThis>
        <TryThis id="t-whole-universe" when={op === 'or' && result.length === 12}>
          Make the union the whole universe.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [c, setC] = useState<Record<Region, number>>({ '10': 0, '11': 0, '01': 0, '00': 0 })
  const nA = c['10'] + c['11']
  const nB = c['11'] + c['01']
  const nOr = c['10'] + c['11'] + c['01']
  const set = (r: Region) => (v: number) => setC({ ...c, [r]: v })
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-inclusion"
          index={1}
          prompt="$|A| = 15$, $|B| = 10$ and $|A \cap B| = 4$. What is $|A \cup B|$?"
          answer={21}
          explanation="$15 + 10 - 4 = 21$."
        />
        <McqChallenge
          id="c-cap-means"
          index={2}
          prompt="What does $A \cap B$ contain?"
          options={[
            { text: 'Everything in both A and B', correct: true },
            { text: 'Everything in A or B', why: 'That is $A \\cup B$.' },
            { text: 'Everything in A but not B', why: 'That is $A \\setminus B$.' },
            { text: 'Everything in neither', why: "That is $(A \\cup B)'$." },
          ]}
          explanation="∩ is intersection: the overlap, in both."
        />
        <NumericChallenge
          id="c-complement"
          index={3}
          prompt="The universe has 30 elements and $|A| = 12$. What is $|A'|$?"
          answer={18}
          explanation="The complement is everything else: $30 - 12 = 18$."
        />
        <NumericChallenge
          id="c-list-union"
          index={4}
          prompt="$A = \{1, 2, 3, 4\}$ and $B = \{3, 4, 5\}$. How many elements are in $A \cup B$?"
          answer={5}
          explanation="$A \cup B = \{1, 2, 3, 4, 5\}$: 3 and 4 are counted once."
        />
        <McqChallenge
          id="c-difference"
          index={5}
          prompt="With the same $A$ and $B$, what is $A \setminus B$?"
          options={[
            { text: '$\\{1, 2\\}$', correct: true },
            { text: '$\\{5\\}$', why: 'That is $B \\setminus A$.' },
            { text: '$\\{3, 4\\}$', why: 'That is $A \\cap B$.' },
            { text: '$\\{1, 2, 5\\}$', why: 'That is everything in exactly one of them.' },
          ]}
          explanation="Take A and remove anything also in B: 3 and 4 go, leaving $\{1, 2\}$."
        />
        <InteractiveChallenge
          id="c-fit-counts"
          index={6}
          prompt="Set the regions so that $|A| = 7$, $|B| = 5$ and $|A \cup B| = 9$."
          solved={nA === 7 && nB === 5 && nOr === 9}
          hint="Use the formula: $9 = 7 + 5 - |A \cap B|$."
          explanation="$|A \cap B| = 7 + 5 - 9 = 3$, so A only is 4, both is 3 and B only is 2."
          onReset={() => setC({ '10': 0, '11': 0, '01': 0, '00': 0 })}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <VennDiagram counts={c} shaded={[]} ariaLabel={`A has ${nA}, B has ${nB}`} />
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
              <Slider
                label="Only in A"
                value={c['10']}
                min={0}
                max={8}
                step={1}
                onChange={set('10')}
                color={A_COL}
              />
              <Slider
                label="In both"
                value={c['11']}
                min={0}
                max={8}
                step={1}
                onChange={set('11')}
              />
              <Slider
                label="Only in B"
                value={c['01']}
                min={0}
                max={8}
                step={1}
                onChange={set('01')}
                color={B_COL}
              />
            </div>
            <p className="text-sm">
              |A| = {nA}, |B| = {nB}, |A ∪ B| = {nOr}
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

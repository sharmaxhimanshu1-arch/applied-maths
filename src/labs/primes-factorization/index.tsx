import { useState } from 'react'
import { RotateCcw, StepForward } from 'lucide-react'
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
import { Button } from '@/ui/Button'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'
import { divisorCount, factorTex, primeFactors } from '../_shared/numbers'
import { gcd, isPrime } from '../_shared/numberTheory'

const PRIME = 'var(--c-blue)'
const CURRENT = 'var(--c-orange)'
const SHARED = 'var(--c-green)'
const SIEVE_PRIMES = [2, 3, 5, 7]
const NUMBERS = Array.from({ length: 99 }, (_, i) => i + 2)

/** Factors shared by two lists, counted with repeats: [2,2,3] and [2,3,3] share [2,3]. */
function common(a: readonly number[], b: readonly number[]): number[] {
  const rest = [...b]
  const out: number[] = []
  for (const p of a) {
    const i = rest.indexOf(p)
    if (i >= 0) {
      out.push(p)
      rest.splice(i, 1)
    }
  }
  return out
}

const product = (xs: readonly number[]) => xs.reduce((p, x) => p * x, 1)
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b

/** The split-off steps of a factor tree: 60 → [[2, 30], [2, 15], [3, 5]]. */
function treeSteps(n: number): [number, number][] {
  const fs = primeFactors(n)
  const steps: [number, number][] = []
  let rest = n
  for (let i = 0; i < fs.length - 1; i++) {
    rest /= fs[i]
    steps.push([fs[i], rest])
  }
  return steps
}

export default function PrimesFactorizationLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="The atoms of multiplication">
        <Prose>
          <p>
            Some numbers split into smaller factors: <Tex>{'12 = 3 \\times 4'}</Tex>. Others won't
            split at all except as 1 times themselves: 2, 3, 5, 7, 11, 13… These are the{' '}
            <strong>prime numbers</strong>, and every other whole number is built by multiplying
            them together.
          </p>
          <p>
            Better still, each number has exactly <em>one</em> recipe of primes:{' '}
            <Tex>{'60 = 2 \\times 2 \\times 3 \\times 5'}</Tex>, however you start splitting it.
            Knowing that recipe tells you its factors, and how it shares factors with other numbers.
          </p>
        </Prose>
      </LabSection>
      <SieveExplorer />
      <TreeExplorer />
      <ShareExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Primes and factorisations">
        <Formula
          tex={'n = p_1^{a_1}\\, p_2^{a_2} \\cdots p_k^{a_k} \\qquad 60 = 2^2 \\times 3 \\times 5'}
          caption="The fundamental theorem of arithmetic: one prime factorisation per number."
        />
        <Prose>
          <ul>
            <li>
              A <strong>prime</strong> has exactly two factors, 1 and itself. 1 is not prime: with
              it, factorisations would stop being unique (
              <Tex>{'6 = 2 \\times 3 = 1 \\times 2 \\times 3'}</Tex>).
            </li>
            <li>
              <strong>Testing</strong> a number <Tex>{'n'}</Tex> only needs primes up to{' '}
              <Tex>{'\\sqrt n'}</Tex>: if <Tex>{'n = ab'}</Tex>, one of them is at most{' '}
              <Tex>{'\\sqrt n'}</Tex>. That is why the sieve up to 100 can stop after 7.
            </li>
            <li>
              <strong>Greatest common divisor:</strong> multiply the primes the two numbers share.{' '}
              <strong>Least common multiple:</strong> multiply every prime either one needs. And{' '}
              <Tex>{'\\gcd(a, b) \\times \\text{lcm}(a, b) = ab'}</Tex>.
            </li>
            <li>
              <strong>Infinitely many primes</strong> (Euclid): multiply any list of primes and add
              1; the result has a prime factor that isn't on the list.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="Odd isn't the same as prime">
          <p>
            Many odd numbers aren't prime: 9, 15, 21, 25, 27… And one even number is prime: 2. Check
            divisibility by 3, 5, 7… before calling an odd number prime.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where primes matter">
        <RealWorld
          items={[
            {
              title: 'Internet security',
              body: 'RSA keys are products of two huge primes; finding the primes back is what attackers can’t do.',
            },
            {
              title: 'Gears and cycles',
              body: 'Gears with coprime tooth counts spread wear evenly; periodical cicadas emerge every 13 or 17 years.',
            },
            {
              title: 'Fractions',
              body: 'Simplifying fractions and finding common denominators are gcd and lcm in disguise.',
            },
            {
              title: 'Scheduling',
              body: 'Two buses every 12 and 18 minutes leave together again after lcm(12, 18) = 36 minutes.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A prime has exactly two factors: 1 and itself.',
            'Every whole number above 1 has exactly one prime factorisation.',
            'To test $n$, check primes up to $\\sqrt{n}$.',
            'gcd uses the shared primes; lcm uses all of them.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function SieveExplorer() {
  const [stage, setStage] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const used = SIEVE_PRIMES.slice(0, stage)
  const crossed = (n: number) => used.some((p) => n !== p && n % p === 0)
  const current = SIEVE_PRIMES[stage - 1]
  const left = NUMBERS.filter((n) => !crossed(n)).length
  return (
    <LabSection id="explore" eyebrow="Explore" title="The sieve of Eratosthenes">
      <Prose>
        <p>
          Cross out the multiples of 2, then of 3, then 5, then 7. Whatever survives up to 100 is
          prime. Tap any number to see how it factorises.
        </p>
      </Prose>
      <PredictReveal
        question="How many prime numbers are there below 100?"
        options={['10', '25', '33', '50']}
        answer={1}
        explanation="25 of them, from 2 up to 97. They thin out as numbers grow, but never stop."
      />
      <Figure>
        <div className="grid grid-cols-10 gap-1 px-3 pt-3 sm:px-4">
          {NUMBERS.map((n) => {
            const gone = crossed(n)
            const now = current !== undefined && n !== current && n % current === 0
            return (
              <button
                key={n}
                type="button"
                onClick={() => setPicked(n)}
                className={cn(
                  'rounded py-1 text-center text-xs tabular-nums transition-colors',
                  gone ? 'text-ink-3 line-through' : 'font-semibold',
                  picked === n && 'ring-2 ring-ink-2',
                )}
                style={{
                  boxShadow: now
                    ? `inset 0 -3px 0 ${CURRENT}`
                    : !gone && stage === SIEVE_PRIMES.length
                      ? `inset 0 -3px 0 ${PRIME}`
                      : undefined,
                }}
                aria-label={`${n}${gone ? ', crossed out' : ''}`}
              >
                {n}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 px-3 pt-3 sm:px-4">
          <Button
            size="sm"
            variant="primary"
            icon={<StepForward className="size-4" />}
            onClick={() => setStage(stage + 1)}
            disabled={stage >= SIEVE_PRIMES.length}
          >
            {stage < SIEVE_PRIMES.length
              ? `Cross out multiples of ${SIEVE_PRIMES[stage]}`
              : 'Done: only primes left'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="size-4" />}
            onClick={() => setStage(0)}
            disabled={stage === 0}
          >
            Reset
          </Button>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'numbers left', value: left },
              {
                label: picked == null ? 'tap a number' : String(picked),
                value:
                  picked == null ? (
                    '—'
                  ) : (
                    <Tex>
                      {isPrime(picked) ? `${picked} \\text{ is prime}` : `= ${factorTex(picked)}`}
                    </Tex>
                  ),
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-sieve-two" when={stage >= 1}>
          Cross out the multiples of 2. Roughly what fraction of the numbers disappears?
        </TryThis>
        <TryThis id="t-sieve-done" when={stage >= SIEVE_PRIMES.length}>
          Finish the sieve. Why is it safe to stop after 7?
        </TryThis>
        <TryThis id="t-pick-four" when={picked != null && primeFactors(picked).length >= 4}>
          Tap a number made of four or more primes multiplied together.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function TreeExplorer() {
  const [n, setN] = useState(60)
  const steps = treeSteps(n)
  const prime = isPrime(n)
  return (
    <LabSection id="tree" eyebrow="Explore" title="Split it until it won't split">
      <Prose>
        <p>
          A factor tree peels off one prime at a time until only a prime is left. Whatever order you
          peel them in, you end with the same collection of primes.
        </p>
      </Prose>
      <Figure>
        <div className="space-y-1 px-3 pt-4 text-center sm:px-4">
          {prime ? (
            <p>
              <Tex>{`${n}`}</Tex> is prime: it doesn't split.
            </p>
          ) : (
            steps.map(([p, rest], i) => (
              <div key={i} className="overflow-x-auto">
                <Tex>{`${i === 0 ? n : steps[i - 1][1]} = ${p} \\times ${rest}`}</Tex>
              </div>
            ))
          )}
          <div className="overflow-x-auto pt-2 text-lg">
            <Tex>{`${n} = ${factorTex(n)}`}</Tex>
          </div>
        </div>
        <div className="border-t border-line mt-3 px-3 pt-3 sm:px-4">
          <Slider
            label="Number"
            value={n}
            min={2}
            max={200}
            step={1}
            onChange={setN}
            color={PRIME}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'prime factors (with repeats)', value: primeFactors(n).length },
              { label: 'number of divisors', value: divisorCount(n) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-power-of-two" when={n >= 8 && primeFactors(n).every((p) => p === 2)}>
          Find a number of 8 or more whose tree is all 2s.
        </TryThis>
        <TryThis id="t-big-prime" when={prime && n > 100}>
          Find a prime bigger than 100.
        </TryThis>
        <TryThis id="t-many-divisors" when={divisorCount(n) >= 16}>
          Find a number with at least 16 divisors. What do their factorisations have in common?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

/** For each factor, whether it is one of the shared ones (each shared copy used once). */
function sharedFlags(factors: readonly number[], shared: readonly number[]): boolean[] {
  const left = [...shared]
  return factors.map((p) => {
    const j = left.indexOf(p)
    if (j < 0) return false
    left.splice(j, 1)
    return true
  })
}

function FactorChips({
  factors,
  shared,
}: {
  factors: readonly number[]
  shared: readonly number[]
}) {
  const flags = sharedFlags(factors, shared)
  return (
    <div className="flex flex-wrap gap-1.5">
      {factors.map((p, i) => (
        <span
          key={i}
          className="inline-flex min-w-8 items-center justify-center rounded-md border-2 px-1.5 py-0.5 text-sm font-semibold tabular-nums"
          style={{ borderColor: flags[i] ? SHARED : 'var(--line)' }}
        >
          {p}
        </span>
      ))}
    </div>
  )
}

function ShareExplorer() {
  const [a, setA] = useState(24)
  const [b, setB] = useState(36)
  const fa = primeFactors(a)
  const fb = primeFactors(b)
  const shared = common(fa, fb)
  const g = product(shared)
  const l = lcm(a, b)
  return (
    <LabSection id="share" eyebrow="Explore" title="Shared primes: gcd and lcm">
      <Prose>
        <p>
          Line up the primes of two numbers. The ones they share (green) multiply to the{' '}
          <strong>greatest common divisor</strong>. Every prime either number needs, counted once,
          multiplies to the <strong>least common multiple</strong>.
        </p>
      </Prose>
      <Figure>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 px-3 pt-4 sm:grid-cols-2 sm:px-4">
          <div className="space-y-1">
            <p className="text-sm text-ink-2">{a} =</p>
            <FactorChips factors={fa} shared={shared} />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-ink-2">{b} =</p>
            <FactorChips factors={fb} shared={shared} />
          </div>
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line mt-4 px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider label="First number" value={a} min={2} max={60} step={1} onChange={setA} />
          <Slider label="Second number" value={b} min={2} max={60} step={1} onChange={setB} />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'shared primes',
                value: shared.length ? shared.join(' × ') : 'none',
                color: SHARED,
              },
              { label: 'gcd', value: g },
              { label: 'lcm', value: l },
              { label: 'gcd × lcm', value: `${g * l} = ${a} × ${b}` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-coprime" when={g === 1}>
          Pick two numbers that share no primes at all. What is their lcm?
        </TryThis>
        <TryThis id="t-divides" when={a !== b && (b % a === 0 || a % b === 0)}>
          Pick two different numbers where one divides the other. What are the gcd and lcm?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [e2, setE2] = useState(0)
  const [e3, setE3] = useState(0)
  const [e5, setE5] = useState(0)
  const value = 2 ** e2 * 3 ** e3 * 5 ** e5
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <McqChallenge
          id="c-ninety-one"
          index={1}
          prompt="Is 91 prime?"
          options={[
            { text: 'No: 91 = 7 × 13', correct: true },
            { text: 'Yes: it is odd and not divisible by 3 or 5', why: 'Try 7.' },
            { text: 'No: 91 = 3 × 31', why: '3 × 31 = 93.' },
          ]}
          explanation="$7 \times 13 = 91$. Check primes up to $\sqrt{91} \approx 9.5$: 2, 3, 5, 7."
        />
        <NumericChallenge
          id="c-biggest-prime-84"
          index={2}
          prompt="What is the largest prime factor of 84?"
          answer={7}
          explanation="$84 = 2^2 \times 3 \times 7$."
        />
        <NumericChallenge
          id="c-gcd"
          index={3}
          prompt="What is the greatest common divisor of 24 and 36?"
          answer={12}
          explanation="$24 = 2^3 \times 3$ and $36 = 2^2 \times 3^2$ share $2^2 \times 3 = 12$."
        />
        <NumericChallenge
          id="c-lcm"
          index={4}
          prompt="What is the least common multiple of 4 and 6?"
          answer={12}
          explanation="$4 = 2^2$, $6 = 2 \times 3$; the lcm needs $2^2 \times 3 = 12$."
        />
        <NumericChallenge
          id="c-primes-below-30"
          index={5}
          prompt="How many prime numbers are less than 30?"
          answer={10}
          explanation="2, 3, 5, 7, 11, 13, 17, 19, 23, 29: ten of them."
        />
        <InteractiveChallenge
          id="c-build-72"
          index={6}
          prompt="Choose the powers of 2, 3 and 5 to build the number 72."
          solved={value === 72}
          hint="Divide 72 by 2 as many times as you can, then by 3."
          explanation="$72 = 8 \times 9 = 2^3 \times 3^2$."
          onReset={() => {
            setE2(0)
            setE3(0)
            setE5(0)
          }}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
              <Slider label="Power of 2" value={e2} min={0} max={6} step={1} onChange={setE2} />
              <Slider label="Power of 3" value={e3} min={0} max={4} step={1} onChange={setE3} />
              <Slider label="Power of 5" value={e5} min={0} max={3} step={1} onChange={setE5} />
            </div>
            <p className="text-sm">
              <Tex>{`2^{${e2}} \\times 3^{${e3}} \\times 5^{${e5}} = ${value}`}</Tex>
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

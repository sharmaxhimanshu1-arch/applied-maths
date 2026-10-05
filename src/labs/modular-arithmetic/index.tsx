import { useState } from 'react'
import type { Vec2 } from '@/math/linalg'
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
import { cn } from '@/ui/cn'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { Circle, Label, Plot, Point, Polyline } from '@/viz'
import { gcd, isPrime, modInverse, modPow } from '../_shared/numberTheory'

const START = 'var(--c-blue)'
const PATH = 'var(--c-violet)'
const ONE = 'var(--c-green)'

const mod = (a: number, n: number) => ((a % n) + n) % n

/** Position of hour k on a clock with n hours, 0 at the top, going clockwise. */
const clockAt = (k: number, n: number, r = 1): Vec2 => {
  const a = Math.PI / 2 - (2 * Math.PI * k) / n
  return [r * Math.cos(a), r * Math.sin(a)]
}

/** The walk from `start` forward `steps` hours, spiralling inwards so laps don't overlap. */
function walk(start: number, steps: number, n: number): Vec2[] {
  const samples = Math.max(2, steps * 12)
  const span = Math.max(steps, n)
  return Array.from({ length: samples + 1 }, (_, i) => {
    const s = (steps * i) / samples
    return clockAt(start + s, n, 0.82 - (0.4 * s) / span)
  })
}

function Clock({ n, start, steps }: { n: number; start: number; steps: number }) {
  const end = mod(start + steps, n)
  const path = walk(start, steps, n)
  return (
    <div className="mx-auto w-full max-w-xs">
      <Plot
        view={{ xMin: -1.35, xMax: 1.35, yMin: -1.35, yMax: 1.35 }}
        aspect="equal"
        grid={false}
        axes={false}
        ariaLabel={`A ${n}-hour clock: start at ${start}, move ${steps} hours forward, land on ${end}`}
      >
        <Circle center={[0, 0]} r={1} stroke="var(--line)" strokeWidth={1.5} />
        {steps > 0 && <Polyline points={path} color={PATH} width={2.5} />}
        {steps > 0 && <Point at={path[path.length - 1]} r={4} color={PATH} />}
        {Array.from({ length: n }, (_, k) => (
          <Point
            key={k}
            at={clockAt(k, n)}
            r={k === start || k === end ? 6 : 3}
            color={k === end ? ONE : k === start ? START : 'var(--ink-3)'}
            hollow={k !== start && k !== end}
          />
        ))}
        {Array.from({ length: n }, (_, k) => (
          <Label key={`l-${k}`} at={clockAt(k, n, 1.18)} anchor="center" className="text-xs">
            {k}
          </Label>
        ))}
      </Plot>
    </div>
  )
}

/** Row a of the multiplication table mod n. */
const tableRow = (a: number, n: number) => Array.from({ length: n }, (_, b) => (a * b) % n)

/** The repeating cycle of last digits of b¹, b², b³, … (they repeat from the first power). */
function lastDigitCycle(b: number): number[] {
  const first = b % 10
  const cycle = [first]
  for (let k = 2; k <= 10; k++) {
    const d = modPow(b, k, 10)
    if (d === first) break
    cycle.push(d)
  }
  return cycle
}

export default function ModularArithmeticLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Arithmetic that wraps around">
        <Prose>
          <p>
            It's 9 o'clock. What time is it 5 hours later? Not 14: the clock wraps round, so it's 2.
            You already do this kind of maths with clocks, weekdays and months. It has a name:{' '}
            <strong>modular arithmetic</strong>.
          </p>
          <p>
            Working <strong>mod n</strong>, you only keep the remainder after dividing by{' '}
            <Tex>{'n'}</Tex>. Numbers that leave the same remainder count as equal, so there are
            just <Tex>{'n'}</Tex> of them: <Tex>{'0, 1, \\ldots, n - 1'}</Tex>. Adding and
            multiplying still work, and the answers cycle in patterns that power check digits,
            calendars and cryptography.
          </p>
        </Prose>
      </LabSection>
      <ClockExplorer />
      <TableExplorer />
      <LastDigitExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Congruence and remainders">
        <Formula
          tex={'a \\equiv b \\pmod n \\iff n \\text{ divides } a - b'}
          caption="Two numbers are congruent mod n when they leave the same remainder."
        />
        <Formula
          tex={
            '(a + b) \\bmod n = \\big((a \\bmod n) + (b \\bmod n)\\big) \\bmod n \\qquad (a b) \\bmod n = \\big((a \\bmod n)(b \\bmod n)\\big) \\bmod n'
          }
          caption="You can reduce first and then add or multiply: the remainder comes out the same."
        />
        <Prose>
          <ul>
            <li>
              <strong>Remainder:</strong> <Tex>{'a = q n + r'}</Tex> with{' '}
              <Tex>{'0 \\le r < n'}</Tex>, and <Tex>{'a \\bmod n = r'}</Tex>. For example{' '}
              <Tex>{'17 = 3 \\times 5 + 2'}</Tex>, so <Tex>{'17 \\bmod 5 = 2'}</Tex>.
            </li>
            <li>
              <strong>Negatives</strong> wrap the other way: <Tex>{'-1 \\equiv 11 \\pmod{12}'}</Tex>
              , one hour before 12 o'clock is 11.
            </li>
            <li>
              <strong>Inverses:</strong> <Tex>{'a'}</Tex> has a multiplicative inverse mod{' '}
              <Tex>{'n'}</Tex> (a <Tex>{'b'}</Tex> with <Tex>{'ab \\equiv 1'}</Tex>) exactly when{' '}
              <Tex>{'\\gcd(a, n) = 1'}</Tex>. When <Tex>{'n'}</Tex> is prime, every nonzero number
              has one.
            </li>
            <li>
              <strong>Big powers</strong> reduce as you go:{' '}
              <Tex>{'3^{20} = (3^4)^5 = 81^5 \\equiv 1^5 = 1 \\pmod{10}'}</Tex>.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="You can't always divide">
          <p>
            <Tex>{'2 \\times 3 \\equiv 2 \\times 8 \\pmod{10}'}</Tex> (both are 6 mod 10), but{' '}
            <Tex>{'3 \\not\\equiv 8'}</Tex>. Cancelling the 2 fails because 2 shares a factor with
            10. Dividing by <Tex>{'a'}</Tex> mod <Tex>{'n'}</Tex> only works when{' '}
            <Tex>{'\\gcd(a, n) = 1'}</Tex>, and then it means multiplying by the inverse.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where remainders run things">
        <RealWorld
          items={[
            {
              title: 'Clocks and calendars',
              body: 'Hours wrap mod 12 or 24, weekdays mod 7. 100 days from Monday is 100 mod 7 = 2 days on: Wednesday.',
            },
            {
              title: 'Check digits',
              body: 'The last digit of an ISBN or bank card number makes a weighted sum divisible by 11 or 10, so a single mistyped digit is caught.',
            },
            {
              title: 'Hash tables',
              body: 'Programs store data in n buckets by taking a key’s hash mod n, so lookups jump straight to the right bucket.',
            },
            {
              title: 'Cryptography',
              body: 'RSA and Diffie–Hellman raise numbers to huge powers mod n: easy to compute, very hard to undo without a secret.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            '$a \\bmod n$ is the remainder after dividing by $n$; mod $n$ there are only $n$ values.',
            'You can reduce before or after adding and multiplying: the remainder is the same.',
            '$a$ has an inverse mod $n$ exactly when $\\gcd(a, n) = 1$.',
            'Powers mod $n$ repeat in cycles, which makes huge powers easy.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function ClockExplorer() {
  const [n, setN] = useState(12)
  const [rawStart, setStart] = useState(9)
  const [steps, setSteps] = useState(2)
  const start = Math.min(rawStart, n - 1)
  const sum = start + steps
  const end = sum % n
  const laps = Math.floor(sum / n)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Adding on a clock">
      <Prose>
        <p>
          Pick a clock size, a starting hour (blue) and how many hours to move forward. The violet
          path walks round, spiralling inwards each lap, and lands on the green hour: the sum{' '}
          <em>mod n</em>.
        </p>
      </Prose>
      <PredictReveal
        question="On a 12-hour clock, what is $7 \times 5$?"
        options={['35', '11', '1', '12']}
        answer={1}
        explanation="$35 = 2 \times 12 + 11$, so $7 \times 5 \equiv 11 \pmod{12}$. Multiplying is repeated adding, and the clock wraps after every 12."
      />
      <Figure>
        <div className="px-3 pt-4 sm:px-4">
          <Clock n={n} start={start} steps={steps} />
        </div>
        <div className="mt-3 grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-3 sm:px-4">
          <Slider label="Clock size n" value={n} min={2} max={24} step={1} onChange={setN} />
          <Slider
            label="Start a"
            value={start}
            min={0}
            max={n - 1}
            step={1}
            onChange={setStart}
            color={START}
          />
          <Slider
            label="Hours forward b"
            value={steps}
            min={0}
            max={30}
            step={1}
            onChange={setSteps}
            color={PATH}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'a + b', value: `${sum}` },
              { label: 'as laps', value: `${sum} = ${laps} × ${n} + ${end}` },
              { label: `(a + b) mod ${n}`, value: `${end}`, color: ONE },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-wraps-round" when={sum >= n}>
          Move far enough that the walk passes 0. How do you get the answer from{' '}
          <Tex>{'a + b'}</Tex>?
        </TryThis>
        <TryThis id="t-seven-days" when={n === 7}>
          Make it a 7-hour clock: a week, with 0 = Sunday. What day is 10 days after Friday (5)?
        </TryThis>
        <TryThis id="t-back-to-zero" when={steps > 0 && end === 0}>
          Land exactly on 0. What do <Tex>{'a + b'}</Tex> and <Tex>{'n'}</Tex> have in common?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function TableExplorer() {
  const [n, setN] = useState(10)
  const [rawRow, setRow] = useState(3)
  const row = Math.min(rawRow, n - 1)
  const values = tableRow(row, n)
  const inverse = modInverse(row, n)
  const g = gcd(row, n)
  return (
    <LabSection id="table" eyebrow="Explore" title="The times table mod n">
      <Prose>
        <p>
          Here is the whole multiplication table mod <Tex>{'n'}</Tex>. Green cells are 1s. Pick a
          row: if it contains a 1, that column is the row's <strong>inverse</strong>, the number
          that undoes multiplying by it.
        </p>
      </Prose>
      <Figure>
        <div className="overflow-x-auto px-3 pt-4 sm:px-4">
          <table className="mx-auto border-separate border-spacing-0.5 text-center text-xs tabular-nums sm:text-sm">
            <caption className="sr-only">Multiplication table mod {n}</caption>
            <thead>
              <tr>
                <th scope="col" className="px-1 text-ink-3">
                  ×
                </th>
                {Array.from({ length: n }, (_, b) => (
                  <th key={b} scope="col" className="min-w-6 px-1 text-ink-2 sm:min-w-7">
                    {b}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: n }, (_, a) => (
                <tr key={a}>
                  <th scope="row" className="p-0">
                    <button
                      type="button"
                      aria-pressed={a === row}
                      aria-label={`Row ${a}`}
                      onClick={() => setRow(a)}
                      className={cn(
                        'min-h-6 w-full rounded-md px-1 font-semibold sm:min-h-7',
                        a === row
                          ? 'bg-[color-mix(in_oklab,var(--c-violet)_24%,var(--surface))] text-ink'
                          : 'text-ink-2 hover:bg-surface-2',
                      )}
                    >
                      {a}
                    </button>
                  </th>
                  {tableRow(a, n).map((v, b) => (
                    <td
                      key={b}
                      className={cn(
                        'min-h-6 rounded-md px-1 sm:min-h-7',
                        v === 1
                          ? 'bg-[color-mix(in_oklab,var(--c-green)_28%,var(--surface))] font-semibold text-ink'
                          : a === row
                            ? 'bg-[color-mix(in_oklab,var(--c-violet)_14%,var(--surface))] text-ink'
                            : 'text-ink-2',
                      )}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider label="Modulus n" value={n} min={2} max={12} step={1} onChange={setN} />
          <Slider
            label="Row a"
            value={row}
            min={0}
            max={n - 1}
            step={1}
            onChange={setRow}
            color={PATH}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: `row ${row}`, value: values.join(' ') },
              { label: `gcd(${row}, ${n})`, value: `${g}` },
              {
                label: 'inverse',
                value:
                  inverse == null
                    ? 'none: no 1 in this row'
                    : `${inverse}, since ${row} × ${inverse} = ${row * inverse} ≡ 1`,
                color: ONE,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-prime-rows" when={isPrime(n) && n >= 5}>
          Choose a prime modulus of 5 or more. Which nonzero rows contain a 1?
        </TryThis>
        <TryThis id="t-no-inverse" when={row > 0 && g > 1}>
          Find a nonzero row with no 1 in it. What does it share with <Tex>{'n'}</Tex>?
        </TryThis>
        <TryThis id="t-self-inverse" when={row !== 1 && row !== n - 1 && (row * row) % n === 1}>
          Find a row other than 1 and <Tex>{'n - 1'}</Tex> that is its own inverse. (Try{' '}
          <Tex>{'n = 8'}</Tex>.)
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function LastDigitExplorer() {
  const [base, setBase] = useState(7)
  const [k, setK] = useState(6)
  const cycle = lastDigitCycle(base)
  const p = cycle.length
  const digit = cycle[(k - 1) % p]
  return (
    <LabSection id="last-digits" eyebrow="Explore" title="Last digits go in circles">
      <Prose>
        <p>
          The last digit of a number is the number mod 10. Powers mod 10 repeat, so the last digit
          of even a giant power like <Tex>{'7^{99}'}</Tex> takes one division: find where{' '}
          <Tex>{'k'}</Tex> falls in the cycle.
        </p>
      </Prose>
      <Figure>
        <ol
          className="flex flex-wrap justify-center gap-2 px-3 pt-4 sm:px-4"
          aria-label={`Last digits of the powers of ${base}`}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <li
              key={i}
              className={cn(
                'flex w-14 flex-col items-center rounded-xl border px-2 py-1.5',
                i % p === (k - 1) % p
                  ? 'border-[var(--c-violet)] bg-[color-mix(in_oklab,var(--c-violet)_14%,var(--surface))]'
                  : 'border-line',
              )}
            >
              <span className="text-xs text-ink-2">
                <Tex>{`${base}^{${i + 1}}`}</Tex>
              </span>
              <span className="text-lg font-semibold tabular-nums">{modPow(base, i + 1, 10)}</span>
            </li>
          ))}
        </ol>
        <div className="mt-3 grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider label="Base b" value={base} min={2} max={9} step={1} onChange={setBase} />
          <Slider
            label="Power k"
            value={k}
            min={1}
            max={99}
            step={1}
            onChange={setK}
            color={PATH}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'cycle', value: `${cycle.join(', ')} (length ${p})` },
              {
                label: 'position',
                value: `${k} mod ${p} = ${k % p} → step ${((k - 1) % p) + 1} of ${p}`,
              },
              { label: 'last digit', value: `${digit}`, color: PATH },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-fixed-digit" when={p === 1}>
          Find a base whose powers all end in the same digit.
        </TryThis>
        <TryThis id="t-huge-power" when={k >= 50}>
          Push the power past 50. How did you find the last digit without the whole number?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [steps, setSteps] = useState(0)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-seventeen-mod-five"
          index={1}
          prompt="What is $17 \bmod 5$?"
          answer={2}
          explanation="$17 = 3 \times 5 + 2$, so the remainder is 2."
        />
        <McqChallenge
          id="c-hundred-days"
          index={2}
          prompt="Today is Monday. What day of the week is it 100 days from now?"
          options={[
            { text: 'Wednesday', correct: true },
            { text: 'Monday', why: '100 isn’t a multiple of 7: $100 = 14 \\times 7 + 2$.' },
            { text: 'Tuesday', why: 'Check the remainder: $100 \\bmod 7 = 2$, not 1.' },
            { text: 'Thursday', why: 'Two days after Monday, not three.' },
          ]}
          explanation="$100 \bmod 7 = 2$, and two days after Monday is Wednesday."
        />
        <NumericChallenge
          id="c-three-to-twenty"
          index={3}
          prompt="What is the last digit of $3^{20}$?"
          answer={1}
          explanation="The last digits of $3^k$ cycle 3, 9, 7, 1 (length 4). $20$ is a multiple of 4, so it ends in 1."
        />
        <NumericChallenge
          id="c-clock-sum"
          index={4}
          prompt="It's 8 o'clock. What time does a 12-hour clock show 9 hours later?"
          answer={5}
          explanation="$(8 + 9) \bmod 12 = 17 \bmod 12 = 5$."
        />
        <NumericChallenge
          id="c-inverse-three"
          index={5}
          prompt="Find the inverse of 3 mod 7: the number $x$ from 1 to 6 with $3x \equiv 1 \pmod 7$."
          answer={5}
          explanation="$3 \times 5 = 15 = 2 \times 7 + 1$, so $3 \times 5 \equiv 1 \pmod 7$."
        />
        <InteractiveChallenge
          id="c-set-clock"
          index={6}
          prompt="The clock shows 9. Choose how many hours to move forward so it lands on 2."
          solved={steps > 0 && (9 + steps) % 12 === 2}
          hint="Count on from 9 past 12. Or solve $9 + b \equiv 2 \pmod{12}$."
          explanation="$9 + 5 = 14 \equiv 2 \pmod{12}$. Moving 17 hours (a lap more) works too."
          onReset={() => setSteps(0)}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <Clock n={12} start={9} steps={steps} />
            <Slider
              label="Hours forward"
              value={steps}
              min={0}
              max={24}
              step={1}
              onChange={setSteps}
              color={PATH}
            />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

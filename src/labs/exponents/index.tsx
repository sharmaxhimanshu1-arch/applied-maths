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
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'

const BAR = 'var(--c-blue)'
const CHIP_A = 'var(--c-blue)'
const CHIP_B = 'var(--c-orange)'
const CANCEL = 'var(--c-red)'

/** b × b × … × b, written out. */
const expanded = (b: number, n: number) =>
  n === 0 ? '1' : Array.from({ length: n }, () => String(b)).join(' \\times ')

export default function ExponentsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Repeated multiplication">
        <Prose>
          <p>
            Fold a sheet of paper in half and it is 2 layers thick. Fold again: 4. Again: 8. After
            just 10 folds it would be 1024 layers. Writing{' '}
            <Tex>{'2 \\times 2 \\times 2 \\times \\cdots'}</Tex> gets tiring, so we write{' '}
            <Tex>{'2^{10}'}</Tex>: the <strong>base</strong> 2 multiplied by itself, the{' '}
            <strong>exponent</strong> 10 times.
          </p>
          <p>
            Every rule for exponents comes from counting factors. Multiply two powers and the
            factors pile up; divide and they cancel. Following the pattern backwards even explains
            what <Tex>{'2^0'}</Tex> and <Tex>{'2^{-3}'}</Tex> have to mean.
          </p>
        </Prose>
      </LabSection>
      <GrowthExplorer />
      <LawsExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The laws of exponents">
        <Formula
          tex={
            'a^m \\cdot a^n = a^{m+n} \\qquad \\frac{a^m}{a^n} = a^{m-n} \\qquad (a^m)^n = a^{mn}'
          }
          caption="Multiplying adds the counts; dividing cancels; a power of a power multiplies them."
        />
        <Formula
          tex={'a^0 = 1 \\qquad a^{-n} = \\frac{1}{a^n}'}
          caption="Forced by the division rule: a^n / a^n is both 1 and a^0."
        />
        <Prose>
          <ul>
            <li>
              <strong>Zero exponent:</strong> each step down the list{' '}
              <Tex>{'2^3 = 8, 2^2 = 4, 2^1 = 2'}</Tex> divides by 2, so the next one is{' '}
              <Tex>{'2^0 = 1'}</Tex>, then <Tex>{'2^{-1} = \\tfrac12'}</Tex>.
            </li>
            <li>
              <strong>Powers of 10</strong> count zeros: <Tex>{'10^6'}</Tex> is a million and{' '}
              <Tex>{'10^{-3} = 0.001'}</Tex>. Scientific notation writes{' '}
              <Tex>{'300\\,000\\,000 = 3 \\times 10^8'}</Tex>.
            </li>
            <li>
              <strong>Order of operations:</strong> exponents bind tighter than the minus sign:{' '}
              <Tex>{'-3^2 = -9'}</Tex> but <Tex>{'(-3)^2 = 9'}</Tex>.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="An exponent isn't a multiplier">
          <p>
            <Tex>{'2^5'}</Tex> is not <Tex>{'2 \\times 5 = 10'}</Tex>; it is five 2s multiplied: 32.
            And <Tex>{'a^m \\cdot a^n'}</Tex> adds the exponents, it doesn't multiply them:{' '}
            <Tex>{'2^3 \\cdot 2^4 = 2^7'}</Tex>, not <Tex>{'2^{12}'}</Tex>.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where powers appear">
        <RealWorld
          items={[
            {
              title: 'Computers',
              body: 'Memory comes in powers of 2: 2¹⁰ = 1024 bytes in a kibibyte, 2³² addresses in a 32-bit system.',
            },
            {
              title: 'Science',
              body: 'The Sun is about 1.5 × 10¹¹ m away; a hydrogen atom is about 10⁻¹⁰ m across.',
            },
            {
              title: 'Growth',
              body: 'Bacteria doubling every hour multiply by 2²⁴ ≈ 17 million in a day.',
            },
            {
              title: 'Sound and earthquakes',
              body: 'Decibels and the Richter scale go up by one for every factor of 10 in power.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            '$a^n$ means $n$ copies of $a$ multiplied together.',
            'Multiplying powers adds exponents; dividing subtracts them.',
            '$a^0 = 1$ and $a^{-n} = 1/a^n$ keep the pattern going.',
            'Powers grow astonishingly fast: $2^{10}$ is already over a thousand.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function GrowthExplorer() {
  const [b, setB] = useState(2)
  const [n, setN] = useState(5)
  const [log, setLog] = useState(false)
  const values = Array.from({ length: n + 1 }, (_, i) => b ** i)
  const top = b ** n
  const height = (v: number) => (log ? (n ? Math.log(v) / Math.log(top) : 0) : v / top)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Watch it grow">
      <Prose>
        <p>
          Each bar is the next power: multiply the last bar by the base. Raise the exponent and the
          last bar dwarfs all the others. Switch to a log scale, where each step up is “times the
          base”, and the same powers line up in a straight staircase.
        </p>
      </Prose>
      <PredictReveal
        question="If you could fold a sheet of paper in half 10 times, how many layers thick would it be?"
        options={['20', '100', 'About 1000', 'About a million']}
        answer={2}
        explanation="Each fold doubles the layers: $2^{10} = 1024$. Ten more folds would make over a million."
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 px-3 pt-3 sm:px-4">
          <Switch checked={log} onChange={setLog} label="Log scale" />
        </div>
        <div
          className="flex h-56 items-end gap-1 px-3 pt-3 sm:px-4"
          role="img"
          aria-label={`Powers of ${b} from ${b} to the 0 up to ${b} to the ${n}`}
        >
          {values.map((v, i) => (
            <div
              key={i}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
            >
              <div
                className="w-full rounded-t"
                style={{ height: `${Math.max(1, height(v) * 85)}%`, background: BAR, opacity: 0.8 }}
              />
              <span className="text-[10px] text-ink-2 tabular-nums">
                {b}
                <sup>{i}</sup>
              </span>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto px-3 pt-3 text-center sm:px-4">
          <Tex>{`${b}^{${n}} = ${expanded(b, n)} = ${top.toLocaleString('en')}`}</Tex>
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line mt-3 px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider label="Base" value={b} min={2} max={5} step={1} onChange={setB} color={BAR} />
          <Slider label="Exponent" value={n} min={0} max={12} step={1} onChange={setN} />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'value', value: top.toLocaleString('en') },
              { label: 'digits', value: String(top).length },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-power-zero" when={n === 0}>
          Set the exponent to 0. What is any base to the power 0?
        </TryThis>
        <TryThis id="t-over-thousand" when={top > 1000 && n <= 5}>
          Get past 1000 in five steps or fewer. Which base does it take?
        </TryThis>
        <TryThis id="t-two-to-ten" when={b === 2 && n === 10}>
          Find <Tex>{'2^{10}'}</Tex>, the paper-folding number.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type Law = 'multiply' | 'divide' | 'power'

function Chip({ color, crossed }: { color: string; crossed?: boolean }) {
  return (
    <span
      className="inline-flex size-8 items-center justify-center rounded-md border-2 text-sm font-semibold"
      style={{
        borderColor: crossed ? CANCEL : color,
        opacity: crossed ? 0.45 : 1,
        textDecoration: crossed ? 'line-through' : undefined,
      }}
    >
      a
    </span>
  )
}

function LawsExplorer() {
  const [law, setLaw] = useState<Law>('multiply')
  const [m, setM] = useState(3)
  const [n, setN] = useState(2)
  const result = law === 'multiply' ? m + n : law === 'divide' ? m - n : m * n
  const lawTex =
    law === 'multiply'
      ? `a^{${m}} \\cdot a^{${n}} = a^{${m} + ${n}} = a^{${result}}`
      : law === 'divide'
        ? `\\frac{a^{${m}}}{a^{${n}}} = a^{${m} - ${n}} = a^{${result}}${result < 0 ? ` = \\frac{1}{a^{${-result}}}` : result === 0 ? ' = 1' : ''}`
        : `(a^{${m}})^{${n}} = a^{${m} \\times ${n}} = a^{${result}}`
  const cancelled = Math.min(m, n)
  return (
    <LabSection id="laws" eyebrow="Explore" title="The laws are just counting">
      <Prose>
        <p>
          Each tile is one factor of <Tex>{'a'}</Tex>. Multiplying puts two piles together. Dividing
          cancels a tile on top against a tile on the bottom. A power of a power repeats the whole
          pile. Count what's left.
        </p>
      </Prose>
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Law"
            value={law}
            onChange={(v) => {
              setLaw(v)
              if (v === 'power') {
                setM(Math.max(1, m))
                setN(Math.max(1, n))
              }
            }}
            options={[
              { value: 'multiply', label: 'Multiply' },
              { value: 'divide', label: 'Divide' },
              { value: 'power', label: 'Power of a power' },
            ]}
          />
        </div>
        <div className="space-y-3 px-3 pt-4 sm:px-4">
          {law === 'multiply' && (
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: m }, (_, i) => (
                <Chip key={`m${i}`} color={CHIP_A} />
              ))}
              <span className="self-center px-1 text-ink-2">·</span>
              {Array.from({ length: n }, (_, i) => (
                <Chip key={`n${i}`} color={CHIP_B} />
              ))}
            </div>
          )}
          {law === 'divide' && (
            <div className="inline-flex flex-col gap-2">
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: m }, (_, i) => (
                  <Chip key={`m${i}`} color={CHIP_A} crossed={i < cancelled} />
                ))}
              </div>
              <div className="h-0.5 w-full bg-ink-3" aria-hidden />
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: n }, (_, i) => (
                  <Chip key={`n${i}`} color={CHIP_B} crossed={i < cancelled} />
                ))}
                {n === 0 && <span className="text-sm text-ink-2">1</span>}
              </div>
            </div>
          )}
          {law === 'power' && (
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: n }, (_, g) => (
                <div key={g} className="flex gap-1 rounded-lg border border-line p-1.5">
                  {Array.from({ length: m }, (_, i) => (
                    <Chip key={i} color={g % 2 ? CHIP_B : CHIP_A} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="overflow-x-auto px-3 pt-4 text-center sm:px-4">
          <Tex display>{lawTex}</Tex>
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label={<Tex>{'m'}</Tex>}
            name="Exponent m"
            value={m}
            min={law === 'power' ? 1 : 0}
            max={5}
            step={1}
            onChange={setM}
            color={CHIP_A}
          />
          <Slider
            label={<Tex>{'n'}</Tex>}
            name="Exponent n"
            value={n}
            min={law === 'power' ? 1 : 0}
            max={5}
            step={1}
            onChange={setN}
            color={CHIP_B}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'factors left', value: result < 0 ? `${-result} on the bottom` : result },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-cancel-all" when={law === 'divide' && m === n && m > 0}>
          Divide a power by itself. What exponent is left, and what must <Tex>{'a^0'}</Tex> be?
        </TryThis>
        <TryThis id="t-more-below" when={law === 'divide' && n > m}>
          Put more tiles on the bottom than the top. What does a negative exponent mean?
        </TryThis>
        <TryThis id="t-six-tiles" when={law === 'power' && m * n === 6 && m > 1 && n > 1}>
          Make a power of a power with six tiles in total. Which two ways are there?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [n, setN] = useState(1)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-two-five"
          index={1}
          prompt="What is $2^5$?"
          answer={32}
          explanation="$2 \times 2 \times 2 \times 2 \times 2 = 32$."
        />
        <NumericChallenge
          id="c-zero-power"
          index={2}
          prompt="What is $7^0$?"
          answer={1}
          explanation="Any nonzero number to the power 0 is 1."
        />
        <NumericChallenge
          id="c-ten-minus-two"
          index={3}
          prompt="What is $10^{-2}$ as a decimal?"
          answer={0.01}
          tolerance={0.00001}
          explanation="$10^{-2} = \tfrac{1}{10^2} = \tfrac{1}{100} = 0.01$."
        />
        <McqChallenge
          id="c-add-exponents"
          index={4}
          prompt="What is $a^3 \cdot a^4$?"
          options={[
            { text: '$a^7$', correct: true },
            { text: '$a^{12}$', why: 'That is $(a^3)^4$; here the factors just pile up.' },
            { text: '$2a^7$', why: 'Multiplying powers does not double anything.' },
            { text: '$a^{34}$', why: 'Exponents add; they are not written side by side.' },
          ]}
          explanation="Three factors of $a$ and four more make seven: $a^7$."
        />
        <NumericChallenge
          id="c-power-power"
          index={5}
          prompt="What is $(2^3)^2$?"
          answer={64}
          explanation="$(2^3)^2 = 2^6 = 64$, or $8^2 = 64$."
        />
        <InteractiveChallenge
          id="c-first-thousand"
          index={6}
          prompt="Find the smallest exponent $n$ for which $2^n$ is at least 1000."
          solved={n === 10}
          hint="$2^9 = 512$."
          explanation="$2^9 = 512$ is too small and $2^{10} = 1024$ is enough, so $n = 10$."
          onReset={() => setN(1)}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <Slider
              label="Exponent n"
              value={n}
              min={1}
              max={14}
              step={1}
              onChange={setN}
              color={BAR}
            />
            <p className="text-sm">
              <Tex>{`2^{${n}} = ${(2 ** n).toLocaleString('en')}`}</Tex>{' '}
              {2 ** n >= 1000 ? '≥ 1000' : '< 1000'}
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

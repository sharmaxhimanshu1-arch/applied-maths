import { useState } from 'react'
import { ArrowUp, Minus, Plus } from 'lucide-react'
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
import { digitChar, divisionLadder, rollovers, toBase, toDigits } from '../_shared/numbers'

const ROLL = 'var(--c-orange)'
const LIGHT = 'var(--c-yellow)'
const REM = 'var(--c-violet)'
const MAX = 255
const BITS = [128, 64, 32, 16, 8, 4, 2, 1]

/** "1×64 + 1×32 + 1" style expansion of n in base b, skipping zero digits. */
function expansion(n: number, b: number): string {
  const digits = toDigits(n, b)
  const terms = digits
    .map((d, i) => ({ d, place: b ** (digits.length - 1 - i) }))
    .filter((t) => t.d > 0)
    .map((t) => (t.place === 1 ? `${t.d}` : `${t.d}×${t.place}`))
  return terms.length ? terms.join(' + ') : '0'
}

function Bulbs({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-8 gap-1 sm:gap-2" role="group" aria-label="Eight light bulbs">
      {BITS.map((bit) => {
        const on = (value & bit) !== 0
        return (
          <button
            key={bit}
            type="button"
            aria-pressed={on}
            aria-label={`Bulb worth ${bit}`}
            onClick={() => onChange(value ^ bit)}
            className="flex min-w-0 flex-col items-center gap-1 rounded-xl border border-line px-0.5 py-2 hover:bg-surface-2"
          >
            <span
              aria-hidden
              className="size-6 rounded-full border-2 sm:size-8"
              style={{
                background: on ? LIGHT : 'var(--surface-2)',
                borderColor: on ? LIGHT : 'var(--line-strong)',
              }}
            />
            <span className="text-sm font-semibold tabular-nums">{on ? 1 : 0}</span>
            <span className="text-[0.65rem] text-ink-2 tabular-nums sm:text-xs">{bit}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function NumberBasesLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Same numbers, different counting">
        <Prose>
          <p>
            We write numbers with ten digits because we have ten fingers. When a place runs out of
            digits it rolls back to 0 and the next place goes up by one: 9 becomes 10, 99 becomes
            100. Nothing forces ten. Count with only 0 and 1 and you get <strong>binary</strong>,
            the language of every computer.
          </p>
          <p>
            In <strong>base b</strong> each place is worth <Tex>{'b'}</Tex> times the place to its
            right. Base 10 places are 1, 10, 100…; base 2 places are 1, 2, 4, 8, 16…. The number is
            the same; only the way of writing it changes.
          </p>
        </Prose>
      </LabSection>
      <OdometerExplorer />
      <BulbExplorer />
      <LadderExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Place value in any base">
        <Formula
          tex={'(d_k \\ldots d_2\\, d_1\\, d_0)_b = d_k b^k + \\cdots + d_2 b^2 + d_1 b + d_0'}
          caption="Each digit, from 0 to b − 1, is multiplied by a power of the base."
        />
        <Prose>
          <ul>
            <li>
              <strong>To base 10:</strong> multiply out the place values.{' '}
              <Tex>{'1011_2 = 8 + 0 + 2 + 1 = 11'}</Tex>.
            </li>
            <li>
              <strong>From base 10:</strong> divide by <Tex>{'b'}</Tex> again and again; the
              remainders, read from the last to the first, are the digits.
            </li>
            <li>
              <strong>Hexadecimal</strong> (base 16) uses 0–9 then A–F for ten to fifteen. One hex
              digit is exactly four bits, so <Tex>{'\\text{FF}_{16} = 1111\\,1111_2 = 255'}</Tex>.
            </li>
            <li>
              <Tex>{'n'}</Tex> digits in base <Tex>{'b'}</Tex> can show <Tex>{'b^n'}</Tex> different
              values: 8 bits give <Tex>{'2^8 = 256'}</Tex>, from 0 to 255.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="“10” only means ten in base ten">
          <p>
            <Tex>{'10_2'}</Tex> is one two and no ones: 2. <Tex>{'10_{16}'}</Tex> is 16. And more
            digits don't always mean bigger across bases: <Tex>{'1000_2 = 8'}</Tex> is smaller than{' '}
            <Tex>{'9_{10}'}</Tex>. Always check the base before comparing.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where other bases live">
        <RealWorld
          items={[
            {
              title: 'Computers',
              body: 'Every file is bits: a pixel, a letter, a note of music. A byte is 8 bits, 0 to 255.',
            },
            {
              title: 'Colour codes',
              body: 'A web colour like #FF8800 is three hex pairs: red 255, green 136, blue 0.',
            },
            {
              title: 'Time',
              body: 'Minutes and seconds count in base 60, a leftover from Babylonian astronomers: 59 seconds roll over to a new minute.',
            },
            {
              title: 'Addresses',
              body: 'Memory addresses and network (MAC, IPv6) addresses are written in hex because it is short and maps cleanly onto bits.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'In base $b$, places are powers of $b$ and digits run from 0 to $b - 1$.',
            'A place that passes $b - 1$ rolls over to 0 and carries 1 to the left.',
            'Convert to base 10 by adding place values; from base 10 by repeated division.',
            'Binary uses bits; one hex digit is four bits; $n$ bits store $2^n$ values.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function OdometerExplorer() {
  const [base, setBase] = useState(10)
  const [value, setValue] = useState(97)
  const [rolled, setRolled] = useState(0)
  const width = toDigits(MAX, base).length
  const digits = toDigits(value, base, width)
  const change = (v: number) => {
    setValue(v)
    setRolled(0)
  }
  return (
    <LabSection id="explore" eyebrow="Explore" title="An odometer in any base">
      <Prose>
        <p>
          Each wheel shows a digit from 0 to <Tex>{'b - 1'}</Tex>. Press +1: when a wheel passes its
          last digit it rolls back to 0 (orange) and nudges the wheel on its left. Change the base
          and watch the same number take a different shape.
        </p>
      </Prose>
      <PredictReveal
        question="In base 2, what comes right after $111$?"
        options={['$112$', '$1000$', '$110$', '$1110$']}
        answer={1}
        explanation="Base 2 has no digit 2. All three wheels roll over, like $999 + 1 = 1000$ in base 10. $111_2 = 7$ and $1000_2 = 8$."
      />
      <Figure>
        <div className="flex flex-wrap justify-center gap-1.5 px-3 pt-4 sm:gap-2 sm:px-4">
          {digits.map((d, i) => {
            const place = width - 1 - i
            const isRolled = place < rolled
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'flex h-12 w-9 items-center justify-center rounded-lg border-2 font-mono text-2xl font-semibold sm:h-14 sm:w-11',
                    !isRolled && 'border-line-strong',
                  )}
                  style={isRolled ? { borderColor: ROLL } : undefined}
                >
                  {digitChar(d)}
                </div>
                <span className="text-xs text-ink-2">
                  <Tex>{`${base}^{${place}}`}</Tex>
                </span>
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 px-3 sm:px-4">
          <Button
            size="sm"
            variant="secondary"
            icon={<Minus className="size-4" />}
            aria-label="Subtract 1"
            onClick={() => change(Math.max(0, value - 1))}
            disabled={value === 0}
          >
            1
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="size-4" />}
            aria-label="Add 1"
            onClick={() => {
              setRolled(rollovers(value, base))
              setValue(value + 1)
            }}
            disabled={value === MAX}
          >
            1
          </Button>
        </div>
        <div className="mt-3 grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label="Base b"
            value={base}
            min={2}
            max={16}
            step={1}
            onChange={(b) => {
              setBase(b)
              setRolled(0)
            }}
          />
          <Slider label="Number" value={value} min={0} max={MAX} step={1} onChange={change} />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: `in base ${base}`, value: toBase(value, base) },
              { label: 'place values', value: `${expansion(value, base)} = ${value}` },
              {
                label: 'last +1',
                value:
                  rolled === 0
                    ? 'no roll-over'
                    : `${rolled} wheel${rolled > 1 ? 's' : ''} rolled over`,
                color: ROLL,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-double-rollover" when={rolled >= 2}>
          Press +1 so that two or more wheels roll over at once.
        </TryThis>
        <TryThis id="t-binary-eight" when={base === 2 && value === 8}>
          Switch to base 2 and count to 8. Why does 8 look so round?
        </TryThis>
        <TryThis id="t-hex-ff" when={base === 16 && value === MAX}>
          In base 16, show the biggest number the slider allows. What letters appear?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function BulbExplorer() {
  const [value, setValue] = useState(5)
  const on = BITS.filter((b) => (value & b) !== 0)
  return (
    <LabSection id="bulbs" eyebrow="Explore" title="Eight light bulbs make a byte">
      <Prose>
        <p>
          A computer stores a number as switches that are on (1) or off (0). Each bulb is worth
          twice the one to its right. Tap bulbs to light them; the number is the sum of the lit
          values.
        </p>
      </Prose>
      <Figure>
        <div className="px-3 pt-4 sm:px-4">
          <Bulbs value={value} onChange={setValue} />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'binary', value: toBase(value, 2, 8) },
              { label: 'lit values', value: on.length ? `${on.join(' + ')} = ${value}` : '0' },
              { label: 'hex', value: toBase(value, 16, 2) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-forty-two" when={value === 42}>
          Light the bulbs to make 42.
        </TryThis>
        <TryThis id="t-all-on" when={value === MAX}>
          Light every bulb. What is the biggest number one byte can hold?
        </TryThis>
        <TryThis id="t-single-bulb" when={on.length === 1 && value >= 64}>
          Make a number of 64 or more with just one bulb lit.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function LadderExplorer() {
  const [n, setN] = useState(45)
  const [base, setBase] = useState(2)
  const steps = divisionLadder(n, base)
  const result = toBase(n, base)
  return (
    <LabSection id="ladder" eyebrow="Explore" title="Converting by repeated division">
      <Prose>
        <p>
          To write a number in base <Tex>{'b'}</Tex>, divide by <Tex>{'b'}</Tex>, write down the
          remainder, and divide the quotient again until you reach 0. The remainders, read from the
          bottom up, are the digits.
        </p>
      </Prose>
      <Figure>
        <div className="flex justify-center gap-3 px-3 pt-4 sm:px-4">
          <table className="border-separate border-spacing-x-2 border-spacing-y-1 text-sm tabular-nums">
            <caption className="sr-only">
              Dividing {n} by {base} repeatedly
            </caption>
            <thead>
              <tr className="text-xs text-ink-2">
                <th scope="col" className="font-medium">
                  number
                </th>
                <th scope="col" className="font-medium">
                  ÷ {base} =
                </th>
                <th scope="col" className="font-medium">
                  remainder
                </th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s) => (
                <tr key={s.n}>
                  <td className="text-right">{s.n}</td>
                  <td className="text-right text-ink-2">{s.q}</td>
                  <td
                    className="rounded-md border-2 px-2 text-center font-mono font-semibold"
                    style={{ borderColor: REM }}
                  >
                    {digitChar(s.r)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-col items-center justify-end pb-1 text-xs text-ink-2">
            <ArrowUp className="size-5" style={{ color: REM }} aria-hidden />
            <span>read up</span>
          </div>
        </div>
        <div className="mt-3 grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider label="Number" value={n} min={1} max={MAX} step={1} onChange={setN} />
          <Slider
            label="Base b"
            value={base}
            min={2}
            max={16}
            step={1}
            onChange={setBase}
            color={REM}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'divisions', value: `${steps.length}` },
              { label: `${n} in base ${base}`, value: result, color: REM },
              { label: 'check', value: `${expansion(n, base)} = ${n}` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-long-ladder" when={steps.length >= 8}>
          Make a ladder with 8 or more steps. Which base and numbers do it?
        </TryThis>
        <TryThis id="t-hex-letter" when={/[A-F]/.test(result)}>
          Choose a base and number so the answer contains a letter.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [value, setValue] = useState(0)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-binary-to-ten"
          index={1}
          prompt="What is $10110_2$ in base 10?"
          answer={22}
          explanation="$16 + 4 + 2 = 22$."
        />
        <NumericChallenge
          id="c-nineteen-binary"
          index={2}
          prompt="Write 19 in binary (type the 0s and 1s)."
          answer={10011}
          explanation="$19 = 16 + 2 + 1$, so it is $10011_2$."
        />
        <NumericChallenge
          id="c-hex-2a"
          index={3}
          prompt="What is $2\text{A}_{16}$ in base 10?"
          answer={42}
          explanation="$2 \times 16 + 10 = 42$."
        />
        <NumericChallenge
          id="c-bits-for-thousand"
          index={4}
          prompt="How many bits do you need to store every whole number from 0 to 1000?"
          answer={10}
          explanation="9 bits reach only $2^9 - 1 = 511$; 10 bits reach $2^{10} - 1 = 1023$."
        />
        <McqChallenge
          id="c-which-biggest"
          index={5}
          prompt="Which of these is the biggest number?"
          options={[
            { text: '$100_{16}$', correct: true },
            { text: '$100_{10}$', why: 'One hundred. In base 16, $100_{16} = 16^2 = 256$.' },
            { text: '$11111111_2$', why: 'That is 255, one less than $100_{16}$.' },
            { text: '$100_2$', why: 'That is just 4.' },
          ]}
          explanation="$100_b = b^2$, so $100_{16} = 256$ beats $11111111_2 = 255$ and $100_{10} = 100$."
        />
        <InteractiveChallenge
          id="c-light-hundred"
          index={6}
          prompt="Light the bulbs to make 100."
          solved={value === 100}
          hint="Start with the biggest bulb that fits: 64. What is left?"
          explanation="$100 = 64 + 32 + 4$, so the byte is $01100100$."
          onReset={() => setValue(0)}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <Bulbs value={value} onChange={setValue} />
            <p className="text-center text-sm text-ink-2">
              Total: <span className="font-semibold text-ink tabular-nums">{value}</span>
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

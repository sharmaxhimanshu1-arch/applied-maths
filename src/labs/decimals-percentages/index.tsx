import { useState } from 'react'
import { formatNumber } from '@/math/core'
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
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { fracTex } from '../_shared/fraction'

const FILL = 'var(--c-blue)'
const UP = 'var(--c-green)'
const DOWN = 'var(--c-orange)'

const money = (x: number) => `£${x.toFixed(2)}`

/** A 10 × 10 grid with the first k squares filled. */
function HundredGrid({ k, label }: { k: number; label: string }) {
  return (
    <div
      className="mx-auto grid w-full max-w-xs grid-cols-10 gap-0.5"
      role="img"
      aria-label={label}
    >
      {Array.from({ length: 100 }, (_, i) => (
        <div
          key={i}
          className="aspect-square rounded-sm border border-line"
          style={i < k ? { background: FILL, opacity: 0.8 } : undefined}
        />
      ))}
    </div>
  )
}

export default function DecimalsPercentagesLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Three ways to write one amount">
        <Prose>
          <p>
            “Three quarters of the class”, “0.75 of the class” and “75% of the class” are the same
            amount. A fraction, a decimal and a percentage are three ways to write a part of a
            whole, each handy in different places: recipes, calculators, shop signs.
          </p>
          <p>
            <strong>Per cent</strong> just means “out of a hundred”. Picture a grid of 100 squares:
            the percentage is how many you shade, and the decimal is that count divided by 100. The
            tricky part is percentage <em>change</em>, where the “hundred” keeps moving.
          </p>
        </Prose>
      </LabSection>
      <GridExplorer />
      <ChangeExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Converting and changing">
        <Formula
          tex={'\\frac{3}{4} = 3 \\div 4 = 0.75 = \\frac{75}{100} = 75\\%'}
          caption="Fraction → decimal: divide. Decimal → percent: multiply by 100."
        />
        <Formula
          tex={
            '\\text{new} = \\text{old} \\times (1 + r) \\qquad \\text{percent change} = \\frac{\\text{new} - \\text{old}}{\\text{old}} \\times 100\\%'
          }
          caption="A rise of 20% multiplies by 1.2; a fall of 20% multiplies by 0.8."
        />
        <Prose>
          <ul>
            <li>
              <strong>Place value:</strong> in 0.375 the 3 is tenths, the 7 hundredths, the 5
              thousandths, so <Tex>{'0.375 = \\tfrac{375}{1000} = \\tfrac38'}</Tex>.
            </li>
            <li>
              <strong>Repeating decimals:</strong> some fractions never stop:{' '}
              <Tex>{'\\tfrac13 = 0.333\\ldots'}</Tex>. Exactly the fractions whose denominator (in
              lowest terms) has only 2s and 5s as factors end.
            </li>
            <li>
              <strong>Percentages of an amount:</strong> 15% of 60 is{' '}
              <Tex>{'0.15 \\times 60 = 9'}</Tex>.
            </li>
            <li>
              <strong>Successive changes multiply:</strong> +20% then −20% is{' '}
              <Tex>{'1.2 \\times 0.8 = 0.96'}</Tex>, an overall fall of 4%.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="Percentage changes don't simply add">
          <p>
            Up 50% then down 50% is not back to the start: 100 becomes 150, then half of 150 is 75.
            The second change is a percentage of a <em>different</em> amount. Multiply the factors
            instead: <Tex>{'1.5 \\times 0.5 = 0.75'}</Tex>.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you meet them">
        <RealWorld
          items={[
            {
              title: 'Shopping',
              body: 'Sales, VAT and tips are percentages: 25% off £48 saves £12.',
            },
            {
              title: 'Money',
              body: 'Interest rates and inflation are percentage changes that compound year after year.',
            },
            {
              title: 'News and data',
              body: 'Polls, test scores and statistics are reported as percentages so groups of different sizes can be compared.',
            },
            {
              title: 'Measurements',
              body: 'Decimals give precision: 1.75 m tall, 0.5 litres, £3.99.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Percent means “out of 100”: 75% = 0.75 = ¾.',
            'Fraction → decimal: divide; decimal → percent: multiply by 100.',
            'A change of r% multiplies by $1 + r/100$.',
            'Successive percentage changes multiply; they don’t add.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function GridExplorer() {
  const [k, setK] = useState(40)
  return (
    <LabSection id="explore" eyebrow="Explore" title="One hundred squares">
      <Prose>
        <p>
          Shade some of the 100 squares. The readouts show the same amount as a fraction (in lowest
          terms), a decimal and a percentage.
        </p>
      </Prose>
      <PredictReveal
        question="A £100 coat goes up 20%, then the new price is cut by 20%. What does it cost now?"
        options={['£100', '£96', '£104', '£80']}
        answer={1}
        explanation="Up 20% gives £120. Then 20% of £120 is £24, so it falls to £96. The second percentage is of a bigger amount."
      />
      <Figure>
        <div className="px-3 pt-4 sm:px-4">
          <HundredGrid k={k} label={`${k} of 100 squares shaded`} />
        </div>
        <div className="border-t border-line mt-4 px-3 pt-3 sm:px-4">
          <Slider
            label="Squares shaded"
            value={k}
            min={0}
            max={100}
            step={1}
            onChange={setK}
            color={FILL}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'fraction', value: <Tex>{fracTex(k, 100)}</Tex>, color: FILL },
              { label: 'decimal', value: formatNumber(k / 100, 2) },
              { label: 'percent', value: `${k}%` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-grid-quarter" when={k === 25}>
          Shade one quarter of the grid.
        </TryThis>
        <TryThis id="t-three-fifths" when={k === 60}>
          Shade <Tex>{'\\tfrac35'}</Tex>. What percentage is that?
        </TryThis>
        <TryThis id="t-near-third" when={k === 33}>
          Get as close to one third as you can. Why can't it be exact?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function ChangeExplorer() {
  const [start, setStart] = useState(80)
  const [a, setA] = useState(25)
  const [b, setB] = useState(-10)
  const mid = start * (1 + a / 100)
  const end = mid * (1 + b / 100)
  const overall = (end / start - 1) * 100
  const top = Math.max(start, mid, end)
  const bars = [
    { label: 'start', value: start, color: 'var(--ink-3)' },
    { label: `${a >= 0 ? '+' : ''}${a}%`, value: mid, color: a >= 0 ? UP : DOWN },
    { label: `${b >= 0 ? '+' : ''}${b}%`, value: end, color: b >= 0 ? UP : DOWN },
  ]
  return (
    <LabSection id="change" eyebrow="Explore" title="Two changes in a row">
      <Prose>
        <p>
          A price changes twice. Each bar is the price after one more change. Watch the overall
          change: it is never just the two percentages added together.
        </p>
      </Prose>
      <Figure>
        <div
          className="flex h-52 items-end justify-center gap-6 px-3 pt-4 sm:px-4"
          role="img"
          aria-label={`${money(start)} then ${money(mid)} then ${money(end)}`}
        >
          {bars.map((bar, i) => (
            <div
              key={i}
              className="flex h-full w-20 flex-col items-center justify-end gap-1 text-xs"
            >
              <span className="tabular-nums font-medium">{money(bar.value)}</span>
              <div
                className="w-full rounded-t"
                style={{
                  height: `${(bar.value / top) * 75}%`,
                  background: bar.color,
                  opacity: 0.8,
                }}
              />
              <span className="text-ink-2">{bar.label}</span>
            </div>
          ))}
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line mt-3 px-3 pt-3 sm:grid-cols-3 sm:px-4">
          <Slider
            label="Start price (£)"
            value={start}
            min={20}
            max={200}
            step={10}
            onChange={setStart}
          />
          <Slider
            label="First change (%)"
            value={a}
            min={-50}
            max={100}
            step={5}
            onChange={setA}
            color={UP}
          />
          <Slider
            label="Second change (%)"
            value={b}
            min={-50}
            max={100}
            step={5}
            onChange={setB}
            color={DOWN}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'final price', value: money(end) },
              {
                label: 'overall change',
                value: `${overall >= 0 ? '+' : ''}${formatNumber(overall, 2)}%`,
              },
              {
                label: 'multipliers',
                value: (
                  <Tex>{`${formatNumber(1 + a / 100, 2)} \\times ${formatNumber(1 + b / 100, 2)} = ${formatNumber((1 + a / 100) * (1 + b / 100), 4)}`}</Tex>
                ),
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-up-then-down" when={a === 20 && b === -20}>
          Go up 20% and then down 20%. Are you back where you started?
        </TryThis>
        <TryThis id="t-undo" when={a !== 0 && Math.abs(overall) < 1e-9}>
          Find two changes that bring the price exactly back to the start.
        </TryThis>
        <TryThis id="t-doubled" when={Math.abs(overall - 100) < 1e-9}>
          Make the overall change exactly +100%: double the price.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [k, setK] = useState(0)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-to-percent"
          index={1}
          prompt="Write 0.35 as a percentage."
          answer={35}
          unit="%"
          explanation="Multiply by 100: $0.35 \times 100 = 35\%$."
        />
        <NumericChallenge
          id="c-eighths"
          index={2}
          prompt="Write $\tfrac38$ as a decimal."
          answer={0.375}
          tolerance={0.0001}
          explanation="$3 \div 8 = 0.375$."
        />
        <McqChallenge
          id="c-biggest-decimal"
          index={3}
          prompt="Which is the biggest?"
          options={[
            { text: '0.5', correct: true },
            { text: '0.45', why: '0.45 is 45 hundredths; 0.5 is 50 hundredths.' },
            { text: '0.405', why: '0.405 is 405 thousandths, less than 0.5.' },
            { text: '0.499', why: 'Just under 0.5.' },
          ]}
          explanation="Give them the same number of places: 0.500, 0.450, 0.405 and 0.499. The biggest is 0.500."
        />
        <NumericChallenge
          id="c-sale"
          index={4}
          prompt="A £80 jacket is reduced by 30%. What is the sale price, in £?"
          answer={56}
          unit="£"
          explanation="30% of 80 is 24, so it costs $80 - 24 = 56$. Or: $80 \times 0.7 = 56$."
        />
        <NumericChallenge
          id="c-increase"
          index={5}
          prompt="A ticket goes from £15 to £18. What is the percentage increase?"
          answer={20}
          unit="%"
          explanation="The rise is £3, and $\tfrac{3}{15} = 0.2 = 20\%$ of the old price."
        />
        <InteractiveChallenge
          id="c-shade-three-quarters"
          index={6}
          prompt="Shade exactly 75% of the grid."
          solved={k === 75}
          hint="75% means 75 out of 100."
          explanation="75 of 100 squares: $75\% = 0.75 = \tfrac34$."
          onReset={() => setK(0)}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <HundredGrid k={k} label={`${k} of 100 squares shaded`} />
            <Slider
              label="Squares shaded"
              value={k}
              min={0}
              max={100}
              step={1}
              onChange={setK}
              color={FILL}
            />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

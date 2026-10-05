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
import { FunctionGraph, Plot, Point } from '@/viz'
import { gcd } from '../_shared/fraction'

const BLUE = 'var(--c-blue)'
const YELLOW = 'var(--c-yellow)'
const SHOP_A = 'var(--c-violet)'
const SHOP_B = 'var(--c-orange)'

const money = (x: number) => `£${x.toFixed(2)}`

/** Cups of paint drawn as small squares: blue ones, then yellow ones, and the mixed colour. */
function Cups({ blue, yellow }: { blue: number; yellow: number }) {
  const total = blue + yellow
  const share = total ? Math.round((blue / total) * 100) : 50
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div
        className="flex max-w-xs flex-wrap gap-1"
        role="img"
        aria-label={`${blue} cups of blue and ${yellow} cups of yellow`}
      >
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className="size-5 rounded border border-line"
            style={{ background: i < blue ? BLUE : YELLOW }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-ink-2">
        mix:
        <div
          className="size-12 rounded-full border border-line"
          style={{ background: `color-mix(in oklab, ${BLUE} ${share}%, ${YELLOW})` }}
          role="img"
          aria-label={`The mixed colour is ${share}% blue`}
        />
      </div>
    </div>
  )
}

export default function RatiosProportionsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Same mix, any size">
        <Prose>
          <p>
            A recipe for green paint says 2 cups of blue to 3 cups of yellow. Make a bigger batch
            with 4 and 6, or 10 and 15, and you get exactly the same green. What matters is not the
            amounts but how they <strong>compare</strong>: the <strong>ratio</strong> 2 : 3.
          </p>
          <p>
            When two quantities keep the same ratio as they grow, they are{' '}
            <strong>proportional</strong>: double one and the other doubles. Every price per item,
            speed, exchange rate and map scale works this way.
          </p>
        </Prose>
      </LabSection>
      <MixExplorer />
      <DealExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Ratios and proportions">
        <Formula
          tex={'a : b = ka : kb \\qquad y = kx'}
          caption="Scaling both parts keeps the ratio; proportional quantities lie on a line through the origin."
        />
        <Prose>
          <ul>
            <li>
              <strong>Simplify</strong> a ratio by dividing both parts by their greatest common
              factor: <Tex>{'12 : 18 = 2 : 3'}</Tex>.
            </li>
            <li>
              <strong>Share in a ratio:</strong> to split £60 in the ratio 2 : 3, there are{' '}
              <Tex>{'2 + 3 = 5'}</Tex> parts of <Tex>{'60 \\div 5 = 12'}</Tex>, so the shares are
              £24 and £36.
            </li>
            <li>
              <strong>Unit rate:</strong> the amount for one item, <Tex>{'k = y/x'}</Tex>. It is the
              slope of the proportion line, so cheaper deals have gentler lines.
            </li>
            <li>
              <strong>Solve a proportion</strong> by keeping the ratio:{' '}
              <Tex>
                {'\\tfrac{x}{6} = \\tfrac{10}{15} \\Rightarrow x = 6 \\times \\tfrac{10}{15} = 4'}
              </Tex>
              .
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="Scale by multiplying, not adding">
          <p>
            Going from 2 : 3 to 4 : 5 by adding 2 to each part changes the colour: 4 : 5 is bluer.
            To keep the mix, multiply both parts by the same number: 2 : 3 becomes 4 : 6.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where ratios rule">
        <RealWorld
          items={[
            {
              title: 'Cooking',
              body: 'Rice to water 1 : 2, or a recipe for 4 scaled to feed 10 (multiply everything by 2.5).',
            },
            {
              title: 'Maps and models',
              body: 'A 1 : 50 000 map means 1 cm on paper is 50 000 cm (500 m) on the ground.',
            },
            {
              title: 'Shopping',
              body: 'Unit prices on shelf labels let you compare a 400 g pack with a 750 g one.',
            },
            {
              title: 'Screens and photos',
              body: 'Aspect ratios like 16 : 9 keep pictures from stretching when they are resized.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A ratio compares amounts; multiplying both parts keeps it the same.',
            'Proportional quantities satisfy $y = kx$: a straight line through the origin.',
            'The unit rate $k$ is the slope; compare deals by unit price.',
            'To share in a ratio, count the total parts first.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function MixExplorer() {
  const [a, setA] = useState(2)
  const [b, setB] = useState(3)
  const [k, setK] = useState(1)
  const g = gcd(a, b)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Mix the paint">
      <Prose>
        <p>
          Set the recipe (cups of blue to cups of yellow), then the number of batches. The mixed
          colour depends only on the ratio, not on how much you make.
        </p>
      </Prose>
      <PredictReveal
        question="The recipe is 2 cups blue to 3 cups yellow. You want 15 cups in total. How many cups of blue?"
        options={['2', '5', '6', '9']}
        answer={2}
        explanation="One batch is 5 cups, so 15 cups is 3 batches: $3 \times 2 = 6$ blue and $3 \times 3 = 9$ yellow."
      />
      <Figure>
        <div className="px-3 pt-4 sm:px-4">
          <Cups blue={k * a} yellow={k * b} />
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line mt-4 px-3 pt-3 sm:grid-cols-3 sm:px-4">
          <Slider
            label="Blue in the recipe"
            value={a}
            min={1}
            max={5}
            step={1}
            onChange={setA}
            color={BLUE}
          />
          <Slider
            label="Yellow in the recipe"
            value={b}
            min={1}
            max={5}
            step={1}
            onChange={setB}
            color={YELLOW}
          />
          <Slider label="Batches" value={k} min={1} max={4} step={1} onChange={setK} />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'cups', value: `${k * a} blue : ${k * b} yellow` },
              { label: 'simplest ratio', value: `${a / g} : ${b / g}` },
              {
                label: 'share of blue',
                value: (
                  <Tex>{`\\tfrac{${a}}{${a + b}} \\approx ${formatNumber(a / (a + b), 3)}`}</Tex>
                ),
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-big-batch" when={k >= 3}>
          Make three or more batches. Does the colour change?
        </TryThis>
        <TryThis id="t-even-mix" when={a === b}>
          Use equal amounts of blue and yellow. What is the simplest ratio?
        </TryThis>
        <TryThis id="t-not-simplest" when={g > 1}>
          Pick a recipe that isn't in its simplest form, like 2 : 4. Which smaller recipe gives the
          same colour?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const A_PACK = 3
const A_PRICE = 2.4

function DealExplorer() {
  const [n, setN] = useState(5)
  const [p, setP] = useState(4.5)
  const unitA = A_PRICE / A_PACK
  const unitB = p / n
  const cheaper = Math.abs(unitA - unitB) < 1e-9 ? 'same' : unitB < unitA ? 'B' : 'A'
  return (
    <LabSection id="deal" eyebrow="Explore" title="Which is the better buy?">
      <Prose>
        <p>
          Shop A sells juice in packs of 3 for £2.40. Set shop B's pack size and price. Each line
          shows what any number of cartons would cost at that shop's unit price; the gentler line is
          the better deal.
        </p>
      </Prose>
      <Figure>
        <Plot
          view={{ xMin: 0, xMax: 12, yMin: 0, yMax: 14 }}
          height={260}
          xLabel="cartons"
          yLabel="£"
          ariaLabel={`Shop A ${money(unitA)} per carton, shop B ${money(unitB)} per carton`}
        >
          <FunctionGraph fn={(x) => unitA * x} domain={[0, 12]} color={SHOP_A} />
          <FunctionGraph fn={(x) => unitB * x} domain={[0, 12]} color={SHOP_B} dashed />
          <Point at={[A_PACK, A_PRICE]} r={6} color={SHOP_A} />
          <Point at={[n, p]} r={6} color={SHOP_B} />
        </Plot>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label="Shop B: cartons per pack"
            value={n}
            min={1}
            max={10}
            step={1}
            onChange={setN}
            color={SHOP_B}
          />
          <Slider
            label="Shop B: pack price (£)"
            value={p}
            min={0.5}
            max={10}
            step={0.1}
            format={(v) => money(v)}
            onChange={setP}
            color={SHOP_B}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'A per carton', value: money(unitA), color: SHOP_A },
              { label: 'B per carton', value: money(unitB), color: SHOP_B },
              { label: 'better buy', value: cheaper === 'same' ? 'same price' : `shop ${cheaper}` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-match-deal" when={cheaper === 'same'}>
          Make shop B's deal exactly as good as shop A's. What happens to the two lines?
        </TryThis>
        <TryThis id="t-big-pack" when={n >= 8 && cheaper === 'B'}>
          Make a big pack (8 or more) that beats shop A.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [blue, setBlue] = useState(0)
  const [yellow, setYellow] = useState(0)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-eggs"
          index={1}
          prompt="A recipe uses 3 eggs for 12 cookies. How many eggs for 20 cookies?"
          answer={5}
          explanation="One egg makes 4 cookies, so 20 cookies need $20 \div 4 = 5$ eggs."
        />
        <NumericChallenge
          id="c-split-sixty"
          index={2}
          prompt="£60 is shared in the ratio 2 : 3. How much is the larger share, in £?"
          answer={36}
          unit="£"
          explanation="5 parts of £12 each; the larger share is $3 \times 12 = 36$."
        />
        <NumericChallenge
          id="c-unit-price"
          index={3}
          prompt="5 pens cost £3.50. What is the price of one pen, in £?"
          answer={0.7}
          tolerance={0.001}
          unit="£"
          explanation="$3.50 \div 5 = 0.70$."
        />
        <McqChallenge
          id="c-proportional"
          index={4}
          prompt="Which relationship is proportional?"
          options={[
            { text: '$y = 4x$', correct: true },
            { text: '$y = 4x + 1$', why: 'At $x = 0$ it gives 1, so the line misses the origin.' },
            { text: '$y = x^2$', why: 'Doubling $x$ quadruples $y$.' },
            { text: '$y = 4 / x$', why: 'Doubling $x$ halves $y$: that is inverse proportion.' },
          ]}
          explanation="Proportional means $y = kx$: a straight line through the origin, here with $k = 4$."
        />
        <NumericChallenge
          id="c-solve-x"
          index={5}
          prompt="Solve $\tfrac{x}{6} = \tfrac{10}{15}$."
          answer={4}
          explanation="$\tfrac{10}{15} = \tfrac23$, and $\tfrac23 \times 6 = 4$."
        />
        <InteractiveChallenge
          id="c-twenty-cups"
          index={6}
          prompt="Mix 20 cups of paint in the ratio 3 : 2 (blue to yellow)."
          solved={blue === 12 && yellow === 8}
          hint="3 + 2 = 5 parts make 20 cups, so each part is 4 cups."
          explanation="Each part is $20 \div 5 = 4$ cups: blue $3 \times 4 = 12$, yellow $2 \times 4 = 8$."
          onReset={() => {
            setBlue(0)
            setYellow(0)
          }}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <Cups blue={blue} yellow={yellow} />
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Slider
                label="Cups of blue"
                value={blue}
                min={0}
                max={20}
                step={1}
                onChange={setBlue}
                color={BLUE}
              />
              <Slider
                label="Cups of yellow"
                value={yellow}
                min={0}
                max={20}
                step={1}
                onChange={setYellow}
                color={YELLOW}
              />
            </div>
            <p className="text-sm">
              Total: {blue + yellow} cups, ratio {blue} : {yellow}
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

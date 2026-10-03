import { useState } from 'react'
import { normalPdf } from '@/math/stats'
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
import { diceSumDistribution } from '@/tools/probability/dist'
import { SamplingExperiment, type SamplingState } from '@/tools/probability/SamplingExperiment'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { FunctionGraph, Plot, usePlot } from '@/viz'
import { num } from '../_shared/tex'

/** Standard deviation of one fair die. */
const DIE_SD = Math.sqrt(35 / 12)

export default function CentralLimitTheoremLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Average almost anything, get a bell">
        <Prose>
          <p>
            Take a sample of values and average them. Do it again with a new sample, and again. The
            averages themselves form a distribution, and here is the astonishing part: it is close
            to a bell curve <em>whatever the original data looked like</em>, lopsided, two-humped or
            completely flat.
          </p>
          <p>
            That's the <strong>Central Limit Theorem</strong>, and it's why the normal distribution
            is everywhere: lots of things in the world are averages or sums of many small effects.
            It also tells you exactly how precise an average is.
          </p>
        </Prose>
      </LabSection>
      <SamplingExplorer />
      <DiceExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The theorem">
        <Formula
          tex={
            '\\bar X = \\frac{X_1 + X_2 + \\cdots + X_n}{n} \\;\\approx\\; \\text{Normal}\\Big(\\mu,\\; \\frac{\\sigma}{\\sqrt n}\\Big)'
          }
          caption="For large $n$, the mean of $n$ independent draws is roughly normal, centred on the population mean $\mu$."
        />
        <Formula
          tex={'\\text{SD of the mean} = \\frac{\\sigma}{\\sqrt n}'}
          caption="Called the standard error. Four times the data halves it."
        />
        <Prose>
          <p>
            The spread shrinks like <Tex>{'1/\\sqrt n'}</Tex>, not <Tex>1/n</Tex>. That's the law
            behind every survey: going from 100 to 400 people only doubles the precision, and each
            extra decimal place of accuracy costs 100 times more data.
          </p>
        </Prose>
        <Callout kind="misconception" title="It's about averages, not the data">
          <p>
            Collecting more data does not make the data itself look normal: a lopsided population
            stays lopsided. It is the distribution of <em>averages</em> that becomes a bell.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet the CLT">
        <RealWorld
          items={[
            {
              title: 'Opinion polls',
              body: 'A poll of 1,000 people has a margin of error of about ±3%, straight from $\\sigma/\\sqrt n$ and the bell curve.',
            },
            {
              title: 'Quality control',
              body: 'Factories plot the average of small batches over time. Thanks to the CLT, an average outside ±3 standard errors signals a real problem.',
            },
            {
              title: 'A/B tests',
              body: 'Websites compare average clicks between two designs and use the CLT to decide whether a difference is real or luck.',
            },
            {
              title: 'Measurement',
              body: 'Labs repeat measurements and average them: 4 repeats halve the random error, 100 repeats cut it tenfold.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Averages of many independent draws are approximately normal, whatever the population’s shape.',
            'The averages centre on the population mean $\\mu$.',
            'Their spread, the standard error, is $\\sigma / \\sqrt n$.',
            'Four times the data halves the error.',
            'The data itself keeps its shape; only the averages become a bell.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function SamplingExplorer() {
  const [s, setS] = useState<SamplingState | null>(null)
  const expectedSe = s ? s.sigma / Math.sqrt(s.n) : NaN
  const seClose =
    s !== null && s.samples >= 300 && Math.abs(s.sdOfMeans - expectedSe) < 0.12 * expectedSe
  return (
    <LabSection id="explore" eyebrow="Explore" title="Take samples, average them">
      <Prose>
        <p>
          The left chart is a population (draw your own with <strong>Custom</strong>). Each sample
          picks <Tex>n</Tex> values from it at random and records their average on the right. Take a
          few hundred samples and look at the shape of the averages.
        </p>
      </Prose>
      <PredictReveal
        question="The population is very lopsided: most values are small, a few are large. You average samples of 30 values. What shape will the averages make?"
        options={['Lopsided, like the population', 'A symmetric bell', 'Flat', 'Two humps']}
        answer={1}
        explanation="A bell. Averaging cancels out the lopsidedness: extreme values are rare in a sample of 30, and highs and lows balance out. Try it with the skewed shape below."
      />
      <Figure>
        <SamplingExperiment preset={{ shape: 'skewed', n: 5 }} onStateChange={setS} />
      </Figure>
      <TryThisList>
        <TryThis
          id="t-skewed"
          when={s !== null && s.shape === 'skewed' && s.n >= 20 && s.samples >= 300}
        >
          With the skewed population, set <Tex>n</Tex> to 20 or more and take at least 300 samples.
          Is the right-hand chart lopsided?
        </TryThis>
        <TryThis id="t-custom" when={s !== null && s.shape === 'custom' && s.samples >= 200}>
          Draw your own strange population and take 200 samples. Do the averages still make a bell?
        </TryThis>
        <TryThis id="t-se" when={seClose}>
          Take 300+ samples and compare “Spread of sample means” with{' '}
          <Tex>{'\\sigma/\\sqrt n'}</Tex>. They should nearly match.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

/** Exact distribution of the average of n dice, as bars over 1…6. */
function AverageBars({ n }: { n: number }) {
  const t = usePlot()
  const dist = diceSumDistribution(n)
  const w = 1 / n
  return (
    <g aria-hidden>
      {dist.map((p, sum) => {
        if (sum < n) return null
        const avg = sum / n
        // Height as a density (probability per unit), so different n share one scale.
        const h = p / w
        const x0 = t.sx(avg - w / 2)
        const x1 = t.sx(avg + w / 2)
        const gap = Math.min(2, (x1 - x0) * 0.15)
        return (
          <rect
            key={sum}
            x={x0 + gap / 2}
            y={t.sy(h)}
            width={Math.max(0.5, x1 - x0 - gap)}
            height={t.sy(0) - t.sy(h)}
            rx={Math.min(3, (x1 - x0) / 4)}
            fill="var(--c-green)"
            fillOpacity={0.8}
          />
        )
      })}
    </g>
  )
}

function DiceExplorer() {
  const [n, setN] = useState(1)
  const se = DIE_SD / Math.sqrt(n)
  const top = Math.max(0.3, normalPdf(3.5, 3.5, se) * 1.15)
  return (
    <LabSection id="dice" eyebrow="Explore" title="Averaging dice, exactly">
      <Prose>
        <p>
          No randomness this time: these are the exact chances for the average of <Tex>n</Tex> fair
          dice. One die is flat. Watch what happens as you average more of them. The blue curve is
          the bell the Central Limit Theorem predicts.
        </p>
      </Prose>
      <Figure>
        <Plot
          view={{ xMin: 0.5, xMax: 6.5, yMin: -top * 0.1, yMax: top }}
          height={260}
          xIntegers
          ariaLabel={`Distribution of the average of ${n} dice; standard deviation ${num(se)}`}
        >
          <AverageBars n={n} />
          {n > 1 && (
            <FunctionGraph fn={(x) => normalPdf(x, 3.5, se)} color="var(--c-blue)" width={2.25} />
          )}
        </Plot>
        <div className="grid gap-3 border-t border-line p-3 sm:p-4">
          <Slider label="Dice averaged n" value={n} min={1} max={12} step={1} onChange={setN} />
          <Readouts
            items={[
              { label: 'centre', value: '3.5' },
              { label: 'spread (SD of the average)', value: num(se) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-two" when={n === 2}>
          Average 2 dice. What shape do you get, and why is 3.5 the most likely average?
        </TryThis>
        <TryThis id="t-many" when={n >= 8}>
          Average 8 or more dice. How much narrower is it than one die?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [s, setS] = useState<SamplingState | null>(null)
  const solved = s !== null && s.shape === 'skewed' && s.n >= 25 && s.samples >= 200
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-se"
          index={1}
          prompt="A population has standard deviation $\sigma = 12$. What is the standard deviation of the average of 36 values?"
          answer={2}
          explanation="$\frac{\sigma}{\sqrt n} = \frac{12}{\sqrt{36}} = \frac{12}{6} = 2$."
        />
        <McqChallenge
          id="c-what"
          index={2}
          prompt="What does the Central Limit Theorem say becomes approximately normal?"
          options={[
            { text: 'The distribution of sample averages', correct: true },
            {
              text: 'The population itself, once you have enough data',
              why: 'The population keeps its shape; only averages become a bell.',
            },
            { text: 'Every single sample', why: 'One sample of lopsided data is still lopsided.' },
            {
              text: 'Nothing: it only works for normal data',
              why: 'Its power is that it works for almost any population.',
            },
          ]}
          explanation="It's the averages (or sums) of many independent values that become approximately normal."
        />
        <McqChallenge
          id="c-halve"
          index={3}
          prompt="To halve the standard error of an average, how much more data do you need?"
          options={[
            { text: '4 times as much', correct: true },
            {
              text: '2 times as much',
              why: 'The error shrinks like $1/\\sqrt n$, so doubling $n$ only divides it by $\\sqrt2$.',
            },
            {
              text: '8 times as much',
              why: '$\\sqrt 8 \\approx 2.8$: that would more than halve it.',
            },
            { text: '100 times as much', why: 'That would cut it tenfold.' },
          ]}
          explanation="$\sigma/\sqrt{4n} = \tfrac12 \cdot \sigma/\sqrt n$."
        />
        <NumericChallenge
          id="c-centre"
          index={4}
          prompt="You average a huge number of fair dice rolls. Around what value does the average cluster?"
          answer={3.5}
          explanation="The mean of one die is $\frac{1 + 2 + 3 + 4 + 5 + 6}{6} = 3.5$, and averages centre on the population mean."
        />
        <InteractiveChallenge
          id="c-collect"
          index={5}
          prompt="Using the **skewed** population, collect at least 200 averages of samples of size $n \ge 25$."
          solved={solved}
          hint="Keep the skewed shape, slide $n$ to 25 or more, then press “Take 100” twice."
          explanation="Even from a lopsided population, averages of 25 values pile up in a symmetric bell around $\mu$."
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <SamplingExperiment preset={{ shape: 'skewed', n: 5 }} onStateChange={setS} />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

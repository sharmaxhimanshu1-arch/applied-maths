import { useState } from 'react'
import { clamp, snap } from '@/math/core'
import { mean, std, variance } from '@/math/stats'
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
import { Label, MovablePoint, Plot, Point, Polygon, Segment } from '@/viz'
import { num } from '../_shared/tex'

const DOT = 'var(--c-orange)'
const SQUARE = 'var(--c-violet)'
const MEAN = 'var(--ink)'

/** Each value's deviation from the mean drawn as a square; their average square sits below. */
function SquaresPlot({ values, onValues }: { values: number[]; onValues: (v: number[]) => void }) {
  const m = mean(values)
  const sd = std(values)
  // Stack equal values so every dot stays grabbable.
  const seen = new Map<number, number>()
  const levels = values.map((v) => {
    const k = seen.get(v) ?? 0
    seen.set(v, k + 1)
    return k
  })
  return (
    <Plot
      view={{ xMin: -0.5, xMax: 10.5, yMin: -3.6, yMax: 4.6 }}
      aspect="equal"
      maxHeight={460}
      ariaLabel={`Values ${values.join(', ')}; mean ${num(m)}; standard deviation ${num(sd)}`}
    >
      {values.map((v, i) => {
        const d = v - m
        if (Math.abs(d) < 1e-9) return null
        const x0 = Math.min(v, m)
        const side = Math.abs(d)
        return (
          <Polygon
            key={i}
            points={[
              [x0, 0],
              [x0 + side, 0],
              [x0 + side, side],
              [x0, side],
            ]}
            fill={SQUARE}
            fillOpacity={0.1}
            stroke={SQUARE}
            strokeWidth={1.25}
          />
        )
      })}
      {sd > 1e-9 && (
        <>
          <Polygon
            points={[
              [m - sd / 2, 0],
              [m + sd / 2, 0],
              [m + sd / 2, -sd],
              [m - sd / 2, -sd],
            ]}
            fill={SQUARE}
            fillOpacity={0.28}
            stroke={SQUARE}
            strokeWidth={2}
            dashed
          />
          <Label at={[m + sd / 2, -sd / 2]} anchor="left" offset={[8, 0]} className="text-xs">
            average square: side = SD = {num(sd)}
          </Label>
        </>
      )}
      <Segment from={[m, -0.05]} to={[m, 4.6]} color={MEAN} width={1.5} dashed />
      <Label at={[m, 4.6]} anchor="top-left" offset={[4, 2]} className="text-xs font-semibold">
        mean {num(m)}
      </Label>
      {values.map((v, i) => (
        <MovablePoint
          key={i}
          x={v}
          y={levels[i] * 0.42}
          onMove={(x) => onValues(values.map((w, k) => (k === i ? x : w)))}
          constrain={([x]) => [snap(clamp(x, 0, 10), 0.5), levels[i] * 0.42]}
          step={0.5}
          color={DOT}
          size={6}
          label={`Value ${i + 1}`}
        />
      ))}
    </Plot>
  )
}

function SpreadReadouts({ values }: { values: number[] }) {
  const m = mean(values)
  const devSum = values.reduce((s, v) => s + (v - m), 0)
  return (
    <Readouts
      items={[
        { label: 'mean', value: num(m) },
        { label: 'sum of deviations', value: num(Math.abs(devSum) < 1e-9 ? 0 : devSum) },
        { label: 'variance (average square)', value: num(variance(values)), color: SQUARE },
        { label: 'standard deviation', value: num(std(values)), color: SQUARE },
      ]}
    />
  )
}

export default function VarianceStdLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="How spread out is it?">
        <Prose>
          <p>
            Two classes both average 70% on a test. In one, everyone scored between 65 and 75; in
            the other, scores ran from 20 to 100. Same average, very different stories. We need a
            number for <strong>spread</strong>.
          </p>
          <p>
            The idea: measure how far each value is from the mean (its <strong>deviation</strong>),
            then average those distances. The twist is that we average the <em>squares</em> of the
            deviations, which is easiest to understand by literally drawing squares.
          </p>
        </Prose>
      </LabSection>
      <SquaresExplorer />
      <ScaleExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Variance and standard deviation">
        <Formula
          tex={
            '\\text{Var} = \\frac{1}{n}\\sum_{i=1}^{n} (x_i - \\bar x)^2 \\qquad \\text{SD} = \\sqrt{\\text{Var}}'
          }
          caption="Variance is the average area of the squares; the SD is the side of that average square."
        />
        <Prose>
          <p>
            Why squares? The raw deviations always add up to zero (the mean is the balance point),
            so their average says nothing. Squaring makes every deviation count as positive, and
            punishes big misses more than small ones. Taking the square root at the end puts the
            answer back in the data's own units: if the data are in cm, the SD is in cm too.
          </p>
          <p>
            Two rules worth knowing: adding the same amount to every value doesn't change the SD;
            multiplying every value by <Tex>k</Tex> multiplies the SD by <Tex>|k|</Tex> (and the
            variance by <Tex>k^2</Tex>).
          </p>
        </Prose>
        <Callout kind="note" title="n or n − 1?">
          <p>
            When the data are a <em>sample</em> used to estimate a bigger population, statisticians
            divide by <Tex>n - 1</Tex> instead of <Tex>n</Tex>. It nudges the answer up slightly to
            make up for the sample's mean sitting a little too close to its own data. This lab uses{' '}
            <Tex>n</Tex>.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet spread">
        <RealWorld
          items={[
            {
              title: 'Investing',
              body: 'The SD of an investment’s returns is its “volatility”: the higher it is, the bumpier the ride.',
            },
            {
              title: 'Manufacturing',
              body: 'Two machines can fill bottles with the same average volume; the one with the smaller SD wastes less and overflows less.',
            },
            {
              title: 'Weather',
              body: 'Two cities can share the same average temperature while one has mild seasons and the other has scorching summers and freezing winters.',
            },
            {
              title: 'Test scores',
              body: 'Grading “on a curve” uses the SD: a score one SD above the mean is good whatever the test’s difficulty.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A deviation is a value’s distance from the mean; deviations always sum to 0.',
            'Variance is the average squared deviation; the SD is its square root.',
            'The SD is in the same units as the data and measures a typical distance from the mean.',
            'Squaring makes big deviations count a lot: outliers inflate the SD.',
            'Shifting data leaves the SD unchanged; scaling by $k$ scales the SD by $|k|$.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function SquaresExplorer() {
  const [values, setValues] = useState([2, 4, 4.5, 5, 6.5, 8])
  const m = mean(values)
  const sd = std(values)
  const maxDev = Math.max(...values.map((v) => Math.abs(v - m)))
  return (
    <LabSection id="explore" eyebrow="Explore" title="Deviations as squares">
      <Prose>
        <p>
          Each dot's deviation from the mean is drawn as a square above the line. The variance is
          the <em>average</em> of those areas, drawn as one square below the line; its side is the
          standard deviation. Drag the dots.
        </p>
      </Prose>
      <PredictReveal
        question="Add up all the deviations $x - \bar x$ (positive on the right of the mean, negative on the left). What do you get?"
        options={['Always 0', 'The variance', 'The standard deviation', 'It depends on the data']}
        answer={0}
        explanation="Always 0: the mean is the balance point, so the distances on each side cancel exactly. That's why we square the deviations before averaging. Check “sum of deviations” below."
      />
      <Figure>
        <SquaresPlot values={values} onValues={setValues} />
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <SpreadReadouts values={values} />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-zero" when={sd < 1e-9}>
          Make the standard deviation exactly 0. What does the data look like?
        </TryThis>
        <TryThis id="t-far" when={maxDev >= 4.5}>
          Drag one dot far from the others. How big is its square compared with the rest?
        </TryThis>
        <TryThis id="t-two" when={Math.abs(sd - 2) < 0.005}>
          Arrange the dots so the standard deviation is exactly 2.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const BASE = [3, 4, 4.5, 5, 5.5, 6, 7]

function ScaleExplorer() {
  const [spread, setSpread] = useState(1)
  const [shift, setShift] = useState(0)
  const values = BASE.map((v) => 5 + shift + spread * (v - 5))
  const m = mean(values)
  const sd = std(values)
  const baseSd = std(BASE)
  return (
    <LabSection id="spread" eyebrow="Explore" title="Stretch it, shift it">
      <Prose>
        <p>
          The shaded band covers one standard deviation either side of the mean. Stretch the data
          away from its centre, or slide all of it along, and watch what the SD and the variance do.
        </p>
      </Prose>
      <Figure>
        <Plot
          view={{ xMin: -3, xMax: 13, yMin: -0.6, yMax: 1.2 }}
          height={170}
          grid={false}
          axes="x"
          ariaLabel={`Data with mean ${num(m)} and standard deviation ${num(sd)}`}
        >
          {sd > 1e-9 && (
            <Polygon
              points={[
                [m - sd, -0.6],
                [m + sd, -0.6],
                [m + sd, 1.2],
                [m - sd, 1.2],
              ]}
              fill={SQUARE}
              fillOpacity={0.1}
            />
          )}
          <Segment from={[m, -0.6]} to={[m, 1.2]} color={MEAN} width={1.5} dashed />
          {values.map((v, i) => (
            <Point key={i} at={[v, 0.3]} r={7} color={DOT} />
          ))}
          <Label
            at={[m + sd, 1.2]}
            anchor="top-right"
            offset={[-4, 4]}
            className="text-xs text-ink-2"
          >
            ±1 SD
          </Label>
        </Plot>
        <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
          <Slider
            label="Stretch from the centre"
            value={spread}
            min={0}
            max={2}
            step={0.25}
            format={(v) => `×${num(v)}`}
            onChange={setSpread}
            color={SQUARE}
          />
          <Slider
            label="Slide everything"
            value={shift}
            min={-3}
            max={3}
            step={0.5}
            format={(v) => (v > 0 ? `+${num(v)}` : num(v))}
            onChange={setShift}
          />
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'mean', value: num(m) },
              {
                label: 'SD',
                value: `${num(sd)} (= ×${num(sd / baseSd)} of the start)`,
                color: SQUARE,
              },
              {
                label: 'variance',
                value: `${num(variance(values))} (= ×${num(variance(values) / variance(BASE))})`,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-double" when={spread === 2 && shift === 0}>
          Stretch by ×2. The SD doubles. What happens to the variance, and why?
        </TryThis>
        <TryThis id="t-shift" when={shift !== 0 && spread === 1}>
          Slide the data without stretching it. Does the spread change?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [values, setValues] = useState([4, 5, 5, 6])
  const solved = Math.abs(std(values) - 2) < 0.005
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-variance"
          index={1}
          prompt="Find the variance of 2, 4 and 6 (divide by $n$)."
          answer={8 / 3}
          tolerance={0.01}
          hint="The mean is 4. Square each deviation, then average them."
          explanation="Deviations $-2, 0, 2$; squares $4, 0, 4$; average $\tfrac83 \approx 2.67$."
        />
        <NumericChallenge
          id="c-zero"
          index={2}
          prompt="What is the standard deviation of 5, 5, 5, 5?"
          answer={0}
          explanation="Every value equals the mean, so every deviation (and the SD) is 0: no spread at all."
        />
        <McqChallenge
          id="c-double"
          index={3}
          prompt="Every value in a data set is doubled. What happens to the standard deviation?"
          options={[
            { text: 'It doubles', correct: true },
            {
              text: 'It stays the same',
              why: 'Doubling pushes every value twice as far from the mean.',
            },
            { text: 'It quadruples', why: 'That is the variance (it scales by $2^2$).' },
            { text: 'It halves', why: 'The data spread out, so the SD grows.' },
          ]}
          explanation="All deviations double, so the SD doubles and the variance grows 4 times."
        />
        <McqChallenge
          id="c-shift"
          index={4}
          prompt="10 points are added to every student's score. What happens to the standard deviation?"
          options={[
            { text: 'Nothing: it stays the same', correct: true },
            {
              text: 'It goes up by 10',
              why: 'The mean goes up by 10, but every distance from it is unchanged.',
            },
            { text: 'It goes up by 100', why: 'Shifting doesn’t stretch anything.' },
            { text: 'It drops to 0', why: 'The scores are still as spread out as before.' },
          ]}
          explanation="The mean rises by 10 too, so every deviation, and the SD, stays the same."
        />
        <InteractiveChallenge
          id="c-sd-two"
          index={5}
          prompt="Drag the four dots so that the standard deviation is exactly **2**."
          solved={solved}
          hint="Try two dots 2 below the mean and two dots 2 above it."
          explanation="For example 3, 3, 7, 7: the mean is 5 and every deviation is ±2, so every square has area 4, the variance is 4 and the SD is 2."
          onReset={() => setValues([4, 5, 5, 6])}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <SquaresPlot values={values} onValues={setValues} />
            <div className="border-t border-line px-3 pb-3">
              <SpreadReadouts values={values} />
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

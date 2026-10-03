import { useState } from 'react'
import { linearRegression, mean, sse } from '@/math/stats'
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
import { DataLab, type DataLabState } from '@/tools/data/DataLab'
import { SCATTER_DATASETS } from '@/tools/data/datasets'
import { Tex } from '@/ui/Tex'
import {
  FunctionGraph,
  InfiniteLine,
  Label,
  MovablePoint,
  Plot,
  Point,
  Segment,
  constraints,
} from '@/viz'
import { num, signed } from '../_shared/tex'

const STUDY = SCATTER_DATASETS.find((d) => d.id === 'study')!
const XS = STUDY.points.map((p) => p[0])
const YS = STUDY.points.map((p) => p[1])
const BEST = linearRegression(XS, YS)
const MX = mean(XS)
const MY = mean(YS)
/** Squared error of the line with slope m through the centre point (x̄, ȳ). */
const sseAt = (m: number) => sse(XS, YS, m, MY - m * MX)

export default function LinearRegressionLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="The line that fits best">
        <Prose>
          <p>
            Plot hours studied against test scores and the dots drift upwards, but they don't sit on
            a line. <strong>Linear regression</strong> finds the single straight line that best
            summarises the trend, so you can describe it (“each extra hour is worth about 6 points”)
            and predict with it.
          </p>
          <p>
            “Best” has a precise meaning. Each point misses the line by a vertical gap, its{' '}
            <strong>residual</strong>. Square every residual and add them up: the best line makes
            that total as small as possible. It's called the <strong>least squares</strong> line.
          </p>
        </Prose>
      </LabSection>
      <FitExplorer />
      <LandscapeExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The least squares line">
        <Formula
          tex={'\\hat y = m x + b \\qquad \\text{SSE} = \\sum_i \\big(y_i - \\hat y_i\\big)^2'}
          caption="Predictions $\hat y$, residuals $y - \hat y$, and the sum of squared errors to minimise."
        />
        <Formula
          tex={
            'm = \\frac{\\sum (x_i - \\bar x)(y_i - \\bar y)}{\\sum (x_i - \\bar x)^2} = r\\,\\frac{s_y}{s_x} \\qquad b = \\bar y - m\\,\\bar x'
          }
          caption="The bottom of the SSE bowl, found with algebra (or calculus) instead of by hand."
        />
        <Prose>
          <p>
            The second formula says the best line always passes through the centre of the data,{' '}
            <Tex>{'(\\bar x, \\bar y)'}</Tex>, and its slope is the correlation <Tex>r</Tex> scaled
            by how spread out <Tex>y</Tex> is compared with <Tex>x</Tex>.
          </p>
        </Prose>
        <Callout kind="misconception" title="A good fit is not a cause">
          <p>
            Ice-cream sales and sunburn rise together, but ice cream doesn't cause sunburn: hot
            weather drives both. And be careful predicting far outside your data: a trend that holds
            for 0 to 9 hours of study won't promise 300 points for 50 hours.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet regression">
        <RealWorld
          items={[
            {
              title: 'Pricing',
              body: 'Estate agents estimate a house’s value from its size and location with regression on recent sales.',
            },
            {
              title: 'Science',
              body: 'Hubble measured how fast galaxies recede against their distance; the slope of his best-fit line revealed the expanding universe.',
            },
            {
              title: 'Machine learning',
              body: 'Linear regression is the first model in every ML course, and the starting point for neural networks (see Gradient Descent).',
            },
            {
              title: 'Health',
              body: 'Doctors use regression to relate dose to effect, or age to typical blood pressure.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A residual is the vertical miss $y - \\hat y$ between a point and the line.',
            'Least squares picks the line with the smallest sum of squared residuals.',
            'The best line passes through $(\\bar x, \\bar y)$ with slope $m = r\\,s_y / s_x$.',
            'The squared error as a function of the slope is a bowl; fitting means finding its bottom.',
            'Correlation is not causation, and predictions far outside the data are risky.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function FitExplorer() {
  const [s, setS] = useState<DataLabState | null>(null)
  const close = s?.userSse !== undefined && s.userSse <= s.sse * 1.1
  return (
    <LabSection id="explore" eyebrow="Explore" title="Draw your best line">
      <Prose>
        <p>
          Drag the two purple handles to place your own line. The squares show each point's squared
          residual: your job is to make their total area, your line's error, as small as you can.
          When you're happy, switch on <strong>Best-fit line</strong> to compare.
        </p>
      </Prose>
      <PredictReveal
        question="One student studied 9 hours but scored only 30. What happens to the best-fit line?"
        options={[
          'It tilts noticeably towards that point',
          'Nothing: one point out of many is ignored',
          'It jumps to pass through that point',
        ]}
        answer={0}
        explanation="Squaring makes a big miss very expensive, so the line tilts towards an outlier. Try dragging a point far away below and watch the blue line swing."
      />
      <Figure>
        <DataLab
          preset={{ dataset: 'study', show: { fit: false, userLine: true, squares: true } }}
          onStateChange={setS}
        />
      </Figure>
      <TryThisList>
        <TryThis id="t-close" when={close}>
          Get your line's error within 10% of the best possible line's error.
        </TryThis>
        <TryThis id="t-outlier" when={s !== null && s.n >= 5 && s.r < 0.7}>
          Drag one point far from the trend until the correlation <Tex>r</Tex> drops below 0.7.
          Watch how the best-fit line swings.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function LandscapeExplorer() {
  const [m, setM] = useState(2)
  const err = sseAt(m)
  const best = BEST.sse
  const b = MY - m * MX
  const top = Math.max(sseAt(0), sseAt(12))
  return (
    <LabSection id="landscape" eyebrow="Explore" title="Fitting is finding the bottom of a bowl">
      <Prose>
        <p>
          Every line through the centre of the data <Tex>{'(\\bar x, \\bar y)'}</Tex> has its own
          slope and its own squared error. Plot the error against the slope and you get a bowl
          (right). Slide along the bowl and watch the line on the left.
        </p>
      </Prose>
      <Figure>
        <div className="grid sm:grid-cols-2">
          <div>
            <div className="px-3 pt-2 text-sm font-semibold">The line</div>
            <Plot
              view={STUDY.view}
              height={260}
              ariaLabel={`Line with slope ${num(m)} through the centre of the data`}
            >
              {STUDY.points.map((p, i) => (
                <Segment
                  key={`r${i}`}
                  from={p}
                  to={[p[0], m * p[0] + b]}
                  color="var(--c-violet)"
                  dashed
                  width={1.5}
                />
              ))}
              <InfiniteLine
                through={[MX, MY]}
                direction={[1, m]}
                color="var(--c-violet)"
                width={2.5}
              />
              {STUDY.points.map((p, i) => (
                <Point key={i} at={p} r={4.5} color="var(--c-orange)" />
              ))}
              <Point at={[MX, MY]} r={5} color="var(--ink)" hollow />
            </Plot>
          </div>
          <div className="border-t border-line sm:border-t-0 sm:border-l">
            <div className="px-3 pt-2 text-sm font-semibold">Squared error for each slope</div>
            <Plot
              view={{ xMin: -0.5, xMax: 12, yMin: -top * 0.06, yMax: top * 1.05 }}
              height={260}
              ariaLabel={`Squared error ${num(err, 0)} at slope ${num(m)}; the minimum is ${num(best, 0)} at slope ${num(BEST.slope)}`}
              xLabel="slope"
            >
              <FunctionGraph fn={sseAt} color="var(--c-blue)" width={2.5} />
              <Label at={[m, err]} anchor="bottom-left" offset={[8, -6]} className="text-xs">
                error {num(err, 0)}
              </Label>
              <MovablePoint
                x={m}
                y={err}
                onMove={(x) => setM(x)}
                constrain={constraints.onGraph(sseAt, 0, 12)}
                step={0.1}
                color="var(--c-violet)"
                size={7}
                label="Slope of the line (slides along the error curve)"
              />
            </Plot>
          </div>
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'your line',
                value: <Tex>{`\\hat y = ${num(m)}x ${signed(b)}`}</Tex>,
                color: 'var(--c-violet)',
              },
              { label: 'squared error', value: num(err, 0) },
              { label: 'compared with the best', value: `${num(err / best, 2)}×` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-bottom" when={err <= best * 1.01}>
          Find the bottom of the bowl. Is that slope the same as the best-fit line's?
        </TryThis>
        <TryThis id="t-steep" when={m >= 10}>
          Make the slope much too steep. How fast does the error grow?
        </TryThis>
      </TryThisList>
      <Prose className="mt-4">
        <p>
          The bowl shape is the key to machine learning. A computer that can't solve the formula can
          still roll downhill on this curve until it reaches the bottom. That's gradient descent,
          coming up in the capstone labs.
        </p>
      </Prose>
    </LabSection>
  )
}

function Practice() {
  const [s, setS] = useState<DataLabState | null>(null)
  const solved = s?.userSse !== undefined && s.userSse <= s.sse * 1.05
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-predict"
          index={1}
          prompt="The best-fit line is $\hat y = 2x + 1$. What does it predict when $x = 3$?"
          answer={7}
          explanation="$\hat y = 2 \cdot 3 + 1 = 7$."
        />
        <NumericChallenge
          id="c-residual"
          index={2}
          prompt="The line is $\hat y = 3x + 1$. What is the residual of the point $(2, 9)$?"
          answer={2}
          hint="Residual = actual $y$ − predicted $\hat y$."
          explanation="The line predicts $3 \cdot 2 + 1 = 7$; the point is at 9, so the residual is $9 - 7 = 2$ (the point is above the line)."
        />
        <McqChallenge
          id="c-minimise"
          index={3}
          prompt="What does the least squares line make as small as possible?"
          options={[
            { text: 'The sum of the squared vertical distances to the points', correct: true },
            {
              text: 'The sum of the vertical distances',
              why: 'Positive and negative misses would cancel; that’s why they are squared.',
            },
            {
              text: 'The number of points not on the line',
              why: 'Usually no line passes through all the points; it minimises the total squared miss.',
            },
            {
              text: 'The slope',
              why: 'The slope is whatever the data needs; it is not being minimised.',
            },
          ]}
          explanation="Least squares minimises $\sum (y_i - \hat y_i)^2$, the total area of the squares."
        />
        <McqChallenge
          id="c-centre"
          index={4}
          prompt="The least squares line always passes through which point?"
          options={[
            { text: '$(\\bar x, \\bar y)$, the means of $x$ and $y$', correct: true },
            { text: 'The origin $(0, 0)$', why: 'Only if the data happen to be centred there.' },
            {
              text: 'The first data point',
              why: 'The order of the data doesn’t matter to the fit.',
            },
            {
              text: 'The highest data point',
              why: 'The fit balances all the points, not the extremes.',
            },
          ]}
          explanation="Because $b = \bar y - m \bar x$, the line goes through the centre of the data."
        />
        <InteractiveChallenge
          id="c-fit"
          index={5}
          prompt="These are car ages and prices. Drag your purple line until its squared error is within **5%** of the best possible."
          solved={solved}
          hint="Prices fall with age, so the line should slope down. Turn on Residuals to see the misses."
          explanation="The best line here falls by about 2.4 ($k) per year of age. Close to that, small tilts barely change the error: you're near the bottom of the bowl."
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <DataLab
              preset={{
                dataset: 'cars',
                show: { fit: false, userLine: true, squares: true },
                toggles: false,
                editable: false,
              }}
              onStateChange={setS}
            />
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

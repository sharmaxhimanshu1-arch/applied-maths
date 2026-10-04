import { useState } from 'react'
import { Play, Square } from 'lucide-react'
import { prefersReducedMotion } from '@/app/theme'
import { formatNumber } from '@/math/core'
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
import { Button } from '@/ui/Button'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import {
  FunctionGraph,
  InfiniteLine,
  MovablePoint,
  Plot,
  Point,
  Segment,
  Vector,
  constraints,
  useAnimationFrame,
} from '@/viz'
import { DataPoints, ProbabilityMap } from '../_shared/Classifier'
import {
  STUDY,
  descend1,
  grad1,
  lineModel,
  logLoss,
  loss1,
  makeData,
  score,
  sigmoid,
} from '../_shared/ml'

const CURVE = 'var(--c-violet)'
const PASS = 'var(--c-orange)'
const FAIL = 'var(--c-blue)'
const COST = 'var(--c-red)'
const LINE = 'var(--ink-2)'

const pct = (x: number) => `${Math.round(x * 100)}%`

/** The student who costs the model the most, and how much. */
function worst(w: number, m: number) {
  let best = { x: 0, loss: -1 }
  for (const d of STUDY) {
    const l = logLoss(sigmoid(w * (d.x - m)), d.label)
    if (l > best.loss) best = { x: d.x, loss: l }
  }
  return best
}

/** The S-curve over the study data, with each student's miss drawn as a red stalk. */
function StudyPlot({ w, m }: { w: number; m: number }) {
  return (
    <Plot
      view={{ xMin: -0.3, xMax: 10.3, yMin: -0.12, yMax: 1.15 }}
      height={300}
      xLabel="hours studied"
      yLabel="P(pass)"
      ariaLabel={`S-curve with steepness ${formatNumber(w)} and 50% point at ${formatNumber(m)} hours`}
    >
      <Segment from={[-0.3, 0.5]} to={[10.3, 0.5]} color={LINE} width={1} dashed />
      <Segment from={[m, -0.12]} to={[m, 1.15]} color={LINE} width={1} dashed />
      {STUDY.map((d) => (
        <Segment
          key={`miss-${d.x}`}
          from={[d.x, d.label]}
          to={[d.x, sigmoid(w * (d.x - m))]}
          color={COST}
          width={2}
          opacity={0.55}
        />
      ))}
      <FunctionGraph fn={(x) => sigmoid(w * (x - m))} color={CURVE} width={3} />
      {STUDY.map((d) => (
        <Point
          key={`pt-${d.x}`}
          at={[d.x, d.label]}
          r={5}
          color={d.label ? PASS : FAIL}
          hollow={!d.label}
        />
      ))}
    </Plot>
  )
}

export default function LogisticRegressionLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="From a score to a probability">
        <Prose>
          <p>
            Will this email be spam? Will this patient need the ICU? Will this student pass? Each
            question has a yes/no answer, but a good model should say <em>how sure</em> it is.
          </p>
          <p>
            <strong>Logistic regression</strong> does this in two moves. First it adds up the
            evidence into a score, <Tex>{'z = wx + b'}</Tex>, which can be any number. Then the{' '}
            <strong>sigmoid</strong> squashes that score into a probability between 0 and 1. Big
            positive scores mean “almost certainly yes”, big negative ones “almost certainly no”,
            and a score of 0 means 50/50.
          </p>
        </Prose>
      </LabSection>
      <CurveExplorer />
      <PlaneExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The model and its loss">
        <Formula
          tex={'p = \\sigma(wx + b) = \\frac{1}{1 + e^{-(wx + b)}}'}
          caption="The sigmoid turns any score into a probability."
        />
        <Formula
          tex={'\\text{loss} = -\\big[\\,y \\ln p + (1 - y)\\ln(1 - p)\\,\\big]'}
          caption="Log loss for one example with label y = 1 or 0. Average it over the data."
        />
        <Prose>
          <ul>
            <li>
              <strong>Undo the sigmoid</strong> and the score is the <em>log-odds</em>:{' '}
              <Tex>{'\\ln\\frac{p}{1 - p} = wx + b'}</Tex>. Each extra unit of <Tex>{'x'}</Tex>{' '}
              multiplies the odds by <Tex>{'e^{w}'}</Tex>.
            </li>
            <li>
              <strong>The 50% point</strong> is where the score is 0: <Tex>{'x = -b/w'}</Tex>. With
              several inputs, <Tex>{'w_1x_1 + w_2x_2 + b = 0'}</Tex> is a straight line (a plane, in
              higher dimensions): the <strong>decision boundary</strong>.
            </li>
            <li>
              <strong>Log loss</strong> barely charges a confident right answer, but charges a
              confident wrong answer a lot: <Tex>{'-\\ln 0.01 \\approx 4.6'}</Tex>. There is no
              formula for the best <Tex>{'w'}</Tex> and <Tex>{'b'}</Tex>; we find them with{' '}
              <strong>gradient descent</strong>, and the gradient is beautifully simple:{' '}
              <Tex>{'\\frac{\\partial\\,\\text{loss}}{\\partial w} = (p - y)\\,x'}</Tex>.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="“Regression”, but it classifies">
          <p>
            Despite the name, logistic regression is a <em>classifier</em>: it predicts the
            probability of a yes. And however curvy the S looks, its decision boundary is always a
            straight line (or flat plane). Curved boundaries need extra features or a neural
            network.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet it">
        <RealWorld
          items={[
            {
              title: 'Medicine',
              body: 'Risk scores (like the chance of heart disease in ten years) are often logistic models of age, blood pressure, cholesterol and smoking.',
            },
            {
              title: 'Spam filters',
              body: 'Each word adds or subtracts evidence; the sigmoid turns the total into a spam probability.',
            },
            {
              title: 'Credit and insurance',
              body: 'Lenders use logistic models because each weight is easy to explain: “this factor multiplies the odds of default by 1.3”.',
            },
            {
              title: 'Inside neural networks',
              body: 'The last layer of a yes/no network is exactly a logistic regression on the features the network has learned.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Score $z = wx + b$, then probability $p = \\sigma(z)$.',
            'The decision boundary, $p = 0.5$, is where $z = 0$: a straight line.',
            'Log loss punishes confident mistakes hardest.',
            'Gradient descent finds $w$ and $b$; the gradient is (prediction − label) × input.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function CurveExplorer() {
  const [w, setW] = useState(0.8)
  const [m, setM] = useState(6)
  const [fitting, setFitting] = useState(false)
  const loss = loss1(STUDY, w, -w * m)
  const bad = worst(w, m)
  useAnimationFrame(() => {
    const [nw, nb] = descend1(STUDY, w, -w * m, 40, 0.3)
    const [gw, gb] = grad1(STUDY, nw, nb)
    setW(nw)
    setM(-nb / nw)
    if (Math.hypot(gw, gb) < 2e-4) setFitting(false)
  }, fitting)
  const fit = () => {
    if (prefersReducedMotion()) {
      const [nw, nb] = descend1(STUDY, w, -w * m, 20000, 0.3)
      setW(nw)
      setM(-nb / nw)
      return
    }
    setFitting(true)
  }
  return (
    <LabSection id="explore" eyebrow="Explore" title="Fit an S-curve">
      <Prose>
        <p>
          Sixteen students: how long each studied, and whether they passed (orange, at the top) or
          failed (blue, at the bottom). The violet curve is the model's probability of passing. Each
          red stalk is how far the curve misses a student; the loss adds up how bad those misses
          are. Set the steepness and the 50% point by hand, or let gradient descent fit them.
        </p>
      </Prose>
      <PredictReveal
        question="The model gives a student a 99% chance of passing, and they fail. Compared with predicting 60% and them failing, the log loss is…"
        options={['About the same', 'About twice as big', 'More than five times as big']}
        answer={2}
        explanation="$-\ln(1 - 0.99) \approx 4.6$ against $-\ln(1 - 0.6) \approx 0.92$: five times as much. Log loss punishes confident mistakes hardest."
      />
      <Figure>
        <StudyPlot w={w} m={m} />
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider
            label={<Tex>{'\\text{steepness } w'}</Tex>}
            name="Steepness w"
            value={w}
            min={0.1}
            max={5}
            step={0.1}
            format={(v) => formatNumber(v, 2)}
            onChange={(v) => {
              setFitting(false)
              setW(v)
            }}
            color={CURVE}
          />
          <Slider
            label="50% point (hours)"
            value={m}
            min={0}
            max={10}
            step={0.1}
            format={(v) => formatNumber(v, 2)}
            onChange={(v) => {
              setFitting(false)
              setM(v)
            }}
            color={LINE}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 px-3 pt-3 sm:px-4">
          <Button
            size="sm"
            variant="primary"
            icon={fitting ? <Square className="size-4" /> : <Play className="size-4" />}
            onClick={() => (fitting ? setFitting(false) : fit())}
          >
            {fitting ? 'Stop' : 'Fit with gradient descent'}
          </Button>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'model',
                value: (
                  <Tex>{`p = \\sigma(${formatNumber(w, 2)}x - ${formatNumber(w * m, 2)})`}</Tex>
                ),
                color: CURVE,
              },
              { label: 'average loss', value: formatNumber(loss, 3), color: COST },
              {
                label: 'costliest student',
                value: `${formatNumber(bad.x)} h (loss ${formatNumber(bad.loss, 2)})`,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-mid" when={Math.abs(m - 4) < 0.051}>
          Put the 50% point at 4 hours. What score <Tex>{'z'}</Tex> does a 4-hour student get?
        </TryThis>
        <TryThis id="t-loss" when={loss < 0.35}>
          Get the average loss below 0.35, by hand or with gradient descent.
        </TryThis>
        <TryThis id="t-steep" when={w >= 3.5}>
          Make the curve very steep. Which student now costs the most, and why?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const SPLIT = makeData('split')
const inView = constraints.compose(constraints.snapToGrid(0.1), constraints.within(-3, 3, -3, 3))

function PlaneExplorer() {
  const [A, setA] = useState<Vec2>([-2.5, 2])
  const [B, setB] = useState<Vec2>([2.5, 1.5])
  const [k, setK] = useState(2)
  const model = lineModel(A, B, k)
  const { loss, accuracy } = score(SPLIT, model)
  const mid: Vec2 = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]
  const len = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1
  const normal: Vec2 = [-(B[1] - A[1]) / len, (B[0] - A[0]) / len]
  return (
    <LabSection id="plane" eyebrow="Explore" title="Two inputs: a boundary line">
      <Prose>
        <p>
          Now each point has two measurements. A logistic model with two inputs scores each point by
          its signed distance from a line, then squashes the score. Drag the two handles to move the
          line; the arrow points to the side the model calls orange. The steepness sets how quickly
          the shading goes from unsure (pale) to confident (strong).
        </p>
      </Prose>
      <Figure>
        <div className="mx-auto w-full max-w-md">
          <Plot
            view={{ xMin: -3.2, xMax: 3.2, yMin: -3.2, yMax: 3.2 }}
            aspect="equal"
            ariaLabel={`Boundary line classifier with ${pct(accuracy)} accuracy`}
          >
            <ProbabilityMap prob={model} deps={[A[0], A[1], B[0], B[1], k]} />
            <InfiniteLine
              through={A}
              direction={[B[0] - A[0], B[1] - A[1]]}
              color={LINE}
              width={2}
              dashed
            />
            <Vector
              from={mid}
              to={[mid[0] + 0.8 * normal[0], mid[1] + 0.8 * normal[1]]}
              color={PASS}
            />
            <DataPoints data={SPLIT} />
            <MovablePoint
              x={A[0]}
              y={A[1]}
              onMove={(x, y) => setA([x, y])}
              constrain={inView}
              color={LINE}
              label="First handle of the boundary line"
            />
            <MovablePoint
              x={B[0]}
              y={B[1]}
              onMove={(x, y) => setB([x, y])}
              constrain={inView}
              color={LINE}
              label="Second handle of the boundary line"
            />
          </Plot>
        </div>
        <div className="border-t border-line px-3 pt-3 sm:px-4">
          <Slider
            label={<Tex>{'\\text{steepness } k'}</Tex>}
            name="Steepness k"
            value={k}
            min={0.5}
            max={6}
            step={0.5}
            onChange={setK}
            color={CURVE}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'accuracy', value: pct(accuracy) },
              { label: 'average loss', value: formatNumber(loss, 3), color: COST },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-ninety" when={accuracy >= 0.9}>
          Place the line so that at least 90% of the points are on their own side.
        </TryThis>
        <TryThis id="t-flip" when={accuracy <= 0.2}>
          Swap the handles so the arrow points the wrong way. What happens to the accuracy?
        </TryThis>
        <TryThis id="t-confident" when={accuracy >= 0.9 && k >= 5}>
          With a good line, turn the steepness up to 5 or more. Does the loss go up or down? Why
          isn't steeper always better?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [w, setW] = useState(0.5)
  const [m, setM] = useState(7)
  const p6 = sigmoid(w * (6 - m))
  const solved = Math.abs(m - 4) < 0.051 && sigmoid(w * 2) >= 0.95
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-zero"
          index={1}
          prompt="What is $\sigma(0)$?"
          answer={0.5}
          tolerance={0.001}
          explanation="$\sigma(0) = \tfrac{1}{1 + e^0} = \tfrac12$: a score of zero means 50/50."
        />
        <NumericChallenge
          id="c-two"
          index={2}
          prompt="What is $\sigma(2)$, to 3 decimal places?"
          answer={sigmoid(2)}
          tolerance={0.002}
          explanation="$\tfrac{1}{1 + e^{-2}} = \tfrac{1}{1.135} \approx 0.881$."
        />
        <NumericChallenge
          id="c-boundary"
          index={3}
          prompt="A model predicts $p = \sigma(2x - 6)$. At what $x$ is $p = 0.5$?"
          answer={3}
          explanation="$p = 0.5$ exactly when the score is 0: $2x - 6 = 0$, so $x = 3$."
        />
        <NumericChallenge
          id="c-odds"
          index={4}
          prompt="A model gives $p = 0.8$. What are the odds $\tfrac{p}{1 - p}$?"
          answer={4}
          tolerance={0.001}
          explanation="$\tfrac{0.8}{0.2} = 4$: four to one. The log-odds, $\ln 4 \approx 1.39$, is the score $z$."
        />
        <McqChallenge
          id="c-loss"
          index={5}
          prompt="Which prediction has the largest log loss?"
          options={[
            { text: '$p = 0.05$ for a point that is actually class 1', correct: true },
            {
              text: '$p = 0.6$ for a point that is actually class 1',
              why: 'Unsure but right-leaning: loss $-\\ln 0.6 \\approx 0.51$.',
            },
            {
              text: '$p = 0.4$ for a point that is actually class 0',
              why: 'Right side: loss $-\\ln 0.6 \\approx 0.51$.',
            },
            {
              text: '$p = 0.95$ for a point that is actually class 1',
              why: 'Confident and right: loss $\\approx 0.05$.',
            },
          ]}
          explanation="$-\ln 0.05 \approx 3.0$. A confident wrong answer costs far more than an unsure one."
        />
        <InteractiveChallenge
          id="c-tune"
          index={6}
          prompt="Set the 50% point to 4 hours, and make the curve steep enough that a 6-hour student gets at least a 95% chance."
          solved={solved}
          hint="At 6 hours the score is $w(6 - 4) = 2w$, and $\sigma(3) \approx 0.95$."
          explanation="With the midpoint at 4, a 6-hour student scores $2w$. You need $\sigma(2w) \ge 0.95$, so $w \ge 1.5$."
          onReset={() => {
            setW(0.5)
            setM(7)
          }}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <StudyPlot w={w} m={m} />
            <div className="grid gap-x-6 gap-y-3 border-t border-line p-3 sm:grid-cols-2">
              <Slider
                label="Steepness w"
                value={w}
                min={0.1}
                max={5}
                step={0.1}
                onChange={setW}
                color={CURVE}
              />
              <Slider
                label="50% point (hours)"
                value={m}
                min={0}
                max={10}
                step={0.1}
                onChange={setM}
                color={LINE}
              />
            </div>
            <p className="border-t border-line px-3 py-2 text-sm">
              P(pass) after 6 hours: {pct(p6)}
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

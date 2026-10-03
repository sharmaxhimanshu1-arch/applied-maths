import { useState } from 'react'
import { add, dot, eigen2, heading, scale, sub, type Mat2, type Vec2 } from '@/math/linalg'
import { createRng } from '@/math/random'
import { covariance, mean, variance } from '@/math/stats'
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
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import {
  FunctionGraph,
  InfiniteLine,
  MovablePoint,
  ParametricCurve,
  Plot,
  Point,
  Segment,
  Vector,
  constraints,
  ease,
  usePlayback,
} from '@/viz'
import { percent } from '../_shared/fraction'
import { mat, num } from '../_shared/tex'

const DOT = 'var(--c-blue)'
const PC1 = 'var(--c-violet)'
const PC2 = 'var(--c-aqua)'
const LINE = 'var(--c-orange)'
const VIEW = { xMin: -6.5, xMax: 6.5, yMin: -4.2, yMax: 4.2 }

/** A correlated cloud: spread `major` along `angle` (degrees), `minor` across it. */
function cloud(
  seed: number,
  n: number,
  angleDeg: number,
  major: number,
  minor: number,
  centre: Vec2 = [0, 0],
): Vec2[] {
  const rng = createRng(seed)
  const a = (angleDeg * Math.PI) / 180
  return Array.from({ length: n }, () => {
    const u = rng.normal(0, major)
    const v = rng.normal(0, minor)
    const x = centre[0] + u * Math.cos(a) - v * Math.sin(a)
    const y = centre[1] + u * Math.sin(a) + v * Math.cos(a)
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10] as Vec2
  })
}

function analyse(points: readonly Vec2[]) {
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const centre: Vec2 = [mean(xs), mean(ys)]
  const cov: Mat2 = [variance(xs), covariance(xs, ys), covariance(xs, ys), variance(ys)]
  const e = eigen2(cov)
  const values: [number, number] = e.kind === 'real' ? e.values : [cov[0], cov[3]]
  const v1: Vec2 = e.kind === 'real' && e.vectors[0] ? e.vectors[0] : [1, 0]
  const pc1: Vec2 = v1[0] < 0 ? [-v1[0], -v1[1]] : v1
  const pc2: Vec2 = [-pc1[1], pc1[0]]
  return { centre, cov, values, pc1, pc2 }
}

const unitAt = (deg: number): Vec2 => [
  Math.cos((deg * Math.PI) / 180),
  Math.sin((deg * Math.PI) / 180),
]
/** Angle of a direction as a line, in [0, 180). */
const lineDeg = (v: Vec2) => ((((heading(v) * 180) / Math.PI) % 180) + 180) % 180
/** Full heading of a vector in [0, 360). */
const fullDeg = (v: Vec2) => ((((heading(v) * 180) / Math.PI) % 360) + 360) % 360
const lineGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % 180
  return Math.min(d, 180 - d)
}

/** Data, a line through the centre at `deg`, the projections onto it, and a handle to turn it. */
function ProjectionPlot({
  points,
  deg,
  onDeg,
  squash = 0,
}: {
  points: readonly Vec2[]
  deg: number
  onDeg: (d: number) => void
  squash?: number
}) {
  const { centre } = analyse(points)
  const u = unitAt(deg)
  const handle = add(centre, scale(u, 3.6))
  const projected = points.map((p) => add(centre, scale(u, dot(sub(p, centre), u))))
  return (
    <Plot
      view={VIEW}
      aspect="equal"
      ariaLabel={`Data with a line through its centre at ${num(deg, 0)} degrees`}
    >
      <InfiniteLine through={centre} direction={u} color={LINE} width={2.5} />
      {squash < 1 &&
        points.map((p, i) => (
          <Segment key={`r${i}`} from={p} to={projected[i]} color="var(--ink-3)" dashed width={1} />
        ))}
      {projected.map((q, i) => (
        <Point key={`q${i}`} at={q} r={3} color={PC1} />
      ))}
      {points.map((p, i) => {
        const at = squash > 0 ? add(p, scale(sub(projected[i], p), squash)) : p
        return <Point key={i} at={at} r={4.5} color={DOT} />
      })}
      <MovablePoint
        x={handle[0]}
        y={handle[1]}
        onMove={(x, y) => onDeg(fullDeg([x - centre[0], y - centre[1]]))}
        constrain={constraints.onCircle(centre, 3.6)}
        step={0.2}
        color={LINE}
        size={8}
        label="Handle that turns the line"
      />
    </Plot>
  )
}

/** Variance captured along the line, for every angle. */
function SpreadByAngle({ points, deg }: { points: readonly Vec2[]; deg: number }) {
  const { cov, values } = analyse(points)
  const along = (d: number) => {
    const u = unitAt(d)
    return u[0] * u[0] * cov[0] + 2 * u[0] * u[1] * cov[1] + u[1] * u[1] * cov[3]
  }
  return (
    <Plot
      view={{ xMin: -5, xMax: 185, yMin: -values[0] * 0.08, yMax: values[0] * 1.2 }}
      height={150}
      xLabel="angle of the line (°)"
      ariaLabel={`Spread along the line is ${num(along(deg))} at ${num(deg, 0)} degrees; the maximum is ${num(values[0])}`}
    >
      <FunctionGraph fn={along} domain={[0, 180]} color={PC1} width={2.25} />
      <Segment from={[deg % 180, 0]} to={[deg % 180, along(deg)]} color={LINE} width={2} />
      <Point at={[deg % 180, along(deg)]} r={5} color={LINE} />
    </Plot>
  )
}

const CLOUD = cloud(31, 40, 32, 2.1, 0.7)

export default function PcaLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Find where the data really varies">
        <Prose>
          <p>
            Each point here has two numbers, but they're far from independent: the cloud is
            stretched along one diagonal direction. If you rotated your axes to line up with that
            stretch, one new coordinate would carry most of the information, and the other would be
            almost noise.
          </p>
          <p>
            <strong>Principal component analysis</strong> (PCA) finds those directions
            automatically. The first <em>principal component</em> is the direction in which the data
            spreads out most. It is an eigenvector of the data's covariance matrix, which is where
            linear algebra and statistics meet.
          </p>
        </Prose>
      </LabSection>
      <SpinExplorer />
      <CovarianceExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="PCA in three steps">
        <Formula
          tex={
            '\\Sigma = \\begin{bmatrix} \\text{var}(x) & \\text{cov}(x, y) \\\\ \\text{cov}(x, y) & \\text{var}(y) \\end{bmatrix}'
          }
          caption="1. Centre the data and compute its covariance matrix."
        />
        <Formula
          tex={
            '\\text{spread along a unit vector } \\vec u = \\vec u^{\\mathsf T}\\, \\Sigma\\, \\vec u'
          }
          caption="2. The spread along a direction is a quadratic form; it is largest along the top eigenvector of Σ."
        />
        <Formula
          tex={'\\text{explained} = \\frac{\\lambda_1}{\\lambda_1 + \\lambda_2}'}
          caption="3. The eigenvalues are the variances along the principal components. Keep the components that explain most of the total."
        />
        <Prose>
          <p>
            Because the total variance is fixed, the line that keeps the most spread is the same
            line that leaves the least squared distance behind. With hundreds of features (pixels,
            genes, survey answers), PCA keeps the top few components and throws the rest away.
          </p>
        </Prose>
        <Callout kind="misconception" title="Not the regression line">
          <p>
            PCA's line minimises <em>perpendicular</em> distances and treats <Tex>x</Tex> and{' '}
            <Tex>y</Tex> alike. Regression minimises <em>vertical</em> distances to predict{' '}
            <Tex>y</Tex> from <Tex>x</Tex>. For the same cloud they point in slightly different
            directions.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet PCA">
        <RealWorld
          items={[
            {
              title: 'Faces',
              body: '“Eigenfaces”: a few principal components of thousands of face photos capture most of the ways faces differ.',
            },
            {
              title: 'Genetics',
              body: 'PCA of DNA from thousands of people, plotted on the first two components, roughly redraws the map of Europe.',
            },
            {
              title: 'Finance',
              body: 'Most of the daily movement of hundreds of interest rates is explained by three components: level, slope and curvature.',
            },
            {
              title: 'Data visualisation',
              body: 'Squash 50-dimensional data onto its top two components and you can see clusters on a flat screen.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'PC1 is the direction of greatest spread; PC2 is perpendicular to it.',
            'The principal components are the eigenvectors of the covariance matrix.',
            'Each eigenvalue is the variance along its component.',
            'Projecting onto the top components compresses data while keeping most of its variation.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function SpinExplorer() {
  const [deg, setDeg] = useState(150)
  const [squash, setSquash] = useState(false)
  const playback = usePlayback(0.9)
  const { cov, values, pc1 } = analyse(CLOUD)
  const u = unitAt(deg)
  const along = u[0] * u[0] * cov[0] + 2 * u[0] * u[1] * cov[1] + u[1] * u[1] * cov[3]
  const total = values[0] + values[1]
  const best = lineDeg(pc1)
  const atBest = lineGap(deg, best) < 1
  const atWorst = lineGap(deg, best + 90) < 1
  return (
    <LabSection id="explore" eyebrow="Explore" title="Spin the line, catch the spread">
      <Prose>
        <p>
          Turn the orange line with its handle. Each blue point drops a perpendicular onto the line;
          the purple dots are where they land. The more spread out the purple dots, the more of the
          data's variation the line has kept.
        </p>
      </Prose>
      <PredictReveal
        question="When the purple dots are as spread out as possible, what happens to the dashed distances to the line?"
        options={[
          'They are as short as possible',
          'They are as long as possible',
          'They don’t change',
        ]}
        answer={0}
        explanation="Every point's squared distance from the centre splits into “along the line” plus “across the line” (Pythagoras). The total is fixed, so the most spread along the line means the least distance across it."
      />
      <Figure>
        <ProjectionPlot
          points={CLOUD}
          deg={deg}
          onDeg={setDeg}
          squash={squash ? ease(playback.t) : 0}
        />
        <div className="border-t border-line">
          <SpreadByAngle points={CLOUD} deg={deg} />
        </div>
        <div className="grid gap-3 border-t border-line p-3 sm:p-4">
          <Switch
            label="Squash the points onto the line"
            checked={squash}
            onChange={(v) => {
              setSquash(v)
              if (v) playback.play()
              else playback.reset()
            }}
          />
          <div className="grid gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium" style={{ color: PC1 }}>
                kept along the line {percent(along / total, 0)}
              </span>
              <span className="font-medium text-ink-2">
                lost across it {percent(1 - along / total, 0)}
              </span>
            </div>
            <div
              className="flex h-3.5 overflow-hidden rounded-full bg-surface-3"
              role="img"
              aria-label={`${percent(along / total, 0)} of the variance kept`}
            >
              <div
                className="h-full transition-[width] duration-200"
                style={{ width: `${(along / total) * 100}%`, background: PC1 }}
              />
            </div>
          </div>
          <Readouts
            items={[
              { label: 'line angle', value: `${num(deg % 180, 0)}°` },
              { label: 'spread along the line', value: num(along), color: PC1 },
              { label: 'total spread', value: num(total) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-max" when={atBest}>
          Find the angle that keeps the most spread. That's the first principal component.
        </TryThis>
        <TryThis id="t-min" when={atWorst}>
          Find the angle that keeps the least. How is it related to the best one?
        </TryThis>
        <TryThis id="t-squash" when={squash && atBest && playback.t >= 1}>
          At the best angle, squash the points onto the line: each point is now described by one
          number instead of two, yet the picture barely changes.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const EDITABLE = cloud(7, 14, -25, 1.9, 0.8)

function CovarianceExplorer() {
  const [points, setPoints] = useState<Vec2[]>(EDITABLE)
  const { centre, cov, values, pc1, pc2 } = analyse(points)
  const [l1, l2] = values
  const s1 = Math.sqrt(Math.max(0, l1))
  const s2 = Math.sqrt(Math.max(0, l2))
  const explained = l1 / (l1 + l2 || 1)
  const snap = constraints.compose(constraints.snapToGrid(0.1), constraints.within(-6, 6, -4, 4))
  return (
    <LabSection id="eigen" eyebrow="Explore" title="The covariance matrix knows the answer">
      <Prose>
        <p>
          No spinning needed: the covariance matrix of the data has two eigenvectors, and they are
          exactly the best and worst directions. The arrows show them, each scaled by the spread in
          its direction; the ellipse covers about two standard deviations. Drag the points and watch
          the matrix and the arrows respond.
        </p>
      </Prose>
      <Figure>
        <Plot
          view={VIEW}
          aspect="equal"
          ariaLabel={`Data with principal components; the first explains ${percent(explained, 0)} of the variance`}
        >
          <ParametricCurve
            x={(t) => centre[0] + 2 * s1 * Math.cos(t) * pc1[0] + 2 * s2 * Math.sin(t) * pc2[0]}
            y={(t) => centre[1] + 2 * s1 * Math.cos(t) * pc1[1] + 2 * s2 * Math.sin(t) * pc2[1]}
            tMin={0}
            tMax={2 * Math.PI}
            color={PC1}
            width={1.5}
            dashed
          />
          <Vector from={centre} to={add(centre, scale(pc1, 2 * s1))} color={PC1} width={3} />
          <Vector from={centre} to={add(centre, scale(pc2, 2 * s2))} color={PC2} width={3} />
          {points.map((p, i) => (
            <MovablePoint
              key={i}
              x={p[0]}
              y={p[1]}
              onMove={(x, y) => setPoints((ps) => ps.map((q, k) => (k === i ? [x, y] : q)))}
              constrain={snap}
              step={0.1}
              color={DOT}
              size={5.5}
              label={`Data point ${i + 1}`}
            />
          ))}
        </Plot>
        <div className="grid gap-3 border-t border-line p-3 sm:p-4">
          <div className="overflow-x-auto text-[0.95rem]">
            <Tex
              display
            >{`\\Sigma = ${mat(cov, 2)} \\qquad \\lambda_1 = ${num(l1)},\\; \\lambda_2 = ${num(l2)}`}</Tex>
          </div>
          <Readouts
            items={[
              { label: 'PC1 direction', value: `(${num(pc1[0])}, ${num(pc1[1])})`, color: PC1 },
              { label: 'PC2 direction', value: `(${num(pc2[0])}, ${num(pc2[1])})`, color: PC2 },
              { label: 'explained by PC1', value: percent(explained, 0), color: PC1 },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-round" when={l2 / l1 > 0.8}>
          Drag points until the cloud is roughly round. What happens to the two arrows?
        </TryThis>
        <TryThis id="t-thin" when={explained >= 0.97}>
          Line the points up so PC1 explains at least 97%. How long is the PC2 arrow now?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const PRACTICE = cloud(99, 30, 65, 1.8, 0.6, [0.5, -0.3])

function Practice() {
  const [deg, setDeg] = useState(10)
  const best = lineDeg(analyse(PRACTICE).pc1)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <McqChallenge
          id="c-pc1"
          index={1}
          prompt="The first principal component of a data set is the direction in which…"
          options={[
            { text: 'the data has the most variance', correct: true },
            {
              text: 'the data has the least variance',
              why: 'That is the last principal component.',
            },
            { text: 'the data has the most points', why: 'PCA looks at spread, not counts.' },
            {
              text: 'y is best predicted from x',
              why: 'That is regression, which measures vertical errors.',
            },
          ]}
          explanation="PC1 maximises the spread of the projected data."
        />
        <NumericChallenge
          id="c-explained"
          index={2}
          prompt="A covariance matrix has eigenvalues 9 and 1. What fraction of the variance does PC1 explain? (A decimal like 0.5 is fine.)"
          answer={0.9}
          tolerance={0.001}
          explanation="$\frac{9}{9 + 1} = 0.9$: 90% of the variation lies along PC1."
        />
        <McqChallenge
          id="c-pc2"
          index={3}
          prompt="In 2D, how is the second principal component related to the first?"
          options={[
            { text: 'It is perpendicular to it', correct: true },
            {
              text: 'It points the opposite way',
              why: 'Opposite directions are the same line; PC2 is a different line.',
            },
            {
              text: 'It is at 45° to it',
              why: 'Eigenvectors of a symmetric matrix are at right angles.',
            },
            {
              text: 'It is unrelated',
              why: 'For a covariance matrix, the eigenvectors are always perpendicular.',
            },
          ]}
          explanation="The covariance matrix is symmetric, so its eigenvectors are perpendicular."
        />
        <McqChallenge
          id="c-line"
          index={4}
          prompt="All the data points lie exactly on one straight line. What is the second eigenvalue of the covariance matrix?"
          options={[
            { text: '0', correct: true },
            { text: '1', why: 'Eigenvalues are variances; across the line there is none.' },
            { text: 'The same as the first', why: 'That would describe a round cloud.' },
            {
              text: 'It can’t be computed',
              why: 'It can: it is the variance perpendicular to the line.',
            },
          ]}
          explanation="There is no spread across the line, so the variance in that direction, $\lambda_2$, is 0. PC1 explains 100%."
        />
        <InteractiveChallenge
          id="c-find-pc1"
          index={5}
          prompt="Turn the line to this cloud's **first principal component** (within 1°)."
          solved={lineGap(deg, best) < 1}
          hint="Watch the purple dots: make them as spread out as possible, or the dashed distances as short as possible."
          explanation={`The first principal component here is at about ${num(best, 0)}°, along the long axis of the cloud.`}
          onReset={() => setDeg(10)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <ProjectionPlot points={PRACTICE} deg={deg} onDeg={setDeg} />
            <div className="border-t border-line">
              <SpreadByAngle points={PRACTICE} deg={deg} />
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

import { useState } from 'react'
import { Pause, Play } from 'lucide-react'
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
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { AreaUnder, Circle, FunctionGraph, Plot, Point, Segment, useAnimationFrame } from '@/viz'
import {
  TARGET,
  TAU,
  partial,
  peak,
  rmsError,
  sineCoefficient,
  term,
  terms,
  type Wave,
} from '../_shared/fourier'

const TARGET_COL = 'var(--ink-3)'
const SUM = 'var(--c-violet)'
const NEWEST = 'var(--c-orange)'
const POS = 'var(--c-blue)'
const NEG = 'var(--c-red)'

const WAVES: { value: Wave; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'sawtooth', label: 'Sawtooth' },
  { value: 'triangle', label: 'Triangle' },
]

const SERIES_TEX: Record<Wave, string> = {
  square:
    '\\frac{4}{\\pi}\\left(\\sin x + \\frac{\\sin 3x}{3} + \\frac{\\sin 5x}{5} + \\cdots\\right)',
  sawtooth:
    '\\frac{2}{\\pi}\\left(\\sin x - \\frac{\\sin 2x}{2} + \\frac{\\sin 3x}{3} - \\cdots\\right)',
  triangle:
    '\\frac{8}{\\pi^2}\\left(\\sin x - \\frac{\\sin 3x}{9} + \\frac{\\sin 5x}{25} - \\cdots\\right)',
}

/** Where each target wave jumps: every multiple of π (square), odd multiples (sawtooth). */
function jumpsBetween(wave: Wave, from: number, to: number): number[] {
  if (wave === 'triangle') return []
  const out: number[] = []
  for (let k = Math.ceil(from / Math.PI); k * Math.PI < to; k++) {
    if (k * Math.PI <= from) continue
    if (wave === 'square' || k % 2 !== 0) out.push(k * Math.PI)
  }
  return out
}

/** The target wave, dashed grey, drawn piece by piece so the jumps stay gaps. */
function TargetWave({ wave, from, to }: { wave: Wave; from: number; to: number }) {
  const cuts = [from, ...jumpsBetween(wave, from, to), to]
  return (
    <>
      {cuts.slice(0, -1).map((a, i) => (
        <FunctionGraph
          key={a}
          fn={TARGET[wave]}
          domain={[a + 1e-6, cuts[i + 1] - 1e-6]}
          color={TARGET_COL}
          width={2}
          dashed
        />
      ))}
    </>
  )
}

export default function FourierSeriesLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Any wave from sine waves">
        <Prose>
          <p>
            A violin and a flute can play the same note and still sound different. The difference is
            in the <em>mixture</em>: each instrument adds a different blend of higher pitches,
            called harmonics, on top of the main one.
          </p>
          <p>
            Joseph Fourier claimed something bold in 1807: <strong>any</strong> repeating wave, even
            one with sharp corners or sudden jumps, is a sum of plain sine waves at whole-number
            multiples of its frequency. Find the right amounts of each and you can rebuild the wave,
            compress it, or filter parts of it out.
          </p>
        </Prose>
      </LabSection>
      <BuildExplorer />
      <EpicycleExplorer />
      <CoefficientExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The Fourier series">
        <Formula
          tex={'f(x) = \\frac{a_0}{2} + \\sum_{k=1}^{\\infty}\\big(a_k\\cos kx + b_k\\sin kx\\big)'}
          caption="A wave with period 2π as a sum of harmonics."
        />
        <Formula
          tex={
            'b_k = \\frac{1}{\\pi}\\int_0^{2\\pi} f(x)\\sin kx\\,dx \\qquad a_k = \\frac{1}{\\pi}\\int_0^{2\\pi} f(x)\\cos kx\\,dx'
          }
          caption="Each coefficient measures how much f looks like that harmonic."
        />
        <Prose>
          <ul>
            <li>
              <strong>Why the integrals work:</strong> different harmonics are <em>orthogonal</em>.
              Over a full period, <Tex>{'\\sin jx\\,\\sin kx'}</Tex> integrates to zero unless{' '}
              <Tex>{'j = k'}</Tex>, so multiplying by <Tex>{'\\sin kx'}</Tex> and integrating picks
              out exactly the <Tex>{'k'}</Tex>-th amount, like a dot product picking out one
              coordinate.
            </li>
            <li>
              <strong>Symmetry saves work:</strong> the square wave is odd, so it has no cosines,
              and its half-wave symmetry kills every even harmonic: only{' '}
              <Tex>{'\\sin x, \\sin 3x, \\sin 5x, \\ldots'}</Tex> appear.
            </li>
            <li>
              <strong>Smooth waves converge fast:</strong> corners give coefficients falling like{' '}
              <Tex>{'1/k^2'}</Tex> (the triangle); jumps only like <Tex>{'1/k'}</Tex> (the square
              and sawtooth), so they need many more terms.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="More terms don't remove the overshoot">
          <p>
            Near a jump the partial sums always overshoot by about 9% of the jump, however many
            terms you add (the Gibbs phenomenon). The wiggle gets narrower and squeezes towards the
            jump, so the average error still shrinks to zero; the peak just never goes away.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where Fourier works">
        <RealWorld
          items={[
            {
              title: 'Music and audio',
              body: 'Equalisers boost or cut bands of harmonics; MP3 throws away the ones your ears won’t notice.',
            },
            {
              title: 'Images',
              body: 'JPEG stores each 8 × 8 block as a sum of cosine patterns and keeps only the strongest few.',
            },
            {
              title: 'Engineering',
              body: 'Bridges and buildings are checked for resonance by breaking vibrations into frequencies.',
            },
            {
              title: 'Medicine',
              body: 'MRI scanners measure an image’s frequency content and use a Fourier transform to turn it into a picture.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Any reasonable periodic wave is a sum of sines and cosines at whole-number frequencies.',
            'Each coefficient is an integral: $b_k = \\frac1\\pi\\int f(x)\\sin kx\\,dx$.',
            'Smooth waves need few terms; jumps need many, and always overshoot by about 9%.',
            'Rotating circles (epicycles) are another picture of the same sum.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function BuildExplorer() {
  const [wave, setWave] = useState<Wave>('square')
  const [n, setN] = useState(1)
  const f = partial(wave, n)
  const last = term(wave, n - 1)
  const err = rmsError(wave, n)
  const over = wave === 'square' ? peak(wave, n) - 1 : null
  return (
    <LabSection id="explore" eyebrow="Explore" title="Build a wave, one harmonic at a time">
      <Prose>
        <p>
          The grey dashed line is the wave we want. The violet line is the sum of the first few sine
          waves of its Fourier series; the orange line is the harmonic you added last. Add terms and
          watch the corners sharpen.
        </p>
      </Prose>
      <PredictReveal
        question="Keep adding sine waves to the square wave. What happens to the little overshoot right next to each jump?"
        options={[
          'It shrinks to nothing',
          'It stays about the same height, but gets narrower',
          'It grows without limit',
        ]}
        answer={1}
        explanation="This is the Gibbs phenomenon. The overshoot stays near 9% of the jump forever; it just gets squeezed into a thinner and thinner spike."
      />
      <Figure>
        <div className="space-y-2 px-3 pt-3 sm:px-4">
          <Segmented
            label="Target wave"
            value={wave}
            onChange={(w) => {
              setWave(w)
              setN(1)
            }}
            options={WAVES}
          />
          <div className="overflow-x-auto text-center">
            <Tex display>{SERIES_TEX[wave]}</Tex>
          </div>
        </div>
        <Plot
          view={{ xMin: -0.2, xMax: 4 * Math.PI + 0.2, yMin: -1.5, yMax: 1.5 }}
          narrowView={{ xMin: -0.2, xMax: TAU + 0.2, yMin: -1.5, yMax: 1.5 }}
          height={280}
          piTicks
          ariaLabel={`${n} terms of the ${wave} wave's Fourier series, root-mean-square error ${formatNumber(err, 3)}`}
        >
          <TargetWave wave={wave} from={0} to={4 * Math.PI} />
          <FunctionGraph
            fn={(x) => last.amp * Math.sin(last.freq * x)}
            color={NEWEST}
            width={1.5}
            opacity={0.8}
          />
          <FunctionGraph fn={f} color={SUM} width={3} samples={1200} />
        </Plot>
        <div className="border-t border-line px-3 pt-3 sm:px-4">
          <Slider
            label="Number of sine waves"
            value={n}
            min={1}
            max={30}
            step={1}
            onChange={setN}
            color={SUM}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'newest harmonic',
                value: (
                  <Tex>{`${formatNumber(last.amp, 3)}\\sin ${last.freq === 1 ? '' : last.freq}x`}</Tex>
                ),
                color: NEWEST,
              },
              { label: 'RMS error', value: formatNumber(err, 3) },
              ...(over == null
                ? []
                : [
                    {
                      label: 'overshoot',
                      value: `${formatNumber((over / 2) * 100, 1)}% of the jump`,
                    },
                  ]),
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-gibbs" when={wave === 'square' && n >= 20}>
          Use 20 or more terms on the square wave. Is the overshoot at the jumps gone?
        </TryThis>
        <TryThis id="t-triangle" when={wave === 'triangle' && err < 0.02}>
          Get the triangle wave within 0.02 RMS. How few terms does it need compared with the
          square?
        </TryThis>
        <TryThis id="t-saw" when={wave === 'sawtooth' && n >= 2}>
          Build the sawtooth. Which harmonics does it use that the square wave skips?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const CX = -2.6
const SPEED = 1.2

function EpicycleExplorer() {
  const [wave, setWave] = useState<Wave>('square')
  const [n, setN] = useState(3)
  const [t, setT] = useState(0.9)
  const [playing, setPlaying] = useState(false)
  const [played, setPlayed] = useState(false)
  useAnimationFrame((dt) => setT((v) => (v + dt * SPEED) % TAU), playing)
  const ts = terms(wave, n)
  // Chain the circles: each one is centred on the tip of the one before.
  const centres = ts.reduce<[number, number][]>(
    (acc, k) => {
      const [x, y] = acc[acc.length - 1]
      return [...acc, [x + k.amp * Math.cos(k.freq * t), y + k.amp * Math.sin(k.freq * t)]]
    },
    [[CX, 0]],
  )
  const tip = centres[centres.length - 1]
  const f = partial(wave, n)
  return (
    <LabSection id="epicycles" eyebrow="Explore" title="Circles on circles">
      <Prose>
        <p>
          Each sine wave is the height of a point going round a circle. Stack the circles, each one
          riding on the rim of the last, with radius = amplitude and speed = frequency. The height
          of the final tip, carried across to the right, draws the wave.
        </p>
      </Prose>
      <Figure>
        <div className="flex flex-wrap items-center gap-3 px-3 pt-3 sm:px-4">
          <Segmented label="Wave" size="sm" value={wave} onChange={setWave} options={WAVES} />
          <Button
            size="sm"
            variant="primary"
            icon={playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            onClick={() => {
              setPlaying(!playing)
              setPlayed(true)
            }}
          >
            {playing ? 'Pause' : 'Play'}
          </Button>
        </div>
        <Plot
          view={{ xMin: -4.4, xMax: 7.4, yMin: -1.8, yMax: 1.8 }}
          narrowView={{ xMin: -4.3, xMax: 3.2, yMin: -1.8, yMax: 1.8 }}
          aspect="equal"
          grid={false}
          axes={false}
          ariaLabel={`${n} rotating circles drawing a ${wave} wave`}
        >
          {ts.map((k, i) => (
            <Circle
              key={i}
              center={centres[i]}
              r={Math.abs(k.amp)}
              stroke="var(--ink-3)"
              strokeWidth={1}
            />
          ))}
          {ts.map((_, i) => (
            <Segment
              key={`arm-${i}`}
              from={centres[i]}
              to={centres[i + 1]}
              color={SUM}
              width={1.5}
            />
          ))}
          <Segment from={tip} to={[0, tip[1]]} color={NEWEST} width={1} dashed />
          <FunctionGraph
            fn={(x) => f(t - x / 1.1)}
            domain={[0, 7.4]}
            color={SUM}
            width={2.5}
            samples={800}
          />
          <Point at={tip} r={4} color={NEWEST} />
          <Point at={[0, tip[1]]} r={4} color={NEWEST} />
        </Plot>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 py-3 sm:grid-cols-2 sm:px-4">
          <Slider label="Circles" value={n} min={1} max={12} step={1} onChange={setN} color={SUM} />
          <Slider
            label="Time"
            value={t}
            min={0}
            max={TAU}
            step={0.01}
            format={(v) => formatNumber(v, 2)}
            onChange={(v) => {
              setPlaying(false)
              setT(v)
            }}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-one-circle" when={n === 1}>
          Use a single circle. What wave does the tip draw?
        </TryThis>
        <TryThis id="t-many" when={played && n >= 8}>
          Play with 8 or more circles. Which circles are tiny, and why do they still matter?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function CoefficientExplorer() {
  const [k, setK] = useState(3)
  const f = TARGET.square
  const prod = (x: number) => f(x) * Math.sin(k * x)
  const bk = sineCoefficient(f, k)
  return (
    <LabSection id="coefficient" eyebrow="Explore" title="Measure a harmonic with an integral">
      <Prose>
        <p>
          How much <Tex>{'\\sin kx'}</Tex> is hiding in the square wave? Multiply the wave by{' '}
          <Tex>{'\\sin kx'}</Tex> and add up the area over one period (blue above the axis counts
          positive, red below counts negative). Divide by <Tex>{'\\pi'}</Tex> and you get the
          coefficient <Tex>{'b_k'}</Tex>.
        </p>
      </Prose>
      <Figure>
        <Plot
          view={{ xMin: -0.2, xMax: TAU + 0.2, yMin: -1.4, yMax: 1.4 }}
          height={260}
          piTicks
          ariaLabel={`Square wave times sin ${k}x; coefficient ${formatNumber(bk, 3)}`}
        >
          <AreaUnder fn={(x) => Math.max(0, prod(x))} a={0} b={TAU} color={POS} opacity={0.3} />
          <AreaUnder fn={(x) => Math.min(0, prod(x))} a={0} b={TAU} color={NEG} opacity={0.3} />
          <TargetWave wave="square" from={0} to={TAU} />
          <FunctionGraph fn={(x) => Math.sin(k * x)} color={NEWEST} width={1.5} />
          <FunctionGraph fn={prod} domain={[1e-6, Math.PI - 1e-6]} color={SUM} width={2.5} />
          <FunctionGraph fn={prod} domain={[Math.PI + 1e-6, TAU - 1e-6]} color={SUM} width={2.5} />
        </Plot>
        <div className="border-t border-line px-3 pt-3 sm:px-4">
          <Slider
            label={<Tex>{'k'}</Tex>}
            name="Harmonic k"
            value={k}
            min={1}
            max={7}
            step={1}
            onChange={setK}
            color={NEWEST}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'net area', value: formatNumber(bk * Math.PI, 3) },
              {
                label: 'b_k = area ÷ π',
                value: formatNumber(Math.abs(bk) < 1e-9 ? 0 : bk, 4),
                color: SUM,
              },
              {
                label: 'formula 4/(πk) for odd k',
                value: k % 2 ? formatNumber(4 / (Math.PI * k), 4) : '0 (even k)',
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-even" when={k % 2 === 0}>
          Pick an even <Tex>{'k'}</Tex>. Why do the blue and red areas cancel exactly?
        </TryThis>
        <TryThis id="t-first" when={k === 1}>
          Set <Tex>{'k = 1'}</Tex>. Compare <Tex>{'b_1'}</Tex> with <Tex>{'4/\\pi'}</Tex>.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [n, setN] = useState(1)
  const err = rmsError('square', n)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-amp"
          index={1}
          prompt="The square wave's series is $\tfrac{4}{\pi}(\sin x + \tfrac{\sin 3x}{3} + \tfrac{\sin 5x}{5} + \cdots)$. What is the amplitude of the $\sin 5x$ term? (3 decimal places)"
          answer={4 / (5 * Math.PI)}
          tolerance={0.002}
          explanation="$\tfrac{4}{5\pi} \approx 0.255$."
        />
        <McqChallenge
          id="c-odd"
          index={2}
          prompt="Which harmonics appear in the square wave?"
          options={[
            { text: 'Only odd ones: sin x, sin 3x, sin 5x, …', correct: true },
            { text: 'Only even ones', why: 'Even harmonics cancel out, as the areas showed.' },
            { text: 'All of them equally', why: 'Their sizes fall like 1/k, and evens are zero.' },
            { text: 'Only cosines', why: 'The square wave is odd, so it has no cosine terms.' },
          ]}
          explanation="Its half-wave symmetry cancels every even harmonic, leaving $\sin x, \sin 3x, \sin 5x, \ldots$"
        />
        <NumericChallenge
          id="c-period"
          index={3}
          prompt="What is the period of $\sin 3x$? (decimal)"
          answer={TAU / 3}
          tolerance={0.01}
          explanation="$\sin 3x$ repeats three times as often as $\sin x$: period $\tfrac{2\pi}{3} \approx 2.094$."
        />
        <McqChallenge
          id="c-gibbs"
          index={4}
          prompt="As you add more terms to the square wave's series, the overshoot next to each jump…"
          options={[
            { text: 'Stays about 9% of the jump but gets narrower', correct: true },
            { text: 'Shrinks to zero', why: 'Its height settles at about 9% of the jump.' },
            { text: 'Moves to the middle of each flat part', why: 'It stays hugging the jump.' },
            { text: 'Grows without limit', why: 'It stays bounded at about 9%.' },
          ]}
          explanation="That is the Gibbs phenomenon: a fixed-height spike squeezed ever closer to the jump."
        />
        <NumericChallenge
          id="c-even-coef"
          index={5}
          prompt="What is the coefficient $b_2$ of the square wave?"
          answer={0}
          explanation="For even $k$ the areas of $f(x)\sin kx$ above and below the axis cancel exactly, so $b_2 = 0$."
        />
        <InteractiveChallenge
          id="c-close"
          index={6}
          prompt="Add sine waves until the square wave's RMS error drops below 0.15."
          solved={err < 0.15}
          hint="The square wave's coefficients only fall like 1/k, so it takes a while."
          explanation="It takes 10 terms (up to $\sin 19x$) to get the RMS error under 0.15. Jumps are expensive."
          onReset={() => setN(1)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <Plot
              view={{ xMin: -0.2, xMax: TAU + 0.2, yMin: -1.5, yMax: 1.5 }}
              height={220}
              piTicks
              ariaLabel={`${n} terms of the square wave, error ${formatNumber(err, 3)}`}
            >
              <TargetWave wave="square" from={0} to={TAU} />
              <FunctionGraph fn={partial('square', n)} color={SUM} width={2.5} samples={1200} />
            </Plot>
            <div className="border-t border-line p-3">
              <Slider
                label="Number of sine waves"
                value={n}
                min={1}
                max={30}
                step={1}
                onChange={setN}
                color={SUM}
              />
              <p className="mt-2 text-sm">RMS error: {formatNumber(err, 3)}</p>
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

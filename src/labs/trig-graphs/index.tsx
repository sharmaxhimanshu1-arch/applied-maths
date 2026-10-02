import { Volume2 } from 'lucide-react'
import { useState } from 'react'
import { TAU } from '@/math/core'
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
import { radToNice } from '@/tools/unit-circle/trig'
import { UnitCircle, type UnitCircleState } from '@/tools/unit-circle/UnitCircle'
import { Button } from '@/ui/Button'
import { Slider } from '@/ui/Slider'
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import { FunctionGraph, Plot, Segment } from '@/viz'
import { num } from '../_shared/tex'

const WAVE = 'var(--c-orange)'
const SECOND = 'var(--c-aqua)'
const SUM = 'var(--c-violet)'
const VIEW = { xMin: -0.3, xMax: 4 * Math.PI + 0.3, yMin: -4.2, yMax: 4.2 }

type Wave = { A: number; B: number; C: number; D: number }
const BASIC: Wave = { A: 1, B: 1, C: 0, D: 0 }
const waveFn =
  ({ A, B, C, D }: Wave) =>
  (x: number) =>
    A * Math.sin(B * (x - C)) + D

/** Play sine tones for a moment (Web Audio). Frequencies in Hz, loudness 0–1. */
function playTones(freqs: number[], loudness: number) {
  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return
  const ctx = new Ctx()
  const gain = ctx.createGain()
  const now = ctx.currentTime
  const peak = Math.max(0.0001, Math.min(1, loudness) * 0.18)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.05)
  gain.gain.setValueAtTime(peak, now + 1.1)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4)
  gain.connect(ctx.destination)
  for (const f of freqs) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = f
    osc.connect(gain)
    osc.start(now)
    osc.stop(now + 1.45)
  }
  window.setTimeout(() => void ctx.close(), 1600)
}

function WaveSliders({ w, onW }: { w: Wave; onW: (w: Wave) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Slider
        label="Amplitude A"
        value={w.A}
        min={0}
        max={3}
        step={0.25}
        onChange={(A) => onW({ ...w, A })}
        color={WAVE}
      />
      <Slider
        label="Frequency B"
        value={w.B}
        min={0.5}
        max={4}
        step={0.5}
        onChange={(B) => onW({ ...w, B })}
        color={WAVE}
      />
      <Slider
        label="Phase shift C"
        value={w.C}
        min={-Math.PI}
        max={Math.PI}
        step={Math.PI / 12}
        format={(v) => (Math.abs(v) < 1e-9 ? '0' : `${num(v / Math.PI, 3)}π`)}
        onChange={(C) => onW({ ...w, C })}
        color={WAVE}
      />
      <Slider
        label="Midline D"
        value={w.D}
        min={-2}
        max={2}
        step={0.5}
        onChange={(D) => onW({ ...w, D })}
        color={WAVE}
      />
    </div>
  )
}

function waveTex({ A, B, C, D }: Wave): string {
  const a = A === 1 ? '' : num(A)
  const b = B === 1 ? '' : num(B)
  const inner =
    Math.abs(C) < 1e-9
      ? `${b}x`
      : `${b}\\left(x ${C > 0 ? '-' : '+'} ${radToNice(Math.abs(C))}\\right)`
  const d = D === 0 ? '' : ` ${D > 0 ? '+' : '-'} ${num(Math.abs(D))}`
  return `y = ${a}\\sin ${inner}${d}`
}

export default function TrigGraphsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Unroll the circle into a wave">
        <Prose>
          <p>
            As a point goes round the unit circle, its height rises and falls: up to 1, down to −1,
            back again, forever. Plot that height against the angle and the circle unrolls into a{' '}
            <strong>sine wave</strong>.
          </p>
          <p>
            Waves are everywhere: sound, light, tides, alternating current, heartbeats. Four numbers
            tune any of them: how tall (amplitude), how often (frequency), where it starts (phase),
            and where its middle is (midline).
          </p>
        </Prose>
      </LabSection>
      <UnrollExplorer />
      <TuneExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Amplitude, period, phase">
        <Formula
          tex={'y = A \\sin\\big(B(x - C)\\big) + D'}
          caption="Amplitude $A$, frequency $B$, phase shift $C$, midline $D$: the four knobs of the transformations lab."
        />
        <Formula
          tex={'\\text{period} = \\frac{2\\pi}{B} \\qquad \\text{range} = [D - A,\\; D + A]'}
          caption="One full cycle takes $2\pi$ radians when $B = 1$; bigger $B$ squeezes more cycles in."
        />
        <Prose>
          <p>
            Cosine is just sine started a quarter turn earlier:{' '}
            <Tex>{'\\cos x = \\sin\\left(x + \\tfrac{\\pi}{2}\\right)'}</Tex>. In sound, frequency
            is pitch and amplitude is loudness: doubling the frequency raises a note by an octave.
          </p>
        </Prose>
        <Callout kind="misconception" title="Bigger B, shorter waves">
          <p>
            <Tex>{'\\sin 2x'}</Tex> repeats <em>twice as often</em>, so its period is half as long (
            <Tex>\pi</Tex>, not <Tex>4\pi</Tex>). The number inside acts on <Tex>x</Tex>, so it
            squeezes the graph.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet waves">
        <RealWorld
          items={[
            {
              title: 'Music',
              body: 'The note A above middle C is a pressure wave repeating 440 times a second; its octave repeats 880 times.',
            },
            {
              title: 'Tides',
              body: 'Sea level rises and falls roughly as a sine wave with a period of about 12 hours 25 minutes.',
            },
            {
              title: 'Electricity',
              body: 'Household AC voltage is a sine wave with amplitude around 325 V and 50 or 60 cycles a second.',
            },
            {
              title: 'Noise cancelling',
              body: 'Headphones play the same sound shifted by half a cycle, so the two waves add up to almost nothing.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A sine wave is the height of a point going round a circle, plotted against the angle.',
            '$y = A\\sin(B(x - C)) + D$: amplitude, frequency, phase shift, midline.',
            'The period is $2\\pi / B$: bigger $B$ means shorter waves.',
            'Cosine is sine shifted by a quarter turn.',
            'Adding waves makes interference: they can reinforce, cancel, or beat.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function UnrollExplorer() {
  const [s, setS] = useState<UnitCircleState | null>(null)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Circle in, wave out">
      <Prose>
        <p>
          Drag the point round the circle, or press <strong>Spin</strong>. The right-hand graph
          records its height (orange, sine) and its sideways position (blue, cosine) as the angle
          grows.
        </p>
      </Prose>
      <PredictReveal
        question="When the point has gone exactly halfway round (θ = π), what is the height of the sine wave?"
        options={['1', '0', '−1', '½']}
        answer={1}
        explanation="Halfway round, the point is at $(-1, 0)$: its height is 0, so the sine wave crosses the axis at $\pi$, heading down."
      />
      <Figure>
        <UnitCircle preset={{ theta: 0.6, showWave: true, units: 'rad' }} onStateChange={setS} />
      </Figure>
      <TryThisList>
        <TryThis id="t-turn" when={(s?.theta ?? 0) >= TAU - 0.01}>
          Take the point all the way round once. How much wave did one full turn draw?
        </TryThis>
        <TryThis id="t-peak" when={s !== null && s.theta > 0 && Math.abs(s.sin - 1) < 1e-6}>
          Find the top of the sine wave. Where is the point on the circle?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function TuneExplorer() {
  const [w, setW] = useState<Wave>(BASIC)
  const [second, setSecond] = useState(false)
  const [B2, setB2] = useState(3.5)
  const [played, setPlayed] = useState(false)
  const f = waveFn(w)
  const g = (x: number) => w.A * Math.sin(B2 * x)
  const isCosine = w.A === 1 && w.B === 1 && w.D === 0 && Math.abs(w.C + Math.PI / 2) < 1e-9
  return (
    <LabSection id="tune" eyebrow="Explore" title="Tune the wave, and hear it">
      <Prose>
        <p>
          Each slider changes one feature. The faint curve is plain <Tex>{'\\sin x'}</Tex> for
          comparison. Press <strong>Play</strong> to hear it: frequency becomes pitch, amplitude
          becomes loudness.
        </p>
      </Prose>
      <Figure>
        <Plot view={VIEW} height={300} piTicks ariaLabel={`Graph of ${waveTex(w)}`}>
          <FunctionGraph fn={Math.sin} color="var(--ink-3)" width={1.5} dashed />
          {w.D !== 0 && (
            <Segment from={[VIEW.xMin, w.D]} to={[VIEW.xMax, w.D]} color="var(--ink-3)" width={1} />
          )}
          {second && <FunctionGraph fn={g} color={SECOND} width={1.75} opacity={0.8} />}
          <FunctionGraph fn={f} color={WAVE} width={second ? 1.75 : 3} opacity={second ? 0.8 : 1} />
          {second && <FunctionGraph fn={(x) => f(x) + g(x)} color={SUM} width={3} />}
        </Plot>
        <div className="grid gap-4 border-t border-line p-3 sm:p-4">
          <WaveSliders w={w} onW={setW} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Switch label="Add a second wave" checked={second} onChange={setSecond} />
            {second && (
              <Slider
                className="w-56"
                label="Its frequency"
                value={B2}
                min={0.5}
                max={4}
                step={0.5}
                onChange={setB2}
                color={SECOND}
              />
            )}
            <Button
              size="sm"
              variant="primary"
              className="ml-auto"
              icon={<Volume2 className="size-4" />}
              disabled={w.A === 0}
              onClick={() => {
                playTones(second ? [220 * w.B, 220 * B2] : [220 * w.B], w.A / 3)
                setPlayed(true)
              }}
            >
              Play
            </Button>
          </div>
          <div className="overflow-x-auto text-[1.05rem]">
            <Tex>{waveTex(w)}</Tex>
          </div>
          <Readouts
            items={[
              { label: 'amplitude', value: num(w.A) },
              {
                label: 'period',
                value: <Tex>{`\\frac{2\\pi}{${num(w.B)}} = ${radToNice(TAU / w.B)}`}</Tex>,
              },
              { label: 'pitch', value: `${num(220 * w.B, 0)} Hz` },
              { label: 'midline', value: num(w.D) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-double" when={w.B === 2}>
          Double the frequency. What happens to the period? Play it: what happens to the pitch?
        </TryThis>
        <TryThis id="t-cosine" when={isCosine}>
          Shift the sine wave so it becomes the cosine wave (it should start at its top).
        </TryThis>
        <TryThis id="t-beats" when={second && Math.abs(B2 - w.B) === 0.5 && w.B >= 2}>
          Add a second wave whose frequency differs by 0.5. See (and hear) the “beats” in the purple
          sum.
        </TryThis>
        <TryThis id="t-play" when={played}>
          Play a wave. Then make it louder by changing just one slider.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [w, setW] = useState<Wave>(BASIC)
  const target: Wave = { A: 2, B: 2, C: 0, D: 0 }
  const solved = w.A === target.A && w.B === target.B && Math.abs(w.C) < 1e-9 && w.D === target.D
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-period"
          index={1}
          prompt="What is the period of $y = \sin 2x$ (in radians)? A decimal like 3.14 is fine."
          answer={Math.PI}
          tolerance={0.01}
          explanation="$\frac{2\pi}{2} = \pi \approx 3.14$: two full waves fit in $2\pi$."
        />
        <NumericChallenge
          id="c-amplitude"
          index={2}
          prompt="What is the amplitude of $y = 3\sin x + 1$?"
          answer={3}
          explanation="The wave goes 3 above and 3 below its midline $y = 1$, from $-2$ to $4$."
        />
        <McqChallenge
          id="c-shift"
          index={3}
          prompt="$\sin\left(x + \tfrac{\pi}{2}\right)$ is the same as…"
          options={[
            { text: '$\\cos x$', correct: true },
            { text: '$-\\sin x$', why: 'That is a shift by $\\pi$, half a cycle.' },
            {
              text: '$\\sin x + \\tfrac{\\pi}{2}$',
              why: 'Adding outside moves the wave up, not sideways.',
            },
            {
              text: '$-\\cos x$',
              why: 'That is a shift the other way: $\\sin(x - \\tfrac{\\pi}{2})$.',
            },
          ]}
          explanation="Starting a quarter turn earlier means starting at the top of the wave: that's cosine."
        />
        <NumericChallenge
          id="c-max"
          index={4}
          prompt="What is the largest value of $y = 2\sin x + 5$?"
          answer={7}
          explanation="$\sin x$ is at most 1, so $y$ is at most $2 \cdot 1 + 5 = 7$."
        />
        <InteractiveChallenge
          id="c-match"
          index={5}
          prompt="Tune the sliders to match the dashed target wave."
          solved={solved}
          hint="Measure the height of the target (amplitude), then count how many waves fit in $2\pi$."
          explanation="$y = 2\sin 2x$: amplitude 2, two cycles every $2\pi$ (period $\pi$), no shift, midline 0."
          onReset={() => setW(BASIC)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <Plot view={VIEW} height={260} piTicks ariaLabel="Your wave and the target wave">
              <FunctionGraph fn={waveFn(target)} color="var(--ink-2)" width={2} dashed />
              <FunctionGraph fn={waveFn(w)} color={solved ? 'var(--good)' : WAVE} width={2.75} />
            </Plot>
            <div className="border-t border-line p-3">
              <WaveSliders w={w} onW={setW} />
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

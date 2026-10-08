import { useState } from 'react'
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
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { Circle, Label, MovablePoint, Plot, Point, Segment, Vector, constraints } from '@/viz'
import { cabs, cadd, cargDeg, cmul, complexTex, type Complex } from '../_shared/algebra'
import { num } from '../_shared/tex'

const Z = 'var(--c-blue)'
const W = 'var(--c-orange)'
const RESULT = 'var(--c-violet)'
const VIEW = { xMin: -7, xMax: 7, yMin: -7, yMax: 7 }
const snap = constraints.compose(constraints.snapToGrid(0.5), constraints.within(-3, 3, -3, 3))

const POWERS: { z: Complex; tex: string }[] = [
  { z: [1, 0], tex: '1' },
  { z: [0, 1], tex: 'i' },
  { z: [-1, 0], tex: '-1' },
  { z: [0, -1], tex: '-i' },
]

const fmt = (x: number) => num(x)
const zt = (z: Complex) => complexTex(z, fmt)
const isReal = (z: Complex) => Math.abs(z[1]) < 1e-9

export default function ComplexNumbersLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="A number whose square is −1">
        <Prose>
          <p>
            No real number squares to −1: squares are never negative. So mathematicians invented
            one, called <Tex>{'i'}</Tex>, with <Tex>{'i^2 = -1'}</Tex>. Mix it with ordinary numbers
            and you get <strong>complex numbers</strong> like <Tex>{'3 + 2i'}</Tex>.
          </p>
          <p>
            The leap that makes them make sense is a picture. Put the real numbers along one axis
            and the multiples of <Tex>{'i'}</Tex> up the other: every complex number is a point in a
            plane. Adding slides points; multiplying <strong>rotates and stretches</strong> them.
            Multiplying by <Tex>{'i'}</Tex> is simply a quarter turn.
          </p>
        </Prose>
      </LabSection>
      <PlaneExplorer />
      <PowersExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Arithmetic with a + bi">
        <Formula
          tex={
            '(a + bi) + (c + di) = (a + c) + (b + d)i \\qquad (a + bi)(c + di) = (ac - bd) + (ad + bc)i'
          }
          caption="Add parts separately. Multiply every term by every term, then replace i² with −1."
        />
        <Prose>
          <ul>
            <li>
              <strong>Real part</strong> <Tex>{'a'}</Tex> and <strong>imaginary part</strong>{' '}
              <Tex>{'b'}</Tex> of <Tex>{'z = a + bi'}</Tex>.
            </li>
            <li>
              <strong>Modulus</strong> <Tex>{'|z| = \\sqrt{a^2 + b^2}'}</Tex>: the distance from 0.
              The <strong>argument</strong> is the angle from the positive real axis.
            </li>
            <li>
              Multiplying <strong>multiplies the moduli and adds the angles</strong>. That is why
              multiplying by <Tex>{'i'}</Tex> (modulus 1, angle 90°) rotates by a quarter turn.
            </li>
            <li>
              Every quadratic now has roots: <Tex>{'x^2 + 4 = 0'}</Tex> gives{' '}
              <Tex>{'x = \\pm 2i'}</Tex>.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="“Imaginary” doesn't mean fake">
          <p>
            The name is a historical insult that stuck. Complex numbers are as real as negative
            numbers, which were once called “absurd”. They describe rotations and waves exactly, and
            engineers use them every day to design circuits and signals.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where complex numbers are used">
        <RealWorld
          items={[
            {
              title: 'Electrical engineering',
              body: 'Alternating currents and impedances are complex numbers; the angle is the phase shift.',
            },
            {
              title: 'Signals and sound',
              body: 'The Fourier transform breaks sound and images into rotating complex waves.',
            },
            {
              title: 'Quantum physics',
              body: 'The state of every quantum system is described with complex numbers.',
            },
            {
              title: 'Fractals and graphics',
              body: 'The Mandelbrot set comes from repeating $z \\to z^2 + c$; 2-D rotations in games can use complex multiplication.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            '$i^2 = -1$; complex numbers have the form $a + bi$.',
            'They live in a plane: real part across, imaginary part up.',
            'Adding is tip-to-tail; multiplying multiplies lengths and adds angles.',
            'Multiplying by $i$ is a quarter turn, so $i^4 = 1$.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function PlaneExplorer() {
  const [mode, setMode] = useState<'add' | 'multiply'>('add')
  const [z, setZ] = useState<Complex>([2, 1])
  const [w, setW] = useState<Complex>([1, 2])
  const out = mode === 'add' ? cadd(z, w) : cmul(z, w)
  const bothComplex = !isReal(z) && !isReal(w)
  const wIsI = w[0] === 0 && w[1] === 1
  return (
    <LabSection id="explore" eyebrow="Explore" title="Adding slides, multiplying turns">
      <Prose>
        <p>
          Drag <Tex>{'z'}</Tex> (blue) and <Tex>{'w'}</Tex> (orange). In <em>add</em> mode the
          violet arrow is <Tex>{'z + w'}</Tex>: put <Tex>{'w'}</Tex> on the tip of <Tex>{'z'}</Tex>.
          In <em>multiply</em> mode it is <Tex>{'zw'}</Tex>: compare its length and angle with
          theirs.
        </p>
      </Prose>
      <PredictReveal
        question="What is $(1 + i)(1 - i)$?"
        options={['$0$', '$2$', '$1 - i^2$ (can’t simplify)', '$2i$']}
        answer={1}
        explanation="$1 - i + i - i^2 = 1 - (-1) = 2$. A complex number times its mirror image (conjugate) is real."
      />
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Operation"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'add', label: 'Add z + w' },
              { value: 'multiply', label: 'Multiply z · w' },
            ]}
          />
        </div>
        <div className="mx-auto w-full max-w-xl px-3 pt-3 sm:px-4">
          <Plot
            view={VIEW}
            narrowView={{ xMin: -5, xMax: 5, yMin: -5, yMax: 5 }}
            aspect="equal"
            ariaLabel={`z = ${zt(z)}, w = ${zt(w)}, ${mode === 'add' ? 'sum' : 'product'} ${zt(out)}`}
          >
            {mode === 'add' && (
              <>
                <Segment from={z as Vec2} to={out as Vec2} color={W} width={2} dashed />
                <Segment from={w as Vec2} to={out as Vec2} color={Z} width={2} dashed />
              </>
            )}
            {mode === 'multiply' && (
              <Circle center={[0, 0]} r={1} stroke="var(--line-strong)" strokeWidth={1.5} dashed />
            )}
            <Vector to={out as Vec2} color={RESULT} width={3.5} />
            <Vector to={z as Vec2} color={Z} />
            <Vector to={w as Vec2} color={W} />
            <Label
              at={out as Vec2}
              anchor="bottom-left"
              offset={[8, -8]}
              className="text-sm font-semibold"
            >
              {mode === 'add' ? 'z + w' : 'zw'}
            </Label>
            <MovablePoint
              x={z[0]}
              y={z[1]}
              onMove={(x, y) => setZ([x, y])}
              constrain={snap}
              step={0.5}
              color={Z}
              label="z"
            />
            <MovablePoint
              x={w[0]}
              y={w[1]}
              onMove={(x, y) => setW([x, y])}
              constrain={snap}
              step={0.5}
              color={W}
              label="w"
            />
          </Plot>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'z', value: <Tex>{zt(z)}</Tex>, color: Z },
              { label: 'w', value: <Tex>{zt(w)}</Tex>, color: W },
              {
                label: mode === 'add' ? 'z + w' : 'zw',
                value: <Tex>{zt(out)}</Tex>,
                color: RESULT,
              },
              ...(mode === 'multiply'
                ? [
                    {
                      label: 'lengths',
                      value: `${num(cabs(z))} × ${num(cabs(w))} = ${num(cabs(out))}`,
                    },
                    {
                      label: 'angles',
                      value: `${num(cargDeg(z), 0)}° + ${num(cargDeg(w), 0)}° → ${num(cargDeg(out), 0)}°`,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-cancel-imaginary" when={mode === 'add' && bothComplex && isReal(out)}>
          In add mode, give <Tex>{'z'}</Tex> and <Tex>{'w'}</Tex> imaginary parts that cancel, so
          the sum lands on the real axis.
        </TryThis>
        <TryThis id="t-rotate-by-i" when={mode === 'multiply' && wIsI && cabs(z) > 0}>
          In multiply mode, set <Tex>{'w = i'}</Tex>. What does multiplying by <Tex>{'i'}</Tex> do
          to <Tex>{'z'}</Tex>?
        </TryThis>
        <TryThis id="t-real-product" when={mode === 'multiply' && bothComplex && isReal(out)}>
          Multiply two non-real numbers and get a real answer. How are their angles related?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function PowersExplorer() {
  const [k, setK] = useState(1)
  const current = POWERS[k % 4]
  return (
    <LabSection id="powers" eyebrow="Explore" title="Powers of i go round in a circle">
      <Prose>
        <p>
          Each extra factor of <Tex>{'i'}</Tex> is another quarter turn. Raise the power and watch{' '}
          <Tex>{'i^k'}</Tex> walk round the unit circle: <Tex>{'1, i, -1, -i'}</Tex>, then back to
          1.
        </p>
      </Prose>
      <Figure>
        <div className="mx-auto w-full max-w-xs px-3 pt-3 sm:px-4">
          <Plot
            view={{ xMin: -1.6, xMax: 1.6, yMin: -1.6, yMax: 1.6 }}
            aspect="equal"
            grid={false}
            tickLabels={false}
            ariaLabel={`i to the power ${k} equals ${current.tex}`}
          >
            <Circle center={[0, 0]} r={1} stroke="var(--line-strong)" strokeWidth={1.5} />
            {POWERS.map((p) => (
              <Point
                key={p.tex}
                at={p.z as Vec2}
                r={p === current ? 8 : 4}
                color={p === current ? RESULT : 'var(--ink-3)'}
              />
            ))}
            {POWERS.map((p) => (
              <Label
                key={`l${p.tex}`}
                at={[p.z[0] * 1.32, p.z[1] * 1.32]}
                anchor="center"
                className="text-sm"
              >
                <Tex>{p.tex}</Tex>
              </Label>
            ))}
            <Vector to={current.z as Vec2} color={RESULT} />
          </Plot>
        </div>
        <div className="border-t border-line px-3 pt-3 sm:px-4">
          <Slider
            label="Power k"
            value={k}
            min={0}
            max={12}
            step={1}
            onChange={setK}
            color={RESULT}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'power', value: <Tex>{`i^{${k}} = ${current.tex}`}</Tex>, color: RESULT },
              { label: 'turned', value: `${k} quarter turn${k === 1 ? '' : 's'} = ${90 * k}°` },
              { label: 'k mod 4', value: `${k % 4}` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-square-of-i" when={k % 4 === 2}>
          Find a power of <Tex>{'i'}</Tex> that equals −1. How many quarter turns is that?
        </TryThis>
        <TryThis id="t-full-cycle" when={k > 0 && k % 4 === 0}>
          Find a positive power that brings you back to 1.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [z, setZ] = useState<Complex>([1, 1])
  const zi = cmul(z, [0, 1])
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-sum-real-part"
          index={1}
          prompt="$(3 + 2i) + (1 - 5i) = a + bi$. What is $a$?"
          answer={4}
          explanation="Add the real parts: $3 + 1 = 4$ (and the imaginary parts: $2 - 5 = -3$)."
        />
        <McqChallenge
          id="c-i-cubed"
          index={2}
          prompt="What is $i^3$?"
          options={[
            { text: '$-i$', correct: true },
            { text: '$i$', why: '$i^3 = i^2 \\cdot i = -i$.' },
            { text: '$-1$', why: 'That is $i^2$.' },
            { text: '$1$', why: 'That is $i^4$.' },
          ]}
          explanation="Three quarter turns from 1 land on $-i$: $i^3 = i^2 \cdot i = -i$."
        />
        <NumericChallenge
          id="c-product-imag"
          index={3}
          prompt="$(2 + i)(1 + 3i) = a + bi$. What is $b$?"
          answer={7}
          explanation="$2 + 6i + i + 3i^2 = 2 + 7i - 3 = -1 + 7i$."
        />
        <NumericChallenge
          id="c-modulus"
          index={4}
          prompt="What is $|3 + 4i|$?"
          answer={5}
          explanation="$\sqrt{3^2 + 4^2} = \sqrt{25} = 5$."
        />
        <McqChallenge
          id="c-solve-plus-four"
          index={5}
          prompt="Solve $x^2 + 4 = 0$."
          options={[
            { text: '$x = \\pm 2i$', correct: true },
            { text: '$x = \\pm 2$', why: '$2^2 + 4 = 8$, not 0.' },
            { text: 'No solutions', why: 'None among real numbers, but complex numbers have two.' },
            { text: '$x = \\pm 4i$', why: '$(4i)^2 = -16$.' },
          ]}
          explanation="$x^2 = -4$, so $x = \pm\sqrt{-4} = \pm 2i$. Check: $(2i)^2 = 4i^2 = -4$."
        />
        <InteractiveChallenge
          id="c-rotate-to-target"
          index={6}
          prompt="Drag $z$ so that $z \cdot i = -2 + 3i$."
          solved={zi[0] === -2 && zi[1] === 3}
          hint="Multiplying by $i$ turns a quarter turn anticlockwise. Turn the target back a quarter turn."
          explanation="$(3 + 2i) \cdot i = 3i + 2i^2 = -2 + 3i$, so $z = 3 + 2i$."
          onReset={() => setZ([1, 1])}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <p className="text-center">
              <Tex>{`z \\cdot i = (${zt(z)}) \\cdot i = ${zt(zi)}`}</Tex>
            </p>
            <div className="mx-auto w-full max-w-sm">
              <Plot
                view={{ xMin: -4, xMax: 4, yMin: -4, yMax: 4 }}
                aspect="equal"
                ariaLabel={`z = ${zt(z)} and z times i = ${zt(zi)}`}
              >
                <Point at={[-2, 3]} r={7} color="var(--ink-3)" hollow />
                <Vector to={zi as Vec2} color={RESULT} />
                <Vector to={z as Vec2} color={Z} />
                <MovablePoint
                  x={z[0]}
                  y={z[1]}
                  onMove={(x, y) => setZ([x, y])}
                  constrain={snap}
                  step={0.5}
                  color={Z}
                  label="z"
                />
              </Plot>
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

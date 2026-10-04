import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
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
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { InfiniteLine, MovablePoint, Plot, Polygon, Vector, constraints } from '@/viz'
import { DEG, signedArea } from '../_shared/geometry'

const ORIGINAL = 'var(--c-blue)'
const IMAGE = 'var(--c-orange)'
const TARGET = 'var(--c-violet)'
const MIRROR = 'var(--c-green)'

/** An F shape: no symmetry, so every flip and turn shows. */
const SHAPE: Vec2[] = [
  [1, 1],
  [1.6, 1],
  [1.6, 2.2],
  [2.6, 2.2],
  [2.6, 2.8],
  [1.6, 2.8],
  [1.6, 3.4],
  [3, 3.4],
  [3, 4],
  [1, 4],
]

type Mode = 'translate' | 'rotate' | 'reflect'

type Params = { mode: Mode; v: Vec2; turn: number; mirror: number }

const round = (x: number) => Math.round(x * 1e9) / 1e9

function apply(p: Vec2, { mode, v, turn, mirror }: Params): Vec2 {
  if (mode === 'translate') return [p[0] + v[0], p[1] + v[1]]
  if (mode === 'rotate') {
    const c = Math.cos(turn * DEG)
    const s = Math.sin(turn * DEG)
    return [round(c * p[0] - s * p[1]), round(s * p[0] + c * p[1])]
  }
  const c = Math.cos(2 * mirror * DEG)
  const s = Math.sin(2 * mirror * DEG)
  return [round(c * p[0] + s * p[1]), round(s * p[0] - c * p[1])]
}

function ruleTex({ mode, v, turn, mirror }: Params) {
  if (mode === 'translate')
    return `(x, y) \\mapsto (x ${v[0] < 0 ? '-' : '+'} ${Math.abs(v[0])},\\; y ${v[1] < 0 ? '-' : '+'} ${Math.abs(v[1])})`
  if (mode === 'rotate') {
    const special: Record<number, string> = {
      0: '(x, y)',
      90: '(-y, x)',
      180: '(-x, -y)',
      [-90]: '(y, -x)',
      [-180]: '(-x, -y)',
    }
    return `\\text{turn } ${turn}^\\circ:\\; (x, y) \\mapsto ${special[turn] ?? '(x\\cos\\theta - y\\sin\\theta,\\; x\\sin\\theta + y\\cos\\theta)'}`
  }
  const special: Record<number, string> = {
    0: '(x, -y)',
    45: '(y, x)',
    90: '(-x, y)',
    135: '(-y, -x)',
  }
  return `\\text{mirror at } ${mirror}^\\circ:\\; (x, y) \\mapsto ${special[mirror] ?? '\\ldots'}`
}

const same = (a: readonly Vec2[], b: readonly Vec2[]) =>
  a.every((p, i) => Math.abs(p[0] - b[i][0]) < 1e-6 && Math.abs(p[1] - b[i][1]) < 1e-6)

const TARGETS: { params: Params; hint: string }[] = [
  { params: { mode: 'translate', v: [-5, -4], turn: 0, mirror: 0 }, hint: 'Slide it.' },
  { params: { mode: 'rotate', v: [0, 0], turn: 90, mirror: 0 }, hint: 'Turn it about the origin.' },
  {
    params: { mode: 'reflect', v: [0, 0], turn: 0, mirror: 90 },
    hint: 'Flip it in a mirror line.',
  },
  { params: { mode: 'rotate', v: [0, 0], turn: 180, mirror: 0 }, hint: 'A half turn.' },
]

function TransformControls({ p, set }: { p: Params; set: (p: Params) => void }) {
  return (
    <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
      <Segmented
        label="Transformation"
        value={p.mode}
        onChange={(mode) => set({ ...p, mode })}
        options={[
          { value: 'translate', label: 'Translate' },
          { value: 'rotate', label: 'Rotate' },
          { value: 'reflect', label: 'Reflect' },
        ]}
      />
      {p.mode === 'translate' && (
        <p className="text-sm text-ink-2">Drag the arrow tip to slide the shape.</p>
      )}
      {p.mode === 'rotate' && (
        <Slider
          label="Turn about the origin"
          value={p.turn}
          min={-180}
          max={180}
          step={15}
          onChange={(turn) => set({ ...p, turn })}
          format={(v) => `${v}°`}
          color={IMAGE}
        />
      )}
      {p.mode === 'reflect' && (
        <Slider
          label="Mirror line angle"
          value={p.mirror}
          min={0}
          max={165}
          step={15}
          onChange={(mirror) => set({ ...p, mirror })}
          format={(v) => `${v}°`}
          color={MIRROR}
        />
      )}
    </div>
  )
}

function TransformPlot({
  p,
  set,
  target,
  label,
}: {
  p: Params
  set: (p: Params) => void
  target?: Vec2[]
  label: string
}) {
  const image = SHAPE.map((q) => apply(q, p))
  return (
    <Plot view={{ xMin: -6, xMax: 6, yMin: -5, yMax: 5 }} aspect="equal" ariaLabel={label}>
      {target && (
        <Polygon
          points={target}
          fill={TARGET}
          fillOpacity={0.12}
          stroke={TARGET}
          strokeWidth={2}
          dashed
        />
      )}
      {p.mode === 'reflect' && (
        <InfiniteLine
          through={[0, 0]}
          direction={[Math.cos(p.mirror * DEG), Math.sin(p.mirror * DEG)]}
          color={MIRROR}
          width={2}
          dashed
        />
      )}
      <Polygon
        points={SHAPE}
        fill={ORIGINAL}
        fillOpacity={0.25}
        stroke={ORIGINAL}
        strokeWidth={2}
      />
      <Polygon points={image} fill={IMAGE} fillOpacity={0.3} stroke={IMAGE} strokeWidth={2.5} />
      {p.mode === 'translate' && (
        <>
          <Vector from={[0, 0]} to={p.v} color={IMAGE} />
          <MovablePoint
            x={p.v[0]}
            y={p.v[1]}
            onMove={(x, y) => set({ ...p, v: [x, y] })}
            constrain={constraints.compose(
              constraints.snapToGrid(1),
              constraints.within(-5, 5, -4, 4),
            )}
            step={1}
            color={IMAGE}
            label="Tip of the translation arrow"
          />
        </>
      )}
    </Plot>
  )
}

const START: Params = { mode: 'translate', v: [1, -2], turn: 0, mirror: 0 }

export default function GeometricTransformationsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Move it without bending it">
        <Prose>
          <p>
            Slide a book across a table, spin it, or look at it in a mirror: it's still the same
            book. Its lengths and angles haven't changed, only where it is and which way it faces.
            Moves like these are <strong>rigid transformations</strong>.
          </p>
          <p>
            There are just three basic ones: <strong>translations</strong> (slides),{' '}
            <strong>rotations</strong> (turns) and <strong>reflections</strong> (flips). Every way
            of moving a rigid shape in the plane is one of these, or a combination.
          </p>
        </Prose>
      </LabSection>
      <MoveExplorer />
      <MatchExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Rules for the three moves">
        <Formula
          tex={'\\text{translate by } (a, b):\\; (x, y) \\mapsto (x + a,\\; y + b)'}
          caption="Every point moves the same amount in the same direction."
        />
        <Formula
          tex={
            '\\text{rotate } 90^\\circ:\\; (x, y) \\mapsto (-y, x) \\qquad \\text{rotate } 180^\\circ:\\; (x, y) \\mapsto (-x, -y)'
          }
          caption="Turns about the origin, anticlockwise."
        />
        <Formula
          tex={
            '\\text{reflect in the } x\\text{-axis}:\\; (x, y) \\mapsto (x, -y) \\qquad \\text{in } y = x:\\; (x, y) \\mapsto (y, x)'
          }
          caption="A mirror line: each point jumps to the same distance on the other side."
        />
        <Prose>
          <p>
            All three keep distances and angles, so the image is <em>congruent</em> to the original.
            Translations and rotations keep its orientation; reflections flip it, like your left
            hand becoming a right hand in a mirror.
          </p>
        </Prose>
        <Callout kind="misconception" title="A half turn isn't a reflection">
          <p>
            Rotating 180° and reflecting can look alike for symmetric shapes, but for an F they
            differ: the half turn keeps the F readable (just upside down), while a reflection makes
            it backwards.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Transformations at work">
        <RealWorld
          items={[
            {
              title: 'Computer graphics',
              body: 'Every frame of a game moves objects with translation and rotation matrices, millions of times a second.',
            },
            {
              title: 'Patterns and tiles',
              body: 'Wallpaper, tiling and Islamic geometric art repeat a motif by sliding, turning and flipping it.',
            },
            {
              title: 'Robotics',
              body: 'A robot arm tracks its gripper by combining the rotations at each joint.',
            },
            {
              title: 'Symmetry in nature',
              body: 'Butterflies have reflection symmetry; starfish and flowers have rotational symmetry.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Rigid transformations: translate (slide), rotate (turn), reflect (flip).',
            'They preserve lengths and angles: the image is congruent to the original.',
            'Reflections reverse orientation; translations and rotations don’t.',
            'Rules: $(x, y) \\mapsto (x + a, y + b)$, $(-y, x)$ for a quarter turn, $(x, -y)$ for the $x$-axis mirror.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function MoveExplorer() {
  const [p, setP] = useState<Params>(START)
  const image = SHAPE.map((q) => apply(q, p))
  const flipped = Math.sign(signedArea(image)) !== Math.sign(signedArea(SHAPE))
  return (
    <LabSection id="explore" eyebrow="Explore" title="Slide, turn, flip">
      <Prose>
        <p>
          The blue F is the original; the orange F is its image. Pick a move and adjust it. Watch
          which moves keep the F readable and which make it backwards.
        </p>
      </Prose>
      <PredictReveal
        question="Reflect the F in the $y$-axis, then reflect the result in the $x$-axis. What single move does the same?"
        options={[
          'A translation',
          'A rotation of $180^\\circ$',
          'A reflection in $y = x$',
          'Nothing: you are back where you started',
        ]}
        answer={1}
        explanation="$(x, y) \mapsto (-x, y) \mapsto (-x, -y)$: a half turn about the origin. Two flips make a turn."
      />
      <Figure>
        <TransformPlot
          p={p}
          set={setP}
          label={`F shape ${p.mode}d; orientation ${flipped ? 'flipped' : 'kept'}`}
        />
        <TransformControls p={p} set={setP} />
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'rule', value: <Tex>{ruleTex(p)}</Tex>, color: IMAGE },
              { label: 'lengths & angles', value: 'unchanged' },
              { label: 'orientation', value: flipped ? 'flipped (mirror image)' : 'same' },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-quarter" when={p.mode === 'rotate' && p.turn === 90}>
          Rotate a quarter turn anticlockwise. Check the rule on a corner:{' '}
          <Tex>{'(1, 4) \\mapsto (-4, 1)'}</Tex>.
        </TryThis>
        <TryThis id="t-diagonal" when={p.mode === 'reflect' && p.mirror === 45}>
          Reflect in the line <Tex>y = x</Tex> (45°). What happens to the coordinates?
        </TryThis>
        <TryThis id="t-backwards" when={flipped}>
          Find a move that makes the F read backwards.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function MatchExplorer() {
  const [p, setP] = useState<Params>(START)
  const [level, setLevel] = useState(0)
  const [matched, setMatched] = useState(0)
  const target = TARGETS[level % TARGETS.length]
  const targetPts = SHAPE.map((q) => apply(q, target.params))
  const hit = same(
    SHAPE.map((q) => apply(q, p)),
    targetPts,
  )
  return (
    <LabSection id="match" eyebrow="Explore" title="Match the target">
      <Prose>
        <p>
          Move the orange F onto the dashed violet target using one transformation. Choose the right
          kind of move first, then fine-tune it.
        </p>
      </Prose>
      <Figure>
        <TransformPlot
          p={p}
          set={setP}
          target={targetPts}
          label={`Target ${(level % TARGETS.length) + 1}: ${hit ? 'matched' : 'not yet matched'}`}
        />
        <TransformControls p={p} set={setP} />
        <div className="flex flex-wrap items-center gap-3 border-t border-line p-3 sm:px-4">
          <span className="text-sm text-ink-2" role="status">
            {hit
              ? 'Matched!'
              : `Target ${(level % TARGETS.length) + 1} of ${TARGETS.length}. ${target.hint}`}
          </span>
          <Button
            size="sm"
            variant="primary"
            className="ml-auto"
            icon={<ArrowRight className="size-4" />}
            disabled={!hit}
            onClick={() => {
              setMatched((n) => Math.max(n, level + 1))
              setLevel((r) => r + 1)
            }}
          >
            Next target
          </Button>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-match-one" when={hit || matched >= 1}>
          Match the first target.
        </TryThis>
        <TryThis id="t-match-all" when={matched >= TARGETS.length}>
          Match all four targets.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [mirror, setMirror] = useState(0)
  const p: Params = { mode: 'reflect', v: [0, 0], turn: 0, mirror }
  const target = SHAPE.map((q) => apply(q, { mode: 'reflect', v: [0, 0], turn: 0, mirror: 45 }))
  const solved = same(
    SHAPE.map((q) => apply(q, p)),
    target,
  )
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <McqChallenge
          id="c-rotate-lab"
          index={1}
          prompt="Rotate the point $(2, 1)$ by $90^\circ$ anticlockwise about the origin. Where does it go?"
          options={[
            { text: '$(-1, 2)$', correct: true },
            { text: '$(1, -2)$', why: 'That is a clockwise quarter turn.' },
            { text: '$(-2, -1)$', why: 'That is a half turn.' },
            { text: '$(1, 2)$', why: 'That is a reflection in $y = x$.' },
          ]}
          explanation="$(x, y) \mapsto (-y, x)$: $(2, 1) \mapsto (-1, 2)$."
        />
        <NumericChallenge
          id="c-translate-lab"
          index={2}
          prompt="Translate $(3, -2)$ by $(-5, 4)$. What is the new $x$-coordinate?"
          answer={-2}
          explanation="$(3 - 5, -2 + 4) = (-2, 2)$."
        />
        <McqChallenge
          id="c-reflect-lab"
          index={3}
          prompt="What does reflecting in the $x$-axis do to a point $(x, y)$?"
          options={[
            { text: '$(x, -y)$', correct: true },
            { text: '$(-x, y)$', why: 'That is the $y$-axis mirror.' },
            { text: '$(y, x)$', why: 'That is the mirror $y = x$.' },
            { text: '$(-x, -y)$', why: 'That is a half turn.' },
          ]}
          explanation="The mirror is horizontal, so only the up-down coordinate changes sign."
        />
        <McqChallenge
          id="c-orientation"
          index={4}
          prompt="Which transformation turns a left hand into a right hand?"
          options={[
            { text: 'A reflection', correct: true },
            { text: 'A rotation', why: 'Turning a left hand leaves it a left hand.' },
            { text: 'A translation', why: 'Sliding never changes handedness.' },
            { text: 'None of them', why: 'A mirror does exactly this.' },
          ]}
          explanation="Reflections reverse orientation; rotations and translations preserve it."
        />
        <InteractiveChallenge
          id="c-mirror"
          index={5}
          prompt="Set the mirror line so the F lands exactly on the dashed target."
          solved={solved}
          hint="The target swaps the $x$ and $y$ coordinates of every corner."
          explanation="The mirror $y = x$ (at $45^\circ$) maps $(x, y) \mapsto (y, x)$."
          onReset={() => setMirror(0)}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <TransformPlot
              p={p}
              set={() => {}}
              target={target}
              label={`Mirror at ${mirror} degrees`}
            />
            <div className="border-t border-line p-3">
              <Slider
                label="Mirror line angle"
                value={mirror}
                min={0}
                max={165}
                step={15}
                onChange={setMirror}
                format={(v) => `${formatNumber(v, 0)}°`}
                color={MIRROR}
              />
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

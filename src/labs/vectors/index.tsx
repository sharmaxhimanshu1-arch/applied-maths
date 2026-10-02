import { useState } from 'react'
import { add, heading, norm, scale, type Vec2 } from '@/math/linalg'
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
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import { AngleArc, Label, MovablePoint, Plot, Point, Segment, Vector, constraints } from '@/viz'
import { COLORS, num, vec } from '../_shared/tex'

const VIEW = { xMin: -8, xMax: 8, yMin: -5, yMax: 5 }
const snap = constraints.snapToGrid(0.5)
const close = (a: number, b: number) => Math.abs(a - b) < 0.01

export default function VectorsLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="A vector is a movement">
        <Prose>
          <p>
            “Walk 3 blocks east and 2 blocks north.” That instruction has a <strong>size</strong>{' '}
            (how far) and a <strong>direction</strong> (which way). Mathematicians draw it as an
            arrow and call it a <strong>vector</strong>.
          </p>
          <p>
            Vectors are how physics describes forces, how games move characters, and how machine
            learning represents data: a photo, a song or a sentence becomes a long list of numbers,
            a vector, and similar things become arrows that point the same way.
          </p>
        </Prose>
      </LabSection>
      <ArrowExplorer />
      <AddingExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Vectors as lists of numbers">
        <Prose>
          <p>
            Every arrow starting at the origin is pinned down by where its tip lands. So we write a
            vector as its two <strong>components</strong>, across then up:
          </p>
        </Prose>
        <Formula
          tex={
            '\\vec u = \\begin{bmatrix} u_1 \\\\ u_2 \\end{bmatrix},\\qquad |\\vec u| = \\sqrt{u_1^2 + u_2^2}'
          }
          caption="Components, and the length from Pythagoras."
        />
        <Formula
          tex={
            '\\vec u + \\vec v = \\begin{bmatrix} u_1 + v_1 \\\\ u_2 + v_2 \\end{bmatrix},\\qquad k\\,\\vec u = \\begin{bmatrix} k u_1 \\\\ k u_2 \\end{bmatrix}'
          }
          caption="Adding is tip-to-tail; scaling stretches (and flips when k is negative)."
        />
        <Callout kind="misconception">
          <p>
            A vector isn't tied to a place. The arrow from (0, 0) to (3, 2) and the arrow from (5,
            5) to (8, 7) are the <em>same</em> vector: same length, same direction. That's why you
            can slide one vector to the tip of another when you add them.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet vectors">
        <RealWorld
          items={[
            {
              title: 'Flight paths',
              body: "A plane's true path is its own velocity **plus** the wind's. Pilots add the two vectors before every flight.",
            },
            {
              title: 'Forces',
              body: 'Two people pulling a sled at an angle: the sled moves along the **sum** of their pulling forces.',
            },
            {
              title: 'Games & animation',
              body: 'Every frame, a game engine adds a velocity vector to each position to move things across the screen.',
            },
            {
              title: 'Machine learning',
              body: 'Words and images become vectors with hundreds of components; "similar meaning" means "pointing the same way".',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'A vector has a size and a direction; its components $(u_1, u_2)$ say how far across and how far up.',
            'Length comes from Pythagoras: $|\\vec u| = \\sqrt{u_1^2 + u_2^2}$.',
            'Add vectors tip to tail, which is the same as adding their components.',
            'Multiplying by $k$ scales the length by $|k|$; a negative $k$ also flips the direction.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function ArrowExplorer() {
  const [u, setU] = useState<Vec2>([3, 2])
  const len = norm(u)
  const deg = ((heading(u) * 180) / Math.PI + 360) % 360

  return (
    <LabSection id="arrow" eyebrow="Explore" title="An arrow you can grab">
      <Prose>
        <p>
          Drag the tip of <Tex>{'\\vec u'}</Tex>. The dashed lines show its two{' '}
          <strong>components</strong>: how far it goes across and how far up. Notice the length
          isn't simply across + up.
        </p>
      </Prose>
      <Figure>
        <Plot view={VIEW} aspect="equal" ariaLabel={`Vector u = (${num(u[0])}, ${num(u[1])})`}>
          <Segment from={[0, 0]} to={[u[0], 0]} color={COLORS.u} dashed width={2} />
          <Segment from={[u[0], 0]} to={u} color={COLORS.u} dashed width={2} />
          {len > 0.5 && (
            <AngleArc
              center={[0, 0]}
              from={0}
              to={heading(u)}
              radius={26}
              color="var(--c-violet)"
            />
          )}
          <Vector to={u} color={COLORS.u} />
          <Label
            at={[u[0] / 2, 0]}
            anchor={u[1] >= 0 ? 'top' : 'bottom'}
            offset={[0, u[1] >= 0 ? 6 : -6]}
            className="text-xs text-ink-2"
          >
            across {num(u[0])}
          </Label>
          <Label
            at={[u[0], u[1] / 2]}
            anchor={u[0] >= 0 ? 'left' : 'right'}
            offset={[u[0] >= 0 ? 8 : -8, 0]}
            className="text-xs text-ink-2"
          >
            up {num(u[1])}
          </Label>
          <MovablePoint
            x={u[0]}
            y={u[1]}
            onMove={(x, y) => setU([x, y])}
            constrain={snap}
            step={0.5}
            color={COLORS.u}
            label="Tip of vector u"
          />
        </Plot>
        <div className="border-t border-line px-3 pb-3">
          <Readouts
            items={[
              { label: <Tex>{'\\vec u'}</Tex>, value: <Tex>{vec(u, 1)}</Tex>, color: COLORS.u },
              { label: 'length', value: num(len, 3) },
              { label: 'direction', value: `${num(deg, 0)}°` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-up" when={close(u[0], 0) && u[1] > 0}>
          Make <strong>u</strong> point straight up.
        </TryThis>
        <TryThis id="t-five" when={close(len, 5)}>
          Give <strong>u</strong> a length of exactly 5. (A 3-4-5 triangle helps.)
        </TryThis>
        <TryThis id="t-quadrant" when={u[0] < 0 && u[1] < 0}>
          Point <strong>u</strong> down and to the left. What happens to its components?
        </TryThis>
      </TryThisList>
      <Prose className="mt-4">
        <p>
          The components and the arrow form a right triangle, so the length is the hypotenuse:{' '}
          <Tex>{`\\sqrt{${num(u[0], 1)}^2 + ${num(u[1], 1)}^2} = ${num(len, 3)}`}</Tex>.
        </p>
      </Prose>
    </LabSection>
  )
}

function AddingExplorer() {
  const [u, setU] = useState<Vec2>([3, 1])
  const [v, setV] = useState<Vec2>([1, 3])
  const [k, setK] = useState(1)
  const [parallelogram, setParallelogram] = useState(true)
  const ku = scale(u, k)
  const sum = add(ku, v)
  const lenSum = norm(sum)

  return (
    <LabSection id="adding" eyebrow="Explore" title="Adding and scaling arrows">
      <Prose>
        <p>
          To add two vectors, do one movement and then the other: slide <Tex>{'\\vec v'}</Tex> so it
          starts at the tip of <Tex>{'k\\vec u'}</Tex>. The arrow from the start to the final tip is
          the sum. The slider scales <Tex>{'\\vec u'}</Tex> by a number <Tex>k</Tex>.
        </p>
      </Prose>
      <PredictReveal
        question="If you double $\vec u$ (k = 2) and leave $\vec v$ alone, what happens to the sum?"
        options={[
          'It doubles too',
          'It changes, but does not simply double',
          'It stays the same',
          'It flips direction',
        ]}
        answer={1}
        explanation={
          <>
            Only the <Tex>{'\\vec u'}</Tex> part doubles, so the sum moves by an extra{' '}
            <Tex>{'\\vec u'}</Tex>. Set k = 2 below and watch the magenta arrow.
          </>
        }
      />
      <Figure>
        <Plot
          view={VIEW}
          aspect="equal"
          ariaLabel={`k times u plus v equals (${num(sum[0])}, ${num(sum[1])})`}
        >
          {parallelogram && (
            <>
              <Vector from={v} to={sum} color={COLORS.u} dashed width={2} opacity={0.6} />
            </>
          )}
          <Vector from={ku} to={sum} color={COLORS.v} dashed width={2} opacity={0.85} />
          <Vector to={sum} color={COLORS.result} width={3.25} />
          <Vector to={ku} color={COLORS.u} />
          <Vector to={v} color={COLORS.v} />
          <Label at={ku} anchor="bottom-left" offset={[8, -4]} color={COLORS.u}>
            <Tex>{k === 1 ? '\\vec u' : `${num(k, 1)}\\vec u`}</Tex>
          </Label>
          <Label at={v} anchor="bottom-left" offset={[8, -4]} color={COLORS.v}>
            <Tex>{'\\vec v'}</Tex>
          </Label>
          <Label at={sum} anchor="bottom-left" offset={[8, -4]} color={COLORS.result}>
            <Tex>{'k\\vec u + \\vec v'}</Tex>
          </Label>
          <MovablePoint
            x={u[0]}
            y={u[1]}
            onMove={(x, y) => setU([x, y])}
            constrain={snap}
            step={0.5}
            color={COLORS.u}
            label="Tip of vector u"
            size={6}
          />
          <MovablePoint
            x={v[0]}
            y={v[1]}
            onMove={(x, y) => setV([x, y])}
            constrain={snap}
            step={0.5}
            color={COLORS.v}
            label="Tip of vector v"
            size={6}
          />
        </Plot>
        <div className="grid gap-3 border-t border-line p-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Slider
            label={<Tex>k</Tex>}
            name="Scale factor k"
            value={k}
            min={-2}
            max={2}
            step={0.5}
            onChange={setK}
            color={COLORS.u}
          />
          <Switch
            label="Show the other route"
            checked={parallelogram}
            onChange={setParallelogram}
          />
          <Readouts
            items={[
              {
                label: <Tex>{'k\\vec u + \\vec v'}</Tex>,
                value: <Tex>{vec(sum, 1)}</Tex>,
                color: COLORS.result,
              },
              { label: 'length', value: num(lenSum, 3) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-cancel" when={lenSum < 0.01 && norm(v) > 0}>
          Make the two arrows cancel out, so the sum is zero.
        </TryThis>
        <TryThis id="t-flip" when={k < 0}>
          Make <Tex>k</Tex> negative. What does that do to <Tex>{'\\vec u'}</Tex>?
        </TryThis>
        <TryThis
          id="t-straight"
          when={norm(ku) > 0.1 && norm(v) > 0.1 && close(lenSum, norm(ku) + norm(v))}
        >
          Make the sum as long as the two lengths added together. When is that possible?
        </TryThis>
      </TryThisList>
      <Prose className="mt-4">
        <p>
          Both routes, <Tex>{'k\\vec u'}</Tex> then <Tex>{'\\vec v'}</Tex>, or{' '}
          <Tex>{'\\vec v'}</Tex> then <Tex>{'k\\vec u'}</Tex>, end at the same tip, so the order of
          adding doesn't matter. And the sum is only as long as both lengths together when the
          arrows point the same way. Otherwise the shortcut is shorter: that's the{' '}
          <strong>triangle inequality</strong>.
        </p>
      </Prose>
    </LabSection>
  )
}

function Practice() {
  const current: Vec2 = [0, -2]
  const dock: Vec2 = [4, 1]
  const [engine, setEngine] = useState<Vec2>([2, 2])
  const actual = add(engine, current)
  const reached = Math.hypot(actual[0] - dock[0], actual[1] - dock[1]) < 0.01

  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <InteractiveChallenge
          id="c-boat"
          index={1}
          prompt="A river pushes your boat along $\vec c = (0, -2)$. Drag your engine's vector $\vec e$ so the boat's actual motion $\vec e + \vec c$ lands exactly on the dock at $(4, 1)$."
          solved={reached}
          hint="You need $\vec e + (0, -2) = (4, 1)$. Undo the current: add $(0, 2)$ to the dock."
          explanation="$\vec e = (4, 3)$: aim *upstream* so the current carries you down onto the dock. Navigators do exactly this sum."
          onReset={() => setEngine([2, 2])}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <Plot
              view={{ xMin: -1, xMax: 6, yMin: -3, yMax: 5 }}
              aspect="equal"
              height={300}
              ariaLabel="Boat crossing a river"
            >
              <Point at={dock} r={8} color={COLORS.target} />
              <Label at={dock} anchor="left" offset={[12, 0]} color={COLORS.target}>
                dock
              </Label>
              <Vector to={engine} color={COLORS.u} />
              <Vector from={engine} to={actual} color="var(--ink-3)" dashed width={2} />
              <Vector to={actual} color={COLORS.result} width={3} />
              <Label at={engine} anchor="bottom-right" offset={[-8, -4]} color={COLORS.u}>
                <Tex>{'\\vec e'}</Tex>
              </Label>
              <MovablePoint
                x={engine[0]}
                y={engine[1]}
                onMove={(x, y) => setEngine([x, y])}
                constrain={snap}
                step={0.5}
                color={COLORS.u}
                label="Tip of the engine vector"
              />
            </Plot>
          </div>
        </InteractiveChallenge>
        <NumericChallenge
          id="c-length"
          index={2}
          prompt="What is the length of the vector $(6, 8)$?"
          answer={10}
          hint="$\sqrt{6^2 + 8^2}$"
          explanation="$\sqrt{36 + 64} = \sqrt{100} = 10$. It's a 3-4-5 triangle scaled by 2."
        />
        <McqChallenge
          id="c-add"
          index={3}
          prompt="$(2, 3) + (-1, 4) = \;?$"
          options={[
            { text: '$(1, 7)$', correct: true },
            { text: '$(3, -1)$', why: 'That subtracts instead of adding.' },
            { text: '$(-2, 12)$', why: 'That multiplies the components.' },
            { text: '$(1, -1)$', why: 'Add the second components too: 3 + 4.' },
          ]}
          explanation="Add component by component: $(2 + (-1),\ 3 + 4) = (1, 7)$."
        />
        <McqChallenge
          id="c-scale"
          index={4}
          prompt="What does multiplying a vector by $-2$ do?"
          options={[
            { text: 'Flips it around and doubles its length', correct: true },
            { text: 'Doubles its length only', why: 'The minus sign does something too.' },
            {
              text: 'Halves it and flips it',
              why: 'Multiplying by 2 doubles; it would be $-\\tfrac12$ that halves.',
            },
            {
              text: 'Rotates it by 90°',
              why: 'Scaling never turns an arrow sideways; it only stretches or flips it.',
            },
          ]}
          explanation="The size scales by $|-2| = 2$, and the negative sign reverses the direction."
        />
        <NumericChallenge
          id="c-combo"
          index={5}
          prompt="If $\vec u = (1, 2)$, what is the **second** component of $3\vec u - (1, 1)$?"
          answer={5}
          hint="First $3\vec u = (3, 6)$."
          explanation="$3\vec u - (1, 1) = (3 - 1,\ 6 - 1) = (2, 5)$, so the second component is 5."
        />
      </ChallengeSet>
    </LabSection>
  )
}

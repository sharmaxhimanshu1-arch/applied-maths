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
import { Tex } from '@/ui/Tex'
import { AngleArc, Label, MovablePoint, Plot, Segment, Vector } from '@/viz'
import { DEG } from '../_shared/geometry'

const FIXED = 'var(--c-blue)'
const MOVING = 'var(--c-orange)'
const ARC = 'var(--c-magenta)'
const A_COL = 'var(--c-green)'
const B_COL = 'var(--c-violet)'

const R = 3

/** Snap a dragged point to the circle of radius R, in whole steps of `step` degrees. */
const onDial =
  (step: number) =>
  ([x, y]: Vec2): Vec2 => {
    const deg = Math.round(Math.atan2(y, x) / DEG / step) * step
    return [R * Math.cos(deg * DEG), R * Math.sin(deg * DEG)]
  }

const toDeg = ([x, y]: Vec2) => ((Math.round(Math.atan2(y, x) / DEG) % 360) + 360) % 360

function kindOf(deg: number) {
  if (deg === 0) return 'zero'
  if (deg < 90) return 'acute'
  if (deg === 90) return 'right'
  if (deg < 180) return 'obtuse'
  if (deg === 180) return 'straight'
  if (deg < 360) return 'reflex'
  return 'full turn'
}

export default function AnglesLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="An angle is an amount of turning">
        <Prose>
          <p>
            Stand still and turn. A quarter of the way round is a right angle; halfway round faces
            you the opposite way; all the way round brings you back. An <strong>angle</strong>{' '}
            measures how much you turned, not how long the lines are.
          </p>
          <p>
            We split a full turn into 360 <strong>degrees</strong> (a number with lots of divisors:
            halves, thirds, quarters, sixths, eighths all come out whole). Once angles have numbers,
            a few simple rules let you work out angles you can't measure directly.
          </p>
        </Prose>
      </LabSection>
      <TurnExplorer />
      <CrossingExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Angle facts">
        <Formula
          tex={
            '\\text{full turn} = 360^\\circ \\qquad \\text{straight line} = 180^\\circ \\qquad \\text{right angle} = 90^\\circ'
          }
          caption="The landmarks every other angle is measured against."
        />
        <Prose>
          <ul>
            <li>
              <strong>Angles on a straight line</strong> add to <Tex>{'180^\\circ'}</Tex>; two that
              do are <em>supplementary</em>. Two that make a right angle are <em>complementary</em>{' '}
              (they add to <Tex>{'90^\\circ'}</Tex>).
            </li>
            <li>
              <strong>Angles around a point</strong> add to <Tex>{'360^\\circ'}</Tex>.
            </li>
            <li>
              <strong>Vertically opposite angles</strong>, across a crossing, are equal.
            </li>
          </ul>
          <p>
            By size: <em>acute</em> (less than <Tex>{'90^\\circ'}</Tex>), <em>right</em>,{' '}
            <em>obtuse</em> (between <Tex>{'90^\\circ'}</Tex> and <Tex>{'180^\\circ'}</Tex>),{' '}
            <em>straight</em>, and <em>reflex</em> (more than <Tex>{'180^\\circ'}</Tex>).
          </p>
        </Prose>
        <Callout kind="misconception" title="Longer arms don't make a bigger angle">
          <p>
            Stretching the arms of an angle doesn't change it: the turn between them is the same.
            The arc drawn to mark an angle can be any size, too. Only the opening counts.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Angles at work">
        <RealWorld
          items={[
            {
              title: 'Navigation',
              body: 'Compass bearings are angles measured clockwise from north: 090° is due east, 225° is south-west.',
            },
            {
              title: 'Building',
              body: 'Carpenters check corners are square (90°) and cut mitre joints at 45° so two pieces meet in a right angle.',
            },
            {
              title: 'Sport',
              body: 'A snooker ball bounces off a cushion at the same angle it hit it: angles predict where it goes.',
            },
            {
              title: 'Clocks',
              body: 'The hands of a clock turn 360° in an hour (minute hand) and 30° per hour (hour hand).',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'An angle measures turning; a full turn is $360^\\circ$.',
            'On a straight line angles add to $180^\\circ$; around a point to $360^\\circ$.',
            'Where two lines cross, opposite angles are equal and neighbours add to $180^\\circ$.',
            'Acute < 90° < obtuse < 180° < reflex; right angles are exactly 90°.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function TurnExplorer() {
  const [tip, setTip] = useState<Vec2>([R * Math.cos(40 * DEG), R * Math.sin(40 * DEG)])
  const deg = toDeg(tip)
  const kind = kindOf(deg)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Turn the arm">
      <Prose>
        <p>
          The blue arm stays put. Drag the orange arm round (it clicks in steps of 5°). The pink arc
          shows how far it has turned, counter-clockwise from the blue arm.
        </p>
      </Prose>
      <PredictReveal
        question="Drag the orange arm three-quarters of the way round. How many degrees is that?"
        options={['$90^\\circ$', '$180^\\circ$', '$270^\\circ$', '$300^\\circ$']}
        answer={2}
        explanation="$\tfrac34 \times 360^\circ = 270^\circ$: a reflex angle, bigger than a straight line."
      />
      <Figure>
        <div className="mx-auto w-full max-w-md">
          <Plot
            view={{ xMin: -4, xMax: 4, yMin: -4, yMax: 4 }}
            aspect="equal"
            grid={false}
            axes={false}
            ariaLabel={`An angle of ${deg} degrees (${kind})`}
          >
            {deg > 0 && (
              <AngleArc center={[0, 0]} from={0} to={deg * DEG} radius={42} color={ARC} />
            )}
            <Vector from={[0, 0]} to={[R, 0]} color={FIXED} />
            <Vector from={[0, 0]} to={tip} color={MOVING} />
            {deg === 90 && <Segment from={[0.45, 0]} to={[0.45, 0.45]} color={ARC} width={1.5} />}
            {deg === 90 && <Segment from={[0, 0.45]} to={[0.45, 0.45]} color={ARC} width={1.5} />}
            <Label
              at={[1.2 * Math.cos((deg / 2) * DEG), 1.2 * Math.sin((deg / 2) * DEG)]}
              anchor="center"
              color={ARC}
            >
              {deg}°
            </Label>
            <MovablePoint
              x={tip[0]}
              y={tip[1]}
              onMove={(x, y) => setTip([x, y])}
              constrain={onDial(5)}
              color={MOVING}
              label="Tip of the turning arm"
            />
          </Plot>
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'angle', value: `${deg}°`, color: ARC },
              { label: 'type', value: kind },
              { label: 'fraction of a turn', value: `${Math.round((deg / 360) * 1000) / 1000}` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-right" when={deg === 90}>
          Make a right angle. What fraction of a turn is it?
        </TryThis>
        <TryThis id="t-obtuse" when={deg > 90 && deg < 180}>
          Make an obtuse angle.
        </TryThis>
        <TryThis id="t-reflex" when={deg > 180}>
          Go past the straight line to make a reflex angle.
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function CrossingExplorer() {
  const [tip, setTip] = useState<Vec2>([R * Math.cos(50 * DEG), R * Math.sin(50 * DEG)])
  const raw = toDeg(tip) % 180
  const a = raw === 0 ? 180 : raw
  const b = 180 - a
  const t = a * DEG
  return (
    <LabSection id="crossing" eyebrow="Explore" title="Where two lines cross">
      <Prose>
        <p>
          Two straight lines cross and make four angles. Turn the orange line and watch the green
          and violet angles. Which ones are always equal? Which pairs always add to the same total?
        </p>
      </Prose>
      <Figure>
        <div className="mx-auto w-full max-w-md">
          <Plot
            view={{ xMin: -4, xMax: 4, yMin: -4, yMax: 4 }}
            aspect="equal"
            grid={false}
            axes={false}
            ariaLabel={`Two crossing lines making angles of ${a} and ${b} degrees`}
          >
            {a < 180 && (
              <>
                <AngleArc center={[0, 0]} from={0} to={t} radius={34} color={A_COL} />
                <AngleArc
                  center={[0, 0]}
                  from={Math.PI}
                  to={Math.PI + t}
                  radius={34}
                  color={A_COL}
                />
                <AngleArc center={[0, 0]} from={t} to={Math.PI} radius={46} color={B_COL} />
                <AngleArc
                  center={[0, 0]}
                  from={Math.PI + t}
                  to={2 * Math.PI}
                  radius={46}
                  color={B_COL}
                />
              </>
            )}
            <Segment from={[-R, 0]} to={[R, 0]} color={FIXED} width={2.5} />
            <Segment from={[-tip[0], -tip[1]]} to={tip} color={MOVING} width={2.5} />
            <Label
              at={[1.3 * Math.cos(t / 2), 1.3 * Math.sin(t / 2)]}
              anchor="center"
              color={A_COL}
            >
              a
            </Label>
            <Label
              at={[-1.3 * Math.cos(t / 2), -1.3 * Math.sin(t / 2)]}
              anchor="center"
              color={A_COL}
            >
              a
            </Label>
            <Label
              at={[1.6 * Math.cos((t + Math.PI) / 2), 1.6 * Math.sin((t + Math.PI) / 2)]}
              anchor="center"
              color={B_COL}
            >
              b
            </Label>
            <Label
              at={[-1.6 * Math.cos((t + Math.PI) / 2), -1.6 * Math.sin((t + Math.PI) / 2)]}
              anchor="center"
              color={B_COL}
            >
              b
            </Label>
            <MovablePoint
              x={tip[0]}
              y={tip[1]}
              onMove={(x, y) => setTip(y < 0 ? [-x, -y] : [x, y])}
              constrain={onDial(5)}
              color={MOVING}
              label="End of the turning line"
            />
          </Plot>
        </div>
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'a', value: `${a}°`, color: A_COL },
              { label: 'b', value: `${b}°`, color: B_COL },
              { label: 'a + b', value: `${a + b}°` },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-square" when={a === 90}>
          Make all four angles equal. What size are they?
        </TryThis>
        <TryThis id="t-thin" when={a > 0 && a <= 20}>
          Make angle a very small (20° or less). What happens to b?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [tip, setTip] = useState<Vec2>([R, 0.0001])
  const deg = toDeg(tip)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-complement"
          index={1}
          prompt="Two angles are complementary. One is $35^\circ$. What is the other, in degrees?"
          answer={55}
          explanation="Complementary angles add to $90^\circ$: $90 - 35 = 55$."
        />
        <NumericChallenge
          id="c-supplement"
          index={2}
          prompt="Two angles sit side by side on a straight line. One is $110^\circ$. What is the other?"
          answer={70}
          explanation="Angles on a straight line add to $180^\circ$: $180 - 110 = 70$."
        />
        <McqChallenge
          id="c-vertical"
          index={3}
          prompt="Two lines cross, making one angle of $65^\circ$. What is the angle directly opposite it?"
          options={[
            { text: '$65^\\circ$', correct: true },
            {
              text: '$115^\\circ$',
              why: 'That is the angle next to it, on the same straight line.',
            },
            {
              text: '$25^\\circ$',
              why: 'That would be its complement; nothing here makes a right angle.',
            },
            { text: '$295^\\circ$', why: 'That is the reflex angle going the long way round.' },
          ]}
          explanation="Vertically opposite angles are equal."
        />
        <NumericChallenge
          id="c-around"
          index={4}
          prompt="Three angles meet at a point: $100^\circ$, $120^\circ$ and $x$. Find $x$."
          answer={140}
          explanation="Around a point they add to $360^\circ$: $360 - 100 - 120 = 140$."
        />
        <InteractiveChallenge
          id="c-make-135"
          index={5}
          prompt="Drag the arm to make an angle of exactly $135^\circ$."
          solved={deg === 135}
          hint="That is a right angle plus half a right angle."
          explanation="$135^\circ = 90^\circ + 45^\circ$: an obtuse angle, three-eighths of a turn."
          onReset={() => setTip([R, 0.0001])}
        >
          <div className="mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-line">
            <Plot
              view={{ xMin: -4, xMax: 4, yMin: -4, yMax: 4 }}
              aspect="equal"
              grid={false}
              axes={false}
              ariaLabel={`An angle of ${deg} degrees`}
            >
              {deg > 0 && (
                <AngleArc center={[0, 0]} from={0} to={deg * DEG} radius={30} color={ARC} />
              )}
              <Vector from={[0, 0]} to={[R, 0]} color={FIXED} />
              <Vector from={[0, 0]} to={tip} color={MOVING} />
              <MovablePoint
                x={tip[0]}
                y={tip[1]}
                onMove={(x, y) => setTip([x, y])}
                constrain={onDial(5)}
                color={MOVING}
                label="Tip of the arm"
              />
            </Plot>
            <p className="border-t border-line px-3 py-2 text-sm">Angle: {deg}°</p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

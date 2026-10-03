import { useState, type ReactNode } from 'react'
import { clamp, snap } from '@/math/core'
import { mean, modes } from '@/math/stats'
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
import { Button } from '@/ui/Button'
import { Tex } from '@/ui/Tex'
import { MovablePoint, Plot, usePlot } from '@/viz'
import { num } from '../_shared/tex'

const SETS: { id: string; name: string; values: number[] }[] = [
  { id: 'even', name: 'Evenly spread', values: [2, 4, 4, 6, 6, 8] },
  { id: 'lopsided', name: 'Lopsided', values: [1, 1, 2, 2, 3, 9] },
  { id: 'clusters', name: 'Two clusters', values: [1, 2, 2, 8, 8, 9] },
]

const DOT = 'var(--c-orange)'

/** Rotates its children about a pivot (math coordinates), animated with CSS. */
function Tilt({ angle, pivot, children }: { angle: number; pivot: number; children: ReactNode }) {
  const t = usePlot()
  return (
    <g
      style={{
        transform: `rotate(${angle}deg)`,
        transformOrigin: `${t.sx(pivot)}px ${t.sy(0)}px`,
        transition: 'transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      {children}
    </g>
  )
}

/** The number line as a beam with the data stacked on it. */
function Beam({ values }: { values: number[] }) {
  const t = usePlot()
  const levels = new Map<number, number>()
  const placed = values.map((v) => {
    const level = levels.get(v) ?? 0
    levels.set(v, level + 1)
    return [v, level] as const
  })
  const y0 = t.sy(0)
  return (
    <g aria-hidden>
      <line
        x1={t.sx(-0.3)}
        x2={t.sx(10.3)}
        y1={y0}
        y2={y0}
        stroke="var(--ink-2)"
        strokeWidth={7}
        strokeLinecap="round"
      />
      {Array.from({ length: 11 }, (_, k) => (
        <g key={k}>
          <line
            x1={t.sx(k)}
            x2={t.sx(k)}
            y1={y0 + 4}
            y2={y0 + 10}
            stroke="var(--ink-3)"
            strokeWidth={1.5}
          />
          <text x={t.sx(k)} y={y0 + 24} textAnchor="middle" fontSize={12} fill="var(--ink-2)">
            {k}
          </text>
        </g>
      ))}
      {placed.map(([v, level], i) => (
        <circle
          key={i}
          cx={t.sx(v)}
          cy={y0 - 13 - level * 19}
          r={8.5}
          fill={DOT}
          stroke="var(--surface)"
          strokeWidth={2}
        />
      ))}
    </g>
  )
}

/** A triangular fulcrum whose apex touches the beam. */
function Fulcrum({ x, balanced }: { x: number; balanced: boolean }) {
  const t = usePlot()
  const px = t.sx(x)
  const py = t.sy(0) + 4
  return (
    <polygon
      aria-hidden
      points={`${px},${py} ${px - 15},${py + 30} ${px + 15},${py + 30}`}
      fill={balanced ? 'var(--good)' : 'var(--ink)'}
      style={{ transition: 'fill 200ms ease' }}
    />
  )
}

function Seesaw({
  values,
  fulcrum,
  onFulcrum,
}: {
  values: number[]
  fulcrum: number
  onFulcrum: (f: number) => void
}) {
  const torque = values.reduce((s, x) => s + (x - fulcrum), 0)
  const balanced = Math.abs(torque) < 1e-9
  const angle = clamp(torque * 1.2, -9, 9)
  return (
    <Plot
      view={{ xMin: -0.8, xMax: 10.8, yMin: -1.2, yMax: 1.8 }}
      height={230}
      grid={false}
      axes={false}
      ariaLabel={`A seesaw with ${values.length} weights at ${values.join(', ')}. The pivot is at ${num(fulcrum, 1)}; the beam ${balanced ? 'is level' : torque > 0 ? 'tips right' : 'tips left'}.`}
    >
      <Tilt angle={angle} pivot={fulcrum}>
        <Beam values={values} />
      </Tilt>
      <Fulcrum x={fulcrum} balanced={balanced} />
      <MovablePoint
        x={fulcrum}
        y={-0.62}
        onMove={(x) => onFulcrum(x)}
        constrain={([x]) => [snap(clamp(x, 0, 10), 0.1), -0.62]}
        step={0.1}
        color="var(--accent)"
        size={6}
        label="Pivot of the seesaw"
      />
    </Plot>
  )
}

export default function DescribingDataLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="What's a typical value?">
        <Prose>
          <p>
            Faced with a pile of numbers (test scores, house prices, commute times) we usually want
            one number that says “this is typical”. There are three popular answers, and they can
            disagree:
          </p>
          <ul>
            <li>
              the <strong>mean</strong> (average): the balance point of the data;
            </li>
            <li>
              the <strong>median</strong>: the middle value once they're in order;
            </li>
            <li>
              the <strong>mode</strong>: the most common value.
            </li>
          </ul>
        </Prose>
      </LabSection>
      <BalanceExplorer />
      <OutlierExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="The three centres">
        <Formula
          tex={'\\bar x = \\frac{x_1 + x_2 + \\cdots + x_n}{n}'}
          caption="The mean: add everything up and share it out equally."
        />
        <Prose>
          <p>
            The <strong>median</strong> is the middle value after sorting; with an even count, it's
            halfway between the two middle values. The <strong>mode</strong> is the value that
            appears most often (there can be several).
          </p>
          <p>
            The mean is the balance point because the distances on either side cancel out exactly:{' '}
            <Tex>{'\\sum (x_i - \\bar x) = 0'}</Tex>. That's also its weakness: one extreme value
            has a long lever and drags the mean towards it.
          </p>
        </Prose>
        <Callout kind="insight" title="Which one to use?">
          <p>
            For symmetric data the mean and median agree. For skewed data, like incomes or house
            prices, the median describes a typical person better. The mode suits categories (“most
            common shoe size”).
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where you'll meet averages">
        <RealWorld
          items={[
            {
              title: 'Incomes',
              body: 'Governments report median income: a few billionaires would drag the mean far above what most people earn.',
            },
            {
              title: 'Grades',
              body: 'Your average mark is a mean, so one bad test can pull it down more than you might expect.',
            },
            {
              title: 'Shops',
              body: 'A shoe shop stocks most of the mode size, not the mean size (there is no size 7.83).',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'The mean is the balance point: $\\bar x = \\dfrac{\\text{sum}}{n}$.',
            'The median is the middle value; half the data lies on each side.',
            'The mode is the most common value.',
            'Outliers pull the mean but barely move the median.',
            'For skewed data (incomes, prices), the median is usually the better “typical value”.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function BalanceExplorer() {
  const [setId, setSetId] = useState('lopsided')
  const [fulcrum, setFulcrum] = useState(2)
  const [balancedSets, setBalancedSets] = useState<string[]>([])
  const values = SETS.find((s) => s.id === setId)!.values
  const m = mean(values)
  const balanced = Math.abs(fulcrum - m) < 1e-9
  const move = (f: number) => {
    setFulcrum(f)
    if (Math.abs(f - m) < 1e-9 && !balancedSets.includes(setId))
      setBalancedSets((b) => [...b, setId])
  }
  return (
    <LabSection id="explore" eyebrow="Explore" title="Find the balance point">
      <Prose>
        <p>
          Each dot is a weight sitting on a beam at its value. Drag the pivot underneath until the
          beam is level. Where it balances is the <strong>mean</strong>.
        </p>
      </Prose>
      <PredictReveal
        question="Weights sit at 1, 1, 2, 2, 3 and 9. Where will the beam balance?"
        options={[
          'At 2, where most of the weights are',
          'At 3',
          'At 5, the middle of the beam',
          'At 9',
        ]}
        answer={1}
        explanation="At 3, the mean: $(1 + 1 + 2 + 2 + 3 + 9) / 6 = 3$. The lone weight at 9 is far out, so it has a long lever and balances all the weights clustered on the left."
      />
      <Figure>
        <div
          className="flex flex-wrap gap-2 border-b border-line p-3 sm:px-4"
          role="group"
          aria-label="Data sets"
        >
          {SETS.map((s) => (
            <Button
              key={s.id}
              size="sm"
              variant={setId === s.id ? 'soft' : 'ghost'}
              aria-pressed={setId === s.id}
              onClick={() => setSetId(s.id)}
            >
              {s.name}
            </Button>
          ))}
        </div>
        <Seesaw values={values} fulcrum={fulcrum} onFulcrum={move} />
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'pivot at', value: num(fulcrum, 1) },
              {
                label: 'the beam',
                value: balanced ? 'is level' : fulcrum < m ? 'tips right' : 'tips left',
                color: balanced ? 'var(--good)' : undefined,
              },
            ]}
          />
          {balanced && (
            <div className="mt-3 overflow-x-auto text-[0.95rem]">
              <Tex
                display
              >{`\\bar x = \\frac{${values.join(' + ')}}{${values.length}} = ${num(m)}`}</Tex>
            </div>
          )}
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-balance" when={balancedSets.length >= 1}>
          Balance the beam. Then check: is the pivot at the average of the numbers?
        </TryThis>
        <TryThis id="t-lopsided" when={balancedSets.includes('lopsided')}>
          Balance the “Lopsided” set. Is the balance point where most of the weights are?
        </TryThis>
        <TryThis id="t-clusters" when={balancedSets.includes('clusters')}>
          Balance “Two clusters”. Is there any weight at the balance point?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function OutlierExplorer() {
  const [s, setS] = useState<DataLabState | null>(null)
  const values = s?.values ?? []
  const mostCommon = values.length ? modes(values) : []
  const outlier = s !== null && Math.max(...values) >= 9.5 && s.mean - s.median >= 0.5
  const equal =
    s !== null &&
    values.length > 1 &&
    Math.abs(s.mean - s.median) < 1e-9 &&
    new Set(values).size > 1
  return (
    <LabSection id="outliers" eyebrow="Explore" title="Mean versus median">
      <Prose>
        <p>
          Now you can move the data. Drag the dots (or click the line to add more) and watch the
          mean (the triangle) and the median (the dashed line) respond.
        </p>
      </Prose>
      <Figure>
        <DataLab
          preset={{
            mode: 'dots',
            values: [3, 4, 4, 5, 5, 5, 6, 7],
            range: [0, 10],
            show: { median: true },
            toggles: false,
          }}
          onStateChange={setS}
        />
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: 'mode',
                value: mostCommon.length
                  ? mostCommon.length > 3
                    ? 'no single mode'
                    : mostCommon.map((v) => num(v, 1)).join(' and ')
                  : '–',
              },
              { label: 'mean − median', value: s ? num(s.mean - s.median) : '–' },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-outlier" when={outlier}>
          Drag one dot to the far right (9.5 or more). Which moved further: the mean or the median?
        </TryThis>
        <TryThis id="t-equal" when={equal}>
          Rearrange the dots so the mean and median are exactly equal (without stacking them all in
          one place).
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [s, setS] = useState<DataLabState | null>(null)
  const solved = s !== null && Math.abs(s.mean - 6) < 1e-6 && Math.abs(s.median - 5) < 1e-6
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-mean"
          index={1}
          prompt="What is the mean of 2, 4 and 9?"
          answer={5}
          explanation="$\frac{2 + 4 + 9}{3} = \frac{15}{3} = 5$."
        />
        <NumericChallenge
          id="c-median-odd"
          index={2}
          prompt="What is the median of 3, 8, 1, 9, 4?"
          answer={4}
          hint="Put them in order first."
          explanation="In order: 1, 3, **4**, 8, 9. The middle value is 4."
        />
        <NumericChallenge
          id="c-median-even"
          index={3}
          prompt="What is the median of 1, 2, 3, 10?"
          answer={2.5}
          hint="With an even count there are two middle values."
          explanation="The middle two are 2 and 3, so the median is halfway: 2.5. (The mean is 4, pulled up by the 10.)"
        />
        <McqChallenge
          id="c-houses"
          index={4}
          prompt="Why do news reports usually give the **median** house price rather than the mean?"
          options={[
            { text: 'A few very expensive homes pull the mean up', correct: true },
            {
              text: 'The median is easier to calculate',
              why: 'Both are easy for a computer; the reason is what they describe.',
            },
            {
              text: 'The mean is always lower than the median',
              why: 'For prices it is usually the other way round: expensive outliers push the mean up.',
            },
            {
              text: 'Houses only come in a few prices',
              why: 'That would be an argument for the mode.',
            },
          ]}
          explanation="House prices are skewed: a handful of mansions drag the mean up, while the median stays at a typical home."
        />
        <InteractiveChallenge
          id="c-mean-median"
          index={5}
          prompt="Drag the five dots so that the **mean is 6** and the **median is 5**."
          solved={solved}
          hint="Keep the middle dot at 5. The total must be $5 \times 6 = 30$, so push the top dots up."
          explanation="For example 2, 4, 5, 9, 10: the middle value is 5 and the total is 30, so the mean is 6. Values above the median pull the mean up without moving the median."
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <DataLab
              preset={{
                mode: 'dots',
                values: [2, 4, 5, 6, 8],
                range: [0, 10],
                show: { median: true },
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

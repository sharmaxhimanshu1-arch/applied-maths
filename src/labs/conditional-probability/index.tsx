import { Car, DoorClosed, PawPrint, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { createRng } from '@/math/random'
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
import { cn } from '@/ui/cn'
import { DotGrid, type GridCell } from '../_shared/DotGrid'
import { fracTex, percent } from '../_shared/fraction'

const PASS = 'var(--c-blue)'
const FAIL = 'var(--c-orange)'

type ClassMix = { studied: number; passIfStudied: number; passIfNot: number }
type Filter = 'all' | 'studied' | 'passed'

function tally(c: ClassMix) {
  const studied = c.studied
  const studiedPass = Math.round(studied * c.passIfStudied)
  const rest = 100 - studied
  const restPass = Math.round(rest * c.passIfNot)
  return { studied, studiedPass, rest, restPass, passed: studiedPass + restPass }
}

const pct = (v: number) => percent(v, 0)

/** 100 students split into two blocks (studied or not), coloured by pass/fail. */
function ClassPicture({
  mix,
  onMix,
  filter,
}: {
  mix: ClassMix
  onMix: (m: ClassMix) => void
  filter: Filter
}) {
  const { studied, studiedPass, rest, restPass } = tally(mix)
  const block = (n: number, passed: number, isStudied: boolean): GridCell[] =>
    Array.from({ length: n }, (_, i) => {
      const pass = i < passed
      const dim = filter === 'studied' ? !isStudied : filter === 'passed' ? !pass : false
      return { color: pass ? PASS : FAIL, hollow: !pass, dim }
    })
  return (
    <div className="grid gap-4 p-3 sm:p-4">
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <div>
          <div className="mb-2 text-sm font-semibold">
            Studied <span className="font-normal text-ink-2">({studied})</span>
          </div>
          <DotGrid
            cells={block(studied, studiedPass, true)}
            columns={10}
            ariaLabel={`${studied} students studied; ${studiedPass} of them passed`}
          />
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold">
            Didn't study <span className="font-normal text-ink-2">({rest})</span>
          </div>
          <DotGrid
            cells={block(rest, restPass, false)}
            columns={10}
            ariaLabel={`${rest} students did not study; ${restPass} of them passed`}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-ink-2" aria-hidden>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full" style={{ background: PASS }} /> passed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full border-2" style={{ borderColor: FAIL }} /> failed
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider
          label="Students who studied"
          value={mix.studied}
          min={10}
          max={90}
          step={5}
          format={(v) => `${v} of 100`}
          onChange={(v) => onMix({ ...mix, studied: v })}
        />
        <Slider
          label="Pass rate if studied"
          value={mix.passIfStudied}
          min={0}
          max={1}
          step={0.05}
          format={pct}
          color={PASS}
          onChange={(v) => onMix({ ...mix, passIfStudied: v })}
        />
        <Slider
          label="Pass rate if not"
          value={mix.passIfNot}
          min={0}
          max={1}
          step={0.05}
          format={pct}
          color={PASS}
          onChange={(v) => onMix({ ...mix, passIfNot: v })}
        />
      </div>
    </div>
  )
}

function ClassReadouts({ mix }: { mix: ClassMix }) {
  const { studied, studiedPass, passed } = tally(mix)
  return (
    <Readouts
      items={[
        {
          label: <Tex>{'P(\\text{pass})'}</Tex>,
          value: (
            <>
              <Tex>{fracTex(passed, 100)}</Tex> = {pct(passed / 100)}
            </>
          ),
        },
        {
          label: <Tex>{'P(\\text{pass} \\mid \\text{studied})'}</Tex>,
          value: (
            <>
              <Tex>{fracTex(studiedPass, studied)}</Tex> = {pct(studiedPass / studied)}
            </>
          ),
          color: PASS,
        },
        {
          label: <Tex>{'P(\\text{studied} \\mid \\text{pass})'}</Tex>,
          value: passed ? (
            <>
              <Tex>{fracTex(studiedPass, passed)}</Tex> = {pct(studiedPass / passed)}
            </>
          ) : (
            'nobody passed'
          ),
        },
      ]}
    />
  )
}

export default function ConditionalProbabilityLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="New information changes the odds">
        <Prose>
          <p>
            What's the chance a random student passed the exam? Now: what's the chance, if you{' '}
            <em>know</em> they studied? The second question is a{' '}
            <strong>conditional probability</strong>, written{' '}
            <Tex>{'P(\\text{pass} \\mid \\text{studied})'}</Tex> and read “the probability of pass,
            given studied”.
          </p>
          <p>
            The trick is to zoom in: throw away everyone who didn't study, and ask what fraction of
            the people left passed. Knowing something shrinks the world you're looking at.
          </p>
        </Prose>
      </LabSection>
      <ZoomExplorer />
      <MontyHallExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Zooming in, as a formula">
        <Formula
          tex={'P(A \\mid B) = \\frac{P(A \\text{ and } B)}{P(B)}'}
          caption="Keep only the cases where $B$ happened, then ask what fraction of those also have $A$."
        />
        <Formula
          tex={'P(A \\text{ and } B) = P(B) \\cdot P(A \\mid B)'}
          caption="The multiplication rule: the same formula, rearranged."
        />
        <Prose>
          <p>
            If knowing <Tex>B</Tex> doesn't change the chance of <Tex>A</Tex>, that is if{' '}
            <Tex>{'P(A \\mid B) = P(A)'}</Tex>, the events are <strong>independent</strong>. Two
            coin flips are independent; studying and passing (hopefully) are not.
          </p>
        </Prose>
        <Callout kind="misconception" title="Don't flip the bar">
          <p>
            <Tex>{'P(A \\mid B)'}</Tex> and <Tex>{'P(B \\mid A)'}</Tex> answer different questions.
            Most professional basketball players are tall, but most tall people are not professional
            basketball players.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection
        id="real-world"
        eyebrow="Real world"
        title="Where you'll meet conditional probability"
      >
        <RealWorld
          items={[
            {
              title: 'Medical tests',
              body: 'The chance you are ill given a positive test is very different from the chance of a positive test given you are ill. The next lab, Bayes, untangles them.',
            },
            {
              title: 'Spam filters',
              body: 'A filter estimates $P(\\text{spam} \\mid \\text{the words in this email})$ from how often those words appear in spam and in normal mail.',
            },
            {
              title: 'Insurance and risk',
              body: 'Premiums depend on conditional risks: the chance of a claim given your age, car and postcode.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            '$P(A \\mid B)$ is the probability of $A$ once you know $B$ happened: zoom in on $B$.',
            '$P(A \\mid B) = \\dfrac{P(A \\text{ and } B)}{P(B)}$.',
            '$P(A \\mid B)$ and $P(B \\mid A)$ are usually different numbers.',
            'Events are independent when knowing one does not change the chance of the other.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function ZoomExplorer() {
  const [mix, setMix] = useState<ClassMix>({ studied: 60, passIfStudied: 0.8, passIfNot: 0.35 })
  const [filter, setFilter] = useState<Filter>('all')
  const { studied, studiedPass, passed } = tally(mix)
  return (
    <LabSection id="explore" eyebrow="Explore" title="Zoom in on a group">
      <Prose>
        <p>
          Each dot is a student in a class of 100. Use the buttons to zoom in on one group; the
          others fade out. Then change the sliders and watch all three probabilities.
        </p>
      </Prose>
      <Figure>
        <div className="border-b border-line p-3 sm:px-4">
          <Segmented
            label="Who to look at"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'Everyone' },
              { value: 'studied', label: 'Only those who studied' },
              { value: 'passed', label: 'Only those who passed' },
            ]}
          />
        </div>
        <ClassPicture mix={mix} onMix={setMix} filter={filter} />
        <div className="border-t border-line px-3 pb-3 sm:px-4">
          <ClassReadouts mix={mix} />
          <div className="mt-3 overflow-x-auto text-[0.95rem]">
            {filter === 'all' && <Tex display>{`P(\\text{pass}) = \\frac{${passed}}{100}`}</Tex>}
            {filter === 'studied' && (
              <Tex
                display
              >{`P(\\text{pass} \\mid \\text{studied}) = \\frac{\\text{passed and studied}}{\\text{studied}} = \\frac{${studiedPass}}{${studied}}`}</Tex>
            )}
            {filter === 'passed' && (
              <Tex
                display
              >{`P(\\text{studied} \\mid \\text{pass}) = \\frac{\\text{studied and passed}}{\\text{passed}} = \\frac{${studiedPass}}{${passed}}`}</Tex>
            )}
          </div>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-studied" when={filter === 'studied'}>
          Look only at the students who studied. What fraction of them passed?
        </TryThis>
        <TryThis id="t-passed" when={filter === 'passed'}>
          Now look only at those who passed. Is <Tex>{'P(\\text{studied} \\mid \\text{pass})'}</Tex>{' '}
          the same number as <Tex>{'P(\\text{pass} \\mid \\text{studied})'}</Tex>?
        </TryThis>
        <TryThis
          id="t-independent"
          when={Math.abs(mix.passIfStudied - mix.passIfNot) < 1e-9 && mix.passIfStudied > 0}
        >
          Make studying make no difference at all. How do <Tex>{'P(\\text{pass})'}</Tex> and{' '}
          <Tex>{'P(\\text{pass} \\mid \\text{studied})'}</Tex> compare now?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type Tally = { wins: number; games: number }

// Car placement and auto-played games (a fresh seed each visit).
const doorRng = createRng(Date.now())

function MontyHallExplorer() {
  const [car, setCar] = useState(() => doorRng.int(0, 2))
  const [pick, setPick] = useState<number | null>(null)
  const [opened, setOpened] = useState<number | null>(null)
  const [final, setFinal] = useState<number | null>(null)
  const [stay, setStay] = useState<Tally>({ wins: 0, games: 0 })
  const [swap, setSwap] = useState<Tally>({ wins: 0, games: 0 })
  const [handPlayed, setHandPlayed] = useState(0)
  const other =
    pick !== null && opened !== null ? [0, 1, 2].find((d) => d !== pick && d !== opened)! : null

  const choose = (door: number) => {
    if (pick !== null) return
    setPick(door)
    const goats = [0, 1, 2].filter((d) => d !== door && d !== car)
    setOpened(goats[doorRng.int(0, goats.length - 1)])
  }
  const decide = (switching: boolean) => {
    if (pick === null || other === null) return
    const f = switching ? other : pick
    setFinal(f)
    const add = (t: Tally) => ({ wins: t.wins + (f === car ? 1 : 0), games: t.games + 1 })
    if (switching) setSwap(add)
    else setStay(add)
    setHandPlayed((n) => n + 1)
  }
  const again = () => {
    setCar(doorRng.int(0, 2))
    setPick(null)
    setOpened(null)
    setFinal(null)
  }
  const auto = (switching: boolean, n: number) => {
    let wins = 0
    for (let k = 0; k < n; k++) {
      const c = doorRng.int(0, 2)
      const p = doorRng.int(0, 2)
      // The host always reveals a goat, so switching wins exactly when the first pick was wrong.
      if (switching ? p !== c : p === c) wins++
    }
    const add = (t: Tally) => ({ wins: t.wins + wins, games: t.games + n })
    if (switching) setSwap(add)
    else setStay(add)
  }

  const message =
    pick === null
      ? 'Pick a door. One hides a car; the other two hide goats.'
      : final === null
        ? `You picked door ${pick + 1}. The host, who knows where the car is, opens door ${(opened ?? 0) + 1}: a goat. Stay with door ${pick + 1}, or switch to door ${(other ?? 0) + 1}?`
        : final === car
          ? `Door ${final + 1}: the car! You win.`
          : `Door ${final + 1}: a goat. The car was behind door ${car + 1}.`

  return (
    <LabSection id="monty-hall" eyebrow="Explore" title="The Monty Hall puzzle">
      <Prose>
        <p>
          A famous game show puzzle that fools almost everyone, including many mathematicians when
          it first appeared. It is all about how one piece of information, the door the host opens,
          changes the odds.
        </p>
      </Prose>
      <PredictReveal
        question="You pick a door; the host opens another door with a goat behind it, then offers you the chance to switch. Should you?"
        options={['Switch', 'Stay', 'It makes no difference']}
        answer={0}
        explanation="Switching wins $\tfrac23$ of the time. Your first pick is right only $\tfrac13$ of the time. When it's wrong, the host is forced to open the only other goat door, so the remaining door must hide the car. Play below to check."
      />
      <Figure>
        <div className="grid gap-4 p-3 sm:p-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[0, 1, 2].map((d) => {
              const revealed = d === opened || final !== null
              const isCar = d === car
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => choose(d)}
                  disabled={pick !== null}
                  aria-label={`Door ${d + 1}${revealed ? (isCar ? ': car' : ': goat') : ''}${d === pick ? ', your pick' : ''}`}
                  className={cn(
                    'flex h-36 flex-col items-center justify-center gap-2 rounded-2xl border-2 text-sm font-semibold transition-colors sm:h-44',
                    revealed
                      ? isCar
                        ? 'border-[var(--c-yellow)] bg-[color-mix(in_oklab,var(--c-yellow)_16%,var(--surface))]'
                        : 'border-line bg-surface-2 text-ink-2'
                      : 'border-line-strong bg-surface hover:bg-surface-2 disabled:hover:bg-surface',
                    (d === pick || d === final) &&
                      'ring-2 ring-accent ring-offset-2 ring-offset-surface',
                  )}
                >
                  {revealed ? (
                    isCar ? (
                      <Car className="size-10 sm:size-14" aria-hidden />
                    ) : (
                      <PawPrint className="size-8 sm:size-10" aria-hidden />
                    )
                  ) : (
                    <DoorClosed className="size-10 text-ink-2 sm:size-14" aria-hidden />
                  )}
                  <span>{revealed ? (isCar ? 'Car' : 'Goat') : `Door ${d + 1}`}</span>
                </button>
              )
            })}
          </div>
          <p className="min-h-12 text-[0.9375rem]" aria-live="polite">
            {message}
          </p>
          <div className="flex flex-wrap gap-2">
            {pick !== null && final === null && (
              <>
                <Button size="sm" variant="primary" onClick={() => decide(false)}>
                  Stay with door {pick + 1}
                </Button>
                <Button size="sm" variant="primary" onClick={() => decide(true)}>
                  Switch to door {(other ?? 0) + 1}
                </Button>
              </>
            )}
            {final !== null && (
              <Button
                size="sm"
                variant="secondary"
                icon={<RotateCcw className="size-4" />}
                onClick={again}
              >
                Play again
              </Button>
            )}
          </div>
        </div>
        <div className="grid gap-3 border-t border-line p-3 sm:p-4">
          <WinBar label="Always stay" tally={stay} expected={1 / 3} color="var(--c-orange)" />
          <WinBar label="Always switch" tally={swap} expected={2 / 3} color="var(--c-blue)" />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={() => auto(false, 100)}>
              Auto-play 100 staying
            </Button>
            <Button size="sm" variant="ghost" onClick={() => auto(true, 100)}>
              Auto-play 100 switching
            </Button>
          </div>
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-hand" when={handPlayed >= 3}>
          Play at least three rounds by hand. Try both staying and switching.
        </TryThis>
        <TryThis id="t-auto" when={stay.games >= 100 && swap.games >= 100}>
          Auto-play at least 100 games of each strategy. Which one wins about twice as often?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function WinBar({
  label,
  tally: t,
  expected,
  color,
}: {
  label: string
  tally: Tally
  expected: number
  color: string
}) {
  const rate = t.games ? t.wins / t.games : 0
  return (
    <div className="grid gap-1">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular font-mono text-ink-2">
          {t.games ? `${t.wins} of ${t.games} won = ${percent(rate, 0)}` : 'no games yet'}
        </span>
      </div>
      <div
        className="relative h-3 overflow-hidden rounded-full bg-surface-3"
        role="img"
        aria-label={`${label}: ${percent(rate, 0)} won; theory ${percent(expected, 0)}`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${rate * 100}%`, background: color }}
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-ink"
          style={{ left: `${expected * 100}%` }}
          title="Theory"
        />
      </div>
    </div>
  )
}

function Practice() {
  const [mix, setMix] = useState<ClassMix>({ studied: 40, passIfStudied: 0.5, passIfNot: 0.5 })
  const { studied, studiedPass, passed } = tally(mix)
  const solved = Math.abs(studiedPass / studied - 0.9) < 0.005 && passed === 60
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-french"
          index={1}
          prompt="In a class of 30, 12 students take French, and 8 of those also take Spanish. What is $P(\text{Spanish} \mid \text{French})$?"
          answer={8 / 12}
          tolerance={0.005}
          hint="Zoom in on the 12 French students only."
          explanation="Of the 12 French students, 8 take Spanish: $\tfrac{8}{12} = \tfrac23 \approx 0.667$. The other 18 students don't matter."
        />
        <McqChallenge
          id="c-flip"
          index={2}
          prompt="Almost everyone with measles has spots. Does that mean almost everyone with spots has measles?"
          options={[
            { text: 'No: those are different conditional probabilities', correct: true },
            {
              text: 'Yes: it is the same statement',
              why: '$P(\\text{spots} \\mid \\text{measles})$ is high, but spots have many other causes.',
            },
            {
              text: 'Yes, if measles is common',
              why: 'Even then the two numbers differ; they only match in special cases.',
            },
            {
              text: 'It is impossible to say anything',
              why: 'We can say the two questions are different.',
            },
          ]}
          explanation="$P(\text{spots} \mid \text{measles})$ is high, but $P(\text{measles} \mid \text{spots})$ is low because spots are usually caused by something else."
        />
        <NumericChallenge
          id="c-aces"
          index={3}
          prompt="You draw two cards from a 52-card deck without putting the first back. The first is an ace. What is the probability the second is also an ace?"
          answer={3 / 51}
          tolerance={0.002}
          hint="After the first ace is gone, how many aces and how many cards are left?"
          explanation="3 aces remain among 51 cards: $\tfrac{3}{51} \approx 0.059$. Knowing the first card changed the odds for the second."
        />
        <McqChallenge
          id="c-monty"
          index={4}
          prompt="In the Monty Hall game, how often does always switching win the car?"
          options={[
            { text: '$\\tfrac23$ of the time', correct: true },
            {
              text: '$\\tfrac12$ of the time',
              why: 'Two doors remain, but they are not equally likely: the host’s choice carries information.',
            },
            { text: '$\\tfrac13$ of the time', why: 'That is how often staying wins.' },
            { text: 'Always', why: 'If your first pick was the car, switching loses.' },
          ]}
          explanation="Switching wins exactly when your first pick was wrong, which happens $\tfrac23$ of the time."
        />
        <InteractiveChallenge
          id="c-mix"
          index={5}
          prompt="Set the sliders so that $P(\text{pass} \mid \text{studied}) = 90\%$ **and** exactly 60 of the 100 students pass overall."
          solved={solved}
          hint="Try 50 students studying. 90% of them is 45 passes, so how many of the other 50 must pass?"
          explanation="For example 50 studied with a 90% pass rate (45 passes) and 30% of the other 50 passing (15 more): 60 in total. Overall pass rates mix the two groups' rates."
          onReset={() => setMix({ studied: 40, passIfStudied: 0.5, passIfNot: 0.5 })}
        >
          <div className="overflow-hidden rounded-xl border border-line">
            <ClassPicture mix={mix} onMix={setMix} filter="all" />
            <div className="border-t border-line px-3 pb-3">
              <ClassReadouts mix={mix} />
            </div>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

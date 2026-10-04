import { useState } from 'react'
import { Shuffle } from 'lucide-react'
import { formatNumber } from '@/math/core'
import { createRng } from '@/math/random'
import { entropyBits } from '@/math/stats'
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

const PROB = 'var(--c-blue)'
const SURPRISE = 'var(--c-orange)'
const BITS = 'var(--c-violet)'
const LETTERS = ['A', 'B', 'C', 'D']
const COLS = ['var(--c-blue)', 'var(--c-orange)', 'var(--c-green)', 'var(--c-violet)']

const rng = createRng(5)
const bits = (x: number) => `${formatNumber(x, 3)} bits`
const surprisal = (p: number) => {
  const b = formatNumber(-Math.log2(p), 2)
  return `${b} ${b === '1' ? 'bit' : 'bits'}`
}

export default function EntropyInformationLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="Surprise, measured in bits">
        <Prose>
          <p>
            How much do you learn when you find something out? If you already knew it, nothing. If
            it was a fair coin flip, a little. If it was the winning lottery number, a lot.
            Information is <strong>surprise</strong>: the less likely the news, the more it tells
            you.
          </p>
          <p>
            Claude Shannon gave surprise a unit, the <strong>bit</strong>: the information in one
            fair yes/no answer. The <strong>entropy</strong> of a random source is its average
            surprise, the number of yes/no questions you need on average to pin down what happened.
            It is also the best any compression can do.
          </p>
        </Prose>
      </LabSection>
      <QuestionsExplorer />
      <SurpriseExplorer />
      <CodeExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="Surprisal and entropy">
        <Formula
          tex={'I(x) = -\\log_2 p(x) \\qquad H = \\sum_x p(x)\\,\\big(-\\log_2 p(x)\\big)'}
          caption="Surprisal of one outcome, and entropy: the average surprisal."
        />
        <Prose>
          <ul>
            <li>
              <strong>Halving</strong> the possibilities is one bit: an outcome with chance{' '}
              <Tex>{'\\tfrac18'}</Tex> carries <Tex>{'\\log_2 8 = 3'}</Tex> bits, because it takes
              three halvings to single it out.
            </li>
            <li>
              <strong>Biggest when even:</strong> with <Tex>{'n'}</Tex> outcomes, entropy is at most{' '}
              <Tex>{'\\log_2 n'}</Tex>, reached when they are all equally likely. A certain outcome
              has entropy 0.
            </li>
            <li>
              <strong>Compression:</strong> no code can use fewer than <Tex>{'H'}</Tex> bits per
              symbol on average (Shannon's source coding theorem), and good codes such as Huffman
              codes get within one bit of it by giving common symbols short codewords.
            </li>
            <li>
              <strong>Machine learning</strong> uses the same idea: log loss is the average
              surprisal of the true labels under the model's probabilities, called{' '}
              <em>cross-entropy</em>.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="A bit of information isn't a binary digit">
          <p>
            A file can hold a million binary digits but only a few bits of information, if it is
            predictable (a million zeros, say). Information measures how much the data surprises
            you, not how much space it takes; that gap is exactly what compression removes.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where entropy shows up">
        <RealWorld
          items={[
            {
              title: 'Compression',
              body: 'ZIP, PNG and MP3 all use entropy coding: frequent patterns get short codes, rare ones long codes.',
            },
            {
              title: 'Passwords',
              body: 'A password’s strength is its entropy: four random common words carry about 44 bits, far more than “P@ssw0rd!”.',
            },
            {
              title: 'Decision trees',
              body: 'A tree picks each question to cut the entropy of the labels the most (information gain), just like a good twenty-questions player.',
            },
            {
              title: 'Language models',
              body: 'They are trained to minimise cross-entropy: the average surprise at the next word of real text.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'An outcome with probability $p$ carries $-\\log_2 p$ bits of surprise.',
            'Entropy is the average surprise: $H = \\sum p\\,(-\\log_2 p)$.',
            'Even odds give the most entropy, $\\log_2 n$; certainty gives 0.',
            'Entropy is the limit of compression: bits per symbol on average.',
          ]}
        />
      </LabSection>
    </div>
  )
}

type Game = { size: number; target: number; lo: number; hi: number; asked: number; tiny: boolean }

const newGame = (size: number, target: number): Game => ({
  size,
  target,
  lo: 1,
  hi: size,
  asked: 0,
  tiny: false,
})

function QuestionsExplorer() {
  const [game, setGame] = useState<Game>(() => newGame(32, 23))
  const [cut, setCut] = useState(16)
  const { size, target, lo, hi, asked } = game
  const found = lo === hi
  const left = hi - lo + 1
  const need = Math.log2(size)
  const learned = need - Math.log2(left)
  // The cut-off always leaves at least one number on each side.
  const q = Math.min(Math.max(cut, lo), Math.max(lo, hi - 1))
  const ask = () => {
    const yes = target <= q
    const next = yes ? { lo, hi: q } : { lo: q + 1, hi }
    const removed = left - (next.hi - next.lo + 1)
    setGame({ ...game, ...next, asked: asked + 1, tiny: game.tiny || (removed === 1 && left >= 4) })
    setCut(Math.floor((next.lo + next.hi - 1) / 2))
  }
  const restart = (n: number) => {
    setGame(newGame(n, rng.int(1, n)))
    setCut(Math.floor(n / 2))
  }
  return (
    <LabSection id="explore" eyebrow="Explore" title="Twenty questions">
      <Prose>
        <p>
          I'm thinking of a whole number. You may only ask “is it at most <Tex>{'k'}</Tex>?”. Choose{' '}
          <Tex>{'k'}</Tex> with the slider and ask. Each answer rules some numbers out. How few
          questions can you get away with?
        </p>
      </Prose>
      <PredictReveal
        question="With 32 possible numbers and perfect questions, how many questions do you need to be sure?"
        options={['3', '5', '16', '32']}
        answer={1}
        explanation="Each perfect question halves what's left: 32 → 16 → 8 → 4 → 2 → 1. That's $\log_2 32 = 5$ questions, so finding one of 32 equally likely numbers is 5 bits of information."
      />
      <Figure>
        <div className="flex flex-wrap items-center gap-3 px-3 pt-3 sm:px-4">
          <Segmented
            label="How many numbers"
            size="sm"
            value={String(size)}
            onChange={(v) => restart(Number(v))}
            options={['16', '32', '64'].map((v) => ({ value: v, label: `1 to ${v}` }))}
          />
          <Button
            size="sm"
            variant="ghost"
            icon={<Shuffle className="size-4" />}
            onClick={() => restart(size)}
          >
            New number
          </Button>
        </div>
        <div
          className="grid gap-1 px-3 pt-3 sm:px-4"
          style={{ gridTemplateColumns: `repeat(${size === 64 ? 16 : 8}, minmax(0, 1fr))` }}
          role="img"
          aria-label={`Numbers ${lo} to ${hi} are still possible`}
        >
          {Array.from({ length: size }, (_, i) => i + 1).map((k) => {
            const alive = k >= lo && k <= hi
            return (
              <div
                key={k}
                className={cn(
                  'rounded py-1 text-center text-xs tabular-nums',
                  alive ? 'bg-surface-2 text-ink' : 'text-ink-3 opacity-40',
                  found && k === target && 'font-bold',
                )}
                style={
                  found && k === target
                    ? { background: BITS, color: 'var(--surface)' }
                    : alive && k <= q
                      ? { boxShadow: `inset 0 -3px 0 ${PROB}` }
                      : undefined
                }
              >
                {k}
              </div>
            )
          })}
        </div>
        <div className="px-3 pt-3 sm:px-4">
          <Slider
            label={found ? 'Found it!' : `Question: is it at most ${q}?`}
            name="Question cut-off"
            value={q}
            min={lo}
            max={Math.max(lo, hi - 1)}
            step={1}
            onChange={setCut}
            color={PROB}
            disabled={found}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 px-3 pt-3 sm:px-4">
          <Button size="sm" variant="primary" onClick={ask} disabled={found}>
            Ask
          </Button>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'questions asked', value: asked },
              { label: 'still possible', value: left },
              { label: 'learned so far', value: bits(learned), color: BITS },
              { label: 'needed in total', value: bits(need) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-found" when={found}>
          Find the number. How many questions did it take?
        </TryThis>
        <TryThis id="t-optimal" when={found && size >= 32 && asked <= need}>
          With 32 or 64 numbers, find it in exactly <Tex>{'\\log_2 N'}</Tex> questions.
        </TryThis>
        <TryThis id="t-lopsided" when={game.tiny}>
          Ask a lopsided question that can rule out only one number. How many bits did you learn
          when it didn't?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const probsOf = (w: readonly number[]) => {
  const total = w.reduce((s, x) => s + x, 0)
  return total > 0 ? w.map((x) => x / total) : null
}

function OutcomeBars({ ps }: { ps: readonly number[] }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {ps.map((p, i) => (
        <div key={i} className="flex min-w-0 flex-col items-center gap-1 text-xs">
          <div className="flex h-28 w-full items-end justify-center rounded bg-surface-2">
            <div
              className="w-3/5 rounded-t"
              style={{ height: `${p * 100}%`, background: COLS[i], opacity: 0.8 }}
            />
          </div>
          <span className="font-semibold">{LETTERS[i]}</span>
          <span className="tabular-nums text-ink-2">p = {formatNumber(p, 3)}</span>
          <span className="tabular-nums" style={{ color: SURPRISE }}>
            {p > 0 ? surprisal(p) : 'never'}
          </span>
        </div>
      ))}
    </div>
  )
}

function SurpriseExplorer() {
  const [w, setW] = useState([4, 2, 1, 1])
  const ps = probsOf(w)
  const H = ps ? entropyBits(ps) : 0
  const set = (i: number) => (v: number) => setW(w.map((x, j) => (j === i ? v : x)))
  return (
    <LabSection id="surprise" eyebrow="Explore" title="Average surprise">
      <Prose>
        <p>
          A source spits out A, B, C or D. Set how often each appears. Under each bar is that
          letter's surprisal, <Tex>{'-\\log_2 p'}</Tex>: rare letters surprise you more. The entropy
          weights each surprise by how often it happens.
        </p>
      </Prose>
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          {ps ? (
            <OutcomeBars ps={ps} />
          ) : (
            <p className="py-10 text-center text-sm text-ink-2">
              Give at least one letter a weight.
            </p>
          )}
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:mt-3 sm:grid-cols-2 sm:px-4">
          {w.map((x, i) => (
            <Slider
              key={i}
              label={`Weight of ${LETTERS[i]}`}
              value={x}
              min={0}
              max={8}
              step={1}
              onChange={set(i)}
              color={COLS[i]}
            />
          ))}
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'entropy H', value: ps ? bits(H) : '—', color: BITS },
              { label: 'most possible with 4 letters', value: bits(2) },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-max" when={ps != null && H >= 1.999}>
          Make the source as unpredictable as possible. What is the entropy?
        </TryThis>
        <TryThis id="t-certain" when={ps != null && H < 1e-9}>
          Make the source completely predictable. How surprising is it now?
        </TryThis>
        <TryThis id="t-one-bit" when={ps != null && Math.abs(H - 1) < 0.005}>
          Get exactly 1 bit of entropy. What does that source behave like?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

type FreqKind = 'skewed' | 'even'
type CodeKind = 'fixed' | 'short'

const FREQS: Record<FreqKind, number[]> = {
  skewed: [0.5, 0.25, 0.125, 0.125],
  even: [0.25, 0.25, 0.25, 0.25],
}
const CODES: Record<CodeKind, string[]> = {
  fixed: ['00', '01', '10', '11'],
  short: ['0', '10', '110', '111'],
}

/** A fixed 32-letter message for each frequency set, drawn once from a seeded generator. */
const MESSAGES: Record<FreqKind, number[]> = (() => {
  const gen = createRng(99)
  return {
    skewed: Array.from({ length: 32 }, () => gen.weighted(FREQS.skewed)),
    even: Array.from({ length: 32 }, () => gen.weighted(FREQS.even)),
  }
})()

function CodeExplorer() {
  const [freq, setFreq] = useState<FreqKind>('skewed')
  const [code, setCode] = useState<CodeKind>('fixed')
  const msg = MESSAGES[freq]
  const words = msg.map((s) => CODES[code][s])
  const used = words.join('').length
  const H = entropyBits(FREQS[freq])
  const expected = FREQS[freq].reduce((s, p, i) => s + p * CODES[code][i].length, 0)
  return (
    <LabSection id="codes" eyebrow="Explore" title="Entropy is the price of compression">
      <Prose>
        <p>
          Send a 32-letter message in binary. The fixed code spends 2 digits on every letter. The
          short code gives A a single digit and pays for it with 3 digits for C and D; no codeword
          starts another, so the message can still be decoded. Which wins depends on how often each
          letter turns up.
        </p>
      </Prose>
      <Figure>
        <div className="flex flex-wrap gap-3 px-3 pt-3 sm:px-4">
          <Segmented
            label="Letter frequencies"
            size="sm"
            value={freq}
            onChange={setFreq}
            options={[
              { value: 'skewed', label: 'A ½, B ¼, C ⅛, D ⅛' },
              { value: 'even', label: 'All ¼' },
            ]}
          />
          <Segmented
            label="Code"
            size="sm"
            value={code}
            onChange={setCode}
            options={[
              { value: 'fixed', label: 'Fixed: 00 01 10 11' },
              { value: 'short', label: 'Short: 0 10 110 111' },
            ]}
          />
        </div>
        <div className="px-3 pt-3 font-mono text-sm sm:px-4">
          <p className="break-all tracking-wide">
            {msg.map((s, i) => (
              <span key={i} style={{ color: COLS[s] }}>
                {LETTERS[s]}
              </span>
            ))}
          </p>
          <p className="mt-2 break-all text-xs leading-relaxed">
            {words.map((wd, i) => (
              <span key={i} style={{ color: COLS[msg[i]] }}>
                {wd}
                {i < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'digits used', value: used },
              { label: 'per letter (this message)', value: formatNumber(used / msg.length, 3) },
              { label: 'per letter (on average)', value: formatNumber(expected, 3) },
              { label: 'entropy', value: bits(H), color: BITS },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-match" when={freq === 'skewed' && code === 'short'}>
          Use the short code on the skewed letters. How close is it to the entropy?
        </TryThis>
        <TryThis id="t-even" when={freq === 'even' && code === 'short'}>
          Now try the short code on evenly spread letters. Does it still save digits?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [w, setW] = useState([1, 1, 1, 1])
  const ps = probsOf(w)
  const H = ps ? entropyBits(ps) : 0
  const set = (i: number) => (v: number) => setW(w.map((x, j) => (j === i ? v : x)))
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-coin"
          index={1}
          prompt="What is the entropy of a fair coin, in bits?"
          answer={1}
          explanation="$H = \tfrac12 \cdot 1 + \tfrac12 \cdot 1 = 1$ bit: one fair yes/no answer."
        />
        <NumericChallenge
          id="c-die"
          index={2}
          prompt="What is the entropy of a fair 8-sided die, in bits?"
          answer={3}
          explanation="Eight equally likely outcomes: $\log_2 8 = 3$ bits, three halvings."
        />
        <NumericChallenge
          id="c-surprisal"
          index={3}
          prompt="An event has probability $\tfrac14$. How many bits of surprise does it carry?"
          answer={2}
          explanation="$-\log_2 \tfrac14 = 2$ bits."
        />
        <NumericChallenge
          id="c-mixed"
          index={4}
          prompt="What is the entropy of a source with probabilities $\tfrac12, \tfrac14, \tfrac14$?"
          answer={1.5}
          tolerance={0.001}
          explanation="$\tfrac12 \cdot 1 + \tfrac14 \cdot 2 + \tfrac14 \cdot 2 = 1.5$ bits."
        />
        <McqChallenge
          id="c-highest"
          index={5}
          prompt="Which source has the highest entropy?"
          options={[
            { text: 'Four outcomes, each with chance ¼', correct: true },
            {
              text: 'Four outcomes with chances ½, ¼, ⅛, ⅛',
              why: 'Uneven odds are more predictable: 1.75 bits.',
            },
            {
              text: 'A coin that lands heads 99% of the time',
              why: 'Almost certain: about 0.08 bits.',
            },
            { text: 'A fair coin', why: 'Only 1 bit; four even outcomes give 2.' },
          ]}
          explanation="Entropy is largest when there are more outcomes and they are equally likely: $\log_2 4 = 2$ bits."
        />
        <InteractiveChallenge
          id="c-one-and-half"
          index={6}
          prompt="Set the weights so the source has exactly 1.5 bits of entropy."
          solved={ps != null && Math.abs(H - 1.5) < 0.005}
          hint="Try $\tfrac12, \tfrac14, \tfrac14$ with the fourth letter switched off."
          explanation="Weights $2, 1, 1, 0$ give probabilities $\tfrac12, \tfrac14, \tfrac14, 0$ and $H = 0.5 + 0.5 + 0.5 = 1.5$ bits."
          onReset={() => setW([1, 1, 1, 1])}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            {ps && <OutcomeBars ps={ps} />}
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {w.map((x, i) => (
                <Slider
                  key={i}
                  label={`Weight of ${LETTERS[i]}`}
                  value={x}
                  min={0}
                  max={8}
                  step={1}
                  onChange={set(i)}
                  color={COLS[i]}
                />
              ))}
            </div>
            <p className="text-sm">Entropy: {ps ? bits(H) : '—'}</p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

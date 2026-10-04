import { useState } from 'react'
import { FastForward, StepForward } from 'lucide-react'
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
import { Circle, Label, Plot, Point, Polyline } from '@/viz'
import {
  PRIMES,
  gcd,
  isPrime,
  modPow,
  order,
  powers,
  rsaKey,
  trialDivisions,
  validExponents,
} from '../_shared/numberTheory'

const PATH = 'var(--c-violet)'
const ONE = 'var(--c-green)'
const PUBLIC = 'var(--c-blue)'
const PRIVATE = 'var(--c-red)'

const BIG_PRIMES = PRIMES.filter((p) => p >= 11)
const WORD = 'MATH'

/** Position of residue k on a clock with n hours, 0 at the top, going clockwise. */
const clockAt = (k: number, n: number): Vec2 => {
  const a = Math.PI / 2 - (2 * Math.PI * k) / n
  return [Math.cos(a), Math.sin(a)]
}

export default function RsaCryptographyLab() {
  return (
    <div className="space-y-16">
      <LabSection id="idea" eyebrow="The big idea" title="A lock anyone can close">
        <Prose>
          <p>
            When your browser shows a padlock, it has agreed a secret with a website it has never
            met, over a network anyone can listen to. How? With{' '}
            <strong>public-key cryptography</strong>: the site publishes a lock that anyone can snap
            shut, but only the site holds the key that opens it.
          </p>
          <p>
            <strong>RSA</strong> builds that lock from clock arithmetic. Raising numbers to powers
            on a clock scrambles them in a way that a second, secret power undoes. Making the lock
            only needs two primes multiplied together; picking it open means splitting that product
            back into its primes, which nobody knows how to do quickly for huge numbers.
          </p>
        </Prose>
      </LabSection>
      <ClockExplorer />
      <KeyExplorer />
      <FactorExplorer />
      <LabSection id="formalize" eyebrow="Formalize" title="How RSA works">
        <Formula
          tex={'n = pq \\qquad \\varphi = (p - 1)(q - 1) \\qquad ed \\equiv 1 \\pmod{\\varphi}'}
          caption="Key making: two secret primes, the public modulus n, and exponents e (public) and d (private)."
        />
        <Formula
          tex={'c = m^e \\bmod n \\qquad m = c^d \\bmod n'}
          caption="Encrypt with the public key (n, e); decrypt with the private key d."
        />
        <Prose>
          <ul>
            <li>
              <strong>Why decryption works:</strong> Euler's theorem says{' '}
              <Tex>{'m^{\\varphi} \\equiv 1 \\pmod n'}</Tex> when <Tex>{'m'}</Tex> shares no factor
              with <Tex>{'n'}</Tex>. Since <Tex>{'ed = 1 + k\\varphi'}</Tex>,{' '}
              <Tex>{'(m^e)^d = m \\cdot (m^{\\varphi})^k \\equiv m'}</Tex>.
            </li>
            <li>
              <strong>Finding d</strong> needs <Tex>{'\\varphi'}</Tex>, and <Tex>{'\\varphi'}</Tex>{' '}
              needs <Tex>{'p'}</Tex> and <Tex>{'q'}</Tex>. Anyone who could factor <Tex>{'n'}</Tex>{' '}
              could compute <Tex>{'d'}</Tex>: the security rests on factoring being hard.
            </li>
            <li>
              <strong>Fast powers:</strong> <Tex>{'m^e \\bmod n'}</Tex> is computed by repeated
              squaring in about <Tex>{'\\log_2 e'}</Tex> steps, keeping numbers small by reducing
              mod <Tex>{'n'}</Tex> after every multiplication.
            </li>
            <li>
              <strong>Real keys</strong> use primes hundreds of digits long, and the message is
              padded with random bytes first.
            </li>
          </ul>
        </Prose>
        <Callout kind="misconception" title="Encrypting letter by letter isn't safe">
          <p>
            This lab encrypts one letter at a time so you can see it work, but that's a substitution
            cipher in disguise: every M becomes the same number, so letter frequencies give the game
            away. Real RSA encrypts a large, randomly padded number (usually a key for a fast
            symmetric cipher), never single letters.
          </p>
        </Callout>
      </LabSection>
      <Practice />
      <LabSection id="real-world" eyebrow="Real world" title="Where RSA works">
        <RealWorld
          items={[
            {
              title: 'The padlock in your browser',
              body: 'HTTPS uses public-key methods (RSA or elliptic curves) to agree a shared secret, then a fast cipher for the rest.',
            },
            {
              title: 'Digital signatures',
              body: 'Run RSA backwards: sign with the private key, and anyone can check with the public one. Software updates and bank transfers are signed this way.',
            },
            {
              title: 'Email and messaging',
              body: 'PGP and many secure messengers encrypt a message key for each recipient’s public key.',
            },
            {
              title: 'The quantum threat',
              body: 'Shor’s algorithm would factor large n on a big quantum computer, which is why “post-quantum” cryptography is being rolled out now.',
            },
          ]}
        />
      </LabSection>
      <LabSection id="takeaways" eyebrow="Remember" title="Key takeaways">
        <Takeaways
          items={[
            'Powers on a clock (mod n) cycle back; RSA uses that cycle to undo encryption.',
            'Public key $(n, e)$ locks: $c = m^e \\bmod n$. Private key $d$ unlocks: $m = c^d \\bmod n$.',
            '$d$ is the inverse of $e$ mod $\\varphi = (p - 1)(q - 1)$.',
            'Security rests on factoring $n = pq$ being infeasible for huge primes.',
          ]}
        />
      </LabSection>
    </div>
  )
}

function ClockExplorer() {
  const [n, setN] = useState(10)
  const [a, setA] = useState(3)
  const base = Math.min(a, n - 1)
  const seq = powers(base, n)
  const ord = order(base, n)
  const shown = ord ?? Math.min(n, 12)
  // A full cycle closes back on a, so draw the last hop from 1 to a as well.
  const path = ord == null ? seq.slice(0, shown) : [...seq.slice(0, shown), seq[0]]
  const pts = path.map((k) => clockAt(k, n))
  return (
    <LabSection id="explore" eyebrow="Explore" title="Powers on a clock">
      <Prose>
        <p>
          On a clock with <Tex>{'n'}</Tex> hours, work out <Tex>{'a, a^2, a^3, \\ldots'}</Tex> and
          keep only the remainder after dividing by <Tex>{'n'}</Tex>. The violet path joins the
          powers in order. Does it ever come back to 1?
        </p>
      </Prose>
      <PredictReveal
        question="On a 7-hour clock, what is $3^6 \bmod 7$?"
        options={['0', '1', '3', '6']}
        answer={1}
        explanation="$3^6 = 729 = 104 \times 7 + 1$. For a prime clock $p$, any $a$ not divisible by $p$ has $a^{p-1} \equiv 1$: Fermat's little theorem, the seed of RSA."
      />
      <Figure>
        <div className="mx-auto w-full max-w-sm">
          <Plot
            view={{ xMin: -1.35, xMax: 1.35, yMin: -1.35, yMax: 1.35 }}
            aspect="equal"
            grid={false}
            axes={false}
            ariaLabel={`Powers of ${base} modulo ${n}: ${seq.slice(0, shown).join(', ')}`}
          >
            <Circle center={[0, 0]} r={1} stroke="var(--line)" strokeWidth={1.5} />
            <Polyline points={pts} color={PATH} width={2.5} />
            {Array.from({ length: n }, (_, k) => {
              const p = clockAt(k, n)
              const visited = seq.slice(0, shown).includes(k)
              return (
                <Point
                  key={k}
                  at={p}
                  r={visited ? 5 : 3}
                  color={k === 1 ? ONE : visited ? PATH : 'var(--ink-3)'}
                  hollow={!visited}
                />
              )
            })}
            {Array.from({ length: n }, (_, k) => (
              <Label
                key={`l-${k}`}
                at={[1.18 * clockAt(k, n)[0], 1.18 * clockAt(k, n)[1]]}
                anchor="center"
                className="text-xs"
                color={k === 1 ? ONE : undefined}
              >
                {k}
              </Label>
            ))}
          </Plot>
        </div>
        <div className="grid gap-x-6 gap-y-3 border-t border-line px-3 pt-3 sm:grid-cols-2 sm:px-4">
          <Slider label="Clock size n" value={n} min={5} max={30} step={1} onChange={setN} />
          <Slider
            label="Base a"
            value={base}
            min={2}
            max={n - 1}
            step={1}
            onChange={setA}
            color={PATH}
          />
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              {
                label: `powers of ${base} mod ${n}`,
                value: `${seq.slice(0, 10).join(', ')}${n > 10 ? ', …' : ''}`,
              },
              {
                label: 'back to 1 after',
                value: ord == null ? `never (${base} and ${n} share a factor)` : `${ord} steps`,
                color: ONE,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-fermat" when={isPrime(n) && n >= 11}>
          Pick a prime clock of 11 or more. Whatever the base, which power lands on 1?
        </TryThis>
        <TryThis id="t-full" when={isPrime(n) && ord === n - 1}>
          On a prime clock, find a base whose powers visit every hour except 0.
        </TryThis>
        <TryThis id="t-stuck" when={gcd(base, n) > 1}>
          Pick a base that shares a factor with <Tex>{'n'}</Tex>. Does it ever get back to 1?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function PrimeSlider({
  label,
  value,
  onChange,
  color,
}: {
  label: string
  value: number
  onChange: (p: number) => void
  color?: string
}) {
  return (
    <Slider
      label={label}
      value={BIG_PRIMES.indexOf(value)}
      min={0}
      max={BIG_PRIMES.length - 1}
      step={1}
      format={(i) => String(BIG_PRIMES[i])}
      onChange={(i) => onChange(BIG_PRIMES[i])}
      color={color}
    />
  )
}

function KeyExplorer() {
  const [p, setP] = useState(11)
  const [q, setQ] = useState(13)
  const [ei, setEi] = useState(0)
  const same = p === q
  const phi = (p - 1) * (q - 1)
  const options = validExponents(phi)
  const e = options[Math.min(ei, options.length - 1)]
  const { n, d } = rsaKey(p, q, e)
  const rows = [...WORD].map((ch) => {
    const m = ch.charCodeAt(0) - 64
    const c = modPow(m, e, n)
    return { ch, m, c, back: d == null ? null : modPow(c, d, n) }
  })
  return (
    <LabSection id="keys" eyebrow="Explore" title="Make a key pair">
      <Prose>
        <p>
          Choose two different primes. Their product <Tex>{'n'}</Tex> and an exponent{' '}
          <Tex>{'e'}</Tex> form the <strong>public key</strong>; the matching <Tex>{'d'}</Tex> is
          the <strong>private key</strong>. Then watch the word {WORD} (as numbers A = 1, B = 2, …)
          get locked with <Tex>{'e'}</Tex> and unlocked with <Tex>{'d'}</Tex>.
        </p>
      </Prose>
      <Figure>
        <div className="grid gap-x-6 gap-y-3 px-3 pt-3 sm:grid-cols-3 sm:px-4">
          <PrimeSlider label="Prime p" value={p} onChange={setP} />
          <PrimeSlider label="Prime q" value={q} onChange={setQ} />
          <Slider
            label="Public exponent e"
            value={Math.min(ei, options.length - 1)}
            min={0}
            max={Math.max(0, options.length - 1)}
            step={1}
            format={(i) => String(options[i])}
            onChange={setEi}
            color={PUBLIC}
          />
        </div>
        {same ? (
          <p className="px-3 py-6 text-center text-sm sm:px-4">
            <strong>p and q must be different.</strong> With <Tex>{'n = p^2'}</Tex>, anyone can take
            a square root and break the key at once.
          </p>
        ) : (
          <div className="overflow-x-auto px-3 pt-3 sm:px-4">
            <table className="w-full text-center text-sm tabular-nums">
              <thead className="text-ink-2">
                <tr>
                  <th className="py-1 font-medium">letter</th>
                  <th className="py-1 font-medium">m</th>
                  <th className="py-1 font-medium">locked: c = mᵉ mod n</th>
                  <th className="py-1 font-medium">unlocked: cᵈ mod n</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.ch} className="border-t border-line">
                    <td className="py-1 font-semibold">{r.ch}</td>
                    <td className="py-1">{r.m}</td>
                    <td className="py-1">{r.c}</td>
                    <td className="py-1">
                      {r.back} → {r.back == null ? '?' : String.fromCharCode(64 + r.back)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'public n = pq', value: same ? '—' : n, color: PUBLIC },
              { label: 'public e', value: e, color: PUBLIC },
              { label: 'secret φ = (p−1)(q−1)', value: same ? '—' : phi, color: PRIVATE },
              { label: 'private d', value: same || d == null ? '—' : d, color: PRIVATE },
              { label: 'check e·d mod φ', value: same || d == null ? '—' : (e * d) % phi },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-big-n" when={!same && n > 5000}>
          Use primes big enough that <Tex>{'n'}</Tex> is over 5,000. Does the word still come back?
        </TryThis>
        <TryThis id="t-e3" when={!same && e === 3}>
          Find primes that allow the smallest exponent, <Tex>{'e = 3'}</Tex>. What must be true of{' '}
          <Tex>{'\\varphi'}</Tex>?
        </TryThis>
        <TryThis id="t-same" when={same}>
          Set <Tex>{'p = q'}</Tex>. Why does RSA need two different primes?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

const SEMIS = [
  { p: 11, q: 13 },
  { p: 37, q: 41 },
  { p: 101, q: 103 },
  { p: 503, q: 509 },
  { p: 1009, q: 1013 },
  { p: 10007, q: 10009 },
].map((s) => ({ ...s, n: s.p * s.q }))

function FactorExplorer() {
  const [idx, setIdx] = useState(0)
  const [d, setD] = useState(1)
  const [tries, setTries] = useState(0)
  const { n } = SEMIS[idx]
  const found = d > 1 && n % d === 0
  const step = () => {
    const next = d === 1 ? 2 : d === 2 ? 3 : d + 2
    setD(next)
    setTries(tries + 1)
  }
  const finish = () => {
    const r = trialDivisions(n)
    setD(r.factor)
    setTries(r.tries)
  }
  return (
    <LabSection id="factor" eyebrow="Explore" title="Why the lock holds">
      <Prose>
        <p>
          To break a key you must split <Tex>{'n'}</Tex> back into <Tex>{'p \\times q'}</Tex>. The
          simplest attack is trial division: try 2, 3, 5, 7, … until one divides. Step through a
          small one by hand, then let the computer race the bigger ones and watch the count grow.
        </p>
      </Prose>
      <Figure>
        <div className="px-3 pt-3 sm:px-4">
          <Segmented
            label="Number to factor"
            size="sm"
            value={String(idx)}
            onChange={(v) => {
              setIdx(Number(v))
              setD(1)
              setTries(0)
            }}
            options={SEMIS.map((s, i) => ({ value: String(i), label: s.n.toLocaleString('en') }))}
          />
        </div>
        <div className="px-3 pt-4 text-center sm:px-4">
          <p className="text-2xl font-semibold tabular-nums">{n.toLocaleString('en')}</p>
          <p className="mt-1 text-sm text-ink-2">
            {d === 1
              ? 'No divisor tried yet.'
              : found
                ? `${d} divides it: ${n.toLocaleString('en')} = ${d.toLocaleString('en')} × ${(n / d).toLocaleString('en')}`
                : `${n.toLocaleString('en')} ÷ ${d} leaves remainder ${n % d}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 px-3 pt-3 sm:px-4">
          <Button
            size="sm"
            variant="primary"
            icon={<StepForward className="size-4" />}
            onClick={step}
            disabled={found}
          >
            Try the next divisor
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<FastForward className="size-4" />}
            onClick={finish}
            disabled={found}
          >
            Run to the end
          </Button>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <Readouts
            items={[
              { label: 'divisions tried', value: tries.toLocaleString('en') },
              { label: '√n (no need to go past it)', value: formatNumber(Math.sqrt(n), 1) },
              {
                label: 'a real 617-digit key',
                value: '≈ 10³⁰⁸ divisions',
                color: PRIVATE,
              },
            ]}
          />
        </div>
      </Figure>
      <TryThisList>
        <TryThis id="t-by-hand" when={idx === 0 && found}>
          Factor 143 by trying divisors one at a time.
        </TryThis>
        <TryThis id="t-race" when={idx >= 4 && found}>
          Race one of the 7- or 9-digit numbers. Each extra pair of digits multiplies the work by
          about how much?
        </TryThis>
      </TryThisList>
    </LabSection>
  )
}

function Practice() {
  const [p, setP] = useState(11)
  const [q, setQ] = useState(11)
  return (
    <LabSection id="practice" eyebrow="Practice" title="Check your understanding">
      <ChallengeSet>
        <NumericChallenge
          id="c-power"
          index={1}
          prompt="What is $3^4 \bmod 5$?"
          answer={1}
          explanation="$3^4 = 81 = 16 \times 5 + 1$, so the remainder is 1."
        />
        <NumericChallenge
          id="c-phi-lab"
          index={2}
          prompt="With primes $p = 5$ and $q = 11$, what is $\varphi = (p - 1)(q - 1)$?"
          answer={40}
          explanation="$4 \times 10 = 40$."
        />
        <NumericChallenge
          id="c-d"
          index={3}
          prompt="With $\varphi = 40$ and $e = 3$, find the private exponent $d$ (between 1 and 39) with $ed \equiv 1 \pmod{40}$."
          answer={27}
          hint="Look for a multiple of 3 that is one more than a multiple of 40."
          explanation="$3 \times 27 = 81 = 2 \times 40 + 1$, so $d = 27$."
        />
        <McqChallenge
          id="c-public"
          index={4}
          prompt="Which numbers does an RSA user publish?"
          options={[
            { text: '$n$ and $e$', correct: true },
            { text: '$p$ and $q$', why: 'Publishing them would let anyone compute $d$.' },
            { text: '$d$ and $\\varphi$', why: 'These are exactly what must stay secret.' },
            { text: '$n$ and $d$', why: '$d$ is the private key.' },
          ]}
          explanation="The public key is $(n, e)$. Everything else, $p$, $q$, $\varphi$ and $d$, stays private."
        />
        <NumericChallenge
          id="c-encrypt-lab"
          index={5}
          prompt="Encrypt $m = 2$ with the public key $n = 33$, $e = 3$."
          answer={8}
          explanation="$c = 2^3 \bmod 33 = 8$."
        />
        <InteractiveChallenge
          id="c-factor-391"
          index={6}
          prompt="Break a toy key: choose the two primes whose product is $n = 391$."
          solved={p * q === 391}
          hint="$\sqrt{391} \approx 19.8$, so one prime is below 20."
          explanation="$391 = 17 \times 23$. With $p$ and $q$ known, $\varphi = 16 \times 22 = 352$, and the private key follows."
          onReset={() => {
            setP(11)
            setQ(11)
          }}
        >
          <div className="space-y-3 rounded-xl border border-line p-3">
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <PrimeSlider label="Prime p" value={p} onChange={setP} />
              <PrimeSlider label="Prime q" value={q} onChange={setQ} />
            </div>
            <p className="text-sm tabular-nums">
              p × q = {p} × {q} = {p * q}{' '}
              {p * q === 391 ? '✓' : p * q < 391 ? '(too small)' : '(too big)'}
            </p>
          </div>
        </InteractiveChallenge>
      </ChallengeSet>
    </LabSection>
  )
}

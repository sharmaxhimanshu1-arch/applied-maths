import type { ContentModule } from './types'

const content: ContentModule = {
  'fourier-series': {
    hook: 'A violin and a flute playing the same note sound different because each is a **mix of pure tones**. Fourier’s astonishing claim was that every repeating signal, even one with sharp corners like a square wave, is a sum of sine waves. Spinning circles stacked on circles can draw any of them.',
    explore: {
      type: 'fourier',
      props: { wave: 'square', terms: 1 },
      caption:
        'Left: one circle per sine wave, each spinning at its own speed. Right: their combined height (blue) against the target wave (dashed).',
      tryThis: [
        {
          id: 't-many',
          text: 'Add at least 10 sine waves. Where does the sum still overshoot?',
          when: (s) => s.terms >= 10,
        },
        {
          id: 't-spin',
          text: 'Spin the circles and watch the tip trace the wave.',
          when: (s) => s.playing,
        },
        {
          id: 't-triangle',
          text: 'Switch to the triangle wave. Why do so few terms already match it well?',
          when: (s) => s.wave === 'triangle',
        },
      ],
    },
    explain:
      'A function with period $2\\pi$ can be written as\n\n$$f(x) = a_0 + \\sum_{k=1}^{\\infty} \\left(a_k\\cos kx + b_k\\sin kx\\right),$$\n\nwith coefficients found by integration, e.g. $b_k = \\tfrac1\\pi\\int_{-\\pi}^{\\pi} f(x)\\sin kx\\,dx$. Each term is a pure tone at $k$ times the base frequency.\n\nSmooth waves need few terms; sharp jumps need many, and near a jump the partial sums always overshoot by about 9% (the **Gibbs phenomenon**). The list of coefficients is the signal’s **spectrum**: how much of each frequency it contains.',
    formula: {
      tex: '\\text{square}(x) = \\frac{4}{\\pi}\\sum_{k \\text{ odd}} \\frac{\\sin kx}{k}',
      caption: 'A square wave is made only of odd harmonics.',
    },
    misconception:
      'Adding more terms does not remove the overshoot at a jump; it only squeezes it into a narrower spike.',
    checks: [
      {
        kind: 'mcq',
        id: 'c-odd',
        prompt: 'Which frequencies appear in the square wave’s series?',
        options: [
          { text: 'Only odd multiples: 1, 3, 5, …', correct: true },
          { text: 'All multiples: 1, 2, 3, …', why: 'Its symmetry cancels the even ones.' },
          { text: 'Only the base frequency', why: 'One sine is smooth; corners need more.' },
        ],
        explain: '$\\sin x + \\tfrac13\\sin 3x + \\tfrac15\\sin 5x + \\dots$',
      },
      {
        kind: 'numeric',
        id: 'c-amp',
        prompt:
          'In the square wave series, the 5th harmonic’s amplitude is what fraction of the 1st’s?',
        answer: 0.2,
        explain: 'Amplitudes go like $1/k$: $1/5$.',
      },
      {
        kind: 'mcq',
        id: 'c-smooth',
        prompt: 'Why does the triangle wave converge faster than the square wave?',
        options: [
          { text: 'It has no jumps, so its coefficients shrink like $1/k^2$', correct: true },
          { text: 'It has fewer harmonics', why: 'Both use the odd harmonics.' },
          { text: 'It has a lower frequency', why: 'They have the same period.' },
        ],
        explain: 'Smoother functions have faster-decaying coefficients.',
      },
    ],
    realWorld: [
      {
        title: 'Music and audio',
        body: 'Equalisers, MP3 compression and auto-tune all work on the frequency spectrum of sound.',
      },
      {
        title: 'Images',
        body: 'JPEG stores a photo as a sum of 2-D cosine patterns and discards the fine ones you won’t notice.',
      },
    ],
    takeaways: [
      'Periodic signals are sums of sine and cosine waves.',
      'Coefficients (the spectrum) say how much of each frequency there is.',
      'Jumps need many terms and cause overshoot.',
    ],
  },

  'rsa-cryptography': {
    hook: 'How can a stranger send you a secret over the internet, when everyone can see the messages? RSA uses a lock anyone can close but only you can open. Its security rests on a simple fact: multiplying two primes is easy, but **factoring** the result back apart is extraordinarily hard.',
    explore: {
      type: 'numberTheory',
      props: { mode: 'rsa', p: 11, q: 13 },
      caption:
        'Pick two secret primes and a message. The public key is $(n, e)$; the private key $d$ undoes the encryption.',
      tryThis: [
        {
          id: 't-big',
          text: 'Choose primes that make $n$ bigger than 400.',
          when: (s) => s.mode === 'rsa' && s.n > 400,
        },
        {
          id: 't-message',
          text: 'Encrypt the message 100. Is the ciphertext anything like 100?',
          when: (s) => s.mode === 'rsa' && s.m === 100,
        },
        {
          id: 't-221',
          text: 'Someone publishes $n = 221$. Find the primes that make it (that is how the key would be broken).',
          when: (s) => s.mode === 'rsa' && s.n === 221,
        },
      ],
    },
    explain:
      'Choose primes $p, q$ and let $n = pq$ and $\\varphi = (p - 1)(q - 1)$. Pick $e$ with no common factor with $\\varphi$, and find $d$ with $ed \\equiv 1 \\pmod{\\varphi}$. Publish $(n, e)$; keep $d$ secret.\n\nTo encrypt a number $m < n$: $c = m^e \\bmod n$. To decrypt: $m = c^d \\bmod n$. It works because of Euler’s theorem from modular arithmetic. Finding $d$ requires $\\varphi$, which requires $p$ and $q$; real keys use primes hundreds of digits long, far beyond any computer’s ability to factor.',
    formula: {
      tex: 'c = m^e \\bmod n, \\qquad m = c^d \\bmod n, \\qquad ed \\equiv 1 \\pmod{(p-1)(q-1)}',
      caption: 'Encrypt with the public key, decrypt with the private one.',
    },
    misconception:
      'The encryption method is not secret: everyone knows how RSA works. Only the private key $d$ (and the primes) must stay hidden.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-phi',
        prompt: 'For $p = 5$, $q = 11$, what is $\\varphi = (p - 1)(q - 1)$?',
        answer: 40,
        explain: '$4 \\times 10 = 40$.',
      },
      {
        kind: 'numeric',
        id: 'c-encrypt',
        prompt: 'With $n = 33$ and $e = 3$, encrypt $m = 4$: what is $4^3 \\bmod 33$?',
        answer: 31,
        explain: '$64 = 33 + 31$, so $c = 31$.',
      },
      {
        kind: 'mcq',
        id: 'c-security',
        prompt: 'Why is RSA hard to break?',
        options: [
          { text: 'Factoring a huge $n$ into $p \\times q$ is infeasible', correct: true },
          { text: 'The algorithm is kept secret', why: 'RSA is completely public.' },
          { text: 'Modular arithmetic cannot be reversed', why: 'With $d$ it reverses easily.' },
        ],
        explain: 'Knowing $p$ and $q$ gives $d$ immediately; finding them is the hard part.',
      },
    ],
    realWorld: [
      {
        title: 'The padlock in your browser',
        body: 'HTTPS connections use public-key cryptography like RSA to agree on keys with websites you have never met.',
      },
      {
        title: 'Digital signatures',
        body: 'Running RSA “backwards” lets software updates and documents prove who signed them.',
      },
    ],
    takeaways: [
      'Public key $(n, e)$ locks; private key $d$ unlocks.',
      'Security rests on the difficulty of factoring $n = pq$.',
      'It is modular arithmetic and Euler’s theorem in action.',
    ],
  },
}

export default content

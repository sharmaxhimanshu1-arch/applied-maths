import type { ContentModule } from './types'

const content: ContentModule = {
  'markov-chains': {
    hook: 'If it is sunny today, there is an 80% chance it is sunny tomorrow. Simple rules like this, where the next step depends only on where you are now, describe board games, web surfing, language and weather. Run such a **Markov chain** long enough and a remarkable thing happens: the share of time in each state settles to fixed values, whatever the start.',
    explore: {
      type: 'markov',
      props: {
        states: ['Sunny', 'Rainy'],
        P: [
          [0.8, 0.2],
          [0.4, 0.6],
        ],
      },
      caption:
        'Arrows show the chance of each move. Take steps and compare the time spent in each state with the long-run share (the tick mark).',
      tryThis: [
        {
          id: 't-settle',
          text: 'Take at least 1,000 steps. Are the shares within 0.03 of the long-run values?',
          when: (s) => s.steps >= 1000 && s.gap < 0.03,
        },
        {
          id: 't-sunnier',
          text: 'Change the probabilities so that it is sunny more than 80% of the time in the long run.',
          when: (s) => s.stationary[0] > 0.8,
        },
        {
          id: 't-sticky',
          text: 'Make the weather “sticky”: each state stays the same at least 95% of the time. Does the long run change?',
          when: (s) => s.P[0][0] >= 0.95 && s.P[1][1] >= 0.95,
        },
      ],
    },
    explain:
      'A Markov chain is described by a **transition matrix** $P$, where $P_{ij}$ is the chance of moving from state $i$ to state $j$; each row adds to 1. If $\\pi_t$ is the row vector of probabilities at step $t$, then $\\pi_{t+1} = \\pi_t P$.\n\nFor most chains, $\\pi_t$ converges to a **stationary distribution** $\\pi$ with $\\pi P = \\pi$: a left eigenvector of $P$ with eigenvalue 1. For the weather above, $\\pi = (\\tfrac23, \\tfrac13)$. The long-run share of time in each state equals $\\pi$, no matter where you started.',
    formula: {
      tex: '\\pi_{t+1} = \\pi_t P, \\qquad \\pi P = \\pi',
      caption: 'Step forward by multiplying; the long run is an eigenvector.',
    },
    misconception:
      'Markov chains have no memory beyond the current state. Two sunny days in a row do not make a third more likely unless the model says so.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-two-step',
        prompt: 'Sunny today. Using the matrix above, what is the chance it is sunny in two days?',
        answer: 0.72,
        hint: 'Sunny→Sunny→Sunny plus Sunny→Rainy→Sunny.',
        explain: '$0.8 \\times 0.8 + 0.2 \\times 0.4 = 0.72$.',
      },
      {
        kind: 'numeric',
        id: 'c-stationary',
        prompt:
          'For $P = \\begin{pmatrix} 0.5 & 0.5 \\\\ 0.5 & 0.5 \\end{pmatrix}$, what is the long-run share of state 1?',
        answer: 0.5,
        explain: 'Each step forgets the past completely: 50–50.',
      },
      {
        kind: 'mcq',
        id: 'c-rows',
        prompt: 'Each row of a transition matrix must…',
        options: [
          { text: 'add up to 1', correct: true },
          {
            text: 'add up to the number of states',
            why: 'A row lists the probabilities of all next moves.',
          },
          { text: 'have a 1 on the diagonal', why: 'That would mean never leaving.' },
        ],
        explain: 'From any state you must go somewhere next.',
      },
    ],
    realWorld: [
      {
        title: 'Google’s PageRank',
        body: 'A web surfer clicking random links is a Markov chain; a page’s rank is its share of the stationary distribution.',
      },
      {
        title: 'Predictive text',
        body: 'Early text predictors chose the next word from the probabilities of what follows the current one.',
      },
    ],
    takeaways: [
      'The next state depends only on the current one.',
      'Rows of the transition matrix are probability distributions.',
      'Long-run behaviour is the stationary distribution $\\pi P = \\pi$.',
    ],
  },

  'entropy-information': {
    hook: 'Some messages tell you a lot; others tell you almost nothing. Learning that a fair coin landed heads is news; learning that the sun rose this morning is not. Claude Shannon turned this into a number, **entropy**, measured in **bits**: the average surprise of a random outcome, and the limit on how far any data can be compressed.',
    explore: {
      type: 'entropy',
      props: { probs: [0.5, 0.25, 0.25] },
      caption:
        'Drag the bars to change the probabilities. Entropy is the average of each outcome’s surprise.',
      tryThis: [
        {
          id: 't-coin',
          text: 'Make a fair coin: two equally likely outcomes. How many bits?',
          when: (s) => s.k === 2 && s.entropy > 0.999,
        },
        {
          id: 't-certain',
          text: 'Make one outcome almost certain. What happens to the entropy?',
          when: (s) => s.entropy < 0.3,
        },
        {
          id: 't-eight',
          text: 'Make 8 equally likely outcomes. Why is the answer exactly 3 bits?',
          when: (s) => s.k === 8 && s.entropy > 2.99,
        },
      ],
    },
    explain:
      'An outcome with probability $p$ carries $-\\log_2 p$ bits of **surprise**: a 1-in-2 event is 1 bit, 1-in-8 is 3 bits. **Entropy** is the average surprise:\n\n$$H = -\\sum_i p_i \\log_2 p_i.$$\n\nIt is largest, $\\log_2 k$, when all $k$ outcomes are equally likely, and 0 when one is certain. Shannon proved that no code can describe outcomes in fewer than $H$ bits on average, and good codes (like those inside ZIP files) come close by giving common outcomes short codes.',
    formula: {
      tex: 'H = -\\sum_i p_i \\log_2 p_i \\quad \\text{bits}',
      caption: 'Average surprise; at most $\\log_2 k$ for $k$ outcomes.',
    },
    misconception:
      'Entropy is not about meaning. A random string of letters has more entropy than a sentence: it is less predictable, not more useful.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-die',
        prompt: 'What is the entropy of a fair 4-sided die, in bits?',
        answer: 2,
        explain: '$\\log_2 4 = 2$: two yes/no questions always suffice.',
      },
      {
        kind: 'numeric',
        id: 'c-mixed',
        prompt: 'What is the entropy of probabilities $\\tfrac12, \\tfrac14, \\tfrac14$?',
        answer: 1.5,
        explain: '$\\tfrac12 \\cdot 1 + \\tfrac14 \\cdot 2 + \\tfrac14 \\cdot 2 = 1.5$ bits.',
      },
      {
        kind: 'mcq',
        id: 'c-biased',
        prompt: 'A coin lands heads 90% of the time. Its entropy is…',
        options: [
          { text: 'less than 1 bit', correct: true },
          { text: 'exactly 1 bit', why: 'Only a fair coin reaches 1 bit.' },
          { text: 'more than 1 bit', why: 'Two outcomes can never exceed $\\log_2 2 = 1$.' },
        ],
        explain: 'About 0.47 bits: the results are quite predictable.',
      },
    ],
    realWorld: [
      {
        title: 'Compression',
        body: 'ZIP, PNG and MP3 all exploit predictability; entropy sets the floor on how small a file can get.',
      },
      {
        title: 'Machine learning',
        body: 'Classifiers are trained with “cross-entropy”, and decision trees choose questions that reduce entropy the most.',
      },
    ],
    takeaways: [
      'Surprise of an outcome: $-\\log_2 p$ bits.',
      'Entropy is the average surprise; maximal when outcomes are equally likely.',
      'It is the limit of lossless compression.',
    ],
  },

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

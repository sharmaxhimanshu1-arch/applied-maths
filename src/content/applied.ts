import type { ContentModule } from './types'

const content: ContentModule = {
  'logistic-regression': {
    hook: 'Will this email be spam? Will this patient need care? Many questions have yes/no answers, and we want a **probability**, not just a guess. Logistic regression takes a weighted sum of the evidence and squashes it through an S-shaped curve into a number between 0 and 1. It is the simplest learning classifier, and a single artificial neuron.',
    explore: {
      type: 'neuron',
      props: { mode: 'logistic', data: 'split', w: [0, 1, 0] },
      caption:
        'Each point is an example of one of two classes. Shading is the model’s probability of orange; the dashed line is the 50% decision boundary.',
      tryThis: [
        {
          id: 't-separate',
          text: 'Tune the weights by hand (or train) until at least 95% of the points are on the correct side.',
          when: (s) => s.mode === 'logistic' && s.data === 'split' && s.accuracy >= 0.95,
        },
        {
          id: 't-confident',
          text: 'Train until the loss drops below 0.15. What happens to the shading near the boundary?',
          when: (s) => s.mode === 'logistic' && s.loss < 0.15,
        },
        {
          id: 't-xor',
          text: 'Switch to the checkerboard and train 200 steps. Why can no straight line do well?',
          when: (s) => s.mode === 'logistic' && s.data === 'xor' && s.steps >= 200,
        },
      ],
    },
    explain:
      'Combine the inputs linearly, $z = w_1 x + w_2 y + b$, then apply the **sigmoid** $\\sigma(z) = \\dfrac{1}{1 + e^{-z}}$, which maps any number to a probability. The boundary $\\sigma(z) = 0.5$ is the line $z = 0$; the weights set its direction and $b$ shifts it.\n\nTraining minimises the **cross-entropy loss** $-\\frac1n\\sum [y\\ln p + (1 - y)\\ln(1 - p)]$ by gradient descent. This is maximum likelihood for yes/no data. Its gradient is beautifully simple: (prediction − label) × input.',
    formula: {
      tex: 'p = \\sigma(\\mathbf w \\cdot \\mathbf x + b) = \\frac{1}{1 + e^{-(\\mathbf w \\cdot \\mathbf x + b)}}',
      caption: 'A weighted vote, squashed into a probability.',
    },
    misconception:
      'Despite the name, logistic regression is used for classification. And its boundary is always a straight line (a flat plane in more dimensions).',
    checks: [
      {
        kind: 'numeric',
        id: 'c-zero',
        prompt: 'What is $\\sigma(0)$?',
        answer: 0.5,
        explain: '$1/(1 + e^0) = 1/2$: right on the boundary.',
      },
      {
        kind: 'mcq',
        id: 'c-big',
        prompt: 'If $z = 8$, the model predicts…',
        options: [
          { text: 'class 1 with probability close to 1', correct: true },
          { text: 'probability 8', why: 'The sigmoid always outputs between 0 and 1.' },
          { text: 'class 0', why: 'Large positive $z$ means high probability of class 1.' },
        ],
        explain: '$\\sigma(8) \\approx 0.9997$.',
      },
      {
        kind: 'mcq',
        id: 'c-limit',
        prompt: 'Which pattern can logistic regression on $x$ and $y$ *not* separate?',
        options: [
          { text: 'A checkerboard (XOR) pattern', correct: true },
          { text: 'Two clouds side by side', why: 'A straight line separates them.' },
          {
            text: 'Points above vs below a slanted line',
            why: 'That is exactly a linear boundary.',
          },
        ],
        explain: 'Its boundary is a single straight line; XOR needs two.',
      },
    ],
    realWorld: [
      {
        title: 'Credit scoring',
        body: 'Banks have used logistic regression for decades to estimate the probability of a loan being repaid.',
      },
      {
        title: 'Medicine',
        body: 'Risk calculators (e.g. for heart disease) are often logistic models of age, blood pressure and other factors.',
      },
    ],
    takeaways: [
      'Weighted sum, then sigmoid: a probability between 0 and 1.',
      'Trained by gradient descent on the cross-entropy loss.',
      'Its decision boundary is a straight line.',
    ],
  },

  'neural-networks': {
    hook: 'One neuron draws one straight line. Feed several neurons into another, and their lines combine into curves, corners and islands. Stack enough of them and a network can learn to recognise faces or translate languages. The trick that makes training possible is **backpropagation**: the chain rule, run backwards through the network.',
    explore: {
      type: 'neuron',
      props: { mode: 'network', data: 'xor', hidden: 3 },
      caption:
        'A network with one hidden layer. Train it and watch the decision regions bend to fit the data.',
      tryThis: [
        {
          id: 't-solve',
          text: 'Train until the network gets the checkerboard at least 95% right.',
          when: (s) => s.mode === 'network' && s.data === 'xor' && s.accuracy >= 0.95,
        },
        {
          id: 't-one',
          text: 'Use just 1 hidden neuron and train 500 steps. Why does it get stuck?',
          when: (s) => s.mode === 'network' && s.hidden === 1 && s.steps >= 500,
        },
        {
          id: 't-ring',
          text: 'Switch to the ring and train a network that gets at least 95% right.',
          when: (s) => s.mode === 'network' && s.data === 'circle' && s.accuracy >= 0.95,
        },
      ],
    },
    explain:
      'Each hidden neuron computes $h_i = \\tanh(\\mathbf w_i \\cdot \\mathbf x + b_i)$: a soft step along its own line. The output neuron combines them, $p = \\sigma(\\sum_i v_i h_i + c)$, so the decision boundary can be any shape the hidden lines can build together.\n\nTo train, compute the loss, then ask how it changes with every weight. **Backpropagation** does this efficiently with the chain rule: the error at the output is passed back through each layer, multiplied by the local derivatives. Every weight then takes a small gradient-descent step. Repeat thousands of times.',
    formula: {
      tex: '\\frac{\\partial L}{\\partial w_{ij}} = \\frac{\\partial L}{\\partial p}\\cdot\\frac{\\partial p}{\\partial h_i}\\cdot\\frac{\\partial h_i}{\\partial w_{ij}}',
      caption: 'Backpropagation is the chain rule, layer by layer.',
    },
    misconception:
      'More neurons is not always better. Big networks can memorise the training points instead of learning the pattern (overfitting).',
    checks: [
      {
        kind: 'mcq',
        id: 'c-why-hidden',
        prompt: 'Why does a network need a hidden layer to solve XOR?',
        options: [
          {
            text: 'One neuron only makes one straight boundary; XOR needs to combine two',
            correct: true,
          },
          { text: 'To make training faster', why: 'It is about what shapes can be represented.' },
          {
            text: 'It does not: one neuron can do it',
            why: 'No single line separates a checkerboard.',
          },
        ],
        explain: 'Hidden neurons draw several lines; the output combines them.',
      },
      {
        kind: 'mcq',
        id: 'c-nonlinear',
        prompt: 'What would happen without the nonlinear $\\tanh$ in the hidden layer?',
        options: [
          { text: 'The whole network would collapse to a single linear model', correct: true },
          {
            text: 'It would learn faster and better',
            why: 'A composition of linear maps is still linear.',
          },
          {
            text: 'Nothing would change',
            why: 'The nonlinearity is what lets layers build curves.',
          },
        ],
        explain: 'Linear of linear is linear: depth would buy nothing.',
      },
      {
        kind: 'numeric',
        id: 'c-params',
        prompt: 'How many weights and biases does a 2 → 3 → 1 network have?',
        answer: 13,
        hint: 'Count the input-to-hidden weights, hidden biases, hidden-to-output weights and the output bias.',
        explain: '$2 \\times 3 + 3 + 3 \\times 1 + 1 = 13$.',
      },
    ],
    realWorld: [
      {
        title: 'Everyday AI',
        body: 'Speech recognition, photo search and language models are neural networks with millions to billions of weights, all trained by backpropagation.',
      },
      {
        title: 'Science',
        body: 'Networks predict protein shapes, weather and material properties from data.',
      },
    ],
    takeaways: [
      'Hidden neurons each draw a soft line; layers combine them into complex shapes.',
      'Nonlinear activations are essential.',
      'Backpropagation computes all the gradients with the chain rule.',
    ],
  },

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
        'Arrows show the chance of each move. Take steps and compare the time spent in each state with the long-run share (black tick).',
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

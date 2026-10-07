import type { ContentModule } from './types'

const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) < tol

const content: ContentModule = {
  'complex-numbers': {
    hook: 'No real number squares to $-1$. So mathematicians invented one, called $i$, and something remarkable happened: the numbers stopped being a line and became a **plane**. Adding is sliding, and multiplying is **rotating and stretching**.',
    explore: {
      type: 'complexPlane',
      props: { mode: 'arithmetic', z: [2, 1], w: [1, 1.5], op: 'add' },
      caption:
        'Drag $z$ and $w$. Switch between adding (tip to tail) and multiplying (angles add, lengths multiply).',
      tryThis: [
        {
          id: 't-real-sum',
          text: 'Add two numbers that are not real and get a real answer.',
          when: (s) =>
            s.mode === 'arithmetic' &&
            s.op === 'add' &&
            s.z[1] !== 0 &&
            s.w[1] !== 0 &&
            s.result[1] === 0,
        },
        {
          id: 't-times-i',
          text: 'Multiply by $i$ (put $w$ at $(0, 1)$). What does it do to $z$?',
          when: (s) =>
            s.mode === 'arithmetic' && s.op === 'multiply' && s.w[0] === 0 && s.w[1] === 1,
        },
        {
          id: 't-i-squared',
          text: 'Work out $i \\cdot i$ by putting both points at $i$.',
          when: (s) =>
            s.mode === 'arithmetic' &&
            s.op === 'multiply' &&
            s.z[0] === 0 &&
            s.z[1] === 1 &&
            s.w[0] === 0 &&
            s.w[1] === 1,
        },
      ],
    },
    explain:
      'A complex number $a + bi$ is the point $(a, b)$: $a$ is the **real part**, $b$ the **imaginary part**. Add by adding parts: $(2 + i) + (1 + 3i) = 3 + 4i$.\n\nMultiply by expanding and using $i^2 = -1$: $(2 + i)(1 + i) = 2 + 2i + i + i^2 = 1 + 3i$. In pictures, the lengths multiply and the **angles add**. Multiplying by $i$ turns everything a quarter turn, and two quarter turns point backwards: $i^2 = -1$.',
    formula: {
      tex: 'i^2 = -1, \\qquad |zw| = |z|\\,|w|, \\qquad \\arg(zw) = \\arg z + \\arg w',
      caption: 'Multiplying rotates and scales.',
    },
    misconception:
      '“Imaginary” is just an old name. Complex numbers are as real as negatives: engineers use them every day for waves and circuits.',
    checks: [
      {
        kind: 'mcq',
        id: 'c-add',
        prompt: 'What is $(3 - 2i) + (1 + 5i)$?',
        options: [
          { text: '$4 + 3i$', correct: true },
          { text: '$4 - 7i$', why: '$-2i + 5i = 3i$.' },
          { text: '$3 + 3i$', why: 'Add the real parts too: $3 + 1 = 4$.' },
        ],
        explain: 'Real parts: $3 + 1 = 4$. Imaginary parts: $-2 + 5 = 3$.',
      },
      {
        kind: 'mcq',
        id: 'c-mult',
        prompt: 'What is $(1 + i)(1 - i)$?',
        options: [
          { text: '$2$', correct: true },
          { text: '$0$', why: 'Expand: $1 - i + i - i^2 = 1 + 1$.' },
          { text: '$2i$', why: 'The middle terms cancel: $-i + i = 0$.' },
        ],
        explain: '$1 - i^2 = 1 - (-1) = 2$.',
      },
      {
        kind: 'numeric',
        id: 'c-abs',
        prompt: 'How far is $3 + 4i$ from 0?',
        answer: 5,
        explain: 'By Pythagoras, $\\sqrt{3^2 + 4^2} = 5$.',
      },
    ],
    realWorld: [
      {
        title: 'Electrical engineering',
        body: 'Alternating currents are handled as complex numbers, turning calculus problems into arithmetic.',
      },
      {
        title: 'Graphics and robotics',
        body: 'Rotations in 2D are just multiplication by a complex number of length 1 (and in 3D, by its big sibling, the quaternion).',
      },
    ],
    takeaways: [
      '$i$ is a number with $i^2 = -1$; $a + bi$ is a point in the plane.',
      'Adding is moving tip to tail.',
      'Multiplying multiplies lengths and adds angles.',
    ],
  },

  sequences: {
    hook: '2, 5, 8, 11, … What comes next? A **sequence** is a list of numbers made by a rule. The two most important rules are “add the same amount each time” and “multiply by the same amount each time”, and the difference between them is the difference between steady and explosive.',
    explore: {
      type: 'iterationPlot',
      props: { mode: 'sequence', kind: 'arithmetic', a: 2, d: 3 },
      caption: 'Each bar is one term. Choose the kind of sequence and set its first term and step.',
      tryThis: [
        {
          id: 't-down',
          text: 'Make an arithmetic sequence that goes *down*.',
          when: (s) => s.mode === 'sequence' && s.kind === 'arithmetic' && s.d < 0,
        },
        {
          id: 't-shrink',
          text: 'Make a geometric sequence whose terms shrink towards 0.',
          when: (s) =>
            s.mode === 'sequence' && s.kind === 'geometric' && Math.abs(s.r) < 1 && s.a !== 0,
        },
        {
          id: 't-alternate',
          text: 'Make a geometric sequence whose signs alternate $+, -, +, -$.',
          when: (s) => s.mode === 'sequence' && s.kind === 'geometric' && s.r < 0 && s.a !== 0,
        },
      ],
    },
    explain:
      'An **arithmetic** sequence adds a common difference $d$: $a, a + d, a + 2d, \\dots$. Its $n$th term is $a + (n - 1)d$, and its bars line up in a straight line.\n\nA **geometric** sequence multiplies by a common ratio $r$: $a, ar, ar^2, \\dots$, with $n$th term $ar^{n-1}$. If $|r| > 1$ it explodes, if $|r| < 1$ it dies away to 0, and a negative $r$ flips the sign every step.',
    formula: {
      tex: 'a_n = a + (n - 1)d \\qquad a_n = a\\,r^{\\,n-1}',
      caption: 'Arithmetic (add $d$) and geometric (multiply by $r$).',
    },
    misconception:
      'Doubling is not “a bit faster” than adding. Start both at 1: after 30 steps, adding 2 gives 59; doubling gives over 500 million.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-arith',
        prompt: 'What is the 10th term of $3, 7, 11, 15, \\dots$?',
        answer: 39,
        explain: '$a = 3$, $d = 4$: $3 + 9 \\cdot 4 = 39$.',
      },
      {
        kind: 'numeric',
        id: 'c-geo',
        prompt: 'What is the 6th term of $2, 6, 18, 54, \\dots$?',
        answer: 486,
        explain: '$a = 2$, $r = 3$: $2 \\cdot 3^5 = 486$.',
      },
      {
        kind: 'mcq',
        id: 'c-kind',
        prompt: 'What kind of sequence is $100, 50, 25, 12.5, \\dots$?',
        options: [
          { text: 'Geometric with $r = \\tfrac12$', correct: true },
          { text: 'Arithmetic with $d = -50$', why: 'The second step is $-25$, not $-50$.' },
          { text: 'Neither', why: 'Each term is half the one before.' },
        ],
        explain: 'Each term is multiplied by $\\tfrac12$.',
      },
    ],
    realWorld: [
      {
        title: 'Savings',
        body: 'Saving 50 a month grows arithmetically; money earning interest grows geometrically.',
      },
      {
        title: 'Bouncing ball',
        body: 'A ball that bounces back to 70% of its height each time makes a geometric sequence of bounce heights.',
      },
    ],
    takeaways: [
      'Arithmetic: add the same $d$ each time (straight line).',
      'Geometric: multiply by the same $r$ each time (explodes or dies away).',
    ],
  },

  'polynomial-rational-functions': {
    hook: 'Divide one polynomial by another and you get a **rational function**, like $\\dfrac{1}{x - 2}$. Unlike polynomials, these can shoot off to infinity at a single point and flatten out towards a level they never reach. Those invisible guide lines are called **asymptotes**.',
    explore: {
      type: 'grapher',
      props: {
        expressions: ['1/(x - h) + k', 'k', 'x = h'],
        params: {
          h: { value: 1, min: -4, max: 4, step: 1 },
          k: { value: 2, min: -3, max: 3, step: 1 },
        },
        view: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 },
        height: 340,
      },
      caption:
        'The curve $y = \\dfrac{1}{x - h} + k$ with its two asymptotes: the flat line $y = k$ and the upright line $x = h$.',
      tryThis: [
        {
          id: 't-vertical',
          text: 'Move the vertical asymptote to $x = -3$.',
          when: (s) => s.params.h === -3,
        },
        {
          id: 't-origin',
          text: 'Make both asymptotes the axes themselves.',
          when: (s) => s.params.h === 0 && s.params.k === 0,
        },
        {
          id: 't-through',
          text: 'Make the curve pass through the origin $(0, 0)$.',
          when: (s) => s.params.h !== 0 && near(1 / -s.params.h + s.params.k, 0),
        },
      ],
    },
    explain:
      'A **vertical asymptote** appears where the denominator is zero: near $x = h$, $\\dfrac{1}{x - h}$ divides 1 by something tiny, so it blows up. A **horizontal asymptote** shows where the function settles as $x$ gets huge: $\\dfrac{1}{x - h}$ shrinks towards 0, so the curve approaches $y = k$.\n\nFor a general rational function $p(x)/q(x)$, compare degrees: if the bottom wins, it heads to 0; if they tie, to the ratio of leading coefficients; if the top wins, there is no horizontal asymptote.',
    formula: {
      tex: 'y = \\frac{1}{x - h} + k',
      caption: 'Vertical asymptote $x = h$, horizontal asymptote $y = k$.',
    },
    misconception:
      'A curve can cross a horizontal asymptote in the middle of the graph; the asymptote only describes what happens far away.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-vertical',
        prompt: 'At what $x$ is the vertical asymptote of $y = \\dfrac{3}{x + 4}$?',
        answer: -4,
        explain: 'The denominator $x + 4$ is zero at $x = -4$.',
      },
      {
        kind: 'numeric',
        id: 'c-horizontal',
        prompt:
          'What is the horizontal asymptote of $y = \\dfrac{2x + 1}{x - 3}$? Give the $y$ value.',
        answer: 2,
        hint: 'Equal degrees: divide the leading coefficients.',
        explain: 'For huge $x$ it behaves like $2x / x = 2$.',
      },
      {
        kind: 'mcq',
        id: 'c-poly',
        prompt: 'Which of these has no vertical asymptote?',
        options: [
          { text: '$x^3 - 4x$', correct: true },
          { text: '$1 / x$', why: 'Division by zero at $x = 0$.' },
          { text: '$\\dfrac{x}{x^2 - 1}$', why: 'The bottom is zero at $x = \\pm1$.' },
        ],
        explain: 'Polynomials are defined everywhere, so they never blow up at a point.',
      },
    ],
    realWorld: [
      {
        title: 'Sharing costs',
        body: 'Splitting a 120 bill among $n$ friends costs $120/n$ each: it falls fast at first, then levels towards 0.',
      },
      {
        title: 'Lenses',
        body: 'The thin-lens equation $1/f = 1/u + 1/v$ makes image distance a rational function of object distance, with an asymptote at the focal point.',
      },
    ],
    takeaways: [
      'Rational functions are ratios of polynomials.',
      'Vertical asymptotes: where the denominator is zero.',
      'Horizontal asymptotes: where the function settles for huge $x$.',
    ],
  },
}

export default content

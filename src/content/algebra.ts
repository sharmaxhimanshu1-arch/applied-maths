import type { ContentModule } from './types'

const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) < tol

/** Sign changes of f on a fine grid: the number of places a curve crosses the x-axis. */
function crossings(f: (x: number) => number, a = -10, b = 10, n = 4000) {
  let count = 0
  let prev = f(a)
  for (let i = 1; i <= n; i++) {
    const y = f(a + ((b - a) * i) / n)
    if (prev !== 0 && Math.sign(y) !== Math.sign(prev)) count++
    prev = y
  }
  return count
}

const content: ContentModule = {
  'systems-of-equations': {
    hook: 'Two friends start saving at different rates. When will they have the same amount? Each person is a line; the answer is **where the lines cross**.\n\nA system of equations asks for values that make *all* the equations true at once.',
    explore: {
      type: 'grapher',
      props: {
        expressions: ['m x + b', '-x + 4'],
        params: {
          m: { value: 2, min: -3, max: 3, step: 0.5 },
          b: { value: 1, min: -4, max: 6, step: 1 },
        },
        view: { xMin: -6, xMax: 6, yMin: -6, yMax: 8 },
        height: 320,
        markers: 'intersections',
      },
      caption:
        'The blue line is $y = mx + b$; the orange one is $y = -x + 4$. The marked point solves both equations.',
      tryThis: [
        {
          id: 't-x2',
          text: 'Make the lines cross at $x = 2$.',
          when: (s) => !near(s.params.m, -1) && near((4 - s.params.b) / (s.params.m + 1), 2, 1e-9),
        },
        {
          id: 't-parallel',
          text: 'Make the lines parallel so there is no solution at all.',
          when: (s) => near(s.params.m, -1) && !near(s.params.b, 4),
        },
        {
          id: 't-same',
          text: 'Make the two lines the same line. How many solutions now?',
          when: (s) => near(s.params.m, -1) && near(s.params.b, 4),
        },
      ],
    },
    explain:
      'To solve $y = 2x - 2$ and $y = -x + 4$ algebraically, set the right-hand sides equal (both equal $y$): $2x - 2 = -x + 4$, so $3x = 6$ and $x = 2$. Then $y = 2$. The solution is the point $(2, 2)$.\n\nTwo lines can meet once (one solution), never (parallel: no solution) or everywhere (the same line: infinitely many).',
    formula: {
      tex: '\\begin{cases} y = 2x - 2 \\\\ y = -x + 4 \\end{cases} \\Rightarrow (x, y) = (2, 2)',
      caption: 'Substitution: replace $y$ in one equation with what the other says it is.',
    },
    misconception:
      'Finding $x$ is only half the answer. A solution is a point, so you still need $y$.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-x',
        prompt: 'Solve $y = x + 1$ and $y = 3x - 5$. What is $x$?',
        answer: 3,
        explain: '$x + 1 = 3x - 5$ gives $6 = 2x$, so $x = 3$ (and $y = 4$).',
      },
      {
        kind: 'mcq',
        id: 'c-none',
        prompt: 'How many solutions do $y = 2x + 1$ and $y = 2x - 3$ have?',
        options: [
          { text: 'None', correct: true },
          { text: 'One', why: 'Same slope, different intercepts: the lines never meet.' },
          { text: 'Infinitely many', why: 'They are different lines.' },
        ],
        explain: 'Equal slopes mean parallel lines.',
      },
      {
        kind: 'numeric',
        id: 'c-sum',
        prompt: 'Solve $x + y = 10$ and $x - y = 4$. What is $x$?',
        answer: 7,
        hint: 'Add the two equations: the $y$ terms cancel.',
        explain: 'Adding gives $2x = 14$, so $x = 7$ and $y = 3$.',
      },
    ],
    realWorld: [
      {
        title: 'Break-even point',
        body: 'Where the cost line meets the revenue line, a business stops losing money.',
      },
      {
        title: 'Mixing',
        body: 'How much of a 10% and a 30% solution make 1 litre of 25%? Two unknowns, two equations.',
      },
    ],
    takeaways: [
      'The solution of a system is the point that lies on every line.',
      'Two lines: one solution, none (parallel) or infinitely many (the same line).',
    ],
  },

  polynomials: {
    hook: 'Add up powers of $x$, each with a number in front, and you get a **polynomial**: $2x^3 - x^2 + 4$. They are the smoothest, simplest curves there are, and with enough terms they can imitate almost any shape.',
    explore: {
      type: 'grapher',
      props: {
        expressions: ['a x^3 + b x^2 + c x + d'],
        params: {
          a: { value: 1, min: -2, max: 2, step: 0.5 },
          b: { value: 0, min: -3, max: 3, step: 0.5 },
          c: { value: -3, min: -5, max: 5, step: 1 },
          d: { value: 0, min: -4, max: 4, step: 1 },
        },
        view: { xMin: -4, xMax: 4, yMin: -8, yMax: 8 },
        height: 320,
        markers: 'both',
      },
      caption:
        'Each slider is one coefficient. Hollow dots are roots; solid dots are peaks and valleys.',
      tryThis: [
        {
          id: 't-flip',
          text: 'Make $a$ negative. What happens to the far left and far right ends?',
          when: (s) => s.params.a < 0,
        },
        {
          id: 't-one-root',
          text: 'Keep $a \\ne 0$, but make the curve cross the x-axis only once.',
          when: (s) => {
            const { a, b, c, d } = s.params
            return a !== 0 && crossings((x) => a * x ** 3 + b * x ** 2 + c * x + d) === 1
          },
        },
        {
          id: 't-quadratic',
          text: 'Set $a = 0$ (with $b \\ne 0$). What degree is the polynomial now?',
          when: (s) => s.params.a === 0 && s.params.b !== 0,
        },
      ],
    },
    explain:
      'A polynomial is a sum of terms $a_k x^k$ with whole-number powers. The highest power is its **degree**: $3x^2 - x$ has degree 2.\n\nThe degree controls the shape. A degree-$n$ polynomial has at most $n$ roots and at most $n - 1$ turning points. Far from the origin the leading term wins: $x^3$ dominates $-3x$, so the ends of a cubic head off in opposite directions.',
    formula: {
      tex: 'p(x) = a_n x^n + a_{n-1} x^{n-1} + \\dots + a_1 x + a_0',
      caption: 'Degree $n$: at most $n$ roots and $n - 1$ turns.',
    },
    misconception:
      'Not everything with an $x$ is a polynomial: $1/x$, $\\sqrt x$ and $2^x$ are not, because the powers must be whole numbers 0, 1, 2, …',
    checks: [
      {
        kind: 'numeric',
        id: 'c-degree',
        prompt: 'What is the degree of $4x^2 - 7x^5 + x$?',
        answer: 5,
        explain:
          'The highest power of $x$ is 5. The order the terms are written in does not matter.',
      },
      {
        kind: 'expression',
        id: 'c-add',
        prompt: 'Simplify $(2x^2 + 3x) + (x^2 - 5x + 1)$.',
        answer: '3x^2 - 2x + 1',
        hint: 'Combine terms with the same power of $x$.',
        explain: '$2x^2 + x^2 = 3x^2$, $3x - 5x = -2x$, and the constant is 1.',
      },
      {
        kind: 'numeric',
        id: 'c-roots',
        prompt: 'At most how many times can a degree-4 polynomial cross the x-axis?',
        answer: 4,
        explain: 'A degree-$n$ polynomial has at most $n$ roots.',
      },
    ],
    realWorld: [
      {
        title: 'Fonts and animation',
        body: 'The smooth curves of letters on your screen are pieces of cubic polynomials (Bézier curves).',
      },
      {
        title: 'Approximation',
        body: 'Calculators compute $\\sin x$ and $e^x$ with polynomials that match them closely.',
      },
    ],
    takeaways: [
      'Polynomials add up whole-number powers of $x$.',
      'The degree limits the number of roots and turns.',
      'Far out, the leading term decides where the ends go.',
    ],
  },

  factoring: {
    hook: 'Expanding turns $(x - 2)(x + 3)$ into $x^2 + x - 6$. **Factoring** runs the film backwards, and it is worth the effort: once a polynomial is a product, you can read its roots straight off, because a product is zero only when one of its factors is.',
    explore: {
      type: 'grapher',
      props: {
        expressions: ['(x - p)(x - q)'],
        params: {
          p: { value: 1, min: -4, max: 4, step: 1 },
          q: { value: -2, min: -4, max: 4, step: 1 },
        },
        view: { xMin: -6, xMax: 6, yMin: -8, yMax: 10 },
        height: 320,
        markers: 'roots',
      },
      caption:
        'The parabola $y = (x - p)(x - q)$. Watch where it meets the x-axis as you move $p$ and $q$.',
      tryThis: [
        {
          id: 't-roots',
          text: 'Make the roots $x = 3$ and $x = -1$.',
          when: (s) =>
            (s.params.p === 3 && s.params.q === -1) || (s.params.p === -1 && s.params.q === 3),
        },
        {
          id: 't-double',
          text: 'Make the two roots the same. How does the curve touch the axis?',
          when: (s) => s.params.p === s.params.q,
        },
        {
          id: 't-product',
          text: 'Make the curve cross the y-axis at $-8$. What is $pq$?',
          when: (s) => s.params.p * s.params.q === -8,
        },
      ],
    },
    explain:
      'Expanding $(x - p)(x - q)$ gives $x^2 - (p + q)x + pq$. So to factor $x^2 + bx + c$, look for two numbers that **multiply to $c$** and **add to $b$**. For $x^2 - 5x + 6$: $-2$ and $-3$ multiply to 6 and add to $-5$, so it is $(x - 2)(x - 3)$, with roots 2 and 3.\n\nAlways look for a common factor first: $3x^2 + 6x = 3x(x + 2)$.',
    formula: {
      tex: 'x^2 - (p + q)x + pq = (x - p)(x - q)',
      caption: 'Roots $p$ and $q$: their sum and product are in the coefficients.',
    },
    misconception:
      'The roots of $(x - 2)(x + 3)$ are $2$ and $-3$, not $-2$ and $3$. Ask which $x$ makes each bracket zero.',
    checks: [
      {
        kind: 'expression',
        id: 'c-factor',
        prompt: 'Factor $x^2 + 7x + 12$.',
        answer: '(x + 3)(x + 4)',
        hint: 'Which two numbers multiply to 12 and add to 7?',
        explain: '$3 \\cdot 4 = 12$ and $3 + 4 = 7$.',
      },
      {
        kind: 'mcq',
        id: 'c-roots',
        prompt: 'What are the roots of $(x - 5)(x + 1) = 0$?',
        options: [
          { text: '$5$ and $-1$', correct: true },
          { text: '$-5$ and $1$', why: 'Plug in: $(-5 - 5)(-5 + 1) = 40$, not 0.' },
          { text: '$5$ only', why: 'Either bracket can be zero.' },
        ],
        explain: '$x - 5 = 0$ gives 5; $x + 1 = 0$ gives $-1$.',
      },
      {
        kind: 'expression',
        id: 'c-diff',
        prompt: 'Factor $x^2 - 9$.',
        answer: '(x - 3)(x + 3)',
        hint: 'It is a difference of two squares.',
        explain: '$a^2 - b^2 = (a - b)(a + b)$ with $a = x$, $b = 3$.',
      },
    ],
    realWorld: [
      {
        title: 'Projectiles',
        body: 'Factoring the height formula of a thrown ball tells you when it lands: the root where height is zero.',
      },
      {
        title: 'Cryptography',
        body: 'Factoring huge *numbers* is so hard that internet security relies on it (see RSA).',
      },
    ],
    takeaways: [
      'Factoring writes a polynomial as a product.',
      'A product is zero when one factor is zero: that gives the roots.',
      'For $x^2 + bx + c$, find two numbers with product $c$ and sum $b$.',
    ],
  },

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

  'composition-inverses': {
    hook: 'Machines can be chained: the output of one becomes the input of the next. That is **composition**. And some machines can be run backwards, recovering the input from the output. That is an **inverse**, like an undo button.',
    explore: {
      type: 'functionMachine',
      props: {
        mode: 'compose',
        fns: [
          { id: 'add3', tex: 'x + 3', expr: 'x + 3', inverse: { tex: 'x - 3', expr: 'x - 3' } },
          { id: 'double', tex: '2x', expr: '2x', inverse: { tex: 'x / 2', expr: 'x / 2' } },
          { id: 'half', tex: 'x / 2', expr: 'x / 2', inverse: { tex: '2x', expr: '2x' } },
          { id: 'square', tex: 'x^2', expr: 'x^2' },
        ],
        f: 'add3',
        g: 'double',
        start: 1,
      },
      caption:
        'Both chains use the same two machines in opposite orders. Change $x$, $f$ and $g$ and compare.',
      tryThis: [
        {
          id: 't-order',
          text: 'With $f(x) = x + 3$ and $g(x) = 2x$, compare $f(g(2))$ and $g(f(2))$.',
          when: (s) => s.mode === 'compose' && s.f === 'add3' && s.g === 'double' && s.x === 2,
        },
        {
          id: 't-commute',
          text: 'Find two *different* functions whose order never matters. Check a few values of $x$.',
          when: (s) =>
            s.mode === 'compose' &&
            ((s.f === 'double' && s.g === 'half') || (s.f === 'half' && s.g === 'double')) &&
            s.x !== 0,
        },
        {
          id: 't-inverse',
          text: 'Turn on “Show f and its inverse”. What line do the two graphs mirror each other in?',
          when: (s) => s.mode === 'compose' && s.showInverse,
        },
      ],
    },
    explain:
      '$f(g(x))$, also written $(f \\circ g)(x)$, means: do $g$ first, then $f$. Usually the order matters: with $f(x) = x + 3$ and $g(x) = 2x$, $f(g(x)) = 2x + 3$ but $g(f(x)) = 2x + 6$.\n\nThe **inverse** $f^{-1}$ undoes $f$: $f^{-1}(f(x)) = x$. To find it, undo the steps in reverse order. Its graph is $f$’s graph reflected in the line $y = x$, because it swaps inputs and outputs. Only functions that never repeat an output have inverses; $x^2$ does not, since $2$ and $-2$ both give 4.',
    formula: {
      tex: '(f \\circ g)(x) = f(g(x)), \\qquad f^{-1}(f(x)) = x',
      caption: 'Composition chains; the inverse undoes.',
    },
    misconception: '$f^{-1}(x)$ is the inverse function, not $\\dfrac{1}{f(x)}$.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-compose',
        prompt: 'If $f(x) = x^2$ and $g(x) = x + 1$, what is $f(g(2))$?',
        answer: 9,
        explain: '$g(2) = 3$, then $f(3) = 9$.',
      },
      {
        kind: 'expression',
        id: 'c-inverse',
        prompt: 'Find the inverse of $f(x) = 3x - 6$. Write $f^{-1}(x)$.',
        answer: '(x + 6)/3',
        hint: '$f$ multiplies by 3 then subtracts 6. Undo in reverse order.',
        explain: 'Add 6, then divide by 3: $f^{-1}(x) = \\dfrac{x + 6}{3}$.',
      },
      {
        kind: 'mcq',
        id: 'c-reflect',
        prompt: 'The graph of $f^{-1}$ is the graph of $f$ reflected in…',
        options: [
          { text: 'the line $y = x$', correct: true },
          { text: 'the x-axis', why: 'That gives $-f(x)$.' },
          { text: 'the y-axis', why: 'That gives $f(-x)$.' },
        ],
        explain: 'Swapping every $(a, b)$ to $(b, a)$ is a reflection in $y = x$.',
      },
    ],
    realWorld: [
      {
        title: 'Unit conversions',
        body: 'Celsius to Fahrenheit is $F = 1.8C + 32$; its inverse $C = (F - 32)/1.8$ converts back.',
      },
      {
        title: 'Encryption',
        body: 'Encrypting is a function and decrypting is its inverse. A good cipher is easy to run forward, hard to invert without the key.',
      },
    ],
    takeaways: [
      '$f(g(x))$: inside first. Order usually matters.',
      'An inverse undoes a function; its graph mirrors in $y = x$.',
      'Only one-to-one functions have inverses.',
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

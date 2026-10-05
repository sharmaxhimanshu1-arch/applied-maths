import type { QuickCheck } from '@/content/types'
import type { ConceptId } from '@/curriculum/types'

/**
 * Review questions for concepts with a hand-built deep lab (whose own challenges live in JSX).
 * Lite labs review with their quick checks instead. Variants of the lab's practice, not copies,
 * so a review tests the idea rather than a remembered answer.
 */
const deep: Partial<Record<ConceptId, QuickCheck[]>> = {
  'linear-equations': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Solve $4x - 7 = 13$.',
      answer: 5,
      explain: 'Add 7 to both sides: $4x = 20$. Divide both sides by 4: $x = 5$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'Solve $3(x + 2) = 2x + 11$.',
      answer: 5,
      hint: 'Expand the bracket first.',
      explain: '$3x + 6 = 2x + 11$, so $x = 5$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Which step keeps $5x + 2 = 17$ balanced?',
      options: [
        { text: 'Subtract 2 from both sides', correct: true },
        { text: 'Subtract 2 from the left only', why: 'Changing one side tips the balance.' },
        { text: 'Divide only $5x$ by 5', why: 'Every term on both sides must be divided.' },
        {
          text: 'Add 2 to the left and subtract 2 on the right',
          why: 'Both sides need the same operation.',
        },
      ],
      explain: 'Whatever you do to one side you must do to the other: $5x = 15$.',
    },
  ],
  'slope-linear-functions': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'What is the slope of the line through $(-1, 4)$ and $(3, -4)$?',
      answer: -2,
      explain: '$\\dfrac{-4 - 4}{3 - (-1)} = \\dfrac{-8}{4} = -2$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'The line $y = 3x + b$ passes through $(2, 1)$. What is $b$?',
      answer: -5,
      explain: '$1 = 3 \\cdot 2 + b$, so $b = -5$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Which line is parallel to $y = -\\tfrac12 x + 4$?',
      options: [
        { text: '$y = -\\tfrac12 x - 3$', correct: true },
        { text: '$y = 2x + 4$', why: 'Slope 2 is perpendicular, not parallel.' },
        { text: '$y = -\\tfrac12$', why: 'That is a flat line, slope 0.' },
        { text: '$y = \\tfrac12 x + 4$', why: 'Same steepness but opposite direction.' },
      ],
      explain: 'Parallel lines have equal slopes; only the intercept changes.',
    },
  ],
  quadratics: [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'What is the $x$-coordinate of the vertex of $y = x^2 - 6x + 5$?',
      answer: 3,
      hint: 'The vertex is at $x = -\\dfrac{b}{2a}$.',
      explain: '$x = \\dfrac{6}{2} = 3$. (Then $y = 9 - 18 + 5 = -4$.)',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'How many real roots does $x^2 + 2x + 5 = 0$ have?',
      answer: 0,
      hint: 'Work out the discriminant $b^2 - 4ac$.',
      explain: '$b^2 - 4ac = 4 - 20 = -16 < 0$, so the parabola never meets the $x$-axis.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'What are the roots of $y = (x - 1)(x + 4)$?',
      options: [
        { text: '$x = 1$ and $x = -4$', correct: true },
        {
          text: '$x = -1$ and $x = 4$',
          why: 'Set each bracket to zero: $x - 1 = 0$ gives $x = 1$.',
        },
        { text: '$x = 1$ and $x = 4$', why: 'Check the sign in $x + 4 = 0$.' },
        { text: 'There are none', why: 'A product is zero when either factor is zero.' },
      ],
      explain: 'Factored form shows the roots directly: each bracket is zero at one root.',
    },
  ],
  'function-transformations': [
    {
      kind: 'mcq',
      id: 'r1',
      prompt: 'How does the graph of $y = (x - 3)^2$ compare with $y = x^2$?',
      options: [
        { text: 'Shifted 3 to the right', correct: true },
        { text: 'Shifted 3 to the left', why: 'Inside the bracket, $-3$ moves the graph right.' },
        { text: 'Shifted 3 down', why: 'A vertical shift would be outside: $x^2 - 3$.' },
        { text: 'Stretched by 3', why: 'Nothing multiplies the function.' },
      ],
      explain: 'The new graph reaches each height 3 units later, so it sits 3 to the right.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt: 'Which transformation turns $y = f(x)$ into $y = -f(x)$?',
      options: [
        { text: 'Reflection in the $x$-axis', correct: true },
        { text: 'Reflection in the $y$-axis', why: 'That would be $f(-x)$.' },
        { text: 'A shift down', why: 'Shifts add a constant; this multiplies by $-1$.' },
        { text: 'A half turn about the origin', why: 'That needs both: $-f(-x)$.' },
      ],
      explain: 'Every output changes sign, so the graph flips upside down across the $x$-axis.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt: '$y = 2f(x) + 1$. If $f(4) = 3$, what is $y$ at $x = 4$?',
      answer: 7,
      explain: '$2 \\cdot 3 + 1 = 7$: stretch first, then shift up.',
    },
  ],
  'exponential-growth': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'A colony of 50 bacteria doubles every hour. How many are there after 4 hours?',
      answer: 800,
      explain: '$50 \\cdot 2^4 = 800$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt:
        'A drug has a half-life of 6 hours. What fraction is left after 18 hours? (Decimals are fine.)',
      answer: 0.125,
      tolerance: 0.001,
      explain: '18 hours is 3 half-lives: $(\\tfrac12)^3 = \\tfrac18 = 0.125$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Which grows faster in the long run?',
      options: [
        { text: '$1.01^x$', correct: true },
        {
          text: '$1000x$',
          why: 'Linear growth adds a fixed amount; exponential growth eventually overtakes any line.',
        },
        { text: 'They end up equal', why: 'Their ratio grows without bound.' },
        { text: 'It depends on the units', why: 'The long-run winner does not depend on units.' },
      ],
      explain:
        'Repeated multiplication beats repeated addition eventually, however small the growth rate.',
    },
  ],
  logarithms: [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Find $\\log_3 81$.',
      answer: 4,
      explain: '$3^4 = 81$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'Given $\\log 2 \\approx 0.301$, estimate $\\log 8$.',
      answer: 0.903,
      tolerance: 0.002,
      explain: '$\\log 8 = \\log 2^3 = 3 \\log 2 \\approx 0.903$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: '$\\log(ab)$ equals…',
      options: [
        { text: '$\\log a + \\log b$', correct: true },
        {
          text: '$\\log a \\cdot \\log b$',
          why: 'Logs turn multiplication into addition, not into multiplication.',
        },
        { text: '$\\log(a + b)$', why: 'There is no rule for the log of a sum.' },
        { text: '$b \\log a$', why: 'That is $\\log(a^b)$.' },
      ],
      explain: 'Multiplying numbers adds their exponents, and a log is an exponent.',
    },
  ],
  'unit-circle': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'What is $\\cos 180°$?',
      answer: -1,
      explain: 'At 180° the point on the unit circle is $(-1, 0)$; cos is the $x$-coordinate.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt: 'In which quadrant are $\\sin\\theta > 0$ and $\\cos\\theta < 0$?',
      options: [
        { text: 'The second (90° to 180°)', correct: true },
        { text: 'The first', why: 'There both are positive.' },
        { text: 'The third', why: 'There both are negative.' },
        { text: 'The fourth', why: 'There sin is negative and cos positive.' },
      ],
      explain: 'Up (sin > 0) and left (cos < 0) is the top-left quadrant.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt: 'If $\\sin\\theta = 0.6$, what is $\\cos^2\\theta$?',
      answer: 0.64,
      tolerance: 0.001,
      explain: '$\\sin^2\\theta + \\cos^2\\theta = 1$, so $\\cos^2\\theta = 1 - 0.36 = 0.64$.',
    },
  ],
  'trig-graphs': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'What is the amplitude of $y = 4\\sin(2x)$?',
      answer: 4,
      explain: 'The wave swings between $-4$ and $4$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'What is the period of $y = \\sin(3x)$, in radians? (Decimals are fine.)',
      answer: (2 * Math.PI) / 3,
      tolerance: 0.01,
      explain: 'The period is $\\dfrac{2\\pi}{3} \\approx 2.094$: the wave runs 3 times as fast.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'How is $y = \\cos x$ related to $y = \\sin x$?',
      options: [
        { text: 'It is $\\sin x$ shifted left by $\\tfrac{\\pi}{2}$', correct: true },
        { text: 'It is $\\sin x$ upside down', why: 'That is $-\\sin x$.' },
        { text: 'It has twice the period', why: 'Both have period $2\\pi$.' },
        {
          text: 'They are unrelated',
          why: 'Cosine is the same wave, just started a quarter turn earlier.',
        },
      ],
      explain: '$\\cos x = \\sin(x + \\tfrac{\\pi}{2})$: same wave, a quarter period ahead.',
    },
  ],
  vectors: [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Find the length of $\\vec v = (5, 12)$.',
      answer: 13,
      explain: '$\\sqrt{5^2 + 12^2} = \\sqrt{169} = 13$.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt: 'What is $(2, -1) + (3, 4)$?',
      options: [
        { text: '$(5, 3)$', correct: true },
        { text: '$(6, -4)$', why: 'That multiplies the parts; vectors add part by part.' },
        { text: '$(-1, -5)$', why: 'That subtracts.' },
        { text: '$(5, 5)$', why: 'Check the second parts: $-1 + 4 = 3$.' },
      ],
      explain: 'Add matching parts: $(2 + 3, -1 + 4)$. Tip to tail.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt: 'Scaling $\\vec v$ by $-3$ multiplies its length by what?',
      answer: 3,
      explain: 'Length scales by $|-3| = 3$; the minus sign only reverses the direction.',
    },
  ],
  'linear-combinations-span': [
    {
      kind: 'mcq',
      id: 'r1',
      prompt: 'What is the span of $(1, 2)$ and $(2, 4)$?',
      options: [
        { text: 'A line through the origin', correct: true },
        {
          text: 'The whole plane',
          why: '$(2, 4)$ is just $2 \\cdot (1, 2)$: they point the same way.',
        },
        {
          text: 'Just the two points',
          why: 'A span includes every combination $a\\vec u + b\\vec v$.',
        },
        { text: 'Only the origin', why: 'Any nonzero vector spans at least a line.' },
      ],
      explain: 'Parallel vectors add nothing new: their combinations stay on one line.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'Find $a$ so that $a(1, 0) + 2(0, 1) = (7, 2)$.',
      answer: 7,
      explain: 'The first part gives $a = 7$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Two vectors in the plane span the whole plane exactly when…',
      options: [
        { text: 'They are not parallel (and neither is zero)', correct: true },
        { text: 'They have the same length', why: 'Length does not matter, direction does.' },
        { text: 'They are perpendicular', why: 'Perpendicular is enough but not required.' },
        { text: 'Always', why: 'Parallel vectors only span a line.' },
      ],
      explain: 'Two independent directions reach every point in the plane.',
    },
  ],
  'dot-product': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Compute $(3, -2) \\cdot (4, 5)$.',
      answer: 2,
      explain: '$3 \\cdot 4 + (-2) \\cdot 5 = 12 - 10 = 2$.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt: '$\\vec u \\cdot \\vec v = 0$ for two nonzero vectors. What does that mean?',
      options: [
        { text: 'They are perpendicular', correct: true },
        {
          text: 'They are parallel',
          why: 'Parallel vectors have the largest dot product in size.',
        },
        { text: 'One of them is zero', why: 'The question says both are nonzero.' },
        {
          text: 'They have equal length',
          why: 'Length and angle both matter; zero means a right angle.',
        },
      ],
      explain:
        '$\\vec u \\cdot \\vec v = |\\vec u||\\vec v|\\cos\\theta$, which is 0 when $\\theta = 90°$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'A negative dot product means the angle between the vectors is…',
      options: [
        { text: 'More than 90°', correct: true },
        { text: 'Less than 90°', why: 'Acute angles give a positive dot product.' },
        { text: 'Exactly 90°', why: 'That gives 0.' },
        { text: 'Impossible to tell', why: 'The sign of $\\cos\\theta$ tells you.' },
      ],
      explain: '$\\cos\\theta < 0$ for obtuse angles: the shadow points backwards.',
    },
  ],
  'linear-transformations': [
    {
      kind: 'mcq',
      id: 'r1',
      prompt: 'The columns of a $2 \\times 2$ matrix tell you…',
      options: [
        { text: 'Where $\\hat\\imath$ and $\\hat\\jmath$ land', correct: true },
        { text: 'The eigenvalues', why: 'Eigenvalues usually need a calculation.' },
        { text: 'The area of the unit square', why: 'That is the determinant.' },
        { text: 'Nothing on their own', why: 'Each column is the image of a basis vector.' },
      ],
      explain:
        'Column 1 is $A\\hat\\imath$ and column 2 is $A\\hat\\jmath$; they determine the whole transformation.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt: 'Which matrix rotates the plane 90° anticlockwise?',
      options: [
        { text: '$\\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$', correct: true },
        {
          text: '$\\begin{bmatrix} 0 & 1 \\\\ -1 & 0 \\end{bmatrix}$',
          why: 'That rotates clockwise.',
        },
        {
          text: '$\\begin{bmatrix} -1 & 0 \\\\ 0 & -1 \\end{bmatrix}$',
          why: 'That is a half turn.',
        },
        {
          text: '$\\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}$',
          why: 'That flips across the $x$-axis.',
        },
      ],
      explain:
        '$\\hat\\imath = (1, 0)$ goes to $(0, 1)$ and $\\hat\\jmath = (0, 1)$ goes to $(-1, 0)$.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt:
        'Let $A = \\begin{bmatrix} 2 & 1 \\\\ 0 & 3 \\end{bmatrix}$. What is the second entry of $A\\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix}$?',
      answer: 3,
      explain: '$A(1, 1) = 1 \\cdot (2, 0) + 1 \\cdot (1, 3) = (3, 3)$.',
    },
  ],
  'matrix-multiplication': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt:
        'Find the top-left entry of $\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}\\begin{bmatrix} 5 & 0 \\\\ 6 & 1 \\end{bmatrix}$.',
      answer: 17,
      explain: 'Row 1 · column 1 $= 1 \\cdot 5 + 2 \\cdot 6 = 17$.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt: 'In general, is $AB = BA$?',
      options: [
        { text: 'No: the order of transformations matters', correct: true },
        { text: 'Yes, always', why: 'Rotate-then-shear and shear-then-rotate usually differ.' },
        {
          text: 'Only for $2 \\times 2$ matrices',
          why: 'Even $2 \\times 2$ matrices usually do not commute.',
        },
        { text: 'Only when both are invertible', why: 'Invertibility does not make them commute.' },
      ],
      explain: '$AB$ means "do $B$, then $A$". Swapping the order usually changes the result.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: '$AB$ applied to a vector $\\vec v$ means…',
      options: [
        { text: 'Apply $B$ first, then $A$', correct: true },
        {
          text: 'Apply $A$ first, then $B$',
          why: 'The matrix nearest the vector acts first: $A(B\\vec v)$.',
        },
        { text: 'Apply them at the same time', why: 'Composition is one after the other.' },
        { text: 'Add the two results', why: 'That would be $A\\vec v + B\\vec v$.' },
      ],
      explain: '$(AB)\\vec v = A(B\\vec v)$: read right to left, like function composition.',
    },
  ],
  determinant: [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Find $\\det \\begin{bmatrix} 3 & 1 \\\\ 2 & 4 \\end{bmatrix}$.',
      answer: 10,
      explain: '$3 \\cdot 4 - 1 \\cdot 2 = 10$.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt: 'A transformation has determinant $-2$. What does it do to areas?',
      options: [
        { text: 'Doubles them and flips orientation', correct: true },
        { text: 'Halves them', why: 'The size of the determinant is the area factor: 2.' },
        { text: 'Makes them negative', why: 'Areas stay positive; the sign means a flip.' },
        { text: 'Squashes them to zero', why: 'That is determinant 0.' },
      ],
      explain: '$|\\det| = 2$ scales area; the minus sign means the plane is flipped over.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt: 'For which $k$ is $\\begin{bmatrix} 2 & 4 \\\\ 1 & k \\end{bmatrix}$ not invertible?',
      answer: 2,
      explain: '$\\det = 2k - 4 = 0$ when $k = 2$: the columns become parallel.',
    },
  ],
  'inverse-matrix': [
    {
      kind: 'mcq',
      id: 'r1',
      prompt: 'Which matrix has no inverse?',
      options: [
        { text: '$\\begin{bmatrix} 1 & 2 \\\\ 2 & 4 \\end{bmatrix}$', correct: true },
        {
          text: '$\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$',
          why: 'The identity is its own inverse.',
        },
        {
          text: '$\\begin{bmatrix} 2 & 0 \\\\ 0 & 3 \\end{bmatrix}$',
          why: 'Its inverse scales by $\\tfrac12$ and $\\tfrac13$.',
        },
        {
          text: '$\\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$',
          why: 'A rotation can be undone.',
        },
      ],
      explain:
        'Its determinant is $4 - 4 = 0$: it squashes the plane onto a line, and that cannot be undone.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt:
        '$A = \\begin{bmatrix} 2 & 0 \\\\ 0 & 5 \\end{bmatrix}$. What is the bottom-right entry of $A^{-1}$? (Decimals are fine.)',
      answer: 0.2,
      tolerance: 0.001,
      explain:
        'Undo each stretch: $A^{-1} = \\begin{bmatrix} \\tfrac12 & 0 \\\\ 0 & \\tfrac15 \\end{bmatrix}$.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt:
        'Solve $\\begin{bmatrix} 2 & 0 \\\\ 0 & 4 \\end{bmatrix}\\vec x = \\begin{bmatrix} 6 \\\\ 8 \\end{bmatrix}$. What is the second part of $\\vec x$?',
      answer: 2,
      explain: '$\\vec x = A^{-1}\\vec b = (3, 2)$.',
    },
  ],
  eigenvectors: [
    {
      kind: 'mcq',
      id: 'r1',
      prompt: 'An eigenvector of $A$ is a nonzero vector that $A$…',
      options: [
        { text: 'Only stretches (or flips), keeping it on its own line', correct: true },
        { text: 'Rotates by 90°', why: 'Rotated vectors leave their line.' },
        { text: 'Sends to zero', why: 'That is the null space; eigenvalue 0 is a special case.' },
        { text: 'Leaves exactly unchanged', why: 'That is only eigenvalue 1.' },
      ],
      explain: '$A\\vec v = \\lambda\\vec v$: same line, scaled by $\\lambda$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt:
        'What are the eigenvalues of $\\begin{bmatrix} 3 & 0 \\\\ 0 & -1 \\end{bmatrix}$? Give the larger one.',
      answer: 3,
      explain: 'A diagonal matrix stretches the axes by its diagonal entries: 3 and $-1$.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt: '$A\\vec v = 2\\vec v$. What is $A^3\\vec v$ as a multiple of $\\vec v$?',
      answer: 8,
      explain: 'Each application doubles it: $2^3 = 8$.',
    },
  ],
  'probability-basics': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt:
        'A fair die is rolled. What is the probability of a number greater than 4? (Decimals are fine.)',
      answer: 1 / 3,
      tolerance: 0.005,
      explain: '5 or 6: $\\tfrac{2}{6} = \\tfrac13$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'The chance of rain tomorrow is 0.3. What is the chance it stays dry?',
      answer: 0.7,
      tolerance: 0.001,
      explain: 'Complement: $1 - 0.3 = 0.7$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'A coin lands heads 5 times in a row. The chance of heads next time is…',
      options: [
        { text: 'Still $\\tfrac12$', correct: true },
        {
          text: 'Less than $\\tfrac12$: tails is "due"',
          why: 'The coin has no memory: that is the gambler’s fallacy.',
        },
        {
          text: 'More than $\\tfrac12$: it is on a streak',
          why: 'Independent flips do not build streaks.',
        },
        {
          text: '$\\tfrac{1}{64}$',
          why: 'That is the chance of six heads in a row, before any are flipped.',
        },
      ],
      explain:
        'Each flip is independent. Long-run frequencies settle, but no single flip is "owed".',
    },
  ],
  'conditional-probability': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt:
        'Of 40 students, 25 play a sport and 10 of those also play music. Pick a sporty student at random: what is the probability they play music?',
      answer: 0.4,
      tolerance: 0.001,
      explain: 'Restrict to the 25 sporty students: $\\tfrac{10}{25} = 0.4$.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt: 'Is $P(A \\mid B)$ the same as $P(B \\mid A)$?',
      options: [
        { text: 'Not in general', correct: true },
        {
          text: 'Always',
          why: '$P(\\text{wet} \\mid \\text{rain})$ is near 1, $P(\\text{rain} \\mid \\text{wet})$ is not.',
        },
        {
          text: 'Only for independent events',
          why: 'Even then they are $P(A)$ and $P(B)$, which can differ.',
        },
        { text: 'Never', why: 'They can coincide when $P(A) = P(B)$.' },
      ],
      explain: 'They divide by different groups: $P(A \\cap B)/P(B)$ versus $P(A \\cap B)/P(A)$.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt: '$P(A \\cap B) = 0.12$ and $P(B) = 0.3$. Find $P(A \\mid B)$.',
      answer: 0.4,
      tolerance: 0.001,
      explain: '$\\dfrac{0.12}{0.3} = 0.4$.',
    },
  ],
  'bayes-theorem': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt:
        '1% of people have a condition. A test catches 90% of cases and wrongly flags 9% of healthy people. Out of 1,000 people, about how many positive results are there?',
      answer: 98.1,
      tolerance: 1,
      explain: '9 true positives (90% of 10) plus about 89 false positives (9% of 990): about 98.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt:
        'Same test: if you test positive, what is the chance you have the condition? (Decimals are fine.)',
      answer: 9 / 98.1,
      tolerance: 0.01,
      explain:
        'About $\\tfrac{9}{98} \\approx 0.09$. Most positives come from the much larger healthy group.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt:
        'Why can a positive result from an accurate test still mean you are probably healthy?',
      options: [
        {
          text: 'When the condition is rare, false positives can outnumber true ones',
          correct: true,
        },
        { text: 'Because the test is broken', why: 'Even a good test meets the base-rate effect.' },
        {
          text: 'Because probabilities do not apply to individuals',
          why: 'They do; this is about the base rate.',
        },
        { text: 'It cannot', why: 'It can, and often does, for rare conditions.' },
      ],
      explain:
        'The prior (base rate) matters: a small error rate on a huge healthy group makes many false alarms.',
    },
  ],
  'binomial-distribution': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt:
        'Flip a fair coin 3 times. What is the probability of exactly 2 heads? (Decimals are fine.)',
      answer: 0.375,
      tolerance: 0.001,
      explain: '$\\binom32 \\cdot \\tfrac18 = \\tfrac38 = 0.375$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'A basketball player makes 80% of free throws. Expected number of makes in 20 shots?',
      answer: 16,
      explain: '$np = 20 \\cdot 0.8 = 16$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Why is the middle of a Galton board the most likely place to land?',
      options: [
        { text: 'The most left/right paths lead there', correct: true },
        { text: 'The pegs are tilted towards it', why: 'Each bounce is still 50/50.' },
        {
          text: 'The edges are blocked',
          why: 'Edge bins can be reached, just by only one path each.',
        },
        {
          text: 'It is random luck',
          why: 'It is counting: $\\binom{n}{k}$ is biggest in the middle.',
        },
      ],
      explain:
        'Landing in bin $k$ needs $k$ rights out of $n$; there are $\\binom nk$ ways, most for $k$ near $n/2$.',
    },
  ],
  'normal-distribution': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt:
        'Heights have mean 170 cm and standard deviation 8 cm. About what percent are between 162 and 178 cm?',
      answer: 68,
      tolerance: 1.5,
      unit: '%',
      explain: 'That is within one standard deviation of the mean: about 68%.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'Same heights: what is the $z$-score of 186 cm?',
      answer: 2,
      explain: '$z = \\dfrac{186 - 170}{8} = 2$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Increasing $\\sigma$ makes the bell curve…',
      options: [
        { text: 'Wider and lower', correct: true },
        { text: 'Taller and narrower', why: 'That is a smaller $\\sigma$.' },
        { text: 'Shift right', why: 'Shifting is $\\mu$’s job.' },
        { text: 'Lopsided', why: 'A normal curve always stays symmetric.' },
      ],
      explain: 'The total area stays 1, so spreading it out lowers the peak.',
    },
  ],
  'central-limit-theorem': [
    {
      kind: 'mcq',
      id: 'r1',
      prompt: 'Averages of large samples from a skewed population are distributed…',
      options: [
        { text: 'Approximately normally', correct: true },
        { text: 'With the same skew', why: 'Averaging washes out the skew as $n$ grows.' },
        { text: 'Uniformly', why: 'They cluster around the mean.' },
        {
          text: 'It depends only on the population',
          why: 'The sample size is what makes it normal.',
        },
      ],
      explain:
        'That is the central limit theorem: sample means tend to a normal shape whatever the population.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt:
        'A population has $\\sigma = 12$. What is the standard deviation of means of samples of size 36?',
      answer: 2,
      explain: '$\\sigma/\\sqrt n = 12/6 = 2$.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt: 'To halve the spread of sample means, multiply the sample size by…',
      answer: 4,
      explain:
        'Spread is $\\sigma/\\sqrt n$; halving it needs $\\sqrt n$ doubled, so $n \\times 4$.',
    },
  ],
  'describing-data': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Find the median of 3, 9, 4, 1, 8.',
      answer: 4,
      explain: 'Sorted: 1, 3, 4, 8, 9. The middle value is 4.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'The mean of 4 numbers is 6. Three of them are 2, 5 and 9. What is the fourth?',
      answer: 8,
      explain: 'The total is $4 \\times 6 = 24$; $24 - 16 = 8$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'One billionaire moves into a small town. Which changes more?',
      options: [
        { text: 'The mean income', correct: true },
        { text: 'The median income', why: 'The median only moves one place in the sorted list.' },
        {
          text: 'They change equally',
          why: 'The mean feels the size of every value; the median does not.',
        },
        { text: 'Neither', why: 'The mean jumps.' },
      ],
      explain:
        'The mean is the balance point, so one huge value drags it far; the median resists outliers.',
    },
  ],
  'variance-std': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Find the (population) variance of 1, 3, 5.',
      answer: 8 / 3,
      tolerance: 0.01,
      explain: 'Mean 3; squared deviations 4, 0, 4; average $\\tfrac83 \\approx 2.67$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt:
        'Every value in a data set is multiplied by 3. The standard deviation is multiplied by…',
      answer: 3,
      explain:
        'Every deviation triples, so the standard deviation triples (and the variance becomes 9 times as big).',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Adding 10 to every value changes the standard deviation by…',
      options: [
        { text: 'Nothing', correct: true },
        { text: '+10', why: 'Shifting moves the mean too, so deviations are unchanged.' },
        { text: '×10', why: 'That would be multiplying, not adding.' },
        { text: '+100', why: 'Variance does not change either.' },
      ],
      explain: 'Spread measures distances from the mean; a shift moves everything together.',
    },
  ],
  'linear-regression': [
    {
      kind: 'mcq',
      id: 'r1',
      prompt: 'The least-squares line minimises…',
      options: [
        { text: 'The sum of squared vertical residuals', correct: true },
        {
          text: 'The sum of residuals',
          why: 'That is always 0 for the best line, but so it is for many lines.',
        },
        { text: 'The distance to the farthest point', why: 'That ignores most of the data.' },
        { text: 'The slope', why: 'The slope is whatever fits best.' },
      ],
      explain: 'Squaring keeps residuals positive and punishes big misses most.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'The fitted line is $\\hat y = 2x + 1$. What is the residual for the point $(3, 9)$?',
      answer: 2,
      explain: 'Predicted $\\hat y = 7$; residual $= 9 - 7 = 2$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'The least-squares line always passes through…',
      options: [
        { text: '$(\\bar x, \\bar y)$, the point of means', correct: true },
        { text: 'The origin', why: 'Only if the means are both 0.' },
        { text: 'The first data point', why: 'It need not pass through any data point.' },
        { text: 'The highest point', why: 'Outliers pull it, but it does not pass through them.' },
      ],
      explain: 'The best line balances the data around its centre of mass.',
    },
  ],
  'gradient-descent': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt:
        '$L(w) = w^2$. From $w = 4$ take one gradient step with learning rate 0.25. Where do you land?',
      answer: 2,
      explain: "$L'(4) = 8$; $w \\leftarrow 4 - 0.25 \\cdot 8 = 2$.",
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt: 'The loss jumps around and grows each step. The most likely fix is…',
      options: [
        { text: 'Make the learning rate smaller', correct: true },
        {
          text: 'Make the learning rate bigger',
          why: 'Overshooting gets worse with bigger steps.',
        },
        { text: 'Take more steps', why: 'More diverging steps only diverge further.' },
        { text: 'Start at the minimum', why: 'You do not know where it is; that is the point.' },
      ],
      explain: 'Too large a step overshoots the valley and bounces ever higher.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Gradient descent moves in the direction of…',
      options: [
        { text: 'Minus the gradient (steepest downhill)', correct: true },
        { text: 'The gradient', why: 'That is steepest uphill: gradient ascent.' },
        { text: 'A random direction', why: 'That is random search.' },
        { text: 'Along the contour lines', why: 'Contours keep the loss constant.' },
      ],
      explain: 'The gradient points uphill, so step the opposite way.',
    },
  ],
  pca: [
    {
      kind: 'mcq',
      id: 'r1',
      prompt: 'The first principal component is the direction that…',
      options: [
        { text: 'Captures the most variance', correct: true },
        { text: 'Captures the least variance', why: 'That is the last component.' },
        { text: 'Points along the $x$-axis', why: 'It follows the data, not the axes.' },
        { text: 'Passes through the most points', why: 'PCA measures spread, not hits.' },
      ],
      explain: 'Project the data onto it and the shadow is as spread out as possible.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt: 'Principal components are eigenvectors of…',
      options: [
        { text: 'The covariance matrix', correct: true },
        { text: 'The data matrix itself', why: 'Not square in general; the covariance matrix is.' },
        { text: 'The identity', why: 'Every vector is an eigenvector of the identity.' },
        { text: 'The mean vector', why: 'A vector has no eigenvectors.' },
      ],
      explain: 'Its eigenvalues are the variances along each component.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt:
        'Component variances are 9 and 1. What fraction of the total variance does the first keep? (Decimals are fine.)',
      answer: 0.9,
      tolerance: 0.001,
      explain: '$\\tfrac{9}{9 + 1} = 0.9$: one dimension keeps 90% of the spread.',
    },
  ],
  continuity: [
    {
      kind: 'mcq',
      id: 'r1',
      prompt: 'Which condition fails for a jump at $x = a$?',
      options: [
        { text: 'The limit at $a$ does not exist', correct: true },
        { text: '$f(a)$ is undefined', why: 'A jump can have a perfectly good value at $a$.' },
        {
          text: 'The function is not smooth',
          why: 'Smoothness is a different, stronger property.',
        },
        { text: 'Nothing fails', why: 'You have to lift the pen at a jump.' },
      ],
      explain: 'The left and right sides head to different heights, so there is no single limit.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'What value of $f(1)$ makes $f(x) = \\dfrac{x^2 - 1}{x - 1}$ continuous at 1?',
      answer: 2,
      explain: 'For $x \\ne 1$ it equals $x + 1$, which heads to 2.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'A continuous $f$ has $f(2) = -1$ and $f(6) = 3$. Which must be true?',
      options: [
        { text: '$f(x) = 1$ for some $x$ between 2 and 6', correct: true },
        { text: '$f(4) = 1$', why: 'It hits 1 somewhere, not necessarily at the midpoint.' },
        { text: '$f$ never goes above 3', why: 'It can overshoot and come back.' },
        { text: '$f$ has exactly one root', why: 'It has at least one; it could have more.' },
      ],
      explain: '1 lies between $-1$ and 3, so the intermediate value theorem guarantees it is hit.',
    },
  ],
  'derivative-rules': [
    {
      kind: 'expression',
      id: 'r1',
      prompt: 'Differentiate $x^4 - 3x^2 + 7$.',
      answer: '4x^3 - 6x',
      explain: 'Term by term: $4x^3 - 6x$; the constant vanishes.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: "$f(x) = x^3(x - 2)$. Find $f'(2)$.",
      answer: 8,
      hint: 'Product rule, or expand to $x^4 - 2x^3$ first.',
      explain: "$f' = 3x^2(x - 2) + x^3$. At 2: $0 + 8 = 8$.",
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'What is the derivative of $\\sqrt{x} = x^{1/2}$?',
      options: [
        { text: '$\\dfrac{1}{2\\sqrt x}$', correct: true },
        {
          text: '$\\dfrac{\\sqrt x}{2}$',
          why: 'The power drops by one: $\\tfrac12 - 1 = -\\tfrac12$.',
        },
        { text: '$2\\sqrt x$', why: 'That is closer to an antiderivative.' },
        { text: '$\\dfrac{1}{\\sqrt x}$', why: 'Do not forget the $\\tfrac12$ that comes down.' },
      ],
      explain: 'Power rule with $n = \\tfrac12$: $\\tfrac12 x^{-1/2} = \\dfrac{1}{2\\sqrt x}$.',
    },
  ],
  optimization: [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Where does $f(x) = -x^2 + 8x - 3$ reach its maximum?',
      answer: 4,
      explain: "$f'(x) = -2x + 8 = 0$ at $x = 4$.",
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'A rectangle has perimeter 40. What is the largest area it can have?',
      answer: 100,
      hint: 'Sides $x$ and $20 - x$; maximise $x(20 - x)$.',
      explain: "$A'(x) = 20 - 2x = 0$ at $x = 10$: a $10 \\times 10$ square with area 100.",
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: "At a critical point $c$, $f'$ is positive on both sides. What is $c$?",
      options: [
        { text: 'Neither a maximum nor a minimum', correct: true },
        { text: 'A maximum', why: 'For a peak the slope must turn negative afterwards.' },
        { text: 'A minimum', why: 'For a valley the slope must be negative before.' },
        { text: 'Impossible', why: '$x^3$ at 0 is exactly this.' },
      ],
      explain: 'The curve climbs, pauses flat, and keeps climbing, like $x^3$ at 0.',
    },
  ],
  'newtons-method': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'One Newton step for $f(x) = x^2 - 9$ from $x_0 = 2$.',
      answer: 3.25,
      tolerance: 0.001,
      explain: '$2 - \\dfrac{4 - 9}{4} = 2 + 1.25 = 3.25$.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt: 'Geometrically, a Newton step from $x_n$ goes to…',
      options: [
        { text: 'Where the tangent at $x_n$ crosses the $x$-axis', correct: true },
        { text: 'The midpoint of an interval containing the root', why: 'That is bisection.' },
        {
          text: 'Where the curve crosses the axis',
          why: 'That is the root itself, which we do not know yet.',
        },
        { text: 'The lowest point of the curve', why: 'Newton finds roots, not minima (here).' },
      ],
      explain: 'Replace the curve by its tangent, solve the line, and repeat.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt:
        'Using $x_{n+1} = \\tfrac12\\big(x_n + \\tfrac{a}{x_n}\\big)$ with $a = 10$ and $x_0 = 3$, find $x_1$. (Decimals are fine.)',
      answer: 19 / 6,
      tolerance: 0.001,
      explain:
        '$\\tfrac12(3 + \\tfrac{10}{3}) = \\tfrac{19}{6} \\approx 3.1667$, close to $\\sqrt{10} \\approx 3.1623$.',
    },
  ],
  'integration-techniques': [
    {
      kind: 'expression',
      id: 'r1',
      prompt:
        'Find an antiderivative of $3x^2 e^{x^3}$ (leave out the $+ C$). Type $e^{\\ldots}$ as exp(…).',
      answer: 'exp(x^3)',
      hint: 'Let $u = x^3$.',
      explain: 'With $u = x^3$, $du = 3x^2\\,dx$, so it is $\\int e^u\\,du = e^{x^3}$.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt:
        'For $\\displaystyle\\int x\\cos x\\,dx$ by parts, which choice of $u$ makes it easier?',
      options: [
        { text: '$u = x$, $dv = \\cos x\\,dx$', correct: true },
        {
          text: '$u = \\cos x$, $dv = x\\,dx$',
          why: 'Then $\\int v\\,du$ contains $x^2 \\sin x$: harder.',
        },
        { text: 'Substitution with $u = \\cos x$', why: 'There is no $\\sin x$ factor to absorb.' },
        { text: 'It cannot be integrated', why: 'Parts gives $x\\sin x + \\cos x + C$.' },
      ],
      explain: 'Pick $u$ to be the part that simplifies when differentiated: $x \\to 1$.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt: 'Find $\\displaystyle\\int_0^{\\sqrt{\\pi/2}} 2x\\cos(x^2)\\,dx$.',
      answer: 1,
      tolerance: 0.001,
      explain:
        'With $u = x^2$ the limits become 0 and $\\tfrac\\pi2$: $\\sin\\tfrac\\pi2 - \\sin 0 = 1$.',
    },
  ],
  'infinite-series': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Find $\\tfrac12 + \\tfrac14 + \\tfrac18 + \\cdots$.',
      answer: 1,
      explain: 'Geometric with $a = \\tfrac12$, $r = \\tfrac12$: $\\dfrac{1/2}{1 - 1/2} = 1$.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt: 'Which series converges?',
      options: [
        { text: '$\\sum 1/n^2$', correct: true },
        { text: '$\\sum 1/n$', why: 'The harmonic series diverges, slowly.' },
        { text: '$\\sum 2^n$', why: 'Its terms grow, so the sum blows up.' },
        { text: '$\\sum 1$', why: 'Adding 1 forever grows without bound.' },
      ],
      explain: '$\\sum 1/n^p$ converges for $p > 1$; $\\sum 1/n^2 = \\pi^2/6$.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt:
        'A ball dropped from 10 m bounces back to half its height each time. How far does it travel in total (down and up)?',
      answer: 30,
      hint: 'First drop 10, then each bounce goes up and down: $2(5 + 2.5 + \\cdots)$.',
      explain: '$10 + 2 \\cdot \\dfrac{5}{1 - 1/2} = 10 + 20 = 30$ m.',
    },
  ],
  angles: [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Two angles on a straight line: one is $47^\\circ$. What is the other?',
      answer: 133,
      explain: '$180 - 47 = 133$.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt: 'Which angle is reflex?',
      options: [
        { text: '$250^\\circ$', correct: true },
        { text: '$90^\\circ$', why: 'That is a right angle.' },
        { text: '$150^\\circ$', why: 'Between 90° and 180° is obtuse.' },
        { text: '$180^\\circ$', why: 'That is a straight angle.' },
      ],
      explain: 'Reflex angles are bigger than $180^\\circ$ and less than $360^\\circ$.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt:
        'Four angles meet at a point. Three of them are $90^\\circ$, $80^\\circ$ and $110^\\circ$. Find the fourth.',
      answer: 80,
      explain: 'Around a point: $360 - 90 - 80 - 110 = 80$.',
    },
  ],
  'area-perimeter': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'A rectangle is 9 by 4. What is its area?',
      answer: 36,
      explain: '$9 \\times 4 = 36$ square units.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt:
        'A parallelogram has base 8 and perpendicular height 5 (its slanted side is 6). What is its area?',
      answer: 40,
      explain:
        'Base times perpendicular height: $8 \\times 5 = 40$. The slanted side is not needed.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Which rectangle with perimeter 24 has the largest area?',
      options: [
        { text: '$6 \\times 6$', correct: true },
        { text: '$10 \\times 2$', why: 'Area 20.' },
        { text: '$8 \\times 4$', why: 'Area 32.' },
        { text: '$11 \\times 1$', why: 'Area 11.' },
      ],
      explain: 'For a fixed perimeter, the square wins: $6 \\times 6 = 36$.',
    },
  ],
  triangles: [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'A right-angled triangle has one angle of $35^\\circ$. What is the third angle?',
      answer: 55,
      explain: '$180 - 90 - 35 = 55$.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt: 'Which set of lengths can form a triangle?',
      options: [
        { text: '4, 5, 8', correct: true },
        { text: '1, 2, 5', why: '$1 + 2 < 5$.' },
        { text: '3, 3, 6', why: '$3 + 3 = 6$ exactly: it would be flat.' },
        { text: '2, 7, 10', why: '$2 + 7 < 10$.' },
      ],
      explain: '$4 + 5 = 9 > 8$, and the other pairs are fine too.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt: 'What is each angle of an equilateral triangle?',
      answer: 60,
      explain: 'Three equal angles sharing $180^\\circ$: $60^\\circ$ each.',
    },
  ],
  'circles-pi': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Find the area of a circle with diameter 10. (Decimals are fine.)',
      answer: 25 * Math.PI,
      tolerance: 0.05,
      explain: 'Radius 5: $\\pi \\cdot 5^2 = 25\\pi \\approx 78.54$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'A bike wheel has radius 0.35 m. How far does it roll in one turn, in m?',
      answer: 0.7 * Math.PI,
      tolerance: 0.01,
      explain: 'One circumference: $2\\pi \\times 0.35 \\approx 2.20$ m.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Why is $C \\div d$ the same for every circle?',
      options: [
        { text: 'All circles are scaled copies of each other', correct: true },
        { text: 'Because $\\pi = 3$', why: '$\\pi$ is about 3.14159, and the reason is scaling.' },
        { text: 'It is only true for the unit circle', why: 'It holds for circles of every size.' },
        { text: 'Because circles have no corners', why: 'Scaling is what keeps the ratio fixed.' },
      ],
      explain:
        'Scaling multiplies both the circumference and the diameter by the same factor, so their ratio is unchanged.',
    },
  ],
  'pythagorean-theorem': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'A right triangle has legs 9 and 12. How long is the hypotenuse?',
      answer: 15,
      explain: '$\\sqrt{81 + 144} = \\sqrt{225} = 15$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt:
        'A TV screen is 48 inches wide and 36 inches tall. How long is its diagonal, in inches?',
      answer: 60,
      explain: '$\\sqrt{48^2 + 36^2} = \\sqrt{3600} = 60$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'A triangle has sides 7, 8 and 12. The angle opposite the 12 is…',
      options: [
        { text: 'Obtuse', correct: true },
        { text: 'Right', why: '$49 + 64 = 113 \\ne 144$.' },
        { text: 'Acute', why: '$a^2 + b^2 = 113$ is less than $c^2 = 144$.' },
        { text: 'Impossible to tell', why: 'Compare $a^2 + b^2$ with $c^2$.' },
      ],
      explain: '$7^2 + 8^2 = 113 < 144 = 12^2$, so the angle opposite 12 is obtuse.',
    },
  ],
  similarity: [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'On a 1 : 100 scale drawing, a wall is 4.5 cm long. How long is the real wall, in m?',
      answer: 4.5,
      tolerance: 0.001,
      explain: '$4.5 \\times 100 = 450$ cm $= 4.5$ m.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt:
        'Two similar rectangles have widths 3 and 12. The small one has area 5. What is the area of the big one?',
      answer: 80,
      explain: 'Scale factor 4, so area $\\times 16$: $5 \\times 16 = 80$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Which stays the same when a shape is enlarged?',
      options: [
        { text: 'Its angles', correct: true },
        { text: 'Its perimeter', why: 'It scales by $k$.' },
        { text: 'Its area', why: 'It scales by $k^2$.' },
        { text: 'Its side lengths', why: 'They scale by $k$.' },
      ],
      explain: 'Enlargement changes size, not shape: angles are preserved.',
    },
  ],
  'distance-midpoint': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'How far apart are $(-1, 3)$ and $(5, -5)$?',
      answer: 10,
      explain: '$\\sqrt{6^2 + 8^2} = 10$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'What is the $y$-coordinate of the midpoint of $(4, -3)$ and $(0, 9)$?',
      answer: 3,
      explain: '$\\tfrac{-3 + 9}{2} = 3$. (The midpoint is $(2, 3)$.)',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Which point lies on the circle $x^2 + y^2 = 25$?',
      options: [
        { text: '$(-3, 4)$', correct: true },
        { text: '$(2, 3)$', why: '$4 + 9 = 13$.' },
        { text: '$(5, 5)$', why: '$25 + 25 = 50$.' },
        { text: '$(1, 4)$', why: '$1 + 16 = 17$.' },
      ],
      explain: '$9 + 16 = 25$: it is exactly 5 from the origin.',
    },
  ],
  'geometric-transformations': [
    {
      kind: 'mcq',
      id: 'r1',
      prompt: 'Rotate $(3, 1)$ by $180^\\circ$ about the origin.',
      options: [
        { text: '$(-3, -1)$', correct: true },
        { text: '$(-1, 3)$', why: 'That is a quarter turn.' },
        { text: '$(3, -1)$', why: 'That is a reflection in the $x$-axis.' },
        { text: '$(1, 3)$', why: 'That is a reflection in $y = x$.' },
      ],
      explain: 'A half turn negates both coordinates.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'Reflect $(2, 5)$ in the $y$-axis. What is the new $x$-coordinate?',
      answer: -2,
      explain: 'The $y$-axis mirror maps $(x, y) \\mapsto (-x, y)$: $(-2, 5)$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Which property can a rigid transformation change?',
      options: [
        { text: 'Position', correct: true },
        { text: 'Side lengths', why: 'Rigid moves preserve lengths.' },
        { text: 'Angles', why: 'Rigid moves preserve angles.' },
        { text: 'Area', why: 'The image is congruent, so area is unchanged.' },
      ],
      explain:
        'Rigid transformations move shapes without stretching them: only position (and, for reflections, orientation) changes.',
    },
  ],
  'volume-surface-area': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Find the volume of a $4 \\times 3 \\times 5$ box.',
      answer: 60,
      explain: '$4 \\times 3 \\times 5 = 60$ cubic units.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'Find the surface area of a $4 \\times 3 \\times 5$ box.',
      answer: 94,
      explain: '$2(12 + 20 + 15) = 94$ square units.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt:
        'A cone and a cylinder share a base and height. The cylinder holds 30 litres. How much does the cone hold?',
      answer: 10,
      explain: 'A cone is a third of its cylinder: $30 / 3 = 10$ litres.',
    },
  ],
  'right-triangle-trig': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt:
        'You stand 30 m from a building and look up $45^\\circ$ to its roof. How tall is it above eye level, in m?',
      answer: 30,
      explain: '$\\tan 45^\\circ = 1$, so the height is $30 \\times 1 = 30$ m.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt:
        'A right triangle has hypotenuse 13 and the side opposite $\\theta$ is 5. What is $\\sin\\theta$? (decimal)',
      answer: 5 / 13,
      tolerance: 0.001,
      explain:
        '$\\sin\\theta = \\tfrac{\\text{opp}}{\\text{hyp}} = \\tfrac{5}{13} \\approx 0.385$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt:
        'Two right triangles both have a $40^\\circ$ angle, but one is three times bigger. Their values of $\\tan 40^\\circ$ are…',
      options: [
        { text: 'Equal', correct: true },
        { text: 'Three times bigger for the big one', why: 'Both sides of the ratio grow by 3.' },
        { text: 'Nine times bigger for the big one', why: 'That is how areas scale, not ratios.' },
      ],
      explain:
        'The triangles are similar, so every ratio of sides, including opp/adj, is the same.',
    },
  ],
  radians: [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Convert $45^\\circ$ to radians, as a decimal.',
      answer: Math.PI / 4,
      tolerance: 0.01,
      explain: '$45 \\times \\tfrac{\\pi}{180} = \\tfrac{\\pi}{4} \\approx 0.785$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'Convert $\\tfrac{3\\pi}{2}$ radians to degrees.',
      answer: 270,
      unit: '°',
      explain: '$\\tfrac{3\\pi}{2} \\times \\tfrac{180}{\\pi} = 270^\\circ$.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt:
        'A clock’s minute hand is 12 cm long. How far does its tip travel in 15 minutes, in cm? (decimal)',
      answer: 6 * Math.PI,
      tolerance: 0.05,
      explain:
        'A quarter turn is $\\tfrac{\\pi}{2}$ rad, so $s = r\\theta = 12 \\times \\tfrac{\\pi}{2} = 6\\pi \\approx 18.85$ cm.',
    },
  ],
  'trig-identities': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: '$\\cos\\theta = 0.28$ and $\\theta$ is acute. What is $\\sin\\theta$?',
      answer: 0.96,
      tolerance: 0.001,
      explain: '$\\sin\\theta = \\sqrt{1 - 0.28^2} = \\sqrt{0.9216} = 0.96$.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt: '$\\cos(-\\theta)$ equals…',
      options: [
        { text: '$\\cos\\theta$', correct: true },
        { text: '$-\\cos\\theta$', why: 'Mirroring in the x-axis keeps the x-coordinate.' },
        { text: '$\\sin\\theta$', why: 'That would be $\\cos(90^\\circ - \\theta)$.' },
      ],
      explain:
        'The point for $-\\theta$ is the mirror image in the x-axis: same x, so the same cosine.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt:
        '$\\sin\\theta = 0.6$. What is $\\cos 2\\theta$? (Use $\\cos 2\\theta = 1 - 2\\sin^2\\theta$.)',
      answer: 0.28,
      tolerance: 0.001,
      explain: '$1 - 2 \\times 0.36 = 0.28$.',
    },
  ],
  'law-of-sines-cosines': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Two sides of 5 and 8 meet at $60^\\circ$. How long is the third side?',
      answer: 7,
      explain: '$c^2 = 25 + 64 - 2 \\cdot 5 \\cdot 8 \\cdot \\tfrac12 = 49$, so $c = 7$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt:
        'In a triangle, $A = 45^\\circ$, $B = 30^\\circ$ and $b = 6$. How long is side $a$? (decimal)',
      answer: 6 * Math.SQRT2,
      tolerance: 0.01,
      explain:
        '$a = b \\cdot \\tfrac{\\sin A}{\\sin B} = 6 \\cdot \\tfrac{0.7071}{0.5} \\approx 8.485$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt:
        'In the law of cosines, $c^2 = a^2 + b^2 - 2ab\\cos C$, what happens when $C = 90^\\circ$?',
      options: [
        { text: 'It becomes Pythagoras’ theorem', correct: true },
        { text: '$c$ becomes 0', why: 'Only the correction term vanishes.' },
        { text: 'It no longer works', why: 'It works for every angle, right angles included.' },
      ],
      explain: '$\\cos 90^\\circ = 0$, so the correction disappears and $c^2 = a^2 + b^2$.',
    },
  ],
  'polar-coordinates': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'How far from the origin is the point $(5, -12)$?',
      answer: 13,
      explain: '$r = \\sqrt{25 + 144} = 13$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'The polar point $(4, 30^\\circ)$ has what $y$-coordinate?',
      answer: 2,
      tolerance: 0.001,
      explain: '$y = 4\\sin 30^\\circ = 2$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Which polar point is the same place as $(3, 45^\\circ)$?',
      options: [
        { text: '$(3, 405^\\circ)$', correct: true },
        { text: '$(3, 225^\\circ)$', why: 'That is the opposite direction.' },
        { text: '$(-3, 45^\\circ)$', why: 'A negative $r$ walks backwards, to the opposite side.' },
      ],
      explain: 'Adding a full turn ($360^\\circ$) changes nothing.',
    },
  ],
  'eulers-formula': [
    {
      kind: 'mcq',
      id: 'r1',
      prompt: 'What is $e^{i\\pi}$?',
      options: [
        { text: '$-1$', correct: true },
        { text: '$1$', why: 'That is a full turn, $e^{2\\pi i}$.' },
        { text: '$i$', why: 'That is a quarter turn, $e^{i\\pi/2}$.' },
      ],
      explain: '$\\pi$ radians is half way round the unit circle, at $-1$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'What is $|3e^{i \\cdot 1.2}|$?',
      answer: 3,
      explain: '$|e^{i\\theta}| = 1$, so the length is just 3.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt:
        'Multiply $2e^{i\\,20^\\circ}$ by $3e^{i\\,70^\\circ}$. What is the angle of the product, in degrees?',
      answer: 90,
      unit: '°',
      explain: 'Angles add: $20^\\circ + 70^\\circ = 90^\\circ$ (and lengths multiply, to 6).',
    },
  ],
  'logistic-regression': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'A model predicts $p = \\sigma(0.5x - 2)$. At what $x$ is it exactly 50/50?',
      answer: 4,
      explain: 'The score is zero when $0.5x - 2 = 0$, so $x = 4$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt:
        'What is the log loss (natural log) of predicting $p = 0.9$ for an example whose label is 0?',
      answer: -Math.log(0.1),
      tolerance: 0.01,
      explain: 'For label 0 the loss is $-\\ln(1 - p) = -\\ln 0.1 \\approx 2.30$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'What shape is the decision boundary of a logistic regression with two inputs?',
      options: [
        { text: 'A straight line', correct: true },
        {
          text: 'An S-shaped curve',
          why: 'The S is the probability along one direction, not the boundary.',
        },
        { text: 'A circle', why: 'That needs extra features, such as $x^2 + y^2$.' },
      ],
      explain: 'The boundary is where $w_1x_1 + w_2x_2 + b = 0$: a straight line.',
    },
  ],
  'neural-networks': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'How many weights and biases does a 3 → 5 → 1 network have?',
      answer: 26,
      explain: 'Hidden: $5 \\times (3 + 1) = 20$. Output: $5 + 1 = 6$. Total 26.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt: 'Why can’t a single neuron learn XOR?',
      options: [
        { text: 'No single straight line separates the two classes', correct: true },
        {
          text: 'XOR needs more training data',
          why: 'More data would not change the shape of a single neuron’s boundary.',
        },
        { text: 'The learning rate is too small', why: 'Even the best weights only reach 75%.' },
      ],
      explain:
        'A neuron’s boundary is a line; XOR’s classes sit in opposite corners, so a line gets at most 3 of 4 right.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt:
        'Backprop: $\\tfrac{\\partial L}{\\partial y} = -0.4$, $\\tfrac{\\partial y}{\\partial h} = 0.5$, $\\tfrac{\\partial h}{\\partial w} = 3$. What is $\\tfrac{\\partial L}{\\partial w}$?',
      answer: -0.6,
      tolerance: 0.001,
      explain: 'Multiply along the chain: $-0.4 \\times 0.5 \\times 3 = -0.6$.',
    },
  ],
  'markov-chains': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt:
        'A chain switches from A to B with chance 0.2 and from B to A with chance 0.6. What share of the time is it in A in the long run?',
      answer: 0.75,
      tolerance: 0.001,
      explain: '$\\tfrac{b}{a + b} = \\tfrac{0.6}{0.8} = 0.75$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt:
        'With $P = \\begin{bmatrix} 0.9 & 0.1 \\\\ 0.5 & 0.5 \\end{bmatrix}$ and state 1 today, what is the chance of state 1 in two steps?',
      answer: 0.86,
      tolerance: 0.001,
      explain: '$0.9 \\times 0.9 + 0.1 \\times 0.5 = 0.81 + 0.05 = 0.86$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Which chain never settles to a stationary distribution from every start?',
      options: [
        { text: 'One that goes A → B → C → A with certainty', correct: true },
        {
          text: 'One where every state can reach every other with some randomness',
          why: 'That kind does settle.',
        },
        {
          text: 'One with a 50% chance of staying put in each state',
          why: 'Staying put breaks any rigid cycle, so it settles.',
        },
      ],
      explain:
        'A strict cycle just rotates the distribution forever, so it depends on where it started.',
    },
  ],
  'entropy-information': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'How many yes/no questions does it take to find one of 128 equally likely options?',
      answer: 7,
      explain: '$\\log_2 128 = 7$: each perfect question halves the options.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'An event has probability $\\tfrac{1}{16}$. How many bits of surprise does it carry?',
      answer: 4,
      explain: '$-\\log_2 \\tfrac{1}{16} = 4$ bits.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'A biased coin lands heads 90% of the time. Its entropy is…',
      options: [
        { text: 'Less than 1 bit', correct: true },
        { text: 'Exactly 1 bit', why: 'Only a fair coin has 1 bit.' },
        {
          text: 'More than 1 bit',
          why: 'Two outcomes can never give more than $\\log_2 2 = 1$ bit.',
        },
      ],
      explain: 'It is predictable, so the average surprise is low: about 0.47 bits.',
    },
  ],
  'fourier-series': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt:
        'In the square wave’s series $\\tfrac{4}{\\pi}(\\sin x + \\tfrac{\\sin 3x}{3} + \\cdots)$, what is the amplitude of $\\sin 7x$? (3 decimal places)',
      answer: 4 / (7 * Math.PI),
      tolerance: 0.002,
      explain: '$\\tfrac{4}{7\\pi} \\approx 0.182$.',
    },
    {
      kind: 'mcq',
      id: 'r2',
      prompt:
        'Why do the triangle wave’s partial sums converge much faster than the square wave’s?',
      options: [
        { text: 'It has corners but no jumps, so its coefficients fall like 1/k²', correct: true },
        { text: 'It has fewer harmonics', why: 'Both use the odd harmonics.' },
        { text: 'It has a smaller period', why: 'Both have period 2π.' },
      ],
      explain:
        'Smoother waves have faster-shrinking coefficients: 1/k² for the triangle against 1/k for the square.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt: 'What is the period of $\\sin 4x$? (decimal)',
      answer: Math.PI / 2,
      tolerance: 0.01,
      explain: '$\\tfrac{2\\pi}{4} = \\tfrac{\\pi}{2} \\approx 1.571$.',
    },
  ],
  'rsa-cryptography': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'What is $2^{10} \\bmod 11$?',
      answer: 1,
      explain: '$1024 = 93 \\times 11 + 1$. (Fermat: $a^{p-1} \\equiv 1$ for a prime $p$.)',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt:
        'With $p = 3$ and $q = 11$, $\\varphi = 20$ and $e = 3$. What is the private exponent $d$ (between 1 and 19)?',
      answer: 7,
      explain: '$3 \\times 7 = 21 = 20 + 1$, so $d = 7$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'What would let an attacker compute an RSA private key from the public key?',
      options: [
        { text: 'Factoring n into p and q', correct: true },
        { text: 'Knowing e', why: 'e is public anyway.' },
        { text: 'Seeing one encrypted message', why: 'Ciphertexts alone don’t reveal $\\varphi$.' },
      ],
      explain:
        'With $p$ and $q$ you get $\\varphi = (p-1)(q-1)$ and then $d = e^{-1} \\bmod \\varphi$.',
    },
  ],
  'number-line': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'What is $|-15|$?',
      answer: 15,
      explain: '−15 is 15 steps from 0.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'How far apart are −8 and −3?',
      answer: 5,
      explain: '$|-3 - (-8)| = |5| = 5$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Which list is in order from smallest to largest?',
      options: [
        { text: '$-6, -1, 0, 4$', correct: true },
        { text: '$-1, -6, 0, 4$', why: '−6 is to the left of −1, so it is smaller.' },
        { text: '$0, -1, -6, 4$', why: 'Negative numbers are smaller than 0.' },
      ],
      explain: 'Read the number line from left to right: −6, −1, 0, 4.',
    },
  ],
  'arithmetic-operations': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'What is $-7 + 3$?',
      answer: -4,
      explain: 'Start at −7 and jump 3 right, to −4.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'What is $-2 - (-9)$?',
      answer: 7,
      explain: 'Subtracting −9 means adding 9: $-2 + 9 = 7$.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt: 'What is $(-4) \\times 6$?',
      answer: -24,
      explain: 'One negative factor flips the answer to the negative side: −24.',
    },
  ],
  fractions: [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Fill in the gap: $\\tfrac25 = \\tfrac{?}{15}$.',
      answer: 6,
      explain: '15 is 5 × 3, so multiply the top by 3 too: $2 \\times 3 = 6$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: '$\\tfrac14 + \\tfrac23 = \\tfrac{?}{12}$. What is the numerator?',
      answer: 11,
      explain:
        '$\\tfrac14 = \\tfrac{3}{12}$ and $\\tfrac23 = \\tfrac{8}{12}$, so the sum is $\\tfrac{11}{12}$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Which fraction is equal to $\\tfrac12$?',
      options: [
        { text: '$\\tfrac{7}{14}$', correct: true },
        { text: '$\\tfrac{2}{3}$', why: 'That is more than a half.' },
        { text: '$\\tfrac{3}{8}$', why: 'A half of 8 is 4, not 3.' },
      ],
      explain: '7 is half of 14, so $\\tfrac{7}{14} = \\tfrac12$.',
    },
  ],
  'decimals-percentages': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Write $\\tfrac{7}{20}$ as a percentage.',
      answer: 35,
      unit: '%',
      explain: '$\\tfrac{7}{20} = \\tfrac{35}{100} = 35\\%$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'What is 15% of 60?',
      answer: 9,
      explain: '$0.15 \\times 60 = 9$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'A price rises 10% and then falls 10%. Overall it is…',
      options: [
        { text: '1% lower than at the start', correct: true },
        { text: 'Back to the start', why: 'The fall is 10% of a bigger amount.' },
        { text: '1% higher than at the start', why: '$1.1 \\times 0.9 = 0.99$, which is lower.' },
      ],
      explain: '$1.1 \\times 0.9 = 0.99$: a 1% fall overall.',
    },
  ],
  'ratios-proportions': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt:
        'Simplify the ratio 18 : 24. What is the first number in its simplest form (the second is 4)?',
      answer: 3,
      explain: 'Divide both by 6: $18 : 24 = 3 : 4$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: '£45 is shared in the ratio 1 : 4. How much is the smaller share, in £?',
      answer: 9,
      unit: '£',
      explain: '5 parts of £9; the smaller share is 1 part, £9.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt: 'A car uses 6 litres of fuel for 75 km. How many litres for 200 km?',
      answer: 16,
      explain: '$\\tfrac{6}{75} \\times 200 = 16$ litres.',
    },
  ],
  exponents: [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'What is $3^4$?',
      answer: 81,
      explain: '$3 \\times 3 \\times 3 \\times 3 = 81$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'What is $2^{-3}$ as a decimal?',
      answer: 0.125,
      tolerance: 0.0001,
      explain: '$2^{-3} = \\tfrac{1}{8} = 0.125$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Simplify $\\dfrac{a^7}{a^3}$.',
      options: [
        { text: '$a^4$', correct: true },
        { text: '$a^{10}$', why: 'Dividing subtracts the exponents.' },
        { text: '$a^{7/3}$', why: 'The exponents subtract; they are not divided.' },
      ],
      explain: 'Three factors cancel, leaving $7 - 3 = 4$: $a^4$.',
    },
  ],
  'roots-radicals': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'What is $\\sqrt{144}$?',
      answer: 12,
      explain: '$12 \\times 12 = 144$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'Simplify $\\sqrt{75}$ to the form $k\\sqrt{m}$. What is $k$?',
      answer: 5,
      explain: '$75 = 25 \\times 3$, so $\\sqrt{75} = 5\\sqrt3$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Is $\\sqrt{16 + 9}$ equal to $\\sqrt{16} + \\sqrt9$?',
      options: [
        { text: 'No: it is 5, not 7', correct: true },
        { text: 'Yes: both are 7', why: '$\\sqrt{16 + 9} = \\sqrt{25} = 5$.' },
        { text: 'Yes: both are 5', why: '$\\sqrt{16} + \\sqrt9 = 4 + 3 = 7$.' },
      ],
      explain: 'Roots split over products, not sums: $\\sqrt{25} = 5$ but $4 + 3 = 7$.',
    },
  ],
  'primes-factorization': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'What is the smallest prime factor of 221?',
      answer: 13,
      explain: '$221 = 13 \\times 17$; 2, 3, 5, 7 and 11 don’t divide it.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'What is the greatest common divisor of 18 and 30?',
      answer: 6,
      explain: '$18 = 2 \\times 3^2$, $30 = 2 \\times 3 \\times 5$; they share $2 \\times 3 = 6$.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt:
        'Two lights flash every 8 and every 12 seconds. After how many seconds do they next flash together?',
      answer: 24,
      unit: 's',
      explain: 'lcm(8, 12): $8 = 2^3$, $12 = 2^2 \\times 3$, so $2^3 \\times 3 = 24$.',
    },
  ],
  'real-numbers': [
    {
      kind: 'mcq',
      id: 'r1',
      prompt: 'Which number is rational?',
      options: [
        { text: '$0.\\overline{27}$', correct: true },
        { text: '$\\sqrt3$', why: '3 is not a perfect square.' },
        { text: '$\\pi$', why: 'π is irrational.' },
      ],
      explain:
        'A repeating decimal is a fraction: $0.\\overline{27} = \\tfrac{27}{99} = \\tfrac{3}{11}$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'Write $0.\\overline{3}$ as a fraction $\\tfrac{1}{?}$.',
      answer: 3,
      explain: 'If $x = 0.\\overline{3}$ then $10x - x = 3$, so $x = \\tfrac13$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Does $\\tfrac{7}{40}$ give a decimal that ends?',
      options: [
        { text: 'Yes: 40 has only 2s and 5s as prime factors', correct: true },
        { text: 'No: 7 is prime', why: 'Only the denominator matters.' },
        {
          text: 'No: 40 is not a power of 10',
          why: '$\\tfrac{7}{40} = \\tfrac{175}{1000} = 0.175$.',
        },
      ],
      explain: '$40 = 2^3 \\times 5$, so the decimal ends: $0.175$.',
    },
  ],
  limits: [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Find $\\displaystyle\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$.',
      answer: 4,
      explain: 'For $x \\ne 2$ it is $x + 2$, which heads to 4.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'Find $\\displaystyle\\lim_{x \\to 0} \\frac{\\sin 5x}{x}$.',
      answer: 5,
      hint: 'Write it as $5 \\cdot \\dfrac{\\sin 5x}{5x}$.',
      explain: '$5 \\cdot 1 = 5$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt:
        'The limits from the left and right of $a$ are 2 and 3. Then $\\lim_{x \\to a} f(x)$…',
      options: [
        { text: 'Does not exist', correct: true },
        { text: 'Is 2.5', why: 'A limit is not an average of the sides.' },
        { text: 'Is $f(a)$', why: 'The value at $a$ never decides the limit.' },
        { text: 'Is 3', why: 'Both sides must agree.' },
      ],
      explain: 'A two-sided limit needs both one-sided limits to agree.',
    },
  ],
  derivatives: [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'What is the slope of $f(x) = x^2$ at $x = -2$?',
      answer: -4,
      explain: "$f'(x) = 2x$, so $f'(-2) = -4$.",
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'Secant slope of $f(x) = x^2$ from $x = 2$ to $x = 2.1$?',
      answer: 4.1,
      tolerance: 0.001,
      explain: '$\\dfrac{4.41 - 4}{0.1} = 4.1$, close to the true slope 4.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'At the top of a smooth hill on a graph, the derivative is…',
      options: [
        { text: '0', correct: true },
        { text: 'At its largest', why: 'The height is largest; the slope is flat.' },
        { text: 'Undefined', why: 'A smooth peak has a horizontal tangent.' },
        { text: 'Negative', why: 'It is negative just after the peak, not at it.' },
      ],
      explain: 'The tangent at a smooth peak is horizontal: slope 0.',
    },
  ],
  integrals: [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Find $\\displaystyle\\int_1^4 3\\,dx$.',
      answer: 9,
      explain: 'A rectangle of height 3 and width 3.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'Find $\\displaystyle\\int_{-2}^{2} x\\,dx$.',
      answer: 0,
      explain: 'The triangle below the axis on the left cancels the one above on the right.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Doubling the number of strips in a Riemann sum usually…',
      options: [
        { text: 'Brings the sum closer to the true area', correct: true },
        { text: 'Doubles the sum', why: 'Each strip halves in width, so the total stays similar.' },
        { text: 'Makes no difference', why: 'Thinner strips hug the curve better.' },
        {
          text: 'Always overshoots',
          why: 'Whether it over- or undershoots depends on the curve and method.',
        },
      ],
      explain: 'Thinner strips leave smaller gaps between rectangles and the curve.',
    },
  ],
  'fundamental-theorem': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Find $\\displaystyle\\int_0^2 3x^2\\,dx$.',
      answer: 8,
      explain: '$F(x) = x^3$, so $8 - 0 = 8$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt: 'Find $\\displaystyle\\int_0^{\\pi/2} \\cos x\\,dx$.',
      answer: 1,
      explain: '$F(x) = \\sin x$: $\\sin\\tfrac{\\pi}{2} - \\sin 0 = 1$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: "$A(x) = \\displaystyle\\int_1^x t^3\\,dt$. What is $A'(2)$?",
      options: [
        { text: '8', correct: true },
        {
          text: '12',
          why: 'That is the derivative of $t^3$ at 2; Part 1 gives back $t^3$ itself.',
        },
        { text: '3.75', why: 'That is $A(2)$, the area, not its slope.' },
        { text: '0', why: 'The area is still growing at $x = 2$.' },
      ],
      explain: 'The slope of the area function is the height of $f$: $2^3 = 8$.',
    },
  ],
  'chain-rule': [
    {
      kind: 'expression',
      id: 'r1',
      prompt: 'Differentiate $y = (2x + 1)^3$.',
      answer: '6(2x+1)^2',
      explain: 'Outer $3u^2$, inner derivative 2: $3(2x + 1)^2 \\cdot 2 = 6(2x + 1)^2$.',
    },
    {
      kind: 'expression',
      id: 'r2',
      prompt: 'Differentiate $y = e^{x^2}$.',
      answer: '2x exp(x^2)',
      hint: 'You can type $e^{x^2}$ as exp(x^2).',
      explain: '$e^{x^2} \\cdot 2x$.',
    },
    {
      kind: 'numeric',
      id: 'r3',
      prompt:
        'Altitude rises 50 m per minute, and the temperature falls 0.006 °C per metre. How fast does the temperature change, in °C per minute?',
      answer: -0.3,
      tolerance: 0.001,
      explain: 'Rates multiply: $-0.006 \\times 50 = -0.3$ °C per minute.',
    },
  ],
  'taylor-series': [
    {
      kind: 'numeric',
      id: 'r1',
      prompt: 'Use $\\sin x \\approx x - \\dfrac{x^3}{6}$ to estimate $\\sin 0.5$.',
      answer: 0.47917,
      tolerance: 0.0005,
      explain: '$0.5 - \\tfrac{0.125}{6} \\approx 0.4792$; the true value is $0.4794$.',
    },
    {
      kind: 'numeric',
      id: 'r2',
      prompt:
        'What is the coefficient of $x^2$ in the Maclaurin series of $\\cos x$? (Decimals are fine.)',
      answer: -0.5,
      tolerance: 0.001,
      explain: '$\\cos x = 1 - \\dfrac{x^2}{2!} + \\cdots$, so $-\\tfrac12$.',
    },
    {
      kind: 'mcq',
      id: 'r3',
      prompt: 'Why can the series for $\\ln(1 + x)$ at 0 never work at $x = 3$?',
      options: [
        { text: 'Its radius of convergence is 1, set by the break at $x = -1$', correct: true },
        { text: 'Not enough terms were used', why: 'Beyond the radius, more terms make it worse.' },
        { text: '$\\ln 4$ does not exist', why: 'It does: about 1.386.' },
        { text: 'Polynomials cannot be negative', why: 'They can; the issue is convergence.' },
      ],
      explain:
        'A series reaches only as far as the nearest point where the function breaks, here 1 unit away.',
    },
  ],
}

export default deep

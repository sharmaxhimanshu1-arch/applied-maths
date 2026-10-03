import type { ContentModule } from './types'

const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) < tol

const content: ContentModule = {
  'law-of-sines-cosines': {
    hook: 'SOH CAH TOA only works with a right angle. Real triangles (a field, a roof truss, the triangle between you and two landmarks) rarely have one. Two laws extend trigonometry to **every** triangle.',
    explore: {
      type: 'geometryBoard',
      props: {
        mode: 'law',
        points: [
          [1, 1],
          [7, 1],
          [2.5, 5],
        ],
      },
      caption:
        'Side $a$ is opposite corner A, and so on. Drag the corners and watch both laws hold.',
      tryThis: [
        {
          id: 't-right',
          text: 'Make angle C a right angle. What happens to the $2ab\\cos C$ term?',
          when: (s) => s.mode === 'law' && s.angles[2] === 90,
        },
        {
          id: 't-obtuse',
          text: 'Make angle C obtuse. Is $c^2$ now bigger or smaller than $a^2 + b^2$?',
          when: (s) => s.mode === 'law' && s.angles[2] > 90,
        },
        {
          id: 't-iso',
          text: 'Make $a = b$. Which two angles become equal?',
          when: (s) => s.mode === 'law' && near(s.sides[0], s.sides[1], 0.01),
        },
      ],
    },
    explain:
      'The **law of cosines**, $c^2 = a^2 + b^2 - 2ab\\cos C$, is Pythagoras with a correction. When $C = 90°$ the correction vanishes; when $C$ is obtuse, $\\cos C < 0$ and $c$ is longer than Pythagoras predicts. Use it when you know two sides and the angle between them, or all three sides.\n\nThe **law of sines**, $\\tfrac{a}{\\sin A} = \\tfrac{b}{\\sin B} = \\tfrac{c}{\\sin C}$, says each side is proportional to the sine of the angle opposite it. Use it when you know an angle and the side opposite.',
    formula: {
      tex: 'c^2 = a^2 + b^2 - 2ab\\cos C, \\qquad \\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}',
      caption: 'Each side is named after the angle it faces.',
    },
    misconception:
      'The law of sines can have two answers. Knowing two sides and a non-included angle sometimes fits two different triangles.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-cos',
        prompt: 'Sides 5 and 8 meet at $60°$. How long is the third side?',
        answer: 7,
        hint: '$\\cos 60° = \\tfrac12$.',
        explain: '$c^2 = 25 + 64 - 2 \\cdot 5 \\cdot 8 \\cdot \\tfrac12 = 49$, so $c = 7$.',
      },
      {
        kind: 'numeric',
        id: 'c-sin',
        prompt: 'In a triangle, $A = 30°$, $a = 4$ and $B = 90°$. How long is $b$?',
        answer: 8,
        explain: '$b = a \\cdot \\tfrac{\\sin B}{\\sin A} = 4 \\cdot \\tfrac{1}{1/2} = 8$.',
      },
      {
        kind: 'mcq',
        id: 'c-which',
        prompt: 'You know all three sides of a triangle. Which law finds an angle?',
        options: [
          { text: 'The law of cosines', correct: true },
          { text: 'The law of sines', why: 'It needs an angle to start from.' },
          { text: 'Neither: you need an angle', why: 'Three sides fix the triangle completely.' },
        ],
        explain: 'Rearrange: $\\cos C = \\tfrac{a^2 + b^2 - c^2}{2ab}$.',
      },
    ],
    realWorld: [
      {
        title: 'Triangulation',
        body: 'Measure the angles to a ship from two points on shore a known distance apart, and the law of sines gives its distance.',
      },
      {
        title: 'GPS and astronomy',
        body: 'Distances to nearby stars were first found by solving huge, skinny triangles with Earth’s orbit as one side.',
      },
    ],
    takeaways: [
      'Law of cosines: Pythagoras plus a correction for non-right angles.',
      'Law of sines: sides are proportional to the sines of opposite angles.',
    ],
  },

  'polar-coordinates': {
    hook: 'Instead of “3 across, 4 up”, you could say “5 away, at an angle of $53°$”. That is a **polar** address: a distance $r$ and a direction $\\theta$. Some shapes that are awful in $x$ and $y$ (spirals, flowers, hearts) become one-line formulas.',
    explore: {
      type: 'grapher',
      props: {
        expressions: ['r = a cos(k theta)'],
        params: {
          a: { value: 3, min: 1, max: 4, step: 0.5 },
          k: { value: 3, min: 1, max: 8, step: 1 },
        },
        view: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
        equalAspect: true,
        height: 380,
        thetaMax: 2 * Math.PI,
      },
      caption: 'The rose $r = a\\cos(k\\theta)$: for each angle $\\theta$, go out a distance $r$.',
      tryThis: [
        {
          id: 't-four',
          text: 'Make a rose with 4 petals.',
          when: (s) => s.params.k === 2,
        },
        {
          id: 't-odd',
          text: 'Try $k = 5$. How many petals? Compare with an even $k$.',
          when: (s) => s.params.k === 5,
        },
        {
          id: 't-circle',
          text: 'Set $k = 1$. What shape is it, and where is its centre?',
          when: (s) => s.params.k === 1,
        },
      ],
    },
    explain:
      'A point with polar coordinates $(r, \\theta)$ sits at distance $r$ from the origin in the direction $\\theta$. To convert to ordinary coordinates, $x = r\\cos\\theta$ and $y = r\\sin\\theta$; to go back, $r = \\sqrt{x^2 + y^2}$ and $\\tan\\theta = y/x$.\n\nA polar graph $r = f(\\theta)$ sweeps round as $\\theta$ grows. $r = 2$ is a circle, $r = \\theta$ a spiral, and $r = a\\cos(k\\theta)$ a rose with $k$ petals when $k$ is odd and $2k$ when it is even.',
    formula: {
      tex: 'x = r\\cos\\theta, \\quad y = r\\sin\\theta, \\quad r^2 = x^2 + y^2',
      caption: 'Moving between polar and Cartesian coordinates.',
    },
    misconception:
      'A point has many polar names: $(2, 30°)$, $(2, 390°)$ and $(-2, 210°)$ are all the same place.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-r',
        prompt: 'What is $r$ for the point $(-6, 8)$?',
        answer: 10,
        explain: '$r = \\sqrt{36 + 64} = 10$.',
      },
      {
        kind: 'mcq',
        id: 'c-convert',
        prompt: 'Where is the polar point $(4, 90°)$ in $x, y$?',
        options: [
          { text: '$(0, 4)$', correct: true },
          { text: '$(4, 0)$', why: 'That is at angle $0°$.' },
          { text: '$(4, 90)$', why: 'Polar and Cartesian numbers mean different things.' },
        ],
        explain: '$x = 4\\cos 90° = 0$, $y = 4\\sin 90° = 4$.',
      },
      {
        kind: 'numeric',
        id: 'c-petals',
        prompt: 'How many petals does $r = \\cos(4\\theta)$ have?',
        answer: 8,
        explain: 'Even $k$ gives $2k$ petals: 8.',
      },
    ],
    realWorld: [
      {
        title: 'Radar and sonar',
        body: 'A radar screen naturally reports distance and bearing: polar coordinates.',
      },
      {
        title: 'Microphones',
        body: 'A microphone’s pick-up pattern (the heart-shaped “cardioid”) is drawn as a polar graph $r = 1 + \\cos\\theta$.',
      },
    ],
    takeaways: [
      'Polar coordinates give distance and direction.',
      '$x = r\\cos\\theta$, $y = r\\sin\\theta$.',
      'Circles, spirals and roses have simple polar equations.',
    ],
  },

  'eulers-formula': {
    hook: '$e^{i\\pi} + 1 = 0$ links five of the most important numbers in mathematics in one line. It looks like magic, but it is a picture: raising $e$ to an imaginary power means **walking around a circle**.',
    explore: {
      type: 'complexPlane',
      props: { mode: 'euler', theta: Math.PI / 3, n: 4 },
      caption:
        'The blue point is $e^{i\\theta}$ on the unit circle. The orange path is $(1 + i\\theta/n)^n$: $n$ tiny turns that close in on it.',
      tryThis: [
        {
          id: 't-pi',
          text: 'Set $\\theta = \\pi$. Where does $e^{i\\pi}$ land?',
          when: (s) => s.mode === 'euler' && near(s.theta, Math.PI, 0.02),
        },
        {
          id: 't-steps',
          text: 'Raise $n$ until the orange path ends within 0.05 of the blue point.',
          when: (s) => s.mode === 'euler' && s.error < 0.05,
        },
        {
          id: 't-i',
          text: 'Find $\\theta$ so that $e^{i\\theta} = i$.',
          when: (s) => s.mode === 'euler' && near(s.theta, Math.PI / 2, 0.02),
        },
      ],
    },
    explain:
      'Euler’s formula says $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$: the point at angle $\\theta$ on the unit circle. One way to see it: $e^x$ is the limit of $(1 + x/n)^n$. With $x = i\\theta$, each factor $1 + i\\theta/n$ is a tiny turn by about $\\theta/n$ radians, so $n$ of them turn you by $\\theta$ in total.\n\nAt $\\theta = \\pi$ you have gone half way round, to $-1$. So $e^{i\\pi} = -1$. Every complex number can now be written as $re^{i\\theta}$, and multiplying them just multiplies lengths and adds angles.',
    formula: {
      tex: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta, \\qquad e^{i\\pi} + 1 = 0',
      caption: 'Exponentials of imaginary numbers are rotations.',
    },
    misconception:
      '$e^{i\\theta}$ does not grow: its length is always 1. Imaginary exponents rotate; real exponents stretch.',
    checks: [
      {
        kind: 'mcq',
        id: 'c-half',
        prompt: 'What is $e^{i\\pi/2}$?',
        options: [
          { text: '$i$', correct: true },
          { text: '$-1$', why: 'That is $e^{i\\pi}$, a half turn.' },
          { text: '$1$', why: 'That is $e^{0}$ (or $e^{2\\pi i}$).' },
        ],
        explain: 'A quarter turn from 1 lands on $i$.',
      },
      {
        kind: 'numeric',
        id: 'c-abs',
        prompt: 'What is $|e^{i \\cdot 2.7}|$?',
        answer: 1,
        explain: 'Every $e^{i\\theta}$ lies on the unit circle.',
      },
      {
        kind: 'numeric',
        id: 'c-full',
        prompt: 'What is $e^{2\\pi i}$?',
        answer: 1,
        explain: 'A full turn brings you back to 1.',
      },
    ],
    realWorld: [
      {
        title: 'Electronics',
        body: 'Engineers write AC voltages as $V e^{i\\omega t}$: a point spinning round a circle, whose shadow is the sine wave.',
      },
      {
        title: 'Quantum mechanics',
        body: 'Wave functions carry phases $e^{i\\theta}$; interference is just adding these rotating arrows.',
      },
    ],
    takeaways: [
      '$e^{i\\theta}$ is the point at angle $\\theta$ on the unit circle.',
      '$e^{i\\pi} = -1$.',
      'Complex numbers can be written $re^{i\\theta}$: length and angle.',
    ],
  },
}

export default content

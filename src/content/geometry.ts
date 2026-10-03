import type { ContentModule } from './types'

const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) < tol

const content: ContentModule = {
  'circles-pi': {
    hook: 'Wrap a string around any round thing (a cup, a tyre, a planet) and compare it with the width. It is always the same: a little over **3 times** as long. That number, $\\pi \\approx 3.14159$, is one of the most famous in mathematics.',
    explore: {
      type: 'geometryBoard',
      props: { mode: 'circle', r: 1.5, slices: 8 },
      caption:
        'Top: the circle unrolled is just over 3 diameters. Bottom: cut it into slices and they rearrange into a near-rectangle.',
      tryThis: [
        {
          id: 't-double',
          text: 'Double the radius to 3. What happens to the circumference? To the area?',
          when: (s) => s.mode === 'circle' && s.r === 3,
        },
        {
          id: 't-slices',
          text: 'Cut at least 32 slices. What shape do they make?',
          when: (s) => s.mode === 'circle' && s.slices >= 32,
        },
        {
          id: 't-small',
          text: 'Shrink the radius to 0.5. Does $C \\div d$ change?',
          when: (s) => s.mode === 'circle' && s.r === 0.5,
        },
      ],
    },
    explain:
      'For every circle, circumference ÷ diameter $= \\pi$. So $C = \\pi d = 2\\pi r$.\n\nFor the area, slice the circle like a pizza and lay the slices top-to-tail. The more slices, the closer they come to a rectangle whose height is the radius $r$ and whose width is half the circumference, $\\pi r$. So the area is $\\pi r \\times r = \\pi r^2$.',
    formula: {
      tex: 'C = 2\\pi r, \\qquad A = \\pi r^2',
      caption: 'Circumference grows like $r$, area like $r^2$.',
    },
    misconception:
      '$\\pi$ is not exactly $22/7$ or $3.14$. Those are approximations; $\\pi$’s decimals never end and never repeat.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-circ',
        prompt:
          'A wheel has diameter 50 cm. About how far does it roll in one turn (to the nearest cm)?',
        answer: 157,
        tolerance: 1,
        unit: 'cm',
        explain: '$\\pi \\times 50 \\approx 157$ cm.',
      },
      {
        kind: 'numeric',
        id: 'c-area',
        prompt: 'What is the area of a circle of radius 10? (2 decimal places)',
        answer: 314.16,
        tolerance: 0.01,
        explain: '$\\pi \\times 10^2 = 100\\pi \\approx 314.16$.',
      },
      {
        kind: 'mcq',
        id: 'c-scale',
        prompt: 'A pizza of radius 20 cm vs one of radius 10 cm. The big one has…',
        options: [
          { text: '4 times the area', correct: true },
          { text: 'twice the area', why: 'Area grows with the square of the radius.' },
          { text: '$\\pi$ times the area', why: 'Both have $\\pi$ in their area.' },
        ],
        explain: '$\\pi (20)^2 / \\pi (10)^2 = 400/100 = 4$.',
      },
    ],
    realWorld: [
      {
        title: 'Pizza value',
        body: 'One 18-inch pizza has more pizza than two 12-inch ones: $81\\pi$ versus $72\\pi$ square inches.',
      },
      {
        title: 'Wheels and gears',
        body: 'A bike’s speedometer counts wheel turns and multiplies by the circumference.',
      },
    ],
    takeaways: [
      '$\\pi$ is circumference ÷ diameter, the same for every circle.',
      '$C = 2\\pi r$ and $A = \\pi r^2$.',
      'Double the radius: double the circumference, four times the area.',
    ],
  },

  'pythagorean-theorem': {
    hook: 'Build a square on each side of a right triangle. The two small squares together have **exactly** the area of the big one. That one fact lets you find any distance: across a room, up a ladder, between two cities on a map.',
    explore: {
      type: 'geometryBoard',
      props: { mode: 'pythagoras', a: 3, b: 2 },
      caption: 'Drag the ends of the two legs. The numbers are the areas of the squares.',
      tryThis: [
        {
          id: 't-345',
          text: 'Make legs 3 and 4. What is the hypotenuse?',
          when: (s) =>
            s.mode === 'pythagoras' && ((s.a === 3 && s.b === 4) || (s.a === 4 && s.b === 3)),
        },
        {
          id: 't-equal',
          text: 'Make the two legs equal. How many times longer than a leg is the hypotenuse?',
          when: (s) => s.mode === 'pythagoras' && s.a === s.b,
        },
        {
          id: 't-another',
          text: 'Find another pair of legs (not 3 and 4) that gives a whole-number hypotenuse.',
          when: (s) =>
            s.mode === 'pythagoras' &&
            near(s.c, Math.round(s.c), 1e-9) &&
            !((s.a === 3 && s.b === 4) || (s.a === 4 && s.b === 3)),
        },
      ],
    },
    explain:
      'In a right triangle with legs $a$ and $b$ and hypotenuse $c$ (the long side, opposite the right angle), $a^2 + b^2 = c^2$. So $c = \\sqrt{a^2 + b^2}$, and a leg is $\\sqrt{c^2 - a^2}$.\n\nIt works the other way too: if $a^2 + b^2 = c^2$, the angle between $a$ and $b$ must be a right angle. Builders use 3-4-5 triangles to check corners are square.',
    formula: {
      tex: 'a^2 + b^2 = c^2',
      caption: 'Only for right triangles; $c$ is the side opposite the right angle.',
    },
    misconception:
      '$c$ is not $a + b$. Walking along two sides is always longer than cutting across: $3 + 4 = 7$ but the diagonal is 5.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-hyp',
        prompt: 'Legs 5 and 12. How long is the hypotenuse?',
        answer: 13,
        explain: '$\\sqrt{25 + 144} = \\sqrt{169} = 13$.',
      },
      {
        kind: 'numeric',
        id: 'c-ladder',
        prompt:
          'A 10 m ladder leans on a wall with its foot 6 m out. How high up the wall does it reach?',
        answer: 8,
        unit: 'm',
        explain: '$\\sqrt{10^2 - 6^2} = \\sqrt{64} = 8$.',
      },
      {
        kind: 'mcq',
        id: 'c-right',
        prompt: 'Which side lengths make a right triangle?',
        options: [
          { text: '8, 15, 17', correct: true },
          { text: '4, 5, 6', why: '$16 + 25 = 41 \\ne 36$.' },
          { text: '2, 3, 5', why: 'That is not even a triangle: $2 + 3 = 5$ lies flat.' },
        ],
        explain: '$64 + 225 = 289 = 17^2$.',
      },
    ],
    realWorld: [
      {
        title: 'Screen sizes',
        body: 'A “55-inch” TV is 55 inches along the diagonal: $\\sqrt{\\text{width}^2 + \\text{height}^2}$.',
      },
      {
        title: 'GPS and games',
        body: 'Distances between points on a map or a screen are computed with Pythagoras millions of times a second.',
      },
    ],
    takeaways: [
      'Right triangle: $a^2 + b^2 = c^2$.',
      'Use it to find a missing side or check for a right angle.',
    ],
  },

  similarity: {
    hook: 'A photo enlarged to poster size looks the same, just bigger. Shapes that are scaled copies of each other are **similar**: the same angles, with every length multiplied by the same **scale factor**. It is how maps, models and shadows work.',
    explore: {
      type: 'geometryBoard',
      props: { mode: 'similarity', k: 2 },
      caption:
        'The copy on the right is the triangle scaled by $k$. Drag the original’s corners, or change $k$.',
      tryThis: [
        {
          id: 't-three',
          text: 'Set $k = 3$. Every side triples. What happens to the area?',
          when: (s) => s.mode === 'similarity' && s.k === 3,
        },
        {
          id: 't-shrink',
          text: 'Make the copy smaller than the original.',
          when: (s) => s.mode === 'similarity' && s.k < 1,
        },
        {
          id: 't-congruent',
          text: 'Find the scale factor that makes an identical (congruent) copy.',
          when: (s) => s.mode === 'similarity' && s.k === 1,
        },
      ],
    },
    explain:
      'Two shapes are similar when one is an enlargement of the other: corresponding angles are equal and corresponding sides are in the same ratio $k$. Perimeters scale by $k$ too.\n\nAreas scale by $k^2$, because area has two dimensions and each one is stretched by $k$. (Volumes, with three dimensions, scale by $k^3$.) Two triangles are similar as soon as two pairs of angles match.',
    formula: {
      tex: "\\frac{a'}{a} = \\frac{b'}{b} = \\frac{c'}{c} = k, \\qquad \\frac{A'}{A} = k^2",
      caption: 'Lengths scale by $k$; areas by $k^2$.',
    },
    misconception: 'Doubling the sides does not double the area: it multiplies it by 4.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-side',
        prompt:
          'Two similar triangles have scale factor 2.5. A side of 4 in the small one matches what length in the big one?',
        answer: 10,
        explain: '$4 \\times 2.5 = 10$.',
      },
      {
        kind: 'numeric',
        id: 'c-area',
        prompt: 'A shape of area 12 is enlarged with scale factor 3. What is the new area?',
        answer: 108,
        explain: 'Area scales by $3^2 = 9$: $12 \\times 9 = 108$.',
      },
      {
        kind: 'numeric',
        id: 'c-shadow',
        prompt:
          'A 2 m pole casts a 3 m shadow. At the same moment a tree casts a 15 m shadow. How tall is the tree?',
        answer: 10,
        unit: 'm',
        hint: 'The sun makes similar triangles.',
        explain: 'Scale factor $15/3 = 5$, so the tree is $2 \\times 5 = 10$ m.',
      },
    ],
    realWorld: [
      {
        title: 'Maps',
        body: 'A 1 : 50 000 map is a similar copy of the land, so 2 cm on the map is 1 km on the ground.',
      },
      {
        title: 'Why giants can’t exist',
        body: 'Scale an animal up by 10 and its weight grows 1000 times but its bone strength (an area) only 100 times.',
      },
    ],
    takeaways: [
      'Similar shapes: equal angles, sides in one ratio $k$.',
      'Lengths × $k$, areas × $k^2$, volumes × $k^3$.',
    ],
  },

  'distance-midpoint': {
    hook: 'How far is it from $(1, 2)$ to $(7, 10)$? Walk across, then up, and you have drawn a right triangle. The straight-line distance is its hypotenuse, so Pythagoras answers the question.',
    explore: {
      type: 'geometryBoard',
      props: { mode: 'distance', a: [-3, -2], b: [3, 2] },
      caption:
        'Drag A and B. The dashed legs are the changes in $x$ and $y$; the purple dot is the midpoint.',
      tryThis: [
        {
          id: 't-five',
          text: 'Make the points exactly 5 apart along a slanted line.',
          when: (s) => s.mode === 'distance' && s.dx !== 0 && s.dy !== 0 && near(s.distance, 5),
        },
        {
          id: 't-mid',
          text: 'Move the points so the midpoint lands on $(2, 1)$.',
          when: (s) => s.mode === 'distance' && s.midpoint[0] === 2 && s.midpoint[1] === 1,
        },
        {
          id: 't-ten',
          text: 'Make a distance of exactly 10.',
          when: (s) => s.mode === 'distance' && near(s.distance, 10),
        },
      ],
    },
    explain:
      'From $(x_1, y_1)$ to $(x_2, y_2)$ the legs are $\\Delta x = x_2 - x_1$ and $\\Delta y = y_2 - y_1$, so the distance is $\\sqrt{\\Delta x^2 + \\Delta y^2}$. The sign of $\\Delta x$ does not matter, because it gets squared.\n\nThe **midpoint** is halfway in both directions at once: average the $x$’s and average the $y$’s.',
    formula: {
      tex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}, \\quad M = \\left(\\tfrac{x_1 + x_2}{2}, \\tfrac{y_1 + y_2}{2}\\right)',
      caption: 'Distance is Pythagoras; the midpoint is an average.',
    },
    misconception:
      'Distance is not $\\Delta x + \\Delta y$. That is the “taxicab” distance along the grid, which is longer than the straight line.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-dist',
        prompt: 'How far is $(1, 2)$ from $(7, 10)$?',
        answer: 10,
        explain: '$\\Delta x = 6$, $\\Delta y = 8$: $\\sqrt{36 + 64} = 10$.',
      },
      {
        kind: 'mcq',
        id: 'c-mid',
        prompt: 'What is the midpoint of $(-4, 3)$ and $(6, -1)$?',
        options: [
          { text: '$(1, 1)$', correct: true },
          { text: '$(5, -2)$', why: 'That is half the difference, not the average.' },
          { text: '$(2, 2)$', why: 'Add first, then halve: $(-4 + 6)/2 = 1$.' },
        ],
        explain: '$\\left(\\tfrac{-4 + 6}{2}, \\tfrac{3 - 1}{2}\\right) = (1, 1)$.',
      },
      {
        kind: 'numeric',
        id: 'c-origin',
        prompt: 'How far is $(-5, 12)$ from the origin?',
        answer: 13,
        explain: '$\\sqrt{25 + 144} = 13$.',
      },
    ],
    realWorld: [
      {
        title: 'Nearest neighbour',
        body: 'Recommendation systems and maps find the “closest” item using this distance formula, often in many dimensions.',
      },
      {
        title: 'Meeting halfway',
        body: 'The midpoint of two homes on a map is a fair place to meet (as the crow flies).',
      },
    ],
    takeaways: [
      'Distance between two points is Pythagoras on $\\Delta x$ and $\\Delta y$.',
      'The midpoint averages the coordinates.',
    ],
  },

  'geometric-transformations': {
    hook: 'Slide a shape, turn it, or flip it in a mirror: it ends up somewhere else, but it is still the same shape and size. These **rigid motions** are the basic moves of geometry, of tiling patterns, and of every animation on a screen.',
    explore: {
      type: 'geometryBoard',
      props: { mode: 'rigid' },
      caption:
        'The dashed F is the original; the orange F is its image. Choose a move and adjust it.',
      tryThis: [
        {
          id: 't-slide',
          text: 'Slide the F 4 to the left and 3 up.',
          when: (s) => s.mode === 'rigid' && s.kind === 'translate' && s.dx === -4 && s.dy === 3,
        },
        {
          id: 't-half',
          text: 'Turn the F a half turn. Is it the same as flipping it twice?',
          when: (s) => s.mode === 'rigid' && s.kind === 'rotate' && Math.abs(s.angle) === 180,
        },
        {
          id: 't-diag',
          text: 'Flip the F in the line $y = x$. What happens to each point’s coordinates?',
          when: (s) => s.mode === 'rigid' && s.kind === 'reflect' && s.mirror === 'y=x',
        },
      ],
    },
    explain:
      'A **translation** adds the same vector to every point: $(x, y) \\to (x + a, y + b)$. A **rotation** turns every point the same angle about a centre; a quarter turn anticlockwise about the origin sends $(x, y) \\to (-y, x)$. A **reflection** flips across a mirror line: in the x-axis $(x, y) \\to (x, -y)$, in $y = x$ the coordinates swap.\n\nAll three keep lengths and angles, so the image is **congruent** to the original. A reflection reverses orientation (the F reads backwards); slides and turns do not.',
    formula: {
      tex: 'R_{90°}(x, y) = (-y, x), \\qquad M_{y=x}(x, y) = (y, x)',
      caption: 'Two moves written as coordinate rules.',
    },
    misconception:
      'Order matters when combining moves: “flip then slide” can land somewhere different from “slide then flip”.',
    checks: [
      {
        kind: 'mcq',
        id: 'c-reflect',
        prompt: 'Reflect $(3, -2)$ in the y-axis.',
        options: [
          { text: '$(-3, -2)$', correct: true },
          { text: '$(3, 2)$', why: 'That is the reflection in the x-axis.' },
          { text: '$(-2, 3)$', why: 'That swaps the coordinates (the line $y = x$) and more.' },
        ],
        explain: 'Mirroring in the y-axis changes the sign of $x$ only.',
      },
      {
        kind: 'mcq',
        id: 'c-rotate',
        prompt: 'Rotate $(4, 1)$ by $90°$ anticlockwise about the origin.',
        options: [
          { text: '$(-1, 4)$', correct: true },
          { text: '$(1, -4)$', why: 'That is a clockwise quarter turn.' },
          { text: '$(-4, -1)$', why: 'That is a half turn.' },
        ],
        explain: '$(x, y) \\to (-y, x)$ gives $(-1, 4)$.',
      },
      {
        kind: 'numeric',
        id: 'c-translate',
        prompt: 'A point moves from $(2, 5)$ to $(-1, 9)$. By how much did its $y$ change?',
        answer: 4,
        explain: '$9 - 5 = 4$: up 4 (and left 3).',
      },
    ],
    realWorld: [
      {
        title: 'Tilings and art',
        body: 'Islamic tile patterns and M. C. Escher’s prints are built by sliding, turning and reflecting one tile.',
      },
      {
        title: 'Animation',
        body: 'Every frame of a game moves sprites with exactly these transformations (usually as matrices).',
      },
    ],
    takeaways: [
      'Translations, rotations and reflections keep shape and size.',
      'Each has a simple coordinate rule.',
      'Reflections reverse orientation.',
    ],
  },

  'volume-surface-area': {
    hook: 'A cereal box has two important numbers: how much it **holds** (volume, in cubes) and how much **cardboard** it takes (surface area, in squares). Manufacturers want lots of the first with little of the second.',
    explore: {
      type: 'geometryBoard',
      props: { mode: 'box', l: 6, w: 2, h: 2 },
      caption: 'Change the box’s dimensions. Unfold it into a net to see all six faces.',
      tryThis: [
        {
          id: 't-less',
          text: 'Keep the volume at 24 but use less cardboard than now.',
          when: (s) => s.mode === 'box' && s.volume === 24 && s.surface < 56,
        },
        {
          id: 't-cube',
          text: 'Make a cube. How many faces does it have, and are they all the same?',
          when: (s) => s.mode === 'box' && s.l === s.w && s.w === s.h,
        },
        {
          id: 't-net',
          text: 'Unfold the box into its net. Which faces come in matching pairs?',
          when: (s) => s.mode === 'box' && s.net,
        },
      ],
    },
    explain:
      'A box (cuboid) of length $l$, width $w$ and height $h$ holds $l \\times w \\times h$ unit cubes: layers of $l \\times w$, stacked $h$ high. Its surface is six rectangles in three matching pairs, so the area is $2(lw + lh + wh)$.\n\nThe same idea, area of the base times height, gives the volume of any prism or cylinder: $V = \\pi r^2 h$. Pointed shapes (cones and pyramids) hold exactly a third of that.',
    formula: {
      tex: 'V = lwh, \\qquad S = 2(lw + lh + wh), \\qquad V_{\\text{cyl}} = \\pi r^2 h',
      caption: 'Volume counts cubes; surface area counts the squares on the outside.',
    },
    misconception:
      'Boxes with the same volume can need very different amounts of material. The more cube-like, the less surface.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-vol',
        prompt: 'What is the volume of a 5 × 4 × 3 box?',
        answer: 60,
        explain: '$5 \\times 4 \\times 3 = 60$ cubes.',
      },
      {
        kind: 'numeric',
        id: 'c-surface',
        prompt: 'What is the surface area of a cube with side 3?',
        answer: 54,
        explain: 'Six faces of $3 \\times 3 = 9$: $6 \\times 9 = 54$.',
      },
      {
        kind: 'numeric',
        id: 'c-cyl',
        prompt: 'A can has radius 3 cm and height 10 cm. Its volume is $k\\pi$ cm³. What is $k$?',
        answer: 90,
        explain: '$\\pi \\times 3^2 \\times 10 = 90\\pi$.',
      },
    ],
    realWorld: [
      {
        title: 'Packaging',
        body: 'Drinks cans are nearly as tall as they are wide because that shape holds the most for the least metal.',
      },
      {
        title: 'Cooling',
        body: 'Small animals have a lot of surface for their volume and lose heat fast; elephants have the opposite problem, so they flap their huge ears.',
      },
    ],
    takeaways: [
      'Volume = base area × height for boxes, prisms and cylinders.',
      'Surface area adds up every face (unfold it into a net).',
      'Cube-like shapes hold the most for the least surface.',
    ],
  },

  'right-triangle-trig': {
    hook: 'You cannot climb a tree to measure it, but you can measure the angle up to its top and how far away you stand. **Trigonometry** turns that angle into a length, because in a right triangle, the angle alone fixes the ratios of the sides.',
    explore: {
      type: 'unitCircle',
      props: { theta: Math.PI / 5, units: 'deg', triangle: true, showWave: false, showTan: true },
      caption:
        'Inside a circle of radius 1, the hypotenuse is 1, so the vertical side **is** $\\sin\\theta$ and the horizontal side **is** $\\cos\\theta$.',
      tryThis: [
        {
          id: 't-thirty',
          text: 'Find the angle (under $90°$) where the opposite side is exactly half the hypotenuse.',
          when: (s) => near(s.degrees, 30, 0.5),
        },
        {
          id: 't-equal',
          text: 'Find the angle where the two legs are equal. What is $\\tan$ there?',
          when: (s) => near(s.degrees, 45, 0.5),
        },
        {
          id: 't-steep',
          text: 'Make a slope so steep that $\\tan\\theta$ is bigger than 3.',
          when: (s) => s.tan > 3 && s.degrees < 90,
        },
      ],
    },
    explain:
      'In a right triangle, name the sides from the angle $\\theta$’s point of view: the **hypotenuse** (longest), the **opposite** side and the **adjacent** side. Then $\\sin\\theta = \\tfrac{\\text{opp}}{\\text{hyp}}$, $\\cos\\theta = \\tfrac{\\text{adj}}{\\text{hyp}}$, $\\tan\\theta = \\tfrac{\\text{opp}}{\\text{adj}}$ (SOH CAH TOA).\n\nThese ratios depend only on the angle, because all right triangles with that angle are similar. To find a side, multiply: a 10 m ramp at $30°$ rises $10 \\sin 30° = 5$ m.',
    formula: {
      tex: '\\sin\\theta = \\frac{\\text{opp}}{\\text{hyp}}, \\quad \\cos\\theta = \\frac{\\text{adj}}{\\text{hyp}}, \\quad \\tan\\theta = \\frac{\\text{opp}}{\\text{adj}}',
      caption: 'SOH CAH TOA.',
    },
    misconception:
      '“Opposite” and “adjacent” are not fixed sides. They swap when you look from the other acute angle.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-height',
        prompt:
          'You stand 20 m from a tree and look up $45°$ to its top. How tall is it (from eye level)?',
        answer: 20,
        unit: 'm',
        explain: '$\\tan 45° = 1$, so height $= 20 \\times 1 = 20$ m.',
      },
      {
        kind: 'numeric',
        id: 'c-sin',
        prompt:
          'A right triangle has hypotenuse 13 and the side opposite $\\theta$ is 5. What is $\\sin\\theta$? (decimal)',
        answer: 5 / 13,
        tolerance: 0.001,
        explain: '$\\sin\\theta = 5/13 \\approx 0.385$.',
      },
      {
        kind: 'mcq',
        id: 'c-cos60',
        prompt: 'What is $\\cos 60°$?',
        options: [
          { text: '$\\tfrac12$', correct: true },
          { text: '$\\tfrac{\\sqrt3}{2}$', why: 'That is $\\cos 30°$ (or $\\sin 60°$).' },
          { text: '$1$', why: '$\\cos 0° = 1$.' },
        ],
        explain: 'Half an equilateral triangle: the side next to $60°$ is half the hypotenuse.',
      },
    ],
    realWorld: [
      {
        title: 'Surveying',
        body: 'Surveyors measured mountains (including Everest) by sighting angles from known baselines.',
      },
      {
        title: 'Roads and ramps',
        body: 'A road’s gradient is $\\tan\\theta$: a 10% grade means it rises 1 for every 10 along.',
      },
    ],
    takeaways: [
      'In a right triangle the angle fixes the side ratios.',
      'SOH CAH TOA: $\\sin = $ opp/hyp, $\\cos = $ adj/hyp, $\\tan = $ opp/adj.',
    ],
  },

  radians: {
    hook: 'Degrees are a human invention (why 360?). Mathematics prefers to measure an angle by **how far you travel around the circle**. Walk one radius along the edge and you have turned exactly **1 radian**. With this natural unit, calculus formulas become beautifully simple.',
    explore: {
      type: 'unitCircle',
      props: { theta: 2, units: 'rad', showWave: false },
      caption:
        'On a circle of radius 1, the angle in radians equals the length of the arc. Drag around.',
      tryThis: [
        {
          id: 't-one',
          text: 'Turn exactly 1 radian. About how many degrees is that?',
          when: (s) => near(s.angle, 1, 0.03),
        },
        {
          id: 't-half',
          text: 'Turn half a circle. How many radians is it?',
          when: (s) => near(s.angle, Math.PI, 0.02),
        },
        {
          id: 't-quarter',
          text: 'Turn a quarter circle and write it as a fraction of $\\pi$.',
          when: (s) => near(s.angle, Math.PI / 2, 0.02),
        },
      ],
    },
    explain:
      'The whole circumference of a unit circle is $2\\pi$, so a full turn is $2\\pi$ radians. That gives the conversion: $360° = 2\\pi$, or $180° = \\pi$.\n\nTo change degrees to radians, multiply by $\\tfrac{\\pi}{180}$; to go back, multiply by $\\tfrac{180}{\\pi}$. One radian is about $57.3°$. Arc length on a circle of radius $r$ is simply $s = r\\theta$, with no awkward constants, which is why calculus always uses radians.',
    formula: {
      tex: '\\pi \\text{ rad} = 180°, \\qquad s = r\\theta',
      caption: 'Radians measure angle by arc length.',
    },
    misconception:
      'The $\\pi$ in “$\\pi/2$ radians” is just the number 3.14…; $\\pi/2$ radians is a turn of about 1.57 radius-lengths.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-convert',
        prompt: 'Convert $90°$ to radians (as a decimal).',
        answer: Math.PI / 2,
        tolerance: 0.01,
        explain: '$90 \\times \\tfrac{\\pi}{180} = \\tfrac{\\pi}{2} \\approx 1.571$.',
      },
      {
        kind: 'numeric',
        id: 'c-back',
        prompt: 'Convert $\\tfrac{\\pi}{3}$ radians to degrees.',
        answer: 60,
        unit: '°',
        explain: '$\\tfrac{\\pi}{3} \\times \\tfrac{180}{\\pi} = 60$.',
      },
      {
        kind: 'numeric',
        id: 'c-arc',
        prompt: 'An arc on a circle of radius 5 subtends 2 radians. How long is the arc?',
        answer: 10,
        explain: '$s = r\\theta = 5 \\times 2 = 10$.',
      },
    ],
    realWorld: [
      {
        title: 'Spinning things',
        body: 'Engineers measure rotation speed in radians per second: a wheel turning at $\\omega$ rad/s moves its rim at $r\\omega$.',
      },
      {
        title: 'Programming',
        body: 'Math libraries’ sin and cos take radians, a classic source of bugs when people pass in degrees.',
      },
    ],
    takeaways: [
      'One radian is the angle whose arc equals the radius.',
      '$180° = \\pi$ radians.',
      'Arc length is $r\\theta$.',
    ],
  },

  'trig-identities': {
    hook: 'Some equations are true for **every** angle. They are not puzzles to solve but facts to use, like shortcuts on a map. Almost all of them come from one picture: a point going round the unit circle.',
    explore: {
      type: 'unitCircle',
      props: { theta: 2.2, units: 'deg', showWave: false, triangle: true },
      caption:
        'The point is $(\\cos\\theta, \\sin\\theta)$ and its distance from the centre is always 1.',
      tryThis: [
        {
          id: 't-equal',
          text: 'Find an angle where $\\sin\\theta = \\cos\\theta$. (There are two.)',
          when: (s) => near(s.sin, s.cos, 0.01),
        },
        {
          id: 't-second',
          text: 'Find the angle in the second quadrant where $\\sin\\theta = \\tfrac12$.',
          when: (s) => s.quadrant === 2 && near(s.sin, 0.5, 0.01),
        },
        {
          id: 't-negative-cos',
          text: 'Put the point where $\\cos\\theta$ is negative and $\\sin\\theta$ too. Is $\\sin^2 + \\cos^2$ still 1?',
          when: (s) => s.quadrant === 3,
        },
      ],
    },
    explain:
      'The point on the unit circle is $(\\cos\\theta, \\sin\\theta)$, and by Pythagoras its distance from the centre is 1. That is the **Pythagorean identity**: $\\sin^2\\theta + \\cos^2\\theta = 1$.\n\nSymmetries of the circle give more: $\\sin(-\\theta) = -\\sin\\theta$, $\\cos(-\\theta) = \\cos\\theta$, $\\sin(180° - \\theta) = \\sin\\theta$, and $\\sin(90° - \\theta) = \\cos\\theta$. Dividing by $\\cos^2$ gives $1 + \\tan^2\\theta = \\sec^2\\theta$. The double-angle formulas, like $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$, follow from the angle-sum rules.',
    formula: {
      tex: '\\sin^2\\theta + \\cos^2\\theta = 1, \\qquad \\sin 2\\theta = 2\\sin\\theta\\cos\\theta',
      caption: 'True for every $\\theta$.',
    },
    misconception:
      '$\\sin(a + b)$ is not $\\sin a + \\sin b$. Try $a = b = 90°$: $\\sin 180° = 0$, but $1 + 1 = 2$.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-pyth',
        prompt: 'If $\\sin\\theta = 0.6$ and $\\theta$ is acute, what is $\\cos\\theta$?',
        answer: 0.8,
        explain: '$\\cos\\theta = \\sqrt{1 - 0.36} = 0.8$.',
      },
      {
        kind: 'mcq',
        id: 'c-sym',
        prompt: '$\\sin(180° - \\theta)$ equals…',
        options: [
          { text: '$\\sin\\theta$', correct: true },
          { text: '$-\\sin\\theta$', why: 'Reflecting across the y-axis keeps the height.' },
          { text: '$\\cos\\theta$', why: 'That would be $\\sin(90° - \\theta)$.' },
        ],
        explain:
          'The point for $180° - \\theta$ is the mirror image across the y-axis: same height.',
      },
      {
        kind: 'numeric',
        id: 'c-double',
        prompt: 'If $\\sin\\theta = 0.6$ and $\\cos\\theta = 0.8$, what is $\\sin 2\\theta$?',
        answer: 0.96,
        explain: '$2 \\times 0.6 \\times 0.8 = 0.96$.',
      },
    ],
    realWorld: [
      {
        title: 'Signal processing',
        body: 'Radios mix signals using $\\sin a \\sin b = \\tfrac12[\\cos(a - b) - \\cos(a + b)]$ to shift frequencies.',
      },
      {
        title: 'Simplifying physics',
        body: 'Identities turn messy formulas for projectiles, waves and orbits into simple ones.',
      },
    ],
    takeaways: [
      '$\\sin^2\\theta + \\cos^2\\theta = 1$ is Pythagoras on the unit circle.',
      'Symmetries of the circle give the sign and complement rules.',
    ],
  },

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

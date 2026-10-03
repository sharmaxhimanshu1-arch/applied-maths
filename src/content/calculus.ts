import type { ContentModule } from './types'

const content: ContentModule = {
  'multivariable-functions': {
    hook: 'The height of a landscape depends on two things: how far east and how far north you are. A function of two variables, $z = f(x, y)$, is a **surface**, and the best way to draw it flat is how hikers do: a **contour map**, with lines joining points of equal height.',
    explore: {
      type: 'contourPlot',
      props: { mode: 'surface', fn: 'hill', start: [2, 1.5] },
      caption:
        'A hill $z = 4e^{-(x^2 + y^2)/4}$, seen from above. The side view below slices through your point.',
      tryThis: [
        {
          id: 't-top',
          text: 'Find the summit. How high is it?',
          when: (s) => s.mode === 'surface' && s.z > 3.95,
        },
        {
          id: 't-slice',
          text: 'Switch the side view to slice upwards (north–south).',
          when: (s) => s.mode === 'surface' && s.slice === 'y',
        },
        {
          id: 't-low',
          text: 'Walk down to where the height is below 0.3.',
          when: (s) => s.mode === 'surface' && s.z < 0.3,
        },
      ],
    },
    explain:
      'A function $f(x, y)$ takes a point of the plane and returns a number, which we can picture as a height. Its graph is a surface in 3D. A **level curve** (contour) is the set of points where $f(x, y) = c$ for a fixed $c$.\n\nWhere contours bunch together, the surface is steep; where they are far apart, it is gentle. Closed rings of contours mark hills or hollows, and crossing patterns mark passes (saddles).',
    formula: {
      tex: 'f(x, y) = c \\quad \\text{(a level curve)}',
      caption: 'Each contour joins points at one height.',
    },
    misconception: 'Contour lines never cross: a single point cannot have two different heights.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-eval',
        prompt: 'If $f(x, y) = x^2 + 3y$, what is $f(2, -1)$?',
        answer: 1,
        explain: '$4 - 3 = 1$.',
      },
      {
        kind: 'mcq',
        id: 'c-level',
        prompt: 'What are the level curves of $f(x, y) = x^2 + y^2$?',
        options: [
          { text: 'Circles around the origin', correct: true },
          { text: 'Straight lines', why: 'Those come from planes like $x + y$.' },
          { text: 'Parabolas', why: 'Setting $x^2 + y^2 = c$ gives circles.' },
        ],
        explain: '$x^2 + y^2 = c$ is a circle of radius $\\sqrt c$.',
      },
      {
        kind: 'mcq',
        id: 'c-steep',
        prompt: 'On a contour map, where is the ground steepest?',
        options: [
          { text: 'Where the contours are closest together', correct: true },
          { text: 'Where the contours are furthest apart', why: 'That is the flattest ground.' },
          { text: 'On the highest contour', why: 'High is not the same as steep.' },
        ],
        explain: 'Close contours: big change in height over a short distance.',
      },
    ],
    realWorld: [
      {
        title: 'Weather maps',
        body: 'Isobars are contours of air pressure; tightly packed isobars mean strong wind.',
      },
      {
        title: 'Machine learning',
        body: 'A model’s error is a function of its parameters: a landscape that training tries to descend.',
      },
    ],
    takeaways: [
      '$z = f(x, y)$ is a surface; contours are its level curves.',
      'Close contours mean steep ground.',
    ],
  },

  'partial-derivatives': {
    hook: 'Standing on a hillside, the slope depends on which way you face. Walk east and you might climb; walk north and you might descend. A **partial derivative** measures the slope in one direction, holding the other variable fixed.',
    explore: {
      type: 'contourPlot',
      props: { mode: 'partials', fn: 'saddle', start: [1, 0.5] },
      caption:
        'The saddle $z = x^2 - y^2$. The two side views slice across (y fixed) and up (x fixed) through your point, with their tangent lines.',
      tryThis: [
        {
          id: 't-fx0',
          text: 'Find a point where the east–west slope $\\partial f/\\partial x$ is zero.',
          when: (s) => s.mode === 'partials' && Math.abs(s.fx) < 0.05,
        },
        {
          id: 't-both-up',
          text: 'Find a spot where walking east *and* walking north both go uphill.',
          when: (s) => s.mode === 'partials' && s.fx > 0.2 && s.fy > 0.2,
        },
        {
          id: 't-flat',
          text: 'Find the point where both slopes are zero. Is it a top, a bottom or neither?',
          when: (s) => s.mode === 'partials' && Math.abs(s.fx) < 0.1 && Math.abs(s.fy) < 0.1,
        },
      ],
    },
    explain:
      'To find $\\partial f/\\partial x$, treat $y$ as a constant and differentiate with respect to $x$ as usual. For $f = x^2 - y^2$: $\\partial f/\\partial x = 2x$ and $\\partial f/\\partial y = -2y$.\n\nGeometrically, slice the surface with a vertical plane in the $x$ direction; $\\partial f/\\partial x$ is the slope of that slice. At the centre of the saddle both partials are zero, yet it is neither a top nor a bottom: up along one direction, down along the other.',
    formula: {
      tex: '\\frac{\\partial f}{\\partial x} = \\lim_{h \\to 0} \\frac{f(x + h, y) - f(x, y)}{h}',
      caption: 'Nudge one variable, hold the others still.',
    },
    misconception:
      'Both partial derivatives being zero does not mean you are at a maximum or minimum. It might be a saddle.',
    checks: [
      {
        kind: 'expression',
        id: 'c-px',
        prompt: 'For $f(x, y) = x^2 y + 3y$, find $\\partial f/\\partial x$.',
        answer: '2x y',
        vars: ['x', 'y'],
        explain: 'Treat $y$ as a constant: $2xy$ (the $3y$ term has no $x$).',
      },
      {
        kind: 'expression',
        id: 'c-py',
        prompt: 'For the same $f$, find $\\partial f/\\partial y$.',
        answer: 'x^2 + 3',
        vars: ['x', 'y'],
        explain: 'Treat $x$ as a constant: $x^2 + 3$.',
      },
      {
        kind: 'numeric',
        id: 'c-eval',
        prompt: 'For $f(x, y) = 3x^2 + xy$, what is $\\partial f/\\partial x$ at $(1, 4)$?',
        answer: 10,
        explain: '$6x + y = 6 + 4 = 10$.',
      },
    ],
    realWorld: [
      {
        title: 'Economics',
        body: 'How much more output from one more worker, keeping machines fixed? That is a partial derivative.',
      },
      {
        title: 'Thermodynamics',
        body: 'Gas laws relate pressure, volume and temperature; their partial derivatives describe how each responds to the others.',
      },
    ],
    takeaways: [
      'A partial derivative is the slope in one coordinate direction.',
      'Differentiate in one variable, treating the others as constants.',
    ],
  },

  gradient: {
    hook: 'Lost in fog on a mountain, you want the quickest way up. Feel the slope in every direction and pick the steepest. That direction, packaged with how steep it is, is the **gradient**: an arrow that always points straight uphill.',
    explore: {
      type: 'contourPlot',
      props: { mode: 'gradient', fn: 'hills', start: [-2.2, -2] },
      caption:
        'Two hills of different heights. The arrow is the gradient at your point. Climb by following it.',
      tryThis: [
        {
          id: 't-climb',
          text: 'Climb at least 10 steps uphill from where you are.',
          when: (s) => s.mode === 'gradient' && s.climbed >= 10,
        },
        {
          id: 't-top',
          text: 'Keep climbing until the gradient is almost zero. Which hill did you reach?',
          when: (s) => s.mode === 'gradient' && s.climbed > 0 && s.magnitude < 0.05,
        },
        {
          id: 't-tall',
          text: 'Find a start that climbs to the *taller* hill (on the upper right).',
          when: (s) => s.mode === 'gradient' && s.climbed > 0 && s.magnitude < 0.05 && s.x > 0.5,
        },
      ],
    },
    explain:
      'The gradient collects the partial derivatives into a vector: $\\nabla f = \\left(\\tfrac{\\partial f}{\\partial x}, \\tfrac{\\partial f}{\\partial y}\\right)$. It points in the direction of steepest ascent, its length is that steepest slope, and it is always **perpendicular to the contour** through the point.\n\nFollowing $-\\nabla f$ goes downhill fastest. That is gradient descent, the engine of machine learning. Like a hiker in fog, it finds the nearest peak or valley, not necessarily the highest or lowest.',
    formula: {
      tex: '\\nabla f = \\left(\\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}\\right)',
      caption: 'Points uphill, at right angles to the contours.',
    },
    misconception:
      'Following the gradient finds *a* peak, not *the* highest peak. Where you start decides where you end.',
    checks: [
      {
        kind: 'mcq',
        id: 'c-grad',
        prompt: 'What is $\\nabla f$ for $f(x, y) = x^2 + 3y$ at $(2, 5)$?',
        options: [
          { text: '$(4, 3)$', correct: true },
          { text: '$(2, 3)$', why: '$\\partial f/\\partial x = 2x = 4$ at $x = 2$.' },
          { text: '$(4, 15)$', why: '$\\partial f/\\partial y = 3$, a constant.' },
        ],
        explain: '$(2x, 3) = (4, 3)$.',
      },
      {
        kind: 'numeric',
        id: 'c-steep',
        prompt: 'If $\\nabla f = (3, 4)$ at a point, what is the steepest slope there?',
        answer: 5,
        explain: 'The length of the gradient: $\\sqrt{9 + 16} = 5$.',
      },
      {
        kind: 'mcq',
        id: 'c-perp',
        prompt: 'The gradient at a point is ___ to the contour through that point.',
        options: [
          { text: 'perpendicular', correct: true },
          { text: 'parallel', why: 'Along a contour the height does not change at all.' },
          { text: 'at 45°', why: 'The steepest direction is straight across the contours.' },
        ],
        explain: 'Moving along the contour changes nothing; moving across it changes the most.',
      },
    ],
    realWorld: [
      {
        title: 'Training AI models',
        body: 'Neural networks learn by repeatedly stepping against the gradient of their error.',
      },
      {
        title: 'Heat flow',
        body: 'Heat flows down the temperature gradient, from hot to cold, fastest where the gradient is largest.',
      },
    ],
    takeaways: [
      'The gradient is the vector of partial derivatives.',
      'It points uphill, perpendicular to contours; its length is the steepness.',
      'Gradient methods find local peaks and valleys.',
    ],
  },

  'double-integrals': {
    hook: 'How much water is in a lake? The depth changes from place to place, so chop the surface into small squares, multiply each square’s area by the depth there, and add up. Shrink the squares and you get a **double integral**: the volume under a surface.',
    explore: {
      type: 'contourPlot',
      props: { mode: 'riemann2d', fn: 'hill', n: 3 },
      caption:
        'The square from $-2$ to $2$ on each side, under the hill $z = 4e^{-(x^2 + y^2)/4}$. Each cell is a column.',
      tryThis: [
        {
          id: 't-fine',
          text: 'Use at least 16 cells along each side. How close is the sum now?',
          when: (s) => s.mode === 'riemann2d' && s.n >= 16,
        },
        {
          id: 't-close',
          text: 'Get within 0.05 of the exact volume with as few cells as possible.',
          when: (s) => s.mode === 'riemann2d' && Math.abs(s.error) < 0.05 && s.n <= 12,
        },
        {
          id: 't-one',
          text: 'Use a single column. Why is it a big overestimate?',
          when: (s) => s.mode === 'riemann2d' && s.n === 1,
        },
      ],
    },
    explain:
      'Divide the region into small rectangles of area $\\Delta A$, pick a height $f(x_i, y_j)$ in each, and add the column volumes. The limit as the grid gets finer is the double integral:\n\n$$\\iint_R f(x, y)\\,dA = \\lim \\sum f(x_i, y_j)\\,\\Delta A.$$\n\nIn practice you integrate one variable at a time (**iterated integrals**): $\\int_a^b\\left(\\int_c^d f(x, y)\\,dy\\right)dx$. Integrating $f = 1$ gives the area of the region.',
    formula: {
      tex: '\\iint_R f(x, y)\\,dA = \\int_a^b \\int_c^d f(x, y)\\,dy\\,dx',
      caption: 'Volume under a surface, computed one direction at a time.',
    },
    misconception:
      'The order of integration can be swapped for nice functions (Fubini’s theorem), but the limits must be rewritten to describe the same region.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-const',
        prompt: 'Compute $\\int_0^2\\int_0^3 5\\,dy\\,dx$.',
        answer: 30,
        explain: 'A 2 × 3 base with height 5: volume 30.',
      },
      {
        kind: 'numeric',
        id: 'c-iter',
        prompt: 'Compute $\\int_0^1\\int_0^2 xy\\,dy\\,dx$.',
        answer: 1,
        explain: 'Inner: $\\int_0^2 xy\\,dy = 2x$. Outer: $\\int_0^1 2x\\,dx = 1$.',
      },
      {
        kind: 'mcq',
        id: 'c-area',
        prompt: 'What does $\\iint_R 1\\,dA$ measure?',
        options: [
          { text: 'The area of $R$', correct: true },
          { text: 'The perimeter of $R$', why: 'Integrating 1 over a region adds up area.' },
          { text: 'Zero', why: 'Every bit of area contributes 1 × its size.' },
        ],
        explain: 'Columns of height 1 have volume equal to their base area.',
      },
    ],
    realWorld: [
      {
        title: 'Mass and centre of mass',
        body: 'Integrate density over a plate to get its mass, and $x \\times$ density to find its balance point.',
      },
      {
        title: 'Rainfall',
        body: 'Total rain over a region is the double integral of rainfall depth over the map.',
      },
    ],
    takeaways: [
      'A double integral adds up columns: volume under a surface.',
      'Compute it as two single integrals, one inside the other.',
    ],
  },

  'vector-fields': {
    hook: 'At every point in a river, the water has a speed and a direction. Attach an arrow to every point and you have a **vector field**. Wind maps, magnetic fields and the flow of traffic are all vector fields, and dropping a leaf in shows how things move through them.',
    explore: {
      type: 'slopeField',
      props: { mode: 'vector', field: 'rotation', start: [1.5, 0.5] },
      caption:
        'Arrows show the field. The orange path is a particle carried by the flow from the point you drag.',
      tryThis: [
        {
          id: 't-source',
          text: 'Choose the field where everything flows outward. What is its divergence?',
          when: (s) => s.mode === 'vector' && s.field === 'source',
        },
        {
          id: 't-whirl',
          text: 'Find a field that both spins and drains inward.',
          when: (s) => s.mode === 'vector' && s.field === 'whirlpool',
        },
        {
          id: 't-saddle',
          text: 'In the saddle field, find a start whose path heads straight into the centre.',
          when: (s) => s.mode === 'vector' && s.field === 'saddle' && s.x === 0 && s.y !== 0,
        },
      ],
    },
    explain:
      'A vector field assigns a vector $\\mathbf F(x, y) = (P, Q)$ to each point. A particle following the field traces a **flow line**.\n\nTwo numbers summarise the local behaviour. **Divergence**, $\\tfrac{\\partial P}{\\partial x} + \\tfrac{\\partial Q}{\\partial y}$, measures how much the flow spreads out (sources are positive, sinks negative). **Curl**, $\\tfrac{\\partial Q}{\\partial x} - \\tfrac{\\partial P}{\\partial y}$, measures how much it spins: put a tiny paddle wheel in the flow and see if it turns.',
    formula: {
      tex: '\\operatorname{div}\\mathbf F = \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y}, \\quad \\operatorname{curl}\\mathbf F = \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}',
      caption: 'Spreading out and spinning.',
    },
    misconception:
      'A field can have curl without paths going in circles. The shear field $(y, 0)$ flows in straight lines, yet a paddle wheel in it would spin.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-div',
        prompt: 'What is the divergence of $\\mathbf F = (3x, 2y)$?',
        answer: 5,
        explain: '$3 + 2 = 5$: it spreads out everywhere.',
      },
      {
        kind: 'numeric',
        id: 'c-curl',
        prompt: 'What is the curl of $\\mathbf F = (-y, x)$?',
        answer: 2,
        explain:
          '$\\tfrac{\\partial}{\\partial x}(x) - \\tfrac{\\partial}{\\partial y}(-y) = 1 + 1 = 2$.',
      },
      {
        kind: 'mcq',
        id: 'c-grad',
        prompt: 'The gradient of a function is an example of…',
        options: [
          { text: 'a vector field with zero curl', correct: true },
          {
            text: 'a vector field with zero divergence',
            why: '$\\nabla(x^2 + y^2) = (2x, 2y)$ has divergence 4.',
          },
          { text: 'not a vector field', why: 'It gives a vector at every point.' },
        ],
        explain: 'Gradient fields never swirl: their curl is always 0.',
      },
    ],
    realWorld: [
      {
        title: 'Weather',
        body: 'Wind maps are vector fields; the curl picks out cyclones, and divergence shows rising or sinking air.',
      },
      {
        title: 'Electromagnetism',
        body: 'Maxwell’s equations are statements about the divergence and curl of the electric and magnetic fields.',
      },
    ],
    takeaways: [
      'A vector field is an arrow at every point.',
      'Divergence measures spreading; curl measures spinning.',
    ],
  },

  'lagrange-multipliers': {
    hook: 'Find the highest point on a hiking trail. You are not free to go anywhere: you must stay on the path. At the best spot, the trail runs **along** a contour of the landscape, just touching it. That tangency is the idea behind Lagrange multipliers.',
    explore: {
      type: 'contourPlot',
      props: { mode: 'constraint', fn: 'plane', radius: 2, start: 2.4 },
      caption:
        'Maximise $f = x + 2y$ while staying on the circle $x^2 + y^2 = 4$. Slide the point around the circle.',
      tryThis: [
        {
          id: 't-max',
          text: 'Find where $f$ is largest on the circle. How do the two arrows line up?',
          when: (s) => s.mode === 'constraint' && s.angle < 3 && s.value > 0,
        },
        {
          id: 't-min',
          text: 'Now find the smallest value of $f$ on the circle.',
          when: (s) => s.mode === 'constraint' && s.angle > 177,
        },
        {
          id: 't-four',
          text: 'Find a point on the circle where $f$ is bigger than 4.',
          when: (s) => s.mode === 'constraint' && s.value > 4,
        },
      ],
    },
    explain:
      'To optimise $f(x, y)$ subject to $g(x, y) = c$, look for points where the gradients are parallel:\n\n$$\\nabla f = \\lambda \\nabla g.$$\n\nIf they were not parallel, $\\nabla f$ would have a component along the constraint curve, and sliding that way would still increase $f$. The number $\\lambda$ (the **Lagrange multiplier**) says how much the best value would change if the constraint were loosened slightly.\n\nHere $(1, 2) = \\lambda (2x, 2y)$ forces $y = 2x$; with $x^2 + y^2 = 4$ this gives the maximum $2\\sqrt5 \\approx 4.47$.',
    formula: {
      tex: '\\nabla f = \\lambda \\nabla g, \\qquad g(x, y) = c',
      caption: 'Three equations for three unknowns $x, y, \\lambda$.',
    },
    misconception:
      'Setting $\\nabla f = 0$ ignores the constraint. On a trail, the best point is usually not a summit of the whole landscape.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-max',
        prompt: 'Maximise $xy$ subject to $x + y = 10$. What is the maximum?',
        answer: 25,
        explain: '$\\nabla(xy) = (y, x) = \\lambda(1, 1)$ gives $x = y = 5$, so $xy = 25$.',
      },
      {
        kind: 'numeric',
        id: 'c-circle',
        prompt: 'What is the largest value of $x + y$ on the circle $x^2 + y^2 = 2$?',
        answer: 2,
        explain: 'Parallel gradients give $x = y = 1$: $x + y = 2$.',
      },
      {
        kind: 'mcq',
        id: 'c-meaning',
        prompt: 'At a constrained maximum, the constraint curve and the contour of $f$ are…',
        options: [
          { text: 'tangent to each other', correct: true },
          {
            text: 'perpendicular',
            why: 'Crossing a contour would mean $f$ still changes along the curve.',
          },
          { text: 'unrelated', why: 'Their gradients line up, so the curves touch.' },
        ],
        explain: 'Parallel gradients mean the curves share a tangent line.',
      },
    ],
    realWorld: [
      {
        title: 'Economics',
        body: 'Maximise satisfaction subject to a budget: $\\lambda$ is the extra satisfaction one more euro would buy.',
      },
      {
        title: 'Machine learning',
        body: 'Support vector machines are trained by solving a constrained optimisation with Lagrange multipliers.',
      },
    ],
    takeaways: [
      'Constrained optimum: $\\nabla f$ parallel to $\\nabla g$.',
      'The constraint curve touches a contour of $f$.',
      '$\\lambda$ measures how much the constraint costs.',
    ],
  },

  'intro-differential-equations': {
    hook: 'Physics rarely tells you where something **is**. It tells you how it **changes**: “the more bacteria there are, the faster they multiply.” An equation that links a quantity to its own rate of change is a **differential equation**, and solving it means finding the quantity itself.',
    explore: {
      type: 'slopeField',
      props: { mode: 'slope', eq: 'growth', k: 0.5, start: [0, 1] },
      caption:
        "The equation $y' = ky$ draws a little slope at every point. Drag the starting value; the solution follows the slopes.",
      tryThis: [
        {
          id: 't-decay',
          text: 'Make $k$ negative. What kind of process is that?',
          when: (s) => s.mode === 'slope' && s.k < 0,
        },
        {
          id: 't-zero',
          text: 'Start at $y = 0$. Why does the solution never move?',
          when: (s) => s.mode === 'slope' && s.y0 === 0,
        },
        {
          id: 't-neg',
          text: 'Start below zero. What happens with a positive $k$?',
          when: (s) => s.mode === 'slope' && s.y0 < 0 && s.k > 0,
        },
      ],
    },
    explain:
      'A differential equation like $\\dfrac{dy}{dt} = ky$ says the growth rate is proportional to the amount. Its solutions are $y = y_0 e^{kt}$: check by differentiating, $\\tfrac{d}{dt}(y_0 e^{kt}) = k\\,y_0 e^{kt}$.\n\nThe equation alone has infinitely many solutions, one for each starting value. An **initial condition** such as $y(0) = 1$ picks out one. A solution that stays constant, like $y = 0$ here, is an **equilibrium**.',
    formula: {
      tex: '\\frac{dy}{dt} = ky \\quad\\Longrightarrow\\quad y = y_0 e^{kt}',
      caption: 'The simplest and most important differential equation.',
    },
    misconception: 'The solution of a differential equation is a function, not a number.',
    checks: [
      {
        kind: 'mcq',
        id: 'c-check',
        prompt: "Which function solves $y' = 3y$?",
        options: [
          { text: '$y = 5e^{3t}$', correct: true },
          { text: '$y = 3t$', why: "Then $y' = 3$, not $3y$." },
          { text: '$y = e^{t/3}$', why: "Then $y' = y/3$." },
        ],
        explain: '$\\tfrac{d}{dt}5e^{3t} = 15e^{3t} = 3y$.',
      },
      {
        kind: 'numeric',
        id: 'c-double',
        prompt:
          "A population follows $y' = 0.1y$. Roughly how long until it doubles? (to 1 decimal place)",
        answer: Math.log(2) / 0.1,
        tolerance: 0.05,
        explain: '$e^{0.1t} = 2$ gives $t = \\ln 2 / 0.1 \\approx 6.9$.',
      },
      {
        kind: 'numeric',
        id: 'c-eq',
        prompt: "For $y' = 2(5 - y)$, what is the equilibrium value of $y$?",
        answer: 5,
        explain: 'The rate is 0 when $y = 5$.',
      },
    ],
    realWorld: [
      {
        title: 'Radioactive dating',
        body: 'Carbon-14 decays at a rate proportional to the amount left, so its level reveals the age of ancient remains.',
      },
      {
        title: 'Epidemics',
        body: 'Early in an outbreak, cases grow at a rate proportional to the number infected: exponential growth.',
      },
    ],
    takeaways: [
      'A differential equation links a function to its derivatives.',
      "$y' = ky$ gives exponential growth or decay.",
      'An initial condition picks one solution.',
    ],
  },

  'slope-fields-euler': {
    hook: 'Most differential equations cannot be solved with a formula. But you can always follow the arrows: start somewhere, take a small step in the direction the equation tells you, look again, step again. That is **Euler’s method**, and with small enough steps it gets as close as you like.',
    explore: {
      type: 'slopeField',
      props: { mode: 'euler', eq: 'growth', k: 0.5, start: [0, 1], h: 1, span: 4 },
      caption:
        "For $y' = ky$ from $y(0) = 1$: orange is Euler’s method, blue the exact solution $e^{kx}$. Shrink the step size.",
      tryThis: [
        {
          id: 't-small',
          text: 'Use a step of 0.2 or less. How big is the error at the end?',
          when: (s) => s.mode === 'euler' && s.h <= 0.2,
        },
        {
          id: 't-accurate',
          text: 'Get the final error below 0.5. Is Euler’s answer too big or too small?',
          when: (s) => s.mode === 'euler' && Math.abs(s.error) < 0.5,
        },
        {
          id: 't-big',
          text: 'Try a step of 2. What goes wrong?',
          when: (s) => s.mode === 'euler' && s.h === 2,
        },
      ],
    },
    explain:
      "A **slope field** draws the slope $y' = F(x, y)$ as a short line at each point; solutions are curves that follow the lines.\n\n**Euler’s method** follows them in straight steps of width $h$:\n\n$$y_{n+1} = y_n + h\\,F(x_n, y_n), \\qquad x_{n+1} = x_n + h.$$\n\nEach step uses the slope at its start, so it drifts a little whenever the curve bends. Halving $h$ roughly halves the error at the end (but doubles the work). Better methods, like Runge–Kutta, sample the slope several times per step.",
    formula: {
      tex: 'y_{n+1} = y_n + h\\,F(x_n, y_n)',
      caption: 'Step along the tangent, then re-aim.',
    },
    misconception:
      'Euler steps are not on the true solution curve: they slide onto neighbouring solutions, and the error accumulates.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-step',
        prompt:
          "For $y' = y$ with $y(0) = 1$ and $h = 0.5$, what is the first Euler estimate $y(0.5)$?",
        answer: 1.5,
        explain: '$1 + 0.5 \\times 1 = 1.5$ (the truth is $e^{0.5} \\approx 1.65$).',
      },
      {
        kind: 'numeric',
        id: 'c-two',
        prompt: 'Continue one more step: what is the estimate for $y(1)$?',
        answer: 2.25,
        explain: '$1.5 + 0.5 \\times 1.5 = 2.25$ (the truth is $e \\approx 2.72$).',
      },
      {
        kind: 'mcq',
        id: 'c-error',
        prompt: 'Halving the step size in Euler’s method roughly…',
        options: [
          { text: 'halves the final error', correct: true },
          { text: 'quarters the final error', why: 'That is a second-order method.' },
          { text: 'makes no difference', why: 'Smaller steps follow the bends more closely.' },
        ],
        explain: 'Euler’s method is first order: error proportional to $h$.',
      },
    ],
    realWorld: [
      {
        title: 'Simulation',
        body: 'Weather forecasts, spacecraft trajectories and video-game physics all step equations forward in time like this.',
      },
      {
        title: 'Spreadsheets',
        body: 'You can model a population or a loan in a spreadsheet: each row is one Euler step.',
      },
    ],
    takeaways: [
      'A slope field shows what every solution must look like.',
      'Euler’s method follows it in small straight steps.',
      'Smaller steps, smaller error.',
    ],
  },

  'population-models': {
    hook: 'Rabbits on an island multiply quickly at first, but food and space run out. Growth slows and the population levels off at what the island can support. The **logistic equation** captures both stages in one line.',
    explore: {
      type: 'slopeField',
      props: { mode: 'slope', eq: 'logistic', k: 0.6, c: 8, start: [0, 1] },
      caption:
        "The logistic equation $y' = ky(1 - y/c)$: $k$ is the growth rate, $c$ the carrying capacity. Drag the starting population.",
      tryThis: [
        {
          id: 't-over',
          text: 'Start with more than the island can support. What happens?',
          when: (s) => s.mode === 'slope' && s.y0 > s.c,
        },
        {
          id: 't-eq',
          text: 'Start exactly at the carrying capacity.',
          when: (s) => s.mode === 'slope' && s.y0 === s.c && s.c > 0,
        },
        {
          id: 't-capacity',
          text: 'Halve the carrying capacity to 4. Where does the population settle now?',
          when: (s) => s.mode === 'slope' && s.c === 4,
        },
      ],
    },
    explain:
      'In $\\dfrac{dP}{dt} = rP\\left(1 - \\dfrac{P}{K}\\right)$, the factor $rP$ is exponential growth and $(1 - P/K)$ is the brake. When $P$ is small the brake is off; as $P$ nears $K$ growth stops; above $K$ the population shrinks.\n\nThere are two equilibria: $P = 0$ (unstable: any rabbits at all start growing) and $P = K$ (stable: populations are pulled towards it). Growth is fastest at $P = K/2$, where the S-shaped curve is steepest.',
    formula: {
      tex: '\\frac{dP}{dt} = rP\\left(1 - \\frac{P}{K}\\right)',
      caption: 'Exponential growth with a brake.',
    },
    misconception:
      'Real populations do not grow forever: exponential growth is only the early part of the story.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-k',
        prompt: "For $P' = 0.5P(1 - P/200)$, where does the population level off?",
        answer: 200,
        explain: 'The carrying capacity $K = 200$.',
      },
      {
        kind: 'numeric',
        id: 'c-fast',
        prompt: 'At what population is that growth fastest?',
        answer: 100,
        explain: 'At $K/2 = 100$.',
      },
      {
        kind: 'mcq',
        id: 'c-above',
        prompt: 'If $P$ starts above $K$, the population…',
        options: [
          { text: 'decreases towards $K$', correct: true },
          { text: 'keeps growing', why: 'Above $K$ the brake factor is negative.' },
          { text: 'drops to 0', why: 'It falls only until it reaches $K$.' },
        ],
        explain: '$1 - P/K < 0$ makes the rate negative.',
      },
    ],
    realWorld: [
      {
        title: 'Fisheries',
        body: 'Sustainable fishing keeps fish stocks near $K/2$, where the population replaces itself fastest.',
      },
      {
        title: 'Technology adoption',
        body: 'Smartphone ownership followed a logistic S-curve: slow start, rapid spread, then saturation.',
      },
    ],
    takeaways: [
      'Logistic growth: exponential at first, levelling off at $K$.',
      '$P = K$ is a stable equilibrium; $P = 0$ is unstable.',
    ],
  },

  oscillations: {
    hook: 'Pull a spring and let go: it bounces back and forth. Add friction and the bounces die away. Springs, pendulums, guitar strings and even atoms in a crystal all obey the same equation: acceleration pulls back towards the centre in proportion to the distance.',
    explore: {
      type: 'grapher',
      props: {
        expressions: ['A e^(-b x) cos(w x)'],
        params: {
          A: { value: 2, min: 0.5, max: 3, step: 0.5 },
          b: { value: 0.2, min: 0, max: 1.5, step: 0.1 },
          w: { value: 2, min: 0.5, max: 6, step: 0.5 },
        },
        view: { xMin: 0, xMax: 15, yMin: -3.2, yMax: 3.2 },
        height: 300,
      },
      caption:
        'Displacement $x(t) = Ae^{-bt}\\cos(\\omega t)$ (time runs to the right). $A$ is the amplitude, $b$ the damping, $\\omega$ the angular frequency.',
      tryThis: [
        {
          id: 't-free',
          text: 'Remove all damping. How long does the bouncing last?',
          when: (s) => s.params.b === 0,
        },
        {
          id: 't-heavy',
          text: 'Make the damping heavy (at least 1). How many bounces can you see?',
          when: (s) => s.params.b >= 1,
        },
        {
          id: 't-stiff',
          text: 'Make the spring stiffer: double $\\omega$ to 4.',
          when: (s) => s.params.w === 4,
        },
      ],
    },
    explain:
      "Newton’s law for a spring is $m x'' = -kx$: the further it is stretched, the harder it pulls back. The solutions are $x = A\\cos(\\omega t + \\varphi)$ with $\\omega = \\sqrt{k/m}$. This is **simple harmonic motion**: a stiffer spring or lighter mass oscillates faster.\n\nWith friction, $m x'' + c x' + kx = 0$, and the oscillation decays like $e^{-bt}$. Light damping still bounces; heavy damping just creeps back to rest (like a door closer).",
    formula: {
      tex: "m x'' + c x' + kx = 0, \\qquad \\omega = \\sqrt{k/m}",
      caption: 'The damped harmonic oscillator.',
    },
    misconception:
      'The period of a spring does not depend on how far you stretch it. Bigger swings move faster and take the same time.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-omega',
        prompt: 'A 2 kg mass on a spring with $k = 50$ N/m. What is $\\omega$ (rad/s)?',
        answer: 5,
        explain: '$\\sqrt{50 / 2} = 5$.',
      },
      {
        kind: 'mcq',
        id: 'c-mass',
        prompt: 'If you make the mass 4 times heavier, the oscillation…',
        options: [
          { text: 'takes twice as long per cycle', correct: true },
          {
            text: 'takes 4 times as long',
            why: '$\\omega$ depends on the square root of the mass.',
          },
          { text: 'is unchanged', why: 'Heavier masses respond more slowly.' },
        ],
        explain: '$\\omega = \\sqrt{k/m}$ halves, so the period doubles.',
      },
      {
        kind: 'mcq',
        id: 'c-solve',
        prompt: "Which function solves $x'' = -9x$?",
        options: [
          { text: '$x = \\cos 3t$', correct: true },
          { text: '$x = \\cos 9t$', why: 'Its second derivative is $-81\\cos 9t$.' },
          { text: '$x = e^{3t}$', why: 'Its second derivative is $+9e^{3t}$.' },
        ],
        explain: "$(\\cos 3t)'' = -9\\cos 3t$.",
      },
    ],
    realWorld: [
      {
        title: 'Car suspension',
        body: 'Shock absorbers add damping so a car settles after a bump instead of bouncing down the road.',
      },
      {
        title: 'Clocks',
        body: 'Pendulum clocks and quartz watches keep time because oscillation periods are so steady.',
      },
    ],
    takeaways: [
      'Restoring force proportional to displacement gives sine-wave motion.',
      'Frequency $\\omega = \\sqrt{k/m}$ does not depend on amplitude.',
      'Damping makes the oscillation decay.',
    ],
  },

  'phase-portraits': {
    hook: 'Foxes eat rabbits; more rabbits feed more foxes; more foxes mean fewer rabbits. When two quantities drive each other, plot one against the other and every possible future becomes a path in a **phase portrait**. Its shape tells you, at a glance, whether things settle down, spiral, or blow up.',
    explore: {
      type: 'slopeField',
      props: { mode: 'phase', a: 0, b: 1, c: -1, d: -0.5 },
      caption:
        "The system $x' = ax + by$, $y' = cx + dy$. Orange paths start around the edge. Change the four numbers.",
      tryThis: [
        {
          id: 't-center',
          text: 'Make the paths into closed loops (a centre).',
          when: (s) => s.mode === 'phase' && s.kind === 'center',
        },
        {
          id: 't-saddle',
          text: 'Make a saddle: paths come in one way and leave another.',
          when: (s) => s.mode === 'phase' && s.kind === 'saddle',
        },
        {
          id: 't-unstable',
          text: 'Make everything flow *away* from the origin.',
          when: (s) =>
            s.mode === 'phase' && (s.kind === 'node' || s.kind === 'spiral') && !s.stable,
        },
      ],
    },
    explain:
      "For a linear system $\\mathbf x' = A\\mathbf x$, everything depends on the eigenvalues of $A$. Real eigenvalues of the same sign give a **node** (straight in or out along the eigenvectors), opposite signs give a **saddle**, and complex eigenvalues give **spirals**. Purely imaginary eigenvalues give a **centre**: closed loops.\n\nTwo numbers sort them quickly: the determinant (negative means saddle) and the trace (negative means stable, flowing in). The same picture, zoomed in, describes the equilibria of nonlinear systems like predators and prey.",
    formula: {
      tex: "\\mathbf x' = A\\mathbf x, \\quad \\mathbf x(t) = c_1 e^{\\lambda_1 t}\\mathbf v_1 + c_2 e^{\\lambda_2 t}\\mathbf v_2",
      caption: 'Eigenvalues decide the shape; eigenvectors give the straight-line paths.',
    },
    misconception:
      'Paths in a phase portrait never cross. If they did, one state would have two different futures.',
    checks: [
      {
        kind: 'mcq',
        id: 'c-saddle',
        prompt: "For $x' = 2x$, $y' = -y$, the origin is a…",
        options: [
          { text: 'saddle', correct: true },
          { text: 'stable node', why: '$x$ grows like $e^{2t}$.' },
          { text: 'centre', why: 'The eigenvalues 2 and $-1$ are real.' },
        ],
        explain: 'Eigenvalues of opposite sign.',
      },
      {
        kind: 'mcq',
        id: 'c-spiral',
        prompt: 'Eigenvalues $-1 \\pm 3i$ give…',
        options: [
          { text: 'a stable spiral', correct: true },
          { text: 'an unstable spiral', why: 'The real part $-1$ is negative.' },
          { text: 'a centre', why: 'A centre needs a real part of 0.' },
        ],
        explain: 'Complex means spiralling; negative real part means inward.',
      },
      {
        kind: 'numeric',
        id: 'c-det',
        prompt:
          'What is the determinant of $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$? (Negative means saddle.)',
        answer: -2,
        explain: '$4 - 6 = -2$: a saddle.',
      },
    ],
    realWorld: [
      {
        title: 'Ecology',
        body: 'Predator–prey models (Lotka–Volterra) produce closed loops: booms and busts that repeat.',
      },
      {
        title: 'Engineering stability',
        body: 'Control engineers check that every eigenvalue has a negative real part so that a plane or robot returns to balance.',
      },
    ],
    takeaways: [
      'A phase portrait shows every possible future of a system.',
      'Eigenvalues classify it: node, saddle, spiral or centre.',
      'Negative trace and positive determinant mean stable.',
    ],
  },
}

export default content

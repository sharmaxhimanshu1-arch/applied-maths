import type { ContentModule } from './types'

const content: ContentModule = {
  'number-bases': {
    hook: 'We count in tens because we have ten fingers. Computers have two states, on and off, so they count in **binary**: base 2. Each place is worth twice the place to its right: 1, 2, 4, 8, 16…\n\nSo $1011$ in binary is $8 + 2 + 1 = 11$.',
    explore: {
      type: 'numberTheory',
      props: { mode: 'bases', value: 5 },
      caption: 'Click the bits to turn them on and off.',
      tryThis: [
        {
          id: 't-13',
          text: 'Make 13 in binary.',
          when: (s) => s.mode === 'bases' && s.value === 13,
        },
        {
          id: 't-255',
          text: 'Turn every bit on. What is the biggest 8-bit number?',
          when: (s) => s.mode === 'bases' && s.value === 255,
        },
        {
          id: 't-power',
          text: 'Make a number with exactly one bit on that is bigger than 50.',
          when: (s) => s.mode === 'bases' && s.ones === 1 && s.value > 50,
        },
      ],
    },
    explain:
      'In base $b$, each digit is multiplied by a power of $b$. Base 10: $345 = 3 \\times 10^2 + 4 \\times 10 + 5$. Base 2 uses only 0 and 1. **Hexadecimal** (base 16) uses digits 0–9 and A–F, and each hex digit packs exactly four bits.',
    formula: {
      tex: '1011_2 = 1 \\cdot 2^3 + 0 \\cdot 2^2 + 1 \\cdot 2^1 + 1 \\cdot 2^0 = 11',
      caption: 'Place values are powers of the base.',
    },
    misconception: 'Binary 10 is not ten. It is “one two and no ones”: 2.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-to10',
        prompt: 'What is $11001_2$ in decimal?',
        answer: 25,
        explain: '$16 + 8 + 1 = 25$.',
      },
      {
        kind: 'numeric',
        id: 'c-bits',
        prompt: 'How many different values can 8 bits store?',
        answer: 256,
        explain: '$2^8 = 256$ (0 to 255).',
      },
      {
        kind: 'numeric',
        id: 'c-hex',
        prompt: 'What is the hexadecimal number $\\text{FF}$ in decimal?',
        answer: 255,
        explain: '$15 \\times 16 + 15 = 255$.',
      },
    ],
    realWorld: [
      {
        title: 'Colours',
        body: 'Web colours like #FF8800 are three hex numbers for red, green and blue, each from 0 to 255.',
      },
      {
        title: 'Storage',
        body: 'Every photo, song and message on your phone is stored as a long string of bits.',
      },
    ],
    takeaways: [
      'Each place is a power of the base.',
      'Binary uses 0 and 1; each place doubles.',
      '$n$ bits store $2^n$ values.',
    ],
  },

  'graphs-networks': {
    hook: 'Friends on a social network, airports joined by flights, web pages joined by links: all are **graphs**, made of dots (**nodes**) and lines (**edges**). Graph theory asks questions like: what is the shortest route? who is most connected? can you visit every street exactly once?',
    explore: {
      type: 'networkGraph',
      props: {
        nodes: [
          { id: 'A', at: [-4, 1.5] },
          { id: 'B', at: [-1.5, 2.5] },
          { id: 'C', at: [1.5, 2] },
          { id: 'D', at: [4, 1] },
          { id: 'E', at: [-2.5, -1.5] },
          { id: 'F', at: [0.5, -0.5] },
          { id: 'G', at: [3, -2] },
        ],
        edges: [
          ['A', 'B'],
          ['B', 'C'],
          ['C', 'D'],
          ['A', 'E'],
          ['E', 'F'],
          ['F', 'C'],
          ['F', 'G'],
          ['G', 'D'],
        ],
      },
      caption: 'Pick two nodes to see the shortest route between them; add or remove links.',
      tryThis: [
        {
          id: 't-route',
          text: 'Find the shortest route from A to G.',
          when: (s) => (s.from === 'A' && s.to === 'G') || (s.from === 'G' && s.to === 'A'),
        },
        {
          id: 't-shortcut',
          text: 'Add a link that makes A to D only 2 steps.',
          when: (s) =>
            ((s.from === 'A' && s.to === 'D') || (s.from === 'D' && s.to === 'A')) &&
            s.pathLength === 2,
        },
        {
          id: 't-cut',
          text: 'Remove links until some route is impossible.',
          when: (s) => s.pathLength === -1,
        },
      ],
    },
    explain:
      'The **degree** of a node is how many edges touch it. Each edge has two ends, so the degrees always add up to twice the number of edges (the **handshake lemma**). The shortest route in an unweighted graph can be found by **breadth-first search**: explore all neighbours, then their neighbours, and so on.',
    formula: { tex: '\\sum_{v} \\deg(v) = 2\\,|E|', caption: 'The handshake lemma.' },
    misconception:
      'The drawing is not the graph. Moving dots around changes the picture but not which nodes are connected.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-handshake',
        prompt: 'A graph has 10 edges. What do the degrees of its nodes add up to?',
        answer: 20,
        explain: 'Each edge adds 1 to two degrees: $2 \\times 10 = 20$.',
      },
      {
        kind: 'mcq',
        id: 'c-odd',
        prompt: 'Can a graph have exactly one node of odd degree?',
        options: [
          { text: 'No', correct: true },
          { text: 'Yes', why: 'The degree sum is even, so odd degrees come in pairs.' },
        ],
        explain:
          'The total of all degrees is even, so the number of odd-degree nodes must be even.',
      },
      {
        kind: 'numeric',
        id: 'c-complete',
        prompt: 'Five people all shake hands with each other once. How many handshakes?',
        answer: 10,
        explain: '$\\binom52 = 10$ edges in the complete graph on 5 nodes.',
      },
    ],
    realWorld: [
      {
        title: 'Maps and navigation',
        body: 'Route planners search a graph of junctions and roads for the shortest path.',
      },
      {
        title: 'The web',
        body: 'Search engines rank pages using the graph of links between them.',
      },
      {
        title: 'Epidemics',
        body: 'Contact networks show how a disease could spread and who to vaccinate first.',
      },
    ],
    takeaways: [
      'A graph is nodes joined by edges.',
      'Degrees add up to twice the number of edges.',
      'Breadth-first search finds shortest routes.',
    ],
  },
}

export default content

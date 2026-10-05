import type { ContentModule } from './types'

const content: ContentModule = {
  'sets-venn': {
    hook: 'A **set** is a collection of things: the students who play football, the even numbers, the songs on your playlist. Overlap two sets and new questions appear: who is in both? in either? in neither?\n\n**Venn diagrams** turn those questions into regions you can shade and count.',
    explore: {
      type: 'venn',
      props: { sets: ['Football', 'Music'], counts: { '10': 12, '11': 7, '01': 9, '00': 4 } },
      caption: 'A class of 32 students. Click regions (or use the buttons) to shade them.',
      tryThis: [
        {
          id: 't-both',
          text: 'Shade the students who do both.',
          when: (s) => s.op === 'Football and Music',
        },
        {
          id: 't-either',
          text: 'Shade everyone who does at least one activity. How many?',
          when: (s) => s.op === 'Football or Music',
        },
        {
          id: 't-neither',
          text: 'Shade the students who do neither.',
          when: (s) => s.shaded.length === 1 && s.shaded[0] === '00',
        },
      ],
    },
    explain:
      "The **union** $A \\cup B$ is everything in $A$ or $B$ (or both). The **intersection** $A \\cap B$ is what they share. The **complement** $A'$ is everything not in $A$. When counting a union, don’t count the overlap twice.",
    formula: {
      tex: '|A \\cup B| = |A| + |B| - |A \\cap B|',
      caption: 'Inclusion–exclusion: add the sets, subtract the double-counted overlap.',
    },
    misconception:
      '“Or” in maths includes “both”. Students who play football *or* music include those who do both.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-union',
        prompt: '20 people like tea, 15 like coffee and 6 like both. How many like at least one?',
        answer: 29,
        explain: '$20 + 15 - 6 = 29$.',
      },
      {
        kind: 'mcq',
        id: 'c-symbol',
        prompt: 'Which symbol means “in both sets”?',
        options: [
          { text: '$A \\cap B$', correct: true },
          { text: '$A \\cup B$', why: 'That is “in either”.' },
          { text: "$A'$", why: 'That is “not in $A$”.' },
        ],
        explain: 'The intersection $\\cap$ is the overlap.',
      },
      {
        kind: 'numeric',
        id: 'c-only',
        prompt: 'In the class above, how many students do football but not music?',
        answer: 12,
        explain: 'The football-only region holds 12.',
      },
    ],
    realWorld: [
      {
        title: 'Search engines',
        body: '“cats AND dogs” asks for the intersection of two sets of pages; “cats OR dogs” asks for the union.',
      },
      { title: 'Databases', body: 'Joins and filters in databases are set operations on rows.' },
    ],
    takeaways: [
      'Union = either, intersection = both, complement = not.',
      '$|A \\cup B| = |A| + |B| - |A \\cap B|$.',
      'Venn diagrams make every region visible.',
    ],
  },

  'logic-truth-tables': {
    hook: 'Every app, search filter and processor runs on three tiny words: **AND**, **OR** and **NOT**. They combine true/false statements into new ones. A **truth table** lists every combination of inputs, so you can check a rule completely.',
    explore: {
      type: 'truthTable',
      props: { start: 'and' },
      caption: 'Flip P and Q. Each row you try fills in the table.',
      tryThis: [
        {
          id: 't-and',
          text: 'Fill in the whole table for AND. When is it true?',
          when: (s) => s.op === 'and' && s.rowsTried === 4,
        },
        {
          id: 't-xor',
          text: 'Switch to XOR and find when it is false.',
          when: (s) => s.op === 'xor' && !s.out,
        },
        {
          id: 't-implies',
          text: 'IF…THEN: find the only row that makes it false.',
          when: (s) => s.op === 'implies' && !s.out,
        },
      ],
    },
    explain:
      '$P \\land Q$ (AND) is true only when both are true. $P \\lor Q$ (OR) is true when at least one is. $\\lnot P$ (NOT) flips the value. $P \\Rightarrow Q$ (“if P then Q”) is false only when P is true and Q is false: a promise is only broken if the condition happens and the result doesn’t.',
    formula: {
      tex: '\\lnot(P \\land Q) \\equiv \\lnot P \\lor \\lnot Q',
      caption: 'De Morgan’s law: “not both” means “at least one is not”.',
    },
    misconception:
      '“If it rains, the ground is wet” does not mean “if the ground is wet, it rained”. Reversing an implication changes it.',
    checks: [
      {
        kind: 'mcq',
        id: 'c-or',
        prompt: 'P is false and Q is true. What is $P \\lor Q$?',
        options: [
          { text: 'True', correct: true },
          { text: 'False', why: 'OR needs only one true input.' },
        ],
        explain: 'At least one input is true.',
      },
      {
        kind: 'mcq',
        id: 'c-implies',
        prompt: 'When is “if P then Q” false?',
        options: [
          { text: 'P true, Q false', correct: true },
          {
            text: 'P false, Q true',
            why: 'The condition did not happen, so the promise was not broken.',
          },
          { text: 'Both false', why: 'The promise was not tested.' },
          { text: 'Both true', why: 'The promise was kept.' },
        ],
        explain: 'Only when the condition holds and the result fails.',
      },
      {
        kind: 'numeric',
        id: 'c-rows',
        prompt: 'How many rows does a truth table with 3 inputs have?',
        answer: 8,
        explain: 'Each input is true or false: $2^3 = 8$ rows.',
      },
    ],
    realWorld: [
      {
        title: 'Computer chips',
        body: 'Billions of AND, OR and NOT gates built from transistors do all of a computer’s arithmetic.',
      },
      {
        title: 'Search filters',
        body: 'Shopping filters combine conditions: (size M AND colour blue) OR on sale.',
      },
    ],
    takeaways: [
      'AND needs both, OR needs at least one, NOT flips.',
      'IF P THEN Q is false only when P is true and Q is false.',
      'A truth table with $n$ inputs has $2^n$ rows.',
    ],
  },

  counting: {
    hook: 'You have 3 shirts, 2 pairs of trousers and 2 hats. How many outfits? Instead of listing them all, notice that every shirt can go with every pair of trousers, and each of those with every hat: $3 \\times 2 \\times 2 = 12$.',
    explore: {
      type: 'countingTree',
      props: {
        mode: 'product',
        stages: [
          { label: 'Shirts', count: 3 },
          { label: 'Trousers', count: 2 },
          { label: 'Hats', count: 2 },
        ],
      },
      caption:
        'Each level of the tree is one choice. The branches at the end are the complete outfits.',
      tryThis: [
        {
          id: 't-24',
          text: 'Make exactly 24 outfits.',
          when: (s) => s.mode === 'product' && s.total === 24,
        },
        {
          id: 't-one',
          text: 'What happens to the total if one choice has only 1 option?',
          when: (s) => s.mode === 'product' && s.counts.includes(1),
        },
        {
          id: 't-max',
          text: 'Max out every choice. How many branches?',
          when: (s) => s.mode === 'product' && s.total === 64,
        },
      ],
    },
    explain:
      'The **counting principle**: if one choice has $a$ options and a second, independent choice has $b$ options, there are $a \\times b$ ways to make both. It extends to any number of choices, which is why the tree grows so fast.',
    formula: {
      tex: 'a_1 \\times a_2 \\times \\cdots \\times a_k',
      caption: 'Multiply the number of options at each step.',
    },
    misconception:
      'Choices multiply, they don’t add. 3 shirts and 4 trousers make 12 outfits, not 7.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-meal',
        prompt: 'A café offers 4 starters, 5 mains and 3 desserts. How many three-course meals?',
        answer: 60,
        explain: '$4 \\times 5 \\times 3 = 60$.',
      },
      {
        kind: 'numeric',
        id: 'c-pin',
        prompt: 'How many 4-digit PINs are there (digits 0–9, repeats allowed)?',
        answer: 10000,
        explain: '$10^4 = 10{,}000$.',
      },
      {
        kind: 'numeric',
        id: 'c-coins',
        prompt: 'You flip a coin 5 times. How many different sequences of heads and tails?',
        answer: 32,
        explain: '$2^5 = 32$.',
      },
    ],
    realWorld: [
      {
        title: 'Passwords',
        body: 'Each extra character multiplies the possibilities, which is why longer passwords are so much harder to guess.',
      },
      {
        title: 'Number plates',
        body: 'Plate formats are chosen by counting: letters and digits multiply up to millions of plates.',
      },
    ],
    takeaways: [
      'Independent choices multiply.',
      'A tree diagram shows every outcome.',
      '$n$ yes/no choices give $2^n$ outcomes.',
    ],
  },

  'permutations-combinations': {
    hook: 'How many ways can 3 runners out of 6 finish gold, silver, bronze? Order matters: that is a **permutation**. How many ways can you pick a 3-person team from 6 people? Order doesn’t matter: that is a **combination**.\n\nBoth start with the counting principle; combinations then divide out the repeats.',
    explore: {
      type: 'countingTree',
      props: { mode: 'arrange', n: 4, k: 2 },
      caption: 'Each level picks one more item, with one fewer left to choose from.',
      tryThis: [
        {
          id: 't-ordered',
          text: 'Choose 3 from 5 with order mattering. Check it equals $5 \\times 4 \\times 3$.',
          when: (s) => s.mode === 'arrange' && s.n === 5 && s.k === 3 && s.orderMatters,
        },
        {
          id: 't-unordered',
          text: 'Switch off “order matters”. Why is the count $3! = 6$ times smaller?',
          when: (s) => s.mode === 'arrange' && s.n === 5 && s.k === 3 && !s.orderMatters,
        },
        {
          id: 't-all',
          text: 'Arrange all 4 of 4 items. How many orders?',
          when: (s) => s.mode === 'arrange' && s.n === 4 && s.k === 4 && s.orderMatters,
        },
      ],
    },
    explain:
      'Arranging $k$ of $n$ items in order: $n$ choices for the first, $n - 1$ for the second, and so on, giving ${}^nP_k = \\frac{n!}{(n-k)!}$. Each unordered group of $k$ appears $k!$ times in that list, so the number of **combinations** is ${}^nP_k / k!$.',
    formula: {
      tex: '{}^nP_k = \\frac{n!}{(n-k)!} \\qquad \\binom{n}{k} = \\frac{n!}{k!\\,(n-k)!}',
      caption: 'Permutations count orders; combinations count groups.',
    },
    misconception:
      'A “combination lock” is really a permutation lock: 1-2-3 and 3-2-1 open different locks.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-podium',
        prompt: 'In how many ways can gold, silver and bronze go to 8 runners?',
        answer: 336,
        explain: '$8 \\times 7 \\times 6 = 336$.',
      },
      {
        kind: 'numeric',
        id: 'c-team',
        prompt: 'How many ways to choose 2 people from 5 for a team?',
        answer: 10,
        explain: '$\\binom52 = \\frac{5 \\times 4}{2} = 10$.',
      },
      {
        kind: 'numeric',
        id: 'c-factorial',
        prompt: 'In how many orders can 5 books stand on a shelf?',
        answer: 120,
        explain: '$5! = 120$.',
      },
    ],
    realWorld: [
      {
        title: 'Lotteries',
        body: 'Choosing 6 numbers from 49 gives $\\binom{49}{6} \\approx 14$ million tickets: why jackpots are rare.',
      },
      {
        title: 'Genetics',
        body: 'Counting combinations of genes explains how many offspring types two parents can produce.',
      },
    ],
    takeaways: [
      'Order matters: permutations, ${}^nP_k = n!/(n-k)!$.',
      'Order ignored: combinations, $\\binom nk = n!/(k!(n-k)!)$.',
      'Combinations = permutations ÷ $k!$.',
    ],
  },

  induction: {
    hook: 'Line up infinitely many dominoes. If the first one falls, and every falling domino knocks over the next, then all of them fall. That is **proof by induction**: prove a statement for $n = 1$, prove that it carrying over from $n$ to $n + 1$, and it holds for every whole number.',
    explore: {
      type: 'iterationPlot',
      props: { mode: 'sums', n: 4 },
      caption: 'Two staircases $1 + 2 + \\cdots + n$ always make an $n \\times (n+1)$ rectangle.',
      tryThis: [
        {
          id: 't-ten',
          text: 'Check the formula at $n = 10$: is $1 + 2 + \\cdots + 10 = 55$?',
          when: (s) => s.mode === 'sums' && s.n === 10,
        },
        {
          id: 't-step',
          text: 'Go from $n$ to $n + 1$: which new column is added to the staircase?',
          when: (s) => s.mode === 'sums' && s.n >= 6,
        },
      ],
    },
    explain:
      'To prove $1 + 2 + \\cdots + n = \\frac{n(n+1)}{2}$ for all $n$:\n\n**Base case**: for $n = 1$, both sides equal 1.\n\n**Inductive step**: assume it holds for $n$. Adding the next term, $\\frac{n(n+1)}{2} + (n+1) = \\frac{(n+1)(n+2)}{2}$, which is the formula for $n + 1$. So every domino knocks over the next.',
    formula: {
      tex: 'P(1) \\;\\text{and}\\; \\big(P(n) \\Rightarrow P(n+1)\\big) \\;\\Longrightarrow\\; P(n) \\text{ for all } n \\ge 1',
      caption: 'The two steps of induction.',
    },
    misconception:
      'Checking many cases is not a proof. A pattern can hold for millions of numbers and then fail; induction proves every case at once.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-sum',
        prompt: 'Use the formula: $1 + 2 + \\cdots + 100 = \\;?$',
        answer: 5050,
        explain: '$\\frac{100 \\times 101}{2} = 5050$.',
      },
      {
        kind: 'mcq',
        id: 'c-parts',
        prompt: 'Which two things must an induction proof show?',
        options: [
          { text: 'A base case and that each case implies the next', correct: true },
          {
            text: 'Many examples and a pattern',
            why: 'Examples alone never prove a statement for all $n$.',
          },
          { text: 'The last case and the first case', why: 'There is no last case.' },
        ],
        explain: 'First domino falls; each one knocks over the next.',
      },
      {
        kind: 'numeric',
        id: 'c-odd',
        prompt:
          'The sum of the first $n$ odd numbers is $n^2$. What is $1 + 3 + 5 + \\cdots + 19$?',
        answer: 100,
        hint: 'How many odd numbers is that?',
        explain: 'That is the first 10 odd numbers: $10^2 = 100$.',
      },
    ],
    realWorld: [
      {
        title: 'Computer science',
        body: 'Programmers prove loops and recursive functions correct by induction on the number of steps.',
      },
      {
        title: 'Finance formulas',
        body: 'Loan and savings formulas are proved by induction on the number of payments.',
      },
    ],
    takeaways: [
      'Prove the base case, then that each case implies the next.',
      'Like dominoes: the whole infinite chain falls.',
      'Examples suggest; induction proves.',
    ],
  },

  'modular-arithmetic': {
    hook: 'It is 9 o’clock. What time will it be in 5 hours? Not 14, but 2. Clock arithmetic **wraps around**: on a 12-hour clock, $9 + 5 = 2$. Mathematicians write $14 \\equiv 2 \\pmod{12}$ and use it everywhere from calendars to cryptography.',
    explore: {
      type: 'numberTheory',
      props: { mode: 'clock', m: 12, a: 9, b: 5, op: 'add' },
      caption: 'The result is the remainder after dividing by the clock size.',
      tryThis: [
        {
          id: 't-week',
          text: 'Use a 7-hour clock (the days of the week). What is $5 + 4$?',
          when: (s) => s.mode === 'clock' && s.m === 7 && s.a === 5 && s.b === 4 && s.op === 'add',
        },
        {
          id: 't-zero',
          text: 'Find a sum that lands exactly on 0.',
          when: (s) => s.mode === 'clock' && s.result === 0 && s.a + s.b > 0,
        },
        {
          id: 't-times',
          text: 'Multiply on a clock of size 10. What does the answer tell you about the last digit?',
          when: (s) => s.mode === 'clock' && s.op === 'multiply' && s.m === 10,
        },
      ],
    },
    explain:
      '$a \\bmod m$ is the remainder when $a$ is divided by $m$. Two numbers are **congruent** mod $m$ if they leave the same remainder. You can add and multiply first and reduce later, or reduce first: the answer is the same.',
    formula: {
      tex: 'a \\equiv b \\pmod m \\iff m \\mid (a - b)',
      caption: 'Congruent means the difference is a multiple of $m$.',
    },
    misconception: 'Mod is not division: $17 \\bmod 5$ is the remainder 2, not $3.4$.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-rem',
        prompt: '$23 \\bmod 5 = \\;?$',
        answer: 3,
        explain: '$23 = 4 \\times 5 + 3$.',
      },
      {
        kind: 'numeric',
        id: 'c-day',
        prompt: 'Today is Wednesday (day 3, with Sunday as 0). What day number is it in 100 days?',
        answer: 5,
        explain: '$100 \\bmod 7 = 2$, and $3 + 2 = 5$: Friday.',
      },
      {
        kind: 'numeric',
        id: 'c-last',
        prompt: 'What is the last digit of $7 \\times 8 \\times 9$?',
        answer: 4,
        hint: 'Work mod 10 as you go.',
        explain: '$7 \\times 8 = 56 \\to 6$, then $6 \\times 9 = 54 \\to 4$.',
      },
    ],
    realWorld: [
      {
        title: 'Check digits',
        body: 'ISBNs and bank card numbers end in a digit chosen so a sum works out mod 10 or 11, catching typos.',
      },
      {
        title: 'Cryptography',
        body: 'RSA and other ciphers do all their arithmetic modulo huge numbers.',
      },
    ],
    takeaways: [
      'Mod $m$ arithmetic wraps around after $m$.',
      '$a \\bmod m$ is the remainder.',
      'Add or multiply, then reduce: the answer is the same.',
    ],
  },

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

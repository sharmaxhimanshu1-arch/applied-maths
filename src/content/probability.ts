import type { ContentModule } from './types'

const near = (a: number | undefined, b: number, tol = 1e-6) =>
  a !== undefined && Math.abs(a - b) < tol

/** Average roll from a table of counts by sum. */
const average = (counts: number[], rolls: number) =>
  rolls ? counts.reduce((s, c, sum) => s + c * sum, 0) / rolls : 0

const content: ContentModule = {
  'random-variables': {
    hook: 'Roll two dice and add them. The answer is a number, but you do not know which until you roll. A **random variable** is exactly that: a number decided by chance. You cannot predict one roll, but you can predict the **average** of many, and that average is the expected value.',
    explore: {
      type: 'probability',
      props: { experiment: 'dice', options: { dice: 2, adjustable: true } },
      caption:
        'Each roll adds one to the bar for its total. Roll many times and watch the average.',
      tryThis: [
        {
          id: 't-hundred',
          text: 'Roll at least 100 times. Which total comes up most?',
          when: (s) => 'kind' in s && s.kind === 'dice' && s.rolls >= 100,
        },
        {
          id: 't-seven',
          text: 'Roll two dice at least 500 times and get the average total within 0.1 of 7.',
          when: (s) =>
            'kind' in s &&
            s.kind === 'dice' &&
            s.dice === 2 &&
            s.rolls >= 500 &&
            near(average(s.counts, s.rolls), 7, 0.1),
        },
        {
          id: 't-one',
          text: 'Switch to one die and roll 300 times. What does the average approach?',
          when: (s) => 'kind' in s && s.kind === 'dice' && s.dice === 1 && s.rolls >= 300,
        },
      ],
    },
    explain:
      'A random variable $X$ takes values $x_i$ with probabilities $p_i$. Its **expected value** is the probability-weighted average:\n\n$$E[X] = \\sum_i x_i\\,p_i.$$\n\nFor one die, $E[X] = \\tfrac{1 + 2 + \\dots + 6}{6} = 3.5$, a value you can never actually roll. Expectations add up: two dice have $E = 3.5 + 3.5 = 7$. The **variance** $E[(X - \\mu)^2]$ measures how spread out the outcomes are around that average.',
    formula: {
      tex: 'E[X] = \\sum_i x_i\\,p_i, \\qquad E[X + Y] = E[X] + E[Y]',
      caption: 'The long-run average, and it adds.',
    },
    misconception:
      'The expected value need not be a likely outcome, or even a possible one. No single die ever shows 3.5.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-game',
        prompt: 'A game pays 10 with probability 0.2 and 0 otherwise. What is its expected payout?',
        answer: 2,
        explain: '$10 \\times 0.2 + 0 \\times 0.8 = 2$.',
      },
      {
        kind: 'numeric',
        id: 'c-three',
        prompt: 'What is the expected total of three dice?',
        answer: 10.5,
        explain: '$3 \\times 3.5 = 10.5$.',
      },
      {
        kind: 'mcq',
        id: 'c-fair',
        prompt:
          'A raffle ticket costs 5; it wins 100 with probability 1/50. Is it a good deal on average?',
        options: [
          { text: 'No: expected winnings are 2, less than the 5 cost', correct: true },
          { text: 'Yes: 100 is much more than 5', why: 'You win only 1 time in 50.' },
          { text: 'It breaks even', why: '$100/50 = 2 \\ne 5$.' },
        ],
        explain: '$E = 100 \\times \\tfrac{1}{50} = 2$, so you lose 3 per ticket on average.',
      },
    ],
    realWorld: [
      {
        title: 'Insurance',
        body: 'Premiums are set just above the expected cost of claims, so the insurer profits on average.',
      },
      {
        title: 'Casinos',
        body: 'Every casino game has a negative expected value for the player; over thousands of bets the house always wins.',
      },
    ],
    takeaways: [
      'A random variable is a number decided by chance.',
      'Expected value is the probability-weighted average: the long-run mean.',
      'Expectations add.',
    ],
  },

  'law-of-large-numbers': {
    hook: 'Flip a coin 10 times and you might get 7 heads. Flip it 10 000 times and you will get very close to half. The **law of large numbers** says that averages of many independent trials settle down to the true probability. It is why casinos, insurers and pollsters can plan with confidence.',
    explore: {
      type: 'probability',
      props: { experiment: 'coin', options: { p: 0.5, adjustableP: true } },
      caption: 'The line tracks the running share of heads as you flip.',
      tryThis: [
        {
          id: 't-wild',
          text: 'Flip just 10–20 times. How far from 0.5 is the share?',
          when: (s) => 'kind' in s && s.kind === 'coin' && s.flips >= 10 && s.flips <= 20,
        },
        {
          id: 't-settle',
          text: 'Flip at least 2,000 times. Is the share within 0.02 of the true $p$?',
          when: (s) =>
            'kind' in s &&
            s.kind === 'coin' &&
            s.flips >= 2000 &&
            Math.abs(s.proportion - s.p) < 0.02,
        },
        {
          id: 't-biased',
          text: 'Make the coin biased ($p = 0.3$) and flip 1,000 times.',
          when: (s) => 'kind' in s && s.kind === 'coin' && near(s.p, 0.3, 0.001) && s.flips >= 1000,
        },
      ],
    },
    explain:
      'If $X_1, X_2, \\dots$ are independent with mean $\\mu$, their average $\\bar X_n = \\tfrac{1}{n}\\sum X_i$ gets closer and closer to $\\mu$ as $n$ grows.\n\nThe typical error shrinks like $1/\\sqrt n$: 100 times more flips make the share about 10 times more accurate. Nothing “evens out” in the short run: the coin has no memory. The early surplus of heads is simply swamped by the many flips that follow.',
    formula: {
      tex: '\\bar X_n = \\frac{X_1 + \\dots + X_n}{n} \\;\\longrightarrow\\; \\mu \\quad (n \\to \\infty)',
      caption: 'Averages converge to the expected value.',
    },
    misconception:
      'The gambler’s fallacy: after 5 heads, tails is not “due”. Each flip is still 50–50.',
    checks: [
      {
        kind: 'mcq',
        id: 'c-fallacy',
        prompt: 'A fair coin has landed heads 6 times in a row. The chance of heads next is…',
        options: [
          { text: 'exactly 1/2', correct: true },
          { text: 'less than 1/2: tails is due', why: 'Coins have no memory.' },
          {
            text: 'more than 1/2: it is on a streak',
            why: 'Independent flips do not have streaks.',
          },
        ],
        explain: 'Independence: the past does not change the next flip.',
      },
      {
        kind: 'numeric',
        id: 'c-sqrt',
        prompt:
          'With 100 flips the share of heads is typically off by about 0.05. Roughly how many flips cut that to 0.005?',
        answer: 10000,
        explain: 'Error shrinks like $1/\\sqrt n$: 10 times smaller needs 100 times more flips.',
      },
      {
        kind: 'mcq',
        id: 'c-what',
        prompt: 'The law of large numbers says that over many flips…',
        options: [
          { text: 'the *proportion* of heads approaches 1/2', correct: true },
          {
            text: 'the *number* of heads approaches half exactly',
            why: 'The count difference can grow; the proportion settles.',
          },
          { text: 'heads and tails alternate', why: 'Flips are independent.' },
        ],
        explain:
          'The raw difference heads − tails typically grows like $\\sqrt n$; the share still converges.',
      },
    ],
    realWorld: [
      {
        title: 'Insurance',
        body: 'One house fire is unpredictable; the number among a million homes is very predictable.',
      },
      {
        title: 'Simulation',
        body: 'Monte Carlo methods estimate hard quantities by averaging thousands of random trials.',
      },
    ],
    takeaways: [
      'Averages of many independent trials approach the expected value.',
      'The error shrinks like $1/\\sqrt n$.',
      'Nothing evens out in the short run.',
    ],
  },

  'continuous-distributions': {
    hook: 'How long until the next bus? The answer could be 3.2 minutes, or 3.21, or 3.2104… With infinitely many possible values, the chance of any **exact** one is zero. Instead probability lives in **areas** under a density curve.',
    explore: {
      type: 'grapher',
      props: {
        expressions: ['k e^(-k x)'],
        params: { k: { value: 1, min: 0.5, max: 3, step: 0.5 } },
        view: { xMin: -0.3, xMax: 6, yMin: -0.2, yMax: 3.2 },
        area: { a: 0, b: 1.5 },
        height: 320,
      },
      caption:
        'The exponential density $f(x) = ke^{-kx}$ for waiting times. The shaded area is the probability of a wait between the two bounds.',
      tryThis: [
        {
          id: 't-total',
          text: 'Shade from 0 to the far right. What is the total probability?',
          when: (s) =>
            s.areaBounds !== undefined && near(s.areaBounds[0], 0, 0.05) && s.areaBounds[1] > 5.5,
        },
        {
          id: 't-median',
          text: 'With the left edge at 0, find the wait that has a 50% chance of being beaten (the median).',
          when: (s) =>
            s.areaBounds !== undefined && near(s.areaBounds[0], 0, 0.02) && near(s.area, 0.5, 0.01),
        },
        {
          id: 't-rate',
          text: 'Make buses come twice as often ($k = 2$). What happens to the curve’s height at 0?',
          when: (s) => s.params.k === 2,
        },
      ],
    },
    explain:
      'A continuous random variable has a **probability density** $f(x) \\ge 0$ with total area 1. Probabilities are areas:\n\n$$P(a \\le X \\le b) = \\int_a^b f(x)\\,dx.$$\n\nThe density’s height is not a probability (it can exceed 1); it measures probability *per unit* of $x$. The mean is $E[X] = \\int x f(x)\\,dx$. For the exponential density $ke^{-kx}$ the mean wait is $1/k$ and the median is $\\ln 2 / k$.',
    formula: {
      tex: 'P(a \\le X \\le b) = \\int_a^b f(x)\\,dx, \\qquad \\int_{-\\infty}^{\\infty} f(x)\\,dx = 1',
      caption: 'Probability is area under the density.',
    },
    misconception:
      'A density value like $f(0) = 2$ is not a probability of 2. Only areas are probabilities.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-uniform',
        prompt: '$X$ is uniform on $[0, 10]$. What is $P(2 \\le X \\le 5)$?',
        answer: 0.3,
        explain: 'Height $1/10$ times width 3.',
      },
      {
        kind: 'numeric',
        id: 'c-point',
        prompt: 'For a continuous $X$, what is $P(X = 4)$ exactly?',
        answer: 0,
        explain: 'A single point has no width, so no area.',
      },
      {
        kind: 'numeric',
        id: 'c-height',
        prompt: 'A uniform density on $[0, 0.25]$ must have what height?',
        answer: 4,
        explain: 'Total area 1 over width 0.25 needs height 4: densities can exceed 1.',
      },
    ],
    realWorld: [
      {
        title: 'Reliability',
        body: 'Lifetimes of light bulbs and hard drives are modelled with densities; the area beyond 5 years is the chance one lasts that long.',
      },
      {
        title: 'Measurement error',
        body: 'Instrument errors follow a bell-shaped density; the area within ±0.1 mm is the chance a reading is that precise.',
      },
    ],
    takeaways: [
      'Continuous probabilities are areas under a density curve.',
      'The total area is 1; any single exact value has probability 0.',
    ],
  },

  correlation: {
    hook: 'Taller people tend to weigh more; colder days sell less ice cream. **Correlation** puts a number between $-1$ and $1$ on how tightly two quantities move together in a straight-line way. It is one of the most used and most misused numbers in science.',
    explore: {
      type: 'data',
      props: {
        mode: 'scatter',
        dataset: 'study',
        show: { means: true, quadrants: true },
        toggles: true,
        editable: true,
      },
      caption:
        'Points in the shaded quadrants (both above or both below average) push $r$ up; the others push it down. Click to add points, drag to move them.',
      tryThis: [
        {
          id: 't-strong',
          text: 'Drag points to make the correlation stronger than 0.95.',
          when: (s) => s.mode === 'scatter' && s.r > 0.95,
        },
        {
          id: 't-negative',
          text: 'Make the correlation negative.',
          when: (s) => s.mode === 'scatter' && s.r < -0.3,
        },
        {
          id: 't-none',
          text: 'Make the correlation almost exactly zero (between −0.05 and 0.05).',
          when: (s) => s.mode === 'scatter' && s.n >= 5 && Math.abs(s.r) < 0.05,
        },
      ],
    },
    explain:
      'The **covariance** averages the products of deviations, $(x - \\bar x)(y - \\bar y)$: positive when points tend to sit in the “both above” or “both below” quadrants. Dividing by both standard deviations removes the units and gives the **correlation**\n\n$$r = \\frac{\\operatorname{cov}(x, y)}{s_x s_y}, \\qquad -1 \\le r \\le 1.$$\n\n$r = \\pm1$ means the points lie exactly on a line. $r$ near 0 means no *linear* trend, though there may still be a curved one. And correlation is not causation: ice-cream sales and drownings rise together because both rise in summer.',
    formula: {
      tex: 'r = \\frac{\\sum (x_i - \\bar x)(y_i - \\bar y)}{\\sqrt{\\sum (x_i - \\bar x)^2}\\sqrt{\\sum (y_i - \\bar y)^2}}',
      caption: 'Unit-free, always between −1 and 1.',
    },
    misconception:
      'Correlation is not causation. A hidden third factor (like summer heat) can make two things move together.',
    checks: [
      {
        kind: 'mcq',
        id: 'c-sign',
        prompt: 'Car age vs resale price most likely has…',
        options: [
          { text: 'a negative correlation', correct: true },
          { text: 'a positive correlation', why: 'Older cars usually sell for less.' },
          { text: 'zero correlation', why: 'Age clearly affects price.' },
        ],
        explain: 'As one goes up, the other tends to go down.',
      },
      {
        kind: 'mcq',
        id: 'c-curve',
        prompt: 'Points on the parabola $y = x^2$ for $x$ from $-3$ to 3 have $r$ close to…',
        options: [
          { text: '0', correct: true },
          { text: '1', why: 'The relationship is perfect but not a straight line.' },
          { text: '−1', why: 'The left half falls, the right half rises: they cancel.' },
        ],
        explain: 'Correlation only measures linear trends.',
      },
      {
        kind: 'numeric',
        id: 'c-units',
        prompt:
          'Heights and weights have $r = 0.7$. You convert heights from cm to inches. What is $r$ now?',
        answer: 0.7,
        explain: 'Correlation has no units; rescaling does not change it.',
      },
    ],
    realWorld: [
      {
        title: 'Finance',
        body: 'Investors combine assets with low or negative correlation so that losses in one are offset by another.',
      },
      {
        title: 'Medicine',
        body: 'Early studies spot correlations; randomised trials are then needed to test whether one thing causes the other.',
      },
    ],
    takeaways: [
      '$r$ measures the strength and direction of a linear relationship.',
      'It is unit-free and lies between −1 and 1.',
      'Correlation is not causation, and $r = 0$ does not rule out a curved link.',
    ],
  },

  'sampling-distributions': {
    hook: 'A poll of 1,000 people says 52%. Another poll of 1,000 different people would say something slightly different. If you imagine repeating the poll over and over, the results form their own distribution, the **sampling distribution**, and its spread tells you how much to trust any one poll.',
    explore: {
      type: 'probability',
      props: { experiment: 'sampling', options: { shape: 'skewed', n: 5, adjustable: true } },
      caption:
        'Each sample of size $n$ is drawn from the population on top; its mean drops into the histogram below.',
      tryThis: [
        {
          id: 't-many',
          text: 'Collect at least 300 sample means. Where is their centre compared with the population mean?',
          when: (s) => 'kind' in s && s.kind === 'sampling' && s.samples >= 300,
        },
        {
          id: 't-big-n',
          text: 'Use samples of size 30 or more and collect 300 means. How has the spread changed?',
          when: (s) => 'kind' in s && s.kind === 'sampling' && s.n >= 30 && s.samples >= 300,
        },
        {
          id: 't-shape',
          text: 'Switch to a two-humped population. Do the sample means still pile up in one hump?',
          when: (s) =>
            'kind' in s && s.kind === 'sampling' && s.shape === 'bimodal' && s.samples >= 100,
        },
      ],
    },
    explain:
      'A statistic such as the sample mean $\\bar X$ varies from sample to sample. Its distribution has the same centre as the population, $E[\\bar X] = \\mu$, but a smaller spread, the **standard error**:\n\n$$\\operatorname{SE}(\\bar X) = \\frac{\\sigma}{\\sqrt n}.$$\n\nQuadrupling the sample size halves the standard error. And thanks to the central limit theorem, for reasonably large $n$ the sampling distribution is close to normal, whatever the population looks like.',
    formula: {
      tex: 'E[\\bar X] = \\mu, \\qquad \\operatorname{SE}(\\bar X) = \\frac{\\sigma}{\\sqrt n}',
      caption: 'Centred on the truth, narrowing with sample size.',
    },
    misconception:
      'The standard error is not the spread of the data. It is the spread of the *average*, which is much smaller.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-se',
        prompt:
          'A population has $\\sigma = 12$. What is the standard error of the mean for $n = 36$?',
        answer: 2,
        explain: '$12 / \\sqrt{36} = 2$.',
      },
      {
        kind: 'numeric',
        id: 'c-halve',
        prompt: 'To halve the standard error of a sample of 100, how many do you need?',
        answer: 400,
        explain: 'SE ∝ $1/\\sqrt n$, so 4 times as many.',
      },
      {
        kind: 'mcq',
        id: 'c-centre',
        prompt: 'The sampling distribution of $\\bar X$ is centred at…',
        options: [
          { text: 'the population mean $\\mu$', correct: true },
          { text: 'the first sample’s mean', why: 'That is just one draw from the distribution.' },
          { text: '0', why: 'It is centred where the population is.' },
        ],
        explain: 'The sample mean is unbiased: on average it hits $\\mu$.',
      },
    ],
    realWorld: [
      {
        title: 'Opinion polls',
        body: 'The “±3%” on a poll of 1,000 people comes straight from the standard error of a proportion.',
      },
      {
        title: 'Quality control',
        body: 'Factories test small batches; the sampling distribution says how unusual a batch average must be to signal a problem.',
      },
    ],
    takeaways: [
      'Statistics vary from sample to sample; their distribution is the sampling distribution.',
      'The standard error $\\sigma/\\sqrt n$ shrinks as samples grow.',
    ],
  },

  'confidence-intervals': {
    hook: 'A single estimate is almost surely a little wrong. A **confidence interval** is honest about it: “the average is between 47 and 53, and the method we used catches the truth 95% of the time.” The confidence is in the method, and you can watch it work.',
    explore: {
      type: 'simulation',
      props: { mode: 'ci', n: 25, level: '95' },
      caption:
        'Each sample gives one interval. The true mean (the upright line) is fixed; the intervals move. Count how many catch it.',
      tryThis: [
        {
          id: 't-many',
          text: 'Draw at least 100 intervals. What share caught the true mean?',
          when: (s) => s.mode === 'ci' && s.drawn >= 100,
        },
        {
          id: 't-99',
          text: 'Switch to 99% confidence. Are the intervals wider or narrower?',
          when: (s) => s.mode === 'ci' && s.level === 99,
        },
        {
          id: 't-big-n',
          text: 'Make the intervals narrower without lowering the confidence level.',
          when: (s) => s.mode === 'ci' && s.n > 25 && s.level >= 95,
        },
      ],
    },
    explain:
      'With known $\\sigma$, a 95% interval for the mean is $\\bar x \\pm 1.96\\,\\tfrac{\\sigma}{\\sqrt n}$: the sample mean plus or minus about two standard errors. If you repeated the study many times, 95% of the intervals built this way would contain $\\mu$.\n\nWider intervals buy more confidence; bigger samples buy narrower intervals. When $\\sigma$ is unknown (the usual case) you replace it by the sample standard deviation and 1.96 by a slightly larger number from the $t$ distribution.',
    formula: {
      tex: '\\bar x \\pm z^*\\,\\frac{\\sigma}{\\sqrt n} \\qquad (z^* = 1.96 \\text{ for } 95\\%)',
      caption: 'Estimate ± margin of error.',
    },
    misconception:
      'A 95% interval does not mean “95% chance the true mean is in *this* interval”. The mean is fixed; 95% describes how often the method succeeds.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-margin',
        prompt:
          'With $\\sigma = 10$ and $n = 100$, what is the 95% margin of error ($1.96\\,\\sigma/\\sqrt n$)?',
        answer: 1.96,
        explain: '$1.96 \\times 10 / 10 = 1.96$.',
      },
      {
        kind: 'mcq',
        id: 'c-width',
        prompt: 'To halve the width of a confidence interval, you should…',
        options: [
          { text: 'quadruple the sample size', correct: true },
          { text: 'double the sample size', why: 'Width shrinks like $1/\\sqrt n$.' },
          {
            text: 'lower the confidence to 47.5%',
            why: 'That changes what the interval promises.',
          },
        ],
        explain: '$\\sqrt 4 = 2$.',
      },
      {
        kind: 'numeric',
        id: 'c-miss',
        prompt: 'Out of 200 independent 95% intervals, about how many miss the true value?',
        answer: 10,
        explain: '5% of 200 is 10.',
      },
    ],
    realWorld: [
      {
        title: 'Clinical trials',
        body: 'A drug’s effect is reported with a confidence interval; if the whole interval is above zero, the benefit is convincing.',
      },
      {
        title: 'Election polls',
        body: '“48% ± 3%” is a 95% confidence interval for the share of voters.',
      },
    ],
    takeaways: [
      'Estimate ± margin of error, where the margin is a few standard errors.',
      'Confidence describes the method’s long-run success rate.',
      'More data, narrower intervals.',
    ],
  },

  'hypothesis-testing': {
    hook: 'A friend’s coin lands heads 31 times in 50 flips. Is it rigged, or is that just luck? A **hypothesis test** answers by asking: if the coin were fair, how often would chance alone produce something this extreme? If the answer is “hardly ever”, the coin is suspicious.',
    explore: {
      type: 'simulation',
      props: { mode: 'test', n: 50, k: 31 },
      caption:
        'Simulate thousands of fair coins. The orange bars are results at least as far from 25 as yours: their share is the p-value.',
      tryThis: [
        {
          id: 't-sim',
          text: 'Simulate at least 1,000 fair-coin experiments. How often was 31 or more extreme reached?',
          when: (s) => s.mode === 'test' && s.simulations >= 1000,
        },
        {
          id: 't-reject',
          text: 'Find the smallest number of heads (above 25) that is significant at the 5% level.',
          when: (s) => s.mode === 'test' && s.k === 33,
        },
        {
          id: 't-ordinary',
          text: 'Set a result that is not surprising at all for a fair coin (p-value above 0.5).',
          when: (s) => s.mode === 'test' && s.exactP > 0.5,
        },
      ],
    },
    explain:
      'Start with a **null hypothesis** $H_0$ (the coin is fair) and a test statistic (the number of heads). The **p-value** is the probability, assuming $H_0$, of a result at least as extreme as the one observed.\n\nA small p-value (conventionally below 0.05) means the data would be surprising if $H_0$ were true, so we **reject** $H_0$. A large p-value does not prove $H_0$; it just means the data are consistent with it. Testing at the 5% level means that, when $H_0$ is true, you will wrongly reject it 5% of the time.',
    formula: {
      tex: 'p = P(\\text{result at least as extreme} \\mid H_0)',
      caption: 'How surprising the data are if nothing is going on.',
    },
    misconception:
      'The p-value is not the probability that the null hypothesis is true. It is the probability of the data (or more extreme) *given* the null.',
    checks: [
      {
        kind: 'mcq',
        id: 'c-meaning',
        prompt: 'A test gives $p = 0.003$. This means…',
        options: [
          { text: 'results this extreme would be very rare if $H_0$ were true', correct: true },
          {
            text: 'there is a 0.3% chance $H_0$ is true',
            why: 'The p-value assumes $H_0$; it does not measure it.',
          },
          {
            text: 'the effect is large',
            why: 'A tiny effect can have a tiny p-value with enough data.',
          },
        ],
        explain: 'It measures surprise under the null.',
      },
      {
        kind: 'mcq',
        id: 'c-decide',
        prompt: 'At the 5% level, $p = 0.12$ means you should…',
        options: [
          { text: 'not reject $H_0$', correct: true },
          { text: 'accept that $H_0$ is true', why: 'Not rejecting is not proof.' },
          { text: 'reject $H_0$', why: '0.12 is above 0.05.' },
        ],
        explain: 'The evidence is not strong enough; $H_0$ survives for now.',
      },
      {
        kind: 'numeric',
        id: 'c-false',
        prompt:
          'Twenty independent tests of true null hypotheses at the 5% level. How many false alarms do you expect?',
        answer: 1,
        explain: '$20 \\times 0.05 = 1$: why testing many things at once needs care.',
      },
    ],
    realWorld: [
      {
        title: 'Drug approval',
        body: 'Regulators require that a new drug beats a placebo with a small p-value in well-designed trials.',
      },
      {
        title: 'A/B testing',
        body: 'Websites test two designs on different visitors and use a hypothesis test to see whether one really performs better.',
      },
    ],
    takeaways: [
      'Assume nothing is going on ($H_0$), then ask how surprising the data are.',
      'A small p-value is evidence against $H_0$.',
      'Not rejecting is not the same as proving.',
    ],
  },

  'maximum-likelihood': {
    hook: 'You flip a coin 10 times and see 7 heads. What is the best guess for its probability of heads? Try every possible $p$ and ask: which one makes what I actually saw **most likely**? That guess, the **maximum likelihood estimate**, is how most statistical models are fitted.',
    explore: {
      type: 'grapher',
      props: {
        expressions: ['k ln(x) + (n - k) ln(1 - x)'],
        params: {
          k: { value: 7, min: 0, max: 20, step: 1 },
          n: { value: 10, min: 1, max: 20, step: 1 },
        },
        view: { xMin: 0, xMax: 1, yMin: -20, yMax: 0.5 },
        tangent: { x: 0.3 },
        markers: 'extrema',
        height: 320,
      },
      caption:
        'The log-likelihood $\\ell(p) = k\\ln p + (n - k)\\ln(1 - p)$ for $k$ heads in $n$ flips, with $p$ along the bottom. Slide the tangent point.',
      tryThis: [
        {
          id: 't-peak',
          text: 'With 7 heads in 10, find the $p$ where the tangent is flat. Is it what you would have guessed?',
          when: (s) => s.params.k === 7 && s.params.n === 10 && near(s.tangentX, 0.7, 0.01),
        },
        {
          id: 't-change',
          text: 'Change the data to 3 heads in 12 flips and find the new peak.',
          when: (s) => s.params.k === 3 && s.params.n === 12 && near(s.tangentX, 0.25, 0.01),
        },
        {
          id: 't-sharper',
          text: 'Keep the same share of heads (14 out of 20). How does the curve’s shape change?',
          when: (s) => s.params.k === 14 && s.params.n === 20,
        },
      ],
    },
    explain:
      "The **likelihood** $L(\\theta)$ is the probability of the observed data, viewed as a function of the unknown parameter $\\theta$. The maximum likelihood estimate $\\hat\\theta$ is the $\\theta$ that makes it largest.\n\nProducts of many probabilities are awkward, so we maximise the **log-likelihood** instead (same peak). For $k$ heads in $n$ flips, setting $\\ell'(p) = \\tfrac{k}{p} - \\tfrac{n - k}{1 - p} = 0$ gives $\\hat p = k/n$: the observed proportion. More data makes the peak sharper, meaning the estimate is more certain.",
    formula: {
      tex: '\\hat\\theta = \\arg\\max_\\theta L(\\theta), \\qquad \\hat p = \\frac{k}{n}',
      caption: 'Choose the parameter that best explains the data.',
    },
    misconception:
      'The likelihood is not the probability that the parameter is correct; it is the probability of the data, given the parameter.',
    checks: [
      {
        kind: 'numeric',
        id: 'c-coin',
        prompt: 'A coin shows 18 heads in 40 flips. What is the MLE of $p$?',
        answer: 0.45,
        explain: '$18 / 40 = 0.45$.',
      },
      {
        kind: 'mcq',
        id: 'c-log',
        prompt: 'Why maximise the log-likelihood instead of the likelihood?',
        options: [
          { text: 'Logs turn products into sums and have the same peak', correct: true },
          {
            text: 'It gives a different, better answer',
            why: '$\\ln$ is increasing, so the maximiser is the same.',
          },
          {
            text: 'Likelihoods can be negative',
            why: 'Likelihoods are probabilities: never negative.',
          },
        ],
        explain: 'Easier to differentiate, numerically safer, same answer.',
      },
      {
        kind: 'numeric',
        id: 'c-normal',
        prompt:
          'For normal data with known spread, the MLE of the mean is the sample mean. What is it for 4, 7, 10?',
        answer: 7,
        explain: '$(4 + 7 + 10)/3 = 7$.',
      },
    ],
    realWorld: [
      {
        title: 'Machine learning',
        body: 'Training a classifier with “cross-entropy loss” is maximising the likelihood of the correct labels.',
      },
      {
        title: 'Genetics',
        body: 'Family trees of DNA are reconstructed by finding the tree that makes the observed sequences most likely.',
      },
    ],
    takeaways: [
      'Likelihood: how probable the observed data are for each parameter value.',
      'The MLE is the parameter value at the peak.',
      'For a coin, $\\hat p = k/n$.',
    ],
  },
}

export default content

# Applied Maths Lab

**Learn math by touching it.** An interactive lab for every concept, from the number line to
neural networks, on a map that shows which ideas come before which.

Most math resources are static text and formulas. Here every concept has something to drag,
tweak and break: a vector you pull until the grid warps, a Galton board you drop balls through, a
network you train until it solves a checkerboard. Prompts tick themselves off as you discover
things, quick checks confirm you got it, and the map remembers where you are.

## What's inside

- **Knowledge map** of 110 concepts in 13 domains (numbers and discrete math through calculus,
  linear algebra, probability and machine learning). Left to right is prerequisite order. Set any
  concept as a goal and get a step-by-step path to it. A list view is used on phones.
- **88 deep labs**, hand-built guided lessons for all of numbers and discrete maths (number
  line through graphs and networks), all of algebra and functions (expressions through complex
  numbers and rational functions), linear algebra, probability and statistics, all of geometry
  and trigonometry, all of single-variable calculus (limits through Taylor series), and all of
  applied maths and machine learning (gradient descent, PCA, logistic regression, neural
  networks, Markov chains, entropy, Fourier series and RSA). Each one runs explore → predict →
  formalise → challenges.
- **22 lite labs**, one for every other concept. Each has a ready-made interactive with
  self-ticking “Try this” prompts, the key formula, a common misconception, quick checks and
  real-world uses. They are built from reusable widgets: number line, function machine, geometry
  board, complex plane, contour plot, slope field, simulations, number theory, Venn diagrams,
  truth tables and more.
- **Six tools** for free play: Grapher (sliders for any parameter, tangents, areas, Riemann sums,
  Taylor polynomials, polar curves), Matrix Lab, Probability Lab, Unit Circle & Waves, Data Lab and
  a Calculator.
- **Tracks and progress**:
  - two tracks, the _Full Journey_ and _Math for ML & Data Science_;
  - a two-question onboarding that marks what you already know;
  - streaks and per-domain progress;
  - **spaced review**: every mastered concept comes back for a one-question check after 1 day,
    then 3, 7, 14, 30, 60 and 120 days as you keep getting it right (a miss restarts it). The
    nav shows how many are due, and the Review page has a seven-day forecast;
  - export/import of your progress as a file.

  Everything is stored in your browser; there are no accounts and no tracking.

It works offline once loaded (fonts and KaTeX are bundled), supports light and dark themes,
respects reduced-motion settings, and every interactive can be used with a keyboard.

## Run it

Requires Node 22.12+.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command               | What it does                                                                        |
| --------------------- | ----------------------------------------------------------------------------------- |
| `npm run build`       | Type-check and build the static site into `dist/`                                   |
| `npm run preview`     | Serve the built site                                                                |
| `npm run check`       | Type-check, lint (oxlint), format check (Prettier), unit tests (Vitest), build      |
| `npm run e2e`         | Build, then run the Playwright suite (every concept page, tools, learner journey)   |
| `npm run screenshots` | Capture key pages at desktop and phone widths, light and dark, into `test-results/` |

## Deploy

The build is a static site with hash routing and relative asset paths, so `dist/` can be served
from any host or sub-path.

- **GitHub Pages**: enable Pages with _Settings → Pages → Source: GitHub Actions_. The
  `Deploy to GitHub Pages` workflow then publishes every push to `main`, and it can also be run
  by hand from the Actions tab.
- **Anywhere else**: run `npm run build`, then upload `dist/`.

## Project layout

```
src/
  app/          shell, router, home/map/review/progress/tools pages, command palette
  curriculum/   the 110 concepts, prerequisite edges, domains, tracks, graph algorithms
  map/          knowledge-map layout (pure) and the React Flow canvas, list view, panels
  labs/<id>/    one folder per deep lab (auto-discovered)
  content/      lite-lab content per area (hooks, prompts, checks, real-world notes)
  widgets/      reusable interactives used by lite labs, plus their registry
  tools/        Grapher, Matrix Lab, Probability Lab, Unit Circle, Data Lab, Calculator
  learn/        concept page, lab building blocks, challenge engine
  viz/          plotting kit: Plot, MovablePoint, function graphs, vectors, canvas layers
  math/         numerics, linear algebra, statistics, seeded RNG, expression parsing
  progress/     persisted progress store, selectors, export/import, review scheduling
  review/       spaced-review question pool (quick checks, plus a set for each deep lab)
  ui/           buttons, sliders, dialogs, KaTeX wrapper
e2e/            Playwright tests
docs/           CONTENT_GUIDE.md: how to add concepts, widgets and labs
```

Built with React 19, TypeScript, Vite, Tailwind CSS 4, KaTeX, math.js, React Flow and Zustand.

## Contributing

See [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) for how to add or improve a concept, a
widget or a deep lab, and the quality checklist each one should pass.

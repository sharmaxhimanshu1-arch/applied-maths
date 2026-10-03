# Applied Maths Lab: notes for contributors and coding agents

An interactive math-learning web app: a knowledge map of 110 concepts, each with a hands-on lab.
Static site, Vite + React 19 + TypeScript (strict) + Tailwind 4. No backend; progress lives in
`localStorage` (zustand `persist`).

## Commands

- `npm run dev` runs the dev server.
- `npm run check` runs tsc, oxlint (`--deny-warnings`), Prettier check, Vitest and the build. Run
  it before every commit; CI runs the same steps plus Playwright.
- `npm run e2e` builds, then runs Playwright (chromium) against `vite preview`.
- `npx prettier --write src e2e` formats. Prettier settings: no semicolons, single quotes,
  width 100.

## Where things are

- Concepts and edges: `src/curriculum/concepts/*.ts`. Graph algorithms: `src/curriculum/graph.ts`.
- Lite-lab content: `src/content/<area>.ts`.
- Deep labs: `src/labs/<id>/index.tsx` (auto-discovered). Each also needs 3 review questions
  in `src/review/deep.ts`.
- Spaced review: scheduling in `src/progress/review.ts` (Leitner boxes on local `YYYY-MM-DD`
  days), the `reviews` slice of the progress store, and the `/review` page.
- Widgets: `src/widgets/` (register in `types.ts` and `registry.ts`).
- Tools: `src/tools/`. The Grapher's expression handling is in `src/math/expr.ts` (math.js, lazy).
- Plotting kit: `src/viz/`. Lab blocks and challenges: `src/learn/`.
- `docs/CONTENT_GUIDE.md` explains how to add concepts, widgets and labs.

## Conventions

- **Hash routing** (`createHashRouter`), so in-page `#anchor` links don't work. Scroll with
  element ids and JS instead.
- **Lint rules** that bite (oxlint, React rules):
  - **only-export-components**: component files export only components (type exports are fine).
    Put helpers in `.ts` files.
  - **refs** and **immutability**: don't reassign variables inside render maps. Move loops into
    pure helper functions.
  - **purity**: no `Math.random()`/`Date.now()` in render or `useState` initialisers. Use a
    module-level `createRng(seed)` from `@/math/random`.
  - No `React.ReactNode` global; `import { type ReactNode } from 'react'`.
  - `no-useless-escape`: inside template literals with TeX, write `\\;` not `\;`.
  - jsx-a11y: labels need accessible text the linter can see (add `aria-label` when the text
    is in JSX expressions).
- **Widget state**: report it with `useReport(state, onStateChange)`. It dedupes by JSON value to
  avoid update loops. Try-this predicates read this state.
- **Try-this prompts must start un-ticked**. `e2e/concepts.spec.ts` checks every concept page.
- **Colours** come from tokens only (`var(--c-blue)`, `var(--ink-2)`, `text-good-ink`, …). Dark
  mode is automatic. KaTeX can't use CSS variables, so don't put `\color{var(...)}` in TeX.
- **Phones**:
  - grids that contain charts or wide content need `grid-cols-[minmax(0,1fr)]`;
  - fieldsets (e.g. `Segmented`) need `min-w-0`;
  - check with a 390 px viewport.
- `cn()` in `src/ui/cn.ts` only joins strings; it does **not** resolve conflicting Tailwind
  classes. Don't pass two classes for the same property.
- **Plot**: `aspect="equal"` widens the shorter side to fill the container. Wrap it in
  `mx-auto max-w-xl` when you want a square-ish figure. `narrowView` gives an alternative window
  under 560 px. `AngleArc` radius is in pixels.
- **Grapher expressions** go through `preprocess`:
  - letters are split into variables (`ax` → `a x`);
  - a lone variable before `(` multiplies (`x (10 - 2x)`), except `f` and `g`;
  - `ln` is the natural log and `log` is base 10.
- **Concept ids are permanent** (they are stored in learners' progress).
- **Progress schema changes** bump `STORAGE_VERSION` and go through `migrateProgress` in
  `src/progress/store.ts`; `parseProgress` in `transfer.ts` must accept the new field too.

## Testing

- Unit tests (`*.test.ts`, Vitest) cover:
  - curriculum integrity (acyclic, non-redundant edges, levels);
  - graph algorithms and map layout;
  - maths helpers and the progress store;
  - content structure.
- E2E tests (`e2e/*.spec.ts`) cover:
  - every concept page (no console errors, no pre-ticked prompts) and every deep lab;
  - the tools and the map;
  - the onboarding → progress journey and export/import.

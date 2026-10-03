# Content guide

How to add or improve concepts, lite labs, widgets and deep labs, and the checklist every lab
should pass. Everything is plain TypeScript, so the compiler and the tests catch most mistakes.

## How a concept page is built

Every concept lives in `src/curriculum/concepts/<area>.ts`. Its page at `#/learn/<id>` shows one
of three things:

1. a **deep lab** if `src/labs/<id>/index.tsx` exists (it is discovered automatically);
2. otherwise a **lite lab** built from `src/content/<area>.ts`;
3. otherwise a “being built” placeholder. A unit test fails if any concept ends up here.

## Add a concept

1. Add an entry to the right `src/curriculum/concepts/<area>.ts`:

   ```ts
   {
     id: 'my-concept',           // kebab-case, never renamed (it is stored in saved progress)
     title: 'My Concept',
     short: 'Short title',        // optional, for map nodes
     domain: 'calculus',
     level: 3,                    // 1–5; must be ≥ every prerequisite's level
     prerequisites: ['derivatives'],
     summary: 'One line that makes someone want to click.',
     estMinutes: 15,
     tags: ['search', 'keywords'],
   }
   ```

2. List only **direct** prerequisites. `src/curriculum/curriculum.test.ts` rejects edges implied by
   other edges, as well as cycles and unknown ids.
3. Give it a lab: either a lite-lab entry (below) or a deep lab.
4. Run `npm run check`. The map layout, search and tracks pick the concept up automatically.

## Write a lite lab

Add an entry to `src/content/<area>.ts`, keyed by concept id (the `LiteContent` type in
`src/content/types.ts`):

```ts
'my-concept': {
  hook: 'Why this matters, in one or two short paragraphs.',
  explore: {
    type: 'grapher',                       // any widget key from src/widgets/types.ts
    props: { expressions: ['a x^2'], params: { a: { value: 1, min: -3, max: 3, step: 0.5 } } },
    caption: 'What the learner is looking at and what to do.',
    tryThis: [
      { id: 't-flip', text: 'Make the parabola open downward.', when: (s) => s.params.a < 0 },
    ],
  },
  explain: 'The formal idea, after exploring.',
  formula: { tex: 'y = ax^2', caption: 'Optional caption.' },
  misconception: 'The most common wrong belief, and why it is wrong.',
  checks: [ /* 2–3 of: mcq, numeric, expression */ ],
  realWorld: [{ title: 'Where it shows up', body: 'One or two sentences.' }],
  takeaways: ['Two or three sentences to remember.'],
},
```

**Text markup.** Strings support `$inline TeX$`, `$$display TeX$$`, `**bold**`, `*italic*` and
paragraphs separated by a blank line. Avoid literal `$` and `*` in prose. Inside single-quoted
TypeScript strings, backslashes double: `'$\\frac{1}{2}$'`. Use typographic apostrophes (’) in
prose so you don't need to escape quotes.

**Try-this predicates.** `when(state)` receives the widget's reported state, typed per widget.
Multi-mode widgets report a `mode` field, so check it first (`s.mode === 'angle' && …`). A
prompt must **not** already be true in the starting state: `e2e/concepts.spec.ts` opens every
concept page and fails if any prompt is ticked before the learner acts. Pick the widget's
starting values so that every prompt needs an action.

**Checks.**

- `mcq`: exactly one option has `correct: true`. Give every wrong option a `why`.
- `numeric`: `answer` is a number. Add `tolerance` for rounded answers and `unit` if useful.
- `expression`: `answer` is parsed by `src/math/miniExpr.ts` and compared by evaluating at random
  points (so `2x + 2` matches `2(x+1)`). Set `vars` for anything other than `x`.

`src/content/content.test.ts` checks the structure:

- every concept has a lab;
- MCQs have exactly one correct option;
- expression answers parse;
- ids are unique;
- the widget exists.

## Add a widget

1. Create `src/widgets/<Name>Widget.tsx` with a default export taking
   `WidgetComponentProps<'key'>`, i.e. `{ preset, onStateChange }`.
2. Export its `…Preset` and `…State` types. For several modes, use a discriminated union on
   `mode`.
3. Report state with `useReport(state, onStateChange)` (`src/widgets/useReport.ts`). It only fires
   when the state changes by value, which avoids render loops.
4. Register it:
   - add `key: { props: …Preset; state: …State }` to `WidgetDefs` in `src/widgets/types.ts`;
   - add a lazy import in `src/widgets/registry.ts`.

Build on what exists:

- `Plot` and its primitives (`FunctionGraph`, `Vector`, `Segment`, `Polygon`, `Label`, …) from
  `@/viz`;
- `MovablePoint` with `constraints` for anything draggable (it is keyboard-operable for free);
- `CanvasLayer` with `cssColor` for heatmaps and fields;
- `Readouts`, `Slider`, `Segmented`, `Switch` and `Button` for controls;
- `@/math/*` for the maths.

Large widgets can keep their modes in a folder (see `src/widgets/geometry/`).

## Add a deep lab

Create `src/labs/<concept-id>/index.tsx` with a default-exported component. It is discovered
automatically and replaces the lite lab (delete the lite entry). Use the building blocks in
`@/learn/blocks`:

- `LabSection`, `Prose`, `Figure`;
- `TryThisList`/`TryThis` (with `when={…}`), `PredictReveal`;
- `Formula`, `Callout`, `Readouts`, `RealWorld`, `Takeaways`.

Put the challenges in a `ChallengeSet` built from `@/learn/challenges`: `McqChallenge`,
`NumericChallenge`, `ExpressionChallenge` and `InteractiveChallenge` (`solved={…}`). Solving
every challenge marks the concept mastered.

Follow the arc of the existing labs:

1. the big idea;
2. an interactive explore section with try-this prompts;
3. a predict-then-reveal question;
4. formalise;
5. challenges;
6. real world;
7. takeaways.

`e2e/labs.spec.ts` renders every lab folder automatically.

## Quality checklist

- [ ] The interactive is the star: something to drag or change within the first screen.
- [ ] Every try-this prompt is reachable, needs an action, and teaches something.
- [ ] Explanations are short and concrete. Use an example first, the general rule second.
- [ ] The misconception is one learners really have.
- [ ] Checks test understanding, not recall of the page's numbers. Wrong options explain why.
- [ ] Works with the keyboard alone, and readouts don't rely on colour alone.
- [ ] No horizontal scrolling at 390 px wide. Grids that hold charts use
      `grid-cols-[minmax(0,1fr)]`; fieldsets need `min-w-0`.
- [ ] Looks right in light and dark themes (use the colour tokens, never hard-coded colours).
- [ ] `npm run check` and `npm run e2e` pass.

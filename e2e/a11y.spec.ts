import { readFileSync, readdirSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// Every concept page, every tool, and the main pages.
const dir = new URL('../src/curriculum/concepts/', import.meta.url)
const CONCEPT_IDS = readdirSync(dir).flatMap((file) =>
  [...readFileSync(new URL(file, dir), 'utf8').matchAll(/^ {4}id: '([a-z0-9-]+)'/gm)].map(
    (m) => m[1],
  ),
)
const TOOLS = ['grapher', 'matrix-lab', 'probability-lab', 'unit-circle', 'data-lab', 'calculator']
const PAGES = [
  '/',
  '/map?view=list',
  '/tools',
  '/progress',
  '/about',
  ...TOOLS.map((t) => `/tools/${t}`),
  ...CONCEPT_IDS.map((id) => `/learn/${id}`),
]

for (const path of PAGES) {
  test(`${path} has no serious accessibility problems`, async ({ page }) => {
    await page.goto(`./#${path}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.waitForTimeout(400)
    // The axe package bundles its own Playwright types; the page object is the same at runtime.
    const { violations } = await new AxeBuilder({ page } as never).analyze()
    const serious = violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id}: ${v.help} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ')}`)
    expect(serious).toEqual([])
  })
}

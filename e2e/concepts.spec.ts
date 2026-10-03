import { readFileSync, readdirSync } from 'node:fs'
import { expect, test } from '@playwright/test'

// Every concept id, read from the curriculum source (4-space indent = a concept's own id).
const dir = new URL('../src/curriculum/concepts/', import.meta.url)
const CONCEPT_IDS = readdirSync(dir).flatMap((file) =>
  [...readFileSync(new URL(file, dir), 'utf8').matchAll(/^ {4}id: '([a-z0-9-]+)'/gm)].map(
    (m) => m[1],
  ),
)

test('the curriculum has 110 concepts', () => {
  expect(new Set(CONCEPT_IDS).size).toBe(110)
})

for (const id of CONCEPT_IDS) {
  test(`concept page ${id} renders, with no prompt done before the learner acts`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto(`./#/learn/${id}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // Lite labs load their content and widget lazily; wait for whichever lab shows up.
    await expect(
      page
        .getByRole('heading', {
          name: /Play with it|Check your understanding|This lab is being built/,
        })
        .first(),
    ).toBeVisible()
    await page.waitForTimeout(300)
    await expect(page.locator('li[data-done="true"]')).toHaveCount(0)
    expect(errors).toEqual([])
  })
}

import { readdirSync } from 'node:fs'
import { expect, test } from '@playwright/test'

// Every folder in src/labs (except _shared) is a deep lab for the concept with that id.
const DEEP_LABS = readdirSync(new URL('../src/labs', import.meta.url), { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map((d) => d.name)

for (const id of DEEP_LABS) {
  test(`deep lab ${id} renders without errors`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto(`./#/learn/${id}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText(/^0 of \d+ solved$/)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Check your understanding' })).toBeVisible()
    expect(errors).toEqual([])
  })
}

test('solving a challenge counts towards mastery and persists', async ({ page }) => {
  await page.goto('./#/learn/determinant')
  const answers = page.getByRole('textbox', { name: 'Your answer' })
  await answers.nth(1).fill('5')
  await answers.nth(1).press('Enter')
  await expect(page.getByText('Not quite. Check your working and try again.')).toBeVisible()
  await answers.first().fill('4')
  await answers.first().press('Enter')
  await expect(page.getByText('1 of 5 solved')).toBeVisible()
  await page.reload()
  await expect(page.getByText('1 of 5 solved')).toBeVisible()
})

test('a Try this prompt ticks itself when the visual reaches the goal', async ({ page }) => {
  await page.goto('./#/learn/inverse-matrix')
  const prompt = page.getByRole('listitem').filter({ hasText: 'Undo a transformation' })
  await expect(prompt).not.toHaveAttribute('data-done', 'true')
  await page.getByRole('button', { name: 'Undo with A⁻¹' }).click()
  await expect(page.getByText('Back home: A⁻¹A = I')).toBeVisible()
  await expect(prompt).toHaveAttribute('data-done', 'true')
})

test('a lite lab widget ticks its prompts and checks its quick checks', async ({ page }) => {
  await page.goto('./#/learn/number-bases')
  const prompt = page.getByRole('listitem').filter({ hasText: 'Make 13 in binary' })
  await expect(prompt).not.toHaveAttribute('data-done', 'true')
  // 5 = 4 + 1 at the start; 13 = 8 + 4 + 1
  await page.getByRole('button', { name: 'The 8s bit' }).click()
  await expect(prompt).toHaveAttribute('data-done', 'true')
})

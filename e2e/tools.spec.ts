import { expect, test } from '@playwright/test'

test('every tool page loads', async ({ page }) => {
  for (const id of [
    'grapher',
    'matrix-lab',
    'probability-lab',
    'unit-circle',
    'data-lab',
    'calculator',
  ]) {
    await page.goto(`./#/tools/${id}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('hit a snag')).toHaveCount(0)
  }
})

test('grapher makes a slider for a new parameter', async ({ page }) => {
  await page.goto('./#/tools/grapher')
  const expr = page.getByRole('textbox', { name: 'Expression 1' })
  await expr.fill('k*x^2 + m')
  await expect(page.getByRole('slider', { name: 'Parameter k' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Parameter m' })).toBeVisible()
})

test('matrix lab reports determinants', async ({ page }) => {
  await page.goto('./#/tools/matrix-lab')
  await page.getByRole('button', { name: 'Rotate 90°' }).click()
  await expect(page.getByText('det', { exact: true }).locator('..')).toContainText('1')
  await page.getByRole('button', { name: 'Squash' }).click()
  await expect(page.getByText('none (det = 0)')).toBeVisible()
})

test('a thousand coin flips land near one half', async ({ page }) => {
  await page.goto('./#/tools/probability-lab')
  await page.getByRole('button', { name: 'Flip 1,000' }).click()
  const proportion = Number(
    await page.getByText('Proportion', { exact: true }).locator('..').locator('dd').textContent(),
  )
  expect(proportion).toBeGreaterThan(0.4)
  expect(proportion).toBeLessThan(0.6)
})

test('calculator evaluates and remembers variables', async ({ page }) => {
  await page.goto('./#/tools/calculator')
  const input = page.getByRole('textbox', { name: 'Calculation' })
  await expect(page.getByRole('button', { name: 'Evaluate' })).toBeEnabled()
  await input.fill('a = 2^10')
  await input.press('Enter')
  await input.fill('a / 4')
  await input.press('Enter')
  await expect(page.getByText('= 256')).toBeVisible()
})

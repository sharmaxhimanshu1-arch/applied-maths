import { expect, test } from '@playwright/test'

test('a new learner onboards, gets recommendations, and can reset', async ({ page }) => {
  await page.goto('./#/')
  await page.getByRole('button', { name: 'Find my starting point' }).click()
  await page.getByRole('radio', { name: 'Math for ML & Data Science' }).check()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('checkbox', { name: 'Arithmetic, fractions & percentages' }).check()
  await expect(page.getByText(/\d+ concepts will be marked as known/)).toBeVisible()
  await page.getByRole('button', { name: 'Show me where to start' }).click()

  // Back on the home page: the basics count as done and there is somewhere to go next.
  await expect(page.getByRole('heading', { name: 'Next up for you' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Continue learning' })).toBeVisible()
  await expect(page.getByText('Your track')).toBeVisible()

  await page.getByRole('link', { name: 'Progress', exact: true }).first().click()
  await expect(page.getByRole('heading', { name: 'Your progress' })).toBeVisible()
  await expect(page.getByText('already known')).toBeVisible()
  await expect(page.getByText(/^[1-9]\d* \/ 110$/)).toBeVisible()

  // Progress survives a reload, and "Reset everything" clears it after confirmation.
  await page.reload()
  await expect(page.getByText(/^[1-9]\d* \/ 110$/)).toBeVisible()
  await page.getByRole('button', { name: 'Reset everything' }).click()
  await page.getByRole('button', { name: 'Erase everything' }).click()
  await expect(page.getByText('0 / 110')).toBeVisible()
})

test('progress can be exported and imported back', async ({ page }) => {
  await page.goto('./#/progress')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export progress' }).click()
  const file = await (await download).path()
  await page.locator('input[type="file"]').setInputFiles(file)
  await expect(page.getByRole('status')).toHaveText(/Imported progress for 0 concepts/)
})

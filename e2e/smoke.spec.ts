import { expect, test, type Page } from '@playwright/test'

function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(err.message))
  return errors
}

const PAGES = ['/', '/map', '/map?view=list', '/tools', '/progress', '/about', '/does-not-exist']

for (const path of PAGES) {
  test(`${path} renders without errors`, async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto(`./#${path}`)
    await expect(page).toHaveTitle(/Applied Maths Lab/)
    await expect(page.getByRole('heading').first()).toBeVisible()
    expect(errors).toEqual([])
  })
}

test('command palette finds a concept and opens it', async ({ page }) => {
  await page.goto('./#/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.keyboard.press('Control+k')
  await expect(page.getByRole('combobox', { name: 'Search concepts and tools' })).toBeFocused()
  await page.keyboard.type('eigen')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#\/learn\/eigenvectors/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Eigenvectors')
})

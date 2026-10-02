import { expect, test } from '@playwright/test'

test.describe('knowledge map', () => {
  test('renders every concept and opens details on click', async ({ page }) => {
    await page.goto('./#/map?view=map')
    await expect(page.locator('.react-flow__node-concept')).toHaveCount(110)

    await page.locator('.react-flow__node[data-id="fractions"]').click()
    const panel = page.getByRole('complementary', { name: 'Concept details' })
    await expect(panel.getByRole('heading', { name: 'Fractions' })).toBeVisible()
    await expect(panel.getByRole('heading', { name: 'Before this' })).toBeVisible()
    await expect(panel.getByRole('button', { name: /Operations as Movement/ })).toBeVisible()
    await expect(page).toHaveURL(/focus=fractions/)
  })

  test('setting a goal shows the learning path in study order', async ({ page }) => {
    await page.goto('./#/map?view=map&focus=bayes-theorem')
    const panel = page.getByRole('complementary', { name: 'Concept details' })
    await panel.getByRole('button', { name: 'Set as goal' }).click()

    const steps = page.locator('ol li')
    await expect(steps.first()).toContainText('Number Line')
    await expect(steps.last()).toContainText("Bayes' Theorem")
    const titles = await steps.allTextContents()
    const at = (name: string) => titles.findIndex((t) => t.includes(name))
    expect(at('Fractions')).toBeLessThan(at('What Is Probability?'))
    expect(at('What Is Probability?')).toBeLessThan(at('Conditional Probability'))
  })

  test('marking a concept known updates its state', async ({ page }) => {
    await page.goto('./#/map?view=map&focus=number-line')
    const panel = page.getByRole('complementary', { name: 'Concept details' })
    await expect(panel.getByText('Ready to learn')).toBeVisible()
    await panel.getByRole('button', { name: 'I already know this' }).click()
    await expect(panel.getByText('Already known')).toBeVisible()

    // Its dependent is now ready, and the choice survives a reload.
    await page.reload()
    await page.locator('.react-flow__node[data-id="arithmetic-operations"]').click()
    await expect(page).toHaveURL(/focus=arithmetic-operations/)
    await expect(
      page.getByRole('complementary', { name: 'Concept details' }).getByText('Ready to learn'),
    ).toBeVisible()
  })

  test('list view lists every concept', async ({ page }) => {
    await page.goto('./#/map?view=list')
    await expect(page.locator('main a[href^="#/learn/"]')).toHaveCount(110)
    await page.getByRole('radio', { name: 'ML track' }).check({ force: true })
    await expect(page.getByRole('radio', { name: 'ML track' })).toBeChecked()
  })
})

import { test } from '@playwright/test'

// Visual-review captures, not assertions: `npm run screenshots` writes PNGs to
// test-results/screenshots/ at desktop and phone sizes, in light and dark themes.
const PAGES: [string, string][] = [
  ['home', '/'],
  ['map', '/map?view=map'],
  ['map-list', '/map?view=list'],
  ['progress', '/progress'],
  ['tools', '/tools'],
  ['grapher', '/tools/grapher'],
  ['lab-determinant', '/learn/determinant'],
  ['lab-bayes', '/learn/bayes-theorem'],
  ['lab-gradient-descent', '/learn/gradient-descent'],
  ['lite-pythagorean', '/learn/pythagorean-theorem'],
  ['lite-gradient', '/learn/gradient'],
  ['lite-neural-networks', '/learn/neural-networks'],
]
const SIZES = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 },
]

for (const theme of ['light', 'dark'] as const) {
  for (const size of SIZES) {
    for (const [name, path] of PAGES) {
      test(`${name} ${size.name} ${theme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
        await page.setViewportSize({ width: size.width, height: size.height })
        await page.goto(`./#${path}`)
        await page.getByRole('heading', { level: 1 }).first().waitFor()
        await page.waitForTimeout(600)
        await page.screenshot({
          path: `test-results/screenshots/${name}-${size.name}-${theme}.png`,
          fullPage: true,
        })
      })
    }
  }
}

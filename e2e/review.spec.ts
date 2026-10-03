import { expect, test, type Page } from '@playwright/test'

function day(offset: number) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${String(d.getDate()).padStart(2, '0')}`
}

const mastered = { status: 'mastered', firstSeen: 1, lastSeen: 1, tryThis: [], checks: {} }

/** Seed stored progress once, before the app boots (later reloads keep what the test did). */
async function seed(page: Page, state: Record<string, unknown>) {
  await page.addInitScript((s) => {
    if (sessionStorage.getItem('seeded')) return
    localStorage.setItem('aml-progress', JSON.stringify({ state: s, version: 2 }))
    sessionStorage.setItem('seeded', '1')
  }, state)
}

const stored = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('aml-progress')!).state.reviews)

test('a due review is answered and rescheduled', async ({ page }) => {
  await seed(page, {
    concepts: { limits: mastered, fractions: mastered },
    onboarded: true,
    reviews: {
      // reps 2 asks the third limits question: two one-sided limits that disagree.
      limits: { box: 2, due: day(-1), reps: 2, lapses: 0, last: null },
      fractions: { box: 0, due: day(0), reps: 0, lapses: 0, last: null },
    },
  })
  await page.goto('./#/')
  await expect(page.getByRole('heading', { name: 'Review today' })).toBeVisible()
  await expect(page.getByRole('link', { name: /^Review\W+2 due$/ }).first()).toBeVisible()
  await page.getByRole('link', { name: 'Start review' }).click()

  // The most overdue concept comes first; answering right moves it up a box.
  await expect(page.getByRole('heading', { level: 2, name: 'Limits' })).toBeVisible()
  await page.getByRole('radio', { name: 'Does not exist' }).check()
  await expect(page.getByText('Remembered.')).toBeVisible()
  expect((await stored(page)).limits).toMatchObject({ box: 3, reps: 3, due: day(14) })
  await page.getByRole('button', { name: 'Next' }).click()

  // Not remembering sends it back to tomorrow and points at the lab.
  await expect(page.getByRole('heading', { level: 2, name: 'Fractions' })).toBeVisible()
  await page.getByRole('button', { name: /I don’t remember/ }).click()
  await expect(page.getByRole('link', { name: 'Revisit Fractions' })).toBeVisible()
  expect((await stored(page)).fractions).toMatchObject({ box: 0, lapses: 1, due: day(1) })
  await page.getByRole('button', { name: 'Finish' }).click()

  await expect(page.getByRole('heading', { name: 'Session done' })).toBeVisible()
  await expect(page.getByText('You remembered 1 of 2 first time.')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'All caught up' })).toBeVisible()
})

test('older saves join review: concepts mastered before it existed are due now', async ({
  page,
}) => {
  await seed(page, { onboarded: true })
  await page.goto('./#/review')
  await expect(page.getByRole('heading', { name: 'Nothing to review yet' })).toBeVisible()
  // A version 1 save has no review schedule; migration adds its mastered concepts.
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('aml-progress')!)
    raw.state.concepts = {
      vectors: { status: 'mastered', firstSeen: 1, lastSeen: 1, tryThis: [], checks: {} },
    }
    delete raw.state.reviews
    raw.version = 1
    localStorage.setItem('aml-progress', JSON.stringify(raw))
  })
  await page.reload()
  await expect(page.getByRole('heading', { level: 2, name: 'Vectors' })).toBeVisible()
})

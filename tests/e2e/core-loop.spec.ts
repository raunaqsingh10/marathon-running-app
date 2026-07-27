import { test, expect } from '@playwright/test'

test('runner can log an extra run and see it in history', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Continue as Raunaq' }).click()
  await expect(page.getByText('Rest day')).toBeVisible()
  await page.getByRole('link', { name: 'Log an extra run' }).click()
  await page.getByLabel(/Distance/).fill('6.2')
  await page.getByLabel(/Time/).fill('33:42')
  await page.getByRole('button', { name: 'Moderate' }).click()
  await page.getByRole('button', { name: 'Save run' }).click()
  await page.getByRole('link', { name: 'History' }).click()
  const historyEntry = page.getByRole('article')
  await expect(historyEntry).toContainText('6.2 KM')
  await expect(historyEntry).toContainText('5:26 /KM')
})

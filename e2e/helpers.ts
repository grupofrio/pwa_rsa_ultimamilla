import { expect, type Page } from '@playwright/test'

export async function login(page: Page, email: string) {
  await page.goto('/login')
  await page.evaluate(() => sessionStorage.clear())
  await page.goto('/login')
  await page.getByTestId('login-email').fill(email)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/inicio$/)
  await expect(page.getByRole('main').getByRole('heading').first()).toBeVisible()
}

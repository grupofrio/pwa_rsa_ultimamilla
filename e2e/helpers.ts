import { expect, type Page } from '@playwright/test'

export async function login(page: Page, email: string) {
  await page.goto('/login')
  await page.getByTestId('login-email').fill(email)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('heading', { name: /Hola/ })).toBeVisible()
}

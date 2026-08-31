import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { login } from './helpers'
import { writeFileSync, mkdirSync } from 'node:fs'

const dir = '/opt/cursor/artifacts'

test('auditoría axe de login, despacho y gerencia', async ({ page }, testInfo) => {
  mkdirSync(dir, { recursive: true })
  const pages = []

  await page.goto('/login')
  pages.push({ name: 'login', ...(await scan(page)) })

  await login(page, 'ana.despacho@viaagil.example')
  await page.goto('/despacho')
  await expect(page.getByRole('heading', { name: 'Despacho CEDIS' })).toBeVisible()
  pages.push({ name: 'despacho', ...(await scan(page)) })

  await login(page, 'elena.gerencia@viaagil.example')
  await page.goto('/gerencia')
  await expect(page.getByRole('heading', { name: 'Tablero gerencial' })).toBeVisible()
  pages.push({ name: 'gerencia', ...(await scan(page)) })

  const report = {
    project: testInfo.project.name,
    generatedAt: new Date().toISOString(),
    pages,
  }
  writeFileSync(`${dir}/a11y_${testInfo.project.name}.json`, JSON.stringify(report, null, 2))

  const critical = pages.flatMap((item) =>
    item.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious'),
  )
  expect(
    critical,
    `Violaciones serias/críticas: ${critical.map((v) => v.id).join(', ') || 'ninguna'}`,
  ).toHaveLength(0)
})

async function scan(page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  return {
    violations: results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.map((n) => ({ html: n.html, target: n.target, failureSummary: n.failureSummary })),
    })),
    passes: results.passes.length,
  }
}

import { expect, test } from '@playwright/test'

test('loads the support console with a default parsed incident', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Wingcraft Support Console' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Category' })).toBeVisible()
  await expect(page.getByText('Affected component:')).toBeVisible()
})

test('selects a sample incident and shows escalation state', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /phase3-005/i }).click()

  await expect(page.getByTestId('escalation-status')).toContainText('Elevate to on-call')
  await expect(page.getByTestId('escalation-status')).toContainText('Priority: P0')
})

test('parses pasted unknown logs as safe escalation fallback', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('log-input').fill('unrecognized crash with no known parser tokens')
  await page.getByTestId('parse-logs').click()

  await expect(page.getByText('operations')).toBeVisible()
  await expect(page.getByTestId('escalation-status')).toContainText('Elevate to on-call')
})

test('uploads a log file and parses the contents', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('log-file-input').setInputFiles({
    name: 'latest.log',
    mimeType: 'text/plain',
    buffer: Buffer.from('Failed to bind to 0.0.0.0:25565: Address already in use')
  })

  await expect(page.getByTestId('diagnosis-category')).toHaveText('infrastructure')
  await expect(page.getByTestId('escalation-status')).toContainText('Elevate to on-call')
})

test('copies the generated customer reply', async ({ context, page }) => {
  await context.grantPermissions(['clipboard-write'], {
    origin: 'http://127.0.0.1:4173'
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Copy reply' }).click()

  await expect(page.getByTestId('copy-status')).toHaveText('Reply copied')
})

import { expect, test } from '@playwright/test';

test('critical interactions do not throw browser exceptions on phone or desktop', async ({ page }) => {
  const exceptions: string[] = [];
  page.on('pageerror', error => exceptions.push(error.message));
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Open Heyrin chat' }).click();
    await expect(page.getByRole('dialog', { name: 'Heyrin chat' })).toBeVisible();
    await page.getByRole('button', { name: 'Close Heyrin chat' }).click();
    await page.getByRole('tab', { name: /Customer questions/ }).click();
    await expect(page.locator('.rin-outcome h3')).toContainText('Question answered');
    await page.getByRole('tab', { name: 'Understand' }).click();
    await page.getByRole('button', { name: /Can it book appointments/i }).click();
    await page.getByRole('button', { name: /Build My AI Agent/ }).click();
    await expect(page.locator('#contact input:invalid').first()).toBeVisible();
  }
  expect(exceptions).toEqual([]);
});

import { expect, test } from '@playwright/test';

test('assistant launch and close work without inventing a live backend', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const launcher = page.getByRole('button', { name: 'Open Heyrin chat' });
  await expect(launcher).toBeVisible();
  await launcher.click();
  const panel = page.getByRole('dialog', { name: 'Heyrin chat' });
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Live AI chat is not connected');
  await expect(panel.getByRole('textbox', { name: 'Your message' })).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveJSProperty('scrollWidth', 999999);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(launcher).toBeFocused();
});

test('full-screen mobile chat keeps keyboard focus in the panel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Heyrin chat' }).click();
  const panel = page.getByRole('dialog', { name: 'Heyrin chat' });
  const last = panel.getByRole('link', { name: /Contact the team/ });
  await last.focus();
  await page.keyboard.press('Tab');
  await expect(panel.getByRole('button', { name: 'Close Heyrin chat' })).toBeFocused();
});

test('mobile chat launcher stays beside the navigation instead of covering hero CTAs', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const launcher = await page.getByRole('button', { name: 'Open Heyrin chat' }).boundingBox();
  expect(launcher).not.toBeNull();
  expect(launcher!.y + launcher!.height, 'chat launcher should live in the 64px header').toBeLessThanOrEqual(68);
});

test('offline guide answers common questions without falsely contacting an AI service', async ({ page }) => {
  let aiCalls = 0;
  await page.route('**/functions/v1/heyrin-chat', route => { aiCalls++; return route.abort(); });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Heyrin chat' }).click();
  const panel = page.getByRole('dialog', { name: 'Heyrin chat' });
  await expect(panel.getByRole('button', { name: 'Can Heyrin book appointments?' })).toBeVisible();
  await panel.getByRole('button', { name: 'Can Heyrin book appointments?' }).click();
  await expect(panel.getByRole('region', { name: 'Appointment setup answer' })).toContainText('connected calendar');
  await panel.getByRole('button', { name: 'What can Heyrin do?' }).click();
  await expect(panel.getByRole('region', { name: 'Capabilities answer' })).toContainText('routine customer calls');
  await expect(panel.getByRole('textbox', { name: 'Your message' })).toHaveCount(0);
  expect(aiCalls).toBe(0);
});

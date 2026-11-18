import { expect, test } from '@playwright/test';

test('desktop hero robot responds smoothly to pointer movement', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const scene = page.locator('.hero-scene');
  await expect(scene).toBeVisible();
  const original = await scene.evaluate(el => getComputedStyle(el).transform);
  await page.mouse.move(1380, 620);
  await expect.poll(() => scene.evaluate(el => getComputedStyle(el).transform), { timeout: 3_000 }).not.toBe(original);
  await expect(page.getByRole('link', { name: 'Hear Heyrin in Action' })).toBeVisible();
});

test('reduced-motion keeps the hero robot still even after pointer movement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const scene = page.locator('.hero-scene');
  const original = await scene.evaluate(el => getComputedStyle(el).transform);
  await page.mouse.move(1380, 620);
  await page.waitForTimeout(450);
  expect(await scene.evaluate(el => getComputedStyle(el).transform)).toBe(original);
});

test('desktop section navigation updates deep-link hash', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'How It Works' }).click();
  await expect(page).toHaveURL(/#how-it-works$/);
});

test('mobile menu exposes state and closes on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Toggle menu' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
});

test('robot reflects actual recorded-audio playback and clears its state on stop', async ({ page }) => {
  await page.goto('/');
  const scene = page.locator('.hero-scene');
  await expect(scene).toHaveAttribute('data-voice-state', 'idle');
  await page.getByRole('button', { name: 'Listen to spoken demo' }).click();
  await expect(page.getByRole('button', { name: 'Stop spoken demo' })).toBeVisible();
  await expect(scene).toHaveAttribute('data-voice-state', 'speaking');
  await page.getByRole('button', { name: 'Stop spoken demo' }).click();
  await expect(scene).toHaveAttribute('data-voice-state', 'idle');
});

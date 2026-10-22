import { expect, test } from '@playwright/test';

test('hero displays a masked robot while Spline loads slowly', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('**/scene.splinecode', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await route.continue();
  });
  await page.goto('/');
  await expect(page.locator('.hero-static-preview-image')).toBeVisible();
  await expect(page.locator('.hero-scene')).not.toHaveClass(/is-ready/);
  await page.screenshot({ path: 'review/hero-loading.png', animations: 'disabled' });
  await expect(page.locator('.hero-scene')).toHaveClass(/is-ready/, { timeout: 40_000 });
  await expect(page.locator('.hero-static-preview')).toHaveCSS('opacity', '0', { timeout: 4000 });
  await expect(page.locator('#home h1')).toContainText('Meet the voice');
});

test('hero settles to live character without overflow or browser errors', async ({ page }) => {
  test.setTimeout(50_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.hero-scene')).toHaveClass(/is-ready/, { timeout: 35_000 });
  await page.waitForTimeout(2300);
  await page.screenshot({ path: 'review/hero-repaired.png', animations: 'disabled' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});


test('mobile skips 3D downloads and restores its preview after a desktop resize', async ({ page }) => {
  test.setTimeout(65_000);
  const sceneRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('scene.splinecode')) sceneRequests.push(request.url());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForTimeout(1600);
  expect(sceneRequests).toHaveLength(0);
  await expect(page.locator('.hero-static-preview-image')).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('.hero-scene')).toHaveClass(/is-ready/, { timeout: 35_000 });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.hero-scene')).not.toHaveClass(/is-ready/);
  await expect(page.locator('.hero-static-preview-image')).toBeVisible();
});

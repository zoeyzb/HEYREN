import { expect, test } from '@playwright/test';

test('default uses the fast video and loads the original 3D rig only on request', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const scene = page.locator('.hero-scene');
  await expect(scene.locator('canvas')).toHaveCount(0);
  await expect(scene.locator('video.hero-robot-motion')).toHaveCount(1);
  await page.getByRole('button', { name: 'Enable interactive 3D robot' }).click();
  await expect(page.getByRole('button', { name: 'Return to animated robot' })).toBeVisible();
  await expect(scene.locator('canvas')).toHaveCount(1, { timeout: 15_000 });
  await expect(scene.locator('.hero-rig-layer')).toHaveClass(/is-ready/, { timeout: 15_000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/heyrin-rig-verified-desktop.png', animations: 'disabled' });
  await page.getByRole('button', { name: 'Return to animated robot' }).click();
  await expect(scene.locator('canvas')).toHaveCount(0);
  await expect(scene.locator('video.hero-robot-motion')).toHaveCount(1);
});

test('3D mode is available on mobile and fails safely without losing the video', async ({ page }) => {
  await page.route('**/scene.splinecode', route => route.fulfill({ status: 503, body: 'scene offline' }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Enable interactive 3D robot' })).toBeVisible();
  await page.getByRole('button', { name: 'Enable interactive 3D robot' }).click();
  await expect(page.getByRole('status')).toContainText('3D robot unavailable', { timeout: 15_000 });
  await expect(page.locator('.hero-scene canvas')).toHaveCount(0);
  await expect(page.locator('.hero-scene video.hero-robot-motion')).toHaveCount(1);
});

test('reduced motion never boots the GPU rig', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Enable interactive 3D robot' })).toBeDisabled();
  await expect(page.locator('.hero-scene canvas')).toHaveCount(0);
});

test('background tabs do not expire the 3D startup budget while rendering is throttled', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }));
  await page.clock.install();
  await page.route('**/assets/InteractiveRobot*.js', async () => { await new Promise(() => {}); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Enable interactive 3D robot' }).click();
  await page.clock.fastForward(13_000);
  await expect(page.getByRole('button', { name: 'Return to animated robot' })).toBeVisible();
  await expect(page.locator('.hero-rig-error')).toHaveCount(0);
});


test('original 3D character becomes ready on a phone-sized viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Enable interactive 3D robot' }).click();
  await expect(page.locator('.hero-rig-layer')).toHaveClass(/is-ready/, { timeout: 15_000 });
  const canvas = page.locator('.hero-rig-layer canvas');
  await expect(canvas).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: '/tmp/heyrin-rig-verified-mobile.png', animations: 'disabled' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(canvas).toBeVisible();
  const landscapeOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(landscapeOverflow).toBeLessThanOrEqual(1);
});


test('WebGL context loss restores the animated robot instead of leaving an empty canvas', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Enable interactive 3D robot' }).click();
  await expect(page.locator('.hero-rig-layer')).toHaveClass(/is-ready/, { timeout: 15_000 });
  await page.locator('.hero-rig-layer canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { bubbles: true, cancelable: true })));
  await expect(page.getByRole('button', { name: 'Enable interactive 3D robot' })).toBeVisible();
  await expect(page.locator('.hero-rig-layer canvas')).toHaveCount(0);
  await expect(page.locator('.hero-scene video.hero-robot-motion')).toHaveCount(1);
});

test('tablet and desktop robot-mode control stays clickable alongside navigation and chat', async ({ page }) => {
  for (const width of [768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => scrollTo(0, 0));
    const button = page.getByRole('button', { name: 'Enable interactive 3D robot' });
    const rect = await button.boundingBox();
    expect(rect).not.toBeNull();
    const atCenter = await page.evaluate(({ x, y }) => Boolean(document.elementFromPoint(x, y)?.closest('.hero-rig-toggle')), {
      x: rect!.x + rect!.width / 2, y: rect!.y + rect!.height / 2,
    });
    expect(atCenter, `another control blocks the robot toggle at ${width}px`).toBe(true);
  }
});

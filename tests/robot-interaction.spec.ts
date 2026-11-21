import { devices, expect, test } from '@playwright/test';

test('desktop pointer turns only the helmet and it returns to center', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const scene = page.locator('.hero-scene');
  const head = scene.locator('.hero-robot-head');
  const body = scene.locator('.hero-robot-body');
  await expect(scene).toHaveClass(/is-gaze-ready/);
  const before = await body.boundingBox();
  await page.mouse.move(1400, 480);
  await expect.poll(() => head.evaluate(el => getComputedStyle(el).backgroundPosition)).not.toBe('50% 50%');
  expect(await body.boundingBox()).toEqual(before);
  await page.locator('html').dispatchEvent('pointerleave');
  await expect.poll(() => head.evaluate(el => getComputedStyle(el).backgroundPosition)).toBe('50% 50%');
});

test('a tap and phone tilt rotate the helmet while the body stays anchored', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ ...devices['iPhone 14'], baseURL });
  try {
    const page = await context.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(window.DeviceOrientationEvent, 'requestPermission', {
        configurable: true,
        value: async () => 'granted',
      });
    });
    const requests: string[] = [];
    page.on('request', request => requests.push(new URL(request.url()).pathname));
    await page.goto('/');
    const scene = page.locator('.hero-scene');
    const head = scene.locator('.hero-robot-head');
    const body = scene.locator('.hero-robot-body');
    await expect(scene).toHaveClass(/is-gaze-ready/);
    const before = await body.boundingBox();
    await expect(head).toHaveCSS('background-position', '50% 50%');
    await page.getByRole('button', { name: "Say hello to Heyrin's robot" }).tap();
    await expect.poll(() => head.evaluate(el => getComputedStyle(el).backgroundPosition)).not.toBe('50% 50%');
    await expect(head).toHaveCSS('background-position', '50% 50%');

    await page.evaluate(() => {
      for (const [beta, gamma] of [[35, 3], [36, 3.4]]) {
        window.dispatchEvent(Object.assign(new Event('deviceorientation'), { beta, gamma }));
      }
    });
    await expect(head).toHaveCSS('background-position', '50% 50%');
    await page.evaluate(() => window.dispatchEvent(Object.assign(new Event('deviceorientation'), { beta: 52, gamma: 18 })));
    await expect.poll(() => head.evaluate(el => {
      const [x, y] = getComputedStyle(el).backgroundPosition.split(' ').map(parseFloat);
      return Math.abs(x - 50) > 15 && Math.abs(y - 50) > 15;
    })).toBe(true);
    expect(await body.boundingBox()).toEqual(before);
    await expect.poll(() => scene.locator('video').evaluate(video => video.currentTime)).toBeGreaterThan(.25);
    expect(requests).toContain('/heyrin-arms-mobile.mp4');
    expect(requests).toContain('/heyrin-gaze-mobile.webp');
    expect(requests.filter(path => /spline|three|heyrin-(gaze|lit)-desktop|heyrin-arms\.mp4/i.test(path))).toEqual([]);

    await page.getByRole('link', { name: 'Hear Heyrin in Action' }).click();
    await expect(head).toHaveCSS('background-position', '50% 50%');
  } finally {
    await context.close();
  }
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

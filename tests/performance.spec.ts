import { devices, expect, test } from '@playwright/test';

test('mobile can read and navigate the prerendered page with JavaScript disabled', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ ...devices['iPhone 14'], baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Never miss another call.' })).toBeVisible();
    await expect(page.locator('.hero-static-preview img')).toBeVisible();
    await page.getByRole('link', { name: 'Hear Heyrin in Action' }).click();
    await expect(page).toHaveURL(/#experience$/);
    await expect(page.locator('#experience')).toBeInViewport();
  } finally {
    await context.close();
  }
});

test('reduced motion keeps the original robot poster and skips the video download', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const clips: string[] = [];
  page.on('request', request => {
    if (request.url().endsWith('.mp4')) clips.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('.hero-static-preview img')).toBeVisible();
  await expect(page.locator('.hero-robot-motion')).toHaveJSProperty('paused', true);
  await expect(page.locator('.hero-robot-motion')).not.toHaveAttribute('src');
  expect(clips).toEqual([]);
});

test('failed robot video leaves the original poster and page controls available', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/*.mp4', route => route.fulfill({ status: 503, body: '' }));
  const blocked = page.waitForResponse(response => response.url().endsWith('.mp4') && response.status() === 503);
  await page.goto('/');
  await blocked;
  await expect(page.locator('.hero-static-preview img')).toBeVisible();
  await page.getByRole('link', { name: 'Hear Heyrin in Action' }).click();
  await expect(page.locator('#experience')).toBeInViewport();
});

import { devices, expect, test } from '@playwright/test';

test('mobile can read and navigate the prerendered page with JavaScript disabled', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ ...devices['iPhone 14'], baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Never miss another call.' })).toBeVisible();
    await expect(page.locator('.hero-robot-body')).toBeVisible();
    await expect(page.getByRole('button', { name: /say hello to heyrin/i })).toHaveCount(0);
    await page.getByRole('link', { name: 'Hear Heyrin in Action' }).click();
    await expect(page).toHaveURL(/#experience$/);
    await expect(page.locator('#experience')).toBeInViewport();
  } finally {
    await context.close();
  }
});

test('reduced motion keeps the robot visible without downloading the pose sheet', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const poses: string[] = [];
  page.on('request', request => {
    if (request.url().includes('heyrin-gaze-')) poses.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('.hero-robot-body')).toBeVisible();
  await expect(page.locator('.hero-robot-head')).toBeHidden();
  await expect(page.getByRole('button', { name: /say hello to heyrin/i })).toHaveCount(0);
  expect(poses).toEqual([]);
});

test('a failed pose sheet leaves the neutral robot and page controls available', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/heyrin-gaze-*.webp', route => route.fulfill({ status: 503, body: '' }));
  const blocked = page.waitForResponse(response => response.url().includes('heyrin-gaze-') && response.status() === 503);
  await page.goto('/');
  await blocked;
  await expect(page.locator('.hero-robot-body')).toBeVisible();
  await expect(page.locator('.hero-robot-head')).toBeHidden();
  await page.getByRole('link', { name: 'Hear Heyrin in Action' }).click();
  await expect(page.locator('#experience')).toBeInViewport();
});

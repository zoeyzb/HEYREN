import { expect, test } from '@playwright/test';

test('all major website sections remain inside common phone, tablet and desktop viewports', async ({ page }) => {
  for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
    const height = width < 768 ? 812 : 900;
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('#contact')).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal document overflow at ${width}px`).toBeLessThanOrEqual(1);
    await page.getByRole('button', { name: /say hello to heyrin/i }).click({ trial: true });
    const controls = await page.locator('.heyrin-chat-launcher').boundingBox();
    expect(controls, `chat launcher should be visible at ${width}px`).not.toBeNull();
    expect(controls!.x, `chat launcher clipped at ${width}px`).toBeGreaterThanOrEqual(0);
    expect(controls!.x + controls!.width, `chat launcher clipped at ${width}px`).toBeLessThanOrEqual(width + 1);
    await page.getByRole('button', { name: 'Open Heyrin chat' }).click();
    await expect(page.getByRole('dialog', { name: 'Heyrin chat' })).toBeVisible();
    const panelOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(panelOverflow, `chat panel overflow at ${width}px`).toBeLessThanOrEqual(1);
    await page.getByRole('button', { name: 'Close Heyrin chat' }).click();
  }
});

test('robot clip makes progress in a visible desktop tab and mobile tab', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const video = page.locator('video.hero-robot-motion');
    await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).currentTime), { timeout: 8_000 }).toBeGreaterThan(0.25);
    await expect(page.locator('.hero-scene')).toHaveClass(/is-playing/);
  }
});

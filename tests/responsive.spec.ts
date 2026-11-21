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
    const greet = page.getByRole('button', { name: /say hello to heyrin/i });
    await expect(greet).toBeVisible();
    const canTapRobot = await greet.evaluate(button => {
      const rect = button.getBoundingClientRect();
      return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === button;
    });
    expect(canTapRobot, `robot tap target is obstructed at ${width}px`).toBe(true);
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

test('the robot loads the responsive poster and head poses', async ({ page }) => {
  for (const [width, variant] of [[390, 'mobile'], [1440, 'desktop']] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect.poll(() => page.locator('.hero-robot-body').evaluate(image =>
      (image as HTMLImageElement).currentSrc)).toContain(`heyrin-lit-${variant}.webp`);
    await expect.poll(() => page.locator('.hero-robot-head').evaluate(head =>
      getComputedStyle(head).backgroundImage)).toContain(`heyrin-gaze-${variant}.webp`);
  }
});

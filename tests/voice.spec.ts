import { expect, test } from '@playwright/test';

test('conversation showcase: scenarios switch and the scripted audio control works without a live agent', async ({ page }) => {
  await page.addInitScript(() => {
    class FakeUtterance {
      text: string;
      voice: SpeechSynthesisVoice | null = null;
      lang = 'en-US';
      rate = 1;
      pitch = 1;
      volume = 1;
      onstart: null | (() => void) = null;
      onend: null | (() => void) = null;
      onerror: null | (() => void) = null;
      constructor(text: string) { this.text = text; }
    }
    const synth = {
      cancel() {},
      getVoices: () => [{ name: 'Samantha', lang: 'en-US' }, { name: 'Daniel', lang: 'en-GB' }],
      speak(utterance: FakeUtterance) {
        setTimeout(() => { utterance.onstart?.(); }, 20);
      },
    };
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: FakeUtterance });
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth });
  });
  await page.goto('/');
  await expect(page.locator('#experience')).toBeVisible();
  await expect(page.locator('.rin-live-agent')).toHaveCount(0);
  await expect(page.locator('.rin-call-console')).toContainText('CONVERSATION PREVIEW');
  await page.locator('.rin-scenario').filter({hasText:'Lead qualification'}).click();
  await expect(page.locator('.rin-outcome h3')).toContainText('Lead details');
  await expect(page.locator('.rin-transcript')).toContainText('Hey, this is Ren. How can I help?');
  const audioRequest = page.waitForResponse(response => response.url().includes('/audio/qualify.mp3'));
  await page.getByRole('button', { name: 'Listen to spoken demo' }).click();
  expect((await audioRequest).ok()).toBeTruthy();
  await expect(page.getByRole('button', { name: 'Stop spoken demo' })).toBeVisible();
  await page.getByRole('button', { name: 'Stop spoken demo' }).click();
  await expect(page.getByRole('button', { name: 'Listen to spoken demo' })).toBeVisible();
});

test('all three one-time recordings are shipped as local audio files', async ({ request }) => {
  for (const scenario of ['appointment', 'qualify', 'inquiry']) {
    const response = await request.get(`/audio/${scenario}.mp3`);
    expect(response.ok(), `${scenario} recording should be available`).toBeTruthy();
    expect(response.headers()['content-type']).toContain('audio/mpeg');
    expect(Number(response.headers()['content-length'])).toBeGreaterThan(200_000);
  }
});

test('conversation showcase: mobile layout stays within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Listen to spoken demo' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

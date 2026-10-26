import { expect, test } from '@playwright/test';

test('voice preview: typed conversation and booking safeguards', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#voice-preview')).toBeVisible();
  await expect(page.locator('#voice-preview')).toContainText('no real calls, bookings');
  await page.getByRole('button', { name: 'Voice on' }).click();
  await page.getByRole('textbox', { name: 'Or type a customer question' }).fill('I need to book an appointment');
  await page.getByRole('button', { name: 'Send voice preview message' }).click();
  await expect(page.getByRole('log', { name: 'Live preview conversation' })).toContainText('Which service');
  await page.getByRole('textbox', { name: 'Or type a customer question' }).fill('Plumbing repair');
  await page.getByRole('button', { name: 'Send voice preview message' }).click();
  await expect(page.getByRole('log', { name: 'Live preview conversation' })).toContainText('What day or time');
  await page.getByRole('textbox', { name: 'Or type a customer question' }).fill('Wednesday at two');
  await page.getByRole('button', { name: 'Send voice preview message' }).click();
  await expect(page.getByRole('log', { name: 'Live preview conversation' })).toContainText('no appointment has been booked');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByRole('log', { name: 'Live preview conversation' }).locator('.rin-live-message')).toHaveCount(1);
});

test('voice preview: microphone recognition and an audible-reply control', async ({ page }) => {
  await page.addInitScript(() => {
    const FakeSpeechRecognition = class {
      lang = '';
      continuous = false;
      interimResults = false;
      onstart: null | (() => void) = null;
      onend: null | (() => void) = null;
      onresult: null | ((event: unknown) => void) = null;
      onerror: null | ((event: unknown) => void) = null;
      start() {
        this.onstart?.();
        setTimeout(() => {
          this.onresult?.({ results: [{ isFinal: true, 0: { transcript: 'I want to book an appointment' } }] });
        }, 100);
      }
      stop() { this.onend?.(); }
      abort() { this.onend?.(); }
    };
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: FakeSpeechRecognition });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Voice on' }).click();
  await page.getByRole('button', { name: 'Start talking' }).click();
  await expect(page.getByRole('log', { name: 'Live preview conversation' })).toContainText('I want to book an appointment');
  await expect(page.getByRole('log', { name: 'Live preview conversation' })).toContainText('Which service');
  await expect(page.getByRole('button', { name: 'Hear last reply' })).toBeEnabled();
});

test('voice preview: denied microphone permission has a usable text fallback', async ({ page }) => {
  await page.addInitScript(() => {
    class DeniedSpeechRecognition {
      onstart: null | (() => void) = null;
      onend: null | (() => void) = null;
      onresult: null | ((event: unknown) => void) = null;
      onerror: null | ((event: {error: string}) => void) = null;
      start() { this.onerror?.({ error: 'not-allowed' }); this.onend?.(); }
      stop() { this.onend?.(); }
      abort() { this.onend?.(); }
    }
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: DeniedSpeechRecognition });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start talking' }).click();
  await expect(page.getByRole('alert')).toContainText('Microphone permission was denied');
  await page.getByRole('textbox', { name: 'Or type a customer question' }).fill('What are your hours?');
  await page.getByRole('button', { name: 'Send voice preview message' }).click();
  await expect(page.getByRole('log', { name: 'Live preview conversation' })).toContainText('opening hours');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('voice preview: mobile layout does not overflow and controls stay reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Send voice preview message' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

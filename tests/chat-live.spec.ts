import { expect, test } from '@playwright/test';

test.skip(!process.env.HEYRIN_CHAT_TEST_MODE, 'Requires a locally built opt-in chat configuration with mocked network');

test('configured assistant sends a real request contract and preserves conversation across a resize', async ({ page }) => {
  const requests: Array<{ url: string; body: { messages: Array<{ role: string; content: string }> }; apiKey: string | null }> = [];
  await page.route('**/functions/v1/heyrin-chat', async route => {
    const request = route.request();
    requests.push({ url: request.url(), body: request.postDataJSON(), apiKey: request.headers()['apikey'] || null });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'Heyrin can be configured for appointment requests; this demo is not a live calendar.' }) });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Heyrin chat' }).click();
  const panel = page.getByRole('dialog', { name: 'Heyrin chat' });
  const input = panel.getByRole('textbox', { name: 'Your message' });
  await input.fill('Can Heyrin book real appointments?');
  await input.press('Enter');
  await expect(panel.getByRole('log')).toContainText('Heyrin can be configured for appointment requests');
  expect(requests).toHaveLength(1);
  expect(requests[0].url).toBe('https://test.supabase.co/functions/v1/heyrin-chat');
  expect(requests[0].apiKey).toBe('public-test-key');
  expect(requests[0].body.messages).toEqual([{ role: 'user', content: 'Can Heyrin book real appointments?' }]);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(panel.getByRole('log')).toContainText('Heyrin can be configured for appointment requests');
  await expect(page.locator('html')).toHaveJSProperty('clientWidth', 390);
});

test('configured assistant reports service errors without losing an unsent message', async ({ page }) => {
  await page.route('**/functions/v1/heyrin-chat', route => route.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ error: 'Too many messages. Please try again later.' }) }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Heyrin chat' }).click();
  const panel = page.getByRole('dialog', { name: 'Heyrin chat' });
  const input = panel.getByRole('textbox', { name: 'Your message' });
  await input.fill('How does Heyrin handle missed calls?');
  await panel.getByRole('button', { name: 'Send message' }).click();
  await expect(panel.getByRole('alert')).toContainText('Too many messages');
  await expect(input).toHaveValue('How does Heyrin handle missed calls?');
  await expect(panel.locator('.heyrin-chat-bubble.assistant')).toHaveCount(0);
});

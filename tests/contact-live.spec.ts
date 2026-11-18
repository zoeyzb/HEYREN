import { expect, test } from '@playwright/test';

test.skip(!process.env.HEYRIN_CONTACT_TEST_MODE, 'Requires local opt-in contact config; real service is never called');

async function fill(page: import('@playwright/test').Page) {
  await page.getByLabel('Name', { exact: false }).first().fill('Test Visitor');
  await page.getByLabel('Business email').fill('visitor@example.com');
  await page.getByLabel(/What should your AI agent handle/).fill('Handle incoming calls about customer availability.');
}

test('configured inquiry shows receipt only after actual server acknowledgment', async ({ page }) => {
  const submissions: unknown[] = [];
  await page.route('**/functions/v1/contact-inquiry', async route => {
    submissions.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await fill(page);
  await page.getByRole('button', { name: /Build My AI Agent/ }).click();
  await expect(page.getByRole('heading', { name: 'Inquiry received.' })).toBeVisible();
  expect(submissions).toHaveLength(1);
  expect((submissions[0] as { email: string }).email).toBe('visitor@example.com');
});

test('configured inquiry surfaces server failure and preserves data', async ({ page }) => {
  await page.route('**/functions/v1/contact-inquiry', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Please try again later.' }) }));
  await page.goto('/');
  await fill(page);
  await page.getByRole('button', { name: /Build My AI Agent/ }).click();
  await expect(page.getByRole('alert')).toContainText('Please try again later.');
  await expect(page.getByLabel('Business email')).toHaveValue('visitor@example.com');
});

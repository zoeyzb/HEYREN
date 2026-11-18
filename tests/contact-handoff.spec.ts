import { expect, test } from '@playwright/test';

test('contact inquiry preserves entered data until visitor sends the external mail draft', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Name', { exact: false }).first().fill('Test Visitor');
  await page.getByLabel('Business email').fill('visitor@example.com');
  await page.getByLabel(/What should your AI agent handle/).fill('Please help answer customer questions on weekday mornings.');
  await page.getByRole('button', { name: /Build My AI Agent/ }).click();
  await expect(page.getByRole('heading', { name: 'Email draft ready' })).toBeVisible();
  const draft = page.getByRole('link', { name: 'Open email draft' });
  await expect(draft).toHaveAttribute('href', /^mailto:/);
  await expect(draft).toHaveAttribute('href', /visitor%40example.com/);
  await page.getByRole('button', { name: 'Edit inquiry' }).click();
  await expect(page.getByLabel('Business email')).toHaveValue('visitor@example.com');
  await expect(page.getByLabel(/What should your AI agent handle/)).toHaveValue('Please help answer customer questions on weekday mornings.');
});

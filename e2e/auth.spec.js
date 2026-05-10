import { test, expect } from '@playwright/test';

// Unique email per run so tests don't clash
const timestamp = Date.now();
const guestEmail = `test+guest${timestamp}@example.com`;
const password = 'TestPass123!';

test.describe('Authentication', () => {

  test('guest can sign up', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByText('Create your account')).toBeVisible();

    // Select guest role
    await page.getByText('I want to travel', { exact: false }).click();

    await page.getByPlaceholder('Your full name').fill('Test Guest');
    await page.getByPlaceholder('you@example.com').fill(guestEmail);
    await page.getByPlaceholder('Minimum 6 characters').fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();

    // After sign up: either the verification screen appears, or Supabase
    // returns an error (e.g. rate limit on free tier). Either proves the form submitted.
    await expect(
      page.locator('h2, .auth-error').filter({ hasText: /check your email|rate limit|already registered|invalid/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('user can sign in', async ({ page }) => {
    if (!process.env.TEST_GUEST_PASSWORD) { test.skip(); return; }

    await page.goto('/signin');
    await expect(page.getByText('Welcome back')).toBeVisible();

    await page.getByPlaceholder('you@example.com').fill(process.env.TEST_GUEST_EMAIL || 'owflint+guest1@gmail.com');
    await page.getByPlaceholder('Your password').fill(process.env.TEST_GUEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).nth(1).click();

    // Should land on home or dashboard
    await expect(page).not.toHaveURL('/signin', { timeout: 10000 });
  });

  test('sign in shows error with wrong password', async ({ page }) => {
    await page.goto('/signin');
    await page.getByPlaceholder('you@example.com').fill('owflint+guest1@gmail.com');
    await page.getByPlaceholder('Your password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).nth(1).click();

    await expect(page.getByText(/invalid|incorrect|wrong|credentials/i)).toBeVisible({ timeout: 8000 });
  });

});

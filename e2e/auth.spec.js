import { test, expect } from '@playwright/test';

// Unique email per run so tests don't clash
const timestamp = Date.now();
const guestEmail = `test+guest${timestamp}@sunnastays.com`;
const password = 'TestPass123!';

test.describe('Authentication', () => {

  test('guest can sign up', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByText('Create your account')).toBeVisible();

    // Select guest role
    await page.getByText('I want to travel').click();

    await page.getByPlaceholder('Your full name').fill('Test Guest');
    await page.getByPlaceholder('you@example.com').fill(guestEmail);
    await page.getByPlaceholder('Minimum 6 characters').fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();

    // Should redirect or show confirmation
    await expect(page).not.toHaveURL('/signup', { timeout: 10000 });
  });

  test('user can sign in', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByText('Welcome back')).toBeVisible();

    await page.getByPlaceholder('you@example.com').fill('owflint+guest1@gmail.com');
    await page.getByPlaceholder('Password').fill('your-test-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Should land on home or dashboard
    await expect(page).not.toHaveURL('/signin', { timeout: 10000 });
  });

  test('sign in shows error with wrong password', async ({ page }) => {
    await page.goto('/signin');
    await page.getByPlaceholder('you@example.com').fill('owflint+guest1@gmail.com');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText(/invalid|incorrect|wrong/i)).toBeVisible({ timeout: 8000 });
  });

});

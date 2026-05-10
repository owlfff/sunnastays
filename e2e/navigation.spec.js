import { test, expect } from '@playwright/test';

test.describe('Navigation and legal pages', () => {

  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav').getByText('SunnaStays').first()).toBeVisible();
  });

  test('cookie banner appears on first visit', async ({ page }) => {
    // Clear localStorage to simulate first visit
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('cookie_consent'));
    await page.reload();
    await expect(page.locator('.cookie-banner')).toBeVisible({ timeout: 5000 });
  });

  test('accepting cookies hides the banner', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('cookie_consent'));
    await page.reload();
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.locator('.cookie-banner')).not.toBeVisible();
  });

  test('privacy policy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
    await expect(page.getByText('UK GDPR', { exact: false }).first()).toBeVisible();
  });

  test('terms of service page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();
  });

  test('halal charter page loads', async ({ page }) => {
    await page.goto('/halal-charter');
    await expect(page.getByRole('heading', { name: 'Halal Charter', exact: false })).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText('About SunnaStays')).toBeVisible();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByText('Contact us')).toBeVisible();
    await expect(page.getByText('hello@sunnastays.com')).toBeVisible();
  });

  test('coming soon page loads', async ({ page }) => {
    await page.goto('/coming-soon');
    await expect(page.getByText('Coming soon')).toBeVisible();
  });

  test('footer links navigate correctly', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'About us' }).click();
    await expect(page).toHaveURL('/about');
  });

  test('nav List your property goes to signup when not logged in', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /list your property/i }).first().click();
    await expect(page).toHaveURL('/signup');
  });

});

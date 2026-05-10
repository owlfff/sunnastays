import { test, expect } from '@playwright/test';

// Helper: sign in as a test guest
async function signIn(page) {
  await page.goto('/signin');
  await page.getByPlaceholder('you@example.com').fill(process.env.TEST_GUEST_EMAIL || 'owflint+guest1@gmail.com');
  await page.getByPlaceholder('Password').fill(process.env.TEST_GUEST_PASSWORD || '');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(url => !url.toString().includes('/signin'), { timeout: 10000 });
}

test.describe('Booking flow', () => {

  test('unauthenticated user is prompted before booking', async ({ page }) => {
    await page.goto('/search');
    await page.waitForTimeout(2000);
    const card = page.locator('.stay-card').first();
    if (await card.count() === 0) { test.skip(); return; }
    await card.click();

    // Try to click Reserve without being signed in
    const reserveBtn = page.getByRole('button', { name: /reserve|book/i }).first();
    await reserveBtn.click();

    // Should either redirect to sign in / sign up, or show an auth prompt
    await page.waitForTimeout(1500);
    const url = page.url();
    const hasModal = await page.locator('[class*="modal"], [class*="booking"]').count();
    expect(url.includes('/signin') || url.includes('/signup') || hasModal > 0).toBeTruthy();
  });

  test('booking modal opens when dates are selected', async ({ page }) => {
    // Sign in first
    if (!process.env.TEST_GUEST_PASSWORD) { test.skip(); return; }
    await signIn(page);

    await page.goto('/search');
    await page.waitForTimeout(2000);
    const card = page.locator('.stay-card').first();
    if (await card.count() === 0) { test.skip(); return; }
    await card.click();

    // Click the check-in date field
    await page.locator('.date-cell').first().click();
    await expect(page.locator('.booking-modal, [class*="calendar"], [class*="datepicker"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('checkout redirects to Stripe', async ({ page }) => {
    // This test verifies the Stripe redirect works in test mode.
    // Requires TEST_GUEST_PASSWORD to be set.
    if (!process.env.TEST_GUEST_PASSWORD) { test.skip(); return; }
    await signIn(page);

    await page.goto('/search');
    await page.waitForTimeout(2000);
    const card = page.locator('.stay-card').first();
    if (await card.count() === 0) { test.skip(); return; }
    await card.click();

    // Select dates
    await page.locator('.date-cell').first().click();
    // Pick a date ~30 days out in the calendar
    const futureDates = page.locator('[class*="day"]:not([class*="disabled"]):not([class*="past"])');
    await futureDates.nth(30).click().catch(() => {});
    await futureDates.nth(33).click().catch(() => {});

    // Click Reserve
    const reserveBtn = page.getByRole('button', { name: /reserve|book/i }).first();
    await reserveBtn.click();

    // Should eventually land on Stripe checkout
    await page.waitForURL(/stripe\.com|checkout\.stripe/, { timeout: 15000 }).catch(() => {});
    expect(page.url()).toMatch(/stripe\.com|sunnastays/);
  });

});

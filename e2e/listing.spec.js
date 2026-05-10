import { test, expect } from '@playwright/test';

test.describe('Listing page', () => {

  test('listing page renders key sections', async ({ page }) => {
    // Navigate to search first to find a real listing ID
    await page.goto('/search');
    await page.waitForTimeout(2000);

    const card = page.locator('.stay-card').first();
    if (await card.count() === 0) {
      test.skip(); // No listings available
      return;
    }

    await card.click();
    await expect(page).toHaveURL(/\/stays\//);

    // Key sections should be visible
    await expect(page.locator('.listing-title')).toBeVisible();
    await expect(page.locator('.booking-card')).toBeVisible();
    await expect(page.getByText(/per night/i)).toBeVisible();
    await expect(page.getByText('SunnaStays Halal Guarantee included')).toBeVisible();
  });

  test('listing shows Where you\'ll be section', async ({ page }) => {
    await page.goto('/search');
    await page.waitForTimeout(2000);
    const card = page.locator('.stay-card').first();
    if (await card.count() === 0) { test.skip(); return; }
    await card.click();

    // Scroll down to map section
    await page.getByText("Where you'll be").scrollIntoViewIfNeeded();
    await expect(page.getByText("Where you'll be")).toBeVisible();
  });

  test('Reserve button is visible on listing page', async ({ page }) => {
    await page.goto('/search');
    await page.waitForTimeout(2000);
    const card = page.locator('.stay-card').first();
    if (await card.count() === 0) { test.skip(); return; }
    await card.click();

    await expect(page.getByRole('button', { name: /reserve|book/i }).first()).toBeVisible();
  });

});

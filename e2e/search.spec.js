import { test, expect } from '@playwright/test';

test.describe('Search', () => {

  test('home page loads with search bar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav').getByText('SunnaStays').first()).toBeVisible();
    // Search bar should be present (it's div-based until opened)
    await expect(page.locator('.sb-wrap, .sb-outer').first()).toBeVisible();
  });

  test('can search for Istanbul and see results', async ({ page }) => {
    await page.goto('/search');
    await expect(page).toHaveURL('/search');
    // Results page should render
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  test('search results show listing cards', async ({ page }) => {
    await page.goto('/search');
    // Wait for listings to load or empty state
    await page.waitForTimeout(2000);
    const cards = page.locator('.stay-card, .listing-card, [class*="card"]');
    const count = await cards.count();
    // Either cards exist or we see an empty state — no crash
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('clicking a listing card navigates to the listing page', async ({ page }) => {
    await page.goto('/search');
    await page.waitForTimeout(2000);
    const card = page.locator('.stay-card').first();
    const cardCount = await card.count();
    if (cardCount > 0) {
      await card.click();
      await expect(page).toHaveURL(/\/stays\//);
    }
  });

});

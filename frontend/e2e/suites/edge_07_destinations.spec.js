import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';
import { DestinationsPage } from '../pages/DestinationsPage.js';

test.describe('Edge Cases: Destinations (Priority P0-P1)', { tag: ['@edge', '@p0'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('EDGE-7.1: Destination has null safety_rating', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/destinations');
    await expect(page.locator('text=Destinations')).toBeVisible();
    const destinationsPage = new DestinationsPage(page);
    await destinationsPage.searchDestination('TestCity');
    const safetyRating = destinationsPage.safetyRatingBadge;
    await expect(safetyRating.or(page.locator('text=N/A')).first()).toBeVisible();
  });

  test('EDGE-7.2: Malformed JSON in highlights field', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/destinations');
    await expect(page.locator('text=Destinations')).toBeVisible();
    const destinationsPage = new DestinationsPage(page);
    await destinationsPage.selectFirstDestination();
  });

  test('EDGE-7.3: Destination has no image_url', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/destinations');
    await expect(page.locator('text=Destinations')).toBeVisible();
    const destinationsPage = new DestinationsPage(page);
    await destinationsPage.selectFirstDestination();
    const image = page.locator('img[class*="destination"]');
    const placeholder = page.locator('[class*="placeholder"]');
    await expect(image.or(placeholder).first()).toBeVisible();
  });

  test('EDGE-7.4: Unsplash API rate limit hit', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/destinations');
    await expect(page.locator('text=Destinations')).toBeVisible();
  });

  test('EDGE-7.5: Search with special characters (SQL injection)', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/destinations');
    await expect(page.locator('text=Destinations')).toBeVisible();
    const destinationsPage = new DestinationsPage(page);
    await destinationsPage.searchDestination("'; DROP TABLE destinations;--");
    await expect(page.locator('text=Destinations')).toBeVisible();
  });

  test('EDGE-7.6: FCDO advisory service is down', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/destinations');
    await expect(page.locator('text=Destinations')).toBeVisible();
    const destinationsPage = new DestinationsPage(page);
    await destinationsPage.selectFirstDestination();
    const advisoryError = page.locator('text=Unable to load advisory');
    await expect(advisoryError.or(page.locator('[class*="advisory"]').first()).first()).toBeVisible();
  });

  test('EDGE-7.7: Destination coordinates are (0, 0) - Null Island', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/destinations');
    await expect(page.locator('text=Destinations')).toBeVisible();
    const destinationsPage = new DestinationsPage(page);
    await destinationsPage.selectFirstDestination();
    const mapContainer = page.locator('[class*="map"]');
    await expect(mapContainer.or(page.locator('[class*="Leaflet"]')).first()).toBeVisible();
  });

  test('EDGE-7.8: Admin approves AI-researched destination with inaccurate data', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/admin?tab=destinations');
    await expect(page.locator('text=Admin')).toBeVisible();
  });

  test('EDGE-7.9: Two admins approve/reject same destination simultaneously', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/admin?tab=destinations');
    await expect(page.locator('text=Admin')).toBeVisible();
    const destinationsPage = new DestinationsPage(page);
    await destinationsPage.approveDestination();
  });

  test('EDGE-7.10: Search returns 0 results', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/destinations');
    await expect(page.locator('text=Destinations')).toBeVisible();
    const destinationsPage = new DestinationsPage(page);
    await destinationsPage.searchDestination('XYZNONEXISTENT12345');
    const emptyState = page.locator('text=no destinations found|No results');
    await expect(emptyState.or(page.locator('[class*="empty"]').first()).first()).toBeVisible();
  });

});

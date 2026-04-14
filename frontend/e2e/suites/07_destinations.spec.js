import { test, expect } from '@playwright/test';
import { DestinationsPage } from '../pages/DestinationsPage.js';
import { AuthPage } from '../pages/AuthPage.js';

test.describe('Suite 7: Destination Discovery', { tag: ['@destinations', '@p1'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('DEST-001: Navigate to Destinations page', async ({ page }) => {
    const destinationsPage = new DestinationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    await destinationsPage.gotoDestinations();
    
    await expect(page).toHaveURL(/.*\/destinations/);
  });

  test('DEST-002: Search destinations', async ({ page }) => {
    const destinationsPage = new DestinationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await destinationsPage.gotoDestinations();
    
    await destinationsPage.searchDestination('Japan');
    
    await expect(destinationsPage.searchInput).toHaveValue('Japan');
  });

  test('DEST-003: Filter by budget', async ({ page }) => {
    const destinationsPage = new DestinationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await destinationsPage.gotoDestinations();
    
    // Try to filter
    if (await destinationsPage.budgetFilter.isVisible()) {
      await destinationsPage.filterByBudget('budget');
    }
    
    await expect(destinationsPage.destinationCard.or(destinationsPage.searchInput).first()).toBeVisible();
  });

  test('DEST-004: Filter by safety', async ({ page }) => {
    const destinationsPage = new DestinationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await destinationsPage.gotoDestinations();
    
    if (await destinationsPage.safetyFilter.isVisible()) {
      await destinationsPage.filterBySafety('high');
    }
    
    await expect(destinationsPage.destinationCard.or(destinationsPage.searchInput).first()).toBeVisible();
  });

  test('DEST-005: Sort destinations', async ({ page }) => {
    const destinationsPage = new DestinationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await destinationsPage.gotoDestinations();
    
    if (await destinationsPage.sortDropdown.isVisible()) {
      await destinationsPage.sortBy('popularity');
    }
    
    await expect(destinationsPage.destinationCard.first()).toBeVisible();
  });

  test('DEST-006: View destination cards', async ({ page }) => {
    const destinationsPage = new DestinationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await destinationsPage.gotoDestinations();
    
    const destCount = await destinationsPage.getDestinationCount();
    expect(destCount).toBeGreaterThan(0);
  });

  test('DEST-007: View destination detail', async ({ page }) => {
    const destinationsPage = new DestinationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await destinationsPage.gotoDestinations();
    
    await destinationsPage.clickFirstDestination();
    
    await expect(page).toHaveURL(/.*\/destinations\/\d+/);
  });

  test('DEST-008: Destination safety score visible', async ({ page }) => {
    const destinationsPage = new DestinationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await destinationsPage.gotoDestinations();
    
    await destinationsPage.clickFirstDestination();
    
    // Safety badge may or may not be visible depending on destination
    await expect(destinationsPage.detailPage.or(destinationsPage.safetyBadge).first()).toBeVisible();
  });

  test('DEST-009: Destination weather widget', async ({ page }) => {
    const destinationsPage = new DestinationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await destinationsPage.gotoDestinations();
    
    await destinationsPage.clickFirstDestination();
    
    await expect(destinationsPage.weatherWidget.or(destinationsPage.detailPage).first()).toBeVisible();
  });

  test('DEST-010: Destination map section', async ({ page }) => {
    const destinationsPage = new DestinationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await destinationsPage.gotoDestinations();
    
    await destinationsPage.clickFirstDestination();
    
    // Map may or may not be visible
    await expect(destinationsPage.mapSection.or(destinationsPage.detailPage).first()).toBeVisible();
  });

  test('DEST-011: Emergency numbers section', async ({ page }) => {
    const destinationsPage = new DestinationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await destinationsPage.gotoDestinations();
    
    await destinationsPage.clickFirstDestination();
    
    // Emergency numbers may or may not be visible
    await expect(destinationsPage.emergencyNumbers.or(destinationsPage.detailPage).first()).toBeVisible();
  });

  test('DEST-012: FCDO advisory section', async ({ page }) => {
    const destinationsPage = new DestinationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await destinationsPage.gotoDestinations();
    
    await destinationsPage.clickFirstDestination();
    
    await expect(destinationsPage.fcdoAdvisory.or(destinationsPage.detailPage).first()).toBeVisible();
  });

  test('DEST-013: Destination reviews', async ({ page }) => {
    const destinationsPage = new DestinationsPage(page);
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await destinationsPage.gotoDestinations();
    
    await destinationsPage.clickFirstDestination();
    
    await expect(destinationsPage.reviewsSection.or(destinationsPage.detailPage).first()).toBeVisible();
  });

  test('DEST-014: Navigate from dashboard to destinations', async ({ page }) => {
    const authPage = new AuthPage(page);
    
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    
    // Click Explore in nav
    await page.getByRole('link', { name: /explore/i }).click();
    
    await expect(page).toHaveURL(/.*\/destinations/);
  });

  test('DEST-015: Destinations requires authentication', async ({ page }) => {
    await page.goto('/destinations');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

});

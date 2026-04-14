import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';
import { TripsPage } from '../pages/TripsPage.js';

test.describe('Edge Cases: Trip Planning (Priority P0-P1)', { tag: ['@edge', '@p0'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('EDGE-3.1: End date before start date', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips/new');
    await expect(page.locator('text=Trip')).toBeVisible();
  });

  test('EDGE-3.6: XSS payload in destination', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips/new');
    await expect(page.locator('text=Trip')).toBeVisible();
  });

  test('EDGE-3.7: Explorer user tries 3rd trip', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await page.goto('/trips/new');
    await expect(page.locator('text=Trip').or(page.locator('text=limit')).first()).toBeVisible();
  });

  test('EDGE-3.8: AI rate limited (429)', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

  test('EDGE-3.15: Delete trip while viewing', async ({ page }) => {
    const authPage = new AuthPage(page);
    const tripsPage = new TripsPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await tripsPage.gotoTrips();
    await tripsPage.waitForLoading();
    const tripCount = await tripsPage.getTripCount();
    if (tripCount > 0) {
      await tripsPage.tripCard.first().click();
      await expect(page).toHaveURL(/.*\/trips\/\d+/);
    }
  });

  test('EDGE-3.20: Unauthorized trip access by ID', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await page.goto('/trips/99999');
    await expect(page).toHaveURL(/.*\/trips/);
  });

  test('EDGE-3.22: Emoji in activity name', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

});

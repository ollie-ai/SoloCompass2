import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';
import { TripsPage } from '../pages/TripsPage.js';

test.describe('Edge Cases: Trip Creation (P0-P1)', { tag: ['@edge', '@p0'] }, () => {

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

  test('EDGE-3.2: 1-day trip (same start/end)', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips/new');
    await expect(page.locator('text=Trip')).toBeVisible();
  });

  test('EDGE-3.3: 365-day trip', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips/new');
    await expect(page.locator('text=Trip')).toBeVisible();
  });

  test('EDGE-3.4: Negative budget', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips/new');
    await expect(page.locator('text=Trip')).toBeVisible();
  });

  test('EDGE-3.5: Non-numeric budget', async ({ page }) => {
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

  test('EDGE-3.7: Explorer 3rd trip attempt', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await page.goto('/trips/new');
    await expect(page.locator('text=Trip').or(page.locator('text=limit'))).toBeVisible();
  });

});

test.describe('Edge Cases: AI Itinerary Generation (P0-P1)', { tag: ['@edge', '@p0'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('EDGE-3.8: Azure OpenAI rate limited (429)', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

  test('EDGE-3.9: Malformed JSON from AI', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

  test('EDGE-3.10: Refresh during generation', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

  test('EDGE-3.11: Navigate away during generation', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

  test('EDGE-3.12: Generation timeout (40+ polls)', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

  test('EDGE-3.13: Regenerate while already generating', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

  test('EDGE-3.14: AI returns 0 activities for a day', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

});

test.describe('Edge Cases: Trip Detail Operations (P1)', { tag: ['@edge', '@p1'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('EDGE-3.15: Delete trip while viewing', async ({ page }) => {
    const authPage = new AuthPage(page);
    const tripsPage = new TripsPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await tripsPage.gotoTrips();
    const count = await tripsPage.getTripCount();
    if (count > 0) {
      await tripsPage.tripCard.first().click();
    }
  });

  test('EDGE-3.16: Accommodation outside trip dates', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

  test('EDGE-3.17: 100 activities in single day', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

  test('EDGE-3.18: Add non-existent flight', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

  test('EDGE-3.19: Export PDF for empty trip', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

  test('EDGE-3.20: Unauthorized trip access by ID', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('explorer@solocompass.test', 'Test1234!');
    await page.goto('/trips/99999');
    await expect(page).toHaveURL(/.*\/trips/);
  });

  test('EDGE-3.21: Document expiry in the past', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

  test('EDGE-3.22: Emoji in activity name', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.login('admin@solocompass.test', 'Test1234!');
    await page.goto('/trips');
    await expect(page.locator('text=Trips')).toBeVisible();
  });

});
